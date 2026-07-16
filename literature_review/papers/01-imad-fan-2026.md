━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Paper #1
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STATUS: Baseline (B9) | THREAT TO NOVELTY: Low | LAST VERIFIED: 2026-07-17 via full paper text (AAAI proceedings)

Paper Title:
iMAD: Intelligent Multi-Agent Debate for Efficient and Accurate LLM Inference

Authors & Year:
Wei Fan, JinYi Yoon, Bo Ji — 2026

Link:
https://doi.org/10.1609/aaai.v40i1.12345 (AAAI 2026)
arXiv: https://arxiv.org/abs/2511.11306

Summary:
iMAD proposes a token-efficient framework that selectively triggers Multi-Agent Debate (MAD) only when it is likely to correct an initially wrong single-agent answer. It uses a structured self-critique prompt to extract 41 interpretable linguistic and semantic features from the single-agent response, then passes them through a lightweight MLP classifier trained with a novel FocusCal loss (asymmetric focal + confidence penalty + expected calibration error). The classifier decides whether to trigger MAD or keep the single-agent answer. On six QA/VQA datasets, iMAD reduces token usage by up to 92% while improving accuracy by up to 13.5% over full-debate MAD baselines.

Relevant to Our Idea:
Directly relevant as our closest published baseline (B9). iMAD solves an adjacent problem — deciding when to trigger debate for token efficiency — whereas our idea solves the within-debate sycophancy problem via evidence-grounded trust re-weighting. iMAD explicitly does not address whom to trust once debating, which is the exact space our contribution occupies.

Gap / Limitation Noted in Paper:
The paper does not address within-debate agent weighting or sycophantic collapse — it assumes standard majority-vote MAD after triggering. The authors explicitly note their confidence-based gating is orthogonal to debate-internal mechanisms, acknowledging this as separate future work.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Section 2 — Expert Detailed Analysis

### 1. Publication Status & Citation

| Field | Value |
|---|---|
| **Venue** | AAAI 2026 (Oral) — Association for the Advancement of Artificial Intelligence |
| **DOI** | See linked AAAI proceedings |
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
  note={Oral presentation}
}
```

### 2. Core Contribution & Method

iMAD addresses the inefficiency of running full MAD on every query. Their solution: a lightweight binary classifier that reads the single-agent output and decides whether triggering MAD will help.

**Pipeline:**
1. Single agent generates a structured self-critique response (initial CoT + counterargument + confidence scores for both perspectives).
2. 41 interpretable features extracted from this response — surface-level stats, readability scores, POS counts, lexical uncertainty cues (hedging, contrast), confidence misalignment indicators.
3. A 6-layer MLP (200 hidden units each, batch norm, ReLU, dropout 0.2) predicts a debate-triggering score.
4. If score < threshold (τ=0.7), MAD is triggered; otherwise the original answer is kept.

**Training:** The classifier is trained on PubMedQA and GQA (held-out from evaluation) using FocusCal loss:
- *Asymmetric Focal Loss (LAF):* Penalizes overconfident errors (high score, wrong answer) more than underconfident correct ones.
- *Confidence Penalty (LCP):* Penalizes misalignment between predicted score and an auxiliary uncertainty score derived from semantic hesitation features.
- *Expected Calibration Error (ECE):* Regularizes predicted scores toward empirical correctness.

**Architecture:** Uses a two-headed MLP — one head produces the debate-triggering score p, the other produces the uncertainty score u (used only during training via LCP). The LLM confidence score p_LLM is integrated via a logit-space weighted combination.

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
| **MoA (Wang et al., 2025)** | iMAD compares against MoA as B6 baseline; they outperform it in token efficiency |
| **MAD (Liang et al., 2024)** | The vanilla MAD framework iMAD selectively triggers; our idea also builds on MAD |
| **ConsensAgent (Pitre et al., 2025)** | Not cited in iMAD (different subproblem — sycophancy mitigation vs efficiency) |

iMAD also cites the sycophancy diagnosis literature (though it doesn't cite our specific references like Yao et al. directly) and incorporates Du et al. 2023's MAD formulation.

### 9. Relevance to FYDP

★★★★☆

**Justification:** iMAD is a direct baseline (B9) with a published, citable AAAI Oral paper. It occupies the closest adjacent space to our work (selective MAD) but does not overlap with our core contribution (within-debate trust calibration). Its self-critique prompting approach and FocusCal loss are worth studying as potential inspiration for our confidence gate design. The paper is essential reading for the team and mandatory in our related work section as "the efficiency-focused branch of MAD optimization."
