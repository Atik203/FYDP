"""Tests for .env loading — no GPU, no network.

The contract: real environment variables always win over .env values, missing
files and a missing python-dotenv are non-errors.
"""

from __future__ import annotations

import os

from .config import load_env


def test_load_env_sets_missing_key(monkeypatch, tmp_path) -> None:
    env = tmp_path / ".env"
    env.write_text("TEST_TRUSTCAL_NEWKEY=abc123\n", encoding="utf-8")
    monkeypatch.delenv("TEST_TRUSTCAL_NEWKEY", raising=False)
    assert load_env(env) is True
    assert os.environ["TEST_TRUSTCAL_NEWKEY"] == "abc123"


def test_load_env_does_not_override_existing(monkeypatch, tmp_path) -> None:
    env = tmp_path / ".env"
    env.write_text("TEST_TRUSTCAL_KEY=from-file\n", encoding="utf-8")
    monkeypatch.setenv("TEST_TRUSTCAL_KEY", "from-environment")
    assert load_env(env) is True
    assert os.environ["TEST_TRUSTCAL_KEY"] == "from-environment"


def test_load_env_missing_file_is_false(tmp_path) -> None:
    assert load_env(tmp_path / "does-not-exist.env") is False
