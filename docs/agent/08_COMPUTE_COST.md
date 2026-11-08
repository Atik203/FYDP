# 08 — Compute Cost (Vast.ai Spot Market)

**Snapshot:** 8 November 2026, ~22:35 local. **CLI:** `vastai 1.7.0`. **Prices are volatile — re-run the queries before renting.**

This file replaces the old `$0.40–0.60/hr` and `$1.10–2.70/hr` assumptions. It includes **GPU, bandwidth up/down, storage, and interruption overhead**.

---

## 1. How the prices were obtained

Exact commands (run from any shell with the Vast.ai CLI configured):

```bash
vastai search offers 'gpu_name=RTX_A6000 num_gpus=1 rentable=true' -i --limit 40 --storage 100 --raw
vastai search offers 'gpu_name=RTX_4090 num_gpus=1 rentable=true' -i --limit 40 --storage 100 --raw
vastai search offers 'gpu_name=RTX_PRO_6000_S num_gpus=1 rentable=true' -i --limit 40 --storage 100 --raw
vastai search offers 'gpu_name=RTX_PRO_6000_WS num_gpus=1 rentable=true' -i --limit 40 --storage 100 --raw
vastai search offers 'gpu_name=RTX_PRO_6000_Max-Q num_gpus=1 rentable=true' -i --limit 40 --storage 100 --raw
vastai search offers 'gpu_name=L40S num_gpus=1 rentable=true' -i --limit 40 --storage 100 --raw
vastai search offers 'gpu_name=A100_PCIE num_gpus=1 rentable=true' -i --limit 40 --storage 100 --raw
```

- `-i` = interruptible/spot (`type=bid`).
- `--storage 100` = 100 GiB instance disk; `dph_total` includes GPU + that disk.
- For on-demand comparison, replace `-i` with `-d`.
- `dph_total` is the all-in hourly rate at the requested storage.
- `inet_up_cost` / `inet_down_cost` are **USD per GB**.
- `storage_cost` is **USD per GB per month**; `dph_total` already includes the requested GiB.

---

## 2. Spot price table (8 Nov 2026)

| GPU | VRAM | Spot p10 | **Spot median** | Spot p90 | On-demand median | Up $/GB | Down $/GB | Storage $/GB/mo | Offers |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| RTX A6000 | 48 GB | $0.280 | **$0.382** | $0.415 | $0.526 | 0.00529 | 0.00462 | 0.233 | 4 |
| RTX 4090 | 24 GB | $0.308 | **$0.409** | $0.639 | — | 0.01042 | 0.01121 | 0.297 | 40 |
| RTX PRO 6000 S | 96 GB | $0.871 | **$1.432** | $1.676 | $1.789 | 0.00400 | 0.00264 | 0.267 | 14 |
| RTX PRO 6000 WS | 96 GB | $0.573 | **$1.245** | $1.907 | $1.693 | 0.00526 | 0.00521 | 0.333 | 18 |
| RTX PRO 6000 Max-Q | 96 GB | $0.601 | **$1.017** | $1.565 | — | 0.02604 | 0.02604 | 0.300 | 12 |
| L40S | 48 GB | $0.554 | **$0.561** | $0.561 | — | 0.00391 | 0.00260 | 0.200 | 3 |
| A100 PCIE | 40 GB | $0.405 | **$0.428** | $0.700 | — | 0.00391 | 0.00391 | 0.200 | 3 |
| A100 SXM4 | 60 GB | $0.361 | **$0.522** | $0.530 | — | 0.00391 | 0.00260 | 0.400 | 3 |

**Key findings:**

