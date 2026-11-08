"""Trust-calibrated loop contract: evidence changes weights and aggregation.

Wave 2 (P0-5): trust is scored on the final positions, claim counts are
deduplicated, and every round carries a `trust_status` telemetry value.
"""

from __future__ import annotations

import re

import numpy as np
import pytest

from ..retrieval.pipeline import StaticRetriever
from ..trust import TrustConfig
from ..trust.update import update_trust
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


# --------------------------------------------------------------------------- #
# Wave-2 fixtures: positions drift between rounds, evidence is claim-keyed.
# --------------------------------------------------------------------------- #

ALPHA = 'Answer: alpha\n<claim id="c1">alpha reduces risk</claim>'
BETA = 'Answer: beta\n<claim id="c1">beta increases risk</claim>'
GAMMA = 'Answer: gamma\n<claim id="c1">gamma is stable</claim>'

_EVIDENCE = {
    "alpha reduces risk": ["alpha reduces risk in the randomized trial"],
    "beta increases risk": ["beta does not increase risk in the cohort"],
    "gamma is stable": ["gamma is stable across every replication"],
}


def _claim_retriever() -> StaticRetriever:
    return StaticRetriever({0: _EVIDENCE, 1: _EVIDENCE, 2: _EVIDENCE})


class RoundAwareRetriever:
    """Claim-keyed evidence that turns neutral from ``neutral_from`` onward."""

    def __init__(self, neutral_from: int = 3) -> None:
        self.neutral_from = neutral_from

    def retrieve(self, agent_index: int, claim: str, round_number: int = 1) -> list[str]:
        if round_number >= self.neutral_from:
            return ["tectonic plates move a few centimetres per year"]
        return _EVIDENCE.get(claim, [])


def _repeat_claims(text: str, copies: int) -> str:
    """Duplicate every tagged claim in ``text`` (verbosity probe)."""

    def expand(match: "re.Match[str]") -> str:
        return "\n".join(
            f'<claim id="c{i}">{match.group(1)}</claim>' for i in range(1, copies + 1)
        )

    return re.sub(r'<claim id="c1">(.*?)</claim>', expand, text, flags=re.DOTALL)


def _timing_run() -> dict:
    clients = [
        ScriptedClient([ALPHA, BETA]),  # flips to the majority
        ScriptedClient([BETA, BETA]),
        ScriptedClient([BETA, GAMMA]),  # flips away from the majority
    ]
    return DebateRunner(clients=clients, rounds=2, retriever=_claim_retriever()).run(
        "Which option?", ["alpha", "beta", "gamma"]
    )


# --------------------------------------------------------------------------- #
# P0-5: trust timing, status, claim counts, trajectory bounds.
# --------------------------------------------------------------------------- #


def test_trust_for_positions_is_computed_from_final_positions() -> None:
    result = _timing_run()

    assert [p.split("\n")[0] for p in result["final_positions"]] == [
        "Answer: beta",
        "Answer: beta",
        "Answer: gamma",
    ]
    trajectory = result["trust_trajectory"]
    assert len(trajectory) == 3, trajectory  # uniform + round-1 pass + final pass
    assert result["trust_status"] == ["updated", "updated"]
    assert result["trust_for_positions"] == pytest.approx(trajectory[-1], abs=1e-12)

    # Round-1 pass scored [alpha, beta, beta]; the final pass scored
    # [beta, beta, gamma]. The aggregation weight must be the latter.
    expected = update_trust(
        np.asarray(trajectory[-2]),
        np.array([0.0, 0.0, 1.0]),
        np.array([1.0, 1.0, 0.0]),
        np.array([1.0, 1.0, 1.0]),
    )
    assert result["trust_for_positions"] == pytest.approx(expected.tolist(), abs=1e-12)
    assert not np.allclose(trajectory[-1], trajectory[1]), "used the stale round-1 trust"

    # The trust actually handed to `aggregate` is the same vector.
    assert result["aggregation"]["majority"] == "beta"
    assert result["final_trust"] == result["trust_for_positions"]


def test_trust_status_is_updated_on_every_scored_round() -> None:
    result = _timing_run()
    verdicts = result["verdicts"]
    assert [entry["round"] for entry in verdicts] == [2, 3]
    assert verdicts[0]["support"] == [1, 0, 0]
    assert verdicts[0]["harm"] == [0, 1, 1]
    assert verdicts[1]["support"] == [0, 0, 1]
    assert verdicts[1]["harm"] == [1, 1, 0]


