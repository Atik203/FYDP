"""Evaluation harness: datasets, metrics (CCR/MPR/ECR), baselines B1–B9 (+B10)."""

from .answers import canonical, distinct_answers, is_correct, majority_answer, normalize, same_answer
from .baselines import BASELINES, DEFERRED, RUNNER_ARMS, arm_for
from .datasets import load_dataset
from .metrics import DebateMetrics, MetricSummary, ccr, ecr, evaluate_debate, mpr, summarize

__all__ = [
    "ccr",
    "mpr",
    "ecr",
    "evaluate_debate",
    "summarize",
    "DebateMetrics",
    "MetricSummary",
    "load_dataset",
    "BASELINES",
    "DEFERRED",
    "RUNNER_ARMS",
    "arm_for",
    "normalize",
    "same_answer",
    "is_correct",
    "canonical",
    "distinct_answers",
    "majority_answer",
]
