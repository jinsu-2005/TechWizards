# Graph Report - Attacktrace  (2026-10-21)

## Corpus Check
- 389 files · ~881,153 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 58 file(s) not represented in the graph (top: (none) 22, .pt 12, .log 8)

## Summary
- 2879 nodes · 9036 edges · 128 communities (97 shown, 31 thin omitted)
- Extraction: 90% EXTRACTED · 10% INFERRED · 0% AMBIGUOUS · INFERRED: 914 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `206bef5f`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- numpy
- BaselineDetector
- json
- GraphView.tsx
- TagMap
- live_voice.py
- AttackSpec
- Api
- load_detector
- deploy.py
- test_isolate.py
- useLive
- react
- PlantEmulator
- app/config.py
- ModbusPoller
- TopBar.tsx
- CopilotDrawer.tsx
- copilot.py
- Rest
- Attacker
- test_hai.py
- schemas.py
- test_lab_attribution.py
- Write
- Api
- Socstore
- eval/hai.py
- Grounding
- Robustness
- Package
- Live
- test_emulator.py
- react
- RobustnessPanel.tsx
- time
- LiveSource
- verify_ai_models.py
- time
- Report
- Authentication
- app/engine.py
- RateLimiter
- lab.py
- Investigation
- Settings
- Package
- geometry.ts
- live_soak.py
- AttackConsole.tsx
- .step_sample
- test_live_connectors.py
- Security
- AttackTrace UI and navigation repair — 16 October 2026
- LIVE calibration fix and next implementation plan
- Devdependencies
- IncidentPanel.tsx
- voice.py
- graph/__init__.py
- Aligner
- Compileroptions
- test_authentication.py
- models.py
- test_gateway.py
- test_report.py
- AttackTrace: Documentation
- Isolate
- metrics.ts
- 3. Method
- AttackTrace_Slides.md
- Private-server release plan — 16 October 2026
- test_live_runtime.py
- test_copilot.py
- demo_trials.py
- Screenshots
- evaluate
- pathlib
- Dependencies
- RegisterOverlay
- security.py
- Loaded
- 5. Results
- firebase.ts
- Screenshots
- AI Pilot · Signal Room design plan
- Scripts
- Package
- Test
- Vercel
- Test
- main.tsx
- _windows
- Voicecaptureprocessor
- AttackTrace AI Pilot model registry and verification
- Attacktrace
- Incident evidence delivery — 15 October 2026
- AttackTrace: proposed SOC and Twin/Graph enhancement plan
- secured
- Engine
- VOICE_ASSISTANT.md
- Presenter cheat sheet (one page)
- AttackTrace
- Demo script (3 minutes)
- QA_Prep.md
- argparse
- index.js
- python-dependency-audit.json

## God Nodes (most connected - your core abstractions)
1. `Engine` - 141 edges
2. `Settings` - 107 edges
3. `LiveRuntime` - 69 edges
4. `BaselineDetector` - 63 edges
5. `create_app()` - 60 edges
6. `Scenario` - 59 edges
7. `LiveSource` - 59 edges
8. `PlantEmulator` - 56 edges
9. `load_live()` - 54 edges
10. `useLive` - 51 edges

## Surprising Connections (you probably didn't know these)
- `4. Authentication, Authorization & Security Flow` --references--> `RateLimiter`  [INFERRED]
  ARCHIFY_ARCHITECTURE_MAP.md → backend/app/api/security.py
- `⚡ Layer 2: API & Gateway` --references--> `create_app()`  [INFERRED]
  ARCHIFY_ARCHITECTURE_MAP.md → backend/app/main.py
- `3.6 Confidence gate` --references--> `Ambiguous()`  [INFERRED]
  submission/AttackTrace_Documentation.md → frontend/src/features/incident/OriginCard.tsx
- `Novelty` --references--> `Ambiguous()`  [INFERRED]
  submission/AttackTrace_Documentation.md → frontend/src/features/incident/OriginCard.tsx
- `3.10 LIVE ingestion: a real industrial protocol` --references--> `live()`  [INFERRED]
  submission/AttackTrace_Documentation.md → backend/app/api/ws.py

## Import Cycles
- None detected.

## Communities (128 total, 31 thin omitted)

