"""Smoke-test checks catch the silent model-swap failures."""

from __future__ import annotations

from .smoke import check_records


def _record(**extra) -> dict:
    record = {
        "question_id": "q1",
        "rounds_completed": 2,
        "rounds": [
            {"answers": ["A", "B", "C"]},
            {"answers": ["A", "B", "C"]},
        ],
        "transcript": [
            {"positions": ["alpha claim here", "beta claim here", "gamma claim here"]},
            {"positions": ["alpha claim here", "beta claim here", "gamma claim here"]},
        ],
        "trust_trajectory": [[0.33, 0.33, 0.34], [0.5, 0.25, 0.25]],
    }
    record.update(extra)
    return record


def test_good_record_passes() -> None:
    assert check_records([_record()], rounds=2) == []


def test_empty_records_fail() -> None:
    assert check_records([], rounds=2) == ["no records produced"]


def test_wrong_round_count_fails() -> None:
    failures = check_records([_record(rounds_completed=4)], rounds=3)
    assert any("rounds_completed" in f for f in failures)


def test_nan_trust_fails() -> None:
    record = _record(trust_trajectory=[[0.5, float("nan"), 0.5]])
    assert any("NaN" in f for f in check_records([record], rounds=2))


def test_unsummed_trust_fails() -> None:
    record = _record(trust_trajectory=[[0.5, 0.5, 0.5]])
    assert any("sum to 1" in f for f in check_records([record], rounds=2))


def test_injection_must_change_a_target() -> None:
    unchanged = _record(injection={"eligible": True, "targets": [0]})
    assert any("did not change" in f for f in check_records([unchanged], rounds=2, require_injection=True))

    changed = _record(
        rounds=[{"answers": ["A", "B", "C"]}, {"answers": ["B", "B", "C"]}],
        injection={"eligible": True, "targets": [0]},
    )
    assert check_records([changed], rounds=2, require_injection=True) == []
