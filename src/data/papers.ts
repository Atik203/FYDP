export type Priority = "critical" | "high" | "medium";
export type Difficulty = "Beginner" | "Intermediate" | "Advanced" | "Expert";
export type ReadPhase = "phase0" | "impl" | "experiments" | "writing";

export interface Paper {
  id: number;
  title: string;
  authors: string;
  venue: string;
  verified: boolean;
  priority: Priority;
  difficulty: Difficulty;
  readTime: string;
  readSections: string;
  whyImportant: string;
  keyTakeaways: string;
  phase: ReadPhase;
  note?: string;
}

export interface PaperStage {
  title: string;
  icon: string;
  description: string;
  papers: Paper[];
}

export const paperStages: PaperStage[] = [
  {
    title: "Stage 1 — Background Knowledge",
    icon: "📚",
    description:
      "Foundational papers establishing vocabulary and context. Read before Phase 0.",
    papers: [
      {
        id: 1,
        title: "Attention Is All You Need",
        authors: "Vaswani et al.",
        venue: "NeurIPS 2017",
        verified: true,
        priority: "high",
        difficulty: "Intermediate",
        readTime: "~2 hours (core only)",
        readSections:
          "Sections 1–3 carefully; Figure 1 (architecture) is essential; skim training details",
        whyImportant:
          "Foundational architecture underlying every LLM used in the project",
        keyTakeaways:
          "Self-attention replaces recurrence; parallelizable training; scaled dot-product attention mechanics",
        phase: "phase0",
      },
      {
        id: 2,
        title:
          "Chain-of-Thought Prompting Elicits Reasoning in Large Language Models",
        authors: "Wei et al.",
        venue: "NeurIPS 2022",
        verified: true,
        priority: "critical",
        difficulty: "Beginner",
        readTime: "~1 hour",
        readSections:
          "Sections 1–3, Figure 1 examples; skim scaling experiments",
        whyImportant:
          "CoT prompting is the reasoning style our debate agents use — directly informs §5 agent prompt strategy",
        keyTakeaways:
          "Reasoning traces improve multi-step accuracy; emergent with scale; simple prompt intervention",
        phase: "phase0",
      },
      {
        id: 3,
        title:
          "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks",
        authors: "Lewis et al.",
        venue: "NeurIPS 2020 (Vol. 33, pp. 9459–9474)",
        verified: true,
        priority: "critical",
        difficulty: "Intermediate",
        readTime: "~2 hours",
        readSections:
          "Sections 1–3 and results tables carefully; retriever/generator joint training detail",
        whyImportant:
          "The RAG paradigm our source-partitioned retrieval directly builds on (§4.3)",
        keyTakeaways:
          "Parametric + non-parametric memory; retrieval improves factuality; index updates without retraining",
        phase: "phase0",
      },
      {
        id: 4,
        title: "Dense Passage Retrieval for Open-Domain Question Answering",
        authors: "Karpukhin et al.",
        venue: "EMNLP 2020",
        verified: true,
        priority: "high",
        difficulty: "Intermediate",
        readTime: "~1.5 hours",
        readSections: "Core method; dual-encoder architecture",
        whyImportant:
          "DPR underlies most modern retrieval systems including our reranking pipeline (§4.3, §7)",
        keyTakeaways:
          "Dual-encoder architecture; dense retrieval > BM25 on many QA tasks; in-batch negatives training",
        phase: "impl",
      },
      {
        id: 5,
        title: "Survey of Hallucination in Natural Language Generation",
        authors: "Ji et al.",
        venue: "ACM Computing Surveys, 2023",
        verified: true,
        priority: "medium",
        difficulty: "Beginner",
        readTime: "~2 hours (skim)",
        readSections:
          "Intro + taxonomy sections; skip domain-specific deep dives",
        whyImportant:
          "Establishes hallucination taxonomy relevant to framing our problem (§2)",
        keyTakeaways:
          "Intrinsic vs extrinsic hallucination; hallucination sources; existing mitigation taxonomy",
        phase: "phase0",
      },
      {
        id: 6,
        title: "On Faithfulness and Factuality in Abstractive Summarization",
        authors: "Maynez et al.",
        venue: "ACL 2020",
        verified: true,
        priority: "medium",
        difficulty: "Intermediate",
        readTime: "~1.5 hours",
        readSections: "Methodology for factuality evaluation",
        whyImportant: "Methodologically relevant to our ECR metric design (§9)",
        keyTakeaways:
          "Faithfulness ≠ factuality; human evaluation protocols; annotation agreement challenges",
        phase: "experiments",
      },
    ],
  },
  {
    title: "Stage 2 — Multi-Agent Systems",
    icon: "🤖",
    description:
      "Core multi-agent debate papers — baselines and closest architectural competitors.",
    papers: [
      {
        id: 7,
        title: "Improving Factuality and Reasoning through Multiagent Debate",
        authors: "Du et al.",
        venue: "ICML 2024",
        verified: true,
        priority: "critical",
        difficulty: "Intermediate",
        readTime: "~2 hours",
        readSections:
          "Sections 3–4 (method) in full — this is what we reproduce as Gate 0",
        whyImportant:
          "Foundational MAD paper — our Gate 0 reproduction target and direct baseline (§4, §13)",
        keyTakeaways:
          "MAD improves factuality over single-agent; majority-vote aggregation used; no evidence grounding (our gap)",
        phase: "phase0",
        note: "Verify final venue/year before thesis submission",
      },
      {
        id: 8,
        title: "Multi-LLM Debate: Framework, Principals, and Interventions",
        authors: "Estornell & Liu",
        venue: "NeurIPS 2024 Main Track (DOI: 10.52202/079017-0911)",
        verified: true,
        priority: "critical",
        difficulty: "Advanced",
        readTime: "~2.5 hours (theorems require care)",
        readSections: "Theorems 6.1, 6.2 and intervention sections",
        whyImportant:
          "Strongest existing theoretical grounding for majority-convergence phenomenon — our Propositions 1–3 should cite/position against this directly (§3, §4.5)",
        keyTakeaways:
          'Similar capabilities → static majority convergence ("tyranny of majority"); three interventions: diversity, quality, misconception-refutation',
        phase: "phase0",
      },
      {
        id: 9,
        title: "Encouraging Divergent Thinking through Multi-Agent Debate",
        authors: "Liang et al.",
        venue: "EMNLP 2024",
        verified: true,
        priority: "medium",
        difficulty: "Intermediate",
        readTime: "~1.5 hours",
        readSections: "Debate protocol design choices",
        whyImportant: "Alternative MAD formulation useful for comparison (§4)",
        keyTakeaways:
          '"Tit-for-tat" debate strategy; degeneration-of-thought problem; divergent thinking prompting',
        phase: "phase0",
      },
      {
        id: 10,
        title: "Mixture-of-Agents Enhances LLM Capabilities",
        authors: "Wang et al.",
        venue: "ICLR 2025 (Spotlight)",
        verified: true,
        priority: "critical",
        difficulty: "Intermediate",
        readTime: "~2 hours",
        readSections:
          "Method section extremely carefully — Baseline B6 reimplementation",
        whyImportant:
          "Baseline B6 — must read in full for faithful reimplementation (§5, §9)",
        keyTakeaways:
          "Layered proposer-aggregator architecture; static equal-weight; no evidence grounding or dynamic trust",
        phase: "impl",
      },
      {
        id: 11,
        title:
          "AutoGen: Enabling Next-Gen LLM Applications via Multi-Agent Conversations",
        authors: "Wu et al.",
        venue: "COLM 2024",
        verified: true,
        priority: "medium",
        difficulty: "Beginner",
        readTime: "~1.5 hours",
        readSections: "Framework architecture overview",
        whyImportant:
          "Alternative orchestration framework to LangGraph (§7 tooling decisions)",
        keyTakeaways:
          "Conversable agent abstraction; flexible multi-agent patterns; practical framework design",
        phase: "phase0",
      },
      {
        id: 12,
        title:
          "ChatEval: Towards Better LLM-based Evaluators through Multi-Agent Debate",
        authors: "Chan et al.",
        venue: "ICLR 2024",
        verified: true,
        priority: "high",
        difficulty: "Intermediate",
        readTime: "~1.5 hours",
        readSections: "Method and limitations",
        whyImportant:
          "Related work — role-based debate for evaluation; no dynamic trust (§2, §4)",
        keyTakeaways:
          "Fixed agent roles (no dynamic trust); relevant limitation we build against",
        phase: "phase0",
      },
      {
        id: 13,
        title: "CRITIC: LLMs Can Self-Correct with Tool-Interactive Critiquing",
        authors: "Gou et al.",
        venue: "ICLR 2024",
        verified: true,
        priority: "medium",
        difficulty: "Intermediate",
        readTime: "~1.5 hours",
        readSections: "Method and limitations",
        whyImportant:
          "Single-agent self-critique logic — helps explain why multi-agent adds value (§2, §9)",
        keyTakeaways:
          "Tool-augmented self-correction; single-agent limitation (no cross-agent trust dynamics)",
        phase: "phase0",
      },
      {
        id: 14,
        title: "Self-Consistency Improves Chain of Thought Reasoning",
        authors: "Wang et al.",
        venue: "ICLR 2023",
        verified: true,
        priority: "critical",
        difficulty: "Beginner",
        readTime: "~1 hour",
        readSections: "Core method",
        whyImportant:
          "Baseline B5 — must understand for evaluation comparison (§5, §9)",
        keyTakeaways:
          "K-sample majority vote from single model; no inter-agent interaction; vulnerable to shared misconceptions",
        phase: "impl",
      },
      {
        id: 15,
        title:
          "iMAD: Intelligent Multi-Agent Debate for Efficient and Accurate LLM Inference",
        authors: "Fan, Yoon, Ji",
        venue: "AAAI 2026 (Oral)",
        verified: true,
        priority: "critical",
        difficulty: "Advanced",
        readTime: "~3 hours (multiple passes)",
        readSections:
          "Method multiple times; 41-feature list in detail — B9 reimplementation target",
        whyImportant:
          "Baseline B9 — single most important competitor comparison (§5, §3); 41 linguistic features for confidence estimation",
        keyTakeaways:
          "Learned classifier from same-context signals; token-efficient; confidence derived from same context as injected pressure (our exact attack vector)",
        phase: "impl",
        note: "Re-read carefully immediately before implementing B9",
      },
    ],
  },
  {
    title: "Stage 3 — Scientific Reasoning & Evaluation Datasets",
    icon: "🔬",
    description:
      "Dataset-adjacent papers and scientific claim verification methodology.",
    papers: [
      {
        id: 16,
        title: "Fact or Fiction: Verifying Scientific Claims",
        authors: "Wadden et al.",
        venue: "EMNLP 2020",
        verified: true,
        priority: "high",
        difficulty: "Intermediate",
        readTime: "~1.5 hours",
        readSections: "Support/Refute/NEI classification framework",
        whyImportant:
          "Introduces SciFact — close-cousin task to our scientific claim verification (§8, §2)",
        keyTakeaways:
          "Support/Refute/NEI classification; rationale-level evidence; flat classification paradigm",
        phase: "phase0",
      },
      {
        id: 17,
        title: "Explaining Relationships Between Scientific Documents",
        authors: "Luu et al.",
        venue: "TACL 2021",
        verified: true,
        priority: "medium",
        difficulty: "Intermediate",
        readTime: "~1 hour",
        readSections: "Citation-relationship classification",
        whyImportant:
          "Understanding how scientific claims relate to source evidence (§4.3)",
        keyTakeaways:
          "Citation-relationship classification; conceptual grounding for claim-to-evidence mapping",
        phase: "impl",
      },
      {
        id: 18,
        title: "PubMedQA: Biomedical Research QA",
        authors: "Jin et al.",
        venue: "EMNLP 2019",
        verified: true,
        priority: "medium",
        difficulty: "Beginner",
        readTime: "~1 hour",
        readSections: "Dataset design and annotation methodology",
        whyImportant:
          "Representative of PubMed-partitioned retrieval design space (§8, §4.3)",
        keyTakeaways:
          "Yes/no/maybe biomedical QA; expert-annotated; reference for PubMed-grounded evidence retrieval",
        phase: "experiments",
      },
      {
        id: 19,
        title: "GPQA: A Graduate-Level Google-Proof Q&A Benchmark",
        authors: "Rein et al.",
        venue: "COLM 2024",
        verified: true,
        priority: "critical",
        difficulty: "Beginner",
        readTime: "~1 hour",
        readSections: "Dataset construction and evaluation methodology",
        whyImportant:
          "One of our primary stable-comparison evaluation datasets (§8, §9)",
        keyTakeaways:
          "Expert-written, hard-to-search; resists simple retrieval shortcuts; strong current reasoning standard",
        phase: "experiments",
      },
      {
        id: 20,
        title:
          "MMLU-Pro: A More Robust Multi-Task Language Understanding Benchmark",
        authors: "Wang et al.",
        venue: "NeurIPS 2024 (Datasets & Benchmarks)",
        verified: true,
        priority: "critical",
        difficulty: "Beginner",
        readTime: "~1 hour",
        readSections: "Dataset construction; 10-option format rationale",
        whyImportant:
          "Our second stable-comparison evaluation dataset (§8, §9)",
        keyTakeaways:
          "10-option format reduces guessing; broader and harder than original MMLU",
        phase: "experiments",
      },
    ],
  },
  {
    title:
      "Stage 4 — Closest Related Work (Contribution / Limitation / Gap Analysis)",
    icon: "🎯",
    description:
      "The most load-bearing papers — closest competitors whose differentiation is critical for thesis framing. Re-read before writing.",
    papers: [
      {
        id: 21,
        title:
          "Peacemaker or Troublemaker: How Sycophancy Shapes Multi-Agent Debate",
        authors: "Yao et al.",
        venue:
          "Preprint (arXiv:2509.23055) — submitted to ICLR 2026, WITHDRAWN",
        verified: true,
        priority: "critical",
        difficulty: "Advanced",
        readTime: "~2.5 hours",
        readSections:
          "Full paper — this is our primary problem-definition citation",
        whyImportant:
          "First formal definition of inter-agent sycophancy in MAD settings — diagnostic only, no mitigation (§2, §0)",
        keyTakeaways:
          "Diagnoses debater vs judge-driven sycophancy; no mitigation proposed; future-work section implicitly calls for exactly our mechanism",
        phase: "writing",
        note: "Cite explicitly as preprint; do not imply peer-reviewed status",
      },
      {
        id: 22,
        title: "Minority Sentinel (post-hoc classifier)",
        authors: "He et al.",
        venue: "AgentSearch Workshop @ SIGIR 2026 (workshop-level peer review)",
        verified: true,
        priority: "critical",
        difficulty: "Advanced",
        readTime: "~2 hours",
        readSections: "Full paper — method and limitations",
        whyImportant:
          "Post-hoc mitigation via LightGBM on debate-log features — key differentiation target (§2, §3)",
        keyTakeaways:
          "Minority correct in ~1/4 disagreements; post-hoc only, no in-session intervention; not evidence-grounded",
        phase: "writing",
        note: "Cite as workshop paper, not full conference",
      },
      {
        id: 23,
        title:
          "CONSENSAGENT: Efficient Consensus through Sycophancy Mitigation",
        authors: "Pitre, Ramakrishnan, Wang",
        venue: "Findings of ACL 2025 (pp. 22112–22133, Vienna)",
        verified: true,
        priority: "critical",
        difficulty: "Advanced",
        readTime: "~3 hours (full paper)",
        readSections:
          "Full paper — this is your closest published mitigation competitor. Read before finalizing §3 related-work table.",
        whyImportant:
          "First published, peer-reviewed mitigation for multi-agent sycophancy — prompt-refinement approach. Previously missing from our list. CLOSEST COMPETITOR.",
        keyTakeaways:
          "Static/dynamic prompt refinement (not numeric trust score); no external retrieval; not tested against adversarial injection; state-of-the-art on six reasoning datasets",
        phase: "writing",
        note: "Cite from ACL Anthology (aclanthology.org/2025.findings-acl.1141/) — MUST differentiate: prompt-refinement vs evidence-grounded numeric trust",
      },
      {
        id: 24,
        title: "DebUnc: Improving Agent Communication with Uncertainty Metrics",
        authors: "Yoffe, Amayuelas, Wang",
        venue: "Findings of EMNLP 2025",
        verified: true,
        priority: "critical",
        difficulty: "Advanced",
        readTime: "~2 hours",
        readSections:
          'Full paper — closest on "dynamic in-loop weighting" dimension',
        whyImportant:
          "Closest prior art on dynamic in-loop weighting specifically — uses self-reported uncertainty signals, not external evidence (§2, §3)",
        keyTakeaways:
          "Uncertainty-based inter-agent influence modulation; self-reported signals (not external evidence) — sharpest differentiation line",
        phase: "writing",
      },
      {
        id: 25,
        title:
          "Talk Isn't Always Cheap: Understanding Failure Modes in Multi-Agent Debate",
        authors: "Wynn, Satija, Hadfield",
        venue:
          "Venue ambiguous — treat as arXiv:2509.05396; verify ICML 2025 inclusion before citing",
        verified: true,
        priority: "high",
        difficulty: "Intermediate",
        readTime: "~1.5 hours",
        readSections: "Intervention testing results",
        whyImportant:
          "Tests interventions against sycophancy; finds most insufficient (§2 motivation)",
        keyTakeaways:
          'Diagnostic/intervention-testing; no new mitigation mechanism; confirms "why this is hard"',
        phase: "writing",
        note: "Verify ICML 2025 proceedings directly before final citation",
      },
      {
        id: 26,
        title:
          "ReConcile: Round-Table Conference Improves Reasoning via Consensus among Diverse LLMs",
        authors: "Chen, Saha, Bansal",
        venue: "ACL 2024",
        verified: true,
        priority: "high",
        difficulty: "Intermediate",
        readTime: "~1.5 hours",
        readSections:
          "Method — confidence-weighted voting / round-table consensus mechanism",
        whyImportant:
          "Mitigation-adjacent; confidence-weighted voting among diverse LLMs — cited alongside ConsensAgent as comparison (§3)",
        keyTakeaways:
          "Round-table confidence-weighted consensus across diverse LLMs; not evidence-grounded — trust is self-estimated confidence, not external verification",
        phase: "impl",
      },
      {
        id: 27,
        title: "The Cost of Consensus: Self-Correction vs Multi-Agent Debate",
        authors: "(2026)",
        venue: "arXiv:2605.00914 — pre-print",
        verified: true,
        priority: "medium",
        difficulty: "Intermediate",
        readTime: "~1 hour",
        readSections: "Results and claims challenging MAD premise",
        whyImportant:
          "Argues isolated self-correction can outperform MAD — defense-prep read for reviewer objection (§18)",
        keyTakeaways:
          "Challenge to core MAD premise; prepare counter-argument for defense",
        phase: "writing",
      },
      {
        id: 28,
        title:
          "Not All Flips Are Conformity: Decomposing Stance Convergence in MAD",
        authors: "Hao et al.",
        venue: "arXiv:2606.00820 — pre-print",
        verified: true,
        priority: "high",
        difficulty: "Advanced",
        readTime: "~1.5 hours",
        readSections: "Conformity vs legitimate belief-updating decomposition",
        whyImportant:
          "Could inform our CCR metric design — their decomposition framework may apply to our C4 validity check (§9)",
        keyTakeaways:
          "Separates conformity from genuine belief updating in MAD — directly relevant to injection protocol validity",
        phase: "experiments",
      },
      {
        id: 29,
        title: "Bayesian Assessment of Sycophancy in LLMs (BASIL)",
        authors: "Atwell, Heydari, Sicilia, Alikhani",
        venue: "arXiv:2508.16846 — pre-print (2026)",
        verified: true,
        priority: "medium",
        difficulty: "Advanced",
        readTime: "~1.5 hours",
        readSections: "Bayesian sycophancy measurement methodology",
        whyImportant: "Methodologically relevant to our ECR metric design (§9)",
        keyTakeaways:
          "Bayesian framing of sycophancy measurement — potential methodological cross-reference for calibrating trust vs. correctness",
        phase: "experiments",
        note: "arXiv:2508.16846 — verify final venue before citing",
      },
      {
        id: 36,
        title:
          "When Persuasion Overrides Truth in Multi-Agent LLM Debates (CW-POR)",
        authors: "Agarwal & Khanna",
        venue: "arXiv:2504.00374 — pre-print",
        verified: true,
        priority: "critical",
        difficulty: "Advanced",
        readTime: "~1.5 hours",
        readSections:
          "CW-POR metric definition; confidence-normalization procedure",
        whyImportant:
          "Directly motivates our CCR/ECR framing — shows an LLM judge endorses a persuasive falsehood over a correct answer WITH HIGH CONFIDENCE, the exact self-reported-confidence failure our external evidence signal is designed to bypass (§2, §9, §18)",
        keyTakeaways:
          "Confidence-Weighted Persuasion Override Rate; persuasive-but-wrong arguments override truth even in small models; underscores need for external calibration over self-reported confidence",
        phase: "writing",
        note: "NEW (Jul 2026 check) — cite as the sharpest evidence that self-reported confidence (iMAD-style) is manipulable; strengthens our external-evidence argument",
      },
      {
        id: 37,
        title:
          "Heterogeneous LLM Debate Under Adversarial Peers: Honest Gains, Replacement Costs, and Resilience",
        authors: "Nilayam, Ramanna, Tumbade, Nayak (ServiceNow)",
        venue: "arXiv:2606.19826 — pre-print",
        verified: true,
        priority: "high",
        difficulty: "Advanced",
        readTime: "~2 hours",
        readSections:
          "Matched-panel methodology; harmful-revision vs corrective-revision measurement",
        whyImportant:
          "Empirically grounds our heterogeneity design choice (§5, Challenge D) — shows an honest heterogeneous peer cuts harmful revision (89%→35%) while an adversarial one reverses it. Directly informs our correlated-failure and 2-vs-1 injection analysis (§10)",
        keyTakeaways:
          "Heterogeneity is both an attack surface AND a defense when an adversary is already present; end-of-debate flip rate exposes damage that conditional revision rate hides",
        phase: "experiments",
        note: "NEW (Jul 2026 check) — supports our heterogeneous-family design and adversarial-injection framing",
      },
      {
        id: 38,
        title:
          "PARROT: Persuasion and Agreement Robustness Rating of Output Truth — a Sycophancy Robustness Benchmark",
        authors: "Çelebi, Ezerceli, El Hussieni",
        venue: "arXiv:2511.17220 — pre-print (2025)",
        verified: true,
        priority: "high",
        difficulty: "Intermediate",
        readTime: "~1.5 hours",
        readSections: "Benchmark construction; robustness rating protocol",
        whyImportant:
          "Recent standardized sycophancy-robustness benchmark — a candidate external comparison point / complementary stress set alongside our injection protocol (§8, §9)",
        keyTakeaways:
          "Standardized persuasion/agreement robustness rating; useful as an independent robustness axis to cross-check our CCR results against",
        phase: "experiments",
        note: "NEW (Jul 2026 check) — evaluate as a supplementary benchmark; verify venue before citing",
      },
      {
        id: 39,
        title:
          "When Identity Skews Debate: Anonymization for Bias-Reduced Multi-Agent Reasoning",
        authors: "(2025)",
        venue: "arXiv:2510.07517 — pre-print",
        verified: true,
        priority: "medium",
        difficulty: "Intermediate",
        readTime: "~1.5 hours",
        readSections:
          "Identity-bias framing; anonymization mitigation and its limits",
        whyImportant:
          "Represents a THIRD mitigation family (anonymization / identity-bias removal) distinct from prompt-refinement (ConsensAgent) and our evidence-grounding — must be differentiated in related work: it removes identity cues, it does not verify claims against external evidence (§2, §3)",
        keyTakeaways:
          "Unifies sycophancy + self-bias as 'identity bias'; mitigates by anonymizing peer outputs — orthogonal to evidence verification, so complementary rather than competing",
        phase: "writing",
        note: "NEW (Jul 2026 check) — add to §3 related-work as a distinct mitigation family we position against",
      },
    ],
  },
  {
    title: "Stage 5 — Supporting Technologies & Infrastructure",
    icon: "🛠️",
    description:
      "Engineering references for implementation. Read on demand when building specific components.",
    papers: [
      {
        id: 30,
        title: "Passage Re-Ranking with BERT (cross-encoder)",
        authors: "Nogueira & Cho",
        venue:
          "arXiv 2019 — preprint (technique now standard practice across peer-reviewed work)",
        verified: true,
        priority: "medium",
        difficulty: "Intermediate",
        readTime: "~1 hour",
        readSections: "Cross-encoder architecture overview",
        whyImportant:
          "Underlies our ms-marco-MiniLM evidence-scoring reranker (§4.3, §7)",
        keyTakeaways:
          "Cross-encoder architecture; accuracy vs bi-encoder speed trade-off",
        phase: "impl",
      },
      {
        id: 31,
        title: "LangGraph Documentation (orchestration framework)",
        authors: "LangChain/LangGraph",
        venue:
          "Official technical documentation — not a citable research paper",
        verified: true,
        priority: "high",
        difficulty: "Intermediate",
        readTime: "Engineering docs, read as needed",
        readSections: "State machine, round management, conditional edges",
        whyImportant:
          "Primary orchestration framework for our debate state machine (§7, §5 Orchestrator)",
        keyTakeaways:
          "State machine model fits round-based debate + injection point control precisely",
        phase: "impl",
        note: "Treat as engineering reference, not research citation",
      },
    ],
  },
  {
    title: "Stage 6 — Evaluation Methodology",
    icon: "📊",
    description:
      "Experimental design, statistical validation, and metric foundations.",
    papers: [
      {
        id: 32,
        title: "Calibration of Modern Neural Networks",
        authors: "Guo et al.",
        venue: "ICML 2017",
        verified: true,
        priority: "high",
        difficulty: "Intermediate",
        readTime: "~1.5 hours",
        readSections: "ECE methodology; temperature scaling",
        whyImportant:
          "Foundational calibration methodology — directly relevant to ECR metric design (§9)",
        keyTakeaways:
          "Expected Calibration Error (ECE); temperature scaling; our ECR adapts this framework to trust-score context",
        phase: "experiments",
      },
      {
        id: 33,
        title:
          "Statistical Significance Tests for MT Evaluation (paired bootstrap)",
        authors: "Koehn",
        venue: "EMNLP 2004",
        verified: true,
        priority: "high",
        difficulty: "Intermediate",
        readTime: "~1 hour",
        readSections: "Paired bootstrap resampling method",
        whyImportant:
          "Source of paired bootstrap methodology named in our evaluation plan (§9)",
        keyTakeaways: "Implements exact method cited in our evaluation design",
        phase: "experiments",
      },
      {
        id: 34,
        title: "Show Your Work: Improved Reporting of Experimental Results",
        authors: "Dodge et al.",
        venue: "EMNLP-IJCNLP 2019",
        verified: true,
        priority: "medium",
        difficulty: "Beginner",
        readTime: "~1 hour",
        readSections: "Best practices for multi-seed reporting",
        whyImportant:
          "Best-practices reference for our CI + multi-seed + effect-size commitments (§9, §16)",
        keyTakeaways:
          "Variance across seeds underreported; CI + multi-seed practices already in our plan",
        phase: "experiments",
      },
      {
        id: 35,
        title: "Beyond Accuracy: Behavioral Testing with CheckList",
        authors: "Ribeiro et al.",
        venue: "ACL 2020 (Best Paper)",
        verified: true,
        priority: "medium",
        difficulty: "Intermediate",
        readTime: "~1.5 hours",
        readSections:
          "Behavioral testing methodology; failure taxonomy approach",
        whyImportant:
          "Methodological inspiration for our failure taxonomy and edge-case testing (§10, §9)",
        keyTakeaways:
          "Systematic behavioral testing beyond aggregate accuracy; directly analogous to our failure-category breakdown",
        phase: "experiments",
      },
    ],
  },
];
