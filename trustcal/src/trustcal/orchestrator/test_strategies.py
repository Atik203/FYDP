"""Baseline strategy contracts: B1/B2/B5/B6/B9/B10 with fake clients."""

from __future__ import annotations

from .strategies import (
    DebateGate,
    consensus_weighted_answer,
    parse_confidence,
    run_consensagent,
    run_imad,
    run_moa,
    run_self_consistency,
    run_single,
    run_single_rag,
)
from ..retrieval.pipeline import StaticRetriever


class FakeClient:
    def __init__(self, answer: str = "42", confidence: float = 0.9) -> None:
        self.answer = answer
        self.confidence = confidence
        self.calls: list[tuple[str, str]] = []

    def complete(self, system: str, user: str) -> str:
        self.calls.append((system, user))
        return f"Answer: {self.answer}\nCONFIDENCE: {self.confidence}\nReasoning."


QUESTION = {"question": "What is 6*7?", "answer": "42", "options": None}


def test_parse_confidence() -> None:
    assert parse_confidence("CONFIDENCE: 0.73") == 0.73
    assert parse_confidence("no number", default=0.4) == 0.4
    assert parse_confidence("CONFIDENCE: 9") == 1.0


def test_b1_single() -> None:
    result = run_single(QUESTION, FakeClient())
    assert len(result["transcript"]) == 1
    assert result["rounds_completed"] == 1


def test_b2_single_rag_includes_evidence() -> None:
    client = FakeClient()
    retriever = StaticRetriever(fallback=["evidence passage"])
    run_single_rag(QUESTION, client, retriever)
    assert "evidence passage" in client.calls[0][1]


def test_b5_self_consistency_samples() -> None:
    result = run_self_consistency(QUESTION, FakeClient(), samples=5)
    assert len(result["final_positions"]) == 5


def test_b6_moa_layers() -> None:
    result = run_moa(QUESTION, [FakeClient(), FakeClient(), FakeClient()], layers=2)
    assert len(result["transcript"]) == 2
    assert result["transcript"][0]["layer"] == 1
    assert result["transcript"][1]["layer"] == 2


def test_gate_triggers_on_low_confidence_and_hedging() -> None:
    gate = DebateGate(threshold=0.7)
    assert gate.should_debate("Answer: 42", 0.5) is True
    assert gate.should_debate("I am not sure, maybe 42", 0.9) is True
    assert gate.should_debate("Answer: 42", 0.9, alternative="42") is False
    assert gate.should_debate("Answer: 42", 0.9, alternative="43") is False


def test_imad_triggered_and_skipped() -> None:
    low = run_imad(QUESTION, [FakeClient(confidence=0.2), FakeClient(), FakeClient()], rounds=2)
    assert low["imad"]["triggered"] is True
    assert len(low["transcript"]) == 2

    high = run_imad(QUESTION, [FakeClient(confidence=0.95), FakeClient(), FakeClient()], rounds=2)
    # the fake has no ALTERNATIVE line, so the gate keeps the single answer
    assert high["imad"]["triggered"] is False
    assert len(high["transcript"]) == 1


def test_consensus_weighted_answer() -> None:
    answer = consensus_weighted_answer(
        [["A", "A", "B"], ["A", "A", "B"]],
        [[0.9, 0.8, 0.1], [0.9, 0.8, 0.1]],
    )
    assert answer == "A"


def test_consensagent_runs_rounds() -> None:
    result = run_consensagent(
        QUESTION,
        [FakeClient("42"), FakeClient("42"), FakeClient("41")],
        rounds=2,
    )
    assert len(result["transcript"]) == 2
    assert "triggers" in result["consensagent"]
    assert result["consensagent"]["weighted_answer"] is not None
