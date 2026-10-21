"""Offline SIM stress evaluation; never controls the running app or tunes its detector.

Run from backend: python -m eval.robustness
"""

import json
from collections import Counter
from dataclasses import dataclass, replace
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

import networkx as nx
import numpy as np
from numpy.typing import NDArray

from app.attacks import AttackEngine, AttackSpec, Scenario
from app.config import get_settings
from app.data.simdata import sample_attack
from app.detect.detector import aggregate, alert_mask, rising_edges
from app.detect.pipeline import Loaded, load_detector
from app.graph import load_graph
from app.localize import Weights, build_incident
from app.report.validation import model_fingerprints
from app.sim import NODE_IDS, Plant
from app.sim.overlay import NoOverlay
from app.sim.plant import PlantParams
from app.sim.topology import NODE_BY_ID

F64 = NDArray[np.float64]
START, DURATION, RUN_S, DT = 60.0, 100.0, 220.0, 0.5
CALIBRATION_SEEDS = tuple(range(7100, 7106))
TEST_SEEDS = tuple(range(8200, 8204))


@dataclass(frozen=True)
class Case:
    name: str
    group: str
    attacks: tuple[tuple[Scenario, str, float], ...] = ()
    topology: str = "original"
    duration_s: float = DURATION
    run_s: float = RUN_S


SINGLES = (
    Case("sensor_offset", "single_attack", ((Scenario.SENSOR_OFFSET, "LIT101", -25),)),
    Case("sensor_freeze", "single_attack", ((Scenario.SENSOR_FREEZE, "LIT301", 0),)),
    Case("slow_ramp", "single_attack", ((Scenario.SENSOR_RAMP, "LIT101", -25),)),
    Case("actuator_force", "single_attack", ((Scenario.ACTUATOR_FORCE, "P101", 0),)),
    Case("rogue_setpoint", "single_attack", ((Scenario.ROGUE_SETPOINT, "PLC1", 25),)),
)
CASES = (
    Case("clean", "normal"),
    Case("noisy_clean", "normal"),
    Case("approved_setpoint", "authorized_change"),
    Case("sensor_fault", "benign_fault"),
    *SINGLES,
    Case(
        "simultaneous_origins",
        "multiple_attack",
        ((Scenario.SENSOR_OFFSET, "LIT101", -25), (Scenario.ACTUATOR_FORCE, "P301", 0)),
    ),
    Case("missing_topology", "topology_stress", SINGLES[0].attacks, "missing"),
    Case("reversed_topology", "topology_stress", SINGLES[0].attacks, "reversed"),
    Case(
        "ten_minute_sensor_drift",
        "slow_drift",
        ((Scenario.SENSOR_RAMP, "LIT101", -10),),
        duration_s=600,
        run_s=720,
    ),
)


class BenignOverlay(NoOverlay):
    def __init__(self, fault: bool) -> None:
        self.fault = fault

    def sensor(self, node: str, value: float, t: float) -> float:
        # An accidental bias can be observationally identical to a spoofed sensor.
        return (
            value - 25
            if self.fault and node == "LIT101" and START <= t < START + DURATION
            else value
        )

    def setpoint(self, node: str, value: float, t: float) -> float:
        return (
            value + 10
            if not self.fault and node == "PLC1" and START <= t < START + DURATION
            else value
        )


def observations(case: Case, seed: int) -> F64:
    attack = AttackEngine()
    for scenario, target, magnitude in case.attacks:
        attack.schedule(AttackSpec(scenario, target, START, case.duration_s, magnitude))
    overlay = (
        BenignOverlay(case.group == "benign_fault")
        if case.group in {"benign_fault", "authorized_change"}
        else attack
    )
    params = PlantParams()
    if case.name == "noisy_clean":
        params = replace(
            params,
            noise_level=params.noise_level * 3,
            noise_flow=params.noise_flow * 3,
            noise_pressure=params.noise_pressure * 3,
        )
    plant = Plant(seed, params=params, overlay=overlay, track_impact=False)
    values = []
    for _ in range(round(case.run_s / DT)):
        for _ in range(5):
            plant.step()
        snapshot = plant.state()
        values.append([snapshot[node] for node in NODE_IDS])
    return np.asarray(values, dtype=np.float64)


