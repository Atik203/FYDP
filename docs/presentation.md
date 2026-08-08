# Presentation Script — MoA Slides 8 & 9 (~1.5–2 min)

> Written for non-native speakers: short sentences, one idea per sentence, ~120 words per minute.

---

## Slide 8 — MoA: Summary + Method + Results

**Opening:**

I am presenting **Mixture-of-Agents**, or **MoA** for short. It was published at **ICLR 2025**. The first author is Junlin Wang from Together AI.

**The main idea:**

The paper shows that LLMs are **collaborative**. A model answers better when it sees other models' answers. This is true even when the other models are weaker.

**How it works:**

MoA uses a **layered pipeline**. First, several "proposer" models answer the question. Then, an "aggregator" model reads all the answers and combines them. The result goes to the next layer. The final layer produces the final answer.

There is **no fine-tuning**. MoA only uses prompting with existing models.

Important: MoA is an **ensemble**, not a debate. The proposers never talk to each other. They never change their answers.

**Key results:**

MoA reaches **65.1%** on AlpacaEval 2.0, using only open-source models. This is higher than **GPT-4 Omni**, which scores 57.5%. It also **leads MT-Bench and FLASK**. With a **GPT-4o aggregator**, the score goes up to **65.7%**. The framework matches **GPT-4 Turbo** at about **2 times lower cost**.

**Models and benchmarks:**

The system was tested on **AlpacaEval 2.0, MT-Bench, and FLASK**. It was compared against **GPT-4 Omni, GPT-4 Turbo, and GPT-4o**. The proposers were all open-source: **Qwen1.5, WizardLM, Mixtral, LLaMA-3-70B, and dbrx**.

One more result: **more diverse proposers give better answers**. The score goes from 47.8% with one proposer to 61.3% with six.

---

## Slide 9 — MoA: Relevance & Gap

**Why it matters to us:**

MoA is the best-known proof that **multi-model aggregation works**. This motivates our own idea of using multiple agents.

It also shows that **diversity helps**. Different models add different perspectives. We keep this idea in our design.

But MoA is a **trust-blind baseline**. Our mechanism improves on it.

MoA is not our competitor. It uses a different paradigm — an ensemble, not a debate. So we cite it as **context**.

**The gap:**

First, MoA has **no per-agent trust**. Every proposer's text enters on equal footing. Good answers and bad answers have the same weight.

Second, there is **no external evidence**. The aggregator uses only its own judgment.

Third, a **weak aggregator can degrade everything**. The paper shows a score drop from 60.6% to 45.0%.

Fourth, MoA **cannot detect a confidently-wrong proposer**. A confident wrong answer is synthesized in like any other.

Fifth, because it is feed-forward, it **cannot model round-over-round sycophancy**. Agents never respond to each other, so social pressure never appears.

**Our contribution:**

We add what MoA lacks. We give each agent an **explicit, evidence-grounded trust weight**. A confidently-wrong proposer is **down-weighted**, not blindly synthesized in.
