"""ECR is 1 - ECE over trust/correctness pairs."""

from __future__ import annotations

import pytest

from .metrics import brier_score, ecr


def test_perfect_calibration_is_one() -> None:
    assert ecr([1.0, 0.0], [1, 0]) == 1.0


def test_bin_gap_lowers_ecr() -> None:
    # Each bin has mean confidence 0.1 away from 0.5 accuracy: ECE = 0.4.
    assert ecr([0.9, 0.9, 0.1, 0.1], [1, 0, 1, 0]) == pytest.approx(0.6)


def test_empty_is_zero() -> None:
    assert ecr([], []) == 0.0


def test_length_mismatch_raises() -> None:
    with pytest.raises(ValueError):
        ecr([0.5], [1, 0])


def test_brier_score() -> None:
    assert brier_score([1.0, 0.0], [1, 0]) == 0.0
    assert brier_score([0.0, 1.0], [1, 0]) == 1.0
