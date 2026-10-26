# Graph Report - Attacktrace  (2026-10-26)

## Corpus Check
- 399 files · ~1,141,453 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 57 file(s) not represented in the graph (top: (none) 22, .pt 12, .log 8)

## Summary
- 3020 nodes · 9345 edges · 141 communities (109 shown, 32 thin omitted)
- Extraction: 90% EXTRACTED · 10% INFERRED · 0% AMBIGUOUS · INFERRED: 921 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `624bba0c`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- numpy
- Scenario
- pathlib
- GraphParts.tsx
- IsolateButton.tsx
- app/engine.py
- GraphView.tsx
- types.ts
- test_live_runtime.py
- test_gateway.py
- Timeline.tsx
- useLive
- a8_sustainability.py
- voice.py
- MetricsPage.tsx
- TagMap
- TopBar.tsx
- react
- LiveRuntime
- Rest
- ModbusPoller
- test_hai.py
- pytest
- copilot.py
- Write
- test_api.py
- time
- alert_mask
- Grounding
- robustness.py
- gateway/package.json
- json
- PlantEmulator
- deploy.py
- verify_ai_models.py
- HaiEngine
- security.py
- pipeline.py
- test_report.py
- Authentication
- app/engine.py
- RateLimiter
- lab.py
- argparse
- app/config.py
- Package
- classify_language
- live_soak.py
- AttackConsole.tsx
- Engine
- test_emulator.py
- create_app
- AttackTrace UI and navigation repair — 16 October 2026
- LIVE calibration fix and next implementation plan
- Devdependencies
- incident.render.test.ts
- live.py
- models.py
- LiveSource
- Compileroptions
- test_isolate.py
- Path
- test_startup.py
- AttackRequest
- demo_trials.py
- RobustnessPanel.tsx
- metrics.ts
- 13. Questions and Answers for Reviewers & Judges
- AttackTrace_Slides.md
- Private-server release plan — 16 October 2026
- lifespan
- contextlib
- AttackTrace: Project Explained & Comprehensive Presentation Guide
- Screenshots
- tagmap.py
- test_report.py
- Dependencies
- live_voice.py
- 12. Presentation-Ready Content (PowerPoint Slide Deck)
- AttackSpec
- firebase.ts
- QualityTracker
- Screenshots
- AI Pilot · Signal Room design plan
- Scripts
- builder.py
- Test
- Vercel
- Test
- main.py
- 10. Results and Evaluation
- test_lab_attribution.py
- Voicecaptureprocessor
- AttackTrace AI Pilot model registry and verification
- Attacktrace
- Incident evidence delivery — 15 October 2026
- AttackTrace: proposed SOC and Twin/Graph enhancement plan
- 3. How the Project Works: The Complete Walkthrough
- record
- VOICE_ASSISTANT.md
- Presenter cheat sheet (one page)
- AttackTrace
- 7. AI and Detection Methods
- load_tagmap
- Demo script (3 minutes)
- QA_Prep.md
- 11. Limitations and Future Improvements
- 1. Project Overview
- index.js
- 2. Problem Statement and Objectives
- python-dependency-audit.json
- RegisterOverlay
- theme.ts
- 14. Glossary and References
- 6. Technologies and Their Purpose
- test_copilot.py
- app/runtime.py
- test_live_connectors.py
- package.py
- IncidentStore
- 🔍 Layer-by-Layer Component Breakdown

## God Nodes (most connected - your core abstractions)
1. `Engine` - 142 edges
2. `Settings` - 107 edges
3. `LiveRuntime` - 70 edges
4. `create_app()` - 66 edges
5. `BaselineDetector` - 63 edges
6. `Scenario` - 59 edges
7. `LiveSource` - 59 edges
8. `PlantEmulator` - 59 edges
9. `useLive` - 57 edges
10. `load_live()` - 54 edges

## Surprising Connections (you probably didn't know these)
- `4. Authentication, Authorization & Security Flow` --references--> `RateLimiter`  [INFERRED]
  ARCHIFY_ARCHITECTURE_MAP.md → backend/app/api/security.py
- `2. Fixed Rules, Timing, and Graph Calculations` --references--> `aggregate()`  [INFERRED]
  PROJECT_EXPLAINED.md → backend/app/detect/detector.py
