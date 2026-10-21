# Graph Report - Attacktrace  (2026-10-21)

## Corpus Check
- 366 files · ~863,675 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 39 file(s) not represented in the graph (top: (none) 22, .log 8, .css 2)

## Summary
- 2862 nodes · 9027 edges · 126 communities (97 shown, 29 thin omitted)
- Extraction: 90% EXTRACTED · 10% INFERRED · 0% AMBIGUOUS · INFERRED: 911 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `647b865b`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- numpy
- test_detect.py
- Settings
- GraphView.tsx
- pathlib
- test_live_runtime.py
- Plant
- Api
- json
- Preflight
- useLive
- react
- Plantemulator
- aggregate
- Readonlyclient
- TopBar.tsx
- CopilotDrawer.tsx
- Copilot
- Rest
- Attacker
- Haiengine
- schemas.py
- Proxy
- Write
- Api
- Socstore
- Hai
- Grounding
- Robustness
- Package
- Live
- Emulator
- vitest
- Isolate
- Replay
- ._advance_incident
- Hai
- time
- Report
- Authentication
- robustness.py
- RateLimiter
- lab.py
- Investigation
- Settings
- Package
- GraphParts.tsx
- Scenario
- Voice
- Attackrequest
- Fakeclient
- Security
- AttackTrace UI and navigation repair — 16 October 2026
- LIVE calibration fix and next implementation plan
- Devdependencies
- incident.render.test.ts
- Voice
- geometry.ts
- Aligner
- Compileroptions
- App
- models.py
- reconstruct
- test_report.py
- load_hai_detector
- Isolate
- MetricsPage.tsx
- Csv
- AttackTrace_Slides.md
- Vercel + Render deployment package — 16 October 2026
- ws.py
- demo_trials.py
- Screenshots
- ReadOnlyModbus
- Backup
- Dependencies
- Registeroverlay
- verify_ai_models.py
- localization.py
- COPILOT_PRIVATE_FOUNDATION_DELIVERY.md
- firebase.ts
- test_copilot.py
- Screenshots
- AI Pilot · Signal Room design plan
- Scripts
- Package
- Test
- Vercel
- Test
- Private-server release plan — 16 October 2026
- AttackTrace visual review — 15 October 2026
- AttackTrace
- Voicecaptureprocessor
- AttackTrace AI Pilot model registry and verification
- Attacktrace
- Incident evidence delivery — 15 October 2026
- AttackTrace: proposed SOC and Twin/Graph enhancement plan
- AttackTrace implementation plan
- README.md
- Presenter cheat sheet (one page)
- Third-party resources
- Local investigation checklist
- SIM stress study — 15 October 2026
- Demo script (3 minutes)
- QA_Prep.md
- check-firebase-adc.py
- _windows

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
- `⚡ Layer 2: API & Gateway` --references--> `create_app()`  [INFERRED]
  ARCHIFY_ARCHITECTURE_MAP.md → backend/app/main.py
- `4. Authentication, Authorization & Security Flow` --references--> `RateLimiter`  [INFERRED]
  ARCHIFY_ARCHITECTURE_MAP.md → backend/app/api/security.py
- `3.10 LIVE ingestion: a real industrial protocol` --references--> `live()`  [INFERRED]
  submission/AttackTrace_Documentation.md → backend/app/api/ws.py
- `🧠 Layer 3: Services & Detection Engine` --references--> `Engine`  [INFERRED]
  ARCHIFY_ARCHITECTURE_MAP.md → backend/app/engine.py
- `🧠 Layer 3: Services & Detection Engine` --references--> `HaiEngine`  [INFERRED]
  ARCHIFY_ARCHITECTURE_MAP.md → backend/app/engine_hai.py

## Import Cycles
- None detected.

## Communities (126 total, 29 thin omitted)

### Community 0 - "numpy"
Cohesion: 0.07
Nodes (40): process_of(), is_ambiguous(), static_graph(), Incident, break_ties(), Candidate, causal_term(), combine_onsets() (+32 more)

### Community 1 - "test_detect.py"
Cohesion: 0.07
Nodes (22): GroundTruth, attack_run(), Run, sample_attack(), simulate(), GDN, _val_runs(), Counts (+14 more)

