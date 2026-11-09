# Experiment stage names

Use these names in all current plans, slides, and reports. Legacy labels appear once in parentheses; after that, use the plain name.

| Stage | Plain name | Question it answers | Scope | Cost |
|---|---|---|---|---|
| R2 | **Pilot run** | Does the pipeline run end to end and does trust move? | ~100–150 questions, injection, trust on/off | $50–100 |
| R3 | **Core run** (legacy “C+”) | Does trust beat the matched controls? | 4 conditions (B3, B4-matched, B8-no-trust, B8) × GPQA-Main + MMLU-Pro + HLE × 2 seeds = 24 runs; 1,280 GPU-h conservative cap (planned ~1,067); 8,000 planned debates | $420–580 |
| R4 | **Ceiling sweep** | Where is the sign reversal? | Re-aggregate existing debates under verdict noise; no new GPU | $0 |
| R5 | **Full run** (legacy “TACL full”) | Does the full 6-arm design replicate and generalize? | 6 arms × 3 datasets × 2 seeds; 36 runs / 300-item benchmark target / 1,440 GPU-h envelope **if B8-oracle uses gold-answer trust**. If B8-oracle is gold-evidence-only on EG-SSS, the target is 32 runs and the GPU-h must be recomputed. | $900–1,200 (separate Final-stack run; not a reuse of Core cells) |
| R6 | **Final-stack smoke (Nov 2026)** | Does the pinned 96 GB stack load and run? | 60–100 GPU-h on the 96 GB card, before WP-18 and the pilot; **NOT RUN** (offline 69.73 GB check only) | $80–120 |
| R7 | **Law-testing** | Do the ρ, granularity, and shared-error laws hold? | Apr 2027, only if the effect is real | $1,400–1,900 |

**Rules**

- **Full is a separate Final-stack matrix.** Do not assume Core cells are reusable; the Core run is planned on the Dev stack and the Full run on the Final stack. A true top-up can be computed only if the stack and model revisions match.
- **TACL is a venue** (*Transactions of the Association for Computational Linguistics*), not an experiment stage. Use “TACL” only when naming the submission target.
- **No “C+” or “TACL full” in new prose, slides, or tables.** If a historical audit needs the old label, write it once as `Core run (legacy “C+”)`.
- **The Full target is conditional.** 36 runs / 1,440 GPU-h assumes B8-oracle uses gold-answer trust. If B8-oracle is gold-evidence-only on EG-SSS, the target is 32 runs and the GPU-h must be recomputed.
- **EG-SSS is a v1.2 benchmark, not a Core dataset.** Core v1.0 runs GPQA-Main + MMLU-Pro + HLE; EG-SSS freezes at 180 and scales to the 300-item Full target.
- Dates: Final-stack smoke Nov 2026; WP-18 Nov–Dec 2026; Pilot Dec 2026; Core Jan 2027; Full Feb 2027; Law-testing Apr 2027; thesis June 2027; defence June/July 2027; paper after defence Aug–Dec 2027.
