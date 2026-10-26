# Graph Report - Attacktrace  (2026-10-27)

## Corpus Check
- 443 files · ~1,254,872 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 58 file(s) not represented in the graph (top: (none) 22, .pt 12, .log 8)

## Summary
- 3435 nodes · 10398 edges · 153 communities (121 shown, 32 thin omitted)
- Extraction: 91% EXTRACTED · 9% INFERRED · 0% AMBIGUOUS · INFERRED: 959 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `1bf9568e`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- numpy
- api.ts
- argparse
- GraphParts.tsx
- eval/hai.py
- schemas.py
- GraphView.tsx
- sys
- TagMap
- test_gateway.py
- live.ts
- tagmap.py
- app/config.py
- source.py
- react
- test_ev.py
- TopBar.tsx
- react
- LiveRuntime
- Rest
- test_emulator.py
- test_hai.py
- CalibratingState.tsx
- copilot.py
- Write
- test_api.py
- time
- react
- Grounding
- test_robustness.py
- gateway/package.json
- json
- test_emulator.py
- LiveEngine
- main.py
- attack.ts
- BaselineDetector
- engine
- pipeline.py
- classify_language
- Authentication
- RegisterOverlay
- RateLimiter
- lab.py
- HaiEngine
- Settings
- Package
- model.ts
- main.py
- test_isolate.py
- Ev3dScene
- ModelRouter
- create_app
- AttackTrace UI and navigation repair — 16 October 2026
- LIVE calibration fix and next implementation plan
- Devdependencies
- incident.render.test.ts
- Incident
- test_live_connectors.py
- test_report.py
- Compileroptions
- test_report.py
- Ev3dScene.ts
- time
- Engine
- EvWorkspace.tsx
- EvWorkspace.tsx
- MetricsPage.tsx
- 13. Questions and Answers for Reviewers & Judges
- AttackTrace_Slides.md
- Private-server release plan — 16 October 2026
- run.py
- package.py
- AttackTrace: Project Explained & Comprehensive Presentation Guide
- Screenshots
- check_host
- data/hai.py
- Dependencies
- record
- 12. Presentation-Ready Content (PowerPoint Slide Deck)
- pytest
- AttackSpec
- firebase.ts
- gateway/package.json
- Screenshots
- AI Pilot · Signal Room design plan
- Scripts
- test_attacker.py
- Test
- Vercel
- tokens.test.ts
- carGeometry.ts
- 10. Results and Evaluation
- test_live_runtime.py
- Voicecaptureprocessor
- AttackTrace AI Pilot model registry and verification
- Attacktrace
- Incident evidence delivery — 15 October 2026
- AttackTrace: proposed SOC and Twin/Graph enhancement plan
- 3. How the Project Works: The Complete Walkthrough
- attacker/cli.py
- VOICE_ASSISTANT.md
- Presenter cheat sheet (one page)
- AttackTrace
- 7. AI and Detection Methods
- pathlib
- Demo script (3 minutes)
- QA_Prep.md
- 11. Limitations and Future Improvements
- 1. Project Overview
- index.js
- 2. Problem Statement and Objectives
- python-dependency-audit.json
- LiveAttackLauncher
- process_of
- 14. Glossary and References
- 6. Technologies and Their Purpose
- 🔍 Layer-by-Layer Component Breakdown
- EV_ARCHITECTURE.md
- AttackerClient
- hai_experiments.py
- _windows
- 1. 5-Minute Live Demonstration Script for Judges
- EV_TEST_RESULTS.md
- 2. Chronological Milestones & Commits
- ._advance_incident
- Iteration 1: 3D Cyber-Physical Operations Command Deck
- EV_3D_DESIGN.md
- test_journal_backup.py
- EV investigation implementation
- EV workspace

## God Nodes (most connected - your core abstractions)
1. `Engine` - 145 edges
2. `Settings` - 110 edges
3. `LiveRuntime` - 70 edges
4. `create_app()` - 69 edges
5. `react` - 64 edges
6. `BaselineDetector` - 63 edges
7. `Scenario` - 59 edges
8. `LiveSource` - 59 edges
9. `useLive` - 59 edges
10. `PlantEmulator` - 59 edges

## Surprising Connections (you probably didn't know these)
- `2. Fixed Rules, Timing, and Graph Calculations` --references--> `aggregate()`  [INFERRED]
  PROJECT_EXPLAINED.md → backend/app/detect/detector.py
- `⚡ Layer 2: API & Gateway` --references--> `create_app()`  [INFERRED]
  ARCHIFY_ARCHITECTURE_MAP.md → backend/app/main.py
