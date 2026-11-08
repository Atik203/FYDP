# Manuscript figures

Canonical SVG sources for the six journal figures and two report-specific drawings. Every PNG is generated at exactly **6000 × 3375 px** (16:9, white background). At 10 in wide that is 600 DPI; at 6.5 in it is 923 DPI.

## Journal figures

| Source | PNG | Pixels | Journal width | Journal DPI | Report width | Report DPI | Used by |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `fig-pipeline.svg` | `fig-pipeline.png` | 6000 × 3375 | 5.70 in (`0.88\linewidth`) | 1052 | 5.91 in (`\textwidth`) | 1016 | Journal Fig. 1; report Fig. 1.1 |
| `fig-context.svg` | `fig-context.png` | 6000 × 3375 | 5.18 in (`0.80\linewidth`) | 1157 | 5.91 in (`\textwidth`) | 1016 | Journal Fig. 2 only (report uses `report-context`) |
| `fig-claim-example.svg` | `fig-claim-example.png` | 6000 × 3375 | 5.18 in (`0.80\linewidth`) | 1157 | 5.91 in (`\textwidth`) | 1016 | Journal Fig. 3 (report copy supplied, not referenced) |
| `fig-trust-detail.svg` | `fig-trust-detail.png` | 6000 × 3375 | 3.76 in (`0.58\linewidth`) | 1596 | 5.91 in (`\textwidth`) | 1016 | Journal Fig. 4 (report copy supplied, not referenced) |
| `fig-round-loop.svg` | `fig-round-loop.png` | 6000 × 3375 | 5.70 in (`0.88\linewidth`) | 1052 | 5.91 in (`\textwidth`) | 1016 | Journal Fig. 5 (report copy supplied, not referenced) |
| `fig-dataflow.svg` | `fig-dataflow.png` | 6000 × 3375 | 5.70 in (`0.88\linewidth`) | 1052 | 5.91 in (`\textwidth`) | 1016 | Journal Fig. 6 only (report uses `report-dataflow`) |

## Report-only figures

The report keeps the journal versions of `fig-pipeline`, `fig-claim-example`, `fig-trust-detail`, and `fig-round-loop`. Its context and level-1 DFD drawings are different from the journal versions, so they have their own sources and are written only to `FYDP_Summer/`:

| Source | Output | Pixels | Report width | Report DPI | Used by |
| --- | --- | --- | --- | --- | --- |
| `report-context.svg` | `FYDP_Summer/fig-context.png` | 6000 × 3375 | 5.91 in (`\textwidth`) | 1016 | Report Fig. 3.1 |
| `report-dataflow.svg` | `FYDP_Summer/fig-dataflow.png` | 6000 × 3375 | 5.91 in (`\textwidth`) | 1016 | Report Fig. 3.2 |

The report-only PNGs are **not** written to `docs/figures/`, `frontend/public/figures/`, or `Papev_Summer26_6/`. The output names stay `fig-context.png` and `fig-dataflow.png` so the report's `\includegraphics` calls do not change.

Journal widths use the `cas-sc` text width: 192 mm paper − 2 × 13.7 mm margins = 164.6 mm. Report widths use A4 with 3 cm margins (150 mm). DPI is `6000 / displayed width in inches`. The journal PNGs are served by the site from `frontend/public/figures/` at `/figures/<name>.png`.

**Readability note.** A 26-unit body line is 11.7 pt at the 10 in design width, so it prints at about 6.1–6.7 pt at the journal placements above. The exception is `fig-trust-detail` at `0.58\linewidth` (3.76 in), where 26-unit text prints at about 4.4 pt. That placement should be widened to roughly `0.88\linewidth` or the figure simplified before submission; the PNG itself is correct at 600 DPI.

## Captions

**`fig-pipeline`** — End-to-end flow of the trust-calibrated deliberation pipeline: seeded option rendering, three heterogeneous agents, claim decomposition, claim-domain routing with deduplication, evidence verdicts, a logit update (`ℓ = log S + αV/n − βH/n`), one softmax, floor/ceiling simplex projection, three revision rounds with a one-shot injection, and trust-weighted aggregation.

