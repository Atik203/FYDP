import { PageHeader } from '@/components/layout/PageHeader';
import { Section, SectionTitle } from '@/components/shared/Section';
import { Badge } from '@/components/shared/Badge';
import { GanttTable } from '@/components/shared/GanttTable';
import { Timeline } from '@/components/shared/Timeline';
import { Callout } from '@/components/shared/Callout';
import { ganttPhases, milestones } from '@/data/overview';
import { Calendar, ClipboardList, BookOpen, Brain, Bot, Users, Search, Ruler, GraduationCap, ExternalLink } from 'lucide-react';

/* ── Learning Roadmap Data (unchanged from original, Idea-1-specific) ─── */

interface RoadmapTopic {
  num: number;
  topic: string;
  level: string;
  levelEmoji: string;
  importance: string;
  whyNeeded: string;
  link?: { label: string; href: string };
}

import type { LucideIcon } from 'lucide-react';

interface RoadmapSection {
  id: string;
  icon: LucideIcon;
  title: string;
  accent: 'teal' | 'blue' | 'amber' | 'rose' | 'none';
  topics: RoadmapTopic[];
}

const roadmapSections: RoadmapSection[] = [
  {
    id: 'core', icon: Brain, title: 'Core ML & Deep Learning', accent: 'teal',
    topics: [
      { num: 1, topic: 'Neural Networks', level: 'Intermediate', levelEmoji: '🟢', importance: 'High', whyNeeded: 'Understand model structure and inference', link: { label: '100 Days of DL (CampusX)', href: 'https://youtube.com/playlist?list=PLKnIA16_RmvYuZauWaPlRTC54KxSNLtNn' } },
      { num: 2, topic: 'Transformer Architecture', level: 'Advanced', levelEmoji: '🟡', importance: 'Critical', whyNeeded: 'Foundation of all LLM agents', link: { label: '100 Days of DL — Transformer units', href: 'https://youtube.com/playlist?list=PLKnIA16_RmvYuZauWaPlRTC54KxSNLtNn' } },
      { num: 3, topic: 'Attention Mechanism', level: 'Advanced', levelEmoji: '🟡', importance: 'Critical', whyNeeded: 'Understanding trust influence and context handling', link: { label: '100 Days of DL (CampusX)', href: 'https://youtube.com/playlist?list=PLKnIA16_RmvYuZauWaPlRTC54KxSNLtNn' } },
      { num: 4, topic: 'Embeddings & Vector Representations', level: 'Intermediate', levelEmoji: '🟢', importance: 'Critical', whyNeeded: 'Core of RAG and retrieval pipelines', link: { label: '100 Days of ML (CampusX)', href: 'https://youtube.com/playlist?list=PLKnIA16_Rmvbr7zKYQuBfsVkjoLcJgxHH' } },
      { num: 5, topic: 'Model Quantization (GPTQ / AWQ)', level: 'Intermediate', levelEmoji: '🟢', importance: 'High', whyNeeded: 'Efficient local inference on A100', link: { label: 'vLLM quantization docs', href: 'https://docs.vllm.ai/' } },
      { num: 6, topic: 'Inference vs Fine-Tuning', level: 'Intermediate', levelEmoji: '🟢', importance: 'Medium', whyNeeded: 'Your work focuses on inference orchestration', link: { label: 'HF docs', href: 'https://huggingface.co/docs' } },
    ],
  },
  {
    id: 'llm', icon: Bot, title: 'Large Language Models', accent: 'blue',
    topics: [
      { num: 1, topic: 'LLM Text Generation', level: 'Advanced', levelEmoji: '🟡', importance: 'Critical', whyNeeded: 'Understand how models reason and fail', link: { label: 'HF docs', href: 'https://huggingface.co/docs' } },
      { num: 2, topic: 'Chain-of-Thought (CoT)', level: 'Advanced', levelEmoji: '🟡', importance: 'Critical', whyNeeded: 'Main baseline and reasoning style', link: { label: 'Wei et al. 2022', href: 'https://arxiv.org/abs/2201.11903' } },
      { num: 3, topic: 'Self-Consistency Decoding', level: 'Advanced', levelEmoji: '🟡', importance: 'Critical', whyNeeded: 'Major experimental baseline (B5)', link: { label: 'Wang et al. 2022', href: 'https://arxiv.org/abs/2203.11171' } },
      { num: 4, topic: 'Prompt Engineering', level: 'Intermediate', levelEmoji: '🟢', importance: 'High', whyNeeded: 'Agent orchestration and structured prompting', link: { label: 'OpenAI prompt guide', href: 'https://platform.openai.com/docs/guides/prompt-engineering' } },
      { num: 5, topic: 'Temperature & Sampling', level: 'Intermediate', levelEmoji: '🟢', importance: 'Medium', whyNeeded: 'Generating agent diversity', link: { label: 'HF docs', href: 'https://huggingface.co/docs' } },
      { num: 6, topic: 'Hallucination in LLMs', level: 'Expert', levelEmoji: '🔴', importance: 'Critical', whyNeeded: 'Your main failure mode', link: { label: 'Your literature review', href: '/papers' } },
      { num: 7, topic: 'Sycophancy in LLMs', level: 'Expert', levelEmoji: '🔴', importance: 'Critical', whyNeeded: 'Core research problem', link: { label: 'Sharma et al. 2023', href: 'https://arxiv.org/abs/2310.13548' } },
      { num: 8, topic: 'Model Calibration (ECE)', level: 'Expert', levelEmoji: '🔴', importance: 'Critical', whyNeeded: 'Foundation of trust calibration', link: { label: 'Guo et al. 2017', href: 'https://arxiv.org/abs/1706.04599' } },
      { num: 9, topic: 'Two-Phase Model Strategy', level: 'Intermediate', levelEmoji: '🟢', importance: 'High', whyNeeded: 'Dev (Qwen3.5-9B / Gemma 4 12B / Ministral-3-14B) → Final (Qwen3.6-27B / Gemma 4 26B / Mistral 24B) models (Ph 0–1)', link: { label: 'Proposal §7', href: '/idea/1' } },
      { num: 10, topic: 'Sycophancy Injection Protocol Design', level: 'Expert', levelEmoji: '🔴', importance: 'Critical', whyNeeded: 'CCR operationalization; κ > 0.75 pilot check (Phase 1–2)', link: { label: 'Proposal §5.4', href: '/idea/1' } },
      { num: 11, topic: 'LLM Uncertainty & Confidence Estimation', level: 'Advanced', levelEmoji: '🟡', importance: 'High', whyNeeded: 'Lightweight confidence gating (Phase 2)', link: { label: 'Your literature review', href: '/papers' } },
    ],
  },
  {
    id: 'agents', icon: Users, title: 'Multi-Agent Systems', accent: 'amber',
    topics: [
      { num: 1, topic: 'Multi-Agent Debate (MAD)', level: 'Expert', levelEmoji: '🔴', importance: 'Critical', whyNeeded: 'Main paradigm your work extends', link: { label: 'Du et al. 2023', href: 'https://arxiv.org/abs/2305.14325' } },
      { num: 2, topic: 'Mixture of Agents (MoA)', level: 'Advanced', levelEmoji: '🟡', importance: 'High', whyNeeded: 'Important baseline (B6)', link: { label: 'Wang et al. 2024', href: 'https://arxiv.org/abs/2406.04692' } },
      { num: 3, topic: 'iMAD Framework', level: 'Advanced', levelEmoji: '🟡', importance: 'Critical', whyNeeded: 'Closest competitor baseline', link: { label: 'Your iMAD review', href: '/papers' } },
      { num: 4, topic: 'Consensus Mechanisms', level: 'Advanced', levelEmoji: '🟡', importance: 'High', whyNeeded: 'Understanding majority-vote limitations' },
      { num: 5, topic: 'Trust & Reputation Systems', level: 'Expert', levelEmoji: '🔴', importance: 'Critical', whyNeeded: 'Foundation of your contribution', link: { label: 'Your iMAD review', href: '/papers' } },
      { num: 6, topic: 'Agentic AI Paradigm', level: 'Intermediate', levelEmoji: '🟢', importance: 'Medium', whyNeeded: 'Broader research positioning', link: { label: 'LangGraph playlist (CampusX)', href: 'https://www.youtube.com/playlist?list=PLKnIA16_RmvYsvB8qkUQuJmJNuiCUJFPL' } },
      { num: 7, topic: 'Debate Prompt Design', level: 'Advanced', levelEmoji: '🟡', importance: 'High', whyNeeded: 'Structuring adversarial reasoning (Phase 1–2)', link: { label: 'LangGraph playlist (CampusX)', href: 'https://www.youtube.com/playlist?list=PLKnIA16_RmvYsvB8qkUQuJmJNuiCUJFPL' } },
      { num: 8, topic: 'Adaptive Triggering / Confidence Gating', level: 'Advanced', levelEmoji: '🟡', importance: 'High', whyNeeded: 'Gate full debate pipeline (Phase 2)', link: { label: 'Proposal §5.2', href: '/idea/1' } },
      { num: 9, topic: 'Heterogeneous Multi-Model Agent Design', level: 'Advanced', levelEmoji: '🟡', importance: 'High', whyNeeded: 'Reducing correlated hallucinations', link: { label: 'Proposal §5.4', href: '/idea/1' } },
    ],
  },
  {
    id: 'rag', icon: Search, title: 'Retrieval-Augmented Generation (RAG)', accent: 'rose',
    topics: [
      { num: 1, topic: 'Dense Retrieval (DPR, Contriever)', level: 'Advanced', levelEmoji: '🟡', importance: 'Critical', whyNeeded: 'Atomic claim retrieval backbone', link: { label: 'sentence-transformers', href: 'https://www.sbert.net/' } },
      { num: 2, topic: 'Cross-Encoder Reranking', level: 'Advanced', levelEmoji: '🟡', importance: 'Critical', whyNeeded: 'Evidence scoring per claim (Phase 2)', link: { label: 'sentence-transformers', href: 'https://www.sbert.net/' } },
      { num: 3, topic: 'FAISS Vector Index', level: 'Intermediate', levelEmoji: '🟢', importance: 'High', whyNeeded: 'Efficient similarity search at scale', link: { label: 'FAISS (GitHub)', href: 'https://github.com/facebookresearch/faiss' } },
      { num: 4, topic: 'Source-Partitioned Retrieval', level: 'Expert', levelEmoji: '🔴', importance: 'Critical', whyNeeded: 'Your novel retrieval strategy (Phase 2–3)', link: { label: 'Proposal §5.5', href: '/idea/1' } },
      { num: 5, topic: 'Atomic Claim Decomposition', level: 'Expert', levelEmoji: '🔴', importance: 'Critical', whyNeeded: 'Breaking agent utterances into verifiable propositions (Phase 2)', link: { label: 'Proposal §5.5', href: '/idea/1' } },
      { num: 6, topic: 'RAG Evaluation Metrics', level: 'Advanced', levelEmoji: '🟡', importance: 'High', whyNeeded: 'Measuring retrieval quality (Phase 3–4)', link: { label: 'lm-eval-harness', href: 'https://github.com/EleutherAI/lm-evaluation-harness' } },
    ],
  },
  {
    id: 'eval', icon: Ruler, title: 'Evaluation & Statistics', accent: 'none',
    topics: [
      { num: 1, topic: 'Statistical Significance Testing', level: 'Advanced', levelEmoji: '🟡', importance: 'Critical', whyNeeded: 'Paired bootstrap, McNemar tests for all main results', link: { label: 'SciPy docs', href: 'https://docs.scipy.org/doc/scipy/' } },
      { num: 2, topic: 'Effect Size Reporting', level: 'Advanced', levelEmoji: '🟡', importance: 'Critical', whyNeeded: "Cohen's d, Cliff's delta for sycophancy reduction claims" },
      { num: 3, topic: 'Inter-rater Agreement (κ)', level: 'Advanced', levelEmoji: '🟡', importance: 'High', whyNeeded: 'Validating sycophancy injection protocol (Phase 1 pilot)' },
      { num: 4, topic: 'Ablation Study Design', level: 'Expert', levelEmoji: '🔴', importance: 'Critical', whyNeeded: 'Isolating each component contribution; required for Q1 submission', link: { label: 'Proposal §11', href: '/idea/1' } },
      { num: 5, topic: 'Calibration Metrics (ECE, ECR)', level: 'Expert', levelEmoji: '🔴', importance: 'Critical', whyNeeded: 'Your primary ECR metric', link: { label: 'Guo et al. 2017', href: 'https://arxiv.org/abs/1706.04599' } },
      { num: 6, topic: 'Benchmark Evaluation Harness', level: 'Advanced', levelEmoji: '🟡', importance: 'High', whyNeeded: 'Reproducible multi-benchmark evaluation', link: { label: 'lm-eval-harness', href: 'https://github.com/EleutherAI/lm-evaluation-harness' } },
    ],
  },
];

