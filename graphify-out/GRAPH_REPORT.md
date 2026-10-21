# Graph Report - Attacktrace  (2026-10-21)

## Corpus Check
- 389 files · ~882,370 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 58 file(s) not represented in the graph (top: (none) 22, .pt 12, .log 8)

## Summary
- 2880 nodes · 9042 edges · 123 communities (93 shown, 30 thin omitted)
- Extraction: 90% EXTRACTED · 10% INFERRED · 0% AMBIGUOUS · INFERRED: 919 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `86881c2c`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- numpy
- BaselineDetector
- test_calibration_persistence.py
- GraphView.tsx
- modbus.py
- live_voice.py
- AttackSpec
- Api
- test_live_runtime.py
- deploy.py
- Timeline.tsx
- useLive
- react
- PlantEmulator
- aggregate
- TagMap
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
- server.py
- CalibratingState.tsx
- HaiEngine
- main.py
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
- types.ts
- live_soak.py
- AttackConsole.tsx
- Engine
- load_tagmap
- Security
- AttackTrace UI and navigation repair — 16 October 2026
- LIVE calibration fix and next implementation plan
- Devdependencies
- incident.render.test.ts
- voice.py
- ModelRouter
- test_live_connectors.py
- Compileroptions
- test_authentication.py
- models.py
- test_gateway.py
- test_report.py
- local_layers.py
- Isolate
- MetricsPage.tsx
- .__init__
- AttackTrace_Slides.md
- Private-server release plan — 16 October 2026
- LiveRuntime
- test_copilot.py
- demo_trials.py
- Screenshots
- LiveConfigError
- pathlib
- Dependencies
- _read_csv
- Loaded
- speed
- firebase.ts
- Screenshots
- AI Pilot · Signal Room design plan
- Scripts
- Package
- Test
- Vercel
- Test
- Voicecaptureprocessor
- AttackTrace AI Pilot model registry and verification
- Attacktrace
- Incident evidence delivery — 15 October 2026
- AttackTrace: proposed SOC and Twin/Graph enhancement plan
- ._advance_incident
- VOICE_ASSISTANT.md
- Presenter cheat sheet (one page)
- AttackTrace
- Demo script (3 minutes)
- QA_Prep.md
- argparse
- index.js
- python-dependency-audit.json

## God Nodes (most connected - your core abstractions)
1. `Engine` - 142 edges
2. `Settings` - 107 edges
3. `LiveRuntime` - 70 edges
4. `BaselineDetector` - 63 edges
5. `create_app()` - 61 edges
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
- `⚡ Layer 2: API & Gateway (FastAPI + Cloudflare Workers)` --references--> `create_app()`  [INFERRED]
  README.md → backend/app/main.py
- `3.10 LIVE ingestion: a real industrial protocol` --references--> `live()`  [INFERRED]
  submission/AttackTrace_Documentation.md → backend/app/api/ws.py
- `🧠 Layer 3: Services & Detection Engine` --references--> `Engine`  [INFERRED]
  ARCHIFY_ARCHITECTURE_MAP.md → backend/app/engine.py

## Import Cycles
- None detected.

## Communities (123 total, 30 thin omitted)

### Community 0 - "numpy"
Cohesion: 0.09
Nodes (35): static_graph(), break_ties(), causal_term(), combine_onsets(), deviation_term(), first_crossings(), localize(), onset_term() (+27 more)

### Community 1 - "BaselineDetector"
Cohesion: 0.13
Nodes (11): simulate(), BaselineDetector, baseline_rank(), evaluate_baseline_localization(), test_baseline_flags_large_offset(), test_simulate_shape_and_labels(), fitted(), test_baseline_saved_before_names_existed_still_works() (+3 more)

### Community 2 - "test_calibration_persistence.py"
Cohesion: 0.29
Nodes (6): read_checkpoint(), source_fingerprint(), write_checkpoint(), test_bad_checkpoint_is_rejected(), test_checkpoint_write_failure_keeps_previous_file(), test_source_contract_changes_with_endpoint_or_register_mapping()

### Community 3 - "GraphView.tsx"
Cohesion: 0.10
Nodes (31): edgeDelay(), edgeId(), layoutEdges(), MIN_LEARNED_WEIGHT, visibleEdges(), filterAssets(), FocusDirection, graphLinks() (+23 more)

