"""Retriever: claim routing, equal volume, progressive depth, cache, failure isolation."""

from __future__ import annotations

from .pipeline import RetrievalConfig, Retriever, StaticRetriever, evidence_block, select_evidence
from .sources import ARXIV, MATH_CS, PUBMED, SEMANTIC_SCHOLAR, SearchResult

MATH_CLAIM = "Prove that every polynomial of odd degree has a real root."
BIO_CLAIM = "The protein binds to the receptor in the cell membrane."


def _result(source: str, title: str | None = None) -> SearchResult:
    return SearchResult(
        source=source,
        title=title or f"{source} title",
        abstract=f"{source} abstract about the claim",
    )


def test_math_claim_never_calls_pubmed() -> None:
    calls = []

    def fake_search(source, query, top_k):
        calls.append(source)
        return [_result(source)]

    retriever = Retriever(search_fn=fake_search)
    retriever.retrieve(0, MATH_CLAIM)
    retriever.retrieve(1, MATH_CLAIM)
    assert PUBMED not in calls
    assert set(calls) == {ARXIV, SEMANTIC_SCHOLAR}
    assert len(retriever.routes) == 1  # one logged decision per distinct claim
    assert retriever.routes[-1]["domain"] == MATH_CS
    assert retriever.routes[-1]["sources"] == [ARXIV, SEMANTIC_SCHOLAR]


def test_bio_claim_calls_pubmed() -> None:
    calls = []

    def fake_search(source, query, top_k):
        calls.append(source)
        return [_result(source)]

    Retriever(search_fn=fake_search).retrieve(0, BIO_CLAIM)
    assert PUBMED in calls
    assert ARXIV not in calls


def test_partition_rotates_routed_sources() -> None:
    calls = []

    def fake_search(source, query, top_k):
        calls.append(source)
        return [_result(source)]

    first = "Prove that every polynomial of odd degree has a real root."
    second = "Let G be a graph; prove the theorem about its vertices."
    retriever = Retriever(search_fn=fake_search)
    retriever.retrieve(0, first)
    retriever.retrieve(1, second)
    assert calls == [ARXIV, SEMANTIC_SCHOLAR, SEMANTIC_SCHOLAR, ARXIV]


def test_unpartitioned_uses_fixed_routed_order() -> None:
    calls = []

    def fake_search(source, query, top_k):
        calls.append(source)
        return [_result(source)]

    first = "Prove that every polynomial of odd degree has a real root."
    second = "Let G be a graph; prove the theorem about its vertices."
    retriever = Retriever(search_fn=fake_search, config=RetrievalConfig(partition=False))
    retriever.retrieve(0, first)
    retriever.retrieve(1, second)
    assert calls == [ARXIV, SEMANTIC_SCHOLAR, ARXIV, SEMANTIC_SCHOLAR]


def test_evidence_volume_is_equal_across_partition_conditions() -> None:
    def fake_search(source, query, top_k):
        return [
            SearchResult(source=source, title=f"{source} {i}", abstract=f"{source} abstract {i} about polynomial")
            for i in range(3)
        ]

    for partition in (True, False):
        retriever = Retriever(
            search_fn=fake_search,
            config=RetrievalConfig(top_k=5, prompt_passages=3, partition=partition),
        )
        volumes = {agent: len(retriever.retrieve(agent, MATH_CLAIM)) for agent in (0, 1, 2)}
        assert volumes == {0: 3, 1: 3, 2: 3}, f"partition={partition}"
        for agent in (0, 1, 2):
            assert len(set(retriever.retrieve(agent, MATH_CLAIM))) == 3


def test_progressive_depth() -> None:
    calls = []

    def fake_search(source, query, top_k):
        calls.append((source, top_k))
        return [_result(source)]

    retriever = Retriever(search_fn=fake_search, config=RetrievalConfig(top_k=6, progressive=True))
    retriever.retrieve(0, MATH_CLAIM, round_number=1)
    retriever.retrieve(0, MATH_CLAIM, round_number=3)
    assert calls == [(ARXIV, 3), (SEMANTIC_SCHOLAR, 3), (ARXIV, 6), (SEMANTIC_SCHOLAR, 6)]


def test_cache_prevents_duplicate_requests() -> None:
    calls = []

    def fake_search(source, query, top_k):
        calls.append(query)
        return [_result(source, f"{source} {i}") for i in range(5)]

    retriever = Retriever(search_fn=fake_search)
    retriever.retrieve(0, MATH_CLAIM)
    retriever.retrieve(0, MATH_CLAIM)
    assert calls == [MATH_CLAIM]  # first source alone supplies top_k


def test_search_failure_is_isolated() -> None:
    def broken(source, query, top_k):
        raise RuntimeError("api down")

    retriever = Retriever(search_fn=broken)
    assert retriever.retrieve(0, MATH_CLAIM) == []
    assert len(retriever.errors) == 2
    assert "api down" in retriever.errors[0]


def test_static_retriever_and_evidence_block() -> None:
    retriever = StaticRetriever({0: {"claim": ["p1", "p2"]}}, fallback=["fallback"])
    assert retriever.retrieve(0, "claim") == ["p1", "p2"]
    assert retriever.retrieve(1, "claim") == ["fallback"]
    block = evidence_block(["one", "two"])
    assert "[1] one" in block and "[2] two" in block
    assert evidence_block([]) == "(no evidence retrieved)"


def test_select_evidence_dedupes_then_takes_top_k() -> None:
    passages = [
        "Title. Abstract one.",
        "title.  abstract ONE.",
        "Other. Abstract two.",
        "",
        "Third. Abstract three.",
    ]
    assert select_evidence(passages, 2) == ["Title. Abstract one.", "Other. Abstract two."]
    assert select_evidence(passages, 10) == [
        "Title. Abstract one.",
        "Other. Abstract two.",
        "Third. Abstract three.",
    ]
    assert select_evidence(passages, 0) == []
