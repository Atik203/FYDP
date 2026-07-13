import { Section, SectionTitle, ColBox, TwoCol } from '@/components/shared/Section';
import { Callout } from '@/components/shared/Callout';
import { InfoGrid } from '@/components/shared/InfoGrid';

export function Idea3Content() {
  return (
    <>
      {/* 1. Core Idea */}
      <Section accent="blue">
        <SectionTitle icon="💡">1. Core Idea</SectionTitle>
        <p className="mb-3">
          LLMs treat knowledge as timeless, blending facts from different eras into incoherent answers. Standard RAG
          compounds this by retrieving the "most semantically similar" text regardless of temporal validity. We propose{' '}
          <strong>Chrono-RAG</strong> — a retrieval-augmented generation framework that routes queries through a{' '}
          <em>Temporal Knowledge Graph (TKG)</em>, where every fact is stored as a time-bounded quadruple{' '}
          <code>(Subject, Predicate, Object, [t_start, t_end])</code>. The system enforces chronological isolation:
          only facts valid at the query's reference time are retrieved and injected into context.
        </p>
        <Callout variant="success" title="🎯 Core Research Contribution">
          <strong>Chrono-RAG</strong> introduces <em>temporal validity scoring</em> as a first-class retrieval
          criterion, combining semantic relevance with time-bounded fact currency to eliminate temporal hallucination
          — LLMs citing outdated facts as current, or confusing temporally adjacent states of evolving knowledge.
        </Callout>
      </Section>

      {/* 2. Problem Statement */}
      <Section>
        <SectionTitle icon="🔍">2. Problem Statement</SectionTitle>
        <h3 className="text-base font-semibold text-[#1e2a4a] mt-4 mb-2">2.1 The Temporal Hallucination Problem</h3>
        <p className="mb-3 text-sm">
          LLMs are trained on static snapshots. Their parametric knowledge encodes facts that may have since changed —
          yet the model cannot distinguish between a fact that is permanently true (e.g., water is H₂O) and one that
          was true only during a specific historical period (e.g., the CEO of a company in 2019). Standard RAG
          retrieves semantically similar documents without temporal filtering, meaning it may inject outdated evidence
          as authoritative.
        </p>
        <TwoCol>
          <ColBox>
            <h4 className="text-sm font-semibold mt-0 mb-2">Challenge A — Knowledge Graph Construction</h4>
            <p className="text-sm text-[#64748b] mb-0">Automatically extracting time-bounded quadruples (S, P, O, [t_start, t_end]) from heterogeneous text sources with high precision.</p>
          </ColBox>
          <ColBox>
            <h4 className="text-sm font-semibold mt-0 mb-2">Challenge B — Temporal Conflict Resolution</h4>
            <p className="text-sm text-[#64748b] mb-0">When the LLM's parametric memory conflicts with the TKG retrieval, determining which source is more temporally authoritative for the given query time.</p>
          </ColBox>
          <ColBox>
            <h4 className="text-sm font-semibold mt-0 mb-2">Challenge C — Query Time Anchoring</h4>
            <p className="text-sm text-[#64748b] mb-0">Correctly inferring the temporal reference point of a query — which may be implicit ("the current president") or explicit ("as of 2022, who led...").</p>
          </ColBox>
          <ColBox>
            <h4 className="text-sm font-semibold mt-0 mb-2">Challenge D — Temporal Validity Scoring</h4>
            <p className="text-sm text-[#64748b] mb-0">Designing a combined relevance × temporal-currency score that balances semantic similarity with fact freshness without degrading general QA performance.</p>
          </ColBox>
        </TwoCol>
      </Section>

      {/* 3. Related Work */}
      <Section>
        <SectionTitle icon="📚">3. Existing Solutions & Gap</SectionTitle>
        <div className="overflow-x-auto rounded-lg shadow-sm">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                {['System', 'Year', 'Approach', 'Temporal Limitation'].map((h) => (
                  <th key={h} className="p-3 text-left text-xs font-bold bg-[#f1f5f9] border-b-2 border-[#e2e8f0]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ['TKGQA (Saxena et al.)', '2021', 'QA over temporal KGs with entity links', 'Requires pre-built gold KG; no open-domain generalization'],
                ['TempLAMA (Dhingra et al.)', '2022', 'Temporal probing benchmark for LLMs', 'Diagnostic only — no retrieval augmentation proposed'],
                ['GenTKGQA (He et al.)', '2023', 'Generative QA with TKG context injection', 'Static KG; no dynamic update or parametric-memory conflict resolution'],
                ['StreamingQA (Liska et al.)', '2022', 'Streaming news QA with recency bias', 'No structured temporal graph; recency ≠ validity at query time'],
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
          No RAG system enforces <strong>temporal validity as a first-class retrieval criterion</strong>. Existing
          temporal QA systems either rely on pre-built gold KGs (not scalable) or use recency bias (not the same as
          validity at query time). Chrono-RAG closes this gap with a dynamically updated TKG and an explicit
          temporal conflict resolution module.
        </Callout>
      </Section>

      {/* 4. Architecture */}
      <Section accent="blue">
        <SectionTitle icon="🏗️">4. Proposed Chrono-RAG Architecture</SectionTitle>
        <div className="bg-[#f0f7ff] border border-[#bfdbfe] rounded-md p-3 font-mono text-sm text-center mb-4">
          Query → Temporal Anchor Extraction → TKG Retrieval (time-filtered) → Parametric Memory Probe → Conflict Resolution → Answer
        </div>
        <TwoCol>
          <ColBox>
            <h4 className="text-sm font-semibold mt-0 mb-2">Layer 1 — Temporal Anchor Extraction</h4>
            <p className="text-sm text-[#64748b] mb-0">A fine-tuned span extractor identifies the query's temporal reference point (explicit date or implicit "current"). Maps to a point or interval on the timeline.</p>
          </ColBox>
          <ColBox>
            <h4 className="text-sm font-semibold mt-0 mb-2">Layer 2 — TKG Retrieval</h4>
            <p className="text-sm text-[#64748b] mb-0">FAISS index over (S, P, O) embeddings, filtered by temporal validity: only quadruples with [t_start ≤ query_time ≤ t_end] are retrieved. Ranked by semantic relevance × temporal currency score.</p>
          </ColBox>
          <ColBox>
            <h4 className="text-sm font-semibold mt-0 mb-2">Layer 3 — Parametric Memory Probe</h4>
            <p className="text-sm text-[#64748b] mb-0">The LLM's own knowledge is probed for the same query to identify the model's parametric answer and its estimated "knowledge date" (using uncertainty quantification).</p>
          </ColBox>
          <ColBox>
            <h4 className="text-sm font-semibold mt-0 mb-2">Conflict Resolution</h4>
            <p className="text-sm text-[#64748b] mb-0">When TKG answer ≠ parametric answer: the more temporally precise source wins. If TKG validity interval tightly contains the query time, TKG overrides. Otherwise, a chain-of-thought arbitration prompt is used.</p>
          </ColBox>
        </TwoCol>
      </Section>

      {/* 5. Methodology */}
      <Section>
        <SectionTitle icon="🔬">5. Methodology</SectionTitle>
        <InfoGrid cards={[
          { label: 'TempLAMA', value: '1,364 temporal probes', sub: 'Primary benchmark for temporal QA accuracy. Public.' },
          { label: 'TimeQA (Chen et al., 2021)', value: '70K QA pairs from Wikipedia history', sub: 'Cross-domain temporal QA generalization. Public.' },
          { label: 'TempoQA (Tan et al., 2023)', value: '5,000 temporally complex QA pairs', sub: 'Multi-hop temporal reasoning evaluation. Public.' },
          { label: 'StreamingQA', value: '900K QA from news streams', sub: 'Dynamic knowledge stream evaluation. Public.' },
        ]} />
      </Section>

      {/* 6. Expected Results */}
      <Section>
        <SectionTitle icon="📈">6. Expected Results</SectionTitle>
        <TwoCol>
          <ColBox>
            <h4 className="text-sm font-semibold mt-0 mb-2">Primary: +15% Temporal Accuracy</h4>
            <p className="text-sm text-[#64748b] mb-0">Chrono-RAG achieves ≥15% improvement in temporal question accuracy vs. vanilla RAG on TempLAMA and TimeQA, measured by exact match + temporal precision.</p>
          </ColBox>
          <ColBox>
            <h4 className="text-sm font-semibold mt-0 mb-2">Secondary: −40% Hallucination Rate</h4>
            <p className="text-sm text-[#64748b] mb-0">Temporal hallucination rate (outputting outdated facts as current) drops by ≥40% vs. standard RAG baseline, as measured by TempHall metric suite.</p>
          </ColBox>
          <ColBox>
            <h4 className="text-sm font-semibold mt-0 mb-2">Temporal Isolation Score {'>'} 85%</h4>
            <p className="text-sm text-[#64748b] mb-0">The system correctly ignores facts outside the query's valid temporal window in ≥85% of cases — measured by injecting contradictory outdated facts into retrieval.</p>
          </ColBox>
          <ColBox>
            <h4 className="text-sm font-semibold mt-0 mb-2">Generalisation: Stable general QA</h4>
            <p className="text-sm text-[#64748b] mb-0">On non-temporal queries (MMLU, TriviaQA), Chrono-RAG performs within 2% of vanilla RAG — no regression on general factual QA.</p>
          </ColBox>
        </TwoCol>
      </Section>

      {/* Q1 Justification */}
      <Section>
        <SectionTitle icon="🎯">7. Q1 Publication Justification</SectionTitle>
        <Callout variant="success" title="Why ACL / WWW / KDD 2027">
          <ul className="text-sm space-y-1">
            <li><strong>Novel criterion:</strong> Temporal validity as a first-class retrieval criterion — distinct from recency bias or knowledge cutoff workarounds.</li>
            <li><strong>Complete pipeline:</strong> End-to-end TKG construction + retrieval + conflict resolution, evaluated on 4 public benchmarks.</li>
            <li><strong>Practical impact:</strong> Directly addresses a real pain point of deployed RAG systems in rapidly evolving domains (law, medicine, finance).</li>
          </ul>
        </Callout>
      </Section>
    </>
  );
}