- `⚡ Layer 2: API & Gateway (FastAPI + Cloudflare Workers)` --references--> `create_app()`  [INFERRED]
  README.md → backend/app/main.py
- `Camera Presets` --references--> `top()`  [INFERRED]
  docs/EV_3D_DESIGN.md → backend/tests/test_ties.py
- `Milestone 4: Dual-Mode Integration & UI Refinement` --references--> `EvCanvas()`  [INFERRED]
  docs/EV_PROGRESS.md → frontend/src/features/ev/3d/EvCanvas.tsx

## Import Cycles
- None detected.

## Communities (153 total, 32 thin omitted)

### Community 0 - "numpy"
Cohesion: 0.05
Nodes (53): is_ambiguous(), origin_candidate(), action_for(), explain(), Explanation, signature(), static_graph(), build_incident() (+45 more)

### Community 1 - "api.ts"
Cohesion: 0.07
Nodes (52): AboutPage, EvWorkspace, MetricsPage, Root(), Route(), SocPage, VoiceSettingsPage, WorkspaceLoading() (+44 more)

### Community 2 - "argparse"
Cohesion: 0.18
Nodes (9): check_identity(), DeploymentError, main(), prepare_storage(), validate(), configured(), test_private_entrypoint_rejects_unsigned_emulator(), test_storage_requires_mount_and_preserves_journal_and_models() (+1 more)

### Community 3 - "GraphParts.tsx"
Cohesion: 0.05
Nodes (78): GraphNode, PlantNode, PlantNodeData, PlantNodeView(), PulseEdgeData, PulseEdgeT, PulseEdgeView(), StageData (+70 more)

### Community 4 - "eval/hai.py"
Cohesion: 0.19
Nodes (15): HaiLoaded, baseline_rank_nodes(), evaluate_detector(), evaluate_localization(), _first_alert(), _prf(), process_scores(), rank_nodes() (+7 more)

### Community 5 - "schemas.py"
Cohesion: 0.09
Nodes (16): topology_of(), Runtime, AttackResponse, CopilotChatRequest, IsolateRequest, IsolateResponse, ModeRequest, OriginCandidate (+8 more)

### Community 6 - "GraphView.tsx"
Cohesion: 0.07
Nodes (38): ThemeSwitcher(), edgeDelay(), edgeId(), layoutEdges(), MIN_LEARNED_WEIGHT, visibleEdges(), filterAssets(), FocusDirection (+30 more)

### Community 7 - "sys"
Cohesion: 0.19
Nodes (8): anonymous_stream_denied(), main(), NoRedirect, origin(), public_streams_available(), read(), require(), main()

### Community 8 - "TagMap"
Cohesion: 0.06
Nodes (5): ModbusPoller, ReadOnlyClient, TagMap, slow_factory(), SlowClient

### Community 9 - "test_gateway.py"
Cohesion: 0.08
Nodes (16): GatewayBoundary, headers(), login(), secured(), test_analyst_decisions_record_verified_actor(), test_login_cookie_membership_and_csrf(), test_logout_invalidates_copied_cookie_and_stream(), test_missing_server_credentials_fail_closed() (+8 more)

### Community 10 - "live.ts"
Cohesion: 0.19
Nodes (20): Btn(), ReplayControls(), Props, Sparkline(), pctX(), Timeline(), usePlayback(), clampIndex() (+12 more)

### Community 11 - "tagmap.py"
Cohesion: 0.09
Nodes (14): assess_layers(), evidence_priority(), alter_response(), frame(), LabProxy, decode(), encode(), Tag (+6 more)

### Community 12 - "app/config.py"
Cohesion: 0.06
Nodes (46): _from_env(), get_settings(), load_baseline(), load_detector(), Loaded, load_graph(), build_engine(), Row (+38 more)

### Community 13 - "source.py"
Cohesion: 0.09
Nodes (9): Aligner, Sample, QualityTracker, _Track, _pct(), SourceStatus, TagHealth, test_aligner_holds_the_last_value_until_max_age() (+1 more)

### Community 14 - "react"
Cohesion: 0.08
Nodes (46): App(), Center(), ViewToggle(), useFreshness(), collapseIcon(), ResizeHandle, ResizeHandleProps, COLLAPSE_KEY (+38 more)

### Community 15 - "test_ev.py"
Cohesion: 0.09
Nodes (26): attack(), AttackBody, chat(), ChatBody, control(), ControlBody, owner(), sessions() (+18 more)

