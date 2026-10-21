"""WebSocket `/ws/live`: broadcast-only, reconnect-safe. One message per emit period."""

import asyncio
import contextlib
import logging
import time
from typing import Any

from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect

from app.api.authentication import websocket_identity
from app.incident_capture import runtime_context
from app.runtime import active_runtime

router = APIRouter()
log = logging.getLogger("attacktrace")


class Hub:
    def __init__(self) -> None:
        self.clients: set[WebSocket] = set()

    async def broadcast(self, payload: str) -> None:
        clients = list(self.clients)
        results = await asyncio.gather(
            *(c.send_text(payload) for c in clients), return_exceptions=True
        )
        for c, r in zip(clients, results, strict=True):
            if isinstance(r, Exception):
                self.clients.discard(c)


async def run_loop(state: Any, hub: Hub, period_s: float) -> None:
    """Drive the active engine at a fixed real-time cadence without drifting. Only the active
    engine advances. An already-started LIVE calibration continues collecting in background."""
    next_t = time.monotonic()
    while True:
        try:
            rt = active_runtime(state)
            message = rt.step_sample()
            live_runtime = getattr(state, "live", None)
            if live_runtime is not None and live_runtime is not rt:
                live_runtime.advance_calibration()
            if getattr(state, "soc", None) is not None:
                try:
                    context = (
                        runtime_context(rt)
                        if message.incident and state.soc.needs_capture(message.incident.id)
                        else None
                    )
                    state.soc.ingest(message, getattr(rt, "session_id", state.session_id), context)
                except Exception:
                    log.exception("Investigation journal unavailable; stream continues")
            await hub.broadcast(message.model_dump_json())
        except Exception:
            log.exception("live tick failed; continuing")
        next_t += period_s
        await asyncio.sleep(max(0.0, next_t - time.monotonic()))


@router.websocket("/ws/live")
async def live(ws: WebSocket) -> None:
    hub: Hub = ws.app.state.hub
    try:
        await websocket_identity(ws)
    except HTTPException:
        await ws.close(code=4401)
        return
    await ws.accept()
    hub.clients.add(ws)
    try:
        latest = active_runtime(ws.app.state).latest
        if latest is not None:  # a reconnecting client is current immediately
            await ws.send_text(latest.model_dump_json())
        next_auth = time.monotonic() + 10
        while True:
            with contextlib.suppress(TimeoutError):
                await asyncio.wait_for(
                    ws.receive_text(), timeout=max(0.1, next_auth - time.monotonic())
                )
            if time.monotonic() >= next_auth:
                try:
                    await websocket_identity(ws)
                except HTTPException:
                    await ws.close(code=4401)
                    return
                next_auth = time.monotonic() + 10
    except WebSocketDisconnect:
        pass
    finally:
        hub.clients.discard(ws)
        with contextlib.suppress(RuntimeError):
            await ws.close()
