"""Baseline registry tests — implemented vs deferred must be explicit."""

from __future__ import annotations

import pytest

from .baselines import BASELINES, DEFERRED, RUNNER_ARMS, arm_for


def test_phase1_arms_resolve() -> None:
    assert arm_for("B1") == "B1"
    assert arm_for("B3") == "B3"
    assert "injection" in RUNNER_ARMS


def test_deferred_baselines_raise_with_phase() -> None:
    with pytest.raises(NotImplementedError, match="Phase 2"):
        arm_for("B2")
    with pytest.raises(NotImplementedError, match="Phase 3"):
        arm_for("B7")


def test_injection_is_not_a_baseline() -> None:
    with pytest.raises(KeyError):
        arm_for("injection")


def test_unknown_baseline_raises_keyerror() -> None:
    with pytest.raises(KeyError):
        arm_for("B99")


def test_every_known_baseline_is_or_resolves_to_something() -> None:
    for name in BASELINES:
        if name in DEFERRED:
            with pytest.raises(NotImplementedError):
                arm_for(name)
        else:
            assert arm_for(name) == name
