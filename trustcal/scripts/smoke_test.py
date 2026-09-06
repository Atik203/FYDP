"""Model-swap smoke test — §13 step 11. Cheap insurance before the A100 matrix."""

from __future__ import annotations

import argparse


def main() -> None:
    parser = argparse.ArgumentParser(description="20-question smoke test on the Final model stack")
    parser.add_argument("--config", default="configs/models.yaml")
    parser.add_argument("--phase", choices=["dev", "final"], default="dev")
    parser.parse_args()
    raise NotImplementedError("Phase 2-3: claim-tag parse check, injection effect, NaNs, K=3 completion")


if __name__ == "__main__":
    main()
