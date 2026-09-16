"""Response parsing: tagged claim extraction with a fallback pass (per §5.3).

Two output problems seen in Gate 0 are handled here:
  * agents emitting a bare ``**Answer:**`` / ``**Conclusion:**`` line and putting
    the real answer on the next line;
  * agents ignoring the ``<claim>`` tagging instruction entirely (Ministral did
    this in ~17% of Gate 0 generations), where a heuristic sentence split keeps
    the pipeline running instead of losing the turn.
"""

from __future__ import annotations

import re

CLAIM_RE = re.compile(r'<claim id="(c\d+)">(.*?)</claim>', re.DOTALL)

# "Answer: 42", "**Final answer:** 42", "Conclusion: ..." (content may sit on the
# next line — \s* after the colon is allowed to cross the newline).
ANSWER_RE = re.compile(r"(?:final answer|answer|conclusion)\s*:\s*\**\s*([^\n]+)", re.IGNORECASE)

# A line that is only a label ("**Answer:**", "Conclusion", "## Result:") carries
# no information and must never be returned as the position.
FORMATTING_RE = re.compile(
    r"^\s*[#>*\s]*(?:final answer|answer|conclusion|result|solution|final)\s*[:\-—]*\s*[*#\s]*$",
    re.IGNORECASE,
)

_SENT_SPLIT = re.compile(r"(?<=[.!?])\s+")

# Leading label on a content line ("**Answer:** 42") — stripped before sentence
# splitting so the label never becomes part of a claim.
_LABEL_PREFIX_RE = re.compile(
    r"^\s*[#>*\s]*(?:final answer|answer|conclusion|result|solution)\s*[:\-—]+\s*\**\s*",
    re.IGNORECASE,
)


def extract_claims(text: str) -> list[tuple[str, str]]:
    """Return [(claim_id, claim_text)] for every tagged claim. Unparseable → empty list."""
    return [(m.group(1), m.group(2).strip()) for m in CLAIM_RE.finditer(text)]


def fallback_claims(text: str, max_claims: int = 20, min_words: int = 3) -> list[tuple[str, str]]:
    """Heuristic claim extraction for untagged output (blueprint §5.3 fallback).

    Splits into sentences, drops formatting-only lines and fragments shorter than
    ``min_words``, and caps at ``max_claims``. IDs continue the ``cX`` series so
    downstream code sees a single shape either way.
    """
    lines: list[str] = []
    for ln in text.splitlines():
        s = ln.strip()
        if not s or FORMATTING_RE.match(s):
            continue
        s = _LABEL_PREFIX_RE.sub("", s, count=1).strip()
        if s:
            lines.append(s)
    out: list[tuple[str, str]] = []
    for sentence in _SENT_SPLIT.split(" ".join(lines)):
        cleaned = sentence.replace("*", "").strip()
        if len(cleaned.split()) >= min_words:
            out.append((f"c{len(out) + 1}", cleaned))
        if len(out) >= max_claims:
            break
    return out


def claims_or_fallback(text: str) -> list[tuple[str, str]]:
    """Tagged claims if the model complied with the format, heuristic sentences otherwise."""
    tagged = extract_claims(text)
    return tagged if tagged else fallback_claims(text)


def parse_position(text: str) -> str:
    """Extract the agent's answer/position.

    Order: explicit ``Answer:``-style label (content on the same or next line),
    then the first line that is not blank and not a bare formatting label.
    """
    m = ANSWER_RE.search(text)
    if m:
        answer = m.group(1).strip().strip("*").strip()
        if answer and not FORMATTING_RE.match(answer):
            return answer
    return next((s for s in (ln.strip() for ln in text.splitlines()) if s and not FORMATTING_RE.match(s)), "")
