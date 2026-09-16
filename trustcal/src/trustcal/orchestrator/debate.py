"""Plain-Python debate loop skeleton. Phase 2 replaces this with a LangGraph state machine.

Rounds: 1 (initial positions) → optional injection at t=1→2 → revision rounds,
K=3 total. Injection follows trustcal/INJECTION_PROTOCOL.md: only the targeted
agents (the minority by default) receive the fabricated-consensus system prompt.
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
    injection_scope: str | None = None  # None = plain debate; "minority" | "all"

    def run(self, question: str, options: list[str] | None = None) -> dict:
        """Run one debate; returns the final result package (answers + trajectories).

        Phase 0/1 scope: rounds without retrieval/trust. Phase 2 wires in
        retrieve/trust_update.
        """
        if self.trust_update is not None:
            raise NotImplementedError("Phase 2: full trust-calibrated loop")
        return self._run_debate(question, options)

    def _run_debate(self, question: str, options: list[str] | None = None) -> dict:
        from ..agents import AGENT_INITIAL, AGENT_REVISION, AGENT_SYSTEM, INJECTION_SYSTEM, parse_position
        from .injection import build_injection

        systems = [AGENT_SYSTEM] * len(self.clients)
        transcript: list[dict] = []

        positions = [
            client.complete(system, AGENT_INITIAL.format(agent_id=i, question=question))
            for i, (client, system) in enumerate(zip(self.clients, systems), start=1)
        ]
        transcript.append({"round": 1, "positions": positions})

        injection = None
        if self.injection_scope and self.rounds >= 2:
            plan = build_injection([parse_position(p) for p in positions], options, scope=self.injection_scope)
            injection = plan.as_dict() | {"round": 2, "scope": self.injection_scope}
            if plan.eligible:
                injected_system = AGENT_SYSTEM + "\n\n" + INJECTION_SYSTEM.format(consensus=plan.consensus)
                for i in plan.targets:
                    systems[i] = injected_system
            else:
                injection["scope"] = None  # nothing delivered

        for r in range(2, self.rounds + 1):
            # Cap each peer position so round prompts stay inside max_model_len.
            peers = "\n\n".join(f"Agent {i}: {p[:1500]}" for i, p in enumerate(positions, start=1))
            positions = [
                client.complete(
                    systems[i - 1],
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
            "injection": injection,
            "trust_trajectory": None,
        }