### Community 0 - "numpy"
Cohesion: 0.09
Nodes (38): is_ambiguous(), static_graph(), break_ties(), Candidate, causal_term(), combine_onsets(), deviation_term(), first_crossings() (+30 more)

### Community 1 - "BaselineDetector"
Cohesion: 0.12
Nodes (13): simulate(), BaselineDetector, main(), baseline_rank(), evaluate_baseline_localization(), engine(), test_baseline_flags_large_offset(), test_simulate_shape_and_labels() (+5 more)

### Community 2 - "json"
Cohesion: 0.12
Nodes (13): digest(), loaded_context(), read_checkpoint(), source_fingerprint(), write_checkpoint(), test_bad_checkpoint_is_rejected(), test_checkpoint_write_failure_keeps_previous_file(), test_source_contract_changes_with_endpoint_or_register_mapping() (+5 more)

### Community 3 - "GraphView.tsx"
Cohesion: 0.06
Nodes (53): edgeDelay(), edgeId(), layoutEdges(), MIN_LEARNED_WEIGHT, visibleEdges(), filterAssets(), FocusDirection, graphLinks() (+45 more)

### Community 4 - "TagMap"
Cohesion: 0.11
Nodes (3): LiveConfig, Tag, TagMap

### Community 5 - "live_voice.py"
Cohesion: 0.13
Nodes (11): websocket_identity(), _authenticate(), connect_model(), live_voice(), browser_to_gemini(), gemini_to_browser(), opening_prompt(), process_snapshot() (+3 more)

### Community 6 - "AttackSpec"
Cohesion: 0.06
Nodes (37): _Active, AttackEngine, AttackSpec, _fmt_eta(), main(), NoOverlay, Overlay, PID (+29 more)

### Community 7 - "Api"
Cohesion: 0.09
Nodes (41): ProgressRing(), Message, AssetInspector(), EvidenceList(), IncidentEvidencePanel(), detail, LabStatus, LocalLab() (+33 more)

### Community 8 - "load_detector"
Cohesion: 0.22
Nodes (9): load_detector(), analyze(), _impact_with_vs_without(), _inference_timing(), main(), _model_stats(), _pct(), _isolate() (+1 more)

### Community 9 - "deploy.py"
Cohesion: 0.11
Nodes (15): check_identity(), DeploymentError, main(), prepare_storage(), validate(), configured(), test_private_entrypoint_rejects_unsigned_emulator(), test_storage_requires_mount_and_preserves_journal_and_models() (+7 more)

### Community 10 - "test_isolate.py"
Cohesion: 0.21
Nodes (11): client(), opened(), step_until(), test_isolate_endpoint(), test_isolate_is_409_in_hai_mode_and_needs_the_key(), test_isolating_a_wrong_node_never_contains(), test_isolating_the_true_origin_contains_the_incident(), test_isolation_after_the_attack_ended_is_not_credited() (+3 more)

### Community 11 - "useLive"
Cohesion: 0.09
Nodes (45): App(), Center(), ViewToggle(), useFreshness(), IncidentToast(), NoticeToast(), IncidentProgress(), ResponseEvent (+37 more)

### Community 12 - "react"
Cohesion: 0.10
Nodes (29): MetricsPage, Root(), Route(), SocPage, VoiceSettingsPage, WorkspaceLoading(), WorkspacePage, useLiveSourcePoll() (+21 more)

### Community 13 - "PlantEmulator"
Cohesion: 0.08
Nodes (24): emu(), free_port(), test_attack_endpoint_writes_to_the_emulator_and_reveals_ground_truth(), test_attack_refused_while_live_is_calibrating(), test_demo_mode_off_blocks_live_attack_before_the_attacker_is_ever_called(), client_for(), emu(), free_port() (+16 more)

### Community 14 - "app/config.py"
Cohesion: 0.07
Nodes (21): _from_env(), get_settings(), hai_paths(), load_hai(), _read(), _read_csv(), alert_mask(), sustained() (+13 more)

### Community 15 - "ModbusPoller"
Cohesion: 0.12
Nodes (4): ModbusPoller, ReadOnlyClient, slow_factory(), SlowClient

