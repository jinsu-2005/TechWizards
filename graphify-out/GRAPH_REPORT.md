# Graph Report - Attacktrace  (2026-10-23)

## Corpus Check
- 392 files · ~1,013,380 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 59 file(s) not represented in the graph (top: (none) 22, .pt 12, .log 8)

## Summary
- 2895 nodes · 9137 edges · 127 communities (95 shown, 32 thin omitted)
- Extraction: 90% EXTRACTED · 10% INFERRED · 0% AMBIGUOUS · INFERRED: 919 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `29e8149d`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- localize
- simulate
- Actual held-out results from this installation
- Incident
- GraphView.tsx
- app/engine.py
- AttackSpec
- api.ts
- test_live_runtime.py
- deploy.py
- Timeline.tsx
- useLive
- WorkspacePage.tsx
- test_emulator.py
- TopBar.tsx
- TagMap
- live.ts
- CopilotDrawer.tsx
- test_authentication.py
- Rest
- test_hai.py
- HaiEngine
- static_graph
- Write
- Api
- Socstore
- eval/hai.py
- Grounding
- Robustness
- gateway/package.json
- hai_fixture.py
- PlantEmulator
- test_ties.py
- LiveConfigError
- data/hai.py
- templates.py
- time
- Report
- Authentication
- reconstruct
- RateLimiter
- lab.py
- Investigation
- Settings
- Package
- MetricsPage.tsx
- live_soak.py
- types.ts
- test_isolate.py
- test_live_connectors.py
- Security
- AttackTrace UI and navigation repair — 16 October 2026
- LIVE calibration fix and next implementation plan
- Devdependencies
- incident.render.test.ts
- preflight.py
- voice.py
- Aligner
- Compileroptions
- Candidate
- IncidentStore
- test_gateway.py
- Impact
- demo.py
- load_graph
- metrics.ts
- rehearsal.py
- AttackTrace_Slides.md
- Private-server release plan — 16 October 2026
- LiveRuntime
- test_copilot.py
- demo_trials.py
- Screenshots
- TagMap
- 🔍 Layer-by-Layer Component Breakdown
- Dependencies
- hai_models
- layout.test.ts
- load_detector
- CopilotAnswer.tsx
- firebase.ts
- Screenshots
- AI Pilot · Signal Room design plan
- Scripts
- Package
- Test
- Vercel
- Test
- RegisterOverlay
- Engine
- pytest
- Voicecaptureprocessor
- AttackTrace AI Pilot model registry and verification
- Attacktrace
- Incident evidence delivery — 15 October 2026
- AttackTrace: proposed SOC and Twin/Graph enhancement plan
- RobustnessPanel.tsx
- VOICE_ASSISTANT.md
- Presenter cheat sheet (one page)
- AttackTrace
- Demo script (3 minutes)
- QA_Prep.md
- argparse
- index.js
- python-dependency-audit.json
- ._advance_incident
- schemas.py

## God Nodes (most connected - your core abstractions)
1. `Engine` - 142 edges
2. `Settings` - 107 edges
3. `LiveRuntime` - 70 edges
4. `BaselineDetector` - 63 edges
5. `create_app()` - 61 edges
6. `Scenario` - 59 edges
7. `LiveSource` - 59 edges
8. `useLive` - 57 edges
9. `PlantEmulator` - 56 edges
10. `load_live()` - 54 edges

## Surprising Connections (you probably didn't know these)
- `4. Authentication, Authorization & Security Flow` --references--> `RateLimiter`  [INFERRED]
  ARCHIFY_ARCHITECTURE_MAP.md → backend/app/api/security.py
- `⚡ Layer 2: API & Gateway` --references--> `create_app()`  [INFERRED]
  ARCHIFY_ARCHITECTURE_MAP.md → backend/app/main.py
- `⚡ Layer 2: API & Gateway (FastAPI + Cloudflare Workers)` --references--> `create_app()`  [INFERRED]
  README.md → backend/app/main.py
- `Actual held-out results from this installation` --references--> `speed()`  [INFERRED]
  docs/HAI_REPLAY.md → backend/tests/test_hai.py
- `3.10 LIVE ingestion: a real industrial protocol` --references--> `live()`  [INFERRED]
  submission/AttackTrace_Documentation.md → backend/app/api/ws.py

## Import Cycles
- None detected.

## Communities (127 total, 32 thin omitted)

