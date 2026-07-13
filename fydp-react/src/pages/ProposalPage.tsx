import { PageHeader } from '@/components/layout/PageHeader';
import { Section, SectionTitle } from '@/components/shared/Section';
import { Callout } from '@/components/shared/Callout';
import { GanttTable } from '@/components/shared/GanttTable';
import { ganttPhases } from '@/data/overview';
import { FileText } from 'lucide-react';

export function ProposalPage() {
  return (
    <>
      <PageHeader
        docType="FYDP Research Proposal · Idea 1 · Formal Academic Document"
        title="Research Proposal — Trust-Calibrated Multi-Agent Scientific Deliberation"
        subtitle="For Mitigating Sycophantic Consensus in LLM Reasoning"
        coverItems={[
          { label: 'Author', value: 'Md. Atikur Rahaman' },
          { label: 'Programme', value: 'Final Year Design Project (FYDP)' },
          { label: 'Timeline', value: 'Jul 2026 – Apr 2027 (10 Months)' },
          { label: 'Date', value: 'May 2026' },
        ]}
      />

      <main className="max-w-[1150px] mx-auto my-10 px-4 sm:px-5">
        {/* Print button */}
        <div className="flex justify-end mb-4 print:hidden">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#3b5bdb] text-white text-sm font-semibold rounded-md hover:bg-[#2d4ab8] transition-colors cursor-pointer shadow-sm"
          >
            🖨️ Print / Save as PDF
          </button>
        </div>

        <Section>
          <SectionTitle icon={FileText}>Formal Supervisor Proposal</SectionTitle>
          <Callout variant="info" title="ℹ Document Purpose">
            This is the formal supervisor submission document for the FYDP Research Proposal on
            Trust-Calibrated Multi-Agent Scientific Deliberation. It is designed to be print-ready (A4 format)
            and submitted to the project supervisor for review and approval.
          </Callout>

          {/* Abstract */}
          <div className="mt-6 bg-[#f8fafc] dark:bg-[#1a1d35] border border-[#e2e8f0] dark:border-[rgba(255,255,255,0.1)] rounded-md p-4 sm:p-6" style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
            <h1 className="text-lg sm:text-xl font-bold text-center text-[#1f3a5f] dark:text-[#c7d2fe] mb-1">
              Trust-Calibrated Multi-Agent Scientific Deliberation<br />
              for Mitigating Sycophantic Consensus in LLM Reasoning
            </h1>
            <p className="text-center text-sm text-[#64748b] dark:text-[#94a3b8] mb-1">Md. Atikur Rahaman · FYDP 2026–2027</p>
            <p className="text-center text-xs text-[#94a3b8] mb-4">Supervisor: [Name] · Date: [Date]</p>
            <hr className="border-[#cfcfcf] dark:border-[rgba(255,255,255,0.15)] mb-4" />

            <h2 className="text-base font-bold text-[#1f3a5f] dark:text-[#c7d2fe] mb-2">Abstract</h2>
            <p className="text-sm leading-relaxed mb-4">
              Multi-agent debate (MAD) improves LLM reasoning but is susceptible to{' '}
              <em>inter-agent sycophancy</em>: a confident hallucinating majority systematically suppresses correct
              minority agents. No existing framework provides an in-session, evidence-grounded mechanism to prevent
              this. We propose a <strong>trust-calibrated deliberation system</strong> that re-weights each agent's
              influence dynamically based on the verifiability of its claims against retrieved scientific literature.
              The core contribution is a formally specified trust update rule with proven boundedness properties and
              a probabilistic interpretation. Secondary contribution is an open evaluation harness (CCR/MPR/ECR
              metrics + 9-baseline suite) for future sycophancy mitigation research. We target ≥20% sycophancy
              reduction (CCR metric) vs. vanilla MAD on adversarial benchmarks (BrokenMath, BrokenArXiv, HLE)
              within a 10-month, single-A100 inference-only FYDP project.
            </p>

            <h2 className="text-base font-bold text-[#1f3a5f] dark:text-[#c7d2fe] mb-2">Research Gap</h2>
            <p className="text-sm leading-relaxed mb-4">
              Yao et al. (2025) formalised inter-agent sycophancy; He et al. (2026) quantified correct-minority
              suppression. Neither provides a mitigation mechanism. Standard aggregation methods (majority vote,
              MoA equal-weight averaging) treat all agents as equally trustworthy regardless of evidence quality.
              This project closes the gap with the first dynamic, evidence-grounded trust calibration mechanism.
            </p>

            <h2 className="text-base font-bold text-[#1f3a5f] dark:text-[#c7d2fe] mb-2">Proposed Method</h2>
            <p className="text-sm leading-relaxed mb-2">
              A heterogeneous 3-agent debate pipeline (Qwen ~32B / Mistral-Small-3.2-24B / Phi-4-Reasoning) with:
            </p>
            <ol className="list-decimal list-inside text-sm space-y-1 mb-4 ml-2">
              <li><strong>Adaptive triggering:</strong> low-confidence queries activate the full pipeline</li>
              <li><strong>Source-partitioned RAG:</strong> agents retrieve from separate corpora (PubMed, ArXiv, Semantic Scholar)</li>
              <li><strong>Trust calibration:</strong> S<sub>i</sub><sup>(t+1)</sup> = S<sub>i</sub><sup>(t)</sup> + α·V<sub>i</sub><sup>(t)</sup> − β·H<sub>i</sub><sup>(t)</sup>; T̃<sub>i</sub> = softmax(S); clamp[0.1, 0.9]; renormalise</li>
              <li><strong>Trust-weighted adjudication:</strong> final answer via trust-weighted, not majority-vote, aggregation</li>
            </ol>

            <h2 className="text-base font-bold text-[#1f3a5f] dark:text-[#c7d2fe] mb-2">Evaluation Plan</h2>
            <p className="text-sm leading-relaxed mb-4">
              9 baselines (incl. Self-Consistency, MoA, iMAD) across 5 benchmarks (BrokenMath, BrokenArXiv, HLE,
              GPQA Diamond, MMLU-Pro STEM), 3 random seeds, paired bootstrap testing, 95% confidence intervals,
              effect sizes (Cohen's d). Primary hypotheses: H1: CCR ↑≥20% vs. MAD on adversarial sets; H2: MPR
              ↑≥15pp; H3: ECR &gt;0.80 on GPQA.
            </p>

            <h2 className="text-base font-bold text-[#1f3a5f] dark:text-[#c7d2fe] mb-2">Timeline</h2>
            <div className="mb-4">
              <GanttTable phases={ganttPhases} />
            </div>

            <h2 className="text-base font-bold text-[#1f3a5f] dark:text-[#c7d2fe] mb-2">Feasibility</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div className="text-sm">
                <p className="font-semibold mb-1">Resources Required:</p>
                <ul className="list-disc list-inside space-y-0.5 text-[#444] dark:text-[#94a3b8]">
                  <li>1× A100 80GB (inference only)</li>
                  <li>All models open-weight (no API cost for inference)</li>
                  <li>~$200–400 API budget (judge module only)</li>
                  <li>All datasets publicly available</li>
                </ul>
              </div>
              <div className="text-sm">
                <p className="font-semibold mb-1">Key Milestones:</p>
                <ul className="list-disc list-inside space-y-0.5 text-[#444] dark:text-[#94a3b8]">
                  <li>Gate 0 (Jul): MAD reproduction</li>
                  <li>Gate 1 (Aug): Pilot + baselines</li>
                  <li>Gate 2 (Oct): Prototype done</li>
                  <li>Gate 3 (Jan): Results freeze</li>
                  <li>Apr 2027: Submit + defend</li>
                </ul>
              </div>
            </div>

            <h2 className="text-base font-bold text-[#1f3a5f] dark:text-[#c7d2fe] mb-2">Target Venue</h2>
            <p className="text-sm leading-relaxed mb-4">
              Primary: ACL 2027 Workshop (SRW) or EMNLP 2027 Findings — sufficient for a well-executed FYDP.
              Stretch: NeurIPS 2027 main track (if CCR gain ≥25% and human study n≥50). Fallback: IEEE
              Transactions on Neural Networks (Q1 journal) for extended version with full ablation.
            </p>

            <hr className="border-[#cfcfcf] dark:border-[rgba(255,255,255,0.15)] mb-4" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-[#64748b] dark:text-[#94a3b8]">
              <div><p className="font-semibold text-[#1f3a5f] dark:text-[#c7d2fe] mb-1">Supervisor Signature:</p><p>_______________________</p></div>
              <div><p className="font-semibold text-[#1f3a5f] dark:text-[#c7d2fe] mb-1">Decision:</p><p>☐ Approved  ☐ Revision Required  ☐ Declined</p></div>
              <div><p className="font-semibold text-[#1f3a5f] dark:text-[#c7d2fe] mb-1">Date:</p><p>_______________________</p></div>
            </div>
          </div>
        </Section>
      </main>
    </>
  );
}