- `⚡ Layer 2: API & Gateway` --references--> `create_app()`  [INFERRED]
  ARCHIFY_ARCHITECTURE_MAP.md → backend/app/main.py
- `⚡ Layer 2: API & Gateway (FastAPI + Cloudflare Workers)` --references--> `create_app()`  [INFERRED]
  README.md → backend/app/main.py
- `3.10 LIVE ingestion: a real industrial protocol` --references--> `live()`  [INFERRED]
  submission/AttackTrace_Documentation.md → backend/app/api/ws.py

## Import Cycles
- None detected.

## Communities (141 total, 32 thin omitted)

### Community 0 - "numpy"
Cohesion: 0.09
Nodes (37): static_graph(), break_ties(), Candidate, causal_term(), combine_onsets(), deviation_term(), first_crossings(), localize() (+29 more)

### Community 1 - "Scenario"
Cohesion: 0.09
Nodes (19): attack_run(), Run, sample_attack(), simulate(), Trained, _val_runs(), main(), Counts (+11 more)

### Community 2 - "pathlib"
Cohesion: 0.13
Nodes (12): click_path(), main(), post(), wait_healthy(), check(), check_backend_health(), check_console_errors(), check_emulator() (+4 more)

### Community 3 - "GraphParts.tsx"
Cohesion: 0.06
Nodes (63): GraphNode, PlantNode, PlantNodeData, PlantNodeView(), PulseEdgeData, PulseEdgeT, PulseEdgeView(), StageData (+55 more)

### Community 4 - "IsolateButton.tsx"
Cohesion: 0.26
Nodes (13): IsolateButton(), postIsolate(), advance(), begin(), candidateFor(), disabledReason(), IDLE, IsolateAvailability (+5 more)

### Community 5 - "app/engine.py"
Cohesion: 0.09
Nodes (20): is_ambiguous(), origin_candidate(), topology_of(), worst_impact(), AlertInfo, AttackResponse, CalibrationInfo, GroundTruthInfo (+12 more)

### Community 6 - "GraphView.tsx"
Cohesion: 0.10
Nodes (31): edgeDelay(), edgeId(), layoutEdges(), MIN_LEARNED_WEIGHT, visibleEdges(), filterAssets(), FocusDirection, graphLinks() (+23 more)

### Community 7 - "types.ts"
Cohesion: 0.07
Nodes (60): MetricsPage, Root(), Route(), SocPage, VoiceSettingsPage, WorkspaceLoading(), WorkspacePage, useLiveSourcePoll() (+52 more)

### Community 8 - "test_live_runtime.py"
Cohesion: 0.11
Nodes (25): BaselineDetector, Loaded, LiveEngine, SourceNotReadyError, engine(), make_live(), test_attack_endpoint_writes_to_the_emulator_and_reveals_ground_truth(), test_demo_mode_off_blocks_live_attack_before_the_attacker_is_ever_called() (+17 more)

### Community 9 - "test_gateway.py"
Cohesion: 0.08
Nodes (16): GatewayBoundary, headers(), login(), secured(), test_analyst_decisions_record_verified_actor(), test_login_cookie_membership_and_csrf(), test_logout_invalidates_copied_cookie_and_stream(), test_missing_server_credentials_fail_closed() (+8 more)

### Community 10 - "Timeline.tsx"
Cohesion: 0.18
Nodes (21): useFreshness(), Btn(), ReplayControls(), Props, Sparkline(), pctX(), Timeline(), usePlayback() (+13 more)

### Community 11 - "useLive"
Cohesion: 0.10
Nodes (39): App(), Center(), ViewToggle(), ResizeHandle, ResizeHandleProps, CONSTRAINTS, DashboardLayoutState, DEFAULT_LAYOUT (+31 more)

### Community 12 - "a8_sustainability.py"
Cohesion: 0.16
Nodes (13): analyze(), _impact_with_vs_without(), _inference_timing(), main(), _model_stats(), _pct(), _peak_rss_over_simulated_run(), Arm (+5 more)

### Community 13 - "voice.py"
Cohesion: 0.21
Nodes (9): capabilities(), _interaction(), _key(), _limit(), _output_audio(), _output_text(), SpeechRequest, synthesize() (+1 more)

