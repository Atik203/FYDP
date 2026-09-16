"""One small wrapper over the OpenAI SDK — `base_url` per vLLM instance.

This is the only module that knows the port numbering from configs/models.yaml.
Each call retries transient failures (timeout, connection, 5xx, rate limit, empty
completion) with exponential backoff, up to `max_attempts` (blueprint: per-agent
retry cap 3). Bad requests (e.g. context overflow) are NOT retried — they are
deterministic and must surface immediately.
"""

from __future__ import annotations

import time

from openai import APIConnectionError, APIStatusError, APITimeoutError, OpenAI, RateLimitError

from ..config import ModelConfig

RETRYABLE = (APIConnectionError, APITimeoutError, RateLimitError)


def _is_retryable(exc: Exception) -> bool:
    if isinstance(exc, RETRYABLE):
        return True
    if isinstance(exc, APIStatusError):
        return exc.status_code >= 500
    return isinstance(exc, RuntimeError) and "empty completion" in str(exc)


class VLLMClient:
    def __init__(
        self,
        base_url: str,
        model: str,
        temperature: float = 0.7,
        max_tokens: int = 1024,
        timeout: float = 120.0,
        seed: int | None = None,
        max_attempts: int = 3,
    ):
        self.model = model
        self.temperature = temperature
        self.max_tokens = max_tokens
        self.seed = seed
        self.max_attempts = max_attempts
        # vLLM ignores the key, but the OpenAI SDK refuses to construct without one.
        self._client = OpenAI(base_url=base_url, api_key="EMPTY", timeout=timeout)

    def complete(self, system: str, user: str, attempts: int | None = None) -> str:
        """Single chat completion, retried on transient failures only."""
        total = attempts or self.max_attempts
        last_error: Exception | None = None
        for attempt in range(total):
            try:
                resp = self._client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {"role": "system", "content": system},
                        {"role": "user", "content": user},
                    ],
                    temperature=self.temperature,
                    max_tokens=self.max_tokens,
                    seed=self.seed,
                )
                text = resp.choices[0].message.content or ""
                if text.strip():
                    return text
                last_error = RuntimeError("empty completion")
            except Exception as exc:  # noqa: BLE001 - retry decision is local
                if not _is_retryable(exc):
                    raise
                last_error = exc
            if attempt < total - 1:
                time.sleep(min(2.0**attempt, 8.0))
        raise RuntimeError(f"vLLM call failed after {total} attempts: {last_error}")


def vllm_clients(cfg: ModelConfig, seed: int | None = None) -> list[VLLMClient]:
    """One client per agent, in agent order (Agent 1, 2, 3).

    When `seed` is given, agents get ``seed + index`` so runs are reproducible
    per-agent without making the three agents identical.
    """
    clients = []
    for i, agent in enumerate(cfg.agents):
        clients.append(VLLMClient(agent.base_url, agent.model, seed=None if seed is None else seed + i))
    return clients
