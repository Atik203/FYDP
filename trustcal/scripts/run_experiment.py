"""CLI: run a named experiment arm (B1/B3 now; injection arm joins in Phase 1).

    python scripts/run_experiment.py --arm B3 --dataset gpqa --limit 10 --seed 1
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from trustcal.runner import ARMS, RunConfig, run  # noqa: E402


def main() -> None:
    parser = argparse.ArgumentParser(description="Run an experiment arm")
    parser.add_argument("--arm", required=True, choices=ARMS, help="B1 single-agent, B3 vanilla MAD")
    parser.add_argument("--dataset", default="gpqa")
    parser.add_argument("--limit", type=int, default=10)
    parser.add_argument("--seed", type=int, default=1)
    parser.add_argument("--rounds", type=int, default=3)
    parser.add_argument("--out", default="results")
    parser.add_argument("--config", default="configs/models.yaml")
    parser.add_argument("--questions-file", default=None, help="local JSON question list instead of the HF dataset")
    args = parser.parse_args()

    cfg = RunConfig(
        arm=args.arm,
        dataset=args.dataset,
        limit=args.limit,
        seed=args.seed,
        rounds=args.rounds,
        out_root=Path(args.out),
        model_config=args.config,
        questions_file=Path(args.questions_file) if args.questions_file else None,
    )
    summary = run(cfg)
    print(summary.as_dict())


if __name__ == "__main__":
    main()
