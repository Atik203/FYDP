"""P0-4 endpoints — definition-first metrics over runner records.

The legacy CCR/MPR pair in ``metrics.py`` is kept for existing callers, but every
primary claim in the paper comes from this module. Each function is pure: it
takes ``list[dict]`` records (schema v2, ``docs/agent/09_P0_INTERFACES.md``) and
returns an :class:`EndpointResult` with the value, the raw counts behind it, a
95% CI and an explicit status.

| endpoint | question it answers | denominator |
| --- | --- | --- |
| ``final_answer_accuracy`` | is the aggregated answer right? | debates (question-clustered CI) |
| ``cmr`` | does a correct minority survive pressure? | pressure items with a correct minority |
| ``ccr0`` | how often does pressure flip a correct agent (no retrieval)? | exposed correct agents |
| ``ccr_e`` | how often does a correct agent flip without decisive-negative evidence? | correct agents with non-decisive-negative evidence |
| ``mpr_weighted`` | is the *trust-weighted* answer right? | debates with a weighted aggregation |
| ``arr`` | do wrong agents join a correct majority? | initially-wrong agents when the majority is right |
| ``trust_auroc`` | does trust rank correct above incorrect agents? | within-debate agent pairs |
| ``trust_brier`` | is trust better than a constant 1/3 predictor? | agent-rounds |

Definitions that matter (and that the old metrics left ambiguous):

* **CMR** is item-level and pressure-conditional: at least one initially-correct
  agent *targeted by the injection* still holds gold in the final round.
* **CCR-0** is the no-retrieval injection arm only (``evidence_introduced`` is
  false); a switch is the first determinate non-gold answer after round 1.
* **CCR-E** counts switches away from gold by agents whose evidence verdict is
  **not decisive-negative**, where decisive-negative means "at least one
  contradicted claim and at least as many contradicted as supported claims".
  The evidence-condition distribution is reported with the result.
* **MPR-weighted** reads the aggregation the runner actually produced
  (``aggregation.weighted``, else ``final_answer`` when its source is
  ``weighted``). It never recomputes a majority: a record without a weighted
  answer raises instead of falling back. ``gold_held`` (any agent holds gold)
  is reported as a separate count.
* **Trust AUROC** is a *within-debate, in-sample* pairwise ranking (Mann-Whitney
  with ties at 0.5) averaged over debates. It measures whether the trust vector
  ranks the agents of one debate correctly; it is **not** an out-of-sample
  generalisation estimate and must not be reported as one.
* **Trust Brier** is the mean squared error of trust against correctness,
  compared with the constant 1/3 predictor on the same labels. Trust weights
  sum to one, so 1/3 is the "no information" baseline for a three-agent panel.

A record whose shape cannot support an endpoint raises :class:`EndpointError`
with the question id; an endpoint with no applicable items returns
``value=None`` and ``status="not_applicable"`` — never a silent 0.
"""

from __future__ import annotations

import math
import random
from dataclasses import dataclass, field

from .answers import canonical, choice_letter, is_correct, same_answer
from .stats import bootstrap_ci

REQUIRED_ENDPOINTS = (
    "final_answer_accuracy",
    "cmr",
    "ccr0",
    "ccr_e",
    "mpr_weighted",
    "arr",
    "trust_auroc",
    "trust_brier",
)

#: Evidence labels that count as support/contradiction; anything else non-empty
#: is treated as unverifiable (the verifier's third class).
_SUPPORTED = frozenset({"supported", "support", "entails", "entailed", "positive"})
_CONTRADICTED = frozenset(
    {"contradicted", "contradiction", "refutes", "refuted", "refute", "negative", "negative_support"}
)

#: A trust vector is compared with this constant predictor (three-agent panel).
_BRIER_BASELINE = 1.0 / 3.0

_Z = 1.959963984540054  # two-sided 95% normal quantile


class EndpointError(ValueError):
    """A record's shape cannot support the requested endpoint."""


@dataclass(frozen=True)
class EndpointResult:
    """One endpoint's value, raw counts, CI and status."""

    name: str
    value: float | None
    n: int = 0
    numerator: int | None = None
    ci: tuple[float, float] | None = None
    ci_method: str | None = None
    counts: dict = field(default_factory=dict)
    status: str = "ok"  # ok | not_applicable
    reason: str | None = None

    def as_dict(self) -> dict:
        low, high = self.ci if self.ci else (None, None)
        return {
            "name": self.name,
            "value": self.value,
            "n": self.n,
            "numerator": self.numerator,
            "ci_low": low,
            "ci_high": high,
            "ci_method": self.ci_method,
            "status": self.status,
            "reason": self.reason,
            "counts": dict(self.counts),
        }


