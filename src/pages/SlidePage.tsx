import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Brain,
  Crown,
  Layers,
  Link2,
  Maximize,
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
    <div className="w-full h-full flex flex-col justify-center px-[7cqw] py-[5cqh]">
      <div className="text-center mb-[4cqh]">
        <div
          className="inline-block rounded-full px-[2.4cqw] py-[0.9cqh] text-[1.9cqh] font-bold uppercase tracking-[0.18em]"
          style={{ background: ACCENT, color: "#ffffff" }}
        >
          CSE 4000A (B) · Final Year Design Project – I · Section B
        </div>
        <h1
          className="mt-[3.2cqh] text-[6.2cqh] font-extrabold leading-tight"
          style={{ color: NEAR_BLACK }}
        >
          Literature Review Presentation
        </h1>
        <div
          className="mt-[1.6cqh] flex items-center justify-center gap-[2cqw] text-[3cqh] font-bold"
          style={{ color: DEEP_INK }}
        >
          <span
            className="rounded-lg px-[2cqw] py-[0.6cqh]"
            style={{ background: "#e0e7ff", color: ACCENT }}
          >
            Group No. 6
          </span>
          <span className="flex items-center gap-[0.8cqw]">
            <Users size="2.8cqh" style={{ color: ACCENT }} />
            Team&nbsp;<span style={{ color: ACCENT }}>Phantom Devs</span>
          </span>
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
    <li className="flex items-start gap-[0.9cqw] mb-[1cqh] last:mb-0">
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
          <ul className="flex flex-col justify-between h-full">
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
          <ul className="flex flex-col justify-between h-full">
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

