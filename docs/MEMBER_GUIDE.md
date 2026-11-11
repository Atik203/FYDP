# Member Guide — TrustCal FYDP

**Project:** The Boundaries of Evidence-Grounded Trust in Multi-Agent Scientific Debate, with a Controlled Benchmark for Sycophantic Consensus

**Repository:** <https://github.com/Atik203/trustcal>

**Guide for:** Members 2–6 (the five team members)

**Sprint length:** **6 weeks recommended** (5 active weeks + 1 buffer). A 4-week compressed plan is possible only under the conditions in Section 10.

**Status:** onboarding and task division. This guide does not replace the pre-registration, the SciClaimBench protocol, or the verifier-audit protocol.

**No prior annotation experience is needed.** Every label is defined below and in the two codebooks. The first two days are for reading and a short practice batch. Start with Section 3.

> **Note on Member 1.** Member 1 (Atik) runs the experiments, the Python pipeline, the GPU runs, the item drafting with AI agents, the analysis, and the manuscript integration. His work is not assigned in this guide. The tasks below are only the **human-judgment work that cannot be delegated to an agent** without changing the study. If a task can be automated, Member 1 or an agent does it; it is not listed here.

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

You are not being asked to run models, write code, build the literature review, or check the paper. You are being asked to read evidence carefully, apply a short codebook, and record a label with confidence and a note.

---

## 2. What the five members will do

| Member | Role | The human work only you can do | Main deliverables |
| --- | --- | --- | --- |
| **Member 2 — Rakibul** | **Annotation lead** | Run the rater calibration, protect blinding, co-verify 12 SciClaimBench items, rate the verifier audit, sign the agreement report | Calibration notes, 12 item checklists, verifier rater sheet, agreement report |
| **Member 3 — Salman** | **SciClaimBench item lead** | Verify 12 items, cross-review the other 12, QA the verifier-audit sheets, run the defect review | 12 item checklists, cross-review log, verifier QA note, defect log |
| **Member 4 — Pratay** | **SciClaimBench rater 1; verifier rater 2** | Label every SciClaimBench claim and all 180 verifier pairs | Two completed rater sheets |
| **Member 5 — Yousuf** | **SciClaimBench rater 2** | Label every SciClaimBench claim as the second independent rater | One completed rater sheet |
| **Member 6 — Limu** | **Adjudicator** | Adjudicate both audits and sign the privacy/licence check | Adjudicated SciClaimBench and verifier workbooks, privacy checklist |

### Who rates what

| Audit | Raters | Adjudicator | Independent review |
| --- | --- | --- | --- |
| SciClaimBench 24-item | Member 4, Member 5 | Member 6 | Members 2 and 3 cross-review items they did not author |
| Verifier audit 180 | Member 2, Member 4 | Member 6 | Member 3 checks sheet integrity and blinding |

### Workload

| Member | Total | 6-week pace | 4-week pace |
| --- | ---: | ---: | ---: |
| Member 2 | 18–22 h | 3–4 h/week | 4.5–5.5 h/week |
| Member 3 | 18–22 h | 3–4 h/week | 4.5–5.5 h/week |
| Member 4 | 16–20 h | 2.5–3.5 h/week | 4–5 h/week |
| Member 5 | 8–12 h | 1.5–2 h/week | 2–3 h/week |
| Member 6 | 12–16 h | 2–3 h/week | 3–4 h/week |

These are planning estimates, not ledger numbers. Member 1's item drafting and experiment time are separate.

**No member is assigned paper support, number checking, citation checking, literature search, code, or experiments.** Member 1 covers those with agents. The only exception is a privacy/licence sign-off for Member 6, because private data and licences require a named human owner.

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
| Member templates | <https://github.com/Atik203/trustcal/tree/main/docs/member/templates> |
| Glossary | <https://github.com/Atik203/trustcal/blob/main/docs/GLOSSARY.md> |
| Claims audit (report) | <https://github.com/Atik203/trustcal/blob/main/FYDP_Summer/CLAIMS_AUDIT.md> |
| Defence Q&A | <https://github.com/Atik203/trustcal/blob/main/docs/FYDP1_defence_Q&A.md> |
| Compute and cost model | <https://github.com/Atik203/trustcal/blob/main/docs/agent/08_COMPUTE_COST.md> |
| Private annotation folder | Member 1 posts the link in the team channel before Day 1. It is not in this public repository. |

