"""Source-partitioned retrieval: PubMed / ArXiv / Semantic Scholar + reranker.

Phase 2 module. Signatures are fixed; implementations land with the trust work.
"""

from .rerank import rerank
from .sources import search_arxiv, search_pubmed, search_semantic_scholar
from .verdicts import classify_claim

__all__ = ["search_pubmed", "search_arxiv", "search_semantic_scholar", "rerank", "classify_claim"]
