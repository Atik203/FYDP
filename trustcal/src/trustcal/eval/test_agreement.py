"""Tests for Cohen's kappa — hand-computed values, no dependencies."""

from __future__ import annotations

import math

import pytest

from .agreement import agreement_report, cohen_kappa


def test_perfect_agreement() -> None:
    assert cohen_kappa(["y", "n", "y"], ["y", "n", "y"]) == 1.0


def test_hand_computed_agreement() -> None:
    # a = y,y,n,n ; b = y,n,n,n -> po = 0.75, pe = 0.5, kappa = 0.5
    assert cohen_kappa(["y", "y", "n", "n"], ["y", "n", "n", "n"]) == pytest.approx(0.5)


def test_single_label_domain_is_nan() -> None:
    assert math.isnan(cohen_kappa(["y", "y"], ["y", "y"]))


def test_length_mismatch_raises() -> None:
    with pytest.raises(ValueError):
        cohen_kappa(["y"], ["y", "n"])


def test_empty_raises() -> None:
    with pytest.raises(ValueError):
        cohen_kappa([], [])


def test_report_shape() -> None:
    report = agreement_report(["y", "n", "y"], ["y", "n", "n"])
    assert report["n"] == 3
    assert report["agree"] == 2
    assert report["observed_agreement"] == pytest.approx(0.6667, abs=1e-4)


def test_three_class_labels() -> None:
    a = ["mcq", "numeric", "free", "mcq", "numeric"]
    b = ["mcq", "numeric", "free", "mcq", "numeric"]
    assert cohen_kappa(a, b) == 1.0
