"""Experiment runner — resumable, crash-safe, GPU-free-testable.

Arms: B1–B10, the Month-1 ``pilot`` harness, and the ``injection`` stress test.
Every arm returns the same result package, so metrics, failure taxonomy, and
summary files are computed once.

Crash safety contract: every finished debate is appended to ``records.jsonl``
immediately; re-running the same config skips completed question ids. A killed
session therefore costs at most one question of GPU time.

Reproducibility contract (P0-11): a run directory carries ``run_manifest.json``
(config/model/prompt/dataset/commit/seed/temperature hashes). Resuming refuses
a changed manifest or records stamped by a different manifest, every record
carries ``manifest_hash``, and every record is schema-v2 validated before it is
appended.
"""

from __future__ import annotations

import json
import time
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path

from .agents import AGENT_INITIAL, AGENT_SYSTEM, parse_position
from .config import PHASES, default_phase, load_models, rounds_for_phase
from .eval import load_dataset, summarize
from .eval.answers import score_answer
from .eval.baselines import RUNNER_ARMS
from .eval.datasets import sampling_seed, write_eligible_n
from .eval.failures import failure_counts
from .eval.metrics import MetricSummary
from .eval.options import RenderedOptions, build_options
from .eval.pilot import score_pilot
from .eval.records import validate_record
from .inference import VLLMClient, vllm_clients
from .manifest import ManifestMismatch, build_manifest, check_resume, manifest_hash, write_manifest
from .orchestrator import DebateRunner
from .orchestrator.strategies import (
    run_b4_rag_mad,
    run_consensagent,
    run_imad,
    run_moa,
    run_self_consistency,
    run_single_rag,
)
from .retrieval.pipeline import RetrievalConfig, Retriever
from .retrieval.verifier import build_verifier
from .trust import TrustConfig, TrustState, aggregate

ARMS = RUNNER_ARMS

TRUSTCAL_ROOT = Path(__file__).resolve().parents[2]
EXPERIMENTS_CONFIG = TRUSTCAL_ROOT / "configs" / "experiments.yaml"
DATASETS_CONFIG = TRUSTCAL_ROOT / "configs" / "datasets.yaml"
PROMPTS_PATH = Path(__file__).resolve().parent / "agents" / "prompts.py"


@dataclass
class RunConfig:
    arm: str
    dataset: str = "gpqa"
    limit: int = 10
    seed: int = 1
    rounds: int = 3
    temperature: float = 0.7
    out_root: Path = Path("results")
    model_config: Path | str = "configs/models.yaml"
    questions_file: Path | None = None  # local JSON list; bypasses the HF dataset
    phase: str = field(default_factory=default_phase)
    # trust / retrieval switches (Phase 3b ablations)
    alpha: float = 0.5
    beta: float = 0.3
    use_trust: bool = True
    source_partitioning: bool = True
    progressive_retrieval: bool = True
    adaptive_triggering: bool = True
    # P0-3: fabricated-consensus pressure on top of the debate loop (B8 + injection);
    # B3 + injection is the no-retrieval pressure baseline.
    inject: bool = False
    injection_scope: str = "minority"
    injection_arm: str = "authority"  # authority | peer | neutral | none
    injection_source: str | None = None  # None -> external for authority, panel otherwise
    injection_template: int = 0  # 0..2
    verifier: str = "lexical"  # lexical | cross-encoder | nli | llm-judge
    # baseline hyperparameters
    samples: int = 5  # B5
    layers: int = 2  # B6
    agents: int = 3  # N-scaling (Phase 3b): 2, 3, or 5

    def __post_init__(self) -> None:
        if self.arm not in ARMS:
            raise ValueError(f"unknown arm {self.arm!r}; expected one of {ARMS}")
        if self.phase not in PHASES:
            raise ValueError(f"unknown phase {self.phase!r}; expected one of {PHASES}")
        if self.agents < 1:
            raise ValueError("agents must be >= 1")
        if self.injection_scope not in ("minority", "all"):
            raise ValueError(
                f"unknown injection_scope {self.injection_scope!r}; expected 'minority' or 'all'"
            )
        if self.injection_arm not in ("authority", "peer", "neutral", "none"):
            raise ValueError(
                f"unknown injection_arm {self.injection_arm!r}; expected authority/peer/neutral/none"
            )
        if self.injection_source not in (None, "external", "panel"):
            raise ValueError("injection_source must be None, 'external', or 'panel'")
        if not 0 <= self.injection_template <= 2:
            raise ValueError("injection_template must be 0, 1, or 2")
        self.out_root = Path(self.out_root)
        self.questions_file = Path(self.questions_file) if self.questions_file else None

    def trust_config(self) -> TrustConfig:
        return TrustConfig(
            alpha=self.alpha,
            beta=self.beta,
            use_trust=self.use_trust,
            source_partitioning=self.source_partitioning,
            progressive_retrieval=self.progressive_retrieval,
            adaptive_triggering=self.adaptive_triggering,
        )

    def retrieval_config(self) -> RetrievalConfig:
        return RetrievalConfig(
            partition=self.source_partitioning,
            progressive=self.progressive_retrieval,
        )


