# Claims Audit — FYDP Summer Report

**Branch:** `docs/report-claims` · **Base (historical):** `origin/feat/p0-hardening` at `8417dc7` · **Audit date:** 9 November 2026.

> **Historical record (audit of the report at `8417dc7`).** The current release base is `main` = `dev` = `2ae56a3` (P0 release `7f2c11f`; tags `p0-gate`, `p0-release`). The P0 gate is now 13/13; the P0 release recorded 514 tests and the current suite has 523. The report cover now uses the exact paper title, Chapter 3 follows the FYDP~II plan, Chapter 4 is restructured as Implementation and Results, and the separate 6.2 section was removed. The old-to-new tables below are retained as the historical audit of the pre-release text; only rows that state a current status are updated, and those updates are marked in the row text.

**Mode and authorship rung**
- Existing chapters (`0.1`–`3`, `5`): **Mode 1 — edit/polish**, **rung B** (author wrote; agent edits for clarity, claims, and consistency).
- `4.implementation.tex` and `6.conclusion.tex`: **Mode 2 — project-grounded drafting**, **rung C** (agent drafts from project evidence; author must verify and revise).
- This audit: **Mode 4 — audit**.

**Scope.** The audit covers every substantive claim changed in `FYDP_Summer/*.tex`. It records the old claim, the new text, the reason, and the evidence. It also records the claim-evidence map, the removed or narrowed claims, unresolved numbers, figure/caption changes, and the compile result.

**Status key:** `verified` = traced to a named file, run, config, test, or gate output; `placeholder` = still needs author action; `removed` = deleted because the project does not support it; `narrowed` = claim strength reduced to the evidence.

---

## 1. Old claim to new text

Line numbers are the current lines after editing. Old text is quoted in short form.

