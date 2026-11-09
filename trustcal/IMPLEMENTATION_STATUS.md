# trustcal — implementation status

Status map for the Python pipeline in `trustcal/`. **P0 is released**: gate **13/13**, **615 tests**, tags `p0-gate` = `055a244` and `p0-release` = `7f2c11f`, with `main` and `dev` at the `v0.2.0` release. No efficacy results are claimed. Gate 0 is still the only paid GPU run (vanilla MAD, 10 GPQA debates × 3 rounds on the Dev stack); the 24-row Core matrix has **not** been run. WP-18 is implemented; the 32-row gold-evidence Full config exists.

| Area | Files | Status | Notes |
| --- | --- | --- | --- |
| Config / phase switch | `configs/models.yaml`, `configs/phase.yaml`, `src/trustcal/config.py` | Implemented; Dev GPU-tested; Final pinned and offline-checked | Selection order: `TRUSTCAL_PHASE` > `configs/phase.yaml` > dev. `--phase` on CLIs; `PHASE=` on `setup.sh`/`serve.sh`. The 4-bit matrix stack is 53.26GB on an 80GB A100; the Final precision stack is 73.68GB on a 96GB card. `scripts/check_stack.py` enforces each phase separately (`--phase fourbit` and `--phase final`) with utilization 0.90. |
| Core matrix config | `configs/experiments_fourbit.yaml`, `scripts/run_matrix.py` | Implemented; dry-run verified, execution not started | Four executable conditions — B3, B4-matched, B8-no-trust, B8 — × 3 datasets × 2 seeds = **24 rows**; planned 8,000 debates / 1,067 GPU-h, with a conservative 1,280 GPU-h gate cap. `--dry-run` prints them and writes nothing. `configs/experiments_full.yaml` is the 32-row gold-evidence Full config; 36 rows is the gold-answer alternate. |
| Dataset metadata | `configs/datasets.yaml` | Implemented; revisions pinned | Loader revisions and provenance live here. It is **not** the matrix source: `datasets.yaml` records `seeds: [1, 2, 3]` and `sample_caps.main: 1000` as loader defaults, while `experiments.yaml` is what `run_matrix.py` reads (`seeds: [1, 2]`; caps 400/400/200). Do not change either set without a pre-registration version. |
| Trust math | `src/trustcal/trust/{update,state,aggregation,settings}.py` | Implemented; unit-tested | Operator: logit accumulation → one softmax → floor/ceiling simplex projection; support/harm normalized by `n_claims`. Guarantees `min >= floor`, `sum = 1`, `max <= max(ceiling, 1/N)`; neutral evidence is an identity. 10k-sequence bounds test covers N=1,3,5. |
| Debate loop | `src/trustcal/orchestrator/debate.py`, `src/trustcal/agents/prompts.py` | Implemented; vanilla GPU-tested, trust path mock-tested | Round loop with injection at 1→2, per-agent retrieval/verdicts, trust in revision prompts, final weighted aggregation. The B8 / B8-no-trust prompt split from WP-13 is landed and gate-checked. Plain Python `DebateRunner`; no LangGraph graph yet. |
| Injection | `src/trustcal/orchestrator/injection.py`, `INJECTION_PROTOCOL.md` | Implemented; mock end-to-end tested | Divergence + answer-type filters, fabricated majority consensus, minority targets. Ineligible items are logged with a reason, not fatal. No real-model injection run yet. |
| Retrieval sources | `src/trustcal/retrieval/sources.py`, `src/trustcal/retrieval/pipeline.py` | Implemented; parsers unit-tested, live APIs not | PubMed/arXiv/Semantic Scholar assignment, progressive depth, de-duplication, per-run cache. Retrieval failure is recorded and does not kill the run. No live API calls in the test suite. |
| Reranker / verdicts | `src/trustcal/retrieval/verdicts.py`, `src/trustcal/retrieval/verifier.py` | Partial; lexical default | Default support signal is claim-term coverage; numeric/negation mismatch can mark contradiction. Cross-encoder reranking is lazy/optional; the LLM-judge hook is not passed by `DebateRunner`; `sentence-transformers` is absent from the local venv. |
| Claim decomposition | `src/trustcal/agents/claims.py`, `src/trustcal/agents/parser.py` | Implemented; unit-tested | Tagged `<claim>` extraction plus sentence fallback (Ministral left ~17% untagged in Gate 0); formatting-only lines skipped; answer parser handles a label on the next line. |
| Runner arms | `src/trustcal/runner.py`, `src/trustcal/eval/baselines.py`, `src/trustcal/orchestrator/strategies.py`, `src/trustcal/eval/oracle.py` | Implemented; all arms mock-tested | B1–B10, `pilot`, and `injection` share one record schema; JSONL append + resume skips completed ids. The released matrix runs only the four conditions above. B7 needs `OPENAI_API_KEY`; B9/B10 are approximations (below). `B8-placebo` / `B8-oracle` are **not** implemented. |
| Pilot harness | `src/trustcal/eval/pilot.py`, `scripts/pilot_report.py`, `experiments/pilot-month1/` | Implemented; no frozen set or run | `--arm pilot` compares trust-weighted vs unweighted majority on the same positions, using evidence-side `verdicts` or `evidence`. PASS >=60%, AMBIGUOUS 40–60%, wrong-direction override. Only a template exists. |
| Metrics CCR / MPR / ECR | `src/trustcal/eval/metrics.py`, `scripts/analyze.py`, `src/trustcal/runner.py` | Implemented; unit/mock-tested | CCR (abandoned correct exposed agents) and MPR (gold survives divergent debates) are in every run summary. ECR = 1 − ECE (10 bins) plus Brier is computed by `analyze.py` only when final trust exists. |
| Stats | `src/trustcal/eval/stats.py`, `scripts/run_matrix.py` | Implemented; unit-tested | Percentile and paired bootstrap, Cohen's d, exact McNemar, Holm-Bonferroni. `table.md` includes per-condition mean and 95% bootstrap CI over seeds; paired tests/effect sizes are available but not auto-run. |
| Failure taxonomy | `src/trustcal/eval/failures.py` | Implemented; unit-tested, uncalibrated | Six rule-based labels (adversarial consensus, correlated hallucination, evidence sparsity, minority lost, trust collapse/stagnation) plus `missing_rounds`; counts in the run summary. Rules have not been validated against human labels. |
| P0 gate / stack checks | `scripts/p0_gate.py`, `scripts/check_stack.py`, `scripts/preflight.py` | Released; 13/13 gate, 615 tests | `p0_gate.py` runs the 13 engineering checks. `check_stack.py --phase fourbit` verifies 53.26GB on 80GB; `--phase final` verifies 73.68GB on 96GB; utilization 0.90. Final preflight is `HF_HUB_OFFLINE=1 python scripts/preflight.py --phase final --offline`. The 96 GB hardware smoke has **not** been run. |
| Human-eval tooling | `src/trustcal/eval/{annotation,agreement}.py`, `scripts/annotate.py`, `scripts/human_eval.py` | Implemented; no raters or data | Injection-kappa sheets (30 divergent + 10 control; exit 2 below kappa 0.75) and Phase 4 blinded Likert sheets (n=60, factual grounding + hallucination severity, nominal kappa). `human_eval.py` has no unit tests. |
| Scripts | `setup.sh`, `scripts/*.py`, `scripts/*.sh` | Implemented; gate/CLI-checked, not run on the Final GPU | GPU-only: `setup.sh`, `serve.sh`, `install_vllm.sh`. GPU-free/CLI: `p0_gate`, `check_stack`, `preflight`, `mock_vllm`, `repro_mad`, `run_experiment`, `run_matrix`, `analyze`, `pilot_report`, `annotate`, `human_eval`, `smoke_test`, `verify_env`, `gen_serve_cmds`, `verifier_audit`. |

