"""Compare baseline lengths on held-out emulator physics; no socket/network claims."""

import json
from datetime import UTC, datetime
from pathlib import Path

from app.attacks import Scenario
from app.config import Settings, get_settings
from app.data.simdata import Run, attack_run, simulate
from app.detect.pipeline import load_baseline, load_detector
from app.graph import load_graph
from app.live.config import load_live
from app.live.engine import LiveEngine
from app.live.source import LiveSource
from app.live.train import live_dir, train_live
from app.sim import NODE_IDS


def evaluate(models: Path, settings: Settings, runs: list[Run]) -> dict[str, object]:
    tp = fp = fn = clean_samples = false_alarms = detected = correct = attacks = 0
    delays: list[float] = []
    per_run: list[dict[str, object]] = []
    for run in runs:
        now = [1_000_000.0]
        cfg, tags = load_live(settings)
        source = LiveSource(cfg, tags, clock=lambda current=now: current[0])
        directory = live_dir(models)
        engine = LiveEngine(
            load_detector(directory),
            load_baseline(directory),
            load_graph(directory / "graph.json"),
            settings,
            source,
            clock=lambda current=now: current[0],
        )
        labels = run.labels()
        first_alert: float | None = None
        first_origin: str | None = None
        previous = False
        for index, row in enumerate(run.x):
            now[0] = 1_000_000 + float(run.t[index])
            values = dict(zip(NODE_IDS, row, strict=True))
            for tag in tags.by_role("value"):
                source._on_sample(tag.tag, float(values[tag.node_id]), now[0])
            message = engine.step_sample()
            alert = message.alert is not None
            label = labels[index]
            if label >= 0:
                tp += int(alert and label == 1)
                fp += int(alert and label == 0)
                fn += int(not alert and label == 1)
            if run.truth is None:
                clean_samples += 1
                false_alarms += int(alert and not previous)
            if label == 1 and alert and first_alert is None:
                first_alert = float(run.t[index])
            if (
                label == 1
                and message.incident
                and message.incident.status == "open"
                and first_origin is None
                and message.incident.origin
            ):
                first_origin = message.incident.origin[0].id
            previous = alert
        if run.truth:
            attacks += 1
            detected += int(first_alert is not None)
            correct += int(first_origin == run.truth.target)
            if first_alert is not None:
                delays.append(first_alert - run.truth.start_s)
            per_run.append(
                {
                    "seed": run.seed,
                    "scenario": run.truth.scenario.value,
                    "target": run.truth.target,
                    "detected": first_alert is not None,
                    "ranked_origin": first_origin,
                }
            )
    precision = tp / (tp + fp) if tp + fp else 0
    recall = tp / (tp + fn) if tp + fn else 0
    return {
        "precision": precision,
        "recall": recall,
        "f1": 2 * precision * recall / (precision + recall) if precision + recall else 0,
        "clean_hours": clean_samples * 0.5 / 3600,
        "false_alarms_per_hour": false_alarms / (clean_samples * 0.5 / 3600),
        "attacks": attacks,
        "detected": detected,
        "missed": attacks - detected,
        "top1_all_attacks": correct / attacks,
        "mean_detection_delay_s": sum(delays) / len(delays) if delays else None,
        "runs": per_run,
    }


def main() -> None:
    settings = get_settings()
    report_dir = settings.reports_dir / "baseline-comparison"
    recording = simulate(41000, 1200).x
    runs = [simulate(seed, 600) for seed in range(42000, 42003)]
    runs += [attack_run(seed, scenario) for scenario in Scenario for seed in range(42100, 42103)]
    results = {}
    for minutes in (5, 20):
        models = report_dir / f"{minutes}min"
        meta = train_live(
            recording[: minutes * 120], models, sim_models_dir=settings.models_dir, log_it=False
        )
        results[str(minutes)] = {
            "model": meta["active"],
            "training_seconds": meta["train_seconds"],
            **evaluate(models, settings, runs),
        }
    report = {
        "generated_at": datetime.now(UTC).isoformat(),
        "scope": (
            "Held-out simulation of emulator physics at 2 Hz; "
            "not Modbus-path or hardware validation"
        ),
        "training_seed": 41000,
        "clean_seeds": list(range(42000, 42003)),
        "attack_seeds": list(range(42100, 42103)),
        "results": results,
        "limitations": (
            "One baseline seed, 30 clean minutes and 15 attacks per model. "
            "Results do not establish production superiority; models are not deployed."
        ),
    }
    path = settings.reports_dir / "baseline_comparison.json"
    path.write_text(json.dumps(report, indent=2))
    print(
        json.dumps(
            {
                "path": str(path),
                "results": {
                    key: {k: v for k, v in value.items() if k != "runs"}
                    for key, value in results.items()
                },
            },
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
