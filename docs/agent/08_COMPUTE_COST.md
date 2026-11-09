# 08 — Compute Cost (Vast.ai Spot Market)

**Price snapshot:** 8 November 2026, 16:36 UTC. **CLI:** `vastai 1.7.0`. **Plan refreshed:** 9 November 2026.

> **Prices are volatile — re-run the queries before renting.** The **budget caps below are authoritative**; the per-hour observations are a dated snapshot, not a quote.

**Sources:** `https://console.vast.ai/api/v0/bundles/`, `https://cloud.vast.ai/create/`, Vast.ai CLI `search offers` output, Vast.ai volume/storage docs. Every price below is a real CLI observation from 8 Nov 2026, not an old estimate.

This file replaces the old `$0.40–0.60/hr` and `$1.10–2.70/hr` assumptions. It includes **GPU, bandwidth up/down, storage, and interruption overhead**.

---

## 1. How the prices were obtained

```bash
vastai search offers 'gpu_name=RTX_A6000 num_gpus=1 rentable=true reliability>0.98' -i --limit 40 --storage 80 --raw
vastai search offers 'gpu_name=RTX_4090 num_gpus=1 rentable=true' -i --limit 40 --storage 80 --raw
vastai search offers 'gpu_name=RTX_PRO_6000_S num_gpus=1 rentable=true' -i --limit 40 --storage 100 --raw
vastai search offers 'gpu_name=RTX_PRO_6000_WS num_gpus=1 rentable=true' -i --limit 40 --storage 100 --raw
vastai search offers 'gpu_name=RTX_PRO_6000_Max-Q num_gpus=1 rentable=true' -i --limit 40 --storage 100 --raw
vastai search offers 'gpu_name=L40S num_gpus=1 rentable=true' -i --limit 40 --storage 100 --raw
vastai search offers 'gpu_name=A100_PCIE num_gpus=1 rentable=true' -i --limit 40 --storage 80 --raw
```

- `-i` = interruptible/spot (`type=bid`).
- `--storage N` = N GiB instance disk; `dph_total` includes GPU + that disk.
- `inet_up_cost` / `inet_down_cost` = **USD per GB**.
- `storage_cost` = **USD per GB per month**; `dph_total` already includes the requested GiB.
- Vast bills **per second**; there is no hourly minimum.
- Snapshots are registry-side; Vast charges no separate snapshot storage, but registry storage/egress applies.

---

## 2. Spot price table (8 November 2026)

| GPU | VRAM | Spot p10 | **Spot median** | Spot p90 | On-demand median | Up $/GB | Down $/GB | Storage $/GB/mo | Reliability | Offers |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| RTX A6000 | 48 GB | $0.156 | **$0.263** | $0.370 | $0.526 | 0.00529 | 0.00462 | 0.233 | 0.9945 | 2 at 80 GiB |
| RTX 4090 | 24 GB | $0.308 | **$0.409** | $0.639 | $0.508 | 0.01042 | 0.01121 | 0.297 | 0.9948 | 40 |
| RTX PRO 6000 S | 96 GB | $0.871 | **$1.432** | $1.676 | $1.789 | 0.00400 | 0.00264 | 0.267 | 0.9940 | 14 |
| RTX PRO 6000 WS | 96 GB | $0.573 | **$1.245** | $1.907 | $1.693 | 0.00526 | 0.00521 | 0.333 | 0.9896 | 18 |
| RTX PRO 6000 Max-Q | 96 GB | $0.601 | **$0.740–1.017** | $1.565 | $1.709 | 0.02604 | 0.02604 | 0.300 | 0.9936 | 12 |
| L40S | 48 GB | $0.554 | **$0.561** | $0.561 | $0.819 | 0.00391 | 0.00260 | 0.200 | 0.986 | 3 |
| A100 80 GB | 80 GB | $0.494 | **$0.748** | $1.001 | $1.193 | 0.00391 | 0.00260 | 0.200 | 0.996 | 2 |
| A100 PCIE 40 GB | 40 GB | $0.405 | **$0.428** | $0.700 | — | 0.00391 | 0.00391 | 0.200 | 0.996 | 3 |

**Price observations (8 Nov 2026; historical, not the current plan):**

