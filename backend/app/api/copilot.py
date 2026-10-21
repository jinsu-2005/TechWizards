"""Incident-scoped requests; explicit incident IDs never fall back silently."""

import asyncio
from typing import Any

from fastapi import APIRouter, HTTPException, Request

from app.api.investigation import journal
from app.api.security import RateLimiter
from app.attribution import assess_layers, evidence_priority
from app.explain.copilot_engine import CopilotEngine, suggestions
from app.live.runtime import LiveRuntime
from app.runtime import active_runtime
from app.schemas import CopilotChatRequest, CopilotChatResponse

router = APIRouter(prefix="/api/copilot", tags=["copilot"])


async def bounded_chat(
    engine: CopilotEngine,
    message: str,
    context: dict[str, Any],
    slots: asyncio.Semaphore,
    timeout: float = 37,
) -> CopilotChatResponse:
    # A timeout or browser cancellation cannot terminate a running synchronous SDK call.
    # Keep its slot occupied until the underlying work actually finishes.
    await slots.acquire()
    task = asyncio.create_task(asyncio.to_thread(engine.chat, message, **context))

    def finished(done: asyncio.Task[CopilotChatResponse]) -> None:
        slots.release()
        if not done.cancelled():
            done.exception()  # Consume failures even when the requesting client has gone away.

    task.add_done_callback(finished)
    return await asyncio.wait_for(asyncio.shield(task), timeout=timeout)


def get_copilot_engine(request: Request) -> CopilotEngine:
    engine = getattr(request.app.state, "copilot", None)
    if engine is None:
        engine = CopilotEngine()
        request.app.state.copilot = engine
    return engine


@router.post("/chat", response_model=CopilotChatResponse)
async def post_chat(body: CopilotChatRequest, request: Request) -> CopilotChatResponse:
    state = request.app.state
    if getattr(state, "copilot_limiter", None) is None:
        state.copilot_limiter = RateLimiter(20)
        state.copilot_slots = asyncio.Semaphore(2)
    if (
        state.copilot_limiter.check(
            getattr(request.state, "principal", {}).get("uid")
            or (request.client.host if request.client else "unknown")
        )
        is not None
    ):
        raise HTTPException(429, "AI Pilot request limit reached; try again shortly")
    if state.copilot_slots.locked():
        raise HTTPException(429, "AI Pilot busy; try again shortly")
    store = journal(request)
    rt = active_runtime(request.app.state)
    latest = getattr(rt, "latest", None)
    if body.asset_id and body.asset_id not in {n.id for n in rt.topology().nodes}:
        raise HTTPException(404, "Selected asset unavailable in this source")
    incident = latest.incident if latest else None
    if body.incident_id:
        candidates = list(getattr(rt, "incidents", []))
        if incident:
            candidates.append(incident)
        incident = next((i for i in candidates if i.id == body.incident_id), None)
        if incident is None:
            incident = next(
                (i for i in store.incidents(state.mode) if i.id == body.incident_id), None
            )
            if incident is None:
                raise HTTPException(
                    status_code=404, detail="Requested incident unavailable in this mode"
                )
    records = []
    saved_capture = None
    if incident:
        detail = store.detail(incident.id, state.mode)
        if detail:
            saved_capture = detail["capture"]
            all_records = {e["id"]: e for e in [*detail["events"], *detail["context_events"]]}
            if body.as_of is not None:
                all_records = {
                    key: event
                    for key, event in all_records.items()
                    if event["observed_at"] <= body.as_of and event["received_at"] <= body.as_of
                }
            important = [e for e in all_records.values() if e["category"] != "process_observation"]
            readings = [
                e
                for e in all_records.values()
                if e["category"] == "process_observation"
                and (body.asset_id is None or e["asset_id"] == body.asset_id)
            ]
            important.sort(key=lambda e: (evidence_priority(e), e["seq"]), reverse=True)
            candidate_ids = {c.id for c in incident.origin}
            readings.sort(key=lambda e: (e["asset_id"] in candidate_ids, e["seq"]), reverse=True)
            by_asset: dict[str, dict[str, Any]] = {}
            for reading in readings:
                by_asset.setdefault(reading["asset_id"], reading)
            records = [*important[:8], *list(by_asset.values())[:4]]
            if (
                body.as_of is not None
                and saved_capture.get("status") == "captured"
                and saved_capture["payload"]["sample_time"] > body.as_of
            ):
                saved_capture = {"status": "not_available_at_selected_time"}
    historical = body.as_of is not None or bool(
        incident and not (latest and latest.incident and latest.incident.id == incident.id)
    )
    if historical:
        latest = None  # Historical advice cannot offer actions against the current stream.
    model_context = (
        rt.provenance() if isinstance(rt, LiveRuntime) and not historical and not incident else None
    )
    context: dict[str, Any] = dict(
        latest=latest,
        incident=incident,
        history=body.history,
        evidence=records,
        focus_asset=body.asset_id,
        historical=historical,
        model_context=model_context,
        incident_context=saved_capture,
        layer_hypotheses=assess_layers(records),
    )
    try:
        return await bounded_chat(
            get_copilot_engine(request), body.message, context, state.copilot_slots
        )
    except TimeoutError:
        return CopilotEngine(
            api_key="", unavailable_reason="The model request timed out"
        ).chat(body.message, **context)


@router.get("/suggestions")
def get_suggestions(request: Request) -> list[str]:
    latest = getattr(active_runtime(request.app.state), "latest", None)
    return suggestions(latest.incident if latest else None)
