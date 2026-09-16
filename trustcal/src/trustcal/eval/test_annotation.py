"""Annotation sheet tests — deterministic sampling and κ scoring."""

from __future__ import annotations

import csv
import json

import pytest

from .annotation import eligible_from_record, sample_items, score_sheets, write_sheets

OPTIONS = ["mitochondrial matrix", "cytoplasm", "nucleus", "reticulum"]


def _record(qid: str, answers: list[str]) -> dict:
    return {
        "question_id": qid,
        "question": f"Question {qid}?",
        "gold": "nucleus",
        "options": OPTIONS,
        "rounds": [{"answers": answers}, {"answers": answers}, {"answers": answers}],
    }


RECORDS = [
    _record("q-div-1", ["C", "B", "B"]),
    _record("q-div-2", ["B", "C", "B"]),
    _record("unanimous", ["B", "B", "B"]),
]


def test_eligible_truth_matches_protocol() -> None:
    assert eligible_from_record(RECORDS[0]) is True
    assert eligible_from_record(RECORDS[2]) is False


def test_sample_is_deterministic_and_balanced() -> None:
    first = sample_items(RECORDS, n_divergent=2, n_control=1, seed=7)
    second = sample_items(RECORDS, n_divergent=2, n_control=1, seed=7)
    assert [i["item_id"] for i in first] == [i["item_id"] for i in second]
    assert len(first) == 3
    assert sum(1 for i in first if i["truth_eligible"]) == 2


def test_write_sheets_are_blind(tmp_path) -> None:
    items = sample_items(RECORDS, n_divergent=2, n_control=1, seed=0)
    paths = write_sheets(items, tmp_path)
    assert len(paths) == 2
    for path in paths:
        rows = list(csv.DictReader(path.open(encoding="utf-8")))
        assert len(rows) == 3
        assert all(row["eligible"] == "" for row in rows)
        assert "truth_eligible" not in rows[0]
    truth = json.loads((tmp_path / "items.json").read_text(encoding="utf-8"))
    assert {"item_id", "truth_eligible"} <= set(truth[0])


def _write_labels(path, eligible: list[str], answer_types: list[str]) -> None:
    with path.open("w", newline="", encoding="utf-8") as fh:
        writer = csv.writer(fh)
        writer.writerow(["item_id", "question", "agent_answers", "gold", "eligible", "answer_type"])
        for i, (e, t) in enumerate(zip(eligible, answer_types)):
            writer.writerow([f"q{i}", "?", "C | B | B", "nucleus", e, t])


def test_score_sheets_hand_computed_kappa(tmp_path) -> None:
    _write_labels(tmp_path / "r1.csv", ["yes", "yes", "no"], ["mcq", "numeric", "mcq"])
    _write_labels(tmp_path / "r2.csv", ["yes", "no", "no"], ["mcq", "numeric", "mcq"])
    report = score_sheets(tmp_path / "r1.csv", tmp_path / "r2.csv")
    assert report["kappa"] == pytest.approx(0.4)
    assert report["n"] == 3
    assert report["answer_type"]["kappa"] == 1.0


def test_score_sheets_rejects_unfilled(tmp_path) -> None:
    _write_labels(tmp_path / "r1.csv", ["yes", "", "no"], ["", "", ""])
    _write_labels(tmp_path / "r2.csv", ["yes", "no", "no"], ["", "", ""])
    with pytest.raises(ValueError, match="unfilled"):
        score_sheets(tmp_path / "r1.csv", tmp_path / "r2.csv")
