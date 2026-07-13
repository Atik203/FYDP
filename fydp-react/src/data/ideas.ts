import type { KpiCard, CoverItem } from './overview';

// We'll represent each idea's sections as rich JSX data inline in the pages
// to keep this file manageable. Here we define the structured metadata.

export interface IdeaMetadata {
  id: number;
  title: string;
  shortTitle: string;
  icon: string;
  domain: string;
  rank: number;
  compositeScore: number;
  novelty: number;
  feasibility: number;
  q1pub: number;
  phdImpact: number;
  risk: number;
  complexity: number;
  targetVenue: string;
  status: 'Recommended' | 'Strong Backup' | 'Consider' | 'High Risk' | 'Lower Novelty';
  docType: string;
  subtitle: string;
  coverItems: CoverItem[];
  kpis: KpiCard[];
  warningCallout?: { title: string; body: string; variant: 'feasibility' | 'gap' };
}

export const ideaMetadata: IdeaMetadata[] = [
  {
    id: 1,
    title: 'Trust-Calibrated Multi-Agent Scientific Deliberation',
    shortTitle: 'Trust-Calibrated Debate',
    icon: '🤖',
    domain: 'Agentic AI / Reasoning',
    rank: 1,
    compositeScore: 4.6,
    novelty: 5, feasibility: 5, q1pub: 5, phdImpact: 5, risk: 4, complexity: 4,
    targetVenue: 'ACL / EMNLP / NeurIPS 2027',
    status: 'Recommended',
    docType: 'FYDP Proposal · Idea 1 of 5 · Rank #1 · Score 4.6 / 5.0',
    subtitle: 'Domain: Agentic AI · LLM Reasoning · Multi-Agent Systems · Trust Calibration',
    coverItems: [
      { label: 'Target Venue', value: 'ACL / EMNLP / NeurIPS 2027' },
      { label: 'Novelty Score', value: '5 / 5' },
      { label: 'Rigor Score', value: '5 / 5' },
      { label: 'Composite Score', value: '4.6 / 5' },
    ],
    kpis: [
      { value: '≥20%', label: 'Sycophancy Reduction Target', variant: 'default' },
      { value: '≥15%', label: 'Accuracy Improvement vs MAD', variant: 'green' },
      { value: '4', label: 'Baselines Compared', variant: 'sky' },
      { value: '3', label: 'Benchmark Datasets', variant: 'amber' },
      { value: '3', label: 'Agent Roles in Pipeline', variant: 'rose' },
    ],
  },
  {
    id: 2,
    title: 'Argumentative Scientific Claim Verification',
    shortTitle: 'Arg. Claim Verification',
    icon: '📋',
    domain: 'NLP / Discourse Graphs',
    rank: 2,
    compositeScore: 4.2,
    novelty: 4, feasibility: 5, q1pub: 4, phdImpact: 4, risk: 5, complexity: 5,
    targetVenue: 'ACL / EMNLP 2027',
    status: 'Strong Backup',
    docType: 'FYDP Proposal · Idea 2 of 5 · Rank #2 · Score 4.2 / 5.0',
    subtitle: 'Domain: NLP · Discourse Parsing · Graph Neural Networks · Fact-Checking',
    coverItems: [
      { label: 'Target Venue', value: 'ACL / EMNLP 2027' },
      { label: 'Novelty Score', value: '4 / 5' },
      { label: 'Rigor Score', value: '5 / 5' },
      { label: 'Composite Score', value: '4.2 / 5' },
    ],
    kpis: [
      { value: '+5%', label: 'Macro-F1 Gain (Hard Claims)', variant: 'default' },
      { value: '≥80%', label: 'Discourse Parser F1 Target', variant: 'green' },
      { value: '3', label: 'Pipeline Stages', variant: 'sky' },
      { value: '4', label: 'Baseline Systems', variant: 'amber' },
    ],
  },
  {
    id: 3,
    title: 'Temporal Knowledge Decay + Dynamic Knowledge Graphs (Chrono-RAG)',
    shortTitle: 'Chrono-RAG',
    icon: '⏱',
    domain: 'NLP / Graph-RAG',
    rank: 3,
    compositeScore: 4.0,
    novelty: 4, feasibility: 4, q1pub: 4, phdImpact: 4, risk: 4, complexity: 4,
    targetVenue: 'ACL / WWW / KDD 2027',
    status: 'Consider',
    docType: 'FYDP Proposal · Idea 3 of 5 · Rank #3 · Score 4.0 / 5.0',
    subtitle: 'Domain: NLP · Knowledge Graphs · Temporal Reasoning · RAG',
    coverItems: [
      { label: 'Target Venue', value: 'ACL / WWW / KDD 2027' },
      { label: 'Novelty Score', value: '4 / 5' },
      { label: 'Feasibility Score', value: '4 / 5' },
      { label: 'Composite Score', value: '4.0 / 5' },
    ],
    kpis: [
      { value: '+15%', label: 'Temporal Accuracy Target', variant: 'default' },
      { value: '−40%', label: 'Temporal Hallucination Rate', variant: 'rose' },
      { value: '>85%', label: 'Temporal Isolation Score', variant: 'green' },
      { value: '3', label: 'Architecture Layers', variant: 'sky' },
      { value: '4', label: 'Benchmark Datasets', variant: 'amber' },
    ],
  },
  {
    id: 4,
    title: 'Neuro-Symbolic Rare Disease NLP',
    shortTitle: 'Rare Disease NLP',
    icon: '🧬',
    domain: 'Healthcare NLP',
    rank: 4,
    compositeScore: 3.6,
    novelty: 4, feasibility: 4, q1pub: 4, phdImpact: 4, risk: 4, complexity: 3,
    targetVenue: 'JAMIA / BioNLP @ ACL 2027',
    status: 'High Risk',
    docType: 'FYDP Proposal · Idea 4 of 5 · Rank #4 · Score 3.6 / 5.0',
    subtitle: 'Domain: Healthcare NLP · Neuro-Symbolic AI · Clinical Informatics',
    coverItems: [
      { label: 'Target Venue', value: 'JAMIA / BioNLP @ ACL 2027' },
      { label: 'Novelty Score', value: '4 / 5' },
      { label: 'Feasibility Score', value: '3 / 5' },
      { label: 'Composite Score', value: '3.6 / 5' },
    ],
    kpis: [
      { value: '+25%', label: 'Top-5 Accuracy vs. LLM', variant: 'default' },
      { value: '~0%', label: 'Reasoning Hallucination', variant: 'rose' },
      { value: '≥75%', label: 'Phenotype Extraction F1', variant: 'green' },
      { value: '6,000+', label: 'Rare Diseases in ORPHANET', variant: 'sky' },
    ],
    warningCallout: {
      title: '⚠ Important Note — Feasibility Score: 3/5',
      body: 'This idea is ranked #4 primarily due to data access constraints (real EHR data requires IRB/HIPAA approval which is infeasible in 12 months) and venue uncertainty (healthcare venues require clinical validation beyond FYDP scope). However, the neuro-symbolic architecture is excellent and this idea has the strongest impact in the healthcare domain. Recommended as a PhD Year 2–3 project rather than a primary FYDP.',
      variant: 'feasibility',
    },
  },
  {
    id: 5,
    title: 'Scientific Verification using Agentic LLMs (StatVerify-Agent)',
    shortTitle: 'StatVerify-Agent',
    icon: '📊',
    domain: 'Agentic AI / Tool Use',
    rank: 5,
    compositeScore: 3.2,
    novelty: 5, feasibility: 3, q1pub: 5, phdImpact: 5, risk: 3, complexity: 3,
    targetVenue: 'NeurIPS / EMNLP / ACM FAccT 2027',
    status: 'Lower Novelty',
    docType: 'FYDP Proposal · Idea 5 of 5 · Rank #5 · Score 3.2 / 5.0',
    subtitle: 'Domain: Agentic AI · Tool Use · Code Generation · Meta-Science',
    coverItems: [
      { label: 'Target Venue', value: 'NeurIPS / EMNLP / ACM FAccT 2027' },
      { label: 'Novelty Score', value: '3 / 5' },
      { label: 'Feasibility Score', value: '3 / 5' },
      { label: 'Composite Score', value: '3.2 / 5' },
    ],
    kpis: [
      { value: '≥70%', label: 'Code Execution Success Rate', variant: 'default' },
      { value: '≥60%', label: 'Statistical Match Rate', variant: 'green' },
      { value: '≥80%', label: 'Error Detection F1', variant: 'sky' },
      { value: '100', label: 'Papers in Evaluation Set', variant: 'amber' },
    ],
    warningCallout: {
      title: '⚠ Important Note — Ranked #5',
      body: 'This idea is ranked lowest because methodological novelty is limited — ReAct agents with code execution were published in 2023 (Yao et al.). The novelty is in the application domain (statistical reproducibility auditing), which is compelling but may not satisfy Q1 reviewers who expect algorithmic novelty. Additionally, the data curation bottleneck (100 papers with manual gold annotations) consumes significant project time. Recommended as a strong workshop paper submission.',
      variant: 'feasibility',
    },
  },
];
