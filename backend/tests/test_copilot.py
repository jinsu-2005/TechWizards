from collections.abc import Iterator
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from app.engine import Engine
from app.explain.copilot_engine import CopilotEngine
from app.main import create_app
from app.schemas import CopilotChatResponse


@pytest.fixture
def client(engine: Engine, tmp_path: Path) -> Iterator[TestClient]:
    app = create_app(engine, run_loop=False)
    app.state.copilot = CopilotEngine(api_key="")
    app.state.settings.api_key = ""
    app.state.reports_dir = tmp_path
    app.state.hai_dir = tmp_path / "no-hai"
    with TestClient(app) as c:
        yield c


def test_copilot_suggestions(client: TestClient) -> None:
    res = client.get("/api/copilot/suggestions")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert any("SIM" in s for s in data)
    assert not any("LIT101" in s for s in data)


def test_copilot_chat(client: TestClient) -> None:
    payload = {
        "message": "What is the consequence of LIT101 sensor offset attack?",
        "incident_id": None,
    }
    res = client.post("/api/copilot/chat", json=payload)
    assert res.status_code == 200
    resp_obj = CopilotChatResponse.model_validate(res.json())
    assert resp_obj.reply is not None
    assert len(resp_obj.reply) > 20
    assert resp_obj.model_used is not None


def test_virtual_sensor_isolation(client: TestClient, engine: Engine) -> None:
    # Trigger an attack and step simulation to generate an incident
    body = {"scenario": "actuator_force", "target": "P101", "magnitude": 0}
    client.post("/api/attack", json=body)
    for _ in range(240):
        engine.step_sample()

    incidents = client.get("/api/incidents").json()
    assert len(incidents) > 0
    inc_id = incidents[0]["id"]

    # Isolate P101
    iso_res = client.post("/api/isolate", json={"incident_id": inc_id, "node_id": "P101"})
    assert iso_res.status_code == 200
    assert iso_res.json()["accepted"] is True

    # Step simulation and check that node state has is_virtual=True
    msg = engine.step_sample()
    assert msg is not None
    p101_node = next((n for n in msg.nodes if n.id == "P101"), None)
    assert p101_node is not None
    assert p101_node.is_virtual is True


def test_unknown_requested_incident_returns_404(client: TestClient) -> None:
    response = client.post(
        "/api/copilot/chat", json={"message": "Explain", "incident_id": "missing"}
    )
    assert response.status_code == 404


def test_no_active_incident_has_no_action(client: TestClient) -> None:
    response = client.post("/api/copilot/chat", json={"message": "What should I isolate?"})
    assert response.status_code == 200
    assert response.json()["action_node"] is None
    assert "No incident selected" in response.json()["reply"]
