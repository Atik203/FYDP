"""Verifier interface + implementations (P0-6).

Every implementation maps ``(claim, passages)`` to a `Verdict` whose label is
exactly ``supported`` | ``contradicted`` | ``unverifiable``. The debate loop
consumes the label; ``scores`` and ``evidence_ids`` exist for the audit trail.

Conventions frozen for P0 (``docs/agent/09_P0_INTERFACES.md`` §2):

* ``evidence_ids`` are positional — ``p0``, ``p1``, … in the order the passages
  were passed in. The fixed signature carries no retrieval IDs, so a caller
  maps the verdict back to the passage list it already holds. Blank passages
  keep their slot so positions never shift.
* ``scores`` align 1:1 with ``evidence_ids`` for the lexical, cross-encoder and
  NLI verifiers. `LLMJudgeVerifier` judges the claim as a whole, so its
  ``scores`` is the judge's single ``[confidence]`` value.
* ``verifier`` records the implementation name (``lexical``, ``cross-encoder``,
  ``nli``, ``llm-judge``); a judge that exhausted its retries without parseable
  output records ``llm-judge:parse-error``. Each class also exposes ``version``
  so a run manifest can pin the label policy.
* No evidence means abstention: an empty/all-blank passage list is
  ``unverifiable`` and never calls an optional model or the judge.

Optional dependencies are imported lazily, inside ``load()`` / the first
``verdict()``, so importing this module is cheap and offline. Missing deps raise
`VerifierUnavailable` with an install hint; call ``load()`` in preflight to fail
before a paid run instead of mid-debate.
"""

from __future__ import annotations

import json
import math
from dataclasses import dataclass
from typing import Any, Protocol

from .verdicts import (
    CONTRADICTED,
    SUPPORTED,
    UNVERIFIABLE,
    VERDICTS,
    classify_claim,
    lexical_score,
)

__all__ = [
    "CONTRADICTED",
    "SUPPORTED",
    "UNVERIFIABLE",
    "VERDICTS",
    "Verdict",
    "Verifier",
    "VerifierUnavailable",
    "LexicalVerifier",
    "CrossEncoderVerifier",
    "NLIVerifier",
    "LLMJudgeVerifier",
    "build_verifier",
    "VERIFIER_NAMES",
    "VERIFIER_INTERFACE_VERSION",
]

VERIFIER_INTERFACE_VERSION = "1"
VERIFIER_NAMES = ("lexical", "cross-encoder", "nli", "llm-judge")


@dataclass(frozen=True)
class Verdict:
    """One claim judgment; ``label`` is the only field trust consumes."""

    label: str
    scores: list[float]
    evidence_ids: list[str]
    verifier: str

    def __post_init__(self) -> None:
        if self.label not in VERDICTS:
            raise ValueError(f"unknown verdict label {self.label!r}; expected one of {VERDICTS}")
        # Coerce to plain JSON-safe lists: numpy floats from a model would
        # otherwise break record serialization far from the source.
        object.__setattr__(self, "scores", [float(score) for score in self.scores])
        object.__setattr__(self, "evidence_ids", [str(item) for item in self.evidence_ids])

    def as_dict(self) -> dict:
        """Record-ready payload. ``debate.py`` stores ``label`` under ``verdict``."""
        return {
            "label": self.label,
            "scores": list(self.scores),
            "evidence_ids": list(self.evidence_ids),
            "verifier": self.verifier,
        }


class Verifier(Protocol):
    def verdict(self, claim: str, passages: list[str]) -> Verdict: ...


class VerifierUnavailable(RuntimeError):
    """An optional verifier dependency (or its model) is not available."""


def _evidence_ids(passages: list[str]) -> list[str]:
    return [f"p{i}" for i in range(len(passages))]


def _texts(passages: list[str] | None) -> list[str]:
    return ["" if p is None else str(p) for p in (passages or [])]


def _has_text(passages: list[str]) -> bool:
    return any(p.strip() for p in passages)


