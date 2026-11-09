"""Preflight the model stack budget: weights and per-instance VRAM reservations.

The budget is the serving card, not a fixed number: the four-bit phase targets
80GB and the Final phase targets 96GB. The real proof is ``smoke_test.py`` on
the matching card; this check catches a config that cannot fit before a paid
session starts.
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from trustcal.config import PHASES, agents_for_phase, load_models  # noqa: E402

MODELS = Path(__file__).resolve().parents[1] / "configs" / "models.yaml"
CARD_GB = {"fourbit": 80.0, "final": 96.0}
MAX_UTILIZATION = 0.90 + 1e-9


def check(phase: str = "final") -> tuple[bool, list[str]]:
    cfg = load_models(MODELS)
    agents = agents_for_phase(cfg, phase)
    card_gb = CARD_GB.get(phase)
    header = f"phase={phase} agents={len(agents)}"
    if card_gb is not None:
        header += f" card={card_gb:.0f}GB"
    lines = [header]
    total_weights = 0.0
    total_util = 0.0
    missing = []
    for agent in agents:
        weight = agent.weights_gb
        util = agent.gpu_memory_utilization or 0.0
        total_weights += weight or 0.0
        total_util += util
        if weight is None:
            missing.append(agent.role)
        lines.append(
            f"  {agent.role:<7} {agent.model:<55} "
            f"weights={weight if weight is not None else '?'}GB util={util:.2f}"
        )
    lines.append(f"  total weights = {total_weights:.2f}GB")
    lines.append(f"  total utilization = {total_util:.2f} (limit {MAX_UTILIZATION:.2f})")
    ok = True
    if card_gb is not None:
        lines.append(f"  weight budget = {card_gb:.0f}GB (serving card)")
        if missing:
            lines.append(f"  FAIL: missing weights_gb for {', '.join(missing)}")
            ok = False
        if total_weights > card_gb:
            lines.append(f"  FAIL: weight total exceeds the {card_gb:.0f}GB card")
            ok = False
        kv_headroom = card_gb * total_util - total_weights
        lines.append(
            f"  KV headroom = {kv_headroom:.2f}GB "
            f"(card {card_gb:.0f}GB x {total_util:.2f} - weights)"
        )
        if kv_headroom <= 0:
            lines.append("  FAIL: no KV cache headroom left")
            ok = False
        if not all(agent.revision for agent in agents):
            lines.append("  FAIL: every non-dev agent needs a pinned revision")
            ok = False
    if total_util > MAX_UTILIZATION:
        lines.append("  FAIL: gpu_memory_utilization sum exceeds 0.90")
        ok = False
    lines.append("  OK" if ok else "  NOT OK")
    return ok, lines


def main() -> int:
    parser = argparse.ArgumentParser(description="Check the model stack fits the GPU budget")
    parser.add_argument("--phase", choices=PHASES, default="final")
    args = parser.parse_args()
    ok, lines = check(args.phase)
    print("\n".join(lines))
    return 0 if ok else 1


if __name__ == "__main__":
    raise SystemExit(main())
