"""LIVE detector: record clean traffic through the live path, train on it, store under models/live/.

`python -m app.live.train [--minutes N]` (`make live-train`) needs the emulator running. The same
recorder drives the in-app `calibrating` state. Only clean live data is used: the first 80% of the
recording trains, the last 20% validates (split by time), the alert threshold comes from the clean
validation data alone, and no attack run is ever looked at here.
"""

import argparse
import asyncio
import json
import logging
import time
from datetime import UTC, datetime
from itertools import pairwise
from pathlib import Path

import joblib
import numpy as np
import torch
from numpy.typing import NDArray

from app.config import Settings, get_settings
from app.detect.baseline import BaselineDetector
from app.detect.detector import ForecastDetector, aggregate, fit_err_sd
from app.detect.forecaster import WINDOW, Norm, build_model, make_windows, train
from app.graph import (
    adjacency,
    learn_granger_edges,
    load_graph,
    merge_graph,
    save_graph,
)
from app.live.calibration import source_fingerprint
from app.live.config import load_live
from app.live.source import LiveSource, Snapshot
from app.sim import NODE_IDS

log = logging.getLogger("attacktrace.live")

F64 = NDArray[np.float64]
SAMPLE_S = 0.5  # the engine tick: the model is trained on the rate it will run at
TRAIN_FRACTION = 0.8
THRESHOLD_MARGIN = 1.5  # alert threshold = this x the largest clean validation aggregate score
NODE_THR_QUANTILE = 0.999
WARM_EPOCHS, WARM_LR = 10, 5e-4  # fine-tuning the SIM weights on the live recording
MIN_SAMPLES = 600  # 5 minutes: below this there is nothing sensible to train on
SEED = 0
TRAIN_THREADS = 4
LEARNED_MIN_WEIGHT = 0.25
KINDS = ("gdn", "mlp")
MLP_MUST_BEAT = 0.9  # the MLP replaces the GDN only if its validation MSE is below this x the GDN's


def live_dir(models_dir: Path) -> Path:
    return models_dir / "live"


def live_models_ready(models_dir: Path) -> bool:
    d = live_dir(models_dir)
    return all((d / f).exists() for f in ("detector.json", "graph.json", "baseline.joblib"))


class LiveRecorder:
    """Collects clean, complete snapshots at the engine rate. A sample with any tag whose quality
    is not `good` is skipped, so faults never become training data."""

    def __init__(self, target_samples: int) -> None:
        self.target = target_samples
        self.rows: list[list[float]] = []
        self.skipped = 0
        self.segments = [0]
        self.new_segment = False

    def add(self, snap: Snapshot) -> bool:
        if self.done:
            return False
        if not snap.ready or any(q != "good" for q in snap.quality.values()):
            self.skipped += 1
            self.new_segment = True
            return False
        if self.new_segment and self.rows and self.segments[-1] != len(self.rows):
            self.segments.append(len(self.rows))
        self.new_segment = False
        self.rows.append([snap.values[n] for n in NODE_IDS])
        return True

    @property
    def progress(self) -> float:
        return min(1.0, len(self.rows) / self.target) if self.target else 1.0

    @property
    def done(self) -> bool:
        return len(self.rows) >= self.target

    def array(self) -> F64:
        return np.asarray(self.rows, dtype=np.float64).reshape(-1, len(NODE_IDS))