### Community 0 - "localize"
Cohesion: 0.14
Nodes (15): break_ties(), causal_term(), combine_onsets(), deviation_term(), first_crossings(), localize(), onset_term(), softmax() (+7 more)

### Community 1 - "simulate"
Cohesion: 0.14
Nodes (15): simulate(), analyze(), _inference_timing(), main(), _model_stats(), _pct(), _peak_rss_over_simulated_run(), _spec() (+7 more)

### Community 3 - "Incident"
Cohesion: 0.12
Nodes (27): edgeDelay(), edgeId(), layoutEdges(), MIN_LEARNED_WEIGHT, visibleEdges(), filterAssets(), FocusDirection, graphLinks() (+19 more)

### Community 4 - "GraphView.tsx"
Cohesion: 0.06
Nodes (60): GraphNode, PlantNode, PlantNodeData, PlantNodeView(), PulseEdgeData, PulseEdgeT, PulseEdgeView(), StageData (+52 more)

### Community 5 - "app/engine.py"
Cohesion: 0.11
Nodes (8): GroundTruth, Scenario, NodeSpec, NodeType, Counts, evaluate(), _onsets(), run_detection()

### Community 6 - "AttackSpec"
Cohesion: 0.05
Nodes (39): _Active, AttackEngine, AttackSpec, _fmt_eta(), main(), NoOverlay, Overlay, PID (+31 more)

### Community 7 - "api.ts"
Cohesion: 0.07
Nodes (52): useLiveSourcePoll(), Access, AccessContext, useAccess(), Message, EvidenceList(), formatCategory(), IncidentEvidencePanel() (+44 more)

### Community 8 - "test_live_runtime.py"
Cohesion: 0.08
Nodes (21): Loaded, LiveEngine, Snapshot, SourceNotReadyError, LiveRecorder, make_live(), test_live_is_read_only_toward_the_plant(), test_live_messages_have_the_same_schema_as_sim() (+13 more)

### Community 9 - "deploy.py"
Cohesion: 0.18
Nodes (9): check_identity(), DeploymentError, main(), prepare_storage(), validate(), configured(), test_private_entrypoint_rejects_unsigned_emulator(), test_storage_requires_mount_and_preserves_journal_and_models() (+1 more)

### Community 10 - "Timeline.tsx"
Cohesion: 0.13
Nodes (28): Btn(), ReplayControls(), Props, Sparkline(), pctX(), Timeline(), usePlayback(), clampIndex() (+20 more)

### Community 11 - "useLive"
Cohesion: 0.11
Nodes (44): App(), Center(), ViewToggle(), useFreshness(), BackendConnectionBanner(), EmptyState(), IncidentToast(), Panel() (+36 more)

### Community 12 - "WorkspacePage.tsx"
Cohesion: 0.09
Nodes (28): MetricsPage, Root(), Route(), SocPage, VoiceSettingsPage, WorkspaceLoading(), WorkspacePage, NoticeToast() (+20 more)

### Community 13 - "test_emulator.py"
Cohesion: 0.12
Nodes (24): TagMapError, free_port(), client_for(), emu(), free_port(), mutate(), raw_map(), read_values() (+16 more)

### Community 14 - "TopBar.tsx"
Cohesion: 0.10
Nodes (21): SOURCE_NAMES, TopBar(), CalibratingState(), html(), MODES, ModeToggle(), Props, html() (+13 more)

### Community 15 - "TagMap"
Cohesion: 0.08
Nodes (4): ModbusPoller, ReadOnlyClient, slow_factory(), SlowClient

### Community 16 - "live.ts"
Cohesion: 0.14
Nodes (21): narrated, useLiveStream(), STYLE, getAudioContext(), playContainmentChime(), playIncidentAlarm(), latencyMs(), PILL_LABEL (+13 more)

### Community 17 - "CopilotDrawer.tsx"
Cohesion: 0.09
Nodes (38): CopilotDrawer(), makeWelcome(), SOURCE_LABELS, groupTranscript(), Line, LiveVoicePanel(), pcm16(), playPcm() (+30 more)

### Community 18 - "test_authentication.py"
Cohesion: 0.22
Nodes (10): headers(), login(), secured(), test_analyst_decisions_record_verified_actor(), test_login_cookie_membership_and_csrf(), test_logout_invalidates_copied_cookie_and_stream(), test_missing_server_credentials_fail_closed(), test_repeated_signins_have_distinct_server_sessions() (+2 more)

