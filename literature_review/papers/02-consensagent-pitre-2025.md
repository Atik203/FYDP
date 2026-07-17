━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Paper #2
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STATUS: Competitor (nearest neighbor) | THREAT TO NOVELTY: High | LAST VERIFIED: 2026-07-17 via full paper text (ACL Anthology 2025.findings-acl.1141)

Paper Title:
CONSENSAGENT: Towards Efficient and Effective Consensus in Multi-Agent LLM Interactions Through Sycophancy Mitigation

Authors & Year:
Priya Pitre, Naren Ramakrishnan, Xuan Wang (Virginia Tech) — 2025

Link:
https://aclanthology.org/2025.findings-acl.1141/ (Findings of ACL 2025, Vienna)
DOI: 10.18653/v1/2025.findings-acl.1141

Summary:
CONSENSAGENT is the first work to systematically study sycophancy in multi-agent LLM debate (MAD) and propose a concrete mitigation. The authors show that in standard MAD, agents frequently mimic or swap each other's answers rather than reasoning independently, which (a) inflates cost by requiring extra rounds and (b) suppresses correct minority answers — they report the correct answer is present in the discussion but ignored in over 20% of wrong-answer cases. Their solution is a four-phase, trigger-based framework: agents answer independently (Phase 1), debate (Phase 2), and when a trigger detects stalling or sycophancy (majority of agents retaining answers, or copying with explanation cosine similarity >0.8), a fine-tuned GPT-4o "prompt optimization" model rewrites the *task prompt* itself (Phase 3) — clarifying ambiguities, adding guiding steps, removing irrelevant context — after which agents re-debate and typically reach consensus in 1–2 rounds. A confidence-and-consistency-weighted aggregation replaces the single judge (Phase 4). Across six reasoning benchmarks and three model families, CONSENSAGENT beats single-agent and multi-agent baselines (including ReConcile) and reduces measured sycophancy by 7–30%.

Relevant to Our Idea:
This is the single most important paper for our positioning — it is our nearest published neighbor and the primary threat to our novelty claim. It shares our exact problem framing (sycophancy causes correct minority answers to be lost in MAD) and even our diagnostic vocabulary. **The critical differentiator is the mechanism and where it intervenes.** CONSENSAGENT attacks sycophancy *indirectly and pre-debate* by rewriting the task prompt to be clearer, on the hypothesis that much sycophancy stems from prompt ambiguity. It does **not** re-weight agent influence during the debate, and it still relies on *self-reported confidence* in its Phase 4 aggregation — the very signal our work argues is manipulable under social pressure. Our contribution is orthogonal in mechanism: an in-session, evidence-grounded numeric trust re-weighting that scales each agent's influence by *external, retrieved scientific evidence* rather than by prompt clarity or self-reported confidence. Their own finding — "the correct answer is present in the discussion >20% of the time but ignored" — is the strongest external motivation we have for our TCM (trust-calibrated mechanism); we should cite it directly.

Gap / Limitation Noted in Paper:
The authors explicitly state their method reduces sycophancy largely *as a side effect of reaching consensus in fewer rounds* — they concede "further work is required (potentially looking into the training of the LLM and specification gaming) to understand what causes it and how to deal with the root cause." It requires training/fine-tuning a separate GPT-4o prompt-optimization model per dataset (added cost + a labeled training set of 150 samples), assumes a single correct answer, and does not generalize to open-ended tasks. Most importantly for us: it has **no within-debate trust weighting** — once a prompt is optimized, agents still aggregate by confidence + consistency, leaving the correct-minority-suppression failure mode only partially addressed. This is precisely the gap our evidence-grounded trust update fills.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Section 2 — Expert Detailed Analysis

### Q1–Q9 Quick Reference

