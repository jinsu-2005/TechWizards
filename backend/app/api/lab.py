"""Explicit local-emulator experiments, separate from read-only monitoring."""

import asyncio
import hashlib
import json
from collections.abc import AsyncIterator
from pathlib import Path
from typing import Any, Literal, cast

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field

from app.api.security import limit_attacks, require_demo, require_key
from app.live.lab_proxy import LabProxy
from app.live.modbus import ModbusPoller, ReadOnlyModbus
from app.live.tagmap import load_tagmap

router = APIRouter(prefix="/api/lab", tags=["local emulator lab"])
MANIFEST = Path(__file__).resolve().parents[3] / "data" / "emulator_manifest.json"


async def exclusive(request: Request) -> AsyncIterator[None]:
    state = request.app.state
    if getattr(state, "lab_lock", None) is None:
        state.lab_lock = asyncio.Lock()
    async with state.lab_lock:
        yield


async def observe_integrity(state: Any, interval: float = 1) -> None:
    previous: dict[str, Any] | None = None
    while True:
        live = state.live
        if live and (
            live.cfg.host not in {"127.0.0.1", "localhost", "::1"}
            or live.cfg.port not in {5020, 5021}
        ):
            await asyncio.sleep(interval)
            continue
        try:
            info = await emulator_info()
            if previous is None or previous["instance_id"] != info["instance_id"]:
                state.soc.event(
                    "live",
                    getattr(state.live, "session_id", state.session_id),
                    "integrity_baseline",
                    {**info, "classification": "observation"},
                    asset_id="PLC1",
                )
            elif previous["observed_hash"] != info["observed_hash"]:
                approval = getattr(state, "lab_approvals", {}).get(
                    (info["instance_id"], info["observed_hash"])
                )
                current = getattr(state.live, "latest", None)
                inc_id = (
                    current.incident.id
                    if current and current.incident and state.mode == "live"
                    else None
                )
                state.soc.event(
                    "live",
                    getattr(state.live, "session_id", state.session_id),
                    "integrity_change",
                    {
                        "before_hash": previous["observed_hash"],
                        "after_hash": info["observed_hash"],
                        "emulator_instance": info["instance_id"],
                        "config": info["config"],
                        "applied_verified": True,
                        "approved": approval is True,
                        "approval_status": "approved"
                        if approval is True
                        else "unapproved_test"
                        if approval is False
                        else "not_recorded",
                        "classification": "observation",
                        "action": "observed_manifest_change",
                        "scope": "Passive emulator configuration observation; "
                        "not real firmware attestation",
                    },
                    inc_id,
                    "PLC1",
                )
            if info.get("error") and (previous is None or info["error"] != previous.get("error")):
                state.soc.event(
                    "live",
                    getattr(state.live, "session_id", state.session_id),
                    "integrity_quality",
                    {"error": info["error"], "classification": "observation"},
                    asset_id="PLC1",
                )
            previous = info
        except HTTPException:
            pass  # Keep the last valid hash across outages; do not invent a new baseline.
        await asyncio.sleep(interval)


def proxy(request: Request) -> LabProxy:
    existing = getattr(request.app.state, "lab_proxy", None)
    if existing is None:
        state = request.app.state

        def sink(asset: str, payload: dict[str, Any]) -> None:
            current = getattr(state.live, "latest", None)
            inc_id = (
                current.incident.id
                if current and current.incident and state.mode == "live"
                else None
            )
            state.soc.event(
                "live",
                getattr(state.live, "session_id", state.session_id),
                "channel_observation",
                payload,
                inc_id,
                asset,
            )

        existing = LabProxy(load_tagmap(state.settings.live_tagmap), sink)
        state.lab_proxy = existing
    return existing


async def emulator_info() -> dict[str, Any]:
    writer = None
    try:
        reader, writer = await asyncio.wait_for(asyncio.open_connection("127.0.0.1", 8081), 1)
        writer.write(b"GET /integrity HTTP/1.1\r\nHost: localhost\r\nConnection: close\r\n\r\n")
        await writer.drain()
        raw = await asyncio.wait_for(reader.read(65536), 2)
        # A complete response is bounded by the local emulator's small JSON payload.
        while b"\r\n\r\n" not in raw:
            more = await asyncio.wait_for(reader.read(65536), 2)
            if not more:
                break
            raw += more
        headers, body = raw.split(b"\r\n\r\n", 1)
        length = next(
            int(line.split(b":", 1)[1])
            for line in headers.split(b"\r\n")
            if line.lower().startswith(b"content-length:")
        )
        if length > 32768:
            raise ValueError("Oversized emulator response")
        if len(body) < length:
            body += await asyncio.wait_for(reader.readexactly(length - len(body)), 2)
        info = json.loads(body)
        if info.get("emulator") != "AttackTrace-local" or not info.get("enabled"):
            raise ValueError("Restart the local emulator with manifest support")
        return cast(dict[str, Any], info)
    except (OSError, TimeoutError, ValueError, StopIteration, asyncio.IncompleteReadError) as exc:
        raise HTTPException(
            409,
            "Local integrity source unavailable. Restart the updated local emulator (port 8081).",
        ) from exc
    finally:
        if writer:
            writer.close()


class ProxyChange(BaseModel):
    enabled: bool = True
    asset_id: Literal["LIT101", "LIT301", "FIT201", "PIT301"] = "LIT101"
    offset: float = Field(default=0, ge=-40, le=40, allow_inf_nan=False)
    delay_ms: int = Field(default=0, ge=0, le=1500)
    drop: bool = False