const importanceBadge = (imp: string) => {
  if (imp === 'Critical') return <Badge variant="rose">Critical</Badge>;
  if (imp === 'High') return <Badge variant="amber">High</Badge>;
  return <Badge variant="blue">Medium</Badge>;
};

/* ── Honest month-by-month learning plan (aligned with blueprint §12–13) ─── */

interface MonthPlan {
  month: string;
  phase: string;
  hours: string;
  learn: string;
  build: string;
  links: { label: string; href: string }[];
}

const monthPlan: MonthPlan[] = [
  {
    month: 'Jul 2026',
    phase: 'Ph 0',
    hours: '~15 hr/wk',
    learn: 'Only the Transformer / attention / quantization units from the ML/DL playlists (skip what you know); structured prompting for tagged output; vLLM + HF Hub basics.',
    build: 'Repo skeleton per docs/project_structure.md; one model served on the A6000; single-agent script returning tagged claims; setup.sh.',
    links: [
      { label: '100 Days of DL (Transformer units only)', href: 'https://youtube.com/playlist?list=PLKnIA16_RmvYuZauWaPlRTC54KxSNLtNn' },
      { label: 'vLLM docs', href: 'https://docs.vllm.ai/' },
    ],
  },
  {
    month: 'Aug 2026',
    phase: 'Ph 1',
    hours: '~20 hr/wk',
    learn: 'LangGraph StateGraph subset — the ~5-API core, not the whole library (CampusX LangGraph playlist, videos 1–6 only); Du et al. 2023 read once, carefully.',
    build: 'serve.sh with 3 vLLM instances; MAD reproduction loop (Gate 0); injection protocol v1; 50-question pilot + κ check.',
    links: [
      { label: 'Agentic AI using LangGraph (CampusX)', href: 'https://www.youtube.com/playlist?list=PLKnIA16_RmvYsvB8qkUQuJmJNuiCUJFPL' },
      { label: 'Du et al. 2023 — MAD paper', href: 'https://arxiv.org/abs/2305.14325' },
      { label: 'LangGraph docs', href: 'https://langchain-ai.github.io/langgraph/' },
    ],
  },
  {
    month: 'Sep–Oct 2026',
    phase: 'Ph 2',
    hours: '~20 hr/wk',
    learn: 'The 3 retrieval API docs (PubMed / ArXiv / Semantic Scholar) directly — no tutorials needed; cross-encoder reranking (sentence-transformers); calibration (ECE) + trust math from blueprint §5.6.',
    build: 'Claim decomposition + source-partitioned RAG; trust update as pure functions + boundedness unit tests; baselines B5/B6; iMAD reimplementation (~10 days).',
    links: [
      { label: 'RAG playlist (first 3–4 videos, CampusX)', href: 'https://www.youtube.com/playlist?list=PLKnIA16_Rmva0dRLWEHLznSHKbFD_RJfX' },
      { label: 'sentence-transformers (cross-encoder)', href: 'https://www.sbert.net/' },
      { label: 'Self-Consistency (Wang et al.)', href: 'https://arxiv.org/abs/2203.11171' },
    ],
  },
  {
    month: 'Nov 2026',
    phase: 'Ph 2→3',
    hours: '~15 hr/wk',
    learn: 'Only the stats you will actually run: paired bootstrap, McNemar, Cohen\'s d, Cohen\'s κ — short scipy walkthroughs, no full stats course.',
    build: 'Dry-run matrix on one dataset; results tables with CIs; mid-report; FYDP-1 defence.',
    links: [
      { label: 'MoA paper (Wang et al.)', href: 'https://arxiv.org/abs/2406.04692' },
    ],
  },
  {
    month: 'Dec 2026 – Jan 2027',
    phase: 'Ph 3',
    hours: '~20 hr/wk',
    learn: 'Nothing new — debugging discipline and log inspection only. If you need a concept, look it up on demand.',
    build: 'Main experiment matrix; 4 ablations; α/β sweep; N∈{2,3,5}; V1–V3 validity checks. Exit: Gate 3 results freeze.',
    links: [],
  },
  {
    month: 'Feb–Apr 2027',
    phase: 'Ph 4–5',
    hours: '~15 hr/wk',
    learn: 'Inter-annotator agreement (κ) for the human eval; venue writing guides.',
    build: 'n=60 human evaluation; failure analysis; thesis + paper + reproducibility package; final defence.',
    links: [],
  },
];

