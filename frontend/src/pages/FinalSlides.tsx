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
      <div className="grid grid-cols-3 gap-[1.8cqw] mt-[3.4cqh] flex-1 min-h-0">
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
              Design a bounded trust update from retrieved evidence.
            </Bullet>
            <Bullet>
              Raw score rises with support, falls with contradiction.
            </Bullet>
            <Bullet>Bounded by design.</Bullet>
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
              pressure.
            </Bullet>
            <Bullet>
              Fabricate a wrong expert consensus between rounds 1 and 2.
            </Bullet>
            <Bullet>
              Keep divergent, checkable questions; validate κ ≥ 0.75.
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
              Ten baselines (B1–B10), including MoA, iMAD and ConsensAgent.
            </Bullet>
            <Bullet>
              Metrics: accuracy, collapse (CCR), minority survival (MPR),
              calibration (ECR).
            </Bullet>
            <Bullet>
              Three seeds, 95% confidence intervals and Cohen's d.
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
            <Bullet>
              Run the check early with a frozen Go/No-Go criterion.
            </Bullet>
            <Bullet>A negative result is reported honestly as a finding.</Bullet>
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
          ["GPQA", "Stable", "448 questions · Diamond 198", "CC BY 4.0"],
          ["MMLU-Pro", "Stable", "12,032 questions · 14 subjects", "MIT"],
          ["HLE", "Expert ceiling", "2,500+ expert questions", "MIT · gated"],
          ["BrokenMath", "Adversarial", "504 samples · 183 final-answer", "CC BY-NC-SA 4.0"],
          ["BrokenArXiv", "Adversarial, monthly", "monthly sets", "CC BY-SA 4.0"],
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
          <ul className="flex flex-col justify-center h-full [&>li:not(:last-child)]:mb-[1.8cqh]">
            <Bullet>Majority voting: equal weight (Du et al., ICML 2024).</Bullet>
            <Bullet>
              Confidence weighting: self-reported scores (DebUnc, EMNLP 2025).
            </Bullet>
            <Bullet>
              Prompt rewriting before debate (ConsensAgent, ACL 2025).
            </Bullet>
            <Bullet>Static aggregation once (MoA, ICLR 2025).</Bullet>
            <Bullet>Debate prediction (iMAD, AAAI 2026).</Bullet>
            <Bullet>
              All of them aggregate by a vote or an internal score.
            </Bullet>
          </ul>
        </Card>
        <Card
          icon={<Layers size="2.4cqh" color="#fff" />}
          title="Evaluation Baselines"
          color={TEAL}
        >
          <div className="h-full flex flex-col justify-center gap-[1.8cqh]">
            <div className="grid grid-cols-2 w-full gap-[1cqh_0.8cqw]">
              {baselines.map(([code, name]) => (
                <div
                  key={code}
                  className="flex items-center gap-[0.6cqw] rounded-lg border px-[0.7cqw] py-[0.85cqh]"
                  style={{
                    borderColor: code === "B8" ? ACCENT : "#cbd5e1",
                    background: code === "B8" ? "#eef2ff" : "#ffffff",
                  }}
                >
                  <span
                    className="text-[2.15cqh] font-extrabold"
                    style={{ color: code === "B8" ? ACCENT : TEAL }}
                  >
                    {code}
                  </span>
                  <span
                    className="text-[1.95cqh] font-semibold leading-snug"
                    style={{ color: DEEP_INK }}
                  >
                    {name}
                  </span>
                </div>
              ))}
            </div>
            <div
              className="text-[1.9cqh] font-semibold leading-snug"
              style={{ color: "#475569" }}
            >
              B1–B4 isolate debate and retrieval; B5–B10 are the published
              competitors.
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
              The weighted vote decides the final answer, not a head count.
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