### Community 4 - "modbus.py"
Cohesion: 0.13
Nodes (5): bounded(), ReadError, ReadOnlyModbus, slow_factory(), test_a_silent_server_times_out_instead_of_hanging()

### Community 5 - "live_voice.py"
Cohesion: 0.13
Nodes (9): connect_model(), live_voice(), browser_to_gemini(), gemini_to_browser(), opening_prompt(), process_snapshot(), session_config(), test_live_extended_thinking_has_required_configuration() (+1 more)

### Community 6 - "AttackSpec"
Cohesion: 0.05
Nodes (40): _Active, AttackEngine, AttackSpec, GroundTruth, _fmt_eta(), main(), NoOverlay, Overlay (+32 more)

### Community 7 - "Api"
Cohesion: 0.09
Nodes (41): useLiveSourcePoll(), narrated, useLiveStream(), Access, AccessContext, useAccess(), EvidenceList(), IncidentEvidencePanel() (+33 more)

### Community 8 - "test_live_runtime.py"
Cohesion: 0.11
Nodes (30): Hub, FakeClock, feed(), test_live_messages_have_the_same_schema_as_sim(), collect(), drive(), free_port(), live_settings() (+22 more)

### Community 9 - "deploy.py"
Cohesion: 0.06
Nodes (32): check_identity(), DeploymentError, main(), prepare_storage(), validate(), make_dataset(), _signals(), _write() (+24 more)

### Community 10 - "Timeline.tsx"
Cohesion: 0.21
Nodes (17): Props, Sparkline(), pctX(), Timeline(), usePlayback(), clampIndex(), HAI_ROWS, indexToX() (+9 more)

### Community 11 - "useLive"
Cohesion: 0.11
Nodes (37): App(), Center(), ViewToggle(), useFreshness(), EmptyState(), IncidentToast(), NoticeToast(), Details() (+29 more)

### Community 12 - "react"
Cohesion: 0.09
Nodes (26): MetricsPage, Root(), Route(), SocPage, VoiceSettingsPage, WorkspaceLoading(), WorkspacePage, ThemeSwitcher() (+18 more)

### Community 13 - "PlantEmulator"
Cohesion: 0.10
Nodes (26): emu(), free_port(), test_attack_endpoint_writes_to_the_emulator_and_reveals_ground_truth(), test_attack_refused_while_live_is_calibrating(), test_demo_mode_off_blocks_live_attack_before_the_attacker_is_ever_called(), client_for(), emu(), free_port() (+18 more)

### Community 14 - "aggregate"
Cohesion: 0.10
Nodes (16): aggregate(), alert_mask(), sustained(), hai_forward(), HaiForward, sim_forward(), SimForward, Counts (+8 more)

### Community 15 - "TagMap"
Cohesion: 0.07
Nodes (5): LiveConfig, ModbusPoller, ReadOnlyClient, TagMap, SlowClient

### Community 16 - "TopBar.tsx"
Cohesion: 0.09
Nodes (30): SOURCE_NAMES, TopBar(), MODES, ModeToggle(), Props, html(), StatusPill(), STYLE (+22 more)

### Community 17 - "CopilotDrawer.tsx"
Cohesion: 0.08
Nodes (46): CopilotAnswer(), HypothesisCard(), InlineText(), Lines(), ParsedSection, parseSections(), SECTION_ICONS, CopilotDrawer() (+38 more)

### Community 18 - "copilot.py"
Cohesion: 0.16
Nodes (10): bounded_chat(), get_copilot_engine(), get_suggestions(), post_chat(), assess_layers(), evidence_priority(), suggestions(), CopilotChatResponse (+2 more)

### Community 19 - "Rest"
Cohesion: 0.11
Nodes (23): control_hai_replay(), _engine(), get_hai_replay(), get_incident_report(), get_incidents(), get_live_health(), get_metrics(), get_status() (+15 more)

### Community 20 - "Attacker"
Cohesion: 0.10
Nodes (28): allowed_hosts(), AllowlistError, check_host(), is_loopback(), AttackerClient, AttackerError, AttackRecord, _neutral() (+20 more)

