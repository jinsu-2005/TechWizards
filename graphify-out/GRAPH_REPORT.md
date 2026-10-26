# Graph Report - Attacktrace  (2026-10-26)

## Corpus Check
- 407 files · ~1,151,729 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 57 file(s) not represented in the graph (top: (none) 22, .pt 12, .log 8)

## Summary
- 3120 nodes · 9643 edges · 155 communities (120 shown, 35 thin omitted)
- Extraction: 90% EXTRACTED · 10% INFERRED · 0% AMBIGUOUS · INFERRED: 924 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `aac2e877`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- numpy
- test_eval_baseline.py
- deploy.py
- Equipment.tsx
- IsolateButton.tsx
- app/engine.py
- GraphParts.tsx
- PlantEmulator
- test_live_runtime.py
- test_gateway.py
- Timeline.tsx
- Root.tsx
- localization.py
- voice.py
- CopilotAnswer.tsx
- ModbusPoller
- TopBar.tsx
- react
- LiveRuntime
- Rest
- learn_granger_edges
- test_hai.py
- pytest
- copilot.py
- Write
- test_api.py
- time
- types.ts
- Grounding
- test_robustness.py
- gateway/package.json
- json
- load_tagmap
- test_authentication.py
- verify_ai_models.py
- attack.ts
- LiveSource
- pipeline.py
- classify_language
- Authentication
- dataclasses
- RateLimiter
- lab.py
- data/hai.py
- hashlib
- Package
- eval/hai.py
- live_soak.py
- IncidentPanel.tsx
- Incident
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
- Settings
- test_journal_backup.py
- AttackTrace: Project Explained & Comprehensive Presentation Guide
- Screenshots
- asyncio
- sim/__init__.py
- Dependencies
- live_voice.py
- 12. Presentation-Ready Content (PowerPoint Slide Deck)
- Plant
- firebase.ts
- HaiEngine
- Screenshots
- AI Pilot · Signal Room design plan
- Scripts
- argparse
- Test
- Vercel
- Test
- sys
- 10. Results and Evaluation
- evaluate
- Voicecaptureprocessor
- AttackTrace AI Pilot model registry and verification
- Attacktrace
- Incident evidence delivery — 15 October 2026
- AttackTrace: proposed SOC and Twin/Graph enhancement plan
- 3. How the Project Works: The Complete Walkthrough
- TagMap
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
- RegisterOverlay
- theme.ts
- 14. Glossary and References
- 6. Technologies and Their Purpose
- hai_models
- _windows
- test_live_connectors.py
- geometry.ts
- AttackEngine
- AttackSpec
- load_hai_detector
- evaluate
- AttackTrace: Documentation
- 3. Method
- hai_experiments.py
- layout.test.ts
- process_of
- PID
- useDashboardLayout.ts
- 5. Results
- main.tsx
- secured
- test_transient_read_errors_are_retried

## God Nodes (most connected - your core abstractions)
1. `Engine` - 143 edges
2. `Settings` - 107 edges
3. `LiveRuntime` - 70 edges
4. `create_app()` - 66 edges
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
- `3.6 Confidence gate` --references--> `Ambiguous()`  [INFERRED]
  submission/AttackTrace_Documentation.md → frontend/src/features/incident/OriginCard.tsx
- `Novelty` --references--> `Ambiguous()`  [INFERRED]
  submission/AttackTrace_Documentation.md → frontend/src/features/incident/OriginCard.tsx

## Import Cycles
- None detected.

## Communities (155 total, 35 thin omitted)

### Community 0 - "numpy"
Cohesion: 0.09
Nodes (38): is_ambiguous(), static_graph(), break_ties(), Candidate, causal_term(), combine_onsets(), deviation_term(), first_crossings() (+30 more)

### Community 1 - "test_eval_baseline.py"
Cohesion: 0.26
Nodes (7): baseline_rank(), evaluate_baseline_localization(), fitted(), test_baseline_saved_before_names_existed_still_works(), test_missed_attacks_count_as_misses(), test_rank_breaks_ties_by_larger_deviation(), test_rank_puts_the_first_breaching_node_first()

