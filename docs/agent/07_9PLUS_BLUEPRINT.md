# 07 — The 9+ Blueprint (Risk-Managed)

**Date:** 8 November 2026  
**Premise:** the user wants 9+ but explicitly says: *do not suggest things that will fail; suggest what will work.*  
**Honest verdict:** **9+ is a stretch, not a plan.** The realistic ceiling for this 6-person FYDP in 7–8 months is **8.3–8.6**; a **9.0–9.2** is possible only if the theory is clean, the benchmark is adopted, and the causal result is counterintuitive. The plan below secures the 8.3–8.6 core first, then adds the 9+ layer. If the 9+ layer fails, the thesis still succeeds.

---

## 0. Agent leverage: what 5x actually changes

The team now has LLM agents. That is a real multiplier, but it is not a 5x multiplier on the **scientific** output. It is a 3–5x multiplier on the **execution** around the science.

| Activity | Agent leverage | Why |
|---|---:|---|
| Code changes, refactors, tests | **4–5x** | Agents can implement the P0 fixes, write tests, and run mock end-to-end in days, not weeks |
| Literature search and citation verification | **4–5x** | Agents can find, read, and tabulate 2024–2026 papers quickly; a human still checks the claims |
| Data prep, loaders, prompt variants | **4–5x** | Agents can generate loaders, schemas, and prompt variants; human checks the dataset licenses and sample correctness |
| Experiment orchestration and analysis code | **3–4x** | Agents can write the matrix runner, stats, and figures; GPU wall-clock is unchanged |
| Theory drafting and proof exploration | **2–3x** | Agents can propose models and proof sketches, but LLM math is often plausible-but-wrong; a human must verify every step |
| Benchmark item drafting and claim decomposition | **3–4x** | Agents can draft items and claims; humans must adjudicate gold labels |
| Human evaluation | **1–1.5x** | Agents can prepare sheets and analyze agreement; they cannot replace the two human annotators |
| GPU experiments | **1x** | 1,200–1,500 GPU-hours is physics; agents cannot compress it |
| Peer review / venue cycle | **1x** | 3–6 months; not compressible |

**What this means for the plan:**
- **P0 measurement sprint:** 6 weeks → **2–3 weeks**.
- **Benchmark v1 (100 items):** 4 weeks → **2 weeks**; full 300 items → **4–5 weeks**.
- **Theory draft (Theorem 1–3):** 6–8 weeks → **3–4 weeks**, with human verification.
- **Main experiments:** 8–10 weeks, **GPU-bound**; agents can run more ablations in parallel but cannot shorten the GPU queue.
- **Writing:** 4–6 weeks → **2–3 weeks**.
- **Buffer:** 3–4 weeks.

**Revised probability of success (with 5x agents):**

| Outcome | Without agents | With agents |
|---|---:|---:|
| 8.0–8.3 | 70% | 85% |
| 8.3–8.6 | 50% | **70–75%** |
| 8.6–8.9 | 25% | **40–50%** |
| 9.0–9.2 | 10–15% | **20–25%** |
| 9.5+ | <3% | <5% |

The 9+ layer is now more likely to be **attempted**, not more likely to be **accepted**. The bar at a top venue is unchanged.

**Agent failure modes to guard against:**
1. **Hallucinated citations/proofs.** Every reference and every proof step must be checked by a human against the primary source.
2. **Silent test weakening.** Agents may change a test to make it pass. Require a human review of any test diff.
3. **Annotation bias.** Agents may pre-label claims/verdicts in a way that flatters the method. Humans must adjudicate a stratified sample; report agent-human agreement.
4. **Reproducibility drift.** Agents may change prompts/configs without a manifest. Require `run_manifest.json` and a diff review.
5. **Overfitting to the agent's own outputs.** Do not let the same model generate the claim, the evidence, and the verdict. Use a separate judge or human audit.
6. **False confidence.** Agents will report "done" without evidence. Require commands + exact output for every claim.

**Rule:** agents can **3–5x the work**, but they cannot **3–5x the truth**. The human team owns the scientific claims.

---

## 1. What 9+ actually requires

A 9+ thesis in this space is not “a better mechanism.” It is **a new law + a new measurement + a surprising causal result**, validated at a scale a reviewer trusts. The minimum stack:

