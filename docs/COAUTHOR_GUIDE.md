# Co-Author Guide — TrustCal FYDP

**Project:** The Boundaries of Evidence-Grounded Trust in Multi-Agent Scientific Debate, with a Controlled Benchmark for Sycophantic Consensus

**Repository:** <https://github.com/Atik203/trustcal>

**Guide for:** Authors 2–6 (the five co-authors)

**Sprint length:** **6 weeks recommended** (5 active weeks + 1 buffer). A 4-week compressed plan is possible only under the conditions in Section 8.

**Status:** onboarding and task division. This guide does not replace the pre-registration, the calibration protocol, or the verifier-audit protocol.

**No prior annotation experience is needed.** Every label is defined below and in the two codebooks. The first two days are for reading and a short practice batch. Start with Section 3.

> **Note on Author 1.** Author 1 (Atik) is the first author and handles the experiments, the Python pipeline, the GPU runs, the item drafting with AI agents, the analysis, and the related-work matrix. Author 1 is **not an annotator** in this guide. The tasks below are the human-judgment work that cannot be delegated to an agent without changing the study.

---

## 1. What this project is, in plain language

A multi-agent debate asks several language models the same scientific question, lets them read each other's answers for a few rounds, and then combines their final answers. The failure we study is **sycophantic collapse**: a correct minority agent abandons the right answer because a confident wrong majority pushes back.

TrustCal changes the combination rule. Instead of counting votes equally, it gives each agent a **trust weight** based on how well that agent's claims hold up against retrieved scientific evidence. An agent whose claims are supported by the evidence keeps influence; an agent whose claims are contradicted loses influence.

The project has two human-labeling gates. They are small in count but central to the thesis:

| Gate | What it tests | Why it matters |
| --- | --- | --- |
| **SciClaimBench 24-item calibration** | Can two humans apply the claim–evidence–verdict codebook with Cohen's κ ≥ 0.75, a defect rate ≤ 15%, and at most 2.0 hours per item? | It decides whether the team can build the 180-item gold-evidence benchmark without wasting ~410 hours. |
| **Verifier audit (180 SciFact pairs)** | Does the lexical verifier agree with human judgement at κ ≥ 0.60 and balanced accuracy ≥ 0.75? | The trust signal is only as good as the verifier. If the verifier is weak, the trust arm cannot be interpreted. |

Both gates are currently blocked on human work:

- SciClaimBench: **0 of 24 items authored**, 0 claims, 0 human labels.
- Verifier audit: **180 real pairs ready**, 0 human labels.

You are not being asked to run models, write code, or build the literature review. You are being asked to read evidence carefully, apply a short codebook, and record a label with confidence and a note.

---

## 2. Your tasks at a glance

| Person | Main role | Main tasks | Main deliverables |
| --- | --- | --- | --- |
| **Author 1 — Atik** | First author; pipeline and experiments | Draft SciClaimBench items with agents, run the GPU pipeline, compute agreement/accuracy, write the analysis, integrate the paper | Draft items, score reports, manuscript numbers |
| **Author 2 — Rakibul** | **Annotation lead** | Facilitate the rater calibration session, prepare batches, protect blinding, rate the verifier audit, co-author SciClaimBench items, write the agreement report | Calibration notes, verifier rater sheet, agreement report, adjudication coordination |
| **Author 3 — Salman** | **SciClaimBench item lead** | Verify claim atomicity and evidence locators, cross-review items, QA the verifier-audit sheets | Item-verification checklist, defect log, verifier QA note |
| **Author 4 — Pratay** | **SciClaimBench rater 1; verifier rater 2** | Label all SciClaimBench claims and all 180 verifier pairs; check statistics | Two completed rater sheets, statistics check |
| **Author 5 — Yousuf** | **SciClaimBench rater 2; paper-support lead** | Label all SciClaimBench claims; run the number/citation/terminology check on the manuscripts | Second SciClaimBench sheet, paper-support checklist |
| **Author 6 — Limu** | **Adjudicator; data/licence steward** | Adjudicate both audits, check licences and private-data handling, maintain the adjudication log | Adjudicated sheets, licence/PII checklist |

**Why Author 2 runs the calibration.** “Training” here means **human rater calibration**, not model training. The models are frozen and inference-only; no model is trained in this project. Agents can prepare the calibration deck, examples, and practice rows, but Author 2 runs the 30-minute session, records the decisions, and owns blinding and agreement. This keeps the first author from anchoring the raters.

### Who rates what

| Audit | Raters | Adjudicator | Independent review |
| --- | --- | --- | --- |
| SciClaimBench 24-item | Author 4, Author 5 | Author 6 | Authors 2 and 3 cross-review items they did not author |
| Verifier audit 180 | Author 2, Author 4 | Author 6 | Author 3 checks sheet integrity and blinding |

