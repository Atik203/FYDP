# trustcal — agent instructions (GPU pipeline)

Canonical agent instructions for this directory: the P0-released implementation (vLLM serving + multi-agent debate). Read with the repo-root `AGENTS.md`. Phase status lives in `../roadmap.md`; design in `../docs/blueprint.md`. Keep this file static — no dates, no run status.

## Golden rules

- **vLLM owns the GPU.** `scripts/serve.sh` is the only GPU-touching file; everything else is plain Python over the OpenAI-compatible APIs at `127.0.0.1:8000-8002`. Use `127.0.0.1`, never `localhost`: the Windows IPv6 fallback costs about 2s per request.
- **`configs/models.yaml` is the only model switch** (Dev ↔ Final). Serve commands are generated from it by `scripts/gen_serve_cmds.py` — never hand-edit commands into `serve.sh`, and never rename a served model (`--served-model-name` mismatches caused request 404s in an earlier draft).
- **Order discipline (blueprint §13 / roadmap):** 4-bit smoke → pilot → Core matrix → Full matrix; the 96 GB FP8 N1 smoke and GPQA precision replication follow the 4-bit pilot/Core. Never run a matrix before the pilot. The Core matrix is four conditions × 3 datasets × 2 seeds = 24 rows; the six-arm Full target is a separate later design.
- **The Core matrix source is `configs/experiments_fourbit.yaml`**, not `configs/datasets.yaml`. `datasets.yaml` carries dataset revisions/provenance and loader defaults; its `seeds` and `sample_caps` are not the matrix values. `configs/experiments.yaml` is the released historical Core config. Do not add the six-arm target to it; WP-18 added a separate `configs/experiments_full.yaml`.
- **`results/` is gitignored and load-bearing** (Gate 0 logs, trust trajectories, matrix summaries). Copy artifacts off the box before destroying an instance.
- **Never commit secrets.** `.env` is gitignored. `HF_TOKEN` (gated GPQA/HLE downloads), `OPENAI_API_KEY` (B7), and the optional retrieval keys come from the environment or `.env`; never paste a real key into a doc or a commit.

## Layout

| Path | Owns |
| --- | --- |
| `configs/models.yaml` | agent → checkpoint, port, quant, VRAM split, per-agent flags, Final pins |
| `configs/phase.yaml` | default phase (`dev` or `final`) when a CLI does not pass `--phase` |
| `configs/experiments.yaml` | released Core matrix: 4 conditions × 3 datasets × 2 seeds |
| `configs/experiments_full.yaml` | six-arm Full matrix; 32-row gold-evidence default / 36-row gold-answer alternate |
| `configs/datasets.yaml` | dataset revisions, splits, provenance, loader seeds/caps (not the matrix) |
| `src/trustcal/inference/` | OpenAI-compatible client, one per port; retries transient failures only |
| `src/trustcal/agents/` | prompts (`AGENT_SYSTEM`, initial/revision, injection, `trust_line`) + claim parser (+ fallback) |
| `src/trustcal/orchestrator/` | debate loop (`DebateRunner`) + injection plan (`injection.py`) + baseline strategies (`strategies.py`) |
| `src/trustcal/trust/` | pure trust math (logit accumulation → softmax → floor/ceiling simplex projection; claim-count normalized) + aggregation + `TrustState`/`TrustConfig` |
| `src/trustcal/retrieval/` | PubMed/arXiv/S2 clients, progressive retriever, verifier, reranker/verdicts |
| `src/trustcal/eval/` | datasets, answers, CCR/MPR/ECR, baselines, stats, failures, pilot, oracle, annotation/κ |
| `src/trustcal/runner.py` | resumable experiment runner (JSONL per question, metrics, summary) |
| `src/trustcal/mock_vllm.py` | stdlib mock servers for GPU-free end-to-end tests |
| `src/trustcal/preflight.py` | cost-safety checks (servers, cache, disk, context, keys) |
| `scripts/gen_serve_cmds.py` | prints `vllm serve` commands from `models.yaml` |
| `scripts/serve.sh` | launches the three servers; `DRY_RUN=1` prints commands |
| `scripts/install_vllm.sh` | nightly vLLM (required: `gemma4_unified` is not in stable) |
| `scripts/repro_mad.py` | Gate 0; writes `results/gate0/transcript-*.json` + `summary-*.md` |
| `scripts/run_experiment.py` | runs an arm (`B1`–`B10`, `pilot`, `injection`); resume + summary |
| `scripts/run_matrix.py` | conditions × datasets × seeds matrix; `--config` selects Core or Full YAML |
| `scripts/p0_gate.py` | 13-check P0 engineering gate; exits non-zero on any failure |
| `scripts/check_stack.py` | offline Final-stack weight/VRAM budget check; not a hardware proof |
| `scripts/preflight.py` | CLI for the preflight checks; `--phase final --offline` before a Final run |
| `scripts/mock_vllm.py` | CLI for the mock servers (local end-to-end runs) |
| `scripts/annotate.py` | annotation sheets + Cohen's κ for the injection gate |
| `scripts/pilot_report.py` | Month-1 PASS/AMBIGUOUS/NO-GO report |
| `scripts/analyze.py` | pooled metrics, failure taxonomy, pilot, ECR |
| `scripts/human_eval.py` | Phase 4 blinded Likert sheets + κ |
| `scripts/smoke_test.py` | model-swap smoke test; supports dev/fourbit/final phases and B8/injection/placebo/oracle paths |
| `scripts/verify_env.py` | imports/versions + `--check-servers` health gate |
| `scripts/verifier_audit.py` | verifier audit sheets + balanced accuracy/κ |

