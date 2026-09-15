# Title Rationale

**Title:** Trust-Calibrated Multi-Agent Scientific Deliberation for Mitigating Sycophantic Consensus in LLM Reasoning

This note explains each part of the title and why that word was chosen. It answers the common review questions, in particular why the title says "Scientific" and why it says "Deliberation".

## Trust-Calibrated

**Meaning.** Every agent's influence is set by a score that is adjusted against external evidence. The raw score rises with supported claims and falls with contradicted claims. The raw scores then pass through a softmax, a clamp to the interval [0.1, 0.9], and a renormalization each round.

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

## One-line answer for a review or defense question

The title names the mechanism (trust-calibrated, multi-agent, deliberation), the problem (sycophantic consensus), the scope (scientific reasoning with LLMs), and the outcome (mitigation). Scientific is the domain where an external evidence corpus and objective ground truth exist at the same time, and those two things are exactly what evidence-grounded trust calibration requires.
