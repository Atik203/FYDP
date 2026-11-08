"""Retriever: partitioning, progressive depth, cache, failure isolation."""

from __future__ import annotations

from .pipeline import RetrievalConfig, Retriever, StaticRetriever, evidence_block
from .sources import ARXIV, PUBMED, SEMANTIC_SCHOLAR, SearchResult


def _result(source: str, title: str = "T") -> SearchResult:
    return SearchResult(source=source, title=title, abstract=f"{source} abstract about the claim")


def test_partitioned_agents_use_their_source() -> None:
    calls = []

    def fake_search(source, query, top_k):
        calls.append((source, query, top_k))
        return [_result(source)]

    retriever = Retriever(search_fn=fake_search)
    retriever.retrieve(0, "claim")
    retriever.retrieve(1, "claim")
    retriever.retrieve(2, "claim")
    assert [c[0] for c in calls] == [PUBMED, ARXIV, SEMANTIC_SCHOLAR]


def test_unpartitioned_agent_sees_all_sources() -> None:
    calls = []

    def fake_search(source, query, top_k):
        calls.append(source)
        return [_result(source)]

    retriever = Retriever(search_fn=fake_search, config=RetrievalConfig(partition=False))
    retriever.retrieve(0, "claim")
    assert calls == [PUBMED, ARXIV, SEMANTIC_SCHOLAR]


def test_progressive_depth() -> None:
    calls = []

    def fake_search(source, query, top_k):
        calls.append(top_k)
        return [_result(source)]

    retriever = Retriever(search_fn=fake_search, config=RetrievalConfig(top_k=6, progressive=True))
    retriever.retrieve(0, "claim", round_number=1)
    retriever.retrieve(0, "claim", round_number=3)
    assert calls == [3, 6]


def test_cache_prevents_duplicate_requests() -> None:
    calls = []

    def fake_search(source, query, top_k):
        calls.append(query)
        return [_result(source)]

    retriever = Retriever(search_fn=fake_search)
    retriever.retrieve(0, "same claim")
    retriever.retrieve(0, "same claim")
    assert calls == ["same claim"]


def test_search_failure_is_isolated() -> None:
    def broken(source, query, top_k):
        raise RuntimeError("api down")

    retriever = Retriever(search_fn=broken)
    assert retriever.retrieve(0, "claim") == []
    assert retriever.errors and "api down" in retriever.errors[0]


def test_static_retriever_and_evidence_block() -> None:
    retriever = StaticRetriever({0: {"claim": ["p1", "p2"]}}, fallback=["fallback"])
    assert retriever.retrieve(0, "claim") == ["p1", "p2"]
    assert retriever.retrieve(1, "claim") == ["fallback"]
    block = evidence_block(["one", "two"])
    assert "[1] one" in block and "[2] two" in block
    assert evidence_block([]) == "(no evidence retrieved)"
