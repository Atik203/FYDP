"""Run manifest — the reproducibility contract for one run directory (P0-11).

``build_manifest`` hashes everything that can change a result: config file
contents, the run-config values (alpha/beta and friends), the model
checkpoints, the prompt file, the pinned dataset revisions, the code commit,
the seed, and the sampling temperature. ``manifest_hash`` turns the manifest
into one stable digest that every record carries.

``check_resume`` refuses to append to a run directory when any result-affecting
field differs. ``created_at`` is the only volatile field and is excluded from
the hash, so re-running the same config later resumes instead of forking.

Canonical JSON (sorted keys, no whitespace) makes the digest independent of
dict insertion order, platform, and file location; config files are identified
by basename so moving the repo does not invalidate a run.
"""

from __future__ import annotations

import hashlib
import json
import os
import subprocess
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Mapping, Sequence

import yaml

ROOT = Path(__file__).resolve().parents[2]
DEFAULT_MODELS = ROOT / "configs" / "models.yaml"
DEFAULT_DATASETS = ROOT / "configs" / "datasets.yaml"
DEFAULT_PROMPTS = ROOT / "src" / "trustcal" / "agents" / "prompts.py"

# Wall-clock metadata and a possible self-reference never affect the digest.
VOLATILE_KEYS = frozenset({"created_at", "manifest_hash"})

COMMIT_ENV = "TRUSTCAL_CODE_COMMIT"


class ManifestMismatch(RuntimeError):
    """A resume would mix results from different configs, models, or data."""


def build_manifest(
    config_paths: Sequence[Path | str] | Path | str = (),
    models_path: Path | str = DEFAULT_MODELS,
    datasets_path: Path | str = DEFAULT_DATASETS,
    prompts_path: Path | str = DEFAULT_PROMPTS,
    seed: int = 0,
    temperature: float = 0.0,
    *,
    run_config: Mapping[str, Any] | None = None,
    created_at: str | None = None,
    code_commit: str | None = None,
) -> dict:
    """Manifest for one run; pass the arm's RunConfig as ``run_config``.

    ``config_paths`` covers YAML/JSON files (experiments.yaml + any per-run
    config). ``run_config`` covers values that live on the command line,
    including ``alpha`` and ``beta``; it is stored verbatim for audit and folded
    into ``config_hash``.
    """
    config_files = _hash_files(config_paths)
    config_payload: dict[str, Any] = {"files": config_files}
    if run_config is not None:
        config_payload["run_config"] = dict(run_config)

    manifest: dict[str, Any] = {
        "config_hash": _digest(config_payload),
        "config_files": config_files,
        "model_checkpoints": _model_checkpoints(models_path),
        "prompt_hash": _file_sha256(prompts_path),
        "dataset_revisions": _dataset_revisions(datasets_path),
        "code_commit": code_commit or _code_commit(),
        "temperature": float(temperature),
        "seed": int(seed),
        "created_at": created_at or _utc_now(),
    }
    if run_config is not None:
        manifest["run_config"] = dict(run_config)
    return manifest


def manifest_hash(manifest: Mapping[str, Any]) -> str:
    """Stable sha256 of the result-affecting fields (``created_at`` excluded)."""
    if not isinstance(manifest, Mapping):
        raise TypeError("manifest must be a mapping")
    payload = {key: value for key, value in manifest.items() if key not in VOLATILE_KEYS}
    return _digest(payload)


def check_resume(manifest_path: Path | str, current_manifest: Mapping[str, Any]) -> None:
    """Raise ``ManifestMismatch`` when an existing manifest disagrees.

    A missing file means a fresh run directory, so there is nothing to check.
    """
    path = Path(manifest_path)
    if not path.is_file():
        return

    try:
        previous = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        raise ManifestMismatch(f"unreadable run manifest {path}: {exc}") from exc
    if not isinstance(previous, dict):
        raise ManifestMismatch(f"run manifest {path} is not a JSON object")

    differing = [
        key
        for key in sorted(set(previous) | set(current_manifest))
        if key not in VOLATILE_KEYS and previous.get(key) != current_manifest.get(key)
    ]
    if differing:
        raise ManifestMismatch(
            f"resume refused: {path} differs in {', '.join(differing)}; "
            "use a new run directory for the changed configuration"
        )


def write_manifest(path: Path | str, manifest: Mapping[str, Any]) -> Path:
    """Write the manifest as stable, diffable JSON (parents created)."""
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(manifest, indent=2, sort_keys=True, ensure_ascii=False) + "\n", encoding="utf-8")
    return path


def _canonical(value: object) -> str:
    return json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False, default=str)


def _digest(value: object) -> str:
    return hashlib.sha256(_canonical(value).encode("utf-8")).hexdigest()


def _hash_files(paths: Sequence[Path | str] | Path | str) -> dict[str, str]:
    if isinstance(paths, (str, Path)):
        paths = (paths,)
    hashes: dict[str, str] = {}
    for path in paths:
        path = Path(path)
        if not path.is_file():
            raise FileNotFoundError(f"config file not found: {path}")
        hashes[path.name] = _file_sha256(path)
    return dict(sorted(hashes.items()))


def _file_sha256(path: Path | str) -> str:
    path = Path(path)
    if not path.is_file():
        raise FileNotFoundError(f"manifest input not found: {path}")
    return hashlib.sha256(path.read_bytes()).hexdigest()


def _model_checkpoints(models_path: Path | str) -> dict[str, list[dict]]:
    raw = yaml.safe_load(Path(models_path).read_text(encoding="utf-8")) or {}
    final = raw.get("final_phase") or {}
    stacks = {"dev": raw.get("agents") or [], "final": final.get("agents") or []}
    return {
        phase: sorted(
            (
                {
                    "role": agent.get("role"),
                    "model": agent.get("model"),
                    "quant": agent.get("quant"),
                    "max_model_len": agent.get("max_model_len"),
                    "extra_args": list(agent.get("extra_args") or []),
                }
                for agent in agents
            ),
            key=lambda entry: str(entry["role"]),
        )
        for phase, agents in stacks.items()
    }


def _dataset_revisions(datasets_path: Path | str) -> dict[str, Any]:
    raw = yaml.safe_load(Path(datasets_path).read_text(encoding="utf-8")) or {}
    datasets = raw.get("datasets") or {}
    return {name: entry.get("revision") for name, entry in sorted(datasets.items())}


def _code_commit() -> str:
    """``TRUSTCAL_CODE_COMMIT`` override, else the repo HEAD, else ``unknown``."""
    override = os.getenv(COMMIT_ENV, "").strip()
    if override:
        return override
    try:
        result = subprocess.run(
            ["git", "rev-parse", "HEAD"],
            cwd=ROOT.parent,
            capture_output=True,
            text=True,
            timeout=5,
        )
    except (OSError, subprocess.SubprocessError):
        return "unknown"
    return result.stdout.strip() if result.returncode == 0 else "unknown"


def _utc_now() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
