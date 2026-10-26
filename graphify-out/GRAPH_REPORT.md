# Graph Report - Attacktrace  (2026-10-26)

## Corpus Check
- 408 files · ~1,152,096 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 57 file(s) not represented in the graph (top: (none) 22, .pt 12, .log 8)

## Summary
- 3137 nodes · 9691 edges · 144 communities (115 shown, 29 thin omitted)
- Extraction: 90% EXTRACTED · 10% INFERRED · 0% AMBIGUOUS · INFERRED: 929 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `58aef2b1`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- numpy
- test_eval_baseline.py
- deploy.py
- geometry.ts
- IsolateButton.tsx
- app/engine.py
- IncidentPanel.tsx
- PlantEmulator
- LiveConfig
- test_gateway.py
- Timeline.tsx
- load_detector
- localization.py
- voice.py
- vitest
- TagMap
- TopBar.tsx
- react
- LiveRuntime
- Rest
- graph/__init__.py
- test_hai.py
- AttackerClient
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
- LiveSource
- pipeline.py
- classify_language
- Authentication
- sim/__init__.py
- RateLimiter
- lab.py
- LiveEngine
- hashlib
- Package
- eval/hai.py
- app/config.py
- IncidentPanel.tsx
- app/engine.py
- ModelRouter
- create_app
- AttackTrace UI and navigation repair — 16 October 2026
- LIVE calibration fix and next implementation plan
- Devdependencies
- incident.render.test.ts
- live.py
- quality.py
- test_report.py
- Compileroptions
- GraphView.tsx
- BaselineDetector
- json
- Engine
- demo_trials.py
- useUi
- MetricsPage.tsx
- 13. Questions and Answers for Reviewers & Judges
- AttackTrace_Slides.md
- Private-server release plan — 16 October 2026
- test_startup.py
- test_journal_backup.py
- AttackTrace: Project Explained & Comprehensive Presentation Guide
- Screenshots
- asyncio
- sim/__init__.py
- Dependencies
- live_voice.py
- 12. Presentation-Ready Content (PowerPoint Slide Deck)
- pytest
- Plant
- firebase.ts
- ReadOnlyModbus
- Screenshots
- AI Pilot · Signal Room design plan
- Scripts
- argparse
- Test
- Vercel
- Test
- sys
- 10. Results and Evaluation
- test_sim_speed.py
- Voicecaptureprocessor
- AttackTrace AI Pilot model registry and verification
- Attacktrace
- Incident evidence delivery — 15 October 2026
- AttackTrace: proposed SOC and Twin/Graph enhancement plan
- 3. How the Project Works: The Complete Walkthrough
- check_host
- VOICE_ASSISTANT.md
- Presenter cheat sheet (one page)
- AttackTrace
- 7. AI and Detection Methods
- RobustnessPanel.tsx
- Demo script (3 minutes)
- QA_Prep.md
- 11. Limitations and Future Improvements
- 1. Project Overview
- index.js
- 2. Problem Statement and Objectives
- python-dependency-audit.json
- test_copilot.py
- attacker/cli.py
- 14. Glossary and References
- 6. Technologies and Their Purpose
- hai_models
- _windows
- test_live_connectors.py
- isolation.py
- AttackEngine
- AttackSpec
- LiveEvalState
- emu
- hai_pipeline.py

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
10. `react` - 55 edges

## Surprising Connections (you probably didn't know these)
- `2. Fixed Rules, Timing, and Graph Calculations` --references--> `aggregate()`  [INFERRED]
  PROJECT_EXPLAINED.md → backend/app/detect/detector.py
- `⚡ Layer 2: API & Gateway` --references--> `create_app()`  [INFERRED]
  ARCHIFY_ARCHITECTURE_MAP.md → backend/app/main.py
- `⚡ Layer 2: API & Gateway (FastAPI + Cloudflare Workers)` --references--> `create_app()`  [INFERRED]
  README.md → backend/app/main.py
- `4. Authentication, Authorization & Security Flow` --references--> `RateLimiter`  [INFERRED]
  ARCHIFY_ARCHITECTURE_MAP.md → backend/app/api/security.py
- `3.10 LIVE ingestion: a real industrial protocol` --references--> `live()`  [INFERRED]
  submission/AttackTrace_Documentation.md → backend/app/api/ws.py

## Import Cycles
- None detected.

## Communities (144 total, 29 thin omitted)

