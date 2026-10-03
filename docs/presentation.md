# Final Defence Slides — Presentation Script

## Compact Deck — `/slide/final/1` (14 slides) · Final Deck

> The final defence uses this deck. **Total: ~930 words — about 7.5–8 minutes at 120 wpm.**
> Same order: **Rakibul → Yousuf → Atik → Pratay → Salman → Limu**. The first and last presenters cover **3 slides**; the other four cover **2 slides** each.
> Short, connected sentences — every slide picks up from the one before. Point at the slide for codes like "P1", "K4", "B10", "CCR".
> The compact deck cuts Pipeline, System Context, CE Definitions and Limitations; the Application content is merged into the compact Conclusion. Per-slide judges' questions are in the next section.

| Presenter | Slides | Words | Content |
| --- | --- | --- | --- |
| M1 — Rakibul Hasan | 1–3 | 180 | Title · Introduction · Motivation |
| M2 — Yousuf Kamal Himel | 4–5 | 137 | Objective · Dataset |
| M3 — Md. Atikur Rahaman | 6–7 | 168 | Conventional Method · Proposed Method |
| M4 — Pratay Paul | 8–9 | 151 | Flow Diagram · Experimental Setup |
| M5 — Md. Salman Rohoman Nayeem | 10–11 | 123 | Project Results · Why Complex Engineering |
| M6 — Mst. Farjana Akter Limu | 12–14 | 170 | Complex Engineering Matrix · Conclusion · Thank You |

### Slide 1 — Title

Good morning, everyone. We are Team Phantom Devs. Our project is trust-calibrated multi-agent debate for science questions. Our supervisor is Dr. Mohammad Nurul Huda. Today we present our FYDP I defence.

### Slide 2 — Introduction

LLMs can answer hard science questions, but they can also be confidently wrong. Multi-agent debate helps: three models answer, then compare. Most systems still decide by majority vote, where every agent counts the same. So a confident wrong majority can push a correct agent to give up its answer — a failure we call sycophantic consensus. No debate system checks claims against real evidence while the debate runs. Our project fixes that.

### Slide 3 — Motivation

The evidence behind this problem comes from four studies. In over twenty percent of wrong answers, the correct answer was on the table but ignored. Across seven multi-agent systems, failure rates ran from forty-one to eighty-seven percent. A truth-aware oracle beats self-reported confidence by up to ten percent. About one in four disagreements hides a correct minority. The problem is real, and confidence is not a safe signal. Yousuf will now present our goals and the data.

### Slide 4 — Objective

So we set four goals. First, design a bounded trust score from retrieved evidence. Second, build a repeatable stress test that measures collapse, with annotation agreement of at least zero point seven five. Third, compare against ten baselines — including MoA, iMAD and ConsensAgent — on four metrics: accuracy, collapse, minority survival and calibration. And fourth, prove that the trust score changes decisions, not just the prompt.

### Slide 5 — Dataset

To test those goals, we use five sets. GPQA and MMLU-Pro are the stable sets for accuracy, and HLE is the expert ceiling. BrokenMath and BrokenArXiv are the hard sets that stress-test sycophancy. Two filters keep only checkable questions where agents disagree, and about sixty to seventy percent pass. The full matrix uses one thousand questions per set; the pilot, fifty. Atik will now present the methods and our approach.

### Slide 6 — Conventional Method

With the data ready, how do systems decide today? Some use majority voting, where every agent weighs the same. Others trust self-reported confidence scores. Some rewrite prompts to stop sycophancy before it starts. Others merge the outputs once, and iMAD predicts when a debate is even needed. We test ten approaches, B1 to B10 — and none ties an agent's influence to outside evidence during the debate.

### Slide 7 — Proposed Method

Our method closes that gap, in clear steps. A confidence gate sends easy questions straight to an answer; hard questions start a debate. Three models debate: Qwen, Gemma and Mistral, with no fine-tuning. Each answer is split into small claims, checked against PubMed, arXiv and Semantic Scholar. Every claim is labeled: supported, contradicted, unverifiable or contested. Trust then updates each round: up with support, down with contradiction. Then softmax, clamp between zero point one and zero point nine, and renormalize. The final answer is a weighted vote, not a head count. Pratay will now present the flow diagram and the setup.

### Slide 8 — Flow Diagram

This diagram shows the level-one data flow. Seven processes, four external entities and three data stores. Questions enter at the gate, and claims and passages flow through verification. The trust update feeds the final vote, and the result package carries the answer, the citations and the trust path.

