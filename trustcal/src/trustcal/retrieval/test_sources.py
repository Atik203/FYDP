"""Claim-routed source clients, dedup, and offline parsers."""

from __future__ import annotations

import pytest

from .sources import (
    ARXIV,
    BIO_CLINICAL,
    MATH_CS,
    OPENALEX,
    OTHER,
    PHYSICS_CHEM,
    PUBMED,
    SEMANTIC_SCHOLAR,
    SearchResult,
    agent_source,
    classify_domain,
    dedupe_results,
    route_claim,
    search,
    search_arxiv,
    search_openalex,
    search_pubmed,
    search_semantic_scholar,
    sources_for_claim,
)

PUBMED_XML = """<PubmedArticleSet>
  <PubmedArticle>
    <MedlineCitation><PMID>123</PMID>
      <Article>
        <ArticleTitle>Evidence title</ArticleTitle>
        <Abstract><AbstractText>Supported abstract.</AbstractText></Abstract>
        <Journal><JournalIssue><PubDate><Year>2025</Year></PubDate></JournalIssue></Journal>
      </Article>
    </MedlineCitation>
    <PubmedData><ArticleIdList>
      <ArticleId IdType="doi">10.1000/XYZ</ArticleId>
    </ArticleIdList></PubmedData>
  </PubmedArticle>
</PubmedArticleSet>"""

ARXIV_XML = """<feed xmlns="http://www.w3.org/2005/Atom">
  <entry>
    <id>http://arxiv.org/abs/2501.00001v1</id>
    <title>Arxiv title</title>
    <summary>Arxiv abstract.</summary>
    <published>2025-01-01T00:00:00Z</published>
  </entry>
</feed>"""


class FakeResponse:
    def __init__(self, payload=None, text: str = "") -> None:
        self._payload = payload or {}
        self.text = text

    def json(self):
        return self._payload

    def raise_for_status(self) -> None:
        return None


def test_pubmed_parses_two_step_response() -> None:
    calls = []

    def fake_get(url, *, params=None, headers=None, timeout=20.0):
        calls.append((url, params))
        if "esearch" in url:
            return FakeResponse({"esearchresult": {"idlist": ["123"]}})
        return FakeResponse(text=PUBMED_XML)

    results = search_pubmed("krebs cycle", top_k=3, http_get=fake_get)
    assert len(calls) == 2
    assert results[0].id == "123"
    assert results[0].title == "Evidence title"
    assert "Supported abstract" in results[0].abstract
    assert results[0].year == "2025"
    assert results[0].doi == "10.1000/XYZ"


def test_arxiv_parses_atom() -> None:
    def fake_get(url, *, params=None, headers=None, timeout=20.0):
        return FakeResponse(text=ARXIV_XML)

    results = search_arxiv("debate", top_k=2, http_get=fake_get)
    assert results[0].source == ARXIV
    assert results[0].title == "Arxiv title"
    assert results[0].id == "2501.00001v1"
    assert results[0].arxiv_id == "2501.00001v1"


def test_semantic_scholar_parses_json_and_external_ids() -> None:
    def fake_get(url, *, params=None, headers=None, timeout=20.0):
        return FakeResponse(
            {
                "data": [
                    {
                        "title": "S2 title",
                        "abstract": "S2 abstract",
                        "year": 2024,
                        "citationCount": 9,
                        "paperId": "p1",
                        "url": "https://example.org/p1",
                        "externalIds": {"DOI": "10.1000/abc", "ArXiv": "2501.00001"},
                    }
                ]
            }
        )

    results = search_semantic_scholar("trust", top_k=1, http_get=fake_get)
    assert results[0].source == SEMANTIC_SCHOLAR
    assert results[0].citations == 9
    assert results[0].doi == "10.1000/abc"
    assert results[0].arxiv_id == "2501.00001"


