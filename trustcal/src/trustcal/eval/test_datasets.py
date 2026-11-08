"""Dataset normalization, split policy, stratified sampling, and revision pins."""

from __future__ import annotations

import json
import sys
from pathlib import Path
from types import SimpleNamespace

import pytest
import yaml

from .datasets import (
    DATASETS,
    EmptyAnswerError,
    _row_to_question,
    eligible_counts,
    load_dataset,
    pinned_revision,
    revision_audit,
    revision_status,
    stratified_sample,
    write_eligible_n,
)

CONFIG = Path(__file__).resolve().parents[3] / "configs" / "datasets.yaml"
EXPERIMENTS = Path(__file__).resolve().parents[3] / "configs" / "experiments.yaml"


class FakeHF:
    """Stands in for `datasets.load_dataset`; records the call, never downloads."""

    def __init__(self, rows: list[dict]) -> None:
        self.rows = rows
        self.calls: list[tuple[str, dict]] = []

    def __call__(self, repo: str, **kwargs):
        self.calls.append((repo, kwargs))
        return list(self.rows)


@pytest.fixture
def fake_hf(monkeypatch):
    def install(rows: list[dict]) -> FakeHF:
        fake = FakeHF(rows)
        monkeypatch.setitem(sys.modules, "datasets", SimpleNamespace(load_dataset=fake))
        return fake

    return install


def test_gpqa_columns() -> None:
    row = {
        "Question": "Q?",
        "Correct Answer": "right",
        "Incorrect Answer 1": "wrong1",
        "Incorrect Answer 2": "wrong2",
        "Incorrect Answer 3": "wrong3",
    }
    out = _row_to_question(row, "gpqa")
    assert out["question"] == "Q?"
    assert out["answer"] == "right"
    assert out["options"][0] == "right"
    assert len(out["options"]) == 4


def test_gold_answer_is_an_answer_column() -> None:
    row = {"problem": "P?", "gold_answer": "42", "solution": "long proof"}
    out = _row_to_question(row, "brokermath")
    assert out["answer"] == "42"


def test_empty_gold_answer_is_skipped_not_scored_as_proof() -> None:
    row = {"problem": "P?", "gold_answer": "", "solution": "long proof"}
    with pytest.raises(EmptyAnswerError, match="no answer"):
        _row_to_question(row, "brokermath")


def test_solution_is_rationale_not_answer() -> None:
    with pytest.raises(ValueError, match="no answer"):
        _row_to_question({"problem": "P?", "solution": "proof text"}, "brokermath")


def test_generic_question_problem_aliases() -> None:
    assert _row_to_question({"problem": "P?", "answer": "A"}, "brokermath")["question"] == "P?"
    assert _row_to_question({"question": "Q?", "final_answer": "A"}, "hle")["answer"] == "A"


def test_mmlu_pro_answer_index_maps_to_option() -> None:
    row = {"question": "Q?", "options": ["a", "b", "c"], "answer_index": 2, "answer": "C"}
    assert _row_to_question(row, "mmlu_pro")["answer"] == "c"


def test_answer_type_is_preserved_for_hle() -> None:
    row = {"question": "Q?", "answer": "7", "answer_type": "exactMatch", "category": "Math"}
    out = _row_to_question(row, "hle")
    assert out["answer_type"] == "exactMatch"
    assert out["stratum"] == "Math"


def test_stratum_prefers_category_and_falls_back() -> None:
    assert _row_to_question({"question": "Q?", "answer": "A", "category": "physics"}, "mmlu_pro")["stratum"] == "physics"
    assert _row_to_question({"question": "Q?", "answer": "A", "Subdomain": "Genetics"}, "gpqa")["stratum"] == "Genetics"
    assert _row_to_question({"question": "Q?", "answer": "A"}, "hle")["stratum"] == "unstratified"


def test_brokermath_uses_the_benchmark_split(fake_hf) -> None:
    fake = fake_hf([{"problem": "P?", "gold_answer": "1"}])
    rows = load_dataset("brokermath", sample_cap=10)
    assert len(rows) == 1
    repo, kwargs = fake.calls[0]
    assert repo == "INSAIT-Institute/BrokenMath"
    assert kwargs["split"] == "benchmark"
    assert kwargs["revision"] == pinned_revision("brokermath")


def test_train_split_is_refused_for_eval() -> None:
    with pytest.raises(ValueError, match="train split"):
        load_dataset("mmlu_pro", split="train")


def test_gpqa_train_is_the_documented_benchmark_exception(fake_hf) -> None:
    fake_hf([{"Question": "Q?", "Correct Answer": "A", "Incorrect Answer 1": "B"}])
    rows = load_dataset("gpqa", sample_cap=1)
    assert len(rows) == 1
    assert rows[0]["options"][0] == "A"


def test_empty_answer_rows_are_skipped_and_counted(fake_hf, tmp_path) -> None:
    fake_hf(
        [
            {"problem": "P1?", "answer": "A"},
            {"problem": "P2?", "answer": ""},
            {"problem": "P3?", "answer": "   "},
        ]
    )
    rows = load_dataset("brokenarxiv", eligible_path=tmp_path / "eligible_n.json")
    assert len(rows) == 1 and rows[0]["answer"] == "A"
    payload = json.loads((tmp_path / "eligible_n.json").read_text(encoding="utf-8"))
    assert payload["n_skipped_no_answer"] == 2
    assert payload["n_eligible"] == 1
    assert payload["n_available"] == 1


