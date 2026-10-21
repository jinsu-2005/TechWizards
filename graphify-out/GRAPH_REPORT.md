# Graph Report - Attacktrace  (2026-10-21)

## Corpus Check
- Large corpus: 577 files · ~761,782 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder.

## Summary
- 2576 nodes · 8654 edges · 108 communities (91 shown, 17 thin omitted)
- Extraction: 90% EXTRACTED · 10% INFERRED · 0% AMBIGUOUS · INFERRED: 887 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Numpy
- Detect
- Connectors
- Types
- Json
- Liveruntime
- Plant
- Api
- Soak
- Preflight
- Baselinedetector
- App
- Graphparts
- Plantemulator
- Simdata
- Readonlyclient
- Test
- Voice
- Copilot
- Rest
- Attacker
- Haiengine
- Schemas
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
- Test
- Isolate
- Replay
- Engine
- Hai
- Builder
- Report
- Authentication
- Plant
- Test
- Readonlymodbus
- Investigation
- Pipeline
- Package
- Report
- Metrics
- Voice
- Attackrequest
- Fakeclient
- Security
- Metricspage
- Lab
- Devdependencies
- Test
- Voice
- Processworkspace
- Robustness
- Compileroptions
- App
- Authentication
- Reconstruct
- Root
- Loop
- Isolate
- Metrics
- Csv
- Trials
- Security
- Live
- Baseline
- Theme
- Screenshots
- Backup
- Dependencies
- Registeroverlay
- Launch
- Ambiguity
- Experiments
- Main
- Add
- Screenshots
- Cli
- Scripts
- Package
- Test
- Vercel
- Test
- Isolation
- Models
- Voicecaptureprocessor
- Chartoption
- Attacktrace

## God Nodes (most connected - your core abstractions)
1. `Engine` - 140 edges
2. `Settings` - 107 edges
3. `LiveRuntime` - 68 edges
4. `BaselineDetector` - 63 edges
5. `Scenario` - 59 edges
6. `LiveSource` - 59 edges
7. `create_app()` - 59 edges
8. `PlantEmulator` - 56 edges
9. `load_live()` - 54 edges
10. `useLive` - 52 edges

## Surprising Connections (you probably didn't know these)
- `parse_args()` --uses--> `Scenario`  [INFERRED]
  attacker/cli.py → backend/app/attacks/engine.py
- `run()` --uses--> `Scenario`  [INFERRED]
  attacker/cli.py → backend/app/attacks/engine.py
- `test_audit_log_has_one_line_per_write()` --uses--> `AttackerError`  [INFERRED]
  backend/tests/test_attacker.py → attacker/client.py
- `test_invalid_target_and_bad_duration_are_refused()` --uses--> `AttackerError`  [INFERRED]
  backend/tests/test_attacker.py → attacker/client.py
- `AttackRecord` --uses--> `Scenario`  [INFERRED]
  attacker/client.py → backend/app/attacks/engine.py

## Import Cycles
- None detected.

## Communities (108 total, 17 thin omitted)

### Community 0 - "Numpy"
Cohesion: 0.05
Nodes (56): Run, is_ambiguous(), action_for(), explain(), Explanation, signature(), build_incident(), Incident (+48 more)

### Community 1 - "Detect"
Cohesion: 0.06
Nodes (33): simulate(), aggregate(), alert_mask(), best_threshold(), fit_err_sd(), ForecastDetector, residuals(), rising_edges() (+25 more)

### Community 2 - "Connectors"
Cohesion: 0.07
Nodes (31): Aligner, Sample, excluded_from_ranking(), QualityTracker, TagSpec, _Track, LiveSource, _pct() (+23 more)

### Community 3 - "Types"
Cohesion: 0.07
Nodes (56): edgeDelay(), edgeId(), layoutEdges(), MIN_LEARNED_WEIGHT, visibleEdges(), filterAssets(), FocusDirection, graphLinks() (+48 more)

### Community 4 - "Json"
Cohesion: 0.07
Nodes (18): _from_env(), get_settings(), read_checkpoint(), source_fingerprint(), write_checkpoint(), main(), main(), test_bad_checkpoint_is_rejected() (+10 more)

