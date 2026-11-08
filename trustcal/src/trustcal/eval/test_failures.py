"""Failure taxonomy labels are rule-based and recomputable from records."""

from __future__ import annotations

from .failures import TAXONOMY, classify_failure, failure_counts


def _record(**extra) -> dict:
    base = {
        "question_id": "q1",
        "gold": "A",
        "options": ["A", "B"],
        "rounds": [
            {"answers": ["A", "B", "B"]},
            {"answers": ["B", "B", "B"]},
        ],
    }
    base.update(extra)
    return base


def test_minority_lost_and_correlated_hallucination() -> None:
    labels = classify_failure(_record())
    assert "minority_lost" in labels
    assert "correlated_hallucination" in labels


def test_adversarial_consensus() -> None:
    labels = classify_failure(_record(consensus="B", targets=[0]))
    assert "adversarial_consensus" in labels


def test_evidence_sparsity() -> None:
    record = _record(
        verdicts=[{"verdicts": [["unverifiable", "unverifiable", "supported"]]}]
    )
    assert "evidence_sparsity" in classify_failure(record)


def test_trust_collapse_and_stagnation() -> None:
    collapsed = _record(trust_trajectory=[[0.33, 0.33, 0.33], [0.95, 0.03, 0.02]])
    assert "trust_collapse" in classify_failure(collapsed)
    stagnant = _record(trust_trajectory=[[0.33, 0.33, 0.33], [0.33, 0.33, 0.33]])
    assert "trust_stagnation" in classify_failure(stagnant)


def test_counts_cover_taxonomy() -> None:
    counts = failure_counts([_record()])
    assert set(TAXONOMY) <= set(counts)
    assert counts["minority_lost"] == 1
