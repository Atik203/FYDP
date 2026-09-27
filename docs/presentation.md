# Complex Engineering Slides — Presentation Script

> Deck: `/slide/ce`. Numbers here match the team list: **1 = title slide**, **2 = the first Complex Engineering slide**, and so on — **13 = the matrix**. (The main `/slide` deck keeps the title, iMAD reference, and thank-you slides.)
>
> Speaking order: Rakibul → Yousuf → Atik → Pratay → Limu → Salman. Two slides each, about 1.5–2 minutes per person.
>
> Speak slowly, about 120 words per minute. Short sentences. One idea per sentence. Point at codes like "P1" or "PO10" when you say them.

---

## Opening — Slide 1 (Title)

*(Rakibul reads this before Slide 2.)*

Good morning everyone. We are Group 6, Team Phantom Devs. Our project is "Trust-Calibrated Multi-Agent Scientific Deliberation for Mitigating Sycophantic Consensus in LLM Reasoning". Our supervisor is Dr. Mohammad Nurul Huda. Today we will present our Complex Engineering check for FYDP I.

---

## 1. Rakibul Hasan · Slides 2–3

### Slide 2 — Why FYDP I Is a Complex Engineering Problem

Our project asks one question: can we stop a confident wrong majority from pushing a correct minority agent to give up its answer? This is a hard problem. So we checked it against the Washington Accord.

The Accord uses four lenses. They are problem solving, knowledge, activities, and program outcomes. You can see them at the bottom of the slide.

Our project qualifies for three reasons. First, it is multi-disciplinary. Second, it has conflicting requirements. Third, there is no textbook solution, and the parts depend on each other. For example, one retrieval error can change the final answer.

### Slide 3 — Washington Accord Attributes

This slide shows the official attributes inside each lens. These names are our checklist for the rest of this section.

P1 to P7 are the problem attributes. K1 to K8 are the knowledge areas. A1 to A5 are the engineering activities. PO1 to PO12 are the program outcomes.

We will now go through them one by one. Yousuf will show our scoreboard first.

---

## 2. Yousuf Kamal Himel · Slides 4–5

### Slide 4 — FYDP I at a Glance

Thank you, Rakibul. This is our scoreboard for FYDP I. It has four numbers.

For problem solving, we cover six of seven attributes. Only P6 is not covered, because we have no external stakeholders.

For knowledge, we cover all eight areas. For activities, we cover four of five. A3 is beyond prototype scope. For program outcomes, we cover six of twelve. The other six come in FYDP II and FYDP III.

These marks are only for FYDP I, because it is the only completed phase.

### Slide 5 — Complex Problem Solving, Part 1

Now I will explain P1 to P4.

P1 is depth of knowledge. The work needs machine learning, NLP, retrieval, and model serving. The trust update runs through the serving layer.

P2 is conflicting requirements. Accuracy fights latency and cost. More debate rounds raise the GPU bill. We used round limits and clamp bounds to balance them.

P3 is depth of analysis. There is no textbook solution. So we compare our system against majority voting, MoA, iMAD, and DebUnc. We also run a fake-consensus stress test.

P4 is familiarity of issues. This field is new. The closest work is from 2024 to 2026. We did a full literature review before any design work.

Atik will now complete the P attributes.

---

## 3. Md. Atikur Rahaman · Slides 6–7

### Slide 6 — Codes, Inter-dependence, and the P6 Gap

Thank you, Yousuf. This slide completes the problem attributes.

P5 is applicable codes. We follow JSON, HTTP over TLS, and the OpenAI-compatible API. No standard covers evidence-based trust. So we define our own rules for the trust score and the four verdicts.

P7 is inter-dependence. The gate, orchestrator, claim decomposer, retrieval, trust updater, and aggregator form one chain. A retrieval error reaches the final answer through the trust score. Our failure-isolation rule keeps a fault inside one component.

P6 is not covered. We have no industry partner or community group. Engagement stays inside the university. So we cover six of seven P attributes, and P6 is the expected gap for FYDP I.

### Slide 7 — Knowledge Profile, Part 1

Now the knowledge areas, K1 to K4.

K1 is natural sciences. Our answers are checked against PubMed, arXiv, Semantic Scholar, and OpenAlex.

K2 is mathematics. The trust update uses softmax, clamping, and renormalization. Our results use a paired bootstrap and effect sizes.

K3 is engineering fundamentals. The system uses state machines, standard design practice for the confidence gate, and failure handling in each component.

K4 is specialist knowledge. Our areas are LLMs, multi-agent debate, RAG, and sycophancy. Three different model families keep the debate heterogeneous.

Pratay will continue with K5 to K8.

---

## 4. Pratay Paul · Slides 8–9

### Slide 8 — Knowledge Profile, Part 2

Thank you, Atik. This slide finishes the knowledge profile, K5 to K8.

K5 is engineering methods. We use controlled experiments, confidence intervals, baseline comparison, and injection studies. All studies share one setup, so the results stay comparable.

