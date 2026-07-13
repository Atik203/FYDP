import { PageHeader } from '@/components/layout/PageHeader';
import { Section, SectionTitle, TwoCol, ColBox } from '@/components/shared/Section';
import { PipelineFlow } from '@/components/shared/PipelineFlow';
import type { PipeStep } from '@/components/shared/PipelineFlow';
import { KpiRow } from '@/components/shared/KpiRow';
import { InfoGrid } from '@/components/shared/InfoGrid';
import { RiskTable } from '@/components/shared/RiskTable';
import { GanttTable } from '@/components/shared/GanttTable';
import { Timeline } from '@/components/shared/Timeline';
import { ganttPhases, milestones, resources, risks } from '@/data/overview';
import { ideaMetadata } from '@/data/ideas';
import { ClipboardList, Target, Building2, Calendar, Wrench, TriangleAlert, HelpCircle, Brain, FileSearch, BookOpen, Scale, RefreshCw, Gavel, Sparkles } from 'lucide-react';

const pipelineSteps: PipeStep[] = [
  { id: 'input', icon: HelpCircle, title: 'Input Question', desc: 'Scientific question enters the deliberation system', color: 'sky' },
  { id: 'gate', icon: Brain, title: 'Confidence Gate', desc: 'Lightweight check if full debate is needed vs. direct answer', color: 'amber' },
  { id: 'agents', icon: Sparkles, title: '3 Heterogeneous Agents', desc: 'Qwen3-32B, Mistral-Small-24B, Phi-4-Reasoning state initial positions', color: 'violet' },
  { id: 'decomp', icon: FileSearch, title: 'Claim Decomposition', desc: 'Each answer split into atomic, verifiable propositions', color: 'indigo' },
  { id: 'retrieval', icon: BookOpen, title: 'Source-Partitioned Retrieval', desc: 'Agent A→PubMed, B→ArXiv, C→Semantic Scholar — prevents narrow retrieval', color: 'teal' },
  { id: 'scoring', icon: Scale, title: 'Evidence Scoring', desc: 'Cross-encoder reranker: supports / contradicts / no evidence per claim', color: 'emerald' },
  { id: 'trust', icon: RefreshCw, title: 'Trust Update', desc: 'Sᵢ(t+1) = Sᵢ(t) + α·Vᵢ − β·Hᵢ → softmax → clamp[0.1, 0.9] → renormalize', color: 'rose' },
  { id: 'revise', icon: RefreshCw, title: 'Revision Rounds (K=3)', desc: 'Agents see peer arguments + own trust standing; repeat retrieval → update loop', color: 'violet' },
  { id: 'adjudicate', icon: Gavel, title: 'Trust-Weighted Adjudication', desc: 'Final answer = argmax over Σ(Tᵢ × positionᵢ) — NOT majority vote', color: 'indigo' },
  { id: 'output', icon: Sparkles, title: 'Final Output', desc: 'Answer + evidence citations + trust trajectory + per-agent reasoning', color: 'teal' },
];

const idea = ideaMetadata[0];

