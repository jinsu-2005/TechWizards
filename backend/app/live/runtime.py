"""LiveRuntime: what the API and the WebSocket loop talk to when the mode is LIVE.

It wraps the `LiveEngine` (detection, localization, incidents) with what a live source needs around
it: a `waiting` phase until every node has been read once, a `calibrating` phase while a clean
recording is made and the detector trained (when no LIVE model exists), and SQLite persistence of
incidents. It never writes to the plant.
"""

import asyncio
import hashlib
import json
import logging
import time
from collections.abc import Callable
from typing import Any, cast
from uuid import uuid4

import networkx as nx

from app.config import Settings
from app.detect.pipeline import load_baseline, load_detector
from app.engine import topology_of
from app.graph import load_graph, merge_graph
from app.live.calibration import read_checkpoint, source_fingerprint, write_checkpoint
from app.live.config import LiveConfig, LiveConfigError, load_live
from app.live.engine import LIVE_READ_ONLY, LiveEngine
from app.live.quality import excluded_from_ranking
from app.live.source import LiveSource, Snapshot, SourceNotReadyError
from app.live.store import IncidentStore
from app.live.tagmap import TagMap
from app.live.train import SAMPLE_S, LiveRecorder, live_dir, live_models_ready, train_live
from app.schemas import (
    CalibrationInfo,
    Incident,
    LiveMessage,
    NodeState,
    SourceInfo,
    SourceState,
    TagHealth,
    Topology,
)
from app.sim import NODE_IDS

log = logging.getLogger("attacktrace.live")

Phase = str  # "waiting" | "calibrating" | "running"


