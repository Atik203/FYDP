import {
  ACCENT,
  AMBER,
  Bullet,
  Card,
  DEEP_INK,
  Figure,
  ROSE,
  SlideHeader,
  SlideTable,
  Stat,
  TEAL,
} from "@/components/shared/slideKit";
import {
  CeDefinitionsSlide,
  CeMatrixSlide,
  CeOverviewSlide,
  GroupSlide,
  ThankYouSlide,
} from "@/pages/SlidePage";
import type { ReactNode } from "react";
import {
  AlertTriangle,
  BarChart3,
  BookOpen,
  Boxes,
  ClipboardCheck,
  Code,
  FlaskConical,
  Globe,
  Layers,
  Network,
  Scale,
  Search,
  Target,
  TrendingUp,
} from "lucide-react";

/* ────────────────────────────────────────────────────────────────
   Final defence deck — route /slide/final
   Follows Final_Slide_Guideline.md. No group names anywhere.
   ──────────────────────────────────────────────────────────────── */

/* Accent note strip — shared footer band for final slides. */
function NoteStrip({
  children,
  color = ACCENT,
}: {
  children: ReactNode;
  color?: string;
}) {
  return (
    <div
      className="relative mt-[1.6cqh] rounded-xl overflow-hidden px-[2.6cqw] py-[1.3cqh] text-[2.05cqh] font-bold"
      style={{
        background: `linear-gradient(90deg, ${color}14, #f8fafc 65%)`,
        color: DEEP_INK,
        border: `1.5px solid ${color}33`,
      }}
    >
      <div
        className="absolute left-0 top-0 bottom-0 w-[0.5cqw]"
        style={{ background: `linear-gradient(180deg, ${color}, ${color}66)` }}
      />
      {children}
    </div>
  );
}

/* ── Slide 1: Title (same as /slide; group number hidden) ───────── */
function FinalTitleSlide() {
  return <GroupSlide showGroupNo={false} />;
}

/* ── Slide 2: Introduction ──────────────────────────────────────── */
function FinalIntroSlide() {
  return (
    <div className="w-full h-full flex flex-col px-[4cqw] py-[3cqh]">
      <SlideHeader
        badge="Introduction"
        badgeBg="#e0e7ff"
        badgeColor={ACCENT}
        title="Debate Helps, but the Final Vote Is Weak"
        subtitle="Multi-agent debate improves reasoning. Majority voting is where the failure enters."
      />
      <div className="flex gap-[2cqw] flex-1 min-h-0">
        <Card
          icon={<BookOpen size="2.4cqh" color="#fff" />}
          title="Key Points"
          color={ACCENT}
          className="w-[40%] flex-shrink-0"
        >
          <ul className="flex flex-col justify-center h-full">
            <Bullet>
              Large language models answer hard science questions, but they can
              be confidently wrong.
            </Bullet>
            <Bullet>
              In multi-agent debate, three models solve the same question and
              compare their reasoning over rounds.
            </Bullet>
            <Bullet>
              Most systems then decide by majority vote, where every agent
              counts the same.
            </Bullet>
            <Bullet>
              A confident wrong majority can talk a correct minority out of its
              answer. This is sycophantic consensus.
            </Bullet>
            <Bullet>
              No current debate system checks claims against outside evidence
              while the debate runs.
            </Bullet>
          </ul>
        </Card>
        <Figure
          src="/figures/fig-claim-example.png"
          alt="A single claim checked against a retrieved passage"
          caption="One agent claim checked against retrieved scientific evidence."
          className="flex-1 min-h-0"
        />
      </div>
    </div>
  );
}