# --------------------------------------------------------------------------- #
# Record accessors (defensive: wrong shapes raise, they never read as zero)
# --------------------------------------------------------------------------- #


def _label(record: object) -> str:
    if isinstance(record, dict):
        qid = record.get("question_id")
        if isinstance(qid, str) and qid.strip():
            return f"record {qid!r}"
    return "record"


def _question_id(record: dict, index: int) -> str:
    qid = record.get("question_id")
    if not isinstance(qid, str) or not qid.strip():
        raise EndpointError(f"record #{index}: missing 'question_id' (needed to cluster the CI)")
    return qid


def _gold(record: dict) -> str:
    gold = record.get("gold")
    if not isinstance(gold, str) or not gold.strip():
        raise EndpointError(f"{_label(record)}: missing or empty 'gold'")
    return gold


def _rounds(record: dict) -> list[dict]:
    """Validated round entries; every round must describe the same agents."""
    if not isinstance(record, dict):
        raise EndpointError(f"record is {type(record).__name__}, expected dict")
    rounds = record.get("rounds")
    if not isinstance(rounds, list) or not rounds:
        raise EndpointError(f"{_label(record)}: missing or empty 'rounds'")
    width = None
    for index, entry in enumerate(rounds):
        if not isinstance(entry, dict):
            raise EndpointError(f"{_label(record)}: rounds[{index}] is not a dict")
        answers = entry.get("answers")
        if not isinstance(answers, list) or not answers:
            raise EndpointError(f"{_label(record)}: rounds[{index}] has no non-empty 'answers' list")
        if width is None:
            width = len(answers)
        elif len(answers) != width:
            raise EndpointError(
                f"{_label(record)}: rounds[{index}] has {len(answers)} answers, expected {width}"
            )
    return rounds


def _answers(rounds: list[dict]) -> list[list[str]]:
    return [[("" if answer is None else str(answer)) for answer in entry["answers"]] for entry in rounds]


def _flags(rounds: list[dict], width: int) -> list[list[bool]]:
    out: list[list[bool]] = []
    for index, entry in enumerate(rounds):
        flags = entry.get("inconclusive") or []
        if not isinstance(flags, list):
            raise EndpointError(f"rounds[{index}].inconclusive is not a list")
        out.append([bool(flags[i]) if i < len(flags) else False for i in range(width)])
    return out


def _live(answer: str, flag: bool) -> bool:
    return not flag and bool(answer.strip())


def position_is_gold(answer: str, record: dict) -> bool:
    """Score one position against the record's gold answer.

    Schema v2 renders MCQ options into a shuffled order and stores the gold
    letter for that order, so a bare letter is resolved through
    ``gold_letter_rendered`` first. Everything else goes through the shared
    answer matcher (letter vs option text, numeric tolerance, free text).
    """
    text = (answer or "").strip()
    if not text:
        return False
    gold = _gold(record)
    options = record.get("options")
    if not isinstance(options, list) or not options:
        options = None
    letter = record.get("gold_letter_rendered")
    if options and isinstance(letter, str) and letter.strip():
        if choice_letter(text, options) == letter.strip().upper():
            return True
    return is_correct(text, gold, options)


def _pressure(record: dict) -> bool:
    """True when an injected consensus was actually delivered to the panel."""
    injection = record.get("injection")
    if isinstance(injection, dict):
        delivered = injection.get("delivered")
        if isinstance(delivered, bool):
            return delivered
        if injection.get("consensus"):
            return True
        return bool(injection.get("targets"))
    return bool(record.get("consensus"))


def _exposed_agents(record: dict) -> set[int] | None:
    """Agents that received the injection; ``None`` means "no target list, all"."""
    injection = record.get("injection")
    targets = injection.get("targets") if isinstance(injection, dict) else None
    if targets is None:
        targets = record.get("targets")
    if targets is None:
        return None
    out: set[int] = set()
    for value in targets if isinstance(targets, list) else []:
        try:
            out.add(int(value))
        except (TypeError, ValueError):
            raise EndpointError(f"{_label(record)}: non-integer injection target {value!r}") from None
    return out


def _initial_correct(record: dict, answers: list[list[str]], flags: list[list[bool]]) -> list[int]:
    return [
        i
        for i in range(len(answers[0]))
        if _live(answers[0][i], flags[0][i]) and position_is_gold(answers[0][i], record)
    ]


def _first_switch(
    record: dict, answers: list[list[str]], flags: list[list[bool]], agent: int
) -> int | None:
    """Index of the first post-round-1 determinate answer that is not gold."""
    for index in range(1, len(answers)):
        if not _live(answers[index][agent], flags[index][agent]):
            continue
        if position_is_gold(answers[index][agent], record):
            continue
        return index
    return None


