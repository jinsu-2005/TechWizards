# LIVE calibration fix and next implementation plan

## What was taking so long

The local `.env` explicitly requested 20 minutes of accepted data. The engine previously only recorded while LIVE was selected. Invalid-quality readings were skipped without showing the offending tags, and any training failure silently discarded the data and restarted collection. There was no distinction between collection and training in the progress ring.

The connection was healthy during inspection: all nine tags reported good quality. The inspection does not prove that a training error or a data fault occurred during the user's earlier long wait.

During verification, a new sample-cadence guard exposed sensitivity to tick jitter: comparing each tick against the previous acceptance time dropped valid early ticks. The final scheduler uses scheduled deadlines with a small tolerance and rejects duplicate catch-up ticks. A regression test alternates 490/510 ms intervals.

## Implemented

- Local configuration and example/default: 5 minutes, with a validated range of 5–120 minutes. This retains the trainer's minimum 600 samples; it does not bypass training.
- Calibration starts on first LIVE activation, then continues in the background while SIM or HAI is selected. The model sample cadence is independent of UI broadcasts.
- Accepted/skipped sample counts, elapsed time, remaining clean-recording time and per-tag blockers are exposed in source status and shown in the UI.
- Collection, quality-blocked collection, model training and training failure are distinct stages. The remaining time is an estimate for clean recording, not a promise for total training time.
- A training failure stops automatic retries and preserves the in-memory recording for diagnosis. The authenticated `POST /api/live/calibration/restart` endpoint starts a fresh recording; it refuses to interrupt an active trainer or overwrite an already loaded model.
- Recording is capped at its target while training runs, avoiding unnecessary growth/copying.
- Pending detection is not labeled Normal or GDN. Unscored readings are explicitly labeled; Launch/Reset and node-score claims are unavailable during calibration.
- Timeline labels now reflect actual buffered message timestamps, with paths, markers and scrubbing sharing the displayed sample scale. HAI axis offsets refer to received messages, not original dataset timestamps. Historical replay exposes the selected receive time to assistive technology.

A model with a matching source-configuration fingerprint is reused after restart. Calibration checkpoints are saved atomically every ten seconds and on graceful shutdown. Restart resumes accepted samples; training windows never cross restart or rejected-data gaps. A forced termination can lose the most recent ten seconds. Models without a matching fingerprint require recalibration. No physical device is used here. A good-quality reading is not proof that the baseline is attack-free.

## Verified local result

The real emulator run collected 600 samples at the scheduled 2 Hz cadence, including a LIVE → HAI → LIVE mode switch. Model training finished in 1.715 seconds, selected MLP, and used a chronological 480/120 train/validation split. After restarting the backend, LIVE immediately loaded the saved model and reported connected with no calibration pending. The captured API result is [live-calibration-validation.json](ui-review/live-calibration-validation.json); screenshots show [calibration](ui-review/live-calibration.jpg) and [monitoring after restart](ui-review/live-ready.jpg).

Verification also passed 141 frontend tests, frontend lint/TypeScript/production build, 87 backend regression checks across LIVE runtime/connectors/API/attacker tests, and the subsequently added restart authentication/busy-state test (included in a 23-test LIVE runtime pass). Ruff and targeted strict type checks passed for the six changed backend modules. Existing dependency deprecation and Metrics bundle-size advisories remain.

## Follow-up delivery status

The priorities below have now received the implementation described in [delivery and measured results](IMPLEMENTATION_DELIVERY.md). Native browser zoom, physical screen-reader sign-off, larger independent trials and real-time protocol-path baseline comparisons remain explicit validation work.

## Priorities implemented in this follow-up

1. **Calibration lifecycle and provenance.** Save resumable recordings with source/register-map fingerprints, reject mismatched models, and expose baseline duration, training date and validation results on Sources. Acceptance: interruption/resume and changed tag-map tests; no silent reuse of an incompatible model.
2. **Measure detection quality for the new local baseline.** Compare 5- and 20-minute models on separate clean and attack runs. Report false alarms/hour, missed attacks and origin-ranking accuracy; do not claim speed implies improved detection. Add slow drift and multiple-origin cases.
3. **Investigation and Copilot evidence.** Add calibration/model provenance to evidence references; distinguish data-quality faults, learned associations and confirmed emulator-channel evidence. Acceptance: every diagnosis links to retained evidence or states its uncertainty.
4. **Finish interaction/accessibility and performance.** Test browser zoom at 200%, keyboard focus through the graph and drawer, and screen-reader labels. Split the chart-heavy Metrics bundle and measure load-time improvements before changing the dependency setup.

These are proposed follow-ups, not claims of completed validation. Keep the work within the local simulator, recorded HAI data and Modbus emulator scope.