def evaluate_case(
    case: Case, seed: int, loaded: Loaded, graph: nx.DiGraph, weights: Weights
) -> dict[str, Any]:
    x = observations(case, seed)
    errors = loaded.detector.errors(x)
    # Match score_run smoothing, without a second prediction pass.
    from scipy.signal import lfilter

    alpha = loaded.detector.alpha
    scores = np.asarray(lfilter([alpha], [1, -(1 - alpha)], errors, axis=0))
    alerts = rising_edges(alert_mask(aggregate(scores), loaded.threshold))
    times = (np.arange(len(x)) + 1) * DT
    during = alerts[(times[alerts] >= START) & (times[alerts] < START + case.duration_s)]
    targets = sorted({target for _, target, _ in case.attacks})
    record: dict[str, Any] = {
        "scenario": case.name,
        "event_duration_s": case.duration_s,
        "run_duration_s": case.run_s,
        "group": case.group,
        "seed": seed,
        "targets": targets,
        "detected": bool(len(during)),
        "alert_count": len(alerts),
        "pre_event_alerts": int(np.sum(times[alerts] < START)),
        "topology": case.topology,
        "ranking": [],
        "detection_delay_s": None,
        "localization_delay_s": None,
        "top1_any": False if targets else None,
        "top3_all": False if targets else None,
        "top3_origin_recall": 0.0 if targets else None,
        "ranking_confidence": None,
    }
    if not len(during):
        return record
    idx = int(during[0])
    topology = graph.copy()
    if case.topology == "missing":
        topology.remove_edges_from(list(topology.edges()))
    elif case.topology == "reversed":
        topology = topology.reverse(copy=True)
    # Expose only samples available after the fixed 10-second localization window.
    end = min(len(x), idx + round(10 / DT) + 1)
    result = build_incident(
        scores[:end],
        errors[:end],
        x[:end],
        idx,
        loaded.detector.norm.mu,
        loaded.node_thr,
        topology,
        weights,
    )
    ranking = [c.id for c in result.candidates[:3]]
    record.update(
        {
            "ranking": ranking,
            "ranking_confidence": result.candidates[0].confidence,
            "detection_delay_s": float(times[idx] - START),
            "localization_delay_s": float(times[end - 1] - START),
            "predicted_category": NODE_BY_ID[ranking[0]].type.value,
            "expected_category": NODE_BY_ID[targets[0]].type.value if len(targets) == 1 else None,
            "top1_any": ranking[0] in targets if targets else None,
            "top3_all": set(targets) <= set(ranking) if targets else None,
            "top3_origin_recall": len(set(targets) & set(ranking)) / len(targets)
            if targets
            else None,
        }
    )
    return record


def probability(confidence: float, slope: float, intercept: float) -> float:
    value = min(max(confidence, 1e-6), 1 - 1e-6)
    logit = np.log(value / (1 - value))
    return float(1 / (1 + np.exp(-np.clip(slope * logit + intercept, -30, 30))))


