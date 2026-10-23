# Graph Report - Attacktrace  (2026-10-23)

## Corpus Check
- 396 files · ~1,130,491 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 59 file(s) not represented in the graph (top: (none) 22, .pt 12, .log 10)

## Summary
- 2933 nodes · 9226 edges · 129 communities (98 shown, 31 thin omitted)
- Extraction: 90% EXTRACTED · 10% INFERRED · 0% AMBIGUOUS · INFERRED: 920 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `0e60a2f7`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- numpy
- test_eval_baseline.py
- Actual held-out results from this installation
- GraphView.tsx
- GraphView.tsx
- numpy
- robustness.py
- types.ts
- BaselineDetector
- deploy.py
- Timeline.tsx
- IncidentPanel.tsx
- theme.ts
- voice.py
- TopBar.tsx
- ReadOnlyClient
- live.ts
- react
- .start
- Rest
- main.py
- app/engine.py
- CopilotChatResponse
- Write
- Api
- Socstore
- eval/hai.py
- Grounding
- Robustness
- gateway/package.json
- hai_fixture.py
- PlantEmulator
- verify_ai_models.py
- schemas.py
- copilot.py
- pipeline.py
- Report
- Authentication
- reconstruct
- RateLimiter
- lab.py
- json
- test_startup.py
- Package
- classify_language
- train.py
- types.ts
- .step_sample
- test_emulator.py
- Security
- AttackTrace UI and navigation repair — 16 October 2026
- LIVE calibration fix and next implementation plan
- Devdependencies
- incident.render.test.ts
- test_detect.py
- models.py
- test_live_connectors.py
- Compileroptions
- a8_sustainability.py
- Engine
- test_gateway.py
- Scenario
- ReadOnlyModbus
- localize/incident.py
- MetricsPage.tsx
- Plant
- AttackTrace_Slides.md
- Private-server release plan — 16 October 2026
- LiveRuntime
- test_copilot.py
- demo_trials.py
- Screenshots
- TagMap
- active_runtime
- Dependencies
- live_voice.py
- ProcessWorkspace.tsx
- load_detector
- test_sim.py
- firebase.ts
- _windows
- Screenshots
- AI Pilot · Signal Room design plan
- Scripts
- Package
- Test
- Vercel
- Test
- server.py
- test_authentication.py
- pytest
- Voicecaptureprocessor
- AttackTrace AI Pilot model registry and verification
- Attacktrace
- Incident evidence delivery — 15 October 2026
- AttackTrace: proposed SOC and Twin/Graph enhancement plan
- AttackEngine
- AttackSpec
- VOICE_ASSISTANT.md
- Presenter cheat sheet (one page)
- AttackTrace
- record
- FakeClient
- Demo script (3 minutes)
- QA_Prep.md
- sys
- index.js
- python-dependency-audit.json
- Settings

## God Nodes (most connected - your core abstractions)
1. `Engine` - 142 edges
2. `Settings` - 107 edges
3. `LiveRuntime` - 70 edges
4. `BaselineDetector` - 63 edges
5. `create_app()` - 62 edges
6. `Scenario` - 59 edges
7. `LiveSource` - 59 edges
8. `useLive` - 57 edges
9. `PlantEmulator` - 56 edges
10. `load_live()` - 54 edges

## Surprising Connections (you probably didn't know these)
- `4. Authentication, Authorization & Security Flow` --references--> `RateLimiter`  [INFERRED]
  ARCHIFY_ARCHITECTURE_MAP.md → backend/app/api/security.py
- `⚡ Layer 2: API & Gateway` --references--> `create_app()`  [INFERRED]
  ARCHIFY_ARCHITECTURE_MAP.md → backend/app/main.py
- `⚡ Layer 2: API & Gateway (FastAPI + Cloudflare Workers)` --references--> `create_app()`  [INFERRED]
  README.md → backend/app/main.py
- `Actual held-out results from this installation` --references--> `speed()`  [INFERRED]
  docs/HAI_REPLAY.md → backend/tests/test_hai.py
- `3.10 LIVE ingestion: a real industrial protocol` --references--> `live()`  [INFERRED]
  submission/AttackTrace_Documentation.md → backend/app/api/ws.py

## Import Cycles
- None detected.

## Communities (129 total, 31 thin omitted)

