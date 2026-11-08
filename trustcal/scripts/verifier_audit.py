"""Verifier audit harness (P0-6 / WP-08).

    python scripts/verifier_audit.py make --pairs pairs.jsonl --out results/verifier-audit
    python scripts/verifier_audit.py score --rater1 .../rater1.csv --rater2 .../rater2.csv \
        --gold pairs.jsonl [--pred verifier_labels.jsonl]

`make` writes two blind rater sheets (CSV by default, JSONL with --format) plus a
codebook. `score` reports Cohen's kappa between the raters, then balanced
accuracy / precision / recall / F1 / coverage for the predictions against the
reference. Exit codes: 0 target met, 2 below target, 1 usage or data error.

Definitions used by `score` (also in the codebook):

* reference: ``--gold`` labels when given, else the rater consensus (items where
  both annotators agree; disagreements are reported, not silently dropped).
* prediction: ``--pred`` when given, else rater 1.
* coverage: share of pairs with a non-abstaining prediction (label !=
  ``unverifiable``); accuracy and balanced accuracy are conditional on coverage,
  so abstention is reported instead of being scored as an error.
* balanced accuracy: mean per-class recall over the classes present in the
  reference (unverifiable included when it appears).
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
import math
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from trustcal.eval.agreement import cohen_kappa  # noqa: E402
from trustcal.retrieval.verifier import UNVERIFIABLE, VERDICTS  # noqa: E402

LABELS = list(VERDICTS)
SHEET_FIELDS = ["pair_id", "claim", "passages", "label", "confidence", "notes"]
DEFAULT_MIN_KAPPA = 0.60
DEFAULT_MIN_BALANCED_ACCURACY = 0.75


class AuditError(ValueError):
    """Bad input data: the CLI maps it to exit 1, never a traceback."""


# --------------------------------------------------------------------------- #
# reading
# --------------------------------------------------------------------------- #


def _read_jsonl(path: Path) -> list[dict]:
    rows: list[dict] = []
    with Path(path).open(encoding="utf-8") as handle:
        for line_no, line in enumerate(handle, start=1):
            line = line.strip()
            if not line:
                continue
            try:
                value = json.loads(line)
            except json.JSONDecodeError as exc:
                raise AuditError(f"{path}:{line_no}: invalid JSON ({exc.msg})") from exc
            if not isinstance(value, dict):
                raise AuditError(f"{path}:{line_no}: expected a JSON object")
            rows.append(value)
    return rows


def _normalise_label(value: object, where: str) -> str:
    label = str(value or "").strip().lower()
    if label and label not in LABELS:
        raise AuditError(f"{where}: unknown label {value!r}; expected one of {', '.join(LABELS)}")
    return label


def read_pairs(path: Path) -> list[dict]:
    """Validate a pairs JSONL file: id, claim, passages[], gold_label."""
    path = Path(path)
    pairs: list[dict] = []
    seen: set[str] = set()
    for index, row in enumerate(_read_jsonl(path), start=1):
        pair_id = str(row.get("id") or row.get("pair_id") or "").strip()
        if not pair_id:
            raise AuditError(f"{path}: pair {index} has no id")
        if pair_id in seen:
            raise AuditError(f"{path}: duplicate id {pair_id!r}")
        seen.add(pair_id)
        claim = str(row.get("claim") or "").strip()
        if not claim:
            raise AuditError(f"{path}: pair {pair_id!r} has no claim")
        passages = row.get("passages")
        if not isinstance(passages, list) or any(not isinstance(p, str) for p in passages):
            raise AuditError(f"{path}: pair {pair_id!r} needs passages as a list of strings")
        gold = _normalise_label(row.get("gold_label"), f"{path}: pair {pair_id!r} gold_label")
        if not gold:
            raise AuditError(f"{path}: pair {pair_id!r} has no gold_label")
        pairs.append({"id": pair_id, "claim": claim, "passages": list(passages), "gold_label": gold})
    if not pairs:
        raise AuditError(f"{path}: no pairs found")
    return pairs


def read_sheet(path: Path) -> dict[str, str]:
    """Read a rater/prediction sheet (.csv, .tsv or .jsonl) as pair_id -> label.

    Blank labels are allowed here so `make` output can be read back; `evaluate`
    rejects them. CSV is read with utf-8-sig so an Excel round-trip keeps the
    first header intact.
    """
    path = Path(path)
    suffix = path.suffix.lower()
    if suffix in {".csv", ".tsv"}:
        delimiter = "\t" if suffix == ".tsv" else ","
        with path.open(newline="", encoding="utf-8-sig") as handle:
            rows = list(csv.DictReader(handle, delimiter=delimiter))
    elif suffix == ".jsonl":
        rows = _read_jsonl(path)
    else:
        raise AuditError(f"{path}: sheet must be .csv, .tsv or .jsonl")

    labels: dict[str, str] = {}
    for index, row in enumerate(rows, start=1):
        pair_id = str(row.get("pair_id") or row.get("id") or "").strip()
        if not pair_id:
            if not any(value for value in (row or {}).values() if value):
                continue  # trailing blank spreadsheet row
            raise AuditError(f"{path}: row {index} has no pair_id")
        if pair_id in labels:
            raise AuditError(f"{path}: duplicate pair_id {pair_id!r}")
        labels[pair_id] = _normalise_label(row.get("label"), f"{path}: pair {pair_id!r}")
    if not labels:
        raise AuditError(f"{path}: no rows found")
    return labels


# --------------------------------------------------------------------------- #
# sheets
# --------------------------------------------------------------------------- #


def passage_block(passages: list[str]) -> str:
    if not passages:
        return "(no passages retrieved)"
    return "\n\n".join(f"[p{index}] {text}" for index, text in enumerate(passages))


def codebook_text() -> str:
    return """# Verifier audit codebook (P0-6)

