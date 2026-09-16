"""CLI: cost-safety preflight before a paid GPU session.

    python scripts/preflight.py --offline
    # exits 0 only when servers, cache, disk, context budget, HF_TOKEN all pass
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from trustcal.preflight import format_report, run_preflight  # noqa: E402


def main() -> None:
    parser = argparse.ArgumentParser(description="Preflight checks before a paid run")
    parser.add_argument("--config", default="configs/models.yaml")
    parser.add_argument("--hf-home", default=None)
    parser.add_argument("--offline", action="store_true", help="require HF_HUB_OFFLINE=1 (cache must be complete)")
    parser.add_argument("--max-tokens", type=int, default=1024)
    args = parser.parse_args()

    results = run_preflight(
        model_config=args.config,
        hf_home=Path(args.hf_home) if args.hf_home else None,
        offline=args.offline,
        max_tokens=args.max_tokens,
    )
    print(format_report(results))
    sys.exit(0 if all(r.ok for r in results) else 1)


if __name__ == "__main__":
    main()
