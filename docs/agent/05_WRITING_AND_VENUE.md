# 05 — Writing, Claims, and Venue

**Current manuscript readiness:** 2.5/10 as a paper; 6/10 as an FYDP mid-project report.  
**Do not submit the current draft.** It has no results, invalid metrics, approximate baselines, and an abstract that claims results the report does not contain.

---

## 1. What the current draft is

A **systems/design report wearing the clothes of an empirical paper**. Chapters 3 and 5 are requirements, data-flow diagrams, SWOT, Gantt, and accreditation material. There is no formal section, no results, no statistics, no limitations, and no ethics. The only real run is Gate 0 (10 vanilla MAD debates), which never scored accuracy or trust.

**Choose one genre before editing:**

- **FYDP report:** design + implementation + results + limitations. Keep the engineering chapters; add real results.
- **Paper:** one claim, 8 pages, 4–6 experiments, related work, limitations, ethics. Move the accreditation material to the thesis appendix.

Do not mix them.

---

## 2. Claim audit (fix these first)

| # | Current claim | Problem | Rewrite |
|---:|---|---|---|
| 1 | "Our proposed framework produced fewer hallucinated answers..." (`Papev...:121`) | No results; past tense | Delete until results; then define and report a hallucination metric |
| 2 | "Currently, there is no mechanism within any debate system to check..." (`Papev...:121`) | False absolute; CRITIC, RAG debate, GAVEL, SciTrue, DebateCV exist | "We are not aware of a deployed method that combines claim-level external evidence with in-debate agent trust; the closest are R²-MAD, TERA-RAG, GAVEL, and DebateCV." |
| 3 | "The system returns both the selected model..." (`Papev...:121`) | Wrong object | "the selected answer and its supporting citations" |
| 4 | "This is known as the 'sycophantic consensus.'" | Not a standard term; "known as" overclaims | "We operationalize this as *sycophantic collapse*: a correct agent abandons its answer under pressure without decisive new evidence." |
| 5 | "The primary purpose ... was to eliminate excessive sycophancy through majority vote..." (`1.intro.tex`) | Absolute; broken syntax; past tense | "This work tests whether evidence-weighted trust reduces sycophantic collapse relative to majority vote." |
| 6 | "in over 20% of times when an agent makes a wrong decision..." | Misstated statistic/denominator; He et al. report 25.5% of divergent cases | Quote the exact figure and denominator, or drop the number |
| 7 | "The trust values ... remain within bounds at all times..." | False after renormalization | "The weights are projected onto a simplex with a floor; the exact bound is in §X." |
| 8 | "An approach that utilizes per-agent confidence ... is followed here [DebUnc]" | Contradicts the thesis (external evidence, not confidence) | "Unlike DebUnc, we use externally verified evidence rather than self-reported confidence." |
| 9 | "iMAD addresses cost rather than correctness" (`2.back.tex:40`) | Misleading; iMAD reports accuracy gains | "iMAD primarily targets cost; it also reports accuracy gains in some settings." |
| 10 | "none of the previously conducted studies have assessed scientific claims prior to altering the influence of an agent" (`2.back.tex:73-74`) | False absolute; R²-MAD/TERA-RAG/GAVEL are adjacent | "None combines claim-level scientific evidence with an explicit bounded in-debate trust state and a controlled wrong-majority benchmark." |
| 11 | "all surviving claims are linked back to their originating passages" | False; unverifiable claims survive without citations | "claims classified as supported are linked to the passages that supported them." |
| 12 | "RAG (Rebuttal Aggregation Graph)" (`5.sic.tex`) | Factual error | "RAG (retrieval-augmented generation)" |
| 13 | "meets all seven complex engineering attributes" (`5.sic.tex`) | Table says P6 is not covered | "meets six of seven; P6 is not covered because there are no external stakeholders" |
| 14 | "still within an incremental level of innovation" (`5.sic.tex`) | Self-admission; fatal for a top-tier claim | Delete or change the contribution/venue |
| 15 | "the system returns ... the selected model" | Wrong object | "the selected answer" |

**Integrity issue:** `4.implementation.tex` and `6.conclusion.tex` are empty, while the abstract reports results. Fix this before anything else. A reviewer who notices will not trust any other claim.

---

## 3. Five rewrite rules

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

## 4. Abstract skeleton (use after results)

1. Multi-agent debate can improve scientific QA, but a confident wrong majority can pressure a correct minority into agreement.
2. Existing mitigations use prompt refinement or self-reported uncertainty; recent systems add retrieval-based reliability weights, but none measures when claim-level evidence-derived trust actually changes the collective outcome.
3. We introduce a controlled wrong-majority benchmark that separates social pressure from evidential revision, and a trust-calibration layer that reweights agent influence from claim-level retrieved evidence.
4. In a pre-registered factorial across N questions and M models, evidence visibility alone does not reduce collapse; trust-weighted influence does, but only above a verifier-accuracy threshold \(q^\star\).
5. We derive and measure the verification ceiling, release the benchmark and protocol, and show that below \(q^\star\) evidence-grounded reweighting can amplify conformity.

