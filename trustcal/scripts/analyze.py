"""CLI: pooled analysis of runner record files.

    python scripts/analyze.py --records results/injection/gpqa/seed1/records.jsonl
    python scripts/analyze.py --dir results --json --no-failures
    python scripts/analyze.py --records results/pilot/gpqa/seed1/records.jsonl --pilot

Prints pooled CCR/MPR, the failure taxonomy, the Month-1 pilot verdict when the
records carry a ``pilot`` block, and ECR when final-round trust and correctness
can be recovered. Exits 0 unless an input path cannot be read.
"""

from __future__ import annotations

import argparse
import json
import math
import sys
from collections import Counter
from pathlib import Path
from statistics import mean

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from trustcal.eval import (  # noqa: E402
    brier_score,
    ecr,
    failure_counts,
    failure_examples,
    is_correct,
    score_pilot,
    summarize,
)
from trustcal.runner import read_records  # noqa: E402


def _find_record_files(directory: Path) -> list[Path]:
    """Every JSONL under a directory, sorted so runs are reproducible."""
    return sorted(path for path in directory.rglob("*.jsonl") if path.is_file())


def _numeric_list(value: object) -> list[float] | None:
    """A non-empty list of finite floats, or None when the shape is unusable."""
    if not isinstance(value, list) or not value:
        return None
    try:
        scores = [float(item) for item in value]
    except (TypeError, ValueError):
        return None
    return scores if all(math.isfinite(score) for score in scores) else None


def _final_trust(record: dict) -> list[float] | None:
    """``final_trust`` wins; older records only store the last trajectory round."""
    scores = _numeric_list(record.get("final_trust"))
    if scores is not None:
        return scores
    trajectory = record.get("trust_trajectory")
    if isinstance(trajectory, list) and trajectory:
        return _numeric_list(trajectory[-1])
    return None


def _summary_ready(record: dict) -> bool:
    """`summarize` needs gold plus a well-formed answers list in every round."""
    rounds = record.get("rounds")
    if not isinstance(rounds, list) or not rounds or "gold" not in record:
        return False
    return all(isinstance(entry, dict) and isinstance(entry.get("answers"), list) for entry in rounds)


def _ecr_pairs(records: list[dict]) -> tuple[list[float], list[int], Counter]:
    """Trust vs correctness for every usable agent in its record's final round."""
    predicted: list[float] = []
    correct: list[int] = []
    skipped: Counter = Counter()

    for record in records:
        rounds = record.get("rounds") or []
        last = rounds[-1] if rounds and isinstance(rounds[-1], dict) else None
        answers = last.get("answers") if last else None
        if not isinstance(answers, list) or not answers:
            skipped["no final-round answers"] += 1
            continue

        gold = record.get("gold")
        if gold is None or not str(gold).strip():
            skipped["no gold answer"] += 1
            continue

        trust = _final_trust(record)
        if trust is None:
            skipped["no trust scores"] += 1
            continue
        if len(trust) != len(answers):
            skipped["trust/answer length mismatch"] += 1
            continue

        flags = last.get("inconclusive") or []
        options = record.get("options")
        added = 0
        for i, (score, answer) in enumerate(zip(trust, answers)):
            if i < len(flags) and flags[i]:
                continue
            if not answer:
                continue
            predicted.append(score)
            correct.append(1 if is_correct(str(answer), str(gold), options) else 0)
            added += 1
        if not added:
            skipped["no usable agent-answers"] += 1

    return predicted, correct, skipped


def _print_pilot(pilot: dict) -> None:
    if not pilot["n"]:
        print("\nPilot: NO DATA - no records carry a pilot block")
        return
    print(
        f"\nPilot: {pilot['verdict']} - changed {pilot['changed']}/{pilot['n']} "
        f"(pass threshold {pilot['pass_threshold']}), toward gold {pilot['toward_gold']}, "
        f"away {pilot['away_from_gold']}"
    )


def main() -> None:
    parser = argparse.ArgumentParser(description="Pooled analysis of runner records")
    source = parser.add_mutually_exclusive_group(required=True)
    source.add_argument("--records", help="one records.jsonl file")
    source.add_argument("--dir", help="directory searched recursively for *.jsonl")
    parser.add_argument("--json", action="store_true", help="machine-readable output")
    parser.add_argument(
        "--failures",
        action=argparse.BooleanOptionalAction,
        default=True,
        help="failure taxonomy counts (default: on; use --no-failures to skip)",
    )
    parser.add_argument("--pilot", action="store_true", help="force the Month-1 pilot verdict section")
    args = parser.parse_args()

    try:
        if args.records:
            path = Path(args.records)
            if not path.is_file():
                raise OSError(f"not a readable file: {path}")
            sources = [path]
        else:
            directory = Path(args.dir)
            if not directory.is_dir():
                raise OSError(f"not a directory: {directory}")
            sources = _find_record_files(directory)
        records: list[dict] = []
        for source_path in sources:
            records.extend(read_records(source_path))
    except (OSError, UnicodeDecodeError) as exc:
        print(f"error: {exc}", file=sys.stderr)
        sys.exit(2)

    ready = [record for record in records if _summary_ready(record)]
    summary = summarize(ready)

    payload: dict = {
        "sources": [str(path) for path in sources],
        "n_records": len(records),
        "n_skipped": len(records) - len(ready),
        "summary": summary.as_dict(),
    }

    if args.failures:
        payload["failures"] = failure_counts(records)
        payload["failure_examples"] = failure_examples(records)

    if args.pilot or any(isinstance(record.get("pilot"), dict) for record in records):
        payload["pilot"] = score_pilot(records)

    predicted, correct, ecr_skipped = _ecr_pairs(records)
    if predicted:
        payload["ecr"] = {
            "n": len(predicted),
            "ecr": round(ecr(predicted, correct), 4),
            "brier": round(brier_score(predicted, correct), 4),
            "accuracy": round(mean(correct), 4),
        }
    else:
        reasons = ", ".join(f"{reason} in {count} record(s)" for reason, count in ecr_skipped.items())
        payload["ecr"] = {"skipped": reasons or "no records"}

    if args.json:
        print(json.dumps(payload, indent=2))
        return

    listing = f": {', '.join(str(path) for path in sources)}" if sources else ""
    print(f"sources: {len(sources)} file(s){listing}")
    skipped_note = f" ({len(records) - len(ready)} skipped: no usable rounds/gold)" if len(records) != len(ready) else ""
    print(f"records: {len(records)}{skipped_note}")
    print(f"CCR: {summary.ccr:.3f} ({summary.n_collapse}/{summary.n_exposed} exposed agents)")
    print(f"MPR: {summary.mpr:.3f} ({summary.n_divergent} divergent debates)")
    print(f"switches to injected consensus: {summary.n_switched_to_consensus}")

    if args.failures:
        counts = payload["failures"]
        width = max(len(label) for label in counts)
        print("\nFailures:")
        for label, count in counts.items():
            print(f"  {label:<{width}}  {count}")
        if payload["failure_examples"]:
            print("Examples:")
            for example in payload["failure_examples"]:
                print(f"  {example['question_id']}: {', '.join(example['labels'])}")

    if "pilot" in payload:
        _print_pilot(payload["pilot"])

    calibration = payload["ecr"]
    if "skipped" in calibration:
        print(f"ECR: skipped - {calibration['skipped']}")
    else:
        print(
            f"ECR: {calibration['ecr']:.3f} over {calibration['n']} agent-answers "
            f"(Brier {calibration['brier']:.3f}, accuracy {calibration['accuracy']:.3f})"
        )


if __name__ == "__main__":
    main()
