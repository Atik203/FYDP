"""Trust-weighted final aggregation — argmax over Σ T_i · position_i, NOT majority vote (§5.7)."""

from __future__ import annotations

import numpy as np


def weighted_aggregate(trust: np.ndarray, votes: np.ndarray) -> int:
    """Pick the winning option index by trust-weighted vote count.

    Args:
        trust: per-agent trust weights T_i, shape (N,).
        votes: one-hot vote matrix, shape (N, M) — each agent votes for one of M options.
    """
    return int(np.argmax(trust @ votes))
