# 01 — Current State

**Snapshot:** 11 November 2026. **Branches:** `main` = `dev` = `v0.2.1`. **Tags:** `p0-gate` = `055a244`; `p0-release` = `7f2c11f`. **P0 is released; no efficacy results exist.**

This file is the status source of truth. If code and this file disagree, **code wins**; update this file and report the discrepancy. The order of work is `roadmap.md`.

---

## 1. Status at a glance

Legend: ✅ real / tested / released; 🟡 implemented but partially wired, unvalidated, or pending a human step; 🔴 not implemented; 🚫 deprecated.

| Area | Status | Evidence | What it means |
|---|---|---|---|
| Gate 0 vanilla MAD | ✅ | `experiments/gate0/README.md` | 10/10 debates, 90/90 positions, 370.8 s/debate on Dev |
| vLLM serving (Dev) | ✅ | Gate 0 | Three quantized models on one A6000 48 GB |
| 4-bit main stack offline check | ✅ | `trustcal/scripts/check_stack.py --phase fourbit` | Qwen3.8-27B-AWQ-INT4 / Gemma-4-26B-A4B-AWQ / Mistral-24B-AWQ = **53.26 GB** pinned |
| Final stack offline check | ✅ | `trustcal/scripts/check_stack.py --phase final` | Qwen3.8-27B-FP8 / Gemma-4-26B-A4B-FP8 / Mistral-24B-AWQ = **73.68 GB** pinned |
| Final-stack 96 GB smoke | 🔴 | Not run | Hardware load/KV-cache/three-server test is **N1** |
| Debate loop | ✅ | `orchestrator/debate.py`; tests | Runs with options, evidence, injection, and trust; no paid run yet |
| Trust math | ✅ | `trust/update.py`; 10k-input tests | Simplex projection with floor/ceiling; neutral no-op; claim-count normalization |
| Injection | ✅ | `orchestrator/injection.py`; tests | One-shot external consensus; neutral control; ties excluded |
| Retrieval clients | 🟡 | `retrieval/sources.py` | Real HTTP code; live APIs are not exercised in CI |
| Verdicts | 🟡 | `retrieval/verifier.py` | Verifier interface landed; default is lexical. Synthetic audit: **0.58 balanced accuracy**. Human audit is **N4, pending** (target ≥0.75, κ ≥0.60) |
| Accuracy / CMR / CCR-0 / CCR-E / MPR-weighted / ARR | ✅ | `eval/metrics.py`; tests | Endpoints computed with raw counts and CIs; MPR uses the actual weighted answer |
| Trust AUROC / Brier / vote calibration | ✅ | `eval/metrics.py` | Secondary endpoints; compare against a constant-1/3 predictor |
| ECR | 🚫 | `eval/metrics.py` | Deprecated; not a primary or secondary endpoint |
| B1–B10 runner | ✅ | `runner.py`, `strategies.py` | Core arms executable; approximate baselines carry a fidelity label |
| Datasets and routing | ✅ | `configs/datasets.yaml` | Revisions pinned; claim-domain routing; stratified sampling; eligible n reported |
| Core matrix | ✅ | `configs/experiments.yaml`; `run_matrix.py --dry-run` | 4 conditions × 3 datasets (`gpqa_main`, `mmlu_pro`, `hle`) × 2 seeds = **24 rows**; 1,280 GPU-h cap |
| WP-18 placebo/oracle | 🔴 | Not implemented | B8-placebo/B8-oracle and `configs/experiments_full.yaml` are the next design slice |
| Human evaluation | 🟡 | `scripts/human_eval.py` | Tooling exists; no data; planned for March 2027 |
| Statistics | ✅ | `eval/stats.py` | Bootstrap/d/McNemar/Holm implemented; analysis waits for data |
| Docs | ✅ | `docs/agent/` | This set refreshed 9 Nov 2026; `02`, `04`, `06`, `09` are explicitly historical |
| Pre-registration | ✅ v1.0 + v1.1 erratum | `PRE_REGISTRATION.md` | Frozen. The v1.1 erratum records the released prompt hash `bc9c7b...`; `6cc9b0...` is pre-WP-13, not current |
| Manuscripts | ✅ engineering | `FYDP_Summer/out/fydp.pdf`; `Papev_Summer26_6/out/cas-sc-template.pdf` | 70 pp and 19 pp; 80 and 71 cited works; 0 errors/undefined refs; implementation and conclusion written; **no efficacy results** |

---

## 2. Branch and repository state