**Independence rules.** A rater must not label an item they authored. A rater must not see the other rater's sheet, the gold verdict, the verifier label, or the arm label. The adjudicator sees both rater sheets and the evidence, but not the gold or verifier label. If you recognize an item from another batch, tell Author 2 before labeling it.

Author 1 is not a rater. This is deliberate: the first author knows the expected result and must not contaminate the human agreement estimate.

---

## 3. Before you start

### Read these documents first

| Order | File | Why |
| ---: | --- | --- |
| 1 | [`README.md`](../README.md) | Project status, claim boundary, repository map |
| 2 | [`FYDP_Summer/fydp.pdf`](../FYDP_Summer/fydp.pdf) | The full report; read the abstract, Chapter 3, and Chapter 4 |
| 3 | [`PRE_REGISTRATION.md`](../PRE_REGISTRATION.md) | Endpoints, hypotheses, exclusions, stopping rules |
| 4 | [`experiments/calibration/README.md`](../experiments/calibration/README.md) | SciClaimBench protocol, κ/defect/effort gates, 24 → 180 → 300 ladder |
| 5 | [`experiments/calibration/schema.md`](../experiments/calibration/schema.md) | Item, position, claim, evidence, and verdict fields |
| 6 | [`experiments/verifier_audit/README.md`](../experiments/verifier_audit/README.md) | 180-pair audit, blind sheets, κ and balanced accuracy |
| 7 | [`docs/GLOSSARY.md`](GLOSSARY.md) | Terms and metric names |
| 8 | This guide | Your role, examples, deadlines, and submission rules |

You do **not** need to read the full literature review, the entire 70-page report, or the Python code. The eight documents above are enough to start. If a term is missing, check the glossary before asking.

### Direct links

Use these links directly. Do not search the repository for the files.

| Resource | Link |
| --- | --- |
| Repository | <https://github.com/Atik203/trustcal> |
| Project README | <https://github.com/Atik203/trustcal/blob/main/README.md> |
| Full report PDF | <https://github.com/Atik203/trustcal/blob/main/FYDP_Summer/fydp.pdf> |
| Journal PDF | <https://github.com/Atik203/trustcal/blob/main/Papev_Summer26_6/cas-sc-template.pdf> |
| Pre-registration | <https://github.com/Atik203/trustcal/blob/main/PRE_REGISTRATION.md> |
| Roadmap and gates | <https://github.com/Atik203/trustcal/blob/main/roadmap.md> |
| SciClaimBench protocol | <https://github.com/Atik203/trustcal/blob/main/experiments/calibration/README.md> |
| SciClaimBench schema | <https://github.com/Atik203/trustcal/blob/main/experiments/calibration/schema.md> |
| SciClaimBench validator | <https://github.com/Atik203/trustcal/blob/main/experiments/calibration/validate_items.py> |
| SciClaimBench sheet templates | <https://github.com/Atik203/trustcal/tree/main/experiments/calibration/annotation> |
| Verifier audit protocol | <https://github.com/Atik203/trustcal/blob/main/experiments/verifier_audit/README.md> |
| Verifier audit builder | <https://github.com/Atik203/trustcal/blob/main/experiments/verifier_audit/build_audit.py> |
| Verifier audit master template | <https://github.com/Atik203/trustcal/blob/main/experiments/verifier_audit/audit_sheet.template.csv> |
| Co-author templates | <https://github.com/Atik203/trustcal/tree/main/docs/coauthor/templates> |
| Glossary | <https://github.com/Atik203/trustcal/blob/main/docs/GLOSSARY.md> |
| Claims audit (report) | <https://github.com/Atik203/trustcal/blob/main/FYDP_Summer/CLAIMS_AUDIT.md> |
| Defence Q&A | <https://github.com/Atik203/trustcal/blob/main/docs/FYDP1_defence_Q&A.md> |
| Compute and cost model | <https://github.com/Atik203/trustcal/blob/main/docs/agent/08_COMPUTE_COST.md> |
| Private annotation folder | Author 1 posts the link in the team channel before Day 1. It is not in this public repository. |

### How to use these links

1. Click the link and read it in the browser.
2. For a CSV, click **Raw** or **Download**, then save a copy in the private folder.
3. Do not click **Fork**, **Pull request**, or **Commit** unless Author 1 asks.
4. If a link is broken, tell Author 1 in the team channel. Do not search for a replacement alone; the wrong version of a protocol is worse than a delay.
5. Do not paste private sheets, raw SciFact text, or model outputs into a public issue or an external AI tool.

### Access checklist

