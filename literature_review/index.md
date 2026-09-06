# Literature Review Index

**Project:** Trust-Calibrated Multi-Agent Scientific Deliberation for Mitigating Sycophantic Consensus in LLM Reasoning

**Last updated:** 2026-09-05

---

## Master Comparison Matrix

| # | Paper | Year | Venue | Role | Threat to Novelty | Last Verified | File |
|---|---|---|---|---|---|---|---|
| 1 | iMAD (Fan et al.) | 2026 | AAAI (Oral) | **Baseline (B9)** | Low | 2026-07-17 | [papers/01-imad-fan-2026.md](papers/01-imad-fan-2026.md) |
| 2 | ConsensAgent (Pitre et al.) | 2025 | Findings of ACL | **Competitor (nearest neighbor)** | High | 2026-07-17 | [papers/02-consensagent-pitre-2025.md](papers/02-consensagent-pitre-2025.md) |
| 3 | DebUnc (Yoffe et al.) | 2025 | Findings of EMNLP | **Competitor (closest on mechanism)** | Medium | 2026-07-17 | [papers/03-debunc-yoffe-2025.md](papers/03-debunc-yoffe-2025.md) |
| 4 | MoA (Wang et al.) | 2025 | ICLR (Poster) | **Context (foundational arch.)** | Low | 2026-07-17 | [papers/04-moa-wang-2025.md](papers/04-moa-wang-2025.md) |
| 5 | Minority Sentinel (He et al.) | 2026 | SIGIR Workshop | **Competitor** | Medium | 2026-08-15 | [papers/05-minority-sentinel-he-2026.md](papers/05-minority-sentinel-he-2026.md) |
| 6 | Multi-LLM Debate (Estornell & Liu) | 2024 | NeurIPS (Main) | **Context (theoretical)** | Low | 2026-09-05 | [papers/06-estornell-liu-2024.md](papers/06-estornell-liu-2024.md) |
| 7 | Debate or Vote (Choi et al.) | 2025 | NeurIPS (Spotlight) | **Competitor (mechanism challenge)** | High | 2026-09-05 | [papers/07-debate-or-vote-choi-2025.md](papers/07-debate-or-vote-choi-2025.md) |
| 8 | FREE-MAD (Cui et al.) | 2026 | Findings of ACL | **Competitor (consensus-free)** | Medium | 2026-09-05 | [papers/08-freemad-cui-2026.md](papers/08-freemad-cui-2026.md) |

### Legend

| Role | Meaning |
|---|---|
| **Baseline (BX)** | Directly evaluated against in our experiment plan |
| **Competitor** | Addresses same problem with different approach — requires differentiation argument |
| **Context** | Background or motivation citation — not directly compared |
| **Preprint** | Not peer-reviewed — cite with caution |

| Threat to Novelty | Meaning |
|---|---|
| **High** | Published solution overlaps substantially with C1 or C2 — gap argument must be sharp |
| **Medium** | Adjacent solution — needs explicit differentiation paragraph |
| **Low** | Different subproblem — cite as complementary or contextual |

---

## Quick Triage (At a Glance)

**Essential reading (must-read before team meetings):**
- iMAD (Fan et al., 2026) — Baseline B9, closest efficiency-focused approach
- ConsensAgent (Pitre et al., 2025) — Nearest neighbor; closest published sycophancy mitigation (High threat to novelty)
- DebUnc (Yoffe et al., 2025) — Closest on *mechanism* (in-debate influence reweighting); its Ground Truth oracle is our strongest motivation for an external trust signal
- Minority Sentinel (He et al., 2026) — Competitor; strongest quantified documentation of the minority-suppression phenomenon (25.5% of divergent cases) + LLM-as-Judge failure (NG −1.37%); post-hoc flip, not in-debate re-weighting
- Debate or Vote (Choi et al., 2025) — Mechanism challenge; martingale proof that neutral debate ≈ voting forces our vote-vs-debate ablation (High threat to novelty)
- FREE-MAD (Cui et al., 2026) — Consensus-free competitor; trajectory scoring without evidence grounding sharpens our differentiation

**Important context:**
- MoA (Wang et al., 2025) — Foundational multi-model aggregation; the trust-blind, evidence-free baseline we improve on
- Multi-LLM Debate (Estornell & Liu, 2024) — Theoretical foundation; proves tyranny-of-the-majority and shared-misconception decay, fixed by pruning rather than evidence-grounded trust

**Diagnostic / measurement (cite for problem motivation):**
- [Pending: Yao et al.]

---

## Gap Map

