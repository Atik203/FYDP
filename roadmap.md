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

## Phase 0 — Foundation (Jul 2026)

**Objective:** literature freeze, environment setup, reproduce vanilla MAD.

**Status: code part complete** (pushed to main) — `trustcal/` package with `setup.sh`, `configs/`, `src/trustcal/{config,inference,agents,retrieval,trust,orchestrator,eval}`, `scripts/{serve.sh,repro_mad.py,smoke_test.py,verify_env.py}`, `references.bib` (25 entries), trust math + boundedness tests passing. **Pre-flight pass 2026-09-16:** serve commands are generated from `models.yaml` (no drift), Gate 0 writes `results/gate0/` logs, debate loop has a GPU-free contract test, nightly-vLLM requirement documented, 4 core citations verified against AAAI/ACL/ICLR. Remaining Phase 0 work is manual — checklist below.

**Keypoints:**
- vLLM multi-model serving: all 3 Dev models load + generate correctly on the A6000 before any orchestration code
- LangGraph StateGraph core only (videos 1–6, not the whole library)
- **Gate 0:** vanilla MAD reproduction (Du et al. 2023) on a GPQA slice — base debate loop works independent of our contributions
- Apply for HLE access now (approval lead time), freeze dataset snapshots
- Deliverables: `references.bib`, working serve.sh, MAD reproduction script, Month-1 pilot design finalized

### Phase 0 — Manual checklist (do these on the GPU instance)

- [ ] **Rent the GPU instance** — **RTX A6000 48GB**, ~$0.35–0.53/hr. Three verified options:
  - **Vast.ai** (marketplace; **selected for Phase 0** — host-dependent quality). Filter: CUDA ≥ 12.4, disk bandwidth ≥ 500 MB/s, inet ≥ 500 Mbps, reliability ≥ 95%, on-demand. **Set Disk Space to 100GB at creation** (fixed, not resizable; base image + deps + 31GB checkpoints). Skip Volumes (local to one physical machine). Setup: `HF_TOKEN=hf_... VENV=1 bash setup.sh` — Vast PyTorch images block system pip (PEP 668). Container disk is **billed while stopped and deleted on destroy** — copy `results/` out and push before destroying; `setup.sh` re-runs in ~30–40 min.
  - **Thunder Compute** (access granted; ~$0.43/hr at 8 vCPU / 64GB RAM / 100GB included disk, per-minute billing, CUDA 13.0 / driver 580). Setup: `HF_TOKEN=hf_... VENV=1 bash setup.sh` (venv per Thunder's "do not touch CUDA" rule). **No native stop:** snapshot → delete instance → restore later; restore takes ~8 min/100GB, and snapshots are not durability-guaranteed — copy `results/` out first.
  - **RunPod** (fallback): template `RunPod PyTorch 2.x`, 100GB network volume; stop (not terminate) when idle.
- [ ] **Clone the repo on the instance** — RunPod: Connect → Terminal; Thunder: SSH/VS Code Remote (see their VS Code extension). Then:
  `git clone https://github.com/Atik203/FYDP.git /workspace/fydp && cd /workspace/fydp/trustcal` (on Thunder use `$HOME/fydp` — there is no `/workspace`).
- [ ] **Run the one-command setup** — `HF_TOKEN=hf_... bash setup.sh` (add `VENV=1` on Thunder Compute and on any PEP 668 / externally-managed image, e.g. Vast PyTorch). Installs pinned Python deps + **nightly vLLM** (stable cannot load `gemma4_unified`, i.e. Gemma 4 12B; the wheel index auto-detects from the driver), downloads the 3 **quantized** Dev checkpoints (~31GB) to `HF_HOME` (home dir on Thunder, `/workspace` on RunPod/Vast), starts vLLM on ports 8000–8002, and runs the environment verification. Expected finish: `setup.sh complete — vLLM on :8000-8002`.
- [ ] **Confirm the health check passed** — `python scripts/verify_env.py --check-servers` should print `server OK` for ports 8000/8001/8002 and version lines for openai/numpy/datasets/vllm. If a model fails: `results/logs/vllm-<port>.log`, then re-run `bash scripts/serve.sh` (OOM ⇒ lower `--gpu-memory-utilization` in `configs/models.yaml`).
- [x] **HLE access** — approved (with GPQA access) **2026-09-16**; GPQA terms accepted on the same account. Record the approval emails in the meeting notes. Fallback if either is revoked: GPQA-Diamond subset (pre-approved in §8).
- [ ] **Freeze dataset snapshots** — confirm the BrokenArXiv monthly snapshot range **0226–0526** is recorded in `configs/datasets.yaml` (already there) and note the exact snapshot URLs in `references.bib`/notes so results cite the exact version.
- [ ] **Run Gate 0 (vanilla MAD reproduction)** — `python scripts/repro_mad.py --limit 10`. Expected: 3 agents answer the same question, 3 rounds, positions print. Gate 0 = the loop completes and produces coherent per-agent answers.
- [ ] **Learn LangGraph core** — CampusX Agentic AI playlist **videos 1–6 only** (StateGraph, nodes/edges, conditional edges, memory), then `pip show langgraph` to confirm the installed version matches the tutorial.
- [x] **Finalize the Month-1 pilot Go/No-Go criterion** — written **2026-09-16** in `trustcal/PILOT_CRITERION.md` (PASS ≥15/25 = ≥60% of evidence-contradicts-majority questions; 10–14 ambiguous → second seed; <10 No-Go → report negative result per blueprint §18.6).
- [x] **Verify references.bib** — `trustcal/references.bib` copied from `FYDP_Summer/fydp.bib` (25 entries); spot-checked **2026-09-16**: iMAD (AAAI 40(35):29403–29411, DOI 10.1609/aaai.v40i35.40181) · MoA (ICLR 2025 proceedings, URL resolves) · ConsensAgent (Findings ACL 2025:22112–22133, DOI 10.18653/v1/2025.findings-acl.1141) · DebUnc (Findings EMNLP 2025:23299–23315, DOI 10.18653/v1/2025.findings-emnlp.1265) — all match the primary sources.

### Phase 0 — Done criteria

- [ ] All checkboxes above ticked + Gate 0 reproduction log saved under `trustcal/results/gate0/` (folder is gitignored by design).

---

## Phase 1 — Injection Protocol & First Baselines (Aug 2026)

**Objective:** injection protocol, baselines B1–B4, Proposition 1 proof, Month-1 pilot.

**Keypoints:**
- Implement §5.4 injection steps 1–6 (fabricated wrong "expert consensus" pressure at t=1→2)
- Baselines B1–B4 (Single-Agent CoT, Single-Agent+RAG, MAD, MAD+RAG)
- 50-question pilot + κ check (κ > 0.75 target) on the injection protocol
- **Month-1 behavioral-effectiveness pilot:** ~20–30 toy questions — confirm trust weight *causally* shifts aggregation output before full build (highest-risk assumption; do not skip)
- **Gate 1 (Go/No-Go):** protocol validated, baseline CCR ≥ 0.30 confirmed, pilot verdict recorded (explicit Go/No-Go criterion fixed before Phase 0 ends)

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
