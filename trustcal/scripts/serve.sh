#!/usr/bin/env bash
# Launches one vLLM instance per agent (ports 8000-8002) on the shared GPU.
#
# Commands are generated from configs/models.yaml (scripts/gen_serve_cmds.py) so
# model ids, ports, quant flags and memory splits can never drift from the config.
#
#   bash scripts/serve.sh            # launch (logs: results/logs/vllm-<port>.log)
#   DRY_RUN=1 bash scripts/serve.sh  # print the commands, launch nothing
#
# If a server dies on start, check its log; the usual causes are OOM at
# --gpu-memory-utilization (lower it in models.yaml) or an unsupported flag
# for that architecture (fix extra_args there).
set -euo pipefail
cd "$(dirname "$0")/.."
export PYTHONPATH="${PYTHONPATH:+$PYTHONPATH:}$(pwd)/src"
# Prefer the project venv when present (created by setup.sh VENV=1): the generated
# `vllm` commands must resolve there, even when serve.sh runs outside `activate`.
if [ -d .venv/bin ]; then
  export PATH="$(pwd)/.venv/bin:$PATH"
fi
mkdir -p results/logs

PY_CMD=python3
if [ -x .venv/bin/python ]; then
  PY_CMD=.venv/bin/python
elif ! command -v python3 >/dev/null 2>&1; then
  PY_CMD=python
fi

CMD_FILE=$(mktemp)
trap 'rm -f "$CMD_FILE"' EXIT
"$PY_CMD" scripts/gen_serve_cmds.py --config configs/models.yaml --phase dev > "$CMD_FILE"

echo "── vLLM commands ──────────────────────────────────────────────"
cat "$CMD_FILE"
echo "───────────────────────────────────────────────────────────────"

# Locate the model cache exactly like setup.sh. Without this, vLLM falls back to
# $HOME/.cache/huggingface and RE-DOWNLOADS every checkpoint — on bandwidth-billed
# hosts (Vast: ~$0.03/GB) that silently costs more than the GPU.
if [ -z "${HF_HOME:-}" ]; then
  if [ -d /workspace ] && [ -w /workspace ]; then
    HF_HOME=/workspace/.cache/huggingface
  else
    HF_HOME="$HOME/.cache/huggingface"
  fi
fi
export HF_HOME
echo "HF_HOME=$HF_HOME"

if [ "${DRY_RUN:-0}" = "1" ]; then
  echo "DRY_RUN=1 — not launching."
  exit 0
fi

rm -f results/vllm.pids
# Sequential startup: vLLM profiles free GPU memory at init, so a sibling process
# loading concurrently makes the profile unstable (false "no KV cache memory" /
# "memory changed during profiling" errors). One server must be ready before the
# next starts.
while IFS= read -r cmd; do
  [ -z "$cmd" ] && continue
  PORT=$(printf '%s' "$cmd" | grep -oE -- '--port [0-9]+' | awk '{print $2}')
  LOG="results/logs/vllm-${PORT}.log"
  nohup bash -c "$cmd" > "$LOG" 2>&1 &
  PID=$!
  echo "$PID" >> results/vllm.pids
  echo "launched :$PORT (pid $PID) — waiting for readiness (log: $LOG)"
  READY=0
  for _ in $(seq 1 60); do
    if curl -sf -m 3 "http://localhost:${PORT}/v1/models" >/dev/null 2>&1; then READY=1; break; fi
    kill -0 "$PID" 2>/dev/null || break
    sleep 10
  done
  if [ "$READY" = "1" ]; then
    echo ":$PORT ready"
  else
    echo ":$PORT did NOT become ready — last lines of $LOG:"
    tail -5 "$LOG"
  fi
done < "$CMD_FILE"

echo "Startup pass complete. Health: python scripts/verify_env.py --check-servers"
wait
