"""CLI: run the experiment matrix (conditions x datasets x seeds).

    python scripts/run_matrix.py --dry-run                     # 24 Core rows, 2 seeds
    python scripts/run_matrix.py --limit 10 --datasets gpqa_main,mmlu_pro --arms B3,B8
    python scripts/run_matrix.py --config configs/experiments_fourbit.yaml --dry-run
    python scripts/run_matrix.py --phase final --out results/matrix-final
    # after WP-18 (conditional Full plan):
    python scripts/run_matrix.py --config configs/experiments_full.yaml --dry-run

The default matrix is the frozen Core plan in ``configs/experiments.yaml``:
4 conditions x 3 datasets x 2 seeds = 24 rows. After WP-18, the separate Full
plan is read with ``--config configs/experiments_full.yaml``; do not add the
six-arm target to the Core config. Each row is one ``trustcal.runner.run`` call;
successful rows are aggregated into ``summary.json`` and ``table.md`` under
``--out``. A failed row is reported but does not stop the remaining rows; the
process exits nonzero if any row failed.

P0-10: ``sample_caps.main`` is the per-condition cap the P0 gate multiplies over
every dataset, while ``dataset_caps`` sets the cap actually planned for a
dataset (HLE runs leaner). ``--limit`` overrides both.

The ``pilot`` arm needs a frozen questions file, which this matrix CLI does not
take — run it standalone with ``scripts/run_experiment.py --questions-file``.
"""

from __future__ import annotations

import argparse
import json
import sys
from dataclasses import dataclass, field
from pathlib import Path

import yaml

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from trustcal.config import PHASES, agents_for_phase, default_phase, load_models  # noqa: E402
from trustcal.eval.stats import summarize as summarize_values  # noqa: E402
from trustcal.orchestrator import GOLD_EVIDENCE_DATASETS  # noqa: E402
from trustcal.runner import ARMS, RunConfig, run  # noqa: E402


@dataclass
class Matrix:
    conditions: list[dict]
    datasets: list[str]
    seeds: list[int]
    phase: str
    pilot_limit: int
    main_limit: int
    dataset_caps: dict[str, int] = field(default_factory=dict)
    limit_override: int | None = None

    def limit_for(self, arm: str, dataset: str) -> int:
        if arm == "pilot":
            return self.pilot_limit
        if self.limit_override is not None:
            return self.limit_override
        return self.dataset_caps.get(dataset, self.main_limit)


def _csv(value: str) -> list[str]:
    return [part.strip() for part in value.split(",") if part.strip()]


def _dedupe(values: list[str]) -> list[str]:
    seen: set[str] = set()
    out = []
    for value in values:
        if value not in seen:
            seen.add(value)
            out.append(value)
    return out


def _positive_int(value: str) -> int:
    number = int(value)
    if number <= 0:
        raise argparse.ArgumentTypeError("must be a positive integer")
    return number


_OVERRIDE_KEYS = (
    "use_trust",
    "source_partitioning",
    "progressive_retrieval",
    "adaptive_triggering",
    "inject",
    "injection_scope",
    "alpha",
    "beta",
    "samples",
    "layers",
    "agents",
    "rounds",
    "placebo_mode",
    "placebo_unit",
    "oracle_mode",
)


def _parse_conditions(raw: dict) -> list[dict]:
    conditions = raw.get("conditions")
    if not isinstance(conditions, dict) or not conditions:
        raise ValueError("conditions must be a non-empty mapping")
    parsed = []
    for key, spec in conditions.items():
        if not isinstance(spec, dict):
            raise ValueError(f"condition {key!r} must be a mapping with arm/description")
        arm = spec.get("arm", key)
        if not isinstance(arm, str) or arm not in ARMS:
            raise ValueError(f"condition {key!r}: unknown arm {arm!r}")
        overrides = {name: spec[name] for name in _OVERRIDE_KEYS if name in spec}
        parsed.append(
            {
                "key": key,
                "arm": arm,
                "description": str(spec.get("description", "")),
                "overrides": overrides,
            }
        )
    return parsed


def _select_conditions(conditions: list[dict], override: str | None) -> list[dict]:
    if not override:
        return conditions
    names = _dedupe(_csv(override))
    if not names:
        raise ValueError("--arms must name at least one arm")
    selected: list[dict] = []
    for name in names:
        matches = [c for c in conditions if c["key"] == name or c["arm"] == name]
        if not matches:
            known = sorted({c["key"] for c in conditions} | {c["arm"] for c in conditions})
            raise ValueError(f"unknown arm/condition {name!r}; expected one of {', '.join(known)}")
        selected.extend(matches)
    return selected


def _select_datasets(configured: object, override: str | None) -> list[str]:
    if not isinstance(configured, list) or not configured:
        raise ValueError("datasets must be a non-empty list")
    known = [str(name) for name in configured]
    names = _dedupe(_csv(override)) if override else known
    if not names:
        raise ValueError("--datasets must name at least one dataset")
    unknown = [name for name in names if name not in known]
    if unknown:
        raise ValueError(f"unknown dataset(s): {', '.join(unknown)}; expected one of {', '.join(known)}")
    return names


