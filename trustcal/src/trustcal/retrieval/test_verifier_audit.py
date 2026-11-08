"""Verifier audit harness: blind sheets, known-label metrics, exit codes."""

from __future__ import annotations

import csv
import importlib.util
import json
from pathlib import Path
from typing import Any

import pytest

ROOT = Path(__file__).resolve().parents[3]
SCRIPT = ROOT / "scripts" / "verifier_audit.py"
FIXTURES = ROOT / "experiments" / "verifier-audit"


def load_audit_module() -> Any:
    spec = importlib.util.spec_from_file_location("verifier_audit", SCRIPT)
    assert spec and spec.loader
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


audit = load_audit_module()


@pytest.fixture(scope="module")
def pairs() -> list[dict]:
    return audit.read_pairs(FIXTURES / "pairs.jsonl")


@pytest.fixture(scope="module")
def sheets() -> tuple[dict[str, str], dict[str, str]]:
    return audit.read_sheet(FIXTURES / "rater1.csv"), audit.read_sheet(FIXTURES / "rater2.csv")


def fill_sheet(source: Path, dest: Path, labels: dict[str, str]) -> Path:
    with source.open(newline="", encoding="utf-8") as handle:
        rows = list(csv.DictReader(handle))
    with dest.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=audit.SHEET_FIELDS)
        writer.writeheader()
        for row in rows:
            row["label"] = labels[row["pair_id"]]
            writer.writerow(row)
    return dest


# --------------------------------------------------------------------------- #
# fixture + make
# --------------------------------------------------------------------------- #


def test_synthetic_fixture_is_balanced_and_valid(pairs: list[dict]) -> None:
    assert len(pairs) == 20
    counts = {label: sum(1 for pair in pairs if pair["gold_label"] == label) for label in audit.LABELS}
    assert counts == {"supported": 7, "contradicted": 7, "unverifiable": 6}
    assert [pair["id"] for pair in pairs][:2] == ["syn-01", "syn-02"]
    assert pairs[14]["passages"] == []  # empty-passage negative


def test_make_writes_blind_sheets_and_a_codebook(pairs: list[dict], tmp_path: Path) -> None:
    written = audit.write_sheets(pairs, tmp_path)
    names = {path.name for path in written}
    assert names == {"rater1.csv", "rater2.csv", "codebook.md", "manifest.json"}
    for name in ("rater1.csv", "rater2.csv"):
        sheet = (tmp_path / name).read_text(encoding="utf-8")
        assert "gold_label" not in sheet
    labels = audit.read_sheet(tmp_path / "rater1.csv")
    assert len(labels) == 20 and all(label == "" for label in labels.values())
    codebook = (tmp_path / "codebook.md").read_text(encoding="utf-8")
    assert "kappa >= 0.60" in codebook and "balanced accuracy >= 0.75" in codebook
    manifest = json.loads((tmp_path / "manifest.json").read_text(encoding="utf-8"))
    assert manifest["n_pairs"] == 20 and len(manifest["pairs_sha256"]) == 64


def test_make_jsonl_roundtrip(pairs: list[dict], tmp_path: Path) -> None:
    audit.write_sheets(pairs, tmp_path, fmt="jsonl")
    labels = audit.read_sheet(tmp_path / "rater1.jsonl")
    assert len(labels) == 20 and all(label == "" for label in labels.values())
    first = json.loads((tmp_path / "rater1.jsonl").read_text(encoding="utf-8").splitlines()[0])
    assert first["pair_id"] == "syn-01" and isinstance(first["passages"], list)


# --------------------------------------------------------------------------- #
# metrics on known labels
# --------------------------------------------------------------------------- #


def test_score_fixture_matches_hand_computed_metrics(sheets, pairs) -> None:
    rater1, rater2 = sheets
    report = audit.evaluate(rater1, rater2, gold=audit._labels_from_pairs(pairs))

    assert report["n_pairs"] == 20
    assert report["inter_rater"] == {
        "n": 20,
        "agree": 17,
        "disagreements": 3,
        "kappa": pytest.approx(0.7778),
    }
    metrics = report["metrics"]
    assert metrics["n_total"] == 20
    assert metrics["n_covered"] == 14
    assert metrics["coverage"] == pytest.approx(0.7)
    assert metrics["accuracy"] == pytest.approx(0.9286)
    assert metrics["balanced_accuracy"] == pytest.approx(0.9286)
    assert metrics["macro_precision"] == pytest.approx(0.9375)
    assert metrics["macro_recall"] == pytest.approx(0.9286)
    assert metrics["macro_f1"] == pytest.approx(0.9282)
    assert metrics["per_class"]["supported"] == {
        "support": 7,
        "predicted": 6,
        "precision": pytest.approx(1.0),
        "recall": pytest.approx(0.8571),
        "f1": pytest.approx(0.9231),
    }
    assert metrics["confusion"]["supported"] == {"supported": 6, "contradicted": 1, "unverifiable": 0}
    assert report["target_met"] is True and report["failures"] == []


def test_verifier_predictions_score_against_gold(sheets, pairs) -> None:
    rater1, rater2 = sheets
    gold = audit._labels_from_pairs(pairs)
    report = audit.evaluate(rater1, rater2, gold=gold, pred=gold)
    assert report["reference"] == "gold" and report["prediction"] == "pred"
    assert report["metrics"]["balanced_accuracy"] == pytest.approx(1.0)
    assert report["metrics"]["coverage"] == pytest.approx(0.7)
    assert report["target_met"] is True