### Community 2 - "Settings"
Cohesion: 0.06
Nodes (38): Settings, read_checkpoint(), source_fingerprint(), write_checkpoint(), LiveConfig, LiveConfigError, load_live(), excluded_from_ranking() (+30 more)

### Community 3 - "GraphView.tsx"
Cohesion: 0.09
Nodes (34): edgeDelay(), edgeId(), layoutEdges(), MIN_LEARNED_WEIGHT, visibleEdges(), filterAssets(), FocusDirection, graphLinks() (+26 more)

### Community 4 - "pathlib"
Cohesion: 0.10
Nodes (3): main(), one_run(), post()

### Community 5 - "test_live_runtime.py"
Cohesion: 0.05
Nodes (37): LiveAttackLauncher, BaselineDetector, Loaded, LiveEngine, LiveRuntime, SourceNotReadyError, IncidentStore, engine() (+29 more)

### Community 6 - "Plant"
Cohesion: 0.07
Nodes (37): _Active, AttackEngine, AttackSpec, _fmt_eta(), main(), PID, _clip(), Impact (+29 more)

### Community 7 - "Api"
Cohesion: 0.08
Nodes (47): MODES, Props, Access, AccessContext, useAccess(), Message, AssetInspector(), EvidenceList() (+39 more)

### Community 8 - "json"
Cohesion: 0.08
Nodes (24): _from_env(), get_settings(), load_baseline(), load_detector(), load_graph(), build_engine(), safe_ensure_metrics(), analyze() (+16 more)

### Community 9 - "Preflight"
Cohesion: 0.05
Nodes (34): check_identity(), DeploymentError, main(), prepare_storage(), validate(), hai_dir(), hai_models(), make_dataset() (+26 more)

### Community 11 - "useLive"
Cohesion: 0.11
Nodes (42): App(), Center(), ViewToggle(), useFreshness(), EmptyState(), IncidentToast(), NoticeToast(), Panel() (+34 more)

### Community 12 - "react"
Cohesion: 0.08
Nodes (32): MetricsPage, Root(), Route(), SocPage, VoiceSettingsPage, WorkspaceLoading(), WorkspacePage, useLiveSourcePoll() (+24 more)

### Community 13 - "Plantemulator"
Cohesion: 0.09
Nodes (10): emu(), free_port(), test_attack_endpoint_writes_to_the_emulator_and_reveals_ground_truth(), test_attack_refused_while_live_is_calibrating(), test_demo_mode_off_blocks_live_attack_before_the_attacker_is_ever_called(), test_manifest_changes_real_emulator_controller_and_invalid_file_is_reported(), main(), load() (+2 more)

### Community 14 - "aggregate"
Cohesion: 0.07
Nodes (18): aggregate(), alert_mask(), best_threshold(), residuals(), rising_edges(), sustained(), sim_forward(), SimForward (+10 more)

### Community 15 - "Readonlyclient"
Cohesion: 0.07
Nodes (5): ModbusPoller, ReadOnlyClient, TagMap, slow_factory(), SlowClient

### Community 16 - "TopBar.tsx"
Cohesion: 0.13
Nodes (25): SOURCE_NAMES, TopBar(), narrated, useLiveStream(), StatusPill(), STYLE, getTopology(), setMode() (+17 more)

### Community 17 - "CopilotDrawer.tsx"
Cohesion: 0.10
Nodes (38): CopilotDrawer(), makeWelcome(), SOURCE_LABELS, groupTranscript(), Line, LiveVoicePanel(), pcm16(), playPcm() (+30 more)

### Community 18 - "Copilot"
Cohesion: 0.15
Nodes (9): bounded_chat(), get_copilot_engine(), get_suggestions(), post_chat(), assess_layers(), evidence_priority(), CopilotChatResponse, test_timed_out_provider_keeps_capacity_until_worker_finishes() (+1 more)

### Community 19 - "Rest"
Cohesion: 0.14
Nodes (22): control_hai_replay(), _engine(), get_hai_replay(), get_incident_report(), get_incidents(), get_live_health(), get_metrics(), get_status() (+14 more)

