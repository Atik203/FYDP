# 📄 Paper #9 — MAST (Why Do Multi-Agent LLM Systems Fail?)

![Paper](https://img.shields.io/badge/Paper-%239-1f6feb?style=for-the-badge)
![Role](https://img.shields.io/badge/Role-Context%20(failure%20taxonomy)-6e40c9?style=for-the-badge)
![Threat](https://img.shields.io/badge/Threat%20to%20Novelty-Low-2ea043?style=for-the-badge)
![Venue](https://img.shields.io/badge/Venue-NeurIPS%202025%20(D%26B%20Track)-6e40c9?style=for-the-badge)
![Verified](https://img.shields.io/badge/Verified-2026--09--12-8957e5?style=for-the-badge)
![Read](https://img.shields.io/badge/Read-2026--09--12-2ea043?style=for-the-badge)

> *Read and confirmed 2026-09-12 — compiled from the published paper (arXiv v3 + MAST artifacts). Bib entry `cemri2025why` added to `fydp.bib`.*

Paper Title:
Why Do Multi-Agent LLM Systems Fail?

Authors & Year:
Mert Cemri, Melissa Z. Pan, Shuyi Yang, Lakshya A. Agrawal, Bhavya Chopra, Rishabh Tiwari, Kurt Keutzer, Aditya Parameswaran, Dan Klein, Kannan Ramchandran, Matei Zaharia, Joseph E. Gonzalez, Ion Stoica (UC Berkeley) — 2025

Link:
https://arxiv.org/abs/2503.13657 (NeurIPS 2025, Datasets and Benchmarks Track)
Code: https://github.com/multi-agent-systems-failure-taxonomy/MAST
Data: https://huggingface.co/datasets/mcemri/MAST-Data

Summary:
The authors build MAST-Data (1,642 annotated execution traces from 7 popular multi-agent frameworks) and MAST, the first empirically grounded taxonomy of multi-agent system (MAS) failures: 14 failure modes in 3 categories — (i) system design/specification issues, (ii) inter-agent misalignment, and (iii) task verification. MAST was derived via grounded theory over 150+ traces with six expert annotators, reaching human inter-annotator agreement κ = 0.88; a calibrated LLM-as-a-judge pipeline (OpenAI o1, κ = 0.77 vs humans, 0.79 on unseen MAS) enables scalable annotation. Across 7 state-of-the-art open-source MAS, failure rates run 41%–86.7%, and gains over single-agent baselines or best-of-N are often minimal.

Relevant to Our Idea:
This is the strongest empirical motivation available for the claim that multi-agent systems fail in recurring, classifiable ways — not just occasionally. Several MAST modes map directly onto our target phenomenon: agents failing to incorporate correct/verified information, premature or incorrect consensus, and unverified claims being accepted are exactly the sycophantic-collapse and correct-minority-suppression dynamics our trust-calibrated aggregation addresses. MAST gives us an independently validated vocabulary for the motivation section (beyond our own injection-protocol results) and its κ-validated LLM-judge pipeline is a precedent for our human-eval/scalable-annotation design.

Gap / Limitation Noted in Paper:
MAST is diagnostic, not corrective — it classifies and measures failure modes but proposes no mechanism to fix any of them, and explicitly says "achieving robust MAS reliability often requires more than isolated fixes." It does not isolate sycophancy specifically as a trust-signal problem; "inter-agent misalignment" is one broad category, not a mechanism-level diagnosis of trust mis-calibration.

---

## Section 2 — Expert Detailed Analysis

### Q1–Q9 Quick Reference

| # | Question | Short Answer |
|---|---|---|
| Q1 | What problem and why important? | MAS gains are often minimal vs single-agent/best-of-N; the community lacks a principled account of *why* MAS fail. MAST provides the first large-scale annotated failure dataset + taxonomy. |
| Q2 | What data (source, size, splits, ethics)? | MAST-Data: 1,642 traces from 7 MAS (ChatDev, MetaGPT, HyperAgent, AppWorld, AG2 MathChat, Magentic-One, OpenManus) over coding/math/general-agent tasks; MAST-Data-human: 21 traces × 3 human experts for IAA. Public release. |
| Q3 | What features/inputs, how engineered? | Execution traces (agent conversation + actions + tool calls) annotated with MAST modes. Taxonomy built via grounded theory, not engineered features. |
| Q4 | What methods/models, overall pipeline? | (1) Grounded-theory derivation of MAST from 150+ traces; (2) human κ study; (3) LLM-as-a-judge annotator (o1) calibrated to humans; (4) large-scale annotation + failure analysis across models/tasks. |
| Q5 | What baselines and why chosen? | Comparative analysis across 4 model families (GPT-4 series, Claude 3.7, Qwen2.5-Coder-32B, CodeLlama-7B) and 3 task types; failure rates vs single-agent/best-of-N baselines cited from prior work. |
| Q6 | How evaluated (metrics, setup, tests)? | Inter-annotator agreement (κ = 0.88 human; 0.77/0.79 LLM judge), failure-rate distributions per mode/category per framework/model, case-study interventions (e.g., +9.4% ChatDev task success after a MAST-guided fix). |
| Q7 | Key results vs baselines? | 41%–86.7% failure rate across 7 SOTA MAS; 14 modes / 3 categories; most failures trace to system design, not base-model capability; simple fixes help but rarely suffice. |
| Q8 | Limitations and biases? | Taxonomy is not exhaustive; traces skew to open-source MAS and specific benchmarks/model families; annotation pipeline itself uses an LLM judge (residual judge bias); no corrective mechanism proposed. |
| Q9 | Code/data/artifacts available? | Code: GitHub MAST repo; Data: HF `mcemri/MAST-Data`; tooling: `pip install agentdash`; LLM annotator released. |

### 1. Publication Status & Citation

| Field | Value |
|---|---|
| **Venue** | NeurIPS 2025 — Datasets and Benchmarks Track |
| **arXiv** | 2503.13657v3 (submitted 2025-03-17, revised 2025-10-26) |
| **Last verified** | 2026-09-12 — venue + full author list verified via arXiv API; artifacts verified from paper text |
| **Code** | https://github.com/multi-agent-systems-failure-taxonomy/MAST |
| **Data** | https://huggingface.co/datasets/mcemri/MAST-Data |

**Proposed BibTeX (to add to `fydp.bib` after reading):**
```bibtex
@inproceedings{cemri2025why,
  author = {Cemri, Mert and Pan, Melissa Z. and Yang, Shuyi and Agrawal, Lakshya A. and Chopra, Bhavya and Tiwari, Rishabh and Keutzer, Kurt and Parameswaran, Aditya and Klein, Dan and Ramchandran, Kannan and Zaharia, Matei and Gonzalez, Joseph E. and Stoica, Ion},
  title = {Why Do Multi-Agent {LLM} Systems Fail?},
  booktitle = {Advances in Neural Information Processing Systems},
  year = {2025},
  note = {Datasets and Benchmarks Track},
  url = {https://arxiv.org/abs/2503.13657}
}
```

### 2. Core Contribution & Method

1. **MAST-Data** — 1,642 execution traces annotated with failure modes, collected from 7 MAS frameworks across coding (ProgramDev, SWE-Bench Lite), math (GSM-Plus, OlympiadBench, MMLU), and general-agent (GAIA, Test-C) benchmarks.
2. **MAST taxonomy** — 14 failure modes grouped into 3 categories, derived by grounded theory from 150+ traces (~15,000 lines each) with six expert annotators:
   - **(i) System design / specification issues** — e.g., disobeying role specification, step repetition, conversation reset (the case study targets Mode 1.2 with a +9.4% fix in ChatDev).
   - **(ii) Inter-agent misalignment** — e.g., agents failing to incorporate other agents' correct input, withholding information, ignoring verified evidence.
   - **(iii) Task verification** — e.g., premature termination/consensus, incomplete verification, incorrect verification.
3. **LLM-as-a-judge annotator** — calibrated o1-based pipeline with κ = 0.77 agreement with human experts, validated at κ = 0.79 on two unseen MAS/benchmarks.
4. **Failure analysis** — 41%–86.7% failure rates; failure patterns persist across model families and tasks, suggesting design-level rather than model-level causes.

*Modes most relevant to us: inter-agent misalignment (correct information not incorporated) and task verification (premature consensus, unverified claims accepted) — both are direct relatives of sycophantic collapse, but MAST stops at measurement.*

### 3. Key Results (Extracted)

| Finding | Detail |
|---|---|
| Failure rate across 7 SOTA open-source MAS | 41%–86.7% |
| Taxonomy | 14 modes / 3 categories |
| Human IAA | κ = 0.88 |
| LLM judge agreement | κ = 0.77 (human), κ = 0.79 (unseen MAS) |
| Case-study intervention | +9.4% ChatDev task success after MAST-guided workflow fix (CEO final say) |
| Annotation scale | 1,642 traces; 21 human-annotated for IAA |

### 4. Paper's Self-Admitted Limitations

- MAST "does not claim to cover every potential failure pattern."
- Robust reliability "often requires more than isolated fixes… more complex solutions and fundamental MAS redesigns" — an explicit invitation for mechanism-level work like ours.
- Annotation scope is bounded by the 7 chosen frameworks, benchmarks, and 4 model families.
- The LLM annotator introduces its own judge bias (calibrated but imperfect).

### 5. Direct Comparison to Our Idea

| Dimension | MAST | Our Idea |
|---|---|---|
| **Goal** | Diagnose and classify MAS failures | Prevent one failure class (sycophantic collapse) via evidence-grounded trust |
| **Signal** | Human/LLM annotation of traces | External retrieved evidence per atomic claim |
| **Intervention** | None (case-study patches only) | In-debate trust re-weighting (softmax → clamp → renormalize) |
| **Output** | Taxonomy + dataset + judge pipeline | Corrected aggregation + CCR/MPR/ECR measurements |
| **Complementarity** | Provides failure vocabulary + judge pipeline | Provides the missing corrective mechanism for modes (ii)/(iii) |

### 6. Our Positioning Strategy

- **In our paper:** cite for empirical motivation and failure taxonomy; map our CCR/MPR metrics to MAST's inter-agent misalignment and task-verification categories.
- **How we cite:** "MAST shows multi-agent systems fail in recurring patterns across frameworks and models; several of its modes correspond to the trust-calibration failure we target — and MAST explicitly leaves correction to future work."
- **Pre-emptive rebuttal:** if a reviewer asks whether our problem is already solved by diagnosis, the answer is that MAST is measurement-only and calls for "fundamental MAS redesigns"; our mechanism is a concrete answer to that call.

### 7. Code & Reproducibility

| Field | Detail |
|---|---|
| **Repo** | https://github.com/multi-agent-systems-failure-taxonomy/MAST |
| **Data** | https://huggingface.co/datasets/mcemri/MAST-Data |
| **Tooling** | `pip install agentdash` |
| **Reuse for us** | Their LLM-judge + κ-calibration protocol is a template for our human-eval (n=60) and for scaling failure annotations; their taxonomy is a checklist for our failure analysis (Phase 4) |

### 8. Cross-References

| Paper in this review | Relationship |
|---|---|
| Estornell & Liu (2024) | Theoretical account of shared misconceptions; MAST is the empirical, system-level counterpart |
| Minority Sentinel (He et al., 2026) | Quantifies minority suppression; MAST names the surrounding failure landscape |
| Debate or Vote (Choi et al., 2025) | Shows neutral debate ≈ voting; MAST's "task verification" failures explain part of why |
| Liang et al. (2024, #11) | DoT diagnosis; maps to MAST's premature-consensus verification failures |

### 9. Relevance to FYDP

★★★★☆

**Justification:** The best single citation for "multi-agent systems fail in measurable, recurring ways," and the taxonomy gives our failure-analysis chapter external grounding. The κ-validated judge pipeline is directly reusable methodology. Not a competitor — no mechanism — so it strengthens our motivation without threatening novelty.

### 10. Reading Checklist (fill after team read)

- [ ] Extract the exact list of 14 modes and mark which correspond to CCR/MPR/ECR
- [ ] Note how their LLM-judge prompt/calibration works (reusable in our eval harness?)
- [ ] Check per-mode failure rates for AG2/MathChat (closest to our debate setting)
- [ ] Confirm exact venue citation format (NeurIPS D&B proceedings page vs arXiv only)