### Community 19 - "Rest"
Cohesion: 0.10
Nodes (24): control_hai_replay(), _engine(), get_hai_replay(), get_incident_report(), get_incidents(), get_live_health(), get_metrics(), get_status() (+16 more)

### Community 21 - "test_hai.py"
Cohesion: 0.14
Nodes (22): HaiData, hai_models_ready(), load_hai_baseline(), load_hai_detector(), split_tests(), client(), data(), hai_engine() (+14 more)

### Community 22 - "HaiEngine"
Cohesion: 0.12
Nodes (9): HaiEngine, origin_candidate(), AlertInfo, OriginCandidate, test_dataset_attack_becomes_an_incident_without_invented_labels(), test_replay_starts_before_the_first_attack_and_follows_the_speed(), test_reset_restarts_the_replay_and_the_replay_loops(), test_suspect_needs_both_a_high_score_and_a_departure_from_the_nodes_own_normal() (+1 more)

### Community 23 - "static_graph"
Cohesion: 0.23
Nodes (11): static_graph(), test_static_graph_matches_pid(), synthetic_chain(), test_breakdown_does_not_change_the_ranking(), test_breakdown_sums_to_the_candidates_own_score(), test_build_incident_end_to_end(), test_causal_term_favours_upstream(), test_finds_true_origin_on_synthetic_chain() (+3 more)

### Community 24 - "Write"
Cohesion: 0.07
Nodes (29): _from_env(), get_settings(), analyze(), main(), analyze(), main(), analyze(), main() (+21 more)

### Community 25 - "Api"
Cohesion: 0.19
Nodes (11): client(), test_attack_validation(), test_incidents_and_reset(), test_live_loop_survives_a_failing_tick(), test_metrics(), test_metrics_merges_live_metrics_without_touching_the_file(), test_status_and_mode(), test_topology() (+3 more)

### Community 26 - "Socstore"
Cohesion: 0.15
Nodes (23): digest(), loaded_context(), runtime_context(), LiveMessage, NodeState, SocStore, message(), test_api_export_and_archived_copilot_use_original_capture() (+15 more)

### Community 27 - "eval/hai.py"
Cohesion: 0.13
Nodes (17): HaiFile, process_of(), HaiLoaded, baseline_rank_nodes(), evaluate_detector(), evaluate_localization(), _first_alert(), _prf() (+9 more)

### Community 28 - "Grounding"
Cohesion: 0.09
Nodes (31): bounded_chat(), get_copilot_engine(), get_suggestions(), post_chat(), _build_context_summary(), CopilotEngine, _get_gemini_key(), incident_evidence_summary() (+23 more)

### Community 29 - "Robustness"
Cohesion: 0.18
Nodes (15): model_fingerprints(), assess_calibration(), fit_calibration(), probability(), reliability(), run(), summarize(), varied() (+7 more)

### Community 30 - "gateway/package.json"
Cohesion: 0.08
Nodes (20): devDependencies, miniflare, engines, node, name, overrides, sharp, undici (+12 more)

### Community 31 - "hai_fixture.py"
Cohesion: 0.23
Nodes (5): make_dataset(), _signals(), _write(), get_json(), main()

### Community 32 - "PlantEmulator"
Cohesion: 0.09
Nodes (15): LabProxy, evaluate(), emu(), free_port(), test_attack_endpoint_writes_to_the_emulator_and_reveals_ground_truth(), test_attack_refused_while_live_is_calibrating(), test_demo_mode_off_blocks_live_attack_before_the_attacker_is_ever_called(), port() (+7 more)

### Community 33 - "test_ties.py"
Cohesion: 0.27
Nodes (8): test_actuator_beats_the_process_sensors_it_drives(), test_clearly_weaker_node_is_not_pulled_into_the_tie(), test_node_already_elevated_when_window_opens_is_not_a_cause(), test_sensor_wins_tie_with_its_plc_even_when_plc_scores_higher(), test_strictly_earlier_onset_beats_signal_order(), test_tie_rule_keeps_confidence_monotonic(), top(), window()

### Community 34 - "LiveConfigError"
Cohesion: 0.25
Nodes (3): LiveConfigError, test_bad_config_fails_fast_with_a_clear_message(), test_missing_or_broken_tagmap_is_a_config_error()

### Community 35 - "data/hai.py"
Cohesion: 0.18
Nodes (7): hai_paths(), load_hai(), node_kind(), _read(), _read_csv(), build_hai_engine(), test_tag_naming_heuristics()

