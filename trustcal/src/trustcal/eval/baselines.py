"""Baseline registry B1-B9 (+B10 ConsensAgent). Each baseline is a runnable config."""

from __future__ import annotations

BASELINES = {
    "B1": "Single-Agent CoT",
    "B2": "Single-Agent + RAG",
    "B3": "MAD (Du et al. 2023)",
    "B4": "MAD + RAG",
    "B5": "Self-Consistency (Wang et al. 2022)",
    "B6": "Mixture-of-Agents (Wang et al. 2024)",
    "B7": "Oracle (Gemini 3.1 Pro Preview)",
    "B8": "Ours (trust-calibrated deliberation)",
    "B9": "iMAD (Fan et al. 2026)",
    "B10": "ConsensAgent (Pitre et al. 2025)",
}
