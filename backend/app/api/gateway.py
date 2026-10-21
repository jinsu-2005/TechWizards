"""Optional origin lock for the single-host cloud gateway, including WebSocket upgrades."""

import hmac

from starlette.datastructures import Headers
from starlette.responses import JSONResponse
from starlette.types import ASGIApp, Receive, Scope, Send


class GatewayBoundary:
    def __init__(self, app: ASGIApp, secret: str = "") -> None:
        self.app = app
        self.secret = secret

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        kind = scope["type"]
        health = (
            kind == "http" and scope["path"] == "/api/health" and scope["method"] in {"GET", "HEAD"}
        )
        if self.secret and kind in {"http", "websocket"} and not health:
            supplied = Headers(scope=scope).get("x-attacktrace-gateway", "")
            if not hmac.compare_digest(supplied.encode(), self.secret.encode()):
                if kind == "websocket":
                    await send({"type": "websocket.close", "code": 4403})
                else:
                    await JSONResponse(
                        {"detail": "Use the configured application gateway"},
                        status_code=403,
                        headers={"Cache-Control": "no-store"},
                    )(scope, receive, send)
                return
        await self.app(scope, receive, send)
