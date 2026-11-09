# 03 — Experiment Plan

> **Historical naming note (9 November 2026):** the retired stage labels were `C+` and `TACL full`; current names are Core run and Full run.

**Status:** design source of truth, refreshed 9 November 2026. **Pre-registration v1.0 and the v1.1 erratum are frozen.** The erratum records the released prompt hash `bc9c7b...`; `6cc9b0...` is pre-WP-13 and must not be described as current.

**Stage names:** use `docs/GLOSSARY.md` — **Core run** and **Full run**. **TACL is a venue only.** The Core matrix below is executable; the Full matrix is a target pending **WP-18**.

---

## 1. The claim and its status

**Title:** *The Boundaries of Evidence-Grounded Trust in Multi-Agent Scientific Debate, with a Controlled Benchmark for Sycophantic Consensus.*

**Headline hypothesis (derived, not proved):** external evidence reduces sycophantic collapse only when claim verification is reliable and coverage is high; below a critical verification accuracy, trust reweighting can amplify noise and increase collapse. The project derives a boundary, measures it, and releases a validated pressure protocol.

**What this buys:**
- A negative or conditional result is still publishable.
- The mechanism is an instrument, not the hero.
- The project's weakest fact (lexical verification cannot check math) becomes a boundary finding rather than a hidden flaw.
- It fits TACL rolling, EMNLP 2028, or a Q1 journal after the defence; ACL/EMNLP main is a stretch, not the target.

**What P0 established:** engineering readiness only — 13/13 gate checks, 514 tests, compiled manuscripts, offline final-stack fit. **No efficacy result exists.** Do not write the headline as a finding.

**Do not claim:** "our mechanism beats 10 baselines" as the headline. That is a 2024–2025 paper in a 2026 field.

---

## 2. Endpoint hierarchy

### Primary (confirmatory; pre-register)

1. **Final-answer accuracy.** The actual aggregated answer (weighted for B8, majority for controls) is correct. Binary, question-level, paired.
2. **CMR — Correct-Minority Retention.** On pressure-eligible items: at the frozen round-0 state, the majority is wrong, ≥1 agent is correct, and all answers are checkable. CMR = fraction where ≥1 initially-correct agent still holds gold at round K. Binary, question-level, paired.

Pre-register both; Holm-adjust across the two primaries and the 4-test confirmatory family; HLE is a control, not pooled. If only one primary is allowed, choose **final accuracy**; report CMR as the mechanism endpoint. The old ECR target is dead.

### Secondary

- **Trust AUROC:** probability that a correct agent is ranked above an incorrect agent, out-of-sample.
- **Trust Brier / vote calibration:** compare to a constant-1/3 predictor; reliability diagram.
- **CCR-0:** no-retrieval injection; switch to the fabricated consensus / exposed correct agents.
- **CCR-E:** retrieval arm; switch away from gold when the agent's evidence verdict is not decisive-negative.
- **MPR-weighted:** final aggregated answer correct on divergent items; report `gold_held` separately.
- **ARR — Appropriate Revision Rate:** initially wrong agents who switch to gold when the majority is correct. A good mechanism is not stubborn.
- **Any-wrong-switch rate:** error adoption, separate from consensus switching.
- **Accuracy non-inferiority** on GPQA/MMLU-Pro: **5 pp at n≈300–400**.

### Mechanism / process (not confirmatory)

- **Verifier balanced accuracy, precision/recall, coverage:** human-labeled set (N4).
- **Retrieval coverage:** fraction of claims with a relevant passage.
- **Trust inversion rate:** fraction of questions where the highest-trust agent is wrong. If >30%, the mechanism is dangerous, not calibrated.
- **Claim-count vs trust correlation:** verbosity control.
- **Reasoning alignment:** CARA-style metric or human audit (response to the Consistency Illusion).

**ECR is deprecated.** It is ECE on a simplex and is anti-correlated with correctness. Do not report it as calibration.

