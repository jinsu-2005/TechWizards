"""Local evidence and analyst workflow API; writes use the existing demo key policy."""

import json
from pathlib import Path
from typing import Any, Literal

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from fastapi.responses import PlainTextResponse
from pydantic import BaseModel, Field

from app.api.security import require_key
from app.incident_capture import runtime_context
from app.report.validation import model_fingerprints
from app.runtime import active_runtime
from app.soc import SocStore

router = APIRouter(prefix="/api", tags=["investigation"])


@router.get("/validation/robustness")
def robustness(request: Request) -> dict[str, Any]:
    path = request.app.state.reports_dir / "robustness.json"
    if not path.exists():
        raise HTTPException(404, "SIM stress evaluation has not been run")
    try:
        report = json.loads(path.read_text(encoding="utf-8"))
        if not isinstance(report, dict) or report.get("schema_version") != 1:
            raise ValueError("Unsupported report")
    except (OSError, ValueError) as exc:
        raise HTTPException(503, "SIM stress report unavailable or invalid") from exc
    try:
        report["model_matches_current"] = report.get("model_fingerprints") == model_fingerprints(
            request.app.state.settings.models_dir
        )
    except (OSError, ValueError, KeyError):
        report["model_matches_current"] = False
    return report


@router.get("/runbooks/local", response_class=PlainTextResponse)
def runbook() -> str:
    return (
        Path(__file__).resolve().parents[3] / "docs" / "LOCAL_INVESTIGATION_RUNBOOK.md"
    ).read_text(encoding="utf-8")


@router.get("/validation/baseline-comparison")
def baseline_comparison(request: Request) -> dict[str, Any]:
    path = request.app.state.reports_dir / "baseline_comparison.json"
    if not path.exists():
        raise HTTPException(404, "Baseline comparison has not been run")
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
        if not isinstance(data, dict) or not all(k in data.get("results", {}) for k in ("5", "20")):
            raise ValueError("Invalid report")
        return data
    except (OSError, ValueError) as exc:
        raise HTTPException(503, "Baseline comparison report is unavailable") from exc


@router.get("/asset-registers")
def asset_registers(request: Request) -> dict[str, Any]:
    from app.live.tagmap import TagMapError, load_tagmap

    try:
        live = getattr(request.app.state, "live", None)
        mapping = live.tagmap if live else load_tagmap(request.app.state.settings.live_tagmap)
        return {
            t.node_id: {
                "table": t.table,
                "address": t.address,
                "encoding": t.type,
                "unit": t.unit,
                "access": t.access,
            }
            for t in mapping.by_role("value")
        }
    except TagMapError:
        return {}


def journal(request: Request) -> SocStore:
    store: SocStore = request.app.state.soc
    rt = active_runtime(request.app.state)
    current = getattr(rt, "latest", None)
    if current and current.incident:
        context = runtime_context(rt) if store.needs_capture(current.incident.id) else None
        store.ingest(current, getattr(rt, "session_id", request.app.state.session_id), context)
    for inc in rt.incidents:
        store.save_incident(inc, getattr(rt, "session_id", request.app.state.session_id))
    return store


class WorkflowChange(BaseModel):
    acknowledged: bool | None = None
    severity: Literal["low", "medium", "high", "critical"] | None = None
    state: Literal["new", "investigating", "resolved"] | None = None
    note: str | None = Field(default=None, min_length=1, max_length=2000)


@router.get("/incident-workflows")
def workflows(request: Request) -> dict[str, Any]:
    store = journal(request)
    with store.lock:
        rows = store.db.execute(
            "SELECT id,workflow FROM soc_incidents WHERE mode=?", (request.app.state.mode,)
        ).fetchall()
    return {row["id"]: json.loads(row["workflow"]) for row in rows}


@router.get("/investigations/{incident_id}")
def detail(incident_id: str, request: Request) -> dict[str, Any]:
    result = journal(request).detail(incident_id, request.app.state.mode)
    if result is None:
        raise HTTPException(404, "Incident unavailable in this source")
    rt = active_runtime(request.app.state)
    current = getattr(rt, "latest", None)
    result["is_current"] = bool(current and current.incident and current.incident.id == incident_id)
    selected_assets = {c["id"] for c in result["incident"]["origin"]}
    related = []
    with request.app.state.soc.lock:
        rows = request.app.state.soc.db.execute(
            "SELECT payload FROM soc_incidents WHERE session=? AND mode=? AND id!=? LIMIT 500",
            (result["session_id"], request.app.state.mode, incident_id),
        ).fetchall()
    for row in rows:
        item = json.loads(row["payload"])
        overlap = selected_assets & {c["id"] for c in item["origin"]}
        if overlap and abs(item["detected_at"] - result["incident"]["detected_at"]) <= 300:
            related.append(
                {
                    "id": item["id"],
                    "reason": "Same source session, within 5 minutes, "
                    f"shared ranked candidates: {', '.join(sorted(overlap))}. "
                    "Heuristic association only.",
                }
            )
    result["related_incidents"] = related[:10]
    return result


@router.get("/investigations/{incident_id}/export")
def export(incident_id: str, request: Request) -> dict[str, Any]:
    return {
        "schema_version": 1,
        "source": request.app.state.mode,
        "investigation": detail(incident_id, request),
        "limits": "Bounded retained evidence, not a complete packet capture",
    }


@router.get("/investigations/{incident_id}/capture")
def capture(incident_id: str, request: Request) -> dict[str, Any]:
    store = journal(request)
    if store.detail(incident_id, request.app.state.mode) is None:
        raise HTTPException(404, "Incident unavailable in this source")
    return store.capture(incident_id, request.app.state.mode)


@router.get("/investigations/{incident_id}/progress")
def progress(incident_id: str, request: Request) -> list[dict[str, Any]]:
    store = journal(request)
    with store.lock:
        rows = store.db.execute(
            "SELECT id,seq,category,observed_at,received_at,payload FROM evidence "
            "WHERE incident_id=? AND mode=? AND category LIKE 'response_%' "
            "ORDER BY seq DESC LIMIT 30",
            (incident_id, request.app.state.mode),
        ).fetchall()
    return [{**dict(row), "payload": json.loads(row["payload"])} for row in rows]


@router.post("/investigations/{incident_id}/workflow", dependencies=[Depends(require_key)])
def workflow(incident_id: str, body: WorkflowChange, request: Request) -> dict[str, Any]:
    result = journal(request).update_workflow(
        incident_id,
        request.app.state.mode,
        body.model_dump(exclude_none=True),
        actor=getattr(request.state, "principal", {}).get(
            "uid", "Local analyst (not authenticated)"
        ),
    )
    if result is None:
        raise HTTPException(404, "Incident unavailable in this source")
    return result


@router.get("/evidence")
def evidence(
    request: Request,
    incident_id: str | None = None,
    asset_id: str | None = None,
    limit: int = Query(default=200, ge=1, le=500),
) -> list[dict[str, Any]]:
    return journal(request).events(request.app.state.mode, incident_id, asset_id, limit)


@router.get("/evidence/{event_id}")
def record(event_id: str, request: Request) -> dict[str, Any]:
    store = journal(request)
    with store.lock:
        row = store.db.execute(
            "SELECT * FROM evidence WHERE id=? AND mode=?", (event_id, request.app.state.mode)
        ).fetchone()
    if row is None:
        raise HTTPException(404, "Evidence unavailable in this source or expired")
    return {**dict(row), "payload": json.loads(row["payload"])}
