"""Orchestrator: round sequencing, injection point (t=1→2), K=3 cap, aggregation.

Phase 2 port: LangGraph StateGraph. The loop shape below is the target state machine.
"""

from .debate import DebateRunner

__all__ = ["DebateRunner"]
