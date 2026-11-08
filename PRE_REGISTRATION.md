# Pre-registration — Trust-Calibrated Multi-Agent Scientific Deliberation (P0 matrix)

**Version:** 1.0
**Date:** 9 November 2026
**Status:** frozen before any confirmatory matrix run; the executable matrix in
`trustcal/configs/experiments.yaml` is cut to four conditions. The two remaining
arms of the six-arm target are pending WP-13 and must be added, with a version
bump, before unblinding.
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
| 5 | **B8-placebo** | retrieved; verdicts shuffled within debate | trust-weighted | **pending WP-13**, added before unblinding |
| 6 | **B8-oracle** | gold evidence (gold-evidence subset) | trust-weighted | **pending WP-13**, added before unblinding |

The executable matrix is exactly the four conditions above:
4 conditions × 3 datasets × 2 seeds = 24 runs. `B8-placebo` and `B8-oracle`
need RunConfig switches that do not exist until WP-13; they are documented here
as the remaining two arms of the six-arm target and will be added as version
1.1 before unblinding. Adding them is not optional and not result-dependent:
the causal claim in the thesis requires the placebo contrast
(evidence calibration vs any re-weighting) and the oracle upper bound
(verifier bottleneck). If WP-13 misses the pre-run window, the matrix runs as
version 1.0 and the thesis reports the six-arm design as incomplete rather
than silently dropping the contrast.

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
| `EG-SSS-180` | not in this matrix | benchmark freeze | mechanism test with gold evidence; added at benchmark freeze, before unblinding |

**Sampling.** Samples are deterministic and stratified, not `rows[:cap]`
(dataset loader policy, `trustcal/configs/datasets.yaml`). GPQA options are shuffled per
question with a seeded permutation; the correct answer is not always first.
`gpqa_main` and `mmlu_pro` are the primary datasets. `hle` is a control:
it is retrieval-resistant, so a trust gain there is not a positive-evidence
claim; its accuracy and abstention behaviour are reported separately.

**EG-SSS-180.** Not in this matrix. The 180-item gold-evidence set (60
biomed, 60 phys/chem, 60 math/CS) is added at benchmark freeze as version 1.2,
before unblinding. It becomes the third primary dataset for CMR and the only
dataset where B8-oracle is fully meaningful. No EG-SSS results exist at the
date of this version.

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
Planned rows: 4 conditions × (400 + 400 + 200) × 2 seeds = 8,000 debates,
≈ 1,067 GPU-h at 8 min/debate. The P0 gate uses the conservative
`sample_caps.main = 400` for every dataset:
4 × 3 × 2 × 400 = 9,600 debates × 8 min / 60 = 1,280 GPU-h ≤ 1,500 GPU-h.

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
   only pre-unblinding additions allowed are B8-placebo and B8-oracle (WP-13)
   and EG-SSS-180 (benchmark freeze), each with a new version and a new config
   hash.
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
| Signing base commit | `842dacc` (`origin/feat/p0-hardening`) |
| Matrix-cut commit | recorded in `experiments/p0/WP-14.md` and `run_manifest.json` at launch |
| `trustcal/configs/experiments.yaml` sha256 | `d63ee9ac0c6ebfc5fc59f84bb5643e9bc283e4186f0ef0fb5a31d6634763d01d` (committed blob) |
| `agents/prompts.py` sha256 | `6cc9b0e611718294e9977f3f430a84e8dd2c34e600d3c6a04b151d0c8ecb93d0` (committed blob) |
| Parser version | `p0-1` (`parser_version` stored per record) |
| Verifier | name/version stored per verdict; balanced accuracy audited on 150–200 pairs |
| Decoding | temperature 0.7, rounds 3, N = 3 agents, seeds 1 and 2 |
| Trust configuration | alpha 0.5, beta 0.3, floor 0.1, ceiling 0.9, max_claims as recorded |
| Prompt set | B8 and B8-no-trust must differ only in the trust line / aggregation switch; WP-13 enforces this with a prompt-diff test before the matrix |
| Dataset revisions | `gpqa_main` `633f5ee89ab8ad4522a9f850766b73f62147ffdd`; `mmlu_pro` `b189ec765aa7ed75c8acfea42df31fdae71f97be`; `hle` `5a81a4c7271a2a2a312b9a690f0c2fde837e4c29` |
| Model revisions (Final stack) | `Qwen/Qwen3.6-27B-FP8` `a56219b8202864dc6d3e565be5ff1eea01f54cb4`; `RedHatAI/gemma-4-26B-A4B-it-FP8-dynamic` `ed35d7abe5d940da41b4ff06eb482feb0be8cb44`; `jeffcookio/Mistral-Small-3.2-24B-Instruct-2506-awq-sym` `49ec31ec0975e46a1aeef24186a45f11be3042b8` |
| Model revisions (Dev stack) | `QuantTrio/Qwen3.5-9B-AWQ`, `google/gemma-4-12B-it-qat-w4a16-ct`, `cyankiwi/Ministral-3-14B-Instruct-2512-AWQ-4bit`; resolved HF commit SHAs are recorded in `run_manifest.json` at launch |

The file hashes above are sha256 of the committed git blobs, so a checkout with
different line endings still verifies against the same value;
`run_manifest.json` records the on-disk hashes it actually reads at launch and
refuses resume when they differ.

The Dev stack is the P0 execution stack; the Final stack is listed because the
freeze record must name both. If the Dev checkpoints cannot be resolved to a
commit SHA at launch, the run is not started: an unpinned model is a freeze
failure, not a warning.

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
| 1.1 | before unblinding | Add B8-placebo and B8-oracle after WP-13 adds the RunConfig switches (six-arm target complete) | pending |
| 1.2 | benchmark freeze | Add EG-SSS-180 as the third primary dataset and the gold-evidence testbed | pending |

Amendments are made only before unblinding. Once the first confirmatory row is
inspected, the version is closed; a later change is a new pre-registration, not
an edit.

---

**Signed:** Group 6 · Team Phantom Devs — 9 November 2026.
