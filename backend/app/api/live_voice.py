"""Authenticated, read-only bridge between browser PCM audio and Gemini Live."""

import asyncio
import contextlib
import hashlib
import hmac
import json
import logging
import time
from typing import Any
from urllib.parse import urlparse

from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect
from google import genai
from google.genai import types

from app.ai.language import (
    UNSUPPORTED_LANGUAGE_MESSAGE,
    classify_language,
    is_self_echo,
    sanitize_response_text,
)
from app.ai.models import classify_failure
from app.ai.models import router as model_router
from app.ai.secrets import gemini_key
from app.api.authentication import names, websocket_identity
from app.runtime import active_runtime

router = APIRouter()
log = logging.getLogger("attacktrace.live_voice")
MAX_SESSION_S = 300
MAX_AUDIO_BYTES = 10 * 1024 * 1024
MAX_CHUNK_BYTES = 16 * 1024
VOICES = {"Kore", "Puck"}
LIVE_SYSTEM_PROMPT = (
    "You are AttackTrace AI Pilot, a concise voice investigator. Speak one or two short "
    "sentences unless asked for detail. Before claiming current readings, incidents, or origins, "
    "call read_attacktrace_status. A candidate is a hypothesis and a process path is inferred; "
    "mention uncertainty. SIM is simulation, HAI is replay, and LIVE is Modbus monitoring. "
    "You have read-only tools. Never claim to execute an attack, isolation, source change, "
    "or other operational action; direct the operator to the authorized on-screen workflow.\n\n"
    "STRICT LANGUAGE POLICY:\n"
    "1. Supported Languages: You ONLY accept English, Tamil, and Tanglish (Tamil code-switched with English). "
    "Never accept or answer any other language.\n"
    "2. Unsupported Languages (Hindi, Malayalam, Telugu, Kannada, etc.): If the user speaks ANY unsupported language, "
    "do NOT answer their question or translate their speech. Respond ONLY with: "
    "\"Please speak in English or Tamil.\"\n"
    "3. When the user speaks English: Respond exclusively in clear English. Do not switch to Tamil.\n"
    "4. When the user speaks Tamil: Respond in natural Tanglish (Tamil mixed with English technical terms like "
    "sensor, valve, incident, anomaly, status) or English. Preserve technical accuracy.\n"
    "5. When the user speaks Tanglish: Respond naturally in Tanglish or English, matching their context.\n"
    "6. Strict Restriction: NEVER generate AI responses in Hindi, Malayalam, Telugu, Kannada, or any other unsupported language.\n"
    "7. Consistency: Maintain consistent language across turns. If language is ambiguous, default to English."
)


EV_SYSTEM_PROMPT = (
    "You are AttackTrace EV AI Pilot, a voice investigator for a simulated electric vehicle. "
    "Be brief: answer in one sentence, two at most, under 30 words. Lead with the answer; no "
    "preamble, lists, or repeating the question. Give detail only when asked. Before stating "
    "readings, incidents or origins, call read_ev_status and quote one number with its unit. "
    "Ranked origins are hypotheses, not confirmed causes; say so in a few words. Physical "
    "anomalies do not prove an attacker. This is a sandbox: never claim to control hardware. "
    "Water plant data is out of scope.\n\n"
    "STRICT LANGUAGE POLICY:"
    + LIVE_SYSTEM_PROMPT.split("STRICT LANGUAGE POLICY:", 1)[1]
)


def ev_status(state: Any, session_key: str, selected: str) -> dict[str, Any]:
    """Server-built EV evidence. Never includes injection ground truth."""
    from uuid import UUID

    from app.ev.pilot import tools
    from app.ev.runtime import BY_ID

    pool = state.ev_sessions
    try:
        key = str(UUID(session_key))
    except ValueError:
        return {"error": "EV session unavailable"}
    with pool.lock:
        entry = pool.items.get(key)
        if entry is None or entry[1] != "local-demo":
            return {"error": "EV session unavailable"}
        runtime = pool.get(key, "local-demo")
        return tools(runtime.snapshot(), selected if selected in BY_ID else "BMS", None)


