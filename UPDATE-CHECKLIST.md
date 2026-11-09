# Team Update Checklist — FYDP

**Date:** 9 November 2026
**Purpose:** one page the whole team can read: where we are, what changed, what happens next, what it costs, and what not to do.

**Full execution plan:** `roadmap.md`. **Current code status:** `trustcal/IMPLEMENTATION_STATUS.md`. **Stage names:** `docs/GLOSSARY.md`.

---

## 1. Where we are

| Item | Value |
|---|---|
| Branches | `main` = release/deployed frontend; `dev` = development |
| Release tip | `2ae56a3` on both `main` and `dev`; `p0-release` tag = `7f2c11f`. |
| Tags | `p0-gate` = `055a244`; `p0-release` = `7f2c11f` |
| P0 gate | **13/13 passed, 0 failed, 0 pending** |
| Tests | **602 passed** (514 at the P0 release) |
| Report | `FYDP_Summer/out/fydp.pdf` - 68 pages, 80 cited works, explicit pdfLaTeX, 0 errors/undefined refs |
| Journal | `Papev_Summer26_6/out/cas-sc-template.pdf` - 19 pages, 71 cited works, explicit pdfLaTeX, 0 errors/undefined refs |
| Figures | six journal + two report-only figures at 6000 × 3375 (600+ DPI) |
| Frontend | `npm run build` passes and prerenders all routes; `npm run lint` exits 0 |
| Final stack | Qwen3.6-27B-FP8 / Gemma-4-26B-A4B-FP8 / Mistral-24B-AWQ, **69.73 GB** pinned |
| Final-stack smoke | **NOT RUN** — offline budget check only (69.73 GB < 80 GB); the 96 GB hardware smoke is the next gate |

**P0 is engineering readiness, not efficacy evidence.** No accuracy, CMR, or sign-reversal claim exists yet.

---

## 2. Score outlook

| Stage | Core | Weighted | Meaning |
|---|---:|---:|---|
| Current idea/plan | 5.50 | 5.42 | Plausible; not top-Q1 yet |
| After P0 | 6.25 | 6.21 | Instrument fixed; still not novel enough alone |
| Core run | 7.63 | 7.53 | Strong Q1 paper if the causal effect holds |
| Full run | 8.00 | 7.89 | Strong Q1 journal paper |
| Full thesis + 300–600 benchmark + SDT + theory | 8.38 | 8.37 | 9+ tail becomes possible |

Working estimates, not promises. 9+ probability: **20–30% unconditional; 35–45% conditional** on measured ρ > 0.4 and a real sign reversal.

The manuscript is now honest and internally consistent, but it is **not a results paper**. Do not submit it before the Core/Full results.

---

## 3. What changed in P0

| # | Problem | Status |
|---:|---|---|
| 1 | Answer choices missing from prompts | ✅ options rendered in every MCQ prompt; seeded shuffle; permutation stored |
| 2 | Answer matcher wrong | ✅ explicit-span parser, scientific notation, units, MCQ mapping; 50-case corpus at 100% |
| 3 | No final-answer accuracy | ✅ accuracy + counts + question-clustered CI in records and summary |
| 4 | Injection arm had no trust | ✅ B8+injection wired; check 8 PASS |
| 5 | ECR invalid | 🟡 deprecated; accuracy/CMR primary, trust AUROC/Brier secondary |
| 6 | Trust floor broken | ✅ logit accumulation → softmax → simplex projection; 10k bounds draws |
| 7 | Final trust lagged positions | ✅ trust computed from final positions; `trust_for_positions` recorded |
| 8 | Verifier was word overlap | 🟡 verifier interface implemented; lexical default; human audit pending |
| 9 | B8 vs B4 confounded | ✅ B8-no-trust is the primary matched control; B4-matched uses same partition |
| 10 | Baselines approximate | 🟡 B9/B10 still labeled approximations; do not claim “+X% over iMAD” |
| 11 | Datasets did not fit the method | ✅ BrokenMath/BrokenArXiv appendix-only; GPQA + MMLU-Pro + EG-SSS primary |
| 12 | Matrix too big | ✅ Core matrix 24 rows / 1,280 GPU-h; pre-registration v1.0 |
| 13 | Cost ignored bandwidth/storage | ✅ Vast.ai spot model with bandwidth/storage/spot interruptions |
| 14 | Paper overclaimed | ✅ claims audit and report chapters updated; no efficacy claims |

---

## 4. Next 90 days

