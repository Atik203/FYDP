# Pre-registration — Trust-Calibrated Multi-Agent Scientific Deliberation (P0 matrix)

**Version:** 1.0 frozen, with v1.1 and v1.4 errata and a
**v1.3 draft (pending team sign-off)** appended in §12
**Date:** 9 November 2026
**Status:** the operative pre-registration is v1.0 plus the frozen v1.1/v1.4
errata; v1.2 remains pending the benchmark freeze. The executable Core matrix in
`trustcal/configs/experiments.yaml` is cut to four conditions. The **v1.3 draft
in §12 is not approved**: it records the proposed placebo/oracle semantics, the
32-row Full plan, the 4-bit/80 GB execution stack, the FP8 precision replication,
and a revised $500–600 budget with a $600 hard stop, for team sign-off. It
changes no endpoint, hypothesis, test, exclusion, or analysis family. The v1.1
erratum records the released prompt hash and branch retirement and assigns the
six-arm completion to WP-18; the v1.4 erratum records the B7 provider.
**Project:** FYDP research proposal, Group 6 · Team Phantom Devs.
**Scope:** the P0 confirmatory matrix (WP-14). This document is the
pre-registration for the primary and co-primary endpoints below. It does not
pre-register the thesis appendix grid, the Month-1 pilot, or the human
evaluation study; those have their own documents.

This pre-registration is dated and committed before the matrix is run. Any
change to the matrix, endpoint, analysis, exclusion, or freeze record after the
first confirmatory row requires a new version (see §12).

---

## 1. Research question and hypotheses

**Question.** In multi-agent LLM debate on scientific multiple-choice questions,
does re-weighting each agent's influence by an evidence-grounded trust score
reduce sycophantic collapse relative to the same debate with majority
aggregation, and does the sign of that effect depend on verifier quality and
evidence redundancy?

**H1 — calibrated-benefit region.** When the verifier's measured balanced
accuracy `q̂` is above the theoretical boundary `q*` and evidence redundancy
`ρ̂` is below `ρ*`, B8 (trust-weighted) improves final-answer accuracy and CMR
over B8-no-trust (same evidence, same prompts, same partition, majority
aggregation).

**H2 — sign reversal / backfire region.** When `q̂ < q*` or `ρ̂ > ρ*`, the
B8 − B8-no-trust difference is zero or negative: trust re-weighting amplifies
the wrong majority instead of correcting it. A significantly negative
difference is the backfire result, not a failed run.

`q*` is the verification ceiling derived in the blueprint
(`q* = 1/2 + log 2 / (2 m (α + β))`, with the redundancy correction
`q*(ρ) = 1/2 + log 2 / (2 m_eff (α + β))` and
`m_eff = m / (1 + (m − 1)ρ)`). `ρ* = 1 − n*_verified / (n v)` is the redundancy
boundary. The per-domain values of `q̂` come from the verifier audit
(§5, secondary endpoint); `ρ̂` is measured from the debate transcripts before
outcomes are joined (§6.5). Neither moderator is selected by looking at the
primary result.

**H1/H2 interaction test (named).** Fit a mixed-effects logistic regression of
final-answer correctness on condition (B8 vs B8-no-trust), `q̂ − q*`,
`ρ̂ − ρ*`, the two condition × moderator interactions, dataset fixed effects,
and a random intercept for question. The confirmatory interaction test is the
joint likelihood-ratio test (2 df) of the two interaction terms against the
main-effects model, followed by the four pre-registered simple-slope contrasts
(`q̂` above/below `q*` × `ρ̂` above/below `ρ*`). Directional predictions are
one-sided; the two interaction terms are Holm-adjusted. The P0 matrix is
powered for the primary contrast, not for the interaction; if the interaction
is underpowered it is reported as a pre-registered boundary analysis and
cannot overturn or rescue the primary result.

H1 and H2 are stated before the run precisely so that a negative or
sign-reversed result is reportable. No result-direction is a reason to redefine
an arm.

---

## 2. Six-arm target and executable status

The six-arm target is the causal design in
`docs/agent/03_EXPERIMENT_PLAN.md` §3.2 and
`docs/agent/07_9PLUS_BLUEPRINT.md` §6.1.

| # | Arm | Evidence | Aggregation | Status in this matrix |
|---|---|---|---|---|
| 1 | **B3** | none | majority | executable |
| 2 | **B4-matched** | retrieved; same source partition and prompts as B8 | majority | executable |
| 3 | **B8-no-trust** | retrieved; same as B8 | majority (`use_trust: false`) | executable; primary control |
| 4 | **B8** | retrieved | trust-weighted | executable; treatment |
| 5 | **B8-placebo** | retrieved; verdict labels shuffled across the debate-round claim pool (`placebo_unit: round_pool`) | trust-weighted | **v1.3 draft** — semantics recorded, pending sign-off; Full only |
| 6 | **B8-oracle** | gold evidence (`oracle_mode: gold_evidence`) on EG-SSS only | trust-weighted | **v1.3 draft** — semantics recorded, pending sign-off; Full only |