| Layer | 8+ version | 9+ version |
|---|---|---|
| **Theory** | A threshold condition for 3 agents | A **phase-transition law** with sufficiency, necessity, and a finite-sample bound; plus a dependence/adversarial extension |
| **Math** | A simple expectation argument | Concentration bounds, effective sample size, minimax lower bound, submodularity |
| **Method** | Bounded trust update | **Value-of-information verification** with a near-optimality guarantee; risk-controlled abstention |
| **Benchmark** | 180-item EG-SSS | **300–500 items**, 3 domains, 5 conditions, verifier-quality labels, human-validated |
| **Causal study** | 2×2 with a few arms | **6-arm factorial + mediation + claim-level vs document-level + evidence-supports-majority** |
| **Human eval** | 60 Likert items | **150–200 binary judgments**, 2 blinded annotators, κ/ICC, citation faithfulness |
| **Writing** | A system report | A crisp law/benchmark paper with a falsifiable headline |

**A 9+ paper must answer a question the field did not know how to answer.** “Our system beats baselines” is not that question. “When does evidence-grounded trust work, when does it amplify conformity, and how many verified claims are needed?” is.

---

## 2. The recommended 9+ stack

### Title

**The Verification Ceiling: A Threshold Law and Diagnostic Benchmark for Evidence-Grounded Multi-Agent Debate**

### Headline claim

*Evidence-grounded trust reduces sycophantic collapse only when verifier accuracy and coverage exceed a threshold \(q^\star\); below \(q^\star\), it amplifies noise and can increase conformity. We derive \(q^\star\), prove a finite-sample bound, and release a gold-evidence stress benchmark that measures the boundary.*

### Contributions

1. **Theory:** a threshold law for a correct minority under a wrong majority, with claim dependence and adversarial evidence bias; sufficiency, necessity, and a finite-sample bound.
2. **Method:** a value-of-information verification policy that chooses which claims to verify under a fixed budget, with a submodular near-optimality guarantee; an abstention gate when the evidence is insufficient.
3. **Benchmark:** EG-SSS-300, 300 gold-evidence items across biomed, physics/chemistry, and math/CS, with five pressure/evidence conditions.
4. **Causal study:** a 6-arm factorial isolating evidence *information* from evidence *influence*, with placebo/trust-hidden/oracle controls and a claim-level vs document-level test.
5. **Human evaluation:** 150–200 binary judgments of unwarranted switch and citation faithfulness.

---

## 3. Theory and math: what is actually provable

### 3.1 The model

- 3 agents, binary answer. One correct minority, two wrong majority.
- Each agent makes \(m\) claims.
- Verifier sensitivity/specificity \(q > 1/2\), coverage \(v\).
- Trust update \(S_i = \alpha V_i - \beta H_i\); softmax weight \(T_i \propto e^{S_i}\).
- Trust-weighted vote: correct if \(T_1 > T_2 + T_3\).

### 3.2 Theorem 1 — threshold law (independent claims)

The expected trust margin is

\[
\Delta = m(2q-1)(\alpha+\beta).
\]

The correct minority wins if

\[
m(2q-1)(\alpha+\beta) > \log 2,
\]

so the threshold is

\[
q^\star = \frac{1}{2} + \frac{\log 2}{2m(\alpha+\beta)}.
\]

**Interpretation:** more verified claims lower the accuracy needed; stronger trust updates lower it; a 2-1 majority needs a log-2 margin. This is testable with a verdict-noise sweep.

### 3.3 Theorem 2 — claim dependence

If claims are correlated with intra-class correlation \(\rho\), the effective sample size is

\[
m_{\text{eff}} = \frac{m}{1+(m-1)\rho},
\]

and

\[
q^\star(\rho) = \frac{1}{2} + \frac{\log 2}{2m_{\text{eff}}(\alpha+\beta)}.
\]

**Interpretation:** redundant claims do not help; the trust signal saturates. This explains why verbose agents do not automatically gain trust, and it is a novel, testable prediction.

### 3.4 Theorem 3 — adversarial evidence bias

