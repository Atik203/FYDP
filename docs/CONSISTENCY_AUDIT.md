# Consistency Audit — P0 State Reconciliation

> **Historical snapshot (9 Nov 2026, pre-release).** This file records the pre-release reconciliation and is superseded by the P0 release at `2ae56a3` (13/13 gate, 514 tests; WP-09 complete; WP-18 placebo/oracle pending; only `main` and `dev`). The body's **11/13 gate**, **478-test count**, **`feat/*` branch model**, **WP-13 placebo/oracle naming**, and **Core-prefix/top-up cost note** are all superseded. In this historical text, `WP-13` was used for the placebo/oracle slice; current WP-13 is the landed B8-no-trust split. The comparison body below is preserved as history, not current status.

> **Current budget (9 November 2026; supersedes all cost lines below):** main matrix on one **80 GB A100 PCIe** at **$0.136/GPU-h**; Core **$175–210**; Full **$210** (32-row gold-evidence default) or **$235** (36-row gold-answer alternate); FP8 precision replication + N1 smoke **$25–40**; storage/bandwidth **$40–80**; **total $500–600**; **hard stop $600**. See `docs/agent/08_COMPUTE_COST.md`.

**Date:** 9 November 2026  
**Branch:** `docs/repo-consistency`  
**Mode:** Mode 1 (edit/polish) for the current-state corrections; Mode 4 (audit) for this report. **Authorship rung B:** the author wrote the source text; this pass edits for accuracy and clarity.

**Scope:** `docs/*.md`, `UPDATE-CHECKLIST.md`, `literature_review/index.md`, `experiments/p0/*.md`, `trustcal/IMPLEMENTATION_STATUS.md`. Documentation only; no code, tests, configs, or results were changed.

**Canonical P0 state used for this pass:**

- Trust: logit accumulation → one softmax → floor/ceiling simplex projection, with support/harm normalized by claim counts. Trust is wired into the debate loop.
- Retrieval: claim-domain routing is implemented. The verifier interface is implemented; the human audit is pending.
- Gate: **11/13** passed; WP-13 (B8-no-trust) and WP-09 (B8+injection) pending. **478 tests.**
- Matrix: **24 rows / 1,280 GPU-h**; `PRE_REGISTRATION.md` v1.0.
- Benchmark: target **300**; floor **180**; stretch **600**; no-go **800**.
- Dates: thesis **June/July 2027**; paper submission after the defence, **August–December 2027**.
- Branches: long-lived `dev` (development/integration) and `main` (release trunk; the web frontend deploys from `main`). `feat/p0-hardening` is temporary.
- Landing sequence: `feat/p0-hardening` → `dev` → `main` (release), tagged `p0-gate` and `p0-release`. Slice branches are temporary and deleted after merge.

## Changes

