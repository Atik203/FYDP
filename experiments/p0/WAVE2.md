# Wave 2 — integration and wiring

> **Historical record — 9 November 2026.** Wave 2 is complete and P0 is released. `main` and `dev` are both at `2ae56a3`; tags are `p0-gate` = `055a244` and `p0-release` = `7f2c11f`. The temporary `feat/p0-hardening` integration branch is retired and deleted. This file records the merge history and acceptance state; it is not a live landing plan.

Landed on the temporary P0 integration branch (now retired): WP-01/02 (`115513b`), WP-03 (`2d99110`), WP-03b (`31e8d35`), WP-04/15 (`62fa3f7`), WP-04b (`e1ce1a7`), WP-05/06 (`ef38fd9`), WP-07/08 (`efd11ae`), WP-09/10/13 (`9641476`), WP-11/12 (`4b5f366`), WP-14 (`9b57b9d`), WP-17 (`61af3b0`). Journal, report, repo docs, and frontend content/visual passes were merged.

Gate at release: **13 passed / 0 pending** (`pytest` 514). Core matrix: **24 rows**, 1,280 GPU-h gate cap, `PRE_REGISTRATION.md` v1.0 with the v1.1 erratum — planned, not run. No efficacy result exists. Landing completed through `dev` to `main`, tagged `p0-gate` and `p0-release`; the P0 integration branch is retired.

## Merge order (completed)

1. Merged A (`p0/wp-A`) and E (`p0/wp-E`); ran the full suite.
2. B applied the runner patch: manifest + resume refusal, `manifest_hash`, `final_answer` + `final_answer_correct`, `validate_record` before append, `eligible_n.json`, persisted `Retriever.routes`.
3. C wired trust timing: update from final positions, pass real `n_claims`, store `trust_for_positions` / `trust_status`.
4. D wired the verifier: `DebateRunner(verifier=...)`, `classify_claim` → `verifier.verdict`, verdict records, `select_evidence` before classification.
5. A wired injection (WP-10) and the B8-no-trust baseline/prompt split (WP-13).
6. F cut the matrix to 4 executable conditions × 3 datasets × 2 seeds and wrote the power table + `PRE_REGISTRATION.md` (WP-14).
7. E ran the 13-check gate; no pilot or matrix until it exits 0.

## Cross-slice handoffs (historical)

- **B (runner lease):** persist `eligible_n.json` (`eligible_path=run_dir(cfg)/"eligible_n.json"` or `TRUSTCAL_ELIGIBLE_DIR`) and `Retriever.routes`; the dataset loader already writes when a path is supplied.
- **D (debate lease, wk3):** run `select_evidence` before `classify_claim` so judged evidence equals shown evidence; `LexicalVerifier` must be pinned explicitly (the old fallback silently used the cross-encoder when installed).
- **E (gate):** assert all `revision_audit()` entries are `pinned`, and that every `experiments.yaml` primary dataset is not `appendix_only`.
- **A:** free-form/HLE gets `Answer format: free text`; no fabricated options. The parser corpus uses real Gate 0 positions plus curated probes, with provenance per case.
- **All:** no commit mixes `docs/**` with `trustcal/**`; slice branches push after every green checkpoint; integrator merges `--no-ff`.

## Remaining at release (completed)

1. Merged the figure branch; verified all six PNGs are 600+ DPI and copied into both manuscripts.
2. Recompiled both manuscripts with explicit `pdflatex`; checked captions and figure references.
3. Ran formatting/QA: `npm run build`, `npm run lint`; no undefined references or missing figures.
4. Merged the P0 integration branch into `dev`, then `dev` into `main`; tagged `p0-gate` and `p0-release`; removed temporary branches and worktrees.

## Core matrix at release

`run_matrix.py --dry-run`: **24 rows** (4 conditions × 3 datasets × 2 seeds), 1,280 GPU-h gate cap; planned per-dataset volume is 8,000 debates / 1,067 GPU-h. The 6-arm target adds B8-placebo and B8-oracle in **WP-18**; the pre-registration names all six and the executable subset. The landed WP-13 is the B8-no-trust prompt split, not the placebo/oracle slice. WP-16 has no separate file; its docs/status reconciliation is covered by this record and the release history around tag `p0-release`.
