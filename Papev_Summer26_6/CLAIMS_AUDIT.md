# Claims audit — journal/preprint claims-accuracy pass

**Date:** 9 November 2026
**Branch:** `docs/journal-claims`
**Base (historical):** `f777852` (`origin/feat/p0-hardening`, WP-14 merged)
**Manuscript:** `Papev_Summer26_6/cas-sc-template.tex`
**Companion files:** `Papev_Summer26_6/STATUS.md`, `Papev_Summer26_6/cas-refs.bib`

> **Historical record (audit of the manuscript at `f777852`).** The current release base is `main` = `dev` = `2ae56a3` (P0 release `7f2c11f`); the P0 gate is 13/13; 514 tests at the P0 release and 523 in the current suite. The manuscript now records the optional appendix-only B7 ceiling: three GPT-6 Luna samples per question, mean single-call accuracy with a confidence interval, and a three-sample majority. The old-to-new table below is retained as the historical audit of the pre-release text; only rows that state a current status are updated, and those updates are marked in the row text.

## Mode and authorship rung

| Work | Mode | Rung | Note |
|---|---|---|---|
| Existing prose (abstract, introduction, method, experiment, conclusion) | Mode 1 — edit/polish | B — author wrote, agent edits | Meaning and claim strength preserved except where a claim was false; every change is listed below. |
| New implementation-status text (Related Work, Answer Rendering, Boundary Conditions, Section 5, Declarations) | Mode 2 — project-grounded drafting | C — agent drafts from project evidence | The authors must verify and revise this text and confirm the venue's AI-use disclosure policy before submission. |
| This audit | Mode 4 — audit | — | Old-to-new findings and a claim-evidence map. |

The skill's disclosure reminder applies at rung C: the authors should check their institution's and target venue's AI-use policy and put the drafted text in their own words where possible.

## Scope

The pass makes the preprint honest about the current P0 implementation. It is **not** a results paper. No efficacy result is claimed. The manuscript keeps the CAS/Elsevier template and structure; a full TACL conversion is a later task.

The P0 facts used in the text are:

- Gate 0: 10/10 debates, 3/3 rounds each, 90/90 non-empty positions, 370.8 s mean, 3,708.1 s total.
- Tests: 523 current; 514 at the P0 release. The audit was written against 478; `experiments/p0/WAVE2.md` at `f777852` records 465.
- P0 gate: 13 passed, 0 failed, 0 pending at the P0 release (11 passed and 2 pending when this audit was written).
- Matrix: 24 rows (4 arms x 3 datasets x 2 seeds), 1,280 GPU-h conservative gate, `PRE_REGISTRATION.md` v1.0.
- Not yet: verifier human audit, EG-SSS, 24-item calibration batch, WP-18 placebo/oracle slice, final-stack smoke, and the paid Core-run matrix.

## Old -> new table