### Community 5 - "Liveruntime"
Cohesion: 0.07
Nodes (19): LiveAttackLauncher, load_live(), build_live_runtime(), LiveRuntime, IncidentStore, test_restart_resumes_rows_and_marks_a_gap(), emulator_runtime(), free_port() (+11 more)

### Community 6 - "Plant"
Cohesion: 0.10
Nodes (30): _Active, AttackEngine, AttackSpec, main(), PID, Plant, _pair(), _run() (+22 more)

### Community 7 - "Api"
Cohesion: 0.09
Nodes (42): useLiveSourcePoll(), narrated, useLiveStream(), Access, AccessContext, useAccess(), Principal, IncidentEvidencePanel() (+34 more)

### Community 8 - "Soak"
Cohesion: 0.09
Nodes (30): AttackerClient, load_baseline(), load_detector(), load_graph(), live_dir(), live_models_ready(), build_engine(), analyze() (+22 more)

### Community 9 - "Preflight"
Cohesion: 0.06
Nodes (28): check_identity(), DeploymentError, main(), prepare_storage(), validate(), make_dataset(), _signals(), _write() (+20 more)

### Community 10 - "Baselinedetector"
Cohesion: 0.11
Nodes (25): Settings, BaselineDetector, Loaded, LiveEngine, SourceNotReadyError, engine(), make_live(), test_demo_mode_off_blocks_live_attack_before_the_attacker_is_ever_called() (+17 more)

### Community 11 - "App"
Cohesion: 0.13
Nodes (38): App(), Center(), ViewToggle(), useFreshness(), EmptyState(), IncidentToast(), NoticeToast(), Panel() (+30 more)

### Community 12 - "Graphparts"
Cohesion: 0.08
Nodes (37): GraphNode, PlantNode, PlantNodeData, PlantNodeView(), PulseEdgeData, PulseEdgeT, PulseEdgeView(), StageData (+29 more)

### Community 13 - "Plantemulator"
Cohesion: 0.09
Nodes (15): LabProxy, evaluate(), free_port(), emu(), free_port(), test_attack_endpoint_writes_to_the_emulator_and_reveals_ground_truth(), test_attack_refused_while_live_is_calibrating(), emu() (+7 more)

### Community 14 - "Simdata"
Cohesion: 0.10
Nodes (12): GroundTruth, Scenario, attack_run(), sample_attack(), _fmt_eta(), analyze(), main(), _pct() (+4 more)

### Community 15 - "Readonlyclient"
Cohesion: 0.07
Nodes (7): LiveConfig, LiveConfigError, ModbusPoller, ReadOnlyClient, TagMap, test_bad_config_fails_fast_with_a_clear_message(), test_missing_or_broken_tagmap_is_a_config_error()

### Community 16 - "Test"
Cohesion: 0.09
Nodes (30): SOURCE_NAMES, TopBar(), MODES, ModeToggle(), Props, html(), StatusPill(), STYLE (+22 more)

### Community 17 - "Voice"
Cohesion: 0.11
Nodes (33): CopilotDrawer(), Line, LiveVoicePanel(), pcm16(), playPcm(), VoiceEvent, VoiceSettingsPage(), postCopilotChat() (+25 more)

### Community 18 - "Copilot"
Cohesion: 0.09
Nodes (14): bounded_chat(), get_copilot_engine(), get_suggestions(), post_chat(), RateLimiter, assess_layers(), evidence_priority(), CopilotChatResponse (+6 more)

### Community 19 - "Rest"
Cohesion: 0.14
Nodes (22): control_hai_replay(), _engine(), get_hai_replay(), get_incident_report(), get_incidents(), get_live_health(), get_metrics(), get_status() (+14 more)

### Community 20 - "Attacker"
Cohesion: 0.13
Nodes (23): allowed_hosts(), AllowlistError, check_host(), is_loopback(), attacker_for(), read(), test_a_refused_write_never_reaches_the_emulator(), test_actuator_force_writes_and_clears_to_no_override() (+15 more)

### Community 21 - "Haiengine"
Cohesion: 0.10
Nodes (11): process_of(), HaiEngine, _Open, origin_candidate(), AlertInfo, OriginCandidate, PathStep, test_dataset_attack_becomes_an_incident_without_invented_labels() (+3 more)

