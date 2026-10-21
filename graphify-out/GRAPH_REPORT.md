# Graph Report - Attacktrace  (2026-10-14)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 1937 nodes · 6421 edges · 80 communities (66 shown, 14 thin omitted)
- Extraction: 89% EXTRACTED · 11% INFERRED · 0% AMBIGUOUS · INFERRED: 705 edges (avg confidence: 0.91)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `139d35d9`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- AttackSpec
- rest.py
- types.ts
- app/engine.py
- Engine
- GraphParts.tsx
- test_live_runtime.py
- test_hai.py
- train.py
- preflight.py
- PlantEmulator
- localization.py
- test_detect.py
- geometry.ts
- merge_write
- App.tsx
- test_attacker.py
- pipeline.py
- LiveRuntime
- static_graph
- eval/hai.py
- capture_screenshots.mjs
- Timeline.tsx
- load_detector
- IncidentPanel.tsx
- main.py
- create_app
- Scenario
- test_emulator.py
- test_security.py
- Incident
- test_eval_baseline.py
- numpy
- live_faults.py
- IsolateButton.tsx
- test_ties.py
- test_report.py
- localize/incident.py
- package.json
- modbus.py
- ReadOnlyClient
- server.py
- Settings
- load_tagmap
- TagMap
- incident.render.test.ts
- metrics.ts
- reconstruct
- live.py
- devDependencies
- AttackConsole.tsx
- compilerOptions
- json
- live/runtime.py
- test_live_connectors.py
- pathlib
- Aligner
- demo_trials.py
- format.ts
- QualityTracker
- record
- FakeClient
- hai_experiments.py
- build_live_runtime
- LiveConfig
- dependencies
- scripts
- MetricsChart.tsx
- attacktrace

## God Nodes (most connected - your core abstractions)
1. `Engine` - 128 edges
2. `Settings` - 88 edges
3. `BaselineDetector` - 63 edges
4. `Scenario` - 57 edges
5. `LiveRuntime` - 50 edges
6. `LiveSource` - 50 edges
7. `PlantEmulator` - 48 edges
8. `Loaded` - 42 edges
9. `HaiEngine` - 41 edges
10. `LiveEngine` - 41 edges

## Surprising Connections (you probably didn't know these)
- `read()` --uses--> `PlantEmulator`  [INFERRED]
  backend/tests/test_attacker.py → plant_emulator/server.py
- `client_for()` --uses--> `PlantEmulator`  [INFERRED]
  backend/tests/test_emulator.py → plant_emulator/server.py
- `read_values()` --uses--> `PlantEmulator`  [INFERRED]
  backend/tests/test_emulator.py → plant_emulator/server.py
- `run_ticks()` --uses--> `PlantEmulator`  [INFERRED]
  backend/tests/test_emulator.py → plant_emulator/server.py
- `test_clients_cannot_write_process_values()` --uses--> `PlantEmulator`  [INFERRED]
  backend/tests/test_emulator.py → plant_emulator/server.py

## Import Cycles
- None detected.

## Communities (80 total, 14 thin omitted)

### Community 0 - "AttackSpec"
Cohesion: 0.05
Nodes (40): _Active, AttackEngine, AttackSpec, GroundTruth, _fmt_eta(), main(), NoOverlay, Overlay (+32 more)

### Community 1 - "rest.py"
Cohesion: 0.07
Nodes (32): _engine(), get_incident_report(), get_incidents(), get_live_health(), get_metrics(), get_status(), get_topology(), _live_availability() (+24 more)

### Community 2 - "types.ts"
Cohesion: 0.07
Nodes (45): TopBar(), useClock(), useLiveStream(), MODES, ModeToggle(), Props, html(), SourcePill() (+37 more)

### Community 3 - "app/engine.py"
Cohesion: 0.08
Nodes (21): HaiEngine, _Open, is_ambiguous(), origin_candidate(), topology_of(), AlertInfo, GroundTruthInfo, ModeRequest (+13 more)

### Community 4 - "Engine"
Cohesion: 0.10
Nodes (28): Engine, _has_hazard(), AttackRequest, run(), test_attack_produces_localized_incident(), test_clean_run_raises_no_incident(), test_detector_is_warm_before_the_first_message(), test_incident_closes_after_attack_ends() (+20 more)

