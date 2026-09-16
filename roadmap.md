# FYDP Roadmap — Trust-Calibrated Multi-Agent Scientific Deliberation

Phase-by-phase execution plan (Jul 2026 – Apr 2027). Source of truth: `docs/blueprint.md` (Sections 12–13) and the web roadmap page (`/roadmap`). Every phase ends with a running artifact or a Gate checkpoint — never notes only.

## The two-phase model strategy (GPU economics)

| Phase | Agent 1 | Agent 2 | Agent 3 | GPU | Est. cost |
| --- | --- | --- | --- | --- | --- |
| **Dev (Ph 0–2)** | Qwen3.5-9B | Gemma 4 12B | Ministral-3-14B-Instruct-2512 | RTX A6000 48GB | ~$160–320 |
| **Final (Ph 3–5)** | Qwen3.6-27B | Gemma 4 26B A4B | Mistral-Small-3.2-24B-Instruct-2506 | A100 80GB | ~$400–800 |

All pipeline code is model-agnostic — the Dev→Final swap is a config edit in `configs/models.yaml`, nothing else. Total GPU budget ≈ **$500–1,000** (+ ~$5–7 Gemini oracle API).

> Dev checkpoints are pinned as **quantized variants of these three models** in `trustcal/configs/models.yaml` (4-bit AWQ Qwen, QAT 4-bit Gemma, FP8 Ministral) so the trio fits one 48GB card. The model names above are the models; the config file is the servable artifacts.

---

## Phase 0 — Foundation (Jul 2026) — ✅ COMPLETE (2026-09-16)

**Objective:** literature freeze, environment setup, reproduce vanilla MAD.

**Outcome:** `trustcal/` package built and pushed; the quantized Dev trio served on one rented A6000 48GB (Vast.ai); **Gate 0 PASS** — 10/10 debates × 3 rounds, no empty positions, mean 370.8s/debate; GPQA + HLE access approved; Month-1 criterion fixed in `trustcal/PILOT_CRITERION.md`; 4 core citations verified. Full report, artifacts, issues+fixes, and invoice: **`experiments/gate0/`**.

**Gate 0 definition:** vanilla MAD reproduction (Du et al. 2023) on a GPQA slice — the base debate loop works independent of our contributions.

**Lessons that carry into every later phase:**
- Quantized Dev trio is mandatory on 48GB: AWQ Qwen, QAT Gemma, AWQ Ministral — the official Ministral FP8 checkpoint cannot run on Ampere.
- vLLM **nightly** is required (`gemma4_unified` + Qwen3.5); transformers pinned `<5.17`; use `VENV=1` on PEP 668 images.
- Servers must start **sequentially** (readiness-gated) or vLLM's memory profiling races and reports phantom OOM.
- Rent hosts with **`inet_down_cost=0`**; pin `HF_HOME`; copy `results/` out before destroying an instance (disk is billed while stopped, deleted on destroy).
- Ministral left ~17% of generations without claim tags → the §5.3 fallback extractor is load-bearing, not optional.

**Remaining Phase 0 item (offline, not blocking Phase 1):** LangGraph StateGraph core, videos 1–6.

---

## Phase 1 — Injection Protocol & First Baselines (starts 2026-09-17; ~3–4 weeks)

**Objective:** injection protocol, baselines B1–B4, Proposition 1 proof, Month-1 pilot.

**Keypoints:**
- Implement §5.4 injection steps 1–6 (fabricated wrong "expert consensus" pressure at t=1→2)
- Baselines B1–B4 (Single-Agent CoT, Single-Agent+RAG, MAD, MAD+RAG)
- 50-question pilot + κ check (κ > 0.75 target) on the injection protocol
- **Month-1 behavioral-effectiveness pilot:** ~25 toy questions — confirm trust weight *causally* shifts aggregation output before full build (highest-risk assumption; do not skip)
- **Gate 1 (Go/No-Go):** protocol validated, baseline CCR ≥ 0.30 confirmed, pilot verdict recorded

**Code items Gate 0 surfaced (fix before the pilot runs):**
- Parser: skip formatting-only lines (`**Answer:**` / `**Conclusion:**`) — 19% of outputs
- Claim extraction: exercise the fallback path + per-agent retry (Ministral left 5/30 generations untagged)
- `repro_mad`: write per-question JSONL so a crash never loses the whole run

