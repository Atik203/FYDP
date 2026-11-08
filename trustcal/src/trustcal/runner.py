"""Experiment runner — resumable, crash-safe, GPU-free-testable.

Arms: B1–B10, the Month-1 ``pilot`` harness, and the ``injection`` stress test.
Every arm returns the same result package, so metrics, failure taxonomy, and
summary files are computed once.

Crash safety contract: every finished debate is appended to ``records.jsonl``
immediately; re-running the same config skips completed question ids. A killed
session therefore costs at most one question of GPU time.
"""

from __future__ import annotations

import json
import time
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path

import numpy as np

from .agents import AGENT_INITIAL, AGENT_SYSTEM, parse_position
from .config import PHASES, default_phase, load_models, rounds_for_phase
from .eval import load_dataset, summarize
from .eval.baselines import RUNNER_ARMS
from .eval.failures import failure_counts
from .eval.metrics import MetricSummary
from .eval.pilot import score_pilot
from .inference import VLLMClient, vllm_clients
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
from .trust import TrustConfig, aggregate
from .trust.update import update_trust

ARMS = RUNNER_ARMS


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


def _base_record(qid: str, question: dict, arm: str, seed: int) -> dict:
    return {
        "question_id": qid,
        "arm": arm,
        "seed": seed,
        "question": question["question"],
        "gold": question.get("answer"),
        "options": question.get("options"),
    }


def single_agent_record(qid: str, question: dict, client: VLLMClient, arm: str, seed: int) -> dict:
    """B1 — one agent, one call, no debate."""
    record = _base_record(qid, question, arm, seed)
    t0 = time.perf_counter()
    text = client.complete(AGENT_SYSTEM, AGENT_INITIAL.format(agent_id=1, question=question["question"]))
    record["elapsed_s"] = round(time.perf_counter() - t0, 2)
    record["transcript"] = [{"round": 1, "positions": [text]}]
    record["rounds"] = [{"answers": [parse_position(text)]}]
    return record


def debate_record(qid: str, question: dict, result: dict, arm: str, seed: int, elapsed_s: float) -> dict:
    """Debate arms — parsed answers per round, raw transcript, trust/evidence audit."""
    record = _base_record(qid, question, arm, seed)
    record["elapsed_s"] = round(elapsed_s, 2)
    record["rounds_completed"] = result.get("rounds_completed")
    record["transcript"] = result["transcript"]
    record["rounds"] = [
        {"answers": [parse_position(p) for p in entry["positions"]]} for entry in result["transcript"]
    ]
    injection = result.get("injection")
    record["injection"] = injection
    if injection and injection.get("eligible"):
        record["consensus"] = injection.get("consensus")
        record["targets"] = injection.get("targets")
    if result.get("trust_trajectory") is not None:
        record["trust_trajectory"] = result["trust_trajectory"]
        record["final_trust"] = result.get("final_trust")
    for key in ("verdicts", "evidence", "aggregation"):
        if key in result:
            record[key] = result[key]
    for key in ("imad", "consensagent"):
        if key in result:
            record[key] = result[key]
    return record


def oracle_record(qid: str, question: dict, oracle, arm: str, seed: int) -> dict:
    """B7 — external oracle answer, no panel."""
    record = _base_record(qid, question, arm, seed)
    t0 = time.perf_counter()
    text = oracle.answer(question["question"])
    record["elapsed_s"] = round(time.perf_counter() - t0, 2)
    record["transcript"] = [{"round": 1, "positions": [text]}]
    record["rounds"] = [{"answers": [parse_position(text)]}]
    record["oracle"] = {"model": getattr(oracle, "model", None)}
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
) -> dict:
    """Trust-weighted vs majority aggregation for one pilot question."""
    n = len(positions)
    support, harm = _question_verdicts(question, n, positions)
    uniform = [1.0 / n] * n
    trust = update_trust(
        np.asarray(uniform),
        np.asarray(support),
        np.asarray(harm),
        alpha=cfg.alpha,
        beta=cfg.beta,
    )
    result = aggregate(trust, positions, question.get("options"))
    majority_correct = bool(result["majority"]) and _is_gold(result["majority"], question)
    weighted_correct = bool(result["weighted"]) and _is_gold(result["weighted"], question)
    return {
        "majority": result["majority"],
        "weighted": result["weighted"],
        "changed": result["changed"],
        "toward_gold": weighted_correct and not majority_correct,
        "away_from_gold": majority_correct and not weighted_correct,
        "support": support,
        "harm": harm,
        "trust": trust.tolist(),
    }


def _is_gold(answer: str, question: dict) -> bool:
    from .eval.answers import is_correct

    return is_correct(answer, question.get("answer", ""), question.get("options"))


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


