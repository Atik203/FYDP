"""Parser tests — the Gate 0 output quirks, no GPU required."""

from __future__ import annotations

from .parser import claims_or_fallback, extract_claims, fallback_claims, parse_position


def test_position_on_next_line_after_bold_label() -> None:
    assert parse_position("**Answer:**\n42") == "42"


def test_position_same_line_after_bold_label() -> None:
    assert parse_position("**Answer:** 42\nreasoning") == "42"


def test_position_plain_label() -> None:
    assert parse_position("Answer: 7 because ...") == "7 because ..."


def test_position_conclusion_label_on_next_line() -> None:
    assert parse_position("**Conclusion:**\nThe exoplanet is c") == "The exoplanet is c"


def test_position_falls_back_to_first_content_line() -> None:
    assert parse_position("\n\n**Answer:**\n\nSome value here") == "Some value here"


def test_position_no_label_uses_first_nonempty_line() -> None:
    assert parse_position("\n\n42 is the answer.\nmore") == "42 is the answer."


def test_position_never_returns_formatting_only_line() -> None:
    assert parse_position("**Answer:**\n") == ""


def test_position_does_not_swallow_claim_tags() -> None:
    text = '**Answer:** 42\n<claim id="c1">because arithmetic</claim>'
    assert parse_position(text) == "42"


def test_extract_claims_tagged() -> None:
    text = 'Answer: 42\n<claim id="c1">six times seven</claim><claim id="c2">is 42</claim>'
    assert extract_claims(text) == [("c1", "six times seven"), ("c2", "is 42")]


def test_fallback_claims_splits_sentences_and_strips_labels() -> None:
    text = "**Answer:** 42\nSix times seven equals forty two. This follows from basic arithmetic. It is exact."
    claims = fallback_claims(text)
    assert [cid for cid, _ in claims] == ["c1", "c2", "c3"]
    assert claims[0][1].startswith("42 ")          # label stripped, content kept
    assert "**" not in claims[0][1]                # markdown emphasis removed
    assert "This follows from basic arithmetic." in [c for _, c in claims]


def test_fallback_claims_drops_short_fragments() -> None:
    text = "Yes. The result is exactly forty two for this multiplication."
    claims = fallback_claims(text)
    assert [c for _, c in claims] == ["The result is exactly forty two for this multiplication."]


def test_fallback_claims_caps_length() -> None:
    text = " ".join(f"This is sentence number {i} with enough words." for i in range(30))
    assert len(fallback_claims(text, max_claims=5)) == 5


def test_claims_or_fallback_prefers_tagged() -> None:
    tagged = 'Answer: 1\n<claim id="c1">tagged claim here</claim>'
    assert claims_or_fallback(tagged) == [("c1", "tagged claim here")]


def test_claims_or_fallback_falls_back_when_untagged() -> None:
    untagged = "The sky is blue during the day. It scatters short wavelengths."
    assert len(claims_or_fallback(untagged)) == 2


def test_empty_text_is_safe() -> None:
    assert parse_position("") == ""
    assert extract_claims("") == []
    assert fallback_claims("") == []
