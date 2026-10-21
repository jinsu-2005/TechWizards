import time

import pytest
from fastapi.testclient import TestClient
from starlette.websockets import WebSocketDisconnect

from app.api import authentication
from app.config import Settings
from app.main import create_app
from tests.test_soc_journal import case

ORIGIN = "http://localhost:5173"


@pytest.fixture
def secured(engine, monkeypatch):
    from firebase_admin import auth

    authentication._cache.clear()
    claims = {
        "sub": "firebase-user",
        "email": "analyst@example.com",
        "email_verified": True,
        "auth_time": time.time(),
        "exp": time.time() + 3600,
    }
    checks = []

    def verify(token, **kw):
        checks.append(kw)
        if token == "invalid-token-for-this-test":
            raise ValueError("Invalid token")
        return dict(claims)

    monkeypatch.setattr(authentication, "firebase_app", lambda _: object())
    monkeypatch.setattr(auth, "verify_id_token", verify)
    monkeypatch.setattr(auth, "verify_session_cookie", verify)
    monkeypatch.setattr(auth, "create_session_cookie", lambda *a, **kw: "unit-test-session-cookie")
    app = create_app(engine, run_loop=False)
    app.state.settings = Settings(
        auth_enabled=True,
        auth_cookie_secure=False,
        firebase_project_id="unit-project",
        api_key="unused-demo-key",
        auth_members={"analyst@example.com": "analyst"},
    )
    with TestClient(app) as client:
        yield app, client, claims, checks


def login(client):
    return client.post(
        "/api/auth/session",
        headers={"Origin": ORIGIN},
        json={"id_token": "unit-test-id-token-with-valid-length"},
    )


def headers(client):
    return {"Origin": ORIGIN, "X-CSRF-Token": client.cookies.get("at_csrf")}


def test_anonymous_reads_exports_and_stream_are_denied(secured):
    _, client, _, _ = secured
    for path in ("/api/status", "/api/topology", "/api/evidence", "/api/investigations/x/export"):
        assert client.get(path).status_code == 401
    assert client.get("/api/health").json() == {"status": "ok"}
    assert client.get("/api/auth/config").json()["enabled"] is True
    with (
        pytest.raises(WebSocketDisconnect),
        client.websocket_connect("/ws/live", headers={"Origin": ORIGIN}),
    ):
        pass


def test_login_cookie_membership_and_csrf(secured):
    app, client, _, checks = secured
    result = login(client)
    assert result.status_code == 200 and result.json()["role"] == "analyst"
    cookies = result.headers.get_list("set-cookie")
    assert any("at_session=" in c and "HttpOnly" in c and "SameSite=strict" in c for c in cookies)
    assert client.get("/api/status").status_code == 200
    assert client.post("/api/reset", headers={"X-API-Key": "unused-demo-key"}).status_code == 403
    assert client.post("/api/reset", headers=headers(client)).status_code == 403
    app.state.settings.auth_members["analyst@example.com"] = "admin"
    assert client.post("/api/reset", headers=headers(client)).status_code == 200
    assert all(c["check_revoked"] is True for c in checks)
    assert (
        client.post(
            "/api/reset", headers={**headers(client), "Origin": "https://evil.test"}
        ).status_code
        == 403
    )
    app.state.settings.auth_members.clear()
    assert client.get("/api/status").status_code == 403


def test_unverified_unlisted_invalid_and_old_signins_are_rejected(secured):
    _, client, claims, _ = secured
    claims["email_verified"] = False
    assert login(client).status_code == 403
    claims["email_verified"] = True
    claims["email"] = "unlisted@example.com"
    authentication._cache.clear()
    assert login(client).status_code == 403
    claims["email"] = "analyst@example.com"
    claims["auth_time"] = time.time() - 600
    assert login(client).status_code == 401
    assert (
        client.post(
            "/api/auth/session",
            headers={"Origin": ORIGIN},
            json={"id_token": "invalid-token-for-this-test"},
        ).status_code
        == 401
    )


def test_logout_invalidates_copied_cookie_and_stream(secured):
    _, client, _, _ = secured
    assert login(client).status_code == 200
    cookie = client.cookies.get("at_session")
    assert client.post("/api/auth/logout", headers=headers(client)).status_code == 200
    client.cookies.set("at_session", cookie)
    assert client.get("/api/status").status_code == 401
    with (
        pytest.raises(WebSocketDisconnect),
        client.websocket_connect("/ws/live", headers={"Origin": ORIGIN}),
    ):
        pass


def test_session_expiry_is_enforced_even_with_cached_identity(secured):
    app, client, _, _ = secured
    assert login(client).status_code == 200
    with app.state.soc.lock, app.state.soc.db:
        app.state.soc.db.execute("UPDATE auth_sessions SET expires=0")
    assert client.get("/api/status").status_code == 401


def test_repeated_signins_have_distinct_server_sessions(secured):
    _, client, _, _ = secured
    assert login(client).status_code == 200
    first = client.cookies.get("at_session")
    assert login(client).status_code == 200
    second = client.cookies.get("at_session")
    assert first != second
    assert client.post("/api/auth/logout", headers=headers(client)).status_code == 200
    client.cookies.set("at_session", second)
    assert client.get("/api/status").status_code == 401
    client.cookies.set("at_session", first)
    assert client.get("/api/status").status_code == 200


def test_analyst_decisions_record_verified_actor(secured, engine):
    app, client, _, _ = secured
    inc = case()
    engine.incidents.append(inc)
    assert login(client).status_code == 200
    result = client.post(
        f"/api/investigations/{inc.id}/workflow",
        headers=headers(client),
        json={"note": "Reviewed saved evidence"},
    )
    assert result.status_code == 200
    record = next(e for e in result.json()["events"] if e["category"] == "operator_decision")
    assert record["payload"]["actor"] == "firebase-user"
    audit = app.state.soc.events("sim")
    assert any(
        e["category"] == "authenticated_action" and e["payload"]["actor_uid"] == "firebase-user"
        for e in audit
    )


def test_missing_server_credentials_fail_closed(secured, monkeypatch):
    from google.auth.exceptions import DefaultCredentialsError

    _, client, _, _ = secured

    def missing(_):
        raise DefaultCredentialsError("Secret detail must not be exposed")

    monkeypatch.setattr(authentication, "firebase_app", missing)
    result = login(client)
    assert result.status_code == 503
    assert "Secret detail" not in result.text
    assert "at_session" not in client.cookies
