#!/usr/bin/env bash
# Phase 0 bootstrap for a fresh GPU pod (Dev stack: RTX A6000 48GB).
# vLLM owns the GPU; everything else is plain Python talking to ports 8000-8002.
set -euo pipefail

cd "$(dirname "$0")"

# 1) Python deps (client + orchestrator + eval; vLLM is installed by requirements.txt).
python -m pip install -r requirements.txt

# 2) Model cache on the persistent volume so pod restarts are cheap.
export HF_HOME="${HF_HOME:-/workspace/.cache/huggingface}"

# 3) Pre-download the three Dev models (Q4/FP8, ~28GB total) before serving.
hf download Qwen/Qwen3.5-9B
hf download google/gemma-4-12B
hf download mistralai/Ministral-3-14B-Instruct-2512

# 4) Start the three vLLM instances (ports 8000-8002) in the background.
./scripts/serve.sh

echo "setup.sh complete — vLLM on :8000-8002, HF_HOME=$HF_HOME"
