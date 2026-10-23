# Graph Report - Attacktrace  (2026-10-23)

## Corpus Check
- 396 files · ~1,130,870 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 57 file(s) not represented in the graph (top: (none) 22, .pt 12, .log 8)

## Summary
- 2935 nodes · 9249 edges · 135 communities (103 shown, 32 thin omitted)
- Extraction: 90% EXTRACTED · 10% INFERRED · 0% AMBIGUOUS · INFERRED: 920 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `248904d9`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- numpy
- test_eval_baseline.py
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
- test_hai.py
- Engine
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
- data/hai.py
- verify_ai_models.py
- schemas.py
- copilot.py
- pipeline.py
- Report
- Authentication
- reconstruct
- RateLimiter
- lab.py
- sys
- Settings
- Package
- classify_language
- live_soak.py
- types.ts
- AttackRequest
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
- Engine
- test_gateway.py
- app/engine.py
- ReadOnlyModbus
- security.py
- MetricsPage.tsx
- evaluate
- AttackTrace_Slides.md
- Private-server release plan — 16 October 2026
- LiveRuntime
- test_copilot.py
- demo_trials.py
- Screenshots
- TagMap
- typing
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
- record
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
- load_hai_baseline
- FakeClient
- Demo script (3 minutes)
- QA_Prep.md
- time
- attacker/cli.py
- index.js
- lifespan
- python-dependency-audit.json
- RegisterOverlay
- BenignOverlay
- test_transient_read_errors_are_retried
- json

## God Nodes (most connected - your core abstractions)
1. `Engine` - 142 edges
2. `Settings` - 107 edges
3. `LiveRuntime` - 70 edges
4. `create_app()` - 65 edges
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

## Communities (135 total, 32 thin omitted)

### Community 0 - "numpy"
Cohesion: 0.09
Nodes (38): static_graph(), break_ties(), Candidate, causal_term(), combine_onsets(), deviation_term(), first_crossings(), localize() (+30 more)

### Community 1 - "test_eval_baseline.py"
Cohesion: 0.26
Nodes (7): baseline_rank(), evaluate_baseline_localization(), fitted(), test_baseline_saved_before_names_existed_still_works(), test_missed_attacks_count_as_misses(), test_rank_breaks_ties_by_larger_deviation(), test_rank_puts_the_first_breaching_node_first()

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
Cohesion: 0.18
Nodes (4): HaiEngine, test_dataset_attack_becomes_an_incident_without_invented_labels(), test_replay_starts_before_the_first_attack_and_follows_the_speed(), test_reset_restarts_the_replay_and_the_replay_loops()

### Community 6 - "robustness.py"
Cohesion: 0.11
Nodes (6): NoOverlay, Overlay, _clip(), Impact, PlantParams, _time_to()

### Community 7 - "types.ts"
Cohesion: 0.06
Nodes (67): Access, AccessContext, useAccess(), IsolateButton(), IncidentEvidencePanel(), detail, LabStatus, LocalLab() (+59 more)

### Community 8 - "BaselineDetector"
Cohesion: 0.11
Nodes (19): BaselineDetector, Loaded, LiveEngine, SourceNotReadyError, engine(), make_live(), make_live(), test_a_sim_attack_is_found_through_the_live_path() (+11 more)

### Community 9 - "json"
Cohesion: 0.25
Nodes (14): asset_registers(), baseline_comparison(), capture(), detail(), evidence(), export(), journal(), progress() (+6 more)

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
Cohesion: 0.08
Nodes (5): ModbusPoller, ReadOnlyClient, TagMap, slow_factory(), SlowClient

### Community 16 - "live.ts"
Cohesion: 0.17
Nodes (16): StatusPill(), STYLE, latencyMs(), PILL_LABEL, pillKind, LiveMessage, BACKOFF_BASE_MS, BACKOFF_MAX_MS (+8 more)

### Community 17 - "react"
Cohesion: 0.06
Nodes (70): MetricsPage, Root(), Route(), SocPage, VoiceSettingsPage, WorkspaceLoading(), WorkspacePage, SOURCE_NAMES (+62 more)

### Community 18 - "test_live_runtime.py"
Cohesion: 0.09
Nodes (18): Hub, run_loop(), IncidentStore, create_app(), test_sim_and_hai_attack_paths_are_unaffected(), collect(), emulator_runtime(), free_port() (+10 more)

### Community 19 - "Rest"
Cohesion: 0.13
Nodes (23): control_hai_replay(), _engine(), get_hai_replay(), get_incident_report(), get_incidents(), get_live_health(), get_metrics(), get_status() (+15 more)

