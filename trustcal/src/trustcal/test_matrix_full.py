"""Full matrix (WP-18): six conditions, separate config, conditional row count.

The released Core matrix stays 24 rows in ``experiments.yaml``. This module
tests only the separate Full config and never weakens the Core budget test.
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

import pytest
import yaml

ROOT = Path(__file__).resolve().parents[2]  # trustcal/
FULL = ROOT / "configs" / "experiments_full.yaml"
CORE = ROOT / "configs" / "experiments.yaml"

sys.path.insert(0, str(ROOT / "scripts"))

import run_matrix  # noqa: E402

SIX_ARM = ["B3", "B4-matched", "B8-no-trust", "B8", "B8-placebo", "B8-oracle"]


def _args(**overrides) -> argparse.Namespace:
    values = {"phase": None, "limit": None, "arms": None, "datasets": None, "seed": None}
    values.update(overrides)
    return argparse.Namespace(**values)


def _load(path: Path = FULL, **overrides) -> run_matrix.Matrix:
    return run_matrix._load_matrix(path, _args(**overrides))


def _plan(path: Path = FULL, **overrides) -> list[tuple[dict, object]]:
    return run_matrix._build_plan(_load(path, **overrides), Path("results") / "full")


def _write_variant(tmp_path: Path, oracle_mode: str) -> Path:
    raw = yaml.safe_load(FULL.read_text(encoding="utf-8"))
    raw["conditions"]["B8-oracle"]["oracle_mode"] = oracle_mode
    path = tmp_path / f"experiments_full_{oracle_mode}.yaml"
    path.write_text(yaml.safe_dump(raw, sort_keys=False), encoding="utf-8")
    return path


def test_full_config_exists_and_is_separate_from_core() -> None:
    assert FULL.is_file(), "configs/experiments_full.yaml must exist"
    raw = yaml.safe_load(FULL.read_text(encoding="utf-8"))
    assert raw["phase"] == "final"
    assert raw["datasets"] == ["gpqa_main", "mmlu_pro", "eg_sss_180"]
    assert raw["seeds"] == [1, 2]
    assert raw["sample_caps"]["main"] == 300
    assert list(raw["conditions"]) == SIX_ARM
    assert raw["conditions"]["B8-placebo"]["placebo_mode"] == "shuffle_verdicts"
    assert raw["conditions"]["B8-placebo"]["placebo_unit"] == "round_pool"
    assert raw["conditions"]["B8-oracle"]["oracle_mode"] == "gold_evidence"

    core = yaml.safe_load(CORE.read_text(encoding="utf-8"))
    assert list(core["conditions"]) == ["B3", "B4-matched", "B8-no-trust", "B8"]


def test_full_default_is_the_32_row_gold_evidence_plan() -> None:
    raw = yaml.safe_load(FULL.read_text(encoding="utf-8"))
    assert raw["conditions"]["B8-oracle"]["oracle_mode"] == "gold_evidence"
    plan = _plan()
    assert len(plan) == 32
    oracle_rows = [cfg for condition, cfg in plan if condition["key"] == "B8-oracle"]
    assert len(oracle_rows) == 2
    assert {cfg.dataset for cfg in oracle_rows} == {"eg_sss_180"}
    assert all(cfg.oracle_mode == "gold_evidence" for cfg in oracle_rows)


def test_full_dry_run_row_count_matches_the_selected_oracle_mode() -> None:
    raw = yaml.safe_load(FULL.read_text(encoding="utf-8"))
    oracle_mode = raw["conditions"]["B8-oracle"]["oracle_mode"]
    expected = 36 if oracle_mode == "gold_answer" else 32
    plan = _plan()

    assert len(plan) == expected
    assert {cfg.limit for _, cfg in plan} == {300}
    assert {condition["key"] for condition, _ in plan} == set(SIX_ARM)

    oracle_rows = [(condition, cfg) for condition, cfg in plan if condition["key"] == "B8-oracle"]
    placebo_rows = [cfg for condition, cfg in plan if condition["key"] == "B8-placebo"]
    assert len(placebo_rows) == 6
    assert all(cfg.placebo_mode == "shuffle_verdicts" for cfg in placebo_rows)
    assert all(cfg.placebo_unit == "round_pool" for cfg in placebo_rows)
    assert all(cfg.oracle_mode == "off" for cfg in placebo_rows)
    if oracle_mode == "gold_evidence":
        assert {cfg.dataset for _, cfg in oracle_rows} == {"eg_sss_180"}
        assert len(oracle_rows) == 2
    else:
        assert len(oracle_rows) == 6
        assert {cfg.dataset for _, cfg in oracle_rows} == {
            "gpqa_main",
            "mmlu_pro",
            "eg_sss_180",
        }


def test_full_gold_answer_variant_has_36_rows(tmp_path) -> None:
    plan = _plan(_write_variant(tmp_path, "gold_answer"))
    assert len(plan) == 36
    oracle_rows = [cfg for condition, cfg in plan if condition["key"] == "B8-oracle"]
    assert len(oracle_rows) == 6
    assert all(cfg.oracle_mode == "gold_answer" for cfg in oracle_rows)


def test_full_gold_evidence_variant_has_32_rows(tmp_path) -> None:
    plan = _plan(_write_variant(tmp_path, "gold_evidence"))
    assert len(plan) == 32
    oracle_rows = [cfg for condition, cfg in plan if condition["key"] == "B8-oracle"]
    assert len(oracle_rows) == 2
    assert {cfg.dataset for cfg in oracle_rows} == {"eg_sss_180"}
    assert all(cfg.oracle_mode == "gold_evidence" for cfg in oracle_rows)


def test_full_limit_override_beats_caps_but_not_the_row_count(tmp_path) -> None:
    raw = yaml.safe_load(FULL.read_text(encoding="utf-8"))
    oracle_mode = raw["conditions"]["B8-oracle"]["oracle_mode"]
    expected = 36 if oracle_mode == "gold_answer" else 32
    plan = _plan(limit=7)
    assert len(plan) == expected
    assert {cfg.limit for _, cfg in plan} == {7}


def test_core_plan_is_still_24_rows() -> None:
    matrix = run_matrix._load_matrix(CORE, _args())
    plan = run_matrix._build_plan(matrix, Path("results") / "matrix")
    assert len(plan) == 24
    assert {condition["key"] for condition, _ in plan} == {
        "B3",
        "B4-matched",
        "B8-no-trust",
        "B8",
    }


def test_full_config_is_required_before_a_full_dry_run(tmp_path) -> None:
    missing = tmp_path / "experiments_full.yaml"
    with pytest.raises(ValueError, match="config not found"):
        run_matrix._load_matrix(missing, _args())
