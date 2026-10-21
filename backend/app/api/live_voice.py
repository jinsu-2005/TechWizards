"""Authenticated, read-only bridge between browser PCM audio and Gemini Live."""

import asyncio
import contextlib
import hashlib
import hmac
import json
import logging
import os
import time
from typing import Any

from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect
from google import genai
from google.genai import types

from app.api.authentication import names, websocket_identity
from app.runtime import active_runtime

router = APIRouter()
log = logging.getLogger("attacktrace.live_voice")
MODEL = "gemini-3.8-live"
MAX_SESSION_S = 300
MAX_AUDIO_BYTES = 10 * 1024 * 1024
MAX_CHUNK_BYTES = 16 * 1024
VOICES = {"Kore", "Puck"}


def process_snapshot(state: Any) -> dict[str, Any]:
    """Only reported process evidence; never include SIM ground truth or secrets."""
    runtime = active_runtime(state)
    latest = getattr(runtime, "latest", None)
    incident = latest.incident if latest else None
    return {
        "source": state.mode,
        "sample_time": latest.t if latest else None,
        "readings": [
            {"asset": n.id, "value": n.value, "status": n.status, "quality": n.quality}
            for n in latest.nodes[:32]
        ] if latest else [],
        "incident": {
            "id": incident.id,
            "status": incident.status,
            "ambiguous": incident.ambiguous,
            "leading_candidates": [
                {"asset": candidate.id, "type": candidate.type,
                 "ranking_confidence": round(candidate.confidence, 3)}
                for candidate in incident.origin[:3]
            ],
            "inferred_path": [step.id for step in incident.path[:12]],
        } if incident else None,
        "limits": [
            "Process anomalies do not confirm cyberattack origin.",
            "Ranked origins and paths require independent corroboration.",
            "Voice chat has no write or control tools.",
        ],
    }


def session_config(voice: str) -> dict[str, Any]:
    return {
        "response_modalities": ["AUDIO"],
        "input_audio_transcription": {},
        "output_audio_transcription": {},
        "speech_config": {
            "voice_config": {"prebuilt_voice_config": {"voice_name": voice}},
        },
        "system_instruction": (
            "You are AttackTrace's concise voice investigation assistant. Speak in one or two "
            "short sentences unless asked for detail. Before any answer about current readings, "
            "incidents, or origins, call read_attacktrace_status and use its latest result. "
            "A ranked candidate is a hypothesis, not proof of compromise. Mention uncertainty. "
            "SIM is simulation, HAI is recorded replay, LIVE is Modbus monitoring. "
            "You cannot execute attacks, isolation, source switching, or any operational action. "
            "If asked to do one, explain that an operator must use the on-screen controls. "
            "Do not claim to have performed an action."
        ),
        "tools": [{"function_declarations": [{
            "name": "read_attacktrace_status",
            "description": (
                "Read the latest reported process readings and incident hypotheses. No writes."
            ),
        }]}],
    }


async def _authenticate(ws: WebSocket, hello: dict[str, Any]) -> str:
    settings = ws.app.state.settings
    if ws.headers.get("origin") not in settings.cors_origins:
        raise HTTPException(403, "Untrusted origin")
    if settings.auth_enabled:
        await websocket_identity(ws)
        session_name, _ = names(settings)
        cookie = ws.cookies.get(session_name, "")
        return "private:" + hashlib.sha256(cookie.encode()).hexdigest()
    key = settings.api_key
    supplied = str(hello.get("api_key", ""))
    if key:
        if not hmac.compare_digest(supplied.encode(), key.encode()):
            raise HTTPException(401, "API key required")
    elif settings.host not in {"localhost", "127.0.0.1", "::1"} or not settings.demo_mode:
        raise HTTPException(503, "Local voice access is unavailable")
    return "local:" + (ws.client.host if ws.client else "unknown")


