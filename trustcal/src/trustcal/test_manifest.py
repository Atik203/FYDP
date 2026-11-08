"""Run manifest: stable hashing, resume refusal, volatile fields (P0-11)."""

from __future__ import annotations

import json

import pytest

from .manifest import (
    ManifestMismatch,
    build_manifest,
    check_resume,
    manifest_hash,
    write_manifest,
)

MODELS = """
rounds: 3
agents:
  - role: agent1
    model: alpha-model
    quant: awq
    max_model_len: 4096
final_phase:
  agents:
    - role: agent1
      model: final-model
      quant: auto
      max_model_len: 8192
"""

DATASETS = """
datasets:
  gpqa:
    revision: "633f5ee89ab8ad4522a9f850766b73f62147ffdd"
  mmlu_pro:
    revision: "main"
"""

PROMPTS = 'AGENT_INITIAL = "Answer the question: {question}"\n'


@pytest.fixture()
def inputs(tmp_path):
    paths = {
        "config": tmp_path / "experiments.yaml",
        "models": tmp_path / "models.yaml",
        "datasets": tmp_path / "datasets.yaml",
        "prompts": tmp_path / "prompts.py",
    }
    paths["config"].write_text("alpha: 0.5\nbeta: 0.3\n", encoding="utf-8")
    paths["models"].write_text(MODELS, encoding="utf-8")
    paths["datasets"].write_text(DATASETS, encoding="utf-8")
    paths["prompts"].write_text(PROMPTS, encoding="utf-8")
    return paths


def _manifest(inputs, *, alpha=0.5, beta=0.3, seed=1, temperature=0.7, created_at=None, code_commit="cafebabe"):
    inputs["config"].write_text(f"alpha: {alpha}\nbeta: {beta}\n", encoding="utf-8")
    return build_manifest(
        [inputs["config"]],
        inputs["models"],
        inputs["datasets"],
        inputs["prompts"],
        seed,
        temperature,
        run_config={"alpha": alpha, "beta": beta, "seed": seed, "temperature": temperature},
        created_at=created_at,
        code_commit=code_commit,
    )


def test_manifest_carries_the_reproducibility_fields(inputs) -> None:
    manifest = _manifest(inputs)
    for key in (
        "config_hash",
        "model_checkpoints",
        "prompt_hash",
        "dataset_revisions",
        "code_commit",
        "temperature",
        "seed",
        "created_at",
    ):
        assert key in manifest

    assert manifest["model_checkpoints"]["dev"][0]["model"] == "alpha-model"
    assert manifest["model_checkpoints"]["final"][0]["model"] == "final-model"
    assert len(manifest["prompt_hash"]) == 64
    assert manifest["dataset_revisions"]["gpqa"].startswith("633f5ee")
    assert manifest["code_commit"] == "cafebabe"
    assert manifest["temperature"] == 0.7
    assert manifest["seed"] == 1
    assert manifest["run_config"]["alpha"] == 0.5


def test_identical_manifest_has_the_same_hash(inputs) -> None:
    first = _manifest(inputs, created_at="2026-01-01T00:00:00Z")
    second = _manifest(inputs, created_at="2026-11-08T12:00:00Z")
    assert manifest_hash(first) == manifest_hash(second)


def test_created_at_is_not_in_the_result_hash(inputs) -> None:
    manifest = _manifest(inputs, created_at="2026-01-01T00:00:00Z")
    relabelled = dict(manifest, created_at="2030-05-05T05:05:05Z")
    assert manifest_hash(manifest) == manifest_hash(relabelled)


def test_alpha_change_changes_the_hash(inputs) -> None:
    assert manifest_hash(_manifest(inputs, alpha=0.5)) != manifest_hash(_manifest(inputs, alpha=0.6))


def test_beta_change_changes_the_hash(inputs) -> None:
    assert manifest_hash(_manifest(inputs, beta=0.3)) != manifest_hash(_manifest(inputs, beta=0.4))


def test_seed_and_temperature_change_the_hash(inputs) -> None:
    base = manifest_hash(_manifest(inputs, seed=1, temperature=0.7))
    assert base != manifest_hash(_manifest(inputs, seed=2, temperature=0.7))
    assert base != manifest_hash(_manifest(inputs, seed=1, temperature=0.0))


def test_model_checkpoint_change_changes_the_hash(inputs) -> None:
    before = manifest_hash(_manifest(inputs))
    inputs["models"].write_text(MODELS.replace("alpha-model", "gamma-model"), encoding="utf-8")
    assert manifest_hash(_manifest(inputs)) != before


def test_dataset_revision_change_changes_the_hash(inputs) -> None:
    before = manifest_hash(_manifest(inputs))
    inputs["datasets"].write_text(DATASETS.replace('"main"', '"deadbeef"'), encoding="utf-8")
    assert manifest_hash(_manifest(inputs)) != before


def test_prompt_change_changes_the_hash(inputs) -> None:
    before = manifest_hash(_manifest(inputs))
    inputs["prompts"].write_text(PROMPTS + "# prompt tweak\n", encoding="utf-8")
    assert manifest_hash(_manifest(inputs)) != before


def test_config_file_change_changes_the_hash(inputs) -> None:
    before = manifest_hash(_manifest(inputs))
    inputs["config"].write_text("alpha: 0.5\nbeta: 0.3\nuse_trust: false\n", encoding="utf-8")
    current = build_manifest(
        [inputs["config"]],
        inputs["models"],
        inputs["datasets"],
        inputs["prompts"],
        1,
        0.7,
        run_config={"alpha": 0.5, "beta": 0.3, "seed": 1, "temperature": 0.7},
        code_commit="cafebabe",
    )
    assert manifest_hash(current) != before


def test_resume_accepts_an_identical_manifest(inputs, tmp_path) -> None:
    manifest = _manifest(inputs)
    path = write_manifest(tmp_path / "run_manifest.json", manifest)
    check_resume(path, manifest)
    check_resume(path, dict(manifest, created_at="2030-01-01T00:00:00Z"))


def test_resume_refuses_a_changed_config(inputs, tmp_path) -> None:
    path = write_manifest(tmp_path / "run_manifest.json", _manifest(inputs, alpha=0.5))
    with pytest.raises(ManifestMismatch, match="run_config"):
        check_resume(path, _manifest(inputs, alpha=0.6))


def test_resume_reports_every_differing_key(inputs, tmp_path) -> None:
    path = write_manifest(tmp_path / "run_manifest.json", _manifest(inputs, seed=1, temperature=0.7))
    with pytest.raises(ManifestMismatch) as excinfo:
        check_resume(path, _manifest(inputs, seed=2, temperature=0.0))
    message = str(excinfo.value)
    assert "seed" in message
    assert "temperature" in message


def test_missing_manifest_is_a_fresh_start(inputs, tmp_path) -> None:
    check_resume(tmp_path / "does-not-exist.json", _manifest(inputs))


def test_unreadable_manifest_is_refused(inputs, tmp_path) -> None:
    path = tmp_path / "run_manifest.json"
    path.write_text("{not json", encoding="utf-8")
    with pytest.raises(ManifestMismatch, match="unreadable"):
        check_resume(path, _manifest(inputs))


def test_write_manifest_round_trips(inputs, tmp_path) -> None:
    manifest = _manifest(inputs)
    path = write_manifest(tmp_path / "nested" / "run_manifest.json", manifest)
    assert json.loads(path.read_text(encoding="utf-8")) == manifest
