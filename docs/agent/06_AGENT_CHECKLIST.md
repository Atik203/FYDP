# 06 — Agent Checklist (DeepSeek V4.1 Flash Max)

**How to use:** this is the task board. Work top to bottom. Do not skip a gate. For every item, record the command and the exact output. If an item cannot pass, stop and report — do not improvise around a gate.

**Repo:** `E:\FYDP`  
**Work branch:** `feat/full-pipeline`  
**Do not edit `main` directly.** Merge at the end, after P0.

---

## Phase 0 — Recon (no edits)

- [ ] **0.1 Confirm branch and cleanliness**
  ```bash
  cd E:\FYDP
  git status --short
  git branch -vv
  git log --oneline -10
  ```
  **Done when:** you can name the current branch, whether it is clean, and how far it is from `main`.
  **Record:** branch, ahead/behind, clean/dirty.

- [ ] **0.2 Read the agent docs in order**
  - `docs/agent/00_START_HERE.md`
  - `docs/agent/01_CURRENT_STATE.md`
  - `docs/agent/02_P0_FIXES.md`
  - `docs/agent/03_EXPERIMENT_PLAN.md`
  - `docs/agent/04_LITERATURE_AND_GAPS.md`
  - `docs/agent/05_WRITING_AND_VENUE.md`
  **Done when:** you can state the five blockers in `01_CURRENT_STATE.md §4.0` without looking.

- [ ] **0.3 Run the test suite**
  ```bash
  cd E:\FYDP\trustcal
  .\.venv\Scripts\python.exe -m pytest -q --ignore=.venv
  ```
  **Done when:** you have the pass/fail count.
  **Record:** exact count and any failures. Expected: 206 passed, 0 failed.

- [ ] **0.4 Confirm environment limitations**
  ```bash
  .\.venv\Scripts\python.exe -c "import datasets, sentence_transformers, torch, langgraph" 
  ```
  **Done when:** you know which heavy deps are missing. Do not install them just to make tests pass; the GPU box has its own env.

- [ ] **0.5 Inspect the matrix plan (writes nothing)**
  ```bash
  python scripts/run_matrix.py --dry-run
  ```
  **Done when:** you see the planned rows and can compute the GPU-hour estimate.
  **Record:** number of rows; estimated GPU-h at 8 min/debate.

- [ ] **0.6 Locate the five blockers in code**
  - `eval/datasets.py:59-65` and `agents/prompts.py:19-27` (options not in prompt)
  - `eval/answers.py:40-51` (first-number matcher)
  - `eval/metrics.py:109-131` (no final accuracy)
  - `runner.py:407-409` + `experiments.yaml:80-82` (injection arm no retriever)
  - `eval/metrics.py:49-74` (ECR invalid)
  **Done when:** you have opened each file and can quote the line.

- [ ] **0.7 Do not edit anything in Phase 0.**
  **Done when:** `git status --short` is still clean.

- [ ] **0.8 Audit the datasets (dataset audit)**
  - Confirm BrokenMath benchmark = **451/451 proof** and `gold_answer` empty.
  - Confirm BrokenArXiv = **87/87 proof** and `answer` empty.
  - Confirm GPQA-Diamond = 198; GPQA-Main = 448; MMLU-Pro STEM = 6,696; HLE = 2,500 (mostly free-form, retrieval-resistant).
  - **Done when:** you can state usable n per dataset and why BrokenMath/BrokenArXiv are excluded from CCR.

**Phase 0 exit:** report the branch, test count, environment gaps, matrix rows, and the five blockers. Wait for approval before Phase 1.

---

## Phase 1 — P0 fixes (ordered)

### P1.0 — Options in prompts (P0-0)

- [ ] **1.0.1 Add `options_block` to every prompt**
  - Files: `agents/prompts.py`, `orchestrator/debate.py`, `orchestrator/strategies.py`, `runner.py`.
  - Change: render shuffled options in initial, revision, revision+evidence, single-agent, RAG, SC, MoA, iMAD, ConsensAgent prompts.
  - **Done when:** a test asserts every MCQ prompt contains all options exactly once.
- [ ] **1.0.2 Add seeded permutation**
  - Change: shuffle options per question; store `option_permutation`; never put the correct answer first.
  - **Done when:** a 100-question test shows the correct option is not always first.
- [ ] **1.0.3 Score with the same permutation**
  - Change: `is_correct`/`canonical` use the rendered option list; record the letter/text.
  - **Done when:** a mock GPQA debate returns a letter that maps to the rendered option.
