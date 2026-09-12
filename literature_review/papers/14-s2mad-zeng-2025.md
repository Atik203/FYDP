# 📄 Paper #14 — S²-MAD (Selective Sparse Multi-Agent Debate)

![Paper](https://img.shields.io/badge/Paper-%2314-1f6feb?style=for-the-badge)
![Role](https://img.shields.io/badge/Role-Context%20(efficiency)-6e40c9?style=for-the-badge)
![Threat](https://img.shields.io/badge/Threat%20to%20Novelty-Low-2ea043?style=for-the-badge)
![Venue](https://img.shields.io/badge/Venue-NAACL%202025%20(Long)-6e40c9?style=for-the-badge)
![Verified](https://img.shields.io/badge/Verified-2026--09--12-8957e5?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-not%20read%20yet-d29922?style=for-the-badge)

> *Status: queued to read — draft compiled from the NAACL 2025 camera-ready PDF; not yet read by the team. Update after reading.*

Paper Title:
S²-MAD: Breaking the Token Barrier to Enhance Multi-Agent Debate Efficiency

Authors & Year:
Yuting Zeng, Weizhe Huang, Lei Jiang, Tongxuan Liu, XiTai Jin, Chen Tianying Tiana, Jing Li, Xiaohua Xu — 2025

Link:
https://aclanthology.org/2025.naacl-long.475/ (NAACL 2025 Long Papers, pp. 9393–9408)

Summary:
S²-MAD (Selective Sparse Multi-Agent Debate) attacks MAD's token cost with a grouping + sparsification scheme. Agents compute similarity among viewpoints (regex answer matching or BERT-base-uncased cosine similarity), filter redundant outputs, and only participate when their view differs (conditional participation). A decision-making mechanism evaluates intra- and inter-group viewpoint alignment, with early termination when groups converge and majority vote only if divergence remains. Across mathematical/logical reasoning tasks with GPT-3.5-turbo-0301, GPT-4-0613, and Llama-3.1-8B-Instruct, S²-MAD keeps accuracy comparable to full MAD/S-MAD/GroupDebate while substantially cutting total token cost (reported up to ~94.5% reduction vs MAD with <2% performance degradation — verify exact figures on read).

Relevant to Our Idea:
S²-MAD is the strongest efficiency-focused comparator alongside iMAD (our B9). Conceptually, its redundancy filtering resembles our confidence gate and K=3 round cap — but it operates purely on textual/answer similarity, not evidence support. It sharpens our differentiation: these methods optimize the *cost* of reaching consensus, while we optimize the *correctness* of consensus; and it gives us a published citation for why similarity ≠ correctness (two agents agreeing on the same wrong answer look perfectly "redundant" and get pruned identically to a correct pair).

Gap / Limitation Noted in Paper:
Redundancy pruning has no concept of correctness: agents converging on the same wrong answer are pruned exactly like agents correctly agreeing, so the method cannot distinguish efficient correct convergence from efficient sycophantic collapse. Claims are never verified against external evidence.

---

## Section 2 — Expert Detailed Analysis

### Q1–Q9 Quick Reference

| # | Question | Short Answer |
|---|---|---|
| Q1 | What problem and why important? | MAD's accuracy gains come with prohibitive token costs as agents/rounds grow; redundant exchanges dominate. |
| Q2 | What data (source, size, splits, ethics)? | Five representative mathematical/logical reasoning tasks including GSM8K and MATH; public benchmarks, zero-shot. |
| Q3 | What features/inputs, how engineered? | Viewpoint similarity via (a) regex answer extraction + matching, or (b) embedding cosine similarity (BERT-base-uncased); group summaries between stages. |
| Q4 | What methods/models, overall pipeline? | Grouping Discussion (stage-wise, summary per group) + Decision-Making Mechanism (Similarity Calculation → Redundancy Filtering → Conditional Participation) + early termination; forgetting mechanism keeps only previous-round outputs. |
| Q5 | What baselines and why chosen? | CoT, CoT-SC, MAD, Sparse MAD (S-MAD, Li et al. 2024), GroupDebate (GD) — spans single-agent → full debate → sparse debate. |
| Q6 | How evaluated (metrics, setup, tests)? | Total token cost + accuracy across model/agent-count/round/group configurations; similarity-method comparison (regex vs cosine); zero-shot. |
| Q7 | Key results vs baselines? | Comparable accuracy to MAD/S-MAD/GD with large token-cost reductions (reported up to ~94.5% vs MAD, <2% degradation — confirm on read); consistent across GPT-3.5, GPT-4, Llama-3.1-8B. |
| Q8 | Limitations and biases? | No correctness signal — redundancy ≠ wrongness; similarity thresholds (ε) are hyperparameters; early termination can lock in a wrong consensus; math/logic tasks only. |
| Q9 | Code/data/artifacts available? | Verify on read (NAACL camera-ready; check appendix for repo). |

### 1. Publication Status & Citation

| Field | Value |
|---|---|
| **Venue** | NAACL 2025 — Human Language Technologies (Volume 1: Long Papers) |
| **Pages** | 9393–9408 |
| **DOI** | 10.18653/v1/2025.naacl-long.475 |
| **ISBN** | 979-8-89176-189-6 |
| **Last verified** | 2026-09-12 — ACL Anthology landing page (authors, pages, venue) |

**Proposed BibTeX (to add to `fydp.bib` after reading):**
```bibtex
@inproceedings{zeng2025s2mad,
  title = {{S}$^2$-{MAD}: Breaking the Token Barrier to Enhance Multi-Agent Debate Efficiency},
  author = {Zeng, Yuting and Huang, Weizhe and Jiang, Lei and Liu, Tongxuan and Jin, XiTai and Tiana, Chen Tianying and Li, Jing and Xu, Xiaohua},
  editor = {Chiruzzo, Luis and Ritter, Alan and Wang, Lu},
  booktitle = {Proceedings of the 2025 Conference of the Nations of the Americas Chapter of the Association for Computational Linguistics: Human Language Technologies (Volume 1: Long Papers)},
  month = apr,
  year = {2025},
  address = {Albuquerque, New Mexico},
  publisher = {Association for Computational Linguistics},
  pages = {9393--9408},
  doi = {10.18653/v1/2025.naacl-long.475},
  url = {https://aclanthology.org/2025.naacl-long.475/}
}
```

### 2. Core Contribution & Method

1. **Grouping discussion** — agents are grouped; each group summarizes its viewpoints at stage boundaries.
2. **Similarity calculation** — regex answer matching (primary) or BERT-base cosine similarity over responses (analysis).
3. **Redundancy filtering** — outputs similar to own/previous viewpoints are discarded before being considered.
4. **Conditional participation** — an agent joins the debate only when divergent viewpoints exist within/across groups; silence otherwise.
5. **Reaching consensus** — early termination when summarized viewpoints align; majority vote only if divergence persists.
6. **Token-cost formalization** — equations for per-round and total cost showing when sparsification reduces complexity to GroupDebate-like levels (only when disagreements persist, probability `p^MN`).

### 3. Key Results (Extracted)

| Finding | Detail |
|---|---|
| Headline | Comparable accuracy at much lower token cost vs MAD/S-MAD/GroupDebate |
| Reported reduction | Up to ~94.5% vs MAD with <2% degradation (verify exact table values on read) |
| Models | GPT-3.5-turbo-0301, GPT-4-0613, Llama-3.1-8B-Instruct |
| Configs | Varying #agents/#rounds/group strategies, e.g., (5,4) = 5 agents, 4 rounds; CoT-SC(40) |
| Similarity methods | Regex vs cosine comparison in analysis |
| Exact tables | **Verify on read** |

### 4. Paper's Self-Admitted Limitations

- Similarity is a proxy for information novelty, not correctness.
- Thresholds (ε) and grouping choices are hyperparameters with limited sensitivity analysis.
- Early termination can cement a wrong consensus.
- Evaluated on math/logic tasks with objective answers; open-ended scientific QA untested.

### 5. Direct Comparison to Our Idea

| Dimension | S²-MAD | Our Idea |
|---|---|---|
| **Goal** | Cut token cost of debate | Prevent sycophantic collapse (correctness of consensus) |
| **Novelty signal** | Text/answer similarity | Evidence verification per atomic claim |
| **Pruning/weighting** | Discard redundant messages | Re-weight agents by evidence-calibrated trust |
| **Failure blind spot** | Efficient wrong consensus indistinguishable | Explicitly targeted |
| **Compatibility** | Could reduce cost of our pipeline (future work) | Orthogonal |

### 6. Our Positioning Strategy

- **In our paper:** group with iMAD as the efficiency branch of MAD optimization; explicitly note similarity-based pruning lacks a correctness notion.
- **How we cite:** "Efficiency methods prune or gate on redundancy (Zeng et al., 2025; Li et al., 2024), which is orthogonal to whether the surviving consensus is evidence-supported — the question our trust mechanism answers."
- **Future work:** combine S²-MAD-style sparsification with our trust update to reduce cost without weakening correction.

### 7. Code & Reproducibility

| Field | Detail |
|---|---|
| **Repo** | Verify on read |
| **Models** | GPT-3.5/GPT-4 APIs + Llama-3.1-8B-Instruct |
| **Reuse for us** | Conditional-participation/early-termination design as a candidate ablation ("adaptive triggering" ablation variant); cosine-similarity instrumentation |

### 8. Cross-References

| Paper in this review | Relationship |
|---|---|
| iMAD (Fan et al., 2026) | Sibling efficiency approach (gating vs sparsification); both leave aggregation trust-blind |
| Sparse Communication Topology (`li-etal-2024-improving-multi`) | S-MAD baseline used here; same "who talks" axis |
| Debate or Vote (Choi et al., 2025) | Neutral debate ≈ voting; pruning changes cost, not the aggregation logic |
| MAST (Cemri et al., 2025, #9) | Premature-consensus / verification failure modes connect to early-termination risk |

### 9. Relevance to FYDP

★★★☆☆

**Justification:** Useful published comparator on the efficiency axis and a clean illustration that redundancy ≠ correctness. Not a novelty threat; contributes to related work and future-work (cost reduction) framing.

### 10. Reading Checklist (fill after team read)

- [ ] Confirm exact token-reduction and accuracy-delta numbers per table
- [ ] Extract similarity threshold/ε and grouping hyperparameters
- [ ] Check repo availability + license
- [ ] Note whether open-ended QA is discussed as future work