**Time & budget — measured from Gate 0 (370.8 s/debate; card ~$0.46/hr):**

| Item | GPU time | Wall clock (part-time) | Cost |
| --- | --- | --- | --- |
| Injection protocol build + debug | ~2–4 h | 3–5 days | ~$1–2 |
| Baselines B1–B4 (50 questions each) | ~8–12 h | 3–4 days | ~$4–6 |
| 50-question pilot + κ check | ~5.2 h | 2–3 days | ~$2.4 |
| Month-1 behavioral pilot (25 questions) | ~2.6 h | 2 days | ~$1.2 |
| Setup per fresh instance | ~45–60 min | — | ~$0.5 (free if `inet_down_cost=0`) |
| **Phase total** | **~18–24 h** | **~3–4 weeks** | **~$9–12** |

Assumptions: injection/RAG prompts add ~20–30% over the vanilla 6.2 min/debate; B1/B2 cost ~1/9 of MAD per question; the model cache (~22GB) is re-downloaded per fresh instance, so hosts with free ingress are mandatory. Keep the instance alive only during pilot runs — destroy between sessions.

**Schedule note:** Phase 0 finished 2026-09-16 (environment bring-up ran long vs the July slot). Phase 1 now runs Sep–Oct; Phases 2–5 shift right by roughly six weeks — confirm the revised Month-1 pilot date with the supervisor.

---

## Phase 2 — Core Mechanism & Competitors (Sep–Oct 2026)

**Objective:** trust mechanism, source-partitioned RAG, B5/B6/B9, competitor replication.

**Keypoints:**
- Atomic claim decomposition + `<claim id="cX">` tagging (structured CoT, fallback extraction)
- Source-partitioned retrieval: Agent A→PubMed, B→ArXiv, C→Semantic Scholar + cross-encoder reranker
- Trust update as **pure functions**: `Sᵢ(t+1) = Sᵢ(t) + αVᵢ − βHᵢ → softmax → clamp[0.1,0.9] → renormalize` (exact operator order) + boundedness unit test (thousands of synthetic sequences)
- Full LangGraph debate loop (K=3 rounds, per-agent retry cap 3, injection point)
- Baselines B5–B6 (Self-Consistency, MoA); **B9 (iMAD) reimplementation** — hardest component, ~10 days, sequenced last
- B10 (ConsensAgent): preferred lightweight reimplementation; minimum acceptable = published-numbers comparison + mechanism-differentiation paragraph (mandatory, non-optional)
- **Gate 2:** first CCR/MPR measurement + competitor comparison; if behind schedule use iMAD published numbers for easy-question conditions (Section 11 mitigation)

---

## Phase 2→3 — Mid-Project & Design Freeze (Nov 2026)

**Keypoints:**
- Dry-run of the full matrix on one dataset; results tables with 95% CIs
- Mid-project report; design freeze (trust formula, baseline set, datasets)
- **📌 FYDP-1 defence**

---

## Phase 3a — Main Experiment Matrix (Dec 2026)

**Keypoints:**
- Core conditions (B1–B10 + ours) × primary datasets (BrokenMath, BrokenArXiv, HLE, GPQA, MMLU-Pro) × 3 seeds
- Injection protocol applied to adversarial datasets; compute CCR/MPR/ECR per condition
- **Model-swap smoke test first:** rent A100 ~2 hrs, 20-question run — verify claim tags parse, injection affects all 3, no NaNs, K=3 completes for every model combo
- Deliverable: primary results table

---

## Phase 3b — Ablations & Scaling (Jan 2027)

**Keypoints:**
- 4 ablations: no trust calibration / no progressive retrieval / no source partitioning / no adaptive triggering
- α/β hyperparameter sweep (grid search; CCR <4% variance documented prominently)
- N-scaling N∈{2,3,5} on 100-question subset; V1–V3 validity checks
- Statistical validation: 3 seeds, 95% CI, paired bootstrap, Cohen's d
- **Gate 3:** results freeze with CIs + effect sizes

---

## Phase 4 — Human Eval & Failure Analysis (Feb 2027)