- [ ] GitHub account (the repository is public, so read access is enough).
- [ ] Access to the shared private folder for annotation sheets. Author 1 will post the link.
- [ ] Google Sheets or Excel, and a PDF reader.
- [ ] The team communication channel and the weekly meeting invite.
- [ ] Agreement not to copy private data, PII, or model outputs into public tools.
- [ ] Roughly **3–5 hours per week** for five weeks, or **4–5 hours per week** for the compressed four-week plan.

### Day 1–2 onboarding

| Day | Task | Output |
| ---: | --- | --- |
| 1 | Read the eight documents above; complete the access checklist | Notes and questions |
| 2 | 30-minute walkthrough; label the practice rows in Sections 4.3 and 5.3; compare labels | Practice notes and calibration discussion |

Do not start a real batch until the practice rows are discussed. The first batch is for calibration, not for the final data.

---

## 4. Task A — SciClaimBench 24-item calibration

### 4.1 What it is

SciClaimBench is the team-built gold-evidence benchmark. The 24-item batch is balanced across three strata:

| Stratum | Items | Content |
| --- | ---: | --- |
| Biomedical | 8 | clinical, molecular, pharmacological, epidemiological |
| Physics / chemistry | 8 | physical laws, materials, reactions, measurement |
| Mathematics / computer science | 8 | proofs, algorithms, complexity, systems |

One item has one question, three agent positions, and 3–6 atomic claims per position. Each claim has at least one cited evidence passage and one gold verdict: `support`, `contradict`, or `neutral`.

The annotation unit is a **claim–evidence–verdict triple**, not an item and not a whole answer.

### 4.2 What the labels mean

| Label | Use it when |
| --- | --- |
| `support` | At least one cited passage entails the claim as written, and no cited passage refutes it. |
| `contradict` | At least one cited passage asserts the claim is false: opposite result, different number, negated relation, or different entity. |
| `neutral` | The passages are empty, off-topic, or only topical. They do not establish or refute the claim. |

**Decision order.** Check refutation first. One clear contradiction outranks any supporting passage. If nothing contradicts, look for one passage that entails the claim. If neither holds, use `neutral`.

**Rules that decide most disagreements**

- Judge the claim as written. Do not correct it, and do not use outside knowledge.
- A passage that mentions the topic but does not state the relation is **not** support.
- Numbers must match after unit conversion. `100 °C` and `212 °F` agree; `90` and `100` do not.
- Negation flips the relation: "does not inhibit" contradicts "inhibits".
- A compound claim needs both parts supported. One supported half is not enough.
- Empty or missing evidence is `neutral`.

### 4.3 Practice rows

Label these five rows before the kickoff meeting. They are illustrative, not real items.

| # | Claim | Passage | Correct label | Why |
| ---: | --- | --- | --- | --- |
| 1 | Drug X reduced systolic blood pressure by 12 mmHg versus placebo. | In the trial, systolic blood pressure fell 12 mmHg in the Drug X arm and 1 mmHg in the placebo arm. | `support` | The passage states the relation and the number. |
| 2 | Drug X reduced systolic blood pressure by 12 mmHg versus placebo. | There was no significant difference in systolic blood pressure between Drug X and placebo. | `contradict` | The passage denies the claimed effect. |
| 3 | Drug X reduced systolic blood pressure by 12 mmHg versus placebo. | The trial enrolled 120 adults with treated hypertension. | `neutral` | The passage is on-topic but does not state the effect. |
| 4 | Drug X reduced systolic blood pressure and increased heart rate. | Drug X reduced systolic blood pressure by 12 mmHg; heart rate was not reported. | `neutral` | Only one part of the compound claim is supported. |
| 5 | The reaction released 100 °C of heat. | The reaction reached 212 °F. | `support` | The numbers agree after unit conversion. |

If your labels differ from this table, discuss why before the first real batch. Do not silently adopt the table; the point is to expose ambiguity in the codebook.

### 4.4 Who does what

| Person | Job |
| --- | --- |
| Author 1 | Draft 24 items with AI agents; fill the seed schema; run the validator; generate blind sheets |
| Authors 2 and 3 | Verify each item: question, three positions, atomic claims, evidence locator, licence, no gated text; cross-review each other's items |
| Authors 4 and 5 | Label every claim independently; no discussion before both sheets are submitted |
| Author 6 | Adjudicate every disagreement; fill the adjudication workbook; coordinate the defect review |
| Authors 2 and 3 | Cross-review frozen triples for defects after adjudication |

Author 1 may use an LLM to draft item text. Every claim, evidence link, and gold verdict must be checked by a human. Set `draft_assisted: true` on those items.

### 4.5 Step by step

**Step 1 — Draft and freeze the candidate items (Author 1).**

