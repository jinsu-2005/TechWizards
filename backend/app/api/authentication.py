"""Firebase identity, server-side membership and HttpOnly session cookies.

Local demo mode remains explicit; private deployments enable this boundary.
No Firebase refresh token, server credential or session cookie is returned to JavaScript.
"""

import asyncio
import hashlib
import hmac
import secrets
import threading
import time
from collections.abc import Awaitable, Callable
from datetime import timedelta
from typing import Any

from fastapi import APIRouter, HTTPException, Request, Response, WebSocket
from pydantic import BaseModel, Field
from starlette.responses import JSONResponse

router = APIRouter(prefix="/api/auth", tags=["authentication"])
_lock = threading.Lock()
_cache: dict[str, tuple[float, dict[str, Any]]] = {}
SESSION_S = 8 * 3600


def names(settings: Any) -> tuple[str, str]:
    prefix = "__Host-" if settings.auth_cookie_secure else ""
    return prefix + "at_session", prefix + "at_csrf"


def firebase_app(project: str) -> Any:
    import firebase_admin

    if not project:
        raise HTTPException(503, "Firebase project is not configured")
    with _lock:
        try:
            app = firebase_admin.get_app("attacktrace")
            if app.project_id != project:
                raise HTTPException(503, "Firebase project changed; restart the backend")
            return app
        except ValueError:
            return firebase_admin.initialize_app(
                options={"projectId": project, "httpTimeout": 10}, name="attacktrace"
            )


def identity(settings: Any, cookie: str, store: Any = None) -> dict[str, Any]:
    from firebase_admin import auth

    if not cookie:
        raise HTTPException(401, "Sign in required")
    try:
        firebase_cookie, nonce = cookie.rsplit("~", 1)
        if not firebase_cookie or len(nonce) < 32:
            raise ValueError("Invalid session format")
    except ValueError as exc:
        raise HTTPException(401, "Session expired or unavailable; sign in again") from exc
    key = hashlib.sha256(cookie.encode()).hexdigest()
    if store is not None:
        with store.lock:
            row = store.db.execute(
                "SELECT uid FROM auth_sessions WHERE token_hash=? AND revoked=0 AND expires>?",
                (key, time.time()),
            ).fetchone()
        if row is None:
            raise HTTPException(401, "Session expired or signed out")
    with _lock:
        saved = _cache.get(key)
    now = time.time()
    if saved and now < saved[0]:
        claims = saved[1]
    else:
        try:
            claims = auth.verify_session_cookie(
                firebase_cookie, app=firebase_app(settings.firebase_project_id), check_revoked=True
            )
        except HTTPException:
            raise
        except Exception as exc:
            from google.auth.exceptions import DefaultCredentialsError

            if isinstance(exc, DefaultCredentialsError):
                raise HTTPException(503, "Server Google credentials are not configured") from exc
            raise HTTPException(401, "Session expired or unavailable; sign in again") from exc
        with _lock:
            if len(_cache) >= 1024:
                _cache.clear()
            _cache[key] = (min(now + 5, float(claims["exp"])), claims)
    email = str(claims.get("email", "")).casefold()
    role = {k.casefold(): v for k, v in settings.auth_members.items()}.get(email)
    if claims.get("email_verified") is not True or role not in {"viewer", "analyst", "admin"}:
        raise HTTPException(403, "This verified account has no workspace membership")
    return {"uid": claims["sub"], "email": email, "role": role, "expires_at": claims["exp"]}


def check_origin(origin: str | None, settings: Any) -> None:
    if origin not in settings.cors_origins:
        raise HTTPException(403, "Untrusted request origin")


def required_role(path: str) -> str:
    if path in {"/api/copilot/chat", "/api/ev/pilot/chat"} or path.startswith("/api/voice/"):
        return "viewer"
    if path.endswith("/workflow"):
        return "analyst"
    return "admin"


async def protect(
    request: Request, call_next: Callable[[Request], Awaitable[Response]]
) -> Response:
    settings = request.app.state.settings
    path = request.url.path
    if not settings.auth_enabled or not path.startswith("/api/"):
        response = await call_next(request)
        return response
    if request.method == "OPTIONS":
        return await call_next(request)
    if path in {"/api/auth/config", "/api/auth/session", "/api/health"}:
        response = await call_next(request)
        response.headers["Cache-Control"] = "no-store"
        return response
    try:
        session_name, csrf_name = names(settings)
        principal = await asyncio.to_thread(
            identity, settings, request.cookies.get(session_name, ""), request.app.state.soc
        )
        request.state.principal = principal
        if request.method not in {"GET", "HEAD", "OPTIONS"}:
            check_origin(request.headers.get("origin"), settings)
            csrf = request.cookies.get(csrf_name, "")
            if not csrf or not hmac.compare_digest(csrf, request.headers.get("x-csrf-token", "")):
                raise HTTPException(403, "CSRF validation failed")
            rank = {"viewer": 0, "analyst": 1, "admin": 2}
            if path != "/api/auth/logout" and rank[principal["role"]] < rank[required_role(path)]:
                raise HTTPException(403, "Your role cannot perform this operation")
        response = await call_next(request)
        response.headers["Cache-Control"] = "no-store"
        if request.method not in {"GET", "HEAD", "OPTIONS"}:
            request.app.state.soc.event(
                request.app.state.mode,
                request.app.state.session_id,
                "authenticated_action",
                {
                    "actor_uid": principal["uid"],
                    "role": principal["role"],
                    "method": request.method,
                    "route": path,
                    "status": response.status_code,
                    "classification": "operator_record",
                },
            )
        return response
    except HTTPException as exc:
        return JSONResponse({"detail": exc.detail}, status_code=exc.status_code)


