# 📚 Literature Review Guide — FYDP Idea 1

### Trust-Calibrated Multi-Agent Scientific Deliberation for Mitigating Sycophantic Consensus in LLM Reasoning

---

## 🎯 Goal

Each team member will review **1 recent paper (2022–2026)** related to our idea.  
The aim is to **identify what has already been done**, spot **gaps in existing research**, and understand how our idea fits into the current landscape.

> [!IMPORTANT]
> Focus on **recent papers only** — published within the **last 3–4 years (2022–2026)**. Avoid older papers unless they are a landmark/foundational reference.

---

## ✅ What Each Member Should Do

1. **Find 1 relevant paper** using the search tips below.
2. **Read it deeply** — allocate **2 hours for reading** using this strategy:

   | Time   | Focus Area                                    | What to Extract                          |
   | ------ | --------------------------------------------- | ---------------------------------------- |
   | 30 min | **Abstract + Introduction**                   | Problem, motivation, research question   |
   | 30 min | **Methodology**                               | Approach, architecture, key techniques   |
   | 30 min | **Related Work + Literature Review**          | Prior work, gap they are addressing      |
   | 30 min | **Results + Conclusion + Limitations/Future** | Findings, limitations, what remains open |

   - **30 min ↓ Write up** the entry using the format below.
   - Use **AI tools** (see section below) to clarify confusing sections, define terms, or explain figures.
3. **Fill in the format** below for the paper in your assigned Google Docs tab.
4. **Keep it brief** — the entry should fit within **1 page** in the doc.

---

## 🔍 Where to Find Papers

Use these sources to search for relevant papers:

| Source              | Link                            |
| ------------------- | ------------------------------- |
| Google Scholar      | https://scholar.google.com      |
| Semantic Scholar    | https://www.semanticscholar.org |
| ArXiv (AI/ML)       | https://arxiv.org               |
| ACL Anthology (NLP) | https://aclanthology.org        |
| Papers With Code    | https://paperswithcode.com      |

### 🤖 Recommended AI Tools to Understand Papers Faster

Use these tools alongside your reading to clarify concepts, summarize sections, and extract key information:

| Tool                     | Best For                                       | Link                                | Free Tier        |
| ------------------------ | ---------------------------------------------- | ----------------------------------- | ---------------- |
| **ChatGPT / Claude**     | Explain confusing sections, define terms       | chat.openai.com / claude.ai         | Yes              |
| **NotebookLM (Google)**  | Multi-document QA, upload PDF, ask questions   | notebooklm.google.com               | Free             |
| **SciSpace**             | Chat with PDFs, inline copilot while reading   | typeset.io                          | Free tier        |
| **Elicit**               | Extract structured data (methods, results)     | elicit.com                          | Free tier        |
| **Consensus**            | Evidence-based answers from papers             | consensus.app                       | Free tier        |
| **Semantic Scholar**     | Paper discovery + AI-generated TLDRs           | semanticscholar.org                 | Free             |
| **Scite**                | Check how a paper was cited (support/contrast) | scite.ai                            | Free tier        |
| **Connected Papers**     | Citation network graphs to find related work   | connectedpapers.com                 | Free             |
| **Research Rabbit**      | Personalized paper recommendations             | researchrabbitapp.com               | Free             |
| **Perplexity**           | Quick web + academic search with citations     | perplexity.ai                       | Free tier        |
| **PapersFlow**           | Multi-agent lit review + writing with citations | papersflow.ai                      | Free tier        |

> ⚠️ Always verify AI-generated summaries or citations against the actual paper. AI tools can hallucinate details.

### 🔎 Suggested Search Keywords

Try combinations of these keywords:

- `LLM sycophancy`
- `multi-agent LLM debate`
- `LLM reasoning disagreement`
- `sycophantic consensus large language models`
- `AI agent deliberation`
- `LLM trust calibration`
- `LLM role-playing agents`
- `LLM opinion change pressure`
- `adversarial prompting LLM`
- `multi-agent scientific reasoning`
- `LLM echo chamber`
- `LLM consensus bias`

---

## 📝 Format — Use This for Each Paper

Copy this block for each paper in your Google Docs tab:

---

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Paper #[N]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Paper Title:
[Full title of the paper]

Authors & Year:
[Author names, Year of publication]

Link:
[Direct link — DOI / Conference page / ArXiv / Google Scholar]
> Prefer a DOI or published conference link over ArXiv when available.