### Community 16 - "TopBar.tsx"
Cohesion: 0.06
Nodes (46): SOURCE_NAMES, TopBar(), MODES, ModeToggle(), Props, html(), SourcePill(), STYLE (+38 more)

### Community 17 - "react"
Cohesion: 0.07
Nodes (54): CopilotAnswer(), HypothesisCard(), InlineText(), Lines(), ParsedSection, parseSections(), SECTION_ICONS, CopilotDrawer() (+46 more)

### Community 18 - "LiveRuntime"
Cohesion: 0.12
Nodes (15): load_live(), LiveRuntime, LiveSource, CalibrationInfo, test_restart_resumes_rows_and_marks_a_gap(), source_with_samples(), test_source_not_ready_until_every_node_was_read(), feed() (+7 more)

### Community 19 - "Rest"
Cohesion: 0.08
Nodes (33): control_hai_replay(), _engine(), get_hai_replay(), get_incident_report(), get_incidents(), get_live_health(), get_metrics(), get_status() (+25 more)

### Community 20 - "test_emulator.py"
Cohesion: 0.16
Nodes (18): TagMapError, client_for(), mutate(), raw_map(), read_values(), run_ticks(), test_a_rogue_setpoint_moves_the_plant(), test_a_sensor_offset_fools_the_controller() (+10 more)

### Community 21 - "test_hai.py"
Cohesion: 0.13
Nodes (17): HaiData, split_tests(), client(), data(), test_detector_metrics_on_a_known_alert_pattern(), test_hai_mode_is_refused_without_data_or_models(), test_hai_playback_controls_pause_without_consuming_rows(), test_hosted_replay_loads_only_test_recording() (+9 more)

### Community 22 - "CalibratingState.tsx"
Cohesion: 0.60
Nodes (3): CalibratingState(), html(), ProgressRing()

### Community 23 - "copilot.py"
Cohesion: 0.12
Nodes (14): bounded_chat(), get_copilot_engine(), get_suggestions(), post_chat(), suggestions(), CopilotChatResponse, test_timed_out_provider_keeps_capacity_until_worker_finishes(), chat() (+6 more)

### Community 24 - "Write"
Cohesion: 0.09
Nodes (22): analyze(), main(), analyze(), main(), analyze(), main(), _pct(), analyze() (+14 more)

### Community 25 - "test_api.py"
Cohesion: 0.19
Nodes (11): client(), test_attack_validation(), test_incidents_and_reset(), test_live_loop_survives_a_failing_tick(), test_metrics(), test_metrics_merges_live_metrics_without_touching_the_file(), test_status_and_mode(), test_topology() (+3 more)

### Community 26 - "time"
Cohesion: 0.16
Nodes (23): digest(), loaded_context(), runtime_context(), LiveMessage, NodeState, SocStore, message(), test_api_export_and_archived_copilot_use_original_capture() (+15 more)

### Community 27 - "react"
Cohesion: 0.09
Nodes (34): NAV_PAGES, AboutPage(), ORIGIN_LAYERS, PROTOTYPE_CAPABILITIES, TEAM_MEMBERS, TeamMember, AssetInspector(), EvidenceList() (+26 more)

### Community 28 - "Grounding"
Cohesion: 0.19
Nodes (21): _build_context_summary(), CopilotEngine, incident_evidence_summary(), _offline_expert_reply(), CopilotTurn, Incident, incident(), snapshot() (+13 more)

### Community 29 - "test_robustness.py"
Cohesion: 0.15
Nodes (18): alert_mask(), rising_edges(), sustained(), assess_calibration(), Case, evaluate_case(), fit_calibration(), probability() (+10 more)

### Community 30 - "gateway/package.json"
Cohesion: 0.17
Nodes (8): error(), fetch(), handle(), origin(), env, fetch(), runtime, miniflare

### Community 31 - "json"
Cohesion: 0.16
Nodes (17): asset_registers(), baseline_comparison(), capture(), detail(), evidence(), export(), journal(), progress() (+9 more)

### Community 32 - "test_emulator.py"
Cohesion: 0.08
Nodes (20): evaluate(), free_port(), emu(), free_port(), test_attack_endpoint_writes_to_the_emulator_and_reveals_ground_truth(), test_attack_refused_while_live_is_calibrating(), test_demo_mode_off_blocks_live_attack_before_the_attacker_is_ever_called(), emu() (+12 more)

### Community 33 - "LiveEngine"
Cohesion: 0.12
Nodes (13): LiveEngine, SourceNotReadyError, make_live(), FakeClock, make_live(), test_live_is_read_only_toward_the_plant(), test_live_messages_have_the_same_schema_as_sim(), test_the_engine_waits_for_the_first_reading() (+5 more)

