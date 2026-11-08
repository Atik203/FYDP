"""Trust-mechanism switches and hyperparameters (blueprint §5.6-5.7, §9 ablations).

Every ablation in the Phase 3b matrix is one field here, so the same debate loop
runs the full mechanism and its four ablations without a code fork.
"""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class TrustConfig:
    """Configuration for one trust-calibrated debate.

    Ablation switches map to roadmap Phase 3b:
      * ``use_trust=False``          -> no trust calibration (majority vote)
      * ``progressive_retrieval=False`` -> retrieve at every round, full depth
      * ``source_partitioning=False``   -> every agent sees every source
      * ``adaptive_triggering=False``   -> update trust every round; True (the
        full mechanism) updates only when the panel is divergent, saving calls.
    """

    alpha: float = 0.5
    beta: float = 0.3
    floor: float = 0.1
    ceiling: float = 0.9
    use_trust: bool = True
    progressive_retrieval: bool = True
    source_partitioning: bool = True
    adaptive_triggering: bool = True
    max_claims: int = 8
    top_k: int = 3

    def as_dict(self) -> dict:
        return {
            "alpha": self.alpha,
            "beta": self.beta,
            "floor": self.floor,
            "ceiling": self.ceiling,
            "use_trust": self.use_trust,
            "progressive_retrieval": self.progressive_retrieval,
            "source_partitioning": self.source_partitioning,
            "adaptive_triggering": self.adaptive_triggering,
            "max_claims": self.max_claims,
            "top_k": self.top_k,
        }
