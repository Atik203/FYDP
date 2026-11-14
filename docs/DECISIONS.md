# Decisions

Approved architecture, hardware, and environment decisions. Add an entry before confirmatory work when a decision changes the compute path, driver, CUDA version, or serving environment.

## 2026-11-14 — Dev-slice validation before cloud runs

**Status:** approved.

**Decision:** use the 18 GB `uiu-h200` slice for single-model development checks before paying for cloud GPU time. Run one dev model at a time; use `mock_vllm.py` for the three-agent flow. Finalize prompts, parser, answer rendering, serving flags, manifest/resume, and the retrieval/verifier path before the cloud smoke.

**What it can validate:** each dev model loads; the chat template and output format work; the parser and option renderer work; one real agent can run against two mock agents; the retrieval/verifier path works; configs, hashes, and resume logic are stable.

**What it cannot validate:** three real models at once, KV-cache pressure on the final stack, FP8 serving, final-model behavior, or the cloud hardware-smoke gate.

**Expected effect:** the matrix GPU-hours do not change; the free slice reduces avoidable cloud debugging and retry overhead. Planning offset is **$20–50 direct**, with additional risk avoidance if it prevents a failed Core/Full rerun. The **$500–600** planning range and **$600** hard stop remain unchanged until actual invoices replace the estimate.

## 2026-11-14 — University H200 MIG access

**Status:** approved for development and interface checks only; not approved for the confirmatory matrix.

**Hardware:** H200 MIG `1g.18gb`, 18 GB VRAM, driver `580.178.04`, CUDA `13.5`.

**Access:** SSH through the local alias `uiu-h200` only. Do not expose ports or create another connection method.

**Decision:** use the slice for single small-model interface, prompt, parser, and retrieval checks. Do not schedule the 24-row Core matrix, the 32/36-row Full matrix, the three-model smoke, or the FP8 precision replication on it.

**Why:** the approved stacks do not fit in 18 GB:

| Stack | Weights | Fits 18 GB? |
| --- | ---: | --- |
| `fourbit` main matrix | 53.26 GB | No |
| `final` FP8 precision | 73.68 GB | No |
| `dev` three-model trio | ~25 GB | No |
| Single Qwen3.8-27B-AWQ-INT4 | 21.0 GB | No, before KV cache |
| Single Gemma 4 26B-A4B AWQ | 17.2 GB | No practical headroom for KV cache |
| Single Mistral 24B AWQ | 15.06 GB | One server only; not the three-agent design |

**Consequences:** the planned Core/Full and precision runs still require the approved 80 GB A100 and 96 GB FP8 paths in `docs/agent/08_COMPUTE_COST.md`. The university slice does not change the budget, the matrix, or the hardware-smoke gate.

**Rules:** no changes to clocks, power limits, MIG settings, the SSH daemon, host keys, the account name, the login method, or other users' `authorized_keys`; no system-wide packages or `sudo` without administrator approval; keep storage under 200 GB; use `tmux` or `screen`; stop idle jobs; never commit a server address, hostname, username, account ID, password, SSH key, or host fingerprint.

**Allowed identifiers:** `uiu-h200`, `H200 1g.18gb`, driver `580.178.04`, CUDA `13.5`.
