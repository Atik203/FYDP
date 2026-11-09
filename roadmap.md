# FYDP Roadmap — Trust-Calibrated Multi-Agent Scientific Deliberation

Phase-by-phase execution plan for **November 2026 – December 2027**. This file is the order-of-work source of truth for agents and the team. It is not a results document.

**Paper title:** *The Boundaries of Evidence-Grounded Trust in Multi-Agent Scientific Debate, with a Controlled Benchmark for Sycophantic Consensus.*

**Current release (9 November 2026):**

| Item | Value |
|---|---|
| Branches | `main` = release/deployed frontend; `dev` = development |
| Release tip | `2ae56a3` on both `main` and `dev`; `p0-release` tag = `7f2c11f`. |
| Tags | `p0-gate` = `055a244`; `p0-release` = `7f2c11f` |
| P0 gate | **13/13 passed, 0 failed, 0 pending** |
| Tests | **514 passed** |
| Report | `FYDP_Summer/out/fydp.pdf` — 57 pages, explicit pdfLaTeX, 0 errors/undefined refs |
| Journal | `Papev_Summer26_6/out/cas-sc-template.pdf` — 18 pages, explicit pdfLaTeX, 0 errors/undefined refs |
| Figures | six journal figures + two report-only figures at 6000 × 3375 (600+ DPI) |
| Frontend | `npm run build` passes and prerenders all routes; `npm run lint` exits 0 (warnings only) |
| Final stack | Qwen3.6-27B-FP8 / Gemma-4-26B-A4B-FP8 / Mistral-24B-AWQ, **69.73 GB** pinned |
| Final-stack smoke | **NOT RUN** — offline budget check only (69.73 GB < 80 GB); the 96 GB hardware smoke is the next gate |

**P0 is engineering readiness, not efficacy evidence.** No accuracy, CMR, or sign-reversal claim exists yet. The first claim waits for the pilot and Core run.

---

## 0. Agent rules — read before touching code

1. Read `AGENTS.md`, `trustcal/AGENTS.md`, `docs/GLOSSARY.md`, this roadmap, and `PRE_REGISTRATION.md`.
2. Work on a short-lived branch from `dev`: `next/<slice>`, in its own worktree. Push after every green checkpoint.
3. One owner per file. If a file is leased, send the owner a 3-line patch request; do not edit in parallel.
4. Every work package writes `experiments/next/WP-<id>.md` with commands, exact output, acceptance checkboxes, and known gaps.
5. Commit style: `type(scope): imperative summary`. Do not mix `docs/**` with `trustcal/**` or `frontend/**` in one commit.
6. Never push directly to `main`. Merge slices into `dev`; release `dev` → `main` only after a gate and a frontend build.
7. Never invent results, numbers, citations, or gold labels. Use placeholders and mark them.
8. Never commit secrets, `.env`, `results/`, or LaTeX `out/` artifacts.
9. Use explicit `pdflatex` for manuscripts; use `academic-student-writer` for prose and claims.
10. Delete the slice branch and worktree after merge. Keep only `main`, `dev`, and gate tags.

**Task report format:** Task → files changed → commands run → exact output → acceptance → next step. No “done” without a command and its output.

---

## 1. Gate ladder

| Gate | When | Scope | Pass condition |
|---|---|---|---|
| **G0** | Done 2026-09-16 | Vanilla MAD on 10 GPQA questions | 10/10 debates, 90/90 positions, 370.8 s mean |
| **P0** | Done 2026-11-09 | Engineering hardening | 13/13 checks, 514 tests, no undefined refs, 600 DPI figures |
| **G2** | Dec 2026 | Pilot run | Baseline CCR ≥0.30; trust AUROC ≥0.65; ≥65% correct-direction changes; injection κ ≥0.75 |
| **G3** | Jan 2027 | Core run | Primary accuracy/CMR measured; CIs; B8 > B8-no-trust direction; pre-registration frozen |
| **G3b/G4** | Feb 2027 | q/ρ sweeps | Sign reversal observed at the predicted boundary; placebo/oracle separate |
| **G5** | Feb–Mar 2027 | External validity | Same sign on a second model/domain or natural-divergence subset |
| **Results freeze** | Apr 2027 | All analyses | CIs, negative results, pre-registered contrasts, manifest trace |
| **Thesis** | Jun 2027 | Submission | Internal review, defence-ready |
| **Paper** | Aug–Dec 2027 | Submission | TACL/EMNLP/Q1 journal after defence |