class LiveRuntime:
    mode = "live"

    def __init__(
        self,
        settings: Settings,
        cfg: LiveConfig,
        tagmap: TagMap,
        source: LiveSource | None = None,
        store: IncidentStore | None = None,
        clock: Callable[[], float] = time.time,
    ) -> None:
        self._clock = clock
        self._session_id = uuid4().hex
        self.settings, self.cfg, self.tagmap = settings, cfg, tagmap
        self.source = source or LiveSource(cfg, tagmap)
        self.store = store
        self.latest: LiveMessage | None = None
        self.detector_kind: str | None = None
        self.engine: LiveEngine | None = None
        self.train_error: str | None = None
        self._started = time.time()
        self._history: list[Incident] = store.load() if store else []
        self._saved: dict[str, str] = {}
        self._training: asyncio.Task[None] | None = None
        self._calibration_started: float | None = None
        self._next_calibration_sample: float | None = None
        self.recorder = LiveRecorder(self._target_samples())
        self.fingerprint = source_fingerprint(cfg, tagmap)
        self.calibration_notice: str | None = None
        self.model_meta: dict[str, Any] | None = None
        self.model_id: str | None = None
        self._checkpoint_at = 0.0
        self._checkpoint = live_dir(settings.models_dir) / "calibration.json"
        self._graph = self._load_graph()
        self.try_load_engine()
        if self.engine is None and self._checkpoint.exists():
            try:
                saved = read_checkpoint(self._checkpoint, self.fingerprint, self.recorder.target)
                self.recorder.rows = cast(list[list[float]], saved["rows"])
                self.recorder.segments = cast(list[int], saved["segments"])
                self.recorder.new_segment = True
                self.recorder.skipped = int(cast(int, saved.get("skipped", 0)))
                self._calibration_started = self._clock()
                self.train_error = cast(str | None, saved.get("error"))
                self.calibration_notice = (
                    "Resumed saved baseline; gaps are excluded from model windows."
                )
            except (OSError, ValueError, TypeError, KeyError):
                self.calibration_notice = (
                    "Saved baseline is incompatible or damaged; starting fresh."
                )

    # ------------------------------------------------------------------ setup
    def _target_samples(self) -> int:
        return round(self.settings.live_train_min * 60 / SAMPLE_S)

    def _load_graph(self) -> nx.DiGraph:
        for d in (live_dir(self.settings.models_dir), self.settings.models_dir):
            if (d / "graph.json").exists():
                return load_graph(d / "graph.json")
        return merge_graph([])  # the static P&ID only

    def try_load_engine(self) -> bool:
        """Start running when a LIVE model exists."""
        d = live_dir(self.settings.models_dir)
        if self.engine is not None or not live_models_ready(self.settings.models_dir):
            return self.engine is not None
        meta = json.loads((d / "detector.json").read_text())
        if meta.get("source_fingerprint") != self.fingerprint:
            self.calibration_notice = (
                "Saved model has no matching source/register-map fingerprint; "
                "recalibration required."
            )
            return False
        loaded = load_detector(d)
        self.model_meta = meta
        self.model_id = hashlib.sha256(
            b"".join(
                (d / name).read_bytes()
                for name in (
                    "detector.json",
                    f"{meta['active']}.pt",
                    "graph.json",
                    "baseline.joblib",
                )
            )
        ).hexdigest()
        self.detector_kind = str(meta["active"])
        self._graph = load_graph(d / "graph.json")
        self.engine = LiveEngine(
            loaded,
            load_baseline(d),
            self._graph,
            self.settings,
            self.source,
            detector_kind=self.detector_kind,
            clock=self._clock,
        )
        self.engine.incidents = list(self._history)  # ids continue after a restart
        return True

    # ------------------------------------------------------------------ views
    @property
    def incidents(self) -> list[Incident]:
        return self.engine.incidents if self.engine is not None else self._history

    @property
    def session_id(self) -> str:
        return self.engine.session_id if self.engine is not None else self._session_id

    @property
    def uptime_s(self) -> float:
        return time.time() - self._started

    @property
    def phase(self) -> Phase:
        if self.engine is not None:
            return "running"
        return "calibrating" if self.source.ready else "waiting"

    def topology(self) -> Topology:
        return topology_of(self._graph)

    def available(self) -> tuple[bool, str | None]:
        """Whether LIVE can be switched on right now, and if not, why."""
        st = self.source.status()
        if st.connected:
            return True, None
        reason = st.reason or "waiting for the plant source"
        # "connection refused" alone leaves an operator with nowhere to go. Name the address
        # nothing answered on and the one command that starts a source there.
        if "refused" in reason.lower():
            where = f"{self.cfg.host}:{self.cfg.port}"
            return False, (
                f"No Modbus source is answering on {where}. "
                "Start the plant emulator with `make emulator`, "
                "or set AT_EMBED_EMULATOR=true to run one inside the backend."
            )
        return False, reason

    def source_info(self) -> SourceInfo:
        st = self.source.status()
        state: SourceState = st.state  # type: ignore[assignment]
        progress: float | None = None
        reason = st.reason
        if self.engine is None and self.source.ready and state == "connected":
            state, progress = "calibrating", self.recorder.progress
            reason = self.train_error or reason
        faults = self._faults()
        if faults and reason is None:
            reason = "source-fault: " + ", ".join(faults[:3])
        return SourceInfo(
            mode="live",
            connected=st.connected,
            protocol=st.protocol,
            state=state,
            latency_ms_p50=st.latency_ms_p50,
            latency_ms_p95=st.latency_ms_p95,
            samples_per_s=st.samples_per_s,
            dropped=st.dropped,
            reason=reason,
            progress=progress,
            calibration=self.calibration_info(),
        )

    def calibration_info(self) -> CalibrationInfo | None:
        if self.engine is not None:
            return None
        now = self._clock()
        blockers = [f"{n}: {q}" for n, q in self.source.snapshot().quality.items() if q != "good"]
        stage = (
            "failed"
            if self.train_error
            else "training"
            if self._training
            else "blocked"
            if blockers
            else "collecting"
        )
        return CalibrationInfo(
            stage=stage,
            collected_samples=len(self.recorder.rows),
            target_samples=self.recorder.target,
            skipped_samples=self.recorder.skipped,
            elapsed_s=max(0.0, now - self._calibration_started)
            if self._calibration_started is not None
            else 0.0,
            remaining_s=(self.recorder.target - len(self.recorder.rows)) * SAMPLE_S
            if stage == "collecting"
            else None,
            blockers=blockers if stage == "blocked" else [],
            notice=self.calibration_notice,
        )

    def provenance(self) -> dict[str, Any]:
        meta = self.model_meta or {}
        calibration = self.calibration_info()
        return {
            "source_fingerprint": self.fingerprint,
            "fingerprint_scope": (
                "Configured endpoint, polling cadence and register map; "
                "not physical device attestation"
            ),
            "model_loaded": self.engine is not None,
            "model_id": self.model_id,
            "trained_at": meta.get("trained_at"),
            "recorded_samples": meta.get("recorded_samples"),
            "sample_s": meta.get("sample_s"),
            "active_model": meta.get("active"),
            "validation_samples": meta.get("val_samples"),
            "validation_mse": meta.get("models", {}).get(meta.get("active"), {}).get("val_mse"),
            "calibration": calibration.model_dump() if calibration else None,
        }

    def save_calibration(self) -> None:
        if self._calibration_started is None or self.engine is not None:
            return
        try:
            write_checkpoint(
                self._checkpoint,
                {
                    "version": 1,
                    "fingerprint": self.fingerprint,
                    "target": self.recorder.target,
                    "rows": self.recorder.rows,
                    "segments": self.recorder.segments,
                    "skipped": self.recorder.skipped,
                    "error": self.train_error,
                },
            )
            self._checkpoint_at = self._clock()
        except (OSError, ValueError):
            self.calibration_notice = (
                "Checkpoint could not be saved; collection continues in memory."
            )
            log.exception("Cannot save LIVE baseline checkpoint")

    def restart_calibration(self) -> None:
        if self._training is not None:
            raise ValueError("Detector training is still running; wait for its result.")
        if self.engine is not None:
            raise ValueError("A LIVE detector is already loaded; calibration is complete.")
        self.recorder = LiveRecorder(self._target_samples())
        self.train_error = None
        self._calibration_started = self._clock()
        self._next_calibration_sample = None
        self.save_calibration()

    def advance_calibration(self, *, start: bool = False) -> None:
        """Once LIVE starts calibration, continue collecting even when another view is active."""
        if self.engine is not None or self.train_error or self._training is not None:
            return
        if self._calibration_started is None:
            if not start:
                return
            self._calibration_started = self._clock()
        snap = self.source.snapshot()
        now = self._clock()
        # Keep a scheduled cadence: comparing with the previous sample time drops nearly
        # half the readings when a 500 ms tick arrives a few milliseconds early.
        due = self._next_calibration_sample
        if due is not None and now + 0.05 < due:
            return
        self._next_calibration_sample = (due if due is not None else now) + SAMPLE_S
        while self._next_calibration_sample <= now + 0.05:
            self._next_calibration_sample += SAMPLE_S
        self.recorder.add(snap)
        if now - self._checkpoint_at >= 10 or self.recorder.done:
            self.save_calibration()
        if self.recorder.done:
            self._training = asyncio.get_running_loop().create_task(self._train())

    def _faults(self) -> list[str]:
        if not self.source.ready:
            return []
        snap = self.source.snapshot()
        return [f"{n} {q}" for n, q in snap.quality.items() if excluded_from_ranking(q)]

    def health(self) -> list[TagHealth]:
        return [
            TagHealth(
                tag=h.tag,
                node_id=h.node_id,
                quality=h.quality,
                age_ms=h.age_ms,
                last_value=h.last_value,
            )
            for h in self.source.health()
        ]

    # ------------------------------------------------------------------ tick
    def step_sample(self) -> LiveMessage:
        if self.engine is not None:
            try:
                msg = self.engine.step_sample()
            except SourceNotReadyError:
                return self._plain(self.source.snapshot())
            self._persist()
            self.latest = msg
            return msg
        snap = self.source.snapshot()
        self.advance_calibration(start=True)
        self.latest = self._plain(snap)
        return self.latest

    def _plain(self, snap: Snapshot) -> LiveMessage:
        """A message with data but no detection (waiting or calibrating): no alert, no incident."""
        msg = LiveMessage(
            t=self._clock(),
            mode="live",
            nodes=[
                NodeState(
                    id=n,
                    value=snap.values[n],
                    truth=None,
                    score=0.0,
                    status="normal",
                    quality=snap.quality[n],
                )
                for n in NODE_IDS
            ],
            alert=None,
            incident=None,
            impact=None,
            source_latency_ms=None
            if snap.source_latency_ms == float("inf")
            else snap.source_latency_ms,
        )
        self.latest = msg
        return msg

    async def _train(self) -> None:
        try:
            x = self.recorder.array()
            await asyncio.to_thread(
                train_live,
                x,
                self.settings.models_dir,
                None,
                40,
                False,
                fingerprint=self.fingerprint,
                segments=self.recorder.segments,
            )
            if not self.try_load_engine():
                raise RuntimeError("Trained model does not match the configured source")
            self.train_error = None
            log.info("LIVE detector trained on %d clean samples", len(x))
        except Exception as exc:
            self.train_error = f"calibration failed: {exc}"
            log.exception("LIVE calibration failed")
            # Preserve the recording and report failure; a hidden retry loop can take hours.
        finally:
            self._training = None
            self.save_calibration()

    def _persist(self) -> None:
        if self.store is None or self.engine is None:
            return
        for inc in self.engine.incidents[-5:]:  # only recent incidents can still change
            body = inc.model_dump_json()
            if self._saved.get(inc.id) != body:
                self.store.save(inc)
                self._saved[inc.id] = body

    # ------------------------------------------------------------------ lifecycle
    def reset(self) -> None:
        """Clear the live view and start over. Stored incidents stay in the database."""
        if self.engine is not None:
            self.engine.reset()
        elif self._training is None:
            self.restart_calibration()
        self._history = []
        self.latest = None

    def clock_now(self) -> float:
        """Public accessor for the launcher in `app.api.live_attack` (kept out of `app/live`, the
        read-only ingestion package) to timestamp ground truth on the same clock as this runtime."""
        return self._clock()

    # ------------------------------------------------------------------ read-only toward the plant
    def isolate(self, incident_id: str, node_id: str) -> tuple[bool, str | None]:
        return False, LIVE_READ_ONLY

    async def stop(self) -> None:
        self.save_calibration()
        if self._training is not None:
            self._training.cancel()
        await self.source.stop()
        if self.store is not None:
            self.store.close()


def build_live_runtime(settings: Settings) -> tuple[LiveRuntime | None, str | None]:
    """The LIVE runtime, or (None, reason). A bad LIVE setting never stops SIM or HAI."""
    try:
        cfg, tagmap = load_live(settings)
        store = IncidentStore(settings.live_db)
        return LiveRuntime(settings, cfg, tagmap, store=store), None
    except LiveConfigError as exc:
        log.error("LIVE disabled: %s", exc)
        return None, str(exc)
    except Exception as exc:
        log.exception("LIVE disabled")
        return None, f"LIVE could not start: {exc}"
