# IDEA 1 — RESEARCH MASTER BLUEPRINT

**Trust-Calibrated Multi-Agent Scientific Deliberation** — a bounded, evidence-grounded trust score that re-weights each agent's influence during a multi-agent debate, so a correct minority is not talked out of its answer by a confidently wrong majority.

**Paper title:** *The Boundaries of Evidence-Grounded Trust in Multi-Agent Scientific Debate, with a Controlled Benchmark for Sycophantic Consensus.*

![status](https://img.shields.io/badge/status-canonical%20source%20of%20truth-2ea043)
![structure](https://img.shields.io/badge/structure-5%20phases%20%C2%B7%2018%20sections-1f6feb)
![headline metric](https://img.shields.io/badge/headline%20metric-accuracy%20%2F%20CMR-d29922)
![closest competitors](https://img.shields.io/badge/closest%20competitors-ConsensAgent%20%C2%B7%20DebUnc-cf222e)
![stack](https://img.shields.io/badge/stack-Qwen%20%C2%B7%20Gemma%20%C2%B7%20Mistral%20%C2%B7%20vLLM%20%C2%B7%20plain%20Python-8250df)

> [!IMPORTANT]
> **Canonical source of truth.** Every research decision in this repository traces back to this file. If a decision changes, change it here first — the report, the journal, and the roadmap follow this blueprint.

> [!NOTE]
> **P0 release (2026-11-09).** `main` = `dev` = `2ae56a3`; P0 gate 13/13; 514 tests; tags `p0-gate` = `055a244`, `p0-release` = `7f2c11f`. P0 is engineering readiness, not efficacy evidence. The 96 GB Final-stack hardware smoke has **not run**; only the offline 73.68 GB budget check passes. Execution order, costs and dates live in `roadmap.md`; per-component status lives in `trustcal/IMPLEMENTATION_STATUS.md`. **Historical design; current compute budget and execution stack are in `docs/agent/08_COMPUTE_COST.md`.**
>
> Two parts of the original design below are superseded. The trust operator is logit accumulation → one softmax → floor/ceiling simplex projection (`trust/update.py`), not clamp-then-renormalize. Retrieval routes by claim domain, not by agent identity; the source-per-agent diagram in §5 is the original design and is retained as history.

> [!TIP]
> **Reading guide:** first day on the project → **§1** and **§15** · supervisor or defence prep → **§14** and **§18** · building the pipeline → **§5**, **§7**, **§13** · running experiments → **§9–§12** · writing the paper → **§2**, **§16**, **§18**.

## Contents

**Phase 1 of 5 — Foundations (Sections 0–4)**

| § | Section | Read it for |
| --- | --- | --- |
| 0 | [Research Design Decisions & Assumptions](#section-0--research-design-decisions--assumptions) | Why this problem, assumptions ranked by risk, rejected alternatives |
| 1 | [Executive Summary](#section-1--executive-summary-for-a-new-team-member-zero-ai-background) | The whole project in plain language, zero background needed |
| 2 | [Research Motivation](#section-2--research-motivation) | Literature status, the three competitors, the one-sentence gap |
| 3 | [Problem Statement](#section-3--problem-statement) | Hypothesis, objectives, expected contribution |
| 4 | [Complete System Overview](#section-4--complete-system-overview) | End-to-end flow diagram and the frozen design invariants |

**Phase 2 of 5 — Pipeline and Tooling (Sections 5–8)**

| § | Section | Read it for |
| --- | --- | --- |
| 5 | [Detailed Multi-Agent Pipeline](#section-5--detailed-multi-agent-pipeline) | Component specs: [gate](#agent-0--confidence-estimator-gatekeeper-not-a-debate-participant), [debate agents](#agents-13--debate-agents-two-phase-model-strategy), [retrieval](#retrieval-sub-system-claim-domain-routed-rag-shared-infrastructure-not-an-agent-per-se), [orchestrator](#orchestrator-implementation-detail-not-a-research-facing-agent-but-required-for-the-pipeline-to-function) |
| 6 | [Complete Data Flow](#section-6--complete-data-flow) | The nine-step trace with every intermediate output |
| 7 | [Models & Tools](#section-7--models--tools) | Dev, main-matrix and FP8 precision stacks, [GPU budget](#gpu-budget--cost-breakdown), build difficulty ranking |
| 8 | [Dataset Plan](#section-8--dataset-plan) | Five datasets, licenses, access risks, contingency fallbacks |

**Phase 3 of 5 — Evaluation and Planning (Sections 9–12)**

| § | Section | Read it for |
| --- | --- | --- |
| 9 | [Evaluation Strategy](#section-9--evaluation-strategy) | Metrics (accuracy/CMR/AUROC/Brier; ECR deprecated), B1–B10 registry, ablations, statistics |
| 10 | [Edge Cases & Failure Handling](#section-10--edge-cases--failure-handling) | Ten failure scenarios with detection, prevention, recovery |
| 11 | [Risk Assessment](#section-11--risk-assessment) | Risk register with likelihood, impact, and mitigation |
| 12 | [Month-by-Month Roadmap](#section-12--month-by-month-roadmap-november-2026--december-2027) | Nov 2026 to Dec 2027 plan, G2–G5, and the pilot gate |

**Phase 4 of 5 — Execution (Sections 13–15)**

| § | Section | Read it for |
| --- | --- | --- |
| 13 | [Implementation Order](#section-13--implementation-order) | Exact build sequence and forbidden shortcuts |
| 14 | [Supervisor Explanation](#section-14--supervisor-explanation) | The [five-minute pitch](#how-to-explain-our-project-in-5-minutes) plus a worked example |
| 15 | [Team Explanation](#section-15--team-explanation-beginner-friendly) | Beginner walkthrough, glossary, analogies, FAQs |

**Phase 5 of 5 — Outcomes (Sections 16–18)**

| § | Section | Read it for |
| --- | --- | --- |
| 16 | [Expected Research Outcome](#section-16--expected-research-outcome) | Target numbers and falsifiable success criteria |
| 17 | [Future Extensions](#section-17--future-extensions) | MSc/PhD directions and open-source potential |
| 18 | [Final Critical Review](#section-18--final-critical-review-reviewer-2-mode) | Reviewer #2 attacks and prepared answers |

---

## Phase 1 of 5 — Sections 0–4

---

### Section 0 — Research Design Decisions & Assumptions

**Why this problem was selected.** Multi-agent debate (MAD) is a widely used technique to improve LLM reasoning, but has a documented failure mode: agents abandon correct answers under social pressure from a confident wrong majority. This is the single biggest reason MAD's promised gains don't always materialize in practice, and it's especially costly in scientific QA where a confidently wrong consensus is worse than an honest "uncertain."

**Why it's important.** As LLM systems get deployed as research assistants, tutors, and decision-support tools, false consensus among cooperating AI agents is a trust and safety problem, not just an accuracy problem — it fails silently and confidently.

**Why current solutions are insufficient.** Diagnosis exists (Yao et al. 2025 defines and measures the failure; He et al. 2026 quantifies it — minority correct in ~1/4 of disagreements). Efficiency optimization exists (iMAD, AAAI 2026, decides _when_ to debate). Static aggregation exists (MoA, ICLR 2025 Poster). **Nothing existing dynamically re-weights agent trust _during_ a debate based on external evidence.** That is the specific, verified gap.

**Why multi-agent instead of single LLM.** A single strong model still hallucinates confidently and has no internal mechanism to be challenged. Multi-agent debate introduces adversarial critique — but only if the aggregation step doesn't just default to majority vote, which is precisely the mechanism that causes sycophantic collapse. This motivates _why the agents must be heterogeneous and independently evidence-checked_, not just multiple instances of the same model.

**Core research assumptions:**

1. Claims made during debate can be decomposed into checkable atomic propositions (moderate risk — some scientific claims are compound or context-dependent).
2. Retrieval against PubMed/ArXiv/Semantic Scholar can reliably support/contradict claims within the debate's time budget (moderate risk — retrieval noise, sparse coverage on niche topics).
3. **Trust weight changes actually alter final output, not just sit in context ignored** (highest risk — this is Challenge C, and it is the assumption the whole mechanism lives or dies on).
4. Heterogeneous model families reduce, but don't eliminate, correlated hallucination (accepted as a named limitation, not assumed away).

> [!WARNING]
> **Assumption 3 is the make-or-break item (Challenge C).** The entire mechanism lives or dies on whether trust weights behaviorally change the output. That is why the pilot run exists (Sections 12 and 13), and why it gates the full build.

**High-risk assumptions requiring early validation** (in priority order):

- Assumption 3 (behavioral effectiveness) — must be piloted before the Core matrix, not discovered after it.
- Assumption 1 (claim decomposition reliability) — must be spot-checked against a small hand-labeled set before full pipeline build.

**Alternative directions considered and rejected:**

- _Post-hoc classifier (Minority Sentinel-style)_ — rejected as primary design because it doesn't intervene during debate; it's a different, valid but separate contribution space, and we position against it rather than duplicate it.
- _Fine-tuning agents to be less sycophantic_ — rejected due to compute cost and because it doesn't generalize across model families; also conflates "sycophancy reduction" with "evidence grounding," which are different mechanisms.
- _Single confidence-based re-weighting (iMAD-style)_ — rejected as sole mechanism because confidence is self-reported and derived from the same context that can be manipulated by injected pressure; this is exactly the vulnerability we're targeting.

**Why this final design was chosen.** It's the only approach among alternatives that ties agent influence to something _external_ and _independent_ of the debate's internal social dynamics — which is the actual causal lever needed to break sycophantic collapse, not just detect it.

---

### Section 1 — Executive Summary (for a new team member, zero AI background)

Imagine three expert reviewers looking at the same hard science question. Normally, if two agree and one disagrees, we go with the majority — that's how most group-decision systems work, human or AI. The problem: two confident-but-wrong reviewers can talk a correct third reviewer out of their right answer. This happens with AI "reviewer" systems too, and it's a documented failure mode.

Our fix: after each round of discussion, we fact-check every reviewer's claims against real, retrieved scientific papers. Reviewers whose claims hold up against real evidence gain more say in the final decision. Reviewers whose claims get contradicted lose influence — even if they're part of the "majority." The final answer is decided by this evidence-weighted vote, not a simple headcount.

We build the system, and we build a way to reliably test whether it works — including a controlled way to inject fake "expert consensus" pressure and measure whether our system resists it better than existing approaches.

---

### Section 2 — Research Motivation

**Why this problem matters.** Sycophancy is cited as an open problem in 50+ peer-reviewed papers since 2023. In multi-agent systems specifically, it directly undermines the reason multi-agent debate is used in the first place — if debate collapses to whichever position sounds most confident rather than which is most correct, it adds cost without adding reliability.

**Existing limitations (verified against literature, current as of mid-2026):**

- Diagnosis-only work (Yao et al. — currently an unpublished preprint, submitted to ICLR 2026 and withdrawn; still citable and relevant, but should be described accurately as a preprint) measures the problem without proposing a fix.
- Post-hoc correction (Minority Sentinel — accepted at AgentSearch Workshop @ SIGIR 2026) intervenes only after debate ends, on log-level features, not during the debate itself.
- Efficiency-focused work (iMAD — AAAI 2026 Oral, properly published) optimizes _whether_ to debate, not _whom to trust_ once debating.
- Static aggregation (MoA — ICLR 2025 Poster, properly published) has no evidence grounding or dynamic trust at all.
- **Prompt-refinement mitigation (ConsensAgent — Pitre, Ramakrishnan & Wang, Findings of ACL 2025, pp. 22112–22133) — the first _published, peer-reviewed_ mitigation for multi-agent sycophancy. It reduces sycophancy via static/dynamic prompt refinement (a textual intervention), not a numeric trust score, and uses no external evidence retrieval and no adversarial-injection testing. This is now our _closest published competitor_ and the sharpest differentiation line.**
- **Dynamic uncertainty weighting (DebUnc — Yoffe, Amayuelas & Wang, Findings of EMNLP 2025, pp. 23299–23315) is our _closest competitor on mechanism_: it re-weights in-loop influence during debate (via prompt-injected confidence or attention-scaling), but from _internal, self-reported_ uncertainty (token entropy / TokenSAR), not externally verified evidence. Crucially, its own diagnostic "Ground Truth" oracle — which weights agents by actual correctness — outperforms every deployable metric (up to +10% avg accuracy) but "cannot be used in real-world applications." Our evidence-grounded trust score is the deployable instantiation of that oracle: it is precisely the external signal DebUnc showed is needed but could only simulate.**
- **Theoretical framework (Estornell & Liu, "Multi-LLM Debate: Framework, Principals, and Interventions," NeurIPS 2024 Main Track) proves majority-convergence ("tyranny of the majority") and proposes pruning-style interventions, but is theoretical and not a deployable evidence-grounded system. It provides the formal context our Propositions 1–3 position against.**

**Research gap (one sentence):** No existing framework dynamically re-weights agent influence _within_ an active debate session based on real-time verifiability of claims against external evidence with a formally bounded numeric trust score — prompt refinement (ConsensAgent), self-reported uncertainty (DebUnc), and theoretical pruning (Estornell & Liu) each address adjacent problems but none ties influence to external evidence verification.

> [!NOTE]
> **Sharpest differentiation lines:** **ConsensAgent** (textual prompt refinement, no retrieval, no numeric trust) and **DebUnc** (in-loop re-weighting, but driven by self-reported uncertainty, not external evidence). State the novelty claim precisely against these two — never as "first to mitigate sycophancy."

**Why our approach is different.** It's the only proposal that makes trust (a) dynamic within-session, (b) grounded in something outside the debate itself, and (c) formally specified with bounded, provable stability properties (no agent fully silenced or dominant).

**Expected research contribution:**

- **Primary (C1):** the trust-calibrated evidence-grounded aggregation mechanism itself.
- **Co-primary (C2):** an open, reproducible sycophancy-stress evaluation harness (injection protocol + accuracy/CMR/trust-calibration metrics; ECR is deprecated), independently reusable by others regardless of whether they adopt our mechanism.

**Why publication-worthy.** It closes a stated gap in two recent, directly relevant works (Yao et al., He et al.), it is positioned against the strongest published competitors (MoA, iMAD, ConsensAgent, DebUnc), and it ships a reusable evaluation artifact — which is often as valuable to a research community as the mechanism itself.

---

### Section 3 — Problem Statement

**Current problem.** In multi-agent LLM debate, a confidently wrong majority can cause a correct minority agent to abandon its position — even without any new evidence being presented. Standard majority-vote aggregation then locks in the wrong answer.

**Existing limitations.** No mechanism ties an agent's influence in the final vote to whether its claims are actually supported by evidence, as opposed to how confidently or persuasively they were stated.

**Research hypothesis.** If agent influence in aggregation is dynamically re-weighted during debate based on external evidence verification, sycophantic collapse (agents abandoning correct answers under social pressure) will measurably decrease compared to standard majority-vote debate, without requiring model fine-tuning.

**Objectives:**

1. Design and formally specify a bounded trust-update mechanism (Section 4.4 of original proposal — carried forward unchanged).
2. Build a reproducible injection protocol to measure sycophantic collapse under controlled conditions.
3. Empirically validate the mechanism against a B1–B10 registry, with the Core matrix running four conditions (B3, B4-matched, B8-no-trust, B8) and the Full target adding B8-placebo and B8-oracle (WP-18).
4. Establish, empirically and early (pilot run, Dec 2026), that trust re-weighting causally changes output, not just context.

**Expected contribution.** A working, evaluated mitigation mechanism plus a reusable stress-testing harness for the research community — see Section 2.

---

### Section 4 — Complete System Overview

```
Input (scientific question)
        ↓
Confidence Estimator (gate: debate needed?)
        ↓
[IF confident] → Direct Answer → Output
        ↓ [IF uncertain]
Three Heterogeneous Agents state initial positions (Round 0)
        ↓
Claim Decomposition (each agent's answer → atomic propositions)
        ↓
Claim-Domain Retrieval (bio/clinical → PubMed + S2; physics/chem, math/CS → arXiv + S2; shared fallback)
        ↓
Evidence Scoring (cross-encoder reranker: supports / contradicts / no evidence)
        ↓
Trust Update (Sᵢ(t+1) = logit accumulation → softmax → floor/ceiling simplex projection; claim-count normalized)
        ↓
[Optional: Injection point for testing, between Round 1 and Round 2]
        ↓
Agents Revise Positions (Round 2, aware of each other's arguments + own trust standing)
        ↓
Repeat Retrieval → Trust Update → Revision for K rounds (K=3 default)
        ↓
Trust-Weighted Aggregation (final answer = argmax over trust-weighted positions, NOT majority vote)
        ↓
Final Output: Answer + Evidence Citations + Trust Trajectory + Per-Agent Reasoning
```

**Stage-by-stage explanation:**

- **Confidence Estimator:** avoids wasting compute on easy questions where all agents would agree correctly anyway. Cheap classifier or self-reported confidence check.
- **Initial positions:** establishes each agent's independent, unpressured baseline answer — critical for later measuring whether a position _changed_ and _why_.
- **Claim decomposition:** breaks compound scientific claims into checkable units (e.g., "Drug X reduces mortality by 30% in patients over 65" → separate checks for the effect, the magnitude, and the subgroup qualifier).
- **Claim-domain retrieval:** routes each claim by subject rather than by agent, so an agent cannot win by owning an easier slice of the literature and the retrieval signal stays independent of speaker identity.
- **Trust update:** the core contribution — converts evidence support/contradiction into a bounded influence score. Full formal specification unchanged from original proposal (Section 4.4).
- **Revision rounds:** agents see each other's arguments and their own evolving trust standing, simulating real deliberation rather than one-shot voting.
- **Trust-weighted aggregation:** the actual mechanism that should prevent sycophantic collapse — a correct, evidence-backed minority agent can outweigh two unsupported majority agents if its trust score is sufficiently higher.

**P0 correction (2026-11):** the original softmax→clamp→renormalize order was found to violate the [0.1, 0.9] floor after renormalization (`trust/update.py`); P0-5 replaces it with logit accumulation → one softmax → floor/ceiling simplex projection. K=3, N=3, claim-domain routed retrieval, and the pilot placement are unchanged. The confidence-estimator gate (§4.1) is also unchanged.

> [!IMPORTANT]
> **Frozen design invariants — do not drift:** logit accumulation → one softmax → floor/ceiling simplex projection (P0-5) · K = 3 rounds · N = 3 heterogeneous agents · claim-domain routed retrieval (P0-12) · inference only, no fine-tuning.

---

## Phase 2 of 5 — Sections 5–8

---

### Section 5 — Detailed Multi-Agent Pipeline

#### Agent 0 — Confidence Estimator (Gatekeeper, not a debate participant)

- **Purpose:** avoid full debate pipeline cost on questions where agents would agree correctly anyway.
- **Responsibilities:** run a lightweight single-pass check (e.g., self-reported confidence from one agent, or agreement rate across 3 quick independent answers) before committing to full debate.
- **Input:** the raw question.
- **Output:** binary gate decision (debate / no-debate) + the direct answer if no-debate.
- **Prompt strategy:** simple CoT + explicit confidence self-report, or a cheap 3-sample agreement check (reuse the 3 agents for 1 fast pass each rather than a separate model).
- **Communication:** one-directional — feeds the decision to the orchestrator; doesn't participate further.
- **Dependencies:** none upstream; downstream gates whether the rest of the pipeline runs.
- **Failure cases:** mis-classifies a hard question as easy → answered without debate, sycophancy risk untested (acceptable — this only affects throughput/coverage, not correctness of the core experiment, since evaluation datasets are pre-filtered per §5.4 Step 1 to only include genuinely divergent cases). Mis-classifies easy as hard → wastes compute but no correctness risk.
- **Recovery:** none needed — failure mode is a cost inefficiency, not a correctness bug.
- **Alternative implementation:** could use a trained classifier instead of self-report; rejected for FYDP scope as unnecessary added complexity — self-report is sufficient and matches this gate's low-stakes role.
- **What happens if removed:** debate runs on every question. No correctness impact, only extra compute (~9 forward passes instead of ~1 on easy questions) — acceptable fallback if the gate proves unreliable.

#### Agents 1–3 — Debate Agents (two-phase model strategy)

Empirically, the debate pipeline behaves identically regardless of which models sit in the agent slots — the trust math, claim decomposition, retrieval, and aggregation are all model-agnostic. This allows a **two-phase model strategy** that minimises GPU cost while preserving experimental rigour:

| Phase | Agent 1 | Agent 2 | Agent 3 | GPU | Est. Cost |
|-------|---------|---------|---------|-----|-----------|
| **Dev** (Ph 0-2) | [Qwen3.5-9B](https://huggingface.co/Qwen/Qwen3.5-9B) | [Gemma 4 12B](https://huggingface.co/google/gemma-4-12B) | [Ministral-3-14B-Instruct-2512](https://huggingface.co/mistralai/Ministral-3-14B-Instruct-2512) | RTX A6000 48GB (P0 engineering; not the main causal budget) | Gate 0 actual ≈$4.29 |
| **Main matrix** (Ph 3-5) | Qwen3.8-27B (4-bit) | Gemma-4-26B-A4B (4-bit) | Mistral-24B (4-bit) | A100 PCIe 80GB (spot **$0.136/GPU-h**) | Core **$175–210**; Full **$210/$235** |
| **Precision check** (Ph 3-5) | Qwen3.8-27B-FP8 | Gemma-4-26B-A4B-FP8 | Mistral-24B-AWQ | RTX PRO 6000 96GB (spot **$0.336/GPU-h**) | N1 smoke + replication **$25–40** |

During development, all pipeline code (claim decomposition, retrieval, trust update, state machine, injection protocol) is written and debugged using the smaller Dev models (at 4-bit quantisation, ~28GB total) on a cheap RTX A6000 48GB. The Core and Full runs then use the **4-bit 24–27B final families on one 80 GB A100 PCIe** (Qwen3.8-27B-AWQ-INT4 ~21.0 GB, Gemma-4-26B-A4B AWQ ~17.2 GB, Mistral-24B-AWQ 15.06 GB; ~53.3 GB total) — no code changes needed, only a model-name/config swap. The **96 GB FP8 stack** is only the N1 hardware smoke plus a small GPQA precision replication; it is not the matrix host.

- **Purpose:** independently reason about the question, then defend or revise positions across rounds based on evidence and each other's arguments.
- **Responsibilities:** (1) produce an initial answer + reasoning trace, (2) decompose own claims into atomic propositions for retrieval, (3) revise position in light of evidence and peer arguments, (4) maintain awareness of own accumulating trust score.
- **Input per round:** the question, own prior answer, retrieved evidence for own claims, peer positions (post-injection where applicable), own current trust value.
- **Output per round:** answer/position, reasoning trace, list of atomic claims made.
- **Prompt strategy:** structured CoT with explicit claim tagging (e.g., `<claim id="c1">...</claim>`) so downstream retrieval can address individual propositions rather than the whole response — this is what makes claim-level evidence scoring possible.
- **Communication with other agents:** indirect only, via the orchestrator — agents never see raw peer prompts, only peer _outputs_ (positions + reasoning), preventing prompt leakage between models of different families.
- **Dependencies:** requires claim decomposition and retrieval to have run before revision rounds.
- **Failure cases:** (a) agent produces an unparseable/untagged response → claim extraction fails; (b) agent's answer doesn't map cleanly to the injected-pressure template's expected answer type (e.g., free text vs. numeric); (c) agent times out or errors mid-generation.
- **Recovery:** (a) fallback regex/LLM-based claim extraction pass; (b) exclude from injection-eligible pool per the existing Step 1 filtering criteria (already specified in the original proposal); (c) retry once, then mark as `INCONCLUSIVE` for that round rather than blocking the whole debate.
- **Alternative implementation:** could use more than 3 agents (N-scaling ablation at N∈{2,3,5} already planned) or fewer; N=3 is the primary configuration because it's the minimum needed to create a genuine "1 vs 2" minority-suppression scenario, which is the core phenomenon under test.
- **What happens if one agent is removed:** system degrades to N=2, which changes the experiment from "minority vs majority" to "two-way disagreement" — a materially different (and already separately covered) N-scaling condition, not a silent degradation. This is why N=3 is treated as the primary configuration, not arbitrary.

#### Retrieval Sub-System (Claim-Domain Routed RAG, shared infrastructure, not an "agent" per se)

- **Purpose:** fetch external evidence to support/contradict each atomic claim.
- **Responsibilities:** route bio/clinical claims to PubMed + Semantic Scholar, physics/chem and math/CS claims to arXiv + Semantic Scholar, with Semantic Scholar/OpenAlex as the shared fallback; rerank retrieved passages via cross-encoder; classify each claim as supported / contradicted / unverifiable / contested.
- **Input:** atomic claims tagged per agent.
- **Output:** per-claim evidence verdict + supporting passage + relevance score.
- **Failure cases:** (a) no relevant documents found (evidence sparsity — a named, planned failure-analysis category); (b) retrieved documents are low-quality or off-topic; (c) API rate limits/downtime.
- **Recovery:** (a) mark claim as abstained, exclude from trust update per original design (abstention doesn't penalize or reward); (b) citation-count filter (already specified, >10 citations) + domain-restricted abstracts; (c) local caching of retrieved results + retry with backoff, fallback to a secondary free API if primary is down for extended periods.
- **What happens if removed:** system reduces to a static, non-evidence-grounded aggregation — the B4-matched / B6 comparison, not an unplanned failure mode.

#### Orchestrator (implementation detail, not a research-facing agent, but required for the pipeline to function)

- **Purpose:** coordinates round sequencing, injects test pressure at the specified point (t=1→2), triggers trust updates, and calls final aggregation.
- **Responsibilities:** state management across rounds; enforcing the K=3 round cap; invoking the trust formula in the exact specified operator order (logit accumulation → softmax → simplex projection).
- **Implementation:** plain-Python state machine (the LangGraph port is not implemented); the B9 iMAD reimplementation is an approximation, not a faithful port.
- **Failure cases:** state corruption across rounds, infinite retry loops.
- **Recovery:** hard round cap (K=3) and per-agent retry cap (3, matching StatVerify-Agent's pattern from Idea 5 — reused convention, not scope creep) prevent runaway loops.

> [!CAUTION]
> **The operator is fixed: logit accumulation → softmax → simplex projection.** Do not substitute clamp-then-renormalize; that order violated the floor after renormalization (P0-5). Unit-test the trust function in isolation before wiring it into the debate loop (Section 13, step 6).

---

### Section 6 — Complete Data Flow

```
1. USER/EVAL-HARNESS SUBMITS QUESTION
   → raw question string + ground truth (for eval only, hidden from agents)

2. CONFIDENCE GATE CHECK
   → intermediate output: debate=True/False
   → [if False: skip to step 8 with direct answer]

3. ROUND 0 — INITIAL POSITIONS
   → intermediate output: 3× {agent_id, answer, reasoning_trace, initial_trust=1/3}

4. CLAIM DECOMPOSITION
   → intermediate output: 3× list of atomic claims, each tagged to source agent

5. CLAIM-DOMAIN RETRIEVAL
   → intermediate output: per-claim {evidence_verdict, passage, relevance_score}
   → this is the first point where external, ground-independent signal enters the system

6. TRUST UPDATE (Round 1)
   → intermediate output: updated Sᵢ, Tᵢ per agent (fully logged for later trust-calibration analysis: AUROC/Brier)

   [OPTIONAL, for stress-testing only: INJECTION — SYSTEM message with fabricated wrong "expert consensus" inserted here, per §5.4 protocol]

7. REVISION ROUNDS (repeat steps 3–6 for K=3 total rounds)
   → intermediate output: full trust trajectory across rounds (needed for Proposition 2/3 empirical verification and trust-collapse failure diagnostics)

8. TRUST-WEIGHTED AGGREGATION
   → intermediate output: final answer = argmax over Σ(Tᵢ × positionᵢ) at round K

9. FINAL RESULT PACKAGE
   → answer, full evidence citations, trust trajectory chart data, per-round reasoning traces, accuracy/CMR/trust-calibration flags (for eval harness; ECR deprecated) or plain answer+citations (for real deployment use)
```

**Why every intermediate output is logged, not just discarded:** the trust trajectory (step 7) is required to empirically verify Propositions 2–3 aren't just theoretically bounded but observably behave as claimed; the per-claim evidence verdicts (step 5) are required for the trust-calibration analysis (AUROC/Brier) and the verifier audit; none of this logging is optional instrumentation — it's load-bearing for the evaluation plan.

---

### Section 7 — Models & Tools

| Component           | Dev (Ph 0–2)               | Final (Ph 3–5)              | Why Selected                                                                                                                   | Limitations & Upgrade Path                                       |
| ------------------- | -------------------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------- |
| **Agent 1**         | [Qwen3.5-9B](https://huggingface.co/Qwen/Qwen3.5-9B)                 | Qwen3.8-27B-FP8                 | Dev: cheap iterative testing. Final: 27B dense, caps 397B MoE predecessor in coding, 262K context, Apache 2.0                  | FP8 ~29.95 GB (final); validated on dev models before the Final run |
| **Agent 2**         | [Gemma 4 12B](https://huggingface.co/google/gemma-4-12B)                | Gemma-4-26B-A4B-FP8             | Dev: encoder-free 12B, good proxy for 26B behaviour. Final: MoE 3.8B active, 256K context, Apache 2.0                         | 28.67 GB FP8; 26B requires all params in memory despite 3.8B active per token  |
| **Agent 3**         | [Ministral-3-14B-Instruct-2512](https://huggingface.co/mistralai/Ministral-3-14B-Instruct-2512) (FP8)        | Mistral-24B-AWQ      | Dev: Mistral-family 14B with official FP8 weights (~14GB, near-lossless) — same lineage as Final Agent 3. Final: Mistral adds third distinct family (non-Qwen, non-Gemma) for true heterogeneity   | 15.06 GB AWQ; FP8 public repos push the stack over 80 GB, so AWQ is the pinned Final artifact |
| **External-answer ceiling (B7)** | OpenAI GPT-6 Luna (gpt-6-luna) | OpenAI GPT-6 Luna (gpt-6-luna) | Optional, appendix-only external-answer ceiling reference only; not part of the core mechanism and not in the Core or Full matrix. Three independent calls per question; mean single-call accuracy with CI + 3-sample majority (ties to the first sample); ~$3–9 per 1,000 (recompute from actual tokens; $0.10/M input + $0.50/M output) | B8-oracle (gold-answer trust, or gold-evidence-only on SciClaimBench) is a separate pending arm under WP-18             |
| **Reranker**       | ms-marco-MiniLM cross-encoder  | ms-marco-MiniLM cross-encoder  | Standard, fast, well-validated for passage reranking                                                                           | Domain-general — acceptable since retrieval is claim-domain routed upstream. Upgrade to SciBERT-based if evidence quality issues arise |
| **Inference**      | vLLM                           | vLLM                           | Free, fast, standard for local multi-model serving; same engine for the Dev, main-matrix (A100), and FP8 precision paths                  | Setup complexity on first use only                                                                                                |
| **Orchestration**  | plain Python                   | plain Python                   | Round-based state machine fits debate and injection-point control; the LangGraph port is not implemented | No external graph runtime to debug |
| **Retrieval APIs** | PubMed, ArXiv, Semantic Scholar| PubMed, ArXiv, Semantic Scholar| Domain coverage matches scientific QA target; free academic access                                                             | Rate limits, coverage gaps in niche subfields — caching layer implemented                                                      |

#### GPU Budget & Cost Breakdown

The staged strategy keeps compute costs manageable for a student team. All pipeline code is model-agnostic, so no engineering time is spent reconfiguring between stages — only the model names in a config file change.

| Stage | When | GPU-h | Cash | Notes |
|------|------|------:|------:|-------|
| **FP8 precision replication + 96 GB N1 smoke** | Nov 2026 | 60–100 | $25–40 | 96 GB RTX PRO 6000 at $0.336/GPU-h; **NOT RUN** — offline 73.68 GB check only |
| **Pilot** | Dec 2026 | ~112 | $15–20 | 100–150 questions; 4-bit 24–27B on the 80 GB A100 |
| **Core run** | Jan 2027 | 1,280 cap (planned ~1,067) | $175–210 | 24 runs; 8,000 planned debates; 4-bit 24–27B on the 80 GB A100 |
| **Full run, default** | Feb 2027 | 1,280 | $210 | 32 rows; gold-evidence oracle on SciClaimBench; B8-placebo is a cross-agent round-pool |
| **Full run, alternate** | Feb 2027 | 1,440 | $235 | 36 rows; gold-answer oracle |
| **Storage and bandwidth** | — | — | $40–80 | Persist the cache; copy results; destroy instances |
| **Total plan** | — | — | **$500–600** | — |
| **Law-testing** | Apr 2027 | — | outside the $600 hard stop; separate approval | only if the effect is real |

**Hard stop: $600.** The Full default and alternate are alternatives; the total counts one Full run. The main causal matrix runs on one **80 GB A100 PCIe** spot at **$0.136/GPU-h** with the **4-bit 24–27B final families**. The **96 GB FP8 stack** at **$0.336/GPU-h** is only the N1 smoke plus the GPQA precision replication. If the 80 GB A100 spot is unavailable and the main runs use 96 GB, the plan is **$1,050–1,150** and needs **re-approval**; it is not the default. Core and Full run on the same 4-bit stack, so cells are reusable only where model revisions, prompts, and configs match.

**Pinned 4-bit main stack (~53.3 GB):** Qwen3.8-27B-AWQ-INT4 (~21.0 GB), Gemma-4-26B-A4B AWQ (~17.2 GB), Mistral-24B-AWQ (15.06 GB); fits the 80 GB A100 with KV headroom. **Pinned FP8 stack (73.68 GB):** Qwen3.8-27B-FP8 (29.95 GB), Gemma-4-26B-A4B-FP8 (28.67 GB), Mistral-24B-AWQ (15.06 GB); utilization sum 0.90, leaving ~12.72 GB of the 96 GB card for KV cache. The FP8 stack is the **96 GB smoke/precision stack**, not the main matrix host; the offline check passes and the hardware smoke is the remaining gate. Full source table and formulas: [`docs/agent/08_COMPUTE_COST.md`](agent/08_COMPUTE_COST.md).

**Why this works:** The Dev models (9B–14B) run at 4-bit quantisation (~28GB total) and fit on an RTX A6000 48GB with ample room for KV cache and batch inference; they are the P0 engineering stack. The Core and Full matrices use the **4-bit 24–27B final families on one 80 GB A100 PCIe**, which is the cost-efficient main path; the code is identical, only the checkpoints and config change. The FP8 stack on the 96 GB card exists to prove the full-precision checkpoints load and to supply a small GPQA precision replication. See §13 for the exact build sequence.

> **Empirical note (2026-09, Phase 0/1):** on the RTX A6000 the official Ministral FP8 checkpoint cannot be served — vLLM's W8A8 FP8 kernel fails on Ampere (`cutlass_scaled_mm_sm80_epilogue`). The Dev stack therefore uses an **AWQ-4bit quantisation of the same Ministral-3-14B-Instruct-2512 model** (with AWQ Qwen and QAT-4bit Gemma), pinned in `trustcal/configs/models.yaml`. Model identities are unchanged; only the quantisation artifacts differ. Measured Dev behaviour, environment versions and costs: `experiments/gate0/README.md`.

**Contingency:** If the 80 GB A100 spot is unavailable, the fallback is to run the main matrix on the 96 GB card at **$0.336/GPU-h**; that plan is **$1,050–1,150** and requires re-approval. It is not the default. If the A6000 used for P0 engineering is unavailable, Dev work can run sequentially on a single ≥32 GB VRAM GPU (e.g., RTX 4090 24GB loading one Dev model at a time via model swaps).

**Implementation difficulty ranking (easiest → hardest):**

1. Basic vLLM multi-model serving — low difficulty, well-documented.
2. Retrieval integration + reranking — moderate, mostly API/plumbing work.
3. Claim decomposition + tagging — moderate, needs careful prompt engineering + fallback extraction.
4. Trust update math + state machine — moderate-high, needs careful operator-order implementation (logit accumulation→softmax→simplex projection) to enforce the floor/ceiling bound.
5. iMAD reimplementation (B9) — highest difficulty of any single component, ~10 working days per original estimate, because it requires faithfully reconstructing a method from a paper description rather than using existing code.

---

### Section 8 — Dataset Plan

| Dataset         | Role                              | Source                         | License/Access                          | Preprocessing Needed                                                        | Known Limitations                                                                                      |
| --------------- | --------------------------------- | ------------------------------ | --------------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| **BrokenMath**  | Appendix-only adversarial stress test | `INSAIT-Institute/BrokenMath` (HuggingFace); arXiv:2510.04721 | Public; **CC BY-NC-SA 4.0** (non-commercial, attribution + share-alike) | Filter per §5.4 Step 1 (≈60–70% retention after divergent-answer filtering) | Math-focused; not used for evidence grounding or CCR |
| **BrokenArXiv** | Appendix-only adversarial, monthly-refreshed | `MathArena/brokenarxiv` (HuggingFace); matharena.ai; arXiv:2605.00674 | Public; **CC BY-SA 4.0**                | Same filtering as above                                                     | Monthly versioning means results must cite the exact snapshot used; not used for evidence grounding |
| **HLE**         | Hard scientific reasoning ceiling | `cais/hle` (HuggingFace); Nature 649, 1139–1146 (2026); arXiv:2501.14249 | Public with click-through approval; **MIT**; do not redistribute samples | Same filtering                                                              | Access approval adds a small lead-time risk — apply in Phase 0, not Phase 2                            |
| **GPQA**        | Core stable comparison (GPQA-Main) | `Idavidrein/gpqa` (HuggingFace); COLM 2024; arXiv:2311.12022 | Public after agreeing to terms; **CC BY 4.0** | Standard eval split                                                         | Not adversarial — used for accuracy comparability, not sycophancy measurement              |
| **MMLU-Pro**    | Core stable comparison | `TIGER-Lab/MMLU-Pro` (HuggingFace); NeurIPS 2024 (D&B); arXiv:2406.01574 | Public; **MIT**                         | Standard eval split                                                         | Same role as GPQA                                                                                      |

**Provenance note:** all five datasets are the official releases from their authors (HuggingFace organization pages or the project site). None are taken from Kaggle. GPQA and HLE need a free click-through agreement before download. Licenses verified 2026-09-15; cite the dataset papers in any report or paper that uses them.

> [!WARNING]
> **Access and license reality check:** BrokenMath is **CC BY-NC-SA 4.0 (non-commercial)** · HLE needs a click-through approval, so apply in **Phase 0** · BrokenArXiv snapshots rotate, so always record the exact snapshot used. All of these are already reflected in the table above — treat them as triggering conditions, not trivia.

**Data quality/bias considerations:** BrokenMath/BrokenArXiv are appendix-only stress sets, not evidence-grounding corpora. Results on them should be framed as adversarial/worst-case behaviour, not representative of average-case deployment — this framing is already present in the original proposal's "domain-of-applicability boundary" language and should be preserved.

**SciClaimBench benchmark ladder.** SciClaimBench is the team-built gold-evidence benchmark, not a Core v1.0 dataset. Core v1.0 runs GPQA-Main + MMLU-Pro + HLE. SciClaimBench freezes at **180 items** under v1.2 (60 biomed, 60 phys/chem, 60 math/CS), scales to the **300-item Full target**, and has 600/stretch and 800/no-go rungs that are not built.

| Size | Role | Decision |
|---:|---|---|
| **24** | Calibration batch | Start here; if `H_attempt > 2.0` or defect >15%, cut to 120 |
| **180** | SciClaimBench v1.2 freeze | Freeze by Jan 2027; not in the v1.0 Core matrix |
| **300** | Full-run benchmark target | Target by Feb 2027 |
| **600** | Stretch | Only with 2–3 dedicated annotators |
| **800** | No-go | Do not build |

**What if a dataset becomes unavailable?**

- **HLE access denied/delayed:** fall back to GPQA-Diamond subset restructured with the same injection protocol — lower ceiling difficulty, but preserves the core experimental design.
- **BrokenArXiv monthly snapshot discontinued:** freeze on the last available snapshot and document the cutoff explicitly; does not invalidate the experiment, only limits recency framing.
- **Semantic Scholar API deprecated/rate-limited beyond usability:** fall back to OpenAlex API (free, similar coverage) — should be named now as a pre-approved contingency rather than discovered mid-project.

---

**Confirming before continuing:** Sections 5–8 reflect the P0 design — claim-domain retrieval, the 4-condition Core matrix, the 6-arm Full target (WP-18 conditional), and the 24 → 180 → 300 → 600 → 800 benchmark ladder.

Proceeding to **Phase 3 (Sections 9–12)**.

---

## Phase 3 of 5 — Sections 9–12

---

### Section 9 — Evaluation Strategy

**Evaluation pipeline (end-to-end):**

1. Run the Core matrix: 4 conditions (B3, B4-matched, B8-no-trust, B8) × GPQA-Main + MMLU-Pro + HLE × 2 seeds = 24 runs. The Full target adds B8-placebo and B8-oracle (WP-18).
2. Apply the injection protocol (§5.4, unchanged) to pressure-eligible items.
3. Compute accuracy and CMR (primary/co-primary), plus ARR and trust AUROC/Brier (secondary). CCR and MPR remain diagnostics; ECR is deprecated.
4. Run 4 ablations (no trust calibration / no progressive retrieval / no claim-domain routing / no adaptive triggering).
5. Run N-scaling (N∈{2,3,5}) on 100-question subset.
6. Run human evaluation (150–200 paired items, 3 raters, κ-validated).
7. Apply statistical testing (2 seeds, 95% CI, paired bootstrap, McNemar/Holm, Cohen's d) across all comparisons.

**Metrics and why each is selected:**

| Metric | What it measures | Why selected |
| --- | --- | --- |
| **Accuracy** | Correctness of the aggregated final answer on pressure-eligible items | Primary decision endpoint; ensures the mechanism does not sacrifice correctness |
| **CMR** (Correct-Minority Retention) | Whether a round-0 correct minority still holds gold at round K | Co-primary mechanism endpoint; directly tests the retention claim |
| **ARR** (Appropriate Revision Rate) | Whether agents revise in the evidence-supported direction | Secondary; separates useful revision from collapse |
| **Trust AUROC** | Within-debate ranking of trust against correctness | Secondary calibration; replaces ECR for ranking |
| **Trust Brier** | Squared error of trust against correctness | Secondary calibration; penalizes overconfidence |
| **CCR / MPR** | Collapse and minority survival under injection | Diagnostics and manipulation checks; not primary endpoints |
| **ECR** | Historical 1 − ECE calibration score | Deprecated; retained only as a historical note |
| **Human Eval (Likert, κ)** | Factual grounding and hallucination severity, human-judged | Automated metrics cannot fully capture reasoning quality |

**Registry:** B1–B10 — Single-Agent CoT, Single-Agent+RAG, MAD, MAD+retrieval (B4-matched), Self-Consistency, MoA, External-answer ceiling (B7), Ours (B8), iMAD, ConsensAgent. The Core matrix is exactly B3, B4-matched, B8-no-trust and B8; the Full target adds B8-placebo and B8-oracle. B1/B2/B5–B7/B9/B10 are comparison and appendix arms, not Core cells.

**Ablation studies:** the 4 conditions (no trust / no progressive retrieval / no claim-domain routing / no adaptive triggering) isolate which architectural component drives any observed gain — required for a credible "systems" contribution, not just a black-box result.

**Statistical validation:** 2 seeds + 95% CI + paired bootstrap + McNemar/Holm + Cohen's d — chosen because single-run comparisons in MAD literature are a common and valid reviewer criticism; this design preempts it. Three seeds are not used: more questions at two seeds is the better trade for this design (`PRE_REGISTRATION.md` §3).

**Error analysis:** conducted via the Phase 4 failure taxonomy (Section 10.1 of original proposal, unchanged) — correlated hallucination, evidence sparsity, trust collapse, adversarial 2-vs-1 consensus.

---

### Section 10 — Edge Cases & Failure Handling

| Failure Scenario                                                             | Detection                                                                 | Prevention                                                                       | Mitigation                                                                       | Recovery/Fallback                                                                                               |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| **Retrieval returns no evidence** (evidence sparsity)                        | Zero passages above relevance threshold                                   | Broaden query reformulation before declaring sparse                              | Mark claim abstained, exclude from trust update (no reward/penalty)              | Stratify results by retrieval-success rate in reporting — turns a failure mode into a measured, honest boundary |
| **Contradictory evidence retrieved** (two valid sources disagree)            | Evidence verdicts conflict at >0.75 relevance for both support/contradict | N/A — real phenomenon, not a bug                                                 | Flag claim as "contested," report separately from clean support/contradict cases | Included as its own category in human eval annotation                                                           |
| **All agents hallucinate the same way** (correlated failure)                 | Homogeneous-vs-heterogeneous comparison shows no CCR difference           | Heterogeneous model families (partial mitigation, not elimination)               | Diagnosed explicitly in Phase 4 failure analysis                                 | Reported honestly as a scope boundary, not hidden                                                               |
| **Trust collapse** (all agents pushed toward T_min)                          | Trust variance monitoring across rounds                                   | Simplex floor (0.1) by projection                                                 | Sanity-check against running-accuracy heuristic                                  | Already structurally prevented by Proposition 1's boundedness — but empirically verified, not just assumed      |
| **Claim extraction fails** (unparseable agent output)                        | Tagged-claim regex/schema validation fails                                | Structured output prompting with explicit tags                                   | Fallback LLM-based extraction pass                                               | If both fail, exclude that agent's turn from trust update for that round only                                   |
| **API rate limit / downtime** (retrieval APIs)                               | HTTP error codes, timeout                                                 | Local caching of prior retrievals                                                | Retry with exponential backoff                                                   | OpenAlex fallback (new, added in Section 8)                                                                     |
| **Context window overflow** (long debate histories)                          | Token count monitoring before each round                                  | Cap K=3 rounds; summarize prior rounds instead of full replay if needed          | Truncate oldest round detail first, preserve trust trajectory numerically        | Documented as an N/K-scaling limitation, tested explicitly in N-scaling ablation                                |
| **Model API/inference timeout**                                              | Request timeout                                                           | Reasonable per-call timeout budgets                                              | Retry once                                                                       | Mark round `INCONCLUSIVE` for that agent, continue debate with remaining agents' data                           |
| **Injection template doesn't fit answer type** (e.g., free-text vs. numeric) | Pre-filtering at Step 1/2 of §5.4                                         | Question filtering already excludes ill-fitting cases                            | N/A — prevented upstream                                                         | N/A                                                                                                             |
| **iMAD reimplementation diverges from paper**                                | Manual comparison against reported result patterns where available        | Explicit documentation of any divergence (already specified in original B9 spec) | Report divergences transparently in reproducibility package                      | Treat as an honest limitation, not hidden                                                                       |

---

### Section 11 — Risk Assessment

| Risk Category      | Specific Risk                                                                                                               | Likelihood                                   | Impact                               | Mitigation                                                                                                                                                                                                                                                              |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- | ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Technical**      | Trust signal doesn't behaviorally change output (Challenge C)                                                               | Medium                                       | **Critical — undermines core claim** | Pilot run (Section 0/12) — validate early, cheaply, before the Core matrix                                                                                                                                                                                              |
| **Technical**      | Retrieval noise degrades evidence quality                                                                                   | Medium                                       | Moderate                             | Cross-encoder reranker + citation filter (already specified)                                                                                                                                                                                                            |
| **Research**       | Reviewers see this as incremental over MoA/iMAD                                                                             | Low-Medium                                   | Moderate                             | B4-matched and B8-no-trust comparisons directly designed to preempt this; the planned headline is the B8 vs B8-no-trust accuracy/CMR contrast, not a CCR delta over iMAD                                                                                                  |
| **Research**       | Novelty erosion — a _published_ mitigation (ConsensAgent, Findings of ACL 2025) now exists where none was assumed at outset | Medium                                       | Moderate                             | Sharpen the differentiation: we are the only evidence-grounded, numeric, formally bounded, adversarially-injection-tested approach vs. ConsensAgent's textual prompt refinement. Add B10 comparison (§9) + explicit mechanism-differentiation paragraph in related work |
| **Research**       | Propositions 2–3 don't hold empirically even though bounded theoretically                                                   | Medium                                       | Moderate                             | Already framed honestly as "design properties," not global theorems — reduces reviewer risk if they don't fully hold                                                                                                                                                    |
| **Dataset**        | HLE access approval delayed                                                                                                 | Low-Medium                                   | Low-Moderate                         | Apply Phase 0; GPQA-Diamond fallback pre-identified (Section 8)                                                                                                                                                                                                         |
| **Dataset**        | BrokenArXiv snapshot changes/discontinues                                                                                   | Low                                          | Low                                  | Freeze-and-document fallback (Section 8)                                                                                                                                                                                                                                |
| **Timeline**       | Nov 2026–Jan 2027 overloaded — smoke + WP-18 + calibration + verifier audit + pilot + Core                                              | **High**                                     | High                                 | Keep the order; do not start Core before G2. WP-18 is the only pre-run design addition; freeze the oracle scope before the Full config.                                                                                                                          |
| **Publication**    | Two of four core related-work citations are preprint/workshop-tier, not main-conference                                     | Medium (perception risk, not technical risk) | Moderate                             | Disclose proactively and precisely (see prior meeting-prep guidance) — actually strengthens credibility if handled this way                                                                                                                                             |
| **Implementation** | iMAD reimplementation fidelity to original paper                                                                            | Medium                                       | Moderate                             | ~10-day dedicated estimate already budgeted; explicit divergence documentation required                                                                                                                                                                                 |
| **Implementation** | Main-matrix compute ceiling under the 4-condition Core / 6-arm Full × multi-dataset × 2-seed matrix                         | Medium                                       | Moderate                             | Main matrix on one 80 GB A100 PCIe (spot $0.136/GPU-h) with the 4-bit 24–27B final families; the 96 GB FP8 stack ($0.336/GPU-h) is only the N1 smoke plus a small precision replication. Core $175–210; Full $210 (32-row gold-evidence default) or $235 (36-row gold-answer alternate); total $500–600; hard stop $600. The 96 GB main-run fallback is $1,050–1,150 and needs re-approval. |

---

### Section 12 — Month-by-Month Roadmap (November 2026 – December 2027)

_Post-P0 calendar. The July–October 2026 record — Gate 0, the trust operator, claim-domain routing, and P0 hardening — lives in `experiments/p0/` and is not repeated here._

> [!IMPORTANT]
> **Order: Final-stack smoke → WP-18 → 24-item calibration → verifier audit → pilot (G2) → Core (G3) → Full (G4/G5).** The pilot and Core run are gates, not optional warm-ups.

**GPU economics:** The main matrix runs on one rented **80 GB A100 PCIe** (Vast.ai spot **$0.136/GPU-h**) with the **4-bit 24–27B final families**. The **96 GB FP8 stack** at **$0.336/GPU-h** is reserved for the N1 smoke plus a small GPQA precision replication. Stage costs: FP8 smoke/replication **$25–40**, pilot **$15–20**, Core **$175–210**, Full **$210** (32-row gold-evidence default) or **$235** (36-row gold-answer alternate), storage/bandwidth **$40–80**; **total $500–600**; **hard stop $600**. Law-testing is outside the envelope. The 96 GB main-run fallback is **$1,050–1,150** and needs re-approval. See `docs/agent/08_COMPUTE_COST.md`.

| Month | Objectives | Development | Experiments | Deliverables |
| --- | --- | --- | --- | --- |
| **Nov 2026** | Final-stack readiness, WP-18, calibration, verifier audit start | 96 GB smoke (**NOT RUN**; offline 73.68 GB check only); B8-placebo/B8-oracle switches | 24-item calibration | smoke PASS; 6-arm support; calibration report |
| **Dec 2026** | Verifier audit; pilot run | 150–200 claim–passage pairs; 100–150 pilot questions | Injection κ; baseline collapse check | **G2**; verifier report |
| **Jan 2027** | Core run | 4-condition matrix, GPQA 400 + MMLU-Pro 400 + HLE 200, 2 seeds | 24 runs; 1,280 GPU-h cap | **G3**; SciClaimBench-180 freeze (v1.2) |
| **Feb 2027** | Full run | 6-arm config; 300-item benchmark target | 32-row gold-evidence default (36-row gold-answer alternate); human eval starts | **G4/G5** |
| **Mar 2027** | Human evaluation and SDT | 150–200 paired items, 3 raters, expert ceiling | κ/ICC; SDT axes | Analysis freeze |
| **Apr 2027** | Law-testing and ablations | q sweep, ρ, granularity, shared-error floor | Only if the effect is real | Results freeze |
| **May–Jun 2027** | Thesis | Chapters, internal review, reproducibility package | — | Thesis submission June 2027 |
| **Jun–Jul 2027** | Defence | — | — | Defence June/July 2027 |
| **Aug–Dec 2027** | Paper | TACL rolling, EMNLP 2028, or Q1 journal | — | Submission after the defence |

**No paper deadline before the defence.** The old 1 February 2027 target is retired; the paper window is August–December 2027.

## Phase 4 of 5 — Sections 13–15

---

### Section 13 — Implementation Order

**Exact build sequence, with dependency reasoning:**

1. **vLLM multi-model serving setup** — nothing else can be tested without this. Start with the Dev models ([Qwen3.5-9B](https://huggingface.co/Qwen/Qwen3.5-9B), [Gemma 4 12B](https://huggingface.co/google/gemma-4-12B), [Ministral-3-14B-Instruct-2512](https://huggingface.co/mistralai/Ministral-3-14B-Instruct-2512)) on an RTX A6000 48GB; verify all three load and generate correctly before writing any orchestration code. The 4-bit 24–27B final families run the main matrix on the 80 GB A100; the FP8 checkpoints are validated on the RTX PRO 6000 Blackwell 96GB only once the pipeline is stable.

2. **Vanilla MAD reproduction (Du et al. 2023)** — must come before any of our own additions. This is Gate 0. It validates the base debate loop works at all, independent of our contribution, so any later bugs can be isolated to _our_ additions rather than the underlying framework.

3. **Injection protocol (§5.4, Steps 1–6)** — must exist before the trust mechanism, because trust calibration can only be evaluated against a working, validated stress test. Building trust math without a working injection protocol means you can't tell if the mechanism works until much later — this ordering catches protocol problems (e.g., low κ) early and cheaply.

4. **Pilot run** (Section 12, Dec 2026) — must run before the Core matrix. This is the highest-risk assumption in the whole project (Section 0); testing it on 100–150 questions first prevents spending Core-run money on a mechanism that might not behaviorally matter.

5. **Claim decomposition + claim-domain retrieval** — must come before the trust update function, since the trust formula's inputs (Vᵢ, Hᵢ) are _outputs_ of retrieval and evidence scoring. Building trust math before retrieval exists means it can only be tested against mocked data — acceptable for unit tests, not for validation.

6. **Trust update function (logit accumulation → softmax → simplex projection)** — implement and unit-test the exact operator order in isolation before wiring it into the full debate loop. This is where Proposition 1's boundedness must be verified computationally (write a test that runs thousands of synthetic score sequences and confirms min ≥ floor, sum = 1, and max ≤ effective ceiling) before it's trusted inside the larger system.

7. **Full debate loop integration** (plain-Python state machine; LangGraph is not implemented) — only after steps 1–6 are each independently validated. Integration bugs are far easier to isolate when every component has already been unit-verified alone.

8. **Baselines B1–B4** (single-agent, single-agent+RAG, MAD, MAD+retrieval matched) — these reuse components already built (steps 1, 5) and establish the comparison floor before adding the more complex baselines.

9. **Baselines B5–B6** (Self-Consistency, MoA) — independent of our core mechanism, can be built in parallel with step 10 if team capacity allows (both use the same 3 models, different aggregation logic).

10. **Baselines B9–B10 (iMAD and ConsensAgent reimplementations)** — deliberately sequenced _last_ among baselines because they are the highest-difficulty components (Section 7's difficulty ranking) and benefit from the team having already built confidence-scoring-adjacent code that shares some logic.

11. **Final-stack smoke (critical two-phase gate)** — before committing to the main matrix, rent an RTX PRO 6000 Blackwell 96GB for **60–100 GPU-h (~$25–40)**. From `trustcal/`, run `PHASE=final bash setup.sh`, `python scripts/check_stack.py --phase final`, `python scripts/preflight.py --phase final --offline`, `python scripts/verify_env.py --check-servers`, then `python scripts/smoke_test.py --phase final --limit 20`. Load all three Final models and verify (a) claim tags parse correctly for every model, (b) injection affects all three as expected, (c) trust math runs without NaNs, (d) the state machine completes K=3 rounds for every model combination. **Status: NOT RUN**; only the offline 73.68 GB check passes.

12. **Core and Full experiment matrix execution** — Core only after the pilot (G2) and step 11 pass; Full only after Core (G3) and WP-18.

13. **Human evaluation + failure analysis** — last, since it requires completed experimental results to annotate against.

> [!CAUTION]
> **Forbidden build shortcuts — violating these costs months:**

**What should never be built before another module:**

- Never build the trust update function before retrieval exists (step 6 before step 5) — it would have nothing real to operate on.
- Never build B9 (iMAD) before the core system (steps 1–7) — B9 reuses debate-loop infrastructure; building it first means duplicating work.
- Never run the full experiment matrix (step 12) before the pilot (step 4) confirms the core assumption — this is the single most important ordering constraint in the whole roadmap, because it's the one place where skipping ahead risks months of wasted engineering.

**Critical milestones (mapped to Section 12's Gates):** Gate 0 = step 2 complete (passed 2026-09-16); P0 = engineering release (passed 2026-11-09); G2 = pilot after steps 3–11; G3 = Core after G2; G4/G5 = Full after WP-18.

---

### Section 14 — Supervisor Explanation

#### "How to Explain Our Project in 5 Minutes"

**The problem, in one sentence:**
When AI systems debate each other to reach better answers, a confident-but-wrong majority can talk a correct minority into changing its answer — even with no new evidence. This defeats the whole purpose of having them debate.

**The solution, in one sentence:**
We make each AI's vote in the final decision worth more or less depending on whether its claims actually check out against real scientific papers — not based on how many other AIs agree with it.

**System input:** a hard science question, plus access to a library of real, retrievable research papers (PubMed, ArXiv, Semantic Scholar).

**Internal workflow, plain-language:**

1. Three different AI models each independently answer the question.
2. Each one's claims get checked against real papers — like a fact-checker.
3. Whoever's claims hold up gains "credibility"; whoever gets contradicted loses credibility.
4. They see each other's answers and get a chance to revise — but they also know their own credibility standing.
5. This repeats for a few rounds.
6. The final answer is decided by a credibility-weighted vote, not a simple majority.

**Role of each agent:**

- Three **debate agents**, each a different AI model family (this matters — using different models means they don't all share the same blind spots).
- A **fact-checking layer** that pulls real evidence for each claim.
- An **orchestrator** that keeps score and runs the rounds.

**Final output:** one answer, plus which papers support it, plus a transparent record of how much each AI's opinion counted and why.

**Why the output is useful:** normally, if two AIs agree and one disagrees, most systems just trust the two — even if they're wrong. Our system instead trusts whoever the _evidence_ supports, even if that's the lone dissenting voice.

**Answering: "When evidence papers are provided as input, what exactly is the output?"**

> Say we give the system one 2023 clinical trial paper and ask: "Does Drug X lower blood pressure in adults over 60?"
>
> - Reviewer A says "Yes, significant effect."
> - Reviewer B says "No effect found."
> - Reviewer C says "Yes, but only in a specific subgroup."
>
> The system checks each claim against the actual paper. The paper shows a modest effect, but only in patients with a specific condition — closely matching Reviewer C. Reviewer C's credibility goes up; A and B's go down.
>
> **Output:** "Yes, but only in [that subgroup]" — with a citation to the exact part of the paper that supports it, and a note that two other reviewers initially disagreed and why they were down-weighted.

_(This example is preserved unchanged from the earlier supervisor-explanation task — kept consistent across the blueprint rather than rewritten.)_

---

### Section 15 — Team Explanation (Beginner-Friendly)

**Simple overview:**
Think of three friends trying to answer a hard trivia question together. Normally, if two friends agree on an answer and one disagrees, you'd probably go with the two. Our project builds a system where instead, each friend's opinion is weighted by how well they can back it up with real sources — so the one friend with a solid source can outvote the other two if they're just guessing confidently.

**Step-by-step workflow (plain English):**

1. Ask the question to three different AI models.
2. Each gives an answer and explains their reasoning.
3. We break their reasoning into individual claims.
4. We look up real research papers to check each claim.
5. Claims that check out earn "trust points"; claims that get contradicted lose trust points.
6. The AIs see each other's answers and get to change their minds if they want.
7. Repeat steps 3–6 a few times.
8. The final answer is picked based on trust points, not just "who agreed with whom."

**AI terminology glossary:**

- **LLM (Large Language Model):** the AI model doing the reasoning (e.g., Qwen, Mistral).
- **Multi-agent debate:** multiple AI models discussing a question together.
- **Sycophancy:** an AI changing its answer to agree with others, even without good reason.
- **RAG (Retrieval-Augmented Generation):** looking up real documents to check or support an answer, instead of relying only on the AI's memory.
- **Trust score:** our system's running "credibility scorecard" for each AI, updated each round.
- **Baseline:** an existing method we compare our system against, to prove ours is actually better.
- **Ablation:** removing one piece of our system to see how much that piece actually matters.

**Analogy:**
Think of a courtroom. Majority-vote debate is like a jury that just goes with whichever two jurors talk the loudest. Our system is more like a judge who actually checks the evidence each juror cites — and rules based on whose evidence holds up, not who's more persuasive or more numerous.

**Text-based diagram:**

```
Question → [3 AI opinions] → [fact-check each claim] → [adjust trust]
    → [AIs revise, aware of their trust standing] → repeat
    → [final answer = trust-weighted vote]
```

**FAQs:**

- _"Why not just use the biggest, smartest AI model alone?"_ — Even strong models hallucinate confidently. Debate + fact-checking catches errors a single model might miss.
- _"Why three different AI models instead of three copies of the same one?"_ — Different models make different mistakes. Same-model copies tend to share blind spots.
- _"What if all three AIs are wrong about the same thing?"_ — Known limitation — we test for this directly (comparing same-family vs different-family model setups).
- _"Isn't this just fancy prompt engineering?"_ — No — there's an actual mathematical formula deciding how much each AI's vote counts, and we test whether removing pieces of the system (the ablations) actually hurts performance, which proves the pieces matter.

**Common misunderstandings:**

- Thinking the system trains/fine-tunes the AI models — it doesn't; all models are used as-is (inference only).
- Thinking "trust score" is just each AI grading itself — it's driven by external fact-checking against real papers, not self-assessment.
- Thinking this only works on math questions — the datasets used include math-heavy stress tests because they're easy to grade objectively, but the mechanism is domain-general.

**What each team member should understand before implementation begins:**

1. The plain-English workflow (Section 14/15 above) — everyone, regardless of role.
2. The trust formula and why logit accumulation→softmax→simplex projection is the specified order (Section 4.4 of original design) — whoever implements the orchestrator.
3. The injection protocol and why it exists (§5.4) — whoever builds/runs experiments.
4. The baseline registry B1–B10 and which four conditions form the Core matrix — whoever writes the results/paper sections.

---

**Confirming before continuing:** Sections 13–15 reflect the post-P0 build order and stage names; the current dates and gates are in `roadmap.md`.

Proceeding to **Phase 5 (Sections 16–18)** — the final phase.

---

## Phase 5 of 5 — Sections 16–18

---

### Section 16 — Expected Research Outcome

**Expected technical improvements (all projections, not measured):** 20–30% collapse reduction vs. standard MAD; trust AUROC above chance and a lower Brier score than the control; higher CMR; competitive-or-better accuracy on GPQA-Main/MMLU-Pro (i.e., anti-sycophancy gains should not come at the cost of baseline correctness). No efficacy number is a result until the Core run.

**Expected experimental results pattern:**

- Largest gains on pressure-eligible items (GPQA-Main, MMLU-Pro) and the SciClaimBench benchmark, where the mechanism is targeted.
- Near-zero gain on easy/agreed-upon questions — reported honestly as a domain-of-applicability boundary, not hidden.
- The planned strongest result sentence is the B8 vs B8-no-trust accuracy/CMR contrast; B4-matched is the evidence-information control.

**Expected contribution:** C1 (trust-calibrated evidence-grounded aggregation mechanism) + C2 (open accuracy/CMR/trust-calibration evaluation harness; ECR deprecated) — both independently reusable and citable, which strengthens impact beyond a single result table.

**Novelty:** genuine and verified — no existing published or preprint work combines in-session, evidence-grounded, dynamically-updating trust with formal boundedness guarantees. Confirmed via extensive literature checks against Minority Sentinel, iMAD, MoA, DebUnc, ConsensAgent, and Wynn et al. Note that ConsensAgent (Findings of ACL 2025) is now a _published_ mitigation for the same problem; our novelty is therefore stated precisely as the _mechanism_ — external, evidence-grounded, numeric, formally bounded trust — not as "first to mitigate sycophancy."

**Publication potential:** realistic primary target TACL rolling (2028), EMNLP 2028, or a Q1 journal after the defence; ACL/EMNLP Main remains a stretch conditional on clear, statistically significant gains over the published competitors (MoA — ICLR 2025 Poster; iMAD — AAAI 2026 Oral; ConsensAgent — Findings of ACL 2025). A workshop submission is the safe floor.

**Success criteria (concrete, falsifiable):**

- Statistically significant accuracy and/or CMR improvement for B8 over B8-no-trust on pressure-eligible items, with 95% CIs not overlapping zero.
- Trust AUROC above chance and trust Brier better than the constant 1/3 predictor on the primary datasets.
- Pilot (G2) confirms trust weights causally affect aggregation output; Core (G3) measures the primary endpoints.
- Full (G4/G5): placebo does not match B8 and oracle separates — contingent on WP-18 and on the oracle scope (32-row gold-evidence default vs 36-row gold-answer alternate).

**Graduation outcome:** FYDP thesis submitted June 2027 and defended June/July 2027; paper submission August–December 2027; fully reproducible codebase and evaluation harness released.

---

### Section 17 — Future Extensions

**MSc/PhD research:** the trust mechanism's convergence properties for N>3 agents are explicitly flagged as future work (already noted in original proposal's FAQ). A PhD-scope extension could pursue formal convergence theorems rather than the FYDP's bounded design-property propositions.

**Open-source framework:** the accuracy/CMR/trust-calibration evaluation harness (C2) is independently valuable as a released tool — other researchers testing their own anti-sycophancy methods could adopt it as a standard benchmark, similar to how SciFact or GPQA function as reusable community benchmarks. ECR is not part of the current harness.

**Research platform potential:** the claim-domain retrieval + trust-calibration architecture generalizes beyond scientific QA to any domain with retrievable ground-truth-adjacent evidence (legal reasoning against case law, medical reasoning against clinical literature) — worth noting as a scope-expansion direction, not claimed as current contribution.

**Startup potential:** lower priority for this specific mechanism (the evaluation harness is more broadly useful than the trust mechanism as a standalone product), but a "trustworthy multi-agent reasoning API" framing is plausible if the mechanism generalizes well across domains in follow-up work.

**Long-term trust memory:** already named in the original proposal's future-directions FAQ (cross-session trust memory, multimodal evidence grounding, domain-specific calibration) — preserved unchanged here as the canonical list.

---

### Section 18 — Final Critical Review (Reviewer #2 Mode)

**Challenging every assumption, as an adversarial reviewer would:**

**On the core mechanism:**

- _"Your trust formula has two free hyperparameters (α, β) — how do I know you didn't just tune them until the result looked good?"_ — Mitigated by the planned hyperparameter sensitivity analysis (grid search, projected CCR variation <4% across configs) — but ensure this section is prominent in the paper, not buried in an appendix, since it's a first-line reviewer question.
- _"Propositions 2–3 aren't real theorems — why call them Propositions at all?"_ — Already correctly reframed as "design properties, not global convergence theorems" — this is the right call, but expect at least one reviewer to push on this framing regardless; have the honest answer ready rather than over-defending the math.
- _"Is a projected 20–30% collapse reduction actually a big number, or is it modest window-dressing?"_ — Needs a sentence in the paper contextualizing this against the baseline collapse rate (~45%) so readers understand the relative, not just absolute, magnitude. It remains a projection until the Core run.

**Missing experiments/evaluations a sharp reviewer might demand:**

- **Latency/cost-benefit analysis:** the system runs ~9 forward passes vs. 1 for single-agent. A reviewer will ask "is the accuracy/CMR gain worth 9x the compute?" — this isn't currently a headline metric. **Recommend adding a compute-cost-vs-accuracy/CMR table** as a supplementary result before final submission.
- **Robustness to paraphrased injection templates:** currently named as a known protocol limitation (L2) but not tested. If time allows in Phase 4's buffer month, even a small (20–30 question) paraphrase-robustness check would meaningfully strengthen the paper against the "your injection template is too easy to detect" objection.
- **Sensitivity to K (number of debate rounds):** N-scaling is planned, but K is fixed at 3 throughout. A reviewer may ask whether results are an artifact of this specific round count.

**Missing datasets:** none flagged as critical — the current Core set (GPQA-Main, MMLU-Pro, HLE) plus the SciClaimBench v1.2 benchmark is well-justified; BrokenMath/BrokenArXiv are appendix-only checks.

**Possible reviewer criticisms, ranked by likely severity:**

1. **"How is this meaningfully different from DebUnc's uncertainty weighting or iMAD's debate gating?"** — Ensure the "external evidence vs. same-context confidence signal" and "in-debate weighting vs. when-to-debate" distinctions are stated in the first paragraph of the results section, not just the related work.
2. **"Your injection protocol is artificially explicit — real sycophancy is subtler."** — Already acknowledged (Limitation L1) as an honest upper-bound scenario; this should be stated early and confidently, not defensively.
3. **"Two of your four core citations aren't peer-reviewed."** — Addressed via the proactive-disclosure approach already established; ensure this same framing appears in the paper's related-work section, not just the supervisor meeting.

**Proposal defense questions to prepare (beyond the original Section 11 FAQ, which remains valid):**

- "What's your actual Go/No-Go criterion if the pilot shows the trust signal doesn't behaviorally matter?" — **This needs an explicit answer before the meeting.** Suggested answer: fall back to reporting the pilot's negative result honestly as a finding about _when_ evidence-grounded trust does/doesn't influence LLM aggregation behavior — this reframes a possible negative result as still-publishable knowledge, consistent with the project's "result-neutral milestones" philosophy.

**Mid-defense and final-defense question themes:** expect deeper probing on the iMAD/ConsensAgent reimplementation fidelity (the highest-effort, highest-scrutiny components) and on whether the human evaluation sample (150–200 paired items, 3 raters) is large enough for the claimed statistical power — have a brief power-analysis justification ready.

**Journal reviewer concerns (if targeting TACL, EMNLP 2028, or a Q1 journal):** primary concern will likely be generalization beyond the three specific chosen model families — pre-empt with a sentence in limitations acknowledging this is inherent to any finite-agent-pool study, consistent with the "Scope Boundaries" section already present in the original proposal.

**Recommended pre-Core actions, in priority order:**

1. Run the 96 GB Final-stack smoke (currently NOT RUN; offline check only).
2. Finalize WP-18's oracle scope (gold-answer vs gold-evidence-only on SciClaimBench) before freezing the Full config.
3. Add the compute-cost-vs-accuracy/CMR table to the planned evaluation outputs.
4. Freeze the 24-item calibration batch and start the verifier audit.

---

**Blueprint complete.** Sections 1–18 are the research design record. Execution status, ordered gates and current costs live in `roadmap.md`; per-component implementation status lives in `trustcal/IMPLEMENTATION_STATUS.md`. Historical design notes are labelled rather than silently rewritten, and no efficacy result is claimed before the pilot and Core run.
