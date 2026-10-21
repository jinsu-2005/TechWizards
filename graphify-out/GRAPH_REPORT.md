# Graph Report - Attacktrace  (2026-10-21)

## Corpus Check
- 355 files · ~758,960 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 39 file(s) not represented in the graph (top: (none) 22, .log 8, .css 2)

## Summary
- 2756 nodes · 8775 edges · 130 communities (99 shown, 31 thin omitted)
- Extraction: 90% EXTRACTED · 10% INFERRED · 0% AMBIGUOUS · INFERRED: 897 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `97530337`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Plant
- test_report.py
- types.ts
- HaiEngine
- Engine
- GraphView.tsx
- test_live_runtime.py
- test_hai.py
- train.py
- preflight.py
- PlantEmulator
- pipeline.py
- numpy
- geometry.ts
- merge_write
- MetricsPage.tsx
- pytest
- evaluate
- LiveRuntime
- app/engine.py
- eval/hai.py
- capture_live_screenshots.mjs
- Timeline.tsx
- run_isolation
- useLive
- security.py
- create_app
- argparse
- test_emulator.py
- test_security.py
- Incident
- numpy
- Settings
- IsolateButton.tsx
- schemas.py
- LiveMessage
- attacks/__init__.py
- package.json
- modbus.py
- ReadOnlyClient
- server.py
- Settings
- tagmap.py
- CopilotDrawer.tsx
- incident.render.test.ts
- metrics.ts
- deploy.py
- robustness.py
- devDependencies
- types.ts
- compilerOptions
- json
- gateway/package.json
- test_live_connectors.py
- soc.py
- source.py
- demo_trials.py
- format.ts
- pathlib
- LiveSource
- CopilotEngine
- sim/__init__.py
- active_runtime
- live/runtime.py
- dependencies
- scripts
- authentication.py
- attacktrace
- test_gateway.py
- copilot.py
- main.py
- lab.py
- test_authentication.py
- RobustnessPanel.tsx
- test_isolate.py
- AttackTrace UI and navigation repair — 16 October 2026
- AttackSpec
- LIVE calibration fix and next implementation plan
- AttackTrace_Slides.md
- 2. Layer-by-Layer Breakdown & Source Evidence
- Vercel + Render deployment package — 16 October 2026
- AuthGate.tsx
- test_eval_baseline.py
- COPILOT_PRIVATE_FOUNDATION_DELIVERY.md
- capture_screenshots.mjs
- run_all.py
- test_copilot.py
- Private-server release plan — 16 October 2026
- AttackTrace visual review — 15 October 2026
- AttackTrace
- CopilotChatResponse
- AttackEngine
- Incident evidence delivery — 15 October 2026
- AttackTrace: proposed SOC and Twin/Graph enhancement plan
- AttackTrace implementation plan
- package.py
- README.md
- @playwright/test
- vercel.json
- Presenter cheat sheet (one page)
- Third-party resources
- load_hai_baseline
- PID
- Local investigation checklist
- tokens.test.ts
- process_of
- emulator_runtime
- SIM stress study — 15 October 2026
- Demo script (3 minutes)
- firebase.ts
- QA_Prep.md

## God Nodes (most connected - your core abstractions)
1. `Engine` - 139 edges
2. `Settings` - 105 edges
3. `LiveRuntime` - 69 edges
4. `BaselineDetector` - 63 edges
5. `Scenario` - 59 edges
6. `LiveSource` - 59 edges
7. `create_app()` - 58 edges
8. `PlantEmulator` - 56 edges
9. `load_live()` - 54 edges
10. `useLive` - 52 edges

## Surprising Connections (you probably didn't know these)
- `4. Authentication, Authorization & Security Flow` --references--> `RateLimiter`  [INFERRED]
  ARCHIFY_ARCHITECTURE_MAP.md → backend/app/api/security.py
