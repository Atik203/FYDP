# 03 — Experiment Plan (Reframed)

**Status:** proposed; replaces the 15×5×3×1,000 matrix. **Compute cash is excluded from the score, but wall-clock is not.** The plan below fits 7–8 months.

---

## 1. The reframed claim

**Title:** *Evidence as Influence: The Verification Ceiling of Trust-Calibrated Multi-Agent Debate*

**Headline:** External evidence reduces sycophantic collapse only when claim verification is reliable and coverage is high; below a critical verification accuracy, trust reweighting amplifies noise and can increase collapse. We derive the ceiling, measure it, and release a validated pressure protocol.

**What this buys:**
- A negative or conditional result is still publishable.
- The mechanism is an instrument, not the hero.
- The project's weakest fact (lexical verification cannot check math) becomes the central finding.
- It fits ACL/EMNLP analysis/evaluation and NeurIPS D&B benchmark tracks.

**Do not claim:** "our mechanism beats 10 baselines" as the headline. That is a 2024–2025 paper in a 2026 field.

---

## 2. Endpoint hierarchy

### Primary (confirmatory; pre-register)

1. **CMR — Correct-Minority Retention.** On pressure-eligible items: at the frozen round-0 state, the majority is wrong, ≥1 agent is correct, all answers are checkable. CMR = fraction where ≥1 initially-correct agent still holds gold at round K. Binary, question-level, paired.
2. **Final-answer accuracy.** The actual aggregated answer (weighted for B8, majority for controls) is correct. Binary, question-level, paired.

Pre-register both; Holm-adjust across the two and across 3 datasets. If only one primary is allowed, choose **final accuracy**; report CMR as the mechanism endpoint.

### Secondary

- **CCR-0:** no-retrieval injection; switch to the fabricated consensus / exposed correct agents.
- **CCR-E:** retrieval arm; switch away from gold when the agent's evidence verdict is not decisive-negative.
- **MPR-weighted:** final aggregated answer correct on divergent items; report `gold_held` separately.
- **ARR — Appropriate Revision Rate:** initially wrong agents who switch to gold when the majority is correct. A good mechanism is not stubborn.
- **Any-wrong-switch rate:** error adoption, separate from consensus switching.
- **Accuracy non-inferiority** on GPQA/MMLU-Pro: margin 3–5 pp (2 pp is not resolvable at n≈450–500).

### Mechanism / process (not confirmatory)

- **Trust AUROC:** probability that a correct agent is ranked above an incorrect agent, out-of-sample.
- **Trust Brier / vote calibration:** compare to a constant-1/3 predictor; reliability diagram.
- **Verifier balanced accuracy, precision/recall, coverage:** human-labeled set.
- **Retrieval coverage:** fraction of claims with a relevant passage.
- **Trust inversion rate:** fraction of questions where the highest-trust agent is wrong. If >30%, the mechanism is dangerous, not calibrated.
- **Claim-count vs trust correlation:** verbosity control.
- **Reasoning alignment:** CARA-style metric or human audit (response to Consistency Illusion).

**Delete ECR > 0.80 as a target.** Replace with trust AUROC ≥0.65 and Brier better than constant-1/3, out-of-sample.

---

## 3. Causal design

### 3.1 The three factors

| Factor | Levels | Why |
|---|---|---|
| **Pressure** | none / peer / authority | Separates social conformity from authority deference |
| **Evidence** | none / retrieved / oracle | Separates no evidence, noisy evidence, gold evidence |
| **Trust** | majority / trust / placebo | Separates aggregation from evidence-calibrated aggregation |

A full 3×3×3 is too large. Use a **core 6-arm factorial** plus targeted additions.

### 3.2 Core arms (run on all primary datasets)

| Arm | Evidence | Aggregation | Purpose |
|---|---|---|---|
| **B3** | none | majority | Vanilla MAD baseline |
| **B4-matched** | retrieved, same partition/prompt as B8 | majority | Evidence-information control |
| **B8-no-trust** | retrieved, same as B8 | majority (`use_trust=False`) | **Primary control**: same everything except trust |
| **B8** | retrieved | trust-weighted | Treatment |
| **B8-placebo** | retrieved, verdicts shuffled within debate | trust-weighted | Tests whether evidence calibration matters vs any reweighting |
| **B8-oracle** | gold evidence (SciFact/PubMedQA subset) | trust-weighted | Upper bound; tests whether the verifier is the bottleneck |

