# 00 — Start Here

**Read this first. Do not edit code until you finish `06_AGENT_CHECKLIST.md` Phase 0 (Recon).**

> **Status note (2026-11-08):** this file records the pre-P0 audit and its scores. P0-5 (trust floor) is fixed on `feat/p0-hardening`; P0-0/P0-1/P0-2 are in the Wave-1 build. Treat the findings below as the diagnosis, not as the current code state.

> **TL;DR for an agent**
> - Do **not** run the main matrix. It is ~30,000 GPU-hours.
> - Do **not** submit the current paper. It is 2.5/10 as a paper.
> - Fix **P0-0 (options in prompts)**, **P0-1 (answer matcher)**, and **P0-2 (final accuracy)** before anything else.
> - The current idea score is **5.5/10**; after P0 it is **6.25**; after the P1 reframe **7.6**.
> - The defensible contribution is the **benchmark + verification-ceiling law**, not the mechanism (R²-MAD/TERA-RAG preempt the mechanism).
> - **BrokenMath and BrokenArXiv are proof-only** (451/451 and 87/87); answer-type retention is **0%**, not 60–70%. Do not use them for evidence grounding or CCR. Use **GPQA-Main + MMLU-Pro STEM** for the primary matrix, **HLE** as an abstention control, and the new **EG-SSS** gold-evidence set for the mechanism test.

---

## 1. The project in one paragraph

Three heterogeneous LLM agents answer a hard scientific question, debate for up to three rounds, and revise. Each answer is split into claims; each claim is checked against retrieved scientific evidence (PubMed, arXiv, Semantic Scholar). Each agent has a bounded trust weight that rises when its claims are supported and falls when they are contradicted. The final answer is a trust-weighted vote, not a majority vote. The target failure is **sycophantic collapse**: a correct minority abandons its answer under pressure from a confident wrong majority. Evaluation uses a **fabricated-consensus injection** plus CCR / MPR / calibration / accuracy.

**Current reality:** the engineering is phase-complete; the scientific instrument is not calibrated; the full experiment has not run. Gate 0 (vanilla MAD, 10 GPQA debates) is the only real GPU evidence.

---

## 2. Current score (8 Nov 2026)

Round-8 eight-factor rubric. **Compute is excluded at the user's request**; 7-factor weights are renormalized. Scores are working estimates, not acceptance probabilities.

| Factor | 8F weight | 7F weight | Current | After P0 | C+ (P1 reframe) | TACL full | 9+ tail |
|---|---:|---:|---:|---:|---:|---:|---:|
| Novelty | 25% | 26.3% | 4.5 | 4.5 | 7.0 | 7.5 | 8.5 |
| Method | 20% | 21.1% | 7.0 | 7.5 | 8.0 | 8.5 | 8.5 |
| Math | 15% | 15.8% | 5.0 | 6.5 | 7.5 | 7.5 | 8.0 |
| Experiments | 10% | 10.5% | 5.5 | 6.5 | 8.0 | 8.5 | 8.5 |
| Dataset | 10% | 10.5% | 4.5 | 7.0 | 7.5 | 8.0 | 9.0 |
| Q1 fit | 10% | 10.5% | 5.5 | 5.5 | 7.5 | 8.0 | 8.5 |
| Feasibility | 5% | 5.3% | 6.5 | 8.0 | 7.5 | 7.0 | 6.5 |
| Compute | 5% | — | N/A | N/A | N/A | N/A | N/A |
| **Core** | | | **5.50** | **6.25** | **7.63** | **8.00** | **8.38** |
| **Weighted** | | | **5.42** | **6.21** | **7.53** | **7.89** | **8.37** |

**Stages:** C+ = causal study + 180-item benchmark + 150-item human eval. TACL full = 6 arms × 3 datasets × 400 × 2 seeds + 300–500-item benchmark + human eval. 9+ tail = 800-item benchmark + SDT model + private split + full law-testing.

**Eight-factor vs holistic:** the 9+ tail’s eight-factor score is **8.38/8.37** because Feasibility drops to 6.5 (1,824 annotation hours). The audits’ **9.0–9.3** is a holistic reviewer judgment of the final paper, not the eight-factor arithmetic. A true 9.0 eight-factor score would require near-9 on every factor, which is not realistic for a 6-person FYDP.

**Separate judgment:** the current manuscript is **2.5/10 as a paper** and **6/10 as an FYDP mid-project report**. It has no results, invalid metrics, approximate baselines, and overclaims.

**What the numbers mean:** 5.5–5.9 Core = plausible but high novelty/evidence risk; 7.5+ = strong paper with a real contribution; 8+ = exceptional and rare. Top-Q1 is not a 5.5-Core / 5.42-Weighted paper.