## Arms and matrix

The released Core matrix runs four conditions:

| Condition | Arm | Role |
| --- | --- | --- |
| `B3` | B3 | vanilla MAD, no retrieval |
| `B4-matched` | B4 | MAD + RAG with the same source partition as B8 (evidence control) |
| `B8-no-trust` | B8 (`use_trust: false`) | primary control; same retriever/prompts/partition as B8, majority aggregation |
| `B8` | B8 | treatment; evidence-grounded trust during debate |

The **six-arm target** adds `B8-placebo` (cross-agent round-pool verdict shuffle, trust-weighted) and `B8-oracle` (gold-evidence oracle on SciClaimBench, or gold-answer trust in the 36-row alternate). It is **not** in `experiments.yaml`. WP-18 implemented the `placebo_mode` / `oracle_mode` flags, the separate Full config, and the frozen definitions of the placebo shuffle unit/seed and the oracle semantics. `B7` is an optional 3-sample GPT-6 Luna external-answer ceiling, not `B8-oracle`. The B1-B10 appendix grid stays out of the pre-registered matrix.

`python scripts/run_matrix.py --config configs/experiments_fourbit.yaml --dry-run` shows the 24 Core rows on the 4-bit stack. `python scripts/run_matrix.py --config configs/experiments_full.yaml --dry-run` shows the Full plan: 32 rows with the gold-evidence oracle on SciClaimBench, or 36 if `B8-oracle` uses gold-answer trust. `configs/experiments_precision.yaml` is the 3-row GPQA FP8 precision replication. The Core matrix's gate cap stays 1,280 GPU-h.

## Dev stack (RTX A6000 48GB)

Quantized checkpoints pinned in `models.yaml` — the model names stay the roadmap's, the artifacts are 4-bit AWQ (Qwen), QAT w4a16 (Gemma), AWQ 4-bit (Ministral; the official FP8 checkpoint cannot run on Ampere). Nightly vLLM is mandatory; `install_vllm.sh` auto-detects the wheel index from the driver (≥580 → cu130, else cu129).

## 4-bit matrix stack (RTX A100 80GB)

`models.yaml` pins Qwen3.8-27B-AWQ-INT4 (21.0GB), Gemma-4-26B-A4B AWQ (17.2GB), and Mistral-24B-AWQ (15.06GB) at **53.3GB** total weights, with a 0.90 utilization sum and 8192-token context. This is the main Core/Full matrix stack. The offline check is:

```bash
python scripts/check_stack.py --phase fourbit
```

## Final stack (RTX PRO 6000 Blackwell 96GB)

`models.yaml` pins Qwen3.8-27B-FP8, Gemma-4-26B-A4B-FP8, and Mistral-24B-AWQ at **73.68GB** total weights, with a 0.90 utilization sum and 8192-token context. This stack is limited to the N1 smoke and the small GPQA precision replication, not the main Full matrix. The offline Final gate is:

```bash
python scripts/check_stack.py --phase final
HF_HUB_OFFLINE=1 python scripts/preflight.py --phase final --offline
```

`check_stack.py` enforces 53.26GB on the 80GB 4-bit phase and 73.68GB on the 96GB Final phase. These checks cover the config budget, cache, disk, context, and keys. They do **not** prove that vLLM loads all three checkpoints together. The 96 GB hardware smoke is a separate required gate for the FP8 precision replication:

```bash
PHASE=final bash setup.sh
python scripts/verify_env.py --check-servers
python scripts/smoke_test.py --phase final --limit 20
```

No FP8 precision replication is trusted until that hardware smoke passes and its `nvidia-smi` peak is recorded. The 4-bit main matrix has its own 5-question smoke on the 80GB A100. If a server OOMs, lower that agent's `gpu_memory_utilization` and re-run; if Mistral's `auto` quant detection fails, set `quant: compressed-tensors`.

## Commands (run from `trustcal/`)