def test_openalex_parses_and_rebuilds_abstract() -> None:
    def fake_get(url, *, params=None, headers=None, timeout=20.0):
        return FakeResponse(
            {
                "results": [
                    {
                        "id": "https://openalex.org/W123",
                        "doi": "https://doi.org/10.1000/ABC",
                        "title": "OpenAlex title",
                        "publication_year": 2025,
                        "cited_by_count": 4,
                        "abstract_inverted_index": {"alpha": [0], "beta": [1]},
                    }
                ]
            }
        )

    results = search_openalex("claim", top_k=1, http_get=fake_get)
    assert results[0].source == OPENALEX
    assert results[0].abstract == "alpha beta"
    assert results[0].id == "W123"
    assert results[0].doi == "10.1000/abc"


def test_bio_claim_routes_to_pubmed() -> None:
    claim = "The protein binds to the receptor in the cell membrane."
    route = route_claim(claim)
    assert route.domain == BIO_CLINICAL
    assert route.sources == (PUBMED, SEMANTIC_SCHOLAR)
    assert "protein" in route.signals
    assert PUBMED in route.as_dict()["sources"]


def test_math_claim_never_routes_to_pubmed() -> None:
    claim = "Prove that every polynomial of odd degree has a real root."
    assert classify_domain(claim) == MATH_CS
    assert sources_for_claim(claim) == (ARXIV, SEMANTIC_SCHOLAR)
    assert PUBMED not in sources_for_claim(claim)


def test_physics_claim_routes_to_arxiv() -> None:
    claim = "A photon is emitted when an electron in an atom drops to a lower orbital."
    assert classify_domain(claim) == PHYSICS_CHEM
    assert sources_for_claim(claim) == (ARXIV, SEMANTIC_SCHOLAR)


def test_other_claim_routes_to_s2_and_openalex() -> None:
    claim = "Which city hosted the 1992 Summer Olympics?"
    assert classify_domain(claim) == OTHER
    assert sources_for_claim(claim) == (SEMANTIC_SCHOLAR, OPENALEX)


def test_domain_override_and_unknown_domain() -> None:
    assert route_claim("Q?", domain="clinical").domain == BIO_CLINICAL
    assert route_claim("Q?", domain="math").sources == (ARXIV, SEMANTIC_SCHOLAR)
    with pytest.raises(ValueError, match="unknown domain"):
        route_claim("Q?", domain="astrology")


def test_routing_is_deterministic() -> None:
    claim = "The enzyme catalyses the reaction in the cell."
    assert route_claim(claim).as_dict() == route_claim(claim).as_dict()


def test_dedupes_by_doi() -> None:
    first = SearchResult(source=PUBMED, title="One", abstract="a", doi="https://doi.org/10.1000/ABC")
    second = SearchResult(source=SEMANTIC_SCHOLAR, title="Two", abstract="b", doi="10.1000/abc")
    assert dedupe_results([first, second]) == [first]


def test_dedupes_by_arxiv_id_across_sources() -> None:
    first = SearchResult(source=ARXIV, title="A", abstract="a", arxiv_id="2501.00001v2")
    second = SearchResult(source=SEMANTIC_SCHOLAR, title="B", abstract="b", arxiv_id="2501.00001")
    assert dedupe_results([first, second]) == [first]


def test_dedupes_by_normalized_title() -> None:
    first = SearchResult(source=ARXIV, title="Attention Is All You Need", abstract="a")
    second = SearchResult(source=SEMANTIC_SCHOLAR, title="attention is all you need.", abstract="b")
    third = SearchResult(source=OPENALEX, title="A different paper", abstract="c")
    assert dedupe_results([first, second, third]) == [first, third]


def test_agent_source_is_kept_as_a_deprecated_wrapper() -> None:
    assert agent_source(0) == PUBMED
    assert agent_source(1) == ARXIV
    assert agent_source(2) == SEMANTIC_SCHOLAR
    assert agent_source(0, partition=False) == SEMANTIC_SCHOLAR


def test_unknown_source_fails_loudly() -> None:
    with pytest.raises(ValueError, match="unknown source"):
        search("nope", "q")
