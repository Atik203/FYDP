# 00 — Start Here

**Status date:** 9 November 2026. **P0 engineering is released.** `main` = `dev` = `2ae56a3`; tags `p0-gate` = `055a244` and `p0-release` = `7f2c11f`.

**Project title:** *The Boundaries of Evidence-Grounded Trust in Multi-Agent Scientific Debate, with a Controlled Benchmark for Sycophantic Consensus.*

> **TL;DR for an agent**
> - P0 is **released**, not proposed: 13/13 gate checks, 514 tests, both manuscripts compile with 0 errors/undefined refs. There are **no efficacy results**.
> - Read `roadmap.md` for the current order of work. `06_AGENT_CHECKLIST.md` is historical plus a short post-P0 checklist.
> - Next: **N1** final-stack 96 GB smoke (not run) → **N2** WP-18 placebo/oracle → **N3** 24-item benchmark calibration → **N4** verifier audit → **N5** pilot/G2.
> - Do **not** run the Core matrix before the pilot passes G2.
> - **Core v1.0:** 4 conditions (B3, B4-matched, B8-no-trust, B8) × 3 datasets (`gpqa_main`, `mmlu_pro`, `hle`) × 2 seeds = **24 runs**. Planned 8,000 debates ≈ **1,067 GPU-h**; conservative gate cap **1,280 GPU-h**. EG-SSS is **not** in Core v1.0.
> - **Full target:** 6 arms × 3 datasets × 2 seeds = **36 runs** if B8-oracle uses gold-answer trust, 300 items/dataset = 10,800 debates / **1,440 GPU-h envelope**. If B8-oracle is gold-evidence-only on EG-SSS, the target is **32 runs** and must be recomputed. **WP-18 freezes it.**
> - The **verification ceiling** is a derived hypothesis, not a proved theorem.
> - **BrokenMath/BrokenArXiv are appendix-only** (official splits are proof-only; answer-type retention 0%). Use **GPQA-Main + MMLU-Pro STEM + HLE** in Core v1.0; **EG-SSS 180** joins at the v1.2 benchmark freeze.

---

## 1. The project in one paragraph

Three heterogeneous LLM agents answer a hard scientific question, debate for up to three rounds, and revise. Each answer is split into claims; each claim is checked against retrieved scientific evidence (PubMed, arXiv, Semantic Scholar). Each agent has a bounded trust weight that rises when its claims are supported and falls when they are contradicted. The final answer is a trust-weighted vote, not a majority vote. The target failure is **sycophantic collapse**: a correct minority abandons its answer under pressure from a confident wrong majority. Evaluation uses a **fabricated-consensus injection** plus accuracy / CMR / trust AUROC / calibration.

**Current reality (9 Nov 2026):** P0 engineering is released and the instrument is wired. The verifier is not yet human-audited; the final-stack 96 GB smoke has not run; no paid experiment beyond Gate 0 exists. Gate 0 (vanilla MAD, 10 GPQA debates) is the only real GPU evidence.

---

## 2. Stage names and current scope

Use `docs/GLOSSARY.md` everywhere. The current names are **Core run** and **Full run**. **TACL is a venue only.** The retired labels are recorded once in the historical diagnosis note in §3.

| Stage | Scope | Cost |
|---|---|---:|
| **Pilot run (N5/G2)** | ~100–150 questions; Dev stack; B3, B8-no-trust, B8; injection on/off; trust on/off | ~112 GPU-h; $50–100 |
| **Core run (G3)** | 4 conditions (B3, B4-matched, B8-no-trust, B8) × 3 datasets (`gpqa_main` 400, `mmlu_pro` 400, `hle` 200) × 2 seeds = **24 runs**; 8,000 debates; 180-item EG-SSS is **not** in v1.0 | ~1,067 GPU-h planned; **1,280 cap**; $420–580 |
| **Full run (G4/G5)** | 6 arms × 3 datasets × 2 seeds = **36 runs** *if* B8-oracle uses gold-answer trust at 300 items/dataset: 10,800 debates / **1,440 envelope**. If B8-oracle is gold-evidence-only on EG-SSS: **32 runs** and recompute. WP-18 freezes it. | $900–1,200 envelope |
| **Law-testing (N9)** | q/ρ sweeps, granularity, shared-error floor, robustness | $1,400–1,900 only if the effect is real |

