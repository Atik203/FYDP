# 07 — The 9+ Blueprint (Risk-Managed Proposal)

> **Status 9 November 2026:** this is a **proposal/strategy document, not results**. P0 engineering is released (13/13, 514 tests, `p0-release`); there are **no efficacy results** and the **96 GB hardware smoke has not run** (the offline 73.68 GB fit check passes). The project title is fixed: *The Boundaries of Evidence-Grounded Trust in Multi-Agent Scientific Debate, with a Controlled Benchmark for Sycophantic Consensus.* The 8 November 2026 probability/score estimates and week schedule are historical judgments, not current status. The current order of work is `roadmap.md`. **Historical proposal; current budget and execution stack are in `docs/agent/08_COMPUTE_COST.md`.**

**Date:** 8 November 2026 (original proposal); status banner added 9 November 2026
**Premise:** the user wants 9+ but explicitly says: *do not suggest things that will fail; suggest what will work.*  
**Honest verdict:** **9+ is a low-probability option, not a plan.** The rational target for this 6-person FYDP is **8.4–8.6**; a **9.0–9.2** is possible only if the theory is clean, the benchmark is adopted, and the causal result is counterintuitive. The plan below secures the 8.3–8.6 core first, then adds the 9+ layer. If the 9+ layer fails, the thesis still succeeds.

> **Red-team correction (8 Nov 2026).** The full 9+ stack is technically feasible but **strategically dominated**. Unconditional \(P(9+) \approx 11\text{–}12\%\); \(P(8.3\text{–}8.6) \approx 30\text{–}35\%\); \(P(8.3+) \approx 50\text{–}55\%\); \(P(8+) \approx 75\%\). The recommended path is **Core-run staged**: a 4-arm causal study plus the 180-item EG-SSS at the v1.2 benchmark freeze, expected score 8.4. Core v1.0 itself uses GPQA/MMLU-Pro/HLE; the 180-item set is not in the v1.0 matrix. The full 9+ stack is a call option, not the plan. See §9A.

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
| GPU experiments | **1x** | Core run 1,280 GPU-h cap (~1,067 planned); Full default 1,280 GPU-h (32-row gold-evidence), alternate 1,440 (36-row gold-answer); law-testing is outside the $600 hard stop; agents cannot compress GPU wall-clock |
| Peer review / venue cycle | **1x** | 3–6 months; not compressible |

**What this means for the plan:**
- **P0 measurement sprint:** 6 weeks → **2–3 weeks**.
- **Benchmark v1 (100 items):** 4 weeks → **2 weeks**; full 300 items → **4–5 weeks**.
- **Theory draft (Theorem 1–3):** 6–8 weeks → **3–4 weeks**, with human verification.
- **Main experiments:** 8–10 weeks, **GPU-bound**; agents can run more ablations in parallel but cannot shorten the GPU queue.
- **Writing:** 4–6 weeks → **2–3 weeks**.
- **Buffer:** 3–4 weeks.

**Revised probability of success (with 5x agents):**

| Outcome | Probability (with agents) |
|---|---:|
| 9.0+ | **11–12%** |
| 8.6–9.0 | ~10% |
| 8.3–8.6 | **30–35%** |
| 8.0–8.3 | ~22% |
| 7.5–8.0 | ~10% |
| No finish / <7.5 | ~15% |

**Net leverage is 2–3x, not 5x.** Every agent artifact needs human review. The project speedup is ~1.8–2.5x, not 5x. The theory is verification-bound; annotation and GPU are not compressible. \(P(8.3+) \approx 50\text{–}55\%\); \(P(8+) \approx 75\%\); \(P(9+) \approx 11\text{–}12\%\) unconditional, **30–40% conditional on measured \(\rho > 0.4\)** and a strong behavioral pilot. If \(\rho < 0.3\), the thesis caps at 8.6.

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
| **Causal study** | 2×2 with a few arms | **6-arm Full core (32-row gold-evidence default; 36-row gold-answer alternate) + ceiling/granularity sweeps + mediation + claim-level vs document-level + evidence-supports-majority** |
| **Human eval** | 60 Likert items | **150–200 binary judgments**, 2 blinded annotators, κ/ICC, citation faithfulness |
| **Writing** | A system report | A crisp law/benchmark paper with a falsifiable headline |

**A 9+ paper must answer a question the field did not know how to answer.** “Our system beats baselines” is not that question. “When does evidence-grounded trust work, when does it amplify conformity, and how many verified claims are needed?” is.

---

## 2. The 9+ stack (only if you choose to attempt it)

### Title

**Fixed project title:** *The Boundaries of Evidence-Grounded Trust in Multi-Agent Scientific Debate, with a Controlled Benchmark for Sycophantic Consensus.*

**Working 9+ framing (not the title):** the "verification ceiling" is a derived hypothesis about a verifier-accuracy/coverage boundary. It is not proved and must not be presented as the paper title or as a result.

### Headline claim (derived hypothesis, not proved)