/* ── Pipeline ───────────────────────────────────────────────────── */
function FinalPipelineSlide() {
  return (
    <div className="w-full h-full flex flex-col px-[3cqw] py-[3cqh]">
      <SlideHeader
        badge="Pipeline"
        badgeBg="#e0e7ff"
        badgeColor={ACCENT}
        title="The Pipeline, End to End"
        subtitle="Eight stages, one injection point, and the evaluation strip."
      />
      <Figure
        src="/figures/fig-pipeline.png"
        alt="Eight-stage pipeline with the injection point and evaluation strip"
        caption="The dashed box is the injection point, used only in stress tests; the evaluation strip lists the datasets and metrics."
        className="flex-1 min-h-0"
      />
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
    "Temperature 0.7",
    "1,024 output tokens · 4,096 context",
    "Three seeds",
    "Retry cap 3 per agent",
  ];
  const stress = [
    "Injection between rounds 1 and 2",
    "Annotation agreement κ ≥ 0.75",
    "Paired bootstrap 95% CI (10,000 resamples)",
    "Injection off in B1–B4",
    "Cohen's d for effect size",
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
            <Bullet>
              Qwen3.5-9B · Gemma 4 12B · Ministral-3-14B, 4-bit, on one RTX
              A6000 48 GB.
            </Bullet>
          </ul>
        </Card>
        <Card
          icon={<Layers size="2.4cqh" color="#fff" />}
          title="Final Stack"
          color={TEAL}
        >
          <ul className="flex flex-col justify-center h-full">
            <Bullet>
              Qwen3.6-27B · Gemma 4 26B A4B · Mistral-Small-3.2-24B, FP8, on
              one RTX PRO 6000 96 GB.
            </Bullet>
          </ul>
        </Card>
        <Card
          icon={<Network size="2.4cqh" color="#fff" />}
          title="Serving"
          color={AMBER}
        >
          <ul className="flex flex-col justify-center h-full">
            <Bullet>vLLM, OpenAI-compatible; one server per agent.</Bullet>
          </ul>
        </Card>
      </div>
      <div className="grid grid-cols-2 gap-[1.8cqw] mt-[1.8cqh] flex-1 min-h-0">
        <Card
          icon={<Code size="2.4cqh" color="#fff" />}
          title="Debate Configuration"
          color={ACCENT}
        >
          <div className="h-full flex flex-col justify-center">
            <ul>
              {debate.map((d) => (
                <Bullet key={d}>{d}</Bullet>
              ))}
            </ul>
          </div>
        </Card>
        <Card
          icon={<FlaskConical size="2.4cqh" color="#fff" />}
          title="Stress Test & Validation"
          color={AMBER}
        >
          <div className="h-full flex flex-col justify-center">
            <ul>
              {stress.map((d) => (
                <Bullet key={d}>{d}</Bullet>
              ))}
            </ul>
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
            <Bullet>Largest gains expected on the adversarial sets.</Bullet>
            <Bullet>A reusable CCR/MPR/ECR harness ships with the mechanism.</Bullet>
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
            <Bullet>
              Mean 370.8 s per debate (3,708 s total); 21.5 s variation.
            </Bullet>
            <Bullet>
              Claim tags parsed every generation; fallback used in 5 of 30.
            </Bullet>
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



/* ── Slide 15: Conclusion ───────────────────────────────────────── */
/* ── System Context · Application ───────────────────────────────── */
function FinalContextSlide() {
  return (
    <div className="w-full h-full flex flex-col px-[4cqw] py-[3cqh]">
      <SlideHeader
        badge="System Context · Application"
        badgeBg="#fef3c7"
        badgeColor={AMBER}
        title="Where It Plugs In"
        subtitle="The system boundary, and the settings it helps."
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
              A reusable evaluation harness; extends to law or medicine.
            </Bullet>
          </ul>
        </Card>
        <Figure
          src="/figures/fig-context.png"
          alt="System boundary and external actors"
          caption="Harness in, evidence and models alongside, result package out."
          className="flex-1 min-h-0"
        />
      </div>
    </div>
  );
}

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
              A bounded trust score from retrieved evidence re-weights agents,
              and CCR/MPR/ECR measures the effect against the baselines.
            </Bullet>
            <Bullet>
              Every result package returns the answer, citations and trust
              trajectory.
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
              Expected: fewer collapses, a preserved minority, calibrated
              trust.
            </Bullet>
            <Bullet>
              Completed runs show the pipeline works end to end on three
              models.
            </Bullet>
            <Bullet>
              Applies to scientific QA, education and other evidence domains.
            </Bullet>
            <Bullet>
              Remaining: full matrix, ablations, human study, open-source
              release.
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
  FinalPipelineSlide,
  FinalDataFlowSlide,
  FinalSetupSlide,
  FinalResultsSlide,
  FinalContextSlide,
  CeOverviewSlide,
  CeDefinitionsSlide,
  CeMatrixSlide,
  FinalConclusionSlide,
  FinalThankYouSlide,
];
