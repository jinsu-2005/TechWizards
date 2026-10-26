"""Bounded EV sessions and sandbox controls, separate from plant runtime state."""

from __future__ import annotations

import asyncio
import threading
import time
from typing import Annotated, Any, Literal
from uuid import UUID

from fastapi import APIRouter, Depends, Header, HTTPException, Request, Response
from pydantic import BaseModel, ConfigDict, Field

from app.api.security import RateLimiter, require_demo, require_key
from app.ev.pilot import EvPilot, tools
from app.ev.runtime import BY_ID, EvRuntime

router = APIRouter(prefix="/api/ev", tags=["EV investigation"])


class AttackBody(BaseModel):
    model_config = ConfigDict(extra="forbid")
    kind: Literal["bias", "freeze", "replay", "delay", "tamper", "failure"]
    target: str
    magnitude: float = Field(default=22, ge=-500, le=500, allow_inf_nan=False)
    duration: float = Field(default=20, ge=2, le=120, allow_inf_nan=False)


class ControlBody(BaseModel):
    action: Literal["pause", "resume", "reset", "stop", "speed", "reveal"]
    speed: float | None = Field(default=None, ge=0, le=120, allow_inf_nan=False)


class Turn(BaseModel):
    role: Literal["user", "assistant"]
    text: str = Field(max_length=4000)


class ChatBody(BaseModel):
    message: str = Field(min_length=1, max_length=2000)
    selected: str = "BMS"
    as_of: float | None = Field(default=None, ge=0, allow_inf_nan=False)
    history: list[Turn] = Field(default_factory=list, max_length=12)


class Sessions:
    def __init__(self) -> None:
        self.lock = threading.RLock()
        self.items: dict[str, tuple[float, str, EvRuntime]] = {}
        self.limiter = RateLimiter(12)
        self.pilot: EvPilot | None = None
        self.slots = asyncio.Semaphore(2)

    def get(self, key: str, owner: str) -> EvRuntime:
        now = time.monotonic()
        for expired in [k for k, v in self.items.items() if now - v[0] > 3600]:
            del self.items[expired]
        if key not in self.items:
            if len(self.items) >= 64:
                raise HTTPException(503, "EV session capacity reached; try again later")
            self.items[key] = (now, owner, EvRuntime())
        _, saved_owner, runtime = self.items[key]
        if saved_owner != owner:
            raise HTTPException(404, "EV session unavailable")
        self.items[key] = (now, owner, runtime)
        runtime.advance()
        return runtime


def sessions(request: Request) -> Sessions:
    return request.app.state.ev_sessions


def owner(request: Request) -> str:
    return getattr(request.state, "principal", {}).get("uid", "local-demo")


SessionHeader = Annotated[UUID, Header(alias="X-EV-Session")]


@router.get("/state")
def state(request: Request, response: Response, x_ev_session: SessionHeader) -> dict[str, Any]:
    pool = sessions(request)
    response.headers["Cache-Control"] = "no-store"
    with pool.lock:
        return pool.get(str(x_ev_session), owner(request)).snapshot()


@router.post("/attack", dependencies=[Depends(require_key), Depends(require_demo)])
def attack(body: AttackBody, request: Request, x_ev_session: SessionHeader) -> dict[str, Any]:
    if body.target not in BY_ID:
        raise HTTPException(422, "Unknown EV target")
    pool = sessions(request)
    with pool.lock:
        if pool.limiter.check(owner(request) + str(x_ev_session)) is not None:
            raise HTTPException(429, "EV attack limit reached; wait a minute")
        runtime = pool.get(str(x_ev_session), owner(request))
        if not runtime.running:
            raise HTTPException(409, "Resume the simulator before injecting")
        try:
            runtime.launch(body.kind, body.target, body.magnitude, body.duration)
        except ValueError as exc:
            raise HTTPException(409, str(exc)) from exc
        return runtime.snapshot()


@router.post("/control", dependencies=[Depends(require_key), Depends(require_demo)])
def control(body: ControlBody, request: Request, x_ev_session: SessionHeader) -> dict[str, Any]:
    pool = sessions(request)
    with pool.lock:
        runtime = pool.get(str(x_ev_session), owner(request))
        if body.action == "reset":
            runtime = EvRuntime()
            pool.items[str(x_ev_session)] = (time.monotonic(), owner(request), runtime)
        elif body.action in {"pause", "resume"}:
            runtime.running = body.action == "resume"
            runtime.last_wall = time.monotonic()
        elif body.action == "stop":
            runtime.stop()
        elif body.action == "speed":
            if body.speed is None:
                raise HTTPException(422, "Speed is required")
            runtime.speed = body.speed
        elif body.action == "reveal":
            if runtime.incident is None or runtime.last_truth is None:
                raise HTTPException(409, "Ground truth is available only after detection")
            runtime.truth_revealed = True
        return runtime.snapshot()


@router.post("/pilot/chat", dependencies=[Depends(require_key)])
async def chat(body: ChatBody, request: Request, x_ev_session: SessionHeader) -> dict[str, Any]:
    pool = sessions(request)
    with pool.lock:
        runtime = pool.get(str(x_ev_session), owner(request))
        if body.selected not in BY_ID:
            raise HTTPException(422, "Unknown EV component")
        if pool.limiter.check("pilot:" + owner(request) + str(x_ev_session)) is not None:
            raise HTTPException(429, "EV pilot rate limit reached")
        try:
            context = tools(runtime.snapshot(), body.selected, body.as_of)
        except ValueError as exc:
            raise HTTPException(409, str(exc)) from exc
        if pool.pilot is None:
            pool.pilot = EvPilot()
    if pool.slots.locked():
        raise HTTPException(429, "EV pilot busy; try again shortly")
    await pool.slots.acquire()
    task = asyncio.create_task(
        asyncio.to_thread(
            pool.pilot.chat, body.message, context, [t.model_dump() for t in body.history]
        )
    )

    def finished(done: asyncio.Task[dict[str, Any]]) -> None:
        pool.slots.release()
        if not done.cancelled():
            done.exception()

    task.add_done_callback(finished)
    try:
        return await asyncio.wait_for(asyncio.shield(task), timeout=28)
    except TimeoutError as exc:
        raise HTTPException(504, "EV model request timed out; retry the question") from exc