```bash
cp experiments/calibration/items.seed.jsonl experiments/calibration/private/items.jsonl
python experiments/calibration/validate_items.py check \
  --items experiments/calibration/private/items.jsonl --strict
```

Fill all 24 slots. Do not put a gold verdict into a rater sheet. Set `status` to `drafted` only when the item is complete.

**Step 2 — Verify the items (Authors 2 and 3).**

Use [`item_verification_checklist.md`](coauthor/templates/item_verification_checklist.md). For every item check:

- the question is answerable and the gold answer is one of the options;
- there are exactly three positions, agents 0, 1, and 2;
- each position has 3–6 atomic claims;
- every claim has at least one evidence passage with a resolvable locator;
- the passage supports, contradicts, or is neutral to the claim as written;
- no GPQA, HLE, or MMLU-Pro test text appears in the item;
- the licence and provenance block is complete.

Return a written list of problems to Author 1. Do not edit the item text yourself unless Author 1 asks.

**Step 3 — Generate blind sheets (Author 1).**

```bash
python experiments/calibration/validate_items.py sheets \
  --items experiments/calibration/private/items.jsonl \
  --out experiments/calibration/private/sheets
```

This writes `rater1.csv`, `rater2.csv`, `adjudication.csv`, `effort.csv`, and `manifest.json`. The gold verdict does not appear in the rater sheets.

**Step 4 — Label independently (Authors 4 and 5).**

Download your sheet from the private folder. Save a copy as `rater1_<initials>.csv` or `rater2_<initials>.csv`. Fill every row:

- `verdict`: `support`, `contradict`, or `neutral`;
- `confidence`: 0–1;
- `notes`: a short reason for any hard row.

Do not discuss rows with the other rater before both sheets are submitted. Do not open the other sheet, the adjudication workbook, or the item source. Judge only the claim and the cited passages.

**Step 5 — Adjudicate (Author 6).**

After both sheets are submitted, copy them to the canonical names `rater1.csv` and `rater2.csv` in the private folder. Fill `adjudication.csv`:

- `rater1_verdict`, `rater2_verdict`, and `agreement` are copied from the two sheets;
- `adjudicated_verdict` is your decision from the codebook and the evidence;
- `adjudication_notes` is one line of reasoning;
- `defect_flag` and `defect_type` are filled during the defect review.

If you cannot defend a gold verdict, write `unresolved`. Unresolved claims are excluded and reported separately. More than 5% unresolved blocks the freeze.

**Step 6 — Defect review (Authors 2 and 3).**

After adjudication, review the frozen triples you did not author. A defect is a claim–evidence–verdict triple that is wrong or unsupported. Mark `defect_flag` and `defect_type`. Pre-freeze corrections are rework, not defects.

**Step 7 — Score the gate (Author 1).**

```bash
python experiments/calibration/validate_items.py score \
  --rater1 experiments/calibration/private/sheets/rater1.csv \
  --rater2 experiments/calibration/private/sheets/rater2.csv \
  --adjudication experiments/calibration/private/sheets/adjudication.csv \
  --effort experiments/calibration/private/sheets/effort.csv \
  --min-kappa 0.75 --max-defect 0.15 --max-hours 2.0 --max-unresolved 0.05
```

Exit code `0` means all supplied gates pass. Exit code `2` means a gate failed. Exit code `1` means the input is incomplete; an empty sheet is **not** a pass.

### 4.6 What can go wrong

| Mistake | Why it hurts | What to do |
| --- | --- | --- |
| Using outside knowledge | Measures your knowledge, not the evidence | Judge only the cited passages |
| Treating a topic match as support | Inflates support and κ | Ask whether the passage states the relation |
| Missing a negation | Flips the label | Read the sentence literally, then check the polarity |
| Labeling a compound claim as support | Overstates the evidence | Split the claim or use `neutral` |
| Discussing before submission | Destroys independence and κ | Wait until both sheets are frozen |
| Relabeling to raise κ | Corrupts the audit | Keep the failed batch; revise the codebook and redraw |
| Guessing | Creates a false gold standard | Use `neutral` with low confidence and a note |

### 4.7 Deliverables and time

| Deliverable | Owner | When |
| --- | --- | --- |
| 24 drafted items | Author 1 | End of Week 1 |
| Item verification checklist | Authors 2 and 3 | End of Week 2 |
| Blind sheets generated | Author 1 | End of Week 2 |
| Two completed rater sheets | Authors 4 and 5 | End of Week 3 |
| Adjudication workbook | Author 6 | End of Week 4 |
| Defect review | Authors 2 and 3 | End of Week 4 |
| Score report | Author 1 | End of Week 4 |

