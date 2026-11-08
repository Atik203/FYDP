"""Answer normalization and matching — the scoring layer behind CCR/MPR (P0-1).

Handles the answer shapes the datasets and models produce:

  * multiple-choice — a bare letter, ``(B)``, ``B) ...``, ``The answer is B``,
    or the exact option text (A–J for MMLU-Pro)
  * numeric — plain numbers, scientific notation, and model-style
    ``7.3 \\times 10^{-7}`` / ``7.3 × 10⁻⁷`` / ``10^-4``
  * free text — normalized string equality (plus containment for long answers)

P0-1 fixes the two Gate 0 failure modes:
  * the old ``to_float`` took the *first* number anywhere in the response, so
    ``Product 3 contains 11`` became 3.0; the new reader prefers an explicit
    answer span and then the answer-bearing number in it;
  * mega/giga unit prefixes and LaTeX/Unicode scientific notation were split
    into several numbers; they are now one token.

Numeric comparison uses a documented relative tolerance of ``REL_TOL = 1e-3``
(unit suffixes are stripped, not converted: ``eV`` and ``J`` compare as
numbers, which is a known limitation recorded in WP-02).
"""

from __future__ import annotations

import math
import re
from dataclasses import dataclass

from .options import CHOICE_LETTERS, RenderedOptions

REL_TOL = 1e-3

_EMPHASIS = re.compile(r"[*_`]")
_WS = re.compile(r"\s+")
_NUM_BODY = r"(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][-+]?\d+)?"
_NUM = re.compile(r"[-+]?" + _NUM_BODY)
# a × 10^b, with the coefficient optional (bare ``10^-4``) and LaTeX/Unicode
# spellings accepted. \s* around the sign lets ``10 ^ { - 4 }`` through.
_SCI = re.compile(
    r"(?:(?P<coef>[-+]?" + _NUM_BODY + r")\s*(?:[×xX*]|\\times|\\cdot)\s*)?"
    r"10\s*\^\s*\{?\s*(?P<exp>[-+]?\d+)\s*\}?"
)
# a * b (no power of ten): gold answers such as ``2.6*1e5 GeV`` and ``6*7``.
_PRODUCT = re.compile(
    r"([-+]?" + _NUM_BODY + r")\s*[*×]\s*([-+]?" + _NUM_BODY + r")"
)

_SUPERSCRIPTS = str.maketrans("⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺", "0123456789-+")
_SUPERSCRIPT_POW = re.compile(r"10([⁻⁺]?[⁰¹²³⁴⁵⁶⁷⁸⁹]+)")

_BARE_LETTER = re.compile(r"^\(?\s*([A-Ja-j])\s*\)?$")
_LEADING_LETTER = re.compile(r"^\(?\s*([A-Ja-j])\s*[).:\-]\s*\S")
_ANSWER_IS_LETTER = re.compile(
    r"(?i:final\s+answer|answer|choice|option)\s*(?:is|:)\s*"
    r"(?:\(([A-Ja-j])\)|([A-J]))(?=\s|$|[.,;:!?])"
)
_PAREN_LETTER = re.compile(r"\(([A-Ja-j])\)")
_OPTION_WORD_LETTER = re.compile(
    r"\boption\s*\(?([A-Ja-j])\)?(?=\s|$|[.,;:])", re.IGNORECASE
)
_INLINE_CHOICE = re.compile(r"(?:^|[\s(])([A-Ja-j])\)\s")
_BARE_LETTER_LINE = re.compile(
    r"^\s*[#>*\s]*[\(\[]?\s*([A-Ja-j])\s*[\)\]]?\s*[:.)]?\s*[*#\s]*$"
)