- [ ] **1.0.4 Run tests**
  ```bash
  pytest -q --ignore=.venv
  ```
  **Done when:** green + new tests pass.

### P1.1 — Parser and answer matcher (P0-1)

- [ ] **1.1.1 Add explicit answer-span extraction**
  - Files: `agents/parser.py`, `eval/answers.py`.
  - Change: prefer `Answer:`, `Final answer:`, `\boxed{}`, last letter/number; handle `10^{-4}` and `\times 10^{-7}`.
  - **Done when:** 50-case parser test ≥95% exact match to human labels.
- [ ] **1.1.2 Strip units and compare numerically**
  - Change: unit-aware numeric compare with tolerance; do not take the first number in prose.
  - **Done when:** `Product 3 contains 11` does not parse as 3.0.
- [ ] **1.1.3 Record raw text, parsed answer, parser version**
  - **Done when:** every record has all three.

### P1.2 — Final-answer accuracy (P0-2)

- [ ] **1.2.1 Add `final_answer`, `final_answer_correct`, `final_answer_source` to records**
  - Files: `runner.py:150-173`.
  - **Done when:** a mock B8 record has all three.
- [ ] **1.2.2 Add accuracy to `MetricSummary` and `summary.json`**
  - Files: `eval/metrics.py:109-131`, `runner.py:287-302`.
  - **Done when:** `summary.json` has `accuracy`, `n_correct`, `ci95`.
- [ ] **1.2.3 Add accuracy column to the matrix table**
  - File: `scripts/run_matrix.py:307-319`.
  - **Done when:** the dry-run table shows accuracy.

### P1.3 — Wire B8 + injection + trust (P0-3)

- [ ] **1.3.1 Add `inject` and `injection_scope` to `RunConfig`/CLI/matrix**
  - Files: `runner.py`, `scripts/run_experiment.py`, `scripts/run_matrix.py`.
  - **Done when:** `--inject` works on B8.
- [ ] **1.3.2 Pass retriever + injection together for B8**
  - **Done when:** mock B8+injection has `consensus != None`, `exposed` non-empty, `trust_trajectory` non-null, `evidence` non-empty.
- [ ] **1.3.3 Add the 2×2 (injection × trust)**
  - **Done when:** `run_matrix.py --dry-run` shows the 2×2.

### P1.4 — Valid endpoints (P0-4)

- [ ] **1.4.1 Implement CCR-0 and CCR-E**
  - File: `eval/metrics.py`.
  - **Done when:** unit tests for both pass; raw counts reported.
- [ ] **1.4.2 Implement CMR and MPR-weighted**
  - **Done when:** MPR uses `aggregation.weighted`; a test fails if it does not.
- [ ] **1.4.3 Implement ARR**
  - **Done when:** a wrong agent switching to gold when the majority is correct counts; the converse does not.
- [ ] **1.4.4 Replace ECR with trust AUROC + Brier/vote calibration**
  - **Done when:** `summary.json` has `trust_auroc`, `trust_brier`, `vote_calibration`; ECR is not a primary target.
- [ ] **1.4.5 Add tests**
  - **Done when:** synthetic records produce the expected values; all green.

### P1.5 — Trust operator (P0-5)

- [ ] **1.5.1 Project onto simplex with floor/ceiling**
  - File: `trust/update.py`.
  - **Done when:** `min >= floor`, `sum == 1` for 10k random inputs (N=1,3,5).
- [ ] **1.5.2 Make neutral evidence a no-op**
  - **Done when:** `update_trust(x,0,0) == x` (within tolerance) or the documented prior.
- [ ] **1.5.3 Update trust on final positions**
  - File: `orchestrator/debate.py`.
  - **Done when:** a test asserts final trust is computed from final positions.
- [ ] **1.5.4 Normalize by claims checked**
  - **Done when:** duplicating claims does not increase trust.
- [ ] **1.5.5 Log `trust_status`**
  - **Done when:** `updated` / `abstained_unanimous` / `abstained_no_evidence` appear per round.

### P1.6 — Verifier (P0-6)

- [ ] **1.6.1 Add `Verifier` interface**
  - File: `retrieval/verdicts.py`, `orchestrator/debate.py`.
  - **Done when:** `lexical`, `nli`, `llm-judge` selectable; the judge is called in a mock test.