**Hard stop: $1,350 before law-testing.** **EG-SSS ladder:** 24 calibration → 180 v1.2 floor → 300 Full target → 600 stretch → 800 no-go. The 180-item set joins at the benchmark freeze under v1.2, not in the v1.0 Core matrix.

### Historical score projections (8 November 2026)

> **Historical.** These are working estimates from the 8 Nov 2026 audit, not current status and not acceptance probabilities. "After P0" was an engineering projection; P0 is now released but no efficacy result exists.

| Factor | 8F weight | 7F weight | Then current | After P0 | Core run | Full run | 9+ tail |
|---|---:|---:|---:|---:|---:|---:|---:|
| Novelty | 25% | 26.3% | 4.5 | 4.5 | 7.0 | 7.5 | 8.5 |
| Method | 20% | 21.1% | 7.0 | 7.5 | 8.0 | 8.5 | 8.5 |
| Math | 15% | 15.8% | 5.0 | 6.5 | 7.5 | 7.5 | 8.0 |
| Experiments | 10% | 10.5% | 5.5 | 6.5 | 8.0 | 8.5 | 8.5 |
| Dataset | 10% | 10.5% | 4.5 | 7.0 | 7.5 | 8.0 | 9.0 |
| Q1 fit | 10% | 10.5% | 5.5 | 5.5 | 7.5 | 8.0 | 8.5 |
| Feasibility | 5% | 5.3% | 6.5 | 8.0 | 7.5 | 7.0 | 6.5 |
| Compute | 5% | — | N/A | N/A | N/A | N/A | N/A |
| **Core** | | | **5.50** | **6.25** | **7.63** | **8.00** | **8.38** |
| **Weighted** | | | **5.42** | **6.21** | **7.53** | **7.89** | **8.37** |

**Why novelty dropped from 6.0 to 4.5:** the 2026 prior-art audit found that **R²-MAD (Findings EMNLP 2026)** already does retrieval → per-agent reliability → influence reweighting for wrong-majority correction, and **TERA-RAG (IEEE JCSSE 2026)** already produces a reliability-weighted consensus from external evidence. **"To Trust or Not to Trust" (ACL 2026 main)** already does agent-level numeric trust under malicious inputs. The exact five-way combination is unclaimed, but the mechanism is an integration of published parts. The defensible gap is the **controlled benchmark + causal/verification-ceiling analysis**, not the mechanism. See `04_LITERATURE_AND_GAPS.md`.

---

## 3. Pre-P0 warnings — historical diagnosis, now fixed unless marked

> **Historical (8 November 2026).** This list is the diagnosis that drove P0. Status labels describe the 9 Nov 2026 release: most are fixed; the verifier's **human** audit is still pending as N4. **Historical naming:** the retired stage labels were `C+` and `TACL full`; use Core run and Full run.

