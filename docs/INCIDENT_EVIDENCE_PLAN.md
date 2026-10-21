# Incident evidence implementation plan

1. Preserve an immutable first-observed incident capture in SQLite: loaded model identity,
   baseline statistics and thresholds, source/register mapping, topology, reported readings,
   initial assessment, and up to 30 seconds of prior sampled observations. Keep captures
   through reset/restart and telemetry rotation; remove only when their incident expires.
   Old cases remain explicitly uncaptured. SHA-256 checks detect accidental payload changes;
   they are not signatures or protection against a database administrator.
2. Extend reproducible simulator and loopback Modbus checks for simultaneous origins,
   gradual drift, delayed replies and controller changes. Keep test truth out of inference.
   Publish measured misses and scope, without promoting a model automatically.
3. Ground Copilot in the selected incident's saved capture and cited observations. Explain
   origin hypotheses, inferred process propagation, alternatives and unresolved layers.
   Never substitute the current model for an uncaptured historical case.
4. Extend the existing investigation screen with capture status, affected assets, initial
   readings/baseline comparison and chronological transitions, alongside the existing
   origin ranking, layer evidence, workflow and export.
5. Verify retention/restart/source separation, exports, historical Copilot grounding and
   meaningful attack cases. Check desktop/mobile layout and keyboard interaction. Attempt
   native zoom/accessibility tooling where available; document unavailable checks honestly.

Delivery: implementation, reproducible reports, screenshots and a short completion record.
