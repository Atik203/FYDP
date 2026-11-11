"""Runner wiring for the six-arm Full target (WP-18).

Covers RunConfig validation, the record fields required before a Full run, and
the resume rule that a changed placebo/oracle mode is a new run, not a
continuation.
"""

from __future__ import annotations

import json

import pytest

from .eval.records import validate_record
from .manifest import ManifestMismatch
from .orchestrator.interventions import (
    DEFAULT_PLACEBO_UNIT,
    GOLD_SOURCE_ANSWER,
    GOLD_SOURCE_EVIDENCE,
    PLACEBO_UNITS,
    check_oracle_records,
    check_placebo_records,
)
from .retrieval.pipeline import StaticRetriever
from .retrieval.verifier import CONTRADICTED, SUPPORTED, Verdict
from .runner import RunConfig, read_records, records_path, run, run_dir

OPTIONS = ["alpha", "beta", "gamma"]
QUESTION = {"question": "Which option is supported?", "answer": "alpha", "options": OPTIONS}
TWO_CLAIM_ALPHA = (
    'Answer: alpha\n<claim id="c1">alpha one</claim>\n<claim id="c2">alpha two</claim>'
)
TWO_CLAIM_BETA = (
    'Answer: beta\n<claim id="c1">beta one</claim>\n<claim id="c2">beta two</claim>'
)
GOLD_EVIDENCE = ["alpha reduces risk in the randomized trial"]


class FakeClient:
    def __init__(self, text: str) -> None:
        self.text = text

    def complete(self, system: str, user: str) -> str:
        return self.text


class TwoClaimVerifier:
    name = "scripted"
    version = "1"

    def verdict(self, claim: str, passages: list[str]) -> Verdict:
        label = SUPPORTED if "one" in claim else CONTRADICTED
        return Verdict(label, [0.9], [f"p{i}" for i in range(len(passages))], self.name)


class RaisingRetriever:
    def retrieve(self, *args, **kwargs):  # pragma: no cover - must not run
        raise AssertionError("gold-evidence mode must not call the retriever")


def _cfg(tmp_path, **kwargs) -> RunConfig:
    values = {
        "arm": "B8",
        "dataset": "local",
        "limit": 1,
        "seed": 1,
        "out_root": tmp_path,
        "rounds": 2,
    }
    values.update(kwargs)
    return RunConfig(**values)


def _static_retriever(cfg, partition=None):
    return StaticRetriever(fallback=["a supporting or contradicting passage"])


def test_run_config_defaults_are_off() -> None:
    cfg = RunConfig(arm="B8")
    assert cfg.placebo_mode == "off"
    assert cfg.oracle_mode == "off"
    assert cfg.placebo_unit == DEFAULT_PLACEBO_UNIT == "round_pool"


@pytest.mark.parametrize(
    ("kwargs", "match"),
    [
        ({"arm": "B3", "placebo_mode": "shuffle_verdicts"}, "arm 'B8'"),
        ({"arm": "B8", "use_trust": False, "placebo_mode": "shuffle_verdicts"}, "use_trust"),
        ({"arm": "B3", "oracle_mode": "gold_answer"}, "arm 'B8'"),
        ({"arm": "B8", "use_trust": False, "oracle_mode": "gold_answer"}, "use_trust"),
        ({"arm": "B8", "placebo_mode": "shuffle_verdicts", "oracle_mode": "gold_answer"}, "mutually exclusive"),
        ({"arm": "B8", "placebo_mode": "not_a_mode"}, "placebo_mode"),
        ({"arm": "B8", "oracle_mode": "not_a_mode"}, "oracle_mode"),
        ({"arm": "B8", "placebo_unit": "not_a_unit"}, "placebo_unit"),
        ({"arm": "B8", "placebo_unit": "agent_round"}, "placebo_unit"),
        ({"arm": "B8", "dataset": "gpqa_main", "oracle_mode": "gold_evidence"}, "gold_evidence"),
    ],
)
def test_invalid_arm_and_flag_combinations_fail(kwargs, match) -> None:
    with pytest.raises(ValueError, match=match):
        RunConfig(**kwargs)


def test_placebo_units_are_both_accepted_with_placebo_mode() -> None:
    for unit in PLACEBO_UNITS:
        cfg = RunConfig(
            arm="B8", placebo_mode="shuffle_verdicts", placebo_unit=unit
        )
        assert cfg.placebo_unit == unit


def test_gold_evidence_accepts_the_sciclaim_key() -> None:
    cfg = RunConfig(arm="B8", dataset="sciclaim_180", oracle_mode="gold_evidence")
    assert cfg.oracle_mode == "gold_evidence"


def test_every_record_carries_the_two_mode_fields(tmp_path) -> None:
    cfg = _cfg(tmp_path, arm="B1")
    run(cfg, clients=[FakeClient("Answer: alpha")], questions=[QUESTION])
    record = read_records(records_path(cfg))[0]
    assert record["placebo_mode"] == "off"
    assert record["oracle_mode"] == "off"
    assert record["placebo_unit"] == DEFAULT_PLACEBO_UNIT


