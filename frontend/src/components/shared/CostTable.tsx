import { cn } from "@/lib/utils";

/**
 * Publication-stage budget table.
 *
 * The main causal matrix runs the 4-bit 24–27B stack on one 80 GB A100 at
 * $0.136/GPU-h; pinned 4-bit weights total ~53.3 GB. The 73.68 GB FP8 stack
 * on a 96 GB card is only the N1 hardware smoke plus a small GPQA precision
 * replication, not the Full matrix.
 * Core is 24 runs / 1,280 GPU-h. Full is 32 rows / 1,280 GPU-h with the
 * gold-evidence oracle on EG-SSS; the 36-row gold-answer alternate is
 * 1,440 GPU-h. All-in costs include GPU + bandwidth + storage + 20% spot
 * overhead; the total is $500–600 with a $600 hard stop.
 */

interface Stage {
  name: string;
  scope: string;
  when: string;
  hours: string;
  cost: string;
  color: string;
  bg: string;
}

const STAGES: Stage[] = [
  {
    name: "N1 smoke + FP8 check",
    scope: "96 GB FP8 stack at $0.336/GPU-h: N1 hardware smoke + small GPQA precision replication",
    when: "Nov 2026",
    hours: "60–100",
    cost: "$25–40",
    color: "#475569",
    bg: "rgba(71,85,105,0.08)",
  },
  {
    name: "Pilot",
    scope: "24-item calibration · 50-question Month-1 pilot · 100–150-question G2 pilot",
    when: "Dec 2026",
    hours: "~112",
    cost: "$15–20",
    color: "#e8590c",
    bg: "rgba(232,89,12,0.08)",
  },
  {
    name: "Core",
    scope: "4 arms (B3, B4-matched, B8-no-trust, B8) · GPQA 400 / MMLU-Pro 400 / HLE 200 · 2 seeds = 24 runs",
    when: "Jan 2027",
    hours: "1,280 cap",
    cost: "$175–210",
    color: "#7c3aed",
    bg: "rgba(124,58,237,0.08)",
  },
  {
    name: "Full",
    scope: "32 rows · gold-evidence oracle on EG-SSS · 36-row gold-answer alternate · 300 items/dataset",
    when: "Feb 2027",
    hours: "1,280 · 1,440 alt",
    cost: "$210 · $235 alt",
    color: "#0ca678",
    bg: "rgba(12,166,120,0.08)",
  },
  {
    name: "Storage + bandwidth",
    scope: "Persistent volumes, checkpoints, logs, dataset and retrieval caches",
    when: "All stages",
    hours: "—",
    cost: "$40–80",
    color: "#1c7ed6",
    bg: "rgba(28,126,214,0.08)",
  },
];

const MAIN_WEIGHTS = [
  { model: "Qwen3.8-27B-AWQ-INT4", gb: 21.0 },
  { model: "Gemma 4 26B-A4B AWQ", gb: 17.2 },
  { model: "Mistral Small 3.2 24B AWQ", gb: 15.06 },
] as const;

const MAIN_TOTAL = 53.26;
const MAIN_LIMIT = 80;

const FINAL_WEIGHTS = [
  { model: "Qwen3.8-27B-FP8", gb: 27.0 },
  { model: "Gemma 4 26B A4B FP8", gb: 28.67 },
  { model: "Mistral Small 3.2 24B AWQ", gb: 15.06 },
] as const;

const FINAL_TOTAL = 73.68;
const FINAL_LIMIT = 96;