- `⚡ Layer 2: API & Gateway` --references--> `create_app()`  [INFERRED]
  ARCHIFY_ARCHITECTURE_MAP.md → backend/app/main.py
- `3.10 LIVE ingestion: a real industrial protocol` --references--> `live()`  [INFERRED]
  submission/AttackTrace_Documentation.md → backend/app/api/ws.py
- `🧠 Layer 3: Services & Detection Engine` --references--> `Engine`  [INFERRED]
  ARCHIFY_ARCHITECTURE_MAP.md → backend/app/engine.py
- `🧠 Layer 3: Services & Detection Engine` --references--> `HaiEngine`  [INFERRED]
  ARCHIFY_ARCHITECTURE_MAP.md → backend/app/engine_hai.py

## Import Cycles
- None detected.

## Communities (130 total, 31 thin omitted)

### Community 0 - "Plant"
Cohesion: 0.18
Nodes (16): main(), Plant, test_attack_ends_after_duration(), test_freeze_does_not_leak_across_reset(), test_large_offset_creates_overflow_risk(), test_sensor_freeze_holds_reported_value(), test_sensor_ramp_drifts_linearly(), test_clean_run_stays_in_band() (+8 more)

### Community 1 - "test_report.py"
Cohesion: 0.09
Nodes (20): worst_impact(), _eta(), render_report(), para(), _utc(), ascii_text(), _escape(), Page (+12 more)

### Community 2 - "types.ts"
Cohesion: 0.10
Nodes (30): SOURCE_NAMES, TopBar(), narrated, useLiveStream(), MODES, ModeToggle(), Props, html() (+22 more)

### Community 3 - "HaiEngine"
Cohesion: 0.14
Nodes (8): HaiEngine, _Open, origin_candidate(), OriginCandidate, test_dataset_attack_becomes_an_incident_without_invented_labels(), test_replay_starts_before_the_first_attack_and_follows_the_speed(), test_reset_restarts_the_replay_and_the_replay_loops(), test_slow_speed_carries_fractions()

### Community 4 - "Engine"
Cohesion: 0.12
Nodes (20): Engine, _has_hazard(), AttackRequest, _peak_rss_over_simulated_run(), _open_incident(), test_incidents_and_reset(), run(), test_attack_produces_localized_incident() (+12 more)

### Community 5 - "GraphView.tsx"
Cohesion: 0.08
Nodes (37): ThemeSwitcher(), edgeDelay(), edgeId(), layoutEdges(), MIN_LEARNED_WEIGHT, visibleEdges(), filterAssets(), FocusDirection (+29 more)

### Community 6 - "test_live_runtime.py"
Cohesion: 0.08
Nodes (37): BaselineDetector, Loaded, LiveEngine, SourceNotReadyError, engine(), make_live(), FakeClock, feed() (+29 more)

### Community 7 - "test_hai.py"
Cohesion: 0.13
Nodes (19): HaiData, process_scores(), client(), data(), hai_engine(), test_detector_metrics_on_a_known_alert_pattern(), test_hai_mode_is_refused_without_data_or_models(), test_hai_playback_controls_pause_without_consuming_rows() (+11 more)

### Community 8 - "train.py"
Cohesion: 0.06
Nodes (26): node_kind(), fit_err_sd(), ForecastDetector, residuals(), build_model(), GDN, make_windows(), MLPForecaster (+18 more)

### Community 9 - "preflight.py"
Cohesion: 0.16
Nodes (15): click_path(), main(), post(), wait_healthy(), check(), check_backend_health(), check_console_errors(), check_emulator() (+7 more)

### Community 10 - "PlantEmulator"
Cohesion: 0.09
Nodes (16): LabProxy, evaluate(), emu(), free_port(), test_attack_endpoint_writes_to_the_emulator_and_reveals_ground_truth(), test_attack_refused_while_live_is_calibrating(), test_demo_mode_off_blocks_live_attack_before_the_attacker_is_ever_called(), emu() (+8 more)

