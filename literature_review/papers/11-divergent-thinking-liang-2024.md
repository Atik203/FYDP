# 📄 Paper #11 — Encouraging Divergent Thinking (MAD / DoT)

![Paper](https://img.shields.io/badge/Paper-%2311-1f6feb?style=for-the-badge)
![Role](https://img.shields.io/badge/Role-Context%20(DoT%20diagnosis)-6e40c9?style=for-the-badge)
![Threat](https://img.shields.io/badge/Threat%20to%20Novelty-Low-2ea043?style=for-the-badge)
![Venue](https://img.shields.io/badge/Venue-EMNLP%202024%20(Main)-6e40c9?style=for-the-badge)
![Verified](https://img.shields.io/badge/Verified-2026--09--12-8957e5?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-not%20read%20yet-d29922?style=for-the-badge)

> *Status: queued to read — draft compiled from the EMNLP 2024 camera-ready PDF; not yet read by the team. Update after reading.*

Paper Title:
Encouraging Divergent Thinking in Large Language Models through Multi-Agent Debate

Authors & Year:
Tian Liang, Zhiwei He, Wenxiang Jiao, Xing Wang, Yan Wang, Rui Wang, Yujiu Yang, Shuming Shi, Zhaopeng Tu — 2024

Link:
https://aclanthology.org/2024.emnlp-main.992/ (EMNLP 2024 Main, pp. 17889–17904)
Code: https://github.com/Skytliang/Multi-Agents-Debate

Summary:
The authors define and diagnose the **Degeneration-of-Thought (DoT)** problem: once an LLM establishes confidence in an answer, self-reflection cannot generate genuinely novel thoughts even when the initial answer is wrong (shown by low disagreement between adjacent self-reflection iterations). Their fix is a MAD framework with two debaters arguing in a "tit for tat" state under a judge agent, which manages the process and produces the final answer. On Commonsense Machine Translation and Counter-Intuitive Arithmetic Reasoning, their MAD outperforms self-reflection baselines — GPT-3.5-Turbo with MAD even surpasses GPT-4 on Common MT. Two design findings matter: an adaptive debate-break strategy is required (debating too long hurts), and a "modest" level of tit-for-tat is needed. They also show LLM judges favor the side sharing their backbone model.

Relevant to Our Idea:
DoT is a mechanism-level explanation for why debate without an external correction signal entrenches rather than truth-seeks — directly supporting our claim that social pressure (not evidence) drives convergence in standard MAD. The judge-agent design is our sharpest contrast case: like ReConcile and MoA, the judge's decision is an internal LLM's own judgment, with no evidence grounding, and the paper itself demonstrates judge backbone bias — a concrete instance of the trust problem our evidence-grounded trust score addresses. The "timing/break" findings also inform our K=3 round cap and adaptive triggering.

Gap / Limitation Noted in Paper:
The tit-for-tat structure forces disagreement but cannot determine which side is actually correct beyond the judge's own reasoning — debate is treated as adversarial rhetoric, not evidence verification, so a persuasive but factually wrong side can win when the judge is misled. The paper itself notes judges are biased toward same-backbone debaters, and it proposes no external verification or trust calibration.

---

## Section 2 — Expert Detailed Analysis

### Q1–Q9 Quick Reference

| # | Question | Short Answer |
|---|---|---|
| Q1 | What problem and why important? | Self-reflection suffers from Degeneration-of-Thought: confident wrong answers never get genuinely revised; debate is proposed to force divergent thinking. |
| Q2 | What data (source, size, splits, ethics)? | Two challenge tasks: Commonsense Machine Translation (Common MT) and Counter-Intuitive Arithmetic Reasoning. Public datasets; no ethics discussion beyond standard benchmark use. |
| Q3 | What features/inputs, how engineered? | Prompt-level: meta prompts specify topic, debater count, iteration limit, and "tit for tat" requirement; no learned features. |
| Q4 | What methods/models, overall pipeline? | Two debaters + one judge; iterative argumentation with meta prompts; adaptive break when debate saturates; judge renders final answer. Models: GPT-3.5-Turbo (and GPT-4 comparisons). |
| Q5 | What baselines and why chosen? | Self-reflection variants (the DoT baseline), CoT, standard prompting; GPT-4 as an upper reference on Common MT. |
| Q6 | How evaluated (metrics, setup, tests)? | Task metrics on both datasets (translation quality on Common MT; accuracy on Counter-Intuitive AR); disagreement-rate analysis across iterations (Fig. 1); ablations on break strategy and tit-for-tat level; judge-bias analysis. |
| Q7 | Key results vs baselines? | MAD > self-reflection; GPT-3.5-Turbo + MAD surpasses GPT-4 on Common MT; adaptive break necessary; modest tit-for-tat optimal; LLM judges favor same-backbone debaters. |
| Q8 | Limitations and biases? | Judge bias (same-backbone preference) undermines single-model judging; no external evidence verification; two task types only; debate correctness depends on judge capability. |
| Q9 | Code/data/artifacts available? | Code: https://github.com/Skytliang/Multi-Agents-Debate |

### 1. Publication Status & Citation

| Field | Value |
|---|---|
| **Venue** | EMNLP 2024 — Main Conference (Miami, Florida, USA) |
| **Pages** | 17889–17904 |
| **DOI** | 10.18653/v1/2024.emnlp-main.992 |
| **Last verified** | 2026-09-12 — ACL Anthology landing page (authors, pages, DOI) |
| **Code** | https://github.com/Skytliang/Multi-Agents-Debate |

**Proposed BibTeX (to add to `fydp.bib` after reading):**
```bibtex
@inproceedings{liang2024divergent,
  title = {Encouraging Divergent Thinking in Large Language Models through Multi-Agent Debate},
  author = {Liang, Tian and He, Zhiwei and Jiao, Wenxiang and Wang, Xing and Wang, Yan and Wang, Rui and Yang, Yujiu and Shi, Shuming and Tu, Zhaopeng},
  editor = {Al-Onaizan, Yaser and Bansal, Mohit and Chen, Yun-Nung},
  booktitle = {Proceedings of the 2024 Conference on Empirical Methods in Natural Language Processing},
  month = nov,
  year = {2024},
  address = {Miami, Florida, USA},
  publisher = {Association for Computational Linguistics},
  pages = {17889--17904},
  doi = {10.18653/v1/2024.emnlp-main.992},
  url = {https://aclanthology.org/2024.emnlp-main.992/}
}
```

### 2. Core Contribution & Method

1. **DoT diagnosis** — formal definition + empirical disagreement curve: self-reflection's adjacent-iteration disagreement collapses, while debate sustains it (Fig. 1). Three named causes: bias/distorted perception, rigidity/resistance to change, limited external feedback.
2. **MAD framework** — two debaters in forced "tit for tat" + a judge managing rounds and delivering the final solution.
3. **Adaptive break strategy** — debate must be stopped when it saturates; longer debate can degrade performance.
4. **Judge-bias finding** — an LLM judge prefers arguments from the same backbone family; the authors warn LLMs "might not be a fair judge if different LLMs are used for agents."

*"Limited external feedback" as a named DoT cause is the direct opening for our mechanism: we supply external feedback (retrieved evidence) in-debate instead of relying on internal critique alone.*

### 3. Key Results (Extracted)

| Finding | Detail |
|---|---|
| DoT evidence | Self-reflection disagreement between adjacent iterations stays low; debate keeps agents opposed |
| Headline | GPT-3.5-Turbo + MAD surpasses GPT-4 on Common MT |
| Design findings | Adaptive break required; modest tit-for-tat level optimal |
| Judge bias | LLM judge favors same-backbone agents |
| Exact scores | **Verify on read** — extract per-task tables |

### 4. Paper's Self-Admitted Limitations

- Judge reliability depends on the backbone and shows same-family preference (their own reported bias).
- Correctness ultimately rests on the judge's internal reasoning; no external evidence.
- Only two task families evaluated (translation + arithmetic).
- No treatment of sycophancy pressure, trust weighting, or adversarial injection.

### 5. Direct Comparison to Our Idea

| Dimension | Liang et al. MAD | Our Idea |
|---|---|---|
| **Debate purpose** | Force divergent thinking / avoid DoT | Prevent sycophantic collapse of a correct minority |
| **Correction signal** | Peer arguments + judge's internal reasoning | External retrieved evidence per atomic claim |
| **Aggregation** | Judge decides | Trust-weighted aggregation (evidence-calibrated) |
| **Stop rule** | Adaptive break | K=3 rounds + confidence gate |
| **Bias handled?** | Reported (judge bias) but not fixed | Explicitly targeted via evidence-grounded trust |

### 6. Our Positioning Strategy

- **In our paper:** cite for DoT and the internal-judge limitation; frame our mechanism as adding the "external feedback" dimension DoT identifies as missing.
- **How we cite:** "LLM judges can favor same-family agents and debate alone offers no correctness signal (Liang et al., 2024); we replace judge-internal judgment with evidence-calibrated trust."
- **Pre-emptive rebuttal:** "isn't MAD already shown to work?" — yes on divergent-thinking tasks, but via internal critique and an unverified judge, which is exactly the channel sycophantic pressure exploits.

### 7. Code & Reproducibility

| Field | Detail |
|---|---|
| **Repo** | https://github.com/Skytliang/Multi-Agents-Debate |
| **LLMs** | GPT-3.5-Turbo / GPT-4 (API) |
| **Reuse for us** | Meta-prompt structure and adaptive-break idea; the judge-bias result as motivation for external trust |

### 8. Cross-References

| Paper in this review | Relationship |
|---|---|
| Du et al. (2024, `du2024improving`) | Canonical MAD; Liang et al. is the widely cited variant with judge + DoT |
| ChatEval (Chan et al., 2024, #12) | Multi-agent judge panel; also internal-only judgment |
| Debate or Vote (Choi et al., 2025) | Shows neutral debate ≈ voting; Liang's judge is another aggregation channel without evidence |
| MAST (Cemri et al., 2025, #9) | Premature-consensus failure modes connect to DoT dynamics |

### 9. Relevance to FYDP

★★★☆☆

**Justification:** Important motivation and contrast for the judge/adjudication step; introduces DoT and documents judge bias — both directly usable in our related work. Not a competitor: no trust mechanism, no evidence grounding, and our aggregation differs structurally.

### 10. Reading Checklist (fill after team read)

- [ ] Extract per-task result tables (Common MT, Counter-Intuitive AR)
- [ ] Exact adaptive-break criterion and tit-for-tat formulation
- [ ] Judge-bias experiment details (how measured)
- [ ] Confirm code license and prompt templates for potential reuse