- **A6000 spot is ~$0.38/hr median**, not $0.40–0.60. Availability is thin (4 offers at 100 GiB), so plan around $0.38–0.42/hr and expect to hunt.
- **4090 spot is ~$0.41/hr**, but 24 GB requires model swaps for the Dev stack. Not worth the complexity unless A6000 is unavailable.
- **RTX PRO 6000 S spot is ~$1.43/hr median**, with a $0.87 p10. On-demand is ~$1.79/hr.
- **RTX PRO 6000 WS is ~$1.25/hr median**, with a $0.57 p10.
- **RTX PRO 6000 Max-Q is ~$1.02/hr median**, but bandwidth is **$0.026/GB both ways** on the median host — avoid unless you confirm `inet_down_cost`/`inet_up_cost` are low.
- **Bandwidth is cheap on most hosts** ($0.003–0.011/GB), but the high end is $0.026–0.049/GB. The Gate 0 $3.20 ingress was a high-bandwidth host plus ~96 GB of pulls; on a $0.004/GB host, the same pulls are ~$0.38.
- **Storage is $0.20–0.40/GB/month** on the instance disk. 100 GiB for a month is $20–40; 200 GiB is $40–80. This is real money over 6 months.
- **Spot is 20–35% cheaper than on-demand** for A6000 and RTX PRO 6000 S; the discount is smaller than expected because the spot market is thin.

---

## 3. Cost model

### Formulas