- [ ] **1.6.2 Store per-claim evidence**
  - **Done when:** every verdict has `claim`, `passages`, `scores`, `verdict`, `verifier`.
- [ ] **1.6.3 Human audit**
  - 150–200 claim–passage pairs, 2 annotators.
  - **Done when:** balanced accuracy ≥0.75, κ reported.
  - **If <0.60 after swapping to NLI/judge: stop and report.**

### P1.7 — Baselines (P0-7)

- [ ] **1.7.1 Make B8-no-trust the primary control**
  - **Done when:** B8 vs B8-no-trust differs only in `use_trust`.
- [ ] **1.7.2 Fix B4 partition or relabel it**
  - **Done when:** B4 uses `partition=True` or is labeled "MAD + all-source RAG."
- [ ] **1.7.3 Omit the trust line when `use_trust=False`**
  - **Done when:** a prompt diff shows the only difference is the trust line.
- [ ] **1.7.4 Per-sample seeds for B5**
  - **Done when:** five samples are not identical.
- [ ] **1.7.5 Label B6/B9/B10 fidelity**
  - **Done when:** the table has a `fidelity` column.
- [ ] **1.7.6 Log calls/tokens per arm**
  - **Done when:** compute-matched comparisons are possible.

### P1.8 — Datasets (P0-8)

- [ ] **1.8.1 Drop BrokenMath/BrokenArXiv from the primary matrix**
  - **Done when:** they are absent from every CCR/ECR arm; only a premise-rejection appendix remains.
- [ ] **1.8.2 Use GPQA-Main + MMLU-Pro STEM + EG-SSS as primary**
  - **Done when:** the matrix lists GPQA-Main (448), MMLU-Pro STEM (1,000 stratified), EG-SSS (180).
- [ ] **1.8.3 Add SciFact + VitaminC + PubMedQA validation**
  - **Done when:** loaders work; 300/1,000/500 samples verified.
- [ ] **1.8.4 Claim-domain routing**
  - **Done when:** math claims are not sent to PubMed; bio claims are; source bias <10 pp.
- [ ] **1.8.5 Pin revisions + stratify + eligible n**
  - **Done when:** `datasets.yaml` has commit hashes; sampling is stratified; `eligible_n.json` exists.
- [ ] **1.8.6 Loader fixes**
  - **Done when:** BrokenMath uses `benchmark` + `gold_answer`; BrokenArXiv does not crash; HLE preserves `answer_type`; GPQA options are shuffled.

### P1.9 — Injection (P0-9)

- [ ] **1.9.1 One-shot delivery**
  - **Done when:** round 3 prompt has no injection text.
- [ ] **1.9.2 External consensus + strict majority**
  - **Done when:** `consensus_source` is logged; ties are excluded/flagged.
- [ ] **1.9.3 Neutral/authority/peer arms**
  - **Done when:** the neutral arm is length-matched.
- [ ] **1.9.4 Manipulation check**
  - **Done when:** κ ≥0.75 on 40 items.

### P1.10 — Matrix + pre-registration (P0-10)

- [ ] **1.10.1 Cut to 6 arms × (GPQA-Main + MMLU-Pro STEM + EG-SSS) × 250–500 × 2 seeds**
  - **Done when:** the estimate is ≤1,500 GPU-h at 8 min/debate.
- [ ] **1.10.2 Write `PRE_REGISTRATION.md`**
  - **Done when:** primary endpoint, comparator, n, MDE, analysis, multiplicity, exclusions, stopping rules are frozen.
- [ ] **1.10.3 Power table**
  - **Done when:** the paper can report MDE per dataset.

### P1.11 — Manifest (P0-11)

- [ ] **1.11.1 Write `run_manifest.json`**
  - **Done when:** config hash, model checkpoints, prompt hash, dataset revisions, code commit, temperature, seed.
- [ ] **1.11.2 Refuse resume on mismatch**
  - **Done when:** changing alpha/beta creates a new run or refuses.
- [ ] **1.11.3 Group analysis by arm/dataset**
  - **Done when:** `analyze.py` cannot silently pool arms.

### P1.12 — Branch + docs (P0-12)

- [ ] **1.12.1 Merge `feat/full-pipeline` into `main`**
  - **Done when:** public `main` has the full pipeline.
- [ ] **1.12.2 Update stale docs**
  - `IMPLEMENTATION_STATUS.md`, `docs/FYDP1_defence_Q&A.md`, `roadmap.md`.
