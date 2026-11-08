"""Record schema v2 — the write-time contract for every debate record.

Schema source of truth: ``docs/agent/09_P0_INTERFACES.md`` §1. The runner calls
``validate_record`` immediately before appending a line to ``records.jsonl``;
``build_record`` applies the documented defaults (``None`` for optional objects,
``False`` for unscored booleans, ``[]`` for repeatable sections) and refuses to
guess the two fields that must be observed, not defaulted: ``final_answer`` and
``evidence_introduced``.

Invariants enforced here:

* ``gold`` is answer text. A bare A-J letter is only legal for free-form items
  without an option list; rendered letters live in ``gold_letter_rendered``.
* ``final_answer`` is the actual aggregation output — metrics never recompute it.
* ``parser_version`` is stamped on every record so a parser change is auditable.
* trust vectors, when present, are probability simplices.
* ``manifest_hash`` is carried verbatim so a record is traceable to its run.
"""

from __future__ import annotations

import math
import re
from typing import Any

REQUIRED_KEYS: tuple[str, ...] = (
    "question_id",
    "arm",
    "seed",
    "question",
    "gold",
    "options_raw",
    "options",
    "option_permutation",
    "gold_letter_rendered",
    "raw_answer",
    "parsed_answer",
    "parser_version",
    "final_answer",
    "final_answer_correct",
    "final_answer_source",
    "rounds",
    "transcript",
    "evidence_introduced",
    "injection",
    "trust_trajectory",
    "trust_for_positions",
    "trust_status",
    "verdicts",
    "manifest_hash",
)

FINAL_ANSWER_SOURCES: tuple[str, ...] = ("majority", "weighted", "single", "oracle")
TRUST_STATUSES: tuple[str, ...] = (
    "updated",
    "abstained_unanimous",
    "abstained_no_evidence",
)

TRUST_SUM_TOL = 1e-6

# Only these two fields are never defaulted (see the module docstring).
_REQUIRED_INPUTS: tuple[str, ...] = (
    "question_id",
    "arm",
    "seed",
    "gold",
    "final_answer",
    "evidence_introduced",
)

# Documented defaults for every other key. ``final_answer_correct`` is False
# until the runner scores the actual aggregation, and ``final_answer_source``
# stays empty so a caller that forgets to record provenance fails validation
# instead of inheriting a wrong label.
_DEFAULTS: dict[str, Any] = {
    "question": "",
    "options_raw": None,
    "options": None,
    "option_permutation": None,
    "gold_letter_rendered": None,
    "raw_answer": "",
    "parsed_answer": "",
    "parser_version": "",
    "final_answer_correct": False,
    "final_answer_source": "",
    "rounds": [],
    "transcript": [],
    "injection": None,
    "trust_trajectory": None,
    "trust_for_positions": None,
    "trust_status": None,
    "verdicts": [],
    "manifest_hash": None,
}

_BARE_LETTER = re.compile(r"^\(?([A-Ja-j])\)?$")

_STR_KEYS = frozenset(
    {
        "question_id",
        "arm",
        "question",
        "gold",
        "raw_answer",
        "parsed_answer",
        "parser_version",
        "final_answer",
        "final_answer_source",
    }
)
_OPTIONAL_STR_KEYS = frozenset({"gold_letter_rendered", "manifest_hash"})
_STRING_LIST_KEYS = frozenset({"options_raw", "options", "trust_status"})
_BOOL_KEYS = frozenset({"final_answer_correct", "evidence_introduced"})
_DICT_LIST_KEYS = frozenset({"rounds", "transcript", "verdicts"})


def _is_int(value: object) -> bool:
    return isinstance(value, int) and not isinstance(value, bool)


def _is_number(value: object) -> bool:
    return isinstance(value, (int, float)) and not isinstance(value, bool)


def _typename(value: object) -> str:
    return type(value).__name__


def build_record(**fields: Any) -> dict:
    """Assemble a schema-v2 record, filling documented defaults.

    ``final_answer`` and ``evidence_introduced`` have no default: the first is
    the observed aggregation output, the second is a retrieval fact. Missing
    either raises ``TypeError`` rather than writing a record that lies.
    """
    missing = [key for key in _REQUIRED_INPUTS if key not in fields]
    if missing:
        raise TypeError(f"build_record: missing required field(s): {', '.join(missing)}")

    record: dict[str, Any] = {}
    for key in REQUIRED_KEYS:
        if key in fields:
            record[key] = fields[key]
        else:
            default = _DEFAULTS[key]
            record[key] = list(default) if isinstance(default, list) else default
    # Extra keys (elapsed_s, pilot, ...) are allowed and keep their call order.
    for key, value in fields.items():
        if key not in record:
            record[key] = value
    return record


def validate_record(record: dict) -> list[str]:
    """Every schema violation in ``record`` as readable strings; empty means valid."""
    if not isinstance(record, dict):
        return ["record must be a dict"]

    errors = [f"missing key: {key}" for key in REQUIRED_KEYS if key not in record]
    for key in REQUIRED_KEYS:
        if key in record:
            errors.extend(_type_errors(key, record[key]))

    errors.extend(_semantic_errors(record))
    return errors