### Community 21 - "test_hai.py"
Cohesion: 0.15
Nodes (18): hai_paths(), HaiData, load_hai(), client(), data(), hai_engine(), test_detector_metrics_on_a_known_alert_pattern(), test_hai_mode_is_refused_without_data_or_models() (+10 more)

### Community 22 - "schemas.py"
Cohesion: 0.09
Nodes (16): topology_of(), Runtime, AlertInfo, CalibrationInfo, CopilotChatRequest, GroundTruthInfo, IsolateRequest, IsolateResponse (+8 more)

### Community 23 - "test_lab_attribution.py"
Cohesion: 0.15
Nodes (10): alter_response(), frame(), decode(), encode(), Tag, test_encoding_round_trips(), test_channel_evidence_rules(), test_integrity_requires_observation_and_separate_approval() (+2 more)

### Community 24 - "Write"
Cohesion: 0.11
Nodes (15): analyze(), main(), analyze(), main(), analyze(), main(), _pct(), analyze() (+7 more)

### Community 25 - "Api"
Cohesion: 0.18
Nodes (12): AttackResponse, client(), test_attack_validation(), test_incidents_and_reset(), test_live_loop_survives_a_failing_tick(), test_metrics(), test_metrics_merges_live_metrics_without_touching_the_file(), test_status_and_mode() (+4 more)

### Community 26 - "Socstore"
Cohesion: 0.15
Nodes (23): digest(), loaded_context(), runtime_context(), LiveMessage, NodeState, SocStore, message(), test_api_export_and_archived_copilot_use_original_capture() (+15 more)

### Community 27 - "eval/hai.py"
Cohesion: 0.09
Nodes (22): HaiFile, node_kind(), process_of(), _read(), rising_edges(), HaiLoaded, split_tests(), baseline_rank_nodes() (+14 more)

### Community 28 - "Grounding"
Cohesion: 0.16
Nodes (23): _build_context_summary(), CopilotEngine, _get_gemini_key(), incident_evidence_summary(), local_checks(), _offline_expert_reply(), CopilotTurn, Incident (+15 more)

### Community 29 - "Robustness"
Cohesion: 0.19
Nodes (16): assess_calibration(), Case, evaluate_case(), fit_calibration(), probability(), reliability(), run(), summarize() (+8 more)

### Community 30 - "Package"
Cohesion: 0.08
Nodes (20): devDependencies, miniflare, engines, node, name, overrides, sharp, undici (+12 more)

### Community 31 - "Live"
Cohesion: 0.22
Nodes (11): AttackResult, _false_alarm_per_hour(), LiveEvalState, main(), _pct(), _prf(), _rising_edges(), run() (+3 more)

### Community 32 - "server.py"
Cohesion: 0.10
Nodes (4): Controls, RegisterOverlay, load(), TruthEvent

### Community 33 - "CalibratingState.tsx"
Cohesion: 0.20
Nodes (10): CalibratingState(), html(), ProgressRing(), SourcePill(), STYLE, base, html(), restartLiveCalibration() (+2 more)

### Community 34 - "HaiEngine"
Cohesion: 0.14
Nodes (7): HaiEngine, _Open, test_dataset_attack_becomes_an_incident_without_invented_labels(), test_replay_starts_before_the_first_attack_and_follows_the_speed(), test_reset_restarts_the_replay_and_the_replay_loops(), test_suspect_needs_both_a_high_score_and_a_departure_from_the_nodes_own_normal(), test_topology_lists_dataset_tags()

### Community 35 - "main.py"
Cohesion: 0.24
Nodes (6): hai_models_ready(), load_hai_baseline(), build_live_runtime(), build_hai_engine(), lifespan(), test_trained_models_round_trip()

### Community 36 - "LiveSource"
Cohesion: 0.12
Nodes (16): load_live(), LiveEngine, LiveSource, SourceNotReadyError, evaluate(), build_state(), make_live(), free_port() (+8 more)

### Community 37 - "verify_ai_models.py"
Cohesion: 0.16
Nodes (10): gemini_key(), capabilities(), _interaction(), _key(), _audio(), _interaction(), _live_check(), _result() (+2 more)

