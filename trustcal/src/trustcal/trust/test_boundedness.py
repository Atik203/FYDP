"""P0-5 trust guarantees: projection bounds, neutral no-op, claim-count normalization.

Acceptance for `docs/agent/02_P0_FIXES.md` §P0-5:
  * 10k random inputs per N in {1, 3, 5}: floor, sum, effective ceiling.
  * neutral evidence (support == harm == 0) is an exact identity.
  * duplicating every claim does not change trust.
  * N = 1 returns [1.0] and the ceiling is inactive.
  * extreme supports stay bounded and ordered.

All deterministic (fixed seeds), no network, numpy only.
"""

from __future__ import annotations

import numpy as np
import pytest

from .update import project_simplex_with_floor, update_trust

FLOOR = 0.1
CEILING = 0.9
TOL = 1e-9  # contract tolerance from 02_P0_FIXES.md §P0-5


def effective_ceiling(n: int, ceiling: float = CEILING) -> float:
    """Ceiling after relaxing to the uniform share when N * ceiling < 1."""
    return max(ceiling, 1.0 / n)


def assert_trust_contract(w: np.ndarray, n: int) -> None:
    assert w.shape == (n,), w.shape
    assert np.all(np.isfinite(w)), w
    assert w.min() >= FLOOR - TOL, f"floor violated: {w}"
    assert w.max() <= effective_ceiling(n) + TOL, f"ceiling violated: {w}"
    assert abs(w.sum() - 1.0) <= TOL, f"sum violated: {w.sum()}"


# --------------------------------------------------------------------------- #
# 10k random inputs per N: the P0-5 boundedness acceptance test.
# --------------------------------------------------------------------------- #


@pytest.mark.parametrize("n", [1, 3, 5])
def test_update_trust_bounds_10k_random(n: int) -> None:
    rng = np.random.default_rng(20260501 + n)
    for i in range(10_000):
        # Positive weights spanning 12 orders of magnitude; support/harm are
        # raw counts on odd iterations and claim-normalized on even ones.
        scores = 10.0 ** rng.uniform(-6.0, 6.0, n)
        support = rng.poisson(2.0, n).astype(float)
        harm = rng.poisson(2.0, n).astype(float)
        counts = None if i % 2 else rng.integers(0, 9, n).astype(float)
        w = update_trust(scores, support, harm, counts)
        assert_trust_contract(w, n)


@pytest.mark.parametrize("n", [1, 3, 5])
def test_projection_bounds_500_random(n: int) -> None:
    rng = np.random.default_rng(777 + n)
    for _ in range(500):
        x = rng.normal(0.0, 10.0, n) * 10.0 ** rng.integers(-3, 4)
        w = project_simplex_with_floor(x)
        assert_trust_contract(w, n)


def test_projection_matches_bisection_reference() -> None:
    # The closed-form water-filling threshold must equal the bisection root,
    # which is the Euclidean projection onto the polytope.
    def reference(x: np.ndarray) -> np.ndarray:
        upper = max(CEILING, 1.0 / x.size)
        lo, hi = x.min() - upper - 1.0, x.max() - FLOOR + 1.0
        for _ in range(100):
            mid = 0.5 * (lo + hi)
            if np.clip(x - mid, FLOOR, upper).sum() > 1.0:
                lo = mid
            else:
                hi = mid
        return np.clip(x - 0.5 * (lo + hi), FLOOR, upper)

    rng = np.random.default_rng(99)
    for _ in range(150):
        x = rng.normal(0.0, 5.0, 3)
        ours = project_simplex_with_floor(x)
        assert np.allclose(ours, reference(x), atol=1e-9, rtol=0), (x, ours, reference(x))


def test_projection_is_idempotent() -> None:
    rng = np.random.default_rng(7)
    for _ in range(1_000):
        x = rng.normal(0.0, 10.0, 3)
        w = project_simplex_with_floor(x)
        again = project_simplex_with_floor(w)
        assert np.allclose(again, w, atol=1e-12, rtol=0), (w, again)