def train_live(
    x: F64,
    models_dir: Path,
    sim_models_dir: Path | None = None,
    epochs: int = 40,
    log_it: bool = True,
    warm_start: bool = True,
    fingerprint: str | None = None,
    segments: list[int] | None = None,
) -> dict[str, object]:
    """Train and save the LIVE detector from a clean recording (T, 9) at 2 Hz.

    With `warm_start` and SIM models present, training starts from the SIM weights and the SIM
    normalization (the emulator runs the same physics) and only fine-tunes on the live recording;
    error scales and thresholds always come from the live validation split. Without SIM models it
    trains from scratch on the live recording."""
    if len(x) < MIN_SAMPLES:
        raise ValueError(f"need at least {MIN_SAMPLES} clean samples, got {len(x)}")
    out = live_dir(models_dir)
    out.mkdir(parents=True, exist_ok=True)
    t0 = time.time()
    torch.set_num_threads(TRAIN_THREADS)
    cut = int(len(x) * TRAIN_FRACTION)
    x_tr = x[:cut]
    sim_dir = sim_models_dir or models_dir
    sim_meta = sim_dir / "detector.json"
    warm = warm_start and sim_meta.exists() and all((sim_dir / f"{k}.pt").exists() for k in KINDS)
    if warm:
        sm = json.loads(sim_meta.read_text())
        norm = Norm(np.array(sm["norm"]["mu"]), np.array(sm["norm"]["sd"]))
    else:
        norm = Norm.fit(x_tr)

    sim_graph = (sim_models_dir or models_dir) / "graph.json"
    graph = load_graph(sim_graph) if sim_graph.exists() else merge_graph(learn_granger_edges(x_tr))
    save_graph(graph, out / "graph.json")
    adj = adjacency(graph, LEARNED_MIN_WEIGHT)
    joblib.dump(BaselineDetector().fit(x_tr), out / "baseline.joblib")

    boundaries = sorted(set([0, *(segments or []), len(x)]))
    tr_runs = [x[a : min(b, cut)] for a, b in pairwise(boundaries) if a < cut]
    val_runs = [x[max(a, cut) : b] for a, b in pairwise(boundaries) if b > cut]
    tr_runs = [r for r in tr_runs if len(r) > WINDOW]
    val_runs = [r for r in val_runs if len(r) > WINDOW]
    if not tr_runs or not val_runs:
        raise ValueError("Recording segments are too short for chronological training/validation")
    tr_windows = [make_windows(norm.apply(r)) for r in tr_runs]
    val_windows = [make_windows(norm.apply(r)) for r in val_runs]
    tr_xy = (np.concatenate([w[0] for w in tr_windows]), np.concatenate([w[1] for w in tr_windows]))
    val_xy = (
        np.concatenate([w[0] for w in val_windows]),
        np.concatenate([w[1] for w in val_windows]),
    )
    results: dict[str, dict[str, object]] = {}
    for kind in KINDS:
        torch.manual_seed(SEED)
        model = build_model(kind, len(NODE_IDS), WINDOW, adj)
        if warm:
            model.load_state_dict(torch.load(sim_dir / f"{kind}.pt"))
            mse = train(model, tr_xy, val_xy, epochs=WARM_EPOCHS, lr=WARM_LR)
        else:
            mse = train(model, tr_xy, val_xy, epochs=epochs)
        det = ForecastDetector(model, norm, fit_err_sd(model, norm, val_runs))
        scores = np.concatenate([det.score_run(r)[WINDOW:] for r in val_runs])
        results[kind] = {
            "threshold": THRESHOLD_MARGIN * float(np.max(aggregate(scores))),
            "val_mse": mse,
            "err_sd": det.err_sd.tolist(),
            "node_thr": np.quantile(scores, NODE_THR_QUANTILE, axis=0).tolist(),
        }
        torch.save(model.state_dict(), out / f"{kind}.pt")
        if log_it:
            log.info("live %s: val_mse=%.4f thr=%.3f", kind, mse, float(results[kind]["threshold"]))  # type: ignore[arg-type]
    gdn_mse, mlp_mse = float(results["gdn"]["val_mse"]), float(results["mlp"]["val_mse"])  # type: ignore[arg-type]
    active = "mlp" if mlp_mse < MLP_MUST_BEAT * gdn_mse else "gdn"
    meta = {
        "active": active,
        "window": WINDOW,
        "learned_min_weight": LEARNED_MIN_WEIGHT,
        "norm": {"mu": norm.mu.tolist(), "sd": norm.sd.tolist()},
        "models": results,
        "source": "live",
        "source_fingerprint": fingerprint,
        "trained_at": datetime.now(UTC).isoformat(),
        "segment_starts": segments or [0],
        "train_windows": len(tr_xy[0]),
        "validation_windows": len(val_xy[0]),
        "sample_s": SAMPLE_S,
        "init": "sim-weights" if warm else "scratch",
        "recorded_samples": len(x),
        "train_samples": cut,
        "val_samples": len(x) - cut,
        "threshold_rule": f"{THRESHOLD_MARGIN} x max clean validation aggregate score",
        "train_seconds": time.time() - t0,
    }
    temporary = out / "detector.tmp"
    temporary.write_text(json.dumps(meta, indent=1))
    temporary.replace(out / "detector.json")
    return meta


async def record(settings: Settings, minutes: float, report: bool = True) -> F64:
    """Connect to the emulator and record `minutes` of clean traffic at the engine rate."""
    cfg, tm = load_live(settings)
    src = LiveSource(cfg, tm)
    await src.start()
    rec = LiveRecorder(round(minutes * 60 / SAMPLE_S))
    try:
        for _ in range(100):
            if src.ready:
                break
            await asyncio.sleep(0.1)
        if not src.ready:
            raise RuntimeError(f"no data from {cfg.host}:{cfg.port}; is the emulator running?")
        nxt = time.perf_counter()
        last_report = 0.0
        while not rec.done:
            rec.add(src.snapshot())
            nxt += SAMPLE_S
            await asyncio.sleep(max(0.0, nxt - time.perf_counter()))
            if report and rec.progress - last_report >= 0.1:
                last_report = rec.progress
                log.info(
                    "recorded %3.0f%% (%d samples, %d skipped)",
                    100 * rec.progress,
                    len(rec.rows),
                    rec.skipped,
                )
    finally:
        await src.stop()
    return rec.array()


def main() -> int:
    ap = argparse.ArgumentParser(
        description="Record clean live traffic and train the LIVE detector"
    )
    ap.add_argument("--minutes", type=float, default=None)
    args = ap.parse_args()
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(message)s")
    s = get_settings()
    minutes = args.minutes if args.minutes is not None else s.live_train_min
    x = asyncio.run(record(s, minutes))
    cfg, tags = load_live(s)
    meta = train_live(x, s.models_dir, fingerprint=source_fingerprint(cfg, tags))
    log.info(
        "saved %s: active=%s, %d clean samples, %.0f s",
        live_dir(s.models_dir),
        meta["active"],
        len(x),
        float(meta["train_seconds"]),  # type: ignore[arg-type]
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
