import { PageHeader } from '@/components/layout/PageHeader';
import { Section, SectionTitle } from '@/components/shared/Section';
import { Badge } from '@/components/shared/Badge';

interface RoadmapTopic {
  num: number;
  topic: string;
  level: string;
  levelEmoji: string;
  importance: string;
  whyNeeded: string;
}

interface RoadmapSection {
  id: string;
  icon: string;
  title: string;
  accent: 'teal' | 'blue' | 'amber' | 'rose' | 'none';
  topics: RoadmapTopic[];
}

const roadmapSections: RoadmapSection[] = [
  {
    id: 'core', icon: '🧠', title: 'Core ML & Deep Learning', accent: 'teal',
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
    id: 'llm', icon: '🤖', title: 'Large Language Models', accent: 'blue',
    topics: [
      { num: 1, topic: 'LLM Text Generation', level: 'Advanced', levelEmoji: '🟡', importance: 'Critical', whyNeeded: 'Understand how models reason and fail' },
      { num: 2, topic: 'Chain-of-Thought (CoT)', level: 'Advanced', levelEmoji: '🟡', importance: 'Critical', whyNeeded: 'Main baseline and reasoning style' },
      { num: 3, topic: 'Self-Consistency Decoding', level: 'Advanced', levelEmoji: '🟡', importance: 'Critical', whyNeeded: 'Major experimental baseline (B5)' },
      { num: 4, topic: 'Prompt Engineering', level: 'Intermediate', levelEmoji: '🟢', importance: 'High', whyNeeded: 'Agent orchestration and structured prompting' },
      { num: 5, topic: 'Temperature & Sampling', level: 'Intermediate', levelEmoji: '🟢', importance: 'Medium', whyNeeded: 'Generating agent diversity' },
      { num: 6, topic: 'Hallucination in LLMs', level: 'Expert', levelEmoji: '🔴', importance: 'Critical', whyNeeded: 'Your main failure mode' },
      { num: 7, topic: 'Sycophancy in LLMs', level: 'Expert', levelEmoji: '🔴', importance: 'Critical', whyNeeded: 'Core research problem' },
      { num: 8, topic: 'Model Calibration (ECE)', level: 'Expert', levelEmoji: '🔴', importance: 'Critical', whyNeeded: 'Foundation of trust calibration' },
      { num: 9, topic: 'Open-Weight Models Ecosystem', level: 'Intermediate', levelEmoji: '🟢', importance: 'High', whyNeeded: 'Choosing Qwen / Mistral-Small / Phi models; verifying released checkpoints (Phase 0–1)' },
      { num: 10, topic: 'Sycophancy Injection Protocol Design', level: 'Expert', levelEmoji: '🔴', importance: 'Critical', whyNeeded: 'Designing & validating adversarial majority injection; CCR operationalization; κ > 0.75 pilot check (Phase 1–2)' },
      { num: 11, topic: 'LLM Uncertainty & Confidence Estimation', level: 'Advanced', levelEmoji: '🟡', importance: 'High', whyNeeded: 'Lightweight confidence scoring to gate deliberation (Phase 2)' },
    ],
  },
  {
    id: 'agents', icon: '👥', title: 'Multi-Agent Systems', accent: 'amber',
    topics: [
      { num: 1, topic: 'Multi-Agent Debate (MAD)', level: 'Expert', levelEmoji: '🔴', importance: 'Critical', whyNeeded: 'Main paradigm your work extends' },
      { num: 2, topic: 'Mixture of Agents (MoA)', level: 'Advanced', levelEmoji: '🟡', importance: 'High', whyNeeded: 'Important baseline (B6)' },
      { num: 3, topic: 'iMAD Framework', level: 'Advanced', levelEmoji: '🟡', importance: 'Critical', whyNeeded: 'Closest competitor baseline' },
      { num: 4, topic: 'Consensus Mechanisms', level: 'Advanced', levelEmoji: '🟡', importance: 'High', whyNeeded: 'Understanding majority-vote limitations' },
      { num: 5, topic: 'Trust & Reputation Systems', level: 'Expert', levelEmoji: '🔴', importance: 'Critical', whyNeeded: 'Foundation of your contribution' },
      { num: 6, topic: 'Agentic AI Paradigm', level: 'Intermediate', levelEmoji: '🟢', importance: 'Medium', whyNeeded: 'Broader research positioning' },
      { num: 7, topic: 'Debate Prompt Design', level: 'Advanced', levelEmoji: '🟡', importance: 'High', whyNeeded: 'Structuring adversarial reasoning (Phase 1–2)' },
      { num: 8, topic: 'Adaptive Triggering / Confidence Gating', level: 'Advanced', levelEmoji: '🟡', importance: 'High', whyNeeded: 'Gate the full debate pipeline on a lightweight confidence estimator (Phase 2)' },
      { num: 9, topic: 'Heterogeneous Multi-Model Agent Design', level: 'Advanced', levelEmoji: '🟡', importance: 'High', whyNeeded: 'Combining agents from different open-weight families (Qwen / Mistral-Small / Phi) to reduce correlated hallucinations' },
    ],
  },
  {
    id: 'rag', icon: '🔍', title: 'Retrieval-Augmented Generation (RAG)', accent: 'rose',
    topics: [
      { num: 1, topic: 'Dense Retrieval (DPR, Contriever)', level: 'Advanced', levelEmoji: '🟡', importance: 'Critical', whyNeeded: 'Atomic claim retrieval backbone' },
      { num: 2, topic: 'Cross-Encoder Reranking', level: 'Advanced', levelEmoji: '🟡', importance: 'Critical', whyNeeded: 'Evidence scoring per claim (Phase 2)' },
      { num: 3, topic: 'FAISS Vector Index', level: 'Intermediate', levelEmoji: '🟢', importance: 'High', whyNeeded: 'Efficient similarity search at scale' },
      { num: 4, topic: 'Source-Partitioned Retrieval', level: 'Expert', levelEmoji: '🔴', importance: 'Critical', whyNeeded: 'Your novel retrieval strategy — agents retrieve from separate corpora (Phase 2–3)' },
      { num: 5, topic: 'Atomic Claim Decomposition', level: 'Expert', levelEmoji: '🔴', importance: 'Critical', whyNeeded: 'Breaking agent utterances into verifiable propositions (Phase 2)' },
      { num: 6, topic: 'RAG Evaluation Metrics', level: 'Advanced', levelEmoji: '🟡', importance: 'High', whyNeeded: 'Measuring retrieval quality (faithfulness, context recall) as a diagnostic (Phase 3–4)' },
    ],
  },
  {
    id: 'eval', icon: '📐', title: 'Evaluation & Statistics', accent: 'none',
    topics: [
      { num: 1, topic: 'Statistical Significance Testing', level: 'Advanced', levelEmoji: '🟡', importance: 'Critical', whyNeeded: 'Paired bootstrap, McNemar tests for all main results' },
      { num: 2, topic: 'Effect Size Reporting', level: 'Advanced', levelEmoji: '🟡', importance: 'Critical', whyNeeded: "Cohen's d, Cliff's delta for sycophancy reduction claims" },
      { num: 3, topic: 'Inter-rater Agreement (κ)', level: 'Advanced', levelEmoji: '🟡', importance: 'High', whyNeeded: 'Validating sycophancy injection protocol (Phase 1 pilot)' },
      { num: 4, topic: 'Ablation Study Design', level: 'Expert', levelEmoji: '🔴', importance: 'Critical', whyNeeded: 'Isolating each component contribution; required for Q1 submission' },
      { num: 5, topic: 'Calibration Metrics (ECE, ECR)', level: 'Expert', levelEmoji: '🔴', importance: 'Critical', whyNeeded: 'Your primary ECR metric — trust weight calibration vs. ground truth correctness' },
      { num: 6, topic: 'Benchmark Evaluation Harness', level: 'Advanced', levelEmoji: '🟡', importance: 'High', whyNeeded: 'Reproducible multi-benchmark evaluation (lm-eval-harness or custom)' },
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
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            {['#', 'Topic', 'Level Needed', 'Importance', 'Why Needed'].map((h) => (
              <th key={h} className="p-3 text-left text-xs font-bold bg-[#f1f5f9] border-b-2 border-[#e2e8f0]">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {topics.map((t) => (
            <tr key={t.num} className="border-b border-[#e2e8f0] last:border-0 hover:bg-[#dce4ff] even:bg-[#f8fafc] transition-colors">
              <td className="p-3">{t.num}</td>
              <td className="p-3 font-medium">{t.topic}</td>
              <td className="p-3">{t.levelEmoji} {t.level}</td>
              <td className="p-3">{importanceBadge(t.importance)}</td>
              <td className="p-3 text-sm text-[#64748b]">{t.whyNeeded}</td>
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
        docType="FYDP Learning Roadmap · Idea 1 — Trust-Calibrated Multi-Agent Deliberation"
        title={<>Idea 1 Learning Roadmap<br /><span style={{ fontSize: '0.6em', opacity: 0.9 }}>Trust-Calibrated Multi-Agent Scientific Deliberation</span></>}
        subtitle="Complete Topic Roadmap · Phase-Aligned · Q1 / ACL / EMNLP Publication Preparation"
        coverItems={[
          { label: 'Total Duration', value: '10 Months (5 Phases)' },
          { label: 'Weekly Time', value: '15–20 Hours' },
          { label: 'Target Venue', value: 'ACL W. / EMNLP Findings / TMLR' },
          { label: 'Research Focus', value: 'Agentic AI · Anti-Sycophancy · Trust Calibration' },
        ]}
      />

      <main className="max-w-[1150px] mx-auto my-10 px-5">
        {/* Learning Level Guide */}
        <Section accent="blue">
          <SectionTitle icon="📘">Learning Level Guide</SectionTitle>
          <div className="overflow-x-auto rounded-lg shadow-sm">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="p-3 text-left text-xs font-bold bg-[#f1f5f9] border-b-2 border-[#e2e8f0]">Level</th>
                  <th className="p-3 text-left text-xs font-bold bg-[#f1f5f9] border-b-2 border-[#e2e8f0]">Meaning</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['🔵 Beginner', 'Basic conceptual understanding only'],
                  ['🟢 Intermediate', 'Comfortable using and modifying existing implementations'],
                  ['🟡 Advanced', 'Able to implement, debug, and explain independently'],
                  ['🔴 Expert', 'Deep enough understanding to contribute novel research ideas'],
                ].map(([level, meaning]) => (
                  <tr key={level} className="border-b border-[#e2e8f0] last:border-0 hover:bg-[#dce4ff] even:bg-[#f8fafc] transition-colors">
                    <td className="p-3 font-medium">{level}</td>
                    <td className="p-3">{meaning}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {/* Roadmap Sections */}
        {roadmapSections.map((sec) => (
          <Section key={sec.id} accent={sec.accent}>
            <SectionTitle icon={sec.icon}>{sec.title}</SectionTitle>
            <RoadmapTable topics={sec.topics} />
          </Section>
        ))}
      </main>
    </>
  );
}