def _type_errors(key: str, value: object) -> list[str]:
    if key in _STR_KEYS:
        if not isinstance(value, str):
            return [f"{key}: expected str, got {_typename(value)}"]
        return []

    if key in _OPTIONAL_STR_KEYS:
        if value is not None and not isinstance(value, str):
            return [f"{key}: expected str or null, got {_typename(value)}"]
        return []

    if key in _STRING_LIST_KEYS:
        return _string_list_errors(key, value)

    if key == "option_permutation":
        if value is not None and not _is_int_list(value):
            return [f"{key}: expected list[int] or null, got {_typename(value)}"]
        return []

    if key == "seed":
        if not _is_int(value):
            return [f"{key}: expected int, got {_typename(value)}"]
        return []

    if key in _BOOL_KEYS:
        if not isinstance(value, bool):
            return [f"{key}: expected bool, got {_typename(value)}"]
        return []

    if key in _DICT_LIST_KEYS:
        if not isinstance(value, list):
            return [f"{key}: expected list[dict], got {_typename(value)}"]
        if not all(isinstance(entry, dict) for entry in value):
            return [f"{key}: every entry must be a dict"]
        return []

    if key == "injection":
        if value is not None and not isinstance(value, dict):
            return [f"{key}: expected dict or null, got {_typename(value)}"]
        return []

    if key == "trust_for_positions":
        if value is None:
            return []
        if not _is_number_list(value):
            return [f"{key}: expected list[float] or null"]
        return []

    if key == "trust_trajectory":
        if value is None:
            return []
        if not isinstance(value, list):
            return [f"{key}: expected list[list[float]] or null, got {_typename(value)}"]
        bad = [i for i, row in enumerate(value) if not _is_number_list(row)]
        if bad:
            return [f"{key}[{i}]: expected a list of numbers" for i in bad]
        return []

    return []


def _string_list_errors(name: str, value: object) -> list[str]:
    if value is None:
        return []
    if not isinstance(value, list):
        return [f"{name}: expected list[str] or null, got {_typename(value)}"]
    if not all(isinstance(entry, str) for entry in value):
        return [f"{name}: every entry must be a string"]
    return []


def _is_int_list(value: object) -> bool:
    return isinstance(value, list) and all(_is_int(entry) for entry in value)


def _is_number_list(value: object) -> bool:
    return isinstance(value, list) and all(_is_number(entry) for entry in value)


def _semantic_errors(record: dict) -> list[str]:
    errors: list[str] = []

    gold = record.get("gold")
    options_raw = record.get("options_raw")
    if isinstance(gold, str):
        stripped = gold.strip()
        if not stripped:
            errors.append("gold: empty string; store the dataset's answer text")
        elif isinstance(options_raw, list) and options_raw and _BARE_LETTER.match(stripped):
            errors.append(
                f"gold: {stripped!r} is a bare letter but options_raw is set; "
                "store option text (letters belong in gold_letter_rendered)"
            )

    final_answer = record.get("final_answer")
    if isinstance(final_answer, str) and not final_answer.strip():
        errors.append("final_answer: empty; it must be the actual aggregation output")

    source = record.get("final_answer_source")
    if isinstance(source, str) and source not in FINAL_ANSWER_SOURCES:
        errors.append(f"final_answer_source: {source!r} not in {list(FINAL_ANSWER_SOURCES)}")

    parser_version = record.get("parser_version")
    if isinstance(parser_version, str) and not parser_version.strip():
        errors.append("parser_version: empty; stamp the parser that produced parsed_answer")

    letter = record.get("gold_letter_rendered")
    if isinstance(letter, str) and letter and not _BARE_LETTER.match(letter.strip()):
        errors.append(f"gold_letter_rendered: {letter!r} is not a single A-J letter")

    permutation = record.get("option_permutation")
    options = record.get("options")
    if _is_int_list(permutation) and isinstance(options, list):
        if len(permutation) != len(options):
            errors.append(
                f"option_permutation: {len(permutation)} indices for {len(options)} rendered options"
            )
        elif sorted(permutation) != list(range(len(options))):
            errors.append("option_permutation: must contain each original index exactly once")

    errors.extend(_vector_errors("trust_for_positions", record.get("trust_for_positions")))
    trajectory = record.get("trust_trajectory")
    if isinstance(trajectory, list):
        for index, row in enumerate(trajectory):
            errors.extend(_vector_errors(f"trust_trajectory[{index}]", row))

    statuses = record.get("trust_status")
    if isinstance(statuses, list):
        unknown = [s for s in statuses if isinstance(s, str) and s not in TRUST_STATUSES]
        if unknown:
            errors.append(f"trust_status: unknown value(s) {unknown}")

    rounds = record.get("rounds")
    if isinstance(rounds, list):
        if not rounds:
            errors.append("rounds: empty; one entry per completed round is required")
        for index, entry in enumerate(rounds):
            if isinstance(entry, dict) and not isinstance(entry.get("answers"), list):
                errors.append(f"rounds[{index}]: missing 'answers' list")

    return errors


def _vector_errors(name: str, value: object) -> list[str]:
    if value is None or not isinstance(value, list):
        return []
    if not value:
        return [f"{name}: empty vector; use null when trust was not computed"]
    if not all(_is_number(weight) for weight in value):
        return [f"{name}: every weight must be a number"]

    weights = [float(weight) for weight in value]
    if not all(math.isfinite(weight) for weight in weights):
        return [f"{name}: weights must be finite"]

    errors: list[str] = []
    if any(weight < -TRUST_SUM_TOL or weight > 1 + TRUST_SUM_TOL for weight in weights):
        errors.append(f"{name}: weights must lie in [0, 1]")
    total = sum(weights)
    if abs(total - 1.0) > TRUST_SUM_TOL:
        errors.append(f"{name}: weights sum to {total:.6f}, expected 1.0")
    return errors