# --------------------------------------------------------------------------- #
# Neutral evidence: exact identity, not a re-uniformization.
# --------------------------------------------------------------------------- #


@pytest.mark.parametrize("n", [3, 5])
def test_neutral_evidence_is_exact_identity(n: int) -> None:
    rng = np.random.default_rng(31 + n)
    feasible = [
        np.full(n, 1.0 / n),  # uniform
        np.array([1.0 - (n - 1) * FLOOR] + [FLOOR] * (n - 1)),  # floor + dominant
        project_simplex_with_floor(rng.normal(0.0, 3.0, n)),  # generic interior point
    ]
    for x in feasible:
        w = update_trust(x, np.zeros(n), np.zeros(n))
        assert np.allclose(w, x, atol=1e-12, rtol=0), (x, w)


def test_neutral_evidence_keeps_documented_probe() -> None:
    # 02_P0_FIXES.md probe: the old operator returned [0.5017, 0.2491, 0.2491].
    x = np.array([0.8, 0.1, 0.1])
    w = update_trust(x, np.zeros(3), np.zeros(3))
    assert np.allclose(w, x, atol=1e-12, rtol=0), w


def test_neutral_evidence_projects_infeasible_input() -> None:
    # Below-floor trust is repaired, never re-uniformized.
    w = update_trust(np.array([0.9, 0.05, 0.05]), np.zeros(3), np.zeros(3))
    assert np.allclose(w, [0.8, 0.1, 0.1], atol=1e-9, rtol=0), w
    assert_trust_contract(w, 3)


def test_zero_claim_counts_disable_evidence() -> None:
    x = np.array([0.5, 0.3, 0.2])
    support = np.array([3.0, 0.0, 0.0])
    harm = np.array([0.0, 1.0, 0.0])
    silent = update_trust(x, support, harm, np.zeros(3))
    neutral = update_trust(x, np.zeros(3), np.zeros(3))
    assert np.allclose(silent, neutral, atol=1e-12, rtol=0), (silent, neutral)


# --------------------------------------------------------------------------- #
# Claim-count normalization: verbosity must not pay.
# --------------------------------------------------------------------------- #


def test_verbosity_invariance() -> None:
    scores = np.array([0.5, 0.3, 0.2])
    support = np.array([3.0, 0.0, 1.0])
    harm = np.array([0.0, 2.0, 1.0])
    counts = np.array([4.0, 2.0, 2.0])
    base = update_trust(scores, support, harm, counts)
    for factor in (8.0, 100.0):
        scaled = update_trust(scores, support * factor, harm * factor, counts * factor)
        assert np.allclose(scaled, base, atol=1e-12, rtol=0), (base, scaled)


def test_verbosity_probe_from_p0_5() -> None:
    # Old operator: support [1,0,0] -> 0.4519, [8,0,0] -> 0.8182. With claim
    # counts, eight copies of one claim equal one claim.
    x = np.full(3, 1.0 / 3.0)
    one = update_trust(x, np.array([1.0, 0.0, 0.0]), np.zeros(3), np.array([1.0, 1.0, 1.0]))
    eight = update_trust(x, np.array([8.0, 0.0, 0.0]), np.zeros(3), np.array([8.0, 1.0, 1.0]))
    assert np.allclose(one, eight, atol=1e-12, rtol=0), (one, eight)


def test_raw_counts_still_move_trust() -> None:
    # Backward-compatible path (n_claims=None): more support still means more
    # trust, so unmigrated callers keep their old semantics.
    x = np.full(3, 1.0 / 3.0)
    one = update_trust(x, np.array([1.0, 0.0, 0.0]), np.zeros(3))
    eight = update_trust(x, np.array([8.0, 0.0, 0.0]), np.zeros(3))
    assert eight[0] > one[0]


# --------------------------------------------------------------------------- #
# N = 1 and extreme supports.
# --------------------------------------------------------------------------- #