### Community 20 - "Attacker"
Cohesion: 0.12
Nodes (23): allowed_hosts(), AllowlistError, check_host(), is_loopback(), AttackerError, attacker_for(), read(), test_a_refused_write_never_reaches_the_emulator() (+15 more)

### Community 21 - "Haiengine"
Cohesion: 0.16
Nodes (5): HaiEngine, _Open, test_dataset_attack_becomes_an_incident_without_invented_labels(), test_replay_starts_before_the_first_attack_and_follows_the_speed(), test_reset_restarts_the_replay_and_the_replay_loops()

### Community 22 - "schemas.py"
Cohesion: 0.08
Nodes (18): origin_candidate(), topology_of(), Runtime, AlertInfo, AttackResponse, CalibrationInfo, CopilotChatRequest, IsolateRequest (+10 more)

### Community 23 - "Proxy"
Cohesion: 0.11
Nodes (15): alter_response(), frame(), LabProxy, decode(), encode(), Tag, evaluate(), free_port() (+7 more)

### Community 24 - "Write"
Cohesion: 0.09
Nodes (20): analyze(), main(), analyze(), main(), analyze(), main(), _pct(), analyze() (+12 more)

### Community 25 - "Api"
Cohesion: 0.18
Nodes (11): client(), test_attack_validation(), test_incidents_and_reset(), test_live_loop_survives_a_failing_tick(), test_metrics(), test_metrics_merges_live_metrics_without_touching_the_file(), test_status_and_mode(), test_topology() (+3 more)

### Community 26 - "Socstore"
Cohesion: 0.23
Nodes (18): LiveMessage, NodeState, SocStore, message(), test_api_export_and_archived_copilot_use_original_capture(), test_capture_integrity_failure_never_returns_modified_payload(), test_capture_is_immutable_survives_reopen_and_telemetry_rotation(), test_capture_retention_follows_incident_not_telemetry() (+10 more)

### Community 27 - "Hai"
Cohesion: 0.19
Nodes (14): HaiFile, HaiLoaded, baseline_rank_nodes(), evaluate_detector(), evaluate_localization(), _first_alert(), _prf(), rank_nodes() (+6 more)

### Community 28 - "Grounding"
Cohesion: 0.17
Nodes (24): _build_context_summary(), CopilotEngine, _get_gemini_key(), incident_evidence_summary(), local_checks(), _offline_expert_reply(), suggestions(), CopilotTurn (+16 more)

### Community 29 - "Robustness"
Cohesion: 0.11
Nodes (19): model_fingerprints(), NoOverlay, assess_calibration(), BenignOverlay, Case, evaluate_case(), fit_calibration(), probability() (+11 more)

### Community 30 - "Package"
Cohesion: 0.08
Nodes (20): devDependencies, miniflare, engines, node, name, overrides, sharp, undici (+12 more)

### Community 31 - "Live"
Cohesion: 0.22
Nodes (11): AttackResult, _false_alarm_per_hour(), LiveEvalState, main(), _pct(), _prf(), _rising_edges(), run() (+3 more)

### Community 32 - "Emulator"
Cohesion: 0.12
Nodes (24): load_tagmap(), TagMapError, client_for(), emu(), free_port(), mutate(), raw_map(), read_values() (+16 more)

### Community 33 - "vitest"
Cohesion: 0.11
Nodes (20): CalibratingState(), html(), ModeToggle(), html(), ProgressRing(), SourcePill(), STYLE, base (+12 more)

### Community 34 - "Isolate"
Cohesion: 0.22
Nodes (10): client(), opened(), step_until(), test_isolate_endpoint(), test_isolate_is_409_in_hai_mode_and_needs_the_key(), test_isolating_a_wrong_node_never_contains(), test_isolating_the_true_origin_contains_the_incident(), test_refusals() (+2 more)

### Community 35 - "Replay"
Cohesion: 0.12
Nodes (28): Btn(), ReplayControls(), Props, Sparkline(), pctX(), Timeline(), usePlayback(), clampIndex() (+20 more)