*Evidence-grounded trust reduces sycophantic collapse only when verifier accuracy and coverage exceed a threshold \(q^\star\); below \(q^\star\), it amplifies noise and can increase conformity. We derive \(q^\star\), check a finite-sample bound, and release a gold-evidence stress benchmark that measures the boundary.*

### Contributions

1. **Theory (derived, proof check required):** a threshold law for a correct minority under a wrong majority, with claim dependence and adversarial evidence bias; sufficiency, necessity, and a finite-sample bound.
2. **Method (proposal):** a value-of-information verification policy that chooses which claims to verify under a fixed budget, with a submodular near-optimality guarantee; an abstention gate when the evidence is insufficient.
3. **Benchmark:** EG-SSS-300, 300 gold-evidence items across biomed, physics/chemistry, and math/CS, with five pressure/evidence conditions.
4. **Causal study:** the 6-arm Full core (32-row gold-evidence default; 36-row gold-answer alternate) plus ceiling/granularity sweeps isolating evidence *information* from evidence *influence*, with placebo/trust-hidden/oracle controls and a claim-level vs document-level test. The 6-arm core alone is 8+, not 9+.
5. **Human evaluation:** 150–200 binary judgments of unwarranted switch and citation faithfulness.

---

## 3. Theory and math: derived, not proved

> **Proposal status (9 Nov 2026).** The results in this section are derived sketches. No independent proof check has signed them. Do not present \(q^\star\), Theorem 1–3, or the finite-sample bound as proved until that check exists.

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

## 3A. The stronger theory result: the double-counting phase boundary (derived, not proved)

> **Proposal status.** The \(\rho^\star\) boundary and the likelihood-ratio ceiling are derived claims awaiting an independent proof check. They are a research target, not a result.

The simple threshold in §3 is the pedagogical special case. The actual 9+ result is **claim double-counting**.

### 3A.1 Parameters

- \(q\): verifier accuracy; \(g = 2q-1\) (discrimination).
- \(\tau^+\): probability a true claim is verified supported; \(\tau^-\): probability a false claim is verified supported.
- \(d = \tau^+ - \tau^-\) (claim-truth separation); \(s = \tau^+ + \tau^-\) (claim mass).
- \(v\): coverage (fraction of claims with evidence).
- \(\rho\): claim overlap/dependence (the same proposition cited by multiple agents).
- \(N\): number of agents; \(k\): minority size; \(\pi = P(\text{majority correct})\).
- \(\delta\): confidence.

### 3A.2 The law

The number of **verified** claims needed is

\[
n^\star_{\text{verified}} = \Theta\!\left(\frac{s\log(N/\delta)}{g^2 d^2}\right),
\]

and the number of **emitted** claims is

\[
n^\star_{\text{emitted}} = \frac{n^\star_{\text{verified}}}{v(1-\rho)}.
\]

Inverted, the verifier-accuracy threshold is

\[
q^\star = \frac{1}{2} + \frac{1}{2}\sqrt{\frac{s\log(N/\delta)}{n\,v\,d^2\,(1-\rho)}}.
\]

### 3A.3 The exact ceiling

Define the likelihood ratio

\[
D(q) = \frac{P(\text{favours minority}\mid H_1)}{P(\text{favours minority}\mid H_0)}.
\]

Trust weighting beats majority **iff**

\[
D(q) > \frac{\pi}{1-\pi}.
\]

Below the ceiling, the expected accuracy of trust weighting is

\[
E[\mathrm{Acc}_{TW}] = \pi - \kappa(2\pi-1) < \pi,
\]

where \(\kappa = P(\text{weights favour the minority})\). \(D(q)\) is monotone in \(q\) by coupling, so \(q^\star\) is a unique root.

### 3A.4 The killer: double counting and \(\rho^\star\)

Each shared proposition contributes

\[
(m_c - 1)\log \mathrm{LR}(V_c)
\]

of spurious log-odds, where \(m_c\) is the number of agents citing it. The critical overlap is

\[
\rho^\star = 1 - \frac{n^\star_{\text{verified}}}{n v}.
\]

**Above \(\rho^\star\), no verifier accuracy rescues the correct minority.** This is the 9+ result: the failure is not verifier noise; it is **evidence redundancy**. More agents citing the same proposition make the wrong majority look more supported.

### 3A.5 Corollaries

- **Adversarial budget:** \(\varepsilon^\star = (q-q^\star)/(2q-1) \to 0\) at the ceiling.
- **Credulous bias:** a bias \(\beta\) shifts \(q^\star\) by exactly \(\beta/2\) and **reverses** the mechanism when \(\beta > 2q-1\).
- **Headroom:** \(\le 1-\pi\).

### 3A.6 Novelty ledger

| Result | Status |
|---|---|
| Softmax trust ≡ log-linear pool with Nitzan–Paroush weights (R1) | Known; use as grounding, do not claim |
| Identical claim sets ⇒ exactly majority (R2) | One-line degeneracy; useful sanity check |
| Exact likelihood-ratio ceiling (R4) | New in this application |
| Double counting and \(\rho^\star\) (R6) | **The killer result** |
| Chernoff–Stein sample complexity, design-effect dependence, naive-Bayes double counting | Known ingredients; the combination and the \(\rho^\star\) boundary are new |

