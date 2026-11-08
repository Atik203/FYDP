"""Source-partitioned, progressive retrieval with a cache (§5.5).

`Retriever` is the only object the debate loop talks to. It owns:
  * agent -> source assignment (PubMed / arXiv / Semantic Scholar),
  * progressive depth (fewer passages in early rounds),
  * de-duplication and a per-run cache so repeated claims cost one request,
  * graceful failure: a dead API yields no passages (trust abstains) and is
    recorded in ``errors`` instead of killing a paid session.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Callable

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


@dataclass
class Retriever:
    search_fn: SearchFn | None = None
    config: RetrievalConfig = field(default_factory=RetrievalConfig)
    errors: list[str] = field(default_factory=list)
    _cache: dict[tuple[str, str, int], list[sources.SearchResult]] = field(default_factory=dict, repr=False)

    def __post_init__(self) -> None:
        if self.search_fn is None:
            self.search_fn = sources.search

    def source_names(self, agent_index: int) -> tuple[str, ...]:
        if self.config.partition:
            return (sources.agent_source(agent_index, partition=True),)
        return sources.SOURCES

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
        """Raw results for one claim from the agent's assigned source(s)."""
        query = (claim or "").strip()
        if not query:
            return []
        depth = self.depth(round_number)
        merged: list[sources.SearchResult] = []
        for source in self.source_names(agent_index):
            merged.extend(self._search(source, query, depth))
        return merged

    def retrieve(self, agent_index: int, claim: str, round_number: int = 1) -> list[str]:
        """Passages for prompts/verdicts, reranked and de-duplicated."""
        results = self.search(agent_index, claim, round_number)
        passages = [sources.passage_text(r, self.config.max_chars) for r in results]
        ranked = [p for p, _ in rerank(claim, passages, top_k=self.config.top_k)]
        return ranked[: self.config.prompt_passages]


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
