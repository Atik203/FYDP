import { useMemo, useState } from "react";
import { RotateCcw, Sparkles, TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Interactive trust-score simulator for Blueprint §4.4.
 *
 * Implements the P0 operator order:
 *   1. logit_i = log S_i + α·V_i − β·H_i   (log-prior + normalized evidence)
 *   2. trust   = softmax(logit)            (one softmax, applied once)
 *   3. trust   = Π_[0.1, 0.9](trust)      (floor/ceiling simplex projection,
 *                                          solved by water-filling)
 *
 * V_i and H_i are per-claim rates, so dividing by each agent's claim count is
 * already folded in: verbosity does not buy influence. The projection guarantees
 * min >= 0.1, sum = 1 and max <= max(0.9, 1/N); neutral evidence is an identity.
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
    supported: 0.05,
    contradicted: 0.95,
    color: "#7c3aed",
    softBg: "rgba(124,58,237,0.12)",
  },
  {
    id: "b",
    name: "Agent B",
    model: "Gemma 4 26B",
    position: "X",
    supported: 0.0,
    contradicted: 1.0,
    color: "#1c7ed6",
    softBg: "rgba(28,126,214,0.12)",
  },
  {
    id: "c",
    name: "Agent C",
    model: "Mistral Small 3.2",
    position: "Y",
    supported: 1.0,
    contradicted: 0.0,
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

/**
 * Euclidean projection onto {w : floor <= w_i <= ceiling, Σ w_i = 1}.
 *
 * Solves w_i = clip(x_i − θ, floor, effectiveCeiling) for the θ that makes the
 * vector sum to one. The scalar is found by bisection on the monotone piecewise
 * linear sum — the water-filling solution. If the input is already feasible the
 * projection is the identity, so neutral evidence does not drift.
 */
function projectSimplexWithFloor(
  xs: number[],
  floor: number,
  ceiling: number,
): { weights: number[]; floorFlags: boolean[]; ceilingFlags: boolean[] } {
  const n = xs.length;
  const effectiveCeiling = Math.max(ceiling, 1 / n);
  const sum = xs.reduce((a, b) => a + b, 0);
  const feasible =
    xs.every((v) => v >= floor - 1e-12 && v <= effectiveCeiling + 1e-12) &&
    Math.abs(sum - 1) <= 1e-12;

  if (feasible) {
    return {
      weights: xs.slice(),
      floorFlags: xs.map((v) => v <= floor + 1e-9),
      ceilingFlags: xs.map((v) => v >= effectiveCeiling - 1e-9),
    };
  }

  // θ is monotone: larger θ shrinks every coordinate. Bracket the root, then
  // bisect. 100 iterations is far below double-precision resolution.
  let lo = Math.min(...xs) - effectiveCeiling;
  let hi = Math.max(...xs) - floor;
  for (let i = 0; i < 100; i += 1) {
    const mid = (lo + hi) / 2;
    const total = xs.reduce(
      (acc, v) => acc + Math.min(effectiveCeiling, Math.max(floor, v - mid)),
      0,
    );
    if (total > 1) lo = mid;
    else hi = mid;
  }

  const theta = (lo + hi) / 2;
  let weights = xs.map((v) =>
    Math.min(effectiveCeiling, Math.max(floor, v - theta)),
  );

  // Spread residual round-off over the free coordinates, preserving bounds.
  const residual = 1 - weights.reduce((a, b) => a + b, 0);
  if (Math.abs(residual) > 1e-12) {
    const free = weights
      .map((v, i) => (v > floor + 1e-12 && v < effectiveCeiling - 1e-12 ? i : -1))
      .filter((i) => i >= 0);
    if (free.length > 0) {
      const share = residual / free.length;
      free.forEach((i) => {
        weights[i] += share;
      });
      weights = weights.map((v) =>
        Math.min(effectiveCeiling, Math.max(floor, v)),
      );
    }
  }

  return {
    weights,
    floorFlags: weights.map((v) => v <= floor + 1e-9),
    ceilingFlags: weights.map((v) => v >= effectiveCeiling - 1e-9),
  };
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
  const [alpha, setAlpha] = useState(0.5);
  const [beta, setBeta] = useState(0.3);

  const update = (id: string, patch: Partial<AgentState>) =>
    setAgents((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...patch } : a)),
    );

  const reset = () => {
    setAgents(INITIAL_AGENTS);
    setAlpha(0.5);
    setBeta(0.3);
  };

  const computed = useMemo(() => {
    // All agents start from a uniform trust score S = 1/N.
    const N = agents.length;
    const S0 = 1 / N;
    // Step 1 — log-prior plus claim-normalized evidence
    const logits = agents.map(
      (a) => Math.log(S0) + alpha * a.supported - beta * a.contradicted,
    );
    // Step 2 — one softmax
    const sm = softmax(logits);
    // Step 3 — floor/ceiling simplex projection (water-filling)
    const projected = projectSimplexWithFloor(sm, T_MIN, T_MAX);
    const trust = projected.weights;
    const floorCount = projected.floorFlags.filter(Boolean).length;
    const ceilingCount = projected.ceilingFlags.filter(Boolean).length;
    const changed = sm.some((v, i) => Math.abs(v - trust[i]) > 1e-9);
    return {
      sm,
      trust,
      floorFlags: projected.floorFlags,
      ceilingFlags: projected.ceilingFlags,
      floorActive: floorCount > 0,
      ceilingActive: ceilingCount > 0,
      floorCount,
      ceilingCount,
      changed,
    };
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
              Blueprint §4.4 · log-prior → one softmax → floor/ceiling simplex
              projection
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
            max={1.5}
            step={0.05}
            accent="#0ca678"
            hint="How much SUPPORTED claims raise trust (default 0.5)"
          />
          <Slider
            label="β — penalty weight"
            value={beta}
            onChange={setBeta}
            min={0}
            max={1.5}
            step={0.05}
            accent="#e03131"
            hint="How much CONTRADICTED claims lower trust (default 0.3)"
          />
        </div>

        {/* Operator + projection status */}
        <div className="rounded-lg border border-[#e2e8f0] dark:border-[rgba(255,255,255,0.08)] bg-[#f8fafc] dark:bg-[rgba(255,255,255,0.02)] px-3 py-2.5 space-y-1.5">
          <div className="text-[10px] font-mono text-[#475569] dark:text-[#cbd5e1] leading-relaxed">
            logitᵢ = log Sᵢ + α·Vᵢ − β·Hᵢ → softmax → Π<sub>[0.1, 0.9]</sub>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px]">
            <span className="font-bold uppercase tracking-wide text-[#64748b] dark:text-[#94a3b8]">
              Projection
            </span>
            <span
              className="font-semibold"
              style={{ color: computed.floorActive ? "#f08c00" : "#94a3b8" }}
            >
              floor 0.10{" "}
              {computed.floorActive
                ? `active on ${computed.floorCount} agent${computed.floorCount === 1 ? "" : "s"}`
                : "inactive"}
            </span>
            <span
              className="font-semibold"
              style={{ color: computed.ceilingActive ? "#e03131" : "#94a3b8" }}
            >
              ceiling 0.90{" "}
              {computed.ceilingActive
                ? `active on ${computed.ceilingCount} agent${computed.ceilingCount === 1 ? "" : "s"}`
                : "inactive"}
            </span>
            <span className="ml-auto text-[#94a3b8]">
              {computed.changed
                ? "water-filling applied"
                : "bounds already satisfied — identity"}
            </span>
          </div>
          <div className="text-[10px] text-[#94a3b8]">
            Vᵢ and Hᵢ are per-claim rates; dividing by claim count keeps verbose
            agents from buying influence.
          </div>
        </div>

        {/* Per-agent controls + computed trust */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {agents.map((a, i) => {
            const trustPct = computed.trust[i] * 100;
            const smPct = computed.sm[i] * 100;
            const atFloor = computed.floorFlags[i];
            const atCeiling = computed.ceilingFlags[i];
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
                  <div className="flex items-center justify-between gap-1 mt-1">
                    <span className="text-[9px] text-[#94a3b8] font-mono">
                      softmax {smPct.toFixed(1)}% → simplex {trustPct.toFixed(1)}%
                    </span>
                    {atFloor && (
                      <span className="text-[9px] text-[#f08c00] font-semibold whitespace-nowrap">
                        floor active
                      </span>
                    )}
                    {atCeiling && (
                      <span className="text-[9px] text-[#e03131] font-semibold whitespace-nowrap">
                        ceiling active
                      </span>
                    )}
                  </div>
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
              <strong>Both methods agree right now.</strong> Raise Agent C's
              supported rate (or lower A/B's support) until the evidence clearly
              favours the minority — then the trust-weighted vote diverges from
              the headcount.
            </>
          )}
        </div>
      </div>
    </div>
  );
}
