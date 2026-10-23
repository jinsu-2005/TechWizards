# Graph Report - Attacktrace  (2026-10-23)

## Corpus Check
- 396 files · ~1,130,884 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 57 file(s) not represented in the graph (top: (none) 22, .pt 12, .log 8)

## Summary
- 2936 nodes · 9250 edges · 126 communities (95 shown, 31 thin omitted)
- Extraction: 90% EXTRACTED · 10% INFERRED · 0% AMBIGUOUS · INFERRED: 920 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `fb0a2d2a`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- numpy
- simulate
- deploy.py
- GraphView.tsx
- GraphView.tsx
- HaiEngine
- robustness.py
- types.ts
- BaselineDetector
- json
- Timeline.tsx
- IncidentPanel.tsx
- theme.ts
- voice.py
- TopBar.tsx
- ReadOnlyClient
- live.ts
- react
- test_live_runtime.py
- Rest
- graph/__init__.py
- test_hai.py
- attacks/__init__.py
- copilot.py
- Write
- Api
- Socstore
- eval/hai.py
- Grounding
- Robustness
- gateway/package.json
- hai_fixture.py
- PlantEmulator
- test_authentication.py
- verify_ai_models.py
- schemas.py
- test_sim.py
- pipeline.py
- test_report.py
- Authentication
- app/engine.py
- RateLimiter
- lab.py
- argparse
- Settings
- Package
- classify_language
- live_soak.py
- types.ts
- Engine
- test_emulator.py
- Security
- AttackTrace UI and navigation repair — 16 October 2026
- LIVE calibration fix and next implementation plan
- Devdependencies
- incident.render.test.ts
- live.py
- models.py
- test_live_connectors.py
- Compileroptions
- run_isolation
- create_app
- test_gateway.py
- ReadOnlyModbus
- RateLimiter
- MetricsPage.tsx
- AttackTrace_Slides.md
- Private-server release plan — 16 October 2026
- LiveRuntime
- demo_trials.py
- Screenshots
- TagMap
- Dependencies
- live_voice.py
- ProcessWorkspace.tsx
- localization.py
- test_sim.py
- firebase.ts
- _windows
- Screenshots
- AI Pilot · Signal Room design plan
- Scripts
- Test
- Vercel
- Test
- pytest
- Voicecaptureprocessor
- AttackTrace AI Pilot model registry and verification
- Attacktrace
- Incident evidence delivery — 15 October 2026
- AttackTrace: proposed SOC and Twin/Graph enhancement plan
- main
- AttackSpec
- VOICE_ASSISTANT.md
- Presenter cheat sheet (one page)
- AttackTrace
- FakeClient
- Demo script (3 minutes)
- QA_Prep.md
- time
- attacker/cli.py
- index.js
- python-dependency-audit.json
- RegisterOverlay
- BenignOverlay
- json

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

## Communities (126 total, 31 thin omitted)

### Community 0 - "numpy"
Cohesion: 0.10
Nodes (34): static_graph(), break_ties(), causal_term(), combine_onsets(), deviation_term(), first_crossings(), localize(), onset_term() (+26 more)

### Community 1 - "simulate"
Cohesion: 0.12
Nodes (14): simulate(), Counts, evaluate(), _onsets(), run_detection(), baseline_rank(), evaluate_baseline_localization(), test_baseline_flags_large_offset() (+6 more)

### Community 2 - "deploy.py"
Cohesion: 0.19
Nodes (9): check_identity(), DeploymentError, main(), prepare_storage(), validate(), configured(), test_private_entrypoint_rejects_unsigned_emulator(), test_storage_requires_mount_and_preserves_journal_and_models() (+1 more)

### Community 3 - "GraphView.tsx"
Cohesion: 0.07
Nodes (43): edgeDelay(), edgeId(), layoutEdges(), MIN_LEARNED_WEIGHT, visibleEdges(), filterAssets(), FocusDirection, graphLinks() (+35 more)

### Community 4 - "GraphView.tsx"
Cohesion: 0.09
Nodes (41): Pump(), PumpProps, Tank(), TankProps, Valve(), ValveProps, Equipment(), Props (+33 more)

### Community 5 - "HaiEngine"
Cohesion: 0.10
Nodes (9): HaiEngine, _Open, _Open, origin_candidate(), Incident, OriginCandidate, test_dataset_attack_becomes_an_incident_without_invented_labels(), test_replay_starts_before_the_first_attack_and_follows_the_speed() (+1 more)

