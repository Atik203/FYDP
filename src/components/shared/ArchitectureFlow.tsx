import { useCallback, useState } from "react";
import {
  Background,
  Controls,
  Handle,
  MiniMap,
  Position,
  ReactFlow,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  BookOpen,
  Brain,
  FileSearch,
  Gavel,
  HelpCircle,
  RefreshCw,
  Scale,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/**
 * Interactive architecture graph for Blueprint §4–§6.
 * Pan / zoom / drag via React Flow. Click any node to read a plain-English
 * explanation plus its inputs, outputs, and failure/recovery in the panel.
 * The confidence gate visibly BRANCHES: confident → direct answer,
 * uncertain → full debate. A dashed loop shows the K=3 revision rounds.
 */

interface StageData extends Record<string, unknown> {
  icon: LucideIcon;
  label: string;
  short: string;
  color: string;
  plain: string;
  io: string;
  fail: string;
}

const ICONS: Record<string, LucideIcon> = {
  input: HelpCircle,
  gate: Brain,
  direct: Zap,
  agents: Users,
  decomp: FileSearch,
  retrieval: BookOpen,
  scoring: Scale,
  trust: RefreshCw,
  revise: RefreshCw,
  adjudicate: Gavel,
  output: Sparkles,
};

function StageNode({ data, selected }: NodeProps<Node<StageData>>) {
  const Icon = data.icon;
  return (
    <div
      className="rounded-lg border-2 bg-white dark:bg-[#1a1d35] px-3 py-2 shadow-sm transition-all"
      style={{
        borderColor: selected ? data.color : `${data.color}66`,
        boxShadow: selected ? `0 0 0 3px ${data.color}33` : undefined,
        width: 190,
      }}
    >
      <Handle type="target" position={Position.Top} style={{ background: data.color }} />
      <Handle type="target" position={Position.Left} style={{ background: data.color }} id="l" />
      <div className="flex items-center gap-2">
        <span
          className="flex items-center justify-center w-7 h-7 rounded-md flex-shrink-0"
          style={{ background: `${data.color}1a`, color: data.color }}
        >
          <Icon size={15} />
        </span>
        <div className="min-w-0">
          <div className="text-[12px] font-bold text-[#1e2d3d] dark:text-[#e2e8f0] leading-tight">
            {data.label}
          </div>
          <div className="text-[10px] text-[#64748b] dark:text-[#94a3b8] leading-tight truncate">
            {data.short}
          </div>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} style={{ background: data.color }} />
      <Handle type="source" position={Position.Right} style={{ background: data.color }} id="r" />
    </div>
  );
}

const nodeTypes = { stage: StageNode };

const mk = (
  id: string,
  x: number,
  y: number,
  label: string,
  short: string,
  color: string,
  plain: string,
  io: string,
  fail: string,
): Node<StageData> => ({
  id,
  type: "stage",
  position: { x, y },
  data: { icon: ICONS[id], label, short, color, plain, io, fail },
});

