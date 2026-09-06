"""One client per source. Agent A→PubMed, B→ArXiv, C→Semantic Scholar (§5.5)."""

from __future__ import annotations


def search_pubmed(query: str, top_k: int = 10) -> list[dict]:
    """Phase 2 — E-utilities esearch/efetch. Returns [{'title', 'abstract', 'pmid', 'citations'}]."""
    raise NotImplementedError("Phase 2: PubMed E-utilities")


def search_arxiv(query: str, top_k: int = 10) -> list[dict]:
    """Phase 2 — arxiv.org API. Returns [{'title', 'abstract', 'arxiv_id'}]."""
    raise NotImplementedError("Phase 2: arXiv API")


def search_semantic_scholar(query: str, top_k: int = 10) -> list[dict]:
    """Phase 2 — Semantic Scholar Graph API (needs SEMANTIC_SCHOLAR_API_KEY for higher limits)."""
    raise NotImplementedError("Phase 2: Semantic Scholar API")
