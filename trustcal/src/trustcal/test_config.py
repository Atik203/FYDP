"""Config tests — loopback choice is load-bearing and must not regress."""

from __future__ import annotations

from pathlib import Path

import pytest

from .config import AgentConfig, agents_for_phase, default_phase, load_models, rounds_for_phase

CONFIG = Path(__file__).resolve().parents[2] / "configs" / "models.yaml"


def test_base_url_uses_ipv4_loopback() -> None:
    # Windows resolves localhost to ::1 first; vLLM listens on IPv4, and the
    # fallback costs ~2s per request. 127.0.0.1 avoids that on every platform.
    agent = AgentConfig(role="agent1", model="m", port=8000)
    assert agent.base_url == "http://127.0.0.1:8000/v1"


def test_dev_and_final_stacks_are_distinct() -> None:
    cfg = load_models(CONFIG)
    dev = agents_for_phase(cfg, "dev")
    final = agents_for_phase(cfg, "final")
    assert dev[0].model.startswith("QuantTrio/Qwen3.5")
    assert final[0].model.startswith("Qwen/Qwen3.6-27B")
    assert [a.port for a in dev] == [8000, 8001, 8002]
    assert [a.port for a in final] == [8000, 8001, 8002]


def test_unknown_phase_raises() -> None:
    cfg = load_models(CONFIG)
    with pytest.raises(ValueError, match="unknown phase"):
        agents_for_phase(cfg, "prod")


def test_phase_env_selects_stack(monkeypatch) -> None:
    monkeypatch.delenv("TRUSTCAL_PHASE", raising=False)
    configured = default_phase()  # dev on the canonical branch, final on Phase-1-main
    monkeypatch.setenv("TRUSTCAL_PHASE", "final")
    assert default_phase() == "final"
    monkeypatch.setenv("TRUSTCAL_PHASE", "nonsense")
    assert default_phase() == configured


def test_rounds_follow_phase_override() -> None:
    cfg = load_models(CONFIG)
    assert rounds_for_phase(cfg, "dev") == cfg.rounds
    assert rounds_for_phase(cfg, "final") == (cfg.final_rounds or cfg.rounds)
