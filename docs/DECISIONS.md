# Decisions

Approved architecture, hardware, and environment decisions. Add an entry before confirmatory work when a decision changes the compute path, driver, CUDA version, or serving environment.

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
