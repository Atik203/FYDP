## What changed

<!-- One or two sentences. Link the issue or work package if one exists. -->

## Why

<!-- The problem, the evidence, or the release need. -->

## Scope

- [ ] Python pipeline
- [ ] experiment config or pre-registration
- [ ] frontend
- [ ] report or journal
- [ ] repository documentation or CI

## Verification

- [ ] `pytest -q` passes from `trustcal/`
- [ ] `python scripts/p0_gate.py` passes 13/13
- [ ] the relevant `run_matrix.py --dry-run` and `check_stack.py` pass
- [ ] `npm run build` and `npm run lint` pass from `frontend/`
- [ ] report and journal compile with 0 errors and 0 undefined citations
- [ ] no `.env`, key, `results/`, private annotation, or model cache is included

## Notes for the reviewer

<!-- Anything that is intentionally out of scope, or a claim that still needs verification. -->