| # | Location | Old claim (abridged) | New text (abridged) | Reason |
|---:|---|---|---|---|
| 1 | Abstract | "Currently, there is no mechanism within any debate system to check an individual agent's assertions against outside scientific evidence..." | "Recent systems already check claims against retrieved evidence and reweight agent influence, so the open question is not whether evidence or trust can be used. The open question is when claim-level evidence-derived trust changes the collective outcome..." | The absolute is false: GAVEL, DebateCV, TERA-RAG, R2-MAD and others already do adjacent things. The gap is reframed as measurement and boundary conditions. |
| 2 | Abstract | "Our proposed framework produced fewer hallucinated answers than competing frameworks..." | Removed. Replaced by implementation status and "This version makes no claim that the mechanism reduces sycophantic collapse." | No efficacy run exists; the past-tense result claim was unsupported. |
| 3 | Abstract | "...because all surviving claims are linked back to their originating passages of scientific evidence." | Removed. | Unverifiable claims survive without citations, and the paper does not measure citation faithfulness yet. |
| 4 | Abstract | "The system returns both the selected model and supporting citations for that model." | Removed. | Wrong object: the system returns an answer and citations, not a selected model. |
| 5 | Abstract | "The performance ... is evaluated via four metrics: answer accuracy, consensus collapse, minority preservation, and evidence calibration." | "A pre-registered evaluation on GPQA-Main and MMLU-Pro STEM ... is specified but not yet run." | The four-metric efficacy claim mixed a planned evaluation with completed evidence. ECR is no longer a primary target. |
| 6 | Abstract | No boundary theory. | Added the four boundary conditions: equal-weight degeneracy (R2), verification ceiling q*, redundancy boundary rho*, shared-error floor. | The abstract must state the design rationale that the paper actually uses. |
| 7 | Introduction, paragraph 1 | "The use of multi-agent debate will reduce the risk of providing incorrect information." | "Multi-agent debate can improve factuality over a single pass, but it does not guarantee a correct collective answer." | Removed an unsupported causal guarantee. |
| 8 | Introduction, paragraph 1 | "When this occurs, it is referred to as sycophantic consensus." | "We call this event sycophantic collapse: a correct agent abandons its answer under pressure without decisive new evidence." | "Sycophantic consensus" is not a standard term; the paper now defines its own operational term. |
| 9 | Introduction, paragraph 3 | "...none of the systems evaluate an agent's claims against evidence while the debate is occurring." | "Recent work also checks claims against retrieved evidence, but it does not tie that evidence to a bounded per-agent trust weight inside the debate. The gap is therefore one of measurement and boundary conditions rather than the absence of a mechanism..." | Replaced a false absence claim with a scoped measurement gap. |
| 10 | Introduction, paragraph 3 | "Outcome provides a reproducible framework that reduces consensus collapse, preserves a correct minority more often than previous methods, maintains stable accuracy rates for answers, and provides a calibrated trust signal." | Removed; replaced by "This paper reports the design and the P0 implementation status; it does not report efficacy results." | No results exist; every clause was an efficacy claim. |
| 11 | Introduction, new subsection | No dedicated related-work differentiation. | Added "Related Work and Positioning" with three lines: in-debate reweighting (DebUnc, R2-MAD, To Trust or Not), claim-level evidence (GAVEL, DebateCV, TERA-RAG), wrong-majority pressure (ConsensAgent, Minority Sentinel, Peacemaker). | The manuscript must cite and differentiate the 2025-26 closest papers. No "first/none" absolutes remain. |
| 12 | Proposed Method, Overview | "...the final answer is determined via a weighted average of the positions of the agents." | "The final answer is the trust-weighted plurality of the final positions." | The aggregation is a weighted plurality, not a weighted average. |
| 13 | Proposed Method, new subsection | No options/parser description. | Added "Answer Rendering and Scoring": seeded per-question option permutation, options in every MCQ prompt, free-text block, answer-span parser, 50-case corpus, parser version stored. | P0-0 and P0-1 are implemented and are prerequisites for every endpoint. |
| 14 | Proposed Method, Claim Decomposition | "A claim that no source can verify is marked unverifiable and is excluded from the trust update..." | "...contributes neither a supported nor a contradicted count to the trust update." | The operator normalizes by claims checked; "excluded" implied the claim leaves the denominator. The new wording matches the count semantics. |
| 15 | Proposed Method, Retrieval | "The three agents do not share one retrieval source. Agent one sends its claims to PubMed, agent two to arXiv, and agent three to the Semantic Scholar Graph API." | "The retriever routes each claim by its domain rather than by the identity of the agent that produced it. Biomedical and clinical claims query PubMed and Semantic Scholar; physics, chemistry, mathematics, and computer-science claims query arXiv and Semantic Scholar..." | The old agent-to-source assignment is a confound and no longer describes the P0 implementation. |
| 16 | Proposed Method, Retrieval | "Every claim then receives one of four verdicts, namely supported, contradicted, unverifiable, or contested." | "A verifier interface maps each claim and its passages to one of three labels: supported, contradicted, or unverifiable." | The verifier interface defines three labels; "contested" is not implemented. |
| 17 | Proposed Method, Trust Update | "S(t+1) = S(t) + alpha V - beta H"; "softmax -> clamp [0.1, 0.9] -> renormalize"; "the final vote is still a weighted random selection". | Log-domain accumulation with support/harm normalized by n_claims, one softmax, then Euclidean projection onto the floor/ceiling simplex. | The old order violated the floor/ceiling and was not a no-op under neutral evidence; the new operator is the implemented one. |
| 18 | Proposed Method, Trust Update | "The bounded trust update equations ... are solely based on the number of votes each agent receives." | Removed; the operator is defined from supported/contradicted claim counts. | The operator is evidence-driven, not vote-driven. |
| 19 | Proposed Method, Trust Update | "The clamp ... ensures that no agent is muted because its weight is set to zero ... no single agent monopolizes the discussion..." | "The projection guarantees min T_i >= f and sum T_i = 1. The ceiling is relaxed to 1/N only when Nc < 1." | The clamp plus renormalization did not actually enforce the two-sided bound; the projection does, with one stated exception. |
| 20 | Proposed Method, new subsection | No boundary analysis. | Added "Boundary Conditions": R2 equal-weight degeneracy, R4 verification ceiling q*, R6 redundancy boundary rho*, shared-error floor. | The abstract and evaluation plan depend on these conditions. They are labelled design analysis, without proof and untested in this version. |
| 21 | Proposed Method, Deliberation Protocol | "Each round ... will call the model approximately ten times. The first or third time ..."; "This expert consensus will contradict..." | "In the three-agent, three-round configuration, a debate makes nine model calls..."; injection delivered once between rounds one and two. | Correct call count; one-shot injection matches P0-9. |
| 22 | Proposed Method, Aggregation | "Only the weighted trust ... is considered; the unweighted headcount is ignored. Therefore, a small group ... can 'outvote' an incorrect larger group." | "This is a weighted plurality ... When all weights are equal, Equation 5 reduces to the majority rule ... the trust layer changes the outcome only when the weights differ." | R2: equal weights reduce to majority. The old sentence overstated what the aggregation can do. |
| 23 | Experiment intro | "The statistical analysis of the results appears with the results..." | "The planned statistical analysis appears with the implementation status..." | Section 5 no longer reports results. |
| 24 | Datasets | "The evaluation uses five public question sets..."; BrokenMath 504 with 183 final-answer items; "retained roughly 60-70% of each adversarial set"; "main matrix draws 1,000 questions per dataset". | Three public sets plus planned EG-SSS; BrokenMath/BrokenArXiv are proof-only (451/451 and 87/87) with 0% answer-type retention and are excluded from the primary matrix; caps are 400/400/200, two seeds. | The old dataset description contradicted the dataset audit and the P0 configuration. |
| 25 | Experimental Procedure | "B1 and B2 run without debate, B3 and B4 run the debate loop, and the proposed system runs the debate loop with claim verification..." | Four conditions: B3 (no retrieval), B4-matched (retrieval + majority), B8-no-trust (retrieval + trust disabled), B8 (trust). Natural pressure is a strict 2/3 wrong majority. | The current matrix is four arms, not the old B1-B10 ladder. |
| 26 | Parameter Configuration | "The trust update runs after every round in the fixed operator order softmax, clamp, and renormalize. Every condition runs with three seeds... alpha and beta are checked by a grid search." | alpha=0.5, beta=0.3, floor=0.1, ceiling=0.9; two seeds; operator applied once per revision round from the preceding positions; values fixed, not tuned on outcomes. | The old order and seed count are wrong; the grid search is not in the current plan. |
| 27 | Baselines | "ten baselines"; "B9, a reimplementation of iMAD"; "B10, a reimplementation of ConsensAgent"; "B9 and B10 ... carries the main novelty claim." | Four conditions; B9/B10 are approximations (iMAD-style, ConsensAgent-style) with a fidelity note; the primary claim does not rest on beating them. | The implementations are not faithful, and the current matrix does not include them as primary comparisons. |
| 28 | Metrics | "Four metrics ... accuracy, consensus collapse, minority preservation, evidence calibration"; ECR target >0.80. | Final accuracy and CMR are confirmatory; CCR-0, CCR-E, MPR-weighted and ARR are descriptive; trust AUROC and Brier are secondary; ECR is not used in any primary claim. | ECR is anti-correlated with correctness; the valid endpoints are implemented in `eval/endpoints.py`. |
| 29 | Injection Protocol | "The Protocol had been validated prior to the execution of the Pilot. Samples of forty random questions were annotated..." | "The protocol specifies a validation step before use ... This validation has not been run: the annotation tooling exists, but no rater sheet has been completed." | No validation run exists; the old past-tense claim was false. |
| 30 | Results (whole section) | Expected outcomes, four-metric expectations, ECR >0.80, two placeholder tables (comparison and ablation). | Section renamed "Implementation Status and Planned Evaluation"; Gate 0, 478 tests, 11/13 gate, known gaps, pre-registered 24-run matrix, planned statistics, limitations. No efficacy claim. | The matrix has not run; every expected table and sentence was a placeholder or an efficacy claim. |
| 31 | Statistical Analysis | "Each condition runs with three seeds..."; "across the three seeds". | Two seeds; exact McNemar on seed 1, paired bootstrap, seed-2 replication, mixed-effects sensitivity, Holm adjustment. | Matches `PRE_REGISTRATION.md` v1.0. |
| 32 | Discussion of Key Findings | "The pilot shows ... the trust update receives usable verdicts"; "If it does, a correct, evidence-backed minority can outweigh..." | Replaced by "Limitations of the Current Evidence": the evidence supports only the loop, the stack, and the tests. | The old discussion inferred a mechanism effect that was never measured. |
| 33 | Conclusion | "The expected findings are a lower collapse rate, a higher minority-preservation rate, and a calibrated trust signal..."; "The significance is that the mechanism needs no fine-tuning..." | Engineering evidence only; no efficacy claim; next steps are verifier wiring, final-position trust, B8-no-trust and injection arms, verifier audit, and the matrix. | Removed expected results and reframed the contribution as design plus protocol. |
| 34 | Declarations, Data availability | "Data will be made available on request to the corresponding authors." | "We do not redistribute benchmark datasets... For gated or non-redistributable datasets we release dataset identifiers, revision hashes, and download scripts only. EG-SSS will be released under CC BY 4.0 when it is frozen." | The code exists in the project repository; "on request" is inconsistent with a public artifact, and dataset licences do not permit redistribution. |
| 35 | Declarations, Code availability | "The pipeline ... will be released in a public repository on publication of the results." | "The pipeline, configuration files, prompts, and analysis scripts are released under the MIT license in the project repository. Model weights are not redistributed." | The code exists now; the release terms are stated. |
| 36 | Declarations, Ethical approval | "The study ... raises no human-subject concerns. The annotation step ... was carried out by the authors themselves and required no external ethical approval." | "No human-subjects data are collected. The planned annotation ... will be performed by the authors. If external annotators are recruited, the team will obtain institutional approval and informed consent..." | The old text asserted a completed ethics determination that the project does not have. |
| 37 | Declarations, new paragraph | No dual-use or abstention statement. | Added "Dual-use and abstention": fabricated consensus is evaluation-only; the framework is a decision aid; unverifiable claims do not raise trust; answer-level abstention is not yet implemented. | Required by the claims audit and the skill's ethics check. |
| 38 | Figures | Captions described the old pipeline (softmax/clamp/renormalize, source-partitioned retrieval, "contested", ECR). | Captions now describe options/shuffle, claim-domain routing, three verifier labels, logit -> softmax -> simplex projection, one-shot injection, and the trust-weighted plurality. | The figure agent is regenerating the PNGs; a caption must not assert what the image does not show. |
| 39 | Bibliography | No entries for R2-MAD, TERA-RAG, To Trust or Not, GAVEL, DebateCV. | Added `jin2026r2mad`, `truong2026terarag`, `he2026trust`, `xu2026gavel`, `he2026debatecv`. | Required to support the Related Work differentiation. Metadata was verified online (see below). |