### Community 0 - "numpy"
Cohesion: 0.09
Nodes (35): static_graph(), break_ties(), causal_term(), combine_onsets(), deviation_term(), first_crossings(), localize(), onset_term() (+27 more)

### Community 1 - "test_eval_baseline.py"
Cohesion: 0.24
Nodes (9): simulate(), baseline_rank(), test_baseline_flags_large_offset(), test_simulate_shape_and_labels(), fitted(), test_baseline_saved_before_names_existed_still_works(), test_missed_attacks_count_as_misses(), test_rank_breaks_ties_by_larger_deviation() (+1 more)

### Community 2 - "deploy.py"
Cohesion: 0.18
Nodes (9): check_identity(), DeploymentError, main(), prepare_storage(), validate(), configured(), test_private_entrypoint_rejects_unsigned_emulator(), test_storage_requires_mount_and_preserves_journal_and_models() (+1 more)

### Community 3 - "geometry.ts"
Cohesion: 0.07
Nodes (53): NodeScores(), NodeAttack, ATTACK_STROKE, AttackChip(), BandProps, ChipProps, DriftMark(), DriftProps (+45 more)

### Community 4 - "IsolateButton.tsx"
Cohesion: 0.16
Nodes (18): MODES, ModeToggle(), html(), Access, AccessContext, useAccess(), IsolateButton(), advance() (+10 more)

### Community 5 - "app/engine.py"
Cohesion: 0.09
Nodes (15): topology_of(), Runtime, AlertInfo, AttackResponse, CalibrationInfo, GroundTruthInfo, IsolateRequest, IsolateResponse (+7 more)

### Community 6 - "IncidentPanel.tsx"
Cohesion: 0.17
Nodes (19): EmptyState(), ImpactMeters(), Meter(), tone(), Details(), IncidentPanel(), PlantIntegrityGuard(), Reveal() (+11 more)

### Community 7 - "PlantEmulator"
Cohesion: 0.08
Nodes (15): LabProxy, evaluate(), free_port(), emu(), free_port(), test_real_time_loop_health_and_clean_shutdown(), test_stop_before_start_is_safe(), port() (+7 more)

### Community 8 - "LiveConfig"
Cohesion: 0.14
Nodes (6): LiveConfig, LiveConfigError, IncidentStore, test_bad_config_fails_fast_with_a_clear_message(), test_missing_or_broken_tagmap_is_a_config_error(), test_store_only_returns_its_own_mode()

### Community 9 - "test_gateway.py"
Cohesion: 0.11
Nodes (5): GatewayBoundary, gateway_app(), test_direct_origin_denied_even_for_auth_config_and_docs(), test_local_mode_is_unchanged_without_an_origin_secret(), test_stream_requires_gateway_secret_before_upgrade()

### Community 10 - "Timeline.tsx"
Cohesion: 0.09
Nodes (45): App(), Center(), ViewToggle(), useFreshness(), collapseIcon(), ResizeHandle, ResizeHandleProps, COLLAPSE_KEY (+37 more)

### Community 11 - "load_detector"
Cohesion: 0.15
Nodes (14): load_baseline(), load_detector(), build_engine(), safe_ensure_metrics(), analyze(), main(), _pct(), analyze() (+6 more)

### Community 12 - "localization.py"
Cohesion: 0.12
Nodes (17): Run, build_incident(), Weights, Row, rows(), summarize(), tune_margin(), tuning_rows() (+9 more)

### Community 13 - "voice.py"
Cohesion: 0.21
Nodes (9): capabilities(), _interaction(), _key(), _limit(), _output_audio(), _output_text(), SpeechRequest, synthesize() (+1 more)

### Community 14 - "vitest"
Cohesion: 0.10
Nodes (27): CalibratingState(), html(), ProgressRing(), CopilotAnswer(), HypothesisCard(), InlineText(), Lines(), ParsedSection (+19 more)

### Community 15 - "TagMap"
Cohesion: 0.07
Nodes (5): ModbusPoller, ReadOnlyClient, Tag, TagMap, SlowClient

### Community 16 - "TopBar.tsx"
Cohesion: 0.11
Nodes (25): SOURCE_NAMES, TopBar(), SourcePill(), STYLE, base, html(), StatusPill(), STYLE (+17 more)

### Community 17 - "react"
Cohesion: 0.04
Nodes (78): MetricsPage, Root(), Route(), SocPage, VoiceSettingsPage, WorkspaceLoading(), WorkspacePage, narrated (+70 more)