### How to use these links

1. Click the link and read it in the browser.
2. For a CSV, click **Raw** or **Download**, then save a copy in the private folder.
3. Do not click **Fork**, **Pull request**, or **Commit** unless Member 1 asks.
4. If a link is broken, tell Member 1 in the team channel. Do not search for a replacement alone; the wrong version of a protocol is worse than a delay.
5. Do not paste private sheets, raw SciFact text, or model outputs into a public issue or an external AI tool.

### Access checklist

- [ ] GitHub account (the repository is public, so read access is enough).
- [ ] Access to the shared private folder for annotation sheets. Member 1 will post the link.
- [ ] Google Sheets or Excel, and a PDF reader.
- [ ] The team communication channel and the weekly meeting invite.
- [ ] Agreement not to copy private data, PII, or model outputs into public tools.
- [ ] Roughly **2–4 hours per week** for five weeks, or **4–5 hours per week** for the compressed four-week plan.

### Day 1–2 onboarding

| Day | Task | Output |
| ---: | --- | --- |
| 1 | Read the eight documents above; complete the access checklist | Notes and questions |
| 2 | 30-minute walkthrough; label the practice rows in Sections 9.3 and 9.4; compare labels | Practice notes and calibration discussion |

Do not start a real batch until the practice rows are discussed. The first batch is for calibration, not for the final data.

---

## 4. Member 2 — Rakibul

### Your role

You are the **annotation lead**. You own the human side of the two audits: rater calibration, batch preparation, blinding, the verifier rater sheet, and the agreement report. You also co-verify 12 SciClaimBench items with Member 3.

You do not run models, write code, compute the final statistics, or check the paper. Member 1 and the agents do that.

### What you will do

1. **Run the rater calibration session.** This is human rater calibration, not model training. The models are frozen and inference-only. Member 1 or an agent may prepare the deck, examples, and practice rows; you facilitate the 30–60 minute session, answer codebook questions, protect blinding, and sign the notes.
2. **Prepare the batches.** Check the row count, confirm that no gold/verifier/arm label is present, confirm the order is shuffled, and share the sheets privately.
3. **Co-verify 12 SciClaimBench items.** Use the item checklist. Cross-review the 12 items Member 3 verified; do not edit the item source yourself.
4. **Rate the verifier audit as rater 1.** Label all 180 pairs independently. Do not open the other sheet, the gold label, or the verifier label.
5. **Sign the agreement report.** After Member 1 computes κ and balanced accuracy, write a one-page interpretation: what passed, what failed, which labels disagreed, and whether the codebook needs a revision.

### Step by step

**Step 1 — Calibration session (Week 1).**

1. Open [`calibration_notes.md`](member/templates/calibration_notes.md).
2. Walk through the five SciClaimBench practice rows in Section 9.3 and the five verifier practice rows in Section 9.4.
3. Ask each rater to label the practice rows alone, then compare.
4. Record every disagreement and the decision in the notes.
5. Confirm the blinding rules and the exact label strings.
6. Send the signed notes to Member 1 and the team channel.

**Step 2 — SciClaimBench item co-verification (Weeks 1–2).**

1. Open your 12 items from the private batch and [`item_verification_checklist.md`](member/templates/item_verification_checklist.md).
2. Check the question, options, gold answer, three positions, 3–6 atomic claims per position, evidence locators, licence block, and no gated text.
3. Return a written problem list to Member 1. Do not edit the item file.
4. Cross-review Member 3's 12 items and record your name and date.

**Step 3 — Verifier audit rater 1 (Weeks 1–2).**

1. Open `experiments/verifier_audit/private/scifact/sheets/rater1.csv` from the private folder.
2. Fill only `label`, `confidence`, and `notes`.
3. Use `supported`, `contradicted`, or `unverifiable`.
4. Do not open `pairs.jsonl`, `audit_sheet.csv`, `verifier_predictions.csv`, or the other rater sheet.
5. Submit before the deadline and post the row count.

**Step 4 — Batch preparation and blinding (Weeks 2–3).**

1. For SciClaimBench, confirm the sheets generated by Member 1 have no `gold_verdict` column.
2. Confirm the row count equals the number of claims, not the number of items.
3. Confirm the order is shuffled and the item IDs do not reveal the stratum.
4. Send the correct sheet to Member 4 and Member 5 with a deadline and a filename.
5. Do not send the adjudication workbook to a rater.