### Community 21 - "test_hai.py"
Cohesion: 0.17
Nodes (16): HaiData, client(), data(), hai_engine(), test_detector_metrics_on_a_known_alert_pattern(), test_hai_mode_is_refused_without_data_or_models(), test_hai_playback_controls_pause_without_consuming_rows(), test_hosted_replay_loads_only_test_recording() (+8 more)

### Community 22 - "Engine"
Cohesion: 0.12
Nodes (4): Engine, test_detector_is_warm_before_the_first_message(), test_message_shape_and_cadence(), clean_states()

### Community 23 - "copilot.py"
Cohesion: 0.19
Nodes (9): bounded_chat(), get_copilot_engine(), get_suggestions(), post_chat(), suggestions(), CopilotChatRequest, CopilotChatResponse, test_timed_out_provider_keeps_capacity_until_worker_finishes() (+1 more)

### Community 24 - "Write"
Cohesion: 0.09
Nodes (18): analyze(), main(), analyze(), main(), analyze(), main(), _pct(), analyze() (+10 more)

### Community 25 - "Api"
Cohesion: 0.18
Nodes (12): AttackResponse, client(), test_attack_validation(), test_incidents_and_reset(), test_live_loop_survives_a_failing_tick(), test_metrics(), test_metrics_merges_live_metrics_without_touching_the_file(), test_status_and_mode() (+4 more)

### Community 26 - "Socstore"
Cohesion: 0.21
Nodes (20): runtime_context(), LiveMessage, SocStore, message(), test_api_export_and_archived_copilot_use_original_capture(), test_capture_integrity_failure_never_returns_modified_payload(), test_capture_is_immutable_survives_reopen_and_telemetry_rotation(), test_capture_retention_follows_incident_not_telemetry() (+12 more)

### Community 27 - "eval/hai.py"
Cohesion: 0.07
Nodes (31): HaiFile, load_hai(), process_of(), alert_mask(), rising_edges(), sustained(), HaiLoaded, load_hai_detector() (+23 more)

### Community 28 - "Grounding"
Cohesion: 0.16
Nodes (23): _build_context_summary(), CopilotEngine, _get_gemini_key(), incident_evidence_summary(), local_checks(), _offline_expert_reply(), CopilotTurn, Incident (+15 more)

### Community 29 - "Robustness"
Cohesion: 0.16
Nodes (18): model_fingerprints(), assess_calibration(), Case, evaluate_case(), fit_calibration(), observations(), probability(), reliability() (+10 more)

### Community 30 - "gateway/package.json"
Cohesion: 0.08
Nodes (20): devDependencies, miniflare, engines, node, name, overrides, sharp, undici (+12 more)

### Community 31 - "hai_fixture.py"
Cohesion: 0.23
Nodes (5): hai_dir(), hai_models(), make_dataset(), _signals(), _write()

### Community 32 - "PlantEmulator"
Cohesion: 0.11
Nodes (9): evaluate(), emu(), free_port(), test_attack_endpoint_writes_to_the_emulator_and_reveals_ground_truth(), test_attack_refused_while_live_is_calibrating(), test_demo_mode_off_blocks_live_attack_before_the_attacker_is_ever_called(), emu(), test_manifest_changes_real_emulator_controller_and_invalid_file_is_reported() (+1 more)

### Community 33 - "data/hai.py"
Cohesion: 0.18
Nodes (7): hai_paths(), load_hai_replay(), node_kind(), _read(), _read_csv(), test_paths_ignore_missing_folder_and_other_files(), test_tag_naming_heuristics()

### Community 34 - "verify_ai_models.py"
Cohesion: 0.24
Nodes (7): gemini_key(), _audio(), _interaction(), _live_check(), _result(), _speech_body(), verify()

### Community 35 - "schemas.py"
Cohesion: 0.10
Nodes (20): _Open, is_ambiguous(), _Open, origin_candidate(), topology_of(), AlertInfo, GroundTruthInfo, Impact (+12 more)

### Community 37 - "copilot.py"
Cohesion: 0.12
Nodes (10): assess_layers(), evidence_priority(), LabProxy, free_port(), port(), test_channel_evidence_rules(), test_integrity_requires_observation_and_separate_approval(), test_normal_read_after_alteration_does_not_erase_retained_evidence() (+2 more)

### Community 38 - "pipeline.py"
Cohesion: 0.06
Nodes (36): simulate(), aggregate(), best_threshold(), fit_err_sd(), ForecastDetector, residuals(), build_model(), GDN (+28 more)