### Community 2 - "deploy.py"
Cohesion: 0.18
Nodes (9): check_identity(), DeploymentError, main(), prepare_storage(), validate(), configured(), test_private_entrypoint_rejects_unsigned_emulator(), test_storage_requires_mount_and_preserves_journal_and_models() (+1 more)

### Community 3 - "Equipment.tsx"
Cohesion: 0.13
Nodes (30): NodeAttack, NOMINAL_SETPOINT, ATTACK_STROKE, AttackChip(), BandProps, ChipProps, DriftMark(), DriftProps (+22 more)

### Community 4 - "IsolateButton.tsx"
Cohesion: 0.20
Nodes (17): useAccess(), IsolateButton(), WorkflowPanelProps, postIsolate(), isActive(), advance(), begin(), candidateFor() (+9 more)

### Community 5 - "app/engine.py"
Cohesion: 0.11
Nodes (18): _Open, origin_candidate(), topology_of(), AlertInfo, CalibrationInfo, GroundTruthInfo, IsolateRequest, IsolateResponse (+10 more)

### Community 6 - "GraphParts.tsx"
Cohesion: 0.11
Nodes (27): GraphNode, PlantNode, PlantNodeData, PlantNodeView(), PulseEdgeData, PulseEdgeT, PulseEdgeView(), StageData (+19 more)

### Community 7 - "PlantEmulator"
Cohesion: 0.10
Nodes (24): emu(), free_port(), test_attack_endpoint_writes_to_the_emulator_and_reveals_ground_truth(), test_attack_refused_while_live_is_calibrating(), client_for(), emu(), free_port(), read_values() (+16 more)

### Community 8 - "test_live_runtime.py"
Cohesion: 0.12
Nodes (18): Hub, IncidentStore, collect(), emulator_runtime(), free_port(), live_settings(), test_a_source_that_goes_away_shows_down_not_a_crash(), test_calibration_does_not_accept_subminimum_or_infinite_recordings() (+10 more)

### Community 9 - "test_gateway.py"
Cohesion: 0.11
Nodes (6): GatewayBoundary, gateway_app(), test_direct_origin_denied_even_for_auth_config_and_docs(), test_gateway_secret_does_not_replace_firebase_identity(), test_local_mode_is_unchanged_without_an_origin_secret(), test_stream_requires_gateway_secret_before_upgrade()

### Community 10 - "Timeline.tsx"
Cohesion: 0.10
Nodes (43): App(), Center(), ViewToggle(), useFreshness(), collapseIcon(), ResizeHandle, ResizeHandleProps, useDashboardLayout() (+35 more)

### Community 11 - "Root.tsx"
Cohesion: 0.15
Nodes (21): MetricsPage, Root(), Route(), SocPage, VoiceSettingsPage, WorkspaceLoading(), WorkspacePage, useLiveSourcePoll() (+13 more)

### Community 12 - "localization.py"
Cohesion: 0.09
Nodes (29): attack_run(), Run, sample_attack(), Weights, Row, rows(), summarize(), tune_margin() (+21 more)

### Community 13 - "voice.py"
Cohesion: 0.19
Nodes (9): capabilities(), _interaction(), _key(), _limit(), _output_audio(), _output_text(), SpeechRequest, synthesize() (+1 more)

### Community 14 - "CopilotAnswer.tsx"
Cohesion: 0.39
Nodes (7): CopilotAnswer(), HypothesisCard(), InlineText(), Lines(), ParsedSection, parseSections(), SECTION_ICONS

### Community 15 - "ModbusPoller"
Cohesion: 0.12
Nodes (4): ModbusPoller, ReadOnlyClient, slow_factory(), SlowClient

### Community 16 - "TopBar.tsx"
Cohesion: 0.06
Nodes (48): SOURCE_NAMES, TopBar(), MODES, ModeToggle(), Props, html(), SourcePill(), STYLE (+40 more)

