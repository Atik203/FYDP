"""Atomic claim decomposition (blueprint §5.3).

Wraps the tagged/fallback parser in a small dataclass so retrieval and verdict
code never has to know whether the model complied with ``<claim>`` tags.
"""

from __future__ import annotations

from dataclasses import dataclass

from .parser import claims_or_fallback


@dataclass(frozen=True)
class Claim:
    id: str
    text: str


def decompose(text: str, max_claims: int = 20) -> list[Claim]:
    """Return claims in model order, tagged output first, sentence fallback second."""
    return [Claim(cid, claim) for cid, claim in claims_or_fallback(text)[:max_claims]]


def claim_texts(text: str, max_claims: int = 20) -> list[str]:
    """Convenience for retrieval loops that only need the strings."""
    return [c.text for c in decompose(text, max_claims=max_claims)]
