# Local investigation checklist

Scope: AttackTrace SIM and the local Modbus emulator. These are development checks, not an industrial plant operating procedure.

## Compare origins

1. Select the incident and verify its source and timestamps.
2. Compare all candidates and their deviation, onset and topology contributions. Treat close rankings as competing hypotheses.
3. Check quality, missing/stale data, normal setpoint changes and benign faults.
4. Inspect linked evidence. Process-effect propagation is inferred; it does not prove a network intrusion route.
5. Record the alternative explanations, decision, severity and next check in the investigation journal.

## Communication channel

1. Use Local lab to route the default local emulator through the read-only proxy.
2. Start with zero offset and no loss; paired readings should match.
3. Apply a controlled offset. Compare before/forwarded values and transaction IDs in the evidence record.
4. Test delay and missing replies separately. Missing paired evidence means unresolved origin; delay alone is not proof of attack.
5. Restore direct reads when finished. A proxy-forwarded value does not attest that a remote receiver consumed it.

## Controller configuration integrity

1. Verify the emulator instance and observed/factory manifest hashes.
2. Apply an approved update, then an unapproved test change; inspect their separate journal records.
3. Check the emulator-observed application result, not just file-write success.
4. Restore the factory configuration when finished.
5. A hash change establishes a configuration difference. Approval is a local analyst record, not authenticated authorization or hardware attestation. This does not inspect real firmware.

## Response

1. SIM isolation can be requested only for a current simulation incident.
2. Record requested, accepted/rejected and observed containment separately.
3. Detector closure does not independently establish recovery or safe physical operation.
4. LIVE and HAI containment stay read-only. The lab's deliberate local test configuration is separate from operational containment.

## Validation

Run the backend regression suite and `python -m eval.local_layers` from the backend directory. The latter uses actual loopback Modbus reads and reports paired-evidence rule results on three seeds. It does not replace detector evaluation, confidence calibration or simultaneous-origin testing. See the report's `not_measured` field.

Run `python -m eval.robustness` for the separate simulator stress and confidence study. Metrics shows its results, model-snapshot status and calibration warnings. See [the study and next priorities](STRESS_VALIDATION.md). A fitted mapping that worsens held-out reliability must not be promoted merely because one error measure improves.
