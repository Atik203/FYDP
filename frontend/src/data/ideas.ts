import type { KpiCard, CoverItem } from './overview';

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
  status: 'Recommended';
  docType: string;
  subtitle: string;
  coverItems: CoverItem[];
  kpis: KpiCard[];
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
    docType: 'FYDP Proposal · Idea 1 of 1 · Rank #1 · Score 4.6 / 5.0',
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
      { value: '9', label: 'Baselines Compared', variant: 'sky' },
      { value: '5', label: 'Benchmark Datasets', variant: 'amber' },
      { value: '3', label: 'Agent Roles in Pipeline', variant: 'rose' },
    ],
  },
];