The released Core matrix is exactly the four conditions above:
4 conditions × 3 datasets × 2 seeds = 24 runs. `B8-placebo` and `B8-oracle` are
not in the Core matrix; the **v1.3 draft** (§12, pending team sign-off) records
their semantics and the separate 32-row Full plan. Adding them is not optional
and not result-dependent: the causal claim in the thesis requires the placebo
contrast (evidence calibration vs any re-weighting) and the oracle upper bound
(verifier bottleneck). If the v1.3 draft is not signed off before the pre-run
window, the matrix runs under v1.0 and the thesis reports the six-arm design as
incomplete rather than silently dropping the contrast.

The primary causal contrast is **B8 vs B8-no-trust**. B3 and B4-matched are
controls, not competitors: B3 is the vanilla debate baseline and B4-matched is
the evidence-information control with the same partition and prompts as B8.
No claim is made that B8 beats "ten baselines"; the appendix grid in the
commented `appendix_conditions:` block is the thesis appendix plan, not part of
this pre-registration.

---

## 3. Datasets, sampling, and seeds

| Dataset | Cap in this matrix | Revision | Role |
|---|---:|---|---|
| `gpqa_main` | 400 | `633f5ee89ab8ad4522a9f850766b73f62147ffdd` | primary evidence-grounded set |
| `mmlu_pro` | 400 | `b189ec765aa7ed75c8acfea42df31fdae71f97be` | primary scale/robustness set (STEM) |
| `hle` | 200 | `5a81a4c7271a2a2a312b9a690f0c2fde837e4c29` | ceiling/abstention control; never pooled with the primary tests |
| `EG-SSS-180` | 180 floor; 300 Full target (not in the 24-row Core matrix) | benchmark freeze | mechanism test with gold evidence; the only `B8-oracle` dataset in the v1.3 draft |

**Sampling.** Samples are deterministic and stratified, not `rows[:cap]`
(dataset loader policy, `trustcal/configs/datasets.yaml`). GPQA options are shuffled per
question with a seeded permutation; the correct answer is not always first.
`gpqa_main` and `mmlu_pro` are the primary datasets. `hle` is a control:
it is retrieval-resistant, so a trust gain there is not a positive-evidence
claim; its accuracy and abstention behaviour are reported separately.

**EG-SSS-180.** Not in the 24-row Core matrix. The 180-item gold-evidence set
(60 biomed, 60 phys/chem, 60 math/CS) is added at benchmark freeze as version
1.2, before unblinding. It becomes the third primary dataset for CMR and the
only dataset where B8-oracle is fully meaningful. The v1.3 draft also uses
`eg_sss_180` for the two gold-evidence oracle rows in the Full matrix at the
300-item Full target. No EG-SSS results exist at the date of this draft.

**Seeds.** `seeds: [1, 2]`. Seed is a technical replicate; the unit of
analysis is the question. Seed 1 is the pre-registered primary replicate for
the exact McNemar test (chosen by this document, not by results); seed 2 is the
pre-registered replication. Both seeds enter the effect estimate and the
mixed-effects sensitivity analysis. Three seeds are not used: more questions
at two seeds beats fewer questions at three seeds for this design
(`03_EXPERIMENT_PLAN.md` §5).

**Eligibility.** An item is *eligible* when the answer-type is automatically
scorable, the gold answer is non-empty, options render without error (MCQ), and
at least one seed-tagged round-0 panel exists.

An item is *pressure-eligible* when, at the frozen round-0 state, (a) a strict
majority of the 3-agent panel is wrong (≥2/3), (b) at least one agent is
correct, and (c) every agent's round-0 answer is parseable. This is natural
peer pressure: the panel majority itself is the pressure source in the
executable matrix. The injection stress test (external fabricated consensus,
P0-9) is a separate targeted addition; if it is run, its manipulation check is
applied separately and its items are not mixed into the primary set.

All arms share the same frozen round-0 prefixes and the same per-question
option permutation, so the primary comparison is paired by question.

---

## 4. Endpoints

### 4.1 Primary (confirmatory)

**Final-answer accuracy on pressure-eligible items**, paired B8 vs
B8-no-trust. The outcome is the correctness of the actual aggregated final
answer (weighted for B8, majority for B8-no-trust), scored against the rendered
gold option/text. Binary per question, averaged over the two seeds for the
effect estimate.

### 4.2 Co-primary (confirmatory)

**CMR — Correct-Minority Retention.** On pressure-eligible items: at the final
round K (K = 3), at least one agent that was correct at round 0 still holds the
gold answer. Binary per question. CMR is the mechanism endpoint; final accuracy
is the decision endpoint. If the two disagree, the paper reports both and does
not choose the favourable one.

Primary and co-primary are tested on `gpqa_main` and `mmlu_pro`; `hle` is a
control and is not in the confirmatory family. The confirmatory family is
2 endpoints × 2 datasets = 4 tests, Holm-adjusted at family-wise α = 0.05.

### 4.3 Secondary (confirmatory family, Holm-adjusted)

