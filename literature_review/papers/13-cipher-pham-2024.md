# 📄 Paper #13 — CIPHER (Let Models Speak Ciphers)

![Paper](https://img.shields.io/badge/Paper-%2313-1f6feb?style=for-the-badge)
![Role](https://img.shields.io/badge/Role-Context%20(communication%20channel)-6e40c9?style=for-the-badge)
![Threat](https://img.shields.io/badge/Threat%20to%20Novelty-Low-2ea043?style=for-the-badge)
![Venue](https://img.shields.io/badge/Venue-ICLR%202024-6e40c9?style=for-the-badge)
![Verified](https://img.shields.io/badge/Verified-2026--09--12-8957e5?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-not%20read%20yet-d29922?style=for-the-badge)

> *Status: queued to read — draft compiled from the ICLR 2024 paper (arXiv v2); not yet read by the team. Update after reading.*

Paper Title:
Let Models Speak Ciphers: Multiagent Debate through Embeddings

Authors & Year:
Chau Pham, Boyi Liu, Yingxiang Yang, Zhengyu Chen, Tianyi Liu, Jianbo Yuan, Bryan A. Plummer, Zhaoran Wang, Hongxia Yang — 2024

Link:
https://arxiv.org/abs/2310.06272 (ICLR 2024)

Summary:
The paper identifies a structural information-loss problem in multi-agent debate: natural-language communication samples one token per step, collapsing the model's full next-token distribution (its belief) into a single discrete symbol. CIPHER (Communicative Inter-Model Protocol through Embedding Representation) instead has agents communicate via the *expected embedding* over the vocabulary, weighted by the token distribution — bypassing tokenization/sampling while leaving model weights untouched. On five reasoning tasks with open-source LLMs of varying sizes, CIPHER outperforms state-of-the-art natural-language debate by 0.5–5.0%. The debate is closed by converting embeddings back via nearest-neighbor search and aggregating (they select the lowest-temperature debater's answer).

Relevant to Our Idea:
CIPHER shows that natural language is an imperfect, lossy channel between debating agents — grounded confidence/uncertainty is destroyed at token sampling, making it easier for confident-sounding surface text to dominate regardless of underlying belief. That is independent evidence for our design choice to source trust from *outside* the linguistic channel entirely: retrieved external evidence rather than anything extracted from agents' generated text or embeddings. It also compounds with DebUnc's attention-scaling limits: both channels are white-box-dependent, while our heterogeneous served models can be closed-weight — our trust signal stays model-agnostic.

Gap / Limitation Noted in Paper:
CIPHER requires white-box access to token probability distributions and raw embeddings, so it cannot run across heterogeneous closed-API models — directly conflicting with our explicit heterogeneous-agent design goal. It also addresses fidelity of transmission, not truthfulness of content: a more faithfully transmitted claim can still be wrong.

---

## Section 2 — Expert Detailed Analysis

### Q1–Q9 Quick Reference

| # | Question | Short Answer |
|---|---|---|
| Q1 | What problem and why important? | Token sampling in NL debate discards the model's full belief distribution; inter-LLM communication is lossy. |
| Q2 | What data (source, size, splits, ethics)? | Five reasoning tasks: GSM8K, Arithmetic, MMLU (High School Math, Professional Psychology, Formal Logic); public benchmarks. |
| Q3 | What features/inputs, how engineered? | No engineered features — agents exchange expected embedding vectors (weighted average over vocabulary) rather than text. |
| Q4 | What methods/models, overall pipeline? | CIPHER debate: prompt embedded → per-round agents generate semantic embeddings by Eq. 2 (expected embedding) → concatenate responses as input to next round → stop on EOS nearest neighbor → convert back and aggregate (lowest-temperature debater). |
| Q5 | What baselines and why chosen? | Natural-language debate (Du et al. style) under comparable settings; single-agent prompting; temperature tuned fairly via Bayesian optimization for both methods. |
| Q6 | How evaluated (metrics, setup, tests)? | Accuracy on five reasoning tasks with multiple open-source models/sizes; temperature sensitivity analysis; extended-scale debate analysis; ablation of CIPHER components. |
| Q7 | Key results vs baselines? | +0.5–5.0% over natural-language debate across five tasks; benefits persist across model sizes/scales; temperature is pivotal and tuned per method. |
| Q8 | Limitations and biases? | White-box only (distributions/embeddings needed); embedding aggregation requires custom inference path; truthfulness is not addressed; natural-language readability lost. |
| Q9 | Code/data/artifacts available? | To verify on read (paper references code in appendix/abstract? — check). |

### 1. Publication Status & Citation

| Field | Value |
|---|---|
| **Venue** | ICLR 2024 (The Twelfth International Conference on Learning Representations) |
| **arXiv** | 2310.06272v2 (submitted 2023-10-10, revised 2024-02-27) |
| **Last verified** | 2026-09-12 — PDF states "Published as a conference paper at ICLR 2024"; authors verified via arXiv |
| **OpenReview ID** | To confirm on read (cite arXiv meanwhile) |

**Proposed BibTeX (to add to `fydp.bib` after reading):**
```bibtex
@inproceedings{pham2024cipher,
  author = {Pham, Chau and Liu, Boyi and Yang, Yingxiang and Chen, Zhengyu and Liu, Tianyi and Yuan, Jianbo and Plummer, Bryan A. and Wang, Zhaoran and Yang, Hongxia},
  title = {Let Models Speak Ciphers: Multiagent Debate through Embeddings},
  booktitle = {The Twelfth International Conference on Learning Representations},
  year = {2024},
  url = {https://arxiv.org/abs/2310.06272}
}
```

### 2. Core Contribution & Method

1. **Diagnosis** — NL debate's token sampling compresses a distribution over the full vocabulary into one token; information (including uncertainty) is lost each step (Figure 2).
2. **CIPHER protocol** — at each step, generate `emb(t) = Σ p_i(t) · emb(vocab_i)` — the expected token embedding under the model's distribution — and feed embeddings directly back into the model without tokenizer decoding.
3. **CIPHER debate loop** — rounds concatenate prompt embedding + all debaters' embedding responses; stop when the generated embedding's nearest neighbor is EOS.
4. **Aggregation** — convert embeddings back to text via nearest neighbor; pick the lowest-temperature debater's response (avoids majority voting issues on open-ended tasks).
5. **Fair comparison** — temperatures chosen per method via Bayesian optimization; Expected-SARSA analogy for the expected-embedding idea.

### 3. Key Results (Extracted)

| Finding | Detail |
|---|---|
| Main result | +0.5–5.0% over NL debate across five reasoning tasks |
| Models | Multiple open-source LLMs of varying sizes |
| Tasks | GSM8K, Arithmetic, MMLU (HS Math, Professional Psychology, Formal Logic) |
| Temperature | Pivotal; tuned via Bayesian optimization for fairness; sensitivity analysis included |
| Aggregation | Lowest-temperature debater; comparable to best performer at lower cost |
| Exact per-task tables | **Verify on read** |

### 4. Paper's Self-Admitted Limitations / Design Constraints

- Requires white-box access (logits/embeddings) — incompatible with closed APIs.
- Added inference complexity (custom generation path, nearest-neighbor decoding).
- No notion of correctness verification — only communication fidelity.
- Embedding-space assumptions (convex hull of tokenizer embeddings) constrain generality.

### 5. Direct Comparison to Our Idea

| Dimension | CIPHER | Our Idea |
|---|---|---|
| **Layer of intervention** | Communication channel (how beliefs are transmitted) | Trust/aggregation (how much each agent counts) |
| **Signal** | Internal token distributions (white-box) | External evidence (retrieval) |
| **Model compatibility** | Open-weight only | Heterogeneous served models (open or closed) |
| **Addresses** | Information loss in debate | Sycophantic collapse / correctness of consensus |
| **Orthogonal?** | Yes — could combine in principle with our trust weighting | Yes |

### 6. Our Positioning Strategy

- **In our paper:** cite in the "why external, non-linguistic trust" argument — even faithful communication says nothing about correctness, and white-box channels don't transfer to heterogeneous deployments.
- **How we cite:** "Improving the fidelity of agent communication (Pham et al., 2024) leaves the correctness of the communicated content unverified; we ground influence in retrieved evidence instead."
- **Pre-emptive rebuttal:** "could better representations solve the problem?" — no: CIPHER improves transmission, not truth; our failure mode persists with perfect transmission of wrong claims.

### 7. Code & Reproducibility

| Field | Detail |
|---|---|
| **Code** | Verify on read (appendix / project page) |
| **Models** | Open-source LLMs (LLaMA-family era) |
| **Reuse for us** | Conceptual only; our pipeline is black-box API-based, so CIPHER is out of scope for implementation |

### 8. Cross-References

| Paper in this review | Relationship |
|---|---|
| DebUnc (Yoffe et al., 2025) | Also white-box internal-signal channel (attention scaling); parallels CIPHER's accessibility limit |
| Du et al. (2024, `du2024improving`) | The NL debate protocol CIPHER improves upon |
| Estornell & Liu (2024) | Theoretical debate framework; CIPHER changes the message space, not the aggregation rule |
| MoA (Wang et al., 2025) | Text-channel aggregation; no correctness signal either |

### 9. Relevance to FYDP

★★★☆☆

**Justification:** Strong supporting citation for why we source trust externally instead of from the agents' own text/uncertainty signals; also a clear white-box/heterogeneity constraint that separates our design space. Low implementation relevance.

### 10. Reading Checklist (fill after team read)

- [ ] Extract per-task accuracy tables
- [ ] Confirm code release + license
- [ ] Note exact temperature-tuning protocol (fairness claims)
- [ ] Check whether any black-box proxy variant is discussed
