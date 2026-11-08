# 01 — Current State

**Snapshot:** 8 November 2026. **Canonical branch:** `feat/full-pipeline`. **Public default:** `main` (10 commits behind).

This file is the status source of truth. If code and this file disagree, **code wins**; update this file and report the discrepancy.

---

## 1. Status at a glance

Legend: ✅ real / tested; 🟡 implemented but mock-only or partially wired; 🔴 broken, stub, or invalid for the paper claim.

| Area | Status | Evidence | What it means |
|---|---|---|---|
| Gate 0 vanilla MAD | ✅ | `experiments/gate0/README.md` | 10/10 debates, 90/90 positions, 370.8 s/debate on Dev |
| vLLM serving | ✅ | Gate 0 | Three quantized models on one A6000 48 GB |
| Debate loop | 🟡 | `orchestrator/debate.py` | Runs; trust wired; final trust lags final positions |
| Trust math | 🟡 | `trust/update.py`, tests | Unit-tested; floor violated after renormalization |
| Injection | 🟡 | `orchestrator/injection.py` | Implemented; persistent system prompt; no trust/retrieval in the injection arm |
| Retrieval clients | 🟡 | `retrieval/sources.py` | Real HTTP code; live APIs untested in CI |
| Verdicts | 🔴 | `retrieval/verdicts.py` | Lexical overlap; LLM judge not wired; no human validation |
| CCR | 🔴 | `eval/metrics.py:144` | `evidence_introduced` never set; full-system definition undefined |
| MPR | 🔴 | `eval/metrics.py:172-177` | Uses unweighted majority, not the trust-weighted answer |
| ECR | 🔴 | `eval/metrics.py:49-74` | ECE on a simplex; not a valid calibration metric |
| B1–B10 runner | 🟡 | `runner.py`, `strategies.py` | Scaffold works; B6/B9/B10 approximate; matrix has no injection flag |
| Datasets | 🟡 | `configs/datasets.yaml` | GPQA pinned; BrokenMath/BrokenArXiv/HLE/MMLU-Pro = `main`; only GPQA live-tested |
| Matrix | 🔴 | `configs/experiments.yaml` | 15×5×3×1,000 ≈ 30,000 GPU-h; no injection flag |
| Human eval | 🟡 | `scripts/human_eval.py` | Tooling exists; no data; n=60 underpowered; Likert treated as nominal |
| Statistics | 🟡 | `eval/stats.py` | Bootstrap/d/McNemar/Holm exist; not wired to cluster by question |
| Docs | 🔴 | `docs/FYDP1_defence_Q&A.md` | Stale: says trust/retrieval are not wired; code now wires them |
| Paper draft | 🔴 | `Papev_Summer26_6/cas-sc-template.tex` | Results/implementation/conclusion are placeholders; abstract claims results |

---

## 2. Branch and repository state

| Branch | State | Action |
|---|---|---|
| `feat/full-pipeline` | Canonical; 10 commits ahead of `main`; clean | Work here |
| `main` | Public default; old skeleton | Merge `feat/full-pipeline` before sharing |
| `Phase-1-dev` | Snapshot; Dev stack default | Do not let it diverge |
| `Phase-1-main` | Snapshot; Final stack default | Do not let it diverge |

**First practical task:** merge `feat/full-pipeline` into `main` (or change the GitHub default branch). The public repo link currently shows the old code.

---

## 3. What "phase-complete" means

The codebase has modules and tests for every phase. That is **not** the same as experiment-ready. Experiment-ready means:

1. The treatment arm (B8) runs **with** injection and retrieval.
2. The primary metric (CCR) is defined and computed on the actual output.
3. The verifier is validated against human labels.
4. The trust operator satisfies its stated bound.
5. The baseline comparisons are matched (same retrieval, prompts, compute).
6. The matrix fits the time budget.
7. A pilot has passed a pre-registered behavioral gate.

None of 1–7 is true today. See `02_P0_FIXES.md`.

---

## 4. Critical code-level findings

### 4.0 The five blockers to read first