### 3.3 Targeted additions (subset)

| Arm | Purpose | Response to |
|---|---|---|
| **B8-trust-hidden** | Trust computed but not shown to agents; aggregation weighted | Is the gain behavioral or aggregation-only? |
| **B8-doc-level** | Document-level trust instead of claim-level | Is claim-level attribution causally active? |
| **B8-label-shuffled** | Claim labels shuffled across claims | Direct test of Verify, Then Argue |
| **B8-evidence-supports-majority** | Evidence supports the wrong majority | Authority Bias: does trust amplify deference? |
| **B8-neutral-pressure** | Length-matched neutral text | Injection construct validity |
| **B8-peer-pressure** | Two majority agents argue; no meta-instruction | Social conformity vs authority |
| **B8-natural-divergence** | No injection; items where models naturally disagree | External validity |
| **B8-same-model** | 3× Qwen panel | Is heterogeneity necessary? |
| **B8-K1** | One-shot evidence-weighted aggregation | Is debate necessary? |

### 3.4 The two contrasts that decide the paper

1. **B8 vs B8-no-trust:** the causal effect of trust weighting, with evidence, prompts, partition, and compute matched.
2. **B8 vs B8-placebo:** whether the effect is **evidence-calibrated** trust or just any reweighting.

If B8 ≈ B8-placebo, the "evidence-grounded" claim fails. If B8 ≈ B8-no-trust, the mechanism fails. Both are publishable as boundary results; neither is a top-tier mechanism paper.

---

## 4. Datasets and evidence sources

### 4.1 Primary testbed (evidence-grounded)

> **Dataset audit finding (8 Nov 2026):** BrokenMath's official benchmark is **451/451 proof** with empty `gold_answer`; BrokenArXiv is **87/87 proof** with empty `answer`. Answer-type retention is **0%**, not 60–70%. HLE is designed to be retrieval-resistant. **Only GPQA and MMLU-Pro STEM are usable positive-evidence datasets.** Do not use BrokenMath/BrokenArXiv for claim-level evidence grounding or CCR.

| Dataset | Role | N to run | Usable n (est.) | Source routing | Notes |
|---|---|---:|---:|---|---|
| **GPQA-Main** | Primary accuracy/CCR/MPR | 448 | 270–360 | Claim-domain: bio/chem → PubMed+S2; physics/chem → arXiv+S2; all get S2 fallback | Shuffle options; no correct-first leak; GPQA-Diamond (198) is pilot only |
| **MMLU-Pro STEM** | Primary scale/robustness | 1,000 stratified from 6,696 | 2,700–4,000 available; run 1,000 | Same claim-domain routing; math/CS → arXiv+S2; bio/health → PubMed+S2 | Exclude non-STEM from evidence; keep 200 non-STEM as abstention control |
| **EG-SSS** | Mechanism test with gold evidence | 180 | 180 | Gold evidence by domain | 60 biomed, 60 phys/chem, 60 math/CS; 5 conditions; release CC BY 4.0 |
| **HLE** | Ceiling/abstention control | 300–500 (MCQ + numeric) | 550–830 divergent | All sources; expect high `unverifiable` | Google-proof; use to measure false support/contradiction and abstention, not positive evidence |
| **BrokenMath** | Appendix premise-rejection | 451 proof | 0 for CCR | **No retrieval trust** | LLM judge validated on 100 human labels; report acceptance/rejection; do not mix with CCR |
| **BrokenArXiv** | Appendix qualitative | 87 proof | 0 for CCR | **No retrieval trust** | Frozen snapshot; report separately |
| **SciFact** | Verdict validation | 300 test | — | PubMed/S2 | Internal only (CC BY-NC 2.0) |
| **VitaminC** | 3-way verdict validation | 1,000 stratified | — | Wikipedia | Internal (CC BY-SA 3.0) |
| **PubMedQA** | Biomedical answer calibration | 500 | — | PubMed | Internal (MIT) |

