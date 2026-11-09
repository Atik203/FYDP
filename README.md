# Trust-Calibrated Multi-Agent Scientific Deliberation

FYDP 2026 research proposal site — a static React app presenting the proposal for **Trust-Calibrated Multi-Agent Scientific Deliberation for Mitigating Sycophantic Consensus in LLM Reasoning**.

The core idea: in multi-agent LLM debate, a confidently wrong majority can pressure a correct minority agent into abandoning its answer. This project proposes re-weighting each agent's influence _during_ the debate based on how well its claims hold up against retrieved external evidence — an evidence-grounded trust score, not a majority vote.

## Research pipeline

The implementation of the proposed system lives in [`trustcal/`](trustcal/) (Python + vLLM). **P0 is released** (9 November 2026): gate 13/13, 514 tests, tags `p0-gate` and `p0-release`. This is engineering readiness, not efficacy — the 24-run Core matrix has not been run, the six-arm Full target is pending WP-18, and the 96 GB Final-stack hardware smoke has not run. Phase-by-phase plan: [`roadmap.md`](roadmap.md) · design: [`docs/blueprint.md`](docs/blueprint.md) · current implementation state: [`trustcal/IMPLEMENTATION_STATUS.md`](trustcal/IMPLEMENTATION_STATUS.md) · pre-registration: [`PRE_REGISTRATION.md`](PRE_REGISTRATION.md) · injection protocol spec: [`trustcal/INJECTION_PROTOCOL.md`](trustcal/INJECTION_PROTOCOL.md) · experiment reports and artifacts: [`experiments/`](experiments/). Agent/operator instructions for the GPU box: [`trustcal/AGENTS.md`](trustcal/AGENTS.md).

> **LLM agents: read [`AGENTS.md`](AGENTS.md) first.** The historical P0 audit and fix list live in [`docs/agent/README.md`](docs/agent/README.md); current release state is in [`trustcal/IMPLEMENTATION_STATUS.md`](trustcal/IMPLEMENTATION_STATUS.md) and [`experiments/p0/README.md`](experiments/p0/README.md).

## Tech stack

- **React 19** + **TypeScript** + **Vite 8**
- **Tailwind CSS 4** for styling
- **React Router 7** for routing
- **@xyflow/react** for the architecture/pipeline diagrams
- **Oxlint** for linting
- **Puppeteer** for static prerendering of each route (SEO / AI crawlers)

## Getting started

The React app lives in `frontend/`:

```bash
cd frontend
npm install
npm run dev
```

The dev server runs at the URL Vite prints (default `http://localhost:5173`).

## Scripts

| Script            | What it does                                                           |
| ----------------- | ---------------------------------------------------------------------- |
| `npm run dev`     | Start the Vite dev server with HMR                                     |
| `npm run build`   | Type-check (`tsc -b`), build, then prerender all routes to static HTML |
| `npm run preview` | Serve the production build locally                                     |
| `npm run lint`    | Run Oxlint                                                             |

## Routes

| Path             | Page                                                       |
| ---------------- | ---------------------------------------------------------- |
| `/`              | Overview                                                   |
| `/idea/1`        | Idea 1 detail — the trust-calibrated deliberation proposal |
| `/roadmap`       | Project roadmap / timeline                                 |
| `/papers`        | Literature review                                          |
| `/proposal`      | Full proposal                                              |
| `/slide`         | Main projector deck (keyboard navigation)                  |
| `/slide/ce`      | Complex Engineering deck                                   |
| `/slide/final`   | Final defence deck (18 slides)                             |
| `/slide/final/1` | Compact final deck (14 slides)                             |

## Project structure

```text
frontend/        React + Vite app (site source, configs, scripts)
  src/
    components/
      layout/     Nav, footer, page header
      shared/     Diagrams (ArchitectureFlow, PipelineFlow), TrustSimulator,
                  tables, timeline, and other reusable UI
    context/      Theme provider
    data/         Page content (ideas, overview, papers)
    pages/        One component per route
  scripts/
    prerender.mjs Post-build static prerendering via headless Chrome
trustcal/        Python pipeline (P0 released; see trustcal/AGENTS.md)
  src/trustcal/   inference, agents, retrieval, trust, orchestrator, eval, runner
  configs/        models.yaml (Dev→Final switch), experiments.yaml (Core matrix),
                  phase.yaml, datasets.yaml (revisions/provenance)
  scripts/        serve.sh, repro_mad.py (Gate 0), run_matrix.py, p0_gate.py,
                  check_stack.py, smoke_test.py
experiments/     Per-run reports and `next/WP-*.md` planning records
docs/            Research blueprint and literature-review guide
roadmap.md       Phase-by-phase execution plan (blueprint §12–13)
literature_review/
  papers/        Per-paper detailed review entries
```

## Prerendering

`npm run build` runs [frontend/scripts/prerender.mjs](frontend/scripts/prerender.mjs) after the Vite build. It launches headless Chrome, visits each route, and writes the fully-rendered HTML to `frontend/dist/<route>/index.html` so crawlers see real content instead of an empty SPA shell. If Chrome can't be found, prerendering is skipped with a warning and the build still succeeds.

## Deployment

Configured for Vercel via [frontend/vercel.json](frontend/vercel.json) — the project's Root Directory is `frontend`.
