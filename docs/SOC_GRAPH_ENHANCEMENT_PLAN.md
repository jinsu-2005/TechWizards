# AttackTrace: proposed SOC and Twin/Graph enhancement plan

Status: approved by the user on 15 October 2026. Local prototype features are implemented; delivery notes below distinguish them from remaining validation and research.

## Delivery notes

Implemented in this increment:

- SQLite investigation journal for all modes, immutable incident IDs, source/session isolation, bounded telemetry/evidence retention and restart/reset-safe case records.
- Analyst acknowledgment, severity, case state, notes, response request/outcome audit records, event references and bounded JSON evidence export.
- Shared asset selection across Twin, Graph, timeline and inspector; clearer view labels, search/type/status filters, upstream/downstream focus, topology/learned/inferred layers, uncertain-direction links without arrows, zoom/fit, expanded view and a minimap for larger graphs.
- Incident progression from detector state and recorded response events. Closure and containment remain distinct; no invented recovery percentage.
- Alerts overview, asset/quality/register inventory, expanded investigation workflow and local lab screens.
- Loopback-only read proxy with paired Modbus response evidence, controlled offset/delay/loss, direct-reader restoration and rejection of writes through the proxy.
- Actual emulator controller-configuration manifest, factory hashes, instance identity, approval/change records, passive change observation and verified application checks. This measures emulated configuration, not real firmware.
- Copilot evidence references, asset context, explicit historical limitations, bounded history/input, provider timeouts, request cancellation, concurrency/rate limits and a local investigation checklist.
- Launch/Reset controls retain minimum heights instead of shrinking when the console is constrained. The graph loads separately to reduce the initial dashboard bundle.

Validation: frontend regression tests and production build; backend regression and local journal/proxy/integrity tests; a three-seed loopback evidence-rule report at `reports/local_layer_validation.json`; live local API smoke checks at `reports/soc_smoke.json`. The smoke check restores direct reads and factory configuration afterward.

Final checks for this increment: 279 backend tests, 132 frontend tests and 18 local layer scenarios passed. Frontend production build/lint and type checking of the 15 changed backend modules passed. The existing large metrics-bundle advisory and Starlette test-client deprecation warning remain.

Follow-up implemented: a separate 48-run SIM stress study, calibration on disjoint seeds, category confusion, conditional detection/localization delays, multiple-origin metrics, and raw/fitted confidence reliability. Metrics includes the report and warns when model files change or calibration is not recommended. See [measured findings and next priorities](STRESS_VALIDATION.md). The fitted mapping worsens some held-out reliability measures and remains outside live rankings.

Remaining validation and research: fresh browser visual sign-off, larger independent stress studies, slow-drift detection, multiple-origin inference, topology sensitivity handling, and validated runtime calibration. The local Modbus layer checks and SIM study establish behavior only in their controlled scenarios. Historical copilot requests filter retained events but do not reconstruct every past ranking. Physical firmware attestation, authenticated multi-user roles and enterprise SOC integrations remain outside this local prototype.

## Objective and boundaries

Build a usable local OT security investigation workspace that connects anomaly detection, candidate origins, supporting evidence, process effects and operator decisions. Improve the existing Digital Twin and Process Graph as the main investigation surfaces.

Scope is the internal simulator and local Modbus emulator. HAI download/training, physical devices, external network testing, cloud deployment and paid integrations are outside this proposal. LIVE should visibly identify the local emulator and retain read-only monitoring. Existing simulator controls remain clearly separated.

This expands the earlier [implementation roadmap](IMPLEMENTATION_PLAN.md). Existing source and investigation screens and evidence-first copilot behavior are the starting point, not features to rebuild.

## Phase 1: durable evidence and incident workflow

- Introduce immutable incident IDs and source/session IDs that survive simulator resets without collisions.
- Persist incident evidence with event IDs, asset/link IDs, observed and received times, source, units, quality, values and record references. Define retention and bounded queries so local storage remains manageable.
- Separate observations, model inferences, operator notes and action outcomes. Preserve missing data as unavailable.
- Add acknowledgment, investigation status, severity, local analyst notes and a timestamped audit history. Keep operator-assigned severity distinct from model confidence.
- Define shared selected incident, asset and replay time across graph, twin, timeline, investigation and copilot.

Acceptance: restart/reset does not overwrite incidents; changing source cannot mix evidence; each displayed conclusion links to evidence or explicitly says inferred/unknown. Record actual workflow transitions and response results.

## Phase 2: Digital Twin and Process Graph redesign

Use the labels **Digital Twin** and **Process Graph**, with brief explanations. Both views use the same selected asset, incident and time.

