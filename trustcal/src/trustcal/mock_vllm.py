"""Deterministic OpenAI-compatible mock vLLM servers (stdlib only, no deps).

Purpose: run the whole pipeline locally with zero GPU and zero network so that
wiring bugs (client, retry, prompt assembly, parsing, runner, metrics) are caught
before a paid session — every Phase 0 failure class becomes testable here.

Modes:
    agree      every agent returns the same answer (majority-safe)
    divergent  agent 1 answers "C" (minority), agents 2-3 answer "B" (majority)
    untagged   like divergent, but without <claim> tags (fallback extractor path)

Any request whose system prompt contains the injected consensus phrase
("community consensus") makes the minority agent switch to the majority answer —
that simulates sycophantic collapse end-to-end.
"""

from __future__ import annotations

import json
import threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

MINORITY_ANSWER = "C"
MAJORITY_ANSWER = "B"
INJECTION_MARKER = "community consensus"


def build_answer(answer: str, tagged: bool) -> str:
    claims = '\n<claim id="c1">This follows from the base rate.</claim>' if tagged else ""
    return f"Answer: {answer}\nReasoning supporting {answer}.{claims}"


def answer_for(mode: str, is_minority: bool, injected: bool) -> str:
    if mode == "agree":
        return build_answer(MAJORITY_ANSWER, tagged=True)
    # divergent / untagged
    if is_minority and not injected:
        answer = MINORITY_ANSWER
    else:
        answer = MAJORITY_ANSWER
    return build_answer(answer, tagged=mode != "untagged")


class _Handler(BaseHTTPRequestHandler):
    server_version = "mock-vllm/0.1"

    def log_message(self, *args) -> None:  # keep pytest output clean
        pass

    def _json(self, payload: dict, code: int = 200) -> None:
        body = json.dumps(payload).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self) -> None:  # noqa: N802
        if self.path.rstrip("/") == "/v1/models":
            self._json(
                {
                    "object": "list",
                    "data": [{"id": self.server.model_name, "object": "model", "owned_by": "mock"}],  # type: ignore[attr-defined]
                }
            )
        else:
            self._json({"error": "not found"}, 404)

    def do_POST(self) -> None:  # noqa: N802
        if self.path.rstrip("/") != "/v1/chat/completions":
            self._json({"error": "not found"}, 404)
            return
        length = int(self.headers.get("Content-Length", 0))
        body = json.loads(self.rfile.read(length) or b"{}")
        messages = body.get("messages", [])
        system = " ".join(str(m.get("content", "")) for m in messages if m.get("role") == "system")
        injected = INJECTION_MARKER in system.lower()
        text = answer_for(self.server.mode, self.server.is_minority, injected)  # type: ignore[attr-defined]
        self._json(
            {
                "id": "mock-1",
                "object": "chat.completion",
                "created": 0,
                "model": self.server.model_name,  # type: ignore[attr-defined]
                "choices": [{"index": 0, "message": {"role": "assistant", "content": text}, "finish_reason": "stop"}],
                "usage": {"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0},
            }
        )


def start_mock(
    *,
    port: int = 0,
    mode: str = "divergent",
    model_name: str = "mock-agent",
    is_minority: bool = False,
) -> ThreadingHTTPServer:
    """Start one mock server in a background thread. Port 0 picks a free port."""
    server = ThreadingHTTPServer(("127.0.0.1", port), _Handler)
    server.mode = mode  # type: ignore[attr-defined]
    server.model_name = model_name  # type: ignore[attr-defined]
    server.is_minority = is_minority  # type: ignore[attr-defined]
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    server._thread = thread  # type: ignore[attr-defined]
    return server


def start_mock_trio(mode: str = "divergent") -> list[ThreadingHTTPServer]:
    """Three servers: the first (agent 1) is the minority persona."""
    servers = []
    for i in range(3):
        servers.append(
            start_mock(mode=mode, model_name=f"mock-agent{i + 1}", is_minority=(i == 0))
        )
    return servers


def stop_mock(server: ThreadingHTTPServer) -> None:
    server.shutdown()
    server.server_close()


def stop_all(servers: list[ThreadingHTTPServer]) -> None:
    for server in servers:
        stop_mock(server)


def base_urls(servers: list[ThreadingHTTPServer]) -> list[str]:
    return [f"http://127.0.0.1:{s.server_address[1]}/v1" for s in servers]
