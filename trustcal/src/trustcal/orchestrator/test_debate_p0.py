"""P0-6 / P0-9 / P0-13 debate-layer contracts (verifier, injection, trust line)."""

from __future__ import annotations

import sys
from pathlib import Path

from ..retrieval.pipeline import RetrievalConfig
from ..retrieval.verifier import LexicalVerifier, Verdict
from ..trust import TrustConfig
from .debate import DebateRunner

OPTIONS = ["mitochondrial matrix", "cytoplasm", "nucleus", "reticulum"]
AUTHORITY_MARKER = "survey of 100 domain experts"

ALPHA = (
    'Answer: alpha\n<claim id="c1">alpha reduces risk</claim>\n'
    '<claim id="c2">alpha is safe</claim>\n<claim id="c3">alpha reduces risk</claim>'
)
BETA = 'Answer: beta\n<claim id="c1">beta increases risk</claim>'


class ScriptedClient:
    def __init__(self, texts: list[str]) -> None:
        self.texts = texts
        self.users: list[str] = []
        self.systems: list[str] = []

    def complete(self, system: str, user: str) -> str:
        self.systems.append(system)
        self.users.append(user)
        index = min(len(self.users) - 1, len(self.texts) - 1)
        return self.texts[index]


class RecordingVerifier:
    """Deterministic mock with the P0-6 verdict surface."""

    name = "mock"
    version = "test"

    def __init__(self) -> None:
        self.calls: list[tuple[str, list[str]]] = []

    def verdict(self, claim: str, passages: list[str]) -> Verdict:
        self.calls.append((claim, list(passages)))
        return Verdict(
            "supported",
            [1.0 for _ in passages],
            [f"p{i}" for i in range(len(passages))],
            self.name,
        )


class ManyPassageRetriever:
    """Returns more passages than the prompt can show (P0-6 alignment probe)."""

    def __init__(self, passages: list[str], prompt_passages: int = 2) -> None:
        self.passages = passages
        self.config = RetrievalConfig(prompt_passages=prompt_passages, max_chars=1200)

    def retrieve(self, agent_index: int, claim: str, round_number: int = 1) -> list[str]:
        return list(self.passages)


# --------------------------------------------------------------------------- #
# Verifier wiring (P0-6)
# --------------------------------------------------------------------------- #


def test_verifier_is_called_once_per_distinct_claim() -> None:
    verifier = RecordingVerifier()
    clients = [ScriptedClient([ALPHA]) for _ in range(3)]
    runner = DebateRunner(
        clients=clients,
        rounds=2,
        retriever=ManyPassageRetriever(["alpha reduces risk in the randomized trial"]),
        verifier=verifier,
        trust_config=TrustConfig(use_trust=False),
    )
    result = runner.run("Does alpha reduce risk?", ["alpha", "beta"])

    # Two distinct claims (the third is a duplicate) x three agents, one round.
    assert len(verifier.calls) == 6
    assert len(result["verdicts"]) == 6

    first = result["verdicts"][0]
    assert set(first) == {
        "agent",
        "round",
        "claim",
        "passages",
        "scores",
        "evidence_ids",
        "verdict",
        "verifier",
    }
    assert first["agent"] == 0
    assert first["round"] == 2
    assert first["claim"] == "alpha reduces risk"
    assert first["passages"] == ["alpha reduces risk in the randomized trial"]
    assert first["verdict"] == "supported"
    assert first["verifier"] == "mock"
    assert first["evidence_ids"] == ["p0"]
    assert first["scores"] == [1.0]


def test_verifier_judges_only_the_passages_the_prompt_shows() -> None:
    verifier = RecordingVerifier()
    passages = [f"passage {i} about alpha risk" for i in range(5)]
    clients = [ScriptedClient([ALPHA])]
    runner = DebateRunner(
        clients=clients,
        rounds=2,
        retriever=ManyPassageRetriever(passages, prompt_passages=2),
        verifier=verifier,
        trust_config=TrustConfig(use_trust=False),
    )
    result = runner.run("Does alpha reduce risk?", ["alpha", "beta"])

    shown = verifier.calls[0][1]
    assert shown == passages[:2]
    assert result["evidence"][0]["passages"][0] == shown
    assert "passage 2" not in clients[0].users[1]
    assert "passage 1" in clients[0].users[1]


def test_default_verifier_is_the_pinned_lexical_baseline() -> None:
    runner = DebateRunner(clients=[ScriptedClient([BETA])], rounds=2)
    assert isinstance(runner.verifier, LexicalVerifier)


# --------------------------------------------------------------------------- #
# B8 + injection with trust (P0-3) at the debate layer
# --------------------------------------------------------------------------- #


def test_b8_plus_injection_has_consensus_targets_trust_and_evidence() -> None:
    clients = [
        ScriptedClient(['Answer: C\n<claim id="c1">x is the case</claim>'] * 3),
        ScriptedClient(['Answer: B\n<claim id="c1">x is the case</claim>'] * 3),
        ScriptedClient(['Answer: B\n<claim id="c1">x is the case</claim>'] * 3),
    ]
    runner = DebateRunner(
        clients=clients,
        rounds=3,
        retriever=ManyPassageRetriever(["Evidence passage supports the option."]),
        injection_scope="minority",
    )
    result = runner.run("Which option?", OPTIONS)

    injection = result["injection"]
    assert injection["eligible"] is True
    assert injection["consensus"] == "B"
    assert injection["targets"] == [0]
    assert injection["consensus_source"] == "external"
    assert injection["delivered"] is True

    assert result["trust_trajectory"] is not None
    assert result["evidence"]
    assert result["verdicts"]
    assert all(entry["verifier"] == "lexical" for entry in result["verdicts"])

    # One-shot: round 2 has the injection, round 3 does not.
    assert AUTHORITY_MARKER in clients[0].users[1].lower()
    assert AUTHORITY_MARKER not in clients[0].users[2].lower()


def test_b8_injection_record_payload_carries_all_required_fields() -> None:
    from ..runner import debate_record

    clients = [
        ScriptedClient(['Answer: C\n<claim id="c1">x is the case</claim>'] * 3),
        ScriptedClient(['Answer: B\n<claim id="c1">x is the case</claim>'] * 3),
        ScriptedClient(['Answer: B\n<claim id="c1">x is the case</claim>'] * 3),
    ]
    question = {"question": "Which option?", "answer": "nucleus", "options": OPTIONS}
    runner = DebateRunner(
        clients=clients,
        rounds=3,
        retriever=ManyPassageRetriever(["Evidence passage supports the option."]),
        injection_scope="minority",
        seed=1,
        question_id="mock-b8-inject",
        gold=question["answer"],
    )
    result = runner.run(question["question"], question["options"])
    record = debate_record("mock-b8-inject", question, result, "B8", 1, 0.1)

    assert record["injection"]["consensus"] == "B"
    assert record["injection"]["targets"] == [0]
    assert record["injection"]["consensus_source"] == "external"
    assert record["consensus"] == "B"
    assert record["targets"] == [0]
    assert record["trust_trajectory"]
    assert record["evidence"]
    assert record["verdicts"]


# --------------------------------------------------------------------------- #
# Trust-line switch (P0-13, gate check 7)
# --------------------------------------------------------------------------- #


def test_b8_vs_b8_no_trust_differs_only_in_trust_lines() -> None:
    sys.path.insert(0, str(Path(__file__).resolve().parents[3] / "scripts"))
    import p0_gate

    result = p0_gate.check_b8_no_trust()
    assert result.status == p0_gate.PASS, result.detail
