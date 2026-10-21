"""Bounded, opt-in OpenAI speech bridge. API credentials never reach the browser."""

import os

import httpx
from fastapi import APIRouter, HTTPException, Request, Response
from pydantic import BaseModel, Field

from app.api.security import RateLimiter, require_key

router = APIRouter(prefix="/api/voice", tags=["voice"])
VOICES = (
    "alloy", "ash", "ballad", "coral", "echo", "fable", "nova", "onyx", "sage",
    "shimmer", "verse", "marin", "cedar",
)
MAX_AUDIO_BYTES = 8 * 1024 * 1024


def _key() -> str:
    return os.environ.get("OPENAI_API_KEY", "")


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
        raise HTTPException(503, "OpenAI speech is not configured on this server")


@router.get("/capabilities")
def capabilities() -> dict:
    return {
        "openai_available": bool(_key()),
        "transcription_model": "gpt-transcribe" if _key() else None,
        "speech_model": "gpt-4o-mini-tts" if _key() else None,
        "voices": VOICES if _key() else [],
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
    extension = {
        "audio/webm": "webm", "audio/mp4": "mp4", "audio/mpeg": "mp3",
        "audio/wav": "wav", "audio/ogg": "ogg",
    }[content_type]
    try:
        async with httpx.AsyncClient(timeout=35) as client:
            response = await client.post(
                "https://api.openai.com/v1/audio/transcriptions",
                headers={"Authorization": f"Bearer {_key()}"},
                data={"model": "gpt-transcribe"},
                files={"file": (f"recording.{extension}", payload, content_type)},
            )
        response.raise_for_status()
        text = str(response.json().get("text", "")).strip()[:4000]
        if not text:
            raise HTTPException(422, "No speech recognized; try again")
        return {"text": text}
    except httpx.HTTPError as exc:
        raise HTTPException(502, "Speech transcription service is unavailable") from exc


class SpeechRequest(BaseModel):
    text: str = Field(min_length=1, max_length=400)
    voice: str = "coral"


@router.post("/speak")
async def synthesize(body: SpeechRequest, request: Request) -> Response:
    _limit(request)
    if body.voice not in VOICES:
        raise HTTPException(422, "Unsupported voice")
    try:
        async with httpx.AsyncClient(timeout=35) as client:
            response = await client.post(
                "https://api.openai.com/v1/audio/speech",
                headers={"Authorization": f"Bearer {_key()}"},
                json={
                    "model": "gpt-4o-mini-tts", "voice": body.voice,
                    "input": body.text, "response_format": "mp3",
                },
            )
        response.raise_for_status()
        return Response(
            content=response.content, media_type="audio/mpeg",
            headers={"Cache-Control": "no-store"},
        )
    except httpx.HTTPError as exc:
        raise HTTPException(502, "Speech synthesis service is unavailable") from exc
