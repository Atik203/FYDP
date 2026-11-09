"""Smoke-test CLI wiring for the WP-18 placebo and oracle choices."""

from __future__ import annotations

import sys
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[2]  # trustcal/
sys.path.insert(0, str(ROOT / "scripts"))

import smoke_test  # noqa: E402


def test_plain_b8_keeps_both_modes_off() -> None:
    assert smoke_test._resolve_modes("B8", "off", "off") == ("off", "off")


def test_b8_placebo_choice_sets_the_flag() -> None:
    assert smoke_test._resolve_modes("B8-placebo", "off", "off") == (
        "shuffle_verdicts",
        "off",
    )


def test_b8_oracle_choice_defaults_to_gold_answer() -> None:
    assert smoke_test._resolve_modes("B8-oracle", "off", "off") == (
        "off",
        "gold_answer",
    )
    assert smoke_test._resolve_modes("B8-oracle", "off", "gold_evidence") == (
        "off",
        "gold_evidence",
    )


def test_explicit_flags_work_on_plain_b8() -> None:
    assert smoke_test._resolve_modes("B8", "shuffle_verdicts", "off") == (
        "shuffle_verdicts",
        "off",
    )
    assert smoke_test._resolve_modes("B8", "off", "gold_answer") == (
        "off",
        "gold_answer",
    )


@pytest.mark.parametrize(
    "args",
    [
        ("injection", "shuffle_verdicts", "off"),
        ("injection", "off", "gold_answer"),
        ("B8-placebo", "off", "gold_answer"),
        ("B8-oracle", "shuffle_verdicts", "gold_answer"),
    ],
)
def test_conflicting_smoke_choices_fail(args) -> None:
    with pytest.raises(ValueError):
        smoke_test._resolve_modes(*args)
