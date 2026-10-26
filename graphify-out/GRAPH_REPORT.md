# Graph Report - Attacktrace  (2026-10-26)

## Corpus Check
- 410 files · ~1,154,925 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 57 file(s) not represented in the graph (top: (none) 22, .pt 12, .log 8)

## Summary
- 3148 nodes · 9718 edges · 145 communities (114 shown, 31 thin omitted)
- Extraction: 90% EXTRACTED · 10% INFERRED · 0% AMBIGUOUS · INFERRED: 931 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `5da7d9b9`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- numpy
- react
- argparse
- geometry.ts
- app/engine.py
- schemas.py
- Incident
- .start
- live/runtime.py
- test_gateway.py
- Timeline.tsx
- test_isolate.py
- localization.py
- voice.py
- lucide-react
- ModbusPoller
- TopBar.tsx
- react
- test_live_runtime.py
- Rest
- pipeline.py
- test_hai.py
- RobustnessPanel.tsx
- copilot.py
- Write
- test_api.py
- time
- types.ts
- Grounding
- test_robustness.py
- gateway/package.json
- json
- test_emulator.py
- test_authentication.py
- verify_ai_models.py
- attack.ts
- BaselineDetector
- evaluate
- pipeline.py
- classify_language
- Authentication
- RegisterOverlay
- RateLimiter
- lab.py
- test_report.py
- hashlib
- Package
- test_lab_attribution.py
- train.py
- IncidentPanel.tsx
- app/engine.py
- ModelRouter
- create_app
- AttackTrace UI and navigation repair — 16 October 2026
- LIVE calibration fix and next implementation plan
- Devdependencies
- incident.render.test.ts
- AttackSpec
- LiveSource
- test_report.py
- Compileroptions
- GraphView.tsx
- simulate
- json
- .step_sample
- demo_trials.py
- local_layers.py
- metrics.ts
- 13. Questions and Answers for Reviewers & Judges
- AttackTrace_Slides.md
- Private-server release plan — 16 October 2026
- test_startup.py
- package.py
- AttackTrace: Project Explained & Comprehensive Presentation Guide
- Screenshots
- lab_proxy.py
- sim/__init__.py
- Dependencies
- live_voice.py
- 12. Presentation-Ready Content (PowerPoint Slide Deck)
- pytest
- Plant
- firebase.ts
- theme.ts
- Screenshots
- AI Pilot · Signal Room design plan
- Scripts
- Topology
- Test
- Vercel
- Test
- TagMapError
- 10. Results and Evaluation
- test_sim_speed.py
- Voicecaptureprocessor
- AttackTrace AI Pilot model registry and verification
- Attacktrace
- Incident evidence delivery — 15 October 2026
- AttackTrace: proposed SOC and Twin/Graph enhancement plan
- 3. How the Project Works: The Complete Walkthrough
- hashlib
- VOICE_ASSISTANT.md
- Presenter cheat sheet (one page)
- AttackTrace
- 7. AI and Detection Methods
- isolation.py
- Demo script (3 minutes)
- QA_Prep.md
- 11. Limitations and Future Improvements
- 1. Project Overview
- index.js
- 2. Problem Statement and Objectives
- python-dependency-audit.json
- test_copilot.py
- IncidentStore
- 14. Glossary and References
- 6. Technologies and Their Purpose
- layout.test.ts
- .reset
- load_tagmap
- best_f1
- main.tsx
- ._record_truth
- BenignOverlay
- Actual held-out results from this installation

## God Nodes (most connected - your core abstractions)
1. `Engine` - 145 edges
2. `Settings` - 107 edges
3. `LiveRuntime` - 70 edges
4. `create_app()` - 68 edges
5. `BaselineDetector` - 63 edges
6. `Scenario` - 59 edges
7. `LiveSource` - 59 edges
8. `useLive` - 59 edges
9. `PlantEmulator` - 59 edges
10. `react` - 56 edges