Planning estimate: **25–35 person-hours** for the 24-item batch, including drafting review, two raters, adjudication, defect review, and rework. At 2.0 hours per item the gate cap is 48 person-hours.

---

## 5. Task B — Verifier audit, 180 SciFact pairs

### 5.1 What it is

The verifier decides whether a retrieved passage supports a claim. If the verifier is wrong, the trust weights are wrong. The audit measures that agreement on 180 real SciFact dev pairs:

- 60 supported;
- 60 contradicted;
- 60 unverifiable (20 empty passages and 40 topical-but-non-supporting passages).

Two people label every pair independently. A third person adjudicates. The gate is **Cohen's κ ≥ 0.60** between raters and **balanced accuracy ≥ 0.75** of the verifier against the adjudicated labels.

The current status is: **180 real pairs generated, 0 human labels**. The blind sheets are ready in the private folder. No κ or balanced-accuracy result exists yet.

### 5.2 What the labels mean

| Label | Use it when |
| --- | --- |
| `supported` | At least one passage states the claim, and no passage contradicts it. |
| `contradicted` | At least one passage states the claim is false: opposite result, different number, negated relation, or different entity. |
| `unverifiable` | There are no usable passages, the passages are off-topic, or they only share words with the claim. |

**Decision procedure**

1. Read the claim once, literally. Identify the subject, predicate, number, unit, direction, and polarity.
2. Read every passage. Check refutation first.
3. If nothing refutes it, look for one passage that entails the claim as written.
4. If neither holds, use `unverifiable`. Abstaining is correct and useful.

### 5.3 Practice rows

| # | Claim | Passages | Correct label | Why |
| ---: | --- | --- | --- | --- |
| 1 | Drug X lowers systolic blood pressure. | In the trial, systolic blood pressure fell 12 mmHg on Drug X versus 1 mmHg on placebo. | `supported` | The passage states the claimed relation. |
| 2 | Drug X lowers systolic blood pressure. | There was no significant difference in systolic blood pressure between Drug X and placebo. | `contradicted` | The passage denies the relation. |
| 3 | Drug X lowers systolic blood pressure. | The trial enrolled 120 adults with treated hypertension. | `unverifiable` | The passage is on-topic but does not state the relation. |
| 4 | Drug X lowers systolic blood pressure. | *(empty passage)* | `unverifiable` | Empty evidence never supports a claim. |
| 5 | Drug X lowers systolic blood pressure. | Drug X is a small molecule with a molecular weight of 412 Da. | `unverifiable` | Topical overlap is not support. |

### 5.4 Who does what

| Person | Job |
| --- | --- |
| Author 2 | Verifier audit rater 1; annotation lead; batch preparation and blinding |
| Author 4 | Verifier audit rater 2 |
| Author 6 | Adjudicator; fills `human_label` and the adjudication notes |
| Author 3 | QA: checks row counts, blank columns, blinding, and that no gold or verifier label leaked into a rater sheet |

### 5.5 Step by step

**Step 1 — Check the seed (Author 1 or Author 2).**

```bash
python experiments/verifier_audit/build_audit.py status \
  --dir experiments/verifier_audit/private/scifact
```

The expected current status is `blocked: true` with 180 real pairs and 0 human labels.

**Step 2 — Share the blind sheets (Author 1).**

The private folder contains:

```text
experiments/verifier_audit/private/scifact/sheets/rater1.csv
experiments/verifier_audit/private/scifact/sheets/rater2.csv
experiments/verifier_audit/private/scifact/sheets/codebook.md
```

Do not share `pairs.jsonl`, `audit_sheet.csv`, or `verifier_predictions.csv` with the raters. They contain the gold or verifier label.

**Step 3 — Label independently (Authors 2 and 4).**

Fill only `label`, `confidence`, and `notes`. Use the exact strings `supported`, `contradicted`, or `unverifiable`. Do not change `pair_id`, `claim`, or `passages`. Do not discuss individual rows before both sheets are submitted.

**Step 4 — Assemble and adjudicate (Author 1 and Author 6).**

After both sheets are complete, copy them to the canonical names and assemble:

```bash
python experiments/verifier_audit/build_audit.py assemble \
  --audit-sheet experiments/verifier_audit/private/scifact/audit_sheet.csv \
  --out experiments/verifier_audit/private/scifact/assembled
```

Author 6 fills `human_label`, `confidence`, and `notes` in `audit_sheet.csv` for every disagreement and copies the agreed label for agreement rows. If a row cannot be defended, write `unresolved`; it is excluded from accuracy and reported separately.

**Step 5 — Score (Author 1).**

