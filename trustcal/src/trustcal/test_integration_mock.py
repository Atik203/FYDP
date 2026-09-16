"""End-to-end pipeline test against mock vLLM servers — no GPU, no network.

This is the test that would have caught every Phase 0 wiring failure before the
paid session: api-key construction, HTTP path, prompt assembly, retry, parsing,
runner records, metric computation.
"""

from __future__ import annotations

import pytest

from .inference.client import VLLMClient
from .mock_vllm import base_urls, start_mock_trio, stop_all
from .runner import RunConfig, read_records, records_path, run

OPTIONS = ["mitochondrial matrix", "cytoplasm", "nucleus", "reticulum"]
QUESTIONS = [{"question": "Where does the Krebs cycle occur?", "answer": "nucleus", "options": OPTIONS}]


@pytest.fixture()
def mock_trio():
    servers = start_mock_trio(mode="divergent")
    yield servers
    stop_all(servers)


def _clients(servers, temperature: float = 0.0) -> list[VLLMClient]:
    return [
        VLLMClient(url, model=f"mock-agent{i + 1}", temperature=temperature)
        for i, url in enumerate(base_urls(servers))
    ]


def test_b3_against_mock_servers(tmp_path, mock_trio) -> None:
    cfg = RunConfig(arm="B3", limit=1, seed=3, out_root=tmp_path, rounds=3)
    clients = _clients(mock_trio)
    summary = run(cfg, clients=clients, questions=QUESTIONS)

    records = read_records(records_path(cfg))
    assert len(records) == 1
    record = records[0]

    # raw transcript carried through
    assert len(record["transcript"]) == 3
    assert len(record["rounds"][0]["answers"]) == 3
    # divergent personas: C, B, B -> gold "nucleus" is option C -> minority correct
    assert record["rounds"][0]["answers"] == ["C", "B", "B"]
    assert summary.n_debates == 1
    assert summary.n_divergent == 1
    # no injection in B3 -> no CCR exposure; the minority (correct) holds its "C"
    assert summary.n_exposed == 0
    assert summary.mpr == 1.0
    assert summary.per_debate[0].preserved is True


def test_b1_against_mock_servers(tmp_path, mock_trio) -> None:
    cfg = RunConfig(arm="B1", limit=1, seed=3, out_root=tmp_path)
    summary = run(cfg, clients=_clients(mock_trio)[:1], questions=QUESTIONS)
    record = read_records(records_path(cfg))[0]
    assert record["rounds"][0]["answers"] == ["C"]
    assert summary.n_debates == 1


def test_claim_tags_parsed_from_mock(tmp_path, mock_trio) -> None:
    from .agents import extract_claims

    text = _clients(mock_trio)[0].complete("sys", "usr")
    claims = extract_claims(text)
    assert claims == [("c1", "This follows from the base rate.")]


def test_health_endpoint_matches_verify_env(mock_trio) -> None:
    import json
    import urllib.request

    for url in base_urls(mock_trio):
        with urllib.request.urlopen(f"{url}/models", timeout=5) as resp:
            payload = json.load(resp)
        assert payload["data"][0]["id"].startswith("mock-agent")