## Surprising Connections (you probably didn't know these)
- `2. Fixed Rules, Timing, and Graph Calculations` --references--> `aggregate()`  [INFERRED]
  PROJECT_EXPLAINED.md → backend/app/detect/detector.py
- `⚡ Layer 2: API & Gateway` --references--> `create_app()`  [INFERRED]
  ARCHIFY_ARCHITECTURE_MAP.md → backend/app/main.py
- `⚡ Layer 2: API & Gateway (FastAPI + Cloudflare Workers)` --references--> `create_app()`  [INFERRED]
  README.md → backend/app/main.py
- `Actual held-out results from this installation` --references--> `speed()`  [INFERRED]
  docs/HAI_REPLAY.md → backend/tests/test_hai.py
- `4. Authentication, Authorization & Security Flow` --references--> `RateLimiter`  [INFERRED]
  ARCHIFY_ARCHITECTURE_MAP.md → backend/app/api/security.py

## Import Cycles
- None detected.

## Communities (145 total, 31 thin omitted)

### Community 0 - "numpy"
Cohesion: 0.10
Nodes (34): static_graph(), break_ties(), causal_term(), combine_onsets(), deviation_term(), first_crossings(), localize(), onset_term() (+26 more)

### Community 1 - "react"
Cohesion: 0.06
Nodes (53): AboutPage, MetricsPage, Root(), Route(), SocPage, VoiceSettingsPage, WorkspaceLoading(), WorkspacePage (+45 more)

### Community 2 - "argparse"
Cohesion: 0.08
Nodes (25): check_identity(), DeploymentError, main(), prepare_storage(), validate(), configured(), test_private_entrypoint_rejects_unsigned_emulator(), test_storage_requires_mount_and_preserves_journal_and_models() (+17 more)

### Community 3 - "geometry.ts"
Cohesion: 0.09
Nodes (45): NodeAttack, ATTACK_STROKE, AttackChip(), BandProps, ChipProps, DriftMark(), DriftProps, ForcedProps (+37 more)

### Community 4 - "app/engine.py"
Cohesion: 0.09
Nodes (15): process_of(), HaiEngine, _Open, is_ambiguous(), origin_candidate(), AlertInfo, NodeState, OriginCandidate (+7 more)

### Community 5 - "schemas.py"
Cohesion: 0.17
Nodes (10): AttackResponse, CopilotChatRequest, GroundTruthInfo, IsolateRequest, IsolateResponse, ModeRequest, SimSpeedRequest, SourceInfo (+2 more)

### Community 6 - "Incident"
Cohesion: 0.11
Nodes (29): edgeDelay(), edgeId(), layoutEdges(), MIN_LEARNED_WEIGHT, visibleEdges(), filterAssets(), FocusDirection, graphLinks() (+21 more)

### Community 7 - ".start"
Cohesion: 0.15
Nodes (8): emu(), free_port(), test_attack_endpoint_writes_to_the_emulator_and_reveals_ground_truth(), test_demo_mode_off_blocks_live_attack_before_the_attacker_is_ever_called(), emu(), port(), test_manifest_changes_real_emulator_controller_and_invalid_file_is_reported(), main()

### Community 8 - "live/runtime.py"
Cohesion: 0.07
Nodes (13): read_checkpoint(), source_fingerprint(), write_checkpoint(), LiveConfig, _pct(), Snapshot, SourceNotReadyError, SourceStatus (+5 more)

### Community 9 - "test_gateway.py"
Cohesion: 0.11
Nodes (5): GatewayBoundary, gateway_app(), test_direct_origin_denied_even_for_auth_config_and_docs(), test_local_mode_is_unchanged_without_an_origin_secret(), test_stream_requires_gateway_secret_before_upgrade()

### Community 10 - "Timeline.tsx"
Cohesion: 0.08
Nodes (52): App(), Center(), ViewToggle(), useFreshness(), collapseIcon(), ResizeHandle, ResizeHandleProps, COLLAPSE_KEY (+44 more)

