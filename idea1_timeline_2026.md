# Task 4 — Updated FYDP Timeline (Start: July 2026)

**Project:** Trust-Calibrated Multi-Agent Scientific Deliberation for Mitigating Sycophantic Consensus in LLM Reasoning
**Start:** July 2026 · **Duration:** 10 working months · **Completion:** April 2027
**Assumption:** FYDP-1 (proposal + prototype) runs Jul–Nov 2026; FYDP-2 (full experiments + thesis) runs Dec 2026–Apr 2027. Adjust the split to your department's calendar.

> Milestones are **result-neutral** (they commit to _doing_ the measurement, not to a positive outcome). Buffer is built into Feb 2027.

## Month-by-month plan

| Month   | Calendar     | Phase                                  | Key tasks                                                                                                                                                                                              | Deliverable / Gate                                                                                                    |
| ------- | ------------ | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| **M1**  | **Jul 2026** | Ph 0 — Foundations & Reproduction      | Literature freeze (incl. Peacemaker/Troublemaker, Minority Sentinel, iMAD, HCP-MAD); env setup (vLLM, LangGraph); verify all model IDs load; **reproduce vanilla MAD (Du 2023)** on a small GPQA slice | ✅ **Gate 0:** base debate loop reproduces; `references.bib` with resolvable IDs                                      |
| **M2**  | **Aug 2026** | Ph 1 — Protocol & Baselines            | Implement sycophancy-injection protocol; 50-Q pilot; annotator κ check; baselines B1–B4 (single, +RAG, MAD, MAD+RAG); corrected Proposition 1 proof (softmax→clamp→renorm)                             | ✅ **Gate 1 (Go/No-Go):** κ ≥ 0.70 **and** baseline CCR ≥ 0.30; Baseline Report                                       |
| **M3**  | **Sep 2026** | Ph 2 — Core Mechanism (build)          | Atomic-claim decomposition; **counterbalanced** source-partitioned RAG; cross-encoder reranker; trust-update v1                                                                                        | Working prototype (end-to-end on 50 Q)                                                                                |
| **M4**  | **Oct 2026** | Ph 2 — Core Mechanism (compare)        | Baselines B5 (SC), B6 (MoA), B9 (iMAD reimpl.); replicate Minority-Sentinel / Peacemaker metrics for head-to-head                                                                                      | ✅ **Gate 2:** trust function implemented; **first CCR/MPR measurement (any direction)**; competitor comparison table |
| **M5**  | **Nov 2026** | Ph 2→3 bridge                          | Mid-project supervisor report; **FYDP-1 defence**; freeze design; dry-run full matrix on 1 dataset                                                                                                     | 📌 **FYDP-1 milestone:** proposal + prototype + interim results                                                       |
| **M6**  | **Dec 2026** | Ph 3a — Main experiments               | Main matrix: core conditions × primary datasets (BrokenMath, BrokenArXiv, HLE) × 3 seeds; 95% CIs                                                                                                      | Primary results table (main conditions)                                                                               |
| **M7**  | **Jan 2027** | Ph 3b — Ablations & sweeps             | 4 ablations; α,β sweep; N∈{2,3,5} scaling; validity checks V1–V3; add GPQA/MMLU-Pro accuracy runs                                                                                                      | ✅ **Gate 3:** results freeze with CIs + effect sizes                                                                 |
| **M8**  | **Feb 2027** | Ph 4 — Analysis & Human Eval (+buffer) | Human eval n=60, Cohen's κ; ECR calibration **vs. ground truth**; failure analysis (correlated halluc., evidence sparsity, 2-vs-1); trust-trajectory figures. **Built-in buffer for slipped runs.**    | Complete ablation + human-eval package                                                                                |
| **M9**  | **Mar 2027** | Ph 5 — Writing                         | Thesis draft; paper draft; reproducibility package (code, prompts, protocol, seeds); internal review                                                                                                   | Full thesis draft + paper draft                                                                                       |
| **M10** | **Apr 2027** | Ph 5 — Submission & Defence            | Supervisor review cycle; revisions; **submit paper** (EMNLP Findings / TMLR / workshop); **FYDP-2 final defence**                                                                                      | 📌 Submitted paper + final FYDP thesis                                                                                |

## Key dated milestones (quick view)

- **31 Jul 2026** — Gate 0: base MAD reproduced.
- **31 Aug 2026** — Gate 1 (Go/No-Go): κ ≥ 0.70, baseline CCR ≥ 0.30.
- **31 Oct 2026** — Gate 2: trust mechanism live; first anti-sycophancy measurement + competitor comparison.
- **Nov 2026** — **FYDP-1 defence** (proposal + prototype).
- **31 Jan 2027** — Gate 3: results frozen with statistics.
- **Apr 2027** — Paper submitted; **FYDP-2 final defence**.

## Realism notes / changes from the original 10-month plan

1. **Added Phase 0 (Jul)** — reproduce a baseline before building novelty. This removes the most common debate-project failure.
2. **Split the old Phase 3 into 3a (Dec) + 3b (Jan)** — the original crammed the entire matrix + ablations + sweep + N-scaling into two months. Now two months with a clean freeze gate.
3. **February is an explicit buffer month** (human eval + analysis + slack) — protects the Apr submission if experiments slip.
4. **Milestones no longer pre-commit to a positive result** (old "M4: ≥10% CCR reduction" → new "first CCR measurement, any direction").
5. **Competitor-replication is a scheduled gate (Oct)**, directly answering the two 2025–2026 scooping threats.
6. If your university's FYDP-1/FYDP-2 boundary differs, keep the **phase order** and shift the calendar; the gates are what matter.