| What our idea does | Who else does it | Gap remaining |
|---|---|---|
| Evidence-grounded in-session trust re-weighting | **None** (claimed gap) | Novel |
| Token-efficient debate triggering | iMAD (Fan et al., 2026) | Our confidence gate (§4.1) is simpler; iMAD's approach is complementary |
| Sycophancy mitigation in multi-agent debate | ConsensAgent (Pitre et al., 2025) — via *pre-debate prompt rewriting*, aggregates on self-reported confidence | Ours calibrates trust *during* debate via external evidence; prompt clarity ≠ agent trust calibration |
| Static multi-model aggregation | MoA (Wang et al., 2025) | No dynamic trust, no evidence grounding |
| Uncertainty-based in-loop weighting | DebUnc (Yoffe et al., 2025) — token-entropy self-confidence via prompt or attention-scaling | Ours uses *external retrieved evidence*, not internal self-reported uncertainty; DebUnc's own Ground Truth oracle shows self-confidence is the binding constraint |
| Post-hoc sycophancy detection | He et al. (Minority Sentinel, 2026) | After debate ends, not during — binary flip on behavioral fingerprint, no in-debate re-weighting, no external grounding |
| Theoretical majority-convergence analysis | Estornell & Liu (2024) | Theoretical, not a deployed system |
| Vote-vs-debate disentanglement | Choi et al. (2025) — neutral debate is a martingale, voting explains most gains | Ours adds the exogenous correction channel (evidence-grounded trust) their theory predicts should help |
| Consensus-free trajectory scoring | FREE-MAD (Cui et al., 2026) — anti-conformity prompt + shift-score dict, no retrieval | Ours scores evidence support per claim with persistent trust, not opinion shifts |

---

## Verification Log

| Date | Paper | Status Change | Source |
|---|---|---|---|
| 2026-07-17 | iMAD | Confirmed AAAI 2026 Oral | Paper copyright notice + proceedings link |
| 2026-07-17 | iMAD | DOI corrected to 10.1609/AAAI.V40I35.40181 (was placeholder); Oral confirmed | DBLP + arXiv 2511.11306 Comments field |
| 2026-07-17 | ConsensAgent | Added as Paper #2 — Competitor (nearest neighbor), High threat to novelty | ACL Anthology 2025.findings-acl.1141 + PDF footer |
| 2026-07-17 | ConsensAgent | Confirmed Findings of ACL 2025, pp. 22112–22133, DOI 10.18653/v1/2025.findings-acl.1141 | ACL Anthology landing page |
| 2026-07-17 | DebUnc | Added as Paper #3 — Competitor (closest on mechanism), Medium threat. Confirmed Findings of EMNLP 2025, pp. 23299–23315, DOI 10.18653/v1/2025.findings-emnlp.1265 | ACL Anthology 2025.findings-emnlp.1265 + arXiv 2407.06426 |
| 2026-07-17 | MoA | Added as Paper #4 — Context (foundational arch.), Low threat | ICLR 2025 proceedings + OpenReview h0ZfDIrj7T + arXiv 2406.04692 |
| 2026-07-17 | MoA | Venue corrected: ICLR 2025 **Poster** (was listed "Spotlight") | iclr.cc/virtual/2025/poster/28787 + OpenReview |
| 2026-08-15 | Minority Sentinel | Added as Paper #5 — Competitor (closest on problem framing), Medium threat to novelty. Venue (AgentSearch Workshop @ SIGIR 2026, Melbourne) confirmed via paper footer; arXiv 2606.29270v1 (submitted 2026-06-28) verified | arXiv abs page + full paper text + PDF |
| 2026-09-05 | Multi-LLM Debate (Estornell & Liu) | Added as Paper #6 — Context (theoretical), Low threat to novelty. Venue (NeurIPS 2024 Main, Vancouver) confirmed via proceedings page; 27-page PDF fetched and reviewed | NeurIPS proceedings + PDF full text |
| 2026-09-05 | Debate or Vote (Choi et al.) | Added as Paper #7 — Competitor (mechanism challenge), High threat to novelty. Venue (NeurIPS 2025 Spotlight) confirmed via OpenReview + arXiv 2508.17536v2; forum fetch bot-walled, abstract + metadata verified | OpenReview landing page + arXiv abs page |
| 2026-09-05 | FREE-MAD (Cui et al.) | Added as Paper #8 — Competitor (consensus-free), Medium threat to novelty. Venue (Findings of ACL 2026, pp. 31977–31997) confirmed via ACL Anthology PDF footer + 21-page full text | ACL Anthology PDF full text |
