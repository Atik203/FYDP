"""Trust state for one debate: uniform start, bounded updates, full trajectory log."""

from __future__ import annotations

import numpy as np

from .settings import TrustConfig
from .update import update_trust


class TrustState:
    """Per-agent trust scores with an append-only trajectory.

    The trajectory is load-bearing: Phase 4 needs it to check Propositions 2-3
    empirically, and the Month-1 pilot records both aggregations per question.
    """

    def __init__(self, n_agents: int, config: TrustConfig | None = None) -> None:
        if n_agents < 1:
            raise ValueError("a debate needs at least one agent")
        self.config = config or TrustConfig()
        self.scores = np.full(n_agents, 1.0 / n_agents, dtype=float)
        self.trajectory: list[list[float]] = [self.scores.tolist()]

    def update(
        self,
        support: list[float],
        harm: list[float],
        n_claims: list[float] | None = None,
    ) -> np.ndarray:
        """Apply one evidence round; returns the new score vector.

        ``n_claims`` enables per-agent claim-count normalization (P0-5); when
        omitted, raw counts are used exactly as before.
        """
        if len(support) != len(self.scores) or len(harm) != len(self.scores):
            raise ValueError("support/harm must have one entry per agent")
        if n_claims is not None and len(n_claims) != len(self.scores):
            raise ValueError("n_claims must have one entry per agent")
        self.scores = update_trust(
            self.scores,
            np.asarray(support, dtype=float),
            np.asarray(harm, dtype=float),
            None if n_claims is None else np.asarray(n_claims, dtype=float),
            alpha=self.config.alpha,
            beta=self.config.beta,
            floor=self.config.floor,
            ceiling=self.config.ceiling,
        )
        self.trajectory.append(self.scores.tolist())
        return self.scores

    def as_dict(self) -> dict:
        return {
            "final": self.scores.tolist(),
            "trajectory": self.trajectory,
            "config": self.config.as_dict(),
        }