### Community 22 - "Schemas"
Cohesion: 0.09
Nodes (15): topology_of(), Runtime, AttackResponse, CalibrationInfo, CopilotChatRequest, GroundTruthInfo, IsolateRequest, IsolateResponse (+7 more)

### Community 23 - "Proxy"
Cohesion: 0.11
Nodes (8): alter_response(), frame(), decode(), encode(), Tag, test_encoding_round_trips(), test_proxy_rejects_transaction_mismatch(), TruthEvent

### Community 24 - "Write"
Cohesion: 0.10
Nodes (15): analyze(), main(), analyze(), main(), analyze(), main(), _pct(), analyze() (+7 more)

### Community 25 - "Api"
Cohesion: 0.11
Nodes (18): create_app(), client(), test_attack_validation(), test_incidents_and_reset(), test_live_loop_survives_a_failing_tick(), test_metrics(), test_metrics_merges_live_metrics_without_touching_the_file(), test_status_and_mode() (+10 more)

### Community 26 - "Socstore"
Cohesion: 0.22
Nodes (18): NodeState, SocStore, message(), test_api_export_and_archived_copilot_use_original_capture(), test_capture_integrity_failure_never_returns_modified_payload(), test_capture_is_immutable_survives_reopen_and_telemetry_rotation(), test_capture_retention_follows_incident_not_telemetry(), test_legacy_case_and_restored_session_never_receive_current_context() (+10 more)

### Community 27 - "Hai"
Cohesion: 0.14
Nodes (16): HaiFile, HaiLoaded, baseline_rank_nodes(), evaluate_detector(), evaluate_localization(), _first_alert(), _prf(), process_scores() (+8 more)

### Community 28 - "Grounding"
Cohesion: 0.17
Nodes (21): _build_context_summary(), CopilotEngine, _get_gemini_key(), incident_evidence_summary(), local_checks(), _offline_expert_reply(), suggestions(), CopilotTurn (+13 more)

### Community 29 - "Robustness"
Cohesion: 0.14
Nodes (19): model_fingerprints(), assess_calibration(), BenignOverlay, Case, evaluate_case(), fit_calibration(), observations(), probability() (+11 more)

### Community 30 - "Package"
Cohesion: 0.08
Nodes (20): devDependencies, miniflare, engines, node, name, overrides, sharp, undici (+12 more)

### Community 31 - "Live"
Cohesion: 0.12
Nodes (12): AttackResult, _false_alarm_per_hour(), LiveEvalState, main(), _pct(), _prf(), _rising_edges(), run() (+4 more)

### Community 32 - "Emulator"
Cohesion: 0.15
Nodes (18): TagMapError, client_for(), mutate(), raw_map(), read_values(), run_ticks(), test_a_rogue_setpoint_moves_the_plant(), test_a_sensor_offset_fools_the_controller() (+10 more)

### Community 33 - "Test"
Cohesion: 0.12
Nodes (17): CalibratingState(), html(), ProgressRing(), SourcePill(), STYLE, base, html(), answerSections() (+9 more)

### Community 34 - "Isolate"
Cohesion: 0.14
Nodes (13): test_message_shape_and_cadence(), client(), opened(), step_until(), test_isolate_endpoint(), test_isolate_is_409_in_hai_mode_and_needs_the_key(), test_isolating_a_wrong_node_never_contains(), test_isolating_the_true_origin_contains_the_incident() (+5 more)

### Community 35 - "Replay"
Cohesion: 0.17
Nodes (20): Props, Sparkline(), pctX(), Timeline(), usePlayback(), formatValue(), plain(), clampIndex() (+12 more)

### Community 36 - "Engine"
Cohesion: 0.12
Nodes (3): Engine, _Open, test_detector_is_warm_before_the_first_message()

### Community 37 - "Hai"
Cohesion: 0.14
Nodes (16): HaiData, split_tests(), client(), data(), hai_engine(), test_detector_metrics_on_a_known_alert_pattern(), test_hai_mode_is_refused_without_data_or_models(), test_hai_playback_controls_pause_without_consuming_rows() (+8 more)

### Community 38 - "Builder"
Cohesion: 0.15
Nodes (10): learn_granger_edges(), learn_var_edges(), learned_graph(), merge_graph(), save_graph(), static_graph(), test_adjacency_lists_parents(), test_granger_finds_lagged_cause() (+2 more)

