"""Dataset normalization: every release maps to one question/answer/options shape."""

from __future__ import annotations

import pytest

from .datasets import _row_to_question, pinned_revision


def test_gpqa_columns() -> None:
    row = {
        "Question": "Q?",
        "Correct Answer": "right",
        "Incorrect Answer 1": "wrong1",
        "Incorrect Answer 2": "wrong2",
        "Incorrect Answer 3": "wrong3",
    }
    out = _row_to_question(row, "gpqa")
    assert out["question"] == "Q?"
    assert out["answer"] == "right"
    assert out["options"][0] == "right"
    assert len(out["options"]) == 4


def test_generic_question_problem_aliases() -> None:
    assert _row_to_question({"problem": "P?", "answer": "A"}, "brokermath")["question"] == "P?"
    assert _row_to_question({"question": "Q?", "solution": "A"}, "hle")["answer"] == "A"


def test_mmlu_pro_answer_index_maps_to_option() -> None:
    row = {"question": "Q?", "options": ["a", "b", "c"], "answer_index": 2, "answer": "C"}
    assert _row_to_question(row, "mmlu_pro")["answer"] == "c"


def test_gpqa_revision_is_pinned() -> None:
    assert pinned_revision("gpqa") == "633f5ee89ab8ad4522a9f850766b73f62147ffdd"
    assert pinned_revision("hle") is None  # still "main" until the Phase 2 freeze


def test_missing_fields_raise_with_keys() -> None:
    with pytest.raises(ValueError, match="no question"):
        _row_to_question({"answer": "A"}, "hle")
    with pytest.raises(ValueError, match="no answer"):
        _row_to_question({"question": "Q?"}, "hle")
