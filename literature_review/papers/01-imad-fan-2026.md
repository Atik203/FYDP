━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Paper #1
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STATUS: Baseline (B9) | THREAT TO NOVELTY: Low | LAST VERIFIED: 2026-07-17 via full paper text (AAAI proceedings)

Paper Title:
iMAD: Intelligent Multi-Agent Debate for Efficient and Accurate LLM Inference

Authors & Year:
Wei Fan, JinYi Yoon, Bo Ji — 2026

Link:
https://doi.org/10.1609/AAAI.V40I35.40181 (AAAI 2026, Oral)
arXiv: https://arxiv.org/abs/2511.11306

Summary:
iMAD proposes a token-efficient framework that selectively triggers Multi-Agent Debate (MAD) only when it is likely to correct an initially wrong single-agent answer. To achieve this, it prompts a single agent to produce a structured self-critique response containing an initial Chain-of-Thought (CoT) justification, a forced self-critique presenting a plausible alternative, and confidence scores for both perspectives. From this structured output, the system extracts 41 interpretable linguistic and semantic features that capture human-understandable hesitation cues. These features are processed by a lightweight MLP classifier trained using a novel Confidence-Calibrated FocusCal loss (comprising Asymmetric Focal Loss, Confidence Penalty, and Expected Calibration Error) to predict debate necessity. Across six QA and VQA datasets, iMAD dramatically reduces token usage by up to 92% while improving final answer accuracy by up to 13.5% over full-debate baselines.

Relevant to Our Idea:
iMAD is directly relevant as our closest published, efficiency-focused baseline (B9). While iMAD effectively optimizes token efficiency by deciding when to trigger a debate, it does not address whom to trust once a multi-agent debate is active, relying instead on standard majority-vote aggregation. This leaves the system vulnerable to sycophantic consensus collapse, where a correct minority agent is pressured into agreeing with a confidently wrong majority. Our FYDP project directly addresses this gap by introducing a dynamic, evidence-grounded numeric trust re-weighting mechanism that scales agent influence based on external, real-time scientific evidence retrieval rather than self-reported confidence signals.

Gap / Limitation Noted in Paper:
The authors note that the iMAD classifier is trained offline on static auxiliary datasets and remains fixed during deployment, making it unable to adapt to model behavior drift or domain shifts. They also highlight black-box API constraints as a bottleneck, leaving token-by-token monitoring during active generation (streaming) as future work. From our perspective, the framework's reliance on standard majority vote once triggered highlights a critical, unaddressed vulnerability to sycophantic collapse that our dynamic trust update mechanism is designed to solve.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Section 2 — Expert Detailed Analysis

### Q1–Q9 Quick Reference

| # | Question | Short Answer |
|---|---|---|
| Q1 | What problem and why important? | MAD is accurate but token-expensive; iMAD selectively triggers debate only when it will likely correct a wrong single-agent answer, saving up to 92% tokens. |
| Q2 | What data (source, size, splits, ethics)? | 6 datasets: MEDQA, MMLU, GSM8K, OKVQA, VQA-v2, ScienceQA. Classifier trained on PubMedQA + GQA (held-out from eval). No ethics/consent discussion (public benchmarks). |
| Q3 | What features/inputs, how engineered? | 41 interpretable linguistic + semantic features from a structured self-critique response: surface stats, readability, POS counts, hedging/contrast cues, confidence misalignment indicators. |
| Q4 | What methods/models, overall pipeline? | (1) Single-agent → structured self-critique; (2) 41-feature extraction; (3) 6-layer MLP (200 units, BN, ReLU, dropout 0.2) predicts debate score p; (4) if p < 0.7 → trigger 3-agent MAD, else keep original answer. Trained with FocusCal loss (Asymmetric Focal + Confidence Penalty + ECE). |
| Q5 | What baselines and why chosen? | CoT (single-agent), SC (self-consistency ×5), MAD (full debate every query), GD (GroupDebate 5 agents), DOWN (confidence-threshold gating). Covers single-agent → full-debate → selective-debate spectrum. |
| Q6 | How evaluated (metrics, setup, tests)? | Accuracy + token cost per dataset. Beneficial decision rate (✗→✓ / ✓→✗ breakdown). No statistical significance tests. No user studies. |
| Q7 | Key results vs baselines? | iMAD matches or exceeds MAD accuracy on 5/6 datasets (e.g., GSM8K: 84.8% vs MAD 76.4%) while using 57–70% fewer tokens. Max 92% reduction vs GD. Up to 95.9% beneficial decision rate. |
| Q8 | Limitations and biases? | Classifier trained offline (no adaptation); 41 hand-crafted features may miss cues; no within-debate intervention (majority vote only); fails on short/factual MMLU questions with few hesitation cues. |
| Q9 | Code/data/artifacts available? | Code: https://github.com/Fanwei100/iMAD (PyTorch, Gemini API). No dataset releases (all public benchmarks). License not explicitly stated. |