| When | Work | Gate / output |
|---|---|---|
| **Nov 2026** | Final-stack 96 GB smoke (NOT RUN); WP-18 placebo/oracle; 24-item calibration; verifier audit start | smoke PASS; 6-arm support; calibration report |
| **Dec 2026** | Pilot run 100–150 questions; injection κ | **G2** |
| **Jan 2027** | Core run: 4 arms, GPQA 400 + MMLU-Pro 400 + HLE 200, 2 seeds; 1,280 GPU-h cap; EG-SSS-180 freeze (v1.2) | **G3** |
| **Feb 2027** | Full run: 6 arms; 300 benchmark; human eval start | **G4/G5** |
| **Mar 2027** | Human eval 150–200; SDT; expert ceiling | analysis freeze |
| **Apr 2027** | q/ρ sweeps, granularity, shared-error floor, ablations | results freeze |
| **May–Jun 2027** | Thesis chapters, internal review, submission | thesis submit June |
| **Jun–Jul 2027** | Defence | defence |
| **Aug–Dec 2027** | Paper | TACL / EMNLP 2028 / Q1 journal |

**Order:** Final smoke → WP-18 → pilot → Core → Full. Do not run the matrix before the pilot.

---

## 5. Benchmark decision

| Size | Role | Annotation | Decision |
|---:|---|---:|---|
| **24** | Calibration batch | ~1 week | Start now; if `H_attempt > 2.0` or defect >15%, cut to 120 |
| **180** | EG-SSS v1.2 freeze (not in the v1.0 Core matrix) | ~410 h | Freeze January 2027 |
| **300** | Full-run benchmark target | ~684 h | Target February 2027 |
| **600** | Stretch | ~1,368 h | Only with 2–3 dedicated annotators |
| **800** | No-go | ~1,824 h | Do not build |

A 300-item set with clean gold is better than a 600-item set with bad gold.

---

## 6. Cost

| Path | Cost |
|---|---:|
| Final-stack smoke | $80–120 |
| Pilot | $50–100 |
| Core run | **$420–580** |
| Full run (separate Final-stack matrix; not a reuse of Core cells) | **$900–1,200** |
| Law-testing | $1,400–1,900 (only if effect) |

**Hard stop: $1,350 before law-testing.** A6000 80 GiB **$0.263/hr**; RTX PRO 6000 Max-Q **$0.74–1.02/hr**; S **$1.432/hr**; storage **$0.20/GB-month**; bandwidth **$0.004–0.033/GB**. Persist the cache; batch sessions; copy results; destroy instances.

---

## 7. Who does what

| Person | Job | Main files |
|---|---|---|
| **P1** | Theory, paper/thesis lead | `docs/agent/07_9PLUS_BLUEPRINT.md`, theory chapters |
| **P2** | GPU runs, runner, reproducibility | `runner.py`, `scripts/`, `08_COMPUTE_COST.md` |
| **P3** | Benchmark + annotation | EG-SSS, `eval/datasets.py` |
| **P4** | Statistics + causal analysis | `eval/stats.py`, `eval/endpoints.py` |
| **P5** | Human evaluation | `scripts/human_eval.py`, rubric |
| **P6** | Retrieval + verifier | `retrieval/`, `verifier.py` |

One owner per file. Do not edit the same file in parallel.

---

## 8. Branch rules

```text
main    release trunk; the web frontend deploys from here
dev     development/integration branch
next/*  short-lived slice branches; deleted after merge
```

- Slice: `next/<slice>` from `dev` → worktree → push → merge into `dev` → delete.
- Release: `dev` → `main` only after a gate, a clean `npm run build`, and the PDF/figure checks.
- No direct `main` pushes. No long-lived feature branches.
- Tags: `p0-gate`, `p0-release` exist; future gates use `g2`, `g3`, `g4`, `results-freeze`, `thesis`, `paper`.

---

## 9. What not to do

- Do not run the main matrix before the pilot.
- Do not claim efficacy from P0 or from mock/integration tests.
- Do not use BrokenMath/BrokenArXiv for evidence grounding or CCR.
- Do not use ECR as a primary metric.
- Do not compare B8 to B4 without matching retrieval and prompts.
- Do not claim R6 is a theorem before the proof check.
- Do not build 800 benchmark items.
- Do not put a colon in the paper title; use the approved no-colon wording.
- Do not commit secrets, `results/`, or `out/` artifacts.
- Do not submit the paper before the defence unless the supervisor explicitly reopens that decision.

---

## 10. How to report

```markdown
## Task
<one line>

## Files changed
- path:line — what changed

## Commands run
```bash
<exact command>
```

## Results
<exact output>

## Done when
- [ ] criterion

## Next step
<one action>
```

No “done” without a command and its output.

---

## 11. Links

| Doc | Purpose |
|---|---|
| `roadmap.md` | Phase-by-phase execution plan |
| `docs/GLOSSARY.md` | Core run / Full run / TACL naming |
| `PRE_REGISTRATION.md` | Frozen endpoints, arms, analysis |
| `docs/agent/03_EXPERIMENT_PLAN.md` | Design, power, benchmark |
| `docs/agent/08_COMPUTE_COST.md` | Real Vast.ai costs |
| `experiments/p0/WAVE2.md` | P0 landing record |
| `trustcal/IMPLEMENTATION_STATUS.md` | What is wired vs approximate |
| `Papev_Summer26_6/CLAIMS_AUDIT.md` | Journal claims |
| `FYDP_Summer/CLAIMS_AUDIT.md` | Report claims |
