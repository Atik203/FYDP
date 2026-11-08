"""P0-0 tests: seeded option rendering, prompt coverage, and record fields."""

from __future__ import annotations

import json

import pytest

from ..agents.prompts import (
    AGENT_INITIAL,
    AGENT_REVISION,
    AGENT_REVISION_EVIDENCE,
    CONFIDENCE_INITIAL,
    CONSENSAGENT_REVISION,
    GATE_PROMPT,
    IMAD_SELF_CRITIQUE,
    MOA_AGGREGATE,
)
from ..orchestrator import DebateRunner
from ..orchestrator.strategies import (
    run_consensagent,
    run_imad,
    run_moa,
    run_self_consistency,
    run_single,
    run_single_rag,
)
from ..retrieval.pipeline import StaticRetriever
from ..runner import RunConfig, read_records, records_path, run
from .answers import choice_letter
from .options import CHOICE_LETTERS, FREE_TEXT_BLOCK, RenderedOptions, build_options

OPTIONS = ["alpha structure", "beta structure", "gamma structure", "delta structure"]
QUESTION = {"question": "Which structure is correct?", "answer": "gamma structure", "options": OPTIONS}


class FakeClient:
    def __init__(self, answer: str = "Answer: A") -> None:
        self.answer = answer
        self.calls: list[tuple[str, str]] = []

    def complete(self, system: str, user: str) -> str:
        self.calls.append((system, user))
        return self.answer


def _rendered(seed: int = 11) -> RenderedOptions:
    return build_options(QUESTION, seed, "local-0000")


def _assert_options_once(text: str, rendered: RenderedOptions) -> None:
    for option in rendered.options:
        assert text.count(option) == 1, f"{option!r} occurs {text.count(option)}x"


def test_free_text_question_gets_no_fabricated_options() -> None:
    rendered = build_options({"question": "Prove it", "answer": "x", "options": None}, 1, "hle-0")
    assert rendered.options == []
    assert rendered.permutation == []
    assert rendered.gold_letter is None
    assert rendered.block == FREE_TEXT_BLOCK


def test_rendering_is_deterministic_and_seeded() -> None:
    first = build_options(QUESTION, 7, "gpqa-0000")
    second = build_options(QUESTION, 7, "gpqa-0000")
    assert first == second
    assert first.options != OPTIONS  # a real shuffle for this seed
    assert sorted(first.permutation) == list(range(len(OPTIONS)))
    assert first.options == [OPTIONS[index] for index in first.permutation]


def test_gold_letter_tracks_permutation() -> None:
    rendered = build_options(QUESTION, 3, "gpqa-0000")
    gold_index = OPTIONS.index("gamma structure")
    rendered_index = rendered.permutation.index(gold_index)
    assert rendered.gold_letter == CHOICE_LETTERS[rendered_index]
    assert rendered.options[rendered_index] == "gamma structure"


def test_correct_option_is_not_always_first_across_100_questions() -> None:
    first_positions = 0
    gold_letters = set()
    for index in range(100):
        question = {
            "question": f"Question {index}?",
            "answer": f"correct answer {index}",
            "options": [f"correct answer {index}"] + [f"wrong {index} {j}" for j in range(3)],
        }
        rendered = build_options(question, 1, f"gpqa-{index:04d}")
        first_positions += rendered.options[0] == f"correct answer {index}"
        gold_letters.add(rendered.gold_letter)
    assert first_positions < 100
    assert len(gold_letters) > 1


def test_mmlu_pro_ten_options_use_a_to_j() -> None:
    question = {
        "question": "Pick one",
        "answer": "option 9",
        "options": [f"option {i}" for i in range(10)],
    }
    rendered = build_options(question, 2, "mmlu_pro-0000")
    assert len(rendered.options) == 10
    assert rendered.block.count("\n") >= 10
    assert "J)" in rendered.block
    assert rendered.gold_letter in set(CHOICE_LETTERS)


def test_every_question_prompt_contains_all_options_once() -> None:
    rendered = _rendered()
    kwargs = {
        "agent_id": 1,
        "question": QUESTION["question"],
        "options_block": rendered.block,
        "round": 2,
        "rounds": 3,
        "own_position": "previous position",
        "peer_positions": "Agent 2: another position",
        "trust": 0.5,
        "evidence": "a passage",
        "proposals": "Agent 1: A",
    }
    templates = [
        (AGENT_INITIAL, {"agent_id", "question", "options_block"}),
        (AGENT_REVISION, {"agent_id", "round", "rounds", "question", "options_block", "own_position", "trust", "peer_positions"}),
        (
            AGENT_REVISION_EVIDENCE,
            {"agent_id", "round", "rounds", "question", "options_block", "own_position", "trust", "evidence", "peer_positions"},
        ),
        (GATE_PROMPT, {"question", "options_block"}),
        (IMAD_SELF_CRITIQUE, {"question", "options_block"}),
        (CONFIDENCE_INITIAL, {"agent_id", "question", "options_block"}),
        (MOA_AGGREGATE, {"question", "options_block", "proposals"}),
        (CONSENSAGENT_REVISION, {"agent_id", "round", "rounds", "question", "options_block", "own_position", "peer_positions"}),
    ]
    for template, expected_slots in templates:
        assert "{options_block}" in template
        assert expected_slots <= set(kwargs)
        formatted = template.format(**kwargs)
        _assert_options_once(formatted, rendered)


