# Manuscript figures

Canonical SVG sources for the six manuscript figures. The PNGs are generated from these files at exactly **6000 × 3375 px** (16:9, white background). At 10 in wide that is 600 DPI; at 6.5 in it is 923 DPI.

| Source | PNG | Pixels | Journal width | Journal DPI | Report width | Report DPI | Used by |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `fig-pipeline.svg` | `fig-pipeline.png` | 6000 × 3375 | 5.70 in (`0.88\linewidth`) | 1052 | 5.91 in (`\textwidth`) | 1016 | Journal Fig. 1; report Fig. 1.1 |
| `fig-context.svg` | `fig-context.png` | 6000 × 3375 | 5.18 in (`0.80\linewidth`) | 1157 | 5.91 in (`\textwidth`) | 1016 | Journal Fig. 2; report Fig. 3.1 |
| `fig-claim-example.svg` | `fig-claim-example.png` | 6000 × 3375 | 5.18 in (`0.80\linewidth`) | 1157 | 5.91 in (`\textwidth`) | 1016 | Journal Fig. 3 (report copy supplied, not referenced) |
| `fig-trust-detail.svg` | `fig-trust-detail.png` | 6000 × 3375 | 3.76 in (`0.58\linewidth`) | 1596 | 5.91 in (`\textwidth`) | 1016 | Journal Fig. 4 (report copy supplied, not referenced) |
| `fig-round-loop.svg` | `fig-round-loop.png` | 6000 × 3375 | 5.70 in (`0.88\linewidth`) | 1052 | 5.91 in (`\textwidth`) | 1016 | Journal Fig. 5 (report copy supplied, not referenced) |
| `fig-dataflow.svg` | `fig-dataflow.png` | 6000 × 3375 | 5.70 in (`0.88\linewidth`) | 1052 | 5.91 in (`\textwidth`) | 1016 | Journal Fig. 6; report Fig. 3.2 |

Journal widths use the `cas-sc` text width: 192 mm paper − 2 × 13.7 mm margins = 164.6 mm. Report widths use A4 with 3 cm margins (150 mm). DPI is `6000 / displayed width in inches`. The same PNGs are served by the site from `frontend/public/figures/` at `/figures/<name>.png`.

**Readability note.** A 26-unit body line is 11.7 pt at the 10 in design width, so it prints at about 6.1–6.7 pt at the journal placements above. The exception is `fig-trust-detail` at `0.58\linewidth` (3.76 in), where 26-unit text prints at about 4.4 pt. That placement should be widened to roughly `0.88\linewidth` or the figure simplified before submission; the PNG itself is correct at 600 DPI.

## Captions

**`fig-pipeline`** — End-to-end flow of the trust-calibrated deliberation pipeline: seeded option rendering, three heterogeneous agents, claim decomposition, claim-domain routing with deduplication, evidence verdicts, a bounded trust update, three revision rounds with a one-shot injection, and trust-weighted aggregation.

**`fig-context`** — Majority vote versus evidence-grounded trust. Left: two wrong agents pressure the correct minority into sycophantic collapse. Right: contradicted agents lose influence and the supported minority wins the weighted vote. Bottom: the verifier-noise, redundancy, and shared-error failure modes and the predicted sign reversal.

**`fig-claim-example`** — One answer decomposed into three atomic claims and checked against retrieved evidence. A supported claim adds `+α/n`, a contradicted claim subtracts `−β/n`, and an unverifiable claim contributes zero while remaining in the claim count.

**`fig-trust-detail`** — The bounded trust operator. Verdict counts enter one log-domain update, a single softmax maps scores to weights, and a simplex projection enforces a 0.1 floor and a 0.9 ceiling. Claim-count normalization and the neutral-evidence identity are shown separately.

**`fig-round-loop`** — The debate round loop. Rounds 1–3 repeat retrieval, verdicts, trust update, and revision; the stress test injects a wrong consensus once at round 2 and removes it at round 3. A closing pass computes `trust_for_positions` before the weighted vote, and the trust trajectory is tracked across rounds.

**`fig-dataflow`** — Schema-v2 record path. Question and option permutation, raw and parsed answer, claims and verdicts, trust trajectory and status, final answer and provenance feed the evaluation endpoints. Accuracy carries a question-clustered 95% CI.

## Regenerate

From `frontend/`:

```bash
node scripts/build_figures.mjs
```

The script reads each SVG, verifies `width="6000" height="3375" viewBox="0 0 1600 900"`, renders it in headless Chrome, checks the PNG IHDR, writes `docs/figures/<name>.png`, and copies the same file to `frontend/public/figures/`, `Papev_Summer26_6/`, and `FYDP_Summer/`. It never touches `uiu.png`. Any PNG narrower than 6000 px aborts the build.

## Manuscript alignment notes

The figures follow the current P0 design. Several manuscript passages and captions still describe the previous drawings and need a text-only update in the manuscript worktrees (no `.tex` file was changed here):

- `fig-context`: the journal §3.1 caption and report §3.2 describe a system-context diagram with external actors. This figure is the majority-vote/trust comparison required by the current design; either the caption/prose changes or the context diagram needs a separate asset.
- `fig-claim-example`: the journal caption describes one supported claim that raises trust. The figure now shows three claims with supported, contradicted, and unverifiable verdicts.
- `fig-trust-detail`: the journal caption still says softmax → clamp → renormalization. The P0-5 operator is one softmax followed by a floor/ceiling simplex projection.
- `fig-round-loop`: the journal caption says six stages; the figure shows R0–R3 plus the closing trust pass.
- `fig-dataflow`: the journal caption and report §3.3 describe a level-one DFD with three data stores. The figure shows the schema-v2 record path and evaluation endpoints required by the current design.
- Retrieval prose in journal §3.4 and report §3.1 still assigns one database per agent. The pipeline figure shows claim-domain routing (`bio/clinical → PubMed + S2`, `physics/chem and math/CS → arXiv + S2`, `other → S2/OpenAlex`), which is the P0-8 design.