### Community 14 - "MetricsPage.tsx"
Cohesion: 0.18
Nodes (15): BaselineComparison(), Report, Result, MetricsChart(), Card(), Cards(), formatUptime(), HaiCards() (+7 more)

### Community 16 - "TopBar.tsx"
Cohesion: 0.05
Nodes (52): SOURCE_NAMES, TopBar(), CalibratingState(), html(), MODES, ModeToggle(), Props, html() (+44 more)

### Community 17 - "react"
Cohesion: 0.07
Nodes (49): CopilotAnswer(), HypothesisCard(), InlineText(), Lines(), ParsedSection, parseSections(), SECTION_ICONS, CopilotDrawer() (+41 more)

### Community 18 - "LiveRuntime"
Cohesion: 0.09
Nodes (9): LiveRuntime, test_restart_resumes_rows_and_marks_a_gap(), emulator_runtime(), free_port(), live_settings(), test_calibrating_has_progress_no_alerts_and_then_runs(), test_calibration_cadence_tolerates_tick_jitter(), test_calibration_reports_quality_blocker_and_recovers() (+1 more)

### Community 19 - "Rest"
Cohesion: 0.12
Nodes (25): control_hai_replay(), _engine(), get_hai_replay(), get_incident_report(), get_incidents(), get_live_health(), get_metrics(), get_status() (+17 more)

### Community 20 - "ModbusPoller"
Cohesion: 0.07
Nodes (7): ModbusPoller, ReadOnlyClient, _pct(), SourceStatus, TagHealth, slow_factory(), SlowClient

### Community 21 - "test_hai.py"
Cohesion: 0.05
Nodes (51): hai_paths(), HaiData, HaiFile, load_hai(), load_hai_replay(), node_kind(), process_of(), _read() (+43 more)

### Community 22 - "pytest"
Cohesion: 0.10
Nodes (27): allowed_hosts(), AllowlistError, check_host(), is_loopback(), AttackerClient, AttackerError, AttackRecord, _neutral() (+19 more)

### Community 23 - "copilot.py"
Cohesion: 0.17
Nodes (10): bounded_chat(), get_copilot_engine(), get_suggestions(), post_chat(), suggestions(), CopilotChatRequest, CopilotChatResponse, test_timed_out_provider_keeps_capacity_until_worker_finishes() (+2 more)

### Community 24 - "Write"
Cohesion: 0.09
Nodes (22): analyze(), main(), analyze(), main(), analyze(), main(), _pct(), analyze() (+14 more)

### Community 25 - "test_api.py"
Cohesion: 0.18
Nodes (11): client(), test_attack_validation(), test_incidents_and_reset(), test_live_loop_survives_a_failing_tick(), test_metrics(), test_metrics_merges_live_metrics_without_touching_the_file(), test_status_and_mode(), test_topology() (+3 more)

### Community 26 - "time"
Cohesion: 0.16
Nodes (21): digest(), loaded_context(), runtime_context(), SocStore, message(), test_api_export_and_archived_copilot_use_original_capture(), test_capture_integrity_failure_never_returns_modified_payload(), test_capture_is_immutable_survives_reopen_and_telemetry_rotation() (+13 more)

### Community 27 - "alert_mask"
Cohesion: 0.17
Nodes (7): alert_mask(), sustained(), best_f1(), main(), score(), smooth(), test_sustained_and_aggregate()

### Community 28 - "Grounding"
Cohesion: 0.18
Nodes (22): _build_context_summary(), CopilotEngine, _get_gemini_key(), incident_evidence_summary(), local_checks(), _offline_expert_reply(), CopilotTurn, LiveMessage (+14 more)

### Community 29 - "robustness.py"
Cohesion: 0.13
Nodes (11): Overlay, assess_calibration(), Case, evaluate_case(), fit_calibration(), probability(), reliability(), run() (+3 more)

### Community 30 - "gateway/package.json"
Cohesion: 0.08
Nodes (20): devDependencies, miniflare, engines, node, name, overrides, sharp, undici (+12 more)

### Community 31 - "json"
Cohesion: 0.07
Nodes (35): asset_registers(), baseline_comparison(), capture(), detail(), evidence(), export(), journal(), progress() (+27 more)

### Community 32 - "PlantEmulator"
Cohesion: 0.11
Nodes (5): port(), test_manifest_changes_real_emulator_controller_and_invalid_file_is_reported(), load(), PlantEmulator, TruthEvent

