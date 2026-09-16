"""Agent personas: prompt templates + response parsing (per blueprint §5.3/§5.5)."""

from .parser import claims_or_fallback, extract_claims, fallback_claims, parse_position
from .prompts import AGENT_INITIAL, AGENT_REVISION, AGENT_SYSTEM, GATE_PROMPT, INJECTION_SYSTEM

__all__ = [
    "GATE_PROMPT",
    "AGENT_SYSTEM",
    "AGENT_INITIAL",
    "AGENT_REVISION",
    "INJECTION_SYSTEM",
    "extract_claims",
    "fallback_claims",
    "claims_or_fallback",
    "parse_position",
]
