"""Config tests — loopback choice is load-bearing and must not regress."""

from __future__ import annotations

from .config import AgentConfig


def test_base_url_uses_ipv4_loopback() -> None:
    # Windows resolves localhost to ::1 first; vLLM listens on IPv4, and the
    # fallback costs ~2s per request. 127.0.0.1 avoids that on every platform.
    agent = AgentConfig(role="agent1", model="m", port=8000)
    assert agent.base_url == "http://127.0.0.1:8000/v1"
