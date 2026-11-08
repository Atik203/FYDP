"""Agent personas: prompt templates + response parsing (per blueprint §5.3/§5.5)."""

from .claims import Claim, claim_texts, decompose
from .parser import claims_or_fallback, extract_claims, fallback_claims, parse_position
from .prompts import (
    AGENT_INITIAL,
    AGENT_REVISION,
    AGENT_REVISION_EVIDENCE,
    AGENT_SYSTEM,
    CONFIDENCE_INITIAL,
    CONSENSAGENT_REWRITE,
    CONSENSAGENT_REVISION,
    GATE_PROMPT,
    IMAD_SELF_CRITIQUE,
    INJECTION_SYSTEM,
    MOA_AGGREGATE,
    TRUST_PROMPT,
)

__all__ = [
    "GATE_PROMPT",
    "AGENT_SYSTEM",
    "AGENT_INITIAL",
    "AGENT_REVISION",
    "AGENT_REVISION_EVIDENCE",
    "CONFIDENCE_INITIAL",
    "CONSENSAGENT_REVISION",
    "CONSENSAGENT_REWRITE",
    "MOA_AGGREGATE",
    "TRUST_PROMPT",
    "IMAD_SELF_CRITIQUE",
    "INJECTION_SYSTEM",
    "extract_claims",
    "fallback_claims",
    "claims_or_fallback",
    "parse_position",
    "Claim",
    "decompose",
    "claim_texts",
]