const NODES: Node<StageData>[] = [
  mk("input", 210, 0, "Question In", "Scientific question", "#1c7ed6",
    "A hard scientific question enters the system. The correct answer is hidden from the agents — it is only used later to score results.",
    "In: raw question string · Out: question forwarded to the gate",
    "N/A — entry point."),
  mk("gate", 210, 110, "Confidence Gate", "Debate needed?", "#f08c00",
    "A cheap check decides whether the question is easy enough to answer directly, or hard enough to need the full debate. Saves compute on easy questions.",
    "In: question · Out: debate = true / false",
    "Mis-labels a hard question as easy → answered without debate. Low stakes: eval sets are pre-filtered to genuinely divergent questions."),
  mk("direct", 470, 110, "Direct Answer", "Confident path", "#2b8a3e",
    "If the gate is confident, the system skips the debate entirely and returns a direct answer. This is the 'confident' branch of the fork.",
    "In: easy question · Out: answer straight to output",
    "None — only affects throughput, never correctness of the studied cases."),
  mk("agents", 210, 240, "Agent Pool (N=3)", "Uncertain path", "#7c3aed",
    "Three DIFFERENT model families (Qwen3-32B, Mistral-Small-3.2, Phi-4-Reasoning) each answer independently. Different families make different mistakes, reducing shared blind spots.",
    "In: question · Out: 3 positions + reasoning, each starting at trust 1/3",
    "Unparseable output → fallback extraction. Timeout → retry once, else mark INCONCLUSIVE for that round."),
  mk("decomp", 210, 350, "Claim Decomposition", "Atomic claims", "#3b5bdb",
    "Each agent's answer is split into small, individually checkable factual statements — so evidence can be scored per claim, not per whole paragraph.",
    "In: agent answers · Out: tagged atomic claims per agent",
    "Tagging fails → regex + LLM fallback extraction pass; skip that agent's turn only if both fail."),
  mk("retrieval", 210, 460, "Source-Partitioned RAG", "A→PubMed B→ArXiv C→S2", "#0ca678",
    "Each agent's claims are searched in a DIFFERENT database so the debate isn't reduced to 'whoever searched the same corpus best'. A cross-encoder reranks passages.",
    "In: atomic claims · Out: top passages per claim",
    "No evidence found → mark claim abstained (no reward/penalty). API down → cache + backoff, then OpenAlex fallback."),
  mk("scoring", 210, 570, "Evidence Scoring", "Supports / contradicts", "#2b8a3e",
    "The reranker labels every claim as SUPPORTED, CONTRADICTED, or NO EVIDENCE. This is the first signal that comes from OUTSIDE the debate's own social dynamics.",
    "In: claim + passages · Out: verdict + relevance score",
    "Two valid sources disagree → flag claim 'contested', report separately from clean cases."),
  mk("trust", 210, 680, "Trust Update ★", "The core mechanism", "#e03131",
    "Sᵢ(t+1) = Sᵢ(t) + α·Vᵢ − β·Hᵢ, then softmax → clamp[0.1, 0.9] → renormalize. Supported claims raise trust; contradicted lower it — bounded so nobody is silenced or dominant.",
    "In: per-agent supported/contradicted rates · Out: updated trust vector Tᵢ",
    "All agents pushed to floor → prevented by the hard 0.1 clamp (Proposition 1 boundedness), verified empirically."),
  mk("revise", 210, 790, "Revision Rounds (K=3)", "Loops back", "#7c3aed",
    "Agents see each other's arguments AND their own trust standing, then revise. The retrieval → score → update loop repeats for K=3 rounds. An injection point sits between rounds for stress-testing.",
    "In: peer positions + own trust · Out: revised positions (loops to decomposition)",
    "Context overflow on long histories → cap K=3, summarize old rounds, keep trust trajectory numerically."),
  mk("adjudicate", 210, 900, "Trust-Weighted Verdict", "Not majority vote", "#3b5bdb",
    "The final answer = argmax over Σ(Tᵢ × positionᵢ) at the last round. A correct, evidence-backed minority can out-weigh two unsupported majority agents.",
    "In: final trust vector + positions · Out: single chosen answer",
    "N/A — deterministic aggregation over logged trust values."),
  mk("output", 210, 1010, "Final Output", "Answer + trail", "#0ca678",
    "One answer, the papers that support it, the full trust trajectory, and each agent's reasoning — a transparent, auditable result.",
    "In: chosen answer + logs · Out: answer + citations + trust trajectory",
    "N/A — packaging step."),
];

const edge = (
  id: string,
  source: string,
  target: string,
  color: string,
  opts: Partial<Edge> = {},
): Edge => ({
  id,
  source,
  target,
  animated: true,
  style: { stroke: color, strokeWidth: 2 },
  ...opts,
});

