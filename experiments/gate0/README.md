# Gate 0 — Vanilla MAD Reproduction

**Status: ✅ PASS** · Run date: **2026-09-16** (19:32 UTC) · Phase 0 · Blueprint §13 step 2

## Index

1. [Objective](#1-objective)
2. [Result summary](#2-result-summary)
3. [Environment and hardware](#3-environment-and-hardware)
4. [Models served](#4-models-served)
5. [Configuration used](#5-configuration-used)
6. [Process](#6-process)
7. [Measurements](#7-measurements)
8. [Issues found and fixes](#8-issues-found-and-fixes)
9. [Cost](#9-cost)
10. [Artifacts](#10-artifacts)
11. [Next steps](#11-next-steps)

---

## 1. Objective

Gate 0 (roadmap, blueprint §13 step 2): validate that the **base multi-agent debate loop works** independently of our contributions, by reproducing vanilla MAD (Du et al. 2023) on a GPQA slice.

**Pass criterion:** every debate completes all K=3 rounds and every agent returns a non-empty position. Coherence is judged from the transcripts.

## 2. Result summary

| Check | Result |
| --- | --- |
| Debates run | 10 / 10 |
| Rounds completed per debate | 3 / 3 on all 10 → **PASS** |
| Debates with empty final positions | 0 |
| Total runtime | 3708.1 s (≈ 61.8 min) |
| Mean time per debate | 370.8 s (≈ 6.2 min) |

**Gate 0 = PASS.** The base debate loop (initial positions → 2 revision rounds) is functional with three heterogeneous models served on one 48GB GPU.

## 3. Environment and hardware

| Item | Value |
| --- | --- |
| Provider | Vast.ai, instance `51232914` (Delaware, US) |
| GPU | NVIDIA RTX A6000 48GB (45GB usable), driver 555.58.02 |
| CPU / RAM / Disk | 12 vCPU / 72GB / 100GB container disk |
| OS / Python | Ubuntu 22.04 (image `pytorch/pytorch:2.11.0-cuda12.8-cudnn9-devel`) / Python 3.12.3 |
| vLLM | nightly `0.29.1rc1.dev128+gcd10ed6f9` (stable cannot load `gemma4_unified`) |
| transformers | 5.16.1 (pinned `<5.17`, see §8) |
| mistral_common | 1.11.7 (required by the Mistral 3 architecture) |
| Other | openai SDK, datasets, pytest; run inside `trustcal/.venv` (`VENV=1`) |
| Observed GPU memory | 25.8GB after two models loaded; 42.7GB during generation (all three + KV) |
| Observed GPU utilization | 33–41% during sequential generation |

## 4. Models served

| Agent | Checkpoint | Quant | Port | `gpu_memory_utilization` |
| --- | --- | --- | --- | --- |
| agent1 | `QuantTrio/Qwen3.5-9B-AWQ` | 4-bit AWQ (`awq_marlin`) | 8000 | 0.28 |
| agent2 | `google/gemma-4-12B-it-qat-w4a16-ct` | QAT 4-bit (compressed-tensors) | 8001 | 0.26 |
| agent3 | `cyankiwi/Ministral-3-14B-Instruct-2512-AWQ-4bit` | 4-bit AWQ | 8002 | 0.36 |

agent3 note: the official `mistralai/Ministral-3-14B-Instruct-2512` FP8 checkpoint **cannot run on Ampere** (vLLM's W8A8 sm80 kernel fails with `cutlass_scaled_mm_sm80_epilogue`). Swapped to a 4-bit AWQ quant of the *same model* — same model identity, different precision. Recorded in `trustcal/configs/models.yaml`.

Exact server commands (generated from `configs/models.yaml` by `scripts/gen_serve_cmds.py`, launched sequentially by `serve.sh`):

```bash
vllm serve QuantTrio/Qwen3.5-9B-AWQ --port 8000 --max-model-len 4096 \
  --gpu-memory-utilization 0.28 --enforce-eager --quantization awq_marlin \
  --reasoning-parser qwen3 --default-chat-template-kwargs '{"enable_thinking": false}' --language-model-only
vllm serve google/gemma-4-12B-it-qat-w4a16-ct --port 8001 --max-model-len 4096 \
  --gpu-memory-utilization 0.26 --enforce-eager --quantization compressed-tensors \
  --limit-mm-per-prompt '{"image": 0, "audio": 0}'
vllm serve cyankiwi/Ministral-3-14B-Instruct-2512-AWQ-4bit --port 8002 --max-model-len 4096 \
  --gpu-memory-utilization 0.36 --enforce-eager
```

## 5. Configuration used

- `rounds: 3`, `max_model_len: 4096`, `--enforce-eager` on all servers
- Servers started **sequentially** (readiness-gated), not concurrently (§8)
- `HF_HOME=/workspace/.cache/huggingface` (pinned by both `setup.sh` and `serve.sh`)
- Output cap 1024 tokens/response; peer positions truncated to 1500 chars in revision prompts
- Dataset: GPQA (`gpqa_diamond`), 10 questions, loaded via the `train` split (HF release has no `test` split)

## 6. Process

```bash
# 1. provision (one command)
HF_TOKEN=hf_... VENV=1 bash setup.sh          # deps + nightly vLLM + 3 checkpoints + servers + health check

# 2. health gate
python scripts/verify_env.py --check-servers   # → RESULT: OK — 3/3 servers healthy

# 3. Gate 0
python scripts/repro_mad.py --limit 10         # → results/gate0/{transcript,summary}-<stamp>.*
```

## 7. Measurements

Per-question timings (from `artifacts/summary-20260916T193249Z.md`):

| # | seconds | agent1 first line (truncated) |
| --- | --- | --- |
| 1 | 375.4 | The minimum required energy difference … ≈ 7.3e-7 |
| 2 | 350.1 | `**Answer:**` |
| 3 | 388.5 | Expectation value of 10σz + 5σx … |
| 4 | 385.2 | `**Answer:**` |
| 5 | 404.4 | Normalized eigenvector of P·n … |
| 6 | 383.1 | `**Answer:**` |
| 7 | 376.8 | Threshold energy for gamma rays … CMB pair production |
| 8 | 334.8 | `**Conclusion:**` |
| 9 | 348.8 | `**Answer:**` |
| 10 | 360.9 | Exoplanet with the highest density … |

### 7.1 Generation volume

| Metric | Value |
| --- | --- |
| Debates × rounds × agents | 10 × 3 × 3 = **90 generations** |
| Non-empty positions | **90 / 90** |
| Total generated text | 275,668 chars (~69K tokens) |
| Mean output length | 3,063 chars (~760 tokens) per generation |
| Output cap | 1,024 tokens (hit only by long-form answers) |

### 7.2 Per-agent output behaviour (computed from the transcript)

| Agent | Model | Generations | Mean chars | Mean `<claim>` tags | Generations with ≥1 tag |
| --- | --- | --- | --- | --- | --- |
| agent1 | Qwen3.5-9B-AWQ | 30 | 3,215 | 9.0 | 30/30 (100%) |
| agent2 | Gemma-4-12B-QAT | 30 | 2,793 | 11.3 | 30/30 (100%) |
| agent3 | Ministral-3-14B-AWQ | 30 | 3,181 | 8.3 | 25/30 (83%) |

**Phase-1 implication:** Ministral skipped claim tags in 5 of 30 generations — the fallback claim-extraction pass (§5.3) and the per-agent retry cap are not theoretical, they will be exercised from the first pilot run. Qwen and Gemma complied with tag formatting on every generation.

### 7.3 Timing distribution

| Metric | Value |
| --- | --- |
| Total | 3,708.1 s (61.8 min) |
| Mean per debate | 370.8 s |
| Fastest / slowest debate | 334.8 s / 404.4 s |
| Stdev across debates | 21.5 s (5.8%) |

Timing is dominated by ~9 sequential generations per debate (3 agents × 3 rounds), not by prompt length; per-debate cost is therefore predictable, which is what the Phase-1 budget needs.

### 7.4 Transcript schema (what the artifact contains)

`transcript-*.json` → `{gate, stamp, dataset, limit, rounds, models[], runs[]}`; each run has:
`question`, `gold_answer`, `question_index`, `elapsed_s`, `rounds_completed`, `trust_trajectory` (null in Phase 0), and `transcript[]` —
one entry per round with `{round, positions[3]}` (positions ordered agent1→agent3). Raw model text, not parsed positions, so Phase 1 can re-parse without re-running the models.

### 7.5 Known output quirks

- 17 of 90 generations (19%) open with a bare `**Answer:**` / `**Conclusion:**` line and put the real answer on the next line — the position parser must skip formatting-only lines (roadmap next step).
- Raw vLLM request counts exceeded 90 because the OpenAI SDK retried slow calls; the transcript (90) is the source of truth, not access-log counts.

## 8. Issues found and fixes

All fixes are committed to `trustcal/` (see git log 2026-09-16):

| # | Issue | Fix |
| --- | --- | --- |
| 1 | Vast PyTorch image blocks system pip (PEP 668) | `VENV=1` setup mode; uv venvs need `--seed` to include pip |
| 2 | `serve.sh` run outside the venv → `vllm: command not found` | serve.sh puts `.venv/bin` on PATH |
| 3 | Concurrent server startup → false "no KV cache memory" / "memory changed during profiling" | sequential, readiness-gated startup |
| 4 | Ministral FP8 kernel fails on Ampere | swapped agent3 to AWQ-4bit of the same model |
| 5 | transformers 5.17 renamed `PixtralRotaryEmbedding` → vLLM nightly import error | pin `transformers>=5.16,<5.17` |
| 6 | `serve.sh` relaunches lost `HF_HOME` → vLLM re-downloaded models into `$HOME/.cache` | serve.sh pins `HF_HOME` like setup.sh |
| 7 | 100GB disk filled (duplicate caches + retired FP8 model) | removed `$HOME/.cache` duplicates and the FP8 model; cache now 22GB |
| 8 | GPQA HF release has no `test` split | loader falls back to `train` |
| 9 | OpenAI SDK requires an `api_key` even for local vLLM | client passes `api_key="EMPTY"` |
| 10 | Prompt overflow: 2049 input + 2048 output > 4096 ctx | output cap 1024; peer positions truncated to 1500 chars |
| 11 | `repro_mad` output buffered under nohup (no live progress) | line-buffered stdout |

## 9. Cost

Vast.ai invoice for this session (the number that matters for planning):

| Charge | Amount (USD) |
| --- | --- |
| GPU rental (instance 51232914) | 0.896 |
| Container storage | 0.125 |
| **Download (ingress) — model/torch/image pulls** | **3.203** |
| Upload | 0.012 |
| Earlier instance (51230950, Romania) | 0.058 |
| **Total** | **≈ 4.29** |

**Lesson (already in `roadmap.md`):** this host bills ingress at ~$0.026/GB; ~96GB of pulls (image + torch/vLLM wheels + 3 models + re-downloads) dominated the bill. Future rentals: filter `inet_down_cost=0`, keep `HF_HOME` pinned, never re-download, and prefer destroying the instance after artifacts are copied out (container disk is deleted on destroy).

## 10. Artifacts

| File | What |
| --- | --- |
| [`artifacts/transcript-20260916T193249Z.json`](artifacts/transcript-20260916T193249Z.json) | Full run: 10 debates × 3 rounds × 3 agents, per-question timings, gold answers (398KB) |
| [`artifacts/summary-20260916T193249Z.md`](artifacts/summary-20260916T193249Z.md) | Pass/fail summary + per-question table, generated by `repro_mad.py` |

## 11. Next steps

### Phase 1 — injection protocol and first baselines (roadmap)

> **Status 2026-09-17:** items 6–8 below are implemented and mock-verified in the Phase 1 harness (parser fallback, retry caps, resumable JSONL runner). Items 1–5 are coded but not yet run on real GPUs — they await the paid session. See `roadmap.md` Phase 1 for the current checklist.

1. Implement §5.4 injection steps 1–6 (fabricated wrong "expert consensus" pressure at t=1→2) in `src/trustcal/orchestrator/`.
2. Baselines B1–B4 (single-agent CoT, single-agent+RAG, MAD, MAD+RAG) in `src/trustcal/eval/`.
3. 50-question pilot + κ check (κ > 0.75 target) on the injection protocol.
4. Month-1 behavioral pilot (~25 toy questions) against the fixed Go/No-Go criterion in [`trustcal/PILOT_CRITERION.md`](../../trustcal/PILOT_CRITERION.md).
5. **Gate 1:** protocol validated, baseline CCR ≥ 0.30 confirmed, pilot verdict recorded.

### Code items surfaced by this run

6. Position parser: skip formatting-only lines (`**Answer:**` / `**Conclusion:**`) — affects 19% of generations (§7.5).
7. Claim extraction: exercise the fallback path + per-agent retry for untagged generations (Ministral 5/30, §7.2).
8. `repro_mad.py`: write per-question results incrementally (JSONL) — a crash currently loses the entire run.

### Compute and budget for Phase 1

9. Rent a host with **`inet_down_cost=0`**. The ~22GB model cache is lost on destroy and must be re-downloaded per fresh instance; at this host's $0.026/GB that is ~$0.55–0.60 per session — more than the GPU time itself.
10. Estimated Phase-1 GPU: 50-question pilot at ~6.2 min/debate ≈ **5.2h ≈ $2.40** at $0.46/hr; Month-1 pilot (25 questions) ≈ **2.6h ≈ $1.20**; plus ~45 min setup per fresh instance. Budget **$5** for the phase, dominated by the two pilots, not by setup.