### Community 37 - "templates.py"
Cohesion: 0.31
Nodes (5): action_for(), explain(), Explanation, signature(), test_explanation_templates()

### Community 38 - "time"
Cohesion: 0.07
Nodes (34): BaselineDetector, aggregate(), alert_mask(), best_threshold(), fit_err_sd(), ForecastDetector, residuals(), sustained() (+26 more)

### Community 39 - "Report"
Cohesion: 0.10
Nodes (17): _eta(), render_report(), para(), _utc(), ascii_text(), _escape(), Page, text_width() (+9 more)

### Community 40 - "Authentication"
Cohesion: 0.08
Nodes (23): check_origin(), config(), firebase_app(), identity(), logout(), me(), names(), protect() (+15 more)

### Community 41 - "reconstruct"
Cohesion: 0.18
Nodes (7): _cost(), hop_distance(), PathNode, Propagation, reconstruct(), _shortest(), test_path_orders_same_sample_onsets_cause_first()

### Community 42 - "RateLimiter"
Cohesion: 0.17
Nodes (11): 1. Five-Layer Architecture Map, 2. Layer-by-Layer Breakdown & Source Evidence, 3. End-to-End User Workflows, 4. Authentication, Authorization & Security Flow, AttackTrace: Full Interactive Architecture Map, 🌐 Interactive Visualization Artifacts, 🎨 Layer 1: Frontend, ⚡ Layer 2: API & Gateway (+3 more)

### Community 43 - "lab.py"
Cohesion: 0.14
Nodes (14): configure(), emulator_info(), exclusive(), integrity(), ManifestChange, observe_integrity(), probe(), proxy() (+6 more)

### Community 44 - "Investigation"
Cohesion: 0.25
Nodes (14): asset_registers(), baseline_comparison(), capture(), detail(), evidence(), export(), journal(), progress() (+6 more)

### Community 45 - "Settings"
Cohesion: 0.11
Nodes (14): Settings, _Open, build_live_runtime(), build_engine(), lifespan(), ensure_metrics(), safe_ensure_metrics(), test_calibration_does_not_accept_subminimum_or_infinite_recordings() (+6 more)

### Community 46 - "Package"
Cohesion: 0.08
Nodes (26): name, overrides, @grpc/grpc-js, private, type, version, root, autoprefixer (+18 more)

### Community 47 - "MetricsPage.tsx"
Cohesion: 0.19
Nodes (14): BaselineComparison(), Report, Result, MetricsChart(), Card(), Cards(), formatUptime(), HaiCards() (+6 more)

### Community 48 - "live_soak.py"
Cohesion: 0.07
Nodes (34): load_baseline(), live_dir(), live_models_ready(), main(), evaluate(), AttackResult, build_state(), _false_alarm_per_hour() (+26 more)

### Community 49 - "types.ts"
Cohesion: 0.12
Nodes (20): Props, ImpactMeters(), Meter(), tone(), etaUrgency(), formatEta(), parsePilotAction(), PilotAction (+12 more)

### Community 50 - "test_isolate.py"
Cohesion: 0.13
Nodes (17): _impact_with_vs_without(), Arm, _isolate(), run_isolation(), _summary(), client(), opened(), step_until() (+9 more)

### Community 51 - "test_live_connectors.py"
Cohesion: 0.07
Nodes (30): ReadError, excluded_from_ranking(), _pct(), SourceStatus, load_tagmap(), record(), FakeClient, free_port() (+22 more)

### Community 52 - "Security"
Cohesion: 0.11
Nodes (23): RateLimiter, create_app(), test_sim_and_hai_attack_paths_are_unaffected(), test_a_source_that_goes_away_shows_down_not_a_crash(), test_calibration_restart_is_authenticated_and_refuses_an_active_trainer(), test_live_is_unavailable_without_a_source_and_never_crashes(), test_switching_to_live_serves_quality_health_and_stays_read_only(), test_voice_rejects_wrong_demo_key_before_gemini() (+15 more)

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

### Community 57 - "preflight.py"
Cohesion: 0.47
Nodes (8): check(), check_backend_health(), check_console_errors(), check_emulator(), check_frontend_loads(), check_key_configured(), check_ws_rate(), main()

### Community 58 - "voice.py"
Cohesion: 0.06
Nodes (31): classify_failure(), Failure, ModelRouter, _retry_after(), _status_code(), gemini_key(), connect_model(), opening_prompt() (+23 more)

