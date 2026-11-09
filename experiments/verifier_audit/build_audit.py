"""Build the 150-200 pair verifier audit without a GPU or invented labels.

    # Real SciFact dev pairs (downloads ~3 MB; generated text stays in private/)
    python experiments/verifier_audit/build_audit.py scifact --download

    # After a B8 retrieval run, pull real pipeline claim-passage pairs
    python experiments/verifier_audit/build_audit.py extract \
        --records trustcal/results/B8/gpqa/seed1/records.jsonl

    # After two humans and an adjudicator fill the master sheet
    python experiments/verifier_audit/build_audit.py assemble \
        --audit-sheet experiments/verifier_audit/private/scifact/audit_sheet.csv

The SciFact branch uses the expert gold labels from the SciFact dev split as
the source reference, then runs the CPU lexical verifier to record the pipeline
label. It never writes a human label: `rater1_label`, `rater2_label`, and
`human_label` are blank until people fill them. SciFact is CC BY-NC 2.0, so all
generated text lives under the gitignored `private/` tree.
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
import random
import subprocess
import sys
import tarfile
import urllib.request
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any

REPO_ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(REPO_ROOT / "trustcal" / "src"))

from trustcal.retrieval.verifier import LexicalVerifier  # noqa: E402
from trustcal.eval.agreement import agreement_report  # noqa: E402

VERDICTS = ("supported", "contradicted", "unverifiable")
SCIFACT_URL = "https://scifact.s3-us-west-2.amazonaws.com/release/latest/data.tar.gz"
SCIFACT_DEFAULT = REPO_ROOT / "experiments" / "verifier_audit" / "private" / "scifact"
B8_DEFAULT = REPO_ROOT / "experiments" / "verifier_audit" / "private" / "b8"
SHEET_FIELDS = (
    "pair_id",
    "stratum",
    "claim",
    "passages",
    "verifier_label",
    "rater1_label",
    "rater2_label",
    "human_label",
    "confidence",
    "notes",
)


class AuditError(ValueError):
    """Bad input or environment; the CLI maps it to exit 1."""


# --------------------------------------------------------------------------- #
# generic helpers
# --------------------------------------------------------------------------- #


def _read_jsonl(path: Path) -> list[dict]:
    path = Path(path)
    if not path.is_file():
        raise AuditError(f"not a readable file: {path}")
    rows: list[dict] = []
    with path.open(encoding="utf-8") as handle:
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


def _write_jsonl(path: Path, rows: list[dict]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as handle:
        for row in rows:
            handle.write(json.dumps(row, ensure_ascii=False) + "\n")


def _write_csv(path: Path, fields: tuple[str, ...], rows: list[dict]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=list(fields), extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)


def _read_csv(path: Path, required: tuple[str, ...] = ()) -> list[dict]:
    path = Path(path)
    if not path.is_file():
        raise AuditError(f"not a readable file: {path}")
    with path.open(newline="", encoding="utf-8-sig") as handle:
        reader = csv.DictReader(handle)
        fields = tuple(reader.fieldnames or ())
        missing = [field for field in required if field not in fields]
        if missing:
            raise AuditError(f"{path}: missing column(s) {', '.join(missing)}")
        return list(reader)


def passage_block(passages: list[str]) -> str:
    if not passages:
        return "(no passages retrieved)"
    return "\n\n".join(f"[p{index}] {text}" for index, text in enumerate(passages))


def _normalise(text: object) -> str:
    return " ".join(str(text or "").split())


def _sha256_file(path: Path) -> str | None:
    if not path.is_file():
        return None
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def _label(value: object) -> str:
    return str(value or "").strip().lower()


def _write_audit_sheet(path: Path, pairs: list[dict]) -> None:
    rows = [
        {
            "pair_id": pair["pair_id"],
            "stratum": pair.get("stratum", "unspecified"),
            "claim": pair["claim"],
            "passages": passage_block(pair["passages"]),
            "verifier_label": pair.get("verifier_label", ""),
            "rater1_label": "",
            "rater2_label": "",
            "human_label": "",
            "confidence": "",
            "notes": "",
        }
        for pair in pairs
    ]
    _write_csv(path, SHEET_FIELDS, rows)


def _run_make(pairs_path: Path, sheets_dir: Path) -> None:
    script = REPO_ROOT / "trustcal" / "scripts" / "verifier_audit.py"
    if not script.is_file():
        raise AuditError(f"missing harness: {script}")
    completed = subprocess.run(
        [
            sys.executable,
            str(script),
            "make",
            "--pairs",
            str(pairs_path),
            "--out",
            str(sheets_dir),
        ],
        capture_output=True,
        text=True,
        check=False,
    )
    if completed.returncode != 0:
        raise AuditError(
            f"verifier_audit.py make failed ({completed.returncode}): "
            f"{completed.stdout.strip()} {completed.stderr.strip()}"
        )
    if completed.stdout.strip():
        print(completed.stdout.strip())


def _status(
    out_dir: Path,
    *,
    source: str,
    target: int,
    blocked_on: list[str],
) -> dict:
    candidates_path = out_dir / "candidates.jsonl"
    sheet_path = out_dir / "audit_sheet.csv"
    pairs_path = out_dir / "pairs.jsonl"
    candidates = _read_jsonl(candidates_path) if candidates_path.is_file() else []
    sheet = _read_csv(sheet_path) if sheet_path.is_file() else []
    gold = Counter()
    verifier = Counter()
    if pairs_path.is_file():
        for row in _read_jsonl(pairs_path):
            gold[_label(row.get("gold_label"))] += 1
    for row in candidates:
        verifier[_label(row.get("verifier_label"))] += 1
    human = sum(1 for row in sheet if _label(row.get("human_label")))
    rater1 = sum(1 for row in sheet if _label(row.get("rater1_label")))
    rater2 = sum(1 for row in sheet if _label(row.get("rater2_label")))
    blocked = bool(blocked_on) and (target == 0 or human < target)
    status = {
        "source": source,
        "target_pairs": target,
        "real_pairs": len(candidates),
        "audit_sheet_rows": len(sheet),
        "source_gold_labels": dict(gold),
        "verifier_labels": dict(verifier),
        "rater1_labels": rater1,
        "rater2_labels": rater2,
        "human_labels": human,
        "placeholders": 0,
        "blocked": blocked,
        "blocked_on": blocked_on if blocked else [],
    }
    return status


# --------------------------------------------------------------------------- #
# SciFact
# --------------------------------------------------------------------------- #


def ensure_scifact(data_dir: Path, download: bool) -> str | None:
    """Make sure claims_dev.jsonl and corpus.jsonl exist under ``data_dir``.

    Returns the SHA-256 of the downloaded archive when one is present, so the
    seed manifest can pin the exact release even though the URL says ``latest``.
    """
    claims = data_dir / "claims_dev.jsonl"
    corpus = data_dir / "corpus.jsonl"
    archive = data_dir.parent / "data.tar.gz"
    if claims.is_file() and corpus.is_file():
        return _sha256_file(archive)
    if not download:
        raise AuditError(
            f"SciFact data missing under {data_dir}; rerun with --download "
            f"(downloads {SCIFACT_URL}) or pass --data-dir to an extracted copy"
        )
    data_dir.mkdir(parents=True, exist_ok=True)
    if not archive.is_file():
        print(f"downloading {SCIFACT_URL}")
        urllib.request.urlretrieve(SCIFACT_URL, archive)
    with tarfile.open(archive, "r:gz") as tar:
        try:
            tar.extractall(data_dir.parent, filter="data")
        except TypeError:  # Python < 3.12 has no extraction filter argument
            tar.extractall(data_dir.parent)
    extracted = data_dir.parent / "data"
    if not claims.is_file() and extracted.is_dir() and extracted != data_dir:
        for source in extracted.iterdir():
            target = data_dir / source.name
            if target.exists():
                continue
            source.replace(target)
        if not any(extracted.iterdir()):
            extracted.rmdir()
    if not claims.is_file() or not corpus.is_file():
        raise AuditError(
            f"archive did not contain data/claims_dev.jsonl and data/corpus.jsonl under {data_dir}"
        )
    return _sha256_file(archive)


def load_scifact(data_dir: Path) -> tuple[dict[int, dict], list[dict]]:
    corpus = {int(row["doc_id"]): row for row in _read_jsonl(data_dir / "corpus.jsonl")}
    claims = _read_jsonl(data_dir / "claims_dev.jsonl")
    return corpus, claims


def _passage_from_sentences(doc: dict, sentences: list[int]) -> str:
    title = _normalise(doc.get("title"))
    abstract = doc.get("abstract") or []
    selected: list[str] = []
    for index in sentences:
        if isinstance(index, int) and 0 <= index < len(abstract):
            text = _normalise(abstract[index])
            if text:
                selected.append(text)
    if not selected:
        selected = [_normalise(text) for text in abstract[:1] if _normalise(text)]
    body = " ".join(selected)
    title = title.rstrip(".")
    if title and body:
        return f"{title}. {body}"
    return title or body


def _first_evidence(
    claim: dict,
    label: str,
    corpus: dict[int, dict],
) -> dict | None:
    evidence = claim.get("evidence") or {}
    for doc_key in sorted(evidence, key=lambda key: int(key)):
        doc = corpus.get(int(doc_key))
        if doc is None:
            continue
        items = sorted(evidence[doc_key], key=lambda item: tuple(item.get("sentences") or []))
        for item in items:
            if item.get("label") != label:
                continue
            passage = _passage_from_sentences(doc, list(item.get("sentences") or []))
            if passage:
                return {
                    "passage": passage,
                    "doc_id": int(doc_key),
                    "sentences": list(item.get("sentences") or []),
                    "scifact_label": label,
                }
    return None


def _topical_passage(
    claim: dict,
    corpus: dict[int, dict],
    rng: random.Random,
) -> dict | None:
    cited = [int(doc_id) for doc_id in (claim.get("cited_doc_ids") or []) if int(doc_id) in corpus]
    doc_id = cited[0] if cited else rng.choice(sorted(corpus))
    doc = corpus.get(doc_id)
    if doc is None:
        return None
    abstract = doc.get("abstract") or []
    passage = _passage_from_sentences(doc, [0] if abstract else [])
    if not passage:
        return None
    return {"passage": passage, "doc_id": doc_id, "sentences": [0] if abstract else [], "scifact_label": "NOT_ENOUGH_INFO"}


def build_scifact_pairs(
    corpus: dict[int, dict],
    claims: list[dict],
    *,
    n: int = 180,
    seed: int = 0,
) -> list[dict]:
    """60 supported + 60 contradicted + 60 unverifiable (20 empty, 40 topical)."""
    if not 150 <= n <= 200:
        raise AuditError("--n must be between 150 and 200")
    if n % 3:
        raise AuditError("--n must be divisible by 3 for balanced classes")
    n_per = n // 3
    support: list[dict] = []
    contradict: list[dict] = []
    nei: list[dict] = []
    for claim in sorted(claims, key=lambda row: int(row["id"])):
        claim_id = int(claim["id"])
        evidence = claim.get("evidence") or {}
        if not evidence:
            nei.append(claim)
            continue
        supported = _first_evidence(claim, "SUPPORT", corpus)
        refuted = _first_evidence(claim, "CONTRADICT", corpus)
        if supported:
            support.append({"claim": claim, "evidence": supported})
        if refuted:
            contradict.append({"claim": claim, "evidence": refuted})

    counts = {"supported": len(support), "contradicted": len(contradict), "unverifiable": len(nei)}
    if min(counts.values()) < n_per:
        raise AuditError(
            f"SciFact dev has insufficient claims per class for n={n}: {counts}; "
            "use n <= 180 for the dev split or add an explicit train-split exporter"
        )

    rng = random.Random(seed)
    rng.shuffle(support)
    rng.shuffle(contradict)
    rng.shuffle(nei)

    pairs: list[dict] = []
    for item in support[:n_per]:
        claim = item["claim"]
        evidence = item["evidence"]
        pairs.append(
            {
                "pair_id": f"scifact-dev-{int(claim['id']):04d}-sup",
                "stratum": "biomedical",
                "claim": _normalise(claim["claim"]),
                "passages": [evidence["passage"]],
                "gold_label": "supported",
                "source": "scifact_dev",
                "scifact_claim_id": int(claim["id"]),
                "scifact_label": "SUPPORT",
                "negative_kind": None,
            }
        )
    for item in contradict[:n_per]:
        claim = item["claim"]
        evidence = item["evidence"]
        pairs.append(
            {
                "pair_id": f"scifact-dev-{int(claim['id']):04d}-con",
                "stratum": "biomedical",
                "claim": _normalise(claim["claim"]),
                "passages": [evidence["passage"]],
                "gold_label": "contradicted",
                "source": "scifact_dev",
                "scifact_claim_id": int(claim["id"]),
                "scifact_label": "CONTRADICT",
                "negative_kind": None,
            }
        )

    n_empty = min(n_per, 20)
    for index, claim in enumerate(nei[:n_per]):
        empty = index < n_empty
        if empty:
            passages = []
            negative_kind = "empty"
        else:
            topical = _topical_passage(claim, corpus, rng)
            if topical is None:
                passages = []
                negative_kind = "empty"
            else:
                passages = [topical["passage"]]
                negative_kind = "topical"
        pairs.append(
            {
                "pair_id": f"scifact-dev-{int(claim['id']):04d}-nei",
                "stratum": "biomedical",
                "claim": _normalise(claim["claim"]),
                "passages": passages,
                "gold_label": "unverifiable",
                "source": "scifact_dev",
                "scifact_claim_id": int(claim["id"]),
                "scifact_label": "NOT_ENOUGH_INFO",
                "negative_kind": negative_kind,
            }
        )

    rng.shuffle(pairs)
    verifier = LexicalVerifier()
    for pair in pairs:
        verdict = verifier.verdict(pair["claim"], pair["passages"])
        pair["verifier_label"] = verdict.label
        pair["verifier"] = verdict.verifier
        pair["verifier_scores"] = list(verdict.scores)
    return pairs


def write_scifact_outputs(
    pairs: list[dict],
    out_dir: Path,
    *,
    seed: int,
    manifest_path: Path | None = None,
    archive_sha256: str | None = None,
) -> dict:
    out_dir = Path(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    _write_jsonl(out_dir / "candidates.jsonl", pairs)
    _write_jsonl(
        out_dir / "pairs.jsonl",
        [
            {
                "id": pair["pair_id"],
                "claim": pair["claim"],
                "passages": pair["passages"],
                "gold_label": pair["gold_label"],
            }
            for pair in pairs
        ],
    )
    _write_csv(
        out_dir / "verifier_predictions.csv",
        ("pair_id", "label"),
        [{"pair_id": pair["pair_id"], "label": pair.get("verifier_label", "")} for pair in pairs],
    )
    _write_audit_sheet(out_dir / "audit_sheet.csv", pairs)
    _run_make(out_dir / "pairs.jsonl", out_dir / "sheets")
    status = _status(
        out_dir,
        source="scifact_dev",
        target=len(pairs),
        blocked_on=[
            "two annotators have not labelled the blind sheets",
            "an adjudicator has not resolved disagreements or filled human_label",
        ],
    )
    status["seed"] = seed
    status["source_archive_sha256"] = archive_sha256
    status["files"] = {
        "candidates": "candidates.jsonl",
        "pairs_source_gold": "pairs.jsonl",
        "verifier_predictions": "verifier_predictions.csv",
        "audit_sheet": "audit_sheet.csv",
        "blind_sheets": "sheets/rater1.csv, sheets/rater2.csv",
        "codebook": "sheets/codebook.md",
    }

    def counts(key: str) -> dict[str, int]:
        values = (
            "none" if pair.get(key) is None else str(pair.get(key))
            for pair in pairs
        )
        return dict(sorted(Counter(values).items()))

    manifest = {
        "source": "scifact_dev",
        "source_url": SCIFACT_URL,
        "source_archive_sha256": archive_sha256,
        "n_pairs": len(pairs),
        "seed": seed,
        "license": "SciFact dev is CC BY-NC 2.0; claim and passage text is not committed.",
        "note": "IDs and counts only. The text lives in the gitignored private/ tree.",
        "counts": {
            "gold_label": counts("gold_label"),
            "verifier_label": counts("verifier_label"),
            "stratum": counts("stratum"),
            "negative_kind": counts("negative_kind"),
        },
        "pair_ids": sorted(pair["pair_id"] for pair in pairs),
        "candidates_sha256": hashlib.sha256(
            json.dumps(pairs, sort_keys=True, ensure_ascii=False).encode("utf-8")
        ).hexdigest(),
    }
    if manifest_path is not None:
        manifest_path.parent.mkdir(parents=True, exist_ok=True)
        manifest_path.write_text(json.dumps(manifest, indent=2, sort_keys=True), encoding="utf-8")
    status["manifest"] = str(manifest_path) if manifest_path else None
    (out_dir / "status.json").write_text(json.dumps(status, indent=2), encoding="utf-8")
    return status


# --------------------------------------------------------------------------- #
# pipeline records (B8)
# --------------------------------------------------------------------------- #


def extract_records(records_paths: list[Path], n: int, seed: int) -> list[dict]:
    candidates: list[dict] = []
    seen: set[tuple[str, tuple[str, ...]]] = set()
    for path in records_paths:
        for record in _read_jsonl(path):
            qid = str(record.get("question_id") or "")
            stratum = str(record.get("dataset") or record.get("stratum") or "unspecified")
            arm = str(record.get("arm") or "")
            for index, entry in enumerate(record.get("verdicts") or []):
                if not isinstance(entry, dict):
                    continue
                claim = _normalise(entry.get("claim"))
                raw_passages = [_normalise(text) for text in (entry.get("passages") or [])]
                passages = raw_passages if any(raw_passages) else []
                verdict = _label(entry.get("verdict"))
                if not claim or verdict not in VERDICTS:
                    continue
                key = (claim, tuple(passages))
                if key in seen:
                    continue
                seen.add(key)
                candidates.append(
                    {
                        "pair_id": f"pipe-{qid or 'adhoc'}-{index:04d}",
                        "stratum": stratum,
                        "claim": claim,
                        "passages": passages,
                        "verifier_label": verdict,
                        "verifier": str(entry.get("verifier") or ""),
                        "verifier_scores": list(entry.get("scores") or []),
                        "gold_label": None,
                        "source": "pipeline",
                        "arm": arm,
                        "question_id": qid,
                        "record_path": str(path),
                    }
                )
    if n and len(candidates) > n:
        candidates = _stratified_sample(candidates, n, seed, "verifier_label")
    return candidates


def _stratified_sample(rows: list[dict], n: int, seed: int, key: str) -> list[dict]:
    groups: dict[str, list[dict]] = defaultdict(list)
    for row in rows:
        groups[str(row.get(key) or "unknown")].append(row)
    rng = random.Random(seed)
    for group in groups.values():
        rng.shuffle(group)
    keys = sorted(groups)
    chosen: list[dict] = []
    index = 0
    while len(chosen) < n:
        added = False
        for name in keys:
            if index < len(groups[name]):
                chosen.append(groups[name][index])
                added = True
                if len(chosen) >= n:
                    break
        if not added:
            break
        index += 1
    return chosen


def write_pipeline_outputs(candidates: list[dict], out_dir: Path, *, seed: int) -> dict:
    out_dir = Path(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    _write_jsonl(out_dir / "candidates.jsonl", candidates)
    _write_audit_sheet(out_dir / "audit_sheet.csv", candidates)
    status = _status(
        out_dir,
        source="pipeline_b8",
        target=len(candidates),
        blocked_on=[
            "pipeline pairs have no gold_label until two annotators label them and an adjudicator fills human_label",
            "the audit sheet must be assembled into pairs_human.jsonl before scoring",
        ]
        if candidates
        else ["no claim-passage pairs found: the records have no retrieval verdicts"],
    )
    status["seed"] = seed
    (out_dir / "status.json").write_text(json.dumps(status, indent=2), encoding="utf-8")
    return status


# --------------------------------------------------------------------------- #
# assemble human labels
# --------------------------------------------------------------------------- #


def assemble(audit_sheet: Path, out_dir: Path) -> dict:
    rows = _read_csv(
        audit_sheet,
        ("pair_id", "claim", "passages", "rater1_label", "rater2_label", "human_label"),
    )
    if not rows:
        raise AuditError(f"{audit_sheet}: no rows")
    kept: list[dict] = []
    unresolved = 0
    all_rater1: list[str] = []
    all_rater2: list[str] = []
    seen: set[str] = set()
    for index, row in enumerate(rows, start=2):
        pair_id = str(row.get("pair_id") or "").strip()
        if not pair_id:
            raise AuditError(f"{audit_sheet}: row {index} has no pair_id")
        if pair_id in seen:
            raise AuditError(f"{audit_sheet}: duplicate pair_id {pair_id!r}")
        seen.add(pair_id)
        human = _label(row.get("human_label"))
        rater1 = _label(row.get("rater1_label"))
        rater2 = _label(row.get("rater2_label"))
        if rater1 not in VERDICTS or rater2 not in VERDICTS:
            raise AuditError(
                f"{audit_sheet}: {pair_id} needs rater1_label and rater2_label in {VERDICTS}"
            )
        all_rater1.append(rater1)
        all_rater2.append(rater2)
        if human == "unresolved":
            unresolved += 1
            continue
        if human not in VERDICTS:
            raise AuditError(
                f"{audit_sheet}: {pair_id} human_label={human!r}; expected one of "
                f"{', '.join(VERDICTS)} or 'unresolved'"
            )
        kept.append(
            {
                "pair_id": pair_id,
                "claim": str(row.get("claim") or ""),
                "passages": str(row.get("passages") or ""),
                "verifier_label": _label(row.get("verifier_label")),
                "rater1_label": rater1,
                "rater2_label": rater2,
                "human_label": human,
                "confidence": str(row.get("confidence") or ""),
                "notes": str(row.get("notes") or ""),
            }
        )
    if not kept:
        raise AuditError(f"{audit_sheet}: no adjudicated rows to assemble")

    out_dir = Path(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    _write_jsonl(
        out_dir / "pairs_human.jsonl",
        [
            {
                "id": row["pair_id"],
                "claim": row["claim"],
                "passages": [] if row["passages"] == "(no passages retrieved)" else [
                    block.split("] ", 1)[1] if "] " in block else block
                    for block in row["passages"].split("\n\n")
                    if block.strip()
                ],
                "gold_label": row["human_label"],
            }
            for row in kept
        ],
    )
    _write_csv(
        out_dir / "verifier_predictions.csv",
        ("pair_id", "label"),
        [{"pair_id": row["pair_id"], "label": row["verifier_label"]} for row in kept if row["verifier_label"]],
    )
    _write_csv(
        out_dir / "rater1.csv",
        ("pair_id", "claim", "passages", "label", "confidence", "notes"),
        [
            {
                "pair_id": row["pair_id"],
                "claim": row["claim"],
                "passages": row["passages"],
                "label": row["rater1_label"],
                "confidence": row["confidence"],
                "notes": row["notes"],
            }
            for row in kept
        ],
    )
    _write_csv(
        out_dir / "rater2.csv",
        ("pair_id", "claim", "passages", "label", "confidence", "notes"),
        [
            {
                "pair_id": row["pair_id"],
                "claim": row["claim"],
                "passages": row["passages"],
                "label": row["rater2_label"],
                "confidence": row["confidence"],
                "notes": row["notes"],
            }
            for row in kept
        ],
    )
    return {
        "n_assembled": len(kept),
        "n_unresolved_excluded": unresolved,
        "kappa_all_rows": agreement_report(all_rater1, all_rater2) if all_rater1 else None,
        "kappa_resolved_rows": (
            agreement_report(
                [row["rater1_label"] for row in kept],
                [row["rater2_label"] for row in kept],
            )
            if kept
            else None
        ),
        "out_dir": str(out_dir),
        "score_command": (
            f"python trustcal/scripts/verifier_audit.py score "
            f"--rater1 {out_dir / 'rater1.csv'} --rater2 {out_dir / 'rater2.csv'} "
            f"--gold {out_dir / 'pairs_human.jsonl'} --pred {out_dir / 'verifier_predictions.csv'}"
        ),
    }


# --------------------------------------------------------------------------- #
# CLI
# --------------------------------------------------------------------------- #


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Verifier audit seed builder (GPU-free)")
    sub = parser.add_subparsers(dest="cmd", required=True)

    scifact = sub.add_parser("scifact", help="build real SciFact dev claim-passage pairs")
    scifact.add_argument("--data-dir", default=str(SCIFACT_DEFAULT / "data"))
    scifact.add_argument("--out-dir", default=str(SCIFACT_DEFAULT))
    scifact.add_argument("--n", type=int, default=180, help="150-200 pairs (default 180)")
    scifact.add_argument("--seed", type=int, default=0)
    scifact.add_argument("--download", action="store_true", help="download SciFact if missing")
    scifact.add_argument(
        "--manifest",
        default=str(REPO_ROOT / "experiments" / "verifier_audit" / "seed_manifest.json"),
        help="committed IDs-and-counts manifest (no item text)",
    )

    extract = sub.add_parser("extract", help="extract real pairs from pipeline records")
    extract.add_argument("--records", nargs="+", required=True)
    extract.add_argument("--out", default=str(B8_DEFAULT))
    extract.add_argument("--n", type=int, default=180)
    extract.add_argument("--seed", type=int, default=0)

    assemble_cmd = sub.add_parser("assemble", help="turn a filled master sheet into scoring files")
    assemble_cmd.add_argument("--audit-sheet", required=True)
    assemble_cmd.add_argument("--out", default=None)

    status = sub.add_parser("status", help="count real pairs and human labels")
    status.add_argument("--dir", default=str(SCIFACT_DEFAULT))

    args = parser.parse_args(argv)

    try:
        if args.cmd == "scifact":
            data_dir = Path(args.data_dir)
            archive_sha256 = ensure_scifact(data_dir, args.download)
            corpus, claims = load_scifact(data_dir)
            pairs = build_scifact_pairs(corpus, claims, n=args.n, seed=args.seed)
            result = write_scifact_outputs(
                pairs,
                Path(args.out_dir),
                seed=args.seed,
                manifest_path=Path(args.manifest) if args.manifest else None,
                archive_sha256=archive_sha256,
            )
            print(json.dumps(result, indent=2))
            return 0

        if args.cmd == "extract":
            paths = [Path(path) for path in args.records]
            candidates = extract_records(paths, args.n, args.seed)
            result = write_pipeline_outputs(candidates, Path(args.out), seed=args.seed)
            print(json.dumps(result, indent=2))
            if not candidates:
                print(
                    "blocked: 0 pairs extracted. The records contain no retrieval verdicts; "
                    "run a B8 (retrieval) arm first, or use the SciFact branch."
                )
            return 0

        if args.cmd == "assemble":
            sheet = Path(args.audit_sheet)
            out = Path(args.out) if args.out else sheet.parent / "assembled"
            print(json.dumps(assemble(sheet, out), indent=2))
            return 0

        existing = Path(args.dir) / "status.json"
        prior: dict[str, Any] = {}
        if existing.is_file():
            try:
                prior = json.loads(existing.read_text(encoding="utf-8"))
            except json.JSONDecodeError:
                prior = {}
        print(
            json.dumps(
                _status(
                    Path(args.dir),
                    source=str(prior.get("source") or "unknown"),
                    target=int(prior.get("target_pairs") or 180),
                    blocked_on=list(
                        prior.get("blocked_on")
                        or ["no generated audit found; run the scifact or extract command first"]
                    ),
                ),
                indent=2,
            )
        )
        return 0
    except (AuditError, OSError, ValueError) as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
