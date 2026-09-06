"""Dataset loaders per §8. GPQA is the Phase 0 slice; HLE needs approval (apply in Phase 0)."""

from __future__ import annotations

# HuggingFace dataset id + config name per §8 dataset.
_GPQA_SUBSETS = {
    "gpqa": "gpqa_diamond",
    "gpqa_diamond": "gpqa_diamond",
    "gpqa_main": "gpqa_main",
    "gpqa_extended": "gpqa_extended",
}


def load_dataset(name: str = "gpqa", split: str = "test", sample_cap: int | None = None) -> list[dict]:
    """Return [{'question', 'answer', 'options'}] for one dataset.

    Phase 0: GPQA (public, via huggingface `datasets`). Other loaders land in Ph 1-2.
    """
    if name not in _GPQA_SUBSETS:
        raise NotImplementedError(f"Phase 0 ships GPQA only; {name} lands in Ph 1-2")

    from datasets import load_dataset as hf_load  # lazy: heavy import, pod-only

    subset = _GPQA_SUBSETS[name]
    ds = hf_load("Idavidrein/gpqa", subset, split=split)
    rows = []
    for r in ds:
        rows.append(
            {
                "question": r["Question"],
                "answer": r["Correct Answer"],
                "options": [
                    r["Correct Answer"],
                    r["Incorrect Answer 1"],
                    r["Incorrect Answer 2"],
                    r["Incorrect Answer 3"],
                ],
            }
        )
    return rows[:sample_cap] if sample_cap else rows
