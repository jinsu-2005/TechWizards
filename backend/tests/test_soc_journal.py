import time

from fastapi.testclient import TestClient

from app.main import create_app
from app.schemas import Incident, LiveMessage, NodeState, OriginCandidate
from app.soc import SocStore


def case(incident_id="inc_journal", mode="sim"):
    return Incident(
        id=incident_id,
        mode=mode,
        status="open",
        detected_at=time.time(),
        origin=[OriginCandidate(id="PLC1", type="controller", confidence=0.6)],
        path=[],
        path_edges=[],
        explanation="Hypothesis",
        action="Review",
        mitre="",
        mitre_name="",
        baseline_alarms=[],
    )


def test_journal_restart_preserves_evidence_and_analyst_decision(tmp_path):
    path = str(tmp_path / "soc.sqlite")
    store = SocStore(path)
    inc = case()
    msg = LiveMessage(
        t=time.time(),
        mode="sim",
        nodes=[NodeState(id="PLC1", value=0.5, truth=0.5, score=2, status="suspect")],
        alert=None,
        incident=inc,
        impact=None,
    )
    store.ingest(msg, "session1")
    store.update_workflow(
        inc.id, "sim", {"acknowledged": True, "severity": "high", "note": "Compare alternatives"}
    )
    store.close()
    reopened = SocStore(path)
    try:
        detail = reopened.detail(inc.id, "sim")
        assert detail["session_id"] == "session1"
        assert detail["workflow"] == {"acknowledged": True, "severity": "high"}
        assert {e["category"] for e in detail["events"]} == {
            "process_observation",
            "incident_state",
            "operator_decision",
        }
        assert reopened.detail(inc.id, "live") is None
        assert reopened.events("live") == []
        assert len({e["id"] for e in detail["events"]}) == 3
    finally:
        reopened.close()


def test_old_notes_and_transitions_remain_visible_among_telemetry():
    store = SocStore(":memory:")
    inc = case()
    store.save_incident(inc, "one")
    store.update_workflow(inc.id, "sim", {"note": "Decision before telemetry"})
    for i in range(220):
        store.event("sim", "one", "process_observation", {"value": i}, inc.id, "PLC1")
    result = store.detail(inc.id, "sim")
    assert any(e["payload"].get("note") == "Decision before telemetry" for e in result["events"])
    store.close()


def test_context_evidence_cannot_cross_source_sessions():
    store = SocStore(":memory:")
    inc = case(mode="live")
    store.save_incident(inc, "one")
    payload = {"emulator_value": 5, "receiver_value": 15}
    store.event("live", "other", "channel_observation", payload, asset_id="LIT101")
    assert store.detail(inc.id, "live")["layer_hypotheses"] == []
    store.event("live", "one", "channel_observation", payload, asset_id="LIT101")
    assert store.detail(inc.id, "live")["layer_hypotheses"][0]["result"] == "supported"
    store.close()


def test_workflow_api_scope_validation_and_evidence_links(engine):
    inc = case()
    engine.incidents.append(inc)
    app = create_app(engine, run_loop=False)
    with TestClient(app) as client:
        assert (
            client.post(
                f"/api/investigations/{inc.id}/workflow", json={"severity": "invented"}
            ).status_code
            == 422
        )
        saved = client.post(
            f"/api/investigations/{inc.id}/workflow",
            json={"acknowledged": True, "note": "Reviewed"},
        )
        assert saved.status_code == 200
        note = next(e for e in saved.json()["events"] if e["category"] == "operator_decision")
        assert client.get(note["record_url"]).json()["payload"]["note"] == "Reviewed"
        assert client.get("/api/incident-workflows").json()[inc.id]["acknowledged"] is True
        # Reset clears the simulator but keeps its saved investigation and report.
        assert client.post("/api/reset").status_code == 200
        assert client.get(f"/api/investigations/{inc.id}").status_code == 200
        assert client.get("/api/incidents").json()[0]["id"] == inc.id
        app.state.mode = "live"
        # Query evidence directly: this source scope must not expose SIM records.
        with app.state.soc.lock:
            assert app.state.soc.detail(inc.id, "live") is None


def test_copilot_saved_incident_has_resolvable_citations(engine):
    from app.explain.copilot_engine import CopilotEngine

    inc = case()
    engine.incidents.append(inc)
    app = create_app(engine, run_loop=False)
    app.state.copilot = CopilotEngine(api_key="")
    with TestClient(app) as client:
        client.get("/api/incidents")
        engine.incidents.clear()
        answer = client.post(
            "/api/copilot/chat", json={"message": "Compare candidates", "incident_id": inc.id}
        )
        assert answer.status_code == 200
        evidence = answer.json()["evidence"]
        assert evidence and answer.json()["action_node"] is None
        assert client.get(evidence[0]["record_url"]).status_code == 200


def test_historical_copilot_cannot_offer_current_action(engine):
    from app.explain.copilot_engine import CopilotEngine

    inc = case()
    engine.incidents.append(inc)
    engine.latest = LiveMessage(
        t=time.time(), mode="sim", nodes=[], alert=None, incident=inc, impact=None
    )
    app = create_app(engine, run_loop=False)
    app.state.copilot = CopilotEngine(api_key="")
    with TestClient(app) as client:
        result = client.post(
            "/api/copilot/chat",
            json={
                "message": "Isolate",
                "incident_id": inc.id,
                "asset_id": "PLC1",
                "as_of": time.time(),
            },
        )
        assert result.status_code == 200
        assert result.json()["action_node"] is None
        assert "Historical request" in result.json()["reply"]
        assert "Selected asset" in result.json()["reply"]
        assert client.get("/api/runbooks/local").status_code == 200


def test_restored_session_cannot_overwrite_original_incident_state():
    store = SocStore(":memory:")
    inc = case()
    store.save_incident(inc, "original")
    restored = inc.model_copy(update={"status": "closed"})
    store.save_incident(restored, "restored")
    detail = store.detail(inc.id, "sim")
    assert detail["incident"]["status"] == "open"
    assert detail["session_id"] == "original"
    store.close()