**Step 5 — Agreement report (Week 3 or 4).**

1. Member 1 sends you the score output: κ, defect rate, `H_attempt`, unresolved rate.
2. Write one page: the gate result, the main disagreement pattern, the codebook ambiguity, and the recommendation (pass, revise and rerun, or stop).
3. Do not relabel rows to raise κ. A failed calibration is a finding.

### What you submit

| Deliverable | Template or path | Deadline |
| --- | --- | --- |
| Calibration notes | [`calibration_notes.md`](member/templates/calibration_notes.md) | Day 2 |
| 12 item verification checklists | [`item_verification_checklist.md`](member/templates/item_verification_checklist.md) | End of Week 2 |
| Verifier rater 1 sheet | `rater1_<initials>.csv` | End of Week 2 |
| Agreement report | One-page memo to Member 1 | End of Week 3 |
| Weekly check-in | [`weekly_checkin.md`](member/templates/weekly_checkin.md) | Every Friday |

### Time commitment

Roughly **18–22 hours** across six weeks:

- calibration and onboarding: 2–3 h
- 12 item verifications: 6–8 h
- verifier rater sheet: 5–6 h
- batch preparation and blinding: 2–3 h
- agreement report: 2–3 h
- meetings: 2–3 h

### What not to do

- Do not label an item you authored or verified.
- Do not open the other rater's sheet or the gold/verifier label.
- Do not use an LLM to generate labels.
- Do not discuss individual rows before both sheets are submitted.
- Do not edit the item source or the original batch.

---

## 5. Member 3 — Salman

### Your role

You are the **SciClaimBench item lead**. You own the quality of the 24 items: atomicity, evidence locators, gold-verdict logic, licence and provenance, and the defect review. You also QA the verifier-audit sheets for blinding and completeness.

You do not write code, run models, or compute the final statistics.

### What you will do

1. **Own the item verification plan.** Split the 24 items 12/12 with Member 2. You verify 12, Member 2 verifies 12.
2. **Verify every claim and evidence link.** Use the checklist. Return a written problem list to Member 1.
3. **Cross-review Member 2's 12 items.** Check the same fields independently.
4. **QA the verifier-audit sheets.** Confirm row counts, no blank labels, no gold/verifier columns, and no blinding leak.
5. **Run the defect review after adjudication.** Review the frozen triples you did not author; fill `defect_flag` and `defect_type`.

### Step by step

**Step 1 — Item verification (Weeks 1–2).**

1. Open your 12 items from the private batch and [`item_verification_checklist.md`](member/templates/item_verification_checklist.md).
2. Check the question is answerable, the gold answer is one of the options, and there are exactly three positions.
3. Check every position has 3–6 atomic claims and every claim has at least one evidence passage with a resolvable locator.
4. Check the gold verdict order: contradiction first, then support, otherwise neutral.
5. Check numbers after unit conversion, negation, compound claims, and topical overlap.
6. Check `source.kind`, citation, locator, licence, and no gated text.
7. Return the checklist plus a written problem list to Member 1.

**Step 2 — Cross-review (Week 2).**

1. Open Member 2's 12 items.
2. Check the same fields without looking at Member 2's verdict.
3. Record a short note for every disagreement.
4. Send the cross-review log to Member 1.

**Step 3 — Verifier audit QA (Week 3).**

1. Confirm `rater1.csv` and `rater2.csv` have 180 rows each.
2. Confirm every row has a label, confidence, and note where needed.
3. Confirm neither sheet contains `gold_label`, `verifier_label`, or `arm`.
4. Confirm the two raters did not label in the same order or share notes.
5. Write a short QA note: row counts, blank cells, blinding, and any anomaly.

**Step 4 — Defect review (Week 4).**

1. After Member 6 finishes adjudication, open the frozen triples you did not author.
2. Check every triple against its passages.
3. Fill `defect_flag` and `defect_type`.
4. A wrong or unsupported triple is a defect. Pre-freeze corrections are rework, not defects.
5. Send the defect count and examples to Member 1.

### What you submit

