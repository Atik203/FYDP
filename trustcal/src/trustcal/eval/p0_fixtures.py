"""Synthetic schema-v2 records for the P0-4 endpoint tests and the P0 gate.

This module is test/gate support, not production code. It has one calibrated
pool and a set of single-purpose records:

* :func:`fixture_records` — six debates chosen so every endpoint has a
  non-trivial, hand-computable value (see the numbers pinned in
  ``eval/test_endpoints.py`` and gate check 9).
* :func:`all_correct`, :func:`all_wrong`, :func:`tie`,
  :func:`missing_final_answer`, :func:`missing_rounds`, :func:`missing_gold`,
  :func:`malformed_round`, :func:`no_weighted`, :func:`legacy_verdicts` — the
  boundary cases.

Options are stored in **rendered** order: ``beta, gamma, alpha, delta``, so the
gold text ``alpha`` is rendered letter ``C``. Every record carries the gold text
(never a letter) plus ``gold_letter_rendered``, per ``09_P0_INTERFACES.md``.
"""

from __future__ import annotations

OPTIONS = ["beta", "gamma", "alpha", "delta"]
GOLD = "alpha"
GOLD_LETTER = "C"


def _record(
    question_id: str,
    rounds: list[list[str]],
    *,
    final_answer: str,
    correct: bool,
    weighted: str,
    majority: str,
    trust: list[float] | None,
    injection: dict | None = None,
    consensus: str | None = None,
    targets: list[int] | None = None,
    verdicts: list[dict] | None = None,
    evidence: list[dict] | None = None,
    evidence_introduced: bool = False,
    aggregation: bool = True,
    source: str = "weighted",
    arm: str = "B8",
    options: list[str] = OPTIONS,
    raw_options: list[str] | None = None,
    permutation: list[int] | None = None,
    gold: str = GOLD,
    gold_letter: str = GOLD_LETTER,
) -> dict:
    n_agents = len(rounds[0])
    record = {
        "question_id": question_id,
        "arm": arm,
        "seed": 1,
        "question": f"Question {question_id}?",
        "gold": gold,
        "options_raw": list(raw_options) if raw_options is not None else list(options),
        "options": list(options),
        "option_permutation": (
            list(permutation) if permutation is not None else list(range(len(options)))
        ),
        "gold_letter_rendered": gold_letter,
        "raw_answer": final_answer,
        "parsed_answer": final_answer,
        "parser_version": "p0-1",
        "final_answer": final_answer,
        "final_answer_correct": correct,
        "final_answer_source": source,
        "rounds": [
            {"answers": list(answers), "inconclusive": [False] * len(answers)} for answers in rounds
        ],
        "transcript": [
            {"round": index + 1, "positions": [f"Answer: {answer}" for answer in answers]}
            for index, answers in enumerate(rounds)
        ],
        "evidence_introduced": evidence_introduced,
        "injection": injection,
        "consensus": consensus,
        "targets": targets,
        "trust_trajectory": ([[1.0 / n_agents] * n_agents, list(trust)] if trust else None),
        "trust_for_positions": list(trust) if trust else None,
        "trust_status": (["updated"] if trust else None),
        "verdicts": verdicts or [],
        "evidence": evidence or [],
        "manifest_hash": "deadbeef",
    }
    if aggregation:
        record["aggregation"] = {
            "majority": majority,
            "weighted": weighted,
            "changed": majority != weighted,
            "labels": [],
        }
    return record


def _injection(consensus: str, targets: list[int]) -> dict:
    return {
        "consensus": consensus,
        "targets": list(targets),
        "consensus_source": "panel",
        "delivered": True,
        "round": 2,
        "scope": "minority",
    }


# --------------------------------------------------------------------------- #
# Calibrated pool: every endpoint is non-trivial and hand-checkable
# --------------------------------------------------------------------------- #


