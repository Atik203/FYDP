"""Reranking + per-claim evidence verdicts (blueprint §5.5-5.6).

The default implementation is deterministic and dependency-light so the whole
trust loop is testable offline. Real runs can inject either a cross-encoder
(``scorer``) or an LLM judge (``judge``); the trust update consumes the same
``supported | contradicted | unverifiable`` labels either way.

This is deliberately *not* a self-reported confidence signal: every label comes
from comparing the claim against retrieved passages.
"""

from __future__ import annotations

import math
import re
from typing import Callable, Iterable

SUPPORTED = "supported"
CONTRADICTED = "contradicted"
UNVERIFIABLE = "unverifiable"
VERDICTS = (SUPPORTED, CONTRADICTED, UNVERIFIABLE)

_TOKEN_RE = re.compile(r"[a-z0-9]+")
_NUMBER_RE = re.compile(r"[-+]?\d*\.?\d+(?:[eE][-+]?\d+)?")

_STOPWORDS = {
    "a", "an", "and", "are", "as", "at", "be", "because", "been", "but", "by",
    "can", "could", "did", "do", "does", "for", "from", "had", "has", "have",
    "how", "if", "in", "into", "is", "it", "its", "may", "might", "more", "most",
    "not", "of", "on", "or", "our", "that", "the", "their", "then", "there",
    "these", "they", "this", "those", "to", "was", "we", "were", "what", "when",
    "which", "while", "who", "will", "with", "would",
}

_NEGATIONS = {
    "not", "no", "never", "none", "neither", "nor", "without", "absent",
    "absence", "fail", "fails", "failed", "failing", "cannot", "can't", "isn't",
    "aren't", "doesn't", "don't", "didn't", "won't", "wouldn't", "shouldn't",
    "couldn't", "unlikely", "unable", "lacks", "lacking", "denies", "denied",
}

Judge = Callable[[str, list[str]], str]
Scorer = Callable[[str, list[str]], list[float]]

_CROSS_ENCODER = None
_CROSS_ENCODER_TRIED = False


def _tokens(text: str) -> set[str]:
    return {t for t in _TOKEN_RE.findall((text or "").lower()) if t not in _STOPWORDS}


def _negated(text: str) -> bool:
    tokens = set(_TOKEN_RE.findall((text or "").lower()))
    return bool(tokens & _NEGATIONS) or "n't" in (text or "").lower()


def _numbers(text: str) -> set[str]:
    values = set()
    for raw in _NUMBER_RE.findall(text or ""):
        try:
            values.add(f"{float(raw):.6g}")
        except ValueError:
            continue
    return values


def lexical_score(claim: str, passage: str) -> float:
    """Claim-term coverage by the passage, in [0, 1].

    Coverage (not Jaccard) so a long abstract is not punished for extra words.
    """
    claim_terms = _tokens(claim)
    if not claim_terms:
        return 0.0
    return len(claim_terms & _tokens(passage)) / len(claim_terms)


def _default_scorer(claim: str, passages: list[str]) -> list[float]:
    return [lexical_score(claim, p) for p in passages]


def _cross_encoder_scorer(claim: str, passages: list[str]) -> list[float] | None:
    """Optional ms-marco cross-encoder; returns None when the dep/model is absent."""
    global _CROSS_ENCODER, _CROSS_ENCODER_TRIED
    if not _CROSS_ENCODER_TRIED:
        _CROSS_ENCODER_TRIED = True
        try:
            from sentence_transformers import CrossEncoder  # lazy, pod-only

            _CROSS_ENCODER = CrossEncoder("cross-encoder/ms-marco-MiniLM-L-6-v2")
        except Exception:  # noqa: BLE001 - optional dependency/model cache
            _CROSS_ENCODER = None
    if _CROSS_ENCODER is None:
        return None
    try:
        scores = _CROSS_ENCODER.predict([(claim, p) for p in passages])
        # ms-marco returns logits; squash to [0, 1] so the same min/support
        # thresholds that work for lexical coverage also work here.
        return [1.0 / (1.0 + math.exp(-float(s))) for s in scores]
    except Exception:  # noqa: BLE001 - model/runtime failure must fall back
        return None


def rerank(
    claim: str,
    passages: Iterable[str],
    top_k: int = 3,
    *,
    scorer: Scorer | None = None,
) -> list[tuple[str, float]]:
    """Score claim x passage and return the top-k pairs (descending).

    Resolution order: injected scorer -> cross-encoder -> lexical overlap.
    """
    unique = [p for p in dict.fromkeys(passages) if p and p.strip()]
    if not unique:
        return []
    if scorer is not None:
        scores = list(scorer(claim, unique))
    else:
        scores = _cross_encoder_scorer(claim, unique)
        if scores is None:
            scores = _default_scorer(claim, unique)
    if len(scores) != len(unique):
        raise ValueError("scorer returned a different number of scores than passages")
    pairs = sorted(zip(unique, scores), key=lambda pair: pair[1], reverse=True)
    return pairs[:top_k]


def _normalise_verdict(raw: str) -> str:
    value = (raw or "").strip().lower()
    if value.startswith("support"):
        return SUPPORTED
    if value.startswith("contradict") or value.startswith("refut"):
        return CONTRADICTED
    return UNVERIFIABLE


def classify_claim(
    claim: str,
    passages: Iterable[str],
    scores: list[float] | None = None,
    *,
    judge: Judge | None = None,
    scorer: Scorer | None = None,
    min_score: float = 0.20,
    support_threshold: float = 0.55,
) -> str:
    """Verdict for one claim: ``supported`` | ``contradicted`` | ``unverifiable``.

    An injected ``judge`` (claim, passages) takes precedence. Otherwise:
      * no passage / weak overlap -> unverifiable (abstain, no trust change);
      * numeric or negation mismatch on an overlapping passage -> contradicted;
      * strong lexical/nli score -> supported.
    """
    ranked = rerank(claim, passages, top_k=3, scorer=scorer)
    if judge is not None:
        return _normalise_verdict(judge(claim, [p for p, _ in ranked]))
    if not ranked:
        return UNVERIFIABLE
    top_passage, relevance = ranked[0]
    if relevance < min_score:
        return UNVERIFIABLE
    # Relevance is not entailment: a cross-encoder can rank a passage highly
    # while it only mentions the topic. Support therefore needs claim-term
    # coverage (or an injected judge), not just the reranker score.
    support_score = lexical_score(claim, top_passage)
    if scores:
        support_score = max(support_score, float(scores[0]))

    claim_numbers = _numbers(claim)
    passage_numbers = _numbers(top_passage)
    if claim_numbers and passage_numbers and not (claim_numbers & passage_numbers):
        return CONTRADICTED
    if _negated(claim) != _negated(top_passage) and support_score >= 0.30:
        return CONTRADICTED
    if support_score >= support_threshold:
        return SUPPORTED
    return UNVERIFIABLE


def count_verdicts(verdicts: Iterable[str]) -> tuple[int, int, int]:
    """(supported, contradicted, unverifiable) counts for one agent round."""
    values = list(verdicts)
    return (
        sum(1 for v in values if v == SUPPORTED),
        sum(1 for v in values if v == CONTRADICTED),
        sum(1 for v in values if v == UNVERIFIABLE),
    )