### Community 34 - "main.py"
Cohesion: 0.21
Nodes (11): hai_models_ready(), load_hai_baseline(), load_hai_detector(), build_hai_engine(), hai_engine(), test_slow_speed_carries_fractions(), test_speed_is_clamped_to_the_supported_range(), speed() (+3 more)

### Community 35 - "attack.ts"
Cohesion: 0.05
Nodes (53): AttackBriefing(), DIRECTION_ICON, PHASE_ICON, PHASE_TONE, ATTACK_LABEL, AttackKind, attacksByNode(), detailFor() (+45 more)

### Community 36 - "BaselineDetector"
Cohesion: 0.08
Nodes (21): attack_run(), Run, sample_attack(), simulate(), BaselineDetector, _val_runs(), main(), Counts (+13 more)

### Community 37 - "engine"
Cohesion: 0.21
Nodes (6): engine(), hai_dir(), hai_models(), make_dataset(), _signals(), _write()

### Community 38 - "pipeline.py"
Cohesion: 0.06
Nodes (35): aggregate(), best_threshold(), fit_err_sd(), ForecastDetector, residuals(), build_model(), GDN, make_windows() (+27 more)

### Community 39 - "classify_language"
Cohesion: 0.08
Nodes (24): classify_language(), detect_unsupported_script(), has_tamil_characters(), is_self_echo(), LanguageClassification, sanitize_response_text(), tokenize_words(), gemini_to_browser() (+16 more)

### Community 40 - "Authentication"
Cohesion: 0.11
Nodes (20): check_origin(), config(), firebase_app(), identity(), logout(), me(), names(), protect() (+12 more)

### Community 41 - "RegisterOverlay"
Cohesion: 0.17
Nodes (3): Controls, RegisterOverlay, load()

### Community 42 - "RateLimiter"
Cohesion: 0.11
Nodes (13): 1. Five-Layer Architecture Map, 2. Layer-by-Layer Breakdown & Source Evidence, 3. End-to-End User Workflows, 4. Authentication, Authorization & Security Flow, AttackTrace: Full Interactive Architecture Map, 🌐 Interactive Visualization Artifacts, 🎨 Layer 1: Frontend, ⚡ Layer 2: API & Gateway (+5 more)

### Community 43 - "lab.py"
Cohesion: 0.14
Nodes (14): configure(), emulator_info(), exclusive(), integrity(), ManifestChange, observe_integrity(), probe(), proxy() (+6 more)

### Community 44 - "HaiEngine"
Cohesion: 0.15
Nodes (6): HaiEngine, _Open, AlertInfo, test_dataset_attack_becomes_an_incident_without_invented_labels(), test_replay_starts_before_the_first_attack_and_follows_the_speed(), test_reset_restarts_the_replay_and_the_replay_loops()

### Community 45 - "Settings"
Cohesion: 0.10
Nodes (15): Settings, read_checkpoint(), source_fingerprint(), write_checkpoint(), LiveConfig, LiveConfigError, build_live_runtime(), test_bad_checkpoint_is_rejected() (+7 more)

### Community 46 - "Package"
Cohesion: 0.08
Nodes (26): name, overrides, @grpc/grpc-js, private, type, version, root, autoprefixer (+18 more)

### Community 47 - "model.ts"
Cohesion: 0.17
Nodes (19): EvCanvasProps, Analysis, AttackConfig, AttackKind, attackLabels, Candidate, Component, Frame (+11 more)

### Community 48 - "main.py"
Cohesion: 0.08
Nodes (20): live_dir(), live_models_ready(), main(), build_state(), build_engine(), check_emulator_down(), check_out_of_range(), check_slow_network() (+12 more)

### Community 49 - "test_isolate.py"
Cohesion: 0.21
Nodes (11): client(), opened(), step_until(), test_isolate_endpoint(), test_isolate_is_409_in_hai_mode_and_needs_the_key(), test_isolating_a_wrong_node_never_contains(), test_isolating_the_true_origin_contains_the_incident(), test_isolation_after_the_attack_ended_is_not_credited() (+3 more)

### Community 50 - "Ev3dScene"
Cohesion: 0.11
Nodes (6): Ev3dScene, radialTexture(), ParticleNetwork, PropagationPathDef, EvViewMode, SubsystemKind

### Community 51 - "ModelRouter"
Cohesion: 0.07
Nodes (26): classify_failure(), Failure, ModelRouter, _retry_after(), _status_code(), gemini_key(), opening_prompt(), process_snapshot() (+18 more)