### Community 39 - "Report"
Cohesion: 0.16
Nodes (10): _eta(), render_report(), para(), _utc(), ascii_text(), _escape(), Page, text_width() (+2 more)

### Community 40 - "Authentication"
Cohesion: 0.20
Nodes (13): check_origin(), config(), firebase_app(), identity(), logout(), me(), names(), protect() (+5 more)

### Community 41 - "Plant"
Cohesion: 0.12
Nodes (7): NoOverlay, Overlay, _clip(), Impact, PlantParams, _time_to(), NodeSpec

### Community 42 - "Test"
Cohesion: 0.13
Nodes (16): Props, ImpactMeters(), Meter(), tone(), etaUrgency(), formatEta(), isSpoofed(), magnitudeFor() (+8 more)

### Community 43 - "Readonlymodbus"
Cohesion: 0.11
Nodes (6): bounded(), ReadOnlyModbus, slow_factory(), SlowClient, test_a_silent_server_times_out_instead_of_hanging(), test_the_live_package_has_no_write_path()

### Community 44 - "Investigation"
Cohesion: 0.25
Nodes (14): asset_registers(), baseline_comparison(), capture(), detail(), evidence(), export(), journal(), progress() (+6 more)

### Community 45 - "Pipeline"
Cohesion: 0.17
Nodes (11): node_kind(), hai_models_ready(), load_hai_baseline(), load_hai_detector(), train_hai(), _windows(), build_hai_engine(), test_slow_speed_carries_fractions() (+3 more)

### Community 46 - "Package"
Cohesion: 0.10
Nodes (21): name, overrides, @grpc/grpc-js, private, type, version, autoprefixer, echarts (+13 more)

### Community 47 - "Report"
Cohesion: 0.16
Nodes (10): worst_impact(), Impact, check_structure(), client(), test_impact_snapshot_keeps_the_worst_values(), test_report_endpoint_returns_a_valid_one_page_pdf(), test_report_is_open_without_a_key(), test_report_shows_the_ambiguous_banner_and_breakdown() (+2 more)

### Community 48 - "Metrics"
Cohesion: 0.16
Nodes (9): ensure_metrics(), safe_ensure_metrics(), main(), write_metrics(), test_a_failing_metrics_step_never_stops_startup(), test_existing_metrics_are_never_overwritten(), test_first_start_writes_metrics_once(), fake() (+1 more)

### Community 49 - "Voice"
Cohesion: 0.14
Nodes (8): _authenticate(), live_voice(), browser_to_gemini(), gemini_to_browser(), process_snapshot(), session_config(), test_voice_rejects_wrong_demo_key_before_gemini(), test_voice_snapshot_excludes_sim_ground_truth()

### Community 50 - "Attackrequest"
Cohesion: 0.22
Nodes (12): _has_hazard(), AttackRequest, _open_incident(), run(), test_attack_produces_localized_incident(), test_clean_run_raises_no_incident(), test_incident_closes_after_attack_ends(), test_incident_reports_the_ambiguity_flag() (+4 more)

### Community 51 - "Fakeclient"
Cohesion: 0.17
Nodes (10): ReadError, load_tagmap(), test_shipped_tagmap_is_valid_and_complete(), FakeClient, poller(), test_a_partial_read_failure_keeps_the_other_tags(), test_backoff_grows_is_capped_and_resets(), test_reads_are_batched_by_contiguous_block() (+2 more)

### Community 52 - "Security"
Cohesion: 0.22
Nodes (14): client(), make_client(), test_a_configured_key_still_works_regardless_of_host(), test_attack_endpoint_is_rate_limited(), test_demo_mode_off_blocks_attacks_only(), test_loopback_variants_all_count_as_loopback(), test_no_key_configured_leaves_writes_open(), test_no_key_fails_closed_outside_loopback_dev() (+6 more)

### Community 53 - "Metricspage"
Cohesion: 0.17
Nodes (16): BaselineComparison(), Report, Result, Card(), Cards(), formatUptime(), HaiCards(), LiveCards() (+8 more)

### Community 54 - "Lab"
Cohesion: 0.26
Nodes (11): configure(), emulator_info(), exclusive(), integrity(), ManifestChange, observe_integrity(), probe(), proxy() (+3 more)

