# Wave 2 — integration and wiring

Landed on `feat/p0-hardening`: WP-03 (`2d99110`), WP-04/15 (`62fa3f7`), WP-07/08 (`efd11ae`), WP-11/12 (`4b5f366`), WP-17 (`61af3b0`). Pending: WP-01/02 (A), WP-05/06 (E).

## Merge order

1. Merge A (`p0/wp-A`) and E (`p0/wp-E`); run the full suite.
2. B applies the runner patch: manifest + resume refusal, `manifest_hash`, `final_answer` + `final_answer_correct`, `validate_record` before append, `eligible_n.json`, persisted `Retriever.routes`.
3. C wires trust timing: update from final positions, pass real `n_claims`, store `trust_for_positions` / `trust_status`.
4. D wires the verifier: `DebateRunner(verifier=...)`, `classify_claim` -> `verifier.verdict`, verdict records, `select_evidence` before classification.
5. A wires injection (WP-10) and the B8-no-trust baseline/prompt split (WP-13).
6. F cuts the matrix to 6 arms x 3 datasets x 2 seeds and writes the power table + `PRE_REGISTRATION.md` (WP-14).
7. E runs the 13-check gate; no pilot/matrix until it exits 0.

## Cross-slice handoffs

- **B (runner lease):** persist `eligible_n.json` (`eligible_path=run_dir(cfg)/"eligible_n.json"` or `TRUSTCAL_ELIGIBLE_DIR`) and `Retriever.routes`; the dataset loader already writes when a path is supplied.
- **D (debate lease, wk3):** run `select_evidence` before `classify_claim` so judged evidence equals shown evidence; `LexicalVerifier` must be pinned explicitly (the old fallback silently used the cross-encoder when installed).
- **E (gate):** assert all `revision_audit()` entries are `pinned`, and that every `experiments.yaml` primary dataset is not `appendix_only`.
- **A:** free-form/HLE gets `Answer format: free text`; no fabricated options. The parser corpus uses real Gate 0 positions plus curated probes, with provenance per case.
- **All:** no commit mixes `docs/**` with `trustcal/**`; slice branches push after every green checkpoint; integrator merges `--no-ff`.

## Current matrix

`run_matrix.py --dry-run`: **135 rows** (15 arms x 3 datasets x 3 seeds) after removing the proof-only datasets. WP-14 cuts this to 36 rows (6 arms x 3 datasets x 2 seeds).