### 4.1b Benchmark scale decision (EG-SSS)

**180 items is a C+ supporting artifact, not a 9+ benchmark.** The benchmark audit’s scale ladder:

| Scale | What it is | Annotation | Score | Decision |
|---:|---|---:|---:|---|
| **180** | C+ supporting artifact | ~410 h | 8.0–8.3 | **Default** |
| 300 | Stronger benchmark | ~684 h | 8.5 | Stretch |
| 600 | 9+ benchmark floor | ~1,368 h | 9.0 | Only with 2–3 dedicated annotators |
| **800** | **9+ benchmark + SDT model + private split** | **~1,824 h** | **9.0–9.3** | Only with 2–3 dedicated annotators + 2 external adopters |
| 1,000 | 9+ on paper, execution risk | ~2,280 h | 9.0–9.3, ~50% risk | **No** |

**What makes 800 a 9+ benchmark, not a dataset dump:**
- **4 domains × 200 items:** physics, chemistry/materials, biology/medicine, CS/ML.
- **120 dev / 480 public test / 200 private.** Private split preserves leaderboard integrity.
- **14 controls:** no pressure, neutral, peer, authority, emotional, evidence placebo, evidence-supports-minority, evidence-supports-majority, ambiguous evidence, evidence shuffle, label/position shuffle, majority-correct items, verifier quality sweep, no-verifier ablation.
- **SDT measurement model:** \(z = w_e e + w_s s_{\text{maj}} + w_v v + b + \epsilon\); sycophancy \(=w_s/w_e\), verifier trust \(=w_v\), abstention criterion \(\lambda\), competence \(d'\). This is the intellectual contribution that lifts a dataset to an instrument.
- **Leaderboard:** 6-axis profile + trust-plane plot, three tracks, code submission, mandatory ablations, private split.

**Rule:** if the team cannot commit 2–3 dedicated annotators for five months, **do not build 800**. Build 180–300 and do the theory/causal paper. A 800-item set with 12% bad gold is worse than a 300-item set with 3% bad gold.

### 4.2 Source routing rules (replace agent→source)

- Classify each **claim** into `biomed/clinical`, `physics/chemistry`, `math/CS`, or `other`.
- Query:
  - biomed/clinical → PubMed + S2;
  - physics/chemistry → arXiv + S2;
  - math/CS → arXiv + S2;
  - other → S2/OpenAlex; if no evidence, abstain.
- Deduplicate by DOI/arXiv ID/title; show source names to the agent.
- Give **all agents the same routed evidence for their own claims**; source diversity comes from the claim mix, not agent identity.
- If you keep partitioning as an ablation, rotate sources across items and equalize evidence volume.
- **Do not use Agent 1 = PubMed, Agent 2 = arXiv, Agent 3 = S2 in the main experiment.** It confounds source, domain, and model family; on MMLU-Pro STEM it can create a ~21 pp trust bias.
- Report retrieval coverage per domain and per agent; if source remains significant after controlling for correctness, the trust score is source-driven.

### 4.3 Eligibility and retention

| Dataset | N | Answer-type eligible | Divergence (est.) | Usable for injection |
|---|---:|---:|---:|---:|
| GPQA-Diamond | 198 | 198 | 60–80% | 120–160 (pilot; underpowered for 10 pp) |
| GPQA-Main | 448 | 448 | 60–80% | 270–360 (primary) |
| MMLU-Pro STEM | 6,696 | 6,696 | 40–60% | 2,700–4,000 (primary) |
| HLE | 2,500 | 790–980 | 70–85% | 550–830 (control) |
| BrokenMath benchmark | 451 | **0** | n/a | **0** |
| BrokenArXiv | 87 | **0** | n/a | **0** |

### 4.4 Licensing

- BrokenMath: CC BY-NC-SA 4.0 (non-commercial). Do not redistribute; link and cite.
- BrokenArXiv: CC BY-SA 4.0; pin the snapshot.
- HLE: MIT tag, but gated terms; do not reproduce sample questions.
- GPQA: CC BY 4.0 + gated no-reveal terms; do not reproduce question text.
- MMLU-Pro: MIT; cite.
- SciFact: CC BY-NC 2.0 (internal validation only).
- VitaminC: CC BY-SA 3.0 (derivatives share-alike).
- PubMedQA: MIT.

**Release strategy:** code MIT; original EG-SSS items CC BY 4.0; for GPQA/HLE/BrokenMath/BrokenArXiv, release IDs/hashes and evaluation scripts only, not item text.

---

## 5. Power and sample size

Two-proportion test, α=0.05 two-sided, power=0.80. Baseline CCR \(b_0\); relative reduction \(r\).

### Required n per condition (unpaired conservative)

| \(b_0\) | 20% rel. | 25% rel. | 30% rel. |
|---:|---:|---:|---:|
| 0.30 | 856 | 537 | 365 |
| 0.35 | 688 | 432 | 294 |
| 0.40 | 562 | 354 | 241 |
| 0.45 | 464 | 293 | 200 |

### Paired McNemar (same questions; discordance D=0.20)

| \(b_0\) | 20% rel. | 25% rel. | 30% rel. |
|---:|---:|---:|---:|
| 0.30 | 434 | 277 | 192 |
| 0.35 | 318 | 203 | 141 |
| 0.40 | 243 | 155 | 107 |
| 0.45 | 192 | 122 | 84 |

### MDE at realistic n (paired)

| n / condition | \(b_0\)=0.30 | \(b_0\)=0.40 | \(b_0\)=0.45 |
|---:|---:|---:|---:|
| 250 | ~26% rel. | ~21% rel. | ~18% rel. |
| 350 | ~22% rel. | ~18% rel. | ~15% rel. |
| 500 | ~18% rel. | ~15% rel. | ~12% rel. |

**Decision:** target **350–500 eligible, paired** per condition. GPQA-Diamond yields only 120–160; use **GPQA-Main (270–360)** and **MMLU-Pro STEM (2,700–4,000)**. BrokenMath/BrokenArXiv yield 0 for CCR. Do not claim a 20–30% effect from n=120.

**Seeds:** 2 seeds × more questions beats 3 seeds × fewer. Use 2 seeds on the full set; add a third on a 100-question subset for sign consistency. The unit of analysis is the question; seeds are technical replicates.

---

## 6. Matrix size and cost

Assumptions: 6.2 min/debate at Gate 0 (no retrieval); 8 min with retrieval/trust.

| Plan | Arms | Datasets | Seeds | Questions | Debates | GPU-h @8 min | One-GPU days |
|---|---:|---:|---:|---:|---:|---:|---:|
| Current blueprint | 15 | 5 | 3 | 1,000 | 225,000 | 30,000 | 1,250 |
| Current at 200 Q | 15 | 5 | 3 | 200 | 45,000 | 6,000 | 250 |
| **Core 6-arm** | 6 | GPQA-Main + MMLU-Pro STEM + EG-SSS | 2 | 350 | 9,300 | 1,240 | 52 |
| **Core 6-arm (lean)** | 6 | same | 2 | 250 | 6,900 | 920 | 38 |
| Core + additions | 10 | same | 1–2 | 150–250 | ~10,900 | ~1,450 | 60 |

### Vast.ai spot cost (8 Nov 2026 CLI)

| Item | Rate | Source |
|---|---:|---|
| RTX A6000 48 GB spot | **$0.263/hr** median at **80 GiB**, reliability ≥0.98 | `vastai search offers ... -i --storage 80` |
| RTX PRO 6000 Max-Q 96 GB spot | **$0.74–1.02/hr** median | same |
| RTX PRO 6000 S 96 GB spot | **$1.432/hr** median | same |
| RTX PRO 6000 WS 96 GB spot | $1.245/hr median | same |
| Bandwidth | $0.004–0.011/GB typical; $0.026–0.033/GB high | `inet_up_cost` / `inet_down_cost` |
| Storage | **$0.20/GB/month** median on a Vast volume; instance disk $0.20–0.40 | `storage_cost` |

| Scenario | GPU-h | GPU $ | Bandwidth + storage | Overhead 20% | **Total** |
|---|---:|---:|---:|---:|---:|
| P0 smoke | 15 | $4 | $1–3 | $1 | **~$6** |
| Pilot 100–150 Q | 225 | $59 | $1–3 | $12 | **~$72** |
| **C+ core** (1,100 Dev incl. pilot/sweep + 60 Final) | 1,160 | $350 | $50–80 | $70 | **~$470** |
| **TACL main** (1,920 main + 480–680 pilot/sweep + 60–100 Final; 8 min) | 2,460–2,700 | $690–790 | $50–120 | $140–180 | **~$880–1,090** |
| Full law-testing — 6 min (optimistic) | 2,860 + 100 | $854 | $60–120 | $170 | **~$1,100** |
| Full law-testing — 8 min (realistic) | 3,813 + 100 | $1,105 | $60–120 | $220 | **~$1,390** |
| Full / high (8 min, high rate, 6-month storage) | 3,813 + 100 | $1,457 | $150–250 | $320 | **~$1,930** |

**Budget:** **C+ ~$420–580 all-in; TACL main ~$900–1,200 all-in; full law-testing ~$1,100 (6 min) to ~$1,400–1,900 (8 min); high ~$2,450.** GPU hours dominate; bandwidth/storage add 10–25%. The 2,860 GPU-h figure is a **6-min** number; at 8 min it is **3,813**. Persist the ~22 GB Dev cache and ~100–160 GB Final cache on a volume; avoid re-downloading on a $0.026–0.033/GB host. The 15×5×3×1,000 matrix is ~30,000 GPU-h ≈ $8,000–11,000+, not runnable.

**TACL feasibility:** 14,400 debates × 8 min = 1,920 GPU-h main; 4×24 GB GPUs = 480 GPU-h each = 20 days; 4 weeks with buffer. Annotation 500 items × 5 claims × 2 annotators = 5,000 labels ≈ 167 h; 6 people × 7 h/week × 4 weeks = 168 h. The theorem check is the real bottleneck.

Full source table and formulas: [`08_COMPUTE_COST.md`](08_COMPUTE_COST.md).

---

## 7. Analysis plan

1. **Freeze the round-0 prefix.** Run one screening pass per question; share the round-0 state across conditions. This makes the comparison paired and removes sampling noise.
2. **Primary:** paired McNemar or paired risk difference per dataset; mixed-effects logistic regression with random intercept for question, fixed effects condition + dataset + seed.
3. **Cluster bootstrap** over questions, not seeds. Report 95% CIs.
4. **Multiplicity:** Holm across the two primary endpoints and 3 datasets; FDR for exploratory.
5. **Effect sizes:** risk difference (pp), odds ratio, Cohen's d for continuous outcomes.
6. **Mediation:** verifier accuracy/coverage → trust AUROC → CMR; report the proportion mediated.
7. **Heterogeneity:** condition × verifier-accuracy/coverage interaction; condition × model panel; condition × dataset.
8. **Failure analysis:** 100 errors, 2 annotators; taxonomy validated against human labels.
9. **Report raw counts** (n eligible, n exposed, n collapse) alongside rates.
10. **No subgroup hunting** after the primary result.

---

## 8. Human evaluation

- **n:** 150–200 items, 2 blinded annotators.
- **Tasks:**
  - Binary: was the switch away from gold "unwarranted" (no decisive counter-evidence)?
  - Binary: does the cited passage support the claim? (citation faithfulness)
  - Ordinal: reasoning alignment (CARA-style).
- **Agreement:** Cohen's κ for binary; ICC(2,k) for ordinal. Target κ ≥0.6, ICC ≥0.7.
- **Power:** n=60 is descriptive only; 150–200 is the minimum for a system comparison.
- **Do not** use a 7-point Likert as the primary human endpoint; use binary decisions.

---

## 9. Gates and kill criteria

| Gate | Criterion | If fail |
|---|---|---|
| **G0 — Wiring** | B8+injection runs; weighted final answer scored; accuracy computed; CCR defined | Do not run the matrix |
| **G1 — Verifier** | 150–200 human pairs; balanced accuracy ≥0.75 | 0.60–0.75: swap to NLI/LLM judge and re-audit. <0.60 after swap: stop mechanism work; publish harness/negative result |
| **G2 — Manipulation** | Baseline CCR ≥0.30 on ≥30 exposed items; trust AUROC ≥0.65; ≥65% correct-direction change on 40 pilot items | Pivot to descriptive/diagnostic paper |
| **G3 — Powered primary** | n ≥350–400 eligible/condition; B8 vs B8-no-trust relative reduction ≥20%; 95% CI excludes 0 and a 5 pp SESOI; accuracy non-inferior 3–5 pp | 10–20% with CI excluding 0: Findings/TMLR. <10% or CI includes 0: negative/boundary paper |
| **G4 — Mechanism** | B8-trust-hidden and B8-placebo do **not** match B8; mediation significant | If placebo matches B8, the causal claim fails; reframe as disclosure/extra deliberation |
| **G5 — External** | Natural-divergence or non-math scientific set shows the same sign | If not, drop "real scientific QA"; retitle as adversarial stress test |

**Kill criterion:** if G1 and G2 both fail, stop the trust-mechanism work. Write the negative/boundary paper from the harness and pilot. That is still publishable; continuing is not.

---

## 10. Pre-registration checklist

- [ ] Dataset snapshots and exact item IDs.
- [ ] Screening seed and eligibility rule.
- [ ] Primary endpoint and comparator (**B8-no-trust**, not B3).
- [ ] Sample size and MDE from the Gate-1 baseline.
- [ ] Analysis model (paired McNemar / mixed-effects / cluster bootstrap).
- [ ] Multiplicity correction (Holm).
- [ ] Exclusion rules and reporting.
- [ ] α/β, floor/ceiling, max_claims, verifier/judge/prompt versions.
- [ ] Stopping rules and decision rule (positive/negative/inconclusive).
- [ ] No changes after seeing results.

---

## 11. Minimum result patterns

### Top-Q1 (ACL/EMNLP/NeurIPS main or strong TMLR)

- Pre-registered, ≥350–400 eligible/condition, paired.
- B8 vs **B8-no-trust** ≥20% relative CMR/accuracy gain; 95% CI excludes 0 and a 5 pp SESOI.
- Final accuracy improves on adversarial sets; non-inferior on GPQA/MMLU-Pro (3–5 pp).
- Replicates on the Final stack and a natural-divergence/non-math set.
- B8-trust-hidden and B8-placebo do **not** match B8.
- Mediation: verifier accuracy → trust AUROC → CMR.
- Verifier balanced accuracy ≥0.75; effect moderated by verifier accuracy.
- Compute-matched baselines do not erase the effect.
- Robustness: K, N, paraphrases, α/β held out, same-model panel.
- Human audit validates the collapse metric (κ ≥0.6).

### Findings/TMLR

- Well-powered adversarial result (≥350 eligible), B8 vs B8-no-trust ≥15–20% relative, CI excludes 0.
- Accuracy non-inferior.
- B8-no-trust and B8-trust-hidden isolation.
- Honest limitation: injection/math setting, lexical/heuristic verifier.
- No natural-setting or Final-scale replication, or no mediation.

### Workshop

- Harness + suggestive result: 150–200 eligible, one dataset, no isolation, clear limitations.

### Negative result

- Powered test shows no effect; boundary analysis (verifier accuracy, coverage, claim count, model identity) is publishable at workshop/Findings. Not top-Q1.

---

## 12. What not to run

- Do not run 15 conditions × 5 datasets × 3 seeds × 1,000 questions.
- Do not run B8 without injection and call it a CCR result.
- Do not compare B8 to B4 when B4 uses a different partition/prompt.
- Do not use ECR as a primary metric.
- Do not treat 3 seeds as independent samples.
- Do not add conditions after seeing the primary result.
- Do not submit the full 10-baseline matrix as the paper; put it in the thesis appendix.