The six-arm **Full target** is not the released Core matrix. Its **default** is 32 runs with a gold-evidence oracle on EG-SSS (24 core rows + 6 placebo rows + 2 oracle rows), 1,280 GPU-h / $210. The **alternate** is 36 runs with gold-answer trust at 300 items/dataset: 10,800 debates / 1,440 GPU-h / $235. The two are alternatives, not additions. WP-18 is implemented; the v1.3 draft is pending team sign-off.

## Approximations and deviations

- **B9 iMAD** — `DebateGate` is a heuristic: confidence below 0.7, hedge words, or a plausible different alternative triggers debate. It is **not** the trained FocusCal MLP. The `should_debate` interface and logged trigger fields are the swap point.
- **B10 ConsensAgent** — implements the stalled/copying trigger and confidence + consistency aggregation; it does **not** include the fine-tuned GPT-4o prompt optimizer. A `rewriter` hook exists but none is wired; `rewrite_used` is recorded.
- **B7 external-answer ceiling** — calls OpenAI Chat Completions (`gpt-6-luna`; 1.05M-token context, 128K max output) and requires `OPENAI_API_KEY`. The Gemini runtime path is retired. B7 is an optional, appendix-only external-answer ceiling, **not** the B8-oracle arm. It draws three independent samples per question (`OPENAI_ORACLE_SAMPLES=3`) with default reasoning and stores each sample's answer and correctness; the report gives mean single-call accuracy with a question-level bootstrap CI and 3-sample majority accuracy, with ties resolved to the first sample. Each B7 sample omits `temperature` because GPT-6 Luna only supports its default value. Estimated ~$3–9 per 1,000 questions at three samples, recomputed from actual prompt/output tokens. A live 3-sample smoke passed on 9 November 2026 on 2+2 (`B/B/B`); the single-call smoke also passed.
- **B8-placebo / B8-oracle** — implemented under WP-18. `placebo_unit: round_pool` shuffles verdict labels across all agents' claims in a debate round; `oracle_mode: gold_evidence` is the Full default on EG-SSS, with `gold_answer` as the 36-row alternate. Both are validated in the Full config, not the released Core config.
- **LangGraph** — the debate loop is a plain-Python state machine. The planned graph port is meant to wrap the same round functions; no graph module exists and `langgraph` is not installed in the local venv.
- **Reranking / verdicts** — the default scorer is lexical. If `sentence-transformers` is installed, `rerank` lazy-loads `cross-encoder/ms-marco-MiniLM-L-6-v2`; its logits are squashed to [0,1], but support still requires claim-term coverage (relevance is not entailment). The LLM-judge hook exists at `classify_claim` and is not passed by `DebateRunner`.
- **ECR** — implemented as `1 - ECE` between trust and final-answer correctness; it is a calibration proxy, not an independent evidence audit, and has not been measured on real runs.
- **Smoke test coverage** — `scripts/smoke_test.py` supports `dev`, `fourbit`, and `final` phases and B8, injection, placebo, and oracle paths. The 5-question 4-bit smoke is the next hardware step.

