"""Dataset loaders per §8 (blueprint). All five primary datasets share one shape.

The Hugging Face releases use different column names; `_row_to_question`
normalizes them to ``{'question', 'answer', 'options'}`` so the runner and
metrics never branch on dataset. Revisions are pinned in configs/datasets.yaml;
pass ``revision=`` to freeze a run once the Phase 0 hashes are recorded.
"""

from __future__ import annotations

from pathlib import Path
from typing import Any

import yaml

DATASET_CONFIG = Path(__file__).resolve().parents[3] / "configs" / "datasets.yaml"

# repo, default split, extra kwargs. Revisions are intentionally left to the
# caller/config: a moving "main" must be pinned before the first real run.
DATASETS: dict[str, dict[str, Any]] = {
    "gpqa": {"repo": "Idavidrein/gpqa", "config": "gpqa_diamond", "split": "train"},
    "gpqa_diamond": {"repo": "Idavidrein/gpqa", "config": "gpqa_diamond", "split": "train"},
    "gpqa_main": {"repo": "Idavidrein/gpqa", "config": "gpqa_main", "split": "train"},
    "gpqa_extended": {"repo": "Idavidrein/gpqa", "config": "gpqa_extended", "split": "train"},
    "hle": {"repo": "cais/hle", "split": "test"},
    "mmlu_pro": {"repo": "TIGER-Lab/MMLU-Pro", "split": "test"},
    "brokermath": {"repo": "INSAIT-Institute/BrokenMath", "split": "train"},
    "brokenarxiv": {"repo": "MathArena/brokenarxiv", "split": "train"},
}

_QUESTION_KEYS = ("question", "Question", "problem", "problem_statement", "prompt", "input")
_ANSWER_KEYS = ("answer", "Answer", "correct_answer", "Correct Answer", "final_answer", "solution")
_OPTION_KEYS = ("options", "choices", "Options", "choices_list")


def _first(row: dict, keys: tuple[str, ...]) -> Any:
    for key in keys:
        value = row.get(key)
        if value not in (None, ""):
            return value
    return None


def _options(value: Any) -> list[str] | None:
    if value is None:
        return None
    if isinstance(value, dict):
        return [str(value[key]) for key in sorted(value)]
    if isinstance(value, (list, tuple)):
        return [str(v) for v in value]
    return None


def _row_to_question(row: dict, name: str) -> dict:
    """Normalize one HF row; raises with the row keys when no question is found."""
    question = _first(row, _QUESTION_KEYS)
    answer = _first(row, _ANSWER_KEYS)
    options = _options(_first(row, _OPTION_KEYS))
    if name.startswith("gpqa") and row.get("Incorrect Answer 1") is not None:
        options = [
            str(row.get("Correct Answer", "")),
            str(row.get("Incorrect Answer 1", "")),
            str(row.get("Incorrect Answer 2", "")),
            str(row.get("Incorrect Answer 3", "")),
        ]

    if question is None:
        raise ValueError(f"{name}: row has no question field (keys: {sorted(row)})")
    if answer is None:
        raise ValueError(f"{name}: row has no answer field (keys: {sorted(row)})")

    # MMLU-Pro ships an option index as well as the letter/text answer.
    if options and isinstance(row.get("answer_index"), int):
        index = row["answer_index"]
        if 0 <= index < len(options):
            answer = options[index]

    return {"question": str(question), "answer": str(answer), "options": options}


def pinned_revision(name: str) -> str | None:
    """Revision from configs/datasets.yaml; ``main`` means not yet pinned."""
    if not DATASET_CONFIG.is_file():
        return None
    raw = yaml.safe_load(DATASET_CONFIG.read_text(encoding="utf-8")) or {}
    spec = (raw.get("datasets") or {}).get(name) or {}
    revision = spec.get("revision")
    return revision if revision and revision != "main" else None


def load_dataset(
    name: str = "gpqa",
    split: str | None = None,
    sample_cap: int | None = None,
    revision: str | None = None,
) -> list[dict]:
    """Return ``[{'question', 'answer', 'options'}]`` for one dataset.

    The HF ``datasets`` package is imported lazily: trust/math tests and the
    mock pipeline never need it. GPQA's public release only has a train split,
    so a missing requested split falls back to the configured default.
    """
    if name not in DATASETS:
        raise NotImplementedError(f"unknown dataset {name!r}; known: {sorted(DATASETS)}")

    from datasets import load_dataset as hf_load  # lazy: heavy import, pod-only

    spec = DATASETS[name]
    kwargs: dict[str, Any] = {"split": split or spec["split"]}
    if spec.get("config"):
        kwargs["name"] = spec["config"]
    pinned = revision or pinned_revision(name)
    if pinned:
        kwargs["revision"] = pinned
    try:
        ds = hf_load(spec["repo"], **kwargs)
    except ValueError:
        if split is None:
            raise
        kwargs["split"] = spec["split"]
        ds = hf_load(spec["repo"], **kwargs)

    rows = [_row_to_question(dict(row), name) for row in ds]
    return rows[:sample_cap] if sample_cap else rows
