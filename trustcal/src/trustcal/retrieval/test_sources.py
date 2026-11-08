"""Source clients: parsing is tested with fake HTTP, never the live APIs."""

from __future__ import annotations

from .sources import (
    ARXIV,
    PUBMED,
    SEMANTIC_SCHOLAR,
    agent_source,
    search,
    search_arxiv,
    search_pubmed,
    search_semantic_scholar,
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


def test_arxiv_parses_atom() -> None:
    def fake_get(url, *, params=None, headers=None, timeout=20.0):
        return FakeResponse(text=ARXIV_XML)

    results = search_arxiv("debate", top_k=2, http_get=fake_get)
    assert results[0].source == ARXIV
    assert results[0].title == "Arxiv title"
    assert results[0].id == "2501.00001v1"


def test_semantic_scholar_parses_json() -> None:
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
                    }
                ]
            }
        )

    results = search_semantic_scholar("trust", top_k=1, http_get=fake_get)
    assert results[0].source == SEMANTIC_SCHOLAR
    assert results[0].citations == 9


def test_agent_source_partitioning() -> None:
    assert agent_source(0) == PUBMED
    assert agent_source(1) == ARXIV
    assert agent_source(2) == SEMANTIC_SCHOLAR
    assert agent_source(0, partition=False) == SEMANTIC_SCHOLAR


def test_unknown_source_fails_loudly() -> None:
    try:
        search("nope", "q")
        raise AssertionError("expected ValueError")
    except ValueError:
        pass
