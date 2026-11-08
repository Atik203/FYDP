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
  { name: 'Ph 1: P0 Engineering', duration: 'Oct–Nov 2026', deliverables: 'Core wired: options in prompts, parser/scorer, trust simplex projection, verifier interface, claim-domain routing, endpoints, manifest/resume. 478 tests; P0 gate 11/13 passed, with WP-13 (B8-no-trust) and WP-09 (B8+injection) still pending.', progress: 85, barVariant: 'default' },
  { name: 'Ph 2: Pilot run', duration: 'Dec 2026', deliverables: '24-item calibration first; then the behavioural pilot and κ check. Two seeds. Gate 1 decides whether the Core run proceeds.', progress: 0, barVariant: 'amber' },
  { name: 'Ph 3: Core run', duration: 'Jan 2027', deliverables: '4 executable arms (B3, B4-matched, B8-no-trust, B8) + oracle; 3 datasets × 400 items × 2 seeds = 24 rows, 1,280 GPU-h, plus the 180-item EG-SSS benchmark. PRE_REGISTRATION.md v1.0.', progress: 0, barVariant: 'rose' },
  { name: 'Ph 4: Full run + benchmark', duration: 'Feb 2027', deliverables: '6-arm Full run (3 datasets × 400 items × 2 seeds) adds B8-placebo/B8-oracle (pending WP-13) and extends EG-SSS to 300 items (600 stretch, 800 no-go).', progress: 0, barVariant: 'rose' },
  { name: 'Ph 5: Human Eval + SDT', duration: 'Mar 2027', deliverables: 'Human evaluation / SDT, benchmark annotation, verifier audit.', progress: 0, barVariant: 'default' },
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
    description: '478 tests; P0 gate 11/13 passed. Pending: WP-13 (B8-no-trust) and WP-09 (B8+injection). Core wiring is in place — this is engineering readiness, not an efficacy result.',
    deliverable: 'P0 gate report + runnable matrix — 11/13',
  },
  {
    milestone: 'Pilot run',
    date: 'Dec 2026',
    description: 'A 24-item calibration precedes the Pilot run. Gate 1 requires κ ≥ 0.75 and a measured behavioural effect; if it fails, the project reframes to report the negative result honestly.',
    deliverable: 'Pilot-run report',
  },
  {
    milestone: 'Core run',
    date: 'Jan 2027',
    description: 'Core run (legacy "C+"): 4 executable arms + oracle; 3 datasets × 400 items × 2 seeds = 24 rows, budgeted at 1,280 GPU-h, plus the 180-item EG-SSS benchmark. No efficacy claim is made before the pre-registered analysis.',
    deliverable: 'Core-run causal result',
  },
  {
    milestone: 'Full run + benchmark',
    date: 'Feb 2027',
    description: 'Full run (legacy "TACL full"): add B8-placebo/B8-oracle if WP-13 lands, then extend to the 6-arm design. Build EG-SSS to 300 items (180 floor, 600 stretch, 800 no-go).',
    deliverable: 'Full-run matrix + EG-SSS v1',
  },
  {
    milestone: 'Human eval + SDT',
    date: 'Mar 2027',
    description: 'Human evaluation and SDT, benchmark annotation, and the verifier audit.',
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
  { phase: 'Core run (P0–Jan 2027)', models: 'Dev stack + brief Final smoke', gpu: 'RTX A6000 48GB (+ PRO 6000 smoke)', rate: 'spot $0.16–0.37/hr', estHours: '~1,160', totalRange: '$420–580' },
  { phase: 'Full run top-up (Feb 2027)', models: 'Final stack (69.73 GB pinned)', gpu: 'RTX PRO 6000 Blackwell 96GB', rate: '$0.74–1.43/hr', estHours: '2,460–2,700', totalRange: '$900–1,200' },
  { phase: 'Law-testing (8 min/debate)', models: 'Final stack (69.73 GB pinned)', gpu: 'RTX PRO 6000 Blackwell 96GB', rate: '$0.74–1.43/hr', estHours: '3,813', totalRange: '$1,400–1,900' },
];

// Blueprint §11 — Risk Assessment
export const risks: RiskRow[] = [
  { risk: 'Trust signal doesn\'t change output (Challenge C)', likelihood: 'Medium', likelihoodVariant: 'amber', impact: 'Critical', impactVariant: 'rose', mitigation: '24-item calibration + pilot (Dec 2026) before the matrix; a negative result is reportable' },
  { risk: 'Retrieval noise degrades evidence quality', likelihood: 'Medium', likelihoodVariant: 'amber', impact: 'Moderate', impactVariant: 'amber', mitigation: 'Cross-encoder reranker + citation-count filter + domain restriction' },
  { risk: 'Reviewers see as incremental over MoA/iMAD', likelihood: 'Low-Medium', likelihoodVariant: 'amber', impact: 'Moderate', impactVariant: 'amber', mitigation: 'B6/B9 direct comparisons; pre-register the comparison; no headline effect size before the run' },
  { risk: 'Timeline overload (matrix + benchmark)', likelihood: 'High', likelihoodVariant: 'rose', impact: 'High', impactVariant: 'rose', mitigation: 'Core run first (24 rows); Full run and 300-item benchmark only after Core run lands' },
  { risk: 'iMAD reimplementation fidelity', likelihood: 'Medium', likelihoodVariant: 'amber', impact: 'Moderate', impactVariant: 'amber', mitigation: '~10-day dedicated budget; explicit divergence documentation' },
  { risk: 'Single 96GB GPU compute ceiling', likelihood: 'Medium', likelihoodVariant: 'amber', impact: 'Moderate', impactVariant: 'amber', mitigation: 'FP8 native on Blackwell; Core run matrix is 24 rows / 1,280 GPU-h; 6-arm Full run target is ~1,920 GPU-h' },
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
  { name: 'EG-SSS', role: 'Controlled gold-evidence mechanism test', source: 'Original release (planned; CC BY 4.0)', size: '180 floor · 300 target', limitation: 'Annotation-intensive; 600 stretch, 800 no-go, only with 2–3 dedicated annotators' },
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
