"""Retry/seed behavior of the vLLM client — no GPU, no network."""

from __future__ import annotations

from types import SimpleNamespace

import httpx
import pytest
from openai import APITimeoutError, BadRequestError

from .client import VLLMClient


class _FakeCompletions:
    def __init__(self, script: list[object]) -> None:
        self.script = list(script)
        self.calls = 0

    def create(self, **kwargs):
        self.calls += 1
        item = self.script.pop(0) if self.script else "ok"
        if isinstance(item, Exception):
            raise item
        return SimpleNamespace(choices=[SimpleNamespace(message=SimpleNamespace(content=item))])


def _client(script: list[object]) -> tuple[VLLMClient, _FakeCompletions]:
    client = VLLMClient("http://localhost:1/v1", "fake-model")
    fake = _FakeCompletions(script)
    client._client = SimpleNamespace(chat=SimpleNamespace(completions=fake))
    return client, fake


def _timeout() -> APITimeoutError:
    return APITimeoutError(request=httpx.Request("POST", "http://localhost:1/v1/chat/completions"))


def _bad_request() -> BadRequestError:
    request = httpx.Request("POST", "http://localhost:1/v1/chat/completions")
    response = httpx.Response(400, request=request)
    return BadRequestError("bad", response=response, body=None)


def test_retries_then_succeeds(monkeypatch) -> None:
    monkeypatch.setattr("trustcal.inference.client.time.sleep", lambda _s: None)
    client, fake = _client([_timeout(), _timeout(), "Answer: 42"])
    assert client.complete("sys", "usr") == "Answer: 42"
    assert fake.calls == 3


def test_empty_completion_is_retried(monkeypatch) -> None:
    monkeypatch.setattr("trustcal.inference.client.time.sleep", lambda _s: None)
    client, fake = _client(["", "Answer: 7"])
    assert client.complete("sys", "usr") == "Answer: 7"
    assert fake.calls == 2


def test_persistent_failure_raises_after_cap(monkeypatch) -> None:
    monkeypatch.setattr("trustcal.inference.client.time.sleep", lambda _s: None)
    client, fake = _client([_timeout(), _timeout(), _timeout()])
    with pytest.raises(RuntimeError):
        client.complete("sys", "usr")
    assert fake.calls == 3


def test_bad_request_is_not_retried() -> None:
    client, fake = _client([_bad_request()])
    with pytest.raises(BadRequestError):
        client.complete("sys", "usr")
    assert fake.calls == 1


def test_seed_is_forwarded(monkeypatch) -> None:
    captured: dict = {}

    class _Capture(_FakeCompletions):
        def create(self, **kwargs):
            captured.update(kwargs)
            return super().create(**kwargs)

    client, _ = _client([])
    client._client = SimpleNamespace(chat=SimpleNamespace(completions=_Capture(["ok"])))
    client.seed = 11
    client.complete("sys", "usr")
    assert captured["seed"] == 11