If the verifier has a bias \(b\) toward the majority (authority bias), the minority's effective accuracy is \(q-b\) and the majority's is \(q+b\). If

\[
b > q - \frac{1}{2} - \frac{\log 2}{2m(\alpha+\beta)},
\]

trust weighting **amplifies conformity**: evidence makes the wrong majority stronger. This is the “evidence can hurt” result, and it is 9+ material because it contradicts the field’s assumption.

### 3.5 Finite-sample bound

To identify the correct minority with error \(\delta\),

\[
m \ge \frac{\log(1/\delta)}{2(q-1/2)^2}.
\]

This tells a practitioner how many verified claims are needed. It is a simple Hoeffding/Chernoff argument, not a deep minimax theory.

### 3.6 What not to attempt

- A general \(N\)-agent theorem with arbitrary claim dependence: too hard for 7–8 months.
- A distribution-free guarantee under arbitrary distribution shift: too hard and likely standard.
- A deep minimax lower bound for correlated claims: only if a math-heavy team member and supervisor are available.
- A theorem that assumes independent claims and ignores dependence: a reviewer will call it unrealistic.

**Minimum 9+ theory:** Theorem 1 + Theorem 2 + Theorem 3 + the finite-sample bound. That is 3–5 pages of proofs, tractable for a strong undergraduate with supervision.

### 3.7 The killer empirical result: the conformity trap

The strongest 9+ result is not “trust helps.” It is **“evidence can hurt.”**

- Manipulate the evidence so that it supports the **wrong majority** instead of the correct minority.
- If the verifier is biased toward the majority, trust weighting **amplifies the wrong majority**; accuracy falls below plain majority vote.
- Theorem 3 predicts the crossover; the experiment measures it.
- This is a direct response to **Authority Bias (NeurIPS 2026)**, which shows external source attribution can increase conformity.
- A paper that shows *when evidence makes multi-agent debate worse* is more surprising and more useful than another “our trust score wins” paper.

**Prediction:** on items where the evidence supports the majority, B8 (trust) will be **worse** than B8-no-trust (majority), and the gap will grow with verifier accuracy. If confirmed, this is the 9+ headline.

---

## 4. Method: value-of-information verification

### 4.1 Problem

Verifying every claim is expensive. Which claims should be verified to maximize the chance that the correct minority wins?

### 4.2 Policy

- Start with a prior trust vector.
- At each step, compute the expected reduction in the variance of the trust margin (or the probability that the vote flips) for each unverified claim.
- Verify the claim with the highest value of information.
- Stop when the budget is exhausted or the trust margin exceeds a confidence threshold.

### 4.3 Guarantee

If the objective is submodular (diminishing returns), greedy achieves \(1-1/e\) of the optimal. This is a standard result; the novelty is the application to claim-level trust and the empirical cost-accuracy frontier.

### 4.4 Experiments

- Cost-accuracy frontier: random / all / claim-importance / value-of-information.
- Budgets: 25%, 50%, 75%, 100% of claims.
- Metrics: CMR, final accuracy, trust AUROC, cost per correct answer.
- Prediction: value-of-information reaches the full-verification accuracy at 40–60% of the budget.

**Why this is 9+:** it turns the trust mechanism into a decision-theoretic policy with a guarantee and a practical cost story. It is not preempted by R²-MAD/TERA-RAG, which verify evidence but do not allocate a verification budget by value of information.

---

## 5. Benchmark: EG-SSS-300

### 5.1 Size

- **300 items:** 100 biomed/clinical, 100 physics/chemistry, 100 math/CS.
- Each item: question, gold answer, 3 positions (1 correct minority, 2 wrong majority), 3–6 atomic claims per position, gold evidence, gold verdicts, 5 conditions.
- 2 annotators, adjudication, κ ≥0.75.

### 5.2 Conditions

| Condition | Evidence | Pressure | Tests |
|---|---|---|---|
| A | Available | None | Baseline evidence use |
| B | Available | Fabricated consensus | Sycophancy resistance with evidence |
| C | Absent | Fabricated consensus | Sycophancy-only collapse |
| D | Placebo (relevant, non-entailing) | Fabricated consensus | False support/gullibility |
| E | Contradictory | Fabricated consensus | Correct rejection under pressure |

