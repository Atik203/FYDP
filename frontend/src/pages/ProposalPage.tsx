import { FileText } from "lucide-react";

const docStyle: React.CSSProperties = {
  fontFamily: "'Georgia', 'Times New Roman', serif",
  color: "#1a1a1a",
  lineHeight: 1.5,
  fontSize: "10.5pt",
  textAlign: "justify",
};

const h1Style: React.CSSProperties = {
  fontSize: "14.5pt",
  textAlign: "center",
  margin: "0 0 3pt",
  color: "#1f3a5f",
  lineHeight: 1.26,
};

const h2Style: React.CSSProperties = {
  fontSize: "11pt",
  color: "#1f3a5f",
  borderBottom: "1.4px solid #1f3a5f",
  paddingBottom: "1pt",
  margin: "11pt 0 4pt",
};

const h3Style: React.CSSProperties = {
  fontSize: "10.6pt",
  color: "#26456b",
  margin: "7pt 0 2pt",
  fontStyle: "italic",
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

const linkStyle: React.CSSProperties = {
  color: "#1f3a5f",
  textDecoration: "underline",
  textUnderlineOffset: "2pt",
};

function Eqn({
  children,
  num,
}: {
  children: React.ReactNode;
  num: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        margin: "5pt 0",
        breakInside: "avoid",
      }}
    >
      <div
        style={{
          flex: 1,
          textAlign: "center",
          fontFamily: "'Cambria Math', 'Georgia', serif",
          fontStyle: "italic",
          fontSize: "10.8pt",
        }}
      >
        {children}
      </div>
      <div style={{ width: "28pt", textAlign: "right", fontStyle: "normal" }}>
        ({num})
      </div>
    </div>
  );
}

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: "8.7pt",
  margin: "5pt 0 8pt",
  fontFamily: "'Georgia', serif",
  textAlign: "left",
};

const thStyle: React.CSSProperties = {
  border: "1px solid #b8b8b8",
  background: "#eef2f7",
  padding: "3pt 5pt",
  color: "#1f3a5f",
  fontWeight: 700,
  verticalAlign: "top",
};

const tdStyle: React.CSSProperties = {
  border: "1px solid #cfcfcf",
  padding: "3pt 5pt",
  verticalAlign: "top",
};

