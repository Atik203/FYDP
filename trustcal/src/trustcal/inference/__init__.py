"""Thin OpenAI-compatible client for the vLLM servers. No GPU code lives here."""

from .client import VLLMClient, vllm_clients

__all__ = ["VLLMClient", "vllm_clients"]
