import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  BookOpen,
  Brain,
  CornerRightDown,
  FileSearch,
  Gavel,
  HelpCircle,
  RefreshCw,
  Scale,
  Sparkles,
  Users,
  Zap,
  ArrowDown,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface StageInfo {
  id: string;
  icon: LucideIcon;
  label: string;
  short: string;
  color: string;
  plain: string;
  io: string;
  fail: string;
}

const STAGES: StageInfo[] = [
  {
    id: "input",
    icon: HelpCircle,
    label: "Question In",
    short: "Scientific question",
    color: "#1c7ed6",
    plain: "A hard scientific question enters the system. The correct answer is hidden from the agents — it is only used later to score results.",
    io: "In: raw question string · Out: question forwarded to the gate",
    fail: "N/A — entry point.",
  },
  {
    id: "gate",
    icon: Brain,
    label: "Confidence Gate",
    short: "Debate needed?",
    color: "#f08c00",
    plain: "A cheap check decides whether the question is easy enough to answer directly, or hard enough to need the full debate. Saves compute on easy questions.",
    io: "In: question · Out: debate = true / false",
    fail: "Mis-labels a hard question as easy → answered without debate. Low stakes: eval sets are pre-filtered to genuinely divergent questions.",
  },
  {
    id: "direct",
    icon: Zap,
    label: "Direct Answer",
    short: "Confident path",
    color: "#2b8a3e",
    plain: "If the gate is confident, the system skips the debate entirely and returns a direct answer. This is the 'confident' branch of the fork.",
    io: "In: easy question · Out: answer straight to output",
    fail: "None — only affects throughput, never correctness of the studied cases.",
  },
  {
    id: "agents",
    icon: Users,
    label: "Agent Pool (N=3)",
    short: "Uncertain path",
    color: "#7c3aed",
    plain: "Three DIFFERENT model families (Qwen3-32B, Mistral-Small-3.2, Phi-4-Reasoning) each answer independently. Different families make different mistakes, reducing shared blind spots.",
    io: "In: question · Out: 3 positions + reasoning, each starting at trust 1/3",
    fail: "Unparseable output → fallback extraction. Timeout → retry once, else mark INCONCLUSIVE for that round.",
  },
  {
    id: "decomp",
    icon: FileSearch,
    label: "Claim Decomposition",
    short: "Atomic claims",
    color: "#3b5bdb",
    plain: "Each agent's answer is split into small, individually checkable factual statements — so evidence can be scored per claim, not per whole paragraph.",
    io: "In: agent answers · Out: tagged atomic claims per agent",
    fail: "Tagging fails → regex + LLM fallback extraction pass; skip that agent's turn only if both fail.",
  },
  {
    id: "retrieval",
    icon: BookOpen,
    label: "Source-Partitioned RAG",
    short: "A→PubMed B→ArXiv C→S2",
    color: "#0ca678",
    plain: "Each agent's claims are searched in a DIFFERENT database so the debate isn't reduced to 'whoever searched the same corpus best'. A cross-encoder reranks passages.",
    io: "In: atomic claims · Out: top passages per claim",
    fail: "No evidence found → mark claim abstained (no reward/penalty). API down → cache + backoff, then OpenAlex fallback.",
  },
  {
    id: "scoring",
    icon: Scale,
    label: "Evidence Scoring",
    short: "Supports / contradicts",
    color: "#2b8a3e",
    plain: "The reranker labels every claim as SUPPORTED, CONTRADICTED, or NO EVIDENCE. This is the first signal that comes from OUTSIDE the debate's own social dynamics.",
    io: "In: claim + passages · Out: verdict + relevance score",
    fail: "Two valid sources disagree → flag claim 'contested', report separately from clean cases.",
  },
  {
    id: "trust",
    icon: RefreshCw,
    label: "Trust Update ★",
    short: "The core mechanism",
    color: "#e03131",
    plain: "Sᵢ(t+1) = Sᵢ(t) + α·Vᵢ − β·Hᵢ, then softmax → clamp[0.1, 0.9] → renormalize. Supported claims raise trust; contradicted lower it — bounded so nobody is silenced or dominant.",
    io: "In: per-agent supported/contradicted rates · Out: updated trust vector Tᵢ",
    fail: "All agents pushed to floor → prevented by the hard 0.1 clamp (Proposition 1 boundedness), verified empirically.",
  },
  {
    id: "revise",
    icon: RefreshCw,
    label: "Revision Rounds (K=3)",
    short: "Loops back",
    color: "#7c3aed",
    plain: "Agents see each other's arguments AND their own trust standing, then revise. The retrieval → score → update loop repeats for K=3 rounds. An injection point sits between rounds for stress-testing.",
    io: "In: peer positions + own trust · Out: revised positions (loops to decomposition)",
    fail: "Context overflow on long histories → cap K=3, summarize old rounds, keep trust trajectory numerically.",
  },
  {
    id: "adjudicate",
    icon: Gavel,
    label: "Trust-Weighted Verdict",
    short: "Not majority vote",
    color: "#3b5bdb",
    plain: "The final answer = argmax over Σ(Tᵢ × positionᵢ) at the last round. A correct, evidence-backed minority can out-weigh two unsupported majority agents.",
    io: "In: final trust vector + positions · Out: single chosen answer",
    fail: "N/A — deterministic aggregation over logged trust values.",
  },
  {
    id: "output",
    icon: Sparkles,
    label: "Final Output",
    short: "Answer + trail",
    color: "#0ca678",
    plain: "One answer, the papers that support it, the full trust trajectory, and each agent's reasoning — a transparent, auditable result.",
    io: "In: chosen answer + logs · Out: answer + citations + trust trajectory",
    fail: "N/A — packaging step.",
  },
];

