"""Annotation tooling for the injection-protocol κ check (INJECTION_PROTOCOL.md).

`sample_items` draws divergent + control items from B3 records (deterministic by
seed), `write_sheets` emits two independent rater CSVs, `score_sheets` computes
Cohen's κ from the filled-in files. The truth column lives only in items.json so
raters stay blind.
"""

from __future__ import annotations

import csv
import json
import random
from pathlib import Path

from ..orchestrator.injection import build_injection
from .agreement import agreement_report

SHEET_FIELDS = ["item_id", "question", "agent_answers", "gold", "eligible", "answer_type"]


def eligible_from_record(record: dict) -> bool:
    """Ground truth for the annotation: divergent + checkable (protocol steps 1–2)."""
    rounds = record.get("rounds") or []
    if not rounds:
        return False
    return build_injection(rounds[0]["answers"], record.get("options"), scope="minority").eligible


def sample_items(
    records: list[dict],
    n_divergent: int = 30,
    n_control: int = 10,
    seed: int = 0,
) -> list[dict]:
    """Deterministic sample; controls guarantee the sheet is not all 'eligible'."""
    rng = random.Random(seed)
    divergent = [r for r in records if eligible_from_record(r)]
    controls = [r for r in records if not eligible_from_record(r)]
    rng.shuffle(divergent)
    rng.shuffle(controls)
    chosen = divergent[:n_divergent] + controls[:n_control]
    rng.shuffle(chosen)
    return [
        {
            "item_id": r["question_id"],
            "question": r.get("question", ""),
            "agent_answers": " | ".join(r["rounds"][0]["answers"]),
            "gold": r.get("gold", ""),
            "truth_eligible": eligible_from_record(r),
        }
        for r in chosen
    ]


def write_sheets(items: list[dict], out_dir: Path) -> list[Path]:
    """Write rater1.csv, rater2.csv (empty label columns) and items.json (truth)."""
    out_dir = Path(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    paths = []
    for rater in ("rater1", "rater2"):
        path = out_dir / f"{rater}.csv"
        with path.open("w", newline="", encoding="utf-8") as fh:
            writer = csv.DictWriter(fh, fieldnames=SHEET_FIELDS)
            writer.writeheader()
            for item in items:
                writer.writerow({field: item.get(field, "") for field in SHEET_FIELDS})
        paths.append(path)
    (out_dir / "items.json").write_text(json.dumps(items, indent=2, ensure_ascii=False), encoding="utf-8")
    return paths


def _read_column(path: Path, column: str) -> list[str]:
    with Path(path).open(newline="", encoding="utf-8") as fh:
        return [row[column].strip().lower() for row in csv.DictReader(fh)]


def score_sheets(rater1: Path, rater2: Path) -> dict:
    """κ on the eligibility labels (+ answer-type agreement as a secondary check)."""
    eligible_1, eligible_2 = _read_column(rater1, "eligible"), _read_column(rater2, "eligible")
    if any(not value for value in eligible_1 + eligible_2):
        raise ValueError("unfilled labels: every row needs eligible=yes|no in both sheets")
    report = agreement_report(eligible_1, eligible_2)
    types_1, types_2 = _read_column(rater1, "answer_type"), _read_column(rater2, "answer_type")
    if all(types_1) and all(types_2):
        report["answer_type"] = agreement_report(types_1, types_2)
    return report