### Community 52 - "create_app"
Cohesion: 0.15
Nodes (18): create_app(), test_sim_and_hai_attack_paths_are_unaffected(), test_voice_rejects_wrong_demo_key_before_gemini(), test_validation_route_missing_invalid_and_changed_model(), client(), make_client(), test_a_configured_key_still_works_regardless_of_host(), test_attack_endpoint_is_rate_limited() (+10 more)

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

### Community 57 - "Incident"
Cohesion: 0.15
Nodes (22): Access, AccessContext, useAccess(), IsolateButton(), PathChips(), WorkflowPanelProps, BaselineAlarms(), Column() (+14 more)

### Community 58 - "test_live_connectors.py"
Cohesion: 0.09
Nodes (25): ReadError, excluded_from_ranking(), TagSpec, load_tagmap(), lifespan(), test_shipped_tagmap_is_valid_and_complete(), FakeClient, free_port() (+17 more)

### Community 59 - "test_report.py"
Cohesion: 0.14
Nodes (11): _eta(), render_report(), para(), _utc(), ascii_text(), _escape(), Page, text_width() (+3 more)

### Community 60 - "Compileroptions"
Cohesion: 0.11
Nodes (17): compilerOptions, isolatedModules, jsx, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch (+9 more)

### Community 61 - "test_report.py"
Cohesion: 0.18
Nodes (9): worst_impact(), check_structure(), client(), test_impact_snapshot_keeps_the_worst_values(), test_report_endpoint_returns_a_valid_one_page_pdf(), test_report_is_open_without_a_key(), test_report_shows_the_ambiguous_banner_and_breakdown(), test_unknown_incident_is_404() (+1 more)

### Community 62 - "Ev3dScene.ts"
Cohesion: 0.13
Nodes (22): Ev3dSceneOptions, HERO_LOOK, HERO_POS, CAMERAS, MODES, SYSTEMS, createEvMaterials(), EvMaterialBank (+14 more)

### Community 63 - "time"
Cohesion: 0.12
Nodes (16): click_path(), main(), post(), wait_healthy(), fetch(), check(), check_backend_health(), check_console_errors() (+8 more)

### Community 64 - "Engine"
Cohesion: 0.12
Nodes (18): Engine, _has_hazard(), AttackRequest, run_sim_trial(), _open_incident(), run(), test_attack_produces_localized_incident(), test_clean_run_raises_no_incident() (+10 more)

### Community 65 - "EvWorkspace.tsx"
Cohesion: 0.20
Nodes (15): EvAttackDrawer(), EvDock(), EvPilotDock(), IDLE_PROMPTS, INCIDENT_PROMPTS, ORB_LABEL, EvWorkspace(), hrefOf() (+7 more)

### Community 66 - "EvWorkspace.tsx"
Cohesion: 0.24
Nodes (17): EvCanvas(), Chart(), EvData(), SIGNALS, EvAttackLab(), EvCard(), EvEvidence(), EvInspector() (+9 more)

### Community 67 - "MetricsPage.tsx"
Cohesion: 0.07
Nodes (49): BaselineComparison(), Report, Result, chartOption(), getChartColors(), MetricsChart(), Card(), Cards() (+41 more)

### Community 68 - "13. Questions and Answers for Reviewers & Judges"
Cohesion: 0.17
Nodes (12): 13. Questions and Answers for Reviewers & Judges, Q10: What makes this approach novel and useful?, Q11: What still needs improvement?, Q1: What happens when an attack occurs?, Q2: How does it find the likely origin among an alarm flood?, Q3: Why is this approach better than an ordinary alarm?, Q4: What information does AttackTrace need to operate?, Q5: What if the AI's origin prediction is wrong? (+4 more)

### Community 69 - "AttackTrace_Slides.md"
Cohesion: 0.15
Nodes (12): Approach, Architecture, AttackTrace, Detect → Locate → Contain, Limitations, Live demo, Results: real HAI data, Results: real protocol (LIVE) (+4 more)

### Community 70 - "Private-server release plan — 16 October 2026"
Cohesion: 0.06
Nodes (28): Copilot polish and private-server foundation — 16 October 2026, Implemented, Validation and current limits, Activate the selected ADC method, Credentials and access, Deployment and verification still required, Firebase private-server setup — 16 October 2026, What the implementation enforces (+20 more)