---

## 3. Causal design

### 3.1 The three factors

| Factor | Levels | Why |
|---|---|---|
| **Pressure** | none / peer / authority | Separates social conformity from authority deference |
| **Evidence** | none / retrieved / oracle | Separates no evidence, noisy evidence, gold evidence |
| **Trust** | majority / trust / placebo | Separates aggregation from evidence-calibrated aggregation |

A full 3×3×3 is too large. Use the **Core 4-arm design** plus the **Full 6-arm target** and targeted additions.

### 3.2 Core run — executable 4-arm table (v1.0)

| Arm | Evidence | Aggregation | Purpose |
|---|---|---|---|
| **B3** | none | majority | Vanilla MAD baseline |
| **B4-matched** | retrieved, same partition/prompt as B8 | majority | Evidence-information control |
| **B8-no-trust** | retrieved, same as B8 | majority (`use_trust=False`) | **Primary control:** same everything except trust |
| **B8** | retrieved | trust-weighted | Treatment |

**Core matrix:** 4 conditions × 3 datasets (`gpqa_main`, `mmlu_pro`, `hle`) × 2 seeds = **24 runs**. GPQA 400 + MMLU-Pro 400 + HLE 200 = 8,000 debates ≈ **1,067 GPU-h planned**; conservative gate cap **1,280 GPU-h**. EG-SSS is **not** in Core v1.0.

### 3.3 Full run — target pending WP-18

The Full target adds B8-placebo and B8-oracle:

| Arm | Evidence | Aggregation | Purpose |
|---|---|---|---|
| **B8-placebo** | retrieved, labels/verdicts **cross-agent round-pooled** | trust-weighted | Tests whether evidence calibration matters vs any reweighting |
| **B8-oracle** | gold evidence on EG-SSS (default) or gold-answer trust (alternate) | trust-weighted | Upper bound; tests whether the verifier is the bottleneck |

**Full count:** the default is **32 rows** with **gold-evidence oracle on EG-SSS** (1,280 GPU-h, **$210**); the alternate is **36 rows** with **gold-answer trust** at 300 items/dataset (1,440 GPU-h, **$235**). **B8-placebo is a cross-agent round-pool.** **WP-18 freezes the definition and the row count.** Do not assert either count as final before WP-18.

### 3.4 Targeted additions (subset; not Core v1.0)

| Arm | Purpose | Response to |
|---|---|---|
| **B8-trust-hidden** | Trust computed but not shown; aggregation weighted | Is the gain behavioral or aggregation-only? |
| **B8-doc-level** | Document-level trust instead of claim-level | Is claim-level attribution causally active? |
| **B8-label-shuffled** | Claim labels shuffled across claims | Direct test of Verify, Then Argue |
| **B8-evidence-supports-majority** | Evidence supports the wrong majority | Authority Bias: does trust amplify deference? |
| **B8-neutral-pressure** | Length-matched neutral text | Injection construct validity |
| **B8-peer-pressure** | Two majority agents argue; no meta-instruction | Social conformity vs authority |
| **B8-natural-divergence** | No injection; items where models naturally disagree | External validity |
| **B8-same-model** | 3× Qwen panel | Is heterogeneity necessary? |
| **B8-K1** | One-shot evidence-weighted aggregation | Is debate necessary? |

### 3.5 The contrasts that decide the paper

1. **B8 vs B8-no-trust:** the causal effect of trust weighting, with evidence, prompts, partition, and compute matched.
2. **B8 vs B8-placebo (Full):** whether the effect is **evidence-calibrated** trust or just any reweighting.

If B8 ≈ B8-placebo, the "evidence-grounded" claim fails. If B8 ≈ B8-no-trust, the mechanism fails. Both are publishable as boundary results; neither is a top-tier mechanism paper.

---

## 4. Datasets and evidence sources

### 4.1 Core v1.0 testbed

