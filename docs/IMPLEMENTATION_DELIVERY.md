# Calibration, evidence and UI follow-up — 15 October 2026

## Delivered

- **Resumable calibration:** atomic checkpoints every ten seconds, graceful shutdown saving, strict row/size/schema validation, source/register-map/duration matching, explicit incompatible/corrupt checkpoint notices. An interrupted real emulator run resumed from 352 saved samples and reached 600. [Before](ui-review/checkpoint-before-restart.json) / [after restart](ui-review/checkpoint-after-restart.json).
- **Training continuity:** restart and bad-quality gaps form separate segments. Training and validation windows never bridge those gaps. Chronological validation remains separate from training. Short fragmented recordings fail explicitly instead of claiming successful calibration.
- **Model compatibility:** endpoint, poll cadence, sampling contract and register map determine a SHA-256 fingerprint. Legacy or mismatched models are not loaded. The artifact ID covers metadata, active weights, graph and baseline files. This is configuration compatibility, not physical-device attestation.
- **Sources UI:** baseline duration/sample count, model type, training date, validation samples/MSE, source fingerprint and artifact ID. Validation MSE is labeled as a training diagnostic, not attack accuracy. [Verified model](ui-review/model-provenance-verified.json).
- **Copilot:** current LIVE answers include actual model/source references. Historical requests omit current-model context; current provenance does not establish historical provenance. Retained-event references remain separate. Provider timeout keeps a local evidence summary and current model reference.
- **Metrics:** independently seeded five- versus twenty-minute baseline study with misses, false alarms, ranking accuracy and conditional delay. Neither study model is deployed.
- **Chart performance/accessibility:** native SVG, tooltips, theme tokens and a semantic table replace the chart-library path. Metrics route JavaScript fell from approximately 555.20 kB to 21.00 kB before gzip (189.45 to 6.55 kB gzip). This measures bundle size, not network load time.

## Baseline comparison

Both models train on prefixes of the same seeded normal emulator-physics simulation at 2 Hz, with disjoint evaluation seeds. Each is tested on 30 clean minutes and 15 attacks. These are accelerated simulations, not Modbus recordings or hardware validation. Runtime calibration was separately exercised through the local Modbus emulator.

| Baseline | F1 | Detected | Missed | False alarms/hour | Top-1 over all attacks | Delay over detected attacks |
| --- | --- | --- | --- | --- | --- | --- |
| 5 minutes | 0.839 | 14/15 | 1 | 4.0 | 53% | 10.8 s |
| 20 minutes | 0.848 | 13/15 | 2 | 0.0 observed | 60% | 3.0 s |

No model wins every measure. Zero observed false alarms over half an hour does not establish a zero underlying rate. One training seed and fifteen attacks are too small for a production recommendation. Operational settings are not automatically changed by these results.

Raw runs: [baseline_comparison.json](../reports/baseline_comparison.json). Reproduce from `backend/` with `python -m eval.baseline_comparison`; outputs under `reports/baseline-comparison/` do not overwrite `backend/models/live/`.

## Verification

- Full backend regression: **303 passed**. Subsequent affected-module checks: **45 passed** after final provenance changes.
- Frontend regression: **142 passed**. The final targeted chart render passed without SVG-title warnings. Lint, TypeScript and production build passed; the old Metrics chunk warning is gone.
- Ruff passed for modified runtime, persistence, training, comparison and API modules. Targeted strict type checks passed for six modified backend modules.
- Real emulator restart preserved samples, completion trained a matching model, and a later restart reused it without calibration.
- Enter on a graph asset opened its inspector. Copilot Tab navigation wrapped within the dialog; Escape restored the opener's focus and background scrolling.
- Sources and Metrics checked at 390×844 without horizontal page overflow. The comparison table and chart scroll within their regions.
- A 640×360 CSS viewport with doubled emulated pixel density exercised reduced available layout space. Native zoom shortcuts did not change the in-app browser's zoom. This is responsive/emulation coverage, not native browser-zoom certification. Overrides were removed. A physical screen-reader pass remains outstanding; chart/table/dialog semantics were checked in markup and DOM.

## Remaining validation

Run a larger multi-seed study with normal operating changes, slow drift and simultaneous origins; compare real-time Modbus recordings over longer clean sessions. Record model IDs when incidents are created for durable historical attribution. Add expiry/approval policy for baseline reuse across emulator instance changes. Complete native zoom and screen-reader checks on target browsers.

This remains a local simulator / Modbus emulator / recorded HAI investigation prototype.