### Community 6 - "robustness.py"
Cohesion: 0.11
Nodes (7): NoOverlay, Overlay, _clip(), Impact, PlantParams, _time_to(), NodeSpec

### Community 7 - "types.ts"
Cohesion: 0.06
Nodes (67): Access, AccessContext, useAccess(), IsolateButton(), IncidentEvidencePanel(), detail, LabStatus, LocalLab() (+59 more)

### Community 8 - "BaselineDetector"
Cohesion: 0.15
Nodes (25): BaselineDetector, Loaded, engine(), make_live(), test_demo_mode_off_blocks_live_attack_before_the_attacker_is_ever_called(), FakeClock, feed(), make_live() (+17 more)

### Community 9 - "json"
Cohesion: 0.19
Nodes (15): asset_registers(), baseline_comparison(), capture(), detail(), evidence(), export(), journal(), progress() (+7 more)

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
Cohesion: 0.21
Nodes (9): capabilities(), _interaction(), _key(), _limit(), _output_audio(), _output_text(), SpeechRequest, synthesize() (+1 more)

### Community 14 - "TopBar.tsx"
Cohesion: 0.09
Nodes (23): CalibratingState(), html(), MODES, ModeToggle(), Props, html(), ProgressRing(), SourcePill() (+15 more)

### Community 15 - "ReadOnlyClient"
Cohesion: 0.07
Nodes (7): LiveConfig, LiveConfigError, ModbusPoller, ReadOnlyClient, TagMap, test_bad_config_fails_fast_with_a_clear_message(), test_missing_or_broken_tagmap_is_a_config_error()

### Community 16 - "live.ts"
Cohesion: 0.17
Nodes (16): StatusPill(), STYLE, latencyMs(), PILL_LABEL, pillKind, LiveMessage, BACKOFF_BASE_MS, BACKOFF_MAX_MS (+8 more)

### Community 17 - "react"
Cohesion: 0.06
Nodes (70): MetricsPage, Root(), Route(), SocPage, VoiceSettingsPage, WorkspaceLoading(), WorkspacePage, SOURCE_NAMES (+62 more)

### Community 18 - "test_live_runtime.py"
Cohesion: 0.10
Nodes (12): IncidentStore, collect(), emulator_runtime(), free_port(), test_a_source_that_goes_away_shows_down_not_a_crash(), test_calibration_restart_is_authenticated_and_refuses_an_active_trainer(), test_live_is_unavailable_without_a_source_and_never_crashes(), test_resumed_training_never_builds_windows_across_a_gap() (+4 more)

### Community 19 - "Rest"
Cohesion: 0.10
Nodes (25): control_hai_replay(), _engine(), get_hai_replay(), get_incident_report(), get_incidents(), get_live_health(), get_metrics(), get_status() (+17 more)

### Community 20 - "graph/__init__.py"
Cohesion: 0.13
Nodes (10): adjacency(), learn_granger_edges(), learn_var_edges(), learned_graph(), merge_graph(), save_graph(), test_adjacency_lists_parents(), test_granger_finds_lagged_cause() (+2 more)

### Community 21 - "test_hai.py"
Cohesion: 0.06
Nodes (42): hai_paths(), HaiData, load_hai(), load_hai_replay(), node_kind(), _read(), _read_csv(), hai_models_ready() (+34 more)

### Community 22 - "attacks/__init__.py"
Cohesion: 0.14
Nodes (3): _Active, AttackEngine, GroundTruth

### Community 23 - "copilot.py"
Cohesion: 0.11
Nodes (16): bounded_chat(), get_copilot_engine(), get_suggestions(), post_chat(), assess_layers(), evidence_priority(), suggestions(), CopilotChatResponse (+8 more)

### Community 24 - "Write"
Cohesion: 0.11
Nodes (15): analyze(), main(), analyze(), main(), analyze(), main(), _pct(), analyze() (+7 more)

### Community 25 - "Api"
Cohesion: 0.18
Nodes (11): client(), test_attack_validation(), test_incidents_and_reset(), test_live_loop_survives_a_failing_tick(), test_metrics(), test_metrics_merges_live_metrics_without_touching_the_file(), test_status_and_mode(), test_topology() (+3 more)