### Community 11 - "pipeline.py"
Cohesion: 0.06
Nodes (45): _from_env(), get_settings(), attack_run(), Run, simulate(), split_tests(), load_baseline(), load_detector() (+37 more)

### Community 12 - "numpy"
Cohesion: 0.13
Nodes (16): aggregate(), alert_mask(), best_threshold(), rising_edges(), sustained(), best_f1(), main(), score() (+8 more)

### Community 13 - "geometry.ts"
Cohesion: 0.07
Nodes (56): GraphNode, PlantNode, PlantNodeData, PlantNodeView(), PulseEdgeData, PulseEdgeT, PulseEdgeView(), StageData (+48 more)

### Community 14 - "merge_write"
Cohesion: 0.16
Nodes (13): analyze(), main(), analyze(), main(), analyze(), main(), _pct(), analyze() (+5 more)

### Community 15 - "MetricsPage.tsx"
Cohesion: 0.09
Nodes (29): CalibratingState(), html(), ProgressRing(), SourcePill(), STYLE, base, html(), answerSections() (+21 more)

### Community 16 - "pytest"
Cohesion: 0.07
Nodes (43): allowed_hosts(), AllowlistError, check_host(), is_loopback(), main(), parse_args(), run(), AttackerClient (+35 more)

### Community 17 - "evaluate"
Cohesion: 0.33
Nodes (3): Counts, evaluate(), _onsets()

### Community 18 - "LiveRuntime"
Cohesion: 0.07
Nodes (8): LiveAttackLauncher, LiveRuntime, Snapshot, LiveRecorder, record(), lifespan(), test_restart_resumes_rows_and_marks_a_gap(), test_recording_stops_growing_when_full()

### Community 19 - "app/engine.py"
Cohesion: 0.05
Nodes (48): is_ambiguous(), static_graph(), build_incident(), Incident, break_ties(), Candidate, causal_term(), combine_onsets() (+40 more)

### Community 20 - "eval/hai.py"
Cohesion: 0.19
Nodes (14): HaiFile, HaiLoaded, baseline_rank_nodes(), evaluate_detector(), evaluate_localization(), _first_alert(), _prf(), rank_nodes() (+6 more)

### Community 21 - "capture_live_screenshots.mjs"
Cohesion: 0.24
Nodes (8): { chromium }, errors, liveViews(), log, require, shot(), SIZES, sleep()

### Community 22 - "Timeline.tsx"
Cohesion: 0.12
Nodes (29): useFreshness(), Btn(), ReplayControls(), Props, Sparkline(), pctX(), Timeline(), usePlayback() (+21 more)

### Community 23 - "run_isolation"
Cohesion: 0.32
Nodes (6): _impact_with_vs_without(), Arm, _isolate(), run_isolation(), _spec(), _summary()

### Community 24 - "useLive"
Cohesion: 0.11
Nodes (42): App(), Center(), ViewToggle(), EmptyState(), IncidentToast(), NoticeToast(), Panel(), PanelProps (+34 more)

### Community 25 - "security.py"
Cohesion: 0.12
Nodes (11): _is_loopback(), limit_attacks(), require_demo(), require_key(), capabilities(), _key(), _limit(), SpeechRequest (+3 more)

### Community 26 - "create_app"
Cohesion: 0.20
Nodes (10): client(), test_attack_validation(), test_live_loop_survives_a_failing_tick(), test_metrics(), test_metrics_merges_live_metrics_without_touching_the_file(), test_status_and_mode(), test_topology(), test_ws_reconnect_is_safe() (+2 more)

### Community 28 - "test_emulator.py"
Cohesion: 0.14
Nodes (20): load_tagmap(), TagMapError, client_for(), mutate(), raw_map(), read_values(), run_ticks(), test_a_rogue_setpoint_moves_the_plant() (+12 more)

