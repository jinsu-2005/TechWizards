import copy
import json
import time
from types import SimpleNamespace

from fastapi.testclient import TestClient

from app.incident_capture import runtime_context
from app.main import create_app
from app.schemas import LiveMessage, NodeState
from app.soc import SocStore
from tests.test_soc_journal import case


def message(inc=None, value=50):
    return LiveMessage(
        t=time.time(),
        mode="sim",
        nodes=[NodeState(id="LIT101", value=value, truth=999, score=2, status="suspect")],
        alert=None,
        incident=inc,
        impact=None,
    )


def test_capture_is_immutable_survives_reopen_and_telemetry_rotation(engine, tmp_path):
    path = str(tmp_path / "journal.sqlite")
    store = SocStore(path)
    store.ingest(message(), "original")
    inc = case()
    context = runtime_context(engine)
    store.ingest(message(inc), "original", context)
    first = store.capture(inc.id, "sim")
    assert first["status"] == "captured"
    assert first["payload"]["readings"][0]["value"] == 50
    assert "truth" not in first["payload"]["readings"][0]
    assert "ground_truth" not in first["payload"]["initial_assessment"]
    assert first["payload"]["pre_event_readings"]
    context["source"]["seed"] = 1234
    changed = inc.model_copy(update={"status": "closed"})
    store.ingest(message(changed, 75), "original", context)
    store.update_workflow(inc.id, "sim", {"note": "Reviewed alternatives"})
    with store.db:
        store.db.execute("DELETE FROM evidence WHERE category='process_observation'")
    assert store.capture(inc.id, "sim") == first
    store.close()
    reopened = SocStore(path)
    assert reopened.capture(inc.id, "sim") == first
    assert reopened.detail(inc.id, "sim")["incident"]["status"] == "closed"
    assert reopened.capture(inc.id, "live")["status"] == "not_captured"
    reopened.close()


def test_legacy_case_and_restored_session_never_receive_current_context(engine):
    store = SocStore(":memory:")
    inc = case()
    store.save_incident(inc, "old")
    store.ingest(message(inc), "new", runtime_context(engine))
    store.ingest(message(inc), "old", runtime_context(engine))
    assert store.capture(inc.id, "sim")["status"] == "not_captured"
    assert store.detail(inc.id, "sim")["session_id"] == "old"
    assert all(e["session"] != "new" for e in store.events("sim", incident_id=inc.id))
    store.close()


def test_capture_integrity_failure_never_returns_modified_payload(engine):
    store = SocStore(":memory:")
    inc = case()
    store.ingest(message(inc), "one", runtime_context(engine))
    with store.db:
        store.db.execute("UPDATE incident_captures SET payload=?", ('{"modified":true}',))
    result = store.detail(inc.id, "sim")["capture"]
    assert result["status"] == "integrity_error" and "payload" not in result
    store.close()


def test_loaded_identity_does_not_read_replacement_files(engine, tmp_path):
    before = copy.deepcopy(runtime_context(engine))
    engine.settings.models_dir = tmp_path
    (tmp_path / "detector.json").write_text('{"active":"replacement"}')
    assert runtime_context(engine)["model"] == before["model"]
    assert len(before["model"]["runtime_id"]) == 64
    assert len(before["baseline"]["mean"]) == 9


def test_live_capture_context_includes_register_map_and_saved_training_reference(engine):
    from pathlib import Path

    from app.live.config import load_live

    engine.settings.live_tagmap = Path(__file__).resolve().parents[2] / "config/tagmap.yaml"
    cfg, tagmap = load_live(engine.settings)
    runtime = SimpleNamespace(
        engine=engine, mode="live", cfg=cfg, tagmap=tagmap, fingerprint="bound-source",
        topology=engine.topology, provenance=lambda: {
            "model_id": "loaded-artifact", "trained_at": "2026-10-15T00:00:00Z",
            "recorded_samples": 600, "sample_s": 0.5,
        },
    )
    result = runtime_context(runtime)
    assert result["model"]["model_id"] == "loaded-artifact"
    assert result["source"]["source_fingerprint"] == "bound-source"
    assert len(result["source"]["register_map"]) == 9
    assert result["source"]["device_id"] == tagmap.device_id


def test_capture_retention_follows_incident_not_telemetry(engine):
    store = SocStore(":memory:")
    inc = case()
    store.ingest(message(inc), "one", runtime_context(engine))
    with store.db:
        store.db.execute("UPDATE soc_incidents SET updated=0 WHERE id=?", (inc.id,))
    for i in range(500):
        store.save_incident(case(f"new_{i}"), "one")
    store.ingest(message(), "another-sampling-key")
    assert len(store.incidents("sim")) == 500
    assert store.detail(inc.id, "sim") is None
    assert store.db.execute("SELECT COUNT(*) FROM incident_captures").fetchone()[0] == 0
    store.close()


def test_api_export_and_archived_copilot_use_original_capture(engine):
    from app.explain.copilot_engine import CopilotEngine

    inc = case()
    engine.latest = message(inc)
    engine.incidents.append(inc)
    app = create_app(engine, run_loop=False)
    app.state.copilot = CopilotEngine(api_key="")
    with TestClient(app) as client:
        first = client.get(f"/api/investigations/{inc.id}/capture").json()
        assert first["status"] == "captured"
        original_id = first["payload"]["model"]["runtime_id"]
        client.post("/api/reset")
        exported = client.get(f"/api/investigations/{inc.id}/export").json()
        assert exported["investigation"]["capture"] == first
        answer = client.post(
            "/api/copilot/chat",
            json={
                "message": "Explain origin, alternatives and model",
                "incident_id": inc.id,
            },
        ).json()
        assert original_id in answer["reply"]
        assert "Alternative explanations" in answer["reply"]
        assert "Propagation uncertainty" in answer["reply"]
        assert answer["action_node"] is None
        assert "Current LIVE model reference" not in answer["reply"]
        assert '"truth"' not in json.dumps(exported["investigation"]["capture"])
        # Requests before first observation cannot cite the later capture.
        earlier = client.post(
            "/api/copilot/chat",
            json={
                "message": "Earlier evidence",
                "incident_id": inc.id,
                "as_of": first["payload"]["sample_time"] - 1,
            },
        ).json()
        assert original_id not in earlier["reply"]