### Slide 9 — Experimental Setup

To run this, we use two model stacks. The dev stack runs Qwen3.5-9B, Gemma 4 12B and Ministral-3-14B in four-bit, on one RTX A6000. The final stack runs Qwen3.6-27B, Gemma 4 26B and Mistral Small 24B in FP8, on one RTX PRO 6000. Both run on vLLM. Each debate runs three rounds with three seeds. The stress test injects a fake expert consensus between rounds one and two; in baselines B1 to B4 it stays off. We validate with annotation agreement and bootstrap confidence intervals. Total compute is about three hundred GPU-hours. Salman will now present the results and the complex engineering check.

### Slide 10 — Project Results

So what do we expect? Collapse should drop by twenty to thirty percent, and the correct minority should survive more often. Calibration should pass zero point eight, accuracy should hold, and the biggest gains should come on the hard sets. The pipeline already works: ten GPQA questions, three rounds each, all ten debates finished, all ninety positions filled. About six minutes per debate.

### Slide 11 — Why Complex Engineering

Beyond the experiments, this is also a complex engineering problem. The Washington Accord judges such problems through four lenses: problem solving, knowledge, activities and outcomes. Our project qualifies: it is multi-disciplinary, it has conflicting requirements, no textbook solution exists, and its parts depend on each other. One retrieval error can change the final answer. Limu will now close the presentation.

### Slide 12 — Complex Engineering Matrix

Here is the full map. The needs row shows what each attribute requires; the FYDP I row shows our coverage. PO1 and PO2 need K1 to K4, and P1 needs K3 to K6 and K8. The P attributes link to PO1 to PO8, and the activities link to PO10. We cover six of seven P attributes, all eight K areas, four of five A activities, and six of twelve program outcomes. P6, A3 and the rest move to later phases.

### Slide 13 — Conclusion · Application

Let me bring it together. Our project targets a real failure: a wrong majority pushing a correct agent into sycophantic consensus. Our fix is a bounded trust score from retrieved evidence, updated during the debate, measured with the stress test and the CCR, MPR and ECR metrics. The same design fits scientific QA and research assistants, and extends to law or medicine wherever evidence exists. Next: the full matrix, ablations, a human study, and an open-source release.

### Slide 14 — Thank You

Thank you for your attention. We are happy to take your questions.

---

## Judges' Questions — by Presenter & Slide (Compact Deck)

> Answers are written the way you should say them — one to three short sentences. Point at the slide when a code appears.
> Every projected number is a projection; the only measured evidence so far is the Gate 0 pilot.
> If you do not know, say "I will come back to that," and pass it to the member who owns it.

### M1 — Rakibul Hasan · Slides 1–3

**Slide 1 — Title**

- **Q: What is the project in one sentence?**
  **A:** We make multi-agent debate decide by evidence, not by a head count, so a confident wrong majority cannot push a correct agent to agree with it.
- **Q: Who did what in the team?**
  **A:** Atikur leads architecture and the trust mechanism. Rakibul works on the debate loop and the injection protocol. Salman handles claim decomposition and retrieval. Pratay runs evaluation and the metrics. Yousuf builds the baselines and serving. Limu handles the evidence APIs and the dashboard.
- **Q: Who is the supervisor?**
  **A:** Dr. Mohammad Nurul Huda, Professor at UIU. We also thank our FYDP instructor, Dr. Ohidujjaman.
- **Q: What is the project timeline?**
  **A:** FYDP I covers the design and the first working phase. The full experiment matrix, the ablations and the human study come in FYDP II and FYDP III.

**Slide 2 — Introduction**

- **Q: What is sycophantic consensus?**
  **A:** It is when agents give up a correct answer just because the majority disagrees, so the whole group agrees on the wrong answer with full confidence.
- **Q: Why is majority voting weak?**
  **A:** Every agent counts the same, so a confident wrong majority can outvote a correct minority. The evidence never enters the decision.
- **Q: Why three agents?**
  **A:** Three is the smallest group where a majority can form, and three different model families make their errors less correlated.
- **Q: What does the figure show?**
  **A:** One claim from an agent answer is checked against a retrieved passage. The verdict then moves that agent's trust score.
- **Q: Does debate not already improve accuracy?**
  **A:** Yes, it usually does. The failure is in the final aggregation, not in debate itself. That is the part we replace.