| Deliverable | Template or path | Deadline |
| --- | --- | --- |
| 12 item verification checklists | [`item_verification_checklist.md`](member/templates/item_verification_checklist.md) | End of Week 2 |
| Cross-review log | One-page memo to Member 1 | End of Week 2 |
| Verifier QA note | One-page memo to Member 1 | End of Week 3 |
| Defect log | `adjudication.csv` defect columns + memo | End of Week 4 |
| Weekly check-in | [`weekly_checkin.md`](member/templates/weekly_checkin.md) | Every Friday |

### Time commitment

Roughly **18–22 hours** across six weeks:

- onboarding: 1–2 h
- 12 item verifications: 8–10 h
- cross-review: 3–4 h
- verifier QA: 2–3 h
- defect review: 3–4 h
- meetings: 2–3 h

### What not to do

- Do not edit the item source. Return a problem list to Member 1.
- Do not label an item you authored or verified.
- Do not change a gold verdict to make the statistics look better.
- Do not use an LLM to generate a verdict.
- Do not paste private item text into a public issue or an external AI tool.

---

## 6. Member 4 — Pratay

### Your role

You are **SciClaimBench rater 1** and **verifier-audit rater 2**. You are one of the two independent human labels for each audit. Your value is independence, not speed.

### What you will do

1. **Label every SciClaimBench claim.** Use `support`, `contradict`, or `neutral`. Record confidence and a note for hard rows.
2. **Label all 180 verifier pairs.** Use `supported`, `contradicted`, or `unverifiable`. Do not open the gold or verifier label.
3. **Complete the submission checklist.** Confirm row counts, no blank labels, and no blinding leak.

### Step by step

**Step 1 — SciClaimBench rater 1 (Weeks 2–3).**

1. Open `rater1_<initials>.csv` from the private folder.
2. Fill every row: `verdict`, `confidence`, `notes`.
3. Use `support`, `contradict`, or `neutral`.
4. Judge only the claim and the cited passages. Do not use outside knowledge.
5. Do not discuss rows with Member 5 before both sheets are submitted.
6. Submit before the deadline and post the row count.

**Step 2 — Verifier audit rater 2 (Weeks 1–2).**

1. Open `rater2_<initials>.csv` from the private folder.
2. Fill every row: `label`, `confidence`, `notes`.
3. Use `supported`, `contradicted`, or `unverifiable`.
4. Do not open `pairs.jsonl`, `audit_sheet.csv`, `verifier_predictions.csv`, or Member 2's sheet.
5. Submit before the deadline and post the row count.

**Step 3 — Submission checklist.**

Complete [`annotation_submission_checklist.md`](member/templates/annotation_submission_checklist.md) for each sheet.

### What you submit

| Deliverable | Path | Deadline |
| --- | --- | --- |
| SciClaimBench rater 1 sheet | `rater1_<initials>.csv` | End of Week 3 |
| Verifier audit rater 2 sheet | `rater2_<initials>.csv` | End of Week 2 |
| Submission checklist | [`annotation_submission_checklist.md`](member/templates/annotation_submission_checklist.md) | With each sheet |
| Weekly check-in | [`weekly_checkin.md`](member/templates/weekly_checkin.md) | Every Friday |

### Time commitment

Roughly **16–20 hours** across six weeks:

- onboarding: 1–2 h
- SciClaimBench labels: 8–10 h
- verifier labels: 5–6 h
- meetings: 2–3 h

### What not to do

- Do not open the other rater's sheet.
- Do not open the gold verdict, verifier label, or arm map.
- Do not use an LLM to generate labels.
- Do not use outside knowledge; judge only the passages.
- Do not relabel a row after seeing another label.
- Do not guess to avoid an abstention; use the neutral label with low confidence.

---

## 7. Member 5 — Yousuf

### Your role

You are **SciClaimBench rater 2**. You are the second independent human label for the 24-item calibration. Your sheet is compared with Member 4's sheet; the agreement is the gate.

You do not label the verifier audit unless Member 2 asks you to cover for an unavailable rater.

### What you will do

1. **Label every SciClaimBench claim.** Use `support`, `contradict`, or `neutral`.
2. **Record confidence and notes** for every hard row.
3. **Submit on time** with the row count.

### Step by step

1. Open `rater2_<initials>.csv` from the private folder.
2. Fill every row: `verdict`, `confidence`, `notes`.
3. Use `support`, `contradict`, or `neutral`.
4. Judge only the claim and the cited passages. Do not use outside knowledge.
5. Do not discuss rows with Member 4 before both sheets are submitted.
6. Submit before the deadline and post the row count.