Summary:
[3–5 sentences. What is the paper about? What did they do?
What are the main findings or contributions?]

Relevant to Our Idea:
[2–4 sentences. How does this paper connect to our FYDP idea?
What has already been done that overlaps with our idea?
What gap does it reveal that we can address?]

Gap / Limitation Noted in Paper:
[1–2 sentences. What does the paper itself say it could NOT solve
or what future work is needed? This is where our idea may fit in.]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 📋 Example Entry (Filled Out)

---

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Paper #1
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Paper Title:
Sycophancy to Subterfuge: Investigating Reward Tampering in Language Models

Authors & Year:
Perez et al., 2022

Link:
https://arxiv.org/abs/2310.13548

Summary:
This paper investigates sycophantic behavior in large language models (LLMs),
where models change their answers to match perceived user preferences rather
than providing truthful responses. The authors show that RLHF-trained models
are particularly vulnerable to this. They test models across multiple tasks
and find that sycophancy is a consistent and measurable behavior.

Relevant to Our Idea:
Directly relevant — this paper establishes that LLMs have a sycophancy
problem, which is the core issue our idea addresses. However, the paper only
studies single-agent settings; it does not explore how sycophancy propagates
in multi-agent or deliberation scenarios, which is our focus.

Gap / Limitation Noted in Paper:
The paper does not address multi-agent systems or how agents influence each
other. It also does not propose a trust-calibration mechanism to mitigate the
behavior — both of which are central to our FYDP idea.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 📌 Rules & Reminders

- ✅ Papers must be from **2022 or later** (very strong preference for 2023–2025)
- ✅ You can use **AI tools** (see section below) to summarize or explain a paper — but **write the entry in your own words**
- ✅ Keep entries **short and focused** — not a copy-paste of the abstract
- ✅ The **"Gap / Limitation"** field is the most important — this tells us where our idea fits
- ❌ Do NOT include papers that are completely unrelated (e.g., computer vision papers with no NLP/LLM angle)
- ❌ Do NOT write more than 5–6 sentences per paper — we want brief, useful summaries, not full reports

> [!IMPORTANT]
> **Very Important: Verify peer-reviewed publication status.** 
> Before citing any paper, check whether it has been published in a reputable, peer-reviewed journal or conference (e.g., ACL, EMNLP, NAACL, NeurIPS, ICML, ICLR, AAAI, IJCAI, IEEE, ACM — see full list below). arXiv.org is a preprint repository, not a peer-reviewed publication venue. While many papers on arXiv are later published after peer review, others remain unpublished preprints. Always check for a peer-reviewed published version and cite that version whenever possible. When you find a paper on arXiv, search for it on Google Scholar or the conference website to confirm if it was accepted at a peer-reviewed venue. If it has been published, use the published citation/DOI instead of the arXiv link.

### ✅ Valid Peer-Reviewed Venues (Conference & Journal)

| Area              | Venues                                                                 |
| ----------------- | ---------------------------------------------------------------------- |
| NLP / CL          | ACL, EMNLP, NAACL, EACL, COLING, TACL, Computational Linguistics      |
| ML / AI           | NeurIPS, ICML, ICLR, AISTATS, COLT, UAI, JMLR, Machine Learning journal |
| AI General        | AAAI, IJCAI, ECAI, Artificial Intelligence journal                     |
| CS / Engineering  | IEEE (various), ACM (various), Springer LNCS                           |
| HCI / Interdisc.  | CHI, CSCW, UIST, IUI                                                  |
| Robotics          | ICRA, IROS, RSS, IEEE Transactions on Robotics                        |
| Vision            | CVPR, ICCV, ECCV, IJCV, IEEE TPAMI, BMVC                              |

> If a paper only exists on arXiv with no record of peer-reviewed publication, note this in your entry and treat it as a preprint (proceed with caution).

---

## 🗂️ Google Docs Tab Structure (Suggested)

Each member gets their own tab in the shared Google Doc.

> In the last **"Summary & Gaps"** tab, the team can collectively list all the major gaps found across all papers. This will be the foundation of our **research gap / motivation section** in the final report.

---

## ⏱️ Time Estimate

| Task                      | Time                    |
| ------------------------- | ----------------------- |
| Find 1 paper              | ~20–30 min              |
| Read the paper (deep)     | **2 hours** (see strategy above) |
| Write entry in doc        | **30 min**              |
| **Total per member**      | **~3 hours**            |

---
