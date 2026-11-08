# trustcal — implementation status

Honest status map for the Python pipeline in `trustcal/`. `roadmap.md` remains the plan and schedule; this file records what exists, how far it has been exercised, and where an implementation is an approximation. **Phase 0 Gate 0 is the only path that has run on real GPUs** (vanilla MAD, 10 GPQA debates x 3 rounds on the Dev stack). Everything built for Phase 1-2 — injection, evidence retrieval, trust updates, the B1-B10 runner, pilot/matrix analysis, and human-eval tooling — is GPU-free unit/mock tested or CLI smoke-checked; no paid run has exercised those paths yet. No experimental results are claimed here.

| Area | Files | Status | Notes |
| --- | --- | --- | --- |
| Config / phase switch | `configs/models.yaml`, `configs/phase.yaml`, `src/trustcal/config.py` | Implemented; Dev GPU-tested, Final not | Selection order: `TRUSTCAL_PHASE` > `configs/phase.yaml` > dev. `--phase` on CLIs; `PHASE=` on `serve.sh`. Final checkpoints are placeholders (`quant: auto`) until design freeze. |
| Trust math | `src/trustcal/trust/{update,state,aggregation,settings}.py` | Implemented; unit-tested | Fixed operator order: softmax -> clamp[0.1,0.9] -> renormalize; defaults alpha=0.5, beta=0.3. `TrustState` logs the full trajectory; a 5k-sequence boundedness test covers Proposition 1. |
| Debate loop | `src/trustcal/orchestrator/debate.py`, `src/trustcal/agents/prompts.py` | Implemented; vanilla GPU-tested, trust path mock-tested | Round loop with injection at 1->2, per-agent retrieval/verdicts, trust in revision prompts, final weighted aggregation. Plain Python `DebateRunner`; no LangGraph graph yet. |
| Injection | `src/trustcal/orchestrator/injection.py`, `INJECTION_PROTOCOL.md` | Implemented; mock end-to-end tested | Divergence + answer-type filters, fabricated majority consensus, minority targets. Ineligible items are logged with a reason, not fatal. No real-model injection run yet. |
| Retrieval sources | `src/trustcal/retrieval/sources.py`, `src/trustcal/retrieval/pipeline.py` | Implemented; parsers unit-tested, live APIs not | PubMed/arXiv/Semantic Scholar assignment, progressive depth, de-duplication, per-run cache. Retrieval failure is recorded and does not kill the run. No live API calls in the test suite. |
| Reranker / verdicts | `src/trustcal/retrieval/verdicts.py` | Partial; lexical default | Default support signal is claim-term coverage; numeric/negation mismatch can mark contradiction. Cross-encoder reranking is lazy/optional; the LLM-judge hook is not passed by `DebateRunner`; `sentence-transformers` is absent from the local venv. |
| Claim decomposition | `src/trustcal/agents/claims.py`, `src/trustcal/agents/parser.py` | Implemented; unit-tested | Tagged `<claim>` extraction plus sentence fallback (Ministral left ~17% untagged in Gate 0); formatting-only lines skipped; answer parser handles a label on the next line. |
| Runner B1-B10 | `src/trustcal/runner.py`, `src/trustcal/eval/baselines.py`, `src/trustcal/orchestrator/strategies.py`, `src/trustcal/eval/oracle.py` | Implemented; all arms mock-tested | B1-B10, `pilot`, and `injection` share one record schema; JSONL append + resume skips completed ids. B7 needs `GEMINI_API_KEY`; B9/B10 are approximations (below). |
| Pilot harness | `src/trustcal/eval/pilot.py`, `scripts/pilot_report.py`, `experiments/pilot-month1/` | Implemented; no frozen set or run | `--arm pilot` compares trust-weighted vs unweighted majority on the same positions, using evidence-side `verdicts` or `evidence`. PASS >=60%, AMBIGUOUS 40-60%, wrong-direction override. Only a template exists. |
| Metrics CCR / MPR / ECR | `src/trustcal/eval/metrics.py`, `scripts/analyze.py`, `src/trustcal/runner.py` | Implemented; unit/mock-tested | CCR (abandoned correct exposed agents) and MPR (gold survives divergent debates) are in every run summary. ECR = 1 - ECE (10 bins) plus Brier is computed by `analyze.py` only when final trust exists. |
| Stats | `src/trustcal/eval/stats.py`, `scripts/run_matrix.py` | Implemented; unit-tested | Percentile and paired bootstrap, Cohen's d, exact McNemar, Holm-Bonferroni. `table.md` now includes per-condition mean and 95% bootstrap CI over seeds; paired tests/effect sizes are available but not auto-run. |
| Failure taxonomy | `src/trustcal/eval/failures.py` | Implemented; unit-tested, uncalibrated | Six rule-based labels (adversarial consensus, correlated hallucination, evidence sparsity, minority lost, trust collapse/stagnation) plus `missing_rounds`; counts in the run summary. Rules have not been validated against human labels. |
| Matrix tooling | `configs/experiments.yaml`, `scripts/run_matrix.py` | Implemented; dry-run verified, execution pending | Defines B1-B10 + injection + four B8 ablation conditions x 5 datasets x 3 seeds; `--dry-run` prints the plan and writes nothing; real rows isolate failures and write `summary.json`/`table.md`. The Month-1 pilot is standalone (frozen questions file), not a matrix row. Only the GPQA loader has a live download; the other four are normalized but untested against HF. |
| Human-eval tooling | `src/trustcal/eval/{annotation,agreement}.py`, `scripts/annotate.py`, `scripts/human_eval.py` | Implemented; no raters or data | Injection-kappa sheets (30 divergent + 10 control; exit 2 below kappa 0.75) and Phase 4 blinded Likert sheets (n=60, factual grounding + hallucination severity, nominal kappa). `human_eval.py` has no unit tests. |
| Scripts | `setup.sh`, `scripts/*.py`, `scripts/*.sh` | Implemented; smoke test CLI-checked, not run on GPU | GPU-only: `setup.sh`, `serve.sh`, `install_vllm.sh`. GPU-free/CLI: `preflight`, `mock_vllm`, `repro_mad`, `run_experiment`, `run_matrix`, `analyze`, `pilot_report`, `annotate`, `human_eval`, `smoke_test`, `verify_env`, `gen_serve_cmds`. |