```bash
python trustcal/scripts/verifier_audit.py score \
  --rater1 experiments/verifier_audit/private/scifact/assembled/rater1.csv \
  --rater2 experiments/verifier_audit/private/scifact/assembled/rater2.csv \
  --gold experiments/verifier_audit/private/scifact/assembled/pairs_human.jsonl \
  --pred experiments/verifier_audit/private/scifact/assembled/verifier_predictions.csv
```

Report `kappa_all_rows` as the protocol κ and `kappa_resolved_rows` as the scoreable-set κ. Report balanced accuracy, per-class precision/recall/F1, and the 3×3 confusion matrix.

### 5.6 What can go wrong

| Mistake | Why it hurts | What to do |
| --- | --- | --- |
| Opening `pairs.jsonl` or `audit_sheet.csv` | Leaks the source gold or verifier label | Use only your rater sheet and the codebook |
| Using outside knowledge | Measures your knowledge, not the passage | Judge only the passages |
| Treating a topic match as support | Inflates balanced accuracy | Ask whether the relation is stated |
| Guessing to avoid an abstention | Creates a false gold label | Use `unverifiable` with low confidence |
| Discussing rows before submission | Destroys independence | Wait until both sheets are frozen |
| Relabeling to raise κ | Corrupts the audit | Keep the failed batch; revise the codebook and redraw |

### 5.7 Deliverables and time

| Deliverable | Owner | When |
| --- | --- | --- |
| Two completed 180-row sheets | Authors 2 and 4 | End of Week 2 |
| Adjudicated master sheet | Author 6 | End of Week 3 |
| κ and balanced-accuracy report | Author 1 | End of Week 3 |
| QA and blinding note | Author 3 | End of Week 3 |

Planning estimate: **4–6 hours per rater**, **2–3 hours of adjudication**, and **1–2 hours of QA**, plus onboarding. The full audit is roughly **12–18 person-hours**.

---

## 6. Task C — Paper support and data stewardship

These tasks start after the annotation batches are under control. They are not a substitute for the annotation work.

### Author 5 — Paper-support lead

Use [`paper_support_checklist.md`](coauthor/templates/paper_support_checklist.md).

- **Number check.** Every number in the report or journal must appear in a config, manifest, ledger, artifact, or cited source. If it does not, mark `TBD` and tell Author 1.
- **Citation check.** Every citation key exists; the author, year, and venue are correct; the sentence is supported by the source.
- **Terminology check.** Use one name per concept: trust weight, verdict, supported/contradicted/neutral, pressure-eligible, correct-minority retention.
- **Limitations check.** The report must state verifier quality, retrieval coverage, shared error, model coverage, and the fact that the Core and Full matrices have not run.
- **Proofread.** Do not add new claims. Do not invent a number or a citation.

### Author 3 — Claim and evidence consistency

- Check that the 24 SciClaimBench items and the verifier-audit examples use the same definitions as the report.
- Check that no gated dataset text appears in a committed item or audit file.
- Check that the evidence locators resolve and the licence block is complete.

### Author 4 — Statistics check

- Check that κ, balanced accuracy, defect rate, and `H_attempt` are computed from the correct sheets.
- Check that the report distinguishes the SciFact source gold from the team's adjudicated human label.
- Check that no accuracy number is reported before the audit is complete.

### Author 6 — Data, licence, and PII steward

- Keep every filled sheet, passage, and label in the private folder. Nothing raw goes into GitHub.
- SciFact is **CC BY-NC 2.0** and internal-only. Do not redistribute claim or passage text.
- GPQA and HLE are gated. MMLU-Pro test text must not be redistributed. SciClaimBench must not copy their item text.
- Original SciClaimBench items are **CC BY 4.0** when frozen. Adapted items need a citation, locator, licence, and change note.
- Report any PII or suspected leak privately to Author 1. Do not copy the value into a public issue.

---

## 7. Shared rules

### Blinding

- Do not discuss individual rows with the other rater before both sheets are submitted.
- Do not open the other rater's sheet, the gold verdict, the verifier label, or the arm map.
- If you recognize an item from another batch, tell Author 2 before labeling it.
- The adjudicator may see both sheets, but not the gold or verifier label.

### Human labels only

- Do not use an LLM to generate labels, annotations, or citations. The design requires human raters; an LLM rater would change the study.
- Author 1 may use an LLM to draft SciClaimBench item text, but a human must verify every claim, evidence link, and gold verdict. Set `draft_assisted: true`.
- Do not paste private data or model outputs into an external AI tool.

### Files and submission

- Do not edit the original batch. Save a copy with your initials.
- Fill every row. Do not add or delete columns.
- Use the exact label strings. A blank cell is not a label.
- Put a short note on every hard row; a low-confidence label with a clear note is better than a silent guess.
- Upload to the private folder and post the filename and row count in the team channel.
- Author 1 copies the per-person sheets to the canonical names before scoring.