### Community 0 - "numpy"
Cohesion: 0.09
Nodes (33): static_graph(), break_ties(), causal_term(), combine_onsets(), deviation_term(), first_crossings(), localize(), onset_term() (+25 more)

### Community 1 - "test_eval_baseline.py"
Cohesion: 0.26
Nodes (7): baseline_rank(), evaluate_baseline_localization(), fitted(), test_baseline_saved_before_names_existed_still_works(), test_missed_attacks_count_as_misses(), test_rank_breaks_ties_by_larger_deviation(), test_rank_puts_the_first_breaching_node_first()

### Community 3 - "GraphView.tsx"
Cohesion: 0.07
Nodes (43): edgeDelay(), edgeId(), layoutEdges(), MIN_LEARNED_WEIGHT, visibleEdges(), filterAssets(), FocusDirection, graphLinks() (+35 more)

### Community 4 - "GraphView.tsx"
Cohesion: 0.09
Nodes (41): Pump(), PumpProps, Tank(), TankProps, Valve(), ValveProps, Equipment(), Props (+33 more)

### Community 5 - "numpy"
Cohesion: 0.08
Nodes (19): aggregate(), alert_mask(), best_threshold(), rising_edges(), sustained(), split_tests(), _Open, hai_forward() (+11 more)

### Community 6 - "robustness.py"
Cohesion: 0.10
Nodes (8): NoOverlay, Overlay, _clip(), Impact, PlantParams, _time_to(), NodeSpec, BenignOverlay

### Community 7 - "types.ts"
Cohesion: 0.06
Nodes (67): Access, AccessContext, useAccess(), IsolateButton(), IncidentEvidencePanel(), detail, LabStatus, LocalLab() (+59 more)

### Community 8 - "BaselineDetector"
Cohesion: 0.15
Nodes (14): BaselineDetector, Loaded, SourceNotReadyError, engine(), make_live(), test_attack_endpoint_writes_to_the_emulator_and_reveals_ground_truth(), test_demo_mode_off_blocks_live_attack_before_the_attacker_is_ever_called(), make_live() (+6 more)

### Community 9 - "deploy.py"
Cohesion: 0.18
Nodes (9): check_identity(), DeploymentError, main(), prepare_storage(), validate(), configured(), test_private_entrypoint_rejects_unsigned_emulator(), test_storage_requires_mount_and_preserves_journal_and_models() (+1 more)

### Community 10 - "Timeline.tsx"
Cohesion: 0.12
Nodes (33): App(), Center(), ViewToggle(), TopBar(), useFreshness(), useLiveSourcePoll(), BackendConnectionBanner(), IncidentToast() (+25 more)

### Community 11 - "IncidentPanel.tsx"
Cohesion: 0.18
Nodes (22): EmptyState(), Panel(), PanelProps, AttackConsole(), HaiReplayPanel(), offset(), MagnitudeField(), NodeScores() (+14 more)

### Community 12 - "theme.ts"
Cohesion: 0.26
Nodes (8): ThemeSwitcher(), applyTheme(), getInitialTheme(), ThemeId, ThemeMeta, THEMES, ThemeState, useTheme

### Community 13 - "voice.py"
Cohesion: 0.13
Nodes (13): _is_loopback(), limit_attacks(), require_demo(), require_key(), capabilities(), _interaction(), _key(), _limit() (+5 more)

### Community 14 - "TopBar.tsx"
Cohesion: 0.09
Nodes (23): CalibratingState(), html(), MODES, ModeToggle(), Props, html(), ProgressRing(), SourcePill() (+15 more)

### Community 15 - "ReadOnlyClient"
Cohesion: 0.12
Nodes (3): ModbusPoller, ReadOnlyClient, SlowClient

### Community 16 - "live.ts"
Cohesion: 0.17
Nodes (16): StatusPill(), STYLE, latencyMs(), PILL_LABEL, pillKind, LiveMessage, BACKOFF_BASE_MS, BACKOFF_MAX_MS (+8 more)

### Community 17 - "react"
Cohesion: 0.06
Nodes (70): MetricsPage, Root(), Route(), SocPage, VoiceSettingsPage, WorkspaceLoading(), WorkspacePage, SOURCE_NAMES (+62 more)

### Community 18 - ".start"
Cohesion: 0.11
Nodes (8): LabProxy, evaluate(), emu(), free_port(), test_attack_refused_while_live_is_calibrating(), test_proxy_real_modbus_pairing_and_rejects_writes(), emulator_runtime(), free_port()