### Community 29 - "test_security.py"
Cohesion: 0.15
Nodes (18): RateLimiter, create_app(), test_sim_and_hai_attack_paths_are_unaffected(), client(), make_client(), test_a_configured_key_still_works_regardless_of_host(), test_attack_endpoint_is_rate_limited(), test_demo_mode_off_blocks_attacks_only() (+10 more)

### Community 32 - "numpy"
Cohesion: 0.18
Nodes (7): learn_granger_edges(), learn_var_edges(), merge_graph(), test_adjacency_lists_parents(), test_granger_finds_lagged_cause(), test_merge_keeps_static_and_downweights_learned(), test_static_graph_matches_pid()

### Community 33 - "Settings"
Cohesion: 0.13
Nodes (20): Settings, live_dir(), live_models_ready(), build_engine(), check_emulator_down(), check_out_of_range(), check_slow_network(), _free_port() (+12 more)

### Community 34 - "IsolateButton.tsx"
Cohesion: 0.25
Nodes (14): IsolateButton(), postIsolate(), isActive(), advance(), begin(), candidateFor(), disabledReason(), IDLE (+6 more)

### Community 35 - "schemas.py"
Cohesion: 0.08
Nodes (36): control_hai_replay(), _engine(), get_hai_replay(), get_incident_report(), get_incidents(), get_live_health(), get_metrics(), get_status() (+28 more)

### Community 36 - "LiveMessage"
Cohesion: 0.21
Nodes (21): runtime_context(), LiveMessage, NodeState, SocStore, message(), test_api_export_and_archived_copilot_use_original_capture(), test_capture_integrity_failure_never_returns_modified_payload(), test_capture_is_immutable_survives_reopen_and_telemetry_rotation() (+13 more)

### Community 37 - "attacks/__init__.py"
Cohesion: 0.11
Nodes (10): _Active, GroundTruth, action_for(), explain(), Explanation, signature(), _fmt_eta(), NodeSpec (+2 more)

### Community 38 - "package.json"
Cohesion: 0.09
Nodes (24): name, overrides, @grpc/grpc-js, private, type, version, autoprefixer, echarts (+16 more)

### Community 39 - "modbus.py"
Cohesion: 0.17
Nodes (4): bounded(), ReadError, ReadOnlyModbus, test_a_silent_server_times_out_instead_of_hanging()

### Community 40 - "ReadOnlyClient"
Cohesion: 0.07
Nodes (5): ModbusPoller, ReadOnlyClient, TagMap, slow_factory(), SlowClient

### Community 41 - "server.py"
Cohesion: 0.15
Nodes (3): Controls, RegisterOverlay, load()

### Community 42 - "Settings"
Cohesion: 0.24
Nodes (7): ensure_metrics(), safe_ensure_metrics(), test_a_failing_metrics_step_never_stops_startup(), test_existing_metrics_are_never_overwritten(), test_first_start_writes_metrics_once(), fake(), test_metrics_missing_the_hai_section_are_refreshed_once_data_appears()

### Community 43 - "tagmap.py"
Cohesion: 0.13
Nodes (8): alter_response(), frame(), decode(), encode(), Tag, free_port(), test_encoding_round_trips(), test_proxy_rejects_transaction_mismatch()

### Community 44 - "CopilotDrawer.tsx"
Cohesion: 0.10
Nodes (41): MetricsPage, Root(), Route(), SocPage, VoiceSettingsPage, WorkspaceLoading(), WorkspacePage, pages (+33 more)

### Community 45 - "incident.render.test.ts"
Cohesion: 0.06
Nodes (42): BreakdownBar(), BreakdownLegend(), f2(), SEGMENTS, html(), three, top, w (+34 more)

### Community 46 - "metrics.ts"
Cohesion: 0.17
Nodes (21): chartOption(), getChartColors(), AmbiguityMetrics, BarRow, detector(), DetectorMetrics, haiDetector(), HaiDetectorMetrics (+13 more)

