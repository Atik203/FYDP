import { Section, SectionTitle, ColBox, TwoCol } from '@/components/shared/Section';
import { Callout } from '@/components/shared/Callout';
import { InfoGrid } from '@/components/shared/InfoGrid';

export function Idea4Content() {
  return (
    <>
      {/* 1. Core Idea */}
      <Section accent="blue">
        <SectionTitle icon="💡">1. Core Idea</SectionTitle>
        <p className="mb-3">
          Rare disease diagnosis from clinical text is a needle-in-a-haystack problem: 1-in-2000 patients, 7,000+
          distinct rare diseases, highly variable symptom presentations, and minimal training data per disease. Pure
          neural approaches (fine-tuned LLMs) hallucinate diagnoses and cannot guarantee ontological consistency.
          Pure symbolic approaches (ORPHANET traversal) miss linguistic variations in clinical notes. We propose a{' '}
          <strong>Neuro-Symbolic Hybrid</strong> that extracts phenotype mentions with a few-shot LLM, maps them to
          HPO (Human Phenotype Ontology) concepts via a fine-tuned BioBERT entity linker, and then performs
          differential diagnosis via symbolic graph traversal over ORPHANET's disease-phenotype network.
        </p>
        <Callout variant="success" title="🎯 Core Research Contribution">
          The key contribution is the <strong>neuro-symbolic integration layer</strong> — an architecture that uses
          neural NLP for phenotype extraction (handling linguistic variation) and symbolic reasoning for diagnosis
          (guaranteeing ontological consistency and explainability). This hybrid is the first to combine LLM-based
          extraction with HPO + ORPHANET symbolic traversal for rare disease identification from free clinical text.
        </Callout>
      </Section>

      {/* 2. Problem Statement */}
      <Section>
        <SectionTitle icon="🔍">2. Problem Statement</SectionTitle>
        <h3 className="text-base font-semibold text-[#1e2a4a] mt-4 mb-2">2.1 The Rare Disease Diagnosis Challenge</h3>
        <p className="mb-3 text-sm">
          Patients with rare diseases wait an average of 4–6 years for correct diagnosis (Eurordis 2017). Clinical
          notes contain phenotype descriptions in natural language — symptoms, examination findings, lab results —
          that must be mapped to formal ontology concepts before differential diagnosis is possible. The core
          difficulty is data scarcity: there may be only 10–100 documented cases globally for a given rare disease,
          making supervised learning infeasible without few-shot or zero-shot approaches.
        </p>
        <TwoCol>
          <ColBox>
            <h4 className="text-sm font-semibold mt-0 mb-2">Challenge A — Linguistic Variation</h4>
            <p className="text-sm text-[#64748b] mb-0">Clinicians use hundreds of synonyms, abbreviations, and colloquial descriptions for the same phenotype. Neural NLP must handle this variation to extract HPO-mappable concepts.</p>
          </ColBox>
          <ColBox>
            <h4 className="text-sm font-semibold mt-0 mb-2">Challenge B — Ontology Linking</h4>
            <p className="text-sm text-[#64748b] mb-0">Mapping extracted phenotype mentions to formal HPO codes requires resolving ambiguity (e.g., "heart problem" could map to 50+ HPO terms).</p>
          </ColBox>
          <ColBox>
            <h4 className="text-sm font-semibold mt-0 mb-2">Challenge C — Data Scarcity</h4>
            <p className="text-sm text-[#64748b] mb-0">Few-shot or zero-shot learning is essential since publicly available de-identified rare disease clinical notes are extremely limited. Real EHR access requires IRB approval (infeasible in FYDP timeframe).</p>
          </ColBox>
          <ColBox>
            <h4 className="text-sm font-semibold mt-0 mb-2">Challenge D — Explainability</h4>
            <p className="text-sm text-[#64748b] mb-0">Clinical decision support requires explicit reasoning chains: which extracted phenotypes support which diagnosis candidates, and why the ranking is what it is.</p>
          </ColBox>
        </TwoCol>
      </Section>

      {/* 3. Architecture */}
      <Section accent="blue">
        <SectionTitle icon="🏗️">3. Proposed Architecture</SectionTitle>
        <div className="bg-[#f0f7ff] border border-[#bfdbfe] rounded-md p-3 font-mono text-sm text-center mb-4">
          Clinical Note → LLM Phenotype Extractor → BioBERT HPO Linker → ORPHANET Symbolic Traversal → Ranked Differential Diagnosis
        </div>
        <TwoCol>
          <ColBox>
            <h4 className="text-sm font-semibold mt-0 mb-2">Stage 1: LLM Phenotype Extraction</h4>
            <p className="text-sm text-[#64748b] mb-0">Few-shot prompted LLM (Llama-3-8B or BioMedGPT) extracts phenotype mentions from the clinical note as a structured JSON list, handling linguistic variation and negation detection.</p>
          </ColBox>
          <ColBox>
            <h4 className="text-sm font-semibold mt-0 mb-2">Stage 2: HPO Entity Linking</h4>
            <p className="text-sm text-[#64748b] mb-0">Fine-tuned BioBERT maps extracted mentions to HPO concept IDs using contrastive learning on HPO synonym pairs. Top-k candidates retrieved per mention for downstream disambiguation.</p>
          </ColBox>
          <ColBox>
            <h4 className="text-sm font-semibold mt-0 mb-2">Stage 3: Symbolic Traversal (ORPHANET)</h4>
            <p className="text-sm text-[#64748b] mb-0">The linked HPO concepts are matched against ORPHANET's disease-phenotype matrix. Diseases are ranked by phenotype overlap score (Jaccard + HPO semantic similarity), with mandatory vs. supportive phenotype weighting.</p>
          </ColBox>
          <ColBox>
            <h4 className="text-sm font-semibold mt-0 mb-2">Stage 4: Explainable Output</h4>
            <p className="text-sm text-[#64748b] mb-0">Output is a ranked differential diagnosis list with explicit evidence chains: "Disease X is ranked #1 because 4/5 extracted phenotypes (HP:0001250, HP:0002360, ...) match its ORPHANET mandatory phenotype set."</p>
          </ColBox>
        </TwoCol>
      </Section>

      {/* 4. Methodology */}
      <Section>
        <SectionTitle icon="🔬">4. Methodology</SectionTitle>
        <InfoGrid cards={[
          { label: 'MIMIC-III (PhysioNet)', value: 'De-identified ICU notes', sub: 'Open access with credentialing (not EHR — research DB). Will use NLP-accessible subset.' },
          { label: 'RareDis corpus', value: '1,500 annotated rare disease mentions', sub: 'Spanish/English; phenotype NER training. Public.' },
          { label: 'HPO (human-phenotype-ontology)', value: '17,000+ phenotype terms', sub: 'Ontology backbone for phenotype linking. Public.' },
          { label: 'ORPHANET XML', value: '6,000+ diseases × phenotype matrix', sub: 'Symbolic reasoning backbone. Public.' },
        ]} />
        <Callout variant="feasibility" title="⚠ Feasibility Note — Data Access">
          Real EHR data requires IRB/HIPAA approval which is infeasible within the FYDP 12-month timeline. This
          project uses <strong>only publicly available de-identified data</strong> (MIMIC-III with standard credentialing,
          RareDis corpus, synthetic case reports). The scope is intentionally bounded to avoid IRB dependency.
        </Callout>
      </Section>

      {/* Expected Results */}
      <Section>
        <SectionTitle icon="📈">5. Expected Results</SectionTitle>
        <TwoCol>
          <ColBox>
            <h4 className="text-sm font-semibold mt-0 mb-2">Primary: +25% Top-5 Accuracy vs. LLM</h4>
            <p className="text-sm text-[#64748b] mb-0">The neuro-symbolic system achieves ≥25% improvement in Top-5 rare disease identification accuracy vs. a pure LLM (Llama-3-8B prompted zero-shot) on MIMIC-III rare disease cases.</p>
          </ColBox>
          <ColBox>
            <h4 className="text-sm font-semibold mt-0 mb-2">Secondary: ≥75% Phenotype F1</h4>
            <p className="text-sm text-[#64748b] mb-0">The phenotype extraction + HPO linking pipeline achieves ≥75% F1 on the RareDis corpus, with ablation showing LLM extraction outperforms rule-based NLP by ≥10pp.</p>
          </ColBox>
          <ColBox>
            <h4 className="text-sm font-semibold mt-0 mb-2">Zero Reasoning Hallucination</h4>
            <p className="text-sm text-[#64748b] mb-0">The symbolic traversal stage produces 0% hallucinated diagnoses (i.e., diseases not in ORPHANET) — guaranteed by design. All diagnosis candidates are ontologically valid.</p>
          </ColBox>
          <ColBox>
            <h4 className="text-sm font-semibold mt-0 mb-2">Explainability Evaluation</h4>
            <p className="text-sm text-[#64748b] mb-0">Small human evaluation (n=20 medical students) rates the generated evidence chains as "clinically plausible" in ≥80% of cases — establishing usefulness of the explainability output.</p>
          </ColBox>
        </TwoCol>
      </Section>
    </>
  );
}
