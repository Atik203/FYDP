"""Statistics: deterministic checks, no scipy/sklearn dependency."""

from __future__ import annotations

import pytest

from .stats import (
    bootstrap_ci,
    cohens_d,
    holm_bonferroni,
    mcnemar,
    paired_bootstrap_ci,
    summarize,
)


def test_bootstrap_ci_flat_sample() -> None:
    assert bootstrap_ci([2.0] * 20, n_boot=200) == (2.0, 2.0)


def test_paired_bootstrap_zero_difference() -> None:
    low, high = paired_bootstrap_ci([1, 2, 3], [1, 2, 3], n_boot=200)
    assert low == 0.0 and high == 0.0


def test_paired_length_mismatch_raises() -> None:
    with pytest.raises(ValueError):
        paired_bootstrap_ci([1, 2], [1])


def test_cohens_d_zero_for_identical_samples() -> None:
    assert cohens_d([1, 2, 3], [1, 2, 3]) == 0.0


def test_cohens_d_positive_when_a_is_larger() -> None:
    assert cohens_d([3, 4, 5], [1, 2, 3]) > 1.0


def test_mcnemar_counts_and_exact_p() -> None:
    result = mcnemar([0, 0, 1], [1, 1, 1])
    assert result["fixed"] == 2
    assert result["broken"] == 0
    assert 0 < result["p_value"] <= 1


def test_holm_is_monotone_and_bounded() -> None:
    adjusted = holm_bonferroni([0.01, 0.04, 0.03])
    assert all(0 <= p <= 1 for p in adjusted)
    assert adjusted[0] <= adjusted[2] <= adjusted[1]


def test_summarize_shape() -> None:
    row = summarize([1, 2, 3], n_boot=100)
    assert row["n"] == 3
    assert row["ci_low"] <= row["mean"] <= row["ci_high"]
