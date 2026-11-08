"""Source-partitioned retrieval + per-claim evidence verdicts (Phase 2)."""

from .pipeline import RetrievalConfig, Retriever, StaticRetriever, evidence_block
from .sources import (
    ARXIV,
    PUBMED,
    SEMANTIC_SCHOLAR,
    SOURCES,
    SearchResult,
    agent_source,
    passage_text,
    search,
    search_arxiv,
    search_pubmed,
    search_semantic_scholar,
)
from .verdicts import (
    CONTRADICTED,
    SUPPORTED,
    UNVERIFIABLE,
    VERDICTS,
    classify_claim,
    count_verdicts,
    lexical_score,
    rerank,
)

__all__ = [
    "Retriever",
    "RetrievalConfig",
    "StaticRetriever",
    "evidence_block",
    "SearchResult",
    "search",
    "search_pubmed",
    "search_arxiv",
    "search_semantic_scholar",
    "agent_source",
    "passage_text",
    "PUBMED",
    "ARXIV",
    "SEMANTIC_SCHOLAR",
    "SOURCES",
    "classify_claim",
    "count_verdicts",
    "rerank",
    "lexical_score",
    "SUPPORTED",
    "CONTRADICTED",
    "UNVERIFIABLE",
    "VERDICTS",
]