| File | Old statement | New statement | Reason |
|---|---|---|---|
| `UPDATE-CHECKLIST.md:8` | No current P0 status; the page opened with the 8 Nov audit. | Added the 9 Nov P0 status note: 11/13 gate, 478 tests, 24-row matrix, `dev`/`main` branch model, landing tags. | The page is team-facing; without a status note, the 8 Nov diagnosis reads as current. |
| `UPDATE-CHECKLIST.md:86` | "Do not merge branches; push `feat/full-pipeline`." | "Keep P0 work on `feat/p0-hardening`; push the slice branches. Do not merge into `dev` or `main` until the gate." | `feat/full-pipeline` was renamed to `dev`; P0 integration is temporary. |
| `UPDATE-CHECKLIST.md:97-98` | "C+ core: 4 arms + oracle, ~1,000 questions"; "EG-SSS benchmark: 180 items." | "P0 causal matrix: 4 conditions × 3 datasets × 2 seeds (24 rows)"; "EG-SSS benchmark: 300 items (180 floor)." | Matches the executable matrix and the current benchmark decision. |
| `UPDATE-CHECKLIST.md:102` | No P0 matrix compute line. | Added 4 conditions × 3 datasets × 2 seeds, caps 400/400/200 = 8,000 debates ≈ 1,067 GPU-h; gate figure 9,600 debates = 1,280 GPU-h. | The old page only carried the 30,000-h and TACL figures; it did not state the executable P0 budget. |
| `UPDATE-CHECKLIST.md:110-117` | Benchmark table made 180 the default; 300 was "stronger"; 600 was "9+ floor"; 800 was "9+ benchmark." | 180 = floor, 300 = target, 600 = stretch, 800 = no-go; old scores labelled "Earlier score estimate." | The team decision is target 300 with a 180 floor; the old table promoted 180 and implied 800 was the goal. |
| `UPDATE-CHECKLIST.md:157-158` | Target TACL 1 February 2027; fallback EMNLP 28 May 2027; do not submit ACL 2027. | Current calendar: thesis June/July 2027; paper after the defence, August–December 2027. The 1 Feb / 28 May dates are kept as a historical venue plan. | The old deadlines no longer match the thesis calendar. Kept as history rather than deleted. |
| `UPDATE-CHECKLIST.md:190` | "Do not merge `main` and `feat/full-pipeline` unless the team decides." | "Do not merge `dev` or `main` until the P0 gate; integrate P0 slices on `feat/p0-hardening`, then merge to `dev` and release `main`." | Branch model changed; the old line used the retired branch name. |
| `docs/presentation.md:37` | "The matrix uses one thousand questions per set; the pilot, fifty." | "The matrix caps GPQA and MMLU-Pro at four hundred each and HLE at two hundred; the pilot, twenty-five." | Matches `PRE_REGISTRATION.md` caps and `PILOT_CRITERION.md`. |
| `docs/presentation.md:45` | "Then softmax, clamp, renormalize." | "Then one softmax and a floor/ceiling projection", with support/harm normalized by claims checked. | Removes the superseded operator and the raw-count implication. |
| `docs/presentation.md:53` | "Each debate runs three rounds and three seeds"; total ~300 GPU-h. | "Each debate runs three rounds; the matrix uses two seeds"; ~1,280 GPU-h for the current matrix. | Two seeds and the 24-row matrix are the current design. |
| `docs/presentation.md:69` | Measured with "CCR, MPR and ECR." | Measured with "final-answer accuracy, CCR, MPR and trust calibration." | ECR is deprecated and is not a primary endpoint. |
| `docs/presentation.md:195` | "Retrieval is source-partitioned: each agent's claims go to a different source." | "Retrieval is claim-domain routed: bio and clinical claims go to PubMed, physics and math to arXiv, with Semantic Scholar as the shared fallback." | The source-by-agent design was replaced by claim-domain routing (WP-12). |
| `docs/presentation.md:201-209` | Trust equation used raw V and H counts and "S at t plus one equals S at t". | Trust uses the logit of S(t) plus α·V/n − β·H/n; n is claims checked. | Matches the P0 operator and claim-count normalization. |
| `docs/presentation.md:214-215` | "Why softmax, then clamp, then renormalize?" | "Why softmax, then a simplex projection?" with the floor/ceiling explanation. | Removes the old operator from the judges' script. |
| `docs/presentation.md:242-243` | "Why three rounds and three seeds?" | "Why three rounds and two seeds?"; seeds are replicates, question is the unit of analysis. | Current matrix uses two seeds. |
| `docs/presentation.md:253,296,337,349` | "Three hundred GPU-hours" / "Three seeds" in cost and cross-cutting answers. | 1,280 GPU-h for the current matrix; two seeds. | One stale figure and one stale seed count repeated across the script. |
| `docs/project_structure.md:5` | No status note; the page described the reference layout as current. | Added a status note: plain-Python runner, claim-domain routing, P0 trust operator; `IMPLEMENTATION_STATUS.md` is the status source. | The layout is a reference, not a status report. |
| `docs/project_structure.md:27,61` | `orchestrator/` described as a LangGraph state machine. | Plain-Python debate state machine; the LangGraph port is not implemented. | Matches the code status map. |
| `docs/project_structure.md:57` | "source-partitioned RAG"; verdicts supported/contradicted/unverifiable. | "claim-domain routed RAG"; verdicts include contested; default lexical scorer, NLI/LLM-judge interface exists, human audit pending. | Removes the retired retrieval design and the "stub" reading of the verifier. |
| `docs/project_structure.md:59` | Update rule "softmax → clamp → renormalize"; test "thousands of synthetic sequences." | "logit accumulation → one softmax → floor/ceiling simplex projection"; 30,000 draws for N=1,3,5. | Matches WP-03/WP-14 evidence. |
| `docs/project_structure.md:93` | Blueprint correspondence: "source-partitioned retrieval." | "claim-domain routed retrieval." | Same design correction as above. |
| `docs/title_rationale.md:9` | "softmax, a clamp to [0.1, 0.9], and a renormalization each round." | "one softmax and a floor/ceiling simplex projection each round." | Old operator. |
| `docs/image_prompt.md:125` | Round-loop node "Source-partitioned retrieval." | "Claim-domain retrieval." | Figure prompt would otherwise regenerate the retired design. |
| `docs/image_prompt.md:139` | Formula `S(t+1) = S(t) + alpha V - beta H`. | `S(t+1) = log S(t) + alpha V/n - beta H/n`. | Matches the P0 logit update and claim normalization. |
| `docs/image_prompt.md:195` | Trust Update third line "renormalized each round." | "simplex projection each round." | Removes the clamp/renormalize label. |
| `docs/image_prompt.md:211,222-223` | Five-step chain: "Clamp / 0.1 to 0.9"; "Renormalize / sum equals 1." | "Simplex projection / floor and ceiling"; "Trust weights / sum equals 1", with a note that the chain is the P0 operator. | The figure is current; the labels must match the implemented operator. |
| `literature_review/index.md:5` | "Last updated: 2026-09-12." | "Last updated: 2026-11-09", with a status note that papers #11–#15 remain unread and the 2025–26 frontier is not reviewed here. | Status-only update; no citations or reviews added. |
| `literature_review/index.md:82` | Gap map first row: "Evidence-grounded in-session trust re-weighting — None — Novel." | Added a status note: the row predates the 2026 prior-art audit; R²-MAD, TERA-RAG and "To Trust or Not" preempt parts of the mechanism. The row is retained as the September record. | Prevents the "None/Novel" row from being read as the current novelty claim. |
| `literature_review/index.md:135` | Verification log ended 2026-09-17. | Added a 2026-11-09 status row: no new reviews; the five unread papers remain unread; no matrix rows added. | Records the current review status without inventing reviews. |
| `docs/agent/06_AGENT_CHECKLIST.md:3` | Checklist presented as the live task board; expected 206 tests. | Status note: historical pre-P0 plan; current state 11/13, 478 tests, landing sequence. | The checklist is historical; unchecked boxes are not current status. |
| `docs/agent/06_AGENT_CHECKLIST.md:8,232,375` | `feat/full-pipeline` presented as the work branch. | Labelled historical; `feat/full-pipeline` is now `dev`, and the P0 landing is `feat/p0-hardening` → `dev` → `main`. | Branch model changed; historical facts kept. |
| `docs/agent/README.md:3-7` | Status date only; canonical branch `feat/full-pipeline` (10 commits ahead of `main`). | Audit snapshot dated; P0 integration branch and long-lived `dev`/`main` model stated. | Current branch model. |
| `docs/agent/README.md:27` | No P0 status note; 8 Nov audit read as current. | P0 status note: 11/13, 478 tests, 24 rows / 1,280 GPU-h, landing sequence. | Prevents the 8 Nov diagnosis from reading as current code state. |
| `docs/agent/README.md:32,62` | "Canonical branch: `feat/full-pipeline`"; "`main` must be merged with `feat/full-pipeline`." | `dev` is the long-lived development branch; `main` is release-only. P0 merges into `dev` after the gate, then releases to `main`. | Branch model changed. |
| `docs/agent/09_P0_INTERFACES.md:133-139` | `feat/full-pipeline` and `main` read-only until the gate; no force-push except `Phase-1-main` rebuild. | `feat/p0-hardening` temporary; long-lived `dev`/`main`; landing sequence and tags; `Phase-1-dev`/`Phase-1-main` are retired tags; no force-push. | Current branch model and release path. |
| `trustcal/IMPLEMENTATION_STATUS.md:34-37` | `feat/full-pipeline` canonical; `Phase-1-dev`/`Phase-1-main` branches. | `dev` integration, `main` release, `feat/p0-hardening` temporary; Phase-1 snapshots are tags; slice branches temporary; landing sequence. | Current branch model; removes retired branch names. |
| `docs/agent/02_P0_FIXES.md:3` | No status note; fix list read as current. | Status note: historical 8 Nov P0 fix list; 11/13, 478 tests, 24 rows / 1,280 GPU-h; branch names historical. | The fix list is historical; current state lives elsewhere. |
| `experiments/p0/README.md:3` | "Integration branch: `feat/p0-hardening`"; slice branches listed without lifecycle. | `feat/p0-hardening` temporary; merges to `dev` after 13/13, then `main`; tags; slice branches deleted after merge. | Current branch model. |
| `experiments/p0/WAVE2.md:5` | "`pytest` 465" presented as the current count. | Reconciled on merge to "`pytest` **478**"; landing sequence added. | The upstream P0 commit updated the count; the merge conflict was resolved to the current number. |
| `docs/blueprint.md:14` | No P0 state note; the blueprint is labelled canonical. | Added a P0 state note: trust operator and claim-domain retrieval supersede the original design; source-per-agent diagram is historical. | The blueprint otherwise reads as current and still shows the retired retrieval design. |
| `docs/blueprint.md:206` | "the original logit accumulation→softmax→simplex projection order was found to violate the floor after renormalization." | "the original softmax→clamp→renormalize order was found to violate the floor after renormalization; P0-5 replaces it with logit accumulation → one softmax → floor/ceiling simplex projection." | Corrects the record: the old order was clamp-then-renormalize, not the new order. |
| `docs/blueprint.md:209` | Frozen invariant: "source-partitioned retrieval." | "claim-domain routed retrieval (P0-12)." | The invariant would otherwise preserve the retired source-by-agent design. |
| `docs/FYDP1_defence_Q&A.md:5` | Gate 10/13; WP-14 pending; no test count. | Gate 11/13; WP-13/WP-09 pending; WP-14 landed; 24 rows / 1,280 GPU-h; 478 tests. | The guide is used live; the old status note was wrong. |
| `docs/FYDP1_defence_Q&A.md:70,94` | 459 tests; "103 functions." | 478 tests. | Current suite count. |
| `docs/FYDP1_defence_Q&A.md:96` | "the evidence layer is the Phase 2 wiring." | "the evidence layer is implemented; the human verifier audit is the remaining gate." | Retrieval/verifier interface are implemented; the audit is the open item. |
| `docs/FYDP1_defence_Q&A.md:156` | Source partitioning "A→PubMed, B→arXiv, C→Semantic Scholar." | "Claims route by domain; sources are partitioned by claim type, not agent identity." | Removes the source-by-agent confound. |
| `docs/FYDP1_defence_Q&A.md:162-163,176` | Pilot 50; main 400 per dataset; 3 seeds for the pilot; "1000 questions per set." | Pilot 25; caps 400/400/200; 2 seeds for the matrix; pilot is a single frozen set; 400 GPQA / 400 MMLU-Pro / 200 HLE. | Matches `PILOT_CRITERION.md` and `PRE_REGISTRATION.md`. |
| `docs/FYDP1_defence_Q&A.md:340` | "Clamp caps it at 0.9." | "The ceiling caps it at 0.9." | Operator terminology. |
| `docs/FYDP1_defence_Q&A.md:652` | "seeds [1,2,3], caps 50 pilot / 1000 main." | "seeds [1,2], caps 25 pilot / 400 GPQA / 400 MMLU-Pro / 200 HLE." | Current experiment configuration. |
| `docs/FYDP1_defence_Q&A.md:715-719` | ECR "Phase 3"; baselines B2/B4–B10 "deferred"; bootstrap/d "planned"; non-GPQA loaders "🔴". | ECR deprecated; B1–B10 implemented with B6/B9/B10 labelled approximations; bootstrap/d implemented; all five loaders normalized but only GPQA live-tested. | Status table was pre-P0. |
| `docs/FYDP1_defence_Q&A.md:815,979,984,986` | ~300 GPU-h; retrieval/verdicts/ECR "planned"; remaining work "wiring evidence"; budget answer ~300 h. | 1,280 GPU-h for the current matrix; trust wired, retrieval implemented, verifier audit pending, ECR deprecated; remaining work is the paid matrix and audit. | Removes the last "not wired" and 300-h statements from the live guide. |

