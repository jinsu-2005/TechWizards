# AttackTrace implementation plan

Target: local simulator and local Modbus TCP plant emulator only. No physical PLC deployment.

## Data modes

- SIM: virtual water-treatment plant. Controlled attacks, known ground truth for evaluation, and simulation-only isolation/recovery.
- HAI: optional replay of HIL-based Augmented ICS recordings. These are external testbed observations, not a live connection and not an AI model. Requires local files and HAI-trained models. Component-level truth is limited by dataset labels.
- LIVE: connector polls the configured Modbus TCP source. For this development scope, use the local plant emulator. LIVE does not prove physical hardware is connected. Containment remains read-only.
- Modbus TCP: a request/reply protocol using numbered registers and coils. A local software device exposes the values, the connector reads a configured address map, and the detector analyzes time-series observations. A successful read is not proof of trustworthy provenance.

Reference: https://github.com/icsdataset/hai and the repository's app/live connector and config/tagmap.yaml.

## Milestone 1 — trustworthy assistance and investigation UI

Implementation in this change:
- Sources screen with source availability, mode capabilities, Modbus explanation and coverage gaps.
- Investigation screen with incident selection, candidate comparison, recorded score contributions, inferred timing and PDF export.
- Incident-scoped copilot history bounded to 12 turns and 2,000 characters per prior turn.
- No fabricated origin/confidence/action when incident evidence is absent.
- Explicit incident selection returns an error if unavailable; never substitutes another incident silently.
- Evidence-based fallback, honest missing-evidence labels, and optional model-generated suggested checks.
- Simulation isolation acceptance is separate from stream-confirmed containment; read-only modes do not offer executable copilot actions.
- Old request results are discarded when the frontend incident/source context changes.

Acceptance: tests cover absent/unknown incidents, ambiguous and historical incidents, LIVE/HAI restrictions, model failure, history limits and request acceptance. Verify source/incident pages and copilot in desktop and narrow layouts. External-model quality is not established by mocked tests.

## Milestone 2 — explicit evidence records and uncertainty

Build a versioned evidence API. Each event needs a unique event ID, asset ID, observed and received timestamps, source, evidence category, measured and expected values where available, and links to the originating record. Store immutable incident IDs across simulator resets. Record unavailable inputs rather than replacing them with invented values.

Preserve process values, data-quality events, authorized changes and action outcomes separately. Add an evidence drawer, filters and alternatives panel. Separate confirmed observations, inferred relationships and unsupported hypotheses. Label graph edges connected through an undirected fallback as uncertain. Make frontend investigation selection the shared context for timeline, topology, reports and copilot.

Acceptance: every claim links to a record or is labeled inference; missing evidence can produce unknown origin. Test fault/attack ambiguity, stale sources, incorrect topology and context changes. Retain existing detector benchmarks to detect regressions.

## Milestone 3 — local communication-channel attribution

Instrument the local emulator and read-only connector with timestamped register observations and protocol events. Add a local test proxy that can alter a controlled test reading between endpoints; do not extend the attacker allowlist to external networks. Treat channel links as origin candidates only after the localization/schema contracts are extended coherently.

Compare paired endpoint observations: unchanged emulator value plus modified receiver value supports a channel hypothesis; matching changed endpoint values require other explanations. Missing paired evidence means the origin is unresolved. Preserve dropped/stale/out-of-range observations as evidence even if excluded from process-model scoring.

UI: process/communication graph layers, paired-value comparison, provenance drawer and chronological event view.

Acceptance: controlled test cases distinguish sensor change, channel alteration, normal congestion and missing observations. Measure origin-category confusion, localization accuracy and detection delay on held-out seeds. Process effects and network intrusion paths must remain distinct.

## Milestone 4 — emulated firmware/configuration integrity

Create a deliberately emulated controller configuration/firmware manifest, an approved baseline, change-control events and integrity measurements. A hash mismatch is an observed change, not automatic proof of malicious activity or secure attestation. Separate approved maintenance, unauthorized manifest change and downstream process effects. Bind baseline identity to emulator instance/version.

UI: integrity/change-history tab, approved-vs-observed comparison, maintenance context and evidence links.

Acceptance: approved update is not mislabeled malicious; unauthorized emulated change is distinguishable from channel/sensor changes; unavailable integrity evidence yields unknown. Never claim this validates a real PLC firmware measurement chain.

## Milestone 5 — validation and response workflow

Evaluate slow ramps, multiple simultaneous origins, benign faults, changing setpoints, noisy/missing data and topology errors. Calibrate confidence on separate tuning data; report reliability and confidently wrong predictions. Do not redistribute candidate probabilities without explaining the ranking heuristic.

Add an operator response checklist: proposed, requested, accepted/rejected, verified and recovered. Record who/what requested the action and actual result. Keep simulator control separate from monitoring. Add cited local runbooks, model timeouts, request cancellation, access controls and model-use budgets before broader deployment.

Acceptance: reproducible test matrix and honest metrics split by SIM and emulator. No claimed production readiness, physical safety guarantee, firmware compromise proof or live autonomous control.

## Build order

Finish and verify milestone 1, then implement evidence records before adding new origin classes. Communication attribution precedes emulated firmware integrity. Add each screen only when its underlying evidence exists. Keep HAI optional; downloading/training that dataset is unnecessary for the selected local-first scope.