### Community 33 - "deploy.py"
Cohesion: 0.19
Nodes (9): check_identity(), DeploymentError, main(), prepare_storage(), validate(), configured(), test_private_entrypoint_rejects_unsigned_emulator(), test_storage_requires_mount_and_preserves_journal_and_models() (+1 more)

### Community 34 - "verify_ai_models.py"
Cohesion: 0.24
Nodes (7): gemini_key(), _audio(), _interaction(), _live_check(), _result(), _speech_body(), verify()

### Community 35 - "HaiEngine"
Cohesion: 0.12
Nodes (9): HaiEngine, _Open, _Open, Incident, test_dataset_attack_becomes_an_incident_without_invented_labels(), test_replay_starts_before_the_first_attack_and_follows_the_speed(), test_reset_restarts_the_replay_and_the_replay_loops(), test_suspect_needs_both_a_high_score_and_a_departure_from_the_nodes_own_normal() (+1 more)

### Community 37 - "security.py"
Cohesion: 0.36
Nodes (4): _is_loopback(), limit_attacks(), require_demo(), require_key()

### Community 38 - "pipeline.py"
Cohesion: 0.06
Nodes (32): aggregate(), best_threshold(), fit_err_sd(), ForecastDetector, residuals(), build_model(), GDN, make_windows() (+24 more)

### Community 39 - "test_report.py"
Cohesion: 0.16
Nodes (10): _eta(), render_report(), para(), _utc(), ascii_text(), _escape(), Page, text_width() (+2 more)

### Community 40 - "Authentication"
Cohesion: 0.16
Nodes (15): check_origin(), config(), firebase_app(), identity(), logout(), me(), names(), protect() (+7 more)

### Community 41 - "app/engine.py"
Cohesion: 0.11
Nodes (14): action_for(), explain(), Explanation, signature(), Incident, _cost(), hop_distance(), PathNode (+6 more)

### Community 42 - "RateLimiter"
Cohesion: 0.17
Nodes (11): 1. Five-Layer Architecture Map, 2. Layer-by-Layer Breakdown & Source Evidence, 3. End-to-End User Workflows, 4. Authentication, Authorization & Security Flow, AttackTrace: Full Interactive Architecture Map, 🌐 Interactive Visualization Artifacts, 🎨 Layer 1: Frontend, ⚡ Layer 2: API & Gateway (+3 more)

### Community 43 - "lab.py"
Cohesion: 0.14
Nodes (14): configure(), emulator_info(), exclusive(), integrity(), ManifestChange, observe_integrity(), probe(), proxy() (+6 more)

### Community 44 - "argparse"
Cohesion: 0.19
Nodes (8): anonymous_stream_denied(), main(), NoRedirect, origin(), public_streams_available(), read(), require(), main()

### Community 45 - "app/config.py"
Cohesion: 0.12
Nodes (20): load_detector(), load_graph(), build_incident(), Weights, Row, rows(), summarize(), tune_margin() (+12 more)

### Community 46 - "Package"
Cohesion: 0.08
Nodes (26): name, overrides, @grpc/grpc-js, private, type, version, root, autoprefixer (+18 more)

### Community 47 - "classify_language"
Cohesion: 0.13
Nodes (14): classify_language(), detect_unsupported_script(), has_tamil_characters(), is_self_echo(), LanguageClassification, sanitize_response_text(), tokenize_words(), test_classify_english_speech() (+6 more)

### Community 48 - "live_soak.py"
Cohesion: 0.14
Nodes (17): live_dir(), live_models_ready(), build_engine(), check_emulator_down(), check_out_of_range(), _free_port(), main(), main_async() (+9 more)

### Community 49 - "AttackConsole.tsx"
Cohesion: 0.13
Nodes (25): Panel(), PanelProps, AttackConsole(), HaiReplayPanel(), offset(), MagnitudeField(), Props, NodeScores() (+17 more)

### Community 51 - "test_emulator.py"
Cohesion: 0.16
Nodes (18): TagMapError, client_for(), mutate(), raw_map(), read_values(), run_ticks(), test_a_rogue_setpoint_moves_the_plant(), test_a_sensor_offset_fools_the_controller() (+10 more)