## Claim-evidence map

| Claim in the manuscript | Evidence | Status |
|---|---|---|
| Gate 0: 10/10 debates, 3/3 rounds, 90/90 non-empty positions, 370.8 s mean, 3,708.1 s total | `experiments/gate0/README.md` (result summary, measurements) | Verified |
| Fallback claim extractor used in 5 of 30 Ministral generations | `experiments/gate0/README.md` (Phase-1 implication) | Verified |
| 514 tests pass | P0 release `7f2c11f`; `experiments/p0/WAVE2.md` | Verified at P0 release; re-run `pytest` only if the code changes |
| P0 gate 13 passed / 0 failed / 0 pending | `experiments/p0/WAVE2.md`; `p0_gate.py` strict run, 2026-11-09 | Verified |
| Matrix 24 rows, 4 arms x 3 datasets x 2 seeds | `trustcal/configs/experiments.yaml`; `experiments/p0/WP-14.md` (dry run) | Verified |
| Conservative budget 1,280 GPU-h (9,600 debates x 8 min) | `PRE_REGISTRATION.md` section 5; `experiments/p0/WP-14.md`; gate check 13 | Verified |
| `PRE_REGISTRATION.md` v1.0, dated 9 November 2026 | `PRE_REGISTRATION.md` header | Verified |
| alpha=0.5, beta=0.3, floor=0.1, ceiling=0.9, max_claims=8, top_k=3 | `trustcal/src/trustcal/trust/settings.py` | Verified from code |
| 3 rounds, temperature 0.7, 1,024-token cap | `trustcal/src/trustcal/config.py`; `trustcal/src/trustcal/runner.py`; `trustcal/src/trustcal/preflight.py` | Verified from code |
| GPQA-Main 448 items, 400 sampled; MMLU-Pro STEM 6,696, 400 sampled; HLE 200; EG-SSS 180 not built | `trustcal/configs/datasets.yaml`; `PRE_REGISTRATION.md` section 3 | Verified from config; EG-SSS is planned |
| BrokenMath 451 proof items; BrokenArXiv 87 proof items; 0% answer-type retention | `docs/agent/00_START_HERE.md` warning 17; `trustcal/configs/datasets.yaml` appendix-only roles | Verified from the dataset audit |
| Verifier interface has lexical, cross-encoder, NLI, LLM-judge implementations; lexical is the default | `trustcal/src/trustcal/retrieval/verifier.py`; `trustcal/IMPLEMENTATION_STATUS.md` | Verified from code |
| Verifier is injected into `DebateRunner`; claim counts are passed; final-position trust (`trust_for_positions`) is produced | `trustcal/src/trustcal/orchestrator/debate.py`; `experiments/p0/WAVE2.md` | Verified in P0 release |
| The B8-no-trust and B8+injection paths are wired | `experiments/p0/WAVE2.md`; P0 gate checks 7 and 8 | Verified |
| Final 96 GB stack has not been smoke-tested | `trustcal/IMPLEMENTATION_STATUS.md` (known gaps) | Verified |
| Injection validation (40 items, two annotators, kappa >= 0.75) has not run | `trustcal/INJECTION_PROTOCOL.md`; `trustcal/IMPLEMENTATION_STATUS.md` (human-eval tooling, no raters) | Verified as planned, not executed |
| Code is MIT; EG-SSS will be CC BY 4.0 | `LICENSE` at the repository root (MIT); author instruction for EG-SSS | Verified (MIT file present); EG-SSS licence is planned |
| GPQA is CC BY 4.0; MMLU-Pro and HLE are used under their stated terms | Existing manuscript text; dataset documentation | Inherited; verify against the live dataset cards before submission |

