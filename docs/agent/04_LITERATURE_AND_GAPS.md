# 04 — Literature, Prior Art, and Missing References (8 November 2026 Snapshot)

> **Historical snapshot — literature verified 8 November 2026.** This file is retained for the prior-art matrix and gap map. The manuscript claim audit in §7 was **resolved on 9 November 2026**; the authoritative record is `Papev_Summer26_6/CLAIMS_AUDIT.md` and `FYDP_Summer/CLAIMS_AUDIT.md`. Do not present §7 as the current manuscript state.

**Snapshot:** 8 November 2026. **Purpose:** give an agent the exact novelty boundary, the papers that preempt parts of the project, and the references the 8 November 2026 draft was missing.

**Read this before writing any novelty claim.** The 8 November 2026 draft's "no mechanism exists" sentence was false. See §7 (historical).

---

## 1. The precise novelty statement

### What is **not** new

- Checking an agent's claims against retrieved evidence. CRITIC, RAG debate, GAVEL, DebateCV, SciTrue, and others do this.
- Reweighting agent influence during debate. DebUnc, R²-MAD, DySCo, "To Trust or Not," and "Too Polite to Disagree" do this.
- Bounded/numeric trust. "To Trust or Not" and LabourCrew do numeric trust; "Too Polite" uses scores in [0,1].
- Claim-level decomposition. GAVEL, CLAIR-Fin, DebateCV, ISNAD, and MoCA-Agent do atomic claims/evidence.
- Testing a wrong majority. Minority Sentinel, Silent Dissent, "Too Polite," and R²-MAD study wrong-majority/conformity.
- The combination of retrieval + reliability weighting + consensus. R²-MAD and TERA-RAG already do it.

### What **is** still defensible

A **pre-registered, multi-domain, fabricated wrong-majority benchmark** that:

1. Separates **social conformity** (peer pressure) from **evidential revision** (new evidence) with a factorial design.
2. Logs **claim-level trust trajectories** and tests whether claim-level attribution is causally active (vs document-level or label-shuffled trust).
3. Tests whether **evidence-derived trust** reverses the failure where **confidence-derived trust** (DebUnc/CAD) fails.
4. Maps a **verification ceiling**: the verifier-accuracy/coverage threshold below which trust reweighting amplifies noise instead of correcting it.
5. Pairs the benchmark with a **theorem or empirical law** for bounded trust under a fraction of adversarial agents.

**One-sentence positioning:**

> We do not introduce evidence-grounded debate or trust reweighting; we introduce the first controlled benchmark and causal/verification-ceiling analysis that identifies *when* claim-level evidence-derived trust corrects a wrong majority, when it fails, and why.

This is a measurement + benchmark + theory paper, not a "new mechanism wins" paper.

---

## 2. The 12 closest papers

Legend: **a** = reweights agent influence during debate; **b** = external retrieved evidence at claim level; **c** = bounded numeric trust/reliability; **d** = adversarial wrong-majority test; **e** = theory. ● yes, ◐ partial, ○ no.