### Community 19 - "Rest"
Cohesion: 0.16
Nodes (20): control_hai_replay(), _engine(), get_hai_replay(), get_incident_report(), get_incidents(), get_live_health(), get_metrics(), get_status() (+12 more)

### Community 21 - "main.py"
Cohesion: 0.07
Nodes (30): HaiData, node_kind(), hai_models_ready(), load_hai_baseline(), load_hai_detector(), HaiEngine, build_hai_engine(), client() (+22 more)

### Community 22 - "app/engine.py"
Cohesion: 0.11
Nodes (4): _Open, origin_candidate(), AlertInfo, GroundTruthInfo

### Community 23 - "CopilotChatResponse"
Cohesion: 0.36
Nodes (4): bounded_chat(), CopilotChatResponse, test_timed_out_provider_keeps_capacity_until_worker_finishes(), chat()

### Community 24 - "Write"
Cohesion: 0.09
Nodes (21): get_settings(), analyze(), main(), analyze(), main(), analyze(), main(), _pct() (+13 more)

### Community 25 - "Api"
Cohesion: 0.18
Nodes (11): client(), test_attack_validation(), test_incidents_and_reset(), test_live_loop_survives_a_failing_tick(), test_metrics(), test_metrics_merges_live_metrics_without_touching_the_file(), test_status_and_mode(), test_topology() (+3 more)

### Community 26 - "Socstore"
Cohesion: 0.17
Nodes (22): digest(), loaded_context(), runtime_context(), LiveMessage, SocStore, message(), test_api_export_and_archived_copilot_use_original_capture(), test_capture_integrity_failure_never_returns_modified_payload() (+14 more)

### Community 27 - "eval/hai.py"
Cohesion: 0.07
Nodes (24): hai_paths(), HaiFile, load_hai(), load_hai_replay(), process_of(), _read(), _read_csv(), HaiLoaded (+16 more)

### Community 28 - "Grounding"
Cohesion: 0.19
Nodes (21): _build_context_summary(), CopilotEngine, incident_evidence_summary(), _offline_expert_reply(), CopilotTurn, Incident, incident(), snapshot() (+13 more)

### Community 29 - "Robustness"
Cohesion: 0.19
Nodes (16): assess_calibration(), Case, evaluate_case(), fit_calibration(), observations(), probability(), reliability(), run() (+8 more)

### Community 30 - "gateway/package.json"
Cohesion: 0.08
Nodes (20): devDependencies, miniflare, engines, node, name, overrides, sharp, undici (+12 more)

### Community 31 - "hai_fixture.py"
Cohesion: 0.22
Nodes (5): hai_dir(), hai_models(), make_dataset(), _signals(), _write()

### Community 32 - "PlantEmulator"
Cohesion: 0.14
Nodes (11): client_for(), read_values(), run_ticks(), test_clients_cannot_write_process_values(), test_force_registers_start_at_no_override(), test_freeze_holds_the_reading_and_release_resumes_it(), test_ground_truth_is_recorded_from_the_registers(), test_registers_track_the_model() (+3 more)

### Community 34 - "verify_ai_models.py"
Cohesion: 0.13
Nodes (12): classify_failure(), _retry_after(), _status_code(), gemini_key(), _get_gemini_key(), local_checks(), _audio(), _interaction() (+4 more)

### Community 35 - "schemas.py"
Cohesion: 0.12
Nodes (16): topology_of(), AttackResponse, CopilotChatRequest, IsolateRequest, IsolateResponse, ModeRequest, NodeState, OriginCandidate (+8 more)

### Community 37 - "copilot.py"
Cohesion: 0.12
Nodes (12): get_copilot_engine(), get_suggestions(), post_chat(), assess_layers(), evidence_priority(), suggestions(), free_port(), port() (+4 more)

### Community 38 - "pipeline.py"
Cohesion: 0.07
Nodes (25): fit_err_sd(), build_model(), GDN, make_windows(), MLPForecaster, Norm, train(), train_hai() (+17 more)

### Community 39 - "Report"
Cohesion: 0.09
Nodes (20): worst_impact(), _eta(), render_report(), para(), _utc(), ascii_text(), _escape(), Page (+12 more)

### Community 40 - "Authentication"
Cohesion: 0.14
Nodes (15): check_origin(), config(), firebase_app(), identity(), logout(), me(), names(), protect() (+7 more)