export function CostTable() {
  return (
    <div className="rounded-lg border border-[#e2e8f0] dark:border-[rgba(255,255,255,0.08)] bg-white dark:bg-[rgba(255,255,255,0.03)] p-4 sm:p-5 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h4 className="text-sm font-bold">Publication-Stage Budget</h4>
        <span className="text-[10px] font-semibold uppercase tracking-wide text-[#64748b] dark:text-[#94a3b8]">
          Vast.ai spot · all-in estimate
        </span>
      </div>

      {/* Stage table */}
      <div className="overflow-x-auto rounded-lg border border-[#e2e8f0] dark:border-[rgba(255,255,255,0.08)]">
        <table className="w-full border-collapse text-xs sm:text-sm">
          <thead>
            <tr>
              {["Stage", "Scope", "When", "GPU hours", "All-in cost"].map((h) => (
                <th
                  key={h}
                  className="p-2.5 text-left font-bold bg-[#f1f5f9] dark:bg-[rgba(255,255,255,0.06)] border-b border-[#e2e8f0] dark:border-[rgba(255,255,255,0.15)]"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {STAGES.map((s) => (
              <tr
                key={s.name}
                className="border-b border-[#e2e8f0] dark:border-[rgba(255,255,255,0.08)] last:border-b-0"
              >
                <td className="p-2.5 font-bold whitespace-nowrap" style={{ color: s.color }}>
                  {s.name}
                </td>
                <td className="p-2.5 text-[#475569] dark:text-[#cbd5e1]">{s.scope}</td>
                <td className="p-2.5 font-semibold whitespace-nowrap">{s.when}</td>
                <td className="p-2.5 font-mono whitespace-nowrap">{s.hours}</td>
                <td
                  className={cn("p-2.5 font-mono font-bold whitespace-nowrap")}
                  style={{ color: s.color, background: s.bg }}
                >
                  {s.cost}
                </td>
              </tr>
            ))}
            <tr className="bg-[#f0f4ff] dark:bg-[rgba(59,91,219,0.12)]">
              <td className="p-2.5 font-extrabold whitespace-nowrap text-[#1e2d3d] dark:text-[#e2e8f0]">
                Total
              </td>
              <td className="p-2.5 font-semibold text-[#475569] dark:text-[#cbd5e1]">
                All stages · hard stop $600
              </td>
              <td className="p-2.5 font-semibold whitespace-nowrap">—</td>
              <td className="p-2.5 font-mono whitespace-nowrap">—</td>
              <td className="p-2.5 font-mono font-extrabold whitespace-nowrap text-[#1e2d3d] dark:text-[#e2e8f0]">
                $500–600
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p className="text-[10px] text-[#64748b] dark:text-[#94a3b8] leading-relaxed">
        <strong>Core</strong> is the 4-bit main matrix. <strong>Full</strong> is
        the 32-row matrix with the gold-evidence oracle on EG-SSS; the 36-row
        gold-answer alternate is $235. The 96 GB FP8 stack is not the main Full
        matrix: it covers the N1 smoke plus a small GPQA precision replication.
        Total $500–600, hard stop $600. If the 80 GB A100 is unavailable, the
        fallback is $1,050–1,150 and requires re-approval; it is not the
        default. Post-FYDP scaling-law testing is outside this budget.
      </p>

      {/* 4-bit main-stack weight budget */}
      <div className="rounded-lg border border-[#e2e8f0] dark:border-[rgba(255,255,255,0.08)] p-3 space-y-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="text-xs font-bold text-[#1e2d3d] dark:text-[#e2e8f0]">
            4-bit main stack — pinned weights
          </span>
          <span className="text-xs font-mono font-bold text-[#e8590c]">
            ~{MAIN_TOTAL.toFixed(1)} GB / {MAIN_LIMIT} GB
          </span>
        </div>
        <div className="h-2.5 rounded-full bg-[#e2e8f0] dark:bg-[rgba(255,255,255,0.08)] overflow-hidden">
          <div
            className="h-full rounded-full bg-[#e8590c]"
            style={{ width: `${(MAIN_TOTAL / MAIN_LIMIT) * 100}%` }}
          />
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-[#64748b] dark:text-[#94a3b8]">
          {MAIN_WEIGHTS.map((w) => (
            <span key={w.model}>
              {w.model} <strong className="font-mono">{w.gb.toFixed(2)} GB</strong>
            </span>
          ))}
          <span className="font-semibold">0.90 vLLM utilization · 8k context</span>
        </div>
        <p className="text-[10px] text-[#64748b] dark:text-[#94a3b8] leading-relaxed">
          Core and Full main causal matrix on one 80 GB A100 at $0.136/GPU-h.
          Full default is 32 rows; the 36-row gold-answer alternate is $235.
        </p>
      </div>

      {/* FP8 check-stack weight budget */}
      <div className="rounded-lg border border-[#e2e8f0] dark:border-[rgba(255,255,255,0.08)] p-3 space-y-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="text-xs font-bold text-[#1e2d3d] dark:text-[#e2e8f0]">
            96 GB FP8 check stack — pinned weights
          </span>
          <span className="text-xs font-mono font-bold text-[#0ca678]">
            {FINAL_TOTAL.toFixed(2)} GB / {FINAL_LIMIT} GB
          </span>
        </div>
        <div className="h-2.5 rounded-full bg-[#e2e8f0] dark:bg-[rgba(255,255,255,0.08)] overflow-hidden">
          <div
            className="h-full rounded-full bg-[#0ca678]"
            style={{ width: `${(FINAL_TOTAL / FINAL_LIMIT) * 100}%` }}
          />
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-[#64748b] dark:text-[#94a3b8]">
          {FINAL_WEIGHTS.map((w) => (
            <span key={w.model}>
              {w.model} <strong className="font-mono">{w.gb.toFixed(2)} GB</strong>
            </span>
          ))}
          <span className="font-semibold">0.90 vLLM utilization · 8k context</span>
        </div>
        <p className="text-[10px] text-[#64748b] dark:text-[#94a3b8] leading-relaxed">
          N1 hardware smoke + small GPQA precision replication only. The main
          matrix is the 4-bit 24–27B stack (~53.3 GB) on one 80 GB A100, not
          this FP8 stack.
        </p>
      </div>

      {/* Benchmark ladder */}
      <div className="rounded-lg border border-[#e2e8f0] dark:border-[rgba(255,255,255,0.08)] bg-[#f8fafc] dark:bg-[rgba(255,255,255,0.02)] p-3">
        <div className="text-[10px] font-bold uppercase tracking-wide text-[#64748b] dark:text-[#94a3b8] mb-1.5">
          Benchmark ladder
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[11px]">
          {[
            { label: "180", tag: "floor", color: "#0ca678" },
            { label: "300", tag: "target", color: "#3b5bdb" },
            { label: "600", tag: "stretch", color: "#f08c00" },
            { label: "800", tag: "no-go", color: "#e03131" },
          ].map((b) => (
            <span
              key={b.tag}
              className="rounded-full px-2 py-0.5 font-bold"
              style={{ color: b.color, background: `${b.color}14` }}
            >
              {b.label} <span className="font-medium">{b.tag}</span>
            </span>
          ))}
        </div>
      </div>

      <p className="text-[10px] text-[#94a3b8] leading-relaxed">
        All-in = GPU + bandwidth + storage + 20% spot overhead. Core is the
        first executable stage; Full is conditional on Core. Core is 24 runs at
        1,280 GPU-h; Full is 32 rows at 1,280 GPU-h (36-row alternate at
        1,440 GPU-h). The main matrix uses the 4-bit 24–27B stack (~53.3 GB)
        on one 80 GB A100 at $0.136/GPU-h; the 96 GB FP8 check stack uses
        $0.336/GPU-h.
        Prices are volatile — re-run the market query before renting.
      </p>

      <p className="text-[10px] text-[#94a3b8] leading-relaxed">
        B7 external-answer ceiling (optional): OpenAI GPT-6 Luna — 3
        samples/question; ~$3–9 per 1,000; mean single-call accuracy + CI +
        3-sample majority. Not a Core arm; outside the GPU envelope.
      </p>
    </div>
  );
}
