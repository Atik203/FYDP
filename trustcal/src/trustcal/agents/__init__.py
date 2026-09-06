"""Agent personas: prompt templates + response parsing (per blueprint §5.3/§5.5)."""

from .parser import extract_claims, parse_position
from .prompts import AGENT_INITIAL, AGENT_REVISION, GATE_PROMPT, INJECTION_SYSTEM

__all__ = [
    "GATE_PROMPT",
    "AGENT_INITIAL",
    "AGENT_REVISION",
    "INJECTION_SYSTEM",
    "extract_claims",
    "parse_position",
]
