# Team Update Checklist — FYDP

**Date:** 8 November 2026  
**Purpose:** one page the whole team can read. It shows the score, what is broken, what to fix, in what order, and what it costs.

**Full details:** `docs/agent/` — start at `README.md`.

---

## 1. Current score

| Stage | Core | Weighted | What it means |
|---|---:|---:|---|
| **Current idea/plan** | **5.50** | **5.42** | Plausible, but high risk. Not top-Q1 yet. |
| After the P0 fixes | 6.25 | 6.21 | The instrument is fixed. Still not novel enough. |
| C+ core (causal study + 180-item benchmark) | 8.3–8.6 | 8.2–8.4 | Strong Q1 paper. This is the realistic target. |
| TACL full run (6 arms × 3 datasets × 400 questions) | 8.5–8.8 | 8.4–8.7 | Strong Q1 journal paper. |
| 9+ (tail outcome) | 9.0–9.2 | 8.9–9.1 | 11–12% unconditional; 30–35% only if the “evidence backfires” effect is real. |

**The current manuscript is 2.5/10 as a paper.** Do not submit it. It has no results, broken metrics, and claims results it does not have.

**Simple reading:** we have a good project, but the measuring instrument is broken. Fix the instrument first. Then run a smaller, better experiment. 9+ is a bonus, not the plan.

---

## 2. What is broken — in plain language

| # | Problem | What it means | Fix |
|---:|---|---|---|
| 1 | **The answer choices are not in the prompt** | On GPQA/MMLU-Pro, the model sees the question but not the A/B/C/D choices. The correct answer is always option A in the data. | Put shuffled choices into every prompt. Store the shuffle. |
| 2 | **The answer matcher is wrong** | It takes the first number in the text. `10^-4 eV` becomes 10.0. `The answer is B` is marked wrong. | Parse the answer line. Handle scientific notation. Test 50 real outputs. |
| 3 | **There is no final-answer accuracy** | The summary reports CCR/MPR only. We cannot answer “does trust improve accuracy?” | Add final answer + accuracy to every record, summary, and matrix. |
| 4 | **The injection arm has no trust** | The arm that tests pressure runs without retrieval and without trust. The treatment arm runs without injection. | Wire B8 + injection + trust together. |
| 5 | **ECR is invalid** | ECR treats a trust weight (sums to 1) as a probability of being correct. All-correct panels score 0.333; all-wrong panels score 0.667. | Replace ECR with trust AUROC + Brier + vote-level calibration. |
| 6 | **The trust floor is broken** | The code clamps to [0.1, 0.9], then renormalizes. The final weight can be 0.098. | Project onto the simplex with a floor. Test N=1,3,5. |
| 7 | **Final trust lags final positions** | Trust is updated from the previous round. The final answer uses old trust. | Update trust on the final positions before aggregation. |
| 8 | **The verifier is word overlap** | It marks a claim “supported” if the words overlap. It is not entailment. 4 of 6 hand cases were wrong. | Wire an NLI/LLM judge. Validate on 150–200 human pairs. |
| 9 | **B8 vs B4 is confounded** | B4 uses all sources; B8 uses one source per agent. The comparison changes two things. | Use **B8-no-trust** as the main control. Match prompts and retrieval. |
| 10 | **The baselines are approximations** | B9 iMAD is a heuristic. B10 ConsensAgent has no prompt optimizer. B6 MoA is simplified. | Make them faithful, or label them as approximations. Do not claim “+X% over iMAD.” |
| 11 | **The datasets do not fit the method** | BrokenMath is 451/451 proof-only. BrokenArXiv is 87/87 proof-only. HLE is designed to be un-googleable. | Drop BrokenMath/BrokenArXiv from the main matrix. Use GPQA-Main + MMLU-Pro STEM + EG-SSS. HLE = abstention control. |
| 12 | **The matrix is too big** | 15 conditions × 5 datasets × 3 seeds × 1,000 questions ≈ 30,000 GPU-hours. | C+ = 4 arms + oracle, ~1,000 questions. TACL = 6 arms × 3 datasets × 400 × 2 seeds ≈ 1,920 GPU-hours. |
| 13 | **The cost ignored bandwidth and storage** | The old plan used GPU $/hr only. Downloads, storage, and stopped instances add 10–25%. | Use the Vast.ai spot model in `08_COMPUTE_COST.md`. Persist the cache. |
| 14 | **The paper overclaims** | The abstract says “produced fewer hallucinated answers” but there are no results. It says “no mechanism exists” — false. | Rewrite the claims. See `05_WRITING_AND_VENUE.md`. |