### Community 72 - "run.py"
Cohesion: 0.24
Nodes (7): ensure_metrics(), safe_ensure_metrics(), test_a_failing_metrics_step_never_stops_startup(), test_existing_metrics_are_never_overwritten(), test_first_start_writes_metrics_once(), fake(), test_metrics_missing_the_hai_section_are_refreshed_once_data_appears()

### Community 73 - "package.py"
Cohesion: 0.46
Nodes (4): collect(), main(), scan(), wanted()

### Community 74 - "AttackTrace: Project Explained & Comprehensive Presentation Guide"
Cohesion: 0.18
Nodes (10): 4. Features and Screens, 5. System Architecture, 8. Data Modes and Operational Evidence, 9. Implementation Details & File-to-Feature Map, Architecture Diagram, AttackTrace: Project Explained & Comprehensive Presentation Guide, File-to-Feature Map, Folder Structure Overview (+2 more)

### Community 75 - "Screenshots"
Cohesion: 0.35
Nodes (10): ambiguousShot(), { chromium }, errors, haiIncident(), log, require, shot(), simViews() (+2 more)

### Community 76 - "check_host"
Cohesion: 0.17
Nodes (9): allowed_hosts(), AllowlistError, check_host(), is_loopback(), test_allowed_hosts_pass(), test_attacker_client_refuses_to_construct_against_a_bad_host(), test_extra_hosts_come_only_from_the_explicit_allowlist(), test_is_loopback() (+1 more)

### Community 77 - "data/hai.py"
Cohesion: 0.24
Nodes (6): hai_paths(), HaiFile, load_hai(), load_hai_replay(), _read(), _read_csv()

### Community 78 - "Dependencies"
Cohesion: 0.14
Nodes (14): dependencies, echarts, echarts-for-react, firebase, @fontsource/inter, @fontsource/jetbrains-mono, framer-motion, lucide-react (+6 more)

### Community 79 - "record"
Cohesion: 0.27
Nodes (5): Snapshot, LiveRecorder, record(), test_recording_stops_growing_when_full(), test_the_recorder_keeps_only_clean_complete_snapshots()

### Community 80 - "12. Presentation-Ready Content (PowerPoint Slide Deck)"
Cohesion: 0.18
Nodes (11): 12. Presentation-Ready Content (PowerPoint Slide Deck), Slide 10: Conclusion & The Future of Industrial Defense, Slide 1: Title & Executive Summary, Slide 2: The Problem: Invisible Threats to Critical Infrastructure, Slide 3: The Alarm Flood Dilemma, Slide 4: The AttackTrace Solution, Slide 5: System Architecture & Data Modes, Slide 6: Live Case Study: The Tank 1 Level Attack (+3 more)

### Community 81 - "pytest"
Cohesion: 0.17
Nodes (11): test_snapshot_status_and_health_label_stale_and_missing_data(), client(), test_emit_period_never_runs_away(), test_every_offered_speed_is_accepted(), test_fast_demo_shortens_only_the_gap_between_samples(), test_only_sim_may_be_accelerated(), test_pacing_is_refused_outside_sim(), test_pacing_returns_to_normal() (+3 more)

### Community 82 - "AttackSpec"
Cohesion: 0.06
Nodes (40): _Active, AttackEngine, AttackSpec, _fmt_eta(), main(), NoOverlay, Overlay, PID (+32 more)

### Community 84 - "gateway/package.json"
Cohesion: 0.15
Nodes (12): devDependencies, miniflare, engines, node, name, overrides, sharp, undici (+4 more)

### Community 85 - "Screenshots"
Cohesion: 0.24
Nodes (8): { chromium }, errors, liveViews(), log, require, shot(), SIZES, sleep()

### Community 86 - "AI Pilot · Signal Room design plan"
Cohesion: 0.33
Nodes (5): AI Pilot · Signal Room design plan, Design references, Implementation flow, Master idea, Reusable implementation prompt

### Community 87 - "Scripts"
Cohesion: 0.25
Nodes (8): scripts, build, dev, e2e, lint, preview, test, typecheck

### Community 88 - "test_attacker.py"
Cohesion: 0.38
Nodes (10): attacker_for(), read(), test_actuator_force_writes_and_clears_to_no_override(), test_close_cancels_pending_clears(), test_ground_truth_is_recorded_in_the_emulator(), test_invalid_target_and_bad_duration_are_refused(), test_rogue_setpoint_writes_and_clears(), test_sensor_freeze_writes_and_clears() (+2 more)

### Community 90 - "Vercel"
Cohesion: 0.29
Nodes (6): buildCommand, framework, headers, outputDirectory, rewrites, $schema

