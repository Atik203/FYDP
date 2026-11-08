"""Claim decomposition: tagged path, fallback path, caps."""

from __future__ import annotations

from .claims import Claim, claim_texts, decompose


def test_tagged_claims_are_extracted_in_order() -> None:
    text = 'Answer: 42\n<claim id="c1">first fact</claim>\n<claim id="c2">second fact</claim>'
    claims = decompose(text)
    assert claims == [Claim("c1", "first fact"), Claim("c2", "second fact")]


def test_untagged_output_falls_back_to_sentences() -> None:
    text = "The rate is high. The sample is small. It rained."
    texts = claim_texts(text)
    # "It rained." is below the 3-word floor, so only two claims survive.
    assert len(texts) == 2
    assert texts[0].startswith("The rate")


def test_max_claims_caps_output() -> None:
    text = " ".join(f"Sentence number {i} is here." for i in range(10))
    assert len(decompose(text, max_claims=4)) == 4
