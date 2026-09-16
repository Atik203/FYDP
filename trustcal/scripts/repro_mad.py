"""Gate 0 — vanilla MAD reproduction (Du et al. 2023) on a GPQA slice.

Validates the base debate loop independent of our contributions. Writes the
reproduction log the roadmap's Phase 0 done-criteria require:
    results/gate0/transcript-<UTC stamp>.json
    results/gate0/summary-<UTC stamp>.md
"""

from __future__ import annotations

import argparse
import json
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

from trustcal.config import load_models
from trustcal.eval.datasets import load_dataset
from trustcal.inference import vllm_clients
from trustcal.orchestrator import DebateRunner


def _first_line(text: str) -> str:
    return next((ln.strip() for ln in text.splitlines() if ln.strip()), "")


def _write_summary(out_dir: Path, stamp: str, args: argparse.Namespace, rounds: int, runs: list[dict]) -> Path:
    total = sum(r["elapsed_s"] for r in runs)
    rounds_ok = sum(1 for r in runs if r["rounds_completed"] == rounds)
    empty = [r["question_index"] for r in runs if not any(p.strip() for p in r["final_positions"])]
    lines = [
        f"# Gate 0 — vanilla MAD reproduction ({stamp})",
        "",
        f"- dataset: `{args.dataset}` · questions: {len(runs)} · rounds: {rounds}",
        f"- total: {total:.1f}s · mean: {total / max(len(runs), 1):.1f}s/debate",
        f"- rounds completed on every debate: {rounds_ok}/{len(runs)} {'PASS' if rounds_ok == len(runs) else 'FAIL'}",
        f"- debates with empty final positions: {', '.join(map(str, empty)) or 'none'}",
        "",
        "Gate 0 passes when every debate ran all rounds and every agent produced a",
        "non-empty position; coherence is judged from the transcripts by hand.",
        "",
        "## Per-question",
        "",
        "| # | seconds | agent1 first line |",
        "| --- | --- | --- |",
    ]
    for r in runs:
        first = _first_line(r["final_positions"][0]).replace("|", "/")
        lines.append(f"| {r['question_index']} | {r['elapsed_s']} | {first[:120]} |")
    lines.append("")
    path = out_dir / f"summary-{stamp}.md"
    path.write_text("\n".join(lines), encoding="utf-8")
    return path


def main() -> None:
    # Progress must be visible in nohup logs while the run is in flight.
    sys.stdout.reconfigure(line_buffering=True)

    parser = argparse.ArgumentParser(description="Gate 0: reproduce vanilla MAD on GPQA")
    parser.add_argument("--config", default="configs/models.yaml")
    parser.add_argument("--dataset", default="gpqa")
    parser.add_argument("--limit", type=int, default=10)
    parser.add_argument("--out", default="results/gate0")
    args = parser.parse_args()

    cfg = load_models(args.config)
    clients = vllm_clients(cfg)
    runner = DebateRunner(clients=clients, rounds=cfg.rounds)

    questions = load_dataset(args.dataset, sample_cap=args.limit)[: args.limit]
    out_dir = Path(args.out)
    out_dir.mkdir(parents=True, exist_ok=True)

    runs: list[dict] = []
    for n, q in enumerate(questions, start=1):
        t0 = time.perf_counter()
        result = runner.run(q["question"])
        result["elapsed_s"] = round(time.perf_counter() - t0, 2)
        result["question_index"] = n
        result["gold_answer"] = q.get("answer")
        runs.append(result)
        print(f"[{n}/{len(questions)}] {result['elapsed_s']:7.1f}s  agent1: {_first_line(result['final_positions'][0])[:100]}")

    stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    payload = {
        "gate": 0,
        "stamp": stamp,
        "dataset": args.dataset,
        "limit": args.limit,
        "rounds": cfg.rounds,
        "models": [a.model for a in cfg.agents],
        "runs": runs,
    }
    transcript_path = out_dir / f"transcript-{stamp}.json"
    transcript_path.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")
    summary_path = _write_summary(out_dir, stamp, args, cfg.rounds, runs)
    print(f"\nwrote {transcript_path}")
    print(f"wrote {summary_path}")


if __name__ == "__main__":
    main()