| # | Location | Old claim | New text | Reason | Status |
|---:|---|---|---|---|---|
| 1 | `0.1.abstract.tex:10` | "Currently, there is no mechanism within any debate system to check an individual agent's assertions..." | "we are not aware of a deployed method that combines claim-level external evidence with a bounded trust state..." | False absolute; CRITIC, RAG debate, GAVEL, and DebateCV are adjacent. The scoped claim is defensible. | narrowed |
| 2 | `0.1.abstract.tex:10` | "Our proposed framework produced fewer hallucinated answers than competing frameworks..." | "These results validate serving, orchestration, parsing, and the trust operator; they are not an efficacy result." | No comparative run exists; past tense and result claim were unsupported. | removed |
| 3 | `0.1.abstract.tex:10` | "all surviving claims are linked back to their originating passages..." | "the final record links supported claims to the passages that supported them." | Unverifiable claims survive without citations; only supported claims have passages. | narrowed |
| 4 | `0.1.abstract.tex:10` | "the system returns both the selected model and supporting citations..." | "The final answer is a trust-weighted plurality over the agents' final positions..." | Wrong object ("selected model"); the output is an answer, not a model. | removed |
| 5 | `1.intro.tex:9` | "in over 20% of times when an agent makes a wrong decision... they ignore the correct answer..." | "In one study of three-agent debates, 25.5% of the cases in which the agents disagreed had the correct answer in the minority..." | Denominator was misstated. He et al. report 25.5% of divergent cases. | verified |
| 6 | `1.intro.tex:13` | "The primary purpose for the research was to eliminate excessive sycophancy..." | "The objective is to test whether evidence-weighted trust reduces sycophantic collapse..." | "Eliminate" is an absolute; past tense implied completed work. | narrowed |
| 7 | `1.intro.tex:17` | "An approach that utilizes per-agent confidence... is followed here [DebUnc]." | "Unlike DebUnc, the signal here is external evidence, not self-reported confidence." | Contradicted the thesis: this project uses retrieved evidence, not confidence. | removed |
| 8 | `1.intro.tex:17` | "The trust values... remain within bounds at all times..." | "The trust vector is projected onto a simplex with a floor after every update..." | The old clamp-then-renormalize could fall below the floor; the projection is the actual guarantee. | removed |
| 9 | `1.intro.tex:17` | "The proposed framework was tested using... GPQA and MMLU-Pro." | "The framework has been exercised end to end on a ten-question GPQA slice (Gate 0)... The comparative evaluation... is planned." | Only Gate 0 ran; MMLU-Pro has not been run. | narrowed |
| 10 | `2.back.tex:40` | "iMAD addresses cost rather than correctness." | "iMAD primarily targets cost; it also reports accuracy gains in some settings." | iMAD reports accuracy gains; the original was misleading. | narrowed |
| 11 | `2.back.tex:68` | "none of the previously conducted studies have assessed scientific claims prior to altering the influence of an agent." | "None of these studies combines claim-level scientific evidence with an explicit bounded in-debate trust state and a controlled wrong-majority benchmark." | False absolute; adjacent systems exist. The scoped gap is defensible. | narrowed |
| 12 | `2.back.tex:84` | "The existing research therefore does not currently contain a method..." | "We are not aware of a method that continuously updates an agent's influence from independently verified evidence during a debate." | Absolute claim about the literature; "we are not aware" is the honest form. | narrowed |
| 13 | `2.back.tex:84` | Metrics "CCR, MPR, ECR, and Answer Accuracy" | "final-answer accuracy and correct-minority retention as primary endpoints, with collapse under pressure, appropriate revision, and trust calibration as secondary and mechanism measures." | ECR is deprecated and not a primary endpoint; current endpoints are in `eval/endpoints.py`. | verified |
| 14 | `3.design.tex:14` | "$S_i(t+1)=S_i(t)+\\alpha V_i-\\beta H_i$; softmax; clamp 0.1--0.9; renormalize" | Logit update with $\\alpha V_i/n_i-\\beta H_i/n_i$, one softmax, then simplex projection with floor, sum-to-one, ceiling. | The old formula and bound were wrong; the operator is in `trust/update.py`. | verified |
| 15 | `3.design.tex:20` | "weighted aggregation... the majority vote plays no part in it." | "a weighted plurality... Majority voting is retained as a baseline and logged for comparison; it does not choose the treatment's answer." | Majority voting is a control and is logged; "plays no part" was false. | narrowed |
| 16 | `3.design.tex:12` | "Retrieval gives each agent its own database: PubMed... arXiv... Semantic Scholar..." | "Retrieval routes each claim by domain: biomedical... to PubMed and Semantic Scholar; physics, chemistry, mathematics, and computer science... to arXiv and Semantic Scholar..." | P0-8 replaced agent-to-source assignment, which confounded source, domain, and model family. | verified |
| 17 | `3.design.tex:53` | "The web dashboard... screenshots will be replaced..." | "A web dashboard... is planned but is not part of the P0 implementation. Figures... are layout mock-ups, not screenshots." | No dashboard exists; the placeholder screenshots were presented as if real. | narrowed |
| 18 | `3.design.tex:71` | Empty `Detailed Methodology and Design` section. | Design-level description of the debate, evidence layer, weighted plurality, and evaluation contract. | Empty section in a submitted chapter. | verified |
| 19 | `3.design.tex:177` | "Of the total 300 GPU hours I have reserved..." | "The pre-registered matrix is budgeted at 1,280 GPU-h... or about 1,067 GPU-h... Core run... Full run..." | First-person budget and stale 300-hour figure; current matrix is 24 runs. | verified |
| 20 | `5.sic.tex:158` | "The project meets... the seven attributes..." | "Six are covered; P6 is not covered because the project has no external stakeholder." | Table already marks P6 as not covered. | verified |
| 21 | `5.sic.tex:245` | "RAG (Rebuttal Aggregation Graph)" | "retrieval-augmented generation (RAG)" | Factual error. | verified |
| 22 | `5.sic.tex:292` | "still within an incremental level of innovation" | "The contribution is the combination of claim-level external evidence with a bounded in-debate trust state and a controlled wrong-majority protocol... not a patentable or breakthrough innovation." | Removed the self-deprecating "incremental" label; states the contribution and its scope. | narrowed |
| 23 | `5.sic.tex:296` | "300 GPU-hours... energy usage remains very-low" | "1,067--1,280 GPU-h... Energy use was not metered, so no quantitative energy claim is made." | No energy measurement; 300 hours was stale. | removed |
| 24 | `5.sic.tex:330` | "six program outcomes... all of which are addressed in FYDP I" | "six of the twelve program outcomes: PO1, PO2, PO4, PO10, PO11, and PO12... remaining six are scheduled for FYDP II and III..." | Reconciles the table and the text. | verified |
| 25 | `5.sic.tex:68` | 300 GPU-h, USD 340--820, phase split of hours | 1,067--1,280 GPU-h; Core run USD 420--580; Full run USD 900--1,200. | Current matrix and current planning envelopes; the old phase split was not measured. | verified |
| 26 | `5.sic.tex:15` | "Python 3.11 was chosen..." | "The Gate 0 environment used Python 3.12.3; the repository requires Python 3.10 or newer." | Gate 0 actually used 3.12.3; the old text conflicted with the run record. | verified |
| 27 | `5.sic.tex:22` | "FP8 support from PagedAttention" | "PagedAttention manages KV-cache memory... the Blackwell FP8 path supplies throughput..." | FP8 is a GPU/vLLM capability, not a PagedAttention feature. | verified |
| 28 | `5.sic.tex:24` | "BM25... like sentence-transformer, it only uses surface features..." | "BM25 scores lexical overlap rather than semantic relevance; the cross-encoder is an optional reranker..." | The original conflated lexical and semantic scoring. | verified |
| 29 | `5.sic.tex:24` | "The web dashboard is served using FastAPI..." | "The web dashboard is planned with FastAPI..." | No dashboard is implemented. | narrowed |
| 30 | `3.design.tex:53` | "The system... majority vote plays no part" (also `3.design.tex:20`) | Weighted plurality; majority logged as baseline. | Same as item 15. | narrowed |
| 31 | `4.implementation.tex` (whole chapter) | Stub with empty sections. | Full implementation and validation chapter: environment, pipeline, P0 changes, test suite, Gate 0, limitations, reproducibility. | Empty chapter while the abstract claimed results. | verified |
| 32 | `6.conclusion.tex` (whole chapter) | Stub with empty sections. | Summary, what was and was not shown, limitations, future work. No efficacy claim. | Empty chapter; required a bounded conclusion. | verified |

