import { Section, SectionTitle, ColBox, TwoCol } from '@/components/shared/Section';
import { Callout } from '@/components/shared/Callout';
import { InfoGrid } from '@/components/shared/InfoGrid';

export function Idea2Content() {
  return (
    <>
      {/* 1. Core Idea */}
      <Section accent="blue">
        <SectionTitle icon="💡">1. Core Idea</SectionTitle>
        <p className="mb-3">
          Scientific claim verification is currently treated as a flat sequence-pair classification task: given a claim
          and an abstract, predict <em>Support / Refute / Not Enough Info</em>. This fundamentally misrepresents how
          scientific arguments work. We propose modelling the <strong>argumentative discourse structure</strong> of
          source literature as a heterogeneous directed graph — where nodes represent discourse units (Background,
          Method, Result, Conclusion) and edges encode argumentative relations (supports, contradicts, depends-on) —
          and performing verification as <em>graph-based multi-hop reasoning</em> using an LLM-initialized Graph
          Attention Network.
        </p>
        <Callout variant="success" title="🎯 Core Research Contribution">
          The primary contribution is a <strong>Directed Heterogeneous Discourse Graph (DHDG)</strong> representation
          of scientific papers with a GNN-based verification head — the first system to perform claim verification via
          graph-level multi-hop inference rather than flat text classification. Secondary contribution: an improved
          discourse parsing pipeline combining SciBERT and LLM-based fallback extraction.
        </Callout>
      </Section>

      {/* 2. Problem Statement */}
      <Section>
        <SectionTitle icon="🔍">2. Problem Statement</SectionTitle>
        <h3 className="text-base font-semibold text-[#1e2a4a] mt-4 mb-2">2.1 The Scientific Misinformation Problem</h3>
        <p className="mb-3 text-sm">
          Scientific misinformation is structurally different from general misinformation. A false scientific claim is
          typically embedded in a multi-hop chain of reasoning: it may cite a real experiment using a flawed methodology,
          or draw a conclusion valid for one population but overgeneralised to another.
        </p>
        <p className="mb-3 text-sm">
          Consider the claim: <em>"Drug X reduces mortality by 30%."</em> The abstract may state this. But the Results
          section qualifies it as <em>"in subpopulation aged 65+"</em>, the Methods section reveals N=12 with no control
          group, and the Discussion acknowledges <em>"findings not replicable across ethnic groups."</em> A flat verifier
          reads the abstract and outputs "Supports." A discourse-aware system correctly identifies the logical
          qualification chain and outputs "Insufficient Evidence."
        </p>
        <h3 className="text-base font-semibold text-[#1e2a4a] mt-4 mb-2">2.2 Engineering Complexity</h3>
        <TwoCol>
          <ColBox>
            <h4 className="text-sm font-semibold mt-0 mb-2">Challenge A: Discourse Extraction</h4>
            <p className="text-sm text-[#64748b] mb-0">Automatically parsing scientific text into structured discourse graphs from noisy, heterogeneous academic writing styles — no universal standard exists.</p>
          </ColBox>
          <ColBox>
            <h4 className="text-sm font-semibold mt-0 mb-2">Challenge B: Edge Prediction</h4>
            <p className="text-sm text-[#64748b] mb-0">Predicting argumentative <em>relations</em> between sentence pairs (supports/contradicts/depends-on) is harder than node classification — requires pairwise reasoning across the full document.</p>
          </ColBox>
          <ColBox>
            <h4 className="text-sm font-semibold mt-0 mb-2">Challenge C: GNN + LLM Integration</h4>
            <p className="text-sm text-[#64748b] mb-0">Combining dense LLM embeddings (high-dimensional, semantically rich) with sparse graph structure (low-dimensional, relational) without information bottleneck requires careful architectural design.</p>
          </ColBox>
          <ColBox>
            <h4 className="text-sm font-semibold mt-0 mb-2">Challenge D: Error Propagation</h4>
            <p className="text-sm text-[#64748b] mb-0">Errors in the discourse parser cascade directly to the verification head. If the graph is wrong, GNN reasoning over it produces garbage. Quantifying and bounding this propagation is a core experimental challenge.</p>
          </ColBox>
        </TwoCol>
      </Section>

      {/* 3. Related Work */}
      <Section>
        <SectionTitle icon="📚">3. Existing Solutions & Limitations</SectionTitle>
        <div className="overflow-x-auto rounded-lg shadow-sm">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                {['System', 'Year', 'Approach', 'Key Limitation'].map((h) => (
                  <th key={h} className="p-3 text-left text-xs font-bold bg-[#f1f5f9] border-b-2 border-[#e2e8f0]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ['SciFact pipeline (Wadden et al.)', '2020', 'SciBERT for evidence retrieval + rationale selection + NLI', 'Single-sentence rationale; no structural reasoning; ~67% F1 on hard multi-hop claims'],
                ['VerT5erini (Pradeep et al.)', '2021', 'T5-based retrieval and verification', 'Stronger retrieval, same flat classification paradigm; no discourse understanding'],
                ['MultiVerS (Wadden et al.)', '2022', 'Multi-granularity attention (token/sentence/abstract)', 'Treats abstract as bag-of-sentences, not a directed argument graph'],
                ['SciArg (Lauscher et al.)', '2018', 'Gold discourse annotations for 40 CL papers', 'Annotation resource only; no verification pipeline built on it — the gap this project fills'],
              ].map(([sys, yr, approach, lim], i) => (
                <tr key={i} className="border-b border-[#e2e8f0] last:border-0 hover:bg-[#dce4ff] even:bg-[#f8fafc] transition-colors">
                  <td className="p-3"><strong>{sys}</strong></td>
                  <td className="p-3">{yr}</td>
                  <td className="p-3">{approach}</td>
                  <td className="p-3">{lim}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Callout variant="gap" title="⚠ Explicit Research Gap">
          No published system constructs the <strong>argumentative discourse graph</strong> of scientific evidence and
          performs <em>graph-based inference</em> for claim verification. The gap is the missing bridge:{' '}
          <strong>discourse structure → computational graph → multi-hop verification.</strong> Existing work either
          ignores structure entirely or annotates it without building a reasoning pipeline.
        </Callout>
      </Section>

      {/* 4. Architecture */}
      <Section accent="blue">
        <SectionTitle icon="🏗️">4. Proposed 3-Stage Architecture</SectionTitle>
        <h3 className="text-base font-semibold text-[#1e2a4a] mt-4 mb-2">Stage 1 — Discourse Graph Construction</h3>
        <p className="text-sm mb-3">
          Each sentence in the source paper is classified into a discourse role using SciBERT fine-tuned on SciArg:
          {'{'}Background, Objective, Method, Result, Conclusion{'}'}. Argumentative edges are then predicted between
          sentence pairs via a bilinear scorer. The result is a{' '}
          <strong>Directed Heterogeneous Discourse Graph (DHDG)</strong> where nodes are individual sentences typed by
          discourse role, and edges are directed argumentative relations (supports, contradicts, depends-on,
          is-evidence-for). An LLM fallback (Llama-3-8B) handles sentences below SciBERT's confidence threshold.
        </p>
        <h3 className="text-base font-semibold text-[#1e2a4a] mt-4 mb-2">Stage 2 — Graph-Augmented Encoding</h3>
        <p className="text-sm mb-3">
          Each node is embedded using SciBERT-base. These embeddings are processed through a{' '}
          <strong>2-layer Graph Attention Network (GAT)</strong> (Veličković et al., 2018) with 8 attention heads and
          256-dim hidden states. The GAT propagates information along argumentative edges, learning to weight different
          path types.
        </p>
        <h3 className="text-base font-semibold text-[#1e2a4a] mt-4 mb-2">Stage 3 — Verification Head</h3>
        <p className="text-sm mb-3">
          The claim is encoded separately (same SciBERT encoder), then attended against the graph-updated node
          embeddings via a cross-attention layer. The final pooled representation passes through a 3-class classifier:
          {'{'}Support, Refute, Not Enough Info{'}'}.


        </p>
        <TwoCol>
          <ColBox>
            <h4 className="text-sm font-semibold mt-0 mb-2">Key Hyperparameters</h4>
            <ul className="text-sm text-[#64748b] space-y-1 mb-0">
              <li>GAT layers: 2 (sweep: 1–3)</li>
              <li>Attention heads: 8</li>
              <li>Hidden dim: 256</li>
              <li>Dropout: 0.2</li>
              <li>LR: 2e-5 (SciBERT); 1e-3 (GAT)</li>
            </ul>
          </ColBox>
          <ColBox>
            <h4 className="text-sm font-semibold mt-0 mb-2">Training Strategy</h4>
            <ul className="text-sm text-[#64748b] space-y-1 mb-0">
              <li>Stage 1 trained independently on SciArg</li>
              <li>Stages 2–3 trained jointly on SciFact</li>
              <li>Gold-graph oracle run to establish upper bound</li>
              <li>Early stopping on validation Macro-F1</li>
            </ul>
          </ColBox>
        </TwoCol>
      </Section>

      {/* 5. Methodology */}
      <Section>
        <SectionTitle icon="🔬">5. Methodology</SectionTitle>
        <h3 className="text-base font-semibold text-[#1e2a4a] mt-4 mb-3">5.1 Datasets</h3>
        <InfoGrid cards={[
          { label: 'SciFact (Wadden 2020)', value: '1,409 claims; 5,183 abstracts', sub: 'Primary verification benchmark — train/dev/test splits. Public (HuggingFace)' },
          { label: 'SciArg (Lauscher 2018)', value: '40 fully annotated CL papers', sub: 'Training data for discourse parser (node + edge labels). Public (GitHub)' },
          { label: 'HealthVer (Sarrouti 2021)', value: '14,330 claim-evidence pairs', sub: 'Cross-domain evaluation (COVID-19 health claims). Public' },
        ]} />
        <h3 className="text-base font-semibold text-[#1e2a4a] mt-4 mb-3">5.2 Ablation Matrix</h3>
        <div className="overflow-x-auto rounded-lg shadow-sm">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                {['Condition', 'Discourse Graph', 'GAT Layer', 'Encoder', 'Purpose'].map((h) => (
                  <th key={h} className="p-3 text-left text-xs font-bold bg-[#f1f5f9] border-b-2 border-[#e2e8f0]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ['A — Flat baseline', '❌', '❌', 'SciBERT', 'Reproduce SciFact baseline'],
                ['B — Gold graph + GAT', 'Gold (SciArg)', '✅', 'SciBERT', 'Upper-bound with perfect parsing'],
                ['C — Predicted graph, no GAT', 'Predicted', '❌', 'SciBERT', 'Isolate graph structure value'],
                ['D — Full system', 'Predicted', '✅', 'SciBERT', 'Main proposed system'],
                ['E — Full system + LLM enc.', 'Predicted', '✅', 'Llama-3 (LoRA)', 'LLM encoder ablation'],
              ].map((row, i) => (
                <tr key={i} className="border-b border-[#e2e8f0] last:border-0 hover:bg-[#dce4ff] even:bg-[#f8fafc] transition-colors">
                  {row.map((cell, j) => <td key={j} className="p-3">{cell}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* 6. Evaluation */}
      <Section>
        <SectionTitle icon="📐">6. Evaluation Plan</SectionTitle>
        <div className="overflow-x-auto rounded-lg shadow-sm">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                {['Metric', 'Benchmark', 'Baseline', 'Our Target', 'Statistical Test'].map((h) => (
                  <th key={h} className="p-3 text-left text-xs font-bold bg-[#f1f5f9] border-b-2 border-[#e2e8f0]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ['Macro-F1', 'SciFact (test)', 'MultiVerS: 70.2%', '≥75%', 'Paired bootstrap (1000 samples)'],
                ['Hard-claim Macro-F1', 'SciFact hard subset', 'SciFact pipeline: 67%', '≥72%', 'McNemar test'],
                ['Discourse Parser F1', 'SciArg (edge pred.)', 'SciBERT alone: ~71%', '≥80%', 'F1 on held-out set'],
                ['Cross-domain F1', 'HealthVer', 'SciFact baseline', '≥68%', 'Standard eval'],
              ].map((row, i) => (
                <tr key={i} className="border-b border-[#e2e8f0] last:border-0 hover:bg-[#dce4ff] even:bg-[#f8fafc] transition-colors">
                  {row.map((cell, j) => <td key={j} className="p-3">{cell}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* Q1 Justification */}
      <Section>
        <SectionTitle icon="🎯">7. Q1 Publication Justification</SectionTitle>
        <Callout variant="success" title="Why ACL / EMNLP 2027">
          <ul className="text-sm space-y-1">
            <li><strong>Novel architecture:</strong> First graph-based discourse-aware scientific claim verification system — closes an explicit gap in the SciFact literature.</li>
            <li><strong>Strong baselines:</strong> 4+ baselines including current SOTA MultiVerS, with ablation separating each architectural component.</li>
            <li><strong>Reproducible:</strong> Open code + datasets (all public) → replication-ready submission.</li>
            <li><strong>Error analysis:</strong> Discourse parser error propagation analysis adds methodological contribution beyond the main system.</li>
          </ul>
        </Callout>
      </Section>
    </>
  );
}
