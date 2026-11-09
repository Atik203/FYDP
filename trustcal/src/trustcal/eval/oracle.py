"""B7 oracle: OpenAI GPT-6 Luna, used as the external-answer ceiling.

Uses the OpenAI Chat Completions API through the official ``openai`` SDK.
The client is injectable so the runner and tests never need a key or network.
The previous Gemini path is retired.
"""

from __future__ import annotations

import os
from dataclasses import dataclass, field
from typing import Any

from ..config import get_key

DEFAULT_MODEL = os.getenv("OPENAI_ORACLE_MODEL", "gpt-6-luna")

ORACLE_PROMPT = """Answer this scientific question as accurately as possible. If it is multiple choice, give the option letter and text.

Question: {question}

End with:
Answer: <your final answer>
"""


class OracleError(RuntimeError):
    pass


@dataclass
class OpenAIOracle:
    api_key: str | None = None
    model: str = DEFAULT_MODEL
    timeout: float = 60.0
    client: Any | None = None
    last_metadata: dict[str, Any] = field(default_factory=dict)

    def __post_init__(self) -> None:
        if self.client is not None:
            return
        self.api_key = self.api_key or get_key("OPENAI_API_KEY")
        if not self.api_key:
            raise OracleError("OPENAI_API_KEY is not set; B7 oracle cannot run")
        from openai import OpenAI

        self.client = OpenAI(
            api_key=self.api_key,
            timeout=self.timeout,
            max_retries=2,
        )

    def answer(self, question: str) -> str:
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "user",
                        "content": ORACLE_PROMPT.format(question=question),
                    }
                ],
                temperature=0.0,
            )
        except Exception as exc:
            raise OracleError(f"OpenAI oracle request failed: {exc}") from exc

        try:
            text = response.choices[0].message.content
        except (AttributeError, IndexError, TypeError) as exc:
            raise OracleError(f"unexpected OpenAI response shape: {response}") from exc
        if not text:
            raise OracleError("OpenAI oracle returned an empty response")

        self.last_metadata = {
            "provider": "openai",
            "model": getattr(response, "model", self.model),
            "response_id": getattr(response, "id", None),
            "system_fingerprint": getattr(response, "system_fingerprint", None),
            "created": getattr(response, "created", None),
        }
        return text
