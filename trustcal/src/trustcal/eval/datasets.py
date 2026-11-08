"""Dataset loaders per §8 (blueprint), hardened by P0-8.

The Hugging Face releases use different column names; `_row_to_question`
normalizes them to ``{'question', 'answer', 'options'}`` so the runner and
metrics never branch on dataset. Revisions are pinned in
``configs/datasets.yaml``; ``load_dataset`` refuses to run without one unless
the caller passes an explicit commit SHA.

P0-8 rules encoded here:

* ``gold_answer`` is a first-class answer column (BrokenMath ships it).
* A ``train`` split is never used for evaluation unless the release has no
  benchmark split at all (GPQA's public repo, BrokenArXiv's only split) and the
  dataset spec records ``train_is_benchmark``. BrokenMath is loaded from its
  ``benchmark`` split.
* Rows whose answer column is present but empty are skipped and counted, never
  crashed on (BrokenArXiv is 87/87 proof with an empty ``answer``).
* ``answer_type`` is preserved (HLE's MCQ vs exact-match split).
* ``solution`` is rationale/proof text, not an answer; proof-only rows are not
  silently scored against a proof.
* Sampling is deterministic and stratified, never ``rows[:cap]``.
* ``eligible_n.json`` reports the sampled/eligible counts per stratum.
"""

from __future__ import annotations

import json
import os
import random
import re
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any, Iterable

import yaml

DATASET_CONFIG = Path(__file__).resolve().parents[3] / "configs" / "datasets.yaml"

# repo, default split, extra kwargs. Revisions live in datasets.yaml.
# ``train_is_benchmark`` records the documented exceptions where the official
# release has no split named ``benchmark``: GPQA's public repo only publishes
# its benchmark as ``train``, and BrokenArXiv's single split is its benchmark.
DATASETS: dict[str, dict[str, Any]] = {
    "gpqa": {
        "repo": "Idavidrein/gpqa",
        "config": "gpqa_diamond",
        "split": "train",
        "train_is_benchmark": True,
    },
    "gpqa_diamond": {
        "repo": "Idavidrein/gpqa",
        "config": "gpqa_diamond",
        "split": "train",
        "train_is_benchmark": True,
    },
    "gpqa_main": {
        "repo": "Idavidrein/gpqa",
        "config": "gpqa_main",
        "split": "train",
        "train_is_benchmark": True,
    },
    "gpqa_extended": {
        "repo": "Idavidrein/gpqa",
        "config": "gpqa_extended",
        "split": "train",
        "train_is_benchmark": True,
    },
    "hle": {"repo": "cais/hle", "split": "test"},
    "mmlu_pro": {"repo": "TIGER-Lab/MMLU-Pro", "split": "test"},
    "brokermath": {
        "repo": "INSAIT-Institute/BrokenMath",
        "split": "benchmark",
        "appendix_only": True,
    },
    "brokenarxiv": {
        "repo": "MathArena/brokenarxiv",
        "split": "train",
        "train_is_benchmark": True,
        "appendix_only": True,
    },
}

_QUESTION_KEYS = ("question", "Question", "problem", "problem_statement", "prompt", "input")
# `solution` is deliberately absent: it is proof/rationale text. Treating it
# as the answer is what made BrokenMath's 0% answer-type retention invisible.
_ANSWER_KEYS = ("answer", "Answer", "correct_answer", "Correct Answer", "gold_answer", "final_answer")
_OPTION_KEYS = ("options", "choices", "Options", "choices_list")
_ANSWER_TYPE_KEYS = ("answer_type", "Answer Type")
# First present field becomes the sampling stratum, coarsest first. MMLU-Pro
# has `category`, GPQA has `Subdomain`/`High-level domain`, HLE has `category`
# and `raw_subject`, BrokenMath has `question_type` (always "proof").
_STRATUM_KEYS = (
    "category",
    "Category",
    "subject",
    "Subject",
    "raw_subject",
    "Raw Subject",
    "High-level domain",
    "high_level_domain",
    "domain",
    "Domain",
    "subdomain",
    "Subdomain",
    "topic",
    "Topic",
    "field",
    "Field",
    "question_type",
    "Question Type",
)

_HEX40 = re.compile(r"^[0-9a-f]{40}$")


class EmptyAnswerError(ValueError):
    """The row has a question and an answer column, but the value is empty."""


def _first(row: dict, keys: tuple[str, ...]) -> Any:
    for key in keys:
        value = row.get(key)
        if value is None:
            continue
        if isinstance(value, str) and not value.strip():
            continue
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


def _stratum(row: dict) -> str | None:
    value = _first(row, _STRATUM_KEYS)
    if value is None:
        return None
    text = str(value).strip()
    return text or None