_ANSWER_LABEL = re.compile(
    r"(?:final\s+answer|answer|conclusion)\s*:\s*\**\s*([^\n]+)", re.IGNORECASE
)
_FIRST_ANSWER_LABEL = re.compile(
    r"(?:final\s+answer|answer)\s*:\s*\**\s*([^\n]+)", re.IGNORECASE
)
_FORMATTING = re.compile(
    r"^\s*[#>*\s]*(?:final answer|answer|conclusion|result|solution|final)\s*[:\-—]*\s*[*#\s]*$",
    re.IGNORECASE,
)
# "### Answer to the Question" / "Final Answer" headers carry no content.
_HEADER = re.compile(
    r"^\s*[#>*\s]*(?:final\s+answer|answer|conclusion|result|solution|final)"
    r"\b[^:\n]{0,60}[:\s*#]*$",
    re.IGNORECASE,
)
_HEADER_VERB = re.compile(
    r"\b(?:is|are|was|were|contains|equals|gives|yields|shows)\b|=", re.IGNORECASE
)
_CONCLUSION_LINE = re.compile(
    r"^\s*[*#>\s]*(?:therefore|thus|hence|so\b|final(?:ly)?\b|in\s+conclusion|conclusion\b)",
    re.IGNORECASE,
)
# "Agent 1's claim..." / "Your final answer contains..." opens a critique, not
# the agent's own answer; scoring skips it when looking for the lead answer line.
_CRITIQUE_LINE = re.compile(
    r"^\s*[*#>\s]*(?:agent\s+\d|your\s+(?:final\s+)?answer\b)",
    re.IGNORECASE,
)

_APPROX_CUE = re.compile(
    r"(?:approximately|approx\.?|≈|\\approx|~|\babout\b)", re.IGNORECASE
)
_ANSWER_CUE = re.compile(
    r"(?i:\b(?:answer|contains|equals|gives|yields|value)\b)|\bis\b|="
)
_LABEL_WORDS = (
    "product",
    "question",
    "step",
    "option",
    "part",
    "problem",
    "figure",
    "table",
    "equation",
    "chapter",
    "section",
    "agent",
    "round",
    "attempt",
    "item",
    "case",
    "date",
    "page",
)
_LABEL_PREFIX = re.compile(
    r"(?:" + "|".join(_LABEL_WORDS) + r")\s*[#:]?\s*$", re.IGNORECASE
)

# Containment matching (e.g. gold "mitochondrial matrix" inside a longer answer)
# is only trusted above this length; short strings ("yes", "no") must be exact.
_MIN_CONTAINMENT_CHARS = 12

# A trailing unit/connector after the last number does not make gold free text.
_UNIT_WORDS = {
    "ev", "mev", "kev", "tev", "gev", "j", "kj", "mj", "gj",
    "nm", "pm", "um", "mm", "cm", "m", "km", "s", "ms", "us", "ns",
    "hz", "khz", "mhz", "ghz", "k", "mol", "mmol", "mmhg", "atm",
    "pa", "kpa", "mpa", "g", "kg", "mg", "ug", "l", "ml", "ul",
    "percent", "degree", "degrees", "rad", "radian", "radians", "c", "f",
    "ft", "lb", "lbs",
}
_CONNECTOR_WORDS = {
    "the", "a", "an", "is", "are", "answer", "final", "approximately",
    "approx", "about", "value", "of", "to", "in", "equals", "equal",
    "and", "or", "x",
}


@dataclass(frozen=True)
class Score:
    """One scored position (P0 interface, §2 of 09_P0_INTERFACES)."""

    correct: bool
    parsed: str
    kind: str  # boxed | labelled | letter | numeric | text


def normalize(text: str) -> str:
    """Lowercase, strip markdown/dollar signs, collapse whitespace and edge punctuation."""
    s = (text or "").replace("$", " ")
    s = _EMPHASIS.sub("", s)
    s = _WS.sub(" ", s).strip()
    return s.strip(" \t\r\n.,;:!?\"'()[]{}").lower()


def _expand_superscripts(text: str) -> str:
    """``10⁻⁴`` / ``10⁺³`` -> ``10^-4`` / ``10^+3`` (Unicode output of the models)."""
    def repl(match: re.Match[str]) -> str:
        return "10^" + match.group(1).translate(_SUPERSCRIPTS)

    return _SUPERSCRIPT_POW.sub(repl, text or "")


