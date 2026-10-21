"""Capability separation, cooldowns and evidence-bounded first live turn."""

from types import SimpleNamespace

import httpx
import pytest

from app.ai.models import Failure, ModelRouter, classify_failure
from app.api.live_voice import opening_prompt, session_config


def test_model_pool_rejects_cross_modality(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("AT_AI_TEXT_MODELS", "gemini-3.8-live")
    with pytest.raises(ValueError, match="Incompatible text"):
        ModelRouter().pool("text")


def test_preferred_model_fails_over_after_rate_limit() -> None:
    router = ModelRouter()
    first, second = router.candidates("text")
    router.failed("text", first, Failure("rate_limit", True, 60))
    assert router.candidates("text") == (second,)
    assert router.status()["capabilities"]["text"]["cooldown"][first]["reason"] == "rate_limit"
    router.succeeded("text", first)
    assert router.candidates("text")[0] == first


def test_quota_and_unsupported_are_retryable_but_auth_and_safety_are_not() -> None:
    quota = SimpleNamespace(code=429)
    quota.__str__ = lambda: "daily quota exceeded"
    assert classify_failure(quota).retryable
    assert classify_failure(SimpleNamespace(code=404)).category == "unsupported_model"
    assert classify_failure(SimpleNamespace(code=401)).retryable is False
    assert classify_failure(Exception("safety blocked")).category == "safety_block"


def test_retry_after_is_respected() -> None:
    response = httpx.Response(
        429, headers={"Retry-After": "42"}, request=httpx.Request("GET", "https://example.test")
    )
    failure = classify_failure(
        httpx.HTTPStatusError("rate limited", request=response.request, response=response)
    )
    assert failure.category == "rate_limit"
    assert failure.cooldown_s == 42


def test_repeated_rate_limits_back_off_without_crossing_capability_pools() -> None:
    router = ModelRouter()
    model = router.pool("text")[0]
    router.failed("text", model, Failure("rate_limit", True, 1))
    first = router.status()["capabilities"]["text"]["cooldown"][model]["retry_in_s"]
    router.failed("text", model, Failure("rate_limit", True, 1))
    second = router.status()["capabilities"]["text"]["cooldown"][model]["retry_in_s"]
    assert first >= 14
    assert second >= 29
    assert router.candidates("live") == router.pool("live")


def test_live_greeting_states_only_observed_status(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(
        "app.api.live_voice.process_snapshot",
        lambda _: {
            "source": "sim",
            "sample_time": None,
            "incident": None,
        },
    )
    first = opening_prompt(object())
    resumed = opening_prompt(object(), [{"speaker": "user", "text": "Hi"}])
    assert "No current reading is available yet" in first
    assert "What would you like to investigate?" in first
    assert "AI Pilot is back" in resumed
    assert "AI Pilot here" not in resumed


def test_live_extended_thinking_has_required_configuration() -> None:
    config = session_config("Kore", "gemini-3.8-live-extended-thinking")
    assert config["thinking_config"] == {"thinking_level": "HIGH"}
    assert "thinking_config" not in session_config("Kore", "gemini-3.8-live")
    names = [tool["name"] for group in config["tools"] for tool in group["function_declarations"]]
    assert names == ["read_attacktrace_status"]