### 1. Publication Status & Citation

| Field | Value |
|---|---|
| **Venue** | AAAI 2026 (Oral) — Association for the Advancement of Artificial Intelligence |
| **DOI** | 10.1609/AAAI.V40I35.40181 (verified via DBLP, 2026-07-17) |
| **arXiv** | 2511.11306v2 |
| **Last verified** | 2026-07-17 — confirmed via paper copyright notice ("Copyright © 2026, AAAI") and conference listing |
| **Code** | https://github.com/Fanwei100/iMAD |

**BibTeX:**
```bibtex
@inproceedings{fan2026imad,
  title={{iMAD}: Intelligent Multi-Agent Debate for Efficient and Accurate {LLM} Inference},
  author={Fan, Wei and Yoon, JinYi and Ji, Bo},
  booktitle={Proceedings of the 40th AAAI Conference on Artificial Intelligence (AAAI)},
  year={2026},
  doi={10.1609/AAAI.V40I35.40181},
  note={Oral presentation}
}
```

### 2. Core Contribution & Method

iMAD addresses the inefficiency of running full MAD on every query. Their solution: a lightweight binary classifier that reads the single-agent output and decides whether triggering MAD will help.

**Pipeline:**
1. Single agent generates a structured self-critique response (initial CoT + counterargument + confidence scores for both perspectives).
2. 41 interpretable features extracted from this response — surface-level stats, readability scores, POS counts, lexical uncertainty cues (hedging, contrast), confidence misalignment indicators.
3. A 6-layer MLP (200 hidden units each, batch norm, ReLU, dropout 0.2) predicts a debate-triggering score.
4. The classifier outputs a triggering score p. When p < τ (τ=0.7), MAD is triggered; otherwise the original answer is kept. Note the direction: a *low* score means the self-critique showed hesitation/uncertainty, so debate is triggered — a *high* score means the answer looks settled, so debate is skipped.

**Training:** The classifier is trained on PubMedQA and GQA (held-out from evaluation) using FocusCal loss:
- *Asymmetric Focal Loss (LAF):* Penalizes overconfident errors (high score, wrong answer) more than underconfident correct ones.
- *Confidence Penalty (LCP):* Penalizes misalignment between predicted score and an auxiliary uncertainty score derived from semantic hesitation features.
- *Expected Calibration Error (ECE):* Regularizes predicted scores toward empirical correctness.

**Architecture (formal):** A shared MLP encoder f_e(z) feeds two heads — a correctness head f_p and a hesitation head f_u — producing logits ℓ_p and ℓ_u. The two output scores are:
- p := σ(w₁·ℓ_LLM + w₂·ℓ_p + ε) — the debate-triggering score, fusing the scalar LLM self-reported confidence ℓ_LLM with the MLP logit ℓ_p in logit space (w₁, w₂, ε are learnable).
- u := σ(ℓ_u) — the auxiliary uncertainty/hesitation score, used only during training via L_CP.

**FocusCal loss (formal):** L_FC = L_AF + λ·L_CP + μ·ECE (λ, µ tuned by grid search on held-out validation).
- *Asymmetric Focal Loss:* L_AF = −α₁(1−p)^γ log(p) if y=1; −α₀ p^γ log(1−p) if y=0. Focusing parameter γ down-weights easy cases; class weights set α₀ > α₁ so a *high p on a wrong answer* (y=0 — debate skipped when it was needed) is penalized hardest.
- *Confidence Penalty (piecewise):* L_CP = u² if (y=0 and p>τ); (1−u)² if (y=1 and p<τ); 0 otherwise. Penalizes overconfidence on wrong answers and under-confidence on correct ones — the term that aligns p with semantic hesitation.
- *ECE:* regularizes p toward empirical bin-wise correctness.

Labels: y=1 if the single-agent answer matches ground truth, else y=0. The goal is *not* to reproduce y but to flag *recoverable* errors (wrong but fixable by debate); confidently-wrong-but-unrecoverable cases are deliberately left with low trigger priority.

### 3. Key Results (Extracted)