### Community 52 - "create_app"
Cohesion: 0.14
Nodes (18): RateLimiter, create_app(), test_sim_and_hai_attack_paths_are_unaffected(), client(), make_client(), test_a_configured_key_still_works_regardless_of_host(), test_attack_endpoint_is_rate_limited(), test_demo_mode_off_blocks_attacks_only() (+10 more)

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

### Community 57 - "live.py"
Cohesion: 0.22
Nodes (11): AttackResult, _false_alarm_per_hour(), LiveEvalState, main(), _pct(), _prf(), _rising_edges(), run() (+3 more)

### Community 58 - "models.py"
Cohesion: 0.18
Nodes (11): classify_failure(), Failure, ModelRouter, _retry_after(), _status_code(), test_live_greeting_states_only_observed_status(), test_model_pool_rejects_cross_modality(), test_preferred_model_fails_over_after_rate_limit() (+3 more)

### Community 59 - "LiveSource"
Cohesion: 0.16
Nodes (13): Aligner, Sample, LiveSource, evaluate(), check_slow_network(), free_port(), settings(), test_aligner_holds_the_last_value_until_max_age() (+5 more)

### Community 60 - "Compileroptions"
Cohesion: 0.11
Nodes (17): compilerOptions, isolatedModules, jsx, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch (+9 more)

### Community 61 - "test_isolate.py"
Cohesion: 0.21
Nodes (11): client(), opened(), step_until(), test_isolate_endpoint(), test_isolate_is_409_in_hai_mode_and_needs_the_key(), test_isolating_a_wrong_node_never_contains(), test_isolating_the_true_origin_contains_the_incident(), test_isolation_after_the_attack_ended_is_not_credited() (+3 more)

### Community 62 - "Path"
Cohesion: 0.14
Nodes (12): Hub, run_loop(), collect(), test_a_source_that_goes_away_shows_down_not_a_crash(), test_calibration_restart_is_authenticated_and_refuses_an_active_trainer(), test_live_is_unavailable_without_a_source_and_never_crashes(), test_resumed_training_never_builds_windows_across_a_gap(), test_started_live_calibration_advances_while_sim_is_selected() (+4 more)

### Community 63 - "test_startup.py"
Cohesion: 0.16
Nodes (10): Settings, build_engine(), ensure_metrics(), safe_ensure_metrics(), test_voice_rejects_wrong_demo_key_before_gemini(), test_a_failing_metrics_step_never_stops_startup(), test_existing_metrics_are_never_overwritten(), test_first_start_writes_metrics_once() (+2 more)

### Community 64 - "AttackRequest"
Cohesion: 0.18
Nodes (15): _has_hazard(), AttackRequest, run_sim_trial(), run(), test_attack_produces_localized_incident(), test_clean_run_raises_no_incident(), test_detector_is_warm_before_the_first_message(), test_incident_closes_after_attack_ends() (+7 more)

### Community 65 - "demo_trials.py"
Cohesion: 0.25
Nodes (12): load_baseline(), build_report(), main(), pair_key(), _pick_primary_backup(), _rank(), run_live(), run_sim() (+4 more)

### Community 66 - "RobustnessPanel.tsx"
Cohesion: 0.25
Nodes (14): percent(), ReliabilityTable(), RobustnessPanel(), score(), seconds(), finite(), nullable(), numbers() (+6 more)

### Community 67 - "metrics.ts"
Cohesion: 0.17
Nodes (21): chartOption(), getChartColors(), AmbiguityMetrics, BarRow, detector(), DetectorMetrics, haiDetector(), HaiDetectorMetrics (+13 more)

### Community 68 - "13. Questions and Answers for Reviewers & Judges"
Cohesion: 0.17
Nodes (12): 13. Questions and Answers for Reviewers & Judges, Q10: What makes this approach novel and useful?, Q11: What still needs improvement?, Q1: What happens when an attack occurs?, Q2: How does it find the likely origin among an alarm flood?, Q3: Why is this approach better than an ordinary alarm?, Q4: What information does AttackTrace need to operate?, Q5: What if the AI's origin prediction is wrong? (+4 more)

### Community 69 - "AttackTrace_Slides.md"
Cohesion: 0.15
Nodes (12): Approach, Architecture, AttackTrace, Detect → Locate → Contain, Limitations, Live demo, Results: real HAI data, Results: real protocol (LIVE) (+4 more)