### Community 26 - "Socstore"
Cohesion: 0.15
Nodes (24): CopilotEngine, digest(), loaded_context(), runtime_context(), LiveMessage, NodeState, SocStore, message() (+16 more)

### Community 27 - "eval/hai.py"
Cohesion: 0.13
Nodes (17): HaiFile, process_of(), HaiLoaded, baseline_rank_nodes(), evaluate_detector(), evaluate_localization(), _first_alert(), _prf() (+9 more)

### Community 28 - "Grounding"
Cohesion: 0.15
Nodes (22): _build_context_summary(), _get_gemini_key(), incident_evidence_summary(), local_checks(), _offline_expert_reply(), CopilotTurn, PathStep, incident() (+14 more)

### Community 29 - "Robustness"
Cohesion: 0.13
Nodes (20): alert_mask(), rising_edges(), sustained(), assess_calibration(), Case, evaluate_case(), fit_calibration(), probability() (+12 more)

### Community 30 - "gateway/package.json"
Cohesion: 0.08
Nodes (20): devDependencies, miniflare, engines, node, name, overrides, sharp, undici (+12 more)

### Community 31 - "hai_fixture.py"
Cohesion: 0.22
Nodes (5): hai_dir(), hai_models(), make_dataset(), _signals(), _write()

### Community 32 - "PlantEmulator"
Cohesion: 0.09
Nodes (10): emu(), free_port(), test_attack_endpoint_writes_to_the_emulator_and_reveals_ground_truth(), test_attack_refused_while_live_is_calibrating(), emu(), test_manifest_changes_real_emulator_controller_and_invalid_file_is_reported(), main(), load() (+2 more)

### Community 33 - "test_authentication.py"
Cohesion: 0.29
Nodes (9): headers(), login(), test_analyst_decisions_record_verified_actor(), test_login_cookie_membership_and_csrf(), test_logout_invalidates_copied_cookie_and_stream(), test_missing_server_credentials_fail_closed(), test_repeated_signins_have_distinct_server_sessions(), test_session_expiry_is_enforced_even_with_cached_identity() (+1 more)

### Community 34 - "verify_ai_models.py"
Cohesion: 0.22
Nodes (7): gemini_key(), _audio(), _interaction(), _live_check(), _result(), _speech_body(), verify()

### Community 35 - "schemas.py"
Cohesion: 0.09
Nodes (17): topology_of(), Runtime, AlertInfo, AttackResponse, CalibrationInfo, CopilotChatRequest, GroundTruthInfo, IsolateRequest (+9 more)

### Community 37 - "test_sim.py"
Cohesion: 0.23
Nodes (6): PID, test_determinism_same_seed(), test_different_seed_differs(), test_pid_clamps_and_antiwindup(), test_signals_vary_under_normal_operation(), _trace()

### Community 38 - "pipeline.py"
Cohesion: 0.08
Nodes (25): aggregate(), best_threshold(), fit_err_sd(), ForecastDetector, residuals(), build_model(), GDN, make_windows() (+17 more)

### Community 39 - "test_report.py"
Cohesion: 0.08
Nodes (23): worst_impact(), _eta(), render_report(), para(), _utc(), ascii_text(), _escape(), Page (+15 more)

### Community 40 - "Authentication"
Cohesion: 0.12
Nodes (14): check_origin(), config(), firebase_app(), identity(), logout(), me(), names(), protect() (+6 more)

### Community 41 - "app/engine.py"
Cohesion: 0.08
Nodes (17): is_ambiguous(), action_for(), explain(), Explanation, signature(), Incident, Candidate, _cost() (+9 more)

### Community 42 - "RateLimiter"
Cohesion: 0.17
Nodes (11): 1. Five-Layer Architecture Map, 2. Layer-by-Layer Breakdown & Source Evidence, 3. End-to-End User Workflows, 4. Authentication, Authorization & Security Flow, AttackTrace: Full Interactive Architecture Map, 🌐 Interactive Visualization Artifacts, 🎨 Layer 1: Frontend, ⚡ Layer 2: API & Gateway (+3 more)

### Community 43 - "lab.py"
Cohesion: 0.15
Nodes (15): configure(), emulator_info(), exclusive(), integrity(), ManifestChange, observe_integrity(), probe(), proxy() (+7 more)

