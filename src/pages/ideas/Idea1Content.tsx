import { Badge } from "@/components/shared/Badge";
import { Callout } from "@/components/shared/Callout";
import { GanttTable } from "@/components/shared/GanttTable";
import { InfoGrid } from "@/components/shared/InfoGrid";
import { RiskTable } from "@/components/shared/RiskTable";
import { ArchitectureDiagram } from "@/components/shared/ArchitectureDiagram";
import { TrustSimulator } from "@/components/shared/TrustSimulator";
import { Walkthrough } from "@/components/shared/Walkthrough";
import { CostTable } from "@/components/shared/CostTable";
import {
  ColBox,
  Section,
  SectionTitle,
  TwoCol,
} from "@/components/shared/Section";
import { Timeline } from "@/components/shared/Timeline";
import {
  datasets,
  failures,
  ganttPhases,
  milestones,
  resources,
  risks,
} from "@/data/overview";
import {
  ArrowLeftRight,
  BarChart3,
  BookOpen,
  Brain,
  Building2,
  Calendar,
  ClipboardList,
  FileSearch,
  Gavel,
  GraduationCap,
  Hammer,
  HelpCircle,
  Lightbulb,
  Microscope,
  RefreshCw,
  Ruler,
  Scale,
  Search,
  Settings,
  Shield,
  Sparkles,
  Target,
  Telescope,
  TriangleAlert,
  Trophy,
  Users,
  Wrench,
} from "lucide-react";