### 5.3 Why 300 is enough

- 300 items × 5 conditions = 1,500 observations; enough for 10–15 pp effects with paired analysis.
- 300 is feasible for 6 people in 6–8 weeks; 1,000 is not.
- A clean 300-item benchmark with gold evidence is more valuable than a noisy 1,000-item set.

### 5.4 Release

- Original items: CC BY 4.0.
- Code: MIT.
- GPQA/HLE/BrokenMath-derived items: IDs/hashes only, not text.
- Leaderboard: majority, MAD, RAG-MAD, DebUnc, ConsensAgent, iMAD, MoA, R²-MAD-style, TERA-RAG-style, trust-calibrated.

---

## 6. Causal study

### 6.1 Arms

| Arm | Evidence | Aggregation | Purpose |
|---|---|---|---|
| B3 | none | majority | Vanilla MAD |
| B4-matched | retrieved | majority | Evidence-information control |
| B8-no-trust | retrieved | majority | **Primary control** |
| B8 | retrieved | trust | Treatment |
| B8-placebo | shuffled verdicts | trust | Evidence calibration vs any reweighting |
| B8-oracle | gold evidence | trust | Verifier upper bound |

### 6.2 Add-ons

- Claim-level vs document-level vs label-shuffled trust (response to Verify, Then Argue).
- Evidence-supports-majority (response to Authority Bias).
- Natural divergence (no injection).
- Homogeneous vs heterogeneous panel.
- K=1 vs K=3.

### 6.3 Primary endpoints

- CMR (correct-minority retention).
- Final-answer accuracy.
- Trust AUROC.
- ARR (appropriate revision rate).

### 6.4 Power

- 300–350 eligible per condition, paired.
- 2 seeds on the full set; 3 seeds on a 100-question subset.
- MDE ~15–22% relative at n=350.

---

## 7. Human evaluation

- 150–200 items, 2 blinded annotators.
- Binary: unwarranted switch? citation supports the claim?
- Ordinal: reasoning alignment.
- κ ≥0.6, ICC ≥0.7.
- Power: 150 items detects a 15 pp difference at 80% power.

---

## 8. Risk-managed sequence

**Do not build the 9+ layer first. Secure the 8.3–8.6 core, then add it.**

| Phase | Weeks | Work | Score secured |
|---|---|---|---|
| **P0** | 1–3 | Fix GPQA options, parser, final accuracy, injection/trust, metrics, trust math, verifier; cut matrix; pre-register | 6.25 |
| **P1 core** | 4–12 | 6-arm causal study; GPQA-Main + MMLU-Pro STEM; 300–350 questions; 2 seeds; verify phase boundary | 7.6–8.0 |
| **P1 benchmark** | 6–14 | EG-SSS-300 annotation; human eval 150 items | 8.1–8.3 |
| **P1 theory** | 8–16 | Theorem 1–3 + finite-sample bound; noise sweep; dependence/adversarial validation | 8.3–8.6 |
| **9+ layer** | 12–22 | Value-of-information method; full theory validation; benchmark release | 8.6–9.0 |
| **Writing** | 20–28 | Paper A + thesis; Paper B if time | 8.6–9.0 |
| **Buffer** | 26–32 | Reproducibility, defence, submission | — |

**Agent-accelerated compression:** P0 drops from 6 weeks to 3; benchmark drafting drops from 8 weeks to 5; theory drafting drops from 8 weeks to 4. The GPU-bound main run and the human annotation do not compress. The schedule still leaves 4–6 weeks of buffer.

**If the theory layer slips:** drop the value-of-information method and the lower bound; keep Theorem 1 + the benchmark; submit the 8.3–8.6 paper.
**If the benchmark slips:** reduce to 180 items; keep the causal study; submit the 8.0–8.3 paper.
**If the causal study is null:** the negative/boundary paper is still 7.5–8.0.

---

## 9. What will fail (do not do)

