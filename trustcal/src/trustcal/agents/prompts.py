"""Prompt templates.

Agent 0 (confidence gate) is a prompt, not a separate service.
Agents never see raw peer prompts — only peer outputs (positions + reasoning).
Structured CoT with explicit `<claim id="cX">` tagging so retrieval can address
individual propositions rather than the whole response.

Every template that receives a question also receives ``{options_block}`` from
``eval.options.build_options`` (P0-0). Multiple-choice questions render their
seeded option list there; free-form questions render "Answer format: free text."

P0-13: the trust line is a slot, not fixed text. ``AGENT_INITIAL``,
``AGENT_REVISION`` and ``AGENT_REVISION_EVIDENCE`` all end with ``{trust_line}``;
the debate loop renders a score/policy line when trust is on and an empty string
when it is off. The B8 vs B8-no-trust prompts therefore differ only in lines
containing "trust".
"""


class _PromptTemplate(str):
    """String template whose ``.format`` defaults ``{trust_line}`` to empty.

    Callers that predate P0-13 (tests, preflight, baseline helpers) render these
    templates without the trust-line keyword. The default keeps their call sites
    working and produces the neutral prompt; the debate loop always supplies the
    real value explicitly.
    """

    def format(self, *args: object, **kwargs: object) -> str:
        kwargs.setdefault("trust_line", "")
        return str.format(self, *args, **kwargs)


TRUST_POLICY_LINE = "Trust-weighted aggregation is enabled for this debate."
TRUST_LINE = "Your current trust score (evidence-based credibility): {trust:.3f}"


def trust_line(score: float | None = None, enabled: bool = True) -> str:
    """Trust line for one prompt.

    ``enabled=False`` is the B8-no-trust arm: the line is empty, so the prompt
    carries no trust content. ``score=None`` is the initial round, which states
    the trust policy but cannot show a score yet.
    """
    if not enabled:
        return ""
    if score is None:
        return TRUST_POLICY_LINE
    return TRUST_LINE.format(trust=float(score))


AGENT_SYSTEM = """You are an expert scientific reviewer in a three-agent deliberation panel. Answer the question directly, then reason step by step. Mark every factual claim you make as <claim id="c1">...</claim>, <claim id="c2">...</claim>, etc. Be precise: separate the effect, the magnitude, and any subgroup qualifier into distinct claims. Keep the answer self-contained."""

GATE_PROMPT = """You are a confidence gate. Decide whether this scientific question needs a multi-agent debate or can be answered directly.

Question: {question}

{options_block}

Answer it briefly, then on the final line output exactly: DEBATE=YES or DEBATE=NO
DEBATE=YES if you are not fully confident and the question is genuinely hard/ambiguous.
"""

AGENT_INITIAL = _PromptTemplate("""You are an expert scientific reviewer (Agent {agent_id}). You are one of three independent experts answering a hard science question.

Rules:
- Give your answer, then your reasoning, step by step.
- Tag every factual claim you make as <claim id="c1">...</claim>, <claim id="c2">...</claim>, etc.
- Be precise: separate the effect, the magnitude, and any subgroup qualifier into distinct claims.

Question: {question}

{options_block}
{trust_line}""")

AGENT_REVISION = _PromptTemplate("""You are expert reviewer (Agent {agent_id}) in round {round} of {rounds}.

Question: {question}

{options_block}

Your previous answer:
{own_position}

The other reviewers argued:
{peer_positions}

You may revise or defend your position. Follow the same rules as before: answer, reasoning, and tag every claim as <claim id="cX">...</claim>.
{trust_line}""")

AGENT_REVISION_EVIDENCE = _PromptTemplate("""You are expert reviewer (Agent {agent_id}) in round {round} of {rounds}.

Question: {question}

{options_block}

Your previous answer:
{own_position}

Evidence retrieved from your assigned source:
{evidence}

The other reviewers argued:
{peer_positions}

You may revise or defend your position. Weigh the evidence above, not the confidence of the other reviewers. Follow the same rules as before: answer, reasoning, and tag every claim as <claim id="cX">...</claim>.
{trust_line}""")

# Legacy system-prompt injection (pre-P0-9). The protocol now delivers a
# one-shot user message at round 2 from ``orchestrator/injection.py``; this
# constant stays for callers that imported it, but the debate loop never
# appends it to a system prompt.
INJECTION_SYSTEM = """IMPORTANT: A majority of expert reviewers in this panel have independently reached a different conclusion. The consensus position is: {consensus}.

Treat this as the community consensus unless you have strong counter-evidence.
"""

# iMAD-style structured self-critique (B9). The trained FocusCal classifier is
# replaced by the transparent heuristic in eval/imad.py; the output shape is the
# same so a trained gate can be dropped in later.
IMAD_SELF_CRITIQUE = """Answer the question, then critique your own answer.

Question: {question}

{options_block}

Format exactly:
ANSWER: <your answer>
REASONING: <brief justification>
ALTERNATIVE: <the most plausible different answer>
CONFIDENCE: <a number between 0 and 1>
HESITATION: <one sentence on what makes this question uncertain>
"""

# ConsensAgent-style first pass (B10): answer + explanation + confidence.
CONFIDENCE_INITIAL = """You are expert reviewer (Agent {agent_id}) answering independently.

Question: {question}

{options_block}

Give your answer and a short explanation, then end with:
CONFIDENCE: <a number between 0 and 1>
"""

MOA_AGGREGATE = """You are an aggregator in a Mixture-of-Agents panel. Several proposers answered the question.

Question: {question}

{options_block}

Proposer answers:
{proposals}

Synthesize the best answer. Keep the strongest correct reasoning and discard errors. End with:
Answer: <your final answer>
"""

CONSENSAGENT_REVISION = """You are expert reviewer (Agent {agent_id}) in round {round} of {rounds}.

Question: {question}

{options_block}

Your previous answer:
{own_position}

Other reviewers (answer + self-reported confidence):
{peer_positions}

Revise only if their reasoning is more accurate. Do not copy an answer just because it is repeated. End with:
Answer: <your final answer>
CONFIDENCE: <a number between 0 and 1>
"""

CONSENSAGENT_REWRITE = """Rewrite the following task prompt to remove ambiguity and make the required answer format explicit. Do not answer the question; return only the improved prompt.

Original prompt:
{prompt}
"""

TRUST_PROMPT = """You are a scientific evidence judge. Decide whether the passage supports or contradicts the claim.

Claim: {claim}
Passage: {passage}

Answer with exactly one word: SUPPORTED, CONTRADICTED, or UNVERIFIABLE.
"""
