# P0 work packages

> **Historical record — 9 November 2026.** P0 is released. `main` and `dev` are both at `2ae56a3`; tags are `p0-gate` = `055a244` and `p0-release` = `7f2c11f`. The temporary `feat/p0-hardening` integration branch and the `p0/wp-*` slices are retired and deleted, and no extra worktrees remain. This page records how P0 was built; it is not a live landing checklist.

Release state: **13/13 gate checks**, **514 tests**, **P0 released 9 November 2026**. No efficacy result exists — the 24-row Core matrix is planned, not run, and the six-arm Full target is pending WP-18. The executable Core matrix is 4 conditions × 3 datasets × 2 seeds = 24 rows; the gate cap is 1,280 GPU-h. The Final-stack config is pinned and offline-checked; the 96 GB hardware smoke has not been run.

Contract: `docs/agent/09_P0_INTERFACES.md`. Gate: `scripts/p0_gate.py` (13 checks) before any pilot or matrix run.

| WP | P0 | Owner | Deliverable | Wave |
|---|---|---|---|---|
| 00 | — | integrator | Record schema v2, signatures, leases | done |
| 01 | P0-0 | A | `eval/options.py`; options in every prompt; seeded permutation; record fields | 1 |
| 02 | P0-1 | A | Answer-span parser + scorer; 50-case corpus; `parser_version` | 1 |
| 03 | P0-5 | C | Simplex projection with floor; neutral no-op; claim-count normalization | 1 |
| 04 | P0-2, P0-11 | B | `eval/records.py` + `manifest.py` + resume-mismatch test; runner wiring | 1–2 |
| 05 | P0-2, P0-4 | E | Accuracy/CMR/CCR-0/CCR-E/MPR-w/ARR/AUROC endpoints with counts + CIs | 1 |
| 06 | gate | E | `scripts/p0_gate.py` + synthetic fixtures; 13 checks | 1 |
| 07 | P0-6 | D | `retrieval/verifier.py`: lexical/cross-encoder/NLI/LLM-judge behind one interface | 1 |
| 08 | P0-6 | D | Verifier audit harness: 150–200 pair sheets, balanced accuracy/κ | 1 |
| 09 | P0-3 | B + D | B8 × injection × trust wiring; 2×2 conditions | 2 |
| 10 | P0-9 | A | External one-shot consensus; neutral control; ties excluded; paraphrase | 2 |
| 11 | P0-8 | F | Loader fixes (`gold_answer`, splits, empty answers, `answer_type`); pinned revisions | 1 |
| 12 | P0-8 | F | Claim→domain routing; dedup; equal evidence volume | 1 |
| 13 | P0-7 | A + B | B8-no-trust control; trust-line removal; B5 seeds; fidelity labels | 2 |
| 14 | P0-10 | F | 6-arm matrix cut; power table; `PRE_REGISTRATION.md` | 2 |
| 15 | P0-11 | B | `analyze.py` arm/dataset guard; manifest reproduction check | 1 (guard) / 2 (wiring) |
| 16 | P0-12 | integrator | Docs/status reconciliation; branch promotion | 4 |
| 17 | — | integrator | Final-stack readiness: pin FP8 repos, <80 GB, `setup.sh`/`serve.sh`, smoke | 3 |

WP-16 has no separate `WP-16.md`: its docs/status reconciliation and branch promotion are covered by `WAVE2.md` and the release history around tag `p0-release` = `7f2c11f`.

## Landed (historical integration branch)

The commits below landed on the temporary P0 integration branch, which then merged into `dev` and `main` and is now retired.

| WP | Commit | State |
|---|---|---|
| 00 | `631831b` | schema, signatures, leases |
| 01 / 02 | `115513b` | options in every prompt, parser/scorer, 50-case corpus |
| 03 | `2d99110` | simplex trust projection, claim normalization |
| 03b | `31e8d35` | trust from final positions, real claim counts, telemetry |
| 04 / 15 | `62fa3f7` | records + manifest modules, analyze guard |
| 04b | `e1ce1a7` | runner wiring: manifest, accuracy, eligible_n, routes, inject flags |
| 05 / 06 | `ef38fd9` | endpoints + 13-check gate (13/13) |
| 09 / 10 / 13 | `9641476` | verifier, one-shot injection, neutral trust line |
| 07 / 08 | `efd11ae` | verifier interface, audit harness |
| 11 / 12 | `4b5f366` | dataset pins, domain routing |
| 14 | `9b57b9d` | 24-row matrix, per-dataset caps, pre-registration |
| 17 | `61af3b0` | Final stack <80GB, phase-aware setup |

Historical branch rules (no longer active): one lease holder per file (see 09); slice branches push after every green checkpoint; integrator merges `--no-ff` to the integration branch daily; no commit mixes docs with code; no force-push.

## WP-13 / WP-18 naming

The landed [`WP-13.md`](WP-13.md) is the **B8-no-trust prompt split**. The pending B8-placebo / B8-oracle slice is **WP-18**; its planning record is [`../next/WP-18.md`](../next/WP-18.md). Do not reuse WP-13 for the placebo or oracle arms.
