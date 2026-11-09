"""Causal-control interventions for the six-arm Full target (WP-18).

The Full placebo is unit B (``round_pool``): all agents' claim-verdict labels in
one round are pooled and permuted, so per-agent support/harm counts — and
therefore the trust trajectory — can change. Unit A (``agent_round``) remains
available as a manipulation check; it shuffles within one agent and preserves
that agent's verdict multiset.

Both units preserve claim text, passages, verifier scores, evidence ids and
prompts with their claims; only the verdict-to-claim mapping moves. The
permutation is a SHA-256 counter-mode Fisher-Yates draw keyed by the run seed,
question id, round and (for unit A) agent, with a one-step rotation when the
draw is the identity so a unit with at least two verdicts always changes at
least one assignment.

Oracle modes: ``gold_answer`` sets trust directly from whether each agent's
current position matches the gold answer; ``gold_evidence`` keeps the normal
verifier/trust path but replaces retrieved passages with the dataset's gold
evidence. Both recompute trust every round (never once at round 0).
"""

from __future__ import annotations

import hashlib
import json
from dataclasses import dataclass, field

import numpy as np

from ..agents import parse_position
from ..eval.answers import is_correct
from ..trust import TrustConfig
from ..trust.update import project_simplex_with_floor

PLACEBO_MODES: tuple[str, ...] = ("off", "shuffle_verdicts")
ORACLE_MODES: tuple[str, ...] = ("off", "gold_answer", "gold_evidence")

#: WP-18 placebo units. ``round_pool`` is the Full default; ``agent_round`` is
#: the optional manipulation check that preserves each agent's verdict multiset.
PLACEBO_UNITS: tuple[str, ...] = ("agent_round", "round_pool")
DEFAULT_PLACEBO_UNIT = "round_pool"

#: EG-SSS is the v1.2 gold-evidence benchmark; these aliases are accepted until
#: the dataset key is frozen in ``configs/datasets.yaml``.
GOLD_EVIDENCE_DATASETS = frozenset({"eg_sss", "eg_sss_180", "eg_sss_300"})

GOLD_SOURCE_ANSWER = "question.answer"
GOLD_SOURCE_EVIDENCE = "question.gold_evidence"

ORACLE_SCHEDULE = "every_round"

NOOP_FEWER_THAN_TWO = "fewer_than_two_verdicts"
NOOP_NO_UNITS = "no_verdict_units"


def _digest_int(*parts: object) -> int:
    """Stable 64-bit integer from the SHA-256 of the joined parts."""
    text = "|".join(str(part) for part in parts)
    digest = hashlib.sha256(text.encode("utf-8")).digest()
    return int.from_bytes(digest[:8], "big")


def placebo_seed(run_seed: int, question_id: str) -> int:
    """Debate-level placebo seed derived only from the run seed and question id."""
    return _digest_int("placebo", int(run_seed), str(question_id))


def _raw_permutation(
    n: int, *, seed: int, round_number: int, agent_index: int
) -> list[int]:
    """SHA-256 counter-mode Fisher-Yates permutation of ``range(n)``."""
    order = list(range(n))
    for i in range(n - 1, 0, -1):
        j = _digest_int(seed, round_number, agent_index, i) % (i + 1)
        order[i], order[j] = order[j], order[i]
    return order


def permutation_for_unit(
    n: int, *, seed: int, round_number: int, agent_index: int
) -> tuple[list[int], str | None, bool]:
    """``(order, noop_reason, identity_fallback)`` for one placebo unit.

    ``order[i]`` is the source index assigned to destination ``i``. A unit with
    fewer than two verdicts is an explicit no-op. A draw that happens to be the
    identity is rotated one step so the manipulation is never silently absent.
    """
    if n < 2:
        return list(range(n)), NOOP_FEWER_THAN_TWO, False
    order = _raw_permutation(
        n, seed=seed, round_number=round_number, agent_index=agent_index
    )
    identity = order == list(range(n))
    if identity:
        order = order[1:] + order[:1]
    return order, None, identity


def _permutation_payload(seed: int, units: list[dict]) -> dict:
    """Only the fields that define the permutation, not the verdict labels."""
    payload_units = []
    for unit in units:
        agent = unit.get("agent")
        payload_units.append(
            {
                "unit": str(unit.get("unit", DEFAULT_PLACEBO_UNIT)),
                "round": int(unit["round"]),
                "agent": int(agent) if agent is not None else None,
                "n": int(unit["n"]),
                "pool_size": int(unit.get("pool_size", unit["n"])),
                "order": [int(index) for index in unit["order"]],
                "identity_fallback": bool(unit.get("identity_fallback", False)),
            }
        )
    return {"seed": int(seed), "units": payload_units}