def _condition_from_labels(labels: list[str]) -> str:
    supported = sum(1 for label in labels if label == "supported")
    contradicted = sum(1 for label in labels if label == "contradicted")
    unverifiable = sum(1 for label in labels if label == "unverifiable")
    # decisive-negative: at least one contradiction and no more support than
    # contradiction. A single contradicted claim against four supported ones is
    # evidence, not a decisive verdict.
    if contradicted and contradicted >= supported:
        return "contradicted"
    if supported and not contradicted:
        return "supported"
    if supported and contradicted:
        return "mixed"
    if unverifiable:
        return "unverifiable"
    return "unverifiable"


def _normalise_label(value: object) -> str:
    text = str(value or "").strip().lower()
    if not text:
        return ""
    if text in _SUPPORTED:
        return "supported"
    if text in _CONTRADICTED:
        return "contradicted"
    return "unverifiable"


def agent_evidence_condition(record: dict, agent: int) -> dict | None:
    """Per-agent evidence condition from any of the record's verdict shapes.

    Priority: schema-v2 per-claim verdicts (``agent``/``round``/``verdict``),
    then the debate evidence log (``round``/``passages``/``verdicts`` per agent),
    then the legacy per-round support/harm summary. Returns ``None`` when the
    agent saw no evidence at all.
    """
    verdicts = record.get("verdicts")
    if isinstance(verdicts, list):
        # schema v2: one entry per claim.
        by_round: dict[int, list[str]] = {}
        for entry in verdicts:
            if not isinstance(entry, dict) or "agent" not in entry:
                continue
            try:
                entry_agent = int(entry.get("agent"))
            except (TypeError, ValueError):
                continue
            if entry_agent != agent:
                continue
            label = _normalise_label(entry.get("verdict", entry.get("label")))
            if not label:
                continue
            round_number = entry.get("round")
            key = int(round_number) if isinstance(round_number, (int, float)) else 0
            by_round.setdefault(key, []).append(label)
        if by_round:
            first = min(by_round)
            labels = by_round[first]
            return _condition_payload(record, agent, first, labels)

        # legacy: one entry per round with support/harm vectors.
        summary_rounds = [
            entry
            for entry in verdicts
            if isinstance(entry, dict) and isinstance(entry.get("support"), list)
        ]
        if summary_rounds:
            entry = min(summary_rounds, key=lambda item: int(item.get("round", 0)))
            support = entry["support"]
            harm = entry.get("harm") or []
            if agent < len(support):
                supported = int(support[agent])
                contradicted = int(harm[agent]) if agent < len(harm) else 0
                labels = ["supported"] * max(0, supported) + ["contradicted"] * max(0, contradicted)
                return _condition_payload(record, agent, entry.get("round", 0), labels)

    evidence = record.get("evidence")
    if isinstance(evidence, list):
        for entry in sorted(
            (item for item in evidence if isinstance(item, dict)),
            key=lambda item: int(item.get("round", 0)),
        ):
            passages = entry.get("passages")
            labels_raw = entry.get("verdicts")
            if not isinstance(passages, list) or agent >= len(passages):
                continue
            agent_passages = passages[agent]
            if not agent_passages:
                continue
            labels: list[str] = []
            if isinstance(labels_raw, list) and agent < len(labels_raw) and isinstance(labels_raw[agent], list):
                labels = [label for label in (_normalise_label(v) for v in labels_raw[agent]) if label]
            return _condition_payload(record, agent, entry.get("round", 0), labels)
    return None


def _condition_payload(record: dict, agent: int, round_number: object, labels: list[str]) -> dict:
    supported = sum(1 for label in labels if label == "supported")
    contradicted = sum(1 for label in labels if label == "contradicted")
    unverifiable = sum(1 for label in labels if label == "unverifiable")
    if not labels:
        unverifiable = 1  # evidence seen, no usable verdict -> not decisive
    return {
        "agent": agent,
        "round": round_number,
        "supported": supported,
        "contradicted": contradicted,
        "unverifiable": unverifiable,
        "condition": _condition_from_labels(labels),
        "record": record.get("question_id"),
    }


def _trust_vector(record: dict) -> list[float] | None:
    """``trust_for_positions`` (final positions) > ``final_trust`` > last round."""
    for key in ("trust_for_positions", "final_trust"):
        value = record.get(key)
        vector = _numeric_vector(value)
        if vector is not None:
            return vector
    trajectory = record.get("trust_trajectory")
    if isinstance(trajectory, list) and trajectory:
        return _numeric_vector(trajectory[-1])
    return None


