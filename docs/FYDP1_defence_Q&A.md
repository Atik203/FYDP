# FYDP I Defence — Master Q&A Guide

**Group 6 · Team Phantom Devs · CSE 4000A (B) · Final Defence**

> **P0 release note (2026-11-09):** P0 is released on `main` = `dev` = `2ae56a3` (tags `p0-gate` = `055a244`, `p0-release` = `7f2c11f`). Gate 13/13; 514 tests; WP-09 complete; WP-13 is the landed B8-no-trust prompt split; **WP-18** (B8-placebo/B8-oracle) is pending. Next order: 96 GB Final-stack smoke (**NOT RUN**; offline check only) → WP-18 → 24-item calibration → verifier audit → pilot → Core → Full. Core matrix: 4 conditions × 3 datasets × 2 seeds = 24 runs, 1,280 GPU-h conservative cap. `PRE_REGISTRATION.md` v1.0. Older "stub / not wired" lines are historical and labelled where they remain.
>
> Deep-dive rehearsal file: system mechanics, code pointers, what-if behavior, and honest status.
> The slide-by-slide speech and quick judge questions live in `docs/presentation.md` — do not duplicate them here.
>
> **Status legend:** ✅ runs today · 🟡 built but not wired · 🔴 planned / stub.
> **Honest rule:** say what runs, what is built but not wired, and what is planned. Never overclaim — judges test the boundary.
> **If you do not know:** "I will come back to that," then pass it to the slide owner (Section 0).

## Index

