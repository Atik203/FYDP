# Report Status — Full Project Report

**Updated:** 9 November 2026 · **Base:** `main` = `dev` = `bacc59c` (P0 release `7f2c11f`; tags `p0-gate`, `p0-release`).

## What changed

- **`0.0.title.tex`** — the cover now uses the exact paper title only, *The Boundaries of Evidence-Grounded Trust in Multi-Agent Scientific Debate, with a Controlled Benchmark for Sycophantic Consensus*. No registered-title or cover note is included.
- **`0.1.abstract.tex`** — rewritten as an FYDP~II abstract. States 523 current tests (514 at the P0 release), the 13/13 gate, and Gate 0 only; says explicitly that no efficacy result is reported.
- **`1.intro.tex`** — corrected the 25.5% statistic and its denominator; removed "eliminate"; replaced the per-agent-confidence sentence with the external-evidence contrast; corrected the trust bound to the simplex projection; limited "tested" to the ten-question Gate 0 slice; removed the meta opening paragraph.
- **`2.back.tex`** — corrected the iMAD characterisation; replaced the false "none of the prior studies" absolute with a scoped gap; replaced the "existing research does not contain" absolute with "we are not aware"; updated the metric list to the current endpoints.
- **`3.design.tex`** — rewritten to the university structure: 3.1 Requirement Analysis with the four required subsections, 3.2 Detailed Methodology and Design, 3.3 Project Plan, 3.4 Task Allocation, and 3.5 Summary. Detailed components use unnumbered paragraph headings so the table of contents stays clean. The FYDP~I ten-month plan was replaced with the current November 2026--December 2027 plan, the 24-run Core and 36/32-run Full targets, and the 24--180--300 benchmark ladder.
- **`4.implementation.tex`** — rewritten as **Implementation and Results** with the fixed main sections 4.1 Environment Setup, 4.2 Testing and Evaluation, 4.3 Results and Discussion, and 4.4 Summary. It records the environment, implementation architecture, P0 hardening, 523-test suite, P0 gate, Gate 0, evaluation protocol, engineering results, projected efficacy values, discussion, and threats to validity.
- **`5.sic.tex`** — corrected the Python version, FP8/PagedAttention wording, BM25/cross-encoder wording, and RAG expansion; filled the empty constraint subsections; replaced the 300-hour/340--820 budget with the 1,067--1,280 GPU-h matrix and the Core run (USD 420--580) / Full-run budget envelope (USD 900--1,200); fixed "seven attributes" to "six of seven, P6 not covered"; removed "incremental level of innovation"; removed the "energy usage very-low" claim; reconciled the six program outcomes.
- **`6.conclusion.tex`** — removed the separate "What Was and Was Not Shown" section. The summary now states the engineering-only boundary, and the limitations and future-work sections remain.
- **`CLAIMS_AUDIT.md`** — mode/rung, old-to-new table, claim-evidence map, removed/narrowed claims, figure changes, unresolved items, compile result.

## Current numbers used

- **523 passing tests** in the current suite; **514 at the P0 release** (`experiments/p0/WAVE2.md`).
- **P0 gate: 13 of 13 passed, 0 failed, 0 pending** (`p0_gate.py` strict run, 2026-11-09).
- **Matrix: 24 rows** (4 arms × 3 datasets × 2 seeds), **1,280 GPU-h** conservative / **1,067 GPU-h** per-dataset caps.
- **Gate 0: 10/10 debates, 90/90 positions, 370.8 s mean**, 21.5 s stdev, approximately USD 4.29.
- **Final stack:** 69.73GB pinned weights (two FP8 + one AWQ); not smoke-tested.
- **B7:** optional appendix ceiling, three GPT-6 Luna samples per question; not in Core/Full.
- **Report:** 61 pages, 0 errors/undefined refs; 15 overfull and 108 underfull boxes.

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

Engine: pdfTeX 3.141592653-2.6-1.40.29 (TeX Live 2026). Each pdfLaTeX pass exited 0; BibTeX exited 0. **61 pages, 0 errors, 0 undefined references, 0 undefined citations, 0 missing figures.** 15 overfull boxes (most at 1.9--65.5pt in long table/paragraph lines) and 108 underfull boxes, mostly narrow table cells.

## Remaining placeholders / actions

- `LICENSE` (MIT) is present at the repository root; the reproducibility section cites it.
- The current suite records 523 passing tests (514 at the P0 release); re-run `pytest` only if the code changes.
- Verify the RTX A6000 USD 0.263/hour figure or replace it with a dated quote.
- Run `smoke_test.py --phase final` on the 96GB stack.
- Complete the 150--200-pair verifier human audit.
- Complete the 24-item calibration batch and freeze the EG-SSS 180-item Core floor / 300-item Full target.
- Complete the WP-18 placebo/oracle slice; the Core matrix remains four arms until it lands.
- The runner record adapter is wired; check a sample record for `manifest_hash`, `final_answer`, and the trust fields before the paid run.
- Check the regenerated 600+ DPI figures against the new captions.

## Stage naming

The report uses the glossary names: **Core run** (legacy "C+") and **Full run** (legacy "TACL full"). "TACL" is not used as a stage name. No "C+" or "TACL full" remains in the report prose or tables.