/* ── Slide 3: Motivation ────────────────────────────────────────── */
function FinalMotivationSlide() {
  return (
    <div className="w-full h-full flex flex-col px-[4cqw] py-[3cqh]">
      <SlideHeader
        badge="Motivation"
        badgeBg="#fee2e2"
        badgeColor={ROSE}
        title="Consensus Is Not Correctness"
        subtitle="Four verified findings define the problem."
      />
      <div className="grid grid-cols-4 gap-[1.6cqw]">
        <Stat value=">20%" label="of wrong answers ignore a correct peer" color={ROSE} />
        <Stat value="41–86.7%" label="failure rate across seven MAS frameworks" color={AMBER} />
        <Stat value="+10%" label="gain from a truth-aware oracle over proxy signals" color={TEAL} />
        <Stat value="≈1/4" label="of disagreements hide a correct minority" color={ACCENT} />
      </div>
      <div className="grid grid-cols-3 gap-[1.8cqw] mt-[3.4cqh] auto-rows-[40cqh] my-auto">
        <Card
          icon={<AlertTriangle size="2.4cqh" color="#fff" />}
          title="Ignored Evidence"
          color={ROSE}
        >
          <ul className="flex flex-col justify-center h-full">
            <Bullet>
              ConsensAgent (ACL 2025): the correct answer was present but
              ignored in over 20 percent of wrong-answer cases.
            </Bullet>
            <Bullet>
              Agents copy and swap answers; the pressure is social, not
              evidential.
            </Bullet>
          </ul>
        </Card>
        <Card
          icon={<BarChart3 size="2.4cqh" color="#fff" />}
          title="Recurring Failures"
          color={AMBER}
        >
          <ul className="flex flex-col justify-center h-full">
            <Bullet>
              MAST (NeurIPS 2025): 41 to 86.7 percent failure across seven
              multi-agent frameworks.
            </Bullet>
            <Bullet>
              The failures repeat across models and tasks, so they come from
              the design.
            </Bullet>
          </ul>
        </Card>
        <Card
          icon={<TrendingUp size="2.4cqh" color="#fff" />}
          title="Weak Trust Signal"
          color={TEAL}
        >
          <ul className="flex flex-col justify-center h-full">
            <Bullet>
              DebUnc (EMNLP 2025): a truth-aware oracle beats deployable
              confidence metrics by up to +10 percent.
            </Bullet>
            <Bullet>Self-reported confidence cannot carry the decision.</Bullet>
          </ul>
        </Card>
      </div>
      <NoteStrip color={ACCENT}>
        Theory agrees: without an outside correction, agents converge on the
        wrong majority (Estornell and Liu, NeurIPS 2024).
      </NoteStrip>
    </div>
  );
}

/* ── Slide 4: Objective ─────────────────────────────────────────── */
function FinalObjectiveSlide() {
  return (
    <div className="w-full h-full flex flex-col px-[4cqw] py-[3cqh]">
      <SlideHeader
        badge="Objective"
        badgeBg="#e0e7ff"
        badgeColor={ACCENT}
        title="What the Project Sets Out to Build"
        subtitle="Four objectives guide the project."
      />
      <div className="grid grid-cols-2 grid-rows-2 gap-[1.8cqh_2cqw] flex-1 min-h-0">
        <Card
          icon={<Target size="2.4cqh" color="#fff" />}
          title="O1 · Trust Mechanism"
          color={ACCENT}
        >
          <ul className="flex flex-col justify-center h-full">
            <Bullet>
              Design a bounded trust update that re-weights each agent from
              retrieved evidence.
            </Bullet>
            <Bullet>No fine-tuning; models run as served inference.</Bullet>
          </ul>
        </Card>
        <Card
          icon={<FlaskConical size="2.4cqh" color="#fff" />}
          title="O2 · Injection Protocol"
          color={AMBER}
        >
          <ul className="flex flex-col justify-center h-full">
            <Bullet>
              Build a reproducible protocol that measures collapse under
              controlled pressure.
            </Bullet>
            <Bullet>
              Validate annotations before any pilot run (κ ≥ 0.75).
            </Bullet>
          </ul>
        </Card>
        <Card
          icon={<BarChart3 size="2.4cqh" color="#fff" />}
          title="O3 · Baselines"
          color={TEAL}
        >
          <ul className="flex flex-col justify-center h-full">
            <Bullet>
              Compare against majority vote, MoA, iMAD and ConsensAgent.
            </Bullet>
            <Bullet>
              Four metrics: accuracy, CCR, MPR and ECR.
            </Bullet>
          </ul>
        </Card>
        <Card
          icon={<TrendingUp size="2.4cqh" color="#fff" />}
          title="O4 · Behavioral Proof"
          color={ROSE}
        >
          <ul className="flex flex-col justify-center h-full">
            <Bullet>
              Confirm the trust signal changes decisions, not just context.
            </Bullet>
            <Bullet>Run the check early, before the full build.</Bullet>
          </ul>
        </Card>
      </div>
    </div>
  );
}