def test_b8_placebo_record_fields_and_checks(tmp_path, monkeypatch) -> None:
    monkeypatch.setattr("trustcal.runner._retriever", _static_retriever)
    monkeypatch.setattr(
        "trustcal.runner.build_verifier", lambda name, **kwargs: TwoClaimVerifier()
    )
    cfg = _cfg(tmp_path, placebo_mode="shuffle_verdicts")
    clients = [
        FakeClient(TWO_CLAIM_ALPHA),
        FakeClient(TWO_CLAIM_BETA),
        FakeClient(TWO_CLAIM_BETA),
    ]
    run(cfg, clients=clients, questions=[QUESTION])
    record = read_records(records_path(cfg))[0]

    assert validate_record(record) == []
    assert record["placebo_mode"] == "shuffle_verdicts"
    assert record["oracle_mode"] == "off"
    assert record["placebo_unit"] == "round_pool"
    assert isinstance(record["placebo_seed"], int)
    assert len(record["placebo_permutation_hash"]) == 64
    assert record["placebo_noop_reason"] is None
    assert record["placebo"]["units"]
    assert record["placebo"]["units"][0]["pool_size"] == 6
    assert any(
        entry.get("original_verdict") != entry["verdict"] for entry in record["verdicts"]
    )
    assert check_placebo_records([record]) == []


def test_b8_agent_round_placebo_record_is_supported(tmp_path, monkeypatch) -> None:
    monkeypatch.setattr("trustcal.runner._retriever", _static_retriever)
    monkeypatch.setattr(
        "trustcal.runner.build_verifier", lambda name, **kwargs: TwoClaimVerifier()
    )
    cfg = _cfg(
        tmp_path,
        placebo_mode="shuffle_verdicts",
        placebo_unit="agent_round",
    )
    clients = [
        FakeClient(TWO_CLAIM_ALPHA),
        FakeClient(TWO_CLAIM_BETA),
        FakeClient(TWO_CLAIM_BETA),
    ]
    run(cfg, clients=clients, questions=[QUESTION])
    record = read_records(records_path(cfg))[0]

    assert record["placebo_unit"] == "agent_round"
    assert record["placebo"]["units"][0]["unit"] == "agent_round"
    assert check_placebo_records([record]) == []


def test_b8_agent_round_placebo_noop_record_carries_the_reason(
    tmp_path, monkeypatch
) -> None:
    monkeypatch.setattr("trustcal.runner._retriever", _static_retriever)
    monkeypatch.setattr(
        "trustcal.runner.build_verifier", lambda name, **kwargs: TwoClaimVerifier()
    )
    cfg = _cfg(
        tmp_path,
        placebo_mode="shuffle_verdicts",
        placebo_unit="agent_round",
    )
    clients = [
        FakeClient('Answer: alpha\n<claim id="c1">alpha one</claim>'),
        FakeClient('Answer: beta\n<claim id="c1">beta one</claim>'),
        FakeClient('Answer: beta\n<claim id="c1">beta one</claim>'),
    ]
    run(cfg, clients=clients, questions=[QUESTION])
    record = read_records(records_path(cfg))[0]
    assert record["placebo_noop_reason"] == "fewer_than_two_verdicts"
    assert record["placebo"]["units"] == []
    assert record["placebo"]["noop_units"]
    assert check_placebo_records([record]) == []


def test_b8_round_pool_noop_with_one_agent(tmp_path, monkeypatch) -> None:
    monkeypatch.setattr("trustcal.runner._retriever", _static_retriever)
    monkeypatch.setattr(
        "trustcal.runner.build_verifier", lambda name, **kwargs: TwoClaimVerifier()
    )
    cfg = _cfg(
        tmp_path,
        agents=1,
        placebo_mode="shuffle_verdicts",
        placebo_unit="round_pool",
    )
    run(
        cfg,
        clients=[FakeClient('Answer: alpha\n<claim id="c1">alpha one</claim>')],
        questions=[QUESTION],
    )
    record = read_records(records_path(cfg))[0]
    assert record["placebo_unit"] == "round_pool"
    assert record["placebo_noop_reason"] == "fewer_than_two_verdicts"
    assert record["placebo"]["units"] == []
    assert record["placebo"]["noop_units"][0]["unit"] == "round_pool"
    assert check_placebo_records([record]) == []


