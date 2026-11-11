# SciClaimBench item verification checklist

**Verifier:** ____________________  
**Date:** ____________________  
**Batch:** `experiments/calibration/private/items.jsonl`  
**Guide:** [`docs/COAUTHOR_GUIDE.md`](../../COAUTHOR_GUIDE.md)

Use one copy per item. Do not edit the item source; return the completed checklist and a written problem list to Author 1.

## Item

| Field | Value |
| --- | --- |
| `item_id` | |
| `stratum` | `biomedical` / `physics_chemistry` / `math_cs` |
| `status` | `drafted` |
| Question present | yes / no |
| Options present | yes / no / null |
| Gold answer present | yes / no |
| Number of positions | 3 |
| Claims per position | 3–6 |

## Structural checks

- [ ] `schema_version` is `sciclaim-item-v0.1`.
- [ ] `item_id` is unique and follows the batch pattern.
- [ ] `stratum` is one of the three allowed values.
- [ ] The question is answerable from the options or the stated free-form answer.
- [ ] The gold answer is one of the options, or is unambiguous for a free-form item.
- [ ] There are exactly three positions, agents 0, 1, and 2.
- [ ] Each position has 3–6 claims.
- [ ] Every claim has `claim_id`, `text`, `atomic: true`, `gold_verdict`, `gold_confidence`, `verdict_rationale`, and at least one evidence object.
- [ ] `claim_id` values are unique across the batch.
- [ ] Every evidence object has `passage_id`, `text`, `source`, `locator`, `retrieved_at`, and `license`.

## Content checks

- [ ] Each claim is one atomic, checkable proposition.
- [ ] Compound claims are split, not labeled as one claim.
- [ ] The claim can be judged from the cited passages alone.
- [ ] The passages are quoted faithfully and the locator resolves.
- [ ] The gold verdict follows the decision order: contradiction first, then support, otherwise neutral.
- [ ] Numbers match after unit conversion.
- [ ] Negation and polarity are handled correctly.
- [ ] Topical overlap is not treated as support.
- [ ] A compound claim with only one supported part is not marked `support`.

## Provenance and licence

- [ ] `source.kind` is `original` or `adapted`.
- [ ] Original items use `CC BY 4.0`.
- [ ] Adapted items record citation, locator, licence, and what changed.
- [ ] No GPQA, HLE, or MMLU-Pro test text appears in the item.
- [ ] No SciFact claim or passage text appears in the item.
- [ ] No PII, private data, or model output is pasted into the item.

## Problems found

| Claim or item | Problem | Suggested fix |
| --- | --- | --- |
| | | |
| | | |
| | | |

## Sign-off

- [ ] I verified this item and the problem list is complete.
- [ ] I did not edit the source file.

**Verifier signature:** ____________________
