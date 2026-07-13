import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { Section, SectionTitle, ColBox, TwoCol, Chip, ChipRow, RankBadge } from '@/components/shared/Section';
import { KpiRow } from '@/components/shared/KpiRow';
import { Badge } from '@/components/shared/Badge';
import { GanttTable } from '@/components/shared/GanttTable';
import { Timeline } from '@/components/shared/Timeline';
import { InfoGrid } from '@/components/shared/InfoGrid';
import { RiskTable } from '@/components/shared/RiskTable';
import { Callout } from '@/components/shared/Callout';
import {
  overviewKpis, rankedIdeas, detailedScoreRows,
  ganttPhases, milestones, resources, risks, evalAxes,
} from '@/data/overview';

export function OverviewPage() {
  return (
    <>
      <PageHeader
        docType="Final Year Design Project · Formal Supervisor Proposal"
        title={<>FYDP High-Impact Research Proposal<br />(2026 – 2027)</>}
        subtitle="NLP & LLM-Based Q1-Level Research Directions in Agentic AI"
        coverItems={[
          { label: 'Prepared By', value: 'Md. Atikur Rahaman' },
          { label: 'GitHub', value: 'atik203', href: 'https://github.com/atik203' },
          { label: 'Website', value: 'atikurrahaman.live', href: 'https://atikurrahaman.live' },
        ]}
      />

      <main className="max-w-[1150px] mx-auto my-10 px-5">

        {/* 1. Executive Summary */}
        <Section accent="blue">
          <SectionTitle icon="📋">1. Executive Summary</SectionTitle>
          <p className="mb-3 text-[#1e2d3d]">
            This document is a formal research proposal submitted to my FYDP supervisor for the academic year 2026–2027.
            It presents <strong>five rigorously evaluated research directions</strong> in Natural Language Processing (NLP),
            Large Language Models (LLMs), and Agentic AI. Each direction has been assessed against a five-axis evaluation
            framework aligned with Washington Accord engineering standards and Q1 publication requirements (ACL, NeurIPS,
            EMNLP, ICLR, IEEE Transactions).
          </p>
          <p className="mb-3 text-[#1e2d3d]">
            The proposal follows the structure of a top-venue research paper: problem formulation, related work critique,
            proposed architecture, methodology, evaluation plan, expected outcomes, and a realistic 12-month feasibility
            breakdown. The goal is to identify a single research direction for execution, culminating in a peer-reviewed
            publication and a complete FYDP thesis.
          </p>
          <KpiRow kpis={overviewKpis} />
        </Section>

        {/* 2. Evaluation Framework */}
        <Section>
          <SectionTitle icon="⚖️">2. Academic Evaluation Framework</SectionTitle>
          <p className="mb-4 text-[#1e2d3d]">
            Every research direction in this proposal is evaluated against the following five axes, each reflecting a
            critical dimension of a publishable, feasible FYDP project. Scoring is on a 1–5 scale assessed by the author;
            the supervisor is invited to re-score any dimension before a final direction is selected.
          </p>
          <TwoCol>
            {evalAxes.slice(0, 4).map((axis, i) => (
              <ColBox key={i}>
                <h4 className="text-sm font-semibold text-[#1e2d3d] mt-0 mb-2">{axis.title}</h4>
                <p className="text-xs text-[#64748b] mb-0 leading-relaxed">{axis.description}</p>
              </ColBox>
            ))}
          </TwoCol>
          <ColBox className="mt-0">
            <h4 className="text-sm font-semibold text-[#1e2d3d] mt-0 mb-2">Axis 5 — Publication Readiness</h4>
            <p className="text-xs text-[#64748b] mb-0 leading-relaxed">
              Could a well-executed version realistically survive Q1 peer review at ACL, EMNLP, NeurIPS, or ICLR?
              Does it tell a clean story with a falsifiable hypothesis and a meaningful baseline gap?
            </p>
          </ColBox>
        </Section>

        {/* 3. Ranked Ideas */}
        <Section>
          <SectionTitle icon="🏆">3. Ranked Research Directions</SectionTitle>
          <p className="text-sm text-[#64748b] mb-4">Click any title to view the full proposal for that idea.</p>
          <div className="overflow-x-auto rounded-lg shadow-sm">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  {['Rank', 'Research Direction', 'Domain', 'Status', 'Score'].map((h, j) => (
                    <th key={j} className={`p-3 text-left text-xs font-bold bg-[#f1f5f9] border-b-2 border-[#e2e8f0] ${j === 0 ? 'w-14' : ''}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rankedIdeas.map((row) => (
                  <tr key={row.rank} className="border-b border-[#e2e8f0] last:border-0 hover:bg-[#dce4ff] even:bg-[#f8fafc] transition-colors">
                    <td className="p-3"><RankBadge rank={row.rank} /></td>
                    <td className="p-3"><Link to={row.href} className="text-[#3b5bdb] hover:underline font-medium">{row.title}</Link></td>
                    <td className="p-3">{row.domain}</td>
                    <td className="p-3"><Badge variant={row.statusVariant}>{row.status}</Badge></td>
                    <td className="p-3"><strong>{row.score}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {/* 4. Detailed Score Table */}
        <Section>
          <SectionTitle icon="📊">4. Five Rigorously Evaluated Research Directions</SectionTitle>
          <p className="text-sm text-[#64748b] mb-4">
            Each idea has been evaluated across multiple independent dimensions: Novelty, Feasibility, Q1 Publication
            Potential, PhD Impact, Risk Control, and Engineering Complexity. Scoring scale: 1 (Poor) → 5 (Exceptional).<br />
            <strong>Note:</strong> Risk and Complexity are inverted (Higher score = lower risk / lower complexity).
          </p>
          <div className="overflow-x-auto rounded-lg shadow-sm">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  {['Rank', 'Idea Title', 'Domain', 'Summary', 'Novelty', 'Feas.', 'Q1 Pub', 'PhD Imp.', 'Risk ↑', 'Complex. ↑', 'Total'].map((h, j) => (
                    <th key={j} className="p-2.5 text-left text-xs font-bold bg-[#f1f5f9] border-b-2 border-[#e2e8f0]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {detailedScoreRows.map((row) => (
                  <tr key={row.rank} className="border-b border-[#e2e8f0] last:border-0 hover:bg-[#dce4ff] even:bg-[#f8fafc] transition-colors">
                    <td className="p-2.5"><RankBadge rank={row.rank} /></td>
                    <td className="p-2.5"><Link to={row.href} className="text-[#3b5bdb] hover:underline font-semibold">{row.title}</Link></td>
                    <td className="p-2.5"><Badge variant={row.domainVariant}>{row.domainLabel}</Badge></td>
                    <td className="p-2.5 text-xs text-[#1e2d3d] leading-snug min-w-[220px] whitespace-normal">{row.summary}</td>
                    <td className="p-2.5">{row.novelty}</td>
                    <td className="p-2.5">{row.feasibility}</td>
                    <td className="p-2.5">{row.q1pub}</td>
                    <td className="p-2.5">{row.phdImpact}</td>
                    <td className="p-2.5">{row.risk}</td>
                    <td className="p-2.5">{row.complexity}</td>
                    <td className="p-2.5"><strong>{row.total}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {/* 5. 12-Month Project Plan */}
        <Section accent="amber">
          <SectionTitle icon="📅">5. Overall 12-Month Project Plan</SectionTitle>
          <p className="text-[#1e2d3d] mb-4">
            The schedule below represents the master project plan assuming <strong>Idea 1</strong> is selected.
            Phases are designed to allow a mid-point pivot to Idea 2 if the trust-calibration results prove
            inconclusive by Month 6.
          </p>
          <GanttTable phases={ganttPhases} />
          <Timeline items={milestones} />
        </Section>

        {/* 6. Resources */}
        <Section>
          <SectionTitle icon="🛠️">6. Required Resources & Tools</SectionTitle>
          <InfoGrid cards={resources} />
        </Section>

        {/* 7. Risk Register */}
        <Section>
          <SectionTitle icon="⚠️">7. Project Risk Register</SectionTitle>
          <RiskTable rows={risks} />
        </Section>

        {/* 8. How to Read */}
        <Section>
          <SectionTitle icon="📖">8. How to Read This Proposal</SectionTitle>
          <p className="text-[#1e2d3d] mb-3">
            Each idea page (<Link to="/idea/1" className="text-[#3b5bdb] hover:underline">Idea 1</Link> through{' '}
            <Link to="/idea/5" className="text-[#3b5bdb] hover:underline">Idea 5</Link>) follows the exact structure
            of an academic research paper:
          </p>
          <ChipRow>
            <Chip>Core Idea</Chip>
            <Chip>Problem Statement</Chip>
            <Chip>Related Work</Chip>
            <Chip variant="green">Research Gap</Chip>
            <Chip>Proposed Architecture</Chip>
            <Chip>Methodology</Chip>
            <Chip>Evaluation Plan</Chip>
            <Chip variant="green">Expected Results</Chip>
            <Chip variant="amber">Q1 Justification</Chip>
            <Chip variant="amber">Feasibility & Risks</Chip>
          </ChipRow>
          <p className="text-[#1e2d3d] mb-4">
            The <Link to="/conclusion" className="text-[#3b5bdb] hover:underline">Conclusion</Link> page provides
            a critical cross-idea comparison, identifies the top 2 recommendations, and outlines the PhD trajectory
            plan for 2026–2030.
          </p>
          <Callout variant="info" title="ℹ Supervisor Action Required">
            After reviewing all idea pages and the conclusion, please select a preferred research direction and note
            any concerns regarding scope, resources, or methodological approach. Your feedback will be incorporated
            into the final project specification document (to be submitted within 2 weeks of approval).
          </Callout>
        </Section>

      </main>
    </>
  );
}
