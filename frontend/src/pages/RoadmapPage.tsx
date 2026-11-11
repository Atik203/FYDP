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
      { num: 5, topic: 'Model Quantization (GPTQ / AWQ)', level: 'Intermediate', levelEmoji: '🟢', importance: 'High', whyNeeded: 'Efficient 4-bit inference on the 80 GB A100 main stack', link: { label: 'vLLM quantization docs', href: 'https://docs.vllm.ai/' } },
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
      { num: 9, topic: 'Two-Phase Model Strategy', level: 'Intermediate', levelEmoji: '🟢', importance: 'High', whyNeeded: 'Dev stack (Qwen3.5-9B / Gemma 4 12B / Ministral-3-14B) → 4-bit main stack (Qwen3.8-27B-AWQ-INT4 ~21.0 GB / Gemma 4 26B-A4B AWQ ~17.2 GB / Mistral-24B-AWQ 15.06 GB; ~53.3 GB, one 80 GB A100); FP8 check stack (73.68 GB) is N1 smoke + GPQA precision replication', link: { label: 'Proposal §7', href: '/idea/1' } },
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
      { num: 5, topic: 'Calibration Metrics (ECE, ECR)', level: 'Expert', levelEmoji: '🔴', importance: 'Critical', whyNeeded: 'Calibration endpoint for the trust signal (H3)', link: { label: 'Guo et al. 2017', href: 'https://arxiv.org/abs/1706.04599' } },
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
    month: 'Jul–Sep 2026',
    phase: 'Ph 0 — complete',
    hours: '~15 hr/wk',
    learn: 'Only the Transformer / attention / quantization units from the ML/DL playlists (skip what you know); structured prompting for tagged output; vLLM + HF Hub basics.',
    build: 'Repo skeleton; 3-model vLLM serving on the A6000; Gate 0 MAD reproduction passed 16 Sep 2026 (10/10 debates × 3 rounds, mean 370.8 s/debate).',
    links: [
      { label: '100 Days of DL (Transformer units only)', href: 'https://youtube.com/playlist?list=PLKnIA16_RmvYuZauWaPlRTC54KxSNLtNn' },
      { label: 'vLLM docs', href: 'https://docs.vllm.ai/' },
    ],
  },
  {
    month: 'Oct–Nov 2026',
    phase: 'P0 — released Nov 2026',
    hours: '~20 hr/wk',
    learn: 'LangGraph StateGraph subset — the ~5-API core, not the whole library (CampusX playlist, videos 1–6 only); trust projection math from the P0 interfaces.',
    build: 'Core wired: options in prompts, parser/scorer, trust simplex projection, verifier interface, claim-domain routing, endpoints, manifest/resume. 514 tests; P0 gate 13/13.',
    links: [
      { label: 'Agentic AI using LangGraph (CampusX)', href: 'https://www.youtube.com/playlist?list=PLKnIA16_RmvYsvB8qkUQuJmJNuiCUJFPL' },
      { label: 'LangGraph docs', href: 'https://langchain-ai.github.io/langgraph/' },
    ],
  },
  {
    month: 'Dec 2026',
    phase: 'Pilot run',
    hours: '~15 hr/wk',
    learn: 'Only the stats you will actually run: paired bootstrap, McNemar, Cohen\'s d, Cohen\'s κ — short scipy walkthroughs, no full stats course.',
    build: 'N1 96 GB smoke + FP8 precision replication ($25–40); WP-18 placebo/oracle; 24-item calibration; verifier audit (150–200 pairs; lexical 0.58 balanced accuracy; target ≥0.75, κ ≥0.60); 50-question Month-1 pilot, then the 100–150-question G2 pilot. G2 decides whether the Core run proceeds.',
    links: [
      { label: 'Du et al. — MAD paper', href: 'https://arxiv.org/abs/2305.14325' },
    ],
  },
  {
    month: 'Jan 2027',
    phase: 'Core run',
    hours: '~20 hr/wk',
    learn: 'Nothing new — debugging discipline and log inspection only. If you need a concept, look it up on demand.',
    build: 'G3 Core run: 4 arms × GPQA-Main 400 / MMLU-Pro 400 / HLE 200 × 2 seeds = 24 runs, 1,280 GPU-h. B8-oracle is not a Core arm; SciClaimBench is not in Core v1.0. No efficacy claim until the pre-registered analysis.',
    links: [],
  },
  {
    month: 'Feb 2027',
    phase: 'Full run + benchmark',
    hours: '~20 hr/wk',
    learn: 'Benchmark annotation and verifier-audit protocol; no new ML theory.',
    build: 'WP-18 adds B8-placebo/B8-oracle; G4/G5 Full primary is 32 rows at 300 items/dataset with the gold-evidence oracle on SciClaimBench (1,280 GPU-h; $210); the 36-row gold-answer alternate is 1,440 GPU-h ($235). SciClaimBench: 180 floor, 300 target, 600 stretch, 800 no-go.',
    links: [],
  },
  {
    month: 'Mar–Apr 2027',
    phase: 'Human eval + freeze',
    hours: '~15 hr/wk',
    learn: 'Inter-annotator agreement (κ/ICC) for the human evaluation.',
    build: 'Human evaluation / SDT, benchmark annotation, verifier-audit follow-up, then results freeze with CIs and effect sizes. No post-hoc arm changes.',
    links: [],
  },
  {
    month: 'May–Jul 2027',
    phase: 'Thesis + defence',
    hours: '~15 hr/wk',
    learn: 'Venue/thesis formatting only; no new technical material.',
    build: 'Thesis chapters (May), submission (Jun), defence (Jun/Jul).',
    links: [],
  },
  {
    month: 'Aug–Dec 2027',
    phase: 'Paper',
    hours: '~10 hr/wk',
    learn: 'TACL/EMNLP writing guides and reviewer-response practice.',
    build: 'Write and submit the paper after the defence. TACL rolling; EMNLP 2028 fallback.',
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
        subtitle="The Boundaries of Evidence-Grounded Trust in Multi-Agent Scientific Debate, with a Controlled Benchmark for Sycophantic Consensus · Nov 2026 – Dec 2027"
        coverItems={[
          { label: 'Timeline', value: 'P0 release → Paper (Nov 2026 – Dec 2027)' },
          { label: 'Weekly Time', value: '15–20 Hours' },
          { label: 'Target Venue', value: 'TACL (rolling) · EMNLP 2028 fallback' },
          { label: 'Research Focus', value: 'Agentic AI · Anti-Sycophancy · Trust Calibration' },
        ]}
      />

      <main className="max-w-[1150px] mx-auto my-10 px-4 sm:px-5">

        {/* ── SECTION A: Execution Plan (Blueprint §12–13) ── */}
        <Section accent="blue" className="animate-fade-up">
          <SectionTitle icon={Calendar}>A. Execution Plan (Blueprint §12)</SectionTitle>
          <p className="text-sm mb-4">
            P0 was released in Nov 2026. The N1 96 GB smoke + FP8 precision
            replication, WP-18 placebo/oracle, 24-item calibration and verifier
            audit precede the G2 pilot in Dec 2026; the G3 Core run follows in Jan 2027; the G4/G5
            Full run plus the benchmark ladder follows in Feb; human eval/SDT in
            Mar; results freeze in Apr; thesis chapters in May; thesis submission
            in Jun; defence in Jun/Jul; paper after the defence (Aug–Dec 2027).
            Gates mark explicit go/no-go decisions. Core and Full are separate
            matrices on the same 4-bit main stack; do not assume Core cells are
            reusable. The plan totals $500–600 with a $600 hard stop; the main
            matrix runs the 4-bit 24–27B stack (~53.3 GB) on one 80 GB A100 at
            $0.136/GPU-h, and the 96 GB FP8 stack is limited to the N1 smoke and
            a small GPQA precision replication. If no 80 GB A100 is available,
            the fallback is $1,050–1,150 and requires re-approval.
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
              { step: 1, title: 'vLLM multi-model serving setup', desc: 'Nothing else can be tested without this. Done — three-model serving verified 16 Sep 2026.' },
              { step: 2, title: 'Vanilla MAD reproduction (Du et al. 2023)', desc: 'Gate 0 — validates base loop independent of our additions. Done — 10/10 debates, 3/3 rounds.' },
              { step: 3, title: 'Injection protocol (§5.4)', desc: 'Must exist before trust mechanism — trust calibration needs a working stress test. Protocol and B8 injection wiring are in place; GPU pilot next.' },
              { step: 4, title: 'N1 smoke + FP8 precision check, calibration, verifier audit, then pilot (Nov–Dec 2026)', desc: 'N1 96 GB smoke + FP8 precision replication ($25–40), WP-18 placebo/oracle, 24-item calibration, verifier audit (150–200 pairs; lexical baseline 0.58 balanced accuracy; target ≥0.75, κ ≥0.60), then the 50-question Month-1 pilot and 100–150-question G2 pilot.' },
              { step: 5, title: 'Claim decomposition + source-partitioned retrieval', desc: 'Trust formula inputs are outputs of retrieval. Claim decomposition, domain routing, verifier interface, and endpoints are wired at P0.' },
              { step: 6, title: 'Trust update function', desc: 'Unit-test the operator order in isolation: logit accumulation → softmax → floor/ceiling simplex projection. Clamp-then-renormalise is wrong.' },
              { step: 7, title: 'Full debate loop (LangGraph)', desc: 'Core loop, manifest, and resume are wired; WP-13 (B8-no-trust prompt split) landed, and WP-18 remains for the placebo/oracle arms before the Full run.' },
              { step: 8, title: 'Baselines B1–B4', desc: 'Built and mock-verified; B3 and B4-matched are in the executable matrix.' },
              { step: 9, title: 'Baselines B5–B6 (Self-Consistency, MoA)', desc: 'Independent of core mechanism. Can build in parallel with step 10.' },
              { step: 10, title: 'Baseline B9 (iMAD reimplementation)', desc: 'Highest difficulty (~10 days). Sequenced last.' },
              { step: 11, title: 'Core run → Full run', desc: 'G3 Core: 24 runs at 1,280 GPU-h. G4/G5 Full primary: 32 rows at 300 items/dataset with the gold-evidence oracle on SciClaimBench (1,280 GPU-h); the 36-row gold-answer alternate is 1,440 GPU-h. B8-placebo/B8-oracle are WP-18.' },
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
          <Callout variant="info" title="🌿 Repository workflow" className="mt-4">
            <p className="text-sm">
              Two long-lived branches only: <code>main</code> (public mirror) and{" "}
              <code>dev</code> (development; <code>main</code> is the release deploy).
              Snapshots are git tags, not long-lived phase branches:{" "}
              <code>p0-gate</code> and <code>p0-release</code> exist now; Pilot,
              Core and Full tags are planned. Feature work lands on short-lived
              slices and merges back with <code>--no-ff</code>.
            </p>
          </Callout>
          <Callout variant="info" title="⚠ Critical Ordering Constraints" className="mt-4">
            <ul className="text-sm space-y-1">
              <li>Never build trust update <strong>before</strong> retrieval exists.</li>
              <li>Never build B9 (iMAD) <strong>before</strong> the core system (steps 1–7).</li>
              <li>Never run the Core run <strong>before</strong> the Dec 2026 calibration + pilot confirms the core assumption.</li>
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
              <li><strong>If you fall behind:</strong> cut the reranker to a simple overlap score and catch up in the Pilot run — never skip the Gate 0 MAD reproduction or the Dec 2026 calibration + pilot.</li>
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