def _numeric_spans(text: str) -> list[tuple[int, int, float]]:
    """All numeric tokens with source spans; a scientific/product token is atomic."""
    t = _expand_superscripts(text)
    spans: list[tuple[int, int, float]] = []
    for match in _SCI.finditer(t):
        coefficient = float(match.group("coef")) if match.group("coef") else 1.0
        spans.append((match.start(), match.end(), coefficient * (10.0 ** int(match.group("exp")))))
    for match in _PRODUCT.finditer(t):
        if any(start <= match.start() < end for start, end, _ in spans):
            continue
        try:
            value = float(match.group(1)) * float(match.group(2))
        except ValueError:
            continue
        spans.append((match.start(), match.end(), value))
    for match in _NUM.finditer(t):
        if any(start <= match.start() < end for start, end, _ in spans):
            continue
        try:
            spans.append((match.start(), match.end(), float(match.group(0))))
        except ValueError:
            continue
    spans.sort(key=lambda item: item[0])
    return spans


def last_number(text: str) -> float | None:
    """Numeric value of the last numeric token (scientific notation is one token)."""
    spans = _numeric_spans(text)
    return spans[-1][2] if spans else None


def to_float(text: str) -> float | None:
    """Numeric value of the last token, including ``a × 10^b`` and ``10^-4``.

    The old first-number behaviour is gone: it turned ``Product 3 contains 11``
    into 3.0. Callers that need the answer-bearing number use ``score_answer``.
    """
    return last_number(text)


def _label_like(text: str, start: int) -> bool:
    prefix = text[max(0, start - 40):start]
    return bool(_LABEL_PREFIX.search(prefix.strip()))


def _coefficient_like(text: str, end: int) -> bool:
    """``10\\sigma_z`` / ``5x``: a number attached to a symbol is a coefficient."""
    return bool(re.match(r"(?:\\[A-Za-z]+|[A-Za-z])", text[end:end + 3]))


def _best_number(text: str) -> float | None:
    """Answer-bearing number in ``text``: approximation cue, answer cue, answer token.

    ``Product 3 contains 11`` -> 11 (the 3 is a label); ``7.3 × 10^-7 eV`` ->
    7.3e-7; ``-5 + 5√3/2, approximately -0.433`` -> -0.433.
    """
    spans = _numeric_spans(text)
    if not spans:
        return None
    for match in _APPROX_CUE.finditer(text):
        after = [span for span in spans if span[0] >= match.end()]
        if after:
            return after[0][2]
    for match in _ANSWER_CUE.finditer(text):
        after = [
            span for span in spans
            if span[0] >= match.end() and not _coefficient_like(text, span[1])
        ]
        if after:
            return after[0][2]
    for start, end, value in spans:
        if not _label_like(text, start) and not _coefficient_like(text, end):
            return value
    return spans[-1][2]


def _numeric_gold(text: str) -> float | None:
    """Gold value when the answer is a number plus optional units; else ``None``."""
    t = _expand_superscripts(text or "")
    spans = _numeric_spans(t)
    if not spans:
        return None
    parts: list[str] = []
    cursor = 0
    for start, end, _ in spans:
        parts.append(t[cursor:start])
        cursor = end
    parts.append(t[cursor:])
    remainder = " ".join(parts).lower()
    words = re.findall(r"[a-z]+", remainder)
    if any(word not in _UNIT_WORDS and word not in _CONNECTOR_WORDS for word in words):
        return None
    return spans[-1][2]


def _close(a: float, b: float) -> bool:
    return math.isclose(a, b, rel_tol=REL_TOL, abs_tol=1e-12)


def _fmt_number(value: float) -> str:
    return "0" if value == 0 else f"{value:.6g}"


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
    m = _ANSWER_IS_LETTER.search(raw)
    if m:
        return (m.group(1) or m.group(2)).upper()
    m = _PAREN_LETTER.search(raw)
    if m:
        return m.group(1).upper()
    m = _OPTION_WORD_LETTER.search(raw)
    if m:
        return m.group(1).upper()
    m = _INLINE_CHOICE.search(raw)
    if m:
        return m.group(1).upper()
    # "A) ...", "B. text" — short answers only, to avoid matching ordinary
    # sentences that merely start with the word "a".
    if len(raw.split()) <= 12:
        m = _LEADING_LETTER.match(raw)
        if m:
            return m.group(1).upper()
    return None