| Dataset | Role | N to run | Notes |
|---|---|---:|---|
| **GPQA-Main** | Primary accuracy/CMR | 400 | Shuffle options; no correct-first leak; GPQA-Diamond is pilot only |
| **MMLU-Pro STEM** | Primary scale/robustness | 400 | Stratified; claim-domain routing; exclude non-STEM from evidence |
| **HLE** | Ceiling/abstention control | 200 | Google-proof; expect high `unverifiable`; **not** a powered primary |
| **EG-SSS** | Benchmark artifact, **not in Core v1.0** | 180 at v1.2 freeze | Joins at benchmark freeze under v1.2; 300 is the Full target |

**Core totals:** 4 arms × (400 + 400 + 200) × 2 seeds = **8,000 debates**, ≈ **1,067 GPU-h** at 8 min/debate. The **1,280 GPU-h** cap is the conservative gate number (it assumes up to 400/cell across all three datasets).

### 4.2 Supporting and appendix datasets

| Dataset | Role | N | Notes |
|---|---|---:|---|
| **BrokenMath** | Appendix premise-rejection | 451 proof | **No retrieval trust; not for CCR** (0% answer-type retention) |
| **BrokenArXiv** | Appendix qualitative | 87 proof | **No retrieval trust; not for CCR** (0% answer-type retention) |
| **SciFact** | Verdict validation | 300 test | PubMed/S2; internal only (CC BY-NC 2.0) |
| **VitaminC** | 3-way verdict validation | 1,000 stratified | Wikipedia; internal (CC BY-SA 3.0) |
| **PubMedQA** | Biomedical answer calibration | 500 | PubMed; internal (MIT) |

> **Dataset audit finding (8 Nov 2026, still binding):** BrokenMath's official benchmark is **451/451 proof** with empty `gold_answer`; BrokenArXiv is **87/87 proof** with empty `answer`. Answer-type retention is **0%**, not 60–70%. They cannot be used for claim-level evidence grounding or CCR. HLE is designed to be retrieval-resistant; use it as an abstention/ceiling control.

### 4.3 Benchmark ladder (EG-SSS)

| Size | Role | Annotation | Decision |
|---:|---|---:|---|
| **24** | Calibration batch | ~1 week | Start here; if `H_attempt > 2.0` or defect >15%, cut to 120 immediately |
| **180** | v1.2 benchmark freeze; Core floor/supporting artifact | ~410 h | Freeze by Jan 2027; joins the Core matrix under v1.2 |
| **300** | Full-run target | ~684 h | Target by Feb 2027; only if the 180 set is clean |
| **600** | Stretch | ~1,368 h | Only with 2–3 dedicated annotators |
| **800** | No-go | ~1,824 h | Do not build |

**Item rules:** 3 domains (biomed, phys/chem, math/CS); 3–6 atomic claims per position; gold evidence and verdicts; five conditions (evidence available/absent/placebo/contradictory × pressure); original items CC BY 4.0; gated dataset text not redistributed.

**Rule:** if the team cannot commit 2–3 dedicated annotators for five months, **do not build 800**. A 300-item set with 3% bad gold beats an 800-item set with 12% bad gold.

### 4.4 Source routing rules (replace agent→source)

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

### 4.5 Eligibility and retention

| Dataset | N | Answer-type eligible | Divergence (est.) | Core use |
|---|---:|---:|---:|---|
| GPQA-Diamond | 198 | 198 | 60–80% | Pilot only; underpowered for 10 pp |
| GPQA-Main | 448 | 448 | 60–80% | 400 (primary) |
| MMLU-Pro STEM | 6,696 | 6,696 | 40–60% | 400 (primary) |
| HLE | 2,500 | 790–980 | 70–85% | 200 (control) |
| EG-SSS | 180 at v1.2 | 180 | constructed | v1.2 freeze; not Core v1.0 |
| BrokenMath benchmark | 451 | **0** | n/a | **0**; appendix only |
| BrokenArXiv | 87 | **0** | n/a | **0**; appendix only |