| Dataset | CoT Acc | MAD Acc | iMAD Acc | MAD Tokens | iMAD Tokens | Token Saved |
|---|---|---|---|---|---|---|
| MEDQA | 76.6 | 81.9 | **82.0** | 4,034 | **1,300** | 68% |
| MMLU | 86.8 | 89.5 | **89.2** | 3,348 | **1,010** | 70% |
| GSM8K | 71.3 | 76.4 | **84.8** | 3,446 | **1,025** | 70% |
| OKVQA | 88.3 | 89.8 | **90.3** | 7,803 | **2,601** | 67% |
| VQA-v2 | 77.5 | 81.0 | **81.3** | 8,796 | **3,489** | 60% |
| ScienceQA | 86.0 | 89.4 | **90.8** | 6,777 | **2,893** | 57% |

- Max token reduction: **92%** vs GroupDebate (GD) on MEDQA.
- Max accuracy improvement: **+13.5%** over CoT on GSM8K.
- The classifier's beneficial decision rate: up to **95.9%** (Table 4).
- When triggering debate, iMAD successfully recovers 7.1% (MEDQA) to 16.2% (GSM8K) of initially wrong answers — approaching the MAD upper bound.

**Notable limitation for our comparison:** Their classifier skips debate in 3.5% of cases where it would help (MMLU near-miss) and triggers unnecessarily in ~5–10% of cases, showing the inherent limitation of a feature-based gating approach.

**Baselines used (5, not including MoA).** iMAD is evaluated against exactly five baselines across three categories — this is the authoritative list for our related-work section:

| Category | Baseline | Notes |
|---|---|---|
| Single-agent | **CoT** (Wei et al. 2022) | Chain-of-Thought, one pass |
| Single-agent | **SC** (Self-Consistency, Wang et al. 2023) | CoT sampled ×5, majority vote |
| Full-debate MAD | **MAD** (Liang et al. 2024) | 3 agents, distinct personas, debate every query |
| Full-debate MAD | **GD** (GroupDebate, Liu et al. 2024) | 5 agents clustered into subgroups, 3 rounds inter-group consensus |
| Selective MAD | **DOWN** (Eo et al. 2025) | Confidence-threshold gating; τ=0.8; *requires labeled eval data to tune* |

*MoA is discussed in related work but is NOT an experimental baseline in iMAD — do not cite it as such.*

**DOWN — iMAD's closest competitor (directly supports our Challenge C).** DOWN is the only other *selective* MAD method: it triggers debate when the LLM's self-reported confidence score falls below a tuned threshold (0.8). iMAD's published critique of DOWN is, in effect, a third-party endorsement of our thesis that self-reported confidence is an unreliable trust signal:
- iMAD (line ~895): confidence scores "are often overconfident even when the answer is incorrect," so DOWN "frequently skips debate on instances where additional debate would be beneficial."
- On OKVQA, DOWN's accuracy stays near the single-agent baseline — it fails to identify recoverable errors.
- DOWN also violates the zero-shot assumption (needs labeled data to tune its threshold); iMAD uses a fixed classifier with no dataset-specific tuning and still beats DOWN by ~4.1% average accuracy under the stricter protocol.
- Efficiency framing: DOWN and iMAD have comparable token cost and much higher ApT (accuracy-per-100k-tokens) than full-debate MAD/GD; iMAD has slightly lower ApT than DOWN (53.9 vs 58.6) because it correctly triggers *more* of the debates that actually matter.

*Why this matters for us:* DOWN is the published precedent for "confidence-threshold-gated debate," and iMAD's own data shows why that signal is weak. Our evidence-grounded trust re-weighting targets exactly this failure — cite the iMAD-vs-DOWN result as external evidence that self-reported confidence is manipulable/unreliable (Challenge C).

### 4. Paper's Self-Admitted Limitations

From the paper directly:

1. **Generalization boundary:** "The only exception is MMLU, where MAD performs slightly better… the classifier skips debate in 3.5% of questions where it would help and 3.4% where a triggered debate fixes an error. This is because many MMLU questions are short and factual across diverse domains, wrong single-agent answers often sound fluent and confident, giving few hesitation cues."

2. **No within-debate intervention:** The paper is explicitly about triggering only — standard majority vote is used once debate runs. They do not claim to address sycophancy or trust weighting.

3. **Training data dependence:** The classifier must be trained on held-out datasets (PubMedQA, GQA) with ground-truth labels, creating a dependency that may not hold in truly zero-shot deployment across arbitrary domains.

4. **Feature engineering ceiling:** Their 41 manually-designed features may not capture all hesitation cues — the paper frames this as an accepted limitation with future work on learned representations.

5. **Future work (Appendix D):** "Exploring adaptive or online learning approaches to reduce labeling costs during classifier training and further improve generalization."

### 5. Direct Comparison to Our Idea

