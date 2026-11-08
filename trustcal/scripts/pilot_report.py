"""CLI: score the Month-1 behavioral pilot and print the go/no-go verdict.

    python scripts/pilot_report.py --records results/pilot/gpqa/seed1/records.jsonl
    python scripts/pilot_report.py --dir results/pilot/gpqa/seed1 \
        --questions-file experiments/pilot-month1/questions.json

The criterion is frozen in ``PILOT_CRITERION.md``: PASS when trust weighting
changes the aggregation winner on >= 60% of the questions, AMBIGUOUS at 40-60%,
NO-GO below 40% or when the change goes toward the wrong answer. Exit codes:
0 PASS, 2 AMBIGUOUS, 1 NO-GO / no data / invalid input.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from trustcal.eval.pilot import load_pilot_questions, score_pilot  # noqa: E402
from trustcal.runner import read_records  # noqa: E402


def _records_path(records: str | None, directory: str | None) -> Path:
    return Path(records) if records else Path(directory) / "records.jsonl"


def _validate_questions(path: Path) -> list[dict]:
    questions = load_pilot_questions(path)
    template_rows = [index for index, question in enumerate(questions) if question.get("_template")]
    if template_rows:
        raise ValueError(
            f"{path} still contains template entries at {template_rows}; fill the frozen set first"
        )
    if len(questions) != 25:
        print(f"warning: criterion uses 25 questions; file has {len(questions)}", file=sys.stderr)
    return questions


def _verdict_line(report: dict, path: Path) -> str:
    if not report["n"]:
        return f"NO DATA - no pilot records in {path}"
    return (
        f"{report['verdict']} - {report['changed']}/{report['n']} changed "
        f"(pass {report['pass_threshold']}, ambiguous {report['ambiguous_threshold']}), "
        f"toward gold {report['toward_gold']}, away {report['away_from_gold']}"
    )


def main() -> int:
    parser = argparse.ArgumentParser(description="Score the Month-1 pilot")
    source = parser.add_mutually_exclusive_group(required=True)
    source.add_argument("--records", help="path to records.jsonl")
    source.add_argument("--dir", help="run directory; uses <dir>/records.jsonl")
    parser.add_argument("--questions-file", default=None, help="validate the frozen question set first")
    args = parser.parse_args()

    if args.questions_file:
        try:
            questions = _validate_questions(Path(args.questions_file))
        except (OSError, ValueError) as exc:
            print(f"error: {exc}", file=sys.stderr)
            return 1
        print(f"frozen set valid: {len(questions)} questions", file=sys.stderr)

    path = _records_path(args.records, args.dir)
    report = score_pilot(read_records(path))
    print(json.dumps(report, indent=2))
    print(_verdict_line(report, path))

    verdict = report["verdict"]
    if verdict.startswith("PASS"):
        return 0
    if verdict.startswith("AMBIGUOUS"):
        return 2
    return 1


if __name__ == "__main__":
    sys.exit(main())