| # | Blocker | Evidence | Consequence |
|---:|---|---|---|
| 1 | **GPQA/MMLU-Pro options never enter the prompt** | `eval/datasets.py:59-65` builds options; `agents/prompts.py:19-27`, `debate.py:79-82` never pass them; GPQA correct answer is always option A | Accuracy, injection eligibility, CCR, MPR on GPQA/MMLU-Pro are invalid. Gate 0 answers are free-form to "which of the following" with no choices. |
| 2 | **Answer matcher takes the first number in the text** | `eval/answers.py:40-51`; `10^-4 eV` → 10.0; `Product 3 contains 11` → 3.0; `The answer is B` → wrong | Gate 0: 4/30 "correct" labels are accidental numeric coincidences; agent 1 is 0/10. All accuracy/CCR/MPR inherit this. |
| 3 | **No final-answer accuracy anywhere** | `MetricSummary` (`metrics.py:109-131`), `summary.json` (`runner.py:287-302`), matrix table (`run_matrix.py:307-319`) | The paper cannot answer "does trust improve accuracy?" and the matrix is not a results table. |
| 4 | **Injection arm has no retrieval/trust; B8 has no injection** | `experiments.yaml:80-82`; `run_matrix.py:180-188`; `runner.py:407-409`; `debate.py:102` | The central claim is untested by design. |
| 5 | **ECR is anti-correlated with correctness** | `metrics.py:49-74`; probe: all-correct 0.333, all-wrong 0.667, perfect-ranking 1/3-correct 0.867 | The >0.80 target is not a calibration statement; it rewards wrong panels. |

### 4.0b Test and environment reality

- `pytest` reports **206 passed** (`.venv`, 16.98 s). The green suite tests the scaffolding, not the scientific claims.
- The local `.venv` lacks `datasets`, `sentence_transformers`, `torch`, and `langgraph`; the real pipeline cannot run there as-is. Use the GPU box or install the heavy deps.
- `trustcal/results/` contains only `.gitkeep`; Gate 0 is the only real run.

### 4.0c Other high-severity findings

| Finding | Evidence | Fix |
|---|---|---|
| **BrokenMath/BrokenArXiv are proof-only** | Official benchmark: 451/451 `proof`, `gold_answer` empty; 87/87 `proof`, `answer` empty; answer-type retention **0%** | Drop from primary matrix; separate premise-rejection appendix; do not use for CCR/ECR |
| **BrokenMath loader picks `solution`, not `gold_answer`** | `eval/datasets.py` `_ANSWER_KEYS` lacks `gold_answer` | Add `gold_answer`; use `benchmark` split; never use `train` as eval |
| **BrokenArXiv loader crashes** | Every `answer` is empty; `_row_to_question` raises | Skip/drop or use a rubric judge; do not use for answer matching |
| **HLE drops `answer_type`** | `_row_to_question` returns only question/answer/options | Preserve `answer_type`; filter MCQ/numeric vs free-form |
| **GPQA correct answer is always option A** | `datasets.py:59-65` builds `[Correct, Incorrect1..3]` | Shuffle with a recorded seed; update gold letter |
| **Source-by-agent confound** | `sources.py` maps agent→source; model families fixed to same agents; 12–21 pp bias | Route by claim domain; rotate sources; equalize evidence volume |
| **HLE is retrieval-resistant** | HLE is designed to be Google-proof | Use as abstention/negative control, not positive evidence |
| **First-N sampling** | `rows[:sample_cap]` | Stratified sampling by category/domain |
| **Revisions unpinned** | Four datasets use `main` | Pin commit hashes |
| Trust line present even when `use_trust=False` | `agents/prompts.py:34,47` | Omit the line for B3/B4/B8-no-trust |
| Neutral evidence is not a no-op | `update_trust([0.8,0.1,0.1],0,0)` → `[0.5017,0.2491,0.2491]` | Keep logits or use an identity-preserving update |
| B5 self-consistency can sample identical outputs | `strategies.py:84-88`; one client, same seed | Per-sample seed |
| B6/B9/B10 unfaithful | `strategies.py:91-150,203-277` | Faithful implementation or label approximation |
| Per-claim evidence not stored | `debate.py:60-68`; `runner.py:167-169` | Store claim ↔ passage ↔ score ↔ verdict |
| Resume has no config hash | `runner.py:97-102,360-370` | Run manifest; refuse mismatch |
| Dataset revisions unpinned | `datasets.yaml:16,25,32,47` | Commit hashes |
| Temperature/rounds ignored | `RunConfig.temperature` never passed; `rounds_for_phase` wins | Pass/log explicitly |
| Source assignment confound | `sources.py:224-232`; `debate.py:59-68` | Shared corpus / rotate sources |
| Only first 3 passages shown but up to 8 judged | `debate.py:59-68`; `retrieval/pipeline.py:100-104` | Align judged/shown evidence |
| Stats bootstrap over 3 seeds, not questions | `run_matrix.py:197-215`; `stats.py:27-42` | Cluster by question; McNemar; Holm |
| Preflight checks wrong prompt | `preflight.py:83-99` | Use evidence prompt with options |