### When to ask

Ask Author 2 (annotation lead) for batch, blinding, or submission questions. Ask Author 1 for protocol or codebook questions that cannot wait. Ask Author 6 for adjudication questions. A question is cheaper than a bad label.

---

## 8. Timeline

### Recommended: 6 weeks

The six-week plan has five active weeks and one buffer week. The verifier audit starts immediately because the 180 pairs are already built. The SciClaimBench track waits for Author 1's drafts.

| Week | Author 1 | Authors 2 and 3 | Authors 4 and 5 | Author 6 |
| --- | --- | --- | --- | --- |
| **1** | Draft 24 SciClaimBench items with agents; check schema | Read docs; practice rows; item verification starts | Read docs; practice rows | Read docs; set up adjudication log |
| **2** | Freeze items; generate blind sheets; check verifier status | Finish item verification; verifier QA | Verifier labels (180 rows) | Prepare adjudication workbook |
| **3** | Assemble verifier sheets; score κ/balanced accuracy | Verifier QA; SciClaimBench cross-review starts | SciClaimBench labels (all claims) | Verifier adjudication |
| **4** | SciClaimBench adjudication support; score | SciClaimBench defect review | SciClaimBench labels finish; paper support starts | SciClaimBench adjudication |
| **5** | Final scores; integrate numbers | Fix defects; paper support | Paper-support checklist | Licence/PII checklist |
| **6** | Buffer: rerun if κ fails, or sign off | Buffer | Buffer | Buffer |

### Compressed: 4 weeks

Only choose this if **all** of the following are true:

- Author 1 delivers the 24 draft items by **Day 5**.
- Every co-author can commit **4–5 hours per week**.
- The verifier audit starts in Week 1, in parallel with item verification.
- No one travels or has an exam during the four weeks.
- The team accepts that a κ failure leaves no buffer for a fresh batch.

| Week | Focus |
| --- | --- |
| **1** | Onboarding, practice, verifier labels start, SciClaimBench items frozen by Day 5 |
| **2** | Verifier labels finish and adjudicate; SciClaimBench sheets generated and labeling starts |
| **3** | SciClaimBench labeling finishes; adjudication; defect review starts |
| **4** | Defect review, score, paper support, sign-off |

**Recommendation:** set the co-author deadline at **6 weeks from kickoff**, with internal checkpoints at the end of Weeks 2, 3, and 4. A 4-week deadline is feasible for the annotation work alone, but it is fragile because the SciClaimBench items are not authored yet. The critical path is **item drafting → verification → blind sheets → labels → adjudication**, not the 180-pair verifier audit.

### Effort estimate

| Person | Total | 6-week pace | 4-week pace |
| --- | ---: | ---: | ---: |
| Author 2 | 18–22 h | 3–4 h/week | 4.5–5.5 h/week |
| Author 3 | 18–22 h | 3–4 h/week | 4.5–5.5 h/week |
| Author 4 | 18–22 h | 3–4 h/week | 4.5–5.5 h/week |
| Author 5 | 15–18 h | 2.5–3 h/week | 4–4.5 h/week |
| Author 6 | 12–16 h | 2–3 h/week | 3–4 h/week |

These are planning estimates, not ledger numbers. Author 1's item drafting and experiment time are separate.

---

## 9. Definition of done

| Task | Done when |
| --- | --- |
| SciClaimBench items | 24 items complete; strict validator passes; three strata balanced 8/8/8 |
| Item verification | Every item has a written verification note; no unresolved schema or licence problem |
| SciClaimBench labels | Both rater sheets complete; every row has a verdict, confidence, and note for hard rows |
| SciClaimBench adjudication | Every disagreement has `adjudicated_verdict` and `adjudication_notes`; unresolved ≤ 5% |
| SciClaimBench defect review | Every frozen triple checked; `defect_flag` and `defect_type` filled |
| SciClaimBench score | κ, defect rate, `H_attempt`, and unresolved rate reported; gate pass/fail stated |
| Verifier labels | Both 180-row sheets complete; exact label strings; no blank cells |
| Verifier adjudication | `human_label` filled for every row; unresolved rows listed separately |
| Verifier score | κ_all_rows, κ_resolved_rows, balanced accuracy, per-class P/R/F1, confusion matrix |
| Paper support | Number, citation, terminology, limitations, and proofreading checks complete |
| Data stewardship | Licence, PII, private-folder, and no-secret checks complete |

A failed κ or balanced-accuracy gate is a **finding**, not a failure of the team. Keep the batch, report the number, revise the codebook, and run a fresh batch. Do not relabel the same rows to make the number pass.

---

## 10. Glossary