**Minimum 9+ set:** R2 (degeneracy) + R4 (exact ceiling) + R6 (double counting/\(\rho^\star\)). R3/R5 are support, not the contribution.

### 3A.7 The empirical prediction

Measure \(\rho\) on real debates (fraction of claims shared across agents / evidence passages reused).

- **If \(\rho > 0.4\):** the \(\rho^\star\) boundary is the 9+ headline. Show that real multi-agent debates are **redundancy-bound**, not verifier-bound.
- **If \(\rho < 0.3\):** R6's punchline collapses; the thesis is a solid 8 (correct, well-verified, not surprising).
- **If \(\rho \approx 0.4\):** the result is a boundary condition; report it honestly.

**This is the single most important empirical measurement in the thesis. Start it in week 4, not week 12.**

### 3B. The causal 9+ result: sign reversal and granularity moderator

The 9+ claim is not “trust helps.” It is **“evidence can backfire, and the sign depends on attribution granularity.”**

- **Below \(q^\star\):** calibrated trust **increases** wrong-majority conformity; accuracy falls below majority.
- **Above \(q^\star\):** trust reduces collapse.
- **Moderator:** document-level trust raises \(q^\star\); claim-level trust lowers it. This is the direct test of Verify, Then Argue: if claim-level attribution is epiphenomenal, document-level trust will match or beat it.
- **Mediator:** trust margin; selection vs persuasion; silent dissent.
- **Replication:** a second model family and a second domain.

**6-arm vs 9+ resolution:** the 6-arm matrix (32-row gold-evidence default; 36-row gold-answer alternate) is the **8+ core**; it is the Full run. The 9+ layer is **8 arms + the ceiling sweep (S3) + the granularity/backfire manipulation (S4) + mediation (S5) + replication (S6)** — not a different 6-arm count. Do not describe the 6-arm Full target as a 9+ design, and do not fold 9+ sweeps into the Full envelopes (1,280 default; 1,440 alternate).
- 8 arms + the ceiling sweep (S3) + the granularity/backfire manipulation (S4) + mediation (S5) + replication (S6).
- The 9+ layer adds sweeps beyond the **Full envelopes (1,280 default; 1,440 alternate)**; it is not budgeted and is not part of the Core/Full plan.
- Pre-register the four primary contrasts and the three-way interaction **before** the main runs.

**Why this is 9+:** it predicts a **sign reversal** that no current paper reports. A paper that shows *when evidence makes debate worse* is more surprising and more useful than another “our trust score wins” paper.

## 4. Method: SEA-Cert (Shared-Error-Aware Certification) — proposal, not proved

> **Proposal status (9 Nov 2026).** SEA-Cert is a design proposal. Its theorems are derived sketches, not proved; it is not part of Core v1.0 and is not funded.

**Do not use conformal trust calibration (CTC).** It is preempted by Wang et al., *Conformal Social Choice for Safe Multi-Agent Deliberation* (EMNLP 2026 SAC Highlight, arXiv 2604.07667), and its coverage guarantee is invariant to the trust weights — calibrating weights cannot improve validity, only set size. CTC is a 4.5–5.5 paper, not 9+.

### 4.1 The problem

The deployment question is not “does the answer have coverage?” It is: **what is the error rate among the claims we act on?** If agents share a wrong premise, no amount of calibration fixes it.

Let \(S_c\in\{0,1\}\) be the **shared-error event**: all agents inherit the same wrong premise/evidence. Let \(\rho = P(S=1)\). Let the verifier accept/reject with \(a_1=P(V=\text{accept}\mid S=1)\), \(a_0=P(V=\text{accept}\mid S=0)\).

### 4.2 Theorem 1 — flat risk–coverage curve

If \(V\perp S\), then for every threshold \(t\),

\[
\mathrm{SR}(t) = P(Y=\text{wrong}\mid V=\text{accept}) = \rho.
\]

The selective risk is exactly \(\rho\) at every operating point. No threshold, calibration set size, number of agents, or conformal layer changes it.

**Implication:** if real debates have \(\rho \approx 0.2\)–\(0.3\), no independent verifier can certify a 5% error rate. That is a policy-relevant negative result.

### 4.3 Theorem 2 — phase transition

Certifying \(\mathrm{SR}\le\beta\) at acceptance rate \(\ge s\) is possible with an \(S\)-independent verifier **iff \(\beta\ge\rho\)**. If \(\beta<\rho\), the verifier must be **negatively associated** with \(S\):

\[
\frac{a_1}{a_0}\le r^\star(\beta,\rho)=\frac{\beta(1-\rho)}{\rho(1-\beta)}.
\]

At \(\beta=\rho\), \(r^\star=1\). Independence is not enough; the verifier must actively detect the agents' shared failure.

### 4.4 Theorem 3 — non-identification

Marginal ROC does not identify \((a_1,a_0)\) or \(\mathrm{SR}\). Two verifiers with identical accuracy and acceptance rates can have different selective risk. **Verifier accuracy is the wrong statistic.** The right statistic is the \(S\)-conditional likelihood ratio.