### What you submit

| Deliverable | Path | Deadline |
| --- | --- | --- |
| SciClaimBench rater 2 sheet | `rater2_<initials>.csv` | End of Week 3 |
| Submission checklist | [`annotation_submission_checklist.md`](member/templates/annotation_submission_checklist.md) | With the sheet |
| Weekly check-in | [`weekly_checkin.md`](member/templates/weekly_checkin.md) | Every Friday |

### Time commitment

Roughly **8–12 hours** across six weeks:

- onboarding: 1–2 h
- SciClaimBench labels: 5–7 h
- meetings: 1–2 h

### What not to do

- Do not open Member 4's sheet.
- Do not open the gold verdict, verifier label, or arm map.
- Do not use an LLM to generate labels.
- Do not use outside knowledge.
- Do not relabel a row after seeing another label.

---

## 8. Member 6 — Limu

### Your role

You are the **adjudicator** for both audits and the named owner of the privacy/licence check. You see both rater sheets and the evidence, but not the gold verdict or verifier label.

### What you will do

1. **Adjudicate SciClaimBench.** Fill `adjudicated_verdict`, `adjudication_notes`, and the defect columns in `adjudication.csv`.
2. **Adjudicate the verifier audit.** Fill `human_label`, `confidence`, and `notes` in `audit_sheet.csv`.
3. **Sign the privacy/licence check.** Confirm private-folder handling, SciFact's CC BY-NC terms, gated-dataset rules, and no PII.
4. **Keep the adjudication log.** Every disagreement needs a label and a one-line reason.

### Step by step

**Step 1 — SciClaimBench adjudication (Week 4).**

1. Open `adjudication.csv`.
2. For every row, read the claim, the passages, and both rater labels.
3. Apply the codebook: contradiction first, then support, otherwise neutral.
4. Fill `adjudicated_verdict` and `adjudication_notes`.
5. If you cannot defend a verdict, write `unresolved`.
6. More than 5% unresolved blocks the freeze.

**Step 2 — Verifier audit adjudication (Week 3).**

1. Open `audit_sheet.csv`.
2. For agreement rows, copy the agreed label into `human_label`.
3. For disagreements, read the claim and passages, apply the codebook, and fill `human_label`, `confidence`, and `notes`.
4. If a row cannot be defended, write `unresolved`; it is excluded from accuracy and reported separately.
5. Do not copy the verifier label or the source gold.

**Step 3 — Privacy and licence check (Weeks 4–5).**

1. Confirm every filled item, passage, and label is in the private folder, not GitHub.
2. Confirm SciFact is treated as CC BY-NC 2.0 and is not redistributed.
3. Confirm GPQA and HLE item text is not committed; MMLU-Pro test text is not redistributed.
4. Confirm original SciClaimBench items use CC BY 4.0 and adapted items record citation, locator, licence, and changes.
5. Report any PII or suspected leak privately to Member 1.

### What you submit

| Deliverable | Path | Deadline |
| --- | --- | --- |
| SciClaimBench adjudication | `adjudication.csv` | End of Week 4 |
| Verifier adjudication | `audit_sheet.csv` | End of Week 3 |
| Privacy/licence checklist | One-page memo to Member 1 | End of Week 5 |
| Weekly check-in | [`weekly_checkin.md`](member/templates/weekly_checkin.md) | Every Friday |

### Time commitment

Roughly **12–16 hours** across six weeks:

- onboarding: 1–2 h
- SciClaimBench adjudication: 5–7 h
- verifier adjudication: 2–3 h
- privacy/licence check: 2–3 h
- meetings: 2 h

### What not to do

- Do not open the gold verdict or verifier label while adjudicating.
- Do not relabel rows to raise κ.
- Do not delete an unresolved row; report it.
- Do not put private text in a public issue.
- Do not change the codebook without Member 2 and Member 1.

---

## 9. Shared rules and examples

### 9.1 The two label sets are different

| Audit | Labels |
| --- | --- |
| SciClaimBench | `support`, `contradict`, `neutral` |
| Verifier audit | `supported`, `contradicted`, `unverifiable` |

Do not mix them. The wording is different on purpose.

