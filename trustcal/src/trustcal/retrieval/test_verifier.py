"""Verifier interface: labels, deterministic baseline, optional deps, judge loop.

Every test is offline: optional dependencies are faked through ``sys.modules``
and the judge is a counting callable, so the suite runs on the CI box that has
no torch/transformers/sentence-transformers.
"""

from __future__ import annotations

import sys
import types
from types import SimpleNamespace
from typing import Any

import pytest

from . import verdicts
from .verifier import (
    CONTRADICTED,
    SUPPORTED,
    UNVERIFIABLE,
    VERDICTS,
    CrossEncoderVerifier,
    LexicalVerifier,
    LLMJudgeVerifier,
    NLIVerifier,
    Verdict,
    VerifierUnavailable,
    build_verifier,
)

# --------------------------------------------------------------------------- #
# helpers
# --------------------------------------------------------------------------- #


class RecordingJudge:
    """Callable judge returning scripted responses and counting calls."""

    def __init__(self, *responses: Any) -> None:
        self.responses = list(responses)
        self.calls: list[str] = []

    def __call__(self, prompt: str) -> str:
        self.calls.append(prompt)
        value = self.responses.pop(0) if len(self.responses) > 1 else self.responses[0]
        if isinstance(value, Exception):
            raise value
        return value

    @property
    def n_calls(self) -> int:
        return len(self.calls)


def fake_sentence_transformers(monkeypatch: pytest.MonkeyPatch, scores: list[float]) -> dict:
    """Inject a fake CrossEncoder; returns counters, never touches the network."""
    calls = {"load": 0, "predict": 0, "pairs": []}

    class FakeCrossEncoder:
        def __init__(self, model_name: str, device: Any = None) -> None:
            calls["load"] += 1
            calls["model_name"] = model_name
            calls["device"] = device

        def predict(self, pairs: list[tuple[str, str]]) -> list[float]:
            calls["predict"] += 1
            calls["pairs"] = list(pairs)
            return list(scores)[: len(pairs)]

    module = types.ModuleType("sentence_transformers")
    module.CrossEncoder = FakeCrossEncoder  # type: ignore[attr-defined]
    monkeypatch.setitem(sys.modules, "sentence_transformers", module)
    return calls


def fake_transformers(monkeypatch: pytest.MonkeyPatch, score_fn) -> dict:
    """Inject a fake ``transformers.pipeline`` backed by ``score_fn(text, pair)``."""
    calls: dict[str, Any] = {"created": 0}

    class FakePipe:
        def __call__(self, inputs: dict, top_k: Any = None) -> list[dict]:
            assert top_k is None
            return score_fn(inputs["text"], inputs["text_pair"])

    def fake_pipeline(task: str, model: str = "", device: Any = None, top_k: Any = None) -> FakePipe:
        calls["created"] += 1
        calls["task"] = task
        calls["model"] = model
        calls["device"] = device
        return FakePipe()

    module = types.ModuleType("transformers")
    module.pipeline = fake_pipeline  # type: ignore[attr-defined]
    monkeypatch.setitem(sys.modules, "transformers", module)
    return calls


def nli_scores(entailment: float, neutral: float, contradiction: float) -> list[dict]:
    return [
        {"label": "ENTAILMENT", "score": entailment},
        {"label": "NEUTRAL", "score": neutral},
        {"label": "CONTRADICTION", "score": contradiction},
    ]


def fake_openai_client(reply: str) -> tuple[Any, list[dict]]:
    calls: list[dict] = []

    class Completions:
        def create(self, **kwargs: Any) -> Any:
            calls.append(kwargs)
            message = SimpleNamespace(content=reply)
            return SimpleNamespace(choices=[SimpleNamespace(message=message)])

    client = SimpleNamespace(chat=SimpleNamespace(completions=Completions()))
    return client, calls


# --------------------------------------------------------------------------- #
# Verdict / interface contract
# --------------------------------------------------------------------------- #


def test_labels_are_exactly_the_three_frozen_values() -> None:
    assert set(VERDICTS) == {"supported", "contradicted", "unverifiable"}
    assert (SUPPORTED, CONTRADICTED, UNVERIFIABLE) == VERDICTS


def test_verdict_rejects_an_unknown_label() -> None:
    with pytest.raises(ValueError, match="unknown verdict label"):
        Verdict("maybe", [], [], "lexical")