### Community 44 - "argparse"
Cohesion: 0.11
Nodes (11): test_backup_includes_committed_wal_and_closes_output(), test_backup_refuses_to_replace_existing_data(), backup(), anonymous_stream_denied(), main(), NoRedirect, origin(), public_streams_available() (+3 more)

### Community 45 - "Settings"
Cohesion: 0.08
Nodes (27): _from_env(), get_settings(), Settings, load_baseline(), load_detector(), load_graph(), build_live_runtime(), build_engine() (+19 more)

### Community 46 - "Package"
Cohesion: 0.08
Nodes (26): name, overrides, @grpc/grpc-js, private, type, version, root, autoprefixer (+18 more)

### Community 47 - "classify_language"
Cohesion: 0.13
Nodes (15): classify_language(), detect_unsupported_script(), has_tamil_characters(), is_self_echo(), LanguageClassification, sanitize_response_text(), tokenize_words(), gemini_to_browser() (+7 more)

### Community 48 - "live_soak.py"
Cohesion: 0.11
Nodes (21): LiveEngine, live_dir(), live_models_ready(), build_state(), build_engine(), check_emulator_down(), check_out_of_range(), check_slow_network() (+13 more)

### Community 49 - "types.ts"
Cohesion: 0.13
Nodes (20): Props, ImpactMeters(), Meter(), tone(), etaUrgency(), formatEta(), parsePilotAction(), PilotAction (+12 more)

### Community 50 - "Engine"
Cohesion: 0.10
Nodes (29): Engine, _has_hazard(), AttackRequest, Impact, run_sim_trial(), _open_incident(), run(), test_attack_produces_localized_incident() (+21 more)

### Community 51 - "test_emulator.py"
Cohesion: 0.14
Nodes (21): TagMapError, client_for(), free_port(), mutate(), raw_map(), read_values(), run_ticks(), test_a_rogue_setpoint_moves_the_plant() (+13 more)

### Community 52 - "Security"
Cohesion: 0.22
Nodes (14): client(), make_client(), test_a_configured_key_still_works_regardless_of_host(), test_attack_endpoint_is_rate_limited(), test_demo_mode_off_blocks_attacks_only(), test_loopback_variants_all_count_as_loopback(), test_no_key_configured_leaves_writes_open(), test_no_key_fails_closed_outside_loopback_dev() (+6 more)

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
Cohesion: 0.14
Nodes (11): AttackResult, _false_alarm_per_hour(), LiveEvalState, main(), _pct(), _prf(), _rising_edges(), run() (+3 more)

### Community 58 - "models.py"
Cohesion: 0.17
Nodes (12): classify_failure(), Failure, ModelRouter, _retry_after(), _status_code(), test_live_extended_thinking_has_required_configuration(), test_live_greeting_states_only_observed_status(), test_model_pool_rejects_cross_modality() (+4 more)

### Community 59 - "test_live_connectors.py"
Cohesion: 0.06
Nodes (32): Aligner, Sample, excluded_from_ranking(), QualityTracker, TagSpec, _Track, LiveSource, _pct() (+24 more)

### Community 60 - "Compileroptions"
Cohesion: 0.11
Nodes (17): compilerOptions, isolatedModules, jsx, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch (+9 more)

### Community 61 - "run_isolation"
Cohesion: 0.33
Nodes (6): _impact_with_vs_without(), Arm, _isolate(), run_isolation(), _spec(), _summary()

### Community 62 - "create_app"
Cohesion: 0.29
Nodes (3): create_app(), test_sim_and_hai_attack_paths_are_unaffected(), secured()

### Community 63 - "test_gateway.py"
Cohesion: 0.15
Nodes (6): GatewayBoundary, gateway_app(), test_direct_origin_denied_even_for_auth_config_and_docs(), test_gateway_secret_does_not_replace_firebase_identity(), test_local_mode_is_unchanged_without_an_origin_secret(), test_stream_requires_gateway_secret_before_upgrade()

### Community 65 - "ReadOnlyModbus"
Cohesion: 0.09
Nodes (8): bounded(), ReadOnlyModbus, slow_factory(), SlowClient, test_a_silent_server_times_out_instead_of_hanging(), test_the_live_package_has_no_write_path(), Open items, Submission checklist (Sustainathon 2026, AI-07)

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
Cohesion: 0.10
Nodes (6): LiveAttackLauncher, LiveRuntime, test_restart_resumes_rows_and_marks_a_gap(), test_calibrating_has_progress_no_alerts_and_then_runs(), test_calibration_reports_quality_blocker_and_recovers(), test_training_failure_preserves_data_and_requires_explicit_retry()

