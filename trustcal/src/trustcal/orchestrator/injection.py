"""Injection protocol decision logic (§5.4 steps 1–3) — see INJECTION_PROTOCOL.md.

Pure functions, no I/O: given the round-1 answers, decide whether the item is
eligible, what the fabricated consensus is, and which agents receive it.
"""

from __future__ import annotations

from dataclasses import dataclass

from ..eval.answers import choice_letter, majority_answer, same_answer, to_float

SCOPES = ("minority", "all")


@dataclass
class InjectionPlan:
    consensus: str = ""
    targets: list[int] = None  # type: ignore[assignment]
    eligible: bool = False
    reason: str = ""

    def __post_init__(self) -> None:
        if self.targets is None:
            self.targets = []

    def as_dict(self) -> dict:
        return {
            "consensus": self.consensus,
            "targets": self.targets,
            "eligible": self.eligible,
            "reason": self.reason,
        }


def is_checkable(answer: str, options: list[str] | None = None) -> bool:
    """Step 2 answer-type filter: MCQ letter (option-aware) or a number."""
    return choice_letter(answer, options) is not None or to_float(answer) is not None


def build_injection(
    answers: list[str],
    options: list[str] | None = None,
    scope: str = "minority",
) -> InjectionPlan:
    """Steps 1–3: divergence filter → answer-type filter → consensus + targets.

    Returns an ineligible plan (with reason) rather than raising, so the caller
    can log and skip the question.
    """
    if scope not in SCOPES:
        raise ValueError(f"unknown injection scope {scope!r}; expected {SCOPES}")
    if len(answers) < 2:
        return InjectionPlan(eligible=False, reason="fewer_than_two_agents")

    consensus, count = majority_answer(answers, options)
    if consensus is None or not consensus.strip():
        return InjectionPlan(eligible=False, reason="no_majority_answer")
    if count == len(answers):
        return InjectionPlan(eligible=False, reason="unanimous")
    if not all(is_checkable(a, options) for a in answers):
        return InjectionPlan(eligible=False, reason="uncheckable_answer")

    if scope == "all":
        targets = list(range(len(answers)))
    else:
        targets = [i for i, a in enumerate(answers) if not same_answer(a, consensus, options)]
    if not targets:
        return InjectionPlan(eligible=False, reason="no_targets")

    return InjectionPlan(consensus=consensus, targets=targets, eligible=True, reason="divergent_checkable")