### Community 17 - "react"
Cohesion: 0.06
Nodes (58): narrated, topoIndex, topologyIndex(), useLiveStream(), AttackBriefing(), DIRECTION_ICON, DIRECTION_LABEL, PHASE_ICON (+50 more)

### Community 18 - "LiveRuntime"
Cohesion: 0.09
Nodes (7): 🧠 Layer 3: Services & Detection Engine, LiveRuntime, test_restart_resumes_rows_and_marks_a_gap(), test_calibrating_has_progress_no_alerts_and_then_runs(), test_calibration_reports_quality_blocker_and_recovers(), test_training_failure_preserves_data_and_requires_explicit_retry(), 🧠 Layer 3: Services & Core Detection Engine

### Community 19 - "Rest"
Cohesion: 0.09
Nodes (29): control_hai_replay(), _engine(), get_hai_replay(), get_incident_report(), get_incidents(), get_live_health(), get_metrics(), get_status() (+21 more)

### Community 20 - "learn_granger_edges"
Cohesion: 0.20
Nodes (6): learn_granger_edges(), learn_var_edges(), test_adjacency_lists_parents(), test_granger_finds_lagged_cause(), test_merge_keeps_static_and_downweights_learned(), test_static_graph_matches_pid()

### Community 21 - "test_hai.py"
Cohesion: 0.14
Nodes (20): HaiData, split_tests(), process_scores(), truth_processes(), client(), data(), hai_engine(), test_detector_metrics_on_a_known_alert_pattern() (+12 more)

### Community 22 - "pytest"
Cohesion: 0.08
Nodes (32): allowed_hosts(), AllowlistError, check_host(), is_loopback(), main(), parse_args(), run(), AttackerClient (+24 more)

### Community 23 - "copilot.py"
Cohesion: 0.12
Nodes (14): bounded_chat(), get_copilot_engine(), get_suggestions(), post_chat(), suggestions(), CopilotChatResponse, test_timed_out_provider_keeps_capacity_until_worker_finishes(), chat() (+6 more)

### Community 24 - "Write"
Cohesion: 0.11
Nodes (15): analyze(), main(), analyze(), main(), analyze(), main(), _pct(), analyze() (+7 more)

### Community 25 - "test_api.py"
Cohesion: 0.12
Nodes (14): Runtime, AttackResponse, LiveMessage, client(), test_attack_validation(), test_incidents_and_reset(), test_live_loop_survives_a_failing_tick(), test_metrics() (+6 more)

### Community 26 - "time"
Cohesion: 0.16
Nodes (21): digest(), loaded_context(), runtime_context(), SocStore, message(), test_api_export_and_archived_copilot_use_original_capture(), test_capture_integrity_failure_never_returns_modified_payload(), test_capture_is_immutable_survives_reopen_and_telemetry_rotation() (+13 more)

### Community 27 - "types.ts"
Cohesion: 0.09
Nodes (36): CalibratingState(), html(), ProgressRing(), Access, AccessContext, IncidentEvidencePanel(), detail, GraphView (+28 more)

### Community 28 - "Grounding"
Cohesion: 0.16
Nodes (23): _build_context_summary(), CopilotEngine, _get_gemini_key(), incident_evidence_summary(), local_checks(), _offline_expert_reply(), CopilotChatRequest, CopilotTurn (+15 more)

### Community 29 - "test_robustness.py"
Cohesion: 0.13
Nodes (19): model_fingerprints(), assess_calibration(), BenignOverlay, Case, evaluate_case(), fit_calibration(), observations(), probability() (+11 more)

### Community 30 - "gateway/package.json"
Cohesion: 0.08
Nodes (20): devDependencies, miniflare, engines, node, name, overrides, sharp, undici (+12 more)

### Community 31 - "json"
Cohesion: 0.25
Nodes (14): asset_registers(), baseline_comparison(), capture(), detail(), evidence(), export(), journal(), progress() (+6 more)

