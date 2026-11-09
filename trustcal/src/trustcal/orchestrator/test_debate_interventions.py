"""Debate-loop integration for the WP-18 placebo and oracle controls.

The Full default placebo is unit B (``round_pool``): verdict labels move across
all agents' claims in one round, so per-agent support/harm counts and the trust
trajectory can change. Unit A (``agent_round``) remains as a manipulation
check. The oracle gold-answer mode bypasses the verifier and sets trust from
correctness; gold-evidence mode keeps the verifier/trust path but substitutes
the gold passages.
"""

from __future__ import annotations

from collections import Counter

import numpy as np
import pytest

from ..retrieval.pipeline import StaticRetriever
from ..retrieval.verifier import CONTRADICTED, SUPPORTED, UNVERIFIABLE, Verdict
from ..trust import TrustConfig
from .debate import TRUST_UPDATED, DebateRunner
from .interventions import GOLD_SOURCE_ANSWER, GOLD_SOURCE_EVIDENCE

ALPHA = 'Answer: alpha\n<claim id="c1">alpha one</claim>\n<claim id="c2">alpha two</claim>'
BETA = 'Answer: beta\n<claim id="c1">beta one</claim>\n<claim id="c2">beta two</claim>'
GOLD_EVIDENCE = ["alpha reduces risk in the randomized trial"]

SKEW_ALPHA = 'Answer: alpha\n<claim id="c1">a1</claim>\n<claim id="c2">a2</claim>'
SKEW_BETA = 'Answer: beta\n<claim id="c1">b1</claim>\n<claim id="c2">b2</claim>'
SKEW_GAMMA = 'Answer: gamma\n<claim id="c1">c1</claim>\n<claim id="c2">c2</claim>'


class ScriptedClient:
    def __init__(self, texts: list[str]) -> None:
        self.texts = texts
        self.calls: list[tuple[str, str]] = []

    def complete(self, system: str, user: str) -> str:
        self.calls.append((system, user))
        index = min(len(self.calls) - 1, len(self.texts) - 1)
        return self.texts[index]


class TwoClaimVerifier:
    """Supported for claims containing ``one``; contradicted otherwise."""

    name = "scripted"
    version = "1"

    def verdict(self, claim: str, passages: list[str]) -> Verdict:
        label = SUPPORTED if "one" in claim else CONTRADICTED
        return Verdict(label, [0.9], [f"p{i}" for i in range(len(passages))], self.name)


class SkewedVerifier:
    """Agent 0 is fully supported, agent 1 fully contradicted, agent 2 neutral."""

    name = "scripted"
    version = "1"

    def verdict(self, claim: str, passages: list[str]) -> Verdict:
        if claim.startswith("a"):
            label = SUPPORTED
        elif claim.startswith("b"):
            label = CONTRADICTED
        else:
            label = UNVERIFIABLE
        return Verdict(label, [0.9], [f"p{i}" for i in range(len(passages))], self.name)


class RaisingRetriever:
    def retrieve(self, *args, **kwargs):  # pragma: no cover - must not run
        raise AssertionError("gold-evidence mode must not call the retriever")


def _two_claim_clients() -> list[ScriptedClient]:
    return [ScriptedClient([ALPHA]), ScriptedClient([BETA]), ScriptedClient([BETA])]


def _skewed_clients() -> list[ScriptedClient]:
    return [
        ScriptedClient([SKEW_ALPHA]),
        ScriptedClient([SKEW_BETA]),
        ScriptedClient([SKEW_GAMMA]),
    ]


def _placebo_run(
    placebo_mode: str,
    clients=None,
    *,
    placebo_unit: str = "round_pool",
    verifier=None,
) -> dict:
    return DebateRunner(
        clients=clients or _two_claim_clients(),
        rounds=2,
        retriever=StaticRetriever(fallback=["a supporting or contradicting passage"]),
        verifier=verifier or TwoClaimVerifier(),
        placebo_mode=placebo_mode,
        placebo_unit=placebo_unit,
        seed=1,
        question_id="placebo-q",
    ).run("Which option is supported?", ["alpha", "beta", "gamma"])


