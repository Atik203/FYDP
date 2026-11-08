"""P0 gate — the 13 checks that must pass before any pilot or matrix run.

    python scripts/p0_gate.py                  # exit 0 only if all 13 PASS
    python scripts/p0_gate.py --json           # machine-readable report
    python scripts/p0_gate.py --allow-pending  # during the build: PENDING != failure
    python scripts/p0_gate.py --only 9         # run one check while developing
    python scripts/p0_gate.py --list

A check is **PENDING** when the owner slice it verifies has not landed yet; it
names the work package in ``dependency``. With ``--allow-pending`` a PENDING
check does not fail the run, so a partially-integrated branch can still gate the
slices that exist. FAIL always means a landed slice is broken; ERROR means the
gate itself could not evaluate the check (usually an interface drift — read the
detail before editing anything).

Ownership rule: this script never edits another owner's code to make a check
pass. A red check is reported with its work package; the lease holder fixes it.

The 13 checks (``docs/agent/09_P0_INTERFACES.md`` §6):

1  pytest green
2  record schema validates on a synthetic fixture
3  every MCQ prompt contains all options exactly once
4  parser corpus >= 95% exact match
5  trust bound: 10k random draws at N=1,3,5
6  trust neutral identity + verbosity invariance
7  B8 vs B8-no-trust differs only in the trust line
8  B8+injection mock has consensus, trust trajectory and evidence
9  endpoint summary contains all endpoints on synthetic records
10 dataset revisions pinned + ``answer_type`` preserved
11 routing: bio -> PubMed, math -> not PubMed
12 manifest resume mismatch raises
13 matrix <= 1,500 GPU-h and ``PRE_REGISTRATION.md`` exists
"""

from __future__ import annotations

import argparse
import dataclasses
import importlib
import inspect
import json
import math
import os
import re
import subprocess
import sys
import tempfile
import time
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Callable

ROOT = Path(__file__).resolve().parents[1]  # trustcal/
REPO = ROOT.parent  # repository root
sys.path.insert(0, str(ROOT / "src"))

PASS = "PASS"
FAIL = "FAIL"
PENDING = "PENDING"
ERROR = "ERROR"
STATUSES = (PASS, FAIL, PENDING, ERROR)

#: Gate 0 measured ~6.2 min/debate on the dev stack; P0-10 budgets 8 min/debate.
GPU_MINUTES_PER_DEBATE = 8.0
MATRIX_BUDGET_GPU_HOURS = 1500.0

#: Work-package dependencies, used in the report and by the evidence file.
DEPENDENCIES = {
    2: "WP-04 (eval/records.py)",
    3: "WP-01 (eval/options.py + prompts)",
    4: "WP-02 (parser corpus)",
    5: "WP-03 (trust projection)",
    6: "WP-03 (trust projection)",
    7: "WP-13 (B8-no-trust prompts)",
    8: "WP-09 (B8 x injection wiring)",
    10: "WP-11 (dataset loaders)",
    11: "WP-12 (claim -> domain routing)",
    12: "WP-04 (manifest + resume guard)",
    13: "WP-14 (matrix cut + pre-registration)",
}


# --------------------------------------------------------------------------- #
# Harness
# --------------------------------------------------------------------------- #


@dataclass
class CheckResult:
    id: int
    name: str
    status: str
    detail: str = ""
    dependency: str | None = None
    duration_s: float = 0.0

    def as_dict(self) -> dict:
        return {
            "id": self.id,
            "name": self.name,
            "status": self.status,
            "detail": self.detail,
            "dependency": self.dependency,
            "duration_s": round(self.duration_s, 3),
        }


@dataclass
class Check:
    id: int
    name: str
    run: Callable[[], CheckResult]
    dependency: str | None = None


def _result(
    check_id: int,
    name: str,
    status: str,
    detail: str,
    dependency: str | None = None,
) -> CheckResult:
    return CheckResult(
        id=check_id, name=name, status=status, detail=detail, dependency=dependency
    )


def run_gate(checks: list[Check], *, allow_pending: bool = False) -> dict:
    """Run every check and build the report (JSON-safe)."""
    results: list[CheckResult] = []
    for check in checks:
        started = time.perf_counter()
        try:
            result = check.run()
        except Exception as exc:  # a broken check must not kill the gate
            result = CheckResult(
                id=check.id,
                name=check.name,
                status=ERROR,
                detail=f"check raised {type(exc).__name__}: {exc}",
                dependency=check.dependency,
            )
        result.duration_s = time.perf_counter() - started
        if result.dependency is None:
            result.dependency = check.dependency
        if result.status not in STATUSES:
            result.status = ERROR
            result.detail = f"invalid status {result.status!r}; {result.detail}"
        results.append(result)
    counts = {status: sum(1 for r in results if r.status == status) for status in STATUSES}
    failures = counts[FAIL] + counts[ERROR]
    pending_blocks = counts[PENDING] > 0 and not allow_pending
    exit_code = 1 if failures or pending_blocks else 0
    return {
        "generated_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "allow_pending": allow_pending,
        "summary": {
            "total": len(results),
            "pass": counts[PASS],
            "fail": counts[FAIL],
            "pending": counts[PENDING],
            "error": counts[ERROR],
        },
        "exit_code": exit_code,
        "checks": [result.as_dict() for result in results],
    }