### Community 39 - "Report"
Cohesion: 0.16
Nodes (10): _eta(), render_report(), para(), _utc(), ascii_text(), _escape(), Page, text_width() (+2 more)

### Community 40 - "Authentication"
Cohesion: 0.15
Nodes (14): check_origin(), config(), firebase_app(), identity(), logout(), me(), names(), protect() (+6 more)

### Community 41 - "reconstruct"
Cohesion: 0.20
Nodes (6): _cost(), hop_distance(), PathNode, Propagation, reconstruct(), _shortest()

### Community 42 - "RateLimiter"
Cohesion: 0.17
Nodes (11): 1. Five-Layer Architecture Map, 2. Layer-by-Layer Breakdown & Source Evidence, 3. End-to-End User Workflows, 4. Authentication, Authorization & Security Flow, AttackTrace: Full Interactive Architecture Map, 🌐 Interactive Visualization Artifacts, 🎨 Layer 1: Frontend, ⚡ Layer 2: API & Gateway (+3 more)

### Community 43 - "lab.py"
Cohesion: 0.26
Nodes (11): configure(), emulator_info(), exclusive(), integrity(), ManifestChange, observe_integrity(), probe(), proxy() (+3 more)

### Community 44 - "sys"
Cohesion: 0.08
Nodes (14): anonymous_stream_denied(), main(), NoRedirect, origin(), public_streams_available(), read(), require(), main() (+6 more)

### Community 45 - "Settings"
Cohesion: 0.10
Nodes (18): Settings, LiveConfig, LiveConfigError, load_live(), build_live_runtime(), ensure_metrics(), safe_ensure_metrics(), test_restart_resumes_rows_and_marks_a_gap() (+10 more)

### Community 46 - "Package"
Cohesion: 0.08
Nodes (26): name, overrides, @grpc/grpc-js, private, type, version, root, autoprefixer (+18 more)

### Community 47 - "classify_language"
Cohesion: 0.13
Nodes (15): classify_language(), detect_unsupported_script(), has_tamil_characters(), is_self_echo(), LanguageClassification, sanitize_response_text(), tokenize_words(), gemini_to_browser() (+7 more)

### Community 48 - "live_soak.py"
Cohesion: 0.08
Nodes (31): AttackerClient, load_baseline(), load_detector(), load_graph(), live_dir(), live_models_ready(), build_engine(), analyze() (+23 more)

### Community 49 - "types.ts"
Cohesion: 0.13
Nodes (20): Props, ImpactMeters(), Meter(), tone(), etaUrgency(), formatEta(), parsePilotAction(), PilotAction (+12 more)

### Community 50 - "AttackRequest"
Cohesion: 0.22
Nodes (12): _has_hazard(), AttackRequest, _open_incident(), run(), test_attack_produces_localized_incident(), test_clean_run_raises_no_incident(), test_incident_closes_after_attack_ends(), test_incident_reports_the_ambiguity_flag() (+4 more)

### Community 51 - "test_emulator.py"
Cohesion: 0.15
Nodes (20): client_for(), free_port(), mutate(), raw_map(), read_values(), run_ticks(), test_a_rogue_setpoint_moves_the_plant(), test_a_sensor_offset_fools_the_controller() (+12 more)

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
Cohesion: 0.22
Nodes (11): AttackResult, _false_alarm_per_hour(), LiveEvalState, main(), _pct(), _prf(), _rising_edges(), run() (+3 more)

### Community 58 - "models.py"
Cohesion: 0.18
Nodes (11): classify_failure(), Failure, ModelRouter, _retry_after(), _status_code(), test_live_greeting_states_only_observed_status(), test_model_pool_rejects_cross_modality(), test_preferred_model_fails_over_after_rate_limit() (+3 more)

### Community 59 - "test_live_connectors.py"
Cohesion: 0.08
Nodes (26): Aligner, Sample, excluded_from_ranking(), QualityTracker, TagSpec, _Track, LiveSource, _pct() (+18 more)

### Community 60 - "Compileroptions"
Cohesion: 0.11
Nodes (17): compilerOptions, isolatedModules, jsx, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch (+9 more)

### Community 61 - "run_isolation"
Cohesion: 0.33
Nodes (5): Arm, _isolate(), run_isolation(), _spec(), _summary()

### Community 62 - "Engine"
Cohesion: 0.21
Nodes (11): client(), opened(), step_until(), test_isolate_endpoint(), test_isolate_is_409_in_hai_mode_and_needs_the_key(), test_isolating_a_wrong_node_never_contains(), test_isolating_the_true_origin_contains_the_incident(), test_isolation_after_the_attack_ended_is_not_credited() (+3 more)

