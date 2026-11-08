"""Trust update operator: log-domain evidence, one softmax, one simplex projection.

Repaired operator order (P0-5), replacing the old softmax -> clamp -> renormalize:

    logit_i = log S_i + alpha * support_i / n_claims_i - beta * harm_i / n_claims_i
    trust   = project_simplex_with_floor(softmax(logit), floor, ceiling)

**Mathematical guarantee.** Let ``N = len(scores)`` and
``effective_ceiling = max(ceiling, 1 / N)``. For every finite input the returned
vector ``w`` satisfies, simultaneously,

    min_i w_i  >= floor - 1e-9
    |sum_i w_i - 1| <= 1e-9
    max_i w_i  <= effective_ceiling + 1e-9

The ceiling is relaxed to ``1 / N`` only when ``N * ceiling < 1``, a case with no
feasible vector at all. ``N = 1`` is degenerate: ``[1.0]`` is the only feasible
vector, so the ceiling is inactive and ``[1.0]`` is returned even though
``1.0 > ceiling``.

**Neutral evidence.** ``support == harm == 0`` (or every ``n_claims == 0``) is an
exact identity for an input that is already feasible, because
``softmax(log S) == S``: trust does not drift toward uniform when no evidence
arrives. Infeasible inputs are projected onto the polytope, never silently
renormalized (the old failure returned ``[0.5017, 0.2491, 0.2491]`` for
``[0.8, 0.1, 0.1]``).

**Claim-count normalization.** Dividing by ``n_claims`` cancels verbosity:
multiplying ``support``, ``harm`` and ``n_claims`` by the same factor leaves the
trust vector unchanged. ``n_claims=None`` keeps the pre-P0 raw-count behaviour
for callers that have not been migrated (``runner.py``, ``TrustState.update``);
``0`` counts contribute no evidence term for that agent.
"""

from __future__ import annotations

import numpy as np

__all__ = ["project_simplex_with_floor", "update_trust"]

_TINY = 1e-12  # multiplier floor for zero trust scores
_TOL = 1e-12   # feasibility tolerance for the exact-identity shortcut


def _as_vector(name: str, value, n: int | None = None) -> np.ndarray:
    """Coerce to a finite 1-D float64 vector, with a named error on failure."""
    try:
        arr = np.asarray(value, dtype=float)
    except (TypeError, ValueError) as exc:  # ragged lists, strings, ...
        raise ValueError(f"{name} must be a numeric vector: {exc}") from exc
    if arr.ndim != 1:
        raise ValueError(f"{name} must be a 1-D vector, got shape {arr.shape}")
    if arr.size == 0:
        raise ValueError(f"{name} must not be empty")
    if not np.isfinite(arr).all():
        raise ValueError(f"{name} contains NaN or infinity")
    if n is not None and arr.size != n:
        raise ValueError(
            f"{name} must have one entry per agent ({n}), got {arr.size}"
        )
    return arr


def _resolve_bounds(floor, ceiling) -> tuple[float, float]:
    """Validate the trust-policy bounds and return them as floats."""
    try:
        floor = float(floor)
        ceiling = float(ceiling)
    except (TypeError, ValueError) as exc:
        raise ValueError(f"floor and ceiling must be numeric: {exc}") from exc
    if not 0.0 <= floor < 1.0:
        raise ValueError(f"floor must be in [0, 1), got {floor}")
    if not 0.0 < ceiling <= 1.0:
        raise ValueError(f"ceiling must be in (0, 1], got {ceiling}")
    if floor > ceiling:
        raise ValueError(f"floor {floor} exceeds ceiling {ceiling}")
    return floor, ceiling


def _project_onto_polytope(x: np.ndarray, floor: float, ceiling: float) -> np.ndarray:
    """Project a validated 1-D vector; assumes bounds are already validated."""
    n = x.size
    if n * floor > 1.0 + _TOL:
        raise ValueError(
            f"infeasible trust polytope: {n} agents x floor {floor} > 1; "
            f"need floor <= 1/{n} = {1.0 / n:.6g}"
        )
    upper = max(ceiling, 1.0 / n)  # effective ceiling

    # Already feasible: return unchanged. This is what makes neutral evidence an
    # exact no-op instead of a projection that drifts by round-off.
    if (
        x.min() >= floor - _TOL
        and x.max() <= upper + _TOL
        and abs(x.sum() - 1.0) <= _TOL
    ):
        return x.copy()

    # Water-filling on the breakpoints theta = x_i - upper and theta = x_i - floor.
    breaks = np.unique(np.concatenate((x - upper, x - floor)))  # ascending
    sums = np.clip(x[None, :] - breaks[:, None], floor, upper).sum(axis=1)
    crossed = np.nonzero(sums <= 1.0 + _TOL)[0]
    j = int(crossed[0]) if crossed.size else int(breaks.size - 1)
    if j == 0:
        theta = float(breaks[0])
    else:
        # Inside one segment the active set (capped / free / floored) is fixed.
        mid = 0.5 * float(breaks[j - 1] + breaks[j])
        delta = x - mid
        free = (delta >= floor) & (delta <= upper)
        capped = delta > upper
        floored = delta < floor
        m = int(free.sum())
        if m == 0:  # flat segment: every coordinate sits on a bound
            theta = mid
        else:
            theta = (
                float(x[free].sum())
                + upper * int(capped.sum())
                + floor * int(floored.sum())
                - 1.0
            ) / m
    w = np.clip(x - theta, floor, upper)

    # Spread any residual round-off over the free coordinates; bounds-preserving.
    residual = 1.0 - float(w.sum())
    if abs(residual) > _TOL:
        free_w = (w > floor) & (w < upper)
        if free_w.any():
            w[free_w] += residual / float(free_w.sum())
            w = np.clip(w, floor, upper)
    return w


