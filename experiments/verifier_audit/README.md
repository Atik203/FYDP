# Verifier audit — 150–200 claim–passage pairs

**Co-author guide:** [`docs/COAUTHOR_GUIDE.md`](../../docs/COAUTHOR_GUIDE.md) — roles, worked examples, and the 4/6-week plan.

**Gate:** Phase N4 (roadmap §5), harness `trustcal/scripts/verifier_audit.py` (P0-6 / WP-08).
**Owner:** P6 + annotators.
**Status (9 Nov 2026): 180 real pairs generated; 0 human labels. BLOCKED on two
annotators and one adjudicator.** This is not a completed audit and no κ or
balanced-accuracy result exists.

The 20-pair synthetic fixture in `trustcal/experiments/verifier-audit/` is a
harness smoke test, not this audit. It stays where it is; do not pool it with the
180 real pairs.

## 1. What this gate decides

The audit measures whether the lexical verifier's claim–passage labels agree
with human judgement. The pre-registered targets are:

| Quantity | Target | Source |
| --- | --- | --- |
| Inter-annotator Cohen's κ | **≥ 0.60** | roadmap §5 |
| Verifier balanced accuracy | **≥ 0.75** | roadmap §5 |

If balanced accuracy is 0.60–0.75, swap the lexical verifier for NLI or the LLM
judge and re-audit before any trust-arm claim. If it is below 0.60, the paper
reports a measurement/negative result; it must not claim a high-`q` result.
Coverage, per-class precision/recall/F1, and the 3×3 confusion matrix are
reported with the headline numbers.

## 2. What is real, what is a placeholder

| Item | Count | Status |
| --- | ---: | --- |
| Real SciFact dev claim–passage pairs | **180** | generated from the public SciFact dev split; 60 supported, 60 contradicted, 60 unverifiable |
| Placeholder pairs | **0** | none; no claim or passage was invented |
| Human rater labels | **0** | the blind sheets are blank |
| Human adjudicated labels | **0** | `human_label` is blank |
| Verifier labels | **180** | computed offline with `LexicalVerifier` (CPU) |

The 60 unverifiable pairs are 20 empty-passage negatives plus 40
topical-but-non-supporting negatives. Every pair has a SciFact expert
`gold_label`; that label is the **source reference**, not a label produced by
this team's two annotators. `pairs.jsonl` holds it and must stay hidden from
annotators. The paper's human audit still requires the two blind sheets.

The committed `seed_manifest.json` records the 180 pair IDs, the class counts,
and a content hash; it contains no claim or passage text. Use it to verify that
a regenerated private seed matches the documented draw.

## 3. Data sources and licensing

| Source | Role | Licence | Where it may live |
| --- | --- | --- | --- |
| SciFact dev (`claims_dev.jsonl` + `corpus.jsonl`) | real claim–passage pairs and source reference labels | CC BY-NC 2.0, internal research use | `private/scifact/` only; never commit |
| B8 retrieval records (`results/**/records.jsonl`) | real pipeline claim–passage pairs | inherits the dataset; GPQA and HLE are gated, MMLU-Pro test text must not be redistributed | `private/b8/` only; never commit |
| 20-pair synthetic fixture | harness smoke test | project fixture | `trustcal/experiments/verifier-audit/` (already committed) |

SciFact is downloaded from
`https://scifact.s3-us-west-2.amazonaws.com/release/latest/data.tar.gz` (about
3 MB). The URL says `latest`, so `seed_manifest.json` pins the SHA-256 of the
downloaded archive (`11c62128…d76be`) alongside the pair IDs and counts; rerun
the builder only against that archive if you need the same draw. The generated
`candidates.jsonl`, `pairs.jsonl`, `audit_sheet.csv`, and blind sheets are under
`experiments/verifier_audit/private/`, which is gitignored. Do not paste SciFact
claim or passage text into a commit, an issue, or a manuscript.

## 4. Sampling protocol

`build_audit.py scifact` uses only the SciFact **dev** split:

