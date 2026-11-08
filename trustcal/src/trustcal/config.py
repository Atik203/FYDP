"""Config loading — the two-phase model swap happens here and nowhere else."""

from __future__ import annotations

import os
from dataclasses import dataclass, field
from pathlib import Path

import yaml

ENV_PATH = Path(__file__).resolve().parents[2] / ".env"
PHASE_PATH = Path(__file__).resolve().parents[2] / "configs" / "phase.yaml"
PHASES = ("dev", "final")


def load_env(path: Path | None = None) -> bool:
    """Load trustcal/.env into os.environ without overriding existing variables.

    Called once at package import. Pod/CI environment variables always win, so a
    secret exported on the instance is never clobbered by a stale local .env.
    Returns False when python-dotenv or the file is absent (both are fine).
    """
    env_path = path or ENV_PATH
    if not env_path.is_file():
        return False
    try:
        from dotenv import load_dotenv
    except ImportError:
        return False
    load_dotenv(env_path, override=False)
    return True


def get_key(name: str) -> str | None:
    """Read an API key from the environment (after load_env); empty → None."""
    value = os.getenv(name, "").strip()
    return value or None


@dataclass
class AgentConfig:
    role: str
    model: str
    port: int
    quant: str = "auto"
    gpu_memory_utilization: float | None = None
    max_model_len: int | None = None
    extra_args: list[str] = field(default_factory=list)

    @property
    def base_url(self) -> str:
        # 127.0.0.1, not localhost: Windows resolves localhost to ::1 first and the
        # IPv4-only vLLM listener costs ~2s per connection on the fallback.
        return f"http://127.0.0.1:{self.port}/v1"


@dataclass
class ModelConfig:
    rounds: int = 3
    max_model_len: int = 4096
    gpu_memory_utilization: float | None = None
    agents: list[AgentConfig] = field(default_factory=list)
    final_agents: list[AgentConfig] = field(default_factory=list)
    final_rounds: int | None = None
    final_max_model_len: int | None = None


def load_models(path: Path | str) -> ModelConfig:
    """Parse configs/models.yaml. Use `agents_for_phase` to pick Dev vs Final."""
    raw = yaml.safe_load(Path(path).read_text())
    final = raw.get("final_phase", {})
    return ModelConfig(
        rounds=raw.get("rounds", 3),
        max_model_len=raw.get("max_model_len", 4096),
        gpu_memory_utilization=raw.get("gpu_memory_utilization"),
        agents=[AgentConfig(**a) for a in raw["agents"]],
        final_agents=[AgentConfig(**a) for a in final.get("agents", [])],
        final_rounds=final.get("rounds"),
        final_max_model_len=final.get("max_model_len"),
    )


def default_phase() -> str:
    """Phase for scripts: ``TRUSTCAL_PHASE`` env > configs/phase.yaml > dev.

    The two runnable branches (`Phase-1-dev`, `Phase-1-main`) differ only in
    this one config value; no code is duplicated.
    """
    env = os.getenv("TRUSTCAL_PHASE", "").strip().lower()
    if env in PHASES:
        return env
    if PHASE_PATH.is_file():
        raw = yaml.safe_load(PHASE_PATH.read_text()) or {}
        value = str(raw.get("default_phase", "dev")).strip().lower()
        if value in PHASES:
            return value
    return "dev"


def agents_for_phase(cfg: ModelConfig, phase: str | None = None) -> list[AgentConfig]:
    """The agent list for ``phase``; raises rather than silently using Dev."""
    name = (phase or default_phase()).strip().lower()
    if name == "dev":
        return cfg.agents
    if name == "final":
        if not cfg.final_agents:
            raise ValueError("config has no final_phase.agents; cannot run the Final stack")
        return cfg.final_agents
    raise ValueError(f"unknown phase {name!r}; expected one of {PHASES}")


def rounds_for_phase(cfg: ModelConfig, phase: str | None = None) -> int:
    """Debate depth for the selected stack (Final may override the top-level value)."""
    name = (phase or default_phase()).strip().lower()
    if name == "final" and cfg.final_rounds:
        return int(cfg.final_rounds)
    return int(cfg.rounds)


def load_datasets(path: Path | str) -> dict:
    """Parse configs/datasets.yaml (dataset plan, seeds, sample caps)."""
    return yaml.safe_load(Path(path).read_text())
