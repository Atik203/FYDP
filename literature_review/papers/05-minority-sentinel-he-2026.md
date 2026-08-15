# 📄 Paper #5 — Minority Sentinel

![Paper](https://img.shields.io/badge/Paper-%235-1f6feb?style=for-the-badge)
![Role](https://img.shields.io/badge/Role-Competitor-d29922?style=for-the-badge)
![Threat](https://img.shields.io/badge/Threat%20to%20Novelty-Medium-d29922?style=for-the-badge)
![Venue](https://img.shields.io/badge/Venue-SIGIR%202026%20Workshop-6e40c9?style=for-the-badge)
![Verified](https://img.shields.io/badge/Verified-2026--08--15-8957e5?style=for-the-badge)

> *Verified via full paper text (arXiv 2606.29270) + PDF.*

Paper Title:
Minority Sentinel: When to Overturn Majority Voting in Multi-Agent LLM Debates

Authors & Year:
Chuan He, Zebin Chen, Zhengyi Yang, Jiate Liu, Dong Wen (UNSW Sydney); Shaobo Qiao, Mingchen Ju (Euler AI); Guanfeng Liu (Macquarie University) — 2026

Link:
arXiv: https://arxiv.org/abs/2606.29270 (HTML: https://arxiv.org/html/2606.29270v1)
DOI: 10.48550/arXiv.2606.29270 (AgentSearch Workshop @ SIGIR 2026, Melbourne)

Summary:
Minority Sentinel is the strongest published, quantified documentation of the exact phenomenon our proposal targets: majority voting in Multi-Agent Debate (MAD) suppresses correct minority answers. The paper observes that MAD+MV rests on the Condorcet Jury Theorem's independence assumption, which modern LLMs violate because of shared pretraining corpora and correlated errors. Across debates among three heterogeneous LLM agents (GPT-4o-mini, Gemini-2.0-Flash, Claude Haiku 4.5, each with a distinct reasoning persona) on six benchmarks, 39.1% of 1,754 samples exhibit 2:1 opinion divergence, and in 25.5% of those divergent cases the *minority* holds the correct answer — a 10.0-percentage-point theoretical recovery margin (MV accuracy 74.3% vs an 84.3% Oracle upper bound). Their solution is a Diagnosis–Cure framework: a 22-dimensional *debate fingerprint* (10 debate-dynamics, 4 voting-metadata, 8 semantic-audit features) extracted from debate logs, fed to a lightweight LightGBM meta-classifier that decides when to flip the majority vote, with per-dataset threshold optimization under a "first, do no harm" constraint (≥95% majority-correct preservation). Results: overall Net Gain +1.71% (39 correct flips vs 9 wrong flips), Flip Precision 81.2%, positive Net Gain on all six datasets and all 20 random seeds (mean +1.65% ± 0.19%). Critically for us, an LLM-as-Judge baseline (GPT-4o reading the logs) yields *negative* Net Gain (−1.37%, Flip Precision 42.7%) — another LLM sharing the agents' blind spots cannot arbitrate correlated errors, motivating the authors' "cognitive orthogonality" principle: a non-LLM classifier succeeds precisely because it judges statistical behavior, not semantics.

Relevant to Our Idea:
Minority Sentinel is our closest *problem-framing* neighbor: it independently quantifies what we call sycophantic consensus collapse — a correct minority abandoned under majority pressure — and intervenes at the aggregation layer to recover it. Three facts from this paper are direct external evidence for our proposal: (a) the phenomenon is real and prevalent (25.5% of divergent cases, 10.0pp recovery margin); (b) LLM-based adjudication fails (LLM-as-Judge NG = −1.37%) because judges share the debating agents' correlated errors — supporting our Challenge C argument that self-referential signals cannot fix collapse; (c) recovery is possible with the right signal, but their signal is behavioral statistics of the debate itself. The decisive differentiators from our TCM: **post-hoc vs in-session** (Sentinel decides *after* the debate whether to flip a binary vote; it never re-weights agent influence *during* rounds — agents still converge under unmitigated social pressure); **self-referential vs external** (its fingerprint is derived from the same correlated models' behavior; our trust scores come from externally retrieved scientific evidence); **supervised vs training-free** (Sentinel needs labeled divergent samples plus per-dataset threshold tuning; our evidence-grounded weighting is designed to be calibration-light). Their finding that debate-dynamics features alone recover 73% of the gain — i.e., *how agents argued* signals consensus reliability — is a design hint we can acknowledge; but Sentinel still cannot prevent the collapse, only compensate for it after the fact.

Gap / Limitation Noted in Paper:
The authors' own limitations (§6.2): the system is fixed at 3 agents / 2 rounds producing only 2:1 splits (5-agent coalition dynamics unverified); the eight Semantic Audit features require extra GPT-4o calls (inference cost, and a residual LLM dependency they concede is only partially mitigated by ablation); per-dataset threshold optimization requires labeled divergent samples, leaving zero-shot threshold calibration open; and only 686 divergent samples (ARC-Challenge: 33, with 14 Minority Truth cases) mean per-dataset thresholds risk overfitting. From our perspective, the structural limitation is that Minority Sentinel operates entirely after the debate: the majority's pressure on the minority was already applied, so even a perfect flip decision recovers only the *final-round* suppressed answer rather than preventing the minority's argument from being corrupted round-over-round.

---

## Section 2 — Expert Detailed Analysis

### Q1–Q9 Quick Reference

| # | Question | Short Answer |
|---|---|---|
| Q1 | What problem and why important? | MAD+MV relies on Condorcet's independent-errors assumption; correlated LLM errors make the majority systematically suppress correct minority opinions ("Minority Truth"). Question: when should MV be overturned? |
| Q2 | What data (source, size, splits, ethics)? | 6 benchmarks: ARC-Challenge, CommonsenseQA, GSM8K, MMLU-STEM, TruthfulQA, WinoGrande. 1,754 dedup debate logs; 686 divergent (2:1); 175 Minority Truth. Stratified 5-fold CV, out-of-fold metrics. Public benchmarks; no ethics section (ACM CCS concepts only). |
| Q3 | What features/inputs, how engineered? | 22-feature *debate fingerprint*: 10 debate-dynamics (stance changes, agreement counts, conversion ratios), 4 voting-metadata (vote margin, total stance changes), 8 semantic-audit (GPT-4o-extracted binary flags + 1–5 ordinal scores: blind followers, reasoning score diff, logical gaps). |
| Q4 | What methods/models, overall pipeline? | Diagnosis–Cure: (Diagnosis) Round 0 independent answering, Rounds 1–2 structured debate with explicit stance declarations among 3 heterogeneous agents w/ personas (Rigorous Auditor / Balanced Analyst / Intuitive Challenger), temp 0.7; (Cure) extract fingerprint → LightGBM meta-classifier → per-dataset threshold τ∈[0.05,0.95] maximizing Net Gain s.t. ≥95% majority-correct preservation. |
| Q5 | What baselines and why chosen? | MV (NG=0 reference), Always Trust Minority (blind-flip ceiling of harm), Single Best Feature (reasoning_score_diff), Logistic Regression (linearity test on same features), LLM-as-Judge GPT-4o temp 0 (LLM arbitration test), Oracle upper bound. |
| Q6 | How evaluated (metrics, setup, tests)? | Net Gain NG=(CF−WF)/N_total (primary), Flip Precision, Recovery Rate, AUC. Stratified 5-fold CV; per-dataset threshold optimization; 20-seed stability (seed 0–19); global threshold sweep τ∈[0.05,0.95]. No formal significance tests beyond seed distributions. |
| Q7 | Key results vs baselines? | Overall NG +1.71% (CF 39, WF 9), FP 81.2%, AUC 0.741; positive NG on all 6 datasets; GSM8K best (AUC 0.957, NG +8.03%, 11/11 flips correct); 20 seeds mean +1.65%±0.19% all positive. LLM-as-Judge NG −1.37% (FP 42.7%); Always Trust Minority −19.16%. |
| Q8 | Limitations and biases? | Fixed 3-agent/2-round structure; GPT-4o audit dependency (cost + residual LLM bias); per-dataset labeled threshold tuning (zero-shot open); small divergent N → threshold overfitting risk; post-hoc binary flip only — no in-debate intervention. Error analysis: 7/9 wrong flips in MMLU-STEM; GPT-4o-mini (Agent A) the minority in 6/9. |
| Q9 | Code/data/artifacts available? | No code or data release stated in the paper (LightGBM over API models: GPT-4o-mini, Gemini-2.0-Flash, Claude Haiku 4.5, GPT-4o audit/judge). Verbatim system prompts in Appendix A. Public benchmarks only. |

### 1. Publication Status & Citation

| Field | Value |
|---|---|
| **Venue** | AgentSearch Workshop @ SIGIR 2026 (Melbourne, Australia, July 24, 2026) — per paper footer |
| **arXiv** | 2606.29270v1, submitted 2026-06-28 |
| **DOI** | 10.48550/arXiv.2606.29270 |
| **Last verified** | 2026-08-15 — arXiv listing + full paper text + PDF |
| **Code** | None stated in the paper |

**BibTeX** (matches `fydp.bib` entry `he2026minority`):
```bibtex
@inproceedings{he2026minority,
  author = {He, Chuan and Chen, Zebin and Yang, Zhengyi and Qiao, Shaobo and Ju, Mingchen and Liu, Jiate and Wen, Dong and Liu, Guanfeng},
  title = {Minority Sentinel: When to Overturn Majority Voting in Multi-Agent {LLM} Debates},
  booktitle = {Proceedings of the AgentSearch Workshop at SIGIR 2026},
  year = {2026},
  address = {Melbourne, Australia},
  doi = {10.48550/arXiv.2606.29270},
  url = {https://arxiv.org/abs/2606.29270},
  note = {arXiv:2606.29270}
}
```

### 2. Core Contribution & Method

Minority Sentinel formalizes the failure of majority voting under correlated errors and attacks it with a non-LLM meta-classifier. The paper's argument chain: (1) MV's guarantee rests on Condorcet's independent-errors assumption; (2) shared pretraining makes LLM errors correlated (citing Estornell & Liu's "Tyranny of the Majority" and Kim et al.'s correlated-errors analysis); (3) hence a majority can be confident *and* wrong, suppressing a correct minority — "the problem is not 'how to argue' but 'how to count.'"

**Problem formulation (§3.1):** K agents produce final answers after R debate rounds; MV selects the output. A *divergent sample* has at least one agent differing from the majority (2:1 for K=3). *Minority Truth* (named after Moscovici's minority-influence theory) = the minority's answer matches ground truth while the majority's is wrong. Because each Wrong Flip (WF) costs exactly what a Correct Flip (CF) gains, Net Gain is defined as **NG = (CF − WF) / N_total**, with N_total including non-divergent samples; auxiliary metrics are Flip Precision FP = CF/(CF+WF) and Recovery Rate = CF/N_MT. The goal is a decision function f(x) ∈ {flip, keep} applied only to divergent samples.

**Diagnosis phase (§3.2):** Three heterogeneous agents with dual diversity — *architectural* (different vendors: OpenAI GPT-4o-mini "Rigorous Auditor," Google Gemini-2.0-Flash "Balanced Analyst," Anthropic Claude Haiku 4.5 "Intuitive Challenger") and *cognitive role* (personas via system prompt, deliberately including one "susceptible to confident-sounding arguments"). Shared temperature 0.7 isolates model/role diversity from sampling randomness. The protocol enforces *independence before interaction* (Round 0: agents answer with reasoning before seeing peers) and *explicit stance tracking* (agents must declare whether and why they changed position in Rounds 1–2). Three agents/two rounds is a principled trade-off: 2:1 is the simplest non-trivial divergence (clean binary target), and correlated errors mean more agents "may amplify rather than attenuate systematic biases."

**Debate fingerprint (§3.3):** 22 features in three groups:
- *Debate Dynamics (10):* total stance changes, counts of explicit changes, agreement counts for minority/majority, agreement difference, majority convert ratio, minority persistence (Round 0 vs final), majority echo chamber, minority new-evidence flag.
- *Voting Metadata (4):* vote margin, divergence timing, etc.
- *Semantic Audit (8):* GPT-4o-extracted 1–5 ordinal reasoning scores (per side + difference), blind-follower count, logical-gap flags.

**Cure phase (§3.4):** LightGBM trained under Stratified 5-Fold CV (labels as stratification; all metrics from out-of-fold predictions). A per-dataset grid search over τ∈[0.05,0.95] (step 0.01) selects the threshold maximizing NG subject to the safety constraint that the majority-correct preservation rate stays ≥95% — "first, do no harm," since the majority is already correct in 74.5% of divergent cases. The non-LLM classifier choice is deliberate: it achieves *cognitive orthogonality* from the correlated debating agents, judging statistical behavioral patterns rather than the semantic reasoning that produced the errors.

### 3. Key Results (Extracted)

**Table 2 — Minority Truth prevalence (Diagnosis):**

| Dataset | N | N_div | N_MT | MT% | MV% | Orac.% | Δmax |
|---|---|---|---|---|---|---|---|
| ARC-Chall. | 96 | 33 | 14 | 42.4 | 71.9 | 86.5 | 14.6 |
| CSQA | 253 | 115 | 54 | 47.0 | 54.9 | 76.3 | 21.3 |
| GSM8K | 137 | 76 | 16 | 21.1 | 70.8 | 82.5 | 11.7 |
| MMLU-STEM | 726 | 236 | 49 | 20.8 | 80.9 | 87.6 | 6.7 |
| TruthfulQA | 210 | 76 | 21 | 27.6 | 62.4 | 72.4 | 10.0 |
| WinoGrande | 332 | 150 | 21 | 14.0 | 84.6 | 91.0 | 6.3 |
| **Total** | **1754** | **686** | **175** | **25.5** | **74.3** | **84.3** | **10.0** |

**Table 3 — Main results per dataset (all positive NG):**

| Dataset | τ | AUC | CF | WF | FP% | Rec% | NG% |
|---|---|---|---|---|---|---|---|
| ARC-Chall. | .85 | .823 | 5 | 0 | 100.0 | 35.7 | +5.21 |
| CSQA | .88 | .612 | 3 | 2 | 60.0 | 5.6 | +0.40 |
| GSM8K | .60 | .957 | 11 | 0 | 100.0 | 68.8 | +8.03 |
| MMLU-STEM | .76 | .746 | 16 | 7 | 69.6 | 32.7 | +1.24 |
| TruthfulQA | .87 | .681 | 3 | 0 | 100.0 | 14.3 | +1.43 |
| WinoGrande | .94 | .581 | 1 | 0 | 100.0 | 4.8 | +0.30 |
| **Overall** | — | **.741** | **39** | **9** | **81.2** | **22.3** | **+1.71** |

**Table 4 — Baselines (686 divergent samples, N_total = 1,754):**

| Method | CF | WF | FP% | Rec% | NG% |
|---|---|---|---|---|---|
| Majority Voting | – | – | – | – | 0.00 |
| Always Trust Min. | 175 | 511 | 25.5 | 100.0 | −19.16 |
| Single Best Feat. | 7 | 3 | 70.0 | 4.0 | +0.23 |
| Logistic Regr. | 24 | 12 | 66.7 | 13.7 | +0.68 |
| LLM-as-Judge | 70 | 94 | 42.7 | 40.0 | −1.37 |
| **Sentinel** | **39** | **9** | **81.2** | **22.3** | **+1.71** |
| Oracle (upper bd.) | 175 | 0 | 100 | 100 | +9.98 |

Key takeaways:
- **LLM-as-Judge is net harmful** (NG −1.37%): higher recall (40.0%) but FP of only 42.7% — "flip safety, not recovery volume, determines intervention value." This is the paper's strongest corroboration of our Challenge C thesis.
- Sentinel recovers 17.1% of the theoretical 10.0pp ceiling.
- **GSM8K** is the standout (AUC 0.957, NG +8.03%, 11/11 correct flips) — mathematical errors leave unambiguous behavioral traces (minority introducing new computation steps, catching the majority's arithmetic errors).

**Table 5 — Ablation (top: remove group; bottom: keep only group):**

| Configuration | #F | AUC | CF | WF | NG% | Δ |
|---|---|---|---|---|---|---|
| Full (22 features) | 22 | .741 | 39 | 9 | +1.71 | — |
| −Dynamics | 12 | .712 | 35 | 15 | +1.14 | −0.57 |
| −Meta | 18 | .732 | 42 | 11 | +1.77 | +0.06 |
| −Semantic Audit | 14 | .729 | 32 | 7 | +1.43 | −0.29 |
| Dynamics Only | 10 | .722 | 31 | 9 | +1.25 | — |
| Meta Only | 4 | .585 | 17 | 8 | +0.51 | — |
| Semantic Audit Only | 8 | .680 | 17 | 7 | +0.57 | — |

Dynamics is the backbone (removal costs −0.57pp NG and WF rises 9→15; alone recovers 73% of the gain); Semantic Audit adds incremental recall; Meta is nearly redundant.

**Feature importance (split count, Top-10):** agreement_diff (234), minority_agreement_count (233), majority_agreement_count (226), blind_follower_count (208), reasoning_score_diff (206), minority_reasoning_score (169), majority_convert_ratio (159), total_stance_changes (157), majority_explicit_changes (141), majority_logical_gap (139). Dynamics occupies 6 of Top-10, Semantic Audit 4, Meta 0 — consistent with the ablation.

**Table 6 — Classifier comparison:** LightGBM +1.71% > XGBoost +1.60% > CatBoost +1.54% > Random Forest +1.37% (highest AUC 0.751 but worse calibration) > Logistic Regression +0.68% > MLP +0.11% (AUC 0.508 — overfitting on small samples). GBDT family wins for small heterogeneous feature sets.

**Robustness:** 20 seeds: NG mean +1.65% ± 0.19% (min +1.31%, max +2.00%), all positive; AUC 0.749 ± 0.009; FP 80.8% ± 5.1%. Global fixed threshold sweep: NG > 0 across τ∈[0.61, 0.95]; global optimum τ=0.81 gives +1.08% (per-dataset +1.71% shows adaptive thresholds are worth 0.63pp).

**Error analysis (9 WFs):** Pattern A — question ambiguity (3/9, 33.3%): both answers defensible; benchmark annotation, not model judgment. Pattern B — true hard errors (6/9): minority "masquerades" as genuine Minority Truth via consistent stance, independent-sounding arguments, high reasoning confidence. 7/9 WFs are MMLU-STEM; GPT-4o-mini (Agent A) is the minority in 6/9 — in knowledge-intensive domains, erroneous minority arguments mimic high-quality reasoning.

### 4. Paper's Self-Admitted Limitations

1. **Fixed structure:** 3 agents / 2 rounds → only 2:1 divergences; generalization to 5-agent coalitions, 3:2 splits, and deeper debates unverified.
2. **GPT-4o audit dependency:** the 8 Semantic Audit features need extra GPT-4o calls (non-trivial cost) and reintroduce LLM influence; the authors concede "cognitive orthogonality is a spectrum," mitigated by ablation (removing audit costs only −0.29pp) and by the tree classifier learning to discount biased assessments.
3. **Labeled threshold tuning:** per-dataset optimization needs labeled divergent samples; "zero-shot threshold calibration remains an open problem."
4. **Small N:** 686 divergent samples overall, ARC-Challenge only 33 (14 MT); per-dataset thresholds carry overfitting risk, and "the positive NG observed... may partly reflect fortuitous threshold selection." They call for bootstrap CIs / cross-validated threshold selection.
5. **Post-hoc only:** the framework flips the final vote; it does not intervene during debate rounds (this is our structural gap, see §5).

### 5. Direct Comparison to Our Idea

| Dimension | Minority Sentinel | Our Idea |
|---|---|---|
| **Problem** | When to overturn MV *after* debate (binary flip) | How to weight agents *during* debate (continuous trust) |
| **Intervention point** | Post-debate aggregation layer (safety valve) | In-session, per-round trust update (TCM) |
| **Signal source** | Behavioral fingerprint from the debate log (self-referential) | External retrieved scientific evidence |
| **Trust basis** | Statistical patterns of correlated LLM behavior | Externally verified claim correctness |
| **Learning** | Supervised LightGBM + labeled per-dataset threshold | Evidence-grounded, training-free (retrieval-based) |
| **Failure mode addressed** | Minority Truth suppressed at final vote (recovery) | Sycophantic collapse during rounds (prevention) |
| **Target metric** | Net Gain / Flip Precision | CCR / MPR / ECR (collapse metrics) + accuracy |

**Overlap with C1 (trust mechanism):** Low-to-moderate. Same diagnosis and same aggregation-layer territory, but the mechanism is a post-hoc binary classifier over behavioral statistics — there is no per-agent trust variable, no continuous re-weighting, and no external grounding. Our in-debate evidence-grounded re-weighting remains distinct.

**Overlap with C2 (evaluation harness):** Moderate. Their NG/FP metrics measure flip quality, not collapse; but the per-dataset breakdown (Tables 2–3), the "first, do no harm" preservation constraint, and the stratified-CV protocol are clean precedents for reporting our own injection-based results. Their LLM-as-Judge experiment is also a ready-made citation for why LLM-based arbiters can't fix correlated collapse.

**Key divergence:** Sentinel concedes the majority pressure *already happened*; it optimizes a salvage operation on the final votes. Our proposal changes the incentive structure *during* the debate so the correct minority's influence is never crushed in the first place — and its trust signal comes from outside the correlated model family (external evidence), not from within its own behavioral traces.

### 6. Our Positioning Strategy

| Role | Detail |
|---|---|
| **In our paper** | Competitor (closest on problem framing — post-hoc intervention at aggregation) |
| **How we cite** | As independent, quantified confirmation of the minority-suppression phenomenon (25.5% / 10.0pp) and of the failure of LLM-based adjudication (NG −1.37%) — direct support for our motivation and Challenge C |
| **Relationship** | Adjacent on problem, different on mechanism — requires one sharp differentiation paragraph |

**Pre-emptive rebuttal paragraph** (if a reviewer asks "how is this different from Minority Sentinel?"):
> Minority Sentinel (He et al., 2026) provides the strongest published quantification of the phenomenon we target — correct minorities suppressed by majority voting in MAD — and demonstrates that a non-LLM classifier can recover part of the loss post-hoc (Net Gain +1.71%, Flip Precision 81.2%) while an LLM judge fails (−1.37%). Two structural differences separate our contribution. First, *when*: Sentinel operates after the debate as a binary flip decision on the final vote; our trust-calibrated mechanism re-weights agent influence continuously during the debate, so the minority's argument is never collapsed by social pressure in the first place. Second, *the signal*: Sentinel's debate fingerprint is behavioral statistics of the very agents whose errors are correlated; our trust scores are grounded in externally retrieved scientific evidence — an independent source of truth outside the model family. Sentinel's own results support our approach: its dynamics-feature findings show *how agents argued* correlates with consensus reliability, and its LLM-as-Judge failure confirms self-referential LLM judgment cannot arbitrate correlated errors. Sentinel is thus complementary: it could serve as a post-hoc verification layer on top of our in-debate trust calibration.

### 7. Code & Reproducibility

| Field | Detail |
|---|---|
| **Repo** | None stated in the paper (unlike iMAD/ConsensAgent/MoA) |
| **Models** | GPT-4o-mini (Rigorous Auditor), Gemini-2.0-Flash (Balanced Analyst), Claude Haiku 4.5 (Intuitive Challenger), temp 0.7; GPT-4o for Semantic Audit extraction and LLM-as-Judge baseline (temp 0) |
| **Classifier** | LightGBM (GBDT), compared vs XGBoost, CatBoost, RF, LR, MLP |
| **Reimplementation effort** | Moderate: LightGBM pipeline is standard, but exact reproduction of the 22-feature extraction (esp. stance-change bookkeeping and GPT-4o audit scoring) is the critical path; verbatim prompts are in Appendix A |
| **Key challenge for replication** | Per-dataset threshold optimization needs labeled divergent samples — a dependency our evidence-grounded approach aims to avoid |

### 8. Cross-References

| Paper in this review | Relationship |
|---|---|
| **ConsensAgent (Pitre et al., 2025)** | Same failure mode, different intervention point: ConsensAgent rewrites the task prompt *pre-debate*; Sentinel flips the vote *post-debate*; ours re-weights *during*. ConsensAgent's "correct answer present but ignored >20%" and Sentinel's "25.5% of divergent cases" are convergent, independent quantifications — cite both for prevalence. |
| **DebUnc (Yoffe et al., 2025)** | The two papers bracket our mechanism: DebUnc re-weights *in-debate* but on self-reported confidence (whose ceiling its Ground Truth oracle exposes); Sentinel is post-hoc on behavioral stats. Both independently conclude self-referential LLM signals are the bottleneck. |
| **iMAD (Fan et al., 2026)** | Striking methodological parallel: both use a non-LLM classifier over engineered features (iMAD's 41 linguistic features + MLP gate; Sentinel's 22 behavioral features + LightGBM). iMAD decides *when to start* a debate; Sentinel decides *when to overturn* its outcome; neither touches in-debate trust. |
| **Estornell & Liu (2024)** | Cited by Sentinel as the formal "Tyranny of the Majority" analysis that motivates its empirics; our pending review of Estornell & Liu is the theoretical counterpart to Sentinel's measurements. |
| **MoA (Wang et al., 2025)** | MoA is trust-blind static synthesis with no intervention; Sentinel is the opposite extreme — a targeted aggregation-layer safety valve. |

Sentinel also cites (relevant to our related-work chapter): Kim et al. (correlated errors), Choi et al. (Debate or Vote — debate alone doesn't beat good aggregation), Wu et al. (agents correct only 3.6% of stance biases), Ai et al. (Beyond Majority Voting — higher-order consistency weighting), and — as its closest related work — AgentAuditor (Yang et al., 2026, arXiv 2602.09341), a reasoning-tree audit method we have not reviewed yet; flag for a future read.

### 9. Relevance to FYDP

★★★★☆

**Justification:** Mandatory read and mandatory related-work citation. Minority Sentinel is our strongest external evidence that (a) the correct-minority-suppression phenomenon is real, prevalent, and quantified (25.5% of divergent cases, 10.0pp margin), (b) post-hoc LLM adjudication fails (NG −1.37%), and (c) aggregation-layer intervention can recover part of the loss with a sufficiently orthogonal signal — all direct support for our motivation and Challenge C. Threat to novelty is Medium: it never re-weights influence *during* debate and grounds nothing in external evidence, so our C1 mechanism and C2 metrics remain distinct; but reviewers may see it as the closest competitor, so the §6 differentiation paragraph must be sharp. Reuse its "first, do no harm" evaluation constraint and per-dataset reporting style as precedents in our own harness; cite its LLM-as-Judge failure wherever we argue that self-referential trust signals are insufficient.
