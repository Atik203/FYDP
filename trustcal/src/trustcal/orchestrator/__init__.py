"""Orchestrator: round sequencing, injection point (t=1→2), K=3 cap, aggregation.

Phase 2 port: LangGraph StateGraph. The loop shape below is the target state machine.
"""

from .debate import DebateRunner
from .injection import SCOPES, InjectionPlan, build_injection, is_checkable

__all__ = ["DebateRunner", "InjectionPlan", "build_injection", "is_checkable", "SCOPES"]
