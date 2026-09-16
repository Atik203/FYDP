"""CLI: run three mock vLLM servers for local pipeline testing (no GPU).

    python scripts/mock_vllm.py --ports 8000,8001,8002 --mode divergent

Then run any pipeline command against them, e.g.:
    python scripts/run_experiment.py --arm B3 --limit 3
"""

from __future__ import annotations

import argparse
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from trustcal.mock_vllm import start_mock  # noqa: E402


def main() -> None:
    parser = argparse.ArgumentParser(description="Mock OpenAI-compatible vLLM servers")
    parser.add_argument("--ports", default="8000,8001,8002")
    parser.add_argument("--mode", choices=["agree", "divergent", "untagged"], default="divergent")
    args = parser.parse_args()

    ports = [int(p) for p in args.ports.split(",") if p.strip()]
    servers = []
    for i, port in enumerate(ports):
        servers.append(start_mock(port=port, mode=args.mode, model_name=f"mock-agent{i + 1}", is_minority=(i == 0)))
        print(f"mock agent{i + 1} on http://127.0.0.1:{port}/v1 (mode={args.mode})", flush=True)
    try:
        while True:
            time.sleep(3600)
    except KeyboardInterrupt:
        for server in servers:
            server.shutdown()


if __name__ == "__main__":
    main()