### Community 63 - "test_gateway.py"
Cohesion: 0.08
Nodes (16): GatewayBoundary, headers(), login(), secured(), test_analyst_decisions_record_verified_actor(), test_login_cookie_membership_and_csrf(), test_logout_invalidates_copied_cookie_and_stream(), test_missing_server_credentials_fail_closed() (+8 more)

### Community 64 - "app/engine.py"
Cohesion: 0.18
Nodes (9): worst_impact(), check_structure(), client(), test_impact_snapshot_keeps_the_worst_values(), test_report_endpoint_returns_a_valid_one_page_pdf(), test_report_is_open_without_a_key(), test_report_shows_the_ambiguous_banner_and_breakdown(), test_unknown_incident_is_404() (+1 more)

### Community 65 - "ReadOnlyModbus"
Cohesion: 0.12
Nodes (7): bounded(), ReadError, ReadOnlyModbus, test_a_silent_server_times_out_instead_of_hanging(), test_the_live_package_has_no_write_path(), Open items, Submission checklist (Sustainathon 2026, AI-07)

### Community 66 - "security.py"
Cohesion: 0.18
Nodes (6): _is_loopback(), limit_attacks(), RateLimiter, require_demo(), require_key(), test_rate_limiter_window_slides()

### Community 67 - "MetricsPage.tsx"
Cohesion: 0.07
Nodes (49): BaselineComparison(), Report, Result, chartOption(), getChartColors(), MetricsChart(), Card(), Cards() (+41 more)

### Community 68 - "evaluate"
Cohesion: 0.33
Nodes (3): Counts, evaluate(), _onsets()

### Community 69 - "AttackTrace_Slides.md"
Cohesion: 0.15
Nodes (12): Approach, Architecture, AttackTrace, Detect → Locate → Contain, Limitations, Live demo, Results: real HAI data, Results: real protocol (LIVE) (+4 more)

### Community 70 - "Private-server release plan — 16 October 2026"
Cohesion: 0.06
Nodes (28): Copilot polish and private-server foundation — 16 October 2026, Implemented, Validation and current limits, Activate the selected ADC method, Credentials and access, Deployment and verification still required, Firebase private-server setup — 16 October 2026, What the implementation enforces (+20 more)

### Community 72 - "LiveRuntime"
Cohesion: 0.10
Nodes (12): LiveRuntime, CalibrationInfo, FakeClock, feed(), live_settings(), test_calibrating_has_progress_no_alerts_and_then_runs(), test_calibration_cadence_tolerates_tick_jitter(), test_calibration_reports_quality_blocker_and_recovers() (+4 more)

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
Cohesion: 0.13
Nodes (6): alter_response(), frame(), decode(), encode(), Tag, test_encoding_round_trips()

### Community 77 - "typing"
Cohesion: 0.16
Nodes (3): digest(), loaded_context(), Runtime

### Community 78 - "Dependencies"
Cohesion: 0.17
Nodes (12): dependencies, echarts, echarts-for-react, firebase, @fontsource/inter, @fontsource/jetbrains-mono, framer-motion, lucide-react (+4 more)

### Community 79 - "live_voice.py"
Cohesion: 0.14
Nodes (10): _authenticate(), connect_model(), live_voice(), browser_to_gemini(), opening_prompt(), process_snapshot(), session_config(), test_live_extended_thinking_has_required_configuration() (+2 more)

### Community 80 - "ProcessWorkspace.tsx"
Cohesion: 0.20
Nodes (13): Message, AssetInspector(), EvidenceList(), formatCategory(), IncidentProgress(), ResponseEvent, GraphView, ProcessWorkspace() (+5 more)

### Community 81 - "load_detector"
Cohesion: 0.06
Nodes (35): GroundTruth, attack_run(), Run, sample_attack(), _val_runs(), action_for(), explain(), Explanation (+27 more)

### Community 82 - "test_sim.py"
Cohesion: 0.17
Nodes (15): PID, Plant, test_attack_ends_after_duration(), test_freeze_does_not_leak_across_reset(), test_sensor_freeze_holds_reported_value(), test_sensor_ramp_drifts_linearly(), test_clean_run_stays_in_band(), test_clean_state_reported_tracks_truth() (+7 more)

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
Cohesion: 0.11
Nodes (7): TagMapError, test_backup_includes_committed_wal_and_closes_output(), test_backup_refuses_to_replace_existing_data(), main(), load(), TruthEvent, backup()

### Community 93 - "record"
Cohesion: 0.28
Nodes (4): Snapshot, LiveRecorder, record(), test_recording_stops_growing_when_full()

