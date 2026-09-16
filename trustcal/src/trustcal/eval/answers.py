"""Answer normalization and matching — the scoring layer behind CCR/MPR.

Handles the three answer shapes the datasets and models produce:
  * multiple-choice — a bare letter, "(B)", "B) ...", or the full option text
  * numeric — plain numbers, scientific notation, and model-style
    ``7.3 \\times 10^{-7}`` / ``7.3 × 10^{-7}``
  * free text — normalized string equality (plus containment for long answers)

Used by the divergence filter (injection protocol step 1), by collapse scoring
(step 6), and by all baselines.
"""

from __future__ import annotations

import math
import re

CHOICE_LETTERS = "ABCDEFGH"

_EMPHASIS = re.compile(r"[*_`]")
_WS = re.compile(r"\s+")
_NUM = re.compile(r"[-+]?\d*\.?\d+(?:[eE][-+]?\d+)?")
_SCI = re.compile(r"([-+]?\d*\.?\d+)\s*(?:[×xX]|\\times)\s*10\s*\^?\s*\{?\s*([-+]?\d+)\s*\}?")
_BARE_LETTER = re.compile(r"^\(?\s*([A-Ha-h])\s*\)?$")
_LEADING_LETTER = re.compile(r"^\(?\s*([A-Ha-h])\s*[).:\-]\s*\S")

# Containment matching (e.g. gold "mitochondrial matrix" inside a longer answer)
# is only trusted above this length; short strings ("yes", "no") must be exact.
_MIN_CONTAINMENT_CHARS = 12


def normalize(text: str) -> str:
    """Lowercase, strip markdown/dollar signs, collapse whitespace and edge punctuation."""
    s = (text or "").replace("$", " ")
    s = _EMPHASIS.sub("", s)
    s = _WS.sub(" ", s).strip()
    return s.strip(" \t\r\n.,;:!?\"'()[]{}").lower()


def to_float(text: str) -> float | None:
    """First numeric value in the text, including ``a × 10^b`` scientific notation."""
    m = _SCI.search(text or "")
    if m:
        return float(m.group(1)) * (10.0 ** int(m.group(2)))
    m = _NUM.search(text or "")
    if not m:
        return None
    try:
        return float(m.group(0))
    except ValueError:
        return None


def choice_letter(text: str, options: list[str] | None = None) -> str | None:
    """Canonical MCQ letter for an answer, using the option list when available."""
    raw = _EMPHASIS.sub("", text or "").strip()
    if options:
        norm = normalize(raw)
        for i, opt in enumerate(options[: len(CHOICE_LETTERS)]):
            if norm and norm == normalize(opt):
                return CHOICE_LETTERS[i]
    m = _BARE_LETTER.match(raw)
    if m:
        return m.group(1).upper()
    # "A) ...", "(A) answer", "B. text" — short answers only, to avoid matching
    # ordinary sentences that merely start with the word "a".
    if len(raw.split()) <= 12:
        m = _LEADING_LETTER.match(raw)
        if m:
            return m.group(1).upper()
    return None


def canonical(text: str, options: list[str] | None = None) -> str:
    """Hashable canonical form used for grouping/divergence detection."""
    letter = choice_letter(text, options)
    if letter:
        return f"choice:{letter}"
    value = to_float(text)
    if value is not None:
        return f"num:{value:.6g}"
    return f"text:{normalize(text)}"


def same_answer(a: str, b: str, options: list[str] | None = None, rel_tol: float = 1e-6) -> bool:
    """True when two answer strings denote the same answer."""
    if canonical(a, options) == canonical(b, options):
        return True
    fa, fb = to_float(a), to_float(b)
    if fa is not None and fb is not None:
        return math.isclose(fa, fb, rel_tol=rel_tol, abs_tol=1e-12)
    na, nb = normalize(a), normalize(b)
    if na and nb and (na in nb or nb in na):
        return min(len(na), len(nb)) >= _MIN_CONTAINMENT_CHARS
    return False


def is_correct(position: str, gold: str, options: list[str] | None = None) -> bool:
    """Score one agent position against the dataset's gold answer."""
    return same_answer(position, gold, options)


def distinct_answers(positions: list[str], options: list[str] | None = None) -> int:
    """Number of canonical groups among agent positions (divergence = >1)."""
    return len({canonical(p, options) for p in positions})


def majority_answer(positions: list[str], options: list[str] | None = None) -> tuple[str | None, int]:
    """Most common canonical answer; ties go to the earliest position.

    Returns (answer_text, count) using the first position of the winning group.
    """
    groups: dict[str, list[int]] = {}
    for i, p in enumerate(positions):
        groups.setdefault(canonical(p, options), []).append(i)
    if not groups:
        return None, 0
    _, indices = max(groups.items(), key=lambda kv: (len(kv[1]), -kv[1][0]))
    return positions[indices[0]], len(indices)
