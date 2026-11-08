# FYDP Agent Docs — Index

**Status date:** 8 November 2026  
**Canonical branch:** `feat/full-pipeline` (10 commits ahead of `main`)  
**Project:** *Trust-Calibrated Multi-Agent Scientific Deliberation for Mitigating Sycophantic Consensus in LLM Reasoning*

These docs are for LLM coding agents and human teammates. They are deliberately short, explicit, and test-driven. Read them in order.

| # | File | Read it when |
|---:|---|---|
| 00 | [`00_START_HERE.md`](00_START_HERE.md) | First. Orientation, score, top warnings, commands, repo map. |
| 01 | [`01_CURRENT_STATE.md`](01_CURRENT_STATE.md) | Before editing. What is real, mock-only, broken, or stale. |
| 02 | [`02_P0_FIXES.md`](02_P0_FIXES.md) | Before any GPU run. The 10 must-fix items with acceptance tests. |
| 03 | [`03_EXPERIMENT_PLAN.md`](03_EXPERIMENT_PLAN.md) | Before designing or running experiments. Reframe, endpoints, power, gates. |
| 04 | [`04_LITERATURE_AND_GAPS.md`](04_LITERATURE_AND_GAPS.md) | Before writing related work or a novelty claim. Verified prior art + missing refs. |
| 05 | [`05_WRITING_AND_VENUE.md`](05_WRITING_AND_VENUE.md) | Before editing the paper/thesis. Claim audit, rewrite rules, venue strategy. |
| 06 | [`06_AGENT_CHECKLIST.md`](06_AGENT_CHECKLIST.md) | The execution checklist for DeepSeek V4.1 Flash Max. Use it as the task board. |
| 07 | [`07_9PLUS_BLUEPRINT.md`](07_9PLUS_BLUEPRINT.md) | The risk-managed 9+ plan: theory, math, method, benchmark, causal study, agent leverage, and what will fail. |
| 08 | [`08_COMPUTE_COST.md`](08_COMPUTE_COST.md) | Vast.ai spot cost: GPU, bandwidth up/down, storage, overhead, and scenario budgets. |

**Team-facing one-pager:** [`../../UPDATE-CHECKLIST.md`](../../UPDATE-CHECKLIST.md) — share this with the whole team.

## Current status (8 November 2026)

- **Idea/plan score:** Core 5.50 / Weighted 5.42 (compute excluded).
- **Current manuscript:** 2.5/10 as a paper; 6/10 as an FYDP mid-project report.
- **After P0 fixes:** Core 6.25 / Weighted 6.21. **After the P1 reframe:** Core 7.63 / Weighted 7.53.
- **Canonical branch:** `feat/full-pipeline`; `main` is 10 commits behind.
- **Five blockers:** options not in prompts; first-number answer matcher; no final accuracy; injection arm has no retrieval/trust; ECR is invalid.
- **Do not run the matrix or submit the draft.** Start with `00_START_HERE.md`, then `02_P0_FIXES.md` and `06_AGENT_CHECKLIST.md`.

## Source-of-truth hierarchy

1. **Code** (`trustcal/`) is the truth for what runs.
2. **`01_CURRENT_STATE.md`** is the truth for status.
3. **`03_EXPERIMENT_PLAN.md`** is the truth for the experimental design.
4. **`02_P0_FIXES.md`** is the truth for what must change before a GPU run.
5. The blueprint, FYDP report, and journal preprint are **historical** until updated. Do not treat their claims as evidence.

## Non-negotiable rules

- Do not run the full 15-condition × 5-dataset × 3-seed × 1,000-question matrix. It is ~30,000 GPU-hours.
- Do not submit the current paper draft. It has no results and claims results it does not have.
- Do not claim "no prior work exists." See `04_LITERATURE_AND_GAPS.md`.
- Do not claim "formally bounded trust" until the simplex-floor bug is fixed and proved.
- Do not treat 3 seeds as independent samples. The unit of analysis is the question.
- Do not cite a reference that is not verified in `04_LITERATURE_AND_GAPS.md`.
- Do not commit secrets, raw data, model weights, or credentials.

## Update log

| Date | Change |
|---|---|
| 2026-11-08 | Created the agent doc set after five parallel audits (prior art, code, experiment design, Q1 positioning, datasets). Verified 206 tests pass; identified the GPQA-options, answer-matcher, no-accuracy, injection/trust, and ECR blockers. Added the R²-MAD/TERA-RAG/To Trust or Not preemption analysis and the benchmark/verification-ceiling reframe. |

## What still needs updating

- `main` must be merged with `feat/full-pipeline`.
- `docs/FYDP1_defence_Q&A.md` is stale (says trust/retrieval are not wired).
- `IMPLEMENTATION_STATUS.md` must reflect the P0 fixes after they land.
- `Papev_Summer26_6/cas-sc-template.tex` and `FYDP_Summer/4.implementation.tex`/`6.conclusion.tex` are placeholders; rewrite after results.
- `literature_review/index.md` has 5 unread papers; add the 2026 trust-aware frontier from `04_LITERATURE_AND_GAPS.md`.
