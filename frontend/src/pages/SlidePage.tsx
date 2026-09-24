import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  BookOpen,
  Boxes,
  Brain,
  Calendar,
  ClipboardCheck,
  Code,
  Cog,
  Compass,
  Crown,
  FileCode,
  FlaskConical,
  Globe,
  GraduationCap,
  Layers,
  Lightbulb,
  Link2,
  Maximize,
  MessageSquare,
  Network,
  Scale,
  Search,
  Sigma,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

/* ────────────────────────────────────────────────────────────────
   Projector-safe slide deck. Route: /slide (intentionally not in nav)
   - 16:9 canvas, letterboxed on any screen
   - Keyboard-only navigation: ← → , PageUp/PageDown (clicker), Home/End
   - Press F to toggle fullscreen
   - All slide text is near-black (#0a0a0a) for high projector contrast
   - Font sizes use container-query units (cqh/cqw) so text scales with
     the slide, not the browser window
   ──────────────────────────────────────────────────────────────── */

const NEAR_BLACK = "#0a0a0a";
const DEEP_INK = "#101828"; // secondary near-black for supporting text
const ACCENT = "#1e40af"; // deep blue
const TEAL = "#0f766e";
const AMBER = "#b45309";
const ROSE = "#b91c1c";

const MEMBERS: { name: string; id: string; leader?: boolean }[] = [
  { name: "Md. Atikur Rahaman", id: "0112310298" },
  { name: "Rakibul Hasan", id: "0112310530" },
  { name: "Md. Salman Rohoman Nayeem", id: "0112310484" },
  { name: "Pratay Paul", id: "0112310163" },
  { name: "Yousuf Kamal Himel", id: "0112310526" },
  { name: "Mst. Farjana Akter Limu", id: "0112310535" },
];