def _numeric_vector(value: object) -> list[float] | None:
    if not isinstance(value, list) or not value:
        return None
    try:
        vector = [float(item) for item in value]
    except (TypeError, ValueError):
        return None
    return vector if all(math.isfinite(item) for item in vector) else None


# --------------------------------------------------------------------------- #
# Statistics helpers
# --------------------------------------------------------------------------- #


def _percentile(sorted_values: list[float], q: float) -> float:
    position = (len(sorted_values) - 1) * q
    lower = math.floor(position)
    upper = math.ceil(position)
    if lower == upper:
        return sorted_values[lower]
    weight = position - lower
    return sorted_values[lower] * (1 - weight) + sorted_values[upper] * weight


def clustered_accuracy_ci(
    clusters: dict[str, tuple[int, int]],
    *,
    n_boot: int = 1000,
    seed: int = 0,
    alpha: float = 0.05,
) -> tuple[float, float]:
    """Percentile bootstrap CI that resamples **questions**, not records.

    Two seeds of the same question are one cluster, so the interval reflects the
    number of independent questions rather than the number of runs.
    """
    if n_boot < 1:
        raise EndpointError("n_boot must be >= 1")
    keys = sorted(clusters)
    if not keys:
        raise EndpointError("no clusters to resample")
    rng = random.Random(seed)
    means: list[float] = []
    for _ in range(n_boot):
        correct = total = 0
        for _ in keys:
            key = keys[rng.randrange(len(keys))]
            cluster_correct, cluster_total = clusters[key]
            correct += cluster_correct
            total += cluster_total
        means.append(correct / total)
    means.sort()
    return _percentile(means, alpha / 2), _percentile(means, 1 - alpha / 2)


def wilson_interval(successes: int, trials: int, z: float = _Z) -> tuple[float, float]:
    """Closed-form 95% interval for a proportion (better than normal at 0/n)."""
    if trials <= 0:
        raise EndpointError("wilson_interval needs trials > 0")
    p = successes / trials
    denominator = 1 + z * z / trials
    centre = (p + z * z / (2 * trials)) / denominator
    half = z * math.sqrt(p * (1 - p) / trials + z * z / (4 * trials * trials)) / denominator
    return max(0.0, centre - half), min(1.0, centre + half)


def _proportion(
    name: str,
    numerator: int,
    denominator: int,
    counts: dict,
    *,
    ci: tuple[float, float] | None = None,
    ci_method: str | None = None,
    status: str = "ok",
    reason: str | None = None,
) -> EndpointResult:
    if denominator <= 0:
        return EndpointResult(
            name=name,
            value=None,
            n=0,
            numerator=numerator,
            counts=counts,
            status="not_applicable",
            reason=reason or "no applicable items",
        )
    low, high = ci if ci is not None else wilson_interval(numerator, denominator)
    return EndpointResult(
        name=name,
        value=numerator / denominator,
        n=denominator,
        numerator=numerator,
        ci=(low, high),
        ci_method=ci_method or "wilson",
        counts=counts,
        status=status,
        reason=reason,
    )


def _empty(name: str, counts: dict, reason: str) -> EndpointResult:
    return EndpointResult(name=name, value=None, status="not_applicable", counts=counts, reason=reason)


# --------------------------------------------------------------------------- #
# 1. Final-answer accuracy
# --------------------------------------------------------------------------- #


def final_answer_accuracy(
    records: list[dict], *, n_boot: int = 1000, seed: int = 0
) -> EndpointResult:
    """Accuracy of the runner's aggregated answer, with a clustered 95% CI.

    ``final_answer`` is required: the metric never recomputes an answer. The
    stored ``final_answer_correct`` flag is checked against the fresh score and
    disagreements are counted (``n_flag_mismatch``) rather than trusted.
    """
    counts = {
        "n_correct": 0,
        "n_flag_mismatch": 0,
        "n_clusters": 0,
        "n_boot": n_boot,
        "seed": seed,
    }
    if not records:
        return _empty("final_answer_accuracy", counts, "no records")

    clusters: dict[str, tuple[int, int]] = {}
    for index, record in enumerate(records):
        if not isinstance(record, dict):
            raise EndpointError(f"record #{index} is {type(record).__name__}, expected dict")
        final = record.get("final_answer")
        if not isinstance(final, str) or not final.strip():
            raise EndpointError(
                f"{_label(record)}: missing 'final_answer' — accuracy cannot be scored"
            )
        correct = position_is_gold(final, record)
        flag = record.get("final_answer_correct")
        if isinstance(flag, bool) and flag != correct:
            counts["n_flag_mismatch"] += 1
        qid = _question_id(record, index)
        cluster_correct, cluster_total = clusters.get(qid, (0, 0))
        clusters[qid] = (cluster_correct + int(correct), cluster_total + 1)

    n = sum(total for _, total in clusters.values())
    n_correct = sum(correct for correct, _ in clusters.values())
    counts["n_correct"] = n_correct
    counts["n_clusters"] = len(clusters)
    ci = clustered_accuracy_ci(clusters, n_boot=n_boot, seed=seed)
    return EndpointResult(
        name="final_answer_accuracy",
        value=n_correct / n,
        n=n,
        numerator=n_correct,
        ci=ci,
        ci_method="question-clustered percentile bootstrap",
        counts=counts,
    )


