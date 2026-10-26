"""REST endpoints (§5.9). The engine lives on `app.state.engine`."""

import json
import os
import time
from pathlib import Path
from typing import Any, cast

from fastapi import APIRouter, Depends, HTTPException, Request, Response
from fastapi.responses import JSONResponse
from pydantic import BaseModel, ConfigDict, Field

from app.api.security import limit_attacks, require_demo, require_key
from app.api.ws import SIM_SPEEDS, emit_period
from app.data.hai import hai_paths
from app.engine import Engine
from app.engine_hai import HaiEngine
from app.live.runtime import LiveRuntime
from app.report import render_report
from app.runtime import active_runtime
from app.schemas import (
    AttackRequest,
    AttackResponse,
    Incident,
    IsolateRequest,
    IsolateResponse,
    ModeRequest,
    SimSpeedRequest,
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


def _hai_disabled_reason() -> str | None:
    if os.environ.get("RENDER", "").lower() in {"true", "1"} or os.environ.get("AT_DISABLE_HAI", "").lower() in {"true", "1"}:
        return "Backend memory exceeded: HAI requires ≥1GB RAM (disabled on 512MB cloud instance). Run locally on desktop/laptop for full replay."
    return None


def _hai_availability(state: Any) -> tuple[bool, str | None]:
    disabled = _hai_disabled_reason()
    if disabled is not None:
        return False, disabled
    if getattr(state, "hai", None) is not None:
        return True, None
    hai_dir = getattr(state, "hai_dir", None)
    if hai_dir and hai_paths(hai_dir):
        return True, None
    seed_raw = os.environ.get("AT_HAI_SEED_DIR")
    if seed_raw and hai_paths(Path(seed_raw)):
        return True, None
    return False, "HAI dataset files not found"


def _sim_speed(state: Any) -> float:
    """Demo pacing in force right now. HAI and LIVE always report 1.0: only SIM is paced here."""
    return float(getattr(state, "sim_speed", 1.0)) if state.mode == "sim" else 1.0


def _status(request: Request) -> Status:
    state = request.app.state
    rt = active_runtime(state)
    live_ok, live_reason = _live_availability(state)
    hai_ok, hai_reason = _hai_availability(state)
    return Status(
        mode=state.mode,
        hai_available=hai_ok,
        hai_reason=hai_reason,
        detector_active=rt.detector_kind,
        uptime_s=rt.uptime_s,
        source=_source(state),
        live_available=live_ok,
        live_reason=live_reason,
        sim_speed=_sim_speed(state),
        sim_speed_options=list(SIM_SPEEDS),
        emit_period_s=emit_period(state, state.settings.ws_period_s),
    )


@router.get("/status")
def get_status(request: Request) -> Status:
    return _status(request)


@router.post("/mode", dependencies=[Depends(require_key)])
def set_mode(body: ModeRequest, request: Request) -> Status:
    state = request.app.state
    if body.mode == "hai":
        hai_ok, hai_reason = _hai_availability(state)
        if not hai_ok:
            raise HTTPException(status_code=409, detail=hai_reason or "HAI data not available")
        if state.hai is None:
            from app.main import build_hai_engine
            state.hai = build_hai_engine(state.settings)
        if state.hai is None:
            raise HTTPException(
                status_code=503,
                detail=hai_reason or "HAI models not ready",
            )
        if state.mode != "hai":
            state.hai.reset()  # every switch starts the replay from its beginning
    if body.mode == "live":
        ok, reason = _live_availability(state)
        if not ok:
            raise HTTPException(status_code=409, detail=f"LIVE unavailable: {reason}")
    state.mode = body.mode
    return _status(request)


@router.post("/sim/speed", dependencies=[Depends(require_key), Depends(require_demo)])
def set_sim_speed(body: SimSpeedRequest, request: Request) -> Status:
    """Fast demo pacing. The plant, the sample sequence and the detector are untouched; the
    same samples are simply delivered sooner, so an attack's real effect shows up in seconds
    instead of a minute. Refused outside SIM, where timing belongs to the source."""
    state = request.app.state
    if state.mode != "sim":
        raise HTTPException(status_code=409, detail="Demo pacing applies to SIM only")
    if body.speed not in SIM_SPEEDS:
        allowed = ", ".join(f"{s:g}x" for s in SIM_SPEEDS)
        raise HTTPException(status_code=422, detail=f"Unsupported demo speed; allowed: {allowed}")
    state.sim_speed = float(body.speed)
    return _status(request)


@router.get("/topology")
def get_topology(request: Request) -> Topology:
    return active_runtime(request.app.state).topology()


@router.post("/live/calibration/restart", dependencies=[Depends(require_key)])
def restart_live_calibration(request: Request) -> SourceInfo:
    live = cast(LiveRuntime | None, request.app.state.live)
    if live is None:
        raise HTTPException(status_code=404, detail="LIVE is not configured")
    try:
        live.restart_calibration()
    except ValueError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    return live.source_info()


@router.get("/live/model")
def live_model(request: Request) -> dict[str, Any]:
    live = cast(LiveRuntime | None, request.app.state.live)
    if live is None:
        raise HTTPException(404, "LIVE is not configured")
    return live.provenance()


class HaiPlaybackRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    speed: float | None = Field(default=None, ge=1, le=20, allow_inf_nan=False)
    paused: bool | None = None


@router.get("/hai/replay")
def get_hai_replay(request: Request) -> dict[str, object]:
    hai = cast(HaiEngine | None, request.app.state.hai)
    if hai is None:
        raise HTTPException(status_code=503, detail="HAI replay is not ready")
    return hai.replay_info()


@router.post("/hai/replay", dependencies=[Depends(require_key)])
def control_hai_replay(body: HaiPlaybackRequest, request: Request) -> dict[str, object]:
    if request.app.state.mode != "hai":
        raise HTTPException(status_code=409, detail="Select HAI mode before controlling playback")
    hai = cast(HaiEngine | None, request.app.state.hai)
    if hai is None:
        raise HTTPException(status_code=503, detail="HAI replay is not ready")
    if body.speed is not None:
        hai.speed = body.speed
    if body.paused is not None:
        hai.paused = body.paused
    return hai.replay_info()


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
    from app.api.investigation import journal

    store = journal(request)
    mode = request.app.state.mode
    saved = store.detail(body.incident_id, mode)

    def record(category: str, **payload: Any) -> None:
        if saved:
            store.event(
                mode,
                saved["session_id"],
                category,
                {"node_id": body.node_id, **payload},
                body.incident_id,
                body.node_id,
            )

    record(
        "response_requested",
        actor=getattr(request.state, "principal", {}).get(
            "uid", "Local analyst (not authenticated)"
        ),
        action="simulation isolation",
    )
    if request.app.state.mode == "live":  # advisory only: AttackTrace never writes to the plant
        record("response_rejected", reason="live-read-only")
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
        record("response_rejected", reason="dataset replay")
        raise HTTPException(
            status_code=409, detail="Isolation is not available in HAI mode: the data is a replay"
        )
    accepted, reason = _engine(request).isolate(body.incident_id, body.node_id)
    record("response_accepted" if accepted else "response_rejected", reason=reason)
    return IsolateResponse(accepted=accepted, reason=reason)


@router.post("/reset", dependencies=[Depends(require_key)])
def post_reset(request: Request) -> Status:
    from app.api.investigation import journal

    journal(request)
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
    from app.api.investigation import journal

    return journal(request).incidents(request.app.state.mode)


@router.get("/incidents/{incident_id}/report.pdf")
def get_incident_report(incident_id: str, request: Request) -> Response:
    rt = active_runtime(request.app.state)
    inc = next((i for i in rt.incidents if i.id == incident_id), None)
    if inc is None:
        from app.api.investigation import journal

        inc = next(
            (i for i in journal(request).incidents(request.app.state.mode) if i.id == incident_id),
            None,
        )
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