def ev_opening(status: dict[str, Any], history: list[dict[str, str]] | None) -> str:
    lead = None
    if "get_ev_localization" in status:
        candidates = status["get_ev_localization"].get("candidates") or []
        lead = candidates[0]["id"] if candidates else None
    state_text = (
        f"A persistent anomaly is detected; the leading hypothesis is {lead}, not confirmed."
        if lead
        else "No persistent anomaly is detected."
    )
    prefix = "AI Pilot is back." if history else "AI Pilot here."
    return (
        "Start this user-requested voice conversation now. Speak exactly one short greeting: "
        f"'{prefix} {state_text} What should we investigate?' "
        "Do not claim any other live facts without the read_ev_status tool."
    )


def ev_alert(status: dict[str, Any]) -> str | None:
    """Server-built spoken alert for a new detection; the browser only signals a change."""
    candidates = (status.get("get_ev_localization") or {}).get("candidates") or []
    if not candidates:
        return None
    lead = candidates[0]
    readings = (status.get("get_ev_telemetry") or {}).get("readings") or []
    r = next((x for x in readings if x.get("id") == lead["id"]), None)
    reading = (
        f", reading {r['value']:.0f} {r['unit']} against {r['expected']:.0f} expected" if r else ""
    )
    return (
        "A new anomaly was just detected. These facts are current, so do not call any tool. "
        "Announce it now in one short sentence: anomaly detected, leading hypothesis "
        f"{lead['id']}{reading}, not confirmed. Then ask if they want to trace it."
    )


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
        ]
        if latest
        else [],
        "incident": {
            "id": incident.id,
            "status": incident.status,
            "ambiguous": incident.ambiguous,
            "leading_candidates": [
                {
                    "asset": candidate.id,
                    "type": candidate.type,
                    "ranking_confidence": round(candidate.confidence, 3),
                }
                for candidate in incident.origin[:3]
            ],
            "inferred_path": [step.id for step in incident.path[:12]],
        }
        if incident
        else None,
        "limits": [
            "Process anomalies do not confirm cyberattack origin.",
            "Ranked origins and paths require independent corroboration.",
            "Voice chat has no write or control tools.",
        ],
    }


def session_config(voice: str, model: str = "gemini-3.8-live", ev: bool = False) -> dict[str, Any]:
    config: dict[str, Any] = {
        "response_modalities": ["AUDIO"],
        "input_audio_transcription": {"language_codes": ["en", "ta"]},
        "output_audio_transcription": {},
        "speech_config": {
            "voice_config": {"prebuilt_voice_config": {"voice_name": voice}},
        },
        "system_instruction": EV_SYSTEM_PROMPT if ev else LIVE_SYSTEM_PROMPT,
        "tools": [
            {
                "function_declarations": [
                    {
                        "name": "read_ev_status" if ev else "read_attacktrace_status",
                        "description": (
                            "Read EV telemetry, the selected component and ranked origins. "
                            "No writes."
                            if ev
                            else "Read reported process readings and incident hypotheses. "
                            "No writes."
                        ),
                    }
                ]
            }
        ],
    }
    if ev:
        # Snappier turn-taking: end the user's turn after a short pause.
        config["realtime_input_config"] = {
            "automatic_activity_detection": {
                "end_of_speech_sensitivity": "END_SENSITIVITY_HIGH",
                "silence_duration_ms": 500,
                "prefix_padding_ms": 100,
            }
        }
    if model == "gemini-3.8-live-extended-thinking":
        config["thinking_config"] = {"thinking_level": "HIGH"}
    return config


async def connect_model(client: genai.Client, voice: str, ev: bool = False) -> tuple[Any, Any, str]:
    """Connect once per compatible candidate; never swap an active session silently."""
    candidates = model_router.candidates("live")
    if not candidates:
        raise HTTPException(503, "Live models are cooling down; try later")
    for model in candidates:
        manager = client.aio.live.connect(model=model, config=session_config(voice, model, ev))
        try:
            session = await manager.__aenter__()
        except Exception as exc:
            failure = classify_failure(exc)
            model_router.failed("live", model, failure)
            log.warning("Gemini Live model %s failed (%s)", model, failure.category)
            if not failure.retryable:
                raise HTTPException(502, f"Gemini Live unavailable ({failure.category})") from exc
            continue
        model_router.succeeded("live", model)
        return manager, session, model
    raise HTTPException(503, "All configured Live models are unavailable")