K6 is computational methods. Our tools are Python, PyTorch, vLLM, FastAPI, sentence-transformers, and Git. We only run inference, so there is no fine-tuning.

K7 is codes and practices. We use JSON, HTTP over TLS, and the OpenAI-compatible API. Every result package is checked against a JSON schema. Git tracks every change.

K8 is research and context. We follow ethical bounds for AI in scientific question answering. The journal and the independent learning record document the research context.

All eight knowledge areas are covered.

### Slide 9 — Engineering Activities: Resources and Interaction

Now the first two activities.

A1 is the range of resources. We use three model families, four literature APIs, six team members, and a rented Blackwell GPU. Chapter 3 assigns every task to a member, with weeks and deliverables.

A2 is the level of interaction. Each debate round calls three model endpoints and three literature endpoints. We also communicate with the cloud GPU. The team works through a shared repository and weekly meetings. Closed APIs and local models share one OpenAI-compatible interface.

Three of five activities are covered. Limu will now present A5 and the two gaps.

---

## 5. Mst. Farjana Akter Limu · Slides 10–11

### Slide 10 — Familiarity, Innovation and Consequences

Thank you, Pratay. This slide covers A5, A3, and A4.

A5 is familiarity, and it is covered. Multi-agent debate and evidence verification were new for our team. We started with a structured literature review and a baseline study.

A3 is innovation, and it is not covered. We combine existing ideas: debate, retrieval, and trust weighting. So the step is incremental and not patentable.

A4 is consequences, and it is covered. The consequences at stake are real: unreliable AI answers in scientific question answering. We also kept the environmental cost low: about 300 GPU-hours, standard configurations, and no fine-tuning.

We mark A3 as not covered on purpose. We do not want to overclaim.

### Slide 11 — Program Outcomes Coverage

Now the program outcomes. FYDP I covers six of twelve.

The covered outcomes are PO1, PO2, PO4, PO10, PO11, and PO12. You can see them in the green bar.

The other six outcomes are deferred: PO3, and PO5 to PO9. They will be addressed in FYDP II and FYDP III. Together, these six outcomes show that FYDP I already produces real results.

Salman will now show what covers each outcome.

---

## 6. Md. Salman Rohoman Nayeem · Slides 12–13

### Slide 12 — What Covers Each FYDP I Outcome

Thank you, Limu. This slide connects each outcome to a real deliverable.

PO1 comes from the real-life problem in Chapter 1. PO2 comes from the requirements in Chapter 3. PO4 comes from the literature review and gap analysis in Chapter 2.

PO10 comes from the interim report and this oral presentation. PO11 comes from the timeline and the budget in Chapter 5. PO12 comes from the journal and the independent learning record.

PO3 and PO5 to PO9 are scheduled for FYDP II and FYDP III. Each covered outcome maps to one concrete FYDP I deliverable.

### Slide 13 — Overall Mapping Matrix

Finally, this is our full mapping matrix. Every column is one attribute. There are twelve program outcomes, eight knowledge areas, seven problem attributes, and five activities.

The FYDP I row shows a check or a cross for each attribute. The bottom row summarizes the result: program outcomes 6 of 12, knowledge 8 of 8, problem attributes 6 of 7, and activities 4 of 5.

The table also shows what each attribute needs. PO1 and PO2 need K1 to K4. PO3 needs K5, PO4 needs K8, and PO5 needs K6. PO6 to PO8 need K7. P1 needs K3 to K6 and K8. The P attributes relate to PO1 to PO8, and the activities relate to PO10, communication.

This is our complex engineering check. The project meets the criteria for FYDP I, and the remaining gaps are planned for later phases. Thank you.

---

## Faculty Q&A — quick answers

Short answers for the questions that came up today. Any presenter can use these.

- **For P1, which K areas are needed?** K3, K4, K5, K6, and K8. This is the exact Washington Accord wording for P1.
- **Do P2 to P7 need a K area?** No. Only P1 has a defined K requirement. P2 to P7 are defined by their own criteria, like conflicting requirements or no obvious solution.
- **Which POs do the P attributes relate to?** PO1 to PO8 — engineering knowledge, problem analysis, design, investigation, modern tool usage, the engineer and society, environment and sustainability, and ethics.
- **For the A activities, which POs are needed?** PO10 — communication. The official PO10 wording is about communicating on complex engineering activities, for example through reports and presentations. PO9, PO11, and PO12 are also related.
- **Which POs need K7?** PO6, PO7, and PO8 — the engineer and society, environment and sustainability, and ethics.
- **Which K areas do PO1 and PO2 need?** K1 to K4.
- **Why is P6 not covered?** We have no external stakeholders. Engagement stays inside the university in FYDP I.
- **Why is A3 not covered?** We combine existing concepts, so the innovation is incremental and not patentable.
- **Why is A4 covered?** We assessed the social and environmental consequences. The target harm is real, and the energy use stays low.
- **Which K does our project not use?** None. All eight K areas are covered, so every needed K is available.
