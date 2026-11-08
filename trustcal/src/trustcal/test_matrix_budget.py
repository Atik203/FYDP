"""P0-10 matrix cut: executable pre-registered matrix and compute budget.

These tests read the real ``configs/experiments.yaml`` (not a fixture) so a
condition or cap change that invalidates the pre-registration fails here.
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

import pytest
import yaml

ROOT = Path(__file__).resolve().parents[2]  # trustcal/
REPO = ROOT.parent
CONFIG = ROOT / "configs" / "experiments.yaml"
PREREG = REPO / "PRE_REGISTRATION.md"

sys.path.insert(0, str(ROOT / "scripts"))

import p0_gate  # noqa: E402
import run_matrix  # noqa: E402

EXECUTABLE = ["B3", "B4-matched", "B8-no-trust", "B8"]
SIX_ARM = ["B3", "B4-matched", "B8-no-trust", "B8", "B8-placebo", "B8-oracle"]


def _args(**overrides) -> argparse.Namespace:
    values = {"phase": None, "limit": None, "arms": None, "datasets": None, "seed": None}
    values.update(overrides)
    return argparse.Namespace(**values)


def _load(**overrides) -> run_matrix.Matrix:
    return run_matrix._load_matrix(CONFIG, _args(**overrides))


def _raw() -> dict:
    return yaml.safe_load(CONFIG.read_text(encoding="utf-8"))


def _mentions(text: str, name: str) -> bool:
    """True for a standalone arm name; B8 does not match inside B8-no-trust."""
    return re.search(rf"(?<![\w-]){re.escape(name)}(?![\w-])", text) is not None


def test_registered_matrix_has_four_executable_conditions() -> None:
    config = _raw()
    assert list(config["conditions"]) == EXECUTABLE
    assert config["conditions"]["B3"].get("arm") == "B3"
    assert config["conditions"]["B4-matched"]["arm"] == "B4"
    assert config["conditions"]["B4-matched"]["source_partitioning"] is True
    assert config["conditions"]["B8-no-trust"]["arm"] == "B8"
    assert config["conditions"]["B8-no-trust"]["use_trust"] is False
    assert config["conditions"]["B8"].get("arm") == "B8"
    assert "use_trust" not in config["conditions"]["B8"]
    assert config["datasets"] == ["gpqa_main", "mmlu_pro", "hle"]
    assert config["seeds"] == [1, 2]


def test_matrix_compute_budget_is_within_the_gate() -> None:
    config = _raw()
    assert config["sample_caps"]["main"] == 400
    runs, hours = p0_gate._matrix_gpu_hours(config, minutes_per_debate=8.0)
    assert runs == 4 * 3 * 2 * 400 == 9_600
    assert hours == pytest.approx(9_600 * 8 / 60) == pytest.approx(1_280)
    assert hours <= p0_gate.MATRIX_BUDGET_GPU_HOURS == 1_500


def test_build_plan_applies_per_dataset_caps() -> None:
    matrix = _load()
    plan = run_matrix._build_plan(matrix, Path("results") / "matrix")
    assert len(plan) == 24
    assert matrix.dataset_caps == {"gpqa_main": 400, "mmlu_pro": 400, "hle": 200}

    limits: dict[str, set[int]] = {}
    for condition, cfg in plan:
        limits.setdefault(cfg.dataset, set()).add(cfg.limit)
        if condition["key"] == "B4-matched":
            assert cfg.arm == "B4" and cfg.source_partitioning is True
        elif condition["key"] == "B8-no-trust":
            assert cfg.arm == "B8" and cfg.use_trust is False
        elif condition["key"] == "B8":
            assert cfg.arm == "B8" and cfg.use_trust is True
    assert limits == {"gpqa_main": {400}, "mmlu_pro": {400}, "hle": {200}}
    assert {condition["key"] for condition, _ in plan} == set(EXECUTABLE)


def test_limit_override_beats_sample_and_dataset_caps() -> None:
    plan = run_matrix._build_plan(_load(limit=7), Path("results") / "matrix")
    assert len(plan) == 24
    assert {cfg.limit for _, cfg in plan} == {7}


def test_dataset_caps_reject_unknown_dataset_and_bad_value() -> None:
    with pytest.raises(ValueError, match="unknown dataset"):
        run_matrix._parse_dataset_caps({"not_a_dataset": 5}, ["gpqa_main"])
    with pytest.raises(ValueError, match="positive integer"):
        run_matrix._parse_dataset_caps({"gpqa_main": 0}, ["gpqa_main"])


def test_preregistration_documents_the_six_arm_target() -> None:
    assert PREREG.is_file(), "PRE_REGISTRATION.md must exist at the repo root"
    text = PREREG.read_text(encoding="utf-8")
    assert "pre-registration" in text.lower()
    assert "9 November 2026" in text
    for arm in SIX_ARM:
        assert _mentions(text, arm), f"pre-registration does not name {arm}"
    assert "B8 vs B8-no-trust" in text
    assert "pending wp-13" in text.lower()