### Community 55 - "Devdependencies"
Cohesion: 0.11
Nodes (19): devDependencies, autoprefixer, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, @playwright/test (+11 more)

### Community 56 - "Test"
Cohesion: 0.22
Nodes (14): BreakdownBar(), BreakdownLegend(), f2(), SEGMENTS, html(), three, top, w (+6 more)

### Community 57 - "Voice"
Cohesion: 0.22
Nodes (9): capabilities(), _interaction(), _key(), _limit(), _output_audio(), _output_text(), SpeechRequest, synthesize() (+1 more)

### Community 58 - "Processworkspace"
Cohesion: 0.22
Nodes (13): Message, AssetInspector(), EvidenceList(), IncidentProgress(), ResponseEvent, GraphView, ProcessWorkspace(), VIEW (+5 more)

### Community 59 - "Robustness"
Cohesion: 0.25
Nodes (14): percent(), ReliabilityTable(), RobustnessPanel(), score(), seconds(), finite(), nullable(), numbers() (+6 more)

### Community 60 - "Compileroptions"
Cohesion: 0.11
Nodes (17): compilerOptions, isolatedModules, jsx, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch (+9 more)

### Community 61 - "App"
Cohesion: 0.15
Nodes (6): GatewayBoundary, gateway_app(), test_direct_origin_denied_even_for_auth_config_and_docs(), test_gateway_secret_does_not_replace_firebase_identity(), test_local_mode_is_unchanged_without_an_origin_secret(), test_stream_requires_gateway_secret_before_upgrade()

### Community 62 - "Authentication"
Cohesion: 0.20
Nodes (10): headers(), login(), secured(), test_analyst_decisions_record_verified_actor(), test_login_cookie_membership_and_csrf(), test_logout_invalidates_copied_cookie_and_stream(), test_missing_server_credentials_fail_closed(), test_repeated_signins_have_distinct_server_sessions() (+2 more)

### Community 63 - "Reconstruct"
Cohesion: 0.21
Nodes (6): _cost(), hop_distance(), PathNode, Propagation, reconstruct(), _shortest()

### Community 64 - "Root"
Cohesion: 0.23
Nodes (14): MetricsPage, Root(), Route(), SocPage, VoiceSettingsPage, WorkspaceLoading(), WorkspacePage, pages (+6 more)

### Community 65 - "Loop"
Cohesion: 0.19
Nodes (6): Hub, run_loop(), digest(), loaded_context(), runtime_context(), lifespan()

### Community 66 - "Isolate"
Cohesion: 0.28
Nodes (12): IsolateButton(), advance(), begin(), candidateFor(), disabledReason(), IDLE, IsolateAvailability, IsoPhase (+4 more)

### Community 67 - "Metrics"
Cohesion: 0.29
Nodes (15): AmbiguityMetrics, detector(), DetectorMetrics, haiDetector(), HaiDetectorMetrics, isNum(), isObj(), IsolationMetrics (+7 more)

### Community 68 - "Csv"
Cohesion: 0.20
Nodes (7): hai_paths(), load_hai(), _read(), _read_csv(), hai_forward(), HaiForward, test_paths_ignore_missing_folder_and_other_files()

### Community 69 - "Trials"
Cohesion: 0.28
Nodes (11): build_report(), main(), pair_key(), _pick_primary_backup(), _rank(), run_live(), run_sim(), run_sim_trial() (+3 more)

### Community 70 - "Security"
Cohesion: 0.19
Nodes (4): _is_loopback(), limit_attacks(), require_demo(), require_key()

### Community 72 - "Live"
Cohesion: 0.21
Nodes (8): train_live(), evaluate(), main(), collect(), test_resumed_training_never_builds_windows_across_a_gap(), test_trainer_splits_by_time_and_sets_the_threshold_from_clean_validation(), test_trainer_starts_from_the_sim_weights_when_they_exist(), test_training_needs_enough_clean_data()

### Community 73 - "Baseline"
Cohesion: 0.26
Nodes (7): baseline_rank(), evaluate_baseline_localization(), fitted(), test_baseline_saved_before_names_existed_still_works(), test_missed_attacks_count_as_misses(), test_rank_breaks_ties_by_larger_deviation(), test_rank_puts_the_first_breaching_node_first()

