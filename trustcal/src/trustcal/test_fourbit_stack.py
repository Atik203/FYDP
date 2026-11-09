"""Four-bit serving phase, precision config, and phase-aware stack budgets.

The four-bit phase targets an 80GB card; the Final phase targets 96GB. These
tests read the real configs so a drifted checkpoint, revision, weight figure or
matrix shape fails here rather than on a paid GPU session.
"""

from __future__ import annotations

import argparse
import subprocess
import sys
from pathlib import Path

import pytest
import yaml

ROOT = Path(__file__).resolve().parents[2]  # trustcal/
CONFIG = ROOT / "configs" / "models.yaml"
FOURBIT_CONFIG = ROOT / "configs" / "experiments_fourbit.yaml"
PRECISION_CONFIG = ROOT / "configs" / "experiments_precision.yaml"
FULL_CONFIG = ROOT / "configs" / "experiments_full.yaml"
CORE_CONFIG = ROOT / "configs" / "experiments.yaml"

sys.path.insert(0, str(ROOT / "scripts"))

import check_stack  # noqa: E402
import run_matrix  # noqa: E402

from trustcal.config import (  # noqa: E402
    PHASES,
    agents_for_phase,
    load_models,
    max_model_len_for_phase,
    rounds_for_phase,
)

FOURBIT_STACK = {
    "agent1": (
        "cyankiwi/Qwen3.8-27B-AWQ-INT4",
        "e3a700906e6a73ba4290b1873dc2ba8198527ab5",
    ),
    "agent2": (
        "cyankiwi/gemma-4-26B-A4B-it-AWQ-4bit",
        "5c5db8a7aeabb70b27923ef56536aa5343ecbb5b",
    ),
    "agent3": (
        "jeffcookio/Mistral-Small-3.2-24B-Instruct-2506-awq-sym",
        "49ec31ec0975e46a1aeef24186a45f11be3042b8",
    ),
}

FINAL_QWEN = ("Qwen/Qwen3.8-27B-FP8", "c3a462cc3d38cf351f3b26cbd763469eeb74ef81")


def _args(**overrides) -> argparse.Namespace:
    values = {"phase": None, "limit": None, "arms": None, "datasets": None, "seed": None}
    values.update(overrides)
    return argparse.Namespace(**values)


def _plan(path: Path) -> list[tuple[dict, object]]:
    matrix = run_matrix._load_matrix(path, _args())
    return run_matrix._build_plan(matrix, Path("results") / "test")


def test_phase_tuple_recognizes_fourbit() -> None:
    assert PHASES == ("dev", "fourbit", "final")


def test_fourbit_block_declares_the_80gb_stack() -> None:
    raw = yaml.safe_load(CONFIG.read_text(encoding="utf-8"))
    fourbit = raw["fourbit_phase"]
    assert fourbit["max_model_len"] == 8192
    assert fourbit["gpu_memory_utilization"] == 0.90
    assert [a["role"] for a in fourbit["agents"]] == ["agent1", "agent2", "agent3"]


def test_fourbit_agents_are_pinned_to_the_expected_checkpoints() -> None:
    agents = agents_for_phase(load_models(CONFIG), "fourbit")
    assert {a.role: (a.model, a.revision) for a in agents} == FOURBIT_STACK
    for agent in agents:
        assert agent.max_model_len == 8192
        assert agent.gpu_memory_utilization == pytest.approx(0.30)
        assert agent.weights_gb is not None
    cfg = load_models(CONFIG)
    assert max_model_len_for_phase(cfg, "fourbit") == 8192
    assert rounds_for_phase(cfg, "fourbit") == cfg.rounds


def test_dev_budget_check_still_passes_without_weight_claims() -> None:
    ok, lines = check_stack.check("dev")
    assert ok, "\n".join(lines)
    assert "total weights = 0.00GB" in "\n".join(lines)


def test_fourbit_agent_flags_match_their_architectures() -> None:
    by_role = {a.role: a for a in agents_for_phase(load_models(CONFIG), "fourbit")}
    qwen = by_role["agent1"]
    gemma = by_role["agent2"]
    mistral = by_role["agent3"]
    assert qwen.quant in {"compressed-tensors", "auto"}
    assert "--language-model-only" in qwen.extra_args
    assert "--reasoning-parser" in qwen.extra_args
    assert "qwen3" in qwen.extra_args
    assert "--default-chat-template-kwargs" in qwen.extra_args
    assert gemma.quant == "compressed-tensors"
    assert "--limit-mm-per-prompt" in gemma.extra_args
    assert '"image": 0' in " ".join(gemma.extra_args)
    assert '"audio": 0' in " ".join(gemma.extra_args)
    assert mistral.quant == "auto"


