"""Every runner arm must produce one resumable record without a GPU."""

from __future__ import annotations

import pytest

from .retrieval.pipeline import StaticRetriever
from .runner import RunConfig, read_records, records_path, run

QUESTION = {
    "question": "Which option is supported?",
    "answer": "beta",
    "options": ["alpha", "beta", "gamma"],
    "verdicts": [{"support": 0, "harm": 2}, {"support": 2, "harm": 0}, {"support": 2, "harm": 0}],
}


class FakeClient:
    def __init__(self, answer: str = "beta") -> None:
        self.answer = answer

    def complete(self, system: str, user: str) -> str:
        return f'Answer: {self.answer}\n<claim id="c1">evidence supports {self.answer}</claim>\nCONFIDENCE: 0.4'


class FakeOracle:
    model = "fake-oracle"

    def answer(self, question: str) -> str:
        return "Answer: beta"


ARMS = ["B1", "B2", "B3", "B4", "B5", "B6", "B8", "B9", "B10", "pilot", "injection"]


@pytest.mark.parametrize("arm", ARMS)
def test_arm_produces_record(tmp_path, monkeypatch, arm) -> None:
    monkeypatch.setattr(
        "trustcal.runner._retriever",
        lambda cfg, partition=None: StaticRetriever(fallback=["Evidence supports B."]),
    )
    cfg = RunConfig(
        arm=arm,
        dataset="local",
        limit=1,
        seed=1,
        out_root=tmp_path,
        rounds=2,
        samples=3,
        layers=2,
    )
    clients = [FakeClient("beta"), FakeClient("beta"), FakeClient("alpha")]
    summary = run(cfg, clients=clients, questions=[QUESTION])

    records = read_records(records_path(cfg))
    assert len(records) == 1
    assert records[0]["rounds"]
    assert summary.n_debates == 1
    if arm == "pilot":
        assert "pilot" in records[0]
        assert records[0]["pilot"]["changed"] in (True, False)


def test_b7_oracle_record(tmp_path) -> None:
    cfg = RunConfig(arm="B7", dataset="local", limit=1, seed=1, out_root=tmp_path, rounds=1)
    summary = run(cfg, questions=[QUESTION], oracle=FakeOracle())
    record = read_records(records_path(cfg))[0]
    assert record["oracle"]["model"] == "fake-oracle"
    assert summary.n_debates == 1


def test_b7_oracle_metadata_is_recorded(tmp_path) -> None:
    class MetadataOracle:
        model = "fake-oracle"
        last_metadata = {"provider": "fake", "response_id": "resp_1"}

        def answer(self, question: str) -> str:
            return "Answer: beta"

    cfg = RunConfig(arm="B7", dataset="local", limit=1, seed=1, out_root=tmp_path, rounds=1)
    summary = run(cfg, questions=[QUESTION], oracle=MetadataOracle())
    record = read_records(records_path(cfg))[0]
    assert record["oracle"]["model"] == "fake-oracle"
    assert record["oracle"]["provider"] == "fake"
    assert record["oracle"]["response_id"] == "resp_1"
    assert summary.n_debates == 1


def test_agent_scaling_cycles_clients(tmp_path) -> None:
    cfg = RunConfig(arm="B3", dataset="local", limit=1, seed=1, out_root=tmp_path, rounds=2, agents=5)
    clients = [FakeClient("alpha"), FakeClient("beta"), FakeClient("gamma")]
    run(cfg, clients=clients, questions=[QUESTION])
    record = read_records(records_path(cfg))[0]
    assert len(record["rounds"][0]["answers"]) == 5


def test_resume_skips_completed(tmp_path, monkeypatch) -> None:
    monkeypatch.setattr(
        "trustcal.runner._retriever",
        lambda cfg, partition=None: StaticRetriever(fallback=["evidence"]),
    )
    cfg = RunConfig(arm="B3", dataset="local", limit=1, seed=1, out_root=tmp_path, rounds=2)
    clients = [FakeClient("beta"), FakeClient("beta"), FakeClient("alpha")]
    run(cfg, clients=clients, questions=[QUESTION])
    run(cfg, clients=clients, questions=[QUESTION])
    assert len(read_records(records_path(cfg))) == 1