### Community 16 - "TopBar.tsx"
Cohesion: 0.09
Nodes (33): SOURCE_NAMES, TopBar(), narrated, useLiveStream(), MODES, ModeToggle(), Props, html() (+25 more)

### Community 17 - "CopilotDrawer.tsx"
Cohesion: 0.10
Nodes (38): CopilotDrawer(), makeWelcome(), SOURCE_LABELS, groupTranscript(), Line, LiveVoicePanel(), pcm16(), playPcm() (+30 more)

### Community 18 - "copilot.py"
Cohesion: 0.13
Nodes (9): bounded_chat(), get_copilot_engine(), get_suggestions(), post_chat(), assess_layers(), evidence_priority(), CopilotChatResponse, test_timed_out_provider_keeps_capacity_until_worker_finishes() (+1 more)

### Community 19 - "Rest"
Cohesion: 0.14
Nodes (22): control_hai_replay(), _engine(), get_hai_replay(), get_incident_report(), get_incidents(), get_live_health(), get_metrics(), get_status() (+14 more)

### Community 20 - "Attacker"
Cohesion: 0.10
Nodes (28): allowed_hosts(), AllowlistError, check_host(), is_loopback(), AttackerClient, AttackerError, AttackRecord, _neutral() (+20 more)

### Community 21 - "test_hai.py"
Cohesion: 0.05
Nodes (39): HaiData, process_of(), hai_models_ready(), load_hai_baseline(), HaiEngine, _Open, build_hai_engine(), process_scores() (+31 more)

### Community 22 - "schemas.py"
Cohesion: 0.10
Nodes (15): topology_of(), Runtime, AlertInfo, AttackResponse, CalibrationInfo, CopilotChatRequest, IsolateRequest, IsolateResponse (+7 more)

### Community 23 - "test_lab_attribution.py"
Cohesion: 0.11
Nodes (13): alter_response(), frame(), LabProxy, decode(), encode(), evaluate(), free_port(), test_encoding_round_trips() (+5 more)

### Community 24 - "Write"
Cohesion: 0.11
Nodes (15): analyze(), main(), analyze(), main(), analyze(), main(), _pct(), analyze() (+7 more)

### Community 25 - "Api"
Cohesion: 0.19
Nodes (11): client(), test_attack_validation(), test_incidents_and_reset(), test_live_loop_survives_a_failing_tick(), test_metrics(), test_metrics_merges_live_metrics_without_touching_the_file(), test_status_and_mode(), test_topology() (+3 more)

### Community 26 - "Socstore"
Cohesion: 0.21
Nodes (21): runtime_context(), LiveMessage, NodeState, SocStore, message(), test_api_export_and_archived_copilot_use_original_capture(), test_capture_integrity_failure_never_returns_modified_payload(), test_capture_is_immutable_survives_reopen_and_telemetry_rotation() (+13 more)

### Community 27 - "eval/hai.py"
Cohesion: 0.13
Nodes (16): HaiFile, rising_edges(), HaiLoaded, baseline_rank_nodes(), evaluate_detector(), evaluate_localization(), _first_alert(), _prf() (+8 more)

### Community 28 - "Grounding"
Cohesion: 0.12
Nodes (27): origin_candidate(), _build_context_summary(), CopilotEngine, _get_gemini_key(), incident_evidence_summary(), local_checks(), _offline_expert_reply(), suggestions() (+19 more)

### Community 29 - "Robustness"
Cohesion: 0.15
Nodes (18): sample_attack(), assess_calibration(), Case, evaluate_case(), fit_calibration(), probability(), reliability(), run() (+10 more)

### Community 30 - "Package"
Cohesion: 0.08
Nodes (20): devDependencies, miniflare, engines, node, name, overrides, sharp, undici (+12 more)

### Community 31 - "Live"
Cohesion: 0.22
Nodes (11): AttackResult, _false_alarm_per_hour(), LiveEvalState, main(), _pct(), _prf(), _rising_edges(), run() (+3 more)

### Community 32 - "test_emulator.py"
Cohesion: 0.11
Nodes (10): TagMapError, mutate(), raw_map(), test_a_rogue_setpoint_moves_the_plant(), test_a_sensor_offset_fools_the_controller(), test_forcing_a_pump_off_changes_the_plant(), test_invalid_tagmaps_are_rejected(), test_load_reports_readable_errors() (+2 more)