/* ── Verified learning resources ─── */

interface ResourceLink {
  title: string;
  desc: string;
  href: string;
}

const resources: ResourceLink[] = [
  { title: 'CampusX — channel', desc: 'Best single source for ML/DL/agentic concepts in depth (Hindi + English).', href: 'https://youtube.com/@campusx-official' },
  { title: 'CampusX — Agentic AI using LangGraph', desc: 'The one playlist worth watching — but only videos 1–6 (StateGraph, nodes/edges, conditional edges, memory). The rest is on-demand reference.', href: 'https://www.youtube.com/playlist?list=PLKnIA16_RmvYsvB8qkUQuJmJNuiCUJFPL' },
  { title: 'CampusX — 100 Days of Machine Learning', desc: 'Pick individual concept videos as needed; do not binge the playlist.', href: 'https://youtube.com/playlist?list=PLKnIA16_Rmvbr7zKYQuBfsVkjoLcJgxHH' },
  { title: 'CampusX — 100 Days of Deep Learning', desc: 'Neural nets → Transformer → attention units only; skip the rest.', href: 'https://youtube.com/playlist?list=PLKnIA16_RmvYuZauWaPlRTC54KxSNLtNn' },
  { title: 'CampusX — RAG playlist', desc: 'First 3–4 videos for retrieval + reranking intuition; you are writing thin API clients, not a RAG framework.', href: 'https://www.youtube.com/playlist?list=PLKnIA16_Rmva0dRLWEHLznSHKbFD_RJfX' },
  { title: 'LangGraph docs (official)', desc: 'The StateGraph quickstart + reference is your real textbook for the orchestrator.', href: 'https://langchain-ai.github.io/langgraph/' },
  { title: 'vLLM docs (official)', desc: 'Serving, quantization (Q4/FP8), and API reference — read before every serving task.', href: 'https://docs.vllm.ai/' },
  { title: 'Hugging Face docs (official)', desc: 'Model hub, quantization, tokenizers.', href: 'https://huggingface.co/docs' },
  { title: 'OpenAI Python SDK (GitHub)', desc: 'The client library used to talk to vLLM (base_url swap).', href: 'https://github.com/openai/openai-python' },
  { title: 'Du et al. 2023 — Multi-Agent Debate', desc: 'Gate 0 reproduction target.', href: 'https://arxiv.org/abs/2305.14325' },
  { title: 'Wang et al. — Self-Consistency (B5)', desc: 'Baseline reference.', href: 'https://arxiv.org/abs/2203.11171' },
  { title: 'Wang et al. — Mixture-of-Agents (B6)', desc: 'Baseline reference.', href: 'https://arxiv.org/abs/2406.04692' },
  { title: 'Local literature review', desc: 'Your own paper matrix + iMAD review — always check here before googling.', href: '/papers' },
];

