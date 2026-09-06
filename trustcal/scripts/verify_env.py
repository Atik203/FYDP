"""Environment verification: import/version check + optional vLLM server health.

Used by setup.sh. Import failures are warnings (some deps are pod-only);
--check-servers is the gate — any dead vLLM endpoint exits non-zero.
"""

from __future__ import annotations

import importlib
import json
import sys
import urllib.request

PACKAGES = [
    "openai", "langgraph", "yaml", "requests", "numpy", "scipy",
    "sklearn", "sentence_transformers", "datasets", "vllm", "pytest",
]

PORTS = [8000, 8001, 8002]


def main() -> None:
    failures = 0
    for pkg in PACKAGES:
        try:
            m = importlib.import_module(pkg)
            print(f"OK   {pkg:<20} {getattr(m, '__version__', '?')}")
        except Exception as exc:  # noqa: BLE001
            print(f"WARN {pkg:<20} import failed: {exc}")
            failures += 1

    if "--check-servers" in sys.argv:
        for port in PORTS:
            try:
                with urllib.request.urlopen(f"http://localhost:{port}/v1/models", timeout=15) as resp:
                    data = json.load(resp)
                    models = [m["id"] for m in data.get("data", [])]
                    print(f"OK   server :{port} -> {models}")
            except Exception as exc:  # noqa: BLE001
                print(f"FAIL server :{port} -> {exc}")
                failures += 1

    sys.exit(1 if failures else 0)


if __name__ == "__main__":
    main()
