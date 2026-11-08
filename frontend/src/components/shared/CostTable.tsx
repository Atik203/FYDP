import { cn } from "@/lib/utils";

/**
 * Publication-stage budget table (docs/agent/08_COMPUTE_COST.md).
 *
 * The old hour sliders assumed a 1,000-hour dev ceiling and an 800-hour final
 * ceiling. Those numbers no longer describe the project: the pre-registered
 * matrix is 24 rows / 1,280 GPU-h, and the publication stages are costed
 * all-in (GPU + bandwidth + storage + 20% spot overhead).
 */

const STAGES = [
  {
    name: "Core",
    scope: "4 arms + oracle · ~400/dataset × 2 seeds · 180-item benchmark",
    when: "Jan 2027",
    hours: "~1,160",
    cost: "$420–580",
    color: "#7c3aed",
    bg: "rgba(124,58,237,0.08)",
  },
  {
    name: "Full",
    scope: "6 arms × 3 datasets × 400 × 2 seeds · 300-item benchmark · human eval",
    when: "Feb 2027",
    hours: "2,460–2,700 total",
    cost: "$900–1,200 top-up",
    color: "#0ca678",
    bg: "rgba(12,166,120,0.08)",
  },
  {
    name: "Law-testing",
    scope: "8 min/debate · 3,813 GPU-h matrix + Final replication",
    when: "Apr 2027",
    hours: "3,900+",
    cost: "$1,400–1,900",
    color: "#e03131",
    bg: "rgba(224,49,49,0.06)",
  },
] as const;

const FINAL_WEIGHTS = [
  { model: "Qwen3.6-27B FP8", gb: 26.0 },
  { model: "Gemma 4 26B A4B FP8", gb: 28.67 },
  { model: "Mistral Small 3.2 24B AWQ", gb: 15.06 },
] as const;

const FINAL_TOTAL = 69.73;
const FINAL_LIMIT = 80;

export function CostTable() {
  return (
    <div className="rounded-lg border border-[#e2e8f0] dark:border-[rgba(255,255,255,0.08)] bg-white dark:bg-[rgba(255,255,255,0.03)] p-4 sm:p-5 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h4 className="text-sm font-bold">Publication-Stage GPU Budget</h4>
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
          </tbody>
        </table>
      </div>

      <p className="text-[10px] text-[#64748b] dark:text-[#94a3b8] leading-relaxed">
        <strong>Core</strong> = Core run (legacy “C+”); <strong>Full</strong> =
        Full run (legacy “TACL full”). The Full run resumes from the Core run,
        so its cost is a top-up, not additive. “TACL” is the venue
        (Transactions of the Association for Computational Linguistics), not a
        stage.
      </p>

      {/* Final stack weight budget */}
      <div className="rounded-lg border border-[#e2e8f0] dark:border-[rgba(255,255,255,0.08)] p-3 space-y-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="text-xs font-bold text-[#1e2d3d] dark:text-[#e2e8f0]">
            Final stack — pinned weights
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
          <span className="font-semibold">0.90 utilization · 8k context</span>
        </div>
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
        first executable stage; Full and Law-testing are conditional. Prices are
        volatile — re-run the market query before renting. The pre-registered
        executable Core matrix is 24 rows at 1,280 GPU-h. Final stack uses
        Qwen3.6-27B FP8, Gemma 4 26B A4B FP8 and Mistral Small 3.2 24B AWQ on
        one RTX PRO 6000 96 GB card.
      </p>
    </div>
  );
}
