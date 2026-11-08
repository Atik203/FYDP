# WP-04b — Runner wiring: records, manifest, accuracy, provenance

**P0s:** P0-2 (final-answer fields), P0-3 (B8 × injection), P0-5 handoff (trust fields), P0-11 (manifest / resume / eligible n / routes).
**Wave:** 2. `runner.py` lease held by B. Debate, prompts, metrics, and verifier were not edited.

## Delivered

| Area | Change |
| --- | --- |
| Manifest | `run()` builds `run_manifest.json` after questions load, calls `check_resume`, writes it, and keeps `run_hash = manifest_hash(manifest)`. `_run_config_dict` folds every results-affecting switch into the hash (`arm`, `dataset`, `limit`, `seed`, effective `rounds`, `temperature`, `phase`, `alpha`, `beta`, trust/retrieval ablations, `inject`, `injection_scope`, `samples`, `layers`, `agents`, `sample_seed`, question-file name). |
| Resume | `check_resume` refuses a changed manifest; `_check_record_hashes` refuses to resume a directory whose records were stamped by another manifest (including pre-manifest records with `manifest_hash: null`). |
| Record stamping | `manifest_hash` on B1/B3/B7/pilot/injection (and every debate arm). Records are schema-v2 validated **before** `_append_record`; a violation raises with the question id and the full error list, so a bad line is never written. |
| Final answer | `final_answer` is the parsed winner of the arm's own `aggregation` (never a recomputed majority), `final_answer_correct` from `score_answer(..., rendered)`, source `single` (B1), `oracle` (B7), `weighted` only when trust was updated from evidence, else `majority`. Pilot reports its trust-weighted pilot aggregation. |
| Trust fields | `trust_for_positions` and `trust_status` are copied from the debate result (C's WP-03b); `trust_for_positions` is exactly the vector handed to `aggregate`. `final_trust` is kept for older callers. |
| Evidence | `_RetrieverProbe` wraps the retriever for B2/B4/B8 and records whether any passage reached an agent, so `evidence_introduced` is observed rather than guessed from the arm name. |
| eligible n | `load_questions` passes `eligible_path=run_dir/eligible_n.json` to F's loader; local question files and in-memory questions are persisted through `write_eligible_n` with `source` metadata. |
| Routes | `routes.json` sidecar per run (`Retriever.routes` + `errors`), merged across resumes rather than replaced. |
| Summary | `summary.json` keeps the legacy CCR/MPR fields and adds `accuracy`, `n_correct`, `n_scored`, CI, endpoints (E), `manifest_hash`, and the manifest path. The Markdown summary gains an accuracy line and manifest line. |
| Injection | `RunConfig.inject` / `injection_scope`, CLI `--inject` / `--injection-scope`, matrix override keys, and `DebateRunner(injection_scope=...)` for B3/B8/pilot/injection. B8+injection passes both the retriever and the scope. `inject=True` on an arm without a debate hook raises instead of silently not injecting. |
| Pilot trust | `_pilot_block` uses `TrustState` with per-agent deduplicated `n_claims` from the raw final positions (P0-5 normalization), instead of raw counts. |

## Acceptance evidence

```
$ python -m pytest -q --ignore=.venv
497 passed in 51.20s        # 19 new runner tests in this wave

$ python scripts/p0_gate.py --allow-pending
summary: 12 passed, 0 failed, 1 pending, 0 error (exit 0)
  PASS   2 record schema
  PASS   4 parser corpus
  PASS   5 trust bound
  PASS   6 trust neutral/verbosity
  PASS   8 B8+injection mock      consensus='A', targets=[0], trust rounds=4, evidence rounds=3
  PASS   9 endpoint summary
  PASS  10 datasets pinned
  PASS  11 claim routing
  PASS  12 manifest resume
  PENDING 7 B8 vs B8-no-trust    (A's neutral prompt has not landed; unchanged from baseline)
```

New runner coverage (`test_runner_wiring.py`, 16 tests; 3 mock-server tests in `test_integration_mock.py`):

- B1/B3/B8 mock records pass `validate_record` and carry non-null `final_answer`, `final_answer_correct`, `final_answer_source`, and `manifest_hash`.
- Resume refuses a changed `alpha` and records written under another manifest.
- Fake loader receives `eligible_path`; routes/evidence are persisted; summary accuracy is 1.0 on a correct run.
- B8+injection has consensus, targets, delivered, trust trajectory, and evidence; B3+injection has consensus but no trust update.
- An invalid record is rejected before `records.jsonl` is created.

## Interfaces the debate / strategy slices still owe

1. **`verdicts` schema (D, verifier wave).** `debate.py` currently logs one dict per round (`round`, `support`, `harm`, `n_claims`). Schema v2 wants one dict per claim with `agent`, `round`, `claim`, `passages`, `scores`, `verdict`, `verifier`. The runner copies whatever is there; when D lands the per-claim shape no runner change is needed.
2. **`injection.consensus_source` / `injection.delivered` (A, WP-10).** The runner defaults them to `"panel"` and `eligible and targets` because today's protocol is a panel majority. When A adds external/neutral conditions, `debate.py`/`injection.py` must emit both fields so the default never masks the actual source.
3. **Injection hook in strategy-owned arms.** `run_b4_rag_mad`, `run_imad`, and `run_consensagent` construct their own `DebateRunner`; `inject=True` is therefore rejected for B4/B9/B10 rather than silently ignored. If the 2×2 factorial ever needs those arms, the strategy functions must accept and pass `injection_scope`.
4. **`trust_for_positions` / `trust_status`.** Now supplied by C's C2; the runner copies them verbatim. No further change needed unless the key names move.

## Semantics worth knowing

- A run directory is bound to one manifest. `limit` is part of it because stratified sampling changes with the cap, so extending a run needs a new directory (qids would otherwise point at different questions).
- `code_commit` is part of the hash; resuming after a code commit is refused by design (use a new directory or fingerprint the run as pre-commit).
- Pre-manifest `records.jsonl` files are refused on resume (mixed provenance). Historical analyses still work via `analyze.py`.
- Pipeline edits for this wave: `runner.py`, `scripts/run_experiment.py`, and two lines in `scripts/run_matrix.py` (`inject`/`injection_scope` override keys — F should review). Test fixtures that used a bare-letter gold with options were updated to answer text so they satisfy the frozen schema; the obsolete stand-in validator in `eval/test_options.py` was replaced by the real `validate_record`.
- No changes to `orchestrator/debate.py`, `agents/prompts.py`, `eval/metrics.py`, or `retrieval/verifier.py`.
