"""Bounded Gemini speech bridge. The API key stays on the backend."""

import base64
import os

import httpx
from fastapi import APIRouter, HTTPException, Request, Response
from pydantic import BaseModel, Field

from app.api.security import RateLimiter, require_key

router = APIRouter(prefix="/api/voice", tags=["voice"])
GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/interactions"
TRANSCRIPTION_MODEL = "gemini-3.5-transcribe"
SPEECH_MODELS = ("gemini-3.8-flash-lite-tts", "gemini-3.8-flash-tts")
VOICES = ("Kore", "Puck")
MAX_AUDIO_BYTES = 8 * 1024 * 1024


def _key() -> str:
    return os.environ.get("GEMINI_API_KEY", "")


def _limit(request: Request) -> None:
    require_key(request)
    state = request.app.state
    if getattr(state, "voice_limiter", None) is None:
        state.voice_limiter = RateLimiter(12)
    principal = getattr(request.state, "principal", {})
    identity = principal.get("uid") or (request.client.host if request.client else "unknown")
    if state.voice_limiter.check(identity) is not None:
        raise HTTPException(429, "Voice request limit reached; try again shortly")
    if not _key():
        raise HTTPException(503, "Gemini speech is not configured on this server")


def _output_text(result: dict) -> str:
    value = result.get("output_text")
    if isinstance(value, str):
        return value
    for step in reversed(result.get("steps", [])):
        if step.get("type") == "model_output":
            return " ".join(
                str(part["text"]) for part in step.get("content", [])
                if part.get("type") == "text" and isinstance(part.get("text"), str)
            )
    return ""


def _output_audio(result: dict) -> bytes:
    for step in reversed(result.get("steps", [])):
        if step.get("type") != "model_output":
            continue
        for part in reversed(step.get("content", [])):
            if part.get("type") == "audio" and isinstance(part.get("data"), str):
                return base64.b64decode(part["data"], validate=True)
    return b""


async def _interaction(payload: dict) -> dict:
    try:
        async with httpx.AsyncClient(timeout=40) as client:
            response = await client.post(
                GEMINI_URL,
                headers={"x-goog-api-key": _key(), "Content-Type": "application/json"},
                json=payload,
            )
        response.raise_for_status()
        result = response.json()
        return result.get("interaction", result)
    except httpx.HTTPStatusError as exc:
        raise HTTPException(
            502, f"Gemini speech service returned {exc.response.status_code}"
        ) from exc
    except (httpx.HTTPError, ValueError) as exc:
        raise HTTPException(502, "Gemini speech service is unavailable") from exc


@router.get("/capabilities")
def capabilities() -> dict:
    available = bool(_key())
    return {
        "gemini_available": available,
        "transcription_model": TRANSCRIPTION_MODEL if available else None,
        "speech_models": SPEECH_MODELS if available else [],
        "voices": VOICES if available else [],
    }


@router.post("/transcribe")
async def transcribe(request: Request) -> dict[str, str]:
    _limit(request)
    content_type = request.headers.get("content-type", "").split(";")[0].lower()
    allowed = {"audio/webm", "audio/mp4", "audio/mpeg", "audio/wav", "audio/ogg"}
    if content_type not in allowed:
        raise HTTPException(415, "Unsupported audio format")
    chunks = []
    total = 0
    async for chunk in request.stream():
        total += len(chunk)
        if total > MAX_AUDIO_BYTES:
            raise HTTPException(413, "Audio must be between 1 byte and 8 MB")
        chunks.append(chunk)
    payload = b"".join(chunks)
    if not payload:
        raise HTTPException(422, "Audio recording is empty")
    result = await _interaction({
        "model": TRANSCRIPTION_MODEL,
        "input": [{
            "type": "audio",
            "data": base64.b64encode(payload).decode("ascii"),
            "mime_type": content_type,
        }],
        "generation_config": {
            "transcription_config": {
                "custom_vocabulary": ["AttackTrace", "Modbus", "HAI", "PLC1", "PLC2"],
            },
        },
    })
    text = _output_text(result).strip()[:4000]
    if not text:
        raise HTTPException(422, "No speech recognized; try again")
    return {"text": text}


class SpeechRequest(BaseModel):
    text: str = Field(min_length=1, max_length=400)
    voice: str = "Kore"
    model: str = SPEECH_MODELS[0]


@router.post("/speak")
async def synthesize(body: SpeechRequest, request: Request) -> Response:
    _limit(request)
    if body.voice not in VOICES or body.model not in SPEECH_MODELS:
        raise HTTPException(422, "Unsupported Gemini speech model or voice")
    result = await _interaction({
        "model": body.model,
        "input": [{"type": "user_input", "content": [{"type": "text", "text": body.text}]}],
        "response_format": {"type": "audio"},
        "generation_config": {"speech_config": [{"voice": body.voice}]},
    })
    try:
        wav = _output_audio(result)
    except ValueError as exc:
        raise HTTPException(502, "Gemini returned invalid speech audio") from exc
    if not wav:
        raise HTTPException(502, "Gemini returned no speech audio")
    return Response(content=wav, media_type="audio/wav", headers={"Cache-Control": "no-store"})