const MAIN_PATH = ["input", "gate", "agents", "decomp", "retrieval", "scoring", "trust", "revise", "adjudicate", "output"];
const BRANCH_PATH = ["direct"];

function StageCard({
  stage,
  isActive,
  onClick,
}: {
  stage: StageInfo;
  isActive: boolean;
  onClick: () => void;
}) {
  const Icon = stage.icon;
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full text-left rounded-lg border-2 bg-white dark:bg-[#1a1d35] px-3 py-2.5 shadow-sm transition-all",
        "hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3b5bdb]",
        isActive
          ? "border-[var(--stage-color)]"
          : "border-[var(--stage-color)]/40 dark:border-[var(--stage-color)]/30",
      )}
      style={{ "--stage-color": stage.color } as React.CSSProperties}
    >
      <div className="flex items-center gap-2.5">
        <span
          className="flex items-center justify-center w-8 h-8 rounded-md flex-shrink-0"
          style={{ background: `${stage.color}1a`, color: stage.color }}
        >
          <Icon size={16} />
        </span>
        <div className="min-w-0">
          <div className="text-[13px] font-bold text-[#1e2d3d] dark:text-[#e2e8f0] leading-tight">
            {stage.label}
          </div>
          <div className="text-[11px] text-[#64748b] dark:text-[#94a3b8] leading-tight truncate">
            {stage.short}
          </div>
        </div>
      </div>
    </button>
  );
}

function ConnectorLine({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col items-center py-0.5", className)}>
      <div className="w-[2px] h-4 bg-[#cbd5e1] dark:bg-[rgba(255,255,255,0.15)]" />
    </div>
  );
}