### 4.5 Theorem 4 — cluster design effect

If claims cluster by shared premise/evidence with intra-cluster correlation \(\rho_{\text{ICC}}\) and mean cluster size \(\bar m\), the effective sample size is \(n/\mathrm{DE}\), \(\mathrm{DE}=1+(\bar m-1)\rho_{\text{ICC}}\). A claim-level audit is anti-conservative by \(\sqrt{\mathrm{DE}}\). To certify FDP \(\le\beta\),

\[
m=\Omega\!\left(\mathrm{DE}\cdot\frac{\beta(1-\beta)\log(T/\delta)}{\Delta^2}\right).
\]

**Optimal design: audit breadth, not depth** — maximize clusters, minimize claims per cluster.

### 4.6 Algorithm: SEA-Cert

```text
INPUT: claim clusters g=1..G; debate transcripts; evidence pool;
       verifier ensemble V; audit budget m; risk target beta; confidence delta

1. Sample G_audit clusters; audit n_g claims per cluster (human gold).
2. Estimate rho_hat  <- fraction of audited clusters with unanimous error.
3. Estimate ICC_hat  <- intra-cluster correlation of error.
4. Estimate DE_hat   <- 1 + (m_bar - 1) * ICC_hat.
5. For each threshold t on a grid:
     estimate a1_hat(t), a0_hat(t), acceptance_hat(t)
     FDP_UCB(t) <- Clopper-Pearson upper(FDP_hat(t), m/DE_hat, delta/T)
     accept_LCB(t) <- Clopper-Pearson lower(acceptance_hat(t), m, delta/T)
6. Choose t* = argmax accept_LCB(t) s.t. FDP_UCB(t) <= beta.
7. If no feasible t*: return CANNOT_CERTIFY.
8. For each claim c: score_c <- f(V(c), agreement, evidence support)
   if score_c >= t*: ACCEPT(c) else ABSTAIN(c)
```

**Guarantee:** with probability \(\ge 1-\delta\) over the audit draw, the realized false-discovery proportion on the accepted set is \(\le\beta\), cluster-robustly. This is a PAC-style bound on the action, not a marginal coverage statement.

### 4.7 Why this is not CTC

| | CTC | SEA-Cert |
|---|---|---|
| Object | Coverage of a set | Error rate of an action |
| Guarantee | Marginal, exchangeability | PAC, cluster-robust |
| Role of trust weights | The contribution | A feature in \(f\); not the guarantee |
| Failure mode | Covered but unsafe | Refuses to certify |
| New theorem | None | Flat curve, phase transition, non-identification, design effect |

CTC becomes the estimator inside SEA-Cert; it is demoted from contribution to instantiation.

### 4.8 Experiments

| Experiment | Design | Metric | 9+ result |
|---|---|---|---|
| Flat-curve test | 5 verifier families × 6 thresholds | SR vs acceptance | Slope ≈ 0; SR ≈ \(\hat\rho\); \(R^2>0.9\) |
| Matched-accuracy pairs | Equal marginal accuracy, vary evidence access | SR divergence | 2× SR at matched accuracy |
| Phase transition | Vary \(\beta\) around \(\hat\rho\) | Certified acceptance | Sharp drop at \(\beta=\rho\) |
| Verifier sweep | 55–95% accuracy × {no evidence, retrieved, oracle, adversarial} | Certified acceptance at \(\beta=0.05\) | Accuracy uncorrelated with certification; likelihood ratio predicts (\(R^2>0.8\)) |
| Cluster effect | SciFact/ExpertQA grouped by paper/section | ICC, DE | DE = 2–5×; naive audit anti-conservative |
| Frontier recovery | SEA-Cert vs CSC, Dai, TRAQ, Conformal-RAG, R2-MAD, TERA-RAG | Certified acceptance at \(\beta\); audit cost | 2–3× more certified claims |
| Real-domain headline | \(\hat\rho\) on scientific claims | \(\hat\rho\) | If \(\hat\rho\approx0.15\)–\(0.35\), no independent verifier can certify 5% risk |

### 4.9 Feasibility

- 1,500–2,000 audited claims, cluster-randomized, 5–6 weeks with 2 annotators.
- Agents can prepare packets and pre-label; humans adjudicate a stratified sample.
- Expected score: **7.8–8.4**; 9+ tail **20–28%**.
- This is the strongest method path because it changes the object from coverage to certified selective risk and has a sharp, testable theorem.

### 4.10 Optional secondary method

Value-of-information verification can be a secondary experiment: under a fixed audit budget, which claims should be verified to maximize certified acceptance? If the objective is submodular, greedy gives \(1-1/e\). Keep it as an extension, not the centerpiece.

---

## 5. Benchmark: EG-SSS-300

### 5.1 Size

