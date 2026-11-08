"""P0-4 endpoint tests over synthetic schema-v2 records.

Every expected value is computed by hand in the docstring of the test that
pins it. The calibrated pool (``p0_fixtures.fixture_records``) has values:

    accuracy 3/6, CMR 1/2, CCR-0 1/2, CCR-E 1/3, MPR-weighted 3/6,
    gold_held 4/6, ARR 1/2, AUROC 5/6, Brier 2/9 vs baseline 13/54 (skill 1/13).
"""

from __future__ import annotations

import pytest

from .endpoints import (
    REQUIRED_ENDPOINTS,
    EndpointError,
    agent_evidence_condition,
    arr,
    ccr0,
    ccr_e,
    clustered_accuracy_ci,
    cmr,
    final_answer_accuracy,
    mpr_weighted,
    position_is_gold,
    summarize_endpoints,
    trust_auroc,
    trust_brier,
    wilson_interval,
)
from .metrics import ecr, summarize
from .p0_fixtures import (
    all_correct,
    all_wrong,
    binary_pair,
    decisive_negative_switch,
    fixture_records,
    legacy_verdicts,
    length_mismatch,
    majority_correct_revision,
    malformed_round,
    minority_collapse,
    minority_holds,
    missing_final_answer,
    no_pressure_control,
    no_weighted,
    partly_fixed,
    positive_evidence_switch,
    tie,
)


# --------------------------------------------------------------------------- #
# Answer scoring
# --------------------------------------------------------------------------- #


def test_position_is_gold_maps_rendered_letter_and_text() -> None:
    record = all_correct()
    assert position_is_gold("C", record) is True  # gold_letter_rendered
    assert position_is_gold("alpha", record) is True  # option text
    assert position_is_gold("A", record) is False  # rendered option "beta"
    assert position_is_gold("", record) is False
    assert position_is_gold("E", record) is False


# --------------------------------------------------------------------------- #
# 1. Final-answer accuracy
# --------------------------------------------------------------------------- #


def test_accuracy_counts_and_clustered_ci() -> None:
    result = final_answer_accuracy(fixture_records())
    assert result.value == 0.5  # 3 correct of 6
    assert result.n == 6
    assert result.numerator == 3
    assert result.counts["n_correct"] == 3
    assert result.counts["n_clusters"] == 6
    assert result.counts["n_flag_mismatch"] == 0
    low, high = result.ci
    assert low < 0.5 < high
    assert result.ci_method == "question-clustered percentile bootstrap"


def test_accuracy_clusters_resample_questions_not_records() -> None:
    # Two questions, each run twice: cluster (2/2) and cluster (0/2).
    # Resampling two clusters can draw both-wrong or both-right, so the 95%
    # interval must reach 0 and 1; a per-record bootstrap would stay narrower.
    records = [all_correct(), all_correct(), all_wrong(), all_wrong()]
    result = final_answer_accuracy(records)
    assert result.value == 0.5
    assert result.ci == (0.0, 1.0)
    assert result.counts["n_clusters"] == 2


def test_accuracy_ci_is_deterministic_for_a_fixed_seed() -> None:
    records = fixture_records()
    assert final_answer_accuracy(records).ci == final_answer_accuracy(records).ci
    other = final_answer_accuracy(records, seed=7)
    assert other.value == 0.5
    assert other.ci is not None


def test_accuracy_reports_flag_mismatch_instead_of_trusting_it() -> None:
    record = all_wrong()
    record["final_answer_correct"] = True  # stored flag lies; scoring wins
    result = final_answer_accuracy([record])
    assert result.value == 0.0
    assert result.counts["n_flag_mismatch"] == 1


def test_accuracy_missing_final_answer_raises() -> None:
    with pytest.raises(EndpointError, match="final_answer"):
        final_answer_accuracy([missing_final_answer()])


def test_accuracy_requires_question_id_for_clustering() -> None:
    record = all_correct()
    record.pop("question_id")
    with pytest.raises(EndpointError, match="question_id"):
        final_answer_accuracy([record])


def test_accuracy_empty_is_not_applicable() -> None:
    result = final_answer_accuracy([])
    assert result.value is None
    assert result.status == "not_applicable"


def test_clustered_ci_requires_bootstrap_draws() -> None:
    with pytest.raises(EndpointError):
        clustered_accuracy_ci({"q1": (1, 1)}, n_boot=0)


def test_wilson_interval_bounds() -> None:
    low, high = wilson_interval(0, 10)
    assert low == 0.0 and 0.0 < high < 0.3
    low, high = wilson_interval(10, 10)
    assert high <= 1.0 and high > 0.99 and 0.7 < low < 1.0
    with pytest.raises(EndpointError):
        wilson_interval(0, 0)


# --------------------------------------------------------------------------- #
# 2. CMR
# --------------------------------------------------------------------------- #


