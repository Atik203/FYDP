# TrustCal

**The Boundaries of Evidence-Grounded Trust in Multi-Agent Scientific Debate, with a Controlled Benchmark for Sycophantic Consensus**

[![offline](https://github.com/Atik203/trustcal/actions/workflows/offline.yml/badge.svg?branch=main)](https://github.com/Atik203/trustcal/actions/workflows/offline.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Python 3.10+](https://img.shields.io/badge/python-3.10%2B-blue.svg)](trustcal/pyproject.toml)
[![Node 22](https://img.shields.io/badge/node-22-339933.svg)](frontend/package.json)
[![Status: P0 released](https://img.shields.io/badge/status-P0%20released-brightgreen.svg)](trustcal/IMPLEMENTATION_STATUS.md)

FYDP II research project by **Group 6 · Team Phantom Devs**, Department of Computer Science and Engineering, United International University. Live site: **[fydp-ideas.vercel.app](https://fydp-ideas.vercel.app)**.

TrustCal studies a failure mode in multi-agent LLM debate: a confident wrong majority can pressure a correct minority agent into abandoning its answer. The project re-weights each agent's influence _during_ the debate using an evidence-grounded trust score derived from retrieved external evidence, rather than a majority vote. The repository contains the implementation, the pre-registered evaluation plan, the controlled-benchmark design, the full thesis report, the journal manuscript, and the presentation site.

> **No efficacy results are claimed.** P0 is engineering readiness. The 24-row Core matrix and the 32-row Full matrix have not been run.

## Research question

Does evidence-grounded trust reduce sycophantic collapse relative to a matched majority-vote control, and where do verifier accuracy and evidence redundancy place its boundary?

The framework runs three heterogeneous agents for three rounds. Each response is decomposed into atomic claims, each claim is routed to a domain-specific source pair, a verifier assigns supported, contradicted, or unverifiable, and a bounded trust vector is updated through logit accumulation, one softmax, and a simplex projection. The final answer is a trust-weighted plurality.

## Repository map

| Path | Contents |
| --- | --- |
| [`frontend/`](frontend/) | React 19 + TypeScript + Vite 8 site for the proposal, roadmap, papers, and defence decks |
| [`trustcal/`](trustcal/) | Python pipeline: vLLM serving, debate loop, retrieval, verifier, trust operator, evaluation, runner |
| [`FYDP_Summer/`](FYDP_Summer/) | Full project report ([`fydp.pdf`](FYDP_Summer/fydp.pdf), 69 pp) |
| [`Papev_Summer26_6/`](Papev_Summer26_6/) | Journal-style manuscript ([`cas-sc-template.pdf`](Papev_Summer26_6/cas-sc-template.pdf), 19 pp) |
| [`PRE_REGISTRATION.md`](PRE_REGISTRATION.md) | Endpoints, hypotheses, exclusions, stopping rules, and the v1.3 stack amendment |
| [`literature_review/`](literature_review/) | Paper matrix, gap map, and per-paper reviews |
| [`experiments/`](experiments/) | Run reports, gate artifacts, calibration protocols, and `next/WP-*.md` records |
| [`docs/`](docs/) | Research blueprint, glossary, consistency audit, defence notes, and figure sources |
| [`roadmap.md`](roadmap.md) | Phase-by-phase execution plan and compute budget |
| [`AGENTS.md`](AGENTS.md) | Canonical instructions for human and AI contributors |

## Current status

Snapshot: **9 November 2026**.

| Area | State |
| --- | --- |
| P0 engineering | Released: **13/13** gate checks, **615** tests, Gate 0 completed **10/10** vanilla debates with **90/90** non-empty positions |
| Core matrix | 24-row config ready (`B3`, `B4-matched`, `B8-no-trust`, `B8` × 3 datasets × 2 seeds); **not run** |
| Full matrix | 32-row gold-evidence default / 36-row gold-answer alternate, with placebo and oracle controls; **not run** |
| FP8 precision | 3-row GPQA replication configured; the 96 GB hardware smoke has **not run** |
| Verifier audit | 180 SciFact pairs prepared; human labels pending |
| EG-SSS calibration | 24 items pending authoring and adjudication |
| Pre-registration | v1.3 draft; team sign-off pending |
| Manuscripts | 69-page report and 19-page journal; 0 errors and 0 undefined citations |

The engineering evidence is real. The efficacy claim is not yet tested. See [`trustcal/IMPLEMENTATION_STATUS.md`](trustcal/IMPLEMENTATION_STATUS.md) for the per-component map and [`roadmap.md`](roadmap.md) for the execution order.

## Quick start

### Website

```bash
cd frontend
npm ci
npm run dev
```

Production checks:

```bash
npm run build
npm run lint
```

The build type-checks, bundles, and prerenders all nine routes. The site deploys from `frontend/` with Vercel.

### Pipeline: GPU-free checks

```bash
cd trustcal
python -m venv .venv
# Windows: .venv\Scripts\activate
# Linux/macOS: source .venv/bin/activate
pip install pytest numpy pyyaml openai python-dotenv requests httpx
pytest -q
python scripts/p0_gate.py
```

The GPU-free suite does not need vLLM, model weights, or a GPU. It covers the trust math, parser, runner, injection, mock end-to-end path, matrix configs, stack budgets, and record schema.

Dry-run the experiment plans and check the serving budgets:

```bash
python scripts/run_matrix.py --config configs/experiments_fourbit.yaml --dry-run
python scripts/run_matrix.py --config configs/experiments_full.yaml --dry-run
python scripts/run_matrix.py --config configs/experiments_precision.yaml --dry-run
python scripts/check_stack.py --phase fourbit
python scripts/check_stack.py --phase final
```

### Pipeline: GPU serving

Serving is Linux + NVIDIA only and is the only path that touches a GPU:

```bash
cd trustcal
HF_TOKEN=hf_... [VENV=1] bash setup.sh
python scripts/verify_env.py --check-servers
python scripts/smoke_test.py --phase fourbit --limit 5
```

Read [`trustcal/AGENTS.md`](trustcal/AGENTS.md) before launching a paid instance. The 4-bit matrix stack is 53.26 GB on an 80 GB A100; the FP8 precision stack is 73.68 GB on a 96 GB card. Never expose the vLLM ports publicly without authentication and a tunnel or firewall.

### Report and journal

```bash
cd FYDP_Summer
pdflatex -output-directory=out -interaction=nonstopmode -halt-on-error fydp.tex
bibtex out/fydp
pdflatex -output-directory=out -interaction=nonstopmode -halt-on-error fydp.tex
pdflatex -output-directory=out -interaction=nonstopmode -halt-on-error fydp.tex
```

The journal uses the same sequence with `Papev_Summer26_6/cas-sc-template.tex`. Compiled PDFs are committed for review.

## Evaluation design

| Layer | Design |
| --- | --- |
| Core matrix | 4 conditions × 3 datasets × 2 seeds = **24 runs** |
| Full matrix | **32 rows** with the gold-evidence oracle on EG-SSS; **36 rows** with the gold-answer alternate |
| Primary datasets | GPQA-Main and MMLU-Pro; HLE is a ceiling control |
| Primary endpoint | Final-answer accuracy on pressure-eligible items |
| Co-primary endpoint | Correct-minority retention (CMR) |
| Analysis | Paired question-level tests, two seeds, pre-registered non-inferiority and minimum detectable difference |

The full endpoint set, exclusions, and stopping rules are in [`PRE_REGISTRATION.md`](PRE_REGISTRATION.md). The Core and Full configs are in [`trustcal/configs/`](trustcal/configs/).

## Citation

If you use the code, the benchmark design, or the report, cite the repository:

```bibtex
@misc{trustcal2026,
  author       = {Rahaman, Md. Atikur and Hasan, Rakibul and Nayeem, Md. Salman Rohoman
                  and Paul, Pratay and Himel, Yousuf Kamal and Limu, Mst. Farjana Akter
                  and Huda, Mohammad Nurul},
  title        = {The Boundaries of Evidence-Grounded Trust in Multi-Agent Scientific Debate,
                  with a Controlled Benchmark for Sycophantic Consensus},
  year         = {2026},
  version      = {0.2.0},
  howpublished = {\url{https://github.com/Atik203/trustcal}},
  note         = {FYDP II, United International University}
}
```

GitHub also reads [`CITATION.cff`](CITATION.cff); a BibTeX file is available at [`CITATION.bib`](CITATION.bib).

## License

The software in this repository is released under the [MIT License](LICENSE). The report and journal manuscripts are scholarly works by the authors; please cite them rather than redistribute modified versions. Model weights, datasets, and third-party APIs keep their own licenses and terms.

## Security

See [`SECURITY.md`](SECURITY.md). Never commit `.env`, `HF_TOKEN`, `OPENAI_API_KEY`, retrieval keys, model caches, or `results/`. vLLM endpoints have no authentication by default; bind them to loopback or reach them through an SSH tunnel.

## Team

| Member | Role |
| --- | --- |
| Md. Atikur Rahaman | Architecture, trust mechanism, integration |
| Rakibul Hasan | Vanilla MAD reproduction, injection protocol |
| Md. Salman Rohoman Nayeem | Claim decomposition, claim-domain retrieval |
| Pratay Paul | Evaluation harness, endpoints, statistics |
| Yousuf Kamal Himel | Runner, baseline registry, serving |
| Mst. Farjana Akter Limu | Evidence APIs, records, manifest, result packages |

Supervisor: **Mohammad Nurul Huda, Ph.D.**, Professor, Department of Computer Science and Engineering, United International University.
