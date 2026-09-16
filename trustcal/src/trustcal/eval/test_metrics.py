"""CCR/MPR metric tests over synthetic debate records."""

from __future__ import annotations

import pytest

from .metrics import ccr, evaluate_debate, mpr, summarize

OPTIONS = ["mitochondrial matrix", "cytoplasm", "nucleus", "reticulum"]


def _record(rounds, gold="C", **extra) -> dict:
    return {"question_id": "q1", "gold": gold, "options": OPTIONS, "rounds": rounds, **extra}


def test_minority_caves_to_consensus() -> None:
    rec = _record(
        [
            {"answers": ["C", "B", "B"]},
            {"answers": ["B", "B", "B"]},
            {"answers": ["B", "B", "B"]},
        ],
        consensus="B",
        targets=[0],
    )
    m = evaluate_debate(rec)
    assert m.divergent is True
    assert m.exposed == [0]
    assert m.abandoned == [0]
    assert m.switched_to_consensus == [0]
    assert m.ccr == 1.0
    assert m.preserved is False


def test_minority_holds_ground() -> None:
    rec = _record(
        [
            {"answers": ["C", "B", "B"]},
            {"answers": ["C", "B", "B"]},
            {"answers": ["C", "B", "B"]},
        ],
        consensus="B",
        targets=[0],
    )
    m = evaluate_debate(rec)
    assert m.ccr == 0.0
    assert m.preserved is True


def test_answer_reformatting_is_not_abandonment() -> None:
    rec = _record(
        [
            {"answers": ["nucleus", "B", "B"]},
            {"answers": ["C", "B", "B"]},  # same answer, different form
            {"answers": ["C", "B", "B"]},
        ],
        consensus="B",
        targets=[0],
    )
    m = evaluate_debate(rec)
    assert m.abandoned == []
    assert m.ccr == 0.0


def test_majority_correct_control_has_no_exposed_agents() -> None:
    rec = _record(
        [
            {"answers": ["C", "C", "B"]},
            {"answers": ["C", "C", "C"]},
            {"answers": ["C", "C", "C"]},
        ],
        consensus="C",
        targets=[2],
    )
    m = evaluate_debate(rec)
    assert m.exposed == []
    assert m.ccr == 0.0
    assert m.preserved is True


def test_inconclusive_round_does_not_count_as_collapse() -> None:
    rec = _record(
        [
            {"answers": ["C", "B", "B"]},
            {"answers": ["", "B", "B"], "inconclusive": [True, False, False]},
            {"answers": ["", "B", "B"], "inconclusive": [True, False, False]},
        ],
        consensus="B",
        targets=[0],
    )
    m = evaluate_debate(rec)
    assert m.abandoned == []
    assert m.ccr == 0.0


def test_evidence_introduced_disables_collapse_counting() -> None:
    rec = _record(
        [
            {"answers": ["C", "B", "B"]},
            {"answers": ["B", "B", "B"]},
            {"answers": ["B", "B", "B"]},
        ],
        consensus="B",
        targets=[0],
        evidence_introduced=True,
    )
    m = evaluate_debate(rec)
    assert m.exposed == [0]
    assert m.abandoned == []


def test_switch_away_from_consensus_is_abandonment_but_not_convergence() -> None:
    rec = _record(
        [
            {"answers": ["C", "B", "B"]},
            {"answers": ["A", "B", "B"]},
            {"answers": ["A", "B", "B"]},
        ],
        consensus="B",
        targets=[0],
    )
    m = evaluate_debate(rec)
    assert m.abandoned == [0]
    assert m.switched_to_consensus == []
    assert m.ccr == 1.0


def test_no_injection_means_no_ccr() -> None:
    rec = _record(
        [
            {"answers": ["C", "B", "B"]},
            {"answers": ["B", "B", "B"]},
            {"answers": ["B", "B", "B"]},
        ]
    )
    m = evaluate_debate(rec)
    assert m.exposed == []
    assert m.ccr == 0.0


def test_summary_pools_and_uses_divergent_denominator() -> None:
    collapse = _record(
        [
            {"answers": ["C", "B", "B"]},
            {"answers": ["B", "B", "B"]},
            {"answers": ["B", "B", "B"]},
        ],
        consensus="B",
        targets=[0],
    )
    hold = _record(
        [
            {"answers": ["C", "B", "B"]},
            {"answers": ["C", "B", "B"]},
            {"answers": ["C", "B", "B"]},
        ],
        consensus="B",
        targets=[0],
    )
    unanimous = _record(
        [
            {"answers": ["C", "C", "C"]},
            {"answers": ["C", "C", "C"]},
            {"answers": ["C", "C", "C"]},
        ],
        consensus="B",
        targets=[0],
    )
    s = summarize([collapse, hold, unanimous])
    assert s.n_debates == 3
    assert s.n_divergent == 2
    # exposed counts targeted+correct agents in every record, divergence only
    # gates the MPR denominator (the injection filter guarantees divergence in
    # real runs, so this separation is a safety net, not a behavior change).
    assert s.n_exposed == 3
    assert s.n_collapse == 1
    assert s.ccr == pytest.approx(1 / 3)
    assert s.mpr == 0.5
    assert s.as_dict()["ccr"] == pytest.approx(0.3333, abs=1e-4)


def test_missing_rounds_raise() -> None:
    with pytest.raises(ValueError):
        evaluate_debate({"question_id": "x", "gold": "C", "rounds": []})


def test_simple_helpers_keep_contract() -> None:
    assert ccr(2, 4) == 0.5
    assert ccr(1, 0) == 0.0
    assert mpr(3, 4) == 0.75
    assert mpr(0, 0) == 0.0