### Community 59 - "Aligner"
Cohesion: 0.11
Nodes (7): Aligner, Sample, QualityTracker, _Track, TagHealth, test_aligner_holds_the_last_value_until_max_age(), test_out_of_order_samples_are_dropped_and_counted()

### Community 60 - "Compileroptions"
Cohesion: 0.11
Nodes (17): compilerOptions, isolatedModules, jsx, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch (+9 more)

### Community 61 - "Candidate"
Cohesion: 0.32
Nodes (4): is_ambiguous(), Candidate, test_gate_flags_close_top_two_and_never_reorders(), cand()

### Community 63 - "test_gateway.py"
Cohesion: 0.11
Nodes (6): GatewayBoundary, gateway_app(), test_direct_origin_denied_even_for_auth_config_and_docs(), test_gateway_secret_does_not_replace_firebase_identity(), test_local_mode_is_unchanged_without_an_origin_secret(), test_stream_requires_gateway_secret_before_upgrade()

### Community 64 - "Impact"
Cohesion: 0.25
Nodes (4): _has_hazard(), worst_impact(), Impact, test_impact_snapshot_keeps_the_worst_values()

### Community 65 - "demo.py"
Cohesion: 0.39
Nodes (4): click_path(), main(), post(), wait_healthy()

### Community 66 - "load_graph"
Cohesion: 0.19
Nodes (6): learn_granger_edges(), learn_var_edges(), merge_graph(), test_adjacency_lists_parents(), test_granger_finds_lagged_cause(), test_merge_keeps_static_and_downweights_learned()

### Community 67 - "metrics.ts"
Cohesion: 0.17
Nodes (21): chartOption(), getChartColors(), AmbiguityMetrics, BarRow, detector(), DetectorMetrics, haiDetector(), HaiDetectorMetrics (+13 more)

### Community 68 - "rehearsal.py"
Cohesion: 0.43
Nodes (3): main(), one_run(), post()

### Community 69 - "AttackTrace_Slides.md"
Cohesion: 0.15
Nodes (12): Approach, Architecture, AttackTrace, Detect → Locate → Contain, Limitations, Live demo, Results: real HAI data, Results: real protocol (LIVE) (+4 more)

### Community 70 - "Private-server release plan — 16 October 2026"
Cohesion: 0.06
Nodes (28): Copilot polish and private-server foundation — 16 October 2026, Implemented, Validation and current limits, Activate the selected ADC method, Credentials and access, Deployment and verification still required, Firebase private-server setup — 16 October 2026, What the implementation enforces (+20 more)

### Community 72 - "LiveRuntime"
Cohesion: 0.08
Nodes (21): write_checkpoint(), load_live(), LiveRuntime, LiveSource, make_live(), test_bad_checkpoint_is_rejected(), test_checkpoint_write_failure_keeps_previous_file(), test_restart_resumes_rows_and_marks_a_gap() (+13 more)

### Community 73 - "test_copilot.py"
Cohesion: 0.31
Nodes (6): client(), test_copilot_chat(), test_copilot_suggestions(), test_no_active_incident_has_no_action(), test_unknown_requested_incident_returns_404(), test_virtual_sensor_isolation()

### Community 74 - "demo_trials.py"
Cohesion: 0.31
Nodes (9): build_report(), main(), pair_key(), _pick_primary_backup(), run_live(), run_sim(), _summarize_pair(), TrialResult (+1 more)

### Community 75 - "Screenshots"
Cohesion: 0.35
Nodes (10): ambiguousShot(), { chromium }, errors, haiIncident(), log, require, shot(), simViews() (+2 more)

### Community 76 - "TagMap"
Cohesion: 0.06
Nodes (17): assess_layers(), evidence_priority(), read_checkpoint(), source_fingerprint(), LiveConfig, alter_response(), frame(), TagSpec (+9 more)

### Community 77 - "🔍 Layer-by-Layer Component Breakdown"
Cohesion: 0.33
Nodes (6): 🎨 Layer 1: Frontend (React 19 + TypeScript + Vite), ⚡ Layer 2: API & Gateway (FastAPI + Cloudflare Workers), 🧠 Layer 3: Services & Core Detection Engine, 💾 Layer 4: Storage & Data Persistence, 🏭 Layer 5: External Protocol & Hardware, 🔍 Layer-by-Layer Component Breakdown

