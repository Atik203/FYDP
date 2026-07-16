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
              className="text-center text-[2.2cqh] font-bold rounded-lg py-[0.8cqh]"
              style={{ background: "#f1f5f9", color: DEEP_INK }}
            >
              across 6 QA / VQA datasets
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
          <ul>
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
              So it stays exposed to <b>sycophantic collapse</b>: a correct
              minority gives in to a confident wrong majority.
            </Bullet>
          </ul>
        </Card>

        <Card
          icon={<AlertTriangle size="2.4cqh" color="#fff" />}
          title="Gap / Limitations"
          color={ROSE}
        >
          <ul>
            <Bullet>
              Classifier trained <b>offline &amp; fixed</b> — cannot adapt to
              model drift or new domains.
            </Bullet>
            <Bullet>
              <b>Black-box API</b> limits: no streaming / token-level monitoring
              (left as future work).
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

/* ── Slide 4: Thank you ──────────────────────────────────────────── */
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

const SLIDES = [GroupSlide, ImadSlideOne, ImadSlideTwo, ThankYouSlide];

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
