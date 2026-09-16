"""Runner tests — resume, record schema, summary files. No GPU, no network."""

from __future__ import annotations

from .runner import RunConfig, read_records, records_path, run

OPTIONS = ["mitochondrial matrix", "cytoplasm", "nucleus", "reticulum"]
QUESTIONS = [
    {"question": "Q one?", "answer": "cytoplasm", "options": OPTIONS},
    {"question": "Q two?", "answer": "nucleus", "options": OPTIONS},
]


class FakeClient:
    def __init__(self, answer: str = "cytoplasm") -> None:
        self.answer = answer
        self.calls = 0

    def complete(self, system: str, user: str) -> str:
        self.calls += 1
        return f"Answer: {self.answer}"


def _cfg(tmp_path, arm: str = "B1", limit: int = 2) -> RunConfig:
    return RunConfig(arm=arm, limit=limit, seed=7, out_root=tmp_path, rounds=3)


def test_b1_writes_records_and_summary(tmp_path) -> None:
    cfg = _cfg(tmp_path)
    client = FakeClient("cytoplasm")
    summary = run(cfg, clients=[client], questions=QUESTIONS)

    records = read_records(records_path(cfg))
    assert len(records) == 2
    assert summary.n_debates == 2
    assert client.calls == 2  # one call per question
    first = records[0]
    assert first["arm"] == "B1"
    assert first["gold"] == "cytoplasm"
    assert first["rounds"][0]["answers"] == ["cytoplasm"]
    assert (records_path(cfg).parent / "summary.json").is_file()
    assert list(records_path(cfg).parent.glob("summary-*.md"))


def test_resume_skips_completed_questions(tmp_path) -> None:
    cfg = _cfg(tmp_path)
    client = FakeClient("cytoplasm")
    run(cfg, clients=[client], questions=QUESTIONS)
    assert client.calls == 2

    # Second run: nothing left to do, no extra model calls, no duplicate lines.
    run(cfg, clients=[client], questions=QUESTIONS)
    assert client.calls == 2
    assert len(read_records(records_path(cfg))) == 2


def test_b3_debate_records_three_rounds(tmp_path) -> None:
    cfg = _cfg(tmp_path, arm="B3")
    clients = [FakeClient("cytoplasm"), FakeClient("nucleus"), FakeClient("reticulum")]
    summary = run(cfg, clients=clients, questions=QUESTIONS[:1])

    record = read_records(records_path(cfg))[0]
    assert record["arm"] == "B3"
    assert len(record["rounds"]) == 3
    assert len(record["rounds"][0]["answers"]) == 3
    assert len(record["transcript"]) == 3
    assert summary.n_debates == 1
    assert summary.n_divergent == 1  # three different answers


def test_unknown_arm_rejected(tmp_path) -> None:
    try:
        RunConfig(arm="B9", out_root=tmp_path)
        raise AssertionError("expected ValueError")
    except ValueError:
        pass


def test_read_records_ignores_torn_last_line(tmp_path) -> None:
    path = tmp_path / "records.jsonl"
    path.write_text('{"question_id": "a", "gold": "x", "rounds": [{"answers": ["x"]}]}\n{"question_id": "b", "go', encoding="utf-8")
    records = read_records(path)
    assert [r["question_id"] for r in records] == ["a"]