## Branches

- `main` — release trunk and deployed frontend; currently at `7b2f29d`.
- `dev` — long-lived development/integration branch; also at `7b2f29d`; `configs/phase.yaml` defaults to dev.
- `next/<slice>` — short-lived work branch from `dev`, in its own worktree; merge into `dev` and delete.
- Only `main` and `dev` are long-lived. The temporary P0 integration branch and `p0/wp-*` slices are retired and deleted; there are no extra worktrees.
- Gate tags: `p0-gate` = `055a244`; release tag `p0-release` = `7f2c11f`.
- Retired phase branches exist only as tags (`phase-1-dev`, `phase-1-main-untested`), not branches.

## Verification

Run from `trustcal/`. These are checks, not an efficacy log.

```bash
pytest

# P0 engineering gate: 13 checks, no pending.
python scripts/p0_gate.py

# Final stack, offline: budget, cache, disk, context, keys.
python scripts/check_stack.py --phase final
HF_HUB_OFFLINE=1 python scripts/preflight.py --phase final --offline

# Core matrix plan: 24 rows, writes nothing.
python scripts/run_matrix.py --dry-run

# Full matrix; 32-row gold-evidence default / 36-row gold-answer alternate.
python scripts/run_matrix.py --config configs/experiments_full.yaml --dry-run

# Mock end-to-end (two shells): start the mock servers...
python scripts/mock_vllm.py --ports 8000,8001,8002 --mode divergent
# ...then run an arm against them.
python scripts/run_experiment.py --arm injection --dataset mock --limit 1 \
  --questions-file experiments/pilot-month1/questions.template.json \
  --out results/mock-check

# Zero-server equivalent; asserts the designed injection-collapse scenario.
pytest src/trustcal/test_integration_mock.py

# Pilot verdict; reports NO DATA until pilot records exist.
python scripts/pilot_report.py --dir results/pilot/gpqa/seed1
# Add --questions-file experiments/pilot-month1/questions.json once frozen.
```