def placebo_permutation_hash(seed: int, units: list[dict]) -> str:
    """Reproducible sha256 of the debate seed and every applied unit permutation."""
    payload = _permutation_payload(seed, units)
    text = json.dumps(payload, sort_keys=True, separators=(",", ":"), ensure_ascii=False)
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


@dataclass
class PlaceboRecorder:
    """Accumulates the per-round placebo permutations for one debate."""

    run_seed: int
    question_id: str
    unit: str = DEFAULT_PLACEBO_UNIT
    units: list[dict] = field(default_factory=list)
    noop_units: list[dict] = field(default_factory=list)

    def __post_init__(self) -> None:
        if self.unit not in PLACEBO_UNITS:
            raise ValueError(
                f"unknown placebo_unit {self.unit!r}; expected one of {PLACEBO_UNITS}"
            )
        self.seed = placebo_seed(self.run_seed, self.question_id)

    def apply_round(
        self,
        verdicts: list[list[str]],
        verdict_records: list[dict],
        round_number: int,
    ) -> tuple[list[list[str]], list[dict]]:
        """Apply the configured unit and return the rewritten round data."""
        if self.unit == "agent_round":
            return self._apply_agent_round(verdicts, verdict_records, round_number)
        return self._apply_round_pool(verdicts, verdict_records, round_number)

    def _records_by_agent(self, verdict_records: list[dict]) -> dict[int, list[dict]]:
        records_by_agent: dict[int, list[dict]] = {}
        for record in verdict_records:
            records_by_agent.setdefault(int(record.get("agent", -1)), []).append(record)
        return records_by_agent

    def _apply_agent_round(
        self,
        verdicts: list[list[str]],
        verdict_records: list[dict],
        round_number: int,
    ) -> tuple[list[list[str]], list[dict]]:
        shuffled_verdicts = [list(labels) for labels in verdicts]
        records_by_agent = self._records_by_agent(verdict_records)

        for agent, labels in enumerate(verdicts):
            order, reason, identity_fallback = permutation_for_unit(
                len(labels),
                seed=self.seed,
                round_number=round_number,
                agent_index=agent,
            )
            if reason is not None:
                self.noop_units.append(
                    {
                        "unit": "agent_round",
                        "round": round_number,
                        "agent": agent,
                        "n": len(labels),
                        "reason": reason,
                    }
                )
                continue

            shuffled = [labels[index] for index in order]
            shuffled_verdicts[agent] = shuffled
            unit = {
                "unit": "agent_round",
                "round": round_number,
                "agent": agent,
                "n": len(labels),
                "order": order,
                "original": list(labels),
                "shuffled": shuffled,
                "identity_fallback": identity_fallback,
            }
            self.units.append(unit)

            # Claim text, passages, scores and evidence ids stay in place. Only
            # the verdict label moves; records are one per claim in claim order.
            agent_records = records_by_agent.get(agent, [])
            for index, record in enumerate(agent_records):
                if index >= len(shuffled):
                    break
                record["original_verdict"] = record.get("verdict")
                record["verdict"] = shuffled[index]

        return shuffled_verdicts, verdict_records

    def _apply_round_pool(
        self,
        verdicts: list[list[str]],
        verdict_records: list[dict],
        round_number: int,
    ) -> tuple[list[list[str]], list[dict]]:
        sizes = [len(labels) for labels in verdicts]
        pool_size = sum(sizes)
        shuffled_verdicts = [list(labels) for labels in verdicts]
        if pool_size < 2:
            self.noop_units.append(
                {
                    "unit": "round_pool",
                    "round": round_number,
                    "agent": None,
                    "n": pool_size,
                    "pool_size": pool_size,
                    "reason": NOOP_FEWER_THAN_TWO,
                }
            )
            return shuffled_verdicts, verdict_records

        flat = [label for labels in verdicts for label in labels]
        order, _reason, identity_fallback = permutation_for_unit(
            pool_size,
            seed=self.seed,
            round_number=round_number,
            agent_index=-1,  # round-pool sentinel; no per-agent key
        )
        shuffled = [flat[index] for index in order]
        records_by_agent = self._records_by_agent(verdict_records)

        spans = []
        start = 0
        for agent, labels in enumerate(verdicts):
            stop = start + len(labels)
            spans.append(
                {"agent": agent, "start": start, "stop": stop, "n": len(labels)}
            )
            shuffled_verdicts[agent] = shuffled[start:stop]
            agent_records = records_by_agent.get(agent, [])
            for index, record in enumerate(agent_records):
                if index >= len(labels):
                    break
                record["original_verdict"] = record.get("verdict")
                record["verdict"] = shuffled[start + index]
            start = stop

        self.units.append(
            {
                "unit": "round_pool",
                "round": round_number,
                "agent": None,
                "n": pool_size,
                "pool_size": pool_size,
                "order": order,
                "original": flat,
                "shuffled": shuffled,
                "agent_spans": spans,
                "identity_fallback": identity_fallback,
            }
        )
        return shuffled_verdicts, verdict_records

    def permutation_hash(self) -> str:
        return placebo_permutation_hash(self.seed, self.units)

    def noop_reason(self) -> str | None:
        if self.units:
            return None
        if self.noop_units:
            return NOOP_FEWER_THAN_TWO
        return NOOP_NO_UNITS

    def as_dict(self) -> dict:
        return {
            "mode": "shuffle_verdicts",
            "unit": self.unit,
            "seed": self.seed,
            "permutation_hash": self.permutation_hash(),
            "noop_reason": self.noop_reason(),
            "units": list(self.units),
            "noop_units": list(self.noop_units),
        }