export function Idea1Content() {
  return (
    <>
      {/* ───────────── 1. Core Idea ───────────── */}
      <Section accent="blue" className="animate-fade-up">
        <SectionTitle icon={Lightbulb}>1. Core Idea</SectionTitle>
        <p className="mb-3 text-sm sm:text-base">
          We propose a{" "}
          <strong>trust-calibrated multi-agent scientific deliberation</strong>{" "}
          framework to mitigate <strong>sycophantic consensus collapse</strong>{" "}
          in LLM reasoning. Agents whose claims are verified by retrieved
          scientific literature accumulate higher trust weights, preventing
          hallucinating majorities from suppressing correct minority agents.
        </p>
        <Callout variant="success" title="🎯 Positioning & Contributions">
          <p className="mb-2">
            Recent work has <em>diagnosed and measured</em> inter-agent
            sycophancy (Yao et al., 2025) and the correct-minority-suppression
            effect (He et al., 2026). Our contribution is the missing{" "}
            <strong>mitigation</strong> side: an in-session, evidence-grounded
            mechanism, plus an open evaluation harness.
          </p>
          <ul className="list-disc list-inside text-sm space-y-1">
            <li>
              <strong>
                C1 — Trust-Calibrated Evidence-Grounded Aggregation (primary).
              </strong>{" "}
              A bounded, dynamic, evidence-weighted trust rule that re-weights
              agents during the debate.
            </li>
            <li>
              <strong>
                C2 — Open Sycophancy-Stress Evaluation Harness (co-primary).
              </strong>{" "}
              A pre-registered injection protocol + CCR / MPR / ECR metrics +
              9-baseline suite.
            </li>
            <li>
              <strong>C3 — Supporting:</strong> Progressive, source-partitioned
              retrieval for atomic-claim verification.
            </li>
          </ul>
        </Callout>
      </Section>

      {/* ───────────── 0. Research Design Decisions & Assumptions ───────────── */}
      <Section accent="amber" className="animate-fade-up animate-delay-1">
        <SectionTitle icon={Settings}>
          0. Research Design Decisions &amp; Assumptions
        </SectionTitle>

        <TwoCol>
          <ColBox>
            <h4 className="text-sm font-bold mb-2">Why this problem</h4>
            <p className="text-sm leading-relaxed">
              Multi-agent debate (MAD) improves LLM reasoning but has a
              documented failure mode: agents abandon correct answers under
              social pressure from a confident wrong majority. This is the
              single biggest reason MAD's gains don't always materialize,
              especially in scientific QA where a confidently wrong consensus is
              worse than an honest "uncertain."
            </p>
          </ColBox>
          <ColBox>
            <h4 className="text-sm font-bold mb-2">Why it matters</h4>
            <p className="text-sm leading-relaxed">
              As LLMs get deployed as research assistants and decision-support
              tools, false consensus among cooperating AI agents is a trust and
              safety problem — it fails silently and confidently.
            </p>
          </ColBox>
        </TwoCol>

        <Callout
          variant="gap"
          title="🕳️ Verified Research Gap"
          className="mt-4"
        >
          <p className="mb-2">
            <strong>
              No existing framework provides numeric, evidence-grounded,
              in-session trust re-weighting with formal boundedness guarantees.
            </strong>{" "}
            Diagnosis exists (Yao et al. 2025), efficiency optimisation exists
            (iMAD, AAAI 2026), static aggregation exists (MoA, ICLR 2025
            Poster), and recent mitigation attempts use prompt refinement
            (ConsensAgent, Findings of ACL 2025), uncertainty signals (DebUnc,
            Findings of EMNLP 2025), or theoretical pruning interventions
            (Estornell &amp; Liu, NeurIPS 2024 Main Track) — but nothing ties an
            agent's influence to
            <em>
              real-time, externally verified evidence with a formally bounded
              numeric trust score
            </em>
            .
          </p>
        </Callout>

        <h4 className="text-sm font-bold mt-5 mb-3">
          Why Multi-Agent Over Single LLM?
        </h4>
        <p className="text-sm mb-4">
          A single strong model still hallucinates confidently and has no
          internal mechanism to be challenged. Multi-agent debate introduces
          adversarial critique — but only if aggregation doesn't default to
          majority vote, which is precisely the mechanism causing sycophantic
          collapse. This motivates{" "}
          <strong>heterogeneous, independently evidence-checked agents</strong>,
          not multiple instances of the same model.
        </p>

        <h4 className="text-sm font-bold mb-3">Core Research Assumptions</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          {[
            {
              num: 1,
              label: "Claim Decomposition",
              text: "Claims during debate can be decomposed into checkable atomic propositions.",
              risk: "moderate",
              detail: "Some claims are compound or context-dependent.",
            },
            {
              num: 2,
              label: "Retrieval Reliability",
              text: "PubMed/ArXiv/Semantic Scholar retrieval can support/contradict claims within the debate time budget.",
              risk: "moderate",
              detail: "Retrieval noise, sparse coverage on niche topics.",
            },
            {
              num: 3,
              label: "Behavioral Effectiveness",
              text: "Trust weight changes actually alter final output, not just sit in context ignored.",
              risk: "critical",
              detail:
                "The whole mechanism lives or dies on this — must be piloted Month 1.",
            },
            {
              num: 4,
              label: "Heterogeneity Benefit",
              text: "Different model families reduce, but don't eliminate, correlated hallucination.",
              risk: "low",
              detail: "Accepted as a named limitation.",
            },
            {
              num: 5,
              label: "Competitor Differentiation",
              text: "Our method must measurably outperform ConsensAgent's prompt-refinement approach, not just iMAD/MoA.",
              risk: "moderate",
              detail:
                "ConsensAgent (ACL Findings 2025) is the closest published mitigation — a written comparison paragraph is mandatory; full baseline reimplementation if Phase 2 capacity allows.",
            },
          ].map((a) => (
            <div
              key={a.num}
              className="group relative overflow-hidden bg-white dark:bg-[#1a1d35] border border-[#e2e8f0] dark:border-[rgba(255,255,255,0.1)] rounded-md p-4 hover:shadow-md hover:border-[#3b5bdb] dark:hover:border-[#3b5bdb] transition-all duration-200"
            >
              <div
                className={`absolute inset-0 opacity-[0.06] dark:opacity-[0.10] ${
                  a.risk === "critical"
                    ? "bg-[#e03131]"
                    : a.risk === "moderate"
                      ? "bg-[#f08c00]"
                      : "bg-[#0ca678]"
                }`}
              />
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-white font-bold text-xs ${
                      a.risk === "critical"
                        ? "bg-[#e03131]"
                        : a.risk === "moderate"
                          ? "bg-[#f08c00]"
                          : "bg-[#0ca678]"
                    }`}
                  >
                    {a.num}
                  </span>
                  <span
                    className={`text-[0.68rem] font-bold uppercase tracking-[0.08em] px-1.5 py-0.5 rounded ${
                      a.risk === "critical"
                        ? "bg-[#ffe3e3] dark:bg-[rgba(224,49,49,0.2)] text-[#e03131] dark:text-[#fca5a5]"
                        : a.risk === "moderate"
                          ? "bg-[#fff3bf] dark:bg-[rgba(240,140,0,0.2)] text-[#f08c00] dark:text-[#fcd34d]"
                          : "bg-[#d3f9d8] dark:bg-[rgba(12,166,120,0.2)] text-[#0ca678] dark:text-[#6ee7b7]"
                    }`}
                  >
                    {a.risk === "critical"
                      ? "🔴 Critical"
                      : a.risk === "moderate"
                        ? "🟡 Moderate"
                        : "🟢 Low"}{" "}
                    Risk
                  </span>
                </div>
                <div className="font-semibold text-sm mb-1">{a.label}</div>
                <p className="text-sm mb-1">{a.text}</p>
                <p className="text-xs text-[#64748b] dark:text-[#94a3b8] mb-0">
                  {a.detail}
                </p>
              </div>
            </div>
          ))}
        </div>

        <h4 className="text-sm font-bold mb-3">
          Alternatives Considered &amp; Rejected
        </h4>
        <TwoCol>
          <ColBox>
            <h4 className="text-sm font-semibold mb-1 text-[#e03131] dark:text-[#fca5a5]">
              ✗ Post-hoc Classifier (Minority Sentinel-style)
            </h4>
            <p className="text-xs text-[#64748b] dark:text-[#94a3b8] mb-0">
              Intervenes after debate ends, not during. Valid but separate
              contribution space — we position against it, not duplicate it.
            </p>
          </ColBox>
          <ColBox>
            <h4 className="text-sm font-semibold mb-1 text-[#e03131] dark:text-[#fca5a5]">
              ✗ Fine-tuning Agents
            </h4>
            <p className="text-xs text-[#64748b] dark:text-[#94a3b8] mb-0">
              Rejected due to compute cost and lack of cross-model
              generalization. Also conflates "sycophancy reduction" with
              "evidence grounding" — different mechanisms.
            </p>
          </ColBox>
          <ColBox>
            <h4 className="text-sm font-semibold mb-1 text-[#e03131] dark:text-[#fca5a5]">
              ✗ Confidence-Based Re-weighting (iMAD-style)
            </h4>
            <p className="text-xs text-[#64748b] dark:text-[#94a3b8] mb-0">
              Confidence is self-reported from the same context that can be
              manipulated by injected pressure — exactly the vulnerability we
              target.
            </p>
          </ColBox>
          <ColBox>
            <h4 className="text-sm font-semibold mb-1 text-[#0ca678] dark:text-[#6ee7b7]">
              ✓ Our Approach
            </h4>
            <p className="text-xs text-[#64748b] dark:text-[#94a3b8] mb-0">
              Ties agent influence to something <em>external</em> and{" "}
              <em>independent</em> of debate social dynamics — the actual causal
              lever needed to break sycophantic collapse, not just detect it.
            </p>
          </ColBox>
        </TwoCol>
      </Section>

      {/* ───────────── 2. Research Motivation ───────────── */}
      <Section className="animate-fade-up animate-delay-2">
        <SectionTitle icon={Microscope}>2. Research Motivation</SectionTitle>
        <TwoCol>
          <ColBox>
            <h4 className="text-sm font-bold mb-2">Why this problem matters</h4>
            <p className="text-sm leading-relaxed">
              Sycophancy is cited as an open problem in 50+ peer-reviewed papers
              since 2023. In multi-agent systems, it undermines the reason
              multi-agent debate is used — if debate collapses to whichever
              position sounds most confident rather than which is most correct,
              it adds cost without adding reliability.
            </p>
          </ColBox>
          <ColBox>
            <h4 className="text-sm font-bold mb-2">The specific gap</h4>
            <p className="text-sm leading-relaxed">
              <strong>
                No existing framework provides numeric, evidence-grounded,
                in-session trust re-weighting.
              </strong>{" "}
              Prompt refinement (ConsensAgent, ACL Findings 2025), uncertainty
              signals (DebUnc, EMNLP Findings 2025), and theoretical pruning
              interventions (Estornell &amp; Liu, NeurIPS 2024) all address
              related problems — but none ties agent influence to real-time
              external evidence verification with a formally bounded trust
              score. This is the exact, verified gap.
            </p>
          </ColBox>
        </TwoCol>
        <h4 className="text-sm font-bold mt-4 mb-2">
          Existing limitations (verified against literature)
        </h4>
        <div className="overflow-x-auto rounded-lg shadow-sm">
          <table className="w-full border-collapse text-xs sm:text-sm">
            <thead>
              <tr>
                {["Work", "Year", "What it does", "What's missing"].map((h) => (
                  <th
                    key={h}
                    className="p-3 text-left font-bold bg-[#f1f5f9] dark:bg-[rgba(255,255,255,0.06)] border-b-2 border-[#e2e8f0] dark:border-[rgba(255,255,255,0.15)] whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                [
                  "Yao et al. (Peacemaker)",
                  "2025",
                  "Diagnoses & measures inter-agent sycophancy",
                  "No mitigation — diagnostic only",
                ],
                [
                  "He et al. (Minority Sentinel)",
                  "2026",
                  "Post-hoc classifier on debate logs",
                  "Intervenes after debate ends, not during",
                ],
                [
                  "iMAD (Fan et al.)",
                  "2026",
                  "Decides when to debate (efficiency)",
                  "Doesn't decide whom to trust once debating",
                ],
                [
                  "MoA (Wang et al.)",
                  "2025",
                  "Static multi-model aggregation",
                  "No evidence grounding or dynamic trust",
                ],
                [
                  "ConsensAgent (Pitre et al.)",
                  "2025",
                  "Prompt-refinement sycophancy mitigation",
                  "Static/textual intervention — not numeric trust; no external evidence retrieval",
                ],
                [
                  "DebUnc (Yoffe et al.)",
                  "2025",
                  "Uncertainty-based in-loop weighting",
                  "Self-reported uncertainty signals — not grounded in external evidence verification",
                ],
                [
                  "Estornell & Liu",
                  "2024",
                  "Theoretical framework for majority convergence",
                  "Theoretical only — proposes pruning interventions, not a deployable system",
                ],
              ].map(([work, yr, does, missing], i) => (
                <tr
                  key={i}
                  className="border-b border-[#e2e8f0] dark:border-[rgba(255,255,255,0.08)] last:border-0 hover:bg-[#dce4ff] dark:hover:bg-[rgba(59,91,219,0.12)] even:bg-[#f8fafc] dark:even:bg-[rgba(255,255,255,0.03)] transition-colors"
                >
                  <td className="p-3 font-medium whitespace-nowrap">{work}</td>
                  <td className="p-3 whitespace-nowrap">{yr}</td>
                  <td className="p-3">{does}</td>
                  <td className="p-3 text-[#e03131]">{missing}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* ───────────── 3. Problem Statement ───────────── */}
      <Section accent="teal" className="animate-fade-up animate-delay-2">
        <SectionTitle icon={Target}>3. Problem Statement</SectionTitle>
        <p className="text-sm mb-4">
          <strong>Research hypothesis:</strong> If agent influence in
          aggregation is dynamically re-weighted during debate based on external
          evidence verification, sycophantic collapse will measurably decrease
          compared to standard majority-vote debate, without requiring model
          fine-tuning.
        </p>
        <h4 className="text-sm font-bold mb-3">
          Four Engineering Challenges (Washington Accord Level)
        </h4>
        <TwoCol>
          <ColBox>
            <h4 className="text-sm font-semibold mt-0 mb-2">
              Challenge A — Real-time Verification
            </h4>
            <p className="text-sm text-[#64748b] dark:text-[#94a3b8] mb-0">
              Decompose claims into atomic propositions; retrieve
              supporting/contradicting evidence within &lt;10 s per turn.
            </p>
          </ColBox>
          <ColBox>
            <h4 className="text-sm font-semibold mt-0 mb-2">
              Challenge B — Trust Stability
            </h4>
            <p className="text-sm text-[#64748b] dark:text-[#94a3b8] mb-0">
              Design update rule avoiding degenerate equilibria (full collapse
              or single-agent dominance).
            </p>
          </ColBox>
          <ColBox>
            <h4 className="text-sm font-semibold mt-0 mb-2">
              Challenge C — Behavioral Effectiveness
            </h4>
            <p className="text-sm text-[#64748b] dark:text-[#94a3b8] mb-0">
              Ensure trust weights change model outputs, not merely appear in
              context and get ignored by attention.{" "}
              <strong>Highest risk.</strong>
            </p>
          </ColBox>
          <ColBox>
            <h4 className="text-sm font-semibold mt-0 mb-2">
              Challenge D — Heterogeneous Agents
            </h4>
            <p className="text-sm text-[#64748b] dark:text-[#94a3b8] mb-0">
              Trust calibration must be model-agnostic across ~14–32B
              open-weight models from different families.
            </p>
          </ColBox>
        </TwoCol>
      </Section>

      {/* ───────────── 4. Complete System Architecture ───────────── */}
      <Section className="animate-fade-up animate-delay-3">
        <SectionTitle icon={Building2}>
          4. Complete System Architecture
        </SectionTitle>

        <p className="text-sm mb-5">
          The system processes each query through a confidence gate, then either
          returns a direct answer or triggers the full evidence-grounded debate
          pipeline shown below. Tap any stage to read what it does in plain
          English.
        </p>

        <div className="mb-5">
          <ArchitectureDiagram />
        </div>

        <div className="flex items-center gap-2 text-xs text-[#64748b] dark:text-[#94a3b8] bg-[#f8fafc] dark:bg-[rgba(255,255,255,0.03)] rounded-lg p-3 border border-[#e2e8f0] dark:border-[rgba(255,255,255,0.08)] mb-5">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#f08c00] text-white text-[10px] font-bold flex-shrink-0">
            ⚡
          </span>
          Over-triggering (confident queries entering debate) wastes compute but
          poses no correctness risk.
        </div>

        <TwoCol>
          <ColBox>
            <h4 className="text-sm font-bold mb-2">4.1 Confidence Estimator</h4>
            <p className="text-sm leading-relaxed mb-0">
              Lightweight single-pass check using self-reported confidence or
              3-sample agreement. Avoids full debate cost on easy questions.
              Failure mode: over-triggering (wastes compute, no correctness
              risk).
            </p>
          </ColBox>
          <ColBox>
            <h4 className="text-sm font-bold mb-2">4.2 Agent Pool (N=3)</h4>
            <p className="text-sm leading-relaxed mb-0">
              Qwen3.6-27B, Gemma 4 26B A4B, Mistral Small 3.2 24B — three
              different families for genuine heterogeneity. Each tracks own
              trust vector T ∈ ℝ³, initialized uniformly at 1/N.
            </p>
          </ColBox>
          <ColBox>
            <h4 className="text-sm font-bold mb-2">
              4.3 Source-Partitioned RAG
            </h4>
            <p className="text-sm leading-relaxed mb-0">
              Claims → atomic propositions → Agent A→PubMed, B→ArXiv, C→Semantic
              Scholar. Prevents all agents retrieving from same narrow slice.
              Cross-encoder reranker scores evidence per claim.
            </p>
          </ColBox>
          <ColBox>
            <h4 className="text-sm font-bold mb-2">4.4 Trust Update (Core)</h4>
            <p className="text-sm leading-relaxed mb-0">
              <code>Sᵢ(t+1) = Sᵢ(t) + α·Vᵢ − β·Hᵢ</code> then softmax →
              clamp[0.1, 0.9] → renormalize. Vᵢ = supported claims proportion,
              Hᵢ = contradicted proportion. α=1.5, β=1.0 (validated on
              held-out).
            </p>
          </ColBox>
          <ColBox>
            <h4 className="text-sm font-bold mb-2">
              4.5 Revision Rounds (K=3)
            </h4>
            <p className="text-sm leading-relaxed mb-0">
              Agents see peer arguments + own trust standing. Simulates genuine
              deliberation. Trust trajectory logged across rounds for ECR
              analysis.
            </p>
          </ColBox>
          <ColBox>
            <h4 className="text-sm font-bold mb-2">
              4.6 Trust-Weighted Adjudication
            </h4>
            <p className="text-sm leading-relaxed mb-0">
              Final answer = argmax over Σ(Tᵢ × positionᵢ) at round K — not
              majority vote. Correct minority with high trust can outweigh two
              unsupported majority agents.
            </p>
          </ColBox>
        </TwoCol>

        {/* Interactive trust-score simulator (screen only) */}
        <div className="print:hidden mt-6">
          <h4 className="text-sm font-bold mb-3">
            Try the Trust Update Yourself (§4.4)
          </h4>
          <TrustSimulator />
        </div>
      </Section>

      {/* ───────────── 5. Detailed Multi-Agent Pipeline ───────────── */}
      <Section accent="blue" className="animate-fade-up animate-delay-4">
        <SectionTitle icon={Wrench}>
          5. Detailed Multi-Agent Pipeline
        </SectionTitle>

        <h4 className="text-sm font-bold mb-3">
          Agent 0 — Confidence Estimator (Gatekeeper)
        </h4>
        <div className="overflow-x-auto rounded-lg shadow-sm mb-5">
          <table className="w-full border-collapse text-xs sm:text-sm">
            <thead>
              <tr>
                {["Property", "Detail"].map((h) => (
                  <th
                    key={h}
                    className="p-2.5 text-left font-bold bg-[#f1f5f9] dark:bg-[rgba(255,255,255,0.06)] border-b-2 border-[#e2e8f0] dark:border-[rgba(255,255,255,0.15)]"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                [
                  "Purpose",
                  "Avoid full debate cost on easy questions (all agents agree correctly)",
                ],
                [
                  "Input → Output",
                  "Raw question → binary gate (debate / no-debate) + direct answer if no-debate",
                ],
                [
                  "Prompt strategy",
                  "Simple CoT + explicit confidence self-report, or 3-sample agreement check",
                ],
                [
                  "Failure mode",
                  "Mis-classifies hard as easy → answered without debate (acceptable — eval datasets are pre-filtered to divergent cases)",
                ],
                [
                  "Recovery",
                  "None needed — failure is cost inefficiency, not a correctness bug",
                ],
                [
                  "If removed",
                  "Debate runs on every question. No correctness impact, only ~9 vs ~1 forward passes on easy questions",
                ],
              ].map(([prop, detail], i) => (
                <tr
                  key={i}
                  className="border-b border-[#e2e8f0] dark:border-[rgba(255,255,255,0.08)] last:border-0 hover:bg-[#dce4ff] dark:hover:bg-[rgba(59,91,219,0.12)] even:bg-[#f8fafc] dark:even:bg-[rgba(255,255,255,0.03)] transition-colors"
                >
                  <td className="p-2.5 font-medium whitespace-nowrap">
                    {prop}
                  </td>
                  <td className="p-2.5">{detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h4 className="text-sm font-bold mb-3">Agents 1–3 — Debate Agents (Two-Phase Strategy)</h4>
        <TwoCol>
          <ColBox>
            <h4 className="text-sm font-semibold mb-1">Dev: Qwen3.5-9B → Final: Qwen3.6-27B</h4>
            <p className="text-xs text-[#64748b] dark:text-[#94a3b8] mb-0">
              Dev: cheap iterative testing on RTX 4090. Final: 27B dense,
              262K context, caps prior 397B MoE flagship in coding. Apache 2.0.
            </p>
          </ColBox>
          <ColBox>
            <h4 className="text-sm font-semibold mb-1">
              Dev: Gemma 4 12B → Final: Gemma 4 26B A4B
            </h4>
            <p className="text-xs text-[#64748b] dark:text-[#94a3b8] mb-0">
              Dev: encoder-free 12B proxy. Final: MoE (3.8B active),
              256K context, matches 31B quality at fraction of compute.
            </p>
          </ColBox>
          <ColBox>
            <h4 className="text-sm font-semibold mb-1">
              Dev: Phi-4-Reasoning 14B → Final: Mistral Small 3.2 24B
            </h4>
            <p className="text-xs text-[#64748b] dark:text-[#94a3b8] mb-0">
              Dev: reasoning-specialised Phi-4. Final: Mistral adds third
              distinct family (non-Qwen, non-Gemma) for true heterogeneity.
            </p>
          </ColBox>
          <ColBox>
            <h4 className="text-sm font-semibold mb-1">Recovery Mechanisms</h4>
            <p className="text-xs text-[#64748b] dark:text-[#94a3b8] mb-0">
              Unparseable output → fallback LLM extraction. Timeout → retry once
              then mark INCONCLUSIVE for that round. Never blocks the whole
              debate.
            </p>
          </ColBox>
        </TwoCol>

        <h4 className="text-sm font-bold mt-5 mb-3">
          Retrieval Sub-System &amp; Orchestrator
        </h4>
        <TwoCol>
          <ColBox>
            <h4 className="text-sm font-semibold mb-1">Retrieval</h4>
            <p className="text-xs text-[#64748b] dark:text-[#94a3b8] mb-0">
              Source-partitioned: Agent A→PubMed, B→ArXiv, C→Semantic Scholar.
              Cross-encoder reranks passages. Per-claim verdict: supported /
              contradicted / unverifiable. If removed → system reduces to MoA
              (baseline B6).
            </p>
          </ColBox>
          <ColBox>
            <h4 className="text-sm font-semibold mb-1">Orchestrator</h4>
            <p className="text-xs text-[#64748b] dark:text-[#94a3b8] mb-0">
              LangGraph state machine manages round sequencing, injection point
              (t=1→2), trust updates, final aggregation. Hard round cap (K=3)
              and retry cap (3) prevent runaway loops.
            </p>
          </ColBox>
        </TwoCol>
      </Section>

      {/* ───────────── 6. Complete Data Flow ───────────── */}
      <Section className="animate-fade-up animate-delay-5">
        <SectionTitle icon={ArrowLeftRight}>6. Complete Data Flow</SectionTitle>
        <p className="text-sm mb-4">
          End-to-end data flow from question submission to final output. Every
          intermediate result is logged for traceability, ECR calibration, and
          verification of Propositions 2–3.
        </p>

        {/* Interactive step-by-step walkthrough (screen only) */}
        <div className="print:hidden mb-5">
          <h4 className="text-sm font-bold mb-3">
            Walk the Real Example, One Step at a Time
          </h4>
          <Walkthrough />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          {[
            {
              step: "01",
              title: "Question Input",
              desc: "Raw question string + ground truth (hidden from agents). Submitted by user or eval harness.",
              color: "from-[#1c7ed6] to-[#4dabf7]",
            },
            {
              step: "02",
              title: "Confidence Gate",
              desc: "Debate=True/False decision. If False → skip to step 08 with direct answer.",
              color: "from-[#f08c00] to-[#ffd43b]",
            },
            {
              step: "03",
              title: "Round 0 — Positions",
              desc: "3× {agent_id, answer, reasoning_trace, initial_trust=⅓}. Agents state independent positions.",
              color: "from-[#7c3aed] to-[#b197fc]",
            },
            {
              step: "04",
              title: "Claim Decomposition",
              desc: "3× list of atomic claims, each tagged to its source agent. Ready for verification.",
              color: "from-[#3b5bdb] to-[#748ffc]",
            },
            {
              step: "05",
              title: "Source-Partitioned Retrieval",
              desc: "Per-claim {evidence_verdict, passage, relevance_score}. First external signal enters the system.",
              color: "from-[#0ca678] to-[#69db7c]",
            },
            {
              step: "06",
              title: "Trust Update (R1)",
              desc: "Updated Sᵢ, Tᵢ per agent. [Optional: Injection point for fabricated wrong consensus].",
              color: "from-[#e03131] to-[#ff8787]",
            },
            {
              step: "07",
              title: "Revision Rounds ×K",
              desc: "Repeat steps 03–06 for K=3. Full trust trajectory across rounds — required for Propositions 2–3.",
              color: "from-[#7c3aed] to-[#b197fc]",
            },
            {
              step: "08",
              title: "Trust-Weighted Agg.",
              desc: "Final answer = argmax over Σ(Tᵢ × positionᵢ) at round K. NOT majority vote.",
              color: "from-[#3b5bdb] to-[#748ffc]",
            },
            {
              step: "09",
              title: "Result Package",
              desc: "Answer + evidence citations + trust trajectory + per-agent reasoning traces.",
              color: "from-[#0ca678] to-[#69db7c]",
            },
          ].map(({ step, title, desc, color }) => (
            <div
              key={step}
              className="relative rounded-lg border border-[#e2e8f0] dark:border-[rgba(255,255,255,0.1)] bg-white dark:bg-[#1a1d35] p-4 transition-shadow hover:shadow-sm"
            >
              <div
                className={`inline-flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br ${color} text-white text-[11px] font-bold mb-2 shadow-sm`}
              >
                {step}
              </div>
              <h5 className="text-sm font-semibold mb-1 text-[#1e2d3d] dark:text-[#e2e8f0]">
                {title}
              </h5>
              <p className="text-xs text-[#64748b] dark:text-[#94a3b8] leading-relaxed">
                {desc}
              </p>
              {/* Connector arrow */}
              <div className="hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2 text-[#cbd5e1] dark:text-[rgba(255,255,255,0.15)] text-lg">
                →
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs text-[#64748b] dark:text-[#94a3b8] bg-[#f8fafc] dark:bg-[rgba(255,255,255,0.03)] rounded-lg p-3 border border-[#e2e8f0] dark:border-[rgba(255,255,255,0.08)]">
          <strong>Note:</strong> Every intermediate output is logged — trust
          trajectory (step 07) is required for Propositions 2–3; per-claim
          evidence verdicts (step 05) are required for ECR calibration.
        </p>
      </Section>

      {/* ───────────── 7. Models & Tools ───────────── */}
      <Section accent="teal" className="animate-fade-up">
        <SectionTitle icon={Hammer}>7. Models &amp; Tools</SectionTitle>
        <p className="text-sm mb-4">
          Full model stack per blueprint §7. All open-weight, inference-only,
          single A100.
        </p>
        <InfoGrid cards={resources} />

        <h4 className="text-sm font-bold mt-5 mb-3">GPU Budget</h4>
        <p className="text-xs text-[#64748b] dark:text-[#94a3b8] mb-3">
          Two-phase strategy: develop on RTX 4090 ($0.20–0.40/hr) with smaller
          models, then run final experiments on A100 80GB ($0.68–1.50/hr) with
          the full-scale stack. Use the sliders below to estimate your budget.
        </p>
        <CostTable />

        <h4 className="text-sm font-bold mt-5 mb-3">
          Implementation Difficulty Ranking (easiest → hardest)
        </h4>
        <div className="overflow-x-auto rounded-lg shadow-sm">
          <table className="w-full border-collapse text-xs sm:text-sm">
            <thead>
              <tr>
                {["#", "Component", "Difficulty", "Why"].map((h) => (
                  <th
                    key={h}
                    className="p-2.5 text-left font-bold bg-[#f1f5f9] dark:bg-[rgba(255,255,255,0.06)] border-b-2 border-[#e2e8f0] dark:border-[rgba(255,255,255,0.15)]"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                [
                  1,
                  "vLLM multi-model serving",
                  "Low",
                  "Well-documented, standard setup",
                ],
                [
                  2,
                  "Retrieval + reranking",
                  "Moderate",
                  "Mostly API/plumbing work",
                ],
                [
                  3,
                  "Claim decomposition + tagging",
                  "Moderate",
                  "Needs careful prompt engineering + fallback extraction",
                ],
                [
                  4,
                  "Trust update + LangGraph state machine",
                  "Moderate–High",
                  "Operator order must match proven Proposition 1 (softmax→clamp→renormalize)",
                ],
                [
                  5,
                  "iMAD reimplementation (B9)",
                  "Highest",
                  "~10 working days; requires reconstructing method from paper description",
                ],
              ].map(([rank, component, difficulty, why], i) => (
                <tr
                  key={i}
                  className="border-b border-[#e2e8f0] dark:border-[rgba(255,255,255,0.08)] last:border-0 hover:bg-[#dce4ff] dark:hover:bg-[rgba(59,91,219,0.12)] even:bg-[#f8fafc] dark:even:bg-[rgba(255,255,255,0.03)] transition-colors"
                >
                  <td className="p-2.5 font-bold">{rank}</td>
                  <td className="p-2.5">{component}</td>
                  <td className="p-2.5">
                    <Badge
                      variant={i === 4 ? "rose" : i >= 2 ? "amber" : "blue"}
                    >
                      {difficulty}
                    </Badge>
                  </td>
                  <td className="p-2.5">{why}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* ───────────── 8. Dataset Plan ───────────── */}
      <Section className="animate-fade-up animate-delay-1">
        <SectionTitle icon={BarChart3}>8. Dataset Plan</SectionTitle>
        <p className="text-sm mb-4">
          Five datasets across adversarial and stable categories.
          BrokenMath/BrokenArXiv are primary for sycophancy measurement.
        </p>
        <div className="overflow-x-auto rounded-lg shadow-sm">
          <table className="w-full border-collapse text-xs sm:text-sm">
            <thead>
              <tr>
                {["Dataset", "Role", "Source", "Size", "Limitation"].map(
                  (h) => (
                    <th
                      key={h}
                      className="p-2.5 text-left font-bold bg-[#f1f5f9] dark:bg-[rgba(255,255,255,0.06)] border-b-2 border-[#e2e8f0] dark:border-[rgba(255,255,255,0.15)] whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {datasets.map((ds, i) => (
                <tr
                  key={i}
                  className="border-b border-[#e2e8f0] dark:border-[rgba(255,255,255,0.08)] last:border-0 hover:bg-[#dce4ff] dark:hover:bg-[rgba(59,91,219,0.12)] even:bg-[#f8fafc] dark:even:bg-[rgba(255,255,255,0.03)] transition-colors"
                >
                  <td className="p-2.5 font-medium">{ds.name}</td>
                  <td className="p-2.5">
                    <Badge variant={i < 3 ? "rose" : "blue"}>
                      {ds.role.split(" ")[0]}
                    </Badge>{" "}
                    {ds.role}
                  </td>
                  <td className="p-2.5">{ds.source}</td>
                  <td className="p-2.5 whitespace-nowrap">{ds.size}</td>
                  <td className="p-2.5 text-xs text-[#64748b] dark:text-[#94a3b8]">
                    {ds.limitation}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-[#64748b] dark:text-[#94a3b8] mt-3">
          <strong>Fallback:</strong> If HLE access is delayed → GPQA-Diamond
          with injection protocol. If BrokenArXiv snapshot discontinues → freeze
          last snapshot. If Semantic Scholar API degrades → OpenAlex API.
        </p>
      </Section>

      {/* ───────────── 9. Evaluation Strategy ───────────── */}
      <Section accent="blue" className="animate-fade-up animate-delay-2">
        <SectionTitle icon={Ruler}>9. Evaluation Strategy</SectionTitle>
        <h4 className="text-sm font-bold mb-3">
          Metrics &amp; Primary Hypotheses
        </h4>
        <div className="overflow-x-auto rounded-lg shadow-sm mb-5">
          <table className="w-full border-collapse text-xs sm:text-sm">
            <thead>
              <tr>
                {["Metric", "Definition", "Primary Hypothesis"].map((h) => (
                  <th
                    key={h}
                    className="p-2.5 text-left font-bold bg-[#f1f5f9] dark:bg-[rgba(255,255,255,0.06)] border-b-2 border-[#e2e8f0] dark:border-[rgba(255,255,255,0.15)]"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                [
                  "CCR (Collapse Rate)",
                  "% of correct agents who abandon under injected pressure",
                  "H1: Trust-calibration reduces CCR by ≥20% vs MAD on BrokenMath/BrokenArXiv",
                ],

                [
                  "MPR (Minority Preservation)",
                  "% debates where correct minority survives to final output",
                  "H2: MPR improves by ≥15pp vs plain MAD across 3 adversarial datasets",
                ],
                [
                  "ECR (Evidence Calibration)",
                  "Correlation between trust weight and empirical correctness",
                  "H3: ECR > 0.80 on GPQA, indicating trust tracks correctness",
                ],
                [
                  "Task Accuracy",
                  "Standard answer accuracy per benchmark",
                  "H4: No regression on stable splits; ≥ MAD + 10% on adversarial",
                ],
              ].map(([metric, defn, hyp], i) => (
                <tr
                  key={i}
                  className="border-b border-[#e2e8f0] dark:border-[rgba(255,255,255,0.08)] last:border-0 hover:bg-[#dce4ff] dark:hover:bg-[rgba(59,91,219,0.12)] even:bg-[#f8fafc] dark:even:bg-[rgba(255,255,255,0.03)] transition-colors"
                >
                  <td className="p-2.5 font-medium">{metric}</td>
                  <td className="p-2.5">{defn}</td>
                  <td className="p-2.5 text-[#3b5bdb]">{hyp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h4 className="text-sm font-bold mb-3">Baselines (B1–B9)</h4>
        <div className="overflow-x-auto rounded-lg shadow-sm mb-4">
          <table className="w-full border-collapse text-xs sm:text-sm">
            <thead>
              <tr>
                {["ID", "Baseline", "What it measures"].map((h) => (
                  <th
                    key={h}
                    className="p-2.5 text-left font-bold bg-[#f1f5f9] dark:bg-[rgba(255,255,255,0.06)] border-b-2 border-[#e2e8f0] dark:border-[rgba(255,255,255,0.15)]"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["B1", "Single-Agent CoT", "Floor: no debate at all"],
                ["B2", "Single-Agent + RAG", "Single-agent with evidence"],
                ["B3", "MAD (majority vote)", "Standard multi-agent debate"],
                ["B4", "MAD + RAG", "Debate with evidence"],
                ["B5", "Self-Consistency", "k samples, majority vote"],
                ["B6", "MoA (equal-weight)", "Multi-model, static aggregation"],
                ["B7", "Oracle (Gemini 3.1 Pro Preview)", "Upper-bound ceiling"],
                ["B8", "Ours (trust-weighted)", "Primary system"],
                ["B9", "iMAD", "Closest published competitor"],
                [
                  "B10",
                  "ConsensAgent (if feasible)",
                  "Prompt-refinement mitigation — closest to ours in goal, most different in mechanism",
                ],
              ].map(([id, bl, what], i) => (
                <tr
                  key={i}
                  className="border-b border-[#e2e8f0] dark:border-[rgba(255,255,255,0.08)] last:border-0 hover:bg-[#dce4ff] dark:hover:bg-[rgba(59,91,219,0.12)] even:bg-[#f8fafc] dark:even:bg-[rgba(255,255,255,0.03)] transition-colors"
                >
                  <td className="p-2.5 font-bold whitespace-nowrap">{id}</td>
                  <td className="p-2.5">{bl}</td>
                  <td className="p-2.5">{what}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Callout
          variant="warning"
          title="🧪 Baseline B10 — ConsensAgent (Pitre et al., Findings of ACL 2025)"
        >
          <p className="text-sm mb-1">
            <strong>Why included:</strong> ConsensAgent is the closest published
            mitigation to our work — it also targets sycophancy in multi-agent
            debate, but via <strong>static/dynamic prompt refinement</strong>,
            not evidence-grounded numeric trust. This is the sharpest
            differentiation line in our related-work section.
          </p>
          <p className="text-sm mb-0">
            <strong>Implementation plan:</strong> Full reimplementation if Phase
            2 capacity allows (~1 week). Minimum: compare against published
            results (state-of-the-art on six reasoning datasets), with explicit
            mechanism differentiation in the paper. If excluded, a written
            comparison paragraph explaining why (mechanism difference:
            prompt-tuning vs. evidence-scoring) is mandatory.
          </p>
        </Callout>

        <h4 className="text-sm font-bold mb-3">Ablation Studies</h4>
        <p className="text-sm mb-3">
          Four ablations isolate each component's contribution:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          {[
            [
              "No trust calibration",
              "Falls back to equal-weight aggregation → isolates trust mechanism effect",
            ],
            [
              "No progressive retrieval",
              "Single-shot retrieval only → isolates progressive refinement effect",
            ],
            [
              "No source partitioning",
              "All agents retrieve from same corpus → isolates partitioning effect",
            ],
            [
              "No adaptive triggering",
              "Debate runs on every question → isolates confidence gate effect",
            ],
          ].map(([name, effect], i) => (
            <div
              key={i}
              className="bg-[#f0f2f7] dark:bg-[#1a1d35] border border-[#e2e8f0] dark:border-[rgba(255,255,255,0.1)] rounded-md p-3"
            >
              <div className="font-semibold text-xs mb-1">{name}</div>
              <div className="text-xs text-[#64748b] dark:text-[#94a3b8]">
                {effect}
              </div>
            </div>
          ))}
        </div>

        <Callout variant="info" title="📊 Statistical Validation">
          3 random seeds + 95% confidence intervals + paired bootstrap + Cohen's
          d across all comparisons. Preempts the common reviewer criticism of
          single-run comparisons in MAD literature.
        </Callout>
      </Section>

      {/* ───────────── 10. Edge Cases & Failure Handling ───────────── */}
      <Section className="animate-fade-up animate-delay-3">
        <SectionTitle icon={Shield}>
          10. Edge Cases &amp; Failure Handling
        </SectionTitle>
        <p className="text-sm mb-4">
          Per blueprint §10. Each failure mode has documented detection,
          prevention, mitigation, and recovery.
        </p>
        <div className="overflow-x-auto rounded-lg shadow-sm">
          <table className="w-full border-collapse text-xs sm:text-sm">
            <thead>
              <tr>
                {[
                  "Failure Scenario",
                  "Detection",
                  "Mitigation",
                  "Recovery",
                ].map((h) => (
                  <th
                    key={h}
                    className="p-2.5 text-left font-bold bg-[#f1f5f9] dark:bg-[rgba(255,255,255,0.06)] border-b-2 border-[#e2e8f0] dark:border-[rgba(255,255,255,0.15)] whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {failures.map((f, i) => (
                <tr
                  key={i}
                  className="border-b border-[#e2e8f0] dark:border-[rgba(255,255,255,0.08)] last:border-0 hover:bg-[#dce4ff] dark:hover:bg-[rgba(59,91,219,0.12)] even:bg-[#f8fafc] dark:even:bg-[rgba(255,255,255,0.03)] transition-colors"
                >
                  <td className="p-2.5 font-medium">{f.scenario}</td>
                  <td className="p-2.5">{f.detection}</td>
                  <td className="p-2.5">{f.mitigation}</td>
                  <td className="p-2.5">{f.recovery}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* ───────────── 11. Risk Assessment ───────────── */}
      <Section accent="amber" className="animate-fade-up animate-delay-4">
        <SectionTitle icon={TriangleAlert}>11. Risk Assessment</SectionTitle>
        <p className="text-sm mb-4">
          Per blueprint §11. The highest-likelihood risk (timeline overload in
          Phase 2) has a pre-planned mitigation: use iMAD's published numbers
          for easy-question conditions. A new risk (novelty erosion) has emerged
          with the publication of ConsensAgent (ACL Findings 2025) — see below.
        </p>
        <RiskTable rows={risks} />
        <div className="text-xs text-[#64748b] dark:text-[#94a3b8] mt-3 space-y-2">
          <p className="mb-0">
            <strong>Critical risk:</strong> Trust signal doesn't behaviorally
            change output (Challenge C) — mitigated by Month 1 pilot (~20–30 toy
            questions) before full build-out. If pilot fails, the project
            reframes to report the negative result honestly as a finding about
            when evidence-grounded trust does/doesn't influence LLM aggregation
            behavior.
          </p>
          <p className="mb-0">
            <strong>Novelty erosion (NEW):</strong> Published mitigation methods
            (ConsensAgent, ACL Findings 2025) now exist where none were assumed
            at project outset. Differentiation argument must be sharper than
            originally drafted. <strong>Mitigation:</strong> explicit comparison
            table + mechanism-level differentiation (prompt refinement vs.
            evidence-grounded numeric trust) in the related-work section. See §9
            for baseline inclusion strategy.
          </p>
        </div>
      </Section>

      {/* ───────────── 12. Month-by-Month Roadmap ───────────── */}
      <Section className="animate-fade-up animate-delay-5">
        <SectionTitle icon={Calendar}>
          12. Month-by-Month Roadmap (Jul 2026 – Apr 2027)
        </SectionTitle>
        <p className="text-sm mb-4">
          Per blueprint §12. Five phases over 10 months. Gates 0–3 mark explicit
          go/no-go decisions.
          <strong className="block mt-1">Note:</strong> If ConsensAgent is added
          as B10, budget ~1 week in Phase 2 for a lightweight reimplementation
          or use of published numbers where directly comparable (same mitigation
          strategy already planned for iMAD's easy-question conditions).
        </p>
        <GanttTable phases={ganttPhases} />
        <Timeline items={milestones} />
      </Section>

      {/* ───────────── 13. Implementation Order ───────────── */}
      <Section accent="teal" className="animate-fade-up">
        <SectionTitle icon={ClipboardList}>
          13. Implementation Order
        </SectionTitle>
        <p className="text-sm mb-4">
          Per blueprint §13 — exact build sequence with dependency reasoning.
          Never build step N before step N-1.
        </p>
        <div className="space-y-3">
          {[
            {
              step: 1,
              title: "vLLM multi-model serving",
              desc: "Nothing else testable without this. Verify all 3 checkpoints load + generate in 4-bit quant before writing orchestration.",
            },
            {
              step: 2,
              title: "Vanilla MAD reproduction (Du et al. 2023)",
              desc: "Gate 0. Validates base debate loop independent of our additions. Isolates later bugs to our code.",
            },
            {
              step: 3,
              title: "Injection protocol (§5.4 Steps 1–6)",
              desc: "Must exist before trust mechanism — trust calibration only evaluable against a working stress test.",
            },
            {
              step: 4,
              title: "Month-1 behavioral-effectiveness pilot",
              desc: "Highest-risk assumption (Section 0). Tests on ~20–30 toy questions before full mechanism build.",
            },
            {
              step: 5,
              title: "Claim decomposition + source-partitioned retrieval",
              desc: "Trust formula inputs (Vᵢ, Hᵢ) are outputs of retrieval. Build retrieval before trust math.",
            },
            {
              step: 6,
              title: "Trust update function (softmax → clamp → renormalize)",
              desc: "Unit-test operator order in isolation. Verify Tᵢ never leaves [0.1, 0.9] computationally.",
            },
            {
              step: 7,
              title: "Full debate loop (LangGraph state machine)",
              desc: "Only after steps 1–6 each independently validated. Integration bugs easier to isolate.",
            },
            {
              step: 8,
              title: "Baselines B1–B4",
              desc: "Reuses components from steps 1, 5. Establishes comparison floor.",
            },
            {
              step: 9,
              title: "Baselines B5–B6 (Self-Consistency, MoA)",
              desc: "Independent of core mechanism. Can be built in parallel with step 10.",
            },
            {
              step: 10,
              title: "Baseline B9 (iMAD reimplementation)",
              desc: "Highest difficulty (~10 days). Sequenced last — benefits from confidence-scoring-adjacent code from step 1.",
            },
            {
              step: 11,
              title: "Full experiment matrix",
              desc: "Only after every component passes its validation gate.",
            },
            {
              step: 12,
              title: "Human evaluation + failure analysis",
              desc: "Last — requires completed experimental results to annotate against.",
            },
          ].map(({ step, title, desc }) => (
            <div
              key={step}
              className="flex gap-3 items-start bg-[#f0f2f7] dark:bg-[#1a1d35] border border-[#e2e8f0] dark:border-[rgba(255,255,255,0.1)] rounded-md p-3 sm:p-4 hover:border-[#3b5bdb] dark:hover:border-[#3b5bdb] transition-colors"
            >
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#3b5bdb] text-white font-bold text-xs flex-shrink-0 shadow-[0_2px_8px_rgba(59,91,219,.35)]">
                {step}
              </span>
              <div className="min-w-0">
                <div className="font-semibold text-sm">{title}</div>
                <div className="text-xs text-[#64748b] dark:text-[#94a3b8] mt-0.5">
                  {desc}
                </div>
              </div>
            </div>
          ))}
        </div>

        <Callout
          variant="warning"
          title="🚫 What Should Never Be Built Out of Order"
          className="mt-4"
        >
          <ul className="text-sm space-y-1">
            <li>
              Never build trust update <strong>before</strong> retrieval exists
              (step 6 before step 5) — it would have nothing real to operate on.
            </li>
            <li>
              Never build B9 (iMAD) <strong>before</strong> the core system
              (steps 1–7) — B9 reuses debate-loop infrastructure.
            </li>
            <li>
              Never run full experiment matrix (step 11) <strong>before</strong>{" "}
              Month-1 pilot (step 4) confirms the core assumption.
            </li>
          </ul>
        </Callout>
      </Section>

      {/* ───────────── Q1 Justification ───────────── */}
      <Section className="animate-fade-up animate-delay-1">
        <SectionTitle icon={Target}>Q1 Publication Justification</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-[#d3f9d8] dark:bg-[rgba(12,166,120,0.15)] border border-[#0ca678] dark:border-[rgba(12,166,120,0.3)] rounded-md p-4">
            <div className="font-bold text-xs uppercase tracking-wider text-[#0ca678] dark:text-[#6ee7b7] mb-1">
              Novel Mechanism
            </div>
            <p className="text-sm">
              No prior work provides an in-session, evidence-grounded trust
              calibration mechanism for multi-agent debate. CCR/MPR/ECR metrics
              are new.
            </p>
          </div>
          <div className="bg-[#dbe4ff] dark:bg-[rgba(28,126,214,0.15)] border border-[#1c7ed6] dark:border-[rgba(28,126,214,0.3)] rounded-md p-4">
            <div className="font-bold text-xs uppercase tracking-wider text-[#1c7ed6] dark:text-[#93c5fd] mb-1">
              Rigorous Evaluation
            </div>
            <p className="text-sm">
              9-baseline suite, 5 benchmarks, 3 seeds, statistical testing with
              95% CIs and effect sizes (Cohen's d).
            </p>
          </div>
          <div className="bg-[#d3f9d8] dark:bg-[rgba(12,166,120,0.15)] border border-[#0ca678] dark:border-[rgba(12,166,120,0.3)] rounded-md p-4">
            <div className="font-bold text-xs uppercase tracking-wider text-[#0ca678] dark:text-[#6ee7b7] mb-1">
              Open Reproducibility
            </div>
            <p className="text-sm">
              Full protocol released as a benchmark for future sycophancy
              mitigation research. Evaluation harness independently reusable.
            </p>
          </div>
          <div className="bg-[#dbe4ff] dark:bg-[rgba(28,126,214,0.15)] border border-[#1c7ed6] dark:border-[rgba(28,126,214,0.3)] rounded-md p-4">
            <div className="font-bold text-xs uppercase tracking-wider text-[#1c7ed6] dark:text-[#93c5fd] mb-1">
              Timely Topic
            </div>
            <p className="text-sm">
              Inter-agent sycophancy is actively studied in 2025–2026. This
              fills the missing mitigation piece at exactly the right time.
            </p>
          </div>
        </div>
      </Section>

      {/* ───────────── 14. Supervisor Explanation ───────────── */}
      <Section accent="blue" className="animate-fade-up">
        <SectionTitle icon={GraduationCap}>
          14. Supervisor Explanation (5-Minute Pitch)
        </SectionTitle>
        <TwoCol>
          <ColBox>
            <h4 className="text-sm font-bold mb-2">The Problem (1 Sentence)</h4>
            <p className="text-sm leading-relaxed mb-0">
              When AI systems debate each other to reach better answers, a
              confident-but-wrong majority can talk a correct minority into
              changing its answer — even with no new evidence — defeating the
              whole purpose of having them debate.
            </p>
          </ColBox>
          <ColBox>
            <h4 className="text-sm font-bold mb-2">
              The Solution (1 Sentence)
            </h4>
            <p className="text-sm leading-relaxed mb-0">
              We make each AI's vote worth more or less depending on whether its
              claims actually check out against real scientific papers — not
              based on how many other AIs agree with it.
            </p>
          </ColBox>
        </TwoCol>
        <h4 className="text-sm font-bold mt-4 mb-3">
          Internal Workflow (Plain Language)
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-4">
          {[
            {
              step: "1",
              title: "Independent Answers",
              desc: "Three different AI models each independently answer the question.",
            },
            {
              step: "2",
              title: "Fact-Check Claims",
              desc: "Each one's claims get checked against real papers — like a fact-checker.",
            },
            {
              step: "3",
              title: "Adjust Credibility",
              desc: "Whoever's claims hold up gains credibility; whoever gets contradicted loses it.",
            },
            {
              step: "4",
              title: "Revise & Debate",
              desc: "They see each other's answers and revise — aware of their own credibility standing.",
            },
            {
              step: "5",
              title: "Repeat (K=3)",
              desc: "This repeats for a few rounds, building an evidence trail.",
            },
            {
              step: "6",
              title: "Weighted Vote",
              desc: "Final answer decided by credibility-weighted vote, not simple majority.",
            },
          ].map((s) => (
            <div
              key={s.step}
              className="bg-[#f0f2f7] dark:bg-[rgba(255,255,255,0.04)] border border-[#e2e8f0] dark:border-[rgba(255,255,255,0.1)] rounded-md p-3 text-center"
            >
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#3b5bdb] text-white font-bold text-sm mb-2 mx-auto shadow-[0_2px_8px_rgba(59,91,219,.35)]">
                {s.step}
              </span>
              <div className="font-semibold text-xs mb-1">{s.title}</div>
              <p className="text-xs text-[#64748b] dark:text-[#94a3b8] mb-0">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
        <Callout
          variant="warning"
          title="🔬 Why this is different from ConsensAgent"
        >
          There's now a published paper (ConsensAgent, ACL Findings 2025) that
          also tries to fix multi-agent sycophancy — but it works by{" "}
          <strong>rewriting the prompts</strong>, not by scoring claims against
          external evidence. We are the{" "}
          <strong>evidence-fact-checking approach</strong>; they are the
          <strong>prompt-tuning approach</strong>. Both aim to reduce
          sycophancy; the mechanism difference (external retrieval vs. textual
          refinement) is the key distinction.
        </Callout>
        <Callout variant="info" title="📖 Worked Example">
          Given one 2023 clinical trial paper and asked "Does Drug X lower blood
          pressure in adults over 60?" — three reviewers give different answers.
          The system checks each claim against the actual paper. The paper shows
          a modest effect in patients with a specific condition — matching
          Reviewer C. Their credibility goes up; A and B's go down.{" "}
          <strong>Output:</strong> "Yes, but only in [that subgroup]" with
          citation.
        </Callout>
      </Section>

      {/* ───────────── 15. Team Explanation ───────────── */}
      <Section className="animate-fade-up animate-delay-1">
        <SectionTitle icon={Users}>
          15. Team Explanation (Beginner-Friendly)
        </SectionTitle>
        <p className="text-sm mb-4">
          <strong>Simple overview:</strong> Think of three friends trying to
          answer a hard trivia question. Normally, if two friends agree and one
          disagrees, you'd go with the two. Our system instead weights each
          friend's opinion by how well they can back it up with real sources —
          so the one friend with solid evidence can outvote the other two if
          they're just guessing confidently.
        </p>
        <TwoCol>
          <ColBox>
            <h4 className="text-sm font-bold mb-2">🎯 How It Works</h4>
            <ol className="text-sm space-y-1 mb-0 pl-4">
              <li>Ask three different AI models the question</li>
              <li>Each gives an answer with reasoning</li>
              <li>We break their reasoning into individual claims</li>
              <li>We look up real research papers to check each claim</li>
              <li>
                Claims that check out earn trust points; contradicted claims
                lose them
              </li>
              <li>The AIs see each other's answers and may revise</li>
              <li>Repeat steps 3–6 a few times</li>
              <li>Final answer is based on trust points, not just agreement</li>
            </ol>
          </ColBox>
          <ColBox>
            <h4 className="text-sm font-bold mb-2">📖 Glossary</h4>
            <div className="space-y-2 text-sm">
              {[
                [
                  "LLM",
                  "The AI model doing the reasoning (e.g., Qwen, Mistral)",
                ],
                [
                  "Multi-Agent Debate",
                  "Multiple AI models discussing a question together",
                ],
                [
                  "Sycophancy",
                  "An AI changing its answer to agree with others without good reason",
                ],
                [
                  "RAG",
                  "Looking up real documents to check an answer instead of relying on AI memory",
                ],
                [
                  "Trust Score",
                  "Our system's running credibility scorecard for each AI, updated each round",
                ],
                [
                  "Baseline",
                  "An existing method we compare against to prove ours is better",
                ],
                [
                  "Ablation",
                  "Removing one piece of the system to measure how much it matters",
                ],
              ].map(([term, def]) => (
                <div key={term} className="flex gap-2">
                  <span className="font-semibold text-[#3b5bdb] dark:text-[#93c5fd] whitespace-nowrap">
                    {term}:
                  </span>
                  <span className="text-[#64748b] dark:text-[#94a3b8]">
                    {def}
                  </span>
                </div>
              ))}
            </div>
          </ColBox>
        </TwoCol>
        <Callout variant="info" title="🤔 How we differ from ConsensAgent">
          Another team also published a sycophancy fix (ConsensAgent, ACL 2025).
          Their approach: <strong>rewrite the prompts</strong> to reduce
          sycophancy. Ours:{" "}
          <strong>score each claim against real papers</strong>
          and weight votes by evidence. Both reduce sycophancy; the mechanism is
          completely different.
        </Callout>
        <Callout variant="success" title="🧠 Analogy: Courtroom">
          Majority-vote debate is like a jury that goes with whichever two
          jurors talk the loudest. Our system is more like a judge who actually
          checks the evidence each juror cites — and rules based on whose
          evidence holds up, not who's more persuasive or more numerous.
        </Callout>
      </Section>

      {/* ───────────── 16. Expected Research Outcome ───────────── */}
      <Section accent="teal" className="animate-fade-up animate-delay-2">
        <SectionTitle icon={Trophy}>16. Expected Research Outcome</SectionTitle>
        <TwoCol>
          <ColBox>
            <h4 className="text-sm font-bold mb-2">Expected Improvements</h4>
            <ul className="text-sm space-y-1 mb-0 pl-4">
              <li>
                <strong>20–30% CCR reduction</strong> vs. standard MAD on
                adversarial benchmarks
              </li>
              <li>
                <strong>
                  Statistically significant improvement over ConsensAgent
                </strong>{" "}
                (closest published mitigation) on adversarial injection
                benchmarks
              </li>
              <li>
                <strong>ECR &gt; 0.80</strong> on HLE — trust scores track
                actual correctness
              </li>
              <li>
                <strong>No accuracy regression</strong> on GPQA/MMLU-Pro —
                anti-sycophancy gains don't cost baseline correctness
              </li>
            </ul>
          </ColBox>
          <ColBox>
            <h4 className="text-sm font-bold mb-2">Publication Potential</h4>
            <p className="text-sm mb-0">
              The field has moved faster than anticipated — ACL Findings 2025
              already has a published mitigation (ConsensAgent). This raises the
              bar but sharpens our contribution: we are the <em>only</em>
              evidence-grounded, numeric, adversarially-tested approach.
              Realistic: <strong>EMNLP Findings / TMLR</strong>. Stretch:{" "}
              <strong>ACL/NeurIPS Main</strong> with significant gains over
              ConsensAgent
              <em>and</em> MoA/iMAD. Safe floor: workshop submission.
            </p>
          </ColBox>
        </TwoCol>
        <h4 className="text-sm font-bold mt-5 mb-3">
          Success Criteria (Concrete &amp; Falsifiable)
        </h4>
        <div className="space-y-2">
          {[
            {
              icon: "📊",
              label:
                "Statistically significant CCR reduction over iMAD, MoA, and ConsensAgent on adversarial benchmarks, with 95% CIs not overlapping zero.",
            },
            {
              icon: "📐",
              label:
                "ECR > 0.80 achieved on at least the primary evaluation dataset.",
            },
            {
              icon: "🧪",
              label:
                "Month-1 pilot confirms trust weight causally affects aggregation output (necessary condition — reframes negative result if it fails).",
            },
            {
              icon: "📝",
              label:
                "Completed FYDP thesis + submitted paper (minimum workshop, target Findings-tier), fully reproducible codebase released.",
            },
          ].map((c) => (
            <div
              key={c.label}
              className="flex gap-3 items-start bg-[#f0f2f7] dark:bg-[rgba(255,255,255,0.04)] border border-[#e2e8f0] dark:border-[rgba(255,255,255,0.1)] rounded-md p-3"
            >
              <span className="text-lg flex-shrink-0">{c.icon}</span>
              <p className="text-sm mb-0">{c.label}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ───────────── 17. Future Extensions ───────────── */}
      <Section className="animate-fade-up animate-delay-3">
        <SectionTitle icon={Telescope}>17. Future Extensions</SectionTitle>
        <TwoCol>
          <ColBox>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[#3b5bdb] dark:text-[#93c5fd]">🎓</span>
              <h4 className="text-sm font-bold mb-0">MSc/PhD Research</h4>
            </div>
            <p className="text-sm leading-relaxed mb-0">
              The trust mechanism's convergence properties for N &gt; 3 agents
              are flagged as future work. A PhD-scope extension could pursue
              formal convergence theorems rather than our bounded
              design-property propositions.
            </p>
          </ColBox>
          <ColBox>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[#3b5bdb] dark:text-[#93c5fd]">🌐</span>
              <h4 className="text-sm font-bold mb-0">Open-Source Framework</h4>
            </div>
            <p className="text-sm leading-relaxed mb-0">
              The CCR/MPR/ECR evaluation harness is independently valuable as a
              released tool — other researchers testing their own
              anti-sycophancy methods could adopt it as a standard benchmark.
            </p>
          </ColBox>
          <ColBox>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[#3b5bdb] dark:text-[#93c5fd]">⚖️</span>
              <h4 className="text-sm font-bold mb-0">
                Cross-Domain Generalization
              </h4>
            </div>
            <p className="text-sm leading-relaxed mb-0">
              Source-partitioned retrieval + trust-calibration generalizes
              beyond scientific QA to legal reasoning against case law, medical
              reasoning against clinical literature, and other domains with
              retrievable ground-truth-adjacent evidence.
            </p>
          </ColBox>
          <ColBox>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[#3b5bdb] dark:text-[#93c5fd]">🧠</span>
              <h4 className="text-sm font-bold mb-0">
                Cross-Session Trust Memory
              </h4>
            </div>
            <p className="text-sm leading-relaxed mb-0">
              Long-term trust memory across sessions, multimodal evidence
              grounding, and domain-specific calibration — named in the original
              proposal's future-directions FAQ as canonical extensions.
            </p>
          </ColBox>
        </TwoCol>
      </Section>

      {/* ───────────── 18. Final Critical Review ───────────── */}
      <Section accent="rose" className="animate-fade-up animate-delay-4">
        <SectionTitle icon={Search}>
          18. Final Critical Review (Reviewer #2 Mode)
        </SectionTitle>
        <Callout variant="gap" title="⚠ Challenging Every Assumption">
          <p className="mb-2">
            <strong>
              "Your trust formula has two free hyperparameters (α, β) — how do I
              know you didn't just tune them until the result looked good?"
            </strong>{" "}
            Mitigated by hyperparameter sensitivity analysis (grid search, CCR
            varies &lt;4% across configs). This section must be prominent in the
            paper, not buried in an appendix.
          </p>
          <p className="mb-2">
            <strong>
              "Propositions 2–3 aren't real theorems — why call them
              Propositions at all?"
            </strong>{" "}
            Already correctly reframed as "design properties, not global
            convergence theorems." Expect at least one reviewer to push on this
            framing.
          </p>
          <p className="mb-0">
            <strong>
              "Is 20–30% CCR reduction actually a big number, or is it modest
              window-dressing?"
            </strong>{" "}
            Needs contextualization against the baseline collapse rate (~45%) so
            readers understand the relative magnitude.
          </p>
        </Callout>
        <h4 className="text-sm font-bold mt-4 mb-3">
          🧪 Missing Experiments a Sharp Reviewer Would Demand
        </h4>
        <div className="space-y-2 mb-4">
          {[
            {
              icon: "⏱️",
              q: "Latency/Cost-Benefit Analysis",
              a: "System runs ~9 forward passes vs. 1 for single-agent. Add a compute-cost-vs-CCR-reduction table as a supplementary result.",
            },
            {
              icon: "🔄",
              q: "Paraphrase Robustness",
              a: "Currently named as a known protocol limitation (L2) but not tested. A small (20–30 question) check would strengthen the paper.",
            },
            {
              icon: "🔢",
              q: "K-Sensitivity (Debate Rounds)",
              a: "N-scaling is planned, but K is fixed at 3 throughout. Reviewer may ask if results are an artifact of this specific round count.",
            },
          ].map((e) => (
            <div
              key={e.q}
              className="flex gap-3 items-start bg-[#f0f2f7] dark:bg-[rgba(255,255,255,0.04)] border border-[#e2e8f0] dark:border-[rgba(255,255,255,0.1)] rounded-md p-3"
            >
              <span className="text-base flex-shrink-0">{e.icon}</span>
              <div>
                <span className="font-semibold text-sm">{e.q}:</span>
                <span className="text-sm text-[#64748b] dark:text-[#94a3b8]">
                  {" "}
                  {e.a}
                </span>
              </div>
            </div>
          ))}
        </div>
        <Callout variant="warning" title="📖 Pre-Phase 0 Reading Required">
          Before the Phase 0 literature freeze, schedule one dedicated
          reading/discussion session on <strong>ConsensAgent</strong> (Pitre et
          al., ACL Findings 2025) and <strong>Estornell &amp; Liu</strong>{" "}
          (NeurIPS 2024 Main Track). Both are now load-bearing, not optional
          background — ConsensAgent is our closest published competitor, and
          Estornell &amp; Liu provides the formal theoretical context for our
          Propositions 1–3. This session must happen before the Phase 0 freeze
          closes.
        </Callout>
        <Callout
          variant="warning"
          title="🗣️ Reviewer Criticisms (Ranked by Severity)"
        >
          <ol className="text-sm space-y-1 mb-0 pl-4">
            <li>
              <strong>
                "How is this different from ConsensAgent's prompt-refinement
                mitigation?"
              </strong>{" "}
              — ConsensAgent uses static/dynamic prompt refinement (textual
              intervention); ours uses a numeric, formally bounded trust score
              grounded in <em>external</em> retrieved evidence, not prompt-level
              adjustment. We are tested against adversarial injected pressure;
              they target naturally occurring sycophancy. Differentiation must
              be explicit in §3 related-work table.
            </li>
            <li>
              <strong>
                "How is this different from iMAD's confidence-weighted
                aggregation?"
              </strong>{" "}
              — External evidence vs. same-context confidence signal: stated in
              the first paragraph of the results section.
            </li>
            <li>
              <strong>
                "Your injection protocol is artificially explicit — real
                sycophancy is subtler."
              </strong>{" "}
              — Honest upper-bound scenario, stated early and confidently.
            </li>
            <li>
              <strong>"Two core citations aren't peer-reviewed."</strong> —
              Addressed via proactive disclosure; same framing in related-work
              section.
            </li>
          </ol>
        </Callout>
      </Section>
    </>
  );
}
