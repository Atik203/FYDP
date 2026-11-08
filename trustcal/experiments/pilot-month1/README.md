# Month-1 pilot — frozen question set

The criterion is fixed in `../../PILOT_CRITERION.md`; do not soften it after seeing numbers.

- **PASS:** trust weighting changes the aggregation winner on >= 15 of 25 questions (~60%).
- **AMBIGUOUS:** 10-14 changed; rerun seed 2 and pool. Still < 60% -> No-Go.
- **NO-GO:** < 10 changed, or >= 60% changed but toward the injected wrong consensus.
- Questions are frozen before the run: no post-hoc exclusion, no re-picking.

## Schema

`questions.json` is a JSON list; one object per question:

```json
{
  "question": "...",
  "answer": "gold answer",
  "options": ["A", "B", "C", "D"],
  "verdicts": [{"support": 0, "harm": 2}]
}
```

- `verdicts`: one row per agent, counted from the evidence side (supportive vs
  contradictory claims). Never use agent self-reported confidence.
- `evidence` can replace `verdicts`: a list of passages, or a mapping of agent
  index -> passages; the pipeline classifies them.
- `options` may be `null` for free-form questions.
- Start from `questions.template.json`; delete `_template`/`_note` in real entries.

## Fill the 25

1. Choose toy questions where the correct answer is the minority position under
   the injection protocol.
2. Two team members independently label each candidate "evidence contradicts majority".
3. Resolve disagreements before the run; record the agreed 25 in `questions.json`.
4. Freeze the file. Do not edit it after the run starts.

## Run and score (from `trustcal/`)

```bash
python scripts/run_experiment.py --arm pilot --dataset gpqa \
  --questions-file experiments/pilot-month1/questions.json --limit 25 --seed 1
python scripts/pilot_report.py --dir results/pilot/gpqa/seed1 \
  --questions-file experiments/pilot-month1/questions.json
```

The runner's `pilot` arm records the unweighted debate plus the trust-weighted
comparison in each record's `pilot` block. `pilot_report.py` exits `0` PASS,
`2` AMBIGUOUS, `1` NO-GO/no data; it rejects a question file that still
contains `_template` entries.
