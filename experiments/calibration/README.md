# EG-SSS 24-item calibration — protocol and working files

**Gate:** Phase N3 (roadmap §4). **Owner:** P3 + annotators.
**Status (9 Nov 2026): BLOCKED on item authoring and human annotation.**
**0 of 24 items are authored; 0 claims and 0 human labels exist.** The files here
are a schema-compatible seed batch, an annotation workbook, and a validator, not
a finished calibration set. Do not report κ, a defect rate, or a calibration
result until the sheets contain real human labels.

## 1. What this gate decides

The 24-item batch is the feasibility test for EG-SSS, the team-built
gold-evidence benchmark. It answers three questions before the team spends the
~410 h needed for the 180-item v1.2 freeze:

1. Can two annotators apply the claim-level evidence/verdict codebook with
   Cohen's κ ≥ 0.75?
2. Is the frozen defect rate at or below 15%?
3. Is the annotation effort at or below 2.0 hours per attempted item
   (`H_attempt`)?

If κ fails, keep the failed batch in the report, revise the codebook, and run a
fresh calibration batch. If `H_attempt` is above 2.0 h or the defect rate is
above 15%, cut the next step to 120 items immediately, not 180 (roadmap §4). A
failed calibration is a finding about the protocol, not a reason to relabel
until the numbers look better.

## 2. Item sources and licensing

EG-SSS is team-authored. The preferred source is an original item written for
this project; such items are released under **CC BY 4.0** when frozen.

An item may be adapted from a public-domain or CC BY source only when all of
the following are recorded in the item's `source` block:

- the citation and a resolvable locator (DOI, PMID, arXiv ID, or URL);
- the source licence;
- what was changed (question wording, options, claims, or evidence).

Do **not** adapt or redistribute gated or non-redistributable benchmark text
(GPQA and HLE are gated; MMLU-Pro test text must not be redistributed) into
EG-SSS. Those datasets may be used internally as comparison datasets, but their
item text must never appear in a committed EG-SSS file. SciFact is CC BY-NC 2.0
and is used only for the verifier audit, not as an EG-SSS source.

LLM assistance is allowed for drafting question stems or candidate claims, but
a human must verify every claim, every evidence link, and every gold verdict.
Mark such items with `draft_assisted: true` in the item record. An LLM must not
be the only source of a gold verdict.

## 3. Domain strata

The 24-item batch is exactly balanced:

| Stratum key | Label | Items | Intended content |
| --- | --- | ---: | --- |
| `biomedical` | Biomedical | 8 | clinical, molecular, pharmacological, epidemiological |
| `physics_chemistry` | Physics / chemistry | 8 | physical laws, materials, reactions, measurement |
| `math_cs` | Mathematics / computer science | 8 | proofs, algorithms, complexity, systems |

The 180-item freeze uses 60/60/60 and the 300-item target uses 100/100/100.
Stratum is an item-level field, not a claim-level field. Do not rebalance by
moving items between strata after annotation starts.

## 4. Annotation unit and schema

The annotation unit is a **claim–evidence–verdict triple**, not an item and not
a whole answer:

- one item has three positions (agents 0, 1, 2);
- each position carries **3–6 atomic claims**;
- each claim carries one or more evidence passages and one gold verdict;
- each verdict is `support`, `contradict`, or `neutral`.

`support` means at least one cited passage entails the claim as written and no
cited passage refutes it. `contradict` means at least one cited passage asserts
the claim is false (opposite result, different number, negated relation, or
different entity). `neutral` means the passages are empty, off-topic, or merely
topical; they do not establish or refute the claim. Refutation is checked
first: one clear contradiction outranks any supporting passage.

Each item records `pressure_eligible` plus the evidence conditions it can carry
(`evidence_available`, `evidence_absent`, `evidence_placebo`,
`evidence_contradictory`); together these are the five design conditions
(evidence state × pressure).