### Community 11 - "test_isolate.py"
Cohesion: 0.21
Nodes (11): client(), opened(), step_until(), test_isolate_endpoint(), test_isolate_is_409_in_hai_mode_and_needs_the_key(), test_isolating_a_wrong_node_never_contains(), test_isolating_the_true_origin_contains_the_incident(), test_isolation_after_the_attack_ended_is_not_credited() (+3 more)

### Community 12 - "localization.py"
Cohesion: 0.12
Nodes (23): attack_run(), Run, Loaded, _val_runs(), build_incident(), Weights, Row, rows() (+15 more)

### Community 13 - "voice.py"
Cohesion: 0.18
Nodes (10): gemini_key(), capabilities(), _interaction(), _key(), _limit(), _output_audio(), _output_text(), SpeechRequest (+2 more)

### Community 14 - "lucide-react"
Cohesion: 0.18
Nodes (19): EmptyState(), ImpactMeters(), Meter(), tone(), Details(), IncidentPanel(), PlantIntegrityGuard(), Reveal() (+11 more)

### Community 15 - "ModbusPoller"
Cohesion: 0.12
Nodes (3): ModbusPoller, ReadOnlyClient, SlowClient

### Community 16 - "TopBar.tsx"
Cohesion: 0.07
Nodes (48): SOURCE_NAMES, TopBar(), narrated, topoIndex, topologyIndex(), MODES, ModeToggle(), Props (+40 more)

### Community 17 - "react"
Cohesion: 0.08
Nodes (42): CopilotDrawer(), makeWelcome(), SOURCE_LABELS, groupTranscript(), isMobileDevice(), Line, LiveVoicePanel(), pcm16() (+34 more)

### Community 18 - "test_live_runtime.py"
Cohesion: 0.06
Nodes (36): load_live(), LiveRuntime, LiveSource, LiveRecorder, record(), CalibrationInfo, test_attack_refused_while_live_is_calibrating(), test_restart_resumes_rows_and_marks_a_gap() (+28 more)

### Community 19 - "Rest"
Cohesion: 0.12
Nodes (25): control_hai_replay(), _engine(), get_hai_replay(), get_incident_report(), get_incidents(), get_live_health(), get_metrics(), get_status() (+17 more)

### Community 20 - "pipeline.py"
Cohesion: 0.08
Nodes (21): train_all(), Trained, adjacency(), learn_granger_edges(), learn_var_edges(), learned_graph(), merge_graph(), save_graph() (+13 more)

### Community 21 - "test_hai.py"
Cohesion: 0.05
Nodes (49): hai_paths(), HaiData, HaiFile, load_hai(), load_hai_replay(), node_kind(), _read(), _read_csv() (+41 more)

### Community 22 - "RobustnessPanel.tsx"
Cohesion: 0.25
Nodes (14): percent(), ReliabilityTable(), RobustnessPanel(), score(), seconds(), finite(), nullable(), numbers() (+6 more)

### Community 23 - "copilot.py"
Cohesion: 0.21
Nodes (7): bounded_chat(), get_copilot_engine(), get_suggestions(), post_chat(), CopilotChatResponse, test_timed_out_provider_keeps_capacity_until_worker_finishes(), chat()

### Community 24 - "Write"
Cohesion: 0.08
Nodes (22): analyze(), main(), analyze(), main(), analyze(), main(), _pct(), analyze() (+14 more)

### Community 25 - "test_api.py"
Cohesion: 0.13
Nodes (15): create_app(), LiveMessage, client(), test_attack_validation(), test_live_loop_survives_a_failing_tick(), test_metrics(), test_metrics_merges_live_metrics_without_touching_the_file(), test_status_and_mode() (+7 more)

