# Critical Review & Improvement Report — FYDP Idea 1

### Trust-Calibrated Multi-Agent Scientific Deliberation for Mitigating Sycophantic Consensus in LLM Reasoning

**Reviewer role:** AI research supervisor / academic proposal reviewer
**Date of review:** 10 July 2026
**Reference reviewed:** `idea1.html` (fydp-ideas.vercel.app/idea1.html)
**Evidence base:** arXiv metadata + abstracts retrieved live via the arXiv API on 10 Jul 2026. Papers marked ✅ were verified (ID, title, authors, date confirmed). Papers marked ⚠ could not be verified live and must be checked by the team before citing.

> **How to read this report.** It is deliberately critical. Sections map 1-to-1 onto the seven tasks you set. Task 4 (timeline) and Task 5 (2-page proposal) are delivered as separate files: `idea1_timeline_2026.md` and `idea1_proposal_supervisor.html` (print to PDF). A patch to the live timeline in `idea1.html` is also applied.

---

## TASK 1 — Latest Literature Review (verified 2024–2026 + foundations)

I could not reach Google Scholar / IEEE / ACM / Springer / Elsevier / Nature / OpenReview programmatically from this environment (those portals block scripted access), but I verified every LLM-debate/sycophancy paper below directly against the **arXiv API**, which is the primary preprint venue for this subfield and where all the most recent relevant work appears first. Where a paper is also published at a peer-reviewed venue, that venue is noted.

### A. Foundational / must-cite (pre-2024)

| #     | Paper                                                                           | Authors, Year                                                  | Venue            | Core contribution                                                                          | Relation to our work                                         | Overlap?                | Remaining gap                                                   |
| ----- | ------------------------------------------------------------------------------- | -------------------------------------------------------------- | ---------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------ | ----------------------- | --------------------------------------------------------------- |
| F1 ✅ | Improving Factuality and Reasoning in Language Models through Multiagent Debate | Du, Li, Torralba, Tenenbaum, Mordatch, 2023 (arXiv 2305.14325) | ICML 2024        | Original "society of minds" multi-agent debate (MAD); debate improves factuality/reasoning | This is the base system we extend and the B3 baseline        | Yes — our base paradigm | No grounding, no trust weighting; majority can be wrong         |
| F2 ✅ | Self-Consistency Improves CoT Reasoning                                         | Wang et al., 2022–23 (arXiv 2203.11171)                        | ICLR 2023        | Sample k CoT paths, majority-vote                                                          | Our B5 baseline; the "why not just SC?" foil                 | Partial                 | Single model; correlated errors; no inter-agent trust           |
| F3 ⚠  | Discovering Language Model Behaviors… Sycophancy (Perez et al.)                 | Perez et al., 2022                                             | Anthropic        | Measures sycophancy in RLHF models                                                         | Motivation for the whole problem                             | No                      | Single-agent user→model sycophancy, not inter-agent             |
| F4 ✅ | Debating with More Persuasive LLMs Leads to More Truthful Answers               | Khan, Hughes, Valentine, Ruis et al., 2024 (arXiv 2402.06782)  | ICML 2024 (oral) | Debate + persuasive optimisation raises judge accuracy                                     | Supports "debate can be truth-tracking" premise              | Partial                 | Judge-based oversight, not evidence-grounded trust re-weighting |
| F5 ✅ | Training LMs to Win Debates with Self-Play Improves Judge Accuracy              | Michael et al. / Arnesen et al., 2024 (arXiv 2409.16636)       | —                | Self-play debate improves judge reliability                                                | Alternative oversight route; contrast to our retrieval route | No                      | No external evidence; no trust calibration                      |

### B. Directly competing / highly related (2024–2026) — VERIFIED