def _row_to_question(row: dict, name: str) -> dict:
    """Normalize one HF row; raises with the row keys when no question is found.

    ``EmptyAnswerError`` (a ``ValueError``) marks a proof-only row: the answer
    column exists but is blank. ``load_dataset`` skips those rows.
    """
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
        present = [key for key in _ANSWER_KEYS if key in row]
        if present:
            raise EmptyAnswerError(
                f"{name}: row has no answer value in {present} (keys: {sorted(row)})"
            )
        raise ValueError(f"{name}: row has no answer field (keys: {sorted(row)})")

    # MMLU-Pro ships an option index as well as the letter/text answer.
    if options and isinstance(row.get("answer_index"), int):
        index = row["answer_index"]
        if 0 <= index < len(options):
            answer = options[index]

    out = {"question": str(question), "answer": str(answer), "options": options}
    answer_type = _first(row, _ANSWER_TYPE_KEYS)
    if answer_type is not None:
        out["answer_type"] = str(answer_type)
    stratum = _stratum(row)
    out["stratum"] = stratum or "unstratified"
    return out


def _dataset_config() -> dict:
    if not DATASET_CONFIG.is_file():
        return {}
    return yaml.safe_load(DATASET_CONFIG.read_text(encoding="utf-8")) or {}


def _config_entry(name: str) -> dict:
    """YAML entry for ``name``; aliases (gpqa_main) resolve through ``repo``."""
    entries = _dataset_config().get("datasets") or {}
    if name in entries:
        return entries[name] or {}
    repo = DATASETS.get(name, {}).get("repo")
    for entry in entries.values():
        if repo and (entry or {}).get("repo") == repo:
            return entry or {}
    return {}


def revision_status(name: str) -> str:
    """``pinned`` (40-hex commit) | ``unpinned`` (explicitly allowed) | ``invalid``."""
    entry = _config_entry(name)
    revision = entry.get("revision")
    if isinstance(revision, str) and _HEX40.match(revision):
        return "pinned"
    if entry.get("revision_status") == "unpinned":
        return "unpinned"
    return "invalid"


def pinned_revision(name: str) -> str | None:
    """Pinned commit SHA from configs/datasets.yaml; ``None`` means unpinned."""
    revision = _config_entry(name).get("revision")
    return revision if isinstance(revision, str) and _HEX40.match(revision) else None


def appendix_only(name: str) -> bool:
    """True for proof-only datasets excluded from the primary matrix."""
    return bool(DATASETS.get(name, {}).get("appendix_only"))


def revision_audit() -> list[dict]:
    """One row per configured dataset: useful for the P0 gate and tests."""
    entries = _dataset_config().get("datasets") or {}
    audit: list[dict] = []
    for name in sorted(entries):
        entry = entries[name] or {}
        revision = entry.get("revision")
        status = revision_status(name)
        audit.append(
            {
                "dataset": name,
                "revision": revision,
                "status": status,
                "appendix_only": bool(entry.get("appendix_only", False)),
            }
        )
    return audit


def sampling_seed(override: int | None = None) -> int:
    """Stratified-sampling seed from datasets.yaml (``sample_seed``)."""
    if override is not None:
        return int(override)
    raw = _dataset_config()
    if raw.get("sample_seed") is not None:
        return int(raw["sample_seed"])
    seeds = raw.get("seeds") or [1]
    return int(seeds[0])


def stratified_sample(rows: list[dict], cap: int | None, *, seed: int = 1) -> list[dict]:
    """Deterministic proportional stratified sample of at most ``cap`` rows.

    Strata come from ``row['stratum']`` (set by ``_row_to_question``). Quotas are
    proportional to stratum size, allocated by largest remainder; ties break on
    stratum size then name, and the draw inside a stratum is a seeded sample of
    positions. Output preserves dataset order, so two runs with the same
    revision and seed see the same question sequence.
    """
    if cap is None or cap >= len(rows):
        return list(rows)
    if cap <= 0:
        return []

    groups: dict[str, list[int]] = defaultdict(list)
    for index, row in enumerate(rows):
        groups[str(row.get("stratum") or "unstratified")].append(index)

    keys = sorted(groups)
    total = len(rows)

    # Reserve one seat per stratum first (when the budget allows), so a tiny
    # stratum cannot vanish from a 1,000-row sample of a 12,000-row corpus.
    # Remaining seats are proportional to stratum size, largest remainder.
    if cap >= len(keys):
        alloc = {key: 1 for key in keys}
        remaining = cap - len(keys)
    else:
        alloc = {key: 0 for key in keys}
        remaining = cap
    exact = {key: remaining * len(groups[key]) / total for key in keys}
    for key in keys:
        alloc[key] += int(exact[key])
    remainder = remaining - sum(int(exact[key]) for key in keys)
    for key in sorted(keys, key=lambda k: (-(exact[k] - int(exact[k])), -len(groups[k]), k))[:remainder]:
        alloc[key] += 1

    rng = random.Random(seed)
    chosen: list[int] = []
    for key in keys:
        indices = groups[key]
        take = min(alloc.get(key, 0), len(indices))
        if take:
            # Sort draws so the RNG state advances deterministically.
            chosen.extend(indices[i] for i in sorted(rng.sample(range(len(indices)), take)))
    chosen.sort()
    return [rows[index] for index in chosen]