def minority_collapse() -> dict:
    """Correct minority under pressure; the correct agent flips, another returns."""
    return _record(
        "q-collapse",
        [["C", "A", "A"], ["A", "A", "A"], ["A", "C", "A"]],
        final_answer="beta",
        correct=False,
        weighted="beta",
        majority="beta",
        trust=[0.5, 0.3, 0.2],
        injection=_injection("beta", [0]),
        consensus="beta",
        targets=[0],
    )


def minority_holds() -> dict:
    """Correct minority under pressure; the correct agent keeps gold."""
    return _record(
        "q-holds",
        [["C", "A", "A"], ["C", "A", "A"], ["C", "A", "A"]],
        final_answer="alpha",
        correct=True,
        weighted="alpha",
        majority="beta",
        trust=[0.6, 0.2, 0.2],
        injection=_injection("beta", [0]),
        consensus="beta",
        targets=[0],
    )


def majority_correct_revision() -> dict:
    """Retrieval arm, correct majority: the initially-wrong agent is fixed."""
    verdicts = [
        {"agent": i, "round": 2, "claim": "c1", "passages": ["p"], "scores": [0.9],
         "verdict": "supported", "verifier": "lexical"}
        for i in range(3)
    ]
    return _record(
        "q-revise",
        [["C", "A", "C"], ["C", "C", "C"], ["C", "C", "C"]],
        final_answer="alpha",
        correct=True,
        weighted="alpha",
        majority="alpha",
        trust=[0.5, 0.2, 0.3],
        verdicts=verdicts,
        evidence_introduced=True,
    )


def decisive_negative_switch() -> dict:
    """Retrieval arm, decisive-negative evidence: the switch is legitimate."""
    verdicts = [
        {"agent": 0, "round": 2, "claim": "c1", "passages": ["p"], "scores": [0.9],
         "verdict": "contradicted", "verifier": "lexical"},
        {"agent": 0, "round": 2, "claim": "c2", "passages": ["p"], "scores": [0.9],
         "verdict": "contradicted", "verifier": "lexical"},
        {"agent": 1, "round": 2, "claim": "c1", "passages": ["p"], "scores": [0.9],
         "verdict": "contradicted", "verifier": "lexical"},
        {"agent": 2, "round": 2, "claim": "c1", "passages": ["p"], "scores": [0.9],
         "verdict": "unverifiable", "verifier": "lexical"},
    ]
    return _record(
        "q-negative",
        [["C", "A", "A"], ["A", "A", "A"], ["A", "A", "A"]],
        final_answer="beta",
        correct=False,
        weighted="beta",
        majority="beta",
        trust=[0.5, 0.3, 0.2],
        verdicts=verdicts,
        evidence_introduced=True,
    )


def positive_evidence_switch() -> dict:
    """Retrieval arm, supporting evidence: switching away is not evidence-driven."""
    verdicts = [
        {"agent": 0, "round": 2, "claim": "c1", "passages": ["p"], "scores": [0.9],
         "verdict": "supported", "verifier": "lexical"},
        {"agent": 0, "round": 2, "claim": "c2", "passages": ["p"], "scores": [0.9],
         "verdict": "supported", "verifier": "lexical"},
        {"agent": 1, "round": 2, "claim": "c1", "passages": ["p"], "scores": [0.9],
         "verdict": "supported", "verifier": "lexical"},
        {"agent": 2, "round": 2, "claim": "c1", "passages": ["p"], "scores": [0.9],
         "verdict": "unverifiable", "verifier": "lexical"},
    ]
    return _record(
        "q-positive",
        [["C", "A", "A"], ["A", "A", "A"], ["A", "A", "A"]],
        final_answer="beta",
        correct=False,
        weighted="beta",
        majority="beta",
        trust=[0.6, 0.2, 0.2],
        verdicts=verdicts,
        evidence_introduced=True,
    )


def partly_fixed() -> dict:
    """Correct majority where one initially-wrong agent never joins it."""
    return _record(
        "q-arr",
        [["C", "A", "C"], ["C", "A", "C"], ["C", "A", "C"]],
        final_answer="alpha",
        correct=True,
        weighted="alpha",
        majority="alpha",
        trust=[0.5, 0.2, 0.3],
    )