---

## 3. Step-by-step fix — P0 (3–4 weeks)

### Week 1 — Make the answers real

- [ ] Put shuffled A/B/C/D choices into every MCQ prompt.
- [ ] Store the shuffle. Never put the correct answer first.
- [ ] Fix the answer parser and matcher.
- [ ] Add final-answer accuracy to the record and summary.

**Done when:** 50 real Gate 0 outputs parse at ≥95%; every MCQ prompt contains all choices; `summary.json` has `accuracy`.

### Week 2 — Make the treatment real

- [ ] Wire **B8 + injection + trust** together.
- [ ] Fix the trust floor, final-round update, and claim-count bias.
- [ ] Replace ECR with trust AUROC + Brier + vote calibration.
- [ ] Add CCR-0, CCR-E, CMR, MPR-weighted, ARR.

**Done when:** a mock B8+injection run has `consensus`, `exposed`, `trust_trajectory`, `evidence`, and `final_answer`; trust sums to 1 and respects the floor; the new metrics are in `summary.json`.

### Week 3 — Make the evidence real

- [ ] Wire an NLI/LLM judge into the debate loop.
- [ ] Validate it on 150–200 human-labeled claim–passage pairs.
- [ ] Make **B8-no-trust** the main control.
- [ ] Drop BrokenMath/BrokenArXiv from the main matrix.
- [ ] Use GPQA-Main + MMLU-Pro STEM + EG-SSS.
- [ ] Pin all dataset revisions.

**Done when:** verifier balanced accuracy ≥0.75; B8 vs B8-no-trust differs only in trust; all revisions are commit hashes.

### Week 4 — Make the plan real

- [ ] Cut the matrix.
- [ ] Write `PRE_REGISTRATION.md`.
- [ ] Run a 100-question pilot.
- [ ] Update the docs.
- [ ] Do **not** merge branches; push `feat/full-pipeline`.

**Done when:** C+ matrix ≤1,500 GPU-h or TACL ≤3,400 GPU-h; pre-registration exists; pilot passes the gates.

---

## 4. What to run — C+ first

| Step | What | Size | Why |
|---|---|---:|---|
| 1 | Pilot | 100–150 questions | Check the wiring and the effect. |
| 2 | C+ core | 4 arms + oracle, ~1,000 questions | Real causal result. |
| 3 | EG-SSS benchmark | 180 items | Gold-evidence stress test. |
| 4 | Human evaluation | 150 paired items | Validate the automatic metrics. |
| 5 | Decide | If **ρ > 0.4** and the pilot shows the effect → run TACL. If not → stop at 8.3–8.6. | Do not gamble the thesis. |

**TACL full run:** 6 arms × 3 datasets × 400 questions × 2 seeds = 14,400 debates ≈ **1,920 GPU-hours**. Four 24 GB GPUs = 480 GPU-hours each = **20 days**; 4 weeks with buffer.

**Human annotation:** 500 items × 5 claims × 2 annotators = **5,000 labels** ≈ 167 hours. Six people × 7 hours/week × 4 weeks = 168 hours.

---

## 5. Cost — Vast.ai spot (8 Nov 2026)