def _parse_dataset_caps(configured: object, datasets: list[str]) -> dict[str, int]:
    if configured is None:
        return {}
    if not isinstance(configured, dict):
        raise ValueError("dataset_caps must be a mapping of dataset -> positive integer")
    caps: dict[str, int] = {}
    for name, value in configured.items():
        if name not in datasets:
            raise ValueError(
                f"dataset_caps names unknown dataset {name!r}; expected one of {', '.join(datasets)}"
            )
        if type(value) is not int or value <= 0:
            raise ValueError(f"dataset_caps.{name} must be a positive integer")
        caps[str(name)] = value
    return caps


def _select_seeds(configured: object, override: int | None) -> list[int]:
    if override is not None:
        return [override]
    if not isinstance(configured, list) or not configured:
        raise ValueError("seeds must be a non-empty list")
    if any(type(seed) is not int for seed in configured):
        raise ValueError("seeds must be integers")
    return list(configured)


def _load_matrix(path: Path, args: argparse.Namespace) -> Matrix:
    if not path.is_file():
        raise ValueError(f"config not found: {path}")
    raw = yaml.safe_load(path.read_text(encoding="utf-8")) or {}
    if not isinstance(raw, dict):
        raise ValueError(f"config must be a YAML mapping: {path}")

    phase = str(args.phase or raw.get("phase") or default_phase()).strip().lower()
    if phase not in PHASES:
        raise ValueError(f"unknown phase {phase!r}; expected one of {PHASES}")

    caps = raw.get("sample_caps") or {}
    if not isinstance(caps, dict):
        raise ValueError("sample_caps must be a mapping")
    main_limit = args.limit if args.limit is not None else caps.get("main", 10)
    pilot_limit = args.limit if args.limit is not None else caps.get("pilot", main_limit)
    for name, value in (("main", main_limit), ("pilot", pilot_limit)):
        if type(value) is not int or value <= 0:
            raise ValueError(f"sample_caps.{name} must be a positive integer")

    all_datasets = _select_datasets(raw.get("datasets"), None)
    return Matrix(
        conditions=_select_conditions(_parse_conditions(raw), args.arms),
        datasets=_select_datasets(raw.get("datasets"), args.datasets),
        seeds=_select_seeds(raw.get("seeds", [1]), args.seed),
        phase=phase,
        pilot_limit=pilot_limit,
        main_limit=main_limit,
        dataset_caps=_parse_dataset_caps(raw.get("dataset_caps"), all_datasets),
        limit_override=args.limit,
    )


def _build_plan(matrix: Matrix, out_root: Path) -> list[tuple[dict, RunConfig]]:
    plan = []
    for condition in matrix.conditions:
        # Ablation conditions share an arm but must not share records.jsonl.
        condition_root = out_root if condition["key"] == condition["arm"] else out_root / condition["key"]
        overrides = condition.get("overrides", {})
        for dataset in matrix.datasets:
            # WP-18 conditional Full count: gold-evidence oracle only runs on a
            # dataset that carries gold evidence (EG-SSS), so 36 rows drop to 32
            # without changing the config's condition list. The skip happens
            # before RunConfig because that class rejects gold_evidence on any
            # other dataset.
            if (
                overrides.get("oracle_mode") == "gold_evidence"
                and dataset not in GOLD_EVIDENCE_DATASETS
            ):
                continue
            for seed in matrix.seeds:
                cfg = RunConfig(
                    arm=condition["arm"],
                    dataset=dataset,
                    limit=matrix.limit_for(condition["arm"], dataset),
                    seed=seed,
                    out_root=condition_root,
                    phase=matrix.phase,
                    **overrides,
                )
                plan.append((condition, cfg))
    return plan


def _run_dir(cfg: RunConfig) -> Path:
    return cfg.out_root / cfg.arm / cfg.dataset / f"seed{cfg.seed}"


def _aggregate(rows: list[dict]) -> list[dict]:
    """Mean CCR/MPR + 95% bootstrap CI per condition x dataset (over seeds)."""
    groups: dict[tuple[str, str], list[dict]] = {}
    for row in rows:
        groups.setdefault((row["condition"], row["dataset"]), []).append(row)
    aggregates = []
    for (condition, dataset), group in sorted(groups.items()):
        ccr = [row["ccr"] for row in group]
        mpr = [row["mpr"] for row in group]
        aggregates.append(
            {
                "condition": condition,
                "dataset": dataset,
                "seeds": len(group),
                "ccr": summarize_values(ccr),
                "mpr": summarize_values(mpr),
            }
        )
    return aggregates