def project_simplex_with_floor(
    scores: np.ndarray,
    floor: float = 0.1,
    ceiling: float = 0.9,
) -> np.ndarray:
    """Euclidean projection onto ``{w : floor <= w_i <= ceiling, sum(w) = 1}``.

    Solves ``w_i = clip(x_i - theta, floor, effective_ceiling)`` for the scalar
    ``theta`` that makes the vector sum to one. The threshold is found exactly
    (not by bisection): the piecewise-linear sum is evaluated at every
    breakpoint ``x_i - ceiling`` and ``x_i - floor``, the crossing segment is
    located, and ``theta`` is solved on that segment in closed form.

    Guarantees ``min >= floor - 1e-9``, ``|sum - 1| <= 1e-9`` and
    ``max <= max(ceiling, 1/N) + 1e-9``. The effective ceiling is ``1/N`` when
    the nominal ceiling is below the uniform share; ``N = 1`` therefore returns
    ``[1.0]`` and the ceiling is inactive (the only feasible point exceeds it).

    Raises:
        ValueError: non-finite/non-1-D input, ``floor`` outside ``[0, 1)``,
            ``ceiling`` outside ``(0, 1]``, ``floor > ceiling``, or an
            infeasible polytope (``N * floor > 1``).
    """
    x = _as_vector("scores", scores)
    floor, ceiling = _resolve_bounds(floor, ceiling)
    return _project_onto_polytope(x, floor, ceiling)


def update_trust(
    scores: np.ndarray,
    support: np.ndarray,
    harm: np.ndarray,
    n_claims: np.ndarray | None = None,
    *,
    alpha: float = 0.5,
    beta: float = 0.3,
    floor: float = 0.1,
    ceiling: float = 0.9,
) -> np.ndarray:
    """One trust update: log-prior + normalized evidence -> softmax -> projection.

    Args:
        scores: Current trust (or any positive weight vector), shape ``(N,)``.
            Treated as probabilities when it sums to one; zeros are clamped to
            1e-12 before the log.
        support: Supported-claim counts (or scores) per agent, shape ``(N,)``.
        harm: Contradicted-claim counts (or scores) per agent, shape ``(N,)``.
        n_claims: Claims checked per agent, shape ``(N,)``. ``None`` keeps the
            legacy raw-count behaviour; an entry of ``0`` disables the evidence
            term for that agent.

    Returns:
        Trust vector satisfying the module-level guarantee.

    Note:
        The signature follows `docs/agent/09_P0_INTERFACES.md`. ``n_claims`` is
        the fourth positional argument; ``alpha``/``beta``/``floor``/``ceiling``
        are keyword-only, so legacy calls such as
        ``update_trust(scores, support, harm, alpha=..., beta=...)`` still work.
    """
    s = _as_vector("scores", scores)
    if np.any(s < 0.0):
        raise ValueError("scores must be non-negative trust weights")
    v = _as_vector("support", support, s.size)
    h = _as_vector("harm", harm, s.size)
    if np.any(v < 0.0) or np.any(h < 0.0):
        raise ValueError("support and harm must be non-negative")
    alpha = float(alpha)
    beta = float(beta)
    if not (np.isfinite(alpha) and np.isfinite(beta)):
        raise ValueError("alpha and beta must be finite")
    floor, ceiling = _resolve_bounds(floor, ceiling)

    logits = np.log(np.maximum(s, _TINY))
    if n_claims is None:
        logits = logits + alpha * v - beta * h
    else:
        counts = _as_vector("n_claims", n_claims, s.size)
        if np.any(counts < 0.0):
            raise ValueError("n_claims must be non-negative")
        positive = counts > 0.0
        if positive.any():
            rate = np.zeros_like(s)
            rate[positive] = v[positive] / counts[positive]
            logits = logits + alpha * rate
            rate[positive] = h[positive] / counts[positive]
            logits = logits - beta * rate

    logits = logits - logits.max()  # numerically stable softmax, applied once
    weights = np.exp(logits)
    weights /= weights.sum()
    return _project_onto_polytope(weights, floor, ceiling)