### Community 94 - "pytest"
Cohesion: 0.10
Nodes (27): allowed_hosts(), AllowlistError, check_host(), is_loopback(), AttackerError, AttackRecord, _neutral(), _surface_tag() (+19 more)

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
Cohesion: 0.33
Nodes (3): _fmt_eta(), main(), test_cli_prints_30s()

### Community 112 - "AttackSpec"
Cohesion: 0.16
Nodes (13): _Active, AttackEngine, AttackSpec, _pair(), _run(), test_actuator_force_pump_off_stops_flow(), test_actuator_force_valve_open_wastes_energy(), test_attack_is_deterministic() (+5 more)

### Community 114 - "Presenter cheat sheet (one page)"
Cohesion: 0.29
Nodes (6): Click path (SIM), Fast facts if asked, Headline numbers (say the n, not just the %), If LIVE fails mid-demo, If Top-1 is wrong, Presenter cheat sheet (one page)

### Community 115 - "AttackTrace"
Cohesion: 0.07
Nodes (26): 🏛 5-Layer System Architecture (Graphify Mapped), AttackTrace, 📊 Benchmark & Evaluation Results, 🔄 End-to-End Incident Lifecycle, 🗺 Graphify Codebase Navigation, 🎮 Interactive Live Demo Script, 🎨 Layer 1: Frontend (React 19 + TypeScript + Vite), ⚡ Layer 2: API & Gateway (FastAPI + Cloudflare Workers) (+18 more)

### Community 116 - "load_hai_baseline"
Cohesion: 0.24
Nodes (8): hai_models_ready(), load_hai_baseline(), build_hai_engine(), test_speed_is_clamped_to_the_supported_range(), speed(), test_trained_models_round_trip(), Actual held-out results from this installation, HAI replay installation and controls

### Community 117 - "FakeClient"
Cohesion: 0.23
Nodes (9): load_tagmap(), test_shipped_tagmap_is_valid_and_complete(), FakeClient, poller(), test_a_partial_read_failure_keeps_the_other_tags(), test_backoff_grows_is_capped_and_resets(), test_reads_are_batched_by_contiguous_block(), test_requests_in_flight_are_bounded() (+1 more)

### Community 118 - "Demo script (3 minutes)"
Cohesion: 0.40
Nodes (4): Before you go on stage (5 minutes ahead), Demo script (3 minutes), Fallback path, Run sheet

### Community 125 - "time"
Cohesion: 0.44
Nodes (8): check(), check_backend_health(), check_console_errors(), check_emulator(), check_frontend_loads(), check_key_configured(), check_ws_rate(), main()

### Community 126 - "attacker/cli.py"
Cohesion: 0.43
Nodes (4): main(), parse_args(), run(), load_attacker()

### Community 127 - "index.js"
Cohesion: 0.70
Nodes (4): error(), fetch(), handle(), origin()

### Community 137 - "json"
Cohesion: 0.09
Nodes (13): _from_env(), get_settings(), read_checkpoint(), source_fingerprint(), write_checkpoint(), main(), main(), test_bad_checkpoint_is_rejected() (+5 more)

## Knowledge Gaps
- **11 isolated node(s):** `attacktrace`, `echarts`, `echarts-for-react`, `@types/node`, `@types/react` (+6 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 933 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **32 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `3.10 LIVE ingestion: a real industrial protocol` connect `incident.render.test.ts` to `test_emulator.py`, `test_sim.py`, `Rest`?**
  _High betweenness centrality (0.304) - this node is a cross-community bridge._
- **Are the 97 inferred relationships involving `Engine` (e.g. with `🧠 Layer 3: Services & Detection Engine` and `_engine()`) actually correct?**
  _`Engine` has 97 INFERRED edges - model-reasoned connections that need verification._
- **What connects `attacktrace`, `echarts`, `echarts-for-react` to the rest of the system?**
  _11 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `numpy` be split into smaller, more focused modules?**
  _Cohesion score 0.08704557091653865 - nodes in this community are weakly interconnected._
- **Are the 33 inferred relationships involving `Settings` (e.g. with `prepare_storage()` and `validate()`) actually correct?**
  _`Settings` has 33 INFERRED edges - model-reasoned connections that need verification._
- **Should `GraphView.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07207792207792207 - nodes in this community are weakly interconnected._
- **Are the 24 inferred relationships involving `LiveRuntime` (e.g. with `🧠 Layer 3: Services & Detection Engine` and `post_chat()`) actually correct?**
  _`LiveRuntime` has 24 INFERRED edges - model-reasoned connections that need verification._