**Why novelty dropped from 6.0 to 4.5:** the 2026 prior-art audit found that **R²-MAD (Findings EMNLP 2026)** already does retrieval → per-agent reliability → influence reweighting for wrong-majority correction, and **TERA-RAG (IEEE JCSSE 2026)** already produces a reliability-weighted consensus from external evidence. **"To Trust or Not to Trust" (ACL 2026 main)** already does agent-level numeric trust under malicious inputs. The exact five-way combination is unclaimed, but the mechanism is an integration of published parts. The defensible gap is the **benchmark + causal/verification-ceiling law**, not the mechanism. See `04_LITERATURE_AND_GAPS.md`.

---

## 3. Top 19 warnings

1. **GPQA/MMLU-Pro choices are never inserted into the prompts.** `eval/datasets.py:59-65` builds options; `agents/prompts.py:19-27` and `debate.py:79-82` never pass them. On GPQA the correct answer is always option A, so the option order leaks gold. Gate 0 confirms free-form answers to "which of the following" with no choices. **This alone invalidates GPQA/MMLU-Pro accuracy, injection eligibility, CCR, and MPR.** Fix first.
2. **The answer matcher takes the first number anywhere in the text.** `eval/answers.py:40-51`. `10^-4 eV` → `10.0`; `Product 3 contains 11` → `3.0`; `The answer is B` → wrong. On the Gate 0 transcript, 4/30 "correct" labels are accidental numeric coincidences; agent 1 is 0/10. Accuracy and CCR/MPR inherit this.
3. **The injection arm has no retrieval and no trust update.** `experiments.yaml` makes `injection` standalone; `run_matrix.py` has no injection flag; `runner.py:407-409` builds it without a retriever; `debate.py:102` updates trust only when evidence exists. The treatment is never stress-tested.
4. **B8 without injection has `consensus=None`, so `exposed=[]` and CCR=0.** The primary endpoint is structurally unmeasurable in the treatment arm.
5. **`evidence_introduced` is never set by the runner.** `metrics.py:144` counts collapse only when it is false; if you set it true, CCR becomes 0 by construction. The CCR definition must be split into CCR-0 and CCR-E.
6. **MPR uses the unweighted majority, not the trust-weighted answer.** `metrics.py:172-177`. The system's actual output is never scored.
7. **There is no final-answer accuracy anywhere.** `MetricSummary`, `summary.json`, and the matrix table report only CCR/MPR. The paper cannot answer "does trust improve accuracy?"
8. **ECR is anti-correlated with correctness.** Trust is a simplex weight (sums to 1), not a probability. Probe: all-correct ECR 0.333, all-wrong 0.667, perfect-ranking 1/3-correct 0.867. The >0.80 target is meaningless.
9. **The bounded-trust claim is false.** `trust/update.py:29` clamps, then `:42-43` renormalizes; the floor can be violated (`0.818/0.091/0.091`). The test only checks pre-renormalization. Neutral evidence is also not a no-op.
10. **Final trust lags final positions.** Trust is updated at the start of each round from the previous round's claims; aggregation uses round-3 positions with round-2 trust.
11. **The verifier is lexical overlap, not entailment.** `retrieval/verdicts.py:140-180`; the LLM judge prompt exists (`prompts.py:119`) but is not wired into `DebateRunner`. Six hand cases: 4/6 wrong.
12. **B8 vs B4 is confounded.** B4 uses `partition=False` (all sources); B8 uses `partition=True` (source-partitioned) plus adaptive triggering. `runner.py:363-366`. Use **B8-no-trust** as the primary control.
13. **The trust line is present even when trust is disabled.** `prompts.py:34,47` always says "Your current trust score: 0.333" — B3/B4/B8-no-trust are not clean baselines.
14. **B9/B10/B6 are approximations and unmatched.** iMAD is a heuristic gate, ConsensAgent lacks the prompt optimizer, MoA is a simplified aggregator; B5 reuses one seed so its five samples can be identical. `IMPLEMENTATION_STATUS.md:25-30`. Do not claim "+X% over iMAD" until faithful.
15. **The matrix is ~30,000 GPU-hours.** 15 conditions × 5 datasets × 3 seeds × 1,000 questions = 225,000 debates at ~8 min. The report's "300 GPU-hours" is inconsistent. Cut to 6 arms × (GPQA-Main + MMLU-Pro STEM + EG-SSS) × 250–500 questions × 2 seeds.
16. **`main` is 10 commits behind `feat/full-pipeline`.** The public GitHub default shows old code. Merge or switch the default before sharing.
17. **BrokenMath and BrokenArXiv are proof-only.** The official benchmark splits are 451/451 `proof` (BrokenMath, `gold_answer` empty) and 87/87 `proof` (BrokenArXiv, `answer` empty). Answer-type retention is **0%**, not the blueprint's 60–70%. They cannot be used for claim-level evidence grounding or CCR. Use them only in a separate premise-rejection appendix with a validated judge.
18. **Source-by-agent assignment is a fatal confound.** `sources.py` maps Agent 1→PubMed, Agent 2→arXiv, Agent 3→S2, and the model families are fixed to the same agents. On MMLU-Pro STEM this can create a **~21 pp** trust bias, larger than the effect you want to detect. Route by **claim domain**, not by agent identity.
19. **Loader bugs make the current numbers uninterpretable.** `_ANSWER_KEYS` lacks `gold_answer` (BrokenMath loads the reference solution instead); BrokenArXiv has empty `answer` fields and crashes; HLE drops `answer_type`; GPQA builds options with the correct answer first; four revisions are still `main`; `rows[:cap]` takes the first N without stratification.