### Community 18 - "LiveRuntime"
Cohesion: 0.07
Nodes (9): 🧠 Layer 3: Services & Detection Engine, LiveAttackLauncher, LiveRuntime, test_attack_refused_while_live_is_calibrating(), test_restart_resumes_rows_and_marks_a_gap(), emulator_runtime(), free_port(), test_training_failure_preserves_data_and_requires_explicit_retry() (+1 more)

### Community 19 - "Rest"
Cohesion: 0.09
Nodes (29): control_hai_replay(), _engine(), get_hai_replay(), get_incident_report(), get_incidents(), get_live_health(), get_metrics(), get_status() (+21 more)

### Community 20 - "graph/__init__.py"
Cohesion: 0.14
Nodes (9): adjacency(), learn_granger_edges(), learn_var_edges(), learned_graph(), merge_graph(), save_graph(), test_adjacency_lists_parents(), test_granger_finds_lagged_cause() (+1 more)

### Community 21 - "test_hai.py"
Cohesion: 0.07
Nodes (33): HaiData, node_kind(), hai_models_ready(), load_hai_baseline(), load_hai_detector(), HaiEngine, build_hai_engine(), client() (+25 more)

### Community 22 - "AttackerClient"
Cohesion: 0.16
Nodes (7): AttackerClient, AttackerError, AttackRecord, _neutral(), _surface_tag(), check_out_of_range(), test_audit_log_has_one_line_per_write()

### Community 23 - "copilot.py"
Cohesion: 0.12
Nodes (14): bounded_chat(), get_copilot_engine(), get_suggestions(), post_chat(), assess_layers(), evidence_priority(), suggestions(), CopilotChatRequest (+6 more)

### Community 24 - "Write"
Cohesion: 0.10
Nodes (20): analyze(), main(), analyze(), main(), analyze(), _ece_brier(), main(), analyze() (+12 more)

### Community 25 - "test_api.py"
Cohesion: 0.18
Nodes (11): client(), test_attack_validation(), test_incidents_and_reset(), test_live_loop_survives_a_failing_tick(), test_metrics(), test_metrics_merges_live_metrics_without_touching_the_file(), test_status_and_mode(), test_topology() (+3 more)

### Community 26 - "time"
Cohesion: 0.15
Nodes (23): digest(), loaded_context(), runtime_context(), LiveMessage, NodeState, SocStore, message(), test_api_export_and_archived_copilot_use_original_capture() (+15 more)

### Community 27 - "types.ts"
Cohesion: 0.07
Nodes (54): useLiveSourcePoll(), Message, EvidenceList(), formatCategory(), IncidentEvidencePanel(), detail, GraphView, LabStatus (+46 more)

### Community 28 - "Grounding"
Cohesion: 0.16
Nodes (23): _build_context_summary(), CopilotEngine, _get_gemini_key(), incident_evidence_summary(), local_checks(), _offline_expert_reply(), CopilotTurn, Incident (+15 more)

### Community 29 - "test_robustness.py"
Cohesion: 0.17
Nodes (19): model_fingerprints(), PlantParams, assess_calibration(), Case, evaluate_case(), fit_calibration(), observations(), probability() (+11 more)

### Community 30 - "gateway/package.json"
Cohesion: 0.08
Nodes (20): devDependencies, miniflare, engines, node, name, overrides, sharp, undici (+12 more)

### Community 31 - "json"
Cohesion: 0.25
Nodes (14): asset_registers(), baseline_comparison(), capture(), detail(), evidence(), export(), journal(), progress() (+6 more)

### Community 32 - "test_emulator.py"
Cohesion: 0.14
Nodes (19): TagMapError, client_for(), mutate(), raw_map(), read_values(), run_ticks(), test_a_rogue_setpoint_moves_the_plant(), test_a_sensor_offset_fools_the_controller() (+11 more)

### Community 33 - "test_authentication.py"
Cohesion: 0.29
Nodes (9): headers(), login(), test_analyst_decisions_record_verified_actor(), test_login_cookie_membership_and_csrf(), test_logout_invalidates_copied_cookie_and_stream(), test_missing_server_credentials_fail_closed(), test_repeated_signins_have_distinct_server_sessions(), test_session_expiry_is_enforced_even_with_cached_identity() (+1 more)