The full field table is in [`schema.md`](schema.md). A complete skeleton is in
[`item.template.json`](item.template.json), and the 24 unfilled slots are in
[`items.seed.jsonl`](items.seed.jsonl).

EG-SSS has no loader in `trustcal/src/trustcal/eval/datasets.py` yet, so this
batch is the authoring and annotation format, not a runnable
`run_experiment.py --questions-file` input. Do not point the runner at an EG-SSS
batch until a loader and a v1.2 dataset key exist; that work is outside this
calibration gate.

## 5. Two-annotator and adjudication protocol

1. **Author and freeze the candidate item.** Fill question, options, gold
   answer, three positions, 3–6 atomic claims per position, and at least one
   cited passage per claim. Do not put a verdict in the annotation export.
2. **Generate blind sheets.** Run `validate_items.py sheets`. It writes
   `rater1.csv` and `rater2.csv` with blank `verdict`, `confidence`, and `notes`
   columns. The gold verdict never appears in either sheet.
3. **Label independently.** Rater 1 and rater 2 each label every claim without
   discussing rows, without seeing the other sheet, and without using outside
   knowledge. Judge only the cited passages. Record a 0–1 confidence and a note
   for any row that needs adjudication.
4. **Do not adjudicate while labelling.** Neither annotator may change a label
   after seeing the other sheet. The first-pass labels are the ones used for κ.
5. **Adjudicate disagreements.** A third person (supervisor or designated
   adjudicator) resolves every disagreement from the codebook and the cited
   evidence, and records the adjudicated verdict plus a one-line rationale in
   `adjudication.csv`. Agreement rows copy the agreed label, not a new one.
6. **Unresolved rows.** If the adjudicator cannot defend a gold verdict, mark
   `adjudicated_verdict = unresolved`. Unresolved claims are excluded from the
   frozen set and counted separately. More than 5% unresolved blocks the freeze.
7. **Defect review.** After adjudication, a reviewer who did not label the item
   checks every frozen triple against its passages. Any triple that is wrong or
   unsupported is a defect. Pre-freeze corrections are rework, not defects.

The `validate_items.py score` command computes κ from the two independent
sheets. It does not adjudicate and it does not fill missing labels.

## 6. Agreement, defect, and effort gates

| Quantity | Definition | 24-item gate |
| --- | --- | --- |
| Cohen's κ | Unweighted nominal κ on the two pre-adjudication 3-class verdict columns | **≥ 0.75** |
| Defect rate | Defective frozen claim triples ÷ frozen claim triples, after the independent review in step 7 | **≤ 0.15** |
| `H_attempt` | Total annotation hours ÷ attempted items, summed over authoring, both raters, adjudication, and rework | **≤ 2.0 h/item** |
| Unresolved rate | Unresolved claims ÷ claims sent to adjudication | **≤ 0.05** |

`H_attempt` uses the per-item rows in `annotation/effort.template.csv`:

```text
H_attempt = sum(minutes for all phases) / 60 / number of distinct item_id rows
```

Track authoring, `rater1`, `rater2`, `adjudication`, and `rework` separately so
the 180-item budget can be projected from the measured mix. The roadmap's 410 h
for 180 items is 2.28 h/item; it is a planning envelope, not a measured value.

If κ < 0.75, keep the failed batch in the report, revise the codebook, and run a
fresh calibration batch. Do not delete items or relabel the same rows to raise κ.
If `H_attempt > 2.0` or the defect rate is above 15%, cut the next step to 120
items immediately; do not start the 180-item freeze.

## 7. The 24 → 180 → 300 freeze ladder