### Community 47 - "deploy.py"
Cohesion: 0.11
Nodes (15): check_identity(), DeploymentError, main(), prepare_storage(), validate(), configured(), test_private_entrypoint_rejects_unsigned_emulator(), test_storage_requires_mount_and_preserves_journal_and_models() (+7 more)

### Community 48 - "robustness.py"
Cohesion: 0.14
Nodes (18): sample_attack(), assess_calibration(), BenignOverlay, Case, fit_calibration(), observations(), probability(), reliability() (+10 more)

### Community 49 - "devDependencies"
Cohesion: 0.11
Nodes (19): devDependencies, autoprefixer, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, @playwright/test (+11 more)

### Community 50 - "types.ts"
Cohesion: 0.08
Nodes (45): useLiveSourcePoll(), useAccess(), Message, AssetInspector(), EvidenceList(), IncidentEvidencePanel(), detail, LabStatus (+37 more)

### Community 51 - "compilerOptions"
Cohesion: 0.11
Nodes (17): compilerOptions, isolatedModules, jsx, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch (+9 more)

### Community 52 - "json"
Cohesion: 0.19
Nodes (15): asset_registers(), baseline_comparison(), capture(), detail(), evidence(), export(), journal(), progress() (+7 more)

### Community 53 - "gateway/package.json"
Cohesion: 0.08
Nodes (20): devDependencies, miniflare, engines, node, name, overrides, sharp, undici (+12 more)

### Community 54 - "test_live_connectors.py"
Cohesion: 0.12
Nodes (20): excluded_from_ranking(), FakeClient, poller(), source_with_samples(), test_a_corrupt_value_is_out_of_range_not_a_false_origin_input(), test_a_partial_read_failure_keeps_the_other_tags(), test_backoff_grows_is_capped_and_resets(), test_default_config_is_valid() (+12 more)

### Community 55 - "soc.py"
Cohesion: 0.14
Nodes (7): digest(), loaded_context(), make_dataset(), _signals(), _write(), get_json(), main()

### Community 56 - "source.py"
Cohesion: 0.09
Nodes (10): Aligner, Sample, QualityTracker, TagSpec, _Track, _pct(), SourceStatus, TagHealth (+2 more)

### Community 57 - "demo_trials.py"
Cohesion: 0.28
Nodes (11): build_report(), main(), pair_key(), _pick_primary_backup(), _rank(), run_live(), run_sim(), run_sim_trial() (+3 more)

### Community 58 - "format.ts"
Cohesion: 0.13
Nodes (17): Props, ImpactMeters(), Meter(), tone(), etaUrgency(), formatEta(), isSpoofed(), plain() (+9 more)

### Community 59 - "pathlib"
Cohesion: 0.11
Nodes (4): test_backup_includes_committed_wal_and_closes_output(), test_backup_refuses_to_replace_existing_data(), TruthEvent, backup()

### Community 60 - "LiveSource"
Cohesion: 0.35
Nodes (8): LiveSource, build_state(), free_port(), settings(), test_connection_refused_is_down_not_a_crash(), test_source_not_ready_until_every_node_was_read(), test_the_source_reconnects_after_the_server_restarts(), test_end_to_end_with_the_emulator()

### Community 62 - "CopilotEngine"
Cohesion: 0.18
Nodes (17): _build_context_summary(), CopilotEngine, _get_gemini_key(), incident_evidence_summary(), local_checks(), _offline_expert_reply(), CopilotTurn, incident() (+9 more)

### Community 63 - "sim/__init__.py"
Cohesion: 0.11
Nodes (6): NoOverlay, Overlay, _clip(), Impact, PlantParams, _time_to()

### Community 64 - "active_runtime"
Cohesion: 0.13
Nodes (5): Hub, live(), run_loop(), active_runtime(), Runtime

### Community 65 - "live/runtime.py"
Cohesion: 0.10
Nodes (15): read_checkpoint(), source_fingerprint(), write_checkpoint(), LiveConfig, LiveConfigError, load_live(), build_live_runtime(), IncidentStore (+7 more)