### Community 74 - "demo_trials.py"
Cohesion: 0.27
Nodes (10): build_report(), main(), pair_key(), _pick_primary_backup(), _rank(), run_live(), run_sim(), _summarize_pair() (+2 more)

### Community 75 - "Screenshots"
Cohesion: 0.35
Nodes (10): ambiguousShot(), { chromium }, errors, haiIncident(), log, require, shot(), simViews() (+2 more)

### Community 76 - "TagMap"
Cohesion: 0.09
Nodes (15): alter_response(), frame(), LabProxy, decode(), encode(), Tag, evaluate(), free_port() (+7 more)

### Community 78 - "Dependencies"
Cohesion: 0.17
Nodes (12): dependencies, echarts, echarts-for-react, firebase, @fontsource/inter, @fontsource/jetbrains-mono, framer-motion, lucide-react (+4 more)

### Community 79 - "live_voice.py"
Cohesion: 0.14
Nodes (10): _authenticate(), connect_model(), live_voice(), browser_to_gemini(), opening_prompt(), process_snapshot(), session_config(), test_voice_rejects_wrong_demo_key_before_gemini() (+2 more)

### Community 80 - "ProcessWorkspace.tsx"
Cohesion: 0.20
Nodes (13): Message, AssetInspector(), EvidenceList(), formatCategory(), IncidentProgress(), ResponseEvent, GraphView, ProcessWorkspace() (+5 more)

### Community 81 - "localization.py"
Cohesion: 0.09
Nodes (24): attack_run(), Run, sample_attack(), _val_runs(), build_incident(), Weights, Row, rows() (+16 more)

### Community 82 - "test_sim.py"
Cohesion: 0.29
Nodes (9): Plant, test_attack_ends_after_duration(), test_freeze_does_not_leak_across_reset(), test_sensor_freeze_holds_reported_value(), test_sensor_ramp_drifts_linearly(), test_clean_run_stays_in_band(), test_clean_state_reported_tracks_truth(), test_mass_balance_overflow_and_dry() (+1 more)

### Community 85 - "Screenshots"
Cohesion: 0.24
Nodes (8): { chromium }, errors, liveViews(), log, require, shot(), SIZES, sleep()

### Community 86 - "AI Pilot · Signal Room design plan"
Cohesion: 0.33
Nodes (5): AI Pilot · Signal Room design plan, Design references, Implementation flow, Master idea, Reusable implementation prompt

### Community 87 - "Scripts"
Cohesion: 0.25
Nodes (8): scripts, build, dev, e2e, lint, preview, test, typecheck

### Community 90 - "Vercel"
Cohesion: 0.29
Nodes (6): buildCommand, framework, headers, outputDirectory, rewrites, $schema

### Community 91 - "Test"
Cohesion: 0.33
Nodes (4): css, spec, postcss, @tailwindcss/postcss

### Community 94 - "pytest"
Cohesion: 0.10
Nodes (27): allowed_hosts(), AllowlistError, check_host(), is_loopback(), AttackerClient, AttackerError, AttackRecord, _neutral() (+19 more)

### Community 96 - "AttackTrace AI Pilot model registry and verification"
Cohesion: 0.50
Nodes (3): AI Pilot's jobs and exact system instructions, AttackTrace AI Pilot model registry and verification, Configuration and verification

### Community 108 - "Incident evidence delivery — 15 October 2026"
Cohesion: 0.22
Nodes (7): Incident evidence delivery — 15 October 2026, Investigation and Copilot, Measured harder tests, Next research priority, Preserved evidence, Verification, Incident evidence implementation plan

### Community 109 - "AttackTrace: proposed SOC and Twin/Graph enhancement plan"
Cohesion: 0.06
Nodes (28): AttackTrace implementation plan, Build order, Data modes, Milestone 1 — trustworthy assistance and investigation UI, Milestone 2 — explicit evidence records and uncertainty, Milestone 3 — local communication-channel attribution, Milestone 4 — emulated firmware/configuration integrity, Milestone 5 — validation and response workflow (+20 more)