### Community 38 - "time"
Cohesion: 0.05
Nodes (37): best_threshold(), fit_err_sd(), ForecastDetector, residuals(), build_model(), GDN, make_windows(), MLPForecaster (+29 more)

### Community 39 - "Report"
Cohesion: 0.16
Nodes (10): _eta(), render_report(), para(), _utc(), ascii_text(), _escape(), Page, text_width() (+2 more)

### Community 40 - "Authentication"
Cohesion: 0.19
Nodes (14): check_origin(), config(), firebase_app(), identity(), logout(), me(), names(), protect() (+6 more)

### Community 41 - "app/engine.py"
Cohesion: 0.07
Nodes (20): is_ambiguous(), origin_candidate(), action_for(), explain(), Explanation, signature(), Incident, Candidate (+12 more)

### Community 42 - "RateLimiter"
Cohesion: 0.17
Nodes (11): 1. Five-Layer Architecture Map, 2. Layer-by-Layer Breakdown & Source Evidence, 3. End-to-End User Workflows, 4. Authentication, Authorization & Security Flow, AttackTrace: Full Interactive Architecture Map, 🌐 Interactive Visualization Artifacts, 🎨 Layer 1: Frontend, ⚡ Layer 2: API & Gateway (+3 more)

### Community 43 - "lab.py"
Cohesion: 0.26
Nodes (11): configure(), emulator_info(), exclusive(), integrity(), ManifestChange, observe_integrity(), probe(), proxy() (+3 more)

### Community 44 - "Investigation"
Cohesion: 0.16
Nodes (18): asset_registers(), baseline_comparison(), capture(), detail(), evidence(), export(), journal(), progress() (+10 more)

### Community 45 - "Settings"
Cohesion: 0.16
Nodes (10): Settings, build_engine(), ensure_metrics(), safe_ensure_metrics(), test_settings_read_env(), test_a_failing_metrics_step_never_stops_startup(), test_existing_metrics_are_never_overwritten(), test_first_start_writes_metrics_once() (+2 more)

### Community 46 - "Package"
Cohesion: 0.09
Nodes (22): name, overrides, @grpc/grpc-js, private, type, version, autoprefixer, echarts (+14 more)

### Community 47 - "types.ts"
Cohesion: 0.05
Nodes (74): GraphNode, PlantNode, PlantNodeData, PlantNodeView(), PulseEdgeData, PulseEdgeT, PulseEdgeView(), StageData (+66 more)

### Community 48 - "live_soak.py"
Cohesion: 0.15
Nodes (18): load_baseline(), live_dir(), live_models_ready(), build_engine(), check_emulator_down(), check_out_of_range(), check_slow_network(), _free_port() (+10 more)

### Community 49 - "AttackConsole.tsx"
Cohesion: 0.16
Nodes (22): Panel(), PanelProps, AttackConsole(), HaiReplayPanel(), offset(), MagnitudeField(), Props, NodeScores() (+14 more)

### Community 50 - "Engine"
Cohesion: 0.09
Nodes (32): Engine, _has_hazard(), AttackRequest, _impact_with_vs_without(), _peak_rss_over_simulated_run(), run_sim_trial(), _isolate(), _open_incident() (+24 more)

### Community 51 - "load_tagmap"
Cohesion: 0.11
Nodes (15): load_tagmap(), TagMapError, mutate(), raw_map(), test_invalid_tagmaps_are_rejected(), test_load_reports_readable_errors(), test_shipped_tagmap_is_valid_and_complete(), FakeClient (+7 more)

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

### Community 56 - "incident.render.test.ts"
Cohesion: 0.06
Nodes (44): missing(), BreakdownBar(), BreakdownLegend(), f2(), SEGMENTS, html(), three, top (+36 more)

### Community 57 - "voice.py"
Cohesion: 0.16
Nodes (10): _is_loopback(), limit_attacks(), require_demo(), require_key(), _limit(), _output_audio(), _output_text(), SpeechRequest (+2 more)

### Community 58 - "ModelRouter"
Cohesion: 0.45
Nodes (4): Failure, ModelRouter, test_preferred_model_fails_over_after_rate_limit(), test_repeated_rate_limits_back_off_without_crossing_capability_pools()

