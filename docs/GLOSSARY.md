# Experiment stage names

Use these names in all current plans, slides, and reports. Legacy labels appear once in parentheses; after that, use the plain name.

| Stage | Plain name | Question it answers | Scope | Cost |
|---|---|---|---|---|
| R2 | **Pilot run** | Does the pipeline run end to end and does trust move? | ~100 questions, injection, trust on/off | $50–100 |
| R3 | **Core run** (legacy “C+”) | Does trust beat the matched controls? | 4 arms + oracle, ~400/dataset × 2 seeds, 180-item benchmark | $420–580 |
| R4 | **Ceiling sweep** | Where is the sign reversal? | Re-aggregate existing debates under verdict noise; no new GPU | $0 |
| R5 | **Full run** (legacy “TACL full”) | Does the full 6-arm design replicate and generalize? | 6 arms × 3 datasets × 400 × 2 seeds, 300-item benchmark, human eval | $900–1,200 top-up |
| R6 | **Final replication** | Does it hold on the 96 GB stack? | 60–100 GPU-h on the pinned Final stack | $80–120 |
| R7 | **Law-testing** | Do the ρ, granularity, and shared-error laws hold? | Apr 2027, only if the effect is real | $1,400–1,900 |

**Rules**

- **Core run is a prefix of the Full run.** The runner resumes, so the Full run does not re-run completed Core cells. The costs are not additive for those cells.
- **TACL is a venue** (*Transactions of the Association for Computational Linguistics*), not an experiment stage. Use “TACL” only when naming the submission target.
- **No “C+” or “TACL full” in new prose, slides, or tables.** If a historical audit needs the old label, write it once as `Core run (legacy “C+”)`.
- Dates: Pilot Dec 2026; Core Jan 2027; Full Feb 2027; Final replication after the Full run; Law-testing Apr 2027; thesis June 2027; defence June/July 2027; paper after defence Aug–Dec 2027.
