"""Month-1 pilot: schema, thresholds, direction-aware verdict."""

from __future__ import annotations

import json

import pytest

from .pilot import (
    ambiguous_threshold,
    load_pilot_questions,
    pass_threshold,
    pilot_verdict,
    score_pilot,
    validate_question,
)

VALID = {
    "question": "Q?",
    "answer": "A",
    "options": ["A", "B"],
    "verdicts": [{"support": 3, "harm": 0}, {"support": 0, "harm": 2}, {"support": 0, "harm": 2}],
}


def test_valid_question_has_no_errors() -> None:
    assert validate_question(VALID) == []


def test_question_needs_evidence_side_labels() -> None:
    errors = validate_question({"question": "Q?", "answer": "A"})
    assert any("evidence-side" in e for e in errors)


def test_bad_verdicts_rejected() -> None:
    bad = dict(VALID, verdicts=[{"support": -1, "harm": 0}])
    assert validate_question(bad)


def test_load_rejects_invalid_file(tmp_path) -> None:
    path = tmp_path / "q.json"
    path.write_text(json.dumps([{"question": "Q?"}]), encoding="utf-8")
    with pytest.raises(ValueError):
        load_pilot_questions(path)


def test_thresholds_match_criterion() -> None:
    assert pass_threshold(25) == 15
    assert ambiguous_threshold(25) == 10


def test_verdicts() -> None:
    assert pilot_verdict(15, 25, toward_gold=10) == "PASS"
    assert pilot_verdict(10, 25, toward_gold=8).startswith("AMBIGUOUS")
    assert pilot_verdict(9, 25).startswith("NO-GO")
    assert "wrong direction" in pilot_verdict(15, 25, toward_gold=1)


def test_score_pilot_counts() -> None:
    records = [
        {"pilot": {"changed": True, "toward_gold": True}},
        {"pilot": {"changed": True, "toward_gold": False}},
        {"pilot": {"changed": False, "toward_gold": False}},
    ]
    result = score_pilot(records)
    assert result["n"] == 3
    assert result["changed"] == 2
    assert result["toward_gold"] == 1
    assert result["away_from_gold"] == 1
    assert result["pass_threshold"] == 2  # ceil(0.6*3) = 2
    assert result["verdict"] == "PASS"