- **Q: Why not fine-tune the models to be less sycophantic?**
  **A:** Fine-tuning would hide the effect and tie us to one model. Our mechanism must work on models as they are served.

**Slide 3 — Motivation**

- **Q: Where does the "over twenty percent" number come from?**
  **A:** ConsensAgent, ACL 2025 Findings. In over twenty percent of wrong-answer cases, the correct answer was already present but ignored.
- **Q: What is the "forty-one to eighty-seven percent" figure?**
  **A:** MAST, NeurIPS 2025, measured failure rates across seven multi-agent frameworks. The exact ceiling is eighty-six point seven percent.
- **Q: What is a truth-aware oracle?**
  **A:** DebUnc, EMNLP 2025 Findings, tested an oracle that knows the gold answer. It beat deployable confidence signals by up to ten percent — but it needs the answer key, so it is only an upper bound.
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
- **Q: Why kappa of at least zero point seven five?**
  **A:** Kappa measures how much two human annotators agree beyond chance. Zero point seven five is our quality gate; below it we fix the rubric and re-label.
- **Q: Who annotates, and on what?**
  **A:** Two human annotators label the same shuffled forty-item set: thirty divergent questions plus ten controls.
- **Q: Why ten baselines?**
  **A:** B1 to B4 isolate debate and retrieval, and B5 to B10 cover the published competitors. That shows exactly what our trust layer adds.
- **Q: What are the four metrics?**
  **A:** Accuracy, CCR for collapse, MPR for minority survival, and ECR for evidence calibration.
- **Q: What does "changes decisions, not just the prompt" mean?**
  **A:** We must show the trust score changes the final answer. If it only changes the wording, the mechanism adds nothing.
- **Q: What happens if the pilot gives a negative result?**
  **A:** We report it as a finding. The Go/No-Go criterion was frozen before the pilot ran, so we cannot move it afterwards.

**Slide 5 — Dataset**

- **Q: Why these five sets?**
  **A:** GPQA and MMLU-Pro give stable accuracy numbers. HLE is the expert ceiling. BrokenMath and BrokenArXiv are adversarial sets built to provoke sycophancy.
- **Q: What is BrokenMath?**
  **A:** Math problems with perturbed false premises. The question looks normal, but the setup is wrong.
- **Q: What is BrokenArXiv?**
  **A:** Statements taken from deliberately flawed papers, refreshed monthly. Every result cites the snapshot it used.
- **Q: What do the two filters do?**
  **A:** The first keeps only divergent questions where the agents disagree. The second keeps only MCQ or numeric answers, so correctness can be checked. About sixty to seventy percent pass.
- **Q: Why one thousand questions per set?**
  **A:** One thousand gives stable paired statistics in the main matrix. The pilot runs fifty for speed.
- **Q: Do the agents ever see the gold answer?**
  **A:** Never. Gold answers are used only to select questions and to score results.
- **Q: Why are some datasets gated?**
  **A:** GPQA and HLE need a click-through access agreement. HLE was approved, and BrokenArXiv rotates monthly, so we pin revisions.

### M3 — Md. Atikur Rahaman · Slides 6–7

**Slide 6 — Conventional Method**

- **Q: What is the Oracle model in the baselines?**
  **A:** B7 sends each question to a large commercial model, Gemini 3.1 Pro, as a ceiling reference. One call per question, about five to seven dollars in total. It is not part of our mechanism and never sees the gold answer.
- **Q: Why is B8 inside the B1 to B10 list if it is yours?**
  **A:** B8 is the proposed trust-calibrated system, placed in the same comparison set. B1 to B9 are the baselines; B8 is ours.
- **Q: What is static aggregation?**
  **A:** MoA merges the model outputs once, in layers. After the merge there is no per-agent trust and no way to revisit it.
- **Q: What does iMAD do?**
  **A:** It predicts when a debate is worth starting, using hesitation cues from a self-critique. It cuts token costs by up to ninety-two percent, but once triggered it still uses majority voting.
- **Q: What does ConsensAgent do?**
  **A:** It detects stalling or copy-paste behaviour and rewrites the prompt. The final choice still comes from self-reported confidence.
- **Q: Are all ten baselines running today?**
  **A:** Not yet. B1 and B3 are implemented; B9 and B10, the reimplementations, are Phase 3 work.
- **Q: What is the gap in one line?**
  **A:** No existing method ties an agent's influence to external evidence while the debate is running.

