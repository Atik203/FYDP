# Presentation Script — Minority Sentinel Slides 10 & 11 (~1.5–2 min)

> Written for non-native speakers: short sentences, one idea per sentence, ~120 words per minute.

---

## Slide 10 — Minority Sentinel: Summary + Method + Results

**Opening:**

I am presenting **Minority Sentinel**. The full title asks a question: when should we overturn majority voting in multi-agent LLM debates? It comes from the **AgentSearch Workshop at SIGIR 2026**. The first author is Chuan He from UNSW Sydney.

**The main idea:**

Majority voting assumes that agents make **independent errors**. This assumption comes from the Condorcet Jury Theorem. But LLMs share training data. So their errors are **correlated**. The majority can be wrong together. It suppresses the correct minority. The paper calls this **Minority Truth**.

**The finding:**

The authors ran debates with **three different models**: GPT-4o-mini, Gemini, and Claude. Six benchmarks, over 1,700 questions. In 39 percent of cases, the vote split **two against one**. In 25.5 percent of those split cases, the **minority was correct**. Majority voting recovered only 74.3 percent. A perfect oracle would reach 84.3 percent. So there is a **10 point recovery margin**.

**How it works:**

The system has two phases: **Diagnosis** and **Cure**. In Diagnosis, the three agents debate across three rounds. One independent round first, then two debate rounds. Each agent must say if it changed its position, and why. After the debate, the system extracts a **debate fingerprint**. 22 features. They capture how agents argued, how the votes looked, and the quality of the reasoning. A small **LightGBM classifier** then decides: flip the vote, or keep it. Flipping happens only when it is safe. The threshold keeps **95 percent of correct majorities**.

**Key results:**

Overall **Net Gain plus 1.71 percent**. 39 correct flips, 9 wrong flips. **Flip Precision 81.2 percent**. Positive gain on **all six datasets**. Stable across **20 random seeds**. The interesting part: an **LLM judge fails**. GPT-4o reading the debate logs gets **negative net gain**, minus 1.37 percent. The judge shares the same blind spots as the debating agents. A non-LLM classifier works better. The paper calls this **cognitive orthogonality**.

---

## Slide 11 — Minority Sentinel: Relevance & Gap

**Why it matters to us:**

This is our **closest competitor on problem framing**. It measures the exact collapse we target. 25.5 percent of split cases, minority correct. A 10 point margin.

Their **LLM-as-Judge failure is direct evidence for our Challenge C**. Correlated errors cannot be fixed by another LLM. That is our core argument.

They also show that **behavioral signals carry information**. How agents argued tells us if the consensus is reliable. This informs our own design.

**The gap:**

First, it is **post-hoc only**. The flip decision happens **after** the debate. The majority pressure has already done its damage. The minority argument was already weakened.

Second, the signal is **self-referential**. The fingerprint comes from the same models whose errors are correlated. There is **no external evidence**.

Third, it is **supervised**. It needs labeled divergent samples. And per-dataset threshold tuning.

Fourth, the audit features need **extra GPT-4o calls**. That adds cost, and brings back LLM bias.

Fifth, it is **fixed at three agents and two rounds**. Only 686 divergent samples. Small numbers mean threshold risk.

**Our contribution:**

We re-weight trust **during** the debate. Grounded in **external retrieved evidence**. So the minority argument is never crushed in the first place. Minority Sentinel is complementary to us. It can serve as a post-hoc safety valve **on top of** our in-debate calibration.