Each finding has: symptom → evidence → why it matters → fix doc.

### 4.1 Injection arm is plain MAD + pressure

- `experiments.yaml:80-82` defines `injection` as a standalone arm.
- `run_matrix.py:180-188` has no injection flag.
- `runner.py:407-409` builds the injection arm **without a retriever**.
- `debate.py:102` updates trust only when `has_evidence` is true.

**Result:** the injection arm has no evidence and no trust update. It measures vanilla MAD under pressure, not the proposed mechanism. **Fix:** P0-1.

### 4.2 B8 without injection has CCR = 0

- B8 is run without injection; `consensus=None`.
- `metrics.py:155` computes `exposed=[]` when `consensus` is falsy.
- `ccr = 0 / 0` → 0.0.

**Result:** the treatment arm cannot produce a CCR. **Fix:** P0-1/P0-2.

### 4.3 `evidence_introduced` is never set

- `metrics.py:144`: `no_new_evidence = not record.get("evidence_introduced", False)`.
- `runner.py:150-173` (`debate_record`) never sets `evidence_introduced`.
- Only tests set it (`eval/test_metrics.py:105`).

**Result:** collapse is counted even when retrieval introduced evidence; if the field were set, CCR would be 0 by construction. **Fix:** P0-2.

### 4.4 MPR ignores the trust-weighted answer

- `metrics.py:172-177`: `preserved = gold_held OR majority_answer(...) == gold`.
- `record["aggregation"]["weighted"]` is never used.

**Result:** MPR measures majority vote, not the proposed system. **Fix:** P0-2.

### 4.5 ECR is invalid

- `metrics.py:49-74`: ECE between trust weights and binary correctness.
- `trust/update.py:42-43`: trust sums to 1.
- With all trust = 1/3 and accuracy 0.35, ECR = 1 − |1/3 − 0.35| = 0.983.

**Result:** a constant predictor passes the >0.80 target. **Fix:** P0-2 (trust AUROC/Brier/vote calibration).

### 4.6 Trust floor is violated

- `trust/update.py:29`: clip to [0.1, 0.9].
- `:42-43`: renormalize.
- Example: `[0.818, 0.091, 0.091]` → `[0.804, 0.098, 0.098]`.
- `test_boundedness.py:19-22` only checks `clamped_trust`, not `update_trust`.

**Result:** "no agent is silenced" is false. **Fix:** P0-3.

### 4.7 Final trust lags final positions

- `debate.py:96-147`: at the start of round r, trust updates from round r−1 claims.
- `:159-161`: aggregation uses final positions with trust from the previous round.

**Result:** the final trust does not correspond to the final answer. **Fix:** P0-3.

### 4.8 Claim-count and abstention bias

- `debate.py:103-114`: support/harm are raw counts.
- `trust/update.py:26`: `raw = scores + alpha*support - beta*harm`.
- Softmax is relative: an abstaining agent loses weight when others gain support.

**Result:** verbose agents gain trust; abstention is not neutral. **Fix:** P0-3.

### 4.9 Verifier is lexical

- `verdicts.py:68-80`: support = claim-term coverage.
- `:174-177`: contradiction on numeric/negation mismatch.
- `debate.py:64`: `classify_claim` called without judge/scorer.
- `prompts.py:119`: `TRUST_PROMPT` exists but is unused.

**Result:** trust measures lexical overlap, not evidence support. **Fix:** P0-4.

### 4.10 B4 vs B8 confound

- `runner.py:363-366`: B2/B4 `partition=False`; B8 `partition=True`.
- B8 also uses `adaptive_triggering=True`; B4 uses `use_trust=False`.

**Result:** B8 − B4 is not the trust effect; it bundles partition and adaptive triggering. **Fix:** P0-5.

### 4.11 Baselines approximate

- `IMPLEMENTATION_STATUS.md:25-30`: B9 = heuristic gate, not FocusCal; B10 = no prompt optimizer; B6 = simplified.
- `strategies.py:6-10` repeats the caveat.

