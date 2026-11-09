# Preprint status — claims-accuracy pass

**Branch:** `docs/journal-claims` merged; `main` = `dev` = `2ae56a3`
**Base:** P0 release `7f2c11f` (P0 gate 13/13; tags `p0-gate`, `p0-release`)
**Date:** 9 November 2026
**Manuscript:** `cas-sc-template.tex`
**Audit:** `CLAIMS_AUDIT.md`

**Title:** “The Boundaries of Evidence-Grounded Trust in Multi-Agent Scientific Debate, with a Controlled Benchmark for Sycophantic Consensus.” The title uses “with” rather than a colon, following the course teacher’s formatting preference. “Controlled” is used until the causal estimand is formally defined. The FYDP report cover now uses the same exact title only; no registered-title or cover note is included.

## What this branch does

Reconciles the preprint with the P0 implementation. The paper is a design and implementation-status draft, not a results paper. It keeps the CAS/Elsevier template and structure; a full TACL conversion is a later task.

## Current P0 numbers used in the text

| Item | Value | Source |
|---|---|---|
| Gate 0 | 10/10 debates, 3/3 rounds each, 90/90 non-empty positions, 370.8 s mean, 3,708.1 s total | `experiments/gate0/README.md` |
| Tests | 523 current (514 at the P0 release) | `pytest`; `experiments/p0/WAVE2.md` |
| P0 gate | 13 passed, 0 failed, 0 pending | `p0_gate.py` strict run, 2026-11-09 |
| Matrix | 24 rows, 4 arms x 3 datasets x 2 seeds | `trustcal/configs/experiments.yaml` |
| Budget | 1,280 GPU-h conservative gate (9,600 debates x 8 min) | `PRE_REGISTRATION.md`, gate check 13 |
| Pre-registration | v1.0, dated 9 November 2026 | `PRE_REGISTRATION.md` |

## What changed

- Abstract rewritten as design + implementation status. No efficacy claims; no "no mechanism exists", "produced fewer", "all surviving claims", or "selected model".
- Introduction reframed the gap as measurement/boundary conditions and added a Related Work subsection citing R2-MAD, TERA-RAG, To Trust or Not, GAVEL, and DebateCV.
- Method corrected: seeded options, answer parser/scorer, claim-domain routing, three verifier labels, log-domain trust -> one softmax -> floor/ceiling simplex projection, weighted plurality, one-shot injection, and a boundary-conditions subsection (R2/R4/R6/shared-error floor).
- Datasets corrected: GPQA-Main and MMLU-Pro STEM are primary, HLE is a control, EG-SSS is planned, and BrokenMath/BrokenArXiv are proof-only and excluded.
- Baselines corrected: four executable conditions; B9/B10 are approximations, not faithful reimplementations.
- Metrics corrected: final accuracy and CMR are confirmatory; CCR-0, CCR-E, MPR-weighted, and ARR are descriptive; trust AUROC and Brier are secondary; ECR is not a primary target.
- Results replaced by "Implementation Status and Planned Evaluation": Gate 0, 523 current tests (514 at the P0 release), 13/13 gate, known gaps, the 24-run pre-registered matrix, planned statistics, and limitations. No expected-value tables. The optional appendix-only B7 ceiling is documented as three GPT-6 Luna samples per question and is not in the Core or Full matrix.
- Conclusion and declarations corrected; code is MIT, EG-SSS will be CC BY 4.0, gated datasets are IDs/hashes only, and dual-use/abstention language is added.
- Five verified bibliography entries added.

## Figure status

The figure agent is regenerating the six canonical PNGs at 600+ DPI:

`fig-pipeline.png`, `fig-context.png`, `fig-claim-example.png`, `fig-trust-detail.png`, `fig-round-loop.png`, `fig-dataflow.png`.

The manuscript keeps all six filenames and updates the captions to the current mechanism: options/shuffle, claim-domain routing, three verifier labels, log-domain trust -> softmax -> simplex projection, one-shot injection, and trust-weighted plurality.

**Check before submission:** if a regenerated PNG still shows softmax -> clamp -> renormalize, the "contested" label, source-partitioned retrieval, or ECR, the caption will not match the image. Re-check each figure. Do not invent or generate replacement figures in this branch.

## Compile status

Compiled with the explicit pdfLaTeX sequence (Overleaf parity), from this directory with TeX Live 2026:

```text
pdflatex -interaction=nonstopmode -halt-on-error cas-sc-template.tex
bibtex cas-sc-template
pdflatex -interaction=nonstopmode -halt-on-error cas-sc-template.tex
pdflatex -interaction=nonstopmode -halt-on-error cas-sc-template.tex
```

Result: all four commands exited 0. Final output: **17 pages**, **no LaTeX errors**, **no undefined citations**, **no undefined references**, no missing figures. BibTeX reported 20 `empty pages in <key>` warnings; page numbers are omitted for several entries.

Remaining box warnings:

- Overfull hbox (117.1 pt) at the title/author block at `\maketitle` (line 130). This is the long title plus eight authors on one affiliation; it predates this pass.
- Overfull hboxes in the bibliography from long URLs: 18.7 pt (MoA), 18.7 pt (Liu et al.), 44.2 pt (Estornell & Liu). These are existing `.bbl` URL lines.
- Underfull hboxes in the bibliography for Wynn et al. and BrokenMath. These are short author lines.

No overfull box comes from the new prose or the new equations. The final PDF was copied to `out/cas-sc-template.pdf` for inspection; the tracked source PDF was restored, and generated `.aux/.log/.bbl/.pdf` files are not committed.

## Remaining work before submission

1. Re-run `pytest` only if the code changes; the current count is 523, with 514 at the P0 release.
2. Confirm every regenerated figure matches its caption.
3. `LICENSE` (MIT) is present at the repository root; no action.
4. Verify dataset licence statements against the live cards.
5. Add page numbers for the five new bibliography entries.
6. Run the injection kappa validation before using injection results.
7. Complete the final-stack smoke test, the WP-18 placebo/oracle slice, the 24-item calibration batch, and the verifier human audit before the paid matrix. The 13/13 gate is achieved; no efficacy result is claimed.
