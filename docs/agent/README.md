# FYDP Agent Docs — Index

**Status date:** 9 November 2026. **P0 engineering is released; there are no efficacy results yet.**

**Project title:** *The Boundaries of Evidence-Grounded Trust in Multi-Agent Scientific Debate, with a Controlled Benchmark for Sycophantic Consensus.*

**Release facts (9 November 2026):**

| Item | Value |
|---|---|
| Branches | `main` = `dev` = `2ae56a3` (post-release docs commit) |
| Tags | `p0-gate` = `055a244`; `p0-release` = `7f2c11f` |
| P0 gate | **13/13 passed** |
| Tests | **615 passed** (514 at the P0 release) |
| Report | `FYDP_Summer/out/fydp.pdf` - 69 pages, 80 cited works, 0 errors/undefined refs |
| Journal | `Papev_Summer26_6/out/cas-sc-template.pdf` - 19 pages, 71 cited works, 0 errors/undefined refs |
| Final stack | Qwen3.8-27B-FP8 / Gemma-4-26B-A4B-FP8 / Mistral-24B-AWQ, **73.68 GB** pinned |
| Final-stack 96 GB smoke | **Not run** |

**P0 is engineering readiness, not efficacy evidence.** No accuracy, CCR, or sign-reversal claim exists yet. The first efficacy claim waits for the pilot (G2) and the Core run (G3).

These docs are for LLM coding agents and human teammates. They are deliberately short, explicit, and test-driven. Read them in order.

**Experiment stage names:** [`../GLOSSARY.md`](../GLOSSARY.md) — **Core run**, **Full run**, and the rule that **TACL** is a venue only. The retired labels are recorded once in the historical note below.

| # | File | Read it when |
|---:|---|---|
| 00 | [`00_START_HERE.md`](00_START_HERE.md) | First. Orientation, current release, commands, repo map, historical audit. |
| 01 | [`01_CURRENT_STATE.md`](01_CURRENT_STATE.md) | Before editing. What is implemented, pending, or historical. |
| 02 | [`02_P0_FIXES.md`](02_P0_FIXES.md) | Historical P0 fix list (completed). Use for the record of what changed. |
| 03 | [`03_EXPERIMENT_PLAN.md`](03_EXPERIMENT_PLAN.md) | **Design source of truth.** Endpoints, Core/Full design, power, gates. |
| 04 | [`04_LITERATURE_AND_GAPS.md`](04_LITERATURE_AND_GAPS.md) | Historical literature snapshot (8 Nov 2026). Prior art + gap map. |
| 05 | [`05_WRITING_AND_VENUE.md`](05_WRITING_AND_VENUE.md) | Before editing the paper/thesis. Readiness, claims, venue calendar. |
| 06 | [`06_AGENT_CHECKLIST.md`](06_AGENT_CHECKLIST.md) | Historical P0 board + post-P0 checklist. Current task board is `roadmap.md`. |
| 07 | [`07_9PLUS_BLUEPRINT.md`](07_9PLUS_BLUEPRINT.md) | Proposal/strategy: theory, method, benchmark, causal study. Not results. |
| 08 | [`08_COMPUTE_COST.md`](08_COMPUTE_COST.md) | Vast.ai price snapshot + current budget caps. |
| 09 | [`09_P0_INTERFACES.md`](09_P0_INTERFACES.md) | Historical P0 contract; record schema v2 remains useful. |

**Team-facing one-pager:** [`../../UPDATE-CHECKLIST.md`](../../UPDATE-CHECKLIST.md) — share this with the whole team.

## Current status (9 November 2026)

- **P0 is released.** `main` and `dev` are the only branches, both at `2ae56a3`; `p0-gate` and `p0-release` tag the release. Feature branches and extra worktrees are deleted; only the `E:\FYDP` worktree exists.
- **No efficacy results.** P0 proves the engineering path: 13/13 gate checks, 514 tests, two compiled manuscripts, and an offline final-stack fit check.
- **Core v1.0 is executable:** 4 conditions (B3, B4-matched, B8-no-trust, B8) × 3 datasets (`gpqa_main`, `mmlu_pro`, `hle`) × 2 seeds = **24 runs**. Planned 8,000 debates ≈ **1,067 GPU-h**; conservative gate cap **1,280 GPU-h**. EG-SSS is **not** in Core v1.0.
- **Full is a target, not a frozen matrix:** the default is **32 runs** with a gold-evidence oracle on EG-SSS (1,280 GPU-h); the alternate is **36 runs** with gold-answer trust (1,440 GPU-h). **WP-18** freezes this.
- **Next work, in order:** N1 final-stack 96 GB smoke (Nov) → N2 WP-18 placebo/oracle (Nov–Dec) → N3 24-item benchmark calibration (Nov–Feb) → N4 verifier audit (Nov–Dec) → N5 pilot/G2 (Dec) → Core/G3 (Jan 2027) → Full/G4-G5 (Feb 2027).
- **`roadmap.md` is the task board.** `06_AGENT_CHECKLIST.md` is historical plus a short post-P0 checklist.