| Term | Meaning |
| --- | --- |
| **Sycophantic collapse** | A correct minority agent abandons its answer under pressure from a confident wrong majority. |
| **Trust weight** | The bounded influence assigned to an agent from evidence-grounded claim support. |
| **Claim–evidence–verdict triple** | One atomic claim, the cited passages, and the gold verdict. |
| **Support** | A passage entails the claim as written and no passage refutes it. |
| **Contradict** | A passage asserts the claim is false. |
| **Neutral / unverifiable** | The passages do not establish or refute the claim. |
| **SciClaimBench** | The team-built gold-evidence benchmark; 24-item calibration, 180-item freeze, 300-item target. |
| **Verifier audit** | The 180-pair SciFact audit of the lexical verifier against human labels. |
| **Cohen's κ** | Chance-corrected agreement between two raters. |
| **Balanced accuracy** | Mean per-class recall; used because the three classes are balanced. |
| **`H_attempt`** | Annotation hours divided by attempted items; the 24-item gate cap is 2.0 h/item. |
| **Pressure-eligible** | An item where a correct minority can be pressured by a wrong majority. |
| **B8** | The trust-weighted debate arm; `B8-no-trust` is its majority-vote control. |
| **Private folder** | The shared, non-public location for filled items, evidence, labels, and adjudication. |
| **Blind sheet** | A rater sheet with no gold, verifier, or arm label. |

---

## 11. Ready-to-send message

> We are finishing the human-labeling part of the TrustCal FYDP. Author 1 handles the experiments, code, item drafting, and analysis. Your work is the human-judgment part: verifying the 24 SciClaimBench calibration items, labeling claims against evidence, auditing the verifier, adjudicating disagreements, and checking the paper numbers and citations.
>
> Please read `docs/COAUTHOR_GUIDE.md` and the eight documents in Section 3 before our first meeting. You do not need to know the domain in advance. We will do a five-row practice batch together. The recommended sprint is six weeks, with a four-week compressed option if the draft items are ready by Day 5.
>
> Guide: https://github.com/Atik203/trustcal/blob/main/docs/COAUTHOR_GUIDE.md
> Templates: https://github.com/Atik203/trustcal/tree/main/docs/coauthor/templates
>
> Author 2: annotation lead, verifier rater 1, SciClaimBench item co-author.
> Author 3: SciClaimBench item lead, cross-review, verifier QA.
> Author 4: SciClaimBench rater 1, verifier rater 2, statistics check.
> Author 5: SciClaimBench rater 2, paper-support lead.
> Author 6: adjudicator, data/licence/PII steward.

---

## 12. All links in one place

| What | Where |
| --- | --- |
| Repository | <https://github.com/Atik203/trustcal> |
| README | <https://github.com/Atik203/trustcal/blob/main/README.md> |
| Report PDF | <https://github.com/Atik203/trustcal/blob/main/FYDP_Summer/fydp.pdf> |
| Journal PDF | <https://github.com/Atik203/trustcal/blob/main/Papev_Summer26_6/cas-sc-template.pdf> |
| Pre-registration | <https://github.com/Atik203/trustcal/blob/main/PRE_REGISTRATION.md> |
| Roadmap | <https://github.com/Atik203/trustcal/blob/main/roadmap.md> |
| SciClaimBench protocol | <https://github.com/Atik203/trustcal/blob/main/experiments/calibration/README.md> |
| SciClaimBench schema | <https://github.com/Atik203/trustcal/blob/main/experiments/calibration/schema.md> |
| SciClaimBench validator | <https://github.com/Atik203/trustcal/blob/main/experiments/calibration/validate_items.py> |
| SciClaimBench templates | <https://github.com/Atik203/trustcal/tree/main/experiments/calibration/annotation> |
| Verifier protocol | <https://github.com/Atik203/trustcal/blob/main/experiments/verifier_audit/README.md> |
| Verifier builder | <https://github.com/Atik203/trustcal/blob/main/experiments/verifier_audit/build_audit.py> |
| Verifier master template | <https://github.com/Atik203/trustcal/blob/main/experiments/verifier_audit/audit_sheet.template.csv> |
| Co-author templates | <https://github.com/Atik203/trustcal/tree/main/docs/coauthor/templates> |
| Glossary | <https://github.com/Atik203/trustcal/blob/main/docs/GLOSSARY.md> |
| Report claims audit | <https://github.com/Atik203/trustcal/blob/main/FYDP_Summer/CLAIMS_AUDIT.md> |
| Defence Q&A | <https://github.com/Atik203/trustcal/blob/main/docs/FYDP1_defence_Q&A.md> |
| Compute and cost model | <https://github.com/Atik203/trustcal/blob/main/docs/agent/08_COMPUTE_COST.md> |
