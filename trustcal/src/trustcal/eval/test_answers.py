"""Answer matcher tests — formats seen in Gate 0 and the datasets."""

from __future__ import annotations

from .answers import (
    canonical,
    choice_letter,
    distinct_answers,
    is_correct,
    majority_answer,
    normalize,
    same_answer,
    to_float,
)

OPTIONS = [
    "The mitochondrial matrix",
    "The cytoplasm",
    "The nucleus",
    "The endoplasmic reticulum",
]


def test_normalize_strips_markdown_and_punctuation() -> None:
    assert normalize("  **The Answer!**  ") == "the answer"


def test_mcq_bare_letter() -> None:
    assert choice_letter("B", OPTIONS) == "B"
    assert choice_letter("(b)", OPTIONS) == "B"
    assert choice_letter("**C**", OPTIONS) == "C"


def test_mcq_leading_letter_short_answer() -> None:
    assert choice_letter("B) the cytoplasm", OPTIONS) == "B"


def test_mcq_option_text_maps_to_letter() -> None:
    assert choice_letter("The nucleus", OPTIONS) == "C"


def test_mcq_letter_gold_vs_text_position() -> None:
    assert is_correct("The nucleus", "C", options=OPTIONS)
    assert is_correct("C", "The nucleus", options=OPTIONS)


def test_numeric_plain_and_float_equivalence() -> None:
    assert same_answer("42", "42.0")
    assert same_answer("1e3", "1000")


def test_numeric_scientific_latex_style() -> None:
    assert same_answer(r"$7.3 \times 10^{-7}$", "7.3e-7")
    assert same_answer("7.3 × 10^-7", "0.00000073")


def test_numeric_mismatch() -> None:
    assert not same_answer("42", "43")


def test_text_case_and_punctuation_insensitive() -> None:
    assert same_answer("Yes", "yes!")
    assert not same_answer("yes", "no")


def test_short_containment_is_rejected() -> None:
    # "no" inside "north" must not count as a match
    assert not same_answer("north", "no")


def test_long_containment_is_accepted() -> None:
    gold = "the mitochondrial matrix"
    position = "The correct answer is the mitochondrial matrix of the cell."
    assert same_answer(position, gold, options=OPTIONS)


def test_canonical_groups_equivalent_forms() -> None:
    assert canonical("B", OPTIONS) == canonical("The cytoplasm", OPTIONS)
    assert canonical("42", None) == canonical("42.000", None)


def test_distinct_answers_counts_groups() -> None:
    assert distinct_answers(["B", "The cytoplasm", "C"], OPTIONS) == 2


def test_majority_answer_and_tie_break() -> None:
    answer, count = majority_answer(["B", "The cytoplasm", "C"], OPTIONS)
    assert count == 2
    assert choice_letter(answer, OPTIONS) == "B"
    # full tie -> earliest position wins deterministically
    answer, count = majority_answer(["A", "B"], OPTIONS)
    assert count == 1
    assert choice_letter(answer, OPTIONS) == "A"


def test_to_float_edge_cases() -> None:
    assert to_float("no digits here") is None
    assert to_float("-5.5 units") == -5.5


def test_empty_inputs_are_safe() -> None:
    assert normalize("") == ""
    assert choice_letter("", OPTIONS) is None
    assert not same_answer("", "42")
    assert majority_answer([]) == (None, 0)