def test_strategy_prompts_render_the_block() -> None:
    rendered = _rendered()
    clients = [FakeClient("Answer: A") for _ in range(3)]
    run_single(QUESTION, clients[0], seed=11, question_id="local-0000")
    run_single_rag(QUESTION, clients[0], StaticRetriever(fallback=["passage"]), seed=11, question_id="local-0000")
    run_self_consistency(QUESTION, clients[0], samples=2, seed=11, question_id="local-0000")
    run_moa(QUESTION, clients, layers=2, seed=11, question_id="local-0000")
    run_imad(QUESTION, clients, rounds=2, seed=11, question_id="local-0000")
    run_consensagent(QUESTION, clients, rounds=2, seed=11, question_id="local-0000")
    for client in clients:
        for _, prompt in client.calls:
            _assert_options_once(prompt, rendered)


def test_free_text_prompt_renders_free_text_block() -> None:
    rendered = build_options({"question": "Prove it", "answer": "x", "options": None}, 1, "hle-0")
    prompt = AGENT_INITIAL.format(
        agent_id=1, question="Prove it", options_block=rendered.block
    )
    assert FREE_TEXT_BLOCK in prompt
    assert "A)" not in prompt


def test_b1_record_stores_option_permutation(tmp_path) -> None:
    cfg = RunConfig(arm="B1", dataset="local", limit=1, seed=11, out_root=tmp_path)
    run(cfg, clients=[FakeClient("Answer: A")], questions=[QUESTION])
    record = read_records(records_path(cfg))[0]
    rendered = build_options(QUESTION, cfg.seed, "local-0000")
    assert record["options_raw"] == OPTIONS
    assert record["options"] == rendered.options
    assert record["option_permutation"] == rendered.permutation
    assert record["gold_letter_rendered"] == rendered.gold_letter
    assert record["parser_version"] == "p0-1"
    assert record["raw_answer"] == "Answer: A"
    assert record["parsed_answer"] == "A"


def test_b3_debate_record_stores_option_permutation(tmp_path) -> None:
    cfg = RunConfig(arm="B3", dataset="local", limit=1, seed=5, out_root=tmp_path, rounds=2)
    clients = [FakeClient("Answer: A") for _ in range(3)]
    run(cfg, clients=clients, questions=[QUESTION])
    record = read_records(records_path(cfg))[0]
    rendered = build_options(QUESTION, cfg.seed, "local-0000")
    assert record["option_permutation"] == rendered.permutation
    assert record["options"] == rendered.options


def test_mock_debate_letter_maps_to_rendered_option(tmp_path) -> None:
    rendered = build_options(QUESTION, 5, "local-0000")
    letter = rendered.gold_letter
    assert letter is not None
    cfg = RunConfig(arm="B3", dataset="local", limit=1, seed=5, out_root=tmp_path, rounds=2)
    clients = [FakeClient(f"Answer: {letter}") for _ in range(3)]
    run(cfg, clients=clients, questions=[QUESTION])
    record = read_records(records_path(cfg))[0]

    assert record["gold_letter_rendered"] == letter
    assert all(answer == letter for answer in record["rounds"][-1]["answers"])
    answer = record["rounds"][-1]["answers"][0]
    resolved = choice_letter(answer, record["options"])
    assert resolved == letter
    assert record["options"][CHOICE_LETTERS.index(resolved)] == "gamma structure"


REQUIRED_V2_FIELDS = (
    "question_id",
    "arm",
    "seed",
    "question",
    "gold",
    "options_raw",
    "options",
    "option_permutation",
    "gold_letter_rendered",
    "raw_answer",
    "parsed_answer",
    "parser_version",
    "final_answer",
    "final_answer_correct",
    "final_answer_source",
)


def _validate_record(record: dict) -> None:
    """Local stand-in for WP-04's eval/records.py (not on this branch yet)."""
    missing = [key for key in REQUIRED_V2_FIELDS if key not in record]
    if missing:
        raise ValueError(f"record missing required fields: {missing}")


def test_missing_final_answer_fails_validation(tmp_path) -> None:
    cfg = RunConfig(arm="B1", dataset="local", limit=1, seed=11, out_root=tmp_path)
    run(cfg, clients=[FakeClient("Answer: A")], questions=[QUESTION])
    record = read_records(records_path(cfg))[0]

    with pytest.raises(ValueError, match="final_answer"):
        _validate_record(record)

    record.update(
        final_answer="gamma structure",
        final_answer_correct=True,
        final_answer_source="single",
    )
    _validate_record(record)  # no raise