### Community 111 - "main"
Cohesion: 0.40
Nodes (3): _fmt_eta(), main(), test_cli_prints_30s()

### Community 112 - "AttackSpec"
Cohesion: 0.26
Nodes (11): AttackSpec, _pair(), _run(), test_actuator_force_pump_off_stops_flow(), test_actuator_force_valve_open_wastes_energy(), test_attack_is_deterministic(), test_ground_truth_recorded(), test_invalid_specs_rejected() (+3 more)

### Community 114 - "Presenter cheat sheet (one page)"
Cohesion: 0.29
Nodes (6): Click path (SIM), Fast facts if asked, Headline numbers (say the n, not just the %), If LIVE fails mid-demo, If Top-1 is wrong, Presenter cheat sheet (one page)

### Community 115 - "AttackTrace"
Cohesion: 0.07
Nodes (26): 🏛 5-Layer System Architecture (Graphify Mapped), AttackTrace, 📊 Benchmark & Evaluation Results, 🔄 End-to-End Incident Lifecycle, 🗺 Graphify Codebase Navigation, 🎮 Interactive Live Demo Script, 🎨 Layer 1: Frontend (React 19 + TypeScript + Vite), ⚡ Layer 2: API & Gateway (FastAPI + Cloudflare Workers) (+18 more)

### Community 117 - "FakeClient"
Cohesion: 0.17
Nodes (10): ReadError, load_tagmap(), test_shipped_tagmap_is_valid_and_complete(), FakeClient, poller(), test_a_partial_read_failure_keeps_the_other_tags(), test_backoff_grows_is_capped_and_resets(), test_reads_are_batched_by_contiguous_block() (+2 more)

### Community 118 - "Demo script (3 minutes)"
Cohesion: 0.40
Nodes (4): Before you go on stage (5 minutes ahead), Demo script (3 minutes), Fallback path, Run sheet

### Community 125 - "time"
Cohesion: 0.25
Nodes (12): click_path(), main(), post(), wait_healthy(), check(), check_backend_health(), check_console_errors(), check_emulator() (+4 more)

### Community 126 - "attacker/cli.py"
Cohesion: 0.39
Nodes (5): main(), parse_args(), run(), load_attacker(), test_cli_rejects_a_non_allowlisted_host()

### Community 127 - "index.js"
Cohesion: 0.70
Nodes (4): error(), fetch(), handle(), origin()

### Community 137 - "json"
Cohesion: 0.09
Nodes (13): read_checkpoint(), source_fingerprint(), write_checkpoint(), load_live(), main(), test_bad_checkpoint_is_rejected(), test_checkpoint_write_failure_keeps_previous_file(), test_source_contract_changes_with_endpoint_or_register_mapping() (+5 more)

## Knowledge Gaps
- **11 isolated node(s):** `attacktrace`, `echarts`, `echarts-for-react`, `@types/node`, `@types/react` (+6 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 934 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **31 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `3.10 LIVE ingestion: a real industrial protocol` connect `incident.render.test.ts` to `test_emulator.py`, `test_sim.py`, `Rest`?**
  _High betweenness centrality (0.308) - this node is a cross-community bridge._
- **Are the 97 inferred relationships involving `Engine` (e.g. with `🧠 Layer 3: Services & Detection Engine` and `_engine()`) actually correct?**
  _`Engine` has 97 INFERRED edges - model-reasoned connections that need verification._
- **What connects `attacktrace`, `echarts`, `echarts-for-react` to the rest of the system?**
  _11 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `numpy` be split into smaller, more focused modules?**
  _Cohesion score 0.09739866908650938 - nodes in this community are weakly interconnected._
- **Are the 33 inferred relationships involving `Settings` (e.g. with `prepare_storage()` and `validate()`) actually correct?**
  _`Settings` has 33 INFERRED edges - model-reasoned connections that need verification._
- **Should `simulate` be split into smaller, more focused modules?**
  _Cohesion score 0.12169312169312169 - nodes in this community are weakly interconnected._
- **Are the 24 inferred relationships involving `LiveRuntime` (e.g. with `🧠 Layer 3: Services & Detection Engine` and `post_chat()`) actually correct?**
  _`LiveRuntime` has 24 INFERRED edges - model-reasoned connections that need verification._