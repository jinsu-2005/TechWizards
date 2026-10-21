import json
from pathlib import Path

import pytest

from app.config import Settings
from app.live.calibration import read_checkpoint, source_fingerprint, write_checkpoint
from app.live.config import load_live
from app.live.runtime import LiveRuntime
from app.live.source import LiveSource
from tests.test_live_engine import FakeClock, feed
from tests.test_live_runtime import TAGMAP


def test_source_contract_changes_with_endpoint_or_register_mapping() -> None:
    cfg, tags = load_live(Settings(live_tagmap=TAGMAP))
    original = source_fingerprint(cfg, tags)
    assert original == source_fingerprint(cfg, tags.model_copy(deep=True))
    assert original != source_fingerprint(cfg.model_copy(update={"port": cfg.port + 1}), tags)
    edited = tags.model_copy(deep=True)
    edited.tags[0] = edited.tags[0].model_copy(update={"scale": 2})
    assert original != source_fingerprint(cfg, edited)


def test_restart_resumes_rows_and_marks_a_gap(tmp_path, engine) -> None:
    settings = Settings(live_tagmap=TAGMAP, models_dir=tmp_path)
    cfg, tags = load_live(settings)
    clock = FakeClock()
    source = LiveSource(cfg, tags, clock=clock)
    runtime = LiveRuntime(settings, cfg, tags, source=source, clock=clock)
    for _ in range(3):
        feed(source, engine._plant.state(), clock)
        runtime.advance_calibration(start=True)
    runtime.save_calibration()
    resumed = LiveRuntime(settings, cfg, tags, source=source, clock=clock)
    assert resumed.recorder.rows == runtime.recorder.rows
    assert resumed.recorder.new_segment
    feed(source, engine._plant.state(), clock)
    resumed.advance_calibration()
    assert resumed.recorder.segments == [0, 3]
    assert len(resumed.recorder.rows) == 4
    resumed.restart_calibration()
    again = LiveRuntime(settings, cfg, tags, source=source, clock=clock)
    assert not again.recorder.rows


@pytest.mark.parametrize("change", ["fingerprint", "target", "rows", "segments", "error"])
def test_bad_checkpoint_is_rejected(tmp_path: Path, change: str) -> None:
    payload = {
        "version": 1,
        "fingerprint": "source",
        "target": 600,
        "rows": [[1.0] * 9],
        "segments": [0],
        "error": None,
    }
    payload[change] = {
        "fingerprint": "other",
        "target": 2400,
        "rows": [[float("nan")] * 9],
        "segments": ["not-an-index"],
        "error": 12,
    }[change]
    path = tmp_path / "checkpoint.json"
    path.write_text(json.dumps(payload))
    with pytest.raises(ValueError):
        read_checkpoint(path, "source", 600)


def test_checkpoint_write_failure_keeps_previous_file(tmp_path: Path) -> None:
    path = tmp_path / "checkpoint.json"
    write_checkpoint(path, {"valid": True})
    with pytest.raises(ValueError):
        write_checkpoint(path, {"invalid": float("nan")})
    assert json.loads(path.read_text()) == {"valid": True}