### Community 91 - "tokens.test.ts"
Cohesion: 0.33
Nodes (4): css, spec, postcss, @tailwindcss/postcss

### Community 92 - "carGeometry.ts"
Cohesion: 0.24
Nodes (11): buildCarGeometry(), CarBodyMeshes, GREENHOUSE, lathe(), loftBody(), LoftOptions, LOWER_BODY, sampleStations() (+3 more)

### Community 93 - "10. Results and Evaluation"
Cohesion: 0.29
Nodes (7): 10. Results and Evaluation, 1. Detection Performance (Evaluated on 50 Attack Runs & 20 Clean Runs), 2. Root-Cause Localization Accuracy, 3. Self-Healing Containment Success, 4. What Performed Well vs. What Performed Poorly, 5. HAI 20.07 Real-World Dataset Results, 6. What These Results Cannot Prove

### Community 94 - "test_live_runtime.py"
Cohesion: 0.13
Nodes (13): IncidentStore, collect(), test_a_data_fault_is_not_an_attack(), test_a_source_that_goes_away_shows_down_not_a_crash(), test_calibration_restart_is_authenticated_and_refuses_an_active_trainer(), test_live_is_unavailable_without_a_source_and_never_crashes(), test_resumed_training_never_builds_windows_across_a_gap(), test_store_only_returns_its_own_mode() (+5 more)

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

### Community 112 - "attacker/cli.py"
Cohesion: 0.39
Nodes (5): main(), parse_args(), run(), load_attacker(), test_cli_rejects_a_non_allowlisted_host()

### Community 114 - "Presenter cheat sheet (one page)"
Cohesion: 0.29
Nodes (6): Click path (SIM), Fast facts if asked, Headline numbers (say the n, not just the %), If LIVE fails mid-demo, If Top-1 is wrong, Presenter cheat sheet (one page)

### Community 115 - "AttackTrace"
Cohesion: 0.09
Nodes (20): 🏛 5-Layer System Architecture (Graphify Mapped), AttackTrace, 📊 Benchmark & Evaluation Results, 🔄 End-to-End Incident Lifecycle, 🗺 Graphify Codebase Navigation, 🎮 Interactive Live Demo Script, 📄 License & Attribution, 🌐 Live Deployments (+12 more)

### Community 116 - "7. AI and Detection Methods"
Cohesion: 0.33
Nodes (6): 1. Machine Learning Forecasting (GDN & MLP), 2. Fixed Rules, Timing, and Graph Calculations, 3. Generative AI: AI Pilot (Google Gemini), 7. AI and Detection Methods, What Confidence Scores Mean (and What They Do Not Mean), What Happens When an AI Service Fails

### Community 117 - "pathlib"
Cohesion: 0.07
Nodes (15): GroundTruth, Scenario, NodeSpec, NodeType, AttackResult, _false_alarm_per_hour(), LiveEvalState, main() (+7 more)

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

### Community 132 - "process_of"
Cohesion: 0.29
Nodes (3): node_kind(), process_of(), test_tag_naming_heuristics()

### Community 133 - "14. Glossary and References"
Cohesion: 0.67
Nodes (3): 14. Glossary and References, Plain-English Glossary, Verified Academic and Industry References

### Community 134 - "6. Technologies and Their Purpose"
Cohesion: 0.67
Nodes (3): 6. Technologies and Their Purpose, Required Runtime vs. Optional / Development Tools, Technology Breakdown Table

### Community 135 - "🔍 Layer-by-Layer Component Breakdown"
Cohesion: 0.33
Nodes (6): 🎨 Layer 1: Frontend (React 19 + TypeScript + Vite), ⚡ Layer 2: API & Gateway (FastAPI + Cloudflare Workers), 🧠 Layer 3: Services & Core Detection Engine, 💾 Layer 4: Storage & Data Persistence, 🏭 Layer 5: External Protocol & Hardware, 🔍 Layer-by-Layer Component Breakdown

### Community 136 - "EV_ARCHITECTURE.md"
Cohesion: 0.12
Nodes (15): 1. Cyber-Physical System (CPS) Modeling, 1. Normalized Residual, 2. Sensor-Controller-Actuator Simulation Loop, 2. Temporal Persistence Filter, 3. Attack Injection Classes, 3. Hypothesis Scoring & Origin Localization, 4. Independent Anomaly Detector & Origin Localization, 4. Normalized Score Share (+7 more)

### Community 139 - "AttackerClient"
Cohesion: 0.18
Nodes (7): AttackerClient, AttackerError, AttackRecord, _neutral(), _surface_tag(), test_a_refused_write_never_reaches_the_emulator(), test_audit_log_has_one_line_per_write()