| #      | Paper                                                                                       | Authors, Year                                             | Venue                       | Core contribution                                                                                                                                        | Relation / Overlap                                                                                                                                                   | Remaining gap we still own                                                                                                                                                                                                              |
| ------ | ------------------------------------------------------------------------------------------- | --------------------------------------------------------- | --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| B1 ✅  | **Peacemaker or Troublemaker: How Sycophancy Shapes Multi-Agent Debate**                    | Yao, Shang, Du, He, Lian, 2025 (arXiv 2509.23055)         | 2025                        | First **operational framework + metrics** for _inter-agent_ sycophancy in debate                                                                         | **This is the single most dangerous paper for your novelty claim.** It already defines and measures inter-agent sycophancy — the exact phenomenon your CCR measures. | They **diagnose and measure**; they do **not** propose an evidence-grounded trust mechanism that re-weights agents in-session. Your mitigation is still open — but you must reposition as "mitigation on top of their diagnosis."       |
| B2 ✅  | **Minority Sentinel: When to Overturn Majority Voting in Multi-Agent LLM Debates**          | He, Chen, Yang, Qiao, Ju, 2026 (arXiv 2606.29270)         | 2026                        | Shows correlated pretraining ⇒ majority suppresses correct minority ("Minority Truth"); ~1 in 4 divergent cases the minority is right; +10pp recoverable | **Directly overlaps your core motivation and MPR metric.** Confirms the problem is real and quantifies it on 6 benchmarks.                                           | They use a (post-hoc) decision of _when to overturn_ majority; **not in-session, not evidence-grounded trust.** Your in-session evidence trust is still differentiated — but the headline finding is no longer yours to claim as novel. |
| B3 ✅  | **iMAD: Intelligent Multi-Agent Debate for Efficient and Accurate LLM Inference**           | Fan, Yoon, Ji, 2025 (arXiv 2511.11306)                    | (claims AAAI'26 — ⚠ verify) | Learns _whether_ to trigger debate; token-efficient; avoids overturning correct single-agent answers                                                     | Overlaps your §4.1 adaptive trigger; your B9 baseline                                                                                                                | Optimises _when_ to debate, not _who to trust_; no external evidence. Your trust core survives.                                                                                                                                         |
| B4 ✅  | **HCP-MAD: Heterogeneous Consensus-Progressive Reasoning for Efficient Multi-Agent Debate** | Liu, Yao, Liu, He, 2026 (arXiv 2604.09679)                | 2026                        | Heterogeneous agents + consensus-progressive reasoning for efficiency                                                                                    | New, close to your "heterogeneous agent pool + progressive" framing                                                                                                  | Efficiency-focused, no evidence-grounded trust or sycophancy stress test — **but you must cite and differentiate.**                                                                                                                     |
| B5 ✅  | Tree-of-Debate: Multi-Persona Debate Trees for Scientific Comparative Analysis              | Kargupta, Agarwal, August, Han, 2025 (arXiv 2502.14767)   | 2025                        | Structured debate trees for scientific comparison                                                                                                        | Same domain (scientific reasoning via debate)                                                                                                                        | No trust calibration, no sycophancy focus                                                                                                                                                                                               |
| B6 ✅  | Sycophancy in LLMs: Causes and Mitigations (survey)                                         | Malmqvist, 2024 (arXiv 2411.15287)                        | 2024                        | Technical survey of sycophancy causes & mitigations                                                                                                      | Frames your related-work section                                                                                                                                     | Single-agent framing; confirms multi-agent mitigation is under-explored                                                                                                                                                                 |
| B7 ✅  | From Yes-Men to Truth-Tellers: Pinpoint Tuning for Sycophancy                               | Chen, Huang, Xie, Lin, Li, 2024 (arXiv 2409.01658)        | 2024                        | Parameter-level (SPT) mitigation of sycophancy                                                                                                           | Alternative mitigation family (training-time)                                                                                                                        | Requires fine-tuning; you are inference-time & model-agnostic — a clean contrast                                                                                                                                                        |
| B8 ✅  | Beacon: Single-Turn Diagnosis & Mitigation of Latent Sycophancy                             | Pandey, Chopra, Puniya, Pal, 2025 (arXiv 2510.16727)      | 2025                        | Forced-choice benchmark isolating sycophancy                                                                                                             | Possible extra evaluation probe                                                                                                                                      | Single-turn, single-agent; not debate                                                                                                                                                                                                   |
| B9 ✅  | Calibration Drift Under Reasoning: CoT Budgets Induce Overconfidence                        | 2026 (arXiv 2606.11211)                                   | 2026                        | More reasoning can _worsen_ calibration                                                                                                                  | **Directly relevant to your ECR claim** — warns that CoT can hurt calibration; strengthens your motivation but also warns your ECR target may be hard                | You must cite; supports need for evidence-grounded (not self-reported) confidence                                                                                                                                                       |
| B10 ✅ | Inter-Agent Trust Models (A2A, AP2, ERC-8004…)                                              | 2025 (arXiv 2511.03434)                                   | 2025                        | Survey of trust/reputation primitives for agentic web                                                                                                    | Situates your "trust" contribution vs. protocol-level trust                                                                                                          | Protocol/economic trust, not epistemic evidence trust — a useful framing contrast                                                                                                                                                       |
| B11 ✅ | A Collaborative Multi-Agent Approach to RAG Across Diverse Data                             | Salve, Attar, Deshmukh, Shivpuje, 2024 (arXiv 2412.05838) | 2024                        | Multi-agent RAG                                                                                                                                          | Overlaps your source-partitioned RAG                                                                                                                                 | No trust calibration, no sycophancy stress                                                                                                                                                                                              |
| B12 ✅ | MedAide: LLM-based Medical Multi-Agent Collaboration                                        | Yang, Wei, Li, Liu, 2024 (arXiv 2410.12532)               | 2024                        | Multi-agent medical reasoning, hallucination reduction                                                                                                   | High-stakes application analogue                                                                                                                                     | No trust dynamics; domain-specific                                                                                                                                                                                                      |

### C. Mixture-of-Agents / aggregation baselines

| #   | Paper                                                                      | Status                                                                                                                                         | Note             |
| --- | -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| C1  | Mixture-of-Agents (Wang, Mo, Wang, Sun et al., 2024, arXiv **2406.04692**) | ⚠ **Author attribution error in idea1.html** — you cite "Li et al." The widely-cited MoA paper is _Wang et al._ (Together AI). Verify and fix. | Your B6 baseline |

### Key literature takeaways

1. **The problem is now well-established, not novel.** Between B1 (Peacemaker/Troublemaker) and B2 (Minority Sentinel), the "correct minority suppressed by sycophantic/correlated majority" phenomenon is _already named, measured, and quantified_ in 2025–2026 peer/preprint literature. **Your contribution can no longer be "we discovered/first-measured this."**
2. **The open space is the _mitigation mechanism_,** specifically an _in-session, evidence-grounded, formally-specified trust re-weighting_ — none of B1–B4 do exactly this.
3. **Two papers you cite could not be independently verified** and one has an attribution error (see Task 3 §Integrity).

---

## TASK 2 — Gap Analysis (critical)

### Is the original gap still valid?

**The gap as _currently written_ is partially STALE.** The proposal's headline gap — _"consensus frequency ≠ empirical correctness under adversarial sycophancy; no framework provides evidence-grounded in-session trust re-weighting"_ — has two clauses:

- **Clause 1 ("consensus ≠ correctness under sycophancy")** — ❌ **No longer novel.** This is exactly what _Peacemaker or Troublemaker_ (2509.23055) and _Minority Sentinel_ (2606.29270) established in 2025–2026. Presenting this as your discovery will draw a desk-reject or a "scooped" review.
- **Clause 2 ("no _evidence-grounded, formally-specified, in-session_ trust mechanism that re-weights agents by claim verifiability against an external corpus")** — ✅ **Still valid and defensible**, _provided_ you cite B1–B4 and frame precisely. This is the survivable core.

### Newly emerged gaps (opportunities you should claim)

1. **Mitigation vs. diagnosis gap.** B1/B2 measure the failure; nobody has shown a _mechanism_ that reliably recovers the correct minority _during_ the debate using _external evidence_. This is your strongest remaining claim.
2. **Calibration-under-reasoning gap (from B9).** Recent evidence shows CoT can _worsen_ confidence calibration. An _evidence-grounded_ trust signal (yours) vs. _self-reported_ confidence (iMAD's) is now a sharper, more motivated contrast than when the proposal was written. Elevate this.
3. **Correlated-error gap.** B2 shows errors are correlated because of shared pretraining. Your source-partitioned RAG + heterogeneous families is a _plausible_ answer, but you currently under-argue _why partitioned retrieval breaks error correlation_. This is a gap in your own argument, not just the literature.
4. **Evaluation-standardisation gap.** There is still no shared, released benchmark+protocol for _inter-agent_ sycophancy mitigation. If you release your injection protocol + CCR/MPR/ECR harness as a versioned package, **the benchmark itself may be a bigger contribution than the trust function.** Consider making this the primary contribution.

### Does the proposed solution remain novel?

**Partially.** Novelty has _narrowed_ from where the proposal claims it. Honest positioning:

- ❌ Not novel: identifying inter-agent sycophancy / minority suppression.
- 🟡 Incrementally novel: heterogeneous agents + partitioned RAG (overlaps B4, B11).
- ✅ Novel (defensible): the _specific_ formally-specified, bounded, evidence-weighted **trust update rule** applied **in-session**, evaluated under a **pre-registered sycophancy-injection protocol** with **CCR/MPR/ECR**.

### Recommended sharpening of research direction

**Reframe from "we solve sycophancy" to a two-part, honest contribution:**

> **(C1)** A _mitigation_ mechanism — evidence-grounded in-session trust re-weighting — benchmarked head-to-head against the _diagnosis_ papers (B1, B2) and efficiency papers (B3, B4).
> **(C2)** An open, reproducible **evaluation harness** (injection protocol + CCR/MPR/ECR + baselines B1–B9) that the community can reuse.

If a reviewer rejects C1's novelty, C2 still carries the paper. This is the single most important change in this whole report.

---

## TASK 3 — Full Section-by-Section Review of Idea 1

Nothing skipped. Severity: 🔴 critical · 🟠 major · 🟡 minor.

### Header / "At a Glance" / Verdict

- 🟡 Cover asserts "Novelty Score 5/5". After Task 2, an honest self-score is **3.5–4/5**. Overclaiming novelty on the cover primes a skeptical read. Lower it.
- 🟡 "9 baseline conditions / 5 datasets / 10-month plan" is good specificity — keep.
- 🟠 "Composite 4.6/5" self-rating in a document you may show a supervisor reads as self-congratulatory. Remove numeric self-scores from the supervisor-facing version (they belong in internal notes).

### §1 Core Idea

- 🟠 Three "core contributions" are all claimed as primary. Reviewers want **one** primary. Designate the **evaluation harness OR the trust rule** as primary; demote the other two to supporting.
- 🔴 "preventing hallucinating majorities from suppressing correct minority agents" — this exact framing is now B2's headline. Add a citation and differentiate in the very first paragraph.

### §2 Problem Statement

- 🟠 §2.1 leans on Perez (2023) and "Wei et al. (2024)" for 40–55% sycophancy. The Perez number is _user→model_ sycophancy, not _inter-agent_. Using it to motivate _inter-agent_ collapse is a subtle bait-and-switch a sharp reviewer will catch. Cite B1/B2 for the _inter-agent_ rate instead; use Perez only for the general phenomenon.
- 🟡 "Wei et al. (2024)" is under-specified — give the exact paper (there are several Wei et al.). ⚠ verify.
- 🟠 §2.2 "Washington Accord Level" engineering framing and specific model names (Qwen3.6-27B, Mistral-Small-3.2-24B, Phi-4-Reasoning, Mistral-Small-4-119B) — **verify these model IDs actually exist.** Some look speculative (e.g., "Qwen3.6-27B", "Mistral-Small-4-119B"). Citing non-existent model versions in a proposal is an instant credibility hit with a supervisor. Use only models you can `pip`/`vLLM`-load today, or write "e.g., a ~24–32B open model from a different family."
- 🟠 Challenge A: "<10 s per turn" real-time verification over PubMed/arXiv/Semantic Scholar is optimistic once reranking is included. Either soften to "near-real-time" or provide a latency budget.

### §3 Existing Solutions & Gap

- 🔴 **The gap callout is stale** (see Task 2). Rewrite to cite B1/B2 and claim only the _mitigation + harness_ gap.
- 🟠 Table cites "iMAD … AAAI 2026 Oral". arXiv 2511.11306 is ✅ real (Fan, Yoon, Ji), but the **"AAAI 2026 Oral" claim is unverified** — do not assert a venue/oral status you haven't confirmed. Say "arXiv 2025; venue unconfirmed."
- 🔴 "Minority Sentinel (arXiv 2606.29270)" is cited as prior work you improve on — ✅ it is real (Jun 2026). But note it is **one month old** relative to your July 2026 start; treat it as a _direct competitor/contemporaneous work_, and you must run it as a baseline or explicitly explain why not.
- 🟠 MoA attributed to "Li et al." — ⚠ the canonical MoA is **Wang et al., 2024 (2406.04692)**. Fix attribution.

### §4 Proposed Architecture

- 🟡 Numbering jumps 4.1, 4.2, 4.3, then 4.6, then 4.4, 4.5. Fix ordering.
- 🟠 §4.3 Source-partitioned RAG (A→PubMed, B→arXiv, C→Semantic Scholar): **this confounds agent identity with evidence source.** If Agent A looks stronger, is it the model or the fact that PubMed is cleaner? You must **counterbalance** (rotate sources across agents) or you cannot attribute trust changes to agents. Currently a design flaw.
- 🔴 §4.4 Trust function `S_i(t+1)=S_i(t)+αV_i−βH_i; T=clamp(softmax(S),0.1,0.9)`:
  - **Mathematical inconsistency:** softmax already yields values in (0,1) summing to 1; then clamping to [0.1,0.9] **breaks the normalisation** (clamped values no longer sum to 1). Prop 1's "followed by renormalisation" admits this but the formula doesn't show it. Specify the exact operator order: softmax → clamp → renormalise, and prove bounds _after_ renormalisation (renormalising can push a clamped 0.1 back below 0.1). **As written, Proposition 1 is not proven.**
  - With N=3 and floor 0.1/ceiling 0.9, the reachable range per agent is tiny (0.1–0.8 after others take their floors). Show the trust weights can actually move enough to flip an aggregation. Otherwise the mechanism is cosmetic.
- 🔴 §4.5 Propositions 1–3 are labelled "theoretical properties" with "proofs in Appendix A," but:
  - Prop 2 & 3 are conditional ("if V_i>0.7 and H_i<0.1 for all rounds") — these are **assumptions, not results.** They essentially restate "if the evidence always favours the correct agent, the correct agent wins," which is close to circular. A supervisor will call this out. Either downgrade to "design desiderata" (honest) or add a genuine result (e.g., convergence rate, or robustness to a fraction of misleading retrievals).
  - The "Probabilistic/Bayesian interpretation" is hand-wavy: `α·V−β·H` is not a log-likelihood update unless you define the likelihood. Either make it a real Bayesian update or drop the Bayesian language and call it a heuristic score. Overselling this is a risk.
- 🟠 "Selected config α=1.5, β=1.0 (validated on BrokenMath held-out)" appears _before_ any experiments are run — in a proposal this reads as if results already exist. Rephrase as "will be selected via held-out sweep."

### §5 Methodology

- 🟠 §5.1 model table repeats the unverified model IDs. Same fix as §2.
- 🟡 §5.2 only 2 dataset rows but "5 datasets" claimed elsewhere. Reconcile the count. BrokenMath/BrokenArXiv/HLE/GPQA/MMLU-Pro = 5; list all 5 explicitly in the table.
- 🟠 §5.3 Human eval n=60 with ≥2 annotators (grad students) is thin for a Q1 claim but **fine for FYDP**. Keep for FYDP; note Q1 may need more.
- ✅ §5.4 Injection protocol is genuinely strong — the operationalisation (C1–C4), pilot κ, V1–V3 validity checks, and honest L1–L4 limitations are **the best part of the proposal** and publishable as a harness. Elevate this to a primary contribution.
- 🟠 §5.4 Step 2 uses "GPT-3.5-turbo" as distractor generator — dated and API-cost/ToS bound; use an open model for reproducibility.
- 🟠 §5.5 B9 iMAD "reimplemented" — reimplementing a competitor faithfully is high-risk and time-consuming; budget explicitly and pre-register deviations (you partly do). Good, but flag as schedule risk.

### §6 Evaluation

- 🟠 CCR baseline "~45%", MPR "~12%" given as if known. Mark as _hypothesised/target_, not measured.
- 🟡 ECR = 1 − avg|T_i − P̂(correct)| — but P̂(correct|evidence) is itself estimated from retrieval, which is noisy; ECR could look good while both sides are wrong together. Add a check against _ground-truth_ correctness, not just evidence-derived P̂.

### §7 Expected Results

- 🟠 "20–30% CCR reduction" and ">0.80 ECR" are presented as expected. Frame as hypotheses with a clear **negative-result plan** (you have one — good). Keep the honesty.

### §8 Positioning & Venue

- 🟠 ">50 peer-reviewed papers since 2023 cite sycophancy as open problem" — verify or soften to "a rapidly growing body of work."
- ✅ Venue realism (EMNLP Findings / TMLR / workshop primary; ACL/EMNLP main as stretch) is **honest and correct.** Good.

### §9 Execution Plan

- 🔴 Timeline is 10 months but **not date-anchored** and predates the July 2026 start. See Task 4 for a fully re-dated plan. Also: Phase 3 packs "9 conditions × 5 datasets × 3 seeds + ablations + sweep + N-scaling" into 2 months — **under-scoped time.** This is the tightest, highest-risk phase.
- 🟠 Milestone "M4: trust function shows ≥10% CCR reduction" as a _deliverable_ pre-commits to a positive result. Reframe as "M4: trust function implemented; first CCR measurement (any direction)."

### §10 Resources & Scope

- ✅ Scope boundaries (what it does NOT claim) are excellent and de-risk reviewer overclaim objections. Keep verbatim.
- 🟠 1× A100 for 9 passes × 500 questions × 5 datasets × 3 seeds × 9 conditions + reimplemented baselines + sweeps is **optimistic on one GPU.** Do a compute budget (GPU-hours) and secure a fallback (Colab/university HPC quota).

### §11 Supervisor Q&A

- ✅ Strong, anticipates real questions. But update the "core novelty" answer to the _narrowed_ claim (mitigation + harness), and add a prepared answer to: **"Isn't this Minority Sentinel / Peacemaker-or-Troublemaker already?"** — you currently have no rebuttal to your two closest competitors.

### Cross-cutting: Research Integrity 🔴

- **Verify every model name and every cited venue.** Several model IDs and the "AAAI 2026 Oral" label are unconfirmed. Citing a non-existent model or an unverified oral acceptance in front of a supervisor is the fastest way to lose trust. Build a `references.bib` where every entry has a resolvable arXiv ID or DOI. I verified the arXiv IDs I could; the rest are your action items (flagged ⚠ above).

---

## TASK 6 — Roadmap Verification & Redesign

### Does the current roadmap (the §9 plan) give a clear implementation path?

**Partly.** It has phases, deliverables, and go/no-go gates (good), but it has **five weaknesses**:

1. **No date anchoring** (fixed in Task 4).
2. **Phase 3 overload** — the entire experimental matrix + ablations + sweep + N-scaling in 2 months, with no buffer.
3. **Missing an explicit "reproduce a baseline end-to-end" milestone** before building novelty — the classic failure mode of debate projects is that the base MAD loop doesn't reproduce.
4. **Milestones pre-commit to positive results** (≥10% CCR reduction as a deliverable) — unscientific and demotivating if results differ.
5. **No competitor-replication checkpoint** — given B1/B2 landed, you need an explicit step to run/compare against them.

### Redesigned roadmap (phase logic; dates in Task 4)

```
PHASE 0  Foundations & Reproduction        (de-risk first)
  → Env (vLLM, LangGraph), model loading verified
  → Reproduce vanilla MAD (Du 2023) on a small GPQA slice  ← GATE: base loop works
  → Freeze reading list incl. B1,B2,B3,B4 (competitors)

PHASE 1  Protocol & Baselines
  → Implement injection protocol; pilot 50Q; κ check      ← GATE: κ≥0.70, baseline CCR≥0.30
  → Baselines B1–B4 (single, +RAG, MAD, MAD+RAG)
  → Prop 1 corrected proof (softmax→clamp→renorm)

PHASE 2  Core Mechanism
  → Atomic-claim decomposition + source-partitioned RAG (counterbalanced)
  → Trust update v1; sanity vs running-accuracy heuristic
  → Baselines B5 (SC), B6 (MoA), B9 (iMAD reimpl.)
  → Replicate/΅compare Minority Sentinel & Peacemaker metrics ← NEW GATE

PHASE 3  Full Experiments  (split into 3a/3b — do NOT cram)
  3a → Main matrix: core conditions × primary datasets × 3 seeds
  3b → Ablations (4) + α,β sweep + N-scaling + validity V1–V3
      ← GATE: results freeze with 95% CIs

PHASE 4  Analysis & Human Eval
  → Human eval n=60, κ; ECR calibration vs GROUND TRUTH (not just evidence)
  → Failure analysis (correlated halluc., evidence sparsity, 2-vs-1)
  → Trust-trajectory & calibration figures

PHASE 5  Writing & Submission
  → Thesis + paper; reproducibility package (code, prompts, protocol, bib)
  → Supervisor review → submit (EMNLP Findings / TMLR / workshop)
```

**Why this is better:** Phase 0 de-risks the single most common failure (base loop doesn't reproduce); the competitor-replication gate answers your two scooping threats head-on; splitting Phase 3 removes the schedule cliff; result-neutral milestones keep the science honest.

---

## TASK 7 — Final Review

### Strengths

- **Real, timely, socially valuable problem** (trustworthy scientific reasoning; inter-agent sycophancy).
- **Outstanding evaluation rigor for an FYDP** — the injection protocol (C1–C4), pilot κ, validity checks V1–V3, and honest limitations L1–L4 are genuinely publishable as a harness and above typical undergrad level.
- **Honest scope boundaries and negative-result planning** — rare and valuable; strongly de-risks reviews.
- **Concrete baselines (9)** including the right foils (SC, MoA, iMAD).
- **Feasible core** (open models, inference-only, modular) and realistic venue targeting.

### Weaknesses

- **Novelty has been partially overtaken** by Peacemaker-or-Troublemaker (2509.23055) and Minority Sentinel (2606.29270); the proposal doesn't cite or rebut them.
- **Trust-function math is under-specified** (softmax+clamp normalisation inconsistency; Prop 1 not actually proven; Props 2–3 are assumptions dressed as theorems; Bayesian framing oversold).
- **Source-partitioning confounds agent vs. source** (no counterbalancing).
- **Unverified model IDs and an unverified venue claim** ("AAAI 2026 Oral"); one citation attribution error (MoA).
- **Phase 3 is time-under-scoped**; timeline predates the July 2026 start.
- **Three "primary" contributions** dilute the message.

### Risks

- 🔴 **Scooping / novelty** — two 2025–2026 competitors on your exact phenomenon. _Mitigation:_ reposition to mitigation+harness; cite and baseline them.
- 🟠 **Trust weights too constrained to matter** (floor/ceiling with N=3). _Mitigation:_ show flip-capacity empirically early.
- 🟠 **Baseline reimplementation (iMAD, Minority Sentinel) eats the schedule.** _Mitigation:_ pre-register, timebox, accept "best-effort reimpl." caveat.
- 🟠 **Retrieval quality/latency** on scientific corpora. _Mitigation:_ citation filter + rerank + abstain; report retrieval-success stratified results.
- 🟠 **Correlated hallucination** defeats the premise. _Mitigation:_ heterogeneous families + partitioned sources; diagnose explicitly (already planned).
- 🟡 **Calibration may worsen with reasoning (B9)** — ECR>0.80 may be optimistic.

### Novelty Score

**6.5 / 10** as currently written (was effectively claiming ~9/10).

- Rises to **7.5/10** if repositioned as _mitigation + open harness_ with B1–B4 properly cited and baselined.
- The **evaluation harness alone** is ~7/10 novelty and lower-risk than the trust mechanism.

### Publication Potential (with proper implementation)

| Venue                                                                      | Realistic?     | Condition                                                                                                                                                               |
| -------------------------------------------------------------------------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ACL/NeurIPS/ICLR workshop**                                              | ✅ Very likely | Even a clean harness + modest CCR reduction suffices. **Safest first target.**                                                                                          |
| **EMNLP Findings / ACL Findings**                                          | ✅ Plausible   | Needs solid effect sizes over iMAD/MoA + the harness release.                                                                                                           |
| **IEEE (conf/access) / Springer (LNCS/conf)**                              | ✅ Plausible   | Framed as systems+evaluation; IEEE-style venues are receptive to the engineering framing.                                                                               |
| **TMLR**                                                                   | 🟡 Possible    | Values correctness over novelty — good fit if the trust math is made rigorous.                                                                                          |
| **Q2 journal** (e.g., IEEE Access, Information Processing & Mgmt-adjacent) | 🟡 Plausible   | With full experiments + reproducibility package.                                                                                                                        |
| **Q1 journal / ACL-EMNLP main**                                            | 🟠 Stretch     | Only with large, statistically-robust effects over B1–B4, rigorous trust theory, and the harness adopted as a contribution. Not the FYDP target; a post-FYDP extension. |

### Supervisor Readiness — _"If I were your supervisor, would I approve this for FYDP-1?"_

## ✅ **YES, WITH MINOR-TO-MODERATE REVISIONS.**

**Reasoning.** As an FYDP-1 topic this is well above the bar: the problem is real and current, the evaluation design is genuinely strong, the scope is feasible on modest hardware, and the honesty (scope boundaries, negative-result plan) is exactly what I want to see from a thesis student. I would approve it to proceed.

**But I would require these before FYDP-1 sign-off (all doable in weeks 1–3):**

1. **Reposition novelty** to _mitigation + open evaluation harness_; add and rebut Peacemaker-or-Troublemaker (2509.23055) and Minority Sentinel (2606.29270). _(Non-negotiable — this is the scooping risk.)_
2. **Fix the trust-function math** — specify softmax→clamp→renormalise order, actually prove Prop 1, and downgrade Props 2–3 to "design desiderata" or add a real result. Drop or formalise the Bayesian language.
3. **Counterbalance source-partitioned RAG** so trust isn't confounded with evidence source.
4. **Verify every model ID and venue claim**; fix the MoA attribution; build a resolvable `references.bib`.
5. **Re-scope the timeline** to the July 2026 start and split Phase 3 (see Task 4).
6. Pick **one** primary contribution.

Deliver those six and it's a confident, unqualified yes. The idea is fundamentally sound; the revisions are about _honesty of positioning and mathematical precision_, not a change of direction.

---

_Files delivered alongside this report:_

- `idea1_timeline_2026.md` — full month-by-month plan starting July 2026 (Task 4)
- `idea1_proposal_supervisor.html` — 2-page printable proposal to hand to your supervisor (Task 5)
- Patch applied to `idea1.html` §9 timeline (dates + result-neutral milestones)
