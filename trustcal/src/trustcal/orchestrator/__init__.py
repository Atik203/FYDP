"""Orchestrator: round sequencing, injection point (t=1→2), K=3 cap, aggregation.

Phase 2 port: LangGraph StateGraph. The loop shape below is the target state machine.
"""

from .debate import DebateRunner
from .injection import SCOPES, InjectionPlan, build_injection, is_checkable
from .interventions import (
    DEFAULT_PLACEBO_UNIT,
    GOLD_EVIDENCE_DATASETS,
    GOLD_SOURCE_ANSWER,
    GOLD_SOURCE_EVIDENCE,
    ORACLE_MODES,
    PLACEBO_MODES,
    PLACEBO_UNITS,
    check_oracle_records,
    check_placebo_records,
)

__all__ = [
    "DebateRunner",
    "InjectionPlan",
    "build_injection",
    "is_checkable",
    "SCOPES",
    "PLACEBO_MODES",
    "PLACEBO_UNITS",
    "DEFAULT_PLACEBO_UNIT",
    "ORACLE_MODES",
    "GOLD_EVIDENCE_DATASETS",
    "GOLD_SOURCE_ANSWER",
    "GOLD_SOURCE_EVIDENCE",
    "check_placebo_records",
    "check_oracle_records",
]
