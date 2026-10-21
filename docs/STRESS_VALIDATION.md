# SIM stress study — 15 October 2026

The Metrics screen now includes a separate SIM stress report and reliability tables. The report is stored at `reports/robustness.json`, served by `GET /api/validation/robustness`, and can be regenerated from `backend` with `python -m eval.robustness`.

## Protocol

- 48 held-out runs: 12 scenarios across seeds 8200–8203, 220 simulated seconds per run.
- Five single-origin scenario families use seeded variation in targets and magnitudes. Multi-origin and topology stress cases use fixed pairs for repeatability.
- Calibration uses different seeds, 7100–7105: 30 runs, of which 29 produce eligible detected single-origin cases.
- Calibration-grid choices are selected using only calibration cases. Neither detector weights nor live ranking confidence are modified.
- Localization receives readings, model errors and topology, without injected-origin labels. Labels are used separately to score results.
- Missed attacks count as localization failures. Delay and confidence reliability are conditional on detection and are labeled accordingly.
- A model/graph/metadata fingerprint identifies the evaluated snapshot. Metrics flags a report whose fingerprints differ from current files.

## Findings

| Scenario | Detected in event window | Top-1 matches any injected origin | Top-3 includes all injected origins |
|---|---:|---:|---:|
| Sensor offset | 4/4 | 4/4 | 4/4 |
| Sensor freeze | 4/4 | 4/4 | 4/4 |
| Slow ramp | 2/4 | 1/4 | 2/4 |
| Actuator force | 4/4 | 4/4 | 4/4 |
| Rogue setpoint | 4/4 | 3/4 | 4/4 |
| Simultaneous sensor/actuator origins | 4/4 | 4/4 | 0/4 |
| Missing localization edges | 4/4 | 4/4 | 4/4 |
| Reversed localization edges | 4/4 | 0/4 | 4/4 |

Clean runs raised no alerts. One of four noisy clean runs raised an alert. Approved setpoint changes and accidental sensor biases each raised anomalies in all four runs. Those anomalies do not establish malicious activity. A regression test confirms that the simulated accidental bias and malicious offset can produce identical reported telemetry with the same seed.

Missing edges performing well in this small scenario does not establish topology independence. The trained forecaster is unchanged during topology stress; only the localizer's supplied graph changes.

## Calibration decision

The held-out reliability comparison includes 18 detected nominal single-origin cases. Two missed single-origin attacks are excluded from this conditional analysis and remain failures in the scenario table.

| Measure | Raw ranking | Exploratory fitted mapping |
|---|---:|---:|
| Brier error | 0.134 | 0.122 |
| Expected calibration error | 0.106 | 0.147 |
| Incorrect origins receiving at least 80% confidence | 1 | 2 |

Although Brier error decreases, expected calibration error and confidently wrong predictions increase. The mapping is marked **not recommended** and is not applied to live rankings. The Metrics screen displays this warning. Small-sample synthetic calibration is not a probability of real-world compromise.

## Next implementation priorities

1. Develop slow-drift evidence on new development seeds and distinguish it from approved changes, ordinary noise and model drift. Freeze its settings before a new untouched test set.
2. Develop a set of competing/multiple-origin hypotheses. Do not claim success on simultaneous attacks from a Top-1-any result alone.
3. Track topology provenance and sensitivity; explain when a changed graph changes the leading origin. Treat strong disagreement as uncertainty rather than proof.
4. Expand calibration diversity and sample sizes, retain raw-versus-fitted diagnostics, and require independent replication before changing runtime confidence.

The seeds in this study are now observed evaluation data. Future detector or localization changes should use a new final holdout rather than repeatedly optimizing against these results.

This study does not measure real firmware compromise, physical hardware behavior or end-to-end channel-origin accuracy. Local Modbus paired-evidence validation remains a separate report.

Implementation checks: 285 backend tests and 134 frontend tests passed, together with production build, lint and targeted type checks. Server restart was rejected by automatic approval review with “blocked by policy”; running-page/visual verification remains pending.
