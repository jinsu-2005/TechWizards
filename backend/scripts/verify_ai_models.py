"""Small, opt-in Gemini smoke checks; run from backend with python -m scripts.verify_ai_models."""

from __future__ import annotations

import argparse
import asyncio
import json
from typing import Any

import httpx
from google import genai

from app.ai.models import COMPATIBLE, DEFAULT_POOLS
from app.ai.secrets import gemini_key

INTERACTIONS_URL = "https://generativelanguage.googleapis.com/v1beta/interactions"


def _result(model: str, operation: str, outcome: str, detail: str = "") -> dict[str, str]:
    return {"model": model, "operation": operation, "outcome": outcome, "detail": detail[:120]}


def _interaction(client: httpx.Client, model: str, key: str, body: dict[str, Any]) -> dict:
    response = client.post(
        INTERACTIONS_URL,
        headers={"x-goog-api-key": key, "content-type": "application/json"},
        json={"model": model, **body},
    )
    response.raise_for_status()
    return response.json()


def _speech_body() -> dict[str, Any]:
    return {
        "input": [{"type": "user_input", "content": [{"type": "text", "text": "Test."}]}],
        "response_format": {"type": "audio"},
        "generation_config": {"speech_config": [{"voice": "Kore"}]},
    }


def _audio(result: dict) -> str:
    return next(
        (
            part["data"]
            for step in result.get("steps", [])
            for part in step.get("content", [])
            if part.get("type") == "audio"
        ),
        "",
    )


async def _live_check(key: str, model: str) -> None:
    config: dict[str, Any] = {"response_modalities": ["AUDIO"]}
    if model.endswith("extended-thinking"):
        config["thinking_config"] = {"thinking_level": "HIGH"}
    with genai.Client(api_key=key) as client:
        async with asyncio.timeout(15):
            async with client.aio.live.connect(model=model, config=config):
                pass


def verify(all_candidates: bool = False) -> list[dict[str, str]]:
    key = gemini_key()
    if not key:
        return [_result("server", "configuration", "unavailable", "GEMINI_API_KEY is missing")]
    with genai.Client(api_key=key) as client:
        listed = {m.name.removeprefix("models/") for m in client.models.list() if m.name}
        text_models = tuple(sorted(COMPATIBLE["text"])) if all_candidates else DEFAULT_POOLS["text"]
        live_models = tuple(sorted(COMPATIBLE["live"])) if all_candidates else DEFAULT_POOLS["live"]
        tts_models = tuple(sorted(COMPATIBLE["tts"])) if all_candidates else DEFAULT_POOLS["tts"]
        transcript_models = DEFAULT_POOLS["transcription"]
        output: list[dict[str, str]] = []
        for model in text_models:
            if model not in listed:
                output.append(_result(model, "generateContent", "not_listed"))
                continue
            try:
                response = client.models.generate_content(
                    model=model,
                    contents="Reply READY only.",
                    config={"max_output_tokens": 128},
                )
                output.append(_result(model, "generateContent", "ok" if response.text else "empty"))
            except Exception as exc:
                output.append(_result(model, "generateContent", "failed", type(exc).__name__))
        for model in live_models:
            if model not in listed:
                output.append(_result(model, "Live", "not_listed"))
                continue
            try:
                asyncio.run(_live_check(key, model))
                output.append(_result(model, "Live", "ok"))
            except Exception as exc:
                output.append(_result(model, "Live", "failed", type(exc).__name__))
        with httpx.Client(timeout=45) as http:
            sample_audio = ""
            for model in tts_models:
                if model not in listed:
                    output.append(_result(model, "TTS", "not_listed"))
                    continue
                try:
                    sample = _audio(_interaction(http, model, key, _speech_body()))
                    if sample and not sample_audio:
                        sample_audio = sample
                    output.append(_result(model, "TTS", "ok" if sample else "empty"))
                except Exception as exc:
                    output.append(_result(model, "TTS", "failed", type(exc).__name__))
            for model in transcript_models:
                if model not in listed or not sample_audio:
                    output.append(_result(model, "transcription", "not_tested"))
                    continue
                try:
                    result = _interaction(
                        http,
                        model,
                        key,
                        {
                            "input": [
                                {"type": "audio", "data": sample_audio, "mime_type": "audio/wav"}
                            ],
                        },
                    )
                    words = [
                        part.get("text", "")
                        for step in result.get("steps", [])
                        for part in step.get("content", [])
                        if part.get("type") == "text"
                    ]
                    output.append(_result(model, "transcription", "ok" if any(words) else "empty"))
                except Exception as exc:
                    output.append(_result(model, "transcription", "failed", type(exc).__name__))
    return output


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--all", action="store_true", help="Spend quota checking all compatible candidates"
    )
    args = parser.parse_args()
    print(json.dumps(verify(args.all), indent=2))