### Community 5 - "GraphParts.tsx"
Cohesion: 0.08
Nodes (41): NodeScores(), edgeDelay(), edgeId(), layoutEdges(), MIN_LEARNED_WEIGHT, visibleEdges(), PlantNode, PlantNodeData (+33 more)

### Community 6 - "test_live_runtime.py"
Cohesion: 0.11
Nodes (30): BaselineDetector, Loaded, LiveEngine, LiveSource, engine(), make_live(), FakeClock, feed() (+22 more)

### Community 7 - "test_hai.py"
Cohesion: 0.09
Nodes (30): hai_paths(), HaiData, load_hai(), node_kind(), process_of(), _read(), _read_csv(), hai_models_ready() (+22 more)

### Community 8 - "train.py"
Cohesion: 0.10
Nodes (16): fit_err_sd(), build_model(), GDN, make_windows(), MLPForecaster, Norm, train(), train_hai() (+8 more)

### Community 9 - "preflight.py"
Cohesion: 0.08
Nodes (19): click_path(), main(), post(), wait_healthy(), check(), check_backend_health(), check_console_errors(), check_emulator() (+11 more)

### Community 10 - "PlantEmulator"
Cohesion: 0.09
Nodes (11): Tag, emu(), free_port(), test_attack_endpoint_writes_to_the_emulator_and_reveals_ground_truth(), test_attack_refused_while_live_is_calibrating(), test_demo_mode_off_blocks_live_attack_before_the_attacker_is_ever_called(), emu(), emulator_runtime() (+3 more)

### Community 11 - "localization.py"
Cohesion: 0.13
Nodes (20): build_incident(), softmax(), Weights, Row, rows(), summarize(), tune_margin(), tuning_rows() (+12 more)

### Community 12 - "test_detect.py"
Cohesion: 0.11
Nodes (14): alert_mask(), best_threshold(), ForecastDetector, residuals(), rising_edges(), sustained(), predict(), test_actuator_attack_scores_above_clean() (+6 more)

### Community 13 - "geometry.ts"
Cohesion: 0.12
Nodes (31): Pump(), PumpProps, Tank(), TankProps, Valve(), ValveProps, Equipment(), Props (+23 more)

### Community 14 - "merge_write"
Cohesion: 0.11
Nodes (15): analyze(), main(), analyze(), main(), analyze(), main(), _pct(), analyze() (+7 more)

### Community 15 - "App.tsx"
Cohesion: 0.13
Nodes (25): App(), Center(), ViewToggle(), MetricsPage, Root(), useLiveSourcePoll(), CalibratingState(), html() (+17 more)

### Community 16 - "test_attacker.py"
Cohesion: 0.13
Nodes (23): allowed_hosts(), AllowlistError, check_host(), is_loopback(), attacker_for(), read(), test_a_refused_write_never_reaches_the_emulator(), test_actuator_force_writes_and_clears_to_no_override() (+15 more)

### Community 17 - "pipeline.py"
Cohesion: 0.13
Nodes (16): attack_run(), Run, sample_attack(), simulate(), aggregate(), Trained, _val_runs(), hai_forward() (+8 more)

### Community 18 - "LiveRuntime"
Cohesion: 0.09
Nodes (4): LiveAttackLauncher, LiveRuntime, LiveRecorder, TagHealth

### Community 19 - "static_graph"
Cohesion: 0.13
Nodes (19): static_graph(), causal_term(), deviation_term(), first_crossings(), localize(), onset_term(), test_static_graph_matches_pid(), synthetic_chain() (+11 more)

### Community 20 - "eval/hai.py"
Cohesion: 0.14
Nodes (15): HaiFile, HaiLoaded, split_tests(), baseline_rank_nodes(), evaluate_detector(), evaluate_localization(), _first_alert(), _prf() (+7 more)

### Community 21 - "capture_screenshots.mjs"
Cohesion: 0.10
Nodes (19): @playwright/test, { chromium }, errors, liveViews(), log, require, shot(), SIZES (+11 more)