### 9.2 SciClaimBench decision order

1. If any cited passage contradicts the claim as written, use `contradict`.
2. Otherwise, if at least one cited passage entails the claim, use `support`.
3. Otherwise, use `neutral`.

### 9.3 SciClaimBench practice rows

| # | Claim | Passage | Correct label | Why |
| ---: | --- | --- | --- | --- |
| 1 | Drug X reduced systolic blood pressure by 12 mmHg versus placebo. | In the trial, systolic blood pressure fell 12 mmHg in the Drug X arm and 1 mmHg in the placebo arm. | `support` | The passage states the relation and the number. |
| 2 | Drug X reduced systolic blood pressure by 12 mmHg versus placebo. | There was no significant difference in systolic blood pressure between Drug X and placebo. | `contradict` | The passage denies the claimed effect. |
| 3 | Drug X reduced systolic blood pressure by 12 mmHg versus placebo. | The trial enrolled 120 adults with treated hypertension. | `neutral` | The passage is on-topic but does not state the effect. |
| 4 | Drug X reduced systolic blood pressure and increased heart rate. | Drug X reduced systolic blood pressure by 12 mmHg; heart rate was not reported. | `neutral` | Only one part of the compound claim is supported. |
| 5 | The reaction released 100 °C of heat. | The reaction reached 212 °F. | `support` | The numbers agree after unit conversion. |

### 9.4 Verifier audit practice rows

| # | Claim | Passages | Correct label | Why |
| ---: | --- | --- | --- | --- |
| 1 | Drug X lowers systolic blood pressure. | In the trial, systolic blood pressure fell 12 mmHg on Drug X versus 1 mmHg on placebo. | `supported` | The passage states the claimed relation. |
| 2 | Drug X lowers systolic blood pressure. | There was no significant difference in systolic blood pressure between Drug X and placebo. | `contradicted` | The passage denies the relation. |
| 3 | Drug X lowers systolic blood pressure. | The trial enrolled 120 adults with treated hypertension. | `unverifiable` | The passage is on-topic but does not state the relation. |
| 4 | Drug X lowers systolic blood pressure. | *(empty passage)* | `unverifiable` | Empty evidence never supports a claim. |
| 5 | Drug X lowers systolic blood pressure. | Drug X is a small molecule with a molecular weight of 412 Da. | `unverifiable` | Topical overlap is not support. |

### 9.5 Blinding

- Do not discuss individual rows with the other rater before both sheets are submitted.
- Do not open the other rater's sheet, the gold verdict, the verifier label, or the arm map.
- If you recognize an item from another batch, tell Member 2 before labeling it.
- The adjudicator may see both sheets, but not the gold or verifier label.

### 9.6 Human labels only

- Do not use an LLM to generate labels, annotations, or citations.
- Member 1 may use an LLM to draft SciClaimBench item text, but a human must verify every claim, evidence link, and gold verdict. Set `draft_assisted: true`.
- Do not paste private data or model outputs into an external AI tool.

### 9.7 Files and submission

- Do not edit the original batch. Save a copy with your initials.
- Fill every row. Do not add or delete columns.
- Use the exact label strings. A blank cell is not a label.
- Put a short note on every hard row; a low-confidence label with a clear note is better than a silent guess.
- Upload to the private folder and post the filename and row count in the team channel.
- Member 1 copies the per-person sheets to the canonical names before scoring.

### 9.8 When to ask

Ask Member 2 for batch, blinding, or submission questions. Ask Member 1 for protocol or codebook questions that cannot wait. Ask Member 6 for adjudication questions. A question is cheaper than a bad label.

---

## 10. Timeline

### Recommended: 6 weeks

The six-week plan has five active weeks and one buffer week. The verifier audit starts immediately because the 180 pairs are built. The SciClaimBench track waits for Member 1's drafts.

| Week | Member 2 | Member 3 | Member 4 | Member 5 | Member 6 |
| --- | --- | --- | --- | --- | --- |
| **1** | Calibration session; verifier labels | Read docs; item verification starts | Onboarding; verifier labels | Onboarding | Onboarding; set up adjudication log |
| **2** | Item verification; verifier labels finish | Item verification; cross-review | Verifier labels finish | Read docs | Prepare adjudication workbook |
| **3** | Batch prep; agreement report starts | Verifier QA; SciClaimBench cross-review | SciClaimBench labels | SciClaimBench labels | Verifier adjudication |
| **4** | Batch prep; agreement report | Defect review starts | SciClaimBench labels finish | SciClaimBench labels finish | SciClaimBench adjudication |
| **5** | Agreement report; final checks | Defect review; final checks | Final checks | Final checks | Privacy/licence check |
| **6** | Buffer | Buffer | Buffer | Buffer | Buffer |

