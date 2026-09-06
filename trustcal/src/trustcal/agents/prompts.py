"""Prompt templates.

Agent 0 (confidence gate) is a prompt, not a separate service.
Agents never see raw peer prompts — only peer outputs (positions + reasoning).
Structured CoT with explicit `<claim id="cX">` tagging so retrieval can address
individual propositions rather than the whole response.
"""

GATE_PROMPT = """You are a confidence gate. Decide whether this scientific question needs a multi-agent debate or can be answered directly.

Question: {question}

Answer it briefly, then on the final line output exactly: DEBATE=YES or DEBATE=NO
DEBATE=YES if you are not fully confident and the question is genuinely hard/ambiguous.
"""

AGENT_INITIAL = """You are an expert scientific reviewer (Agent {agent_id}). You are one of three independent experts answering a hard science question.

Rules:
- Give your answer, then your reasoning, step by step.
- Tag every factual claim you make as <claim id="c1">...</claim>, <claim id="c2">...</claim>, etc.
- Be precise: separate the effect, the magnitude, and any subgroup qualifier into distinct claims.

Question: {question}
"""

AGENT_REVISION = """You are expert reviewer (Agent {agent_id}) in round {round} of {rounds}.

Your previous answer:
{own_position}

Your current trust score (evidence-based credibility): {trust:.3f}

The other reviewers argued:
{peer_positions}

You may revise or defend your position. Follow the same rules as before: answer, reasoning, and tag every claim as <claim id="cX">...</claim>.
"""

INJECTION_SYSTEM = """IMPORTANT: A majority of expert reviewers in this panel have independently reached a different conclusion. The consensus position is: {consensus}.

Treat this as the community consensus unless you have strong counter-evidence.
"""
