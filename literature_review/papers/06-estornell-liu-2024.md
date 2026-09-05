# 📄 Paper #6 — Multi-LLM Debate (Estornell & Liu)

![Paper](https://img.shields.io/badge/Paper-%236-1f6feb?style=for-the-badge)
![Role](https://img.shields.io/badge/Role-Context%20(theoretical)-2ea043?style=for-the-badge)
![Threat](https://img.shields.io/badge/Threat%20to%20Novelty-Low-2ea043?style=for-the-badge)
![Venue](https://img.shields.io/badge/Venue-NeurIPS%202024%20(Main)-6e40c9?style=for-the-badge)
![Verified](https://img.shields.io/badge/Verified-2026--09--05-8957e5?style=for-the-badge)

> *Verified via full paper text (NeurIPS proceedings PDF, 27 pages).*

Paper Title:
Multi-LLM Debate: Framework, Principals, and Interventions

Authors & Year:
Andrew Estornell, Yang Liu — 2024

Link:
https://proceedings.neurips.cc/paper_files/paper/2024/hash/32e07a110c6c6acf1afbf2bf82b614ad-Abstract-Conference.html (NeurIPS 2024 Main Conference Track)
PDF: https://proceedings.neurips.cc/paper_files/paper/2024/file/32e07a110c6c6acf1afbf2bf82b614ad-Paper-Conference.pdf

Summary:
Estornell and Liu propose the first Bayesian latent-concept framework for multi-LLM debate, treating prior-round responses as in-context examples that skew each agent's posterior over concepts. From this they prove three principles: identical models produce static debate dynamics (Theorem 5.1), similar responses induce tyranny of the majority (Theorem 5.2), and shared misconceptions monotonically lower final accuracy as more agents share them (Theorem 5.4). Guided by the theory they design three interventions — diversity pruning (maximise response entropy), quality pruning (keep responses closest to the task), and misconception refutation (LLM-rewritten correction) — and show the combined method matches or beats Society-of-Minds debate across BoolQ, MMLU, TruthfulQA, and MathQ with GPT, Llama, and Mistral families.

Relevant to Our Idea:
This is the theoretical predecessor that formally proves the failure our FYDP targets: majority convergence when responses correlate, especially under shared misconceptions from correlated training data. Our project accepts their diagnosis but replaces their fix — pruning or rewriting responses with sentence-embedding proxies — with a bounded numeric trust score grounded in external retrieved evidence. Their tyranny-of-the-majority experiment (Figure 1) and Theorem 5.2 are the strongest formal citations for our Propositions 1–3 positioning.

Gap / Limitation Noted in Paper:
The authors state their latent-concept distributions are intractable and proxied by ADA-2 sentence embeddings, which fail where embeddings are meaningless (arithmetic), and that misconception refutation raises inference cost via repeated re-prompting. From our perspective, none of the three interventions verifies claims against external evidence or assigns a persistent per-agent trust value — pruning only filters which responses the next round sees.

---

## Section 2 — Expert Detailed Analysis

### Q1–Q9 Quick Reference

| # | Question | Short Answer |
|---|---|---|
| Q1 | What problem and why important? | Debate often collapses to the majority even when the majority is wrong; paper gives the first formal theory of why, plus fixes. |
| Q2 | What data (source, size, splits, ethics)? | BoolQ (3,270 yes/no), MMLU high-school subset (3,406 of 13,869), TruthfulQA (817 open-ended, GPT-4 judge), MathQ (3,000 synthetic a·b·c+d·e·f). No ethics discussion (public benchmarks). |
| Q3 | What features/inputs, how engineered? | ADA-2 sentence embeddings as proxy for latent-concept distributions; KL between embedding-derived distributions drives pruning. |
| Q4 | What methods/models, overall pipeline? | Bayesian debate framework (Lemma 4.2 skew term) → diversity pruning + quality pruning + misconception refutation, combined per Algorithm 1; 10 rounds, 6 agents. |
| Q5 | What baselines and why chosen? | Single model vs Society-of-Minds debate (Du et al. 2023); homogeneous (6× same) and mixed (3+3) teams to test diversity effects. |
| Q6 | How evaluated (metrics, setup, tests)? | Accuracy with std intervals; echo-rate vs majority size (Fig 1); gain vs response similarity (Fig 2); per-round curves (Fig 3). No significance tests, no user study. |
| Q7 | Key results vs baselines? | Combined interventions ≥ SoM everywhere tested, e.g. 6×GPT-3.5 MMLU .74→.79, TruthfulQA .63→.69, Math .88→.93; biggest gains where responses are most similar. |
| Q8 | Limitations and biases? | Embedding proxy breaks on arithmetic; refutation costs extra LLM calls; isolated interventions can hurt (only the trio helps reliably). |
| Q9 | Code/data/artifacts available? | No repo or dataset release stated in the main text; benchmarks all public. |

### 1. Publication Status & Citation

| Field | Value |
|---|---|
| **Venue** | NeurIPS 2024 Main Conference Track (38th Annual Conference, Vancouver, Dec 10–15, 2024) |
| **Pages** | 27-page PDF (main + supplement), creator pdfTeX-1.40.26, dated 2024-10-30 |
| **Last verified** | 2026-09-05 — confirmed via NeurIPS proceedings page and Researchr/DBLP listing |
| **Code** | None stated |

**BibTeX:**
```bibtex
@inproceedings{estornell2024multillm,
  title={Multi-{LLM} Debate: Framework, Principals, and Interventions},
  author={Estornell, Andrew and Liu, Yang},
  booktitle={Advances in Neural Information Processing Systems},
  volume={38},
  year={2024},
  url={https://proceedings.neurips.cc/paper_files/paper/2024/hash/32e07a110c6c6acf1afbf2bf82b614ad-Abstract-Conference.html}
}
```

### 2. Core Contribution & Method

Debate is reframed as Bayesian inference over a latent concept space (Assumption 4.1, Lemma 4.2): prior-round responses act like in-context examples that reweight each agent's posterior. The optimisation objective (Eq. 3) is to craft Z(t) so the next round maximises P(correct).

**Three principles (Section 5):**
1. Identical capabilities → static dynamics; concept-change probability → 0 as n grows (Theorem 5.1).
2. Similar opinions → generation collapses onto the shared concept (Theorem 5.2, tyranny of the majority).
3. Shared misconception in m of n agents → expected final accuracy monotonically decreasing in m (Theorem 5.4); adding more models does not help when training data correlates.

**Three interventions (Section 6):**
1. *Diversity pruning:* keep k of n responses maximising pairwise KL (entropy); Theorem 6.1 lowers convergence to the erroneous concept when ≥ n/2 share it.
2. *Quality pruning:* keep k responses minimising KL to the task; Theorem 6.2 raises convergence to the correct answer.
3. *Misconception refutation:* LLM lists errors in each response, refutes them, and rewrites a corrected version; Theorem 6.4 raises convergence probability. Remark 6.3 notes diversity + quality are complementary.

### 3. Key Results (Extracted)

| Setup | Single | SoM | Ours (combined) |
|---|---|---|---|
| 6×GPT-3.5 BoolQ | .80 ±.014 | .84 ±.012 | **.85 ±.012** |
| 6×GPT-3.5 MMLU | .73 ±.014 | .74 ±.016 | **.79 ±.014** |
| 6×GPT-3.5 TruthfulQA | .61 ±.033 | .63 ±.032 | **.69 ±.030** |
| 6×GPT-3.5 Math | .53 ±.035 | .88 ±.016 | **.93 ±.01** |
| 3×GPT-3.5+3×Mistral BoolQ | — | .83 ±.013 | **.87 ±.012** |
| 3×GPT-3.5+3×Mistral Math | — | .56 ±.018 | **.68 ±.017** |

- Figure 1 (11-agent echo test): P(echo majority) rises with m; diversity pruning (k=5) flattens the curve.
- Figure 2: SoM gain over single model shrinks as round-0 cosine similarity → 1; combined method's edge is largest there (MathQ excepted — embedding similarity uninformative on arithmetic).
- Figure 3: advantage over SoM typically appears in later rounds.
- Supplement Table 3: individual interventions in isolation can be detrimental; the trio together is the reliable configuration.

### 4. Paper's Self-Admitted Limitations

From the paper directly (Section 8):

1. Latent-concept KL terms are intractable; ADA-2 embeddings are only a proxy, weak on arithmetic.
2. Misconception refutation increases inference time via multiple re-prompts per debater.
3. No external grounding — interventions rearrange or rewrite peer text but never check claims against retrieved sources.
4. No persistent trust state — pruning affects only what the next round sees, not each agent's standing.

### 5. Direct Comparison to Our Idea

| Dimension | Estornell & Liu | Our Idea |
|---|---|---|
| **Problem** | Why debate converges to the majority; how to steer it | How to prevent sycophantic collapse to a wrong majority |
| **Signal source** | Embedding similarity to task/peers (internal) | Retrieved scientific passages per claim (external) |
| **Mechanism** | Prune responses / rewrite text each round | Bounded per-agent trust score updated from verdicts, then trust-weighted aggregation |
| **Trust basis** | None persistent; selection only | Persistent numeric trust, softmax → clamp[0.1,0.9] → renormalise |
| **Vulnerability** | Proxy embeddings; no fact check | Retrieval sparsity / noise on niche topics |
| **Target metric** | Accuracy on general QA | CCR/MPR/ECR + accuracy on scientific QA under injection |

**Overlap with C1 (trust mechanism):** None. No agent-level trust exists here; our C1 is novel relative to this work.
**Overlap with C2 (evaluation harness):** Low. Their echo-rate and similarity-gain plots motivate our injection protocol, but CCR/MPR/ECR under fabricated consensus is ours alone.

### 6. Our Positioning Strategy

| Role | Detail |
|---|---|
| **In our paper** | Context (theoretical foundation) — the formal proof that majority convergence is expected, not accidental |
| **How we cite** | As the NeurIPS 2024 theory behind tyranny-of-the-majority (Theorem 5.2) and shared-misconception decay (Theorem 5.4) |
| **Relationship** | Complementary predecessor — same diagnosis, different cure (pruning vs evidence-grounded trust) |

**Pre-emptive rebuttal paragraph** (if a reviewer asks "how is this different from Estornell & Liu?"):
> Estornell and Liu prove debate converges to the majority under correlated responses and propose pruning or rewriting responses to steer it. Their selection signal is embedding similarity — internal to the debate — with no external fact check and no persistent agent trust. Our mechanism keeps every response but re-weights who counts: each claim is verified against retrieved literature and folded into a bounded trust score that survives across rounds. Pruning changes what the next round reads; trust calibration changes whose evidence-backed position decides the final answer.

### 7. Code & Reproducibility

| Field | Detail |
|---|---|
| **Repo** | None stated in main text |
| **Models used** | GPT-3.5 Turbo, Llama-2 7B Chat, Llama-3 8B Instruct, Mistral 7B Instruct v0.2; ADA-2 embeddings |
| **Compute** | Not reported |
| **Key challenge for replication** | Rebuilding the KL-proxy pruning from embeddings + the multi-prompt refutation pipeline without released code |

### 8. Cross-References

| Paper in this review | Relationship |
|---|---|
| **MoA (Wang et al., 2025)** | Static aggregation without theory; Estornell & Liu supply the missing formal account of why static majorities fail. |
| **ConsensAgent (Pitre et al., 2025)** | Textual prompt-rewriting fix for the same majority-collapse diagnosis; no numeric trust, no retrieval. |
| **DebUnc (Yoffe et al., 2025)** | Internal-uncertainty reweighting; same in-loop family but self-reported, not evidence-grounded. |
| **Minority Sentinel (He et al., 2026)** | Post-hoc flip after debate; Estornell & Liu intervene during debate but without trust state. |
| **Du et al. (2023, SoM)** | The vanilla debate paradigm both this paper and our work build on and compare against. |

### 9. Relevance to FYDP

★★★★☆

**Justification:** Mandatory theory citation for Chapter 2 gap and Chapter 5 P1/P3 mappings. It proves the exact failure (tyranny of the majority, shared-misconception decay) our bounded trust score is designed to break, while its embedding-proxy fix sharpens our differentiation: external evidence, not internal similarity, decides influence.