**Slide 7 — Proposed Method**

- **Q: How does the confidence gate work?**
  **A:** It is a prompt-based YES or NO decision, not a numeric threshold. Confident questions get a direct answer; hard or disputed ones start a debate.
- **Q: Why Qwen, Gemma and Mistral?**
  **A:** Three different model families reduce correlated errors. They do not share the same training pipeline or the same blind spots.
- **Q: Why no fine-tuning?**
  **A:** The mechanism must work on served models. Fine-tuning would hide whether the trust signal itself changes behaviour.
- **Q: What is an atomic claim?**
  **A:** One small, verifiable statement, split by effect, magnitude or subgroup so it can be checked on its own.
- **Q: How are claims extracted?**
  **A:** Agents tag their own claims in XML. A parser reads the tags, and if tags are missing, a sentence-split fallback keeps up to twenty claims.
- **Q: Which sources are checked, and how are they split?**
  **A:** PubMed, arXiv and Semantic Scholar, with OpenAlex as a fallback. Retrieval is source-partitioned: each agent's claims go to a different source.
- **Q: What do the four verdicts mean?**
  **A:** Supported means a passage backs the claim. Contradicted means a passage opposes it. Unverifiable means no passage settles it. Contested means the sources disagree.
- **Q: What happens to unverifiable claims?**
  **A:** They are excluded from the trust update. We neither reward nor punish a claim the literature cannot check.
- **Q: How does the trust update work?**
  **A:** S at t plus one equals S at t, plus alpha times V, minus beta times H. V is the number of supported claims and H is the number of contradicted claims. The defaults are alpha zero point five and beta zero point three, tuned later in Phase 3.
- **Q: What is S in that equation?**
  **A:** S is the agent's trust score — the weight its answer carries in the final vote. The score is updated after every round.
- **Q: What is t?**
  **A:** t is the debate round. S at t is the score going into the round, and S at t plus one is the updated score after the round.
- **Q: What are V and H?**
  **A:** V counts the agent's claims that the retrieved evidence supports in that round. H counts the claims the evidence contradicts.
- **Q: What are alpha and beta?**
  **A:** Alpha is the reward for each supported claim — zero point five by default. Beta is the penalty for each contradicted claim — zero point three by default. Both are tuned in the Phase 3 grid search.
- **Q: Do unverifiable and contested claims enter V or H?**
  **A:** No. Unverifiable claims are excluded from the update, and contested claims are reported separately.
- **Q: What if an agent makes no checkable claims in a round?**
  **A:** Then V and H are both zero, so its raw score stays the same for that round.
- **Q: Why softmax, then clamp, then renormalize?**
  **A:** Softmax turns scores into weights, the clamp keeps every agent inside zero point one to zero point nine, and renormalizing makes the weights sum to one. That order is fixed and unit-tested.
- **Q: What if the retrieved evidence is wrong?**
  **A:** Wrong passages can mislead the score. That is a stated limitation. Cross-source disagreement is flagged as contested, and unverifiable claims never move trust.

### M4 — Pratay Paul · Slides 8–9

**Slide 8 — Flow Diagram**

- **Q: What are the seven processes?**
  **A:** Intake and Gate, Debate Orchestration, Claim Decomposition, Retrieval and Verification, Trust Update, Weighted Aggregation, and Result Packaging.
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

**Slide 9 — Experimental Setup**

- **Q: Why two model stacks?**
  **A:** The dev stack runs on one RTX A6000 for fast iteration. The final stack runs bigger models in FP8 on an RTX PRO 6000. The code path is identical — only the config changes.
- **Q: Why four-bit for dev and FP8 for the final stack?**
  **A:** The A6000 is Ampere and cannot run official FP8 kernels, so dev uses four-bit AWQ or QAT. Blackwell supports FP8, so the final run uses it.
- **Q: Why three rounds and three seeds?**
  **A:** Three rounds give the trust score time to update. Three seeds let us report variance and confidence intervals instead of a single lucky run.
- **Q: What exactly is injected?**
  **A:** One fabricated wrong expert consensus, appended to the targeted agent's system prompt between rounds one and two. The user question does not change.
- **Q: Why is injection off in B1 to B4?**
  **A:** Those baselines give the no-pressure reference. Injection is switched on only for the collapse experiments.
- **Q: How do you test significance?**
  **A:** Paired bootstrap over questions with ten thousand resamples, ninety-five percent confidence intervals, and Cohen's d for effect size.
