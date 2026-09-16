"""Preflight checks — validate everything that costs money *before* a paid run.

Each check returns a CheckResult; `run_preflight` collects them and the CLI exits
non-zero on any failure, so a broken pod session aborts before model calls pile up.
"""

from __future__ import annotations

import json
import os
import shutil
import urllib.request
from dataclasses import dataclass
from pathlib import Path

from .agents import AGENT_INITIAL, AGENT_REVISION, AGENT_SYSTEM
from .config import AgentConfig, ModelConfig, load_models

MIN_FREE_GB = 10.0
CHARS_PER_TOKEN = 4
PEER_TRUNCATE_CHARS = 1500  # must match orchestrator/debate.py
OWN_POSITION_EST_CHARS = 4096  # one generation at the 1024-token output cap


@dataclass
class CheckResult:
    name: str
    ok: bool
    detail: str

    def line(self) -> str:
        return f"{'OK  ' if self.ok else 'FAIL'} {self.name:<16} {self.detail}"


def check_servers(agents: list[AgentConfig], timeout: float = 10.0) -> list[CheckResult]:
    """Every configured port serves exactly the configured model id."""
    results = []
    for agent in agents:
        name = f"server:{agent.port}"
        try:
            with urllib.request.urlopen(f"http://127.0.0.1:{agent.port}/v1/models", timeout=timeout) as resp:
                served = [m["id"] for m in json.load(resp).get("data", [])]
            if agent.model in served:
                results.append(CheckResult(name, True, agent.model))
            else:
                results.append(CheckResult(name, False, f"expected {agent.model!r}, served {served}"))
        except Exception as exc:  # noqa: BLE001
            results.append(CheckResult(name, False, str(exc)))
    return results


def _cache_dir(hf_home: Path, model_id: str) -> Path:
    return Path(hf_home) / "hub" / f"models--{model_id.replace('/', '--')}"


def check_cache(agents: list[AgentConfig], hf_home: Path) -> list[CheckResult]:
    """Model weights are already on disk — a miss means paid ingress on Vast."""
    results = []
    for agent in agents:
        name = f"cache:{agent.role}"
        path = _cache_dir(hf_home, agent.model)
        snapshots = path / "snapshots"
        has_files = snapshots.is_dir() and any(p.is_file() for p in snapshots.rglob("*"))
        if has_files:
            results.append(CheckResult(name, True, str(path)))
        else:
            results.append(CheckResult(name, False, f"missing under {path} — expect a re-download"))
    return results


def check_disk(path: Path, min_free_gb: float = MIN_FREE_GB) -> CheckResult:
    try:
        target = Path(path)
        while not target.exists() and target.parent != target:
            target = target.parent
        free_gb = shutil.disk_usage(target).free / 1e9
        ok = free_gb >= min_free_gb
        return CheckResult("disk", ok, f"{free_gb:.1f}GB free (min {min_free_gb:.0f}GB) at {target}")
    except Exception as exc:  # noqa: BLE001
        return CheckResult("disk", False, str(exc))


def check_context_budget(max_model_len: int, max_tokens: int) -> CheckResult:
    """Worst-case revision prompt fits inside (max_model_len - max_tokens)."""
    worst_prompt_chars = (
        len(AGENT_SYSTEM)
        + len(AGENT_INITIAL)
        + len(AGENT_REVISION)
        + 3 * PEER_TRUNCATE_CHARS
        + OWN_POSITION_EST_CHARS
    )
    estimated_tokens = worst_prompt_chars / CHARS_PER_TOKEN
    available = max_model_len - max_tokens
    ok = estimated_tokens <= available * 0.95
    return CheckResult(
        "context",
        ok,
        f"worst-case prompt ~{estimated_tokens:.0f} tok vs {available} available (max_model_len {max_model_len})",
    )


def check_hf_token() -> CheckResult:
    token = os.getenv("HF_TOKEN", "").strip()
    return CheckResult("hf_token", bool(token), "set" if token else "missing — gated datasets will 401")


def check_offline(hf_home: Path, enabled: bool) -> CheckResult:
    if not enabled:
        return CheckResult("offline", True, "not requested (ok when the cache is complete)")
    flag = os.getenv("HF_HUB_OFFLINE", "") == "1"
    return CheckResult("offline", flag, "HF_HUB_OFFLINE=1" if flag else "HF_HUB_OFFLINE not set")


def run_preflight(
    model_config: Path | str = "configs/models.yaml",
    hf_home: Path | None = None,
    offline: bool = False,
    max_tokens: int = 1024,
) -> list[CheckResult]:
    """All checks, in fail-fast order for a human reading the output."""
    cfg: ModelConfig = load_models(model_config)
    home = Path(hf_home) if hf_home else Path(os.getenv("HF_HOME") or (Path.home() / ".cache" / "huggingface"))

    results: list[CheckResult] = []
    results += check_servers(cfg.agents)
    results += check_cache(cfg.agents, home)
    results.append(check_disk(home))
    results.append(check_context_budget(cfg.max_model_len, max_tokens))
    results.append(check_hf_token())
    results.append(check_offline(home, offline))
    return results


def format_report(results: list[CheckResult]) -> str:
    lines = [r.line() for r in results]
    failed = [r.name for r in results if not r.ok]
    lines.append("RESULT: OK" if not failed else f"RESULT: FAIL - {', '.join(failed)}")
    return "\n".join(lines)
