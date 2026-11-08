"""Record schema v2: defaults, required keys, and write-time invariants."""

from __future__ import annotations

import pytest

from .records import REQUIRED_KEYS, build_record, validate_record

OPTIONS = ["mitochondrial matrix", "cytoplasm", "nucleus", "reticulum"]
RENDERED = ["cytoplasm", "nucleus", "mitochondrial matrix", "reticulum"]


def _record(**overrides) -> dict:
    fields = dict(
        question_id="gpqa-0001",
        arm="B8",
        seed=7,
        question="Where does the Krebs cycle occur?",
        gold="mitochondrial matrix",
        options_raw=OPTIONS,
        options=RENDERED,
        option_permutation=[1, 2, 0, 3],
        gold_letter_rendered="C",
        raw_answer="Answer: C",
        parsed_answer="C",
        parser_version="p0-1",
        final_answer="cytoplasm",
        final_answer_correct=False,
        final_answer_source="weighted",
        rounds=[{"answers": ["C", "B", "B"], "inconclusive": [False, False, False]}],
        transcript=[{"round": 1, "positions": ["Answer: C", "Answer: B", "Answer: B"]}],
        evidence_introduced=False,
        injection=None,
        trust_trajectory=[[0.5, 0.25, 0.25], [0.6, 0.2, 0.2]],
        trust_for_positions=[0.6, 0.2, 0.2],
        trust_status=["updated", "updated", "updated"],
        verdicts=[],
        manifest_hash="a" * 64,
    )
    fields.update(overrides)
    return build_record(**fields)


def test_valid_synthetic_record_passes() -> None:
    assert validate_record(_record()) == []


def test_schema_is_the_frozen_key_set() -> None:
    assert set(REQUIRED_KEYS) <= set(_record())
    assert len(REQUIRED_KEYS) == 24


def test_missing_final_answer_is_reported() -> None:
    record = _record()
    del record["final_answer"]
    errors = validate_record(record)
    assert any("final_answer" in error for error in errors)


def test_build_record_refuses_to_invent_final_answer() -> None:
    with pytest.raises(TypeError, match="final_answer"):
        build_record(
            question_id="gpqa-0001",
            arm="B1",
            seed=1,
            gold="cytoplasm",
            evidence_introduced=False,
        )


def test_build_record_refuses_to_invent_evidence_introduced() -> None:
    with pytest.raises(TypeError, match="evidence_introduced"):
        build_record(
            question_id="gpqa-0001",
            arm="B1",
            seed=1,
            gold="cytoplasm",
            final_answer="cytoplasm",
        )


def test_bare_letter_gold_is_rejected_when_options_exist() -> None:
    errors = validate_record(_record(gold="B"))
    assert any("bare letter" in error for error in errors)


def test_letter_gold_is_allowed_without_options() -> None:
    record = _record(gold="B", options_raw=None, options=None, option_permutation=None, gold_letter_rendered=None)
    assert validate_record(record) == []


def test_manifest_hash_is_carried() -> None:
    record = _record(manifest_hash="f" * 64)
    assert record["manifest_hash"] == "f" * 64
    assert validate_record(record) == []
    assert any("manifest_hash" in error for error in validate_record(_record(manifest_hash=7)))


def test_final_answer_source_must_be_known() -> None:
    errors = validate_record(_record(final_answer_source="majority-vote"))
    assert any("final_answer_source" in error for error in errors)


def test_empty_parser_version_fails() -> None:
    errors = validate_record(_record(parser_version="  "))
    assert any("parser_version" in error for error in errors)


def test_trust_vectors_must_sum_to_one() -> None:
    assert validate_record(_record(trust_for_positions=[0.5, 0.5])) == []

    off_sum = validate_record(_record(trust_for_positions=[0.5, 0.6]))
    assert any("sum" in error for error in off_sum)

    bad_round = validate_record(_record(trust_trajectory=[[0.5, 0.25, 0.25], [0.5, 0.3, 0.3]]))
    assert any("trust_trajectory[1]" in error for error in bad_round)


def test_trust_status_values_are_checked() -> None:
    errors = validate_record(_record(trust_status=["updated", "invented", "updated"]))
    assert any("trust_status" in error for error in errors)


def test_wrong_types_are_reported() -> None:
    errors = validate_record(_record(seed="7", rounds={}, options="cytoplasm"))
    joined = " ".join(errors)
    assert "seed" in joined
    assert "rounds" in joined
    assert "options" in joined


def test_option_permutation_must_be_a_permutation() -> None:
    errors = validate_record(_record(option_permutation=[0, 0, 1, 3]))
    assert any("option_permutation" in error for error in errors)


def test_build_record_fills_defaults_but_leaves_provenance_empty() -> None:
    record = build_record(
        question_id="gpqa-0001",
        arm="B1",
        seed=1,
        gold="cytoplasm",
        final_answer="cytoplasm",
        evidence_introduced=False,
    )
    assert record["options"] is None
    assert record["options_raw"] is None
    assert record["verdicts"] == []
    assert record["rounds"] == []
    assert record["injection"] is None
    assert record["manifest_hash"] is None
    assert record["parser_version"] == ""
    assert record["final_answer_source"] == ""

    errors = validate_record(record)
    assert any("parser_version" in error for error in errors)
    assert any("final_answer_source" in error for error in errors)
    assert any("rounds" in error for error in errors)


def test_extra_keys_survive_and_are_ignored() -> None:
    record = _record(elapsed_s=12.5, pilot={"changed": True})
    assert record["elapsed_s"] == 12.5
    assert validate_record(record) == []
