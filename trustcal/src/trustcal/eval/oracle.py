"""B7 oracle: a strong external model used as the accuracy ceiling.

Uses the Gemini REST API through ``requests`` (lazy import). The transport is
injectable so the runner and tests never need a key or network.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Callable

from ..config import get_key

DEFAULT_MODEL = "gemini-3.1-pro-preview"
ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"

ORACLE_PROMPT = """Answer this scientific question as accurately as possible. If it is multiple choice, give the option letter and text.

Question: {question}

End with:
Answer: <your final answer>
"""


class OracleError(RuntimeError):
    pass


@dataclass
class GeminiOracle:
    api_key: str | None = None
    model: str = DEFAULT_MODEL
    timeout: float = 60.0
    http_post: Callable[..., object] | None = None

    def __post_init__(self) -> None:
        self.api_key = self.api_key or get_key("GEMINI_API_KEY")
        if not self.api_key:
            raise OracleError("GEMINI_API_KEY is not set; B7 oracle cannot run")

    def _post(self, url: str, payload: dict) -> dict:
        if self.http_post is not None:
            return self.http_post(url, payload)
        import requests  # lazy

        response = requests.post(url, json=payload, timeout=self.timeout)
        response.raise_for_status()
        return response.json()

    def answer(self, question: str) -> str:
        url = ENDPOINT.format(model=self.model) + f"?key={self.api_key}"
        payload = {
            "contents": [{"parts": [{"text": ORACLE_PROMPT.format(question=question)}]}],
            "generationConfig": {"temperature": 0.0},
        }
        data = self._post(url, payload)
        try:
            parts = data["candidates"][0]["content"]["parts"]
            return "".join(part.get("text", "") for part in parts)
        except (KeyError, IndexError, TypeError) as exc:
            raise OracleError(f"unexpected Gemini response shape: {data}") from exc
