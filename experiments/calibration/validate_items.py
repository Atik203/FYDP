"""Validate EG-SSS calibration items, build blind sheets, and score the gate.

    python experiments/calibration/validate_items.py check \
        --items experiments/calibration/items.seed.jsonl
    python experiments/calibration/validate_items.py sheets \
        --items experiments/calibration/private/items.jsonl \
        --out experiments/calibration/private/sheets
    python experiments/calibration/validate_items.py score \
        --rater1 .../rater1.csv --rater2 .../rater2.csv \
        --adjudication .../adjudication.csv --effort .../effort.csv

`check` is structural: an unfilled seed batch passes, while `--strict` fails
until every slot is authored. `sheets` never exports the gold verdict, so the
two raters stay blind. `score` exits 0 only when the supplied gates pass, 2 when
one fails, and 1 when the input is incomplete (the blocked case).
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
import math
import sys
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

REPO_ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(REPO_ROOT / "trustcal" / "src"))

from trustcal.eval.agreement import agreement_report  # noqa: E402

STRATA = ("biomedical", "physics_chemistry", "math_cs")
STATUSES = ("unfilled", "drafted", "annotated", "adjudicated", "frozen")
VERDICTS = ("support", "contradict", "neutral")
CONDITIONS = (
    "evidence_available",
    "evidence_absent",
    "evidence_placebo",
    "evidence_contradictory",
)
SHEET_FIELDS = (
    "item_id",
    "claim_id",
    "stratum",
    "claim",
    "evidence_passage_ids",
    "evidence_text",
    "verdict",
    "confidence",
    "notes",
)
ADJUDICATION_FIELDS = SHEET_FIELDS + (
    "rater1_verdict",
    "rater2_verdict",
    "agreement",
    "adjudicated_verdict",
    "adjudication_notes",
    "defect_flag",
    "defect_type",
)
EFFORT_FIELDS = ("item_id", "phase", "minutes", "annotator", "notes")


class InputError(ValueError):
    """Bad input data; the CLI maps it to exit 1, never a traceback."""


# --------------------------------------------------------------------------- #
# reading
# --------------------------------------------------------------------------- #


def load_items(path: Path) -> list[dict]:
    """Read a JSONL batch or a JSON list/object with an ``items`` list."""
    path = Path(path)
    if not path.is_file():
        raise InputError(f"not a readable file: {path}")
    suffix = path.suffix.lower()
    if suffix == ".jsonl":
        rows: list[dict] = []
        with path.open(encoding="utf-8") as handle:
            for line_no, line in enumerate(handle, start=1):
                line = line.strip()
                if not line:
                    continue
                try:
                    value = json.loads(line)
                except json.JSONDecodeError as exc:
                    raise InputError(f"{path}:{line_no}: invalid JSON ({exc.msg})") from exc
                if not isinstance(value, dict):
                    raise InputError(f"{path}:{line_no}: expected a JSON object")
                rows.append(value)
        return rows
    if suffix == ".json":
        try:
            value = json.loads(path.read_text(encoding="utf-8"))
        except json.JSONDecodeError as exc:
            raise InputError(f"{path}: invalid JSON ({exc.msg})") from exc
        if isinstance(value, dict) and isinstance(value.get("items"), list):
            value = value["items"]
        elif isinstance(value, dict):
            value = [value]
        if not isinstance(value, list):
            raise InputError(f"{path}: expected a JSON list or an object with an 'items' list")
        if not all(isinstance(row, dict) for row in value):
            raise InputError(f"{path}: every item must be a JSON object")
        return list(value)
    raise InputError(f"{path}: expected .jsonl or .json")


def _text(value: object) -> str:
    return str(value).strip() if value is not None else ""


def _number(value: object, where: str) -> float:
    try:
        number = float(value)  # type: ignore[arg-type]
    except (TypeError, ValueError) as exc:
        raise InputError(f"{where}: expected a number, got {value!r}") from exc
    if not math.isfinite(number):
        raise InputError(f"{where}: expected a finite number, got {value!r}")
    return number


# --------------------------------------------------------------------------- #
# validation
# --------------------------------------------------------------------------- #


def _validate_evidence(evidence: object, where: str, errors: list[str], passage_ids: set[str]) -> int:
    if not isinstance(evidence, dict):
        errors.append(f"{where}: evidence must be an object")
        return 0
    passage_id = _text(evidence.get("passage_id"))
    if not passage_id:
        errors.append(f"{where}: missing passage_id")
    elif passage_id in passage_ids:
        errors.append(f"{where}: duplicate passage_id {passage_id!r}")
    else:
        passage_ids.add(passage_id)
    for field in ("text", "source", "locator", "retrieved_at", "license"):
        if not _text(evidence.get(field)):
            errors.append(f"{where}: missing {field}")
    return 1


def _validate_claim(
    claim: object,
    where: str,
    errors: list[str],
    claim_ids: set[str],
    passage_ids: set[str],
) -> tuple[int, int]:
    if not isinstance(claim, dict):
        errors.append(f"{where}: claim must be an object")
        return 0, 0
    claim_id = _text(claim.get("claim_id"))
    if not claim_id:
        errors.append(f"{where}: missing claim_id")
    elif claim_id in claim_ids:
        errors.append(f"{where}: duplicate claim_id {claim_id!r}")
    else:
        claim_ids.add(claim_id)
    if not _text(claim.get("text")):
        errors.append(f"{where}: missing claim text")
    if claim.get("atomic") is not True:
        errors.append(f"{where}: atomic must be true; split compound claims")
    verdict = _text(claim.get("gold_verdict")).lower()
    if verdict not in VERDICTS:
        errors.append(f"{where}: gold_verdict must be one of {', '.join(VERDICTS)}")
    confidence = claim.get("gold_confidence")
    try:
        confidence_value = _number(confidence, f"{where}.gold_confidence")
        if not 0.0 <= confidence_value <= 1.0:
            errors.append(f"{where}: gold_confidence must be within [0, 1]")
    except InputError as exc:
        errors.append(str(exc))
    if not _text(claim.get("verdict_rationale")):
        errors.append(f"{where}: missing verdict_rationale")

    evidence = claim.get("evidence")
    if not isinstance(evidence, list) or not evidence:
        errors.append(f"{where}: evidence must be a non-empty list")
        return 1, 0
    n_passages = 0
    for index, passage in enumerate(evidence):
        n_passages += _validate_evidence(
            passage, f"{where}.evidence[{index}]", errors, passage_ids
        )
    return 1, n_passages


def _validate_item(
    item: dict,
    index: int,
    errors: list[str],
    warnings: list[str],
    claim_ids: set[str],
    passage_ids: set[str],
) -> tuple[int, int, int]:
    """Return ``(claims, passages, authored)`` for one item."""
    where = f"item {index}"
    if item.get("template") is True:
        return 0, 0, 0

    item_id = _text(item.get("item_id"))
    if not item_id:
        errors.append(f"{where}: missing item_id")
    else:
        where = f"item {item_id!r}"
    stratum = _text(item.get("stratum"))
    if stratum not in STRATA:
        errors.append(f"{where}: stratum must be one of {', '.join(STRATA)}")
    status = _text(item.get("status"))
    if status not in STATUSES:
        errors.append(f"{where}: status must be one of {', '.join(STATUSES)}")
    if status == "unfilled":
        warnings.append(f"{where}: unfilled slot")
        return 0, 0, 0

    if item.get("schema_version") != "egsss-item-v0.1":
        errors.append(f"{where}: schema_version must be 'egsss-item-v0.1'")
    if not _text(item.get("question")):
        errors.append(f"{where}: missing question")
    if not _text(item.get("gold_answer")):
        errors.append(f"{where}: missing gold_answer")
    options = item.get("options")
    if options is not None and (
        not isinstance(options, list) or len(options) < 2 or not all(isinstance(o, str) for o in options)
    ):
        errors.append(f"{where}: options must be null or a list of at least two strings")
    source = item.get("source")
    if not isinstance(source, dict):
        errors.append(f"{where}: source must be an object")
    else:
        kind = _text(source.get("kind"))
        if kind not in ("original", "adapted"):
            errors.append(f"{where}: source.kind must be 'original' or 'adapted'")
        if not _text(source.get("license")):
            errors.append(f"{where}: source.license is required")
        if kind == "adapted":
            for field in ("citation", "locator", "changes"):
                if not _text(source.get(field)):
                    errors.append(f"{where}: source.{field} is required for adapted items")
    if not isinstance(item.get("pressure_eligible"), bool):
        errors.append(f"{where}: pressure_eligible must be a boolean")
    minority = item.get("minority_agent")
    if minority is not None and minority not in (0, 1, 2):
        errors.append(f"{where}: minority_agent must be 0, 1, 2, or null")
    conditions = item.get("conditions")
    if not isinstance(conditions, list) or any(c not in CONDITIONS for c in conditions):
        errors.append(f"{where}: conditions must be a list drawn from {', '.join(CONDITIONS)}")

    positions = item.get("positions")
    if not isinstance(positions, list) or len(positions) != 3:
        errors.append(f"{where}: positions must contain exactly three agent positions")
        return 0, 0, 1
    seen_agents: set[int] = set()
    n_claims = 0
    n_passages = 0
    for p_index, position in enumerate(positions):
        p_where = f"{where}.positions[{p_index}]"
        if not isinstance(position, dict):
            errors.append(f"{p_where}: position must be an object")
            continue
        agent = position.get("agent")
        if agent not in (0, 1, 2):
            errors.append(f"{p_where}: agent must be 0, 1, or 2")
        elif agent in seen_agents:
            errors.append(f"{p_where}: duplicate agent {agent}")
        else:
            seen_agents.add(agent)
        claims = position.get("claims")
        if not isinstance(claims, list):
            errors.append(f"{p_where}: claims must be a list")
            continue
        if not 3 <= len(claims) <= 6:
            errors.append(f"{p_where}: expected 3-6 atomic claims, got {len(claims)}")
        for c_index, claim in enumerate(claims):
            c_claims, c_passages = _validate_claim(
                claim,
                f"{p_where}.claims[{c_index}]",
                errors,
                claim_ids,
                passage_ids,
            )
            n_claims += c_claims
            n_passages += c_passages
    if seen_agents != {0, 1, 2}:
        errors.append(f"{where}: agent positions must cover 0, 1, and 2")
    return n_claims, n_passages, 1


def validate_batch(items: list[dict]) -> dict:
    """Validate a batch and return the report used by `check` and `sheets`."""
    errors: list[str] = []
    warnings: list[str] = []
    claim_ids: set[str] = set()
    passage_ids: set[str] = set()
    item_ids: set[str] = set()
    per_stratum: Counter[str] = Counter()
    verdicts: Counter[str] = Counter()
    n_claims = 0
    n_passages = 0
    n_authored = 0
    n_templates = 0
    n_unfilled = 0

    for index, item in enumerate(items, start=1):
        if item.get("template") is True:
            n_templates += 1
            continue
        item_id = _text(item.get("item_id"))
        if item_id:
            if item_id in item_ids:
                errors.append(f"item {index}: duplicate item_id {item_id!r}")
            item_ids.add(item_id)
        stratum = _text(item.get("stratum"))
        if stratum in STRATA:
            per_stratum[stratum] += 1
        if _text(item.get("status")) == "unfilled":
            n_unfilled += 1
        claims, passages, authored = _validate_item(
            item, index, errors, warnings, claim_ids, passage_ids
        )
        n_claims += claims
        n_passages += passages
        n_authored += authored
        if authored:
            for position in item.get("positions") or []:
                if not isinstance(position, dict):
                    continue
                for claim in position.get("claims") or []:
                    if not isinstance(claim, dict):
                        continue
                    verdict = _text(claim.get("gold_verdict")).lower()
                    if verdict in VERDICTS:
                        verdicts[verdict] += 1

    return {
        "ok": not errors,
        "n_items": len(items),
        "n_templates": n_templates,
        "n_unfilled": n_unfilled,
        "n_authored": n_authored,
        "per_stratum": {name: per_stratum.get(name, 0) for name in STRATA},
        "n_claims": n_claims,
        "n_evidence_passages": n_passages,
        "verdicts": {name: verdicts.get(name, 0) for name in VERDICTS},
        "errors": errors,
        "warnings": warnings,
    }


# --------------------------------------------------------------------------- #
# sheet generation
# --------------------------------------------------------------------------- #


def _write_csv(path: Path, fields: tuple[str, ...], rows: list[dict]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=list(fields), extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)


def _evidence_block(evidence: list[dict]) -> tuple[str, str]:
    ids = "; ".join(_text(passage.get("passage_id")) for passage in evidence)
    text = "\n\n".join(
        f"[{_text(passage.get('passage_id'))}] {_text(passage.get('text'))}"
        for passage in evidence
    )
    return ids, text


def build_sheets(items: list[dict], out_dir: Path) -> dict:
    """Write blind rater sheets, an adjudication workbook, and a manifest."""
    report = validate_batch(items)
    if not report["ok"]:
        raise InputError("refusing to build sheets from an invalid batch: " + "; ".join(report["errors"][:5]))

    rows: list[dict] = []
    for item in items:
        if item.get("template") is True or _text(item.get("status")) == "unfilled":
            continue
        for position in item.get("positions") or []:
            if not isinstance(position, dict):
                continue
            for claim in position.get("claims") or []:
                if not isinstance(claim, dict):
                    continue
                evidence = claim.get("evidence") or []
                passage_ids, passage_text = _evidence_block(evidence)
                rows.append(
                    {
                        "item_id": _text(item.get("item_id")),
                        "claim_id": _text(claim.get("claim_id")),
                        "stratum": _text(item.get("stratum")),
                        "claim": _text(claim.get("text")),
                        "evidence_passage_ids": passage_ids,
                        "evidence_text": passage_text,
                        "verdict": "",
                        "confidence": "",
                        "notes": "",
                    }
                )

    out_dir = Path(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    _write_csv(out_dir / "rater1.csv", SHEET_FIELDS, rows)
    _write_csv(out_dir / "rater2.csv", SHEET_FIELDS, rows)
    _write_csv(
        out_dir / "adjudication.csv",
        ADJUDICATION_FIELDS,
        [
            {
                **row,
                "rater1_verdict": "",
                "rater2_verdict": "",
                "agreement": "",
                "adjudicated_verdict": "",
                "adjudication_notes": "",
                "defect_flag": "",
                "defect_type": "",
            }
            for row in rows
        ],
    )
    effort_path = out_dir / "effort.csv"
    if not effort_path.exists():
        _write_csv(effort_path, EFFORT_FIELDS, [])

    source_hash = hashlib.sha256(
        json.dumps(items, sort_keys=True, ensure_ascii=False).encode("utf-8")
    ).hexdigest()
    manifest = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "n_items": report["n_authored"],
        "n_claims": len(rows),
        "n_evidence_passages": report["n_evidence_passages"],
        "items_sha256": source_hash,
        "verdicts": report["verdicts"],
        "files": {
            "rater1": "rater1.csv",
            "rater2": "rater2.csv",
            "adjudication": "adjudication.csv",
            "effort": "effort.csv",
        },
    }
    (out_dir / "manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    return {"n_rows": len(rows), "out_dir": str(out_dir), "manifest": manifest}


# --------------------------------------------------------------------------- #
# scoring
# --------------------------------------------------------------------------- #


def _read_rows(path: Path, required: tuple[str, ...]) -> list[dict]:
    path = Path(path)
    if not path.is_file():
        raise InputError(f"not a readable file: {path}")
    with path.open(newline="", encoding="utf-8-sig") as handle:
        reader = csv.DictReader(handle)
        fields = tuple(reader.fieldnames or ())
        missing = [field for field in required if field not in fields]
        if missing:
            raise InputError(f"{path}: missing column(s) {', '.join(missing)}")
        return list(reader)


def _labels(path: Path, column: str) -> dict[str, str]:
    labels: dict[str, str] = {}
    for index, row in enumerate(_read_rows(path, ("claim_id", column)), start=2):
        claim_id = _text(row.get("claim_id"))
        if not claim_id:
            raise InputError(f"{path}: row {index} has no claim_id")
        if claim_id in labels:
            raise InputError(f"{path}: duplicate claim_id {claim_id!r}")
        value = _text(row.get(column)).lower()
        if value not in VERDICTS:
            raise InputError(
                f"{path}: claim {claim_id!r} {column}={value!r}; expected one of {', '.join(VERDICTS)}"
            )
        labels[claim_id] = value
    return labels


def _parse_bool(value: object) -> bool:
    return _text(value).lower() in {"1", "true", "yes", "y"}


def score_gate(
    rater1: Path,
    rater2: Path,
    *,
    adjudication: Path | None = None,
    effort: Path | None = None,
    min_kappa: float = 0.75,
    max_defect: float = 0.15,
    max_hours: float = 2.0,
    max_unresolved: float = 0.05,
) -> dict:
    labels1 = _labels(rater1, "verdict")
    labels2 = _labels(rater2, "verdict")
    if set(labels1) != set(labels2):
        only1 = sorted(set(labels1) - set(labels2))[:3]
        only2 = sorted(set(labels2) - set(labels1))[:3]
        raise InputError(f"rater sheets cover different claims (only rater1: {only1}, only rater2: {only2})")
    if not labels1:
        raise InputError("blocked: no labelled claims in the rater sheets")
    claim_ids = sorted(labels1)
    report = agreement_report(
        [labels1[claim_id] for claim_id in claim_ids],
        [labels2[claim_id] for claim_id in claim_ids],
    )
    kappa = report["kappa"]
    kappa_value = None if isinstance(kappa, float) and math.isnan(kappa) else kappa

    result: dict[str, Any] = {
        "n_claims": len(claim_ids),
        "agreement": report,
        "kappa": kappa_value,
        "defect_rate": None,
        "unresolved_rate": None,
        "h_attempt": None,
        "gates": {},
        "failures": [],
    }

    if adjudication is not None:
        rows = _read_rows(
            adjudication,
            ("claim_id", "adjudicated_verdict", "defect_flag"),
        )
        adjudicated: dict[str, str] = {}
        defects = 0
        unresolved = 0
        for index, row in enumerate(rows, start=2):
            claim_id = _text(row.get("claim_id"))
            if not claim_id:
                raise InputError(f"{adjudication}: row {index} has no claim_id")
            value = _text(row.get("adjudicated_verdict")).lower()
            if value == "unresolved":
                unresolved += 1
            elif value not in VERDICTS:
                raise InputError(
                    f"{adjudication}: claim {claim_id!r} adjudicated_verdict={value!r}; "
                    f"expected one of {', '.join(VERDICTS)} or 'unresolved'"
                )
            adjudicated[claim_id] = value
            for field, reference in (
                ("rater1_verdict", labels1.get(claim_id)),
                ("rater2_verdict", labels2.get(claim_id)),
            ):
                recorded = _text(row.get(field)).lower()
                if recorded and recorded != reference:
                    raise InputError(
                        f"{adjudication}: claim {claim_id!r} {field}={recorded!r} "
                        f"does not match the rater sheet ({reference!r})"
                    )
            if _parse_bool(row.get("defect_flag")):
                defects += 1
        if set(adjudicated) != set(claim_ids):
            missing = sorted(set(claim_ids) - set(adjudicated))[:3]
            raise InputError(f"{adjudication}: missing adjudication rows (e.g. {missing})")
        result["defect_rate"] = round(defects / len(claim_ids), 4)
        result["unresolved_rate"] = round(unresolved / len(claim_ids), 4)

    if effort is not None:
        rows = _read_rows(effort, ("item_id", "minutes"))
        total_minutes = 0.0
        items_seen: set[str] = set()
        for index, row in enumerate(rows, start=2):
            item_id = _text(row.get("item_id"))
            if not item_id:
                raise InputError(f"{effort}: row {index} has no item_id")
            minutes = _number(row.get("minutes"), f"{effort}: row {index} minutes")
            if minutes < 0:
                raise InputError(f"{effort}: row {index} has negative minutes")
            total_minutes += minutes
            items_seen.add(item_id)
        if not items_seen:
            raise InputError(f"{effort}: no effort rows")
        result["effort_hours"] = round(total_minutes / 60.0, 2)
        result["items_attempted"] = len(items_seen)
        result["h_attempt"] = round(total_minutes / 60.0 / len(items_seen), 2)

    gates = {
        "kappa": {"value": kappa_value, "min": min_kappa, "pass": kappa_value is not None and kappa_value >= min_kappa},
    }
    if result["defect_rate"] is not None:
        gates["defect_rate"] = {
            "value": result["defect_rate"],
            "max": max_defect,
            "pass": result["defect_rate"] <= max_defect,
        }
    if result["unresolved_rate"] is not None:
        gates["unresolved_rate"] = {
            "value": result["unresolved_rate"],
            "max": max_unresolved,
            "pass": result["unresolved_rate"] <= max_unresolved,
        }
    if result["h_attempt"] is not None:
        gates["h_attempt"] = {
            "value": result["h_attempt"],
            "max": max_hours,
            "pass": result["h_attempt"] <= max_hours,
        }
    result["gates"] = gates
    result["failures"] = [name for name, gate in gates.items() if not gate["pass"]]
    result["passed"] = not result["failures"]
    return result


# --------------------------------------------------------------------------- #
# CLI
# --------------------------------------------------------------------------- #


def _print_check(report: dict, strict: bool) -> None:
    print(
        f"items={report['n_items']} authored={report['n_authored']} "
        f"unfilled={report['n_unfilled']} templates={report['n_templates']} "
        f"claims={report['n_claims']} passages={report['n_evidence_passages']}"
    )
    print("strata=" + " ".join(f"{name}:{count}" for name, count in report["per_stratum"].items()))
    print("verdicts=" + " ".join(f"{name}:{count}" for name, count in report["verdicts"].items()))
    if report["errors"]:
        print(f"ERRORS ({len(report['errors'])}):")
        for error in report["errors"][:20]:
            print(f"  - {error}")
        if len(report["errors"]) > 20:
            print(f"  ... {len(report['errors']) - 20} more")
    if strict and report["n_unfilled"]:
        print(f"BLOCKED: {report['n_unfilled']} unfilled item(s); fill them before strict validation")
    elif report["errors"]:
        print("FAIL: fix the errors above")
    else:
        print("PASS: schema is structurally valid")
        if report["n_unfilled"]:
            print(f"NOTE: {report['n_unfilled']} slot(s) are still unfilled; this is not an authored batch")


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="EG-SSS calibration validator and sheet builder")
    sub = parser.add_subparsers(dest="cmd", required=True)

    check = sub.add_parser("check", help="validate an item batch")
    check.add_argument("--items", required=True)
    check.add_argument("--expect", type=int, default=24, help="expected item count (default 24)")
    check.add_argument("--strict", action="store_true", help="fail if any slot is unfilled")
    check.add_argument("--allow-unbalanced", action="store_true", help="do not require equal strata")
    check.add_argument("--json", action="store_true", help="print the full report as JSON")

    sheets = sub.add_parser("sheets", help="write blind rater sheets from a drafted batch")
    sheets.add_argument("--items", required=True)
    sheets.add_argument("--out", required=True)

    score = sub.add_parser("score", help="kappa, defect rate, and effort gate")
    score.add_argument("--rater1", required=True)
    score.add_argument("--rater2", required=True)
    score.add_argument("--adjudication", default=None)
    score.add_argument("--effort", default=None)
    score.add_argument("--min-kappa", type=float, default=0.75)
    score.add_argument("--max-defect", type=float, default=0.15)
    score.add_argument("--max-hours", type=float, default=2.0)
    score.add_argument("--max-unresolved", type=float, default=0.05)

    args = parser.parse_args(argv)

    try:
        if args.cmd == "check":
            report = validate_batch(load_items(Path(args.items)))
            if args.expect and report["n_items"] != args.expect:
                report["errors"].append(
                    f"expected {args.expect} items, found {report['n_items']}"
                )
            if not args.allow_unbalanced and args.expect % 3 == 0:
                target = args.expect // 3
                wrong = {name: count for name, count in report["per_stratum"].items() if count != target}
                if wrong:
                    report["errors"].append(
                        f"expected {target} items per stratum, found {wrong}"
                    )
            report["ok"] = not report["errors"]
            if args.strict and report["n_unfilled"]:
                report["ok"] = False
            if args.json:
                print(json.dumps(report, indent=2))
            else:
                _print_check(report, args.strict)
            return 0 if report["ok"] else 2

        if args.cmd == "sheets":
            result = build_sheets(load_items(Path(args.items)), Path(args.out))
            print(json.dumps(result, indent=2))
            if result["n_rows"] == 0:
                print("blocked: 0 claims; sheets are header-only until the item batch is authored")
            return 0

        result = score_gate(
            Path(args.rater1),
            Path(args.rater2),
            adjudication=Path(args.adjudication) if args.adjudication else None,
            effort=Path(args.effort) if args.effort else None,
            min_kappa=args.min_kappa,
            max_defect=args.max_defect,
            max_hours=args.max_hours,
            max_unresolved=args.max_unresolved,
        )
    except (InputError, OSError, ValueError) as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 1

    print(json.dumps(result, indent=2))
    if result["passed"]:
        print("PASS: all supplied calibration gates met")
        return 0
    print("FAIL: " + ", ".join(f"{name} below target" for name in result["failures"]))
    return 2


if __name__ == "__main__":
    sys.exit(main())