### 4.6 Licensing

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
| 400 | ~20% rel. | ~17% rel. | ~14% rel. |
| 500 | ~18% rel. | ~15% rel. | ~12% rel. |

**Decision:** target **350–500 eligible, paired** per condition. Core v1.0 runs 400 on GPQA-Main and MMLU-Pro; HLE runs 200 and is a **control**, not a powered primary. GPQA-Diamond yields only 120–160; do not use it for the primary. BrokenMath/BrokenArXiv yield 0 for CCR. Do not claim a 20–30% effect from n=120.

**Seeds:** 2 seeds × more questions beats 3 seeds × fewer. Use 2 seeds on the full set; add a third on a 100-question subset for sign consistency. The unit of analysis is the question; seeds are technical replicates.

---

## 6. Matrix size and cost

Assumptions: 6.2 min/debate at Gate 0 (no retrieval); 8 min with retrieval/trust.

| Plan | Arms | Datasets | Seeds | Items | Debates | GPU-h | Cash |
|---|---:|---:|---:|---:|---:|---:|---:|
| Old blueprint (do not run) | 15 | 5 | 3 | 1,000 | 225,000 | ~30,000 | $8,000+ |
| **Core v1.0** | 4 | GPQA 400 + MMLU-Pro 400 + HLE 200 | 2 | 1,000/cell | **8,000** | **~1,067 planned; 1,280 cap** | **$175–210** |
| **Full default** (B8-oracle = gold-evidence on EG-SSS) | 6 | 300/dataset; oracle on EG-SSS | 2 | 900/cell | **9,600** (32 rows) | **1,280** | **$210** |
| **Full alternate** (B8-oracle = gold-answer trust) | 6 | 300/dataset | 2 | 900/cell | **10,800** (36 rows) | **1,440** | **$235** |
| Pilot (N5) | 3–4 | pilot subset | 1–2 | 100–150 | — | ~112 | $15–20 |
| FP8 precision replication + N1 smoke | — | GPQA subset | 1 | 150–200 | — | 60–100 | $25–40 |
| Storage and bandwidth | — | — | — | — | — | — | $40–80 |
| **Total plan** | — | — | — | — | — | — | **$500–600** |

**Budget rules:** The main matrix runs on one **80 GB A100 PCIe** spot at **$0.136/GPU-h** with the **4-bit 24–27B final families**. Core and Full use the same stack, so cells are reusable only where model revisions, prompts, and configs match. The **96 GB FP8 stack** at **$0.336/GPU-h** is only the N1 smoke plus the GPQA precision replication (B3/B8-no-trust/B8, 150–200 questions, 1 seed). The Full default is 32 rows (gold-evidence oracle on EG-SSS); 36 rows is the gold-answer alternate. **Hard stop: $600.** If the 80 GB A100 spot is unavailable and the main runs use 96 GB at $0.336/h, the plan is **$1,050–1,150** and requires re-approval; that fallback is not the default. Law-testing is outside this envelope. The exact Full caps are **not frozen** until WP-18.

Full price table and formulas: [`08_COMPUTE_COST.md`](08_COMPUTE_COST.md).

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

- **n:** 150–200 paired items, 3 raters; arm-blind, hypothesis-blind, random IDs.
- **Tasks:**
  - Binary: was the switch away from gold "unwarranted" (no decisive counter-evidence)?
  - Binary: does the cited passage support the claim? (citation faithfulness; 300 pairs)
  - Ordinal: reasoning alignment (CARA-style).
  - Expert ceiling: 60 items, 3 experts.