- **24 items = calibration batch** (start here; one week).
- **180 items = v1.2 benchmark-freeze floor** (~410 h annotation). It is **not** in the Core v1.0 matrix.
- **300 items = Full target**; **600 = stretch**; **800 + SDT model + private split = no-go**.
- **800-item design (do not build):** 4 domains × 200 (physics, chemistry/materials, biology/medicine, CS/ML); 120 dev / 480 public test / 200 private.
- Each item: question, gold answer, 3 positions (1 correct minority, 2 wrong majority), 3–6 atomic claims per position, gold evidence, gold verdicts, controls.
- **2–3 dedicated annotators; ~1,824 h for 800 items; κ ≥0.75.** Do not build 800 with agents alone.

### 5.2 Controls (14)

No pressure, neutral restatement, peer pressure, authority pressure, emotional escalation, evidence placebo, evidence-supports-minority, evidence-supports-majority, ambiguous evidence, evidence shuffle, label/position shuffle, majority-correct items, verifier-quality sweep, no-verifier ablation. The minimum essential set is 11 of 14; do not drop majority-correct, placebo, E−, or label shuffle.

### 5.3 The SDT measurement model (proposal, not validated)

\[
z = w_e e + w_s s_{\text{maj}} + w_v v + b + \epsilon
\]