### Community 26 - "time"
Cohesion: 0.24
Nodes (16): runtime_context(), SocStore, message(), test_api_export_and_archived_copilot_use_original_capture(), test_capture_integrity_failure_never_returns_modified_payload(), test_capture_is_immutable_survives_reopen_and_telemetry_rotation(), test_capture_retention_follows_incident_not_telemetry(), test_legacy_case_and_restored_session_never_receive_current_context() (+8 more)

### Community 27 - "types.ts"
Cohesion: 0.08
Nodes (46): useLiveSourcePoll(), Access, AccessContext, useAccess(), Message, EvidenceList(), formatCategory(), IncidentEvidencePanel() (+38 more)

### Community 28 - "Grounding"
Cohesion: 0.16
Nodes (24): _build_context_summary(), CopilotEngine, _get_gemini_key(), incident_evidence_summary(), local_checks(), _offline_expert_reply(), suggestions(), CopilotTurn (+16 more)

### Community 29 - "test_robustness.py"
Cohesion: 0.18
Nodes (17): assess_calibration(), Case, evaluate_case(), fit_calibration(), observations(), probability(), reliability(), run() (+9 more)

### Community 30 - "gateway/package.json"
Cohesion: 0.08
Nodes (20): devDependencies, miniflare, engines, node, name, overrides, sharp, undici (+12 more)

### Community 31 - "json"
Cohesion: 0.19
Nodes (15): asset_registers(), baseline_comparison(), capture(), detail(), evidence(), export(), journal(), progress() (+7 more)

### Community 32 - "test_emulator.py"
Cohesion: 0.25
Nodes (17): client_for(), free_port(), read_values(), run_ticks(), test_a_rogue_setpoint_moves_the_plant(), test_a_sensor_offset_fools_the_controller(), test_clients_cannot_write_process_values(), test_force_registers_start_at_no_override() (+9 more)

### Community 33 - "test_authentication.py"
Cohesion: 0.22
Nodes (10): headers(), login(), secured(), test_analyst_decisions_record_verified_actor(), test_login_cookie_membership_and_csrf(), test_logout_invalidates_copied_cookie_and_stream(), test_missing_server_credentials_fail_closed(), test_repeated_signins_have_distinct_server_sessions() (+2 more)

### Community 34 - "verify_ai_models.py"
Cohesion: 0.31
Nodes (6): _audio(), _interaction(), _live_check(), _result(), _speech_body(), verify()

### Community 35 - "attack.ts"
Cohesion: 0.06
Nodes (52): AttackBriefing(), DIRECTION_ICON, PHASE_ICON, PHASE_TONE, ATTACK_LABEL, AttackKind, attacksByNode(), detailFor() (+44 more)

### Community 36 - "BaselineDetector"
Cohesion: 0.14
Nodes (8): BaselineDetector, make_live(), test_a_sim_attack_is_found_through_the_live_path(), test_live_is_read_only_toward_the_plant(), test_live_messages_have_the_same_schema_as_sim(), test_the_engine_waits_for_the_first_reading(), test_a_data_fault_is_not_an_attack(), test_the_flag_turns_masking_off()

### Community 37 - "evaluate"
Cohesion: 0.27
Nodes (4): Counts, evaluate(), _onsets(), run_detection()

### Community 38 - "pipeline.py"
Cohesion: 0.06
Nodes (26): aggregate(), alert_mask(), best_threshold(), fit_err_sd(), ForecastDetector, residuals(), rising_edges(), sustained() (+18 more)

### Community 39 - "classify_language"
Cohesion: 0.13
Nodes (15): classify_language(), detect_unsupported_script(), has_tamil_characters(), is_self_echo(), LanguageClassification, sanitize_response_text(), tokenize_words(), gemini_to_browser() (+7 more)

### Community 40 - "Authentication"
Cohesion: 0.19
Nodes (14): check_origin(), config(), firebase_app(), identity(), logout(), me(), names(), protect() (+6 more)