def _find_option(text: str, options: list[str]) -> int | None:
    norm = normalize(text)
    if not norm:
        return None
    for i, opt in enumerate(options):
        if norm == normalize(opt):
            return i
    return None


def _resolve_rendered_choice(text: str, rendered: RenderedOptions) -> str | None:
    """Letter of the rendered option named by ``text`` (letter, ``(B)``, or option text)."""
    if not rendered.options:
        return None
    option = _find_option(text, rendered.options)
    if option is not None:
        return CHOICE_LETTERS[option]
    norm = normalize(text)
    for i, opt in enumerate(rendered.options):
        nopt = normalize(opt)
        if len(nopt) >= 8 and nopt in norm:
            return CHOICE_LETTERS[i]
    return choice_letter(text, rendered.options)


def _text_match(parsed: str, gold: str) -> bool:
    if not parsed or not gold:
        return False
    if parsed == gold:
        return True
    if parsed in gold or gold in parsed:
        return min(len(parsed), len(gold)) >= _MIN_CONTAINMENT_CHARS
    return False


def is_header_line(line: str) -> bool:
    """True for content-free headers such as "### Final Answer (Agent 3)"."""
    stripped = (line or "").strip()
    return bool(_HEADER.match(stripped)) and not bool(_HEADER_VERB.search(stripped))


def _header_or_empty(line: str) -> bool:
    stripped = line.strip()
    return (
        not stripped
        or stripped in {"---", "***", "==="}
        or bool(_FORMATTING.match(stripped))
        or is_header_line(stripped)
    )


def extract_boxed(text: str) -> str | None:
    """Content of the first ``\\boxed{...}`` (nested braces supported)."""
    needle = r"\boxed{"
    start = (text or "").find(needle)
    while start != -1:
        index = start + len(needle)
        depth = 1
        end = index
        while end < len(text) and depth:
            if text[end] == "{":
                depth += 1
            elif text[end] == "}":
                depth -= 1
            end += 1
        if depth == 0:
            content = text[index:end - 1].strip()
            if content:
                return content
        start = text.find(needle, start + 1)
    return None


_LEAD_IN = re.compile(r"(?::|as follows\.?|given as\.?|is:)\s*$", re.IGNORECASE)


def _extend_lead_in(raw: str, match: re.Match[str], content: str) -> str:
    """A label ending in ``:`` usually puts the answer on the following lines."""
    if not _LEAD_IN.search(content):
        return content
    extra: list[str] = []
    for line in raw[match.end(1):].splitlines():
        stripped = line.strip()
        if not stripped:
            if extra:
                break
            continue
        extra.append(stripped)
        if len(extra) >= 3:
            break
    return (content + " " + " ".join(extra)).strip() if extra else content


def explicit_answer_span(text: str) -> tuple[str, str] | None:
    """First explicit answer span and its channel: boxed | labelled | letter.

    Shared with ``agents.parser.parse_position`` so the injection filter and the
    scorer agree on where the answer is. Returns ``None`` when the model gave no
    explicit marker.
    """
    raw = text or ""
    boxed = extract_boxed(raw)
    if boxed:
        return boxed, "boxed"
    for pattern in (_ANSWER_LABEL, _FIRST_ANSWER_LABEL):
        for match in pattern.finditer(raw):
            content = match.group(1).strip().strip("*").strip()
            if content and not _FORMATTING.match(content):
                return _extend_lead_in(raw, match, content), "labelled"
    match = _ANSWER_IS_LETTER.search(raw)
    if match:
        return (match.group(1) or match.group(2)).upper(), "letter"
    for line in raw.splitlines():
        stripped = line.strip()
        if not stripped:
            continue
        match = _BARE_LETTER_LINE.fullmatch(stripped)
        if match:
            return match.group(1).upper(), "letter"
    return None


