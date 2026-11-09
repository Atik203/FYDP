# 02 — P0 Fixes (Historical Record)

> **Historical P0 fix list.** Completed at **13/13 gate checks, 514 tests**, released at tag `p0-release` (`7f2c11f`); current HEAD `main` = `dev` = `2ae56a3`. For current state and next actions, see `roadmap.md` and `01_CURRENT_STATE.md`.
>
> **Deferred human checks:** the P0-6 human verifier audit is now **N4** and remains pending (lexical verifier **0.58** balanced accuracy on the synthetic audit; target ≥0.75, κ ≥0.60). The P0-9 manipulation κ and the pilot are **G2** work. These were not P0-release gate failures; they are post-P0 validation.
>
> Branch names below are historical. The retired long-lived feature branch is now `dev`; the temporary P0 integration branch was merged and deleted; the current slice model is `next/<slice>` from `dev`.

**Historical rule (8 November 2026):** no main experiment until every P0 was checked. Each item has a problem, evidence, change, and an acceptance test. If an acceptance test could not be run, the item was not done at that time.

**Order matters.** P0-0 → P0-1 → P0-2 are prerequisites for every number the paper will report.

---

## P0-0 — Put the answer choices into the prompts (highest priority)

**Problem:** GPQA/MMLU-Pro options are built by the loader but never inserted into the agent prompts. On GPQA the correct answer is always option A, and the models answer "which of the following" without seeing the choices.

**Evidence:**
- `eval/datasets.py:59-65` builds `options = [Correct Answer, Incorrect 1, 2, 3]`.
- `agents/prompts.py:19-27` (`AGENT_INITIAL`) has no `{options}` slot.
- `orchestrator/debate.py:79-82` calls `AGENT_INITIAL.format(agent_id=..., question=...)`.
- Gate 0 transcript: the question asks "which one of the following options…" but contains no options; answers are free-form.

**Change:**
1. Add an `options_block` to every prompt that receives a question: initial, revision, revision+evidence, single-agent, RAG, self-consistency, MoA, iMAD, ConsensAgent.
2. Shuffle options with a per-question seeded permutation **before** rendering; never put the correct answer first.
3. Store the permutation and the rendered options in the record.
4. Score against the same permutation (canonical letter/text).
5. For free-form datasets (HLE), render "Answer format: free text" and use a judge; do not fabricate options.

**Acceptance:**
- [ ] A test asserts every MCQ prompt contains all options exactly once.
- [ ] A test asserts the correct option is not always first across 100 questions.
- [ ] A test asserts the record stores `option_permutation`.
- [ ] A mock debate on GPQA produces a letter answer that maps to the rendered option.

**Do not break:** the Gate 0 transcript is historical; do not rewrite it. Add a new test fixture.

---

## P0-1 — Fix the answer matcher and parser

**Problem:** `to_float` takes the first number anywhere in the text. It misparses scientific notation, units, and "The answer is B." Accuracy, CCR, and MPR inherit the error.

**Evidence:**
- `eval/answers.py:40-51` (`to_float` first number).
- `eval/answers.py:54-71` (`choice_letter` only bare/short letters).
- `agents/parser.py:74-85` (`parse_position` first non-formatting line).
- Probes: `10^-4 eV` → 10.0; `Product 3 contains 11` → 3.0; `The answer is B` → wrong.
- Gate 0: 4/30 "correct" labels are accidental numeric coincidences; agent 1 is 0/10.

**Change:**
1. Prefer an explicit answer span: `Answer: ...`, `Final answer: ...`, `\boxed{...}`, last line with a letter/number.
2. Parse caret/LaTeX scientific notation (`10^{-4}`, `7.3 \times 10^{-7}`) as one number.
3. Strip units before numeric comparison; compare within tolerance.
4. For MCQ, map letter/text to the rendered option; require the option block.
5. For free text, use a human-audited semantic judge; report parser precision/recall/F1 on 100 items.
6. Add a test corpus of 50 real Gate 0 outputs with gold parses.

