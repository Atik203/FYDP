# WP-03b — P0-5 wave 2: trust from final positions, real claim counts, telemetry

**Owner:** C · **Branch:** `p0/wp-C2` · **Worktree:** `E:\FYDP-p0-C`
**Base:** `origin/feat/p0-hardening` @ `115513b` (WP-01/02 merged).
**Lease used:** `orchestrator/debate.py` (C's wave-2 time slice) + new/updated tests.
No edits to `runner.py`, `agents/prompts.py`, `retrieval/verifier.py`, or `eval/metrics.py`.

## 1. What was wrong

`debate.py` updated trust at the **start** of round `r` from the positions of round
`r-1`, then aggregated the final positions with that stale vector. The weighted vote
therefore used trust one round old. It also passed raw `support`/`harm` counts to
`update_trust` (verbosity bias) and never recorded why a round updated or abstained.

## 2. What changed

### Timing

```
round 1 positions P1
for r = 2..R:
    evidence(P_{r-1}) -> trust update from P_{r-1}   # informs round r
    prompts use that trust -> P_r
after the loop:
    evidence(P_R) -> trust update from P_R            # NEW closing pass
trust_for_positions = trust.scores                    # exactly trajectory[-1]
aggregate(trust_for_positions, P_R)
```

The closing pass is the only new retrieval work: one extra claim→verdict batch per
trusted debate, labelled `round = R+1` in `evidence` / `verdicts`. Everything the
agents saw is unchanged; the pre-final updates, prompts, and evidence blocks are the
same as before.

### Claim counts

- `_evidence_for` deduplicates repeated claim texts before classification
  (`dict.fromkeys(claim_texts(...))`), so `verdicts[i]` has one entry per *distinct*
  claim actually checked.
- `_trust_round` passes `n_claims = [len(labels) for labels in verdicts]` to
  `TrustState.update`, which forwards it to `update_trust`. Repeating a claim can no
  longer inflate support, harm, or the per-claim rate.
- Neutral evidence (`support = harm = 0`) hits the wave-1 identity path; trust does
  not drift toward uniform.
- `self.trust_update` (the external override hook) still receives
  `(trust, support, harm)`: it bypasses normalization by design, documented in the
  dataclass field.

### Telemetry

Result now carries `trust_for_positions` and `trust_status`, in addition to
`trust_trajectory` and `final_trust`:

| Field | Value |
|---|---|
| `trust_trajectory` | uniform start + one row per **scored round** (an abstention appends the unchanged vector), so `trajectory[k+1]` aligns with `trust_status[k]`; rows are simplex vectors with the 0.1 floor. Exposed only once a real update has happened (`null` otherwise) |
| `trust_for_positions` | `trust.scores` handed to `aggregate`, exactly the last trajectory row; `null` when no update happened |
| `trust_status` | one entry per scored round, `updated` / `abstained_unanimous` / `abstained_no_evidence`; `null` for `use_trust=False` |
| `verdicts[]` | now also logs `n_claims` next to `support`/`harm` |

`trust_status[r]` describes the trust evaluation of round `r`'s positions, i.e. the
vector used by round `r+1`; the last entry is the vector used by the final vote.
`trust_trajectory`, `trust_for_positions`, and the aggregation rule are unchanged
(other than being fed the corrected vector).

## 3. Acceptance — commands and exact output

```powershell
$env:PYTHONPATH='E:\FYDP-p0-C\trustcal\src'
cd E:\FYDP-p0-C\trustcal
& 'E:\FYDP\trustcal\.venv\Scripts\python.exe' -m pytest -q --ignore=.venv
```

```
........................................................................ [ 76%]
........................................................................ [ 91%]
......................................                                   [100%]
470 passed in 40.62s
```

Baseline on the merged base: **457 passed**. Net **+13 tests, 0 weakened**
(9 in `test_debate_trust.py`, 4 new in `test_b8_trust.py`).

Targeted:

```powershell
& 'E:\FYDP\trustcal\.venv\Scripts\python.exe' -m pytest src/trustcal/orchestrator/test_debate_trust.py src/trustcal/test_b8_trust.py -q
```

```
.................                                                        [100%]
17 passed in 1.98s
```

### New tests

| Test | Asserts |
|---|---|
| `test_trust_for_positions_is_computed_from_final_positions` | final vector = `update_trust(T1, final support/harm, n_claims)`, ≠ stale round-1 vector; equals `trajectory[-1]` and `final_trust` |
| `test_trust_status_is_updated_on_every_scored_round` | rounds `[2, 3]`; final pass scores `[beta, beta, gamma]` (`support [0,0,1]`, `harm [1,1,0]`) |
| `test_trust_status_abstains_when_panel_is_unanimous` | `["abstained_unanimous", "abstained_unanimous"]`, no trajectory |
| `test_trust_status_abstains_without_evidence` | `["abstained_no_evidence", "abstained_no_evidence"]`, no trajectory |
| `test_no_trust_arm_has_no_trust_telemetry` | all three trust fields are `null` for `use_trust=False` |
| `test_duplicate_claims_do_not_change_trust` | 8 duplicate claims give `n_claims == [1,1,1]` and an identical trajectory |
| `test_neutral_evidence_is_an_identity_not_a_reuniformization` | round-1 evidence moves trust; the round-3 neutral pass leaves it bit-identical (≤1e-12) |
| `test_abstention_appends_a_per_round_row` | one update then a unanimous round: `["updated", "abstained_unanimous"]` with a flat trajectory row, aligned with the status |
| `test_trajectory_rows_are_simplex_vectors` | `1 + rounds` rows; sum 1 ± 1e-9, min ≥ 0.1 − 1e-9, max ≤ 0.9 + 1e-9 |
| `test_mock_b8_result_is_record_ready` | mock B8 through `_make_runner`: status non-null, `trust_for_positions == trajectory[-1]`, valid rows |
| `test_debate_record_keeps_the_final_trust_vector` | `debate_record` trajectory last row = final vector; assembled schema-v2 record validates |
| `test_b8_no_trust_has_no_trust_telemetry` | B8-no-trust carries no trust fields |
| `test_final_answer_does_not_depend_on_trust_timing_side_effects` | aggregation/transcript shape unchanged |

### Probe (rules of the timing fix, 3 agents, 2 rounds)

Positions: round 1 `[alpha, beta, beta]` → round 2 `[beta, beta, gamma]`.

```
status        ['updated', 'updated']
trajectory
   [0.333333, 0.333333, 0.333333]  sum 1.0
   [0.526688, 0.236656, 0.236656]  sum 1.0   <- scored [alpha, beta, beta]
   [0.408275, 0.183450, 0.408275]  sum 1.0   <- scored [beta, beta, gamma] (final)
trust_for_positions [0.408275, 0.183450, 0.408275]
equals last    True
verdicts       [(2, [1,0,0], [0,1,1], [1,1,1]), (3, [0,0,1], [1,1,0], [1,1,1])]
majority/weighted  beta / beta
```

The old code aggregated with the middle row (0.5267 for agent 1); the new code uses
the bottom row (0.4083 for agents 1 and 3).

### Gate

```powershell
& 'E:\FYDP\trustcal\.venv\Scripts\python.exe' scripts/p0_gate.py --allow-pending
```

```
PASS     1  pytest                              41.55s
          exit 0: 470 passed in 40.36s
PASS     2  record schema                       0.07s  [WP-04 (eval/records.py)]
FAIL     3  options in prompts                   0.00s  [WP-01 (eval/options.py + prompts)]
          AGENT_REVISION_EVIDENCE seed 0: option 'alpha' appears 2 times (expected 1)
PENDING  4  parser corpus                       0.01s  [WP-02 (parser corpus)]
PASS     5  trust bound                         5.64s  [WP-03 (trust projection)]
          30,000 draws N=1,3,5; min>=0.1, sum==1 within 1e-9
PASS     6  trust neutral/verbosity             0.10s  [WP-03 (trust projection)]
          neutral identity 600 draws (max dev 0), verbosity 200 draws (max dev 0); N=1 output [1.0]
PENDING  7  B8 vs B8-no-trust                  0.00s  [WP-13 (B8-no-trust prompts)]
PENDING  8  B8+injection mock                  1.59s  [WP-09 (B8 x injection wiring)]
PASS     9  endpoint summary                    0.03s
PASS    10 datasets pinned                      0.01s  [WP-11 (dataset loaders)]
PASS    11 claim routing                        0.00s  [WP-12 (claim -> domain routing)]
PASS    12 manifest resume                      0.07s  [WP-04 (manifest + resume guard)]
PENDING  13 matrix budget                       0.01s  [WP-14 (matrix cut + pre-registration)]

summary: 8 passed, 1 failed, 4 pending, 0 error (exit 1)
```

**Check 3 fails on the base commit, before this slice.** Reproduced from a clean
`git archive 115513b`:

```
P0 gate - 1 check(s) (allow_pending=False)
FAIL     3  options in prompts                   0.20s  [WP-01 (eval/options.py + prompts)]
          AGENT_REVISION_EVIDENCE seed 0: option 'alpha' appears 2 times (expected 1)
summary: 0 passed, 1 failed, 0 pending, 0 error (exit 1)
```

Cause: `p0_gate.py` check 3 renders `AGENT_REVISION_EVIDENCE.format(..., evidence=block,
options_block=block)` — after A's P0-0 change the template renders the options block
twice (once as `{options_block}`, once as fake `{evidence}`). The harness needs a
non-option evidence string; `p0_gate.py` is E's lease, `prompts.py` is A's. Trust
checks 5 and 6 pass; check 1 (the whole 470-test suite) passes.

## 4. Handoffs and remaining raw counts

1. **B (runner.py lease) — 3-line request:** `debate_record` currently copies only
   `trust_trajectory` / `final_trust`. Add:
   ```python
   for key in ("trust_for_positions", "trust_status"):
       if result.get(key) is not None:
           record[key] = result[key]
   ```
   The debate payload and a validated schema-v2 assembly are already covered by
   `test_b8_trust_record.py`; without this copy `records.jsonl` keeps `null` for both
   fields.
2. **`runner.py::_pilot_block` still uses raw counts** (`update_trust(uniform,
   support, harm, alpha=..., beta=...)`, no `n_claims`). It is runner-owned; the
   pilot path needs `_question_verdicts` to return deduplicated claim counts.
3. **`trust_update` override hook** is the only path left in `debate.py` without
   claim normalization; no caller in the tree uses it (it is an external test hook).
4. **Cost:** trusted debates now make one extra retrieval/classification pass over
   the final positions (≤ `max_claims` claims per agent). This is the price of
   scoring the vector that actually decides the answer; record it in the compute log.
5. `evidence`/`verdicts` gain a post-debate entry at `round = rounds + 1`. Endpoints
   pick the earliest round per agent, so CCR-E is unaffected.

## 5. Commits

| SHA | Message |
|---|---|
| `339753b` | `fix(p0-5): update trust from final positions with real claim counts` |
| `9a0d49d` | `fix(p0-5): record one trust trajectory row per scored round` |
| `6ac65e0` | `docs(p0-5): add WP-03b evidence` |
| _(this update)_ | `docs(p0-5): update WP-03b evidence` |