### Community 33 - "react"
Cohesion: 0.09
Nodes (30): CalibratingState(), html(), SourcePill(), STYLE, base, html(), CopilotAnswer(), HypothesisCard() (+22 more)

### Community 34 - "RobustnessPanel.tsx"
Cohesion: 0.25
Nodes (14): percent(), ReliabilityTable(), RobustnessPanel(), score(), seconds(), finite(), nullable(), numbers() (+6 more)

### Community 35 - "time"
Cohesion: 0.25
Nodes (12): click_path(), main(), post(), wait_healthy(), check(), check_backend_health(), check_console_errors(), check_emulator() (+4 more)

### Community 36 - "LiveSource"
Cohesion: 0.07
Nodes (32): LiveEngine, LiveSource, _pct(), Snapshot, SourceNotReadyError, SourceStatus, TagHealth, LiveRecorder (+24 more)

### Community 37 - "verify_ai_models.py"
Cohesion: 0.24
Nodes (7): gemini_key(), _audio(), _interaction(), _live_check(), _result(), _speech_body(), verify()

### Community 38 - "time"
Cohesion: 0.07
Nodes (28): node_kind(), aggregate(), best_threshold(), fit_err_sd(), ForecastDetector, residuals(), build_model(), GDN (+20 more)

### Community 39 - "Report"
Cohesion: 0.16
Nodes (10): _eta(), render_report(), para(), _utc(), ascii_text(), _escape(), Page, text_width() (+2 more)

### Community 40 - "Authentication"
Cohesion: 0.22
Nodes (12): check_origin(), config(), firebase_app(), identity(), logout(), me(), names(), protect() (+4 more)

### Community 41 - "app/engine.py"
Cohesion: 0.06
Nodes (19): GroundTruth, action_for(), explain(), Explanation, signature(), Incident, _cost(), hop_distance() (+11 more)

### Community 42 - "RateLimiter"
Cohesion: 0.17
Nodes (11): 1. Five-Layer Architecture Map, 2. Layer-by-Layer Breakdown & Source Evidence, 3. End-to-End User Workflows, 4. Authentication, Authorization & Security Flow, AttackTrace: Full Interactive Architecture Map, 🌐 Interactive Visualization Artifacts, 🎨 Layer 1: Frontend, ⚡ Layer 2: API & Gateway (+3 more)

### Community 43 - "lab.py"
Cohesion: 0.14
Nodes (14): configure(), emulator_info(), exclusive(), integrity(), ManifestChange, observe_integrity(), probe(), proxy() (+6 more)

### Community 44 - "Investigation"
Cohesion: 0.19
Nodes (15): asset_registers(), baseline_comparison(), capture(), detail(), evidence(), export(), journal(), progress() (+7 more)

### Community 45 - "Settings"
Cohesion: 0.09
Nodes (16): Settings, LiveConfigError, build_live_runtime(), build_engine(), lifespan(), ensure_metrics(), safe_ensure_metrics(), test_bad_config_fails_fast_with_a_clear_message() (+8 more)

### Community 46 - "Package"
Cohesion: 0.09
Nodes (22): name, overrides, @grpc/grpc-js, private, type, version, autoprefixer, echarts (+14 more)

### Community 47 - "geometry.ts"
Cohesion: 0.11
Nodes (32): Pump(), PumpProps, Tank(), TankProps, Valve(), ValveProps, Equipment(), truth() (+24 more)

### Community 48 - "live_soak.py"
Cohesion: 0.11
Nodes (20): load_baseline(), load_live(), live_dir(), live_models_ready(), build_state(), build_engine(), check_emulator_down(), check_out_of_range() (+12 more)

### Community 49 - "AttackConsole.tsx"
Cohesion: 0.13
Nodes (24): Panel(), PanelProps, AttackConsole(), HaiReplayPanel(), offset(), MagnitudeField(), Props, NodeScores() (+16 more)

### Community 50 - ".step_sample"
Cohesion: 0.14
Nodes (19): _has_hazard(), AttackRequest, _peak_rss_over_simulated_run(), _rank(), run_sim_trial(), _open_incident(), run(), test_attack_produces_localized_incident() (+11 more)