### Community 34 - "verify_ai_models.py"
Cohesion: 0.24
Nodes (7): gemini_key(), _audio(), _interaction(), _live_check(), _result(), _speech_body(), verify()

### Community 35 - "attack.ts"
Cohesion: 0.05
Nodes (48): Props, ATTACK_LABEL, AttackKind, attacksByNode(), detailFor(), fmt(), INFER_WINDOW, inferSensorKind() (+40 more)

### Community 37 - "LiveSource"
Cohesion: 0.15
Nodes (11): LiveSource, Snapshot, LiveRecorder, record(), check_slow_network(), free_port(), test_connection_refused_is_down_not_a_crash(), test_source_not_ready_until_every_node_was_read() (+3 more)

### Community 38 - "pipeline.py"
Cohesion: 0.09
Nodes (18): fit_err_sd(), ForecastDetector, residuals(), build_model(), GDN, make_windows(), MLPForecaster, Norm (+10 more)

### Community 39 - "classify_language"
Cohesion: 0.13
Nodes (15): classify_language(), detect_unsupported_script(), has_tamil_characters(), is_self_echo(), LanguageClassification, sanitize_response_text(), tokenize_words(), gemini_to_browser() (+7 more)

### Community 40 - "Authentication"
Cohesion: 0.19
Nodes (13): check_origin(), config(), firebase_app(), identity(), logout(), me(), names(), protect() (+5 more)

### Community 41 - "sim/__init__.py"
Cohesion: 0.10
Nodes (9): GroundTruth, action_for(), explain(), Explanation, signature(), NodeSpec, NodeType, test_explanation_templates() (+1 more)

### Community 42 - "RateLimiter"
Cohesion: 0.12
Nodes (12): 1. Five-Layer Architecture Map, 2. Layer-by-Layer Breakdown & Source Evidence, 3. End-to-End User Workflows, 4. Authentication, Authorization & Security Flow, AttackTrace: Full Interactive Architecture Map, 🌐 Interactive Visualization Artifacts, 🎨 Layer 1: Frontend, ⚡ Layer 2: API & Gateway (+4 more)

### Community 43 - "lab.py"
Cohesion: 0.17
Nodes (15): configure(), emulator_info(), exclusive(), integrity(), ManifestChange, observe_integrity(), probe(), proxy() (+7 more)

### Community 44 - "LiveEngine"
Cohesion: 0.11
Nodes (5): worst_impact(), LiveEngine, SourceNotReadyError, Impact, test_impact_snapshot_keeps_the_worst_values()

### Community 45 - "hashlib"
Cohesion: 0.43
Nodes (3): make_dataset(), _signals(), _write()

### Community 46 - "Package"
Cohesion: 0.08
Nodes (26): name, overrides, @grpc/grpc-js, private, type, version, root, autoprefixer (+18 more)

### Community 47 - "eval/hai.py"
Cohesion: 0.08
Nodes (22): hai_paths(), HaiFile, load_hai(), load_hai_replay(), process_of(), _read(), _read_csv(), HaiLoaded (+14 more)

### Community 48 - "app/config.py"
Cohesion: 0.12
Nodes (17): _from_env(), get_settings(), build_engine(), check_emulator_down(), _free_port(), main(), main_async(), main() (+9 more)

### Community 49 - "IncidentPanel.tsx"
Cohesion: 0.13
Nodes (23): Panel(), PanelProps, AttackConsole(), HaiReplayPanel(), offset(), MagnitudeField(), Props, controlHaiReplay() (+15 more)

### Community 50 - "app/engine.py"
Cohesion: 0.10
Nodes (15): _Open, is_ambiguous(), origin_candidate(), Incident, Candidate, _cost(), hop_distance(), PathNode (+7 more)

### Community 51 - "ModelRouter"
Cohesion: 0.18
Nodes (11): classify_failure(), Failure, ModelRouter, _retry_after(), _status_code(), test_live_greeting_states_only_observed_status(), test_model_pool_rejects_cross_modality(), test_preferred_model_fails_over_after_rate_limit() (+3 more)

### Community 52 - "create_app"
Cohesion: 0.11
Nodes (24): Settings, build_live_runtime(), create_app(), secured(), test_gateway_secret_does_not_replace_firebase_identity(), test_default_config_is_valid(), test_calibration_does_not_accept_subminimum_or_infinite_recordings(), test_calibration_restart_is_authenticated_and_refuses_an_active_trainer() (+16 more)

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
Cohesion: 0.28
Nodes (10): AttackResult, _false_alarm_per_hour(), main(), _pct(), _prf(), _rising_edges(), run(), Sample (+2 more)

