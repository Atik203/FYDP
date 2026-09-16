"""Debate loop contract test — no GPU, no network.

Catches interface drift (the complete(system, user) signature) and transcript
shape before any paid GPU session.
"""

from __future__ import annotations


class FakeClient:
    """Same call surface as VLLMClient.complete(system, user)."""

    def __init__(self, name: str) -> None:
        self.name = name
        self.calls: list[tuple[str, str]] = []

    def complete(self, system: str, user: str) -> str:
        self.calls.append((system, user))
        return f'Answer: {self.name} says 42.\n<claim id="c1">because arithmetic</claim>'


def test_vanilla_loop_runs_all_rounds() -> None:
    from .debate import DebateRunner

    clients = [FakeClient(f"agent{i}") for i in range(1, 4)]
    runner = DebateRunner(clients=clients, rounds=3)
    out = runner.run("What is 6*7?")

    assert out["rounds_completed"] == 3
    assert len(out["final_positions"]) == 3
    assert len(out["transcript"]) == 3
    assert all(len(c.calls) == 3 for c in clients)  # 1 initial + 2 revisions
    assert all(system and user for system, user in clients[0].calls)
    assert "Agent 2" in clients[1].calls[-1][1]  # peers visible in the revision prompt


def test_parse_position_and_claims_on_fake_output() -> None:
    from ..agents import extract_claims, parse_position

    text = FakeClient("agent1").complete("sys", "usr")
    assert parse_position(text) == "agent1 says 42."
    assert extract_claims(text) == [("c1", "because arithmetic")]
