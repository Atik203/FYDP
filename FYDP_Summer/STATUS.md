# Report Status — `docs/report-claims`

**Updated:** 9 November 2026 · **Base:** `main` = `dev` = `2ae56a3` (P0 release `7f2c11f`; tags `p0-gate`, `p0-release`).

## What changed

- **`0.1.abstract.tex`** — rewritten as a mid-project abstract. Removes the result claim, the "no mechanism" absolute, the "all claims linked" claim, and the "selected model" wording. States Gate 0 and the P0 gate only; says explicitly that no efficacy result is reported.
- **`1.intro.tex`** — corrected the 25.5% statistic and its denominator; removed "eliminate"; replaced the per-agent-confidence sentence with the external-evidence contrast; corrected the trust bound to the simplex projection; limited "tested" to the ten-question Gate 0 slice; removed the meta opening paragraph.
- **`2.back.tex`** — corrected the iMAD characterisation; replaced the false "none of the prior studies" absolute with a scoped gap; replaced the "existing research does not contain" absolute with "we are not aware"; updated the metric list to the current endpoints.
- **`3.design.tex`** — replaced the wrong trust formula and clamp/renormalize bound with the logit → softmax → simplex projection; replaced agent-to-source assignment with claim-domain routing; replaced "the majority vote plays no part" with weighted plurality plus a majority baseline; labelled the two UI figures as mock-ups; filled the empty Detailed Methodology section; reconciled the plan to two seeds and 1,280/1,067 GPU-h; removed the first-person 300-hour reservation.
- **`4.implementation.tex`** — new chapter: development and final environments, debate loop, options and parser, claim decomposition, claim-domain retrieval, verifier interface, trust operator, weighted aggregation, injection, runner/records/manifest, P0 change table, 514 tests, mock path, Gate 0, limitations, reproducibility.
- **`5.sic.tex`** — corrected the Python version, FP8/PagedAttention wording, BM25/cross-encoder wording, and RAG expansion; filled the empty constraint subsections; replaced the 300-hour/340--820 budget with the 1,067--1,280 GPU-h matrix and the Core run (USD 420--580) / Full-run top-up (USD 900--1,200); fixed "seven attributes" to "six of seven, P6 not covered"; removed "incremental level of innovation"; removed the "energy usage very-low" claim; reconciled the six program outcomes.
- **`6.conclusion.tex`** — new chapter: summary, what was and was not shown, limitations, future work. No efficacy claim.
- **`CLAIMS_AUDIT.md`** — mode/rung, old-to-new table, claim-evidence map, removed/narrowed claims, figure changes, unresolved items, compile result.

## Current numbers used

- **514 passing tests** at the P0 release (`experiments/p0/WAVE2.md`).
- **P0 gate: 13 of 13 passed, 0 failed, 0 pending** (`p0_gate.py` strict run, 2026-11-09).
- **Matrix: 24 rows** (4 arms × 3 datasets × 2 seeds), **1,280 GPU-h** conservative / **1,067 GPU-h** per-dataset caps.
- **Gate 0: 10/10 debates, 90/90 positions, 370.8 s mean**, 21.5 s stdev, approximately USD 4.29.
- **Final stack:** 69.73GB pinned weights (two FP8 + one AWQ); not smoke-tested.

## Figure status

`fig-pipeline.png`, `fig-context.png`, and `fig-dataflow.png` were present and compiled. Their captions and surrounding text were updated to the current mechanism: seeded option shuffle, claim-domain routing, verifier labels, logit → softmax → simplex projection, one-shot injection, and `trust_for_positions`.

The PNG files were **not edited or regenerated** here. The figure agent is producing 600+ DPI replacements. The new captions were written for the current mechanism, but the PNG content was not visually checked against them. If a regenerated figure does not show those elements, update the caption or the figure.

## Compile

Explicit pdfLaTeX sequence from `FYDP_Summer/`, matching Overleaf:

```
pdflatex -interaction=nonstopmode -halt-on-error fydp.tex
bibtex fydp
pdflatex -interaction=nonstopmode -halt-on-error fydp.tex
pdflatex -interaction=nonstopmode -halt-on-error fydp.tex
```

Engine: pdfTeX 3.141592653-2.6-1.40.29 (TeX Live 2026). Each pdfLaTeX pass exited 0; BibTeX exited 0. **57 pages, 0 errors, 0 undefined references, 0 undefined citations, 0 missing figures.** 6 overfull boxes (five pre-existing title/acknowledgement lines at 3.2pt, one 6.6pt line in the implementation summary) and 84 underfull boxes, mostly narrow table cells.

## Remaining placeholders / actions

- `LICENSE` (MIT) is present at the repository root; the reproducibility section cites it.
- The P0 release records 514 passing tests; re-run `pytest` only if the code changes.
- Verify the RTX A6000 USD 0.263/hour figure or replace it with a dated quote.
- Run `smoke_test.py --phase final` on the 96GB stack.
- Complete the 150--200-pair verifier human audit.
- Complete the 24-item calibration batch and freeze the EG-SSS 180-item Core floor / 300-item Full target.
- Complete the WP-18 placebo/oracle slice; the Core matrix remains four arms until it lands.
- The runner record adapter is wired; check a sample record for `manifest_hash`, `final_answer`, and the trust fields before the paid run.
- Check the regenerated 600+ DPI figures against the new captions.

## Stage naming

The report uses the glossary names: **Core run** (legacy "C+") and **Full run** (legacy "TACL full"). "TACL" is not used as a stage name. No "C+" or "TACL full" remains in the report prose or tables.