def _select(checks: list[Check], only: str | None) -> list[Check]:
    if not only:
        return checks
    wanted: list[int] = []
    for part in only.split(","):
        part = part.strip()
        if not part:
            continue
        try:
            wanted.append(int(part))
        except ValueError:
            raise argparse.ArgumentTypeError(f"--only expects integers, got {part!r}") from None
    known = {check.id for check in checks}
    unknown = sorted(set(wanted) - known)
    if unknown:
        raise argparse.ArgumentTypeError(f"unknown check id(s): {unknown}; known: {sorted(known)}")
    lookup = {check.id: check for check in checks}
    return [lookup[check_id] for check_id in wanted]


def _print_table(report: dict) -> None:
    print(f"P0 gate - {report['summary']['total']} check(s) (allow_pending={report['allow_pending']})")
    for check in report["checks"]:
        line = f"{check['status']:<7} {check['id']:>2}  {check['name']:<34} {check['duration_s']:6.2f}s"
        if check["dependency"]:
            line += f"  [{check['dependency']}]"
        print(line)
        if check["detail"]:
            for detail_line in check["detail"].splitlines():
                print(f"          {detail_line}")
    summary = report["summary"]
    print(
        f"\nsummary: {summary['pass']} passed, {summary['fail']} failed, "
        f"{summary['pending']} pending, {summary['error']} error "
        f"(exit {report['exit_code']})"
    )


# --------------------------------------------------------------------------- #
# Check 1 — pytest
# --------------------------------------------------------------------------- #


def _pytest_command() -> list[str]:
    return [sys.executable, "-m", "pytest", "-q", "--ignore=.venv", "-p", "no:cacheprovider"]


def check_pytest() -> CheckResult:
    env = os.environ.copy()
    source = str(ROOT / "src")
    env["PYTHONPATH"] = source + (os.pathsep + env["PYTHONPATH"] if env.get("PYTHONPATH") else "")
    env.pop("PYTEST_CURRENT_TEST", None)  # never let an outer pytest session leak in
    try:
        proc = subprocess.run(
            _pytest_command(),
            cwd=ROOT,
            env=env,
            capture_output=True,
            text=True,
            timeout=1800,
        )
    except subprocess.TimeoutExpired:
        return _result(1, "pytest", ERROR, "pytest timed out after 1800s")
    except OSError as exc:
        return _result(1, "pytest", ERROR, f"could not start pytest: {exc}")
    lines = [line for line in (proc.stdout + proc.stderr).strip().splitlines() if line.strip()]
    summary = lines[-1] if lines else "no output"
    if proc.returncode == 0:
        return _result(1, "pytest", PASS, f"exit 0: {summary}")
    tail = "\n".join(lines[-25:])
    return _result(1, "pytest", FAIL, f"exit {proc.returncode}: {summary}\n{tail}")


# --------------------------------------------------------------------------- #
# Check 2 — record schema
# --------------------------------------------------------------------------- #


def _validator_verdict(validator: Callable, record: dict) -> tuple[bool, str]:
    """Call a record validator without assuming raises-vs-returns."""
    try:
        result = validator(record)
    except Exception as exc:
        return False, f"{type(exc).__name__}: {exc}"
    if isinstance(result, (list, tuple, set)):
        return (not result), f"{len(result)} issue(s)"
    if isinstance(result, dict):
        errors = result.get("errors")
        if isinstance(errors, list):
            return (not errors), str(errors[:3])
        return (not result), str(result)[:300]
    if result is None or result is True:
        return True, "accepted"
    if result is False:
        return False, "rejected"
    return bool(result), str(result)[:300]


def check_record_schema() -> CheckResult:
    name = "record schema"
    try:
        module = importlib.import_module("trustcal.eval.records")
    except Exception as exc:
        return _result(
            2, name, PENDING, f"records module not importable ({exc})", DEPENDENCIES[2]
        )
    validator = getattr(module, "validate_record", None) or getattr(module, "validate", None)
    if not callable(validator):
        return _result(
            2,
            name,
            PENDING,
            "records module has no validate_record()/validate() callable",
            DEPENDENCIES[2],
        )
    from trustcal.eval.p0_fixtures import fixture_records

    good = fixture_records()[0]
    accepted, note = _validator_verdict(validator, good)
    if not accepted:
        return _result(2, name, FAIL, f"schema-v2 fixture rejected: {note}", DEPENDENCIES[2])
    broken = dict(good)
    broken.pop("final_answer", None)
    accepted_broken, note_broken = _validator_verdict(validator, broken)
    if accepted_broken:
        return _result(
            2,
            name,
            FAIL,
            "validator accepted a record without final_answer",
            DEPENDENCIES[2],
        )
    return _result(2, name, PASS, f"fixture accepted; missing final_answer rejected ({note_broken})")


