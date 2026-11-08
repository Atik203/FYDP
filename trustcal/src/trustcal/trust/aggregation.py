"""Trust-weighted final aggregation — argmax over Σ T_i · position_i, NOT majority vote (§5.7)."""

from __future__ import annotations

import numpy as np

from ..eval.answers import canonical, majority_answer


def weighted_aggregate(trust: np.ndarray, votes: np.ndarray) -> int:
    """Pick the winning option index by trust-weighted vote count.

    Args:
        trust: per-agent trust weights T_i, shape (N,).
        votes: one-hot vote matrix, shape (N, M) - each agent votes for one of M options.
    """
    return int(np.argmax(trust @ votes))


def vote_matrix(positions: list[str], options: list[str] | None = None) -> tuple[np.ndarray, list[str]]:
    """One-hot vote matrix over canonical answer groups.

    Returns ``(votes, labels)`` where ``labels[j]`` is the first position text
    that produced group ``j``. The option list is intentionally the *observed*
    answers, not the dataset's options: an agent may answer in prose, and the
    aggregation must still count that group.
    """
    labels: list[str] = []
    index: dict[str, int] = {}
    rows: list[int] = []
    for position in positions:
        key = canonical(position, options)
        if key not in index:
            index[key] = len(labels)
            labels.append(position)
        rows.append(index[key])
    votes = np.zeros((len(positions), len(labels)), dtype=float)
    for i, j in enumerate(rows):
        votes[i, j] = 1.0
    return votes, labels


def aggregate(trust: np.ndarray, positions: list[str], options: list[str] | None = None) -> dict:
    """Majority and trust-weighted winners for the same final positions.

    The Month-1 pilot compares exactly these two fields: the criterion is
    "weighted winner != unweighted majority winner", not a separate debate.
    """
    majority, count = majority_answer(positions, options)
    votes, labels = vote_matrix(positions, options)
    if votes.size == 0:
        return {"majority": None, "weighted": None, "changed": False, "labels": []}
    winner = weighted_aggregate(np.asarray(trust, dtype=float), votes)
    weighted = labels[winner]
    return {
        "majority": majority,
        "majority_count": count,
        "weighted": weighted,
        "weighted_index": winner,
        "changed": canonical(majority, options) != canonical(weighted, options),
        "labels": labels,
    }