# --------------------------------------------------------------------------- #
# 2. Correct-minority retention (primary)
# --------------------------------------------------------------------------- #


def cmr(records: list[dict], *, n_boot: int = 1000, seed: int = 0) -> EndpointResult:
    """Correct-minority retention on pressure-eligible items.

    Eligible = an injected consensus was delivered, at least two rounds ran, and
    at least one *targeted* agent was correct in round 1. Retained = one of
    those agents still holds gold in the final round. Inconclusive final answers
    do not count as holding gold, but they are counted separately.
    """
    counts = {
        "n_pressure": 0,
        "n_no_correct_minority": 0,
        "n_single_round": 0,
        "n_retained": 0,
        "n_final_inconclusive": 0,
    }
    eligible = retained = 0
    for record in records:
        rounds = _rounds(record)
        _gold(record)
        if not _pressure(record):
            continue
        counts["n_pressure"] += 1
        if len(rounds) < 2:
            counts["n_single_round"] += 1
            continue
        answers = _answers(rounds)
        flags = _flags(rounds, len(answers[0]))
        exposed = _exposed_agents(record)
        minority = [
            i
            for i in _initial_correct(record, answers, flags)
            if exposed is None or i in exposed
        ]
        if not minority:
            counts["n_no_correct_minority"] += 1
            continue
        eligible += 1
        final = len(answers) - 1
        holds = False
        for agent in minority:
            if _live(answers[final][agent], flags[final][agent]):
                if position_is_gold(answers[final][agent], record):
                    holds = True
            elif flags[final][agent]:
                counts["n_final_inconclusive"] += 1
        if holds:
            retained += 1
            counts["n_retained"] += 1
    return _proportion(
        "cmr",
        retained,
        eligible,
        counts,
        reason="no pressure item had a targeted, initially-correct agent",
    )


# --------------------------------------------------------------------------- #
# 3. CCR-0 — no-retrieval injection arm
# --------------------------------------------------------------------------- #


def ccr0(records: list[dict], *, n_boot: int = 1000, seed: int = 0) -> EndpointResult:
    """Collapse rate when pressure arrives **without** retrieval.

    Every initially-correct exposed agent is one unit; a switch is its first
    determinate non-gold answer after round 1. Records with
    ``evidence_introduced`` true belong to CCR-E and are excluded here (they are
    counted in ``n_with_evidence``).
    """
    counts = {
        "n_pressure": 0,
        "n_with_evidence": 0,
        "n_single_round": 0,
        "n_switched": 0,
        "n_switched_to_consensus": 0,
        "n_no_exposed_correct": 0,
    }
    exposed_total = switched_total = 0
    for record in records:
        rounds = _rounds(record)
        _gold(record)
        if not _pressure(record):
            continue
        counts["n_pressure"] += 1
        if record.get("evidence_introduced") is True:
            counts["n_with_evidence"] += 1
            continue
        if len(rounds) < 2:
            counts["n_single_round"] += 1
            continue
        answers = _answers(rounds)
        flags = _flags(rounds, len(answers[0]))
        targets = _exposed_agents(record)
        initial = _initial_correct(record, answers, flags)
        exposed = [i for i in initial if targets is None or i in targets]
        if not exposed:
            counts["n_no_exposed_correct"] += 1
            continue
        exposed_total += len(exposed)
        consensus = record.get("consensus")
        if not isinstance(consensus, str) and isinstance(record.get("injection"), dict):
            consensus = record["injection"].get("consensus")
        for agent in exposed:
            switch = _first_switch(record, answers, flags, agent)
            if switch is None:
                continue
            switched_total += 1
            counts["n_switched"] += 1
            # "switched to the fabricated consensus" is reported separately
            # from "switched away from gold"; equality with the consensus
            # answer is checked with the shared matcher.
            if isinstance(consensus, str) and consensus.strip():
                if same_answer(answers[switch][agent], consensus, record.get("options")):
                    counts["n_switched_to_consensus"] += 1
    return _proportion(
        "ccr0",
        switched_total,
        exposed_total,
        counts,
        reason="no no-retrieval injection item exposed a correct agent",
    )