- [ ] **1.12.3 Rewrite abstract/intro claims**
  - Use `05_WRITING_AND_VENUE.md §2`.

### Phase 1 gate

Do not proceed until:

- [ ] `pytest` green.
- [ ] P0-0, P0-1, P0-2 tests pass.
- [ ] Mock B8+injection has all fields.
- [ ] Metrics in `summary.json`.
- [ ] Trust tests pass for N=1,3,5 + neutral.
- [ ] Verifier audit ≥0.75.
- [ ] B8 vs B8-no-trust differs only in trust.
- [ ] Revisions pinned; eligible n reported.
- [ ] Injection one-shot + neutral; κ ≥0.75.
- [ ] Matrix ≤1,500 GPU-h; pre-registration written.
- [ ] Manifest/resume test passes.
- [ ] `main` updated.

**If any gate fails: stop and report. Do not run the pilot.**

---

## Phase 2 — Pilot (100 questions)

- [ ] **2.1 Freeze the pilot set**
  - 100 questions from GPQA-Main + MMLU-Pro STEM + EG-SSS; shared round-0 prefix.
  - **Done when:** item IDs and screening seed are recorded.
- [ ] **2.2 Run the pilot**
  ```bash
  python scripts/run_experiment.py --arm B8 --dataset gpqa --limit 100 --seed 1 --inject
  ```
  **Done when:** 100 records, no crashes, all required fields.
- [ ] **2.3 Check baseline CCR**
  - **Gate:** baseline CCR ≥0.25–0.30 on ≥30 exposed items.
- [ ] **2.4 Check trust AUROC**
  - **Gate:** ≥0.65.
- [ ] **2.5 Check direction**
  - **Gate:** ≥65% of changes toward gold on 40 focused items (not just "changed").
- [ ] **2.6 Check verifier coverage**
  - **Gate:** report coverage; if <30%, the evidence is insufficient — fix retrieval before the main run.
- [ ] **2.7 Validate claim decomposition**
  - 300 answers, 2 annotators: atomicity, truth-evaluability, factual, source-fit.
  - **Gate:** atomicity ≥0.80, verifiability ≥0.70, κ ≥0.70, claim recall ≥0.70.
- [ ] **2.8 Validate verdicts**
  - SciFact 300 (macro-F1), VitaminC 1,000 (3-way), 500 pipeline claims (human).
  - **Gate:** macro-F1 ≥0.75, contradicted precision ≥0.80, human κ ≥0.75, ECE ≤0.10.
- [ ] **2.9 Check source bias**
  - **Gate:** source-fit gap <10 pp after claim-domain routing/rotation.

**If the pilot fails:** stop; write the negative/boundary paper; do not run the main matrix.

---

## Phase 3 — Main experiments

- [ ] **3.1 Core 6-arm matrix**
  - B3, B4-matched, B8-no-trust, B8, B8-placebo, B8-oracle.
  - 3 datasets × 250–350 eligible × 2 seeds.
  - **Done when:** all records have final accuracy, trust trajectory, per-claim verdicts.
- [ ] **3.2 Verification-ceiling sweep**
  - Flip verdicts at 0–50% noise; recompute trust; estimate \(q^\star\).
  - **Done when:** a curve with CIs and a threshold estimate.
- [ ] **3.3 Claim-level vs document-level vs label-shuffled**
  - **Done when:** the three conditions are compared on CMR/accuracy.
- [ ] **3.4 Evidence-supports-majority condition**
  - **Done when:** the Authority Bias counter-hypothesis is tested.
- [ ] **3.5 Natural-divergence subset**
  - **Done when:** a no-injection replication is reported.
- [ ] **3.6 Heterogeneity / K / N / source rotation**
  - **Done when:** the boundary conditions are reported.
- [ ] **3.7 Human evaluation**
  - 150–200 items, 2 blinded annotators, binary unwarranted switch + citation faithfulness.
  - **Done when:** κ/ICC reported.

**Stop rule:** no new conditions after the primary result. Freeze at day 63 of the experiment window.

---

## Phase 4 — Analysis and writing

- [ ] **4.1 Primary analysis**
  - Paired McNemar / mixed-effects logistic; cluster bootstrap by question; Holm.
- [ ] **4.2 Effect sizes + CIs**
  - Risk difference (pp), OR, Cohen's d.
- [ ] **4.3 Mediation**
  - Verifier accuracy/coverage → trust AUROC → CMR.