### Community 58 - "quality.py"
Cohesion: 0.09
Nodes (10): Aligner, Sample, QualityTracker, TagSpec, _Track, _pct(), SourceStatus, TagHealth (+2 more)

### Community 59 - "test_report.py"
Cohesion: 0.09
Nodes (20): _eta(), render_report(), para(), _utc(), ascii_text(), _escape(), Page, text_width() (+12 more)

### Community 60 - "Compileroptions"
Cohesion: 0.11
Nodes (17): compilerOptions, isolatedModules, jsx, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch (+9 more)

### Community 61 - "GraphView.tsx"
Cohesion: 0.07
Nodes (43): edgeDelay(), edgeId(), layoutEdges(), MIN_LEARNED_WEIGHT, visibleEdges(), filterAssets(), FocusDirection, graphLinks() (+35 more)

### Community 62 - "BaselineDetector"
Cohesion: 0.10
Nodes (36): Hub, BaselineDetector, Loaded, load_live(), make_live(), test_attack_endpoint_writes_to_the_emulator_and_reveals_ground_truth(), test_demo_mode_off_blocks_live_attack_before_the_attacker_is_ever_called(), test_source_contract_changes_with_endpoint_or_register_mapping() (+28 more)

### Community 63 - "json"
Cohesion: 0.11
Nodes (13): load_graph(), read_checkpoint(), source_fingerprint(), write_checkpoint(), live_dir(), live_models_ready(), main(), train_live() (+5 more)

### Community 64 - "Engine"
Cohesion: 0.08
Nodes (28): Engine, _has_hazard(), _Open, AttackRequest, _open_incident(), run(), test_attack_produces_localized_incident(), test_clean_run_raises_no_incident() (+20 more)

### Community 65 - "demo_trials.py"
Cohesion: 0.26
Nodes (12): build_report(), main(), pair_key(), _pick_primary_backup(), _rank(), run_live(), run_sim(), run_sim_trial() (+4 more)

### Community 66 - "useUi"
Cohesion: 0.19
Nodes (16): AssetInspector(), IncidentProgress(), ResponseEvent, GraphView, ProcessWorkspace(), stateAtDetection(), TwinView(), TwinViewProps (+8 more)

### Community 67 - "MetricsPage.tsx"
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
Cohesion: 0.15
Nodes (9): ensure_metrics(), Counts, evaluate(), _onsets(), test_a_failing_metrics_step_never_stops_startup(), test_existing_metrics_are_never_overwritten(), test_first_start_writes_metrics_once(), fake() (+1 more)

### Community 73 - "test_journal_backup.py"
Cohesion: 0.33
Nodes (3): test_backup_includes_committed_wal_and_closes_output(), test_backup_refuses_to_replace_existing_data(), backup()

### Community 74 - "AttackTrace: Project Explained & Comprehensive Presentation Guide"
Cohesion: 0.18
Nodes (10): 4. Features and Screens, 5. System Architecture, 8. Data Modes and Operational Evidence, 9. Implementation Details & File-to-Feature Map, Architecture Diagram, AttackTrace: Project Explained & Comprehensive Presentation Guide, File-to-Feature Map, Folder Structure Overview (+2 more)

### Community 75 - "Screenshots"
Cohesion: 0.35
Nodes (10): ambiguousShot(), { chromium }, errors, haiIncident(), log, require, shot(), simViews() (+2 more)

### Community 76 - "asyncio"
Cohesion: 0.11
Nodes (6): alter_response(), frame(), decode(), encode(), test_encoding_round_trips(), test_proxy_rejects_transaction_mismatch()

### Community 77 - "sim/__init__.py"
Cohesion: 0.08
Nodes (8): NoOverlay, Overlay, PID, _clip(), Impact, _time_to(), BenignOverlay, test_pid_clamps_and_antiwindup()

### Community 78 - "Dependencies"
Cohesion: 0.17
Nodes (12): dependencies, echarts, echarts-for-react, firebase, @fontsource/inter, @fontsource/jetbrains-mono, framer-motion, lucide-react (+4 more)

### Community 79 - "live_voice.py"
Cohesion: 0.14
Nodes (10): _authenticate(), connect_model(), live_voice(), browser_to_gemini(), opening_prompt(), process_snapshot(), session_config(), test_live_extended_thinking_has_required_configuration() (+2 more)

