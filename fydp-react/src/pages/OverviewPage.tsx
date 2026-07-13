import { PageHeader } from '@/components/layout/PageHeader';
import { Section, SectionTitle, TwoCol, ColBox } from '@/components/shared/Section';
import { KpiRow } from '@/components/shared/KpiRow';
import { ideaMetadata } from '@/data/ideas';
import { ClipboardList, Target, ArrowUpRight, FolderOpen, Cog, CheckCircle } from 'lucide-react';

const idea = ideaMetadata[0];

export function OverviewPage() {
  return (
    <>
      <PageHeader
        docType="Final Year Design Project · Trust-Calibrated Multi-Agent Scientific Deliberation"
        title={<>Trust-Calibrated Multi-Agent<br />Scientific Deliberation</>}
        subtitle="For Mitigating Sycophantic Consensus in LLM Reasoning · Agentic AI · ACL / EMNLP / NeurIPS 2027"
        coverItems={[
          { label: 'Prepared By', value: 'Md. Atikur Rahaman' },
          { label: 'GitHub', value: 'atik203', href: 'https://github.com/atik203' },
          { label: 'Timeline', value: 'Jul 2026 – Apr 2027' },
        ]}
      />

      <main className="max-w-[1150px] mx-auto my-10 px-4 sm:px-5">
        {/* Executive Summary — the 30-second pitch */}
        <Section accent="blue" className="animate-fade-up">
          <SectionTitle icon={ClipboardList} className="border-0 mb-3">Executive Summary</SectionTitle>

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

        {/* Quick understanding cards — 3 key points in 10 seconds */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-7 animate-fade-up animate-delay-1">
          {[
            { icon: FolderOpen, title: 'The Problem', desc: 'Confident wrong majorities override correct minorities in AI debate — no existing fix.' },
            { icon: Cog, title: 'Our Solution', desc: 'Evidence-grounded trust weighting: agents whose claims check out against real papers earn more influence.' },
            { icon: CheckCircle, title: 'The Goal', desc: '≥20% sycophancy reduction on adversarial benchmarks, validated against 9 baselines.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="glass-card rounded-lg p-5 border border-[#e2e8f0] dark:border-[rgba(255,255,255,0.1)]">
              <div className="flex items-center gap-3 mb-2">
                <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#3b5bdb]/10 dark:bg-[#3b5bdb]/20 text-[#3b5bdb] dark:text-[#93c5fd]">
                  <Icon size={18} />
                </span>
                <h3 className="text-sm font-bold text-[#1e2d3d] dark:text-[#e2e8f0]">{title}</h3>
              </div>
              <p className="text-xs text-[#64748b] dark:text-[#94a3b8] leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* Problem & Research Gap */}
        <Section className="animate-fade-up animate-delay-1">
          <SectionTitle icon={Target} className="border-0 mb-3">Problem &amp; Research Gap</SectionTitle>
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

        {/* Quick links to blueprint detail */}
        <div className="flex flex-wrap gap-3 justify-center animate-fade-up animate-delay-2 print:hidden">
          {[
            { label: 'Full Blueprint →', href: '/idea/1' },
            { label: 'Execution Roadmap →', href: '/roadmap' },
            { label: 'Formal Proposal →', href: '/proposal' },
          ].map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#3b5bdb]/10 dark:bg-[#3b5bdb]/20 text-[#3b5bdb] dark:text-[#93c5fd] text-sm font-semibold hover:bg-[#3b5bdb]/20 dark:hover:bg-[#3b5bdb]/30 transition-colors no-underline"
            >
              {link.label} <ArrowUpRight size={14} />
            </a>
          ))}
        </div>
      </main>
    </>
  );
}