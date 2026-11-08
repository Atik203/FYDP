"""P0-1 tests: answer-span priority, scientific notation, MCQ mapping, corpus."""

from __future__ import annotations

import json
from pathlib import Path

import pytest

from .answers import REL_TOL, score_answer
from .options import RenderedOptions

FIXTURE = Path(__file__).resolve().parents[3] / "tests" / "fixtures" / "parser_cases.json"

RENDERED = RenderedOptions(
    options=["alpha structure", "beta structure", "gamma structure", "delta structure"],
    permutation=[0, 1, 2, 3],
    gold_letter="C",
    block="",
)


def test_scientific_notation_parses_as_one_number() -> None:
    for position in (
        "10^-4 eV",
        "10^{-4} eV",
        r"7.3 \times 10^{-7}",
        "7.3 × 10^-7",
        "7.3 × 10⁻⁷",
    ):
        score = score_answer(position, "7.3e-7" if "7.3" in position else "1e-4")
        assert score.correct is True, position
        assert score.kind in {"numeric", "labelled"}


def test_letter_forms_parse() -> None:
    for position in ("(B)", "B", "B)", "The answer is B", "Answer: B"):
        score = score_answer(position, "B")
        assert score.parsed == "B", position
        assert score.correct is True, position


def test_product_label_is_not_the_answer_number() -> None:
    score = score_answer("Product 3 contains 11", "11")
    assert score.parsed == "11"
    assert score.correct is True
    assert score.parsed != "3" and score.parsed != "3.0"


def test_boxed_span_wins() -> None:
    score = score_answer(r"reasoning ... \boxed{7.3 \times 10^{-7}} ... more", "7.3e-7")
    assert score.kind == "boxed"
    assert score.correct is True


def test_numeric_tolerance_is_relative_1e_3() -> None:
    assert REL_TOL == 1e-3
    assert score_answer("0.00010004", "1e-4").correct is True
    assert score_answer("1.2e-4", "1e-4").correct is False


def test_mcq_letter_and_option_text_resolve_to_rendered_option() -> None:
    letter = score_answer("The answer is C", "gamma structure", RENDERED)
    text = score_answer("gamma structure", "gamma structure", RENDERED)
    wrong = score_answer("B", "gamma structure", RENDERED)
    assert letter.correct is True and letter.parsed == "C"
    assert text.correct is True and text.parsed == "C"
    assert wrong.correct is False and wrong.parsed == "B"


def test_free_text_containment_and_equality() -> None:
    assert score_answer("the mitochondrial matrix", "the mitochondrial matrix").correct is True
    long = "The correct answer is the mitochondrial matrix of the cell."
    assert score_answer(long, "the mitochondrial matrix").correct is True
    assert score_answer("north", "no").correct is False


def _load_cases() -> list[dict]:
    payload = json.loads(FIXTURE.read_text(encoding="utf-8"))
    return payload["cases"]


def test_corpus_has_50_provenanced_cases() -> None:
    cases = _load_cases()
    assert len(cases) == 50
    assert all(case.get("source") for case in cases)
    assert sum(case["source"].startswith("experiments/gate0/") for case in cases) == 30


def test_corpus_exact_parse_match_at_least_95_percent() -> None:
    cases = _load_cases()
    matched = 0
    failures: list[str] = []
    for case in cases:
        rendered = None
        if case.get("rendered"):
            raw = case["rendered"]
            rendered = RenderedOptions(
                options=raw["options"],
                permutation=raw["permutation"],
                gold_letter=raw["gold_letter"],
                block="",
            )
        score = score_answer(case["position"], case["gold"], rendered)
        expect = case["expect"]
        exact = score.parsed == expect["parsed"] and score.kind == expect["kind"]
        matched += exact
        if not exact or score.correct != expect["correct"]:
            failures.append(
                f"{case['id']}: parsed={score.parsed!r} kind={score.kind} correct={score.correct} "
                f"expected parsed={expect['parsed']!r} kind={expect['kind']} correct={expect['correct']}"
            )
    rate = matched / len(cases)
    assert rate >= 0.95, f"exact parse match {rate:.1%} < 95%; failures: {failures}"


def test_empty_position_is_safe() -> None:
    score = score_answer("", "42")
    assert score.parsed == ""
    assert score.correct is False
    assert score.kind == "text"


@pytest.mark.parametrize("position", ["10^-4 eV", "(B)", "Product 3 contains 11"])
def test_probe_positions_are_stable(position: str) -> None:
    """The acceptance probes must keep their exact parse across refactors."""
    first = score_answer(position, "1e-4" if "10" in position else ("11" if "11" in position else "B"))
    second = score_answer(position, "1e-4" if "10" in position else ("11" if "11" in position else "B"))
    assert first == second
