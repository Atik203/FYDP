"""One client per source: Agent A -> PubMed, B -> arXiv, C -> Semantic Scholar (§5.5).

All three APIs are keyless at low volume (PubMed/S2 keys raise limits). HTTP is
lazy-imported and injectable, so every parser is testable offline with a fake
response object. No network call happens at import time.
"""

from __future__ import annotations

import time
import xml.etree.ElementTree as ET
from dataclasses import asdict, dataclass
from typing import Any, Callable

from ..config import get_key

PUBMED = "pubmed"
ARXIV = "arxiv"
SEMANTIC_SCHOLAR = "semantic_scholar"
SOURCES = (PUBMED, ARXIV, SEMANTIC_SCHOLAR)

PUBMED_SEARCH = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi"
PUBMED_FETCH = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi"
ARXIV_API = "https://export.arxiv.org/api/query"
S2_API = "https://api.semanticscholar.org/graph/v1/paper/search"

_ATOM = {"atom": "http://www.w3.org/2005/Atom"}


@dataclass(frozen=True)
class SearchResult:
    source: str
    title: str
    abstract: str
    id: str = ""
    url: str = ""
    year: str = ""
    citations: int | None = None

    def as_dict(self) -> dict:
        return asdict(self)


HttpGet = Callable[..., Any]


def _http_get(url: str, *, params: dict | None = None, headers: dict | None = None, timeout: float = 20.0) -> Any:
    """Thin requests wrapper (lazy import keeps GPU-free tests dependency-light)."""
    import requests  # lazy: not needed for trust/math tests

    response = requests.get(url, params=params, headers=headers, timeout=timeout)
    response.raise_for_status()
    return response


def _get_with_retry(
    http_get: HttpGet,
    url: str,
    *,
    params: dict | None = None,
    headers: dict | None = None,
    timeout: float = 20.0,
    attempts: int = 3,
) -> Any:
    last: Exception | None = None
    for attempt in range(attempts):
        try:
            return http_get(url, params=params, headers=headers, timeout=timeout)
        except Exception as exc:  # noqa: BLE001 - retry decision is local
            last = exc
            if attempt < attempts - 1:
                time.sleep(min(2.0**attempt, 8.0))
    raise RuntimeError(f"HTTP GET failed after {attempts} attempts: {last}")


def _text(element: ET.Element | None) -> str:
    if element is None:
        return ""
    return " ".join("".join(element.itertext()).split())


def search_pubmed(
    query: str,
    top_k: int = 10,
    *,
    http_get: HttpGet | None = None,
    api_key: str | None = None,
) -> list[SearchResult]:
    """PubMed E-utilities: esearch for ids, efetch for titles/abstracts."""
    get = http_get or _http_get
    key = api_key or get_key("PUBMED_API_KEY")
    common = {"api_key": key} if key else {}
    search = _get_with_retry(
        get,
        PUBMED_SEARCH,
        params={"db": "pubmed", "term": query, "retmode": "json", "retmax": top_k, **common},
    )
    payload = search.json()
    ids = payload.get("esearchresult", {}).get("idlist", [])[:top_k]
    if not ids:
        return []
    fetch = _get_with_retry(
        get,
        PUBMED_FETCH,
        params={"db": "pubmed", "id": ",".join(ids), "retmode": "xml", **common},
    )
    root = ET.fromstring(fetch.text)
    results: list[SearchResult] = []
    for article in root.findall(".//PubmedArticle"):
        pmid = _text(article.find(".//PMID"))
        title = _text(article.find(".//ArticleTitle"))
        abstract = " ".join(
            _text(node) for node in article.findall(".//Abstract/AbstractText") if _text(node)
        )
        year = _text(article.find(".//JournalIssue/PubDate/Year")) or _text(
            article.find(".//JournalIssue/PubDate/MedlineDate")
        )[:4]
        if title:
            results.append(
                SearchResult(
                    source=PUBMED,
                    title=title,
                    abstract=abstract,
                    id=pmid,
                    url=f"https://pubmed.ncbi.nlm.nih.gov/{pmid}/" if pmid else "",
                    year=year,
                )
            )
    return results[:top_k]


def search_arxiv(
    query: str,
    top_k: int = 10,
    *,
    http_get: HttpGet | None = None,
) -> list[SearchResult]:
    """arXiv Atom API. Query is wrapped in ``all:`` so prose questions work."""
    get = http_get or _http_get
    response = _get_with_retry(
        get,
        ARXIV_API,
        params={"search_query": f"all:{query}", "start": 0, "max_results": top_k},
    )
    root = ET.fromstring(response.text)
    results: list[SearchResult] = []
    for entry in root.findall("atom:entry", _ATOM):
        title = _text(entry.find("atom:title", _ATOM))
        abstract = _text(entry.find("atom:summary", _ATOM))
        link = _text(entry.find("atom:id", _ATOM))
        published = _text(entry.find("atom:published", _ATOM))
        if title:
            results.append(
                SearchResult(
                    source=ARXIV,
                    title=title,
                    abstract=abstract,
                    id=link.rsplit("/", 1)[-1] if link else "",
                    url=link,
                    year=published[:4],
                )
            )
    return results[:top_k]


def search_semantic_scholar(
    query: str,
    top_k: int = 10,
    *,
    http_get: HttpGet | None = None,
    api_key: str | None = None,
) -> list[SearchResult]:
    """Semantic Scholar Graph API; an API key is optional but raises the limit."""
    get = http_get or _http_get
    key = api_key or get_key("SEMANTIC_SCHOLAR_API_KEY")
    headers = {"x-api-key": key} if key else {}
    response = _get_with_retry(
        get,
        S2_API,
        params={
            "query": query,
            "limit": top_k,
            "fields": "title,abstract,year,citationCount,paperId,url",
        },
        headers=headers,
    )
    payload = response.json()
    results: list[SearchResult] = []
    for row in payload.get("data", [])[:top_k]:
        title = (row.get("title") or "").strip()
        if not title:
            continue
        paper_id = row.get("paperId") or ""
        results.append(
            SearchResult(
                source=SEMANTIC_SCHOLAR,
                title=title,
                abstract=(row.get("abstract") or "").strip(),
                id=paper_id,
                url=row.get("url") or (f"https://www.semanticscholar.org/paper/{paper_id}" if paper_id else ""),
                year=str(row.get("year") or ""),
                citations=row.get("citationCount"),
            )
        )
    return results[:top_k]


SEARCHERS = {
    PUBMED: search_pubmed,
    ARXIV: search_arxiv,
    SEMANTIC_SCHOLAR: search_semantic_scholar,
}


def search(source: str, query: str, top_k: int = 10, **kwargs: Any) -> list[SearchResult]:
    """Dispatch by source name; unknown sources fail loudly."""
    try:
        searcher = SEARCHERS[source]
    except KeyError as exc:
        raise ValueError(f"unknown source {source!r}; expected one of {SOURCES}") from exc
    return searcher(query, top_k=top_k, **kwargs)


def agent_source(agent_index: int, partition: bool = True) -> str:
    """Source assignment per §5.5. With partitioning off, everyone sees S2.

    S2 is the broadest index; using it for the ablation keeps the comparison
    about *partitioning*, not about one source being weaker.
    """
    if not partition:
        return SEMANTIC_SCHOLAR
    return SOURCES[agent_index % len(SOURCES)]


def passage_text(result: SearchResult, max_chars: int = 1200) -> str:
    """Compact passage for prompts: title + abstract, bounded for context."""
    text = f"{result.title}. {result.abstract}".strip()
    return text[:max_chars]