You are labelling **claim-passage pairs** for the trust-calibrated debate
pipeline. One row is one claim and the passages a retriever returned for it.
Your label decides whether that evidence supports the claim. It does **not**
decide whether the claim is true in the world, or whether the final answer is
right.

Fill the `label` column of your sheet. Use exactly one of:

| Label | Use it when |
|---|---|
| `supported` | At least one passage states the claim, and no passage contradicts it. |
| `contradicted` | At least one passage states the claim is false: opposite result, different number, negated relation, or a different entity. |
| `unverifiable` | There are no usable passages, the passages are off-topic, or they only share words with the claim. |

## Decision procedure

1. Read the claim once, literally. Identify its subject, predicate and any
   number, unit, direction or polarity.
2. Read every passage. Check for a refutation first: a passage that says the
   opposite, gives a different number, or denies the relation is
   `contradicted`, even if another passage agrees.
3. If nothing refutes it, look for one passage that entails the claim as
   written. Paraphrase and synonyms count; a broader topic does not.
4. If neither holds, answer `unverifiable`. Abstaining is correct and useful;
   do not guess.

## Rules

- Label the claim as written. Do not correct it, and do not use outside
  knowledge; judge only the passages.
- A passage that mentions the topic but does not state the relation is not
  support. "The trial enrolled 120 adults" does not support "the drug lowered
  blood pressure".
- Numbers must match after unit conversion. `100 degrees Celsius` and
  `212 degrees Fahrenheit` agree; `90` and `100` do not.
- Negation flips the label: "does not inhibit" contradicts "inhibits".
- Empty or missing passages are always `unverifiable`.
- Support needs both directions: the passages must entail the claim **and** the
  claim must be consistent with them. A passage that supports half of a
  two-part claim is not enough.
- Do not discuss rows with the other annotator before both sheets are
  submitted. Disagreements are adjudicated afterwards by the supervisor.

## Sampling protocol (150-200 pairs)

- Candidate pool: SciFact dev claims paired with their retrieved or gold
  evidence, plus pipeline claims from the B8 retrieval arm.
- Stratify to at least 40 `supported`, 40 `contradicted` and 40
  `unverifiable`; include about 20 empty-passage negatives and 20
  topical-but-non-supporting passages. Balanced classes are required for
  balanced accuracy to mean anything.
- Two annotators label every pair independently. The `gold_label` column stays
  in `pairs.jsonl` and is never copied into a rater sheet.
