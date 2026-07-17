import { useState } from "react";
import { cn } from "@/lib/utils";

const PROVIDERS = [
  { name: "Vast.ai (spot)", devRate: 0.15, finalRate: 0.68 },
  { name: "Vast.ai (on-demand)", devRate: 0.30, finalRate: 1.20 },
  { name: "RunPod", devRate: 0.35, finalRate: 1.49 },
  { name: "JarvisLabs", devRate: 0.40, finalRate: 1.49 },
] as const;

export function CostTable() {
  const [devHours, setDevHours] = useState(400);
  const [finalHours, setFinalHours] = useState(350);
  const [providerIdx, setProviderIdx] = useState(0);

  const p = PROVIDERS[providerIdx];
  const devCost = devHours * p.devRate;
  const finalCost = finalHours * p.finalRate;
  const total = devCost + finalCost;

  return (
    <div className="rounded-lg border border-[#e2e8f0] dark:border-[rgba(255,255,255,0.08)] bg-white dark:bg-[rgba(255,255,255,0.03)] p-4 sm:p-5 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h4 className="text-sm font-bold">GPU Budget Calculator</h4>
        <select
          value={providerIdx}
          onChange={(e) => setProviderIdx(Number(e.target.value))}
          className="text-xs rounded border border-[#e2e8f0] dark:border-[rgba(255,255,255,0.12)] bg-white dark:bg-[#1e293b] px-2 py-1"
        >
          {PROVIDERS.map((p, i) => (
            <option key={i} value={i}>{p.name}</option>
          ))}
        </select>
      </div>

      {/* Slider: Dev hours */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-semibold text-[#1e2d3d] dark:text-[#e2e8f0]">
            Dev GPU hours <span className="font-normal text-[#64748b]">(RTX 4090 @ ${p.devRate.toFixed(2)}/hr)</span>
          </span>
          <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded text-[#7c3aed] bg-[rgba(124,58,237,0.12)]">
            {devHours}h
          </span>
        </div>
        <input
          type="range"
          min={100}
          max={1000}
          step={50}
          value={devHours}
          onChange={(e) => setDevHours(parseInt(e.target.value))}
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #7c3aed 0%, #7c3aed ${((devHours - 100) / 900) * 100}%, #e2e8f0 ${((devHours - 100) / 900) * 100}%, #e2e8f0 100%)`,
          }}
        />
        <div className="flex justify-between text-[10px] text-[#94a3b8] mt-0.5">
          <span>100 hrs (min)</span>
          <span>1,000 hrs (max)</span>
        </div>
      </div>

      {/* Slider: Final hours */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-semibold text-[#1e2d3d] dark:text-[#e2e8f0]">
            Final GPU hours <span className="font-normal text-[#64748b]">(A100 @ ${p.finalRate.toFixed(2)}/hr)</span>
          </span>
          <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded text-[#0ca678] bg-[rgba(12,166,120,0.12)]">
            {finalHours}h
          </span>
        </div>
        <input
          type="range"
          min={100}
          max={800}
          step={50}
          value={finalHours}
          onChange={(e) => setFinalHours(parseInt(e.target.value))}
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #0ca678 0%, #0ca678 ${((finalHours - 100) / 700) * 100}%, #e2e8f0 ${((finalHours - 100) / 700) * 100}%, #e2e8f0 100%)`,
          }}
        />
        <div className="flex justify-between text-[10px] text-[#94a3b8] mt-0.5">
          <span>100 hrs (min)</span>
          <span>800 hrs (max)</span>
        </div>
      </div>

      {/* Summary table */}
      <div className="overflow-x-auto rounded-lg border border-[#e2e8f0] dark:border-[rgba(255,255,255,0.08)]">
        <table className="w-full border-collapse text-xs sm:text-sm">
          <thead>
            <tr>
              {["Phase", "GPU", "Rate", "Hours", "Cost"].map((h) => (
                <th key={h} className="p-2.5 text-left font-bold bg-[#f1f5f9] dark:bg-[rgba(255,255,255,0.06)] border-b border-[#e2e8f0] dark:border-[rgba(255,255,255,0.15)]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-[#e2e8f0] dark:border-[rgba(255,255,255,0.08)]">
              <td className="p-2.5 font-medium">Dev (Ph 0–2)</td>
              <td className="p-2.5">RTX 4090 24GB</td>
              <td className="p-2.5 font-mono">${p.devRate.toFixed(2)}/hr</td>
              <td className="p-2.5 font-mono">{devHours}</td>
              <td className="p-2.5 font-mono font-bold text-[#7c3aed]">${devCost.toFixed(0)}</td>
            </tr>
            <tr className="border-b border-[#e2e8f0] dark:border-[rgba(255,255,255,0.08)]">
              <td className="p-2.5 font-medium">Final (Ph 3–5)</td>
              <td className="p-2.5">A100 80GB</td>
              <td className="p-2.5 font-mono">${p.finalRate.toFixed(2)}/hr</td>
              <td className="p-2.5 font-mono">{finalHours}</td>
              <td className="p-2.5 font-mono font-bold text-[#0ca678]">${finalCost.toFixed(0)}</td>
            </tr>
            <tr className="bg-[#f8fafc] dark:bg-[rgba(255,255,255,0.04)]">
              <td className="p-2.5 font-bold" colSpan={4}>Total GPU Budget</td>
              <td className="p-2.5 font-mono font-bold text-base">${total.toFixed(0)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p className="text-[10px] text-[#94a3b8] leading-relaxed">
        Oracle API (Gemini 3.5 Pro, ~1,000 questions) adds ~$1–3 — negligible. The Dev phase uses Qwen3.5-9B / Gemma 4 12B / Phi-4-Reasoning 14B on an RTX 4090. The Final phase uses Qwen3.6-27B / Gemma 4 26B A4B / Mistral Small 3.2 24B on an A100 80GB. Pipeline code is identical between phases — only the model config changes.
      </p>
    </div>
  );
}
