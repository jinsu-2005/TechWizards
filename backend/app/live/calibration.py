"""Atomic calibration checkpoints and explicit source-configuration provenance."""

import hashlib
import json
import math
from pathlib import Path

from app.live.config import LiveConfig
from app.live.tagmap import TagMap


def source_fingerprint(cfg: LiveConfig, tags: TagMap) -> str:
    contract = {
        "version": 1,
        "sample_s": 0.5,
        "host": cfg.host.lower(),
        "port": cfg.port,
        "poll_s": cfg.poll_s,
        "tagmap": tags.model_dump(mode="json"),
    }
    return hashlib.sha256(json.dumps(contract, sort_keys=True).encode()).hexdigest()


def write_checkpoint(path: Path, payload: dict[str, object]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_suffix(".tmp")
    temporary.write_text(json.dumps(payload, allow_nan=False), encoding="utf-8")
    temporary.replace(path)


def read_checkpoint(path: Path, fingerprint: str, target: int) -> dict[str, object]:
    if path.stat().st_size > 4_000_000:
        raise ValueError("Calibration checkpoint exceeds its size limit")
    data = json.loads(path.read_text(encoding="utf-8"))
    if data.get("version") != 1 or data.get("fingerprint") != fingerprint:
        raise ValueError("Saved recording belongs to a different source or register map")
    if data.get("target") != target:
        raise ValueError("Saved recording uses a different baseline duration")
    rows, segments = data.get("rows"), data.get("segments")
    if (
        not isinstance(rows, list)
        or len(rows) > target
        or any(
            not isinstance(row, list)
            or len(row) != 9
            or any(type(v) not in (float, int) or not math.isfinite(v) for v in row)
            for row in rows
        )
    ):
        raise ValueError("Saved recording contains invalid samples")
    if (
        not isinstance(segments, list)
        or any(type(i) is not int or i < 0 or i >= max(1, len(rows)) for i in segments)
        or segments != sorted(set(segments))
        or not segments
        or segments[0] != 0
    ):
        raise ValueError("Saved recording contains invalid segment boundaries")
    if type(data.get("skipped", 0)) is not int or data.get("skipped", 0) < 0:
        raise ValueError("Invalid skipped sample count")
    if data.get("error") is not None and not isinstance(data["error"], str):
        raise ValueError("Invalid saved calibration error")
    return dict(data)