@router.websocket("/ws/voice")
async def live_voice(ws: WebSocket) -> None:
    """Browser sends PCM16 mono 16 kHz chunks; receives PCM16 mono 24 kHz chunks."""
    await ws.accept()
    try:
        hello = json.loads(await asyncio.wait_for(ws.receive_text(), timeout=5))
        if not isinstance(hello, dict) or hello.get("type") != "start":
            raise HTTPException(400, "Voice session start required")
        identity = await _authenticate(ws, hello)
        voice = str(hello.get("voice", "Kore"))
        if voice not in VOICES:
            raise HTTPException(422, "Unsupported voice")
        if not os.environ.get("GEMINI_API_KEY"):
            raise HTTPException(503, "Gemini Live is not configured")
        state = ws.app.state
        if state.live_voice_limiter.check(identity) is not None:
            raise HTTPException(429, "Too many live voice sessions")
        try:
            await asyncio.wait_for(state.live_voice_slots.acquire(), timeout=0.1)
        except TimeoutError as exc:
            raise HTTPException(429, "Live voice is busy") from exc
        try:
            with genai.Client(api_key=os.environ["GEMINI_API_KEY"]) as client:
                async with client.aio.live.connect(
                    model=MODEL, config=session_config(voice)
                ) as session:
                    await ws.send_json({
                        "type": "ready", "model": MODEL, "max_seconds": MAX_SESSION_S,
                    })
                    deadline = time.monotonic() + MAX_SESSION_S

                    async def browser_to_gemini() -> str | None:
                        total = 0
                        next_auth = time.monotonic() + 10
                        while time.monotonic() < deadline:
                            try:
                                packet = await asyncio.wait_for(ws.receive(), timeout=10)
                            except TimeoutError:
                                packet = None
                            if packet and packet["type"] == "websocket.disconnect":
                                return
                            if packet and packet.get("bytes") is not None:
                                audio = packet["bytes"]
                                total += len(audio)
                                if (
                                    not audio or len(audio) > MAX_CHUNK_BYTES
                                    or total > MAX_AUDIO_BYTES
                                ):
                                    raise HTTPException(413, "Voice audio limit reached")
                                await session.send_realtime_input(
                                    audio=types.Blob(data=audio, mime_type="audio/pcm;rate=16000")
                                )
                            elif packet and packet.get("text"):
                                command = json.loads(packet["text"])
                                if command.get("type") == "audio_end":
                                    await session.send_realtime_input(audio_stream_end=True)
                                elif command.get("type") == "stop":
                                    return
                            if time.monotonic() >= next_auth:
                                if state.settings.auth_enabled:
                                    await websocket_identity(ws)
                                next_auth = time.monotonic() + 10
                        return "time_limit"

                    async def gemini_to_browser() -> None:
                        while time.monotonic() < deadline:
                            async for response in session.receive():
                                if response.tool_call:
                                    replies = [types.FunctionResponse(
                                        name=call.name,
                                        id=call.id,
                                        response=(process_snapshot(state)
                                                  if call.name == "read_attacktrace_status"
                                                  else {"error": "Tool unavailable"}),
                                    ) for call in response.tool_call.function_calls]
                                    await session.send_tool_response(function_responses=replies)
                                content = response.server_content
                                if not content:
                                    continue
                                if content.interrupted:
                                    await ws.send_json({"type": "interrupted"})
                                if content.input_transcription and content.input_transcription.text:
                                    await ws.send_json({
                                        "type": "transcript", "speaker": "user",
                                        "text": content.input_transcription.text[:2000],
                                    })
                                if (
                                    content.output_transcription
                                    and content.output_transcription.text
                                ):
                                    await ws.send_json({
                                        "type": "transcript", "speaker": "assistant",
                                        "text": content.output_transcription.text[:2000],
                                    })
                                if content.model_turn:
                                    for part in content.model_turn.parts:
                                        if part.inline_data and part.inline_data.data:
                                            await ws.send_bytes(part.inline_data.data)
                                if content.turn_complete:
                                    await ws.send_json({"type": "turn_complete"})

                    sender = asyncio.create_task(browser_to_gemini())
                    receiver = asyncio.create_task(gemini_to_browser())
                    try:
                        done, pending = await asyncio.wait(
                            {sender, receiver}, timeout=MAX_SESSION_S,
                            return_when=asyncio.FIRST_COMPLETED,
                        )
                        reasons = [task.result() for task in done]
                        if not done or "time_limit" in reasons:
                            await ws.send_json({"type": "session_end", "reason": "time_limit"})
                        for task in pending:
                            task.cancel()
                        await asyncio.gather(*pending, return_exceptions=True)
                    finally:
                        for task in (sender, receiver):
                            if not task.done():
                                task.cancel()
                        await asyncio.gather(sender, receiver, return_exceptions=True)
        finally:
            state.live_voice_slots.release()
    except WebSocketDisconnect:
        pass
    except HTTPException as exc:
        with contextlib.suppress(RuntimeError, WebSocketDisconnect):
            await ws.send_json({"type": "error", "message": str(exc.detail)})
    except Exception:
        log.exception("Gemini Live session failed")
        with contextlib.suppress(RuntimeError, WebSocketDisconnect):
            await ws.send_json({"type": "error", "message": "Live voice session unavailable"})
    finally:
        with contextlib.suppress(RuntimeError, WebSocketDisconnect):
            await ws.close()