export function ProposalPage() {
  return (
    <>
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
        FYDP 2026–2027 &middot; Idea 1 &mdash; Research Proposal
      </div>

      <div
        className="print:hidden"
        style={{ position: "fixed", bottom: 24, right: 24, zIndex: 100 }}
      >
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#3b5bdb] text-white text-sm font-semibold rounded-lg hover:bg-[#2d4ab8] transition-colors cursor-pointer shadow-lg"
        >
          <FileText size={16} />
          Print / Save as PDF
        </button>
      </div>

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
        <h1 style={h1Style}>
          The Boundaries of Evidence-Grounded Trust in Multi-Agent Scientific
          Debate,
          <br />
          with a Controlled Benchmark for Sycophantic Consensus
        </h1>
        <p
          style={{
            textAlign: "center",
            fontSize: "9.4pt",
            color: "#444",
            margin: "0 0 4pt",
          }}
        >
          Final Year Design Project &mdash; Research Proposal
        </p>
        <div style={metaStyle}>
          Domain: Agentic AI &middot; Multi-Agent Systems &middot; Trustworthy NLP
          &nbsp;|&nbsp; Group 6 &middot; Phantom Devs &nbsp;|&nbsp; Jul 2026 &ndash; Dec 2027
        </div>
        <p
          style={{
            fontSize: "8.8pt",
            color: "#7a2e00",
            background: "#fff4e6",
            border: "1px solid #f0b37e",
            padding: "4pt 6pt",
            margin: "0 0 9pt",
            textAlign: "left",
          }}
        >
          <strong>Implementation status (Nov 2026).</strong> P0 is engineering
          readiness: 514 tests, 13/13 gate checks passed. No efficacy result has
          been measured. Planned work is labelled as planned throughout.
        </p>

        <h2 style={h2Style}>Abstract</h2>
        <p>
          Multi-Agent Debate (MAD) improves the factual accuracy of large
          language models (LLMs) by having several agents argue toward a shared
          answer, yet it suffers a documented failure mode:{" "}
          <em>inter-agent sycophancy</em>, where a confident-but-wrong majority
          pressures a correct minority agent into abandoning its position, and a
          plain majority vote then locks in the wrong answer. This proposal
          introduces a <strong>trust-calibrated deliberation framework</strong>{" "}
          in which a panel of heterogeneous open-weight LLMs debate a scientific
          question while each agent&apos;s influence is dynamically re-weighted
          by a bounded <strong>trust score</strong> driven by the verifiability
          of its claims against retrieved scientific literature. The final
          answer is produced by trust-weighted aggregation rather than a
          headcount, allowing an evidence-backed minority to outweigh an
          unsupported majority. Alongside the mechanism, the project targets a
          reproducible <strong>sycophancy-stress evaluation harness</strong> &mdash;
          a controlled injection protocol, three metrics (CCR, MPR, ECR), a
          controlled benchmark, and a pre-registered causal contrast (B8 vs
          B8-no-trust) &mdash; with four executable arms now, a six-arm target,
          and three Core datasets (GPQA-Main, MMLU-Pro STEM, HLE as an abstention
          control). The planned benchmark follows a scale ladder of 180 items as
          the floor, 300 as the target, 600 as a stretch, and 800 as a no-go.
          The work runs entirely at inference time (no fine-tuning) on a
          single-GPU budget. Expected outcomes are stated as pre-registered
          success criteria, not as results: a statistically significant
          reduction in collapse rate and an open-source evaluation suite
          reusable by the research community.
        </p>

        <h2 style={h2Style}>1. Background and Motivation</h2>
        <p>
          Getting several large language models (LLMs) to{" "}
          <strong>debate</strong> a question before agreeing on an answer &mdash;
          called <strong>Multi-Agent Debate (MAD)</strong> &mdash; is a widely used
          way to improve factual accuracy and reasoning quality (Du et al.,
          2023; Chan et al., 2024). By exposing each agent to the critiques of
          others, MAD encourages diverse reasoning paths and lets the group
          recover from individual errors. However, these debates carry a real and
          well-documented weakness: an agent frequently drops a correct answer
          simply to align with a confident-sounding majority, so the group
          converges on a <strong>confidently wrong consensus</strong> (Yao et
          al., 2025). Because contemporary models are trained on heavily
          overlapping corpora, they tend to make <em>correlated</em> mistakes;
          a plain majority vote can therefore quietly bury a correct minority.
          Empirically, the minority turns out to be right in roughly one in four
          disagreements (He et al., 2026). In scientific, medical, or clinical
          question answering, a confidently wrong <em>group</em> answer is more
          harmful than an honest &ldquo;I am not sure,&rdquo; because it is
          delivered with the apparent authority of a consensus.
        </p>
        <p>
          As LLM systems are increasingly deployed as research assistants,
          tutors, and decision-support tools, this false consensus among
          cooperating agents becomes a <strong>trust and safety</strong> problem,
          not merely an accuracy statistic &mdash; it fails silently and
          confidently. Sycophancy is cited as an open problem in over 50
          peer-reviewed papers since 2023. In multi-agent systems specifically,
          it directly undermines the reason MAD is used: if debate collapses to
          whichever position sounds most confident rather than which is most
          correct, it adds computational cost without adding reliability.
          Existing responses fall into three camps: <em>diagnosis</em> (Yao et
          al., 2025; He et al., 2026), which measures the problem without
          proposing a mitigation; <em>efficiency optimisation</em> (iMAD, Fan et
          al., 2026, AAAI Oral), which learns <em>when</em> to trigger a debate
          rather than <em>whom to trust</em> during it; and{" "}
          <em>static aggregation</em> (Mixture-of-Agents, Wang et al., 2025,
          ICLR Poster), which combines model outputs without dynamic
          evidence grounding. Crucially,{" "}
          <strong>
            none dynamically re-weights agent influence during a debate based on
            whether that agent&apos;s claims can be verified against external
            evidence.
          </strong>{" "}
          This proposal targets exactly that gap, on the argument that the only
          reliable way to break a social-pressure collapse is to tie influence
          to something <em>external</em> and <em>independent</em> of the
          debate&apos;s internal dynamics.
        </p>
        <p>
          Two recent published mitigations deserve particular attention.{" "}
          <strong>ConsensAgent</strong> (Pitre et al., Findings of ACL 2025)
          reduces sycophancy via static and dynamic prompt refinement &mdash; a
          textual intervention that does not produce a numeric trust score and
          does not use external evidence retrieval.{" "}
          <strong>DebUnc</strong> (Yoffe et al., Findings of EMNLP 2025)
          modulates in-loop influence using self-reported uncertainty signals,
          which are themselves susceptible to the same social pressure that
          drives sycophancy. Our approach is differentiated from both by its
          reliance on <em>external, independent evidence verification</em> as
          the basis for trust updates, rather than textual or self-reported
          signals. The theoretical foundation for majority-convergence in
          multi-LLM debate is established by Estornell and Liu (NeurIPS 2024),
          who prove a &ldquo;tyranny of the majority&rdquo; result and propose
          pruning-style interventions, but stop short of a deployable,
          evidence-grounded system.
        </p>

        <h2 style={h2Style}>2. Problem Statement</h2>
        <p>
          In current multi-agent debate systems, an agent&apos;s influence on
          the final answer depends on <em>how many</em> other agents agree with
          it &mdash; not on whether what it says is factually supported. There is{" "}
          <strong>
            no mechanism that adjusts each agent&apos;s trust score during the
            debate
          </strong>{" "}
          based on the verifiability of its claims against retrieved scientific
          literature. As a consequence, a hallucinating majority can
          systematically override a correct, well-supported minority. This
          inter-agent sycophancy undermines the very reason MAD is used: if a
          debate collapses to whichever position sounds most confident rather
          than which is most correct, it adds computational cost without adding
          reliability. The problem is most acute in high-stakes scientific and
          clinical applications, where the cost of a confidently wrong consensus
          is highest.
        </p>

        <h2 style={h2Style}>3. Research Gap</h2>
        <p>
          The problem of inter-agent sycophancy has been formally diagnosed but
          not solved with an in-session, evidence-grounded mechanism. We
          position our work against the closest lines of prior research:
        </p>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Prior work</th>
              <th style={thStyle}>What it does</th>
              <th style={thStyle}>Why the gap remains</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={tdStyle}>Yao et al. (2025) &middot; He et al. (2026)</td>
              <td style={tdStyle}>
                Define and quantify inter-agent sycophancy (minority correct in
                ~25% of disagreements).
              </td>
              <td style={tdStyle}>
                Diagnostic only &mdash; measures the failure, proposes no mitigation.
              </td>
            </tr>
            <tr>
              <td style={tdStyle}>iMAD &mdash; Fan et al. (2026), AAAI Oral</td>
              <td style={tdStyle}>
                Learns <em>when</em> to trigger a debate for token efficiency.
              </td>
              <td style={tdStyle}>
                Decides whether to debate, not <em>whom to trust</em> once
                debating; falls back to majority vote.
              </td>
            </tr>
            <tr>
              <td style={tdStyle}>MoA &mdash; Wang et al. (2025), ICLR Poster</td>
              <td style={tdStyle}>
                Layered multi-agent aggregation of diverse LLMs.
              </td>
              <td style={tdStyle}>
                Static, equal-weight &mdash; no evidence grounding, no dynamic trust.
              </td>
            </tr>
            <tr>
              <td style={tdStyle}>ConsensAgent &mdash; Pitre et al. (2025), ACL Findings</td>
              <td style={tdStyle}>
                First <em>published</em> sycophancy mitigation, via prompt
                refinement.
              </td>
              <td style={tdStyle}>
                Textual intervention &mdash; no numeric trust, no external evidence, no
                adversarial-injection testing.
              </td>
            </tr>
            <tr>
              <td style={tdStyle}>DebUnc &mdash; Yoffe et al. (2025), EMNLP Findings</td>
              <td style={tdStyle}>
                Modulates in-loop influence using uncertainty signals.
              </td>
              <td style={tdStyle}>
                Uses <em>self-reported</em> uncertainty &mdash; the very signal social
                pressure can manipulate.
              </td>
            </tr>
            <tr>
              <td style={tdStyle}>Estornell &amp; Liu (2024), NeurIPS</td>
              <td style={tdStyle}>
                Proves majority-convergence (&ldquo;tyranny of the
                majority&rdquo;); pruning-style interventions.
              </td>
              <td style={tdStyle}>
                Theoretical; not a deployable, evidence-grounded system.
              </td>
            </tr>
            <tr>
              <td style={tdStyle}>Minority Sentinel (2026), SIGIR Workshop</td>
              <td style={tdStyle}>
                Post-hoc correction based on log-level features after debate.
              </td>
              <td style={tdStyle}>
                Intervenes only after debate ends; no in-session trust adjustment.
              </td>
            </tr>
          </tbody>
        </table>
        <p>
          <strong>Research gap (one sentence):</strong> no existing framework
          dynamically re-weights agent influence <em>within</em> an active
          debate session based on the real-time verifiability of claims against
          external evidence with a <em>formally bounded numeric trust score</em>.
          Prompt refinement (ConsensAgent), self-reported uncertainty (DebUnc),
          theoretical pruning (Estornell &amp; Liu), and post-hoc correction
          (Minority Sentinel) each address adjacent problems, but none ties
          influence to external evidence verification during the debate. Our
          closest <em>published competitor</em> is ConsensAgent; our sharpest
          differentiation is that our trust signal is external, evidence-grounded,
          numeric, and formally bounded, rather than a textual prompt tweak.
        </p>

        <h2 style={h2Style}>
          4. Research Question, Hypotheses, and Objectives
        </h2>
        <p>
          <strong>Research question.</strong> When a multi-agent debate faces a
          planted, confident-but-wrong majority, does evidence-grounded trust
          weighting preserve correct minority answers better than a plain
          majority vote and other standard aggregation methods?
        </p>
        <p>
          <strong>Central hypothesis.</strong> If an agent&apos;s influence in
          aggregation is dynamically re-weighted during the debate based on
          external evidence verification, then sycophantic collapse &mdash; agents
          abandoning correct answers under social pressure &mdash; will measurably
          decrease relative to standard majority-vote debate,{" "}
          <em>without any model fine-tuning</em>. This decomposes into three
          pre-registered targets, to be tested rather than assumed:
        </p>
        <ul>
          <li>
            <strong>H1 (collapse):</strong> Collapse Rate (CCR) improves by
            &ge;20% relative to vanilla MAD on the injected-pressure benchmarks.
          </li>
          <li>
            <strong>H2 (outcome):</strong> Minority Preservation Rate (MPR)
            improves by &ge;15 percentage points relative to majority vote.
          </li>
          <li>
            <strong>H3 (calibration):</strong> Evidence Calibration Rate (ECR)
            &gt; 0.80 on GPQA-Main &mdash; i.e., trust scores track actual
            correctness probability. The exact calibration endpoint is frozen in
            the pre-registration before the matrix runs.
          </li>
        </ul>
        <p>To answer the research question, the objectives are to:</p>
        <ol>
          <li>
            Design a bounded, evidence-weighted trust-update rule driven by
            supported-versus-contradicted claims, with formally specified
            mathematical properties (boundedness, no-silencing, no-domination).
          </li>
          <li>
            Build the full pipeline: confidence gate, heterogeneous agent pool,
            claim decomposition, source-partitioned retrieval, cross-encoder
            evidence scoring, trust update, and trust-weighted adjudication.
          </li>
          <li>
            Create a reproducible evaluation suite: a controlled sycophancy
            injection protocol (inter-rater &kappa; &gt; 0.75), three primary
            metrics (CCR, MPR, ECR), and statistical testing infrastructure
            (paired bootstrap, 95% CIs, Cohen&apos;s <em>d</em>).
          </li>
          <li>
            Empirically validate the four executable arms (B3, B4-matched,
            B8-no-trust, B8), with a six-arm target that adds B8-placebo and
            B8-oracle, across the three Core datasets. The pilot in Dec 2026 must
            establish that trust re-weighting behaviourally changes the output
            rather than sitting in context ignored.
          </li>
          <li>
            Compare against the strongest published mitigation (ConsensAgent)
            through reimplementation or, minimally, a detailed mechanism-level
            differentiation analysis.
          </li>
        </ol>

        <h2 style={h2Style}>5. Proposed Method</h2>
        <p>
          We propose a <strong>trust-calibrated deliberation system</strong> in
          which a panel of <em>N</em> = 3 heterogeneous open-weight LLMs from
          different model families debate a scientific question over{" "}
          <em>K</em> = 3 rounds. As the agents argue, each agent&apos;s claims
          are decomposed into atomic factual statements and checked against
          partitioned scientific sources. Every agent <em>i</em> carries a
          trust score <em>S<sub>i</sub></em> that rises when its claims are
          supported by retrieved evidence and falls when they are contradicted,
          and the final answer is produced by{" "}
          <strong>trust-weighted aggregation</strong> rather than a simple
          headcount. The system operates entirely at inference time with no
          fine-tuning required.
        </p>

        <h3 style={h3Style}>5.1 System architecture overview</h3>
        <p>
          The architecture follows a sequential pipeline with a feedback loop.
          The input (a scientific question) first enters a lightweight confidence
          gate. If the gate determines the question is straightforward, a direct
          answer is returned immediately. Otherwise, three heterogeneous agents
          each produce an independent initial position. Each agent&apos;s answer is
          decomposed into atomic claims, which are routed to partitioned
          scientific corpora (PubMed, arXiv, Semantic Scholar) for evidence
          retrieval. A cross-encoder reranker scores each claim as supported,
          contradicted, or unverifiable. The trust scores are updated based on
          these verdicts. Agents then revise their positions in light of peer
          arguments and their own trust standing. The retrieval&rarr;trust-update&rarr;
          revision loop repeats for <em>K</em> rounds, after which trust-weighted
          aggregation produces the final answer with citations and a full trust
          trajectory log.
        </p>

        <h3 style={h3Style}>5.2 System pipeline</h3>
        <p>
          The end-to-end flow consists of nine stages: (i) a lightweight{" "}
          <strong>confidence gate</strong> answers easy questions directly and
          routes only genuinely uncertain ones into debate; (ii) the three
          agents state independent <strong>initial positions</strong> (Round 0);
          (iii) <strong>claim decomposition</strong> converts each answer into
          tagged atomic propositions; (iv){" "}
          <strong>source-partitioned retrieval</strong> routes each agent&apos;s
          claims to a distinct corpus (Agent A &rarr; PubMed, B &rarr; arXiv, C
          &rarr; Semantic Scholar); (v) a cross-encoder scores each claim as{" "}
          <em>supported / contradicted / unverifiable</em>; (vi) the{" "}
          <strong>trust update</strong> converts those verdicts into new trust
          scores; (vii) agents <strong>revise</strong> their positions, aware of
          peers&apos; arguments and their own trust standing; steps (iii)&ndash;(vii)
          repeat for <em>K</em> rounds; and (viii){" "}
          <strong>trust-weighted aggregation</strong> emits the final answer plus
          citations, the full trust trajectory, and per-agent reasoning traces.
          Every intermediate output is logged to enable post-hoc analysis of
        </p>

        <h3 style={h3Style}>5.3 Confidence gate</h3>
        <p>
          A cheap gate avoids wasting the full ~9-forward-pass pipeline on easy
          questions where all agents would already agree correctly. It uses a
          three-sample agreement check (one fast pass per agent); unanimous,
          high-confidence agreement returns a direct answer, while any
          divergence or low confidence triggers the full debate. Mis-gating an
          easy question wastes only compute, never correctness, since the
          evaluation sets are pre-filtered to genuinely divergent cases. The
          gate can be implemented via self-reported confidence or a simple
          agreement-rate heuristic; a trained classifier was considered and
          rejected as unnecessary complexity for the FYDP scope.
        </p>

        <h3 style={h3Style}>5.4 Heterogeneous agent configuration</h3>
        <p>
          We use three agents from different model families to ensure genuine
          heterogeneity in reasoning styles and failure modes. This is critical
          because same-family model copies share correlated blind spots and
          hallucination patterns, reducing the diversity benefit of multi-agent
          debate. We use a two-phase model strategy: during development
          (Ph 0–2) the pipeline runs <strong><a style={linkStyle} href="https://huggingface.co/Qwen/Qwen3.5-9B" target="_blank" rel="noopener noreferrer">Qwen3.5-9B</a></strong>,{" "}
          <strong><a style={linkStyle} href="https://huggingface.co/google/gemma-4-12B" target="_blank" rel="noopener noreferrer">Gemma 4 12B</a></strong>, and{" "}
          <strong><a style={linkStyle} href="https://huggingface.co/mistralai/Ministral-3-14B-Instruct-2512" target="_blank" rel="noopener noreferrer">Ministral-3-14B-Instruct</a></strong>{" "}
          on an RTX A6000 48GB (spot ~$0.16–0.37/hr on Vast.ai), keeping iteration cost low.
          For the final experiment matrix we swap to{" "}
          <strong><a style={linkStyle} href="https://huggingface.co/Qwen/Qwen3.6-27B" target="_blank" rel="noopener noreferrer">Qwen3.6-27B-FP8</a></strong>,{" "}
          <strong><a style={linkStyle} href="https://huggingface.co/google/gemma-4-26B-A4B" target="_blank" rel="noopener noreferrer">Gemma-4-26B-A4B-FP8</a></strong>, and{" "}
          <strong><a style={linkStyle} href="https://huggingface.co/mistralai/Mistral-Small-3.2-24B-Instruct-2506" target="_blank" rel="noopener noreferrer">Mistral-24B-AWQ</a></strong> on an RTX PRO 6000 Blackwell 96GB (~$0.74–1.43/hr).
          The pinned Final stack is 69.73 GB and fits one 96 GB card.
          All three families (Alibaba, Google, Mistral) are genuinely distinct
          for true heterogeneity. The pipeline code is model-agnostic — only
          the model config changes between phases. The <em>N</em> = 3 configuration is chosen as
          the minimum needed to create a genuine &ldquo;1 vs 2&rdquo;
          minority-suppression scenario, which is the core phenomenon under
study. Scaling ablations at <em>N</em> &isin; &#123;2, 3, 5&#125; are planned
           to probe sensitivity to panel size.
        </p>

        <h3 style={h3Style}>5.5 Claim decomposition and source-partitioned retrieval</h3>
        <p>
          Each agent&apos;s response is decomposed into atomic factual statements
          using structured chain-of-thought prompting with explicit XML-style
          claim tags. This enables the downstream evidence scorer to address
          individual propositions rather than entire responses. Each atomic claim
          is a verifiable statement such as &ldquo;Drug X reduces mortality by
          30% in patients over 65.&rdquo; Compound claims are split into separate
          checks for the effect, magnitude, and qualifier.
        </p>
        <p>
          The retrieval subsystem routes each agent&apos;s claims to a distinct
          corpus: Agent A&rsquo;s claims are checked against PubMed (biomedical
          literature), Agent B&rsquo;s against arXiv (quantitative sciences), and
          Agent C&rsquo;s against Semantic Scholar (broad scientific coverage).
          This source-partitioning prevents all three agents from retrieving from
          the same narrow slice of evidence, which would reduce the system to
          &ldquo;whoever searched better&rdquo; rather than &ldquo;whoever is
          actually supported.&rdquo; Retrieved passages are reranked using a
          cross-encoder (ms-marco-MiniLM) and classified as{" "}
          <em>supported</em>, <em>contradicted</em>, or{" "}
          <em>unverifiable</em>. Claims marked as unverifiable are abstained
          from the trust update and do not affect the agent&apos;s score. If the
          primary retrieval API is unavailable, an OpenAlex fallback is used.
        </p>

        <h3 style={h3Style}>5.6 Trust-update rule (core contribution)</h3>
        <p>
          For each agent <em>i</em> at round <em>t</em>, let{" "}
          <em>V<sub>i</sub><sup>(t)</sup></em> be its count of{" "}
          <em>supported</em> claims,{" "}
          <em>H<sub>i</sub><sup>(t)</sup></em> its count of{" "}
          <em>contradicted</em> claims, and{" "}
          <em>n<sub>i</sub><sup>(t)</sup></em> the number of claims checked.
          The update accumulates evidence in logit space, claim-count
          normalised so that verbosity cannot buy influence:
        </p>
        <Eqn num="1">
          <em>S<sub>i</sub><sup>(t+1)</sup></em> = log(max(<em>S<sub>i</sub>
          <sup>(t)</sup></em>, &epsilon;)) + &alpha;&thinsp;<em>V<sub>i</sub>
          <sup>(t)</sup></em>/<em>n<sub>i</sub><sup>(t)</sup></em> &minus;
          &beta;&thinsp;<em>H<sub>i</sub><sup>(t)</sup></em>/<em>n<sub>i</sub>
          <sup>(t)</sup></em>
        </Eqn>
        <p>
          The accumulated logits pass through <strong>one</strong> softmax,
          followed by a floor/ceiling <strong>simplex projection</strong>. The
          operator order is fixed:
          <strong>
            {" "}logit accumulation &rarr; softmax &rarr; simplex projection
          </strong>{" "}
          &mdash; not softmax &rarr; clamp &rarr; renormalise. The old clamp order
          is wrong because the final renormalisation can push a weight back below
          the floor.
        </p>
        <Eqn num="2">
          <span style={{ fontSize: "9.5pt" }}>
            <em>T&#771;<sub>i</sub><sup>(t+1)</sup></em> = softmax(<em>S</em>
            <sup>(t+1)</sup>)<sub>i</sub> = exp(<em>S<sub>i</sub>
            <sup>(t+1)</sup></em>) / &Sigma;<sub>j</sub> exp(<em>S<sub>j</sub>
            <sup>(t+1)</sup></em>)
          </span>
        </Eqn>
        <Eqn num="3">
          <em>T<sub>i</sub><sup>(t+1)</sup></em> = &Pi;<sub>&Delta;</sub>(
          <em>T&#771;<sub>i</sub><sup>(t+1)</sup></em>), &nbsp; &Delta; = &#123;
          <em>w</em> : floor &le; <em>w<sub>i</sub></em> &le; ceiling,
          &Sigma;<sub>i</sub> <em>w<sub>i</sub></em> = 1 &#125;
        </Eqn>
        <p>
          With floor = 0.1 and ceiling = 0.9, the projection guarantees{" "}
          <strong>min<sub>i</sub> T<sub>i</sub> &ge; floor</strong>,{" "}
          <strong>&Sigma;<sub>i</sub> T<sub>i</sub> = 1</strong>, and{" "}
          <strong>
            max<sub>i</sub> T<sub>i</sub> &le; max(ceiling, 1/N)
          </strong>
          . The floor gives <strong>no-silencing</strong> (a contradicted agent
          keeps a non-zero weight and can recover), and the effective ceiling
          gives <strong>no-domination</strong>. Neutral evidence is an exact
          identity: when support and contradiction counts are both zero, trust
          does not drift toward uniform. Dividing by the claim count makes the
          update invariant to verbosity &mdash; duplicating every claim leaves the
          trust vector unchanged.
        </p>
        <p>
          These are bounded <em>design properties</em>, not global convergence
          theorems. The boundedness test covers 10,000 random draws for{" "}
          <em>N</em> &isin; &#123;1, 3, 5&#125; and is part of the 514-test P0
          suite; the empirical trajectory is logged for every debate. The
          defaults in the current pipeline are &alpha; = 0.5 and &beta; = 0.3,
          with floor/ceiling sensitivity checked before the matrix is frozen.
        </p>

        <h3 style={h3Style}>5.7 Trust-weighted aggregation</h3>
        <p>
          Instead of a plain majority vote, the final answer <em>a*</em> is the
          option that maximises the total trust mass of the agents supporting it
          at the final round <em>K</em>, where <em>p<sub>i</sub></em> is agent{" "}
          <em>i</em>&apos;s position and <strong>1</strong>[&middot;] is the
          indicator function:
        </p>
        <Eqn num="4">
          <em>a*</em> = arg max<sub>a</sub> &Sigma;<sub>i</sub>{" "}
          <em>T<sub>i</sub><sup>(K)</sup></em> &middot;{" "}
          <strong>1</strong>[ <em>p<sub>i</sub><sup>(K)</sup></em> = a ]
        </Eqn>
        <p>
          This is the mechanism that should prevent sycophantic collapse: a
          correct, evidence-backed minority agent can outweigh two unsupported
          majority agents when its trust score is sufficiently higher &mdash; the
          exact scenario a headcount gets wrong.
        </p>

        <h3 style={h3Style}>5.8 Full deliberation protocol</h3>
        <p>
          The complete deliberation follows a structured multi-round protocol.
          After the initial positions are established and initial trust scores
          are set uniformly at <em>1/3</em>, each round proceeds as follows:
          (1) claims are extracted and decomposed; (2) source-partitioned retrieval
          is executed; (3) evidence verdicts are assigned; (4) trust scores are
          updated via Equations 1&ndash;3; (5) for adversarial evaluation only,
          a fabricated &ldquo;expert consensus&rdquo; message is injected between
          Rounds 1 and 2 to simulate social pressure; (6) agents revise positions
          with awareness of peer arguments and their own trust standing. After
          <em>K</em> rounds, the trust-weighted aggregation (Equation 4) produces
          the final answer. Full trust trajectories, per-round evidence verdicts,
          and per-agent reasoning traces are logged for every debate, enabling
          both the ECR calibration analysis and post-hoc failure diagnosis.
        </p>

        <h2 style={h2Style}>6. Models and Technical Stack</h2>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Component</th>
              <th style={thStyle}>Selection</th>
              <th style={thStyle}>Rationale</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={tdStyle}>Agent 1</td>
              <td style={tdStyle}><a style={linkStyle} href="https://huggingface.co/Qwen/Qwen3.5-9B" target="_blank" rel="noopener noreferrer">Qwen3.5-9B</a> (Dev) → <a style={linkStyle} href="https://huggingface.co/Qwen/Qwen3.6-27B" target="_blank" rel="noopener noreferrer">Qwen3.6-27B-FP8</a> (Final)</td>
              <td style={tdStyle}>Two-phase: fast dev on RTX A6000 48GB, 27B FP8 for final experiments; 69.73 GB pinned Final stack</td>
            </tr>
            <tr>
              <td style={tdStyle}>Agent 2</td>
              <td style={tdStyle}><a style={linkStyle} href="https://huggingface.co/google/gemma-4-12B" target="_blank" rel="noopener noreferrer">Gemma 4 12B</a> (Dev) → <a style={linkStyle} href="https://huggingface.co/google/gemma-4-26B-A4B" target="_blank" rel="noopener noreferrer">Gemma-4-26B-A4B-FP8</a> (Final)</td>
              <td style={tdStyle}>Dev: encoder-free proxy. Final: MoE, FP8, 256K context</td>
            </tr>
            <tr>
              <td style={tdStyle}>Agent 3</td>
              <td style={tdStyle}><a style={linkStyle} href="https://huggingface.co/mistralai/Ministral-3-14B-Instruct-2512" target="_blank" rel="noopener noreferrer">Ministral-3-14B-Instruct</a> (Dev) → <a style={linkStyle} href="https://huggingface.co/mistralai/Mistral-Small-3.2-24B-Instruct-2506" target="_blank" rel="noopener noreferrer">Mistral-24B-AWQ</a> (Final)</td>
              <td style={tdStyle}>Dev: Mistral-family 14B, served as AWQ 4-bit on the A6000 (the official FP8 checkpoint cannot run on Ampere). Final: third distinct family, AWQ 4-bit</td>
            </tr>
            <tr>
              <td style={tdStyle}>Oracle (B7)</td>
              <td style={tdStyle}>Gemini 3.1 Pro Preview</td>
              <td style={tdStyle}>Upper-bound ceiling reference only, not core mechanism</td>
            </tr>
            <tr>
              <td style={tdStyle}>Reranker</td>
              <td style={tdStyle}>ms-marco-MiniLM cross-encoder</td>
              <td style={tdStyle}>Standard, fast, validated for passage reranking</td>
            </tr>
            <tr>
              <td style={tdStyle}>Inference engine</td>
              <td style={tdStyle}>vLLM</td>
              <td style={tdStyle}>Free, fast, standard for local multi-model serving</td>
            </tr>
            <tr>
              <td style={tdStyle}>Orchestration</td>
              <td style={tdStyle}>LangGraph</td>
              <td style={tdStyle}>State-machine model fits round-based debate with injection control</td>
            </tr>
            <tr>
              <td style={tdStyle}>Retrieval APIs</td>
              <td style={tdStyle}>PubMed, arXiv, Semantic Scholar</td>
              <td style={tdStyle}>Domain coverage matches scientific QA target; free academic access</td>
            </tr>
          </tbody>
        </table>

        <h2 style={h2Style}>7. Dataset Plan</h2>
        <p>
          The Core matrix uses three datasets. <strong>GPQA-Main</strong> and{" "}
          <strong>MMLU-Pro STEM</strong> are the primary evidence-grounded
          benchmarks; <strong>HLE</strong> is the abstention control, never
          pooled with the primary tests. <strong>EG-SSS</strong> is the
          controlled gold-evidence benchmark, not a Core dataset: it is frozen
          at 180 items in v1.2. The dataset audit found that BrokenMath
          (451/451) and BrokenArXiv (87/87) are proof-only with 0% answer-type
          retention, so they are appendix-only and are not used for CCR or
          evidence grounding.
        </p>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Dataset</th>
              <th style={thStyle}>Role</th>
              <th style={thStyle}>Source</th>
              <th style={thStyle}>Known Limitations</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={tdStyle}>GPQA-Main</td>
              <td style={tdStyle}>Primary evidence-grounded benchmark</td>
              <td style={tdStyle}>Idavidrein/gpqa (HuggingFace, official; gated)</td>
              <td style={tdStyle}>448 total, 400 cap in the matrix; options shuffled; not adversarial</td>
            </tr>
            <tr>
              <td style={tdStyle}>MMLU-Pro STEM</td>
              <td style={tdStyle}>Primary scale/robustness benchmark</td>
              <td style={tdStyle}>TIGER-Lab/MMLU-Pro (HuggingFace, official)</td>
              <td style={tdStyle}>STEM-stratified, 400 cap in the matrix; broad, non-adversarial</td>
            </tr>
            <tr>
              <td style={tdStyle}>EG-SSS</td>
              <td style={tdStyle}>Controlled benchmark release (v1.2 freeze); not a Core dataset</td>
              <td style={tdStyle}>Original release (planned; CC BY 4.0)</td>
              <td style={tdStyle}>Annotation-intensive; 180 floor, 300 target, 600 stretch, 800 no-go</td>
            </tr>
            <tr>
              <td style={tdStyle}>HLE</td>
              <td style={tdStyle}>Abstention / ceiling control</td>
              <td style={tdStyle}>cais/hle (HuggingFace, official; gated)</td>
              <td style={tdStyle}>Retrieval-resistant; 200 cap; never pooled with the primary tests</td>
            </tr>
            <tr>
              <td style={tdStyle}>BrokenMath</td>
              <td style={tdStyle}>Appendix-only premise rejection</td>
              <td style={tdStyle}>INSAIT-Institute/BrokenMath (HuggingFace, official)</td>
              <td style={tdStyle}>451/451 proof-only; 0% answer-type retention — not usable for CCR</td>
            </tr>
            <tr>
              <td style={tdStyle}>BrokenArXiv</td>
              <td style={tdStyle}>Appendix-only qualitative</td>
              <td style={tdStyle}>MathArena/brokenarxiv (HuggingFace, official)</td>
              <td style={tdStyle}>87/87 proof-only; 0% answer-type retention; cite the exact monthly snapshot</td>
            </tr>
          </tbody>
        </table>
        <p>
          The design is two seeds for the main matrix (three for the pilot), with
          a 24-item calibration before the pilot. The executable Core matrix is
          4 arms &times; GPQA-Main 400 / MMLU-Pro STEM 400 / HLE 200 &times; 2
          seeds = 24 runs, budgeted at 1,280 GPU-h. B8-oracle is not a Core arm,
          and EG-SSS is not in Core v1.0. The six-arm target adds B8-placebo and
          B8-oracle through WP-18, and the pre-registration records both the
          target and the executable subset. The benchmark ladder is 180 items as
          the floor (EG-SSS v1.2 freeze), 300 as the target, 600 as a stretch,
          and 800 as a no-go unless 2&ndash;3 dedicated annotators are
          committed.
        </p>
        <p>
          The injection protocol pre-filters questions where the three agents
          produce divergent initial answers, so every evaluated debate presents a
          genuine disagreement. Results on the injected sets are framed as
          stress-test performance, not average-case deployment. All datasets are
          official author releases from HuggingFace. GPQA and HLE require a free
          click-through agreement before download. Dataset papers to cite: GPQA
          (COLM 2024), MMLU-Pro (NeurIPS 2024 D&amp;B), HLE (Nature 2026),
          BrokenMath (arXiv 2025), BrokenArXiv / MathArena (arXiv 2026).
        </p>

        <h2 style={h2Style}>8. Evaluation Strategy</h2>

        <h3 style={h3Style}>8.1 Sycophancy-stress evaluation harness</h3>
        <p>
          We design a controlled injection protocol that simulates social-pressure
          collapse. The protocol operates in six steps: (1) question selection
          and filtering; (2) independent initial answer collection; (3) baseline
          (no-injection) debate run; (4) injection &mdash; a fabricated system
          message stating that two of three agents agree on an answer (the wrong
          one), inserted between Rounds 1 and 2; (5) post-injection debate
          continuation; (6) measurement of whether the correct minority agent
          abandons its position. The injection is only applied to questions where
          the correct answer is initially held by a minority (1 of 3). The
          protocol achieves an inter-rater reliability target of &kappa; &gt;
          0.75.
        </p>

        <h3 style={h3Style}>8.2 Evaluation metrics</h3>
        <p>
          Three primary metrics operationalise the evaluation. Before the pilot,
          the verifier audit checks 150&ndash;200 claim&ndash;evidence pairs; the
          lexical baseline scores 0.58 balanced accuracy on the synthetic audit,
          against a target of &ge;0.75 balanced accuracy and Cohen&apos;s
          &kappa; &ge;0.60. <strong>Collapse
          Rate (CCR)</strong> measures the proportion of correct minority agents
          that abandon their position under injected pressure:
        </p>
        <Eqn num="5">
          CCR = (1 / |<em>C</em>|) &middot; &Sigma;<sub><em>i</em> &isin;
          <em>C</em></sub> <strong>1</strong>[ agent <em>i</em> abandons correct
          answer post-injection ]
        </Eqn>
        <p>
          where <em>C</em> is the set of correct-minority agents across all
          debates. <strong>Minority Preservation Rate (MPR)</strong> measures
          whether a correct minority survives to appear in the final output:
        </p>
        <Eqn num="6">
          MPR = (1 / <em>M</em>) &middot; &Sigma;<sub><em>j</em> = 1</sub>
          <sup><em>M</em></sup> <strong>1</strong>[ correct minority preserved
          in <em>a*</em> for debate <em>j</em> ]
        </Eqn>
        <p>
          where <em>M</em> is the total number of debates with a correct minority.
          <strong>Evidence Calibration Rate (ECR)</strong> measures how well trust
          scores track actual correctness probability:
        </p>
        <Eqn num="7">
          ECR = (1 / <em>R</em>) &middot; &Sigma;<sub><em>t</em> = 1</sub>
          <sup><em>R</em></sup> <strong>1</strong>[ <em>T<sub>i</sub>
          <sup>(t)</sup></em> calibrated to <em>p</em>(correct | evidence<sub>
          <em>i</em></sub><sup>(t)</sup>) ]
        </Eqn>
        <p>
          In addition to these primary metrics, we report standard accuracy on
          GPQA and MMLU-Pro as a sanity check, conduct a human evaluation
          (<em>n</em> = 60, Likert-scale ratings with &kappa; validation), and
          compute Cohen&apos;s <em>d</em> effect sizes for all pairwise condition
          comparisons. Statistical significance is assessed via paired bootstrap
          with 95% confidence intervals across two random seeds in the main
          matrix (three seeds for the pilot). The unit of analysis is the
          question; seed 2 is a pre-registered replication, not a second
          independent study.
        </p>

        <h3 style={h3Style}>8.3 Baselines and executable arms</h3>
        <p>
          The full comparison set is B1&ndash;B10. The pre-registered Core matrix
          runs four executable arms: <strong>B3</strong> (vanilla MAD),{" "}
          <strong>B4-matched</strong> (retrieved evidence with the same
          partition and prompts as B8, majority aggregation),{" "}
          <strong>B8-no-trust</strong> (same evidence and prompts, majority
          aggregation; primary control), and <strong>B8</strong>{" "}
          (trust-weighted treatment). The six-arm target adds{" "}
          <strong>B8-placebo</strong> (verdicts shuffled within debate) and{" "}
          <strong>B8-oracle</strong> (gold evidence), pending WP-18. If
          B8-oracle uses gold-answer trust, the Full target is 36 runs; if it is
          gold-evidence-only on EG-SSS, the target is 32 runs with recomputed
          GPU-h. WP-13 is the landed B8-no-trust prompt split, not the
          placebo/oracle slice.
        </p>
        <ul>
          <li><strong>B1</strong>: Single-Agent Chain-of-Thought</li>
          <li><strong>B2</strong>: Single-Agent + RAG</li>
          <li><strong>B3</strong>: Multi-Agent Debate (vanilla MAD, Du et al.)</li>
          <li><strong>B4</strong>: MAD + RAG; <strong>B4-matched</strong> uses the B8 evidence partition and prompts</li>
          <li><strong>B5</strong>: Self-Consistency (Wang et al.)</li>
          <li><strong>B6</strong>: Mixture-of-Agents (MoA, Wang et al., ICLR 2025)</li>
          <li><strong>B7</strong>: Oracle (strongest available model)</li>
          <li><strong>B8</strong>: Trust-calibrated system; <strong>B8-no-trust</strong> is the primary control</li>
          <li><strong>B8-placebo / B8-oracle</strong>: six-arm target, pending WP-18</li>
          <li><strong>B9</strong>: iMAD (Fan et al., AAAI 2026) &mdash; reimplemented</li>
          <li><strong>B10</strong>: ConsensAgent (Pitre et al., ACL 2025) &mdash; reimplemented or mechanism-level comparison</li>
        </ul>
        <p>
          B5, B6, and B9 preempt the &ldquo;why not self-consistency / MoA /
          iMAD&rdquo; objections, and B10 covers the closest published
          mitigation. B9 (iMAD) carries the highest implementation difficulty and
          is budgeted at approximately 10 working days. The appendix grid is a
          thesis plan, not part of the pre-registered primary matrix; no claim is
          made that B8 beats all B1&ndash;B10 comparison definitions.
        </p>

        <h3 style={h3Style}>8.4 Ablation studies</h3>
        <p>
          Four planned ablation conditions isolate the contribution of each architectural
          component: (A1) trust calibration disabled (fallback to majority vote);
          (A2) progressive retrieval disabled (single-shot retrieval only);
          (A3) source partitioning disabled (all agents retrieve from the same
corpus); (A4) adaptive confidence gating disabled (debate runs on every
           question). An <em>N</em>-scaling ablation (<em>N</em> &isin; &#123;2, 3, 5&#125;)
           on a 100-question subset probes sensitivity to panel size. Every
          ablation preserves all other components, enabling clean attribution of
          any performance delta.
        </p>

        <h2 style={h2Style}>9. Risk Assessment and Mitigation</h2>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Risk</th>
              <th style={thStyle}>Likelihood</th>
              <th style={thStyle}>Impact</th>
              <th style={thStyle}>Mitigation</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={tdStyle}>Trust signal does not behaviourally change output</td>
              <td style={tdStyle}>Medium</td>
              <td style={tdStyle}>Critical</td>
              <td style={tdStyle}>24-item calibration + pilot (Dec 2026) before the matrix; if negative, report as still-publishable finding</td>
            </tr>
            <tr>
              <td style={tdStyle}>Retrieval noise degrades evidence quality</td>
              <td style={tdStyle}>Medium</td>
              <td style={tdStyle}>Moderate</td>
              <td style={tdStyle}>Cross-encoder reranker + citation count filter (&gt;10 citations)</td>
            </tr>
            <tr>
              <td style={tdStyle}>Novelty erosion from published mitigations</td>
              <td style={tdStyle}>Medium</td>
              <td style={tdStyle}>Moderate</td>
              <td style={tdStyle}>Sharpened differentiation: evidence-grounded, numeric, bounded trust; B10 comparison</td>
            </tr>
            <tr>
              <td style={tdStyle}>Single 96GB GPU compute ceiling</td>
              <td style={tdStyle}>Medium</td>
              <td style={tdStyle}>Moderate</td>
              <td style={tdStyle}>FP8 native on Blackwell; Core matrix is 24 runs / 1,280 GPU-h; 6-arm Full target is a 36-run / 1,440 GPU-h envelope</td>
            </tr>
            <tr>
              <td style={tdStyle}>Dataset mismatch (proof-only benchmarks)</td>
              <td style={tdStyle}>High</td>
              <td style={tdStyle}>Moderate</td>
              <td style={tdStyle}>BrokenMath/BrokenArXiv appendix-only; GPQA-Main + MMLU-Pro STEM primary; HLE abstention control; EG-SSS controlled set</td>
            </tr>
            <tr>
              <td style={tdStyle}>iMAD reimplementation divergence</td>
              <td style={tdStyle}>Medium</td>
              <td style={tdStyle}>Moderate</td>
              <td style={tdStyle}>Explicit divergence documentation; use published numbers for easy conditions where comparable</td>
            </tr>
            <tr>
              <td style={tdStyle}>HLE access delayed</td>
              <td style={tdStyle}>Low&ndash;Medium</td>
              <td style={tdStyle}>Low&ndash;Moderate</td>
              <td style={tdStyle}>HLE is an abstention control; GPQA-Main + MMLU-Pro STEM remain primary</td>
            </tr>
            <tr>
              <td style={tdStyle}>Retrieval API downtime</td>
              <td style={tdStyle}>Low</td>
              <td style={tdStyle}>Low</td>
              <td style={tdStyle}>Local caching; OpenAlex fallback API</td>
            </tr>
          </tbody>
        </table>
        <p>
          The highest-risk assumption is that trust-weight changes behaviourally
          alter the final output rather than being ignored by the aggregation
          step. A 24-item calibration and pilot in Dec 2026 tests this before the
          matrix, so a failed premise is discovered early and cheaply. All risks
          are documented transparently with pre-specified fallback plans rather
          than assumed away.
        </p>

        <h2 style={h2Style}>10. Timeline and Milestones</h2>
        <p>
          P0 was released in Nov 2026. The final-stack smoke, WP-18
          placebo/oracle, 24-item calibration and verifier audit precede the G2
          pilot in Dec 2026. The G3 Core run follows in Jan 2027, and the G4/G5
          Full run plus the benchmark ladder in Feb 2027. Core and Full are
          separate stacks (Dev vs Final); do not assume Core cells are reusable.
          The $900&ndash;1,200 is the Full-run budget envelope. Human evaluation
          and the SDT analysis follow in Mar,
          results freeze in Apr, thesis chapters in May, thesis submission in
          Jun, and the defence in Jun/Jul 2027. The paper is written and
          submitted after the defence (Aug&ndash;Dec 2027). No conference
          deadline drives the thesis clock.
        </p>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Period</th>
              <th style={thStyle}>Phase</th>
              <th style={thStyle}>Key Objectives</th>
              <th style={thStyle}>Deliverable / Gate</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={tdStyle}>Jul&ndash;Sep 2026</td>
              <td style={tdStyle}>Phase 0</td>
              <td style={tdStyle}>Literature freeze, environment setup, reproduce vanilla MAD</td>
              <td style={tdStyle}>Gate 0: base debate loop reproduces — achieved 16 Sep 2026 (10/10 debates, 3/3 rounds)</td>
            </tr>
            <tr>
              <td style={tdStyle}>Oct&ndash;Nov 2026</td>
              <td style={tdStyle}>P0</td>
              <td style={tdStyle}>Engineering hardening: options, parser/scorer, trust projection, verifier interface, claim-domain routing, endpoints, manifest/resume</td>
              <td style={tdStyle}>514 tests; P0 gate 13/13 passed</td>
            </tr>
            <tr>
              <td style={tdStyle}>Dec 2026</td>
              <td style={tdStyle}>Pilot run</td>
              <td style={tdStyle}>Final-stack 96 GB smoke ($80–120), WP-18 placebo/oracle, 24-item calibration, verifier audit (150–200 pairs; target ≥0.75 balanced accuracy, κ ≥0.60), 50-question Month-1 pilot, then the 100–150-question G2 pilot</td>
              <td style={tdStyle}>G2: κ &gt; 0.75 and measured behavioural effect; if not, reframe honestly</td>
            </tr>
            <tr>
              <td style={tdStyle}>Jan 2027</td>
              <td style={tdStyle}>Core run</td>
              <td style={tdStyle}>G3: 4 arms × GPQA-Main 400 / MMLU-Pro 400 / HLE 200 × 2 seeds = 24 runs, 1,280 GPU-h; B8-oracle is not a Core arm; EG-SSS is not in Core v1.0</td>
              <td style={tdStyle}>Core matrix + pre-registered causal contrast (B8 vs B8-no-trust)</td>
            </tr>
            <tr>
              <td style={tdStyle}>Feb 2027</td>
              <td style={tdStyle}>Full run + benchmark</td>
              <td style={tdStyle}>G4/G5: 36 runs at 300 items/dataset within a 1,440 GPU-h envelope; WP-18 adds B8-placebo/B8-oracle. If B8-oracle is gold-evidence-only on EG-SSS, 32 runs and recomputed GPU-h. EG-SSS v1.2 freezes at 180 items</td>
              <td style={tdStyle}>Full run + benchmark ladder: 180 floor, 300 target, 600 stretch, 800 no-go</td>
            </tr>
            <tr>
              <td style={tdStyle}>Mar 2027</td>
              <td style={tdStyle}>Human eval + SDT</td>
              <td style={tdStyle}>Human evaluation / SDT, benchmark annotation, verifier-audit follow-up</td>
              <td style={tdStyle}>Human-eval + benchmark package</td>
            </tr>
            <tr>
              <td style={tdStyle}>Apr 2027</td>
              <td style={tdStyle}>Results freeze</td>
              <td style={tdStyle}>Freeze results, CIs, and effect sizes; no post-hoc arm changes</td>
              <td style={tdStyle}>Frozen results</td>
            </tr>
            <tr>
              <td style={tdStyle}>May 2027</td>
              <td style={tdStyle}>Thesis chapters</td>
              <td style={tdStyle}>Write thesis chapters against the frozen results</td>
              <td style={tdStyle}>Thesis draft</td>
            </tr>
            <tr>
              <td style={tdStyle}>Jun 2027</td>
              <td style={tdStyle}>Thesis submission</td>
              <td style={tdStyle}>Submit the FYDP thesis</td>
              <td style={tdStyle}>Submitted thesis</td>
            </tr>
            <tr>
              <td style={tdStyle}>Jun&ndash;Jul 2027</td>
              <td style={tdStyle}>Defence</td>
              <td style={tdStyle}>Defend the thesis</td>
              <td style={tdStyle}>Defence slides</td>
            </tr>
            <tr>
              <td style={tdStyle}>Aug&ndash;Dec 2027</td>
              <td style={tdStyle}>Paper</td>
              <td style={tdStyle}>Write and submit the paper after the defence</td>
              <td style={tdStyle}>TACL rolling submission; EMNLP 2028 fallback</td>
            </tr>
          </tbody>
        </table>
        <p>
          The Go/No-Go logic is unchanged in spirit: Gate 0 validated the base
          loop (achieved 16 Sep 2026, 10/10 debates, mean 370.8 s/debate); the
          G2 pilot requires the injection protocol to reach inter-rater
          reliability &kappa; &gt; 0.75 and a measured behavioural effect; G3
          runs the Core matrix; G4/G5 run the Full target. The Core matrix is
          only interpreted against the pre-registered endpoints (B8 vs
          B8-no-trust). If a gate is not met, the next phase is restructured to
          address the failure rather than letting the schedule dictate the claim.
        </p>

        <h2 style={h2Style}>11. Expected Contributions and Outcomes</h2>
        <p>
          <strong>Primary contribution (C1):</strong> a trust-calibrated,
          evidence-grounded aggregation mechanism for multi-agent debate,
          formally specified with boundedness, no-silencing, and no-domination
          properties, and planned for evaluation against the four executable arms
          and the six-arm target. The pre-registered targets are a 20&ndash;30%
          CCR reduction versus standard MAD, an ECR above 0.80 on the primary
          evaluation set, and non-inferior accuracy on GPQA-Main and MMLU-Pro
          STEM. These are success criteria, not measured results; the P0 gate is
          engineering readiness only.
        </p>
        <p>
          <strong>Co-primary contribution (C2):</strong> an open, reproducible
          sycophancy-stress evaluation harness comprising the controlled injection
          protocol, three standardised metrics (CCR, MPR, ECR), and a statistical
          testing toolkit. The harness is designed to be independently reusable by
          other researchers regardless of whether they adopt our mechanism.
        </p>
        <p>
          <strong>Publication target:</strong> TACL (rolling submission) is the
          primary target, written after the thesis defence. EMNLP 2028 is the
          fallback; a workshop is the safe floor. The completed FYDP thesis and a
          fully reproducible codebase will be released regardless of publication
          outcome.
        </p>
        <p>
          <strong>Novelty statement:</strong> to our knowledge, no existing
          published or preprint work combines in-session, evidence-grounded,
          dynamically-updating trust with boundedness properties of this form. The
          closest published mitigation (ConsensAgent) operates via textual prompt
          refinement; the closest uncertainty-based method (DebUnc) relies on
          self-reported signals; and the closest theoretical framework (Estornell
          &amp; Liu) does not produce a deployable system. Our mechanism occupies
          the intersection of <em>external evidence grounding</em>,{" "}
          <em>dynamic in-session updating</em>, and <em>bounded design
          properties</em> &mdash; a combination we have not found in the existing
          literature.
        </p>

        <h2 style={h2Style}>References</h2>
        <p style={{ fontSize: "9pt", lineHeight: 1.4, marginLeft: "18pt", textIndent: "-18pt" }}>
          Chan, C.-M., et al. (2024). ChatEval: Towards better LLM-based
          evaluation through multi-agent debate. <em>ICLR 2024</em>.
        </p>
        <p style={{ fontSize: "9pt", lineHeight: 1.4, marginLeft: "18pt", textIndent: "-18pt" }}>
          Du, Y., et al. (2024). Improving factuality and reasoning in language
          models through multiagent debate. <em>ICML 2024</em>.
          arXiv:2305.14325.
        </p>
        <p style={{ fontSize: "9pt", lineHeight: 1.4, marginLeft: "18pt", textIndent: "-18pt" }}>
          Estornell, A., &amp; Liu, Y. (2024). Multi-LLM debate: Framework,
          principals, and interventions. <em>NeurIPS 2024</em>.
        </p>
        <p style={{ fontSize: "9pt", lineHeight: 1.4, marginLeft: "18pt", textIndent: "-18pt" }}>
          Fan, J., et al. (2026). iMAD: Intelligent multi-agent debate for
          efficient LLM reasoning. <em>AAAI 2026 (Oral)</em>.
        </p>
        <p style={{ fontSize: "9pt", lineHeight: 1.4, marginLeft: "18pt", textIndent: "-18pt" }}>
          He, J., et al. (2026). Minority Sentinel: A post-hoc classifier for
          minority-answer suppression in multi-agent debate.{" "}
          <em>AgentSearch Workshop @ SIGIR 2026</em>.
        </p>
        <p style={{ fontSize: "9pt", lineHeight: 1.4, marginLeft: "18pt", textIndent: "-18pt" }}>
          Pitre, H., Ramakrishnan, V., &amp; Wang, W. Y. (2025). ConsensAgent:
          Multi-agent debate with prompt refinement for mitigating sycophancy.
          <em>Findings of ACL 2025</em>, pp. 22112&ndash;22133.
        </p>
        <p style={{ fontSize: "9pt", lineHeight: 1.4, marginLeft: "18pt", textIndent: "-18pt" }}>
          Wang, J., et al. (2025). Mixture-of-Agents: Leveraging diverse LLMs
          for improved reasoning. <em>ICLR 2025 (Poster)</em>.
        </p>
        <p style={{ fontSize: "9pt", lineHeight: 1.4, marginLeft: "18pt", textIndent: "-18pt" }}>
          Yao, B., et al. (2025). Peacemaker or troublemaker: How sycophancy
          shapes multi-agent debate. <em>arXiv:2509.23055</em> (preprint;
          ICLR 2026 submission withdrawn).
        </p>
        <p style={{ fontSize: "9pt", lineHeight: 1.4, marginLeft: "18pt", textIndent: "-18pt" }}>
          Yoffe, L., Amayuelas, A., &amp; Wang, W. Y. (2025). DebUnc: Improving
          large language model agent communication with uncertainty metrics.{" "}
          <em>Findings of EMNLP 2025</em>, 23299&ndash;23315.
        </p>
      </div>
    </>
  );
}