def test_consensus_reference_drops_disagreements(sheets, pairs) -> None:
    rater1, rater2 = sheets
    report = audit.evaluate(rater1, rater2, pred=audit._labels_from_pairs(pairs))
    assert report["reference"] == "consensus"
    # 3 of 20 pairs disagree, so the consensus reference has 17 items; 6 of
    # those are unverifiable gold, leaving 11 covered and all correct.
    assert report["metrics"]["n_total"] == 17
    assert report["metrics"]["n_covered"] == 11
    assert report["metrics"]["coverage"] == pytest.approx(11 / 17, abs=1e-4)
    assert report["metrics"]["balanced_accuracy"] == pytest.approx(1.0)


def test_metrics_include_unverifiable_as_a_class() -> None:
    reference = ["supported", "supported", "contradicted", "contradicted", "unverifiable", "unverifiable"]
    predicted = ["supported", "contradicted", "contradicted", "contradicted", "unverifiable", "supported"]
    metrics = audit.compute_metrics(reference, predicted)
    # covered: 5 items (the unverifiable prediction at index 5 is excluded)
    assert metrics["n_covered"] == 5
    assert metrics["coverage"] == pytest.approx(5 / 6, abs=1e-4)
    assert metrics["per_class"]["supported"]["recall"] == pytest.approx(1 / 2)
    assert metrics["per_class"]["contradicted"]["recall"] == pytest.approx(1.0)
    assert metrics["per_class"]["unverifiable"]["support"] == 1
    assert metrics["per_class"]["unverifiable"]["recall"] == 0.0
    assert metrics["balanced_accuracy"] == pytest.approx(0.5)
    assert metrics["accuracy"] == pytest.approx(3 / 5)


def test_all_abstentions_score_zero_and_are_not_hidden() -> None:
    metrics = audit.compute_metrics(["supported", "contradicted"], ["unverifiable", "unverifiable"])
    assert metrics["coverage"] == 0.0
    assert metrics["balanced_accuracy"] == 0.0
    assert metrics["n_covered"] == 0


# --------------------------------------------------------------------------- #
# data errors and CLI exit codes
# --------------------------------------------------------------------------- #


def test_blank_labels_are_a_data_error(sheets, pairs) -> None:
    rater1, rater2 = sheets
    blanked = dict(rater1)
    blanked["syn-01"] = ""
    with pytest.raises(audit.AuditError, match="unlabelled"):
        audit.evaluate(blanked, rater2, gold=audit._labels_from_pairs(pairs))


def test_unknown_label_raises_audit_error(sheets) -> None:
    rater1, rater2 = sheets
    bad = dict(rater1)
    bad["syn-01"] = "probably"
    with pytest.raises(audit.AuditError, match="unknown label"):
        audit.evaluate(bad, rater2)


def test_sheets_must_cover_the_same_pairs(sheets) -> None:
    rater1, rater2 = sheets
    short = dict(rater2)
    short.pop("syn-20")
    with pytest.raises(audit.AuditError, match="different pairs"):
        audit.evaluate(rater1, short)


def test_gold_must_match_the_sheet_ids(sheets, pairs) -> None:
    rater1, rater2 = sheets
    gold = audit._labels_from_pairs(pairs)
    gold.pop("syn-20")
    with pytest.raises(audit.AuditError, match="--gold does not match"):
        audit.evaluate(rater1, rater2, gold=gold)


def test_duplicate_pair_ids_are_rejected(tmp_path: Path) -> None:
    path = tmp_path / "pairs.jsonl"
    row = {"id": "dup", "claim": "c", "passages": ["p"], "gold_label": "supported"}
    path.write_text("\n".join(json.dumps(row) for _ in range(2)), encoding="utf-8")
    with pytest.raises(audit.AuditError, match="duplicate id"):
        audit.read_pairs(path)


def test_cli_make_then_score_passes_and_fails_the_gate(sheets, pairs, tmp_path: Path) -> None:
    kit = tmp_path / "kit"
    assert audit.main(["make", "--pairs", str(FIXTURES / "pairs.jsonl"), "--out", str(kit)]) == 0
    assert (kit / "rater1.csv").exists() and (kit / "codebook.md").exists()

    rater1, rater2 = sheets
    labelled1 = fill_sheet(kit / "rater1.csv", tmp_path / "r1.csv", rater1)
    labelled2 = fill_sheet(kit / "rater2.csv", tmp_path / "r2.csv", rater2)
    base = ["score", "--rater1", str(labelled1), "--rater2", str(labelled2), "--gold", str(FIXTURES / "pairs.jsonl")]

    assert audit.main(base) == 0
    assert audit.main(base + ["--min-kappa", "0.99"]) == 2  # kappa 0.7778 misses the raised bar


def test_cli_missing_file_is_a_data_error(tmp_path: Path) -> None:
    code = audit.main(["score", "--rater1", str(tmp_path / "nope.csv"), "--rater2", str(tmp_path / "no.csv")])
    assert code == 1


def test_cli_usage_error_returns_1_not_2() -> None:
    with pytest.raises(SystemExit) as excinfo:
        audit.main([])
    assert excinfo.value.code == 1