### Community 51 - "test_live_connectors.py"
Cohesion: 0.10
Nodes (20): ReadError, excluded_from_ranking(), load_tagmap(), FakeClient, poller(), test_a_corrupt_value_is_out_of_range_not_a_false_origin_input(), test_a_partial_read_failure_keeps_the_other_tags(), test_backoff_grows_is_capped_and_resets() (+12 more)

### Community 52 - "Security"
Cohesion: 0.13
Nodes (19): RateLimiter, create_app(), test_sim_and_hai_attack_paths_are_unaffected(), test_voice_rejects_wrong_demo_key_before_gemini(), client(), make_client(), test_a_configured_key_still_works_regardless_of_host(), test_attack_endpoint_is_rate_limited() (+11 more)

### Community 53 - "AttackTrace UI and navigation repair — 16 October 2026"
Cohesion: 0.12
Nodes (14): Acceptance and reporting, Additional constraints from the six user screenshots, AttackTrace UI and navigation repair — 16 October 2026, Design direction, Implementation order, Intended operator flow, Observed problems, Accessibility and journey follow-up (+6 more)

### Community 54 - "LIVE calibration fix and next implementation plan"
Cohesion: 0.09
Nodes (19): Baseline comparison, Calibration, evidence and UI follow-up — 15 October 2026, Delivered, Remaining validation, Verification, Follow-up delivery status, Implemented, LIVE calibration fix and next implementation plan (+11 more)

### Community 55 - "Devdependencies"
Cohesion: 0.11
Nodes (19): devDependencies, autoprefixer, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, @playwright/test (+11 more)

### Community 56 - "IncidentPanel.tsx"
Cohesion: 0.10
Nodes (34): EmptyState(), BreakdownBar(), BreakdownLegend(), f2(), SEGMENTS, ImpactMeters(), Meter(), tone() (+26 more)

### Community 57 - "voice.py"
Cohesion: 0.21
Nodes (9): capabilities(), _interaction(), _key(), _limit(), _output_audio(), _output_text(), SpeechRequest, synthesize() (+1 more)

### Community 58 - "graph/__init__.py"
Cohesion: 0.12
Nodes (9): learn_granger_edges(), learn_var_edges(), learned_graph(), load_graph(), merge_graph(), test_adjacency_lists_parents(), test_granger_finds_lagged_cause(), test_merge_keeps_static_and_downweights_learned() (+1 more)

### Community 59 - "Aligner"
Cohesion: 0.11
Nodes (7): Aligner, Sample, QualityTracker, TagSpec, _Track, test_aligner_holds_the_last_value_until_max_age(), test_out_of_order_samples_are_dropped_and_counted()

### Community 60 - "Compileroptions"
Cohesion: 0.11
Nodes (17): compilerOptions, isolatedModules, jsx, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch (+9 more)

### Community 61 - "test_authentication.py"
Cohesion: 0.29
Nodes (9): headers(), login(), test_analyst_decisions_record_verified_actor(), test_login_cookie_membership_and_csrf(), test_logout_invalidates_copied_cookie_and_stream(), test_missing_server_credentials_fail_closed(), test_repeated_signins_have_distinct_server_sessions(), test_session_expiry_is_enforced_even_with_cached_identity() (+1 more)

### Community 62 - "models.py"
Cohesion: 0.18
Nodes (11): classify_failure(), Failure, ModelRouter, _retry_after(), _status_code(), test_live_greeting_states_only_observed_status(), test_model_pool_rejects_cross_modality(), test_preferred_model_fails_over_after_rate_limit() (+3 more)

### Community 63 - "test_gateway.py"
Cohesion: 0.21
Nodes (6): GatewayBoundary, gateway_app(), test_direct_origin_denied_even_for_auth_config_and_docs(), test_gateway_secret_does_not_replace_firebase_identity(), test_local_mode_is_unchanged_without_an_origin_secret(), test_stream_requires_gateway_secret_before_upgrade()

