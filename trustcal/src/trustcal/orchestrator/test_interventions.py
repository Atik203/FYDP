"""WP-18 causal controls: placebo permutation and oracle trust (pure functions).

The Full default is unit B (``round_pool``): all agents' claim-verdict labels
in one round are pooled and permuted, so per-agent support/harm counts and the
trust trajectory can change. Unit A (``agent_round``) remains available as a
manipulation check. Both use the same deterministic SHA-256 counter-mode
Fisher-Yates scheme, non-identity fallback, and no-op record.
"""

from __future__ import annotations

from collections import Counter

import numpy as np
import pytest

from ..retrieval.verifier import CONTRADICTED, SUPPORTED, UNVERIFIABLE, Verdict
from ..trust import TrustConfig
from .interventions import (
    DEFAULT_PLACEBO_UNIT,
    GOLD_EVIDENCE_DATASETS,
    GOLD_SOURCE_ANSWER,
    GOLD_SOURCE_EVIDENCE,
    ORACLE_MODES,
    PLACEBO_MODES,
    PLACEBO_UNITS,
    PlaceboRecorder,
    check_oracle_records,
    check_placebo_records,
    gold_evidence_passages,
    oracle_correctness,
    oracle_trust,
    permutation_for_unit,
    placebo_permutation_hash,
    placebo_seed,
)


class ScriptedVerifier:
    """Two labels keyed by claim text so a permutation is observable."""

    name = "scripted"
    version = "1"

    def verdict(self, claim: str, passages: list[str]) -> Verdict:
        label = SUPPORTED if "one" in claim else CONTRADICTED
        return Verdict(label, [0.9], [f"p{i}" for i in range(len(passages))], self.name)


def _labels() -> list[str]:
    return [SUPPORTED, CONTRADICTED, UNVERIFIABLE]


def _records() -> list[dict]:
    return [
        {
            "agent": 0,
            "round": 2,
            "claim": f"claim {i}",
            "passages": [f"passage {i}"],
            "scores": [0.5],
            "evidence_ids": ["p0"],
            "verdict": label,
            "verifier": "scripted",
        }
        for i, label in enumerate(_labels())
    ]


def _skewed_labels() -> list[list[str]]:
    return [
        [SUPPORTED, SUPPORTED],
        [CONTRADICTED, CONTRADICTED],
        [UNVERIFIABLE, UNVERIFIABLE],
    ]


def _skewed_records() -> list[dict]:
    records = []
    for agent, labels in enumerate(_skewed_labels()):
        for index, label in enumerate(labels):
            records.append(
                {
                    "agent": agent,
                    "round": 2,
                    "claim": f"agent{agent}-claim{index}",
                    "passages": [f"passage-{agent}-{index}"],
                    "scores": [0.5],
                    "evidence_ids": ["p0"],
                    "verdict": label,
                    "verifier": "scripted",
                }
            )
    return records


def _flat(labels: list[list[str]]) -> list[str]:
    return [label for group in labels for label in group]


def _record_for(block: dict, unit: str | None = None) -> dict:
    return {
        "question_id": "q-1",
        "placebo_mode": "shuffle_verdicts",
        "placebo_unit": unit or block["unit"],
        "placebo_seed": block["seed"],
        "placebo_permutation_hash": block["permutation_hash"],
        "placebo_noop_reason": block["noop_reason"],
        "placebo": block,
    }


def test_modes_and_units_are_frozen() -> None:
    assert PLACEBO_MODES == ("off", "shuffle_verdicts")
    assert ORACLE_MODES == ("off", "gold_answer", "gold_evidence")
    assert PLACEBO_UNITS == ("agent_round", "round_pool")
    assert DEFAULT_PLACEBO_UNIT == "round_pool"
    assert GOLD_SOURCE_ANSWER == "question.answer"
    assert GOLD_SOURCE_EVIDENCE == "question.gold_evidence"
    assert "eg_sss_180" in GOLD_EVIDENCE_DATASETS


