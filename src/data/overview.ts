export interface KpiCard {
  value: string;
  label: string;
  variant?: 'default' | 'green' | 'amber' | 'rose' | 'sky';
}

export interface CoverItem {
  label: string;
  value: string;
  href?: string;
}

export interface GanttPhase {
  name: string;
  duration: string;
  deliverables: string;
  progress: number;
  barVariant?: 'default' | 'teal' | 'amber' | 'rose';
}

export interface TimelineItem {
  milestone: string;
  date: string;
  description: string;
  deliverable: string;
}

export interface ResourceCard {
  label: string;
  value: string;
  sub: string;
}

export interface RiskRow {
  risk: string;
  likelihood: string;
  likelihoodVariant: 'green' | 'amber' | 'rose';
  impact: string;
  impactVariant: 'green' | 'amber' | 'rose';
  mitigation: string;
}

// Blueprint §12 — Month-by-Month (Jul 2026 – Apr 2027)
export const ganttPhases: GanttPhase[] = [
  { name: 'Ph 0: Literature & Setup', duration: 'Jul 2026', deliverables: 'Literature freeze, vLLM+LangGraph setup, model ID verification, reproduce vanilla MAD', progress: 0, barVariant: 'teal' },
  { name: 'Ph 1: Injection + Baselines', duration: 'Aug 2026', deliverables: 'Injection protocol (§5.4), B1–B4 baselines, Proposition 1 proof, Month-1 pilot', progress: 0, barVariant: 'default' },
  { name: 'Ph 2: Trust Mechanism Build', duration: 'Sep–Oct 2026', deliverables: 'Claim decomposition, source-partitioned RAG, trust function v1, B5/B6/B9', progress: 0, barVariant: 'amber' },
  { name: 'Ph 2→3: Mid-Project', duration: 'Nov 2026', deliverables: 'Design freeze, dry-run on 1 dataset, FYDP-1 defence preparation', progress: 0, barVariant: 'amber' },
  { name: 'Ph 3a: Main Experiments', duration: 'Dec 2026', deliverables: 'Core conditions × primary datasets × 3 seeds × 95% CI', progress: 0, barVariant: 'rose' },
  { name: 'Ph 3b: Ablations + Scaling', duration: 'Jan 2027', deliverables: '4 ablations, α/β sweep, N∈{2,3,5}, results freeze', progress: 0, barVariant: 'rose' },
  { name: 'Ph 4: Human Eval + Analysis', duration: 'Feb 2027', deliverables: 'n=60 human eval, ECR calibration, failure analysis, buffer month', progress: 0, barVariant: 'default' },
  { name: 'Ph 5: Writing & Submit', duration: 'Mar–Apr 2027', deliverables: 'Thesis + paper drafting, reproducibility package, submission + FYDP-2 defence', progress: 0, barVariant: 'teal' },
];

// Blueprint §12 Gates
export const milestones: TimelineItem[] = [
  {
    milestone: 'Gate 0',
    date: 'Jul 2026',
    description: 'Base debate loop reproduces Du et al. 2023 on GPQA slice. references.bib complete. Month-1 pilot design finalized.',
    deliverable: 'Working MAD reproduction',
  },
  {
    milestone: 'Gate 1 (Go/No-Go)',
    date: 'Aug 2026',
    description: 'κ ≥ 0.75 injection validation. Baseline CCR ≥ 0.30 confirmed. Behavioral-effectiveness pilot executed — trust weight measurably shifts aggregation output on ~20–30 toy questions.',
    deliverable: 'Pilot validated + B1–B4 done',
  },
  {
    milestone: 'Gate 2',
    date: 'Oct 2026',
    description: 'Trust mechanism + source-partitioned RAG + competitor baselines (B5/B6/B9) complete. First CCR/MPR measurement on 1 dataset.',
    deliverable: 'Prototype with first results',
  },
  {
    milestone: 'FYDP-1 Defence',
    date: 'Nov 2026',
    description: 'Mid-project report with design freeze, initial results, and remaining execution plan.',
    deliverable: 'Mid-project report + presentation',
  },
  {
    milestone: 'Gate 3',
    date: 'Jan 2027',
    description: 'Full results freeze with CIs + effect sizes across all conditions and datasets.',
    deliverable: 'Results table + ablations complete',
  },
  {
    milestone: 'Submit + FYDP-2',
    date: 'Mar–Apr 2027',
    description: 'Paper submitted to target venue. FYDP thesis completed. Final defence.',
    deliverable: 'Submitted paper + defence slides',
  },
];

// Blueprint §7 — Models & Tools
export const resources: ResourceCard[] = [
  { label: 'Agent 1', value: 'Qwen3-32B (4-bit)', sub: 'vLLM inference, single A100' },
  { label: 'Agent 2', value: 'Mistral-Small-3.2-24B', sub: 'Different training lineage → genuine heterogeneity' },
  { label: 'Agent 3', value: 'Phi-4-Reasoning', sub: 'Reasoning-specialized, third cognitive style' },
  { label: 'Oracle (B7)', value: 'Gemini 2.5 Pro', sub: 'Upper-bound ceiling only, ~$150–200 budget' },
  { label: 'Reranker', value: 'ms-marco-MiniLM cross-encoder', sub: 'Standard, fast, well-validated' },
  { label: 'Inference', value: 'vLLM', sub: 'Free, fast, multi-model serving' },
  { label: 'Orchestration', value: 'LangGraph', sub: 'State-machine fits round-based debate' },
  { label: 'Retrieval APIs', value: 'PubMed, ArXiv, Semantic Scholar', sub: 'Free academic API access' },
];

