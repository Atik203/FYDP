"""Human-evaluation tooling for factual grounding of final answers.

    python scripts/human_eval.py make  --records results/B3/gpqa/seed1/records.jsonl --out results/human_eval --n 60
    python scripts/human_eval.py score --rater1 results/human_eval/sheet_rater1.csv --rater2 results/human_eval/sheet_rater2.csv

`make` samples records deterministically (``--seed``) and writes two blinded
sheet copies whose rating columns are blank. `score` reports mean/SD per Likert
dimension and nominal Cohen's kappa for ``factual_grounding``; it exits 2 when
kappa < ``--min-kappa`` (same gate convention as scripts/annotate.py).
"""

from __future__ import annotations

import argparse
import csv
import math
import random
import statistics
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from trustcal.eval import majority_answer  # noqa: E402
from trustcal.eval.agreement import agreement_report  # noqa: E402
from trustcal.runner import read_records  # noqa: E402

SHEET_FIELDS = [
    "question_id",
    "arm",
    "question",
    "answer",
    "gold",
    "factual_grounding",
    "hallucination_severity",
    "notes",
]
RATING_COLUMNS = ("factual_grounding", "hallucination_severity")


def _question_text(record: dict) -> str:
    """Question plus a lettered option list so bare-letter answers stay judgeable."""
    question = str(record.get("question") or "").strip()
    options = record.get("options")
    if isinstance(options, list) and options:
        lines = [f"{chr(ord('A') + i)}. {option}" for i, option in enumerate(options)]
        question = f"{question}\n\nOptions:\n" + "\n".join(lines)
    return question


def _final_answer(record: dict) -> str:
    """The system output a rater should grade: trust-weighted winner, else majority."""
    aggregation = record.get("aggregation")
    if isinstance(aggregation, dict):
        for key in ("weighted", "majority"):
            value = aggregation.get(key)
            if value:
                return str(value)
    rounds = record.get("rounds") or []
    if rounds and isinstance(rounds[-1], dict):
        answers = [str(answer) for answer in (rounds[-1].get("answers") or []) if answer]
        if answers:
            majority, _ = majority_answer(answers, record.get("options"))
            return majority or answers[0]
    return ""


def _row(record: dict) -> dict:
    return {
        "question_id": str(record.get("question_id") or ""),
        "arm": str(record.get("arm") or ""),
        "question": _question_text(record),
        "answer": _final_answer(record),
        "gold": str(record.get("gold") or ""),
        "factual_grounding": "",
        "hallucination_severity": "",
        "notes": "",
    }


def write_sheets(rows: list[dict], out_dir: Path) -> list[Path]:
    """Write sheet_rater1.csv and sheet_rater2.csv (rating columns left blank)."""
    out_dir.mkdir(parents=True, exist_ok=True)
    paths = []
    for rater in ("rater1", "rater2"):
        path = out_dir / f"sheet_{rater}.csv"
        with path.open("w", newline="", encoding="utf-8") as fh:
            writer = csv.DictWriter(fh, fieldnames=SHEET_FIELDS)
            writer.writeheader()
            writer.writerows(rows)
        paths.append(path)
    return paths


def _read_sheet(path: Path) -> list[dict]:
    with path.open(newline="", encoding="utf-8") as fh:
        reader = csv.DictReader(fh)
        rows = list(reader)
        fields = list(reader.fieldnames or [])
    missing = [column for column in ("question_id",) + RATING_COLUMNS if column not in fields]
    if missing:
        raise ValueError(f"{path}: missing column(s) {', '.join(missing)}")
    return rows


def _rating(row: dict, column: str, rater: str, row_number: int) -> float:
    raw = (row.get(column) or "").strip()
    if not raw:
        raise ValueError(f"{rater} row {row_number}: missing {column}")
    try:
        value = float(raw)
    except ValueError:
        raise ValueError(f"{rater} row {row_number}: {column}={raw!r} is not numeric") from None
    if not math.isfinite(value):
        raise ValueError(f"{rater} row {row_number}: {column}={raw!r} is not finite")
    return value


def _mean_sd(values: list[float]) -> tuple[float, float, int]:
    """Mean and population SD, matching trustcal.eval.stats.summarize."""
    if not values:
        return 0.0, 0.0, 0
    return statistics.mean(values), statistics.pstdev(values), len(values)