const EDGES: Edge[] = [
  edge("e-in-gate", "input", "gate", "#1c7ed6"),
  // Branch: confident → direct (dashed, not animated), uncertain → agents
  edge("e-gate-direct", "gate", "direct", "#2b8a3e", {
    sourceHandle: "r",
    targetHandle: "l",
    animated: false,
    style: { stroke: "#2b8a3e", strokeWidth: 2, strokeDasharray: "5 4" },
    label: "confident",
  }),
  edge("e-gate-agents", "gate", "agents", "#f08c00", { label: "uncertain" }),
  edge("e-agents-decomp", "agents", "decomp", "#7c3aed"),
  edge("e-decomp-retr", "decomp", "retrieval", "#3b5bdb"),
  edge("e-retr-score", "retrieval", "scoring", "#0ca678"),
  edge("e-score-trust", "scoring", "trust", "#2b8a3e"),
  edge("e-trust-revise", "trust", "revise", "#e03131"),
  // Loop back: revision → decomposition (K rounds)
  edge("e-revise-loop", "revise", "decomp", "#7c3aed", {
    sourceHandle: "r",
    targetHandle: "r",
    animated: false,
    style: { stroke: "#7c3aed", strokeWidth: 2, strokeDasharray: "5 4" },
    label: "K=3 rounds",
  }),
  edge("e-revise-adj", "revise", "adjudicate", "#7c3aed"),
  edge("e-adj-out", "adjudicate", "output", "#3b5bdb"),
  // Direct answer joins the output
  edge("e-direct-out", "direct", "output", "#2b8a3e", {
    animated: false,
    style: { stroke: "#2b8a3e", strokeWidth: 2, strokeDasharray: "5 4" },
  }),
];

export function ArchitectureFlow() {
  const [selected, setSelected] = useState<StageData | null>(null);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelected(node.data as StageData);
  }, []);

  return (
    <div className="rounded-xl border border-[#e2e8f0] dark:border-[rgba(255,255,255,0.1)] overflow-hidden bg-white dark:bg-[#151830]">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#e2e8f0] dark:border-[rgba(255,255,255,0.08)] bg-[#f8fafc] dark:bg-[rgba(255,255,255,0.02)]">
        <span className="text-xs font-semibold text-[#64748b] dark:text-[#94a3b8]">
          Drag to pan · scroll to zoom · <strong className="text-[#3b5bdb] dark:text-[#93c5fd]">click any node</strong> for a plain-English explanation
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px]">
        {/* Canvas */}
        <div style={{ height: 560 }} className="bg-[#f0f2f7] dark:bg-[#0f1225]">
          <ReactFlow
            nodes={NODES}
            edges={EDGES}
            nodeTypes={nodeTypes}
            onNodeClick={onNodeClick}
            fitView
            fitViewOptions={{ padding: 0.15 }}
            minZoom={0.3}
            maxZoom={1.5}
            proOptions={{ hideAttribution: true }}
          >
            <Background color="#cbd5e1" gap={18} />
            <Controls showInteractive={false} />
            <MiniMap
              pannable
              zoomable
              nodeColor={(n) => (n.data as StageData).color}
              maskColor="rgba(0,0,0,0.05)"
            />
          </ReactFlow>
        </div>

        {/* Detail panel */}
        <div className="border-t lg:border-t-0 lg:border-l border-[#e2e8f0] dark:border-[rgba(255,255,255,0.08)] p-4 max-h-[560px] overflow-y-auto">
          {selected ? (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0"
                  style={{ background: `${selected.color}1a`, color: selected.color }}
                >
                  <selected.icon size={16} />
                </span>
                <span className="text-sm font-bold text-[#1e2d3d] dark:text-[#e2e8f0]">
                  {selected.label}
                </span>
              </div>
              <p className="text-xs text-[#334155] dark:text-[#cbd5e1] leading-relaxed mb-3">
                {selected.plain}
              </p>
              <div className="space-y-2.5">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wide text-[#0ca678] mb-0.5">
                    Inputs → Outputs
                  </div>
                  <p className="text-[11px] text-[#64748b] dark:text-[#94a3b8]">
                    {selected.io}
                  </p>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wide text-[#e03131] mb-0.5">
                    Failure / Recovery
                  </div>
                  <p className="text-[11px] text-[#64748b] dark:text-[#94a3b8]">
                    {selected.fail}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center py-8">
              <span className="flex items-center justify-center w-12 h-12 rounded-full bg-[#3b5bdb]/10 text-[#3b5bdb] dark:text-[#93c5fd] mb-3">
                <Sparkles size={22} />
              </span>
              <p className="text-xs text-[#64748b] dark:text-[#94a3b8] leading-relaxed">
                Click any stage in the diagram to see what it does, its inputs
                and outputs, and how it fails and recovers.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