export function OverviewPage() {
  return (
    <>
      <PageHeader
        docType="Final Year Design Project · Formal Supervisor Proposal"
        title={<>Trust-Calibrated Multi-Agent<br />Scientific Deliberation</>}
        subtitle="For Mitigating Sycophantic Consensus in LLM Reasoning · Agentic AI · ACL / EMNLP / NeurIPS 2027"
        coverItems={[
          { label: 'Prepared By', value: 'Md. Atikur Rahaman' },
          { label: 'GitHub', value: 'atik203', href: 'https://github.com/atik203' },
          { label: 'Website', value: 'atikurrahaman.live', href: 'https://atikurrahaman.live' },
          { label: 'Timeline', value: 'Jul 2026 – Apr 2027' },
        ]}
      />

      <main className="max-w-[1150px] mx-auto my-10 px-4 sm:px-5">
        {/* Executive Summary */}
        <Section accent="blue" className="animate-fade-up">
          <SectionTitle icon={ClipboardList}>Executive Summary</SectionTitle>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-sm sm:text-base leading-relaxed mb-3">
                Multi-agent debate (MAD) improves LLM reasoning but is susceptible to{' '}
                <strong>inter-agent sycophancy</strong>: a confident hallucinating majority systematically
                suppresses correct minority agents. No existing framework provides an in-session,
                evidence-grounded mechanism to prevent this.
              </p>
              <p className="text-sm sm:text-base leading-relaxed">
                We propose a <strong>trust-calibrated deliberation system</strong> that re-weights each agent's
                influence dynamically based on the verifiability of its claims against retrieved scientific
                literature. The core contribution is a formally specified trust update rule with proven
                boundedness properties.
              </p>
            </div>
            <div>
              <p className="text-sm sm:text-base leading-relaxed mb-3">
                <strong>Secondary contribution</strong> is an open evaluation harness (CCR/MPR/ECR metrics +
                9-baseline suite) for future sycophancy mitigation research.
              </p>
              <p className="text-sm sm:text-base leading-relaxed">
                We target <strong>≥20% sycophancy reduction</strong> (CCR metric) vs. vanilla MAD on adversarial
                benchmarks (BrokenMath, BrokenArXiv, HLE) within a 10-month, single-A100 inference-only FYDP
                project.
              </p>
            </div>
          </div>

          <KpiRow kpis={idea.kpis} />
        </Section>

        {/* Problem & Research Gap */}
        <Section className="animate-fade-up animate-delay-1">
          <SectionTitle icon={Target}>Problem &amp; Research Gap</SectionTitle>
          <TwoCol>
            <ColBox>
              <h4 className="text-sm font-bold mb-2">The Problem</h4>
              <p className="text-sm leading-relaxed">
                In multi-agent LLM debate, a confidently wrong majority can cause a correct minority agent to
                abandon its position — even without any new evidence being presented. Standard majority-vote
                aggregation then locks in the wrong answer. This is called{' '}
                <strong>inter-agent sycophancy</strong>.
              </p>
            </ColBox>
            <ColBox>
              <h4 className="text-sm font-bold mb-2">The Gap</h4>
              <p className="text-sm leading-relaxed">
                Diagnosis exists (Yao et al. 2025; He et al. 2026). Efficiency optimization exists (iMAD, AAAI
                2026). Static aggregation exists (MoA, ICLR 2025 Spotlight).{' '}
                <strong>Nothing existing dynamically re-weights agent trust during a debate based on external
                evidence.</strong> That is the specific, verified gap.
              </p>
            </ColBox>
          </TwoCol>
        </Section>

        {/* Pipeline Overview */}
        <Section accent="teal" className="animate-fade-up animate-delay-2">
          <SectionTitle icon={Building2}>System Pipeline</SectionTitle>
          <p className="text-sm mb-5">
            End-to-end deliberation flow. <strong>Confident queries</strong> skip directly to answer; uncertain
            queries trigger the full evidence-grounded debate pipeline.
          </p>

          {/* Phase indicators */}
          <div className="flex flex-wrap gap-2 mb-6">
            {[
              { label: 'Init', color: 'bg-[#1c7ed6]' },
              { label: 'Gate', color: 'bg-[#f08c00]' },
              { label: 'Debate', color: 'bg-[#7c3aed]' },
              { label: 'Evidence', color: 'bg-[#0ca678]' },
              { label: 'Output', color: 'bg-[#6366f1]' },
            ].map((p) => (
              <span key={p.label} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold text-white" style={{ background: p.color }}>
                <span className="w-1.5 h-1.5 rounded-full bg-white/60" />
                {p.label}
              </span>
            ))}
          </div>

          <PipelineFlow steps={pipelineSteps} />

          <div className="mt-5 flex items-center gap-2 text-xs text-[#64748b] dark:text-[#94a3b8] bg-[#f8fafc] dark:bg-[rgba(255,255,255,0.03)] rounded-lg p-3 border border-[#e2e8f0] dark:border-[rgba(255,255,255,0.08)]">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#0ca678] text-white text-[10px] font-bold flex-shrink-0">✓</span>
            Confident queries bypass the debate loop and return a direct answer from the gate.
          </div>
        </Section>

        {/* 12-Month Plan */}
        <Section accent="amber" className="animate-fade-up animate-delay-3">
          <SectionTitle icon={Calendar}>10-Month Execution Plan (Jul 2026 – Apr 2027)</SectionTitle>
          <p className="text-sm mb-4">
            Phases aligned to the research master blueprint. Gates 0–3 mark explicit go/no-go decision points.
          </p>
          <GanttTable phases={ganttPhases} />
          <Timeline items={milestones} />
        </Section>

        {/* Resources */}
        <Section className="animate-fade-up animate-delay-4">
          <SectionTitle icon={Wrench}>Models &amp; Tools</SectionTitle>
          <InfoGrid cards={resources} />
        </Section>

        {/* Risk Register */}
        <Section className="animate-fade-up animate-delay-5">
          <SectionTitle icon={TriangleAlert}>Risk Register</SectionTitle>
          <p className="text-sm mb-4">
            Risk assessment per blueprint §11. Highest-risk item (Challenge C — behavioral effectiveness)
            mitigated via Month 1 pilot before full build.
          </p>
          <RiskTable rows={risks} />
        </Section>
      </main>
    </>
  );
}
