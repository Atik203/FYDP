"""Baseline registry B1-B10 and runner-arm mapping.

All ten conditions are runnable from the same runner. Two are explicit
approximations until their published components are reproduced (see
trustcal/IMPLEMENTATION_STATUS.md): B9 iMAD uses a heuristic gate instead of the
trained FocusCal classifier, and B10 ConsensAgent omits the fine-tuned prompt
optimizer. The comparison stays honest because the deviation is recorded in the
result record and the paper's divergence section.
"""

from __future__ import annotations

BASELINES = {
    "B1": "Single-Agent CoT",
    "B2": "Single-Agent + RAG",
    "B3": "MAD (Du et al. 2023)",
    "B4": "MAD + RAG",
    "B5": "Self-Consistency (Wang et al. 2022)",
    "B6": "Mixture-of-Agents (Wang et al. 2024)",
    "B7": "Oracle (GPT-6 Luna)",
    "B8": "Ours (trust-calibrated deliberation)",
    "B9": "iMAD (Fan et al. 2026)",
    "B10": "ConsensAgent (Pitre et al. 2025)",
}

# "pilot" is the Month-1 behavioral harness; "injection" is the stress test.
RUNNER_ARMS = tuple(BASELINES) + ("pilot", "injection")

# Kept for callers that still import it; no baseline is deferred any more.
DEFERRED: dict[str, str] = {}

APPROXIMATIONS = {
    "B7": "needs OPENAI_API_KEY; oracle, not a competitor mechanism",
    "B9": "heuristic confidence/hesitation gate, not the trained FocusCal MLP",
    "B10": "trigger + confidence/consistency aggregation; no fine-tuned prompt optimizer",
}

IMPLEMENTED = frozenset(BASELINES)


def arm_for(baseline: str) -> str:
    """Runner arm for an implemented baseline; raises for non-baselines."""
    if baseline == "injection":
        raise KeyError("'injection' is a stress-test arm, not a baseline")
    if baseline in BASELINES:
        return baseline
    raise KeyError(f"unknown baseline {baseline!r}; known: {sorted(BASELINES)}")
