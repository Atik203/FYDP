"""Statistics for the Phase 3 matrix (blueprint §9): CIs, paired tests, effect size.

Deliberately small and dependency-light: percentile bootstrap, paired bootstrap,
Cohen's d, and exact McNemar. No scipy/sklearn import, so the GPU-free test suite
runs on the same machine as the rest of the pipeline.
"""

from __future__ import annotations

import math
import random
from statistics import mean, pstdev


def _percentile(sorted_values: list[float], q: float) -> float:
    if not sorted_values:
        raise ValueError("empty sample")
    position = (len(sorted_values) - 1) * q
    lower = math.floor(position)
    upper = math.ceil(position)
    if lower == upper:
        return sorted_values[lower]
    weight = position - lower
    return sorted_values[lower] * (1 - weight) + sorted_values[upper] * weight


def bootstrap_ci(
    values: list[float],
    n_boot: int = 2000,
    alpha: float = 0.05,
    seed: int = 0,
) -> tuple[float, float]:
    """Percentile bootstrap CI for the mean."""
    if not values:
        raise ValueError("empty sample")
    rng = random.Random(seed)
    n = len(values)
    means = []
    for _ in range(n_boot):
        means.append(mean(values[rng.randrange(n)] for _ in range(n)))
    means.sort()
    return _percentile(means, alpha / 2), _percentile(means, 1 - alpha / 2)


def paired_bootstrap_ci(
    a: list[float],
    b: list[float],
    n_boot: int = 2000,
    alpha: float = 0.05,
    seed: int = 0,
) -> tuple[float, float]:
    """CI for mean(a - b) with paired resampling (same question ids)."""
    if len(a) != len(b):
        raise ValueError("paired samples must have the same length")
    if not a:
        raise ValueError("empty sample")
    diffs = [x - y for x, y in zip(a, b)]
    return bootstrap_ci(diffs, n_boot=n_boot, alpha=alpha, seed=seed)


def _sample_variance(values: list[float]) -> float:
    if len(values) < 2:
        return 0.0
    average = mean(values)
    return sum((x - average) ** 2 for x in values) / (len(values) - 1)


def cohens_d(a: list[float], b: list[float]) -> float:
    """Standardized mean difference (pooled SD); 0 when both samples are flat."""
    if not a or not b:
        return 0.0
    pooled = math.sqrt(
        ((len(a) - 1) * _sample_variance(a) + (len(b) - 1) * _sample_variance(b))
        / (len(a) + len(b) - 2)
    )
    if pooled == 0:
        return 0.0
    return (mean(a) - mean(b)) / pooled


def _binom_two_sided(b: int, c: int) -> float:
    """Exact two-sided McNemar p-value from the discordant counts."""
    n = b + c
    if n == 0:
        return 1.0
    k = min(b, c)
    tail = sum(math.comb(n, i) for i in range(k + 1)) / (2**n)
    return min(1.0, 2 * tail)


def mcnemar(before: list[int], after: list[int]) -> dict:
    """Paired correctness comparison: b = fixed, c = broken by the intervention."""
    if len(before) != len(after):
        raise ValueError("before/after must have the same length")
    b = sum(1 for x, y in zip(before, after) if x == 0 and y == 1)
    c = sum(1 for x, y in zip(before, after) if x == 1 and y == 0)
    return {"fixed": b, "broken": c, "p_value": _binom_two_sided(b, c)}


def holm_bonferroni(p_values: list[float]) -> list[float]:
    """Holm-adjusted p-values in input order (family-wise error control)."""
    m = len(p_values)
    order = sorted(range(m), key=lambda i: p_values[i])
    adjusted = [0.0] * m
    running = 0.0
    for rank, index in enumerate(order):
        value = min(1.0, (m - rank) * p_values[index])
        running = max(running, value)
        adjusted[index] = running
    return adjusted


def summarize(values: list[float], n_boot: int = 2000, seed: int = 0) -> dict:
    """Mean + 95% CI + SD, the row shape used by the results table."""
    if not values:
        return {"n": 0, "mean": 0.0, "ci_low": 0.0, "ci_high": 0.0, "sd": 0.0}
    low, high = bootstrap_ci(values, n_boot=n_boot, seed=seed)
    return {
        "n": len(values),
        "mean": mean(values),
        "ci_low": low,
        "ci_high": high,
        "sd": pstdev(values),
    }