### Community 59 - "test_live_connectors.py"
Cohesion: 0.06
Nodes (23): Aligner, Sample, excluded_from_ranking(), QualityTracker, TagSpec, _Track, _pct(), SourceStatus (+15 more)

### Community 60 - "Compileroptions"
Cohesion: 0.11
Nodes (17): compilerOptions, isolatedModules, jsx, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch (+9 more)

### Community 61 - "test_authentication.py"
Cohesion: 0.22
Nodes (10): headers(), login(), secured(), test_analyst_decisions_record_verified_actor(), test_login_cookie_membership_and_csrf(), test_logout_invalidates_copied_cookie_and_stream(), test_missing_server_credentials_fail_closed(), test_repeated_signins_have_distinct_server_sessions() (+2 more)

### Community 62 - "models.py"
Cohesion: 0.23
Nodes (7): classify_failure(), _retry_after(), _status_code(), test_live_greeting_states_only_observed_status(), test_model_pool_rejects_cross_modality(), test_quota_and_unsupported_are_retryable_but_auth_and_safety_are_not(), test_retry_after_is_respected()

### Community 63 - "test_gateway.py"
Cohesion: 0.11
Nodes (6): GatewayBoundary, gateway_app(), test_direct_origin_denied_even_for_auth_config_and_docs(), test_gateway_secret_does_not_replace_firebase_identity(), test_local_mode_is_unchanged_without_an_origin_secret(), test_stream_requires_gateway_secret_before_upgrade()

### Community 64 - "test_report.py"
Cohesion: 0.16
Nodes (10): worst_impact(), Impact, check_structure(), client(), test_impact_snapshot_keeps_the_worst_values(), test_report_endpoint_returns_a_valid_one_page_pdf(), test_report_is_open_without_a_key(), test_report_shows_the_ambiguous_banner_and_breakdown() (+2 more)

### Community 65 - "local_layers.py"
Cohesion: 0.31
Nodes (4): LabProxy, evaluate(), free_port(), test_proxy_real_modbus_pairing_and_rejects_writes()

### Community 66 - "Isolate"
Cohesion: 0.26
Nodes (13): IsolateButton(), postIsolate(), advance(), begin(), candidateFor(), disabledReason(), IDLE, IsolateAvailability (+5 more)

### Community 67 - "MetricsPage.tsx"
Cohesion: 0.07
Nodes (49): BaselineComparison(), Report, Result, chartOption(), getChartColors(), MetricsChart(), Card(), Cards() (+41 more)

### Community 69 - "AttackTrace_Slides.md"
Cohesion: 0.15
Nodes (12): Approach, Architecture, AttackTrace, Detect → Locate → Contain, Limitations, Live demo, Results: real HAI data, Results: real protocol (LIVE) (+4 more)

### Community 70 - "Private-server release plan — 16 October 2026"
Cohesion: 0.06
Nodes (28): Copilot polish and private-server foundation — 16 October 2026, Implemented, Validation and current limits, Activate the selected ADC method, Credentials and access, Deployment and verification still required, Firebase private-server setup — 16 October 2026, What the implementation enforces (+20 more)

### Community 72 - "LiveRuntime"
Cohesion: 0.07
Nodes (7): LiveAttackLauncher, LiveRuntime, Snapshot, LiveRecorder, record(), test_restart_resumes_rows_and_marks_a_gap(), test_training_failure_preserves_data_and_requires_explicit_retry()

### Community 73 - "test_copilot.py"
Cohesion: 0.31
Nodes (6): client(), test_copilot_chat(), test_copilot_suggestions(), test_no_active_incident_has_no_action(), test_unknown_requested_incident_returns_404(), test_virtual_sensor_isolation()

### Community 74 - "demo_trials.py"
Cohesion: 0.21
Nodes (10): build_report(), main(), pair_key(), _pick_primary_backup(), _rank(), run_live(), run_sim(), _summarize_pair() (+2 more)

### Community 75 - "Screenshots"
Cohesion: 0.27
Nodes (10): ambiguousShot(), { chromium }, errors, haiIncident(), log, require, shot(), simViews() (+2 more)