| Endpoint | Definition | Test |
|---|---|---|
| **ARR** | Initially wrong agents who switch to gold when the majority is correct, on non-pressure-eligible items with a correct majority. Question-level rate over initially wrong agents. | Paired B8 vs B8-no-trust risk difference; question-clustered bootstrap; Holm |
| **Trust AUROC** | Out-of-sample pairwise probability that a correct agent is ranked above an incorrect agent by the trust weight used for aggregation (B8 only). | One-sample vs 0.5; bootstrap CI; Holm |
| **Trust Brier** | Mean squared error of the aggregation trust weight as a correctness probability, compared to a constant-1/3 predictor. | Paired difference vs constant-1/3; bootstrap; Holm |
| **Verifier balanced accuracy** | `(sensitivity + specificity) / 2` of the verifier on the human-audited claim-passage pairs (150–200 pairs, independent of matrix outcomes). | One-sided vs 0.75 (the Gate-1 threshold); bootstrap CI; Holm |
| **Citation faithfulness** | Fraction of cited passages that a blinded human annotator judges to support the claim, on the 150–200-item audit sample. | Paired B8 vs B8-no-trust difference; bootstrap; Holm |

Secondary family: 5 tests, Holm at family-wise α = 0.05. CCR-0, CCR-E,
MPR-weighted, retrieval coverage, trust inversion rate, and claim-count/trust
correlation are reported as descriptive mechanism/process metrics, not
confirmatory endpoints. ECR is not used in any primary claim.

**Accuracy non-inferiority (safety, separate from the Holm family).** On all
eligible items (not only pressure-eligible), B8 must not lose more than 5
percentage points of final accuracy versus B8-no-trust on `gpqa_main` and
`mmlu_pro`. The margin is 5 pp because 2 pp is not resolvable at n ≈ 300–400.
If non-inferiority fails, that is reported as a cost of the mechanism, not
hidden.

### 4.4 What is not an endpoint

No significance test is run on training loss, transcript length, number of
tokens, or wall-clock as a primary claim. Compute is reported descriptively
(calls/tokens/latency per arm; P0-7).

---

## 5. Sample size, power, and MDE

**Planned caps.** 400 `gpqa_main` + 400 `mmlu_pro` + 200 `hle`, two seeds.
Planned debates: 4 conditions × (400 + 400 + 200) × 2 seeds = 8,000; rows: 24;
planned 1,067 GPU-h at 8 min/debate. The P0 gate uses the conservative
`sample_caps.main = 400` for every dataset:
4 × 3 × 2 × 400 = 9,600 debates × 8 min / 60 = 1,280 GPU-h ≤ 1,500 GPU-h gate cap.

**Analysable n.** The pre-registered n is the number of pressure-eligible
questions after exclusions, reported per dataset and arm in `eligible_n.json`.
The dataset audit estimates 270–360 usable GPQA-Main items; `mmlu_pro` is
capped at 400 sampled; `hle` is a 200-item control. We do not assume the cap is
the analysable n, and we do not replace ineligible items after looking at
outcomes.

**Power model.** Paired binary outcomes, McNemar, two-sided α = 0.05, power
0.80. `π_d` is the discordant-pair proportion; `δ` is the absolute risk
difference. The planning approximation is
`δ ≈ (z_{1−α/2} + z_{1−β}) √(π_d / n)` per condition.

**Minimum detectable difference (absolute, percentage points):**

| n per condition | π_d = 0.15 | π_d = 0.20 | π_d = 0.25 |
|---:|---:|---:|---:|
| 300 | 6.3 pp | 7.2 pp | 8.1 pp |
| 400 | 5.4 pp | 6.3 pp | 7.0 pp |

At the expected baseline accuracy `b0 = 0.40`, the n = 400 / π_d = 0.20 cell
(6.3 pp) is ≈ 15.7% relative; at n = 300 it is ≈ 18.1% relative. At
`b0 = 0.30`, 6.3 pp is ≈ 20.9% relative; at `b0 = 0.45`, ≈ 13.9% relative.
With the worst-case Holm adjustment across the 4-test confirmatory family
(α = 0.0125), the n = 400 / π_d = 0.20 MDE is ≈ 7.5 pp; if EG-SSS-180 joins as
a third primary dataset (6 tests, α = 0.0083), it is ≈ 7.8 pp. The smallest
detectable difference we will claim at n = 400 with the full 4-test family is
therefore **7.5 pp absolute (≈ 19% relative at b0 = 0.40)**; the unadjusted
planning MDE is 6.3 pp.

**Power honesty.** If the realised eligible n on a dataset is below 300, that
dataset is reported as underpowered for the primary contrast and is not used to
claim a positive effect. The H1/H2 interaction is expected to be underpowered
at this n; it is a boundary analysis, stated as such in advance.

---

## 6. Analysis plan

### 6.1 Freeze and pairing

One screening pass per question and seed produces the round-0 state; all
conditions reuse it. Pairing key: `(dataset, question_id, seed)`. The option
permutation is deterministic from the seed and question id and is shared across
conditions. A condition that cannot reuse the frozen prefix is not analysed as
paired and is flagged.

### 6.2 Primary test

For each primary dataset:

1. **Exact McNemar test** on seed 1, paired by question, on pressure-eligible
   items (B8 vs B8-no-trust final-answer correctness). This is the confirmatory
   p-value.
2. **Paired risk difference** (B8 − B8-no-trust) in percentage points, with a
   95% CI from 10,000 question-clustered bootstrap resamples (resample
   questions within dataset; seeds stay attached to their question).
3. **Seed-2 replication**: the same exact McNemar test, reported with its sign
   and p-value. Replication is judged by sign consistency and a CI that does
   not cross zero in the opposite direction; no multiplicity adjustment is
   applied to the replication because it is not used to claim a new endpoint.