def test_placebo_seed_is_deterministic_and_seed_dependent() -> None:
    first = placebo_seed(1, "gpqa_main-0000")
    assert first == placebo_seed(1, "gpqa_main-0000")
    assert first != placebo_seed(2, "gpqa_main-0000")
    assert first != placebo_seed(1, "gpqa_main-0001")
    assert isinstance(first, int)


def test_permutation_is_deterministic_and_seed_dependent() -> None:
    first, reason, fallback = permutation_for_unit(
        4, seed=123, round_number=2, agent_index=0
    )
    same, _, _ = permutation_for_unit(4, seed=123, round_number=2, agent_index=0)
    other, _, _ = permutation_for_unit(4, seed=125, round_number=2, agent_index=0)

    assert reason is None
    assert isinstance(fallback, bool)
    assert first == same
    assert first != other
    assert sorted(first) == list(range(4))
    assert first != list(range(4)), "a permutation must change at least one position"


def test_permutation_noop_below_two_verdicts() -> None:
    for n in (0, 1):
        order, reason, fallback = permutation_for_unit(
            n, seed=7, round_number=2, agent_index=0
        )
        assert order == list(range(n))
        assert reason == "fewer_than_two_verdicts"
        assert fallback is False


def test_identity_draw_is_rotated_and_recorded() -> None:
    order, reason, fallback = permutation_for_unit(
        2, seed=1, round_number=2, agent_index=-1
    )
    assert order == [1, 0]
    assert reason is None
    assert fallback is True


def test_default_recorder_is_round_pool() -> None:
    recorder = PlaceboRecorder(run_seed=1, question_id="q-1")
    assert recorder.unit == DEFAULT_PLACEBO_UNIT == "round_pool"
    block = recorder.as_dict()
    assert block["unit"] == "round_pool"


def test_agent_round_recorder_changes_a_verdict_and_preserves_the_multiset() -> None:
    labels = _labels()
    records = _records()
    recorder = PlaceboRecorder(run_seed=1, question_id="q-1", unit="agent_round")

    shuffled, returned = recorder.apply_round([labels], records, round_number=2)

    assert returned is records
    assert sorted(shuffled[0]) == sorted(labels)
    assert shuffled[0] != labels
    assert [record["claim"] for record in records] == [f"claim {i}" for i in range(3)]
    assert [record["passages"] for record in records] == [
        [f"passage {i}"] for i in range(3)
    ]
    assert [record["scores"] for record in records] == [[0.5]] * 3
    assert [record["verdict"] for record in records] == shuffled[0]
    assert any(record["original_verdict"] != record["verdict"] for record in records)

    block = recorder.as_dict()
    assert block["mode"] == "shuffle_verdicts"
    assert block["unit"] == "agent_round"
    assert block["seed"] == placebo_seed(1, "q-1")
    assert block["noop_reason"] is None
    assert len(block["units"]) == 1
    unit = block["units"][0]
    assert unit["unit"] == "agent_round"
    assert unit["n"] == 3
    assert sorted(unit["order"]) == list(range(3))
    assert unit["order"] != list(range(3))
    assert unit["original"] == labels
    assert unit["shuffled"] == shuffled[0]
    assert [unit["original"][j] for j in unit["order"]] == unit["shuffled"]


def test_round_pool_changes_per_agent_counts_and_preserves_evidence() -> None:
    labels = _skewed_labels()
    records = _skewed_records()
    recorder = PlaceboRecorder(run_seed=1, question_id="round-pool-q")

    shuffled, returned = recorder.apply_round(labels, records, round_number=2)

    assert returned is records
    before = [Counter(group) for group in labels]
    after = [Counter(group) for group in shuffled]
    assert before != after
    assert sorted(_flat(shuffled)) == sorted(_flat(labels))
    assert [record["claim"] for record in records] == [
        f"agent{agent}-claim{index}"
        for agent in range(3)
        for index in range(2)
    ]
    assert [record["passages"] for record in records] == [
        [f"passage-{agent}-{index}"]
        for agent in range(3)
        for index in range(2)
    ]
    assert [record["verdict"] for record in records] == _flat(shuffled)
    assert any(record["original_verdict"] != record["verdict"] for record in records)

    block = recorder.as_dict()
    assert block["unit"] == "round_pool"
    assert block["noop_reason"] is None
    assert len(block["units"]) == 1
    unit = block["units"][0]
    assert unit["unit"] == "round_pool"
    assert unit["n"] == 6
    assert unit["pool_size"] == 6
    assert unit["agent_spans"] == [
        {"agent": 0, "start": 0, "stop": 2, "n": 2},
        {"agent": 1, "start": 2, "stop": 4, "n": 2},
        {"agent": 2, "start": 4, "stop": 6, "n": 2},
    ]
    assert unit["original"] == _flat(labels)
    assert unit["shuffled"] == _flat(shuffled)
    assert [unit["original"][j] for j in unit["order"]] == unit["shuffled"]