- **Taxonomy:** UWS (unwarranted switch), EWE (evidence-warranted error), ARR (warranted correction), lucky correction, stubborn error, ambiguous. Automatic CCR conflates these; the human study decomposes them.
- **Agreement:** Cohen's κ for binary; ICC(2,k) for ordinal. Target κ ≥0.60, ICC ≥0.70.
- **Analysis:** corrected automatic rate on the full 350–500 items per arm using the human sample to estimate sensitivity/specificity (Rogan–Gladen). The human subset is calibration/sensitivity, not the powered primary endpoint.
- **Do not** use a 7-point Likert as the primary human endpoint; use binary decisions.
- **Schedule:** March 2027; 3-axis SDT for the paper, 6-axis for the thesis.

---

## 9. Gates, dates, and kill criteria

| Gate / phase | When | Criterion | If fail |
|---|---|---|---|
| **G0 — Wiring** | Done 2026-09-16 | 10/10 vanilla MAD debates; 90/90 positions | — |
| **P0 — Engineering** | Done 2026-11-09 | 13/13 checks; 514 tests; 0 undefined refs; 600 DPI figures | — |
| **N1 — Final-stack smoke** | Nov 2026 | `check_stack.py --phase final`; `preflight.py --phase final --offline`; three `server OK`; `smoke_test.py --phase final` PASS | Do not start Full; fix `gpu_memory_utilization` or quantization and re-run |
| **N2 — WP-18** | Nov–Dec 2026 | Mock B8-placebo/B8-oracle validate; placebo ≠ B8; oracle ≥ B8; dry-run shows 24 Core rows; **Full count (32 default or 36 alternate) frozen** | Do not start Full |
| **N3 — Benchmark calibration** | Nov 2026–Feb 2027 | 24-item report; 180-item freeze with κ and defect rate; 300 only if clean | Cut to 120; do not build 600/800 |
| **N4 — Verifier audit** | Nov–Dec 2026 | 150–200 pairs, 2 annotators; balanced accuracy ≥0.75; κ ≥0.60 | 0.60–0.75: swap to NLI/LLM judge and re-audit. <0.60: measurement/negative paper; do not claim a high-q result |
| **G2 — Pilot** | Dec 2026 | Baseline CCR ≥0.30; trust AUROC ≥0.65; ≥65% correct-direction changes; injection κ ≥0.75; no schema-invalid records | Pivot to descriptive/diagnostic paper; do not run Core |
| **G3 — Core** | Jan 2027 | Primary accuracy/CMR measured with CIs; B8 > B8-no-trust direction; pre-registration frozen | Negative/boundary paper; no Full unless the design still warrants it |
| **G4/G5 — Full** | Feb 2027 | Placebo does not match B8; oracle separates; sign reversal at predicted q/ρ boundary; one external-validity check replicates the sign | Report the boundary honestly; no law-testing |
| **Results freeze** | Apr 2027 | CIs, negative results, pre-registered contrasts, manifest trace | — |
| **Thesis** | Jun 2027 | Internal review; defence-ready | — |
| **Paper** | Aug–Dec 2027 | TACL rolling / EMNLP 2028 / Q1 journal **after defence** | No paper deadline before the defence |

**Kill criterion:** if N4 and G2 both fail, stop the trust-mechanism work. Write the negative/boundary paper from the harness and pilot. That is still publishable; continuing is not.

**Do not reorder:** final-stack smoke → WP-18 → benchmark calibration/verifier audit → pilot → Core → Full. The pilot and Core are gates, not warm-ups.

---

## 10. Pre-registration checklist (v1.0 + v1.1 erratum frozen)

- [x] Dataset snapshots and exact item IDs.
- [x] Screening seed and eligibility rule.
- [x] Primary endpoints and comparator (**B8-no-trust**, not B3).
- [x] Sample size and MDE.
- [x] Analysis model (paired McNemar / mixed-effects / cluster bootstrap).
- [x] Multiplicity correction (Holm).
- [x] Exclusion rules and reporting.
- [x] α/β, floor/ceiling, max_claims, verifier/judge/prompt versions.
- [x] Stopping rules and decision rule (positive/negative/inconclusive).
- [x] v1.1 erratum records the released prompt hash `bc9c7b...` (not `6cc9b0...`); WP-18 arm definitions are assigned, with oracle semantics pending WP-18.
- [ ] WP-18 freezes the Full count.
- [ ] No changes after seeing results.