| Branch / ref | State | Action |
|---|---|---|
| `main` | Release trunk; `v0.2.1`; deploys the web frontend | Release only after a gate and a clean build |
| `dev` | Development/integration; `v0.2.1` | Work here through `next/<slice>` |
| `next/<slice>` | Short-lived; one worktree; deleted after merge | Create from `dev`; push after green checkpoints |
| `p0-gate` (tag) | `055a244` | Historical gate marker |
| `p0-release` (tag) | `7f2c11f` | P0 release marker |
| `phase-1-dev`, `phase-1-main-untested` (tags) | Retired snapshots | Do not recreate as branches |

- Only `main` and `dev` branches exist. Feature branches and extra worktrees are deleted; only `E:\FYDP` exists.
- **No direct `main` pushes.** Merge slices into `dev`; release `dev` → `main` only after a gate and a clean frontend build.
- Future gate tags: `g2`, `g3`, `g4`, `results-freeze`, `thesis`, `paper`.

---

## 3. What "experiment-ready" means

Experiment-ready means:

1. The treatment arm (B8) runs **with** injection and retrieval. — **True.**
2. The primary metrics (accuracy, CMR) are defined and computed on the actual output. — **True.**
3. The verifier is validated against human labels. — **Pending (N4).**
4. The trust operator satisfies its stated bound. — **True.**
5. The baseline comparisons are matched (same retrieval, prompts, compute). — **True** for B8 vs B8-no-trust and B4-matched.
6. The matrix fits the time budget. — **True:** 24 Core rows, 1,280 GPU-h cap.
7. A pilot has passed a pre-registered behavioral gate. — **Pending (N5/G2, Dec 2026).**

**Status: 1/2/4/5/6 true; 3 and 7 pending.** P0 released the engineering; it did not run the pilot or the human audit.

---

## 4. What P0 changed

The full fix record is `02_P0_FIXES.md` and `experiments/p0/WP-*.md`. Summary:

| Finding (8 Nov 2026) | Resolution at P0 release |
|---|---|
| GPQA/MMLU-Pro options never entered the prompt | Options rendered with a seeded permutation and stored in the record (P0-0) |
| First-number answer matcher | Answer-span parser + scorer, 50-case corpus, parser version (P0-1) |
| No final-answer accuracy | `final_answer`, `final_answer_correct`, accuracy + question-clustered CI (P0-2) |
| Injection arm had no retrieval/trust | B8 × injection × trust wired; 2×2 executable (P0-3/P0-9) |
| CCR undefined; MPR used majority; ECR invalid | Accuracy/CMR/CCR-0/CCR-E/MPR-weighted/ARR/AUROC/Brier; ECR deprecated (P0-4) |
| Trust floor violated; trust lagged positions; verbosity bias | Simplex projection, final-position update, claim-count normalization, telemetry (P0-5) |
| Verifier was a lexical fallback with no interface | Verifier protocol + lexical/cross-encoder/NLI/LLM-judge implementations + audit harness (P0-6). **Human audit pending N4** |
| B8 vs B4 confounded; trust line always present | B8-no-trust primary control; B4-matched; trust line removed when disabled (P0-7; landed as historical WP-13) |
| BrokenMath/ArXiv proof-only; source-by-agent confound | Excluded from primary matrix; claim-domain routing; pinned revisions (P0-8) |
| Injection protocol persisted / no neutral control | One-shot delivery, external consensus, ties excluded, neutral arm (P0-9) |
| 30,000 GPU-h matrix | Core 24 rows / 1,280 GPU-h cap; pre-registration v1.0 (P0-10) |
| No manifest / resume mismatch | `run_manifest.json`, `manifest_hash`, resume refusal, analyze guard (P0-11) |
| `main` behind; stale docs; paper claimed results | `main` = `dev`; docs reconciled; manuscripts rewritten as engineering reports (P0-12) |

### Still open after P0

| Item | Owner phase | Acceptance |
|---|---|---|
| Final-stack 96 GB smoke | **N1**, Nov 2026 | `check_stack.py --phase final`; `preflight.py --phase final --offline`; three `server OK`; `smoke_test.py --phase final` PASS. **Not run.** |
| WP-18 B8-placebo/B8-oracle + Full matrix | **N2**, Nov–Dec 2026 | Mock records validate; placebo ≠ B8; oracle ≥ B8; dry-run shows 24 Core rows and the conditional Full rows; **freezes 32-vs-36-run definition** |
| 24-item calibration → 180 → 300 | **N3**, Nov 2026–Feb 2027 | Calibration report; 180-item freeze with κ and defect rate; 300 only if clean |
| Human verifier audit | **N4**, Nov–Dec 2026 | 150–200 pairs, 2 annotators; balanced accuracy ≥0.75, κ ≥0.60. Current lexical verifier 0.58 on the synthetic audit |
| Pilot / G2 | **N5**, Dec 2026 | Baseline CCR ≥0.30; trust AUROC ≥0.65; ≥65% correct-direction changes; injection κ ≥0.75 |
| Core / G3 | Jan 2027 | Primary accuracy/CMR with CIs; B8 > B8-no-trust direction; pre-registration unchanged |
| Full / G4-G5 | Feb 2027 | Placebo ≠ B8; oracle separates; sign reversal at predicted q/ρ boundary; external validity |