## Source-of-truth hierarchy

1. **`roadmap.md`** — order of work, gates, and dates.
2. **`PRE_REGISTRATION.md` v1.0 + v1.1 erratum** — frozen endpoints, arms, analysis, stopping rules. The v1.1 erratum records the released prompt hash `bc9c7b...`; `6cc9b0...` is pre-WP-13 and must not be described as current.
3. **`01_CURRENT_STATE.md`** — current status; code wins if they disagree.
4. **`03_EXPERIMENT_PLAN.md`** — experimental design.
5. **Code (`trustcal/`)** — truth for what runs.
6. **`04_LITERATURE_AND_GAPS.md`** — historical literature snapshot; claim audit is superseded by the two `CLAIMS_AUDIT.md` files.
7. **`02_P0_FIXES.md` and `06_AGENT_CHECKLIST.md`** — historical P0 record.

## Non-negotiable rules

- Do not claim efficacy from P0, mock runs, or integration tests.
- Do not run the Core matrix before the pilot passes G2.
- Do not run the old 15-condition × 5-dataset × 3-seed × 1,000-question matrix (~30,000 GPU-h).
- Do not use ECR as a primary or secondary endpoint; it is deprecated.
- Do not use BrokenMath/BrokenArXiv for claim-level evidence grounding or CCR; they are appendix-only.
- Do not assign PubMed/arXiv/S2 by agent identity; route by claim domain.
- Do not claim a formal trust bound or the R6 law before an independent proof check. The "verification ceiling" is a derived hypothesis, not a proved theorem.
- Do not claim "no prior work exists"; cite R²-MAD, TERA-RAG, and To Trust or Not.
- Do not build the 800-item benchmark.
- Do not put a colon in the paper title; use the approved no-colon wording.
- Do not submit the paper before the defence unless the supervisor explicitly reopens that decision.
- Do not commit secrets, raw data, model weights, or `out/` artifacts.

## Historical status — 8 November 2026 audit (not current)

> **Historical diagnosis.** The scores and blockers below were recorded before P0. They are retained for context, not as current status. P0 fixed the five blockers and most of the 19 warnings; see `00_START_HERE.md §3` and `02_P0_FIXES.md`.
>
> **Historical naming note (9 November 2026):** the retired stage labels were `C+` and `TACL full`; the current names are **Core run** and **Full run**.

- **Idea/plan score:** Core 5.50 / Weighted 5.42 (compute excluded).
- **Then-current manuscript:** 2.5/10 as a paper; 6/10 as an FYDP mid-project report.
- **Projected after P0:** Core 6.25 / Weighted 6.21. **After the P1 reframe:** Core 7.63 / Weighted 7.53.
- **Five blockers then:** options not in prompts; first-number answer matcher; no final accuracy; injection arm had no retrieval/trust; ECR was invalid.
- **Branch state then:** a long-lived feature branch was ahead of `main`; `feat/p0-hardening` was the temporary integration branch. Both are retired.

## Update log

| Date | Change |
|---|---|
| 2026-11-08 | Created the agent doc set after five parallel audits (prior art, code, experiment design, Q1 positioning, datasets). Verified 206 tests; identified the GPQA-options, answer-matcher, no-accuracy, injection/trust, and ECR blockers. Added the R²-MAD/TERA-RAG/To Trust or Not preemption analysis and the benchmark/verification-ceiling reframe. |
| 2026-11-09 | P0 released: 13/13 gate, 514 tests, `main = dev = 2ae56a3`, tags `p0-gate`/`p0-release`. Refreshed the agent docs to post-P0 state. Corrected the pending placebo/oracle slice to **WP-18**, the Core matrix to GPQA/MMLU-Pro/HLE (EG-SSS at the v1.2 freeze), and the Full target to conditional 36/32 runs. Recorded the released prompt hash `bc9c7b...`; the old `6cc9b0...` hash is pre-WP-13. |

## What still needs updating

- **N1:** run the final-stack 96 GB smoke (not run); `check_stack.py --phase final`, `preflight.py --phase final --offline`, then `smoke_test.py --phase final`.
- **N2/WP-18:** implement B8-placebo/B8-oracle and `configs/experiments_full.yaml`; freeze the 32-vs-36-run Full definition.
- **N3:** 24-item benchmark calibration, then the 180-item v1.2 freeze and 300-item Full target.
- **N4:** human verifier audit (150–200 pairs, 2 annotators; target ≥0.75 balanced accuracy, κ ≥0.60). The lexical verifier scored 0.58 on the synthetic audit.
- **N5/G2:** pilot in December 2026.
- `docs/FYDP1_defence_Q&A.md` has stale status notes; check it against `01_CURRENT_STATE.md` before the defence.
- `IMPLEMENTATION_STATUS.md` should stay current with the P0 release.
- `literature_review/index.md`: check for unread papers before related-work work.
- The two manuscripts are engineering reports, not efficacy papers; update only after real results.