Member 1's deliverables are dependencies, not rows in this table: draft items by Day 5, blind sheets by end of Week 2, score output after both sheets are complete.

### Compressed: 4 weeks

Only choose this if **all** of the following are true:

- Member 1 delivers the 24 draft items by **Day 5**.
- Every member can commit **4–5 hours per week**.
- The verifier audit starts in Week 1, in parallel with item verification.
- No one travels or has an exam during the four weeks.
- The team accepts that a κ failure leaves no buffer for a fresh batch.

| Week | Focus |
| --- | --- |
| **1** | Onboarding, practice, verifier labels start, SciClaimBench items frozen by Day 5 |
| **2** | Verifier labels finish and adjudicate; SciClaimBench sheets generated and labeling starts |
| **3** | SciClaimBench labeling finishes; adjudication; defect review starts |
| **4** | Defect review, score, privacy/licence check, sign-off |

**Recommendation:** set the member deadline at **6 weeks from kickoff**, with internal checkpoints at the end of Weeks 2, 3, and 4. A 4-week deadline is feasible for the annotation work alone, but it is fragile because the SciClaimBench items are not authored yet. The critical path is **item drafting → verification → blind sheets → labels → adjudication**, not the 180-pair verifier audit.

---

## 11. Definition of done

| Member | Done when |
| --- | --- |
| Member 2 | Calibration notes signed; 12 item checklists complete; verifier rater 1 sheet complete; agreement report delivered |
| Member 3 | 12 item checklists complete; cross-review log delivered; verifier QA note delivered; defect log complete |
| Member 4 | SciClaimBench rater 1 sheet and verifier rater 2 sheet complete; submission checklists signed |
| Member 5 | SciClaimBench rater 2 sheet complete; submission checklist signed |
| Member 6 | Both adjudication workbooks complete; unresolved rows listed; privacy/licence checklist signed |

A failed κ or balanced-accuracy gate is a **finding**, not a failure of the team. Keep the batch, report the number, revise the codebook, and run a fresh batch. Do not relabel the same rows to make the number pass.

---

## 12. Glossary

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

## 13. Ready-to-send message

> We are finishing the human-labeling part of the TrustCal FYDP. Member 1 handles the experiments, code, item drafting, analysis, and paper integration with agents. Your work is only the human-judgment part: verifying the 24 SciClaimBench calibration items, labeling claims against evidence, auditing the verifier, and adjudicating disagreements.
>
> Please read `docs/MEMBER_GUIDE.md` and the eight documents in Section 3 before our first meeting. You do not need to know the domain in advance. We will do a short practice batch together. The recommended sprint is six weeks, with a four-week compressed option if the draft items are ready by Day 5.
>
> Guide: https://github.com/Atik203/trustcal/blob/main/docs/MEMBER_GUIDE.md
> Templates: https://github.com/Atik203/trustcal/tree/main/docs/member/templates
>
> Member 2: annotation lead, verifier rater 1, SciClaimBench item co-verifier.
> Member 3: SciClaimBench item lead, cross-review, verifier QA, defect review.
> Member 4: SciClaimBench rater 1, verifier rater 2.
> Member 5: SciClaimBench rater 2.
> Member 6: adjudicator, privacy/licence sign-off.

---

## 14. All links in one place

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
| Member templates | <https://github.com/Atik203/trustcal/tree/main/docs/member/templates> |
| Glossary | <https://github.com/Atik203/trustcal/blob/main/docs/GLOSSARY.md> |
| Report claims audit | <https://github.com/Atik203/trustcal/blob/main/FYDP_Summer/CLAIMS_AUDIT.md> |
| Defence Q&A | <https://github.com/Atik203/trustcal/blob/main/docs/FYDP1_defence_Q&A.md> |
| Compute and cost model | <https://github.com/Atik203/trustcal/blob/main/docs/agent/08_COMPUTE_COST.md> |
