# EG-SSS item schema (v0.1)

One JSON object per item. The seed batch is JSONL; a single-item template is
JSON. The validator accepts either a JSON list or one object per JSONL line.

## Item-level fields

| Field | Type | Required | Meaning |
| --- | --- | --- | --- |
| `schema_version` | string | yes | `"egsss-item-v0.1"` |
| `item_id` | string | yes | Stable ID, unique in the batch; e.g. `cal-001` |
| `stratum` | enum | yes | `biomedical`, `physics_chemistry`, or `math_cs` |
| `status` | enum | yes | `unfilled`, `drafted`, `annotated`, `adjudicated`, or `frozen` |
| `question` | string | when authored | The question shown to the debating agents |
| `options` | string[] or null | when authored | Answer options in display order; `null` for free-form |
| `gold_answer` | string | when authored | Correct answer, used only for direction scoring |
| `source` | object | when authored | Provenance; see below |
| `pressure_eligible` | boolean | when authored | True when a correct minority can be pressured |
| `minority_agent` | integer or null | when authored | Agent holding the correct minority at round 1 |
| `conditions` | string[] | when authored | Supported conditions: `evidence_available`, `evidence_absent`, `evidence_placebo`, `evidence_contradictory` |
| `positions` | object[] | when authored | Exactly three positions, `agent` 0, 1, 2 |
| `draft_assisted` | boolean | no | True if an LLM drafted text; a human still verified every claim |
| `notes` | string | no | Authoring notes, never a gold label |
| `template` | boolean | no | `true` only for the template skeleton; the validator skips it |

### `source` object

| Field | Type | Required | Meaning |
| --- | --- | --- | --- |
| `kind` | enum | yes | `original` or `adapted` |
| `citation` | string or null | adapted only | Human-readable citation |
| `locator` | string or null | adapted only | DOI, PMID, arXiv ID, or URL |
| `license` | string | yes | `CC BY 4.0` for original items |
| `changes` | string or null | adapted only | What was changed from the source |

## Position object

| Field | Type | Required | Meaning |
| --- | --- | --- | --- |
| `agent` | integer | yes | 0, 1, or 2; unique within the item |
| `answer` | string or null | yes | The position's initial answer; usually matches one option |
| `claims` | object[] | yes | 3–6 atomic claims for this position |

## Claim object

| Field | Type | Required | Meaning |
| --- | --- | --- | --- |
| `claim_id` | string | yes | Stable ID, unique across the batch; e.g. `cal-001-a0-c1` |
| `text` | string | yes | One atomic, checkable proposition |
| `atomic` | boolean | yes | Must be `true`; split compound claims before annotating |
| `evidence` | object[] | yes | At least one cited passage |
| `gold_verdict` | enum | yes | `support`, `contradict`, or `neutral` |
| `gold_confidence` | number | yes | Author's confidence in the gold verdict, 0–1 |
| `verdict_rationale` | string | yes | Why the passages produce this verdict |
| `annotator_notes` | string or null | no | Notes from labelling |
| `adjudication` | string or null | no | Adjudicator's rationale after disagreement |
| `defect_flag` | boolean or null | no | Set during independent defect review |

The claim text must be checkable against the cited passages alone. The gold
verdict is about those passages, not about whether the claim is true in the
world. `neutral` includes empty evidence, off-topic evidence, and passages that
share words with the claim but do not state the relation.

### Verdict decision order

1. If any cited passage contradicts the claim as written, the verdict is
   `contradict`, even when another passage supports it.
2. Otherwise, if at least one cited passage entails the claim, the verdict is
   `support`.
3. Otherwise, the verdict is `neutral`.

Numbers must match after unit conversion. Negation flips the relation. A
passage that mentions the topic without stating the relation is not support.

## Evidence object

| Field | Type | Required | Meaning |
| --- | --- | --- | --- |
| `passage_id` | string | yes | Stable ID, unique across the batch; e.g. `cal-001-a0-c1-e1` |
| `text` | string | yes | Verbatim or faithfully excerpted passage |
| `source` | string | yes | `PubMed`, `arXiv`, `Semantic Scholar`, `Original derivation`, etc. |
| `locator` | string | yes | DOI, PMID, arXiv ID, or URL that resolves the passage |
| `retrieved_at` | string | yes | ISO date (`YYYY-MM-DD`) the passage was checked |
| `license` | string | yes | Licence of the source passage |
| `notes` | string | no | Quotation or selection notes |

Never store a passage without a locator. If the evidence is an original
derivation written by the team, use `source = "Original derivation"`, set
`locator` to the internal note or appendix ID, and use the item licence.

## Status lifecycle

| Status | Meaning | What may change |
| --- | --- | --- |
| `unfilled` | Slot reserved; no content | Anything |
| `drafted` | Content complete; not labelled | Question, claims, evidence after author review; no labels yet |
| `annotated` | Both raters labelled every claim | Labels are frozen for κ; only adjudication may follow |
| `adjudicated` | Every disagreement resolved or marked unresolved | Gold verdicts and rationales are frozen |
| `frozen` | Defect review complete; included in the batch | No edits; a correction creates a new version |

Do not set `frozen` before the independent defect review. A frozen item that is
later corrected keeps its old version in the calibration report and receives a
new `item_id` suffix (`-v2`); do not silently overwrite the frozen record.