def test_b8_oracle_gold_answer_record_fields(tmp_path, monkeypatch) -> None:
    monkeypatch.setattr("trustcal.runner._retriever", _static_retriever)
    cfg = _cfg(tmp_path, oracle_mode="gold_answer")
    clients = [
        FakeClient("Answer: alpha"),
        FakeClient("Answer: beta"),
        FakeClient("Answer: beta"),
    ]
    run(cfg, clients=clients, questions=[QUESTION])
    record = read_records(records_path(cfg))[0]

    assert validate_record(record) == []
    assert record["oracle_mode"] == "gold_answer"
    assert record["oracle_gold_source"] == GOLD_SOURCE_ANSWER
    assert record["oracle_rounds_applied"] == [2, 3]
    assert record["trust_trajectory"] is not None
    assert record["trust_for_positions"] == pytest.approx([0.8, 0.1, 0.1], abs=1e-9)
    assert record["final_answer_source"] == "weighted"
    assert record["final_answer_correct"] is True
    assert record["placebo_mode"] == "off"
    assert check_oracle_records([record]) == []


def test_b8_oracle_gold_evidence_record_fields(tmp_path, monkeypatch) -> None:
    monkeypatch.setattr("trustcal.runner._retriever", lambda cfg, partition=None: RaisingRetriever())
    monkeypatch.setattr(
        "trustcal.runner.build_verifier", lambda name, **kwargs: TwoClaimVerifier()
    )
    cfg = _cfg(tmp_path, dataset="sciclaim_180", oracle_mode="gold_evidence")
    question = {**QUESTION, "gold_evidence": GOLD_EVIDENCE}
    clients = [
        FakeClient(TWO_CLAIM_ALPHA),
        FakeClient(TWO_CLAIM_BETA),
        FakeClient(TWO_CLAIM_BETA),
    ]
    run(cfg, clients=clients, questions=[question])
    record = read_records(records_path(cfg))[0]

    assert validate_record(record) == []
    assert record["oracle_mode"] == "gold_evidence"
    assert record["oracle_gold_source"] == GOLD_SOURCE_EVIDENCE
    assert record["oracle_rounds_applied"] == [2, 3]
    assert record["trust_trajectory"] is not None
    assert record["evidence_introduced"] is True
    assert record["evidence"], "gold evidence must be recorded"
    for entry in record["evidence"]:
        for passages in entry["passages"]:
            assert passages == GOLD_EVIDENCE
    assert record["placebo_mode"] == "off"
    assert check_oracle_records([record]) == []


def test_manifest_records_the_modes_and_resume_refuses_a_change(tmp_path, monkeypatch) -> None:
    monkeypatch.setattr("trustcal.runner._retriever", _static_retriever)
    monkeypatch.setattr(
        "trustcal.runner.build_verifier", lambda name, **kwargs: TwoClaimVerifier()
    )
    clients = [
        FakeClient(TWO_CLAIM_ALPHA),
        FakeClient(TWO_CLAIM_BETA),
        FakeClient(TWO_CLAIM_BETA),
    ]
    cfg = _cfg(tmp_path, placebo_mode="shuffle_verdicts")
    run(cfg, clients=clients, questions=[QUESTION])

    manifest = json.loads(
        (run_dir(cfg) / "run_manifest.json").read_text(encoding="utf-8")
    )
    assert manifest["run_config"]["placebo_mode"] == "shuffle_verdicts"
    assert manifest["run_config"]["placebo_unit"] == "round_pool"
    assert manifest["run_config"]["oracle_mode"] == "off"

    changed = _cfg(tmp_path, placebo_mode="off")
    with pytest.raises(ManifestMismatch, match="run_config"):
        run(changed, clients=clients, questions=[QUESTION])


def test_manifest_refuses_a_changed_placebo_unit(tmp_path, monkeypatch) -> None:
    monkeypatch.setattr("trustcal.runner._retriever", _static_retriever)
    monkeypatch.setattr(
        "trustcal.runner.build_verifier", lambda name, **kwargs: TwoClaimVerifier()
    )
    clients = [
        FakeClient(TWO_CLAIM_ALPHA),
        FakeClient(TWO_CLAIM_BETA),
        FakeClient(TWO_CLAIM_BETA),
    ]
    cfg = _cfg(tmp_path, placebo_mode="shuffle_verdicts")
    run(cfg, clients=clients, questions=[QUESTION])

    changed = _cfg(
        tmp_path,
        placebo_mode="shuffle_verdicts",
        placebo_unit="agent_round",
    )
    with pytest.raises(ManifestMismatch, match="run_config"):
        run(changed, clients=clients, questions=[QUESTION])


def test_manifest_refuses_a_changed_oracle_mode(tmp_path, monkeypatch) -> None:
    monkeypatch.setattr("trustcal.runner._retriever", _static_retriever)
    clients = [
        FakeClient("Answer: alpha"),
        FakeClient("Answer: beta"),
        FakeClient("Answer: beta"),
    ]
    cfg = _cfg(tmp_path, oracle_mode="gold_answer")
    run(cfg, clients=clients, questions=[QUESTION])

    manifest = json.loads(
        (run_dir(cfg) / "run_manifest.json").read_text(encoding="utf-8")
    )
    assert manifest["run_config"]["oracle_mode"] == "gold_answer"

    changed = _cfg(tmp_path, oracle_mode="off")
    with pytest.raises(ManifestMismatch, match="run_config"):
        run(changed, clients=clients, questions=[QUESTION])