---

## 2. Claim-evidence map

| Claim in the report | Evidence | Status |
|---|---|---|
| Gate 0: 10/10 debates, 3/3 rounds, 90/90 non-empty positions | `experiments/gate0/README.md` §2, §7.1 | verified |
| Gate 0: 3,708.1 s total, 370.8 s mean, 21.5 s stdev, 334.8/404.4 s fastest/slowest | `experiments/gate0/README.md` §7.3 | verified |
| Gate 0: 275,668 characters; 5/30 Ministral generations untagged | `experiments/gate0/README.md` §7.1, §7.2 | verified |
| Gate 0: approximately USD 4.29 including ingress | `experiments/gate0/README.md` §9 | verified |
| 514 passing tests | P0 release `7f2c11f`; `experiments/p0/WAVE2.md` ("pytest 514") | verified |
| P0 gate 13 passed, 0 failed, 0 pending | `experiments/p0/WAVE2.md`; `p0_gate.py` strict run, 2026-11-09 | verified |
| Matrix: 4 arms × 3 datasets × 2 seeds = 24 rows; 1,280 GPU-h conservative, 1,067 GPU-h per-dataset caps | `trustcal/configs/experiments.yaml`; `PRE_REGISTRATION.md` v1.0; P0 gate check 13 | verified |
| Six-arm target adds B8-placebo and B8-oracle through WP-18 | `PRE_REGISTRATION.md` §2; roadmap WP-18 | verified |
| Final stack: Qwen3.6-27B-FP8 26.0GB, Gemma 4 26B-A4B FP8 28.67GB, Mistral Small 3.2 24B AWQ 15.06GB; total 69.73GB | `trustcal/configs/models.yaml` final phase | verified (sum of pinned weights) |
| Development stack: RTX A6000 48GB, Python 3.12.3, PyTorch 2.11.0, vLLM 0.29.1rc1.dev128 | `experiments/gate0/README.md` §3-4 | verified |
| Trust guarantees: min ≥ floor, sum = 1, ceiling ≤ max(c,1/N), neutral identity, verbosity invariance | `trust/update.py`; P0 gate checks 5-6 | verified |
| Final-position trust: closing pass and `trust_for_positions` / `trust_status` | `experiments/p0/WP-03b.md`; `orchestrator/debate.py` | verified |
| Options: 5 questions × 20 seeds; every option exactly once; gold letters vary | P0 gate check 3 output | verified |
| Parser: 50/50 exact; notation and unit probes | P0 gate check 4 output | verified |
| Eight endpoints on six records | P0 gate check 9 output | verified |
| Eight datasets pinned; `answer_type` preserved | P0 gate check 10 output | verified |
| Claim routing: bio → PubMed + S2; math → arXiv + S2 | P0 gate check 11 output | verified |
| Manifest/resume: mismatch refused, identical accepted | P0 gate check 12; `manifest.py` | verified |
| Runner record adapter carries `manifest_hash`, `final_answer`, and trust-field copies | `trustcal/src/trustcal/runner.py`; `experiments/p0/WP-04.md` | verified (wired in P0 release) |
| Final stack not smoke-tested | `trustcal/IMPLEMENTATION_STATUS.md`; `models.yaml` comments | verified status |
| Verifier human audit not done; lexical default | `trustcal/IMPLEMENTATION_STATUS.md` | verified status |
| Live retrieval APIs not exercised by tests | `trustcal/IMPLEMENTATION_STATUS.md` | verified status |
| Code MIT licence | `LICENSE` at the repository root (MIT, Copyright 2026 Team Phantom Devs) | verified |
| Core run USD 420--580; Full-run top-up USD 900--1,200 | `docs/GLOSSARY.md`; `docs/agent/03_EXPERIMENT_PLAN.md` | verified planning values |
| A100 80GB at USD 1.78/hour | Earlier report text only; not re-verified | placeholder — author estimate |
| "about 77 billion parameters" for the final trio | Approximate from model names (27 + 26 + 24) | placeholder — approximate, not independently verified |

