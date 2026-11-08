"""Baseline strategies B1-B10 that are not the plain trust loop.

Each function returns the same result package shape as ``DebateRunner.run`` so
the runner, metrics, and failure taxonomy treat every arm identically.

Fidelity notes (also in trustcal/IMPLEMENTATION_STATUS.md):
  * B9 iMAD uses a transparent confidence/hesitation gate, not the paper's
    trained FocusCal MLP. The interface matches; swap the gate after Gate 2.
  * B10 ConsensAgent implements the trigger + confidence/consistency aggregation
    but not the fine-tuned GPT-4o prompt optimizer (needs a trained model).
"""

from __future__ import annotations

import re
from dataclasses import dataclass
from hashlib import sha256
from typing import Callable

from ..agents import (
    AGENT_INITIAL,
    AGENT_SYSTEM,
    CONFIDENCE_INITIAL,
    CONSENSAGENT_REVISION,
    CONSENSAGENT_REWRITE,
    IMAD_SELF_CRITIQUE,
    MOA_AGGREGATE,
    parse_position,
)
from ..eval.answers import canonical, majority_answer, same_answer
from ..eval.options import RenderedOptions, build_options
from ..retrieval.pipeline import RetrievalConfig, Retriever, evidence_block
from ..trust import TrustConfig, aggregate
from .debate import DebateRunner

_CONF_RE = re.compile(r"confidence\s*[:\-]\s*([0-9]*\.?[0-9]+)", re.IGNORECASE)
_HEDGES = ("not sure", "uncertain", "unclear", "might", "may be", "could be", "likely", "probably", "guess")


def _question_key(question: str) -> str:
    return "adhoc-" + sha256((question or "").encode("utf-8")).hexdigest()[:16]


def _render(question: dict, seed: int, question_id: str) -> RenderedOptions:
    return build_options(
        question, seed, question_id or _question_key(question.get("question", ""))
    )


def parse_confidence(text: str, default: float = 0.5) -> float:
    match = _CONF_RE.search(text or "")
    if not match:
        return default
    try:
        value = float(match.group(1))
    except ValueError:
        return default
    return min(max(value, 0.0), 1.0)


def _entry(round_number: int, positions: list[str], **extra) -> dict:
    return {"round": round_number, "positions": positions, **extra}


def _package(
    question: str,
    transcript: list[dict],
    rounds_completed: int,
    weight: float = 1.0,
    rendered: RenderedOptions | None = None,
) -> dict:
    positions = transcript[-1]["positions"]
    options = (rendered.options or None) if rendered is not None else None
    raw_options = None
    if rendered is not None and rendered.options:
        raw_options = [
            rendered.options[rendered.permutation.index(index)]
            for index in range(len(rendered.permutation))
        ]
    return {
        "question": question,
        "final_positions": positions,
        "rounds_completed": rounds_completed,
        "transcript": transcript,
        "injection": None,
        "trust_trajectory": None,
        "verdicts": [],
        "evidence": [],
        "aggregation": aggregate(
            [weight] * len(positions), [parse_position(p) for p in positions], options
        ),
        "final_trust": [weight] * len(positions),
        "options_raw": raw_options,
        "options": options,
        "option_permutation": (rendered.permutation or None) if rendered is not None else None,
        "gold_letter_rendered": rendered.gold_letter if rendered is not None else None,
    }


def run_single(question: dict, client, seed: int = 0, question_id: str = "") -> dict:
    """B1 — one agent, one call, no retrieval, no debate."""
    rendered = _render(question, seed, question_id)
    text = client.complete(
        AGENT_SYSTEM,
        AGENT_INITIAL.format(
            agent_id=1, question=question["question"], options_block=rendered.block
        ),
    )
    return _package(question["question"], [_entry(1, [text])], 1, rendered=rendered)


def run_single_rag(
    question: dict, client, retriever: Retriever, seed: int = 0, question_id: str = ""
) -> dict:
    """B2 — single agent with retrieval before answering."""
    rendered = _render(question, seed, question_id)
    passages = retriever.retrieve(0, question["question"])
    prompt = AGENT_INITIAL.format(
        agent_id=1, question=question["question"], options_block=rendered.block
    )
    prompt += "\n\nEvidence retrieved:\n" + evidence_block(passages)
    text = client.complete(AGENT_SYSTEM, prompt)
    return _package(question["question"], [_entry(1, [text])], 1, rendered=rendered)


