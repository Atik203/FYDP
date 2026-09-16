"""Print one `vllm serve` command per agent, derived from configs/models.yaml.

Used by scripts/serve.sh (and its DRY_RUN=1 mode) so serve flags can never drift
from the agent config. Pure text generation — no GPU, no network, no vLLM import.
"""

from __future__ import annotations

import argparse
import shlex
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from trustcal.config import load_models


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate vLLM serve commands from configs/models.yaml")
    parser.add_argument("--config", default="configs/models.yaml")
    parser.add_argument("--phase", choices=["dev", "final"], default="dev")
    args = parser.parse_args()

    cfg = load_models(args.config)
    agents = cfg.agents if args.phase == "dev" else cfg.final_agents

    for agent in agents:
        cmd = [
            "vllm", "serve", agent.model,
            "--port", str(agent.port),
            "--max-model-len", str(agent.max_model_len or cfg.max_model_len),
            "--gpu-memory-utilization",
            str(agent.gpu_memory_utilization or cfg.gpu_memory_utilization or 0.30),
            "--enforce-eager",
        ]
        if agent.quant and agent.quant.lower() not in {"auto", "none", ""}:
            cmd += ["--quantization", agent.quant]
        cmd += agent.extra_args
        print(shlex.join(cmd))


if __name__ == "__main__":
    main()