- [ ] **4.4 Failure analysis**
  - 100 errors, 2 annotators; taxonomy validated.
- [ ] **4.5 Figures**
  - Verification-ceiling curve; trust trajectories; per-dataset forest plot; calibration plot.
- [ ] **4.6 Paper**
  - Use `05_WRITING_AND_VENUE.md`.
  - **Done when:** every claim maps to a table/figure.
- [ ] **4.7 Reproducibility**
  - Code, configs, prompts, seeds, dataset revisions, manifest, reproduction script.
- [ ] **4.8 Internal adversarial review**
  - One reviewer plays Reviewer #2; one checks every number against a record.
- [ ] **4.9 Submit**
  - Venue chosen from `05_WRITING_AND_VENUE.md §7`.

---

## Stop and report conditions

Stop immediately and report if:

- `pytest` fails on `feat/full-pipeline` and you cannot fix it without changing the experimental design.
- The B8+injection mock run lacks `consensus`, `exposed`, `trust_trajectory`, or `evidence`.
- `final_answer` is missing or is a recomputed majority.
- `evidence_introduced` is not set.
- The trust update violates the floor after your fix.
- Verifier balanced accuracy <0.75 after swapping to NLI/LLM judge.
- Baseline CCR <0.25 on the pilot.
- The pilot's correct-direction change is <65%.
- The matrix exceeds 1,500 GPU-h.
- A dataset revision is still `main`.
- A reference cannot be verified.
- You find a secret, token, or raw data in the repo.

**Report format:** what you ran, exact output, what failed, the smallest next action. Do not hide a failure behind a summary.

---

## Never do

- Never run the 15×5×3×1,000 matrix.
- Never use BrokenMath/BrokenArXiv for claim-level evidence grounding or CCR; their official splits are proof-only and 0% answer-type eligible.
- Never assign PubMed/arXiv/S2 by agent identity; route by claim domain.
- Never run the main matrix before the pilot gate.
- Never compare B8 to B4 without matching partition/prompts.
- Never use ECR as a primary metric.
- Never claim "formally bounded" before the simplex projection is proved and tested.
- Never treat 3 seeds as independent samples.
- Never cite R²-MAD/TERA-RAG/To Trust or Not without reading the abstract + method.
- Never cite a 2027 OpenReview submission as accepted.
- Never submit the current draft.
- Never commit secrets, raw data, model weights, or credentials.
- Never edit `main` directly; work on `feat/full-pipeline`.
- Never add a condition after seeing the primary result.

---

## File ownership (suggested)

| Area | Files | Owner |
|---|---|---|
| Prompts/options/parser | `agents/`, `eval/answers.py` | Agent A |
| Metrics/records | `eval/metrics.py`, `runner.py` | Agent B |
| Trust math | `trust/` | Agent C |
| Verifier/retrieval | `retrieval/`, `orchestrator/debate.py` | Agent D |
| Baselines | `orchestrator/strategies.py`, `runner.py` | Agent E |
| Datasets/injection | `eval/datasets.py`, `orchestrator/injection.py`, `configs/` | Agent F |
| Writing/repro | `Papev...`, `FYDP_Summer`, `docs/agent/` | Human lead |

**One owner per file.** If two agents need the same file, serialize; do not merge in parallel.

---

## Evidence log template

```markdown
### <date> — <task ID>
**Command:**
```bash
<exact command>
```
**Output:**
```text
<exact output, trimmed to the relevant lines>
```
**Files changed:**
- `path:line` — what
**Acceptance:**
- [ ] criterion
**Open risk:**
<one line>
```

---

## First 10 actions (if you have 10 minutes)

1. `git status --short` and `git branch -vv`.
2. Read `docs/agent/01_CURRENT_STATE.md §4.0`.
3. Run `pytest -q --ignore=.venv` and record 206 passed.
4. Open `eval/datasets.py:59-65` and `agents/prompts.py:19-27`; confirm options are not in the prompt.
5. Open `eval/answers.py:40-51`; confirm the first-number bug.
6. Open `eval/metrics.py:109-131`; confirm no final accuracy.
7. Open `runner.py:407-409`; confirm injection has no retriever.
8. Open `eval/metrics.py:49-74`; confirm ECR is ECE on a simplex.
9. Run `python scripts/run_matrix.py --dry-run`; count the rows.
10. Write the Phase 0 report and wait for approval.
