import { PageHeader } from "@/components/layout/PageHeader";
import { KpiRow } from "@/components/shared/KpiRow";
import type { KpiCard } from "@/data/overview";
import {
  ColBox,
  Section,
  SectionTitle,
  TwoCol,
} from "@/components/shared/Section";
import { ideaMetadata } from "@/data/ideas";
import {
  ArrowUpRight,
  CheckCircle,
  ClipboardList,
  Cog,
  FolderOpen,
  Target,
} from "lucide-react";
import { Link } from "react-router-dom";

const idea = ideaMetadata[0];

const p0Kpis: KpiCard[] = [
  { value: "514", label: "Tests passing", variant: "green" },
  { value: "13/13", label: "P0 gate checks", variant: "green" },
  { value: "24", label: "Core runs · 1,280 GPU-h", variant: "default" },
  { value: "300", label: "Benchmark target · 180 floor", variant: "sky" },
  { value: "69.73 GB / 96 GB", label: "Final stack · one Blackwell card", variant: "rose" },
];

export function OverviewPage() {
  return (
    <>
      <PageHeader
        docType="Final Year Design Project · The Trust Boundary"
        title={
          <>
            The Boundaries of Evidence-Grounded
            <br />
            Trust in Multi-Agent Scientific Debate
          </>
        }
        subtitle="with a Controlled Benchmark for Sycophantic Consensus · Agentic AI · TACL / EMNLP 2028"
        coverItems={[
          { label: "Prepared By", value: "Md. Atikur Rahaman" },
          {
            label: "GitHub",
            value: "atik203",
            href: "https://github.com/atik203",
          },
          { label: "Timeline", value: "Jul 2026 – Dec 2027" },
          { label: "Key Dates", value: "Thesis Jun 2027 · Defence Jun/Jul 2027 · Paper Aug–Dec 2027" },
        ]}
      />

      <main className="max-w-[1150px] mx-auto my-10 px-4 sm:px-5">
        {/* Executive Summary — the 30-second pitch */}
        <Section accent="blue" className="animate-fade-up">
          <SectionTitle icon={ClipboardList} className="border-0 mb-3">
            Executive Summary
          </SectionTitle>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-sm sm:text-base leading-relaxed mb-3">
                Multi-agent debate (MAD) improves LLM reasoning but is
                susceptible to <strong>inter-agent sycophancy</strong>: a
                confident hallucinating majority systematically suppresses
                correct minority agents. No existing framework provides an
                in-session, evidence-grounded mechanism to prevent this.
              </p>
              <p className="text-sm sm:text-base leading-relaxed">
                We propose a{" "}
                <strong>trust-calibrated deliberation system</strong> that
                re-weights each agent's influence dynamically based on the
                verifiability of its claims against retrieved scientific
                literature. The core contribution is a formally specified trust
                update: log-prior evidence accumulation, one softmax, and a
                floor/ceiling simplex projection with proven bounds.
              </p>
            </div>
            <div>
              <p className="text-sm sm:text-base leading-relaxed mb-3">
                <strong>Secondary contribution</strong> is an open evaluation
                harness (CCR/MPR/ECR metrics; 4 executable arms and a 6-arm
                target) for future sycophancy mitigation research.
              </p>
              <p className="text-sm sm:text-base leading-relaxed">
                We target <strong>≥20% sycophancy reduction</strong> (CCR
                metric) vs. vanilla MAD on GPQA-Main, MMLU-Pro STEM and EG-SSS
                primary sets; HLE is the abstention control, and
                BrokenMath/BrokenArXiv are appendix-only. The Core run (24 runs)
                is pre-registered; no efficacy claim is made yet.
              </p>
            </div>
          </div>

          <KpiRow kpis={idea.kpis} />

          <div className="rounded-lg border border-[#e2e8f0] dark:border-[rgba(255,255,255,0.1)] bg-[#f8fafc] dark:bg-[rgba(255,255,255,0.02)] p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[#64748b] dark:text-[#94a3b8]">
                <Cog size={14} /> P0 build status
              </div>
              <span className="text-[10px] font-semibold text-[#94a3b8]">
                Implementation evidence, not efficacy results
              </span>
            </div>
            <KpiRow kpis={p0Kpis} />
            <p className="mt-3 text-[10px] leading-relaxed text-[#64748b] dark:text-[#94a3b8]">
              <strong>Current report evidence:</strong> 61-pp report, 17-pp journal,
              0 undefined references; tags <code>p0-gate</code> and{" "}
              <code>p0-release</code>. Next: final-stack 96 GB smoke → WP-18
              placebo/oracle → 24-item calibration → verifier audit → G2 pilot
              (Dec 2026) → G3 Core (Jan 2027) → G4/G5 Full (Feb 2027).
            </p>
          </div>
        </Section>

        {/* Quick understanding cards — 3 key points in 10 seconds */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-7 animate-fade-up animate-delay-1">
          {[
            {
              icon: FolderOpen,
              title: "The Problem",
              desc: "Confident wrong majorities override correct minorities in AI debate — no existing fix.",
            },
            {
              icon: Cog,
              title: "Our Solution",
              desc: "Evidence-grounded trust weighting: agents whose claims check out against real papers earn more influence.",
            },
            {
              icon: CheckCircle,
              title: "The Goal",
              desc: "Target ≥20% sycophancy reduction on GPQA-Main, MMLU-Pro STEM and EG-SSS; 4 executable arms and a 6-arm target, with B1–B10 as comparison definitions. Efficacy is not yet measured.",
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="glass-card rounded-lg p-5 border border-[#e2e8f0] dark:border-[rgba(255,255,255,0.1)]"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#3b5bdb]/10 dark:bg-[#3b5bdb]/20 text-[#3b5bdb] dark:text-[#93c5fd]">
                  <Icon size={18} />
                </span>
                <h3 className="text-sm font-bold text-[#1e2d3d] dark:text-[#e2e8f0]">
                  {title}
                </h3>
              </div>
              <p className="text-xs text-[#64748b] dark:text-[#94a3b8] leading-relaxed">
                {desc}
              </p>
            </div>
          ))}
        </div>

        {/* Problem & Research Gap */}
        <Section className="animate-fade-up animate-delay-1">
          <SectionTitle icon={Target} className="border-0 mb-3">
            Problem &amp; Research Gap
          </SectionTitle>
          <TwoCol>
            <ColBox>
              <h4 className="text-sm font-bold mb-2">The Problem</h4>
              <p className="text-sm leading-relaxed">
                In multi-agent LLM debate, a confidently wrong majority can
                cause a correct minority agent to abandon its position — even
                without any new evidence being presented. Standard majority-vote
                aggregation then locks in the wrong answer. This is called{" "}
                <strong>inter-agent sycophancy</strong>.
              </p>
            </ColBox>
            <ColBox>
              <h4 className="text-sm font-bold mb-2">The Gap</h4>
              <p className="text-sm leading-relaxed">
                Diagnosis exists (Yao et al. 2025; He et al. 2026). Efficiency
                optimization exists (iMAD, AAAI 2026). Static aggregation exists
                (MoA, ICLR 2025 Poster).{" "}
                <strong>
                  Nothing existing dynamically re-weights agent trust during a
                  debate based on external evidence.
                </strong>{" "}
                That is the specific, verified gap.
              </p>
            </ColBox>
          </TwoCol>
        </Section>

        {/* Quick links to blueprint detail */}
        <div className="flex flex-wrap gap-3 justify-center animate-fade-up animate-delay-2 print:hidden">
          {[
            { label: "Full Blueprint →", href: "/idea/1" },
            { label: "Execution Roadmap →", href: "/roadmap" },
            { label: "Formal Proposal →", href: "/proposal" },
          ].map((link) => (
            <Link
              key={link.label}
              to={link.href}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#3b5bdb]/10 dark:bg-[#3b5bdb]/20 text-[#3b5bdb] dark:text-[#93c5fd] text-sm font-semibold hover:bg-[#3b5bdb]/20 dark:hover:bg-[#3b5bdb]/30 transition-colors no-underline"
            >
              {link.label} <ArrowUpRight size={14} />
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}