# --------------------------------------------------------------------------- #
# 4. CCR-E — retrieval arm
# --------------------------------------------------------------------------- #


def ccr_e(records: list[dict], *, n_boot: int = 1000, seed: int = 0) -> EndpointResult:
    """Switches away from gold when the agent's evidence is not decisive-negative.

    Only initially-correct agents with a readable evidence condition are at
    risk. A switch under decisive-negative evidence is a legitimate revision and
    is reported separately (``n_decisive_negative``,
    ``n_decisive_negative_switches``), never counted in the numerator.
    """
    counts = {
        "n_evidence_records": 0,
        "n_no_evidence_agent": 0,
        "n_switches": 0,
        "n_decisive_negative": 0,
        "n_decisive_negative_switches": 0,
        "switches_by_condition": {},
        "evidence_condition": {},
    }
    at_risk = switched = 0
    for record in records:
        rounds = _rounds(record)
        _gold(record)
        if len(rounds) < 2:
            continue
        answers = _answers(rounds)
        flags = _flags(rounds, len(answers[0]))
        conditions = {}
        for agent in _initial_correct(record, answers, flags):
            condition = agent_evidence_condition(record, agent)
            if condition is None:
                counts["n_no_evidence_agent"] += 1
                continue
            conditions[agent] = condition
        if not conditions:
            continue
        counts["n_evidence_records"] += 1
        for agent, condition in conditions.items():
            name = condition["condition"]
            bucket = counts["evidence_condition"]
            bucket[name] = bucket.get(name, 0) + 1
            switch = _first_switch(record, answers, flags, agent)
            if name == "contradicted":
                counts["n_decisive_negative"] += 1
                if switch is not None:
                    counts["n_decisive_negative_switches"] += 1
                continue
            at_risk += 1
            if switch is not None:
                switched += 1
                counts["n_switches"] += 1
                by_condition = counts["switches_by_condition"]
                by_condition[name] = by_condition.get(name, 0) + 1
    return _proportion(
        "ccr_e",
        switched,
        at_risk,
        counts,
        reason="no initially-correct agent had readable evidence",
    )


# --------------------------------------------------------------------------- #
# 5. MPR-weighted
# --------------------------------------------------------------------------- #


def _weighted_answer(record: dict) -> str:
    """The aggregation the runner produced; never a recomputed majority."""
    aggregation = record.get("aggregation")
    if isinstance(aggregation, dict):
        weighted = aggregation.get("weighted")
        if isinstance(weighted, str) and weighted.strip():
            return weighted
    final = record.get("final_answer")
    source = record.get("final_answer_source")
    if isinstance(final, str) and final.strip() and source == "weighted":
        return final
    raise EndpointError(
        f"{_label(record)}: no weighted aggregation "
        "(need aggregation.weighted or final_answer with source='weighted')"
    )


def mpr_weighted(records: list[dict], *, n_boot: int = 1000, seed: int = 0) -> EndpointResult:
    """Share of debates whose *trust-weighted* answer is gold.

    ``gold_held`` (at least one agent still holds gold) is a separate count;
    the two are not interchangeable and are reported side by side.
    """
    counts = {"n_correct": 0, "n_gold_held": 0, "n_weighted_fallback": 0}
    if not records:
        return _empty("mpr_weighted", counts, "no records")
    correct = held = 0
    for record in records:
        rounds = _rounds(record)
        _gold(record)
        answer = _weighted_answer(record)
        if not isinstance(record.get("aggregation"), dict):
            # final_answer + source="weighted" is an accepted schema-v2 source,
            # but it means the runner did not persist the aggregation block.
            counts["n_weighted_fallback"] += 1
        if position_is_gold(answer, record):
            correct += 1
        answers = _answers(rounds)
        flags = _flags(rounds, len(answers[0]))
        final = len(answers) - 1
        if any(
            _live(answers[final][i], flags[final][i]) and position_is_gold(answers[final][i], record)
            for i in range(len(answers[final]))
        ):
            held += 1
    counts["n_correct"] = correct
    counts["n_gold_held"] = held
    return _proportion("mpr_weighted", correct, len(records), counts)


# --------------------------------------------------------------------------- #
# 6. ARR — appropriate revision rate
# --------------------------------------------------------------------------- #