| # | Question | Short Answer |
|---|---|---|
| Q1 | What problem and why important? | MAD suffers from sycophancy: agents copy/swap answers instead of reasoning, inflating cost (extra rounds) and suppressing correct minority answers. First systematic study of sycophancy *in MAD* (prior work only studied human→LLM sycophancy). |
| Q2 | What data (source, size, splits, ethics)? | 6 datasets: KITAB, CLUTRR, HotpotQA, Ethics, TriviaQA, GSM8K. 100 instances/dataset (random), each run ×3, mean reported. PO model fine-tuned on 150 samples (top 100 kept), disjoint from the 100 test. Public benchmarks, ACL Code of Ethics; no consent/PII issues. |
| Q3 | What features/inputs, how engineered? | Each agent emits answer + explanation + self-reported confidence ∈[0,1]. Triggers computed from: majority answer-retention (stall t₀), answer swapping (t₁), and explanation cosine similarity >0.8 on copied answers (t₂). No hand-crafted feature vector (contrast iMAD's 41 features). |
| Q4 | What methods/models, overall pipeline? | 4 phases: (1) independent zero-shot CoT answers; (2) multi-round debate w/ shared confidence; (3) trigger fires → fine-tuned GPT-4o rewrites the *task prompt* (gradient-descent-style prompt optimization); (4) team answer via confidence-weighted + consistency-weighted aggregation (Eq. 1), not a single judge. |
| Q5 | What baselines and why chosen? | Single-agent: Zero-shot, 5-shot CoT, SR+SC (Self-Refine + Self-Consistency). Multi-agent: Debate, Debate+Judge (same & cross model), ensemble, and **ReConcile** (Chen et al. 2024). Covers single→refine→debate→SOTA-debate spectrum. |
| Q6 | How evaluated (metrics, setup, tests)? | Accuracy, # rounds, % consensus, % sycophancy. 3 model families (Llama3 8B/70B, Mistral/OpenHermes, GPT-4o/4o-mini), temp 0.7, ≤5 rounds. Judge used to normalize answer equivalence ("4" vs "four"). No significance tests reported. |
| Q7 | Key results vs baselines? | SOTA on all 6 datasets. E.g. KITAB 0.82 vs best baseline 0.66 (ReConcile); TriviaQA 0.77 vs 0.65. Sycophancy reduced 7–30%. Post-trigger consensus in 1–2 rounds vs baseline stagnation. |
| Q8 | Limitations and biases? | Sycophancy reduction partly a by-product of fewer rounds (not root-cause fix); needs per-dataset fine-tuned PO model (extra cost + labels); assumes single correct answer; weak on open-ended/creative tasks; needs model diversity. Still uses self-reported confidence in aggregation. |
| Q9 | Code/data/artifacts available? | Code: https://github.com/priyapitre/CONSENSAGENT . Public benchmarks, no new dataset release. Fine-tuning via OpenAI playground (<$2/dataset). License not explicitly stated in paper. |

### 1. Publication Status & Citation

| Field | Value |
|---|---|
| **Venue** | Findings of the Association for Computational Linguistics: ACL 2025 (Vienna, Austria) |
| **DOI** | 10.18653/v1/2025.findings-acl.1141 (verified via ACL Anthology, 2026-07-17) |
| **Pages** | 22112–22133 |
| **ISBN** | 979-8-89176-256-5 |
| **Last verified** | 2026-07-17 — confirmed via ACL Anthology landing page + PDF footer ("©2025 ACL, pages 22112–22133") |
| **Code** | https://github.com/priyapitre/CONSENSAGENT |

**BibTeX:**
```bibtex
@inproceedings{pitre-etal-2025-consensagent,
  title     = "{CONSENSAGENT}: Towards Efficient and Effective Consensus in Multi-Agent {LLM} Interactions Through Sycophancy Mitigation",
  author    = "Pitre, Priya and Ramakrishnan, Naren and Wang, Xuan",
  editor    = "Che, Wanxiang and Nabende, Joyce and Shutova, Ekaterina and Pilehvar, Mohammad Taher",
  booktitle = "Findings of the Association for Computational Linguistics: ACL 2025",
  month     = jul,
  year      = "2025",
  address   = "Vienna, Austria",
  publisher = "Association for Computational Linguistics",
  url       = "https://aclanthology.org/2025.findings-acl.1141/",
  doi       = "10.18653/v1/2025.findings-acl.1141",
  pages     = "22112--22133",
  isbn      = "979-8-89176-256-5"
}
```

### 2. Core Contribution & Method

CONSENSAGENT makes two contributions: (1) a diagnostic study establishing that sycophancy is a first-class failure mode of MAD (not just human→LLM), and (2) a trigger-based prompt-optimization framework to mitigate it.

**Diagnostic study (§3):** Using two agents of the same family but different size/tuning (e.g. GPT-4o vs 4o-mini), they run standard MAD (≤5 rounds, stop on consensus) and measure a **sycophancy %** — the fraction of post-round-1 interactions where an agent copies/alternates another's answer. Key operationalization: an interaction is sycophantic if agents reach fast (1–2 round) consensus on a *wrong* answer with explanation cosine similarity >0.95 to the agent they were influenced by. Findings: sycophancy 21–48% across datasets/models; correct answer present-but-ignored in >20% of wrong cases; cyclic (mutual) sycophancy in 10–15% of cases; and ~50% of failures traceable to prompt misunderstanding, 40% to ambiguous instructions.

**Framework (§4) — four phases:**
1. **Phase 1 (Initial Response):** each agent Aᵢ produces answer a⁽⁰⁾ᵢ, explanation e⁽⁰⁾ᵢ, confidence p⁽⁰⁾ᵢ∈[0,1] via zero-shot CoT.
2. **Phase 2 (Multi-Round Debate):** agents exchange (answer, explanation, confidence) via a shared debate memory and revise; up to n rounds.
3. **Trigger Mechanism (§4.4):** three triggers — t₀ stall (majority retain answers without consensus), t₁ answer-swapping (majority swap → potential sycophancy), t₂ copying (explanation cosine similarity >0.8 vs the copied agent's prior-round explanation). Triggers fire *even if consensus is reached*, because the goal is accuracy, not just fast agreement.
4. **Phase 3 (Prompt Optimization):** a **fine-tuned GPT-4o** rewrites the *task prompt* using a gradient-descent-style procedure (Algorithm 1): at train time it generates 3 diagnostic "gradients" (issues) from (prompt, discussions, ground truth), proposes 3 refined prompts, evaluates each ×3 models ×3 trials (9 scores), keeps the best. The (original→optimized) pairs fine-tune GPT-4o so that at inference **no ground truth or agent interactions are needed** — input is just the original prompt, output the optimized prompt. Optimized prompts are longer (avg 30→100 words), clearer, more specific, with irrelevant context removed and explicit formatting instructions.
5. **Phase 4 (Team Answer):** if no consensus in 5 rounds, instead of a single judge (a "single point of failure"), agents with identical answers are grouped, and a **weighted average of confidence cᵢ with a frequency penalty plus a consistency factor Sᵣ** (favoring answers held from the start) selects the final answer (Eq. 1).

**Key design insight:** They fine-tune the PO model on (prompt→optimized-prompt) pairs *without* feeding past interactions at inference, having found that including interaction context "led to reduced stability and higher training loss." The interaction knowledge is baked in *implicitly* during training because agent errors are similar across instances of the same dataset.

### 3. Key Results (Extracted)

**Preliminary sycophancy diagnostic (Table 1, GPT-4o vs 4o-mini):**

| Dataset | Single-Agent Acc | MAD Acc | Rounds | Sycophancy % |
|---|---|---|---|---|
| KITAB | 0.63 | 0.57 | 3.3 | 21.2 |
| CLUTRR | 0.32 | 0.46 | 3.0 | 42.3 |
| HotpotQA | 0.34 | 0.47 | 2.9 | 30.2 |
| Ethics | 0.73 | 0.77 | 2.4 | 29.1 |
| GSM8K | 0.50 | 0.80 | 2.76 | 32.0 |
| TriviaQA | 0.35 | 0.48 | 3.3 | 31.6 |

Note KITAB: MAD *hurts* accuracy (0.63→0.57) — a direct example of sycophantic collapse degrading a correct majority.

**Main results (Table 2, best CONSENSAGENT row vs strongest baseline):**

| Dataset | Best Baseline | CONSENSAGENT | Δ |
|---|---|---|---|
| KITAB | 0.66 (ReConcile) | **0.82** | +0.16 |
| CLUTRR | 0.50 (5-shot CoT / SR+SC) | **0.62** | +0.12 |
| HotpotQA | 0.57 (Debate+Judge) | **0.61** | +0.04 |
| Ethics | 0.77 (GPT Debate+Judge) | **0.78** | +0.01 |
| GSM8K | 0.94 (5-shot CoT) | **0.96** | +0.02 |
| TriviaQA | 0.65 (ReConcile/Debate) | **0.77** | +0.12 |

- **Sycophancy reduced 7–30%** across datasets after Phase 3 (App. D).
- **Consensus efficiency (Table 3):** post-trigger convergence in ~1 round (e.g. Ethics 0.56, GSM8K 0.83 rounds after trigger) vs baseline stagnation (KITAB 3.78, CLUTRR 3.38 rounds). ~90% of debates reach consensus by round 3 vs <70% for baseline.
- **Sycophancy-related triggers (t₂, t₃) fire in 15–40% of instances; stall trigger t₁ in 3–7%** — quantifying how prevalent sycophancy is.

**Ablation (Table 4):** Removing prompt optimization (Phase 3) causes the sharpest accuracy drop — it is the dominant component. Confidence and consistency each add ~2–3%. Generic (multi-dataset) PO training still yields ~+7% over the strongest baseline, showing the method does not strictly require per-dataset labels.

**Ablation vs simpler prompt methods (Table 6):** Fine-tuned PO (Ours) beats generic-instruction prompt-fixing (IT) and in-context prompt optimization without ground truth (IC) by 10–20%, confirming the ground-truth-based training is doing real work.

### 4. Paper's Self-Admitted Limitations

From the Limitations section and body directly:

1. **Root cause not addressed:** "While we reduce sycophancy due to reduced rounds and an optimized goal, further work is required (potentially looking into the training of the LLM and specification gaming) to understand what causes it and how to deal with the root cause." — They mitigate the *symptom* (extra rounds), not the trust dynamics.
2. **Extra training cost:** the framework "adds the expense of training a separate prompt optimization model" (fine-tuned GPT-4o, 150 labeled samples per dataset).
3. **Single-correct-answer assumption:** "it assumes a single correct answer when optimizing prompts, making it less suitable for tasks with multiple valid solutions."
4. **Poor fit for open-ended/creative tasks:** "may not generalize well to open-ended or creative reasoning tasks."
5. **Depends on model diversity:** "if agents are too similar, the benefits of debate diminish."
6. **Still confidence-based aggregation:** Phase 4 relies on self-reported confidence + consistency — a signal shown elsewhere (and in our thesis) to be manipulable under social pressure. The paper does not treat this as a vulnerability.

### 5. Direct Comparison to Our Idea

| Dimension | CONSENSAGENT | Our Idea |
|---|---|---|
| **Problem** | Sycophancy in MAD (cost + suppressed correct answers) | **Same problem** — sycophantic consensus collapse |
| **Where it intervenes** | *Pre-debate* — rewrites the task prompt on trigger | *During debate* — re-weights agent influence per round |
| **Mechanism** | Fine-tuned GPT-4o prompt optimization | Evidence-grounded numeric trust re-weighting (TCM) |
| **Trust signal** | None during debate; Phase 4 uses self-reported confidence + consistency | **External retrieved scientific evidence** verifying claims |
| **Root cause claim** | Prompt ambiguity is a major driver | Social-pressure trust miscalibration is the driver |
| **Training cost** | Per-dataset fine-tuned PO model + labels | Ideally training-free / retrieval-based (differentiator) |
| **Target metric** | Accuracy, rounds, % consensus, % sycophancy | Sycophantic collapse (CCR/MPR/ECR) + accuracy |

**Overlap with C1 (trust mechanism):** **This is where the threat is highest.** Both works want to stop a correct minority from being overwhelmed. But CONSENSAGENT has *no explicit per-agent trust variable* — it clarifies the prompt so agents are less likely to be confused, and aggregates by confidence/consistency at the end. Our C1 introduces a continuous, evidence-driven trust weight updated *within* rounds. We must state this distinction sharply: **prompt clarification ≠ agent trust calibration.** Their method would not help a case where the prompt is perfectly clear but a confident majority is simply wrong; ours is designed exactly for that case.

**Overlap with C2 (evaluation harness):** **High and useful.** Their sycophancy % metric (copy/swap detection via explanation cosine similarity), the "correct answer present but ignored >20%" measurement, and their round-count/consensus-rate curves are direct precedents for our CCR/MPR/ECR harness. We should adopt/extend their sycophancy operationalization and cite it as the methodological baseline our metrics improve on (they measure copying; we additionally measure whether the *correct minority* specifically was overturned).

**Key divergence:** CONSENSAGENT treats sycophancy as downstream of prompt ambiguity and self-reported confidence; we treat it as a trust-calibration failure fixable only with an *external* ground-truth signal (retrieved evidence). Their reliance on self-reported confidence in Phase 4 is the seam our work targets.

### 6. Our Positioning Strategy

| Role | Detail |
|---|---|
| **In our paper** | Primary competitor and nearest neighbor — the "prompt-optimization branch" of sycophancy mitigation |
| **How we cite** | As the first systematic MAD-sycophancy study (strong motivation) *and* as the method we differentiate from on mechanism (prompt rewriting vs in-debate evidence-grounded trust) |
| **Relationship** | Same problem, orthogonal mechanism — must include an explicit differentiation paragraph |

**Pre-emptive rebuttal paragraph** (if a reviewer asks "how is this different from CONSENSAGENT?"):
> CONSENSAGENT (Pitre et al., 2025) is the closest prior work: it is the first to systematically diagnose sycophancy in multi-agent debate and shares our motivation that correct minority answers are lost to conformity. However, its mitigation is *pre-debate prompt optimization* — a fine-tuned model rewrites the task prompt to remove ambiguity — on the hypothesis that much sycophancy stems from unclear prompts. This leaves untouched the case we target: a perfectly clear prompt on which a confidently wrong majority overwhelms a correct minority. Moreover, CONSENSAGENT's final aggregation still weights agents by *self-reported confidence*, precisely the signal we argue is manipulable under social pressure. Our contribution is an in-session, evidence-grounded trust re-weighting that scales each agent's influence by *externally retrieved scientific evidence* rather than by prompt clarity or self-reported confidence. The two are complementary — CONSENSAGENT could clean the prompt before our trust-calibrated aggregation runs — but they solve mechanistically distinct subproblems, and only ours addresses trust calibration during the debate itself.

### 7. Code & Reproducibility

| Field | Detail |
|---|---|
| **Repo** | https://github.com/priyapitre/CONSENSAGENT |
| **Language** | Python; OpenAI API (GPT-4o/4o-mini), vLLM for local Llama/Mistral, Groq for faster Llama |
| **Models used** | Llama3 (8B/70B Instruct), Mistral 7B / OpenHermes2-Mistral-7B, GPT-4o / GPT-4o-mini |
| **PO fine-tuning** | OpenAI playground, ~10–15 min, <$2/dataset; input = original prompt, output = optimized prompt |
| **License** | Not explicitly stated in paper — check repo |
| **Reimplementation effort** | Moderate–high: the Phase 3 fine-tuned PO model is the crux and requires building the (prompt→optimized) training set with the 3-gradient / 9-trial selection loop; Phase 4 Eq. 1 (confidence + frequency penalty + consistency) must be reconstructed from text (equation image not fully transcribed) |
| **Key challenge for replication** | Exact confidence/consistency aggregation weights in Eq. 1 are not fully specified in the extracted text; the trigger thresholds (cosine >0.8 copy, >0.95 sycophancy-confirmation) are stated and reproducible |

### 8. Cross-References

| Paper in this review | Relationship |
|---|---|
| **iMAD (Fan et al., 2026)** | Complementary axis: iMAD decides *whether* to debate (efficiency); CONSENSAGENT decides *how to fix* a debate that has gone sycophantic (prompt rewriting). Neither does in-debate trust weighting. Both, like DOWN, ultimately trust self-reported confidence — reinforcing our Challenge C. |
| **ReConcile (Chen et al., 2024)** | CONSENSAGENT's strongest MAD baseline; ReConcile improves debate via convincing examples + confidence, CONSENSAGENT beats it by rewriting the prompt instead. A likely baseline for us too. |
| **MAD (Liang et al., 2024) / Du et al. 2023** | The vanilla debate formulation CONSENSAGENT diagnoses and builds on — same base as iMAD and our work. |
| **Sharma et al. 2023 / Denison et al. 2024** | Human→LLM sycophancy + specification-gaming origin; CONSENSAGENT extends this to agent→agent. Shared motivation citations for our intro. |
| **DebUnc (Yoffe et al., 2025)** | Closest on *mechanism* to us (uncertainty-based in-loop weighting) — but still self-reported; pending its own entry. CONSENSAGENT does not cite it. |

### 9. Relevance to FYDP

★★★★★

**Justification:** This is the highest-relevance paper in the review and the primary threat to our novelty claim — it is the first published, peer-reviewed (ACL 2025 Findings) work to name and mitigate sycophancy in multi-agent debate, our exact problem. Every team member must read it before the proposal defense. It is simultaneously our best *motivation* citation (its "correct answer present but ignored >20%" finding is the empirical hook for our whole project) and the work we must most carefully differentiate from. The differentiation is defensible and clean: CONSENSAGENT mitigates sycophancy indirectly via *pre-debate prompt rewriting* and still aggregates on self-reported confidence, whereas we introduce *in-debate, evidence-grounded trust re-weighting*. Adopt their sycophancy metric as a C2 baseline; sharpen the C1 differentiation paragraph (§6) into the related-work section verbatim.