## Stage naming update (second pass)

The P0 branch gained `docs/GLOSSARY.md` in `8417dc7` (merged into this branch at `e53ba70`). Current plans now use the glossary names. Legacy labels appear once as a mapping; the bodies of historical audit snapshots keep their old facts.

| File | Old statement | New statement | Reason |
|---|---|---|---|
| `docs/GLOSSARY.md` | Not present on this branch. | Added from `origin/feat/p0-hardening` (`8417dc7`): Pilot run, Core run (legacy “C+”), Ceiling sweep, Full run (legacy “TACL full”), Final replication, Law-testing; TACL is a venue only. | Canonical stage names and date scope. |
| `docs/agent/README.md:9-11` | No glossary link. | Linked `../GLOSSARY.md` and named Core run / Full run. | Discovery: agents and teammates need the naming source. |
| `UPDATE-CHECKLIST.md:10` | No one-time mapping; old labels appeared in the score table, run table, benchmark table, cost table, and links. | Added one-time mapping, then used Core run / Full run throughout. `TACL` is kept only as the venue/submission target. | Glossary rule: legacy labels once, then plain names. |
| `UPDATE-CHECKLIST.md:18-19,43,88,92,97-104,110-120,138-139,231` | C+ core; TACL full run; TACL main; C+ supporting artifact; C+ matrix; TACL cost row. | Core run; Full run; Full-run benchmark; Core run / Full run cost rows; Core-run benchmark. | Stage names now distinguish R3 (Core) from R5 (Full); TACL is not a stage. |
| `UPDATE-CHECKLIST.md:157-158` | Venue section had no stage calendar. | Added Pilot Dec 2026; Core Jan 2027; Full Feb 2027; Final after Full; Law-testing Apr 2027; thesis June 2027; defence June/July; paper Aug–Dec 2027. The old TACL 1 Feb 2027 submission target is kept as historical. | Matches `docs/GLOSSARY.md`; separates the Full-run month from the old submission deadline. |
| `docs/agent/03_EXPERIMENT_PLAN.md:5` | No stage mapping; “core 6-arm” used for the 6-arm design. | Added the glossary mapping; 180 = Core-run benchmark, 300 = Full-run benchmark; the 6-arm tables are the Full-run target. | Removes the collision between “core” and “Core run.” |
| `docs/agent/03_EXPERIMENT_PLAN.md:67,69,127-129,226-228,245-246,251` | “core 6-arm factorial”; “Core arms”; 180 “C+ supporting artifact / Default”; 300 “Stretch”; C+ / TACL main cost rows; TACL feasibility. | Full-run 6-arm; Full-run arms; 180 Core-run benchmark; 300 Full-run benchmark; 600 stretch; 800 no-go; Core run / Full run cost rows; Full-run feasibility. | Aligns the detailed plan with the glossary and the 180/300 split. |
| `docs/agent/08_COMPUTE_COST.md:89-94,102-103,118,165-166` | C+ core; TACL main; “C+ saves”; “P0/pilot/C+”; “C+ core / TACL main” summary. | Core run; Full run; “Core run saves”; “P0/pilot/Core run”; Core run / Full run summary. Added a note that Full-run is all-in and Core is a prefix, so costs are not additive. | Stage naming; prevents adding the two budget rows. |
| `docs/FYDP1_defence_Q&A.md:163,778,858` | “C+ budget”; “paid C+ matrix”; “The C+ matrix is the next gate.” | “Core-run budget”; “paid Core run”; “The Core run is the next gate.” | Live defence guide should use the glossary names. |
| `docs/agent/00_START_HERE.md:5` | No stage-name mapping in the existing status note; body still uses C+ / TACL full. | Added the `docs/GLOSSARY.md` mapping to the status note. The historical table and stage definition are unchanged. | This is a historical audit snapshot; the rule is a status note, not a body rewrite. |
| `docs/agent/07_9PLUS_BLUEPRINT.md:7,24,415,580,592,594,605,635-636` | Red-team note and body used “C+ staged,” “C+ scope,” “C+ core,” “TACL” for the run. | Mapping in the red-team note; body uses Core run / Full run; TACL retained only as venue. | Current planning text; the 9+ analysis and probabilities are unchanged. |
| `experiments/p0/WAVE2.md:5` | Merge conflict between the 465 Wave-2 snapshot and the upstream 478 count. | Resolved to `pytest` **478**, with the landing sequence. | Current count wins; the historical 465 output remains in `WP-14.md`. |

