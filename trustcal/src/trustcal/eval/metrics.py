"""Metrics (blueprint §9). Signatures fixed; exact definitions land with Ph 2-3 results."""

from __future__ import annotations


def ccr(collapse_events: int, correct_agents_exposed: int) -> float:
    """Collapse Rate — % of correct agents who abandon their answer under injected
    pressure without new evidence. Primary metric.
    """
    return collapse_events / correct_agents_exposed if correct_agents_exposed else 0.0


def mpr(debates_survived: int, total_debates: int) -> float:
    """Minority Preservation Rate — % of debates where a correct minority survives
    to the final output (outcome-level complement to CCR).
    """
    return debates_survived / total_debates if total_debates else 0.0


def ecr(predicted: list[float], correct: list[int]) -> float:
    """Evidence Calibration Rate — how well trust scores track actual correctness.

    Phase 3: full ECE-style implementation vs ground truth.
    """
    raise NotImplementedError("Phase 3: ECR calibration vs ground truth")
