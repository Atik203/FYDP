# Project Structure — Runtime Implementation

Reference layout for the Python codebase that implements the debate pipeline described in `docs/blueprint.md`. This is the repo you build on a rented Vast.ai GPU instance (RTX A6000 48GB for Dev; RTX PRO 6000 96GB for Final) and push to GitHub; see "Pod workflow" at the bottom for how it interacts with the rented GPU. Execution order is in `roadmap.md`; per-component status is in `trustcal/IMPLEMENTATION_STATUS.md`.

> **Status note (2026-11-09):** this is the reference layout, not a status report. The current implementation uses a plain-Python debate runner, claim-domain retrieval routing, and the P0 trust operator (logit accumulation → one softmax → floor/ceiling simplex projection). `trustcal/IMPLEMENTATION_STATUS.md` is the status source.

The rule of thumb: **vLLM owns the GPU, this repo owns everything else.** The only GPU-touching file is `scripts/serve.sh`. Everything else is plain Python talking to the three vLLM servers over their OpenAI-compatible APIs.

---

## Top-level layout

```
trustcal/
├── setup.sh                      # one-command pod bootstrap (see below)
├── requirements.txt              # pip deps for the pipeline client
├── pyproject.toml                # package metadata; src-layout
├── .env.example                  # API keys (Semantic Scholar, etc.) — .env is gitignored
├── configs/
│   ├── models.yaml               # THE two-phase swap: agent → model id, port, quant
│   ├── datasets.yaml             # eval datasets, split, sample caps
│   ├── experiments.yaml          # Core matrix: 4 conditions × 3 datasets × 2 seeds
│   └── phase.yaml                # dev | final phase selector
├── src/trustcal/
│   ├── inference/                # thin OpenAI-compatible client for vLLM
│   ├── agents/                   # per-agent prompt templates + response parsing
│   ├── retrieval/                # PubMed / ArXiv / Semantic Scholar + reranker
│   ├── trust/                    # trust math + weighted aggregation (pure functions)
│   ├── orchestrator/             # debate state machine (rounds, injection, K=3)
│   └── eval/                     # harness: metrics, baselines B1–B10, dataset loaders
├── scripts/
│   ├── serve.sh                  # starts 3 vLLM instances (ports 8000–8002)
│   ├── run_experiment.py         # runs one named arm (B1–B10, pilot, injection)
│   ├── run_matrix.py             # executes the Core/Full matrix from configs
│   ├── p0_gate.py                # 13-check P0 engineering gate
│   ├── verify_env.py             # environment + server check
│   ├── preflight.py              # cost-safety checks before paid sessions
│   ├── check_stack.py            # offline Final-stack weight/VRAM budget check
│   ├── verifier_audit.py         # 150–200 claim–passage audit harness
│   ├── mock_vllm.py              # mock OpenAI-compatible servers (GPU-free tests)
│   ├── annotate.py               # annotation sheets + Cohen's κ
│   └── smoke_test.py             # 20-question Final-stack smoke gate
└── results/                      # gitignored; one folder per experiment run
```

## What each directory does

**`configs/models.yaml`** — the only file that changes between Dev and Final phases. Maps each agent slot to a servable checkpoint and a port; serve flags are generated from it (`scripts/gen_serve_cmds.py`), so the Dev→Final swap = edit this file, nothing else:

```yaml
agents:
  - { role: "agent1", model: "QuantTrio/Qwen3.5-9B-AWQ",               port: 8000, quant: "awq_marlin",         gpu_memory_utilization: 0.28 }
  - { role: "agent2", model: "google/gemma-4-12B-it-qat-w4a16-ct",     port: 8001, quant: "compressed-tensors", gpu_memory_utilization: 0.26 }
  - { role: "agent3", model: "cyankiwi/Ministral-3-14B-Instruct-2512-AWQ-4bit", port: 8002, quant: "auto",  gpu_memory_utilization: 0.36 }
rounds: 3
```

Quantized variants of the roadmap's model trio: the official Ministral FP8 checkpoint cannot run on Ampere (vLLM W8A8 sm80 kernel), so the same model is used in 4-bit AWQ. See `experiments/gate0/README.md` §4.

**`src/trustcal/inference/`** — one small wrapper over the OpenAI SDK (`base_url="http://127.0.0.1:<port>/v1"` — never `localhost`, Windows resolves it to IPv6 first and pays ~2s per request on the fallback). No GPU code lives here; it just sends chat completions and returns text, retrying transient failures only. This is the only module that knows the port numbering from `models.yaml`.

**`src/trustcal/agents/`** — the *personas*. Each agent is the same inference client with a different prompt template (structured CoT + `<claim id="cX">` tagging per blueprint §5.5). Includes the response parser with the fallback regex/LLM extraction for unparseable output. Agent 0 (confidence gate) lives here too — it's a prompt, not a separate service.