// Blueprint §11 — Risk Assessment
export const risks: RiskRow[] = [
  { risk: 'Trust signal doesn\'t change output (Challenge C)', likelihood: 'Medium', likelihoodVariant: 'amber', impact: 'Critical', impactVariant: 'rose', mitigation: 'Month 1 pilot validates before full build — 3–4 day toy run' },
  { risk: 'Retrieval noise degrades evidence quality', likelihood: 'Medium', likelihoodVariant: 'amber', impact: 'Moderate', impactVariant: 'amber', mitigation: 'Cross-encoder reranker + citation-count filter + domain restriction' },
  { risk: 'Reviewers see as incremental over MoA/iMAD', likelihood: 'Low-Medium', likelihoodVariant: 'amber', impact: 'Moderate', impactVariant: 'amber', mitigation: 'B6/B9 direct comparisons; "+X% CCR over iMAD" as headline' },
  { risk: 'Timeline overload (Phase 2)', likelihood: 'High', likelihoodVariant: 'rose', impact: 'High', impactVariant: 'rose', mitigation: 'Use iMAD published numbers for easy conditions; reserve reimplementation for adversarial' },
  { risk: 'iMAD reimplementation fidelity', likelihood: 'Medium', likelihoodVariant: 'amber', impact: 'Moderate', impactVariant: 'amber', mitigation: '~10-day dedicated budget; explicit divergence documentation' },
  { risk: 'Single A100 compute ceiling', likelihood: 'Medium', likelihoodVariant: 'amber', impact: 'Moderate', impactVariant: 'amber', mitigation: '4-bit quantization; core replication targeted at 72 hours' },
];

// Blueprint §8 — Dataset Plan
export interface DatasetRow {
  name: string;
  role: string;
  source: string;
  size: string;
  limitation: string;
}

export const datasets: DatasetRow[] = [
  { name: 'BrokenMath', role: 'Primary adversarial stress test', source: 'INSAIT-Institute (HF)', size: '1,000 QA', limitation: 'Math-focused, may not generalize to broader science' },
  { name: 'BrokenArXiv', role: 'Adversarial, monthly-refreshed', source: 'MathArena', size: '500 QA', limitation: 'Monthly versioning — cite exact snapshot' },
  { name: 'HLE', role: 'Hard scientific reasoning ceiling', source: 'cais/hle', size: '300 QA', limitation: 'Access approval lead time — apply in Phase 0' },
  { name: 'GPQA Diamond', role: 'Stable comparison baseline', source: 'Public', size: '448 QA', limitation: 'Well-known, not adversarial' },
  { name: 'MMLU-Pro (STEM)', role: 'Stable comparison baseline', source: 'Public', size: '12,000 QA', limitation: 'Broad STEM, non-adversarial' },
];

// Blueprint §10 — Failure Handling
export interface FailureRow {
  scenario: string;
  detection: string;
  mitigation: string;
  recovery: string;
}

export const failures: FailureRow[] = [
  { scenario: 'Retrieval returns no evidence', detection: 'Zero passages above relevance threshold', mitigation: 'Broaden query before declaring sparse; mark claim abstained', recovery: 'Stratify results by retrieval-success rate in reporting' },
  { scenario: 'Contradictory evidence retrieved', detection: 'Evidence verdicts conflict at >0.75 relevance', mitigation: 'Flag claim as "contested", report separately', recovery: 'Included as own category in human eval annotation' },
  { scenario: 'All agents hallucinate same way', detection: 'Homogeneous-vs-heterogeneous shows no CCR difference', mitigation: 'Heterogeneous model families (partial)', recovery: 'Diagnosed explicitly in Phase 4 failure analysis' },
  { scenario: 'Trust collapse (all to T_min)', detection: 'Trust variance monitoring across rounds', mitigation: 'Hard clamp floor (0.1) by design', recovery: 'Structurally prevented by Proposition 1 boundedness' },
  { scenario: 'Claim extraction fails', detection: 'Tagged-claim regex/schema validation fails', mitigation: 'Structured output prompting with explicit tags', recovery: 'Fallback LLM-based extraction pass' },
  { scenario: 'API rate limit / downtime', detection: 'HTTP error codes, timeout', mitigation: 'Local caching of prior retrievals', recovery: 'Retry + backoff; OpenAlex fallback' },
  { scenario: 'Context window overflow', detection: 'Token count monitoring before each round', mitigation: 'Cap K=3 rounds; summarize prior rounds', recovery: 'Truncate oldest round detail, preserve trust trajectory' },
  { scenario: 'iMAD reimplementation diverges', detection: 'Manual comparison vs reported results', mitigation: 'Explicit divergence documentation', recovery: 'Treat as honest limitation, not hidden' },
];

// Blueprint §10 — Edge Cases
export interface EdgeCaseRow {
  scenario: string;
  prevention: string;
  fallback: string;
}

// Difficulty ranking §7
export interface DifficultyRow {
  rank: number;
  component: string;
  difficulty: string;
  reason: string;
}