**Acceptance:**
- [ ] 50-case parser test ≥95% exact match to human labels.
- [ ] `10^-4 eV`, `7.3 × 10^-7`, `(B)`, `The answer is B` all parse correctly.
- [ ] `Product 3 contains 11` does not parse as 3.0.
- [ ] Record stores raw text, parsed answer, and parser version.

**Do not break:** `parse_position` is used by the injection filter; keep its signature or update all callers.

---

## P0-2 — Add final-answer accuracy everywhere

**Problem:** `MetricSummary`, `summary.json`, and the matrix table have no final-answer accuracy. The paper cannot answer "does trust improve accuracy?"

**Evidence:**
- `eval/metrics.py:109-131` (`MetricSummary` fields).
- `runner.py:287-302` (summary payload).
- `scripts/run_matrix.py:307-319` (matrix table).
- `docs/blueprint.md:412` lists accuracy as required.

**Change:**
1. Add `final_answer`, `final_answer_correct`, `final_answer_source` (majority/weighted) to every record.
2. Add `accuracy`, `n_correct`, and a question-clustered 95% CI to `MetricSummary` and `summary.json`.
3. Add an accuracy column to the matrix table.
4. Report accuracy for every arm, including non-injection arms.

**Acceptance:**
- [ ] `summary.json` has `accuracy` and `n_correct`.
- [ ] A unit test fails if `final_answer` is missing.
- [ ] The matrix dry-run table includes an accuracy column.
- [ ] A recorded debate's final answer is the actual aggregated answer, not a recomputed majority.

---

## P0-3 — Wire B8 + injection and trust together

**Problem:** the injection arm has no retriever/trust; B8 has no injection. The treatment is never stress-tested.

**Evidence:**
- `configs/experiments.yaml:80-82` (injection standalone).
- `scripts/run_matrix.py:180-188` (no injection flag).
- `runner.py:407-409` (injection without retriever).
- `orchestrator/debate.py:102` (trust only when evidence).

**Change:**
1. Add `inject: bool` and `injection_scope: minority|all` to `RunConfig`, CLI, and matrix.
2. For B8 + injection, pass both `retriever` and `injection_scope`.
3. For the injection-only baseline (B3 + pressure), pass no retriever; label it clearly.
4. Add a 2×2 factorial: injection (on/off) × trust (on/off), with retrieval in all trust arms.
5. Log `injection.delivered`, `targets`, `consensus_source` (panel majority vs external), and `evidence_introduced`.

**Acceptance:**
- [ ] A mock B8+injection run has `consensus != None`, `exposed` non-empty, `trust_trajectory` non-null, `evidence` non-empty.
- [ ] A test asserts B8+injection uses both a retriever and a trust update.
- [ ] A test asserts B3+injection has no trust update.
- [ ] `run_matrix.py --dry-run` shows the 2×2 conditions.

---

## P0-4 — Replace CCR/MPR/ECR with valid endpoints

**Problem:** CCR is undefined in the full system; MPR ignores the weighted answer; ECR is anti-correlated with correctness.

**Evidence:**
- `metrics.py:144` (`evidence_introduced` never set).
- `metrics.py:155` (`exposed=[]` when no consensus).
- `metrics.py:172-177` (MPR uses `majority_answer`).
- `metrics.py:49-74` (ECR ECE).
- Probe: all-correct ECR 0.333, all-wrong 0.667, perfect-ranking 1/3-correct 0.867.