**Do not write sentence 4 until the experiment exists.**

---

## 5. Title options

- **Top-tier/measurement:** *Evidence as Influence: The Verification Ceiling of Trust-Calibrated Multi-Agent Debate*
- **Causal:** *When Does Evidence Rescue a Correct Minority? A Causal Study of Multi-Agent Deliberation*
- **System/Q1 journal:** *TrustCal: A Reproducible Framework and Benchmark for Evidence-Grounded Multi-Agent Scientific Deliberation*

The current title is long and generic. A sharper title signals the contribution.

---

## 6. Contributions to claim (pick 4)

1. **Causal decomposition** of evidence *information* vs evidence *influence* in multi-agent debate, with a placebo-trust control.
2. **Verification ceiling:** a theory + noise sweep identifying the verifier-accuracy/coverage threshold.
3. **Validated measurement:** a human-labeled claim/evidence set, verifier precision/recall, fixed CCR/MPR/trust-AUROC metrics.
4. **Appropriate revision rate (ARR):** separates resistance to wrong pressure from stubbornness.
5. **Benchmark (stretch):** a 300–500-question diagnostic set with claim-level evidence labels.

Do not claim the mechanism is new. Claim the measurement/causal/ceiling contribution.

---

## 7. Venue strategy

| Target | As-is | After P0 + solid results | After P1/P2 |
|---|---|---|---|
| Q1 journal (KBS/ESWA/IP&M/EAAI) | Not ready | Competitive (6.7–7.2) | Strong (7.7–8.0) |
| Findings of ACL/EMNLP | Not ready | 30–40% (AC-style) | 40–50% |
| TMLR | Not ready | 25–35% | 35–45% |
| ACL/EMNLP main | <1% | 5–8% | 8–12% |
| NeurIPS/ICLR main | ~0% | 1–2% | 2–4% |
| NeurIPS D&B (benchmark) | n/a | 10–15% | 15–20% |

These are AC-style judgments, not acceptance probabilities. Verify current JCR/Scopus quartiles and journal scope before submission. The realistic top target is a **Q1 journal**; ACL/EMNLP main is a stretch; NeurIPS/ICLR main is not the target.

**Recommended path:**
- **Paper A (top conference/top Q1):** the causal/verification-ceiling paper.
- **Paper B (Q1 journal):** the system + benchmark + full evaluation.
- The thesis contains both; the papers use different slices of the same experiments.

---

## 8. Thesis vs paper

- **Thesis:** full pipeline, design chapters, all datasets, all baselines, negative results, engineering, accreditation material.
- **Paper:** one claim, 4–6 experiments, 8 pages, related work, limitations, ethics, reproducibility.
- Do not submit the thesis as a paper. Do not put SWOT/Gantt/Washington Accord material in a Q1 paper.

---

## 9. Submission checklist

### Science
- [ ] Primary endpoint pre-registered.
- [ ] n and MDE reported per dataset.
- [ ] Comparator is B8-no-trust, not B3.
- [ ] Verifier human-validated (balanced accuracy, precision/recall, κ).
- [ ] Final-answer accuracy reported.
- [ ] CCR-0/CCR-E/MPR-weighted/ARR separated.
- [ ] Trust AUROC/Brier reported.
- [ ] Placebo/trust-hidden/oracle controls.
- [ ] Claim-level vs document-level test.
- [ ] Natural-divergence or non-math replication.
- [ ] Failure analysis with human labels.

### Writing
- [ ] Abstract has no claim without a result.
- [ ] Related work cites R²-MAD, TERA-RAG, To Trust or Not, GAVEL, DebateCV, DebUnc, ConsensAgent, iMAD, MoA, FREE-MAD, Minority Sentinel.
- [ ] "No prior work" absolutes removed.
- [ ] Formal section states the update, aggregation, assumptions, and bound (or drops "formally bounded").
- [ ] Limitations: injection artificiality, lexical/heuristic verifier, dataset/source mismatch, model scope, compute.
- [ ] Ethics/dual-use: fabricated consensus, scientific misinformation, abstention.
- [ ] Reproducibility: code, configs, prompts, seeds, dataset revisions, manifest.

### Artifact
- [ ] Code public; `main` has the full pipeline.
- [ ] No secrets/raw data/weights.
- [ ] `run_manifest.json` and reproduction script.
- [ ] License-compatible dataset links (no redistribution of BrokenMath/HLE/GPQA).

---

## 10. What would make it 8+

1. A clean causal result: evidence visibility alone does not reduce collapse; trust-weighted influence does.
2. A verification-ceiling law: a phase boundary \(q^\star\) predicted by theory and confirmed by a noise sweep.
3. A validated claim-level benchmark (300–500 questions) with human κ ≥0.7, released.
4. Faithful baselines and power (350–500 eligible/condition; mixed-effects; pre-registered).
5. A theory section with a survival condition and a corrected simplex projection.
6. Human evaluation of citation faithfulness (150–200 items).

If you achieve 1–3, the paper is 8.1–8.2 (Core 8.25 / Weighted 8.18). If only 4–5, it is 7.5–7.6. If you submit the current draft, it is a workshop paper at best.
