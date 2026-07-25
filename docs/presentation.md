# Presentation Script — ConsensAgent Slides (~1.5–2 min)

---

## Slide 1 — ConsensAgent: What It Does & Results

**Opening:**

The paper is **ConsensAgent** by Pitre, Ramakrishnan, and Wang from Virginia Tech. It was published at **Findings of ACL 2025** — that's the Association for Computational Linguistics, one of the top venues for NLP research.

**The problem they identified:**

Before this paper, sycophancy was studied only in human-to-AI settings — a human pressuring a model to change its answer. ConsensAgent was the **first** to show that sycophancy happens between AI agents inside multi-agent debate. They found that agents copy or swap each other's answers instead of reasoning independently.

And here is their most important finding: in over **20% of wrong-answer cases**, the correct answer was actually **present in the discussion** — but it was ignored. The correct minority agent was pressured into abandoning its position. This is the hard evidence that our problem is real.

**How they fixed it:**

Their solution has four phases. First, each agent gives an independent answer with a confidence score. Then they debate for up to five rounds. If a trigger detects stalling or copying — they use a cosine similarity threshold of 0.8 on explanations — a fine-tuned GPT-4o model **rewrites the task prompt** to remove ambiguity. Then agents re-debate and converge quickly, usually in one to two rounds.

**Results:**

Their method reduced sycophancy by **7 to 30 percent** and achieved **best-in-class accuracy** on all six benchmarks — KITAB, CLUTRR, HotpotQA, Ethics, GSM8K, and TriviaQA — beating strong baselines like ReConcile.

---

## Slide 2 — Relevance & Gap

**How it helps our work:**

ConsensAgent is our **nearest published neighbor** — it is the closest existing work to what we are proposing. It shares our exact motivation: a correct minority gets overwhelmed by a confident majority.

Critically, their **20-percent correct-but-ignored** finding is our strongest **proof that the problem is real**. Without them, we would be claiming a problem exists based only on theory. With them, we cite a peer-reviewed ACL paper.

We also adopt their sycophancy metric — measuring copy and swap behaviour via cosine similarity — as a baseline comparison for our own evaluation harness.

**Where it falls short — and why we are different:**

But ConsensAgent has a fundamental gap. It fixes sycophancy **indirectly** — by rewriting the prompt **before** debate. It has **no mechanism to re-weight who to trust during the debate itself**.

This means it fails exactly when the prompt is perfectly clear but a confidently wrong majority simply out-persuades a correct minority.

Its final vote still relies on **self-reported confidence** — which is precisely the signal that gets distorted under social pressure.

It also requires a **per-dataset fine-tuned GPT-4o** with 150 labelled samples, which is expensive and doesn't generalise.

And the authors themselves admit their method treats the **symptom, not the root cause** — sycophancy reduction is largely a side effect of reaching consensus faster.

**Our contribution fills this gap:**

We calibrate trust **during** the debate using **external retrieved evidence** — not pre-debate prompt clarity, not self-reported confidence. Prompt clarification is not the same as agent trust calibration. That is the key difference.

---

*Estimated delivery: ~1 min 45 sec at natural speaking pace.*
