"""Baseline registry B1-B9 (+B10 ConsensAgent) and runner-arm mapping.

Phase 1 runs B1 and B3 (plus the injection harness, which is not a baseline).
B2/B4 need the retrieval subsystem and land with Phase 2; the lookup helper
raises with the phase name instead of failing silently.
"""

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

# Runner arms that exist today (see trustcal/runner.py). "injection" is the
# stress-test harness (protocol §5.4), not a baseline.
RUNNER_ARMS = ("B1", "B3", "injection")

# Baselines that exist in the registry but are not runnable yet, and where they land.
DEFERRED = {
    "B2": "Phase 2 (needs retrieval)",
    "B4": "Phase 2 (needs retrieval)",
    "B5": "Phase 2 (self-consistency sampling uses the runner)",
    "B6": "Phase 2 (mixture-of-agents aggregation)",
    "B7": "Phase 3 (oracle via GEMINI_API_KEY)",
    "B9": "Phase 2 (iMAD reimplementation, blueprint §13 step 10)",
    "B10": "Phase 2 (ConsensAgent comparison/reimplementation)",
    "B8": "Phase 2 (our mechanism)",
}


def arm_for(baseline: str) -> str:
    """Runner arm for an implemented baseline; raises with the phase otherwise."""
    if baseline in RUNNER_ARMS and baseline != "injection":
        return baseline
    if baseline in DEFERRED:
        raise NotImplementedError(f"{baseline} ({BASELINES.get(baseline, '?')}) not implemented yet: {DEFERRED[baseline]}")
    raise KeyError(f"unknown baseline {baseline!r}; known: {sorted(BASELINES)}")
