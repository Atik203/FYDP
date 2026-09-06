"""Trust update rule: S_i(t+1) = S_i(t) + alpha*V_i - beta*H_i → softmax → clamp → renormalize.

Pure numpy, no I/O — unit-testable without any models running (blueprint §5.6).

Boundedness note (Proposition 1): the guarantee holds for the *clamped* scores —
after renormalization, an agent that dominates softmax can end slightly below
the floor (e.g. 0.818 / 0.091 / 0.091). That is the specified operator order;
the test asserts exactly that guarantee.
"""

from __future__ import annotations

import numpy as np


def clamped_trust(
    scores: np.ndarray,
    support: np.ndarray,
    harm: np.ndarray,
    alpha: float = 0.5,
    beta: float = 0.3,
    floor: float = 0.1,
    ceiling: float = 0.9,
) -> np.ndarray:
    """Softmax(raw) → clamp[floor, ceiling]. Every element is in [floor, ceiling]."""
    raw = scores + alpha * support - beta * harm
    exp = np.exp(raw - raw.max())          # numerically stable softmax
    soft = exp / exp.sum()
    return np.clip(soft, floor, ceiling)


def update_trust(
    scores: np.ndarray,
    support: np.ndarray,
    harm: np.ndarray,
    alpha: float = 0.5,
    beta: float = 0.3,
    floor: float = 0.1,
    ceiling: float = 0.9,
) -> np.ndarray:
    """Full operator order: softmax → clamp → renormalize. Output sums to 1."""
    clamped = clamped_trust(scores, support, harm, alpha, beta, floor, ceiling)
    return clamped / clamped.sum()