1. **Use 80 GiB, not 100 GiB, for the Dev instance.** At 80 GiB and `reliability>0.98`, A6000 spot offers were **$0.156** and **$0.370**, median **$0.263**. At 100 GiB, only **one** offer remained: **$0.384, reliability 0.796** — a bad host. 80 GiB fits the 22 GB Dev cache + 20 GB results + OS.
2. **A6000 median is $0.263/hr, not $0.382/hr.**
3. **Full law-testing at 8 min/debate is 3,813 GPU-h, not 2,860.** The 2,860 figure is a **6-min** number. Label 2,860 "6 min/debate, optimistic." At 8 min, 2,860 × 8/6 = 3,813 GPU-h; with 20% overhead, 4,576 GPU-h.
4. **Vast volume storage is $0.20/GB-month median, not $0.07.** Vast volumes are local-only and cannot move between hosts. $0.07 is RunPod network storage. `160 GB × $0.20 × 6 months = $192`, not $67.
5. **Max-Q is the cheapest 96 GB option, not a trap.** At $1.017 vs S $1.432, Max-Q saves **$0.415/hr**. Its $0.026/GB bandwidth penalty is only **~$3.7 per 150 GB download**. Break-even is ~11 fresh sessions per 100 GPU-h, or a ~40% slowdown. With a persistent cache, Max-Q is the best value; choose S only for reliability.
6. **Final replication is ~60 GPU-h base, 100 high.** The current final-stack smoke budget is 60–100 GPU-h / $80–120.
7. **A100 SXM4 "60 GB" is not a standard SKU.** A100 80 GB is $0.494–1.001 (2 offers, median $0.748); A100 PCIE 80 GB had 0 offers; A100 PCIE 40 GB at $0.428 is a **40 GB Dev fallback**, not the 80 GB Final fallback.
8. **Gate 0 ingress was $3.20/96 GB = $0.0333/GB**, not $0.026/GB. Use $0.033/GB for the high-bandwidth scenario.

---

## 3. Current budget model (9 November 2026)

### Final stack

- **Pinned:** Qwen3.6-27B-FP8, Gemma-4-26B-A4B-FP8, Mistral-24B-AWQ — **69.73 GB total**.
- **Hardware:** **one** 96 GB GPU (RTX PRO 6000 Max-Q or S). The offline check passes; the **96 GB hardware smoke has NOT run**.
- **Smoke:** `PHASE=final bash setup.sh`; `python scripts/verify_env.py --check-servers`; `python scripts/check_stack.py --phase final`; `HF_HUB_OFFLINE=1 python scripts/preflight.py --phase final --offline`; `python scripts/smoke_test.py --phase final --limit 20`.
- **Budget:** 60–100 GPU-h, **$80–120**.

### Scenarios (authoritative caps)

| Scenario | GPU-h | Cash | Notes |
|---|---:|---:|---|
| Final-stack 96 GB smoke (N1) | 60–100 | **$80–120** | Not run; do not start Full without PASS |
| Pilot (N5/G2) | ~112 | **$50–100** | Dev stack; 100–150 questions |
| **Core run** (G3) | **1,280 cap** (~1,067 planned) | **$420–580** | 4 conditions × GPQA 400 + MMLU-Pro 400 + HLE 200 × 2 seeds = 24 runs / 8,000 debates |
| **Full run** (G4/G5) | **1,440 envelope** | **$900–1,200 envelope** | Conditional: 36 runs if B8-oracle uses gold-answer trust at 300/dataset (10,800 debates); 32 runs and recompute if gold-evidence-only on EG-SSS. WP-18 freezes. Core and Full are different stacks (Dev vs Final); do not assume Core cells are reusable. The $900–1,200 is the Full-run budget envelope. Compute a true top-up only if the stack and model revisions match. |
| B7 external-answer ceiling (optional) | 0 GPU-h | ~$3–9 per 1,000 questions | OpenAI GPT-6 Luna, 3 samples/question; mean single-call accuracy + question CI + 3-sample majority; appendix-only, not in Core/Full; recompute from actual tokens |
| Law-testing (N9) | 8-min basis | **$1,400–1,900** | **Only if the Core/Full effect is real** |
| Benchmark/human storage (no GPU) | 0 | $30–120 | Annotation/volume costs |