**`src/trustcal/retrieval/`** — claim-domain routed RAG: three API clients (PubMed, ArXiv, Semantic Scholar), an optional cross-encoder reranker (`ms-marco-MiniLM`), and the per-claim verdict interface (supported / contradicted / unverifiable / contested). Unverifiable ⇒ abstain, per blueprint. Results cached on disk so re-runs don't hit rate limits. The default scorer is lexical; the NLI/LLM-judge interface exists, but the human audit is pending.

**`src/trustcal/trust/`** — the core contribution, kept as pure functions with no I/O: the update rule (logit accumulation → one softmax → floor/ceiling simplex projection, in that exact operator order), the boundedness unit test (30,000 synthetic draws for N=1,3,5; min ≥ floor, sum = 1, max ≤ max(ceiling, 1/N)), and the final aggregation (argmax over Σ Tᵢ·positionᵢ). Unit-testable without any models running.

**`src/trustcal/orchestrator/`** — plain-Python debate state machine (the planned LangGraph port is not implemented): round sequencing, the t=1→2 injection point, the K=3 round cap, per-agent retry cap. The only module that glues retrieval + trust + agents together; it writes the full trust trajectory to `results/` after every debate (load-bearing for Propositions 2–3 and trust calibration, not optional logging).

**`src/trustcal/eval/`** — the harness: dataset loaders (GPQA-Main, MMLU-Pro, HLE, plus appendix-only BrokenMath/BrokenArXiv), the accuracy/CMR/ARR/trust-AUROC/Brier endpoints (ECR is deprecated), and the B1–B10 baseline registry (B1–B4 trivial reuses, B5 self-consistency, B6 MoA, B7 optional external-answer ceiling (GPT-6 Luna), B8/B8-no-trust, B9 iMAD, B10 ConsensAgent). B8-placebo and B8-oracle are pending WP-18. Each baseline is a runnable config, not a fork of the pipeline.

**`scripts/serve.sh`** — launches three `vllm serve` processes, one per model in `models.yaml` (commands generated, never hand-edited), each on its own port with the per-instance `gpu_memory_utilization` from the config (current split 0.28/0.26/0.36, ~41GB of 45GB usable). Servers start **sequentially** with a readiness gate — concurrent startup makes vLLM's memory profiling race and report phantom OOM. `--enforce-eager` avoids memory spikes when sharing.

**`results/`** — per-run folder: `{experiment}/{dataset}/{seed}/` containing the debate transcript, per-claim verdicts, trust trajectories (JSON), and metric outputs. Gitignored; uploaded to GitHub only if you want them versioned (they can be large).

## File-what-file-owns, at a glance

| File | Owns | Doesn't own |
| --- | --- | --- |
| `models.yaml` | model↔port↔quant mapping | prompt content, trust math |
| `inference/*` | HTTP calls to vLLM | which models, any logic |
| `agents/*` | prompts + parsing | rounds, retrieval |
| `retrieval/*` | evidence fetching + verdicts | trust updates |
| `trust/*` | score math (pure) | I/O, prompts |
| `orchestrator/*` | state machine, injection | metrics, model choice |
| `eval/*` | datasets, baselines, metrics | orchestration internals |

## Pod workflow

1. `setup.sh` on a fresh Vast.ai instance: `git clone` the repo, install pinned deps + vLLM, pre-download the three quantized checkpoints, then start `serve.sh` in the background. The Final path is `PHASE=final bash setup.sh` on the 96 GB RTX PRO 6000.
2. Vast.ai is the primary provider: work via SSH/VS Code Remote in `/workspace`; persist the repo, `HF_HOME` cache, and `results/` on a Vast.ai volume so a stop/start does not re-download weights.
3. GitHub is the safety net (spot instances get reclaimed). Push code; copy `results/` out before destroying an instance. Run `check_stack.py`, `preflight.py`, and the smoke test before any paid matrix session.

## Correspondence with the blueprint

| Blueprint section | Lives in |
| --- | --- |
| §5.2 confidence gate | `src/trustcal/agents/prompts.py` |
| §5.3 agents + claim tagging | `src/trustcal/agents/` |
| §5.5 claim-domain routed retrieval | `src/trustcal/retrieval/` |
| §5.6 trust update (Eq. 1–3) | `src/trustcal/trust/` |
| §5.7 aggregation (Eq. 4) | `src/trustcal/trust/aggregation.py` |
| §5.8 deliberation protocol | `src/trustcal/orchestrator/` |
| §7 two-phase models | `configs/models.yaml` |
| §8 datasets | `configs/datasets.yaml` + `src/trustcal/eval/datasets.py` |
| §9–10 metrics (accuracy/CMR/AUROC/Brier; ECR deprecated) | `src/trustcal/eval/metrics.py`, `src/trustcal/eval/endpoints.py` |
| §13 build order | `scripts/` + milestone gates in this repo's roadmap |