def eligible_counts(rows: Iterable[dict]) -> dict:
    """Total eligible rows and per-stratum counts for ``eligible_n.json``."""
    values = list(rows)
    strata = Counter(str(row.get("stratum") or "unstratified") for row in values)
    return {"n_eligible": len(values), "strata": dict(sorted(strata.items()))}


def write_eligible_n(
    rows: Iterable[dict],
    path: Path | str,
    *,
    dataset: str | None = None,
    split: str | None = None,
    revision: str | None = None,
    requested: int | None = None,
    available: int | None = None,
    skipped: int = 0,
    seed: int | None = None,
    extra: dict | None = None,
) -> Path:
    """Write ``eligible_n.json`` (a directory is expanded to that filename)."""
    target = Path(path)
    if target.suffix.lower() != ".json":
        target = target / "eligible_n.json"
    payload = {
        "dataset": dataset,
        "split": split,
        "revision": revision,
        "requested": requested,
        "n_available": available,
        "n_skipped_no_answer": skipped,
        "sample_seed": seed,
        **eligible_counts(rows),
    }
    if extra:
        payload.update(extra)
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    return target


def _normalize_rows(raw_rows: list[dict], name: str) -> tuple[list[dict], int]:
    rows: list[dict] = []
    skipped = 0
    for row in raw_rows:
        try:
            rows.append(_row_to_question(row, name))
        except EmptyAnswerError:
            skipped += 1
    return rows, skipped


def load_dataset(
    name: str = "gpqa",
    split: str | None = None,
    sample_cap: int | None = None,
    revision: str | None = None,
    *,
    seed: int | None = None,
    eligible_path: Path | str | None = None,
    allow_train: bool = False,
    stratify: bool = True,
) -> list[dict]:
    """Return ``[{'question', 'answer', 'options', 'stratum', ...}]``.

    The HF ``datasets`` package is imported lazily: trust/math tests and the
    mock pipeline never need it. An explicit ``split`` that does not exist
    falls back to the configured split (GPQA's public release only has
    ``train``), but a ``train`` split is rejected for evaluation unless the
    dataset spec records it as the release's benchmark split.

    When ``eligible_path`` is given, or ``TRUSTCAL_ELIGIBLE_DIR`` is set in the
    environment (written as ``<dir>/<dataset>/eligible_n.json``), the eligible
    counts are persisted for the P0-8 gate.
    """
    if name not in DATASETS:
        raise NotImplementedError(f"unknown dataset {name!r}; known: {sorted(DATASETS)}")

    spec = DATASETS[name]
    pinned = revision or pinned_revision(name)
    if pinned is None:
        raise ValueError(
            f"{name}: no pinned revision in configs/datasets.yaml; "
            "pin a 40-char commit SHA or pass revision= explicitly"
        )

    requested = split or spec["split"]
    train_ok = allow_train or bool(spec.get("train_is_benchmark"))
    if requested == "train" and not train_ok:
        raise ValueError(f"{name}: refusing to evaluate on the train split; use benchmark/test")

    from datasets import load_dataset as hf_load  # lazy: heavy import, pod-only

    kwargs: dict[str, Any] = {"split": requested}
    if spec.get("config"):
        kwargs["name"] = spec["config"]
    if pinned:
        kwargs["revision"] = pinned
    try:
        ds = hf_load(spec["repo"], **kwargs)
    except ValueError:
        if split is None or split == spec["split"]:
            raise
        kwargs["split"] = spec["split"]
        if kwargs["split"] == "train" and not train_ok:
            raise ValueError(f"{name}: refusing to evaluate on the train split") from None
        ds = hf_load(spec["repo"], **kwargs)
        requested = spec["split"]

    rows, skipped = _normalize_rows([dict(row) for row in ds], name)
    used_seed = sampling_seed(seed)
    sampled = stratified_sample(rows, sample_cap, seed=used_seed) if stratify else (
        rows[:sample_cap] if sample_cap else rows
    )

    target = Path(eligible_path) if eligible_path is not None else None
    if target is None:
        root = os.environ.get("TRUSTCAL_ELIGIBLE_DIR")
        if root:
            target = Path(root) / name / "eligible_n.json"
    if target is not None:
        write_eligible_n(
            sampled,
            target,
            dataset=name,
            split=requested,
            revision=pinned,
            requested=sample_cap,
            available=len(rows),
            skipped=skipped,
            seed=used_seed,
        )
    return sampled