| Item | Real price |
|---|---:|
| RTX A6000 48 GB spot | **$0.382/hr** median |
| RTX 4090 24 GB spot | $0.409/hr median |
| RTX PRO 6000 S 96 GB spot | **$1.432/hr** median |
| RTX PRO 6000 WS 96 GB spot | $1.245/hr median |
| RTX PRO 6000 Max-Q 96 GB spot | $1.017/hr median (but $0.026/GB bandwidth) |
| Bandwidth | $0.004–0.011/GB typical; avoid $0.026–0.049/GB |
| Storage | $0.20–0.40/GB/month on the instance disk |

| Path | All-in cost |
|---|---:|
| C+ core | **$550–850** |
| TACL main | **$1,300-1,800** |
| Full law-testing | $1,300–2,050 |

**What blows the budget:**
1. Re-downloading the model cache every session.
2. Leaving a stopped instance for days.
3. Running the 15×5×3×1,000 matrix (~$11,000+).
4. Using on-demand for everything.
5. Idle GPUs while debugging.
6. High-bandwidth hosts ($0.026/GB).
7. Forgetting to copy results before destroying the instance.

**Rules:** persist the cache, batch sessions, copy results, destroy the instance, choose `inet_down_cost ≤ $0.005/GB`.

---

## 6. Venue

- **Target: TACL, 1 February 2027.** Q1, ~7-week first decision, 9+ capable.
- **Fallback: EMNLP 2027 main, 28 May 2027.**
- **Do not submit ACL 2027.** The 4 January deadline is too early, and an ARR rejection blocks TACL for nine months.
- **TMLR is Q2, not Q1.** If Q1 is mandatory, use TACL/IP&M/KBS.
- **Do not split into two papers.** Thesis + one TACL paper.

---

## 7. Who does what

| Person | Job | Main files |
|---|---|---|
| **P1** | Theory, claim, thesis lead | `07_9PLUS_BLUEPRINT.md`, theory chapter |
| **P2** | GPU runs, reproducibility | `runner.py`, `scripts/`, `08_COMPUTE_COST.md` |
| **P3** | Benchmark + annotation | `EG-SSS`, `datasets.py` |
| **P4** | Statistics + causal analysis | `eval/stats.py`, `metrics.py` |
| **P5** | Human evaluation | `scripts/human_eval.py`, rubric |
| **P6** | Retrieval + verifier | `retrieval/`, `verdicts.py` |

**One owner per file.** Do not edit the same file in parallel.

---

## 8. What not to do

- Do not run the 15×5×3×1,000 matrix.
- Do not submit the current paper.
- Do not use BrokenMath/BrokenArXiv for evidence grounding or CCR.
- Do not use ECR as a primary metric.
- Do not compare B8 to B4 without matching the retrieval and prompt.
- Do not claim “formally bounded” before the simplex fix is proved and tested.
- Do not treat 3 seeds as independent samples.
- Do not let agents certify proofs, tests, or gold labels.
- Do not cite R²-MAD/TERA-RAG/“To Trust or Not” without reading them.
- Do not merge `main` and `feat/full-pipeline` unless the team decides.

---

## 9. How to report

Use this format for every task:

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

## 10. Links

| Doc | What it is |
|---|---|
| `docs/agent/00_START_HERE.md` | Orientation, score, warnings |
| `docs/agent/01_CURRENT_STATE.md` | What is real vs broken |
| `docs/agent/02_P0_FIXES.md` | The 12 fixes with acceptance tests |
| `docs/agent/03_EXPERIMENT_PLAN.md` | C+ and TACL design, power, cost |
| `docs/agent/04_LITERATURE_AND_GAPS.md` | Prior art and missing references |
| `docs/agent/05_WRITING_AND_VENUE.md` | Claims, writing, venue |
| `docs/agent/06_AGENT_CHECKLIST.md` | DeepSeek V4.1 Flash Max checklist |
| `docs/agent/07_9PLUS_BLUEPRINT.md` | The 9+ option and red-team verdict |
| `docs/agent/08_COMPUTE_COST.md` | Vast.ai spot cost, bandwidth, storage |