### Community 70 - "Private-server release plan — 16 October 2026"
Cohesion: 0.06
Nodes (28): Copilot polish and private-server foundation — 16 October 2026, Implemented, Validation and current limits, Activate the selected ADC method, Credentials and access, Deployment and verification still required, Firebase private-server setup — 16 October 2026, What the implementation enforces (+20 more)

### Community 72 - "lifespan"
Cohesion: 0.20
Nodes (3): LiveAttackLauncher, build_live_runtime(), lifespan()

### Community 73 - "contextlib"
Cohesion: 0.33
Nodes (3): test_backup_includes_committed_wal_and_closes_output(), test_backup_refuses_to_replace_existing_data(), backup()

### Community 74 - "AttackTrace: Project Explained & Comprehensive Presentation Guide"
Cohesion: 0.18
Nodes (10): 4. Features and Screens, 5. System Architecture, 8. Data Modes and Operational Evidence, 9. Implementation Details & File-to-Feature Map, Architecture Diagram, AttackTrace: Project Explained & Comprehensive Presentation Guide, File-to-Feature Map, Folder Structure Overview (+2 more)

### Community 75 - "Screenshots"
Cohesion: 0.35
Nodes (10): ambiguousShot(), { chromium }, errors, haiIncident(), log, require, shot(), simViews() (+2 more)

### Community 76 - "tagmap.py"
Cohesion: 0.23
Nodes (6): alter_response(), frame(), decode(), encode(), Tag, test_encoding_round_trips()

### Community 77 - "test_report.py"
Cohesion: 0.23
Nodes (8): check_structure(), client(), test_impact_snapshot_keeps_the_worst_values(), test_report_endpoint_returns_a_valid_one_page_pdf(), test_report_is_open_without_a_key(), test_report_shows_the_ambiguous_banner_and_breakdown(), test_unknown_incident_is_404(), with_incident()

### Community 78 - "Dependencies"
Cohesion: 0.17
Nodes (12): dependencies, echarts, echarts-for-react, firebase, @fontsource/inter, @fontsource/jetbrains-mono, framer-motion, lucide-react (+4 more)

### Community 79 - "live_voice.py"
Cohesion: 0.15
Nodes (10): _authenticate(), connect_model(), live_voice(), gemini_to_browser(), opening_prompt(), process_snapshot(), session_config(), test_live_extended_thinking_has_required_configuration() (+2 more)

### Community 80 - "12. Presentation-Ready Content (PowerPoint Slide Deck)"
Cohesion: 0.18
Nodes (11): 12. Presentation-Ready Content (PowerPoint Slide Deck), Slide 10: Conclusion & The Future of Industrial Defense, Slide 1: Title & Executive Summary, Slide 2: The Problem: Invisible Threats to Critical Infrastructure, Slide 3: The Alarm Flood Dilemma, Slide 4: The AttackTrace Solution, Slide 5: System Architecture & Data Modes, Slide 6: Live Case Study: The Tank 1 Level Attack (+3 more)

### Community 82 - "AttackSpec"
Cohesion: 0.06
Nodes (39): _Active, AttackEngine, AttackSpec, GroundTruth, _fmt_eta(), main(), NoOverlay, PID (+31 more)

### Community 84 - "QualityTracker"
Cohesion: 0.17
Nodes (3): QualityTracker, TagSpec, _Track

### Community 85 - "Screenshots"
Cohesion: 0.24
Nodes (8): { chromium }, errors, liveViews(), log, require, shot(), SIZES, sleep()

### Community 86 - "AI Pilot · Signal Room design plan"
Cohesion: 0.33
Nodes (5): AI Pilot · Signal Room design plan, Design references, Implementation flow, Master idea, Reusable implementation prompt

### Community 87 - "Scripts"
Cohesion: 0.25
Nodes (8): scripts, build, dev, e2e, lint, preview, test, typecheck

### Community 88 - "builder.py"
Cohesion: 0.18
Nodes (7): learn_granger_edges(), learn_var_edges(), merge_graph(), test_adjacency_lists_parents(), test_granger_finds_lagged_cause(), test_merge_keeps_static_and_downweights_learned(), test_static_graph_matches_pid()

### Community 90 - "Vercel"
Cohesion: 0.29
Nodes (6): buildCommand, framework, headers, outputDirectory, rewrites, $schema

