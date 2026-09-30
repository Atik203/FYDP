# Final Defence Slides — Presentation Script

> Deck: `/slide/final` — **18 slides**, six presenters, target **8–10 minutes**.
> Speaking order: **Rakibul → Yousuf → Atik → Pratay → Salman → Limu** (three slides each, about 1.5 minutes each).
> Speak slowly, about 120 words per minute. Short sentences. One idea per sentence.
> Point at the slide when you say a code like "P1", "K4" or "B10".

---

## M1 — Rakibul Hasan · Slides 1–3

### Slide 1 — Title

Good morning everyone. We are Team Phantom Devs. Our project is "Trust-Calibrated Multi-Agent Scientific Deliberation for Mitigating Sycophantic Consensus in LLM Reasoning". Our supervisor is Dr. Mohammad Nurul Huda. Today we present our FYDP I defence.

### Slide 2 — Introduction

Large language models can answer hard science questions, but they can also be confidently wrong. Multi-agent debate helps: three models answer the same question and compare their reasoning. But most systems decide by majority vote, and every agent counts the same. A confident wrong majority can push a correct minority to give up its answer. We call this sycophantic consensus. No current debate system checks the claims against outside evidence while the debate runs. Our project fixes this.

### Slide 3 — Motivation

Four findings motivate the project. ConsensAgent found that in over twenty percent of wrong-answer cases, the correct answer was already present but ignored. MAST measured failure rates from forty-one to eighty-six point seven percent across seven multi-agent systems. DebUnc showed that a truth-aware oracle beats deployable confidence signals by up to ten percent. And about one in four disagreements hides a correct minority. The problem is real, and confidence is not a reliable signal.

Yousuf will present our objectives and the data.

---

## M2 — Yousuf Kamal Himel · Slides 4–6

### Slide 4 — Objective

We set four objectives. First, design a bounded trust update from retrieved evidence. Second, build a reproducible injection protocol that measures collapse under pressure, with annotation agreement of at least zero point seven five. Third, compare against ten baselines, including MoA, iMAD and ConsensAgent, using four metrics: accuracy, collapse rate, minority survival and calibration. Fourth, prove early that the trust signal changes decisions, not just the context.

### Slide 5 — Dataset

We use five scientific question sets. GPQA and MMLU-Pro are stable sets for accuracy. HLE is the expert ceiling. BrokenMath and BrokenArXiv are adversarial sets that stress-test sycophancy. Two filters keep only divergent questions with checkable answers, and about sixty to seventy percent pass. The main matrix uses one thousand questions per dataset; the pilot uses fifty.

### Slide 6 — Conventional Method

Today, debate decides in different ways. Majority voting gives every agent equal weight. Confidence weighting uses self-reported scores. Prompt rewriting tries to reduce sycophancy before the debate. Static aggregation merges the outputs once. And iMAD predicts when a debate is needed. We test ten baselines, B1 to B10. The gap is clear: none of them ties an agent's influence to external evidence while the debate runs.

Atik will explain our method.

---

## M3 — Md. Atikur Rahaman · Slides 7–9

### Slide 7 — Proposed Method

Our method works in steps. A confidence gate sends easy questions to a direct answer, and hard questions to a debate. Three different agents answer: Qwen, Gemma and Mistral, with no fine-tuning. Each answer is split into atomic claims, and every claim is checked against PubMed, arXiv or Semantic Scholar. Each claim gets one verdict: supported, contradicted, unverifiable or contested. The trust score updates every round. It rises with support, falls with contradiction, then softmax, clamp to zero point one to zero point nine, and renormalize. The final answer is a trust-weighted vote, not a head count.

### Slide 8 — Pipeline

This is the full pipeline. Eight stages, from the question to the final package. The dashed box is the injection point, and we use it only in the stress tests. The bottom strip shows the datasets and the four metrics.

### Slide 9 — Flow Diagram

This is the level-one data flow. Seven processes, four external entities, and three data stores. Questions enter at the gate. Claims and passages flow through verification. The trust update feeds the aggregation. The result package carries the answer, the citations and the trust trajectory.

Pratay will present the experimental setup and results.

---

## M4 — Pratay Paul · Slides 10–12

### Slide 10 — Experimental Setup

The setup has two model stacks. The development stack is Qwen3.5-9B, Gemma 4 12B and Ministral-3-14B in four-bit, on one RTX A6000. The final stack is Qwen3.6-27B, Gemma 4 26B and Mistral Small 24B in FP8, on one RTX PRO 6000. Serving uses vLLM with an OpenAI-compatible API. Debates run three rounds with three seeds. The stress test injects a fake expert consensus between rounds one and two, and it is off in baselines B1 to B4. Validation uses annotation agreement and bootstrap confidence intervals. Total compute is about three hundred GPU-hours.

### Slide 11 — Project Results

These are the expected results. Collapse rate should drop by twenty to thirty percent. A correct minority should survive more often. Calibration should be above zero point eight. Accuracy should not regress, and the largest gains should appear on the adversarial sets. The completed experiments already show the pipeline works: ten GPQA questions, three rounds each, ten out of ten debates completed, ninety out of ninety non-empty positions, mean three hundred seventy point eight seconds per debate.

