"""Fast demo pacing: the same SIM samples delivered sooner, never a different simulation."""

from collections.abc import Iterator
from pathlib import Path
from types import SimpleNamespace

import pytest
from fastapi.testclient import TestClient

from app.api.ws import SIM_SPEEDS, emit_period
from app.engine import Engine
from app.main import create_app
from app.schemas import Status


@pytest.fixture
def client(engine: Engine, tmp_path: Path) -> Iterator[TestClient]:
    app = create_app(engine, run_loop=False)
    app.state.reports_dir = tmp_path
    app.state.hai_dir = tmp_path / "no-hai"
    with TestClient(app) as c:
        yield c


def test_sim_starts_at_normal_pacing(client: TestClient) -> None:
    status = Status.model_validate(client.get("/api/status").json())
    assert status.sim_speed == 1.0
    assert status.emit_period_s == pytest.approx(0.5)
    assert status.sim_speed_options == list(SIM_SPEEDS)


def test_fast_demo_shortens_only_the_gap_between_samples(client: TestClient) -> None:
    fast = max(SIM_SPEEDS)
    status = Status.model_validate(client.post("/api/sim/speed", json={"speed": fast}).json())
    assert status.sim_speed == fast
    assert status.emit_period_s == pytest.approx(0.5 / fast)
    # The reported pacing is what /status serves afterwards, not just the write's echo.
    assert Status.model_validate(client.get("/api/status").json()).sim_speed == fast


def test_pacing_returns_to_normal(client: TestClient) -> None:
    client.post("/api/sim/speed", json={"speed": max(SIM_SPEEDS)})
    status = Status.model_validate(client.post("/api/sim/speed", json={"speed": 1}).json())
    assert status.sim_speed == 1.0
    assert status.emit_period_s == pytest.approx(0.5)


def test_every_offered_speed_is_accepted(client: TestClient) -> None:
    for speed in SIM_SPEEDS:
        status = Status.model_validate(client.post("/api/sim/speed", json={"speed": speed}).json())
        assert status.sim_speed == speed
        assert status.emit_period_s == pytest.approx(0.5 / speed)


def test_unlisted_speeds_are_refused(client: TestClient) -> None:
    assert client.post("/api/sim/speed", json={"speed": 3}).status_code == 422
    assert client.post("/api/sim/speed", json={"speed": 0.5}).status_code == 422
    assert client.post("/api/sim/speed", json={"speed": 99}).status_code == 422


def test_the_attack_itself_is_unchanged_by_pacing(client: TestClient) -> None:
    """Pacing is a delivery rate, not a plant parameter: the request still runs 180 plant
    seconds and the detector still sees the same sample sequence."""
    client.post("/api/sim/speed", json={"speed": max(SIM_SPEEDS)})
    response = client.post(
        "/api/attack",
        json={"scenario": "sensor_offset", "target": "LIT101", "magnitude": -25, "duration_s": 180},
    )
    assert response.status_code == 200
    truth = client.app.state.engine._attacks.ground_truth()[-1]  # type: ignore[attr-defined]
    assert truth.end_s - truth.start_s == pytest.approx(180.0)


def test_only_sim_may_be_accelerated() -> None:
    """HAI carries its own replay speed and LIVE is paced by a real source, so neither is
    touched by the demo control."""
    for mode in ("hai", "live"):
        state = SimpleNamespace(mode=mode, sim_speed=6.0)
        assert emit_period(state, 0.5) == pytest.approx(0.5)


def test_pacing_is_refused_outside_sim(client: TestClient) -> None:
    client.app.state.mode = "live"  # type: ignore[attr-defined]
    assert client.post("/api/sim/speed", json={"speed": max(SIM_SPEEDS)}).status_code == 409
    # A status read in a non-SIM mode always reports normal pacing.
    assert Status.model_validate(client.get("/api/status").json()).sim_speed == 1.0


def test_emit_period_never_runs_away() -> None:
    """A speed the API would refuse must still be clamped if it ever reached the loop."""
    state = SimpleNamespace(mode="sim", sim_speed=1000.0)
    assert emit_period(state, 0.5) == pytest.approx(0.5 / max(SIM_SPEEDS))
    slow = SimpleNamespace(mode="sim", sim_speed=0.01)
    assert emit_period(slow, 0.5) == pytest.approx(0.5)
