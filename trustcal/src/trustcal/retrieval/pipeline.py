"""Claim-routed, progressive retrieval with a cache (P0-8, §5.5).

`Retriever` is the only object the debate loop talks to. It owns:
  * claim -> domain routing (PubMed / arXiv / S2 / OpenAlex) and a route log,
  * progressive depth (fewer passages in early rounds),
  * de-duplication by DOI / arXiv ID / normalized title (and passage text),
  * equal evidence volume: every agent sees the same number of passages for the
    same claim, whether source partitioning is on (an ablation) or off,
  * a per-run cache so repeated claims cost one request,
  * graceful failure: a dead API yields no passages (trust abstains) and is
    recorded in ``errors`` instead of killing a paid session.

Partitioning is no longer "agent A = PubMed, agent B = arXiv". When enabled it
rotates the *claim-routed* source order per agent (so source diversity is an
item-level property, not an agent-level confound) and falls through to the
remaining routed sources when the first returns too little. The candidate set
and the target volume are identical in both conditions.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Callable, Iterable

from . import sources
from .verdicts import rerank

SearchFn = Callable[..., list[sources.SearchResult]]


@dataclass(frozen=True)
class RetrievalConfig:
    top_k: int = 5
    prompt_passages: int = 3
    max_chars: int = 1200
    partition: bool = True
    progressive: bool = True


def _rotate(items: tuple[str, ...], offset: int) -> tuple[str, ...]:
    if not items:
        return items
    index = offset % len(items)
    return items[index:] + items[:index]


def select_evidence(passages: Iterable[str], k: int) -> list[str]:
    """De-duplicate passages by normalized text, then take the first ``k``.

    Callers pass a ranked list; uniqueness is required because the same paper
    can arrive from two sources with different truncation/casing.
    """
    if k <= 0:
        return []
    seen: set[str] = set()
    selected: list[str] = []
    for passage in passages:
        key = sources.normalize_text(passage)
        if not key or key in seen:
            continue
        seen.add(key)
        selected.append(passage)
        if len(selected) >= k:
            break
    return selected


@dataclass
class Retriever:
    search_fn: SearchFn | None = None
    config: RetrievalConfig = field(default_factory=RetrievalConfig)
    errors: list[str] = field(default_factory=list)
    routes: list[dict] = field(default_factory=list)
    _cache: dict[tuple[str, str, int], list[sources.SearchResult]] = field(default_factory=dict, repr=False)
    _route_cache: dict[str, sources.ClaimRoute] = field(default_factory=dict, repr=False)

    def __post_init__(self) -> None:
        if self.search_fn is None:
            self.search_fn = sources.search

    def route(self, claim: str, domain: str | None = None) -> sources.ClaimRoute:
        """Routing decision for a claim, cached and logged once per distinct call."""
        key = f"{domain}:{claim}" if domain else claim
        if key not in self._route_cache:
            route = sources.route_claim(claim, domain)
            self._route_cache[key] = route
            self.routes.append(route.as_dict())
        return self._route_cache[key]

    def source_names(self, agent_index: int, claim: str | None = None) -> tuple[str, ...]:
        """Candidate sources in query order for this claim/agent.

        Without a claim the legacy all-source order is returned. Partitioning
        only rotates the routed candidates; it never adds or removes a domain's
        sources, so evidence volume cannot differ by condition.
        """
        if not claim:
            return sources.SOURCES
        routed = self.route(claim).sources
        if not self.config.partition:
            return routed
        return _rotate(routed, agent_index)

    def _search(self, source: str, query: str, top_k: int) -> list[sources.SearchResult]:
        key = (source, query, top_k)
        if key in self._cache:
            return self._cache[key]
        try:
            results = list(self.search_fn(source, query, top_k=top_k))
        except Exception as exc:  # noqa: BLE001 - retrieval must not kill the run
            self.errors.append(f"{source}: {exc}")
            results = []
        self._cache[key] = results
        return results

    def depth(self, round_number: int) -> int:
        """Progressive retrieval: half depth in rounds 1-2, full depth later."""
        if not self.config.progressive:
            return self.config.top_k
        return max(1, self.config.top_k // 2) if round_number <= 2 else self.config.top_k

    def search(self, agent_index: int, claim: str, round_number: int = 1) -> list[sources.SearchResult]:
        """Raw results for one claim from the claim-routed sources.

        Sources are tried in the order returned by ``source_names`` and the
        loop stops once ``top_k`` unique results exist. Because the ordered
        candidates are the same set in both partition conditions, a weak first
        source is always topped up from the remaining routed sources.
        """
        query = (claim or "").strip()
        if not query:
            return []
        depth = self.depth(round_number)
        merged: list[sources.SearchResult] = []
        for source in self.source_names(agent_index, query):
            merged.extend(self._search(source, query, depth))
            if len(sources.dedupe_results(merged)) >= self.config.top_k:
                break
        return merged

    def retrieve(self, agent_index: int, claim: str, round_number: int = 1) -> list[str]:
        """Passages for prompts/verdicts: deduplicated, reranked, equal volume."""
        results = self.search(agent_index, claim, round_number)
        unique = sources.dedupe_results(results)
        passages = [sources.passage_text(r, self.config.max_chars) for r in unique]
        ranked = [p for p, _ in rerank(claim, passages, top_k=self.config.top_k)]
        return select_evidence(ranked, self.config.prompt_passages)


class StaticRetriever:
    """Deterministic retriever for tests and the Month-1 pilot.

    ``table`` maps an agent index to a claim->passages mapping (or a single
    fallback list); unknown claims return the fallback, never a network call.
    """

    def __init__(self, table: dict[int, dict[str, list[str]]] | None = None, fallback: list[str] | None = None) -> None:
        self.table = table or {}
        self.fallback = fallback or []

    def retrieve(self, agent_index: int, claim: str, round_number: int = 1) -> list[str]:
        per_agent = self.table.get(agent_index, {})
        return list(per_agent.get(claim, self.fallback))


def evidence_block(passages: list[str], max_items: int = 3, max_chars: int = 1200) -> str:
    """Prompt-ready evidence list; bounded so revision prompts stay in context."""
    if not passages:
        return "(no evidence retrieved)"
    lines = [f"[{i}] {p[:max_chars]}" for i, p in enumerate(passages[:max_items], start=1)]
    return "\n".join(lines)