### Community 37 - "Hai"
Cohesion: 0.14
Nodes (16): HaiData, node_kind(), split_tests(), process_scores(), client(), data(), test_detector_metrics_on_a_known_alert_pattern(), test_hai_playback_controls_pause_without_consuming_rows() (+8 more)

### Community 38 - "time"
Cohesion: 0.08
Nodes (24): fit_err_sd(), ForecastDetector, build_model(), make_windows(), MLPForecaster, Norm, predict(), train() (+16 more)

### Community 39 - "Report"
Cohesion: 0.16
Nodes (10): _eta(), render_report(), para(), _utc(), ascii_text(), _escape(), Page, text_width() (+2 more)

### Community 40 - "Authentication"
Cohesion: 0.19
Nodes (14): check_origin(), config(), firebase_app(), identity(), logout(), me(), names(), protect() (+6 more)

### Community 41 - "robustness.py"
Cohesion: 0.11
Nodes (8): action_for(), explain(), Explanation, signature(), Overlay, NodeSpec, NodeType, test_explanation_templates()

### Community 42 - "RateLimiter"
Cohesion: 0.12
Nodes (13): 1. Five-Layer Architecture Map, 2. Layer-by-Layer Breakdown & Source Evidence, 3. End-to-End User Workflows, 4. Authentication, Authorization & Security Flow, AttackTrace: Full Interactive Architecture Map, 🌐 Interactive Visualization Artifacts, 🎨 Layer 1: Frontend, ⚡ Layer 2: API & Gateway (+5 more)

### Community 43 - "lab.py"
Cohesion: 0.16
Nodes (15): configure(), emulator_info(), exclusive(), integrity(), ManifestChange, observe_integrity(), probe(), proxy() (+7 more)

### Community 44 - "Investigation"
Cohesion: 0.25
Nodes (14): asset_registers(), baseline_comparison(), capture(), detail(), evidence(), export(), journal(), progress() (+6 more)

### Community 45 - "Settings"
Cohesion: 0.28
Nodes (6): ensure_metrics(), test_a_failing_metrics_step_never_stops_startup(), test_existing_metrics_are_never_overwritten(), test_first_start_writes_metrics_once(), fake(), test_metrics_missing_the_hai_section_are_refreshed_once_data_appears()

### Community 46 - "Package"
Cohesion: 0.09
Nodes (23): name, overrides, @grpc/grpc-js, private, type, version, autoprefixer, echarts (+15 more)

### Community 47 - "GraphParts.tsx"
Cohesion: 0.09
Nodes (31): GraphNode, PlantNode, PlantNodeData, PlantNodeView(), PulseEdgeData, PulseEdgeT, PulseEdgeView(), StageData (+23 more)

### Community 48 - "Scenario"
Cohesion: 0.07
Nodes (32): main(), parse_args(), run(), AttackerClient, AttackRecord, load_attacker(), _neutral(), _surface_tag() (+24 more)

### Community 49 - "Voice"
Cohesion: 0.13
Nodes (9): connect_model(), live_voice(), browser_to_gemini(), gemini_to_browser(), opening_prompt(), process_snapshot(), session_config(), test_live_extended_thinking_has_required_configuration() (+1 more)

### Community 50 - "Attackrequest"
Cohesion: 0.11
Nodes (19): _has_hazard(), AttackRequest, _rank(), run_sim_trial(), _open_incident(), run(), test_attack_produces_localized_incident(), test_clean_run_raises_no_incident() (+11 more)

### Community 51 - "Fakeclient"
Cohesion: 0.20
Nodes (8): ReadError, FakeClient, poller(), test_a_partial_read_failure_keeps_the_other_tags(), test_backoff_grows_is_capped_and_resets(), test_reads_are_batched_by_contiguous_block(), test_requests_in_flight_are_bounded(), test_the_connection_is_dropped_and_retried_after_total_failure()

### Community 52 - "Security"
Cohesion: 0.15
Nodes (21): Engine, create_app(), test_sim_and_hai_attack_paths_are_unaffected(), test_a_source_that_goes_away_shows_down_not_a_crash(), test_live_is_unavailable_without_a_source_and_never_crashes(), test_switching_to_live_serves_quality_health_and_stays_read_only(), test_voice_rejects_wrong_demo_key_before_gemini(), client() (+13 more)

