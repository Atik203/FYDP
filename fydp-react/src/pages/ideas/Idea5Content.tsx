import { Section, SectionTitle, ColBox, TwoCol } from '@/components/shared/Section';
import { Callout } from '@/components/shared/Callout';
import { InfoGrid } from '@/components/shared/InfoGrid';

export function Idea5Content() {
  return (
    <>
      {/* 1. Core Idea */}
      <Section accent="blue">
        <SectionTitle icon="💡">1. Core Idea</SectionTitle>
        <p className="mb-3">
          A majority of published statistical results in the social, medical, and psychological sciences cannot be
          independently reproduced — a crisis documented in Ioannidis (2005) and the Open Science Collaboration
          (2015). Manual statistical auditing is expert-intensive and does not scale. We propose{' '}
          <strong>StatVerify-Agent</strong> — an agentic LLM pipeline that autonomously decomposes a paper's
          statistical claims into verifiable propositions, generates and executes Python code to re-run analyses
          on available data, and produces a structured reproducibility audit report flagging mathematical errors,
          methodology mismatches, and hallucinated effect sizes.
        </p>
        <Callout variant="feasibility" title="⚠ Important Note — Ranked #5">
          This idea is ranked lowest because <strong>methodological novelty is limited</strong> — ReAct agents with
          code execution were published in 2023 (Yao et al.). The novelty is in the{' '}
          <em>application domain</em> (statistical reproducibility auditing), which is compelling but may not
          satisfy Q1 reviewers who expect algorithmic novelty. Recommended as a strong{' '}
          <strong>workshop paper submission</strong> or follow-on PhD project.
        </Callout>
      </Section>

      {/* 2. Problem Statement */}
      <Section>
        <SectionTitle icon="🔍">2. Problem Statement</SectionTitle>
        <p className="mb-3 text-sm">
          The reproducibility crisis in science is well-documented: 70% of researchers have tried and failed to
          reproduce another scientist's experiments (Baker, 2016). Statistical errors — incorrect p-values, wrong
          degrees of freedom, mislabelled effect sizes — are a major contributor. Current tools (statcheck,
          GRIM) check a narrow class of errors. StatVerify-Agent aims for a more comprehensive, multi-type
          statistical audit across the full paper.
        </p>
        <TwoCol>
          <ColBox>
            <h4 className="text-sm font-semibold mt-0 mb-2">Challenge A — Claim Extraction</h4>
            <p className="text-sm text-[#64748b] mb-0">Decomposing papers' prose into structured statistical claims ("t(28) = 3.42, p {'<'} .001, d = 0.64") for machine-verifiable propositions.</p>
          </ColBox>
          <ColBox>
            <h4 className="text-sm font-semibold mt-0 mb-2">Challenge B — Data Availability</h4>
            <p className="text-sm text-[#64748b] mb-0">Most papers don't share data. The agent must handle partial verification (checking internal mathematical consistency) when data is unavailable, and full replication when it is.</p>
          </ColBox>
          <ColBox>
            <h4 className="text-sm font-semibold mt-0 mb-2">Challenge C — Code Generation Safety</h4>
            <p className="text-sm text-[#64748b] mb-0">Generated statistical code must be sandboxed, correct, and interpretable. The agent must handle diverse statistical tests (t-test, ANOVA, regression, Bayesian models) without hallucinating library APIs.</p>
          </ColBox>
          <ColBox>
            <h4 className="text-sm font-semibold mt-0 mb-2">Challenge D — Gold Annotation</h4>
            <p className="text-sm text-[#64748b] mb-0">Creating 100 papers with manually verified ground-truth reproducibility labels is a significant data curation bottleneck consuming 2–3 months of project time.</p>
          </ColBox>
        </TwoCol>
      </Section>

      {/* 3. Architecture */}
      <Section accent="blue">
        <SectionTitle icon="🏗️">3. StatVerify-Agent Architecture</SectionTitle>
        <div className="bg-[#f0f7ff] border border-[#bfdbfe] rounded-md p-3 font-mono text-sm text-center mb-4">
          Paper PDF → Statistical Claim Extractor → Verification Planner → Code Generator → Sandbox Executor → Audit Report
        </div>
        <TwoCol>
          <ColBox>
            <h4 className="text-sm font-semibold mt-0 mb-2">Stage 1: Claim Extractor</h4>
            <p className="text-sm text-[#64748b] mb-0">LLM-based structured extraction of all statistical claims from the paper, normalized to a canonical format: (test_type, statistic_value, df, p_value, effect_size, sample_size).</p>
          </ColBox>
          <ColBox>
            <h4 className="text-sm font-semibold mt-0 mb-2">Stage 2: Verification Planner</h4>
            <p className="text-sm text-[#64748b] mb-0">The agent plans which claims can be verified internally (math check) vs. which require external data (replication). Prioritises claims by verification difficulty and impact.</p>
          </ColBox>
          <ColBox>
            <h4 className="text-sm font-semibold mt-0 mb-2">Stage 3: Code Generator + Executor</h4>
            <p className="text-sm text-[#64748b] mb-0">For each verifiable claim, generates Python (scipy, statsmodels, pingouin) code, executes in a Docker sandbox, and compares computed statistics to reported values within tolerance ε.</p>
          </ColBox>
          <ColBox>
            <h4 className="text-sm font-semibold mt-0 mb-2">Stage 4: Audit Report</h4>
            <p className="text-sm text-[#64748b] mb-0">Structured JSON report: verified claims, flagged discrepancies, severity ratings, and natural language explanations. Reproducibility score = (verified / total verifiable claims).</p>
          </ColBox>
        </TwoCol>
      </Section>

      {/* 4. Methodology */}
      <Section>
        <SectionTitle icon="🔬">4. Methodology</SectionTitle>
        <h3 className="text-base font-semibold text-[#1e2a4a] mt-4 mb-3">Evaluation Dataset</h3>
        <p className="text-sm mb-3">
          100 papers from psychology and social science (publicly available data on OSF), manually annotated for:
          (1) all statistical claims, (2) ground-truth reproducibility status (replicated / error / data-unavailable).
          Annotation by 2 annotators with inter-rater agreement κ ≥ 0.8.
        </p>
        <InfoGrid cards={[
          { label: 'Evaluation Set', value: '100 papers', sub: 'Psychology + social science; publicly available data on OSF' },
          { label: 'Primary Model', value: 'GPT-4o (code generation)', sub: 'Via API; sandboxed execution in Docker' },
          { label: 'Comparison: statcheck', value: 'NHST-only', sub: 'Current SOTA for narrow statistical checking' },
          { label: 'Comparison: GRIM', value: 'Mean consistency check', sub: 'Baseline for arithmetic consistency' },
        ]} />
      </Section>

      {/* Expected Results */}
      <Section>
        <SectionTitle icon="📈">5. Expected Results</SectionTitle>
        <TwoCol>
          <ColBox>
            <h4 className="text-sm font-semibold mt-0 mb-2">Primary: ≥70% Code Execution Success</h4>
            <p className="text-sm text-[#64748b] mb-0">The agent successfully generates and executes valid statistical code for ≥70% of verifiable claims (test type supported, data available, no API hallucination).</p>
          </ColBox>
          <ColBox>
            <h4 className="text-sm font-semibold mt-0 mb-2">Secondary: ≥60% Statistical Match Rate</h4>
            <p className="text-sm text-[#64748b] mb-0">When data is available and code executes, the agent's computed statistics match the paper's reported values within tolerance ε in ≥60% of cases.</p>
          </ColBox>
          <ColBox>
            <h4 className="text-sm font-semibold mt-0 mb-2">Error Detection: ≥80% F1</h4>
            <p className="text-sm text-[#64748b] mb-0">On papers with known errors (manually annotated gold set), StatVerify-Agent detects ≥80% of mathematical errors with precision ≥75% — significantly better than statcheck (coverage-limited to NHST tests).</p>
          </ColBox>
          <ColBox>
            <h4 className="text-sm font-semibold mt-0 mb-2">Coverage: 5× broader than statcheck</h4>
            <p className="text-sm text-[#64748b] mb-0">StatVerify-Agent covers regression, ANOVA, Bayesian models, non-parametric tests — 5× the claim types handled by statcheck (NHST-only), establishing a new baseline for automated auditing.</p>
          </ColBox>
        </TwoCol>
      </Section>
    </>
  );
}