/* ── Slide 1: Group info ─────────────────────────────────────────── */
function GroupSlide() {
  return (
    <div className="w-full h-full flex flex-col justify-center px-[7cqw] py-[4cqh]">
      <div className="text-center mb-[2.6cqh]">
        <div
          className="inline-block rounded-full px-[2.4cqw] py-[0.9cqh] text-[1.9cqh] font-bold uppercase tracking-[0.18em]"
          style={{ background: ACCENT, color: "#ffffff" }}
        >
          CSE 4000A (B) · Final Year Design Project – I · Section B
        </div>
        <h1
          className="mt-[2cqh] text-[4cqh] font-extrabold leading-tight"
          style={{ color: NEAR_BLACK }}
        >
          Trust-Calibrated Multi-Agent Scientific Deliberation for Mitigating
          Sycophantic Consensus in LLM Reasoning
        </h1>
        <div
          className="mt-[1.4cqh] flex items-center justify-center gap-[2cqw] text-[2.7cqh] font-bold"
          style={{ color: DEEP_INK }}
        >
          <span
            className="rounded-lg px-[2cqw] py-[0.6cqh]"
            style={{ background: "#e0e7ff", color: ACCENT }}
          >
            Group No. 6
          </span>
          <span className="flex items-center gap-[0.8cqw]">
            <Users size="2.6cqh" style={{ color: ACCENT }} />
            Team&nbsp;<span style={{ color: ACCENT }}>Phantom Devs</span>
          </span>
        </div>
        <div
          className="mt-[1.4cqh] inline-flex items-center gap-[1cqw] rounded-lg px-[2.2cqw] py-[0.8cqh] text-[2.4cqh] font-bold"
          style={{ background: "#ccfbf1", color: TEAL }}
        >
          Supervisor:&nbsp;
          <span style={{ color: NEAR_BLACK }}>Dr. Mohammad Nurul Huda</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-[1.6cqh_2.2cqw]">
        {MEMBERS.map((m) => (
          <div
            key={m.id}
            className="flex items-center gap-[1.4cqw] rounded-xl px-[2.2cqw] py-[1.5cqh] border-2"
            style={{
              borderColor: m.leader ? ACCENT : "#cbd5e1",
              background: m.leader ? "#eef2ff" : "#f8fafc",
            }}
          >
            <div
              className="flex items-center justify-center rounded-full flex-shrink-0"
              style={{
                width: "4.6cqh",
                height: "4.6cqh",
                background: m.leader ? ACCENT : "#334155",
              }}
            >
              {m.leader ? (
                <Crown size="2.6cqh" color="#ffffff" />
              ) : (
                <Users size="2.4cqh" color="#ffffff" />
              )}
            </div>
            <div className="min-w-0">
              <div
                className="text-[2.7cqh] font-bold leading-tight truncate"
                style={{ color: NEAR_BLACK }}
              >
                {m.name}
              </div>
              <div
                className="text-[2.1cqh] font-semibold tracking-wide"
                style={{ color: m.leader ? ACCENT : "#475569" }}
              >
                {m.id}
                {m.leader && (
                  <span className="ml-[1cqw] font-extrabold">· Leader</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Small reusable card for paper slides ────────────────────────── */
function Card({
  icon,
  title,
  color,
  children,
  className,
}: {
  icon: React.ReactNode;
  title: string;
  color: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border-2 px-[2.2cqw] py-[1.8cqh] flex flex-col",
        className,
      )}
      style={{ borderColor: color, background: "#ffffff" }}
    >
      <div className="flex items-center gap-[1cqw] mb-[1.2cqh]">
        <span
          className="flex items-center justify-center rounded-lg flex-shrink-0"
          style={{ width: "4cqh", height: "4cqh", background: color }}
        >
          {icon}
        </span>
        <span
          className="text-[2.7cqh] font-extrabold uppercase tracking-wide"
          style={{ color }}
        >
          {title}
        </span>
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-[0.9cqw] mb-[0.7cqh] last:mb-0">
      <span
        className="rounded-full flex-shrink-0 mt-[1.1cqh]"
        style={{ width: "1.1cqh", height: "1.1cqh", background: DEEP_INK }}
      />
      <span
        className="text-[2.55cqh] font-medium leading-snug"
        style={{ color: NEAR_BLACK }}
      >
        {children}
      </span>
    </li>
  );
}

/* ── Slide 2: iMAD — Summary + Method + Results ──────────────────── */
function ImadSlideOne() {
  return (
    <div className="w-full h-full flex flex-col px-[5cqw] py-[3.5cqh]">
      {/* Header */}
      <div className="mb-[2.2cqh]">
        <div
          className="inline-block rounded px-[1.6cqw] py-[0.5cqh] text-[1.9cqh] font-bold uppercase tracking-wider"
          style={{ background: "#e0e7ff", color: ACCENT }}
        >
          Paper Review · Baseline B9
        </div>
        <h1
          className="mt-[1.2cqh] text-[4.4cqh] font-extrabold leading-tight"
          style={{ color: NEAR_BLACK }}
        >
          iMAD: Intelligent Multi-Agent Debate for Efficient &amp; Accurate LLM
          Inference
        </h1>
        <div
          className="mt-[0.8cqh] flex flex-wrap items-center gap-x-[2cqw] gap-y-[0.4cqh] text-[2.3cqh] font-semibold"
          style={{ color: DEEP_INK }}
        >
          <span>Wei Fan, JinYi Yoon, Bo Ji · 2026</span>
          <span style={{ color: "#94a3b8" }}>|</span>
          <span className="flex items-center gap-[0.5cqw]">
            <BarChart3 size="2.3cqh" style={{ color: TEAL }} />
            AAAI 2026 (Oral)
          </span>
          <span style={{ color: "#94a3b8" }}>|</span>
          <span
            className="flex items-center gap-[0.5cqw]"
            style={{ color: ACCENT }}
          >
            <Link2 size="2.3cqh" />
            doi.org/10.1609/aaai.v40i35.40181
          </span>
        </div>
      </div>

      {/* Body: summary + results */}
      <div className="grid grid-cols-[1.55fr_1fr] gap-[2cqw] flex-1 min-h-0">
        <Card
          icon={<Brain size="2.4cqh" color="#fff" />}
          title="What It Does"
          color={ACCENT}
        >
          <ul>
            <Bullet>
              Multi-Agent Debate (MAD) is expensive and can flip a correct
              answer to wrong.
            </Bullet>
            <Bullet>
              <b>iMAD triggers debate only when it is likely to help</b> — not
              on every query.
            </Bullet>
            <Bullet>
              One agent self-critiques → extracts{" "}
              <b>41 hesitation-cue features</b> → a light MLP decides.
            </Bullet>
            <Bullet>
              Classifier trained with a novel <b>FocusCal loss</b> (Focal +
              Confidence Penalty + Calibration).
            </Bullet>
          </ul>
        </Card>

        <Card
          icon={<TrendingUp size="2.4cqh" color="#fff" />}
          title="Key Results"
          color={TEAL}
        >
          <div className="flex flex-col justify-center h-full gap-[2cqh]">
            <div className="text-center">
              <div
                className="text-[7cqh] font-extrabold leading-none"
                style={{ color: TEAL }}
              >
                ↓ 92%
              </div>
              <div
                className="text-[2.3cqh] font-semibold"
                style={{ color: NEAR_BLACK }}
              >
                fewer tokens
              </div>
            </div>
            <div className="text-center">
              <div
                className="text-[7cqh] font-extrabold leading-none"
                style={{ color: ACCENT }}
              >
                ↑ 13.5%
              </div>
              <div
                className="text-[2.3cqh] font-semibold"
                style={{ color: NEAR_BLACK }}
              >
                higher accuracy
              </div>
            </div>
            <div
              className="text-center rounded-lg py-[0.9cqh] px-[1cqw]"
              style={{ background: "#f1f5f9" }}
            >
              <div
                className="text-[1.7cqh] font-bold uppercase tracking-wide mb-[0.5cqh]"
                style={{ color: "#475569" }}
              >
                across 6 datasets
              </div>
              <div
                className="text-[2cqh] font-bold leading-snug"
                style={{ color: DEEP_INK }}
              >
                QA: MedQA · MMLU · GSM8K
                <br />
                VQA: OK-VQA · VQA-v2 · ScienceQA
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Method flow strip */}
      <div className="mt-[2cqh]">
        <div
          className="text-[2.1cqh] font-extrabold uppercase tracking-wide mb-[1cqh]"
          style={{ color: AMBER }}
        >
          Method Pipeline
        </div>
        <div className="flex items-stretch gap-[0.6cqw]">
          {[
            "Single-agent answer",
            "Self-critique (CoT + counter-view + confidence)",
            "Extract 41 features",
            "MLP classifier (FocusCal)",
            "Trigger debate? Yes / No",
          ].map((step, i, arr) => (
            <div key={step} className="flex items-center flex-1">
              <div
                className="flex-1 rounded-lg px-[1.2cqw] py-[1.2cqh] text-[2cqh] font-bold text-center h-full flex items-center justify-center border-2"
                style={{
                  borderColor: AMBER,
                  background: "#fffbeb",
                  color: NEAR_BLACK,
                }}
              >
                {step}
              </div>
              {i < arr.length - 1 && (
                <ArrowRight
                  size="2.6cqh"
                  style={{ color: AMBER }}
                  className="mx-[0.3cqw] flex-shrink-0"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Slide 3: iMAD — Relevance + Gap ─────────────────────────────── */
function ImadSlideTwo() {
  return (
    <div className="w-full h-full flex flex-col px-[5cqw] py-[3.5cqh]">
      <div className="mb-[2cqh]">
        <div
          className="inline-block rounded px-[1.6cqw] py-[0.5cqh] text-[1.9cqh] font-bold uppercase tracking-wider"
          style={{ background: "#e0e7ff", color: ACCENT }}
        >
          iMAD · Relevance &amp; Gap
        </div>
        <h1
          className="mt-[1cqh] text-[4.2cqh] font-extrabold leading-tight"
          style={{ color: NEAR_BLACK }}
        >
          How It Connects to Our Idea
        </h1>
      </div>

      <div className="grid grid-cols-2 gap-[2cqw] flex-1 min-h-0">
        <Card
          icon={<Target size="2.4cqh" color="#fff" />}
          title="Relevant to Our Idea"
          color={ACCENT}
        >
          <ul className="flex flex-col justify-center h-full">
            <Bullet>
              Our <b>closest published, efficiency-focused baseline (B9)</b>.
            </Bullet>
            <Bullet>
              iMAD decides <b>WHEN</b> to debate — not <b>WHOM</b> to trust once
              debating.
            </Bullet>
            <Bullet>
              After triggering, it falls back to plain <b>majority vote</b>.
            </Bullet>
            <Bullet>
              Trust rests on <b>self-reported confidence</b> — the exact signal
              social pressure can manipulate.
            </Bullet>
            <Bullet>
              So it stays exposed to <b>sycophantic collapse</b>: a correct
              minority gives in to a confident wrong majority.
            </Bullet>
            <Bullet>
              Shares our setting — <b>zero-shot, no fine-tuning</b> — so it is a
              fair, directly comparable baseline.
            </Bullet>
          </ul>
        </Card>

        <Card
          icon={<AlertTriangle size="2.4cqh" color="#fff" />}
          title="Gap / Limitations"
          color={ROSE}
        >
          <ul className="flex flex-col justify-center h-full">
            <Bullet>
              <b>No evidence grounding</b> — influence is never tied to external
              facts, only internal cues.
            </Bullet>
            <Bullet>
              Classifier trained <b>offline &amp; fixed</b> — cannot adapt to
              model drift or new domains.
            </Bullet>
            <Bullet>
              Needs <b>labeled data</b> to train its 41-feature gate per model
              family.
            </Bullet>
            <Bullet>
              <b>Black-box API</b> limits: no streaming / token-level monitoring
              (future work).
            </Bullet>
            <Bullet>
              Majority vote after triggering ={" "}
              <b>unaddressed sycophancy risk</b>.
            </Bullet>
          </ul>
        </Card>
      </div>

      {/* Our contribution banner */}
      <div
        className="mt-[2cqh] rounded-xl px-[2.6cqw] py-[2cqh] flex items-center gap-[1.6cqw]"
        style={{ background: TEAL }}
      >
        <Layers size="4.4cqh" color="#ffffff" className="flex-shrink-0" />
        <div>
          <div
            className="text-[2.1cqh] font-bold uppercase tracking-wide"
            style={{ color: "#d1fae5" }}
          >
            Our Contribution Fills This Gap
          </div>
          <div
            className="text-[2.7cqh] font-extrabold leading-snug"
            style={{ color: "#ffffff" }}
          >
            A dynamic, evidence-grounded trust re-weighting mechanism — agent
            influence scales with real-time external scientific evidence, not
            self-reported confidence.
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Complex Engineering helpers ─────────────────────────────────── */
function Mark({ ok, size = "2.4cqh" }: { ok: boolean; size?: string }) {
  return (
    <span
      className="font-extrabold leading-none"
      style={{ fontSize: size, color: ok ? TEAL : ROSE }}
    >
      {ok ? "✓" : "✗"}
    </span>
  );
}

function AttrChip({
  code,
  ok,
  color,
  className,
}: {
  code: string;
  ok: boolean;
  color: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-[0.6cqw] rounded-lg border-2 px-[1cqw] py-[0.7cqh]",
        className,
      )}
      style={{
        borderColor: ok ? color : ROSE,
        background: ok ? "#ffffff" : "#fef2f2",
      }}
    >
      <span
        className="text-[1.9cqh] font-extrabold"
        style={{ color: ok ? color : ROSE }}
      >
        {code}
      </span>
      <Mark ok={ok} size="1.8cqh" />
    </div>
  );
}

function CoverageStrip({
  items,
  color,
}: {
  items: { code: string; ok: boolean }[];
  color: string;
}) {
  return (
    <div className="flex items-stretch gap-[0.7cqw]">
      {items.map((it) => (
        <AttrChip
          key={it.code}
          code={it.code}
          ok={it.ok}
          color={color}
          className="flex-1"
        />
      ))}
    </div>
  );
}

function SlideHeader({
  badge,
  badgeBg,
  badgeColor,
  title,
  subtitle,
}: {
  badge: string;
  badgeBg: string;
  badgeColor: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-[1.5cqh]">
      <div
        className="inline-block rounded px-[1.6cqw] py-[0.5cqh] text-[1.9cqh] font-bold uppercase tracking-wider"
        style={{ background: badgeBg, color: badgeColor }}
      >
        {badge}
      </div>
      <h1
        className="mt-[1.1cqh] text-[4cqh] font-extrabold leading-tight"
        style={{ color: NEAR_BLACK }}
      >
        {title}
      </h1>
      {subtitle && (
        <div
          className="mt-[0.7cqh] text-[2.25cqh] font-semibold"
          style={{ color: DEEP_INK }}
        >
          {subtitle}
        </div>
      )}
    </div>
  );
}

/* ── FYDP I attribute marks (Chapter 5 of the FYDP report) ───────── */
const P_MARKS: { code: string; name: string; ok: boolean }[] = [
  { code: "P1", name: "Depth of knowledge", ok: true },
  { code: "P2", name: "Conflicting requirements", ok: true },
  { code: "P3", name: "Depth of analysis", ok: true },
  { code: "P4", name: "Familiarity of issues", ok: true },
  { code: "P5", name: "Applicable codes", ok: true },
  { code: "P6", name: "Stakeholder involvement", ok: false },
  { code: "P7", name: "Inter-dependence", ok: true },
];

const K_MARKS: { code: string; name: string; ok: boolean }[] = [
  { code: "K1", name: "Natural sciences", ok: true },
  { code: "K2", name: "Mathematics", ok: true },
  { code: "K3", name: "Engineering fundamentals", ok: true },
  { code: "K4", name: "Specialist knowledge", ok: true },
  { code: "K5", name: "Engineering methods", ok: true },
  { code: "K6", name: "Computational methods", ok: true },
  { code: "K7", name: "Codes and practices", ok: true },
  { code: "K8", name: "Research and context", ok: true },
];

const A_MARKS: { code: string; name: string; ok: boolean }[] = [
  { code: "A1", name: "Range of resources", ok: true },
  { code: "A2", name: "Level of interaction", ok: true },
  { code: "A3", name: "Innovation", ok: false },
  { code: "A4", name: "Consequences", ok: false },
  { code: "A5", name: "Familiarity", ok: true },
];

const PO_TILES: { code: string; name: string; ok: boolean }[] = [
  { code: "PO1", name: "Engineering knowledge", ok: true },
  { code: "PO2", name: "Problem analysis", ok: true },
  { code: "PO3", name: "Design / development of solutions", ok: false },
  { code: "PO4", name: "Investigation", ok: true },
  { code: "PO5", name: "Modern tool usage", ok: false },
  { code: "PO6", name: "The engineer and society", ok: false },
  { code: "PO7", name: "Environment and sustainability", ok: false },
  { code: "PO8", name: "Ethics", ok: false },
  { code: "PO9", name: "Individual and teamwork", ok: false },
  { code: "PO10", name: "Communication", ok: true },
  { code: "PO11", name: "Project management and finance", ok: true },
  { code: "PO12", name: "Life-long learning", ok: true },
];

const MATRIX_GROUPS: {
  title: string;
  color: string;
  bg: string;
  items: { code: string; name: string; ok: boolean }[];
}[] = [
  {
    title: "Program Outcomes",
    color: ACCENT,
    bg: "#e0e7ff",
    items: PO_TILES,
  },
  {
    title: "Knowledge Profile",
    color: ROSE,
    bg: "#fee2e2",
    items: K_MARKS,
  },
  {
    title: "Complex Engineering Problem Solving",
    color: TEAL,
    bg: "#ccfbf1",
    items: P_MARKS,
  },
  {
    title: "Complex Engineering Activities",
    color: AMBER,
    bg: "#fef3c7",
    items: A_MARKS,
  },
];

/* ── Slide 4: Complex Engineering — why this project qualifies ───── */
function CeOverviewSlide() {
  const lenses = [
    { code: "P1–P7", label: "Complex Problem Solving" },
    { code: "K1–K8", label: "Knowledge Profile" },
    { code: "A1–A5", label: "Engineering Activities" },
    { code: "PO1–PO12", label: "Program Outcomes" },
  ];
  return (
    <div className="w-full h-full flex flex-col px-[5cqw] py-[3.5cqh]">
      <SlideHeader
        badge="Complex Engineering Problem · Washington Accord"
        badgeBg="#e0e7ff"
        badgeColor={ACCENT}
        title="Why FYDP I Is a Complex Engineering Problem"
        subtitle="The Washington Accord judges complex problems through four lenses — problem solving, knowledge, activities, and outcomes."
      />

      <div className="grid grid-cols-2 gap-[2cqw] flex-1 min-h-0">
        <Card
          icon={<Compass size="2.4cqh" color="#fff" />}
          title="The Four Lenses"
          color={ACCENT}
        >
          <ul className="flex flex-col justify-center h-full">
            <Bullet>
              <b>P — Complex Problem Solving</b>: seven attributes P1–P7, from
              depth of knowledge to inter-dependence.
            </Bullet>
            <Bullet>
              <b>K — Knowledge Profile</b>: eight knowledge areas K1–K8 that a
              complex problem demands.
            </Bullet>
            <Bullet>
              <b>A — Complex Engineering Activities</b>: five activities A1–A5,
              from resources to innovation.
            </Bullet>
            <Bullet>
              <b>PO — Program Outcomes</b>: twelve outcomes PO1–PO12 the
              programme must demonstrate.
            </Bullet>
            <Bullet>
              A problem is complex when it <b>cannot be solved by routine
              methods</b> alone.
            </Bullet>
          </ul>
        </Card>

        <Card
          icon={<Layers size="2.4cqh" color="#fff" />}
          title="Why This Project Qualifies"
          color={TEAL}
        >
          <ul className="flex flex-col justify-center h-full">
            <Bullet>
              <b>Multi-disciplinary</b>: machine learning, NLP,
              retrieval-augmented generation, distributed model serving.
            </Bullet>
            <Bullet>
              <b>Conflicting requirements</b>: accuracy vs latency vs cost;
              debate rounds vs the GPU bill.
            </Bullet>
            <Bullet>
              <b>No textbook solution</b>: no standard method exists for
              sycophantic consensus in LLM debate.
            </Bullet>
            <Bullet>
              <b>Interdependent parts</b>: a retrieval error propagates through
              the trust score into the final verdict.
            </Bullet>
          </ul>
        </Card>
      </div>

      <div
        className="mt-[2cqh] rounded-xl px-[2.6cqw] py-[1.6cqh] flex items-center justify-between gap-[1.6cqw]"
        style={{ background: ACCENT }}
      >
        {lenses.map((l) => (
          <div key={l.code} className="flex items-center gap-[1cqw]">
            <span
              className="text-[2.6cqh] font-extrabold"
              style={{ color: "#ffffff" }}
            >
              {l.code}
            </span>
            <span
              className="text-[2cqh] font-semibold"
              style={{ color: "#dbeafe" }}
            >
              {l.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Slide 5: Attribute definitions — Washington Accord reference ── */
function CeDefinitionsSlide() {
  const lenses: {
    code: string;
    title: string;
    color: string;
    bg: string;
    items: { code: string; name: string }[];
  }[] = [
    {
      code: "P1–P7",
      title: "Problem Solving",
      color: TEAL,
      bg: "#ccfbf1",
      items: [
        { code: "P1", name: "Depth of knowledge required" },
        { code: "P2", name: "Range of conflicting requirements" },
        { code: "P3", name: "Depth of analysis" },
        { code: "P4", name: "Familiarity of issues" },
        { code: "P5", name: "Extent of applicable codes" },
        { code: "P6", name: "Extent of stakeholder involvement" },
        { code: "P7", name: "Inter-dependence" },
      ],
    },
    {
      code: "K1–K8",
      title: "Knowledge Profile",
      color: ROSE,
      bg: "#fee2e2",
      items: [
        { code: "K1", name: "Natural sciences" },
        { code: "K2", name: "Mathematics" },
        { code: "K3", name: "Engineering fundamentals" },
        { code: "K4", name: "Specialist knowledge" },
        { code: "K5", name: "Engineering methods" },
        { code: "K6", name: "Computational methods" },
        { code: "K7", name: "Codes and practices" },
        { code: "K8", name: "Research and context" },
      ],
    },
    {
      code: "A1–A5",
      title: "Engineering Activities",
      color: AMBER,
      bg: "#fef3c7",
      items: [
        { code: "A1", name: "Range of resources" },
        { code: "A2", name: "Level of interaction" },
        { code: "A3", name: "Innovation" },
        { code: "A4", name: "Consequences for society and environment" },
        { code: "A5", name: "Familiarity" },
      ],
    },
    {
      code: "PO1–PO12",
      title: "Program Outcomes",
      color: ACCENT,
      bg: "#e0e7ff",
      items: [
        { code: "PO1", name: "Engineering knowledge" },
        { code: "PO2", name: "Problem analysis" },
        { code: "PO3", name: "Design / development of solutions" },
        { code: "PO4", name: "Investigation" },
        { code: "PO5", name: "Modern tool usage" },
        { code: "PO6", name: "The engineer and society" },
        { code: "PO7", name: "Environment and sustainability" },
        { code: "PO8", name: "Ethics" },
        { code: "PO9", name: "Individual and teamwork" },
        { code: "PO10", name: "Communication" },
        { code: "PO11", name: "Project management and finance" },
        { code: "PO12", name: "Life-long learning" },
      ],
    },
  ];

  return (
    <div className="w-full h-full flex flex-col px-[5cqw] py-[3.5cqh]">
      <SlideHeader
        badge="Complex Engineering Check · Washington Accord"
        badgeBg="#e0e7ff"
        badgeColor={ACCENT}
        title="Washington Accord Attributes"
        subtitle="The official attribute lists behind each lens — the vocabulary the scoreboard and detail slides use."
      />

      <div className="grid grid-cols-4 gap-[1.4cqw] flex-1 min-h-0">
        {lenses.map((col) => (
          <div
            key={col.code}
            className="flex flex-col rounded-xl overflow-hidden border-2"
            style={{ borderColor: col.bg }}
          >
            <div
              className="px-[1.2cqw] py-[0.9cqh]"
              style={{ background: col.color }}
            >
              <div
                className="text-[1.7cqh] font-bold tracking-wide"
                style={{ color: "#ffffffcc" }}
              >
                {col.code}
              </div>
              <div className="text-[2.05cqh] font-extrabold leading-tight text-white">
                {col.title}
              </div>
            </div>
            <div className="flex-1 min-h-0 flex flex-col justify-center gap-[1cqh] px-[1.2cqw] py-[1cqh] bg-white">
              {col.items.map((it) => (
                <div key={it.code} className="flex items-baseline gap-[0.7cqw]">
                  <span
                    className="text-[2cqh] font-extrabold flex-shrink-0 w-[4.4cqw]"
                    style={{ color: col.color }}
                  >
                    {it.code}
                  </span>
                  <span
                    className="text-[2cqh] font-semibold leading-snug"
                    style={{ color: DEEP_INK }}
                  >
                    {it.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Slide 6: Complex Engineering — FYDP I scoreboard ────────────── */
function CeScoreboardSlide() {
  const tiles: {
    code: string;
    name: string;
    value: string;
    color: string;
    bg: string;
    items: { code: string; ok: boolean }[];
    note: string;
  }[] = [
    {
      code: "P",
      name: "Problem solving",
      value: "6/7",
      color: ACCENT,
      bg: "#e0e7ff",
      items: P_MARKS,
      note: "P6: no external stakeholders",
    },
    {
      code: "K",
      name: "Knowledge",
      value: "8/8",
      color: TEAL,
      bg: "#ccfbf1",
      items: K_MARKS,
      note: "Every knowledge area covered",
    },
    {
      code: "A",
      name: "Activities",
      value: "3/5",
      color: AMBER,
      bg: "#fef3c7",
      items: A_MARKS,
      note: "A3/A4 beyond prototype scope",
    },
    {
      code: "PO",
      name: "Outcomes",
      value: "6/12",
      color: ROSE,
      bg: "#fee2e2",
      items: PO_TILES,
      note: "Six outcomes in FYDP II/III",
    },
  ];
  return (
    <div className="w-full h-full flex flex-col px-[5cqw] py-[3.5cqh]">
      <SlideHeader
        badge="FYDP I · Mapping Scoreboard"
        badgeBg="#ccfbf1"
        badgeColor={TEAL}
        title="FYDP I at a Glance"
        subtitle="Every attribute is marked covered or not covered in Chapter 5 — here is the summary."
      />

      <div className="grid grid-cols-4 gap-[1.6cqw] flex-1 min-h-0">
        {tiles.map((t) => (
          <div
            key={t.code}
            className="rounded-xl border-2 flex flex-col items-center justify-between text-center px-[1.2cqw] py-[2cqh]"
            style={{ borderColor: t.color, background: "#ffffff" }}
          >
            <div>
              <div
                className="text-[2.1cqh] font-extrabold uppercase tracking-[0.15em]"
                style={{ color: t.color }}
              >
                {t.code}
              </div>
              <div
                className="text-[1.7cqh] font-bold"
                style={{ color: DEEP_INK }}
              >
                {t.name}
              </div>
            </div>
            <div className="flex items-baseline gap-[0.8cqw]">
              <span
                className="text-[9cqh] font-extrabold leading-none"
                style={{ color: NEAR_BLACK }}
              >
                {t.value}
              </span>
              <span
                className="text-[1.9cqh] font-bold"
                style={{ color: "#64748b" }}
              >
                covered
              </span>
            </div>
            <div className="grid w-full grid-cols-4 gap-[0.4cqw]">
              {t.items.map((it) => (
                <span
                  key={it.code}
                  className="flex items-center justify-center gap-[0.3cqw] rounded-md border px-[0.4cqw] py-[0.35cqh]"
                  style={{
                    borderColor: it.ok ? t.color : ROSE,
                    background: it.ok ? "#ffffff" : "#fef2f2",
                  }}
                >
                  <span
                    className="text-[1.6cqh] font-bold"
                    style={{ color: it.ok ? t.color : ROSE }}
                  >
                    {it.code}
                  </span>
                  <Mark ok={it.ok} size="1.5cqh" />
                </span>
              ))}
            </div>
            <div
              className="rounded-lg px-[1cqw] py-[0.6cqh] text-[1.8cqh] font-semibold"
              style={{ background: t.bg, color: t.color }}
            >
              {t.note}
            </div>
          </div>
        ))}
      </div>

      <div
        className="mt-[2cqh] flex items-center justify-between rounded-xl px-[2.4cqw] py-[1.5cqh]"
        style={{ background: "#f1f5f9" }}
      >
        <span
          className="text-[2.2cqh] font-bold"
          style={{ color: DEEP_INK }}
        >
          Marks follow FYDP I, the only phase completed — later phases move the
          remaining marks.
        </span>
        <span
          className="text-[2.2cqh] font-extrabold flex items-center gap-[0.7cqw]"
          style={{ color: ACCENT }}
        >
          Next: P1–P7 <ArrowRight size="2.2cqh" />
        </span>
      </div>
    </div>
  );
}

/* ── Slide 7: P1–P4 — Complex problem solving, part 1 ────────────── */
function CeProblemOneSlide() {
  return (
    <div className="w-full h-full flex flex-col px-[5cqw] py-[3.5cqh]">
      <SlideHeader
        badge="P1–P7 · Complex Problem Solving"
        badgeBg="#ccfbf1"
        badgeColor={TEAL}
        title="Complex Problem Solving — Part 1"
        subtitle="Four of the seven Washington Accord problem attributes and what covers each in FYDP I."
      />

      <CoverageStrip items={P_MARKS} color={TEAL} />

      <div className="grid grid-cols-2 gap-[1.2cqh_2cqw] mt-[1.4cqh] flex-1 min-h-0">
        <Card
          icon={<BookOpen size="2.4cqh" color="#fff" />}
          title="P1 · Depth of Knowledge"
          color={ACCENT}
        >
          <ul className="flex flex-col justify-center h-full">
            <Bullet>
              Machine learning, NLP, RAG and distributed model serving.
            </Bullet>
            <Bullet>
              The trust update runs through the vLLM serving layer.
            </Bullet>
            <Bullet>
              No single discipline suffices for the pipeline.
            </Bullet>
          </ul>
        </Card>
        <Card
          icon={<Scale size="2.4cqh" color="#fff" />}
          title="P2 · Conflicting Requirements"
          color={AMBER}
        >
          <ul className="flex flex-col justify-center h-full">
            <Bullet>
              Accuracy vs latency vs cost; more rounds raise the GPU bill.
            </Bullet>
            <Bullet>
              Trust weighting vs diversity; evidence coverage vs rate limits.
            </Bullet>
            <Bullet>
              Round caps and clamping bounds resolve the conflicts.
            </Bullet>
          </ul>
        </Card>
        <Card
          icon={<FlaskConical size="2.4cqh" color="#fff" />}
          title="P3 · Depth of Analysis"
          color={TEAL}
        >
          <ul className="flex flex-col justify-center h-full">
            <Bullet>
              No textbook solution — compared majority vote, MoA, iMAD and
              DebUnc.
            </Bullet>
            <Bullet>
              Four metric families plus a fake-consensus injection stress test.
            </Bullet>
            <Bullet>
              Injection measures collapse under controlled stress.
            </Bullet>
          </ul>
        </Card>
        <Card
          icon={<Search size="2.4cqh" color="#fff" />}
          title="P4 · Familiarity of Issues"
          color={ROSE}
        >
          <ul className="flex flex-col justify-center h-full">
            <Bullet>
              Multi-agent LLM debate is new; closest work is 2024–2026.
            </Bullet>
            <Bullet>
              No standard fix for sycophantic consensus; a literature review
              preceded any design.
            </Bullet>
            <Bullet>
              Baselines and metrics came before the mechanism.
            </Bullet>
          </ul>
        </Card>
      </div>

      <div
        className="mt-[1cqh] text-[1.9cqh] font-semibold"
        style={{ color: DEEP_INK }}
      >
        6 of 7 P attributes are covered — P5–P7 follow, including the P6 gap.
      </div>
    </div>
  );
}

/* ── Slide 8: P5–P7 — Complex problem solving, part 2 ────────────── */
function CeProblemTwoSlide() {
  return (
    <div className="w-full h-full flex flex-col px-[5cqw] py-[3.5cqh]">
      <SlideHeader
        badge="P1–P7 · Complex Problem Solving"
        badgeBg="#ccfbf1"
        badgeColor={TEAL}
        title="Codes, Inter-dependence, and the P6 Gap"
        subtitle="Completing the seven attributes — one of them cannot be claimed in FYDP I."
      />

      <div className="grid grid-cols-3 gap-[1.8cqw] flex-1 min-h-0">
        <Card
          icon={<FileCode size="2.4cqh" color="#fff" />}
          title="P5 · Applicable Codes"
          color={ACCENT}
        >
          <ul className="flex flex-col justify-center h-full">
            <Bullet>
              Standards apply: JSON (RFC 8259), HTTP over TLS, the
              OpenAI-compatible API.
            </Bullet>
            <Bullet>
              No code covers evidence-grounded trust — the framework defines its
              own trust rules and four verdicts.
            </Bullet>
            <Bullet>
              JSON payloads over TLS carry those rules between components.
            </Bullet>
          </ul>
        </Card>
        <Card
          icon={<Link2 size="2.4cqh" color="#fff" />}
          title="P7 · Inter-dependence"
          color={TEAL}
        >
          <ul className="flex flex-col justify-center h-full">
            <Bullet>
              Gate → Orchestrator → Claim Decomposer → Retrieval → Trust Updater
              → Aggregator.
            </Bullet>
            <Bullet>
              A retrieval error reaches the final answer through the trust
              score.
            </Bullet>
            <Bullet>
              The failure-isolation rule (Section 3.1.1) contains a fault to one
              component.
            </Bullet>
          </ul>
        </Card>
        <Card
          icon={<Users size="2.4cqh" color="#fff" />}
          title="P6 · Stakeholders — Not Covered"
          color={ROSE}
        >
          <ul className="flex flex-col justify-center h-full">
            <Bullet>
              No external stakeholders: only the supervisor and the examiners.
            </Bullet>
            <Bullet>
              No industry partner or community group joins design or testing.
            </Bullet>
            <Bullet>
              Engagement stays inside the university for FYDP I.
            </Bullet>
          </ul>
        </Card>
      </div>

      <div
        className="mt-[1.2cqh] rounded-xl px-[2.4cqw] py-[1.4cqh] text-[2.1cqh] font-bold"
        style={{ background: "#f1f5f9", color: DEEP_INK }}
      >
        6 of 7 P attributes are covered. P6 is the expected FYDP I gap —
        engagement stays inside the university.
      </div>
    </div>
  );
}

/* ── Slide 9: K1–K4 — Knowledge profile, part 1 ──────────────────── */
function CeKnowledgeOneSlide() {
  return (
    <div className="w-full h-full flex flex-col px-[5cqw] py-[3.5cqh]">
      <SlideHeader
        badge="K1–K8 · Knowledge Profile"
        badgeBg="#fee2e2"
        badgeColor={ROSE}
        title="Knowledge Profile — Part 1"
        subtitle="The knowledge areas every complex problem demands, and where FYDP I applies them."
      />

      <CoverageStrip items={K_MARKS} color={ROSE} />

      <div className="grid grid-cols-2 gap-[1.6cqh_2cqw] mt-[2cqh] flex-1 min-h-0">
        <Card
          icon={<FlaskConical size="2.4cqh" color="#fff" />}
          title="K1 · Natural Sciences"
          color={ACCENT}
        >
          <ul className="flex flex-col justify-center h-full">
            <Bullet>
              Answers are verified against PubMed, arXiv, Semantic Scholar and
              OpenAlex.
            </Bullet>
            <Bullet>
              The domain is natural science; no new theory is claimed.
            </Bullet>
            <Bullet>
              Scientific QA is the application domain.
            </Bullet>
          </ul>
        </Card>
        <Card
          icon={<Sigma size="2.4cqh" color="#fff" />}
          title="K2 · Mathematics"
          color={AMBER}
        >
          <ul className="flex flex-col justify-center h-full">
            <Bullet>
              Softmax, clamping and renormalization of trust.
            </Bullet>
            <Bullet>
              Trust stays a valid distribution across rounds.
            </Bullet>
            <Bullet>
              Paired bootstrap and effect sizes back the results.
            </Bullet>
          </ul>
        </Card>
        <Card
          icon={<Cog size="2.4cqh" color="#fff" />}
          title="K3 · Engineering Fundamentals"
          color={TEAL}
        >
          <ul className="flex flex-col justify-center h-full">
            <Bullet>
              System design, state machines and failure handling.
            </Bullet>
            <Bullet>
              Standard design practice guides the confidence gate.
            </Bullet>
            <Bullet>
              Failure handling is specified per component.
            </Bullet>
          </ul>
        </Card>
        <Card
          icon={<Brain size="2.4cqh" color="#fff" />}
          title="K4 · Specialist Knowledge"
          color={ROSE}
        >
          <ul className="flex flex-col justify-center h-full">
            <Bullet>
              LLMs, multi-agent debate, RAG and sycophancy.
            </Bullet>
            <Bullet>
              Three model families keep the debate heterogeneous.
            </Bullet>
            <Bullet>
              Sycophancy is the failure mode under study.
            </Bullet>
          </ul>
        </Card>
      </div>

      <div
        className="mt-[1.6cqh] text-[1.9cqh] font-semibold"
        style={{ color: DEEP_INK }}
      >
        All eight K areas are covered — K5–K8 follow.
      </div>
    </div>
  );
}

/* ── Slide 10: K5–K8 — Knowledge profile, part 2 ──────────────────── */
function CeKnowledgeTwoSlide() {
  return (
    <div className="w-full h-full flex flex-col px-[5cqw] py-[3.5cqh]">
      <SlideHeader
        badge="K1–K8 · Knowledge Profile"
        badgeBg="#fee2e2"
        badgeColor={ROSE}
        title="Knowledge Profile — Part 2"
        subtitle="The remaining knowledge areas, and why the profile is broad rather than deep."
      />

      <div className="grid grid-cols-2 gap-[1.6cqh_2cqw] flex-1 min-h-0">
        <Card
          icon={<ClipboardCheck size="2.4cqh" color="#fff" />}
          title="K5 · Engineering Methods"
          color={ACCENT}
        >
          <ul className="flex flex-col justify-center h-full">
            <Bullet>
              Controlled experiments, confidence intervals, baseline comparison
              and injection studies.
            </Bullet>
            <Bullet>
              All studies share one setup so injection effects stay comparable.
            </Bullet>
            <Bullet>
              Results are reported with confidence intervals and baselines.
            </Bullet>
          </ul>
        </Card>
        <Card
          icon={<Code size="2.4cqh" color="#fff" />}
          title="K6 · Computational Methods"
          color={TEAL}
        >
          <ul className="flex flex-col justify-center h-full">
            <Bullet>
              Python, PyTorch, vLLM, FastAPI, sentence-transformers and Git.
            </Bullet>
            <Bullet>
              The stack is inference-only — no fine-tuning, so the toolchain
              stays light.
            </Bullet>
            <Bullet>
              Cross-encoders rerank retrieved passages before the trust update.
            </Bullet>
          </ul>
        </Card>
        <Card
          icon={<FileCode size="2.4cqh" color="#fff" />}
          title="K7 · Codes and Practices"
          color={AMBER}
        >
          <ul className="flex flex-col justify-center h-full">
            <Bullet>
              JSON (RFC 8259), HTTP over TLS, the OpenAI-compatible API and
              version control.
            </Bullet>
            <Bullet>
              Result packages are validated against a JSON schema before they
              leave the framework.
            </Bullet>
            <Bullet>
              Git tracks every change to code, configs and results.
            </Bullet>
          </ul>
        </Card>
        <Card
          icon={<Globe size="2.4cqh" color="#fff" />}
          title="K8 · Research and Context"
          color={ROSE}
        >
          <ul className="flex flex-col justify-center h-full">
            <Bullet>
              Ethical bounds for AI output in scientific QA; literature review
              and gap analysis set the context.
            </Bullet>
            <Bullet>
              The journal and the independent learning record document the
              research context.
            </Bullet>
            <Bullet>
              The gap analysis links the literature directly to the
              requirements.
            </Bullet>
          </ul>
        </Card>
      </div>

      <div
        className="mt-[1.8cqh] rounded-xl px-[2.4cqw] py-[1.4cqh] text-[2.1cqh] font-bold"
        style={{ background: "#f1f5f9", color: DEEP_INK }}
      >
        The profile is broad rather than deep in one spot — K4 and K5 run
        through every chapter, K6 and K7 through the implementation.
      </div>
    </div>
  );
}

/* ── Slide 11: A1–A2 — Engineering activities, resources + interaction */
function CeActivityOneSlide() {
  return (
    <div className="w-full h-full flex flex-col px-[5cqw] py-[3.5cqh]">
      <SlideHeader
        badge="A1–A5 · Complex Engineering Activities"
        badgeBg="#fef3c7"
        badgeColor={AMBER}
        title="Engineering Activities — Resources and Interaction"
        subtitle="Two of the five activities, and the resources and interactions each demands."
      />

      <CoverageStrip items={A_MARKS} color={AMBER} />

      <div className="grid grid-cols-2 gap-[2cqw] mt-[2cqh] flex-1 min-h-0">
        <Card
          icon={<Boxes size="2.4cqh" color="#fff" />}
          title="A1 · Range of Resources"
          color={ACCENT}
        >
          <ul className="flex flex-col justify-center h-full">
            <Bullet>
              Three model family sources, four literature APIs, six team members
              and a rented Blackwell GPU.
            </Bullet>
            <Bullet>
              Chapter 3 assigns each task to a specific member with weeks and
              deliverables.
            </Bullet>
            <Bullet>
              Compute, APIs and people are all locked into that phase plan.
            </Bullet>
          </ul>
        </Card>
        <Card
          icon={<Network size="2.4cqh" color="#fff" />}
          title="A2 · Level of Interaction"
          color={TEAL}
        >
          <ul className="flex flex-col justify-center h-full">
            <Bullet>
              Every debate round calls three external model endpoints and three
              literature API endpoints.
            </Bullet>
            <Bullet>
              Communication with the rented cloud GPU, plus the shared
              repository and weekly meetings.
            </Bullet>
            <Bullet>
              Closed APIs and local vLLM models share one OpenAI-compatible
              surface.
            </Bullet>
          </ul>
        </Card>
      </div>

      <div
        className="mt-[1.6cqh] text-[1.9cqh] font-semibold"
        style={{ color: DEEP_INK }}
      >
        3 of 5 A activities are covered — A5 follows, then the A3/A4 gaps.
      </div>
    </div>
  );
}

/* ── Slide 12: A3–A5 — Activities, familiarity and gaps ──────────── */
function CeActivityTwoSlide() {
  return (
    <div className="w-full h-full flex flex-col px-[5cqw] py-[3.5cqh]">
      <SlideHeader
        badge="A1–A5 · Complex Engineering Activities"
        badgeBg="#fef3c7"
        badgeColor={AMBER}
        title="Familiarity, Innovation and Consequences"
        subtitle="A5 is claimed; A3 and A4 are marked not covered, and this is deliberate."
      />

      <div className="grid grid-cols-3 gap-[1.8cqw] flex-1 min-h-0">
        <Card
          icon={<Compass size="2.4cqh" color="#fff" />}
          title="A5 · Familiarity"
          color={TEAL}
        >
          <ul className="flex flex-col justify-center h-full">
            <Bullet>
              Multi-agent debate and evidence verification were uncharted for
              the team.
            </Bullet>
            <Bullet>
              A structured literature review and baseline study preceded
              implementation.
            </Bullet>
            <Bullet>
              Specialist reading and baseline runs closed the knowledge gap.
            </Bullet>
          </ul>
        </Card>
        <Card
          icon={<Lightbulb size="2.4cqh" color="#fff" />}
          title="A3 · Innovation — Not Covered"
          color={ROSE}
        >
          <ul className="flex flex-col justify-center h-full">
            <Bullet>
              Combines pre-existing concepts: multi-agent debate and RAG with
              trust weighting.
            </Bullet>
            <Bullet>
              No new device or theory; the step is incremental and not
              patentable.
            </Bullet>
            <Bullet>
              The combination is new to this project, not to the field.
            </Bullet>
          </ul>
        </Card>
        <Card
          icon={<Globe size="2.4cqh" color="#fff" />}
          title="A4 · Consequences — Not Covered"
          color={ROSE}
        >
          <ul className="flex flex-col justify-center h-full">
            <Bullet>
              A lab prototype, not a deployed product; no large user base.
            </Bullet>
            <Bullet>
              About 300 GPU-hours, no fine-tuning, so social and environmental
              impact stays minimal.
            </Bullet>
            <Bullet>
              No deployment means no broad societal consequences yet.
            </Bullet>
          </ul>
        </Card>
      </div>

      <div
        className="mt-[1.8cqh] rounded-xl px-[2.4cqw] py-[1.4cqh] text-[2.1cqh] font-bold"
        style={{ background: "#f1f5f9", color: DEEP_INK }}
      >
        A3 and A4 sit beyond FYDP I scope — the report marks them not covered
        rather than overclaiming.
      </div>
    </div>
  );
}

/* ── Slide 13: PO1–PO12 — Program outcomes coverage ──────────────── */
function CeOutcomesOneSlide() {
  const groups = [
    {
      title: "Covered in FYDP I",
      items: PO_TILES.filter((t) => t.ok),
      color: ACCENT,
      bg: "#eef2ff",
    },
    {
      title: "Deferred to FYDP II / III",
      items: PO_TILES.filter((t) => !t.ok),
      color: "#475569",
      bg: "#f8fafc",
    },
  ];
  return (
    <div className="w-full h-full flex flex-col px-[5cqw] py-[3.5cqh]">
      <SlideHeader
        badge="PO1–PO12 · Program Outcomes"
        badgeBg="#e0e7ff"
        badgeColor={ACCENT}
        title="Program Outcomes — FYDP I Coverage"
        subtitle="Twelve outcomes; six are addressed in FYDP I and six are scheduled for later phases."
      />

      <div className="flex items-center gap-[1.6cqw]">
        <div className="flex flex-1 gap-[0.5cqw]">
          {PO_TILES.map((t) => (
            <div
              key={t.code}
              className="flex-1 rounded-full"
              style={{
                height: "1.7cqh",
                background: t.ok ? ACCENT : "#cbd5e1",
              }}
            />
          ))}
        </div>
        <div
          className="text-[2.2cqh] font-extrabold"
          style={{ color: ACCENT }}
        >
          6/12 covered
        </div>
      </div>

      <div className="grid grid-cols-2 gap-[2cqw] mt-[2cqh] flex-1 min-h-0">
        {groups.map((g) => (
          <div
            key={g.title}
            className="rounded-xl border-2 px-[1.6cqw] py-[1.5cqh] flex flex-col"
            style={{ borderColor: g.color, background: "#ffffff" }}
          >
            <div
              className="text-[2.2cqh] font-extrabold uppercase tracking-wide"
              style={{ color: g.color }}
            >
              {g.title}
            </div>
            <div className="mt-[1.4cqh] grid grid-cols-2 gap-[1cqh_1cqw] flex-1 min-h-0">
              {g.items.map((t) => (
                <div
                  key={t.code}
                  className="rounded-lg px-[1cqw] py-[0.9cqh] flex items-center gap-[0.8cqw]"
                  style={{ background: g.bg }}
                >
                  <span
                    className="text-[2.1cqh] font-extrabold"
                    style={{ color: g.color }}
                  >
                    {t.code}
                  </span>
                  <Mark ok={t.ok} size="2cqh" />
                  <span
                    className="text-[2cqh] font-bold leading-snug"
                    style={{ color: t.ok ? NEAR_BLACK : "#64748b" }}
                  >
                    {t.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div
        className="mt-[1.6cqh] text-[1.9cqh] font-semibold"
        style={{ color: DEEP_INK }}
      >
        The six deferred outcomes belong to FYDP II and FYDP III.
      </div>
    </div>
  );
}

/* ── Slide 14: PO1–PO12 — what covers each outcome ───────────────── */
function CeOutcomesTwoSlide() {
  const rows = [
    {
      code: "PO1 · Engineering knowledge",
      icon: <BookOpen size="2.4cqh" color="#fff" />,
      color: ACCENT,
      text: "Real-life problem statement (Chapter 1)",
      sub: "Problem context is a real scientific-QA system.",
    },
    {
      code: "PO2 · Problem analysis",
      icon: <Search size="2.4cqh" color="#fff" />,
      color: AMBER,
      text: "Requirements engineering (Chapter 3)",
      sub: "Functional and non-functional requirements are specified.",
    },
    {
      code: "PO4 · Investigation",
      icon: <FlaskConical size="2.4cqh" color="#fff" />,
      color: TEAL,
      text: "Literature review and gap analysis (Chapter 2)",
      sub: "Systematic review of 2024–2026 literature.",
    },
    {
      code: "PO10 · Communication",
      icon: <MessageSquare size="2.4cqh" color="#fff" />,
      color: ACCENT,
      text: "Interim report and oral presentation",
      sub: "Written report plus this defence deck.",
    },
    {
      code: "PO11 · Project management",
      icon: <Calendar size="2.4cqh" color="#fff" />,
      color: AMBER,
      text: "Timeline and budget (Chapter 5)",
      sub: "Budget tracks GPU hours per phase.",
    },
    {
      code: "PO12 · Life-long learning",
      icon: <GraduationCap size="2.4cqh" color="#fff" />,
      color: TEAL,
      text: "Journal write-up and independent learning record",
      sub: "Independent learning record accompanies the journal.",
    },
  ];
  return (
    <div className="w-full h-full flex flex-col px-[5cqw] py-[3.5cqh]">
      <SlideHeader
        badge="PO1–PO12 · Program Outcomes"
        badgeBg="#e0e7ff"
        badgeColor={ACCENT}
        title="What Covers Each FYDP I Outcome"
        subtitle="Each addressed outcome maps to a concrete FYDP I deliverable."
      />

      <div className="grid grid-cols-3 grid-rows-2 gap-[1.4cqh_1.6cqw] flex-1 min-h-0">
        {rows.map((r) => (
          <Card key={r.code} icon={r.icon} title={r.code} color={r.color}>
            <div className="flex flex-col justify-center h-full gap-[1cqh]">
              <div className="flex items-center gap-[0.9cqw]">
                <ArrowRight
                  size="2.4cqh"
                  style={{ color: r.color }}
                  className="flex-shrink-0"
                />
                <span
                  className="text-[2.3cqh] font-semibold leading-snug"
                  style={{ color: NEAR_BLACK }}
                >
                  {r.text}
                </span>
              </div>
              <div
                className="pl-[3.3cqw] text-[1.9cqh] font-medium leading-snug"
                style={{ color: "#475569" }}
              >
                {r.sub}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div
        className="mt-[1.6cqh] text-[1.9cqh] font-semibold"
        style={{ color: DEEP_INK }}
      >
        PO3, PO5–PO9 are scheduled for FYDP II and FYDP III.
      </div>
    </div>
  );
}

/* ── Slide 15: Overall FYDP I mapping matrix ─────────────────────── */
function CeMatrixSlide() {
  return (
    <div className="w-full h-full flex flex-col px-[4cqw] py-[3cqh]">
      <SlideHeader
        badge="Overall Mapping · FYDP I"
        badgeBg="#e0e7ff"
        badgeColor={ACCENT}
        title="FYDP I Against Every Attribute"
        subtitle="Program Outcomes · Knowledge Profile · Complex Engineering Problem Solving · Complex Engineering Activities"
      />

      <table
        className="w-full border-collapse"
        style={{ tableLayout: "fixed" }}
      >
        <colgroup>
          <col style={{ width: "9cqw" }} />
          {MATRIX_GROUPS.flatMap((g) =>
            g.items.map((it) => <col key={it.code} />),
          )}
        </colgroup>
        <thead>
          <tr>
            <th
              rowSpan={3}
              className="align-middle text-[2.1cqh] font-extrabold uppercase tracking-wide"
              style={{
                border: "2px solid #94a3b8",
                background: "#0f172a",
                color: "#ffffff",
              }}
            >
              Attributes
            </th>
            {MATRIX_GROUPS.map((g) => (
              <th
                key={g.title}
                colSpan={g.items.length}
                className="px-[0.4cqw] py-[1.8cqh] text-[1.85cqh] font-extrabold leading-tight"
                style={{
                  border: "2px solid #94a3b8",
                  background: g.bg,
                  color: g.color,
                }}
              >
                {g.title}
              </th>
            ))}
          </tr>
          <tr>
            {MATRIX_GROUPS.flatMap((g) =>
              g.items.map((it) => (
                <th
                  key={it.code}
                  className="py-[1.1cqh] text-[1.9cqh] font-bold"
                  style={{
                    border: "1.5px solid #cbd5e1",
                    background: "#ffffff",
                    color: g.color,
                  }}
                >
                  {it.code}
                </th>
              )),
            )}
          </tr>
          <tr style={{ height: "40cqh" }}>
            {MATRIX_GROUPS.flatMap((g) =>
              g.items.map((it) => (
                <td
                  key={it.code}
                  className="align-middle text-center"
                  style={{
                    border: "1.5px solid #cbd5e1",
                    background: "#ffffff",
                  }}
                >
                  <div
                    className="mx-auto text-[2cqh] font-semibold leading-tight"
                    style={{
                      writingMode: "vertical-rl",
                      transform: "rotate(180deg)",
                      color: g.color,
                    }}
                  >
                    {it.name}
                  </div>
                </td>
              )),
            )}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td
              className="text-center text-[2.2cqh] font-extrabold"
              style={{
                border: "2px solid #94a3b8",
                background: "#0f172a",
                color: "#ffffff",
              }}
            >
              FYDP I
            </td>
            {MATRIX_GROUPS.flatMap((g) =>
              g.items.map((it) => (
                <td
                  key={it.code}
                  className="py-[2.6cqh] text-center"
                  style={{
                    border: "1.5px solid #cbd5e1",
                    background: it.ok ? "#f0fdfa" : "#fef2f2",
                  }}
                >
                  <Mark ok={it.ok} size="3cqh" />
                </td>
              )),
            )}
          </tr>
          <tr>
            <td
              className="py-[1.1cqh] text-center text-[2cqh] font-extrabold"
              style={{
                border: "2px solid #94a3b8",
                background: "#f1f5f9",
                color: DEEP_INK,
              }}
            >
              Covered
            </td>
            {MATRIX_GROUPS.map((g) => (
              <td
                key={g.title}
                colSpan={g.items.length}
                className="py-[1.1cqh] text-center text-[2.1cqh] font-extrabold"
                style={{
                  border: "1.5px solid #cbd5e1",
                  background: "#f8fafc",
                  color: g.color,
                }}
              >
                {g.items.filter((it) => it.ok).length}/{g.items.length}
              </td>
            ))}
          </tr>
        </tbody>
      </table>

      <div className="mt-[3cqh] flex items-center justify-between">
        <div
          className="flex items-center gap-[1.6cqw] text-[2.3cqh] font-semibold"
          style={{ color: DEEP_INK }}
        >
          <span className="flex items-center gap-[0.5cqw]">
            <Mark ok={true} size="2.2cqh" /> covered
          </span>
          <span className="flex items-center gap-[0.5cqw]">
            <Mark ok={false} size="2.2cqh" /> not covered / deferred
          </span>
          <span style={{ color: "#64748b" }}>Group 6 · Phantom Devs</span>
        </div>
        <div className="flex items-center gap-[1.6cqw] text-[2.4cqh] font-extrabold">
          <span style={{ color: TEAL }}>P 6/7</span>
          <span style={{ color: ROSE }}>K 8/8</span>
          <span style={{ color: AMBER }}>A 3/5</span>
          <span style={{ color: ACCENT }}>PO 6/12</span>
        </div>
      </div>
    </div>
  );
}

/* ── Slide 16: Thank you ─────────────────────────────────────────── */
function ThankYouSlide() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center px-[8cqw] text-center">
      <h1
        className="text-[10cqh] font-extrabold leading-none"
        style={{ color: NEAR_BLACK }}
      >
        Thank You
      </h1>
      <div
        className="mt-[3cqh] text-[3.2cqh] font-bold"
        style={{ color: ACCENT }}
      >
        Group 6 · Phantom Devs
      </div>
      <div
        className="mt-[1cqh] text-[2.5cqh] font-semibold"
        style={{ color: DEEP_INK }}
      >
        Trust-Calibrated Multi-Agent Scientific Deliberation
      </div>
      <div
        className="mt-[4cqh] text-[2.3cqh] font-medium"
        style={{ color: "#475569" }}
      >
        Questions &amp; Discussion Welcome
      </div>
    </div>
  );
}

const SLIDES = [
  GroupSlide,
  ImadSlideOne,
  ImadSlideTwo,
  CeOverviewSlide,
  CeDefinitionsSlide,
  CeScoreboardSlide,
  CeProblemOneSlide,
  CeProblemTwoSlide,
  CeKnowledgeOneSlide,
  CeKnowledgeTwoSlide,
  CeActivityOneSlide,
  CeActivityTwoSlide,
  CeOutcomesOneSlide,
  CeOutcomesTwoSlide,
  CeMatrixSlide,
  ThankYouSlide,
];

export function SlidePage() {
  const [index, setIndex] = useState(0);
  const [isFs, setIsFs] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const go = useCallback((dir: number) => {
    setIndex((i) => Math.min(SLIDES.length - 1, Math.max(0, i + dir)));
  }, []);

  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowRight":
        case "PageDown":
        case " ":
          e.preventDefault();
          go(1);
          break;
        case "ArrowLeft":
        case "PageUp":
          e.preventDefault();
          go(-1);
          break;
        case "Home":
          e.preventDefault();
          setIndex(0);
          break;
        case "End":
          e.preventDefault();
          setIndex(SLIDES.length - 1);
          break;
        case "f":
        case "F":
          e.preventDefault();
          toggleFullscreen();
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, toggleFullscreen]);

  useEffect(() => {
    const onFsChange = () => setIsFs(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  const Slide = SLIDES[index];

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
      style={{ background: "#1e293b" }}
    >
      {/* 16:9 slide canvas — fills height, letterboxes width */}
      <div
        className="relative bg-white shadow-2xl"
        style={{
          aspectRatio: "16 / 9",
          width: "min(100vw, calc(100vh * 16 / 9))",
          height: "min(100vh, calc(100vw * 9 / 16))",
          containerType: "size",
        }}
      >
        <div key={index} className="w-full h-full animate-fade-in">
          <Slide />
        </div>
      </div>

      {/* Fullscreen toggle — only shown when NOT in fullscreen (use Esc / F to exit) */}
      {!isFs && (
        <button
          onClick={toggleFullscreen}
          title="Enter fullscreen (F)"
          aria-label="Enter fullscreen"
          className="fixed top-4 right-4 z-[110] flex items-center justify-center w-11 h-11 rounded-lg border-0 cursor-pointer text-white/80 hover:text-white"
          style={{ background: "rgba(15,23,42,0.6)" }}
        >
          <Maximize size={20} />
        </button>
      )}

      {/* One-time hint (does not print/interfere) */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[110] text-[13px] font-medium text-white/50 select-none pointer-events-none">
        ← → to navigate · F for fullscreen
      </div>
    </div>
  );
}