### Community 53 - "AttackTrace UI and navigation repair — 16 October 2026"
Cohesion: 0.12
Nodes (14): Acceptance and reporting, Additional constraints from the six user screenshots, AttackTrace UI and navigation repair — 16 October 2026, Design direction, Implementation order, Intended operator flow, Observed problems, Accessibility and journey follow-up (+6 more)

### Community 54 - "LIVE calibration fix and next implementation plan"
Cohesion: 0.15
Nodes (11): Baseline comparison, Calibration, evidence and UI follow-up — 15 October 2026, Delivered, Remaining validation, Verification, Follow-up delivery status, Implemented, LIVE calibration fix and next implementation plan (+3 more)

### Community 55 - "Devdependencies"
Cohesion: 0.11
Nodes (19): devDependencies, autoprefixer, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, @playwright/test (+11 more)

### Community 56 - "incident.render.test.ts"
Cohesion: 0.06
Nodes (44): missing(), BreakdownBar(), BreakdownLegend(), f2(), SEGMENTS, html(), three, top (+36 more)

### Community 57 - "Voice"
Cohesion: 0.21
Nodes (9): capabilities(), _interaction(), _key(), _limit(), _output_audio(), _output_text(), SpeechRequest, synthesize() (+1 more)

### Community 58 - "geometry.ts"
Cohesion: 0.10
Nodes (36): IncidentProgress(), ResponseEvent, GraphView, ProcessWorkspace(), Pump(), PumpProps, Tank(), TankProps (+28 more)

### Community 59 - "Aligner"
Cohesion: 0.12
Nodes (7): Aligner, Sample, QualityTracker, _Track, TagHealth, test_aligner_holds_the_last_value_until_max_age(), test_out_of_order_samples_are_dropped_and_counted()

### Community 60 - "Compileroptions"
Cohesion: 0.11
Nodes (17): compilerOptions, isolatedModules, jsx, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch (+9 more)

### Community 61 - "App"
Cohesion: 0.08
Nodes (16): GatewayBoundary, headers(), login(), secured(), test_analyst_decisions_record_verified_actor(), test_login_cookie_membership_and_csrf(), test_logout_invalidates_copied_cookie_and_stream(), test_missing_server_credentials_fail_closed() (+8 more)

### Community 62 - "models.py"
Cohesion: 0.18
Nodes (11): classify_failure(), Failure, ModelRouter, _retry_after(), _status_code(), test_live_greeting_states_only_observed_status(), test_model_pool_rejects_cross_modality(), test_preferred_model_fails_over_after_rate_limit() (+3 more)

### Community 63 - "reconstruct"
Cohesion: 0.22
Nodes (6): _cost(), hop_distance(), PathNode, Propagation, reconstruct(), _shortest()

### Community 64 - "test_report.py"
Cohesion: 0.16
Nodes (10): worst_impact(), Impact, check_structure(), client(), test_impact_snapshot_keeps_the_worst_values(), test_report_endpoint_returns_a_valid_one_page_pdf(), test_report_is_open_without_a_key(), test_report_shows_the_ambiguous_banner_and_breakdown() (+2 more)

### Community 65 - "load_hai_detector"
Cohesion: 0.21
Nodes (13): hai_models_ready(), load_hai_baseline(), load_hai_detector(), build_hai_engine(), lifespan(), hai_engine(), test_hai_mode_is_refused_without_data_or_models(), test_slow_speed_carries_fractions() (+5 more)

### Community 66 - "Isolate"
Cohesion: 0.26
Nodes (13): IsolateButton(), postIsolate(), advance(), begin(), candidateFor(), disabledReason(), IDLE, IsolateAvailability (+5 more)

### Community 67 - "MetricsPage.tsx"
Cohesion: 0.07
Nodes (49): BaselineComparison(), Report, Result, chartOption(), getChartColors(), MetricsChart(), Card(), Cards() (+41 more)

