"""Model-swap smoke test — roadmap §13 step 11.

Cheap insurance before the Final matrix: run a small B8 subset on the rented
stack and assert the things that break silently on a model swap — claim tags,
trust trajectories, K-round completion, and (optionally) injection delivery.

This is not a results run. It writes to ``results/smoke/`` and exits nonzero on
any failed check so a bad stack never reaches the matrix.
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from trustcal.eval.smoke import check_records
from trustcal.preflight import format_report, run_preflight
from trustcal.runner import RunConfig, read_records, records_path, run


def main() -> int:
    parser = argparse.ArgumentParser(description="Model-swap smoke test on a small subset")
    parser.add_argument("--config", default="configs/models.yaml")
    parser.add_argument("--phase", choices=["dev", "final"], default="final")
    parser.add_argument("--dataset", default="gpqa")
    parser.add_argument("--limit", type=int, default=20)
    parser.add_argument("--rounds", type=int, default=3)
    parser.add_argument("--arm", default="B8", choices=["B8", "injection"])
    parser.add_argument("--questions-file", default=None)
    parser.add_argument("--out", default="results/smoke")
    parser.add_argument("--skip-preflight", action="store_true")
    args = parser.parse_args()

    if not args.skip_preflight:
        report = run_preflight(model_config=args.config, phase=args.phase)
        print(format_report(report))
        if not all(check.ok for check in report):
            return 1

    cfg = RunConfig(
        arm=args.arm,
        dataset=args.dataset,
        limit=args.limit,
        seed=1,
        rounds=args.rounds,
        out_root=Path(args.out),
        model_config=args.config,
        phase=args.phase,
        questions_file=Path(args.questions_file) if args.questions_file else None,
    )
    print(f"running {cfg.arm} on {cfg.limit} items ({cfg.phase} stack)...", flush=True)
    run(cfg)

    records = read_records(records_path(cfg))
    failures = check_records(records, args.rounds, require_injection=args.arm == "injection")
    if failures:
        print("SMOKE TEST: FAIL")
        for failure in failures:
            print(f"  - {failure}")
        return 1
    print(f"SMOKE TEST: PASS ({len(records)} records, {args.rounds} rounds, arm {args.arm})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
