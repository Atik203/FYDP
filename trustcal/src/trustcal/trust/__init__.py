"""The core contribution: trust math as pure functions (no I/O).

Operator order is fixed and load-bearing: softmax → clamp → renormalize.
"""

from .aggregation import aggregate, vote_matrix, weighted_aggregate
from .settings import TrustConfig
from .state import TrustState
from .update import update_trust

__all__ = [
    "update_trust",
    "weighted_aggregate",
    "vote_matrix",
    "aggregate",
    "TrustConfig",
    "TrustState",
]
