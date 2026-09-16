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
| vLLM | nightly `0.29.1rc1.dev128+gcd10ed6f9` |
| transformers | 5.16.1 (pinned `<5.17`, see §8) |
| Other | openai SDK, datasets, pytest; run inside `trustcal/.venv` (`VENV=1`) |

## 4. Models served

| Agent | Checkpoint | Quant | Port | `gpu_memory_utilization` |
| --- | --- | --- | --- | --- |
| agent1 | `QuantTrio/Qwen3.5-9B-AWQ` | 4-bit AWQ (`awq_marlin`) | 8000 | 0.28 |
| agent2 | `google/gemma-4-12B-it-qat-w4a16-ct` | QAT 4-bit (compressed-tensors) | 8001 | 0.26 |
| agent3 | `cyankiwi/Ministral-3-14B-Instruct-2512-AWQ-4bit` | 4-bit AWQ | 8002 | 0.36 |

agent3 note: the official `mistralai/Ministral-3-14B-Instruct-2512` FP8 checkpoint **cannot run on Ampere** (vLLM's W8A8 sm80 kernel fails with `cutlass_scaled_mm_sm80_epilogue`). Swapped to a 4-bit AWQ quant of the *same model* — same model identity, different precision. Recorded in `trustcal/configs/models.yaml`.

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

**Formatting quirk to handle in Phase 1:** several agents emit a bare `**Answer:**` / `**Conclusion:**` line and put the actual answer on the next line. The position parser must skip formatting-only lines (fallback extraction). Cosmetic for Gate 0; affects claim/position parsing in Phase 1.

Note: raw request counts in the vLLM access logs exceeded 90 because the OpenAI SDK retried slow calls; the transcript is the source of truth.

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

1. Phase 1: injection protocol (§5.4 steps 1–6), baselines B1–B4, 50-question pilot + κ.
2. Month-1 behavioral pilot per [`trustcal/PILOT_CRITERION.md`](../../trustcal/PILOT_CRITERION.md) (fixed Go/No-Go criterion).
3. Parser hardening for the `**Answer:**` newline format noted in §7.
4. Budget: rent hosts with **free ingress** for Phase 1; expect the three-model cache (~22GB) to be re-downloaded per fresh instance unless a persistent volume is used.