def test_round_pool_is_deterministic_and_seed_dependent() -> None:
    def order(seed: int) -> list[int]:
        recorder = PlaceboRecorder(run_seed=seed, question_id="round-pool-q")
        recorder.apply_round(_skewed_labels(), [], round_number=2)
        return recorder.units[0]["order"]

    assert order(1) == order(1)
    assert order(1) != order(2)


def test_placebo_permutation_hash_is_reproducible() -> None:
    def run(seed: int, unit: str = "round_pool") -> dict:
        recorder = PlaceboRecorder(run_seed=seed, question_id="q-1", unit=unit)
        recorder.apply_round([_labels()], _records(), round_number=2)
        recorder.apply_round([_labels()], _records(), round_number=3)
        return recorder.as_dict()

    first = run(1)
    same = run(1)
    other = run(2)
    assert first["permutation_hash"] == same["permutation_hash"]
    assert first["permutation_hash"] != other["permutation_hash"]
    assert len(first["permutation_hash"]) == 64
    assert first["permutation_hash"] == placebo_permutation_hash(
        first["seed"], first["units"]
    )
    assert run(1, "agent_round")["permutation_hash"] != first["permutation_hash"]


def test_agent_round_noop_path_records_the_reason() -> None:
    recorder = PlaceboRecorder(run_seed=3, question_id="q-2", unit="agent_round")
    shuffled, _ = recorder.apply_round([[SUPPORTED]], [], round_number=2)
    block = recorder.as_dict()

    assert shuffled == [[SUPPORTED]]
    assert block["units"] == []
    assert block["noop_reason"] == "fewer_than_two_verdicts"
    assert block["noop_units"] == [
        {
            "unit": "agent_round",
            "round": 2,
            "agent": 0,
            "n": 1,
            "reason": "fewer_than_two_verdicts",
        }
    ]
    assert len(block["permutation_hash"]) == 64


def test_round_pool_noop_path_records_the_reason() -> None:
    recorder = PlaceboRecorder(run_seed=3, question_id="q-2")
    shuffled, _ = recorder.apply_round([[SUPPORTED]], [], round_number=2)
    block = recorder.as_dict()

    assert shuffled == [[SUPPORTED]]
    assert block["unit"] == "round_pool"
    assert block["units"] == []
    assert block["noop_reason"] == "fewer_than_two_verdicts"
    assert block["noop_units"] == [
        {
            "unit": "round_pool",
            "round": 2,
            "agent": None,
            "n": 1,
            "pool_size": 1,
            "reason": "fewer_than_two_verdicts",
        }
    ]
    assert len(block["permutation_hash"]) == 64


def test_agent_round_recorder_preserves_per_agent_counts() -> None:
    """Unit A changes the claim->verdict mapping, not an agent's verdict counts."""

    recorder = PlaceboRecorder(run_seed=4, question_id="q-3", unit="agent_round")
    labels = [SUPPORTED, CONTRADICTED, SUPPORTED]
    shuffled, _ = recorder.apply_round([labels], [], round_number=2)

    assert sorted(shuffled[0]) == sorted(labels)
    assert shuffled[0].count(SUPPORTED) == labels.count(SUPPORTED)
    assert shuffled[0].count(CONTRADICTED) == labels.count(CONTRADICTED)