4. **Mixed-effects sensitivity**: logistic regression on seed-level outcomes
   with fixed effects condition, dataset, seed, and a random intercept for
   question; report the condition odds ratio and 95% CI. This is a sensitivity
   analysis, not the confirmatory test.

CMR uses the same structure (exact McNemar on seed 1, bootstrap risk
difference, seed-2 replication).

### 6.3 Multiplicity

- Confirmatory family: 2 endpoints × 2 primary datasets = 4 tests, Holm at
  family-wise α = 0.05. `hle` is a control and is not in the family.
- Secondary family: the 5 tests in §4.3, Holm at family-wise α = 0.05.
- H1/H2 interaction: 2 interaction terms, Holm at α = 0.05, plus the
  pre-registered simple slopes.
- Everything else is exploratory and labelled as such; exploratory p-values
  are not used to support a confirmatory claim.

### 6.4 Exclusions and missing data

Pre-specified exclusions, with counts reported per dataset and condition:

- **Ineligible item**: answer type not automatically scorable, empty gold,
  option-rendering failure, or missing round-0 panel.
- **No-minority item**: no initially correct agent or no wrong majority at
  round 0. Excluded from the pressure-eligible primary set; retained in the
  all-eligible non-inferiority set.
- **Failed manipulation check**: only for injection-based analyses (external
  consensus). The executable four-arm matrix has no injection, so this
  exclusion does not apply to the primary set. Counts are still reported.
- **Parse failure**: the final answer cannot be parsed. In the intention-to-
  treat primary analysis a parse failure counts as incorrect. A complete-case
  sensitivity analysis excluding parse failures is reported alongside; the
  two analyses are not swapped after seeing the result.

No imputation of outcomes. Missing seeds are reported, not silently dropped.
A failed matrix row is reported in `summary.json` and `table.md`; it is not
replaced by a different question.

### 6.5 H1/H2 moderators

- `q̂` per domain: verifier balanced accuracy on the human-audited claim-
  passage pairs, held out from the matrix. Domains follow the claim router:
  biomed/clinical, physics/chemistry, math/CS, other. If a domain has fewer
  than 30 audited pairs, it is pooled into "other" and the pooling is recorded
  before the matrix is unblinded.
- `ρ̂`: redundancy measured from the debate transcripts as the fraction of
  atomic claims shared across agents plus reused evidence passages, computed
  before joining final-answer correctness. Question-level `ρ̂` is used for the
  interaction; the dataset-level mean is reported descriptively.
- The interaction model is the one named in §1. `q*` and `ρ*` are computed
  from the frozen design parameters (m, α, β) and are not tuned on outcomes.

### 6.6 Subgroups

No subgroup hunting. The only pre-registered subgroups are the two primary
datasets, the HLE control (reported separately), the four claim domains, and
the `q̂`/`ρ̂` strata for H1/H2. Any other split is exploratory, labelled as
such, and cannot be promoted to a confirmatory claim after the fact.

---

## 7. Decision rule

For each primary dataset, read the final-accuracy contrast first, then CMR:

- **Benefit / H1 supported**: B8 > B8-no-trust on final accuracy, Holm-adjusted
  p < 0.05, 95% CI lower bound > 0, seed-2 same sign, and non-inferiority on
  all eligible items holds. If only CMR is significant, the paper reports a
  mechanism-only result, not a primary success.
- **Backfire / H2 supported**: B8 < B8-no-trust with Holm-adjusted p < 0.05
  and a 95% CI excluding 0 in the negative direction. This is reported as the
  sign-reversal/boundary result; the mechanism is not redefined to avoid it.
- **Negative at the SESOI**: the 95% CI for the risk difference lies entirely
  below the 5 pp SESOI (upper bound < 5 pp), so a benefit of at least 5 pp is
  ruled out at this n.
- **Inconclusive**: anything else, including a CI that includes 0 and extends
  beyond the SESOI, or an underpowered dataset (n < 300). No positive claim is
  made.

The decision rule is evaluated per dataset and reported for all datasets,
including `hle` (control, descriptive only).

---

## 8. Stopping rules and amendments

1. **No condition is added, removed, or redefined after seeing results.** The
   only pre-unblinding additions allowed are B8-placebo and B8-oracle (WP-18)
   and EG-SSS-180 (benchmark freeze), each with a new version and a new config
   hash. The v1.3 draft in §12 is the proposed version for the first pair; its
   Full config hash is recorded there and is not effective until sign-off.
2. **No optional stopping and no interim analysis of the primary contrast.**
   Pipeline-health metrics (parse rate, evidence coverage, row failures) may be
   monitored; they cannot change an arm, an endpoint, or the analysis set.
3. **No outcome-based row replacement.** If a dataset fails to load, is
   unpinned, or a row crashes, the attempt is logged, retried for infrastructure
   reasons only, and otherwise reported as missing. A dataset is not swapped
   for an easier one after seeing results.
4. **Any change to the manifest** — condition set, sample cap, model revision,
   prompt text, parser/verifier version, dataset revision, decoding parameters
   — requires a new pre-registration version and a new `experiments.yaml`
   hash. The previous version is archived, not edited in place.
5. **No prompt or threshold tuning on the matrix.** Alpha/beta, floor/ceiling,
   max_claims, and verifier thresholds are fixed at the values recorded in §10
   before the first row. Any tuning happens on the pilot/validation sets and is
   documented before the matrix.
