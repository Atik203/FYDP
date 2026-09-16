#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# ONE-COMMAND POD SETUP — Phase 0 (Dev stack, RTX A6000 48GB)
#
#   git clone https://github.com/Atik203/FYDP.git /workspace/fydp
#   cd /workspace/fydp/trustcal
#   HF_TOKEN=hf_... bash setup.sh        # token needed for the gated GPQA dataset
#   HF_TOKEN=hf_... VENV=1 bash setup.sh # recommended when the image blocks system
#                                        # pip (PEP 668): Thunder Compute, Vast PyTorch images
#
# Does, in order: checks Python + GPU → installs pinned deps → installs nightly
# vLLM (gemma4_unified needs it) → installs trustcal editable → downloads the 3
# quantized Dev checkpoints (~31GB) → starts vLLM on :8000-8002 → verifies
# imports, versions and server health. Done = ready for Gate 0.
#
# Options:  VENV=1         create .venv and install everything into it (recommended
#                         on Thunder Compute; on RunPod the system env is fine)
#           SKIP_SERVE=1  install + download only (no servers)
#           SKIP_MODELS=1 install only (skip model downloads)
#           CUDA_TAG=cu130|cu129  override the auto-detected vLLM wheel index
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail
cd "$(dirname "$0")"

echo "== trustcal Phase 0 setup (Dev: A6000 48GB) =="

# ── 0) Python ≥ 3.10 ────────────────────────────────────────────────────────
PY_CMD=python3
command -v python3 >/dev/null 2>&1 || PY_CMD=python
command -v "$PY_CMD" >/dev/null 2>&1 || { echo "ERROR: python3 not found"; exit 1; }
VER=$("$PY_CMD" -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')
echo "Python: $VER ($("$PY_CMD" --version 2>&1))"
case "$VER" in
  3.10|3.11|3.12|3.13) ;;
  *) echo "WARN: vLLM nightly is tested on 3.10-3.13; found $VER — continuing anyway" ;;
esac

# ── 0b) Optional venv (recommended on Thunder Compute) ──────────────────────
# Thunder ships CUDA 13.0 / PyTorch 2.9 and asks you not to touch them; a venv
# keeps the nightly vLLM + torch stack isolated from the system environment.
if [ "${VENV:-0}" = "1" ]; then
  if command -v uv >/dev/null 2>&1; then
    rm -rf .venv   # recreate cleanly: uv venvs ship without pip unless --seed
    uv venv --seed .venv
  else
    "$PY_CMD" -m venv .venv
  fi
  # shellcheck disable=SC1091
  . .venv/bin/activate
  PY_CMD=python
  echo "VENV=1 — using $(pwd)/.venv ($("$PY_CMD" --version 2>&1))"
fi

# ── 1) GPU present? (warning only — setup can still run on a CPU box) ───────
if command -v nvidia-smi >/dev/null 2>&1; then
  nvidia-smi --query-gpu=name,memory.total,driver_version --format=csv,noheader | sed 's/^/GPU: /'
else
  echo "WARN: nvidia-smi not found — vLLM serving will fail without a GPU."
fi

# ── 2) Model cache on the persistent disk ───────────────────────────────────
# RunPod: /workspace network volume. Thunder: home dir is the persistent disk
# (included in snapshots), so fall back to $HOME/.cache/huggingface.
if [ -z "${HF_HOME:-}" ]; then
  if [ -d /workspace ] && [ -w /workspace ]; then
    HF_HOME=/workspace/.cache/huggingface
  else
    HF_HOME="$HOME/.cache/huggingface"
  fi
fi
export HF_HOME
mkdir -p "$HF_HOME" "$(pwd)/results"
echo "HF_HOME=$HF_HOME"
if [ -n "${HF_TOKEN:-}" ]; then
  echo "HF_TOKEN: set"
else
  echo "WARN: HF_TOKEN not set — gated downloads (GPQA dataset) will fail."
fi

# ── 3) Install pinned deps + nightly vLLM + the package itself ──────────────
"$PY_CMD" -m pip install --upgrade pip >/dev/null
"$PY_CMD" -m pip install -r requirements.txt
bash scripts/install_vllm.sh
"$PY_CMD" -m pip install -e . --no-deps
echo "Deps installed."

# ── 4) Download the three quantized Dev checkpoints (~31GB) ─────────────────
hf_download() {
  if command -v hf >/dev/null 2>&1; then
    hf download "$1"
  elif command -v huggingface-cli >/dev/null 2>&1; then
    huggingface-cli download "$1"
  else
    "$PY_CMD" -m huggingface_hub.commands.huggingface_cli download "$1"
  fi
}

if [ "${SKIP_MODELS:-0}" != "1" ]; then
  for MODEL in \
    "QuantTrio/Qwen3.5-9B-AWQ" \
    "google/gemma-4-12B-it-qat-w4a16-ct" \
    "mistralai/Ministral-3-14B-Instruct-2512"; do
    echo "Downloading $MODEL ..."
    hf_download "$MODEL"
  done
  echo "Models downloaded."
fi

# ── 5) Start vLLM (3 instances, ports 8000-8002) + verify ───────────────────
if [ "${SKIP_SERVE:-0}" != "1" ]; then
  echo "Starting vLLM on :8000-8002 (logs: results/logs/) ..."
  nohup bash scripts/serve.sh > results/vllm.log 2>&1 &
  echo $! > results/vllm.pid

  # wait for the three servers (up to 10 minutes — quantized first load is slow)
  for i in $(seq 1 60); do
    if "$PY_CMD" scripts/verify_env.py --check-servers >/dev/null 2>&1; then break; fi
    sleep 10
  done

  "$PY_CMD" scripts/verify_env.py --check-servers
  echo "== setup.sh complete — vLLM on :8000-8002, ready for Gate 0 =="
  echo "Next: python scripts/repro_mad.py --limit 10"
else
  "$PY_CMD" scripts/verify_env.py
  echo "== setup.sh complete (servers skipped) — run 'bash scripts/serve.sh' when ready =="
fi