def test_placebo_checks_accept_round_pool_and_agent_round_records() -> None:
    for unit in PLACEBO_UNITS:
        recorder = PlaceboRecorder(run_seed=1, question_id="q-1", unit=unit)
        recorder.apply_round(_skewed_labels(), _skewed_records(), round_number=2)
        block = recorder.as_dict()
        assert check_placebo_records([_record_for(block)]) == []


def test_placebo_checks_accept_an_explicit_no_round_reason() -> None:
    block = PlaceboRecorder(run_seed=1, question_id="q-1").as_dict()
    assert block["noop_reason"] == "no_verdict_units"
    assert check_placebo_records([_record_for(block)]) == []


def test_placebo_checks_reject_an_identity_permutation() -> None:
    recorder = PlaceboRecorder(run_seed=1, question_id="q-1")
    recorder.apply_round(_skewed_labels(), _skewed_records(), round_number=2)
    block = recorder.as_dict()
    block["units"][0]["order"] = list(range(block["units"][0]["n"]))
    failures = check_placebo_records([_record_for(block)])
    assert any("identity" in failure.lower() for failure in failures)


def test_placebo_checks_reject_round_pool_span_mismatch() -> None:
    recorder = PlaceboRecorder(run_seed=1, question_id="q-1")
    recorder.apply_round(_skewed_labels(), _skewed_records(), round_number=2)
    block = recorder.as_dict()
    block["units"][0]["agent_spans"] = [{"agent": 0, "start": 0, "stop": 5, "n": 5}]
    failures = check_placebo_records([_record_for(block)])
    assert any("agent_spans" in failure for failure in failures)


def test_oracle_trust_rewards_the_correct_minority() -> None:
    trust = oracle_trust(
        ["Answer: alpha", "Answer: beta", "Answer: beta"],
        "alpha",
        ["alpha", "beta", "gamma"],
        TrustConfig(),
    )

    assert trust.sum() == pytest.approx(1.0, abs=1e-9)
    assert trust[0] == pytest.approx(0.8, abs=1e-9)
    assert trust[1] == pytest.approx(0.1, abs=1e-9)
    assert trust[2] == pytest.approx(0.1, abs=1e-9)


def test_oracle_trust_is_uniform_when_all_agents_agree() -> None:
    config = TrustConfig()
    all_correct = oracle_trust(
        ["alpha", "alpha", "alpha"], "alpha", ["alpha", "beta", "gamma"], config
    )
    all_wrong = oracle_trust(
        ["beta", "beta", "beta"], "alpha", ["alpha", "beta", "gamma"], config
    )
    assert np.allclose(all_correct, np.full(3, 1 / 3))
    assert np.allclose(all_wrong, np.full(3, 1 / 3))


def test_oracle_correctness_parses_positions() -> None:
    assert oracle_correctness(
        ["Answer: alpha", "Answer: beta"], "alpha", ["alpha", "beta"]
    ) == [True, False]


def test_gold_evidence_passages_accept_list_and_agent_map() -> None:
    assert gold_evidence_passages(["e1", "e2"], 0) == ["e1", "e2"]
    assert gold_evidence_passages({"0": ["agent0"], 1: ["agent1"]}, 1) == ["agent1"]
    assert gold_evidence_passages(None, 0) == []
    assert gold_evidence_passages("single", 2) == ["single"]


def test_oracle_checks_require_fields_and_a_trajectory() -> None:
    valid = {
        "question_id": "q-1",
        "oracle_mode": "gold_answer",
        "oracle_gold_source": GOLD_SOURCE_ANSWER,
        "oracle_rounds_applied": [2, 3],
        "trust_trajectory": [[0.333, 0.333, 0.334], [0.8, 0.1, 0.1]],
        "oracle": {
            "mode": "gold_answer",
            "gold_source": GOLD_SOURCE_ANSWER,
            "rounds_applied": [2, 3],
            "schedule": "every_round",
        },
    }
    assert check_oracle_records([valid]) == []

    missing = dict(valid, trust_trajectory=None)
    failures = check_oracle_records([missing])
    assert any("trust_trajectory" in failure for failure in failures)

    wrong = dict(valid, oracle_gold_source="")
    failures = check_oracle_records([wrong])
    assert any("gold_source" in failure for failure in failures)