### Community 64 - "test_report.py"
Cohesion: 0.16
Nodes (10): worst_impact(), Impact, check_structure(), client(), test_impact_snapshot_keeps_the_worst_values(), test_report_endpoint_returns_a_valid_one_page_pdf(), test_report_is_open_without_a_key(), test_report_shows_the_ambiguous_banner_and_breakdown() (+2 more)

### Community 65 - "AttackTrace: Documentation"
Cohesion: 0.15
Nodes (12): 1. Problem, 2. Solution overview, 4. Data, 6. Novelty, feasibility, scalability, sustainability, 7. Limitations, 8. Ethics and responsible use, 9. Third-party resources, AttackTrace: Documentation (+4 more)

### Community 66 - "Isolate"
Cohesion: 0.26
Nodes (13): IsolateButton(), postIsolate(), advance(), begin(), candidateFor(), disabledReason(), IDLE, IsolateAvailability (+5 more)

### Community 67 - "metrics.ts"
Cohesion: 0.17
Nodes (21): chartOption(), getChartColors(), AmbiguityMetrics, BarRow, detector(), DetectorMetrics, haiDetector(), HaiDetectorMetrics (+13 more)

### Community 68 - "3. Method"
Cohesion: 0.17
Nodes (12): missing(), 3.10 LIVE ingestion: a real industrial protocol, 3.1 Causal graph, 3.2 Detection, 3.3 Localization: three signals, 3.4 Propagation and explanation, 3.5 Incident lifecycle, 3.6 Confidence gate (+4 more)

### Community 69 - "AttackTrace_Slides.md"
Cohesion: 0.15
Nodes (12): Approach, Architecture, AttackTrace, Detect → Locate → Contain, Limitations, Live demo, Results: real HAI data, Results: real protocol (LIVE) (+4 more)

### Community 70 - "Private-server release plan — 16 October 2026"
Cohesion: 0.06
Nodes (28): Copilot polish and private-server foundation — 16 October 2026, Implemented, Validation and current limits, Activate the selected ADC method, Credentials and access, Deployment and verification still required, Firebase private-server setup — 16 October 2026, What the implementation enforces (+20 more)

### Community 72 - "test_live_runtime.py"
Cohesion: 0.06
Nodes (26): Hub, run_loop(), LiveRuntime, IncidentStore, test_restart_resumes_rows_and_marks_a_gap(), collect(), emulator_runtime(), free_port() (+18 more)

### Community 73 - "test_copilot.py"
Cohesion: 0.31
Nodes (6): client(), test_copilot_chat(), test_copilot_suggestions(), test_no_active_incident_has_no_action(), test_unknown_requested_incident_returns_404(), test_virtual_sensor_isolation()

### Community 74 - "demo_trials.py"
Cohesion: 0.31
Nodes (9): build_report(), main(), pair_key(), _pick_primary_backup(), run_live(), run_sim(), _summarize_pair(), TrialResult (+1 more)

### Community 75 - "Screenshots"
Cohesion: 0.27
Nodes (10): ambiguousShot(), { chromium }, errors, haiIncident(), log, require, shot(), simViews() (+2 more)

### Community 76 - "evaluate"
Cohesion: 0.33
Nodes (3): Counts, evaluate(), _onsets()

### Community 77 - "pathlib"
Cohesion: 0.09
Nodes (4): LiveAttackLauncher, test_backup_includes_committed_wal_and_closes_output(), test_backup_refuses_to_replace_existing_data(), backup()

### Community 78 - "Dependencies"
Cohesion: 0.17
Nodes (12): dependencies, echarts, echarts-for-react, firebase, @fontsource/inter, @fontsource/jetbrains-mono, framer-motion, lucide-react (+4 more)

### Community 80 - "security.py"
Cohesion: 0.33
Nodes (4): _is_loopback(), limit_attacks(), require_demo(), require_key()

### Community 81 - "Loaded"
Cohesion: 0.13
Nodes (24): attack_run(), Run, Loaded, _val_runs(), build_incident(), Weights, Row, rows() (+16 more)

### Community 82 - "5. Results"
Cohesion: 0.33
Nodes (6): 5.1 Simulator (50 held-out attacks, 20 clean 5-minute runs), 5.2 Demo rehearsal (15 live runs, `submission/evidence/rehearsal.md`), 5.3 HAI 20.07 (`test1`, 28 attacks, never used for tuning), 5.4 Confidence gate and isolation (`ambiguity` and `isolation` in `metrics.json`), 5.5 LIVE mode: real protocol, emulated plant (`reports/live_metrics.json`, `reports/live_faults.json`), 5. Results