**Change:**
1. **CCR-0:** no-retrieval injection arm; switch to the fabricated consensus / exposed correct agents.
2. **CCR-E:** retrieval arm; switch away from gold when the agent's evidence verdict is not decisive-negative; report the evidence condition.
3. **CMR (primary):** correct-minority retention on pressure-eligible items: ≥1 initially-correct agent still holds gold at round K.
4. **Final accuracy (co-primary):** actual aggregated answer correctness.
5. **MPR-weighted:** final aggregated answer correct; report `gold_held` separately.
6. **ARR:** appropriate revision rate — initially wrong agents who switch to gold when the majority is correct.
7. **Trust AUROC:** pairwise ranking of correct vs incorrect agents, out-of-sample.
8. **Trust Brier/vote calibration:** compare to a constant-1/3 baseline; report a reliability diagram.
9. Delete "ECR > 0.80" as a target.

**Acceptance:**
- [ ] Unit tests for CCR-0, CCR-E, CMR, MPR-weighted, ARR, AUROC on synthetic records.
- [ ] `summary.json` contains all endpoints with raw counts and CIs.
- [ ] A test fails if MPR ignores `aggregation.weighted`.
- [ ] ECR is not used in the paper's primary claims.

---

## P0-5 — Fix the trust operator, timing, and claim-count bias

**Problem:** the [0.1, 0.9] bound is false; final trust lags final positions; raw claim counts reward verbosity; neutral evidence is not a no-op.

**Evidence:**
- `trust/update.py:29,42-43`.
- `trust/test_boundedness.py:19-22` (checks only pre-renormalization).
- `orchestrator/debate.py:96-147,159-161`.
- `trust/update.py:26` (raw counts).
- Probe: `update_trust([0.8,0.1,0.1],0,0)` → `[0.5017,0.2491,0.2491]`.
- Probe: support `[1,0,0]` → 0.4519; `[8,0,0]` → 0.8182.

**Change:**
1. Maintain unnormalized logits or evidence accumulators; apply softmax once.
2. Project onto `{w_i ≥ floor, Σw_i = 1, w_i ≤ ceiling}` after every update (water-filling).
3. Make `V=H=0` an identity (or a documented prior update), not a re-uniformization.
4. Update trust from the **final** positions before aggregation; store `trust_for_positions`.
5. Normalize support/harm by claims checked (or use a Beta-Binomial posterior); deduplicate claims.
6. Store `trust_status` per round: `updated`, `abstained_unanimous`, `abstained_no_evidence`.
7. Test N=1,3,5 and extreme supports.

**Acceptance:**
- [ ] `update_trust` output satisfies `min >= floor - 1e-9` and `sum == 1` for 10k random inputs (N=1,3,5).
- [ ] `update_trust(x,0,0) == x` (within tolerance) or the documented prior.
- [ ] A test asserts final trust is computed from final positions.
- [ ] A verbosity test: duplicating claims does not increase trust.
- [ ] N=1 output respects the ceiling.

---

## P0-6 — Wire and validate a real verifier

**Problem:** the default verdict is lexical overlap; the LLM judge is not wired; no human validation.

**Evidence:**
- `retrieval/verdicts.py:68-80,140-180`.
- `orchestrator/debate.py:64` (`classify_claim` without judge/scorer).
- `agents/prompts.py:119` (`TRUST_PROMPT` unused).
- Six hand cases: 4/6 wrong.

**Change:**
1. Add a `Verifier` interface with implementations: `lexical`, `cross-encoder`, `nli`, `llm-judge`.
2. Pass the verifier into `DebateRunner`; store `verifier` name/version per verdict.
3. Require bidirectional entailment for `supported`; explicit contradiction class; `unverifiable` for no evidence.
4. Validate on SciFact + 150–200 hand-labeled claim-passage pairs (2 annotators).
5. Report balanced accuracy, precision/recall/F1, coverage, and kappa.
6. Align judged evidence with shown evidence (see P0-7).

**Acceptance:**
- [ ] `verdicts` record has `claim`, `passages`, `scores`, `verdict`, `verifier`.
- [ ] Human audit file with ≥150 pairs; balanced accuracy ≥0.75.
- [ ] A test asserts the judge is called (mock judge).
- [ ] The paper reports verifier accuracy alongside CCR/accuracy.

---