## Branch model and landing sequence

Current-state references now use the long-lived branch model:

- `main` — release trunk; the web frontend deploys from `main`.
- `dev` — single development/integration branch.
- `feat/p0-hardening` — temporary P0 integration branch; merged into `dev` after the 13/13 gate, then deleted.
- `Phase-1-dev` / `Phase-1-main` — retired to tags `phase-1-dev` and `phase-1-main-untested`; not branches.
- Slice branches (`p0/wp-*`, `docs/*`, `feat/frontend-*`) — temporary; deleted after merge.

Final landing sequence: **`feat/p0-hardening` → `dev` → `main` (release)**, tagged **`p0-gate`** and **`p0-release`**.

## Kept as historical, not rewritten

- `docs/agent/00_START_HERE.md` and `docs/agent/01_CURRENT_STATE.md` retain their 8 Nov audit bodies and existing status notes. Their `feat/full-pipeline` lines describe the pre-P0 snapshot; this pass did not rewrite them.
- `docs/agent/06_AGENT_CHECKLIST.md` body still contains historical `feat/full-pipeline` task lines; the status note and the three inline "historical" labels mark them.
- `UPDATE-CHECKLIST.md` §2 keeps the 8 Nov broken-state table; the top status note says it is the diagnosis, not current status.
- `docs/blueprint.md` §5 still contains the original source-per-agent diagram; the top P0 note says it is superseded.
- `experiments/p0/WP-14.md` keeps the 465-test gate output as the Wave-2 evidence record; `WAVE2.md` now states the current 478 count.