def test_loader_passes_split_revision_and_preserves_answer_type(fake_hf, tmp_path) -> None:
    fake = fake_hf(
        [
            {"question": "Q1?", "answer": "1", "answer_type": "exactMatch", "category": "Math"},
            {"question": "Q2?", "answer": "B", "answer_type": "multipleChoice", "category": "Physics"},
        ]
    )
    rows = load_dataset("hle", eligible_path=tmp_path)
    repo, kwargs = fake.calls[0]
    assert repo == "cais/hle"
    assert kwargs["split"] == "test"
    assert kwargs["revision"] == "5a81a4c7271a2a2a312b9a690f0c2fde837e4c29"
    assert [row["answer_type"] for row in rows] == ["exactMatch", "multipleChoice"]
    payload = json.loads((tmp_path / "eligible_n.json").read_text(encoding="utf-8"))
    assert payload["strata"] == {"Math": 1, "Physics": 1}


def test_stratified_sample_covers_every_stratum() -> None:
    rows = [{"question": f"{name}-{i}", "stratum": name} for name in ("a", "b", "c") for i in range(10)]
    sample = stratified_sample(rows, 12, seed=1)
    assert len(sample) == 12
    counts = {key: sum(1 for row in sample if row["stratum"] == key) for key in ("a", "b", "c")}
    assert counts == {"a": 4, "b": 4, "c": 4}


def test_stratified_sample_is_deterministic_and_seed_sensitive() -> None:
    rows = [{"question": f"q{i:02d}", "stratum": "even" if i % 2 == 0 else "odd"} for i in range(40)]
    first = stratified_sample(rows, 10, seed=7)
    second = stratified_sample(rows, 10, seed=7)
    third = stratified_sample(rows, 10, seed=8)
    assert [row["question"] for row in first] == [row["question"] for row in second]
    assert [row["question"] for row in first] != [row["question"] for row in third]
    assert [row["question"] for row in first] == sorted(row["question"] for row in first)


def test_stratified_sample_is_proportional() -> None:
    rows = (
        [{"question": f"a{i}", "stratum": "a"} for i in range(50)]
        + [{"question": f"b{i}", "stratum": "b"} for i in range(30)]
        + [{"question": f"c{i}", "stratum": "c"} for i in range(20)]
    )
    sample = stratified_sample(rows, 10, seed=1)
    counts = {key: sum(1 for row in sample if row["stratum"] == key) for key in "abc"}
    assert counts == {"a": 5, "b": 3, "c": 2}


def test_stratified_sample_keeps_tiny_strata_visible() -> None:
    rows = (
        [{"question": f"big{i}", "stratum": "big"} for i in range(97)]
        + [{"question": "mid0", "stratum": "mid"}]
        + [{"question": "small0", "stratum": "small"}]
    )
    sample = stratified_sample(rows, 3, seed=1)
    assert {row["stratum"] for row in sample} == {"big", "mid", "small"}


def test_cap_above_size_returns_every_row_in_order() -> None:
    rows = [{"question": f"q{i}", "stratum": "x"} for i in range(5)]
    assert stratified_sample(rows, 10) == rows
    assert stratified_sample(rows, None) == rows


def test_eligible_counts_and_writer(tmp_path) -> None:
    rows = [{"stratum": "a"}, {"stratum": "a"}, {"stratum": "b"}]
    assert eligible_counts(rows) == {"n_eligible": 3, "strata": {"a": 2, "b": 1}}
    path = write_eligible_n(rows, tmp_path / "eligible_n.json", dataset="mmlu_pro", requested=3)
    payload = json.loads(path.read_text(encoding="utf-8"))
    assert payload["dataset"] == "mmlu_pro"
    assert payload["n_eligible"] == 3
    assert payload["strata"] == {"a": 2, "b": 1}


def test_every_revision_is_40_hex_or_explicitly_unpinned() -> None:
    config = yaml.safe_load(CONFIG.read_text(encoding="utf-8"))
    for name, entry in config["datasets"].items():
        status = revision_status(name)
        assert status in {"pinned", "unpinned"}, f"{name} has revision {entry.get('revision')!r}"
        if status == "unpinned":
            assert entry.get("revision") is None and entry.get("revision_status") == "unpinned"
        else:
            assert len(entry["revision"]) == 40
            assert entry["revision"] == entry["revision"].lower()


def test_every_loader_name_resolves_to_a_pin() -> None:
    for name in DATASETS:
        assert pinned_revision(name), f"{name} is not pinned"
    assert all(row["status"] == "pinned" for row in revision_audit())


def test_appendix_only_matches_the_yaml() -> None:
    config = yaml.safe_load(CONFIG.read_text(encoding="utf-8"))["datasets"]
    assert config["brokermath"]["appendix_only"] is True
    assert config["brokenarxiv"]["appendix_only"] is True
    assert DATASETS["brokermath"]["appendix_only"] is True
    assert DATASETS["brokenarxiv"]["appendix_only"] is True
    assert DATASETS["hle"].get("appendix_only") is None
    assert DATASETS["mmlu_pro"].get("appendix_only") is None


def test_primary_matrix_excludes_appendix_datasets() -> None:
    config = yaml.safe_load(EXPERIMENTS.read_text(encoding="utf-8"))
    assert "brokermath" not in config["datasets"]
    assert "brokenarxiv" not in config["datasets"]
    assert "gpqa_main" in config["datasets"]
    assert "mmlu_pro" in config["datasets"]
    assert "hle" in config["datasets"]
