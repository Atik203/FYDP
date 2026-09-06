# 📄 Paper #8 — FREE-MAD (Cui et al.)

![Paper](https://img.shields.io/badge/Paper-%238-1f6feb?style=for-the-badge)
![Role](https://img.shields.io/badge/Role-Competitor%20(consensus--free)-c9510c?style=for-the-badge)
![Threat](https://img.shields.io/badge/Threat%20to%20Novelty-Medium-c9510c?style=for-the-badge)
![Venue](https://img.shields.io/badge/Venue-ACL%202026%20(Findings)-6e40c9?style=for-the-badge)
![Verified](https://img.shields.io/badge/Verified-2026--09--05-8957e5?style=for-the-badge)

> *Verified via full paper text (ACL Anthology PDF, 21 pages).*

Paper Title:
FREE-MAD: Consensus-Free Multi-Agent Debate

Authors & Year:
Yu Cui, Hang Fu, Haibin Zhang, Licheng Wang, Cong Zuo — 2026

Link:
https://aclanthology.org/2026.findings-acl.1600.pdf (Findings of ACL 2026, pp. 31977–31997)

Summary:
FREE-MAD drops the consensus requirement entirely. Debate uses an anti-conformity CoT prompt (agents change beliefs only on clear error evidence, β(p) negative), and the decision uses a deterministic score dictionary over the full answer matrix A ∈ R^{N×(R+1)}: abandoned answers lose weight, newly adopted answers gain weight scaled by round-decay factor f, with weights W = {20, 25, 30, 20}. Across eight benchmarks (GSM-Ranges, AIME2024/2025, MATH500, StrategyQA, Logical Fallacies, AICrypto) with N=3–4 Qwen/DeepSeek agents, FREE-MAD-N reaches 64.43% average at R=1 (≈ +16–19% over SoM baselines 55.73%/54.06%), needs one round where baselines need two, and resists communication-attack accuracy drops (baselines −20%, FREE-MAD flat or better). Two variants cover anti-conformity (N) and conformity (C) debate modes.

Relevant to Our Idea:
Closest published alternative that also rejects majority voting — but replaces it with trajectory scoring over peer-text shifts, not with external evidence verification or persistent per-agent trust. Our FYDP keeps debate but re-weights who counts via a bounded trust score from retrieved literature; FREE-MAD keeps who counts equal but re-weights which trajectory steps count via internal opinion-shift weights. Cite as the consensus-free competitor that still lacks evidence grounding and is vulnerable to self-reported shift gaming.

Gap / Limitation Noted in Paper:
The authors state token overhead still exceeds single-model inference, only two sub-schemes are evaluated under resource limits, and on knowledge-poor tasks anti-conformity turns random (FREE-MAD-C beats N there). From our perspective, shift-based scores reward changing answers regardless of evidence, and the deterministic scorer never checks claims against retrieved sources.

---

## Section 2 — Expert Detailed Analysis

### Q1–Q9 Quick Reference

| # | Question | Short Answer |
|---|---|---|
| Q1 | What problem and why important? | Consensus debate wastes tokens, propagates errors via conformity, and breaks ties randomly — plus collapses under communication attacks. |
| Q2 | What data (source, size, splits, ethics)? | 8 sets: GSM-Ranges L4/L6, AIME2024/2025, MATH500, StrategyQA, MMLU Logical Fallacies, AICrypto MCQs. No ethics discussion. |
| Q3 | What features/inputs, how engineered? | Full answer matrix A over rounds; opinion-shift events (abandon vs adopt) weighted by W and round-decay f; ADA-style CoT anti-conformity prompt. |
| Q4 | What methods/models, overall pipeline? | Formal Debate/Decide split (Eq. 1–4, conformity β(p)) → anti-conformity debate (N) or conformity (C) → score-dictionary aggregation (Alg. 1), tie-break random. |
| Q5 | What baselines and why chosen? | SoM (Du et al. 2024) Baseline 1/2 with majority vote or LLM-judge; 4-way ablation (Table 2) isolates debate mode × decision rule. |
| Q6 | How evaluated (metrics, setup, tests)? | Accuracy + token consumption TC (Eq. 6); R=1 vs R=2; communication-attack robustness (Fig 4); ablations FREE-MAD-N/C vs baselines. |
| Q7 | Key results vs baselines? | R=1 avg 64.43% (N) / 61.41% (C) vs 55.73%/54.06%; one FREE-MAD round ≈ two baseline rounds; attack drops baselines 20%, FREE-MAD holds. |
| Q8 | Limitations and biases? | Still costlier than single model; knowledge-poor tasks favour conformity variant; random tie-break on score ties. |
| Q9 | Code/data/artifacts available? | Code: https://github.com/jonathansantilli/freemad (industrial-grade reimplementation, per Acknowledgments). Benchmarks public. |

### 1. Publication Status & Citation

| Field | Value |
|---|---|
| **Venue** | Findings of ACL 2026, pp. 31977–31997 (July 2–7, 2026) |
| **PDF date** | 2026-06-09, 21 pages, pdfTeX-1.40.29 |
| **Last verified** | 2026-09-05 — confirmed via ACL Anthology PDF footer + full text |
| **Code** | https://github.com/jonathansantilli/freemad |

**BibTeX:**
```bibtex
@inproceedings{cui2026freemad,
  title={{FREE-MAD}: Consensus-Free Multi-Agent Debate},
  author={Cui, Yu and Fu, Hang and Zhang, Haibin and Wang, Licheng and Zuo, Cong},
  booktitle={Findings of the Association for Computational Linguistics: ACL 2026},
  pages={31977--31997},
  year={2026},
  url={https://aclanthology.org/2026.findings-acl.1600.pdf}
}
```

### 2. Core Contribution & Method

MAD is formalised as Debate(a^N, q, p, R) → Decide(r^R_N) with agent sampling P_{a_i}(r|C(k−1),p) = P_in·exp(β(p)·S_con)/Z (Eq. 4): independent reasoning times conformity pressure. Anti-conformity prompting drives β(p) negative so agents audit peers rather than echo them. The score dictionary S tracks every cell of A: initial answers seed scores with w1·f, abandoned answers are down-weighted, newly adopted answers up-weighted with w2/w3·f decaying in round number; argmax S wins, random on ties (Alg. 1). FREE-MAD-N (anti-conformity) and FREE-MAD-C (conformity) share the scorer.

### 3. Key Results (Extracted)

| Condition (R=1) | FREE-MAD-N | FREE-MAD-C | Baseline 1 (SoM) | Baseline 2 |
|---|---|---|---|---|
| Average over 8 sets | **64.43%** | 61.41% | 55.73% | 54.06% |
| Math-heavy (harder = bigger gap) | wins grow with difficulty | C beats N on knowledge-poor | — | — |
| R=1 vs R=2 baselines | R=1 ≈ baseline R=2 | same | needs 2–3 rounds | — |
| Under communication attack | holds / slightly up | holds | **−20%** | **−20%** |

- Figure 1: majority vote on final round can score below initial independent answers (Samples 1–3, incl. no-majority random tie-break).
- Figure 5: token-vs-accuracy frontier favours FREE-MAD-N on accuracy, FREE-MAD-C on scalability.
- Supplement ablation: scorer alone beats debate-mode swap — decision rule matters more than prompt mode.

### 4. Paper's Self-Admitted Limitations

From the paper directly (Section 8): token overhead still exceeds single-model inference; only N/C sub-schemes evaluated for resource reasons; anti-conformity needs task-dependent tuning (too stubborn on weak models, too random on knowledge-poor tasks).

### 5. Direct Comparison to Our Idea

| Dimension | FREE-MAD | Our Idea |
|---|---|---|
| **Problem** | Consensus costs tokens, propagates conformity errors | Wrong-majority collapse under social pressure |
| **Signal source** | Internal opinion shifts across rounds | External retrieved passages per claim |
| **Mechanism** | Anti-conformity prompt + trajectory score dict | Bounded trust score + trust-weighted aggregation |
| **Trust basis** | None per-agent; answers scored, agents equal | Per-agent persistent trust from verdicts |
| **Vulnerability** | Shift gaming (change = reward); random tie-breaks | Retrieval sparsity / noise |
| **Target metric** | Accuracy + tokens + attack robustness | CCR/MPR/ECR + accuracy under injection |

**Overlap with C1:** Low. No trust state, no retrieval; our C1 adds both.
**Overlap with C2:** Medium. Their communication-attack protocol is the closest existing stress test to our injection harness — cite and differentiate (attack drops messages vs injection fabricates consensus).

### 6. Our Positioning Strategy

| Role | Detail |
|---|---|
| **In our paper** | Competitor (consensus-free) — the paper that also abandons voting |
| **How we cite** | As the ACL 2026 Findings method that fixes conformity by scoring trajectories, not by verifying evidence |
| **Relationship** | Adjacent solution — same enemy (conformity/majority), different weapon (shift scores vs evidence trust) |

**Pre-emptive rebuttal paragraph** (if a reviewer asks "how is this different from FREE-MAD?"):
> FREE-MAD removes consensus and scores answer trajectories: answers agents abandon score low, answers they adopt score high. That rewards changing answers whether or not the change is evidence-backed, and ties break randomly. Our framework instead verifies each claim against retrieved literature and carries the verdicts in a bounded per-agent trust score into a trust-weighted final answer with citations. Trajectory scoring asks what moved; trust calibration asks what is supported — and returns the evidence with the answer.

### 7. Code & Reproducibility

| Field | Detail |
|---|---|
| **Repo** | https://github.com/jonathansantilli/freemad |
| **Models used** | Qwen1.5-7B-Chat, Qwen2.5-72B-Instruct, DeepSeek-V3 (N=3 AIME, N=4 others) |
| **Compute** | Token-consumption TC reported (Eq. 6); no GPU-hour totals |
| **Key challenge for replication** | Tuning W = {20,25,30,20} and decay f per task; anti-conformity prompt in Appendix E |

### 8. Cross-References

| Paper in this review | Relationship |
|---|---|
| **Debate or Vote (Choi et al., 2025)** | Choi et al. say neutral debate ≈ voting; FREE-MAD is one concrete correction-bias that beats voting. |
| **ConsensAgent (Pitre et al., 2025)** | Prompt-rewriting vs anti-conformity prompting; both text-level, neither evidence-grounded. |
| **Estornell & Liu (2024)** | Pruning responses vs scoring trajectories — two internal-signal fixes, neither with retrieval. |
| **MoA (Wang et al., 2025)** | Static layered aggregation FREE-MAD explicitly improves on for robustness. |

### 9. Relevance to FYDP

★★★★☆

**Justification:** Essential consensus-free baseline for Chapter 2 related work and Chapter 4 baselines. Its attack-robustness protocol informs our injection design, while its evidence-free scoring sharpens our differentiation paragraph.
