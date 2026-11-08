"""Wave-2 runner wiring: manifest, schema validation, accuracy, provenance."""

from __future__ import annotations

import json

import pytest

from .eval.datasets import write_eligible_n
from .eval.answers import same_answer
from .eval.records import validate_record
from .manifest import ManifestMismatch, manifest_hash
from .runner import (
    RunConfig,
    _write_routes,
    read_records,
    records_path,
    run,
    run_dir,
)

FREE_TEXT = {"question": "What is six times seven?", "answer": "42"}
OPTIONS = ["alpha", "beta", "gamma"]
MCQ = {"question": "Which option is supported?", "answer": "beta", "options": OPTIONS}


class FakeClient:
    def __init__(self, answer: str = "42") -> None:
        self.answer = answer

    def complete(self, system: str, user: str) -> str:
        return f'Answer: {self.answer}\n<claim id="c1">The evidence supports this option.</claim>'


class RouteRetriever:
    """Duck-typed retriever: one route decision and one passage per claim."""

    def __init__(self) -> None:
        self.routes = [
            {"claim": "Which option is supported?", "domain": "other", "sources": ["semantic_scholar"]}
        ]
        self.errors: list[str] = []

    def retrieve(self, agent_index: int, claim: str, round_number: int = 1) -> list[str]:
        return ["Evidence passage supports one of the options."]


def _cfg(tmp_path, arm: str = "B1", dataset: str = "local", **kwargs) -> RunConfig:
    return RunConfig(arm=arm, dataset=dataset, limit=1, seed=3, out_root=tmp_path, **kwargs)


def _manifest_payload(cfg: RunConfig) -> dict:
    return json.loads((run_dir(cfg) / "run_manifest.json").read_text(encoding="utf-8"))


def test_b1_stamps_final_answer_and_manifest(tmp_path) -> None:
    cfg = _cfg(tmp_path)
    run(cfg, clients=[FakeClient("42")], questions=[FREE_TEXT])
    record = read_records(records_path(cfg))[0]

    assert validate_record(record) == []
    assert record["final_answer"] == "42"
    assert record["final_answer_correct"] is True
    assert record["final_answer_source"] == "single"
    assert record["manifest_hash"] == manifest_hash(_manifest_payload(cfg))
    assert record["manifest_hash"]


def test_b1_scores_a_wrong_final_answer(tmp_path) -> None:
    cfg = _cfg(tmp_path)
    run(cfg, clients=[FakeClient("41")], questions=[FREE_TEXT])
    record = read_records(records_path(cfg))[0]
    assert record["final_answer"] == "41"
    assert record["final_answer_correct"] is False


def test_b3_final_answer_is_the_aggregation_output(tmp_path) -> None:
    cfg = _cfg(tmp_path, arm="B3", rounds=2)
    clients = [FakeClient("beta") for _ in range(3)]
    run(cfg, clients=clients, questions=[MCQ])
    record = read_records(records_path(cfg))[0]

    assert validate_record(record) == []
    assert record["final_answer_source"] == "majority"
    assert record["aggregation"]["majority"] == "beta"
    assert same_answer(record["final_answer"], "beta", record["options"])
    assert record["final_answer_correct"] is True
    assert record["evidence_introduced"] is False


def test_b8_weighted_aggregation_and_routes(tmp_path, monkeypatch) -> None:
    monkeypatch.setattr(
        "trustcal.runner._retriever",
        lambda cfg, partition=None: RouteRetriever(),
    )
    cfg = _cfg(tmp_path, arm="B8", rounds=2)
    clients = [FakeClient("alpha"), FakeClient("alpha"), FakeClient("beta")]
    run(cfg, clients=clients, questions=[MCQ])
    record = read_records(records_path(cfg))[0]

    assert validate_record(record) == []
    assert record["trust_trajectory"] is not None
    assert record["trust_for_positions"] is not None
    assert sum(record["trust_for_positions"]) == pytest.approx(1.0, abs=1e-9)
    assert record["final_answer_source"] == "weighted"
    assert same_answer(record["final_answer"], record["aggregation"]["weighted"], record["options"])
    assert record["evidence_introduced"] is True

    routes = json.loads((run_dir(cfg) / "routes.json").read_text(encoding="utf-8"))
    assert routes["n_routes"] == 1
    assert routes["routes"][0]["claim"] == "Which option is supported?"


def test_b8_injection_uses_retriever_and_trust(tmp_path, monkeypatch) -> None:
    monkeypatch.setattr(
        "trustcal.runner._retriever",
        lambda cfg, partition=None: RouteRetriever(),
    )
    cfg = _cfg(tmp_path, arm="B8", rounds=3, inject=True, use_trust=True)
    clients = [FakeClient("alpha"), FakeClient("beta"), FakeClient("beta")]
    run(cfg, clients=clients, questions=[MCQ])
    record = read_records(records_path(cfg))[0]

    assert validate_record(record) == []
    assert record["injection"]["consensus"]
    assert record["injection"]["targets"] == [0]
    assert record["injection"]["delivered"] is True
    assert record["injection"]["consensus_source"] == "panel"
    assert record["trust_trajectory"]
    assert record["trust_for_positions"] is not None
    assert record["evidence"]
    assert record["evidence_introduced"] is True
    assert record["final_answer_source"] == "weighted"


def test_b3_injection_has_no_trust_update(tmp_path) -> None:
    cfg = _cfg(tmp_path, arm="B3", rounds=2, inject=True)
    clients = [FakeClient("alpha"), FakeClient("beta"), FakeClient("beta")]
    run(cfg, clients=clients, questions=[MCQ])
    record = read_records(records_path(cfg))[0]

    assert validate_record(record) == []
    assert record["injection"]["consensus"]
    assert record["injection"]["delivered"] is True
    assert record["trust_trajectory"] is None
    assert record["trust_for_positions"] is None
    assert record["evidence_introduced"] is False
    assert record["final_answer_source"] == "majority"