| Size | Role | Split | Annotation envelope | Entry condition | Decision |
| ---: | --- | --- | ---: | --- | --- |
| **24** | Calibration batch | 8 / 8 / 8 | ~1 week | protocol frozen | κ ≥ 0.75, defect ≤ 15%, `H_attempt` ≤ 2.0 → 180; otherwise cut to 120 |
| **180** | EG-SSS v1.2 freeze | 60 / 60 / 60 | ~410 h | 24-item calibration passes | freeze by Jan 2027; report κ and defect rate |
| **300** | Full-run target | 100 / 100 / 100 | ~684 h | 180-item set is clean | target by Feb 2027 |
| **600** | Stretch | 200 / 200 / 200 | ~1,368 h | 2–3 dedicated annotators | not built by default |
| **800** | No-go | — | ~1,824 h | — | do not build |

The 120-item contingency is a cut, not a rung: it keeps the protocol alive
without committing to the 180-item freeze. The 600 and 800 rungs are recorded
only to make the no-go decision explicit.

## 8. Files and what is safe to commit

| Path | Contents | Commit? |
| --- | --- | --- |
| `README.md`, `schema.md` | Protocol and field definitions | yes |
| `item.template.json` | One clearly marked skeleton; no real evidence | yes |
| `items.seed.jsonl` | 24 unfilled slots, 8/8/8; no item text | yes |
| `validate_items.py` | Check, sheet generation, κ/defect/effort scoring | yes |
| `annotation/*.template.csv` | Header-only sheets and effort template | yes |
| `status.json` | Counts and blocked reasons only | yes |
| `private/` | Filled items, evidence text, labels, adjudication | **no — gitignored** |

Put every filled workbook under `private/`. The `private/` directory is
gitignored because adapted item text may be non-redistributable and because
annotation sheets contain human labels that must not leak before adjudication.
When the 180-item set is frozen and the licence review is complete, move the
public item file out of `private/` and commit it with the licence and the
provenance block; keep the human label sheets private.

## 9. Run the gate

From the repository root, with the `trustcal` virtual environment:

```bash
# 1. Structural check of the seed batch. This passes with 24 unfilled slots.
python experiments/calibration/validate_items.py check \
  --items experiments/calibration/items.seed.jsonl

# 2. Strict check: exits 2 until every slot is authored. Use this in CI.
python experiments/calibration/validate_items.py check \
  --items experiments/calibration/private/items.jsonl --strict

# 3. After authoring, write blind rater sheets + adjudication workbook.
python experiments/calibration/validate_items.py sheets \
  --items experiments/calibration/private/items.jsonl \
  --out experiments/calibration/private/sheets

# 4. After both raters and the adjudicator finish, score the gate.
python experiments/calibration/validate_items.py score \
  --rater1 experiments/calibration/private/sheets/rater1.csv \
  --rater2 experiments/calibration/private/sheets/rater2.csv \
  --adjudication experiments/calibration/private/sheets/adjudication.csv \
  --effort experiments/calibration/private/sheets/effort.csv \
  --min-kappa 0.75 --max-defect 0.15 --max-hours 2.0 --max-unresolved 0.05
```

The `score` command exits `0` when all supplied gates pass, `2` when one fails,
and `1` when the input is incomplete. If the sheets are empty it exits `1` and
says the gate is blocked; an empty sheet is never a pass.

## 10. What the team must fill in

To turn the seed batch into a real 24-item calibration set:

1. Copy `items.seed.jsonl` to `private/items.jsonl`.
2. For each of the 24 slots, replace the null fields with a real question,
   options (or `null`), gold answer, three positions, 3–6 atomic claims per
   position, and at least one cited passage per claim.
3. Set `status` to `drafted` when the item is complete; use `annotated`,
   `adjudicated`, or `frozen` only after those steps actually happen.
4. Fill the `source` block for every item: `kind`, `citation`, `locator`, and
   `license`. Original items use `kind = "original"` and `CC BY 4.0`.
5. Run the strict check, then generate the sheets and label them.

Do not copy claim or evidence text from a model's own answer without a human
checking the link. Do not invent a passage, a DOI, or a verdict to fill a slot.
An unfilled slot is honest; a fabricated gold triple is a benchmark defect.