### Community 91 - "Test"
Cohesion: 0.33
Nodes (4): css, spec, postcss, @tailwindcss/postcss

### Community 92 - "main.py"
Cohesion: 0.09
Nodes (9): main(), parse_args(), run(), load_attacker(), _from_env(), get_settings(), main(), test_cli_rejects_a_non_allowlisted_host() (+1 more)

### Community 93 - "10. Results and Evaluation"
Cohesion: 0.29
Nodes (7): 10. Results and Evaluation, 1. Detection Performance (Evaluated on 50 Attack Runs & 20 Clean Runs), 2. Root-Cause Localization Accuracy, 3. Self-Healing Containment Success, 4. What Performed Well vs. What Performed Poorly, 5. HAI 20.07 Real-World Dataset Results, 6. What These Results Cannot Prove

### Community 94 - "test_lab_attribution.py"
Cohesion: 0.27
Nodes (5): assess_layers(), evidence_priority(), test_channel_evidence_rules(), test_integrity_requires_observation_and_separate_approval(), test_normal_read_after_alteration_does_not_erase_retained_evidence()

### Community 96 - "AttackTrace AI Pilot model registry and verification"
Cohesion: 0.50
Nodes (3): AI Pilot's jobs and exact system instructions, AttackTrace AI Pilot model registry and verification, Configuration and verification

### Community 108 - "Incident evidence delivery — 15 October 2026"
Cohesion: 0.22
Nodes (7): Incident evidence delivery — 15 October 2026, Investigation and Copilot, Measured harder tests, Next research priority, Preserved evidence, Verification, Incident evidence implementation plan

### Community 109 - "AttackTrace: proposed SOC and Twin/Graph enhancement plan"
Cohesion: 0.06
Nodes (28): AttackTrace implementation plan, Build order, Data modes, Milestone 1 — trustworthy assistance and investigation UI, Milestone 2 — explicit evidence records and uncertainty, Milestone 3 — local communication-channel attribution, Milestone 4 — emulated firmware/configuration integrity, Milestone 5 — validation and response workflow (+20 more)

### Community 111 - "3. How the Project Works: The Complete Walkthrough"
Cohesion: 0.29
Nodes (7): 3. How the Project Works: The Complete Walkthrough, Stage 1: Information Ingestion, Stage 2: The Attack Occurs, Stage 3: Detection via AI Forecasting (GDN), Stage 4: Root-Cause Localization (The Tri-Signal Algorithm), Stage 5: What the User Sees, Stage 6: The User’s Action & Self-Healing Outcome

### Community 112 - "record"
Cohesion: 0.29
Nodes (4): Snapshot, LiveRecorder, record(), test_recording_stops_growing_when_full()

### Community 114 - "Presenter cheat sheet (one page)"
Cohesion: 0.29
Nodes (6): Click path (SIM), Fast facts if asked, Headline numbers (say the n, not just the %), If LIVE fails mid-demo, If Top-1 is wrong, Presenter cheat sheet (one page)

### Community 115 - "AttackTrace"
Cohesion: 0.09
Nodes (20): 🏛 5-Layer System Architecture (Graphify Mapped), AttackTrace, 📊 Benchmark & Evaluation Results, 🔄 End-to-End Incident Lifecycle, 🗺 Graphify Codebase Navigation, 🎮 Interactive Live Demo Script, 📄 License & Attribution, 🌐 Live Deployments (+12 more)

### Community 116 - "7. AI and Detection Methods"
Cohesion: 0.33
Nodes (6): 1. Machine Learning Forecasting (GDN & MLP), 2. Fixed Rules, Timing, and Graph Calculations, 3. Generative AI: AI Pilot (Google Gemini), 7. AI and Detection Methods, What Confidence Scores Mean (and What They Do Not Mean), What Happens When an AI Service Fails

### Community 117 - "load_tagmap"
Cohesion: 0.13
Nodes (15): LabProxy, load_tagmap(), evaluate(), free_port(), emu(), free_port(), test_attack_refused_while_live_is_calibrating(), emu() (+7 more)

### Community 118 - "Demo script (3 minutes)"
Cohesion: 0.40
Nodes (4): Before you go on stage (5 minutes ahead), Demo script (3 minutes), Fallback path, Run sheet