**Hard stop: $1,350 before law-testing.** If the effect is absent, do not start law-testing. Do not treat the Full envelope as additive or reusable across stacks; compute a true top-up only if the stack and model revisions match.

### Formulas

\[
\text{GPU cost} = \text{GPU hours} \times \text{dph}_{80\text{–}100}
\]

\[
\text{Bandwidth cost} = \text{GB up} \times c_{\text{up}} + \text{GB down} \times c_{\text{down}}
\]

\[
\text{Storage cost} = \text{GiB} \times c_{\text{storage}} \times \text{months}
\]

\[
\text{Total} = (\text{GPU} + \text{Bandwidth} + \text{Storage}) \times (1 + \text{overhead})
\]

### Assumptions

- **Dev:** A6000 48 GB spot, **$0.263/hr** median at 80 GiB; 22 GB cache; 2–3 sessions.
- **Final:** one 96 GB GPU; **Max-Q $0.74–1.02/hr** best value; **S $1.432/hr** for reliability; 100–160 GB cache; 200 GiB disk; **60–100 GPU-h**.
- **Bandwidth:** 22 GB Dev / 150 GB Final per fresh download; $0.004–0.011/GB typical; $0.026–0.033/GB high; 150 GB × $0.026 = $3.90.
- **Storage:** **$0.20/GB-month median** on a Vast volume; 160 GB × 6 months = **$192**; 200 GB ≈ **$40/month**.
- **Overhead:** 15% low, 20% base, 25% high for setup, retries, spot interruptions, checkpoint/restart.
- **Debate time:** 8 min with retrieval/trust; 10–12 min on the final stack.

---

## 4. Recommendation

### Dev stack

- **GPU:** RTX A6000 48 GB spot, **$0.263/hr median at 80 GiB**, reliability ≥0.98.
- **Why:** 48 GB fits the three 4-bit models without swaps; 4090 24 GB needs model swaps.
- **Fallback:** L40S 48 GB at ~$0.56/hr or A100 PCIE 40 GB at ~$0.43/hr.
- **Cache:** pin `HF_HOME`; persist the ~22 GB cache on a Vast volume (~$0.20/GB-month) or network volume (~$0.07/GB-month at RunPod); set `HF_HUB_OFFLINE=1` after the cache is complete.
- **Sessions:** batch P0/pilot/Core into 2–3 long sessions.

### Final stack

- **GPU:** RTX PRO 6000 Max-Q 96 GB spot, **$0.74–1.02/hr**; S at **$1.432/hr** for reliability.
- **Why:** one 96 GB GPU fits the pinned **69.73 GB** stack (Qwen3.6-27B-FP8 + Gemma-4-26B-A4B-FP8 + Mistral-24B-AWQ), not a 77 GB estimate.
- **Smoke:** 60–100 GPU-h; **not run yet**.
- **Replication:** 60–100 GPU-h on a 120–150-question subset; do not run the full matrix on the final stack.
- **Cache:** 100–160 GB; persist on a volume; budget 2–3 downloads if you use fresh hosts.

### Bandwidth

- Prefer `inet_down_cost ≤ $0.005/GB` and `inet_up_cost ≤ $0.005/GB`.
- A 150 GB final download costs **$0.60–3.90**; 5 fresh sessions = **$3–20**.
- Upload results to GitHub/cloud before destroying the instance; results are small (5–20 GB).

### Storage

- Instance disk is included in `dph_total`; 80 GiB is enough for Dev, 200 GiB for Final.
- **Vast volume storage is ~$0.20/GB-month median**, not $0.07. 160 GB × 6 months = **$192**; 200 GB ≈ **$40/month**.
- Vast volumes are local-only; they cannot move between hosts. RunPod network volumes (~$0.07/GB-month) are portable but require RunPod.
- Do not leave a stopped instance for weeks; the disk is billed while stopped and deleted on destroy.

### Spot vs on-demand

- Spot is **20–40% cheaper**; use it with checkpointing and resumable JSONL.
- If a run is time-critical (final smoke), on-demand at ~$1.79/hr may be worth the premium.
- Budget 20% overhead for spot interruptions and retries.

