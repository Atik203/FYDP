"""Cohen's kappa for the injection-protocol validation (Gate 1: κ ≥ 0.75).

Implemented directly (binary/multiclass, nominal) so tests stay dependency-free;
scikit-learn's `cohen_kappa_score` gives the same value for these labels.
"""

from __future__ import annotations

from collections import Counter


def cohen_kappa(labels_a: list[str], labels_b: list[str]) -> float:
    """Cohen's κ for two raters. Returns NaN when chance agreement is 1.0.

    Raises ValueError on empty input or length mismatch — a silently wrong κ is
    worse than a loud failure in a gate check.
    """
    if len(labels_a) != len(labels_b):
        raise ValueError(f"rater length mismatch: {len(labels_a)} vs {len(labels_b)}")
    if not labels_a:
        raise ValueError("cannot compute kappa on empty labels")

    n = len(labels_a)
    observed = sum(1 for a, b in zip(labels_a, labels_b) if a == b) / n
    counts_a, counts_b = Counter(labels_a), Counter(labels_b)
    expected = sum((counts_a[label] / n) * (counts_b[label] / n) for label in set(counts_a) | set(counts_b))
    if expected >= 1.0:
        return float("nan")
    return (observed - expected) / (1.0 - expected)


def agreement_report(labels_a: list[str], labels_b: list[str]) -> dict:
    """κ plus the raw counts a reviewer needs to sanity-check it."""
    n = len(labels_a)
    agree = sum(1 for a, b in zip(labels_a, labels_b) if a == b)
    return {
        "n": n,
        "agree": agree,
        "observed_agreement": round(agree / n, 4) if n else 0.0,
        "kappa": round(cohen_kappa(labels_a, labels_b), 4),
    }
