import { useState } from "react";
import {
  BookOpen,
  Brain,
  ChevronLeft,
  ChevronRight,
  FileSearch,
  Gavel,
  HelpCircle,
  RefreshCw,
  Scale,
  Sparkles,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Guided, one-stage-at-a-time walkthrough of the worked example from
 * Blueprint §14: "Does Drug X lower blood pressure in adults over 60?"
 * Each step shows the concrete data flowing through that pipeline stage,
 * so a reader can trace exactly how a correct minority survives.
 */

interface Step {
  icon: LucideIcon;
  title: string;
  plain: string; // easy-English summary
  color: string;
  body: React.ReactNode;
}

const A = "#7c3aed";
const B = "#1c7ed6";
const C = "#0ca678";

function AgentLine({
  color,
  name,
  text,
  tag,
}: {
  color: string;
  name: string;
  text: string;
  tag?: string;
}) {
  return (
    <div className="flex items-start gap-2 text-xs">
      <span
        className="mt-0.5 inline-flex items-center justify-center w-14 flex-shrink-0 rounded px-1 py-0.5 font-bold text-white text-[10px]"
        style={{ background: color }}
      >
        {name}
      </span>
      <span className="text-[#334155] dark:text-[#cbd5e1] leading-relaxed">
        {text}
        {tag && (
          <span
            className="ml-1.5 inline-block rounded px-1 py-0.5 text-[9px] font-bold uppercase"
            style={{ color, background: `${color}1f` }}
          >
            {tag}
          </span>
        )}
      </span>
    </div>
  );
}

const STEPS: Step[] = [
  {
    icon: HelpCircle,
    title: "1 · Question In",
    plain: "A hard science question enters the system with no answer yet.",
    color: "#1c7ed6",
    body: (
      <div className="text-sm text-[#334155] dark:text-[#cbd5e1]">
        <div className="rounded-lg border border-[#1c7ed6]/30 bg-[#1c7ed6]/5 p-3 font-medium">
          “Does Drug X lower blood pressure in adults over 60?”
        </div>
        <p className="text-xs text-[#64748b] dark:text-[#94a3b8] mt-2">
          The ground-truth answer is kept hidden from the agents — it is only
          used later by the evaluation harness.
        </p>
      </div>
    ),
  },
  {
    icon: Brain,
    title: "2 · Confidence Gate",
    plain: "A quick check asks: is this easy enough to answer without a debate?",
    color: "#f08c00",
    body: (
      <div className="text-sm">
        <div className="flex flex-wrap gap-2 mb-2">
          <span className="rounded px-2 py-1 text-xs bg-[#e2e8f0] dark:bg-[rgba(255,255,255,0.08)] line-through opacity-60">
            Confident → direct answer
          </span>
          <span className="rounded px-2 py-1 text-xs font-bold text-white bg-[#f08c00]">
            Uncertain → run full debate ✓
          </span>
        </div>
        <p className="text-xs text-[#64748b] dark:text-[#94a3b8]">
          The three agents disagree on a first quick pass, so the gate routes
          the question into the full evidence-grounded debate.
        </p>
      </div>
    ),
  },
  {
    icon: Users,
    title: "3 · Round 0 — Positions",
    plain: "Three different AI models each give an independent first answer.",
    color: "#7c3aed",
    body: (
      <div className="space-y-2">
        <AgentLine color={A} name="A · Qwen3.6" text="Yes — significant effect." tag="Answer X" />
        <AgentLine color={B} name="B · Gemma 4" text="No effect found." tag="Answer X" />
        <AgentLine
          color={C}
          name="C · Mistral"
          text="Yes, but only in a specific subgroup."
          tag="Answer Y"
        />
        <p className="text-[11px] text-[#64748b] dark:text-[#94a3b8] pt-1">
          Each agent starts with an equal trust score of 1/3.
        </p>
      </div>
    ),
  },
  {
    icon: FileSearch,
    title: "4 · Claim Decomposition",
    plain: "Each answer is broken into small, checkable factual statements.",
    color: "#3b5bdb",
    body: (
      <div className="space-y-1.5 text-xs text-[#334155] dark:text-[#cbd5e1]">
        <div className="rounded bg-[#f0f2f7] dark:bg-[rgba(255,255,255,0.04)] p-2">
          <code className="text-[11px]">c1</code> — Drug X reduces blood pressure
          <span className="text-[#94a3b8]"> (the effect)</span>
        </div>
        <div className="rounded bg-[#f0f2f7] dark:bg-[rgba(255,255,255,0.04)] p-2">
          <code className="text-[11px]">c2</code> — The effect holds for everyone
          over 60 <span className="text-[#94a3b8]">(the scope)</span>
        </div>
        <div className="rounded bg-[#f0f2f7] dark:bg-[rgba(255,255,255,0.04)] p-2">
          <code className="text-[11px]">c3</code> — The effect is limited to one
          subgroup <span className="text-[#94a3b8]">(C's qualifier)</span>
        </div>
      </div>
    ),
  },
  {
    icon: BookOpen,
    title: "5 · Source-Partitioned Retrieval",
    plain: "Each agent's claims are looked up in a different research database.",
    color: "#0ca678",
    body: (
      <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
        {[
          { name: "Agent A", db: "PubMed", color: A },
          { name: "Agent B", db: "ArXiv", color: B },
          { name: "Agent C", db: "Semantic Scholar", color: C },
        ].map((r) => (
          <div
            key={r.name}
            className="rounded-lg border p-2"
            style={{ borderColor: `${r.color}44`, background: `${r.color}0f` }}
          >
            <div className="font-bold" style={{ color: r.color }}>
              {r.name}
            </div>
            <div className="text-[#64748b] dark:text-[#94a3b8]">→ {r.db}</div>
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: Scale,
    title: "6 · Evidence Scoring",
    plain: "A reranker labels each claim: supported, contradicted, or no evidence.",
    color: "#2b8a3e",
    body: (
      <div className="space-y-1.5 text-xs">
        <div className="flex items-center justify-between rounded bg-[#ffe3e3] dark:bg-[rgba(224,49,49,0.12)] px-2 py-1.5">
          <span>Agent A · “significant for all over 60”</span>
          <span className="font-bold text-[#e03131]">Contradicted</span>
        </div>
        <div className="flex items-center justify-between rounded bg-[#ffe3e3] dark:bg-[rgba(224,49,49,0.12)] px-2 py-1.5">
          <span>Agent B · “no effect at all”</span>
          <span className="font-bold text-[#e03131]">Contradicted</span>
        </div>
        <div className="flex items-center justify-between rounded bg-[#d3f9d8] dark:bg-[rgba(12,166,120,0.14)] px-2 py-1.5">
          <span>Agent C · “effect only in a subgroup”</span>
          <span className="font-bold text-[#0ca678]">Supported</span>
        </div>
        <p className="text-[11px] text-[#64748b] dark:text-[#94a3b8] pt-1">
          The real paper shows a modest effect only in patients with a specific
          condition — closely matching Agent C.
        </p>
      </div>
    ),
  },
  {
    icon: RefreshCw,
    title: "7 · Trust Update",
    plain: "Credibility shifts toward whoever the evidence actually backs.",
    color: "#e03131",
    body: (
      <div className="space-y-2">
        {[
          { name: "Agent A", from: 33, to: 18, color: A },
          { name: "Agent B", from: 33, to: 17, color: B },
          { name: "Agent C", from: 33, to: 65, color: C },
        ].map((r) => (
          <div key={r.name} className="text-xs">
            <div className="flex items-center justify-between mb-0.5">
              <span className="font-semibold" style={{ color: r.color }}>
                {r.name}
              </span>
              <span className="font-mono text-[#64748b] dark:text-[#94a3b8]">
                {r.from}% → <strong style={{ color: r.color }}>{r.to}%</strong>
              </span>
            </div>
            <div className="h-2 rounded-full bg-[#e2e8f0] dark:bg-[rgba(255,255,255,0.08)] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${r.to}%`, background: r.color }}
              />
            </div>
          </div>
        ))}
        <p className="text-[11px] text-[#64748b] dark:text-[#94a3b8]">
          Bounded by softmax → clamp[0.1, 0.9] → renormalize, so A and B are
          down-weighted but never fully silenced.
        </p>
      </div>
    ),
  },
  {
    icon: Gavel,
    title: "8 · Trust-Weighted Verdict",
    plain: "The final answer is the evidence-weighted vote — not the headcount.",
    color: "#3b5bdb",
    body: (
      <div className="text-sm space-y-2">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-lg border border-[#e03131]/30 bg-[#e03131]/5 p-2">
            <div className="font-bold text-[#e03131] mb-0.5">Majority vote</div>
            2 agents said “X” → would pick the <strong>unsupported</strong>{" "}
            answer.
          </div>
          <div className="rounded-lg border border-[#0ca678]/30 bg-[#0ca678]/5 p-2">
            <div className="font-bold text-[#0ca678] mb-0.5">Ours</div>
            Trust 65% on “Y” &gt; 35% on “X” → picks the{" "}
            <strong>evidence-backed</strong> answer.
          </div>
        </div>
      </div>
    ),
  },
  {
    icon: Sparkles,
    title: "9 · Final Output",
    plain: "A transparent answer with citations and a full trust trail.",
    color: "#0ca678",
    body: (
      <div className="text-sm">
        <div className="rounded-lg border border-[#0ca678]/40 bg-[#0ca678]/8 p-3">
          <div className="font-bold text-[#0ca678] mb-1">
            “Yes — but only in [that subgroup].”
          </div>
          <ul className="text-xs text-[#334155] dark:text-[#cbd5e1] list-disc list-inside space-y-0.5">
            <li>Citation to the exact supporting passage</li>
            <li>Trust trajectory across all rounds</li>
            <li>Note that A and B initially disagreed and why they lost weight</li>
          </ul>
        </div>
      </div>
    ),
  },
];

export function Walkthrough() {
  const [i, setI] = useState(0);
  const step = STEPS[i];
  const Icon = step.icon;
  const atStart = i === 0;
  const atEnd = i === STEPS.length - 1;

  return (
    <div className="rounded-xl border border-[#e2e8f0] dark:border-[rgba(255,255,255,0.1)] bg-white dark:bg-[#151830] overflow-hidden">
      {/* Progress dots */}
      <div className="flex items-center gap-1 px-4 pt-3">
        {STEPS.map((s, idx) => (
          <button
            key={s.title}
            onClick={() => setI(idx)}
            aria-label={s.title}
            className="flex-1 h-1.5 rounded-full transition-all cursor-pointer border-0 p-0"
            style={{
              background:
                idx <= i ? step.color : "rgba(148,163,184,0.3)",
              opacity: idx <= i ? 1 : 0.5,
            }}
          />
        ))}
      </div>

      <div className="p-4">
        {/* Step header */}
        <div className="flex items-center gap-2.5 mb-3">
          <span
            className="flex items-center justify-center w-9 h-9 rounded-lg flex-shrink-0"
            style={{ background: `${step.color}1a`, color: step.color }}
          >
            <Icon size={18} />
          </span>
          <div className="min-w-0">
            <div className="text-sm font-bold text-[#1e2d3d] dark:text-[#e2e8f0]">
              {step.title}
            </div>
            <div className="text-xs text-[#64748b] dark:text-[#94a3b8]">
              {step.plain}
            </div>
          </div>
        </div>

        {/* Step body */}
        <div className="min-h-[150px]">{step.body}</div>

        {/* Nav */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#e2e8f0] dark:border-[rgba(255,255,255,0.08)]">
          <button
            onClick={() => setI((v) => Math.max(0, v - 1))}
            disabled={atStart}
            className={cn(
              "flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors cursor-pointer bg-transparent",
              atStart
                ? "opacity-40 cursor-not-allowed border-[#e2e8f0] dark:border-[rgba(255,255,255,0.1)] text-[#94a3b8]"
                : "border-[#e2e8f0] dark:border-[rgba(255,255,255,0.1)] text-[#3b5bdb] dark:text-[#93c5fd] hover:bg-[#3b5bdb]/10",
            )}
          >
            <ChevronLeft size={14} /> Back
          </button>
          <span className="text-[11px] text-[#64748b] dark:text-[#94a3b8] font-medium">
            Step {i + 1} of {STEPS.length}
          </span>
          <button
            onClick={() => setI((v) => Math.min(STEPS.length - 1, v + 1))}
            disabled={atEnd}
            className={cn(
              "flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer border-0",
              atEnd
                ? "opacity-40 cursor-not-allowed bg-[#e2e8f0] dark:bg-[rgba(255,255,255,0.08)] text-[#94a3b8]"
                : "bg-[#3b5bdb] text-white hover:bg-[#2d4ab8]",
            )}
          >
            Next <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
