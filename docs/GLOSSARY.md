# Experiment stage names

Use these names in all current plans, slides, and reports. Legacy labels appear once in parentheses; after that, use the plain name.

**Current budget (9 November 2026):** main matrix on one **80 GB A100 PCIe** at **$0.136/GPU-h**; pilot **$15–20**; Core **$175–210**; Full **$210** (32-row gold-evidence default) or **$235** (36-row gold-answer alternate); FP8 precision replication + N1 smoke **$25–40**; storage/bandwidth **$40–80**; **total $500–600**; **hard stop $600**. If the 80 GB A100 spot is unavailable and the main runs use 96 GB at **$0.336/GPU-h**, the plan is **$1,050–1,150** and requires re-approval. Source: `docs/agent/08_COMPUTE_COST.md`.

| Stage | Plain name | Question it answers | Scope | Cost |
|---|---|---|---|---|
| R2 | **Pilot run** | Does the pipeline run end to end and does trust move? | ~100–150 questions, injection, trust on/off; 4-bit 24–27B stack on the 80 GB A100 | $15–20 |
| R3 | **Core run** (legacy “C+”) | Does trust beat the matched controls? | 4 conditions (B3, B4-matched, B8-no-trust, B8) × GPQA-Main + MMLU-Pro + HLE × 2 seeds = 24 runs; 1,280 GPU-h conservative cap (planned ~1,067); 8,000 planned debates; 4-bit 24–27B stack on the 80 GB A100 | $175–210 |
| R4 | **Ceiling sweep** | Where is the sign reversal? | Re-aggregate existing debates under verdict noise; no new GPU | $0 |
| R5 | **Full run** (legacy “TACL full”) | Does the full 6-arm design replicate and generalize? | 6 arms × 3 datasets × 2 seeds; **default 32 runs** with a gold-evidence oracle on SciClaimBench (1,280 GPU-h); **alternate 36 runs** with gold-answer trust (1,440 GPU-h). The two are alternatives, not additions. | $210 default (32-row gold-evidence) / $235 alternate (36-row gold-answer); one Full run |
| R6 | **Final-stack smoke (Nov 2026)** | Does the pinned 96 GB FP8 stack load and run, and does the precision replication hold? | 60–100 GPU-h on the 96 GB card, before WP-18 and the pilot; **NOT RUN** (offline 73.68 GB check only) | $25–40 |
| R7 | **Law-testing** | Do the ρ, granularity, and shared-error laws hold? | Apr 2027, only if the effect is real; outside the $500–600 envelope and the $600 hard stop | Not in the current envelope; no spend authorized without a separate cost model and approval |

**Rules**

- **Full is a separate matrix.** Core and Full both run on the **4-bit 24–27B stack on one 80 GB A100 PCIe**, so cells are reusable only where model revisions, prompts, and configs match. The **96 GB FP8 stack** is only the N1 smoke plus the GPQA precision replication.
- **TACL is a venue** (*Transactions of the Association for Computational Linguistics*), not an experiment stage. Use “TACL” only when naming the submission target.
- **No “C+” or “TACL full” in new prose, slides, or tables.** If a historical audit needs the old label, write it once as `Core run (legacy “C+”)`.
- **The Full default is 32 rows with a gold-evidence oracle on SciClaimBench** (1,280 GPU-h / $210). **36 rows with gold-answer trust is the alternate** (1,440 GPU-h / $235). The total counts one Full run.
- **SciClaimBench is a v1.2 benchmark, not a Core dataset.** Core v1.0 runs GPQA-Main + MMLU-Pro + HLE; SciClaimBench freezes at 180 and scales to the 300-item Full target.
- Dates: Final-stack smoke Nov 2026; WP-18 Nov–Dec 2026; Pilot Dec 2026; Core Jan 2027; Full Feb 2027; Law-testing Apr 2027; thesis June 2027; defence June/July 2027; paper after defence Aug–Dec 2027.