def test_verdict_coerces_to_json_safe_lists() -> None:
    verdict = Verdict(SUPPORTED, [1, 0.5], ["p0", "p1"], "lexical")  # type: ignore[list-item]
    assert verdict.scores == [1.0, 0.5]
    assert all(isinstance(score, float) for score in verdict.scores)
    assert verdict.as_dict() == {
        "label": SUPPORTED,
        "scores": [1.0, 0.5],
        "evidence_ids": ["p0", "p1"],
        "verifier": "lexical",
    }


def test_evidence_ids_follow_passage_order_and_keep_blank_slots() -> None:
    verdict = LexicalVerifier().verdict("the sky is blue", ["the sky is blue", "", "cats sleep"])
    assert verdict.evidence_ids == ["p0", "p1", "p2"]
    assert len(verdict.scores) == 3
    assert verdict.scores[1] == 0.0


def test_every_verifier_has_a_callable_load_for_preflight() -> None:
    assert LexicalVerifier().load() is None
    assert isinstance(build_verifier("lexical"), LexicalVerifier)


# --------------------------------------------------------------------------- #
# LexicalVerifier
# --------------------------------------------------------------------------- #


def test_lexical_supported() -> None:
    verdict = LexicalVerifier().verdict(
        "The sky appears blue due to Rayleigh scattering",
        ["The sky appears blue because of Rayleigh scattering."],
    )
    assert verdict.label == SUPPORTED
    assert verdict.verifier == "lexical"
    assert verdict.scores == pytest.approx([5 / 6])


def test_lexical_numeric_contradiction() -> None:
    verdict = LexicalVerifier().verdict("The dose is 5 mg", ["The dose is 7 mg in this trial"])
    assert verdict.label == CONTRADICTED


def test_lexical_negation_contradiction() -> None:
    assert LexicalVerifier().verdict("The sky is not blue", ["The sky is blue"]).label == CONTRADICTED


def test_lexical_abstains_without_evidence() -> None:
    verifier = LexicalVerifier()
    for passages in ([], [""], ["   "]):
        verdict = verifier.verdict("anything", passages)
        assert verdict.label == UNVERIFIABLE
        assert verdict.evidence_ids == [f"p{i}" for i in range(len(passages))]


def test_lexical_is_deterministic() -> None:
    verifier = LexicalVerifier()
    first = verifier.verdict("alpha beta", ["alpha beta gamma", "delta"])
    second = verifier.verdict("alpha beta", ["alpha beta gamma", "delta"])
    assert first == second


def test_lexical_never_calls_the_optional_cross_encoder(monkeypatch: pytest.MonkeyPatch) -> None:
    def boom(*args: Any, **kwargs: Any) -> None:
        raise AssertionError("lexical verifier must not probe sentence-transformers")

    monkeypatch.setattr(verdicts, "_cross_encoder_scorer", boom)
    assert LexicalVerifier().verdict("alpha beta", ["alpha beta gamma"]).label == SUPPORTED


# --------------------------------------------------------------------------- #
# CrossEncoderVerifier
# --------------------------------------------------------------------------- #