def test_cmr_retains_only_the_pressured_correct_minority() -> None:
    result = cmr(fixture_records())
    assert result.value == 0.5  # held in q-holds, collapsed in q-collapse
    assert result.n == 2
    assert result.numerator == 1
    assert result.counts["n_pressure"] == 2
    assert result.counts["n_retained"] == 1


def test_cmr_differs_from_gold_held() -> None:
    # q-collapse: another agent picks gold up again, but the initially-correct
    # minority agent itself does not hold it.
    assert cmr([minority_collapse()]).value == 0.0
    assert mpr_weighted([minority_collapse()]).counts["n_gold_held"] == 1


def test_cmr_ignores_items_without_pressure() -> None:
    result = cmr([all_correct(), all_wrong(), no_pressure_control()])
    assert result.value is None
    assert result.status == "not_applicable"
    assert result.counts["n_pressure"] == 0


def test_cmr_counts_single_round_items_as_ineligible() -> None:
    record = minority_holds()
    record["rounds"] = record["rounds"][:1]
    result = cmr([record])
    assert result.value is None
    assert result.counts["n_pressure"] == 1
    assert result.counts["n_single_round"] == 1


def test_cmr_item_without_correct_minority_is_not_in_the_denominator() -> None:
    record = minority_holds()
    record["rounds"] = [
        {"answers": ["A", "A", "A"], "inconclusive": [False] * 3},
        {"answers": ["A", "A", "A"], "inconclusive": [False] * 3},
    ]
    result = cmr([record])
    assert result.value is None
    assert result.counts["n_no_correct_minority"] == 1


def test_cmr_malformed_record_raises() -> None:
    with pytest.raises(EndpointError, match="answers"):
        cmr([malformed_round()])
    with pytest.raises(EndpointError, match="gold"):
        cmr([{**all_correct(), "gold": ""}])


# --------------------------------------------------------------------------- #
# 3. CCR-0
# --------------------------------------------------------------------------- #


def test_ccr0_switches_over_exposed_correct_agents() -> None:
    result = ccr0(fixture_records())
    assert result.value == 0.5  # q-collapse switches, q-holds does not
    assert result.n == 2
    assert result.numerator == 1
    assert result.counts["n_switched"] == 1
    assert result.counts["n_switched_to_consensus"] == 1


def test_ccr0_excludes_retrieval_records() -> None:
    record = minority_collapse()
    record["evidence_introduced"] = True
    result = ccr0([record])
    assert result.value is None
    assert result.counts["n_with_evidence"] == 1


def test_ccr0_respects_injection_targets() -> None:
    record = minority_holds()
    record["targets"] = [1]
    record["injection"] = {**record["injection"], "targets": [1]}
    result = ccr0([record])
    assert result.value is None
    assert result.counts["n_no_exposed_correct"] == 1


def test_ccr0_requires_pressure() -> None:
    result = ccr0([all_correct(), majority_correct_revision()])
    assert result.value is None
    assert result.counts["n_pressure"] == 0


# --------------------------------------------------------------------------- #
# 4. CCR-E
# --------------------------------------------------------------------------- #


def test_ccr_e_excludes_decisive_negative_switches() -> None:
    result = ccr_e(fixture_records())
    # q-revise: 2 at-risk agents, no switch; q-positive: 1 at-risk, switches;
    # q-negative: decisive-negative, excluded from the rate but counted.
    assert result.value == pytest.approx(1 / 3)
    assert result.n == 3
    assert result.numerator == 1
    assert result.counts["n_decisive_negative"] == 1
    assert result.counts["n_decisive_negative_switches"] == 1
    assert result.counts["evidence_condition"] == {"supported": 3, "contradicted": 1}


def test_ccr_e_reports_the_evidence_condition_of_the_switch() -> None:
    result = ccr_e([positive_evidence_switch()])
    assert result.value == 1.0
    assert result.counts["evidence_condition"] == {"supported": 1}
    assert result.counts["switches_by_condition"] == {"supported": 1}


def test_ccr_e_reads_the_legacy_support_harm_shape() -> None:
    record = legacy_verdicts()
    assert agent_evidence_condition(record, 0)["condition"] == "supported"
    assert agent_evidence_condition(record, 1)["condition"] == "contradicted"
    assert ccr_e([record]).value == 1.0


def test_ccr_e_no_evidence_is_not_applicable() -> None:
    result = ccr_e([all_correct()])
    assert result.value is None
    assert result.counts["n_no_evidence_agent"] == 3


def test_evidence_condition_is_case_insensitive() -> None:
    record = minority_holds()
    record["verdicts"] = [
        {"agent": 0, "round": 2, "claim": "c1", "verdict": "CONTRADICTED"},
        {"agent": 0, "round": 2, "claim": "c2", "verdict": "Refuted"},
        {"agent": 0, "round": 2, "claim": "c3", "verdict": "unverifiable"},
    ]
    assert agent_evidence_condition(record, 0)["condition"] == "contradicted"


