import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { Section, SectionTitle, ColBox, TwoCol } from '@/components/shared/Section';
import { KpiRow } from '@/components/shared/KpiRow';
import { Badge } from '@/components/shared/Badge';
import { Callout } from '@/components/shared/Callout';
import { Timeline } from '@/components/shared/Timeline';

const comparisonMatrix = [
  { dim: 'Novelty', scores: ['★★★★★', '★★★★☆', '★★★★☆', '★★★★☆', '★★★☆☆'] },
  { dim: 'Methodological Rigor', scores: ['★★★★☆', '★★★★★', '★★★★☆', '★★★★☆', '★★★☆☆'] },
  { dim: 'Engineering Complexity', scores: ['★★★★★', '★★★★★', '★★★★☆', '★★★★☆', '★★★★☆'] },
  { dim: '12-Month Feasibility', scores: ['★★★★☆', '★★★☆☆', '★★★★☆', '★★★☆☆', '★★★☆☆'] },
  { dim: 'Publication Readiness', scores: ['★★★★★', '★★★★☆', '★★★★☆', '★★★☆☆', '★★★☆☆'] },
];

export function ConclusionPage() {
  return (
    <>
      <PageHeader
        docType="FYDP Proposal · Conclusion & Supervisor Decision Document"
        title={<>Final Recommendation &amp;<br />Strategic Decision Framework</>}
        subtitle="Critical Comparison · Top Selections · PhD Trajectory 2026–2030"
        coverItems={[
          { label: 'Document Date', value: 'May 2026' },
          { label: 'Primary Recommendation', value: 'Idea 1 — Trust-Calibrated Debate' },
          { label: 'Backup Recommendation', value: 'Idea 2 — Arg. Verification' },
          { label: 'Decision Deadline', value: '[Date — 2 weeks from submission]' },
        ]}
      />

      <main className="max-w-[1150px] mx-auto my-10 px-5">
        {/* Decision Summary KPIs */}
        <Section>
          <SectionTitle icon="📊">Decision Summary</SectionTitle>
          <KpiRow kpis={[
            { value: '5', label: 'Ideas Evaluated', variant: 'default' },
            { value: '4.6', label: 'Top Composite Score', variant: 'green' },
            { value: '2', label: 'Recommended Ideas', variant: 'sky' },
            { value: 'Agentic AI', label: 'Recommended Domain', variant: 'amber' },
            { value: '2026–30', label: 'PhD Window', variant: 'rose' },
          ]} />
        </Section>

        {/* 1. Full Comparison Matrix */}
        <Section>
          <SectionTitle icon="⚖️">1. Full Multi-Axis Comparison Matrix</SectionTitle>
          <p className="text-sm text-[#64748b] mb-4">
            ★★★★★ = highest; ★☆☆☆☆ = lowest. All scores are the author's assessment; supervisor may annotate their own scores in the right column.
          </p>
          <div className="overflow-x-auto rounded-lg shadow-sm">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="p-3 text-left text-xs font-bold bg-[#f1f5f9] border-b-2 border-[#e2e8f0]">Dimension</th>
                  <th className="p-3 text-left text-xs font-bold bg-[#f1f5f9] border-b-2 border-[#e2e8f0]">Idea 1<br />Trust Debate</th>
                  <th className="p-3 text-left text-xs font-bold bg-[#f1f5f9] border-b-2 border-[#e2e8f0]">Idea 2<br />Arg. Verify</th>
                  <th className="p-3 text-left text-xs font-bold bg-[#f1f5f9] border-b-2 border-[#e2e8f0]">Idea 3<br />Chrono-RAG</th>
                  <th className="p-3 text-left text-xs font-bold bg-[#f1f5f9] border-b-2 border-[#e2e8f0]">Idea 4<br />Rare Disease</th>
                  <th className="p-3 text-left text-xs font-bold bg-[#f1f5f9] border-b-2 border-[#e2e8f0]">Idea 5<br />StatVerify</th>
                  <th className="p-3 text-left text-xs font-bold bg-[#f1f5f9] border-b-2 border-[#e2e8f0]">Supervisor Score</th>
                </tr>
              </thead>
              <tbody>
                {comparisonMatrix.map((row, i) => (
                  <tr key={i} className="border-b border-[#e2e8f0] last:border-0 hover:bg-[#dce4ff] even:bg-[#f8fafc] transition-colors">
                    <td className="p-3 font-medium">{row.dim}</td>
                    {row.scores.map((s, j) => <td key={j} className="p-3">{s}</td>)}
                    <td className="p-3 text-[#94a3b8] italic">___</td>
                  </tr>
                ))}
                <tr className="bg-[#dce4ff]">
                  <td className="p-3 font-bold">Composite Score</td>
                  <td className="p-3 font-bold">4.6 ★</td>
                  <td className="p-3 font-bold">4.2</td>
                  <td className="p-3 font-bold">4.0</td>
                  <td className="p-3 font-bold">3.6</td>
                  <td className="p-3 font-bold">3.2</td>
                  <td className="p-3 text-[#94a3b8] italic">___</td>
                </tr>
                <tr className="border-b border-[#e2e8f0]">
                  <td className="p-3 font-bold">Recommendation</td>
                  <td className="p-3"><Badge variant="green">PRIMARY</Badge></td>
                  <td className="p-3"><Badge variant="blue">BACKUP</Badge></td>
                  <td className="p-3"><Badge variant="blue">CONSIDER</Badge></td>
                  <td className="p-3"><Badge variant="amber">PhD Yr 2</Badge></td>
                  <td className="p-3"><Badge variant="amber">Workshop</Badge></td>
                  <td className="p-3"></td>
                </tr>
              </tbody>
            </table>
          </div>
        </Section>

        {/* 2. Top 2 Justification */}
        <Section>
          <SectionTitle icon="🏆">2. Critical Justification — Top 2 Selections</SectionTitle>
          <Callout variant="success" title="🥇 PRIMARY: Idea 1 — Trust-Calibrated Multi-Agent Scientific Deliberation (Score: 4.6)">
            <p className="mb-2"><strong>Why this is the strongest FYDP choice:</strong></p>
            <ul className="text-sm space-y-1">
              <li><strong>Algorithmic novelty at the right level:</strong> The trust calibration function is a formally specifiable contribution — not a prompt engineering trick. Reviewers at NeurIPS/ICLR accept this category of work when the ablation story is clean.</li>
              <li><strong>Timeliness:</strong> Multi-agent LLM systems are the dominant research paradigm for 2025–2027. Sycophancy is cited as an open problem in &gt;50 recent papers.</li>
              <li><strong>Best feasibility profile:</strong> All models open-weight, all datasets public, no EHR, no IRB, no special API access required. Compute cost manageable on a single A100.</li>
              <li><strong>Strategic leverage for PhD:</strong> Multi-agent coordination is a founding problem of the next generation of AI infrastructure. A strong FYDP paper here immediately positions the student as a contributor to one of the hottest areas in top AI labs.</li>
            </ul>
          </Callout>
          <Callout variant="success" title="🥈 BACKUP: Idea 2 — Argumentative Scientific Claim Verification (Score: 4.2)">
            <p className="mb-2"><strong>Why this is the strongest alternative:</strong></p>
            <ul className="text-sm space-y-1">
              <li><strong>Deepest intellectual contribution:</strong> Bridges argumentation theory, graph neural networks, and LLMs — a genuinely interdisciplinary contribution. ACL/EMNLP reviewers value this linguistic depth.</li>
              <li><strong>Strongest ablation story:</strong> The 5-condition ablation matrix precisely isolates every component's contribution — exactly what top-venue reviewers demand.</li>
              <li><strong>Risk:</strong> Feasibility score is 3/5 because the discourse parser requires ~3 months of focused engineering. If parser F1 falls below 70%, the whole system degrades.</li>
              <li><strong>Pivot option:</strong> If Idea 1 produces inconclusive results by Month 6, this is the natural pivot — the GNN verification head can be built in parallel as a thesis backup.</li>
            </ul>
          </Callout>
        </Section>

        {/* 3. Why Others Are Lower */}
        <Section>
          <SectionTitle icon="📉">3. Why Ideas 3–5 Are Not Primary Recommendations</SectionTitle>
          <TwoCol>
            <ColBox>
              <h4 className="text-sm font-semibold mt-0 mb-2">Idea 3: Chrono-RAG (Score 4.0)</h4>
              <p className="text-sm text-[#64748b] mb-0">
                Strong idea with excellent feasibility. Not ranked higher because the core contribution — temporal
                filtering before retrieval — is architecturally simpler than Ideas 1–2. A skeptical reviewer can
                characterise it as "standard RAG with a date filter." Strong workshop paper; weaker main-track argument.
              </p>
            </ColBox>
            <ColBox>
              <h4 className="text-sm font-semibold mt-0 mb-2">Idea 4: Rare Disease (Score 3.6)</h4>
              <p className="text-sm text-[#64748b] mb-0">
                High clinical impact. Ranked #4 because EHR data is inaccessible, target venues (JAMIA/JBHI) require
                clinical validation beyond FYDP scope, and the risk of rejection is high.{' '}
                <strong>Ideal as PhD Year 2–3 project</strong> with IRB preparation in Year 1.
              </p>
            </ColBox>
          </TwoCol>
          <ColBox className="mt-0">
            <h4 className="text-sm font-semibold mt-0 mb-2">Idea 5: StatVerify-Agent (Score 3.2)</h4>
            <p className="text-sm text-[#64748b] mb-0">
              Compelling application but lowest methodological novelty — ReAct agents with code execution were published
              in 2023. The primary contribution is the application domain, not the method. Best positioned as a workshop
              paper (SDP@EMNLP) or a secondary publication alongside a stronger main contribution.
            </p>
          </ColBox>
        </Section>

        {/* 4. Domain Recommendation */}
        <Section accent="blue">
          <SectionTitle icon="🔮">4. Domain Recommendation for 2026–2030 + PhD</SectionTitle>
          <Callout variant="success" title="✅ Recommended Domain: Agentic AI > Pure NLP">
            For a PhD trajectory spanning 2026–2030, prioritise <strong>Agentic AI</strong> (multi-agent systems,
            tool-use, planning, alignment) over classical NLP tasks. The frontier has shifted irreversibly from
            task-specific fine-tuning to <em>how LLMs reason, collaborate, and interact with the world</em>.
          </Callout>
          <TwoCol className="mt-5">
            <ColBox>
              <h4 className="text-sm font-semibold mt-0 mb-2">Research Impact (2026–2030)</h4>
              <p className="text-sm text-[#64748b] mb-0">
                Classical NLP tasks (NER, sentiment, MT) are increasingly "solved" at benchmark level. The
                highest-cited NeurIPS/ICLR 2024–2025 papers are on reasoning, agents, and evaluation. The frontier is
                where the citations are.
              </p>
            </ColBox>
            <ColBox>
              <h4 className="text-sm font-semibold mt-0 mb-2">Publication Landscape</h4>
              <p className="text-sm text-[#64748b] mb-0">
                Agentic AI is in an <em>expansionary phase</em> — more open questions than established answers.
                Reviewers are more receptive to well-executed exploratory work. Classical NLP tracks are saturated
                with incremental improvements.
              </p>
            </ColBox>
            <ColBox>
              <h4 className="text-sm font-semibold mt-0 mb-2">Long-Term Relevance</h4>
              <p className="text-sm text-[#64748b] mb-0">
                Google DeepMind, Anthropic, and OpenAI are all heavily investing in multi-agent coordination. A PhD
                in this space positions at the intersection of academic novelty and industry demand — maximising
                post-PhD options.
              </p>
            </ColBox>
            <ColBox>
              <h4 className="text-sm font-semibold mt-0 mb-2">The NLP Foundation Is Still Critical</h4>
              <p className="text-sm text-[#64748b] mb-0">
                Agentic AI builds on NLP fundamentals. The best agents require understanding of discourse,
                argumentation, and knowledge representation. Don't abandon NLP depth — it becomes your competitive
                advantage within the Agentic AI space.
              </p>
            </ColBox>
          </TwoCol>
        </Section>

        {/* 5. PhD Trajectory */}
        <Section>
          <SectionTitle icon="🎓">5. Recommended 4-Year PhD Research Trajectory</SectionTitle>
          <Timeline items={[
            {
              milestone: 'FYDP 2026–2027 (Idea 1)',
              date: '2026–2027',
              description: 'Build the trust-calibrated multi-agent debate system. Publish at NeurIPS/ACL. Establish expertise in multi-agent LLM evaluation and sycophancy measurement.',
              deliverable: 'Output: 1× Q1 paper + FYDP thesis',
            },
            {
              milestone: 'PhD Year 1',
              date: '2027–2028',
              description: 'Extend with discourse-graph grounding (Idea 2). Research question: "Can agents reason better when their evidence is structured as an argumentative graph rather than flat text?"',
              deliverable: 'Output: 1× ACL/EMNLP paper on agent grounding',
            },
            {
              milestone: 'PhD Year 2',
              date: '2028–2029',
              description: 'Add temporal awareness (Idea 3). Research question: "How do trust dynamics change when facts are time-bounded?" Chrono-RAG integration provides a third novel dimension.',
              deliverable: 'Output: 1× ICLR/WWW paper on temporal agent reasoning',
            },
            {
              milestone: 'PhD Year 3',
              date: '2029–2030',
              description: 'Generalise to a unified framework for evidence-grounded multi-agent scientific reasoning — combining trust calibration (Idea 1), argumentative structure (Idea 2), and temporal awareness (Idea 3). This is the thesis capstone.',
              deliverable: 'Output: PhD Thesis + 1× NeurIPS / Journal paper',
            },
          ]} />
          <Callout variant="info" title="ℹ Optional PhD Extension: Idea 4" className="mt-4">
            If pursuing a healthcare AI specialisation, Idea 4 (Rare Disease NLP) can be executed in PhD Year 2 in
            parallel with Idea 3 — by which time IRB approval from Year 1 would be ready. The neuro-symbolic
            architecture developed in the FYDP generalises naturally to the medical domain.
          </Callout>
        </Section>

        {/* 6. Final Decision Summary */}
        <Section>
          <SectionTitle icon="✅">6. Final Decision Summary</SectionTitle>
          <div className="overflow-x-auto rounded-lg shadow-sm">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  {['Decision Point', 'Recommendation', 'Rationale'].map((h) => (
                    <th key={h} className="p-3 text-left text-xs font-bold bg-[#f1f5f9] border-b-2 border-[#e2e8f0]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['Primary FYDP Direction', <Link to="/idea/1" className="text-[#3b5bdb] hover:underline">Idea 1: Trust-Calibrated Multi-Agent Scientific Deliberation</Link>, 'Highest composite score (4.6); best novelty + feasibility balance; strongest Q1 venue fit'],
                  ['Backup Direction (if Idea 1 pivot needed)', <Link to="/idea/2" className="text-[#3b5bdb] hover:underline">Idea 2: Argumentative Verification</Link>, 'Second highest score (4.2); strongest ablation story; viable ACL submission'],
                  ['Recommended Domain', 'Agentic AI (multi-agent reasoning)', 'Fastest-growing area; highest citation impact; best industry alignment'],
                  ['PhD Trajectory Start', 'FYDP → Agent Grounding → Temporal Agents → Unified Framework', 'Natural extension arc; each project builds on previous; 3–4 publications expected'],
                  ['Highest Risk Idea', 'Idea 4 (Rare Disease)', 'EHR data access and venue clinical validation requirements exceed FYDP scope'],
                  ['Lowest Novelty Idea', 'Idea 5 (StatVerify)', 'Application of known ReAct methods; novelty is domain, not methodology'],
                  ['Go/No-Go Checkpoint', 'October 2026 (Month 1)', 'Baseline sycophancy ≥ 30% must be confirmed before full system development begins'],
                  ['Paper Submission Target', 'August 2027', 'ACL 2027 submission deadline; 12 months from project start'],
                ].map(([decision, rec, rationale], i) => (
                  <tr key={i} className="border-b border-[#e2e8f0] last:border-0 hover:bg-[#dce4ff] even:bg-[#f8fafc] transition-colors">
                    <td className="p-3 font-medium">{decision}</td>
                    <td className="p-3">{rec}</td>
                    <td className="p-3">{rationale}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      </main>
    </>
  );
}