## Unresolved contradictions

- `docs/agent/05_WRITING_AND_VENUE.md`, `docs/agent/07_9PLUS_BLUEPRINT.md` and `docs/blueprint.md` still carry the earlier TACL 1 February 2027 / April 2027 timeline. `UPDATE-CHECKLIST.md` records the current June/July 2027 thesis and August–December 2027 paper dates, following `docs/GLOSSARY.md`. The detailed planning docs were left as dated plans.
- `docs/agent/00_START_HERE.md` and `docs/agent/01_CURRENT_STATE.md` still show `feat/full-pipeline` / `feat/p0-hardening` in their historical bodies. The status notes mark them as pre-P0 snapshots; current branch names are in `docs/agent/README.md`, `docs/agent/09_P0_INTERFACES.md`, and `trustcal/IMPLEMENTATION_STATUS.md`.
- `docs/FYDP1_defence_Q&A.md` §4.8–§4.9 still contains a few pre-P0 edge-case lines (ECR `NotImplementedError`, "three seeds", planned cache/retry). The top status note marks older "stub / not wired" lines as historical; these were not all rewritten in this pass.
- **Historical cost note (superseded; see the current-budget banner above).** The old snapshot reported the Full-run row as an all-in GPU-hour total ($900–1,200) and Core at $420–580. Those figures are retired; the current model is Core $175–210 and Full $210 (32-row gold-evidence default) or $235 (36-row gold-answer alternate), with a $500–600 total and a $600 hard stop in `docs/agent/08_COMPUTE_COST.md`.
- `docs/agent/01_CURRENT_STATE.md` still has the pre-P0 branch table and the "merge `feat/full-pipeline` into `main`" task. Its status note marks the file as a historical snapshot; the current branch model is in `docs/agent/README.md`, `docs/agent/09_P0_INTERFACES.md`, and `trustcal/IMPLEMENTATION_STATUS.md`.

## Verification

- `git diff --check` passes (no whitespace errors).
- No code, tests, configs, or results were changed by this pass; the test suite was not run for this docs-only work. The 478-test and 11/13 figures are the current numbers supplied for this task and match the P0 evidence files for the earlier 465-test snapshot plus the later suite increase.
- Integrated `origin/feat/p0-hardening` at `8417dc7` through merge commit `e53ba70`; the only conflict was `experiments/p0/WAVE2.md`, resolved to the current 478-test count.
- Documentation commit for the P0 reconciliation and branch model: `354daf9`.
- Documentation commit for the Core run / Full run naming pass: `011cee5`.
- The audit commit is separate from the documentation commits, as requested.
