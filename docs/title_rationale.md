# Title Rationale

**Registered FYDP title:** Trust-Calibrated Multi-Agent Scientific Deliberation for Mitigating Sycophantic Consensus in LLM Reasoning

**Paper/site title (2026-11):** The Boundaries of Evidence-Grounded Trust in Multi-Agent Scientific Debate, with a Controlled Benchmark for Sycophantic Consensus

This note explains the registered title and records the paper-title change. The FYDP cover keeps the registered title until the supervisor approves a change; the journal and site use the paper title.

## Why the paper title changed

The registered title promises a mitigation (“for Mitigating”). The paper’s defensible contribution is narrower and more useful: it formalizes **when** evidence-grounded trust helps and when it amplifies a wrong majority, builds a controlled causal benchmark, and tests the sign reversal. “The Boundaries of…” states that contribution without claiming an efficacy result the experiments have not yet measured. “with a Controlled Benchmark for Sycophantic Consensus” names the second contribution and keeps the phenomenon in the title. The title uses “with” rather than a colon, following the course teacher’s formatting preference. “Controlled” is the accurate word while the benchmark is a manipulated stress set; “causal” is reserved for the abstract and results once the estimand and identification assumptions are stated. The question form (“When Does…?”) was considered and rejected for the final paper because a declarative title reads as a stronger, more specific contribution; it remains a reasonable fallback for a workshop version.

This note explains each part of the registered title and why that word was chosen. It answers the common review questions, in particular why the title says "Scientific" and why it says "Deliberation".

## Trust-Calibrated

**Meaning.** Every agent's influence is set by a score that is adjusted against external evidence. The raw score rises with supported claims and falls with contradicted claims. The score is accumulated in log space, then passed through one softmax and a floor/ceiling simplex projection each round. The projection keeps every weight inside [0.1, 0.9] and keeps the weights summing to one.

**Why this word.** It names both the mechanism and its property. "Calibrated" means the score tracks correctness, which is exactly what the Evidence-Calibration Rate (ECR) measures. The word also separates this work from majority voting, where every agent carries equal weight, and from confidence weighting, where the signal is self-reported.

**If removed.** The title would describe ordinary debate with voting, which is the behavior this work replaces.

## Multi-Agent

**Meaning.** Three heterogeneous language models answer the same question, read each other's reasoning, and revise their positions over a small number of rounds.

**Why this word.** A single model cannot be challenged from outside. Different model families reduce correlated errors. Estornell and Liu prove that shared misconceptions lower accuracy as more agents share them, which is the formal reason for using heterogeneous agents instead of copies of one model.

**If removed.** The work would reduce to single-agent self-correction, which is a different problem with different baselines.

## Scientific

**Meaning.** The domain is scientific question answering, where answers can be checked.

**Why scientific questions only.** Four reasons.

1. **Evidence exists.** Claims can be verified against a real literature corpus (PubMed, arXiv, Semantic Scholar). The trust mechanism needs an independent external signal. In opinion, creative, or open-ended domains there is no corpus that can reliably support or contradict a claim, so there is nothing to calibrate against.
2. **Ground truth exists.** GPQA and MMLU-Pro carry objective answers. Accuracy, Consensus-Collapse Rate (CCR), Minority-Preservation Rate (MPR), and ECR can all be measured. Without ground truth, the mechanism cannot be evaluated.
3. **Claims decompose cleanly.** A scientific statement splits into atomic propositions, for example "drug X lowers Y by Z in group G". Retrieval can check each piece. Subjective text does not split this way.
4. **Failure is costly.** A confidently wrong scientific consensus can mislead health, policy, and research decisions. The failure deserves a measured fix rather than a post-hoc patch.

**Scope, not limit.** This is a boundary statement. The same mechanism can extend to legal or medical reasoning where a corpus and ground truth exist. Domains without evidence and objective answers stay outside the scope of the current study.

## Deliberation

**Meaning.** Structured, round-based reasoning where agents present reasons, check them, and revise. Arguments are weighed instead of counted.

**Why not just "debate".** Debate suggests an adversarial contest decided by whoever argues best or loudest, which is the majority-count behavior this study removes. Deliberation matches the actual protocol: positions, claim decomposition, evidence verification, trust update, and revision, followed by a trust-weighted decision. It also mirrors how peer review and expert panels work, which is the scientific process the paper targets.

**If removed.** The title would promise the exact failure mode the work is fixing.

## for Mitigating Sycophantic Consensus

**Meaning.** The target failure is a confident wrong majority that pressures a correct minority into agreement, after which the vote records the wrong answer as consensus (Pitre et al., 2025).

**Why "mitigating".** The claim is honest. The method reduces the failure. It does not claim to remove it.

## in LLM Reasoning

**Meaning.** The setting is inference with large language models. Models run as served inference, with no fine-tuning and no training changes.

**Why "LLM" and not "LLMs".** The study runs three different model families, so a reviewer may ask why the title keeps the singular. The title already carries the number. "Multi-Agent" states that more than one model takes part, and every agent is an LLM. "LLM Reasoning" names the task, not a count of models. The pattern follows "human reasoning" and "machine translation", where the label names the kind of reasoning under study. The plural form would shift the phrase toward a property of a set of models, and the target here is a failure inside the reasoning process. The title also needs no second "multi" modifier. "Multi-LLM Reasoning" is the closest variant, and it would repeat the plurality that "Multi-Agent" already states. Section 3 names the three model families in full.

## One-line answer for a review or defense question

The title names the mechanism (trust-calibrated, multi-agent, deliberation), the problem (sycophantic consensus), the scope (scientific reasoning with LLMs), and the outcome (mitigation). Scientific is the domain where an external evidence corpus and objective ground truth exist at the same time, and those two things are exactly what evidence-grounded trust calibration requires.

For the plural question, the short answer is that "Multi-Agent" already states that several models take part, and "LLM Reasoning" names the task under study.