### Community 80 - "12. Presentation-Ready Content (PowerPoint Slide Deck)"
Cohesion: 0.18
Nodes (11): 12. Presentation-Ready Content (PowerPoint Slide Deck), Slide 10: Conclusion & The Future of Industrial Defense, Slide 1: Title & Executive Summary, Slide 2: The Problem: Invisible Threats to Critical Infrastructure, Slide 3: The Alarm Flood Dilemma, Slide 4: The AttackTrace Solution, Slide 5: System Architecture & Data Modes, Slide 6: Live Case Study: The Tank 1 Level Attack (+3 more)

### Community 81 - "pytest"
Cohesion: 0.28
Nodes (14): Scenario, attacker_for(), read(), test_a_refused_write_never_reaches_the_emulator(), test_actuator_force_writes_and_clears_to_no_override(), test_attacker_client_refuses_to_construct_against_a_bad_host(), test_close_cancels_pending_clears(), test_ground_truth_is_recorded_in_the_emulator() (+6 more)

### Community 82 - "Plant"
Cohesion: 0.16
Nodes (17): _fmt_eta(), main(), Plant, test_attack_ends_after_duration(), test_freeze_does_not_leak_across_reset(), test_large_offset_creates_overflow_risk(), test_sensor_freeze_holds_reported_value(), test_sensor_ramp_drifts_linearly() (+9 more)

### Community 84 - "ReadOnlyModbus"
Cohesion: 0.16
Nodes (5): bounded(), ReadError, ReadOnlyModbus, slow_factory(), test_a_silent_server_times_out_instead_of_hanging()

### Community 85 - "Screenshots"
Cohesion: 0.24
Nodes (8): { chromium }, errors, liveViews(), log, require, shot(), SIZES, sleep()

### Community 86 - "AI Pilot · Signal Room design plan"
Cohesion: 0.33
Nodes (5): AI Pilot · Signal Room design plan, Design references, Implementation flow, Master idea, Reusable implementation prompt

### Community 87 - "Scripts"
Cohesion: 0.25
Nodes (8): scripts, build, dev, e2e, lint, preview, test, typecheck

### Community 88 - "argparse"
Cohesion: 0.18
Nodes (8): anonymous_stream_denied(), main(), NoRedirect, origin(), public_streams_available(), read(), require(), main()

### Community 90 - "Vercel"
Cohesion: 0.29
Nodes (6): buildCommand, framework, headers, outputDirectory, rewrites, $schema

### Community 91 - "Test"
Cohesion: 0.33
Nodes (4): css, spec, postcss, @tailwindcss/postcss

### Community 92 - "sys"
Cohesion: 0.08
Nodes (18): click_path(), main(), post(), wait_healthy(), get_json(), main(), fetch(), check() (+10 more)

### Community 93 - "10. Results and Evaluation"
Cohesion: 0.29
Nodes (7): 10. Results and Evaluation, 1. Detection Performance (Evaluated on 50 Attack Runs & 20 Clean Runs), 2. Root-Cause Localization Accuracy, 3. Self-Healing Containment Success, 4. What Performed Well vs. What Performed Poorly, 5. HAI 20.07 Real-World Dataset Results, 6. What These Results Cannot Prove

### Community 94 - "test_sim_speed.py"
Cohesion: 0.16
Nodes (9): client(), test_emit_period_never_runs_away(), test_fast_demo_shortens_only_the_gap_between_samples(), test_only_sim_may_be_accelerated(), test_pacing_is_refused_outside_sim(), test_pacing_returns_to_normal(), test_sim_starts_at_normal_pacing(), test_the_attack_itself_is_unchanged_by_pacing() (+1 more)

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

### Community 112 - "check_host"
Cohesion: 0.21
Nodes (8): allowed_hosts(), AllowlistError, check_host(), is_loopback(), test_allowed_hosts_pass(), test_extra_hosts_come_only_from_the_explicit_allowlist(), test_is_loopback(), test_other_hosts_are_refused()

### Community 114 - "Presenter cheat sheet (one page)"
Cohesion: 0.29
Nodes (6): Click path (SIM), Fast facts if asked, Headline numbers (say the n, not just the %), If LIVE fails mid-demo, If Top-1 is wrong, Presenter cheat sheet (one page)