## Before the first paid GPU session

- [ ] `pytest` is green from `trustcal/` and `python scripts/p0_gate.py` exits 0 with 13/13.
- [ ] Final-stack offline checks pass: `check_stack.py --phase final`, then `HF_HUB_OFFLINE=1 python scripts/preflight.py --phase final --offline`.
- [ ] The 4-bit 80 GB smoke runs first: `PHASE=fourbit bash setup.sh`, `verify_env.py --check-servers`, then `smoke_test.py --phase fourbit --limit 5`. The 96 GB FP8 smoke is separate: `PHASE=final bash setup.sh`, then `smoke_test.py --phase final --limit 5`.
- [ ] Mock end-to-end on the exact arm you plan to run; rerun once to confirm resume skips completed ids.
- [ ] `HF_HOME` is pinned and the cache is persisted; copy `results/` off the box before destroy; set `HF_HUB_OFFLINE=1` only when the cache is complete.
- [ ] Phase is selected consistently: `configs/phase.yaml` or `TRUSTCAL_PHASE`, the CLI `--phase`, `PHASE=` for `serve.sh`, and `gen_serve_cmds.py --phase <phase>` all name the same stack.
- [ ] Order discipline holds: 4-bit smoke → pilot → Core matrix → Full matrix; the 96 GB FP8 N1 smoke and precision replication follow the 4-bit pilot/Core. Never run a matrix before the pilot. `run_matrix.py --config configs/experiments_fourbit.yaml --dry-run` must show 24 Core rows before a Core launch.
- [ ] `datasets.yaml` is not mistaken for the matrix: `run_matrix.py` reads `experiments_fourbit.yaml` (`[1, 2]`, caps 400/400/200), not `datasets.yaml` (`[1, 2, 3]`, main 1000).

## Known gaps

- No paid Core or Full matrix run exists; no accuracy, CCR, CMR, or sign-reversal result is claimed.
- The 96 GB Final-stack hardware smoke has not been run. `check_stack.py` and final preflight prove the config/cache budget, not that vLLM loads all three checkpoints together.
- `configs/experiments_full.yaml`, `placebo_mode`, and `oracle_mode` are present; the v1.3 amendment must be signed before any Full run.
- `smoke_test.py` supports B8, injection, B8-placebo, and B8-oracle across dev/fourbit/final phases.
- `experiments/pilot-month1/questions.json` is absent; two labelers must author and freeze 25 questions before `--arm pilot` (the template is not a usable set).
- B9/B10 fidelity; B7 needs `OPENAI_API_KEY`; the Final 96GB stack and its `quant: auto` checkpoints have not been smoke-tested.
- Dataset loaders: all five are normalized through one adapter, but only GPQA's columns are covered by a real download; BrokenMath/BrokenArXiv/HLE/MMLU-Pro key mappings are unit-tested synthetically and must be checked against the live releases before the matrix.
- LangGraph port absent; retrieval default is lexical; the cross-encoder/LLM judge is not installed or wired; live PubMed/arXiv/S2 calls are unmeasured.
- Human evaluation needs two raters and real records; `human_eval.py` has no tests; its kappa treats Likert labels as nominal, not ordinal.
- Matrix table reports seed-level point estimates plus 95% bootstrap CIs; paired significance tests (McNemar/paired bootstrap) exist but are not wired into an automatic comparison table.
- `datasets.yaml` and `experiments.yaml` deliberately differ on seeds and caps (loader metadata vs matrix source). The mismatch is documented, not a bug, but editing one without the other will desynchronize the gate from a real run.
