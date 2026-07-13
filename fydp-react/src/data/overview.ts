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

export interface ScoreRow {
  rank: number;
  title: string;
  href: string;
  domain: string;
  status: string;
  statusVariant: 'green' | 'blue' | 'amber' | 'rose';
  score: string;
}

export interface DetailedScoreRow {
  rank: number;
  title: string;
  href: string;
  domainLabel: string;
  domainVariant: 'blue' | 'green' | 'amber';
  summary: string;
  novelty: number;
  feasibility: number;
  q1pub: number;
  phdImpact: number;
  risk: number;
  complexity: number;
  total: string;
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

export interface EvalAxisBox {
  title: string;
  description: string;
}

// ── Overview page data ──────────────────────────────────────────────────────

export const overviewKpis: KpiCard[] = [
  { value: '5', label: 'Research Directions', variant: 'default' },
  { value: '12', label: 'Month Timeline', variant: 'green' },
  { value: 'Q1', label: 'Target Venue', variant: 'sky' },
  { value: '4.6', label: 'Top Composite Score', variant: 'amber' },
  { value: '2', label: 'Recommended Ideas', variant: 'rose' },
];

export const rankedIdeas: ScoreRow[] = [
  {
    rank: 1, href: '/idea/1',
    title: 'Trust-Calibrated Multi-Agent Scientific Deliberation',
    domain: 'Agentic AI / Reasoning',
    status: 'Recommended', statusVariant: 'green',
    score: '4.6',
  },
  {
    rank: 2, href: '/idea/2',
    title: 'Argumentative Scientific Claim Verification',
    domain: 'NLP / Discourse Graphs',
    status: 'Strong Backup', statusVariant: 'blue',
    score: '4.2',
  },
  {
    rank: 3, href: '/idea/3',
    title: 'Temporal Knowledge Decay + Dynamic Knowledge Graphs',
    domain: 'NLP / Graph-RAG',
    status: 'Consider', statusVariant: 'blue',
    score: '4.0',
  },
  {
    rank: 4, href: '/idea/4',
    title: 'Neuro-Symbolic Rare Disease NLP',
    domain: 'Healthcare NLP',
    status: 'High Risk', statusVariant: 'amber',
    score: '3.6',
  },
  {
    rank: 5, href: '/idea/5',
    title: 'Scientific Verification using Agentic LLMs',
    domain: 'Agentic AI / Tool Use',
    status: 'Lower Novelty', statusVariant: 'amber',
    score: '3.2',
  },
];

export const detailedScoreRows: DetailedScoreRow[] = [
  {
    rank: 1, href: '/idea/1',
    title: 'Trust-Calibrated Multi-Agent Scientific Deliberation',
    domainLabel: 'LLM + Agent', domainVariant: 'blue',
    summary: 'Dynamic evidence-grounded trust calibration to mitigate sycophantic consensus collapse during multi-agent deliberation',
    novelty: 5, feasibility: 5, q1pub: 5, phdImpact: 5, risk: 4, complexity: 4, total: '29/30',
  },
  {
    rank: 2, href: '/idea/2',
    title: 'Argumentative Scientific Claim Verification',
    domainLabel: 'NLP', domainVariant: 'green',
    summary: 'Graph-based argument structure modeling over multiple papers to verify and calibrate scientific claims epistemically',
    novelty: 4, feasibility: 5, q1pub: 4, phdImpact: 4, risk: 5, complexity: 5, total: '27/30',
  },
  {
    rank: 3, href: '/idea/3',
    title: 'Temporal Knowledge Decay + Dynamic KG',
    domainLabel: 'NLP', domainVariant: 'green',
    summary: 'Temporal validity scoring and conflict resolution between LLM parametric memory and dynamically retrieved knowledge',
    novelty: 4, feasibility: 4, q1pub: 4, phdImpact: 4, risk: 4, complexity: 4, total: '24/30',
  },
  {
    rank: 4, href: '/idea/4',
    title: 'Neuro-Symbolic Rare Disease NLP',
    domainLabel: 'Health NLP', domainVariant: 'amber',
    summary: 'Ontology-grounded few-shot neural NLP for rare disease identification from clinical text with explainable reasoning chains',
    novelty: 4, feasibility: 4, q1pub: 4, phdImpact: 4, risk: 4, complexity: 3, total: '23/30',
  },
  {
    rank: 5, href: '/idea/5',
    title: 'Scientific Verification via Agentic LLMs',
    domainLabel: 'LLM + Agent', domainVariant: 'blue',
    summary: 'Multi-agent pipeline for autonomous decomposition, retrieval, methodology auditing, and hallucination-guarded verification',
    novelty: 5, feasibility: 3, q1pub: 5, phdImpact: 5, risk: 3, complexity: 3, total: '24/30',
  },
];

export const ganttPhases: GanttPhase[] = [
  { name: 'Phase 0: Planning', duration: 'Sep 2026 (Wk 1–2)', deliverables: 'Supervisor sign-off, environment setup, access provisioning', progress: 100, barVariant: 'teal' },
  { name: 'Phase 1: Literature Review', duration: 'Sep – Oct 2026', deliverables: '30-paper annotated bibliography, baseline MAD sycophancy replication', progress: 90, barVariant: 'default' },
  { name: 'Phase 2: System Build', duration: 'Nov – Jan 2027', deliverables: 'RAG module, trust function, multi-agent loop (v1)', progress: 60, barVariant: 'amber' },
  { name: 'Phase 3: Experiments', duration: 'Feb – Apr 2027', deliverables: 'Full 4-baseline × 3-dataset matrix, ablation studies, 3-seed runs', progress: 40, barVariant: 'amber' },
  { name: 'Phase 4: Analysis', duration: 'May – Jun 2027', deliverables: 'Error analysis, case studies, human evaluation, final metrics', progress: 20, barVariant: 'rose' },
  { name: 'Phase 5: Writing & Submit', duration: 'Jul – Aug 2027', deliverables: 'Paper draft, thesis, peer-review submission, FYDP defence', progress: 10, barVariant: 'rose' },
];

export const milestones: TimelineItem[] = [
  {
    milestone: 'Milestone M1',
    date: 'Oct 2026',
    description: 'Baseline sycophancy rate reproduced on BrokenMath / GPQA ≥ 30% — confirms problem exists in our setup.',
    deliverable: 'Deliverable: Baseline Report (5 pages)',
  },
  {
    milestone: 'Milestone M2',
    date: 'Jan 2027',
    description: 'Trust function implemented; initial results show ≥ 10% sycophancy reduction — validates core hypothesis.',
    deliverable: 'Deliverable: Progress Report to Supervisor',
  },
  {
    milestone: 'Milestone M3',
    date: 'Apr 2027',
    description: 'Full experimental matrix complete across 3 datasets, 4 baselines, 3 seeds with confidence intervals.',
    deliverable: 'Deliverable: Results Dashboard + Ablation Table',
  },
  {
    milestone: 'Milestone M4',
    date: 'Jul 2027',
    description: 'Paper draft submitted to supervisor for review. FYDP thesis first draft complete.',
    deliverable: 'Deliverable: Paper Draft + Thesis Draft',
  },
  {
    milestone: 'Milestone M5',
    date: 'Aug 2027',
    description: 'Venue submission + FYDP final defence.',
    deliverable: 'Deliverable: Submitted Paper + Defence Slides',
  },
];

export const resources: ResourceCard[] = [
  { label: 'Compute', value: '1× A100 80GB (or equiv.)', sub: 'Google Colab Pro / University HPC' },
  { label: 'Base Models', value: 'Qwen-3.5, Mistral Small 4, Phi-4-Reasoning', sub: 'Open-weight, 4-bit quantized via vLLM' },
  { label: 'Frameworks', value: 'LangGraph, AutoGen, PyTorch', sub: 'Open source, no licensing cost' },
  { label: 'Retrieval', value: 'Semantic Scholar API, FAISS', sub: 'Free academic API access' },
  { label: 'Primary Datasets', value: 'BrokenMath, BrokenArXiv, HLE, GPQA', sub: 'Frontier sycophancy benchmarks' },
  { label: 'Estimated Cost', value: '~$200–400 USD', sub: 'Cloud API calls (judge module only)' },
];

export const risks: RiskRow[] = [
  { risk: 'Compute unavailability', likelihood: 'Medium', likelihoodVariant: 'amber', impact: 'High', impactVariant: 'rose', mitigation: 'Use quantized 7–8B models locally; allocate cloud budget early' },
  { risk: 'Sycophancy effect too small to measure', likelihood: 'Low', likelihoodVariant: 'green', impact: 'High', impactVariant: 'rose', mitigation: 'Pre-validate effect size on BrokenMath (known high sycophancy rate) before full experiments' },
  { risk: 'RAG retrieval quality too low', likelihood: 'Medium', likelihoodVariant: 'amber', impact: 'Medium', impactVariant: 'amber', mitigation: 'Cross-encoder reranker; citation-count filtering; domain restriction to biomedicine' },
  { risk: 'Paper rejected (novelty concerns)', likelihood: 'Medium', likelihoodVariant: 'amber', impact: 'Medium', impactVariant: 'amber', mitigation: 'Target workshop (ACL SRW) as a fallback; frame contribution as empirical study' },
  { risk: 'Thesis / paper writing delays', likelihood: 'Low', likelihoodVariant: 'green', impact: 'Medium', impactVariant: 'amber', mitigation: 'Begin writing Phase 3 results immediately; use structured paper template from Month 1' },
];

export const evalAxes: EvalAxisBox[] = [
  { title: 'Axis 1 — Novelty', description: 'Does the idea close an explicit, citable research gap? Does it contribute a new algorithm, architecture, or methodology — not just a new application of known methods?' },
  { title: 'Axis 2 — Methodological Rigor', description: 'Can the evaluation plan yield statistically significant, reproducible results with clear ablation studies, multiple baselines, and proper confidence intervals?' },
  { title: 'Axis 3 — Engineering Complexity', description: 'Does the system address open-ended, ill-defined problems meeting Washington Accord graduate-level standards? Is it more than a pipeline of existing APIs?' },
  { title: 'Axis 4 — Feasibility', description: 'Is the scope honestly achievable in 12 months with ≤ 2×A100 compute, open-weight models, and publicly available datasets — without EHR, legal, or IRB dependencies?' },
];