def test_evidence_condition_mixed_is_not_decisive_negative() -> None:
    record = minority_holds()
    record["verdicts"] = [
        {"agent": 0, "round": 2, "claim": "c1", "verdict": "contradicted"},
        {"agent": 0, "round": 2, "claim": "c2", "verdict": "supported"},
        {"agent": 0, "round": 2, "claim": "c3", "verdict": "supported"},
    ]
    assert agent_evidence_condition(record, 0)["condition"] == "mixed"


# --------------------------------------------------------------------------- #
# 5. MPR-weighted
# --------------------------------------------------------------------------- #


def test_mpr_weighted_uses_the_weighted_answer() -> None:
    # The final round is a three-way tie; the weighted aggregation picks gold.
    assert mpr_weighted([tie()]).value == 1.0


def test_mpr_weighted_never_falls_back_to_majority() -> None:
    # Majority is gold, weighted answer is wrong: a majority fallback would
    # score this 1.0 and this test would fail.
    record = tie()
    record["aggregation"] = {"majority": "alpha", "weighted": "beta", "changed": True}
    assert mpr_weighted([record]).value == 0.0


def test_mpr_weighted_requires_a_weighted_answer() -> None:
    with pytest.raises(EndpointError, match="weighted"):
        mpr_weighted([no_weighted()])


def test_mpr_weighted_accepts_final_answer_with_weighted_source() -> None:
    record = no_weighted()
    record["final_answer_source"] = "weighted"
    result = mpr_weighted([record])
    assert result.value == 1.0
    assert result.counts["n_weighted_fallback"] == 1


def test_mpr_weighted_reports_gold_held_separately() -> None:
    result = mpr_weighted([minority_collapse()])
    assert result.value == 0.0
    assert result.counts["n_gold_held"] == 1


def test_mpr_weighted_pool() -> None:
    result = mpr_weighted(fixture_records())
    assert result.value == 0.5
    assert result.counts["n_correct"] == 3
    assert result.counts["n_gold_held"] == 4


# --------------------------------------------------------------------------- #
# 6. ARR
# --------------------------------------------------------------------------- #


def test_arr_calibrated_pool() -> None:
    result = arr(fixture_records())
    assert result.value == 0.5  # q-revise fixes its wrong agent, q-arr does not
    assert result.n == 2
    assert result.numerator == 1
    assert result.counts["n_records_majority_correct"] == 2
    assert result.counts["n_fixed"] == 1


def test_arr_excludes_ties() -> None:
    result = arr([tie()])
    assert result.value is None
    assert result.counts["n_records_tied"] == 1


def test_arr_excludes_wrong_majorities() -> None:
    result = arr([all_wrong()])
    assert result.value is None
    assert result.counts["n_records_majority_wrong_or_tied"] == 1


def test_arr_counts_every_initially_wrong_agent() -> None:
    assert arr([majority_correct_revision()]).value == 1.0
    assert arr([partly_fixed()]).value == 0.0


# --------------------------------------------------------------------------- #
# 7. Trust AUROC
# --------------------------------------------------------------------------- #


def test_auroc_perfect_ranking() -> None:
    assert trust_auroc([binary_pair([0.9, 0.1])]).value == 1.0


def test_auroc_reversed_ranking() -> None:
    assert trust_auroc([binary_pair([0.1, 0.9])]).value == 0.0


def test_auroc_ties_score_half() -> None:
    assert trust_auroc([binary_pair([0.5, 0.5])]).value == 0.5


def test_auroc_macro_over_debates() -> None:
    result = trust_auroc([binary_pair([0.9, 0.1]), binary_pair([0.1, 0.9])])
    assert result.value == 0.5
    assert result.counts["n_debates"] == 2
    assert result.counts["n_pairs"] == 2


def test_auroc_prefers_trust_for_positions() -> None:
    record = binary_pair([0.9, 0.1])
    record["final_trust"] = [0.1, 0.9]  # stale vector must be ignored
    assert trust_auroc([record]).value == 1.0


def test_auroc_calibrated_pool() -> None:
    result = trust_auroc(fixture_records())
    # q-collapse 0.5, q-holds 1.0, q-arr 1.0 -> 5/6; three debates contribute pairs.
    assert result.value == pytest.approx(5 / 6)
    assert result.n == 3
    assert result.counts["n_pairs"] == 6
    assert result.counts["n_no_pairs"] == 3


def test_auroc_skips_debates_without_pairs() -> None:
    result = trust_auroc([all_correct(), all_wrong()])
    assert result.value is None
    assert result.counts["n_no_pairs"] == 2


