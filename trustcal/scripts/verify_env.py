"""Environment verification: import/version check + optional vLLM server health.

Used by setup.sh. Import failures are warnings (some deps are pod-only);
--check-servers is the gate — any dead vLLM endpoint exits non-zero.
Exit code is driven only by server health, never by optional import warnings.
"""

from __future__ import annotations

import importlib
import json
import sys
import urllib.request

PACKAGES = [
    "openai", "langgraph", "yaml", "dotenv", "requests", "numpy", "scipy",
    "sklearn", "sentence_transformers", "datasets", "vllm", "pytest",
]

PORTS = [8000, 8001, 8002]


def main() -> None:
    warnings: list[str] = []
    for pkg in PACKAGES:
        try:
            m = importlib.import_module(pkg)
            print(f"OK   {pkg:<20} {getattr(m, '__version__', '?')}")
        except Exception as exc:  # noqa: BLE001
            print(f"WARN {pkg:<20} import failed: {exc}")
            warnings.append(pkg)

    check_servers = "--check-servers" in sys.argv
    server_failures = 0
    if check_servers:
        for port in PORTS:
            try:
                with urllib.request.urlopen(f"http://localhost:{port}/v1/models", timeout=15) as resp:
                    models = [m["id"] for m in json.load(resp).get("data", [])]
                    if not models:
                        raise RuntimeError("server returned no model ids")
                    print(f"OK   server :{port} -> {models}")
            except Exception as exc:  # noqa: BLE001
                print(f"FAIL server :{port} -> {exc}")
                server_failures += 1

    if warnings:
        print(f"note: {len(warnings)} optional import warning(s): {', '.join(warnings)}")
    if server_failures:
        print(f"RESULT: FAIL — {server_failures}/{len(PORTS)} vLLM endpoint(s) dead")
        sys.exit(1)
    print("RESULT: OK" + (f" — {len(PORTS)}/{len(PORTS)} servers healthy" if check_servers else ""))


if __name__ == "__main__":
    main()