@pytest.mark.parametrize(
    ("score", "support", "harm"),
    [(0.5, 0.0, 0.0), (0.1, 0.0, 0.0), (0.9, 9.0, 0.0), (0.1, 0.0, 9.0)],
)
def test_single_agent_returns_one(score: float, support: float, harm: float) -> None:
    w = update_trust(np.array([score]), np.array([support]), np.array([harm]))
    assert w.tolist() == [1.0], w
    # Ceiling is inactive: the only feasible point exceeds the nominal 0.9.
    assert w.max() <= effective_ceiling(1) + TOL


def test_extreme_supports_stay_bounded_and_ordered() -> None:
    x = np.array([0.8, 0.1, 0.1])
    up = update_trust(x, np.array([9.0, 0.0, 0.0]), np.zeros(3))
    assert_trust_contract(up, 3)
    assert up[0] > up[1] and up[0] > up[2], up
    assert up[0] <= CEILING + TOL  # N=3 keeps the nominal ceiling

    down = update_trust(x, np.zeros(3), np.array([9.0, 0.0, 0.0]))
    assert_trust_contract(down, 3)
    assert down[0] < down[1] and down[0] < down[2], down

    flat = update_trust(x, np.zeros(3), np.zeros(3))
    assert np.allclose(flat, x, atol=1e-12, rtol=0)


def test_two_sided_bound_when_ceiling_binds() -> None:
    # N=5, ceiling 0.5: the cap (not the floor) is the active constraint.
    w = project_simplex_with_floor(np.array([1.0, 0.0, 0.0, 0.0, 0.0]), floor=0.1, ceiling=0.5)
    assert abs(w[0] - 0.5) <= TOL, w
    assert w.min() >= FLOOR - TOL, w
    assert abs(w.sum() - 1.0) <= TOL, w


# --------------------------------------------------------------------------- #
# Rejections: infeasible polytope and malformed inputs.
# --------------------------------------------------------------------------- #


def test_infeasible_floor_raises() -> None:
    with pytest.raises(ValueError, match="floor"):
        project_simplex_with_floor(np.ones(3), floor=0.4)
    with pytest.raises(ValueError, match="floor"):
        update_trust(np.full(3, 1 / 3), np.zeros(3), np.zeros(3), floor=0.4)


def test_bad_shapes_and_values_raise() -> None:
    with pytest.raises(ValueError):
        project_simplex_with_floor(np.ones((2, 2)))
    with pytest.raises(ValueError):
        project_simplex_with_floor(np.array([]))
    with pytest.raises(ValueError):
        project_simplex_with_floor(np.array([np.nan, 1.0]))
    with pytest.raises(ValueError):
        update_trust(np.ones(3), np.ones(2), np.ones(3))
    with pytest.raises(ValueError):
        update_trust(np.ones(3), np.ones(3), np.ones(2))
    with pytest.raises(ValueError):
        update_trust(np.ones(3), np.ones(3), np.ones(3), n_claims=np.ones(2))
    with pytest.raises(ValueError):
        update_trust(-np.ones(3), np.ones(3), np.ones(3))
    with pytest.raises(ValueError):
        update_trust(np.ones(3), -np.ones(3), np.ones(3))
    with pytest.raises(ValueError):
        update_trust(np.ones(3), np.ones(3), np.ones(3), n_claims=-np.ones(3))


# --------------------------------------------------------------------------- #
# Behavioural sanity: evidence-backed agent outweighs the majority.
# --------------------------------------------------------------------------- #


def test_evidence_backed_agent_wins() -> None:
    # A correct minority backed by evidence outweighs an unsupported majority.
    trust = update_trust(np.array([0.5, 0.5, 0.5]), np.array([3.0, 0.0, 0.0]), np.array([0.0, 1.0, 1.0]))
    votes = np.array([[1, 0], [0, 1], [0, 1]])  # agent 1 vs agents 2+3
    winner = int(np.argmax(trust @ votes))
    assert winner == 0