| # | Paper (venue/status) | Mechanism | a/b/c/d/e | What it preempts / leaves |
|---:|---|---|---|---|
| 1 | **R²-MAD: Remember and Reweight** — Jin et al., Findings EMNLP 2026, [arXiv:2609.03619](https://arxiv.org/abs/2609.03619) | Experience memory; debate-state-aware retrieval; per-agent reliability → confidence weights that modulate peer influence; targets shared misconception/wrong majority | a● b◐ c◐ d● e○ | **Strongest preemption.** Retrieval → per-agent reliability → influence reweighting for wrong majority. Leaves: live scientific corpus, claim-level decomposition, bounded trust state, controlled injection benchmark, theory. |
| 2 | **TERA-RAG** — Truong et al., IEEE JCSSE 2026, [DOI](https://doi.org/10.1109/JCSSE68839.2026.11596782) | Temporal query conditioning + source-reliability evidence scoring + debate conflict resolution → reliability-weighted consensus with traces | a◐ b● c◐ d○ e○ | Preempts "reliability-weighted consensus from external evidence." Leaves: per-agent bounded trust, claim-level attribution, injection test, theory. |
| 3 | **To Trust or Not to Trust: Attention-Based Trust Management** — He et al., **ACL 2026 main**, [arXiv:2506.02546](https://arxiv.org/abs/2506.02546) | Six trust dimensions; Attention Trust Score; message- and agent-level trust; robustness to malicious inputs | a● b○ c● d● e○ | Preempts agent-level numeric trust under attack. Leaves: external evidence, claim-level grounding, debate-specific dynamics, bounded α/β state, theory. |
| 4 | **Too Polite to Disagree** — Kasprova et al., SIGDIAL 2026, [arXiv:2604.02668](https://arxiv.org/abs/2604.02668) | Static/dynamic sycophancy scores in [0,1]; peer sycophancy rankings reduce influence of sycophancy-prone peers; +10.5% absolute accuracy | a● b○ c● d◐ e○ | Preempts sycophancy-score reweighting. Leaves: external evidence, claim-level, fabricated wrong-majority injection, theory. |
| 5 | **DySCo: Dynamic Trust-Aware Sparse Consensus** — Gou & Liu, arXiv 2026, [arXiv:2606.01828](https://arxiv.org/abs/2606.01828) | Per-round edge value from reliability, divergence, relevance; sparse message exchange; dynamic trust weights; early stopping | a● b○ c● d○ e◐ | Preempts dynamic trust-weighted aggregation. Leaves: evidence, claims, injection, full theorem. |
| 6 | **WISE / WISE–Dawid–Skene** — CoRR 2025 / SCALE@ICML 2026, [arXiv:2512.02405](https://arxiv.org/abs/2512.02405); [OpenReview](https://openreview.net/forum?id=lNhkBvfBxq) | Solvers/reflectors assign correctness weights; unsupervised Dawid–Skene estimates solver/scorer error; weighted probabilistic consensus | a● b○ c◐ d○ e◐ | Preempts unsupervised reliability-weighted consensus. Leaves: external evidence, claims, injection, bounded trust state. |
| 7 | **Demystifying Multi-Agent Debate: Confidence and Diversity** — Zhu et al., Findings ACL 2026, [arXiv:2601.19921](https://arxiv.org/abs/2601.19921) | Diversity-aware init + confidence-modulated belief updates; theorems: diversity raises prior success, confidence drifts to correct hypothesis | a● b○ c◐ d○ e● | Preempts confidence-update theory. Leaves: external evidence, claims, injection, bounded trust. |
| 8 | **GAVEL** — Xu et al., Findings ACL 2026, [ACL](https://aclanthology.org/2026.findings-acl.1789/) | Evidence Contract: atomic subclaims bound to explicit evidence units; neutral Scrutinizer validates citations/spans; Judge selects evidence | a◐ b● c○ d○ e○ | Preempts claim-level evidence binding in debate. Leaves: per-agent trust weighting, bounded score, injection, theory. |
| 9 | **CLAIR-Fin** — Faria et al., FinNLP@EMNLP 2026, [arXiv:2608.13706](https://arxiv.org/abs/2608.13706) | Nine agents; typed Financial Claim Ledger; Asymmetric Evidence Authority by claim type; Chain-of-Custody; adaptive rebuttal; entailment audit | a◐ b● c◐ d○ e○ | Preempts typed claim-level evidence authority. Leaves: dynamic per-agent trust, injection benchmark, theory. |
| 10 | **LabourCrew** — Faria et al., arXiv 2026, [arXiv:2609.27814](https://arxiv.org/abs/2609.27814) | StatuteGraph + Evidence Exchange Protocol + Calibrated Trust Gate with conformal risk control for false-accept bound | a◐ b● c● d○ e● | Preempts conformal trust gating. Leaves: in-debate agent influence, scientific domain, injection. |
| 11 | **DebUnc** — Yoffe et al., Findings EMNLP 2025, [ACL](https://aclanthology.org/2025.findings-emnlp.1265/) | Uncertainty metrics → confidence via prompt or attention token weights | a● b○ c◐ d○ e○ | Preempts in-loop uncertainty reweighting. Leaves: external evidence, claims, bounded agent trust, injection, theory. |
| 12 | **ConsensAgent** — Pitre et al., Findings ACL 2025, [ACL](https://aclanthology.org/2025.findings-acl.1141/) | Detect copying/stalling/confidence triggers; fine-tuned prompt optimizer; confidence + consistency aggregation | a◐ b○ c◐ d○ e○ | Preempts prompt-level sycophancy mitigation. Leaves: external evidence, numeric trust, injection, theory. |

**Near-misses (verified):**

| Paper | Venue | Why it matters |
|---|---|---|
| **FREE-MAD** | Findings ACL 2026, [ACL](https://aclanthology.org/2026.findings-acl.1600/) | Consensus-free trajectory score + anti-conformity; a strong baseline the draft cites but does not compare against properly. |
| **Minority Sentinel** | SIGIR 2026 workshop, [arXiv:2606.29270](https://arxiv.org/abs/2606.29270) | Post-hoc flip classifier, 81.2% flip precision; the draft's closest problem-framing competitor. |
| **DebateCV / Debating Truth** | WWW 2026, [arXiv:2507.19090](https://arxiv.org/abs/2507.19090), [DOI](https://doi.org/10.1145/3774904.3792993) | Debate-driven claim verification with a moderator; preempts "debate over claims with evidence." |
| **SELENE** | EACL 2026 Industry, [ACL](https://aclanthology.org/2026.eacl-industry.7/) | Selective debate + evidence-weighted self-consistency; weights evaluations, not agents. |
| **EVESkillDebate** | ICLR 2027 submission, [OpenReview](https://openreview.net/forum?id=p9mvtoFO9L) | Candidate-level claims bound to spans/KG; frozen verifier. |
| **StageMAD** | ICLR 2027 submission, [OpenReview](https://openreview.net/forum?id=6fjAJTxmyV) | Process-evidence propagation control to prevent incorrect consensus. |
| **INQUIRY** | ICLR 2027 submission, [OpenReview](https://openreview.net/forum?id=EoTAuTzgJZ) | Verdict-blind debate; "Minority Truth Recovery." |
| **MiniRep** | arXiv 2026, [arXiv:2609.39297](https://arxiv.org/abs/2609.39297) | Reputation aggregation under malicious agents; 28 attack conditions. |
| **MASCAL** | arXiv 2026, [arXiv:2610.39927](https://arxiv.org/abs/2610.39927) | Calibrated confidence at handoff with web retrieval. |
| **Silent Dissent** | arXiv 2026, [arXiv:2610.02702](https://arxiv.org/abs/2610.02702) | Scripted unanimous wrong majority; a controlled pressure paradigm. |
| **When Consensus Is Not Correctness** | KDD 2026 workshop, [OpenReview](https://openreview.net/forum?id=VL3GsIpCF7) | Variance theory + conformal certification; closest to a calibration/guarantee framing. |
| **When Does Multi-Agent Debate Backfire?** | ICLR 2027 submission, [OpenReview](https://openreview.net/forum?id=uIeNtbkWc) | Heterogeneous debate flips 11.6% of strong-agent correct answers. |
| **ClaimCLAIRE** | TrustNLP 2026, [ACL](https://aclanthology.org/2026.trustnlp-main.6/) | Trust-modulated evidence retrieval. |
| **TRUST Agents** | arXiv 2026, [arXiv:2604.12184](https://arxiv.org/abs/2604.12184) | Claim extraction + calibrated verifier + Delphi jury; not a trust-calibrated debate. |
| **MoCA-Agent** | arXiv 2026, [arXiv:2606.11537](https://arxiv.org/abs/2606.11537) | Typed atomic claims; confidence-weighted market. |
| **ISNAD** | arXiv 2026, [arXiv:2607.24117](https://arxiv.org/abs/2607.24117) | Claim-level provenance grading. |
| **iMAD** | AAAI 2026, [arXiv:2511.11306](https://arxiv.org/abs/2511.11306) | Selective debate trigger; the draft's B9 is only a heuristic approximation. |
| **MoA** | ICLR 2025, [OpenReview](https://openreview.net/forum?id=jAzeVj8u7x) | Static layered aggregation; a baseline the draft's B6 does not faithfully implement. |
| **Estornell & Liu** | NeurIPS 2024, [OpenReview](https://openreview.net/forum?id=sy7eSEXdPC) | Majority-misconception theory; the draft cites it but has no theorem of its own. |

---

## 3. The three preemptions that matter most

### 3.1 R²-MAD (Findings EMNLP 2026) — strongest

Abstract evidence:

> "A debate-state-aware retrieval policy dynamically calibrates the concept prior by retrieving relevant historical evidence based on the current consensus level. Then these retrieved experiences provide a basis for estimating per-agent reliability, yielding confidence weights to modulate peer influence."

That is the project's chain — retrieval → per-agent reliability → influence reweighting under a wrong majority — with "historical debate experience" instead of PubMed/arXiv/S2. The remaining delta is claim-level decomposition and a bounded trust state, not the core idea.

**What to do:** cite it as the closest mechanism; differentiate on (a) live scientific corpus + claim-level evidence, (b) controlled injection benchmark, (c) verification-ceiling analysis, (d) bounded-trust law. Do not claim the retrieval→reliability→influence chain is new.

### 3.2 TERA-RAG (IEEE JCSSE 2026)

Abstract evidence:

> "...source-reliability-aware evidence scoring, and debate-based conflict resolution in a unified pipeline, filtering and weighting evidence before producing a reliability-weighted consensus answer with auditable reasoning traces."

This preempts "reliability-weighted consensus from external evidence." The FYDP's delta is per-agent bounded trust and claim-level attribution, not "weighted consensus."

**What to do:** cite it as the closest evidence-weighting system; differentiate on agent-level trust, injection, and the ceiling analysis.

### 3.3 To Trust or Not to Trust (ACL 2026 main)

It already does message- and agent-level numeric trust under malicious inputs. The FYDP's delta is external evidence and claim-level grounding, not "numeric trust."

**What to do:** cite it; do not claim numeric trust is new.

---

## 4. Counter-evidence the paper must address

### 4.1 Authority Bias (NeurIPS 2026, [arXiv:2609.37616](https://arxiv.org/abs/2609.37616))

A single verified-source note endorsing a wrong answer flips **45–88%** of baseline-correct responses in seven of eight models. External evidence can **increase** deference rather than calibrate it.

**Implication:** the paper's premise ("external evidence reduces sycophancy") is not guaranteed. Add a condition where the evidence supports the majority; measure whether trust resists or amplifies. The verification-ceiling framing is the right response.

### 4.2 Verify, Then Argue (EMNLP 2026 Industry, [ACL](https://aclanthology.org/2026.emnlp-industry.243/))

Claim verification changes the final decision but **not the reasoning**; agents are insensitive to which claim a verification label is attached to — reassigning labels to wrong claims lowers the decision to the same extent.

**Implication:** claim-level attribution may be epiphenomenal. Add a **claim-level vs document-level vs label-shuffled trust** condition. If all three perform the same, the paper's claim-level contribution is not causal. This is a critical experiment, not an optional ablation.

### 4.3 The Consistency Illusion (EMNLP 2026, [ACL](https://aclanthology.org/2026.emnlp-main.1780/))

Debate reduces detectable contradictions while decreasing reasoning alignment; answer consensus ≠ reasoning consensus.

**Implication:** the paper should report reasoning-level alignment, not just answer accuracy. Add a CARA-style metric or a human audit of reasoning alignment.

---

## 5. What this means for the paper

**Do not frame it as:** "We introduce evidence-grounded trust reweighting and beat iMAD/ConsensAgent."

**Frame it as:** "We provide the first controlled benchmark and causal/verification-ceiling analysis of when claim-level evidence-derived trust corrects a wrong majority — and when it fails."

**Required baselines to add or discuss:**

- R²-MAD (Findings EMNLP 2026) — closest mechanism.
- TERA-RAG (IEEE JCSSE 2026) — closest evidence-weighted consensus.
- To Trust or Not (ACL 2026 main) — closest numeric trust.
- Too Polite to Disagree (SIGDIAL 2026) — closest sycophancy-score reweighting.
- DySCo (arXiv 2026) — dynamic trust-weighted aggregation.
- WISE (arXiv 2025/2026) — reliability-weighted consensus.
- FREE-MAD (Findings ACL 2026) — consensus-free baseline.
- Minority Sentinel (SIGIR 2026 workshop) — post-hoc baseline.
- DebateCV (WWW 2026) — claim-verification debate.
- GAVEL (Findings ACL 2026) — claim-level evidence binding.
- DebUnc (Findings EMNLP 2025) — uncertainty baseline.
- ConsensAgent (Findings ACL 2025) — prompt-refinement baseline.
- iMAD (AAAI 2026) — selective debate baseline.
- MoA (ICLR 2025) — static aggregation baseline.

If you cannot run all of them, compare against the **published numbers** on a shared subset and state the limitation. Do not claim a faithful comparison with a heuristic.

---

## 6. Missing references to add

### 6.1 Classic / foundational (not in the 8 November 2026 draft)

| Reference | Venue | Why add | Verify |
|---|---|---|---|
| Khan et al., *Debating with More Persuasive LLMs Leads to More Truthful Answers* | ICML 2024 | Persuasion vs correctness; the debate's social dynamic | arXiv 2402.06782 |
| Smit et al., *Should We Be Going MAD? A Look at Multi-Agent Debate Strategies for LLMs* | ICML 2024 | Debate strategy comparison; baseline design | arXiv 2311.17371 |
| Sharma et al., *Towards Understanding Sycophancy in Language Models* | ICLR 2024 | Sycophancy definition and measurement | arXiv 2310.13548 |
| Turpin et al., *Language Models Don't Always Say What They Think* | NeurIPS 2023 | Unfaithful chain-of-thought; reasoning-quality caveat | arXiv 2305.04388 |
| Dhuliawala et al., *Chain-of-Verification Reduces Hallucination* | ACL 2024 Findings | Claim verification precedent | arXiv 2309.11495 |
| Asai et al., *Self-RAG* | ICLR 2024 | Retrieval/critique precedent | arXiv 2310.11511 |
| Gao et al., *RAG for LLMs: A Survey* | arXiv 2023 | Retrieval background | arXiv 2312.10997 |
| Guo et al., *On Calibration of Modern Neural Networks* | ICML 2017 | ECE origin; why ECR needs a proper calibration definition | arXiv 1706.04599 |
| Liang et al., *Encouraging Divergent Thinking through Multi-Agent Debate* | EMNLP 2024 | Degeneration-of-thought; debate failure | ACL 2024.emnlp-main.992 |
| Chan et al., *ChatEval* | ICLR 2024 | Multi-agent judge precedent | OpenReview FQepisCUWu |
| Pham et al., *CIPHER* | ICLR 2024 | Communication fidelity; external signal motivation | arXiv 2310.06272 |
| Zeng et al., *S2-MAD* | NAACL 2025 | Redundancy pruning; efficiency baseline | ACL 2025.naacl-long.475 |
| Campedelli et al., *I Want to Break Free!* | TMLR 2025 | Persuasion ≠ correctness | arXiv 2410.07109 |

### 6.2 2026 trust/debate frontier (must cite)

| Reference | Venue/status | Why add | Link |
|---|---|---|---|
| R²-MAD | Findings EMNLP 2026 | Closest mechanism; strongest preemption | https://arxiv.org/abs/2609.03619 |
| TERA-RAG | IEEE JCSSE 2026 | Closest evidence-weighted consensus | https://doi.org/10.1109/JCSSE68839.2026.11596782 |
| To Trust or Not | ACL 2026 main | Agent-level numeric trust | https://arxiv.org/abs/2506.02546 |
| Too Polite to Disagree | SIGDIAL 2026 | Sycophancy-score reweighting | https://arxiv.org/abs/2604.02668 |
| DySCo | arXiv 2026 | Dynamic trust-aware sparse consensus | https://arxiv.org/abs/2606.01828 |
| WISE / Dawid–Skene | arXiv 2025 / SCALE@ICML 2026 | Unsupervised reliability weighting | https://arxiv.org/abs/2512.02405 |
| Demystifying MAD | Findings ACL 2026 | Confidence/diversity theory | https://arxiv.org/abs/2601.19921 |
| GAVEL | Findings ACL 2026 | Claim-level evidence binding | https://aclanthology.org/2026.findings-acl.1789/ |
| CLAIR-Fin | FinNLP@EMNLP 2026 | Typed claim ledger | https://arxiv.org/abs/2608.13706 |
| LabourCrew | arXiv 2026 | Conformal trust gate | https://arxiv.org/abs/2609.27814 |
| Verify, Then Argue | EMNLP 2026 Industry | Claim verification changes decision, not reasoning | https://aclanthology.org/2026.emnlp-industry.243/ |
| The Consistency Illusion | EMNLP 2026 | Answer consensus ≠ reasoning alignment | https://aclanthology.org/2026.emnlp-main.1780/ |
| SciTrue | EACL 2026 Demo | Evidence-grounded scientific claim verification | https://aclanthology.org/2026.eacl-demo.27/ |
| DebateCV | WWW 2026 | Debate-driven claim verification | https://arxiv.org/abs/2507.19090 |
| FREE-MAD | Findings ACL 2026 | Consensus-free baseline | https://aclanthology.org/2026.findings-acl.1600/ |
| Minority Sentinel | SIGIR 2026 workshop | Post-hoc flip baseline | https://arxiv.org/abs/2606.29270 |
| SELENE | EACL 2026 Industry | Evidence-weighted self-consistency | https://aclanthology.org/2026.eacl-industry.7/ |
| Authority Bias | NeurIPS 2026 | External source can increase conformity | https://arxiv.org/abs/2609.37616 |
| Silent Dissent | arXiv 2026 | Controlled wrong-majority paradigm | https://arxiv.org/abs/2610.02702 |
| When Consensus Is Not Correctness | KDD 2026 workshop | Conformal/variance certification | https://openreview.net/forum?id=VL3GsIpCF7 |

### 6.3 2025–2026 sycophancy, pressure, and evidence-grounded debate

The FYDP's 8 November 2026 related work was missing the 2025–2026 empirical sycophancy literature and the evidence-grounded debate precedents. Add these before writing the related-work section.

| Reference | Venue/status | Why add | Link |
|---|---|---|---|
| **Peacemaker or Troublemaker: How Sycophancy Shapes Multi-Agent Debate** | arXiv 2025 | Formal MADS sycophancy definition/metrics; closest conceptual framing | https://arxiv.org/abs/2509.23055 |
| **Talk Isn't Always Cheap: Understanding Failure Modes in Multi-Agent Debate** | arXiv 2025 | Debate can harm; diversity/failure modes; supports the failure taxonomy | https://arxiv.org/abs/2509.05396 |
| **Too Polite to Disagree** | SIGDIAL 2026 | Sycophancy propagation; peer sycophancy priors; +10.5% accuracy | https://arxiv.org/abs/2604.02668 |
| **Not Just RLHF: Why Alignment Alone Won't Fix Multi-Agent Sycophancy** | arXiv 2026 | Structured dissent; N=4–6; 54–73 pp dissenter effect | https://arxiv.org/abs/2605.12991 |
| **When Debate Amplifies Risk: Social-Bias Vulnerabilities in Multi-Agent Safety Deliberation** | arXiv 2026 | Holds evidence invariant; 0–100% unsafe adoption; best injection-control template | https://arxiv.org/abs/2611.04289 |
| **SycEval: Evaluating LLM Sycophancy** | AIES 2025 | Single-agent sycophancy benchmark; pressure-design precedent | https://arxiv.org/abs/2502.08177 |
| **SPINE: Measuring LLM Sycophancy under Sustained Multi-Turn Pressure** | arXiv 2026 | Collapse rises from 0–57% at 5 turns to 20–97% at 25 turns; K=3 underestimates | https://arxiv.org/abs/2609.09090 |
| **Big-Big-SycoBench** | arXiv 2026 | 450 artifacts / 5,400 arguments; separates responsiveness from compliance | https://arxiv.org/abs/2610.15634 |
| **Beyond the Sycophancy Score** | arXiv 2026 | 103,939 replies; task difficulty dominates, pressure tactic small | https://arxiv.org/abs/2610.08840 |
| **Silent Dissent** | arXiv 2026 | Stated answer change ≠ internal belief change; measure collapse carefully | https://arxiv.org/abs/2610.02702 |
| **Replication or Corroboration?** | arXiv 2026 | Evidential dependence; do not double-count replicated claims | https://arxiv.org/abs/2610.36151 |
| **When Debate Helps: Proposal Supply and Verification-Aware Readout** | arXiv 2026 | Debate often fails to beat majority; conditions for success | https://arxiv.org/abs/2610.04686 |
| **MArgE: Meshing Argumentative Evidence** | arXiv 2025 | Structured argument trees; alternative to free debate | https://arxiv.org/abs/2508.02584 |
| **PROClaim: Courtroom-Style Multi-Agent Debate with Progressive RAG** | arXiv 2026 | Progressive RAG + role switching; +10 pp over MAD | https://arxiv.org/abs/2603.28488 |
| **BLUEmed: Retrieval-Augmented Multi-Agent Debate for Clinical Error Detection** | ICHI 2026 | Source-partitioned evidence debate; closest design precedent | https://arxiv.org/abs/2604.10389 |
| **Epistemic Context Learning** | arXiv 2026 | Peer reliability/trust from history; competing trust mechanism | https://arxiv.org/abs/2601.21742 |
| **When Identity Skews Debate: Anonymization for Bias-Reduced Multi-Agent Reasoning** | ACL 2026 | Identity bias; anonymization; control source/agent cues | https://arxiv.org/abs/2510.07517 |
| **Towards Mitigating Fabricated Consensus: Active Provenance Gate** | ICTAI 2026 | Fabricated consensus; post-debate verification | https://arxiv.org/abs/2609.31422 |
| **Belief Engine: Configurable and Inspectable Stance Dynamics** | arXiv 2026 | Evidence-grounded deliberation; stance dynamics | https://arxiv.org/abs/2605.15343 |

**Positioning rule:** do not claim "first to study multi-agent sycophancy." Claim the narrower gap: **first to tie in-loop agent influence to externally retrieved, claim-level evidence with a bounded trust score, validated on a gold-evidence stress set, against the 2025–2026 multi-agent sycophancy literature.** Cite Peacemaker, Too Polite, Not Just RLHF, and When Debate Amplifies Risk as direct neighbors; cite DebateCV/MArgE/PROClaim/BLUEmed as evidence-grounded debate precedents; cite Silent Dissent and Replication or Corroboration to justify measurement/aggregation choices.

**Rule:** if a reference is only a preprint, label it as a preprint in the bibliography. Do not cite a 2027 OpenReview submission as a published paper; label it "under review."

---

## 7. Claims in the 8 November 2026 draft that had to be deleted or rewritten (historical)

> **Resolved 9 November 2026.** This table is the historical audit source. The applied changes are in `Papev_Summer26_6/CLAIMS_AUDIT.md` and `FYDP_Summer/CLAIMS_AUDIT.md`; the manuscripts now compile as engineering reports with no efficacy claims.

| Historical claim (file:line) | Problem | Rewrite |
|---|---|---|
| "Currently, there is no mechanism within any debate system to check an individual agent's assertions against outside scientific evidence..." (`Papev...:121`) | False absolute; CRITIC, RAG debate, GAVEL, SciTrue, DebateCV exist | "We are not aware of a deployed method that combines claim-level external evidence with in-debate agent-level trust reweighting; the closest systems are R²-MAD, TERA-RAG, and GAVEL." |
| "Our proposed framework produced fewer hallucinated answers..." (`Papev...:121`) | No results exist | Delete until results; then report a defined hallucination metric |
| "The system returns both the selected model..." (`Papev...:121`) | Wrong object | "the selected answer and its supporting citations" |
| "none of the previously conducted studies have assessed scientific claims prior to altering the influence of an agent" (`2.back.tex:73-74`) | False; R²-MAD/TERA-RAG/GAVEL do adjacent things | "None combines claim-level scientific evidence with an explicit, bounded, in-debate agent trust state and a controlled wrong-majority benchmark." |
| "iMAD addresses cost rather than correctness" (`2.back.tex:40`) | Misleading; iMAD reports accuracy gains | "iMAD primarily targets cost; it also reports accuracy gains in some settings." |
| "The trust values ... remain within bounds at all times" (`1.intro.tex`) | False after renormalization | "The trust weights are constrained by a simplex projection with a floor; the exact bound is reported in §X." |
| "all surviving claims are linked back to their originating passages" (`Papev...:121`) | False; unverifiable claims survive without citations | "claims classified as supported are linked to the passages that supported them." |
| "RAG (Rebuttal Aggregation Graph)" (`5.sic.tex`) | Factual error | "RAG (retrieval-augmented generation)" |
| "all seven complex engineering attributes" (`5.sic.tex`) | Table says P6 is not covered | "six of seven; P6 is not covered because there are no external stakeholders" |
| "still within an incremental level of innovation" (`5.sic.tex`) | Self-admission; fatal for top-tier | Delete or change the contribution/venue |

---

## 8. Related-work paragraph skeletons

### 8.1 In-debate influence reweighting

> DebUnc reweights agent messages from self-reported uncertainty [Yoffe et al., 2025]. R²-MAD estimates per-agent reliability from retrieved debate experience and uses it to modulate peer influence [Jin et al., 2026]. DySCo derives per-round trust from reliability, divergence, and task relevance [Gou & Liu, 2026]. "To Trust or Not" maintains message- and agent-level numeric trust under malicious inputs [He et al., 2026]. These systems establish that in-debate reweighting is feasible. None grounds the weight in claim-level external scientific evidence or measures the verification ceiling.

### 8.2 Claim-level evidence

> GAVEL binds atomic subclaims to explicit evidence units and validates citations [Xu et al., 2026]. CLAIR-Fin uses a typed claim ledger with asymmetric evidence authority [Faria et al., 2026]. DebateCV uses a moderator to weigh evidence in claim verification [Zhang et al., 2026]. SciTrue links claim components to scientific sources [Tan et al., 2026]. These systems establish claim-level evidence binding. They do not use the evidence to reweight agent influence during a scientific QA debate.

### 8.3 Sycophancy and wrong-majority pressure

> ConsensAgent detects copying/stalling and rewrites prompts [Pitre et al., 2025]. Minority Sentinel detects a correct minority post hoc [He et al., 2026]. "Too Polite to Disagree" scores sycophancy and reduces the influence of sycophancy-prone peers [Kasprova et al., 2026]. R²-MAD targets shared misconceptions [Jin et al., 2026]. These works establish the failure and several mitigations. None provides a controlled benchmark that separates social conformity from evidential revision, or a verification-ceiling law for when evidence-derived trust helps.

### 8.4 The gap sentence

> The gap is not "evidence in debate" or "trust reweighting" in isolation. It is the absence of a controlled, pre-registered benchmark and a causal/verification-ceiling account that tells a practitioner when claim-level evidence-derived trust will correct a wrong majority, when it will amplify noise, and why.

---

## 9. Citation verification rules

1. Every reference in the paper must have a DOI, ACL Anthology ID, OpenReview ID, or arXiv ID.
2. Preprints must be labeled "preprint" or "under review."
3. Do not cite a 2027 OpenReview submission as accepted.
4. Do not cite a paper you have not read at least the abstract + method of.
5. For each closest competitor, record: mechanism, dataset, metric, result, and why it does/does not preempt.
6. Keep a `references_verified.csv` with columns: cite key, title, venue, year, DOI/URL, status, verified date, verified by.
7. At the 8 November 2026 snapshot, `literature_review/index.md` had 5 unread papers; verify the current count before submission.