**Do not reorder:** Final-stack smoke → WP-18 → pilot → Core run → Full run. The pilot and Core run are gates, not optional warm-ups.

---

## 2. Phase N1 — Final-stack hardware readiness (Nov 2026)

**Objective:** prove the pinned 96 GB stack serves all three checkpoints together before any Final run.

**Why it is first:** the offline check proves 69.73 GB of weights fits; it does not prove vLLM loads them, allocates KV cache, or survives the three-model load.

**Commands (on the 96 GB RTX PRO 6000):**

```bash
cd trustcal
PHASE=final bash setup.sh
python scripts/check_stack.py --phase final
python scripts/preflight.py --phase final --offline
python scripts/verify_env.py --check-servers
python scripts/smoke_test.py --phase final --limit 20
```

**Acceptance:** three `server OK` lines; all preflight checks OK; smoke test PASS; record peak `nvidia-smi` and per-instance loaded weights. If a server OOMs, lower that agent's `gpu_memory_utilization` in `models.yaml` and re-run. If Mistral's `auto` quant detection fails, set `quant: compressed-tensors`.

**Status (9 Nov 2026):** the offline check passes at 69.73 GB; the 96 GB hardware smoke has **not run**.

**Cost:** 60–100 GPU-h, **$80–120**. Do not start R6 without this PASS.

**Owner:** P2.

---

## 3. Phase N2 — WP-18 placebo and oracle arms (Nov–Dec 2026)

**Objective:** complete the 6-arm design before the Full run.

**Scope:**

- `B8-placebo`: B8 with shuffled evidence labels/verdicts. Tests whether the *signal*, not the extra machinery, causes the effect.
- `B8-oracle`: B8 with gold information — gold-answer trust, or gold-evidence-only on EG-SSS — frozen in WP-18. Upper bound, not a competitor.
- Runner/config switches, prompt handling, tests, and a separate Full-run matrix.
- Keep the current executable Core matrix at 4 conditions × 3 datasets × 2 seeds = **24 runs**. Conservative gate cap 1,280 GPU-h (9,600 debates at 400/cell); per-dataset plan GPQA 400 + MMLU-Pro 400 + HLE 200 = 8,000 debates / ~1,067 GPU-h.
- Add `configs/experiments_full.yaml` for the 6-arm Full run: 6 arms × 3 datasets × 2 seeds = 36 runs; 300-item benchmark target; planning envelope 1,440 GPU-h **if B8-oracle uses gold-answer trust**. If B8-oracle is gold-evidence-only on EG-SSS, the target is 32 runs and the GPU-h must be recomputed. Exact per-dataset caps are frozen in the v1.3 WP-18 amendment; EG-SSS joins at the v1.2 benchmark freeze.
- Update `PRE_REGISTRATION.md` with the 6-arm target and the executable subset (that file is maintained separately; this roadmap does not edit it).

**Acceptance:** mock B8-placebo and B8-oracle records validate; placebo does not match B8; oracle ranks at or above B8; `run_matrix.py --dry-run` shows 24 Core rows and 36 Full rows (32 if B8-oracle is EG-SSS-only); no change to the 13/13 gate.

**Owner:** P2 + P4; prompts/strategy support from P6 if needed.

---

## 4. Phase N3 — Benchmark calibration and freeze (Nov 2026–Feb 2027)

**Objective:** build EG-SSS at the scale the design can defend.

**Scope:** Core v1.0 runs on GPQA-Main + MMLU-Pro + HLE. EG-SSS is not in the v1.0 Core matrix; it freezes at 180 items under v1.2 and scales to the 300-item Full target.

**Ladder:**

| Size | Role | Annotation | Decision |
|---:|---|---:|---|
| **24** | Calibration batch | ~1 week | Start here; if `H_attempt > 2.0` or defect >15%, cut to 120 immediately |
| **180** | EG-SSS v1.2 freeze (not in the v1.0 Core matrix) | ~410 h | Freeze by Jan 2027 |
| **300** | Full-run benchmark target | ~684 h | Target by Feb 2027 |
| **600** | Stretch | ~1,368 h | Only with 2–3 dedicated annotators |
| **800** | No-go | ~1,824 h | Do not build |