def opening_prompt(state: Any, history: list[dict[str, str]] | None = None) -> str:
    """A user-started session receives one short, evidence-bounded spoken opening."""
    snapshot = process_snapshot(state)
    source = {"sim": "simulation", "hai": "HAI replay", "live": "Modbus monitoring"}.get(
        snapshot["source"], "unknown source"
    )
    incident = snapshot["incident"]
    if snapshot["sample_time"] is None:
        status = "No current reading is available yet."
    elif incident:
        status = (
            f"An incident is recorded with status {incident['status']}; "
            "its origin is not confirmed."
        )
    else:
        status = "No active incident is reported."
    if history:
        greeting = (
            f"AI Pilot is back. I am watching {source}. {status} "
            "What would you like to investigate next?"
        )
    else:
        greeting = (
            f"AI Pilot here. I am watching {source}. {status} What would you like to investigate?"
        )
    return (
        "Start this user-requested voice conversation now. Speak exactly one short greeting: "
        f"'{greeting}' Do not claim any other live facts without the read_attacktrace_status tool."
    )


LOOPBACK = {"localhost", "127.0.0.1", "::1"}


def trusted_origin(origin: str | None, settings: Any) -> bool:
    """Configured origins, plus any loopback dev port when the demo itself is loopback-only."""
    if origin in settings.cors_origins:
        return True
    if not origin or settings.auth_enabled or settings.host not in LOOPBACK:
        return False
    return urlparse(origin).hostname in LOOPBACK


async def _authenticate(ws: WebSocket, hello: dict[str, Any]) -> str:
    settings = ws.app.state.settings
    if not trusted_origin(ws.headers.get("origin"), settings):
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
    elif settings.host not in LOOPBACK or not settings.demo_mode:
        raise HTTPException(503, "Local voice access is unavailable")
    return "local:" + (ws.client.host if ws.client else "unknown")


