# 09 — P0 Interfaces, Record Schema, and File Leases

**Status:** frozen for P0. Every P0 work package codes against this file. If a change is needed, change this file first and note it in the commit.

---

## 1. Record schema v2

Every arm (B1–B10, pilot, injection) emits one JSON object per debate with at least these keys:

| Key | Type | Meaning |
|---|---|---|
| `question_id` | string | Stable id, e.g. `gpqa_main-0042` |
| `arm` | string | `B1` … `B10`, `pilot`, `injection` |
| `seed` | int | Run seed |
| `question` | string | Question text |
| `gold` | string | **Gold answer text, never a letter** |
| `options_raw` | list[str] \| null | Dataset-native option order |
| `options` | list[str] \| null | Rendered order the agent saw |
| `option_permutation` | list[int] \| null | Original indices in rendered order |
| `gold_letter_rendered` | string \| null | Rendered letter for the gold option |
| `raw_answer` | string | Raw model output |
| `parsed_answer` | string | Answer span after parsing |
| `parser_version` | string | `p0-1` |
| `final_answer` | string | Actual aggregated answer |
| `final_answer_correct` | bool | Scored against `gold` |
| `final_answer_source` | string | `majority` \| `weighted` \| `single` \| `oracle` |
| `rounds` | list[dict] | One entry per round: `answers`, `inconclusive` |
| `transcript` | list[dict] | Raw positions per round |
| `evidence_introduced` | bool | True iff retrieval returned ≥1 passage shown to an agent |
| `injection` | dict \| null | `consensus`, `targets`, `consensus_source`, `delivered` |
| `trust_trajectory` | list[list[float]] \| null | Per-round trust vectors |
| `trust_for_positions` | list[float] \| null | Trust used for final aggregation |
| `trust_status` | list[str] \| null | `updated` / `abstained_unanimous` / `abstained_no_evidence` |
| `verdicts` | list[dict] | Per claim: `agent`, `round`, `claim`, `passages`, `scores`, `verdict`, `verifier` |
| `manifest_hash` | string \| null | Hash of `run_manifest.json` |

**Invariants:**
- `gold` is always text. Letters exist only in `gold_letter_rendered` and parsed answers.
- `options` is the rendered list; `options_raw` is the dataset order; `option_permutation` maps rendered → original.
- `final_answer` is the actual aggregation output. It is never recomputed inside metrics.
- `evidence_introduced` has no default; the runner computes it.

---

## 2. Function signatures

```python
# eval/options.py
@dataclass(frozen=True)
class RenderedOptions:
    options: list[str]
    permutation: list[int]
    gold_letter: str | None
    block: str

def build_options(question: dict, seed: int, question_id: str) -> RenderedOptions: ...

# eval/answers.py
@dataclass(frozen=True)
class Score:
    correct: bool
    parsed: str
    kind: str  # boxed | labelled | letter | numeric | text

def score_answer(position: str, gold_text: str, rendered: RenderedOptions | None = None) -> Score: ...

# retrieval/verifier.py
@dataclass(frozen=True)
class Verdict:
    label: str  # supported | contradicted | unverifiable
    scores: list[float]
    evidence_ids: list[str]
    verifier: str

class Verifier(Protocol):
    def verdict(self, claim: str, passages: list[str]) -> Verdict: ...

# trust/update.py
def update_trust(
    scores: np.ndarray,
    support: np.ndarray,
    harm: np.ndarray,
    n_claims: np.ndarray,
    *,
    alpha: float = 0.5,
    beta: float = 0.3,
    floor: float = 0.1,
    ceiling: float = 0.9,
) -> np.ndarray: ...

# Trust bound (P0-5): min >= floor - 1e-9, sum == 1 +/- 1e-9,
# max <= max(ceiling, 1/N) + 1e-9. n_claims=None is the legacy raw-count
# path; new code must pass per-agent claim counts.

# eval/metrics.py
def final_answer(aggregation: dict) -> str: ...
```

---

## 3. File leases

Only the lease holder edits the file. Everyone else files a 3-line request in their work-package note; the lease holder applies it in the owning commit.

| File | Lease holder | Notes |
|---|---|---|
| `trustcal/src/trustcal/runner.py` | **B (wk2–4)** | A may edit option fields in wk1 only; E hands over endpoint wiring; B applies |
| `trustcal/src/trustcal/orchestrator/debate.py` | **time-sliced** | A wk1 (options), C wk2 (trust timing), D wk3 (verifier/message loop); no parallel edits |
| `trustcal/src/trustcal/agents/prompts.py` | **A** | Injection text + trust-line variant are A's |
| `trustcal/src/trustcal/eval/metrics.py` | **E** | No one else edits; records live in `eval/records.py` |
| `trustcal/configs/*.yaml` + `trustcal/scripts/run_matrix.py` | **F** | Others submit config deltas |
| `trustcal/src/trustcal/eval/datasets.py`, `retrieval/sources.py`, `retrieval/pipeline.py` | **F** | Option permutation lives in `eval/options.py`, not here |
| `trustcal/src/trustcal/trust/*` | **C** | Signature changes coordinated with B/D |
| `trustcal/src/trustcal/retrieval/verifier.py` | **D** | New module |
| `trustcal/scripts/p0_gate.py` | **E** | New script |

**Conflict rule:** if two work packages need the same file in the same week, the lease holder applies the other's hunk. Do not merge parallel edits to a leased file.

---

## 4. Evidence convention

- One evidence file per work package: `experiments/p0/WP-NN.md`.
- Heavy artifacts go under `trustcal/results/` (gitignored), referenced by path + sha256.
- Every acceptance command and its exact output goes in the evidence file.
- Commit message: `type(p0-N): imperative summary`.

---

## 5. Push and merge rules

- Slice branch: `p0/wp-<id>`; worktree: `E:\FYDP-p0-<letter>`. Slice branches are temporary and deleted after merge.
- Push the slice branch after every green checkpoint.
- Integrator merges to `feat/p0-hardening` in a fixed daily window (`--no-ff`). `feat/p0-hardening` is temporary; after the 13/13 gate it merges into `dev` and is deleted.
- Long-lived branches: `dev` (development/integration) and `main` (release trunk; the web frontend deploys from `main`). Neither takes P0 work directly.
- Final landing sequence: `feat/p0-hardening` → `dev` → `main`, tagged `p0-gate` and `p0-release`.
- `Phase-1-dev` and `Phase-1-main` are retired tags (`phase-1-dev`, `phase-1-main-untested`), not branches. Do not recreate them.
- No force-push.
- No commit mixes `docs/**` with `trustcal/**` or `frontend/**`.

---

## 6. P0 gate

`scripts/p0_gate.py` encodes the 13 checks. Do not run the pilot or matrix until it exits 0 on `feat/p0-hardening`.