### Community 85 - "Screenshots"
Cohesion: 0.31
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

### Community 92 - "main.tsx"
Cohesion: 0.40
Nodes (3): root, @fontsource/inter, @fontsource/jetbrains-mono

### Community 96 - "AttackTrace AI Pilot model registry and verification"
Cohesion: 0.50
Nodes (3): AI Pilot's jobs and exact system instructions, AttackTrace AI Pilot model registry and verification, Configuration and verification

### Community 108 - "Incident evidence delivery — 15 October 2026"
Cohesion: 0.22
Nodes (7): Incident evidence delivery — 15 October 2026, Investigation and Copilot, Measured harder tests, Next research priority, Preserved evidence, Verification, Incident evidence implementation plan

### Community 109 - "AttackTrace: proposed SOC and Twin/Graph enhancement plan"
Cohesion: 0.06
Nodes (28): AttackTrace implementation plan, Build order, Data modes, Milestone 1 — trustworthy assistance and investigation UI, Milestone 2 — explicit evidence records and uncertainty, Milestone 3 — local communication-channel attribution, Milestone 4 — emulated firmware/configuration integrity, Milestone 5 — validation and response workflow (+20 more)

### Community 112 - "Engine"
Cohesion: 0.11
Nodes (3): Engine, _Open, GroundTruthInfo

### Community 114 - "Presenter cheat sheet (one page)"
Cohesion: 0.29
Nodes (6): Click path (SIM), Fast facts if asked, Headline numbers (say the n, not just the %), If LIVE fails mid-demo, If Top-1 is wrong, Presenter cheat sheet (one page)

### Community 115 - "AttackTrace"
Cohesion: 0.08
Nodes (24): 1. Cyber-Physical Digital Twin & Telemetry Stream, 2. Multi-Signal Detection & Root-Cause Localization, 3. Virtual Sensor Self-Healing, 4. AI Pilot · Signal Room & Gemini Live Voice, 5. Multi-Source Ingestion Modes, 6. Investigation SOC Workspace, 🏛 Architecture, AttackTrace (+16 more)

### Community 118 - "Demo script (3 minutes)"
Cohesion: 0.40
Nodes (4): Before you go on stage (5 minutes ahead), Demo script (3 minutes), Fallback path, Run sheet

### Community 125 - "argparse"
Cohesion: 0.20
Nodes (7): main(), parse_args(), run(), load_attacker(), main(), main(), main()

### Community 127 - "index.js"
Cohesion: 0.70
Nodes (4): error(), fetch(), handle(), origin()

## Knowledge Gaps
- **11 isolated node(s):** `attacktrace`, `echarts`, `echarts-for-react`, `@types/node`, `@types/react` (+6 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 918 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **31 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `3. Method` connect `3. Method` to `AttackTrace: Documentation`?**
  _High betweenness centrality (0.282) - this node is a cross-community bridge._
- **Are the 96 inferred relationships involving `Engine` (e.g. with `🧠 Layer 3: Services & Detection Engine` and `_engine()`) actually correct?**
  _`Engine` has 96 INFERRED edges - model-reasoned connections that need verification._
- **What connects `attacktrace`, `echarts`, `echarts-for-react` to the rest of the system?**
  _11 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `numpy` be split into smaller, more focused modules?**
  _Cohesion score 0.08581349206349206 - nodes in this community are weakly interconnected._
- **Why does `3.10 LIVE ingestion: a real industrial protocol` connect `3. Method` to `Rest`, `PlantEmulator`, `AttackSpec`?**
  _High betweenness centrality (0.281) - this node is a cross-community bridge._
- **Are the 33 inferred relationships involving `Settings` (e.g. with `prepare_storage()` and `validate()`) actually correct?**
  _`Settings` has 33 INFERRED edges - model-reasoned connections that need verification._
- **Should `BaselineDetector` be split into smaller, more focused modules?**
  _Cohesion score 0.12096774193548387 - nodes in this community are weakly interconnected._