---

## 3. Removed or narrowed claims

**Removed**
- "Our proposed framework produced fewer hallucinated answers than competing frameworks." No comparative run; no hallucination metric.
- "Currently, there is no mechanism within any debate system..." False absolute.
- "all surviving claims are linked back to their originating passages." Unverifiable claims have no supporting passage.
- "the selected model." The output is an answer, not a model.
- "the majority vote plays no part in it." Majority voting is a control and is logged.
- "300 GPU-hours... energy usage remains very-low." Stale compute and no energy measurement.
- "incremental level of innovation." Self-deprecating label; replaced with a scoped contribution statement.

**Narrowed**
- "tested on GPQA and MMLU-Pro" → Gate 0 GPQA only; comparative matrix planned.
- "eliminate sycophancy" → "test whether evidence-weighted trust reduces sycophantic collapse."
- "none of the prior studies" → "none of these studies combines..." and "we are not aware of..."
- "iMAD addresses cost rather than correctness" → "primarily targets cost; also reports accuracy gains."
- "seven attributes" → "six of seven; P6 not covered."
- "six program outcomes all addressed" → "six of twelve; remaining six scheduled for FYDP II/III."

---

## 4. Figures and captions

The report uses three figures: `fig-pipeline.png` (Introduction), `fig-context.png` (Design), and `fig-dataflow.png` (Design). The PNG files were not edited, deleted, or regenerated by this work. All three files were present at compile time.