def test_cross_encoder_unavailable_raises_with_install_hint(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setitem(sys.modules, "sentence_transformers", None)
    verifier = CrossEncoderVerifier()
    with pytest.raises(VerifierUnavailable, match="pip install sentence-transformers"):
        verifier.verdict("claim", ["passage"])


def test_cross_encoder_loads_lazily_and_scores_each_passage(monkeypatch: pytest.MonkeyPatch) -> None:
    calls = fake_sentence_transformers(monkeypatch, scores=[-3.0, 4.0])
    verifier = CrossEncoderVerifier(model_name="fake-model", device="cpu")
    assert calls["load"] == 0  # construction must not download or import

    verdict = verifier.verdict("alpha beta", ["alpha beta gamma", "delta"])
    assert verdict.label == SUPPORTED
    assert verdict.verifier == "cross-encoder"
    assert verdict.evidence_ids == ["p0", "p1"]
    assert verdict.scores[0] < 0.1 and verdict.scores[1] > 0.9
    assert calls["load"] == 1 and calls["predict"] == 1
    assert calls["pairs"] == [("alpha beta", "alpha beta gamma"), ("alpha beta", "delta")]

    verifier.verdict("alpha beta", ["delta"])
    assert calls["load"] == 1  # model reused
    assert calls["predict"] == 2


def test_cross_encoder_never_emits_contradicted(monkeypatch: pytest.MonkeyPatch) -> None:
    fake_sentence_transformers(monkeypatch, scores=[-9.0, -9.0])
    verdict = CrossEncoderVerifier().verdict("the sky is not blue", ["the sky is blue"])
    assert verdict.label == UNVERIFIABLE


# --------------------------------------------------------------------------- #
# NLIVerifier
# --------------------------------------------------------------------------- #


def test_nli_unavailable_raises_with_install_hint(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setitem(sys.modules, "transformers", None)
    with pytest.raises(VerifierUnavailable, match="pip install 'transformers"):
        NLIVerifier().verdict("claim", ["passage"])


def test_nli_supports_and_reports_per_passage_entailment(monkeypatch: pytest.MonkeyPatch) -> None:
    fake_transformers(monkeypatch, lambda text, pair: nli_scores(0.92, 0.05, 0.03))
    verdict = NLIVerifier(model_name="fake-nli").verdict("sky is blue", ["sky appears blue"])
    assert verdict.label == SUPPORTED
    assert verdict.verifier == "nli"
    assert verdict.evidence_ids == ["p0"]
    assert verdict.scores == pytest.approx([0.92])


def test_nli_contradiction_class_is_explicit_and_blocks_support(monkeypatch: pytest.MonkeyPatch) -> None:
    def score(text: str, pair: str) -> list[dict]:
        if "not" in text:
            return nli_scores(0.02, 0.03, 0.95)
        return nli_scores(0.95, 0.03, 0.02)

    fake_transformers(monkeypatch, score)
    verdict = NLIVerifier().verdict("the sky is blue", ["the sky is blue", "the sky is not blue"])
    assert verdict.label == CONTRADICTED
    assert verdict.scores == pytest.approx([0.95, 0.02])


def test_nli_maps_bare_label_ids(monkeypatch: pytest.MonkeyPatch) -> None:
    def score(text: str, pair: str) -> list[dict]:
        return [
            {"label": "LABEL_0", "score": 0.9},  # contradiction
            {"label": "LABEL_1", "score": 0.05},
            {"label": "LABEL_2", "score": 0.05},
        ]

    fake_transformers(monkeypatch, score)
    assert NLIVerifier().verdict("claim", ["passage"]).label == CONTRADICTED


def test_nli_bidirectional_requires_both_directions(monkeypatch: pytest.MonkeyPatch) -> None:
    def score(text: str, pair: str) -> list[dict]:
        # passage -> claim entails, claim -> passage does not
        return nli_scores(0.9, 0.05, 0.05) if "passage" in text else nli_scores(0.1, 0.85, 0.05)

    fake_transformers(monkeypatch, score)
    forward_only = NLIVerifier().verdict("claim", ["passage"])
    both_ways = NLIVerifier(bidirectional=True).verdict("claim", ["passage"])
    assert forward_only.label == SUPPORTED
    assert both_ways.label == UNVERIFIABLE
    assert both_ways.scores == pytest.approx([0.1])


def test_nli_empty_passages_abstain_without_loading(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setitem(sys.modules, "transformers", None)  # import would raise
    verdict = NLIVerifier().verdict("claim", [])
    assert verdict.label == UNVERIFIABLE
    assert verdict.scores == [] and verdict.evidence_ids == []


# --------------------------------------------------------------------------- #
# LLMJudgeVerifier
# --------------------------------------------------------------------------- #


def test_judge_called_once_per_claim_and_parses_json() -> None:
    judge = RecordingJudge('{"label": "supported", "confidence": 0.8}')
    verdict = LLMJudgeVerifier(judge, "mock-judge").verdict("sky is blue", ["sky appears blue"])
    assert verdict.label == SUPPORTED
    assert verdict.scores == [0.8]
    assert verdict.verifier == "llm-judge"
    assert judge.n_calls == 1
    assert "[p0] sky appears blue" in judge.calls[0]


def test_judge_openai_compatible_client_path() -> None:
    client, calls = fake_openai_client('{"label": "contradicted", "confidence": 0.7}')
    verdict = LLMJudgeVerifier(client, "judge-model").verdict("sky is blue", ["sky is not blue"])
    assert verdict.label == CONTRADICTED
    assert calls[0]["model"] == "judge-model"
    assert calls[0]["messages"][0]["role"] == "user"
    assert "sky is not blue" in calls[0]["messages"][0]["content"]


def test_judge_tolerates_fenced_json() -> None:
    judge = RecordingJudge('```json\n{"label": "supported", "confidence": 0.6}\n```')
    assert LLMJudgeVerifier(judge, "m").verdict("claim", ["passage"]).label == SUPPORTED


def test_judge_malformed_output_is_unverifiable_after_one_retry() -> None:
    judge = RecordingJudge("It looks supported to me.")
    verdict = LLMJudgeVerifier(judge, "m").verdict("claim", ["passage"])
    assert verdict.label == UNVERIFIABLE
    assert verdict.verifier == "llm-judge:parse-error"
    assert judge.n_calls == 2  # one retry, exactly


def test_judge_retry_then_success_records_the_clean_tag() -> None:
    judge = RecordingJudge("not json", '{"label": "supported", "confidence": 0.9}')
    verdict = LLMJudgeVerifier(judge, "m").verdict("claim", ["passage"])
    assert verdict.label == SUPPORTED
    assert verdict.verifier == "llm-judge"
    assert judge.n_calls == 2


def test_judge_unknown_label_is_a_parse_error() -> None:
    judge = RecordingJudge('{"label": "probably", "confidence": 0.9}')
    verdict = LLMJudgeVerifier(judge, "m").verdict("claim", ["passage"])
    assert verdict.label == UNVERIFIABLE
    assert verdict.verifier == "llm-judge:parse-error"


def test_judge_supported_with_contradiction_is_downgraded() -> None:
    reply = '{"label": "supported", "confidence": 0.9, "contradiction": true}'
    judge = RecordingJudge(reply)
    assert LLMJudgeVerifier(judge, "m").verdict("claim", ["passage"]).label == UNVERIFIABLE
    permissive = LLMJudgeVerifier(judge, "m", require_bidirectional=False)
    assert permissive.verdict("claim", ["passage"]).label == SUPPORTED


def test_judge_empty_passages_abstains_without_calling_the_model() -> None:
    judge = RecordingJudge('{"label": "supported", "confidence": 0.9}')
    verdict = LLMJudgeVerifier(judge, "m").verdict("claim", [])
    assert verdict.label == UNVERIFIABLE
    assert verdict.scores == [] and verdict.evidence_ids == []
    assert judge.n_calls == 0


def test_judge_client_exception_is_retried_once_then_raised() -> None:
    judge = RecordingJudge(RuntimeError("judge down"), RuntimeError("judge down"))
    with pytest.raises(RuntimeError, match="judge down"):
        LLMJudgeVerifier(judge, "m").verdict("claim", ["passage"])
    assert judge.n_calls == 2


def test_judge_rejects_a_client_that_is_neither_openai_nor_callable() -> None:
    with pytest.raises(TypeError, match="OpenAI-compatible"):
        LLMJudgeVerifier(object(), "m").verdict("claim", ["passage"])


def test_judge_custom_template_requires_both_placeholders() -> None:
    with pytest.raises(ValueError, match="missing placeholders"):
        LLMJudgeVerifier(RecordingJudge("{}"), "m", prompt_template="Claim: {claim}")
    judge = RecordingJudge('{"label": "unverifiable", "confidence": 0.1}')
    verifier = LLMJudgeVerifier(
        judge, "m", prompt_template="CLAIM={claim}\nEVIDENCE={passages}\nJSON:"
    )
    verifier.verdict("alpha", ["beta"])
    assert judge.calls[0].startswith("CLAIM=alpha")


# --------------------------------------------------------------------------- #
# factory
# --------------------------------------------------------------------------- #


def test_factory_builds_every_named_verifier() -> None:
    assert isinstance(build_verifier("lexical"), LexicalVerifier)
    assert isinstance(build_verifier("cross-encoder", model_name="m"), CrossEncoderVerifier)
    assert isinstance(build_verifier("nli", model_name="m"), NLIVerifier)
    judge = build_verifier("llm-judge", client=RecordingJudge("{}"), model="m")
    assert isinstance(judge, LLMJudgeVerifier)
    assert judge.model == "m"


def test_factory_aliases_and_kwargs() -> None:
    assert isinstance(build_verifier("llm_judge", client=RecordingJudge("{}"), model="m"), LLMJudgeVerifier)
    verifier = build_verifier("lexical", support_threshold=0.99)
    assert isinstance(verifier, LexicalVerifier) and verifier.support_threshold == 0.99


def test_factory_rejects_unknown_names() -> None:
    with pytest.raises(ValueError, match="unknown verifier"):
        build_verifier("oracle")