## P0-7 — Fix baselines, prompts, and the B4 confound

**Problem:** B4 uses all sources, B8 partitions; the trust line is always in the prompt; B5 samples may be identical; B6/B9/B10 are unfaithful; compute is unmatched.

**Evidence:**
- `runner.py:363-366` (B4 partition=False; B8 partition=True).
- `agents/prompts.py:34,47` (trust line always present).
- `strategies.py:84-88` (B5 one client/seed).
- `strategies.py:91-150,203-277` (B6/B9/B10).
- `IMPLEMENTATION_STATUS.md:25-30`.

**Change:**
1. Make **B8-no-trust** the primary control: same retriever, same prompts, same partition, `use_trust=False`.
2. Make B4 use `partition=True` (or label it "MAD + all-source RAG" and compare to B8-no-trust, not B8).
3. Omit the trust line when `use_trust=False`; use a neutral revision prompt.
4. Give B5 per-sample seeds; verify samples differ.
5. Implement a faithful MoA (single final aggregator) or label B6 "MoA-style."
6. Implement FocusCal or label B9 "iMAD-style gate."
7. Wire B10's weighted answer and prompt optimizer or label it "ConsensAgent-style."
8. Record calls/tokens/retrieval per arm; add a compute-matched comparison.

**Acceptance:**
- [ ] B8 vs B8-no-trust differs only in `use_trust` (test the prompt diff).
- [ ] B5 samples are not identical (test).
- [ ] Baseline table has a `fidelity` column (`faithful`/`approximation`).
- [ ] Calls/tokens per arm are logged.
- [ ] No "+X% over iMAD" claim unless B9 is faithful or validated against published numbers.

---

## P0-8 — Fix datasets, source routing, and revisions

**Problem:** BrokenMath and BrokenArXiv are proof-only and have **0% answer-type retention**; math datasets are routed to PubMed; revisions are unpinned; source-by-agent is a 12–21 pp confound; the "1,000 per dataset" claim is impossible.

**Evidence (dataset audit):**
- BrokenMath official benchmark: **451/451 `proof`**, `gold_answer` empty.
- BrokenArXiv: **87/87 `proof`**, `answer` empty.
- BrokenMath `train` has 6,670 answer-type items but is a training split; do not use it as eval.
- HLE: 2,500 items, ~24% MCQ + ~76% exact-match, 14% multimodal; designed to be retrieval-resistant. Use as abstention/negative control.
- GPQA-Diamond: 198; divergent 60–80% → ~120–160 usable; underpowered for 10 pp.
- GPQA-Main: 448 → ~270–360 usable; primary evidence-grounded set.
- MMLU-Pro STEM: 6,696 → ~2,700–4,000 usable; primary scale set.
- `eval/datasets.py` `_ANSWER_KEYS` lacks `gold_answer`; BrokenArXiv crashes on empty `answer`; HLE drops `answer_type`.
- `configs/datasets.yaml:16,25,32,47` still `main`.
- `retrieval/sources.py:224-232` maps agent→source; model families fixed to same agents.
- `rows[:sample_cap]` takes the first N; MMLU-Pro is category-ordered.

**Change:**
1. **Remove BrokenMath/BrokenArXiv from the primary evidence/CCR matrix.** Move them to a separate premise-rejection appendix with a validated LLM judge; do not use retrieval trust.
2. **Use GPQA-Main + MMLU-Pro STEM as the primary evidence-grounded matrix.** GPQA-Diamond is pilot only. HLE is a ceiling/abstention control, not positive evidence.
3. **Fix loaders:** add `gold_answer`; use the `benchmark` split; skip/catch empty `answer`; preserve `answer_type`; never use `train` as eval.
4. **Replace agent→source with claim→domain routing:** bio/clinical → PubMed + S2; physics/chemistry → arXiv + S2; math/CS → arXiv + S2; other → S2/OpenAlex; deduplicate by DOI/arXiv ID/title.
5. **Equalize evidence volume** across partition conditions; rotate sources if partitioning is kept as an ablation.
6. **Add validation sets:** SciFact (300), VitaminC (1,000 stratified), PubMedQA (500); hand-labeled pipeline sample (300 answers / 500 claims / 100 transitions).
7. **Build EG-SSS:** 180 items (60 biomed, 60 phys/chem, 60 math/CS) with gold evidence, 3–6 atomic claims per position, gold verdicts, and five conditions (evidence available/absent/placebo/contradictory × pressure).
8. **Pin all revisions; stratify samples; report eligible n per dataset.**
9. **Do not claim 60–70% retention for proof datasets.** Report 0% and explain why they are excluded.