### Slide 12 — System Context and Application

This is the system boundary. The harness sends questions in. The evidence sources and the model servers work alongside. The user receives the answer with citations. The same design helps in scientific question answering, in research assistants and in education. It also extends to law or medicine.

Salman will present the complex engineering check.

---

## M5 — Md. Salman Rohoman Nayeem · Slides 13–15

### Slide 13 — Why Complex Engineering

The Washington Accord uses four lenses: problem solving, knowledge, activities and program outcomes. Our project is a complex engineering problem. It is multi-disciplinary, it has conflicting requirements, there is no textbook solution, and its parts depend on each other. For example, one retrieval error can change the final answer.

### Slide 14 — Washington Accord Attributes

This slide lists the official attributes in each lens. P1 to P7 are the problem attributes. K1 to K8 are the knowledge areas. A1 to A5 are the engineering activities. PO1 to PO12 are the program outcomes. These names are our checklist for the matrix.

### Slide 15 — Complex Engineering Matrix

This is the full mapping. The needs row shows what each attribute requires. PO1 and PO2 need K1 to K4. P1 needs K3 to K6 and K8. The P attributes relate to PO1 to PO8, and the activities relate to PO10. The FYDP I row shows covered and not covered. The summary: P six of seven, K eight of eight, A four of five, PO six of twelve. P6, A3 and the remaining outcomes carry into the later phases.

Limu will close the presentation.

---

## M6 — Mst. Farjana Akter Limu · Slides 16–18

### Slide 16 — Limitations

Every method has boundaries, and we state ours honestly. The evidence limit: claims that no source can verify are excluded from the trust update, so the mechanism is only as strong as the passages the sources return. The model limit: different model families reduce correlated errors, but they do not remove them. The study limit: the pilot covers ten questions, and the injection is an explicit upper-bound stress test. The scope stops at scientific QA, where a corpus and a gold answer exist.

### Slide 17 — Conclusion

To conclude. The project addresses a real failure: a confident wrong majority pushing a correct minority into sycophantic consensus. Our mechanism is a bounded trust score from retrieved evidence, updated during the debate. The evaluation uses the injection protocol and the CCR, MPR and ECR metrics against the baselines. Completed runs show the pipeline works end to end on three models. The design applies to scientific QA, education and other evidence domains. Remaining work: the full experiment matrix, ablations, the human study and an open-source release.

### Slide 18 — Thank You

Thank you for your attention. We are happy to take your questions.

---

## Faculty Q&A — quick answers

Any presenter can use these.

- **For P1, which K areas are needed?** K3, K4, K5, K6 and K8. This is the exact Washington Accord wording.
- **For the activities, which PO is needed?** PO10 — communication. Its official wording is about complex engineering activities.
- **Which POs do the P attributes relate to?** PO1 to PO8.
- **Which POs need K7?** PO6, PO7 and PO8 — society, environment and ethics.
- **Why is P6 not covered?** We have no external stakeholders. Engagement stays inside the university in FYDP I.
- **Why is A3 not covered?** We combine existing concepts, so the innovation is incremental and not patentable.
- **Why is A4 covered?** We assessed the social and environmental consequences; the target harm is real and the energy use stays low.
- **What are CCR, MPR and ECR?** Collapse rate, minority preservation, and evidence calibration.
- **Why no fine-tuning?** The mechanism must work with served models; fine-tuning would hide the effect.

---

## Compact Deck — `/slide/final/1` (14 slides)

> Same order and pace: **Rakibul → Yousuf → Atik → Pratay → Salman → Limu**. The first and last presenters cover **3 slides**; the other four cover **2 slides** each. Target **8–10 minutes** (about 1.5 minutes per person).
> Cut from the full deck: Pipeline, System Context, CE Definitions, Limitations. The Application content from the System Context slide is merged into the compact Conclusion. The Faculty Q&A answers above apply unchanged.

| Presenter | Slides | Content |
| --- | --- | --- |
| M1 — Rakibul Hasan | 1–3 | Title · Introduction · Motivation |
| M2 — Yousuf Kamal Himel | 4–5 | Objective · Dataset |
| M3 — Md. Atikur Rahaman | 6–7 | Conventional Method · Proposed Method |
| M4 — Pratay Paul | 8–9 | Flow Diagram · Experimental Setup |
| M5 — Md. Salman Rohoman Nayeem | 10–11 | Project Results · Why Complex Engineering |
| M6 — Mst. Farjana Akter Limu | 12–14 | Complex Engineering Matrix · Conclusion · Thank You |

### Slide 1 — Title

Good morning everyone. We are Team Phantom Devs. Our project is "Trust-Calibrated Multi-Agent Scientific Deliberation for Mitigating Sycophantic Consensus in LLM Reasoning". Our supervisor is Dr. Mohammad Nurul Huda. Today we present our FYDP I defence.

### Slide 2 — Introduction

Large language models can answer hard science questions, but they can also be confidently wrong. Multi-agent debate helps: three models answer the same question and compare their reasoning. But most systems decide by majority vote, and every agent counts the same. A confident wrong majority can push a correct minority to give up its answer. We call this sycophantic consensus. No current debate system checks the claims against outside evidence while the debate runs. Our project fixes this.