### Community 76 - "LiveConfigError"
Cohesion: 0.25
Nodes (3): LiveConfigError, test_bad_config_fails_fast_with_a_clear_message(), test_missing_or_broken_tagmap_is_a_config_error()

### Community 77 - "pathlib"
Cohesion: 0.13
Nodes (3): test_backup_includes_committed_wal_and_closes_output(), test_backup_refuses_to_replace_existing_data(), backup()

### Community 78 - "Dependencies"
Cohesion: 0.17
Nodes (12): dependencies, echarts, echarts-for-react, firebase, @fontsource/inter, @fontsource/jetbrains-mono, framer-motion, lucide-react (+4 more)

### Community 81 - "Loaded"
Cohesion: 0.07
Nodes (41): _from_env(), get_settings(), attack_run(), Run, sample_attack(), load_detector(), Loaded, _val_runs() (+33 more)

### Community 82 - "speed"
Cohesion: 0.50
Nodes (3): speed(), Actual held-out results from this installation, HAI replay installation and controls

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

### Community 96 - "AttackTrace AI Pilot model registry and verification"
Cohesion: 0.50
Nodes (3): AI Pilot's jobs and exact system instructions, AttackTrace AI Pilot model registry and verification, Configuration and verification

### Community 108 - "Incident evidence delivery — 15 October 2026"
Cohesion: 0.22
Nodes (7): Incident evidence delivery — 15 October 2026, Investigation and Copilot, Measured harder tests, Next research priority, Preserved evidence, Verification, Incident evidence implementation plan

### Community 109 - "AttackTrace: proposed SOC and Twin/Graph enhancement plan"
Cohesion: 0.06
Nodes (28): AttackTrace implementation plan, Build order, Data modes, Milestone 1 — trustworthy assistance and investigation UI, Milestone 2 — explicit evidence records and uncertainty, Milestone 3 — local communication-channel attribution, Milestone 4 — emulated firmware/configuration integrity, Milestone 5 — validation and response workflow (+20 more)

### Community 114 - "Presenter cheat sheet (one page)"
Cohesion: 0.29
Nodes (6): Click path (SIM), Fast facts if asked, Headline numbers (say the n, not just the %), If LIVE fails mid-demo, If Top-1 is wrong, Presenter cheat sheet (one page)

### Community 115 - "AttackTrace"
Cohesion: 0.07
Nodes (25): 🏛 5-Layer System Architecture (Graphify Mapped), AttackTrace, 📊 Benchmark & Evaluation Results, 🔄 End-to-End Incident Lifecycle, 🗺 Graphify Codebase Navigation, 🎮 Interactive Live Demo Script, 🎨 Layer 1: Frontend (React 19 + TypeScript + Vite), ⚡ Layer 2: API & Gateway (FastAPI + Cloudflare Workers) (+17 more)

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
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 917 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **30 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `3.10 LIVE ingestion: a real industrial protocol` connect `incident.render.test.ts` to `Rest`, `PlantEmulator`, `AttackSpec`?**
  _High betweenness centrality (0.289) - this node is a cross-community bridge._
- **Are the 97 inferred relationships involving `Engine` (e.g. with `🧠 Layer 3: Services & Detection Engine` and `_engine()`) actually correct?**
  _`Engine` has 97 INFERRED edges - model-reasoned connections that need verification._
- **What connects `attacktrace`, `echarts`, `echarts-for-react` to the rest of the system?**
  _11 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `numpy` be split into smaller, more focused modules?**
  _Cohesion score 0.09378531073446328 - nodes in this community are weakly interconnected._
- **Are the 33 inferred relationships involving `Settings` (e.g. with `prepare_storage()` and `validate()`) actually correct?**
  _`Settings` has 33 INFERRED edges - model-reasoned connections that need verification._
- **Should `BaselineDetector` be split into smaller, more focused modules?**
  _Cohesion score 0.13333333333333333 - nodes in this community are weakly interconnected._
- **Are the 24 inferred relationships involving `LiveRuntime` (e.g. with `🧠 Layer 3: Services & Detection Engine` and `post_chat()`) actually correct?**
  _`LiveRuntime` has 24 INFERRED edges - model-reasoned connections that need verification._