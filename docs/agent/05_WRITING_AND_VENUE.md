# 05 — Writing, Claims, and Venue

**Status date:** 9 November 2026. **P0 engineering is released; there are no efficacy results.**

**Readiness:** `FYDP_Summer/out/fydp.pdf` — **60 pages**, 0 errors/undefined refs. `Papev_Summer26_6/out/cas-sc-template.pdf` — **18 pages**, 0 errors/undefined refs. Implementation and conclusion are **written** for the P0 engineering release. Neither manuscript reports an efficacy result.

**Title (fixed, no colon):** *The Boundaries of Evidence-Grounded Trust in Multi-Agent Scientific Debate, with a Controlled Benchmark for Sycophantic Consensus.*

---

## 1. What the current manuscripts are

The report and journal are **engineering/design reports** for P0. They describe the pipeline, interfaces, gates, tests, figures, and the controlled-benchmark design. They do **not** report accuracy, CMR, CCR, trust AUROC, or a sign reversal, because those runs do not exist yet.

The old problem — an abstract that claimed results while `4.implementation.tex` and `6.conclusion.tex` were empty — is resolved: implementation and conclusion are written. The remaining rule is simpler: **do not add an efficacy sentence until the pilot/Core data exist.**

Choose one genre before further editing:

- **FYDP report:** design + implementation + P0 engineering results + limitations. Keep the engineering chapters.
- **Paper:** one claim, 8 pages, 4–6 experiments, related work, limitations, ethics. Move accreditation material to the thesis appendix.

Do not mix them. The current 60-page artifact is the report; the 18-page artifact is the journal-style engineering paper.

---

## 2. Readiness at a glance

| Item | State (9 Nov 2026) | Implication |
|---|---|---|
| Report | 60 pp; 0 errors/undefined refs | Compiles; engineering report |
| Journal | 18 pp; 0 errors/undefined refs | Compiles; engineering report |
| P0 gate | 13/13 | Engineering readiness only |
| Tests | 514 passed | Code path is tested |
| Efficacy results | **None** | No accuracy/CMR/CCR claim may be written |
| Claim audit | Resolved 9 Nov 2026 | See the two `CLAIMS_AUDIT.md` files |
| Benchmark | 24 calibration → 180 v1.2 → 300 Full | 600 stretch; 800 no-go |
| Final-stack smoke | **Not run** | Do not claim 96 GB serving |

---

## 3. Claim audit (historical; resolved 9 November 2026)

> **Banner:** this table is the 8 November 2026 audit that drove the rewrite. It is **resolved**. The applied changes are recorded in `Papev_Summer26_6/CLAIMS_AUDIT.md` and `FYDP_Summer/CLAIMS_AUDIT.md`; do not re-open these items as current defects.

| # | Historical claim | Problem | Rewrite |
|---:|---|---|---|
| 1 | "Our proposed framework produced fewer hallucinated answers..." | No results; past tense | Delete until results; then define and report a hallucination metric |
| 2 | "Currently, there is no mechanism within any debate system to check..." | False absolute; CRITIC, RAG debate, GAVEL, SciTrue, DebateCV exist | "We are not aware of a deployed method that combines claim-level external evidence with in-debate agent trust; the closest are R²-MAD, TERA-RAG, GAVEL, and DebateCV." |
| 3 | "The system returns both the selected model..." | Wrong object | "the selected answer and its supporting citations" |
| 4 | "This is known as the 'sycophantic consensus.'" | Not a standard term; "known as" overclaims | "We operationalize this as *sycophantic collapse*: a correct agent abandons its answer under pressure without decisive new evidence." |
| 5 | "The primary purpose ... was to eliminate excessive sycophancy through majority vote..." | Absolute; broken syntax; past tense | "This work tests whether evidence-weighted trust reduces sycophantic collapse relative to majority vote." |
| 6 | "in over 20% of times when an agent makes a wrong decision..." | Misstated statistic/denominator; He et al. report 25.5% of divergent cases | Quote the exact figure and denominator, or drop the number |
| 7 | "The trust values ... remain within bounds at all times..." | False after renormalization | "The weights are projected onto a simplex with a floor; the exact bound is in §X." |
| 8 | "An approach that utilizes per-agent confidence ... is followed here [DebUnc]" | Contradicts the thesis (external evidence, not confidence) | "Unlike DebUnc, we use externally verified evidence rather than self-reported confidence." |
| 9 | "iMAD addresses cost rather than correctness" | Misleading; iMAD reports accuracy gains | "iMAD primarily targets cost; it also reports accuracy gains in some settings." |
| 10 | "none of the previously conducted studies have assessed scientific claims prior to altering the influence of an agent" | False absolute; R²-MAD/TERA-RAG/GAVEL are adjacent | "None combines claim-level scientific evidence with an explicit bounded in-debate trust state and a controlled wrong-majority benchmark." |
| 11 | "all surviving claims are linked back to their originating passages" | False; unverifiable claims survive without citations | "claims classified as supported are linked to the passages that supported them." |
| 12 | "RAG (Rebuttal Aggregation Graph)" | Factual error | "RAG (retrieval-augmented generation)" |
| 13 | "meets all seven complex engineering attributes" | Table says P6 is not covered | "meets six of seven; P6 is not covered because there are no external stakeholders" |
| 14 | "still within an incremental level of innovation" | Self-admission; fatal for a top-tier claim | Delete or change the contribution/venue |
| 15 | "the system returns ... the selected model" | Wrong object | "the selected answer" |