### Slide 3 — Motivation

Four findings motivate the project. ConsensAgent found that in over twenty percent of wrong-answer cases, the correct answer was already present but ignored. MAST measured failure rates from forty-one to eighty-six point seven percent across seven multi-agent systems. DebUnc showed that a truth-aware oracle beats deployable confidence signals by up to ten percent. And about one in four disagreements hides a correct minority. The problem is real, and confidence is not a reliable signal.

Yousuf will present our objectives and the data.

### Slide 4 — Objective

We set four objectives. First, design a bounded trust update from retrieved evidence. Second, build a reproducible injection protocol that measures collapse under pressure, with annotation agreement of at least zero point seven five. Third, compare against ten baselines, including MoA, iMAD and ConsensAgent, using four metrics: accuracy, collapse rate, minority survival and calibration. Fourth, prove early that the trust signal changes decisions, not just the context.

### Slide 5 — Dataset

We use five scientific question sets. GPQA and MMLU-Pro are stable sets for accuracy. HLE is the expert ceiling. BrokenMath and BrokenArXiv are adversarial sets that stress-test sycophancy. Two filters keep only divergent questions with checkable answers, and about sixty to seventy percent pass. The main matrix uses one thousand questions per dataset; the pilot uses fifty.

Atik will present the conventional methods and our proposed approach.

### Slide 6 — Conventional Method

Today, debate decides in different ways. Majority voting gives every agent equal weight. Confidence weighting uses self-reported scores. Prompt rewriting tries to reduce sycophancy before the debate. Static aggregation merges the outputs once. And iMAD predicts when a debate is needed. We test ten baselines, B1 to B10. The gap is clear: none of them ties an agent's influence to external evidence while the debate runs.

### Slide 7 — Proposed Method

Our method works in steps. A confidence gate sends easy questions to a direct answer, and hard questions to a debate. Three different agents answer: Qwen, Gemma and Mistral, with no fine-tuning. Each answer is split into atomic claims, and every claim is checked against PubMed, arXiv or Semantic Scholar. Each claim gets one verdict: supported, contradicted, unverifiable or contested. The trust score updates every round. It rises with support, falls with contradiction, then softmax, clamp to zero point one to zero point nine, and renormalize. The final answer is a trust-weighted vote, not a head count.

Pratay will present the flow diagram and the experimental setup.

### Slide 8 — Flow Diagram

This is the level-one data flow. Seven processes, four external entities, and three data stores. Questions enter at the gate. Claims and passages flow through verification. The trust update feeds the aggregation. The result package carries the answer, the citations and the trust trajectory.

### Slide 9 — Experimental Setup

The setup has two model stacks. The development stack is Qwen3.5-9B, Gemma 4 12B and Ministral-3-14B in four-bit, on one RTX A6000. The final stack is Qwen3.6-27B, Gemma 4 26B and Mistral Small 24B in FP8, on one RTX PRO 6000. Serving uses vLLM with an OpenAI-compatible API. Debates run three rounds with three seeds. The stress test injects a fake expert consensus between rounds one and two, and it is off in baselines B1 to B4. Validation uses annotation agreement and bootstrap confidence intervals. Total compute is about three hundred GPU-hours.

Salman will present the results and the complex engineering check.

### Slide 10 — Project Results

These are the expected results. Collapse rate should drop by twenty to thirty percent. A correct minority should survive more often. Calibration should be above zero point eight. Accuracy should not regress, and the largest gains should appear on the adversarial sets. The completed experiments already show the pipeline works: ten GPQA questions, three rounds each, ten out of ten debates completed, ninety out of ninety non-empty positions, mean three hundred seventy point eight seconds per debate.

### Slide 11 — Why Complex Engineering

The Washington Accord uses four lenses: problem solving, knowledge, activities and program outcomes. Our project is a complex engineering problem. It is multi-disciplinary, it has conflicting requirements, there is no textbook solution, and its parts depend on each other. For example, one retrieval error can change the final answer.

Limu will close the presentation.

### Slide 12 — Complex Engineering Matrix

This is the full mapping. The needs row shows what each attribute requires. PO1 and PO2 need K1 to K4. P1 needs K3 to K6 and K8. The P attributes relate to PO1 to PO8, and the activities relate to PO10. The FYDP I row shows covered and not covered. The summary: P six of seven, K eight of eight, A four of five, PO six of twelve. P6, A3 and the remaining outcomes carry into the later phases.

### Slide 13 — Conclusion · Application

To conclude. The project addresses a real failure: a confident wrong majority pushing a correct minority into sycophantic consensus. Our mechanism is a bounded trust score from retrieved evidence, updated during the debate. The evaluation uses the injection protocol and the CCR, MPR and ECR metrics against the baselines. The design applies to scientific QA and research assistants, and it extends to law or medicine where an evidence corpus exists. Remaining work: the full experiment matrix, ablations, the human study and an open-source release.

### Slide 14 — Thank You

Thank you for your attention. We are happy to take your questions.
