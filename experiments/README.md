# Experiments

Index of every experimental run for the trustcal pipeline. One folder per experiment; each contains a detailed report (`README.md`) and the raw artifacts under `artifacts/`. Planning records for future work packages live in [`next/`](next/).

| ID | Date (UTC) | Phase | Experiment | Status | GPU cost | Report |
| --- | --- | --- | --- | --- | --- | --- |
| `gate0` | 2026-09-16 | Ph 0 | Vanilla MAD reproduction (Du et al. 2023) — Gate 0 | ✅ PASS | see report | [gate0/README.md](gate0/README.md) |
| `p0` | 2026-11-09 | Ph 0 | P0 engineering hardening and release | ✅ RELEASED — gate 13/13, 514 tests | 0 (local/offline) | [p0/README.md](p0/README.md) |

**P0 is an engineering record, not an efficacy result.** No Core or Full matrix has run; no accuracy, CCR, CMR, or sign-reversal claim exists. The `p0/` folder records the gate, the integration history, and the release tags only.

**WP naming note.** The landed P0 [`p0/WP-13.md`](p0/WP-13.md) is the B8-no-trust prompt split. The pending placebo/oracle slice is **WP-18**, planned in [`next/WP-18.md`](next/WP-18.md); do not reuse WP-13 for the placebo or oracle arms.

## Annotation gates in progress

| Gate | Folder | State |
| --- | --- | --- |
| EG-SSS 24-item calibration | [`calibration/`](calibration/README.md) | **BLOCKED** — 24 item slots are structurally valid but unfilled; 0 human labels |
| Verifier audit (N4) | [`verifier_audit/`](verifier_audit/README.md) | **READY FOR ANNOTATION** — 180 real SciFact dev pairs; 0 human labels |
| B8 pipeline-pair audit | [`verifier_audit/`](verifier_audit/README.md) | **BLOCKED** — needs a B8 retrieval run; the B7 smoke has no verdicts |

These are annotation gates, not completed experiments. No κ, balanced-accuracy, or
gold-evidence result exists yet. SciFact and gated benchmark text stay under
`private/` and are gitignored.

## Conventions

- New reports: copy [`TEMPLATE.md`](TEMPLATE.md) to `<experiment-id>/README.md` and fill every section.
- One experiment = one folder named after the gate/experiment id (`gate0`, `injection-v1`, `pilot-month1`, ...).
- Every report starts with an index and states, in order: objective, result, environment, models, config, process, measurements, issues+fixes, cost, artifacts, next steps.
- Raw artifacts (transcripts, metric files) live in `<experiment>/artifacts/` and are committed for future team use.
- Costs are billed from the provider invoice, not estimated.
- `next/WP-<id>.md` records are plans and acceptance criteria, not runs. They contain no results and are not experiment folders.