def run_dir(cfg: RunConfig) -> Path:
    return cfg.out_root / cfg.arm / cfg.dataset / f"seed{cfg.seed}"


def records_path(cfg: RunConfig) -> Path:
    return run_dir(cfg) / "records.jsonl"


def read_records(path: Path) -> list[dict]:
    """All complete JSONL records; a torn last line (crash) is ignored."""
    if not Path(path).is_file():
        return []
    records = []
    for line in Path(path).read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line:
            continue
        try:
            records.append(json.loads(line))
        except json.JSONDecodeError:
            continue
    return records


def _append_record(path: Path, record: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("a", encoding="utf-8") as fh:
        fh.write(json.dumps(record, ensure_ascii=False) + "\n")
        fh.flush()


def _config_path(path: Path | str) -> Path:
    """Resolve a config path against the trustcal root when cwd differs."""
    value = Path(path)
    if value.is_absolute() or value.is_file():
        return value
    candidate = TRUSTCAL_ROOT / value
    return candidate if candidate.is_file() else value


def _run_config_dict(cfg: RunConfig, rounds: int) -> dict:
    """Results-affecting RunConfig values, folded into the manifest hash.

    ``out_root`` is excluded (moving a results tree does not change a result);
    ``limit`` is included because the stratified sample changes with the cap, so
    the same question id can denote a different item.
    """
    return {
        "arm": cfg.arm,
        "dataset": cfg.dataset,
        "limit": cfg.limit,
        "seed": cfg.seed,
        "rounds": rounds,
        "temperature": cfg.temperature,
        "phase": cfg.phase,
        "alpha": cfg.alpha,
        "beta": cfg.beta,
        "use_trust": cfg.use_trust,
        "source_partitioning": cfg.source_partitioning,
        "progressive_retrieval": cfg.progressive_retrieval,
        "adaptive_triggering": cfg.adaptive_triggering,
        "inject": cfg.inject,
        "injection_scope": cfg.injection_scope,
        "injection_arm": cfg.injection_arm,
        "injection_source": cfg.injection_source,
        "injection_template": cfg.injection_template,
        "verifier": cfg.verifier,
        "samples": cfg.samples,
        "layers": cfg.layers,
        "agents": cfg.agents,
        "sample_seed": sampling_seed(),
        "questions_file": Path(cfg.questions_file).name if cfg.questions_file else None,
    }


class _RetrieverProbe:
    """Delegating retriever that records deliveries and exposes the route log.

    ``evidence_introduced`` must be observed, not inferred from an arm name, and
    B2's strategy wrapper does not persist its evidence block. The probe sees
    every passage the debate layer actually received.
    """

    def __init__(self, inner) -> None:
        self.inner = inner
        self.calls = 0
        self.delivered = 0

    def retrieve(self, agent_index: int, claim: str, round_number: int = 1) -> list[str]:
        passages = list(self.inner.retrieve(agent_index, claim, round_number))
        self.calls += 1
        if passages:
            self.delivered += 1
        return passages

    @property
    def routes(self) -> list[dict]:
        return list(getattr(self.inner, "routes", []))

    @property
    def errors(self) -> list[str]:
        return list(getattr(self.inner, "errors", []))


def _result_has_evidence(result: dict | None) -> bool:
    """True when the debate layer logged at least one passage shown to an agent."""
    for entry in (result or {}).get("evidence") or []:
        for passages in entry.get("passages") or []:
            if passages:
                return True
    return False


def _check_record_hashes(records: list[dict], run_hash: str) -> None:
    """Refuse to pool records written under another manifest (P0-11)."""
    foreign: dict[str, list[str]] = {}
    for record in records:
        value = record.get("manifest_hash")
        if value != run_hash:
            foreign.setdefault(str(value), []).append(str(record.get("question_id", "?")))
    if foreign:
        detail = "; ".join(
            f"{value}: {len(qids)} record(s) e.g. {qids[:3]}" for value, qids in foreign.items()
        )
        raise ManifestMismatch(
            "records in this run directory were written under a different manifest "
            f"({detail}); use a new run directory"
        )


def _routes_path(cfg: RunConfig) -> Path:
    return run_dir(cfg) / "routes.json"


def _dedupe_json(items: list) -> list:
    """Drop duplicate dict scalars (routes/errors) while preserving order."""
    seen: set[str] = set()
    out: list = []
    for item in items:
        key = json.dumps(item, sort_keys=True, ensure_ascii=False)
        if key in seen:
            continue
        seen.add(key)
        out.append(item)
    return out


def _write_routes(cfg: RunConfig, probe: _RetrieverProbe | None) -> None:
    """Persist the retriever's claim->source route log for this run.

    Resume-safe: a new session merges its routes into the existing sidecar
    instead of replacing an earlier session's provenance.
    """
    if probe is None:
        return
    routes = probe.routes
    errors = probe.errors
    if not routes and not errors:
        return
    path = _routes_path(cfg)
    if path.is_file():
        try:
            previous = json.loads(path.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            previous = {}
        if isinstance(previous, dict):
            routes = _dedupe_json(list(previous.get("routes") or []) + routes)
            errors = _dedupe_json(list(previous.get("errors") or []) + errors)
    path.parent.mkdir(parents=True, exist_ok=True)
    payload = {
        "arm": cfg.arm,
        "dataset": cfg.dataset,
        "seed": cfg.seed,
        "n_routes": len(routes),
        "routes": routes,
        "errors": errors,
    }
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def _base_record(
    qid: str,
    question: dict,
    arm: str,
    seed: int,
    rendered: RenderedOptions | None = None,
    manifest_hash_value: str | None = None,
) -> dict:
    """Record schema v2 option fields (P0-0) plus the run's manifest hash."""
    rendered = rendered or build_options(question, seed, qid)
    return {
        "question_id": qid,
        "arm": arm,
        "seed": seed,
        "question": question["question"],
        "gold": question.get("answer"),
        "options_raw": question.get("options"),
        "options": rendered.options or None,
        "option_permutation": rendered.permutation or None,
        "gold_letter_rendered": rendered.gold_letter,
        # Schema-v2 sections that are genuinely absent at construction time;
        # builders overwrite them when the arm produces a value.
        "injection": None,
        "trust_trajectory": None,
        "trust_for_positions": None,
        "trust_status": None,
        "verdicts": [],
        "manifest_hash": manifest_hash_value,
    }


def _rendered_from_record_result(
    result: dict, question: dict, qid: str, seed: int
) -> RenderedOptions:
    """Rebuild the rendered options a debate arm used (identical by construction)."""
    if result.get("options"):
        return RenderedOptions(
            options=list(result["options"]),
            permutation=list(result.get("option_permutation") or []),
            gold_letter=result.get("gold_letter_rendered"),
            block="",
        )
    return build_options(question, seed, qid)


def _aggregation_answer(result: dict) -> tuple[str | None, str]:
    """The answer the arm actually aggregated, and its provenance.

    Trust weighting only counts when the debate layer updated trust from
    evidence (a stored trajectory); a uniform vector reproduces the majority, so
    calling it ``weighted`` would overstate what happened.
    """
    aggregation = result.get("aggregation") or {}
    weighted = aggregation.get("weighted")
    majority = aggregation.get("majority")
    if result.get("trust_trajectory") is not None and weighted:
        return weighted, "weighted"
    if majority:
        return majority, "majority"
    if weighted:
        return weighted, "weighted"
    return None, "majority"


def single_agent_record(
    qid: str,
    question: dict,
    client: VLLMClient,
    arm: str,
    seed: int,
    *,
    manifest_hash_value: str | None = None,
) -> dict:
    """B1 — one agent, one call, no debate."""
    rendered = build_options(question, seed, qid)
    record = _base_record(qid, question, arm, seed, rendered=rendered, manifest_hash_value=manifest_hash_value)
    t0 = time.perf_counter()
    text = client.complete(
        AGENT_SYSTEM,
        AGENT_INITIAL.format(
            agent_id=1, question=question["question"], options_block=rendered.block
        ),
    )
    record["elapsed_s"] = round(time.perf_counter() - t0, 2)
    record["transcript"] = [{"round": 1, "positions": [text]}]
    parsed = parse_position(text)
    record["rounds"] = [{"answers": [parsed], "inconclusive": [not bool(parsed)]}]
    score = score_answer(text, question.get("answer") or "", rendered)
    record["raw_answer"] = text
    record["parsed_answer"] = score.parsed
    record["parser_version"] = "p0-1"
    record["final_answer"] = score.parsed
    record["final_answer_correct"] = score.correct
    record["final_answer_source"] = "single"
    record["evidence_introduced"] = False
    return record


def debate_record(
    qid: str,
    question: dict,
    result: dict,
    arm: str,
    seed: int,
    elapsed_s: float,
    *,
    manifest_hash_value: str | None = None,
    evidence_introduced: bool = False,
) -> dict:
    """Debate arms — parsed answers per round, raw transcript, trust/evidence audit."""
    rendered = _rendered_from_record_result(result, question, qid, seed)
    record = _base_record(qid, question, arm, seed, rendered=rendered, manifest_hash_value=manifest_hash_value)
    record["elapsed_s"] = round(elapsed_s, 2)
    record["rounds_completed"] = result.get("rounds_completed")
    record["transcript"] = result["transcript"]
    rounds = []
    for entry in result["transcript"]:
        answers = [parse_position(position) for position in entry["positions"]]
        rounds.append({"answers": answers, "inconclusive": [not answer for answer in answers]})
    record["rounds"] = rounds
    injection = result.get("injection")
    if isinstance(injection, dict):
        # Producer-owned in WP-10; until then the current protocol is a panel
        # majority delivered to the targeted agents, which is what these mean.
        injection = dict(injection)
        injection.setdefault("consensus_source", "panel")
        injection.setdefault(
            "delivered", bool(injection.get("eligible") and injection.get("targets"))
        )
    record["injection"] = injection
    if injection and injection.get("eligible"):
        record["consensus"] = injection.get("consensus")
        record["targets"] = injection.get("targets")
    if result.get("trust_trajectory") is not None:
        record["trust_trajectory"] = result["trust_trajectory"]
        record["final_trust"] = result.get("final_trust")
    for key in ("trust_for_positions", "trust_status"):
        if result.get(key) is not None:
            record[key] = result[key]
    for key in ("verdicts", "evidence", "aggregation"):
        if key in result:
            record[key] = result[key]
    for key in ("imad", "consensagent"):
        if key in result:
            record[key] = result[key]

    final_answer, source = _aggregation_answer(result)
    raw_final = next(
        (
            position
            for position in reversed(result.get("final_positions") or [])
            if parse_position(position) == final_answer
        ),
        (result.get("final_positions") or [""])[-1],
    )
    score = score_answer(final_answer or raw_final, question.get("answer") or "", rendered)
    record["raw_answer"] = raw_final
    record["parsed_answer"] = score.parsed
    record["parser_version"] = "p0-1"
    # Store the parsed aggregation winner: `aggregation` keeps the raw label,
    # while `final_answer` must re-score identically in the endpoint layer.
    record["final_answer"] = score.parsed or final_answer or ""
    record["final_answer_correct"] = score.correct
    record["final_answer_source"] = source
    record["evidence_introduced"] = evidence_introduced
    return record


def oracle_record(
    qid: str,
    question: dict,
    oracle,
    arm: str,
    seed: int,
    *,
    manifest_hash_value: str | None = None,
) -> dict:
    """B7 — external oracle answer, no panel."""
    rendered = build_options(question, seed, qid)
    record = _base_record(qid, question, arm, seed, rendered=rendered, manifest_hash_value=manifest_hash_value)
    t0 = time.perf_counter()
    text = oracle.answer(question["question"] + "\n\n" + rendered.block)
    record["elapsed_s"] = round(time.perf_counter() - t0, 2)
    record["transcript"] = [{"round": 1, "positions": [text]}]
    parsed = parse_position(text)
    record["rounds"] = [{"answers": [parsed], "inconclusive": [not bool(parsed)]}]
    oracle_meta = {"model": getattr(oracle, "model", None)}
    last_meta = getattr(oracle, "last_metadata", None)
    if isinstance(last_meta, dict):
        oracle_meta.update(last_meta)
    record["oracle"] = oracle_meta
    score = score_answer(text, question.get("answer") or "", rendered)
    record["raw_answer"] = text
    record["parsed_answer"] = score.parsed
    record["parser_version"] = "p0-1"
    record["final_answer"] = score.parsed
    record["final_answer_correct"] = score.correct
    record["final_answer_source"] = "oracle"
    record["evidence_introduced"] = False
    return record



def _question_verdicts(question: dict, n_agents: int, positions: list[str]) -> tuple[list[float], list[float]]:
    """Evidence-side support/harm per agent for the pilot.

    ``verdicts`` (human labels) wins; otherwise passages in ``evidence`` are
    classified claim-by-claim. Self-reported confidence is never accepted here —
    that would invalidate the pilot (PILOT_CRITERION.md).
    """
    verdicts = question.get("verdicts")
    if verdicts is not None:
        if len(verdicts) != n_agents:
            raise ValueError(f"pilot verdicts: expected {n_agents} rows, got {len(verdicts)}")
        return (
            [float(row["support"]) for row in verdicts],
            [float(row["harm"]) for row in verdicts],
        )

    evidence = question.get("evidence")
    if evidence is None:
        raise ValueError("pilot question needs 'verdicts' or 'evidence'")
    from .agents import claim_texts
    from .retrieval.verdicts import classify_claim, count_verdicts

    support: list[float] = []
    harm: list[float] = []
    for index, position in enumerate(positions):
        if isinstance(evidence, dict):
            value = evidence.get(str(index), evidence.get(index, []))
            passages = [value] if isinstance(value, str) else list(value)
        else:
            passages = list(evidence)
        claims = claim_texts(position, max_claims=8)
        labels = [classify_claim(claim, passages) for claim in claims]
        supported, contradicted, _ = count_verdicts(labels)
        support.append(float(supported))
        harm.append(float(contradicted))
    return support, harm


def _pilot_block(
    question: dict,
    positions: list[str],
    cfg: RunConfig,
    rendered: RenderedOptions | None = None,
    raw_positions: list[str] | None = None,
) -> dict:
    """Trust-weighted vs majority aggregation for one pilot question.

    Uses ``TrustState`` so the pilot follows the same claim-count-normalized
    update as the debate loop (P0-5): support/harm are divided by the number of
    distinct claims each agent actually made, not by a verbosity count.
    """
    from .agents import claim_texts

    n = len(positions)
    support, harm = _question_verdicts(question, n, positions)
    trust_config = cfg.trust_config()
    claim_sources = raw_positions if raw_positions is not None else positions
    n_claims = [
        max(1, len(dict.fromkeys(claim_texts(position, max_claims=trust_config.max_claims))))
        for position in claim_sources
    ]
    state = TrustState(n, trust_config)
    state.update(support, harm, n_claims=n_claims)
    trust = state.scores
    options = (rendered.options or None) if rendered is not None else question.get("options")
    result = aggregate(trust, positions, options)
    majority_correct = bool(result["majority"]) and _is_gold(result["majority"], question, options)
    weighted_correct = bool(result["weighted"]) and _is_gold(result["weighted"], question, options)
    return {
        "majority": result["majority"],
        "weighted": result["weighted"],
        "changed": result["changed"],
        "toward_gold": weighted_correct and not majority_correct,
        "away_from_gold": majority_correct and not weighted_correct,
        "support": support,
        "harm": harm,
        "n_claims": n_claims,
        "trust": trust.tolist(),
    }


def _is_gold(answer: str, question: dict, options: list[str] | None = None) -> bool:
    from .eval.answers import is_correct

    return is_correct(answer, question.get("answer", ""), options if options is not None else question.get("options"))


def _retriever(cfg: RunConfig, partition: bool | None = None) -> Retriever:
    """Build the retriever; B2/B4 pass partition=False so RAG baselines see every source."""
    config = cfg.retrieval_config()
    if partition is not None:
        config = RetrievalConfig(
            top_k=config.top_k,
            prompt_passages=config.prompt_passages,
            max_chars=config.max_chars,
            partition=partition,
            progressive=config.progressive,
        )
    return Retriever(config=config)


def _make_runner(
    cfg: RunConfig,
    clients: list,
    rounds: int,
    retriever: Retriever | None = None,
    injection_scope: str | None = None,
    question: dict | None = None,
    qid: str = "",
) -> DebateRunner:
    return DebateRunner(
        clients=clients,
        rounds=rounds,
        retriever=retriever,
        injection_scope=injection_scope,
        injection_arm=cfg.injection_arm,
        injection_source=cfg.injection_source,
        injection_template=cfg.injection_template,
        verifier=build_verifier(cfg.verifier),
        trust_config=cfg.trust_config(),
        seed=cfg.seed,
        question_id=qid or None,
        gold=(question or {}).get("answer"),
    )


INJECTABLE_ARMS = frozenset({"B3", "B8", "pilot", "injection"})


def _scope(cfg: RunConfig) -> str | None:
    """Injection scope for a debate arm; ``None`` means a plain debate."""
    return cfg.injection_scope if cfg.inject else None


def _write_summary(
    cfg: RunConfig,
    summary: MetricSummary,
    records: list[dict],
    run_hash: str,
    manifest_path: Path,
) -> Path:
    stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    out = run_dir(cfg)
    out.mkdir(parents=True, exist_ok=True)
    payload = {
        "arm": cfg.arm,
        "dataset": cfg.dataset,
        "seed": cfg.seed,
        "phase": cfg.phase,
        "stamp": stamp,
        "manifest_hash": run_hash,
        "manifest": str(manifest_path),
        **summary.as_dict(),
        "failures": failure_counts(records),
    }
    if any("pilot" in r for r in records):
        payload["pilot"] = score_pilot(records)
    (out / "summary.json").write_text(json.dumps(payload, indent=2), encoding="utf-8")

    accuracy = payload.get("accuracy")
    accuracy_line = (
        f"- accuracy: {accuracy:.3f} ({payload.get('n_correct')}/{payload.get('n_scored')} scored)"
        if accuracy is not None
        else "- accuracy: not applicable"
    )
    lines = [
        f"# {cfg.arm} — {cfg.dataset} (seed {cfg.seed}, phase {cfg.phase})",
        "",
        f"- debates: {summary.n_debates} · divergent: {summary.n_divergent}",
        f"- CCR: {summary.ccr:.3f} ({summary.n_collapse}/{summary.n_exposed} exposed agents)",
        f"- MPR: {summary.mpr:.3f} ({summary.n_divergent} divergent debates)",
        accuracy_line,
        f"- switches to injected consensus: {summary.n_switched_to_consensus}",
        f"- manifest: {run_hash}",
        "",
        "| # | question | divergent | exposed | abandoned | preserved |",
        "| --- | --- | --- | --- | --- | --- |",
    ]

    for i, d in enumerate(summary.per_debate, start=1):
        lines.append(
            f"| {i} | {d.question_id} | {'yes' if d.divergent else 'no'} | "
            f"{len(d.exposed)} | {len(d.abandoned)} | {'yes' if d.preserved else 'no'} |"
        )
    if "pilot" in payload:
        pilot = payload["pilot"]
        lines += [
            "",
            f"**Pilot:** {pilot['verdict']} — changed {pilot['changed']}/{pilot['n']} "
            f"(threshold {pilot['pass_threshold']}), toward gold {pilot['toward_gold']}, "
            f"away {pilot['away_from_gold']}.",
        ]
    path = out / f"summary-{stamp}.md"
    path.write_text("\n".join(lines) + "\n", encoding="utf-8")
    return path


def load_questions(cfg: RunConfig) -> list[dict]:
    """Questions from a local JSON file when configured, else the HF dataset.

    Both paths persist ``eligible_n.json`` in the run directory (P0-8): the HF
    loader writes the sampled/available/skipped counts, and a local question
    file gets the same record so every run reports its eligible n.
    """
    eligible_path = run_dir(cfg) / "eligible_n.json"
    if cfg.questions_file:
        data = json.loads(Path(cfg.questions_file).read_text(encoding="utf-8"))
        selected = data[: cfg.limit]
        write_eligible_n(
            selected,
            eligible_path,
            dataset=cfg.dataset,
            requested=cfg.limit,
            available=len(data),
            extra={"source": "questions_file"},
        )
        return selected
    return load_dataset(
        cfg.dataset, sample_cap=cfg.limit, eligible_path=eligible_path
    )[: cfg.limit]


def run(
    cfg: RunConfig,
    clients: list[VLLMClient] | None = None,
    questions: list[dict] | None = None,
    oracle=None,
    rewriter=None,
) -> MetricSummary:
    """Run (or resume) an arm and return the pooled metric summary."""
    if cfg.inject and cfg.arm not in INJECTABLE_ARMS:
        raise ValueError(
            f"inject=True is wired for {sorted(INJECTABLE_ARMS)} only; "
            f"arm {cfg.arm!r} builds its own debate loop without an injection hook"
        )
    if clients is None and cfg.arm != "B7":
        model_cfg = load_models(cfg.model_config)
        clients = vllm_clients(model_cfg, seed=cfg.seed, phase=cfg.phase, n=cfg.agents)
        rounds = rounds_for_phase(model_cfg, cfg.phase)
    else:
        rounds = cfg.rounds if clients is not None else 1
    if clients is not None and len(clients) != cfg.agents:
        clients = [clients[i % len(clients)] for i in range(cfg.agents)]

    if questions is None:
        questions = load_questions(cfg)
    else:
        write_eligible_n(
            questions,
            run_dir(cfg) / "eligible_n.json",
            dataset=cfg.dataset,
            requested=cfg.limit,
            available=len(questions),
            extra={"source": "in_memory"},
        )

    out = run_dir(cfg)
    path = records_path(cfg)
    config_paths = [EXPERIMENTS_CONFIG]
    if cfg.questions_file:
        config_paths.append(cfg.questions_file)
    manifest = build_manifest(
        config_paths,
        _config_path(cfg.model_config),
        DATASETS_CONFIG,
        PROMPTS_PATH,
        cfg.seed,
        cfg.temperature,
        run_config=_run_config_dict(cfg, rounds),
    )
    manifest_path = out / "run_manifest.json"
    check_resume(manifest_path, manifest)
    write_manifest(manifest_path, manifest)
    run_hash = manifest_hash(manifest)

    existing = read_records(path)
    _check_record_hashes(existing, run_hash)
    done = {r["question_id"] for r in existing}

    probe: _RetrieverProbe | None = None
    retriever = None
    if cfg.arm in ("B2", "B4"):
        probe = _RetrieverProbe(_retriever(cfg, partition=False))
        retriever = probe
    elif cfg.arm == "B8":
        probe = _RetrieverProbe(_retriever(cfg))
        retriever = probe

    for index, question in enumerate(questions):
        qid = f"{cfg.dataset}-{index:04d}"
        if qid in done:
            continue
        t0 = time.perf_counter()
        polled = None
        delivered_before = probe.delivered if probe is not None else 0

        if cfg.arm == "B1":
            record = single_agent_record(
                qid, question, clients[0], cfg.arm, cfg.seed, manifest_hash_value=run_hash
            )
        elif cfg.arm == "B2":
            polled = run_single_rag(
                question, clients[0], retriever, seed=cfg.seed, question_id=qid
            )
        elif cfg.arm == "B3":
            polled = _make_runner(
                cfg,
                clients,
                rounds,
                injection_scope=_scope(cfg),
                question=question,
                qid=qid,
            ).run(question["question"], question.get("options"))
        elif cfg.arm == "B4":
            polled = run_b4_rag_mad(
                question, clients, rounds, retriever, seed=cfg.seed, question_id=qid
            )
        elif cfg.arm == "B5":
            polled = run_self_consistency(
                question, clients[0], samples=cfg.samples, seed=cfg.seed, question_id=qid
            )
        elif cfg.arm == "B6":
            polled = run_moa(
                question, clients, layers=cfg.layers, seed=cfg.seed, question_id=qid
            )
        elif cfg.arm == "B7":
            if oracle is None:
                from .eval.oracle import OpenAIOracle

                oracle = OpenAIOracle()
            record = oracle_record(
                qid, question, oracle, cfg.arm, cfg.seed, manifest_hash_value=run_hash
            )
        elif cfg.arm == "B8":
            polled = _make_runner(
                cfg,
                clients,
                rounds,
                retriever=retriever,
                injection_scope=_scope(cfg),
                question=question,
                qid=qid,
            ).run(question["question"], question.get("options"))
        elif cfg.arm == "B9":
            polled = run_imad(
                question, clients, rounds=rounds, seed=cfg.seed, question_id=qid
            )
        elif cfg.arm == "B10":
            polled = run_consensagent(
                question,
                clients,
                rounds=rounds,
                rewriter=rewriter,
                seed=cfg.seed,
                question_id=qid,
            )
        elif cfg.arm == "pilot":
            # Phase 1 criterion: debate positions unweighted, then compare the
            # same positions under trust-weighted aggregation.
            polled = _make_runner(
                cfg,
                clients,
                rounds,
                injection_scope=_scope(cfg),
                question=question,
                qid=qid,
            ).run(question["question"], question.get("options"))
        else:  # injection
            polled = _make_runner(
                cfg,
                clients,
                rounds,
                injection_scope=cfg.injection_scope,
                question=question,
                qid=qid,
            ).run(question["question"], question.get("options"))

        if polled is not None:
            evidence_introduced = (
                probe is not None and probe.delivered > delivered_before
            ) or _result_has_evidence(polled)
            record = debate_record(
                qid,
                question,
                polled,
                cfg.arm,
                cfg.seed,
                time.perf_counter() - t0,
                manifest_hash_value=run_hash,
                evidence_introduced=evidence_introduced,
            )
            if cfg.arm == "pilot":
                raw_positions = list(polled["final_positions"])
                positions = [parse_position(p) for p in raw_positions]
                rendered = build_options(question, cfg.seed, qid)
                block = _pilot_block(
                    question, positions, cfg, rendered, raw_positions=raw_positions
                )
                record["pilot"] = block
                record["trust_trajectory"] = [[1.0 / len(positions)] * len(positions), block["trust"]]
                record["final_trust"] = block["trust"]
                # The pilot's reported answer is its trust-weighted aggregation.
                final_answer = block["weighted"] or block["majority"] or ""
                score = score_answer(final_answer, question.get("answer") or "", rendered)
                record["final_answer"] = score.parsed or final_answer
                record["final_answer_correct"] = score.correct
                record["final_answer_source"] = "weighted" if block["weighted"] else "majority"
                record["parsed_answer"] = score.parsed
                record["trust_for_positions"] = block["trust"]

        errors = validate_record(record)
        if errors:
            raise ValueError(f"{qid}: invalid schema-v2 record: {'; '.join(errors)}")
        _append_record(path, record)
        _write_routes(cfg, probe)
        print(f"[{index + 1}/{len(questions)}] {qid} {record['elapsed_s']:6.1f}s", flush=True)

    records = read_records(path)
    _check_record_hashes(records, run_hash)
    summary = summarize(records)
    summary_path = _write_summary(cfg, summary, records, run_hash, manifest_path)
    print(f"summary: {summary_path}  {summary.as_dict()}")
    return summary
