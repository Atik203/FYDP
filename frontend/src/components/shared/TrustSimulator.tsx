import { useMemo, useState } from "react";
import { RotateCcw, Sparkles, TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Interactive trust-score simulator for Blueprint §4.4.
 *
 * Implements the exact operator order from the proposal:
 *   1. raw_i = S_i + α·V_i − β·H_i        (evidence update)
 *   2. softmax over raw                    (normalize to a distribution)
 *   3. clamp each to [0.1, 0.9]            (no agent silenced or dominant)
 *   4. renormalize so Σ T_i = 1            (valid weights again)
 *
 * The point it teaches: a correct MINORITY agent (Agent C here) whose claims
 * are evidence-supported can out-weigh two unsupported MAJORITY agents — the
 * thing a plain majority vote cannot do.
 */

interface AgentState {
  id: string;
  name: string;
  model: string;
  /** which answer this agent argues for */
  position: "X" | "Y";
  /** proportion of this agent's claims SUPPORTED by evidence (V_i) */
  supported: number;
  /** proportion CONTRADICTED by evidence (H_i) */
  contradicted: number;
  color: string;
  softBg: string;
}

const INITIAL_AGENTS: AgentState[] = [
  {
    id: "a",
    name: "Agent A",
    model: "Qwen3.6-27B",
    position: "X",
    supported: 0.2,
    contradicted: 0.6,
    color: "#7c3aed",
    softBg: "rgba(124,58,237,0.12)",
  },
  {
    id: "b",
    name: "Agent B",
    model: "Gemma 4 26B",
    position: "X",
    supported: 0.3,
    contradicted: 0.5,
    color: "#1c7ed6",
    softBg: "rgba(28,126,214,0.12)",
  },
  {
    id: "c",
    name: "Agent C",
    model: "Mistral Small 3.2",
    position: "Y",
    supported: 0.9,
    contradicted: 0.05,
    color: "#0ca678",
    softBg: "rgba(12,166,120,0.12)",
  },
];

const T_MIN = 0.1;
const T_MAX = 0.9;

function softmax(xs: number[]): number[] {
  const max = Math.max(...xs);
  const exps = xs.map((x) => Math.exp(x - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map((e) => e / sum);
}

function Slider({
  label,
  value,
  onChange,
  min,
  max,
  step,
  accent,
  hint,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  accent: string;
  hint?: string;
}) {
  return (
    <label className="block">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-semibold text-[#1e2d3d] dark:text-[#e2e8f0]">
          {label}
        </span>
        <span
          className="text-xs font-mono font-bold px-1.5 py-0.5 rounded"
          style={{ color: accent, background: `${accent}1a` }}
        >
          {value.toFixed(2)}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, ${accent} 0%, ${accent} ${
            ((value - min) / (max - min)) * 100
          }%, #e2e8f0 ${((value - min) / (max - min)) * 100}%, #e2e8f0 100%)`,
          accentColor: accent,
        }}
      />
      {hint && (
        <span className="text-[10px] text-[#94a3b8] mt-0.5 block">{hint}</span>
      )}
    </label>
  );
}

export function TrustSimulator() {
  const [agents, setAgents] = useState<AgentState[]>(INITIAL_AGENTS);
  const [alpha, setAlpha] = useState(1.5);
  const [beta, setBeta] = useState(1.0);

  const update = (id: string, patch: Partial<AgentState>) =>
    setAgents((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...patch } : a)),
    );

  const reset = () => {
    setAgents(INITIAL_AGENTS);
    setAlpha(1.5);
    setBeta(1.0);
  };

  const computed = useMemo(() => {
    // All agents start from a uniform trust score S = 1/N.
    const N = agents.length;
    const S0 = 1 / N;
    // Step 1 — evidence update
    const raw = agents.map((a) => S0 + alpha * a.supported - beta * a.contradicted);
    // Step 2 — softmax
    const sm = softmax(raw);
    // Step 3 — clamp
    const clamped = sm.map((v) => Math.min(T_MAX, Math.max(T_MIN, v)));
    // Step 4 — renormalize
    const sum = clamped.reduce((a, b) => a + b, 0);
    const trust = clamped.map((v) => v / sum);
    return { raw, sm, clamped, trust };
  }, [agents, alpha, beta]);

  // Trust-weighted vote per answer
  const votes = useMemo(() => {
    const tally: Record<"X" | "Y", number> = { X: 0, Y: 0 };
    agents.forEach((a, i) => {
      tally[a.position] += computed.trust[i];
    });
    return tally;
  }, [agents, computed.trust]);

  const trustWinner = votes.Y > votes.X ? "Y" : "X";

  // Plain majority vote (headcount) for contrast
  const headcount = useMemo(() => {
    const tally: Record<"X" | "Y", number> = { X: 0, Y: 0 };
    agents.forEach((a) => (tally[a.position] += 1));
    return tally;
  }, [agents]);
  const majorityWinner = headcount.Y > headcount.X ? "Y" : "X";

  const disagree = trustWinner !== majorityWinner;

  return (
    <div className="rounded-xl border border-[#e2e8f0] dark:border-[rgba(255,255,255,0.1)] bg-white dark:bg-[#151830] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-[#e2e8f0] dark:border-[rgba(255,255,255,0.08)] bg-[#f8fafc] dark:bg-[rgba(255,255,255,0.02)]">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#e03131]/10 text-[#e03131]">
            <Sparkles size={15} />
          </span>
          <div>
            <div className="text-sm font-bold text-[#1e2d3d] dark:text-[#e2e8f0]">
              Trust-Update Simulator
            </div>
            <div className="text-[10px] text-[#64748b] dark:text-[#94a3b8]">
              Blueprint §4.4 · softmax → clamp[0.1, 0.9] → renormalize
            </div>
          </div>
        </div>
        <button
          onClick={reset}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#64748b] dark:text-[#94a3b8] hover:text-[#3b5bdb] dark:hover:text-[#93c5fd] px-2.5 py-1.5 rounded-lg border border-[#e2e8f0] dark:border-[rgba(255,255,255,0.1)] transition-colors cursor-pointer bg-transparent"
        >
          <RotateCcw size={12} /> Reset
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Scenario line */}
        <p className="text-xs text-[#64748b] dark:text-[#94a3b8] leading-relaxed">
          <strong className="text-[#1e2d3d] dark:text-[#e2e8f0]">Scenario:</strong>{" "}
          Two agents (A, B) argue answer <strong>X</strong>; one minority agent
          (C) argues answer <strong>Y</strong>. Drag the evidence sliders and
          watch whether the <em>evidence-weighted</em> vote can rescue the
          correct minority — something a headcount never could.
        </p>

        {/* Global hyperparameters */}
        <div className="grid grid-cols-2 gap-4 p-3 rounded-lg bg-[#f0f2f7] dark:bg-[rgba(255,255,255,0.03)] border border-[#e2e8f0] dark:border-[rgba(255,255,255,0.08)]">
          <Slider
            label="α — reward weight"
            value={alpha}
            onChange={setAlpha}
            min={0}
            max={3}
            step={0.1}
            accent="#0ca678"
            hint="How much SUPPORTED claims raise trust"
          />
          <Slider
            label="β — penalty weight"
            value={beta}
            onChange={setBeta}
            min={0}
            max={3}
            step={0.1}
            accent="#e03131"
            hint="How much CONTRADICTED claims lower trust"
          />
        </div>

        {/* Per-agent controls + computed trust */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {agents.map((a, i) => {
            const trustPct = computed.trust[i] * 100;
            const clampedHit =
              computed.sm[i] < T_MIN + 1e-9 || computed.sm[i] > T_MAX - 1e-9;
            return (
              <div
                key={a.id}
                className="rounded-lg border p-3"
                style={{
                  borderColor: `${a.color}55`,
                  background: a.softBg,
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div
                      className="text-sm font-bold"
                      style={{ color: a.color }}
                    >
                      {a.name}
                    </div>
                    <div className="text-[10px] text-[#64748b] dark:text-[#94a3b8]">
                      {a.model}
                    </div>
                  </div>
                  <span
                    className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded"
                    style={{ color: a.color, background: `${a.color}22` }}
                  >
                    Answer {a.position}
                  </span>
                </div>

                <div className="space-y-2.5">
                  <Slider
                    label="Supported Vᵢ"
                    value={a.supported}
                    onChange={(v) => update(a.id, { supported: v })}
                    min={0}
                    max={1}
                    step={0.05}
                    accent="#0ca678"
                  />
                  <Slider
                    label="Contradicted Hᵢ"
                    value={a.contradicted}
                    onChange={(v) => update(a.id, { contradicted: v })}
                    min={0}
                    max={1}
                    step={0.05}
                    accent="#e03131"
                  />
                </div>

                {/* Trust bar */}
                <div className="mt-3 pt-3 border-t border-[rgba(0,0,0,0.06)] dark:border-[rgba(255,255,255,0.08)]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-[#64748b] dark:text-[#94a3b8]">
                      Final Trust Tᵢ
                    </span>
                    <span
                      className="text-sm font-mono font-extrabold"
                      style={{ color: a.color }}
                    >
                      {trustPct.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-2.5 rounded-full bg-[#e2e8f0] dark:bg-[rgba(255,255,255,0.08)] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${trustPct}%`, background: a.color }}
                    />
                  </div>
                  {clampedHit && (
                    <span className="text-[9px] text-[#f08c00] font-semibold mt-1 block">
                      ⚠ clamp boundary hit — held inside [0.1, 0.9]
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Verdict comparison */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Plain majority */}
          <div className="rounded-lg border border-[#e2e8f0] dark:border-[rgba(255,255,255,0.1)] p-3 bg-[#f8fafc] dark:bg-[rgba(255,255,255,0.02)]">
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-[#64748b] dark:text-[#94a3b8] mb-2">
              <TrendingDown size={13} /> Plain Majority Vote
            </div>
            <div className="text-sm">
              Headcount → <strong>X: {headcount.X}</strong> vs{" "}
              <strong>Y: {headcount.Y}</strong>
            </div>
            <div className="mt-1.5 text-lg font-extrabold text-[#e03131]">
              Picks {majorityWinner}
              {majorityWinner === "X" && (
                <span className="text-xs font-normal text-[#64748b] dark:text-[#94a3b8]">
                  {" "}
                  (the unsupported answer)
                </span>
              )}
            </div>
          </div>

          {/* Trust weighted */}
          <div
            className="rounded-lg border p-3"
            style={{
              borderColor: trustWinner === "Y" ? "#0ca678" : "#e03131",
              background:
                trustWinner === "Y"
                  ? "rgba(12,166,120,0.08)"
                  : "rgba(224,49,49,0.06)",
            }}
          >
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-[#64748b] dark:text-[#94a3b8] mb-2">
              <TrendingUp size={13} /> Trust-Weighted Vote (Ours)
            </div>
            <div className="text-sm">
              Σ(Tᵢ × posᵢ) →{" "}
              <strong>X: {(votes.X * 100).toFixed(0)}%</strong> vs{" "}
              <strong>Y: {(votes.Y * 100).toFixed(0)}%</strong>
            </div>
            <div
              className="mt-1.5 text-lg font-extrabold"
              style={{ color: trustWinner === "Y" ? "#0ca678" : "#e03131" }}
            >
              Picks {trustWinner}
              {trustWinner === "Y" && (
                <span className="text-xs font-normal text-[#64748b] dark:text-[#94a3b8]">
                  {" "}
                  (the evidence-backed minority)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Takeaway banner */}
        <div
          className={cn(
            "rounded-lg p-3 text-xs leading-relaxed border-l-4 transition-colors",
            disagree
              ? "bg-[#d3f9d8] dark:bg-[rgba(12,166,120,0.15)] border-[#0ca678] text-[#0f5132] dark:text-[#6ee7b7]"
              : "bg-[#fff3bf] dark:bg-[rgba(240,140,0,0.12)] border-[#f08c00] text-[#7a4d00] dark:text-[#fcd34d]",
          )}
        >
          {disagree ? (
            <>
              <strong>✅ The mechanism just worked.</strong> Majority vote would
              lock in <strong>{majorityWinner}</strong>, but evidence-weighted
              trust rescues the correct minority answer{" "}
              <strong>{trustWinner}</strong>. This divergence is exactly the
              sycophantic-collapse case the whole system exists to prevent.
            </>
          ) : (
            <>
              <strong>Both methods agree right now.</strong> Lower Agent C's
              contradicted slider and raise its supported slider (or drop A/B's
              support) until the evidence clearly favours the minority — then the
              trust-weighted vote diverges from the headcount.
            </>
          )}
        </div>
      </div>
    </div>
  );
}