1. **GPQA/MMLU-Pro choices are never inserted into the prompts.** — **Fixed (P0-0).** Options are rendered with a seeded permutation and stored in the record.
2. **The answer matcher takes the first number anywhere in the text.** — **Fixed (P0-1).** Answer-span parser + scorer with a 50-case corpus.
3. **The injection arm has no retrieval and no trust update.** — **Fixed (P0-3/P0-9).** B8 × injection × trust is wired; the 2×2 is executable.
4. **B8 without injection has `consensus=None`, so `exposed=[]` and CCR=0.** — **Fixed.** B8 + injection produces `consensus`, `targets`, and `exposed`.
5. **`evidence_introduced` is never set by the runner.** — **Fixed.** Record schema v2; the runner computes it.
6. **MPR uses the unweighted majority, not the trust-weighted answer.** — **Fixed.** MPR-weighted scores the actual aggregation.
7. **There is no final-answer accuracy anywhere.** — **Fixed.** `final_answer`, `final_answer_correct`, accuracy, and CIs are in `summary.json`.
8. **ECR is anti-correlated with correctness.** — **Fixed by deprecation.** Use trust AUROC/Brier; do not use ECR.
9. **The bounded-trust claim is false.** — **Fixed (P0-5).** Simplex projection with floor/ceiling; 10k-input tests.
10. **Final trust lags final positions.** — **Fixed.** Trust is computed from final positions and stored as `trust_for_positions`.
11. **The verifier is lexical overlap, not entailment.** — **Partially fixed.** A verifier interface and audit harness exist; the default is still lexical. Synthetic audit: **0.58 balanced accuracy**. Human audit is **N4, pending** (target ≥0.75, κ ≥0.60).
12. **B8 vs B4 is confounded.** — **Fixed for the Core comparison.** B8-no-trust is the primary control; B4-matched uses the same partition/prompt.
13. **The trust line is present even when trust is disabled.** — **Fixed (historical WP-13).** The trust line is removed for `use_trust=False`; B8 vs B8-no-trust differs only in the trust line.
14. **B9/B10/B6 are approximations and unmatched.** — **Partially fixed.** Fidelity labels and compute logging exist; the baselines remain approximations. Do not claim "+X% over iMAD."
15. **The matrix is ~30,000 GPU-hours.** — **Fixed.** Core is 24 runs / 1,280 GPU-h cap; Full is conditional at 1,440 GPU-h envelope.
16. **`main` is 10 commits behind a feature branch.** — **Fixed.** `main` = `dev` = `2ae56a3`; feature branches are deleted.
17. **BrokenMath and BrokenArXiv are proof-only.** — **Fixed by exclusion.** They are appendix-only; 0% answer-type retention.
18. **Source-by-agent assignment is a fatal confound.** — **Fixed.** Routing is by claim domain; the agent→source mapping is removed from the primary design.
19. **Loader bugs make the current numbers uninterpretable.** — **Fixed.** `gold_answer`, `answer_type`, splits, pinned revisions, and stratified sampling are in P0.

---

## 4. What is actually strong

- Modular, readable codebase: inference, agents, retrieval, trust, orchestrator, eval, stats.
- **523 tests** (514 at the P0 release) and a mock vLLM end-to-end path; 13/13 P0 gate checks.
- Gate 0: 10/10 debates, 90/90 non-empty positions, 370.8 s/debate.
- Resumable JSONL, manifest/resume refusal, preflight, annotation tooling, human-eval tooling.
- Two compiled manuscripts: 61-page report and 17-page journal, 0 errors/undefined refs.
- A pinned final stack that fits in 69.73 GB (offline check only; hardware smoke pending).
- Real problem, real application, six-person team, 7–8 months.
- The system is a strong thesis artifact even before the paper is strong.

---

## 5. Repository map

