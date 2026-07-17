# 📄 Paper #4 — Mixture-of-Agents (MoA)

![Paper](https://img.shields.io/badge/Paper-%234-1f6feb?style=for-the-badge)
![Role](https://img.shields.io/badge/Role-Context%20(foundational%20arch.)-2ea043?style=for-the-badge)
![Threat](https://img.shields.io/badge/Threat%20to%20Novelty-Low-2ea043?style=for-the-badge)
![Venue](https://img.shields.io/badge/Venue-ICLR%202025%20(Poster)-6e40c9?style=for-the-badge)
![Verified](https://img.shields.io/badge/Verified-2026--07--17-8957e5?style=for-the-badge)

> *Verified via full paper text + ICLR 2025 proceedings.*

Paper Title:
Mixture-of-Agents Enhances Large Language Model Capabilities

Authors & Year:
Junlin Wang, Jue Wang, Ben Athiwaratkun, Ce Zhang, James Zou (Together AI / Duke / UChicago / Stanford) — 2025

Link:
https://proceedings.iclr.cc/paper_files/paper/2025/hash/5434be94e82c54327bb9dcaf7fca52b6-Abstract-Conference.html (ICLR 2025, Poster)
OpenReview: https://openreview.net/forum?id=h0ZfDIrj7T
arXiv: https://arxiv.org/abs/2406.04692

Summary:
MoA is the foundational multi-model aggregation architecture our work builds on and departs from. It exploits what the authors call the "collaborativeness" of LLMs — a model produces better responses when shown other models' outputs, even weaker ones. MoA arranges agents in a layered pipeline: each layer has several "proposer" LLMs whose outputs are concatenated and fed to the next layer, where an "aggregator" LLM synthesizes them via an Aggregate-and-Synthesize prompt; stacking layers iteratively refines the answer. Using only open-source models, MoA reaches 65.1% on AlpacaEval 2.0, surpassing GPT-4 Omni (57.5%), and leads MT-Bench and FLASK — all without any fine-tuning, purely through prompting. It is essentially a structured, feed-forward *ensemble-by-synthesis*, distinct from adversarial multi-agent debate.

Relevant to Our Idea:
MoA is the canonical example of the "static multi-model aggregation" branch our proposal positions against. It demonstrates that combining diverse LLMs raises quality — motivation for using multiple agents at all — but its aggregation is **static and trust-blind**: the aggregator prompt itself instructs the model that inputs "may be biased or incorrect" and asks it to judge, but there is *no explicit, per-agent trust weight*, no notion of which proposer has been reliable, and crucially **no external evidence** grounding the synthesis. The aggregator is a single LLM exercising its own (potentially sycophantic) judgment over concatenated text. MoA is also *not a debate* — proposers never see each other within a round and never revise in response to peers, so it structurally cannot exhibit or address the round-over-round sycophantic collapse dynamic we target. We cite MoA to establish (a) that multi-agent aggregation is a proven, high-value paradigm, and (b) that existing aggregation is trust-agnostic and evidence-free — the gap our evidence-grounded trust re-weighting fills.

Gap / Limitation Noted in Paper:
The authors' own analysis shows the final aggregator's quality strongly correlates with proposer quality and that a poor aggregator can degrade results (Table 4: e.g., LLaMA-3-70B scores 45.0% as aggregator vs 60.6% as proposer) — i.e., the synthesis step has no safeguard against a weak or misled aggregator beyond the base model's judgment. MoA also incurs substantial token/latency cost from multiple layers × multiple proposers, and its BLEU-vs-winrate correlation analysis is a weak proxy for *why* aggregation helps. Most importantly for us: MoA has no mechanism to detect or down-weight a confidently-wrong proposer, and no external verification — a confidently incorrect proposer's text enters the aggregator on equal footing with a correct one.

---

## Section 2 — Expert Detailed Analysis

### Q1–Q9 Quick Reference

| # | Question | Short Answer |
|---|---|---|
| Q1 | What problem and why important? | Scaling single LLMs is costly; different LLMs have complementary strengths. Can we harness collective expertise of many LLMs without fine-tuning? MoA shows yes, via layered proposer/aggregator prompting. |
| Q2 | What data (source, size, splits, ethics)? | Eval on AlpacaEval 2.0 (805 instructions), MT-Bench, FLASK. Open-source proposers (Qwen1.5-110B/72B, WizardLM-8x22B, Mixtral-8x22B, LLaMA-3-70B, dbrx). 3 runs, mean±std. Public benchmarks; no ethics section. |
| Q3 | What features/inputs, how engineered? | No feature engineering / no fine-tuning. Pure prompting: Aggregate-and-Synthesize prompt concatenates all prior-layer responses and instructs critical synthesis. Roles empirically characterized as Proposer vs Aggregator. |
| Q4 | What methods/models, overall pipeline? | Layered architecture: layer i has n LLMs; each takes ALL layer-(i−1) outputs as auxiliary context. Last layer uses one aggregator for final output. MoA (6 proposers, 3 layers), MoA-Lite (2 layers), MoA w/ GPT-4o aggregator. Analogy drawn to Mixture-of-Experts at the model level. |
| Q5 | What baselines and why chosen? | GPT-4 Omni, GPT-4 Turbo, and individual open-source models (single-model scores). Chosen to show open-source ensemble beats a top proprietary single model. |
| Q6 | How evaluated (metrics, setup, tests)? | AlpacaEval 2.0 LC win rate, MT-Bench turn scores, FLASK skill scores. Budget/token analysis for cost-effectiveness. Spearman correlation between proposer BLEU and win rate (mechanism probe). |
| Q7 | Key results vs baselines? | AlpacaEval 2.0: MoA 65.1% (open-source only) vs GPT-4 Omni 57.5%. MoA w/ GPT-4o 65.7%. Comparable to GPT-4 Turbo at ~2× lower cost. Accuracy rises monotonically with # proposers (n=1→6: 47.8%→61.3%); diverse proposers > single-proposer. |
| Q8 | Limitations and biases? | Aggregator quality gates final output (weak aggregator hurts); no per-agent trust/verification; high token/latency cost; not a debate (no round-over-round revision); BLEU-winrate correlation is a weak mechanistic explanation. |
| Q9 | Code/data/artifacts available? | Code: https://github.com/togethercomputer/moa (prompt-only, off-the-shelf models). Public benchmarks. |

### 1. Publication Status & Citation

| Field | Value |
|---|---|
| **Venue** | ICLR 2025 (Poster) — International Conference on Learning Representations |
| **OpenReview** | h0ZfDIrj7T (verified 2026-07-17 via iclr.cc/virtual/2025/poster/28787) |
| **arXiv** | 2406.04692 |
| **Presentation** | **Poster** (NOT Spotlight — index corrected 2026-07-17; iclr.cc virtual listing confirms poster) |
| **Last verified** | 2026-07-17 — ICLR proceedings + virtual site + OpenReview forum |
| **Code** | https://github.com/togethercomputer/moa |

**BibTeX:**
```bibtex
@inproceedings{wang2025mixtureofagents,
  title     = "Mixture-of-Agents Enhances Large Language Model Capabilities",
  author    = "Wang, Junlin and Wang, Jue and Athiwaratkun, Ben and Zhang, Ce and Zou, James",
  booktitle = "The Thirteenth International Conference on Learning Representations (ICLR)",
  year      = "2025",
  url       = "https://openreview.net/forum?id=h0ZfDIrj7T",
  note      = "Poster"
}
```

### 2. Core Contribution & Method

MoA's thesis is the **collaborativeness** of LLMs: Figure 1 shows 6 models all improve their AlpacaEval win rate when shown other models' answers as reference — even references from *weaker* models. MoA operationalizes this at scale.

**Two roles (empirically validated, §3.3):**
- **Proposers** generate diverse reference responses; a good proposer need not score well alone but must add useful perspectives (e.g., WizardLM: strong proposer 63.8%, weak aggregator 52.9%).
- **Aggregators** synthesize multiple responses into one high-quality output, ideally improving even on lower-quality inputs (e.g., Qwen1.5-110B: strong aggregator 61.3%).

**Architecture (§2.2):** l layers, each with n LLMs A_{i,1..n}. Layer-i output y_i = ⊕ over agents of [A_{i,j}(concatenated prior-layer outputs)] + original prompt, where ⊕ = Aggregate-and-Synthesize prompt (Table 1). LLMs can repeat within/across layers; identical LLMs in a layer = "single-proposer" (temperature-sampled variants). Only the last layer's single aggregator output is the final answer. **No fine-tuning** — prompt interface only.

**Analogy to MoE (§2.3):** MoA extends Mixture-of-Experts from the activation level to the *model* level; the aggregator LLM subsumes both the gating and expert-combination roles that MoE splits into separate networks.

### 3. Key Results (Extracted)

**AlpacaEval 2.0 (LC win rate):**

| System | LC Win Rate |
|---|---|
| GPT-4 Omni | 57.5% |
| MoA (6 proposers, 3 layers, open-source only) | **65.1%** |
| MoA w/ GPT-4o aggregator | 65.7% |

**Effect of proposer count (Table 3, Qwen1.5-110B aggregator, 2 layers):**

| n proposers | Multiple-Proposer | Single-Proposer |
|---|---|---|
| 6 | 61.3% | 56.7% |
| 3 | 58.0% | 56.1% |
| 2 | 58.8% | 54.5% |
| 1 | 47.8% | 47.8% |

Accuracy rises monotonically with n; diverse proposers consistently beat temperature-sampled single-proposer — diversity matters.

**Role specialization (Table 4):** GPT-4o/Qwen/LLaMA-3 versatile; WizardLM strong proposer but weak aggregator; LLaMA-3-70B better as proposer (60.6%) than aggregator (45.0%). Confirms aggregator choice materially gates final quality.

**Budget (§3.4):** Some MoA configs match GPT-4 Turbo quality at ~2× lower cost.

### 4. Paper's Self-Admitted Limitations / Weaknesses

1. **Aggregator is a single point of quality control** — a weak aggregator degrades output (Table 4), with no safeguard beyond the base model's own judgment.
2. **No per-agent trust or verification** — the Aggregate-and-Synthesize prompt merely *warns* that inputs "may be biased or incorrect"; there is no numeric, evidence-based down-weighting of unreliable proposers.
3. **Cost/latency** — multiple layers × proposers multiply token usage (acknowledged in budget analysis).
4. **Weak mechanistic explanation** — the BLEU-vs-win-rate Spearman correlation is a proxy; *why* collaborativeness works is not fully explained.
5. **Not a debate** — proposers do not see each other within a layer or revise across rounds in response to peers; MoA cannot model iterative social pressure.

### 5. Direct Comparison to Our Idea

| Dimension | MoA | Our Idea |
|---|---|---|
| **Paradigm** | Feed-forward ensemble-by-synthesis (layered) | Iterative adversarial debate with trust re-weighting |
| **Agent interaction** | Proposers isolated within a layer; aggregator synthesizes | Agents see & respond to each other across rounds |
| **Trust handling** | None explicit; aggregator's implicit judgment | Explicit per-agent numeric trust weight, updated per round |
| **Grounding signal** | None external; prompt-only synthesis | External retrieved scientific evidence |
| **Failure mode addressed** | Under-utilization of collective expertise | Sycophantic collapse of a correct minority |
| **Training** | None (prompt-only) | Ideally retrieval-based / training-free |

**Overlap with C1 (trust mechanism):** Low. MoA has no trust variable at all; it is the trust-*blind* baseline our C1 improves upon. The overlap is only that both use multiple heterogeneous LLMs.

**Overlap with C2 (evaluation):** Low. MoA evaluates open-ended generation quality (AlpacaEval/MT-Bench), not sycophantic collapse on reasoning tasks. Different metric family; not a direct C2 precedent.

**Key divergence:** MoA aggregates *once, statically, without grounding*; we re-weight *iteratively, dynamically, grounded in external evidence*. MoA proves aggregation is valuable; we argue aggregation without trust calibration is exactly where a confident wrong proposer poisons the synthesis.

### 6. Our Positioning Strategy

| Role | Detail |
|---|---|
| **In our paper** | Context / foundational citation — the "static multi-model aggregation" reference point |
| **How we cite** | To motivate using multiple diverse LLMs (collaborativeness) AND to mark the gap: aggregation is trust-blind and evidence-free |
| **Relationship** | Foundational, not competitive — different paradigm (ensemble vs debate); no sycophancy handling |

**Pre-emptive framing paragraph** (for related work):
> Mixture-of-Agents (Wang et al., 2025) established that layered aggregation of diverse LLMs can surpass a single frontier model without any fine-tuning, demonstrating the value of harnessing collective expertise. However, MoA's synthesis is static and trust-blind: a single aggregator LLM combines all proposer outputs through prompting alone, with no per-agent reliability estimate and no external grounding. It is a feed-forward ensemble rather than an iterative debate, and thus neither exhibits nor addresses the round-over-round sycophantic collapse that degrades correct minority answers. Our work retains the premise that multiple diverse agents are valuable but replaces trust-blind synthesis with an evidence-grounded, per-agent trust re-weighting applied during debate.

### 7. Code & Reproducibility

| Field | Detail |
|---|---|
| **Repo** | https://github.com/togethercomputer/moa |
| **Approach** | Prompt-only over off-the-shelf models — highly reproducible, no training |
| **Models** | Qwen1.5-110B/72B-Chat, WizardLM-8x22B, Mixtral-8x22B-Instruct, LLaMA-3-70B-Instruct, dbrx-instruct, GPT-4o |
| **Reimplementation effort** | Low — the Aggregate-and-Synthesize prompt (Table 1) + layered loop is straightforward; main cost is API/compute for many proposers |
| **Reuse for us** | The layered aggregation loop and the Aggregate-and-Synthesize prompt are a useful starting scaffold; our trust weights would gate/annotate proposer inputs before aggregation |

### 8. Cross-References

| Paper in this review | Relationship |
|---|---|
| **iMAD (Fan et al., 2026)** | Both target multi-agent efficiency/quality, but iMAD is about debate triggering and MoA is about static synthesis; neither weights trust by evidence. |
| **CONSENSAGENT (Pitre et al., 2025)** | CONSENSAGENT fixes debate via prompt rewriting; MoA avoids debate entirely via feed-forward synthesis. Both trust-blind on per-agent reliability. |
| **DebUnc (Yoffe et al., 2025)** | DebUnc adds per-agent confidence weighting *within debate*; MoA has no such weighting. DebUnc is closer to our mechanism, MoA further. |
| **Estornell & Liu (2024)** | Theoretical majority-convergence analysis complements MoA's empirical aggregation; both motivate why naive aggregation can fail. |

### 9. Relevance to FYDP

★★★☆☆

**Justification:** MoA is essential *context* but a low novelty threat. It is the most-cited demonstration that multi-model aggregation works and is worth doing, so it anchors the "why multiple agents" motivation in our intro/related work. But it operates in a different paradigm (feed-forward ensemble, not debate), has zero trust calibration, and no external grounding — so it does not compete with our contribution; it defines the trust-blind baseline we improve on. Cite it once in related work as the aggregation reference point, use its "collaborativeness" and diversity findings to justify a multi-agent design, and use its trust-blind aggregator as the foil for our evidence-grounded trust re-weighting. It is not a candidate experimental baseline for sycophancy (wrong metric family).