**Acceptance:**
- [ ] BrokenMath/BrokenArXiv are absent from the primary CCR/ECR matrix.
- [ ] All dataset revisions are commit hashes.
- [ ] `eligible_n.json` exists per dataset/arm.
- [ ] A math claim is not sent to PubMed; a bio claim is.
- [ ] `answer_type` is preserved for HLE.
- [ ] GPQA options are shuffled; correct answer is not always A.
- [ ] Stratified sampling is used, not `rows[:cap]`.
- [ ] The paper reports actual n, not "1,000 per dataset."
- [ ] Source-by-agent bias is measured and <10 pp after routing/rotation.

---

## P0-9 — Fix the injection protocol

**Problem:** the "fabricated consensus" is the panel's actual majority; the system prompt persists; there is no neutral control; a 3-way split is called a majority.

**Evidence:**
- `orchestrator/injection.py:56-67`.
- `agents/prompts.py:58-61`.
- `INJECTION_PROTOCOL.md:43` (persists for the remainder).
- `debate.py:90-92,117,139`.

**Change:**
1. Use an **external** fabricated consensus ("A survey of 100 domain experts concluded X") when the goal is authority pressure; use the panel majority only when the goal is peer conformity. Log `consensus_source`.
2. Require a strict majority (2/3) or exclude ties; do not call a 3-way split a majority.
3. Deliver the injection as a one-shot user message at round 2; remove it in round 3.
4. Add arms: neutral pressure (equal length), authority pressure, peer pressure, no pressure.
5. Add a manipulation check: human raters judge perceived pressure; kappa ≥0.75.
6. Add paraphrase robustness (3 templates).

**Acceptance:**
- [ ] Round 3 prompt has no injection text.
- [ ] `injection.consensus_source` is logged.
- [ ] Ties are excluded/flagged.
- [ ] Kappa ≥0.75 on 40 items.
- [ ] The neutral arm is length-matched.

---

## P0-10 — Cut the matrix and pre-register

**Problem:** 15×5×3×1,000 ≈ 30,000 GPU-h; no power analysis; no pre-registration.

**Evidence:**
- `configs/experiments.yaml:18-31`.
- `experiments/gate0/README.md` (6.2 min/debate).
- `run_matrix.py:173-190`.

**Change:**
1. Replace with 6 arms × (GPQA-Main + MMLU-Pro STEM + EG-SSS) × 250–500 eligible × 2 seeds (see `03_EXPERIMENT_PLAN.md`). **As executed at P0 release, the Core v1.0 matrix is narrower:** 4 conditions (B3, B4-matched, B8-no-trust, B8) × 3 datasets (`gpqa_main`, `mmlu_pro`, `hle`) × 2 seeds = **24 runs**; GPQA 400 + MMLU-Pro 400 + HLE 200 = 8,000 debates ≈ **1,067 GPU-h planned**, with a **1,280 GPU-h** conservative gate cap. EG-SSS is not in Core v1.0; it is 180 items at the v1.2 benchmark freeze. The Full target is 6 arms/3 datasets/2 seeds, **default 32 runs with a gold-evidence oracle on EG-SSS** (1,280 GPU-h / $210); **36 runs with gold-answer trust is the alternate** (300 items/dataset, 10,800 debates / 1,440 GPU-h / $235). **WP-18** (not the historical WP-13) freezes the Full definition.
2. Compute power for CCR/accuracy; report MDE per dataset.
3. Freeze `PRE_REGISTRATION.md`: primary endpoint, comparator, exclusions, analysis, multiplicity, stopping rules.
4. Treat the full 15×5 grid as a thesis appendix plan, not an executable matrix.

