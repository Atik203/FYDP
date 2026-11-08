"""Seeded, deterministic option rendering for multiple-choice prompts (P0-0).

The GPQA loader puts the correct answer first; MMLU-Pro keeps the dataset
order. Neither may reach a prompt: exposing the canonical order is exactly the
P0-0 bug (models answer "which of the following" without seeing shuffled
choices, or learn that A is always right). ``build_options`` shuffles with a
per-question seed derived from ``sha256(question_id:seed)`` — never ``hash()``,
which is salted per process — and returns everything the runner and scorer need
to stay consistent:

* ``options``      — the rendered order the agents see
* ``permutation``  — rendered position -> original dataset index
* ``gold_letter``  — rendered letter of the correct option (``None`` if the
  dataset answer cannot be matched to an option)
* ``block``        — the text inserted at ``{options_block}`` in every prompt

Free-form datasets (HLE, proof tasks) must not grow fabricated choices; they
get ``options=[]`` and the literal ``Answer format: free text.`` block.
"""

from __future__ import annotations

import random
import re
from dataclasses import dataclass
from hashlib import sha256
from typing import Any

CHOICE_LETTERS = "ABCDEFGHIJ"
MAX_OPTIONS = len(CHOICE_LETTERS)
FREE_TEXT_BLOCK = "Answer format: free text."
_LETTER_RE = re.compile(r"^\(?\s*([A-Ja-j])\s*\)?$")
_PUNCT = re.compile(r"[^a-z0-9]+")


@dataclass(frozen=True)
class RenderedOptions:
    """One question's rendered choices (P0 interface, §2 of 09_P0_INTERFACES)."""

    options: list[str]
    permutation: list[int]
    gold_letter: str | None
    block: str


def _stable_seed(question_id: str, seed: int) -> int:
    """Process-independent integer seed; ``hash()`` is salted and must not be used."""
    digest = sha256(f"{question_id}:{seed}".encode("utf-8")).digest()
    return int.from_bytes(digest[:8], "big")


def _normalize(text: str) -> str:
    return _PUNCT.sub(" ", str(text).lower()).strip()


def _clean_option(value: Any) -> str:
    """Collapse newlines/whitespace so one option stays one line in the block."""
    return " ".join(str(value).split())


def _gold_index(answer: Any, options: list[str]) -> int | None:
    """Dataset index of the correct option: exact text first, then a bare letter."""
    if answer is None:
        return None
    text = _clean_option(answer)
    target = _normalize(text)
    if not target:
        return None
    for index, option in enumerate(options):
        if _normalize(option) == target:
            return index
    match = _LETTER_RE.fullmatch(text)
    if match:
        index = CHOICE_LETTERS.index(match.group(1).upper())
        if index < len(options):
            return index
    return None


def build_options(question: dict, seed: int, question_id: str) -> RenderedOptions:
    """Render one question's options in a seeded order (free text when absent).

    ``question`` is the loader shape ``{'question', 'answer', 'options'}``. Only
    ``answer`` and ``options`` are read. The same ``(question_id, seed)`` always
    produces the same permutation, so a resumed run and its scorer agree.
    """
    raw = question.get("options")
    if not raw:
        return RenderedOptions(options=[], permutation=[], gold_letter=None, block=FREE_TEXT_BLOCK)

    options_raw = [_clean_option(option) for option in raw][:MAX_OPTIONS]
    rng = random.Random(_stable_seed(question_id, seed))
    # Sort-by-random rather than Random.shuffle: random() is guaranteed stable
    # across Python versions, so a resumed run re-renders the same order.
    permutation = sorted(range(len(options_raw)), key=lambda _: rng.random())
    rendered = [options_raw[index] for index in permutation]

    gold_index = _gold_index(question.get("answer"), options_raw)
    gold_letter = None
    if gold_index is not None:
        gold_letter = CHOICE_LETTERS[permutation.index(gold_index)]

    lines = [f"{CHOICE_LETTERS[i]}) {option}" for i, option in enumerate(rendered)]
    lines += ["", 'Answer with the letter of the correct option (e.g. "Answer: B").']
    return RenderedOptions(
        options=rendered,
        permutation=permutation,
        gold_letter=gold_letter,
        block="\n".join(lines),
    )