/* ── Slide 5: Dataset ───────────────────────────────────────────── */
function FinalDatasetSlide() {
  return (
    <div className="w-full h-full flex flex-col px-[4cqw] py-[3cqh]">
      <SlideHeader
        badge="Dataset"
        badgeBg="#ccfbf1"
        badgeColor={TEAL}
        title="Five Scientific Question Sets"
        subtitle="Stable sets measure accuracy; adversarial sets measure collapse; one expert set measures the ceiling."
      />
      <SlideTable
        head={["Dataset", "Role", "Size", "License"]}
        colWidths={["16%", "22%", "38%", "24%"]}
        accent={TEAL}
        rows={[
          ["GPQA", "Stable comparison", "448 questions · Diamond subset 198", "CC BY 4.0"],
          ["MMLU-Pro", "Stable comparison", "12,032 questions · 14 disciplines", "MIT"],
          ["HLE", "Expert ceiling", "2,500+ expert-written questions", "MIT · gated access"],
          ["BrokenMath", "Adversarial stress", "504 samples · 183 final-answer", "CC BY-NC-SA 4.0"],
          ["BrokenArXiv", "Adversarial, monthly", "new problem sets each month", "CC BY-SA 4.0"],
        ]}
      />
      <div className="grid grid-cols-3 gap-[1.8cqw] mt-[2cqh] flex-1 min-h-0">
        <Card
          icon={<Search size="2.4cqh" color="#fff" />}
          title="Divergent Filter"
          color={ACCENT}
        >
          <ul className="flex flex-col justify-center h-full">
            <Bullet>
              Only questions where the three agents disagree survive the first
              filter.
            </Bullet>
            <Bullet>About 60 to 70 percent of each original set passes.</Bullet>
          </ul>
        </Card>
        <Card
          icon={<ClipboardCheck size="2.4cqh" color="#fff" />}
          title="Answer-Type Filter"
          color={AMBER}
        >
          <ul className="flex flex-col justify-center h-full">
            <Bullet>
              Only multiple-choice and numeric answers stay; free text is
              excluded.
            </Bullet>
            <Bullet>
              Every surviving question can be checked against a gold answer.
            </Bullet>
          </ul>
        </Card>
        <Card
          icon={<Target size="2.4cqh" color="#fff" />}
          title="How They Are Used"
          color={TEAL}
        >
          <ul className="flex flex-col justify-center h-full">
            <Bullet>
              The main matrix draws 1,000 questions per dataset; the pilot
              draws 50.
            </Bullet>
            <Bullet>
              Gold answers are used for selection and scoring only; agents
              never see them.
            </Bullet>
          </ul>
        </Card>
      </div>
      <NoteStrip color={TEAL}>
        GPQA and HLE need a click-through access agreement; BrokenArXiv rotates
        monthly, so every result cites its snapshot.
      </NoteStrip>
    </div>
  );
}

