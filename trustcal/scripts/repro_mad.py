"""Gate 0 — vanilla MAD reproduction (Du et al. 2023) on a GPQA slice.

Validates the base debate loop independent of our contributions.
"""

from __future__ import annotations

import argparse

from trustcal.config import load_models
from trustcal.eval.datasets import load_dataset
from trustcal.inference import vllm_clients
from trustcal.orchestrator import DebateRunner


def main() -> None:
    parser = argparse.ArgumentParser(description="Gate 0: reproduce vanilla MAD on GPQA")
    parser.add_argument("--config", default="configs/models.yaml")
    parser.add_argument("--limit", type=int, default=10)
    args = parser.parse_args()

    cfg = load_models(args.config)
    clients = vllm_clients(cfg)
    runner = DebateRunner(clients=clients, rounds=cfg.rounds)

    questions = load_dataset("gpqa", sample_cap=args.limit)
    for q in questions[: args.limit]:
        result = runner.run(q["question"])
        print(result["final_positions"][0][:200])


if __name__ == "__main__":
    main()
