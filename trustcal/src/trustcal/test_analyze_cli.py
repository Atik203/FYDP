"""analyze.py must never silently pool arms or datasets (P0-11)."""

from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

SCRIPT = Path(__file__).resolve().parents[2] / "scripts" / "analyze.py"

OPTIONS = ["mitochondrial matrix", "cytoplasm", "nucleus", "reticulum"]


def _write_run(root: Path, arm: str, dataset: str, seed: int = 1, index: int = 0) -> Path:
    path = root / arm / dataset / f"seed{seed}" / "records.jsonl"
    path.parent.mkdir(parents=True, exist_ok=True)
    record = {
        "question_id": f"{dataset}-{index:04d}",
        "arm": arm,
        "seed": seed,
        "question": "Where does the Krebs cycle occur?",
        "gold": "cytoplasm",
        "options": OPTIONS,
        "rounds": [{"answers": ["cytoplasm", "cytoplasm", "cytoplasm"]}],
        "transcript": [{"round": 1, "positions": ["Answer: cytoplasm"] * 3}],
        "evidence_introduced": False,
        "final_answer": "cytoplasm",
        "final_answer_correct": True,
        "final_answer_source": "majority",
        "parser_version": "p0-1",
        "manifest_hash": "a" * 64,
    }
    with path.open("a", encoding="utf-8") as handle:
        handle.write(json.dumps(record) + "\n")
    return path


def _run(*args: str) -> subprocess.CompletedProcess:
    return subprocess.run(
        [sys.executable, str(SCRIPT), *args],
        capture_output=True,
        text=True,
        timeout=180,
    )


def test_mixed_arms_are_refused(tmp_path) -> None:
    root = tmp_path / "results"
    _write_run(root, "B3", "gpqa")
    _write_run(root, "B8", "gpqa")

    result = _run("--dir", str(root))

    assert result.returncode == 2
    assert "refusing to pool" in result.stderr
    assert "B3" in result.stderr and "B8" in result.stderr


def test_mixed_datasets_are_refused(tmp_path) -> None:
    root = tmp_path / "results"
    _write_run(root, "B8", "gpqa")
    _write_run(root, "B8", "mmlu_pro")

    result = _run("--dir", str(root))

    assert result.returncode == 2
    assert "refusing to pool" in result.stderr
    assert "mmlu_pro" in result.stderr


def test_allow_pool_pools_on_purpose(tmp_path) -> None:
    root = tmp_path / "results"
    _write_run(root, "B3", "gpqa")
    _write_run(root, "B8", "gpqa")

    result = _run("--dir", str(root), "--allow-pool", "--json")

    assert result.returncode == 0, result.stderr
    payload = json.loads(result.stdout)
    assert payload["arms"] == ["B3", "B8"]
    assert payload["datasets"] == ["gpqa"]
    assert payload["pooled"] is True
    assert payload["n_records"] == 2


def test_explicit_slice_selects_one_arm(tmp_path) -> None:
    root = tmp_path / "results"
    _write_run(root, "B3", "gpqa")
    _write_run(root, "B8", "gpqa")

    result = _run("--dir", str(root), "--arm", "B8", "--dataset", "gpqa", "--json")

    assert result.returncode == 0, result.stderr
    payload = json.loads(result.stdout)
    assert payload["arms"] == ["B8"]
    assert payload["datasets"] == ["gpqa"]
    assert payload["pooled"] is False
    assert payload["n_records"] == 1


def test_single_arm_directory_keeps_working_without_flags(tmp_path) -> None:
    root = tmp_path / "results"
    _write_run(root, "B3", "gpqa")

    result = _run("--dir", str(root), "--json")

    assert result.returncode == 0, result.stderr
    payload = json.loads(result.stdout)
    assert payload["arms"] == ["B3"]
    assert payload["datasets"] == ["gpqa"]
    assert payload["pooled"] is False
    assert payload["n_records"] == 1


def test_single_records_file_prints_detected_arm_and_dataset(tmp_path) -> None:
    root = tmp_path / "results"
    path = _write_run(root, "B3", "gpqa")

    result = _run("--records", str(path))

    assert result.returncode == 0, result.stderr
    assert "arms: B3" in result.stdout
    assert "datasets: gpqa" in result.stdout
    assert "CCR:" in result.stdout


def test_seed_directories_are_not_conditions(tmp_path) -> None:
    root = tmp_path / "results"
    _write_run(root, "B3", "gpqa", seed=1)
    _write_run(root, "B3", "gpqa", seed=2)

    result = _run("--dir", str(root), "--json")

    assert result.returncode == 0, result.stderr
    payload = json.loads(result.stdout)
    assert payload["arms"] == ["B3"]
    assert payload["datasets"] == ["gpqa"]
    assert payload["n_records"] == 2


def test_unknown_arm_selection_is_an_error(tmp_path) -> None:
    root = tmp_path / "results"
    _write_run(root, "B3", "gpqa")

    result = _run("--dir", str(root), "--arm", "B8")

    assert result.returncode == 2
    assert "no records for arm" in result.stderr


def test_selection_that_matches_nothing_is_an_error(tmp_path) -> None:
    root = tmp_path / "results"
    _write_run(root, "B3", "gpqa")
    _write_run(root, "B8", "mmlu_pro")

    result = _run("--dir", str(root), "--arm", "B3", "--dataset", "mmlu_pro")

    assert result.returncode == 2
    assert "no records match" in result.stderr