**Item rules:** 3 domains (biomed, phys/chem, math/CS); 3–6 atomic claims per position; gold evidence and verdicts; five conditions (evidence available/absent/placebo/contradictory × pressure); original items CC BY 4.0; gated dataset text not redistributed.

**Acceptance:** 24-item calibration report; 180-item freeze with κ and defect rate; 300-item target only if the 180 set is clean.

**Owner:** P3 + annotators.

---

## 5. Phase N4 — Verifier audit (Nov–Dec 2026)

**Objective:** turn the lexical verifier into a measured component.

**Scope:** 150–200 hand-labeled claim–passage pairs, two annotators; balanced accuracy, precision/recall/F1, coverage, Cohen's κ; shared vs private claim accuracy; optional NLI/LLM-judge comparison.

**Acceptance:** balanced accuracy ≥0.75 and κ ≥0.60. If 0.60–0.75, swap to NLI/LLM judge and re-audit. If <0.60, the paper becomes a measurement/negative result; do not claim a high-q result.

**Owner:** P6 + annotators.

---

## 6. Phase N5 — Pilot run R2 (Dec 2026)

**Objective:** verify wiring and estimate the effect before spending Core-run money.

**Scope:** 100–150 questions; Dev stack; B3, B8-no-trust, B8; injection on/off; trust on/off; 24-item benchmark subset; q/ρ re-aggregation design frozen.

**G2 pass:** baseline CCR ≥0.30; trust AUROC ≥0.65; ≥65% correct-direction changes; injection κ ≥0.75; no schema-invalid records.

**Cost:** ~112 GPU-h, **$50–100**.

**Owner:** P2 + P4.

---

## 7. Phase N6 — Core run R3 (Jan 2027)

**Objective:** the minimum causal package.

**Arms:** B3, B4-matched, B8-no-trust, B8.

**Design:** GPQA-Main + MMLU-Pro + HLE; 400 + 400 + 200 items; 2 seeds; **24 runs, 8,000 planned debates / ~1,067 GPU-h**; **1,280 GPU-h conservative gate cap**; EG-SSS-180 freezes under v1.2, outside this matrix.

**Primary endpoint:** final-answer accuracy on pressure-eligible items, paired B8 vs B8-no-trust. **Co-primary:** CMR. Secondary: ARR, trust AUROC/Brier, verifier balanced accuracy, citation faithfulness.

**G3 pass:** primary endpoint measured with CIs; B8 > B8-no-trust direction; pre-registration unchanged.

**Cost:** 1,280 GPU-h conservative cap (planned ~1,067 GPU-h), **$420–580**.

**Owner:** P2 + P4.

---

## 8. Phase N7 — Full run R5 (Feb 2027)

**Objective:** the complete 6-arm matrix for the paper.

**Arms:** B3, B4-matched, B8-no-trust, B8, B8-placebo, B8-oracle.

**Design:** 6 arms × 3 datasets × 2 seeds = 36 runs; 300-item benchmark target; planning envelope 1,440 GPU-h **if B8-oracle uses gold-answer trust** (10,800 debates at 300/dataset). If B8-oracle is gold-evidence-only on EG-SSS, the target is 32 runs and the GPU-h must be recomputed. Exact per-dataset caps are frozen in the v1.3 WP-18 amendment; EG-SSS joins at the v1.2 benchmark freeze. Human eval starts in parallel. Full is a separate Final-stack matrix; do not assume Core cells are reusable. The $900–1,200 is the Full-run budget envelope. A true top-up can be computed only if the stack and model revisions match.

**G4/G5 pass:** placebo does not match B8; oracle separates; the sign reversal appears at the predicted q/ρ boundary; one external-validity check replicates the sign.

**Owner:** P2 + P4 + P5.

---

## 9. Phase N8 — Human evaluation and SDT (Mar 2027)

**Scope:** 150–200 paired items, 3 raters; UWS/EWE/ARR taxonomy; citation faithfulness (300 pairs); expert ceiling (60 items); κ/ICC; SDT 3-axis for the paper, 6-axis for the thesis.

**Acceptance:** κ ≥0.60; the trust plane separates calibrated from sycophantic panels; the human labels support or qualify the automatic endpoints.

**Owner:** P5 + P4.

---

