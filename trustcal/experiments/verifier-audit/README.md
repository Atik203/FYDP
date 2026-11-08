# verifier-audit — 20-pair synthetic fixture

This is **not** the P0-6 human audit. It is a deterministic smoke fixture for
`scripts/verifier_audit.py`: 20 claim–passage pairs with gold labels and two
pre-filled rater sheets whose metrics are checked in
`src/trustcal/retrieval/test_verifier_audit.py`.

The real audit needs 150–200 pairs labelled by two humans (SciFact + pipeline
claims, stratified by label). The codebook `make` writes is the protocol; the
current status and the sampling plan live in `experiments/p0/WP-08.md`.

| File | Contents |
|---|---|
| `pairs.jsonl` | 20 pairs: `{id, claim, passages, gold_label}`; 7 supported, 7 contradicted, 6 unverifiable, one empty-passage negative |
| `rater1.csv` | Filled sheet: gold except `syn-01` (supported → contradicted) |
| `rater2.csv` | Filled sheet: gold except `syn-08` (contradicted → supported) and `syn-09` (contradicted → unverifiable) |

Known values for the fixture (asserted in the tests): inter-rater κ = 0.7778 on
17/20 agreement; rater 1 vs gold gives coverage 0.70, balanced accuracy 0.9286,
macro-F1 0.9282.

Reproduce:

```bash
python scripts/verifier_audit.py make --pairs experiments/verifier-audit/pairs.jsonl --out results/verifier-audit/kit
python scripts/verifier_audit.py score \
  --rater1 experiments/verifier-audit/rater1.csv \
  --rater2 experiments/verifier-audit/rater2.csv \
  --gold experiments/verifier-audit/pairs.jsonl
```
