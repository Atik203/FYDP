# Changelog

All notable changes to this repository are recorded here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and releases use semantic versioning.

## [Unreleased]

## [0.2.1] - 2026-11-11

### Added

- Co-author guide for Authors 2–6: roles, worked examples, direct links, submission rules, and a 6-week recommended / 4-week compressed plan.
- Co-author templates for item verification, annotation submission, training notes, weekly check-ins, and paper support.

### Changed

- Renamed the benchmark from EG-SSS to **SciClaimBench** throughout the repository, manuscripts, frontend, and documentation.
- Renamed the dataset keys to `sciclaim_180` and `sciclaim_300`, and the schema version to `sciclaim-item-v0.1`.
- Updated the Full config hash in the v1.3 pre-registration draft.
- Recompiled both manuscripts after the rename.
- Linked the co-author guide from the README, contributing guide, documentation index, and both annotation protocols.

### Verification

- 615 GPU-free tests pass.
- P0 gate passes 13/13.
- Fourbit and final stack checks pass at 53.26 GB and 73.68 GB.
- Report: 70 pages. Journal: 19 pages; both compile with 0 errors and 0 undefined citations.
- Frontend build and lint pass.
- No efficacy result is claimed.

## [0.2.0] - 2026-11-09

### Added

- `fourbit` serving phase with Qwen3.8-27B-AWQ-INT4, Gemma 4 26B-A4B AWQ, and Mistral 24B AWQ at 53.26 GB on an 80 GB A100.
- `configs/experiments_fourbit.yaml` for the 24-row Core matrix.
- `configs/experiments_full.yaml` for the 32-row gold-evidence Full matrix, with the 36-row gold-answer alternate.
- `configs/experiments_precision.yaml` for the 3-row GPQA FP8 precision replication.
- WP-18 placebo and oracle controls: cross-agent round-pool verdict shuffle and gold-evidence oracle.
- MMLU-Pro STEM filter, including the seven-category health-inclusive variant.
- Repository community files: citation metadata, contribution guide, security policy, changelog, code of conduct, issue and pull-request templates.
- Human-facing `trustcal/README.md`.

### Changed

- Main causal matrix moved to the 4-bit stack; the 96 GB FP8 stack is limited to the N1 smoke and precision replication.
- Final-stack weight budget corrected to 73.68 GB with 12.72 GB KV headroom.
- Compute budget aligned to the $500-600 target with a $600 hard stop.
- Report, journal, site, figures, roadmap, and pre-registration aligned to Qwen3.8 and the 4-bit/FP8 split.
- README rewritten as a project landing page with current status, quick start, citation, and security links.

### Fixed

- `trustcal-offline` CI job now installs `httpx` explicitly; `openai 3.x` depends on `httpx2`, not `httpx`.
- Historical model-stack records marked as superseded instead of being silently edited.

### Verification

- 615 GPU-free tests pass.
- P0 gate passes 13/13.
- Fourbit and final stack checks pass at 53.26 GB and 73.68 GB.
- Report: 69 pages, 80 cited works, 0 errors and 0 undefined citations.
- Journal: 19 pages, 71 cited works, 0 errors and 0 undefined citations.
- Frontend build and lint pass.
- No efficacy result is claimed.

## [0.1.0] - 2026-11-09

### Added

- P0 pipeline release: debate loop, claim parsing, retrieval routing, verifier interface, bounded trust operator, weighted aggregation, injection, resumable runner, and record schema.
- 13-check P0 gate and mock vLLM end-to-end path.
- Gate 0 artifact: 10 vanilla GPQA debates, 90/90 non-empty positions.
- Report and journal engineering drafts.

### Verification

- 514 tests at release.
- Tags: `p0-gate` and `p0-release`.
- No efficacy result is claimed.

## [0.0.0] - 2026-11-08

### Added

- Initial proposal site, research blueprint, literature-review scaffold, and project roadmap.
