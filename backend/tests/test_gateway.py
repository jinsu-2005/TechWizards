import pytest
from fastapi import FastAPI, WebSocket
from fastapi.testclient import TestClient
from starlette.websockets import WebSocketDisconnect

from app.api.gateway import GatewayBoundary

SECRET = "unit-test-secret-more-than-32-characters"


def gateway_app(secret=SECRET):
    app = FastAPI()
    app.add_middleware(GatewayBoundary, secret=secret)

    @app.get("/api/health")
    def health():
        return {"status": "ok"}

    @app.get("/api/status")
    def status():
        return {"auth_required_by_next_layer": True}

    @app.websocket("/ws/live")
    async def stream(ws: WebSocket):
        await ws.accept()
        await ws.send_text("next authorization layer reached")
        await ws.close()

    return app


def test_direct_origin_denied_even_for_auth_config_and_docs():
    with TestClient(gateway_app()) as client:
        for path in ("/api/status", "/api/auth/config", "/openapi.json", "/docs"):
            response = client.get(path)
            assert response.status_code == 403
            assert response.headers["cache-control"] == "no-store"
        assert client.get("/api/health").json() == {"status": "ok"}
        assert client.post("/api/health").status_code == 403
        assert (
            client.get("/api/status", headers={"X-AttackTrace-Gateway": "wrong"}).status_code == 403
        )
        assert (
            client.get("/api/status", headers={"X-AttackTrace-Gateway": SECRET}).status_code == 200
        )


def test_stream_requires_gateway_secret_before_upgrade():
    with TestClient(gateway_app()) as client:
        with pytest.raises(WebSocketDisconnect) as closed, client.websocket_connect("/ws/live"):
            pass
        assert closed.value.code == 4403
        with client.websocket_connect("/ws/live", headers={"X-AttackTrace-Gateway": SECRET}) as ws:
            assert ws.receive_text() == "next authorization layer reached"


def test_local_mode_is_unchanged_without_an_origin_secret():
    with TestClient(gateway_app(secret="")) as client:
        assert client.get("/api/status").status_code == 200


def test_gateway_secret_does_not_replace_firebase_identity(engine, monkeypatch):
    from app.config import Settings
    from app.main import create_app

    monkeypatch.setattr(
        "app.main.get_settings",
        lambda: Settings(
            auth_enabled=True,
            firebase_project_id="unit-project",
            gateway_secret=SECRET,
        ),
    )
    with TestClient(create_app(engine, run_loop=False)) as client:
        assert client.get("/api/status").status_code == 403
        assert (
            client.get("/api/status", headers={"X-AttackTrace-Gateway": SECRET}).status_code == 401
        )
        with (
            pytest.raises(WebSocketDisconnect) as closed,
            client.websocket_connect(
                "/ws/live",
                headers={"X-AttackTrace-Gateway": SECRET, "Origin": "http://localhost:5173"},
            ),
        ):
            pass
        assert closed.value.code == 4401
