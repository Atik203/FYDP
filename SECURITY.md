# Security policy

## Supported versions

Security fixes are applied to `main`. The project does not maintain backports for older tags.

## Reporting a vulnerability

Do not open a public issue for a leaked credential, an exploitable code path, or a privacy problem.

Use GitHub's private vulnerability reporting:

1. Open the repository's **Security** tab.
2. Choose **Report a vulnerability**.
3. Include the affected file or commit, a reproduction, and the impact.

If private reporting is unavailable, contact the maintainer privately through GitHub ([@Atik203](https://github.com/Atik203)). Do not include a live key in the report; revoke it first.

This is a student research project. Reports are handled on a best-effort basis, normally within seven days. There is no bug bounty.

## Scope

In scope:

- code in `trustcal/` and `frontend/`
- credential handling in `.env` and the setup scripts
- serving configuration that could expose the vLLM endpoints
- dependency and CI configuration

Out of scope:

- model outputs, hallucinations, or prompt-injection content
- third-party datasets, APIs, or model weights
- denial-of-service against a host you do not control

## Secrets

Never commit:

- `HF_TOKEN`
- `OPENAI_API_KEY`
- retrieval API keys
- `.env` files

The repository ignores `.env` and keeps only `.env.example` with variable names. If a secret is committed, revoke it at the provider, rotate it, and remove it from history before making the repository public again.

## Serving safely

vLLM has no authentication by default. The `--api-key` option protects only the `/v1`-style endpoints; other endpoints, including `/docs` and `/invocations`, are not covered. Do not expose ports 8000-8002 directly to the public internet.

Use one of:

- an SSH local-forwarding tunnel
- a private overlay network such as Tailscale
- a reverse proxy with authentication and a firewall

The clients in this repository expect `127.0.0.1:8000-8002`, which is the correct target for an SSH tunnel. Run `python scripts/preflight.py` before a paid session and keep `results/` off any public host.