### Community 41 - "reconstruct"
Cohesion: 0.20
Nodes (7): _cost(), hop_distance(), PathNode, Propagation, reconstruct(), _shortest(), test_path_orders_same_sample_onsets_cause_first()

### Community 42 - "RateLimiter"
Cohesion: 0.17
Nodes (11): 1. Five-Layer Architecture Map, 2. Layer-by-Layer Breakdown & Source Evidence, 3. End-to-End User Workflows, 4. Authentication, Authorization & Security Flow, AttackTrace: Full Interactive Architecture Map, 🌐 Interactive Visualization Artifacts, 🎨 Layer 1: Frontend, ⚡ Layer 2: API & Gateway (+3 more)

### Community 43 - "lab.py"
Cohesion: 0.26
Nodes (11): configure(), emulator_info(), exclusive(), integrity(), ManifestChange, observe_integrity(), probe(), proxy() (+3 more)

### Community 44 - "json"
Cohesion: 0.05
Nodes (44): asset_registers(), baseline_comparison(), capture(), detail(), evidence(), export(), journal(), progress() (+36 more)

### Community 45 - "test_startup.py"
Cohesion: 0.24
Nodes (7): ensure_metrics(), safe_ensure_metrics(), test_a_failing_metrics_step_never_stops_startup(), test_existing_metrics_are_never_overwritten(), test_first_start_writes_metrics_once(), fake(), test_metrics_missing_the_hai_section_are_refreshed_once_data_appears()

### Community 46 - "Package"
Cohesion: 0.08
Nodes (26): name, overrides, @grpc/grpc-js, private, type, version, root, autoprefixer (+18 more)

### Community 47 - "classify_language"
Cohesion: 0.13
Nodes (15): classify_language(), detect_unsupported_script(), has_tamil_characters(), is_self_echo(), LanguageClassification, sanitize_response_text(), tokenize_words(), gemini_to_browser() (+7 more)

### Community 48 - "train.py"
Cohesion: 0.07
Nodes (37): load_baseline(), load_detector(), load_graph(), LiveEngine, live_dir(), live_models_ready(), main(), build_engine() (+29 more)

### Community 49 - "types.ts"
Cohesion: 0.13
Nodes (20): Props, ImpactMeters(), Meter(), tone(), etaUrgency(), formatEta(), parsePilotAction(), PilotAction (+12 more)

### Community 50 - ".step_sample"
Cohesion: 0.17
Nodes (14): _has_hazard(), AttackRequest, run(), test_attack_produces_localized_incident(), test_clean_run_raises_no_incident(), test_detector_is_warm_before_the_first_message(), test_incident_closes_after_attack_ends(), test_incident_reports_the_ambiguity_flag() (+6 more)

### Community 51 - "test_emulator.py"
Cohesion: 0.13
Nodes (16): load_tagmap(), TagMapError, emu(), free_port(), mutate(), raw_map(), test_a_rogue_setpoint_moves_the_plant(), test_a_sensor_offset_fools_the_controller() (+8 more)

### Community 52 - "Security"
Cohesion: 0.11
Nodes (20): RateLimiter, create_app(), test_sim_and_hai_attack_paths_are_unaffected(), test_voice_rejects_wrong_demo_key_before_gemini(), test_validation_route_missing_invalid_and_changed_model(), client(), make_client(), test_a_configured_key_still_works_regardless_of_host() (+12 more)

### Community 53 - "AttackTrace UI and navigation repair — 16 October 2026"
Cohesion: 0.12
Nodes (14): Acceptance and reporting, Additional constraints from the six user screenshots, AttackTrace UI and navigation repair — 16 October 2026, Design direction, Implementation order, Intended operator flow, Observed problems, Accessibility and journey follow-up (+6 more)

### Community 54 - "LIVE calibration fix and next implementation plan"
Cohesion: 0.09
Nodes (19): Baseline comparison, Calibration, evidence and UI follow-up — 15 October 2026, Delivered, Remaining validation, Verification, Follow-up delivery status, Implemented, LIVE calibration fix and next implementation plan (+11 more)

### Community 55 - "Devdependencies"
Cohesion: 0.11
Nodes (19): devDependencies, autoprefixer, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, @playwright/test (+11 more)