**Result:** "+X% over iMAD" is not credible. **Fix:** P0-5.

### 4.12 Dataset/source mismatch

- `configs/datasets.yaml`: BrokenMath is math; PubMed is Agent 1's source.
- BrokenMath: 504 total, 183 final-answer; proof-based items fail the answer-type filter.
- GPQA-Diamond: 198 total; divergent filter leaves ~120–140.
- HLE: free-form/gated; low eligibility.
- Revisions for BrokenMath/BrokenArXiv/HLE/MMLU-Pro are `main`, not hashes.

**Result:** the paper's "1,000 per dataset" is impossible; evidence is unavailable where it is needed. **Fix:** P0-6.

### 4.13 Matrix is not executable

- 15 conditions × 5 datasets × 3 seeds × 1,000 = 225,000 debates.
- Gate 0: 6.2 min/debate; with retrieval/trust assume 8 min.
- 225,000 × 8 min = 30,000 GPU-h.
- Report says ~300 GPU-h; inconsistent.

**Result:** the plan cannot finish in 7–8 months. **Fix:** P0-7.

### 4.14 Pilot does not test behavior

- `PILOT_CRITERION.md:11`: one debate, then compare the same fixed final positions under weighted vs majority.
- Trust never feeds back into the agents.

**Result:** it tests aggregation arithmetic, not whether trust changes agent behavior. It can pass while every model ignores trust. **Fix:** P0-8/P0-7.

### 4.15 Paper claims results it does not have

- `Papev_Summer26_6/cas-sc-template.tex:121`: "produced fewer hallucinated answers."
- `4.implementation.tex` and `6.conclusion.tex`: empty.
- `IMPLEMENTATION_STATUS.md:3`: only Gate 0 has real GPU evidence.

**Result:** integrity risk. **Fix:** P0-10.

---

## 5. Stale or misleading docs

| File | Problem | Action |
|---|---|---|
| `docs/FYDP1_defence_Q&A.md:69` | Says trust is not wired; code now wires it | Update to current state |
| `docs/FYDP1_defence_Q&A.md:87-92` | Says retrieval/verdicts are stubs | Update |
| `roadmap.md:14` | Says offline code status 2026-11-08, but Phase 1 pilot not run | Update status |
| `docs/blueprint.md:206` | Frozen invariants include a false bound | Amend after P0-3 |
| `Papev_Summer26_6/cas-sc-template.tex:121` | Abstract claims results | Rewrite after results |
| `FYDP_Summer/4.implementation.tex` | 337 bytes; empty sections | Write after experiments |
| `FYDP_Summer/6.conclusion.tex` | 87 bytes; empty | Write after results |

---

## 6. What can be trusted today

- Gate 0 timings and transcript: `experiments/gate0/`.
- The code paths for vanilla MAD, mock end-to-end, and unit tests.
- The existence of the retrieval/trust/baseline scaffolding — **not** its scientific validity.
- The model-serving setup and the Gate 0 lessons (quantization, vLLM nightly, sequential startup).

## 7. What cannot be trusted today

- Any CCR/MPR/ECR number from the current code (the metrics are invalid or undefined in the full system).
- Any claim that the injection arm tests the mechanism (it does not).
- Any claim that B8 beats B4/iMAD/ConsensAgent (no real run; confounded; approximate baselines).
- Any claim of a formal bound (false after renormalization).
- Any claim of "no prior work" (see `04_LITERATURE_AND_GAPS.md`).
- The current paper draft's results/abstract.

---

## 8. Definition of done for "experiment-ready"

- [ ] `pytest` green on `feat/full-pipeline`.
- [ ] B8 + injection runs end-to-end on mocks, with `consensus`, `targets`, `evidence_introduced`, `final_answer`.
- [ ] CCR-0, CCR-E, MPR-weighted, trust AUROC, final accuracy computed and unit-tested.
- [ ] Trust update satisfies `min >= floor`, `sum == 1` on 10k random inputs.
- [ ] Verifier wired and validated; balanced accuracy ≥0.75 on ≥150 human-labeled pairs.
- [ ] B8 vs B8-no-trust differs only in `use_trust` (same retrieval/prompts).
- [ ] Dataset revisions pinned; eligible n reported per dataset.
- [ ] Matrix ≤1,500 GPU-h; pre-registration written.
- [ ] Pilot passes the behavioral gate.
- [ ] Docs updated; `main` has the full pipeline.
