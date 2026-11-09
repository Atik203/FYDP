# Contributing

This is a research repository, not a general-purpose library. Contributions are welcome when they preserve the pre-registered design, the record schema, and the reproducibility gates.

Before changing anything, read [`AGENTS.md`](AGENTS.md) and, for the Python pipeline, [`trustcal/AGENTS.md`](trustcal/AGENTS.md). Those files define the source-of-truth rules; this file defines the workflow.

## Branches

- `main` is the release trunk and the deployed frontend. Do not push directly to it.
- `dev` is the integration branch. Slice work from `dev`.
- `next/<slice>` is a short-lived work branch in its own worktree. Merge it into `dev`, then delete it.

Promote a release by fast-forwarding `main` to `dev` after all gates pass. Release tags mark promoted commits.

## Commits

Use Conventional Commits:

```text
feat(trustcal): add fourbit serving phase
fix(ci): declare httpx for offline tests
docs(report): correct the Full-matrix row count
```

Keep one logical change per commit. Write the subject in the imperative mood and explain the why in the body when the diff is not self-explanatory.

## Required checks

Run the checks that match the files you changed.

| Change | Required |
| --- | --- |
| Python pipeline | `pytest -q` and `python scripts/p0_gate.py` from `trustcal/` |
| Experiment config | the relevant `run_matrix.py --dry-run` and `check_stack.py --phase ...` |
| Frontend | `npm run build` and `npm run lint` from `frontend/` |
| Report | the pdfLaTeX → BibTeX → pdfLaTeX sequence; 0 errors and 0 undefined citations |
| Journal | the same LaTeX sequence; 0 errors and 0 undefined citations |
| Claims or numbers | update the relevant claims audit and consistency record |

The offline CI job runs the GPU-free suite and the matrix, serving-command, and phase guards. It must be green before merge.

## Data, secrets, and provenance

Never commit:

- `.env`, `HF_TOKEN`, `OPENAI_API_KEY`, or retrieval API keys
- `trustcal/results/`
- `experiments/calibration/private/` or `experiments/verifier_audit/private/`
- model caches, checkpoints, or downloaded datasets
- `pdfs/` or `markdowns/` source material

Use `.env.example` for variable names only. If a secret is committed, rotate it immediately and report it under [`SECURITY.md`](SECURITY.md).

New datasets or benchmark items need a provenance note, a fixed revision, and a license compatible with research use. Do not silently change a sample, a seed, a prompt, or an endpoint after a run has been unblinded.

## Manuscript changes

The report and journal are release artifacts. A content change must:

1. update the claim or number in both manuscripts when the claim is shared
2. update the relevant audit record (`FYDP_Summer/CLAIMS_AUDIT.md`, `Papev_Summer26_6/CLAIMS_AUDIT.md`, or `docs/CONSISTENCY_AUDIT.md`)
3. recompile both PDFs and confirm the page count and citation count
4. keep projections clearly labelled as projections

Do not add a citation that has not been checked against the primary source.

## Pull requests

Use the pull-request template. A PR is ready when:

- the description states the problem and the change
- the required checks pass
- no secret, private annotation, or run artifact is included
- the branch is based on `dev`
- the diff is limited to the stated scope

Small, focused PRs are easier to review and safer to reproduce.
