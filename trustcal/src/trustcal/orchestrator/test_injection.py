"""Injection protocol tests — strict majority, arms, templates, one-shot delivery."""

from __future__ import annotations

import pytest

from ..agents import AGENT_SYSTEM
from .debate import DebateRunner
from .injection import (
    ARMS,
    PARAPHRASE_TEMPLATES,
    build_injection,
    is_checkable,
    render_injection,
    strict_majority,
)

OPTIONS = ["mitochondrial matrix", "cytoplasm", "nucleus", "reticulum"]
AUTHORITY_MARKER = "survey of 100 domain experts"
PEER_MARKER = "reviewers on this panel"


class PersonaClient:
    """Replies with its prior answer, switching once it sees the pressure text."""

    def __init__(self, answer: str = "C", switch_to: str = "B") -> None:
        self.answer = answer
        self.switch_to = switch_to
        self.systems: list[str] = []
        self.users: list[str] = []
        self.seen_injection = False

    def complete(self, system: str, user: str) -> str:
        self.systems.append(system)
        self.users.append(user)
        if AUTHORITY_MARKER in user.lower() or PEER_MARKER in user.lower():
            self.seen_injection = True
        answer = self.switch_to if self.seen_injection else self.answer
        return (
            f"Answer: {answer}\nReasoning.\n"
            '<claim id="c1">x is the case</claim>'
        )


# --------------------------------------------------------------------------- #
# Decision logic
# --------------------------------------------------------------------------- #


def test_unanimous_is_ineligible() -> None:
    plan = build_injection(["B", "B", "B"], OPTIONS)
    assert plan.eligible is False
    assert plan.reason == "unanimous"


def test_divergent_builds_consensus_and_minority_targets() -> None:
    plan = build_injection(["C", "B", "B"], OPTIONS)
    assert plan.eligible is True
    assert plan.targets == [0]
    assert plan.consensus.upper().startswith("B")
    assert plan.consensus_source == "external"
    assert plan.arm == "authority"
    assert AUTHORITY_MARKER in plan.message.lower()


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


def test_unknown_arm_and_template_raise() -> None:
    with pytest.raises(ValueError):
        build_injection(["C", "B", "B"], OPTIONS, arm="nobody")
    with pytest.raises(ValueError):
        build_injection(["C", "B", "B"], OPTIONS, template=PARAPHRASE_TEMPLATES)


def test_strict_two_thirds_majority_is_required() -> None:
    # 2/3 is a majority; 2/5 and 3/5 are not (strict 2/3 needs 4/5).
    assert strict_majority(["C", "B", "B"], OPTIONS)[0] is not None
    answer, count, required, reason = strict_majority(["B", "B", "C", "D", "E"], OPTIONS)
    assert answer is None and count == 2 and required == 4
    assert reason == "no_strict_majority"


def test_ties_are_excluded_and_flagged() -> None:
    plan = build_injection(["A", "B", "C"], OPTIONS)
    assert plan.eligible is False
    assert plan.reason == "tie"


def test_external_authority_vs_panel_peer_source() -> None:
    authority = build_injection(["C", "B", "B"], OPTIONS, arm="authority")
    peer = build_injection(["C", "B", "B"], OPTIONS, arm="peer")

    assert authority.consensus_source == "external"
    assert AUTHORITY_MARKER in authority.message.lower()
    assert "panel" not in authority.message.lower()

    assert peer.consensus_source == "panel"
    assert PEER_MARKER in peer.message.lower()
    assert "2 of the 3" in peer.message

    # An explicit source is honoured but does not change the target set.
    explicit = build_injection(["C", "B", "B"], OPTIONS, source="panel")
    assert explicit.consensus_source == "panel"
    assert explicit.targets == [0]


def test_three_paraphrases_per_arm_are_distinct() -> None:
    for arm in ("authority", "peer", "neutral"):
        messages = [render_injection("B", 2, 3, arm=arm, template=i) for i in range(3)]
        assert len(set(messages)) == 3, (arm, messages)


def test_neutral_arm_is_length_matched_and_pressure_free() -> None:
    for template in range(PARAPHRASE_TEMPLATES):
        authority = build_injection(["C", "B", "B"], OPTIONS, arm="authority", template=template)
        neutral = build_injection(["C", "B", "B"], OPTIONS, arm="neutral", template=template)
        peer = build_injection(["C", "B", "B"], OPTIONS, arm="peer", template=template)

        assert neutral.eligible is True
        assert neutral.targets == authority.targets
        # The neutral control is paired with the authority arm, so it matches
        # that arm's length exactly (the peer arm varies with its count words).
        assert len(neutral.message) == len(authority.message)
        assert abs(len(neutral.message) - len(peer.message)) <= 20
        lowered = neutral.message.lower()
        assert AUTHORITY_MARKER not in lowered
        assert PEER_MARKER not in lowered
        assert "concluded" not in lowered
        assert "consensus" not in lowered