def test_trust_status_abstains_when_panel_is_unanimous() -> None:
    clients = [ScriptedClient([ALPHA, ALPHA]) for _ in range(3)]
    result = DebateRunner(clients=clients, rounds=2, retriever=_claim_retriever()).run(
        "Which option?", ["alpha", "beta", "gamma"]
    )
    assert result["trust_status"] == ["abstained_unanimous", "abstained_unanimous"]
    assert result["trust_trajectory"] is None
    assert result["trust_for_positions"] is None
    assert result["aggregation"]["majority"] == result["aggregation"]["weighted"] == "alpha"


def test_trust_status_abstains_without_evidence() -> None:
    clients = [
        ScriptedClient([ALPHA, BETA]),
        ScriptedClient([BETA, BETA]),
        ScriptedClient([BETA, GAMMA]),
    ]
    result = DebateRunner(clients=clients, rounds=2).run("Which option?")
    assert result["trust_status"] == ["abstained_no_evidence", "abstained_no_evidence"]
    assert result["trust_trajectory"] is None
    assert result["trust_for_positions"] is None
    assert result["evidence"] == []


def test_no_trust_arm_has_no_trust_telemetry() -> None:
    clients = [
        ScriptedClient([ALPHA, BETA]),
        ScriptedClient([BETA, BETA]),
        ScriptedClient([BETA, GAMMA]),
    ]
    result = DebateRunner(
        clients=clients,
        rounds=2,
        retriever=_claim_retriever(),
        trust_config=TrustConfig(use_trust=False),
    ).run("Which option?", ["alpha", "beta", "gamma"])
    assert result["trust_trajectory"] is None
    assert result["trust_for_positions"] is None
    assert result["trust_status"] is None


def test_duplicate_claims_do_not_change_trust() -> None:
    terse = [
        ScriptedClient([ALPHA, ALPHA]),
        ScriptedClient([BETA, BETA]),
        ScriptedClient([BETA, BETA]),
    ]
    verbose_texts = [_repeat_claims(text, 8) for text in (ALPHA, BETA, BETA)]
    verbose = [ScriptedClient([text, text]) for text in verbose_texts]

    plain = DebateRunner(clients=terse, rounds=2, retriever=_claim_retriever()).run(
        "Which option?", ["alpha", "beta", "gamma"]
    )
    noisy = DebateRunner(clients=verbose, rounds=2, retriever=_claim_retriever()).run(
        "Which option?", ["alpha", "beta", "gamma"]
    )

    # Deduplication happened: eight copies of one claim are one claim checked.
    assert all(entry["n_claims"] == [1, 1, 1] for entry in noisy["verdicts"])
    assert np.allclose(
        noisy["trust_trajectory"], plain["trust_trajectory"], atol=1e-12, rtol=0
    )
    assert np.allclose(
        noisy["trust_for_positions"], plain["trust_for_positions"], atol=1e-12, rtol=0
    )


def test_neutral_evidence_is_an_identity_not_a_reuniformization() -> None:
    clients = [
        ScriptedClient([ALPHA, BETA]),
        ScriptedClient([BETA, BETA]),
        ScriptedClient([BETA, GAMMA]),
    ]
    result = DebateRunner(
        clients=clients, rounds=2, retriever=RoundAwareRetriever(neutral_from=3)
    ).run("Which option?", ["alpha", "beta", "gamma"])

    trajectory = result["trust_trajectory"]
    assert result["trust_status"] == ["updated", "updated"]
    assert len(trajectory) == 3
    assert not np.allclose(trajectory[1], trajectory[0]), "round-1 evidence had no effect"
    assert trajectory[-1] == pytest.approx(trajectory[-2], abs=1e-12), "neutral evidence moved trust"
    assert result["trust_for_positions"] == pytest.approx(trajectory[-1], abs=1e-12)


def test_trajectory_rows_are_simplex_vectors() -> None:
    result = _timing_run()
    for row in result["trust_trajectory"]:
        assert len(row) == 3
        assert abs(sum(row) - 1.0) <= 1e-9, row
        assert min(row) >= 0.1 - 1e-9, row
        assert max(row) <= 0.9 + 1e-9, row
    assert result["trust_for_positions"] == pytest.approx(result["trust_trajectory"][-1])