def _table(rows: list[dict], errors: list[dict], phase: str, aggregates: list[dict] | None = None) -> str:
    lines = [
        "# Experiment matrix",
        "",
        f"Phase: `{phase}`. One row per arm/dataset/seed.",
        "",
        "| condition | arm | dataset | seed | ccr | mpr | n_debates | n_divergent |",
        "| --- | --- | --- | --- | --- | --- | --- | --- |",
    ]
    for row in rows:
        lines.append(
            f"| {row['condition']} | {row['arm']} | {row['dataset']} | {row['seed']} | "
            f"{row['ccr']:.4f} | {row['mpr']:.4f} | {row['n_debates']} | {row['n_divergent']} |"
        )
    if not rows:
        lines += ["", "_No completed runs._"]
    if aggregates:
        lines += [
            "",
            "## Per-condition summary (95% bootstrap CI over seeds)",
            "",
            "| condition | dataset | seeds | CCR mean | CCR 95% CI | MPR mean | MPR 95% CI |",
            "| --- | --- | --- | --- | --- | --- | --- |",
        ]
        for row in aggregates:
            ccr = row["ccr"]
            mpr = row["mpr"]
            lines.append(
                f"| {row['condition']} | {row['dataset']} | {row['seeds']} | "
                f"{ccr['mean']:.4f} | [{ccr['ci_low']:.4f}, {ccr['ci_high']:.4f}] | "
                f"{mpr['mean']:.4f} | [{mpr['ci_low']:.4f}, {mpr['ci_high']:.4f}] |"
            )
    if errors:
        lines += ["", "## Failures", ""]
        for error in errors:
            message = error["error"].replace("|", "/")
            lines.append(f"- `{error['arm']}` / `{error['dataset']}` / seed {error['seed']}: {message}")
    return "\n".join(lines) + "\n"


def main() -> int:
    parser = argparse.ArgumentParser(description="Run the experiment matrix")
    parser.add_argument("--config", default="configs/experiments.yaml", help="matrix YAML")
    parser.add_argument("--out", default="results/matrix", help="output root for runs + summary files")
    parser.add_argument("--limit", type=_positive_int, default=None, help="questions per run (overrides sample_caps)")
    parser.add_argument("--datasets", default=None, help="comma-separated filter, e.g. gpqa_main,mmlu_pro")
    parser.add_argument("--arms", default=None, help="comma-separated filter, e.g. B3,B8")
    parser.add_argument("--seed", type=int, default=None, help="run only this seed")
    parser.add_argument("--phase", choices=PHASES, default=None, help="model stack; defaults to config phase")
    parser.add_argument("--dry-run", action="store_true", help="print planned rows; write nothing")
    args = parser.parse_args()

    try:
        matrix = _load_matrix(Path(args.config), args)
        out_root = Path(args.out)
        plan = _build_plan(matrix, out_root)
    except (OSError, ValueError) as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 1

    stack = " / ".join(a.model for a in agents_for_phase(load_models("configs/models.yaml"), matrix.phase))
    print(f"phase={matrix.phase} stack={stack}")

    if args.dry_run:
        print(f"dry run: {len(plan)} planned runs (phase={matrix.phase}, out={out_root})")
        print(f"{'condition':<12} {'arm':<10} {'dataset':<12} {'seed':>4} {'limit':>6}  run dir")
        for condition, cfg in plan:
            print(
                f"{condition['key']:<12} {cfg.arm:<10} {cfg.dataset:<12} "
                f"{cfg.seed:>4} {cfg.limit:>6}  {_run_dir(cfg)}"
            )
        print("nothing written")
        return 0

    rows: list[dict] = []
    errors: list[dict] = []
    for index, (condition, cfg) in enumerate(plan, start=1):
        print(
            f"[{index}/{len(plan)}] {cfg.arm} / {cfg.dataset} / seed{cfg.seed} / limit={cfg.limit}",
            flush=True,
        )
        try:
            summary = run(cfg)
        except Exception as exc:  # one bad row must not kill the rest of the matrix
            errors.append(
                {
                    "condition": condition["key"],
                    "arm": cfg.arm,
                    "dataset": cfg.dataset,
                    "seed": cfg.seed,
                    "error": str(exc),
                }
            )
            print(f"error: {cfg.arm} / {cfg.dataset} / seed{cfg.seed}: {exc}", file=sys.stderr, flush=True)
            continue
        metrics = summary.as_dict()
        rows.append(
            {
                "condition": condition["key"],
                "arm": cfg.arm,
                "dataset": cfg.dataset,
                "seed": cfg.seed,
                "ccr": metrics["ccr"],
                "mpr": metrics["mpr"],
                "n_debates": metrics["n_debates"],
                "n_divergent": metrics["n_divergent"],
            }
        )

    out_root.mkdir(parents=True, exist_ok=True)
    summary_path = out_root / "summary.json"
    table_path = out_root / "table.md"
    aggregates = _aggregate(rows)
    payload = {
        "config": str(args.config),
        "phase": matrix.phase,
        "rows": rows,
        "aggregates": aggregates,
        "errors": errors,
    }
    try:
        summary_path.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
        table_path.write_text(_table(rows, errors, matrix.phase, aggregates), encoding="utf-8")
    except OSError as exc:
        print(f"error: could not write summary files: {exc}", file=sys.stderr)
        return 1

    print(f"wrote {summary_path} and {table_path} ({len(rows)} completed, {len(errors)} failed)")
    if errors:
        print(f"error: {len(errors)} of {len(plan)} run(s) failed", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
