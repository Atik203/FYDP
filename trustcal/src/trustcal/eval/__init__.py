"""Evaluation harness: datasets, metrics (CCR/MPR/ECR), baselines B1–B9 (+B10)."""

from .answers import canonical, distinct_answers, is_correct, majority_answer, normalize, same_answer
from .baselines import BASELINES
from .datasets import load_dataset
from .metrics import ccr, ecr, mpr

__all__ = [
    "ccr",
    "mpr",
    "ecr",
    "load_dataset",
    "BASELINES",
    "normalize",
    "same_answer",
    "is_correct",
    "canonical",
    "distinct_answers",
    "majority_answer",
]