- **Q: What are the generation settings?**
  **A:** Temperature zero point seven, one thousand and twenty-four output tokens, four thousand and ninety-six context on dev, and three retries per agent.
- **Q: How much compute does this need?**
  **A:** About three hundred GPU-hours, budgeted around three hundred forty to eight hundred twenty US dollars depending on GPU rates.

### M5 — Md. Salman Rohoman Nayeem · Slides 10–11

**Slide 10 — Project Results**

- **Q: Are these numbers measured?**
  **A:** No. The bars are projections for the slide layout. The measured evidence is the Gate 0 pilot.
- **Q: What did the pilot show?**
  **A:** Ten GPQA questions, three rounds each: ten out of ten debates completed, ninety out of ninety positions non-empty, and three hundred seventy point eight seconds per debate on average.
- **Q: Why do you expect collapse to drop by twenty to thirty percent?**
  **A:** Because unsupported claims lose weight, the fabricated majority loses influence and the correct minority keeps its answer. The exact number is what the matrix will measure.
- **Q: What is ECR, and why above zero point eight?**
  **A:** ECR is evidence calibration, defined as one minus expected calibration error. Our design target is above zero point eight on the expert set.
- **Q: What failed in the pilot?**
  **A:** One model missed its claim tags in five of thirty generations. The fallback parser handled them, so no position was empty.
- **Q: Why six minutes per debate?**
  **A:** Three models, three rounds, retrieval and four-bit inference on one GPU. That is the current cost; batching and caching will reduce it.
- **Q: When will the full matrix run?**
  **A:** After retrieval and trust pass their gates. The full matrix, the ablations and the human study are the remaining work.

**Slide 11 — Why Complex Engineering**

- **Q: What is the Washington Accord?**
  **A:** It is the international agreement that defines what an accredited engineering programme must produce. It is the standard behind our mapping.
- **Q: What are the four lenses?**
  **A:** Complex problem solving, the knowledge profile, complex engineering activities, and programme outcomes.
- **Q: Give one example of interdependence.**
  **A:** One retrieval error changes a verdict, the verdict changes a trust score, and the score can flip the final answer.
- **Q: What makes it multi-disciplinary?**
  **A:** It combines machine learning, natural language processing, retrieval systems and distributed model serving.
- **Q: Why is there no textbook solution?**
  **A:** No standard method exists for sycophantic consensus in LLM debate. We built the mechanism and its evaluation from the literature.

### M6 — Mst. Farjana Akter Limu · Slides 12–14

**Slide 12 — Complex Engineering Matrix**

- **Q: Why is P6 not covered?**
  **A:** P6 is stakeholder involvement. In FYDP I engagement stays inside the university; external stakeholders move to the next phases.
- **Q: Why is A3 not covered?**
  **A:** A3 is innovation. We combine existing concepts — debate, retrieval and trust weighting — so the step is incremental and not patentable.
- **Q: Why is A4 covered?**
  **A:** We assessed the social and environmental consequences. The harm we target is real, and energy use stays low at about three hundred GPU-hours.
- **Q: What are the coverage numbers?**
  **A:** Six of seven P attributes, all eight K areas, four of five A activities, and six of twelve programme outcomes.
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
- **Q: Are you correcting for multiple comparisons?**
  **A:** The primary comparison is our system versus vanilla debate. Secondary comparisons are reported with intervals and effect sizes, and labelled exploratory.
- **Q: What if the trust signal does not change decisions?**
  **A:** The behavioural Go/No-Go criterion was frozen before the pilot. A negative result is reported as a finding, not hidden.
- **Q: What is the biggest risk?**
  **A:** Retrieval coverage. Unverifiable claims are excluded, so in sparse fields the trust signal weakens. We state this as an evidence limit.
- **Q: Is the study reproducible?**
  **A:** Every run records seeds, revisions, configs and raw generations. The harness and the protocol ship with the mechanism.
- **Q: What about ethics and bias?**
  **A:** Answers carry citations a reader can check. The adversarial sets test manipulation, and the human study will follow consent rules.
- **Q: How much does the full study cost?**
  **A:** About three hundred GPU-hours. The deck estimate is three hundred forty to eight hundred twenty US dollars depending on GPU rates.
- **Q: What is the most important measured result so far?**
  **A:** Gate 0: the three-model debate loop runs end to end — ten of ten debates, ninety of ninety positions, about three hundred seventy seconds per debate.