### Community 66 - "dependencies"
Cohesion: 0.17
Nodes (12): dependencies, echarts, echarts-for-react, firebase, @fontsource/inter, @fontsource/jetbrains-mono, framer-motion, lucide-react (+4 more)

### Community 67 - "scripts"
Cohesion: 0.25
Nodes (8): scripts, build, dev, e2e, lint, preview, test, typecheck

### Community 68 - "authentication.py"
Cohesion: 0.19
Nodes (13): check_origin(), config(), firebase_app(), identity(), logout(), me(), names(), protect() (+5 more)

### Community 80 - "test_gateway.py"
Cohesion: 0.11
Nodes (6): GatewayBoundary, gateway_app(), test_direct_origin_denied_even_for_auth_config_and_docs(), test_gateway_secret_does_not_replace_firebase_identity(), test_local_mode_is_unchanged_without_an_origin_secret(), test_stream_requires_gateway_secret_before_upgrade()

### Community 81 - "copilot.py"
Cohesion: 0.16
Nodes (9): get_copilot_engine(), get_suggestions(), post_chat(), assess_layers(), evidence_priority(), suggestions(), test_channel_evidence_rules(), test_integrity_requires_observation_and_separate_approval() (+1 more)

### Community 82 - "main.py"
Cohesion: 0.16
Nodes (6): hai_paths(), load_hai(), _read(), _read_csv(), hai_models_ready(), build_hai_engine()

### Community 83 - "lab.py"
Cohesion: 0.26
Nodes (11): configure(), emulator_info(), exclusive(), integrity(), ManifestChange, observe_integrity(), probe(), proxy() (+3 more)

### Community 84 - "test_authentication.py"
Cohesion: 0.18
Nodes (12): headers(), login(), secured(), test_analyst_decisions_record_verified_actor(), test_login_cookie_membership_and_csrf(), test_logout_invalidates_copied_cookie_and_stream(), test_missing_server_credentials_fail_closed(), missing() (+4 more)

### Community 85 - "RobustnessPanel.tsx"
Cohesion: 0.25
Nodes (14): percent(), ReliabilityTable(), RobustnessPanel(), score(), seconds(), finite(), nullable(), numbers() (+6 more)

### Community 86 - "test_isolate.py"
Cohesion: 0.22
Nodes (9): client(), opened(), step_until(), test_isolate_endpoint(), test_isolate_is_409_in_hai_mode_and_needs_the_key(), test_isolating_a_wrong_node_never_contains(), test_isolating_the_true_origin_contains_the_incident(), test_refusals() (+1 more)

### Community 87 - "AttackTrace UI and navigation repair — 16 October 2026"
Cohesion: 0.12
Nodes (14): Acceptance and reporting, Additional constraints from the six user screenshots, AttackTrace UI and navigation repair — 16 October 2026, Design direction, Implementation order, Intended operator flow, Observed problems, Accessibility and journey follow-up (+6 more)

### Community 88 - "AttackSpec"
Cohesion: 0.30
Nodes (9): AttackSpec, _pair(), _run(), test_actuator_force_pump_off_stops_flow(), test_actuator_force_valve_open_wastes_energy(), test_attack_is_deterministic(), test_invalid_specs_rejected(), test_rogue_setpoint_moves_level() (+1 more)

### Community 89 - "LIVE calibration fix and next implementation plan"
Cohesion: 0.15
Nodes (11): Baseline comparison, Calibration, evidence and UI follow-up — 15 October 2026, Delivered, Remaining validation, Verification, Follow-up delivery status, Implemented, LIVE calibration fix and next implementation plan (+3 more)

### Community 90 - "AttackTrace_Slides.md"
Cohesion: 0.15
Nodes (12): Approach, Architecture, AttackTrace, Detect → Locate → Contain, Limitations, Live demo, Results: real HAI data, Results: real protocol (LIVE) (+4 more)