- Report Cohen's kappa between annotators and balanced accuracy of the
  verifier against the adjudicated labels.
  Targets: kappa >= 0.60 and balanced accuracy >= 0.75.
  Below 0.60 balanced accuracy, swap lexical for NLI or the
  LLM judge and re-audit before any trust-arm claim.

## Filling the sheet

- Keep `pair_id`, `claim` and `passages` unchanged; they join the sheets.
- `label`: `supported`, `contradicted` or `unverifiable` (lowercase).
- `confidence`: optional 0-1, your own certainty.
- `notes`: optional; use it for adjudication questions, not for the label.

Score with:

    python scripts/verifier_audit.py score --rater1 rater1.csv --rater2 rater2.csv --gold pairs.jsonl
"""


def write_sheets(pairs: list[dict], out_dir: Path, fmt: str = "csv") -> list[Path]:
    """Write rater1/rater2 sheets with blank labels plus the codebook."""
    out_dir = Path(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    suffix = ".jsonl" if fmt == "jsonl" else ".csv"
    written: list[Path] = []
    for rater in ("rater1", "rater2"):
        path = out_dir / f"{rater}{suffix}"
        if suffix == ".csv":
            with path.open("w", newline="", encoding="utf-8") as handle:
                writer = csv.DictWriter(handle, fieldnames=SHEET_FIELDS)
                writer.writeheader()
                for pair in pairs:
                    writer.writerow(
                        {
                            "pair_id": pair["id"],
                            "claim": pair["claim"],
                            "passages": passage_block(pair["passages"]),
                            "label": "",
                            "confidence": "",
                            "notes": "",
                        }
                    )
        else:
            with path.open("w", encoding="utf-8") as handle:
                for pair in pairs:
                    handle.write(
                        json.dumps(
                            {
                                "pair_id": pair["id"],
                                "claim": pair["claim"],
                                "passages": pair["passages"],
                                "label": "",
                                "confidence": None,
                                "notes": "",
                            },
                            ensure_ascii=False,
                        )
                        + "\n"
                    )
        written.append(path)

    codebook = out_dir / "codebook.md"
    codebook.write_text(codebook_text(), encoding="utf-8")
    written.append(codebook)

    manifest = {
        "n_pairs": len(pairs),
        "labels": LABELS,
        "pairs_sha256": hashlib.sha256(
            json.dumps(pairs, sort_keys=True, ensure_ascii=False).encode("utf-8")
        ).hexdigest(),
    }
    manifest_path = out_dir / "manifest.json"
    manifest_path.write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    written.append(manifest_path)
    return written


# --------------------------------------------------------------------------- #
# metrics
# --------------------------------------------------------------------------- #


def compute_metrics(reference: list[str], predicted: list[str]) -> dict:
    """Balanced accuracy / P-R-F1 / coverage for one label sequence.

    Metrics are conditional on coverage: pairs predicted ``unverifiable`` are
    excluded from accuracy, precision, recall and F1, and reported through
    ``coverage`` and the confusion matrix instead.
    """
    if len(reference) != len(predicted):
        raise AuditError(f"length mismatch: {len(reference)} references vs {len(predicted)} predictions")
    if not reference:
        raise AuditError("no pairs to score")
    for value in reference:
        if value not in LABELS:
            raise AuditError(f"unknown reference label {value!r}")
    for value in predicted:
        if value not in LABELS:
            raise AuditError(f"unknown predicted label {value!r}")

    n_total = len(reference)
    confusion = {gold: {pred: 0 for pred in LABELS} for gold in LABELS}
    for gold, pred in zip(reference, predicted):
        confusion[gold][pred] += 1

    covered = [(gold, pred) for gold, pred in zip(reference, predicted) if pred != UNVERIFIABLE]
    n_covered = len(covered)
    per_class: dict[str, dict] = {}
    raw: dict[str, tuple[float, float, float]] = {}
    for label in LABELS:
        true_positive = sum(1 for gold, pred in covered if gold == label and pred == label)
        support = sum(1 for gold, _ in covered if gold == label)
        predicted_n = sum(1 for _, pred in covered if pred == label)
        precision = true_positive / predicted_n if predicted_n else 0.0
        recall = true_positive / support if support else 0.0
        f1 = 2 * precision * recall / (precision + recall) if (precision + recall) else 0.0
        raw[label] = (precision, recall, f1)
        per_class[label] = {
            "support": support,
            "predicted": predicted_n,
            "precision": round(precision, 4),
            "recall": round(recall, 4),
            "f1": round(f1, 4),
        }

    present = [label for label in LABELS if per_class[label]["support"] > 0]
    has_predictions = any(per_class[label]["predicted"] > 0 for label in LABELS)
    if n_covered and present and has_predictions:
        balanced_accuracy = sum(raw[label][1] for label in present) / len(present)
        macro_precision = sum(raw[label][0] for label in present) / len(present)
        macro_recall = sum(raw[label][1] for label in present) / len(present)
        macro_f1 = sum(raw[label][2] for label in present) / len(present)
        accuracy = sum(1 for gold, pred in covered if gold == pred) / n_covered
    else:  # everything abstained: well-defined zeros, coverage exposes it
        balanced_accuracy = macro_precision = macro_recall = macro_f1 = accuracy = 0.0

    return {
        "n_total": n_total,
        "n_covered": n_covered,
        "coverage": round(n_covered / n_total, 4),
        "accuracy": round(accuracy, 4),
        "balanced_accuracy": round(balanced_accuracy, 4),
        "macro_precision": round(macro_precision, 4),
        "macro_recall": round(macro_recall, 4),
        "macro_f1": round(macro_f1, 4),
        "per_class": per_class,
        "confusion": confusion,
    }


def evaluate(
    rater1: dict[str, str],
    rater2: dict[str, str],
    *,
    gold: dict[str, str] | None = None,
    pred: dict[str, str] | None = None,
    min_kappa: float = DEFAULT_MIN_KAPPA,
    min_balanced_accuracy: float = DEFAULT_MIN_BALANCED_ACCURACY,
) -> dict:
    """Full audit report: inter-rater kappa + prediction metrics + gate."""
    if set(rater1) != set(rater2):
        only1 = sorted(set(rater1) - set(rater2))[:3]
        only2 = sorted(set(rater2) - set(rater1))[:3]
        raise AuditError(
            f"rater sheets cover different pairs (only rater1: {only1}, only rater2: {only2})"
        )
    ids = list(rater1)
    if not ids:
        raise AuditError("no pairs in the rater sheets")
    unlabelled = [pair_id for pair_id in ids if not rater1[pair_id] or not rater2[pair_id]]
    if unlabelled:
        raise AuditError(
            f"{len(unlabelled)} unlabelled rows (e.g. {unlabelled[0]}); every row needs a label"
        )
    for pair_id in ids:
        for name, labels in (("rater1", rater1), ("rater2", rater2)):
            if labels[pair_id] not in LABELS:
                raise AuditError(f"{name} pair {pair_id!r}: unknown label {labels[pair_id]!r}")

    kappa = cohen_kappa([rater1[i] for i in ids], [rater2[i] for i in ids])
    kappa_value = None if math.isnan(kappa) else round(kappa, 4)
    agree = sum(1 for pair_id in ids if rater1[pair_id] == rater2[pair_id])
    disagreements = [pair_id for pair_id in ids if rater1[pair_id] != rater2[pair_id]]
    consensus = {pair_id: rater1[pair_id] for pair_id in ids if rater1[pair_id] == rater2[pair_id]}

    if gold is not None:
        if set(gold) != set(ids):
            missing = sorted(set(ids) - set(gold))[:3]
            extra = sorted(set(gold) - set(ids))[:3]
            raise AuditError(f"--gold does not match the sheets (missing: {missing}, extra: {extra})")
        reference_name, reference = "gold", dict(gold)
    elif pred is not None:
        reference_name, reference = "consensus", consensus
    else:
        reference_name, reference = None, None

    if pred is not None and set(pred) != set(ids):
        missing = sorted(set(ids) - set(pred))[:3]
        extra = sorted(set(pred) - set(ids))[:3]
        raise AuditError(f"--pred does not match the sheets (missing: {missing}, extra: {extra})")

    failures: list[str] = []
    metrics = None
    if reference is not None:
        scored_ids = [pair_id for pair_id in ids if pair_id in reference]
        prediction = pred if pred is not None else rater1
        metrics = compute_metrics(
            [reference[pair_id] for pair_id in scored_ids],
            [prediction[pair_id] for pair_id in scored_ids],
        )
        if metrics["balanced_accuracy"] < min_balanced_accuracy:
            failures.append(
                f"balanced_accuracy {metrics['balanced_accuracy']} < {min_balanced_accuracy}"
            )
    if kappa_value is None or kappa_value < min_kappa:
        failures.append(f"kappa {kappa_value} < {min_kappa}")

    return {
        "n_pairs": len(ids),
        "inter_rater": {
            "n": len(ids),
            "agree": agree,
            "disagreements": len(disagreements),
            "kappa": kappa_value,
        },
        "reference": reference_name,
        "prediction": (
            "pred" if pred is not None else ("rater1" if reference is not None else None)
        ),
        "metrics": metrics,
        "thresholds": {"kappa": min_kappa, "balanced_accuracy": min_balanced_accuracy},
        "target_met": not failures,
        "failures": failures,
        **({"note": "no --gold/--pred: accuracy metrics skipped"} if reference is None else {}),
    }


# --------------------------------------------------------------------------- #
# CLI
# --------------------------------------------------------------------------- #


class _Parser(argparse.ArgumentParser):
    """argparse exits 2 on usage errors; this gate reserves 2 for below-target."""

    def error(self, message: str) -> None:  # type: ignore[override]
        self.print_usage(sys.stderr)
        print(f"{self.prog}: error: {message}", file=sys.stderr)
        raise SystemExit(1)


def _labels_from_pairs(pairs: list[dict]) -> dict[str, str]:
    return {pair["id"]: pair["gold_label"] for pair in pairs}


def build_parser() -> argparse.ArgumentParser:
    parser = _Parser(description="Verifier audit harness (P0-6)")
    sub = parser.add_subparsers(dest="cmd", required=True)

    make = sub.add_parser("make", help="write two blind rater sheets + codebook")
    make.add_argument("--pairs", required=True, help="pairs.jsonl: {id, claim, passages, gold_label}")
    make.add_argument("--out", required=True, help="output directory")
    make.add_argument("--format", choices=("csv", "jsonl"), default="csv")

    score = sub.add_parser("score", help="kappa + accuracy from filled-in sheets")
    score.add_argument("--rater1", required=True)
    score.add_argument("--rater2", required=True)
    score.add_argument("--gold", default=None, help="pairs.jsonl with gold_label (reference)")
    score.add_argument("--pred", default=None, help="verifier labels (.csv/.jsonl) to score")
    score.add_argument("--min-kappa", type=float, default=DEFAULT_MIN_KAPPA)
    score.add_argument("--min-balanced-accuracy", type=float, default=DEFAULT_MIN_BALANCED_ACCURACY)
    return parser


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)

    if args.cmd == "make":
        try:
            pairs = read_pairs(Path(args.pairs))
            written = write_sheets(pairs, Path(args.out), fmt=args.format)
        except (OSError, AuditError, ValueError) as exc:
            print(f"error: {exc}", file=sys.stderr)
            return 1
        print(json.dumps({"n_pairs": len(pairs), "wrote": [str(path) for path in written]}, indent=2))
        return 0

    try:
        rater1 = read_sheet(Path(args.rater1))
        rater2 = read_sheet(Path(args.rater2))
        gold = _labels_from_pairs(read_pairs(Path(args.gold))) if args.gold else None
        pred = read_sheet(Path(args.pred)) if args.pred else None
        report = evaluate(
            rater1,
            rater2,
            gold=gold,
            pred=pred,
            min_kappa=args.min_kappa,
            min_balanced_accuracy=args.min_balanced_accuracy,
        )
    except (OSError, AuditError, ValueError) as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 1

    print(json.dumps(report, indent=2))
    return 0 if report["target_met"] else 2


if __name__ == "__main__":
    sys.exit(main())