def run_self_consistency(
    question: dict, client, samples: int = 5, seed: int = 0, question_id: str = ""
) -> dict:
    """B5 — sample the same agent N times, majority vote."""
    rendered = _render(question, seed, question_id)
    prompt = AGENT_INITIAL.format(
        agent_id=1, question=question["question"], options_block=rendered.block
    )
    positions = [client.complete(AGENT_SYSTEM, prompt) for _ in range(max(2, samples))]
    return _package(question["question"], [_entry(1, positions)], 1, rendered=rendered)


def run_moa(
    question: dict, clients: list, layers: int = 2, seed: int = 0, question_id: str = ""
) -> dict:
    """B6 — Mixture-of-Agents: proposer layer then aggregator layer."""
    rendered = _render(question, seed, question_id)
    transcript: list[dict] = []
    positions = [
        client.complete(
            AGENT_SYSTEM,
            AGENT_INITIAL.format(
                agent_id=i, question=question["question"], options_block=rendered.block
            ),
        )
        for i, client in enumerate(clients, start=1)
    ]
    transcript.append(_entry(1, positions, layer=1))
    for layer in range(2, max(2, layers) + 1):
        proposals = "\n\n".join(f"Agent {i}: {p[:1500]}" for i, p in enumerate(positions, start=1))
        prompt = MOA_AGGREGATE.format(
            question=question["question"], options_block=rendered.block, proposals=proposals
        )
        positions = [client.complete(AGENT_SYSTEM, prompt) for client in clients]
        transcript.append(_entry(layer, positions, layer=layer))
    return _package(question["question"], transcript, len(transcript), rendered=rendered)


@dataclass(frozen=True)
class DebateGate:
    """Heuristic stand-in for iMAD's FocusCal classifier (documented deviation)."""

    threshold: float = 0.7

    def should_debate(self, text: str, confidence: float, alternative: str = "") -> bool:
        """Heuristic stand-in for the FocusCal score.

        The structured self-critique always contains an alternative, so its
        presence alone is not a trigger; low confidence and hesitation cues are
        the signals this approximation uses. ``alternative`` is kept in the
        signature/log for the future trained gate.
        """
        if confidence < self.threshold:
            return True
        lowered = (text or "").lower()
        return any(term in lowered for term in _HEDGES)


def run_imad(
    question: dict,
    clients: list,
    rounds: int = 3,
    gate: DebateGate | None = None,
    seed: int = 0,
    question_id: str = "",
) -> dict:
    """B9 — selective debate: self-critique, gate, then MAD only when triggered."""
    gate = gate or DebateGate()
    rendered = _render(question, seed, question_id)
    text = clients[0].complete(
        AGENT_SYSTEM,
        IMAD_SELF_CRITIQUE.format(
            question=question["question"], options_block=rendered.block
        ),
    )
    confidence = parse_confidence(text)
    alternative = ""
    match = re.search(r"alternative\s*[:\-]\s*([^\n]+)", text, re.IGNORECASE)
    if match:
        alternative = match.group(1).strip()
    triggered = gate.should_debate(text, confidence, alternative) and len(clients) > 1

    if triggered:
        result = DebateRunner(
            clients=clients,
            rounds=rounds,
            seed=seed,
            question_id=question_id or _question_key(question["question"]),
            gold=question.get("answer"),
        ).run(question["question"], question.get("options"))
    else:
        result = _package(question["question"], [_entry(1, [text])], 1, rendered=rendered)
    result["imad"] = {
        "confidence": confidence,
        "alternative": alternative,
        "triggered": triggered,
        "gate": {"threshold": gate.threshold},
    }
    return result


def _jaccard(a: str, b: str) -> float:
    left = set(re.findall(r"[a-z0-9]+", (a or "").lower()))
    right = set(re.findall(r"[a-z0-9]+", (b or "").lower()))
    if not left or not right:
        return 0.0
    return len(left & right) / len(left | right)


def _copy_triggered(previous: list[str], current: list[str], answers_prev: list[str], answers_now: list[str]) -> bool:
    for i, (before, after) in enumerate(zip(answers_prev, answers_now)):
        if same_answer(before, after):
            continue
        for j, peer_answer in enumerate(answers_prev):
            if i == j or not same_answer(after, peer_answer):
                continue
            if _jaccard(previous[i], current[i]) > 0.8:
                return True
    return False