### Community 32 - "load_tagmap"
Cohesion: 0.17
Nodes (7): load_tagmap(), TagMapError, mutate(), raw_map(), test_invalid_tagmaps_are_rejected(), test_load_reports_readable_errors(), test_shipped_tagmap_is_valid_and_complete()

### Community 33 - "test_authentication.py"
Cohesion: 0.29
Nodes (9): headers(), login(), test_analyst_decisions_record_verified_actor(), test_login_cookie_membership_and_csrf(), test_logout_invalidates_copied_cookie_and_stream(), test_missing_server_credentials_fail_closed(), test_repeated_signins_have_distinct_server_sessions(), test_session_expiry_is_enforced_even_with_cached_identity() (+1 more)

### Community 34 - "verify_ai_models.py"
Cohesion: 0.24
Nodes (7): gemini_key(), _audio(), _interaction(), _live_check(), _result(), _speech_body(), verify()

### Community 35 - "attack.ts"
Cohesion: 0.06
Nodes (45): ATTACK_LABEL, AttackKind, attacksByNode(), detailFor(), fmt(), INFER_WINDOW, inferSensorKind(), KIND_OF (+37 more)

### Community 37 - "LiveSource"
Cohesion: 0.12
Nodes (18): load_live(), LiveSource, _pct(), Snapshot, SourceStatus, TagHealth, LiveRecorder, record() (+10 more)

### Community 38 - "pipeline.py"
Cohesion: 0.07
Nodes (32): simulate(), aggregate(), best_threshold(), fit_err_sd(), ForecastDetector, residuals(), build_model(), GDN (+24 more)

### Community 39 - "classify_language"
Cohesion: 0.13
Nodes (15): classify_language(), detect_unsupported_script(), has_tamil_characters(), is_self_echo(), LanguageClassification, sanitize_response_text(), tokenize_words(), gemini_to_browser() (+7 more)

### Community 40 - "Authentication"
Cohesion: 0.17
Nodes (15): check_origin(), config(), firebase_app(), identity(), logout(), me(), names(), protect() (+7 more)

### Community 41 - "dataclasses"
Cohesion: 0.08
Nodes (15): action_for(), explain(), Explanation, signature(), build_incident(), Incident, _cost(), hop_distance() (+7 more)

### Community 42 - "RateLimiter"
Cohesion: 0.12
Nodes (12): 1. Five-Layer Architecture Map, 2. Layer-by-Layer Breakdown & Source Evidence, 3. End-to-End User Workflows, 4. Authentication, Authorization & Security Flow, AttackTrace: Full Interactive Architecture Map, 🌐 Interactive Visualization Artifacts, 🎨 Layer 1: Frontend, ⚡ Layer 2: API & Gateway (+4 more)

### Community 43 - "lab.py"
Cohesion: 0.16
Nodes (15): configure(), emulator_info(), exclusive(), integrity(), ManifestChange, observe_integrity(), probe(), proxy() (+7 more)

### Community 44 - "data/hai.py"
Cohesion: 0.24
Nodes (6): hai_paths(), HaiFile, load_hai(), load_hai_replay(), _read(), _read_csv()

### Community 45 - "hashlib"
Cohesion: 0.43
Nodes (3): make_dataset(), _signals(), _write()

### Community 46 - "Package"
Cohesion: 0.09
Nodes (22): name, overrides, @grpc/grpc-js, private, type, version, autoprefixer, echarts (+14 more)

### Community 47 - "eval/hai.py"
Cohesion: 0.14
Nodes (17): alert_mask(), rising_edges(), sustained(), HaiLoaded, baseline_rank_nodes(), evaluate_detector(), evaluate_localization(), _first_alert() (+9 more)

### Community 48 - "live_soak.py"
Cohesion: 0.10
Nodes (28): load_baseline(), load_detector(), load_graph(), build_engine(), analyze(), _impact_with_vs_without(), _inference_timing(), main() (+20 more)

