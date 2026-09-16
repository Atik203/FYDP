# Month-1 Behavioral-Effectiveness Pilot — Fixed Go/No-Go Criterion

**Status:** fixed 2026-09-16, before Phase 1 build starts. Required by `roadmap.md` (Phase 0 checklist) and `docs/blueprint.md` §13 step 4. Do not soften this after seeing the numbers.

**What it tests (blueprint §0, Assumption 3 / Challenge C):** do trust-weight changes *causally* shift the final aggregation output, or do they just sit in the context without behaving? This is the highest-risk assumption in the project; the pilot exists so it is answered on ~25 toy questions, not after months of engineering.

## Setup

- ~25 toy questions, selected in Phase 1, where the **evidence contradicts the majority** under the §5.4 injection protocol (the correct answer is the minority position).
- Questions are chosen and frozen **before** the run; no post-hoc exclusion, no re-picking. Two team members independently label a question as "evidence contradicts majority" before it enters the set; disagreements are resolved before running.
- Each question is run through the debate loop twice for aggregation purposes: (a) unweighted majority winner, (b) trust-weighted winner (`weighted_aggregate` with the v1 trust update, blueprint §5.6–5.7).
- The trust inputs (support/harm verdicts) must come from the evidence side of the question, **not** from agent self-reported confidence — that distinction is the entire mechanism, and the pilot is invalid if it is shortcut.

## Pass / Fail

- **PASS — Go:** trust weighting changes the final aggregation (weighted winner ≠ unweighted majority winner) on **≥ 15 of 25** questions where the evidence contradicts the majority (≥ 60%). Phase 2 proceeds.
- **AMBIGUOUS — 10–14 of 25:** rerun with a second seed. If the pooled result is still < 60%, treat as No-Go.
- **NO-GO — < 10 of 25:** stop; do not build further. Write the result up honestly as a finding about *when* evidence-grounded trust does not behaviorally influence LLM aggregation (blueprint §18.6), and escalate to the supervisor before any Phase 2 work.

## Tooling

- **Question set:** local JSON (`[{"question","answer","options"}]`) passed with `--questions-file`; finalized toy set lives in `experiments/pilot-month1/questions.json` once written.
- **Debate run:** `python scripts/run_experiment.py --arm B3 --questions-file <file> --limit 25` (add the injection arm variant if the pilot uses injected pressure).
- **Trust-weighted comparison:** ⚠️ **not implemented yet.** The runner currently produces majority aggregation only. The pilot needs a small `--trust-weight` mode that assigns support/harm verdicts from the evidence side of each toy question and compares `weighted_aggregate` (trust v1, `trust/update.py` + `trust/aggregation.py`) against the majority outcome. Tracked as a Phase 1 item in `roadmap.md`.
- **Scoring:** per question, "changed" = trust-weighted winner ≠ unweighted majority winner; a change toward the injected/incorrect side counts against the criterion (see Pass/Fail above). Report the count out of 25.

## Notes

- The criterion is about *behavioral* effect (aggregation changes), not accuracy on the toy set — accuracy comes later, at scale.
- If trust weights shift aggregation on ≥ 60% of pressured questions but the shift is in the wrong direction (toward the injected wrong consensus), that is also a No-Go and must be reported as such.
- Record everything in `results/pilot/` (trust trajectories + both aggregations per question); the trajectory logs are load-bearing for Propositions 2–3 later.