- Click an asset to open a consistent inspector: identity, role, reading with unit, freshness, quality, candidate rank, evidence and connected assets. Show physical/simulator truth only where available and label its source.
- Add asset search, stage/type/status filters and upstream/downstream focus. Preserve selection when switching views.
- Improve staged layout, spacing, edge routing, arrow direction and group headings. Handle feedback loops and dense layouts without hiding relationships.
- Separate physical process links, control/communication links, learned relationships and inferred incident propagation. Only expose layers backed by data. A physical connection does not establish a network intrusion route.
- Provide fit, zoom, reset focus and fullscreen controls; add an overview/minimap where it helps larger graphs. Support narrow screens without clipped controls or unreadable forced zoom.
- Pair status colors with labels/icons. Keep neutral assets visually quiet, make the selected asset obvious and use consistent meanings across themes.
- Distinguish routine flow from inferred attack propagation. Pause motion on stale data and respect reduced-motion preferences.
- Synchronize the evidence timeline and replay cursor. Clearly display historical time, current source status and unavailable values.
- Add an incident progression strip based on recorded events: detected, origin ranked, response requested, accepted/rejected, verified and recovered. Omit unavailable stages; do not invent a completion percentage.

Acceptance: selecting an asset exposes its evidence in both views; replay changes readings and highlighting consistently; unknown origins and uncertain edges remain visibly uncertain. Verify desktop and narrow layouts, keyboard operation, dark/light themes, stale states and larger topologies.

## Phase 3: focused SOC screens

- **Overview / Alerts:** active incidents, severity, age, acknowledgment, source health and actionable navigation. Add search and filters; show empty/loading/error states and data freshness.
- **Investigations:** extend the existing page with evidence chronology, alternative origins, related alerts, notes, response checklist and exportable evidence references. Correlation rules must explain why alerts were grouped.
- **Assets / Health:** inventory, stage, protocol/register mapping, last observation, data quality and coverage gaps. Reuse the asset inspector rather than duplicating details.
- Keep **Sources**, **Metrics** and **Settings** focused. Use navigation that scales without adding every feature to the top bar.

Acceptance: an analyst can move from an alert to an asset, inspect evidence, record a decision and revisit it after restart. Metrics distinguish detector results, operational source health and analyst workflow. Local analyst labels are not represented as authenticated identities.

## Phase 4: local channel and integrity attribution

- Instrument paired emulator/connector observations and protocol events. Introduce a loopback-only test proxy for controlled alteration, delay and loss scenarios.
- Extend localization contracts to support channel candidates, with source/receiver comparison and explicit unresolved cases when paired evidence is missing.
- Add emulated controller configuration/firmware manifests, approved baselines and change history. Distinguish approved maintenance from unexplained changes.
- Show communication evidence and integrity details as layers/tabs within the existing investigation workspace.

Acceptance: reproducible scenarios distinguish sensor changes, channel alterations and emulated configuration changes when evidence supports the distinction. Benign delay, maintenance and missing observations must not automatically become attacks. Manifest hashes do not constitute real PLC attestation.

## Phase 5: copilot and validation

- Give the copilot read-only access to the selected incident's bounded evidence, asset history and local runbooks; attach resolvable event references to factual claims.
- Present observations, hypotheses, alternatives, missing evidence and suggested checks separately. Support questions such as “why this origin?”, “what changed first?” and “what evidence would distinguish these candidates?”
- Add request timeout/cancellation, clear provider failure states and resource limits. Keep advice useful without an external model.
- Keep response actions explicit, mode-restricted and audited. Requested/accepted actions must not be reported as verified containment.
- Validate sensor, controller, actuator, channel and emulated integrity scenarios alongside benign faults, slow ramps, multiple origins, noise, stale data, reconnects and topology errors.
- Report detection delay, localization delay, origin-category confusion, top-k accuracy, unknown rate and confidence reliability separately for SIM and emulator. Use held-out scenarios/seeds and prevent ground-truth leakage into localization inputs.

Acceptance: cited evidence resolves to the correct incident/source/time; unsupported questions produce a useful unknown response; simulated action success requires observed confirmation. Existing detector tests pass, and new tests cover persistence, evidence contracts, attribution and shared UI context. Visual verification is required when browser access is available; source review alone is not a visual sign-off.

## Delivery order and approval

Implement phases 1 through 5 in order. Begin visible graph improvements alongside phase 1, but connect advanced evidence layers only after their data contracts exist. Deliver each phase as a reviewable increment with validation results and remaining limitations.

Recommended approval: the full five-phase local-only scope. Authentication/RBAC, enterprise log ingestion, ticketing integrations and production deployment require a separate plan if the project later becomes a shared operational service.
