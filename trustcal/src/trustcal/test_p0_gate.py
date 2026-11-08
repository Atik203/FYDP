"""Tests for the P0 gate harness (scripts/p0_gate.py).

The real checks belong to other work packages; these tests prove the harness
classifies PASS/FAIL/PENDING/ERROR correctly, emits the JSON shape downstream
tooling reads, and computes exit codes from ``--allow-pending``.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "scripts"))

import p0_gate  # noqa: E402


def _fake(check_id: int, status: str, dependency: str | None = None) -> p0_gate.Check:
    def run() -> p0_gate.CheckResult:
        return p0_gate.CheckResult(check_id, f"fake {check_id}", status, f"detail {check_id}")

    return p0_gate.Check(check_id, f"fake {check_id}", run, dependency)


def _raising() -> p0_gate.Check:
    def run() -> p0_gate.CheckResult:
        raise RuntimeError("kaboom")

    return p0_gate.Check(1, "explodes", run, "WP-X")


def test_harness_records_every_status() -> None:
    checks = [
        _fake(1, p0_gate.PASS),
        _fake(2, p0_gate.FAIL),
        _fake(3, p0_gate.PENDING, "WP-03"),
        _fake(4, p0_gate.ERROR),
    ]
    report = p0_gate.run_gate(checks, allow_pending=False)
    assert [check["status"] for check in report["checks"]] == [
        p0_gate.PASS,
        p0_gate.FAIL,
        p0_gate.PENDING,
        p0_gate.ERROR,
    ]
    assert report["summary"] == {"total": 4, "pass": 1, "fail": 1, "pending": 1, "error": 1}


def test_pending_check_carries_its_dependency() -> None:
    report = p0_gate.run_gate([_fake(3, p0_gate.PENDING)], allow_pending=True)
    assert report["checks"][0]["dependency"] is None  # set on the Check, not the result
    report = p0_gate.run_gate([_fake(3, p0_gate.PENDING, "WP-03")], allow_pending=True)
    assert report["checks"][0]["dependency"] == "WP-03"


def test_raising_check_becomes_error_not_a_crash() -> None:
    report = p0_gate.run_gate([_raising()], allow_pending=False)
    check = report["checks"][0]
    assert check["status"] == p0_gate.ERROR
    assert "kaboom" in check["detail"]
    assert report["exit_code"] == 1


def test_invalid_status_is_promoted_to_error() -> None:
    report = p0_gate.run_gate([_fake(1, "MAYBE")], allow_pending=False)
    assert report["checks"][0]["status"] == p0_gate.ERROR


@pytest.mark.parametrize(
    ("statuses", "allow_pending", "expected"),
    [
        ([p0_gate.PASS, p0_gate.PASS], False, 0),
        ([p0_gate.PASS, p0_gate.FAIL], False, 1),
        ([p0_gate.PASS, p0_gate.ERROR], False, 1),
        ([p0_gate.PASS, p0_gate.PENDING], False, 1),
        ([p0_gate.PASS, p0_gate.PENDING], True, 0),
        ([p0_gate.PASS, p0_gate.FAIL, p0_gate.PENDING], True, 1),
    ],
)
def test_exit_code_only_passes_a_clean_gate(statuses, allow_pending, expected) -> None:
    checks = [_fake(index + 1, status) for index, status in enumerate(statuses)]
    report = p0_gate.run_gate(checks, allow_pending=allow_pending)
    assert report["exit_code"] == expected
    assert report["allow_pending"] is allow_pending


def test_json_report_shape(capsys) -> None:
    checks = [_fake(1, p0_gate.PASS), _fake(2, p0_gate.FAIL), _fake(3, p0_gate.PENDING, "WP-03")]
    code = p0_gate.main(["--json"], checks=checks)
    payload = json.loads(capsys.readouterr().out)
    assert code == 1
    assert set(payload) >= {"generated_at", "allow_pending", "summary", "exit_code", "checks"}
    assert payload["summary"]["total"] == 3
    entry = payload["checks"][0]
    assert set(entry) == {"id", "name", "status", "detail", "dependency", "duration_s"}
    assert payload["checks"][2]["dependency"] == "WP-03"


def test_allow_pending_flag_controls_the_exit_code(capsys) -> None:
    checks = [_fake(1, p0_gate.PASS), _fake(2, p0_gate.PENDING, "WP-03")]
    assert p0_gate.main(["--json"], checks=checks) == 1
    capsys.readouterr()
    assert p0_gate.main(["--json", "--allow-pending"], checks=checks) == 0


def test_registry_has_thirteen_named_checks() -> None:
    checks = p0_gate.default_checks()
    assert [check.id for check in checks] == list(range(1, 14))
    assert len({check.name for check in checks}) == 13
    # Check 1 (pytest) and check 9 (endpoints) are owned here; the rest name
    # the slice they wait on.
    dependencies = {check.id: check.dependency for check in checks}
    assert dependencies[1] is None
    assert dependencies[9] is None
    assert all(dependencies[check_id] for check_id in dependencies if check_id not in (1, 9))


def test_only_runs_the_selected_check(capsys) -> None:
    code = p0_gate.main(["--json", "--only", "9"], checks=None)
    payload = json.loads(capsys.readouterr().out)
    assert code == 0
    assert payload["summary"]["total"] == 1
    assert payload["checks"][0]["id"] == 9
    assert payload["checks"][0]["status"] == p0_gate.PASS


def test_only_rejects_unknown_ids() -> None:
    with pytest.raises(SystemExit):
        p0_gate.main(["--only", "99"], checks=[_fake(1, p0_gate.PASS)])


def test_list_prints_the_registry(capsys) -> None:
    code = p0_gate.main(["--list"], checks=[_fake(1, p0_gate.PASS, "WP-01")])
    output = capsys.readouterr().out
    assert code == 0
    assert "fake 1" in output
    assert "WP-01" in output


def test_pytest_command_is_the_quick_selection() -> None:
    command = p0_gate._pytest_command()
    assert "-m" in command and "pytest" in command
    assert "--ignore=.venv" in command


def test_matrix_gpu_hours_math() -> None:
    config = {
        "conditions": {"A": {}, "B": {}},
        "datasets": ["gpqa", "mmlu_pro"],
        "seeds": [1, 2],
        "sample_caps": {"main": 100},
    }
    runs, hours = p0_gate._matrix_gpu_hours(config, minutes_per_debate=8.0)
    assert runs == 2 * 2 * 2 * 100
    assert hours == pytest.approx(800 * 8 / 60)


def _stub_manifest_module(accept_mismatch: bool):
    import types

    module = types.ModuleType("trustcal.manifest")

    class ManifestMismatch(RuntimeError):
        pass

    module.ManifestMismatch = ManifestMismatch
    module.build_manifest = lambda **kwargs: {"config_hash": "aaa", "seed": kwargs.get("seed", 0)}
    module.write_manifest = lambda path, manifest: Path(path).write_text(
        json.dumps(manifest), encoding="utf-8"
    )

    def check_resume(path, current_manifest):
        if not accept_mismatch:
            previous = json.loads(Path(path).read_text(encoding="utf-8"))
            if previous != current_manifest:
                raise ManifestMismatch("differs")

    module.check_resume = check_resume
    return module


def test_manifest_path_guard_is_driven_correctly(monkeypatch) -> None:
    monkeypatch.setitem(sys.modules, "trustcal.manifest", _stub_manifest_module(False))
    result = p0_gate.check_manifest_resume()
    assert result.status == p0_gate.PASS


def test_manifest_guard_that_accepts_mismatch_fails(monkeypatch) -> None:
    monkeypatch.setitem(sys.modules, "trustcal.manifest", _stub_manifest_module(True))
    result = p0_gate.check_manifest_resume()
    assert result.status == p0_gate.FAIL
    assert "mismatch was accepted" in result.detail


def test_options_probe_counts_each_option_once() -> None:
    result = p0_gate.check_options_in_prompts()
    assert result.status == p0_gate.PASS, result.detail


def test_parser_corpus_probe_finds_the_50_case_fixture() -> None:
    result = p0_gate.check_parser_corpus()
    assert result.status == p0_gate.PASS, result.detail
    assert "50/50" in result.detail
