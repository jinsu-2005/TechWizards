# Incident evidence delivery — 15 October 2026

The [implementation plan](INCIDENT_EVIDENCE_PLAN.md) is implemented for evidence preservation,
harder local tests, Copilot grounding and the investigation screen. Native zoom and a real
screen-reader session remain manual verification items.

## Preserved evidence

Every newly observed incident in SIM, HAI or LIVE receives an immutable first-emission capture.
It contains loaded weight/configuration identity, baseline object identity and mean/standard
deviation, alert/node thresholds, topology, localization weights, source details, reported
readings, initial assessment and up to 30 seconds of prior sampled observations (5000-row cap).
LIVE adds the model artifact reference, training time/sample count and configured register map.
HAI records the replay file/position/speed and adaptive score baseline. Training sample counts
that were not recorded by older SIM/HAI training remain unknown.

Model identity is computed from loaded tensors and scoring configuration, not a model file
that could have changed after loading. Baseline object identity uses joblib SHA-1; capture
payload verification uses canonical JSON SHA-256. The checksum is not a signature or protection
against a database administrator changing both payload and checksum. Captures identify models;
they do not archive complete executable model weights for later reconstruction.

Captured readings omit physical truth and the initial assessment omits injected ground truth.
Initial captures stay fixed while incident rankings and analyst decisions evolve. A reset,
restart, source session change or telemetry rotation cannot replace them. Captures expire with
their incident under the existing latest-500-incidents retention policy. The separate rolling
journal retains up to 100,000 events. Cases predating capture support show **Not captured**;
they never inherit current model settings.

The investigation detail and JSON export include the capture. The reference endpoint is
`GET /api/investigations/{incident_id}/capture`, scoped to the selected source.

## Investigation and Copilot

The existing investigation page now includes capture/digest status, source and baseline cards,
first-observed readings against clean 3-sigma bands, assets under investigation and chronological
case transitions. Clean bands are diagnostic comparisons, not forecast alert thresholds.
The phone layout uses a compact case selector so a long incident list does not bury evidence.
Tables retain their own keyboard-focusable scroll region. Model references wrap on narrow screens.

Copilot uses the selected case's saved model reference, first-observed deviations, retained
evidence citations, independent layer findings, alternative causes and propagation uncertainty.
Archived cases cannot use today's LIVE model or offer an action against the current stream.
Time-scoped evidence is bounded by both observation and receipt time. The retained final ranking
is explicitly labeled as such; it is not an as-of reconstruction. Provider context is bounded
and does not include the full pre-event sample collection. Timeout fallback retains local evidence.

## Measured harder tests

The refreshed [SIM stress report](../reports/robustness.json) contains 52 held-out runs across
four seeds, separate from calibration seeds. The added drift lasts 600 simulated seconds and
adds a total -10-unit sensor offset over that interval. Existing cases cover simultaneous
origins, controller manipulation, benign faults, approved changes and topology stress.

| Scenario | Detection in attack window | Top-3 all injected origins | Interpretation |
| --- | --- | --- | --- |
| Simultaneous sensor/actuator origins | 4/4 | 0/4 | Both-origin localization remains weak; recall at 3 was 50% |
| Ten-minute gentle sensor drift | 0/4 | 0/4 | Drift was missed during the event; later alerts are not counted as successful detection |
| Varied rogue controller setpoint | 4/4 | 4/4 | Top-1 was correct in 3/4 of this small synthetic sample |

The refreshed [loopback Modbus report](../reports/local_layer_validation.json) passed **24/24**
rule checks across three emulator seeds. It includes 250ms benign delays with client decoding
verified, gradual alteration across five transactions, matching/missing paired observations,
approved/unapproved controller changes and simultaneous channel/controller evidence.
These are paired-evidence rule checks, not end-to-end detector accuracy or hardware validation.
The gradual Modbus case is accelerated, not a ten-minute real-time soak. No model or threshold
was automatically promoted based on this study.

Reproduce from `backend` with `python -m eval.robustness` and `python -m eval.local_layers`.
The latter starts separate emulators on temporary loopback ports and does not modify the
running application's configured emulator.

## Verification

- Backend suite: **310 passed**; subsequent affected Copilot/journal/capture checks: **27 passed**.
- Frontend suite: **144 passed**, with lint, type checking and production build passing.
- Strict type checking of the six affected backend modules and targeted Ruff checks passed.
- Tests cover immutable capture/reopen, missing legacy data, session isolation, damaged capture,
  replacement model files, register mapping, retention cleanup, export and historical Copilot.
- Real running LIVE case `inc_37a157d5a0794605837f770175682b98`: 600-sample training baseline,
  nine readings and 117 prior observations. Capture and export stayed identical across restart.
  [Before](ui-review/incident-capture-before-restart.json),
  [after](ui-review/incident-capture-after-restart.json),
  [export](ui-review/incident-evidence-export.json).
- Screenshots checked at 1440×1000 and 390×844. No horizontal page overflow; the narrow reading
  table scrolls internally. Enter expands references, arrow keys reach the scrollable table,
  Escape dismisses Copilot, restores focus and restores document scrolling. The browser
  accessibility tree exposes the main landmark, named reading table/region and labeled inputs.
- Native browser zoom shortcuts did not change the in-app browser's zoom in the earlier pass.
  Viewport emulation is not native zoom verification. No real screen-reader session was available
  through the enabled interaction surface. Manual target-browser checks remain outstanding.

Screenshots: [desktop evidence](ui-review/incident-evidence-desktop.jpg),
[phone evidence](ui-review/incident-evidence-mobile.jpg),
[phone Copilot](ui-review/incident-copilot-mobile.jpg).

## Next research priority

Address the measured misses: evaluate accumulated residual/change-point methods for slow drift
and joint candidate selection for multiple origins, with separate tuning/held-out seeds and
longer clean operating-change recordings. Keep ambiguous layers explicit and compare false
alarms before deployment. Complete native 200%/400% zoom and NVDA/VoiceOver testing on the
actual target browser; do not infer accessibility certification from DOM checks.
