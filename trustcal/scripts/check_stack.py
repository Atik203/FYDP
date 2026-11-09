"""Preflight the model stack budget: weights and per-instance VRAM reservations.

The 80GB limit is a conservative weight budget, not the 96GB card capacity.
The real proof is ``smoke_test.py --phase final`` on the 96GB card; this check
catches a config that cannot fit before a paid session starts.
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from trustcal.config import agents_for_phase, load_models  # noqa: E402

MAX_WEIGHTS_GB = 80.0  # conservative weight budget; the card is 96GB
MAX_UTILIZATION = 0.90 + 1e-9


def check(phase: str = "final") -> tuple[bool, list[str]]:
    cfg = load_models("configs/models.yaml")
    agents = agents_for_phase(cfg, phase)
    lines = [f"phase={phase} agents={len(agents)}"]
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
    lines.append(f"  total weights = {total_weights:.2f}GB (limit {MAX_WEIGHTS_GB:.0f}GB)")
    lines.append(f"  total utilization = {total_util:.2f} (limit {MAX_UTILIZATION:.2f})")
    ok = True
    if phase == "final":
        if missing:
            lines.append(f"  FAIL: missing weights_gb for {', '.join(missing)}")
            ok = False
        if total_weights > MAX_WEIGHTS_GB:
            lines.append("  FAIL: weight total exceeds the 80GB budget")
            ok = False
    if total_util > MAX_UTILIZATION:
        lines.append("  FAIL: gpu_memory_utilization sum exceeds 0.90")
        ok = False
    if not all(agent.revision for agent in agents) and phase == "final":
        lines.append("  FAIL: every Final agent needs a pinned revision")
        ok = False
    lines.append("  OK" if ok else "  NOT OK")
    return ok, lines


def main() -> int:
    parser = argparse.ArgumentParser(description="Check the model stack fits the GPU budget")
    parser.add_argument("--phase", choices=["dev", "final"], default="final")
    args = parser.parse_args()
    ok, lines = check(args.phase)
    print("\n".join(lines))
    return 0 if ok else 1


if __name__ == "__main__":
    raise SystemExit(main())
