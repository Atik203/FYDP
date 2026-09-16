# Project Structure — Runtime Implementation

Reference layout for the Python codebase that implements the debate pipeline described in `docs/blueprint.md`. This is the repo you build on the rented GPU instance (RTX A6000 48GB, Dev phase — RunPod or Thunder Compute) and push to GitHub; see "Pod workflow" at the bottom for how it interacts with the rented GPU.

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
│   └── datasets.yaml             # eval datasets, split, sample caps
├── src/trustcal/
│   ├── inference/                # thin OpenAI-compatible client for vLLM
│   ├── agents/                   # per-agent prompt templates + response parsing
│   ├── retrieval/                # PubMed / ArXiv / Semantic Scholar + reranker
│   ├── trust/                    # trust math + weighted aggregation (pure functions)
│   ├── orchestrator/             # LangGraph state machine (rounds, injection, K=3)
│   └── eval/                     # harness: metrics, baselines B1–B9, dataset loaders
├── scripts/
│   ├── serve.sh                  # starts 3 vLLM instances (ports 8000–8002)
│   ├── run_experiment.py         # runs a named experiment arm (B1/B3/injection)
│   ├── preflight.py              # cost-safety checks before paid sessions
│   ├── mock_vllm.py              # mock OpenAI-compatible servers (GPU-free tests)
│   ├── annotate.py               # annotation sheets + Cohen's κ
│   └── smoke_test.py             # 20-question model-swap gate (§13 step 11)
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

**`src/trustcal/retrieval/`** — source-partitioned RAG: three API clients (PubMed, ArXiv, Semantic Scholar), the cross-encoder reranker (`ms-marco-MiniLM`), and the per-claim verdict logic (supported / contradicted / unverifiable). Unverifiable ⇒ abstain, per blueprint. Results cached on disk so re-runs don't hit rate limits.

**`src/trustcal/trust/`** — the core contribution, kept as pure functions with no I/O: the update rule (softmax → clamp → renormalize, in that exact operator order), the boundedness unit test (thousands of synthetic sequences, Tᵢ never leaves [0.1, 0.9]), and the final aggregation (argmax over Σ Tᵢ·positionᵢ). Unit-testable without any models running.

**`src/trustcal/orchestrator/`** — LangGraph state machine: round sequencing, the t=1→2 injection point, the K=3 round cap, per-agent retry cap. The only module that glues retrieval + trust + agents together; it writes the full trust trajectory to `results/` after every debate (load-bearing for Propositions 2–3 and ECR calibration, not optional logging).

**`src/trustcal/eval/`** — the harness: dataset loaders (GPQA slice, etc. per §8), the CCR/MPR/ECR metrics, and the baselines (B1–B4 trivial reuses, B5 self-consistency, B6 MoA, B7 Gemini oracle, B9 iMAD reimplementation). Each baseline is a runnable config, not a fork of the pipeline.

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

1. `setup.sh` on a fresh instance: `git clone` the repo, install pinned deps + nightly vLLM, pre-download the three quantized Dev checkpoints, then start `serve.sh` in the background. On Thunder Compute add `VENV=1` (keeps the preinstalled CUDA 13 / PyTorch 2.9 environment untouched).
2. RunPod: work via SSH/VS Code Remote in `/workspace`; the 100GB network volume keeps repo, `HF_HOME` cache, and `results/` across stop/start. Thunder Compute: everything lives in `$HOME` on the persistent disk; there is no stop — snapshot, delete the instance, restore later (~8 min per 100GB).
3. GitHub is the safety net (spot pods get reclaimed; Thunder snapshots have no durability guarantee). Push code; copy `results/` out before deleting an instance.

## Correspondence with the blueprint

| Blueprint section | Lives in |
| --- | --- |
| §5.2 confidence gate | `src/trustcal/agents/gate` |
| §5.3 agents + claim tagging | `src/trustcal/agents/` |
| §5.5 source-partitioned retrieval | `src/trustcal/retrieval/` |
| §5.6 trust update (Eq. 1–3) | `src/trustcal/trust/` |
| §5.7 aggregation (Eq. 4) | `src/trustcal/trust/aggregation.py` |
| §5.8 deliberation protocol | `src/trustcal/orchestrator/` |
| §7 two-phase models | `configs/models.yaml` |
| §8 datasets | `configs/datasets.yaml` + `src/trustcal/eval/datasets/` |
| §9–10 metrics (CCR/MPR/ECR) | `src/trustcal/eval/metrics/` |
| §13 build order | `scripts/` + milestone gates in this repo's roadmap |