- 60 claims with a `SUPPORT` evidence row → `gold_label = supported`;
- 60 claims with a `CONTRADICT` evidence row → `gold_label = contradicted`;
- 60 claims with no evidence row (`NOT_ENOUGH_INFO`) → `gold_label = unverifiable`,
  split into 20 empty-passage negatives and 40 topical-but-non-supporting
  passages.

The sampler is deterministic (`--seed 0` by default), takes at most one pair per
claim, and shuffles the final order so the blind sheets are not grouped by
class. The dev split has 124 supported, 64 contradicted, and 112 unverifiable
claims, so the dev-only ceiling is 192 (64 per class); the default 180 leaves
four contradicted claims unused. `--n 200` is rejected rather than silently
mixing splits because it would need 66 contradicted claims.

For pipeline pairs, `build_audit.py extract` reads the `verdicts` entries that
`DebateRunner` writes into each record (`claim`, `passages`, `verdict`,
`verifier`, `scores`). It deduplicates identical `(claim, passages)` pairs and
stratifies by the recorded verifier label. Retrieval has not run in this
workspace, so the current B7 smoke record yields **0** pipeline pairs; that is
expected, not a failure.

**Coverage limitation:** SciFact is a biomedical corpus, so this seed measures
the verifier on biomedical claims only. It does not establish accuracy on the
physics/chemistry or math/CS strata. The B8 pipeline branch, or a second
expert-labelled source for those domains, is required before claiming
domain-general verifier accuracy.

## 5. Schemas

### `pairs.jsonl` (harness input)

One object per line, matching `verifier_audit.read_pairs`:

```json
{"id": "scifact-dev-0123-sup", "claim": "...", "passages": ["..."], "gold_label": "supported"}
```

`gold_label` is one of `supported`, `contradicted`, `unverifiable`. The harness
rejects duplicate IDs, empty claims, non-string passages, and unknown labels.

### Blind rater sheets (`sheets/rater1.csv`, `sheets/rater2.csv`)

Written by `verifier_audit.py make` with the harness schema:

```text
pair_id, claim, passages, label, confidence, notes
```

`label`, `confidence`, and `notes` are blank. `gold_label` never appears in a
rater sheet. Annotators fill only those three columns.

### Master audit sheet (`audit_sheet.csv`)

The analysis workbook is **not** the blind sheet. Do not give it to annotators;
it contains the verifier label, which would bias them.

```text
pair_id, stratum, claim, passages, verifier_label,
rater1_label, rater2_label, human_label, confidence, notes
```

`human_label` is the adjudicated reference, not a copy of `rater1_label`.
`stratum` is `biomedical` for the SciFact draw; pipeline pairs use the dataset
or an explicit stratum if the record carries one. `confidence` is the
adjudicator's 0–1 confidence in `human_label`; `notes` records the adjudication
reason. The header-only committed template is
[`audit_sheet.template.csv`](audit_sheet.template.csv).

## 6. Annotation and adjudication protocol

1. **Freeze the pool.** Do not add, drop, or reorder pairs after labelling
   starts. Record the generation command, `--seed`, and the `manifest.json`
   hash in the audit report.
2. **Label independently.** Rater 1 fills `sheets/rater1.csv`; rater 2 fills
   `sheets/rater2.csv`. Neither sees the other sheet, `pairs.jsonl`, the master
   `audit_sheet.csv`, or the verifier label. Judge the claim as written against
   the passages only; do not use outside knowledge.
3. **Use the codebook.** `sheets/codebook.md` is written by the harness and is
   the operative rubric: refutation first, numbers after unit conversion,
   negation flips the label, topical overlap is not support, empty passages are
   always `unverifiable`.
4. **Adjudicate disagreements.** A third person copies both labels into
   `audit_sheet.csv`, resolves every disagreement from the codebook and the
   passages, and fills `human_label` plus `notes`. Agreement rows copy the
   agreed label. If a row cannot be defended, write `unresolved`; it is excluded
   from accuracy and reported separately.