def _make_runner(cfg: RunConfig, clients: list, rounds: int, retriever: Retriever | None = None, injection: bool = False) -> DebateRunner:
    return DebateRunner(
        clients=clients,
        rounds=rounds,
        retriever=retriever,
        injection_scope="minority" if injection else None,
        trust_config=cfg.trust_config(),
    )


def _write_summary(cfg: RunConfig, summary: MetricSummary, records: list[dict]) -> Path:
    stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    out = run_dir(cfg)
    out.mkdir(parents=True, exist_ok=True)
    payload = {
        "arm": cfg.arm,
        "dataset": cfg.dataset,
        "seed": cfg.seed,
        "phase": cfg.phase,
        "stamp": stamp,
        **summary.as_dict(),
        "failures": failure_counts(records),
    }
    if any("pilot" in r for r in records):
        payload["pilot"] = score_pilot(records)
    (out / "summary.json").write_text(json.dumps(payload, indent=2), encoding="utf-8")

    lines = [
        f"# {cfg.arm} — {cfg.dataset} (seed {cfg.seed}, phase {cfg.phase})",
        "",
        f"- debates: {summary.n_debates} · divergent: {summary.n_divergent}",
        f"- CCR: {summary.ccr:.3f} ({summary.n_collapse}/{summary.n_exposed} exposed agents)",
        f"- MPR: {summary.mpr:.3f} ({summary.n_divergent} divergent debates)",
        f"- switches to injected consensus: {summary.n_switched_to_consensus}",
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
    """Questions from a local JSON file when configured, else the HF dataset."""
    if cfg.questions_file:
        data = json.loads(Path(cfg.questions_file).read_text(encoding="utf-8"))
        return data[: cfg.limit]
    return load_dataset(cfg.dataset, sample_cap=cfg.limit)[: cfg.limit]


def run(
    cfg: RunConfig,
    clients: list[VLLMClient] | None = None,
    questions: list[dict] | None = None,
    oracle=None,
    rewriter=None,
) -> MetricSummary:
    """Run (or resume) an arm and return the pooled metric summary."""
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

    path = records_path(cfg)
    done = {r["question_id"] for r in read_records(path)}
    retriever = None
    if cfg.arm in ("B2", "B4"):
        retriever = _retriever(cfg, partition=False)
    elif cfg.arm == "B8":
        retriever = _retriever(cfg)

    for index, question in enumerate(questions):
        qid = f"{cfg.dataset}-{index:04d}"
        if qid in done:
            continue
        t0 = time.perf_counter()
        polled = None

        if cfg.arm == "B1":
            record = single_agent_record(qid, question, clients[0], cfg.arm, cfg.seed)
        elif cfg.arm == "B2":
            polled = run_single_rag(question, clients[0], retriever)
        elif cfg.arm == "B3":
            polled = _make_runner(cfg, clients, rounds).run(question["question"], question.get("options"))
        elif cfg.arm == "B4":
            polled = run_b4_rag_mad(question, clients, rounds, retriever)
        elif cfg.arm == "B5":
            polled = run_self_consistency(question, clients[0], samples=cfg.samples)
        elif cfg.arm == "B6":
            polled = run_moa(question, clients, layers=cfg.layers)
        elif cfg.arm == "B7":
            if oracle is None:
                from .eval.oracle import GeminiOracle

                oracle = GeminiOracle()
            record = oracle_record(qid, question, oracle, cfg.arm, cfg.seed)
        elif cfg.arm == "B8":
            polled = _make_runner(cfg, clients, rounds, retriever=retriever).run(
                question["question"], question.get("options")
            )
        elif cfg.arm == "B9":
            polled = run_imad(question, clients, rounds=rounds)
        elif cfg.arm == "B10":
            polled = run_consensagent(question, clients, rounds=rounds, rewriter=rewriter)
        elif cfg.arm == "pilot":
            # Phase 1 criterion: debate positions unweighted, then compare the
            # same positions under trust-weighted aggregation.
            polled = _make_runner(cfg, clients, rounds).run(
                question["question"], question.get("options")
            )
        else:  # injection
            polled = _make_runner(cfg, clients, rounds, injection=True).run(
                question["question"], question.get("options")
            )

        if polled is not None:
            record = debate_record(qid, question, polled, cfg.arm, cfg.seed, time.perf_counter() - t0)
            if cfg.arm == "pilot":
                positions = [parse_position(p) for p in polled["final_positions"]]
                block = _pilot_block(question, positions, cfg)
                record["pilot"] = block
                record["trust_trajectory"] = [[1.0 / len(positions)] * len(positions), block["trust"]]
                record["final_trust"] = block["trust"]

        _append_record(path, record)
        print(f"[{index + 1}/{len(questions)}] {qid} {record['elapsed_s']:6.1f}s", flush=True)

    records = read_records(path)
    summary = summarize(records)
    summary_path = _write_summary(cfg, summary, records)
    print(f"summary: {summary_path}  {summary.as_dict()}")
    return summary