6. **Negative results are not a stopping failure.** The matrix runs to
   completion (or reports failed rows) regardless of direction.

---

## 9. Freeze record

The signing-time snapshot is completed at launch by `run_manifest.json`;
the values below are the pre-run record. A manifest mismatch refuses resume
(P0-11), so a changed hash cannot silently pool with this version.

| Item | Value |
|---|---|
| Pre-registration version / date | 1.0 / 9 November 2026 |
| Signing base commit | `842dacc` (`origin/feat/p0-hardening`; historical signing branch, now retired) |
| Matrix-cut commit | recorded in `experiments/p0/WP-14.md` and `run_manifest.json` at launch |
| `trustcal/configs/experiments.yaml` sha256 | `d63ee9ac0c6ebfc5fc59f84bb5643e9bc283e4186f0ef0fb5a31d6634763d01d` (committed blob) |
| `agents/prompts.py` sha256 | `6cc9b0e611718294e9977f3f430a84e8dd2c34e600d3c6a04b151d0c8ecb93d0` (pre-WP-13; superseded by the v1.1 erratum: `bc9c7b…`) |
| Parser version | `p0-1` (`parser_version` stored per record) |
| Verifier | name/version stored per verdict; balanced accuracy audited on 150–200 pairs |
| Decoding | temperature 0.7, rounds 3, N = 3 agents, seeds 1 and 2 |
| Trust configuration | alpha 0.5, beta 0.3, floor 0.1, ceiling 0.9, max_claims as recorded |
| Prompt set | B8 and B8-no-trust must differ only in the trust line / aggregation switch; WP-13 enforces this with a prompt-diff test before the matrix |
| Dataset revisions | `gpqa_main` `633f5ee89ab8ad4522a9f850766b73f62147ffdd`; `mmlu_pro` `b189ec765aa7ed75c8acfea42df31fdae71f97be`; `hle` `5a81a4c7271a2a2a312b9a690f0c2fde837e4c29` |
| Model revisions (Final stack) | `Qwen/Qwen3.8-27B-FP8` `c3a462cc3d38cf351f3b26cbd763469eeb74ef81`; `RedHatAI/gemma-4-26B-A4B-it-FP8-dynamic` `ed35d7abe5d940da41b4ff06eb482feb0be8cb44`; `jeffcookio/Mistral-Small-3.2-24B-Instruct-2506-awq-sym` `49ec31ec0975e46a1aeef24186a45f11be3042b8` |
| Model revisions (Dev stack) | `QuantTrio/Qwen3.5-9B-AWQ`, `google/gemma-4-12B-it-qat-w4a16-ct`, `cyankiwi/Ministral-3-14B-Instruct-2512-AWQ-4bit`; resolved HF commit SHAs are recorded in `run_manifest.json` at launch |

The file hashes above are sha256 of the committed git blobs, so a checkout with
different line endings still verifies against the same value;
`run_manifest.json` records the on-disk hashes it actually reads at launch and
refuses resume when they differ.

The Dev stack is the P0 execution stack; the Final stack is listed because the
freeze record must name both. If the Dev checkpoints cannot be resolved to a
commit SHA at launch, the run is not started: an unpinned model is a freeze
failure, not a warning.

The v1.3 draft (§12) proposes a different execution stack for the main causal
matrix and records a placeholder for the Full config hash. Those values are not
part of this v1.0 freeze record; on sign-off they become the launch record for
the Full matrix and supersede the Dev/Final split for the main matrix. The Final
stack above remains the precision-replication stack.

---

## 10. Estimand and reporting

- **Estimand:** the average treatment effect of trust-weighted aggregation
  versus majority aggregation with identical evidence, prompts, partition, and
  compute, on pressure-eligible scientific questions, averaged over the
  question population represented by the sampled datasets.
- **Effect size:** paired risk difference in percentage points (pp), with 95%
  question-clustered CI; odds ratio from the mixed-effects sensitivity model.
- **Raw counts:** n eligible, n pressure-eligible, n exposed (minority exists),
  n collapsed, n correct, per arm and dataset. Rates are never reported without
  their denominators.
- **Reporting:** all pre-registered endpoints, all datasets (including `hle`),
  all exclusions with counts, all failed rows, and all deviations. The paper
  reports the pre-registered result even when it is null or negative.
- **No "best arm" selection.** B8 is the treatment, B8-no-trust is the
  comparator, and the appendix baselines are not used to choose a favourable
  contrast after the fact.

---

## 11. What this pre-registration does not cover

- The Month-1 pilot and its Gate-1 criterion (`PILOT_CRITERION.md`).
- The 150–200-item human evaluation of revision warrants and reasoning
  alignment; it has its own annotation protocol.
- The thesis appendix grid (commented `appendix_conditions:` in
  `trustcal/configs/experiments.yaml`).
- The injection manipulation-check study (P0-9), which is a separate protocol
  and cannot be merged into the primary analysis set.
- Any claim about natural, non-adversarial scientific QA beyond what the
  sampled GPQA-Main/MMLU-Pro items support.

---

## 12. Amendment log

