from types import SimpleNamespace

import pytest

from trustcal.eval.oracle import OpenAIOracle, OracleError


class _FakeCompletions:
    def __init__(self, content="Answer: B", error=None):
        self.content = content
        self.error = error
        self.kwargs = None

    def create(self, **kwargs):
        self.kwargs = kwargs
        if self.error is not None:
            raise self.error
        return SimpleNamespace(
            id="resp_test",
            model=kwargs["model"],
            created=1234567890,
            system_fingerprint="fp_test",
            choices=[SimpleNamespace(message=SimpleNamespace(content=self.content))],
        )


class _FakeClient:
    def __init__(self, completions):
        self.chat = SimpleNamespace(completions=completions)


def _oracle(completions, **kwargs):
    return OpenAIOracle(
        client=_FakeClient(completions), api_key="test", **kwargs
    )


def test_openai_oracle_returns_text_and_records_metadata():
    completions = _FakeCompletions()
    oracle = _oracle(completions, model="gpt-6-luna")

    assert oracle.answer("What is 2+2?") == "Answer: B"
    assert completions.kwargs["model"] == "gpt-6-luna"
    assert completions.kwargs["temperature"] == 0.0
    assert "What is 2+2?" in completions.kwargs["messages"][0]["content"]
    assert oracle.last_metadata == {
        "provider": "openai",
        "model": "gpt-6-luna",
        "response_id": "resp_test",
        "system_fingerprint": "fp_test",
        "created": 1234567890,
    }


def test_openai_oracle_rejects_empty_response():
    oracle = _oracle(_FakeCompletions(content=None))
    with pytest.raises(OracleError, match="empty response"):
        oracle.answer("Q")


def test_openai_oracle_wraps_api_errors():
    oracle = _oracle(_FakeCompletions(error=RuntimeError("boom")))
    with pytest.raises(OracleError, match="request failed"):
        oracle.answer("Q")


def test_openai_oracle_requires_key(monkeypatch):
    monkeypatch.setattr("trustcal.eval.oracle.get_key", lambda name: None)
    with pytest.raises(OracleError, match="OPENAI_API_KEY"):
        OpenAIOracle()