def _sigmoid(value: float) -> float:
    # Guard the exponential: ms-marco logits can be +-20.
    if value >= 0:
        return 1.0 / (1.0 + math.exp(-value))
    exp = math.exp(value)
    return exp / (1.0 + exp)


def _as_float_list(raw: Any) -> list[float]:
    """CrossEncoder.predict returns a scalar, a list, or a numpy array."""
    if hasattr(raw, "tolist"):
        raw = raw.tolist()
    if isinstance(raw, (int, float)):
        raw = [raw]
    return [float(value) for value in raw]


class LexicalVerifier:
    """Deterministic lexical-overlap verdict; wraps ``verdicts.classify_claim``.

    The lexical scorer is forced explicitly, so a sentence-transformers install
    on the GPU box cannot silently turn this baseline into a cross-encoder. The
    contradiction path is the existing one: numeric mismatch or negation flip on
    an overlapping passage.
    """

    name = "lexical"
    version = "1"

    def __init__(self, min_score: float = 0.20, support_threshold: float = 0.55) -> None:
        self.min_score = min_score
        self.support_threshold = support_threshold

    def load(self) -> None:
        """No-op: keeps the preflight ``verifier.load()`` call uniform."""

    def _scorer(self, claim: str, passages: list[str]) -> list[float]:
        return [lexical_score(claim, passage) for passage in passages]

    def verdict(self, claim: str, passages: list[str]) -> Verdict:
        texts = _texts(passages)
        scores = self._scorer(claim, texts)
        label = classify_claim(
            claim,
            texts,
            scorer=self._scorer,
            min_score=self.min_score,
            support_threshold=self.support_threshold,
        )
        return Verdict(label=label, scores=scores, evidence_ids=_evidence_ids(texts), verifier=self.name)


class CrossEncoderVerifier:
    """Optional ms-marco cross-encoder relevance verifier.

    Relevance is not entailment: this verifier emits ``supported`` when the best
    passage clears ``support_threshold`` and ``unverifiable`` otherwise. It never
    emits ``contradicted`` — use `NLIVerifier` or `LLMJudgeVerifier` when
    refutation has to change trust.
    """

    name = "cross-encoder"
    version = "1"
    DEFAULT_MODEL = "cross-encoder/ms-marco-MiniLM-L-6-v2"
    INSTALL_HINT = "pip install sentence-transformers"

    def __init__(
        self,
        model_name: str | None = None,
        *,
        device: str | None = None,
        support_threshold: float = 0.55,
    ) -> None:
        self.model_name = model_name or self.DEFAULT_MODEL
        self.device = device
        self.support_threshold = support_threshold
        self._model: Any = None

    def load(self) -> Any:
        """Import the dependency and load the model once; no work at import time."""
        if self._model is not None:
            return self._model
        try:
            from sentence_transformers import CrossEncoder
        except Exception as exc:  # noqa: BLE001 - optional dependency
            raise VerifierUnavailable(
                f"cross-encoder verifier unavailable: {self.INSTALL_HINT} "
                "(CPU is enough for the audit; no GPU needed)"
            ) from exc
        try:
            self._model = CrossEncoder(self.model_name, device=self.device)
        except Exception as exc:  # noqa: BLE001 - model cache/network failure
            raise VerifierUnavailable(
                f"cross-encoder model {self.model_name!r} could not be loaded "
                f"({exc}); pre-download it or pass model_name= to a cached checkpoint"
            ) from exc
        return self._model

    def verdict(self, claim: str, passages: list[str]) -> Verdict:
        texts = _texts(passages)
        ids = _evidence_ids(texts)
        if not _has_text(texts) or not (claim or "").strip():
            return Verdict(UNVERIFIABLE, [0.0] * len(texts), ids, self.name)
        model = self.load()
        raw = model.predict([(claim, passage) for passage in texts])
        scores = [_sigmoid(value) for value in _as_float_list(raw)]
        if len(scores) != len(texts):
            raise RuntimeError(
                f"{self.name} returned {len(scores)} scores for {len(texts)} passages"
            )
        label = SUPPORTED if max(scores) >= self.support_threshold else UNVERIFIABLE
        return Verdict(label, scores, ids, self.name)


