# Experiments

Index of every experimental run for the trustcal pipeline. One folder per experiment; each contains a detailed report (`README.md`) and the raw artifacts under `artifacts/`.

| ID | Date (UTC) | Phase | Experiment | Status | GPU cost | Report |
| --- | --- | --- | --- | --- | --- | --- |
| `gate0` | 2026-09-16 | Ph 0 | Vanilla MAD reproduction (Du et al. 2023) — Gate 0 | ✅ PASS | see report | [gate0/README.md](gate0/README.md) |

## Conventions

- New reports: copy [`TEMPLATE.md`](TEMPLATE.md) to `<experiment-id>/README.md` and fill every section.
- One experiment = one folder named after the gate/experiment id (`gate0`, `injection-v1`, `pilot-month1`, ...).
- Every report starts with an index and states, in order: objective, result, environment, models, config, process, measurements, issues+fixes, cost, artifacts, next steps.
- Raw artifacts (transcripts, metric files) live in `<experiment>/artifacts/` and are committed for future team use.
- Costs are billed from the provider invoice, not estimated.