def test_auroc_length_mismatch_raises() -> None:
    with pytest.raises(EndpointError, match="trust vector"):
        trust_auroc([length_mismatch()])


# --------------------------------------------------------------------------- #
# 8. Trust Brier
# --------------------------------------------------------------------------- #


def test_brier_perfect_predictor() -> None:
    result = trust_brier([binary_pair([1.0, 0.0])])
    assert result.value == 0.0
    assert result.counts["baseline"] == pytest.approx(5 / 18)
    assert result.counts["skill"] == 1.0


def test_brier_reversed_predictor() -> None:
    result = trust_brier([binary_pair([0.0, 1.0])])
    assert result.value == 1.0
    assert result.counts["skill"] == pytest.approx(-2.6)


def test_brier_all_correct_matches_the_constant_baseline() -> None:
    result = trust_brier([all_correct()])
    assert result.value == pytest.approx(4 / 9)
    assert result.counts["baseline"] == pytest.approx(4 / 9)
    assert result.counts["skill"] == pytest.approx(0.0)


def test_brier_calibrated_pool() -> None:
    result = trust_brier(fixture_records())
    assert result.value == pytest.approx(2 / 9)
    assert result.counts["baseline"] == pytest.approx(13 / 54)
    assert result.counts["skill"] == pytest.approx(1 / 13)


def test_brier_without_trust_is_not_applicable() -> None:
    record = all_correct()
    record["trust_for_positions"] = None
    record["trust_trajectory"] = None
    record["final_trust"] = None
    result = trust_brier([record])
    assert result.value is None
    assert result.counts["n_no_trust"] == 1


# --------------------------------------------------------------------------- #
# Facade and MetricSummary wiring
# --------------------------------------------------------------------------- #


def test_summarize_endpoints_contains_every_endpoint() -> None:
    payload = summarize_endpoints(fixture_records(), strict=True)
    assert payload["n_records"] == 6
    assert set(payload["endpoints"]) == set(REQUIRED_ENDPOINTS)
    assert all(result["status"] == "ok" for result in payload["endpoints"].values())
    assert payload["endpoints"]["final_answer_accuracy"]["value"] == 0.5
    assert payload["endpoints"]["cmr"]["value"] == 0.5
    assert payload["endpoints"]["ccr0"]["value"] == 0.5
    assert payload["endpoints"]["ccr_e"]["value"] == pytest.approx(1 / 3)
    assert payload["endpoints"]["mpr_weighted"]["value"] == 0.5
    assert payload["endpoints"]["arr"]["value"] == 0.5
    assert payload["endpoints"]["trust_auroc"]["value"] == pytest.approx(5 / 6)
    assert payload["endpoints"]["trust_brier"]["value"] == pytest.approx(2 / 9)


def test_summarize_endpoints_records_errors_leniently_and_raises_in_strict_mode() -> None:
    records = [all_correct(), missing_final_answer()]
    with pytest.raises(EndpointError, match="final_answer"):
        summarize_endpoints(records, strict=True)
    payload = summarize_endpoints(records)
    accuracy = payload["endpoints"]["final_answer_accuracy"]
    assert accuracy["status"] == "error"
    assert accuracy["value"] is None
    assert "final_answer" in accuracy["reason"]
    # The other endpoints still report real values for the usable record.
    assert payload["endpoints"]["mpr_weighted"]["status"] == "ok"


def test_summarize_endpoints_empty_is_all_not_applicable() -> None:
    payload = summarize_endpoints([])
    assert payload["n_records"] == 0
    assert set(payload["endpoints"]) == set(REQUIRED_ENDPOINTS)
    assert all(result["status"] == "not_applicable" for result in payload["endpoints"].values())
    assert all(result["value"] is None for result in payload["endpoints"].values())


def test_metric_summary_keeps_legacy_fields_and_adds_endpoints() -> None:
    summary = summarize(fixture_records())
    payload = summary.as_dict()
    for key in (
        "n_debates",
        "n_divergent",
        "n_exposed",
        "n_collapse",
        "n_switched_to_consensus",
        "ccr",
        "mpr",
    ):
        assert key in payload
    assert payload["accuracy"] == 0.5
    assert payload["n_correct"] == 3
    assert payload["n_scored"] == 6
    assert payload["accuracy_ci_low"] < 0.5 < payload["accuracy_ci_high"]
    assert payload["accuracy_status"] == "ok"
    assert set(payload["endpoints"]) == set(REQUIRED_ENDPOINTS)


def test_metric_summary_flags_missing_final_answer_instead_of_zero() -> None:
    payload = summarize([missing_final_answer()]).as_dict()
    assert payload["accuracy"] is None
    assert payload["accuracy_status"] == "error"
    assert payload["n_correct"] == 0


def test_ecr_is_marked_deprecated() -> None:
    assert "DEPRECATED" in (ecr.__doc__ or "")