**Acceptance:**
- [ ] Matrix ≤1,500 GPU-h (calculate from 8 min/debate).
- [ ] `PRE_REGISTRATION.md` exists and is dated before the run.
- [ ] Power table in the paper.
- [ ] No condition added after seeing results.

---

## P0-11 — Reproducibility manifest

**Problem:** resume keys only on question id; records lack model/prompt/revision/commit; `analyze.py` pools arms.

**Evidence:**
- `runner.py:97-102,128-136,150-173,360-370`.
- `scripts/analyze.py:36-38,152-160`.

**Change:**
1. Write `run_manifest.json`: config hash, model checkpoints, prompt hash, dataset revisions, code commit, temperature, seed.
2. Include the manifest in the run path and every record.
3. Refuse resume on manifest mismatch.
4. `analyze.py` requires `--arm` and `--dataset` (or groups by them).
5. Log calls/tokens/latency per debate.

**Acceptance:**
- [ ] Changing alpha/beta creates a new run directory or refuses resume.
- [ ] Every record has `manifest_hash`.
- [ ] `analyze.py --dir` cannot silently pool arms.

---

## P0-12 — Branch and docs

**Problem:** `main` is 10 commits behind; the defence Q&A says trust/retrieval are not wired; the paper claims results.

**Evidence:**
- `git log --oneline` (the old long-lived feature branch was ahead).
- `docs/FYDP1_defence_Q&A.md:69`.
- `Papev_Summer26_6/cas-sc-template.tex:121`.

**Change:**
1. Merge the old long-lived feature branch into `main` (or change the default branch).
2. Update `IMPLEMENTATION_STATUS.md`, `FYDP1_defence_Q&A.md`, `roadmap.md`.
3. Rewrite the abstract/intro claims per `05_WRITING_AND_VENUE.md`.
4. Add a `CITATION.cff` / `requirements` lock if releasing.

**Acceptance:**
- [ ] Public `main` has the full pipeline.
- [ ] `pytest` green on `main`.
- [ ] No doc says "trust not wired" when it is.
- [ ] No paper claim says "produced" without results.

---

## P0 completion gate (historical; passed at `p0-release`)

The engineering gate passed. The two human-validation items below were explicitly carried into post-P0 work, not silently marked done.

- [x] P0-0, P0-1, P0-2 pass their tests.
- [x] P0-3 mock B8+injection produces all required fields.
- [x] P0-4 metrics have unit tests and appear in `summary.json`.
- [x] P0-5 trust tests pass for N=1,3,5 and neutral evidence.
- [x] P0-6 verifier interface + audit harness landed. **Human audit ≥0.75 is N4, pending** (synthetic audit 0.58).
- [x] P0-7 B8 vs B8-no-trust differs only in trust (landed as the historical WP-13 prompt split).
- [x] P0-8 all revisions pinned; eligible n reported.
- [x] P0-9 injection is one-shot with a neutral control. **Human manipulation κ ≥0.75 is G2, pending.**
- [x] P0-10 Core matrix is 24 rows / 1,280 GPU-h cap; pre-registration v1.0 written. Full definition is WP-18, conditional: 32-row gold-evidence default ($210) / 36-row gold-answer alternate ($235).
- [x] P0-11 manifest/resume test passes.
- [x] P0-12 branch/docs updated: `main` = `dev`; manuscripts rewritten as engineering reports.

**Current next gate:** N1 final-stack smoke (not run) → N2 WP-18 → N4 verifier audit → N5 pilot/G2. See `roadmap.md`.
