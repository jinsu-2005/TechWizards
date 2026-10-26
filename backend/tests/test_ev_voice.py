from types import SimpleNamespace
from uuid import uuid4

from app.api import live_voice
from app.api.ev import Sessions
from app.ev.runtime import EvRuntime


def test_ev_session_config_swaps_prompt_and_tool():
    config = live_voice.session_config("Kore", "gemini-3.8-live", ev=True)
    assert config["system_instruction"] == live_voice.EV_SYSTEM_PROMPT
    assert config["tools"][0]["function_declarations"][0]["name"] == "read_ev_status"
    assert "STRICT LANGUAGE POLICY" in live_voice.EV_SYSTEM_PROMPT
    water = live_voice.session_config("Kore", "gemini-3.8-live")
    assert water["tools"][0]["function_declarations"][0]["name"] == "read_attacktrace_status"


def test_ev_status_never_leaks_injection_truth():
    pool = Sessions()
    key = str(uuid4())
    runtime = EvRuntime()
    pool.items[key] = (0.0, "local-demo", runtime)
    runtime.launch("bias", "TEMP", 22, 25)
    state = SimpleNamespace(ev_sessions=pool)
    status = live_voice.ev_status(state, key, "TEMP")
    text = str(status)
    assert "get_ev_telemetry" in status and "get_ev_localization" in status
    assert "truth" not in status
    assert "injection" not in str(status["get_ev_evidence"])
    assert "started_s" not in text


def test_ev_status_rejects_unknown_or_foreign_session():
    state = SimpleNamespace(ev_sessions=Sessions())
    assert live_voice.ev_status(state, "not-a-uuid", "BMS") == {"error": "EV session unavailable"}
    assert live_voice.ev_status(state, str(uuid4()), "BMS") == {"error": "EV session unavailable"}
    pool = Sessions()
    key = str(uuid4())
    pool.items[key] = (0.0, "someone-else", EvRuntime())
    assert live_voice.ev_status(SimpleNamespace(ev_sessions=pool), key, "BMS") == {"error": "EV session unavailable"}


def test_ev_opening_is_bounded_and_hedged():
    prompt = live_voice.ev_opening({"get_ev_localization": {"candidates": [{"id": "TEMP"}]}}, None)
    assert "TEMP" in prompt and "not confirmed" in prompt
    calm = live_voice.ev_opening({"get_ev_localization": {"candidates": []}}, [{"speaker": "user", "text": "hi"}])
    assert "No persistent anomaly" in calm and "back" in calm


def test_ev_alert_is_server_built_and_hedged():
    lead = {"id": "TEMP", "onset_s": 41.5}
    alert = live_voice.ev_alert({"get_ev_localization": {"candidates": [lead]}})
    assert alert is not None and "TEMP" in alert and "not confirmed" in alert
    assert live_voice.ev_alert({"get_ev_localization": {"candidates": []}}) is None
    assert live_voice.ev_alert({"error": "EV session unavailable"}) is None