## Citation verification

All five new entries were checked against the publisher or arXiv page on 9 November 2026:

| Key | Verified metadata |
|---|---|
| `jin2026r2mad` | Xuanfa Jin, Zhijian Ma, Yongcheng Zeng, Xinyu Cui, Haifeng Zhang, Jun Wang. "Remember and Reweight: Enhancing Multi-Agent Debate with Experience Memory and Confidence Estimation." Findings of EMNLP 2026; arXiv:2609.03619. |
| `truong2026terarag` | Huyen Ngoc Truong, Thien Le Truong Nguyen, Quang Van Huy Nguyen, Truc Pham Thanh Tran, Minh Anh Hoang, Tran Khanh Dang. "TERA-RAG: Temporal and Epistemic Reliability for Multi-Agent Debate." JCSSE 2026; DOI 10.1109/JCSSE68839.2026.11596782. |
| `he2026trust` | Pengfei He et al. "To Trust or Not to Trust: Attention-Based Trust Management for LLM Multi-Agent Systems." ACL 2026 main; arXiv:2506.02546. |
| `xu2026gavel` | Ruoyu Xu, Gaoxiang Li, Victor S. Sheng. "GAVEL: Evidence-Contract Debate with Mechanized Scrutiny for Provenance-Grounded Fact-Checking." Findings of ACL 2026; DOI 10.18653/v1/2026.findings-acl.1789. |
| `he2026debatecv` | Haorui He et al. "Debating Truth: Debate-driven Claim Verification with Multiple Large Language Model Agents." WWW 2026; DOI 10.1145/3774904.3792993; arXiv:2507.19090. |

