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

if [ "${DRY_RUN:-0}" = "1" ]; then
  echo "DRY_RUN=1 — not launching."
  exit 0
fi

rm -f results/vllm.pids
while IFS= read -r cmd; do
  [ -z "$cmd" ] && continue
  PORT=$(printf '%s' "$cmd" | grep -oE -- '--port [0-9]+' | awk '{print $2}')
  nohup bash -c "$cmd" > "results/logs/vllm-${PORT}.log" 2>&1 &
  echo $! >> results/vllm.pids
  echo "launched :$PORT (pid $!)  log: results/logs/vllm-${PORT}.log"
done < "$CMD_FILE"

echo "All three launching (first load is slow: 3-8 min for the quantized trio)."
echo "Health: python scripts/verify_env.py --check-servers"
wait
