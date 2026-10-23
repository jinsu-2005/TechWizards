"""FastAPI entrypoint: CORS, routers, and the background engine task."""

import asyncio
import contextlib
import json
import logging
import os
import shutil
import sys
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from pathlib import Path
from uuid import uuid4

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import authentication, copilot, investigation, lab, live_voice, rest, voice, ws
from app.api.gateway import GatewayBoundary
from app.api.live_attack import LiveAttackLauncher
from app.api.security import RateLimiter
from app.config import Settings, get_settings
from app.data.hai import hai_paths, load_hai_replay
from app.detect.hai_pipeline import (
    hai_models_ready,
    load_hai_baseline,
    load_hai_detector,
    train_hai,
)
from app.detect.pipeline import load_baseline, load_detector, train_all
from app.engine import Engine
from app.engine_hai import HaiEngine
from app.graph import load_graph
from app.live.runtime import LiveRuntime, build_live_runtime
from app.live.train import live_models_ready
from app.soc import SocStore

log = logging.getLogger("attacktrace")


def ensure_metrics(settings: Settings) -> bool:
    """Write reports/metrics.json on a fresh start so /metrics works immediately.

    Runs before the server accepts traffic (a minute or so), so it never competes with the live
    loop for CPU. Returns True when it ran."""
    path = settings.reports_dir / "metrics.json"
    stale = (
        path.exists() and hai_paths(settings.hai_dir) and "hai" not in json.loads(path.read_text())
    )
    if path.exists() and not stale:  # also refresh files written before HAI data was added
        return False
    from eval.run import write_metrics  # imported lazily: only needed on a first start

    log.warning("no metrics.json in %s - evaluating once (about a minute)", settings.reports_dir)
    write_metrics(settings)
    return True


def safe_ensure_metrics(settings: Settings) -> bool:
    """`ensure_metrics` that cannot stop the app: metrics are a convenience, and the optional HAI
    part reads a large dataset. A failure is logged and /metrics shows what exists (or 404)."""
    try:
        return ensure_metrics(settings)
    except Exception:
        log.exception("metrics could not be generated; continuing without them")
        return False


def build_hai_engine(settings: Settings) -> HaiEngine | None:
    """HAI replay engine when HAI files are present. Never raises: a failure just leaves HAI
    mode unavailable (the API answers 503) and SIM running."""
    if not hai_paths(settings.hai_dir):
        seed_raw = os.environ.get("AT_HAI_SEED_DIR")
        if seed_raw and hai_paths(Path(seed_raw)):
            settings = settings.model_copy(update={"hai_dir": Path(seed_raw)})
        else:
            return None
    try:
        d = settings.models_dir
        if not hai_models_ready(d):
            for candidate in (
                Path("/app/models/hai"),
                Path(__file__).resolve().parents[2] / "backend" / "models" / "hai",
                Path(__file__).resolve().parents[1] / "models" / "hai",
                Path("models/hai"),
            ):
                if (candidate / "detector.json").exists():
                    log.info("seeding HAI models from %s into %s/hai", candidate, d)
                    (d / "hai").mkdir(parents=True, exist_ok=True)
                    shutil.copytree(candidate, d / "hai", dirs_exist_ok=True)
                    break
            else:
                log.warning("no HAI models in %s/hai - training (about two minutes)", d)
                train_hai(d, settings.hai_dir, log=False)
        loaded = load_hai_detector(d)
        replay = load_hai_replay(settings.hai_dir, settings.hai_file, loaded.features)
        return HaiEngine(loaded, load_hai_baseline(d), replay, settings)
    except Exception:
        log.exception("HAI mode unavailable")
        return None


def build_engine(settings: Settings) -> Engine:
    """Load trained models (training them first if the models dir is empty)."""
    d = settings.models_dir
    if not (d / "detector.json").exists():
        log.warning("no trained models in %s — training (about a minute)", d)
        train_all(d, log=False)
    safe_ensure_metrics(settings)
    kind = str(json.loads((d / "detector.json").read_text())["active"])
    return Engine(
        load_detector(d, kind),
        load_baseline(d),
        load_graph(d / "graph.json"),
        settings,
        detector_kind=kind,
    )