### Community 68 - "Csv"
Cohesion: 0.16
Nodes (7): hai_paths(), load_hai(), _read(), _read_csv(), test_paths_ignore_missing_folder_and_other_files(), test_train_files_are_required(), test_transient_read_errors_are_retried()

### Community 69 - "AttackTrace_Slides.md"
Cohesion: 0.15
Nodes (12): Approach, Architecture, AttackTrace, Detect → Locate → Contain, Limitations, Live demo, Results: real HAI data, Results: real protocol (LIVE) (+4 more)

### Community 70 - "Vercel + Render deployment package — 16 October 2026"
Cohesion: 0.17
Nodes (10): Documentation checked, Hosting direction — 16 October 2026, Recommendation, Work before publishing a split deployment, Current state, Deployment sequence, Persistent paths and backup, Routing and access (+2 more)

### Community 72 - "ws.py"
Cohesion: 0.18
Nodes (7): Hub, run_loop(), digest(), loaded_context(), runtime_context(), test_live_capture_context_includes_register_map_and_saved_training_reference(), test_loaded_identity_does_not_read_replacement_files()

### Community 74 - "demo_trials.py"
Cohesion: 0.31
Nodes (9): build_report(), main(), pair_key(), _pick_primary_backup(), run_live(), run_sim(), _summarize_pair(), TrialResult (+1 more)

### Community 75 - "Screenshots"
Cohesion: 0.27
Nodes (10): ambiguousShot(), { chromium }, errors, haiIncident(), log, require, shot(), simViews() (+2 more)

### Community 76 - "ReadOnlyModbus"
Cohesion: 0.14
Nodes (6): bounded(), ReadOnlyModbus, test_a_silent_server_times_out_instead_of_hanging(), test_the_live_package_has_no_write_path(), Open items, Submission checklist (Sustainathon 2026, AI-07)

### Community 77 - "Backup"
Cohesion: 0.43
Nodes (3): test_backup_includes_committed_wal_and_closes_output(), test_backup_refuses_to_replace_existing_data(), backup()

### Community 78 - "Dependencies"
Cohesion: 0.17
Nodes (12): dependencies, echarts, echarts-for-react, firebase, @fontsource/inter, @fontsource/jetbrains-mono, framer-motion, lucide-react (+4 more)

### Community 80 - "verify_ai_models.py"
Cohesion: 0.24
Nodes (7): gemini_key(), _audio(), _interaction(), _live_check(), _result(), _speech_body(), verify()

### Community 81 - "localization.py"
Cohesion: 0.15
Nodes (16): build_incident(), Weights, Row, rows(), summarize(), tune_margin(), tuning_rows(), analyze() (+8 more)

### Community 82 - "COPILOT_PRIVATE_FOUNDATION_DELIVERY.md"
Cohesion: 0.18
Nodes (8): Copilot polish and private-server foundation — 16 October 2026, Implemented, Validation and current limits, Activate the selected ADC method, Credentials and access, Deployment and verification still required, Firebase private-server setup — 16 October 2026, What the implementation enforces

### Community 84 - "test_copilot.py"
Cohesion: 0.31
Nodes (6): client(), test_copilot_chat(), test_copilot_suggestions(), test_no_active_incident_has_no_action(), test_unknown_requested_incident_returns_404(), test_virtual_sensor_isolation()

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

### Community 92 - "Private-server release plan — 16 October 2026"
Cohesion: 0.20
Nodes (10): Current assessment, Detection research track — separate from interface readiness, Execution order and definition of done, Phase 1 — Copilot polish and urgent persistence, Phase 2 — Consistent interface across the workspace, Phase 3 — Authenticated users and server-side authorization, Phase 4 — Shared monitoring and durable storage, Phase 5 — Copilot and service reliability (+2 more)

### Community 93 - "AttackTrace visual review — 15 October 2026"
Cohesion: 0.20
Nodes (8): Comparison decisions, Final generation prompt, Generated UI reference, AttackTrace visual review — 15 October 2026, Findings and implemented changes, Generated reference versus actual UI, Remaining scope, Verification

