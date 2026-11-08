"""The core contribution: trust math as pure functions (no I/O).

Operator order is fixed and load-bearing: log-prior + evidence → softmax once →
simplex projection with floor/ceiling (`update.py`).
"""

from .aggregation import aggregate, vote_matrix, weighted_aggregate
from .settings import TrustConfig
from .state import TrustState
from .update import project_simplex_with_floor, update_trust

__all__ = [
    "update_trust",
    "project_simplex_with_floor",
    "weighted_aggregate",
    "vote_matrix",
    "aggregate",
    "TrustConfig",
    "TrustState",
]
