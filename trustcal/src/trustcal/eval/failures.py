"""Failure taxonomy for Phase 4 (blueprint §10).

Rule-based labels derived only from a debate record, so the same taxonomy works
for every baseline and can be recomputed from archived JSONL runs.
"""

from __future__ import annotations

from .answers import is_correct, majority_answer, same_answer

TAXONOMY = (
    "adversarial_consensus",
    "correlated_hallucination",
    "evidence_sparsity",
    "minority_lost",
    "trust_collapse",
    "trust_stagnation",
)


def _rounds(record: dict) -> list[dict]:
    return record.get("rounds") or []


def _answers(entry: dict) -> list[str]:
    return [a for a in (entry.get("answers") or []) if a]


def classify_failure(record: dict) -> list[str]:
    """All applicable labels for one debate (empty list = no taxonomy failure)."""
    rounds = _rounds(record)
    if not rounds:
        return ["missing_rounds"]
    gold = record.get("gold")
    options = record.get("options")
    labels: list[str] = []

    first = _answers(rounds[0])
    final = _answers(rounds[-1])
    if first and final:
        gold_at_start = any(is_correct(a, gold, options) for a in first)
        gold_at_end = any(is_correct(a, gold, options) for a in final)
        final_majority, _ = majority_answer(final, options)
        if gold_at_start and not gold_at_end and not is_correct(final_majority or "", gold, options):
            labels.append("minority_lost")

    consensus = record.get("consensus")
    final_majority, _ = majority_answer(final, options)
    if consensus and final_majority and same_answer(final_majority, consensus, options):
        if not is_correct(consensus, gold, options):
            labels.append("adversarial_consensus")

    if final and all(same_answer(a, final[0], options) for a in final):
        if not is_correct(final[0], gold, options):
            labels.append("correlated_hallucination")

    verdict_rounds = record.get("verdicts") or []
    verdicts = [v for entry in verdict_rounds for group in entry.get("verdicts", []) for v in group]
    if verdicts:
        unverifiable = sum(1 for v in verdicts if v == "unverifiable")
        if unverifiable / len(verdicts) > 0.5:
            labels.append("evidence_sparsity")

    trajectory = record.get("trust_trajectory") or []
    if trajectory:
        final_trust = trajectory[-1]
        spread = max(final_trust) - min(final_trust)
        if spread > 0.60 and final:
            # Polarisation alone is not a failure: trust concentrating on the
            # *wrong* agent is. That distinction keeps the pilot's intended
            # trust swing out of the failure taxonomy.
            leader = final_trust.index(max(final_trust))
            if leader < len(final) and not is_correct(final[leader], gold, options):
                labels.append("trust_collapse")
        if spread < 1e-6 and len(final_trust) > 1:
            labels.append("trust_stagnation")

    return labels


def failure_counts(records: list[dict]) -> dict[str, int]:
    """Taxonomy frequency across a run; every known label appears once."""
    counts = {label: 0 for label in TAXONOMY}
    counts["missing_rounds"] = 0
    for record in records:
        for label in classify_failure(record):
            counts[label] = counts.get(label, 0) + 1
    return counts


def failure_examples(records: list[dict], limit: int = 5) -> list[dict]:
    """Representative record ids per label, for the paper's qualitative section."""
    out: list[dict] = []
    for record in records:
        labels = classify_failure(record)
        if labels:
            out.append({"question_id": record.get("question_id"), "labels": labels})
        if len(out) >= limit:
            break
    return out