# MNLI checkpoints disagree on names; map both spellings and the bare LABEL_N
# order (bart/roberta MNLI: 0=contradiction, 1=neutral, 2=entailment).
_NLI_LABELS = {
    "entailment": "entailment",
    "entails": "entailment",
    "label_2": "entailment",
    "neutral": "neutral",
    "label_1": "neutral",
    "contradiction": "contradiction",
    "contradicts": "contradiction",
    "label_0": "contradiction",
}


def _nli_probs(raw: Any) -> dict[str, float]:
    items = raw
    if isinstance(items, dict):
        items = [items]
    if items and isinstance(items[0], list):
        items = items[0]
    probs = {"entailment": 0.0, "neutral": 0.0, "contradiction": 0.0}
    for item in items or []:
        key = _NLI_LABELS.get(str(item.get("label", "")).strip().lower())
        if key is not None:
            probs[key] = max(probs[key], float(item.get("score", 0.0)))
    return probs


class NLIVerifier:
    """Optional transformers NLI pipeline with an explicit contradiction class.

    ``supported`` needs at least one passage at/above ``entailment_threshold``
    *and* no passage at/above ``contradiction_threshold`` — a single clear
    refutation blocks support. With ``bidirectional=True`` the entailment score
    for a passage is ``min(passage -> claim, claim -> passage)``; contradiction
    is read from the passage -> claim direction.
    """

    name = "nli"
    version = "1"
    DEFAULT_MODEL = "facebook/bart-large-mnli"
    INSTALL_HINT = "pip install 'transformers>=4.40' torch"

    def __init__(
        self,
        model_name: str | None = None,
        *,
        device: int | str = -1,
        entailment_threshold: float = 0.5,
        contradiction_threshold: float = 0.5,
        bidirectional: bool = False,
    ) -> None:
        self.model_name = model_name or self.DEFAULT_MODEL
        self.device = device
        self.entailment_threshold = entailment_threshold
        self.contradiction_threshold = contradiction_threshold
        self.bidirectional = bidirectional
        self._pipe: Any = None

    def load(self) -> Any:
        """Import transformers and build the pipeline once; no work at import time."""
        if self._pipe is not None:
            return self._pipe
        try:
            from transformers import pipeline
        except Exception as exc:  # noqa: BLE001 - optional dependency
            raise VerifierUnavailable(
                f"nli verifier unavailable: {self.INSTALL_HINT} "
                "(CPU is enough for the audit; no GPU needed)"
            ) from exc
        try:
            self._pipe = pipeline(
                "text-classification",
                model=self.model_name,
                device=self.device,
                top_k=None,
            )
        except Exception as exc:  # noqa: BLE001 - model cache/network failure
            raise VerifierUnavailable(
                f"nli model {self.model_name!r} could not be loaded ({exc}); "
                "pre-download it or pass model_name= to a cached checkpoint"
            ) from exc
        return self._pipe

    def _pair_probs(self, pipe: Any, premise: str, hypothesis: str) -> dict[str, float]:
        return _nli_probs(pipe({"text": premise, "text_pair": hypothesis}, top_k=None))

    def verdict(self, claim: str, passages: list[str]) -> Verdict:
        texts = _texts(passages)
        ids = _evidence_ids(texts)
        claim = (claim or "").strip()
        if not _has_text(texts) or not claim:
            return Verdict(UNVERIFIABLE, [0.0] * len(texts), ids, self.name)
        pipe = self.load()
        scores: list[float] = []
        contradictions: list[float] = []
        for passage in texts:
            if not passage.strip():
                scores.append(0.0)
                contradictions.append(0.0)
                continue
            forward = self._pair_probs(pipe, passage, claim)
            entailment = forward["entailment"]
            if self.bidirectional:
                backward = self._pair_probs(pipe, claim, passage)
                entailment = min(entailment, backward["entailment"])
            scores.append(entailment)
            contradictions.append(forward["contradiction"])
        if max(contradictions) >= self.contradiction_threshold:
            label = CONTRADICTED
        elif max(scores) >= self.entailment_threshold:
            label = SUPPORTED
        else:
            label = UNVERIFIABLE
        return Verdict(label, scores, ids, self.name)


