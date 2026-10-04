# FYDP I Defence — Master Q&A Guide

**Group 6 · Team Phantom Devs · CSE 4000A (B) · Final Defence**

> One file for the whole team. Important mechanisms have a **Code:** pointer (file:line) and a **Report:** pointer.
> Honest rule: say what runs today, what is built but not wired, and what is planned. Judges respect that.
> If you do not know an answer, say: "I will come back to that," and pass it to the owner of the slide.

## Index

- [0. How to Use This Guide](#0-how-to-use-this-guide)
- [1. Project in One Page](#1-project-in-one-page)
- [2. Talk Plan — 6 Minutes](#2-talk-plan--6-minutes)
- [3. Q&A by Slide (M1–M6)](#3-qa-by-slide-m1m6)
- [4. Code Map](#4-code-map)
- [5. Show-Me-in-Code Questions](#5-show-me-in-code-questions)
- [6. Implemented vs Planned](#6-implemented-vs-planned)
- [7. Datasets & Sources](#7-datasets--sources)
- [8. Experiments & Evidence](#8-experiments--evidence)
- [9. Where Is It in the Report?](#9-where-is-it-in-the-report)
- [10. Team Contributions](#10-team-contributions)
- [11. Emergency Answers](#11-emergency-answers)

## 0. How to Use This Guide

**Status legend** (used throughout):

- ✅ **Runs today** — implemented and tested in the repo.
- 🟡 **Built, not wired** — code exists and is tested, but is not yet called inside the debate loop.
- 🔴 **Planned** — a stub exists (`NotImplementedError`) or the work is scheduled in a later phase.

**Answer rules:**

1. Answer in one to three short sentences. Point at the slide when you mention a code.
2. For "show me in the code" questions, open the file and function named in the **Code:** line.
3. If asked about a planned feature, say it plainly: "That part is Phase 2; the trust math is already tested standalone."
4. Never imply agents see the gold answer — they never do.
5. One owner per slide: M1 Rakibul · M2 Yousuf · M3 Atik · M4 Pratay · M5 Salman · M6 Limu.

**Handoff phrases (say them naturally):**

- "Yousuf will now present our goals and data."
- "Atik will present our method."
- "Pratay will present the flow and setup."
- "Salman will present the results and the engineering check."
- "Limu will close the presentation."

## 1. Project in One Page

Our project is an evidence-checked debate system for large language models (LLMs) answering hard science questions. Three different models debate the same question over three rounds. Instead of letting them copy each other and agree on a wrong answer, we split their answers into claims, check each claim against real scientific literature (PubMed, arXiv, Semantic Scholar), and adjust how much each model counts in the final vote. Influence comes from evidence, not from the number of voices.

**Pipeline in one line:** question → confidence gate → three-agent debate (3 rounds) → claims extracted → claims checked against evidence → trust scores updated each round → trust-weighted vote → result package (answer + citations + trust trajectory).

**The problem it fixes:** sycophantic consensus — a confident wrong majority pushing a correct minority to abandon its answer.

**How we know it works so far:** Gate 0 runs the full three-model debate loop on 10 GPQA questions (10/10 debates finished, 90/90 positions non-empty). The evidence-trust layer (trust update + weighted vote) is implemented and unit-tested; wiring it into the debate loop is Phase 2.

**Where the data lives:** `experiments/gate0/` (report, summary, transcript).

## 2. Talk Plan — 6 Minutes

Deck: `/slide/final/1` (14 slides). Speech: `docs/presentation.md` (compact deck section). Total 674 words ≈ 5.6 minutes at 120 wpm.

| Presenter | Slides | Cap (words) | Approx. time |
| --- | --- | --- | --- |
| M1 — Rakibul Hasan | 1–3 | 118 | 0.98 min |
| M2 — Yousuf Kamal Himel | 4–5 | 111 | 0.93 min |
| M3 — Md. Atikur Rahaman | 6–7 | 115 | 0.96 min |
| M4 — Pratay Paul | 8–9 | 118 | 0.98 min |
| M5 — Md. Salman Rohoman Nayeem | 10–11 | 100 | 0.83 min |
| M6 — Mst. Farjana Akter Limu | 12–14 | 112 | 0.93 min |

Rules: short connected sentences, each slide picks up from the one before, point at the slide for codes (P1, K4, B10, CCR).

## 3. Q&A by Slide (M1–M6)

### M1 — Rakibul Hasan · Slides 1–3

**Slide 1 — Title**

- **Q: What is the project in one sentence?**
  **A:** We make multi-agent debate decide by evidence, not by a head count, so a confident wrong majority cannot push a correct agent to agree with it.
  **Report:** `FYDP_Summer/0.1.abstract.tex`; journal abstract `Papev_Summer26_6/cas-sc-template.tex:120-123`.
- **Q: Who did what in the team?**
  **A:** Atikur leads architecture and the trust mechanism. Rakibul works on the debate loop and the injection protocol. Salman handles claim decomposition and retrieval. Pratay runs evaluation and the metrics. Yousuf builds the baselines and serving. Limu handles the evidence APIs and the dashboard.
  **Report:** `FYDP_Summer/3.design.tex:183-198` (task table).
- **Q: Who is the supervisor?**
  **A:** Dr. Mohammad Nurul Huda, Professor at UIU. We also thank our FYDP instructor, Dr. Ohidujjaman.
  **Report:** `FYDP_Summer/0.2.ack.tex:8-10`.
- **Q: What is the FYDP I timeline and what is done?**
  **A:** FYDP I covers design plus the first working phase. Done: serving, Gate 0 debate pilot. Next phases: injection and trust wiring, the full matrix, ablations, human study.
  **Report:** `FYDP_Summer/3.design.tex:80-134` (phases and gates); `roadmap.md`.

**Slide 2 — Introduction**

- **Q: What is sycophantic consensus?**
  **A:** It is when agents give up a correct answer just because the majority disagrees, so the whole group agrees on the wrong answer with full confidence.
  **Report:** `Papev_Summer26_6/cas-sc-template.tex:132` (Introduction).
- **Q: Why is majority voting weak?**
  **A:** Every agent counts the same, so a confident wrong majority can outvote a correct minority. The evidence never enters the decision.
- **Q: Why three agents?**
  **A:** Three is the smallest group where a majority can form, and three different model families make their errors less correlated.
  **Report:** `Papev_Summer26_6/cas-sc-template.tex:194` (agents).
- **Q: What does the figure show?**
  **A:** One claim from an agent answer is checked against a retrieved passage. The verdict then moves that agent's trust score.
  **Asset:** `frontend/public/figures/fig-claim-example.png`.
- **Q: Does debate not already improve accuracy?**
  **A:** Yes, it usually does. The failure is in the final aggregation, not in debate itself. That is the part we replace.
- **Q: Why not fine-tune the models to be less sycophantic?**
  **A:** Fine-tuning would hide the effect and tie us to one model. Our mechanism must work on models as they are served. No fine-tuning anywhere in the pipeline.

**Slide 3 — Motivation**

- **Q: Where does the "over twenty percent" number come from?**
  **A:** ConsensAgent (ACL 2025 Findings). In over twenty percent of wrong-answer cases, the correct answer was already present but ignored.
  **Report:** `literature_review/papers/02-consensagent-pitre-2025.md`.
- **Q: What is the "forty-one to eighty-seven percent" figure?**
  **A:** MAST (NeurIPS 2025) measured failure rates across seven multi-agent frameworks. The exact ceiling is eighty-six point seven percent.
  **Report:** `literature_review/papers/09-mast-cemri-2025.md`.
- **Q: What is a truth-aware oracle?**
  **A:** DebUnc (EMNLP 2025 Findings) tested an oracle that knows the gold answer. It beat deployable confidence signals by up to ten percent — but it needs the answer key, so it is only an upper bound.
  **Report:** `literature_review/papers/03-debunc-yoffe-2025.md`.
- **Q: What does "one in four disagreements hides a correct minority" mean?**
  **A:** About a quarter of all disagreements contain a correct agent whose answer gets outvoted.
- **Q: Why is confidence not a safe signal?**
  **A:** An agent can be wrong and still report high confidence, and social pressure changes the score without changing the evidence.
- **Q: Is sycophancy the same as hallucination?**
  **A:** No. A hallucination is a wrong fact. Sycophancy is abandoning a right answer under social pressure.

### M2 — Yousuf Kamal Himel · Slides 4–5

**Slide 4 — Objective**

- **Q: What does "bounded trust score" mean?**
  **A:** Every agent's weight stays between zero point one and zero point nine. No agent can take over the vote, and no agent disappears.
  **Code:** ✅ `trustcal/src/trustcal/trust/update.py:20-23` (floor 0.1, ceiling 0.9).
- **Q: Why kappa of at least zero point seven five?**
  **A:** Kappa measures how much two human annotators agree beyond chance. Zero point seven five is our quality gate; below it we fix the rubric and re-label.
  **Code:** ✅ `trustcal/src/trustcal/eval/agreement.py:12-29` (`cohen_kappa`); gate in `trustcal/scripts/annotate.py:33-36`.
- **Q: Who annotates, and on what?**
  **A:** Two human annotators label the same shuffled forty-item set: thirty divergent questions plus ten controls.
  **Code:** ✅ `trustcal/src/trustcal/eval/annotation.py:30-53`.
- **Q: Why ten baselines?**
  **A:** B1 to B4 isolate debate and retrieval, and B5 to B10 cover the published competitors. That shows exactly what our trust layer adds.
  **Code:** ✅ registry `trustcal/src/trustcal/eval/baselines.py:10-21`.
- **Q: What are the four metrics?**
  **A:** Accuracy, CCR for collapse, MPR for minority survival, and ECR for evidence calibration.
  **Code:** ✅ CCR/MPR `trustcal/src/trustcal/eval/metrics.py:35-46`; ECR 🔴 stub `:49-54`.
- **Q: What does "changes decisions, not just the prompt" mean?**
  **A:** We must show the trust score changes the final answer. If it only changes the wording, the mechanism adds nothing.
- **Q: What happens if the pilot gives a negative result?**
  **A:** We report it as a finding. The Go/No-Go criterion was frozen before the pilot ran, so we cannot move it afterwards.

**Slide 5 — Dataset**

- **Q: Why these five sets?**
  **A:** GPQA and MMLU-Pro give stable accuracy numbers. HLE is the expert ceiling. BrokenMath and BrokenArXiv are adversarial sets built to provoke sycophancy.
  **Report:** `docs/blueprint.md` §8:358; journal datasets `Papev_Summer26_6/cas-sc-template.tex:260-270`; full table in [7. Datasets & Sources](#7-datasets--sources).
- **Q: What is BrokenMath?**
  **A:** Math problems with perturbed false premises. The question looks normal, but the setup is wrong.
- **Q: What is BrokenArXiv?**
  **A:** Statements taken from deliberately flawed papers, refreshed monthly. Every result cites the snapshot it used.
- **Q: What do the two filters do?**
  **A:** The first keeps only divergent questions where the agents disagree. The second keeps only MCQ or numeric answers, so correctness can be checked. About sixty to seventy percent pass.
  **Code:** ✅ `trustcal/src/trustcal/orchestrator/injection.py:36-38` (`is_checkable`); protocol `trustcal/INJECTION_PROTOCOL.md`.
- **Q: Why one thousand questions per set?**
  **A:** One thousand gives stable paired statistics in the main matrix. The pilot runs fifty for speed.
  **Code:** `trustcal/configs/datasets.yaml:52-54` (caps).
- **Q: Do the agents ever see the gold answer?**
  **A:** Never. Gold answers are used only to select questions and to score results.
  **Report:** `trustcal/INJECTION_PROTOCOL.md` (scoring only).
- **Q: Why are some datasets gated?**
  **A:** GPQA and HLE need a click-through access agreement. HLE was approved, and BrokenArXiv rotates monthly, so we pin revisions.
  **Code:** `trustcal/configs/datasets.yaml:26-40` (HLE gated, GPQA revision pinned at `633f5ee...`).

### M3 — Md. Atikur Rahaman · Slides 6–7

**Slide 6 — Conventional Method**

- **Q: What is the Oracle model in the baselines?**
  **A:** B7 sends each question to a large commercial model, Gemini 3.1 Pro, as a ceiling reference. One call per question, about five to seven dollars in total. It is not part of our mechanism and never sees the gold answer.
  **Report:** `docs/blueprint.md:322,339`.
- **Q: Why is B8 inside the B1 to B10 list if it is yours?**
  **A:** B8 is the proposed trust-calibrated system, placed in the same comparison set. B1 to B9 are the baselines; B8 is ours.
  **Code:** `trustcal/src/trustcal/eval/baselines.py:18`.
- **Q: What is static aggregation?**
  **A:** MoA merges the model outputs once, in layers. After the merge there is no per-agent trust and no way to revisit it.
- **Q: What does iMAD do?**
  **A:** It predicts when a debate is worth starting, using hesitation cues from a self-critique. It cuts token costs by up to ninety-two percent, but once triggered it still uses majority voting.
  **Report:** `literature_review/papers/01-imad-fan-2026.md`.
- **Q: What does ConsensAgent do?**
  **A:** It detects stalling or copy-paste behaviour and rewrites the prompt. The final choice still comes from self-reported confidence.
  **Report:** `literature_review/papers/02-consensagent-pitre-2025.md`.
- **Q: Are all ten baselines running today?**
  **A:** Not yet. B1 and B3 are implemented; B9 and B10, the reimplementations, are Phase 3 work.
  **Code:** ✅ `trustcal/src/trustcal/eval/baselines.py:25` (`RUNNER_ARMS = B1, B3, injection`); phase map `:28-37`.
- **Q: What is the gap in one line?**
  **A:** No existing method ties an agent's influence to external evidence while the debate is running.

**Slide 7 — Proposed Method**

- **Q: How does the confidence gate work?**
  **A:** It is a prompt-based YES or NO decision, not a numeric threshold. Confident questions get a direct answer; hard or disputed ones start a debate.
  **Code:** 🟡 `trustcal/src/trustcal/agents/prompts.py:11-17` (`GATE_PROMPT` — defined but not yet invoked in the runner).
- **Q: Why Qwen, Gemma and Mistral?**
  **A:** Three different model families reduce correlated errors. They do not share the same training pipeline or the same blind spots.
  **Code:** `trustcal/configs/models.yaml:20-48` (dev) and `:53-73` (final).
- **Q: Why no fine-tuning?**
  **A:** The mechanism must work on served models. Fine-tuning would hide whether the trust signal itself changes behaviour.
- **Q: What is an atomic claim?**
  **A:** One small, verifiable statement, split by effect, magnitude or subgroup so it can be checked on its own.
  **Code:** ✅ instruction `trustcal/src/trustcal/agents/prompts.py:9,23-24`.
- **Q: How are claims extracted?**
  **A:** Agents tag their own claims in XML. A parser reads the tags, and if tags are missing, a sentence-split fallback keeps up to twenty claims.
  **Code:** ✅ `trustcal/src/trustcal/agents/parser.py:38-71` (regex `:15`, fallback `:43-65`, cap 20 `:63`).
- **Q: Which sources are checked, and how are they split?**
  **A:** PubMed, arXiv and Semantic Scholar, with OpenAlex as a fallback. Retrieval is source-partitioned: each agent's claims go to a different source.
  **Code:** 🔴 stubs `trustcal/src/trustcal/retrieval/sources.py:6-18` (top_k 10; OpenAlex fallback planned, not in code yet).
- **Q: What do the four verdicts mean?**
  **A:** Supported means a passage backs the claim. Contradicted means a passage opposes it. Unverifiable means no passage settles it. Contested means the sources disagree.
  **Code:** 🔴 `trustcal/src/trustcal/retrieval/verdicts.py:11-16` (docstring has three verdicts; "contested" is designed, not yet coded).
- **Q: What happens to unverifiable claims?**
  **A:** They are excluded from the trust update. We neither reward nor punish a claim the literature cannot check.
  **Report:** `docs/blueprint.md:260`.
- **Q: How does the trust update work?**
  **A:** S at t plus one equals S at t, plus alpha times V, minus beta times H. V is the number of supported claims and H is the number of contradicted claims. Defaults are alpha zero point five and beta zero point three, tuned later in Phase 3.
  **Code:** ✅ `trustcal/src/trustcal/trust/update.py:26` (raw step); alpha/beta `:20-21`.
- **Q: What is S in that equation?**
  **A:** S is the agent's trust score — the weight its answer carries in the final vote. The score is updated after every round.
- **Q: What is t?**
  **A:** t is the debate round. S at t is the score going into the round, and S at t plus one is the updated score after the round.
- **Q: What are V and H?**
  **A:** V counts the agent's claims that the retrieved evidence supports in that round. H counts the claims the evidence contradicts.
- **Q: What are alpha and beta?**
  **A:** Alpha is the reward for each supported claim — zero point five by default. Beta is the penalty for each contradicted claim — zero point three by default. Both are tuned in the Phase 3 grid search.
  **Code:** ✅ `trustcal/src/trustcal/trust/update.py:20-21`.
- **Q: Do unverifiable and contested claims enter V or H?**
  **A:** No. Unverifiable claims are excluded from the update, and contested claims are reported separately.
- **Q: What if an agent makes no checkable claims in a round?**
  **A:** Then V and H are both zero, so its raw score stays the same for that round.
- **Q: Why softmax, then clamp, then renormalize?**
  **A:** Softmax turns scores into weights, the clamp keeps every agent inside zero point one to zero point nine, and renormalizing makes the weights sum to one. That order is fixed and unit-tested.
  **Code:** ✅ `trustcal/src/trustcal/trust/update.py:27-29,42-43`; order test `trust/test_boundedness.py:12-30`.
- **Q: What if the retrieved evidence is wrong?**
  **A:** Wrong passages can mislead the score. That is a stated limitation. Cross-source disagreement is flagged as contested, and unverifiable claims never move trust.
- **Q: Is the trust update actually called during the debate today?**
  **A:** Not yet — it is built and tested as a standalone step. The debate loop currently raises if a trust updater is passed, and the runner does not pass one. Wiring it in is Phase 2.
  **Code:** 🟡 `trustcal/src/trustcal/orchestrator/debate.py:31`; runner `trustcal/src/trustcal/runner.py:172-176`.
- **Q: How does the final vote use the trust scores?**
  **A:** Each agent's position is multiplied by its trust weight, and the answer with the highest total wins — an argmax, not a head count.
  **Code:** ✅ `trustcal/src/trustcal/trust/aggregation.py:8-15`.

### M4 — Pratay Paul · Slides 8–9

**Slide 8 — Flow Diagram**

- **Q: What are the seven processes?**
  **A:** Intake and Gate, Debate Orchestration, Claim Decomposition, Retrieval and Verification, Trust Update, Weighted Aggregation, and Result Packaging.
  **Asset:** `frontend/public/figures/fig-dataflow.png`.
- **Q: What are the four external entities?**
  **A:** The Evaluation Harness, Model Serving, the Evidence Sources, and the User or Researcher.
- **Q: What are the three data stores?**
  **A:** D1 Debate State, D2 the Evidence and Verdict Log, and D3 the Results Log.
- **Q: What is in the result package?**
  **A:** The final answer, its citations, and the full trust trajectory across the rounds.
- **Q: Where does the gold answer enter this diagram?**
  **A:** It does not. Gold is used outside the loop for selection and scoring; the agents never see it.
- **Q: Where is the injection point?**
  **A:** Not in this diagram. This is the normal path; the injection is a stress-test hook used only in the collapse experiments.
  **Code:** ✅ `trustcal/src/trustcal/orchestrator/injection.py:41-71`.

**Slide 9 — Experimental Setup**

- **Q: Why two model stacks?**
  **A:** The dev stack runs on one RTX A6000 for fast iteration. The final stack runs bigger models in FP8 on an RTX PRO 6000. The code path is identical — only the config changes.
  **Code:** `trustcal/configs/models.yaml:20-73`.
- **Q: Why four-bit for dev and FP8 for the final stack?**
  **A:** The A6000 is Ampere and cannot run official FP8 kernels, so dev uses four-bit AWQ or QAT. Blackwell supports FP8, so the final run uses it.
  **Report:** `experiments/gate0/README.md:39-62`.
- **Q: Why three rounds and three seeds?**
  **A:** Three rounds give the trust score time to update. Three seeds let us report variance and confidence intervals instead of a single lucky run.
  **Code:** `trustcal/configs/datasets.yaml:49-50`; per-agent seed `trustcal/src/trustcal/inference/client.py:77-86`.
- **Q: What exactly is injected?**
  **A:** One fabricated wrong expert consensus, appended to the targeted agent's system prompt between rounds one and two. The user question does not change.
  **Code:** ✅ `trustcal/src/trustcal/orchestrator/debate.py:47-56`; `agents/prompts.py:42-44`.
- **Q: Why is injection off in B1 to B4?**
  **A:** Those baselines give the no-pressure reference. Injection is switched on only for the collapse experiments.
  **Code:** ✅ arm selection `trustcal/scripts/run_experiment.py:19-26` (`--arm injection`).
- **Q: How do you test significance?**
  **A:** Paired bootstrap over questions with ten thousand resamples, ninety-five percent confidence intervals, and Cohen's d for effect size.
  **Report:** 🔴 planned — `docs/blueprint.md` §9:419; no stats code exists yet in `trustcal/src/trustcal/eval/`.
- **Q: What are the generation settings?**
  **A:** Temperature zero point seven, one thousand and twenty-four output tokens, four thousand and ninety-six context on dev, and three retries per agent.
  **Code:** ✅ `trustcal/src/trustcal/inference/client.py:30-46` (temp `:34`, tokens `:35`, retry `:38`); context `configs/models.yaml:17`.
- **Q: How much compute does this need?**
  **A:** About three hundred GPU-hours, budgeted around three hundred forty to eight hundred twenty US dollars depending on GPU rates.
  **Report:** `FYDP_Summer/5.sic.tex:76` (cost); `docs/blueprint.md:340`.

### M5 — Md. Salman Rohoman Nayeem · Slides 10–11

**Slide 10 — Project Results**

- **Q: Are these numbers measured?**
  **A:** No. The bars are projections for the slide layout. The measured evidence is the Gate 0 pilot.
- **Q: What did the pilot show?**
  **A:** Ten GPQA questions, three rounds each: ten out of ten debates completed, ninety out of ninety positions non-empty, and three hundred seventy point eight seconds per debate on average.
  **Report:** `experiments/gate0/README.md:29-35`; artifact `experiments/gate0/artifacts/summary-20260916T193249Z.md`.
- **Q: Why do you expect collapse to drop by twenty to thirty percent?**
  **A:** Because unsupported claims lose weight, the fabricated majority loses influence and the correct minority keeps its answer. The exact number is what the matrix will measure.
- **Q: What is ECR, and why above zero point eight?**
  **A:** ECR is evidence calibration, defined as one minus expected calibration error. Our design target is above zero point eight on the expert set.
  **Code:** 🔴 `trustcal/src/trustcal/eval/metrics.py:49-54` (Phase 3).
- **Q: What failed in the pilot?**
  **A:** One model missed its claim tags in five of thirty generations. The fallback parser handled them, so no position was empty.
  **Report:** `experiments/gate0/README.md:129-133`; **Code:** ✅ `trustcal/src/trustcal/agents/parser.py:43-65`.
- **Q: Why six minutes per debate?**
  **A:** Three models, three rounds, retrieval and four-bit inference on one GPU. That is the current cost; batching and caching will reduce it.
- **Q: When will the full matrix run?**
  **A:** After retrieval and trust pass their gates. The full matrix, the ablations and the human study are the remaining work.
  **Report:** `roadmap.md:42-46,118-130`.

**Slide 11 — Why Complex Engineering**

- **Q: What is the Washington Accord?**
  **A:** It is the international agreement that defines what an accredited engineering programme must produce. It is the standard behind our mapping.
- **Q: What are the four lenses?**
  **A:** Complex problem solving, the knowledge profile, complex engineering activities, and programme outcomes.
  **Report:** `FYDP_Summer/5.sic.tex:164-339`.
- **Q: Give one example of interdependence.**
  **A:** One retrieval error changes a verdict, the verdict changes a trust score, and the score can flip the final answer.
- **Q: What makes it multi-disciplinary?**
  **A:** It combines machine learning, natural language processing, retrieval systems and distributed model serving.
- **Q: Why is there no textbook solution?**
  **A:** No standard method exists for sycophantic consensus in LLM debate. We built the mechanism and its evaluation from the literature.
  **Report:** gap analysis `FYDP_Summer/2.back.tex:88`.

### M6 — Mst. Farjana Akter Limu · Slides 12–14

**Slide 12 — Complex Engineering Matrix**

- **Q: Why is P6 not covered?**
  **A:** P6 is stakeholder involvement. In FYDP I engagement stays inside the university; external stakeholders move to the next phases.
  **Report:** `FYDP_Summer/5.sic.tex:211`.
- **Q: Why is A3 not covered?**
  **A:** A3 is innovation. We combine existing concepts — debate, retrieval and trust weighting — so the step is incremental and not patentable.
  **Report:** `FYDP_Summer/5.sic.tex:291-309`.
- **Q: Why is A4 covered?**
  **A:** We assessed the social and environmental consequences. The harm we target is real, and energy use stays low at about three hundred GPU-hours.
- **Q: What are the coverage numbers?**
  **A:** Six of seven P attributes, all eight K areas, four of five A activities, and six of twelve programme outcomes.
  **Report:** `FYDP_Summer/5.sic.tex:311`; `Papev_Summer26_6/cas-sc-template.tex` (CE mapping).
- **Q: For P1, which K areas are needed?**
  **A:** K3 to K6 and K8. This is the exact Washington Accord wording.
- **Q: Which POs do the P attributes relate to, and which POs need K7?**
  **A:** The P attributes map to PO1 to PO8. K7 supports PO6, PO7 and PO8 — society, environment and ethics. The activities map to PO10, communication.
- **Q: What carries into FYDP II and FYDP III?**
  **A:** P6 stakeholder engagement, A3 innovation, and the remaining programme outcomes.

**Slide 13 — Conclusion · Application**

- **Q: What is the single biggest novelty?**
  **A:** Per-agent influence is grounded in retrieved external evidence during the debate. Nothing existing does that; DebUnc is closest, but it uses internal token uncertainty.
- **Q: How is this different from adding retrieval to debate?**
  **A:** Retrieval changes what an agent reads. Our trust score changes how much that agent counts in the final vote.
- **Q: Can an agent game the trust score?**
  **A:** It would have to game the retrieved literature, not another agent. Source partitioning and the contested verdict make that hard, and we report it as a limitation.
- **Q: Where does the design apply?**
  **A:** Scientific question answering, research assistants, and any evidence-rich domain such as law or medicine.
- **Q: What comes next?**
  **A:** The full experiment matrix, ablation studies, a human study, and an open-source release.
  **Report:** `roadmap.md`.

**Slide 14 — Thank You**

- **Q: Where can we find the code and the documentation?**
  **A:** The repository holds the pipeline, the injection protocol and the experiment reports. The public release is part of the next phase.
- **Q: Who should we contact for follow-up?**
  **A:** Any team member. Atikur is the group coordinator.

### Cross-cutting — any presenter

- **Q: What is novel versus iMAD?**
  **A:** iMAD decides whether a debate should happen. We decide who wins once it happens — influence comes from external evidence, not from a vote.
- **Q: Versus ConsensAgent?**
  **A:** ConsensAgent rewrites prompts to reduce sycophancy. We leave the debate alone and change the aggregation weights.
- **Q: Versus DebUnc?**
  **A:** DebUnc weights by token-level uncertainty. We weight by retrieved evidence, so the signal is external and checkable.
- **Q: Why not just use a frontier commercial model?**
  **A:** The mechanism must be model-agnostic and reproducible on open models. The commercial model appears only as the B7 ceiling reference.
- **Q: How do you know the effect is not noise?**
  **A:** Three seeds, paired bootstrap with ten thousand resamples, ninety-five percent intervals, and Cohen's d. We require the interval of the difference to stay off zero.
  **Report:** 🔴 stats code planned, specified in `docs/blueprint.md` §9:419.
- **Q: Are you correcting for multiple comparisons?**
  **A:** The primary comparison is our system versus vanilla debate. Secondary comparisons are reported with intervals and effect sizes, and labelled exploratory.
- **Q: What if the trust signal does not change decisions?**
  **A:** The behavioural Go/No-Go criterion was frozen before the pilot. A negative result is reported as a finding, not hidden.
- **Q: What is the biggest risk?**
  **A:** Retrieval coverage. Unverifiable claims are excluded, so in sparse fields the trust signal weakens. We state this as an evidence limit.
- **Q: Is the study reproducible?**
  **A:** Every run records seeds, revisions, configs and raw generations. The harness and the protocol ship with the mechanism.
  **Code:** ✅ runner `trustcal/src/trustcal/runner.py:119-144` (summary records).
- **Q: What about ethics and bias?**
  **A:** Answers carry citations a reader can check. The adversarial sets test manipulation, and the human study will follow consent rules.
- **Q: How much does the full study cost?**
  **A:** About three hundred GPU-hours. The deck estimate is three hundred forty to eight hundred twenty US dollars depending on GPU rates.
- **Q: What is the most important measured result so far?**
  **A:** Gate 0: the three-model debate loop runs end to end — ten of ten debates, ninety of ninety positions, about three hundred seventy seconds per debate.

## 4. Code Map

All paths are relative to `E:\FYDP`.

| Mechanism | Runs? | Where |
| --- | --- | --- |
| Generation settings (temp, tokens, retry, seed) | ✅ | `trustcal/src/trustcal/inference/client.py:30-46` · one client per agent `:77-86` |
| Agent system prompt + claim tags | ✅ | `trustcal/src/trustcal/agents/prompts.py:9,19-27` |
| Confidence gate prompt | 🟡 | `trustcal/src/trustcal/agents/prompts.py:11-17` (not invoked yet) |
| Claim parser (regex + fallback) | ✅ | `trustcal/src/trustcal/agents/parser.py:38-71` |
| Debate loop / rounds | ✅ | `trustcal/src/trustcal/orchestrator/debate.py:34-84` |
| Injection build + apply | ✅ | `trustcal/src/trustcal/orchestrator/injection.py:41-71` · `debate.py:47-56` |
| Trust update (S+αV−βH, α=0.5, β=0.3, clamp, softmax) | 🟡 | `trustcal/src/trustcal/trust/update.py:16-43` |
| Weighted aggregation (argmax of trust × position) | 🟡 | `trustcal/src/trustcal/trust/aggregation.py:8-15` |
| Retrieval clients (PubMed/arXiv/S2, top_k 10) | 🔴 | `trustcal/src/trustcal/retrieval/sources.py:6-18` |
| Rerank + verdicts | 🔴 | `trustcal/src/trustcal/retrieval/verdicts.py:6-16` |
| CCR / MPR | ✅ | `trustcal/src/trustcal/eval/metrics.py:35-46` |
| ECR | 🔴 | `trustcal/src/trustcal/eval/metrics.py:49-54` |
| Baselines registry + arms | ✅ | `trustcal/src/trustcal/eval/baselines.py:10-46` |
| Cohen's kappa + annotation tooling | ✅ | `trustcal/src/trustcal/eval/agreement.py:12-40` · `annotation.py:30-87` |
| Experiment runner CLI | ✅ | `trustcal/scripts/run_experiment.py:19-26` · `src/trustcal/runner.py:155-194` |
| Preflight checks | ✅ | `trustcal/scripts/preflight.py:19-24` · `src/trustcal/preflight.py:114` |
| Kappa scoring CLI | ✅ | `trustcal/scripts/annotate.py:26-58` |
| GPU-free mock servers | ✅ | `trustcal/scripts/mock_vllm.py:22-37` · `src/trustcal/mock_vllm.py:91` |
| Model configs | ✅ | `trustcal/configs/models.yaml:16-73` |
| Dataset configs | ✅ | `trustcal/configs/datasets.yaml:10-54` |
| Dataset loader | ✅ GPQA only | `trustcal/src/trustcal/eval/datasets.py:22-28` (others 🔴) |
| Tests (103 functions, colocated) | ✅ | `trustcal/src/trustcal/**/test_*.py` (trust order `trust/test_boundedness.py:12-30`) |

## 5. Show-Me-in-Code Questions

1. **Show the trust update math.** → `trustcal/src/trustcal/trust/update.py:16-43`: raw step `:26`, α `:20`, β `:21`, floor/ceiling `:22-23`, softmax→clamp→renormalize `:27-29,42-43`.
2. **Show where the weighted final vote happens.** → `trustcal/src/trustcal/trust/aggregation.py:8-15` (`argmax` of trust-weighted positions).
3. **Show the injection.** → build `trustcal/src/trustcal/orchestrator/injection.py:41-71`; applied between rounds 1 and 2 in `orchestrator/debate.py:47-56`.
4. **Show how claims are tagged and parsed.** → tagging `agents/prompts.py:9,23-24`; parsing `agents/parser.py:38-71`; fallback cap `:63`.
5. **Show the debate rounds loop.** → `orchestrator/debate.py:34-84`; per-round revision `:58-75`.
6. **Show the collapse metrics.** → `eval/metrics.py:35-46` (CCR, MPR); ECR stub `:49-54`.
7. **Show the annotation agreement.** → `eval/agreement.py:12-29`; CLI gate `scripts/annotate.py:33-36`.
8. **Show the experiment runner.** → `scripts/run_experiment.py:19-26` (flags), `src/trustcal/runner.py:155-194` (loop), summary writer `:119-144`.
9. **Show the configs.** → `configs/models.yaml:16-73`; `configs/datasets.yaml:10-54` (seeds `:49`, rounds `:50`, caps `:52-54`).
10. **Show the tests.** → colocated `test_*.py` files, 103 test functions; boundedness order test `trust/test_boundedness.py:12-30`.
11. **Show what is not implemented yet.** → retrieval `retrieval/sources.py:6-18`; verdicts `retrieval/verdicts.py:11-16`; ECR `eval/metrics.py:49-54`; deferred baselines `eval/baselines.py:28-37`; non-GPQA loaders `eval/datasets.py:22`.
12. **Show that the trust step is not yet in the debate loop.** → `orchestrator/debate.py:31` (raises when a trust updater is passed); runner builds the loop without it `runner.py:172-176`.

## 6. Implemented vs Planned

| Item | Status | Proof |
| --- | --- | --- |
| Three-model debate loop (3 rounds, seeds) | ✅ runs (Gate 0) | `experiments/gate0/README.md:29-35` |
| Injection protocol (t1→2, one injection) | ✅ implemented | `orchestrator/injection.py:41-71`, `debate.py:47-56` |
| Claim tagging + parser + fallback | ✅ tested | `agents/parser.py:38-71`; 15 parser tests |
| Trust update math + aggregation | 🟡 built, tested, not wired | `trust/update.py:16-43`, `trust/aggregation.py:8-15`, `debate.py:31` |
| Confidence gate | 🟡 prompt defined, not invoked | `agents/prompts.py:11-17` |
| CCR / MPR | ✅ implemented | `eval/metrics.py:35-46` |
| ECR | 🔴 Phase 3 | `eval/metrics.py:49-54` |
| Retrieval sources + rerank + verdicts | 🔴 Phase 2 stubs | `retrieval/sources.py`, `retrieval/verdicts.py` |
| Baselines B2, B4–B10 | 🔴 deferred | `eval/baselines.py:28-37` |
| Bootstrap CIs / Cohen's d | 🔴 planned | `docs/blueprint.md` §9:419 |
| Datasets other than GPQA | 🔴 loader stub | `eval/datasets.py:22` |
| Human study | 🔴 Phase 4 | `roadmap.md:130` |

## 7. Datasets & Sources

| Dataset | Hugging Face | Revision | License | Paper / source | Role |
| --- | --- | --- | --- | --- | --- |
| GPQA | `Idavidrein/gpqa` | pinned `633f5ee89ab8ad4522a9f850766b73f62147ffdd` | CC BY 4.0 (gated) | Rein et al., COLM 2024 (`rein2024gpqa`) | Stable comparison (Diamond 198) |
| MMLU-Pro | `TIGER-Lab/MMLU-Pro` | `main` | MIT | Wang et al., NeurIPS 2024 D&B (`wang2024mmlupro`) | Stable comparison (12k+, 14 subjects) |
| HLE | `cais/hle` | `main` | MIT (gated) | Phan et al., Nature 649, 2026 (`phan2026hle`) | Expert ceiling (>2,500) |
| BrokenMath | `INSAIT-Institute/BrokenMath` | `main` | CC BY-NC-SA 4.0 | Petrov et al., arXiv:2510.04721 (`petrov2025brokenmath`) | Primary adversarial (504 samples) |
| BrokenArXiv | `MathArena/brokenarxiv` | `main`, snapshot `0226-0526` | CC BY-SA 4.0 | No dedicated paper; MathArena platform, arXiv:2605.00674 (`dekoninck2026matharena`) | Adversarial, monthly refreshed |

Config: `trustcal/configs/datasets.yaml:10-54`; blueprint table `docs/blueprint.md:360-366`; journal `Papev_Summer26_6/cas-sc-template.tex:260-270`.

Filters: divergent (≥2 distinct round-0 answers, ≈60–70% pass) then answer type (MCQ/numeric only) — `trustcal/INJECTION_PROTOCOL.md`.

## 8. Experiments & Evidence

**Gate 0 — vanilla MAD reproduction, PASS (2026-09-16).**

- Dataset: GPQA Diamond, 10 questions, 3 rounds, 3 agents.
- 10/10 debates completed; 90/90 non-empty positions; 3,708.1 s total; 370.8 s mean per debate; 21.5 s stdev (5.8%).
- Claim tags: Ministral missing tags in 5/30 generations; fallback parser used, no empty outputs.
- Cost: ≈ USD 4.29 for the run.
- Trust trajectory: not recorded in this run (trust not wired).
- Artifacts: `experiments/gate0/README.md`; `experiments/gate0/artifacts/summary-20260916T193249Z.md`; raw transcript in `experiments/gate0/artifacts/`.

Pending: retrieval + trust wiring, 50-question κ pilot, injection arms on GPU, full matrix (1,000/set), ablations, human study — see `roadmap.md:42-46,118-130`.

## 9. Where Is It in the Report?

| Topic | FYDP_Summer | Journal (Papev) | Blueprint |
| --- | --- | --- | --- |
| Architecture / context / DFD | `3.design.tex:5-48` | — | §5:214 |
| Phases + gates (first plan) | `3.design.tex:80-134` | — | §12:460, §13:486 |
| Task allocation / roles | `3.design.tex:170-202` | CRediT `:70-116` | — |
| Trust update formula | — | `:209-224` | §4:163 (formula `:180`) |
| Injection protocol | — | `:316-321` | §4 (injection point at `:182`) |
| Datasets | — | `:260-270` | §8:358 |
| Metrics (CCR/MPR/ECR) | — | `:289-315` | §9:407-413 |
| Baselines B1–B10 | — | `:280-288` | §9:415 |
| Results (tables) | `4.implementation.tex` (stub) | `:345-363`, ablations `:369-384`, stats `:386-394` | — |
| CE mapping (P/K/A/PO) | `5.sic.tex:164-339` | — | — |
| Cost | `5.sic.tex:76` | — | `:340` |
| Conclusion / future work | `6.conclusion.tex:4-9` | `:400-405` | — |

## 10. Team Contributions

**Module ownership** (from `FYDP_Summer/3.design.tex:183-198`):

| Member | Primary modules |
| --- | --- |
| Md. Atikur Rahaman | Full module: architecture design · trust mechanism · first experiment plan and full experiment execution (Gate 0) · coordination |
| Rakibul Hasan | Vanilla MAD reproduction, injection protocol |
| Md. Salman Rohoman Nayeem | Claim decomposition, source-partitioned retrieval |
| Pratay Paul | Evaluation harness, CCR/MPR/ECR metrics |
| Yousuf Kamal Himel | Baselines B1–B9, vLLM serving |
| Mst. Farjana Akter Limu | Evidence APIs, dashboard, result packages |

## 11. Emergency Answers

- **If you don't know:** "I will come back to that." Pass it to the slide owner listed in Section 2.
- **If asked "is it real or planned?":** use Section 6 verbatim. Trust math ✅ tested; retrieval/verdicts/ECR 🔴 planned; gate and trust wiring 🟡.
- **If asked "show me the code":** use Section 5 — open the exact file:line.
- **If asked "why not GPT-4 for everything?":** the mechanism must stay model-agnostic and reproducible; the commercial model is only B7, the ceiling reference.
- **If asked "what did you personally do?":** answer from Section 10.
- **If asked "what is the one thing you are most confident about?":** the debate loop runs end to end and the trust math is bounded, tested, and simple — the remaining work is plugging evidence into it.