## Approximations and deviations

- **B9 iMAD** — `DebateGate` is a heuristic: confidence below 0.7, hedge words, or a plausible different alternative triggers debate. It is **not** the trained FocusCal MLP. The `should_debate` interface and logged trigger fields are the swap point.
- **B10 ConsensAgent** — implements the stalled/copying trigger and confidence + consistency aggregation; it does **not** include the fine-tuned GPT-4o prompt optimizer. A `rewriter` hook exists but none is wired; `rewrite_used` is recorded.
- **B7 oracle** — calls Gemini REST (`gemini-3.1-pro-preview`) and requires `GEMINI_API_KEY`. There is no OpenAI fallback in code even though `.env.example` lists `OPENAI_API_KEY`.
- **LangGraph** — the debate loop is a plain-Python state machine. The planned graph port is meant to wrap the same round functions; no graph module exists and `langgraph` is not installed in the local venv.
- **Reranking / verdicts** — the default scorer is lexical. If `sentence-transformers` is installed, `rerank` lazy-loads `cross-encoder/ms-marco-MiniLM-L-6-v2`; its logits are squashed to [0,1], but support still requires claim-term coverage (relevance is not entailment). The LLM-judge hook exists at `classify_claim` and is not passed by `DebateRunner`.
- **ECR** — implemented as `1 - ECE` between trust and final-answer correctness; it is a calibration proxy, not an independent evidence audit, and has not been measured on real runs.

## Verification

Run from `trustcal/`. These are checks, not a result log; no pass/fail numbers are recorded here.

```bash
pytest

# Mock end-to-end (two shells): start the mock servers...
python scripts/mock_vllm.py --ports 8000,8001,8002 --mode divergent
# ...then run an arm against them.
python scripts/run_experiment.py --arm injection --dataset mock --limit 1 \
  --questions-file experiments/pilot-month1/questions.template.json \
  --out results/mock-check

# Zero-server equivalent; asserts the designed injection-collapse scenario.
pytest src/trustcal/test_integration_mock.py

# Matrix plan; prints rows and writes nothing.
python scripts/run_matrix.py --dry-run

# Pilot verdict; reports NO DATA until pilot records exist.
python scripts/pilot_report.py --dir results/pilot/gpqa/seed1
# Add --questions-file experiments/pilot-month1/questions.json once frozen.

# On the GPU box, after the cache is complete.
python scripts/preflight.py --offline
```

## Before the first paid GPU session

- [ ] `pytest` is green from `trustcal/`.
- [ ] Mock end-to-end on the exact arm you plan to run; rerun once to confirm resume skips completed ids.
- [ ] `python scripts/preflight.py` passes (servers, cache, disk, context, `HF_TOKEN`); use `--offline` only after the cache is complete.
- [ ] `HF_HOME` is pinned and the cache is persisted; copy `results/` off the box before destroy; set `HF_HUB_OFFLINE=1` only when complete.
- [ ] Phase is selected consistently: `configs/phase.yaml` or `TRUSTCAL_PHASE`, the CLI `--phase`, `PHASE=` for `serve.sh`, and `gen_serve_cmds.py --phase <phase>` all name the same stack.
- [ ] Order discipline holds: injection -> pilot -> trust/matrix; never run the matrix before the pilot. Use `run_matrix.py --dry-run` before a real matrix launch.

## Known gaps

- Only Gate 0 vanilla MAD has real GPU evidence. No paid run has exercised injection, retrieval, trust updates, B1-B10, the pilot, or the matrix.
- `experiments/pilot-month1/questions.json` is absent; two labelers must author and freeze 25 questions before `--arm pilot` (the template is not a usable set).
- B9/B10 fidelity; B7 needs `GEMINI_API_KEY`; the Final 96GB stack and its `quant: auto` checkpoints have not been smoke-tested.
- Dataset loaders: all five are normalized through one adapter, but only GPQA's columns are covered by a real download; BrokenMath/BrokenArXiv/HLE/MMLU-Pro key mappings are unit-tested synthetically and must be checked against the live releases before the matrix.
- LangGraph port absent; retrieval default is lexical; the cross-encoder/LLM judge is not installed or wired; live PubMed/arXiv/S2 calls are unmeasured.
- Human evaluation needs two raters and real records; `human_eval.py` has no tests; its kappa treats Likert labels as nominal, not ordinal.
- Matrix table reports seed-level point estimates plus 95% bootstrap CIs; paired significance tests (McNemar/paired bootstrap) exist but are not wired into an automatic comparison table. The pilot is standalone by design (`run_experiment.py --arm pilot --questions-file ...`), not a matrix condition.
- `scripts/smoke_test.py` implements the checks but has not been run on a GPU stack.