### Community 91 - "2. Layer-by-Layer Breakdown & Source Evidence"
Cohesion: 0.17
Nodes (11): 1. Five-Layer Architecture Map, 2. Layer-by-Layer Breakdown & Source Evidence, 3. End-to-End User Workflows, 4. Authentication, Authorization & Security Flow, AttackTrace: Full Interactive Architecture Map, 🌐 Interactive Visualization Artifacts, 🎨 Layer 1: Frontend, ⚡ Layer 2: API & Gateway (+3 more)

### Community 92 - "Vercel + Render deployment package — 16 October 2026"
Cohesion: 0.17
Nodes (10): Documentation checked, Hosting direction — 16 October 2026, Recommendation, Work before publishing a split deployment, Current state, Deployment sequence, Persistent paths and backup, Routing and access (+2 more)

### Community 93 - "AuthGate.tsx"
Cohesion: 0.27
Nodes (6): Access, AccessContext, AuthGate(), Principal, csrfHeaders(), root

### Community 94 - "test_eval_baseline.py"
Cohesion: 0.29
Nodes (6): baseline_rank(), fitted(), test_baseline_saved_before_names_existed_still_works(), test_missed_attacks_count_as_misses(), test_rank_breaks_ties_by_larger_deviation(), test_rank_puts_the_first_breaching_node_first()

### Community 95 - "COPILOT_PRIVATE_FOUNDATION_DELIVERY.md"
Cohesion: 0.18
Nodes (8): Copilot polish and private-server foundation — 16 October 2026, Implemented, Validation and current limits, Activate the selected ADC method, Credentials and access, Deployment and verification still required, Firebase private-server setup — 16 October 2026, What the implementation enforces

### Community 96 - "capture_screenshots.mjs"
Cohesion: 0.35
Nodes (10): ambiguousShot(), { chromium }, errors, haiIncident(), log, require, shot(), simViews() (+2 more)

### Community 98 - "test_copilot.py"
Cohesion: 0.31
Nodes (6): client(), test_copilot_chat(), test_copilot_suggestions(), test_no_active_incident_has_no_action(), test_unknown_requested_incident_returns_404(), test_virtual_sensor_isolation()

### Community 99 - "Private-server release plan — 16 October 2026"
Cohesion: 0.20
Nodes (10): Current assessment, Detection research track — separate from interface readiness, Execution order and definition of done, Phase 1 — Copilot polish and urgent persistence, Phase 2 — Consistent interface across the workspace, Phase 3 — Authenticated users and server-side authorization, Phase 4 — Shared monitoring and durable storage, Phase 5 — Copilot and service reliability (+2 more)

### Community 100 - "AttackTrace visual review — 15 October 2026"
Cohesion: 0.20
Nodes (8): Comparison decisions, Final generation prompt, Generated UI reference, AttackTrace visual review — 15 October 2026, Findings and implemented changes, Generated reference versus actual UI, Remaining scope, Verification

### Community 101 - "AttackTrace"
Cohesion: 0.20
Nodes (10): Architecture, AttackTrace, Demo script, Investigation workspace and local-first roadmap, Licence, Limitations, Quick start, Results (+2 more)

### Community 102 - "CopilotChatResponse"
Cohesion: 0.36
Nodes (4): bounded_chat(), CopilotChatResponse, test_timed_out_provider_keeps_capacity_until_worker_finishes(), chat()

### Community 104 - "Incident evidence delivery — 15 October 2026"
Cohesion: 0.22
Nodes (7): Incident evidence delivery — 15 October 2026, Investigation and Copilot, Measured harder tests, Next research priority, Preserved evidence, Verification, Incident evidence implementation plan

