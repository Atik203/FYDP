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

// Execution plan — P0 (Nov 2026) through paper submission (Dec 2027)
export const ganttPhases: GanttPhase[] = [
  { name: 'Ph 0: Literature & Setup', duration: 'Jul–Sep 2026', deliverables: 'Literature freeze, vLLM 3-model serving on the A6000, Gate 0 MAD reproduction — passed 16 Sep 2026 (10/10 debates × 3 rounds)', progress: 100, barVariant: 'teal' },
  { name: 'Ph 1: P0 Engineering', duration: 'Oct–Nov 2026', deliverables: 'Core wired: options in prompts, parser/scorer, trust simplex projection, verifier interface, claim-domain routing, endpoints, manifest/resume. 514 tests; P0 gate 13/13 passed.', progress: 100, barVariant: 'default' },
  { name: 'Ph 2: Pilot run', duration: 'Dec 2026', deliverables: 'Final-stack 96 GB smoke ($80–120) → WP-18 placebo/oracle → 24-item calibration → verifier audit (150–200 pairs; lexical 0.58 balanced accuracy; target ≥0.75, κ ≥0.60) → 50-question Month-1 pilot → 100–150-question G2 pilot. 3 seeds for the pilot; 2 for the main matrix. G2 decides whether the Core run proceeds.', progress: 0, barVariant: 'amber' },
  { name: 'Ph 3: Core run', duration: 'Jan 2027', deliverables: 'G3 Core run: 4 executable arms (B3, B4-matched, B8-no-trust, B8) × GPQA-Main 400 / MMLU-Pro 400 / HLE 200 × 2 seeds = 24 runs, 1,280 GPU-h. B8-oracle is not a Core arm; EG-SSS is not in Core v1.0 (180 items at the v1.2 benchmark freeze). PRE_REGISTRATION.md v1.0.', progress: 0, barVariant: 'rose' },
  { name: 'Ph 4: Full run + benchmark', duration: 'Feb 2027', deliverables: 'G4/G5 Full target: 6 arms × 3 datasets × 2 seeds = 36 runs at 300 items/dataset, within a 1,440 GPU-h envelope (~10,800 debates if B8-oracle uses gold-answer trust). Adds B8-placebo/B8-oracle via WP-18. If B8-oracle is gold-evidence-only on EG-SSS, 32 runs and recomputed GPU-h. EG-SSS ladder: 180 floor, 300 target, 600 stretch, 800 no-go.', progress: 0, barVariant: 'rose' },
  { name: 'Ph 5: Human Eval + SDT', duration: 'Mar 2027', deliverables: 'Human evaluation / SDT, benchmark annotation, and verifier-audit follow-up.', progress: 0, barVariant: 'default' },
  { name: 'Ph 6: Results Freeze', duration: 'Apr 2027', deliverables: 'Freeze results, CIs, and effect sizes. No new runs or arm changes after the freeze.', progress: 0, barVariant: 'amber' },
  { name: 'Ph 7: Thesis Chapters', duration: 'May 2027', deliverables: 'Write the thesis chapters against the frozen results.', progress: 0, barVariant: 'teal' },
  { name: 'Ph 8: Thesis Submit + Defence', duration: 'Jun–Jul 2027', deliverables: 'Thesis submitted June 2027; defence June/July 2027.', progress: 0, barVariant: 'teal' },
  { name: 'Ph 9: Paper', duration: 'Aug–Dec 2027', deliverables: 'Paper writing and submission after the defence (TACL rolling; EMNLP 2028 fallback).', progress: 0, barVariant: 'default' },
];