JUDGE_PROMPT = """You are a strict scientific evidence verifier. Decide whether the retrieved passages establish the claim.

Claim:
{claim}

Passages:
{passages}

Rules:
1. "supported" - at least one passage entails the claim and no passage contradicts it.
2. "contradicted" - at least one passage asserts the claim is false (opposite result, different number, negated relation, different entity).
3. "unverifiable" - the passages are empty, off-topic, or only share words with the claim.

Judge the claim as written. Do not use outside knowledge; topical relevance is not support.
Bidirectional check: answer "supported" only when the passages entail the claim and the claim is consistent with them. Set "contradiction": true whenever any passage contradicts the claim, even if another passage supports it.

Answer with strict JSON only, e.g. {"label": "supported", "confidence": 0.0, "contradiction": false}
"""

_JUDGE_LABELS = {
    "support": SUPPORTED,
    "supports": SUPPORTED,
    "entailment": SUPPORTED,
    "entails": SUPPORTED,
    "contradict": CONTRADICTED,
    "contradicts": CONTRADICTED,
    "contradiction": CONTRADICTED,
    "refute": CONTRADICTED,
    "refutes": CONTRADICTED,
    "refuted": CONTRADICTED,
    "unverifiable": UNVERIFIABLE,
    "neutral": UNVERIFIABLE,
    "unknown": UNVERIFIABLE,
    "uncertain": UNVERIFIABLE,
    "nei": UNVERIFIABLE,
}


def _normalise_judge_label(raw: Any) -> str | None:
    value = str(raw or "").strip().lower()
    if value in _JUDGE_LABELS:
        return _JUDGE_LABELS[value]
    if value.startswith("support") or value.startswith("entail"):
        return SUPPORTED
    if value.startswith("contradict") or value.startswith("refut"):
        return CONTRADICTED
    if value.startswith("unverif") or value.startswith("neutral"):
        return UNVERIFIABLE
    return None


def _extract_json_object(text: str) -> dict | None:
    """First decodable JSON object in the text; tolerates fences and chatter."""
    decoder = json.JSONDecoder()
    for index, char in enumerate(text or ""):
        if char != "{":
            continue
        try:
            value, _ = decoder.raw_decode(text[index:])
        except json.JSONDecodeError:
            continue
        if isinstance(value, dict):
            return value
    return None


def _parse_judge_output(text: str) -> dict | None:
    data = _extract_json_object(text)
    if data is None:
        return None
    label = _normalise_judge_label(data.get("label"))
    if label is None:
        return None
    try:
        confidence = min(max(float(data.get("confidence", 0.0)), 0.0), 1.0)
    except (TypeError, ValueError):
        confidence = 0.0
    contradiction = data.get("contradiction", False)
    if isinstance(contradiction, str):
        contradiction = contradiction.strip().lower() in {"true", "yes", "1"}
    return {"label": label, "confidence": confidence, "contradiction": bool(contradiction)}