Page numbers are omitted for the new entries because they were not available from the pages checked. Add them from the camera-ready proceedings before submission.

## Removed or withdrawn material

- The two placeholder tables (`tab:comparison`, `tab:ablation`) and all their cells.
- The "expected" results paragraph, the "expected findings" conclusion, and the ECR > 0.80 target.
- The claim that the injection protocol had been validated.
- The claim that ten baselines were compared and that B9/B10 carried the novelty claim.
- The claim that 1,000 questions per dataset were drawn and that adversarial retention was 60-70%.
- The "contested" verdict label and the four-verdict description.
- The "weighted random selection" description of aggregation.
- The "selected model" object in the abstract.

## Figure and caption status

The figure agent is regenerating all six canonical PNGs at 600+ DPI. The manuscript keeps the same six filenames. The captions now describe the current mechanism:

- `fig-pipeline.png`: options/shuffle, claim-domain routing, three verifier labels, log-domain trust, simplex projection, trust-weighted plurality.
- `fig-context.png`: unchanged actor/context diagram.
- `fig-claim-example.png`: supported verdict and trust weight increase.
- `fig-trust-detail.png`: normalized verdict counts -> log-domain accumulation -> one softmax -> simplex projection.
- `fig-round-loop.png`: claim-domain retrieval and one-shot injection.
- `fig-dataflow.png`: unchanged data-flow diagram.

