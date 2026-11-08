"""One client per source, plus claim→domain routing and evidence dedup (P0-8).

All APIs are keyless at low volume (PubMed/S2 keys raise limits). HTTP is
lazy-imported and injectable, so every parser is testable offline with a fake
response object. No network call happens at import time.

P0-8 replaces the old agent→source assignment with claim→domain routing:
bio/clinical → PubMed + S2, physics/chemistry → arXiv + S2, math/CS → arXiv +
S2, other → S2 + OpenAlex. `agent_source` is kept only as a deprecated wrapper
for older callers/ablation code.
"""

from __future__ import annotations

import re
import time
import xml.etree.ElementTree as ET
from dataclasses import asdict, dataclass
from typing import Any, Callable

from ..config import get_key

PUBMED = "pubmed"
ARXIV = "arxiv"
SEMANTIC_SCHOLAR = "semantic_scholar"
OPENALEX = "openalex"
SOURCES = (PUBMED, ARXIV, SEMANTIC_SCHOLAR, OPENALEX)

PUBMED_SEARCH = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi"
PUBMED_FETCH = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi"
ARXIV_API = "https://export.arxiv.org/api/query"
S2_API = "https://api.semanticscholar.org/graph/v1/paper/search"
OPENALEX_API = "https://api.openalex.org/works"

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
    doi: str = ""
    arxiv_id: str = ""

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
        doi = ""
        for node in article.findall(".//ArticleIdList/ArticleId"):
            if node.attrib.get("IdType") == "doi":
                doi = _text(node)
                break
        if title:
            results.append(
                SearchResult(
                    source=PUBMED,
                    title=title,
                    abstract=abstract,
                    id=pmid,
                    url=f"https://pubmed.ncbi.nlm.nih.gov/{pmid}/" if pmid else "",
                    year=year,
                    doi=doi,
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
        arxiv_id = link.rsplit("/", 1)[-1] if link else ""
        if title:
            results.append(
                SearchResult(
                    source=ARXIV,
                    title=title,
                    abstract=abstract,
                    id=arxiv_id,
                    url=link,
                    year=published[:4],
                    arxiv_id=arxiv_id,
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
            "fields": "title,abstract,year,citationCount,paperId,url,externalIds",
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
        external = row.get("externalIds") or {}
        results.append(
            SearchResult(
                source=SEMANTIC_SCHOLAR,
                title=title,
                abstract=(row.get("abstract") or "").strip(),
                id=paper_id,
                url=row.get("url") or (f"https://www.semanticscholar.org/paper/{paper_id}" if paper_id else ""),
                year=str(row.get("year") or ""),
                citations=row.get("citationCount"),
                doi=external.get("DOI") or "",
                arxiv_id=external.get("ArXiv") or "",
            )
        )
    return results[:top_k]


def _openalex_abstract(index: dict | None) -> str:
    """Rebuild an abstract from OpenAlex's inverted index."""
    if not isinstance(index, dict):
        return ""
    slots: list[tuple[int, str]] = []
    for word, positions in index.items():
        for position in positions or []:
            slots.append((int(position), str(word)))
    return " ".join(word for _, word in sorted(slots))


def search_openalex(
    query: str,
    top_k: int = 10,
    *,
    http_get: HttpGet | None = None,
    mailto: str | None = None,
) -> list[SearchResult]:
    """OpenAlex works search; `mailto` joins the polite pool."""
    get = http_get or _http_get
    params: dict[str, Any] = {"search": query, "per-page": top_k}
    address = mailto or get_key("OPENALEX_MAILTO")
    if address:
        params["mailto"] = address
    response = _get_with_retry(get, OPENALEX_API, params=params)
    payload = response.json()
    results: list[SearchResult] = []
    for row in payload.get("results", [])[:top_k]:
        title = (row.get("title") or row.get("display_name") or "").strip()
        if not title:
            continue
        work_id = str(row.get("id") or "").rsplit("/", 1)[-1]
        doi = normalize_doi(row.get("doi") or "")
        results.append(
            SearchResult(
                source=OPENALEX,
                title=title,
                abstract=_openalex_abstract(row.get("abstract_inverted_index")),
                id=work_id,
                url=row.get("doi") or row.get("id") or "",
                year=str(row.get("publication_year") or ""),
                citations=row.get("cited_by_count"),
                doi=doi,
            )
        )
    return results[:top_k]


SEARCHERS = {
    PUBMED: search_pubmed,
    ARXIV: search_arxiv,
    SEMANTIC_SCHOLAR: search_semantic_scholar,
    OPENALEX: search_openalex,
}


def search(source: str, query: str, top_k: int = 10, **kwargs: Any) -> list[SearchResult]:
    """Dispatch by source name; unknown sources fail loudly."""
    try:
        searcher = SEARCHERS[source]
    except KeyError as exc:
        raise ValueError(f"unknown source {source!r}; expected one of {SOURCES}") from exc
    return searcher(query, top_k=top_k, **kwargs)


BIO_CLINICAL = "bio_clinical"
PHYSICS_CHEM = "physics_chem"
MATH_CS = "math_cs"
OTHER = "other"
DOMAINS = (BIO_CLINICAL, PHYSICS_CHEM, MATH_CS, OTHER)

DOMAIN_ALIASES = {
    BIO_CLINICAL: BIO_CLINICAL,
    "bio": BIO_CLINICAL,
    "biology": BIO_CLINICAL,
    "biomed": BIO_CLINICAL,
    "biomedical": BIO_CLINICAL,
    "clinical": BIO_CLINICAL,
    "medical": BIO_CLINICAL,
    "medicine": BIO_CLINICAL,
    PHYSICS_CHEM: PHYSICS_CHEM,
    "physics": PHYSICS_CHEM,
    "chemistry": PHYSICS_CHEM,
    "chem": PHYSICS_CHEM,
    MATH_CS: MATH_CS,
    "math": MATH_CS,
    "mathematics": MATH_CS,
    "cs": MATH_CS,
    "computer_science": MATH_CS,
    OTHER: OTHER,
    "general": OTHER,
}

# The only place the routing table lives. Equal evidence volume is enforced in
# the pipeline, not by giving some domains more sources than others.
DOMAIN_SOURCES = {
    BIO_CLINICAL: (PUBMED, SEMANTIC_SCHOLAR),
    PHYSICS_CHEM: (ARXIV, SEMANTIC_SCHOLAR),
    MATH_CS: (ARXIV, SEMANTIC_SCHOLAR),
    OTHER: (SEMANTIC_SCHOLAR, OPENALEX),
}

# Deterministic keyword heuristic. Keywords are matched against whole tokens
# (prefix match for length >= 6, so "protein" covers "proteins"). Keep entries
# domain-distinctive: generic words such as "energy", "function" or "model"
# caused bio/physics misroutes in the P0-8 audit and are intentionally absent.
_DOMAIN_KEYWORDS = {
    BIO_CLINICAL: frozenset(
        {
            "allele", "alzheimer", "antibody", "antigen", "asthma", "bacteria", "bacterial",
            "biomarker", "blood", "brain", "cancer", "cardiac", "cell", "cells", "cellular",
            "cholesterol", "chromosome", "clinical", "clinician", "cohort", "covid",
            "diagnosis", "diagnostic", "diabetes", "disease", "disorder", "dna", "dose",
            "dosing", "drug", "efficacy", "enzyme", "epidemic", "epidemiology", "evolution",
            "gene", "genes", "genetic", "genome", "glucose", "hiv", "hormone", "hypertension",
            "immune", "immunity", "infection", "inflammation", "insulin", "lipid", "malaria",
            "membrane", "metabolic", "metabolism", "microbiome", "mrna", "mutation", "neuron",
            "neuronal", "neuroscience", "obesity", "organ", "organism", "pathogen", "pathway",
            "patient", "patients", "pharmacology", "physiology", "placebo", "pregnancy",
            "protein", "randomised", "randomized", "receptor", "rna", "species", "stroke",
            "symptom", "symptoms", "syndrome", "synapse", "therapy", "tissue", "trial",
            "tuberculosis", "tumor", "tumour", "vaccine", "viral", "virus",
        }
    ),
    PHYSICS_CHEM: frozenset(
        {
            "acid", "acidic", "alloy", "ammonia", "atom", "atomic", "atoms", "boson",
            "calcium", "carbon", "catalyst", "chemical", "chemistry", "condensed", "copper",
            "cosmology", "crystal", "electron", "electrons", "enthalpy", "entropy", "ethanol",
            "fermion", "galaxy", "gravitational", "gravity", "hamiltonian", "helium",
            "hydroxide", "iron", "isotope", "laser", "lattice", "magnetic", "magnetism",
            "materials", "methane", "molecule", "molecular", "momentum", "neutron", "nitrogen",
            "nuclear", "optics", "orbital", "oxide", "oxygen", "particle", "particles",
            "photon", "photons", "physics", "polymer", "potassium", "proton", "quantum",
            "qubit", "relativity", "semiconductor", "sodium", "spectroscopy", "sulfuric",
            "superconductivity", "superconductor", "thermodynamic", "thermodynamics",
            "wavelength",
        }
    ),
    MATH_CS: frozenset(
        {
            "algorithm", "algorithms", "automata", "axiom", "bayesian", "calculus",
            "classifier", "combinatorial", "combinatorics", "compiler", "complexity",
            "computability", "computational", "conjecture", "convergence", "converges",
            "corollary", "decidable", "derivative", "differentiable", "eigenvalue",
            "embedding", "equation", "equations", "factorial", "geometry", "gradient",
            "graph", "graphs", "integer", "integers", "integral", "lemma", "linear",
            "logarithm", "manifold", "markov", "matrices", "matrix", "modulo", "neural",
            "optimization", "permutation", "polynomial", "polynomials", "prime",
            "probability", "program", "programming", "proof", "proofs", "protocol",
            "quantifier", "regression", "stochastic", "theorem", "theorems", "topology",
            "trigonometric", "turing", "vector", "vectors", "vertex", "vertices",
        }
    ),
}

# Ties resolve bio > physics > math; physics and math share the same sources,
# so only the bio boundary changes the retrieval behaviour.
_DOMAIN_PRIORITY = {BIO_CLINICAL: 3, PHYSICS_CHEM: 2, MATH_CS: 1}

_TOKEN_RE = re.compile(r"[a-z0-9]+")
_NON_ALNUM_RE = re.compile(r"[^a-z0-9]+")
_ARXIV_NEW_RE = re.compile(r"(?<![\d.])(\d{4}\.\d{4,5})(?:v\d+)?(?![\d.])")
_ARXIV_OLD_RE = re.compile(r"([a-z][a-z\-]*(?:\.[a-z]{2})?/\d{7})(?:v\d+)?")


@dataclass(frozen=True)
class ClaimRoute:
    """A logged routing decision: domain, ordered sources, keyword evidence."""

    claim: str
    domain: str
    sources: tuple[str, ...]
    signals: tuple[str, ...] = ()

    def as_dict(self) -> dict:
        return {
            "claim": self.claim,
            "domain": self.domain,
            "sources": list(self.sources),
            "signals": list(self.signals),
        }


def _matches(token: str, keyword: str) -> bool:
    if token == keyword:
        return True
    return len(keyword) >= 6 and token.startswith(keyword)


def _domain_signals(tokens: set[str], domain: str) -> list[str]:
    return sorted({keyword for keyword in _DOMAIN_KEYWORDS[domain] if any(_matches(token, keyword) for token in tokens)})


def classify_domain(claim: str) -> str:
    """Deterministic claim domain: bio_clinical | physics_chem | math_cs | other."""
    tokens = set(_TOKEN_RE.findall((claim or "").lower()))
    if not tokens:
        return OTHER
    scores = {domain: len(_domain_signals(tokens, domain)) for domain in _DOMAIN_PRIORITY}
    best = max(scores.values())
    if best == 0:
        return OTHER
    return max(_DOMAIN_PRIORITY, key=lambda domain: (scores[domain], _DOMAIN_PRIORITY[domain]))


def _resolve_domain(domain: str) -> str:
    key = (domain or "").strip().lower().replace("-", "_").replace(" ", "_")
    try:
        return DOMAIN_ALIASES[key]
    except KeyError as exc:
        raise ValueError(f"unknown domain {domain!r}; expected one of {DOMAINS}") from exc


def route_claim(claim: str, domain: str | None = None) -> ClaimRoute:
    """Classify a claim (or honour an override) and return its source route."""
    resolved = _resolve_domain(domain) if domain else classify_domain(claim)
    tokens = set(_TOKEN_RE.findall((claim or "").lower()))
    signals = tuple(_domain_signals(tokens, resolved)) if resolved != OTHER else ()
    return ClaimRoute(claim=claim, domain=resolved, sources=DOMAIN_SOURCES[resolved], signals=signals)


def sources_for_claim(claim: str, domain: str | None = None) -> tuple[str, ...]:
    """Sources for a claim: bio→PubMed+S2, physics/math→arXiv+S2, other→S2+OpenAlex."""
    return route_claim(claim, domain).sources


def normalize_doi(value: str) -> str:
    text = (value or "").strip().lower()
    for prefix in ("https://doi.org/", "http://doi.org/", "https://dx.doi.org/", "doi:"):
        if text.startswith(prefix):
            text = text[len(prefix):]
            break
    return text.strip()


def normalize_title(value: str) -> str:
    """Case/punctuation-insensitive title (and passage) identity."""
    return _NON_ALNUM_RE.sub(" ", (value or "").lower()).strip()


# Passages are plain strings; the same normalisation gives stable dedup keys.
normalize_text = normalize_title


def normalize_arxiv_id(*values: str) -> str:
    for value in values:
        text = (value or "").strip()
        match = _ARXIV_NEW_RE.search(text)
        if match:
            return match.group(1)
        match = _ARXIV_OLD_RE.search(text.lower())
        if match:
            return match.group(1)
    return ""


def _identifiers(result: SearchResult) -> set[tuple[str, str]]:
    ids: set[tuple[str, str]] = set()
    doi = normalize_doi(result.doi)
    if doi:
        ids.add(("doi", doi))
    arxiv = normalize_arxiv_id(result.arxiv_id, result.id, result.url)
    if arxiv:
        ids.add(("arxiv", arxiv))
    title = normalize_title(result.title)
    if title:
        ids.add(("title", title))
    return ids


def dedupe_results(results: list[SearchResult]) -> list[SearchResult]:
    """Keep first occurrences, deduplicating on DOI, arXiv ID, or title."""
    seen: set[tuple[str, str]] = set()
    unique: list[SearchResult] = []
    for result in results:
        ids = _identifiers(result)
        if ids & seen:
            continue
        seen |= ids
        unique.append(result)
    return unique


def agent_source(agent_index: int, partition: bool = True) -> str:
    """Deprecated: the old agent→source assignment (P0-8 confound).

    Kept only so older callers and the source-partition ablation keep working;
    the primary path is `sources_for_claim` / `route_claim`.
    """
    if not partition:
        return SEMANTIC_SCHOLAR
    return SOURCES[agent_index % len(SOURCES)]


def passage_text(result: SearchResult, max_chars: int = 1200) -> str:
    """Compact passage for prompts: title + abstract, bounded for context."""
    text = f"{result.title}. {result.abstract}".strip()
    return text[:max_chars]