### Community 49 - "IncidentPanel.tsx"
Cohesion: 0.09
Nodes (32): Panel(), PanelProps, AttackConsole(), HaiReplayPanel(), offset(), MagnitudeField(), Props, NodeScores() (+24 more)

### Community 51 - "ModelRouter"
Cohesion: 0.18
Nodes (11): classify_failure(), Failure, ModelRouter, _retry_after(), _status_code(), test_live_greeting_states_only_observed_status(), test_model_pool_rejects_cross_modality(), test_preferred_model_fails_over_after_rate_limit() (+3 more)

### Community 52 - "create_app"
Cohesion: 0.16
Nodes (17): create_app(), test_sim_and_hai_attack_paths_are_unaffected(), test_voice_rejects_wrong_demo_key_before_gemini(), client(), make_client(), test_a_configured_key_still_works_regardless_of_host(), test_attack_endpoint_is_rate_limited(), test_demo_mode_off_blocks_attacks_only() (+9 more)

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
Cohesion: 0.22
Nodes (14): BreakdownBar(), BreakdownLegend(), f2(), SEGMENTS, html(), three, top, w (+6 more)

### Community 57 - "live.py"
Cohesion: 0.22
Nodes (11): AttackResult, _false_alarm_per_hour(), LiveEvalState, main(), _pct(), _prf(), _rising_edges(), run() (+3 more)

### Community 58 - "quality.py"
Cohesion: 0.11
Nodes (7): Aligner, Sample, QualityTracker, TagSpec, _Track, test_aligner_holds_the_last_value_until_max_age(), test_out_of_order_samples_are_dropped_and_counted()

### Community 59 - "test_report.py"
Cohesion: 0.08
Nodes (22): worst_impact(), _eta(), render_report(), para(), _utc(), ascii_text(), _escape(), Page (+14 more)

### Community 60 - "Compileroptions"
Cohesion: 0.11
Nodes (17): compilerOptions, isolatedModules, jsx, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch (+9 more)

### Community 61 - "GraphView.tsx"
Cohesion: 0.17
Nodes (19): edgeDelay(), edgeId(), layoutEdges(), MIN_LEARNED_WEIGHT, visibleEdges(), filterAssets(), FocusDirection, graphLinks() (+11 more)

### Community 62 - "BaselineDetector"
Cohesion: 0.10
Nodes (24): BaselineDetector, Loaded, LiveEngine, excluded_from_ranking(), SourceNotReadyError, engine(), make_live(), test_demo_mode_off_blocks_live_attack_before_the_attacker_is_ever_called() (+16 more)

### Community 63 - "json"
Cohesion: 0.08
Nodes (16): _from_env(), learned_graph(), merge_graph(), save_graph(), read_checkpoint(), source_fingerprint(), write_checkpoint(), LiveConfig (+8 more)

### Community 64 - "Engine"
Cohesion: 0.10
Nodes (29): Engine, _has_hazard(), AttackRequest, _open_incident(), run(), test_attack_produces_localized_incident(), test_clean_run_raises_no_incident(), test_detector_is_warm_before_the_first_message() (+21 more)

### Community 65 - "demo_trials.py"
Cohesion: 0.28
Nodes (11): build_report(), main(), pair_key(), _pick_primary_backup(), _rank(), run_live(), run_sim(), run_sim_trial() (+3 more)

### Community 66 - "useUi"
Cohesion: 0.17
Nodes (19): Message, AssetInspector(), EvidenceList(), formatCategory(), IncidentProgress(), ResponseEvent, GraphView, ProcessWorkspace() (+11 more)

### Community 67 - "MetricsPage.tsx"
Cohesion: 0.10
Nodes (36): BaselineComparison(), Report, Result, chartOption(), getChartColors(), MetricsChart(), Card(), Cards() (+28 more)