- \(e\) = evidence valence; \(s_{\text{maj}}\) = social signal; \(v\) = verifier signal.
- **Sycophancy** \(= w_s/w_e\); **verifier trust** \(= w_v\); **abstention criterion** \(= \lambda\); **competence** \(= d'\).
- Report a 6-axis profile: resistance, correction, deference, attribution, abstention, robustness.
- **Headline figure: the trust plane** (resistance vs deference) — calibrated, sycophantic, contrarian, incoherent.

This turns EG-SSS from a scoreboard into a measurement instrument. Without it, 800 items is a dataset paper; with it, it is a 9+ benchmark.

### 5.4 Release

- Original items: CC BY 4.0.
- Code: MIT.
- GPQA/HLE/BrokenMath-derived items: IDs/hashes only, not text.
- Leaderboard: majority, MAD, RAG-MAD, DebUnc, ConsensAgent, iMAD, MoA, R²-MAD-style, TERA-RAG-style, trust-calibrated.

---

## 6. Causal study

### 6.1 Arms

**Core v1.0** uses the first four rows. **B8-placebo and B8-oracle are the Full target, pending WP-18**; the Full default is 32 rows with a gold-evidence oracle on EG-SSS (1,280 GPU-h), and 36 rows is the gold-answer alternate (1,440 GPU-h).

| Arm | Evidence | Aggregation | Purpose |
|---|---|---|---|
| B3 | none | majority | Vanilla MAD |
| B4-matched | retrieved | majority | Evidence-information control |
| B8-no-trust | retrieved | majority | **Primary control** |
| B8 | retrieved | trust | Treatment |
| B8-placebo | shuffled verdicts | trust | Evidence calibration vs any reweighting |
| B8-oracle | gold evidence or gold-answer trust | trust | Verifier upper bound; definition frozen by WP-18 |

### 6.2 Add-ons

- Claim-level vs document-level vs label-shuffled trust (response to Verify, Then Argue).
- Evidence-supports-majority (response to Authority Bias).
- Natural divergence (no injection).
- Homogeneous vs heterogeneous panel.
- K=1 vs K=3.

### 6.3 Primary endpoints

- Final-answer accuracy (primary).
- CMR (correct-minority retention; co-primary).
- Trust AUROC / Brier (secondary).
- ARR (appropriate revision rate; secondary).

### 6.4 Power

- Core v1.0 plans 400 GPQA-Main + 400 MMLU-Pro + 200 HLE per condition; HLE is a control, not a powered primary.
- Full target: 300 items/dataset if the 180-item set is clean; 2 seeds on the full set; 3 seeds on a 100-question subset.
- MDE ~15–22% relative at n=350–400; report the achieved MDE.

---

## 7. Human evaluation

**Target: 150 paired items** (300 traces, both arms), **3 annotators**, ~28 h/person over 10 weeks. 200 is a stretch; 80 is the minimum credible floor.

### 7.1 The revision taxonomy

The current CCR conflates sycophancy with evidence-warranted error. The human study decomposes every answer change:

| Prior | New | Justified? | Category |
|---|---|---|---|
| correct | wrong | no (social/drift) | **UWS** — unwarranted switch |
| correct | wrong | yes (evidence/argument) | **EWE** — evidence-warranted error |
| wrong | correct | yes | **ARR** — warranted correction |
| wrong | correct | no | **Lucky correction** |
| wrong | wrong | — | **Stubborn error** |
| any | any | cannot determine | **Ambiguous** |

Automatic CCR ≈ UWS + EWE + ambiguous. Automatic ARR ≈ ARR + lucky. The human study decomposes them. This is the measurement contribution.

### 7.2 Tasks

| Task | Sample | Judgment | Target |
|---|---|---:|---|
| **T1 — Revision justification** | 150 paired items (360 traces + 60 controls) | 3-level justification + driver | weighted κ ≥0.67 |
| **T2 — Claim–passage support** | 300 citation pairs | entails / partial / does not entail + relevance + authenticity | weighted κ ≥0.67 |
| **T3 — Reasoning alignment** | 80 traces | sound / minor gap / major gap / not aligned | ICC ≥0.67 |
| **T4 — Abstention quality** | 80 items | sufficient/insufficient/contradictory × answer/abstain | κ ≥0.60 |
| **T5 — Trust-trajectory faithfulness** | 50 items × 3 pairs | blind evidence ranking vs trust ranking | κ ≥0.60 |
| **T6 — Expert upper bound** | 60 items, 3 experts | answer with/without evidence | descriptive |

### 7.3 Power and analysis

- 150 paired items gives **80% power for a 12.5–13.5 pp** difference, not 10 pp. 240 paired items are needed for 10 pp.
- **Primary analysis:** corrected automatic rate on the full 350–500 items per arm, using the human sample to estimate sensitivity/specificity (Rogan–Gladen). The human subset is calibration/sensitivity, not the powered primary endpoint.
- Secondary: paired McNemar on the 150 items; mixed-effects logistic with item/annotator random effects; cluster bootstrap by item.
- Report the achieved MDE; do not claim a 10 pp human effect at n=150.

### 7.4 Blinding and bias

- Arm-blind, hypothesis-blind, random IDs; a key custodian holds the arm key; unblind after the analysis script is frozen.
- **External annotators strongly preferred:** 2 external + 1 author, or 3 external; a 40-item external audit is the minimum credible check.
- LLM pre-annotation is allowed for **triage/sampling** only; no visible pre-fill before the human commits. Run a 50-item anchoring audit.
- 5% attention checks, 5% duplicates, weekly calibration, adjudication with a blind third labeler.

### 7.5 Surprising results that would lift the paper

1. **Sycophancy residual:** automatic CCR drops 18 pp, human UWS only 4 pp — trust changes evidence use, not social resistance.
2. **Evidence-faithfulness gap:** trust AUROC vs gold .72, vs human evidence ranking .54 — trust tracks correctness, not evidence.
3. **Resistance–revision tradeoff:** UWS down 10 pp but warranted corrections down 8 pp — calibrated trust can make agents stubborn.
4. **Citation illusion:** automatic verifier precision .88, human strict .61 — the verification ceiling is closer than claimed.
5. **Expert ceiling inversion:** experts 82% with evidence, models 58%; the gap is largest where evidence is sufficient — “bad evidence” is ruled out.
6. **Abstention mismatch:** trust increases abstention on answerable items but not on unverifiable ones — a safety finding.

**Score impact:** a rigorous human package adds **+0.5 to +0.8**; it cannot move 5.5 to 9 by itself. It can lift an 8.3 core to 8.8–9.1 if one of the surprising dissociations lands.

---

## 8. Risk-managed sequence (historical proposal, 8 Nov 2026)

> **Historical planning.** This week-numbered sequence is superseded by the dated N1–N5/G2–G5 calendar in §11 and `roadmap.md`. Keep it as the rationale for staging; do not use the week numbers as the current schedule.

**Do not build the 9+ layer first. Secure the 8.3–8.6 core, then add it.**

| Phase | Weeks | Work | Score secured |
|---|---|---|---|
| **P0** | Done 2026-11-09 | Engineering hardening; 13/13, 514 tests | 6.25 |
| **Benchmark** | 3–11 | EG-SSS annotation starts week 3; 180-item v1.2 freeze; 300-item Full target only if clean | 8.1–8.3 |
| **Theory** | 1–11 | Model + R2/R4/R6; proof check weeks 9–11; measure \(\rho\) in week 4 | 8.3–8.6 |
| **Core run** | 5–19 | 4-arm causal study; GPQA-Main + MMLU-Pro + HLE; 400/400/200; 2 seeds; verify boundary | 7.6–8.0 |
| **Full run** | 12–22 | 6-arm target pending WP-18; 32-row gold-evidence default / 36-row gold-answer alternate; 300-item target | 8.0–8.3 |
| **Human eval** | 15–22 | 150–200 binary judgments; 3 raters | 8.2–8.4 |
| **9+ layer** | 12–22 | Value-of-information method; full theory validation; benchmark release | 8.6–9.0 |
| **Writing** | 20–30 | Paper A + thesis; Paper B if time | 8.6–9.0 |
| **Defence** | 30–32 | Reproducibility, mock defence, final defence | — |

**Critical path:** benchmark annotation (W3–11) → main GPU runs (W12–19) → human eval (W15–22) → writing (W20–30) → submission (W30) → defence (W32).

**Agent-accelerated compression:** P0 drops from 6 weeks to 4; benchmark drafting drops from 10 weeks to 8; theory drafting drops from 14 weeks to 11. The GPU-bound main run and the human annotation do not compress. Net project speedup is ~1.8–2.5x, not 5x.

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

## 9A. Red-team verdict: Core-run staged is the recommended path (8 Nov 2026 estimates)

> **Historical judgment.** The probabilities and scores in this section are the 8 Nov 2026 estimates, not current results or acceptance probabilities. The scope and budget below are updated to the 9 Nov 2026 release facts.

| Path | Time | P(finish) | P(9+) | Score if finishes | Verdict |
|---|---:|---:|---:|---:|---|
| A. Theorem | 5–8 wk | 72% | 9% | 7.8 | Viable section; trap as headline |
| B. Conformal | 4–6 wk | 88% | 5% | 7.4 | Viable secondary; trap as headline |
| C. Causal | 14–18 wk | 85% | 11% | 8.2 | Viable core |
| D. 180 EG-SSS | 5–7 wk | 72% | 9% | 8.0 | Viable option |
| D. 300 EG-SSS | 9–13 wk | 62% | 10% | 7.9 | Borderline |
| E. 1,000 + leaderboard | 22–30 wk | 32% | 7% | 7.3 | **Trap** |
| F. New mechanism | 9–14 wk | 65% | 8% | 7.6 | Viable ablation; trap as headline |
| G. Full 9+ stack | 24–30 wk | 42% | 8% | 8.55 | **Strategically dominated** |
| **Core-run staged** | **17–22 wk** | **82%** | **11–12%** | **8.4** | **Recommended** |

### Core-run scope (v1.0, executable)

- **4 conditions:** B3, B4-matched, B8-no-trust, B8. B8-placebo/B8-oracle are the Full target pending **WP-18**.
- **3 datasets:** `gpqa_main` 400, `mmlu_pro` 400, `hle` 200 = 1,000 questions per cell.
- **24 runs:** 4 conditions × 3 datasets × 2 seeds; 8,000 debates.
- **GPU:** ~1,067 GPU-h planned; **1,280 GPU-h cap**. Pilot ~112. Core and Full run on one **80 GB A100 PCIe** with the **4-bit 24–27B final families**. The **96 GB FP8 stack** is only the N1 hardware smoke plus the GPQA precision replication (60–100 GPU-h); the pinned **73.68 GB** weights are offline-checked only and the hardware smoke has not run.
- **Annotation:** 24-item calibration → 180-item v1.2 freeze; 300 Full target; 600 stretch only with dedicated annotators.
- **Endpoints:** final accuracy and CMR primary; trust AUROC/Brier, ARR, coverage secondary.
- **Analysis:** paired by question; cluster bootstrap over questions; mixed-effects with dataset fixed effect.
- **Target:** historical estimate 8.3–8.6. Fallback: 8.0–8.3. Negative/boundary: 7.5–8.0.

**Budget (Vast.ai spot, 9 Nov 2026 snapshot):** main matrix on one **80 GB A100 PCIe** at **$0.136/GPU-h** (4-bit 24–27B final families); **pilot ~112 GPU-h / $15–20; Core 1,280 cap / $175–210; Full default 32-row gold-evidence 1,280 GPU-h / $210; Full alternate 36-row gold-answer 1,440 GPU-h / $235; storage/bandwidth $40–80; total $500–600; hard stop $600.** The **96 GB FP8 stack** at **$0.336/GPU-h** is only the N1 smoke plus the GPQA precision replication (60–100 GPU-h, **$25–40**). Fallback if the A100 spot is unavailable: 96 GB main runs = **$1,050–1,150**, requires re-approval; not the default. Law-testing is outside this envelope. See `08_COMPUTE_COST.md`.

**Venue:** paper in **August–December 2027**, after the thesis defence. Target TACL rolling, EMNLP 2028, or a Q1 journal. **No paper deadline before the defence.**

### When the full 9+ stack becomes worth attempting

Only if **all four** are true before attempting the 9+ layer:

1. An independent probabilist has verified a corrected theorem, not an agent.
2. Two dedicated annotators have 300 items at κ ≥0.70.
3. The causal study shows a positive or harmful effect with a CI excluding 5 pp.
4. GPU is dedicated 24/7 and writing is already ahead.

If any one fails, G is a trap. The 5x leverage makes G **attemptable**, not **advisable**.

### New failure modes from 5x

- **False completion:** agents produce a polished paper, passing tests, and 300 draft items before humans verify 100. P(finish) rises, P(9+) falls to 3–5%.
- **Agent-certified science:** no agent-certified proof, test, or gold label. Every scientific claim needs a human owner and a command/output trail.
- **Benchmark debt:** 180 items is the v1.2 floor; 300 is the Full target only with two dedicated annotators; 500+ is a trap.
- **Theorem headline:** the theorem is the highest-risk, lowest-expected-value use of the leverage.
- **VoI/CTC headline:** preempted or incremental; keep as a section.

---

## 10. Realistic score projection (8 Nov 2026 estimates)

| Outcome | Probability (with agents) | Core | Weighted |
|---|---:|---:|---:|
| P0 only | 99% | 6.25 | 6.21 |
| Core run (4-arm + 180-item benchmark) | **82%** | 8.3–8.6 | 8.2–8.4 |
| Core run + theory section (R2/R4/R6) | 50–60% | 8.5–8.8 | 8.4–8.7 |
| Full 9+ stack (theory + SEA-Cert + full benchmark) | **11–12%** | 9.0–9.2 | 8.9–9.1 |
| 9.5+ | <3% | — | — |

**Summary:** \(P(8.3+) \approx 50\text{–}55\%\); \(P(8+) \approx 75\%\); \(P(9+) \approx 11\text{–}12\%\) unconditional, **30–40% conditional on measured \(\rho > 0.4\)** and a strong behavioral pilot. If \(\rho < 0.3\), R6's punchline collapses and the thesis caps at **8.6**.

These are judgments, not guarantees. The expected-value-maximizing plan is the risk-managed sequence: **secure 8.3–8.6 first, then attempt the 9+ layer.**

---

## 11. Current calendar (9 November 2026)

**Source of truth: `roadmap.md`.** Do not use the old week-numbered plan.

| Window | Work | Gate |
|---|---|---|
| Nov 2026 | **N1** final-stack 96 GB smoke (not run); **N2** WP-18 starts; **N3** 24-item calibration; **N4** verifier audit starts | N1 PASS |
| Nov–Dec 2026 | WP-18 B8-placebo/B8-oracle + Full config; verifier audit (150–200 pairs) | N2/N4 |
| Dec 2026 | **N5 pilot** | **G2:** baseline CCR ≥0.30; trust AUROC ≥0.65; ≥65% correct-direction changes; injection κ ≥0.75 |
| Jan 2027 | **Core run**; 180-item benchmark v1.2 freeze | **G3** |
| Feb 2027 | **Full run**; 300-item target if the 180 set is clean | **G4/G5** |
| Mar 2027 | Human evaluation / SDT | κ ≥0.60 |
| Apr 2027 | Results freeze; law-testing only if the effect is real | — |
| May–Jun 2027 | Thesis chapters; internal review; **submission June 2027** | — |
| Jun–Jul 2027 | **Defence** | — |
| Aug–Dec 2027 | Paper: TACL rolling / EMNLP 2028 / Q1 journal | After defence |

**Decision rule:** the 9+ layer is only attempted if the 8.0 core is already safe. Do not trade the thesis for a theorem.

### Historical appendix — first 8 weeks (8 November 2026 plan)

> **Historical only.** This schedule was written before P0 was released. It is retained to show the original sequencing, not as current instructions.

1. **Week 1:** P0-0 (options), P0-1 (parser), P0-2 (accuracy), P0-3 (injection/trust). Agents implement; a human reviews every test diff.
2. **Week 2:** P0-4 (metrics), P0-5 (trust math), P0-6 (verifier audit); run the 206-test suite + new tests.
3. **Week 3:** P0-7/8/9 (baselines, datasets, injection), P0-10/11 (matrix, manifest), P0-12 (docs); start the 100-question pilot.
4. **Weeks 4–5:** pilot gates; fix failures; start EG-SSS item drafting with agents and human adjudication.
5. **Weeks 6–7:** 6-arm causal study on GPQA-Main + MMLU-Pro STEM; theory draft (Theorem 1 + finite-sample bound).
6. **Week 8:** decision gate — if the pilot passes and the causal effect is in the right direction, add Theorem 2–3 + the value-of-information method; if not, pivot to the measurement/negative paper and protect the 8.0 thesis.

---

## 12. Thesis 9+ vs paper 9+

These are different bars.

| Artifact | What it contains | Realistic score | Why |
|---|---|---:|---|
| **Thesis** | Full system + theory + benchmark + causal study + human eval + reproducibility | **8.8–9.2** | The thesis can be strong as a portfolio even if no single paper is 9+; examiners value breadth, rigor, and a complete artifact |
| **Paper A** | Theory + causal study + phase boundary | **8.3–8.8** | A clean law + surprising result; 9+ only if the conformity trap or claim-level illusion lands |
| **Paper B** | Benchmark + system + human eval | **7.8–8.4** | A solid Q1 journal paper; benchmark adoption is the uncertainty |

**This is the key strategic insight:** a 9+ **thesis** is more achievable than a 9+ **paper**. Build the full thesis package; let the paper be the sharpest slice. If the killer result lands, the paper is 9+ too. If not, the thesis is still 9-ish and the paper is 8.5.

**With agents, the thesis 9+ probability is 11–12% unconditional, and 30–40% conditional on measured \(\rho > 0.4\) and a real behavioral effect in the pilot. The floor of 8+ is ~75%.** The agents buy you the ability to find out in time, not the ability to make the law true.

---

## 13. Bottom line

- **9+ is not the rational target; 8.5 is.** The 9+ layer is a call option, not the plan.
- **The one 9+ path that can work:** a derived threshold law + claim-dependence/adversarial extensions + a 180-item v1.2 benchmark (300 Full target) + the 4-arm Core / 6-arm Full causal study + a value-of-information method, all subject to an independent proof check.
- **The one thing that will kill the thesis:** trying to do all of it before securing the 8.3 core.
- **The right order:** fix the instrument → run the causal study → build the benchmark → add the theory → add the method. If the theory or benchmark slips, you still have a strong thesis.
- **The 9+ thesis is a portfolio; the 9+ paper is a hit.** Build the portfolio first.
