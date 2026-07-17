# 📄 Paper #3 — DebUnc

![Paper](https://img.shields.io/badge/Paper-%233-1f6feb?style=for-the-badge)
![Role](https://img.shields.io/badge/Role-Competitor%20(closest%20on%20mechanism)-d29922?style=for-the-badge)
![Threat](https://img.shields.io/badge/Threat%20to%20Novelty-Medium-d29922?style=for-the-badge)
![Venue](https://img.shields.io/badge/Venue-Findings%20of%20EMNLP%202025-6e40c9?style=for-the-badge)
![Verified](https://img.shields.io/badge/Verified-2026--07--17-8957e5?style=for-the-badge)

> *Verified via full paper text (ACL Anthology 2025.findings-emnlp.1265).*

Paper Title:
DebUnc: Improving Large Language Model Agent Communication With Uncertainty Metrics

Authors & Year:
Luke Yoffe, Alfonso Amayuelas, William Yang Wang (UC Santa Barbara) — 2025

Link:
https://aclanthology.org/2025.findings-emnlp.1265/ (Findings of EMNLP 2025, Suzhou)
DOI: 10.18653/v1/2025.findings-emnlp.1265
arXiv: https://arxiv.org/abs/2407.06426

Summary:
DebUnc is the closest published work to our *mechanism*: it re-weights agent influence during multi-agent debate based on a per-agent confidence signal. Its diagnosis matches ours exactly — in standard MAD, agents "generate incorrect yet confident-sounding responses, which can mislead the others," because agents do not consider how confident their peers are. DebUnc measures each agent's confidence after every round using a token-level uncertainty metric (Mean Token Entropy or TokenSAR), then communicates that confidence to peers in the next round via one of two channels: (1) *Confidence in Prompt* — injecting a 1–10 confidence score into the textual prompt, or (2) *Attention Scaling* — modifying the transformer attention mechanism so tokens from more-confident agents receive higher attention weights. The headline finding is that attention-scaling beats prompt-based communication, and — critically — that a diagnostic "Ground Truth" uncertainty oracle boosts accuracy far more (up to +10% average), showing the ceiling is limited by the quality of the uncertainty metric, not the communication mechanism.

Relevant to Our Idea:
This is our nearest neighbor on mechanism — both DebUnc and our C1 dynamically scale one agent's influence over others *during* the debate, rather than at aggregation time (contrast CONSENSAGENT, which is pre-debate). The decisive differentiator is the *source of the trust signal*. DebUnc derives influence from **internal, self-generated uncertainty** (token entropy / semantic self-consistency) — a signal that reflects how confident a model *feels*, not whether it is *correct*. Their own Ground Truth experiment is the strongest possible evidence for our thesis: when they replace the self-reported metric with an oracle that knows correctness, accuracy jumps dramatically — proving the bottleneck is precisely that self-reported confidence is poorly calibrated to truth. Our contribution replaces that internal signal with an **external, evidence-grounded trust score** from retrieved scientific evidence — a real-world, deployable approximation of the very oracle DebUnc could only simulate. We should frame our evidence-retrieval trust score as "the practical instantiation of DebUnc's Ground Truth metric."

Gap / Limitation Noted in Paper:
The authors are explicit that performance is capped by uncertainty-metric quality: "performance continues to improve as uncertainty estimation becomes more reliable," and their Ground Truth oracle (which "cannot be used in real-world applications" because it needs the answer) far outperforms the deployable metrics. This is the exact gap we fill: DebUnc identifies that a better-than-self-reported trust signal is needed but has no real-world way to obtain one. Additionally, attention scaling requires white-box access to model internals (open-source weights, custom attention code) — it cannot run on closed API models — and token-probability uncertainty metrics are unavailable for most closed models. Their trust signal is also purely *internal*: it never consults any external ground truth, so a confidently-wrong-but-internally-consistent agent still receives high influence.

---

## Section 2 — Expert Detailed Analysis

### Q1–Q9 Quick Reference

| # | Question | Short Answer |
|---|---|---|
| Q1 | What problem and why important? | In MAD, agents respond with high confidence regardless of accuracy; a confidently-wrong agent misleads peers into converging on a wrong answer. Agents don't know how confident their peers are. DebUnc adds a per-agent confidence signal to communication. |
| Q2 | What data (source, size, splits, ethics)? | 4 benchmarks: MMLU (0/5-shot), GSM8K, TruthfulQA, Arithmetic (synthetic a+b·c+d). 100 questions sampled per benchmark (full sets too costly). 5 runs each, mean ±95% CI. Public benchmarks; no ethics/consent issues raised. |
| Q3 | What features/inputs, how engineered? | Per-agent uncertainty from token-level metrics: Mean Token Entropy (cheap), TokenSAR (relevance-weighted neg-log-prob, ~+50% runtime via RoBERTa-large), and a diagnostic Ground Truth oracle (low unc if correct, high if wrong). Converted to a 1–10 confidence by inverting + scaling to mean 5, clamped. |
| Q4 | What methods/models, overall pipeline? | 3 agents, 3 rounds, same LLM. Each round: agent answers → uncertainty measured → next round shares (response + confidence). Two communication modes: Confidence-in-Prompt (text) and Attention-Scaling (Attn-Others / Attn-All) that rescales attention weights on peer tokens by confidence. Final answer by majority vote. |
| Q5 | What baselines and why chosen? | "Standard" MAD (no uncertainty communication) is the primary baseline. Ablations compare each metric × each communication mode. Ground Truth oracle serves as the diagnostic upper bound. |
| Q6 | How evaluated (metrics, setup, tests)? | Accuracy ±95% CI over 5 runs, per benchmark + average. Temp=1 (to vary responses). Mistral-7B-Instruct-v0.2 primary; Llama-3-8B-Instruct for key re-runs. |
| Q7 | Key results vs baselines? | Attention-scaling > prompt-based > standard. On Llama-3-8B: Standard avg 0.63 → Attn-All 0.64 (real metric), but Ground Truth Attn-Others 0.73 (+0.10). Confirms mechanism works; ceiling set by metric quality. |
| Q8 | Limitations and biases? | Needs white-box model access (attention scaling + token probs) → no closed APIs. Deployable metrics far below the oracle. Trust signal is purely internal (self-consistency), never external truth. Small samples (100/benchmark). |
| Q9 | Code/data/artifacts available? | Code: https://github.com/lukeyoffe/debunc . Uses LMPolygraph for uncertainty metrics. Public benchmarks. |

### 1. Publication Status & Citation

| Field | Value |
|---|---|
| **Venue** | Findings of the Association for Computational Linguistics: EMNLP 2025 (Suzhou, China) |
| **DOI** | 10.18653/v1/2025.findings-emnlp.1265 (verified via ACL Anthology, 2026-07-17) |
| **Pages** | 23299–23315 |
| **ISBN** | 979-8-89176-335-7 |
| **arXiv** | 2407.06426 |
| **Last verified** | 2026-07-17 — confirmed via ACL Anthology landing page + PDF footer ("©2025 ACL, pages 23299–23315, November 4–9") |
| **Code** | https://github.com/lukeyoffe/debunc |

**BibTeX:**
```bibtex
@inproceedings{yoffe-etal-2025-debunc,
  title     = "{D}eb{U}nc: Improving Large Language Model Agent Communication With Uncertainty Metrics",
  author    = "Yoffe, Luke and Amayuelas, Alfonso and Wang, William Yang",
  editor    = "Christodoulopoulos, Christos and Chakraborty, Tanmoy and Rose, Carolyn and Peng, Violet",
  booktitle = "Findings of the Association for Computational Linguistics: EMNLP 2025",
  month     = nov,
  year      = "2025",
  address   = "Suzhou, China",
  publisher = "Association for Computational Linguistics",
  url       = "https://aclanthology.org/2025.findings-emnlp.1265/",
  doi       = "10.18653/v1/2025.findings-emnlp.1265",
  pages     = "23299--23315",
  isbn      = "979-8-89176-335-7"
}
```

### 2. Core Contribution & Method

DebUnc augments the standard Du et al. (2023) debate loop with a *confidence channel*. The insight: vanilla MAD passes only peers' answers/reasoning, so an agent cannot tell a hesitant peer from a certain one — and since LLMs sound confident regardless of correctness, the loudest-sounding wrong answer can dominate.

**Pipeline (3 agents, 3 rounds, same LLM):**
1. Round 1: each agent independently answers via step-by-step prompting.
2. After each round, an **uncertainty metric** scores each agent's confidence.
3. In the next round, each agent receives peers' responses **plus** their confidences, communicated by one of the modes below.
4. After the final round, a **majority vote** picks the answer.

**Uncertainty metrics (§3.1):**
- *Mean Token Entropy* — average per-token entropy over the generated sequence; near-zero runtime overhead.
- *TokenSAR* — relevance-weighted negative log-probabilities (weights from RoBERTa-large per token); ~50% runtime overhead but far cheaper than sampling-based metrics.
- *Ground Truth Uncertainty* (diagnostic only) — assigns low uncertainty to correct answers, high to wrong ones. Requires the gold answer, so **not deployable**; used to estimate the ceiling if uncertainty estimation were perfect.

**Communication modes (§3.2):**
- *Confidence in Prompt* — uncertainties inverted → scaled to mean 5 → clamped to 1–10 integers → injected into the next-round text prompt. (Note: they express *confidence* not *uncertainty* because human-trained LLMs handle "confidence 1–10" more naturally.)
- *Attention Scaling* — modifies the decoder attention: tokens belonging to a peer's response are up/down-weighted by that peer's confidence before the softmax-weighted value sum. Two variants: **Attn-Others** (rescale only peers' tokens) and **Attn-All** (rescale peers' and own tokens). Scaling applied only to answer tokens, not prompt tokens, to avoid divide-by-zero. Requires white-box model access.

### 3. Key Results (Extracted)

**Llama-3-8B-Instruct, accuracy ±95% CI (Table 3):**

| Metric | Method | MMLU-0 | GSM8k | TruthfulQA | Arithmetic | Average |
|---|---|---|---|---|---|---|
| — | Standard | 0.65 | 0.81 | 0.52 | 0.52 | 0.63 |
| Entropy | Prompt | 0.61 | **0.84** | 0.54 | 0.53 | 0.63 |
| Entropy | Attn-Others | 0.64 | 0.81 | 0.56 | 0.53 | 0.63 |
| Entropy | Attn-All | 0.66 | 0.81 | 0.56 | 0.53 | **0.64** |
| Ground Truth* | Prompt | 0.67 | 0.87 | 0.58 | 0.55 | 0.67 |
| Ground Truth* | Attn-Others | **0.78** | 0.90 | 0.67 | 0.56 | **0.73** |
| Ground Truth* | Attn-All | 0.75 | **0.90** | **0.68** | 0.56 | 0.72 |

\*Ground Truth requires the gold answer — diagnostic, not deployable.

**Takeaways:**
- Deployable metrics (Entropy/TokenSAR) give **small but consistent** gains over Standard (~+0.01 avg); attention-scaling ≥ prompt-based.
- The **Ground Truth oracle gives large gains** (+0.10 avg on Llama, similar on Mistral) — the entire headroom is in the *quality of the trust signal*, not the communication channel.
- Attn-Others (only rescale peers) slightly edges Attn-All in the oracle setting.

### 4. Paper's Self-Admitted Limitations

1. **Ceiling set by metric quality:** deployable uncertainty metrics fall far short of the Ground Truth oracle; the paper's own framing is that better uncertainty estimation is the path forward.
2. **White-box requirement:** attention scaling needs model source modifications, and token-probability metrics need logits — neither is available for most closed API models.
3. **Purely internal signal:** confidence is derived from the model's own token distribution / self-consistency; it never checks any external source of truth, so a systematically-but-confidently wrong agent keeps high influence.
4. **Small evaluation:** 100 questions per benchmark, 3 agents, 3 rounds, mostly one model family.

### 5. Direct Comparison to Our Idea

| Dimension | DebUnc | Our Idea |
|---|---|---|
| **Problem** | Confidently-wrong agents mislead peers in MAD | **Same** — sycophantic/confident-wrong collapse |
| **Where it intervenes** | *During debate* — reweights peer influence each round | *During debate* — reweights agent influence each round |
| **Mechanism** | Attention scaling / prompt-injected confidence | Numeric trust re-weighting of agent influence |
| **Trust signal** | **Internal** self-reported uncertainty (token entropy / TokenSAR) | **External** retrieved scientific evidence verifying claims |
| **Deployability of the ideal signal** | Ground Truth oracle needed but *not deployable* | Evidence retrieval is a *deployable* proxy for that oracle |
| **Model access** | White-box (open weights) required for attention mode | Works at the message/aggregation level (API-compatible) |

**Overlap with C1 (in-debate trust weighting):** **This is the highest-overlap mechanism paper.** Both scale influence during the debate. But DebUnc's signal is the agent's *own* confidence; ours is *externally verified evidence*. DebUnc proved (via its oracle) that a truth-correlated signal is what actually helps — and then could only simulate it. Our thesis is that retrieved evidence is the practical, deployable version of that oracle. We must cite the Ground Truth result as direct empirical support.

**Overlap with C2 (evaluation):** Moderate. Their per-round accuracy tracking and the Standard-MAD baseline are reusable; but they measure only final accuracy, not sycophancy/minority-suppression explicitly, so our CCR/MPR/ECR metrics remain a contribution.

**Key divergence:** DebUnc = internal, self-reported confidence, white-box, capped by metric calibration. Ours = external, evidence-grounded trust, API-compatible, targeting exactly the calibration gap DebUnc exposes.

### 6. Our Positioning Strategy

| Role | Detail |
|---|---|
| **In our paper** | Competitor — the "in-loop confidence-weighting branch"; our closest mechanistic neighbor and a candidate baseline (B-DebUnc) |
| **How we cite** | As the work that proved a truth-correlated trust signal helps but relies on non-deployable internal/oracle signals; our evidence retrieval is the deployable answer |
| **Relationship** | Same mechanism family, different (external vs internal) trust source — needs a sharp differentiation paragraph |

**Pre-emptive rebuttal paragraph** (if a reviewer asks "isn't this just DebUnc?"):
> DebUnc (Yoffe et al., 2025) is the closest prior work on mechanism: it also re-weights agent influence during debate. The difference is the *source* of trust. DebUnc scores each agent by its own token-level uncertainty — a signal reflecting how confident the model *feels*, not whether it is *correct*. Their own results make our case: their deployable uncertainty metrics yield only marginal gains, whereas a diagnostic "Ground Truth" oracle that knows correctness yields large gains — but that oracle "cannot be used in real-world applications." Our contribution is precisely a deployable substitute for that oracle: an evidence-grounded trust score computed from externally retrieved scientific evidence. Where DebUnc asks each agent "how sure are you?", we ask "does the external record support your claim?" — and unlike DebUnc's attention-scaling, our reweighting operates at the message level, so it works with closed API models.

### 7. Code & Reproducibility

| Field | Detail |
|---|---|
| **Repo** | https://github.com/lukeyoffe/debunc |
| **Language** | Python; requires white-box model access for attention scaling |
| **Models used** | Mistral-7B-Instruct-v0.2 (primary), Llama-3-8B-Instruct |
| **Uncertainty impl.** | LMPolygraph (Fadeeva et al., 2023) for Entropy/TokenSAR; TokenSAR uses RoBERTa-large for token relevance |
| **Reimplementation effort** | Moderate for prompt-confidence mode (text only); high for attention scaling (must patch decoder attention). Ground Truth oracle trivial to reproduce (needs gold labels). |
| **Key challenge for replication** | Attention-scaling hooks are model-code-specific; closed models can't run it. Confidence-in-prompt is API-portable and the easiest baseline for us to reuse. |

### 8. Cross-References

| Paper in this review | Relationship |
|---|---|
| **CONSENSAGENT (Pitre et al., 2025)** | Both target confident-wrong collapse. CONSENSAGENT intervenes *pre-debate* (prompt rewriting) + self-reported confidence at aggregation; DebUnc intervenes *in-loop* via internal uncertainty. Neither uses external evidence — the shared seam our C1 targets. |
| **ReConcile (Chen et al., 2023)** | DebUnc cites it as prior in-loop confidence work (self-reported confidence passed via prompt). DebUnc's prompt-mode is essentially a better-calibrated ReConcile. |
| **iMAD (Fan et al., 2026)** | Complementary axis (whether to debate) vs DebUnc (how to weight within debate). Both ultimately trust self-generated confidence signals. |
| **MoA (Wang et al., 2025)** | MoA aggregates without any trust/confidence weighting (fixed layered synthesis); DebUnc adds the confidence signal MoA lacks. Contrast for our "static vs dynamic trust" argument. |
| **PASTA (Zhang et al., 2024)** | The attention-steering technique DebUnc builds on; background for the attention-scaling mechanism. |

### 9. Relevance to FYDP

★★★★★

**Justification:** Essential reading and our closest mechanistic neighbor. DebUnc independently validates two pillars of our proposal: (1) that in-debate influence reweighting is the right lever, and (2) — via the Ground Truth oracle — that the *quality of the trust signal* is the binding constraint, and self-reported confidence is not enough. That oracle result is the single most useful external evidence we have that an *external* trust signal (our evidence retrieval) is worth building. Cite it prominently in motivation and in the C1 differentiation. Treat DebUnc (confidence-in-prompt mode) as a concrete baseline B-DebUnc: it is API-portable and directly comparable to our evidence-grounded reweighting. The differentiation is clean and defensible: internal self-reported confidence (DebUnc) vs external evidence-grounded trust (ours).