def create_app(
    engine: Engine | None = None,
    run_loop: bool = True,
    hai_engine: HaiEngine | None = None,
    live_runtime: LiveRuntime | None = None,
) -> FastAPI:
    settings = get_settings()
    seed_path = os.environ.get("AT_HAI_SEED_DIR")
    if seed_path and Path(seed_path).is_dir():
        seed_dir = Path(seed_path)
        if not hai_paths(settings.hai_dir):
            if hai_paths(seed_dir):
                settings = settings.model_copy(update={"hai_dir": seed_dir})
            try:
                settings.hai_dir.mkdir(parents=True, exist_ok=True)
                for item in seed_dir.iterdir():
                    dest = settings.hai_dir / item.name
                    if not dest.exists():
                        shutil.copy2(item, dest)
            except Exception:
                pass
    embed_emulator = os.environ.get("AT_EMBED_EMULATOR", "").lower() in {"1", "true", "yes"}
    if embed_emulator:
        settings = settings.model_copy(update={"live_host": "127.0.0.1"})
    if settings.auth_enabled and os.environ.get("FIREBASE_AUTH_EMULATOR_HOST"):
        raise ValueError("Private authentication cannot use unsigned emulator tokens")
    if (
        settings.auth_enabled
        and not settings.auth_cookie_secure
        and settings.host not in {"localhost", "127.0.0.1", "::1"}
    ):
        raise ValueError("Private server authentication requires Secure cookies")

    @asynccontextmanager
    async def lifespan(app: FastAPI) -> AsyncIterator[None]:
        embedded_emu: Any = None
        settings.soc_db.parent.mkdir(parents=True, exist_ok=True)
        app.state.soc = SocStore(":memory:" if engine is not None else str(settings.soc_db))
        app.state.session_id = uuid4().hex
        app.state.engine = engine or await asyncio.to_thread(build_engine, settings)
        app.state.hai = hai_engine
        if hai_engine is None and engine is None:  # production start: look for HAI data too
            app.state.hai = await asyncio.to_thread(build_hai_engine, settings)
        if embed_emulator and engine is None:
            settings.live_db.parent.mkdir(parents=True, exist_ok=True)
            already_up = False
            try:
                _reader, writer = await asyncio.open_connection("127.0.0.1", settings.live_port)
                writer.close()
                await writer.wait_closed()
                already_up = True
            except OSError:
                already_up = False

            if not already_up:
                from app.live.tagmap import load_tagmap
                from plant_emulator.server import PlantEmulator

                manifest = settings.live_db.parent / "emulator_manifest.json"
                try:
                    tagmap = load_tagmap(settings.live_tagmap)
                    embedded_emu = PlantEmulator(
                        tagmap,
                        host="127.0.0.1",
                        port=settings.live_port,
                        health_port=None,
                        realtime=True,
                        manifest_path=manifest,
                    )
                    await embedded_emu.start()
                    log.info("embedded Modbus plant emulator started on 127.0.0.1:%s", settings.live_port)
                except Exception:
                    log.exception("could not start embedded PlantEmulator in-process")
        if live_runtime is not None:
            app.state.live = live_runtime
        elif engine is None:  # production start: LIVE is optional and never blocks SIM or HAI
            if not live_models_ready(settings.models_dir):
                for candidate in (
                    Path("/app/models/live"),
                    Path(__file__).resolve().parents[2] / "backend" / "models" / "live",
                    Path(__file__).resolve().parents[1] / "models" / "live",
                    Path("models/live"),
                ):
                    if (candidate / "detector.json").exists():
                        log.info("seeding LIVE models from %s into %s/live", candidate, settings.models_dir)
                        (settings.models_dir / "live").mkdir(parents=True, exist_ok=True)
                        shutil.copytree(candidate, settings.models_dir / "live", dirs_exist_ok=True)
                        break
            app.state.live, app.state.live_reason = build_live_runtime(settings)
        if app.state.live is not None:
            app.state.live_attacker = LiveAttackLauncher(settings.attacker_allowlist)
            await app.state.live.source.start()
        task = (
            asyncio.create_task(ws.run_loop(app.state, app.state.hub, settings.ws_period_s))
            if run_loop
            else None
        )
        integrity_task = (
            asyncio.create_task(lab.observe_integrity(app.state)) if engine is None else None
        )
        yield
        if integrity_task:
            integrity_task.cancel()
            with contextlib.suppress(asyncio.CancelledError):
                await integrity_task
        if task:
            task.cancel()
            with contextlib.suppress(asyncio.CancelledError):
                await task
        if app.state.live is not None:
            await app.state.live.stop()
        if app.state.live_attacker is not None:
            await app.state.live_attacker.close()
        if getattr(app.state, "lab_proxy", None) is not None:
            await app.state.lab_proxy.stop()
        if embedded_emu is not None:
            await embedded_emu.stop()
        app.state.soc.close()

    application = FastAPI(title="AttackTrace", version="0.1.0", lifespan=lifespan)

    @application.get("/api/health")
    def health() -> dict[str, str]:
        return {"status": "ok"}

    application.state.hub = ws.Hub()
    application.state.settings = settings
    application.state.attack_limiter = RateLimiter(settings.attack_rate_per_min)
    application.state.live_voice_limiter = RateLimiter(3)
    application.state.live_voice_slots = asyncio.Semaphore(2)
    if not settings.api_key and not settings.auth_enabled:
        log.warning("AT_API_KEY is not set: POST /api/attack, /reset and /mode are open")
    application.state.reports_dir = settings.reports_dir
    application.state.hai_dir = settings.hai_dir
    application.state.mode = "sim"
    application.state.hai = None
    application.state.live = None
    application.state.live_reason = None
    application.state.live_attacker = None
    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    application.middleware("http")(authentication.protect)
    application.add_middleware(
        GatewayBoundary, secret=settings.gateway_secret.get_secret_value()
    )
    application.include_router(authentication.router)
    application.include_router(rest.router)
    application.include_router(ws.router)
    application.include_router(copilot.router)
    application.include_router(voice.router)
    application.include_router(live_voice.router)
    application.include_router(investigation.router)
    application.include_router(lab.router)
    return application


app = create_app()