def test_fourbit_weights_fit_80gb_and_leave_kv_headroom() -> None:
    agents = agents_for_phase(load_models(CONFIG), "fourbit")
    assert sum(a.weights_gb for a in agents) == pytest.approx(53.26)
    assert sum(a.gpu_memory_utilization for a in agents) == pytest.approx(0.90)
    ok, lines = check_stack.check("fourbit")
    output = "\n".join(lines)
    assert ok, output
    assert "total weights = 53.26GB" in output
    assert "80GB" in output
    assert "18.74GB" in output


def test_final_stack_uses_qwen38_and_fits_96gb() -> None:
    agents = agents_for_phase(load_models(CONFIG), "final")
    assert (agents[0].model, agents[0].revision) == FINAL_QWEN
    assert agents[0].weights_gb == pytest.approx(29.95)
    assert sum(a.weights_gb for a in agents) == pytest.approx(73.68)
    ok, lines = check_stack.check("final")
    output = "\n".join(lines)
    assert ok, output
    assert "total weights = 73.68GB" in output
    assert "96GB" in output
    assert "12.72GB" in output


def test_fourbit_phase_reaches_every_phase_cli() -> None:
    scripts = [
        "scripts/gen_serve_cmds.py",
        "scripts/check_stack.py",
        "scripts/preflight.py",
        "scripts/smoke_test.py",
        "scripts/run_experiment.py",
        "scripts/run_matrix.py",
    ]
    for script in scripts:
        proc = subprocess.run(
            [sys.executable, script, "--help"],
            cwd=ROOT,
            capture_output=True,
            text=True,
            timeout=120,
        )
        assert proc.returncode == 0, (script, proc.stderr)
        assert "fourbit" in proc.stdout, f"{script} does not advertise the fourbit phase"


def test_fourbit_serve_commands_are_generated_from_the_config() -> None:
    proc = subprocess.run(
        [sys.executable, "scripts/gen_serve_cmds.py", "--phase", "fourbit"],
        cwd=ROOT,
        capture_output=True,
        text=True,
        timeout=120,
    )
    assert proc.returncode == 0, proc.stderr
    commands = [line for line in proc.stdout.splitlines() if line.strip()]
    assert len(commands) == 3
    for model, revision in FOURBIT_STACK.values():
        assert model in proc.stdout
        assert f"--revision {revision}" in proc.stdout
    combined = "\n".join(commands)
    assert "--quantization compressed-tensors" in combined
    assert "--language-model-only" in combined
    assert "--reasoning-parser qwen3" in combined
    assert "--limit-mm-per-prompt" in combined


def test_matrix_dry_runs_have_the_expected_row_counts() -> None:
    assert len(_plan(CORE_CONFIG)) == 24
    assert len(_plan(FOURBIT_CONFIG)) == 24
    assert len(_plan(FULL_CONFIG)) == 32
    assert len(_plan(PRECISION_CONFIG)) == 3


def test_fourbit_matrix_matches_the_core_design_on_the_fourbit_stack() -> None:
    raw = yaml.safe_load(FOURBIT_CONFIG.read_text(encoding="utf-8"))
    assert raw["phase"] == "fourbit"
    assert raw["datasets"] == ["gpqa_main", "mmlu_pro", "hle"]
    assert raw["seeds"] == [1, 2]
    plan = _plan(FOURBIT_CONFIG)
    assert {condition["key"] for condition, _ in plan} == {
        "B3",
        "B4-matched",
        "B8-no-trust",
        "B8",
    }
    assert all(cfg.phase == "fourbit" for _, cfg in plan)
    assert {cfg.limit for _, cfg in plan} == {400, 200}


def test_precision_replication_is_three_runs_on_the_final_stack() -> None:
    raw = yaml.safe_load(PRECISION_CONFIG.read_text(encoding="utf-8"))
    assert raw["phase"] == "final"
    assert raw["datasets"] == ["gpqa_main"]
    assert raw["seeds"] == [1]
    assert raw["sample_caps"]["main"] == 200
    plan = _plan(PRECISION_CONFIG)
    assert len(plan) == 3
    assert {condition["key"] for condition, _ in plan} == {"B3", "B8-no-trust", "B8"}
    assert all(cfg.phase == "final" for _, cfg in plan)
    assert {cfg.limit for _, cfg in plan} == {200}
    assert {cfg.dataset for _, cfg in plan} == {"gpqa_main"}


def test_full_matrix_now_runs_on_the_fourbit_phase() -> None:
    raw = yaml.safe_load(FULL_CONFIG.read_text(encoding="utf-8"))
    assert raw["phase"] == "fourbit"
    assert all(cfg.phase == "fourbit" for _, cfg in _plan(FULL_CONFIG))
