"""Read the server-side Gemini key, including the local development .env file."""

import os
from pathlib import Path


def gemini_key() -> str:
    key = os.environ.get("GEMINI_API_KEY", "").strip()
    if key:
        return key
    try:
        from dotenv import dotenv_values
    except ImportError:
        return ""
    root = Path(__file__).resolve().parents[3]
    values = dotenv_values(root / ".env") if (root / ".env").is_file() else {}
    return str(values.get("GEMINI_API_KEY") or "").strip()