## 10. Phase N9 — Law-testing and ablations (Apr 2027)

**Scope:** q sweep, ρ measurement/manipulation, granularity (claim vs document vs shuffled), shared-error floor, N/K/α/β robustness, natural-divergence subset.

**Rule:** run only if Core/Full show a real effect. R6 remains a **derived law** until an independent proof check signs it.

**Acceptance:** pre-registered contrasts; CIs; negative results reported. Results freeze at the end of April.

**Owner:** P1 + P4.

---

## 11. Phase N10 — Thesis (May–Jun 2027)

**Scope:** full 6-arm matrix, 300–600 benchmark, 6-axis SDT, full proofs, SEA-Cert, negative results, accreditation, reproducibility.

**Milestones:** chapters 3/6/7/8 by May; internal review; **thesis submission June 2027; defence June/July 2027.** Do not force a paper deadline before the defence.

---

## 12. Phase N11 — Paper (Aug–Dec 2027)

**Scope:** the sharp boundary/causal/benchmark paper from the thesis.

**Venue:** TACL rolling, EMNLP 2028, or a Q1 journal. TACL is the venue, not an experiment stage. No dual submission.

---

## 13. Budget

| Item | GPU-h | Cash |
|---|---:|---:|
| Final-stack smoke | 60–100 | $80–120 |
| Pilot | ~112 | $50–100 |
| Core run | 1,280 cap (planned ~1,067) | $420–580 |
| Full run (1,440 envelope; separate Final-stack matrix; not a reuse of Core cells) | ~1,440 | $900–1,200 |
| Law-testing | ~3,913 at 8 min | $1,400–1,900 (only if effect) |

**Hard stop: $1,350 before law-testing.** GPU rates: A6000 80 GiB **$0.263/hr**; RTX PRO 6000 Max-Q **$0.74–1.02/hr**; S **$1.432/hr**; storage **$0.20/GB-month**; bandwidth **$0.004–0.033/GB**. Persist the cache; batch sessions; copy results before destroying the instance.

The Full planning envelope assumes 36 runs at 300 items/dataset (10,800 debates) and a gold-answer B8-oracle. The 32-run gold-evidence-only variant has no frozen GPU-h figure yet. Core is planned on the Dev stack; Full is a separate Final-stack matrix, so Core cells are not assumed reusable unless the stack and model revisions match.

---

## 14. Branch and release model

```text
main    release trunk; the web frontend deploys from here
dev     development/integration branch
next/*  short-lived slice branches; deleted after merge
```

- Slice: `next/<slice>` from `dev` → worktree → push → merge into `dev` → delete.
- Release: `dev` → `main` only after a gate, a clean `npm run build`, and the PDF/figure checks.
- Tags: `p0-gate`, `p0-release` exist. Future gates use `g2`, `g3`, `g4`, `results-freeze`, `thesis`, `paper`.
- No direct `main` pushes. No long-lived feature branches.

---

## 15. Do not do

- Do not run the main matrix before the pilot passes.
- Do not claim efficacy from P0 or from mock/integration tests.
- Do not use BrokenMath/BrokenArXiv for evidence grounding or CCR; they are appendix-only.
- Do not use ECR as a primary endpoint.
- Do not compare B8 to B4 without matching retrieval and prompts.
- Do not claim R6 is a theorem before the proof check.
- Do not build 800 benchmark items.
- Do not commit secrets, `results/`, or `out/` artifacts.
- Do not put a colon in the paper title; use the approved no-colon wording.
- Do not submit the paper before the defence unless the supervisor explicitly reopens that decision.

---

## 16. Links

| Doc | Purpose |
|---|---|
| `docs/GLOSSARY.md` | Core run / Full run / TACL naming |
| `PRE_REGISTRATION.md` | Frozen endpoints, arms, analysis, stopping rules |
| `docs/agent/03_EXPERIMENT_PLAN.md` | Power, design, benchmark details |
| `docs/agent/08_COMPUTE_COST.md` | Real Vast.ai costs |
| `experiments/p0/WAVE2.md` | P0 landing record |
| `trustcal/IMPLEMENTATION_STATUS.md` | What is wired vs approximate |
| `Papev_Summer26_6/CLAIMS_AUDIT.md` | Journal claim changes |
| `FYDP_Summer/CLAIMS_AUDIT.md` | Report claim changes |