### Community 41 - "RegisterOverlay"
Cohesion: 0.12
Nodes (3): Controls, RegisterOverlay, load()

### Community 42 - "RateLimiter"
Cohesion: 0.12
Nodes (13): 1. Five-Layer Architecture Map, 2. Layer-by-Layer Breakdown & Source Evidence, 3. End-to-End User Workflows, 4. Authentication, Authorization & Security Flow, AttackTrace: Full Interactive Architecture Map, 🌐 Interactive Visualization Artifacts, 🎨 Layer 1: Frontend, ⚡ Layer 2: API & Gateway (+5 more)

### Community 43 - "lab.py"
Cohesion: 0.11
Nodes (17): configure(), emulator_info(), exclusive(), integrity(), ManifestChange, observe_integrity(), probe(), proxy() (+9 more)

### Community 44 - "test_report.py"
Cohesion: 0.16
Nodes (10): worst_impact(), Impact, check_structure(), client(), test_impact_snapshot_keeps_the_worst_values(), test_report_endpoint_returns_a_valid_one_page_pdf(), test_report_is_open_without_a_key(), test_report_shows_the_ambiguous_banner_and_breakdown() (+2 more)

### Community 45 - "hashlib"
Cohesion: 0.21
Nodes (6): engine(), hai_dir(), hai_models(), make_dataset(), _signals(), _write()

### Community 46 - "Package"
Cohesion: 0.09
Nodes (22): name, overrides, @grpc/grpc-js, private, type, version, autoprefixer, echarts (+14 more)

### Community 47 - "test_lab_attribution.py"
Cohesion: 0.24
Nodes (6): assess_layers(), evidence_priority(), test_channel_evidence_rules(), test_integrity_requires_observation_and_separate_approval(), test_normal_read_after_alteration_does_not_erase_retained_evidence(), test_proxy_rejects_transaction_mismatch()

### Community 48 - "train.py"
Cohesion: 0.06
Nodes (41): _from_env(), get_settings(), Settings, load_baseline(), load_detector(), load_graph(), LiveEngine, build_engine() (+33 more)

### Community 49 - "IncidentPanel.tsx"
Cohesion: 0.12
Nodes (25): Panel(), PanelProps, AttackConsole(), nextSpeed(), SPEEDS, HaiReplayPanel(), offset(), MagnitudeField() (+17 more)

### Community 50 - "app/engine.py"
Cohesion: 0.11
Nodes (15): action_for(), explain(), Explanation, signature(), Incident, Candidate, _cost(), hop_distance() (+7 more)

### Community 51 - "ModelRouter"
Cohesion: 0.18
Nodes (11): classify_failure(), Failure, ModelRouter, _retry_after(), _status_code(), test_live_greeting_states_only_observed_status(), test_model_pool_rejects_cross_modality(), test_preferred_model_fails_over_after_rate_limit() (+3 more)

### Community 52 - "create_app"
Cohesion: 0.14
Nodes (16): Engine, _Open, client(), make_client(), test_a_configured_key_still_works_regardless_of_host(), test_attack_endpoint_is_rate_limited(), test_demo_mode_off_blocks_attacks_only(), test_loopback_variants_all_count_as_loopback() (+8 more)

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

### Community 57 - "AttackSpec"
Cohesion: 0.12
Nodes (16): _Active, AttackEngine, AttackSpec, GroundTruth, _pair(), _run(), test_actuator_force_pump_off_stops_flow(), test_actuator_force_valve_open_wastes_energy() (+8 more)

### Community 58 - "LiveSource"
Cohesion: 0.06
Nodes (26): Aligner, Sample, LiveConfigError, ReadOnlyModbus, excluded_from_ranking(), QualityTracker, TagSpec, _Track (+18 more)

### Community 59 - "test_report.py"
Cohesion: 0.16
Nodes (10): _eta(), render_report(), para(), _utc(), ascii_text(), _escape(), Page, text_width() (+2 more)

