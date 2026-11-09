# 08 — Compute Cost (Vast.ai Spot Market)

**Price snapshot:** 9 November 2026. **CLI:** `vastai 1.7.0`.

> **Prices are volatile — re-run the queries before renting.** The **budget caps below are authoritative**; the per-hour observations are a dated planning snapshot, not a quote.

**Sources:** `https://console.vast.ai/api/v0/bundles/`, `https://cloud.vast.ai/create/`, Vast.ai CLI `search offers` output, Vast.ai volume/storage docs.

This file replaces the old multi-stack estimates. It covers the **main causal matrix on one 80 GB A100 PCIe** and the **96 GB FP8 smoke/precision path**, including GPU, bandwidth, storage, and interruption overhead.

---

## 1. How the rates were obtained

```bash
vastai search offers 'gpu_name=A100_PCIE num_gpus=1 rentable=true' -i --limit 40 --raw
vastai search offers 'gpu_name=RTX_PRO_6000 num_gpus=1 rentable=true' -i --limit 40 --raw
```

- `-i` = interruptible/spot (`type=bid`).
- `dph_total` includes the GPU and the requested instance disk.
- Vast bills **per second**; there is no hourly minimum.
- Re-query before each rental: the **rates move**, but the budget caps in §3 do not.

---

## 2. Planning rates (9 November 2026)

| GPU | VRAM | Spot planning rate | Role |
|---|---:|---:|---|
| **A100 PCIe** | 80 GB | **$0.136/GPU-h** | Main causal matrix: pilot, Core, Full (4-bit 24–27B final families) |
| **RTX PRO 6000 96 GB class** | 96 GB | **$0.336/GPU-h** | N1 hardware smoke + small GPQA precision replication (FP8) |

The main matrix runs on the **80 GB A100 PCIe** because the 4-bit 24–27B stack fits and the spot rate is the cost driver. The 96 GB card is not the default matrix host; it exists to prove the FP8 stack and to check precision on a small GPQA subset.

---

## 3. Current budget model (9 November 2026)

### Execution stack

- **Main causal matrix:** 4-bit 24–27B final families (Qwen3.8-27B-AWQ-INT4 ~21.0 GB, Gemma 4 26B-A4B AWQ ~17.2 GB, Mistral 24B AWQ 15.06 GB; ~53.3 GB total) on one **80 GB A100 PCIe** spot at **$0.136/GPU-h**.
- **Pilot, Core, and Full** all run on this main stack. Core and Full use the same model families, so cells are reusable only where model revisions, prompts, and configs match.
- **96 GB FP8 stack:** reserved for the **N1 hardware smoke** and a **small GPQA precision replication** (B3, B8-no-trust, B8; 150–200 questions; 1 seed) at **$0.336/GPU-h**. It is not the main matrix host.

### Scenarios (authoritative caps)

| Scenario | GPU-h | GPU $ | +20% overhead | Present |
|---|---:|---:|---:|---:|
| Pilot (N5/G2) | ~112 | $15 | $18 | **$15–20** |
| Core run (G3), planned | ~1,067 | $145 | $174 | **$175–210** |
| Core run (G3), cap | 1,280 | $174 | $209 | **$175–210** |
| Full run (G4/G5), **32-row gold-evidence default** | 1,280 | $174 | $209 | **$210** |
| Full run, **36-row gold-answer alternate** | 1,440 | $196 | $235 | **$235** |
| FP8 precision replication + 96 GB N1 smoke | 60–100 | $20–34 | $24–41 | **$25–40** |
| Storage and bandwidth | — | — | — | **$40–80** |
| **Total plan** | — | — | — | **$500–600** |
| **Hard stop** | — | — | — | **$600** |

**Full design:** the default is **32 rows** with a **gold-evidence oracle on EG-SSS**; **36 rows** is the gold-answer alternate. The two Full rows are **alternatives**, not additions; the total counts one Full run. The **placebo** is a **cross-agent round-pool**. WP-18 freezes the definition; do not run Full before N1 and WP-18.

**Fallback:** if the 80 GB A100 spot is unavailable and the main runs use the 96 GB card at **$0.336/GPU-h**, the plan becomes **$1,050–1,150** and requires **re-approval**. This is a fallback, not the default, and must not be presented as the plan.