### Community 22 - "Timeline.tsx"
Cohesion: 0.15
Nodes (22): Panel(), PanelProps, Btn(), ReplayControls(), Props, Sparkline(), pctX(), Timeline() (+14 more)

### Community 23 - "load_detector"
Cohesion: 0.15
Nodes (17): load_baseline(), load_detector(), load_graph(), build_engine(), analyze(), _impact_with_vs_without(), _inference_timing(), main() (+9 more)

### Community 24 - "IncidentPanel.tsx"
Cohesion: 0.16
Nodes (22): EmptyState(), Details(), IncidentPanel(), Reveal(), Section(), PathChips(), Card(), Cards() (+14 more)

### Community 25 - "main.py"
Cohesion: 0.11
Nodes (8): live(), _from_env(), get_settings(), main(), analyze(), main(), _pct(), test_settings_read_env()

### Community 26 - "create_app"
Cohesion: 0.14
Nodes (15): create_app(), Runtime, AttackResponse, LiveMessage, client(), test_attack_validation(), test_incidents_and_reset(), test_live_loop_survives_a_failing_tick() (+7 more)

### Community 27 - "Scenario"
Cohesion: 0.16
Nodes (10): main(), parse_args(), run(), AttackerClient, AttackerError, AttackRecord, load_attacker(), _neutral() (+2 more)

### Community 28 - "test_emulator.py"
Cohesion: 0.18
Nodes (19): decode(), encode(), client_for(), free_port(), read_values(), run_ticks(), test_a_rogue_setpoint_moves_the_plant(), test_a_sensor_offset_fools_the_controller() (+11 more)

### Community 29 - "test_security.py"
Cohesion: 0.15
Nodes (16): RateLimiter, client(), make_client(), test_a_configured_key_still_works_regardless_of_host(), test_attack_endpoint_is_rate_limited(), test_demo_mode_off_blocks_attacks_only(), test_loopback_variants_all_count_as_loopback(), test_no_key_configured_leaves_writes_open() (+8 more)

### Community 30 - "Incident"
Cohesion: 0.11
Nodes (4): _Open, IncidentStore, Incident, test_store_only_returns_its_own_mode()

### Community 31 - "test_eval_baseline.py"
Cohesion: 0.13
Nodes (7): baseline_rank(), evaluate_baseline_localization(), fitted(), test_baseline_saved_before_names_existed_still_works(), test_missed_attacks_count_as_misses(), test_rank_breaks_ties_by_larger_deviation(), test_rank_puts_the_first_breaching_node_first()

### Community 32 - "numpy"
Cohesion: 0.13
Nodes (9): _windows(), learn_granger_edges(), learn_var_edges(), merge_graph(), test_baseline_flags_large_offset(), test_make_windows_alignment(), test_adjacency_lists_parents(), test_granger_finds_lagged_cause() (+1 more)

### Community 33 - "live_faults.py"
Cohesion: 0.18
Nodes (13): load_live(), live_dir(), live_models_ready(), build_state(), build_engine(), check_emulator_down(), check_out_of_range(), check_slow_network() (+5 more)

### Community 34 - "IsolateButton.tsx"
Cohesion: 0.18
Nodes (17): IsolateButton(), ApiError, postIsolate(), isActive(), advance(), begin(), candidateFor(), disabledReason() (+9 more)

### Community 35 - "test_ties.py"
Cohesion: 0.14
Nodes (14): break_ties(), combine_onsets(), step_onsets(), test_actuator_beats_the_process_sensors_it_drives(), test_break_ties_is_deterministic_and_total(), test_clearly_weaker_node_is_not_pulled_into_the_tie(), test_node_already_elevated_when_window_opens_is_not_a_cause(), test_path_orders_same_sample_onsets_cause_first() (+6 more)

### Community 36 - "test_report.py"
Cohesion: 0.14
Nodes (10): worst_impact(), Impact, check_structure(), client(), test_impact_snapshot_keeps_the_worst_values(), test_report_endpoint_returns_a_valid_one_page_pdf(), test_report_is_open_without_a_key(), test_report_shows_the_ambiguous_banner_and_breakdown() (+2 more)