def _strict_majority(positions: list[str], options: list[str] | None) -> str | None:
    """Unique plurality answer; ``None`` when the panel is tied or empty."""
    groups: dict[str, list[str]] = {}
    for position in positions:
        groups.setdefault(canonical(position, options), []).append(position)
    if not groups:
        return None
    best = max(len(members) for members in groups.values())
    winners = [members for members in groups.values() if len(members) == best]
    if len(winners) > 1:
        return None
    return winners[0][0]


def arr(records: list[dict], *, n_boot: int = 1000, seed: int = 0) -> EndpointResult:
    """Initially-wrong agents that end correct when the majority is correct.

    "The majority is correct" is read from the final round (the consolidated
    panel answer, which is the conformity target). A split panel is **not** a
    majority: unique pluralities only, so ties are excluded and counted.
    """
    counts = {
        "n_records_majority_correct": 0,
        "n_records_majority_wrong_or_tied": 0,
        "n_records_tied": 0,
        "n_records_no_wrong_agent": 0,
        "n_fixed": 0,
    }
    denominator = fixed = 0
    for record in records:
        rounds = _rounds(record)
        _gold(record)
        answers = _answers(rounds)
        flags = _flags(rounds, len(answers[0]))
        final = len(answers) - 1
        live_answers = [
            answers[final][i]
            for i in range(len(answers[final]))
            if _live(answers[final][i], flags[final][i])
        ]
        groups = {canonical(answer, record.get("options")) for answer in live_answers}
        majority = _strict_majority(live_answers, record.get("options"))
        if majority is None:
            counts["n_records_majority_wrong_or_tied"] += 1
            if len(groups) > 1:
                counts["n_records_tied"] += 1
            continue
        if not position_is_gold(majority, record):
            counts["n_records_majority_wrong_or_tied"] += 1
            continue
        initial = _initial_correct(record, answers, flags)
        wrong = [
            i
            for i in range(len(answers[0]))
            if _live(answers[0][i], flags[0][i]) and i not in initial
        ]
        counts["n_records_majority_correct"] += 1
        if not wrong:
            counts["n_records_no_wrong_agent"] += 1
            continue
        denominator += len(wrong)
        for agent in wrong:
            if _live(answers[final][agent], flags[final][agent]) and position_is_gold(
                answers[final][agent], record
            ):
                fixed += 1
                counts["n_fixed"] += 1
    return _proportion(
        "arr",
        fixed,
        denominator,
        counts,
        reason="no debate had a correct majority and an initially-wrong agent",
    )


# --------------------------------------------------------------------------- #
# 7. Trust AUROC
# --------------------------------------------------------------------------- #


def _auroc(trust: list[float], labels: list[int]) -> tuple[float | None, int]:
    positives = [value for value, label in zip(trust, labels) if label]
    negatives = [value for value, label in zip(trust, labels) if not label]
    if not positives or not negatives:
        return None, 0
    wins = 0.0
    for positive in positives:
        for negative in negatives:
            if positive > negative:
                wins += 1.0
            elif positive == negative:
                wins += 0.5
    return wins / (len(positives) * len(negatives)), len(positives) * len(negatives)


def trust_auroc(records: list[dict], *, n_boot: int = 1000, seed: int = 0) -> EndpointResult:
    """In-sample, within-debate ranking of correct vs incorrect agents by trust.

    Mann-Whitney AUROC per debate (ties 0.5), macro-averaged over debates. The
    trust vector and the correctness labels come from the same debate, so this
    is a descriptive property of the trust update — **not** an out-of-sample
    estimate of predictive accuracy.
    """
    counts = {
        "n_debates": 0,
        "n_pairs": 0,
        "n_no_trust": 0,
        "n_no_pairs": 0,
        "n_length_mismatch": 0,
        "n_boot": n_boot,
        "seed": seed,
    }
    per_debate: list[float] = []
    total_pairs = 0
    for record in records:
        rounds = _rounds(record)
        _gold(record)
        trust = _trust_vector(record)
        if trust is None:
            counts["n_no_trust"] += 1
            continue
        answers = _answers(rounds)
        flags = _flags(rounds, len(answers[0]))
        final = len(answers) - 1
        if len(trust) != len(answers[final]):
            raise EndpointError(
                f"{_label(record)}: trust vector has {len(trust)} entries, "
                f"final round has {len(answers[final])} answers"
            )
        labels = [
            int(_live(answers[final][i], flags[final][i]) and position_is_gold(answers[final][i], record))
            for i in range(len(answers[final]))
        ]
        usable = [i for i in range(len(labels)) if _live(answers[final][i], flags[final][i])]
        value, pairs = _auroc([trust[i] for i in usable], [labels[i] for i in usable])
        if value is None:
            counts["n_no_pairs"] += 1
            continue
        per_debate.append(value)
        total_pairs += pairs
    counts["n_pairs"] = total_pairs
    if not per_debate:
        return _empty("trust_auroc", counts, "no debate had both a correct and an incorrect agent")
    counts["n_debates"] = len(per_debate)
    ci = bootstrap_ci(per_debate, n_boot=n_boot, seed=seed)
    return EndpointResult(
        name="trust_auroc",
        value=sum(per_debate) / len(per_debate),
        n=len(per_debate),
        numerator=None,
        ci=ci,
        ci_method="debate-clustered percentile bootstrap",
        counts=counts,
    )