**Integrity status:** resolved. The abstract no longer claims results; implementation and conclusion are written; the manuscripts are labeled as P0 engineering reports.

---

## 4. Five rewrite rules

### Rule 1 — One claim per sentence; subject–verb–object
> Before: "It is this type of connection that is added by this study."  
> After: "This study adds that connection."

> Before: "The major part of the problem consists of developing a procedure for combining individually generated answers produced by multiple agents."  
> After: "The hard part is aggregating the agents' answers."

### Rule 2 — Tense and modality discipline
Present for design; past only for executed work; "we plan to" for future.
> Before: "Our proposed framework produced fewer hallucinated answers..."  
> After: "We test whether the framework reduces hallucinated answers."

### Rule 3 — One term per concept
Use **trust weight** for the scalar, **trust vector** for the distribution, **sycophantic collapse** for the event. Ban "trust score / trust value / influence / credibility" as interchangeable. Ban "trusting mechanism," "selected model," and "RAG (Rebuttal Aggregation Graph)."

### Rule 4 — Quantify or delete absolutes
> Before: "Currently, there is no mechanism..."  
> After: "We are not aware of a deployed method that..."

Delete "surprisingly," "confidently," "significantly," "robust," "efficient," "eliminate" unless followed by a number or citation.

### Rule 5 — Delete meta-prose and LLM connectives
Delete "This chapter sets the scene for the whole report," "It should be noted that," "Additionally, there is also work being done," "The rest of the report moves from background to results." Start paragraphs with the claim.

**Read the draft aloud. If a sentence can be deleted without losing content, delete it. Target 15–20 words per sentence, active voice, concrete nouns.**

---

## 5. Abstract skeleton (use after results)

1. Multi-agent debate can improve scientific QA, but a confident wrong majority can pressure a correct minority into agreement.
2. Existing mitigations use prompt refinement or self-reported uncertainty; recent systems add retrieval-based reliability weights, but none measures when claim-level evidence-derived trust actually changes the collective outcome.
3. We introduce a controlled wrong-majority benchmark that separates social pressure from evidential revision, and a trust-calibration layer that reweights agent influence from claim-level retrieved evidence.
4. In a pre-registered factorial across N questions and M models, evidence visibility alone does not reduce collapse; trust-weighted influence does, but only above a verifier-accuracy threshold \(q^\star\).
5. We derive and measure the verification boundary, release the benchmark and protocol, and show that below \(q^\star\) evidence-grounded reweighting can amplify conformity.

**Do not write sentence 4 until the experiment exists.** Sentences 1–3 describe the design and are safe; sentence 5's "show" is a results verb and must wait.

---

## 6. Title

Use exactly:

> *The Boundaries of Evidence-Grounded Trust in Multi-Agent Scientific Debate, with a Controlled Benchmark for Sycophantic Consensus.*

**No colon.** Do not shorten it to the old colon titles. Those are historical options, not the paper title; they are retained in Appendix A only so an agent does not reintroduce them.

The title names the contribution: **boundaries** (conditional/causal analysis), **evidence-grounded trust** (the mechanism), and a **controlled benchmark** (the measurement artifact).

---

## 7. Contributions to claim (pick 4)

1. **Causal decomposition** of evidence *information* vs evidence *influence* in multi-agent debate, with a placebo-trust control.
2. **Verification boundary:** a derived (not proved) theory + noise sweep identifying the verifier-accuracy/coverage threshold.
3. **Validated measurement:** a human-labeled claim/evidence set, verifier precision/recall, fixed accuracy/CMR/trust-AUROC metrics.
4. **Appropriate revision rate (ARR):** separates resistance to wrong pressure from stubbornness.
5. **Benchmark:** 180-item v1.2 freeze target; 300-item Full target; 600-item stretch only with dedicated annotators.

Do not claim the mechanism is new. Claim the measurement/causal/boundary contribution.

---

## 8. Venue and dates

**Calendar:** paper in **August–December 2027**, after the thesis defence. **No paper deadline before the defence.**