### Community 105 - "AttackTrace: proposed SOC and Twin/Graph enhancement plan"
Cohesion: 0.22
Nodes (9): AttackTrace: proposed SOC and Twin/Graph enhancement plan, Delivery notes, Delivery order and approval, Objective and boundaries, Phase 1: durable evidence and incident workflow, Phase 2: Digital Twin and Process Graph redesign, Phase 3: focused SOC screens, Phase 4: local channel and integrity attribution (+1 more)

### Community 106 - "AttackTrace implementation plan"
Cohesion: 0.25
Nodes (8): AttackTrace implementation plan, Build order, Data modes, Milestone 1 — trustworthy assistance and investigation UI, Milestone 2 — explicit evidence records and uncertainty, Milestone 3 — local communication-channel attribution, Milestone 4 — emulated firmware/configuration integrity, Milestone 5 — validation and response workflow

### Community 107 - "package.py"
Cohesion: 0.46
Nodes (4): collect(), main(), scan(), wanted()

### Community 110 - "vercel.json"
Cohesion: 0.29
Nodes (6): buildCommand, framework, headers, outputDirectory, rewrites, $schema

### Community 111 - "Presenter cheat sheet (one page)"
Cohesion: 0.29
Nodes (6): Click path (SIM), Fast facts if asked, Headline numbers (say the n, not just the %), If LIVE fails mid-demo, If Top-1 is wrong, Presenter cheat sheet (one page)

### Community 112 - "Third-party resources"
Cohesion: 0.29
Nodes (6): Backend (Python 3.11), Dataset, External services, fonts and reference data, Frontend (Node 22), HAI licence terms (re-read 2026-10-08 from https://github.com/icsdataset/hai, `README.md`), Third-party resources

### Community 113 - "load_hai_baseline"
Cohesion: 0.40
Nodes (5): load_hai_baseline(), test_speed_is_clamped_to_the_supported_range(), speed(), Actual held-out results from this installation, HAI replay installation and controls

### Community 115 - "Local investigation checklist"
Cohesion: 0.33
Nodes (6): Communication channel, Compare origins, Controller configuration integrity, Local investigation checklist, Response, Validation

### Community 116 - "tokens.test.ts"
Cohesion: 0.33
Nodes (4): css, spec, postcss, @tailwindcss/postcss

### Community 119 - "SIM stress study — 15 October 2026"
Cohesion: 0.40
Nodes (5): Calibration decision, Findings, Next implementation priorities, Protocol, SIM stress study — 15 October 2026

### Community 120 - "Demo script (3 minutes)"
Cohesion: 0.40
Nodes (4): Before you go on stage (5 minutes ahead), Demo script (3 minutes), Fallback path, Run sheet

## Knowledge Gaps
- **11 isolated node(s):** `attacktrace`, `echarts`, `echarts-for-react`, `@types/node`, `@types/react` (+6 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 867 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **31 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `3. Method` connect `incident.render.test.ts` to `test_authentication.py`?**
  _High betweenness centrality (0.305) - this node is a cross-community bridge._
- **Are the 95 inferred relationships involving `Engine` (e.g. with `🧠 Layer 3: Services & Detection Engine` and `_engine()`) actually correct?**
  _`Engine` has 95 INFERRED edges - model-reasoned connections that need verification._
- **What connects `attacktrace`, `echarts`, `echarts-for-react` to the rest of the system?**
  _11 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `test_report.py` be split into smaller, more focused modules?**
  _Cohesion score 0.0898989898989899 - nodes in this community are weakly interconnected._
- **Why does `3.10 LIVE ingestion: a real industrial protocol` connect `test_authentication.py` to `active_runtime`, `Plant`, `test_emulator.py`, `incident.render.test.ts`?**
  _High betweenness centrality (0.301) - this node is a cross-community bridge._
- **Are the 33 inferred relationships involving `Settings` (e.g. with `prepare_storage()` and `validate()`) actually correct?**
  _`Settings` has 33 INFERRED edges - model-reasoned connections that need verification._
- **Should `types.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.09878048780487805 - nodes in this community are weakly interconnected._