"""Verdict logic: support, contradiction, abstention, reranking."""

from __future__ import annotations

from .verdicts import (
    CONTRADICTED,
    SUPPORTED,
    UNVERIFIABLE,
    classify_claim,
    count_verdicts,
    lexical_score,
    rerank,
)


def test_lexical_score_is_claim_coverage() -> None:
    assert lexical_score("sky appears blue", "the sky appears blue today") == 1.0
    assert lexical_score("sky appears blue", "cats sleep") == 0.0


def test_supported_claim() -> None:
    passage = "The sky appears blue because of Rayleigh scattering."
    assert classify_claim("The sky appears blue due to Rayleigh scattering", [passage]) == SUPPORTED


def test_negation_contradiction() -> None:
    assert classify_claim("The sky is not blue", ["The sky is blue"]) == CONTRADICTED


def test_numeric_contradiction() -> None:
    assert classify_claim("The dose is 5 mg", ["The dose is 7 mg in this trial"]) == CONTRADICTED


def test_unrelated_passage_abstains() -> None:
    assert classify_claim("Quantum gravity is renormalizable", ["Cats sleep for many hours"]) == UNVERIFIABLE


def test_empty_passages_abstain() -> None:
    assert classify_claim("anything", []) == UNVERIFIABLE


def test_injected_judge_wins() -> None:
    assert classify_claim("x", ["y"], judge=lambda claim, passages: "supported") == SUPPORTED


def test_rerank_orders_and_caps() -> None:
    passages = ["cats sleep", "the sky is blue", "the sky appears blue"]
    ranked = rerank("sky appears blue", passages, top_k=2)
    assert len(ranked) == 2
    assert ranked[0][1] >= ranked[1][1]
    assert "sky" in ranked[0][0]


def test_count_verdicts() -> None:
    assert count_verdicts([SUPPORTED, CONTRADICTED, UNVERIFIABLE, UNVERIFIABLE]) == (1, 1, 2)