### Community 37 - "localize/incident.py"
Cohesion: 0.15
Nodes (9): action_for(), explain(), Explanation, signature(), Incident, Candidate, test_explanation_templates(), test_gate_flags_close_top_two_and_never_reorders() (+1 more)

### Community 38 - "package.json"
Cohesion: 0.11
Nodes (19): name, private, type, version, autoprefixer, eslint, @eslint/js, eslint-plugin-react-hooks (+11 more)

### Community 39 - "modbus.py"
Cohesion: 0.13
Nodes (5): bounded(), ReadError, ReadOnlyModbus, slow_factory(), test_a_silent_server_times_out_instead_of_hanging()

### Community 40 - "ReadOnlyClient"
Cohesion: 0.12
Nodes (3): ModbusPoller, ReadOnlyClient, SlowClient

### Community 41 - "server.py"
Cohesion: 0.10
Nodes (4): Controls, RegisterOverlay, load(), TruthEvent

### Community 42 - "Settings"
Cohesion: 0.19
Nodes (10): Settings, ensure_metrics(), safe_ensure_metrics(), test_default_config_is_valid(), test_missing_or_broken_tagmap_is_a_config_error(), test_a_failing_metrics_step_never_stops_startup(), test_existing_metrics_are_never_overwritten(), test_first_start_writes_metrics_once() (+2 more)

### Community 43 - "load_tagmap"
Cohesion: 0.15
Nodes (7): load_tagmap(), TagMapError, mutate(), raw_map(), test_invalid_tagmaps_are_rejected(), test_load_reports_readable_errors(), test_shipped_tagmap_is_valid_and_complete()

### Community 45 - "incident.render.test.ts"
Cohesion: 0.22
Nodes (14): BreakdownBar(), BreakdownLegend(), f2(), SEGMENTS, html(), three, top, w (+6 more)

### Community 46 - "metrics.ts"
Cohesion: 0.22
Nodes (18): AmbiguityMetrics, detector(), DetectorMetrics, haiDetector(), HaiDetectorMetrics, HaiMetrics, isNum(), isObj() (+10 more)

### Community 47 - "reconstruct"
Cohesion: 0.20
Nodes (6): _cost(), hop_distance(), PathNode, Propagation, reconstruct(), _shortest()

### Community 48 - "live.py"
Cohesion: 0.22
Nodes (11): AttackResult, _false_alarm_per_hour(), LiveEvalState, main(), _pct(), _prf(), _rising_edges(), run() (+3 more)

### Community 49 - "devDependencies"
Cohesion: 0.11
Nodes (18): devDependencies, autoprefixer, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, @playwright/test (+10 more)

### Community 50 - "AttackConsole.tsx"
Cohesion: 0.22
Nodes (14): AttackConsole(), MagnitudeField(), Props, post(), postAttack(), postReset(), magnitudeFor(), MagnitudeInput (+6 more)

### Community 51 - "compilerOptions"
Cohesion: 0.11
Nodes (17): compilerOptions, isolatedModules, jsx, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch (+9 more)

### Community 52 - "json"
Cohesion: 0.21
Nodes (7): main(), ReconnectEvent, _rss_mb(), run(), Sample, SoakState, _summarize()

### Community 53 - "live/runtime.py"
Cohesion: 0.24
Nodes (4): excluded_from_ranking(), TagSpec, Snapshot, SourceNotReadyError

### Community 54 - "test_live_connectors.py"
Cohesion: 0.20
Nodes (11): settings(), source_with_samples(), test_a_corrupt_value_is_out_of_range_not_a_false_origin_input(), test_frozen_is_advisory_and_the_rest_are_excluded(), test_frozen_needs_neighbours_that_move_and_only_sensors(), test_out_of_order_samples_reach_the_dropped_counter(), test_quality_labels(), test_snapshot_status_and_health_label_stale_and_missing_data() (+3 more)

### Community 55 - "pathlib"
Cohesion: 0.17
Nodes (5): hai_dir(), hai_models(), make_dataset(), _signals(), _write()

### Community 56 - "Aligner"
Cohesion: 0.21
Nodes (5): Aligner, Sample, TagHealth, test_aligner_holds_the_last_value_until_max_age(), test_out_of_order_samples_are_dropped_and_counted()