def fit_calibration(rows: list[dict[str, Any]]) -> dict[str, Any]:
    detected = [r for r in rows if r["ranking_confidence"] is not None]
    if not detected:
        return {"available": False, "n": 0}
    correct = sum(int(r["top1_any"]) for r in detected)
    if correct < 2 or len(detected) - correct < 2:
        return {
            "available": False,
            "n": len(detected),
            "reason": "At least two correct and two incorrect calibration cases are required; "
            "no live confidence change was made",
        }
    # Fixed grid, selected on calibration seeds only. Monotonic slope prevents inverse confidence.
    best = (float("inf"), 0.0, 0.0)
    for slope in (0.0, 0.25, 0.5, 1.0, 2.0, 4.0):
        for intercept in np.arange(-4, 4.01, 0.25):
            probabilities = np.array(
                [probability(r["ranking_confidence"], slope, float(intercept)) for r in detected]
            )
            truth = np.array([int(r["top1_any"]) for r in detected])
            loss = float(
                np.mean(-(truth * np.log(probabilities) + (1 - truth) * np.log(1 - probabilities)))
            )
            if loss < best[0]:
                best = loss, slope, float(intercept)
    return {
        "available": True,
        "n": len(detected),
        "slope": best[1],
        "intercept": best[2],
        "calibration_log_loss": best[0],
        "applied_to_live_ranking": False,
        "scope": "Exploratory top-1 correctness calibration on detected single-origin SIM cases; "
        "not compromise probability",
    }


def reliability(
    rows: list[dict[str, Any]], calibration: dict[str, Any] | None = None
) -> dict[str, Any]:
    detected = [r for r in rows if r["ranking_confidence"] is not None]
    pairs = [
        (
            probability(r["ranking_confidence"], calibration["slope"], calibration["intercept"])
            if calibration
            else r["ranking_confidence"],
            int(r["top1_any"]),
        )
        for r in detected
    ]
    bins = []
    brier, ece = 0.0, 0.0
    for lower, upper in ((0.0, 0.2), (0.2, 0.4), (0.4, 0.6), (0.6, 0.8), (0.8, 1.000001)):
        samples = []
        for p, y in pairs:
            if lower <= p < upper:
                samples.append((p, y))
        if samples:
            confidence, accuracy = np.mean(samples, axis=0)
            brier += sum((p - y) ** 2 for p, y in samples)
            ece += len(samples) * abs(float(confidence - accuracy))
            bins.append(
                {
                    "lower": lower,
                    "upper": min(upper, 1),
                    "n": len(samples),
                    "mean_confidence": float(confidence),
                    "accuracy": float(accuracy),
                }
            )
    return {
        "n": len(detected),
        "brier": brier / len(detected) if detected else None,
        "ece": ece / len(detected) if detected else None,
        "bins": bins,
        "confidently_wrong": sum(p >= 0.8 and not y for p, y in pairs),
    }