### Community 60 - "Compileroptions"
Cohesion: 0.11
Nodes (17): compilerOptions, isolatedModules, jsx, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch (+9 more)

### Community 61 - "GraphView.tsx"
Cohesion: 0.10
Nodes (30): GraphNode, PlantNode, PlantNodeData, PlantNodeView(), PulseEdgeData, PulseEdgeT, PulseEdgeView(), StageData (+22 more)

### Community 62 - "simulate"
Cohesion: 0.24
Nodes (9): simulate(), baseline_rank(), test_baseline_flags_large_offset(), test_simulate_shape_and_labels(), fitted(), test_baseline_saved_before_names_existed_still_works(), test_missed_attacks_count_as_misses(), test_rank_breaks_ties_by_larger_deviation() (+1 more)

### Community 63 - "json"
Cohesion: 0.17
Nodes (7): click_path(), main(), post(), wait_healthy(), main(), one_run(), post()

### Community 64 - ".step_sample"
Cohesion: 0.15
Nodes (15): _has_hazard(), AttackRequest, test_incidents_and_reset(), test_ws_sends_latest_on_connect(), run(), test_attack_produces_localized_incident(), test_clean_run_raises_no_incident(), test_incident_closes_after_attack_ends() (+7 more)

### Community 65 - "demo_trials.py"
Cohesion: 0.28
Nodes (11): build_report(), main(), pair_key(), _pick_primary_backup(), _rank(), run_live(), run_sim(), run_sim_trial() (+3 more)

### Community 66 - "local_layers.py"
Cohesion: 0.24
Nodes (4): LabProxy, evaluate(), free_port(), test_proxy_real_modbus_pairing_and_rejects_writes()

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

### Community 72 - "test_startup.py"
Cohesion: 0.28
Nodes (6): ensure_metrics(), test_a_failing_metrics_step_never_stops_startup(), test_existing_metrics_are_never_overwritten(), test_first_start_writes_metrics_once(), fake(), test_metrics_missing_the_hai_section_are_refreshed_once_data_appears()

### Community 73 - "package.py"
Cohesion: 0.46
Nodes (4): collect(), main(), scan(), wanted()

### Community 74 - "AttackTrace: Project Explained & Comprehensive Presentation Guide"
Cohesion: 0.18
Nodes (10): 4. Features and Screens, 5. System Architecture, 8. Data Modes and Operational Evidence, 9. Implementation Details & File-to-Feature Map, Architecture Diagram, AttackTrace: Project Explained & Comprehensive Presentation Guide, File-to-Feature Map, Folder Structure Overview (+2 more)

### Community 75 - "Screenshots"
Cohesion: 0.27
Nodes (10): ambiguousShot(), { chromium }, errors, haiIncident(), log, require, shot(), simViews() (+2 more)

### Community 76 - "lab_proxy.py"
Cohesion: 0.14
Nodes (6): alter_response(), frame(), decode(), encode(), Tag, test_encoding_round_trips()

### Community 77 - "sim/__init__.py"
Cohesion: 0.08
Nodes (10): sample_attack(), NoOverlay, Overlay, _clip(), Impact, PlantParams, _time_to(), NodeSpec (+2 more)

### Community 78 - "Dependencies"
Cohesion: 0.17
Nodes (12): dependencies, echarts, echarts-for-react, firebase, @fontsource/inter, @fontsource/jetbrains-mono, framer-motion, lucide-react (+4 more)

### Community 79 - "live_voice.py"
Cohesion: 0.12
Nodes (10): connect_model(), live_voice(), browser_to_gemini(), opening_prompt(), process_snapshot(), session_config(), test_live_extended_thinking_has_required_configuration(), test_voice_rejects_wrong_demo_key_before_gemini() (+2 more)

