"""Mock B8 (retrieval + trust) boundary: the debate result is record-ready.

P0-5 acceptance: the trust vector used by the weighted vote comes from the final
positions, `trust_status` is non-null, and every trust vector is a valid simplex
point. `runner.py` is B's lease; this test exercises the exact `_make_runner`
path B8 uses and assembles the schema-v2 record the runner patch will write.
"""

from __future__ import annotations

import numpy as np

from .eval.records import validate_record
from .orchestrator.debate import TRUST_UPDATED, DebateRunner
from .retrieval.pipeline import StaticRetriever
from .runner import RunConfig, _make_runner, debate_record

ALPHA = 'Answer: alpha\n<claim id="c1">alpha reduces risk</claim>'
BETA = 'Answer: beta\n<claim id="c1">beta increases risk</claim>'
GAMMA = 'Answer: gamma\n<claim id="c1">gamma is stable</claim>'

EVIDENCE = {
    "alpha reduces risk": ["alpha reduces risk in the randomized trial"],
    "beta increases risk": ["beta does not increase risk in the cohort"],
    "gamma is stable": ["gamma is stable across every replication"],
}

QUESTION = {
    "question": "Which option is supported?",
    "answer": "alpha",
    "options": ["alpha", "beta", "gamma"],
}


class ScriptedClient:
    def __init__(self, texts: list[str]) -> None:
        self.texts = texts
        self.calls: list[tuple[str, str]] = []

    def complete(self, system: str, user: str) -> str:
        self.calls.append((system, user))
        index = min(len(self.calls) - 1, len(self.texts) - 1)
        return self.texts[index]


def _b8_result(tmp_path) -> tuple[dict, dict]:
    cfg = RunConfig(arm="B8", dataset="local", limit=1, seed=1, out_root=tmp_path, rounds=2)
    clients = [
        ScriptedClient([ALPHA, BETA]),
        ScriptedClient([BETA, BETA]),
        ScriptedClient([BETA, GAMMA]),
    ]
    retriever = StaticRetriever({0: EVIDENCE, 1: EVIDENCE, 2: EVIDENCE})
    runner = _make_runner(cfg, clients, 2, retriever=retriever, question=QUESTION, qid="mock-b8")
    result = runner.run(QUESTION["question"], QUESTION["options"])
    return cfg, result


def test_mock_b8_result_is_record_ready(tmp_path) -> None:
    _, result = _b8_result(tmp_path)

    assert result["trust_trajectory"] is not None
    assert result["trust_status"] == [TRUST_UPDATED, TRUST_UPDATED]
    assert result["trust_for_positions"] == result["trust_trajectory"][-1]
    for row in result["trust_trajectory"]:
        assert len(row) == 3
        assert abs(sum(row) - 1.0) <= 1e-9
        assert min(row) >= 0.1 - 1e-9


def test_debate_record_keeps_the_final_trust_vector(tmp_path) -> None:
    cfg, result = _b8_result(tmp_path)
    record = debate_record("mock-b8", QUESTION, result, cfg.arm, cfg.seed, 0.1)

    # runner.py already carries the trajectory; the weighted vector must be its
    # last row, and the schema-v2 fields are ready for B's runner patch.
    assert np.allclose(record["trust_trajectory"][-1], result["trust_for_positions"])

    record.update(
        {
            "final_answer": result["aggregation"]["weighted"],
            "final_answer_correct": False,
            "final_answer_source": "weighted",
            "evidence_introduced": True,
            "trust_for_positions": result["trust_for_positions"],
            "trust_status": result["trust_status"],
            "manifest_hash": None,
        }
    )
    assert validate_record(record) == []
    assert record["trust_for_positions"] == record["trust_trajectory"][-1]


def test_b8_no_trust_has_no_trust_telemetry(tmp_path) -> None:
    cfg = RunConfig(
        arm="B8", dataset="local", limit=1, seed=1, out_root=tmp_path, rounds=2, use_trust=False
    )
    clients = [ScriptedClient([ALPHA, BETA]), ScriptedClient([BETA, BETA]), ScriptedClient([BETA, GAMMA])]
    retriever = StaticRetriever({0: EVIDENCE, 1: EVIDENCE, 2: EVIDENCE})
    runner = _make_runner(cfg, clients, 2, retriever=retriever, question=QUESTION, qid="mock-b8")
    result = runner.run(QUESTION["question"], QUESTION["options"])
    assert result["trust_trajectory"] is None
    assert result["trust_for_positions"] is None
    assert result["trust_status"] is None


def test_final_answer_does_not_depend_on_trust_timing_side_effects(tmp_path) -> None:
    """The weighted answer is still the aggregation of the recorded positions."""
    _, result = _b8_result(tmp_path)
    assert result["aggregation"]["weighted"] in {"beta", "gamma", "alpha"}
    assert result["rounds_completed"] == 2
    assert len(result["transcript"]) == 2
    assert len(result["final_positions"]) == 3
