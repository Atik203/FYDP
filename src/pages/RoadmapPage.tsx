import { PageHeader } from '@/components/layout/PageHeader';
import { Section, SectionTitle } from '@/components/shared/Section';
import { Badge } from '@/components/shared/Badge';
import { GanttTable } from '@/components/shared/GanttTable';
import { Timeline } from '@/components/shared/Timeline';
import { Callout } from '@/components/shared/Callout';
import { ganttPhases, milestones } from '@/data/overview';
import { Calendar, ClipboardList, BookOpen, Brain, Bot, Users, Search, Ruler } from 'lucide-react';

/* ── Learning Roadmap Data (unchanged from original, Idea-1-specific) ─── */

interface RoadmapTopic {
  num: number;
  topic: string;
  level: string;
  levelEmoji: string;
  importance: string;
  whyNeeded: string;
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
      { num: 1, topic: 'Neural Networks', level: 'Intermediate', levelEmoji: '🟢', importance: 'High', whyNeeded: 'Understand model structure and inference' },
      { num: 2, topic: 'Transformer Architecture', level: 'Advanced', levelEmoji: '🟡', importance: 'Critical', whyNeeded: 'Foundation of all LLM agents' },
      { num: 3, topic: 'Attention Mechanism', level: 'Advanced', levelEmoji: '🟡', importance: 'Critical', whyNeeded: 'Understanding trust influence and context handling' },
      { num: 4, topic: 'Embeddings & Vector Representations', level: 'Intermediate', levelEmoji: '🟢', importance: 'Critical', whyNeeded: 'Core of RAG and retrieval pipelines' },
      { num: 5, topic: 'Model Quantization (GPTQ / AWQ)', level: 'Intermediate', levelEmoji: '🟢', importance: 'High', whyNeeded: 'Efficient local inference on A100' },
      { num: 6, topic: 'Inference vs Fine-Tuning', level: 'Intermediate', levelEmoji: '🟢', importance: 'Medium', whyNeeded: 'Your work focuses on inference orchestration' },
    ],
  },
  {
    id: 'llm', icon: Bot, title: 'Large Language Models', accent: 'blue',
    topics: [
      { num: 1, topic: 'LLM Text Generation', level: 'Advanced', levelEmoji: '🟡', importance: 'Critical', whyNeeded: 'Understand how models reason and fail' },
      { num: 2, topic: 'Chain-of-Thought (CoT)', level: 'Advanced', levelEmoji: '🟡', importance: 'Critical', whyNeeded: 'Main baseline and reasoning style' },
      { num: 3, topic: 'Self-Consistency Decoding', level: 'Advanced', levelEmoji: '🟡', importance: 'Critical', whyNeeded: 'Major experimental baseline (B5)' },
      { num: 4, topic: 'Prompt Engineering', level: 'Intermediate', levelEmoji: '🟢', importance: 'High', whyNeeded: 'Agent orchestration and structured prompting' },
      { num: 5, topic: 'Temperature & Sampling', level: 'Intermediate', levelEmoji: '🟢', importance: 'Medium', whyNeeded: 'Generating agent diversity' },
      { num: 6, topic: 'Hallucination in LLMs', level: 'Expert', levelEmoji: '🔴', importance: 'Critical', whyNeeded: 'Your main failure mode' },
      { num: 7, topic: 'Sycophancy in LLMs', level: 'Expert', levelEmoji: '🔴', importance: 'Critical', whyNeeded: 'Core research problem' },
      { num: 8, topic: 'Model Calibration (ECE)', level: 'Expert', levelEmoji: '🔴', importance: 'Critical', whyNeeded: 'Foundation of trust calibration' },
      { num: 9, topic: 'Two-Phase Model Strategy', level: 'Intermediate', levelEmoji: '🟢', importance: 'High', whyNeeded: 'Dev (Qwen3.5-9B / Gem4 12B / Phi-4) → Final (Qwen3.6-27B / Gem4 26B / Mistral 24B) models (Ph 0–1)' },
      { num: 10, topic: 'Sycophancy Injection Protocol Design', level: 'Expert', levelEmoji: '🔴', importance: 'Critical', whyNeeded: 'CCR operationalization; κ > 0.75 pilot check (Phase 1–2)' },
      { num: 11, topic: 'LLM Uncertainty & Confidence Estimation', level: 'Advanced', levelEmoji: '🟡', importance: 'High', whyNeeded: 'Lightweight confidence gating (Phase 2)' },
    ],
  },
  {
    id: 'agents', icon: Users, title: 'Multi-Agent Systems', accent: 'amber',
    topics: [
      { num: 1, topic: 'Multi-Agent Debate (MAD)', level: 'Expert', levelEmoji: '🔴', importance: 'Critical', whyNeeded: 'Main paradigm your work extends' },
      { num: 2, topic: 'Mixture of Agents (MoA)', level: 'Advanced', levelEmoji: '🟡', importance: 'High', whyNeeded: 'Important baseline (B6)' },
      { num: 3, topic: 'iMAD Framework', level: 'Advanced', levelEmoji: '🟡', importance: 'Critical', whyNeeded: 'Closest competitor baseline' },
      { num: 4, topic: 'Consensus Mechanisms', level: 'Advanced', levelEmoji: '🟡', importance: 'High', whyNeeded: 'Understanding majority-vote limitations' },
      { num: 5, topic: 'Trust & Reputation Systems', level: 'Expert', levelEmoji: '🔴', importance: 'Critical', whyNeeded: 'Foundation of your contribution' },
      { num: 6, topic: 'Agentic AI Paradigm', level: 'Intermediate', levelEmoji: '🟢', importance: 'Medium', whyNeeded: 'Broader research positioning' },
      { num: 7, topic: 'Debate Prompt Design', level: 'Advanced', levelEmoji: '🟡', importance: 'High', whyNeeded: 'Structuring adversarial reasoning (Phase 1–2)' },
      { num: 8, topic: 'Adaptive Triggering / Confidence Gating', level: 'Advanced', levelEmoji: '🟡', importance: 'High', whyNeeded: 'Gate full debate pipeline (Phase 2)' },
      { num: 9, topic: 'Heterogeneous Multi-Model Agent Design', level: 'Advanced', levelEmoji: '🟡', importance: 'High', whyNeeded: 'Reducing correlated hallucinations' },
    ],
  },
  {
    id: 'rag', icon: Search, title: 'Retrieval-Augmented Generation (RAG)', accent: 'rose',
    topics: [
      { num: 1, topic: 'Dense Retrieval (DPR, Contriever)', level: 'Advanced', levelEmoji: '🟡', importance: 'Critical', whyNeeded: 'Atomic claim retrieval backbone' },
      { num: 2, topic: 'Cross-Encoder Reranking', level: 'Advanced', levelEmoji: '🟡', importance: 'Critical', whyNeeded: 'Evidence scoring per claim (Phase 2)' },
      { num: 3, topic: 'FAISS Vector Index', level: 'Intermediate', levelEmoji: '🟢', importance: 'High', whyNeeded: 'Efficient similarity search at scale' },
      { num: 4, topic: 'Source-Partitioned Retrieval', level: 'Expert', levelEmoji: '🔴', importance: 'Critical', whyNeeded: 'Your novel retrieval strategy (Phase 2–3)' },
      { num: 5, topic: 'Atomic Claim Decomposition', level: 'Expert', levelEmoji: '🔴', importance: 'Critical', whyNeeded: 'Breaking agent utterances into verifiable propositions (Phase 2)' },
      { num: 6, topic: 'RAG Evaluation Metrics', level: 'Advanced', levelEmoji: '🟡', importance: 'High', whyNeeded: 'Measuring retrieval quality (Phase 3–4)' },
    ],
  },
  {
    id: 'eval', icon: Ruler, title: 'Evaluation & Statistics', accent: 'none',
    topics: [
      { num: 1, topic: 'Statistical Significance Testing', level: 'Advanced', levelEmoji: '🟡', importance: 'Critical', whyNeeded: 'Paired bootstrap, McNemar tests for all main results' },
      { num: 2, topic: 'Effect Size Reporting', level: 'Advanced', levelEmoji: '🟡', importance: 'Critical', whyNeeded: "Cohen's d, Cliff's delta for sycophancy reduction claims" },
      { num: 3, topic: 'Inter-rater Agreement (κ)', level: 'Advanced', levelEmoji: '🟡', importance: 'High', whyNeeded: 'Validating sycophancy injection protocol (Phase 1 pilot)' },
      { num: 4, topic: 'Ablation Study Design', level: 'Expert', levelEmoji: '🔴', importance: 'Critical', whyNeeded: 'Isolating each component contribution; required for Q1 submission' },
      { num: 5, topic: 'Calibration Metrics (ECE, ECR)', level: 'Expert', levelEmoji: '🔴', importance: 'Critical', whyNeeded: 'Your primary ECR metric' },
      { num: 6, topic: 'Benchmark Evaluation Harness', level: 'Advanced', levelEmoji: '🟡', importance: 'High', whyNeeded: 'Reproducible multi-benchmark evaluation' },
    ],
  },
];

const importanceBadge = (imp: string) => {
  if (imp === 'Critical') return <Badge variant="rose">Critical</Badge>;
  if (imp === 'High') return <Badge variant="amber">High</Badge>;
  return <Badge variant="blue">Medium</Badge>;
};

function RoadmapTable({ topics }: { topics: RoadmapTopic[] }) {
  return (
    <div className="overflow-x-auto rounded-lg shadow-sm">
      <table className="w-full border-collapse text-xs sm:text-sm">
        <thead>
          <tr>
            {['#', 'Topic', 'Level Needed', 'Importance', 'Why Needed'].map((h) => (
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

        {/* ── SECTION C: Learning Level Guide ── */}
        <Section className="animate-fade-up animate-delay-2">
          <SectionTitle icon={BookOpen}>C. Learning Level Guide</SectionTitle>
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

        {/* ── SECTION D: Topic Roadmaps ── */}
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