### Historical code-level findings

The detailed pre-P0 findings (injection without retrieval, CCR=0 in B8, `evidence_introduced` unset, ECR anti-correlation, trust lag, verifier lexical overlap, B4 confound, baseline approximations, dataset/source mismatch, matrix size, pilot design, manuscript overclaims) are preserved in `02_P0_FIXES.md` §P0-0–P0-12 and the 8 Nov 2026 audit snapshot. They are **historical**; do not cite them as current defects.

---

## 5. Manuscript status

- **Report:** `FYDP_Summer/out/fydp.pdf` - 70 pages, 80 cited works, explicit pdfLaTeX, 0 errors/undefined refs. The implementation and conclusion are written. It is an **engineering report for the full project**, not an efficacy paper.
- **Journal:** `Papev_Summer26_6/out/cas-sc-template.pdf` - 19 pages, 71 cited works, explicit pdfLaTeX, 0 errors/undefined refs. Same caveat.
- **Claim audits:** `Papev_Summer26_6/CLAIMS_AUDIT.md` and `FYDP_Summer/CLAIMS_AUDIT.md` are the authoritative record of the 9 Nov 2026 claim changes. `04_LITERATURE_AND_GAPS.md §7` is the historical source.
- **No results claim:** do not write accuracy, CCR, CMR, trust AUROC, or sign-reversal claims until the pilot/Core data exist. The abstract must not claim an effect.

---

## 6. Docs status

| File | Status | Action |
|---|---|---|
| `docs/FYDP1_defence_Q&A.md` | Status notes may be stale | Check against this file before the defence; do not assume it reflects P0 |
| `roadmap.md` | Current | Order-of-work source of truth |
| `docs/blueprint.md` | Historical design | Do not treat as evidence; its frozen invariants predate P0-5 |
| `Papev_Summer26_6/cas-sc-template.tex` | Engineering report | Update only after real results; no efficacy claims yet |
| `FYDP_Summer/4.implementation.tex`, `6.conclusion.tex` | Written for P0 | No longer empty placeholders; still no efficacy results |
| `literature_review/index.md` | Working index | Check for unread papers before related-work work |

---

## 7. What can be trusted today

- Gate 0 timings and transcript: `experiments/gate0/`.
- P0 gate results, test counts, and work-package records: `experiments/p0/`.
- The code paths for vanilla MAD, mock end-to-end, options/parser, trust projection, metrics, manifest, and verifier interface.
- The offline final-stack fit check (73.68 GB), **not** a hardware serving result.
- The compiled page counts and the absence of LaTeX errors/undefined references.
- The model-serving lessons from Gate 0 (quantization, vLLM nightly, sequential startup).

## 8. What cannot be trusted today

- Any efficacy claim (accuracy, CMR, CCR, trust AUROC, sign reversal). No paid experiment beyond Gate 0 exists.
- Any claim that the injection arm alone tests the mechanism; the full B8+injection+trust path is wired but not run at scale.
- Any claim that B8 beats B4/iMAD/ConsensAgent; no real comparison exists and the approximate baselines carry fidelity labels.
- Any claim of a formal bound or the R6 law; the theory is derived/not proved until an independent check.
- Any claim of "no prior work"; see `04_LITERATURE_AND_GAPS.md`.
- Any claim that the final stack serves on 96 GB; the hardware smoke is **not run**.

---

## 9. Definition of done for the next release (P0 → G2)

- [x] `pytest` green: **514 passed** at `p0-release`.
- [x] B8 + injection runs end-to-end on mocks, with `consensus`, `targets`, `evidence_introduced`, `final_answer`.
- [x] Accuracy, CMR, CCR-0, CCR-E, MPR-weighted, ARR, trust AUROC/Brier computed and unit-tested.
- [x] Trust update satisfies `min >= floor`, `sum == 1` on 10k random inputs.
- [ ] Verifier human audit: balanced accuracy ≥0.75 on ≥150 pairs, κ ≥0.60. **Pending N4.**
- [x] B8 vs B8-no-trust differs only in the trust line (historical WP-13).
- [x] Dataset revisions pinned; eligible n reported per dataset.
- [x] Core matrix ≤1,500 GPU-h; pre-registration v1.0 + v1.1 erratum frozen.
- [ ] WP-18 placebo/oracle + Full matrix config. **Not implemented.**
- [ ] Final-stack 96 GB smoke. **Not run.**
- [ ] Pilot passes G2. **Pending Dec 2026.**
- [x] Docs updated; `main` = `dev` with the full pipeline.
