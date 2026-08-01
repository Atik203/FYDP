# Presentation Script — ConsensAgent Slides (~1.5–2 min)

---

## Slide 1 — ConsensAgent: What It Does & Results

**Opening:**

My paper is **ConsensAgent: Towards Efficient and Effective Consensus in Multi-Agent LLM Interactions Through Sycophancy Mitigation**. It was published at **ACL 2025** — one of the top conferences in NLP.

**The problem:**

Before this paper, people studied sycophancy only between a human and an AI. This paper was the **first** to show that sycophancy also happens between AI agents in multi-agent debate. Agents copy each other's answers instead of thinking independently.

Their most important finding: in **more than 20% of cases where the final answer was wrong**, the correct answer was already there in the discussion — but it was ignored. The right answer was lost just because the majority disagreed. This is the proof that our problem is real.

**Their solution — four phases:**

**Phase 1** — Each agent gives an independent answer plus a confidence score.

**Phase 2** — They debate for up to five rounds.

**Trigger** — If the system detects stalling or copying, using a cosine similarity threshold of 0.8...

**Phase 3** — A fine-tuned GPT-4o rewrites the task prompt to make it clearer. Agents debate again.

**Phase 4** — Final answer is a weighted vote using confidence and consistency.

**Results:**

Sycophancy dropped **7 to 30 percent**. They got **best results on all six datasets** — KITAB, CLUTRR, HotpotQA, Ethics, GSM8K, and TriviaQA. After the trigger, consensus happens in **one to two rounds**.

---

## Slide 2 — Relevance & Gap

**How this helps our work:**

ConsensAgent is our **closest competitor**. Same problem — sycophantic collapse. Same motivation — a correct minority is overwhelmed by a confident majority.

Their **20% correct-but-ignored** finding is our strongest **proof that the problem exists**. Without this paper, we can only say the problem might exist. With it, we have peer-reviewed evidence.

Their sycophancy metric — detecting copy and swap behaviour — is a **baseline for our own evaluation system**.

**Where it falls short:**

But ConsensAgent fixes sycophancy **indirectly**. It rewrites the prompt **before** debate. It has **no way to change who to trust during the debate**.

So it fails when the prompt is clear but a confident majority is simply wrong.

The final vote still uses **self-reported confidence** — the same signal we know gets distorted under pressure.

It also needs a **fine-tuned GPT-4o for each dataset**, which costs money and doesn't generalise.

The authors themselves say their fix treats the **symptom, not the root cause**.

**Our contribution:**

We calibrate trust **during** the debate using **real external evidence** — not prompt rewriting, not self-reported confidence. Prompt clarification is not the same as trust calibration. That is the key difference.

---

## Slide 1 — DebUnc: What It Does & Results

**Opening:**

I am presenting **DebUnc: Improving Large Language Model Agent Communication With Uncertainty Metrics**. It was published in **Findings of EMNLP 2025**. Unlike ConsensAgent, it changes agent influence during the debate, so it is the paper closest to our mechanism.

**The problem:**

In normal debate, agents see each other's answers, but they do not know how certain those answers are. A wrong answer can sound very confident and influence the other agents.

**Their solution:**

After each round, DebUnc measures each agent's uncertainty using token-level metrics such as **Mean Token Entropy** and **TokenSAR**.

It converts the result into a confidence score from 1 to 10. The score is either added to the prompt or used to scale the attention given to peer tokens.

Attention-scaling works better than putting the score in the prompt. But with real, deployable metrics, the improvement is small: average accuracy goes from **0.63** for standard debate to about **0.64**.

Then they test a **Ground Truth oracle**. This oracle knows which answers are correct, so it reaches **0.73** average accuracy, about 10 points higher. But it needs the correct answer in advance, so it is only a diagnostic and cannot be deployed.

---

## Slide 2 — DebUnc: Relevance & Gap

**How this helps our work:**

DebUnc uses the same lever as us: it changes agent influence **during** the debate, not only at the final vote.

Its oracle result gives us an important lesson. The communication method is not enough. The trust signal must be close to the truth.

**Where it falls short:**

Its real signal is internal uncertainty. It tells us how the model feels, not whether its claim is correct. It does not check external evidence.

The attention-scaling method also needs white-box access to model internals. That does not work with closed API models. Token-level probability metrics are also unavailable for many closed APIs.

**Our contribution:**

We use external scientific evidence to estimate whether an agent's claim is supported. We update trust at the message level, so the method can work with closed APIs.

In simple words, DebUnc asks, **"How sure are you?"** We ask, **"What evidence supports your answer?"** DebUnc's confidence-in-prompt version is also a direct baseline for our experiments.
