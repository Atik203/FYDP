"""Dataset loaders per §8. GPQA is the Phase 0 slice; HLE needs approval (apply in Phase 0)."""

from __future__ import annotations


def load_dataset(name: str, split: str = "test", sample_cap: int | None = None) -> list[dict]:
    """Return [{'question', 'answer', 'options', ...}] for one dataset.

    Phase 0: GPQA (public) via `datasets`; other loaders land in Ph 1-2.
    """
    if name != "gpqa":
        raise NotImplementedError(f"Phase 0 ships GPQA only; {name} lands in Ph 1-2")
    raise NotImplementedError("Phase 0: GPQA loader (huggingface datasets)")