### Community 68 - "13. Questions and Answers for Reviewers & Judges"
Cohesion: 0.17
Nodes (12): 13. Questions and Answers for Reviewers & Judges, Q10: What makes this approach novel and useful?, Q11: What still needs improvement?, Q1: What happens when an attack occurs?, Q2: How does it find the likely origin among an alarm flood?, Q3: Why is this approach better than an ordinary alarm?, Q4: What information does AttackTrace need to operate?, Q5: What if the AI's origin prediction is wrong? (+4 more)

### Community 69 - "AttackTrace_Slides.md"
Cohesion: 0.15
Nodes (12): Approach, Architecture, AttackTrace, Detect → Locate → Contain, Limitations, Live demo, Results: real HAI data, Results: real protocol (LIVE) (+4 more)

### Community 70 - "Private-server release plan — 16 October 2026"
Cohesion: 0.06
Nodes (28): Copilot polish and private-server foundation — 16 October 2026, Implemented, Validation and current limits, Activate the selected ADC method, Credentials and access, Deployment and verification still required, Firebase private-server setup — 16 October 2026, What the implementation enforces (+20 more)

### Community 72 - "Settings"
Cohesion: 0.09
Nodes (16): LiveAttackLauncher, get_settings(), Settings, LiveConfigError, build_live_runtime(), lifespan(), ensure_metrics(), safe_ensure_metrics() (+8 more)

### Community 73 - "test_journal_backup.py"
Cohesion: 0.33
Nodes (3): test_backup_includes_committed_wal_and_closes_output(), test_backup_refuses_to_replace_existing_data(), backup()

### Community 74 - "AttackTrace: Project Explained & Comprehensive Presentation Guide"
Cohesion: 0.18
Nodes (10): 4. Features and Screens, 5. System Architecture, 8. Data Modes and Operational Evidence, 9. Implementation Details & File-to-Feature Map, Architecture Diagram, AttackTrace: Project Explained & Comprehensive Presentation Guide, File-to-Feature Map, Folder Structure Overview (+2 more)

### Community 75 - "Screenshots"
Cohesion: 0.27
Nodes (10): ambiguousShot(), { chromium }, errors, haiIncident(), log, require, shot(), simViews() (+2 more)

### Community 76 - "asyncio"
Cohesion: 0.10
Nodes (12): assess_layers(), evidence_priority(), alter_response(), decode(), encode(), Tag, test_encoding_round_trips(), test_channel_evidence_rules() (+4 more)

### Community 77 - "sim/__init__.py"
Cohesion: 0.12
Nodes (6): NoOverlay, Overlay, _clip(), Impact, PlantParams, _time_to()

### Community 78 - "Dependencies"
Cohesion: 0.17
Nodes (12): dependencies, echarts, echarts-for-react, firebase, @fontsource/inter, @fontsource/jetbrains-mono, framer-motion, lucide-react (+4 more)

### Community 79 - "live_voice.py"
Cohesion: 0.14
Nodes (9): connect_model(), live_voice(), browser_to_gemini(), opening_prompt(), process_snapshot(), session_config(), test_live_extended_thinking_has_required_configuration(), test_voice_session_config_enforces_en_ta_transcription() (+1 more)

### Community 80 - "12. Presentation-Ready Content (PowerPoint Slide Deck)"
Cohesion: 0.18
Nodes (11): 12. Presentation-Ready Content (PowerPoint Slide Deck), Slide 10: Conclusion & The Future of Industrial Defense, Slide 1: Title & Executive Summary, Slide 2: The Problem: Invisible Threats to Critical Infrastructure, Slide 3: The Alarm Flood Dilemma, Slide 4: The AttackTrace Solution, Slide 5: System Architecture & Data Modes, Slide 6: Live Case Study: The Tank 1 Level Attack (+3 more)

### Community 82 - "Plant"
Cohesion: 0.17
Nodes (17): _fmt_eta(), main(), Plant, test_attack_ends_after_duration(), test_freeze_does_not_leak_across_reset(), test_large_offset_creates_overflow_risk(), test_sensor_freeze_holds_reported_value(), test_sensor_ramp_drifts_linearly() (+9 more)