# --------------------------------------------------------------------------- #
# Check 3 — options in every MCQ prompt
# --------------------------------------------------------------------------- #


def check_options_in_prompts() -> CheckResult:
    name = "options in prompts"
    try:
        options_module = importlib.import_module("trustcal.eval.options")
    except Exception as exc:
        return _result(3, name, PENDING, f"eval/options.py not importable ({exc})", DEPENDENCIES[3])
    build = getattr(options_module, "build_options", None)
    if not callable(build):
        return _result(
            3, name, PENDING, "eval/options.py has no build_options()", DEPENDENCIES[3]
        )

    from trustcal.agents import prompts

    templates = ["AGENT_INITIAL", "AGENT_REVISION", "AGENT_REVISION_EVIDENCE"]
    missing = [template for template in templates if not hasattr(prompts, template)]
    if missing:
        return _result(3, name, FAIL, f"prompt template(s) missing: {missing}", DEPENDENCIES[3])
    without_slot = [
        template
        for template in templates
        if "{options" not in getattr(prompts, template) and "{options_block" not in getattr(prompts, template)
    ]
    if without_slot:
        return _result(
            3,
            name,
            FAIL,
            f"options module landed but these prompts have no options slot: {without_slot}",
            DEPENDENCIES[3],
        )

    questions = [
        {
            "question": f"Which option is correct for item {index}?",
            "answer": "alpha",
            "options": ["alpha", "beta", "gamma", "delta"],
        }
        for index in range(5)
    ]
    gold_letters: set[str] = set()
    for index, question in enumerate(questions):
        for seed in range(index * 20, index * 20 + 20):
            rendered = build(question, seed=seed, question_id=f"gate-{index}")
            permutation = sorted(getattr(rendered, "permutation", []))
            if permutation != list(range(len(question["options"]))):
                return _result(
                    3,
                    name,
                    FAIL,
                    f"build_options returned a non-permutation {permutation!r}",
                    DEPENDENCIES[3],
                )
            block = getattr(rendered, "block", "")
            for template in templates:
                prompt = getattr(prompts, template).format(
                    agent_id=1,
                    round=2,
                    rounds=3,
                    own_position="own",
                    trust=0.5,
                    evidence=block,
                    peer_positions="peers",
                    question=question["question"],
                    options=block,
                    options_block=block,
                )
                for option in question["options"]:
                    if prompt.count(option) != 1:
                        return _result(
                            3,
                            name,
                            FAIL,
                            f"{template} seed {seed}: option {option!r} appears "
                            f"{prompt.count(option)} times (expected 1)",
                            DEPENDENCIES[3],
                        )
            gold_letter = getattr(rendered, "gold_letter", None)
            if gold_letter:
                gold_letters.add(str(gold_letter))
    if len(gold_letters) < 2:
        return _result(
            3,
            name,
            FAIL,
            f"gold letter is always {sorted(gold_letters)} across 100 renders",
            DEPENDENCIES[3],
        )
    return _result(
        3,
        name,
        PASS,
        f"5 questions x 20 seeds: every option exactly once in 3 prompts; "
        f"gold letters {sorted(gold_letters)}",
    )


# --------------------------------------------------------------------------- #
# Check 4 — parser corpus
# --------------------------------------------------------------------------- #


def _find_parser_corpus() -> Path | None:
    patterns = ("*parser*corpus*.json", "*parser*corpus*.jsonl", "*corpus*parser*.json")
    for base in (ROOT, REPO / "experiments", REPO / "docs"):
        if not base.is_dir():
            continue
        for pattern in patterns:
            for path in base.rglob(pattern):
                if ".venv" in path.parts or "results" in path.parts or "node_modules" in path.parts:
                    continue
                if path.is_file():
                    return path
    return None


def _load_corpus(path: Path) -> list[dict]:
    text = path.read_text(encoding="utf-8")
    if path.suffix == ".jsonl":
        items = [json.loads(line) for line in text.splitlines() if line.strip()]
    else:
        payload = json.loads(text)
        items = payload.get("cases", payload) if isinstance(payload, dict) else payload
    if not isinstance(items, list):
        raise ValueError(f"{path}: expected a list of cases")
    return [item for item in items if isinstance(item, dict)]


