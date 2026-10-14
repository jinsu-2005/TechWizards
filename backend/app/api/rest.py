"""REST endpoints (§5.9). The engine lives on `app.state.engine`."""

import json
import time
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Request, Response
from fastapi.responses import JSONResponse

from app.api.security import limit_attacks, require_demo, require_key
from app.data.hai import hai_paths
from app.engine import Engine
from app.report import render_report
from app.runtime import active_runtime
from app.schemas import (
    AttackRequest,
    AttackResponse,
    Incident,
    IsolateRequest,
    IsolateResponse,
    ModeRequest,
    SourceInfo,
    Status,
    TagHealth,
    Topology,
)

router = APIRouter(prefix="/api")


def _engine(request: Request) -> Engine:
    engine: Engine = request.app.state.engine
    return engine


def _live_availability(state: Any) -> tuple[bool, str | None]:
    live = getattr(state, "live", None)
    if live is None:
        return False, getattr(state, "live_reason", None) or "LIVE is not configured"
    ok, reason = live.available()
    return bool(ok), reason


def _source(state: Any) -> SourceInfo:
    """Where the active mode gets its data and how healthy that link is."""
    if state.mode == "live" and getattr(state, "live", None) is not None:
        info: SourceInfo = state.live.source_info()
        return info
    if state.mode == "hai":
        return SourceInfo(mode="hai", connected=True, protocol="replay", state="connected")
    return SourceInfo(mode="sim", connected=True, protocol="internal", state="connected")


def _status(request: Request) -> Status:
    state = request.app.state
    rt = active_runtime(state)
    live_ok, live_reason = _live_availability(state)
    return Status(
        mode=state.mode,
        hai_available=bool(hai_paths(state.hai_dir)),
        detector_active=rt.detector_kind,
        uptime_s=rt.uptime_s,
        source=_source(state),
        live_available=live_ok,
        live_reason=live_reason,
    )


@router.get("/status")
def get_status(request: Request) -> Status:
    return _status(request)


@router.post("/mode", dependencies=[Depends(require_key)])
def set_mode(body: ModeRequest, request: Request) -> Status:
    state = request.app.state
    if body.mode == "hai":
        if not hai_paths(state.hai_dir):
            raise HTTPException(status_code=409, detail="HAI data not available")
        if state.hai is None:
            raise HTTPException(status_code=503, detail="HAI models not ready")
        if state.mode != "hai":
            state.hai.reset()  # every switch starts the replay from its beginning
    if body.mode == "live":
        ok, reason = _live_availability(state)
        if not ok:
            raise HTTPException(status_code=409, detail=f"LIVE unavailable: {reason}")
    state.mode = body.mode
    return _status(request)


@router.get("/topology")
def get_topology(request: Request) -> Topology:
    return active_runtime(request.app.state).topology()


@router.post(
    "/attack", dependencies=[Depends(require_key), Depends(require_demo), Depends(limit_attacks)]
)
async def post_attack(body: AttackRequest, request: Request) -> AttackResponse:
    if request.app.state.mode == "hai":
        raise HTTPException(status_code=409, detail="HAI attacks come from the dataset")
    try:
        if request.app.state.mode == "live":  # never the simulator's engine
            launcher = request.app.state.live_attacker
            attack_id = await launcher.launch(request.app.state.live, body)
            return AttackResponse(attack_id=attack_id)
        return AttackResponse(attack_id=_engine(request).launch(body))
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@router.post("/isolate", dependencies=[Depends(require_key)], response_model=IsolateResponse)
def post_isolate(body: IsolateRequest, request: Request) -> IsolateResponse | JSONResponse:
    if request.app.state.mode == "live":  # advisory only: AttackTrace never writes to the plant
        inc = next(
            (i for i in active_runtime(request.app.state).incidents if i.id == body.incident_id),
            None,
        )
        return JSONResponse(
            status_code=409,
            content={
                "detail": "live-read-only",
                "accepted": False,
                "reason": "live-read-only",
                "advice": inc.action if inc else "Isolate the node at the plant, not from here",
            },
        )
    if request.app.state.mode == "hai":
        raise HTTPException(
            status_code=409, detail="Isolation is not available in HAI mode: the data is a replay"
        )
    accepted, reason = _engine(request).isolate(body.incident_id, body.node_id)
    return IsolateResponse(accepted=accepted, reason=reason)


@router.post("/reset", dependencies=[Depends(require_key)])
def post_reset(request: Request) -> Status:
    active_runtime(request.app.state).reset()
    return _status(request)


@router.get("/live/health")
def get_live_health(request: Request) -> list[TagHealth]:
    live = getattr(request.app.state, "live", None)
    if live is None:
        reason = getattr(request.app.state, "live_reason", None) or "LIVE is not configured"
        raise HTTPException(status_code=404, detail=reason)
    health: list[TagHealth] = live.health()
    return health


@router.get("/incidents")
def get_incidents(request: Request) -> list[Incident]:
    return list(reversed(active_runtime(request.app.state).incidents))  # newest first


@router.get("/incidents/{incident_id}/report.pdf")
def get_incident_report(incident_id: str, request: Request) -> Response:
    rt = active_runtime(request.app.state)
    inc = next((i for i in rt.incidents if i.id == incident_id), None)
    if inc is None:
        raise HTTPException(status_code=404, detail="Incident not found")
    impact = getattr(rt, "incident_impact", {}).get(incident_id)
    pdf = render_report(inc, impact, rt.mode, time.time())
    return Response(
        pdf,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{incident_id}_report.pdf"'},
    )


@router.get("/metrics")
def get_metrics(request: Request) -> dict[str, Any]:
    reports_dir = request.app.state.reports_dir
    path = reports_dir / "metrics.json"
    if not path.exists():
        raise HTTPException(status_code=404, detail="metrics.json not found; run `make eval`")
    data: dict[str, Any] = json.loads(path.read_text())
    # Phase 13 Part F: merged in at response time, never written into metrics.json itself.
    live_path = reports_dir / "live_metrics.json"
    if live_path.exists():
        data["live"] = json.loads(live_path.read_text())
    return data
