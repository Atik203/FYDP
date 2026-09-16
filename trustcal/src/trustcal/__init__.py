"""Trust-calibrated multi-agent scientific deliberation pipeline (FYDP)."""

from .config import load_env

__version__ = "0.1.0"

# Load trustcal/.env once for every entry point (scripts, tests, pipeline).
load_env()