5. **Do not tune the rubric on the audit set.** If κ < 0.60, fix the codebook
   and draw a fresh batch. Do not delete hard rows or relabel them to raise κ.

## 7. Scoring

After the master sheet is filled:

```bash
python experiments/verifier_audit/build_audit.py assemble \
  --audit-sheet experiments/verifier_audit/private/scifact/audit_sheet.csv \
  --out experiments/verifier_audit/private/scifact/assembled

python trustcal/scripts/verifier_audit.py score \
  --rater1 experiments/verifier_audit/private/scifact/assembled/rater1.csv \
  --rater2 experiments/verifier_audit/private/scifact/assembled/rater2.csv \
  --gold experiments/verifier_audit/private/scifact/assembled/pairs_human.jsonl \
  --pred experiments/verifier_audit/private/scifact/assembled/verifier_predictions.csv
```

`assemble` prints `kappa_all_rows` (κ over every pair with two rater labels,
including rows later marked unresolved) and `kappa_resolved_rows` (κ over the
scoreable set). Report `kappa_all_rows` as the protocol κ; the harness `score`
reports κ on the scoreable set because it requires the gold and rater sets to
match. If there are no unresolved rows the two values are identical.

Report the SciFact source-gold comparison and the human-adjudicated comparison
as two separate results. The SciFact label is an expert dataset annotation, not
a label produced by this team; do not describe it as a team annotation.

Exit codes from `verifier_audit.py score`: `0` target met, `2` below target,
`1` usage/data error (including blank sheets). A blank sheet is a blocked audit,
never a pass.

## 8. Current files and what is safe to commit

| Path | Contents | Commit? |
| --- | --- | --- |
| `README.md` | This protocol | yes |
| `build_audit.py` | SciFact/B8 seed builder, assembler, status | yes |
| `audit_sheet.template.csv` | Header-only master-sheet schema | yes |
| `seed_manifest.json` | Pair IDs and counts only; no claim or passage text | yes |
| `status.json` | Counts and blocked reasons only | yes |
| `private/scifact/` | Downloaded SciFact corpus, 180 real pairs, verifier labels, blank sheets, source gold | **no — gitignored** |
| `private/b8/` | Pipeline claim–passage pairs; may contain gated item text | **no — gitignored** |

The committed `status.json` is generated from the private run and contains
counts, not claim or passage text. Re-running the builder overwrites the private
files and the IDs-only `seed_manifest.json`; it writes no claim or passage text
outside `experiments/verifier_audit/private/`.

## 9. Next commands

```bash
# Regenerate the real 180-pair seed (network only for the first download).
python experiments/verifier_audit/build_audit.py scifact --download

# Show the current count; blocked means human_label is still empty.
python experiments/verifier_audit/build_audit.py status \
  --dir experiments/verifier_audit/private/scifact

# After a retrieval run, build the pipeline-pair branch instead of / alongside SciFact.
python experiments/verifier_audit/build_audit.py extract \
  --records trustcal/results/B8/gpqa/seed1/records.jsonl

# Prove the schema loads and the gate is blocked, not passed.
python trustcal/scripts/verifier_audit.py score \
  --rater1 experiments/verifier_audit/private/scifact/sheets/rater1.csv \
  --rater2 experiments/verifier_audit/private/scifact/sheets/rater2.csv \
  --gold experiments/verifier_audit/private/scifact/pairs.jsonl
# expected now: exit 1, "180 unlabelled rows"
```

## 10. Blockers

- Two human annotators for 180 pairs, plus adjudication time. The agent did not
  label the audit and must not be treated as an annotator.
- The adjudicator must fill `human_label`; `assemble` refuses blank labels and
  excludes `unresolved` rows explicitly.
- A B8 retrieval run is needed for the pipeline-pair branch. The SciFact branch
  is complete without it and is the current seed.
- SciFact is CC BY-NC 2.0. The generated pairs are internal only; the paper must
  report the source, licence, and sampling seed, and must not redistribute the
  text.
