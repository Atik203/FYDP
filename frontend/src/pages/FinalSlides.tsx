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
import {
  BarChart3,
  BookOpen,
  Calendar,
  ClipboardCheck,
  FlaskConical,
  Layers,
  Target,
  TrendingUp,
} from "lucide-react";

/* ────────────────────────────────────────────────────────────────
   Final FYDP I defence deck — route /slide/final
   Follows Final_Slide_Guideline.md. No group names anywhere.
   ──────────────────────────────────────────────────────────────── */

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
      <div className="flex gap-[2.4cqw] flex-1 min-h-0">
        <ul className="flex-1 flex flex-col justify-center">
          <Bullet>
            Large language models answer hard science questions, but they can be
            confidently wrong.
          </Bullet>
          <Bullet>
            In multi-agent debate, three models solve the same question and
            compare their reasoning over rounds.
          </Bullet>
          <Bullet>
            Most systems then decide by majority vote, where every agent counts
            the same.
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
      <ul className="mt-[2.4cqh]">
        <Bullet>
          ConsensAgent (Findings of ACL 2025) found the correct answer present
          but ignored in more than 20 percent of wrong-answer cases.
        </Bullet>
        <Bullet>
          MAST (NeurIPS 2025) measured 41 to 86.7 percent failure across seven
          multi-agent frameworks.
        </Bullet>
        <Bullet>
          Estornell and Liu (NeurIPS 2024) prove that agents follow a wrong
          majority when no outside correction enters the loop.
        </Bullet>
      </ul>
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
        title="What FYDP I Set Out to Build"
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
      <ul className="mt-[2cqh]">
        <Bullet>
          Two pre-filters keep only divergent questions with checkable answers,
          about 60 to 70 percent retention.
        </Bullet>
        <Bullet>
          Main matrix draws 1,000 questions per dataset; the pilot draws 50.
          Gold answers are used for scoring only.
        </Bullet>
      </ul>
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
      <div
        className="mt-[1.6cqh] rounded-xl px-[2.4cqw] py-[1.3cqh] text-[2.1cqh] font-bold"
        style={{ background: "#f1f5f9", color: DEEP_INK }}
      >
        Gap: no existing method ties an agent's influence to external evidence
        while the debate runs.
      </div>
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
      <div className="flex gap-[2.4cqw] flex-1 min-h-0">
        <ul className="flex-1 flex flex-col justify-center">
          <Bullet>
            Confidence gate: easy questions are answered directly; hard ones
            start a debate.
          </Bullet>
          <Bullet>
            Three heterogeneous agents: Qwen, Gemma and Mistral. No fine-tuning.
          </Bullet>
          <Bullet>
            Each answer is split into atomic claims, then checked per source:
            PubMed, arXiv, Semantic Scholar (OpenAlex fallback).
          </Bullet>
          <Bullet>
            Every claim gets one verdict: supported, contradicted, unverifiable
            or contested.
          </Bullet>
          <Bullet>
            Trust update each round: S(t+1) = S(t) + αV − βH, then softmax →
            clamp [0.1, 0.9] → renormalize.
          </Bullet>
          <Bullet>
            Final answer by trust-weighted aggregation, not a head count.
          </Bullet>
        </ul>
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
  return (
    <div className="w-full h-full flex flex-col px-[4cqw] py-[3cqh]">
      <SlideHeader
        badge="Experimental Setup"
        badgeBg="#e0e7ff"
        badgeColor={ACCENT}
        title="How the Experiments Run"
        subtitle="Two model stacks, one code path: the Dev to Final swap is a config change."
      />
      <SlideTable
        head={["Setting", "Value"]}
        colWidths={["27%", "73%"]}
        accent={ACCENT}
        rows={[
          [
            "Agent models — Dev",
            "Qwen3.5-9B · Gemma 4 12B · Ministral-3-14B (4-bit, one RTX A6000 48 GB)",
          ],
          [
            "Agent models — Final",
            "Qwen3.6-27B · Gemma 4 26B A4B · Mistral-Small-3.2-24B (FP8, RTX PRO 6000 96 GB)",
          ],
          ["Serving", "vLLM behind an OpenAI-compatible interface, one server per agent"],
          [
            "Debate",
            "K = 3 rounds · temperature 0.7 · 1,024 output tokens · three seeds",
          ],
          [
            "Stress test",
            "Fabricated expert consensus injected between round 1 and round 2",
          ],
          [
            "Validation",
            "annotation agreement κ ≥ 0.75 · paired bootstrap 95% CI · Cohen's d",
          ],
          ["Compute", "about 300 GPU-hours · budget USD 340–820"],
        ]}
      />
      <div className="mt-[1.6cqh] text-[2cqh] font-semibold" style={{ color: DEEP_INK }}>
        No model is fine-tuned, and evaluation sets keep only questions that
        produce divergent initial answers.
      </div>
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
        title="Expected Results and Pilot Evidence"
        subtitle="The full matrix runs in FYDP II. The pilot already validates the pipeline end to end."
      />
      <div className="grid grid-cols-2 gap-[2cqw] flex-1 min-h-0">
        <Card
          icon={<TrendingUp size="2.4cqh" color="#fff" />}
          title="Expected · FYDP II"
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
          title="Pilot · Gate 0 (FYDP I)"
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
      <div
        className="mt-[1.6cqh] rounded-xl px-[2.4cqw] py-[1.3cqh] text-[2.1cqh] font-bold"
        style={{ background: "#f1f5f9", color: DEEP_INK }}
      >
        Metrics: answer accuracy · consensus-collapse rate · minority-preservation
        rate · evidence-calibration rate.
      </div>
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
      <div className="flex gap-[2.4cqw] flex-1 min-h-0">
        <ul className="flex-1 flex flex-col justify-center">
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
        title="What FYDP I Delivered"
        subtitle="One phase done, with the expensive work planned on purpose for later phases."
      />
      <div className="grid grid-cols-2 gap-[2cqw] flex-1 min-h-0">
        <Card
          icon={<ClipboardCheck size="2.4cqh" color="#fff" />}
          title="Delivered"
          color={ACCENT}
        >
          <ul className="flex flex-col justify-center h-full">
            <Bullet>
              Full pipeline: gate, debate, claim decomposition, retrieval, trust
              update, aggregation.
            </Bullet>
            <Bullet>
              Injection protocol and the CCR/MPR/ECR evaluation harness.
            </Bullet>
            <Bullet>
              Gate 0 passed: vanilla debate runs end to end on three
              heterogeneous models.
            </Bullet>
          </ul>
        </Card>
        <Card
          icon={<Calendar size="2.4cqh" color="#fff" />}
          title="Next Steps"
          color={AMBER}
        >
          <ul className="flex flex-col justify-center h-full">
            <Bullet>
              Phase 2: retrieval and trust runs, baselines B5, B6, B9 and B10.
            </Bullet>
            <Bullet>
              Phase 3: main matrix, ablations and N-scaling across three seeds.
            </Bullet>
            <Bullet>
              Limitation: no external stakeholders (P6) and incremental
              innovation (A3) stay open.
            </Bullet>
          </ul>
        </Card>
      </div>
      <div
        className="mt-[1.6cqh] rounded-xl px-[2.4cqw] py-[1.3cqh] text-[2.1cqh] font-bold"
        style={{ background: "#f1f5f9", color: DEEP_INK }}
      >
        Evidence decides who wins the debate, not the number of voices.
      </div>
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