### Community 84 - "HaiEngine"
Cohesion: 0.17
Nodes (4): HaiEngine, test_dataset_attack_becomes_an_incident_without_invented_labels(), test_replay_starts_before_the_first_attack_and_follows_the_speed(), test_reset_restarts_the_replay_and_the_replay_loops()

### Community 85 - "Screenshots"
Cohesion: 0.31
Nodes (8): { chromium }, errors, liveViews(), log, require, shot(), SIZES, sleep()

### Community 86 - "AI Pilot · Signal Room design plan"
Cohesion: 0.33
Nodes (5): AI Pilot · Signal Room design plan, Design references, Implementation flow, Master idea, Reusable implementation prompt

### Community 87 - "Scripts"
Cohesion: 0.25
Nodes (8): scripts, build, dev, e2e, lint, preview, test, typecheck

### Community 88 - "argparse"
Cohesion: 0.13
Nodes (11): anonymous_stream_denied(), main(), NoRedirect, origin(), public_streams_available(), read(), require(), main() (+3 more)

### Community 90 - "Vercel"
Cohesion: 0.29
Nodes (6): buildCommand, framework, headers, outputDirectory, rewrites, $schema

### Community 91 - "Test"
Cohesion: 0.33
Nodes (4): css, spec, postcss, @tailwindcss/postcss

### Community 92 - "sys"
Cohesion: 0.11
Nodes (12): click_path(), main(), post(), wait_healthy(), check(), check_backend_health(), check_console_errors(), check_emulator() (+4 more)

### Community 93 - "10. Results and Evaluation"
Cohesion: 0.29
Nodes (7): 10. Results and Evaluation, 1. Detection Performance (Evaluated on 50 Attack Runs & 20 Clean Runs), 2. Root-Cause Localization Accuracy, 3. Self-Healing Containment Success, 4. What Performed Well vs. What Performed Poorly, 5. HAI 20.07 Real-World Dataset Results, 6. What These Results Cannot Prove

### Community 94 - "evaluate"
Cohesion: 0.27
Nodes (4): Counts, evaluate(), _onsets(), run_detection()

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

### Community 131 - "RegisterOverlay"
Cohesion: 0.20
Nodes (3): Controls, RegisterOverlay, load()

### Community 132 - "theme.ts"
Cohesion: 0.26
Nodes (8): ThemeSwitcher(), applyTheme(), getInitialTheme(), ThemeId, ThemeMeta, THEMES, ThemeState, useTheme

### Community 133 - "14. Glossary and References"
Cohesion: 0.67
Nodes (3): 14. Glossary and References, Plain-English Glossary, Verified Academic and Industry References

### Community 134 - "6. Technologies and Their Purpose"
Cohesion: 0.67
Nodes (3): 6. Technologies and Their Purpose, Required Runtime vs. Optional / Development Tools, Technology Breakdown Table

### Community 137 - "test_live_connectors.py"
Cohesion: 0.08
Nodes (21): bounded(), ReadError, ReadOnlyModbus, FakeClient, poller(), test_a_partial_read_failure_keeps_the_other_tags(), test_a_silent_server_times_out_instead_of_hanging(), test_backoff_grows_is_capped_and_resets() (+13 more)

### Community 138 - "geometry.ts"
Cohesion: 0.24
Nodes (12): Edge, flowDuration(), flowRatio(), Link, LINKS, PULSE_STAGGER_S, pulseDelay(), spinDuration() (+4 more)

### Community 139 - "AttackEngine"
Cohesion: 0.17
Nodes (3): _Active, AttackEngine, GroundTruth

### Community 140 - "AttackSpec"
Cohesion: 0.28
Nodes (10): AttackSpec, _pair(), _run(), test_actuator_force_pump_off_stops_flow(), test_actuator_force_valve_open_wastes_energy(), test_attack_is_deterministic(), test_ground_truth_recorded(), test_invalid_specs_rejected() (+2 more)

