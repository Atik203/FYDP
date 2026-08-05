# Project Structure — Runtime Implementation

Reference layout for the Python codebase that implements the debate pipeline described in `docs/blueprint.md`. This is the repo you build inside `/workspace` on the RunPod pod (RTX A6000 48GB, Dev phase) and push to GitHub; see "Pod workflow" at the bottom for how it interacts with the rented GPU.

The rule of thumb: **vLLM owns the GPU, this repo owns everything else.** The only GPU-touching file is `scripts/serve.sh`. Everything else is plain Python talking to the three vLLM servers over their OpenAI-compatible APIs.

---

## Top-level layout

```
fydp/
├── setup.sh                      # one-command pod bootstrap (see below)
├── requirements.txt              # pip deps for the pipeline client
├── pyproject.toml                # package metadata; src-layout
├── .env.example                  # API keys (Semantic Scholar, etc.) — .env is gitignored
├── configs/
│   ├── models.yaml               # THE two-phase swap: agent → model id, port, quant
│   └── datasets.yaml             # eval datasets, split, sample caps
├── src/fydp/
│   ├── inference/                # thin OpenAI-compatible client for vLLM
│   ├── agents/                   # per-agent prompt templates + response parsing
│   ├── retrieval/                # PubMed / ArXiv / Semantic Scholar + reranker
│   ├── trust/                    # trust math + weighted aggregation (pure functions)
│   ├── orchestrator/             # LangGraph state machine (rounds, injection, K=3)
│   └── eval/                     # harness: metrics, baselines B1–B9, dataset loaders
├── scripts/
│   ├── serve.sh                  # starts 3 vLLM instances (ports 8000–8002)
│   ├── run_ablation.py           # runs a named experiment config
│   └── smoke_test.py             # 20-question model-swap gate (§13 step 11)
└── results/                      # gitignored; one folder per experiment run
```

## What each directory does

**`configs/models.yaml`** — the only file that changes between Dev and Final phases. Maps each agent slot to a Hugging Face model id and a port. Dev→Final swap = edit this file, nothing else:

```yaml
agents:
  - { role: "agent1", model: "Qwen/Qwen3.5-9B",            port: 8000, quant: "q4" }
  - { role: "agent2", model: "google/gemma-4-12B",          port: 8001, quant: "q4" }
  - { role: "agent3", model: "mistralai/Ministral-3-14B-Instruct-2512", port: 8002, quant: "fp8" }
rounds: 3
```

**`src/fydp/inference/`** — one small wrapper over the OpenAI SDK (`base_url="http://localhost:<port>/v1"`). No GPU code lives here; it just sends chat completions and returns text. This is the only module that knows the port numbering from `models.yaml`.

**`src/fydp/agents/`** — the *personas*. Each agent is the same inference client with a different prompt template (structured CoT + `<claim id="cX">` tagging per blueprint §5.5). Includes the response parser with the fallback regex/LLM extraction for unparseable output. Agent 0 (confidence gate) lives here too — it's a prompt, not a separate service.

**`src/fydp/retrieval/`** — source-partitioned RAG: three API clients (PubMed, ArXiv, Semantic Scholar), the cross-encoder reranker (`ms-marco-MiniLM`), and the per-claim verdict logic (supported / contradicted / unverifiable). Unverifiable ⇒ abstain, per blueprint. Results cached on disk so re-runs don't hit rate limits.

**`src/fydp/trust/`** — the core contribution, kept as pure functions with no I/O: the update rule (softmax → clamp → renormalize, in that exact operator order), the boundedness unit test (thousands of synthetic sequences, Tᵢ never leaves [0.1, 0.9]), and the final aggregation (argmax over Σ Tᵢ·positionᵢ). Unit-testable without any models running.

**`src/fydp/orchestrator/`** — LangGraph state machine: round sequencing, the t=1→2 injection point, the K=3 round cap, per-agent retry cap. The only module that glues retrieval + trust + agents together; it writes the full trust trajectory to `results/` after every debate (load-bearing for Propositions 2–3 and ECR calibration, not optional logging).

**`src/fydp/eval/`** — the harness: dataset loaders (GPQA slice, etc. per §8), the CCR/MPR/ECR metrics, and the baselines (B1–B4 trivial reuses, B5 self-consistency, B6 MoA, B7 Gemini oracle, B9 iMAD reimplementation). Each baseline is a runnable config, not a fork of the pipeline.

**`scripts/serve.sh`** — launches three `vllm serve` processes, one per model in `models.yaml`, each on its own port, with `--gpu-memory-utilization` split so the trio shares the card (Dev trio ≈ 28GB Q4/FP8 on 48GB; split per-instance ~0.30). `--enforce-eager` to avoid memory spikes when sharing.

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

1. `setup.sh` on a fresh pod: `git clone` the repo, `pip install -r requirements.txt`, set `HF_HOME=/workspace/.cache`, pre-download the three Dev models, then run `serve.sh` in the background.
2. Work via SSH/VS Code Remote on `/workspace`. Code and results live on the persistent volume; models cached there too (`HF_HOME`), so restarts cost only `git pull`.
3. The persistent volume keeps the repo, `.cache`, and `results/`; GitHub is the safety net (spot pods get reclaimed). Terminate-safe: nothing is lost except the container disk (OS + vLLM install, rebuilt by `setup.sh` in ~15 min).

## Correspondence with the blueprint

| Blueprint section | Lives in |
| --- | --- |
| §5.2 confidence gate | `src/fydp/agents/gate` |
| §5.3 agents + claim tagging | `src/fydp/agents/` |
| §5.5 source-partitioned retrieval | `src/fydp/retrieval/` |
| §5.6 trust update (Eq. 1–3) | `src/fydp/trust/` |
| §5.7 aggregation (Eq. 4) | `src/fydp/trust/aggregation.py` |
| §5.8 deliberation protocol | `src/fydp/orchestrator/` |
| §7 two-phase models | `configs/models.yaml` |
| §8 datasets | `configs/datasets.yaml` + `src/fydp/eval/datasets/` |
| §9–10 metrics (CCR/MPR/ECR) | `src/fydp/eval/metrics/` |
| §13 build order | `scripts/` + milestone gates in this repo's roadmap |