class LLMJudgeVerifier:
    """OpenAI-compatible or callable judge asking for strict JSON per claim.

    ``client`` is either an OpenAI-compatible object (``chat.completions.create``)
    or a ``callable(prompt) -> str``. The prompt requests
    ``{"label": ..., "confidence": ..., "contradiction": ...}``; ``label`` and
    ``confidence`` are required, ``contradiction`` is optional. A malformed
    answer is retried once, then recorded as ``unverifiable`` with the verifier
    tag ``llm-judge:parse-error``. Client exceptions are retried once and then
    re-raised: a dead judge must not silently abstain every claim.

    With ``require_bidirectional`` (default) a ``supported`` label carrying
    ``contradiction: true`` is downgraded to ``unverifiable`` — support needs the
    absence of a refutation. ``contradicted`` is always explicit.
    """

    name = "llm-judge"
    version = "1"
    PARSE_ERROR_TAG = "llm-judge:parse-error"

    def __init__(
        self,
        client: Any,
        model: str,
        prompt_template: str | None = None,
        require_bidirectional: bool = True,
        *,
        max_attempts: int = 2,
        temperature: float = 0.0,
        max_tokens: int = 256,
    ) -> None:
        if prompt_template is not None:
            missing = [slot for slot in ("{claim}", "{passages}") if slot not in prompt_template]
            if missing:
                raise ValueError(f"prompt_template is missing placeholders: {', '.join(missing)}")
        self.client = client
        self.model = model
        self.prompt_template = prompt_template or JUDGE_PROMPT
        self.require_bidirectional = require_bidirectional
        self.max_attempts = max(1, int(max_attempts))
        self.temperature = temperature
        self.max_tokens = max_tokens

    def _render(self, claim: str, texts: list[str]) -> str:
        block = "\n".join(f"[p{i}] {passage}" for i, passage in enumerate(texts))
        # Plain replace, not str.format: the template contains JSON braces.
        return self.prompt_template.replace("{claim}", claim).replace("{passages}", block)

    def _complete(self, prompt: str) -> str:
        client = self.client
        completions = getattr(getattr(client, "chat", None), "completions", None)
        if completions is not None and hasattr(completions, "create"):
            response = completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                temperature=self.temperature,
                max_tokens=self.max_tokens,
            )
            try:
                return response.choices[0].message.content or ""
            except (AttributeError, IndexError) as exc:
                raise RuntimeError("judge client returned no message content") from exc
        if callable(client):
            return str(client(prompt) or "")
        raise TypeError(
            "client must be OpenAI-compatible (chat.completions.create) "
            "or callable(prompt) -> str"
        )

    def _ask(self, prompt: str) -> dict | None:
        for attempt in range(self.max_attempts):
            try:
                text = self._complete(prompt)
            except Exception:  # noqa: BLE001 - retried once, then re-raised
                if attempt + 1 >= self.max_attempts:
                    raise
                continue
            parsed = _parse_judge_output(text)
            if parsed is not None:
                return parsed
        return None

    def verdict(self, claim: str, passages: list[str]) -> Verdict:
        texts = _texts(passages)
        ids = _evidence_ids(texts)
        if not _has_text(texts) or not (claim or "").strip():
            return Verdict(UNVERIFIABLE, [0.0] * len(texts), ids, self.name)
        parsed = self._ask(self._render((claim or "").strip(), texts))
        if parsed is None:
            return Verdict(UNVERIFIABLE, [0.0], ids, self.PARSE_ERROR_TAG)
        label = parsed["label"]
        if label == SUPPORTED and self.require_bidirectional and parsed["contradiction"]:
            label = UNVERIFIABLE
        return Verdict(label, [parsed["confidence"]], ids, self.name)


_ALIASES = {
    "cross_encoder": "cross-encoder",
    "crossencoder": "cross-encoder",
    "llm_judge": "llm-judge",
    "judge": "llm-judge",
}


def build_verifier(name: str, **kwargs: Any) -> Verifier:
    """Factory: ``lexical`` | ``cross-encoder`` | ``nli`` | ``llm-judge``.

    Unknown names raise ``ValueError``. ``llm-judge`` requires ``client=`` and
    ``model=``; optional deps are not imported until the verifier is used.
    """
    key = str(name or "").strip().lower()
    key = _ALIASES.get(key, key)
    if key == "lexical":
        return LexicalVerifier(**kwargs)
    if key == "cross-encoder":
        return CrossEncoderVerifier(**kwargs)
    if key == "nli":
        return NLIVerifier(**kwargs)
    if key == "llm-judge":
        return LLMJudgeVerifier(**kwargs)
    raise ValueError(f"unknown verifier {name!r}; expected one of {', '.join(VERIFIER_NAMES)}")
