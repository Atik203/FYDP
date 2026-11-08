"""Month-1 behavioral-effectiveness pilot (trustcal/PILOT_CRITERION.md).

The pilot asks one question only: does the trust weight *causally* change the
aggregation winner when the evidence contradicts the majority? The criterion was
frozen before the build and must not be softened after seeing numbers.

Question schema (experiments/pilot-month1/questions.json):
    {
      "question": str,
      "answer": str,                     # gold, used only for direction scoring
      "options": [str, ...] | null,
      "verdicts": [{"support": int, "harm": int}, ...],   # one per agent
      "evidence": { "0": [passage, ...], ... } | [passage, ...]
    }
A question needs `verdicts` (human evidence-side labels) or `evidence`
(passages the pipeline classifies itself). Neither -> invalid pilot item.
"""

from __future__ import annotations

import json
from pathlib import Path

from .answers import is_correct

PASS_FRACTION = 0.60
AMBIGUOUS_FRACTION = 0.40


def validate_question(question: dict) -> list[str]:
    """Return schema errors; empty list = valid pilot item."""
    errors: list[str] = []
    if not str(question.get("question", "")).strip():
        errors.append("missing question")
    if "answer" not in question or not str(question.get("answer", "")).strip():
        errors.append("missing answer (gold)")
    if question.get("options") is not None and not isinstance(question["options"], list):
        errors.append("options must be a list or null")
    verdicts = question.get("verdicts")
    evidence = question.get("evidence")
    if verdicts is None and evidence is None:
        errors.append("needs evidence-side verdicts or evidence passages")
    if verdicts is not None:
        if not isinstance(verdicts, list) or not verdicts:
            errors.append("verdicts must be a non-empty list")
        else:
            for i, row in enumerate(verdicts):
                if not isinstance(row, dict):
                    errors.append(f"verdicts[{i}] must be an object")
                    continue
                for key in ("support", "harm"):
                    value = row.get(key)
                    if not isinstance(value, int) or value < 0:
                        errors.append(f"verdicts[{i}].{key} must be a non-negative int")
    if evidence is not None:
        if not isinstance(evidence, (list, dict)):
            errors.append("evidence must be a list or agent->list mapping")
        elif isinstance(evidence, dict):
            for key, value in evidence.items():
                if not isinstance(value, list) or not all(isinstance(v, str) for v in value):
                    errors.append(f"evidence[{key!r}] must be a list of strings")
        elif not all(isinstance(v, str) for v in evidence):
            errors.append("evidence list must contain strings")
    return errors


def load_pilot_questions(path: Path | str) -> list[dict]:
    """Load and validate a frozen pilot file; any error blocks the run."""
    data = json.loads(Path(path).read_text(encoding="utf-8"))
    if not isinstance(data, list) or not data:
        raise ValueError("pilot file must be a non-empty JSON list")
    for index, question in enumerate(data):
        errors = validate_question(question)
        if errors:
            raise ValueError(f"pilot question {index}: {'; '.join(errors)}")
    return data


def pass_threshold(n: int) -> int:
    return max(1, int(-(-n * PASS_FRACTION // 1)))


def ambiguous_threshold(n: int) -> int:
    return max(1, int(-(-n * AMBIGUOUS_FRACTION // 1)))


def pilot_verdict(changed: int, total: int, toward_gold: int = 0) -> str:
    """PASS / AMBIGUOUS / NO-GO, with the wrong-direction override."""
    if total <= 0:
        raise ValueError("pilot needs at least one question")
    need_pass = pass_threshold(total)
    need_ambiguous = ambiguous_threshold(total)
    if changed >= need_pass:
        if toward_gold < changed / 2:
            return "NO-GO (trust shifted aggregation in the wrong direction)"
        return "PASS"
    if changed >= need_ambiguous:
        return "AMBIGUOUS (rerun with a second seed)"
    return "NO-GO (trust did not change aggregation often enough)"


def score_pilot(records: list[dict]) -> dict:
    """Aggregate runner records that carry a ``pilot`` block."""
    rows = [r["pilot"] for r in records if isinstance(r.get("pilot"), dict)]
    total = len(rows)
    changed = sum(1 for row in rows if row.get("changed"))
    toward = sum(1 for row in rows if row.get("changed") and row.get("toward_gold"))
    away = sum(1 for row in rows if row.get("changed") and row.get("toward_gold") is False)
    return {
        "n": total,
        "changed": changed,
        "toward_gold": toward,
        "away_from_gold": away,
        "pass_threshold": pass_threshold(total) if total else 0,
        "ambiguous_threshold": ambiguous_threshold(total) if total else 0,
        "verdict": pilot_verdict(changed, total, toward) if total else "NO DATA",
    }