| Target | Fit | Notes |
|---|---|---|
| TACL (rolling) | Strong if the causal/boundary result is clean | TACL is a **venue**, not an experiment stage |
| EMNLP 2028 | Strong if the benchmark + causal package lands | Submit after defence; no dual submission |
| Q1 journal (KBS/ESWA/IP&M/EAAI) | Strong system + benchmark paper | Verify current JCR/Scopus quartile and scope before submission |
| Findings of ACL/EMNLP | Realistic if the effect is modest | Honest limitations |
| ACL/EMNLP main | Stretch | Not the planning target |
| NeurIPS/ICLR main | Not the target | Theory is applied; do not plan around it |
| NeurIPS D&B | Possible for the benchmark paper | Needs the 300-item target and adoption evidence |

**Do not use any pre-defence deadline.** The old TACL/EMNLP date assumptions are historical. The thesis is submitted June 2027; the defence is June/July 2027; the paper window is Aug–Dec 2027.

**Recommended path:**
- **Paper A (top conference/top Q1):** the causal/boundary paper.
- **Paper B (Q1 journal):** the system + benchmark + full evaluation.
- The thesis contains both; the papers use different slices of the same experiments.

The old AC-style venue estimates from the 8 Nov 2026 audit are historical judgments, not acceptance probabilities or current results. Use them for calibration only.

---

## 9. Thesis vs paper

- **Thesis:** full pipeline, design chapters, all datasets, all baselines, negative results, engineering, accreditation material.
- **Paper:** one claim, 4–6 experiments, 8–12 pages, related work, limitations, ethics, reproducibility.
- Do not submit the thesis as a paper. Do not put SWOT/Gantt/Washington Accord material in a Q1 paper.

---

## 10. Submission checklist

### Science
- [ ] Primary endpoints pre-registered (accuracy + CMR).
- [ ] n and MDE reported per dataset (400 GPQA/MMLU-Pro, 200 HLE control).
- [ ] Comparator is B8-no-trust, not B3.
- [ ] Verifier human-validated (balanced accuracy, precision/recall, κ); N4 ≥0.75, κ ≥0.60.
- [ ] Final-answer accuracy reported.
- [ ] CCR-0/CCR-E/MPR-weighted/ARR separated.
- [ ] Trust AUROC/Brier reported; ECR not used.
- [ ] Placebo/trust-hidden/oracle controls.
- [ ] Claim-level vs document-level test.
- [ ] Natural-divergence or non-math replication.
- [ ] Failure analysis with human labels.
- [ ] Benchmark: 180 frozen; 300 Full target; 600 stretch only if clean.

### Writing
- [ ] Abstract has no claim without a result.
- [ ] Related work cites R²-MAD, TERA-RAG, To Trust or Not, GAVEL, DebateCV, DebUnc, ConsensAgent, iMAD, MoA, FREE-MAD, Minority Sentinel.
- [ ] "No prior work" absolutes removed.
- [ ] Formal section states the update, aggregation, assumptions, and bound (or drops "formally bounded").
- [ ] Limitations: injection artificiality, lexical/heuristic verifier, dataset/source mismatch, model scope, compute.
- [ ] Ethics/dual-use: fabricated consensus, scientific misinformation, abstention.
- [ ] Reproducibility: code, configs, prompts, seeds, dataset revisions, manifest, prompt hash `bc9c7b...`.

### Artifact
- [ ] Code public; `main` has the full pipeline.
- [ ] No secrets/raw data/weights.
- [ ] `run_manifest.json` and reproduction script.
- [ ] License-compatible dataset links (no redistribution of BrokenMath/HLE/GPQA).

---

## 11. What would make it 8+ (projection, not a promise)

1. A clean causal result: evidence visibility alone does not reduce collapse; trust-weighted influence does.
2. A verification-boundary law: a phase boundary \(q^\star\) predicted by theory and confirmed by a noise sweep.
3. A validated claim-level benchmark (180 frozen, 300 Full target, 600 stretch) with human κ ≥0.7, released.
4. Faithful baselines and power (350–500 eligible/condition; mixed-effects; pre-registered).
5. A theory section with a survival condition and a corrected simplex projection, labeled derived until proved.
6. Human evaluation of citation faithfulness (150–200 paired items).

The score projections from the 8 Nov 2026 audit are historical working estimates, not acceptance probabilities. If the current draft were submitted without results, it would be a workshop paper at best.

---

## Appendix A — Historical title options (superseded 9 November 2026)

> **Historical only.** These colon titles were proposed before the final title was fixed. Do not use them in the manuscript, slides, or metadata.

- *Evidence as Influence: The Verification Ceiling of Trust-Calibrated Multi-Agent Debate*
- *When Does Evidence Rescue a Correct Minority? A Causal Study of Multi-Agent Deliberation*
- *TrustCal: A Reproducible Framework and Benchmark for Evidence-Grounded Multi-Agent Scientific Deliberation*