/* ── Slide 4: ConsensAgent — Summary + Method + Results ──────────── */
function ConsensSlideOne() {
  return (
    <div className="w-full h-full flex flex-col px-[5cqw] py-[3.5cqh]">
      {/* Header */}
      <div className="mb-[2.2cqh]">
        <div
          className="inline-block rounded px-[1.6cqw] py-[0.5cqh] text-[1.9cqh] font-bold uppercase tracking-wider"
          style={{ background: "#ccfbf1", color: TEAL }}
        >
          Paper Review · Nearest Neighbor
        </div>
        <h1
          className="mt-[1.2cqh] text-[4.4cqh] font-extrabold leading-tight"
          style={{ color: NEAR_BLACK }}
        >
          CONSENSAGENT: Efficient &amp; Effective Consensus via Sycophancy
          Mitigation
        </h1>
        <div
          className="mt-[0.8cqh] flex flex-wrap items-center gap-x-[2cqw] gap-y-[0.4cqh] text-[2.3cqh] font-semibold"
          style={{ color: DEEP_INK }}
        >
          <span>Priya Pitre, Naren Ramakrishnan, Xuan Wang · 2025</span>
          <span style={{ color: "#94a3b8" }}>|</span>
          <span className="flex items-center gap-[0.5cqw]">
            <BarChart3 size="2.3cqh" style={{ color: TEAL }} />
            Findings of ACL 2025
          </span>
          <span style={{ color: "#94a3b8" }}>|</span>
          <span
            className="flex items-center gap-[0.5cqw]"
            style={{ color: ACCENT }}
          >
            <Link2 size="2.3cqh" />
            aclanthology.org/2025.findings-acl.1141
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
              <b>First to study sycophancy inside multi-agent debate</b> — agents
              copy/swap answers instead of reasoning.
            </Bullet>
            <Bullet>
              The correct answer is present but <b>ignored in &gt;20%</b> of
              wrong-answer cases — lost to conformity.
            </Bullet>
            <Bullet>
              A <b>trigger</b> detects stalling or copying (explanation cosine
              similarity &gt; 0.8).
            </Bullet>
            <Bullet>
              On trigger, a fine-tuned GPT-4o <b>rewrites the task prompt</b> to
              remove ambiguity → re-debate.
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
                ↓ 7–30%
              </div>
              <div
                className="text-[2.3cqh] font-semibold"
                style={{ color: NEAR_BLACK }}
              >
                less sycophancy
              </div>
            </div>
            <div className="text-center">
              <div
                className="text-[7cqh] font-extrabold leading-none"
                style={{ color: ACCENT }}
              >
                SOTA
              </div>
              <div
                className="text-[2.3cqh] font-semibold"
                style={{ color: NEAR_BLACK }}
              >
                on all 6 datasets
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
                consensus in 1–2 rounds
              </div>
              <div
                className="text-[2cqh] font-bold leading-snug"
                style={{ color: DEEP_INK }}
              >
                KITAB · CLUTRR · HotpotQA
                <br />
                Ethics · GSM8K · TriviaQA
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
          Four-Phase Pipeline
        </div>
        <div className="flex items-stretch gap-[0.6cqw]">
          {[
            "Independent answers + confidence",
            "Multi-round debate",
            "Trigger: stall / sycophancy?",
            "Prompt optimization (fine-tuned GPT-4o)",
            "Team answer (confidence + consistency)",
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

/* ── Slide 5: ConsensAgent — Relevance + Gap ─────────────────────── */
function ConsensSlideTwo() {
  return (
    <div className="w-full h-full flex flex-col px-[5cqw] py-[3.5cqh]">
      <div className="mb-[2cqh]">
        <div
          className="inline-block rounded px-[1.6cqw] py-[0.5cqh] text-[1.9cqh] font-bold uppercase tracking-wider"
          style={{ background: "#ccfbf1", color: TEAL }}
        >
          ConsensAgent · Relevance &amp; Gap
        </div>
        <h1
          className="mt-[1cqh] text-[4.2cqh] font-extrabold leading-tight"
          style={{ color: NEAR_BLACK }}
        >
          Our Closest Competitor — Same Problem, Different Fix
        </h1>
      </div>

      <div className="grid grid-cols-2 gap-[2cqw] flex-1 min-h-0">
        <Card
          icon={<Target size="2.4cqh" color="#fff" />}
          title="Relevant to Our Idea"
          color={ACCENT}
        >
          <ul className="flex flex-col justify-between h-full">
            <Bullet>
              Our <b>nearest published neighbor</b> — same target: sycophantic
              collapse in debate.
            </Bullet>
            <Bullet>
              Shares our motivation: a <b>correct minority is overwhelmed</b> by
              a confident majority.
            </Bullet>
            <Bullet>
              Its <b>&gt;20% correct-but-ignored</b> finding is our strongest
              empirical hook.
            </Bullet>
            <Bullet>
              Its sycophancy metric (copy/swap via cosine similarity) is a{" "}
              <b>ready baseline</b> for our eval harness.
            </Bullet>
            <Bullet>
              Beats strong baselines including <b>ReConcile</b> — a likely
              baseline for us too.
            </Bullet>
          </ul>
        </Card>

        <Card
          icon={<AlertTriangle size="2.4cqh" color="#fff" />}
          title="Gap / Limitations"
          color={ROSE}
        >
          <ul className="flex flex-col justify-between h-full">
            <Bullet>
              Fixes sycophancy <b>indirectly</b> — rewrites the prompt{" "}
              <b>before</b> debate, no in-debate trust weighting.
            </Bullet>
            <Bullet>
              Fails when the prompt is <b>clear but the majority is confidently
              wrong</b>.
            </Bullet>
            <Bullet>
              Final vote still uses <b>self-reported confidence</b> — the
              manipulable signal.
            </Bullet>
            <Bullet>
              Needs a <b>per-dataset fine-tuned</b> GPT-4o + labeled samples.
            </Bullet>
            <Bullet>
              Authors admit it treats the <b>symptom, not the root cause</b>.
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
            We calibrate trust <i>during</i> the debate using external retrieved
            evidence — not pre-debate prompt clarity or self-reported confidence.
            Prompt clarification ≠ agent trust calibration.
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Slide 6: DebUnc — Summary + Method + Results ────────────────── */
function DebUncSlideOne() {
  return (
    <div className="w-full h-full flex flex-col px-[5cqw] py-[3.5cqh]">
      <div className="mb-[2.2cqh]">
        <div
          className="inline-block rounded px-[1.6cqw] py-[0.5cqh] text-[1.9cqh] font-bold uppercase tracking-wider"
          style={{ background: "#ccfbf1", color: TEAL }}
        >
          Paper Review · Closest on Mechanism
        </div>
        <h1
          className="mt-[1.2cqh] text-[4.4cqh] font-extrabold leading-tight"
          style={{ color: NEAR_BLACK }}
        >
          DebUnc: LLM Agent Communication with Uncertainty Metrics
        </h1>
        <div
          className="mt-[0.8cqh] flex flex-wrap items-center gap-x-[2cqw] gap-y-[0.4cqh] text-[2.3cqh] font-semibold"
          style={{ color: DEEP_INK }}
        >
          <span>Luke Yoffe, Alfonso Amayuelas, William Yang Wang · 2025</span>
          <span style={{ color: "#94a3b8" }}>|</span>
          <span className="flex items-center gap-[0.5cqw]">
            <BarChart3 size="2.3cqh" style={{ color: TEAL }} />
            Findings of EMNLP 2025
          </span>
          <span style={{ color: "#94a3b8" }}>|</span>
          <span
            className="flex items-center gap-[0.5cqw]"
            style={{ color: ACCENT }}
          >
            <Link2 size="2.3cqh" />
            aclanthology.org/2025.findings-emnlp.1265
          </span>
        </div>
      </div>

      <div className="grid grid-cols-[1.55fr_1fr] gap-[2cqw] flex-1 min-h-0">
        <Card
          icon={<Brain size="2.4cqh" color="#fff" />}
          title="What It Does"
          color={ACCENT}
        >
          <ul>
            <Bullet>
              In debate, a <b>confidently-wrong</b> agent misleads peers who{" "}
              <b>can't tell how confident</b> each other is.
            </Bullet>
            <Bullet>
              Measures each agent's confidence with a{" "}
              <b>token-level uncertainty metric</b> (entropy / TokenSAR).
            </Bullet>
            <Bullet>
              Shares confidence two ways: <b>in the prompt</b> (1–10 score) or by{" "}
              <b>attention-scaling</b> peer tokens.
            </Bullet>
            <Bullet>
              Attention-scaling <b>beats</b> prompt-based; both beat standard
              debate.
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
                className="text-[6.5cqh] font-extrabold leading-none"
                style={{ color: TEAL }}
              >
                0.63 → 0.73
              </div>
              <div
                className="text-[2.3cqh] font-semibold"
                style={{ color: NEAR_BLACK }}
              >
                avg accuracy with a perfect signal
              </div>
            </div>
            <div
              className="text-center rounded-lg py-[1.2cqh] px-[1cqw]"
              style={{ background: "#fef2f2" }}
            >
              <div
                className="text-[1.7cqh] font-bold uppercase tracking-wide mb-[0.5cqh]"
                style={{ color: ROSE }}
              >
                The Ground-Truth Oracle
              </div>
              <div
                className="text-[2.1cqh] font-bold leading-snug"
                style={{ color: DEEP_INK }}
              >
                A signal that knows correctness gains
                <b> +10%</b> — but needs the answer, so it
                <b> can't be deployed</b>.
              </div>
            </div>
            <div
              className="text-center text-[1.9cqh] font-semibold"
              style={{ color: "#475569" }}
            >
              MMLU · GSM8K · TruthfulQA · Arithmetic
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-[2cqh]">
        <div
          className="text-[2.1cqh] font-extrabold uppercase tracking-wide mb-[1cqh]"
          style={{ color: AMBER }}
        >
          Per-Round Pipeline
        </div>
        <div className="flex items-stretch gap-[0.6cqw]">
          {[
            "Agents answer",
            "Measure uncertainty (entropy / TokenSAR)",
            "Convert to 1–10 confidence",
            "Communicate: prompt or attention-scaling",
            "Peers weight confident agents more",
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

/* ── Slide 7: DebUnc — Relevance + Gap ───────────────────────────── */
function DebUncSlideTwo() {
  return (
    <div className="w-full h-full flex flex-col px-[5cqw] py-[3.5cqh]">
      <div className="mb-[2cqh]">
        <div
          className="inline-block rounded px-[1.6cqw] py-[0.5cqh] text-[1.9cqh] font-bold uppercase tracking-wider"
          style={{ background: "#ccfbf1", color: TEAL }}
        >
          DebUnc · Relevance &amp; Gap
        </div>
        <h1
          className="mt-[1cqh] text-[4.2cqh] font-extrabold leading-tight"
          style={{ color: NEAR_BLACK }}
        >
          Right Lever, Wrong Signal — Confidence Isn't Correctness
        </h1>
      </div>

      <div className="grid grid-cols-2 gap-[2cqw] flex-1 min-h-0">
        <Card
          icon={<Target size="2.4cqh" color="#fff" />}
          title="Relevant to Our Idea"
          color={ACCENT}
        >
          <ul className="flex flex-col justify-between h-full">
            <Bullet>
              <b>Closest on mechanism</b> — reweights agent influence{" "}
              <b>during</b> the debate, exactly like our TCM.
            </Bullet>
            <Bullet>
              Same diagnosis: a confident agent shouldn't automatically win.
            </Bullet>
            <Bullet>
              Its <b>Ground-Truth oracle</b> is our strongest proof that a
              better-than-self-reported signal is the key.
            </Bullet>
            <Bullet>
              Confidence-in-prompt mode is <b>API-portable</b> → a clean baseline
              (B-DebUnc).
            </Bullet>
          </ul>
        </Card>

        <Card
          icon={<AlertTriangle size="2.4cqh" color="#fff" />}
          title="Gap / Limitations"
          color={ROSE}
        >
          <ul className="flex flex-col justify-between h-full">
            <Bullet>
              Trust signal is <b>internal &amp; self-reported</b> — reflects how
              a model <i>feels</i>, not whether it's <i>right</i>.
            </Bullet>
            <Bullet>
              A <b>confidently-wrong</b> agent still earns high influence.
            </Bullet>
            <Bullet>
              Attention-scaling needs <b>white-box</b> model access — no closed
              APIs.
            </Bullet>
            <Bullet>
              Authors admit the ceiling is set by the{" "}
              <b>uncertainty metric's quality</b>.
            </Bullet>
            <Bullet>
              <b>No external verification</b> anywhere in the loop.
            </Bullet>
          </ul>
        </Card>
      </div>

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
            We replace internal self-confidence with an external,
            evidence-grounded trust score — the deployable instantiation of
            DebUnc's Ground-Truth oracle.
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Slide 8: MoA — Summary + Method + Results ───────────────────── */
function MoaSlideOne() {
  return (
    <div className="w-full h-full flex flex-col px-[5cqw] py-[3.5cqh]">
      <div className="mb-[2.2cqh]">
        <div
          className="inline-block rounded px-[1.6cqw] py-[0.5cqh] text-[1.9cqh] font-bold uppercase tracking-wider"
          style={{ background: "#e0e7ff", color: ACCENT }}
        >
          Paper Review · Foundational Architecture
        </div>
        <h1
          className="mt-[1.2cqh] text-[4.4cqh] font-extrabold leading-tight"
          style={{ color: NEAR_BLACK }}
        >
          Mixture-of-Agents Enhances Large Language Model Capabilities
        </h1>
        <div
          className="mt-[0.8cqh] flex flex-wrap items-center gap-x-[2cqw] gap-y-[0.4cqh] text-[2.3cqh] font-semibold"
          style={{ color: DEEP_INK }}
        >
          <span>Junlin Wang et al. (Together AI) · 2025</span>
          <span style={{ color: "#94a3b8" }}>|</span>
          <span className="flex items-center gap-[0.5cqw]">
            <BarChart3 size="2.3cqh" style={{ color: ACCENT }} />
            ICLR 2025 (Poster)
          </span>
          <span style={{ color: "#94a3b8" }}>|</span>
          <span
            className="flex items-center gap-[0.5cqw]"
            style={{ color: ACCENT }}
          >
            <Link2 size="2.3cqh" />
            arxiv.org/abs/2406.04692
          </span>
        </div>
      </div>

      <div className="grid grid-cols-[1.55fr_1fr] gap-[2cqw] flex-1 min-h-0">
        <Card
          icon={<Brain size="2.4cqh" color="#fff" />}
          title="What It Does"
          color={ACCENT}
        >
          <ul>
            <Bullet>
              LLMs are <b>collaborative</b> — a model answers better when shown
              other models' outputs, even weaker ones.
            </Bullet>
            <Bullet>
              <b>Layered pipeline</b>: proposer LLMs generate → an aggregator LLM
              synthesizes → repeat across layers.
            </Bullet>
            <Bullet>
              <b>No fine-tuning</b> — pure prompting with off-the-shelf models.
            </Bullet>
            <Bullet>
              An ensemble-by-synthesis, <b>not a debate</b> — proposers never
              revise in response to peers.
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
                65.1%
              </div>
              <div
                className="text-[2.3cqh] font-semibold"
                style={{ color: NEAR_BLACK }}
              >
                AlpacaEval 2.0 (open-source only)
              </div>
            </div>
            <div className="text-center">
              <div
                className="text-[4cqh] font-extrabold leading-none"
                style={{ color: ACCENT }}
              >
                &gt; GPT-4 Omni
              </div>
              <div
                className="text-[2.1cqh] font-semibold"
                style={{ color: NEAR_BLACK }}
              >
                57.5% — beaten at ~2× lower cost
              </div>
            </div>
            <div
              className="text-center rounded-lg py-[0.9cqh] px-[1cqw] text-[2cqh] font-bold"
              style={{ background: "#f1f5f9", color: DEEP_INK }}
            >
              More diverse proposers → monotonically better
              <br />
              (n=1 → 6 : 47.8% → 61.3%)
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-[2cqh]">
        <div
          className="text-[2.1cqh] font-extrabold uppercase tracking-wide mb-[1cqh]"
          style={{ color: AMBER }}
        >
          Layered Architecture
        </div>
        <div className="flex items-stretch gap-[0.6cqw]">
          {[
            "Layer 1 proposers answer",
            "Concatenate all outputs",
            "Aggregator synthesizes",
            "Feed into next layer",
            "Final aggregator → answer",
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

/* ── Slide 9: MoA — Relevance + Gap ──────────────────────────────── */
function MoaSlideTwo() {
  return (
    <div className="w-full h-full flex flex-col px-[5cqw] py-[3.5cqh]">
      <div className="mb-[2cqh]">
        <div
          className="inline-block rounded px-[1.6cqw] py-[0.5cqh] text-[1.9cqh] font-bold uppercase tracking-wider"
          style={{ background: "#e0e7ff", color: ACCENT }}
        >
          MoA · Relevance &amp; Gap
        </div>
        <h1
          className="mt-[1cqh] text-[4.2cqh] font-extrabold leading-tight"
          style={{ color: NEAR_BLACK }}
        >
          Aggregation Works — But It's Trust-Blind and Evidence-Free
        </h1>
      </div>

      <div className="grid grid-cols-2 gap-[2cqw] flex-1 min-h-0">
        <Card
          icon={<Target size="2.4cqh" color="#fff" />}
          title="Relevant to Our Idea"
          color={ACCENT}
        >
          <ul className="flex flex-col justify-between h-full">
            <Bullet>
              The canonical proof that <b>multi-model aggregation works</b> —
              motivates using multiple agents at all.
            </Bullet>
            <Bullet>
              <b>Diversity helps</b>: more varied proposers give better answers.
            </Bullet>
            <Bullet>
              Defines the <b>trust-blind baseline</b> our mechanism improves on.
            </Bullet>
            <Bullet>
              A different paradigm (ensemble, not debate) → cited as{" "}
              <b>context</b>, not a competitor.
            </Bullet>
          </ul>
        </Card>

        <Card
          icon={<AlertTriangle size="2.4cqh" color="#fff" />}
          title="Gap / Limitations"
          color={ROSE}
        >
          <ul className="flex flex-col justify-between h-full">
            <Bullet>
              <b>No per-agent trust</b> — every proposer's text enters on equal
              footing.
            </Bullet>
            <Bullet>
              <b>No external evidence</b> — the aggregator uses only its own
              judgment.
            </Bullet>
            <Bullet>
              A weak aggregator <b>degrades</b> everything (e.g. 60.6% → 45.0%).
            </Bullet>
            <Bullet>
              Cannot detect or down-weight a <b>confidently-wrong</b> proposer.
            </Bullet>
            <Bullet>
              Feed-forward → <b>can't model</b> round-over-round sycophancy.
            </Bullet>
          </ul>
        </Card>
      </div>

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
            We add what MoA lacks: an explicit, evidence-grounded trust weight per
            agent — so a confidently-wrong proposer is down-weighted, not blindly
            synthesized in.
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Slide 10: Thank you ─────────────────────────────────────────── */
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
  ConsensSlideOne,
  ConsensSlideTwo,
  DebUncSlideOne,
  DebUncSlideTwo,
  MoaSlideOne,
  MoaSlideTwo,
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

        {/* Slide counter (bottom-right, subtle) */}
        <div
          className="absolute bottom-[2cqh] right-[2.5cqw] text-[2cqh] font-bold tabular-nums select-none"
          style={{ color: "#94a3b8" }}
        >
          {index + 1} / {SLIDES.length}
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
