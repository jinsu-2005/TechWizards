import json

import numpy as np
from fastapi.testclient import TestClient

from app.main import create_app
from app.report.validation import model_fingerprints
from eval.robustness import (
    CALIBRATION_SEEDS,
    CASES,
    SINGLES,
    TEST_SEEDS,
    assess_calibration,
    fit_calibration,
    observations,
    probability,
    reliability,
    summarize,
    varied,
)


def row(confidence=0.9, correct=True):
    return {"ranking_confidence": confidence, "top1_any": correct}


def test_calibration_and_test_seeds_are_disjoint_and_target_sampling_repeats():
    assert not set(CALIBRATION_SEEDS) & set(TEST_SEEDS)
    assert varied(SINGLES[0], 7100) == varied(SINGLES[0], 7100)
    assert len({varied(SINGLES[0], seed).attacks for seed in CALIBRATION_SEEDS}) > 1


def test_empty_or_one_class_calibration_is_not_promoted():
    assert not fit_calibration([])["available"]
    assert not fit_calibration([row() for _ in range(8)])["available"]
    assert not fit_calibration([row(correct=False) for _ in range(8)])["available"]


def test_reliability_counts_transformed_high_confidence_errors():
    rows = [row(0.6, False), row(0.6, True)]
    raw = reliability(rows)
    transformed = reliability(rows, {"slope": 0, "intercept": 3})
    assert raw["confidently_wrong"] == 0
    assert transformed["confidently_wrong"] == 1
    assert sum(b["n"] for b in raw["bins"]) == 2
    assert raw["brier"] == (0.6**2 + (0.6 - 1) ** 2) / 2
    assert 0 < probability(1, 4, 4) < 1
    assert assess_calibration(raw, transformed)["status"] == "not_recommended"


def test_missed_multi_origin_case_counts_in_localization_denominator():
    def result(detected):
        return {
            "scenario": "multiple",
            "group": "multiple_attack",
            "targets": ["LIT101", "P301"],
            "detected": detected,
            "alert_count": int(detected),
            "top1_any": detected,
            "top3_all": False,
            "top3_origin_recall": 0.5 if detected else 0,
            "detection_delay_s": 2 if detected else None,
            "localization_delay_s": 12 if detected else None,
        }

    summary = summarize([result(True), result(False)])[0]
    assert summary["top1_any"] == 0.5
    assert summary["top3_all"] == 0
    assert summary["top3_origin_recall"] == 0.25
    assert summary["mean_detection_delay_s"] == 2


def test_accidental_bias_can_match_attack_telemetry_without_malicious_labels():
    fault = next(case for case in CASES if case.name == "sensor_fault")
    np.testing.assert_array_equal(observations(fault, 123), observations(SINGLES[0], 123))
    assert not fault.attacks


def test_validation_route_missing_invalid_and_changed_model(engine, tmp_path):
    models = tmp_path / "models"
    models.mkdir()
    (models / "detector.json").write_text(json.dumps({"active": "gdn"}))
    (models / "graph.json").write_text("{}")
    (models / "gdn.pt").write_bytes(b"weights1")
    app = create_app(engine, run_loop=False)
    app.state.reports_dir = tmp_path
    original = app.state.settings.models_dir
    app.state.settings.models_dir = models
    try:
        with TestClient(app) as client:
            assert client.get("/api/validation/robustness").status_code == 404
            report = tmp_path / "robustness.json"
            report.write_text("invalid")
            assert client.get("/api/validation/robustness").status_code == 503
            report.write_text(
                json.dumps({"schema_version": 1, "model_fingerprints": model_fingerprints(models)})
            )
            assert client.get("/api/validation/robustness").json()["model_matches_current"] is True
            (models / "gdn.pt").write_bytes(b"weights2")
            assert client.get("/api/validation/robustness").json()["model_matches_current"] is False
    finally:
        app.state.settings.models_dir = original