def _answer_span(text: str) -> tuple[str, str]:
    """Scoring span: explicit marker, then a conclusion line, then the lead line."""
    explicit = explicit_answer_span(text)
    if explicit is not None:
        return explicit
    lines = [line.strip() for line in (text or "").splitlines() if line.strip()]
    for line in reversed(lines):
        if _header_or_empty(line):
            continue
        if _CONCLUSION_LINE.match(line) and (_NUM.search(line) or _PAREN_LETTER.search(line)):
            return line, "text"
    for line in lines:
        if not _header_or_empty(line) and not _CRITIQUE_LINE.match(line):
            return line, "text"
    for line in lines:
        if not _header_or_empty(line):
            return line, "text"
    return "", "text"


def _score_kind(channel: str, numeric: bool) -> str:
    if channel in ("boxed", "labelled", "letter"):
        return channel
    return "numeric" if numeric else "text"


def score_answer(position: str, gold_text: str, rendered: RenderedOptions | None = None) -> Score:
    """Score one raw position against gold text (and rendered options for MCQ).

    Correctness rules:
      * MCQ with ``rendered`` — resolve letter/``(B)``/option text to a rendered
        letter; correct iff that letter is ``rendered.gold_letter`` (or the
        resolved option text equals the gold text when gold could not be mapped).
      * numeric gold — compare the answer-bearing number with ``REL_TOL = 1e-3``.
      * free text — normalized equality, with containment for long answers.
    """
    text = position or ""
    gold = gold_text or ""
    span, channel = _answer_span(text)

    if rendered is not None and rendered.options:
        letter = _resolve_rendered_choice(span, rendered)
        if letter is not None:
            if rendered.gold_letter is not None:
                correct = letter == rendered.gold_letter
            else:
                index = CHOICE_LETTERS.index(letter)
                correct = index < len(rendered.options) and _text_match(
                    normalize(rendered.options[index]), normalize(gold)
                )
            return Score(correct, letter, _score_kind(channel, numeric=False))

        value = _best_number(span)
        gold_value = _numeric_gold(gold)
        if gold_value is None and rendered.gold_letter is not None:
            index = CHOICE_LETTERS.index(rendered.gold_letter)
            if index < len(rendered.options):
                gold_value = _numeric_gold(rendered.options[index])
        if value is not None and gold_value is not None:
            return Score(_close(value, gold_value), _fmt_number(value), _score_kind(channel, True))

        parsed = normalize(span)
        return Score(_text_match(parsed, normalize(gold)), parsed, _score_kind(channel, False))

    # No rendered options: a single-letter gold (e.g. GPQA's legacy "c") still
    # scores as a letter; otherwise numbers and text are compared directly.
    gold_letter = choice_letter(gold) if len(normalize(gold)) <= 2 else None
    if gold_letter is not None:
        letter = choice_letter(span)
        if letter is not None:
            return Score(letter == gold_letter, letter, _score_kind(channel, False))

    gold_value = _numeric_gold(gold)
    if gold_value is not None:
        value = _best_number(span)
        if value is not None:
            return Score(_close(value, gold_value), _fmt_number(value), _score_kind(channel, True))

    parsed = normalize(span)
    return Score(_text_match(parsed, normalize(gold)), parsed, _score_kind(channel, False))


def canonical(text: str, options: list[str] | None = None) -> str:
    """Hashable canonical form used for grouping/divergence detection."""
    letter = choice_letter(text, options)
    if letter:
        return f"choice:{letter}"
    value = _best_number(text)
    if value is not None:
        return f"num:{value:.6g}"
    return f"text:{normalize(text)}"


def same_answer(a: str, b: str, options: list[str] | None = None, rel_tol: float = 1e-6) -> bool:
    """True when two answer strings denote the same answer."""
    if canonical(a, options) == canonical(b, options):
        return True
    fa, fb = _best_number(a), _best_number(b)
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