### Community 56 - "incident.render.test.ts"
Cohesion: 0.06
Nodes (44): missing(), BreakdownBar(), BreakdownLegend(), f2(), SEGMENTS, html(), three, top (+36 more)

### Community 57 - "test_detect.py"
Cohesion: 0.16
Nodes (11): simulate(), ForecastDetector, residuals(), predict(), run_detection(), test_actuator_attack_scores_above_clean(), test_baseline_flags_large_offset(), test_make_windows_alignment() (+3 more)

### Community 58 - "models.py"
Cohesion: 0.24
Nodes (8): Failure, ModelRouter, test_live_greeting_states_only_observed_status(), test_model_pool_rejects_cross_modality(), test_preferred_model_fails_over_after_rate_limit(), test_quota_and_unsupported_are_retryable_but_auth_and_safety_are_not(), test_repeated_rate_limits_back_off_without_crossing_capability_pools(), test_retry_after_is_respected()

### Community 59 - "test_live_connectors.py"
Cohesion: 0.07
Nodes (29): Aligner, Sample, excluded_from_ranking(), QualityTracker, TagSpec, _Track, LiveSource, _pct() (+21 more)

### Community 60 - "Compileroptions"
Cohesion: 0.11
Nodes (17): compilerOptions, isolatedModules, jsx, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch (+9 more)

### Community 61 - "a8_sustainability.py"
Cohesion: 0.13
Nodes (13): analyze(), _impact_with_vs_without(), _inference_timing(), main(), _model_stats(), _pct(), _peak_rss_over_simulated_run(), Arm (+5 more)

### Community 62 - "Engine"
Cohesion: 0.21
Nodes (12): Engine, client(), opened(), step_until(), test_isolate_endpoint(), test_isolate_is_409_in_hai_mode_and_needs_the_key(), test_isolating_a_wrong_node_never_contains(), test_isolating_the_true_origin_contains_the_incident() (+4 more)

### Community 63 - "test_gateway.py"
Cohesion: 0.11
Nodes (6): GatewayBoundary, gateway_app(), test_direct_origin_denied_even_for_auth_config_and_docs(), test_gateway_secret_does_not_replace_firebase_identity(), test_local_mode_is_unchanged_without_an_origin_secret(), test_stream_requires_gateway_secret_before_upgrade()

### Community 65 - "ReadOnlyModbus"
Cohesion: 0.16
Nodes (5): bounded(), ReadError, ReadOnlyModbus, slow_factory(), test_a_silent_server_times_out_instead_of_hanging()

### Community 66 - "localize/incident.py"
Cohesion: 0.16
Nodes (11): is_ambiguous(), action_for(), explain(), Explanation, signature(), Incident, Candidate, NodeType (+3 more)

### Community 67 - "MetricsPage.tsx"
Cohesion: 0.07
Nodes (49): BaselineComparison(), Report, Result, chartOption(), getChartColors(), MetricsChart(), Card(), Cards() (+41 more)

### Community 68 - "Plant"
Cohesion: 0.28
Nodes (9): main(), Plant, test_attack_ends_after_duration(), test_freeze_does_not_leak_across_reset(), test_large_offset_creates_overflow_risk(), test_sensor_freeze_holds_reported_value(), test_sensor_ramp_drifts_linearly(), test_clean_run_stays_in_band() (+1 more)

### Community 69 - "AttackTrace_Slides.md"
Cohesion: 0.15
Nodes (12): Approach, Architecture, AttackTrace, Detect → Locate → Contain, Limitations, Live demo, Results: real HAI data, Results: real protocol (LIVE) (+4 more)

### Community 70 - "Private-server release plan — 16 October 2026"
Cohesion: 0.06
Nodes (28): Copilot polish and private-server foundation — 16 October 2026, Implemented, Validation and current limits, Activate the selected ADC method, Credentials and access, Deployment and verification still required, Firebase private-server setup — 16 October 2026, What the implementation enforces (+20 more)

### Community 72 - "LiveRuntime"
Cohesion: 0.08
Nodes (28): LiveRuntime, IncidentStore, CalibrationInfo, test_restart_resumes_rows_and_marks_a_gap(), FakeClock, feed(), collect(), drive() (+20 more)

### Community 73 - "test_copilot.py"
Cohesion: 0.31
Nodes (6): client(), test_copilot_chat(), test_copilot_suggestions(), test_no_active_incident_has_no_action(), test_unknown_requested_incident_returns_404(), test_virtual_sensor_isolation()