@router.get("")
async def status(request: Request) -> dict[str, Any]:
    p = proxy(request)
    try:
        integrity = await emulator_info()
    except HTTPException as exc:
        integrity = {"available": False, "reason": exc.detail}
    return {
        "enabled": p.server is not None,
        "asset_id": p.asset,
        "offset": p.offset,
        "delay_ms": p.delay_ms,
        "drop": p.drop,
        "latest": p.latest,
        "listen": "127.0.0.1:5021",
        "upstream": "127.0.0.1:5020",
        "routed": bool(request.app.state.live and request.app.state.live.source.cfg.port == 5021),
        "integrity": integrity,
    }


@router.post(
    "/proxy",
    dependencies=[
        Depends(require_key),
        Depends(require_demo),
        Depends(limit_attacks),
        Depends(exclusive),
    ],
)
async def configure(body: ProxyChange, request: Request) -> dict[str, Any]:
    p = proxy(request)
    live = request.app.state.live
    if live and (
        live.cfg.host not in {"127.0.0.1", "localhost", "::1"} or live.cfg.port not in {5020, 5021}
    ):
        raise HTTPException(
            409,
            "Lab routing requires the default loopback emulator; external sources are not changed",
        )
    # Verify this is the updated emulator before routing a controlled experiment.
    if body.enabled:
        await emulator_info()
    p.asset, p.offset, p.delay_ms, p.drop = body.asset_id, body.offset, body.delay_ms, body.drop
    if body.enabled:
        try:
            await p.start()
        except OSError as exc:
            raise HTTPException(409, "Local proxy port 5021 is already in use") from exc
    if live:
        await live.source.stop()
        cfg = live.cfg.model_copy(update={"port": 5021 if body.enabled else 5020})
        live.cfg = live.source.cfg = cfg
        live.source.poller = ModbusPoller(cfg, live.tagmap, live.source._on_sample)
        await live.source.start()
    if not body.enabled:
        await p.stop()
    request.app.state.soc.event(
        "live", request.app.state.session_id, "lab_configuration", body.model_dump()
    )
    return await status(request)


@router.post(
    "/probe",
    dependencies=[
        Depends(require_key),
        Depends(require_demo),
        Depends(limit_attacks),
        Depends(exclusive),
    ],
)
async def probe(request: Request) -> dict[str, Any]:
    p = proxy(request)
    if p.server is None:
        raise HTTPException(409, "Start the local proxy first")
    client = ReadOnlyModbus("127.0.0.1", 5021, 2, p.tagmap.device_id)
    try:
        if not await client.connect():
            raise HTTPException(409, "Local proxy unavailable")
        await client.read_input_registers(0, 24)
    except Exception as exc:
        if isinstance(exc, HTTPException):
            raise
        raise HTTPException(409, "Probe timed out or was dropped; inspect paired evidence") from exc
    finally:
        await client.close()
    return await status(request)


class ManifestChange(BaseModel):
    action: Literal["approved_update", "unapproved_change", "restore"]
    delta: float = Field(default=10, ge=-40, le=40, allow_inf_nan=False)


@router.post(
    "/integrity",
    dependencies=[
        Depends(require_key),
        Depends(require_demo),
        Depends(limit_attacks),
        Depends(exclusive),
    ],
)
async def integrity(body: ManifestChange, request: Request) -> dict[str, Any]:
    before = await emulator_info()
    expected_path = str(MANIFEST.resolve())
    if before.get("manifest_path") != expected_path:
        raise HTTPException(409, "Emulator manifest path differs from this local workspace")
    config = {
        "version": 1,
        "PLC1_setpoint_delta": 0 if body.action == "restore" else body.delta,
        "PLC2_setpoint_delta": 0,
    }
    config_hash = hashlib.sha256(
        json.dumps(config, sort_keys=True, separators=(",", ":")).encode()
    ).hexdigest()
    if getattr(request.app.state, "lab_approvals", None) is None:
        request.app.state.lab_approvals = {}
    request.app.state.lab_approvals[(before["instance_id"], config_hash)] = (
        body.action != "unapproved_change"
    )
    temporary = MANIFEST.with_suffix(".tmp")
    temporary.write_text(json.dumps(config, sort_keys=True), encoding="utf-8")
    temporary.replace(MANIFEST)
    # Wait for the emulator to observe the file; do not equate file write with application.
    observed = before
    for _ in range(10):
        await asyncio.sleep(0.1)
        observed = await emulator_info()
        if observed.get("config") == config:
            break
    verified = observed.get("config") == config
    payload = {
        "action": body.action,
        "before_hash": before.get("observed_hash"),
        "after_hash": observed.get("observed_hash"),
        "emulator_instance": observed.get("instance_id"),
        "config": config,
        "applied_verified": verified,
        "approved": body.action != "unapproved_change",
        "classification": "observation",
        "hypothesis": "approved maintenance"
        if body.action != "unapproved_change"
        else "unapproved emulated controller configuration change",
        "scope": "Emulated configuration manifest; not real firmware attestation",
    }
    current = getattr(request.app.state.live, "latest", None)
    inc_id = (
        current.incident.id
        if current and current.incident and request.app.state.mode == "live"
        else None
    )
    event_id = request.app.state.soc.event(
        "live",
        getattr(request.app.state.live, "session_id", request.app.state.session_id),
        "integrity_change",
        payload,
        inc_id,
        "PLC1",
    )
    return {"event_id": event_id, **payload}