### Community 125 - "11. Limitations and Future Improvements"
Cohesion: 0.40
Nodes (5): 11. Limitations and Future Improvements, 1. Implemented and Supported by Code & Empirical Evidence, 2. Implemented but Not Sufficiently Validated, 3. Partially Implemented, 4. Planned or Missing

### Community 126 - "1. Project Overview"
Cohesion: 0.40
Nodes (5): 1. Project Overview, The Everyday Analogy: The Airplane Autopilot & Pitot Tube, What is the project called?, What real-world problem does it solve?, Who would use it, and why?

### Community 127 - "index.js"
Cohesion: 0.70
Nodes (4): error(), fetch(), handle(), origin()

### Community 128 - "2. Problem Statement and Objectives"
Cohesion: 0.40
Nodes (5): 2. Problem Statement and Objectives, The Problem Statement in Ordinary Language, What the Current Implementation Actually Addresses, What the Project Aims to Identify and Explain, Why Detecting Abnormal Behaviour is Different from Finding its Origin

### Community 132 - "theme.ts"
Cohesion: 0.26
Nodes (8): ThemeSwitcher(), applyTheme(), getInitialTheme(), ThemeId, ThemeMeta, THEMES, ThemeState, useTheme

### Community 133 - "14. Glossary and References"
Cohesion: 0.67
Nodes (3): 14. Glossary and References, Plain-English Glossary, Verified Academic and Industry References

### Community 134 - "6. Technologies and Their Purpose"
Cohesion: 0.67
Nodes (3): 6. Technologies and Their Purpose, Required Runtime vs. Optional / Development Tools, Technology Breakdown Table

### Community 135 - "test_copilot.py"
Cohesion: 0.31
Nodes (6): client(), test_copilot_chat(), test_copilot_suggestions(), test_no_active_incident_has_no_action(), test_unknown_requested_incident_returns_404(), test_virtual_sensor_isolation()

### Community 137 - "test_live_connectors.py"
Cohesion: 0.08
Nodes (26): LiveConfig, LiveConfigError, load_live(), ReadError, excluded_from_ranking(), FakeClient, poller(), source_with_samples() (+18 more)

### Community 138 - "package.py"
Cohesion: 0.46
Nodes (4): collect(), main(), scan(), wanted()

### Community 140 - "🔍 Layer-by-Layer Component Breakdown"
Cohesion: 0.33
Nodes (6): 🎨 Layer 1: Frontend (React 19 + TypeScript + Vite), ⚡ Layer 2: API & Gateway (FastAPI + Cloudflare Workers), 🧠 Layer 3: Services & Core Detection Engine, 💾 Layer 4: Storage & Data Persistence, 🏭 Layer 5: External Protocol & Hardware, 🔍 Layer-by-Layer Component Breakdown

## Knowledge Gaps
- **11 isolated node(s):** `attacktrace`, `echarts`, `echarts-for-react`, `@types/node`, `@types/react` (+6 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 999 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **32 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `3.10 LIVE ingestion: a real industrial protocol` connect `incident.render.test.ts` to `test_emulator.py`, `AttackSpec`, `Rest`?**
  _High betweenness centrality (0.310) - this node is a cross-community bridge._
- **Are the 97 inferred relationships involving `Engine` (e.g. with `🧠 Layer 3: Services & Detection Engine` and `_engine()`) actually correct?**
  _`Engine` has 97 INFERRED edges - model-reasoned connections that need verification._
- **What connects `attacktrace`, `echarts`, `echarts-for-react` to the rest of the system?**
  _11 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `numpy` be split into smaller, more focused modules?**
  _Cohesion score 0.0893707033315706 - nodes in this community are weakly interconnected._
- **Are the 33 inferred relationships involving `Settings` (e.g. with `prepare_storage()` and `validate()`) actually correct?**
  _`Settings` has 33 INFERRED edges - model-reasoned connections that need verification._
- **Should `Scenario` be split into smaller, more focused modules?**
  _Cohesion score 0.08665269042627533 - nodes in this community are weakly interconnected._
- **Are the 24 inferred relationships involving `LiveRuntime` (e.g. with `🧠 Layer 3: Services & Detection Engine` and `post_chat()`) actually correct?**
  _`LiveRuntime` has 24 INFERRED edges - model-reasoned connections that need verification._