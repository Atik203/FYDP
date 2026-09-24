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
  href?: string;
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
  { name: 'Ph 0: Literature & Setup', duration: 'Jul–Sep 2026', deliverables: 'Literature freeze, vLLM 3-model serving on the A6000, Gate 0 MAD reproduction — passed 16 Sep 2026 (10/10 debates × 3 rounds)', progress: 100, barVariant: 'teal' },
  { name: 'Ph 1: Injection + Baselines', duration: 'Sep–Oct 2026', deliverables: 'Injection protocol + B1/B3 baselines built and mock-verified; 50-question pilot + κ check, Month-1 behavioural pilot pending GPU runs', progress: 60, barVariant: 'default' },
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
    milestone: 'Gate 0 — achieved 16 Sep 2026',
    date: 'Jul–Sep 2026',
    description: 'Vanilla MAD reproduction (Du et al. 2023) on a GPQA slice: 10/10 debates completed all 3 rounds, no empty positions, mean 370.8 s/debate. Full report in experiments/gate0/.',
    deliverable: 'Working MAD reproduction — done',
  },
  {
    milestone: 'Gate 1 (Go/No-Go)',
    date: 'Oct 2026',
    description: 'κ ≥ 0.75 injection validation. Baseline CCR ≥ 0.30 confirmed. Behavioral-effectiveness pilot executed — trust weight measurably shifts aggregation output on ~20–30 toy questions. (Harness ready; awaiting pilot GPU run.)',
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

// Blueprint §7 — Models & Tools (two-phase strategy)
export const resources: ResourceCard[] = [
  { label: 'Agent 1 (Dev)', value: 'Qwen3.5-9B', sub: 'Small, fast dev iteration on RTX A6000 48GB — served as 4-bit AWQ', href: 'https://huggingface.co/Qwen/Qwen3.5-9B' },
  { label: 'Agent 1 (Final)', value: 'Qwen3.6-27B', sub: 'Full-scale 27B dense, caps flagship MoE in coding', href: 'https://huggingface.co/Qwen/Qwen3.6-27B' },
  { label: 'Agent 2 (Dev)', value: 'Gemma 4 12B', sub: 'Encoder-free 12B, good proxy for 26B behaviour — served as QAT 4-bit', href: 'https://huggingface.co/google/gemma-4-12B' },
  { label: 'Agent 2 (Final)', value: 'Gemma 4 26B A4B', sub: 'MoE (3.8B active), matches 31B quality', href: 'https://huggingface.co/google/gemma-4-26B-A4B' },
  { label: 'Agent 3 (Dev)', value: 'Ministral-3-14B-Instruct', sub: 'Mistral-family 14B — AWQ 4-bit on the A6000 (the official FP8 checkpoint cannot be served on Ampere)', href: 'https://huggingface.co/mistralai/Ministral-3-14B-Instruct-2512' },
  { label: 'Agent 3 (Final)', value: 'Mistral Small 3.2 24B', sub: 'Distinct training lineage from Qwen/Gemma', href: 'https://huggingface.co/mistralai/Mistral-Small-3.2-24B-Instruct-2506' },
  { label: 'Oracle (B7)', value: 'Gemini 3.1 Pro Preview', sub: 'Upper-bound ceiling only, ~$5–7 for full oracle pass' },
  { label: 'Reranker', value: 'ms-marco-MiniLM cross-encoder', sub: 'Standard, fast, well-validated' },
  { label: 'Inference', value: 'vLLM', sub: 'Free, fast, multi-model serving' },
  { label: 'Orchestration', value: 'LangGraph', sub: 'State-machine fits round-based debate' },
  { label: 'Retrieval APIs', value: 'PubMed, ArXiv, Semantic Scholar', sub: 'Free academic API access' },
];

// Blueprint §7 — Two-Phase Model Strategy + Cost Estimate
export interface CostRow {
  phase: string;
  models: string;
  gpu: string;
  rate: string;
  estHours: string;
  totalRange: string;
}

export const costEstimates: CostRow[] = [
  { phase: 'Dev (Ph 0–2)', models: 'Qwen3.5-9B / Gemma 4 12B / Ministral-3-14B', gpu: 'RTX A6000 48GB', rate: '$0.40–0.46/hr', estHours: '300–600', totalRange: '$160–320' },
  { phase: 'Final (Ph 3–5)', models: 'Qwen3.6-27B / Gemma 4 26B / Mistral 24B', gpu: 'RTX PRO 6000 Blackwell 96GB', rate: '$1.10-2.70/hr', estHours: '250–500', totalRange: '$400–800' },
  { phase: 'Total', models: '—', gpu: '—', rate: '—', estHours: '550–1,100', totalRange: '~$560–1,100' },
];

// Blueprint §11 — Risk Assessment
export const risks: RiskRow[] = [
  { risk: 'Trust signal doesn\'t change output (Challenge C)', likelihood: 'Medium', likelihoodVariant: 'amber', impact: 'Critical', impactVariant: 'rose', mitigation: 'Month 1 pilot validates before full build — 3–4 day toy run' },
  { risk: 'Retrieval noise degrades evidence quality', likelihood: 'Medium', likelihoodVariant: 'amber', impact: 'Moderate', impactVariant: 'amber', mitigation: 'Cross-encoder reranker + citation-count filter + domain restriction' },
  { risk: 'Reviewers see as incremental over MoA/iMAD', likelihood: 'Low-Medium', likelihoodVariant: 'amber', impact: 'Moderate', impactVariant: 'amber', mitigation: 'B6/B9 direct comparisons; "+X% CCR over iMAD" as headline' },
  { risk: 'Timeline overload (Phase 2)', likelihood: 'High', likelihoodVariant: 'rose', impact: 'High', impactVariant: 'rose', mitigation: 'Use iMAD published numbers for easy conditions; reserve reimplementation for adversarial' },
  { risk: 'iMAD reimplementation fidelity', likelihood: 'Medium', likelihoodVariant: 'amber', impact: 'Moderate', impactVariant: 'amber', mitigation: '~10-day dedicated budget; explicit divergence documentation' },
  { risk: 'Single 96GB GPU compute ceiling', likelihood: 'Medium', likelihoodVariant: 'amber', impact: 'Moderate', impactVariant: 'amber', mitigation: 'FP8 native on Blackwell; core replication budgeted at 250-500 GPU-hours' },
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
  { name: 'BrokenMath', role: 'Primary adversarial stress test', source: 'INSAIT-Institute/BrokenMath (HF, official)', size: '1,000 QA', limitation: 'Math-focused, may not generalize to broader science' },
  { name: 'BrokenArXiv', role: 'Adversarial, monthly-refreshed', source: 'MathArena/brokenarxiv (HF, official)', size: '500 QA', limitation: 'Monthly versioning — cite exact snapshot' },
  { name: 'HLE', role: 'Hard scientific reasoning ceiling', source: 'cais/hle (HF, official; gated)', size: '300 QA', limitation: 'Access approved (Sep 2026); gated — HF token required' },
  { name: 'GPQA Diamond', role: 'Stable comparison baseline', source: 'Idavidrein/gpqa (HF, official; gated)', size: '198 QA', limitation: 'Well-known, not adversarial' },
  { name: 'MMLU-Pro (STEM)', role: 'Stable comparison baseline', source: 'TIGER-Lab/MMLU-Pro (HF, official)', size: '12,000 QA', limitation: 'Broad STEM, non-adversarial' },
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
