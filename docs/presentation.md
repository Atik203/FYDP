# Presentation Script — ConsensAgent Slides (~1.5–2 min)

> Timing note: DebUnc script is trimmed for ~120 words per minute (comfortable for non-native speakers), so each DebUnc section fits within 2 minutes at a relaxed pace.

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

I am presenting **DebUnc**, from **Findings of EMNLP 2025**. Unlike ConsensAgent, it changes agent influence during the debate.

**The problem:**

In debate, agents cannot see how certain each other is, so a confident-sounding wrong answer can still win.

**Their solution:**

The per-round pipeline: agents answer, uncertainty is measured, converted to a 1-to-10 confidence, and shared by prompt or attention-scaling, so peers give confident agents more weight.

Attention-scaling works better, but the gain is small: **0.63** to about **0.64**.

Then they test a **Ground Truth oracle** that knows the correct answer in advance: it reaches **0.73**, about 10 points higher, but it cannot be deployed.

---

## Slide 2 — DebUnc: Relevance & Gap

**How this helps our work:**

DebUnc uses the same lever as us: influence changes during the debate, not just at the final vote.

Its oracle result teaches an important lesson: the trust signal, not the communication method, is the limit.

**Where it falls short:**

Its real signal is internal uncertainty: how the model feels, not whether its claim is correct.

Attention-scaling also needs white-box access and token probabilities, which closed APIs do not expose.

**Our contribution:**

We use external scientific evidence to check whether an agent's claim is supported, updating trust at the message level for closed APIs.

In simple words, DebUnc asks, **"How sure are you?"** We ask, **"What evidence supports your answer?"** Its prompt mode is our B-DebUnc baseline.
