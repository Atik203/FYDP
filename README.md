# Trust-Calibrated Multi-Agent Scientific Deliberation

FYDP 2026–2027 research proposal site — a static React app presenting the proposal for **Trust-Calibrated Multi-Agent Scientific Deliberation for Mitigating Sycophantic Consensus in LLM Reasoning**.

The core idea: in multi-agent LLM debate, a confidently wrong majority can pressure a correct minority agent into abandoning its answer. This project proposes re-weighting each agent's influence *during* the debate based on how well its claims hold up against retrieved external evidence — an evidence-grounded trust score, not a majority vote.

## Tech stack

- **React 19** + **TypeScript** + **Vite 8**
- **Tailwind CSS 4** for styling
- **React Router 7** for routing
- **@xyflow/react** for the architecture/pipeline diagrams
- **Oxlint** for linting
- **Puppeteer** for static prerendering of each route (SEO / AI crawlers)

## Getting started

```bash
npm install
npm run dev
```

The dev server runs at the URL Vite prints (default `http://localhost:5173`).

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Start the Vite dev server with HMR |
| `npm run build` | Type-check (`tsc -b`), build, then prerender all routes to static HTML |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run Oxlint |

## Routes

| Path | Page |
| --- | --- |
| `/` | Overview |
| `/idea/1` | Idea 1 detail — the trust-calibrated deliberation proposal |
| `/roadmap` | Project roadmap / timeline |
| `/papers` | Literature review |
| `/proposal` | Full proposal |

## Project structure

```text
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
docs/           Research blueprint and literature-review guide
literature_review/
  papers/       Per-paper detailed review entries
```

## Prerendering

`npm run build` runs [scripts/prerender.mjs](scripts/prerender.mjs) after the Vite build. It launches headless Chrome, visits each route, and writes the fully-rendered HTML to `dist/<route>/index.html` so crawlers see real content instead of an empty SPA shell. If Chrome can't be found, prerendering is skipped with a warning and the build still succeeds.

## Deployment

Configured for Vercel via [vercel.json](vercel.json).
