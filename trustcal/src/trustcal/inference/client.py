"""One small wrapper over the OpenAI SDK — `base_url` per vLLM instance.

This is the only module that knows the port numbering from configs/models.yaml.
"""

from __future__ import annotations

from openai import OpenAI

from ..config import AgentConfig, ModelConfig


class VLLMClient:
    def __init__(self, base_url: str, model: str, temperature: float = 0.7, max_tokens: int = 2048, timeout: float = 120.0):
        self.model = model
        self.temperature = temperature
        self.max_tokens = max_tokens
        self._client = OpenAI(base_url=base_url, timeout=timeout)

    def complete(self, system: str, user: str) -> str:
        """Single chat completion (no tool calls, no streaming — keep it simple)."""
        resp = self._client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": user},
            ],
            temperature=self.temperature,
            max_tokens=self.max_tokens,
        )
        return resp.choices[0].message.content or ""


def vllm_clients(cfg: ModelConfig) -> list[VLLMClient]:
    """One client per agent, in agent order (Agent 1, 2, 3)."""
    return [VLLMClient(a.base_url, a.model) for a in cfg.agents]