---

## 4. What is actually strong

- Modular, readable codebase: inference, agents, retrieval, trust, orchestrator, eval, stats.
- 100+ unit/mock tests and a mock vLLM end-to-end path.
- Gate 0: 10/10 debates, 90/90 non-empty positions, 370.8 s/debate.
- Resumable JSONL, preflight, annotation tooling, human-eval tooling.
- Real problem, real application, six-person team, 7–8 months.
- The system is a strong thesis artifact even before the paper is strong.

---

## 5. Repository map

```text
E:\FYDP\
├── trustcal\                 # Python pipeline (source of truth for what runs)
│   ├── configs\              # models.yaml, datasets.yaml, experiments.yaml, phase.yaml
│   ├── src\trustcal\
│   │   ├── inference\        # OpenAI-compatible vLLM client
│   │   ├── agents\           # prompts, claim parser, fallback extraction
│   │   ├── orchestrator\     # debate loop, injection, B1–B10 strategies
│   │   ├── retrieval\        # PubMed/arXiv/S2 clients, pipeline, verdicts
│   │   ├── trust\            # update, state, aggregation, settings
│   │   ├── eval\             # datasets, metrics, stats, failures, pilot, oracle
│   │   └── runner.py         # resumable experiment runner
│   ├── scripts\              # run_experiment, run_matrix, analyze, pilot_report, ...
│   └── experiments\          # pilot-month1 template
├── experiments\              # gate0 report + artifacts (real)
├── docs\
│   ├── blueprint.md          # historical design doc (not evidence)
│   ├── agent\                # these docs
│   └── FYDP1_defence_Q&A.md  # STALE — says trust/retrieval are not wired
├── FYDP_Summer\              # FYDP thesis/report (chapters 4 and 6 are placeholders)
├── Papev_Summer26_6\         # journal preprint draft (results are placeholders)
├── literature_review\        # 15 papers; 5 still unread
├── UPDATE-CHECKLIST.md       # team-facing one-pager (start here if you are new)
├── roadmap.md                # plan; behind actual code
└── docs\agent\08_COMPUTE_COST.md  # Vast.ai spot cost model
```

---

## 6. Commands you will use

Run from `E:\FYDP\trustcal` unless stated otherwise.

```bash
# 1. Tests (GPU-free)
pytest

# 2. Matrix plan only — writes nothing
python scripts/run_matrix.py --dry-run

# 3. Mock end-to-end (two shells)
python scripts/mock_vllm.py --ports 8000,8001,8002 --mode divergent
python scripts/run_experiment.py --arm injection --dataset mock --limit 1 \
  --questions-file experiments/pilot-month1/questions.template.json \
  --out results/mock-check

# 4. Zero-server integration test
pytest src/trustcal/test_integration_mock.py

# 5. Real experiment (after P0 fixes and a GPU)
python scripts/run_experiment.py --arm B8 --dataset gpqa --limit 20 --seed 1
python scripts/analyze.py --records results/B8/gpqa/seed1/records.jsonl

# 6. Branch/status (from repo root)
git status --short
git log --oneline -5
git branch -vv
```

**Do not run** `python scripts/run_matrix.py` for real until `02_P0_FIXES.md` is complete and the pilot gate passes.

---

## 7. Reading order for a new agent

1. This file.
2. `01_CURRENT_STATE.md` — know what is broken before touching code.
3. `02_P0_FIXES.md` — the task list with acceptance tests.
4. `03_EXPERIMENT_PLAN.md` — the design you must not break.
5. `04_LITERATURE_AND_GAPS.md` — the claims you may and may not make.
6. `05_WRITING_AND_VENUE.md` — only if editing the paper/thesis.
7. `06_AGENT_CHECKLIST.md` — execute in order.
8. `08_COMPUTE_COST.md` — Vast.ai spot cost, bandwidth, storage, and budgets.

**Team one-pager:** `..\..\UPDATE-CHECKLIST.md` — share this with the whole team.

---

## 8. Handoff format (use for every task)

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
<exact output / test counts / metrics>

## Acceptance check
- [ ] criterion 1
- [ ] criterion 2

## Open risks
<what could still be wrong>

## Next step
<one concrete next action>
```

Never report "done" without a command and its output. If a test fails, report the failure and the file:line; do not paper over it.
