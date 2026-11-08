"""Baseline registry tests — every condition must resolve to a runner arm."""

from __future__ import annotations

import pytest

from .baselines import APPROXIMATIONS, BASELINES, DEFERRED, RUNNER_ARMS, arm_for


def test_every_baseline_resolves() -> None:
    for name in BASELINES:
        assert arm_for(name) == name


def test_all_baselines_are_runnable() -> None:
    assert set(BASELINES) <= set(RUNNER_ARMS)
    assert "injection" in RUNNER_ARMS
    assert "pilot" in RUNNER_ARMS


def test_no_baseline_is_deferred() -> None:
    assert DEFERRED == {}


def test_approximations_are_documented() -> None:
    assert set(APPROXIMATIONS) == {"B7", "B9", "B10"}


def test_injection_is_not_a_baseline() -> None:
    with pytest.raises(KeyError):
        arm_for("injection")


def test_unknown_baseline_raises_keyerror() -> None:
    with pytest.raises(KeyError):
        arm_for("B99")