| Dimension | iMAD | Our Idea |
|---|---|---|
| **Problem** | *When* to trigger debate (efficiency) | *How* to weight agents within debate (sycophancy mitigation) |
| **Signal source** | Linguistic features + confidence scores from single-agent output | External evidence retrieval against scientific literature |
| **Mechanism** | Binary gating classifier → trigger or skip MAD | Continuous trust update within debate rounds TCM |
| **Trust basis** | Self-reported confidence + learned hesitation features | Externally verified claim correctness |
| **Vulnerability** | Overconfident wrong answers can fool the gate (self-reported signal) | Evidence noise / sparsity on niche topics |
| **Target metric** | Token efficiency + accuracy | Sycophantic collapse (CCR/MPR/ECR) + accuracy |

**Overlap with C1 (trust mechanism):** Minimal. iMAD has no trust mechanism — it uses majority vote within debate. Our trust-calibrated aggregation (C1) is entirely novel relative to this work.

**Overlap with C2 (evaluation harness):** Moderate. iMAD's evaluation methodology (accuracy + token cost broken down by ✗→✓/✓→✗ categories) is a useful precedent, and their breakdown tables (Table 2, Table 4) are a model for how we should report our own injection-based results. However, our CCR/MPR/ECR metrics are specifically designed to measure sycophantic collapse, which iMAD does not measure at all.

**Key divergence:** iMAD's confidence-based gating uses self-reported signals that can be manipulated by the very social pressure dynamics our work targets — this is not a vulnerability for their use case (efficiency), but it means their approach cannot be extended to solve ours.

### 6. Our Positioning Strategy

| Role | Detail |
|---|---|
| **In our paper** | Baseline B9 — iMAD represents the efficiency-focused approach to MAD |
| **How we cite** | As a published (AAAI 2026 Oral) reference that optimizes *whether* to debate, not *whom* to trust once debating |
| **Relationship** | Complementary, not competitive — iMAD solves a different subproblem |

**Pre-emptive rebuttal paragraph** (if a reviewer asks "how is this different from iMAD?"):
> iMAD addresses an orthogonal problem to our work: token-efficient debate triggering. Their classifier decides *whether* a debate should occur based on linguistic hesitation cues in the single-agent output. Ours addresses what happens *during* the debate — specifically, how to prevent sycophantic collapse when it does occur. iMAD uses self-reported confidence signals we explicitly identify as vulnerable to social-pressure manipulation (our Challenge C); our mechanism grounds trust in external, independently retrievable evidence. The two approaches are complementary: iMAD could serve as our confidence gate (§4.1), while our trust-calibrated aggregation replaces their standard majority vote within triggered debates.

### 7. Code & Reproducibility

| Field | Detail |
|---|---|
| **Repo** | https://github.com/Fanwei100/iMAD |
| **Language** | Python (PyTorch for MLP, Gemini API for LLM) |
| **LLM used** | Gemini 2.0 Flash (primary), also GPT-5 nano, Qwen 3.0 |
| **Compute** | Single NVIDIA RTX 4090 for MLP training |
| **License** | Not explicitly stated in repo — assumed MIT or research-use |
| **Reimplementation effort** | They estimate ~10 working days for faithful reimplementation in their own text; we estimate similar for our B9 baseline |
| **Key challenge for replication** | Reproducing the 41 hand-crafted features exactly and the FocusCal loss formulation; the self-critique prompt design is also critical |

### 8. Cross-References

| Paper in this review | Relationship |
|---|---|
| **MoA (Wang et al., 2025)** | Discussed in iMAD's related work as a hierarchical multi-agent method, but **not** used as an experimental baseline. Do not cite iMAD as evaluating against MoA — its five baselines are CoT, SC, MAD, GD, DOWN (see §3 baseline table). |
| **MAD (Liang et al., 2024)** | The vanilla three-persona MAD framework iMAD selectively triggers, and one of its baselines; our idea also builds on this MAD formulation. |
| **DOWN (Eo et al., 2025)** | iMAD's closest competitor — the confidence-threshold selective-debate baseline. See the "DOWN" block in §3 for why this is our highest-value citation from this paper. |
| **ConsensAgent (Pitre et al., 2025)** | Not cited in iMAD (different subproblem — sycophancy mitigation vs efficiency). |

iMAD also cites the sycophancy diagnosis literature (though it doesn't cite our specific references like Yao et al. directly) and builds on the Liang et al. 2024 MAD formulation.

### 9. Relevance to FYDP

★★★★☆

**Justification:** iMAD is a direct baseline (B9) with a published, citable AAAI Oral paper. It occupies the closest adjacent space to our work (selective MAD) but does not overlap with our core contribution (within-debate trust calibration). Its self-critique prompting approach and FocusCal loss are worth studying as potential inspiration for our confidence gate design. The paper is essential reading for the team and mandatory in our related work section as "the efficiency-focused branch of MAD optimization."