### Community 141 - "load_hai_detector"
Cohesion: 0.21
Nodes (12): hai_models_ready(), load_hai_baseline(), load_hai_detector(), build_hai_engine(), hai_forward(), HaiForward, test_slow_speed_carries_fractions(), test_speed_is_clamped_to_the_supported_range() (+4 more)

### Community 142 - "evaluate"
Cohesion: 0.18
Nodes (6): frame(), LabProxy, evaluate(), free_port(), port(), test_proxy_real_modbus_pairing_and_rejects_writes()

### Community 143 - "AttackTrace: Documentation"
Cohesion: 0.15
Nodes (12): 1. Problem, 2. Solution overview, 4. Data, 6. Novelty, feasibility, scalability, sustainability, 7. Limitations, 8. Ethics and responsible use, 9. Third-party resources, AttackTrace: Documentation (+4 more)

### Community 144 - "3. Method"
Cohesion: 0.17
Nodes (12): missing(), 3.10 LIVE ingestion: a real industrial protocol, 3.1 Causal graph, 3.2 Detection, 3.3 Localization: three signals, 3.4 Propagation and explanation, 3.5 Incident lifecycle, 3.6 Confidence gate (+4 more)

### Community 145 - "hai_experiments.py"
Cohesion: 0.27
Nodes (4): best_f1(), main(), score(), smooth()

### Community 146 - "layout.test.ts"
Cohesion: 0.27
Nodes (8): groupLayout(), layerLayout(), LayoutEdge, Pos, processOf(), edges, IDS, PID

### Community 147 - "process_of"
Cohesion: 0.29
Nodes (3): node_kind(), process_of(), test_tag_naming_heuristics()

### Community 149 - "useDashboardLayout.ts"
Cohesion: 0.33
Nodes (5): COLLAPSE_KEY, CONSTRAINTS, DashboardLayoutState, DEFAULT_LAYOUT, Splitter

### Community 150 - "5. Results"
Cohesion: 0.33
Nodes (6): 5.1 Simulator (50 held-out attacks, 20 clean 5-minute runs), 5.2 Demo rehearsal (15 live runs, `submission/evidence/rehearsal.md`), 5.3 HAI 20.07 (`test1`, 28 attacks, never used for tuning), 5.4 Confidence gate and isolation (`ambiguity` and `isolation` in `metrics.json`), 5.5 LIVE mode: real protocol, emulated plant (`reports/live_metrics.json`, `reports/live_faults.json`), 5. Results

### Community 151 - "main.tsx"
Cohesion: 0.40
Nodes (3): root, @fontsource/inter, @fontsource/jetbrains-mono

## Knowledge Gaps
- **11 isolated node(s):** `attacktrace`, `echarts`, `echarts-for-react`, `@types/node`, `@types/react` (+6 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1042 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **35 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `3. Method` connect `3. Method` to `AttackTrace: Documentation`?**
  _High betweenness centrality (0.326) - this node is a cross-community bridge._
- **Are the 97 inferred relationships involving `Engine` (e.g. with `🧠 Layer 3: Services & Detection Engine` and `_engine()`) actually correct?**
  _`Engine` has 97 INFERRED edges - model-reasoned connections that need verification._
- **What connects `attacktrace`, `echarts`, `echarts-for-react` to the rest of the system?**
  _11 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `numpy` be split into smaller, more focused modules?**
  _Cohesion score 0.08509615384615385 - nodes in this community are weakly interconnected._
- **Why does `3.10 LIVE ingestion: a real industrial protocol` connect `3. Method` to `Plant`, `Rest`, `PlantEmulator`?**
  _High betweenness centrality (0.325) - this node is a cross-community bridge._
- **Are the 33 inferred relationships involving `Settings` (e.g. with `prepare_storage()` and `validate()`) actually correct?**
  _`Settings` has 33 INFERRED edges - model-reasoned connections that need verification._
- **Should `Equipment.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.12878787878787878 - nodes in this community are weakly interconnected._