def _parser_probes() -> list[tuple[str, bool]]:
    probes: list[tuple[str, bool]] = []
    try:
        from trustcal.agents import parse_position
        from trustcal.eval.answers import choice_letter, to_float

        scientific = to_float("10^-4 eV")
        probes.append(("10^-4 eV -> 1e-4", scientific is not None and math.isclose(scientific, 1e-4, rel_tol=1e-9)))
        scientific = to_float("7.3 × 10^-7")
        probes.append(
            ("7.3 x 10^-7 -> 7.3e-7", scientific is not None and math.isclose(scientific, 7.3e-7, rel_tol=1e-6))
        )
        probes.append(("The answer is B -> B", choice_letter(parse_position("The answer is B")) == "B"))
        probes.append(
            ("Product 3 contains 11 -> not 3.0", to_float(parse_position("Product 3 contains 11")) != 3.0)
        )
    except Exception as exc:  # parser not importable yet
        probes.append((f"probe error: {type(exc).__name__}: {exc}", False))
    return probes


def check_parser_corpus() -> CheckResult:
    name = "parser corpus"
    probes = _parser_probes()
    probe_note = ", ".join(f"{label}={'ok' if ok else 'bad'}" for label, ok in probes)
    path = _find_parser_corpus()
    if path is None:
        return _result(
            4,
            name,
            PENDING,
            f"no parser corpus file found; probes: {probe_note}",
            DEPENDENCIES[4],
        )
    try:
        items = _load_corpus(path)
    except Exception as exc:
        return _result(
            4,
            name,
            ERROR,
            f"{path.name}: unreadable corpus ({exc}); expected keys text/expected",
            DEPENDENCIES[4],
        )
    if not items:
        return _result(4, name, ERROR, f"{path.name}: corpus is empty", DEPENDENCIES[4])

    from trustcal.agents import parse_position

    matches = 0
    for item in items:
        text = item.get("text", item.get("raw", item.get("output")))
        expected = item.get("expected", item.get("gold", item.get("gold_parse")))
        if text is None or expected is None:
            return _result(
                4,
                name,
                ERROR,
                f"{path.name}: case is missing text/expected (keys: {sorted(item)})",
                DEPENDENCIES[4],
            )
        parsed = str(parse_position(str(text))).strip()
        if parsed == str(expected).strip():
            matches += 1
    rate = matches / len(items)
    detail = f"{path.name}: {matches}/{len(items)} exact = {rate:.1%}; probes: {probe_note}"
    return _result(4, name, PASS if rate >= 0.95 else FAIL, detail, DEPENDENCIES[4])


# --------------------------------------------------------------------------- #
# Check 5/6 — trust
# --------------------------------------------------------------------------- #


def _trust_parameters() -> tuple[Callable | None, dict, str | None]:
    try:
        from trustcal.trust import update_trust
    except Exception as exc:
        return None, {}, f"trust.update not importable ({exc})"
    parameters = inspect.signature(update_trust).parameters
    if "n_claims" not in parameters:
        return update_trust, dict(parameters), "update_trust has no n_claims parameter"
    return update_trust, dict(parameters), None


def check_trust_bound() -> CheckResult:
    name = "trust bound"
    update_trust, parameters, problem = _trust_parameters()
    if update_trust is None or problem:
        return _result(5, name, PENDING, problem or "update_trust unavailable", DEPENDENCIES[5])
    floor = float(parameters["floor"].default) if "floor" in parameters else 0.1
    ceiling = float(parameters["ceiling"].default) if "ceiling" in parameters else 0.9

    import numpy as np

    rng = np.random.default_rng(20261108)
    violations = 0
    first: str | None = None
    for n in (1, 3, 5):
        for _ in range(10_000):
            scores = rng.normal(0.0, 2.0, n)
            support = rng.integers(0, 9, n).astype(float)
            harm = rng.integers(0, 9, n).astype(float)
            n_claims = rng.integers(1, 9, n).astype(float)
            out = np.asarray(update_trust(scores, support, harm, n_claims), dtype=float)
            bad = (
                not np.all(np.isfinite(out))
                or abs(float(out.sum()) - 1.0) > 1e-9
                or float(out.min()) < floor - 1e-9
                or (n > 1 and float(out.max()) > ceiling + 1e-9)
            )
            if bad:
                violations += 1
                if first is None:
                    first = (
                        f"N={n} scores={scores.round(3).tolist()} support={support.tolist()} "
                        f"harm={harm.tolist()} -> {out.round(4).tolist()}"
                    )
    detail = f"30,000 draws N=1,3,5; min>={floor}, sum==1 within 1e-9"
    if violations:
        return _result(5, name, FAIL, f"{violations} violation(s); first: {first}", DEPENDENCIES[5])
    return _result(5, name, PASS, detail)


