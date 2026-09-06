#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# ONE-COMMAND POD SETUP — Phase 0 (Dev stack, RTX A6000 48GB)
#
#   git clone https://github.com/Atik203/FYDP.git /workspace/fydp
#   cd /workspace/fydp/trustcal
#   bash setup.sh
#
# Does, in order: checks Python + GPU → installs pinned deps → installs the
# trustcal package (editable) → downloads the 3 Dev models → starts vLLM on
# :8000-8002 → verifies imports, versions and server health. Done = ready.
#
# Options:  SKIP_SERVE=1 bash setup.sh   # install + download only (no servers)
#           SKIP_MODELS=1 bash setup.sh  # install only (skip model downloads)
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
  *) echo "ERROR: need Python >= 3.10, found $VER"; exit 1 ;;
esac

# ── 1) GPU present? (warning only — setup can still run on a CPU box) ───────
if command -v nvidia-smi >/dev/null 2>&1; then
  nvidia-smi --query-gpu=name,memory.total --format=csv,noheader | sed 's/^/GPU: /'
else
  echo "WARN: nvidia-smi not found — vLLM serving will fail without a GPU."
fi

# ── 2) Install all pinned deps + the package itself (one go) ────────────────
"$PY_CMD" -m pip install --upgrade pip >/dev/null
"$PY_CMD" -m pip install -r requirements.txt
"$PY_CMD" -m pip install -e . --no-deps
echo "Deps installed."

# ── 3) Model cache on the persistent volume ─────────────────────────────────
export HF_HOME="${HF_HOME:-/workspace/.cache/huggingface}"
mkdir -p "$HF_HOME" "$(pwd)/results"
echo "HF_HOME=$HF_HOME"

# ── 4) Download the three Dev models (~28GB) ────────────────────────────────
if [ "${SKIP_MODELS:-0}" != "1" ]; then
  HF_CLI=huggingface-cli
  command -v huggingface-cli >/dev/null 2>&1 || HF_CLI="$PY_CMD -m huggingface_hub.commands.huggingface_cli"
  for MODEL in Qwen/Qwen3.5-9B google/gemma-4-12B mistralai/Ministral-3-14B-Instruct-2512; do
    echo "Downloading $MODEL ..."
    $HF_CLI download "$MODEL"
  done
  echo "Models downloaded."
fi

# ── 5) Start vLLM (3 instances, ports 8000-8002) + verify ───────────────────
if [ "${SKIP_SERVE:-0}" != "1" ]; then
  echo "Starting vLLM on :8000-8002 (log: results/vllm.log) ..."
  nohup bash scripts/serve.sh > results/vllm.log 2>&1 &
  echo $! > results/vllm.pid

  # wait for the three servers (up to 6 minutes — first load is slow)
  for i in $(seq 1 36); do
    if python scripts/verify_env.py --check-servers >/dev/null 2>&1; then break; fi
    sleep 10
  done

  python scripts/verify_env.py --check-servers
  echo "== setup.sh complete — vLLM on :8000-8002, ready for Gate 0 =="
  echo "Next: python scripts/repro_mad.py --limit 10"
else
  python scripts/verify_env.py
  echo "== setup.sh complete (servers skipped) — run 'bash scripts/serve.sh' when ready =="
fi
