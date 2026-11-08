"""Final-stack pin and budget checks (no GPU, no network)."""

from __future__ import annotations

import re
from pathlib import Path

from trustcal.config import agents_for_phase, load_models

CONFIG = Path(__file__).resolve().parents[2] / "configs" / "models.yaml"
SHA40 = re.compile(r"^[0-9a-f]{40}$")


def final_agents():
    return agents_for_phase(load_models(CONFIG), "final")


def test_final_stack_has_three_pinned_agents():
    agents = final_agents()
    assert [a.role for a in agents] == ["agent1", "agent2", "agent3"]
    assert [a.port for a in agents] == [8000, 8001, 8002]
    for agent in agents:
        assert agent.revision and SHA40.match(agent.revision), agent
        assert agent.max_model_len == 8192, agent


def test_final_weights_fit_80gb():
    agents = final_agents()
    assert all(a.weights_gb is not None for a in agents)
    assert sum(a.weights_gb for a in agents) <= 80.0


def test_final_vram_reservations_fit_90_percent():
    agents = final_agents()
    assert abs(sum(a.gpu_memory_utilization for a in agents) - 0.90) < 1e-9


def test_final_stack_flags_match_checkpoints():
    by_role = {a.role: a for a in final_agents()}
    qwen = by_role["agent1"]
    gemma = by_role["agent2"]
    mistral = by_role["agent3"]
    assert qwen.quant == "fp8"
    assert "--language-model-only" in qwen.extra_args
    assert gemma.quant == "compressed-tensors"
    assert "--limit-mm-per-prompt" in gemma.extra_args
    assert mistral.quant in {"auto", "compressed-tensors"}
    assert load_models(CONFIG).final_max_model_len == 8192