def check_trust_neutral() -> CheckResult:
    name = "trust neutral/verbosity"
    update_trust, parameters, problem = _trust_parameters()
    if update_trust is None or problem:
        return _result(6, name, PENDING, problem or "update_trust unavailable", DEPENDENCIES[6])

    import numpy as np

    rng = np.random.default_rng(424242)
    neutral_failures = 0
    first_neutral: str | None = None
    for n in (1, 3, 5):
        for _ in range(200):
            scores = rng.dirichlet(np.ones(n))
            out = np.asarray(
                update_trust(scores, np.zeros(n), np.zeros(n), np.zeros(n)), dtype=float
            )
            if float(np.max(np.abs(out - scores))) > 1e-6:
                neutral_failures += 1
                if first_neutral is None:
                    first_neutral = f"N={n} {scores.round(4).tolist()} -> {out.round(4).tolist()}"
    single = np.asarray(update_trust(np.array([1.0]), np.array([1.0]), np.array([0.0]), np.array([1.0])), dtype=float)
    single_ok = abs(float(single[0]) - 1.0) <= 1e-9

    verbosity_failures = 0
    first_verbosity: str | None = None
    for n in (3, 5):
        for _ in range(100):
            scores = rng.dirichlet(np.ones(n))
            support = rng.integers(0, 5, n).astype(float)
            harm = rng.integers(0, 3, n).astype(float)
            claims = rng.integers(1, 4, n).astype(float)
            once = np.asarray(update_trust(scores, support, harm, claims), dtype=float)
            tripled = np.asarray(update_trust(scores, 3 * support, 3 * harm, 3 * claims), dtype=float)
            if float(np.max(np.abs(once - tripled))) > 1e-9:
                verbosity_failures += 1
                if first_verbosity is None:
                    first_verbosity = (
                        f"N={n} claims={claims.tolist()} {once.round(4).tolist()} vs "
                        f"{tripled.round(4).tolist()}"
                    )
    detail = (
        f"neutral identity 600 draws (max dev {neutral_failures}), "
        f"verbosity 200 draws (max dev {verbosity_failures}); N=1 output {single.tolist()}"
    )
    if neutral_failures or verbosity_failures or not single_ok:
        problems = []
        if neutral_failures:
            problems.append(f"neutral evidence changed trust {neutral_failures}x; first {first_neutral}")
        if verbosity_failures:
            problems.append(
                f"duplicating claims changed trust {verbosity_failures}x; first {first_verbosity}"
            )
        if not single_ok:
            problems.append(f"N=1 output is {single.tolist()}, expected [1.0]")
        return _result(6, name, FAIL, "; ".join(problems), DEPENDENCIES[6])
    return _result(6, name, PASS, detail)


# --------------------------------------------------------------------------- #
# Check 7 — B8 vs B8-no-trust
# --------------------------------------------------------------------------- #


class _CaptureClient:
    """Deterministic stand-in for a vLLM client; records every prompt."""

    def __init__(self, answer: str) -> None:
        self.answer = answer
        self.prompts: list[str] = []

    def complete(self, system: str, prompt: str) -> str:
        self.prompts.append(prompt)
        return f'Answer: {self.answer}\n<claim id="c1">claim</claim>'


def _trust_line_switch_available() -> bool:
    from trustcal.agents import prompts

    return hasattr(prompts, "AGENT_REVISION_NEUTRAL") or "{trust_line}" in getattr(
        prompts, "AGENT_REVISION", ""
    )


def _revision_prompts(use_trust: bool) -> list[str]:
    from trustcal.orchestrator import DebateRunner
    from trustcal.trust import TrustConfig

    clients = [_CaptureClient("C"), _CaptureClient("A"), _CaptureClient("A")]
    runner = DebateRunner(
        clients=clients,
        rounds=2,
        trust_config=TrustConfig(use_trust=use_trust),
    )
    runner.run("Gate question?", ["alpha", "beta", "gamma", "delta"])
    # Round-2 prompts are the ones that carry the trust line.
    return list(clients[0].prompts)


def _strip_trust_lines(prompt: str) -> list[str]:
    return [line.strip() for line in prompt.splitlines() if "trust" not in line.lower()]


def check_b8_no_trust() -> CheckResult:
    name = "B8 vs B8-no-trust"
    if not _trust_line_switch_available():
        return _result(
            7,
            name,
            PENDING,
            "no neutral revision prompt / {trust_line} slot in agents/prompts.py",
            DEPENDENCIES[7],
        )
    from trustcal.runner import RunConfig

    on = RunConfig(arm="B8")
    off = RunConfig(arm="B8", use_trust=False)
    differing = [
        field.name
        for field in dataclasses.fields(RunConfig)
        if getattr(on, field.name) != getattr(off, field.name)
    ]
    if differing != ["use_trust"]:
        return _result(
            7,
            name,
            FAIL,
            f"RunConfig B8 vs B8-no-trust differs in {differing}, expected ['use_trust']",
            DEPENDENCIES[7],
        )
    try:
        with_trust = _revision_prompts(True)
        without_trust = _revision_prompts(False)
    except Exception as exc:
        return _result(7, name, ERROR, f"rendering revision prompts failed: {exc}", DEPENDENCIES[7])
    if not with_trust or len(with_trust) != len(without_trust):
        return _result(7, name, ERROR, "revision prompt counts differ", DEPENDENCIES[7])
    for index, (left, right) in enumerate(zip(with_trust, without_trust)):
        if left == right:
            return _result(
                7,
                name,
                FAIL,
                f"prompt {index + 1} is identical with and without trust",
                DEPENDENCIES[7],
            )
        if _strip_trust_lines(left) != _strip_trust_lines(right):
            return _result(
                7,
                name,
                FAIL,
                f"prompt {index + 1} differs outside the trust line",
                DEPENDENCIES[7],
            )
    return _result(
        7, name, PASS, f"{len(with_trust)} revision prompts differ only in the trust line"
    )