### Community 94 - "AttackTrace"
Cohesion: 0.20
Nodes (10): Architecture, AttackTrace, Demo script, Investigation workspace and local-first roadmap, Licence, Limitations, Quick start, Results (+2 more)

### Community 96 - "AttackTrace AI Pilot model registry and verification"
Cohesion: 0.50
Nodes (3): AI Pilot's jobs and exact system instructions, AttackTrace AI Pilot model registry and verification, Configuration and verification

### Community 108 - "Incident evidence delivery — 15 October 2026"
Cohesion: 0.22
Nodes (7): Incident evidence delivery — 15 October 2026, Investigation and Copilot, Measured harder tests, Next research priority, Preserved evidence, Verification, Incident evidence implementation plan

### Community 109 - "AttackTrace: proposed SOC and Twin/Graph enhancement plan"
Cohesion: 0.22
Nodes (9): AttackTrace: proposed SOC and Twin/Graph enhancement plan, Delivery notes, Delivery order and approval, Objective and boundaries, Phase 1: durable evidence and incident workflow, Phase 2: Digital Twin and Process Graph redesign, Phase 3: focused SOC screens, Phase 4: local channel and integrity attribution (+1 more)

### Community 111 - "AttackTrace implementation plan"
Cohesion: 0.25
Nodes (8): AttackTrace implementation plan, Build order, Data modes, Milestone 1 — trustworthy assistance and investigation UI, Milestone 2 — explicit evidence records and uncertainty, Milestone 3 — local communication-channel attribution, Milestone 4 — emulated firmware/configuration integrity, Milestone 5 — validation and response workflow

### Community 114 - "Presenter cheat sheet (one page)"
Cohesion: 0.29
Nodes (6): Click path (SIM), Fast facts if asked, Headline numbers (say the n, not just the %), If LIVE fails mid-demo, If Top-1 is wrong, Presenter cheat sheet (one page)

### Community 115 - "Third-party resources"
Cohesion: 0.29
Nodes (6): Backend (Python 3.11), Dataset, External services, fonts and reference data, Frontend (Node 22), HAI licence terms (re-read 2026-10-08 from https://github.com/icsdataset/hai, `README.md`), Third-party resources

### Community 116 - "Local investigation checklist"
Cohesion: 0.33
Nodes (6): Communication channel, Compare origins, Controller configuration integrity, Local investigation checklist, Response, Validation

### Community 117 - "SIM stress study — 15 October 2026"
Cohesion: 0.40
Nodes (5): Calibration decision, Findings, Next implementation priorities, Protocol, SIM stress study — 15 October 2026

### Community 118 - "Demo script (3 minutes)"
Cohesion: 0.40
Nodes (4): Before you go on stage (5 minutes ahead), Demo script (3 minutes), Fallback path, Run sheet

## Knowledge Gaps
- **11 isolated node(s):** `attacktrace`, `echarts`, `echarts-for-react`, `@types/node`, `@types/react` (+6 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 909 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **29 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `3.10 LIVE ingestion: a real industrial protocol` connect `incident.render.test.ts` to `Emulator`, `Rest`, `Plant`?**
  _High betweenness centrality (0.292) - this node is a cross-community bridge._
- **Are the 96 inferred relationships involving `Engine` (e.g. with `🧠 Layer 3: Services & Detection Engine` and `_engine()`) actually correct?**
  _`Engine` has 96 INFERRED edges - model-reasoned connections that need verification._
- **What connects `attacktrace`, `echarts`, `echarts-for-react` to the rest of the system?**
  _11 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `numpy` be split into smaller, more focused modules?**
  _Cohesion score 0.06865401987353206 - nodes in this community are weakly interconnected._
- **Are the 33 inferred relationships involving `Settings` (e.g. with `prepare_storage()` and `validate()`) actually correct?**
  _`Settings` has 33 INFERRED edges - model-reasoned connections that need verification._
- **Should `test_detect.py` be split into smaller, more focused modules?**
  _Cohesion score 0.06623376623376623 - nodes in this community are weakly interconnected._
- **Should `Settings` be split into smaller, more focused modules?**
  _Cohesion score 0.05934065934065934 - nodes in this community are weakly interconnected._