### Community 57 - "demo_trials.py"
Cohesion: 0.28
Nodes (11): build_report(), main(), pair_key(), _pick_primary_backup(), _rank(), run_live(), run_sim(), run_sim_trial() (+3 more)

### Community 58 - "format.ts"
Cohesion: 0.24
Nodes (10): ImpactMeters(), Meter(), tone(), etaUrgency(), formatEta(), formatValue(), isSpoofed(), plain() (+2 more)

### Community 60 - "record"
Cohesion: 0.24
Nodes (6): _pct(), SourceStatus, record(), free_port(), test_connection_refused_is_down_not_a_crash(), test_the_source_reconnects_after_the_server_restarts()

### Community 62 - "FakeClient"
Cohesion: 0.29
Nodes (7): FakeClient, poller(), test_a_partial_read_failure_keeps_the_other_tags(), test_backoff_grows_is_capped_and_resets(), test_reads_are_batched_by_contiguous_block(), test_requests_in_flight_are_bounded(), test_the_connection_is_dropped_and_retried_after_total_failure()

### Community 63 - "hai_experiments.py"
Cohesion: 0.27
Nodes (4): best_f1(), main(), score(), smooth()

### Community 64 - "build_live_runtime"
Cohesion: 0.25
Nodes (4): Hub, run_loop(), build_live_runtime(), lifespan()

### Community 65 - "LiveConfig"
Cohesion: 0.31
Nodes (3): LiveConfig, LiveConfigError, test_bad_config_fails_fast_with_a_clear_message()

### Community 66 - "dependencies"
Cohesion: 0.22
Nodes (9): dependencies, echarts, echarts-for-react, framer-motion, lucide-react, react, react-dom, @xyflow/react (+1 more)

### Community 67 - "scripts"
Cohesion: 0.25
Nodes (8): scripts, build, dev, e2e, lint, preview, test, typecheck

### Community 68 - "MetricsChart.tsx"
Cohesion: 0.36
Nodes (6): C, chartOption(), MetricsChart(), BarRow, echarts, echarts-for-react

## Knowledge Gaps
- **9 isolated node(s):** `autoprefixer`, `eslint`, `postcss`, `tailwindcss`, `@types/node` (+4 more)
  These have ≤1 connection - possible missing edges. (Counts symbols only; 575 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **14 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Engine` connect `Engine` to `AttackSpec`, `rest.py`, `app/engine.py`, `test_report.py`, `test_live_runtime.py`, `test_hai.py`, `train.py`, `Settings`, `live/runtime.py`, `load_detector`, `main.py`, `create_app`, `test_security.py`, `Incident`, `demo_trials.py`?**
  _High betweenness centrality (0.055) - this node is a cross-community bridge._
- **Are the 85 inferred relationships involving `Engine` (e.g. with `_engine()` and `Settings`) actually correct?**
  _`Engine` has 85 INFERRED edges - model-reasoned connections that need verification._
- **What connects `autoprefixer`, `eslint`, `postcss` to the rest of the system?**
  _9 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AttackSpec` be split into smaller, more focused modules?**
  _Cohesion score 0.05171717171717172 - nodes in this community are weakly interconnected._
- **Why does `Settings` connect `Settings` to `app/engine.py`, `Engine`, `test_live_runtime.py`, `test_hai.py`, `train.py`, `PlantEmulator`, `localization.py`, `test_attacker.py`, `LiveRuntime`, `load_detector`, `main.py`, `test_security.py`, `Incident`, `live_faults.py`, `test_report.py`, `load_tagmap`, `live.py`, `json`, `live/runtime.py`, `test_live_connectors.py`, `demo_trials.py`, `record`, `build_live_runtime`, `LiveConfig`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._
- **Are the 29 inferred relationships involving `Settings` (e.g. with `Engine` and `HaiEngine`) actually correct?**
  _`Settings` has 29 INFERRED edges - model-reasoned connections that need verification._
- **Should `rest.py` be split into smaller, more focused modules?**
  _Cohesion score 0.06746031746031746 - nodes in this community are weakly interconnected._