// Gates, submissions, and the post-defence paper window
export const milestones: TimelineItem[] = [
  {
    milestone: 'Gate 0 — achieved 16 Sep 2026',
    date: 'Jul–Sep 2026',
    description: 'Vanilla MAD reproduction (Du et al. 2023) on a GPQA slice: 10/10 debates completed all 3 rounds, no empty positions, mean 370.8 s/debate. Full report in experiments/gate0/.',
    deliverable: 'Working MAD reproduction — done',
  },
  {
    milestone: 'P0 engineering gate',
    date: 'Nov 2026',
    description: '514 tests; P0 gate 13/13 passed and released (tags p0-gate, p0-release). Release evidence: 57-pp report, 18-pp journal, 0 undefined references. Core wiring is in place — this is engineering readiness, not an efficacy result.',
    deliverable: 'P0 gate report + runnable matrix — 13/13',
  },
  {
    milestone: 'Pilot run',
    date: 'Dec 2026',
    description: 'Final-stack smoke, WP-18 placebo/oracle, a 24-item calibration, and the verifier audit precede the pilot. The 50-question Month-1 pilot is followed by the 100–150-question G2 pilot. G2 requires baseline CCR ≥0.30, trust AUROC ≥0.65, ≥65% correct-direction changes, and injection κ ≥0.75; if it fails, the project reframes to report the negative result honestly.',
    deliverable: 'G2 pilot-run report',
  },
  {
    milestone: 'Core run',
    date: 'Jan 2027',
    description: 'G3 Core run: 4 executable arms × GPQA-Main 400 / MMLU-Pro 400 / HLE 200 × 2 seeds = 24 runs, budgeted at 1,280 GPU-h. B8-oracle is not a Core arm, and EG-SSS is not in Core v1.0. No efficacy claim is made before the pre-registered analysis.',
    deliverable: 'G3 Core matrix + pre-registered causal contrast (B8 vs B8-no-trust)',
  },
  {
    milestone: 'Full run + benchmark',
    date: 'Feb 2027',
    description: 'G4/G5 Full target: 36 runs at 300 items/dataset within a 1,440 GPU-h envelope, adding B8-placebo/B8-oracle through WP-18 (32 runs and recomputed GPU-h if B8-oracle is gold-evidence-only on EG-SSS). EG-SSS benchmark freeze at 180 items (v1.2); ladder 180 floor, 300 target, 600 stretch, 800 no-go.',
    deliverable: 'Full-run matrix + EG-SSS v1.2',
  },
  {
    milestone: 'Human eval + SDT',
    date: 'Mar 2027',
    description: 'Human evaluation and SDT, benchmark annotation, and the verifier-audit follow-up.',
    deliverable: 'Human-eval + benchmark package',
  },
  {
    milestone: 'Results freeze',
    date: 'Apr 2027',
    description: 'Freeze all results, confidence intervals, and effect sizes. No post-hoc arm or endpoint changes.',
    deliverable: 'Frozen results',
  },
  {
    milestone: 'Thesis chapters',
    date: 'May 2027',
    description: 'Write the thesis chapters against the frozen results.',
    deliverable: 'Thesis draft',
  },
  {
    milestone: 'Thesis submission',
    date: 'Jun 2027',
    description: 'Submit the FYDP thesis in June 2027.',
    deliverable: 'Submitted thesis',
  },
  {
    milestone: 'Defence',
    date: 'Jun–Jul 2027',
    description: 'Defend the thesis in June/July 2027.',
    deliverable: 'Defence slides',
  },
  {
    milestone: 'Paper after defence',
    date: 'Aug–Dec 2027',
    description: 'Write and submit the paper version after the defence; TACL rolling submission, EMNLP 2028 fallback.',
    deliverable: 'Paper submission',
  },
];

// Blueprint §7 — Models & Tools (two-phase strategy)
export const resources: ResourceCard[] = [
  { label: 'Agent 1 (Dev)', value: 'Qwen3.5-9B', sub: 'Small, fast dev iteration on RTX A6000 48GB — served as 4-bit AWQ', href: 'https://huggingface.co/Qwen/Qwen3.5-9B' },
  { label: 'Agent 1 (Final)', value: 'Qwen3.6-27B-FP8', sub: 'Full-scale 27B dense, FP8 on the 96 GB Blackwell card — part of the 69.73 GB pinned Final stack', href: 'https://huggingface.co/Qwen/Qwen3.6-27B' },
  { label: 'Agent 2 (Dev)', value: 'Gemma 4 12B', sub: 'Encoder-free 12B, good proxy for 26B behaviour — served as QAT 4-bit', href: 'https://huggingface.co/google/gemma-4-12B' },
  { label: 'Agent 2 (Final)', value: 'Gemma-4-26B-A4B-FP8', sub: 'MoE (3.8B active), FP8 — part of the 69.73 GB pinned Final stack', href: 'https://huggingface.co/google/gemma-4-26B-A4B' },
  { label: 'Agent 3 (Dev)', value: 'Ministral-3-14B-Instruct', sub: 'Mistral-family 14B — AWQ 4-bit on the A6000 (the official FP8 checkpoint cannot be served on Ampere)', href: 'https://huggingface.co/mistralai/Ministral-3-14B-Instruct-2512' },
  { label: 'Agent 3 (Final)', value: 'Mistral-24B-AWQ', sub: 'Third training lineage, AWQ 4-bit — part of the 69.73 GB pinned Final stack', href: 'https://huggingface.co/mistralai/Mistral-Small-3.2-24B-Instruct-2506' },
  { label: 'Final stack (pinned)', value: '69.73 GB', sub: 'Qwen3.6-27B-FP8 · Gemma-4-26B-A4B-FP8 · Mistral-24B-AWQ — fits one 96 GB GPU' },
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
  { phase: 'Final-stack smoke (Nov 2026)', models: 'Final stack (69.73 GB pinned)', gpu: 'RTX PRO 6000 Blackwell 96GB', rate: '$0.74–1.43/hr', estHours: '—', totalRange: '$80–120' },
  { phase: 'Pilot run (Dec 2026)', models: 'Dev stack', gpu: 'RTX A6000 48GB', rate: 'spot $0.16–0.37/hr', estHours: '—', totalRange: '$50–100' },
  { phase: 'Core run (Jan 2027)', models: 'Dev stack', gpu: 'RTX A6000 48GB', rate: 'spot $0.16–0.37/hr', estHours: '1,280', totalRange: '$420–580' },
  { phase: 'Full run (Feb 2027)', models: 'Final stack (69.73 GB pinned)', gpu: 'RTX PRO 6000 Blackwell 96GB', rate: '$0.74–1.43/hr', estHours: '1,440 envelope', totalRange: '$900–1,200' },
  { phase: 'Law-testing (8 min/debate; after $1,350 hard stop)', models: 'Final stack (69.73 GB pinned)', gpu: 'RTX PRO 6000 Blackwell 96GB', rate: '$0.74–1.43/hr', estHours: '3,813', totalRange: '$1,400–1,900' },
];

