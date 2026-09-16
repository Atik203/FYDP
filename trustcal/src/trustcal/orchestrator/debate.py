"""Plain-Python debate loop skeleton. Phase 2 replaces this with a LangGraph state machine.

Rounds: 0 (initial positions) → decompose → retrieve → trust update → revise, K=3 total.
The optional injection point sits between round 1 and round 2 (§5.4).
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Callable

from ..inference import VLLMClient


@dataclass
class DebateRunner:
    clients: list[VLLMClient]
    rounds: int = 3
    retrieve: Callable | None = None
    trust_update: Callable | None = None
    inject: Callable | None = None

    def run(self, question: str) -> dict:
        """Run one debate; returns the final result package (answer + trajectories).

        Phase 0 scope: rounds without retrieval/trust (vanilla MAD reproduction,
        Gate 0). Phase 2 wires in retrieve/trust_update/inject.
        """
        if self.trust_update is None:
            return self._run_vanilla(question)
        raise NotImplementedError("Phase 2: full trust-calibrated loop")

    def _run_vanilla(self, question: str) -> dict:
        from ..agents import AGENT_INITIAL, AGENT_REVISION, AGENT_SYSTEM

        transcript: list[dict] = []

        positions = [
            client.complete(
                AGENT_SYSTEM,
                AGENT_INITIAL.format(agent_id=i, question=question),
            )
            for i, client in enumerate(self.clients, start=1)
        ]
        transcript.append({"round": 1, "positions": positions})

        for r in range(2, self.rounds + 1):
            # Cap each peer position so round prompts stay inside max_model_len.
            peers = "\n\n".join(f"Agent {i}: {p[:1500]}" for i, p in enumerate(positions, start=1))
            positions = [
                client.complete(
                    AGENT_SYSTEM,
                    AGENT_REVISION.format(
                        agent_id=i,
                        round=r,
                        rounds=self.rounds,
                        own_position=positions[i - 1],
                        trust=1 / len(self.clients),
                        peer_positions=peers,
                    ),
                )
                for i, client in enumerate(self.clients, start=1)
            ]
            transcript.append({"round": r, "positions": positions})

        return {
            "question": question,
            "final_positions": positions,
            "rounds_completed": self.rounds,
            "transcript": transcript,
            "trust_trajectory": None,
        }