| Version | Date | Change | Status |
|---|---|---|---|
| 1.0 | 9 November 2026 | Initial pre-registration; executable 4-condition matrix cut; six-arm target named | frozen |
| 1.1 | 9 November 2026 | Erratum: released prompt hash `bc9c7b…`; `origin/feat/p0-hardening` retired; B8-placebo/B8-oracle assigned to WP-18; oracle semantics pending WP-18 | frozen |
| 1.2 | benchmark freeze | Add EG-SSS-180 as the third primary dataset and the gold-evidence testbed | pending |
| 1.3 | 9 November 2026 (draft) | **v1.3 draft — pending team sign-off.** Records placebo/oracle semantics, the 32-row Full default (36-row gold-answer alternate), the 4-bit/80 GB execution stack, the FP8 precision replication, and a $500–600 budget with a $600 hard stop. No endpoint, hypothesis, or analysis family changes. | draft — pending team sign-off |
| 1.4 | 9 November 2026 | B7 provider: Gemini retired; OpenAI gpt-6-luna | frozen |

Amendments are made only before unblinding. Once the first confirmatory row is
inspected, the version is closed; a later change is a new pre-registration, not
an edit.

### v1.1 erratum — 9 November 2026

This erratum does not change the v1.0 endpoints, tests, exclusions, or analysis.
It records the P0 release state and corrects labels that would otherwise
misroute the remaining work.

- **Released prompt hash.** The released `agents/prompts.py` blob begins
  `bc9c7b…`; the v1.0 value `6cc9b0…` was the pre-WP-13 blob and is superseded.
  `run_manifest.json` records the on-disk hash actually read at launch.
- **Branch retirement.** P0 is released; `main` and `dev` are both at
  `2ae56a3`, with tags `p0-gate` = `055a244` and `p0-release` = `7f2c11f`.
  The signing branch `origin/feat/p0-hardening` is retired; §9's row is
  historical. Only `main`, `dev`, and short-lived `next/*` branches remain.
- **WP label collision.** v1.0 §2 and §8 used the label "pending WP-13" for the
  two arms. That label is historical: the landed WP-13 is the B8-no-trust
  prompt split. The pending placebo/oracle slice is **WP-18**; its planning
  record is `experiments/next/WP-18.md`. All substantive references in this
  document now point to WP-18.
- **§5 wording correction.** v1.0 line 204 called 8,000 debates "planned rows";
  this erratum corrects it to "8,000 planned debates; 24 rows; 1,067 GPU-h
  planned; 1,280 GPU-h gate cap."
- **Six-arm target.** WP-18 will add `placebo_mode` and `oracle_mode`, a
  separate `configs/experiments_full.yaml`, and the mock/smoke coverage. The
  target is 6 arms × 3 datasets × 2 seeds = 36 runs at 300 items/dataset =
  10,800 debates / 1,440 GPU-h if B8-oracle uses gold-answer trust; 32 runs /
  1,280 GPU-h if B8-oracle is gold-evidence-only on EG-SSS. The v1.0 Core
  matrix remains 24 runs, 8,000 planned debates / 1,067 GPU-h, with the
  1,280 GPU-h gate cap.
- **Oracle semantics pending.** WP-18 must freeze whether B8-oracle uses
  gold-answer trust or gold-evidence-only trust on EG-SSS. Neither definition
  is asserted here; the choice changes the run count and GPU envelope above.
  B7 (Gemini external answer) is not B8-oracle.
- **EG-SSS-180.** Not in v1.0. It joins at benchmark freeze as v1.2. No
  EG-SSS result exists at this date.

### v1.4 erratum — 9 November 2026

This erratum records the B7 provider and sampling protocol. It does not change a
pre-registered matrix endpoint, an arm, a dataset, a seed, or a run count.

- **Provider.** B7 moves from Gemini 3.1 Pro Preview to OpenAI `gpt-6-luna`
  (released 22 September 2026). The model is pinned by name; each B7 record
  stores `provider`, `model`, `response_id`, and `system_fingerprint` alongside
  the answer. `OPENAI_API_KEY` is the only B7 key; the Gemini runtime path is
  retired.
- **Protocol.** B7 draws three independent samples per question
  (`OPENAI_ORACLE_SAMPLES=3`) with default reasoning and no `temperature`
  (GPT-6 Luna supports only its default value). Per-sample answers and
  correctness are stored in the record.
- **B7 reporting endpoints.** The B7 report gives (a) mean single-call accuracy
  with a question-level bootstrap CI and (b) 3-sample majority accuracy. Ties
  in the majority resolve to the first sample.
- **Status unchanged.** B7 remains an optional, appendix-only external-answer
  ceiling, not B8-oracle, and it is not in the four-condition Core matrix or the
  six-arm Full target. B8-oracle semantics remain pending WP-18 as recorded in
  v1.1; this erratum does not decide them.
- **Smoke.** A live 3-sample smoke passed on 9 November 2026 (`B/B/B` for 2+2);
  the single-call smoke also passed.
- **Cost.** Three samples cost roughly $3–9 per 1,000 questions at $0.10/M
  input and $0.50/M output, dominated by output tokens; recompute from the
  actual prompt/output tokens before quoting a total.

### v1.3 draft - pending team sign-off (9 November 2026)

