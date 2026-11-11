# Paper-support checklist

**Reviewer:** ____________________  
**Manuscript:** report / journal  
**Version or commit:** ____________________  
**Date:** ____________________

Use this checklist after the annotation numbers are frozen. Do not add new claims.

## Numbers

- [ ] Every number in the abstract, tables, figures, and conclusion appears in a config, manifest, ledger, artifact, or cited source.
- [ ] Test counts match the current `pytest` output.
- [ ] Page counts match the compiled PDF.
- [ ] Model weights and stack totals match `configs/models.yaml` and `check_stack.py`.
- [ ] The Core row count is 24 and the Full row count is 32 (36 alternate).
- [ ] No projection is written as a measured result.
- [ ] No efficacy number is reported before the matrix runs.

## Citations

- [ ] Every citation key exists in the bibliography.
- [ ] The author, year, and venue are correct.
- [ ] The sentence is supported by the cited source.
- [ ] No citation is padding or unrelated to the claim.
- [ ] The bibliography has no duplicate entries.
- [ ] The report and journal use the same citation for the same claim.

## Terminology

- [ ] One name per concept: trust weight, verdict, supported / contradicted / neutral, pressure-eligible, correct-minority retention.
- [ ] `SciClaimBench` is spelled consistently; no legacy benchmark acronym remains.
- [ ] Dataset keys are `sciclaim_180` and `sciclaim_300`.
- [ ] The labels used in the report match the labels used in the codebook.
- [ ] `B8`, `B8-no-trust`, `B8-placebo`, and `B8-oracle` are used consistently.

## Limitations

- [ ] Verifier quality and the human audit are stated.
- [ ] Retrieval coverage and API limits are stated.
- [ ] Shared error across agents is stated.
- [ ] Model coverage and the 4-bit/FP8 distinction are stated.
- [ ] The Core and Full matrices are described as not run.
- [ ] The report does not claim a causal result.

## Proofreading

- [ ] The abstract matches the body.
- [ ] Table and figure captions are accurate.
- [ ] Cross-references resolve.
- [ ] No placeholder text remains.
- [ ] The PDF compiles with 0 errors and 0 undefined citations.

## Issues found

| Location | Problem | Suggested fix |
| --- | --- | --- |
| | | |
| | | |
| | | |

## Sign-off

- [ ] I completed the number, citation, terminology, limitation, and proofreading checks.
- [ ] I did not invent a number or a citation.

**Reviewer signature:** ____________________