class SessionRequest(BaseModel):
    id_token: str = Field(min_length=20, max_length=10000)


@router.get("/config")
def config(request: Request) -> dict[str, Any]:
    # No caching of access configuration across deployment changes.
    return {
        "enabled": request.app.state.settings.auth_enabled,
        "project_id": request.app.state.settings.firebase_project_id,
    }


@router.post("/session")
async def session(body: SessionRequest, request: Request, response: Response) -> dict[str, Any]:
    from firebase_admin import auth

    settings = request.app.state.settings
    if not settings.auth_enabled:
        raise HTTPException(409, "Private authentication is disabled")
    check_origin(request.headers.get("origin"), settings)
    limiter = request.app.state.attack_limiter
    if limiter.check(request.client.host if request.client else "unknown") is not None:
        raise HTTPException(429, "Too many sign-in attempts")

    def exchange() -> tuple[str, dict[str, Any]]:
        try:
            app = firebase_app(settings.firebase_project_id)
            claims = auth.verify_id_token(body.id_token, app=app, check_revoked=True)
            if time.time() - claims.get("auth_time", 0) > 300:
                raise HTTPException(401, "Sign in again to create a fresh session")
            firebase_cookie = auth.create_session_cookie(
                body.id_token, expires_in=timedelta(seconds=SESSION_S), app=app
            )
            # Distinct browser sessions stay distinct even if Firebase issues identical JWTs
            # within the same second. A logged-out cookie is never reactivated by a later login.
            cookie = firebase_cookie + "~" + secrets.token_urlsafe(32)
            # Membership is enforced before issuing a browser session.
            principal = identity(settings, cookie)
            return cookie, principal
        except HTTPException:
            raise
        except Exception as exc:
            from google.auth.exceptions import DefaultCredentialsError

            if isinstance(exc, DefaultCredentialsError):
                raise HTTPException(503, "Server Google credentials are not configured") from exc
            raise HTTPException(401, "Firebase sign-in could not be verified") from exc

    cookie, principal = await asyncio.to_thread(exchange)
    store = request.app.state.soc
    with store.lock, store.db:
        store.db.execute("DELETE FROM auth_sessions WHERE expires<?", (time.time(),))
        store.db.execute(
            "INSERT INTO auth_sessions(token_hash,uid,expires) VALUES(?,?,?)",
            (
                hashlib.sha256(cookie.encode()).hexdigest(),
                principal["uid"],
                principal["expires_at"],
            ),
        )
    session_name, csrf_name = names(settings)
    for name, value, http_only in (
        (session_name, cookie, True),
        (csrf_name, secrets.token_urlsafe(32), False),
    ):
        response.set_cookie(
            name,
            value,
            max_age=SESSION_S,
            httponly=http_only,
            secure=settings.auth_cookie_secure,
            samesite="strict",
            path="/",
        )
    response.headers["Cache-Control"] = "no-store"
    return principal


@router.get("/me")
def me(request: Request) -> dict[str, Any]:
    return getattr(request.state, "principal", {"role": "local-demo", "email": None})


@router.post("/logout")
def logout(request: Request, response: Response) -> dict[str, bool]:
    settings = request.app.state.settings
    session_name, csrf_name = names(settings)
    cookie = request.cookies.get(session_name, "")
    if cookie:
        store = request.app.state.soc
        with store.lock, store.db:
            store.db.execute(
                "UPDATE auth_sessions SET revoked=1 WHERE token_hash=?",
                (hashlib.sha256(cookie.encode()).hexdigest(),),
            )
        with _lock:
            _cache.pop(hashlib.sha256(cookie.encode()).hexdigest(), None)
    for name in (session_name, csrf_name):
        response.delete_cookie(
            name,
            path="/",
            secure=settings.auth_cookie_secure,
            httponly=name == session_name,
            samesite="strict",
        )
    return {"signed_out": True}


async def websocket_identity(ws: WebSocket) -> None:
    settings = ws.app.state.settings
    if settings.auth_enabled:
        check_origin(ws.headers.get("origin"), settings)
        session_name, _ = names(settings)
        await asyncio.to_thread(
            identity, settings, ws.cookies.get(session_name, ""), ws.app.state.soc
        )
