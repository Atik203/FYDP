#!/usr/bin/env bash
# Launches one vLLM instance per agent (ports 8000-8002) on the shared GPU.
# Dev trio ≈ 28GB at Q4/FP8 on a 48GB card — ~0.30 util per instance.
# Edit the model/quant lines here only via configs/models.yaml (keep in sync).
set -euo pipefail

cd "$(dirname "$0")/.."

vllm serve Qwen/Qwen3.5-9B \
  --port 8000 --quantization fp8 --gpu-memory-utilization 0.30 \
  --enforce-eager --dtype float16 --served-model-name agent1 &

vllm serve google/gemma-4-12B \
  --port 8001 --quantization fp8 --gpu-memory-utilization 0.30 \
  --enforce-eager --dtype float16 --served-model-name agent2 &

vllm serve mistralai/Ministral-3-14B-Instruct-2512 \
  --port 8002 --quantization fp8 --gpu-memory-utilization 0.30 \
  --enforce-eager --dtype float16 --served-model-name agent3 &

wait