> **Draft only — not approved and not effective.** This is the proposed v1.3
> amendment for team sign-off. It records the execution plan and budget only.
> It changes no endpoint, hypothesis, test, exclusion, or analysis family in
> §§1 and 4–7. Until it is signed, the operative pre-registration remains v1.0
> plus the frozen v1.1/v1.4 errata, and the figures below are proposed, not
> approved. On sign-off this section becomes v1.3; the v1.0 values above remain
> the historical record.

**Why this amendment exists.** v1.0 left the placebo/oracle semantics and the
Full row count to WP-18, and its budget assumed the two-stack Dev/Final plan.
This draft fills that placeholder: it records the execution plan the team
intends to run — a 4-bit stack on one 80 GB A100 for the main causal matrix, a
32-row Full default with a gold-evidence oracle on EG-SSS, a 96 GB FP8
precision replication, and a $500–600 budget with a $600 hard stop. It is
recorded before any confirmatory Full row so the plan cannot be adjusted after
seeing outcomes. It supersedes the v1.1 framing that treated the 36-run
gold-answer plan as the target and left the oracle definition pending: the
32-row gold-evidence plan is the default and the 36-row gold-answer plan is the
alternate.

**1. Execution stack and hardware.**

| Item | v1.3 draft value |
|---|---|
| Main causal matrix | 4-bit `Qwen3.8-27B-AWQ-INT4` (~21.0 GB), `Gemma 4 26B-A4B` AWQ (~17.2 GB), `Mistral 24B` AWQ (15.06 GB); ~53.3 GB total |
| Main model revisions | `cyankiwi/Qwen3.8-27B-AWQ-INT4` `e3a700906e6a73ba4290b1873dc2ba8198527ab5`; `cyankiwi/gemma-4-26B-A4B-it-AWQ-4bit` `5c5db8a7aeabb70b27923ef56536aa5343ecbb5b`; `jeffcookio/Mistral-Small-3.2-24B-Instruct-2506-awq-sym` `49ec31ec0975e46a1aeef24186a45f11be3042b8` |
| Main hardware | one 80 GB A100 PCIe spot at $0.136/GPU-h |
| Core matrix | unchanged: 4 conditions × 3 datasets × 2 seeds = 24 rows; ~1,067 planned / 1,280 GPU-h cap |
| Full datasets | `gpqa_main`, `mmlu_pro`, `eg_sss_180`; HLE remains a Core control and is not in the 32-row Full plan |
| Full matrix, default | 32 rows: 24 rows for the four core arms (3 datasets × 2 seeds) + 6 `B8-placebo` rows (3 datasets × 2 seeds) + 2 `B8-oracle` rows (`eg_sss_180` × 2 seeds); 1,280 GPU-h |
| Full matrix, alternate | 36 rows: 24 core-arm rows + 6 `B8-placebo` + 6 `B8-oracle` (`gold_answer`, 3 datasets × 2 seeds); 1,440 GPU-h |
| Seeds | 1 and 2 in both matrices |
| Full config hash | sha256 `40bef0f31b66953c4072dc2854e16c0396fbb7fd` (`experiments_full.yaml`) |
| Core config hash | sha256 `722cf5b910beb9a162cab5ade81fa629ff3510be` (`experiments_fourbit.yaml`) |
| Precision config hash | sha256 `fd34b51f393f3c76969345b53818fc63ec3008ef` (`experiments_precision.yaml`) |

The hashes are sha256 of the committed blobs above. The Full config now pins
`phase: fourbit`; the pre-pin value `F3C4904C…` is superseded. The 36-row
variant is an alternate, not the default; it is not covered by this hash and
requires its own config hash and version bump before execution. Full uses 300
items per dataset (the 300-item EG-SSS Full target); the v1.2 freeze owns the
180-item floor.
Core and Full use the same 4-bit stack. Cell reuse is allowed only where model
revisions, prompts, datasets, and caps match; the Full envelope below is costed
as a full 32-row run and does not assume reuse.

**2. Placebo: cross-agent round pool.**

`B8-placebo` uses `placebo_unit: round_pool`. In each debate round, the verdict
labels are shuffled across all agents' claims in that round. Claim text and the
evidence attached to each claim stay with the claim; only the verdict-to-claim
assignment moves, and the verdict-label multiset is preserved. The arm keeps
B8's prompts, retrieved evidence, source partition, trust weighting, rounds, and
compute. This breaks claim-level and
agent-level alignment and is the stronger of the two implemented WP-18 units
(the per-agent `agent_round` unit is not the Full default). It tests whether the
effect comes from evidence calibration or from any re-weighting. The WP-18
record fields (`placebo_mode`, `placebo_unit`, `placebo_seed`,
`placebo_permutation_hash`, `placebo_noop_reason`) remain required; a round with
fewer than two verdicts is recorded as a no-op, never silently replaced by B8.

**3. Oracle: gold evidence on EG-SSS.**

`B8-oracle` uses `oracle_mode: gold_evidence` and runs only on `eg_sss_180`.
The normal verifier and trust path are kept; the dataset's gold evidence is
substituted for retrieval, and trust is computed from the verifier's verdicts on
that evidence. The oracle does not set trust from the gold answer and does not
bypass the verifier. Its schedule recomputes trust every round and disables
adaptive-triggering abstention, so a unanimous panel is updated rather than
skipped. It is a non-deployable evidence/verifier upper bound, not B7, and it
contributes 2 of the 32 Full rows. The 36-row alternate instead uses
`gold_answer` on all three datasets; that is a different manipulation and is not
the default.