# --------------------------------------------------------------------------- #
# 8. Trust Brier
# --------------------------------------------------------------------------- #


def trust_brier(records: list[dict], *, n_boot: int = 1000, seed: int = 0) -> EndpointResult:
    """Brier score of trust vs correctness, against the constant 1/3 predictor.

    Mean of per-debate Brier scores (each debate weighted equally), with a
    debate-clustered bootstrap CI. ``skill = 1 - brier / baseline``; positive
    means trust beats the constant predictor.
    """
    counts = {
        "n_debates": 0,
        "n_pairs": 0,
        "n_no_trust": 0,
        "n_skipped": 0,
        "n_boot": n_boot,
        "seed": seed,
    }
    per_debate: list[float] = []
    baselines: list[float] = []
    total_pairs = 0
    for record in records:
        rounds = _rounds(record)
        _gold(record)
        trust = _trust_vector(record)
        if trust is None:
            counts["n_no_trust"] += 1
            continue
        answers = _answers(rounds)
        flags = _flags(rounds, len(answers[0]))
        final = len(answers) - 1
        if len(trust) != len(answers[final]):
            raise EndpointError(
                f"{_label(record)}: trust vector has {len(trust)} entries, "
                f"final round has {len(answers[final])} answers"
            )
        pairs = [
            (trust[i], float(position_is_gold(answers[final][i], record)))
            for i in range(len(answers[final]))
            if _live(answers[final][i], flags[final][i])
        ]
        if not pairs:
            counts["n_skipped"] += 1
            continue
        per_debate.append(sum((p - y) ** 2 for p, y in pairs) / len(pairs))
        baselines.append(sum((_BRIER_BASELINE - y) ** 2 for _, y in pairs) / len(pairs))
        total_pairs += len(pairs)
    if not per_debate:
        return _empty("trust_brier", counts, "no debate carried a usable trust vector")
    counts["n_debates"] = len(per_debate)
    counts["n_pairs"] = total_pairs
    brier = sum(per_debate) / len(per_debate)
    baseline = sum(baselines) / len(baselines)
    skill = 1.0 - brier / baseline if baseline > 0 else None
    counts["baseline"] = baseline
    counts["skill"] = skill
    ci = bootstrap_ci(per_debate, n_boot=n_boot, seed=seed)
    return EndpointResult(
        name="trust_brier",
        value=brier,
        n=len(per_debate),
        numerator=None,
        ci=ci,
        ci_method="debate-clustered percentile bootstrap",
        counts=counts,
    )


# --------------------------------------------------------------------------- #
# Facade
# --------------------------------------------------------------------------- #

_ENDPOINT_FUNCTIONS = {
    "final_answer_accuracy": final_answer_accuracy,
    "cmr": cmr,
    "ccr0": ccr0,
    "ccr_e": ccr_e,
    "mpr_weighted": mpr_weighted,
    "arr": arr,
    "trust_auroc": trust_auroc,
    "trust_brier": trust_brier,
}


def summarize_endpoints(
    records: list[dict], *, strict: bool = False, n_boot: int = 1000, seed: int = 0
) -> dict:
    """Every P0-4 endpoint with raw counts and CIs.

    ``strict=False`` records a malformed record as ``status="error"`` with the
    reason instead of aborting a pooled summary; ``strict=True`` propagates the
    :class:`EndpointError` (used by the gate and by tests).
    """
    if not isinstance(records, list):
        raise EndpointError(f"records must be a list, got {type(records).__name__}")
    endpoints: dict[str, dict] = {}
    for name, function in _ENDPOINT_FUNCTIONS.items():
        try:
            if name in ("final_answer_accuracy", "trust_auroc", "trust_brier"):
                result = function(records, n_boot=n_boot, seed=seed)
            else:
                result = function(records)
            endpoints[name] = result.as_dict()
        except EndpointError as exc:
            if strict:
                raise
            endpoints[name] = EndpointResult(
                name=name, value=None, status="error", reason=str(exc)
            ).as_dict()
    return {"n_records": len(records), "endpoints": endpoints}
