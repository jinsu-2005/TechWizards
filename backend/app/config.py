"""Runtime settings from environment variables prefixed `AT_` (see .env.example)."""

import json
import os
from functools import lru_cache
from pathlib import Path

from pydantic import BaseModel, Field, SecretStr

ENV_PREFIX = "AT_"


class Settings(BaseModel):
    # What this deployment declares itself bound to (Phase 14 B3): loopback-only by default,
    # matching uvicorn's own default when no --host is given. Docker Compose sets AT_HOST=0.0.0.0
    # explicitly, since the container must accept connections from outside itself; this field is
    # the fail-closed signal for `require_key`, separate from the actual uvicorn bind flag.
    host: str = "127.0.0.1"
    port: int = 8000
    cors_origins: list[str] = ["http://localhost:5173"]
    seed: int = 42
    sim_hz: float = 10.0
    ws_period_s: float = 0.5
    hai_dir: Path = Path("../data/hai")
    hai_file: str = "test1"  # which HAI test file the replay walks
    hai_speed: float = 10.0  # HAI replay speed, rows per second, clamped to x1..x20
    models_dir: Path = Path("models")
    reports_dir: Path = Path("../reports")
    # Localization weights (score = w1*deviation + w2*onset + w3*causal),
    # tuned on SIM validation attacks in Phase 3.
    w_deviation: float = 0.6
    w_onset: float = 0.2
    w_causal: float = 0.2
    # Confidence gate (Phase 11): an incident is ambiguous when top-1 minus top-2 confidence is
    # below this. Tuned on SIM validation + tuning attacks only (`python -m eval.ambiguity`); the
    # margin is a SIM calibration, so HAI incidents are never flagged.
    gate_margin: float = 0.21
    # Demo protection (Phase 11): empty key = write endpoints open (local dev and tests).
    api_key: str = ""
    auth_enabled: bool = False
    firebase_project_id: str = ""
    auth_cookie_secure: bool = True
    auth_members: dict[str, str] = {}  # verified email -> viewer, analyst or admin
    gateway_secret: SecretStr = SecretStr("")  # shared only by edge gateway and backend
    demo_mode: bool = True  # False: attack endpoints answer 403
    attack_rate_per_min: int = 10
    # Phase 14 B4: rate-limit identity is the socket peer unless a trusted reverse proxy sets
    # X-Forwarded-For -- an untrusted client could otherwise spoof that header to dodge the limit.
    trust_proxy: bool = False
    # Isolate-and-recover: contained once every node score has stayed under the alert threshold
    # this long after the isolate action. Fixed a priori, not tuned on the test attacks.
    contain_s: float = 5.0
    # LIVE mode (Phase 13): Modbus ingestion from an external plant emulator. All AT_LIVE_*.
    live_host: str = "127.0.0.1"
    live_port: int = 5020
    live_tagmap: Path = Path("../config/tagmap.yaml")
    live_poll_s: float = 0.25  # one batched read per block every poll
    live_timeout_s: float = 1.0  # per request
    live_stale_after_s: float = 1.0  # no update within this: quality `stale`
    live_max_age_s: float = 5.0  # last-value-hold limit; older: quality `missing`
    live_frozen_after_s: float = 30.0  # a sensor reading identical this long while others move
    live_max_in_flight: int = 2
    live_block_gap: int = 8  # tags closer than this many registers share one read
    live_backoff_base_s: float = 0.25
    live_backoff_max_s: float = 5.0
    live_train_min: float = Field(default=5.0, ge=5, le=120, allow_inf_nan=False)
    live_db: Path = Path("../data/live_incidents.sqlite")  # LIVE incidents survive a restart
    soc_db: Path = Path("../data/investigations.sqlite")
    live_include_bad_quality: bool = False  # True: stale/missing/out-of-range tags are scored too
    # Attacker tool (Phase 13 Part D): extra allowed write targets, beyond loopback and the
    # docker-compose service name, as a comma-separated list. Empty by default.
    attacker_allowlist: str = ""


def _from_env() -> dict[str, object]:
    values: dict[str, object] = {}
    for name in Settings.model_fields:
        raw = os.environ.get(ENV_PREFIX + name.upper())
        if raw is None:
            continue
        values[name] = json.loads(raw) if name in {"cors_origins", "auth_members"} else raw
    return values


@lru_cache
def get_settings() -> Settings:
    return Settings.model_validate(_from_env())