---

## 5. What would blow the budget

1. **Re-downloading the model cache** on a $0.026–0.033/GB host, every session. Persist it.
2. **Leaving a stopped instance/volume** for months. 160 GB × 6 months = $192.
3. **Running the old 15×5×3×1,000 matrix.** ~30,000 GPU-h ≈ $8,000–11,000+; impossible.
4. **Using on-demand for the whole project.** 20–40% premium; spot + checkpointing is fine.
5. **Idle GPUs** while debugging prompts. Prepare prompts/configs before renting; use mocks.
6. **Model swaps on a 24 GB card** for the final stack. The wall-clock and failure rate dominate the savings.
7. **High-bandwidth hosts** for the final stack. 150 GB × $0.033/GB = $4.95 per download; 5 sessions = $25.
8. **Forgetting to copy results** before destroy. Re-running is the most expensive mistake.
9. **Starting Full without WP-18 or N1.** A wrong 36-vs-32-run definition can waste a large fraction of the 1,440 GPU-h envelope.

---

## 6. One-page summary for the experiment plan

- **Dev:** A6000 80 GiB spot, **$0.26/hr median ($0.16–0.37)**; 22 GB cache; 2–3 sessions; reliability ≥0.98.
- **Final:** Max-Q **$0.74–1.02/hr** best value; S **$1.43/hr** for reliability; **one 96 GB GPU**; **69.73 GB** pinned stack; 100–160 GB cache; **60–100 GPU-h**.
- **Final-stack smoke:** 60–100 GPU-h / **$80–120**; **not run**.
- **Pilot:** ~112 GPU-h / **$50–100**.
- **Core:** 1,280 GPU-h cap (~1,067 planned) / **$420–580**; 24 runs.
- **Full:** 1,440 GPU-h envelope / **$900-1,200 envelope**; conditional 36/32 runs; WP-18 freezes.
- **Law-testing:** **$1,400–1,900**, only if the effect is real.
- **Hard stop:** **$1,350 before law-testing.**
- **Bandwidth:** $0.004–0.011/GB typical; $0.026–0.033/GB high; 150 GB re-download = $0.6–5.
- **Storage:** $0.20/GB-month median; 160 GB × 6 months = $192; volumes local-only; destroy stopped instances.
- **Overhead:** 20%; per-second billing; spot 20–40% cheaper; checkpoint/resume.
- **Rule:** batch sessions, persist the cache, copy results, destroy the instance.

---

## Appendix A — Historical scenario table (8 November 2026)

> **Historical only.** These rows used the old 6-min/8-min assumptions and the old all-in framing. They are retained for the price history; **do not use them as the current budget.** Current caps are in §3.

| Scenario | GPU-h | GPU $ | Bandwidth + storage | Overhead 20% | Total |
|---|---:|---:|---:|---:|---:|
| P0 smoke | 15 | $4 | $1–3 | $1 | ~$6 |
| Pilot 100–150 Q | 225 | $59 | $1–3 | $12 | ~$72 |
| Core run (1,100 Dev incl. pilot/sweep + 60 Final) | 1,160 | $350 | $50–80 | $70 | ~$470 |
| Full run (1,920 main + 480-680 pilot/sweep + 60-100 Final; 8 min; all-in; historical, stack/reuse not assumed) | 2,460-2,700 | $690-790 | $50-120 | $140-180 | ~$880-1,090 |
| Full law-testing — 6 min (optimistic) | 2,860 + 100 | $854 | $60–120 | $170 | ~$1,100 |
| Full law-testing — 8 min (realistic) | 3,813 + 100 | $1,105 | $60–120 | $220 | ~$1,390 |
| Full / high (8 min, high rate, 6-month storage) | 3,813 + 100 | $1,457 | $150–250 | $320 | ~$1,930 |
| Benchmark/human storage (no GPU) | 0 | $0 | $30–120 | $0 | ~$30–120 |

**Why the old table is historical:** it used 2,460–2,700 GPU-h for the Full run and 3,813 GPU-h for 8-min law-testing. The current plan uses a **1,440 GPU-h Full envelope** and treats law-testing as conditional. The price observations remain useful; the scenario arithmetic does not.