### Community 78 - "Dependencies"
Cohesion: 0.17
Nodes (12): dependencies, echarts, echarts-for-react, firebase, @fontsource/inter, @fontsource/jetbrains-mono, framer-motion, lucide-react (+4 more)

### Community 80 - "layout.test.ts"
Cohesion: 0.27
Nodes (8): groupLayout(), layerLayout(), LayoutEdge, Pos, processOf(), edges, IDS, PID

### Community 81 - "load_detector"
Cohesion: 0.08
Nodes (31): attack_run(), Run, sample_attack(), rising_edges(), load_detector(), _val_runs(), learned_graph(), load_graph() (+23 more)

### Community 82 - "CopilotAnswer.tsx"
Cohesion: 0.39
Nodes (7): CopilotAnswer(), HypothesisCard(), InlineText(), Lines(), ParsedSection, parseSections(), SECTION_ICONS

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

### Community 93 - "Engine"
Cohesion: 0.13
Nodes (17): Engine, AttackRequest, _rank(), run_sim_trial(), _open_incident(), run(), test_attack_produces_localized_incident(), test_clean_run_raises_no_incident() (+9 more)

### Community 94 - "pytest"
Cohesion: 0.06
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

### Community 112 - "RobustnessPanel.tsx"
Cohesion: 0.25
Nodes (14): percent(), ReliabilityTable(), RobustnessPanel(), score(), seconds(), finite(), nullable(), numbers() (+6 more)

### Community 114 - "Presenter cheat sheet (one page)"
Cohesion: 0.29
Nodes (6): Click path (SIM), Fast facts if asked, Headline numbers (say the n, not just the %), If LIVE fails mid-demo, If Top-1 is wrong, Presenter cheat sheet (one page)

### Community 115 - "AttackTrace"
Cohesion: 0.10
Nodes (19): 🏛 5-Layer System Architecture (Graphify Mapped), AttackTrace, 📊 Benchmark & Evaluation Results, 🔄 End-to-End Incident Lifecycle, 🗺 Graphify Codebase Navigation, 🎮 Interactive Live Demo Script, 📄 License & Attribution, 🌐 Live Deployments (+11 more)

### Community 118 - "Demo script (3 minutes)"
Cohesion: 0.40
Nodes (4): Before you go on stage (5 minutes ahead), Demo script (3 minutes), Fallback path, Run sheet

### Community 125 - "argparse"
Cohesion: 0.20
Nodes (7): anonymous_stream_denied(), main(), NoRedirect, origin(), read(), require(), main()

### Community 127 - "index.js"
Cohesion: 0.70
Nodes (4): error(), fetch(), handle(), origin()

### Community 137 - "schemas.py"
Cohesion: 0.11
Nodes (15): topology_of(), Runtime, AttackResponse, CalibrationInfo, CopilotChatRequest, IsolateRequest, IsolateResponse, ModeRequest (+7 more)

## Knowledge Gaps
- **11 isolated node(s):** `attacktrace`, `echarts`, `echarts-for-react`, `@types/node`, `@types/react` (+6 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 920 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **32 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `3.10 LIVE ingestion: a real industrial protocol` connect `incident.render.test.ts` to `Rest`, `test_emulator.py`, `AttackSpec`?**
  _High betweenness centrality (0.292) - this node is a cross-community bridge._
- **Are the 97 inferred relationships involving `Engine` (e.g. with `🧠 Layer 3: Services & Detection Engine` and `_engine()`) actually correct?**
  _`Engine` has 97 INFERRED edges - model-reasoned connections that need verification._
- **What connects `attacktrace`, `echarts`, `echarts-for-react` to the rest of the system?**
  _11 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `localize` be split into smaller, more focused modules?**
  _Cohesion score 0.13793103448275862 - nodes in this community are weakly interconnected._
- **Are the 33 inferred relationships involving `Settings` (e.g. with `prepare_storage()` and `validate()`) actually correct?**
  _`Settings` has 33 INFERRED edges - model-reasoned connections that need verification._
- **Should `simulate` be split into smaller, more focused modules?**
  _Cohesion score 0.13768115942028986 - nodes in this community are weakly interconnected._
- **Are the 24 inferred relationships involving `LiveRuntime` (e.g. with `🧠 Layer 3: Services & Detection Engine` and `post_chat()`) actually correct?**
  _`LiveRuntime` has 24 INFERRED edges - model-reasoned connections that need verification._