// Blueprint §11 — Risk Assessment
export const risks: RiskRow[] = [
  { risk: 'Trust signal doesn\'t change output (Challenge C)', likelihood: 'Medium', likelihoodVariant: 'amber', impact: 'Critical', impactVariant: 'rose', mitigation: '24-item calibration + pilot (Dec 2026) before the matrix; a negative result is reportable' },
  { risk: 'Retrieval noise degrades evidence quality', likelihood: 'Medium', likelihoodVariant: 'amber', impact: 'Moderate', impactVariant: 'amber', mitigation: 'Cross-encoder reranker + citation-count filter + domain restriction' },
  { risk: 'Reviewers see as incremental over MoA/iMAD', likelihood: 'Low-Medium', likelihoodVariant: 'amber', impact: 'Moderate', impactVariant: 'amber', mitigation: 'B6/B9 direct comparisons; pre-register the comparison; no headline effect size before the run' },
  { risk: 'Timeline overload (matrix + benchmark)', likelihood: 'High', likelihoodVariant: 'rose', impact: 'High', impactVariant: 'rose', mitigation: 'Core run first (24 runs); Full run and 300-item benchmark only after Core run lands' },
  { risk: 'iMAD reimplementation fidelity', likelihood: 'Medium', likelihoodVariant: 'amber', impact: 'Moderate', impactVariant: 'amber', mitigation: '~10-day dedicated budget; explicit divergence documentation' },
  { risk: 'Single 96GB GPU compute ceiling', likelihood: 'Medium', likelihoodVariant: 'amber', impact: 'Moderate', impactVariant: 'amber', mitigation: 'FP8 native on Blackwell; Core matrix is 24 runs / 1,280 GPU-h; 6-arm Full target is a 36-run / 1,440 GPU-h envelope' },
  { risk: 'Dataset mismatch (proof-only benchmarks)', likelihood: 'High', likelihoodVariant: 'rose', impact: 'Moderate', impactVariant: 'amber', mitigation: 'BrokenMath/BrokenArXiv appendix-only; GPQA-Main + MMLU-Pro STEM primary; HLE abstention control; EG-SSS controlled set' },
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
  { name: 'GPQA-Main', role: 'Primary evidence-grounded benchmark', source: 'Idavidrein/gpqa (HF, official; gated)', size: '448 total · 400 cap', limitation: 'Well-known, not adversarial; options shuffled per question' },
  { name: 'MMLU-Pro (STEM)', role: 'Primary scale/robustness benchmark', source: 'TIGER-Lab/MMLU-Pro (HF, official)', size: 'STEM stratified · 400 cap', limitation: 'Broad STEM, non-adversarial' },
  { name: 'EG-SSS', role: 'Controlled benchmark release (v1.2 freeze); not a Core dataset', source: 'Original release (planned; CC BY 4.0)', size: '180 floor · 300 target', limitation: 'Annotation-intensive; 600 stretch, 800 no-go, only with 2–3 dedicated annotators' },
  { name: 'HLE', role: 'Abstention / ceiling control', source: 'cais/hle (HF, official; gated)', size: '200 cap in matrix', limitation: 'Retrieval-resistant — never pooled with the primary tests' },
  { name: 'BrokenMath', role: 'Appendix-only premise rejection', source: 'INSAIT-Institute/BrokenMath (HF, official)', size: '451 proof-only', limitation: '0% answer-type retention — not usable for CCR' },
  { name: 'BrokenArXiv', role: 'Appendix-only qualitative', source: 'MathArena/brokenarxiv (HF, official)', size: '87 proof-only', limitation: '0% answer-type retention; cite the exact monthly snapshot' },
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
  { scenario: 'All agents hallucinate same way', detection: 'Homogeneous-vs-heterogeneous shows no CCR difference', mitigation: 'Heterogeneous model families (partial)', recovery: 'Diagnosed explicitly in the failure analysis (Mar 2027)' },
  { scenario: 'Trust collapse (all to T_min)', detection: 'Trust variance monitoring across rounds', mitigation: 'Floor/ceiling simplex projection after every update', recovery: 'Bounded by construction: min ≥ floor, sum = 1, max ≤ max(ceiling, 1/N); monitored empirically' },
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