function RoadmapTable({ topics }: { topics: RoadmapTopic[] }) {
  return (
    <div className="overflow-x-auto rounded-lg shadow-sm">
      <table className="w-full border-collapse text-xs sm:text-sm">
        <thead>
          <tr>
            {['#', 'Topic', 'Level Needed', 'Importance', 'Why Needed', 'Learn'].map((h) => (
              <th key={h} className="p-3 text-left font-bold bg-[#f1f5f9] dark:bg-[rgba(255,255,255,0.06)] border-b-2 border-[#e2e8f0] dark:border-[rgba(255,255,255,0.15)] whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {topics.map((t) => (
            <tr key={t.num} className="border-b border-[#e2e8f0] dark:border-[rgba(255,255,255,0.08)] last:border-0 hover:bg-[#dce4ff] dark:hover:bg-[rgba(59,91,219,0.12)] even:bg-[#f8fafc] dark:even:bg-[rgba(255,255,255,0.03)] transition-colors">
              <td className="p-3">{t.num}</td>
              <td className="p-3 font-medium">{t.topic}</td>
              <td className="p-3 whitespace-nowrap">{t.levelEmoji} {t.level}</td>
              <td className="p-3">{importanceBadge(t.importance)}</td>
              <td className="p-3 text-[#64748b] dark:text-[#94a3b8]">{t.whyNeeded}</td>
              <td className="p-3 whitespace-nowrap">
                {t.link ? (
                  <a
                    className="underline decoration-dotted underline-offset-2"
                    href={t.link.href}
                    target={t.link.href.startsWith('/') ? undefined : '_blank'}
                    rel="noopener noreferrer"
                  >
                    {t.link.label} ↗
                  </a>
                ) : (
                  <span className="text-[#94a3b8]">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function RoadmapPage() {
  return (
    <>
      <PageHeader
        docType="FYDP Learning & Execution Roadmap · Idea 1"
        title={<>Idea 1 Learning &amp; Execution Roadmap</>}
        subtitle="Trust-Calibrated Multi-Agent Scientific Deliberation · Jul 2026 – Apr 2027"
        coverItems={[
          { label: 'Total Duration', value: '10 Months (5 Phases)' },
          { label: 'Weekly Time', value: '15–20 Hours' },
          { label: 'Target Venue', value: 'ACL W. / EMNLP Findings / TMLR' },
          { label: 'Research Focus', value: 'Agentic AI · Anti-Sycophancy · Trust Calibration' },
        ]}
      />

      <main className="max-w-[1150px] mx-auto my-10 px-4 sm:px-5">

        {/* ── SECTION A: Execution Plan (Blueprint §12–13) ── */}
        <Section accent="blue" className="animate-fade-up">
          <SectionTitle icon={Calendar}>A. Execution Plan (Blueprint §12)</SectionTitle>
          <p className="text-sm mb-4">
            Five phases over 10 months (Jul 2026 – Apr 2027) with explicit Gate checkpoints. Per blueprint §12.
          </p>
          <GanttTable phases={ganttPhases} />
          <Timeline items={milestones} />
        </Section>

        {/* ── SECTION B: Implementation Order (Blueprint §13) ── */}
        <Section accent="teal" className="animate-fade-up animate-delay-1">
          <SectionTitle icon={ClipboardList}>B. Implementation Order (Blueprint §13)</SectionTitle>
          <p className="text-sm mb-4">
            Exact build sequence with dependency reasoning. Each step depends on the previous.
          </p>
          <div className="space-y-3">
            {[
              { step: 1, title: 'vLLM multi-model serving setup', desc: 'Nothing else can be tested without this.' },
              { step: 2, title: 'Vanilla MAD reproduction (Du et al. 2023)', desc: 'Gate 0 — validates base loop independent of our additions.' },
              { step: 3, title: 'Injection protocol (§5.4)', desc: 'Must exist before trust mechanism — trust calibration needs a working stress test.' },
              { step: 4, title: 'Month-1 behavioral-effectiveness pilot', desc: 'Highest-risk assumption — test on ~20–30 toy questions before full build.' },
              { step: 5, title: 'Claim decomposition + source-partitioned retrieval', desc: 'Trust formula inputs are outputs of retrieval. Build retrieval before trust math.' },
              { step: 6, title: 'Trust update function', desc: 'Unit-test operator order (softmax→clamp→renormalize) in isolation.' },
              { step: 7, title: 'Full debate loop (LangGraph)', desc: 'Only after steps 1–6 are each independently validated.' },
              { step: 8, title: 'Baselines B1–B4', desc: 'Reuses components from steps 1, 5. Establishes comparison floor.' },
              { step: 9, title: 'Baselines B5–B6 (Self-Consistency, MoA)', desc: 'Independent of core mechanism. Can build in parallel with step 10.' },
              { step: 10, title: 'Baseline B9 (iMAD reimplementation)', desc: 'Highest difficulty (~10 days). Sequenced last.' },
              { step: 11, title: 'Full experiment matrix', desc: 'Only after every component passes its validation gate.' },
              { step: 12, title: 'Human evaluation + failure analysis', desc: 'Last — requires completed experimental results to annotate against.' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex gap-3 items-start bg-[#f0f2f7] dark:bg-[#1a1d35] border border-[#e2e8f0] dark:border-[rgba(255,255,255,0.1)] rounded-md p-3 sm:p-4 hover:border-[#3b5bdb] dark:hover:border-[#3b5bdb] transition-colors">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#3b5bdb] text-white font-bold text-xs flex-shrink-0 shadow-[0_2px_8px_rgba(59,91,219,.35)]">
                  {step}
                </span>
                <div className="min-w-0">
                  <div className="font-semibold text-sm">{title}</div>
                  <div className="text-xs text-[#64748b] dark:text-[#94a3b8] mt-0.5">{desc}</div>
                </div>
              </div>
            ))}
          </div>
          <Callout variant="info" title="⚠ Critical Ordering Constraints" className="mt-4">
            <ul className="text-sm space-y-1">
              <li>Never build trust update <strong>before</strong> retrieval exists.</li>
              <li>Never build B9 (iMAD) <strong>before</strong> the core system (steps 1–7).</li>
              <li>Never run full experiment matrix <strong>before</strong> Month-1 pilot confirms the core assumption.</li>
            </ul>
          </Callout>
        </Section>

        {/* ── SECTION C: Month-by-Month Learning Plan (honest) ── */}
        <Section accent="amber" className="animate-fade-up animate-delay-2">
          <SectionTitle icon={GraduationCap}>C. Month-by-Month Learning Plan (Honest)</SectionTitle>
          <p className="text-sm mb-4">
            What you actually need to learn, when, and how much — mapped to the blueprint's build order. The rule:{" "}
            <strong>~30% watching, ~70% building</strong>. Every month ends with a running script, not notes.
          </p>
          <div className="overflow-x-auto rounded-lg shadow-sm">
            <table className="w-full border-collapse text-xs sm:text-sm">
              <thead>
                <tr>
                  {['Month', 'Phase', 'Effort', 'Learn (only this)', 'Build / Exit check', 'Links'].map((h) => (
                    <th key={h} className="p-3 text-left font-bold bg-[#f1f5f9] dark:bg-[rgba(255,255,255,0.06)] border-b-2 border-[#e2e8f0] dark:border-[rgba(255,255,255,0.15)] whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {monthPlan.map((m) => (
                  <tr key={m.month} className="border-b border-[#e2e8f0] dark:border-[rgba(255,255,255,0.08)] last:border-0 hover:bg-[#dce4ff] dark:hover:bg-[rgba(59,91,219,0.12)] even:bg-[#f8fafc] dark:even:bg-[rgba(255,255,255,0.03)] transition-colors align-top">
                    <td className="p-3 font-medium whitespace-nowrap">{m.month}</td>
                    <td className="p-3 whitespace-nowrap">{m.phase}</td>
                    <td className="p-3 whitespace-nowrap">{m.hours}</td>
                    <td className="p-3 text-[#64748b] dark:text-[#94a3b8]">{m.learn}</td>
                    <td className="p-3 text-[#64748b] dark:text-[#94a3b8]">{m.build}</td>
                    <td className="p-3">
                      {m.links.length === 0 ? (
                        <span className="text-[#94a3b8]">—</span>
                      ) : (
                        <ul className="space-y-1">
                          {m.links.map((l) => (
                            <li key={l.href}>
                              <a className="underline decoration-dotted underline-offset-2" href={l.href} target="_blank" rel="noopener noreferrer">{l.label} ↗</a>
                            </li>
                          ))}
                        </ul>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Callout variant="warning" title="How not to waste the month" className="mt-4">
            <ul className="text-sm space-y-1">
              <li><strong>Do not binge-watch playlists.</strong> Binge-watching is the #1 way to spend a month learning nothing you can reproduce. Watch the one video for the concept you are about to implement, then implement it.</li>
              <li><strong>Do not take a full stats or ML course.</strong> This project needs ~6 statistical tests and ~4 architecture concepts. Learn them on demand.</li>
              <li><strong>Skip if you already know it:</strong> Python (skip 100 Days of Python entirely), basic ML concepts, and any LangChain content — you need LangGraph only, and only its StateGraph core.</li>
              <li><strong>If you fall behind:</strong> cut Week 3's reranker to a simple overlap score and catch up in Ph 1 — never skip the Gate 0 MAD reproduction or the Month-1 pilot.</li>
            </ul>
          </Callout>
        </Section>

        {/* ── SECTION D: Learning Resources (verified links) ── */}
        <Section className="animate-fade-up animate-delay-3">
          <SectionTitle icon={ExternalLink}>D. Learning Resources (Verified Links)</SectionTitle>
          <p className="text-sm mb-4">
            A short shelf, not a library. Prefer the official docs for everything you build; use the playlists
            for concepts only. All links verified.
          </p>
          <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
            {resources.map((r) => (
              <a
                key={r.href}
                href={r.href}
                target={r.href.startsWith('/') ? undefined : '_blank'}
                rel="noopener noreferrer"
                className="bg-[#f0f2f7] dark:bg-[rgba(255,255,255,0.04)] border border-[#e2e8f0] dark:border-[rgba(255,255,255,0.1)] rounded-md p-3 hover:border-[#3b5bdb] dark:hover:border-[#3b5bdb] transition-colors block"
              >
                <div className="font-semibold text-sm text-[#12172b] dark:text-[#c7d2fe]">{r.title} ↗</div>
                <div className="text-xs text-[#64748b] dark:text-[#94a3b8] mt-0.5">{r.desc}</div>
              </a>
            ))}
          </div>
        </Section>

        {/* ── SECTION E: Learning Level Guide ── */}
        <Section className="animate-fade-up animate-delay-4">
          <SectionTitle icon={BookOpen}>E. Learning Level Guide</SectionTitle>
          <div className="overflow-x-auto rounded-lg shadow-sm">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="p-3 text-left font-bold bg-[#f1f5f9] dark:bg-[rgba(255,255,255,0.06)] border-b-2 border-[#e2e8f0] dark:border-[rgba(255,255,255,0.15)]">Level</th>
                  <th className="p-3 text-left font-bold bg-[#f1f5f9] dark:bg-[rgba(255,255,255,0.06)] border-b-2 border-[#e2e8f0] dark:border-[rgba(255,255,255,0.15)]">Meaning</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['🔵 Beginner', 'Basic conceptual understanding only'],
                  ['🟢 Intermediate', 'Comfortable using and modifying existing implementations'],
                  ['🟡 Advanced', 'Able to implement, debug, and explain independently'],
                  ['🔴 Expert', 'Deep enough understanding to contribute novel research ideas'],
                ].map(([level, meaning]) => (
                  <tr key={level} className="border-b border-[#e2e8f0] dark:border-[rgba(255,255,255,0.08)] last:border-0 hover:bg-[#dce4ff] dark:hover:bg-[rgba(59,91,219,0.12)] even:bg-[#f8fafc] dark:even:bg-[rgba(255,255,255,0.03)] transition-colors">
                    <td className="p-3 font-medium">{level}</td>
                    <td className="p-3">{meaning}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {/* ── SECTION F: Topic Roadmaps ── */}
        {roadmapSections.map((sec, i) => (
          <Section key={sec.id} accent={sec.accent} className={`animate-fade-up animate-delay-${(i % 5) + 1}`}>
            <SectionTitle icon={sec.icon}>{sec.title}</SectionTitle>
            <RoadmapTable topics={sec.topics} />
          </Section>
        ))}

      </main>
    </>
  );
}
