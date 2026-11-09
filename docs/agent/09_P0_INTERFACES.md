# 09 — P0 Interfaces, Record Schema, and File Leases (Historical Contract)

> **Historical contract — P0 interfaces v1.0, released 9 November 2026** at `p0-release` (`7f2c11f`); current HEAD `main` = `dev` = `2ae56a3`. The **record schema v2 and function signatures remain useful** for current code. The P0 worktree/landing sequence and file leases are **historical**. Active execution rules: `roadmap.md`.

**Status:** frozen for P0. Every P0 work package coded against this file. This is the historical contract; do not create P0 worktrees from it.

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

## 3. File leases (historical P0)

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

## 4. Evidence convention (historical P0)

- One evidence file per work package: `experiments/p0/WP-NN.md`.
- Heavy artifacts go under `trustcal/results/` (gitignored), referenced by path + sha256.
- Every acceptance command and its exact output goes in the evidence file.
- Commit message: `type(p0-N): imperative summary`.

---

## 5. Push and merge rules (historical P0; current rules in `roadmap.md`)

- **Current slice branch:** `next/<slice>` from `dev`, in one worktree; delete after merge. Do not recreate P0 slice branches.
- Push the slice branch after every green checkpoint.
- Integrator merges to `dev`; `dev` releases to `main` only after a gate and a clean frontend build.
- Long-lived branches: **`dev`** (development/integration) and **`main`** (release trunk; the web frontend deploys from `main`).
- **P0 landing (completed):** the temporary P0 integration branch merged to `dev`, then `main`, tagged `p0-gate` (`055a244`) and `p0-release` (`7f2c11f`). It is deleted; only `main` and `dev` remain.
- **Future gate tags:** `g2`, `g3`, `g4`, `results-freeze`, `thesis`, `paper`. No direct `main` pushes; no force-push.
- `phase-1-dev` and `phase-1-main-untested` are retired tags, not branches. Do not recreate them.
- No commit mixes `docs/**` with `trustcal/**` or `frontend/**`.

---

## 6. P0 gate (historical; passed)

`scripts/p0_gate.py` encodes the 13 checks. **The P0 gate passed 13/13 at `p0-gate` (`055a244`).** Future slices use `next/<slice>`; future gates are **`g2`, `g3`, `g4`, `results-freeze`, `thesis`, `paper`**. Do not run the pilot or matrix until **G2** passes.