function DetailPanel({ stage, onClose }: { stage: StageInfo; onClose: () => void }) {
  const Icon = stage.icon;
  return (
    <div className="rounded-xl border border-[#e2e8f0] dark:border-[rgba(255,255,255,0.1)] bg-white dark:bg-[#1a1d35] p-4 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <span
            className="flex items-center justify-center w-9 h-9 rounded-lg flex-shrink-0"
            style={{ background: `${stage.color}1a`, color: stage.color }}
          >
            <Icon size={18} />
          </span>
          <span className="text-sm font-bold text-[#1e2d3d] dark:text-[#e2e8f0]">
            {stage.label}
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex items-center justify-center w-6 h-6 rounded-md text-[#94a3b8] hover:text-[#475569] hover:bg-[#f1f5f9] dark:hover:bg-[rgba(255,255,255,0.1)] transition-colors"
          aria-label="Close detail"
        >
          ✕
        </button>
      </div>
      <p className="text-sm text-[#334155] dark:text-[#cbd5e1] leading-relaxed mb-3">
        {stage.plain}
      </p>
      <div className="space-y-2.5">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wide text-[#0ca678] mb-0.5">
            Inputs → Outputs
          </div>
          <p className="text-xs text-[#64748b] dark:text-[#94a3b8]">{stage.io}</p>
        </div>
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wide text-[#e03131] mb-0.5">
            Failure / Recovery
          </div>
          <p className="text-xs text-[#64748b] dark:text-[#94a3b8]">{stage.fail}</p>
        </div>
      </div>
    </div>
  );
}

export function ArchitectureDiagram() {
  const [selected, setSelected] = useState<StageInfo | null>(null);

  const stageMap = new Map(STAGES.map((s) => [s.id, s]));

  return (
    <div className="rounded-xl border border-[#e2e8f0] dark:border-[rgba(255,255,255,0.1)] overflow-hidden bg-white dark:bg-[#151830]">
      {/* Instructions bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#e2e8f0] dark:border-[rgba(255,255,255,0.08)] bg-[#f8fafc] dark:bg-[rgba(255,255,255,0.02)]">
        <span className="text-xs font-semibold text-[#64748b] dark:text-[#94a3b8]">
          Scroll to explore · <strong className="text-[#3b5bdb] dark:text-[#93c5fd]">tap any stage</strong> for a plain-English explanation
        </span>
      </div>

      {/* Diagram — vertical flow with branch on desktop */}
      <div className="p-4 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:gap-8">
          {/* Main pipeline column */}
          <div className="flex-1 min-w-0">
            {MAIN_PATH.map((id, i) => {
              const stage = stageMap.get(id)!;
              const isLast = i === MAIN_PATH.length - 1;
              return (
                <div key={id}>
                  {/* Connector from previous, with special branch indicator after gate */}
                  {i > 0 && id === "agents" && (
                    <div className="relative flex items-center justify-center py-0.5">
                      <div className="w-[2px] h-3 bg-[#cbd5e1] dark:bg-[rgba(255,255,255,0.15)]" />
                      <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 flex items-center justify-center lg:hidden">
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#f08c00] bg-[#f08c00]/10 px-2 py-0.5 rounded-full">
                          <CornerRightDown size={10} />
                          uncertain
                        </span>
                      </div>
                    </div>
                  )}
                  {i > 0 && id !== "agents" && <ConnectorLine />}

                  {/* Branch indicator before gate → agents (desktop: before agents card) */}
                  {id === "agents" && (
                    <div className="hidden lg:flex items-center justify-start pl-4 mb-1">
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#f08c00] bg-[#f08c00]/10 px-2 py-0.5 rounded-full">
                        <CornerRightDown size={10} />
                        uncertain path
                      </span>
                    </div>
                  )}

                  {/* Loop indicator after revise */}
                  {id === "revise" && (
                    <div className="flex items-center justify-end pr-2 mb-1">
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#7c3aed] bg-[#7c3aed]/10 px-2 py-0.5 rounded-full">
                        <RefreshCw size={10} />
                        K=3 rounds
                      </span>
                    </div>
                  )}

                  <StageCard
                    stage={stage}
                    isActive={selected?.id === id}
                    onClick={() => setSelected(selected?.id === id ? null : stage)}
                  />

                  {/* Connector from direct → output (after output in main list) */}
                  {isLast && (
                    <div className="hidden lg:flex items-center justify-center py-0.5">
                      <div className="w-[2px] h-3 bg-[#2b8a3e]/50 dark:bg-[rgba(43,138,62,0.5)]" />
                      <span className="text-[10px] text-[#2b8a3e] ml-1">joined by confident path</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Branch column (desktop) + inline branch (mobile) */}
          <div className="lg:w-auto">
            {/* Desktop: branch column */}
            <div className="hidden lg:flex flex-col items-center">
              {/* Branch connector from gate */}
              <div className="flex items-center gap-2 py-1">
                <div className="h-[2px] w-8 bg-[#2b8a3e]/50" />
                <span className="text-[10px] font-semibold text-[#2b8a3e] whitespace-nowrap">
                  confident
                </span>
                <div className="h-[2px] w-8 bg-[#2b8a3e]/50" />
              </div>

              {BRANCH_PATH.map((id) => {
                const stage = stageMap.get(id)!;
                return (
                  <div key={id} className="flex flex-col items-center">
                    <StageCard
                      stage={stage}
                      isActive={selected?.id === id}
                      onClick={() => setSelected(selected?.id === id ? null : stage)}
                    />
                    <div className="flex items-center gap-2 py-1">
                      <div className="h-[2px] w-8 bg-[#2b8a3e]/50" />
                      <span className="text-[10px] text-[#2b8a3e] whitespace-nowrap">joins output</span>
                      <div className="h-[2px] w-8 bg-[#2b8a3e]/50" />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Mobile: inline branch after gate */}
            <div className="lg:hidden mt-2 pl-4 border-l-2 border-[#2b8a3e]/40 ml-4">
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#2b8a3e] bg-[#2b8a3e]/10 px-2 py-0.5 rounded-full mb-2">
                confident path
              </span>
              {BRANCH_PATH.map((id) => {
                const stage = stageMap.get(id)!;
                return (
                  <div key={id}>
                    <StageCard
                      stage={stage}
                      isActive={selected?.id === id}
                      onClick={() => setSelected(selected?.id === id ? null : stage)}
                    />
                  </div>
                );
              })}
              <div className="flex items-center gap-1.5 py-2 text-[10px] text-[#2b8a3e]">
                <ArrowDown size={10} />
                joins output
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detail panel */}
      {selected && (
        <div className="border-t border-[#e2e8f0] dark:border-[rgba(255,255,255,0.08)] p-4 sm:p-6">
          <DetailPanel stage={selected} onClose={() => setSelected(null)} />
        </div>
      )}
    </div>
  );
}