### Community 80 - "12. Presentation-Ready Content (PowerPoint Slide Deck)"
Cohesion: 0.18
Nodes (11): 12. Presentation-Ready Content (PowerPoint Slide Deck), Slide 10: Conclusion & The Future of Industrial Defense, Slide 1: Title & Executive Summary, Slide 2: The Problem: Invisible Threats to Critical Infrastructure, Slide 3: The Alarm Flood Dilemma, Slide 4: The AttackTrace Solution, Slide 5: System Architecture & Data Modes, Slide 6: Live Case Study: The Tank 1 Level Attack (+3 more)

### Community 81 - "pytest"
Cohesion: 0.05
Nodes (45): allowed_hosts(), AllowlistError, check_host(), is_loopback(), main(), parse_args(), run(), AttackerClient (+37 more)

### Community 82 - "Plant"
Cohesion: 0.14
Nodes (16): _fmt_eta(), main(), PID, Plant, test_sensor_freeze_holds_reported_value(), test_sensor_ramp_drifts_linearly(), test_clean_run_stays_in_band(), test_clean_state_reported_tracks_truth() (+8 more)

### Community 84 - "theme.ts"
Cohesion: 0.23
Nodes (9): ThemeSwitcher(), applyTheme(), getInitialTheme(), ThemeId, ThemeMeta, THEMES, ThemeState, useTheme (+1 more)

### Community 85 - "Screenshots"
Cohesion: 0.31
Nodes (8): { chromium }, errors, liveViews(), log, require, shot(), SIZES, sleep()

### Community 86 - "AI Pilot · Signal Room design plan"
Cohesion: 0.33
Nodes (5): AI Pilot · Signal Room design plan, Design references, Implementation flow, Master idea, Reusable implementation prompt

### Community 87 - "Scripts"
Cohesion: 0.25
Nodes (8): scripts, build, dev, e2e, lint, preview, test, typecheck

### Community 88 - "Topology"
Cohesion: 0.21
Nodes (3): topology_of(), Runtime, Topology

### Community 90 - "Vercel"
Cohesion: 0.29
Nodes (6): buildCommand, framework, headers, outputDirectory, rewrites, $schema

### Community 91 - "Test"
Cohesion: 0.33
Nodes (4): css, spec, postcss, @tailwindcss/postcss

### Community 92 - "TagMapError"
Cohesion: 0.22
Nodes (5): TagMapError, mutate(), raw_map(), test_invalid_tagmaps_are_rejected(), test_load_reports_readable_errors()

### Community 93 - "10. Results and Evaluation"
Cohesion: 0.29
Nodes (7): 10. Results and Evaluation, 1. Detection Performance (Evaluated on 50 Attack Runs & 20 Clean Runs), 2. Root-Cause Localization Accuracy, 3. Self-Healing Containment Success, 4. What Performed Well vs. What Performed Poorly, 5. HAI 20.07 Real-World Dataset Results, 6. What These Results Cannot Prove

### Community 94 - "test_sim_speed.py"
Cohesion: 0.12
Nodes (14): emit_period(), Hub, run_loop(), Status, client(), test_emit_period_never_runs_away(), test_every_offered_speed_is_accepted(), test_fast_demo_shortens_only_the_gap_between_samples() (+6 more)

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

### Community 112 - "hashlib"
Cohesion: 0.18
Nodes (5): digest(), loaded_context(), get_json(), main(), fetch()

### Community 114 - "Presenter cheat sheet (one page)"
Cohesion: 0.29
Nodes (6): Click path (SIM), Fast facts if asked, Headline numbers (say the n, not just the %), If LIVE fails mid-demo, If Top-1 is wrong, Presenter cheat sheet (one page)

### Community 115 - "AttackTrace"
Cohesion: 0.07
Nodes (26): 🏛 5-Layer System Architecture (Graphify Mapped), AttackTrace, 📊 Benchmark & Evaluation Results, 🔄 End-to-End Incident Lifecycle, 🗺 Graphify Codebase Navigation, 🎮 Interactive Live Demo Script, 🎨 Layer 1: Frontend (React 19 + TypeScript + Vite), ⚡ Layer 2: API & Gateway (FastAPI + Cloudflare Workers) (+18 more)