**Law-testing:** outside the **$500–600** envelope and the **$600 hard stop**. No law-testing spend is authorized under this budget; a separate cost model and approval are required.

### Formulas

\[
\text{Main GPU cost} = \text{GPU hours} \times \$0.136
\]

\[
\text{Precision GPU cost} = \text{GPU hours} \times \$0.336
\]

\[
\text{Total} = (\text{GPU} + \text{Bandwidth} + \text{Storage}) \times (1 + \text{overhead})
\]

### Assumptions

- **Overhead:** 20% for setup, retries, spot interruptions, checkpoint/restart.
- **Debate time:** 8 min with retrieval/trust; the matrix arithmetic uses 8 min/debate.
- **Storage/bandwidth:** **$40–80** all-in for the plan; persist the cache, copy results, and destroy instances.
- **Spot discipline:** batch sessions, keep the model cache, and checkpoint/resume so an interruption does not restart a run.
- **B7 external ceiling (optional):** ~$3–9 per 1,000 questions, appendix-only; not part of the $500–600 plan.

---

## 4. Recommendation

### Main matrix

- **GPU:** one **80 GB A100 PCIe** spot at **$0.136/GPU-h**, 4-bit 24–27B final families.
- **Why:** the 4-bit stack fits in 80 GB and keeps Core + Full inside the $600 hard stop.
- **Sessions:** batch pilot/Core/Full into long sessions; persist the cache and resume from JSONL.
- **Do not** move the main matrix to the 96 GB card unless the A100 spot is unavailable and the fallback is re-approved.

### FP8 precision path

- **GPU:** **RTX PRO 6000 96 GB class** spot at **$0.336/GPU-h**.
- **Why:** N1 must prove the pinned **73.68 GB** FP8 stack serves all three checkpoints; the precision replication checks that the 4-bit main result is not a quantisation artifact.
- **Scope:** **60–100 GPU-h** total, **$25–40**. Do not run the full matrix on this stack.

### Bandwidth and storage

- Persist the model cache so a fresh host does not re-download it.
- Copy results out before destroying the instance; the container disk is deleted on destroy.
- Keep the all-in storage/bandwidth line at **$40–80**.

### Spot vs on-demand

- Spot is materially cheaper; use it with checkpointing and resumable JSONL.
- Budget the 20% overhead for interruptions and retries.
- On-demand is only for a time-critical smoke, not the matrix.

---

## 5. What would blow the budget

1. **Running the main matrix on the 96 GB card by default.** That is the **$1,050–1,150** fallback and needs re-approval.
2. **Re-downloading the model cache** on every fresh host. Persist it.
3. **Leaving a stopped instance or volume** running for weeks.
4. **Running the old 15×5×3×1,000 matrix.** ~30,000 GPU-h; impossible.
5. **Idle GPUs while debugging prompts.** Prepare prompts/configs before renting; use mocks.
6. **Forgetting to copy results** before destroy. Re-running is the most expensive mistake.
7. **Starting Full without WP-18 or N1.** A wrong 32-vs-36-row definition can waste a large share of the Full envelope.

---

## 6. One-page summary for the experiment plan

- **Main matrix:** one **80 GB A100 PCIe** spot, **$0.136/GPU-h**, 4-bit 24–27B final families.
- **Pilot:** ~112 GPU-h / **$15–20**.
- **Core:** 1,280 GPU-h cap (~1,067 planned) / **$175–210**.
- **Full default:** 32-row gold-evidence oracle on EG-SSS, 1,280 GPU-h / **$210**.
- **Full alternate:** 36-row gold-answer, 1,440 GPU-h / **$235**.
- **FP8 precision replication + N1 smoke:** 60–100 GPU-h at **$0.336/h** / **$25–40**.
- **Storage/bandwidth:** **$40–80**.
- **Total:** **$500–600**; **hard stop $600**.
- **Fallback:** 96 GB main runs at $0.336/h = **$1,050–1,150**, re-approval required; not the default.
- **Law-testing:** outside this envelope; separate approval required.
- **Rule:** batch sessions, persist the cache, copy results, destroy the instance.

---

## Appendix A — Historical price note

> **Historical; current budget in `docs/agent/08_COMPUTE_COST.md` §3.** The 8 November 2026 A6000/Max-Q/S snapshot and its scenario arithmetic are retired. They are not the current plan; re-query Vast.ai before renting.
