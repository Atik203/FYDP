# AGENTS.md

Canonical agent instructions for this repo. Read by opencode (DeepSeek V4, MiniMax M3, Kimi K2.7, etc.), Claude Code (via `CLAUDE.md` import), and any other agent runner. Keep this file stable — see "Cache discipline" at the bottom.

## Project

Static React site presenting the FYDP research proposal **"Trust-Calibrated Multi-Agent Scientific Deliberation for Mitigating Sycophantic Consensus in LLM Reasoning"** (Group 6 · Team Phantom Devs).

Core thesis: in multi-agent LLM debate, a confidently wrong majority can pressure a correct minority agent into abandoning its answer (sycophantic collapse). The proposal re-weights each agent's influence *during* the debate using an evidence-grounded trust score derived from retrieved external evidence, not a majority vote. This repo is the presentation of that proposal, not an implementation of the mechanism.

## Tech stack

- React 19 + TypeScript + Vite 8
- Tailwind CSS 4 (via `@tailwindcss/vite`, not a PostCSS config)
- React Router 7
- `@xyflow/react` for architecture/pipeline diagrams
- `lucide-react` for icons
- Oxlint for linting
- Puppeteer for post-build static prerendering

## Commands

| Command | Purpose |
| --- | --- |
| `npm install` | Install deps |
| `npm run dev` | Vite dev server with HMR |
| `npm run build` | `tsc -b` typecheck → `vite build` → prerender all routes |
| `npm run preview` | Serve the production build |
| `npm run lint` | Oxlint |

Always run `npm run build` after changing `.tsx`/`.ts` — it typechecks *and* prerenders, so it is the single source of truth for "did I break it". There is no test runner configured; do not invent one unless asked.

## Layout

```text
src/
  components/layout/   SiteNav, SiteFooter, PageHeader
  components/shared/   Diagrams (ArchitectureFlow, PipelineFlow), TrustSimulator,
                       tables, Timeline, Callout, and reusable UI
  context/             ThemeContext provider
  data/                Page content (ideas.ts, overview.ts, papers.ts)
  pages/               One component per route
scripts/prerender.mjs  Headless-Chrome prerender, runs after vite build
docs/                  Research blueprint + literature-review guide
literature_review/
  index.md             Master paper matrix / gap map / verification log
  papers/              One detailed review file per paper (NN-slug-author-year.md)
```

## Routes

Defined in `src/App.tsx`; the prerender list in `scripts/prerender.mjs` must match.

| Path | Page | Notes |
| --- | --- | --- |
| `/` | OverviewPage | |
| `/idea/1` | IdeaDetailPage | The proposal detail |
| `/roadmap` | RoadmapPage | |
| `/papers` | PapersPage | Literature review |
| `/proposal` | ProposalPage | |
| `/slide` | SlidePage | Projector deck, not in nav; keyboard-nav only |

When you add or remove a route, update **both** `src/App.tsx` and the `routes` array in `scripts/prerender.mjs`, or the new page won't be prerendered.

## Conventions

- **Imports:** use the `@/` alias for `src/` (e.g. `@/lib/utils`). It's configured in `vite.config.ts` and `tsconfig`.
- **Class names:** merge with `cn()` from `@/lib/utils` (clsx + tailwind-merge). Don't hand-concatenate class strings.
- **Icons:** import individually from `lucide-react`.
- **Content vs. presentation:** page copy that's naturally data lives in `src/data/*.ts`; one-off layout lives in the page/component. Match whichever pattern the page you're editing already uses.
- **Slides:** `SlidePage.tsx` uses container-query units (`cqw`/`cqh`) so text scales with the 16:9 canvas, not the window. Reuse the existing `Card` and `Bullet` helpers and the `NEAR_BLACK`/`ACCENT`/`TEAL`/`AMBER`/`ROSE` color constants. New slides are functions added to the `SLIDES` array.
- **Lint:** respect `.oxlintrc.json` (react/rules-of-hooks is an error). The repo uses `flex-shrink-0` etc.; match surrounding style rather than "fixing" it.
- Match the comment density, naming, and idioms of the file you're editing. Prefer prose in docs; use tables only where they earn their keep.

## Literature review

Paper reviews live in `literature_review/papers/NN-slug-author-year.md` and follow a fixed expert template (see `01-imad-fan-2026.md` as the reference format): header block (status / threat-to-novelty / verified date / summary / relevance / gap), then a Section 2 with a Q1–Q9 quick-reference table and deeper analysis. When adding a paper, also update `literature_review/index.md` (comparison matrix, quick triage, gap map, verification log). Verify citations against the primary source (ACL Anthology, DOI, DBLP), not just the PDF footer.

## Safety / scope

- Static presentation repo. There are no secrets, servers, or auth here — don't add them unless asked.
- `pdfs/` and `markdowns/` are gitignored source material; don't commit them.
- Don't commit unless explicitly asked. Never push to `main` directly; use a branch.
- `dist/` is build output — never edit it by hand.

## Cache discipline (why this file is structured this way)

To maximize prompt-cache hits across agent tools and models (DeepSeek V4, MiniMax M3, Kimi K2.7, Claude Code), this file is the **single canonical instruction block**:

- `CLAUDE.md` contains only `@AGENTS.md` so both entry points load the *same* byte sequence — one cached prefix, not two divergent ones.
- Keep this file **static**: no dates, no "current status", no volatile counts, no per-session notes. Anything that changes often belongs in code, `README.md`, or `literature_review/index.md` — never here. A stable prefix is what lets the cache hit across sessions.
- Put the most stable, general content first and edit lower sections when possible; edits near the top invalidate the cached prefix for every model.
- Prefer editing existing lines over reordering; reordering churns the cache even when meaning is unchanged.
