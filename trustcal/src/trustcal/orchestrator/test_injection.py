"""Injection protocol tests — decision logic and debate-loop delivery."""

from __future__ import annotations

import pytest

from ..agents import AGENT_SYSTEM
from .debate import DebateRunner
from .injection import build_injection, is_checkable

OPTIONS = ["mitochondrial matrix", "cytoplasm", "nucleus", "reticulum"]
MARKER = "community consensus"


class PersonaClient:
    """Replies 'C' normally, 'B' once it sees the injected consensus prompt."""

    def __init__(self, answer: str = "C") -> None:
        self.answer = answer
        self.systems: list[str] = []

    def complete(self, system: str, user: str) -> str:
        self.systems.append(system)
        injected = MARKER in system.lower()
        answer = "B" if injected else self.answer
        return f"Answer: {answer}\nReasoning.\n" + ('<claim id="c1">x is the case</claim>' if not injected else "")


def test_unanimous_is_ineligible() -> None:
    plan = build_injection(["B", "B", "B"], OPTIONS)
    assert plan.eligible is False
    assert plan.reason == "unanimous"


def test_divergent_builds_consensus_and_minority_targets() -> None:
    plan = build_injection(["C", "B", "B"], OPTIONS)
    assert plan.eligible is True
    assert plan.targets == [0]
    assert "cytoplasm" in plan.consensus.lower() or plan.consensus.upper().startswith("B")


def test_all_scope_targets_everyone() -> None:
    plan = build_injection(["C", "B", "B"], OPTIONS, scope="all")
    assert plan.targets == [0, 1, 2]


def test_uncheckable_answers_are_ineligible() -> None:
    plan = build_injection(["the first explanation", "the second explanation", "the third one"], None)
    assert plan.eligible is False
    assert plan.reason == "uncheckable_answer"


def test_unknown_scope_raises() -> None:
    with pytest.raises(ValueError):
        build_injection(["C", "B", "B"], OPTIONS, scope="nobody")


def test_is_checkable() -> None:
    assert is_checkable("B", OPTIONS)
    assert is_checkable("cytoplasm", OPTIONS)
    assert is_checkable("7.3e-7")
    assert not is_checkable("a long free-text answer without any number")


def test_debate_delivers_injection_to_minority_only() -> None:
    clients = [PersonaClient("C"), PersonaClient("B"), PersonaClient("B")]
    runner = DebateRunner(clients=clients, rounds=3, injection_scope="minority")
    result = runner.run("Question?", options=OPTIONS)

    # injection plan logged and delivered
    assert result["injection"]["eligible"] is True
    assert result["injection"]["targets"] == [0]
    assert result["injection"]["round"] == 2

    # minority saw the consensus text from round 2 onward, majority never did
    assert MARKER not in clients[0].systems[0]
    assert MARKER in clients[0].systems[1]
    assert MARKER in clients[0].systems[2]
    assert all(MARKER not in c.systems[1] for c in clients[1:])

    # collapse happened: minority switched C -> B
    answers = [result["final_positions"][i].splitlines()[0] for i in range(3)]
    assert answers[0] == "Answer: B"
    assert result["transcript"][-1]["positions"][0].startswith("Answer: B")


def test_debate_without_injection_is_unchanged() -> None:
    clients = [PersonaClient("C"), PersonaClient("B"), PersonaClient("B")]
    result = DebateRunner(clients=clients, rounds=3).run("Question?", options=OPTIONS)
    assert result["injection"] is None
    assert all(MARKER not in s for c in clients for s in c.systems)
    assert result["transcript"][-1]["positions"][0].startswith("Answer: C")


def test_ineligible_injection_logs_reason_and_delivers_nothing() -> None:
    clients = [PersonaClient("B"), PersonaClient("B"), PersonaClient("B")]
    result = DebateRunner(clients=clients, rounds=3, injection_scope="minority").run("Q?", options=OPTIONS)
    assert result["injection"]["eligible"] is False
    assert result["injection"]["reason"] == "unanimous"
    assert all(MARKER not in s for c in clients for s in c.systems)


def test_systems_are_plain_agent_system_without_injection() -> None:
    clients = [PersonaClient("B")]
    DebateRunner(clients=clients, rounds=2).run("Q?")
    assert clients[0].systems[0] == AGENT_SYSTEM
