import { FileText } from "lucide-react";

const docStyle: React.CSSProperties = {
  fontFamily: "'Georgia', 'Times New Roman', serif",
  color: "#1a1a1a",
  lineHeight: 1.45,
  fontSize: "10.5pt",
};

const h1Style: React.CSSProperties = {
  fontSize: "14.5pt",
  textAlign: "center",
  margin: "0 0 3pt",
  color: "#1f3a5f",
  lineHeight: 1.26,
};

const h2Style: React.CSSProperties = {
  fontSize: "10.8pt",
  color: "#1f3a5f",
  borderBottom: "1.4px solid #1f3a5f",
  paddingBottom: "1pt",
  margin: "10pt 0 4pt",
};

const metaStyle: React.CSSProperties = {
  textAlign: "center",
  fontSize: "8.6pt",
  color: "#444",
  borderTop: "1px solid #cfcfcf",
  borderBottom: "1px solid #cfcfcf",
  padding: "4pt 0",
  marginBottom: "9pt",
};

export function ProposalPage() {
  return (
    <>
      {/* Screen-only header bar */}
      <div
        style={{
          textAlign: "center",
          padding: "8px 12px 0",
          fontFamily: "system-ui, sans-serif",
          fontSize: "12px",
          color: "#64748b",
        }}
        className="print:hidden"
      >
        FYDP · Idea 1 — Research Proposal
      </div>

      {/* Print button */}
      <div
        className="print:hidden"
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 100,
        }}
      >
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#3b5bdb] text-white text-sm font-semibold rounded-lg hover:bg-[#2d4ab8] transition-colors cursor-pointer shadow-lg"
        >
          <FileText size={16} />
          Print / Save as PDF
        </button>
      </div>

      {/* ═══════════════ DOCUMENT PAGE ═══════════════ */}
      <div
        className="proposal-doc"
        style={{
          background: "#fff",
          width: "min(210mm, calc(100% - 32px))",
          minHeight: "297mm",
          margin: "8mm auto 16mm",
          padding: "16mm 18mm",
          boxShadow: "0 1px 6px rgba(0, 0, 0, 0.15)",
          ...docStyle,
        }}
      >
        {/* ── Title Block ── */}
        <h1 style={h1Style}>
          Trust-Calibrated Multi-Agent Scientific Deliberation
          <br />
          for Mitigating Sycophantic Consensus in LLM Reasoning
        </h1>
        <p
          style={{
            textAlign: "center",
            fontSize: "9.4pt",
            color: "#444",
            margin: "0 0 4pt",
          }}
        >
          Final Year Design Project — Research Proposal
        </p>
        <div style={metaStyle}>
          Domain: Agentic AI · Multi-Agent Systems · Trustworthy NLP
          &nbsp;|&nbsp; Author: Md. Atikur Rahaman &nbsp;|&nbsp; Jul 2026 – Apr
          2027
        </div>

        {/* ── 1. Background and Motivation ── */}
        <h2 style={h2Style}>1. Background and Motivation</h2>
        <p>
          Getting several large language models (LLMs) to{" "}
          <strong>debate</strong> a question before agreeing on an answer —
          called <strong>Multi-Agent Debate (MAD)</strong> — is a popular way to
          improve factual accuracy (Du et al., 2023). But these debates have a
          real weakness: an agent often drops a correct answer just to agree
          with a confident-sounding majority, and the group ends up with a{" "}
          <strong>confidently wrong consensus</strong> (Yao et al., 2025).
          Because today's models are trained on overlapping data, they tend to
          make the same mistakes, so a plain majority vote can quietly bury a
          correct minority — in fact the minority turns out to be right in
          roughly one in four disagreements (He et al., 2026). In scientific or
          clinical question answering, a confidently wrong group answer is more
          harmful than an honest "I'm not sure."
        </p>
        <p>
          Existing mitigation strategies fall into two camps: those that
          diagnose the problem (Yao et al., 2025; He et al., 2026) and those
          that optimise for efficiency (iMAD, Fan et al., 2026).{" "}
          <strong>
            None dynamically re-weights agent influence during a debate based on
            whether the agent's claims can be verified against real evidence.
          </strong>{" "}
          This project targets that gap.
        </p>

        {/* ── 2. Problem Statement ── */}
        <h2 style={h2Style}>2. Problem Statement</h2>
        <p>
          In current multi-agent debate systems, an agent's influence on the
          final answer depends on how many other agents agree with it — not on
          whether what it says is factually supported. There is{" "}
          <strong>
            no mechanism that adjusts each agent's trust score during the debate
          </strong>{" "}
          based on verifiability of its claims against retrieved scientific
          literature. As a result, a hallucinating majority can systematically
          override a correct, well-supported minority. This inter-agent
          sycophancy undermines the reliability of MAD for high-stakes
          scientific and clinical applications.
        </p>

        {/* ── 3. Research Gap ── */}
        <h2 style={h2Style}>3. Research Gap</h2>
        <p>
          The problem of inter-agent sycophancy has been formally diagnosed: Yao
          et al. (2025) introduced the term and showed that agents become
          sycophantic in debate, while He et al. (2026) quantified that a
          correlated majority suppresses the correct minority in approximately
          25% of disagreements. On the efficiency front, Fan et al. (2026)
          proposed iMAD (AAAI 2026 Oral), which learns when to trigger a debate
          rather than always running one. However,{" "}
          <strong>
            no existing framework provides an in-session, evidence-grounded
            mechanism to prevent sycophantic consensus collapse.
          </strong>{" "}
          Standard aggregation methods — majority vote, Mixture-of-Agents
          equal-weight averaging (Wang et al., 2024) — treat all agents as
          equally trustworthy regardless of the quality of their evidence. The
          specific, verified gap is the absence of a dynamic, evidence-weighted
          trust calibration mechanism for multi-agent deliberation.
        </p>

        {/* ── 4. Core Idea ── */}
        <h2 style={h2Style}>4. Core Idea (The Proposed Method)</h2>
        <p>
          We propose a <strong>trust-calibrated deliberation system</strong> in
          which a panel of open-weight LLMs from different model families debate
          a question. As they argue, each agent's claims are decomposed into
          atomic factual statements and checked against partitioned scientific
          sources (PubMed, arXiv, Semantic Scholar). Each agent carries a{" "}
          <strong>trust score</strong> that increases when its claims are
          supported by retrieved evidence and decreases when contradicted,
          bounded within [0.1, 0.9] so that no agent is silenced and none
          dominates.
        </p>
        <p>
          The core contribution is the <strong>trust update rule</strong>,
          formally specified as: S<sub>i</sub>
          <sup>(t+1)</sup> = S<sub>i</sub>
          <sup>(t)</sup> + α·V<sub>i</sub>
          <sup>(t)</sup> − β·H<sub>i</sub>
          <sup>(t)</sup>, followed by softmax normalization, clamp to [0.1,
          0.9], and renormalization. This rule has proven boundedness properties
          and a probabilistic interpretation as approximate Bayesian evidence
          accumulation. Instead of a plain majority vote, the final answer is
          produced by <strong>trust-weighted aggregation</strong>, which allows
          a well-supported minority to survive against a confident but
          unsupported majority.
        </p>
        <p>
          A lightweight confidence estimator acts as a gate: easy questions
          receive a direct answer without triggering the full debate pipeline,
          preserving computational resources. The secondary contribution is an
          open evaluation harness including the Collapse Rate (CCR) metric,
          Minority Preservation Rate (MPR), Evidence Calibration Rate (ECR), and
          a 9-baseline comparison suite.
        </p>

        {/* ── 5. Research Question and Objectives ── */}
        <h2 style={h2Style}>5. Research Question and Objectives</h2>
        <p>
          <strong>Research question:</strong> When a multi-agent debate faces a
          planted, confident-but-wrong majority, does evidence-grounded trust
          weighting keep correct minority answers alive better than a plain
          majority vote and other standard aggregation methods?
        </p>
        <p>To answer this, the objectives are to:</p>
        <ol>
          <li>
            Design a bounded, evidence-weighted trust-update rule driven by
            supported versus contradicted claims, with formally specified
            mathematical properties.
          </li>
          <li>
            Build the full pipeline: confidence gate, heterogeneous agent pool,
            claim decomposition, source-partitioned retrieval, cross-encoder
            evidence scoring, trust update, and trust-weighted adjudication.
          </li>
          <li>
            Create a reproducible evaluation suite including a controlled
            sycophancy injection protocol (κ &gt; 0.75 inter-rater agreement),
            three primary metrics (CCR, MPR, ECR), and statistical testing
            infrastructure (paired bootstrap, effect sizes).
          </li>
          <li>
            Compare the method against 9 baselines — including single-agent,
            vanilla MAD, Self-Consistency, Mixture-of-Agents, and iMAD — across
            5 benchmarks (BrokenMath, BrokenArXiv, HLE, GPQA Diamond, MMLU-Pro
            STEM) and report results honestly, including failure cases.
          </li>
        </ol>

        {/* ── 6. Build and Test Plan ── */}
        <h2 style={h2Style}>6. How We Plan to Build and Test It</h2>
        <p>
          The system uses three{" "}
          <strong>heterogeneous open-weight agents</strong> from different model
          families (targeting Qwen3-32B, Mistral-Small-3.2-24B, and
          Phi-4-Reasoning, confirmed via Phase 0 benchmarking). Everything runs
          at <strong>inference time only</strong> — no model training — keeping
          the project feasible for a single-A100, 10-month FYDP timeline. The
          implementation follows a strict 12-step build order where each
          component is validated independently before integration.
        </p>
        <p>
          <strong>Testing:</strong> We inject a controlled, validated (κ &gt;
          0.75) sycophantic consensus into the debate and measure how well each
          method resists it. Benchmarks target two adversarial sets (BrokenMath,
          BrokenArXiv, HLE) and two general accuracy sets (GPQA Diamond,
          MMLU-Pro STEM). Three random seeds are used per condition, with paired
          bootstrap testing, 95% confidence intervals, and Cohen's d effect
          sizes. The primary hypotheses are:
        </p>
        <ul>
          <li>
            <strong>H1:</strong> CCR improves by ≥20% vs. vanilla MAD on
            adversarial benchmarks.
          </li>
          <li>
            <strong>H2:</strong> MPR improves by ≥15 percentage points vs.
            majority vote.
          </li>
          <li>
            <strong>H3:</strong> ECR &gt; 0.80 on GPQA Diamond (trust correlates
            with correctness).
          </li>
        </ul>
        <p>
          <strong>Timeline (10 months):</strong> Phase 0 (Jul): Infrastructure
          &amp; vLLM serving; Phase 1 (Aug–Sep): Pilot study &amp; baseline
          implementation; Phase 2 (Oct–Nov): Core system prototype; Phase 3
          (Dec–Jan): Full experiments &amp; results freeze; Phase 4 (Feb–Apr):
          Paper writing, human evaluation, defence preparation. Four explicit
          Gate checkpoints with go/no-go criteria.
        </p>

        {/* ── 7. Expected Contributions and Outcomes ── */}
        <h2 style={h2Style}>7. Expected Contributions and Outcomes</h2>
        <ul>
          <li>
            An <strong>evidence-grounded trust-weighting mechanism</strong> that
            reduces sycophantic consensus collapse in multi-agent LLM debate,
            with formally specified mathematical properties.
          </li>
          <li>
            A <strong>reproducible evaluation suite</strong> (injection protocol
            + CCR/MPR/ECR metrics + 9-baseline harness) for future sycophancy
            mitigation research.
          </li>
          <li>
            A <strong>working prototype</strong> with honest failure analysis
            identifying when evidence-grounded trust helps and when it does not.
          </li>
          <li>
            A <strong>thesis and paper</strong> suitable for ACL 2027 Workshop
            (SRW), EMNLP 2027 Findings, or IEEE Transactions on Neural Networks
            (extended version).
          </li>
        </ul>

        {/* ── 8. Key References ── */}
        <h2 style={h2Style}>8. Key References</h2>
        <ul style={{ fontSize: "9pt", paddingLeft: "16pt" }}>
          <li style={{ marginBottom: "2.5pt" }}>
            Du et al. (2023) —{" "}
            <em>
              Improving Factuality and Reasoning in Language Models through
              Multiagent Debate.
            </em>{" "}
            Introduced MAD as a base method.
          </li>
          <li style={{ marginBottom: "2.5pt" }}>
            Yao et al. (2025) —{" "}
            <em>
              Multi-Agent Debate is Replicable but Prone to Inter-Agent
              Sycophancy.
            </em>{" "}
            Defined the problem we mitigate.
          </li>
          <li style={{ marginBottom: "2.5pt" }}>
            He et al. (2026) —{" "}
            <em>Correct Minority Suppression in Multi-Agent Debate.</em>{" "}
            Quantified the failure rate (~25% of disagreements).
          </li>
          <li style={{ marginBottom: "2.5pt" }}>
            Fan et al. (2026), iMAD — <em>Intelligent Multi-Agent Debate.</em>{" "}
            (AAAI 2026 Oral). Efficiency-focused baseline; decides{" "}
            <strong>when</strong> to debate.
          </li>
          <li style={{ marginBottom: "2.5pt" }}>
            Wang et al. (2024), Mixture-of-Agents —{" "}
            <em>
              Mixture-of-Agents Enhances Large Language Model Capabilities.
            </em>{" "}
            Equal-weight aggregation baseline.
          </li>
          <li style={{ marginBottom: "2.5pt" }}>
            Irving et al. (2018) — <em>AI Safety via Debate.</em> Theoretical
            foundation for debate as a truth-seeking protocol.
          </li>
          <li style={{ marginBottom: "2.5pt" }}>
            Lewis et al. (2020) —{" "}
            <em>
              Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks.
            </em>{" "}
            Foundation of our source-partitioned RAG approach.
          </li>
        </ul>
      </div>
    </>
  );
}
