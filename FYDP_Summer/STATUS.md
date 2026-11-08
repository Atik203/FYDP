# Report Status — `docs/report-claims`

**Updated:** 9 November 2026 · **Base:** `origin/feat/p0-hardening` at `8417dc7`.

## What changed

- **`0.1.abstract.tex`** — rewritten as a mid-project abstract. Removes the result claim, the "no mechanism" absolute, the "all claims linked" claim, and the "selected model" wording. States Gate 0 and the P0 gate only; says explicitly that no efficacy result is reported.
- **`1.intro.tex`** — corrected the 25.5% statistic and its denominator; removed "eliminate"; replaced the per-agent-confidence sentence with the external-evidence contrast; corrected the trust bound to the simplex projection; limited "tested" to the ten-question Gate 0 slice; removed the meta opening paragraph.
- **`2.back.tex`** — corrected the iMAD characterisation; replaced the false "none of the prior studies" absolute with a scoped gap; replaced the "existing research does not contain" absolute with "we are not aware"; updated the metric list to the current endpoints.
- **`3.design.tex`** — replaced the wrong trust formula and clamp/renormalize bound with the logit → softmax → simplex projection; replaced agent-to-source assignment with claim-domain routing; replaced "the majority vote plays no part" with weighted plurality plus a majority baseline; labelled the two UI figures as mock-ups; filled the empty Detailed Methodology section; reconciled the plan to two seeds and 1,280/1,067 GPU-h; removed the first-person 300-hour reservation.
- **`4.implementation.tex`** — new chapter: development and final environments, debate loop, options and parser, claim decomposition, claim-domain retrieval, verifier interface, trust operator, weighted aggregation, injection, runner/records/manifest, P0 change table, 478+ tests, mock path, Gate 0, limitations, reproducibility.
- **`5.sic.tex`** — corrected the Python version, FP8/PagedAttention wording, BM25/cross-encoder wording, and RAG expansion; filled the empty constraint subsections; replaced the 300-hour/340--820 budget with the 1,067--1,280 GPU-h matrix and the Core run (USD 420--580) / Full run (USD 900--1,200) envelopes; fixed "seven attributes" to "six of seven, P6 not covered"; removed "incremental level of innovation"; removed the "energy usage very-low" claim; reconciled the six program outcomes.
- **`6.conclusion.tex`** — new chapter: summary, what was and was not shown, limitations, future work. No efficacy claim.
- **`CLAIMS_AUDIT.md`** — mode/rung, old-to-new table, claim-evidence map, removed/narrowed claims, figure changes, unresolved items, compile result.

## Current numbers used

- **478+ passing tests** (branch record at `8417dc7`; not re-run in this docs worktree).
- **P0 gate: 11 of 13 passed, 2 pending** — WP-13 (B8-no-trust prompt split) and WP-09 (B8-plus-injection wiring).
- **Matrix: 24 rows** (4 arms × 3 datasets × 2 seeds), **1,280 GPU-h** conservative / **1,067 GPU-h** per-dataset caps.
- **Gate 0: 10/10 debates, 90/90 positions, 370.8 s mean**, 21.5 s stdev, approximately USD 4.29.
- **Final stack:** 69.73GB pinned weights (two FP8 + one AWQ); not smoke-tested.

## Figure status

`fig-pipeline.png`, `fig-context.png`, and `fig-dataflow.png` were present and compiled. Their captions and surrounding text were updated to the current mechanism: seeded option shuffle, claim-domain routing, verifier labels, logit → softmax → simplex projection, one-shot injection, and `trust_for_positions`.

The PNG files were **not edited or regenerated** here. The figure agent is producing 600+ DPI replacements. The new captions were written for the current mechanism, but the PNG content was not visually checked against them. If a regenerated figure does not show those elements, update the caption or the figure.

## Compile

`latexmk -pdf -interaction=nonstopmode -halt-on-error` with TeX Live 2026: **58 pages, 0 errors, 0 undefined references, 0 undefined citations, 0 missing figures.** 7 overfull boxes (six pre-existing title/acknowledgement lines at 2.7--3.2pt, one 6.6pt line in the implementation summary) and 82 underfull boxes, mostly narrow table cells.

## Remaining placeholders / actions

- Add a `LICENSE` file before claiming the code is MIT-licensed.
- Re-run `pytest` in `trustcal/` and confirm 478+ (or update the number).
- Verify the A100 USD 1.78/hour figure or replace it with a dated quote.
- Run `smoke_test.py --phase final` on the 96GB stack.
- Complete the 150--200-pair verifier human audit.
- Finish WP-13 and WP-09; the gate stays 11/13 until then.
- Apply the runner record adapter (`manifest_hash`, `final_answer`, trust-field copies).
- Check the regenerated 600+ DPI figures against the new captions.

## Stage naming

The report uses the glossary names: **Core run** (legacy "C+") and **Full run** (legacy "TACL full"). "TACL" is not used as a stage name. No "C+" or "TACL full" remains in the report prose or tables.