/* ── Slide 6: Conventional Method & Baselines ───────────────────── */
function FinalConventionalSlide() {
  const baselines = [
    ["B1", "Single-agent CoT"],
    ["B2", "CoT + retrieval"],
    ["B3", "Vanilla debate"],
    ["B4", "Debate + retrieval"],
    ["B5", "Self-consistency"],
    ["B6", "Mixture-of-Agents"],
    ["B7", "Oracle model"],
    ["B8", "Trust-calibrated (ours)"],
    ["B9", "iMAD"],
    ["B10", "ConsensAgent"],
  ];
  return (
    <div className="w-full h-full flex flex-col px-[4cqw] py-[3cqh]">
      <SlideHeader
        badge="Conventional Method · Baselines"
        badgeBg="#e0e7ff"
        badgeColor={ACCENT}
        title="How Debate Decides Today"
        subtitle="Every existing method decides by a vote or an internal score. None verifies claims against outside evidence in the loop."
      />
      <div className="grid grid-cols-2 gap-[2cqw] flex-1 min-h-0">
        <Card
          icon={<BookOpen size="2.4cqh" color="#fff" />}
          title="Conventional Methods"
          color={ACCENT}
        >
          <ul className="flex flex-col justify-center h-full">
            <Bullet>Majority voting gives every agent equal weight.</Bullet>
            <Bullet>Confidence weighting uses self-reported signals.</Bullet>
            <Bullet>Prompt rewriting targets sycophancy before the debate.</Bullet>
            <Bullet>Static aggregation merges outputs once.</Bullet>
            <Bullet>Debate prediction decides when to debate at all.</Bullet>
          </ul>
        </Card>
        <Card
          icon={<Layers size="2.4cqh" color="#fff" />}
          title="Evaluation Baselines"
          color={TEAL}
        >
          <div className="h-full flex items-center">
            <div className="grid grid-cols-2 w-full gap-[0.9cqh_0.8cqw]">
              {baselines.map(([code, name]) => (
                <div
                  key={code}
                  className="flex items-center gap-[0.6cqw] rounded-md border px-[0.7cqw] py-[0.7cqh]"
                  style={{
                    borderColor: code === "B8" ? ACCENT : "#cbd5e1",
                    background: code === "B8" ? "#eef2ff" : "#ffffff",
                  }}
                >
                  <span
                    className="text-[1.9cqh] font-extrabold"
                    style={{ color: code === "B8" ? ACCENT : TEAL }}
                  >
                    {code}
                  </span>
                  <span
                    className="text-[1.75cqh] font-semibold leading-snug"
                    style={{ color: DEEP_INK }}
                  >
                    {name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
      <NoteStrip color={ACCENT}>
        Gap: no existing method ties an agent's influence to external evidence
        while the debate runs.
      </NoteStrip>
    </div>
  );
}

/* ── Slide 7: Proposed Method ───────────────────────────────────── */
function FinalMethodSlide() {
  return (
    <div className="w-full h-full flex flex-col px-[4cqw] py-[3cqh]">
      <SlideHeader
        badge="Proposed Method"
        badgeBg="#ccfbf1"
        badgeColor={TEAL}
        title="Evidence-Grounded Trust, Updated In-Debate"
        subtitle="Claims are checked against retrieved literature each round, and the result sets each agent's influence."
      />
      <div className="flex gap-[2cqw] flex-1 min-h-0">
        <Card
          icon={<FlaskConical size="2.4cqh" color="#fff" />}
          title="Working Principles"
          color={TEAL}
          className="w-[40%] flex-shrink-0"
        >
          <ul className="flex flex-col justify-center h-full">
            <Bullet>
              Confidence gate: easy questions are answered directly; hard ones
              start a debate.
            </Bullet>
            <Bullet>
              Three heterogeneous agents: Qwen, Gemma and Mistral. No
              fine-tuning.
            </Bullet>
            <Bullet>
              Each answer is split into atomic claims, then checked per source:
              PubMed, arXiv, Semantic Scholar (OpenAlex fallback).
            </Bullet>
            <Bullet>
              Every claim gets one verdict: supported, contradicted,
              unverifiable or contested.
            </Bullet>
            <Bullet>
              Trust update each round: S(t+1) = S(t) + αV − βH, then softmax →
              clamp [0.1, 0.9] → renormalize.
            </Bullet>
            <Bullet>
              Final answer by trust-weighted aggregation, not a head count.
            </Bullet>
          </ul>
        </Card>
        <Figure
          src="/figures/fig-pipeline.png"
          alt="End-to-end pipeline of the framework"
          caption="Gate → debate → claims → evidence → trust → aggregation."
          className="flex-1 min-h-0"
        />
      </div>
    </div>
  );
}

/* ── Debate Protocol ────────────────────────────────────────────── */
function FinalProtocolSlide() {
  return (
    <div className="w-full h-full flex flex-col px-[4cqw] py-[3cqh]">
      <SlideHeader
        badge="Debate Protocol"
        badgeBg="#e0e7ff"
        badgeColor={ACCENT}
        title="One Round, Six Steps, One Injection Point"
        subtitle="Each round follows the same order; only the stress test adds pressure."
      />
      <div className="flex gap-[2cqw] flex-1 min-h-0">
        <Card
          icon={<Layers size="2.4cqh" color="#fff" />}
          title="Round Order"
          color={ACCENT}
          className="w-[40%] flex-shrink-0"
        >
          <ul className="flex flex-col justify-center h-full">
            <Bullet>Positions, then claim decomposition.</Bullet>
            <Bullet>Source-partitioned retrieval, then claim verdicts.</Bullet>
            <Bullet>Trust update, then revision from peers and own trust.</Bullet>
            <Bullet>The loop runs three rounds at most.</Bullet>
            <Bullet>
              Injection sits between round 1 and round 2, and only in stress
              tests.
            </Bullet>
            <Bullet>
              A timeout makes one agent's round inconclusive; the debate
              continues.
            </Bullet>
          </ul>
        </Card>
        <Figure
          src="/figures/fig-round-loop.png"
          alt="One debate round as a loop with the injection point"
          caption="One debate round; the dashed box is the injection point used in stress tests."
          className="flex-1 min-h-0"
        />
      </div>
    </div>
  );
}

/* ── Trust Update in Detail ─────────────────────────────────────── */
function FinalTrustSlide() {
  return (
    <div className="w-full h-full flex flex-col px-[4cqw] py-[3cqh]">
      <SlideHeader
        badge="Trust Update"
        badgeBg="#ccfbf1"
        badgeColor={TEAL}
        title="From Verdicts to Bounded Weights"
        subtitle="The evidence verdicts become each agent's influence in five steps."
      />
      <div className="flex gap-[2cqw] flex-1 min-h-0">
        <Card
          icon={<Scale size="2.4cqh" color="#fff" />}
          title="Trust Math"
          color={TEAL}
          className="w-[40%] flex-shrink-0"
        >
          <ul className="flex flex-col justify-center h-full">
            <Bullet>
              Supported claims raise the raw score (αV); contradicted claims
              lower it (βH).
            </Bullet>
            <Bullet>
              Softmax, then clamp to [0.1, 0.9], then renormalize — in that
              order.
            </Bullet>
            <Bullet>No agent is ever silenced, and no agent can dominate.</Bullet>
            <Bullet>The weights decide the final answer, not a head count.</Bullet>
            <Bullet>
              Evidence-calibration rate checks that the weights track
              correctness.
            </Bullet>
          </ul>
        </Card>
        <Figure
          src="/figures/fig-trust-detail.png"
          alt="The five steps of the trust update"
          caption="Verdict counts to bounded weights, step by step."
          className="flex-1 min-h-0"
        />
      </div>
    </div>
  );
}

/* ── Slide 8: Flow Diagram (DataFlow) ───────────────────────────── */
function FinalDataFlowSlide() {
  return (
    <div className="w-full h-full flex flex-col px-[3cqw] py-[3cqh]">
      <SlideHeader
        badge="Flow Diagram"
        badgeBg="#ccfbf1"
        badgeColor={TEAL}
        title="The Framework from Start to End"
        subtitle="Level-1 data flow: seven processes P1–P7, four external entities, three data stores D1–D3."
      />
      <Figure
        src="/figures/fig-dataflow.png"
        alt="Level-1 data flow diagram of the framework"
        caption="Questions enter at the gate; claims and passages flow through verification; the trust update feeds aggregation; the result package carries the answer, citations and the trust trajectory."
        className="flex-1 min-h-0"
      />
    </div>
  );
}

/* ── Slide 9: Experimental Setup ────────────────────────────────── */
function FinalSetupSlide() {
  const debate = [
    "K = 3 rounds",
    "temperature 0.7",
    "1,024 output tokens",
    "three seeds",
  ];
  const stress = [
    "injection between rounds 1 and 2",
    "annotation κ ≥ 0.75",
    "paired bootstrap 95% CI",
    "Cohen's d",
  ];
  return (
    <div className="w-full h-full flex flex-col px-[4cqw] py-[3cqh]">
      <SlideHeader
        badge="Experimental Setup"
        badgeBg="#e0e7ff"
        badgeColor={ACCENT}
        title="How the Experiments Run"
        subtitle="Two model stacks, one code path: the swap is a config change."
      />
      <div className="grid grid-cols-3 gap-[1.8cqw]">
        <Card
          icon={<Boxes size="2.4cqh" color="#fff" />}
          title="Dev Stack"
          color={ACCENT}
        >
          <ul className="flex flex-col justify-center h-full">
            <Bullet>Qwen3.5-9B · Gemma 4 12B · Ministral-3-14B, 4-bit.</Bullet>
            <Bullet>One RTX A6000 48 GB.</Bullet>
          </ul>
        </Card>
        <Card
          icon={<Layers size="2.4cqh" color="#fff" />}
          title="Final Stack"
          color={TEAL}
        >
          <ul className="flex flex-col justify-center h-full">
            <Bullet>
              Qwen3.6-27B · Gemma 4 26B A4B · Mistral-Small-3.2-24B, FP8.
            </Bullet>
            <Bullet>One RTX PRO 6000 Blackwell 96 GB.</Bullet>
          </ul>
        </Card>
        <Card
          icon={<Network size="2.4cqh" color="#fff" />}
          title="Serving"
          color={AMBER}
        >
          <ul className="flex flex-col justify-center h-full">
            <Bullet>vLLM behind an OpenAI-compatible API.</Bullet>
            <Bullet>One server per agent; no model is fine-tuned.</Bullet>
          </ul>
        </Card>
      </div>
      <div className="grid grid-cols-2 gap-[1.8cqw] mt-[1.8cqh] flex-1 min-h-0">
        <Card
          icon={<Code size="2.4cqh" color="#fff" />}
          title="Debate Configuration"
          color={ACCENT}
        >
          <div className="h-full flex items-center">
            <div className="grid grid-cols-2 w-full gap-[0.9cqh_0.8cqw]">
              {debate.map((d) => (
                <div
                  key={d}
                  className="rounded-xl border px-[0.9cqw] py-[1.2cqh] text-center text-[2.3cqh] font-bold"
                  style={{
                    borderColor: "#dbe3ee",
                    background: "#f8fafc",
                    color: DEEP_INK,
                  }}
                >
                  {d}
                </div>
              ))}
            </div>
          </div>
        </Card>
        <Card
          icon={<FlaskConical size="2.4cqh" color="#fff" />}
          title="Stress Test & Validation"
          color={AMBER}
        >
          <div className="h-full flex items-center">
            <div className="grid grid-cols-2 w-full gap-[0.9cqh_0.8cqw]">
              {stress.map((d) => (
                <div
                  key={d}
                  className="rounded-xl border px-[0.9cqw] py-[1.2cqh] text-center text-[2.3cqh] font-bold"
                  style={{
                    borderColor: "#f3e2c4",
                    background: "#fffdf7",
                    color: DEEP_INK,
                  }}
                >
                  {d}
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
      <NoteStrip color={ACCENT}>
        Compute: about 300 GPU-hours · budget USD 340–820. Evaluation sets keep
        only questions with divergent first answers.
      </NoteStrip>
    </div>
  );
}

/* ── Slide 10: Results (expected + pilot) ───────────────────────── */
function FinalResultsSlide() {
  return (
    <div className="w-full h-full flex flex-col px-[4cqw] py-[3cqh]">
      <SlideHeader
        badge="Results"
        badgeBg="#ccfbf1"
        badgeColor={TEAL}
        title="Project Results"
        subtitle="Expected outcomes and the results already measured."
      />
      <div className="grid grid-cols-2 gap-[2cqw] flex-1 min-h-0">
        <Card
          icon={<TrendingUp size="2.4cqh" color="#fff" />}
          title="Expected Results"
          color={ACCENT}
        >
          <ul className="flex flex-col justify-center h-full">
            <Bullet>CCR: 20 to 30 percent lower than standard debate.</Bullet>
            <Bullet>A correct minority survives more often (MPR up).</Bullet>
            <Bullet>Evidence calibration above 0.80 on the expert set.</Bullet>
            <Bullet>No accuracy regression on the stable sets.</Bullet>
          </ul>
        </Card>
        <Card
          icon={<ClipboardCheck size="2.4cqh" color="#fff" />}
          title="Completed Experiments"
          color={TEAL}
        >
          <ul className="flex flex-col justify-center h-full">
            <Bullet>10 GPQA questions, three rounds each.</Bullet>
            <Bullet>10/10 debates completed · 90/90 non-empty positions.</Bullet>
            <Bullet>Mean 370.8 seconds per debate on the dev trio.</Bullet>
            <Bullet>Claim tags parsed on every generation (fallback included).</Bullet>
          </ul>
        </Card>
      </div>
      <NoteStrip color={TEAL}>
        Metrics: answer accuracy · consensus-collapse rate · minority-preservation
        rate · evidence-calibration rate.
      </NoteStrip>
    </div>
  );
}

/* ── Slide 11: Application ──────────────────────────────────────── */
function FinalApplicationSlide() {
  return (
    <div className="w-full h-full flex flex-col px-[4cqw] py-[3cqh]">
      <SlideHeader
        badge="Application"
        badgeBg="#fef3c7"
        badgeColor={AMBER}
        title="Where This Helps"
        subtitle="Any setting that needs a trustworthy answer plus the evidence behind it."
      />
      <div className="flex gap-[2cqw] flex-1 min-h-0">
        <Card
          icon={<Globe size="2.4cqh" color="#fff" />}
          title="Where It Helps"
          color={AMBER}
          className="w-[40%] flex-shrink-0"
        >
          <ul className="flex flex-col justify-center h-full">
            <Bullet>
              Scientific question answering with citations a reader can check.
            </Bullet>
            <Bullet>
              Research assistants that link every answer to retrieved papers.
            </Bullet>
            <Bullet>
              Education and decision support where errors are flagged, not
              hidden.
            </Bullet>
            <Bullet>
              A reusable evaluation harness for other research groups.
            </Bullet>
            <Bullet>
              The same design extends to legal or medical evidence corpora.
            </Bullet>
          </ul>
        </Card>
        <Figure
          src="/figures/fig-context.png"
          alt="System boundary and external actors"
          caption="System boundary: harness in, evidence and models alongside, result package out."
          className="flex-1 min-h-0"
        />
      </div>
    </div>
  );
}

/* ── Slide 15: Conclusion ───────────────────────────────────────── */
function FinalConclusionSlide() {
  return (
    <div className="w-full h-full flex flex-col px-[4cqw] py-[3cqh]">
      <SlideHeader
        badge="Conclusion"
        badgeBg="#e0e7ff"
        badgeColor={ACCENT}
        title="The Project in One View"
        subtitle="The problem, the mechanism, and what the evaluation shows."
      />
      <div className="grid grid-cols-2 gap-[2cqw] flex-1 min-h-0">
        <Card
          icon={<Target size="2.4cqh" color="#fff" />}
          title="The Project"
          color={ACCENT}
        >
          <ul className="flex flex-col justify-center h-full">
            <Bullet>
              A confident wrong majority can push a correct minority into
              sycophantic consensus.
            </Bullet>
            <Bullet>
              A bounded trust score from retrieved evidence re-weights each
              agent during the debate.
            </Bullet>
            <Bullet>
              An injection protocol with CCR, MPR and ECR measures the effect
              against majority vote, MoA, iMAD and ConsensAgent.
            </Bullet>
          </ul>
        </Card>
        <Card
          icon={<TrendingUp size="2.4cqh" color="#fff" />}
          title="Outcome and Next Steps"
          color={TEAL}
        >
          <ul className="flex flex-col justify-center h-full">
            <Bullet>
              Expected: fewer collapses, a preserved correct minority, and
              calibrated trust.
            </Bullet>
            <Bullet>
              Completed runs already show the pipeline works end to end on
              three heterogeneous models.
            </Bullet>
            <Bullet>
              Remaining work: full experiment matrix, ablations, human study
              and an open-source release.
            </Bullet>
          </ul>
        </Card>
      </div>
      <NoteStrip color={ACCENT}>
        Evidence decides who wins the debate, not the number of voices.
      </NoteStrip>
    </div>
  );
}

/* ── Slide 16: Thank You (same as /slide) ───────────────────────── */
function FinalThankYouSlide() {
  return <ThankYouSlide />;
}

/* ── Final deck composition ─────────────────────────────────────── */

export const FINAL_SLIDES = [
  FinalTitleSlide,
  FinalIntroSlide,
  FinalMotivationSlide,
  FinalObjectiveSlide,
  FinalDatasetSlide,
  FinalConventionalSlide,
  FinalMethodSlide,
  FinalProtocolSlide,
  FinalTrustSlide,
  FinalDataFlowSlide,
  FinalSetupSlide,
  FinalResultsSlide,
  FinalApplicationSlide,
  CeOverviewSlide,
  CeDefinitionsSlide,
  CeMatrixSlide,
  FinalConclusionSlide,
  FinalThankYouSlide,
];