def consensus_weighted_answer(
    answers_by_round: list[list[str]],
    confidences_by_round: list[list[float]],
    options: list[str] | None = None,
) -> str | None:
    """Phase 4 of ConsensAgent: confidence + consistency, not a single judge."""
    if not answers_by_round:
        return None
    final = answers_by_round[-1]
    groups: dict[str, list[int]] = {}
    for i, answer in enumerate(final):
        groups.setdefault(canonical(answer, options), []).append(i)
    best_score = -1.0
    best_answer = final[0] if final else None
    for indices in groups.values():
        confidence = sum(confidences_by_round[-1][i] for i in indices) / len(indices)
        consistency = sum(
            1
            for i in indices
            if all(
                same_answer(answers_by_round[r][i], final[i], options)
                for r in range(len(answers_by_round))
            )
        ) / len(indices)
        score = confidence + 0.2 * consistency
        if score > best_score:
            best_score = score
            best_answer = final[indices[0]]
    return best_answer


def run_consensagent(
    question: dict,
    clients: list,
    rounds: int = 3,
    rewriter: Callable[[str], str] | None = None,
    seed: int = 0,
    question_id: str = "",
) -> dict:
    """B10 — trigger-based debate + confidence/consistency aggregation.

    The prompt-optimization phase is opt-in via ``rewriter``; without a trained
    optimizer the trigger is still logged, which keeps the aggregation comparison
    honest and the deviation explicit.
    """
    rendered = _render(question, seed, question_id)
    task = question["question"]
    transcript: list[dict] = []
    answers_by_round: list[list[str]] = []
    confidences_by_round: list[list[float]] = []

    texts = [
        client.complete(
            AGENT_SYSTEM,
            CONFIDENCE_INITIAL.format(
                agent_id=i, question=task, options_block=rendered.block
            ),
        )
        for i, client in enumerate(clients, start=1)
    ]
    transcript.append(_entry(1, texts, confidence=[parse_confidence(t) for t in texts]))
    answers_by_round.append([parse_position(t) for t in texts])
    confidences_by_round.append([parse_confidence(t) for t in texts])

    triggers: list[dict] = []
    rewrite_used = False
    for r in range(2, rounds + 1):
        peers = "\n\n".join(
            f"Agent {i}: {answers_by_round[-1][i - 1]} (confidence {confidences_by_round[-1][i - 1]:.2f})"
            for i in range(1, len(clients) + 1)
        )
        new_texts = [
            client.complete(
                AGENT_SYSTEM,
                CONSENSAGENT_REVISION.format(
                    agent_id=i,
                    round=r,
                    rounds=rounds,
                    question=task,
                    options_block=rendered.block,
                    own_position=texts[i - 1],
                    peer_positions=peers,
                ),
            )
            for i, client in enumerate(clients, start=1)
        ]
        new_answers = [parse_position(t) for t in new_texts]
        new_conf = [parse_confidence(t) for t in new_texts]

        stalled = all(
            same_answer(a, b) for a, b in zip(answers_by_round[-1], new_answers)
        ) and len({canonical(a) for a in new_answers}) > 1
        copied = _copy_triggered(texts, new_texts, answers_by_round[-1], new_answers)
        fired = stalled or copied
        triggers.append({"round": r, "stalled": stalled, "copying": copied, "fired": fired})

        if fired and rewriter is not None and not rewrite_used:
            task = rewriter(task)
            rewrite_used = True

        texts = new_texts
        answers_by_round.append(new_answers)
        confidences_by_round.append(new_conf)
        transcript.append(_entry(r, texts, confidence=new_conf))

    result = _package(question["question"], transcript, len(transcript), rendered=rendered)
    result["consensagent"] = {
        "triggers": triggers,
        "rewrite_used": rewrite_used,
        "weighted_answer": consensus_weighted_answer(
            answers_by_round, confidences_by_round, rendered.options or None
        ),
        "confidences": confidences_by_round[-1],
    }
    return result


def run_b4_rag_mad(
    question: dict,
    clients: list,
    rounds: int = 3,
    retriever: Retriever | None = None,
    seed: int = 0,
    question_id: str = "",
) -> dict:
    """B4 — MAD with retrieval but no trust calibration (ablation anchor)."""
    retriever = retriever or Retriever(config=RetrievalConfig())
    runner = DebateRunner(
        clients=clients,
        rounds=rounds,
        retriever=retriever,
        trust_config=TrustConfig(use_trust=False),
        seed=seed,
        question_id=question_id or _question_key(question["question"]),
        gold=question.get("answer"),
    )
    return runner.run(question["question"], question.get("options"))
