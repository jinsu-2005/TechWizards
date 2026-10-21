"""Incident context from loaded objects; no secrets, control truth or disk-model substitution."""

import hashlib
import json
from typing import Any, cast

import joblib


def digest(payload: dict[str, Any]) -> str:
    return hashlib.sha256(
        json.dumps(payload, sort_keys=True, separators=(",", ":"), allow_nan=False).encode()
    ).hexdigest()


def loaded_context(engine: Any) -> dict[str, Any]:
    """Hash actual loaded weights/configuration once, not files that may later change."""
    cached = getattr(engine, "_incident_model_context", None)
    if cached is not None:
        return cast(dict[str, Any], cached)
    det = engine.loaded.detector
    weights = hashlib.sha256()
    for name, tensor in sorted(det.model.state_dict().items()):
        array = tensor.detach().cpu().numpy()
        weights.update(name.encode())
        weights.update(str((array.dtype, array.shape)).encode())
        weights.update(array.tobytes())
    baseline = {
        "kind": "IsolationForest and per-node 3-sigma",
        "asset_ids": list(engine.baseline.names),
        "artifact_id": joblib.hash(engine.baseline, hash_name="sha1"),
        "mean": engine.baseline.norm.mu.tolist(),
        "sd": engine.baseline.norm.sd.tolist(),
        "sigma": 3,
    }
    configuration = {
        "weights_sha256": weights.hexdigest(),
        "mean": det.norm.mu.tolist(),
        "sd": det.norm.sd.tolist(),
        "error_sd": det.err_sd.tolist(),
        "threshold": float(engine.loaded.threshold),
        "node_thresholds": engine.loaded.node_thr.tolist(),
        "window": det.window,
        "smoothing_alpha": det.alpha,
        "stuck_columns": det.stuck_cols,
    }
    result = {
        "model": {
            "kind": engine.detector_kind,
            "runtime_id": digest(configuration),
            "identity_scope": "Loaded weights, normalization, thresholds and scoring settings",
            **configuration,
        },
        "baseline": baseline,
    }
    engine._incident_model_context = result
    return result


def runtime_context(runtime: Any) -> dict[str, Any]:
    engine = getattr(runtime, "engine", runtime)
    if engine is None:
        return {"unavailable": "Detector is not loaded"}
    context = loaded_context(engine)
    source: dict[str, Any] = {"mode": runtime.mode}
    model = dict(context["model"])
    if runtime.mode == "live":
        provenance = runtime.provenance()
        model.update(
            {k: provenance[k] for k in ("model_id", "trained_at", "recorded_samples", "sample_s")}
        )
        source.update(
            {
                "protocol": "modbus_tcp",
                "host": runtime.cfg.host,
                "port": runtime.cfg.port,
                "poll_s": runtime.cfg.poll_s,
                "device_id": runtime.tagmap.device_id,
                "source_fingerprint": runtime.fingerprint,
                "register_map": [t.model_dump() for t in runtime.tagmap.by_role("value")],
                "attestation": "Configured endpoint only; physical device identity unverified",
            }
        )
    elif runtime.mode == "hai":
        source.update(runtime.replay_info())
        source["attestation"] = "Dataset replay; not original wall-clock or device provenance"
    else:
        source.update({"generator": "local water plant simulator", "seed": engine.settings.seed})
    return {
        "model": model,
        "baseline": context["baseline"],
        "source": source,
        "topology": runtime.topology().model_dump(),
        "localization_weights": {
            "deviation": engine.settings.w_deviation,
            "onset": engine.settings.w_onset,
            "causal": engine.settings.w_causal,
        },
        **({"adaptive_score_baseline": runtime._slow.tolist()} if runtime.mode == "hai" else {}),
    }