def oracle_correctness(
    positions: list[str], gold: str | None, options: list[str] | None = None
) -> list[bool]:
    """Gold-answer correctness for each current agent position."""
    parsed = [parse_position(position) or position for position in positions]
    return [is_correct(position, gold or "", options) for position in parsed]


def oracle_trust(
    positions: list[str],
    gold: str | None,
    options: list[str] | None,
    config: TrustConfig | None = None,
) -> np.ndarray:
    """Trust set directly from current-answer correctness.

    Mixed panels give correct agents the high mass (floored at ``config.floor``
    and capped at ``config.ceiling``); a unanimous correct or unanimous wrong
    panel is uniform because the correctness signal cannot discriminate.
    """
    config = config or TrustConfig()
    if not positions:
        raise ValueError("oracle_trust needs at least one position")
    correct = oracle_correctness(positions, gold, options)
    n = len(correct)
    if all(correct) or not any(correct):
        return np.full(n, 1.0 / n, dtype=float)
    raw = np.asarray([1.0 if flag else 0.0 for flag in correct], dtype=float)
    return project_simplex_with_floor(
        raw, floor=config.floor, ceiling=config.ceiling
    )


def gold_evidence_passages(gold_evidence, agent_index: int) -> list[str]:
    """Passages from a list or an ``agent_index -> passages`` mapping."""
    if gold_evidence is None:
        return []
    if isinstance(gold_evidence, dict):
        value = gold_evidence.get(str(agent_index), gold_evidence.get(agent_index, []))
    else:
        value = gold_evidence
    if isinstance(value, str):
        value = [value]
    return [str(passage) for passage in value if str(passage).strip()]


def _validate_spans(qid: str, spans, n: int) -> list[str]:
    failures: list[str] = []
    if not isinstance(spans, list) or not spans:
        return [f"{qid}: round_pool agent_spans are missing"]
    expected_start = 0
    agents = []
    for index, span in enumerate(spans):
        if not isinstance(span, dict):
            failures.append(f"{qid}: agent_spans[{index}] is not an object")
            continue
        agent = span.get("agent")
        start = span.get("start")
        stop = span.get("stop")
        count = span.get("n")
        if not isinstance(agent, int) or isinstance(agent, bool):
            failures.append(f"{qid}: agent_spans[{index}].agent is not an integer")
            continue
        agents.append(agent)
        if start != expected_start:
            failures.append(f"{qid}: agent_spans[{index}] is not contiguous")
        if not isinstance(count, int) or count < 0 or stop != start + count:
            failures.append(f"{qid}: agent_spans[{index}] has inconsistent bounds")
        expected_start = stop if isinstance(stop, int) else expected_start
    if agents != list(range(len(spans))):
        failures.append(f"{qid}: agent_spans agents are not 0..{len(spans) - 1}")
    if expected_start != n:
        failures.append(f"{qid}: agent_spans cover {expected_start} of {n} verdicts")
    return failures


