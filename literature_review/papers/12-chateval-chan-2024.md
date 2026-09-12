# 📄 Paper #12 — ChatEval

![Paper](https://img.shields.io/badge/Paper-%2312-1f6feb?style=for-the-badge)
![Role](https://img.shields.io/badge/Role-Context%20(multi--agent%20judge)-6e40c9?style=for-the-badge)
![Threat](https://img.shields.io/badge/Threat%20to%20Novelty-Low-2ea043?style=for-the-badge)
![Venue](https://img.shields.io/badge/Venue-ICLR%202024-6e40c9?style=for-the-badge)
![Verified](https://img.shields.io/badge/Verified-2026--09--12-8957e5?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-not%20read%20yet-d29922?style=for-the-badge)

> *Status: queued to read — draft compiled from the ICLR 2024 paper (arXiv v1); not yet read by the team. Update after reading.*

Paper Title:
ChatEval: Towards Better LLM-based Evaluators through Multi-Agent Debate

Authors & Year:
Chi-Min Chan, Weize Chen, Yusheng Su, Jianxuan Yu, Wei Xue, Shanghang Zhang, Jie Fu, Zhiyuan Liu — 2024

Link:
https://openreview.net/forum?id=FQepisCUWu (ICLR 2024)
arXiv: https://arxiv.org/abs/2308.07201
Code: https://github.com/chanchimin/ChatEval

Summary:
ChatEval builds a multi-agent "referee team" of role-played LLM evaluators (e.g., critic, scientist, general public) that debate the quality of candidate outputs across rounds before a final judgment. Inspired by how human evaluation uses multiple annotators, the paper shows the debate panel aligns better with human judgments than single-agent LLM-as-a-judge, on open-ended question answering and dialogue response generation. Two key findings: diverse role prompts are essential (using the same role prompt degrades performance), and the choice of communication strategy (one-by-one, simultaneous, interactive) and panel size affect results. The released library is composable for experimenting with other communication strategies.

Relevant to Our Idea:
ChatEval is an early, foundational demonstration that structured multi-agent debate can outperform a single judge for evaluation/judgment — directly analogous to our system's adjudication step, and a strong precedent for "why multiple agents judge at all" before we contrast *how* we judge. Critically, ChatEval's improvement comes from persona diversity + discussion structure alone; the final decision rests on the panel's own internal judgment, with no retrieval or verification against external sources. That is precisely the gap our evidence-grounded trust weighting fills at aggregation.

Gap / Limitation Noted in Paper:
Evaluation quality depends entirely on the panel agents' internal knowledge and reasoning. On tasks needing domain-specific factual correctness (not just text-quality judgment), the panel could confidently and unanimously misjudge a response, and nothing in the framework is designed to catch that.

---

## Section 2 — Expert Detailed Analysis

### Q1–Q9 Quick Reference

| # | Question | Short Answer |
|---|---|---|
| Q1 | What problem and why important? | Human text evaluation is costly; single LLM-as-a-judge is limited; a multi-agent debate panel can better approximate human evaluation. |
| Q2 | What data (source, size, splits, ethics)? | Two benchmark families: open-ended question answering (human-annotated, e.g., FairEval) and dialogue response generation (e.g., Topical-Chat). Public; no human subjects. |
| Q3 | What features/inputs, how engineered? | Role prompts (personas) + agent responses as chat history; communication strategy templates. No learned features. |
| Q4 | What methods/models, overall pipeline? | N role-specialized LLM agents discuss candidate responses over multiple turns; each agent produces a score/judgment; final judgment aggregated after debate. |
| Q5 | What baselines and why chosen? | Single-agent LLM-as-a-judge (same backbone), classical metrics (BLEU/ROUGE/BERTScore) as correlation references, human judgments as ground truth. |
| Q6 | How evaluated (metrics, setup, tests)? | Agreement/correlation with human judgments (accuracy of best-worst selection, Spearman/Pearson correlations); ablations on role diversity, communication strategy, role number, discussion turns. |
| Q7 | Key results vs baselines? | ChatEval > single-agent judges in alignment with humans; identical role prompts degrade performance; panel size and turn count have optima. |
| Q8 | Limitations and biases? | Internal knowledge only (no retrieval); judge personas can inject their own biases; no correctness verification; LLM-judge reliability remains an open issue. |
| Q9 | Code/data/artifacts available? | Code: https://github.com/chanchimin/ChatEval (built on AgentVerse) |

### 1. Publication Status & Citation

| Field | Value |
|---|---|
| **Venue** | ICLR 2024 (The Twelfth International Conference on Learning Representations) |
| **OpenReview** | FQepisCUWu |
| **Last verified** | 2026-09-12 — arXiv metadata (authors/title) + OpenReview forum ID (from user; venue known) |
| **Code** | https://github.com/chanchimin/ChatEval |

**Proposed BibTeX (to add to `fydp.bib` after reading):**
```bibtex
@inproceedings{chan2024chateval,
  author = {Chan, Chi-Min and Chen, Weize and Su, Yusheng and Yu, Jianxuan and Xue, Wei and Zhang, Shanghang and Fu, Jie and Liu, Zhiyuan},
  title = {{C}hat{E}val: Towards Better {LLM}-based Evaluators through Multi-Agent Debate},
  booktitle = {The Twelfth International Conference on Learning Representations},
  year = {2024},
  url = {https://openreview.net/forum?id=FQepisCUWu}
}
```

### 2. Core Contribution & Method

1. **Referee panel** — multiple LLM agents with distinct personas (critic, scientist, general public, etc.) evaluate candidate outputs.
2. **Debate dynamics** — agents see each other's judgments (chat history) and discuss over multiple turns.
3. **Communication strategies** — one-by-one, simultaneous, interactive; compared empirically with ablations.
4. **Finding: diversity is load-bearing** — uniform role prompts significantly degrade performance; the paper's qualitative analysis argues the process goes beyond textual scoring toward human-mimicking evaluation.

### 3. Key Results (Extracted)

| Finding | Detail |
|---|---|
| Main result | Multi-agent debate panel aligns better with human judgments than single-agent judges |
| Role prompts | Diverse personas essential; identical role prompts degrade results |
| Panel/turns | Role number and discussion turns have a performance sweet spot |
| Exact correlation numbers | **Verify on read** — extract tables from Experiments section |
| Benchmarks | Open-ended QA (human-annotated) + dialogue response generation |

### 4. Paper's Self-Admitted Limitations

- Panel knowledge is internal; no external retrieval or fact-checking.
- Evaluation of open-ended text quality, not scientific factual QA — the skills do not directly transfer to our domain.
- LLM judges remain only as reliable as their backbone, and the paper's own persona effects suggest non-trivial judge variance.
- Compute cost scales with panel size × turns.

### 5. Direct Comparison to Our Idea

| Dimension | ChatEval | Our Idea |
|---|---|---|
| **Task** | Evaluate text quality (judgment) | Answer hard scientific questions (reasoning) |
| **Decision basis** | Panel's internal judgments after debate | Evidence-verified claims + trust-weighted aggregation |
| **Role diversity** | Personas (critic/scientist/etc.) | Heterogeneous model families + source-partitioned retrieval |
| **External grounding** | None | PubMed / ArXiv / Semantic Scholar |
| **Measurement** | Agreement with human judgment | CCR / MPR / ECR + accuracy |

### 6. Our Positioning Strategy

- **In our paper:** cite as precedent for multi-agent adjudication and for diversity being load-bearing; then contrast on evidence grounding.
- **How we cite:** "Multi-agent judging improves alignment with human evaluation (Chan et al., 2024), but relies on the panel's internal knowledge; our adjudication weights agents by externally verified evidence."
- **Pre-emptive rebuttal:** "why not just use an LLM judge panel?" — panels still share blind spots and cannot verify claims; our trust score is external to the debate's own social dynamics.

### 7. Code & Reproducibility

| Field | Detail |
|---|---|
| **Repo** | https://github.com/chanchimin/ChatEval (built on OpenBMB/AgentVerse) |
| **LLMs** | API models (GPT-3.5/4 era) for panel agents |
| **Reuse for us** | Persona-role prompt patterns and panel-size/turn ablations as design reference for our human-eval protocol |

### 8. Cross-References

| Paper in this review | Relationship |
|---|---|
| Liang et al. (2024, #11) | Judge in MAD; both rely on internal judgment — ChatEval scales it to a panel |
| MoA (Wang et al., 2025) | Aggregation via layer of LLM proposers/aggregator — also ungrounded |
| ReConcile (bib) | Round-table multi-agent reasoning with confidence-weighted voting — internal signal |
| MAST (Cemri et al., 2025, #9) | Task-verification failures: panels without verification can confidently misjudge |
| DebUnc (Yoffe et al., 2025) | In-loop uncertainty weighting; internal signal vs our external evidence |

### 9. Relevance to FYDP

★★★☆☆

**Justification:** Foundational citation for multi-agent evaluation/judging and persona diversity; useful to justify and then contrast our adjudication step. Lower threat than the debate-mechanism papers, but high citation value in related work.

### 10. Reading Checklist (fill after team read)

- [ ] Exact benchmark names and human-agreement numbers
- [ ] Communication strategy definitions (reusable in our prompt design?)
- [ ] Role-prompt templates from appendix
- [ ] Cost analysis vs single judge
