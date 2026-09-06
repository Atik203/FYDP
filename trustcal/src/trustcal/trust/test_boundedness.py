"""Boundedness test — the clamp guarantee (Proposition 1) + renormalization.

Verifies the operator order computationally before the math is trusted inside
the larger system (blueprint §13 step 6).
"""

import numpy as np

from .update import clamped_trust, update_trust


def test_boundedness_synthetic() -> None:
    rng = np.random.default_rng(0)
    n_agents = 3
    for _ in range(5000):
        scores = rng.uniform(-5, 5, n_agents)
        support = rng.poisson(1.0, n_agents)
        harm = rng.poisson(1.0, n_agents)
        clamped = clamped_trust(scores, support, harm)
        assert np.all(clamped >= 0.1) and np.all(clamped <= 0.9), f"out of bounds: {clamped}"
        t = update_trust(scores, support, harm)
        assert abs(t.sum() - 1.0) < 1e-9


def test_evidence_backed_agent_wins() -> None:
    # A correct minority backed by evidence outweighs an unsupported majority.
    trust = update_trust(np.array([0.5, 0.5, 0.5]), np.array([3.0, 0.0, 0.0]), np.array([0.0, 1.0, 1.0]))
    votes = np.array([[1, 0], [0, 1], [0, 1]])  # agent 1 vs agents 2+3
    winner = int(np.argmax(trust @ votes))
    assert winner == 0
