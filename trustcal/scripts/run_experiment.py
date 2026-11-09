"""CLI: run one experiment arm (B1-B10, pilot, or injection).

    python scripts/run_experiment.py --arm B3 --dataset gpqa --limit 10 --seed 1
    python scripts/run_experiment.py --arm B8 --phase final --limit 50
    python scripts/run_experiment.py --arm pilot --questions-file experiments/pilot-month1/questions.json
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from trustcal.config import PHASES, agents_for_phase, default_phase, load_models  # noqa: E402
from trustcal.runner import ARMS, RunConfig, run  # noqa: E402


def main() -> None:
    parser = argparse.ArgumentParser(description="Run an experiment arm")
    parser.add_argument("--arm", required=True, choices=ARMS, help="B1-B10, pilot, or injection")
    parser.add_argument("--dataset", default="gpqa")
    parser.add_argument("--limit", type=int, default=10)
    parser.add_argument("--seed", type=int, default=1)
    parser.add_argument("--rounds", type=int, default=3)
    parser.add_argument("--out", default="results")
    parser.add_argument("--config", default="configs/models.yaml")
    parser.add_argument("--phase", choices=PHASES, default=default_phase())
    parser.add_argument("--questions-file", default=None, help="local JSON question list instead of the HF dataset")
    parser.add_argument("--alpha", type=float, default=0.5)
    parser.add_argument("--beta", type=float, default=0.3)
    parser.add_argument("--samples", type=int, default=5, help="B5 self-consistency samples")
    parser.add_argument("--layers", type=int, default=2, help="B6 MoA layers")
    parser.add_argument("--agents", type=int, default=3, help="panel size for N-scaling (2, 3, or 5)")
    parser.add_argument("--no-trust", action="store_true", help="ablation: majority vote instead of trust weighting")
    parser.add_argument("--no-partition", action="store_true", help="ablation: every agent sees every source")
    parser.add_argument("--no-progressive", action="store_true", help="ablation: full retrieval depth from round 1")
    parser.add_argument("--no-adaptive", action="store_true", help="ablation: update trust every round, even on unanimous panels")
    parser.add_argument(
        "--placebo-mode",
        choices=["off", "shuffle_verdicts"],
        default="off",
        help="WP-18: shuffle verdicts within each agent-round unit (requires --arm B8 and trust)",
    )
    parser.add_argument(
        "--placebo-unit",
        choices=["round_pool", "agent_round"],
        default="round_pool",
        help="WP-18 placebo unit: cross-agent round pool (Full default) or per-agent manipulation check",
    )
    parser.add_argument(
        "--oracle-mode",
        choices=["off", "gold_answer", "gold_evidence"],
        default="off",
        help="WP-18: gold-answer trust or gold-evidence substitution (requires --arm B8 and trust)",
    )
    parser.add_argument(
        "--inject",
        action="store_true",
        help="deliver fabricated-consensus pressure (B8+injection; B3+injection is the no-retrieval baseline)",
    )
    parser.add_argument(
        "--injection-scope",
        choices=["minority", "all"],
        default="minority",
        help="who receives the injected consensus (default: minority)",
    )
    args = parser.parse_args()

    stack = " / ".join(a.model for a in agents_for_phase(load_models(args.config), args.phase))
    print(f"phase={args.phase} stack={stack}")

    cfg = RunConfig(
        arm=args.arm,
        dataset=args.dataset,
        limit=args.limit,
        seed=args.seed,
        rounds=args.rounds,
        out_root=Path(args.out),
        model_config=args.config,
        questions_file=Path(args.questions_file) if args.questions_file else None,
        phase=args.phase,
        alpha=args.alpha,
        beta=args.beta,
        samples=args.samples,
        layers=args.layers,
        agents=args.agents,
        use_trust=not args.no_trust,
        source_partitioning=not args.no_partition,
        progressive_retrieval=not args.no_progressive,
        adaptive_triggering=not args.no_adaptive,
        inject=args.inject,
        injection_scope=args.injection_scope,
        placebo_mode=args.placebo_mode,
        placebo_unit=args.placebo_unit,
        oracle_mode=args.oracle_mode,
    )
    summary = run(cfg)
    print(summary.as_dict())


if __name__ == "__main__":
    main()