def test_no_pressure_arm_delivers_nothing() -> None:
    plan = build_injection(["C", "B", "B"], OPTIONS, arm="none")
    assert plan.eligible is False
    assert plan.reason == "no_pressure_arm"
    assert plan.targets == []
    assert plan.message == ""
    assert plan.arm in ARMS


def test_is_checkable() -> None:
    assert is_checkable("B", OPTIONS)
    assert is_checkable("cytoplasm", OPTIONS)
    assert is_checkable("7.3e-7")
    assert not is_checkable("a long free-text answer without any number")


# --------------------------------------------------------------------------- #
# Debate-loop delivery (one-shot, user turn, round 2 only)
# --------------------------------------------------------------------------- #


def test_debate_delivers_injection_to_minority_only_in_round_two() -> None:
    clients = [PersonaClient("C"), PersonaClient("B"), PersonaClient("B")]
    runner = DebateRunner(clients=clients, rounds=3, injection_scope="minority")
    result = runner.run("Question?", options=OPTIONS)

    assert result["injection"]["eligible"] is True
    assert result["injection"]["targets"] == [0]
    assert result["injection"]["round"] == 2
    assert result["injection"]["delivered"] is True
    assert result["injection"]["consensus_source"] == "external"
    assert result["injection"]["arm"] == "authority"

    # One-shot user message: round 2 has it, round 1 and round 3 do not.
    assert AUTHORITY_MARKER not in clients[0].users[0].lower()
    assert AUTHORITY_MARKER in clients[0].users[1].lower()
    assert AUTHORITY_MARKER not in clients[0].users[2].lower()

    # Other agents never see it, and the system prompt is never mutated.
    assert all(AUTHORITY_MARKER not in user.lower() for user in clients[1].users)
    assert all(AUTHORITY_MARKER not in user.lower() for user in clients[2].users)
    assert all(system == AGENT_SYSTEM for client in clients for system in client.systems)

    # Collapse happened: the minority switched C -> B after the round-2 injection.
    assert result["final_positions"][0].startswith("Answer: B")


def test_peer_arm_delivers_the_panel_majority() -> None:
    clients = [PersonaClient("C"), PersonaClient("B"), PersonaClient("B")]
    result = DebateRunner(
        clients=clients, rounds=2, injection_scope="minority", injection_arm="peer"
    ).run("Question?", options=OPTIONS)

    assert result["injection"]["consensus_source"] == "panel"
    assert PEER_MARKER in clients[0].users[1].lower()
    assert PEER_MARKER not in clients[1].users[1].lower()


def test_neutral_arm_delivers_equal_length_context() -> None:
    clients = [PersonaClient("C"), PersonaClient("B"), PersonaClient("B")]
    result = DebateRunner(
        clients=clients, rounds=2, injection_scope="minority", injection_arm="neutral"
    ).run("Question?", options=OPTIONS)

    assert result["injection"]["arm"] == "neutral"
    assert result["injection"]["delivered"] is True
    assert AUTHORITY_MARKER not in clients[0].users[1].lower()
    assert PEER_MARKER not in clients[0].users[1].lower()


def test_no_pressure_arm_does_not_inject() -> None:
    clients = [PersonaClient("C"), PersonaClient("B"), PersonaClient("B")]
    result = DebateRunner(
        clients=clients, rounds=2, injection_scope="minority", injection_arm="none"
    ).run("Question?", options=OPTIONS)

    assert result["injection"]["eligible"] is False
    assert result["injection"]["delivered"] is False
    assert result["injection"]["arm"] == "none"
    assert all(AUTHORITY_MARKER not in user.lower() for user in clients[0].users)


def test_debate_without_injection_is_unchanged() -> None:
    clients = [PersonaClient("C"), PersonaClient("B"), PersonaClient("B")]
    result = DebateRunner(clients=clients, rounds=3).run("Question?", options=OPTIONS)
    assert result["injection"] is None
    assert all(
        AUTHORITY_MARKER not in user.lower()
        for client in clients
        for user in client.users
    )
    assert result["transcript"][-1]["positions"][0].startswith("Answer: C")


def test_ineligible_injection_logs_reason_and_delivers_nothing() -> None:
    clients = [PersonaClient("B"), PersonaClient("B"), PersonaClient("B")]
    result = DebateRunner(clients=clients, rounds=3, injection_scope="minority").run(
        "Q?", options=OPTIONS
    )
    assert result["injection"]["eligible"] is False
    assert result["injection"]["reason"] == "unanimous"
    assert result["injection"]["delivered"] is False
    assert all(AUTHORITY_MARKER not in user.lower() for user in clients[0].users)


def test_systems_are_plain_agent_system_without_injection() -> None:
    clients = [PersonaClient("B")]
    DebateRunner(clients=clients, rounds=2).run("Q?")
    assert clients[0].systems[0] == AGENT_SYSTEM