**Keypoints:**
- Human evaluation n=60, Likert + κ-validated (factual grounding, hallucination severity)
- ECR calibration vs ground truth; trust-trajectory figures (Propositions 2–3 empirical checks)
- Failure taxonomy: correlated hallucination, evidence sparsity, trust collapse, adversarial 2-vs-1 consensus
- Buffer month — optional: paraphrase-robustness spot-check, compute-cost-vs-CCR table
- Deliverable: complete ablation + human eval package

---

## Phase 5 — Writing & Submission (Mar–Apr 2027)

**Keypoints:**
- Thesis + paper drafting (target: EMNLP Findings / TMLR; workshop floor)
- Reproducibility package: code, configs, seeds, results, divergence docs (esp. iMAD fidelity)
- Proactive citation-status disclosure (preprint/workshop-tier sources)
- **📌 Submitted paper + FYDP-2 final defence**

---

## Implementation order (do not reorder)

1. vLLM multi-model serving
2. Vanilla MAD reproduction (Gate 0)
3. Injection protocol (§5.4)
4. Month-1 behavioral pilot
5. Claim decomposition + source-partitioned retrieval
6. Trust update function (unit-tested in isolation)
7. Full debate loop (LangGraph)
8. Baselines B1–B4
9. Baselines B5–B6 (parallel-izable with step 10)
10. Baseline B9 (iMAD)
11. Model-swap smoke test on A100 (~$3, 2 hrs)
12. Full experiment matrix
13. Human eval + failure analysis

**Never:** build trust update before retrieval · build B9 before core system (1–7) · run full matrix before Month-1 pilot.

---

## Learning plan (honest)

~30% watching / ~70% building. Per month: learn only what the next build needs, then build it.

| Month | Phase | Effort | Learn only | Build / exit check |
| --- | --- | --- | --- | --- |
| Jul 2026 | Ph 0 | ~15 hr/wk | Transformer/attention/quantization units; structured prompting; vLLM + HF basics | Repo skeleton; one model served; single-agent tagged-claims script; setup.sh |
| Aug 2026 | Ph 1 | ~20 hr/wk | LangGraph StateGraph core (videos 1–6); Du et al. 2023 once | serve.sh (3 instances); MAD loop (Gate 0); injection v1; 50-Q pilot + κ |
| Sep–Oct 2026 | Ph 2 | ~20 hr/wk | 3 retrieval APIs directly; cross-encoder reranking; calibration + trust math | Claim decomposition + source-partitioned RAG; trust pure functions + tests; B5/B6; iMAD (~10 days) |
| Nov 2026 | Ph 2→3 | ~15 hr/wk | Only stats you'll run: bootstrap, McNemar, Cohen's d/κ | Dry-run matrix; results with CIs; mid-report; FYDP-1 |
| Dec–Jan 2027 | Ph 3 | ~20 hr/wk | Nothing new — debugging discipline | Main matrix; ablations; α/β sweep; N∈{2,3,5}; Gate 3 |
| Feb–Apr 2027 | Ph 4–5 | ~15 hr/wk | κ for human eval; venue writing guides | Human eval; failure analysis; thesis + paper + repro package; final defence |

**Anti-waste rules:** no binge-watching (watch the one video, then implement), no full stats/ML courses (6 tests + 4 concepts on demand), skip Python 100 Days entirely, if behind cut Week-3 reranker to overlap score but **never skip Gate 0 or the Month-1 pilot**.

---

## Metrics & success criteria

- **CCR** (Collapse Rate) — primary; target 20–30% reduction vs MAD; "+X% over iMAD" is the headline sentence
- **MPR** (Minority Preservation Rate) — outcome-level complement
- **ECR** (Evidence Calibration Rate) — target >0.80 on HLE (GPQA acceptable substitute)
- **Accuracy** — competitive-or-better on GPQA/MMLU-Pro (no correctness regression)
- Statistical significance: 95% CIs not overlapping zero vs iMAD/MoA/ConsensAgent on adversarial benchmarks
- **Go/No-Go:** if Month-1 pilot shows trust doesn't behaviorally matter → report honestly as a negative result on *when* evidence-grounded trust influences aggregation (still publishable)