def check_placebo_records(records: list[dict]) -> list[str]:
    """Smoke-test checks for B8-placebo records; empty list means valid."""
    failures: list[str] = []
    for record in records:
        qid = record.get("question_id", "?")
        record_unit = record.get("placebo_unit")
        if record_unit not in PLACEBO_UNITS:
            failures.append(f"{qid}: placebo_unit is not one of {PLACEBO_UNITS}")
        if record.get("placebo_mode") != "shuffle_verdicts":
            failures.append(f"{qid}: placebo_mode is not 'shuffle_verdicts'")
        seed = record.get("placebo_seed")
        if not isinstance(seed, int) or isinstance(seed, bool):
            failures.append(f"{qid}: placebo_seed is not an integer")
        digest = record.get("placebo_permutation_hash")
        if not isinstance(digest, str) or len(digest) != 64:
            failures.append(f"{qid}: placebo_permutation_hash is missing or malformed")

        block = record.get("placebo")
        if not isinstance(block, dict):
            failures.append(f"{qid}: placebo block is missing")
            continue
        if block.get("unit") != record_unit:
            failures.append(f"{qid}: placebo block unit does not match placebo_unit")
        units = block.get("units") or []
        noops = block.get("noop_units") or []
        if units and record.get("placebo_noop_reason") is not None:
            failures.append(f"{qid}: placebo_noop_reason must be null when a unit applied")
        if not units and not record.get("placebo_noop_reason"):
            failures.append(f"{qid}: all-no-op placebo must record a no-op reason")

        for unit in units:
            unit_type = unit.get("unit", record_unit)
            if unit_type != record_unit:
                failures.append(f"{qid}: placebo unit type does not match placebo_unit")
            n = unit.get("n")
            order = unit.get("order")
            original = unit.get("original")
            shuffled = unit.get("shuffled")
            if not isinstance(n, int) or n < 2:
                failures.append(f"{qid}: placebo unit n must be >= 2")
                continue
            if not isinstance(order, list) or sorted(order) != list(range(n)):
                failures.append(f"{qid}: placebo unit order is not a permutation")
                continue
            if order == list(range(n)):
                failures.append(f"{qid}: placebo unit order is the identity permutation")
            if not isinstance(original, list) or not isinstance(shuffled, list):
                failures.append(f"{qid}: placebo unit original/shuffled labels are missing")
                continue
            if len(original) != n or len(shuffled) != n:
                failures.append(f"{qid}: placebo unit claim count changed")
            if sorted(original) != sorted(shuffled):
                failures.append(f"{qid}: placebo unit verdict multiset changed")
            if [original[index] for index in order] != shuffled:
                failures.append(f"{qid}: placebo unit order does not match the shuffle")
            if original == shuffled and len(set(original)) > 1:
                failures.append(f"{qid}: placebo unit did not change any verdict")
            if unit_type == "round_pool":
                if unit.get("pool_size") != n:
                    failures.append(f"{qid}: round_pool pool_size does not equal n")
                failures.extend(_validate_spans(qid, unit.get("agent_spans"), n))
            elif not isinstance(unit.get("agent"), int):
                failures.append(f"{qid}: agent_round unit is missing its agent index")

        for noop in noops:
            if noop.get("reason") != NOOP_FEWER_THAN_TWO:
                failures.append(f"{qid}: placebo no-op has no reason")
            if noop.get("unit") != record_unit:
                failures.append(f"{qid}: placebo no-op unit does not match")
            if isinstance(noop.get("n"), int) and noop["n"] >= 2:
                failures.append(f"{qid}: placebo no-op recorded for a unit with >= 2 verdicts")
            if record_unit == "round_pool" and noop.get("pool_size") != noop.get("n"):
                failures.append(f"{qid}: round_pool no-op pool_size does not equal n")

        if isinstance(seed, int) and isinstance(digest, str):
            expected = placebo_permutation_hash(seed, units)
            if digest != expected:
                failures.append(f"{qid}: placebo_permutation_hash is not reproducible")
    return failures


def check_oracle_records(records: list[dict]) -> list[str]:
    """Smoke-test checks for B8-oracle records; empty list means valid."""
    failures: list[str] = []
    for record in records:
        qid = record.get("question_id", "?")
        mode = record.get("oracle_mode")
        if mode not in ("gold_answer", "gold_evidence"):
            failures.append(f"{qid}: oracle_mode is not gold_answer/gold_evidence")
        source = record.get("oracle_gold_source")
        if not isinstance(source, str) or not source.strip():
            failures.append(f"{qid}: oracle_gold_source is missing")
        rounds = record.get("oracle_rounds_applied")
        if not isinstance(rounds, list) or not rounds:
            failures.append(f"{qid}: oracle_rounds_applied is missing or empty")
        elif any(not isinstance(round_number, int) for round_number in rounds):
            failures.append(f"{qid}: oracle_rounds_applied must contain integers")
        trajectory = record.get("trust_trajectory")
        if trajectory is None:
            failures.append(f"{qid}: oracle record has no trust_trajectory")
        elif not isinstance(trajectory, list) or not trajectory:
            failures.append(f"{qid}: oracle trust_trajectory is empty")

        block = record.get("oracle")
        if not isinstance(block, dict):
            failures.append(f"{qid}: oracle block is missing")
            continue
        if block.get("mode") != mode:
            failures.append(f"{qid}: oracle block mode does not match oracle_mode")
        if block.get("gold_source") != source:
            failures.append(f"{qid}: oracle block gold_source does not match")
        if block.get("rounds_applied") != rounds:
            failures.append(f"{qid}: oracle block rounds_applied does not match")
        if block.get("schedule") != ORACLE_SCHEDULE:
            failures.append(f"{qid}: oracle schedule is not {ORACLE_SCHEDULE!r}")
    return failures
