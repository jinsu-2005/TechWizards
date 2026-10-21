"""Capability-specific Gemini pools with bounded failover and honest availability."""

from __future__ import annotations

import os
import threading
import time
from dataclasses import dataclass
from email.utils import parsedate_to_datetime
from typing import Literal

from app.ai.secrets import gemini_key

Capability = Literal["text", "live", "transcription", "tts"]

# Only models with an appropriate API operation and a successful project-key smoke test
# are enabled by default. MODEL.md records the test and the larger candidate inventory.
DEFAULT_POOLS: dict[Capability, tuple[str, ...]] = {
    "text": ("gemini-3.8-flash", "gemini-3.5-flash-lite"),
    "live": ("gemini-3.8-live", "gemini-2.5-flash-native-audio-latest"),
    "transcription": ("gemini-3.5-transcribe",),
    "tts": ("gemini-3.8-flash-lite-tts", "gemini-3.8-flash-tts"),
}
COMPATIBLE: dict[Capability, frozenset[str]] = {
    "text": frozenset(
        {
            "gemini-3.8-flash",
            "gemini-3.6-flash",
            "gemini-3.5-flash-lite",
            "gemini-3.1-flash-lite",
            "gemini-3-flash-preview",
            "gemini-2.5-flash",
            "gemini-2.5-flash-lite",
            "gemma-4-31b-it",
            "gemma-4-26b-a4b-it",
        }
    ),
    "live": frozenset(
        {
            "gemini-3.8-live",
            "gemini-3.8-live-extended-thinking",
            "gemini-2.5-flash-native-audio-latest",
            "gemini-3.1-flash-live-preview",
        }
    ),
    "transcription": frozenset({"gemini-3.5-transcribe"}),
    "tts": frozenset(
        {
            "gemini-3.8-flash-lite-tts",
            "gemini-3.8-flash-tts",
            "gemini-3.1-flash-tts-preview",
            "gemini-2.5-flash-preview-tts",
        }
    ),
}
ENV_NAMES: dict[Capability, str] = {
    "text": "AT_AI_TEXT_MODELS",
    "live": "AT_AI_LIVE_MODELS",
    "transcription": "AT_AI_TRANSCRIPTION_MODELS",
    "tts": "AT_AI_TTS_MODELS",
}


@dataclass(frozen=True)
class Failure:
    category: str
    retryable: bool
    cooldown_s: float = 0


def _status_code(exc: Exception) -> int | None:
    value = getattr(exc, "code", None) or getattr(exc, "status_code", None)
    if value is None:
        response = getattr(exc, "response", None)
        value = getattr(response, "status_code", None)
    try:
        return int(value) if value is not None else None
    except (TypeError, ValueError):
        return None


def _retry_after(exc: Exception) -> float | None:
    response = getattr(exc, "response", None)
    headers = getattr(response, "headers", None)
    raw = headers.get("Retry-After") if headers else None
    if not raw:
        return None
    try:
        return min(max(float(raw), 0.0), 3600.0)
    except ValueError:
        try:
            return min(max(parsedate_to_datetime(raw).timestamp() - time.time(), 0.0), 3600.0)
        except (TypeError, ValueError, OverflowError):
            return None


def classify_failure(exc: Exception) -> Failure:
    code = _status_code(exc)
    message = str(exc).lower()
    if code == 429:
        daily = any(word in message for word in ("daily", "per day", "quota_exceeded", "rpd"))
        return Failure(
            "daily_quota" if daily else "rate_limit",
            True,
            _retry_after(exc) or (3600.0 if daily else 30.0),
        )
    if code in {404, 501} or (
        code == 400
        and any(
            phrase in message for phrase in ("not supported", "not available", "model not found")
        )
    ):
        return Failure("unsupported_model", True, 3600.0)
    if code in {500, 502, 503, 504}:
        return Failure("temporary_provider_error", True, 15.0)
    if code in {401, 403}:
        return Failure("authentication", False)
    if "safety" in message or "blocked" in message:
        return Failure("safety_block", False)
    if code == 400:
        return Failure("invalid_request", False)
    if isinstance(exc, (TimeoutError, ConnectionError)):
        return Failure("network_timeout", True, 10.0)
    return Failure("provider_error", False)


class ModelRouter:
    def __init__(self) -> None:
        self._cooldowns: dict[tuple[Capability, str], tuple[float, str]] = {}
        self._failure_counts: dict[tuple[Capability, str], int] = {}
        self._active: dict[Capability, str] = {}
        self._lock = threading.Lock()

    def pool(self, capability: Capability) -> tuple[str, ...]:
        raw = os.environ.get(ENV_NAMES[capability], "").strip()
        proposed = tuple(m.strip().removeprefix("models/") for m in raw.split(",") if m.strip())
        if not proposed:
            return DEFAULT_POOLS[capability]
        invalid = [m for m in proposed if m not in COMPATIBLE[capability]]
        if invalid:
            raise ValueError(f"Incompatible {capability} model configuration: {', '.join(invalid)}")
        return tuple(dict.fromkeys(proposed))

    def candidates(self, capability: Capability, preferred: str | None = None) -> tuple[str, ...]:
        pool = self.pool(capability)
        selected = preferred.removeprefix("models/") if preferred else None
        if selected and selected not in pool:
            raise ValueError(f"Model {selected} is not configured for {capability}")
        ordered = (selected, *(m for m in pool if m != selected)) if selected else pool
        now = time.monotonic()
        with self._lock:
            return tuple(
                m for m in ordered if self._cooldowns.get((capability, m), (0, ""))[0] <= now
            )

    def failed(self, capability: Capability, model: str, error: Failure) -> None:
        if error.cooldown_s:
            with self._lock:
                key = (capability, model)
                failures = self._failure_counts.get(key, 0) + 1
                self._failure_counts[key] = failures
                # Retry-After and daily-quota windows are minimums. Repeated short
                # failures back off exponentially, with a bounded one-hour ceiling.
                delay = min(max(error.cooldown_s, 15.0 * 2 ** min(failures - 1, 8)), 3600.0)
                self._cooldowns[(capability, model)] = (
                    time.monotonic() + delay,
                    error.category,
                )

    def succeeded(self, capability: Capability, model: str) -> None:
        with self._lock:
            self._active[capability] = model
            self._cooldowns.pop((capability, model), None)
            self._failure_counts.pop((capability, model), None)

    def status(self) -> dict[str, object]:
        now = time.monotonic()
        with self._lock:
            active = self._active.copy()
            cooldowns = self._cooldowns.copy()
        return {
            "configured": bool(gemini_key()),
            "capabilities": {
                kind: {
                    "preferred": self.pool(kind)[0],
                    "active": active.get(kind),
                    "available": [
                        m for m in self.pool(kind) if cooldowns.get((kind, m), (0, ""))[0] <= now
                    ],
                    "cooldown": {
                        m: {"reason": reason, "retry_in_s": round(until - now)}
                        for (cap, m), (until, reason) in cooldowns.items()
                        if cap == kind and until > now
                    },
                }
                for kind in DEFAULT_POOLS
            },
        }


router = ModelRouter()