### Community 74 - "Theme"
Cohesion: 0.23
Nodes (9): ThemeSwitcher(), applyTheme(), getInitialTheme(), ThemeId, ThemeMeta, THEMES, ThemeState, useTheme (+1 more)

### Community 75 - "Screenshots"
Cohesion: 0.27
Nodes (10): ambiguousShot(), { chromium }, errors, haiIncident(), log, require, shot(), simViews() (+2 more)

### Community 77 - "Backup"
Cohesion: 0.23
Nodes (4): test_backup_includes_committed_wal_and_closes_output(), test_backup_refuses_to_replace_existing_data(), main(), backup()

### Community 78 - "Dependencies"
Cohesion: 0.17
Nodes (12): dependencies, echarts, echarts-for-react, firebase, @fontsource/inter, @fontsource/jetbrains-mono, framer-motion, lucide-react (+4 more)

### Community 79 - "Registeroverlay"
Cohesion: 0.17
Nodes (3): Controls, RegisterOverlay, load()

### Community 80 - "Launch"
Cohesion: 0.29
Nodes (4): AttackerError, AttackRecord, _neutral(), _surface_tag()

### Community 81 - "Ambiguity"
Cohesion: 0.36
Nodes (5): Row, rows(), summarize(), tune_margin(), tuning_rows()

### Community 82 - "Experiments"
Cohesion: 0.27
Nodes (4): best_f1(), main(), score(), smooth()

### Community 83 - "Main"
Cohesion: 0.20
Nodes (6): AuthGate(), app, root, firebase, @fontsource/inter, @fontsource/jetbrains-mono

### Community 84 - "Add"
Cohesion: 0.33
Nodes (3): Counts, evaluate(), _onsets()

### Community 85 - "Screenshots"
Cohesion: 0.31
Nodes (8): { chromium }, errors, liveViews(), log, require, shot(), SIZES, sleep()

### Community 86 - "Cli"
Cohesion: 0.43
Nodes (4): main(), parse_args(), run(), load_attacker()

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

### Community 92 - "Isolation"
Cohesion: 0.50
Nodes (4): Arm, _isolate(), run_isolation(), _summary()

### Community 96 - "Chartoption"
Cohesion: 0.67
Nodes (3): chartOption(), getChartColors(), BarRow

## Knowledge Gaps
- **11 isolated node(s):** `attacktrace`, `echarts`, `echarts-for-react`, `@types/node`, `@types/react` (+6 more)
  These have ≤1 connection - possible missing edges. (Counts symbols only; 725 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **17 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Settings` connect `Baselinedetector` to `Detect`, `Connectors`, `Json`, `Liveruntime`, `Soak`, `Preflight`, `Plantemulator`, `Simdata`, `Readonlyclient`, `Attacker`, `Haiengine`, `Hai`, `Live`, `Isolate`, `Engine`, `Hai`, `Pipeline`, `Report`, `Metrics`, `Voice`, `Security`, `App`, `Authentication`, `Trials`, `Live`, `Isolation`?**
  _High betweenness centrality (0.050) - this node is a cross-community bridge._
- **Are the 95 inferred relationships involving `Engine` (e.g. with `_engine()` and `Settings`) actually correct?**
  _`Engine` has 95 INFERRED edges - model-reasoned connections that need verification._
- **What connects `attacktrace`, `echarts`, `echarts-for-react` to the rest of the system?**
  _11 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Numpy` be split into smaller, more focused modules?**
  _Cohesion score 0.05386138613861386 - nodes in this community are weakly interconnected._
- **Why does `Engine` connect `Engine` to `Detect`, `Connectors`, `Liveruntime`, `Soak`, `Baselinedetector`, `Simdata`, `Rest`, `Haiengine`, `Schemas`, `Api`, `Socstore`, `Grounding`, `Isolate`, `Hai`, `Pipeline`, `Report`, `Voice`, `Attackrequest`, `Security`, `Trials`, `Live`, `Isolation`?**
  _High betweenness centrality (0.046) - this node is a cross-community bridge._
- **Are the 33 inferred relationships involving `Settings` (e.g. with `prepare_storage()` and `validate()`) actually correct?**
  _`Settings` has 33 INFERRED edges - model-reasoned connections that need verification._
- **Should `Detect` be split into smaller, more focused modules?**
  _Cohesion score 0.06388666132050254 - nodes in this community are weakly interconnected._