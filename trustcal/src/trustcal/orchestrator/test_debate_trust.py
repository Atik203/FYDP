"""Trust-calibrated loop contract: evidence changes weights and aggregation."""

from __future__ import annotations

from ..retrieval.pipeline import StaticRetriever
from ..trust import TrustConfig
from .debate import DebateRunner


class ScriptedClient:
    def __init__(self, texts: list[str]) -> None:
        self.texts = texts
        self.calls: list[tuple[str, str]] = []

    def complete(self, system: str, user: str) -> str:
        self.calls.append((system, user))
        index = min(len(self.calls) - 1, len(self.texts) - 1)
        return self.texts[index]


def _clients() -> list[ScriptedClient]:
    correct = 'Answer: correct\n<claim id="c1">alpha reduces risk</claim>'
    wrong = 'Answer: wrong\n<claim id="c1">beta increases risk</claim>'
    return [ScriptedClient([correct]), ScriptedClient([wrong]), ScriptedClient([wrong])]


def _retriever() -> StaticRetriever:
    return StaticRetriever(
        {
            0: {"alpha reduces risk": ["alpha reduces risk in the randomized trial"]},
            1: {"beta increases risk": ["beta does not increase risk in the cohort"]},
            2: {"beta increases risk": ["beta does not increase risk in the cohort"]},
        }
    )


def test_evidence_updates_trust_and_flips_aggregation() -> None:
    runner = DebateRunner(
        clients=_clients(),
        rounds=3,
        retriever=_retriever(),
        trust_config=TrustConfig(alpha=0.5, beta=0.3),
    )
    result = runner.run("Does alpha or beta matter?", ["correct", "wrong"])

    assert result["trust_trajectory"] is not None
    assert result["trust_trajectory"][-1][0] > 0.5
    assert result["verdicts"][0]["support"] == [1, 0, 0]
    assert result["verdicts"][0]["harm"] == [0, 1, 1]
    assert result["aggregation"]["majority"] == "wrong"
    assert result["aggregation"]["weighted"] == "correct"
    assert result["aggregation"]["changed"] is True


def test_evidence_is_visible_in_revision_prompt() -> None:
    clients = _clients()
    DebateRunner(clients=clients, rounds=2, retriever=_retriever()).run("Q?", ["correct", "wrong"])
    assert "Evidence retrieved" in clients[0].calls[-1][1]
    assert "alpha reduces risk" in clients[0].calls[-1][1]


def test_trust_ablation_keeps_majority() -> None:
    runner = DebateRunner(
        clients=_clients(),
        rounds=2,
        retriever=_retriever(),
        trust_config=TrustConfig(use_trust=False),
    )
    result = runner.run("Q?", ["correct", "wrong"])
    assert result["trust_trajectory"] is None
    assert result["aggregation"]["majority"] == result["aggregation"]["weighted"]


def test_no_retrieval_is_still_vanilla() -> None:
    clients = [ScriptedClient(["Answer: 42"]) for _ in range(3)]
    result = DebateRunner(clients=clients, rounds=2).run("Q?")
    assert result["trust_trajectory"] is None
    assert result["evidence"] == []
    assert len(result["transcript"]) == 2