def score_sheets(rater1: Path, rater2: Path) -> dict:
    """Per-rater means/SDs plus nominal kappa on factual_grounding labels."""
    sheets = {"rater1": _read_sheet(rater1), "rater2": _read_sheet(rater2)}
    rows1, rows2 = sheets["rater1"], sheets["rater2"]
    if len(rows1) != len(rows2):
        raise ValueError(f"sheet row counts differ: {len(rows1)} vs {len(rows2)}")

    for number, (row1, row2) in enumerate(zip(rows1, rows2), start=1):
        id1 = (row1.get("question_id") or "").strip()
        id2 = (row2.get("question_id") or "").strip()
        if id1 != id2:
            raise ValueError(
                f"row {number} question_id mismatch: {id1!r} vs {id2!r} - keep the sheets aligned"
            )

    ratings: dict[str, dict[str, list[float]]] = {
        rater: {column: [] for column in RATING_COLUMNS} for rater in sheets
    }
    for rater, rows in sheets.items():
        for number, row in enumerate(rows, start=1):
            for column in RATING_COLUMNS:
                ratings[rater][column].append(_rating(row, column, rater, number))

    report = agreement_report(
        [f"{value:g}" for value in ratings["rater1"]["factual_grounding"]],
        [f"{value:g}" for value in ratings["rater2"]["factual_grounding"]],
    )
    return {"n": len(rows1), "ratings": ratings, "kappa": report}


def _print_stats(label: str, values: list[float]) -> None:
    average, sd, n = _mean_sd(values)
    print(f"{label}: mean={average:.3f} sd={sd:.3f} (n={n})")


def main() -> None:
    parser = argparse.ArgumentParser(description="Human-evaluation sheets and agreement scoring")
    sub = parser.add_subparsers(dest="cmd", required=True)

    make = sub.add_parser("make", help="write two blinded rating sheets from records")
    make.add_argument("--records", required=True)
    make.add_argument("--out", default="results/human_eval")
    make.add_argument("--n", type=int, default=60)
    make.add_argument("--seed", type=int, default=0)

    score = sub.add_parser("score", help="means/SDs and kappa from two filled-in sheets")
    score.add_argument("--rater1", required=True)
    score.add_argument("--rater2", required=True)
    score.add_argument("--min-kappa", type=float, default=0.75)

    args = parser.parse_args()

    if args.cmd == "make":
        path = Path(args.records)
        if not path.is_file():
            print(f"error: not a readable file: {path}", file=sys.stderr)
            sys.exit(1)
        records = read_records(path)
        candidates = [record for record in records if _final_answer(record)]
        if not candidates:
            print("no records with a final answer to rate - run an arm first", file=sys.stderr)
            sys.exit(1)

        ordered = sorted(
            candidates,
            key=lambda record: (
                str(record.get("arm") or ""),
                str(record.get("question_id") or ""),
                str(record.get("question") or ""),
            ),
        )
        chosen = random.Random(args.seed).sample(ordered, k=min(max(args.n, 0), len(ordered)))
        rows = [_row(record) for record in chosen]
        paths = write_sheets(rows, Path(args.out))
        note = f" (only {len(ordered)} available)" if args.n > len(ordered) else ""
        print(f"wrote {len(rows)} item(s){note} to {', '.join(str(path) for path in paths)}")
        return

    try:
        result = score_sheets(Path(args.rater1), Path(args.rater2))
    except (OSError, ValueError) as exc:
        print(f"error: {exc}", file=sys.stderr)
        sys.exit(1)

    for rater in ("rater1", "rater2"):
        for column in RATING_COLUMNS:
            _print_stats(f"{rater} {column}", result["ratings"][rater][column])
    for column in RATING_COLUMNS:
        pooled = result["ratings"]["rater1"][column] + result["ratings"]["rater2"][column]
        _print_stats(f"pooled {column}", pooled)

    report = result["kappa"]
    print(
        f"factual_grounding kappa: {report['kappa']} "
        f"(n={report['n']}, agree={report['agree']}, po={report['observed_agreement']})"
    )
    kappa = report["kappa"]
    if math.isnan(kappa) or kappa < args.min_kappa:
        print(f"FAIL: kappa {kappa} < {args.min_kappa} - fix the rubric and re-label")
        sys.exit(2)
    print(f"PASS: kappa {kappa} >= {args.min_kappa}")


if __name__ == "__main__":
    main()