def test_agent_round_placebo_changes_at_least_one_verdict_mapping() -> None:
    baseline = _placebo_run("off")
    placebo = _placebo_run("shuffle_verdicts", placebo_unit="agent_round")

    assert placebo["placebo_mode"] == "shuffle_verdicts"
    assert placebo["placebo_unit"] == "agent_round"
    assert isinstance(placebo["placebo_seed"], int)
    assert placebo["placebo_noop_reason"] is None
    assert len(placebo["placebo_permutation_hash"]) == 64

    block = placebo["placebo"]
    assert block["units"], "two claims per agent must produce shuffled units"
    for unit in block["units"]:
        assert unit["unit"] == "agent_round"
        assert unit["n"] == 2
        assert sorted(unit["order"]) == [0, 1]
        assert unit["order"] != [0, 1]
        assert sorted(unit["original"]) == sorted(unit["shuffled"])

    def mapping(result: dict) -> list[tuple[int, int, str, str]]:
        return [
            (entry["agent"], entry["round"], entry["claim"], entry["verdict"])
            for entry in result["verdicts"]
        ]

    assert mapping(placebo) != mapping(baseline)
    assert [entry[:3] for entry in mapping(placebo)] == [entry[:3] for entry in mapping(baseline)]


def test_round_pool_placebo_changes_counts_and_trust() -> None:
    baseline = _placebo_run("off", clients=_skewed_clients(), verifier=SkewedVerifier())
    placebo = _placebo_run(
        "shuffle_verdicts",
        clients=_skewed_clients(),
        verifier=SkewedVerifier(),
    )

    assert placebo["placebo_unit"] == "round_pool"
    assert placebo["placebo_noop_reason"] is None
    assert len(placebo["placebo"]["units"]) == 2  # rounds 2 and 3
    for unit in placebo["placebo"]["units"]:
        assert unit["unit"] == "round_pool"
        assert unit["pool_size"] == 6
        assert sorted(unit["original"]) == sorted(unit["shuffled"])

    # Controlled skewed fixture: baseline support is [2, 0, 0]; a pooled
    # permutation must move labels across agents and change at least one count.
    assert baseline["trust_rounds"][0]["support"] == [2, 0, 0]
    assert baseline["trust_rounds"][0]["harm"] == [0, 2, 0]
    assert placebo["trust_rounds"][0]["support"] != baseline["trust_rounds"][0]["support"]
    assert placebo["trust_rounds"][0]["harm"] != baseline["trust_rounds"][0]["harm"]
    assert not np.allclose(
        baseline["trust_trajectory"], placebo["trust_trajectory"], atol=1e-12, rtol=0
    )

    def multiset(result: dict) -> Counter:
        return Counter(entry["verdict"] for entry in result["verdicts"])

    assert multiset(placebo) == multiset(baseline)


def test_agent_round_noop_is_recorded_when_an_agent_has_one_claim() -> None:
    clients = [
        ScriptedClient(['Answer: alpha\n<claim id="c1">alpha one</claim>']),
        ScriptedClient(['Answer: beta\n<claim id="c1">beta one</claim>']),
        ScriptedClient(['Answer: beta\n<claim id="c1">beta one</claim>']),
    ]
    result = _placebo_run(
        "shuffle_verdicts", clients=clients, placebo_unit="agent_round"
    )

    assert result["placebo"]["units"] == []
    assert result["placebo_noop_reason"] == "fewer_than_two_verdicts"
    assert result["placebo"]["noop_units"]
    assert all(
        unit["reason"] == "fewer_than_two_verdicts"
        and unit["unit"] == "agent_round"
        for unit in result["placebo"]["noop_units"]
    )


def test_round_pool_noop_when_debate_has_one_verdict() -> None:
    result = DebateRunner(
        clients=[ScriptedClient(['Answer: alpha\n<claim id="c1">alpha one</claim>'])],
        rounds=2,
        retriever=StaticRetriever(fallback=["a passage"]),
        verifier=TwoClaimVerifier(),
        placebo_mode="shuffle_verdicts",
        placebo_unit="round_pool",
        seed=1,
        question_id="one-verdict-q",
    ).run("Which option is supported?", ["alpha", "beta", "gamma"])

    assert result["placebo_unit"] == "round_pool"
    assert result["placebo"]["units"] == []
    assert result["placebo_noop_reason"] == "fewer_than_two_verdicts"
    assert result["placebo"]["noop_units"] == [
        {
            "unit": "round_pool",
            "round": 2,
            "agent": None,
            "n": 1,
            "pool_size": 1,
            "reason": "fewer_than_two_verdicts",
        },
        {
            "unit": "round_pool",
            "round": 3,
            "agent": None,
            "n": 1,
            "pool_size": 1,
            "reason": "fewer_than_two_verdicts",
        },
    ]