| Command | Does |
| --- | --- |
| `HF_TOKEN=hf_... [VENV=1] bash setup.sh` | install deps + nightly vLLM + checkpoints (~31GB), start servers, verify. `VENV=1` on any image that blocks system pip (PEP 668): Thunder Compute, Vast PyTorch images |
| `python scripts/verify_env.py --check-servers` | gate: three `server OK` lines |
| `python scripts/p0_gate.py` | 13-check P0 engineering gate; exits non-zero on any failure |
| `python scripts/check_stack.py --phase fourbit` | offline 80 GB 4-bit matrix weight/utilization check |
| `python scripts/check_stack.py --phase final` | offline 96 GB Final weight/utilization check |
| `HF_HUB_OFFLINE=1 python scripts/preflight.py --phase final --offline` | Final cost-safety gate (servers, cache, disk, context, keys) |
| `python scripts/preflight.py [--offline]` | Dev/default cost-safety gate before paid runs |
| `python scripts/run_experiment.py --arm B3 --limit 10 --seed 1` | run/resume an arm (B1-B10, pilot, injection); writes `results/<arm>/<dataset>/seed<N>/` + summary |
| `python scripts/run_experiment.py --arm injection --questions-file q.json` | injection harness; add `--questions-file` to bypass the HF dataset |
| `python scripts/run_experiment.py --arm pilot --questions-file experiments/pilot-month1/questions.json` | Month-1 trust-weight pilot |
| `python scripts/run_matrix.py --config configs/experiments_fourbit.yaml --dry-run` | print the 24-row Core plan on the 4-bit stack (2 seeds) |
| `python scripts/run_matrix.py --config configs/experiments_full.yaml --dry-run` | print the Full plan (32 rows gold-evidence; 36 rows gold-answer alternate) |
| `python scripts/run_matrix.py --config configs/experiments_precision.yaml --dry-run` | print the 3-row GPQA FP8 precision replication |
| `python scripts/pilot_report.py --dir results/pilot/<dataset>/seed1` | PASS/AMBIGUOUS/NO-GO; exit 0/2/1 |
| `python scripts/analyze.py --records results/<arm>/<dataset>/seed1/records.jsonl` | pooled CCR/MPR, failures, pilot, ECR |
| `python scripts/smoke_test.py --phase fourbit --limit 5` | 4-bit matrix smoke test (B8, injection, placebo, oracle paths) |
| `python scripts/repro_mad.py --limit 10` | Gate 0; writes `results/gate0/` |
| `python scripts/mock_vllm.py --ports 8000,8001,8002 --mode divergent` | local mock servers for GPU-free end-to-end runs |
| `python scripts/annotate.py make --records <records.jsonl>` | κ annotation sheets (then `score --rater1/--rater2`, exit 2 if κ < 0.75) |
| `bash scripts/serve.sh` | (re)start servers; logs in `results/logs/vllm-<port>.log` |
| `pytest` | GPU-free tests (trust math, parser, runner, injection, mock end-to-end) |
| `python scripts/gen_serve_cmds.py --phase dev` | inspect generated serve commands |

**Local rule:** clients talk to `127.0.0.1`, never `localhost`. Before any paid session, prove the flow locally: start `mock_vllm.py` and run the arm you plan to run on the pod.

## Operating the instance

- `HF_HOME` defaults to `/workspace/.cache/huggingface` when writable, else `$HOME/.cache/huggingface` — both are on the persistent disk for the supported providers.
- A dead server shows up as a `FAIL server :<port>` line; read `results/logs/vllm-<port>.log`. OOM → lower that agent's `gpu_memory_utilization` in `models.yaml` and re-run `serve.sh`.
- GPQA/HLE are gated Hugging Face repos: downloads 401 without `HF_TOKEN`. B7 needs `OPENAI_API_KEY`.
- Vast images ship their own `AGENTS.md`/`CLAUDE.md` plus `vast-capabilities` (installed services, ports, persistence) — prefer those for machine facts.

## Managing the GPU instance from a local machine (Vast.ai)

Vast's supported agent integration is the **CLI + agent skill** (no official MCP server; third-party MCP servers exist but are not vendored here). Install the skill for opencode and other skills-framework agents:

```bash
npx --yes skills add vast-ai/vast-cli --skill vastai -g -a opencode -y
```

Key commands (see the skill for the full surface): `vastai search offers`, `vastai create instance`, `vastai show instances`, `vastai start|stop|destroy instance <id>`, `vastai ssh-url <id>`, `vastai copy`.

Vast storage rules that decide the workflow: container disk is **billed while stopped and deleted on destroy**; volumes survive but are local to one physical machine. Copy `results/` out, then destroy — `setup.sh` rebuilds in ~30–40 min.

**Bandwidth cost is a first-class filter:** check `inet_down_cost` when picking an offer (most Vast A6000 hosts bill ~$0.005–0.026/GB of ingress; sort candidates with `-o 'inet_down_cost,dph'`). Paid ingress can dominate a short setup session. `serve.sh` pins `HF_HOME` so relaunches never re-download; export `HF_HUB_OFFLINE=1` when the cache is complete. To avoid paying for the ~22GB model cache again, persist it: RunPod network volume, Thunder Compute snapshot, or a Vast volume reattached on the same physical machine. **Batch GPU work into 1–2 long sessions per phase** — provider availability (Thunder full, RunPod pricier, TensorDock/Massed higher) makes Vast the practical choice, and batching amortizes session ingress.