### Community 115 - "AttackTrace"
Cohesion: 0.07
Nodes (25): 🏛 5-Layer System Architecture (Graphify Mapped), AttackTrace, 📊 Benchmark & Evaluation Results, 🔄 End-to-End Incident Lifecycle, 🗺 Graphify Codebase Navigation, 🎮 Interactive Live Demo Script, 🎨 Layer 1: Frontend (React 19 + TypeScript + Vite), ⚡ Layer 2: API & Gateway (FastAPI + Cloudflare Workers) (+17 more)

### Community 116 - "7. AI and Detection Methods"
Cohesion: 0.33
Nodes (6): 1. Machine Learning Forecasting (GDN & MLP), 2. Fixed Rules, Timing, and Graph Calculations, 3. Generative AI: AI Pilot (Google Gemini), 7. AI and Detection Methods, What Confidence Scores Mean (and What They Do Not Mean), What Happens When an AI Service Fails

### Community 117 - "RobustnessPanel.tsx"
Cohesion: 0.25
Nodes (14): percent(), ReliabilityTable(), RobustnessPanel(), score(), seconds(), finite(), nullable(), numbers() (+6 more)

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

### Community 132 - "attacker/cli.py"
Cohesion: 0.39
Nodes (5): main(), parse_args(), run(), load_attacker(), test_cli_rejects_a_non_allowlisted_host()

### Community 133 - "14. Glossary and References"
Cohesion: 0.67
Nodes (3): 14. Glossary and References, Plain-English Glossary, Verified Academic and Industry References

### Community 134 - "6. Technologies and Their Purpose"
Cohesion: 0.67
Nodes (3): 6. Technologies and Their Purpose, Required Runtime vs. Optional / Development Tools, Technology Breakdown Table

### Community 135 - "hai_models"
Cohesion: 0.40
Nodes (3): engine(), hai_dir(), hai_models()

### Community 137 - "test_live_connectors.py"
Cohesion: 0.11
Nodes (22): excluded_from_ranking(), load_tagmap(), lifespan(), FakeClient, poller(), settings(), source_with_samples(), test_a_corrupt_value_is_out_of_range_not_a_false_origin_input() (+14 more)

### Community 138 - "isolation.py"
Cohesion: 0.36
Nodes (5): Arm, _isolate(), run_isolation(), _spec(), _summary()

### Community 139 - "AttackEngine"
Cohesion: 0.23
Nodes (3): _Active, AttackEngine, test_ground_truth_recorded()

### Community 140 - "AttackSpec"
Cohesion: 0.30
Nodes (9): AttackSpec, _pair(), _run(), test_actuator_force_pump_off_stops_flow(), test_actuator_force_valve_open_wastes_energy(), test_attack_is_deterministic(), test_invalid_specs_rejected(), test_rogue_setpoint_moves_level() (+1 more)

### Community 145 - "hai_pipeline.py"
Cohesion: 0.09
Nodes (22): attack_run(), sample_attack(), aggregate(), alert_mask(), best_threshold(), rising_edges(), sustained(), split_tests() (+14 more)

## Knowledge Gaps
- **11 isolated node(s):** `attacktrace`, `echarts`, `echarts-for-react`, `@types/node`, `@types/react` (+6 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1048 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **29 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `3.10 LIVE ingestion: a real industrial protocol` connect `incident.render.test.ts` to `test_emulator.py`, `Plant`, `Rest`?**
  _High betweenness centrality (0.325) - this node is a cross-community bridge._
- **Are the 98 inferred relationships involving `Engine` (e.g. with `🧠 Layer 3: Services & Detection Engine` and `_engine()`) actually correct?**
  _`Engine` has 98 INFERRED edges - model-reasoned connections that need verification._
- **What connects `attacktrace`, `echarts`, `echarts-for-react` to the rest of the system?**
  _11 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `numpy` be split into smaller, more focused modules?**
  _Cohesion score 0.09468147282291058 - nodes in this community are weakly interconnected._
- **Are the 33 inferred relationships involving `Settings` (e.g. with `prepare_storage()` and `validate()`) actually correct?**
  _`Settings` has 33 INFERRED edges - model-reasoned connections that need verification._
- **Should `geometry.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07155399473222125 - nodes in this community are weakly interconnected._
- **Should `app/engine.py` be split into smaller, more focused modules?**
  _Cohesion score 0.09243697478991597 - nodes in this community are weakly interconnected._