def test_gold_answer_oracle_sets_trust_from_correctness() -> None:
    clients = [
        ScriptedClient(["Answer: alpha"]),
        ScriptedClient(["Answer: beta"]),
        ScriptedClient(["Answer: beta"]),
    ]
    result = DebateRunner(
        clients=clients,
        rounds=2,
        oracle_mode="gold_answer",
        gold="alpha",
        seed=1,
        question_id="oracle-q",
    ).run("Which option is supported?", ["alpha", "beta", "gamma"])

    assert result["oracle_mode"] == "gold_answer"
    assert result["oracle_gold_source"] == GOLD_SOURCE_ANSWER
    assert result["oracle_rounds_applied"] == [2, 3]
    assert result["trust_trajectory"] is not None
    assert result["trust_status"] == [TRUST_UPDATED, TRUST_UPDATED]
    assert result["trust_for_positions"] == pytest.approx([0.8, 0.1, 0.1], abs=1e-9)
    assert result["aggregation"]["majority"] == "beta"
    assert result["aggregation"]["weighted"] == "alpha"
    assert result["aggregation"]["changed"] is True
    assert result["oracle"]["schedule"] == "every_round"
    assert result["oracle"]["correct_by_round"] == [[True, False, False], [True, False, False]]


def test_gold_evidence_oracle_substitutes_evidence_and_keeps_trust_path() -> None:
    clients = [
        ScriptedClient([ALPHA]),
        ScriptedClient([BETA]),
        ScriptedClient([BETA]),
    ]
    result = DebateRunner(
        clients=clients,
        rounds=2,
        retriever=RaisingRetriever(),
        verifier=TwoClaimVerifier(),
        oracle_mode="gold_evidence",
        gold="alpha",
        gold_evidence=GOLD_EVIDENCE,
        seed=1,
        question_id="oracle-evidence-q",
    ).run("Which option is supported?", ["alpha", "beta", "gamma"])

    assert result["oracle_mode"] == "gold_evidence"
    assert result["oracle_gold_source"] == GOLD_SOURCE_EVIDENCE
    assert result["oracle_rounds_applied"] == [2, 3]
    assert result["trust_trajectory"] is not None
    assert result["trust_status"] == [TRUST_UPDATED, TRUST_UPDATED]
    assert result["evidence"], "gold evidence must be shown to the agents"
    for entry in result["evidence"]:
        for passages in entry["passages"]:
            assert passages == GOLD_EVIDENCE
    assert "alpha reduces risk" in clients[0].calls[-1][1]
    assert result["oracle"]["gold_source"] == GOLD_SOURCE_EVIDENCE
    assert result["oracle"]["rounds_applied"] == [2, 3]


def test_oracle_modes_are_mutually_exclusive_with_placebo() -> None:
    with pytest.raises(ValueError, match="mutually exclusive"):
        DebateRunner(
            clients=_two_claim_clients(),
            placebo_mode="shuffle_verdicts",
            oracle_mode="gold_answer",
            gold="alpha",
        )


def test_gold_answer_oracle_requires_a_gold_answer() -> None:
    with pytest.raises(ValueError, match="gold"):
        DebateRunner(
            clients=_two_claim_clients(),
            oracle_mode="gold_answer",
            gold="",
        )


def test_gold_evidence_oracle_requires_gold_evidence() -> None:
    with pytest.raises(ValueError, match="gold evidence"):
        DebateRunner(
            clients=_two_claim_clients(),
            oracle_mode="gold_evidence",
            gold="alpha",
            gold_evidence=None,
        )


def test_placebo_and_oracle_require_trust() -> None:
    with pytest.raises(ValueError, match="use_trust"):
        DebateRunner(
            clients=_two_claim_clients(),
            placebo_mode="shuffle_verdicts",
            trust_config=TrustConfig(use_trust=False),
        )
    with pytest.raises(ValueError, match="use_trust"):
        DebateRunner(
            clients=_two_claim_clients(),
            oracle_mode="gold_answer",
            gold="alpha",
            trust_config=TrustConfig(use_trust=False),
        )


def test_agent_round_trust_trajectory_is_unchanged() -> None:
    """Unit A preserves an agent's verdict multiset, so its trust is identical."""

    baseline = _placebo_run("off")
    placebo = _placebo_run("shuffle_verdicts", placebo_unit="agent_round")
    assert np.allclose(
        baseline["trust_trajectory"], placebo["trust_trajectory"], atol=1e-12, rtol=0
    )
