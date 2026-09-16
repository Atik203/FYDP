"""CLI for the injection-protocol κ check.

    python scripts/annotate.py make  --records results/B3/gpqa/seed1/records.jsonl --out results/annotation
    python scripts/annotate.py score --rater1 results/annotation/rater1.csv --rater2 results/annotation/rater2.csv

`score` exits 2 when κ < --min-kappa (Gate 1 requires ≥ 0.75).
"""

from __future__ import annotations

import argparse
import math
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from trustcal.eval.annotation import sample_items, score_sheets, write_sheets  # noqa: E402
from trustcal.runner import read_records  # noqa: E402


def main() -> None:
    parser = argparse.ArgumentParser(description="Injection-protocol annotation tooling")
    sub = parser.add_subparsers(dest="cmd", required=True)

    make = sub.add_parser("make", help="build rater sheets from a run's records")
    make.add_argument("--records", required=True)
    make.add_argument("--out", default="results/annotation")
    make.add_argument("--n-divergent", type=int, default=30)
    make.add_argument("--n-control", type=int, default=10)
    make.add_argument("--seed", type=int, default=0)

    score = sub.add_parser("score", help="compute kappa from two filled-in sheets")
    score.add_argument("--rater1", required=True)
    score.add_argument("--rater2", required=True)
    score.add_argument("--min-kappa", type=float, default=0.75)

    args = parser.parse_args()

    if args.cmd == "make":
        records = read_records(Path(args.records))
        items = sample_items(records, args.n_divergent, args.n_control, args.seed)
        if not items:
            print("no records to sample — run the B3 arm first")
            sys.exit(1)
        paths = write_sheets(items, Path(args.out))
        eligible = sum(1 for i in items if i["truth_eligible"])
        print(f"wrote {len(items)} items ({eligible} divergent) to {', '.join(str(p) for p in paths)}")
        return

    report = score_sheets(Path(args.rater1), Path(args.rater2))
    print(f"n={report['n']} agree={report['agree']} po={report['observed_agreement']} kappa={report['kappa']}")
    if "answer_type" in report:
        print(f"answer_type kappa={report['answer_type']['kappa']}")
    kappa = report["kappa"]
    if math.isnan(kappa) or kappa < args.min_kappa:
        print(f"FAIL: kappa {kappa} < {args.min_kappa} — fix the rubric and re-label")
        sys.exit(2)
    print(f"PASS: kappa {kappa} >= {args.min_kappa}")


if __name__ == "__main__":
    main()