# --------------------------------------------------------------------------- #
# Check 8 — B8 + injection mock
# --------------------------------------------------------------------------- #


def check_b8_injection() -> CheckResult:
    name = "B8+injection mock"
    try:
        from trustcal.runner import RunConfig

        fields = {field.name for field in dataclasses.fields(RunConfig)}
    except Exception as exc:
        return _result(8, name, ERROR, f"RunConfig import failed: {exc}", DEPENDENCIES[8])
    if "inject" not in fields:
        return _result(
            8,
            name,
            PENDING,
            "RunConfig has no 'inject' field (B8 x injection not wired)",
            DEPENDENCIES[8],
        )

    from trustcal import runner as runner_module
    from trustcal.retrieval.pipeline import StaticRetriever

    clients = [_CaptureClient("C"), _CaptureClient("A"), _CaptureClient("A")]
    question = {
        "question": "Which option?",
        "answer": "alpha",
        "options": ["beta", "gamma", "alpha", "delta"],
    }
    original = runner_module._retriever

    def fake_retriever(cfg, partition=None):
        return StaticRetriever(fallback=["Evidence passage supports the option."])

    runner_module._retriever = fake_retriever
    try:
        with tempfile.TemporaryDirectory(prefix="p0-gate-") as tmp:
            cfg = RunConfig(
                arm="B8",
                dataset="gpqa",
                limit=1,
                out_root=Path(tmp),
                inject=True,
                use_trust=True,
            )
            runner_module.run(cfg, clients=clients, questions=[question])
            records = runner_module.read_records(runner_module.records_path(cfg))
    except Exception as exc:
        return _result(8, name, ERROR, f"mock B8+injection run failed: {exc}", DEPENDENCIES[8])
    finally:
        runner_module._retriever = original

    if len(records) != 1:
        return _result(8, name, FAIL, f"expected 1 record, got {len(records)}", DEPENDENCIES[8])
    record = records[0]
    injection = record.get("injection") or {}
    problems = []
    if not injection.get("consensus"):
        problems.append("no injection.consensus")
    if not injection.get("targets"):
        problems.append("no injection.targets (exposed empty)")
    if not record.get("trust_trajectory"):
        problems.append("trust_trajectory is null")
    if not record.get("evidence"):
        problems.append("evidence is empty")
    if problems:
        return _result(8, name, FAIL, "; ".join(problems), DEPENDENCIES[8])
    return _result(
        8,
        name,
        PASS,
        f"consensus={injection['consensus']!r}, targets={injection['targets']}, "
        f"trust rounds={len(record['trust_trajectory'])}, evidence rounds={len(record['evidence'])}",
    )


# --------------------------------------------------------------------------- #
# Check 9 — endpoint summary
# --------------------------------------------------------------------------- #


def check_endpoint_summary() -> CheckResult:
    name = "endpoint summary"
    from trustcal.eval.endpoints import REQUIRED_ENDPOINTS, summarize_endpoints
    from trustcal.eval.p0_fixtures import fixture_records

    payload = summarize_endpoints(fixture_records(), strict=True)
    endpoints = payload["endpoints"]
    missing = [endpoint for endpoint in REQUIRED_ENDPOINTS if endpoint not in endpoints]
    if missing:
        return _result(9, name, FAIL, f"missing endpoint(s): {missing}")
    not_ok = [
        endpoint
        for endpoint, result in endpoints.items()
        if result["status"] != "ok" or result["value"] is None
    ]
    if not_ok:
        return _result(9, name, FAIL, f"endpoint(s) without a value: {not_ok}")
    values = ", ".join(f"{endpoint}={endpoints[endpoint]['value']:.3f}" for endpoint in REQUIRED_ENDPOINTS)
    return _result(9, name, PASS, f"{len(REQUIRED_ENDPOINTS)} endpoints on 6 records: {values}")


# --------------------------------------------------------------------------- #
# Check 10 — datasets
# --------------------------------------------------------------------------- #


