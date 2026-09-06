"""Config loading — the two-phase model swap happens here and nowhere else."""

from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path

import yaml


@dataclass
class AgentConfig:
    role: str
    model: str
    port: int
    quant: str

    @property
    def base_url(self) -> str:
        return f"http://localhost:{self.port}/v1"


@dataclass
class ModelConfig:
    rounds: int = 3
    agents: list[AgentConfig] = field(default_factory=list)
    final_agents: list[AgentConfig] = field(default_factory=list)


def load_models(path: Path | str) -> ModelConfig:
    """Parse configs/models.yaml. Callers pass `phase="final"` to use the A100 stack."""
    raw = yaml.safe_load(Path(path).read_text())
    return ModelConfig(
        rounds=raw.get("rounds", 3),
        agents=[AgentConfig(**a) for a in raw["agents"]],
        final_agents=[AgentConfig(**a) for a in raw.get("final_phase", {}).get("agents", [])],
    )


def load_datasets(path: Path | str) -> dict:
    """Parse configs/datasets.yaml (dataset plan, seeds, sample caps)."""
    return yaml.safe_load(Path(path).read_text())
