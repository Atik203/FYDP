"""Experiment runner — resumable, crash-safe, GPU-free-testable.

Arms (Phase 1): ``B1`` single-agent CoT, ``B3`` vanilla MAD. The injection arm is
added in its own step and reuses this runner unchanged.

Crash safety contract: every finished debate is appended to ``records.jsonl``
immediately; re-running the same config skips completed question ids. A killed
session therefore costs at most one question of GPU time.
"""

from __future__ import annotations

import json
import time
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path

from .agents import AGENT_INITIAL, AGENT_SYSTEM, parse_position
from .config import load_models
from .eval import load_dataset, summarize
from .eval.metrics import MetricSummary
from .inference import VLLMClient, vllm_clients
from .orchestrator import DebateRunner

ARMS = ("B1", "B3", "injection")


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

    def __post_init__(self) -> None:
        if self.arm not in ARMS:
            raise ValueError(f"unknown arm {self.arm!r}; expected one of {ARMS}")
        self.out_root = Path(self.out_root)


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
    """Debate arms — parsed answers per round, raw transcript, injection audit."""
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
    return record


def _write_summary(cfg: RunConfig, summary: MetricSummary) -> Path:
    stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    out = run_dir(cfg)
    out.mkdir(parents=True, exist_ok=True)
    payload = {"arm": cfg.arm, "dataset": cfg.dataset, "seed": cfg.seed, "stamp": stamp, **summary.as_dict()}
    (out / "summary.json").write_text(json.dumps(payload, indent=2), encoding="utf-8")

    lines = [
        f"# {cfg.arm} — {cfg.dataset} (seed {cfg.seed})",
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
    path = out / f"summary-{stamp}.md"
    path.write_text("\n".join(lines) + "\n", encoding="utf-8")
    return path


def run(
    cfg: RunConfig,
    clients: list[VLLMClient] | None = None,
    questions: list[dict] | None = None,
) -> MetricSummary:
    """Run (or resume) an arm and return the pooled metric summary."""
    if clients is None:
        model_cfg = load_models(cfg.model_config)
        clients = vllm_clients(model_cfg, seed=cfg.seed)
        rounds = model_cfg.rounds
    else:
        rounds = cfg.rounds
    if questions is None:
        questions = load_dataset(cfg.dataset, sample_cap=cfg.limit)[: cfg.limit]

    path = records_path(cfg)
    done = {r["question_id"] for r in read_records(path)}
    runner = DebateRunner(
        clients=clients,
        rounds=rounds,
        injection_scope="minority" if cfg.arm == "injection" else None,
    )

    for index, question in enumerate(questions):
        qid = f"{cfg.dataset}-{index:04d}"
        if qid in done:
            continue
        if cfg.arm == "B1":
            record = single_agent_record(qid, question, clients[0], cfg.arm, cfg.seed)
        else:
            t0 = time.perf_counter()
            result = runner.run(question["question"], options=question.get("options"))
            record = debate_record(qid, question, result, cfg.arm, cfg.seed, time.perf_counter() - t0)
        _append_record(path, record)
        print(f"[{index + 1}/{len(questions)}] {qid} {record['elapsed_s']:6.1f}s", flush=True)

    summary = summarize(read_records(path))
    summary_path = _write_summary(cfg, summary)
    print(f"summary: {summary_path}  {summary.as_dict()}")
    return summary
