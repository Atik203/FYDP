# Literature Review Index

**Project:** Trust-Calibrated Multi-Agent Scientific Deliberation for Mitigating Sycophantic Consensus in LLM Reasoning

**Last updated:** 2026-07-17

---

## Master Comparison Matrix

| # | Paper | Year | Venue | Role | Threat to Novelty | Last Verified | File |
|---|---|---|---|---|---|---|---|
| 1 | iMAD (Fan et al.) | 2026 | AAAI (Oral) | **Baseline (B9)** | Low | 2026-07-17 | [papers/01-imad-fan-2026.md](papers/01-imad-fan-2026.md) |
| 2 | ConsensAgent (Pitre et al.) | 2025 | Findings of ACL | **Competitor (nearest neighbor)** | High | 2026-07-17 | [papers/02-consensagent-pitre-2025.md](papers/02-consensagent-pitre-2025.md) |
| — | DebUnc (Yoffe et al.) | 2025 | Findings of EMNLP | Pending | Pending | — | — |
| — | MoA (Wang et al.) | 2025 | ICLR (Spotlight) | Pending | Pending | — | — |
| — | Estornell & Liu | 2024 | NeurIPS | Pending | Pending | — | — |
| — | Yao et al. (Peacemaker) | 2025 | Preprint (withdrawn) | Pending | Pending | — | — |
| — | He et al. (Minority Sentinel) | 2026 | SIGIR Workshop | Pending | Pending | — | — |

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

**Important context:**
- [Pending: MoA, DebUnc, Estornell & Liu]

**Diagnostic / measurement (cite for problem motivation):**
- [Pending: Yao et al., He et al.]

---

## Gap Map

| What our idea does | Who else does it | Gap remaining |
|---|---|---|
| Evidence-grounded in-session trust re-weighting | **None** (claimed gap) | Novel |
| Token-efficient debate triggering | iMAD (Fan et al., 2026) | Our confidence gate (§4.1) is simpler; iMAD's approach is complementary |
| Sycophancy mitigation in multi-agent debate | ConsensAgent (Pitre et al., 2025) — via *pre-debate prompt rewriting*, aggregates on self-reported confidence | Ours calibrates trust *during* debate via external evidence; prompt clarity ≠ agent trust calibration |
| Static multi-model aggregation | MoA (Wang et al., 2025) | No dynamic trust, no evidence grounding |
| Uncertainty-based in-loop weighting | DebUnc (Yoffe et al., 2025) | Self-reported vs externally verified |
| Post-hoc sycophancy detection | He et al. (Minority Sentinel, 2026) | After debate ends, not during |
| Theoretical majority-convergence analysis | Estornell & Liu (2024) | Theoretical, not a deployed system |

---

## Verification Log

| Date | Paper | Status Change | Source |
|---|---|---|---|
| 2026-07-17 | iMAD | Confirmed AAAI 2026 Oral | Paper copyright notice + proceedings link |
| 2026-07-17 | iMAD | DOI corrected to 10.1609/AAAI.V40I35.40181 (was placeholder); Oral confirmed | DBLP + arXiv 2511.11306 Comments field |
| 2026-07-17 | ConsensAgent | Added as Paper #2 — Competitor (nearest neighbor), High threat to novelty | ACL Anthology 2025.findings-acl.1141 + PDF footer |
| 2026-07-17 | ConsensAgent | Confirmed Findings of ACL 2025, pp. 22112–22133, DOI 10.18653/v1/2025.findings-acl.1141 | ACL Anthology landing page |
