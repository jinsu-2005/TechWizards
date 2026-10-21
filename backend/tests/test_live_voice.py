"""Live voice must stay read-only and behind the existing access boundary."""

from pathlib import Path
from types import SimpleNamespace

from fastapi.testclient import TestClient

from app.api.live_voice import process_snapshot
from app.config import Settings
from app.engine import Engine
from app.main import create_app


def test_voice_snapshot_excludes_sim_ground_truth() -> None:
    incident = SimpleNamespace(
        id="inc-test", status="open", ambiguous=True,
        origin=[SimpleNamespace(id="LIT101", type="sensor", confidence=0.6)],
        path=[SimpleNamespace(id="PLC1")],
        ground_truth={"scenario": "sensor_offset", "target": "LIT101"},
    )
    node = SimpleNamespace(id="LIT101", value=52.0, status="suspect", quality="good", truth=75.0)
    runtime = SimpleNamespace(latest=SimpleNamespace(t=123.0, nodes=[node], incident=incident))
    state = SimpleNamespace(mode="sim", engine=runtime)

    snapshot = process_snapshot(state)

    assert snapshot["readings"][0]["value"] == 52.0
    assert snapshot["incident"]["leading_candidates"][0]["asset"] == "LIT101"
    assert "ground_truth" not in str(snapshot)
    assert "truth" not in snapshot["readings"][0]


def test_voice_rejects_wrong_demo_key_before_gemini(engine: Engine, tmp_path: Path) -> None:
    app = create_app(engine, run_loop=False)
    app.state.settings = Settings(api_key="test-key-123456")
    app.state.reports_dir = tmp_path
    with TestClient(app) as client, client.websocket_connect(
        "/ws/voice", headers={"origin": "http://localhost:5173"}
    ) as ws:
        ws.send_json({"type": "start", "voice": "Kore", "api_key": "incorrect"})
        assert ws.receive_json() == {"type": "error", "message": "API key required"}
