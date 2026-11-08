"""Debate loop: rounds, injection, evidence retrieval, trust updates, aggregation.

The plain-Python state machine is the target shape; Phase 2's LangGraph port
wraps the same round functions rather than reimplementing them. With no
retriever and no trust config this is still the vanilla MAD loop of Gate 0, so
existing Phase 0/1 runs and tests are unchanged.

Trust timing (P0-5): evidence is scored after every round's positions exist, and
a closing pass scores the final positions before aggregation. The weighted vote
therefore uses `trust_for_positions`, which is exactly the last trajectory row —
never trust computed from the previous round.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Callable

import numpy as np

from ..agents import (
    AGENT_INITIAL,
    AGENT_REVISION,
    AGENT_REVISION_EVIDENCE,
    AGENT_SYSTEM,
    INJECTION_SYSTEM,
    claim_texts,
    parse_position,
)
from ..eval.answers import distinct_answers
from ..eval.options import RenderedOptions, build_options
from ..inference import VLLMClient
from ..retrieval.pipeline import Retriever, StaticRetriever, evidence_block
from ..retrieval.verdicts import classify_claim, count_verdicts
from ..trust import TrustConfig, TrustState, aggregate
from .injection import build_injection

#: Per-round trust telemetry values (docs/agent/09_P0_INTERFACES.md §1).
TRUST_UPDATED = "updated"
TRUST_ABSTAINED_UNANIMOUS = "abstained_unanimous"
TRUST_ABSTAINED_NO_EVIDENCE = "abstained_no_evidence"


@dataclass
class DebateRunner:
    clients: list[VLLMClient]
    rounds: int = 3
    retrieve: Callable | None = None  # legacy hook: retrieve(agent_index, claim) -> passages
    # Optional override: (trust, support, harm) -> trust. Bypasses claim-count
    # normalization; use TrustConfig and the default path for P0-5 semantics.
    trust_update: Callable | None = None
    injection_scope: str | None = None  # None = plain debate; "minority" | "all"
    retriever: Retriever | StaticRetriever | None = None
    trust_config: TrustConfig = field(default_factory=TrustConfig)
    aggregate_final: bool = True
    # P0-0: seeded option rendering. Direct callers may omit these; the runner
    # always passes the run seed and question id so a resumed run re-renders
    # exactly the same order and the scorer can map letters back to options.
    seed: int = 0
    question_id: str | None = None
    gold: str | None = None

    def run(self, question: str, options: list[str] | None = None) -> dict:
        """Run one debate; returns positions, transcript, verdicts, trust, aggregation."""
        rendered = build_options(
            {"question": question, "answer": self.gold, "options": options},
            self.seed,
            self.question_id or _question_key(question),
        )
        return self._run_debate(question, options, rendered)

    def _passages(self, agent_index: int, claim: str, round_number: int) -> list[str]:
        if self.retriever is not None:
            return list(self.retriever.retrieve(agent_index, claim, round_number))
        if self.retrieve is not None:
            return list(self.retrieve(agent_index, claim))
        return []

    def _evidence_for(
        self, positions: list[str], round_number: int
    ) -> tuple[list[list[str]], list[list[str]]]:
        """Per-agent passages + per-claim verdicts for one revision round."""
        evidence: list[list[str]] = []
        verdicts: list[list[str]] = []
        for i, position in enumerate(positions):
            # P0-5: deduplicate repeated claims before classification. The
            # verdict list therefore has one entry per *distinct* claim, so
            # n_claims counts what was actually checked and repeating a claim
            # cannot inflate support or harm.
            claims = list(
                dict.fromkeys(
                    claim_texts(position, max_claims=self.trust_config.max_claims)
                )
            )
            agent_passages: list[str] = []
            agent_verdicts: list[str] = []
            for claim in claims:
                passages = self._passages(i, claim, round_number)
                agent_verdicts.append(classify_claim(claim, passages))
                agent_passages.extend(passages)
            evidence.append(list(dict.fromkeys(agent_passages)))
            verdicts.append(agent_verdicts)
        return evidence, verdicts

    def _trust_round(
        self,
        trust: TrustState,
        verdicts: list[list[str]],
        positions: list[str],
        has_evidence: bool,
        options: list[str] | None,
    ) -> tuple[str, list[int], list[int], list[int]]:
        """Score one round's positions; returns ``(status, support, harm, n_claims)``.

        Status matches the branch actually taken (09 §1): no evidence at all,
        unanimous panel under adaptive triggering, or a real update. The update
        carries the per-agent deduplicated claim count so verbosity cancels
        (P0-5); neutral evidence stays an identity.
        """
        counts = [count_verdicts(labels) for labels in verdicts]
        support = [entry[0] for entry in counts]
        harm = [entry[1] for entry in counts]
        n_claims = [len(labels) for labels in verdicts]
        if not has_evidence:
            return TRUST_ABSTAINED_NO_EVIDENCE, support, harm, n_claims
        if self.trust_config.adaptive_triggering and distinct_answers(
            [parse_position(p) for p in positions], options
        ) <= 1:
            return TRUST_ABSTAINED_UNANIMOUS, support, harm, n_claims
        if self.trust_update is not None:
            trust.scores = np.asarray(
                self.trust_update(trust.scores, support, harm), dtype=float
            )
            trust.trajectory.append(trust.scores.tolist())
        else:
            trust.update(support, harm, n_claims=n_claims)
        return TRUST_UPDATED, support, harm, n_claims

    def _run_debate(
        self, question: str, options: list[str] | None, rendered: RenderedOptions
    ) -> dict:
        systems = [AGENT_SYSTEM] * len(self.clients)
        transcript: list[dict] = []
        trust = TrustState(len(self.clients), self.trust_config)
        verdict_log: list[dict] = []
        evidence_log: list[dict] = []
        trust_used = False
        rendered_options = rendered.options or None

        positions = [
            client.complete(
                system,
                AGENT_INITIAL.format(
                    agent_id=i, question=question, options_block=rendered.block
                ),
            )
            for i, (client, system) in enumerate(zip(self.clients, systems), start=1)
        ]
        transcript.append({"round": 1, "positions": positions})

        injection = None
        if self.injection_scope and self.rounds >= 2:
            plan = build_injection(
                [parse_position(p) for p in positions],
                rendered_options,
                scope=self.injection_scope,
            )
            injection = plan.as_dict() | {"round": 2, "scope": self.injection_scope}
            if plan.eligible:
                injected_system = AGENT_SYSTEM + "\n\n" + INJECTION_SYSTEM.format(consensus=plan.consensus)
                for i in plan.targets:
                    systems[i] = injected_system
            else:
                injection["scope"] = None  # nothing delivered

        trust_status: list[str] = []
        trust_used = False

        for r in range(2, self.rounds + 1):
            evidence, verdicts = self._evidence_for(positions, r)
            has_evidence = any(evidence)
            if has_evidence:
                evidence_log.append({"round": r, "passages": evidence, "verdicts": verdicts})

            if self.trust_config.use_trust:
                status, support, harm, n_claims = self._trust_round(
                    trust, verdicts, positions, has_evidence, rendered_options
                )
                trust_status.append(status)
                trust_used = trust_used or status == TRUST_UPDATED
                if has_evidence:
                    verdict_log.append(
                        {
                            "round": r,
                            "support": support,
                            "harm": harm,
                            "n_claims": n_claims,
                        }
                    )

            peers = "\n\n".join(f"Agent {i}: {p[:1500]}" for i, p in enumerate(positions, start=1))
            new_positions = []
            for i, client in enumerate(self.clients, start=1):
                if has_evidence:
                    prompt = AGENT_REVISION_EVIDENCE.format(
                        agent_id=i,
                        round=r,
                        rounds=self.rounds,
                        question=question,
                        options_block=rendered.block,
                        own_position=positions[i - 1],
                        trust=float(trust.scores[i - 1]),
                        evidence=evidence_block(evidence[i - 1]),
                        peer_positions=peers,
                    )
                else:
                    prompt = AGENT_REVISION.format(
                        agent_id=i,
                        round=r,
                        rounds=self.rounds,
                        question=question,
                        options_block=rendered.block,
                        own_position=positions[i - 1],
                        trust=float(trust.scores[i - 1]),
                        peer_positions=peers,
                    )
                new_positions.append(client.complete(systems[i - 1], prompt))
            positions = new_positions
            transcript.append(
                {
                    "round": r,
                    "positions": positions,
                    "trust": trust.scores.tolist() if has_evidence else None,
                }
            )

        # P0-5: the loop above scores the positions that inform the *next*
        # round, so its last update is one round stale. Score the final
        # positions once more; this is the vector the weighted vote uses.
        if self.trust_config.use_trust:
            final_evidence, final_verdicts = self._evidence_for(
                positions, self.rounds + 1
            )
            has_final_evidence = any(final_evidence)
            if has_final_evidence:
                evidence_log.append(
                    {
                        "round": self.rounds + 1,
                        "passages": final_evidence,
                        "verdicts": final_verdicts,
                    }
                )
            status, support, harm, n_claims = self._trust_round(
                trust, final_verdicts, positions, has_final_evidence, rendered_options
            )
            trust_status.append(status)
            trust_used = trust_used or status == TRUST_UPDATED
            if has_final_evidence:
                verdict_log.append(
                    {
                        "round": self.rounds + 1,
                        "support": support,
                        "harm": harm,
                        "n_claims": n_claims,
                    }
                )

        # The exact vector handed to `aggregate`; equals the last trajectory row.
        trust_for_positions = trust.scores.tolist() if trust_used else None

        result = {
            "question": question,
            "final_positions": positions,
            "rounds_completed": self.rounds,
            "transcript": transcript,
            "injection": injection,
            "trust_trajectory": trust.trajectory if trust_used else None,
            "trust_for_positions": trust_for_positions,
            "trust_status": trust_status or None,
            "verdicts": verdict_log,
            "evidence": evidence_log,
            "options_raw": list(options) if options else None,
            "options": rendered.options or None,
            "option_permutation": rendered.permutation or None,
            "gold_letter_rendered": rendered.gold_letter,
        }
        if self.aggregate_final:
            result["aggregation"] = aggregate(
                trust.scores, [parse_position(p) for p in positions], rendered_options
            )
            result["final_trust"] = trust.scores.tolist()
        return result


def _question_key(question: str) -> str:
    """Stable id for direct callers that do not pass a question id."""
    from hashlib import sha256

    return "adhoc-" + sha256((question or "").encode("utf-8")).hexdigest()[:16]