**`fig-context`** — Majority vote versus evidence-grounded trust. Left: two wrong agents pressure the correct minority into sycophantic collapse. Right: contradicted agents lose influence and the supported minority wins the weighted vote. Bottom: the verifier-noise, redundancy, and shared-error failure modes and the predicted sign reversal.

**`fig-claim-example`** — One answer decomposed into three atomic claims and checked against retrieved evidence. A supported claim adds `+α/n`, a contradicted claim subtracts `−β/n`, and an unverifiable claim contributes zero while remaining in the claim count.

**`fig-trust-detail`** — The bounded trust operator. Verdict counts enter the log-domain update `ℓᵢ = log Sᵢ + αVᵢ/nᵢ − βHᵢ/nᵢ`; one softmax maps `ℓ` to weights, and `T = Π(softmax(ℓ))` projects them onto the simplex with a 0.1 floor and a 0.9 ceiling. Claim-count normalization and the neutral-evidence identity are shown separately.

**`fig-round-loop`** — The debate round loop. Rounds 1–3 repeat retrieval, verdicts, trust update, and revision; the stress test injects a wrong consensus once at round 2 and removes it at round 3. A closing pass computes `trust_for_positions` before the weighted vote, and the trust trajectory is tracked across rounds.

**`fig-dataflow`** — Schema-v2 record path. Question and option permutation, raw and parsed answer, claims and verdicts, trust trajectory and status, final answer and provenance feed the evaluation endpoints. Accuracy carries a question-clustered 95% CI.

**`report-context`** — System-boundary context diagram. The framework sits at the centre; the user/evaluation harness submits questions and receives the result package; the vLLM model server supplies agent completions; PubMed, arXiv, Semantic Scholar, and OpenAlex return evidence. Outputs are the answer, citations, trust trajectory, and reasoning trace.

**`report-dataflow`** — Level-1 data flow. Eight processes cover intake and option rendering, the confidence gate, orchestration/revision, claim decomposition, claim-domain routing, verification, trust update, and weighted aggregation/packaging. D1 stores the debate state, D2 the evidence and verdict log, and D3 the results log. The stress test injects a wrong consensus once before round 2; `trust_for_positions` is the vector used by the final vote.

## Regenerate

From `frontend/`:

```bash
node scripts/build_figures.mjs
```

The script reads each SVG, verifies `width="6000" height="3375" viewBox="0 0 1600 900"`, renders it in headless Chrome, and checks the PNG IHDR before writing. It writes the six journal figures to `docs/figures/`, `frontend/public/figures/`, and `Papev_Summer26_6/`; four of them also go to `FYDP_Summer/`. The two report-only drawings replace `FYDP_Summer/fig-context.png` and `FYDP_Summer/fig-dataflow.png`. It never touches `uiu.png`. Any PNG not exactly 6000 × 3375 px aborts the build.

## Manuscript alignment notes

The figures follow the current P0 design. Several manuscript passages and captions still describe the previous drawings and need a text-only update in the manuscript worktrees (no `.tex` file was changed here):

- Journal `fig-context`: the journal §3.1 caption still describes a system-context diagram with external actors. The journal figure is the majority-vote/trust comparison; the report uses `report-context` for its actual context diagram. The journal caption/prose still needs a text-only update.
- Journal `fig-dataflow`: the journal caption describes a level-one DFD with three data stores. The journal figure is the schema-v2 record path; the report's DFD is `report-dataflow`. The journal caption still needs a text-only update.
- `fig-claim-example`: the journal caption describes one supported claim that raises trust. The figure now shows three claims with supported, contradicted, and unverifiable verdicts.
- `fig-trust-detail`: the journal caption still says softmax → clamp → renormalization. The P0-5 operator is `ℓ = log S + αV/n − βH/n`, one softmax, then a floor/ceiling simplex projection.
- `fig-round-loop`: the journal caption says six stages; the figure shows R0–R3 plus the closing trust pass.
- Retrieval prose in journal §3.4 and report §3.1 still assigns one database per agent. The pipeline figure shows claim-domain routing (`bio/clinical → PubMed + S2`, `physics/chem and math/CS → arXiv + S2`, `other → S2/OpenAlex`), which is the P0-8 design.