def summarize(rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    groups = []
    for name in dict.fromkeys(r["scenario"] for r in rows):
        subset = [r for r in rows if r["scenario"] == name]
        attacked = bool(subset[0]["targets"])
        detected = [r for r in subset if r["detected"]]
        groups.append(
            {
                "scenario": name,
                "group": subset[0]["group"],
                "n": len(subset),
                "detected": len(detected),
                "alert_runs": sum(r["alert_count"] > 0 for r in subset),
                "top1_any": sum(r["top1_any"] for r in subset) / len(subset) if attacked else None,
                "top3_all": sum(r["top3_all"] for r in subset) / len(subset) if attacked else None,
                "top3_origin_recall": float(np.mean([r["top3_origin_recall"] for r in subset]))
                if attacked
                else None,
                "mean_detection_delay_s": float(np.mean([r["detection_delay_s"] for r in detected]))
                if detected
                else None,
                "mean_localization_delay_s": float(
                    np.mean([r["localization_delay_s"] for r in detected])
                )
                if detected
                else None,
            }
        )
    return groups


def run(models: Path) -> dict[str, Any]:
    settings = get_settings()
    loaded = load_detector(models)
    graph = load_graph(models / "graph.json")
    weights = Weights(settings.w_deviation, settings.w_onset, settings.w_causal)
    tuning = [
        evaluate_case(varied(case, seed), seed, loaded, graph, weights)
        for seed in CALIBRATION_SEEDS
        for case in SINGLES
    ]
    calibration = fit_calibration(tuning)
    held_out = []
    for seed in TEST_SEEDS:
        for case in CASES:
            held_out.append(evaluate_case(varied(case, seed), seed, loaded, graph, weights))
        print(f"Completed held-out seed {seed}", flush=True)
    nominal = [r for r in held_out if r["group"] == "single_attack"]
    raw_reliability = reliability(nominal)
    calibrated = reliability(nominal, calibration) if calibration["available"] else None
    confusion = Counter(
        (r["expected_category"], r["predicted_category"]) for r in nominal if r["detected"]
    )
    return {
        "schema_version": 1,
        "generated_at": datetime.now(UTC).isoformat(),
        "mode": "sim",
        "scope": "Offline simulator stress study; independent of local Modbus layer-rule checks",
        "model_fingerprints": model_fingerprints(models),
        "protocol": "varied single-origin targets/magnitudes; "
        "fixed multi-origin and topology stress pairs",
        "calibration_seeds": list(CALIBRATION_SEEDS),
        "test_seeds": list(TEST_SEEDS),
        "n_test_runs": len(held_out),
        "run_duration_s": RUN_S,
        "duration_note": "Per-run durations override nominal duration; drift lasts 600 seconds",
        "event_start_s": START,
        "calibration": calibration,
        "raw_reliability": raw_reliability,
        "calibrated_reliability": calibrated,
        "calibration_assessment": assess_calibration(raw_reliability, calibrated),
        "scenarios": summarize(held_out),
        "runs": held_out,
        "category_confusion": [
            {"expected": a, "predicted": b, "n": n} for (a, b), n in confusion.items()
        ],
        "limits": [
            "Small fixed synthetic study; no production guarantee "
            "or real-world compromise probabilities",
            "Calibration evaluates detected single-origin cases only; "
            "misses count as localization failures in scenario tables",
            "Top-1 any and Top-3 all report different questions for simultaneous origins",
            "Benign faults and attacks can produce identical telemetry; "
            "anomalies do not establish malicious intent",
            "Topology corruption affects localization only; the trained forecaster stays unchanged",
            "No LIVE, HAI, communication or real firmware accuracy is inferred from this SIM study",
        ],
    }


def assess_calibration(raw: dict[str, Any], calibrated: dict[str, Any] | None) -> dict[str, Any]:
    if calibrated is None:
        return {"status": "unavailable", "reasons": ["Insufficient calibration evidence"]}
    reasons = []
    if calibrated["ece"] is not None and raw["ece"] is not None and calibrated["ece"] > raw["ece"]:
        reasons.append("Expected calibration error increased on held-out cases")
    if (
        calibrated["brier"] is not None
        and raw["brier"] is not None
        and calibrated["brier"] > raw["brier"]
    ):
        reasons.append("Brier error increased on held-out cases")
    if calibrated["confidently_wrong"] > raw["confidently_wrong"]:
        reasons.append("More incorrect origins received at least 80% confidence")
    return {
        "status": "not_recommended" if reasons else "exploratory_only",
        "reasons": reasons or ["Small synthetic sample; independent replication required"],
    }


def varied(case: Case, seed: int) -> Case:
    if case.group != "single_attack":
        return case
    scenario = case.attacks[0][0]
    spec = sample_attack(
        np.random.default_rng(50000 + seed * 13 + list(Scenario).index(scenario)), scenario
    )
    return replace(case, attacks=((scenario, spec.target, spec.magnitude),))


if __name__ == "__main__":
    cfg = get_settings()
    report = run(cfg.models_dir)
    cfg.reports_dir.mkdir(parents=True, exist_ok=True)
    path = cfg.reports_dir / "robustness.json"
    temporary = path.with_suffix(".tmp")
    temporary.write_text(json.dumps(report, indent=2, allow_nan=False), encoding="utf-8")
    temporary.replace(path)
    print(f"Wrote {report['n_test_runs']} stress runs to {path}")
