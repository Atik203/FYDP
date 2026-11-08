"""TrustState contract: uniform start, bounded update, logged trajectory."""

from __future__ import annotations

import numpy as np

from .settings import TrustConfig
from .state import TrustState


def test_uniform_start_and_sum() -> None:
    state = TrustState(3)
    assert state.scores.tolist() == [1 / 3, 1 / 3, 1 / 3]
    assert state.trajectory == [[1 / 3, 1 / 3, 1 / 3]]


def test_update_stays_bounded_and_normalised() -> None:
    state = TrustState(3, TrustConfig(alpha=50, beta=50))
    for support, harm in [([100, 0, 0], [0, 100, 100]), ([0, 0, 100], [100, 100, 0])]:
        scores = state.update(support, harm)
        assert np.isclose(scores.sum(), 1.0)
        assert all(0.0 <= s <= 1.0 for s in scores)
    assert len(state.trajectory) == 3


def test_support_raises_trust_harm_lowers_it() -> None:
    state = TrustState(2)
    state.update([5, 0], [0, 5])
    assert state.scores[0] > state.scores[1]


def test_claim_counts_normalize_verbosity() -> None:
    verbose = TrustState(3)
    terse = TrustState(3)
    verbose.update([8, 0, 0], [0, 0, 0], n_claims=[8, 1, 1])
    terse.update([1, 0, 0], [0, 0, 0], n_claims=[1, 1, 1])
    assert np.allclose(verbose.scores, terse.scores, atol=1e-12, rtol=0)


def test_wrong_lengths_raise() -> None:
    state = TrustState(3)
    try:
        state.update([1], [0])
        raise AssertionError("expected ValueError")
    except ValueError:
        pass
