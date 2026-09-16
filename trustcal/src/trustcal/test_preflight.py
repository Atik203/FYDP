"""Preflight check tests — cache/disk/context logic plus live mock-server checks."""

from __future__ import annotations

import pytest

from .config import AgentConfig
from .mock_vllm import base_urls, start_mock_trio, stop_all
from .preflight import (
    check_cache,
    check_context_budget,
    check_disk,
    check_hf_token,
    check_offline,
    check_servers,
    format_report,
)


def test_servers_ok_against_mock() -> None:
    servers = start_mock_trio("divergent")
    try:
        agents = [
            AgentConfig(role=f"agent{i + 1}", model=f"mock-agent{i + 1}", port=int(url.rsplit(":", 1)[1].split("/")[0]))
            for i, url in enumerate(base_urls(servers))
        ]
        results = check_servers(agents)
        assert all(r.ok for r in results)
    finally:
        stop_all(servers)


def test_servers_detect_wrong_model_name() -> None:
    servers = start_mock_trio("agree")
    try:
        port = int(base_urls(servers)[0].rsplit(":", 1)[1].split("/")[0])
        results = check_servers([AgentConfig(role="agent1", model="not-the-served-model", port=port)])
        assert results[0].ok is False
        assert "expected" in results[0].detail
    finally:
        stop_all(servers)


def test_cache_ok_and_missing(tmp_path) -> None:
    good = tmp_path / "hub" / "models--org--name" / "snapshots" / "abc"
    good.mkdir(parents=True)
    (good / "model.safetensors").write_text("x", encoding="utf-8")
    agents = [
        AgentConfig(role="agent1", model="org/name", port=1),
        AgentConfig(role="agent2", model="org/other", port=2),
    ]
    results = check_cache(agents, tmp_path)
    assert results[0].ok is True
    assert results[1].ok is False
    assert "re-download" in results[1].detail


def test_disk_check(tmp_path) -> None:
    assert check_disk(tmp_path, min_free_gb=0.0).ok is True
    assert check_disk(tmp_path, min_free_gb=10_000_000.0).ok is False


def test_context_budget_passes_for_dev_config() -> None:
    result = check_context_budget(max_model_len=4096, max_tokens=1024)
    assert result.ok is True


def test_context_budget_fails_when_tight() -> None:
    assert check_context_budget(max_model_len=2048, max_tokens=1024).ok is False


def test_hf_token_check(monkeypatch) -> None:
    monkeypatch.setenv("HF_TOKEN", "hf_x")
    assert check_hf_token().ok is True
    monkeypatch.delenv("HF_TOKEN")
    assert check_hf_token().ok is False


def test_offline_check(monkeypatch, tmp_path) -> None:
    assert check_offline(tmp_path, enabled=False).ok is True
    monkeypatch.delenv("HF_HUB_OFFLINE", raising=False)
    assert check_offline(tmp_path, enabled=True).ok is False
    monkeypatch.setenv("HF_HUB_OFFLINE", "1")
    assert check_offline(tmp_path, enabled=True).ok is True


def test_report_marks_failure() -> None:
    from .preflight import CheckResult

    report = format_report([CheckResult("a", True, "fine"), CheckResult("b", False, "broken")])
    assert "RESULT: FAIL — b" in report


@pytest.mark.parametrize("value", [0.0, 1.0])
def test_disk_threshold_boundary(tmp_path, value) -> None:
    assert check_disk(tmp_path, min_free_gb=value).ok is True