### Community 74 - "demo_trials.py"
Cohesion: 0.28
Nodes (11): build_report(), main(), pair_key(), _pick_primary_backup(), _rank(), run_live(), run_sim(), run_sim_trial() (+3 more)

### Community 75 - "Screenshots"
Cohesion: 0.35
Nodes (10): ambiguousShot(), { chromium }, errors, haiIncident(), log, require, shot(), simViews() (+2 more)

### Community 76 - "TagMap"
Cohesion: 0.09
Nodes (7): alter_response(), frame(), decode(), encode(), Tag, TagMap, test_encoding_round_trips()

### Community 77 - "active_runtime"
Cohesion: 0.13
Nodes (5): Hub, live(), run_loop(), active_runtime(), Runtime

### Community 78 - "Dependencies"
Cohesion: 0.17
Nodes (12): dependencies, echarts, echarts-for-react, firebase, @fontsource/inter, @fontsource/jetbrains-mono, framer-motion, lucide-react (+4 more)

### Community 79 - "live_voice.py"
Cohesion: 0.15
Nodes (9): _authenticate(), connect_model(), live_voice(), opening_prompt(), process_snapshot(), session_config(), test_live_extended_thinking_has_required_configuration(), test_voice_session_config_enforces_en_ta_transcription() (+1 more)

### Community 80 - "ProcessWorkspace.tsx"
Cohesion: 0.20
Nodes (13): Message, AssetInspector(), EvidenceList(), formatCategory(), IncidentProgress(), ResponseEvent, GraphView, ProcessWorkspace() (+5 more)

### Community 81 - "load_detector"
Cohesion: 0.12
Nodes (22): attack_run(), Run, sample_attack(), build_incident(), Weights, Row, rows(), summarize() (+14 more)

### Community 82 - "test_sim.py"
Cohesion: 0.18
Nodes (9): PID, test_clean_state_reported_tracks_truth(), test_cli_prints_30s(), test_determinism_same_seed(), test_different_seed_differs(), test_pid_clamps_and_antiwindup(), test_reset_reproduces(), test_signals_vary_under_normal_operation() (+1 more)

### Community 85 - "Screenshots"
Cohesion: 0.24
Nodes (8): { chromium }, errors, liveViews(), log, require, shot(), SIZES, sleep()

### Community 86 - "AI Pilot · Signal Room design plan"
Cohesion: 0.33
Nodes (5): AI Pilot · Signal Room design plan, Design references, Implementation flow, Master idea, Reusable implementation prompt

### Community 87 - "Scripts"
Cohesion: 0.25
Nodes (8): scripts, build, dev, e2e, lint, preview, test, typecheck

### Community 88 - "Package"
Cohesion: 0.46
Nodes (4): collect(), main(), scan(), wanted()

### Community 90 - "Vercel"
Cohesion: 0.29
Nodes (6): buildCommand, framework, headers, outputDirectory, rewrites, $schema

### Community 91 - "Test"
Cohesion: 0.33
Nodes (4): css, spec, postcss, @tailwindcss/postcss

### Community 92 - "server.py"
Cohesion: 0.12
Nodes (4): main(), Controls, RegisterOverlay, TruthEvent

### Community 93 - "test_authentication.py"
Cohesion: 0.22
Nodes (10): headers(), login(), secured(), test_analyst_decisions_record_verified_actor(), test_login_cookie_membership_and_csrf(), test_logout_invalidates_copied_cookie_and_stream(), test_missing_server_credentials_fail_closed(), test_repeated_signins_have_distinct_server_sessions() (+2 more)

### Community 94 - "pytest"
Cohesion: 0.08
Nodes (31): allowed_hosts(), AllowlistError, check_host(), is_loopback(), main(), parse_args(), run(), AttackerClient (+23 more)

### Community 96 - "AttackTrace AI Pilot model registry and verification"
Cohesion: 0.50
Nodes (3): AI Pilot's jobs and exact system instructions, AttackTrace AI Pilot model registry and verification, Configuration and verification

### Community 108 - "Incident evidence delivery — 15 October 2026"
Cohesion: 0.22
Nodes (7): Incident evidence delivery — 15 October 2026, Investigation and Copilot, Measured harder tests, Next research priority, Preserved evidence, Verification, Incident evidence implementation plan