---

## 11. Minimum result patterns

### Top-Q1 (TACL/EMNLP 2028/Q1 journal)

ACL/EMNLP main remains a stretch, not the planning target.

- Pre-registered, ≥350–400 eligible/condition, paired.
- B8 vs **B8-no-trust** ≥20% relative CMR/accuracy gain; 95% CI excludes 0 and a 5 pp SESOI.
- Final accuracy improves on adversarial sets; non-inferior on GPQA/MMLU-Pro (**5 pp at n≈300–400**).
- Replicates on the final stack and a natural-divergence/non-math set.
- B8-trust-hidden and B8-placebo do **not** match B8.
- Mediation: verifier accuracy → trust AUROC → CMR.
- Verifier balanced accuracy ≥0.75; effect moderated by verifier accuracy.
- Compute-matched baselines do not erase the effect.
- Robustness: K, N, paraphrases, α/β held out, same-model panel.
- Human audit validates the collapse metric (κ ≥0.6).
- Benchmark: 180-item v1.2 frozen set; 300 Full target if clean; 600 stretch only with dedicated annotators.

### Findings/TMLR

- Well-powered adversarial result (≥350 eligible), B8 vs B8-no-trust ≥15–20% relative, CI excludes 0.
- Accuracy non-inferior.
- B8-no-trust and B8-trust-hidden isolation.
- Honest limitation: injection/math setting, lexical/heuristic verifier.
- No natural-setting or final-scale replication, or no mediation.

### Workshop

- Harness + suggestive result: 150–200 eligible, one dataset, no isolation, clear limitations.

### Negative result

- Powered test shows no effect; boundary analysis (verifier accuracy, coverage, claim count, model identity) is publishable at workshop/Findings. Not top-Q1.

---

## 12. What not to run

- Do not run 15 conditions × 5 datasets × 3 seeds × 1,000 questions (~30,000 GPU-h).
- Do not put EG-SSS in Core v1.0; it joins at the v1.2 benchmark freeze.
- Do not describe a 400-per-dataset Core matrix over EG-SSS; the Core datasets are GPQA/MMLU-Pro/HLE.
- Do not assert a 36-run or 32-run Full matrix as final before WP-18 freezes it.
- Do not run B8 without injection and call it a CCR result.
- Do not compare B8 to B4 when B4 uses a different partition/prompt.
- Do not use ECR as a primary or secondary metric.
- Do not treat 3 seeds as independent samples.
- Do not add conditions after seeing the primary result.
- Do not submit the full 10-baseline matrix as the paper; put it in the thesis appendix.

---

## 13. Calendar

| Window | Work |
|---|---|
| Nov 2026 | N1 final-stack 96 GB smoke (not run yet); N2 WP-18 starts; N3 24-item calibration; N4 verifier audit starts |
| Nov–Dec 2026 | WP-18 placebo/oracle + Full config; verifier audit (150–200 pairs) |
| Dec 2026 | N5 pilot / **G2** |
| Jan 2027 | **G3 Core run**; 180-item benchmark freeze (v1.2) |
| Feb 2027 | **G4/G5 Full run**; 300-item target if the 180 set is clean |
| Mar 2027 | Human evaluation / SDT |
| Apr 2027 | Results freeze; law-testing only if the effect is real |
| May–Jun 2027 | Thesis chapters; internal review; **thesis submission June 2027** |
| Jun–Jul 2027 | **Defence** |
| Aug–Dec 2027 | Paper: TACL rolling / EMNLP 2028 / Q1 journal |

**No paper deadline before the defence.** Do not force a submission to hit an artificial date.
