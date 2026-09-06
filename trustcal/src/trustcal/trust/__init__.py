"""The core contribution: trust math as pure functions (no I/O).

Operator order is fixed and load-bearing: softmax → clamp → renormalize.
"""

from .aggregation import weighted_aggregate
from .update import update_trust

__all__ = ["update_trust", "weighted_aggregate"]
