"""Evaluation harness: datasets, metrics (CCR/MPR/ECR), baselines B1–B10."""

from .answers import canonical, distinct_answers, is_correct, majority_answer, normalize, same_answer
from .baselines import APPROXIMATIONS, BASELINES, DEFERRED, IMPLEMENTED, RUNNER_ARMS, arm_for
from .datasets import load_dataset
from .failures import TAXONOMY, classify_failure, failure_counts, failure_examples
from .metrics import (
    DebateMetrics,
    MetricSummary,
    brier_score,
    ccr,
    ecr,
    evaluate_debate,
    mpr,
    summarize,
)
from .pilot import load_pilot_questions, pilot_verdict, score_pilot, validate_question
from .stats import (
    bootstrap_ci,
    cohens_d,
    holm_bonferroni,
    mcnemar,
    paired_bootstrap_ci,
    summarize as summarize_values,
)

__all__ = [
    "ccr",
    "mpr",
    "ecr",
    "brier_score",
    "evaluate_debate",
    "summarize",
    "DebateMetrics",
    "MetricSummary",
    "load_dataset",
    "BASELINES",
    "DEFERRED",
    "IMPLEMENTED",
    "APPROXIMATIONS",
    "RUNNER_ARMS",
    "arm_for",
    "normalize",
    "same_answer",
    "is_correct",
    "canonical",
    "distinct_answers",
    "majority_answer",
    "classify_failure",
    "failure_counts",
    "failure_examples",
    "TAXONOMY",
    "validate_question",
    "load_pilot_questions",
    "pilot_verdict",
    "score_pilot",
    "bootstrap_ci",
    "paired_bootstrap_ci",
    "cohens_d",
    "mcnemar",
    "holm_bonferroni",
    "summarize_values",
]