### Community 116 - "7. AI and Detection Methods"
Cohesion: 0.33
Nodes (6): 1. Machine Learning Forecasting (GDN & MLP), 2. Fixed Rules, Timing, and Graph Calculations, 3. Generative AI: AI Pilot (Google Gemini), 7. AI and Detection Methods, What Confidence Scores Mean (and What They Do Not Mean), What Happens When an AI Service Fails

### Community 117 - "isolation.py"
Cohesion: 0.29
Nodes (6): Arm, _isolate(), _open_incident(), run_isolation(), _spec(), _summary()

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

### Community 131 - "test_copilot.py"
Cohesion: 0.31
Nodes (6): client(), test_copilot_chat(), test_copilot_suggestions(), test_no_active_incident_has_no_action(), test_unknown_requested_incident_returns_404(), test_virtual_sensor_isolation()

### Community 132 - "IncidentStore"
Cohesion: 0.24
Nodes (4): build_live_runtime(), IncidentStore, lifespan(), test_store_only_returns_its_own_mode()

### Community 133 - "14. Glossary and References"
Cohesion: 0.67
Nodes (3): 14. Glossary and References, Plain-English Glossary, Verified Academic and Industry References

### Community 134 - "6. Technologies and Their Purpose"
Cohesion: 0.67
Nodes (3): 6. Technologies and Their Purpose, Required Runtime vs. Optional / Development Tools, Technology Breakdown Table

### Community 135 - "layout.test.ts"
Cohesion: 0.27
Nodes (8): groupLayout(), layerLayout(), LayoutEdge, Pos, processOf(), edges, IDS, PID

### Community 137 - "load_tagmap"
Cohesion: 0.17
Nodes (10): ReadError, load_tagmap(), test_shipped_tagmap_is_valid_and_complete(), FakeClient, poller(), test_a_partial_read_failure_keeps_the_other_tags(), test_backoff_grows_is_capped_and_resets(), test_reads_are_batched_by_contiguous_block() (+2 more)

### Community 140 - "best_f1"
Cohesion: 0.40
Nodes (3): best_f1(), score(), smooth()

### Community 141 - "main.tsx"
Cohesion: 0.40
Nodes (3): root, @fontsource/inter, @fontsource/jetbrains-mono

## Knowledge Gaps
- **11 isolated node(s):** `attacktrace`, `echarts`, `echarts-for-react`, `@types/node`, `@types/react` (+6 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1052 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **31 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `3.10 LIVE ingestion: a real industrial protocol` connect `incident.render.test.ts` to `test_emulator.py`, `Plant`, `Rest`?**
  _High betweenness centrality (0.314) - this node is a cross-community bridge._
- **Are the 98 inferred relationships involving `Engine` (e.g. with `🧠 Layer 3: Services & Detection Engine` and `_engine()`) actually correct?**
  _`Engine` has 98 INFERRED edges - model-reasoned connections that need verification._
- **What connects `attacktrace`, `echarts`, `echarts-for-react` to the rest of the system?**
  _11 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `numpy` be split into smaller, more focused modules?**
  _Cohesion score 0.09643483343074226 - nodes in this community are weakly interconnected._
- **Are the 33 inferred relationships involving `Settings` (e.g. with `prepare_storage()` and `validate()`) actually correct?**
  _`Settings` has 33 INFERRED edges - model-reasoned connections that need verification._
- **Should `react` be split into smaller, more focused modules?**
  _Cohesion score 0.05502392344497608 - nodes in this community are weakly interconnected._
- **Should `argparse` be split into smaller, more focused modules?**
  _Cohesion score 0.0786308973172988 - nodes in this community are weakly interconnected._