| Figure | Caption change | Surrounding text change |
|---|---|---|
| `fig-pipeline.png` | Now names seeded option rendering, claim decomposition, claim-domain retrieval, verifier labels, logit → softmax → simplex projection, one-shot injection, and final trust vector. | Introduction methodology now states the same sequence and limits "tested" to Gate 0. |
| `fig-context.png` | Now names questions + rendered options, three agents, domain routing to PubMed/arXiv/S2/OpenAlex, verifier labels, trust vector, and the result package. | Design requirements now use claim-domain routing, not agent-to-source assignment. |
| `fig-dataflow.png` | Now names option rendering, debate state, claim decomposition, domain routing, verifier labels, simplex trust update, one-shot injection, and weighted aggregation. | Data-flow prose now says the final vector is computed from the final positions. |

**Caveat:** the PNG content was not visually inspected against the new captions. The figure agent is regenerating them at 600+ DPI. If a regenerated figure does not show the named elements, update the caption or the figure before submission.

---

## 5. Unresolved numbers, citations, and placeholders

| Item | Status | Action |
|---|---|---|
| 514 tests | P0 release (`7f2c11f`); the audit itself was written at `8417dc7` (478+). | Re-run `pytest` in `trustcal/` only if the code changes; update the number if it differs. |
| A100 80GB at USD 1.78/hour | Author estimate from the earlier draft; not re-verified against a current provider. | Verify or replace with a dated Vast.ai/RunPod quote. |
| "about 77 billion parameters" | Approximate from model names; not independently counted. | Verify from model cards if the exact parameter count matters. |
| MIT licence | `LICENSE` is present at the repository root (MIT). | No action; keep the licence with the release. |
| Final-stack smoke test | Not run. | Run `smoke_test.py --phase final` on the 96GB stack before the matrix. |
| Verifier human audit | Not run. | Complete 150--200 pairs, two annotators, balanced accuracy and κ. |
| B8-no-trust and B8+injection | Landed in the P0 release; gate 13/13. | No action; the remaining slice is WP-18 (placebo/oracle). |
| Runner record adapter | Wired in the P0 release (`manifest_hash`, `final_answer`, trust-field copies). | Verify a sample record before the paid run. |
| `Core run` terminology | Core v1.0 is the four-arm 24-row matrix. The earlier "4 arms + oracle" description is superseded; B8-oracle belongs to the six-arm Full target under WP-18. | Keep the Core/Full and four-arm/six-arm distinctions in the final version. |
| Figure content vs captions | PNGs not visually verified. | Check after the figure agent's 600+ DPI regeneration. |

---

## 6. Compile and verification

**Command:** explicit pdfLaTeX sequence from `FYDP_Summer/`, matching Overleaf:

```
pdflatex -interaction=nonstopmode -halt-on-error fydp.tex
bibtex fydp
pdflatex -interaction=nonstopmode -halt-on-error fydp.tex
pdflatex -interaction=nonstopmode -halt-on-error fydp.tex
```

**Engine:** pdfTeX 3.141592653-2.6-1.40.29 (TeX Live 2026). No XeLaTeX, LuaLaTeX, `fontspec`, `unicode-math`, shell-escape, or engine-specific package was added.

**Result:** each pdfLaTeX pass exited 0; BibTeX exited 0. The current full-project build is **68 pages with 80 cited works**; the audit-time build was 58 pages. 0 errors, 0 undefined references, 0 undefined citations, 0 missing figure files.

**Warnings:** the current build has 14 overfull `\hbox` warnings and 108 underfull `\hbox` warnings; the audit-time build had 6 and 84. The overfull boxes are mostly title, acknowledgement, and long table lines. The underfull boxes are mostly narrow table cells; none prevents compilation.

**Repository checks:** `git diff --check` passes (line-ending warnings only). No generated `.aux`, `.log`, `.pdf`, `.bbl`, `.out`, `.toc`, `.lof`, or `.lot` files were added or modified in the commit.
