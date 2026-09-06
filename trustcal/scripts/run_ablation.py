"""Runs a named experiment config (baseline / ablation / dataset × seed)."""

from __future__ import annotations

import argparse


def main() -> None:
    parser = argparse.ArgumentParser(description="Run a named experiment")
    parser.add_argument("--experiment", required=True, help="B1-B10 or ablation id")
    parser.add_argument("--dataset", default="gpqa")
    parser.add_argument("--seed", type=int, default=1)
    parser.add_argument("--limit", type=int, default=50)
    parser.parse_args()
    raise NotImplementedError("Ph 1-3: experiment runner (config → results/run dir)")


if __name__ == "__main__":
    main()