def check_datasets() -> CheckResult:
    name = "datasets pinned"
    try:
        from trustcal.eval.datasets import _row_to_question

        probe = _row_to_question({"question": "q", "answer": "a", "answer_type": "mcq"}, "hle")
    except Exception as exc:
        return _result(10, name, PENDING, f"loader probe failed ({exc})", DEPENDENCIES[10])
    if probe.get("answer_type") != "mcq":
        return _result(
            10,
            name,
            PENDING,
            "loader drops answer_type (WP-11 not landed)",
            DEPENDENCIES[10],
        )

    import yaml

    config = yaml.safe_load((ROOT / "configs" / "datasets.yaml").read_text(encoding="utf-8")) or {}
    datasets = config.get("datasets") or {}
    if not datasets:
        return _result(10, name, FAIL, "configs/datasets.yaml has no datasets", DEPENDENCIES[10])
    unpinned = {
        dataset: spec.get("revision")
        for dataset, spec in datasets.items()
        if not re.fullmatch(r"[0-9a-f]{7,40}", str(spec.get("revision") or ""))
    }
    if unpinned:
        return _result(
            10,
            name,
            FAIL,
            f"unpinned revision(s): {unpinned}",
            DEPENDENCIES[10],
        )
    return _result(10, name, PASS, f"{len(datasets)} datasets pinned; answer_type preserved")


# --------------------------------------------------------------------------- #
# Check 11 — claim routing
# --------------------------------------------------------------------------- #


def _routing_callable() -> Callable | None:
    try:
        module = importlib.import_module("trustcal.retrieval.routing")
    except Exception:
        module = None
    names = ("route_sources", "sources_for_claim", "route_for_claim", "route", "sources_for")
    for candidate in (module, importlib.import_module("trustcal.retrieval.sources")):
        if candidate is None:
            continue
        for name in names:
            function = getattr(candidate, name, None)
            if callable(function):
                return function
    return None


def _route_names(function: Callable, claim: str) -> list[str]:
    result = function(claim)
    if isinstance(result, dict):
        result = result.get("sources", list(result))
    return [str(item).lower() for item in result]


def check_routing() -> CheckResult:
    name = "claim routing"
    function = _routing_callable()
    if function is None:
        return _result(
            11,
            name,
            PENDING,
            "no claim -> domain routing callable in retrieval/",
            DEPENDENCIES[11],
        )
    try:
        bio = _route_names(function, "p53 tumour suppression in breast cancer cells")
        math_route = _route_names(function, "prime number distribution in modular arithmetic")
    except Exception as exc:
        return _result(
            11,
            name,
            ERROR,
            f"routing callable signature differs (expected fn(claim) -> sources): {exc}",
            DEPENDENCIES[11],
        )
    problems = []
    if "pubmed" not in bio:
        problems.append(f"bio claim routed to {bio}, expected PubMed")
    if "pubmed" in math_route:
        problems.append(f"math claim routed to {math_route}, must not include PubMed")
    if problems:
        return _result(11, name, FAIL, "; ".join(problems), DEPENDENCIES[11])
    return _result(11, name, PASS, f"bio -> {bio}; math -> {math_route}")


# --------------------------------------------------------------------------- #
# Check 12 — manifest resume guard
# --------------------------------------------------------------------------- #


def _refused(result: object) -> bool:
    if result is None or result is True:
        return False
    if result is False:
        return True
    if isinstance(result, (list, tuple, set, dict)):
        return bool(result)
    return bool(result)


def check_manifest_resume() -> CheckResult:
    name = "manifest resume"
    try:
        module = importlib.import_module("trustcal.manifest")
    except Exception as exc:
        return _result(12, name, PENDING, f"manifest module not importable ({exc})", DEPENDENCIES[12])
    guard = None
    for candidate in ("assert_resumable", "check_resume", "ensure_resumable", "resume_guard", "compare_manifests"):
        function = getattr(module, candidate, None)
        if callable(function):
            guard = function
            break
    if guard is None:
        return _result(
            12,
            name,
            ERROR,
            "manifest module has no resume guard (assert_resumable/check_resume/compare_manifests)",
            DEPENDENCIES[12],
        )
    manifest = {
        "config_hash": "aaa111",
        "prompt_hash": "bbb222",
        "code_commit": "ccc333",
        "dataset_revisions": {"gpqa": "633f5ee"},
        "seed": 1,
    }
    other = dict(manifest) | {"config_hash": "ddd444"}
    try:
        same = guard(manifest, dict(manifest))
        mismatch = guard(manifest, other)
    except TypeError as exc:
        return _result(12, name, ERROR, f"resume guard signature differs: {exc}", DEPENDENCIES[12])
    if _refused(same):
        return _result(12, name, FAIL, "identical manifests were refused", DEPENDENCIES[12])
    if not _refused(mismatch):
        return _result(12, name, FAIL, "manifest mismatch was accepted", DEPENDENCIES[12])
    return _result(12, name, PASS, "mismatch refused, identical manifest accepted")


