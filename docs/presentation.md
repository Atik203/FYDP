# Presentation Script — Estornell & Liu Slides 12 & 13 (~1.5–2 min)

> Written for non-native speakers: short sentences, one idea per sentence, ~120 words per minute.

---

## Slide 12 — Multi-LLM Debate: Summary + Method + Results

**Opening:**

I am presenting **Multi-LLM Debate: Framework, Principals, and Interventions**. The authors are Andrew Estornell and Yang Liu. It comes from **NeurIPS 2024**, the Main Conference Track. This is our **theoretical foundation** paper.

**The main idea:**

This is the first paper that gives a **formal theory of debate**. It treats last-round responses as examples. Each agent updates its beliefs the way models learn from examples. This is Lemma 4.2 in the paper.

Then it proves three principles. **Theorem 5.1**: identical models produce **static debate**. The discussion freezes on one idea. **Theorem 5.2**: similar responses cause the **tyranny of the majority**. Repeated answers drown out the rest. **Theorem 5.4**: when many agents share the **same misconception**, accuracy falls as more agents share it. Adding more models does not help.

**How it works:**

They design **three interventions**. First, **diversity pruning**. Keep the responses that are most different from each other. Second, **quality pruning**. Keep the responses closest to the question. Third, **misconception refutation**. An LLM lists the errors in a response, refutes them, and rewrites a corrected version.

**Key results:**

Tested on **four benchmarks**: BoolQ, MMLU, TruthfulQA, and MathQ. With GPT, Llama, and Mistral models. Six agents, ten rounds. MMLU accuracy rose from **0.74 to 0.79**. Math rose from **0.88 to 0.93**. TruthfulQA rose from **0.63 to 0.69**. The gain is largest exactly where responses are **most similar**. That confirms the theory.

---

## Slide 13 — Estornell & Liu: Relevance & Gap

**Why it matters to us:**

This paper **proves our problem is real**. Debate converges to the majority. Not by accident, but by theory. That is our starting point.

Their finding on **shared misconceptions** motivates our design. Models trained on similar data share the same blind spots. So we need **heterogeneous agents** plus outside evidence.

Their echo-rate plots are the precedent for our **injection protocol**. We measure the same collapse, but under controlled pressure.

**The gap:**

First, the theory needs **concept distributions** that cannot be computed. They use sentence embeddings as a proxy. This proxy **fails on arithmetic**. Embeddings cannot tell two calculations apart.

Second, there is **no external verification**. The method rearranges peer text. It never checks a claim against a real source.

Third, there is **no persistent trust**. Pruning affects only the next round. No agent carries a standing across rounds.

Fourth, refutation **re-prompts every debater**. That is costly. And it returns no citations.

**Our contribution:**

We keep every response. But we re-weight **who counts**. A bounded trust score comes from **retrieved evidence**. With citations in the final answer. Pruning changes what the next round reads. We change whose evidence-backed position decides.

---

# Presentation Script — MAST (Paper #9) Slides 1 & 2 (~1.5–2 min)

> Separate talk. The Estornell & Liu script above is a different presentation and stays unchanged.

---

## Slide 1 — Why Do Multi-Agent LLM Systems Fail?

**Opening:**

This presentation covers our failure-taxonomy paper, **Why Do Multi-Agent LLM Systems Fail?** The authors are Mert Cemri and co-authors from UC Berkeley. It comes from **NeurIPS 2025**, the Datasets and Benchmarks Track. This is the paper that maps how multi-agent systems break.

**The main idea:**

Multi-agent systems are popular, but their gains over a single agent are often small. This paper asks a direct question: why do they fail? The team collects **1,642 execution traces** from **seven popular multi-agent frameworks**. Then they annotate the traces and build **MAST**, the first taxonomy of multi-agent failures. MAST has **14 failure modes** in **three categories**: system design issues, inter-agent misalignment, and task verification.

**How it works:**

Human experts label the traces and agree at **κ = 0.88**. To scale the work, the team builds an **LLM-as-a-judge pipeline**. It agrees with the human labels at **κ = 0.77**. On unseen frameworks and benchmarks it still holds at **κ = 0.79**.

**Key results:**

Across the seven systems, the failure rate is **41 to 86.7 percent**. The failures repeat across model families and tasks. So they come from system design, not just from the model. In one case study, a MAST-guided workflow fix raised ChatDev task success by **9.4 percent**.

---

## Slide 2 — MAST: Relevance & Gap

**Why it matters to us:**

This is our strongest evidence that multi-agent systems fail in **recurring, classifiable ways**. Two MAST categories match our problem. **Inter-agent misalignment** covers agents that do not use correct information. **Task verification** covers premature consensus and unverified claims. Its **κ-validated judge pipeline** is also a template for our evaluation and our human study. MAST gives our motivation and failure analysis an independently validated vocabulary.

**The gap:**

First, MAST is **diagnostic only**. It measures failures but proposes no mechanism to prevent them. Second, the authors say robust reliability needs **more than isolated fixes**. Third, it never isolates **sycophancy as a trust-signal problem**. Fourth, there is **no external evidence and no in-debate trust**, so no agent's influence is tied to verified claims.

**Our contribution:**

MAST shows where multi-agent systems break. We add the missing corrective part: an **evidence-grounded trust score** that keeps a correct minority alive during the debate itself.
