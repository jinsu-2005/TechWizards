"""Identify the model/configuration behind an offline evaluation snapshot."""

import hashlib
import json
from pathlib import Path


def model_fingerprints(models: Path) -> dict[str, str]:
    metadata = json.loads((models / "detector.json").read_text(encoding="utf-8"))
    kind = metadata["active"]
    if kind not in {"gdn", "mlp"}:
        raise ValueError("Unsupported model")
    return {
        name: hashlib.sha256((models / name).read_bytes()).hexdigest()
        for name in ("detector.json", "graph.json", f"{kind}.pt")
    }