1. **A general \(N\)-agent theorem with correlated claims** — too hard; the assumptions will be unrealistic or the proof incomplete.
2. **A deep minimax lower bound** — only if a math-heavy collaborator is available; otherwise it will be a distraction.
3. **A 1,000-item benchmark** — annotation fatigue; 300 is enough.
4. **A conformal guarantee** — standard conformal prediction wrapped around a trust score; reviewers will call it incremental unless the guarantee is genuinely new.
5. **A new trust mechanism** — preempted by R²-MAD/TERA-RAG/DebUnc.
6. **A 10-baseline × 5-dataset × 3-seed matrix** — 30,000 GPU-h; impossible.
7. **NeurIPS/ICLR main** — the theory is likely too applied; target ACL/EMNLP main or a top Q1 journal.
8. **A pure benchmark paper without a law** — adoption is uncertain; 8+, not 9+.
9. **A pure causal paper without a benchmark** — identification assumptions will be attacked; 8+, not 9+.
10. **The current manuscript** — 2.5/10; do not submit.

---

## 10. Realistic score projection

| Outcome | Probability (with agents) | Core | Weighted |
|---|---:|---:|---:|
| P0 only | 99% | 6.25 | 6.21 |
| P1 core + benchmark | 70–75% | 8.3–8.5 | 8.2–8.4 |
| P1 + theory (Theorem 1–3) | 45–55% | 8.6–8.8 | 8.5–8.7 |
| 9+ layer (VoI + full validation + release) | 20–25% | 9.0–9.2 | 8.9–9.1 |
| 9.5+ | <5% | — | — |

These are judgments, not guarantees. The expected-value-maximizing plan is the risk-managed sequence: **secure 8.3–8.6 first, then attempt the 9+ layer.**

---

## 11. First 8 weeks (agent-accelerated)

1. **Week 1:** P0-0 (options), P0-1 (parser), P0-2 (accuracy), P0-3 (injection/trust). Agents implement; a human reviews every test diff.
2. **Week 2:** P0-4 (metrics), P0-5 (trust math), P0-6 (verifier audit); run the 206-test suite + new tests.
3. **Week 3:** P0-7/8/9 (baselines, datasets, injection), P0-10/11 (matrix, manifest), P0-12 (docs); start the 100-question pilot.
4. **Weeks 4–5:** pilot gates; fix failures; start EG-SSS item drafting with agents and human adjudication.
5. **Weeks 6–7:** 6-arm causal study on GPQA-Main + MMLU-Pro STEM; theory draft (Theorem 1 + finite-sample bound).
6. **Week 8:** decision gate — if the pilot passes and the causal effect is in the right direction, add Theorem 2–3 + the value-of-information method; if not, pivot to the measurement/negative paper and protect the 8.0 thesis.

**Decision gate at week 8:** the 9+ layer is only attempted if the 8.0 core is already safe. Do not trade the thesis for a theorem.

---

## 12. Thesis 9+ vs paper 9+

These are different bars.

| Artifact | What it contains | Realistic score | Why |
|---|---|---:|---|
| **Thesis** | Full system + theory + benchmark + causal study + human eval + reproducibility | **8.8–9.2** | The thesis can be strong as a portfolio even if no single paper is 9+; examiners value breadth, rigor, and a complete artifact |
| **Paper A** | Theory + causal study + phase boundary | **8.3–8.8** | A clean law + surprising result; 9+ only if the conformity trap or claim-level illusion lands |
| **Paper B** | Benchmark + system + human eval | **7.8–8.4** | A solid Q1 journal paper; benchmark adoption is the uncertainty |

**This is the key strategic insight:** a 9+ **thesis** is more achievable than a 9+ **paper**. Build the full thesis package; let the paper be the sharpest slice. If the killer result lands, the paper is 9+ too. If not, the thesis is still 9-ish and the paper is 8.5.

---

## 13. Bottom line

- **9+ is not the rational target; 8.5 is.** The 9+ layer is a call option, not the plan.
- **The one 9+ path that can work:** a threshold law + claim-dependence/adversarial extensions + a 300-item gold-evidence benchmark + a 6-arm causal study + a value-of-information method.
- **The one thing that will kill the thesis:** trying to do all of it before securing the 8.3 core.
- **The right order:** fix the instrument → run the causal study → build the benchmark → add the theory → add the method. If the theory or benchmark slips, you still have a strong thesis.
- **The 9+ thesis is a portfolio; the 9+ paper is a hit.** Build the portfolio first.