**If a regenerated PNG still shows the old softmax -> clamp -> renormalize order, the "contested" label, source-partitioned retrieval, or ECR, do not submit it.** The caption will then be ahead of the image. Re-check each image before submission.

## Remaining placeholders and TODOs

| Item | Status | Action |
|---|---|---|
| 514 tests | P0 release count; the audit was written against 478, and `WAVE2.md` at `f777852` says 465 | Re-run `pytest` only if the code changes; replace the number if it differs |
| Figure captions vs regenerated PNGs | Captions are aligned with the current figures | Open each PNG if it is regenerated and confirm the labels match the caption |
| Code license | `LICENSE` (MIT) is present at the repository root | No action |
| Dataset licenses | Inherited from the old draft | Verify GPQA, MMLU-Pro, HLE, BrokenMath, BrokenArXiv terms against the live cards |
| New bibliography page numbers | Omitted | Fill from the camera-ready proceedings |
| Injection annotator count | Protocol says two; no rater sheet exists | Confirm the protocol and run the kappa check before using injection results |
| `B4-matched` / "source partition" terminology | Config flag is `source_partitioning`; text says "claim-domain retrieval configuration" | Keep the paper's design term; note the config flag in the reproducibility appendix |
| 13/13 gate | Achieved at the P0 release (`7f2c11f`) | Do not reuse the 11/13 count; the remaining slice is WP-18 |

## Where the skill forced a narrowing or removal

1. **"No mechanism exists" was false.** The abstract and introduction now state a measurement/boundary gap and cite five closest systems.
2. **The efficacy claims were removed, not weakened.** No sentence now says the framework "reduces" collapse, "preserves" a minority, or "improves" accuracy. The strongest claim is that the design is implemented to a stated checkpoint.
3. **The abstract no longer reports four metrics.** It reports implementation status and a planned evaluation.
4. **The results section no longer contains expected values.** The placeholders were deleted rather than filled with guesses.
5. **The injection protocol is no longer described as validated.** It is described as specified, with validation pending.
6. **ECR was removed as a primary target.** Trust AUROC and Brier replace it.
7. **B9/B10 are no longer called faithful reimplementations.** They are labelled approximations.
8. **The dataset claims were corrected to the audited facts.** BrokenMath and BrokenArXiv are proof-only and excluded; the 1,000-per-dataset and 60-70% retention claims are gone.

## Compile record

The manuscript was compiled with the explicit pdfLaTeX sequence required for Overleaf parity, from `Papev_Summer26_6/` with TeX Live 2026:

```text
pdflatex -interaction=nonstopmode -halt-on-error cas-sc-template.tex
bibtex cas-sc-template
pdflatex -interaction=nonstopmode -halt-on-error cas-sc-template.tex
pdflatex -interaction=nonstopmode -halt-on-error cas-sc-template.tex
```

Result: all four commands exited 0. Final output: **19 pages with 71 cited works**, **no LaTeX errors**, **no undefined citations**, **no undefined references**, and no missing figures. BibTeX reported 20 warnings, all of the form `empty pages in <key>`; page numbers are omitted for several entries.

Overfull/underfull boxes in the final log:

- Overfull hbox, 117.1 pt, title/author block at `\maketitle` (the long title plus eight authors on one affiliation). This block was not edited in this pass.
- Overfull hbox, 18.7 pt, bibliography URL for MoA.
- Overfull hbox, 18.7 pt, bibliography URL for Liu et al.
- Overfull hbox, 44.2 pt, bibliography URL for Estornell and Liu.
- Underfull hbox, badness 1436, bibliography entry for Wynn et al.
- Underfull hbox, badness 1960, bibliography entry for BrokenMath.

No overfull box is reported in the new prose or the new equations. The final PDF was copied to `out/cas-sc-template.pdf` for inspection. The tracked source PDF was restored, and generated `.aux`, `.log`, `.bbl`, and `.pdf` files are not committed.
