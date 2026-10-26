"""EV integration tests use an isolated API app and no plant runtime mutation."""

import copy
from types import SimpleNamespace
from uuid import uuid4

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.api.ev import Sessions, router
from app.config import Settings
from app.ev.pilot import EvPilot, tools
from app.ev.runtime import COMPONENTS, Detector, EvRuntime


def step(runtime, count):
    for _ in range(count):
        runtime.step()


def test_clean_baseline_and_driver_change():
    runtime = EvRuntime()
    step(runtime, 100)
    assert not runtime.analysis["candidates"]
    runtime.speed = 90
    step(runtime, 100)
    assert runtime.incident is None


@pytest.mark.parametrize(
    "kind,target,magnitude",
    [
        ("bias", "TEMP", 22),
        ("delay", "CAN", 180),
        ("tamper", "COOL", -38),
        ("failure", "COOL", 0),
        ("freeze", "PEDAL", 0),
        ("replay", "WHEEL", 0),
    ],
)
def test_demo_attacks_detect_and_rank_without_truth(kind, target, magnitude):
    runtime = EvRuntime()
    step(runtime, 40)
    runtime.launch(kind, target, magnitude, 20)
    if kind in {"freeze", "replay"}:
        runtime.speed = 90
    step(runtime, 20)
    assert runtime.incident is not None
    ranked = [c["id"] for c in runtime.incident["analysis"]["candidates"]]
    assert target in ranked
    assert runtime.snapshot()["truth"] is None
    baseline = copy.deepcopy(runtime.analysis)
    runtime.last_truth = dict(target="FAKE", kind="FAKE")
    detector = copy.deepcopy(runtime.detector)
    other = copy.deepcopy(runtime.detector)
    # The same detector state and frame produce identical scores without injector metadata.
    result = detector.update(runtime.readings, runtime.t)
    assert result == other.update(list(reversed(runtime.readings)), runtime.t)
    assert runtime.analysis == baseline


def test_attack_expiry_and_recovery():
    runtime = EvRuntime()
    runtime.launch("bias", "TEMP", 22, 5)
    step(runtime, 8)
    assert runtime.incident is not None
    step(runtime, 200)
    assert runtime.attack is None
    assert runtime.incident["status"] == "recovered"
    assert runtime.incident["recovered_s"] > runtime.incident["detected_s"]
    assert runtime.incident["first_readings"] != runtime.readings


def test_detector_uses_values_not_component_position_or_injection_metadata():
    runtime = EvRuntime()
    changed = copy.deepcopy(runtime.readings)
    for reading in changed:
        if reading["id"] == "PACK":
            reading["value"] += 50
    detector = Detector()
    detector.update(changed, 1)
    result = detector.update(list(reversed(changed)), 1.5)
    assert result["candidates"][0]["id"] == "PACK"
    assert result["candidates"][0]["residual"] == pytest.approx(12.5)


def test_historical_pilot_context_has_no_future_or_injection_truth():
    runtime = EvRuntime()
    at = runtime.t
    runtime.launch("delay", "CAN", 180, 20)
    step(runtime, 10)
    runtime.truth_revealed = True
    context = tools(runtime.snapshot(), "CAN", at)
    assert context["get_ev_telemetry"]["time_s"] == at
    assert context["get_ev_localization"]["candidates"] == []
    assert all(e["time_s"] <= at for e in context["get_ev_evidence"])
    assert "truth" not in str(context)
    assert "injection" not in str(context)


def test_ev_pilot_model_success_and_explicit_fallback(monkeypatch):
    monkeypatch.setattr("app.ev.pilot.gemini_key", lambda: "")
    pilot = EvPilot()
    runtime = EvRuntime()
    context = tools(runtime.snapshot(), "BMS", None)
    result = pilot.chat("Inspect BMS", context, [])
    assert result["fallback"] and result["model"] == "evidence-summary"
    assert "BMS" in result["reply"]
    monkeypatch.setattr("app.ev.pilot.model_router.candidates", lambda *a: ("fake-test",))
    monkeypatch.setattr("app.ev.pilot.model_router.succeeded", lambda *a: None)
    pilot.client = SimpleNamespace(
        models=SimpleNamespace(
            generate_content=lambda **kw: SimpleNamespace(text="BMS evidence at T+0.5s")
        )
    )
    result = pilot.chat("Inspect BMS", context, [])
    assert not result["fallback"] and result["model"] == "fake-test"


@pytest.fixture
def client():
    app = FastAPI()
    app.state.settings = Settings()
    app.state.ev_sessions = Sessions()
    app.include_router(router)
    with TestClient(app) as c:
        yield c


def test_api_isolation_validation_pause_truth_and_reset(client):
    headers = {"X-EV-Session": str(uuid4())}
    other = {"X-EV-Session": str(uuid4())}
    assert client.get("/api/ev/state").status_code == 422
    state = client.get("/api/ev/state", headers=headers).json()
    assert len(state["components"]) == len(COMPONENTS) == 22
    bad = client.post("/api/ev/attack", headers=headers, json=dict(kind="delay", target="TEMP"))
    assert bad.status_code == 409
    assert (
        client.post("/api/ev/control", headers=headers, json=dict(action="reveal")).status_code
        == 409
    )
    assert (
        client.post(
            "/api/ev/attack",
            headers=headers,
            json=dict(kind="bias", target="TEMP", magnitude=22, duration=10),
        ).status_code
        == 200
    )
    assert not client.get("/api/ev/state", headers=other).json()["attack_active"]
    paused = client.post("/api/ev/control", headers=headers, json=dict(action="pause")).json()
    assert not paused["running"]
    assert client.get("/api/ev/state", headers=headers).json()["time_s"] == paused["time_s"]
    reset = client.post("/api/ev/control", headers=headers, json=dict(action="reset")).json()
    assert not reset["attack_active"] and reset["incident"] is None
    assert (
        client.post(
            "/api/ev/attack", headers=headers, json=dict(kind="bias", target="UNKNOWN")
        ).status_code
        == 422
    )


def test_api_demo_mode_and_key_protection(client):
    client.app.state.settings = Settings(api_key="secret")
    headers = {"X-EV-Session": str(uuid4())}
    assert (
        client.post("/api/ev/control", headers=headers, json=dict(action="reset")).status_code
        == 401
    )
    client.app.state.settings = Settings(demo_mode=False, api_key="secret")
    headers["X-API-Key"] = "secret"
    assert (
        client.post("/api/ev/control", headers=headers, json=dict(action="reset")).status_code
        == 403
    )