### Community 140 - "hai_experiments.py"
Cohesion: 0.27
Nodes (4): best_f1(), main(), score(), smooth()

### Community 143 - "1. 5-Minute Live Demonstration Script for Judges"
Cohesion: 0.17
Nodes (11): 1. 5-Minute Live Demonstration Script for Judges, 2. Technical Roadmap for Future Expansion, Phase 1: Real-Time CAN Bus & DBC Decoding, Phase 2: Hardware-in-the-Loop (HIL) Bridge, Phase 3: Physics Expansion & Battery Degradation Modeling, Phase 4: Fleet Telemetry & Swarm Anomaly Detection, Step 1: Open the Workspaces (0:00 - 0:45), Step 2: The Interactive 3D Skateboard Digital Twin (0:45 - 2:00) (+3 more)

### Community 144 - "EV_TEST_RESULTS.md"
Cohesion: 0.18
Nodes (10): 1. Executive Test Scorecard, 2. Backend Pytest Verification, 3. Frontend Vitest Verification, 4. TypeScript Strict Compilation Check, 5. Production Bundle Build Verification, 6. Playwright End-to-End (E2E) Browser Verification, Key Bundle Finding, Test Case Breakdown (+2 more)

### Community 146 - "2. Chronological Milestones & Commits"
Cohesion: 0.20
Nodes (9): 1. Executive Summary, 2. Chronological Milestones & Commits, 3. Verification Summary, 4. Key Architectural Guarantees Verified, Milestone 1: Workspace Baseline & Codex Work Recovery, Milestone 2: 3D Design Iteration 1 & Concept Generation, Milestone 3: 3D Graphics Engine & Three.js Architecture, Milestone 4: Dual-Mode Integration & UI Refinement (+1 more)

### Community 148 - "Iteration 1: 3D Cyber-Physical Operations Command Deck"
Cohesion: 0.20
Nodes (9): 1. AI Reference Generation, 1. Implemented Screenshot vs Reference Critique, 2. Critical Visual & Functional Review, 2. Validation & Verification, 3. Implementation Status, AttackTrace EV 3D Digital Twin — Design Iteration History, Iteration 1: 3D Cyber-Physical Operations Command Deck, Iteration 2: Implementation Review & Design Comparison (+1 more)

### Community 150 - "EV_3D_DESIGN.md"
Cohesion: 0.25
Nodes (7): 1. 3D Scene Architecture & Hierarchy, 2. Component Anatomical Coordinates & Exploded Offsets, 3. Five Interactive Visualization Modes, 4. Camera Controls & Interpolated Transitions, 5. Picking & Interactive State Sync, 6. Performance Optimization & Memory Management, Camera Presets

### Community 151 - "test_journal_backup.py"
Cohesion: 0.33
Nodes (3): test_backup_includes_committed_wal_and_closes_output(), test_backup_refuses_to_replace_existing_data(), backup()

### Community 153 - "EV investigation implementation"
Cohesion: 0.33
Nodes (5): Boundaries, Delivery sequence, EV investigation implementation, Milestone Status & Verification, Product contract

### Community 155 - "EV workspace"
Cohesion: 0.50
Nodes (3): EV workspace, Product direction, Working implementation

## Knowledge Gaps
- **12 isolated node(s):** `attacktrace`, `@types/three`, `echarts`, `echarts-for-react`, `@types/node` (+7 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1153 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **32 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `3.10 LIVE ingestion: a real industrial protocol` connect `incident.render.test.ts` to `AttackSpec`, `Rest`, `test_emulator.py`?**
  _High betweenness centrality (0.376) - this node is a cross-community bridge._
- **Are the 98 inferred relationships involving `Engine` (e.g. with `🧠 Layer 3: Services & Detection Engine` and `_engine()`) actually correct?**
  _`Engine` has 98 INFERRED edges - model-reasoned connections that need verification._
- **What connects `attacktrace`, `@types/three`, `echarts` to the rest of the system?**
  _12 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `numpy` be split into smaller, more focused modules?**
  _Cohesion score 0.05053651782623745 - nodes in this community are weakly interconnected._
- **Are the 34 inferred relationships involving `Settings` (e.g. with `prepare_storage()` and `validate()`) actually correct?**
  _`Settings` has 34 INFERRED edges - model-reasoned connections that need verification._
- **Should `api.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07355769230769231 - nodes in this community are weakly interconnected._
- **Should `GraphParts.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.04868686868686869 - nodes in this community are weakly interconnected._