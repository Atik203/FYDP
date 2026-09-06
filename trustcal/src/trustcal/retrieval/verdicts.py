"""Cross-encoder reranking (ms-marco-MiniLM) + per-claim evidence verdicts."""

from __future__ import annotations


def rerank(claim: str, passages: list[str], top_k: int = 3) -> list[tuple[str, float]]:
    """Phase 2 — cross-encoder scores claim×passage, returns top-k (passage, score)."""
    raise NotImplementedError("Phase 2: cross-encoder reranker")


def classify_claim(claim: str, passages: list[str], scores: list[float]) -> str:
    """Verdict for one claim: 'supported' | 'contradicted' | 'unverifiable'.

    Unverifiable ⇒ abstain — excluded from the trust update (no reward/penalty).
    """
    raise NotImplementedError("Phase 2: evidence scoring")
