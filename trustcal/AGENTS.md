# trustcal — agent instructions (GPU pipeline)

Canonical agent instructions for this directory: the Phase 0+ implementation (vLLM serving + multi-agent debate). Read with the repo-root `AGENTS.md`. Phase status lives in `../roadmap.md`; design in `../docs/blueprint.md`. Keep this file static — no dates, no run status.

## Golden rules

- **vLLM owns the GPU.** `scripts/serve.sh` is the only GPU-touching file; everything else is plain Python over the OpenAI-compatible APIs at `localhost:8000-8002`.
- **`configs/models.yaml` is the only model switch** (Dev ↔ Final). Serve commands are generated from it by `scripts/gen_serve_cmds.py` — never hand-edit commands into `serve.sh`, and never rename a served model (`--served-model-name` mismatches caused request 404s in an earlier draft).
- **Order discipline (blueprint §13):** serving → Gate 0 → injection protocol → Month-1 pilot → trust mechanism → baselines → matrix. Never reorder; never run the matrix before the pilot.
- **`results/` is gitignored and load-bearing** (Gate 0 logs, trust trajectories). Copy artifacts off the box before destroying an instance.
- **Never commit secrets.** `HF_TOKEN` comes from the environment; `.env` is gitignored.

## Layout

| Path | Owns |
| --- | --- |
| `configs/models.yaml` | agent → checkpoint, port, quant, VRAM split, per-agent flags |
| `configs/datasets.yaml` | datasets, revisions, seeds, sample caps |
| `src/trustcal/inference/` | OpenAI-compatible client, one per port |
| `src/trustcal/agents/` | prompts (`AGENT_SYSTEM`, initial/revision, injection) + claim parser |
| `src/trustcal/orchestrator/` | debate loop (`DebateRunner`); LangGraph port lands in Ph 2 |
| `src/trustcal/trust/` | pure trust math (softmax → clamp → renormalize) + aggregation |
| `src/trustcal/retrieval/` | source-partitioned RAG stubs (Ph 2) |
| `src/trustcal/eval/` | dataset loaders, CCR/MPR/ECR, baseline registry |
| `scripts/gen_serve_cmds.py` | prints `vllm serve` commands from `models.yaml` |
| `scripts/serve.sh` | launches the three servers; `DRY_RUN=1` prints commands |
| `scripts/install_vllm.sh` | nightly vLLM (required: `gemma4_unified` is not in stable) |
| `scripts/repro_mad.py` | Gate 0; writes `results/gate0/transcript-*.json` + `summary-*.md` |
| `scripts/verify_env.py` | imports/versions + `--check-servers` health gate |

## Dev stack (RTX A6000 48GB)

Quantized checkpoints pinned in `models.yaml` — the model names stay the roadmap's, the artifacts are 4-bit AWQ (Qwen), QAT w4a16 (Gemma), official FP8 (Ministral). Nightly vLLM is mandatory; `install_vllm.sh` auto-detects the wheel index from the driver (≥580 → cu130, else cu129).

## Commands (run from `trustcal/`)

| Command | Does |
| --- | --- |
| `HF_TOKEN=hf_... [VENV=1] bash setup.sh` | install deps + nightly vLLM + checkpoints (~31GB), start servers, verify. `VENV=1` on any image that blocks system pip (PEP 668): Thunder Compute, Vast PyTorch images |
| `python scripts/verify_env.py --check-servers` | gate: three `server OK` lines |
| `python scripts/repro_mad.py --limit 10` | Gate 0; writes `results/gate0/` |
| `bash scripts/serve.sh` | (re)start servers; logs in `results/logs/vllm-<port>.log` |
| `pytest` | GPU-free tests (trust math, debate-loop contract) |
| `python scripts/gen_serve_cmds.py --phase dev` | inspect generated serve commands |

## Operating the instance

- `HF_HOME` defaults to `/workspace/.cache/huggingface` when writable, else `$HOME/.cache/huggingface` — both are on the persistent disk for the supported providers.
- A dead server shows up as a `FAIL server :<port>` line; read `results/logs/vllm-<port>.log`. OOM → lower that agent's `gpu_memory_utilization` in `models.yaml` and re-run `serve.sh`.
- GPQA/HLE are gated Hugging Face repos: downloads 401 without `HF_TOKEN`.
- Vast images ship their own `AGENTS.md`/`CLAUDE.md` plus `vast-capabilities` (installed services, ports, persistence) — prefer those for machine facts.

## Managing the GPU instance from a local machine (Vast.ai)

Vast's supported agent integration is the **CLI + agent skill** (no official MCP server; third-party MCP servers exist but are not vendored here). Install the skill for opencode and other skills-framework agents:

```bash
npx --yes skills add vast-ai/vast-cli --skill vastai -g -a opencode -y
```

Key commands (see the skill for the full surface): `vastai search offers`, `vastai create instance`, `vastai show instances`, `vastai start|stop|destroy instance <id>`, `vastai ssh-url <id>`, `vastai copy`.

Vast storage rules that decide the workflow: container disk is **billed while stopped and deleted on destroy**; volumes survive but are local to one physical machine. Copy `results/` out, then destroy — `setup.sh` rebuilds in ~30–40 min.

**Bandwidth cost is a first-class filter:** check `inet_down_cost` when picking an offer. Paid ingress (~$0.03/GB) turned one 96GB setup session into a $2.49 charge. `serve.sh` pins `HF_HOME` to the setup cache so relaunches never re-download; export `HF_HUB_OFFLINE=1` when the cache is complete to forbid network access entirely.