**4. Precision replication (FP8, 96 GB).**

The FP8 Final stack runs on one 96 GB GPU, on GPQA only, with B3,
B8-no-trust, and B8, 150–200 questions, and seed 1. The pinned stack is
Qwen3.8-27B-FP8 (29.95 GB), Gemma 4 26B-A4B FP8 (28.67 GB), and Mistral 24B AWQ
(15.06 GB), totalling 73.68 GB; the Qwen revision is
`c3a462cc3d38cf351f3b26cbd763469eeb74ef81`, and the Gemma and Mistral
revisions are unchanged from the v1.0 freeze record (§9). It also serves as the
N1 Final-stack hardware smoke. It is a directional precision check on the
higher-precision stack: not an equivalence test, not a powered replication, and
not a confirmatory endpoint. It does not enter the Holm families or the decision
rule. A failed hardware smoke stops the FP8 path; it does not authorize a 96 GB
main run.

**5. Budget.**

| Stage | v1.3 draft (USD) | Basis |
|---|---:|---|
| Pilot | 15–20 | ~112 GPU-h on the 80 GB A100 |
| Core matrix (24 rows) | 175–210 | 1,067 planned / 1,280 GPU-h cap, 20% overhead |
| Full matrix, 32-row default | 210 | 1,280 GPU-h, 20% overhead |
| Full matrix, 36-row alternate | 235 | 1,440 GPU-h, 20% overhead |
| FP8 precision replication + N1 smoke | 25–40 | 60–100 GPU-h at $0.336/GPU-h |
| Storage and bandwidth | 40–80 | persistent cache, ingress/egress |
| **Total** | **500–600** | planning envelope |
| **Hard stop** | **600** | no spend beyond without a new signed amendment |

All amounts are planning envelopes in USD, not invoices. The total covers the
pilot, Core, either Full variant (32-row $210 or 36-row $235), the precision
replication, and storage/bandwidth, with contingency. The hard stop is a
ceiling, not a target. The main matrix is budgeted at $0.136/GPU-h; the
precision path at $0.336/GPU-h. The Full envelope is costed as a full 32-row
run; any cell reuse where the stack and revisions match can only reduce actual
spend, not raise it. Law-testing is outside this envelope and the $600 hard
stop; it requires a separate cost model and approval.

**6. Fallback if the 80 GB A100 spot is unavailable.**

If the main runs move to a 96 GB GPU at $0.336/GPU-h, the planning total
becomes $1,050–1,150. That path is not authorized by this draft: it requires
explicit team re-approval and a new hard stop before any 96 GB main row starts.
The $600 hard stop applies only to the 80 GB plan.

**7. Superseded figures (historical).**

The following v1.0-era figures are superseded by this draft and must not be
quoted as current guidance:

| Old guidance | Old value | Status |
|---|---:|---|
| Final-stack smoke | $80–120 | historical; replaced by the $25–40 FP8 precision replication / N1 smoke |
| Pilot | $50–100 | historical; replaced by $15–20 |
| Core run | $420–580 | historical; replaced by $175–210 |
| Full run | $900–1,200 | historical; replaced by $210 (32-row) / $235 (36-row) |
| Core + Full planning range | $1,320–1,780 | historical; replaced by the $500–600 total |
| Hard stop | $1,350 | historical; replaced by $600 |

These figures still appear in some planning documents; this pre-registration
treats them as historical only. Those documents must be reconciled on sign-off,
not by editing this record.

**8. What does not change.**

- Endpoints (§4), hypotheses (§1), power and MDE (§5), analysis (§6), decision
  rule (§7), estimand and reporting (§10), exclusions (§6.4), and the
  multiplicity families (§6.3) are unchanged.
- The 24-row Core matrix remains the released matrix.
- The Full matrix is the six-arm causal design; this draft does not add a
  confirmatory family or a new Holm test.
- v1.2 remains pending; this draft does not freeze the EG-SSS dataset revision.
- B7 remains the optional external-answer ceiling from v1.4 and is not
  B8-oracle.

**9. Sign-off checks.**

- **Model phase.** The committed `experiments_full.yaml` sets `phase: final`,
  which resolves to the 96 GB FP8 stack in `configs/models.yaml`, and the Core
  config falls back to `default_phase: dev`; neither resolves to the 4-bit 27B
  stack. Before launch, pin the 4-bit stack as the matrix phase (or record the
  equivalent serving configuration) and re-record the manifest. Do not run the
  main matrix on the FP8 or Dev stack by default.
- **EG-SSS cap.** The hashed config sets `dataset_caps.eg_sss_180: 300`. Confirm
  that the v1.2 freeze is the 180-item floor and the Full target is 300; if the
  Full cap changes, recompute the debate/GPU envelope and re-hash.
- **Core hash.** §9 records the v1.0 `experiments.yaml` blob `d63ee9…`; the
  current committed blob differs only in comments. Re-record or mark the v1.0
  value historical at sign-off so the launch manifest does not refuse a
  comment-only mismatch.

---

**Signed:** Group 6 · Team Phantom Devs — 9 November 2026.

**v1.3 draft status:** not signed. The v1.3 draft above is pending team
sign-off and must not be cited as approved.