```text
E:\FYDP\
├── trustcal\                 # Python pipeline (source of truth for what runs)
│   ├── configs\              # models.yaml, datasets.yaml, experiments.yaml, phase.yaml
│   ├── src\trustcal\
│   │   ├── inference\        # OpenAI-compatible vLLM client
│   │   ├── agents\           # prompts, claim parser, fallback extraction
│   │   ├── orchestrator\     # debate loop, injection, B1–B10 strategies
│   │   ├── retrieval\        # PubMed/arXiv/S2 clients, pipeline, verifier
│   │   ├── trust\            # update, state, aggregation, settings
│   │   ├── eval\             # datasets, options, answers, metrics, stats, oracle
│   │   └── runner.py         # resumable experiment runner
│   ├── scripts\              # run_experiment, run_matrix, analyze, preflight, check_stack, smoke
│   └── experiments\          # pilot templates
├── experiments\              # gate0 report + p0 work-package records
├── docs\
│   ├── blueprint.md          # historical design doc (not evidence)
│   ├── agent\                # these docs
│   └── FYDP1_defence_Q&A.md  # check status notes before the defence
├── FYDP_Summer\              # 61-page report (compiled; engineering report)
├── Papev_Summer26_6\         # 17-page journal manuscript (compiled; engineering report)
├── literature_review\        # paper reviews + index
├── UPDATE-CHECKLIST.md       # team-facing one-pager
├── PRE_REGISTRATION.md       # v1.0 + v1.1 erratum (released hash bc9c7b...)
├── roadmap.md                # current order of work and gates
└── docs\agent\08_COMPUTE_COST.md  # Vast.ai price snapshot + budget caps
```

**Branch model:** `main` (release trunk; frontend deploys), `dev` (integration), `next/<slice>` (short-lived, one worktree, deleted after merge). No long-lived feature branches. Only `E:\FYDP` exists.

---

## 6. Commands you will use

Run from `E:\FYDP\trustcal` unless stated otherwise.

```bash
# 1. Tests (GPU-free)
pytest

# 2. Matrix plan only — writes nothing; expect 24 Core rows
python scripts/run_matrix.py --dry-run

# 3. Mock end-to-end (two shells)
python scripts/mock_vllm.py --ports 8000,8001,8002 --mode divergent
python scripts/run_experiment.py --arm B8 --dataset mock --limit 1 \
  --questions-file experiments/pilot-month1/questions.template.json \
  --out results/mock-check

# 4. Zero-server integration test
pytest src/trustcal/test_integration_mock.py

# 5. Final-stack readiness (on the 96 GB GPU; smoke NOT run yet)
PHASE=final bash setup.sh
python scripts/verify_env.py --check-servers
python scripts/check_stack.py --phase final
HF_HUB_OFFLINE=1 python scripts/preflight.py --phase final --offline
python scripts/smoke_test.py --phase final --limit 20

# 6. Real experiment (only after G2 and a GPU)
python scripts/run_experiment.py --arm B8 --dataset gpqa_main --limit 20 --seed 1 --inject
python scripts/analyze.py --records results/B8/gpqa_main/seed1/records.jsonl

# 7. Branch/status (from repo root)
git status --short
git log --oneline -5
git branch -vv
```

**Do not run** `python scripts/run_matrix.py` for real until the pilot passes G2 and **WP-18** has frozen the Full definition.

---

## 7. Reading order for a new agent

1. This file.
2. `roadmap.md` — current order of work and gates.
3. `01_CURRENT_STATE.md` — what is implemented vs pending.
4. `03_EXPERIMENT_PLAN.md` — the design you must not break.
5. `04_LITERATURE_AND_GAPS.md` — historical prior art and the claims you may not make.
6. `05_WRITING_AND_VENUE.md` — only if editing the paper/thesis.
7. `06_AGENT_CHECKLIST.md` — historical P0 board; use its short post-P0 checklist.
8. `08_COMPUTE_COST.md` — Vast.ai price snapshot, budget caps, hard stop.

**Team one-pager:** `..\..\UPDATE-CHECKLIST.md` — share this with the whole team.

---

## 8. Handoff format (use for every task)

```markdown
## Task
<one line>

## Files changed
- path:line — what changed

## Commands run
```bash
<exact command>
```

## Results
<exact output / test counts / metrics>

## Acceptance check
- [ ] criterion 1
- [ ] criterion 2

## Open risks
<what could still be wrong>

## Next step
<one concrete next action>
```

Never report "done" without a command and its output. If a test fails, report the failure and the file:line; do not paper over it.
