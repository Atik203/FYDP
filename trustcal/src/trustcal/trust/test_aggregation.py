"""Trust-weighted aggregation vs majority: the Month-1 pilot's core operation."""

from __future__ import annotations

import numpy as np

from .aggregation import aggregate, vote_matrix, weighted_aggregate


def test_vote_matrix_groups_equivalent_answers() -> None:
    votes, labels = vote_matrix(["42", "42.0", "B"], ["A", "B"])
    assert votes.shape == (3, 2)
    assert labels == ["42", "B"]
    assert votes.sum(axis=1).tolist() == [1.0, 1.0, 1.0]


def test_weighted_can_beat_majority() -> None:
    positions = ["wrong", "wrong", "correct"]
    trust = np.array([0.1, 0.1, 0.8])
    result = aggregate(trust, positions)
    assert result["majority"] == "wrong"
    assert result["weighted"] == "correct"
    assert result["changed"] is True


def test_uniform_trust_matches_majority() -> None:
    result = aggregate(np.full(3, 1 / 3), ["A", "A", "B"])
    assert result["majority"] == "A"
    assert result["weighted"] == "A"
    assert result["changed"] is False


def test_weighted_aggregate_returns_argmax() -> None:
    votes = np.array([[1, 0], [0, 1], [0, 1]], dtype=float)
    assert weighted_aggregate(np.array([0.9, 0.05, 0.05]), votes) == 0
