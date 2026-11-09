"""Model-swap smoke test — roadmap §13 step 11.

Cheap insurance before the Final matrix: run a small B8 subset on the rented
stack and assert the things that break silently on a model swap — claim tags,
trust trajectories, K-round completion, and (optionally) injection delivery.

WP-18 adds ``B8-placebo`` and ``B8-oracle`` choices. The placebo check asserts
the permutation changed at least one assignment, preserved the verdict multiset
and claim count, and carries a reproducible hash plus any no-op reason. The
oracle check asserts the mode, gold source, applied rounds, and a non-null
trust trajectory.

This is not a results run. It writes to ``results/smoke/`` and exits nonzero on
any failed check so a bad stack never reaches the matrix.
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from trustcal.config import PHASES
from trustcal.eval.smoke import check_records
from trustcal.orchestrator import (
    DEFAULT_PLACEBO_UNIT,
    ORACLE_MODES,
    PLACEBO_MODES,
    PLACEBO_UNITS,
    check_oracle_records,
    check_placebo_records,
)
from trustcal.preflight import format_report, run_preflight
from trustcal.runner import RunConfig, read_records, records_path, run

SMOKE_ARMS = ("B8", "injection", "B8-placebo", "B8-oracle")


def _resolve_modes(arm: str, placebo_mode: str, oracle_mode: str) -> tuple[str, str]:
    """Map a smoke choice to the two WP-18 flags without ambiguous combinations."""
    if placebo_mode not in PLACEBO_MODES:
        raise ValueError(
            f"unknown placebo_mode {placebo_mode!r}; expected one of {PLACEBO_MODES}"
        )
    if oracle_mode not in ORACLE_MODES:
        raise ValueError(
            f"unknown oracle_mode {oracle_mode!r}; expected one of {ORACLE_MODES}"
        )

    if arm == "B8-placebo":
        if oracle_mode != "off":
            raise ValueError("--arm B8-placebo cannot also set --oracle-mode")
        placebo_mode = "shuffle_verdicts"
    elif arm == "B8-oracle":
        if placebo_mode != "off":
            raise ValueError("--arm B8-oracle cannot also set --placebo-mode")
        if oracle_mode == "off":
            oracle_mode = "gold_answer"
    elif arm == "injection":
        if placebo_mode != "off" or oracle_mode != "off":
            raise ValueError("the injection smoke path does not take WP-18 mode flags")
    elif arm != "B8":
        raise ValueError(f"unknown smoke arm {arm!r}; expected one of {SMOKE_ARMS}")

    if placebo_mode != "off" and oracle_mode != "off":
        raise ValueError("placebo and oracle smoke modes are mutually exclusive")
    return placebo_mode, oracle_mode


def main() -> int:
    parser = argparse.ArgumentParser(description="Model-swap smoke test on a small subset")
    parser.add_argument("--config", default="configs/models.yaml")
    parser.add_argument("--phase", choices=PHASES, default="final")
    parser.add_argument("--dataset", default="gpqa")
    parser.add_argument("--limit", type=int, default=20)
    parser.add_argument("--rounds", type=int, default=3)
    parser.add_argument("--arm", default="B8", choices=SMOKE_ARMS)
    parser.add_argument(
        "--placebo-mode",
        choices=PLACEBO_MODES,
        default="off",
        help="explicit WP-18 placebo flag (B8 only)",
    )
    parser.add_argument(
        "--placebo-unit",
        choices=PLACEBO_UNITS,
        default=DEFAULT_PLACEBO_UNIT,
        help="WP-18 placebo unit (round_pool is the Full default)",
    )
    parser.add_argument(
        "--oracle-mode",
        choices=ORACLE_MODES,
        default="off",
        help="explicit WP-18 oracle flag (B8 only)",
    )
    parser.add_argument("--questions-file", default=None)
    parser.add_argument("--out", default="results/smoke")
    parser.add_argument("--skip-preflight", action="store_true")
    args = parser.parse_args()

    try:
        placebo_mode, oracle_mode = _resolve_modes(
            args.arm, args.placebo_mode, args.oracle_mode
        )
    except ValueError as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 1

    if not args.skip_preflight:
        report = run_preflight(model_config=args.config, phase=args.phase)
        print(format_report(report))
        if not all(check.ok for check in report):
            return 1

    runner_arm = "injection" if args.arm == "injection" else "B8"
    try:
        cfg = RunConfig(
            arm=runner_arm,
            dataset=args.dataset,
            limit=args.limit,
            seed=1,
            rounds=args.rounds,
            out_root=Path(args.out),
            model_config=args.config,
            phase=args.phase,
            questions_file=Path(args.questions_file) if args.questions_file else None,
            placebo_mode=placebo_mode,
            placebo_unit=args.placebo_unit,
            oracle_mode=oracle_mode,
        )
    except ValueError as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 1

    label = args.arm
    if placebo_mode != "off":
        label += f" ({placebo_mode})"
    if oracle_mode != "off":
        label += f" ({oracle_mode})"
    print(f"running {label} on {cfg.limit} items ({cfg.phase} stack)...", flush=True)
    run(cfg)

    records = read_records(records_path(cfg))
    failures = check_records(
        records, args.rounds, require_injection=args.arm == "injection"
    )
    if placebo_mode != "off":
        failures.extend(check_placebo_records(records))
    if oracle_mode != "off":
        failures.extend(check_oracle_records(records))
    if failures:
        print("SMOKE TEST: FAIL")
        for failure in failures:
            print(f"  - {failure}")
        return 1
    print(f"SMOKE TEST: PASS ({len(records)} records, {args.rounds} rounds, {label})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
