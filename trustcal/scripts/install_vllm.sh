#!/usr/bin/env bash
# install_vllm.sh — nightly vLLM, required by the Dev stack:
#   * google/gemma-4-12B-it-qat-w4a16-ct is the gemma4_unified architecture,
#     which stable vLLM cannot load (needs the nightly wheel / pinned docker image)
#   * Qwen3.5 (gated delta networks) needs vLLM >= 0.17
#
# CUDA_TAG auto-detects from the installed driver (major >= 580 -> cu130, else cu129):
#   Thunder Compute: driver 580 / CUDA 13.0  -> cu130
#   RunPod PyTorch 2.x: driver 550-570       -> cu129
# Override explicitly:  CUDA_TAG=cu129 bash scripts/install_vllm.sh
set -euo pipefail

if [ -z "${CUDA_TAG:-}" ]; then
  DRIVER_MAJOR=$(nvidia-smi --query-gpu=driver_version --format=csv,noheader 2>/dev/null | head -1 | cut -d. -f1)
  if [ -n "${DRIVER_MAJOR:-}" ] && [ "${DRIVER_MAJOR:-0}" -ge 580 ] 2>/dev/null; then
    CUDA_TAG=cu130
  else
    CUDA_TAG=cu129
  fi
  echo "Detected driver major: ${DRIVER_MAJOR:-unknown} -> ${CUDA_TAG}"
fi
echo "Installing nightly vLLM (${CUDA_TAG}) ..."

if command -v uv >/dev/null 2>&1; then
  UV_FLAGS=()
  [ -n "${VIRTUAL_ENV:-}" ] || UV_FLAGS+=(--system)
  uv pip install "${UV_FLAGS[@]}" -U vllm --pre \
    --extra-index-url "https://wheels.vllm.ai/nightly/${CUDA_TAG}" \
    --extra-index-url "https://download.pytorch.org/whl/${CUDA_TAG}" \
    --index-strategy unsafe-best-match
else
  python -m pip install -U vllm --pre \
    --extra-index-url "https://wheels.vllm.ai/nightly/${CUDA_TAG}" \
    --extra-index-url "https://download.pytorch.org/whl/${CUDA_TAG}"
fi

python -c "import vllm; print('vLLM', vllm.__version__)"