def fixture_records() -> list[dict]:
    """The calibrated pool used by the endpoint tests and gate check 9.

    Expected values (pinned in ``eval/test_endpoints.py``):

    accuracy 3/6, CMR 1/2, CCR-0 1/2, CCR-E 1/3 (1 decisive-negative exclusion),
    MPR-weighted 3/6 with gold_held 4/6, ARR 1/2, AUROC 5/6, Brier 2/9 vs
    baseline 13/54 (skill 1/13).
    """
    return [
        minority_collapse(),
        minority_holds(),
        majority_correct_revision(),
        decisive_negative_switch(),
        positive_evidence_switch(),
        partly_fixed(),
    ]


# --------------------------------------------------------------------------- #
# Boundary fixtures
# --------------------------------------------------------------------------- #


def all_correct() -> dict:
    return _record(
        "q-all-correct",
        [["C", "C", "C"]] * 3,
        final_answer="alpha",
        correct=True,
        weighted="alpha",
        majority="alpha",
        trust=[1 / 3, 1 / 3, 1 / 3],
    )


def all_wrong() -> dict:
    return _record(
        "q-all-wrong",
        [["A", "A", "A"]] * 3,
        final_answer="beta",
        correct=False,
        weighted="beta",
        majority="beta",
        trust=[1 / 3, 1 / 3, 1 / 3],
    )


def tie() -> dict:
    """Round-1 three-way tie; the weighted answer is gold, the majority is not."""
    return _record(
        "q-tie",
        [["C", "A", "B"]] * 3,
        final_answer="alpha",
        correct=True,
        weighted="alpha",
        majority="beta",
        trust=[0.4, 0.3, 0.3],
    )


def no_pressure_control() -> dict:
    """Second control record for ARR/accuracy pools."""
    return _record(
        "q-control",
        [["C", "C", "A"]] * 3,
        final_answer="alpha",
        correct=True,
        weighted="alpha",
        majority="alpha",
        trust=[0.4, 0.3, 0.3],
    )


def missing_final_answer() -> dict:
    record = all_correct()
    for key in ("final_answer", "final_answer_correct", "final_answer_source"):
        record.pop(key, None)
    return record


def missing_rounds() -> dict:
    record = all_correct()
    record.pop("rounds", None)
    return record


def missing_gold() -> dict:
    record = all_correct()
    record["gold"] = ""
    return record


def malformed_round() -> dict:
    record = all_correct()
    record["rounds"] = [{"answers": "C C C"}]
    return record


def no_weighted() -> dict:
    """No aggregation block and a majority-sourced final answer."""
    record = all_correct()
    record.pop("aggregation", None)
    record["final_answer_source"] = "majority"
    return record


def binary_pair(trust: list[float], *, correct_first: bool = True) -> dict:
    """Two-agent record with one correct and one incorrect agent (AUROC/Brier)."""
    answers = ["B", "A"] if correct_first else ["A", "B"]
    return _record(
        "q-pair",
        [answers] * 3,
        final_answer="alpha" if correct_first else "beta",
        correct=correct_first,
        weighted="alpha" if correct_first else "beta",
        majority="alpha" if correct_first else "beta",
        trust=list(trust),
        options=["beta", "alpha"],
        gold="alpha",
        gold_letter="B",
    )


def length_mismatch() -> dict:
    """Trust vector shorter than the final round."""
    record = all_correct()
    record["trust_for_positions"] = [0.5, 0.5]
    return record


def legacy_verdicts() -> dict:
    """Retrieval-arm record whose verdicts use the legacy support/harm shape."""
    return _record(
        "q-legacy",
        [["B", "A"], ["A", "A"], ["A", "A"]],
        final_answer="beta",
        correct=False,
        weighted="beta",
        majority="beta",
        trust=[0.6, 0.4],
        verdicts=[{"round": 2, "support": [2, 0], "harm": [0, 1]}],
        evidence_introduced=True,
        options=["beta", "alpha"],
        gold="alpha",
        gold_letter="B",
    )