def state_auth_enabled(ws: WebSocket) -> bool:
    return bool(ws.app.state.settings.auth_enabled)


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
        ev_mode = hello.get("mode") == "ev"
        ev_key = str(hello.get("ev_session", ""))
        ev_selected = str(hello.get("selected", "BMS"))
        if ev_mode and state_auth_enabled(ws):
            raise HTTPException(503, "EV voice is available in demo mode only")
        key = gemini_key()
        if not key:
            raise HTTPException(503, "Gemini Live is not configured")
        state = ws.app.state
        if state.live_voice_limiter.check(identity) is not None:
            raise HTTPException(429, "Too many live voice sessions")
        try:
            await asyncio.wait_for(state.live_voice_slots.acquire(), timeout=0.1)
        except TimeoutError as exc:
            raise HTTPException(429, "Live voice is busy") from exc
        try:
            with genai.Client(api_key=key) as client:
                manager, session, model = await connect_model(client, voice, ev_mode)
                try:
                    await ws.send_json(
                        {
                            "type": "ready",
                            "model": model,
                            "max_seconds": MAX_SESSION_S,
                        }
                    )
                    raw_history = hello.get("history", [])
                    history = (
                        [
                            {
                                "speaker": str(item.get("speaker", ""))[:12],
                                "text": str(item.get("text", ""))[:300],
                            }
                            for item in raw_history[-8:]
                            if isinstance(item, dict)
                            and item.get("speaker") in {"user", "assistant"}
                        ]
                        if isinstance(raw_history, list)
                        else []
                    )
                    if history:
                        # Prior transcript is untrusted conversation data, never instructions.
                        await session.send(
                            input="Previous conversation transcript for continuity only: "
                            + json.dumps(history, ensure_ascii=False),
                            end_of_turn=False,
                        )
                    opening = (
                        ev_opening(ev_status(state, ev_key, ev_selected), history)
                        if ev_mode
                        else opening_prompt(state, history)
                    )
                    await session.send(input=opening, end_of_turn=True)
                    deadline = time.monotonic() + MAX_SESSION_S

                    def tool_reply(name: str | None) -> dict[str, Any]:
                        if ev_mode and name == "read_ev_status":
                            return ev_status(state, ev_key, ev_selected)
                        if not ev_mode and name == "read_attacktrace_status":
                            return process_snapshot(state)
                        return {"error": "Tool unavailable"}

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
                                    not audio
                                    or len(audio) > MAX_CHUNK_BYTES
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
                                elif command.get("type") == "select" and ev_mode:
                                    nonlocal ev_selected
                                    ev_selected = str(command.get("id", ev_selected))[:16]
                                elif command.get("type") == "incident" and ev_mode:
                                    alert = ev_alert(ev_status(state, ev_key, ev_selected))
                                    if alert:
                                        await session.send(input=alert, end_of_turn=True)
                                elif command.get("type") == "stop":
                                    return
                            if time.monotonic() >= next_auth:
                                if state.settings.auth_enabled:
                                    await websocket_identity(ws)
                                next_auth = time.monotonic() + 10
                        return "time_limit"

                    async def gemini_to_browser() -> None:
                        recent_assistant_texts: list[str] = []
                        suppress_active_turn = False
                        turn_language = "en"
                        while time.monotonic() < deadline:
                            async for response in session.receive():
                                if response.tool_call:
                                    replies = [
                                        types.FunctionResponse(
                                            name=call.name,
                                            id=call.id,
                                            response=tool_reply(call.name),
                                        )
                                        for call in response.tool_call.function_calls
                                    ]
                                    await session.send_tool_response(function_responses=replies)
                                content = response.server_content
                                if not content:
                                    continue
                                if content.interrupted:
                                    suppress_active_turn = False
                                    await ws.send_json({"type": "interrupted"})
                                if content.input_transcription and content.input_transcription.text:
                                    user_text = content.input_transcription.text[:2000].strip()
                                    if user_text:
                                        if is_self_echo(user_text, recent_assistant_texts):
                                            log.info("Detected self-echo in live voice, suppressing turn: %s", user_text)
                                            suppress_active_turn = True
                                            continue

                                        classification = classify_language(user_text)
                                        turn_language = classification.language
                                        if not classification.is_supported:
                                            log.info("Unsupported language (%s) in live voice: %s", classification.reason, user_text)
                                            suppress_active_turn = True
                                            await ws.send_json(
                                                {
                                                    "type": "transcript",
                                                    "speaker": "user",
                                                    "text": user_text,
                                                    "language": "unsupported",
                                                }
                                            )
                                            reminder = UNSUPPORTED_LANGUAGE_MESSAGE
                                            recent_assistant_texts.append(reminder)
                                            await ws.send_json(
                                                {
                                                    "type": "transcript",
                                                    "speaker": "assistant",
                                                    "text": reminder,
                                                    "language": "en",
                                                }
                                            )
                                            continue
                                        else:
                                            suppress_active_turn = False
                                            await ws.send_json(
                                                {
                                                    "type": "transcript",
                                                    "speaker": "user",
                                                    "text": user_text,
                                                    "language": classification.language,
                                                }
                                            )
                                if (
                                    content.output_transcription
                                    and content.output_transcription.text
                                ):
                                    if suppress_active_turn:
                                        continue
                                    assistant_text = sanitize_response_text(content.output_transcription.text[:2000])
                                    recent_assistant_texts.append(assistant_text)
                                    if len(recent_assistant_texts) > 8:
                                        recent_assistant_texts.pop(0)
                                    await ws.send_json(
                                        {
                                            "type": "transcript",
                                            "speaker": "assistant",
                                            "text": assistant_text,
                                            "language": "tanglish" if turn_language in ("ta", "tanglish") else "en",
                                        }
                                    )
                                if content.model_turn:
                                    if suppress_active_turn:
                                        continue
                                    for part in content.model_turn.parts:
                                        if part.inline_data and part.inline_data.data:
                                            await ws.send_bytes(part.inline_data.data)
                                if content.turn_complete:
                                    suppress_active_turn = False
                                    await ws.send_json({"type": "turn_complete"})

                    sender = asyncio.create_task(browser_to_gemini())
                    receiver = asyncio.create_task(gemini_to_browser())
                    try:
                        done, pending = await asyncio.wait(
                            {sender, receiver},
                            timeout=MAX_SESSION_S,
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
                    await manager.__aexit__(None, None, None)
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