# --------------------------------------------------------------------------- #
# Check 13 — matrix budget + pre-registration
# --------------------------------------------------------------------------- #


def _matrix_gpu_hours(config: dict, minutes_per_debate: float = GPU_MINUTES_PER_DEBATE) -> tuple[int, float]:
    conditions = config.get("conditions") or {}
    datasets = config.get("datasets") or []
    seeds = config.get("seeds") or []
    caps = config.get("sample_caps") or {}
    cap = int(caps.get("main", 1000))
    runs = len(conditions) * len(datasets) * len(seeds) * cap
    return runs, runs * minutes_per_debate / 60.0


def _find_preregistration() -> Path | None:
    for candidate in (
        REPO / "PRE_REGISTRATION.md",
        REPO / "docs" / "PRE_REGISTRATION.md",
        ROOT / "PRE_REGISTRATION.md",
    ):
        if candidate.is_file():
            return candidate
    return None


def check_matrix_budget() -> CheckResult:
    name = "matrix budget"
    import yaml

    config = yaml.safe_load((ROOT / "configs" / "experiments.yaml").read_text(encoding="utf-8")) or {}
    runs, hours = _matrix_gpu_hours(config)
    prereg = _find_preregistration()
    detail = (
        f"{runs:,} debates x {GPU_MINUTES_PER_DEBATE:.0f} min = {hours:,.0f} GPU-h "
        f"(budget {MATRIX_BUDGET_GPU_HOURS:,.0f}); PRE_REGISTRATION.md "
        f"{'at ' + str(prereg.relative_to(REPO)) if prereg else 'missing'}"
    )
    if hours > MATRIX_BUDGET_GPU_HOURS and prereg is None:
        return _result(
            13,
            name,
            PENDING,
            f"matrix not cut yet: {detail}",
            DEPENDENCIES[13],
        )
    if hours > MATRIX_BUDGET_GPU_HOURS:
        return _result(13, name, FAIL, f"over budget: {detail}", DEPENDENCIES[13])
    if prereg is None:
        return _result(13, name, PENDING, f"pre-registration missing: {detail}", DEPENDENCIES[13])
    return _result(13, name, PASS, detail)


# --------------------------------------------------------------------------- #
# Registry and CLI
# --------------------------------------------------------------------------- #


def default_checks() -> list[Check]:
    return [
        Check(1, "pytest", check_pytest),
        Check(2, "record schema", check_record_schema, DEPENDENCIES[2]),
        Check(3, "options in prompts", check_options_in_prompts, DEPENDENCIES[3]),
        Check(4, "parser corpus", check_parser_corpus, DEPENDENCIES[4]),
        Check(5, "trust bound", check_trust_bound, DEPENDENCIES[5]),
        Check(6, "trust neutral/verbosity", check_trust_neutral, DEPENDENCIES[6]),
        Check(7, "B8 vs B8-no-trust", check_b8_no_trust, DEPENDENCIES[7]),
        Check(8, "B8+injection mock", check_b8_injection, DEPENDENCIES[8]),
        Check(9, "endpoint summary", check_endpoint_summary),
        Check(10, "datasets pinned", check_datasets, DEPENDENCIES[10]),
        Check(11, "claim routing", check_routing, DEPENDENCIES[11]),
        Check(12, "manifest resume", check_manifest_resume, DEPENDENCIES[12]),
        Check(13, "matrix budget", check_matrix_budget, DEPENDENCIES[13]),
    ]


def main(argv: list[str] | None = None, checks: list[Check] | None = None) -> int:
    parser = argparse.ArgumentParser(description="P0 gate: 13 checks before any GPU run")
    parser.add_argument("--json", action="store_true", help="machine-readable report on stdout")
    parser.add_argument(
        "--allow-pending",
        action="store_true",
        help="PENDING checks (owner slice not landed) do not fail the run",
    )
    parser.add_argument("--only", help="comma-separated check ids to run (e.g. 1,9)")
    parser.add_argument("--list", action="store_true", help="list the checks and exit")
    args = parser.parse_args(argv)

    registry = checks if checks is not None else default_checks()
    if args.list:
        for check in registry:
            dependency = f"  [{check.dependency}]" if check.dependency else ""
            print(f"{check.id:>2}  {check.name}{dependency}")
        return 0
    try:
        selected = _select(registry, args.only)
    except argparse.ArgumentTypeError as exc:
        parser.error(str(exc))
        return 2  # unreachable; parser.error raises SystemExit

    report = run_gate(selected, allow_pending=args.allow_pending)
    if args.json:
        print(json.dumps(report, indent=2))
    else:
        _print_table(report)
    return int(report["exit_code"])


if __name__ == "__main__":
    sys.exit(main())