\[
\text{GPU cost} = \text{GPU hours} \times \text{dph}_{100}
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

- **Dev stack:** ~22 GB model cache; 100 GiB disk; A6000 spot median **$0.382/hr**.
- **Final stack:** ~100–160 GB model cache; 200 GiB disk; RTX PRO 6000 S spot median **$1.432/hr** (WS **$1.245/hr**, Max-Q **$1.017/hr**).
- **Bandwidth:** 22 GB Dev / 150 GB Final per fresh download; 1–3 fresh sessions; `down` $0.004–0.011/GB; `up` $0.004–0.011/GB.
- **Overhead:** 15% low, 20% base, 25% high for setup, retries, spot interruptions, and checkpoint/restart.
- **Storage:** instance disk included in `dph_total`; persistent volume/network volume assumed ~$0.07/GB/month (verify with the provider) if you keep the cache.
- **Debate time:** 8 min with retrieval/trust; 10–12 min on the Final stack.

### Scenario table (USD)

| Scenario | GPU-h | GPU $ (base) | Bandwidth $ | Storage $ | Overhead 20% | **Total base** | Low–high |
|---|---:|---:|---:|---:|---:|---:|---:|
| P0 smoke | 15 | $6 | $1–3 | $0 | $2 | **~$9** | $6–14 |
| Pilot 100–150 Q | 225 | $86 | $1–3 | $0 | $18 | **~$105** | $70–140 |
| **C+ core** (4 arms + oracle; 1,000 Q; 1 seed + subset) | 1,100 | $420 | $2–5 | $0 | $85 | **~$510** | $380–650 |
| **C+ + Final replication** (100 GPU-h on 96 GB) | +100 | +$143 | +$1–5 | +$3 | +$30 | **~$690** | $550–850 |
| **TACL main** (6 arms × 3 datasets × 400 × 2 seeds = 14,400 debates; + pilot/sweep, 8–10 min/debate) | 2,520–3,320 | $1,090–1,400 | $30–60 | $20–50 | $220–290 | **~$1,340–1,750** | $1,100–1,900 |
| Full law-testing (8 arms + sweeps + replication) | 2,860 | $1,092 | $3–8 | $40–80 | $230 | **~$1,430** | $1,100–1,800 |
| Full + Final replication | +120 | +$172 | +$1–5 | +$5 | +$36 | **~$1,650** | $1,300–2,050 |

**Interpretation:**

- The **C+ path is ~$550–850 all-in**, including the Final replication.
- The **full 9+ law-testing path is ~$1,300–2,050 all-in**.
- **GPU hours dominate**; bandwidth/storage add ~10–25%, not 2–3×. The old $500–1,200 estimate was too low for the full path and roughly right for C+.
- The **single biggest avoidable cost is re-downloading the model cache** on a high-bandwidth host ($0.026/GB). Persist the cache on a volume or choose a host with `inet_down_cost ≤ $0.005/GB`.
- The **second biggest avoidable cost is idle/stopped instances**. Vast bills storage while stopped; destroy after copying results.

---

## 4. Recommendation

### Dev stack

- **GPU:** RTX A6000 48 GB spot, median **$0.382/hr** at 100 GiB.
- **Why:** 48 GB fits the three 4-bit models without swaps; 4090 24 GB needs model swaps and complicates the pipeline.
- **Fallback:** L40S 48 GB at ~$0.56/hr or A100 PCIE 40 GB at ~$0.43/hr if A6000 is unavailable.
- **Cache:** pin `HF_HOME`; persist the ~22 GB cache on a Vast volume or network volume; set `HF_HUB_OFFLINE=1` after the cache is complete.
- **Sessions:** batch P0/pilot/C+ into 2–3 long sessions; do not rent per experiment.

### Final stack

- **GPU:** RTX PRO 6000 S 96 GB spot, median **$1.432/hr**; WS at **$1.245/hr** is a good alternative; Max-Q at **$1.017/hr** only if you confirm low bandwidth costs and acceptable performance.
- **Why:** 96 GB fits the 24–27B FP8 stack without swaps.
- **Replication:** 100–120 GPU-h on a 120–150-question subset is enough; do not run the full matrix on the Final stack.
- **Cache:** 100–160 GB; persist on a volume; budget 2–3 downloads if you use fresh hosts.

### Bandwidth

- Prefer hosts with `inet_down_cost ≤ $0.005/GB` and `inet_up_cost ≤ $0.005/GB`.
- Avoid the Max-Q median host at $0.026/GB both ways unless the GPU price difference is worth it.
- Upload results to GitHub/cloud before destroying the instance; results are small (5–20 GB).
- Budget $1–5 per fresh session for downloads; $3.20 was an outlier, not the norm.

### Storage

- Instance disk is included in `dph_total`; 100 GiB is enough for Dev, 200 GiB for Final.
- If you keep a persistent volume, verify the current Vast volume rate (the roadmap assumes ~$0.07/GB/month; the instance disk is $0.20–0.40/GB/month).
- Do not leave a stopped instance for weeks; the disk is billed while stopped and deleted on destroy.

### Spot vs on-demand

- Spot is 20–35% cheaper; use it with checkpointing and resumable JSONL.
- If a run is time-critical (Final replication), on-demand at ~$1.79/hr may be worth the premium.
- Budget 20% overhead for spot interruptions and retries.

---

## 5. What would blow the budget

1. **Re-downloading the model cache** on a $0.026/GB host, every session. Persist it.
2. **Leaving a stopped instance** for days. The disk is billed; destroy after copying results.
3. **Running the 15×5×3×1,000 matrix**. ~30,000 GPU-h ≈ $11,000+; impossible.
4. **Using on-demand for the whole project**. 20–35% premium; spot + checkpointing is fine.
5. **Idle GPUs** while debugging prompts. Prepare prompts/configs before renting; use mocks.
6. **Model swaps on a 24 GB card** for the Final stack. The wall-clock and failure rate dominate the savings.
7. **High-bandwidth hosts** for the Final stack. 150 GB × $0.026/GB = $3.90 per download; 5 sessions = $19.50.
8. **Forgetting to copy results** before destroy. Re-running is the most expensive mistake.

---

## 6. One-page summary for the experiment plan

- **Dev:** A6000 spot, **$0.38/hr** median at 100 GiB; 22 GB cache; 2–3 sessions.
- **Final:** RTX PRO 6000 S spot, **$1.43/hr** median; WS **$1.25/hr**; 100–160 GB cache; 100–120 GPU-h.
- **C+ path:** ~1,100 Dev GPU-h + 100 Final GPU-h ≈ **$550–850 all-in**.
- **TACL main:** ~2,520–3,320 GPU-h + 120 Final GPU-h ≈ **$1,300–1,800 all-in**.
- **Full law-testing:** ~2,860 Dev GPU-h + 120 Final GPU-h ≈ **$1,300–2,050 all-in**.
- **Bandwidth:** $0.004–0.011/GB typical; avoid $0.026–0.049/GB hosts.
- **Storage:** $0.20–0.40/GB/month on instance disk; persist cache on a cheaper volume.
- **Overhead:** 20% for spot interruptions/retries.
- **Rule:** batch sessions, persist the cache, copy results, destroy the instance.
