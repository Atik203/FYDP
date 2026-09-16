"""Response parsing: tagged claim extraction with a fallback pass (per §5.3)."""

from __future__ import annotations

import re

CLAIM_RE = re.compile(r'<claim id="(c\d+)">(.*?)</claim>', re.DOTALL)
ANSWER_RE = re.compile(r"(?:Answer|Final answer):\s*([^\n]+)")


def extract_claims(text: str) -> list[tuple[str, str]]:
    """Return [(claim_id, claim_text)] for every tagged claim. Unparseable → empty list."""
    return [(m.group(1), m.group(2).strip()) for m in CLAIM_RE.finditer(text)]


def parse_position(text: str) -> str:
    """Extract the agent's answer/position. Falls back to the first non-empty line.

    The answer is taken from a single line so trailing claim tags are not swallowed
    into the position (Phase 1 compares positions across rounds).
    """
    m = ANSWER_RE.search(text)
    if m:
        return m.group(1).strip()
    return next((ln.strip() for ln in text.splitlines() if ln.strip()), "")
