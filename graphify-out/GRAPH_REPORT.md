# Graph Report - Attacktrace  (2026-10-23)

## Corpus Check
- 396 files · ~1,131,110 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 57 file(s) not represented in the graph (top: (none) 22, .pt 12, .log 8)

## Summary
- 2937 nodes · 9252 edges · 127 communities (95 shown, 32 thin omitted)
- Extraction: 90% EXTRACTED · 10% INFERRED · 0% AMBIGUOUS · INFERRED: 920 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a996eba2`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- numpy
- Scenario
- deploy.py
- GraphView.tsx
- GraphView.tsx
- app/engine.py
- types.ts
- types.ts
- BaselineDetector
- json
- Timeline.tsx
- react
- Root.tsx
- voice.py
- CalibratingState.tsx
- ReadOnlyClient
- TopBar.tsx
- react
- test_live_runtime.py
- Rest
- graph/__init__.py
- test_hai.py
- MetricsPage.tsx
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
- RobustnessPanel.tsx
- time
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
- main.py
- json
- test_startup.py
- ._advance_incident
- ReadOnlyModbus
- hai_experiments.py
- metrics.ts
- test_copilot.py
- AttackTrace_Slides.md
- Private-server release plan — 16 October 2026
- LiveRuntime
- contextlib
- demo.py
- Screenshots
- asyncio
- process_of
- Dependencies
- live_voice.py
- model_fingerprints
- AttackSpec
- firebase.ts
- main.tsx
- Screenshots
- AI Pilot · Signal Room design plan
- Scripts
- Test
- Vercel
- Test
- test_transient_read_errors_are_retried
- pytest
- Voicecaptureprocessor
- AttackTrace AI Pilot model registry and verification
- Attacktrace
- Incident evidence delivery — 15 October 2026
- AttackTrace: proposed SOC and Twin/Graph enhancement plan
- VOICE_ASSISTANT.md
- Presenter cheat sheet (one page)
- AttackTrace
- FakeClient
- Demo script (3 minutes)
- QA_Prep.md
- time
- index.js
- python-dependency-audit.json
- RegisterOverlay
- Settings

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
- `⚡ Layer 2: API & Gateway` --references--> `create_app()`  [INFERRED]
  ARCHIFY_ARCHITECTURE_MAP.md → backend/app/main.py
- `⚡ Layer 2: API & Gateway (FastAPI + Cloudflare Workers)` --references--> `create_app()`  [INFERRED]
  README.md → backend/app/main.py
- `4. Authentication, Authorization & Security Flow` --references--> `RateLimiter`  [INFERRED]
  ARCHIFY_ARCHITECTURE_MAP.md → backend/app/api/security.py
- `3.10 LIVE ingestion: a real industrial protocol` --references--> `live()`  [INFERRED]
  submission/AttackTrace_Documentation.md → backend/app/api/ws.py
- `🧠 Layer 3: Services & Detection Engine` --references--> `Engine`  [INFERRED]
  ARCHIFY_ARCHITECTURE_MAP.md → backend/app/engine.py

## Import Cycles
- None detected.

## Communities (127 total, 32 thin omitted)

### Community 0 - "numpy"
Cohesion: 0.10
Nodes (34): static_graph(), break_ties(), causal_term(), combine_onsets(), deviation_term(), first_crossings(), localize(), onset_term() (+26 more)

### Community 1 - "Scenario"
Cohesion: 0.07
Nodes (25): GroundTruth, Scenario, attack_run(), Run, sample_attack(), simulate(), _val_runs(), analyze() (+17 more)

### Community 2 - "deploy.py"
Cohesion: 0.19
Nodes (9): check_identity(), DeploymentError, main(), prepare_storage(), validate(), configured(), test_private_entrypoint_rejects_unsigned_emulator(), test_storage_requires_mount_and_preserves_journal_and_models() (+1 more)

### Community 3 - "GraphView.tsx"
Cohesion: 0.08
Nodes (39): GraphNode, PlantNode, PlantNodeData, PlantNodeView(), PulseEdgeData, PulseEdgeT, PulseEdgeView(), StageData (+31 more)

### Community 4 - "GraphView.tsx"
Cohesion: 0.14
Nodes (28): Pump(), PumpProps, Tank(), TankProps, Valve(), ValveProps, Equipment(), Props (+20 more)

### Community 5 - "app/engine.py"
Cohesion: 0.09
Nodes (18): HaiEngine, _Open, origin_candidate(), AlertInfo, GroundTruthInfo, IsolateRequest, IsolateResponse, NodeState (+10 more)

### Community 6 - "types.ts"
Cohesion: 0.08
Nodes (41): edgeDelay(), edgeId(), layoutEdges(), MIN_LEARNED_WEIGHT, visibleEdges(), filterAssets(), FocusDirection, graphLinks() (+33 more)

### Community 7 - "types.ts"
Cohesion: 0.09
Nodes (42): useLiveSourcePoll(), WorkspaceHeader(), Access, AccessContext, useAccess(), EvidenceList(), formatCategory(), IncidentEvidencePanel() (+34 more)

### Community 8 - "BaselineDetector"
Cohesion: 0.12
Nodes (25): BaselineDetector, Loaded, engine(), emu(), free_port(), make_live(), test_attack_endpoint_writes_to_the_emulator_and_reveals_ground_truth(), test_demo_mode_off_blocks_live_attack_before_the_attacker_is_ever_called() (+17 more)

### Community 9 - "json"
Cohesion: 0.25
Nodes (14): asset_registers(), baseline_comparison(), capture(), detail(), evidence(), export(), journal(), progress() (+6 more)

### Community 10 - "Timeline.tsx"
Cohesion: 0.11
Nodes (37): App(), Center(), ViewToggle(), useFreshness(), BackendConnectionBanner(), IncidentToast(), Btn(), ReplayControls() (+29 more)

### Community 11 - "react"
Cohesion: 0.11
Nodes (30): EmptyState(), ImpactMeters(), Meter(), tone(), Details(), IncidentPanel(), PlantIntegrityGuard(), Reveal() (+22 more)

### Community 12 - "Root.tsx"
Cohesion: 0.11
Nodes (23): MetricsPage, Root(), Route(), SocPage, VoiceSettingsPage, WorkspaceLoading(), WorkspacePage, NoticeToast() (+15 more)

### Community 13 - "voice.py"
Cohesion: 0.14
Nodes (12): 4. Authentication, Authorization & Security Flow, RateLimiter, capabilities(), _interaction(), _key(), _limit(), _output_audio(), _output_text() (+4 more)

### Community 14 - "CalibratingState.tsx"
Cohesion: 0.21
Nodes (10): CalibratingState(), html(), ProgressRing(), SourcePill(), STYLE, base, html(), restartLiveCalibration() (+2 more)

### Community 15 - "ReadOnlyClient"
Cohesion: 0.07
Nodes (4): ModbusPoller, ReadOnlyClient, TagMap, SlowClient

### Community 16 - "TopBar.tsx"
Cohesion: 0.10
Nodes (30): SOURCE_NAMES, TopBar(), narrated, useLiveStream(), MODES, ModeToggle(), Props, html() (+22 more)

### Community 17 - "react"
Cohesion: 0.07
Nodes (48): CopilotAnswer(), HypothesisCard(), InlineText(), Lines(), ParsedSection, parseSections(), SECTION_ICONS, CopilotDrawer() (+40 more)

### Community 18 - "test_live_runtime.py"
Cohesion: 0.10
Nodes (23): Hub, IncidentStore, create_app(), test_gateway_secret_does_not_replace_firebase_identity(), collect(), emulator_runtime(), free_port(), live_settings() (+15 more)

### Community 19 - "Rest"
Cohesion: 0.12
Nodes (25): control_hai_replay(), _engine(), get_hai_replay(), get_incident_report(), get_incidents(), get_live_health(), get_metrics(), get_status() (+17 more)

### Community 20 - "graph/__init__.py"
Cohesion: 0.15
Nodes (8): learn_granger_edges(), learn_var_edges(), learned_graph(), merge_graph(), test_adjacency_lists_parents(), test_granger_finds_lagged_cause(), test_merge_keeps_static_and_downweights_learned(), test_static_graph_matches_pid()

### Community 21 - "test_hai.py"
Cohesion: 0.14
Nodes (20): HaiData, split_tests(), process_scores(), truth_processes(), client(), data(), hai_engine(), test_detector_metrics_on_a_known_alert_pattern() (+12 more)

### Community 22 - "MetricsPage.tsx"
Cohesion: 0.18
Nodes (15): BaselineComparison(), Report, Result, MetricsChart(), Card(), Cards(), formatUptime(), HaiCards() (+7 more)

### Community 23 - "copilot.py"
Cohesion: 0.18
Nodes (8): bounded_chat(), get_copilot_engine(), get_suggestions(), post_chat(), suggestions(), CopilotChatResponse, test_timed_out_provider_keeps_capacity_until_worker_finishes(), chat()

### Community 24 - "Write"
Cohesion: 0.10
Nodes (19): analyze(), main(), analyze(), main(), analyze(), main(), _pct(), analyze() (+11 more)

### Community 25 - "Api"
Cohesion: 0.10
Nodes (16): topology_of(), Runtime, AttackResponse, LiveMessage, Topology, client(), test_attack_validation(), test_incidents_and_reset() (+8 more)

### Community 26 - "Socstore"
Cohesion: 0.06
Nodes (36): GatewayBoundary, digest(), loaded_context(), runtime_context(), SocStore, headers(), login(), secured() (+28 more)

### Community 27 - "eval/hai.py"
Cohesion: 0.14
Nodes (16): alert_mask(), rising_edges(), sustained(), HaiLoaded, baseline_rank_nodes(), evaluate_detector(), evaluate_localization(), _first_alert() (+8 more)

### Community 28 - "Grounding"
Cohesion: 0.14
Nodes (24): _build_context_summary(), CopilotEngine, _get_gemini_key(), incident_evidence_summary(), local_checks(), _offline_expert_reply(), CopilotChatRequest, CopilotTurn (+16 more)

### Community 29 - "Robustness"
Cohesion: 0.09
Nodes (20): Overlay, Impact, PlantParams, NodeSpec, assess_calibration(), Case, evaluate_case(), fit_calibration() (+12 more)

### Community 30 - "gateway/package.json"
Cohesion: 0.08
Nodes (20): devDependencies, miniflare, engines, node, name, overrides, sharp, undici (+12 more)

### Community 31 - "hai_fixture.py"
Cohesion: 0.23
Nodes (5): hai_dir(), hai_models(), make_dataset(), _signals(), _write()

### Community 32 - "PlantEmulator"
Cohesion: 0.10
Nodes (8): LabProxy, evaluate(), port(), test_manifest_changes_real_emulator_controller_and_invalid_file_is_reported(), test_proxy_real_modbus_pairing_and_rejects_writes(), load(), PlantEmulator, TruthEvent

### Community 33 - "data/hai.py"
Cohesion: 0.19
Nodes (6): hai_paths(), HaiFile, load_hai(), load_hai_replay(), _read(), _read_csv()

### Community 34 - "verify_ai_models.py"
Cohesion: 0.24
Nodes (7): gemini_key(), _audio(), _interaction(), _live_check(), _result(), _speech_body(), verify()

### Community 35 - "RobustnessPanel.tsx"
Cohesion: 0.25
Nodes (14): percent(), ReliabilityTable(), RobustnessPanel(), score(), seconds(), finite(), nullable(), numbers() (+6 more)

### Community 37 - "time"
Cohesion: 0.18
Nodes (5): classify_failure(), _retry_after(), _status_code(), live(), run_loop()

### Community 38 - "pipeline.py"
Cohesion: 0.07
Nodes (28): aggregate(), best_threshold(), fit_err_sd(), ForecastDetector, residuals(), build_model(), GDN, make_windows() (+20 more)

### Community 39 - "test_report.py"
Cohesion: 0.08
Nodes (23): worst_impact(), _eta(), render_report(), para(), _utc(), ascii_text(), _escape(), Page (+15 more)

### Community 40 - "Authentication"
Cohesion: 0.17
Nodes (15): check_origin(), config(), firebase_app(), identity(), logout(), me(), names(), protect() (+7 more)

### Community 41 - "app/engine.py"
Cohesion: 0.09
Nodes (17): action_for(), explain(), Explanation, signature(), build_incident(), Incident, Candidate, _cost() (+9 more)

### Community 42 - "RateLimiter"
Cohesion: 0.20
Nodes (9): 1. Five-Layer Architecture Map, 2. Layer-by-Layer Breakdown & Source Evidence, 3. End-to-End User Workflows, AttackTrace: Full Interactive Architecture Map, 🌐 Interactive Visualization Artifacts, 🎨 Layer 1: Frontend, ⚡ Layer 2: API & Gateway, 💾 Layer 4: Storage & Data Persistence (+1 more)

### Community 43 - "lab.py"
Cohesion: 0.17
Nodes (15): configure(), emulator_info(), exclusive(), integrity(), ManifestChange, observe_integrity(), probe(), proxy() (+7 more)

### Community 44 - "argparse"
Cohesion: 0.19
Nodes (8): anonymous_stream_denied(), main(), NoRedirect, origin(), public_streams_available(), read(), require(), main()

### Community 45 - "app/config.py"
Cohesion: 0.08
Nodes (35): _from_env(), get_settings(), load_baseline(), load_detector(), load_graph(), Weights, Row, rows() (+27 more)

### Community 46 - "Package"
Cohesion: 0.09
Nodes (22): name, overrides, @grpc/grpc-js, private, type, version, autoprefixer, echarts (+14 more)

### Community 47 - "classify_language"
Cohesion: 0.13
Nodes (15): classify_language(), detect_unsupported_script(), has_tamil_characters(), is_self_echo(), LanguageClassification, sanitize_response_text(), tokenize_words(), gemini_to_browser() (+7 more)

### Community 48 - "live_soak.py"
Cohesion: 0.11
Nodes (19): LiveEngine, live_dir(), live_models_ready(), build_engine(), check_emulator_down(), check_out_of_range(), check_slow_network(), _free_port() (+11 more)

### Community 49 - "types.ts"
Cohesion: 0.11
Nodes (28): Panel(), PanelProps, AttackConsole(), HaiReplayPanel(), offset(), MagnitudeField(), Props, NodeScores() (+20 more)

### Community 50 - "Engine"
Cohesion: 0.10
Nodes (29): Engine, _has_hazard(), AttackRequest, _rank(), run_sim_trial(), _open_incident(), run(), test_attack_produces_localized_incident() (+21 more)

### Community 51 - "test_emulator.py"
Cohesion: 0.12
Nodes (24): TagMapError, free_port(), client_for(), emu(), free_port(), mutate(), raw_map(), read_values() (+16 more)

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
Cohesion: 0.10
Nodes (20): build_report(), main(), pair_key(), _pick_primary_backup(), run_live(), run_sim(), _summarize_pair(), TrialResult (+12 more)

### Community 58 - "models.py"
Cohesion: 0.24
Nodes (8): Failure, ModelRouter, test_live_greeting_states_only_observed_status(), test_model_pool_rejects_cross_modality(), test_preferred_model_fails_over_after_rate_limit(), test_quota_and_unsupported_are_retryable_but_auth_and_safety_are_not(), test_repeated_rate_limits_back_off_without_crossing_capability_pools(), test_retry_after_is_respected()

### Community 59 - "test_live_connectors.py"
Cohesion: 0.06
Nodes (32): Aligner, Sample, excluded_from_ranking(), QualityTracker, TagSpec, _Track, LiveSource, _pct() (+24 more)

### Community 60 - "Compileroptions"
Cohesion: 0.11
Nodes (17): compilerOptions, isolatedModules, jsx, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch (+9 more)

### Community 61 - "main.py"
Cohesion: 0.21
Nodes (9): hai_models_ready(), load_hai_baseline(), load_hai_detector(), build_hai_engine(), test_speed_is_clamped_to_the_supported_range(), speed(), test_trained_models_round_trip(), Actual held-out results from this installation (+1 more)

### Community 62 - "json"
Cohesion: 0.22
Nodes (5): get_json(), main(), main(), one_run(), post()

### Community 63 - "test_startup.py"
Cohesion: 0.28
Nodes (6): ensure_metrics(), test_a_failing_metrics_step_never_stops_startup(), test_existing_metrics_are_never_overwritten(), test_first_start_writes_metrics_once(), fake(), test_metrics_missing_the_hai_section_are_refreshed_once_data_appears()

### Community 65 - "ReadOnlyModbus"
Cohesion: 0.16
Nodes (5): bounded(), ReadError, ReadOnlyModbus, slow_factory(), test_a_silent_server_times_out_instead_of_hanging()

### Community 66 - "hai_experiments.py"
Cohesion: 0.27
Nodes (4): best_f1(), main(), score(), smooth()

### Community 67 - "metrics.ts"
Cohesion: 0.17
Nodes (21): chartOption(), getChartColors(), AmbiguityMetrics, BarRow, detector(), DetectorMetrics, haiDetector(), HaiDetectorMetrics (+13 more)

### Community 68 - "test_copilot.py"
Cohesion: 0.31
Nodes (6): client(), test_copilot_chat(), test_copilot_suggestions(), test_no_active_incident_has_no_action(), test_unknown_requested_incident_returns_404(), test_virtual_sensor_isolation()

### Community 69 - "AttackTrace_Slides.md"
Cohesion: 0.15
Nodes (12): Approach, Architecture, AttackTrace, Detect → Locate → Contain, Limitations, Live demo, Results: real HAI data, Results: real protocol (LIVE) (+4 more)

### Community 70 - "Private-server release plan — 16 October 2026"
Cohesion: 0.06
Nodes (28): Copilot polish and private-server foundation — 16 October 2026, Implemented, Validation and current limits, Activate the selected ADC method, Credentials and access, Deployment and verification still required, Firebase private-server setup — 16 October 2026, What the implementation enforces (+20 more)

### Community 72 - "LiveRuntime"
Cohesion: 0.06
Nodes (9): 🧠 Layer 3: Services & Detection Engine, LiveAttackLauncher, LiveRuntime, LiveRecorder, CalibrationInfo, test_attack_refused_while_live_is_calibrating(), test_calibrating_has_progress_no_alerts_and_then_runs(), test_training_failure_preserves_data_and_requires_explicit_retry() (+1 more)

### Community 73 - "contextlib"
Cohesion: 0.31
Nodes (3): test_backup_includes_committed_wal_and_closes_output(), test_backup_refuses_to_replace_existing_data(), backup()

### Community 74 - "demo.py"
Cohesion: 0.39
Nodes (4): click_path(), main(), post(), wait_healthy()

### Community 75 - "Screenshots"
Cohesion: 0.27
Nodes (10): ambiguousShot(), { chromium }, errors, haiIncident(), log, require, shot(), simViews() (+2 more)

### Community 76 - "asyncio"
Cohesion: 0.08
Nodes (12): assess_layers(), evidence_priority(), alter_response(), frame(), decode(), encode(), Tag, test_encoding_round_trips() (+4 more)

### Community 77 - "process_of"
Cohesion: 0.29
Nodes (3): node_kind(), process_of(), test_tag_naming_heuristics()

### Community 78 - "Dependencies"
Cohesion: 0.17
Nodes (12): dependencies, echarts, echarts-for-react, firebase, @fontsource/inter, @fontsource/jetbrains-mono, framer-motion, lucide-react (+4 more)

### Community 79 - "live_voice.py"
Cohesion: 0.14
Nodes (9): connect_model(), live_voice(), browser_to_gemini(), opening_prompt(), process_snapshot(), session_config(), test_live_extended_thinking_has_required_configuration(), test_voice_session_config_enforces_en_ta_transcription() (+1 more)

### Community 82 - "AttackSpec"
Cohesion: 0.07
Nodes (35): _Active, AttackEngine, AttackSpec, _fmt_eta(), main(), NoOverlay, PID, _clip() (+27 more)

### Community 84 - "main.tsx"
Cohesion: 0.40
Nodes (3): root, @fontsource/inter, @fontsource/jetbrains-mono

### Community 85 - "Screenshots"
Cohesion: 0.31
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
Cohesion: 0.07
Nodes (35): allowed_hosts(), AllowlistError, check_host(), is_loopback(), main(), parse_args(), run(), AttackerClient (+27 more)

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

### Community 117 - "FakeClient"
Cohesion: 0.25
Nodes (8): load_tagmap(), FakeClient, poller(), test_a_partial_read_failure_keeps_the_other_tags(), test_backoff_grows_is_capped_and_resets(), test_reads_are_batched_by_contiguous_block(), test_requests_in_flight_are_bounded(), test_the_connection_is_dropped_and_retried_after_total_failure()

### Community 118 - "Demo script (3 minutes)"
Cohesion: 0.40
Nodes (4): Before you go on stage (5 minutes ahead), Demo script (3 minutes), Fallback path, Run sheet

### Community 125 - "time"
Cohesion: 0.47
Nodes (8): check(), check_backend_health(), check_console_errors(), check_emulator(), check_frontend_loads(), check_key_configured(), check_ws_rate(), main()

### Community 127 - "index.js"
Cohesion: 0.70
Nodes (4): error(), fetch(), handle(), origin()

### Community 137 - "Settings"
Cohesion: 0.10
Nodes (19): Settings, read_checkpoint(), source_fingerprint(), write_checkpoint(), LiveConfig, LiveConfigError, load_live(), build_live_runtime() (+11 more)

## Knowledge Gaps
- **11 isolated node(s):** `attacktrace`, `echarts`, `echarts-for-react`, `@types/node`, `@types/react` (+6 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 934 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **32 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `3.10 LIVE ingestion: a real industrial protocol` connect `incident.render.test.ts` to `AttackSpec`, `test_emulator.py`, `time`?**
  _High betweenness centrality (0.315) - this node is a cross-community bridge._
- **Are the 97 inferred relationships involving `Engine` (e.g. with `🧠 Layer 3: Services & Detection Engine` and `_engine()`) actually correct?**
  _`Engine` has 97 INFERRED edges - model-reasoned connections that need verification._
- **What connects `attacktrace`, `echarts`, `echarts-for-react` to the rest of the system?**
  _11 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `numpy` be split into smaller, more focused modules?**
  _Cohesion score 0.09739866908650938 - nodes in this community are weakly interconnected._
- **Are the 33 inferred relationships involving `Settings` (e.g. with `prepare_storage()` and `validate()`) actually correct?**
  _`Settings` has 33 INFERRED edges - model-reasoned connections that need verification._
- **Should `Scenario` be split into smaller, more focused modules?**
  _Cohesion score 0.07033315705975675 - nodes in this community are weakly interconnected._
- **Are the 24 inferred relationships involving `LiveRuntime` (e.g. with `🧠 Layer 3: Services & Detection Engine` and `post_chat()`) actually correct?**
  _`LiveRuntime` has 24 INFERRED edges - model-reasoned connections that need verification._