### Community 109 - "AttackTrace: proposed SOC and Twin/Graph enhancement plan"
Cohesion: 0.06
Nodes (28): AttackTrace implementation plan, Build order, Data modes, Milestone 1 — trustworthy assistance and investigation UI, Milestone 2 — explicit evidence records and uncertainty, Milestone 3 — local communication-channel attribution, Milestone 4 — emulated firmware/configuration integrity, Milestone 5 — validation and response workflow (+20 more)

### Community 111 - "AttackEngine"
Cohesion: 0.17
Nodes (4): _Active, AttackEngine, _fmt_eta(), test_ground_truth_recorded()

### Community 112 - "AttackSpec"
Cohesion: 0.30
Nodes (9): AttackSpec, _pair(), _run(), test_actuator_force_pump_off_stops_flow(), test_actuator_force_valve_open_wastes_energy(), test_attack_is_deterministic(), test_invalid_specs_rejected(), test_rogue_setpoint_moves_level() (+1 more)

### Community 114 - "Presenter cheat sheet (one page)"
Cohesion: 0.29
Nodes (6): Click path (SIM), Fast facts if asked, Headline numbers (say the n, not just the %), If LIVE fails mid-demo, If Top-1 is wrong, Presenter cheat sheet (one page)

### Community 115 - "AttackTrace"
Cohesion: 0.07
Nodes (26): 🏛 5-Layer System Architecture (Graphify Mapped), AttackTrace, 📊 Benchmark & Evaluation Results, 🔄 End-to-End Incident Lifecycle, 🗺 Graphify Codebase Navigation, 🎮 Interactive Live Demo Script, 🎨 Layer 1: Frontend (React 19 + TypeScript + Vite), ⚡ Layer 2: API & Gateway (FastAPI + Cloudflare Workers) (+18 more)

### Community 116 - "record"
Cohesion: 0.28
Nodes (4): Snapshot, LiveRecorder, record(), test_recording_stops_growing_when_full()

### Community 117 - "FakeClient"
Cohesion: 0.29
Nodes (7): FakeClient, poller(), test_a_partial_read_failure_keeps_the_other_tags(), test_backoff_grows_is_capped_and_resets(), test_reads_are_batched_by_contiguous_block(), test_requests_in_flight_are_bounded(), test_the_connection_is_dropped_and_retried_after_total_failure()

### Community 118 - "Demo script (3 minutes)"
Cohesion: 0.40
Nodes (4): Before you go on stage (5 minutes ahead), Demo script (3 minutes), Fallback path, Run sheet

### Community 127 - "index.js"
Cohesion: 0.70
Nodes (4): error(), fetch(), handle(), origin()

### Community 137 - "Settings"
Cohesion: 0.09
Nodes (16): Settings, read_checkpoint(), source_fingerprint(), write_checkpoint(), LiveConfig, LiveConfigError, load_live(), build_live_runtime() (+8 more)

## Knowledge Gaps
- **11 isolated node(s):** `attacktrace`, `echarts`, `echarts-for-react`, `@types/node`, `@types/react` (+6 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 933 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **31 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `3.10 LIVE ingestion: a real industrial protocol` connect `incident.render.test.ts` to `PlantEmulator`, `Plant`, `active_runtime`?**
  _High betweenness centrality (0.309) - this node is a cross-community bridge._
- **Are the 97 inferred relationships involving `Engine` (e.g. with `🧠 Layer 3: Services & Detection Engine` and `_engine()`) actually correct?**
  _`Engine` has 97 INFERRED edges - model-reasoned connections that need verification._
- **What connects `attacktrace`, `echarts`, `echarts-for-react` to the rest of the system?**
  _11 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `numpy` be split into smaller, more focused modules?**
  _Cohesion score 0.08646616541353383 - nodes in this community are weakly interconnected._
- **Are the 33 inferred relationships involving `Settings` (e.g. with `prepare_storage()` and `validate()`) actually correct?**
  _`Settings` has 33 INFERRED edges - model-reasoned connections that need verification._
- **Should `GraphView.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07207792207792207 - nodes in this community are weakly interconnected._
- **Are the 24 inferred relationships involving `LiveRuntime` (e.g. with `🧠 Layer 3: Services & Detection Engine` and `post_chat()`) actually correct?**
  _`LiveRuntime` has 24 INFERRED edges - model-reasoned connections that need verification._