def test_inject_rejected_for_arms_without_a_debate_hook(tmp_path) -> None:
    cfg = _cfg(tmp_path, arm="B2", inject=True)
    with pytest.raises(ValueError, match="inject=True is wired"):
        run(cfg, clients=[FakeClient("42")], questions=[FREE_TEXT])


def test_b8_without_trust_updates_reports_majority(tmp_path, monkeypatch) -> None:
    monkeypatch.setattr(
        "trustcal.runner._retriever",
        lambda cfg, partition=None: RouteRetriever(),
    )
    cfg = _cfg(tmp_path, arm="B8", rounds=2, adaptive_triggering=False, use_trust=False)
    clients = [FakeClient("beta") for _ in range(3)]
    run(cfg, clients=clients, questions=[MCQ])
    record = read_records(records_path(cfg))[0]
    assert record["trust_trajectory"] is None
    assert record["final_answer_source"] == "majority"


def test_resume_refuses_a_changed_alpha(tmp_path) -> None:
    cfg = _cfg(tmp_path, alpha=0.5)
    run(cfg, clients=[FakeClient("42")], questions=[FREE_TEXT])

    changed = _cfg(tmp_path, alpha=0.6)
    with pytest.raises(ManifestMismatch, match="run_config"):
        run(changed, clients=[FakeClient("42")], questions=[FREE_TEXT])


def test_resume_refuses_records_from_another_manifest(tmp_path) -> None:
    cfg = _cfg(tmp_path)
    run(cfg, clients=[FakeClient("42")], questions=[FREE_TEXT])

    path = records_path(cfg)
    record = json.loads(path.read_text(encoding="utf-8").splitlines()[0])
    record["manifest_hash"] = "0" * 64
    path.write_text(json.dumps(record) + "\n", encoding="utf-8")

    with pytest.raises(ManifestMismatch, match="different manifest"):
        run(cfg, clients=[FakeClient("42")], questions=[FREE_TEXT])


def test_loader_receives_the_eligible_path(tmp_path, monkeypatch) -> None:
    seen: dict = {}

    def fake_load(name, sample_cap=None, eligible_path=None, **kwargs):
        seen["name"] = name
        seen["path"] = eligible_path
        rows = [FREE_TEXT][:sample_cap]
        write_eligible_n(
            rows,
            eligible_path,
            dataset=name,
            requested=sample_cap,
            available=len(rows),
            seed=1,
        )
        return rows

    monkeypatch.setattr("trustcal.runner.load_dataset", fake_load)
    cfg = _cfg(tmp_path, dataset="gpqa")
    run(cfg, clients=[FakeClient("42")])

    expected = run_dir(cfg) / "eligible_n.json"
    assert seen["path"] == expected
    payload = json.loads(expected.read_text(encoding="utf-8"))
    assert payload["dataset"] == "gpqa"
    assert payload["n_eligible"] == 1


def test_explicit_questions_persist_eligible_n(tmp_path) -> None:
    cfg = _cfg(tmp_path)
    run(cfg, clients=[FakeClient("42")], questions=[FREE_TEXT])
    payload = json.loads((run_dir(cfg) / "eligible_n.json").read_text(encoding="utf-8"))
    assert payload["n_eligible"] == 1
    assert payload["source"] == "in_memory"


def test_summary_has_accuracy_and_manifest(tmp_path) -> None:
    cfg = _cfg(tmp_path)
    run(cfg, clients=[FakeClient("42")], questions=[FREE_TEXT])
    payload = json.loads((run_dir(cfg) / "summary.json").read_text(encoding="utf-8"))
    record = read_records(records_path(cfg))[0]

    assert payload["accuracy"] == 1.0
    assert payload["n_correct"] == 1
    assert payload["n_scored"] == 1
    assert payload["ccr"] == 0.0  # legacy fields kept
    assert payload["manifest_hash"] == record["manifest_hash"]
    assert payload["manifest"] == str(run_dir(cfg) / "run_manifest.json")
    assert (run_dir(cfg) / "summary.json").is_file()


def test_invalid_record_is_never_appended(tmp_path) -> None:
    cfg = _cfg(tmp_path)
    question = {"question": "Broken item?", "answer": ""}
    with pytest.raises(ValueError, match="invalid schema-v2 record"):
        run(cfg, clients=[FakeClient("42")], questions=[question])
    assert not records_path(cfg).exists()


def test_injection_record_defaults_delivered_and_source(tmp_path) -> None:
    cfg = _cfg(tmp_path, arm="injection", rounds=2)
    clients = [FakeClient("beta"), FakeClient("beta"), FakeClient("alpha")]
    run(cfg, clients=clients, questions=[MCQ])
    record = read_records(records_path(cfg))[0]

    assert validate_record(record) == []
    assert record["injection"]["eligible"] is True
    assert record["injection"]["delivered"] is True
    assert record["injection"]["consensus_source"] == "panel"
    assert record["targets"] == [2]


def test_routes_sidecar_skips_arms_without_retrieval(tmp_path) -> None:
    cfg = _cfg(tmp_path, arm="B3", rounds=2)
    run(cfg, clients=[FakeClient("beta") for _ in range(3)], questions=[MCQ])
    assert not (run_dir(cfg) / "routes.json").exists()
    _write_routes(cfg, None)  # must be a no-op, not an error
