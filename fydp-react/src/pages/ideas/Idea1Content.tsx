import { Section, SectionTitle, ColBox, TwoCol } from '@/components/shared/Section';
import { Callout } from '@/components/shared/Callout';
import { InfoGrid } from '@/components/shared/InfoGrid';
import { Badge } from '@/components/shared/Badge';
import { GanttTable } from '@/components/shared/GanttTable';
import { Timeline } from '@/components/shared/Timeline';

export function Idea1Content() {
  return (
    <>
      {/* Project Summary */}
      <Section accent="teal">
        <SectionTitle icon="🧭">Project Summary</SectionTitle>
        <p className="mb-3">
          This project builds a <strong>trust-calibrated multi-agent deliberation system</strong> for scientific question
          answering. When several LLM agents debate, a confident but wrong majority can pressure a correct agent into
          abandoning its answer — a failure mode called <strong>inter-agent sycophancy</strong>. Our system re-weights
          each agent's influence <em>during the debate</em> based on whether its claims are verifiable against retrieved
          scientific evidence, so an evidence-backed minority can survive a false majority. The work is delivered as two
          connected contributions: a <strong>mitigation mechanism</strong> (the trust-weighting rule) and an{' '}
          <strong>open evaluation harness</strong> (a reproducible sycophancy-injection protocol with the CCR / MPR / ECR metrics).
        </p>
        <TwoCol>
          <ColBox>
            <h4 className="text-sm font-semibold text-[#1e2d3d] mt-0 mb-2">What We Build</h4>
            <p className="text-sm text-[#64748b] mb-0">
              A heterogeneous 3-agent debate pipeline with atomic-claim retrieval, a bounded evidence-weighted trust
              update, and trust-weighted adjudication instead of majority vote. Fully inference-only (no model training).
            </p>
          </ColBox>
          <ColBox>
            <h4 className="text-sm font-semibold text-[#1e2d3d] mt-0 mb-2">Why It Matters</h4>
            <p className="text-sm text-[#64748b] mb-0">
              Confident false consensus in scientific QA can mislead students, researchers, and decision-support tools.
              The work aligns with AI safety, trustworthy NLP, and reproducible evaluation.
            </p>
          </ColBox>
          <ColBox>
            <h4 className="text-sm font-semibold text-[#1e2d3d] mt-0 mb-2">How We Evaluate</h4>
            <p className="text-sm text-[#64748b] mb-0">
              Nine baselines (incl. Self-Consistency, MoA, iMAD) across adversarial (BrokenMath / BrokenArXiv / HLE) and
              stable (GPQA / MMLU-Pro) benchmarks, with 3 seeds, 95% CIs, effect sizes, and a small human study.
            </p>
          </ColBox>
          <ColBox>
            <h4 className="text-sm font-semibold text-[#1e2d3d] mt-0 mb-2">Scope & Target</h4>
            <p className="text-sm text-[#64748b] mb-0">
              10-month FYDP on a single A100. Realistic first-paper target: ACL/NeurIPS workshop or EMNLP-Findings-tier
              venue; IEEE / Springer / Q2 journal as alternatives with full results.
            </p>
          </ColBox>
        </TwoCol>
      </Section>

      {/* 1. Core Idea */}
      <Section accent="blue">
        <SectionTitle icon="💡">1. Core Idea</SectionTitle>
        <p className="mb-3">
          We propose a <strong>trust-calibrated multi-agent scientific deliberation</strong> framework to mitigate{' '}
          <strong>sycophantic consensus collapse</strong> in LLM reasoning. Agents whose claims are verified by retrieved
          scientific literature accumulate higher trust weights, preventing hallucinating majorities from suppressing
          correct minority agents.
        </p>
        <Callout variant="success" title="🎯 Positioning & Contributions">
          <p className="mb-2">
            Recent work has <em>diagnosed and measured</em> inter-agent sycophancy (Yao et al., 2025 — Peacemaker or
            Troublemaker) and the correct-minority-suppression effect (He et al., 2026 — Minority Sentinel). Our
            contribution is the missing <strong>mitigation</strong> side: an in-session, evidence-grounded mechanism,
            plus an open evaluation harness.
          </p>
          <ul className="list-disc list-inside text-sm space-y-1">
            <li><strong>C1 — Trust-Calibrated Evidence-Grounded Aggregation (primary).</strong> A bounded, dynamic, evidence-weighted trust rule that re-weights agents during the debate.</li>
            <li><strong>C2 — Open Sycophancy-Stress Evaluation Harness (co-primary).</strong> A pre-registered injection protocol + the CCR / MPR / ECR metrics + a 9-baseline suite, released for reuse.</li>
            <li><strong>C3 — Supporting:</strong> Progressive, source-partitioned retrieval for atomic-claim verification, plus an empirical study of <em>when</em> evidence-grounded trust helps.</li>
          </ul>
        </Callout>
      </Section>

      {/* 2. Problem Statement */}
      <Section>
        <SectionTitle icon="🔍">2. Problem Statement</SectionTitle>
        <h3 className="text-base font-semibold text-[#1e2a4a] mt-4 mb-2">2.1 Real-World Problem</h3>
        <p className="mb-3 text-sm">
          Multi-agent debate (Du et al., 2023) suffers from a well-documented failure mode —{' '}
          <strong>inter-agent sycophancy</strong>: agents abandon correct positions to conform with a
          confidently-stated but wrong majority. General sycophancy in LLMs is well established (Perez et al., 2023;
          Malmqvist, 2024). For the specifically <em>inter-agent</em> case, Yao et al. (2025) formalise and measure it
          in debate, and He et al. (2026) show a correct minority is suppressed in roughly one in four disagreements.
          Scientific reasoning is our target domain because it is evidence-intensive, high-stakes, and maximally
          sensitive to hallucinated consensus.
        </p>
        <h3 className="text-base font-semibold text-[#1e2a4a] mt-4 mb-2">2.2 Engineering Complexity (Washington Accord Level)</h3>
        <TwoCol>
          <ColBox>
            <h4 className="text-sm font-semibold mt-0 mb-2">Challenge A — Real-time Verification</h4>
            <p className="text-sm text-[#64748b] mb-0">Decompose claims into atomic propositions; retrieve supporting/contradicting evidence within &lt;10 s per turn.</p>
          </ColBox>
          <ColBox>
            <h4 className="text-sm font-semibold mt-0 mb-2">Challenge B — Trust Stability</h4>
            <p className="text-sm text-[#64748b] mb-0">Design update rule avoiding degenerate equilibria (full collapse or single-agent dominance).</p>
          </ColBox>
          <ColBox>
            <h4 className="text-sm font-semibold mt-0 mb-2">Challenge C — Behavioural Effectiveness</h4>
            <p className="text-sm text-[#64748b] mb-0">Ensure trust weights change model outputs, not merely appear in context and get ignored by attention.</p>
          </ColBox>
          <ColBox>
            <h4 className="text-sm font-semibold mt-0 mb-2">Challenge D — Heterogeneous Agents</h4>
            <p className="text-sm text-[#64748b] mb-0">Trust calibration must be model-agnostic across ≈14–32B open-weight models from different families (Qwen, Mistral-Small, Phi).</p>
          </ColBox>
        </TwoCol>
      </Section>

      {/* 3. Related Work & Gap */}
      <Section>
        <SectionTitle icon="📚">3. Existing Solutions & Research Gap</SectionTitle>
        <div className="overflow-x-auto rounded-lg shadow-sm">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                {['System', 'Year', 'Core Approach', 'Key Limitation vs. Our Work'].map((h) => (
                  <th key={h} className="p-3 text-left text-xs font-bold bg-[#f1f5f9] border-b-2 border-[#e2e8f0]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ['Self-Refine (Madaan et al.)', '2023', 'Single LLM iterative self-critique', 'Bounded by own blind spots; no external grounding'],
                ['MAD (Du et al.)', '2023', 'Multi-LLM debate → majority consensus', 'No grounding; hallucinating majority wins'],
                ['Self-Consistency (Wang et al.)', '2023', 'k samples, majority vote, single model', 'No inter-agent trust; vulnerable to shared misconceptions'],
                ['MoA (Wang et al., 2406.04692)', '2024', 'Multi-model proposers + static aggregator', 'Equal-weight aggregation; no evidence-grounded trust'],
                ['iMAD (Fan et al., arXiv 2511.11306)', '2025', 'Learned classifier decides when to trigger debate', "Optimises when to debate, not who to trust; no external evidence grounding"],
                ['Peacemaker or Troublemaker (Yao et al.)', '2025', 'First formal definition + metrics for inter-agent sycophancy', 'Diagnostic study only — measures the failure, proposes no mitigation mechanism'],
                ['Minority Sentinel (arXiv 2606.29270)', '2026', 'Post-hoc meta-classifier on debate logs recovers suppressed correct minority', 'Post-hoc, external classifier on log features; not in-session, not evidence-grounded'],
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
          <strong>Consensus frequency ≠ empirical correctness under adversarial sycophancy.</strong>{' '}
          No existing framework provides a formally specified, evidence-grounded trust mechanism that dynamically
          re-weights agent influence within the same debate session based on the verifiability of claims against an
          external corpus.
        </Callout>
      </Section>

      {/* 4. Architecture */}
      <Section accent="blue">
        <SectionTitle icon="🏗️">4. Proposed Architecture</SectionTitle>
        <div className="bg-[#f0f7ff] border border-[#bfdbfe] rounded-md p-3 font-mono text-sm text-center mb-4">
          Input → Single-Agent Pass → Confidence Estimator → <em>IF uncertain</em> → Multi-Agent Debate → Trust-Weighted Output
        </div>
        <TwoCol>
          <ColBox>
            <h4 className="text-sm font-semibold mt-0 mb-2">4.1 Adaptive Triggering</h4>
            <p className="text-sm text-[#64748b] mb-0">A lightweight confidence estimator gates deliberation. Low-confidence queries trigger the full debate pipeline; high-confidence queries are answered directly, reducing unnecessary compute.</p>
          </ColBox>
          <ColBox>
            <h4 className="text-sm font-semibold mt-0 mb-2">4.2 Agent Pool (N = 3)</h4>
            <p className="text-sm text-[#64748b] mb-0">One agent each from three different open-weight families (≈14–32B; e.g., Qwen, Mistral-Small, Phi). Each maintains its position and a trust vector <code>T ∈ ℝ³</code>, initialised uniformly at <code>1/N</code>.</p>
          </ColBox>
          <ColBox>
            <h4 className="text-sm font-semibold mt-0 mb-2">4.3 Source-Partitioned RAG</h4>
            <p className="text-sm text-[#64748b] mb-0">Claims → atomic propositions → partitioned retrieval: Agent A → PubMed, Agent B → ArXiv, Agent C → Semantic Scholar. A cross-encoder reranker scores evidence per claim.</p>
          </ColBox>
          <ColBox>
            <h4 className="text-sm font-semibold mt-0 mb-2">4.6 Trust-Weighted Adjudication</h4>
            <p className="text-sm text-[#64748b] mb-0">Final answer = argmax over trust-weighted agent positions at round K — not majority vote. Each agent's full argument chain is weighted by its accumulated <code>Tᵢ(K)</code>.</p>
          </ColBox>
        </TwoCol>

        <h3 className="text-base font-semibold text-[#1e2a4a] mt-5 mb-3">4.4 Trust Calibration Function <em>(Core Contribution)</em></h3>
        <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-md p-4 font-mono text-sm text-center mb-3">
          S<sub>i</sub><sup>(t+1)</sup> = S<sub>i</sub><sup>(t)</sup> + α · V<sub>i</sub><sup>(t)</sup> − β · H<sub>i</sub><sup>(t)</sup>;
          &nbsp; T̃<sub>i</sub> = softmax(S)<sub>i</sub>; &nbsp; clamp(T̃<sub>i</sub>, 0.1, 0.9); &nbsp; renormalise so Σ T<sub>i</sub> = 1
        </div>
        <TwoCol>
          <ColBox>
            <h4 className="text-sm font-semibold mt-0 mb-2">Variables</h4>
            <ul className="text-sm text-[#64748b] space-y-1 mb-0">
              <li><code>Vᵢ</code> — proportion of claims <strong>supported</strong> by evidence</li>
              <li><code>Hᵢ</code> — proportion of claims <strong>contradicted</strong></li>
              <li><code>α, β</code> — reward / penalty scale (sweep 0.5–2.0)</li>
              <li><code>Sᵢ</code> — latent evidence score; softmax normalizes trust across agents</li>
            </ul>
          </ColBox>
          <ColBox>
            <h4 className="text-sm font-semibold mt-0 mb-2">Design Properties</h4>
            <ul className="text-sm text-[#64748b] space-y-1 mb-0">
              <li>Trust floor <code>T<sub>min</sub> = 0.1</code> — no agent silencing</li>
              <li>Trust ceiling <code>T<sub>max</sub> = 0.9</code> — no monopoly</li>
              <li>Session-scoped — resets between questions</li>
              <li>Selected config: α = 1.5, β = 1.0 (validated on BrokenMath held-out)</li>
            </ul>
          </ColBox>
        </TwoCol>
      </Section>

      {/* 5. Methodology */}
      <Section>
        <SectionTitle icon="🔬">5. Methodology</SectionTitle>
        <h3 className="text-base font-semibold text-[#1e2a4a] mt-4 mb-3">5.1 Models</h3>
        <InfoGrid cards={[
          { label: 'Primary Agent', value: 'Qwen-family ~32B (e.g., Qwen3-32B)', sub: '4-bit quantized, vLLM inference' },
          { label: 'Secondary Agent', value: 'Mistral-Small-3.2-24B', sub: 'Heterogeneous family' },
          { label: 'Third Agent', value: 'Phi-4-Reasoning', sub: 'Diverse reasoning family' },
          { label: 'Oracle Ceiling', value: 'GPT-4o (API)', sub: 'Upper-bound comparison only' },
          { label: 'Judge', value: 'Gemini-1.5-Pro (API)', sub: 'Chain-of-thought answer extraction' },
        ]} />
        <h3 className="text-base font-semibold text-[#1e2a4a] mt-4 mb-3">5.2 Benchmarks</h3>
        <div className="overflow-x-auto rounded-lg shadow-sm">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                {['Dataset', 'Type', 'Why Used', 'Size'].map((h) => (
                  <th key={h} className="p-3 text-left text-xs font-bold bg-[#f1f5f9] border-b-2 border-[#e2e8f0]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ['BrokenMath', 'Adversarial', 'High baseline sycophancy rate (Yao et al., 2025)', '1,000 QA'],
                ['BrokenArXiv', 'Adversarial', 'Scientific domain; planted false claims in abstracts', '500 QA'],
                ['HLE', 'Adversarial', 'Hallucination-inducing, multi-hop scientific reasoning', '300 QA'],
                ['GPQA Diamond', 'Natural (Hard)', 'Graduate-level science; stable ground truth', '448 QA'],
                ['MMLU-Pro (STEM)', 'Natural', 'Broad STEM coverage; stable sycophancy baseline', '12,000 QA'],
              ].map(([ds, type, why, size], i) => (
                <tr key={i} className="border-b border-[#e2e8f0] last:border-0 hover:bg-[#dce4ff] even:bg-[#f8fafc] transition-colors">
                  <td className="p-3"><strong>{ds}</strong></td>
                  <td className="p-3"><Badge variant="blue">{type}</Badge></td>
                  <td className="p-3">{why}</td>
                  <td className="p-3">{size}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* 6. Evaluation Plan */}
      <Section>
        <SectionTitle icon="📐">6. Evaluation Plan</SectionTitle>
        <div className="overflow-x-auto rounded-lg shadow-sm">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                {['Metric', 'Definition', 'Primary Hypothesis'].map((h) => (
                  <th key={h} className="p-3 text-left text-xs font-bold bg-[#f1f5f9] border-b-2 border-[#e2e8f0]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ['CCR (Correct-to-Changed Rate)', 'Fraction of initially-correct answers that remained correct under sycophantic pressure', 'H1: Trust-calibration increases CCR by ≥20% vs. MAD baseline on BrokenMath/BrokenArXiv'],
                ['MPR (Minority Preservation Rate)', 'Fraction of 1-vs-2 cases where the correct minority position survived', 'H2: MPR improves by ≥15pp vs. plain MAD across 3 adversarial datasets'],
                ['ECR (Evidence Calibration Rate)', 'Correlation between final trust weight and empirical correctness', 'H3: ECR > 0.80 on GPQA, indicating trust tracks correctness'],
                ['Task Accuracy', 'Standard answer accuracy on each benchmark', 'H4: Overall accuracy ≥ MAD + 10% on adversarial splits; no regression on stable splits'],
              ].map(([metric, def, hyp], i) => (
                <tr key={i} className="border-b border-[#e2e8f0] last:border-0 hover:bg-[#dce4ff] even:bg-[#f8fafc] transition-colors">
                  <td className="p-3 font-medium">{metric}</td>
                  <td className="p-3 text-sm">{def}</td>
                  <td className="p-3 text-sm text-[#3b5bdb]">{hyp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* 7. Expected Results */}
      <Section>
        <SectionTitle icon="📈">7. Expected Results</SectionTitle>
        <TwoCol>
          <ColBox>
            <h4 className="text-sm font-semibold mt-0 mb-2">Primary Result</h4>
            <p className="text-sm text-[#64748b] mb-0">
              Trust-calibrated debate achieves ≥20% sycophancy reduction (CCR metric) vs. vanilla MAD and ≥15%
              improvement in MPR on adversarial benchmarks (BrokenMath, BrokenArXiv, HLE).
            </p>
          </ColBox>
          <ColBox>
            <h4 className="text-sm font-semibold mt-0 mb-2">Secondary Result</h4>
            <p className="text-sm text-[#64748b] mb-0">
              ECR &gt; 0.80 on stable benchmarks (GPQA, MMLU-Pro), confirming that trust weights are meaningfully
              calibrated against empirical correctness.
            </p>
          </ColBox>
          <ColBox>
            <h4 className="text-sm font-semibold mt-0 mb-2">Ablation Insight</h4>
            <p className="text-sm text-[#64748b] mb-0">
              Removing the trust calibration mechanism (falling back to equal-weight aggregation) causes CCR to drop
              back to MAD baseline, confirming the mechanism is the causal driver of improvement.
            </p>
          </ColBox>
          <ColBox>
            <h4 className="text-sm font-semibold mt-0 mb-2">Negative Result</h4>
            <p className="text-sm text-[#64748b] mb-0">
              On stable benchmarks (no sycophancy injection), trust-calibrated debate performs comparably to plain
              MAD — the mechanism is adaptive and does not degrade accuracy on well-grounded questions.
            </p>
          </ColBox>
        </TwoCol>
      </Section>

      {/* 8. Q1 Justification */}
      <Section>
        <SectionTitle icon="🎯">8. Q1 Publication Justification</SectionTitle>
        <Callout variant="success" title="Why ACL / EMNLP / NeurIPS">
          <ul className="text-sm space-y-1">
            <li><strong>Novel mechanism:</strong> No prior work provides an in-session, evidence-grounded trust calibration mechanism for multi-agent debate. The CCR/MPR/ECR metrics are new.</li>
            <li><strong>Rigorous evaluation:</strong> 9-baseline suite, 5 benchmarks, 3 seeds, statistical testing with 95% CIs and effect sizes.</li>
            <li><strong>Open reproducibility:</strong> Full protocol released as a benchmark for future sycophancy mitigation research.</li>
            <li><strong>Timely topic:</strong> Inter-agent sycophancy is actively studied in 2025–2026; this fills the missing mitigation piece.</li>
          </ul>
        </Callout>
      </Section>

      {/* 9. Feasibility & Risks */}
      <Section>
        <SectionTitle icon="⚠️">9. Feasibility & Risks</SectionTitle>
        <TwoCol>
          <ColBox>
            <h4 className="text-sm font-semibold mt-0 mb-2">✅ Why Feasible</h4>
            <ul className="text-sm text-[#64748b] space-y-1 mb-0">
              <li>Inference-only: no model fine-tuning required</li>
              <li>Open-weight models fit in 1× A100 (4-bit quantized)</li>
              <li>Benchmarks are publicly available</li>
              <li>10-month timeline with explicit phase gating</li>
              <li>Mid-point pivot to Idea 2 possible at Month 6</li>
            </ul>
          </ColBox>
          <ColBox>
            <h4 className="text-sm font-semibold mt-0 mb-2">⚠ Risks</h4>
            <ul className="text-sm text-[#64748b] space-y-1 mb-0">
              <li>Sycophancy effect too small: pre-validate on BrokenMath before full experiments</li>
              <li>RAG quality bottleneck: use cross-encoder reranker + domain restriction</li>
              <li>Compute overrun: fall back to smaller models (14B) if 32B too slow</li>
              <li>Novelty overlap with concurrent work: monitor arXiv monthly from Month 1</li>
            </ul>
          </ColBox>
        </TwoCol>
      </Section>
    </>
  );
}