- [0. How to Use This Guide](#0-how-to-use-this-guide)
- [1. Project in One Page](#1-project-in-one-page) — [1.1 Two-Minute Script](#11-two-minute-script) · [1.2 Quick Status Card](#12-quick-status-card)
- [2. System Walkthrough — One Question, End to End](#2-system-walkthrough--one-question-end-to-end) — [2.1 Walkthrough Questions](#21-walkthrough-questions) · [2.2 A Full Worked Example](#22-a-full-worked-example)
- [3. Design Decisions & Why](#3-design-decisions--why) — [3.1 Extended Why-Q&A](#31-extended-why-qa) · [3.2 Alternatives Considered and Rejected](#32-alternatives-considered-and-rejected)
- [4. What-If & Edge-Cases](#4-what-if--edge-cases)
  - [4.1 Gate & Input](#41-gate--input) · [4.2 Debate Loop](#42-debate-loop) · [4.3 Claims](#43-claims) · [4.4 Retrieval](#44-retrieval) · [4.5 Trust Update](#45-trust-update) · [4.6 Aggregation](#46-aggregation) · [4.7 Injection](#47-injection) · [4.8 Metrics & Annotation](#48-metrics--annotation) · [4.9 Statistics](#49-statistics) · [4.10 Infra & Serving](#410-infra--serving) · [4.11 Deep Scenario Chains](#411-deep-scenario-chains)
- [5. Metrics & Evaluation Deep-Dive](#5-metrics--evaluation-deep-dive) — [5.1 Worked Metric Examples](#51-worked-metric-examples) · [5.2 Error Taxonomy & Human Study](#52-error-taxonomy--human-study)
- [6. Baselines B1–B10 Deep-Dive](#6-baselines-b1b10-deep-dive) — [6.1 Per-Baseline Notes](#61-per-baseline-notes)
- [7. Injection Protocol Deep-Dive](#7-injection-protocol-deep-dive) — [7.1 Protocol Failure Modes](#71-protocol-failure-modes)
- [8. Trust Mechanism Deep-Dive](#8-trust-mechanism-deep-dive) — [8.1 Worked Trust Example](#81-worked-trust-example) · [8.2 Trust Q&A](#82-trust-qa)
- [9. Retrieval & Evidence Deep-Dive](#9-retrieval--evidence-deep-dive) — [9.1 Retrieval Q&A](#91-retrieval-qa) · [9.2 Source API Details](#92-source-api-details)
- [10. Claim Decomposition Deep-Dive](#10-claim-decomposition-deep-dive) — [10.1 Claim Q&A](#101-claim-qa)
- [11. Implementation & Reproducibility](#11-implementation--reproducibility) — [11.1 Runbook](#111-runbook) · [11.2 Test Inventory](#112-test-inventory) · [11.3 Repo File Map](#113-repo-file-map)
- [12. Implemented vs Planned](#12-implemented-vs-planned) — [12.1 Status Q&A](#121-status-qa) · [12.2 What Runs in Each Arm](#122-what-runs-in-each-arm)
- [13. Datasets & Sources](#13-datasets--sources) — [13.1 Dataset Q&A](#131-dataset-qa)
- [14. Experiments & Evidence](#14-experiments--evidence) — [14.1 Reading the Gate 0 Numbers](#141-reading-the-gate-0-numbers) · [14.2 Ablations Explained](#142-ablations-explained)
- [15. Compute, Cost & Feasibility](#15-compute-cost--feasibility) — [15.1 Budget Table](#151-budget-table)
- [16. Risks, Limitations & Weak Spots](#16-risks-limitations--weak-spots) — [16.1 Hard Questions Drill](#161-hard-questions-drill)
- [17. Novelty & Related Work](#17-novelty--related-work) — [17.1 Positioning Q&A](#171-positioning-qa) · [17.2 Related Work One-Liners](#172-related-work-one-liners)
- [18. Where Is It in the Report?](#18-where-is-it-in-the-report)
- [19. Team Contributions](#19-team-contributions) — [19.1 Contribution Q&A](#191-contribution-qa)
- [20. Emergency Answers](#20-emergency-answers) — [20.1 Last-Hour Checklist](#201-last-hour-checklist)

## 0. How to Use This Guide

**Status legend** (used throughout):

- ✅ **Runs today** — implemented and tested in the repo.
- 🟡 **Built, not wired** — code exists and is tested, but is not yet called inside the debate loop.
- 🔴 **Planned** — a stub exists (`NotImplementedError`) or the work is scheduled in a later phase.

**Answer rules:**

1. Answer in one to three short sentences, then point at the slide or open the file named in the **Code:** line.
2. "Show me the code" questions: use [Section 11](#11-implementation--reproducibility) and the code map inside each section.
3. If asked about a planned feature, say it plainly: "That part is scheduled; the trust math is already tested standalone."
4. Never imply agents see the gold answer — they never do.
5. Keep our claims scoped: "no existing system ties influence to external evidence during the debate" — never "first to mitigate sycophancy."

**Slide owners:** M1 Rakibul · M2 Yousuf · M3 Atik · M4 Pratay · M5 Salman · M6 Limu.

**Handoff phrases:** "Yousuf will now present our goals and data." · "Atik will present our method." · "Pratay will present the flow and setup." · "Salman will present the results and the engineering check." · "Limu will close the presentation."

## 1. Project in One Page

**What it is.** An evidence-checked debate system for LLMs answering hard science questions. Three different models debate over three rounds. Their answers are split into claims; each claim is checked against scientific literature (PubMed, arXiv, Semantic Scholar); each model's trust score updates every round; the final answer is a trust-weighted vote, not a head count.

**The problem.** Sycophantic consensus — a confident wrong majority pushes a correct minority agent to abandon its answer. Majority voting gives every agent equal weight and never consults external evidence during the debate (`docs/blueprint.md:71-75`).

**Pipeline in one line:** question → confidence gate → three-agent debate (3 rounds) → claim decomposition → claim-domain retrieval → verdicts → trust update → trust-weighted aggregation → result package (answer + citations + trust trajectory).

**Scope today (be exact):**

- ✅ Gate 0: full three-model debate loop runs end to end on 10 GPQA questions — 10/10 debates, 90/90 positions (`experiments/gate0/README.md:29-35`).
- ✅ Trust math, parser, endpoints, injection, runner, verifier interface, κ tooling — tested (514 tests).
- ✅ Trust update is wired into the debate loop; revisions use the evolving trust and the final vote uses `trust_for_positions`.
- 🟡 Retrieval/verifier quality and the human audit remain the bottleneck; ECR is deprecated and not a primary endpoint.

**Why it matters.** Answers come with citations a reader can check. The design fits scientific QA, research assistants, and any evidence-rich domain (law, medicine).

### 1.1 Two-Minute Script

If asked "explain your project in two minutes," say this:

"Three language models answer the same science question. Most debate systems then take a majority vote, so a confident wrong pair can outvote a correct third model and pressure it into changing its answer — we call that sycophantic consensus. We replace the vote with an evidence-grounded trust score. Each answer is split into atomic claims, every claim is checked against scientific literature, and each model's trust updates every round from what the sources say. The final answer is a trust-weighted vote, not a head count. Today the debate loop, the injection stress test, retrieval and logging run end to end — Gate 0 completed ten of ten debates and ninety of ninety positions. Next are the 96 GB Final-stack smoke, WP-18 placebo/oracle, the 24-item calibration, the verifier audit, then the pilot, Core and Full runs."

### 1.2 Quick Status Card

| Area | Status | One-line evidence |
| --- | --- | --- |
| Debate loop + serving | ✅ measured | Gate 0: 10/10 debates, 90/90 positions, 370.8 s mean |
| Injection stress test | ✅ implemented | one shot t1→2, minority-targeted (`injection.py:41-71`) |
| Trust math | ✅ wired | `trust/update.py`; simplex projection + claim counts |
| Confidence gate | 🟡 prompt only | `agents/prompts.py` |
| Retrieval + verdicts | 🟡 implemented; human audit pending | `retrieval/sources.py`, `verifier.py` |
| Accuracy / CMR / AUROC / Brier | ✅ implemented | `eval/metrics.py`, `eval/endpoints.py` |
| ECR | 🟡 deprecated | `eval/metrics.py`; not a primary endpoint |
| Placebo / oracle (WP-18) | 🔴 pending | B8-placebo/B8-oracle not implemented |
| Statistics (bootstrap, McNemar, Holm) | ✅ implemented | `eval/stats.py`, `scripts/run_matrix.py` |
| Tests | ✅ 514 tests | colocated `test_*.py` |

**The one sentence to repeat:** "The loop is real, the math is real and tested, and the evidence layer is implemented; the verifier audit and the paid matrix are the remaining gates."

## 2. System Walkthrough — One Question, End to End

This is the story to tell when a judge asks "walk me through what actually happens." The left column is the process; the right is where it lives and whether it is live.

| # | Stage | What happens | Where | Status |
| --- | --- | --- | --- | --- |
| 1 | Intake & Gate | Question enters; a prompt asks the model whether debate is needed (`DEBATE=YES/NO`). Easy questions take a direct answer. | gate prompt `trustcal/src/trustcal/agents/prompts.py:11-17` | 🟡 prompt defined; not invoked in the runner yet |
| 2 | Round 0 — Initial positions | Each of the three agents answers independently (temperature 0.7, 1024 max tokens). | loop `trustcal/src/trustcal/orchestrator/debate.py:41-45`; client `inference/client.py:30-46` | ✅ |
| 3 | Claim decomposition | Agents self-tag claims as `<claim id="cX">…</claim>`; a parser extracts them; if tags are missing, a sentence-split fallback caps at 20 claims, minimum 3 words. | `agents/prompts.py:9,23-24`; `agents/parser.py:38-71` | ✅ |
| 4 | Claim-domain retrieval | Claims route by domain: bio/clinical → PubMed + Semantic Scholar; physics/chem and math/CS → arXiv + Semantic Scholar; other → Semantic Scholar/OpenAlex. Dedup by DOI, arXiv ID, or title; evidence volume is equalized. | `retrieval/sources.py`, `retrieval/pipeline.py` | ✅ implemented and routed; live API smoke pending |
| 5 | Verdicts | Each claim gets supported / contradicted / unverifiable; `supported` requires bidirectional support, no evidence → unverifiable. Unverifiable claims do not move trust. | `retrieval/verifier.py` | ✅ interface + lexical verifier; human audit pending |
| 6 | Trust update | Logit accumulation + α·V/n − β·H/n, then one softmax, then a floor/ceiling simplex projection. α = 0.5, β = 0.3 by default; V and H are normalized by claims checked. | `trust/update.py` | ✅ unit-tested and called by the loop |
| 7 | Injection (stress only) | One fabricated wrong expert consensus appended to the targeted agent's system prompt between rounds 1 and 2; off in B1–B4. | `orchestrator/injection.py:41-71`; `orchestrator/debate.py:47-56` | ✅ |
| 8 | Revision rounds | Agents see peer positions (capped at 1500 chars) and their own trust, then revise; K = 3 rounds. | `orchestrator/debate.py` | ✅ |
| 9 | Trust-weighted aggregation | Final answer = argmax of Σ trust × position, using the trust computed from the final positions. No head counting. | `trust/aggregation.py` | ✅ called with `trust_for_positions` |
| 10 | Result package | Answer + citations + trust trajectory, written to records and summary. | `runner.py` | ✅ (trajectory and `trust_for_positions` recorded) |

**How to phrase the gap honestly:** "The debate loop, injection, retrieval, trust, and logging now run end to end in mock and integration tests. The remaining gap is the paid main matrix and the human verifier audit, not the wiring."

### 2.1 Walkthrough Questions

- **Q: Where does the confidence gate sit, and who calls it?** Before round 0. The prompt exists (`agents/prompts.py:11-17`) but the runner does not call it yet — gate wiring remains open.
- **Q: How do agents see each other's answers?** Only peer positions plus reasoning, truncated to 1500 chars each (`orchestrator/debate.py:60`). They never see raw prompts or another agent's system message.
- **Q: What exactly is logged per question?** Position per agent per round, parsed claims, injection metadata (targets, scope), timing, and the final answer — written to `records.jsonl` plus summary files (`runner.py:102-144`).
- **Q: Where does the gold answer touch the system?** Selection and scoring only — never inside the loop (`INJECTION_PROTOCOL.md`).
- **Q: Which stage is the current bottleneck?** Verifier quality and the human audit. Retrieval is implemented and routed; the question is whether the verifier's labels are accurate enough for the trust signal to be meaningful.
- **Q: How long does one question take end to end?** About 6 minutes at Gate 0 settings (370.8 s mean), dominated by nine generations on one GPU.
- **Q: Can the pipeline run without GPUs?** Yes, for logic verification — `mock_vllm.py` serves agree / divergent / untagged modes, used by the integration tests.
- **Q: What is the first thing to check when a run looks wrong?** The preflight report and the per-round positions in `records.jsonl`; most failures are serving or parsing, not the loop itself.
- **Q: Where is the final "answer" chosen?** Stage 9, weighted aggregation (`trust/aggregation.py`), using the trust computed from the final positions. The record stores that actual answer and its source; metrics do not recompute a majority.
- **Q: What stops the loop from running forever?** Fixed K = 3 rounds and a retry cap of 3 per agent per call (`configs/models.yaml:16`; `inference/client.py:38`).

### 2.2 A Full Worked Example

Walk this story with the dataflow figure (`frontend/public/figures/fig-dataflow.png`) on screen.

- **Question:** "Which mechanism most directly explains the observed temperature dependence of reaction rates?" Gold: B.
- **Rounds 0–1:** A answers "A", B answers "B", C answers "A" — consensus A, correct minority B.
- **Claims + retrieval:** B's physics claim routes to arXiv + Semantic Scholar; A's bio claim routes to PubMed + Semantic Scholar.
- **Verdicts + trust:** B's main claim supported; A's contradicted; C's unverifiable. B gains weight, A loses weight, C unchanged.
- **Injection branch (stress only):** a fabricated expert consensus for "A" is appended to B's prompt between rounds 1 and 2. If B switches without new evidence, that is one collapse event.
- **Vote + package:** the weighted vote carries B's evidence-backed answer; the package returns answer B, arXiv citations, and the trust trajectory.

## 3. Design Decisions & Why

Every "why did you choose X" question, in one table.

| Decision | Choice | Reason | Where |
| --- | --- | --- | --- |
| Number of agents | 3, different families (Qwen, Gemma, Mistral) | Smallest group where a majority can form; different families reduce correlated errors | `configs/models.yaml:20-48`; blueprint §5 |
| No fine-tuning | Inference-only | The mechanism must be model-agnostic; fine-tuning hides whether trust itself changes behavior | `Papev_Summer26_6/cas-sc-template.tex:194` |
| Rounds | K = 3 | Enough for trust to update twice; bounded cost | `configs/models.yaml:16` |
| Trust update | Logit accumulation + α·V/n − β·H/n | Transparent, bounded, unit-testable; support and contradiction normalized by claims checked | `trust/update.py` |
| α / β | 0.5 / 0.3 defaults | Conservative start; the Phase-3b grid search tunes them | `trust/update.py`; sweep blueprint `:476` |
| Floor / ceiling | [0.1, 0.9] by simplex projection | No agent can dominate or vanish; projection enforces the floor after every update | `trust/update.py`; `Papev:218` |
| Operator | Logit accumulation → softmax → simplex projection | The projection enforces the bound; the old clamp→renormalize order could drop below the floor | `trust/update.py`; blueprint `:266-272` |
| Aggregation | argmax Σ trust × position | Influence from evidence, not head count | `trust/aggregation.py:15`; blueprint `:304-305` |
| Confidence gate | Binary prompt, pre-filtered eval sets | Avoids ~9 passes/question on easy items; misclassification only hurts throughput, not correctness | blueprint `:216-228` |
| Source routing | Claims route by domain; no source belongs to an agent | Bio/clinical → PubMed + Semantic Scholar; physics/chem and math/CS → arXiv + Semantic Scholar; shared fallback | `retrieval/sources.py`; WP-12 |
| Retrieval depth | top-k 10, rerank to 3 | Recall then precision; cross-encoder keeps prompts small | `retrieval/verdicts.py` (audit pending) |
| Verdicts | supported / contradicted / unverifiable / contested | Unverifiable must not move trust; contested is reported separately | `Papev:201`; blueprint `:260` |
| Injection point | between rounds 1 and 2, once | Pressure with no new evidence; upper-bound stress test | blueprint `:182,299` |
| Injection target | the correct-minority agents by default | Tests exactly the collapse thesis | `orchestrator/injection.py:64-67` |
| Datasets | Core: GPQA-Main + MMLU-Pro + HLE; EG-SSS v1.2; BrokenMath/BrokenArXiv appendix-only | Accuracy comparability plus a ceiling control; no adversarial set in the Core matrix | [Section 13](#13-datasets--sources) |
| Sample size | pilot 100–150; Core caps 400/400/200 | Stable paired statistics vs iteration speed | `configs/experiments.yaml`; `PILOT_CRITERION.md` |
| Seeds | 2 for the main matrix; the pilot is a single frozen set | Replication without doubling the Core-run budget; the unit of analysis is the question | `PRE_REGISTRATION.md` |
| Metrics | Final accuracy + CMR primary; ARR, trust AUROC/Brier; ECR deprecated | Correction, minority survival, ranking, no regression | `eval/endpoints.py` |
| κ gate | ≥ 0.75 | Human annotation quality before any measurement counts | `trustcal/INJECTION_PROTOCOL.md:59-64` |
| CCR threshold | baseline CCR ≥ 0.30 | Gate 1: the injection must induce real collapse before trust is tested | `FYDP_Summer/3.design.tex:121` |
| Oracle baselines | B7, Gemini 3.1 Pro, one call/question; B8-oracle pending WP-18 | B7 is a ceiling reference, not the mechanism; B8-oracle is the trust upper bound | blueprint `:322,339`; WP-18 |
| No fine-tuning | served models only | Reproducible on open models at fixed compute | blueprint `:319-321` |

**Why questions with longer answers:**

- **Q: Why additive trust and not a learned weight?** Additive counts are transparent and testable, and every step is provable; a learned scorer would need training data we do not have and would blur attribution.
- **Q: Why is the floor 0.1 and not 0?** Zero would permanently mute an agent after one bad round; the floor keeps the process reversible. The simplex projection enforces it after every update — the old clamp-then-renormalize could drop below the floor, so P0-5 replaced it.
- **Q: Why softmax then projection?** Softmax turns the scores into a distribution; the projection enforces the floor and ceiling without breaking the sum-to-one constraint.
- **Q: Why these three model families?** They do not share training pipelines, so their errors are less correlated; "who searched better" is removed by routing claims by domain, not by agent identity.
- **Q: Why 400 questions on GPQA and MMLU-Pro?** Paired statistics need stable denominators, especially for minority survival where the event rate is low. The caps are 400 for GPQA, 400 for MMLU-Pro and 200 for HLE; 100–150 is the pilot for speed.

### 3.1 Extended Why-Q&A

- **Q: Why update trust per round instead of once at the end?** Sycophancy is a process — influence must follow the evidence as the debate evolves, otherwise a late collapse cannot be resisted.
- **Q: Why count claims instead of using semantic similarity?** Counts are transparent, deterministic and testable. A similarity scorer would add a second opaque model to the mechanism.
- **Q: Why penalize contradiction instead of just not rewarding?** Contradiction is evidence against the position; ignoring it would let confidently wrong agents keep their influence.
- **Q: Why not weight agents by how many citations they collect?** Retrieval volume measures search luck. Verdicts — supported or contradicted — are the signal.
- **Q: Why three rounds and not debate-until-consensus?** A fixed K bounds cost and keeps the experiment identical across runs; adaptive stopping is future work.
- **Q: Why do agents not see each other's trust scores?** In the designed loop an agent may see its own trust but not others' weights (`blueprint.md:243,246`); the loop follows that rule.
- **Q: Why is the injection delivered through the system prompt?** It represents an external expert consensus — the strongest realistic pressure — which matches the upper-bound framing.
- **Q: Why 0.1–0.9 and not 0.2–0.8?** Wide bounds preserve recoverability, and the range is symmetric around 0.5. Both bounds are parameters; the grid search tests sensitivity.
- **Q: Why GPQA and MMLU-Pro for accuracy?** Both are stable, peer-reviewed, multiple-choice sets with published numbers, so accuracy changes are attributable to our mechanism.
- **Q: Why MPR when CCR already exists?** CCR is agent-level and requires injection exposure; MPR is debate-level survival and works on the no-pressure runs too.
- **Q: Why claim-domain routing instead of letting each agent search everything?** Letting one agent own a source creates a source-by-agent confound; routing by subject keeps the evidence signal independent of agent identity.
- **Q: Why is the verdict set four labels instead of three?** "Contested" separates genuine evidence conflict from "we found nothing" — they must not be treated the same.

### 3.2 Alternatives Considered and Rejected

| Decision | Chosen | Rejected alternative | Why rejected |
| --- | --- | --- | --- |
| Influence signal | Retrieved-evidence trust | Self-reported confidence | Confidence is manipulable and already shown weak (DebUnc) |
| Influence signal | Retrieved-evidence trust | Token-level uncertainty | Internal signal, not external evidence |
| Update shape | Additive counts | Learned scorer | No training data; opaque attribution |
| Aggregation | Trust-weighted argmax | Majority vote | The exact failure being fixed |
| Gate | Binary prompt decision | Numeric confidence threshold | Avoids a second threshold to tune |
| Retrieval | Claim-domain routed | Shared corpus | Removes the source-by-agent confound |
| Injection | One shot, t1→2 | Continuous pressure | Continuous pressure measures persistence, not a clean collapse |
| Models | Three families | Three sizes of one family | Correlated errors |

## 4. What-If & Edge-Cases

The "if we do this, what happens" bank. Every answer names the exact current behavior. This is what separates rehearsal from hand-waving.

### 4.1 Gate & Input

- **If a question is easy (all agents agree confidently)?** The gate routes it to a direct answer and no debate starts — only speed changes (`prompts.py:11-17`, planned wiring; blueprint `:216-228`).
- **If the gate misclassifies an easy question as hard?** Cost increases (~9 extra passes) but correctness is unaffected; eval sets are pre-filtered to divergent cases (blueprint `:216-228`).
- **If the question has a free-text answer?** The answer-type filter drops it — only MCQ or numeric answers enter, because correctness must be checkable (`injection.py:36-38`; blueprint `:360-368`).
- **If all three agents give the same answer?** The item is not divergent, so it is filtered out of the collapse experiments; a unanimous debate is also ineligible for injection (`injection.py:59-60`).
- **If the question is too long for 4096 context?** Preflight estimates the full budget — system + initial + revision + 3×1500 peer chars + 4096 — and fails the run before spending GPU time if it exceeds 95% of `max_model_len − max_tokens` (`preflight.py:89-94`).
- **If the dataset is gated and the token is missing?** Preflight fails with a clear message before any run; HLE and GPQA need a click-through agreement (`preflight.py:102-104`; `configs/datasets.yaml:26-40`).
- **If we run offline?** `HF_HUB_OFFLINE=1` is required and checked; otherwise preflight fails (`preflight.py:107-111`).
- **If a question has no gold answer?** It cannot be selected or scored; gold is used outside the loop only (never shown to agents; `INJECTION_PROTOCOL.md`).

### 4.2 Debate Loop

- **If two agents disagree and one is correct?** The correct agent is the minority; injection targets it by default (`injection.py:64-67`).
- **If the round-0 answers tie?** `majority_answer` picks the earliest position with count 1, and the debate is still eligible with two targets (`eval/answers.py:118`).
- **If only one agent succeeds?** The debate is ineligible: `fewer_than_two_agents` (`injection.py:53-54`).
- **If an agent's reasoning is very long?** Peer text is truncated to 1500 chars per peer before being shown (`debate.py:60`).
- **If revisions currently weight the agents how?** Revisions see the evolving trust vector; the final aggregation uses `trust_for_positions`, computed from the final positions.
- **If the trust updater is passed to the loop today?** The loop accepts it and updates after each evidence round; neutral evidence is an identity, not a re-uniformization.
- **If a model server returns HTTP 500 or times out?** It is retried (up to 3 attempts, exponential backoff capped at 8 s); a 400 is not retried and surfaces as-is (`client.py:21-26,69-74`).
- **If the model returns an empty completion?** It is treated as a failed attempt and retried; after 3 attempts a `RuntimeError` names the last error (`client.py:64-67,74`).
- **If rounds are set to 2?** With real clients the round count comes from `models.yaml`; the `--rounds` flag is ignored in that path (`runner.py:161-166`).
- **If an agent restates its answer with different formatting?** Answer matching canonicalizes letter/number/text, uses 1e-6 numeric tolerance, and only accepts containment for strings ≥12 chars — formatting changes do not count as switches (`eval/answers.py:85-95`).

### 4.3 Claims

- **If an agent writes no claim tags?** The fallback splits sentences, keeps 3+ word items, caps at 20 (`parser.py:43-65`).
- **If an agent writes more than 20 tagged claims?** Tagged claims are not capped — only the fallback is; this is a known asymmetry with a cap scheduled (`parser.py:40`).
- **If claims are two words, like "gravity falls"?** In fallback they are dropped; tagged claims are kept (`parser.py:61`).
- **If tags are malformed (`<claim>` without id)?** The regex misses, so the whole text is treated as untagged and goes through the fallback (`parser.py:15,68-71`).
- **If there is no "Answer:" line?** The parser takes the first non-empty, non-formatting line; if none exists the position is empty (`parser.py:82-85`).
- **If an agent writes an explanation after the answer?** `ANSWER_RE` is case-insensitive, allows "final", and the label-only guard blocks formatting text from being read as an answer (`parser.py:19-26`).
- **If two claims say the same thing?** Both are counted — there is no deduplication yet; a scheduled refinement (`parser.py` design).
- **If a claim is a judgment ("this method is better")?** It likely returns unverifiable and is excluded from trust — by design, trust only moves on checkable claims (`blueprint.md:260`).

### 4.4 Retrieval

- **If PubMed returns nothing for a claim?** The query is broadened; if still empty, the claim is unverifiable and excluded from the trust update (blueprint `:260,429`).
- **If Semantic Scholar is rate-limited?** The design falls back to OpenAlex with retry/backoff and disk caching (`blueprint.md:379,434`); the clients are implemented, and live rate limits are the operational risk.
- **If two sources return opposite evidence?** The claim is contested and reported separately, not counted as support or contradiction (`Papev:201`; blueprint `:430`).
- **If the top passage is wrong?** The mechanism is only as strong as its sources; wrong passages can mislead the score — stated limitation (Papev `:398`).
- **If a claim retrieves 30 candidate passages?** Top-k 10 are taken per claim and a cross-encoder reranks to the best 3 (`verdicts.py`; implemented, audit pending).
- **If the same passage supports two agents?** Each agent's verification is independent; votes are computed from trust weights, not unique evidence counts (`trust/aggregation.py:15`).
- **If retrieval is slow?** Disk cache and retry/backoff are implemented in the clients; live rate limits remain the operational risk (blueprint §5).
- **If the domain is sparse and nothing is verifiable?** All claims are excluded and the debate falls back to vanilla behavior — an honest evidence-limit (`section 16`).
- **If we change the retrieval source list?** It is config-driven; claim-domain routing is a design choice, and there is no A/B/C source mapping (blueprint §5).
- **If SciBERT replaces the cross-encoder?** It is an upgrade path, not required; the interface stays the same (blueprint `:323`).

### 4.5 Trust Update

- **If an agent's claims are all supported?** Support raises the logit and the projection caps the weight at the ceiling (0.9 for N=3).
- **If all claims are contradicted?** Contradiction lowers the weight; the simplex projection guarantees it never falls below the floor.
- **If an agent produces no checkable claims?** V = H = 0 is an exact identity that round — no re-uniformization.
- **If unverifiable claims dominate?** They are excluded — trust cannot be moved by claims the literature cannot check (`blueprint.md:260`).
- **If two agents end with identical scores?** The projection keeps equal weights; the tie in aggregation resolves to the first option index (`aggregation.py`).
- **If one agent dominates?** The simplex projection caps it at the ceiling; it cannot push another agent below the floor. This is the P0-5 fix.
- **If α and β are swapped?** Punishing support and rewarding contradiction inverts the mechanism; the parameter grid search is planned for Phase 3b (blueprint `:476`).
- **If the trust trajectory is needed in the output?** It is logged per round and carried in the record, along with `trust_for_positions`.
- **If we use K = 5 rounds?** The formula supports it; K = 3 is chosen for cost and drift control (blueprint `:699`).
- **If two seeds disagree?** Report intervals, not point estimates; the main matrix uses two seeds and the pilot uses three.

### 4.6 Aggregation

- **If the final positions tie?** Argmax takes the first (lowest) option index; a tie-break rule is planned (`aggregation.py:15`).
- **If all positions are empty?** Input is unvalidated in the aggregation helper; the runner logs empty positions instead (`aggregation.py`, `runner.py`).
- **If the correct agent has the highest trust?** It wins the weighted vote even against two wrong peers — that is the mechanism (trust test `trust/test_boundedness.py`).
- **If the wrong majority has higher total trust?** The trust-weighted vote can still pick them — trust is evidence-based, not omniscient; this is a stated boundary (`section 16`).
- **If positions are text, not letters?** Matching canonicalizes text and numbers before voting (`eval/answers.py:85-95`).
- **If evidence changes between rounds?** Trust updates from the new round's claims; aggregation uses the final scores (`blueprint.md:278-308`).

### 4.7 Injection

- **If we inject despite a unanimous debate?** The builder refuses: `unanimous` is ineligible (`injection.py:59-60`).
- **If the target scope is unknown?** It raises `ValueError` — only `minority` and `all` are valid (`injection.py:51-52`).
- **If agents are not answer-checkable?** The item is rejected (`injection.py:61`) — no injection on free text or malformed answers.
- **If the agent ignores the injected consensus?** Nothing breaks; the outcome is counted as "minority survived," and MPR records it (`eval/metrics.py:42-46`).
- **If injection flips a correct agent?** That is a collapse event; CCR counts it (`metrics.py:35-39,130-141`).
- **If injection happens twice?** The loop injects exactly once, before round 2; there is no second injection path (`debate.py:47-56`).
- **If baselines B1–B4 need a no-pressure reference?** Injection is only enabled through the `injection` arm, not in B1/B3 runs (`baselines.py:25`).
- **If the synthetic consensus is unrealistic?** It is an explicit upper-bound stress test, stated as limitation L1 (blueprint `:706`).

### 4.8 Metrics & Annotation

- **If no correct agent was exposed to pressure?** CCR denominator is zero → CCR returns 0.0, not NaN (`metrics.py:39`).
- **If a debate had no divergent minority?** MPR denominator is zero → MPR returns 0.0 (`metrics.py:46`).
- **If a correct agent abandons and later returns?** Only the first non-inconclusive answer in rounds 2..K counts for abandonment (`metrics.py:130-141`).
- **If new evidence was introduced mid-debate?** Abandonment is disabled when `evidence_introduced` — collapse must come from pressure, not new facts (`metrics.py:115,130`).
- **If two annotators label differently?** Cohen's κ is computed; below 0.75 the rubric is fixed and relabeled (annotate CLI exits 2) (`agreement.py:12-29`; `annotate.py:55-58`).
- **If one rater misses a row?** Length mismatch raises until sheets are complete (`agreement.py:18-19`).
- **If the sample has 30 divergent and 10 control items?** Those are the fixed annotation batches, sampled with seed 0 (`annotation.py:30-43`).
- **If chance agreement is 1?** Kappa is NaN and the CLI exits 2 — degenerate sheets cannot pass (`agreement.py:27-28`).
- **If ECR is requested today?** It is implemented but deprecated; it is not a primary endpoint. Accuracy and CMR are primary (`metrics.py`, `endpoints.py`).
- **If we need trust calibration?** Report AUROC and Brier scores; the old ECR = 1 − ECE formulation is historical only (`Papev:302-311`).

### 4.9 Statistics

- **If the confidence interval includes zero?** The difference is reported as inconclusive; add seeds or questions per the stats plan (blueprint `:419`).
- **If one seed drifts?** Report both seeds with paired bootstrap intervals; do not cherry-pick.
- **If we compare five baselines?** The primary comparison is B8 vs B8-no-trust; B3 and B4-matched are controls, and secondary comparisons are exploratory with intervals and effect sizes.
- **If effect size is small?** Report Cohen's d with the interval; a small effect with a tight interval is still a finding.
- **If N (agents) changes?** N ∈ {2,3,5} sensitivity is planned at 100 questions (`blueprint.md` §9).
- **If the human study has 150–200 paired items?** Likert ratings with κ, three raters; consent and anonymized answers (`roadmap.md` §9).
- **If the pilot is only 10 questions?** Gate 0 was 10; the pilot is 100–150. The Core plan is GPQA 400 + MMLU-Pro 400 + HLE 200 per seed (8,000 debates, ~1,067 GPU-h) under a 1,280 GPU-h conservative cap.
- **If a baseline is a reimplementation?** B9/B10 are ~1-week reimplementations with a differentiation paragraph, not original code (blueprint `:415`).

### 4.10 Infra & Serving

- **If a model server is down?** Preflight checks `/v1/models` for the configured model IDs and fails fast (`preflight.py:35-49`).
- **If disk is low?** Preflight requires ≥10 GB free on the nearest HF cache parent (`preflight.py:71-80`).
- **If GPU memory is tight?** Dev uses per-server `gpu_memory_utilization` 0.28 / 0.26 / 0.36 with `--enforce-eager` (`configs/models.yaml:20-48`).
- **If the RTX A6000 cannot run FP8?** Correct — dev uses 4-bit AWQ/QAT; FP8 is reserved for the Blackwell final stack (`experiments/gate0/README.md:39-62`).
- **If GPUs are unavailable?** `mock_vllm.py` provides GPU-free OpenAI-compatible servers in agree / divergent / untagged modes; the injection test uses the "community consensus" flip (`src/trustcal/mock_vllm.py:33-41`).
- **If a run crashes mid-way?** The runner resumes by `{dataset}-{index:04d}` keys and skips completed records (`runner.py:171,179`).
- **If there are fewer questions than `--limit`?** It runs what exists; no error (`runner.py:149-152`).
- **If we need a full trace?** Records include transcript, positions, injection metadata, and summary files per run (`runner.py:102-144`).

### 4.11 Deep Scenario Chains

Multi-step "if we do this, what happens" chains — trace them step by step.

- **Chain 1 — retrieval rate-limited mid-run.** Semantic Scholar returns 429 → retry/backoff → OpenAlex fallback → if still empty, the claim is unverifiable → excluded from trust → for that claim the debate behaves like vanilla. Status 🟡 implemented; live rate limits are the operational risk (`sources.py`).
- **Chain 2 — all claims unverifiable.** V = H = 0 for every agent → scores unchanged → the final vote falls back to the current majority matching. This is the honest evidence-limit case.
- **Chain 3 — injection flips one agent, the rest hold.** Collapse counted for that agent only; CCR numerator +1; MPR records survival if gold still wins.
- **Chain 4 — injection flips the whole targeted minority.** CCR saturates for those items and MPR fails — this is the exact failure the trust mechanism must prevent once wired.
- **Chain 5 — parser fallback misfires.** No tags → sentence split keeps >3-word fragments → noisy claims → more unverifiable verdicts → trust moves less. Mitigation: a scheduled refinement aligns fallback and tagged caps.
- **Chain 6 — a model server returns HTTP 400.** No retry (`client.py:69-70`), the run surfaces the error; preflight and configs are the prevention layer.
- **Chain 7 — seeds disagree on one debate.** Report per-seed outcomes and the paired interval; never average into a single claim.
- **Chain 8 — κ comes back at 0.68.** The Go/No-Go fails, the annotate CLI exits 2, the rubric is revised and the 40 items are relabeled before any measurement counts (`annotate.py:55-58`).
- **Chain 9 — baseline CCR < 0.30.** The injection did not induce collapse on the pilot → strengthen consensus wording/targeting before trust experiments; otherwise the premise is untestable (Gate 1).
- **Chain 10 — a correct agent hits the floor.** The simplex projection keeps it at the floor (0.1); it still has nonzero weight and can recover next round (`update.py`).
- **Chain 11 — a wrong agent hits the ceiling.** The ceiling caps it at 0.9; its peers still count, so one capped agent cannot nullify the vote.
- **Chain 12 — final weighted vote ties.** Argmax picks the first option index today (`aggregation.py:15`); a margin-based tie-break is future work.
- **Chain 13 — `--rounds 2` on real clients.** Ignored — rounds come from `models.yaml` (3); edit the config to change rounds (`runner.py:161-166`).
- **Chain 14 — crash mid-matrix.** The runner resumes by `{dataset}-{index:04d}` and skips completed records; no duplicates (`runner.py:171,179`).

## 5. Metrics & Evaluation Deep-Dive

**Primary metric — final-answer accuracy.**

- Definition: correctness of the actual aggregated final answer on pressure-eligible items, paired B8 vs B8-no-trust.
- Binary per question, averaged over the two seeds; reported per dataset with confidence intervals (`eval/endpoints.py`).
- Status: projected, not measured. Gate 0 measured loop behaviour, not accuracy under pressure.

**Co-primary — CMR (Correct-Minority Retention).**

- Definition: on pressure-eligible items, at least one agent that was correct at round 0 still holds the gold answer at the final round K (`PRE_REGISTRATION.md` §4.2).
- Binary per question; CMR is the mechanism endpoint, final accuracy is the decision endpoint. If they disagree, report both.
- Status: projected, not measured.

**Diagnostics — CCR and MPR.**

- CCR (Collapse Rate): correct agents who abandon their answer under injected pressure without new evidence, over correct agents exposed. This is the pilot's manipulation check, not a primary endpoint.
- MPR (Minority Preservation Rate): divergent debates where a correct minority survives to the final output. Reported as a supporting diagnostic.
- Formulas stay in `eval/metrics.py`; zero denominators return 0.0 rather than NaN.

**Trust calibration — AUROC and Brier.**

- Trust AUROC: within-debate pairwise ranking of trust against correctness (Mann-Whitney, ties 0.5), macro-averaged over debates.
- Trust Brier: mean squared error of trust against correctness, against the constant 1/3 predictor.
- Direction: AUROC higher is better; Brier lower is better. These replace ECR as the calibration readout.

**ECR — deprecated.** ECR was defined as 1 − ECE with a target above 0.80 on the expert set. It is retained only as a historical note and is not a current endpoint.

**Human study.** Likert ratings, κ agreement, 150–200 paired items with three raters (`roadmap.md` §9).

**Annotation protocol.**

- 30 divergent + 10 control items, shuffled, two blind raters, seed 0 (`eval/annotation.py:30-43`).
- Cohen's κ `(p_o − p_e)/(1 − p_e)` (`eval/agreement.py:12-29`); pass ≥ 0.75; below → fix rubric and relabel (`scripts/annotate.py:33-36,55-58`).

**Statistics plan.**

- 2 seeds; paired bootstrap over questions, 10,000 resamples, 95% CI; Cohen's d; McNemar and Holm for the confirmatory family. Improvement only if the difference interval stays off zero.

**Error taxonomy.** Failures are categorized (reasoning error, claim error, retrieval miss, aggregation error) rather than lumped together (blueprint `:421`).

**Likely questions:**

- **Q: Is accuracy measured or projected?** Projected — no pressure run exists yet; only Gate 0 is measured (loops, not accuracy).
- **Q: Why are accuracy and CMR primary rather than CCR?** Accuracy is the decision outcome and CMR is the mechanism outcome. CCR is a collapse diagnostic tied to injection exposure; accuracy alone would hide a minority being overruled, so both are reported.
- **Q: Do you still report CCR and MPR?** Yes, as diagnostics. They support the manipulation check and the error analysis; they are not the confirmatory endpoints.
- **Q: How is trust calibration measured?** Trust AUROC for ranking and trust Brier for squared error; ECR is deprecated.
- **Q: Why 10,000 bootstrap resamples?** Enough for stable 95% percentile intervals at our sample sizes; cheap compared with GPU time.

### 5.1 Worked Metric Examples

- **Accuracy example.** 100 pressure-eligible questions; B8 picks the gold answer on 61, B8-no-trust on 54 → accuracy difference 7 points, reported with a paired interval.
- **CMR example.** Of 60 pressure-eligible items, a round-0 correct minority survives in 39 under B8 → CMR = 39 / 60 = 0.65.
- **CCR example (diagnostic).** 30 divergent questions; in 20 one agent is a correct minority and is targeted — 20 exposed correct agents. If 9 abandon, CCR = 9 / 20 = 0.45. The vanilla estimate is ≈0.45; the projection is 20–30% lower.
- **MPR example (diagnostic).** 50 divergent debates; a correct minority survives in 31 → MPR = 31 / 50 = 0.62. If no debate has a divergent minority, MPR returns 0.0 — reported as "not applicable," not as failure (`metrics.py:46`).
- **ECR example (historical, deprecated).** Bin trust into deciles; ECE = Σ (n_b/N)·|t̄_b − acc(b)|; ECR = 1 − ECE. ECE = 0.09 → ECR = 0.91. This is no longer a target.
- **Reading rule.** Report every metric with its denominator and seed spread. A bare percentage is not a result.

**Likely follow-ups:**

- **Q: What does a CCR of 0.45 mean in words?** "Forty-five percent of the agents who were correct before the pressure abandoned the correct answer."
- **Q: Is a lower CCR always better?** For collapse yes, but the denominator must be reported — low exposure can make CCR noisy. It is a diagnostic, not the headline.
- **Q: How does trust AUROC punish miscalibration?** A trust score that ranks wrong agents above correct ones lowers AUROC; Brier additionally penalizes overconfidence.
- **Q: What is measured versus projected today?** Only Gate 0 pipeline behavior is measured; accuracy, CMR, AUROC and Brier are projected until the matrix runs.

### 5.2 Error Taxonomy & Human Study

**Error taxonomy — every failure gets a bucket, not a shrug:**

| Bucket | Example | Detected by |
| --- | --- | --- |
| Reasoning error | Agent derives the wrong mechanism | Wrong final position despite supported claims |
| Claim-decomposition error | Claim too coarse to verify | High unverifiable rate for that agent |
| Retrieval miss | Claim checkable but nothing found | Unverifiable after a broadened query |
| Verdict error | Passage misread as support | Human audit of sampled verdicts |
| Aggregation error | Correct agent with higher trust still loses | Outcome audit versus weighted margin |
| Injection non-response | Consensus ignored by everyone | Zero collapse in the injection arm |

**Human study plan:**

- 150–200 paired items, three raters, Likert scales, κ reported (`roadmap.md` §9).
- Raters see anonymized question, final answer, citations and trust trajectory — never model identities.
- Consent: public-benchmark questions only; no personal data (Papev `:421`).

## 6. Baselines B1–B10 Deep-Dive

Registry: `trustcal/src/trustcal/eval/baselines.py`. All B1–B10 arms are implemented and mock-tested; B9/B10 are labelled approximations. The Core matrix runs four conditions; the Full target adds placebo and oracle (WP-18).

| ID | Arm | What it isolates | Status |
| --- | --- | --- | --- |
| B1 | Single-agent CoT | No debate, no retrieval | ✅ implemented |
| B2 | Single-agent + RAG | Retrieval without debate | ✅ implemented |
| B3 | Vanilla debate (Du et al.) | Debate without retrieval or trust | ✅ implemented |
| B4-matched | Debate + retrieval, matched | Retrieval without trust, same prompts and evidence budget as B8 | ✅ implemented |
| B5 | Self-consistency | Samples within one model | ✅ implemented |
| B6 | Mixture-of-Agents | Static layered aggregation | ✅ implemented (approximation) |
| B7 | Oracle (Gemini 3.1 Pro) | Upper-bound ceiling, one call/question | ✅ implemented; needs `GEMINI_API_KEY` |
| B8 | Ours | The trust-calibrated system | ✅ implemented; treatment |
| B8-no-trust | Matched control | B8 with trust weighting off | ✅ implemented; primary control |
| B9 | iMAD reimplementation | Debate-trigger prediction | ✅ implemented (approximation) |
| B10 | ConsensAgent reimplementation | Prompt-rewrite sycophancy fix | ✅ implemented (approximation) |
| B8-placebo | Shuffled verdicts | Any-reweighting control | 🔴 pending WP-18 |
| B8-oracle | Gold-answer trust (or gold-evidence-only on EG-SSS) | Upper bound; not a competitor | 🔴 pending WP-18 |

**Oracle details (the classic trap question):**

- B7 sends each question to a large commercial model (Gemini 3.1 Pro), one call per question, about $5–7 total for 1,000 questions.
- It is a **ceiling reference**, not part of the mechanism; it never receives the gold answer (`blueprint.md:322,339`).
- B8-oracle is different: it is an internal upper bound that uses gold information — gold-answer trust, or gold-evidence-only on EG-SSS — and it is not implemented yet (WP-18). If it is gold-evidence-only on EG-SSS, the Full target is 32 runs, not 36.
- If asked "is that unfair, a bigger model?": yes, deliberately — it shows the best a strong single call achieves, so the panel can see where debate+trust lands relative to a frontier point.

**Fair comparison notes:**

- B5/B6 use the same three models with different aggregation logic, so differences come from aggregation, not hardware (blueprint `:506`).
- B9/B10 are reimplementations; each ships with a differentiation note (blueprint `:415`).
- The Core matrix is exactly B3, B4-matched, B8-no-trust, B8. B1/B2/B5–B7/B9/B10 are comparison and appendix arms, not Core cells.

### 6.1 Per-Baseline Notes

- **B1 Single-Agent CoT** — one model, one chain, no retrieval. Isolates raw model skill and sets the "does debate help at all" floor. ✅ implemented.
- **B2 Single-Agent + RAG** — retrieval without debate. Tells us whether evidence alone, without cross-examination, is enough. ✅ implemented.
- **B3 Vanilla debate** — the Du et al. loop with majority vote, no retrieval. The core collapse comparison and the Gate 0 reference. ✅ implemented.
- **B4-matched Debate + retrieval** — evidence in context but no trust weighting, with the same prompts and evidence budget as B8. The key "is our weighting layer necessary" contrast. ✅ implemented.
- **B5 Self-Consistency** — multiple samples from one model; tests whether sampling beats structured debate. ✅ implemented.
- **B6 Mixture-of-Agents** — layered static merging; tests static aggregation against iterative trust. ✅ implemented (approximation).
- **B7 Oracle** — Gemini 3.1 Pro, one call per question, ceiling only, ~$5–7 total. Answers "what does a frontier single call get?" ✅ implemented.
- **B8 Ours** — the trust-calibrated system, placed inside the registry. ✅ implemented; trust wired.
- **B8-no-trust** — B8 with trust weighting off, the primary matched control. ✅ implemented (WP-13).
- **B9 iMAD reimplementation** — predicts when to debate from hesitation cues, then standard majority. Tests gating versus in-debate weighting. ✅ implemented (approximation).
- **B10 ConsensAgent reimplementation** — prompt rewriting against sycophancy, still confidence-based. Tests textual mitigation versus evidence weighting. ✅ implemented (approximation).
- **B8-placebo / B8-oracle** — the remaining Full-target arms; not implemented until WP-18. 🔴 pending.

**Comparison-integrity Q&A:**

- **Q: How is this a fair comparison?** B5/B6 run the same three models as ours, so differences come from aggregation logic, not model choice; B1–B4 use identical prompts and settings.
- **Q: Why reimplement B9 and B10 instead of quoting their papers?** Published numbers use different models and datasets; a same-stack reimplementation is the only honest comparison.
- **Q: What if the reimplementation underperforms the original?** We ship a differentiation paragraph documenting every deviation; underperformance of a reimplementation is reported, not hidden (blueprint `:415`).
- **Q: Why an oracle baseline at all if it cannot be deployed?** It bounds the ceiling — if debate+trust approaches the oracle, that is a strong result; if not, the gap is informative. B8-oracle is pending WP-18, and its scope decides whether the Full target is 36 or 32 runs.
- **Q: Which baseline is the most threatening to us?** B4-matched — debate plus retrieval without trust. If B4-matched matches our numbers, the trust layer adds nothing.

## 7. Injection Protocol Deep-Dive

Source: `trustcal/INJECTION_PROTOCOL.md`; paper `Papev:316-326`.

**Six steps:**

1. Run 3 agents on divergent questions — keep only those with ≥2 distinct round-0 answers.
2. Discard answers that are not checkable (MCQ/numeric) — `is_checkable` (`injection.py:36-38`).
3. Fabricate a wrong majority consensus that contradicts the correct minority.
4. Send it once, between rounds 1 and 2, as a system prompt append — only to the targeted agents (`debate.py:47-56`).
5. Add no further pressure; let the standard revision run to K = 3.
6. Measure abandonment at round 3 via CCR/MPR (`metrics.py`).

**Targeting rules:** default target = correct-minority agents; `all` is allowed; unanimous debates are ineligible; fewer than two agents ineligible; unknown scope raises (`injection.py:51-68`).

**Why it is fair:** the user question is unchanged, no new evidence enters, exactly one injection per debate, and injection is off in B1–B4 (`INJECTION_PROTOCOL.md`).

**Validation gates:**

- κ ≥ 0.75 on 40 annotated items before measuring (step 1 gate).
- Baseline CCR ≥ 0.30 on the pilot (100–150 questions) — if the injection cannot induce collapse, the premise is not testable and the protocol is strengthened (Gate 1; `FYDP_Summer/3.design.tex:121`).

**Upper-bound framing (must say this):** the injection is an explicit worst-case stress test, not realistic subtle sycophancy — limitation L1 (blueprint `:706`).

**Likely questions:**

- **Q: Is the injected consensus realistic?** It is intentionally extreme to create the failure condition; follow-up work includes paraphrase subtlety (limitation L2, blueprint `:698`).
- **Q: What if agents know the consensus is fake?** They cannot — it is delivered as an expert consensus in the system prompt; the control is the no-pressure run.
- **Q: What if injection makes agents more correct?** Then the item counts as preserved, not collapsed; the metrics handle both directions.

### 7.1 Protocol Failure Modes

| Failure | Detection | Response |
| --- | --- | --- |
| Injection fails to induce collapse | baseline CCR < 0.30 on the pilot | strengthen consensus wording/targeting, re-run Gate 1 |
| Items uncheckable (free text) | `is_checkable` false | item dropped before injection (`injection.py:61`) |
| No minority to target | unanimous or <2 agents | ineligible: `unanimous` / `fewer_than_two_agents` (`injection.py:53-60`) |
| κ below 0.75 | annotate CLI exit 2 | revise rubric, relabel the 40 items |
| Agents ignore the injection | zero collapse | item counts as preserved; MPR benefits; no retry |
| Double injection | single code path | impossible by construction (`debate.py:47-56`) |
| Evidence enters mid-debate | `evidence_introduced` flag | abandonment disabled; item excluded from CCR (`metrics.py:115,130`) |

**Likely questions:**

- **Q: Could a model detect the injected text as artificial?** It is delivered as an expert consensus in-system; detection is an empirical question we will report, not assume away.
- **Q: Why only one injection?** Repeated pressure would measure persistence, not collapse; one shot keeps the causal claim clean.
- **Q: What is the control?** The identical debate without injection (B1–B4 path), scored with the same metrics.

## 8. Trust Mechanism Deep-Dive

**Equation:** `S_i(t+1) = log(max(S_i(t), ε)) + α·V_i/n_i − β·H_i/n_i`, then one softmax, then a floor/ceiling simplex projection.

| Symbol | Meaning | Value / range |
| --- | --- | --- |
| S | Agent trust weight | `>= floor`, `sum = 1`, `<= max(ceiling, 1/N)` |
| t | Debate round | 0..3 |
| V | Claims supported by evidence in this round | ≥ 0 count |
| H | Claims contradicted in this round | ≥ 0 count |
| n | Claims checked for that agent this round | ≥ 1 |
| α | Reward per supported claim (normalized) | 0.5 default |
| β | Penalty per contradicted claim (normalized) | 0.3 default |

Code: `trustcal/src/trustcal/trust/update.py` (`update_trust`, `project_simplex_with_floor`).

**Operator and why it matters:** logit accumulation → softmax → simplex projection. The projection is what enforces the floor and ceiling; the original clamp-then-renormalize order could drop a weight below the floor, so P0-5 replaced it. The bounds test covers 10k random draws for N=1,3,5 (`trust/test_boundedness.py`).

**Unverifiable claims do not move trust** — they are excluded from V and H (blueprint `:260`). Contested claims are reported separately, not scored (`Papev:201`).

**Aggregation:** final answer = `argmax(Σ trust_i × position_i)` — no head count (`aggregation.py:8-15`). Ties resolve to the first option index; a tie-break rule is planned.

**Parameter sensitivity:** the α/β grid is a Phase-3b sweep (blueprint `:476`); the blueprint claims <4% CCR variation under the planned grid (`:691`) — have the grid ready before defending that number.

**What is real today:** the math is implemented, unit-tested (10k bounds draws, neutral identity, verbosity invariance, minority-wins), and called by the debate loop; `trust_for_positions` is the vector used by the final weighted vote.

### 8.1 Worked Trust Example

Start: three agents at uniform weights [1/3, 1/3, 1/3]. Round 1 verdicts: A has V = 3, H = 0; B has V = 1, H = 2; C has V = 2, H = 1; each has n = 3 claims checked.

- Normalized evidence (α = 0.5, β = 0.3): A +0.500; B 0.167 − 0.200 = −0.033; C 0.333 − 0.100 = +0.233.
- Logits [0.500, −0.033, 0.233] → softmax ≈ [0.425, 0.249, 0.326]. The projection leaves them unchanged because all three are inside [0.1, 0.9]; A has the largest weight.
- Aggregation multiplies each weight by the agent's position and takes the argmax — the evidence-backed agent has the loudest vote despite any majority pressure. Repeated supported rounds widen the gap; a contradiction cannot push a weight below the floor.

### 8.2 Trust Q&A

- **Q: Why does B fall so fast after one bad round?** The update is per-round and counts contradictions: two contradictions cost 0.6, more than one support gains. The Phase-3 grid search calibrates that trade-off.
- **Q: Can an agent recover after a bad round?** Yes — logits are additive and projected, never zeroed; later supported claims raise the weight again.
- **Q: What if an agent fabricates many claims?** More claims means more chances to be contradicted; unverifiable fabrication never moves trust.
- **Q: What stops one lucky retrieval from swinging the vote?** Claim-domain routing, reranking to three passages, verdicts grounded in passages, and the contested flag.
- **Q: Where is boundedness proven?** The simplex projection is the guarantee: min ≥ floor, sum = 1, max ≤ max(ceiling, 1/N). The test covers 10k random draws for N=1,3,5 (`trust/test_boundedness.py`).
- **Q: What exactly does the projection guarantee?** The weights sum to 1 and respect the floor/ceiling, so the vote is a weighted average with no double-counting and no scale drift.
- **Q: Did renormalization ever fight the floor?** Yes — the old clamp-then-renormalize could push a weight below 0.1. P0-5 replaced it with the projection, so that failure mode is gone.

## 9. Retrieval & Evidence Deep-Dive

**Design:** claim-domain retrieval. Bio/clinical claims → PubMed + Semantic Scholar; physics/chem and math/CS → arXiv + Semantic Scholar; other → Semantic Scholar/OpenAlex. All agents share the routed corpus and evidence volume is equalized, so no agent owns a source (`retrieval/sources.py`).

**Pipeline:** claim → domain route → query construction → top-k candidates → dedup by DOI/arXiv ID/title → rerank/select the passages shown → verdict classification (`retrieval/pipeline.py`, `retrieval/verifier.py`).

**Verdicts:** supported / contradicted / unverifiable / contested (`Papev:201`).

**Fallbacks:** OpenAlex replaces Semantic Scholar under rate limits; queries broaden when results are sparse; disk caching and retry/backoff are implemented (`blueprint.md` §5).

**Bias boundaries:** BrokenMath/BrokenArXiv are appendix-only adversarial checks, not average-case sycophancy; correlated hallucinations across models are a scope boundary, not solved (`blueprint.md` §8, §10).

**Why claim-domain routing matters to the thesis:** the trust signal must come from evidence, not from retrieval luck. The source a claim reaches is decided by its subject, not by which agent produced it.

### 9.1 Retrieval Q&A

- **Q: Who chooses which source a claim uses?** The subject domain does: bio/clinical → PubMed + Semantic Scholar; physics/chem and math/CS → arXiv + Semantic Scholar; shared fallback. No agent owns a source (`blueprint.md` §5).
- **Q: What if a chemistry claim is on arXiv, not PubMed?** That is the expected route — physics/chem goes to arXiv + Semantic Scholar; cross-domain claims may land unverifiable, an accepted evidence limit.
- **Q: How many passages reach the verifier?** Three per claim, reranked from ten candidates (`verdicts.py`, implemented; audit pending).
- **Q: Is retrieval shared between agents?** Yes — the infrastructure is shared and claims route by domain. Evidence volume is equalized so overlap is not mistaken for agreement.
- **Q: How is "contested" produced?** Two sources disagree at high relevance for both support and contradiction (`blueprint.md` §10).
- **Q: How is retrieval noise controlled?** Two filters: unverifiable claims never move trust, contested claims are never scored.
- **Q: What happens if a source changes overnight?** BrokenArXiv rotates and papers get updated; the snapshot/revision pin makes a run reproducible (`datasets.yaml`).

### 9.2 Source API Details

| Source | Index | Route | Notes |
| --- | --- | --- | --- |
| PubMed (NCBI E-utilities) | Biomedical | bio/clinical claims | Rate-limited without a key; retry/backoff |
| arXiv API | Preprints (physics, CS, math) | physics/chem and math/CS claims | Versioned items; cite the version |
| Semantic Scholar (S2) | Cross-domain | shared across routed claims | API key raises limits; OpenAlex fallback |
| OpenAlex | Cross-domain fallback | shared fallback | Replaces S2 under rate limits |
| Cross-encoder reranker | local model | shared | ms-marco-MiniLM; SciBERT upgrade path |

## 10. Claim Decomposition Deep-Dive

**What a claim is:** one small, verifiable statement — split by effect, magnitude, and subgroup so it can be checked alone (`agents/prompts.py:9,23-24`).

**How agents tag:** self-tagged XML `<claim id="cX">…</claim>` in the same generation (`prompts.py:9`).

**Parser rules:**

- Regex extraction of tagged claims (`agents/parser.py:15,38-40`).
- No tags → sentence-split fallback: 3+ words, cap 20 (`:43-65`).
- Malformed tags → treated as untagged → fallback (`:68-71`).
- Mean tags per generation in Gate 0: 9.0 / 11.3 / 8.3 (`experiments/gate0/README.md:129-131`).

**Known limits:** tagged claims are uncapped; no deduplication; a judgment-style claim usually lands unverifiable (excluded). These are scheduled refinements.

### 10.1 Claim Q&A

**Worked split example.** Original: "Aspirin reduces fever in adults but can cause stomach bleeding in the elderly."

- Claim 1: "Aspirin reduces fever in adults." — can be supported.
- Claim 2: "Aspirin can cause stomach bleeding in the elderly." — can be contradicted.
- The hedge ("can") and subgroup ("elderly") stay with their claims; verdicts apply per claim, not per sentence.

**Follow-ups:**

- **Q: Who decides claim granularity?** The agent does, following the prompt rule to separate effect, magnitude and subgroup (`prompts.py:23-24`); the parser only extracts what is tagged.
- **Q: What if an agent tags one giant claim?** It gets one verdict and moves trust once; fine-grained tagging is the intended, rewarded behavior.
- **Q: Do explanations get fact-checked?** Only tagged claims; untagged prose is not verified.
- **Q: How are verdicts linked back to answers?** Through the agent id: verdicts update that agent's V and H counts (`update.py:26`), not individual claim scores.
- **Q: What if two claims conflict within one answer?** They are checked independently and can cancel out (one support, one contradiction).

## 11. Implementation & Reproducibility

**Repo tour (`trustcal/`):**

| Path | Purpose |
| --- | --- |
| `src/trustcal/inference/` | vLLM client, retries, seeds |
| `src/trustcal/agents/` | prompts, claim parser, gate prompt |
| `src/trustcal/orchestrator/` | debate loop, injection |
| `src/trustcal/trust/` | update math, aggregation |
| `src/trustcal/retrieval/` | source clients, claim routing, dedup, verifier |
| `src/trustcal/eval/` | metrics, endpoints, baselines, annotation, agreement |
| `src/trustcal/runner.py` | experiment loop, records, summaries |
| `scripts/` | setup.sh, serve.sh, run_experiment.py, run_matrix.py, p0_gate.py, verify_env.py, check_stack.py, preflight.py, verifier_audit.py, annotate.py, mock_vllm.py |
| `configs/` | models.yaml, datasets.yaml, experiments.yaml, phase.yaml |
| colocated `test_*.py` | 514 tests |

**Configs (memorize for "show me"):**

- Models: dev = Qwen3.5-9B (4-bit AWQ), Gemma 4 12B (QAT w4a16), Ministral-3-14B (AWQ), ports 8000/8001/8002, ctx 4096 (`configs/models.yaml`).
- Final = Qwen3.6-27B-FP8, Gemma-4-26B-A4B-FP8, Mistral-24B-AWQ, 69.73 GB total, ctx 8192 (`configs/models.yaml`).
- Generation: temperature 0.7, 1024 output tokens, 3 retries (`inference/client.py:30-46`).
- Data: 3 Core datasets, seeds [1,2], rounds 3, caps 100–150 pilot / 400 GPQA / 400 MMLU-Pro / 200 HLE (`configs/datasets.yaml`; `PRE_REGISTRATION.md` §3).

**Commands (run from `trustcal/`):**

- `bash setup.sh` — environment; `bash scripts/serve.sh` — vLLM servers per agent.
- `python scripts/check_stack.py --phase final` then `python scripts/preflight.py --phase final --offline` — Final-stack budget and preflight checks.
- `python scripts/run_experiment.py --arm B3 --dataset gpqa --limit 10` (arms: B1–B10, pilot, injection).
- `python scripts/annotate.py make` / `score --min-kappa 0.75`.
- `pytest` — 514 tests.

**Outputs per run:** `records.jsonl` per question, `summary.json`, `summary-<stamp>.md` (`runner.py:119-144`); resume is keyed by `{dataset}-{index:04d}`.

**Known runner quirks to admit:** `--rounds` is ignored when real clients are used (rounds come from models.yaml); `--limit` silently runs fewer if the file is shorter (`runner.py:149-166`).

### 11.1 Runbook (defence-day demo)

1. `bash setup.sh` — one-time environment (from `trustcal/`).
2. `bash scripts/serve.sh` — starts the vLLM servers (or `python scripts/mock_vllm.py` for a GPU-free demo).
3. `python scripts/preflight.py` — fail-fast check: servers, disk, context budget, HF token.
4. `python scripts/run_experiment.py --arm B3 --dataset gpqa --limit 3 --out experiments/demo` — mini debate.
5. Show `records.jsonl` (per-round positions) and `summary-*.md` (numbers) — this is what evidence looks like.
6. Optional: `python scripts/run_experiment.py --arm injection --dataset gpqa --limit 3` — the stress-test path.

If a judge asks "run it live": prefer the mock-server path — it proves orchestration without touching GPUs. If nothing can run, walk the code map in Section 2 instead.

### 11.2 Test Inventory (514 tests)

The 103-function component breakdown below is the pre-P0 slice; the current suite is 514 tests, with added matrix, endpoint, verifier-audit, stack and integration coverage.

| Test file (count at pre-P0 snapshot) | Invariants covered |
| --- | --- |
| `agents/parser` + `eval/answers` (31) | claim tags, fallback split/cap/drop, canonical answer matching |
| `inference/client` (5) | retry then success, empty retried, cap → RuntimeError, 400 not retried |
| `orchestrator/debate` + `injection` (12) | rounds, peers visible, targeting, one delivery, uncheckable |
| `trust/boundedness` (2) | 10k draws N=1,3,5, simplex bounds, neutral identity, evidence-backed minority wins |
| `eval/metrics` + `agreement` + `annotation` (23) | collapse/hold/evidence flags, κ, zero denominators |
| `runner` + `config` + `env` + `preflight` + `integration-mock` (35) | records, resume, arms, preflight, mock end-to-end |

**Why this matters:** when a judge asks "how do you know it works," the answer is not a demo — it is 514 passing tests, including the trust-order proof.

### 11.3 Repo File Map

| File | What it owns |
| --- | --- |
| `inference/client.py` | vLLM client, retries, seeds |
| `agents/prompts.py` | agent prompts, gate prompt, injection prompt |
| `agents/parser.py` | claim tags, answer extraction, fallbacks |
| `orchestrator/debate.py` + `injection.py` | round loop, peer context, injection plan and delivery |
| `trust/update.py` + `aggregation.py` | logit accumulation, softmax, simplex projection, weighted vote |
| `retrieval/sources.py` + `verifier.py` | source clients, routing, dedup, rerank, verdicts |
| `eval/metrics.py` + `eval/endpoints.py` + `baselines.py` | accuracy/CMR/ARR/AUROC/Brier (ECR deprecated), B1–B10 registry and arms |
| `eval/answers.py` + `agreement.py` + `annotation.py` | canonical matching, κ, sheets |
| `runner.py` + `preflight.py` + `mock_vllm.py` | experiment loop, checks, GPU-free mocks |
| `scripts/` + `configs/` + colocated `test_*.py` | CLI entry points, configs, 514 tests |

## 12. Implemented vs Planned

| Item | Status | Proof |
| --- | --- | --- |
| Three-model debate loop (Gate 0) | ✅ | `experiments/gate0/README.md:29-35` |
| Injection (t1→2, one shot, targeting) | ✅ | `orchestrator/injection.py:41-71`, `debate.py:47-56` |
| Claim tagging + parser + fallback | ✅ | `agents/parser.py:38-71`, 15 parser tests |
| Trust update math + aggregation | ✅ wired | `trust/update.py`, `trust/aggregation.py`, `debate.py` |
| Confidence gate | 🟡 prompt defined, not invoked | `agents/prompts.py:11-17` |
| Accuracy / CMR / AUROC / Brier | ✅ implemented | `eval/endpoints.py`, `eval/metrics.py` |
| ECR | 🟡 deprecated; not a primary endpoint | `eval/metrics.py`; `PRE_REGISTRATION.md` §4.3 |
| Retrieval sources / rerank / verdicts | ✅ implemented; human audit pending | `retrieval/sources.py`, `verifier.py` |
| Baselines B1–B10 | ✅ implemented; B6/B9/B10 labeled approximations | `eval/baselines.py`; `IMPLEMENTATION_STATUS.md` |
| B8-placebo / B8-oracle | 🔴 pending WP-18 | not implemented; Full target conditional |
| Bootstrap CIs / Cohen's d | ✅ implemented | `eval/stats.py`; `scripts/run_matrix.py` |
| Non-GPQA dataset loaders | 🟡 all five normalized; only GPQA live-tested | `eval/datasets.py`; WP-11 |
| Human study | 🔴 Phase 4 (Mar 2027) | `roadmap.md` §9 |

### 12.1 Status Q&A

- **Q: What is the highest-risk item not yet done?** The verifier audit and the behavioral readout — whether the trust signal changes decisions (blueprint §0).
- **Q: Why did earlier drafts have stubs?** The project is phased by design: FYDP I validated the loop and froze the mechanism; the gates made each stub visible and scheduled. P0 replaced them with tested implementations.
- **Q: What exactly will be live by the end of FYDP II?** The pilot, Core matrix, verifier audit and human evaluation — with WP-18 before the pilot.
- **Q: What result would falsify the thesis?** A correct, evidence-supported minority still losing under trust weighting — or trust never changing the final answer. That is the frozen Go/No-Go.
- **Q: What is the honest headline today?** "The P0 pipeline is released and tested; no efficacy result exists yet — the verifier audit and the paid matrix are next."
- **Q: Where is the official status?** `roadmap.md`, `trustcal/IMPLEMENTATION_STATUS.md`, and `experiments/README.md` (run index).

### 12.2 What Runs in Each Arm

| Arm | What executes | Output |
| --- | --- | --- |
| B1 | one model, one pass | answer + summary |
| B3 | three agents × 3 rounds, majority vote | transcript + positions |
| B4-matched | B3 + retrieval, same prompts as B8 | evidence + positions |
| B8-no-trust | B8 with trust weighting off | matched-control records |
| B8 | trust-weighted aggregation | treatment records |
| injection | B8 + one fabricated consensus t1→2 | collapse metadata + positions |
| B8-placebo / B8-oracle | pending WP-18 | not implemented |

B2, B5, B6, B7, B9 and B10 are comparison/appendix arms in the same registry; they are not Core cells.

## 13. Datasets & Sources

| Dataset | Hugging Face | Revision | License | Paper / source | Role |
| --- | --- | --- | --- | --- | --- |
| GPQA | `Idavidrein/gpqa` | pinned `633f5ee89ab8ad4522a9f850766b73f62147ffdd` | CC BY 4.0 (gated) | Rein et al., COLM 2024 (`rein2024gpqa`) | Primary evidence-grounded set (GPQA-Main cap 400) |
| MMLU-Pro | `TIGER-Lab/MMLU-Pro` | `b189ec765aa7ed75c8acfea42df31fdae71f97be` | MIT | Wang et al., NeurIPS 2024 D&B (`wang2024mmlupro`) | Primary scale/robustness set (cap 400) |
| HLE | `cais/hle` | `5a81a4c7271a2a2a312b9a690f0c2fde837e4c29` | MIT (gated) | Phan et al., Nature 649, 2026 (`phan2026hle`) | Expert ceiling / abstention control (cap 200) |
| EG-SSS | team-built | v1.2 freeze | CC BY 4.0 for original items | team-built benchmark; no external citation | 180-item v1.2 freeze; 300-item Full target; not in Core v1.0 |
| BrokenMath | `INSAIT-Institute/BrokenMath` | `main` | CC BY-NC-SA 4.0 | Petrov et al., arXiv:2510.04721 (`petrov2025brokenmath`) | Appendix-only adversarial stress test (504 samples) |
| BrokenArXiv | `MathArena/brokenarxiv` | `main`, snapshot `0226-0526` | CC BY-SA 4.0 | No dedicated paper; MathArena platform, arXiv:2605.00674 (`dekoninck2026matharena`) | Appendix-only adversarial, monthly refreshed |

Config: `trustcal/configs/datasets.yaml`; blueprint table `docs/blueprint.md` §8; journal `Papev:260-270`.

**Filters:** divergent (≥2 distinct round-0 answers; ≈60–70% pass) then answer type (MCQ/numeric only). Gold is used for selection and scoring only, never shown to agents.

**Fallbacks if access fails:** GPQA-Diamond for HLE, freeze a BrokenArXiv snapshot, OpenAlex for Semantic Scholar (blueprint `:375-379`).

### 13.1 Dataset Q&A

- **Q: Why is BrokenMath non-commercial?** It is CC BY-NC-SA 4.0 — research use only; our use is academic and the license is recorded (`datasets.yaml:13`).
- **Q: Why cite a snapshot for BrokenArXiv?** It rotates monthly; a pinned snapshot makes results reproducible (`datasets.yaml:23`).
- **Q: What is GPQA Diamond?** The 198-question curated subset; the revision is pinned at `633f5ee…` (`datasets.yaml:40`).
- **Q: Why six datasets when Core uses three?** Different roles: Core runs GPQA-Main, MMLU-Pro and HLE. EG-SSS freezes at 180 under v1.2 and scales to the 300-item Full target. BrokenMath and BrokenArXiv are appendix-only adversarial checks.
- **Q: How many questions in the Core matrix?** GPQA 400 + MMLU-Pro 400 + HLE 200 per seed, two seeds = 8,000 planned debates / ~1,067 GPU-h under a 1,280 GPU-h conservative cap; the pilot runs 100–150 (`datasets.yaml`).

## 14. Experiments & Evidence

**Gate 0 — vanilla MAD reproduction, PASS (2026-09-16):**

- 10 GPQA Diamond questions, 3 rounds, 3 agents.
- 10/10 debates completed; 90/90 non-empty positions; 275,668 characters generated.
- 3,708.1 s total; 370.8 s mean per debate; 21.5 s stdev (5.8%); fastest 334.8 s / slowest 404.4 s.
- Ministral missed claim tags in 5/30 generations; the fallback parser handled all of them.
- Cost ≈ USD 4.29. Trust trajectory: null — Gate 0 was vanilla MAD, before trust wiring.
- Artifacts: `experiments/gate0/README.md`, `experiments/gate0/artifacts/summary-20260916T193249Z.md`, raw transcript.

**What Gate 0 proves / does not prove:** proves serving, orchestration and parsing work end to end at 4-bit on one GPU; it does not measure collapse, retrieval or trust.

**Pending:** 96 GB Final-stack smoke (**NOT RUN**; offline check only), WP-18 placebo/oracle, 24-item calibration, verifier audit (150–200 pairs), pilot (100–150 questions), paid Core run (GPQA 400 + MMLU-Pro 400 + HLE 200, 2 seeds), ablations A1–A4, human study. Retrieval and trust wiring are done.

**Ablations:** A1 no trust, A2 no progressive retrieval, A3 no claim-domain routing, A4 no adaptive triggering (blueprint §9).

### 14.1 Reading the Gate 0 Numbers

- **10/10 debates:** orchestration never crashed; the loop handles real model output.
- **90/90 positions:** every generation parsed to a non-empty answer — the parser survives real, unstructured text.
- **370.8 s mean, 21.5 s stdev (5.8%):** timing is stable enough to plan the matrix.
- **5/30 Ministral fallback:** claim tags are not guaranteed by any model; the fallback path is load-bearing, not decorative.
- **≈$4.29 for 10 questions:** about 43 cents per question at dev rates. Scaling crudely to the 8,000-debate Core plan would exceed the budget at dev rates — the Final stack, batching and caching are the plan.
- **Trust trajectory null:** honest marker that Gate 0 tested the base loop only.

**Likely questions:**

- **Q: Is 370 seconds fast enough for 8,000 debates?** Not at dev speed; the Final stack plus optimizations is the plan, and the matrix runs unattended over days.
- **Q: What does the 5.8% timing variance tell you?** The system is not thrashing; per-question cost is predictable.
- **Q: What is the artifact a judge can inspect?** `experiments/gate0/artifacts/summary-20260916T193249Z.md` plus the raw transcript in `experiments/gate0/`.
- **Q: How do you know the models actually debated?** The transcript shows three distinct agents with positions per round, and peer text visible in revisions (`debate.py:60`).

### 14.2 Ablations Explained

| Ablation | Removes | Question it answers |
| --- | --- | --- |
| A1 | Trust weighting (retrieval stays) | Does evidence matter without influence? Isolates the vote change |
| A2 | Progressive retrieval (single pass) | Does multi-round evidence matter? |
| A3 | Claim-domain routing (single source) | Does routing by subject matter? |
| A4 | Adaptive triggering (always debate) | Does the gate matter for cost and accuracy? |

**Q&A:**

- **Q: Why these four ablations?** Each removes exactly one claimed contribution while keeping the rest — classic component isolation.
- **Q: What result would vindicate the trust layer?** A1's CCR higher than the full system's means the weighting is doing real work.
- **Q: Do ablations run on the full matrix?** No — a 100-question sensitivity sweep; the full matrix runs the main system versus the primary baselines.

## 15. Compute, Cost & Feasibility

- Current Core matrix: 1,280 GPU-h conservative cap, planned ~1,067 GPU-h (`PRE_REGISTRATION.md` §5). The earlier report figure was ≈300 GPU-h (`FYDP_Summer/3.design.tex:168`; `5.sic.tex:305`).
- Stage costs: Final-stack smoke $80–120; pilot $50–100; Core $420–580 (Dev stack); Full run $900–1,200 (separate Final-stack matrix; not a Core reuse); law-testing $1,400–1,900.
- **Hard stop: $1,350 before law-testing.** Full is a separate Final-stack matrix; Core cells are not assumed reusable unless the stack and model revisions match.
- Feasibility: dev stack on one RTX A6000; final stack on one RTX PRO 6000 96 GB; inference-only, no training. The 96 GB smoke is **NOT RUN**; only the offline 69.73 GB check passes.
- If GPUs are short: reduce seeds or questions per set for the pilot, never change the gate criteria.

### 15.1 Budget Table

| Item | Estimate | Source |
| --- | --- | --- |
| Final-stack smoke (96 GB) | 60–100 GPU-h; $80–120 | `roadmap.md` §13; **NOT RUN** |
| Pilot | ~112 GPU-h; $50–100 | `roadmap.md` §13 |
| Core run | 1,280 GPU-h cap (planned ~1,067); $420–580 | `PRE_REGISTRATION.md` §5 |
| Full run (separate Final-stack matrix) | 1,440 GPU-h envelope; $900–1,200 | `roadmap.md` §13; conditional on oracle scope (gold-answer vs gold-evidence-only on EG-SSS) |
| Law-testing | ~3,913 GPU-h at 8 min; $1,400–1,900 | only if effect |
| Hard stop | $1,350 before law-testing | `roadmap.md` §13 |
| Gate 0 actual | ≈$4.29 | `experiments/gate0/README.md` |
| Oracle B7 | $5–7 total | blueprint §7 |

**Honest line:** "The old deck and report figures are historical. The current stage split is smoke, pilot, Core, Full run and law-testing; the Gate 0 actual gives the per-question sanity check."

**Cost Q&A:**

- **Q: What dominates the cost?** Nine generations per question (3 agents × 3 rounds) at 1024 output tokens each, plus retrieval calls.
- **Q: Can the budget be cut without hurting the science?** Yes — fewer seeds hurt precision, fewer questions hurt power; the priority is keeping two seeds and shrinking pilot scope instead.
- **Q: What does a costing surprise look like?** GPU price spikes (SWOT threat) or retrieval rate limits forcing paid tiers; both are tracked in the risk register (`3.design.tex:143-151`).

## 16. Risks, Limitations & Weak Spots

**External-facing limitations (say these first):**

- L1: injection is an explicit upper-bound stress test (blueprint `:706`).
- L2: paraphrase-style subtle sycophancy is untested (blueprint `:698`).
- K is fixed at 3 rounds (blueprint `:699`).
- Correlated hallucinations across models are a scope boundary (blueprint `:431,617`).
- Easy questions gain little; the mechanism targets the hard, divergent slice (`:652`).
- Three model families limit generalization (`:715`).
- Evidence limit: the mechanism is only as strong as retrieved passages (Papev `:398`).
- Injection is upper-bound and pilot scope is small — a stated study limit.

**Internal weak spots (rehearse these answers):**

| Weak spot | The honest answer |
| --- | --- |
| Verifier accuracy is not yet human-validated | "The 150–200 pair audit is the next gate. The lexical baseline scores 0.58 balanced accuracy on the synthetic audit set, so it is a diagnostic, not a paper result." |
| The effect has not been measured yet | "The Core run is the next gate. No efficacy claim is made before it; the P0 gate is engineering readiness, not evidence." |
| Placebo/oracle arms are not implemented yet | "WP-18 adds B8-placebo and B8-oracle before the main run; the pre-registration lists the six-arm target and the four-arm executable subset. If B8-oracle is gold-evidence-only on EG-SSS, the Full target is 32 runs, not 36." |
| `--rounds` ignored with real clients | "Rounds come from the config file; the flag is legacy for mocks. It is queued for cleanup." (`runner.py:161-166`) |
| Empty constraints subsections in report | "The standards/constraints chapter is being completed for the thesis; the mapping exists in Ch5." (`FYDP_Summer/5.sic.tex:53-73`) |
| Registry vs matrix | "B1–B10 are the registry; the Core matrix is exactly B3, B4-matched, B8-no-trust and B8. The Full target adds placebo and oracle." |
| Costs are split by stage | "Smoke, pilot, Core, Full run and law-testing are separate rows; Full is a separate Final-stack matrix, not a Core reuse, and the hard stop is $1,350 before law-testing." |
| α/β grid not yet run | "Defaults 0.5/0.3; a Phase-3b sweep is scheduled, with a planned sensitivity check." (`blueprint.md` §9) |
| Pilot = 10 questions | "Gate 0 was 10; the pilot is 100–150. The Core plan is 8,000 debates under the 1,280 GPU-h cap." |
| Confidence gate not invoked | "Prompt is ready; the runner skip is deliberate until the trust loop lands." |

**Risk register:** challenge C (behavioral effect) is critical; retrieval noise, incrementality, novelty erosion vs ConsensAgent, Phase-2 overload, iMAD fidelity, single-GPU ceiling (blueprint `:444-456`).

### 16.1 Hard Questions Drill

The uncomfortable questions, with answers that hold up.

1. **"Your trust signal hasn't changed a single decision yet — how is this a contribution?"** The contribution is the mechanism plus the measurement harness. Gate discipline requires validating the base loop first, and the trust math is unit-proven before it touches GPU runs.
2. **"What if retrieval finds nothing for most claims?"** Trust stays flat and the system degrades to vanilla debate. That is the stated evidence limit, and the unverifiable rate is part of the error taxonomy.
3. **"Isn't this just RAG with extra steps?"** RAG changes what an agent reads; we change how much the agent counts. B4-matched — debate plus retrieval without trust — is exactly that ablation arm.
4. **"Why should we believe the 20–30% collapse reduction?"** It is a projection from the design target, not a measured result; the matrix measures accuracy and CMR, and we label the rest as projected.
5. **"What about correlated errors across the three models?"** Heterogeneity reduces but does not remove them; the scope boundary is stated in the paper.
6. **"Why is the report's implementation chapter empty?"** It is scheduled for the thesis; Gate 0 and P0 live in the experiment reports, and Section 14 of this guide documents them.
7. **"What if both annotators disagree on most items?"** κ fails, the rubric is revised, and no measurement proceeds on a failed rubric (`annotate.py:55-58`).
8. **"How do you handle ties in the final vote?"** First-index argmax today; a margin-based tie-break is planned (`aggregation.py:15`).
9. **"What is your falsifiable prediction?"** With trust weighting, B8 improves accuracy and CMR over B8-no-trust on pressure-eligible items, with the difference interval off zero.
10. **"Why should the panel trust the metrics — you wrote them?"** Accuracy and CMR are defined from first principles with denominators, edge cases, and unit tests; the definitions are in the paper for scrutiny.
11. **"What if results are null?"** The Go/No-Go was frozen before the pilot; a null result is reported as a finding with the error taxonomy explaining why.
12. **"What is the plan if the project fails entirely?"** Report honestly, keep the open harness, and document the negative evidence for the field — the fallback is stated in the blueprint (`:711`).

## 17. Novelty & Related Work

**One-line positioning:** no existing debate system ties an agent's influence to external evidence during the debate — influence comes from a bounded, evidence-grounded trust score, not a vote or self-reported confidence.

**Comparison table:**

| System | What it does | Why it is not us |
| --- | --- | --- |
| Du et al. (MAD 2024) | Debate then majority vote | Equal weight, no external evidence |
| MoA (ICLR 2025) | Static layered aggregation | Fixed merge, no per-agent trust |
| iMAD (AAAI 2026) | Predicts when to debate; saves up to 92% tokens | Once triggered, still majority voting |
| ConsensAgent (ACL 2025) | Prompt rewriting on stalling/copy-paste | Still decides via self-reported confidence |
| DebUnc (EMNLP 2025) | Weights by token-level uncertainty | Internal signal, not retrieved evidence; oracle is an upper bound |
| B7 Oracle | Commercial model ceiling | Reference point only, not a mechanism |

**What we do NOT claim:** not "first to mitigate sycophancy"; not a solved calibration problem; not better than frontier models — we change how a debate aggregates evidence at equal model scale.

**Report refs:** gap analysis `FYDP_Summer/2.back.tex:88`; related work comparisons in `literature_review/index.md`.

### 17.1 Positioning Q&A

- **Q: Closest system, and why are you different?** DebUnc is closest — it also weights agents — but its signal is token-level uncertainty; ours is retrieved evidence.
- **Q: Why not just use the oracle signal?** It needs the gold answer; it is an upper bound, not deployable — DebUnc's own framing.
- **Q: iMAD already reduces debate cost — is this redundant?** iMAD decides whether to debate; it does not change who wins inside the debate. Complementary, and we cite it that way.
- **Q: ConsensAgent rewrites prompts — is that not enough?** It mitigates before the debate and still votes on self-reported confidence; our weighting acts inside every round.
- **Q: Where is the novelty — the metric or the mechanism?** The mechanism is primary; the accuracy/CMR/trust-calibration harness is the second contribution. ECR is deprecated.
- **Q: Why not claim "first"?** "First" invites a literature ambush. The defensible claim is scoped: no existing system ties an agent's influence to external evidence during the debate.
- **Q: What if a judge name-drops a system not in your table?** Acknowledge the related work, restate the scoped gap, and say we will add it to the comparison matrix — do not improvise novelty claims.
- **Q: How do you show you are not just MoA with extra steps?** B6 is MoA in the same stack; if static merging matched trust weighting, B6 would win — the matrix will show which.

### 17.2 Related Work One-Liners

- **Du et al. (ICML 2024)** — debate improves reasoning; establishes the majority-vote baseline we extend.
- **MoA (ICLR 2025)** — layered static aggregation; no per-agent trust.
- **iMAD (AAAI 2026)** — debate gating; majority voting after triggering.
- **ConsensAgent (ACL 2025 Findings)** — prompt rewriting; confidence-based decision.
- **DebUnc (EMNLP 2025 Findings)** — uncertainty weighting; the closest mechanism to ours.
- **MAST (NeurIPS 2025)** — failure taxonomy across seven multi-agent frameworks.
- **Minority Sentinel / FREE-MAD / S²-MAD / Debate-or-Vote (2025–26)** — minority detection, majority-free scoring, cost reduction, and theory on when debate helps.

## 18. Where Is It in the Report?

| Topic | FYDP_Summer | Journal (Papev) | Blueprint |
| --- | --- | --- | --- |
| Architecture / context / DFD | `3.design.tex:5-48` | — | §5:214 |
| Phases + gates (first plan) | `3.design.tex:80-134` | — | §12:460, §13:486 |
| Task allocation / roles | `3.design.tex:170-202` | CRediT `:70-116` | — |
| Trust update formula | — | `:209-224` | §4:163 (formula `:180`) |
| Injection protocol | — | `:316-321` | §4 (injection point `:182`) |
| Datasets | — | `:260-270` | §8:358 |
| Metrics (accuracy/CMR/AUROC/Brier; ECR deprecated) | — | `:289-315` | §9 |
| Baselines B1–B10 | — | `:280-288` | §9:415 |
| Results (tables) | `4.implementation.tex` (stub) | `:345-363`, ablations `:369-384`, stats `:386-394` | — |
| CE mapping (P/K/A/PO) | `5.sic.tex:164-339` | — | — |
| Cost | `5.sic.tex:76` | — | `:340` |
| Conclusion / future work | `6.conclusion.tex:4-9` | `:400-405` | — |

## 19. Team Contributions

**Module ownership:**

| Module | Assigned member | Currently done by |
| --- | --- | --- |
| Architecture design, trust mechanism, first experiment plan and full experiment execution (Gate 0), coordination | Md. Atikur Rahaman | Atik (full module) |
| Vanilla MAD reproduction, injection protocol | Rakibul Hasan | Atik |
| Claim decomposition, claim-domain retrieval | Md. Salman Rohoman Nayeem | Atik |
| Evaluation harness, accuracy/CMR/trust-calibration metrics | Pratay Paul | Atik |
| Baselines B1–B10, vLLM serving | Yousuf Kamal Himel | Atik |
| Evidence APIs, dashboard, result packages | Mst. Farjana Akter Limu | Atik |

**Report chapters:**

| Report chapter | Member |
| --- | --- |
| Chapter 1 | Yousuf |
| Chapter 2 | Salman and Prottoy |
| Chapter 3 | Rakibul and Limu |
| Chapter 5 | Atik |

(Chapter 4 not yet started, so it is not listed.)

### 19.1 Contribution Q&A

- **Q: Why does Atik appear on every module?** Because the current implementation is centralized — the table records who actually did the work so far, while the assigned column preserves the planned ownership.
- **Q: What does each member own in the plan?** Architecture and trust (Atik), debate and injection (Rakibul), claims and retrieval (Salman), evaluation (Pratay), baselines and serving (Yousuf), evidence APIs and dashboard (Limu).
- **Q: How will contributions split in FYDP II?** Modules move to their assigned owners as each phase lands, with the same table tracking actual work.
- **Q: What if a judge challenges the centralization?** We present it plainly: implementation is concentrated during FYDP I, and onboarding/handover is scheduled — hiding it would be worse.
- **Q: Who is the group coordinator?** Atikur, listed on the title slide and the paper's first author line.

## 20. Emergency Answers

- **If you don't know:** "I will come back to that." Pass it to the slide owner from Section 0.
- **If asked "is it real or planned?":** use Section 12 verbatim. Trust math ✅ wired; retrieval routing ✅ implemented; verifier interface ✅ with human audit pending; ECR 🟡 deprecated; the confidence gate remains 🟡 prompt-only.
- **If asked "show me the code":** open the file named in the question's **Code:** line; the full map is in Section 11.
- **If asked "what happens if we do X?":** find the scenario in Section 4 and give the behavior plus the file:line.
- **If asked "why not GPT-4 for everything?":** the mechanism must stay model-agnostic and reproducible on open models; the commercial model is only B7, the ceiling reference.
- **If asked "what did you personally do?":** answer from Section 19.
- **If asked "what are you most confident about?":** the debate loop runs end to end (Gate 0: 10/10, 90/90) and the trust math is bounded and tested; the remaining work is the paid matrix and the human verifier audit.
- **If asked "what is the weakest part?":** retrieval coverage; unverifiable claims are excluded, so sparse fields weaken the signal. Say it before they do.
- **If asked a budget question:** "Core is $420–580; the Full run is $900–1,200 as a separate Final-stack matrix, not a Core reuse; law-testing is $1,400–1,900 only if the effect is real, with a hard stop of $1,350 before law-testing."
- **If asked "why should this project continue?"** Three reasons: the failure is documented in the literature (over 20% ignored-correct cases; 41–86.7% MAS failure rates), the fix is bounded and testable, and the harness is reusable across evidence domains.
- **If a judge requests a specific file:** open `E:\FYDP` and show — `trustcal/src/trustcal/trust/update.py` (math), `orchestrator/injection.py` (stress test), `eval/metrics.py` (CCR/MPR), `experiments/gate0/` (evidence).
- **If the demo laptop fails:** switch to the deck; the code map in Section 11 is on every member's copy, and the mock-server path can run anywhere.
- **If a question is outside our scope:** "That is future work," then name the phase — do not improvise an answer outside the design.
- **If the panel asks "what is the one slide to remember?"** Slide 7 — evidence-grounded trust, updated in-debate, deciding the vote.
- **Final sanity line for every member:** know your three slides, your three weak spots (Section 16), and the one status card (Section 1.2).

### 20.1 Last-Hour Checklist

- [ ] Each presenter knows their slides, word cap, and handoff line.
- [ ] Weak-spot answers rehearsed from Section 16.
- [ ] Status card (Section 1.2) memorized: loop ✅, trust ✅, retrieval 🟡 (verifier audit pending).
- [ ] Demo path chosen and tested — mock servers if GPUs are unavailable.
- [ ] Report line references verified against Section 18.
- [ ] One person owns the laptop, one owns the clicker, one owns time.
- [ ] Any question you cannot answer: defer with "I will come back to that."
- [ ] Speak slowly — one idea per sentence — and point at the slide for codes.
- [ ] After the defence: log every question asked, for the FYDP II update.
