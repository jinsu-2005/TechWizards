# Graph Report - Attacktrace  (2026-10-27)

## Corpus Check
- 441 files · ~1,689,441 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 58 file(s) not represented in the graph (top: (none) 22, .pt 12, .log 8)

## Summary
- 3406 nodes · 10294 edges · 157 communities (126 shown, 31 thin omitted)
- Extraction: 91% EXTRACTED · 9% INFERRED · 0% AMBIGUOUS · INFERRED: 958 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `cd212e8c`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- numpy
- Root.tsx
- argparse
- geometry.ts
- app/engine.py
- schemas.py
- GraphView.tsx
- main.py
- live/runtime.py
- test_gateway.py
- live.ts
- test_isolate.py
- localization.py
- voice.py
- react
- test_ev.py
- TopBar.tsx
- react
- test_live_runtime.py
- Rest
- graph/__init__.py
- test_hai.py
- lib/types.ts
- copilot.py
- Write
- test_api.py
- time
- types.ts
- Grounding
- test_robustness.py
- gateway/package.json
- json
- test_emulator.py
- Loaded
- verify_ai_models.py
- attack.ts
- BaselineDetector
- evaluate
- pipeline.py
- classify_language
- Authentication
- RegisterOverlay
- RateLimiter
- lab.py
- test_report.py
- hashlib
- Package
- model.ts
- live_soak.py
- IncidentPanel.tsx
- Ev3dScene
- ModelRouter
- create_app
- AttackTrace UI and navigation repair — 16 October 2026
- LIVE calibration fix and next implementation plan
- Devdependencies
- incident.render.test.ts
- Incident
- LiveSource
- test_report.py
- Compileroptions
- GraphView.tsx
- Ev3dScene.ts
- time
- .step_sample
- demo_trials.py
- EvWorkspace.tsx
- MetricsPage.tsx
- 13. Questions and Answers for Reviewers & Judges
- AttackTrace_Slides.md
- Private-server release plan — 16 October 2026
- Settings
- package.py
- AttackTrace: Project Explained & Comprehensive Presentation Guide
- Screenshots
- test_lab_attribution.py
- app/engine.py
- Dependencies
- live_voice.py
- 12. Presentation-Ready Content (PowerPoint Slide Deck)
- test_attacker.py
- AttackSpec
- firebase.ts
- theme.ts
- Screenshots
- AI Pilot · Signal Room design plan
- Scripts
- ev.py
- Test
- Vercel
- tokens.test.ts
- useUi
- 10. Results and Evaluation
- test_sim_speed.py
- Voicecaptureprocessor
- AttackTrace AI Pilot model registry and verification
- Attacktrace
- Incident evidence delivery — 15 October 2026
- AttackTrace: proposed SOC and Twin/Graph enhancement plan
- 3. How the Project Works: The Complete Walkthrough
- hashlib
- VOICE_ASSISTANT.md
- Presenter cheat sheet (one page)
- AttackTrace
- 7. AI and Detection Methods
- live.py
- Demo script (3 minutes)
- QA_Prep.md
- 11. Limitations and Future Improvements
- 1. Project Overview
- index.js
- 2. Problem Statement and Objectives
- python-dependency-audit.json
- test_copilot.py
- geometry.ts
- 14. Glossary and References
- 6. Technologies and Their Purpose
- layout.test.ts
- EV_ARCHITECTURE.md
- load_tagmap
- .launch
- _compute.py
- main.tsx
- ._record_truth
- 1. 5-Minute Live Demonstration Script for Judges
- EV_TEST_RESULTS.md
- build_attacktrace_guide.py
- 2. Chronological Milestones & Commits
- ._advance_incident
- Iteration 1: 3D Cyber-Physical Operations Command Deck
- LiveAttackLauncher
- EV_3D_DESIGN.md
- test_journal_backup.py
- ImpactMeters.tsx
- EV investigation implementation
- 🔍 Layer-by-Layer Component Breakdown
- EV workspace

## God Nodes (most connected - your core abstractions)
1. `Engine` - 145 edges
2. `Settings` - 110 edges
3. `LiveRuntime` - 70 edges
4. `create_app()` - 69 edges
5. `BaselineDetector` - 63 edges
6. `react` - 60 edges
7. `Scenario` - 59 edges
8. `LiveSource` - 59 edges
9. `useLive` - 59 edges
10. `PlantEmulator` - 59 edges

## Surprising Connections (you probably didn't know these)
- `4. Authentication, Authorization & Security Flow` --references--> `RateLimiter`  [INFERRED]
  ARCHIFY_ARCHITECTURE_MAP.md → backend/app/api/security.py
- `2. Fixed Rules, Timing, and Graph Calculations` --references--> `aggregate()`  [INFERRED]
  PROJECT_EXPLAINED.md → backend/app/detect/detector.py
- `⚡ Layer 2: API & Gateway` --references--> `create_app()`  [INFERRED]
  ARCHIFY_ARCHITECTURE_MAP.md → backend/app/main.py
- `⚡ Layer 2: API & Gateway (FastAPI + Cloudflare Workers)` --references--> `create_app()`  [INFERRED]
  README.md → backend/app/main.py
- `Camera Presets` --references--> `top()`  [INFERRED]
  docs/EV_3D_DESIGN.md → backend/tests/test_ties.py

## Import Cycles
- None detected.

## Communities (157 total, 31 thin omitted)

### Community 0 - "numpy"
Cohesion: 0.08
Nodes (39): is_ambiguous(), static_graph(), break_ties(), Candidate, causal_term(), combine_onsets(), deviation_term(), first_crossings() (+31 more)

### Community 1 - "Root.tsx"
Cohesion: 0.12
Nodes (21): AboutPage, EvWorkspace, MetricsPage, Root(), Route(), SocPage, VoiceSettingsPage, WorkspaceLoading() (+13 more)

### Community 2 - "argparse"
Cohesion: 0.11
Nodes (16): check_identity(), DeploymentError, main(), prepare_storage(), validate(), configured(), test_private_entrypoint_rejects_unsigned_emulator(), test_storage_requires_mount_and_preserves_journal_and_models() (+8 more)

### Community 3 - "geometry.ts"
Cohesion: 0.12
Nodes (32): NodeAttack, NOMINAL_SETPOINT, ATTACK_STROKE, AttackChip(), BandProps, ChipProps, DriftMark(), DriftProps (+24 more)

### Community 4 - "app/engine.py"
Cohesion: 0.11
Nodes (8): HaiEngine, _Open, origin_candidate(), OriginCandidate, test_dataset_attack_becomes_an_incident_without_invented_labels(), test_replay_starts_before_the_first_attack_and_follows_the_speed(), test_reset_restarts_the_replay_and_the_replay_loops(), test_suspect_needs_both_a_high_score_and_a_departure_from_the_nodes_own_normal()

### Community 5 - "schemas.py"
Cohesion: 0.08
Nodes (17): topology_of(), Runtime, AlertInfo, AttackResponse, CopilotChatRequest, GroundTruthInfo, IsolateRequest, IsolateResponse (+9 more)

### Community 6 - "GraphView.tsx"
Cohesion: 0.15
Nodes (22): edgeDelay(), edgeId(), layoutEdges(), MIN_LEARNED_WEIGHT, visibleEdges(), filterAssets(), FocusDirection, graphLinks() (+14 more)

### Community 7 - "main.py"
Cohesion: 0.09
Nodes (22): _from_env(), get_settings(), load_baseline(), load_detector(), load_graph(), live_dir(), live_models_ready(), main() (+14 more)

### Community 8 - "live/runtime.py"
Cohesion: 0.07
Nodes (10): read_checkpoint(), source_fingerprint(), write_checkpoint(), LiveConfig, ModbusPoller, ReadOnlyClient, TagMap, test_bad_checkpoint_is_rejected() (+2 more)

### Community 9 - "test_gateway.py"
Cohesion: 0.08
Nodes (16): GatewayBoundary, headers(), login(), secured(), test_analyst_decisions_record_verified_actor(), test_login_cookie_membership_and_csrf(), test_logout_invalidates_copied_cookie_and_stream(), test_missing_server_credentials_fail_closed() (+8 more)

### Community 10 - "live.ts"
Cohesion: 0.13
Nodes (28): Btn(), ReplayControls(), Props, Sparkline(), pctX(), Timeline(), usePlayback(), clampIndex() (+20 more)

### Community 11 - "test_isolate.py"
Cohesion: 0.21
Nodes (11): client(), opened(), step_until(), test_isolate_endpoint(), test_isolate_is_409_in_hai_mode_and_needs_the_key(), test_isolating_a_wrong_node_never_contains(), test_isolating_the_true_origin_contains_the_incident(), test_isolation_after_the_attack_ended_is_not_credited() (+3 more)

### Community 12 - "localization.py"
Cohesion: 0.12
Nodes (23): attack_run(), Run, sample_attack(), _val_runs(), build_incident(), Weights, Row, rows() (+15 more)

### Community 13 - "voice.py"
Cohesion: 0.13
Nodes (13): _is_loopback(), limit_attacks(), require_demo(), require_key(), capabilities(), _interaction(), _key(), _limit() (+5 more)

### Community 14 - "react"
Cohesion: 0.10
Nodes (36): App(), Center(), ViewToggle(), useFreshness(), useLiveSourcePoll(), collapseIcon(), ResizeHandle, ResizeHandleProps (+28 more)

### Community 15 - "test_ev.py"
Cohesion: 0.11
Nodes (16): Sessions, evidence_reply(), EvPilot, tools(), Detector, EvRuntime, topology(), client() (+8 more)

### Community 16 - "TopBar.tsx"
Cohesion: 0.09
Nodes (34): SOURCE_NAMES, TopBar(), narrated, topoIndex, topologyIndex(), useLiveStream(), SourcePill(), STYLE (+26 more)

### Community 17 - "react"
Cohesion: 0.07
Nodes (48): CopilotAnswer(), HypothesisCard(), InlineText(), Lines(), ParsedSection, parseSections(), SECTION_ICONS, CopilotDrawer() (+40 more)

### Community 18 - "test_live_runtime.py"
Cohesion: 0.05
Nodes (40): Hub, run_loop(), load_live(), build_live_runtime(), LiveRuntime, LiveSource, Snapshot, IncidentStore (+32 more)

### Community 19 - "Rest"
Cohesion: 0.12
Nodes (24): control_hai_replay(), _engine(), get_hai_replay(), get_incident_report(), get_incidents(), get_live_health(), get_metrics(), get_status() (+16 more)

### Community 20 - "graph/__init__.py"
Cohesion: 0.14
Nodes (9): adjacency(), learn_granger_edges(), learn_var_edges(), learned_graph(), merge_graph(), test_adjacency_lists_parents(), test_granger_finds_lagged_cause(), test_merge_keeps_static_and_downweights_learned() (+1 more)

### Community 21 - "test_hai.py"
Cohesion: 0.05
Nodes (51): hai_paths(), HaiData, HaiFile, load_hai(), load_hai_replay(), node_kind(), process_of(), _read() (+43 more)

### Community 22 - "lib/types.ts"
Cohesion: 0.08
Nodes (29): MODES, ModeToggle(), Props, html(), Access, AccessContext, useAccess(), EvidenceList() (+21 more)

### Community 23 - "copilot.py"
Cohesion: 0.20
Nodes (8): bounded_chat(), get_copilot_engine(), get_suggestions(), post_chat(), suggestions(), CopilotChatResponse, test_timed_out_provider_keeps_capacity_until_worker_finishes(), chat()

### Community 24 - "Write"
Cohesion: 0.11
Nodes (15): analyze(), main(), analyze(), main(), analyze(), main(), _pct(), analyze() (+7 more)

### Community 25 - "test_api.py"
Cohesion: 0.11
Nodes (17): create_app(), client(), test_attack_validation(), test_incidents_and_reset(), test_live_loop_survives_a_failing_tick(), test_metrics(), test_metrics_merges_live_metrics_without_touching_the_file(), test_status_and_mode() (+9 more)

### Community 26 - "time"
Cohesion: 0.21
Nodes (21): runtime_context(), LiveMessage, NodeState, SocStore, message(), test_api_export_and_archived_copilot_use_original_capture(), test_capture_integrity_failure_never_returns_modified_payload(), test_capture_is_immutable_survives_reopen_and_telemetry_rotation() (+13 more)

### Community 27 - "types.ts"
Cohesion: 0.13
Nodes (31): AssetInspector(), GraphView, LabStatus, LocalLab(), MobileIncidentCards(), AssetTypeBadge(), SEV_CFG, SevBadge() (+23 more)

### Community 28 - "Grounding"
Cohesion: 0.14
Nodes (23): _build_context_summary(), CopilotEngine, incident_evidence_summary(), local_checks(), _offline_expert_reply(), CopilotTurn, Incident, PathStep (+15 more)

### Community 29 - "test_robustness.py"
Cohesion: 0.23
Nodes (14): assess_calibration(), fit_calibration(), probability(), reliability(), run(), summarize(), varied(), row() (+6 more)

### Community 30 - "gateway/package.json"
Cohesion: 0.08
Nodes (20): devDependencies, miniflare, engines, node, name, overrides, sharp, undici (+12 more)

### Community 31 - "json"
Cohesion: 0.19
Nodes (15): asset_registers(), baseline_comparison(), capture(), detail(), evidence(), export(), journal(), progress() (+7 more)

### Community 32 - "test_emulator.py"
Cohesion: 0.12
Nodes (25): emu(), free_port(), test_attack_endpoint_writes_to_the_emulator_and_reveals_ground_truth(), test_attack_refused_while_live_is_calibrating(), test_demo_mode_off_blocks_live_attack_before_the_attacker_is_ever_called(), client_for(), emu(), free_port() (+17 more)

### Community 33 - "Loaded"
Cohesion: 0.14
Nodes (10): Loaded, LiveEngine, SourceNotReadyError, make_live(), make_live(), test_a_sim_attack_is_found_through_the_live_path(), test_end_to_end_with_the_emulator(), test_live_is_read_only_toward_the_plant() (+2 more)

### Community 34 - "verify_ai_models.py"
Cohesion: 0.18
Nodes (8): gemini_key(), _get_gemini_key(), _audio(), _interaction(), _live_check(), _result(), _speech_body(), verify()

### Community 35 - "attack.ts"
Cohesion: 0.05
Nodes (48): DIRECTION_ICON, PHASE_ICON, PHASE_TONE, ATTACK_LABEL, AttackKind, attacksByNode(), detailFor(), fmt() (+40 more)

### Community 36 - "BaselineDetector"
Cohesion: 0.15
Nodes (8): BaselineDetector, baseline_rank(), evaluate_baseline_localization(), fitted(), test_baseline_saved_before_names_existed_still_works(), test_missed_attacks_count_as_misses(), test_rank_breaks_ties_by_larger_deviation(), test_rank_puts_the_first_breaching_node_first()

### Community 37 - "evaluate"
Cohesion: 0.18
Nodes (7): analyze(), main(), _pct(), Counts, evaluate(), _onsets(), run_detection()

### Community 38 - "pipeline.py"
Cohesion: 0.06
Nodes (31): simulate(), aggregate(), best_threshold(), fit_err_sd(), ForecastDetector, residuals(), build_model(), GDN (+23 more)

### Community 39 - "classify_language"
Cohesion: 0.13
Nodes (15): classify_language(), detect_unsupported_script(), has_tamil_characters(), is_self_echo(), LanguageClassification, sanitize_response_text(), tokenize_words(), gemini_to_browser() (+7 more)

### Community 40 - "Authentication"
Cohesion: 0.20
Nodes (13): check_origin(), config(), firebase_app(), identity(), logout(), me(), names(), protect() (+5 more)

### Community 41 - "RegisterOverlay"
Cohesion: 0.12
Nodes (3): Controls, RegisterOverlay, load()

### Community 42 - "RateLimiter"
Cohesion: 0.17
Nodes (11): 1. Five-Layer Architecture Map, 2. Layer-by-Layer Breakdown & Source Evidence, 3. End-to-End User Workflows, 4. Authentication, Authorization & Security Flow, AttackTrace: Full Interactive Architecture Map, 🌐 Interactive Visualization Artifacts, 🎨 Layer 1: Frontend, ⚡ Layer 2: API & Gateway (+3 more)

### Community 43 - "lab.py"
Cohesion: 0.08
Nodes (19): configure(), emulator_info(), exclusive(), integrity(), ManifestChange, observe_integrity(), probe(), proxy() (+11 more)

### Community 44 - "test_report.py"
Cohesion: 0.17
Nodes (10): worst_impact(), Impact, check_structure(), client(), test_impact_snapshot_keeps_the_worst_values(), test_report_endpoint_returns_a_valid_one_page_pdf(), test_report_is_open_without_a_key(), test_report_shows_the_ambiguous_banner_and_breakdown() (+2 more)

### Community 45 - "hashlib"
Cohesion: 0.26
Nodes (5): make_dataset(), _signals(), _write(), get_json(), main()

### Community 46 - "Package"
Cohesion: 0.09
Nodes (23): name, overrides, @grpc/grpc-js, private, type, version, autoprefixer, echarts (+15 more)

### Community 47 - "model.ts"
Cohesion: 0.13
Nodes (22): EvCanvasProps, positions, Analysis, AttackConfig, AttackKind, attackLabels, Candidate, Component (+14 more)

### Community 48 - "live_soak.py"
Cohesion: 0.08
Nodes (19): AttackerClient, load_attacker(), live(), build_engine(), check_emulator_down(), check_out_of_range(), check_slow_network(), _free_port() (+11 more)

### Community 49 - "IncidentPanel.tsx"
Cohesion: 0.12
Nodes (26): AttackBriefing(), AttackConsole(), nextSpeed(), SPEEDS, HaiReplayPanel(), offset(), MagnitudeField(), Props (+18 more)

### Community 50 - "Ev3dScene"
Cohesion: 0.16
Nodes (5): Ev3dScene, EvCanvas(), ParticleNetwork, EvViewMode, SubsystemKind

### Community 51 - "ModelRouter"
Cohesion: 0.18
Nodes (11): classify_failure(), Failure, ModelRouter, _retry_after(), _status_code(), test_live_greeting_states_only_observed_status(), test_model_pool_rejects_cross_modality(), test_preferred_model_fails_over_after_rate_limit() (+3 more)

### Community 52 - "create_app"
Cohesion: 0.15
Nodes (16): RateLimiter, client(), make_client(), test_a_configured_key_still_works_regardless_of_host(), test_attack_endpoint_is_rate_limited(), test_demo_mode_off_blocks_attacks_only(), test_loopback_variants_all_count_as_loopback(), test_no_key_configured_leaves_writes_open() (+8 more)

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
Cohesion: 0.20
Nodes (18): IsolateButton(), BaselineAlarms(), Column(), SplitView(), Trace(), postIsolate(), isActive(), advance() (+10 more)

### Community 58 - "LiveSource"
Cohesion: 0.07
Nodes (24): Aligner, Sample, excluded_from_ranking(), QualityTracker, TagSpec, _Track, _pct(), SourceStatus (+16 more)

### Community 59 - "test_report.py"
Cohesion: 0.16
Nodes (10): _eta(), render_report(), para(), _utc(), ascii_text(), _escape(), Page, text_width() (+2 more)

### Community 60 - "Compileroptions"
Cohesion: 0.11
Nodes (17): compilerOptions, isolatedModules, jsx, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch (+9 more)

### Community 61 - "GraphView.tsx"
Cohesion: 0.14
Nodes (23): GraphNode, PlantNode, PlantNodeData, PlantNodeView(), PulseEdgeData, PulseEdgeT, PulseEdgeView(), StageData (+15 more)

### Community 62 - "Ev3dScene.ts"
Cohesion: 0.21
Nodes (15): buildCarGeometry(), CarBodyMeshes, Ev3dSceneOptions, createEvMaterials(), EvMaterialBank, PropagationPathDef, buildSubsystemsGeometry(), ComponentObjectMap (+7 more)

### Community 63 - "time"
Cohesion: 0.08
Nodes (17): main(), click_path(), main(), post(), wait_healthy(), fetch(), check(), check_backend_health() (+9 more)

### Community 64 - ".step_sample"
Cohesion: 0.12
Nodes (16): Engine, _has_hazard(), AttackRequest, _open_incident(), run(), test_attack_produces_localized_incident(), test_clean_run_raises_no_incident(), test_detector_is_warm_before_the_first_message() (+8 more)

### Community 65 - "demo_trials.py"
Cohesion: 0.28
Nodes (11): build_report(), main(), pair_key(), _pick_primary_backup(), _rank(), run_live(), run_sim(), run_sim_trial() (+3 more)

### Community 66 - "EvWorkspace.tsx"
Cohesion: 0.31
Nodes (19): EvAttackLab(), EvCard(), EvEvidence(), EvInspector(), EvLocalization(), EvPilotPanel(), EvTwin(), DrivingProfile() (+11 more)

### Community 67 - "MetricsPage.tsx"
Cohesion: 0.07
Nodes (50): EmptyState(), BaselineComparison(), Report, Result, chartOption(), getChartColors(), MetricsChart(), Card() (+42 more)

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
Cohesion: 0.13
Nodes (12): Settings, LiveConfigError, ensure_metrics(), safe_ensure_metrics(), test_bad_config_fails_fast_with_a_clear_message(), test_missing_or_broken_tagmap_is_a_config_error(), test_calibration_does_not_accept_subminimum_or_infinite_recordings(), test_a_failing_metrics_step_never_stops_startup() (+4 more)

### Community 73 - "package.py"
Cohesion: 0.46
Nodes (4): collect(), main(), scan(), wanted()

### Community 74 - "AttackTrace: Project Explained & Comprehensive Presentation Guide"
Cohesion: 0.18
Nodes (10): 4. Features and Screens, 5. System Architecture, 8. Data Modes and Operational Evidence, 9. Implementation Details & File-to-Feature Map, Architecture Diagram, AttackTrace: Project Explained & Comprehensive Presentation Guide, File-to-Feature Map, Folder Structure Overview (+2 more)

### Community 75 - "Screenshots"
Cohesion: 0.35
Nodes (10): ambiguousShot(), { chromium }, errors, haiIncident(), log, require, shot(), simViews() (+2 more)

### Community 76 - "test_lab_attribution.py"
Cohesion: 0.08
Nodes (17): assess_layers(), evidence_priority(), alter_response(), frame(), LabProxy, decode(), encode(), Tag (+9 more)

### Community 77 - "app/engine.py"
Cohesion: 0.05
Nodes (23): GroundTruth, action_for(), explain(), Explanation, signature(), Incident, _cost(), hop_distance() (+15 more)

### Community 78 - "Dependencies"
Cohesion: 0.14
Nodes (14): dependencies, echarts, echarts-for-react, firebase, @fontsource/inter, @fontsource/jetbrains-mono, framer-motion, lucide-react (+6 more)

### Community 79 - "live_voice.py"
Cohesion: 0.13
Nodes (10): _authenticate(), connect_model(), live_voice(), browser_to_gemini(), opening_prompt(), process_snapshot(), session_config(), test_live_extended_thinking_has_required_configuration() (+2 more)

### Community 80 - "12. Presentation-Ready Content (PowerPoint Slide Deck)"
Cohesion: 0.18
Nodes (11): 12. Presentation-Ready Content (PowerPoint Slide Deck), Slide 10: Conclusion & The Future of Industrial Defense, Slide 1: Title & Executive Summary, Slide 2: The Problem: Invisible Threats to Critical Infrastructure, Slide 3: The Alarm Flood Dilemma, Slide 4: The AttackTrace Solution, Slide 5: System Architecture & Data Modes, Slide 6: Live Case Study: The Tank 1 Level Attack (+3 more)

### Community 81 - "test_attacker.py"
Cohesion: 0.11
Nodes (25): allowed_hosts(), AllowlistError, check_host(), is_loopback(), main(), parse_args(), run(), Scenario (+17 more)

### Community 82 - "AttackSpec"
Cohesion: 0.08
Nodes (35): _Active, AttackEngine, AttackSpec, _fmt_eta(), main(), PID, _clip(), Plant (+27 more)

### Community 84 - "theme.ts"
Cohesion: 0.26
Nodes (8): ThemeSwitcher(), applyTheme(), getInitialTheme(), ThemeId, ThemeMeta, THEMES, ThemeState, useTheme

### Community 85 - "Screenshots"
Cohesion: 0.27
Nodes (8): { chromium }, errors, liveViews(), log, require, shot(), SIZES, sleep()

### Community 86 - "AI Pilot · Signal Room design plan"
Cohesion: 0.33
Nodes (5): AI Pilot · Signal Room design plan, Design references, Implementation flow, Master idea, Reusable implementation prompt

### Community 87 - "Scripts"
Cohesion: 0.25
Nodes (8): scripts, build, dev, e2e, lint, preview, test, typecheck

### Community 88 - "ev.py"
Cohesion: 0.24
Nodes (10): attack(), AttackBody, chat(), ChatBody, control(), ControlBody, owner(), sessions() (+2 more)

### Community 90 - "Vercel"
Cohesion: 0.29
Nodes (6): buildCommand, framework, headers, outputDirectory, rewrites, $schema

### Community 91 - "tokens.test.ts"
Cohesion: 0.14
Nodes (10): css, spec, postcss, @tailwindcss/postcss, file, root, settingsFile, manifest (+2 more)

### Community 92 - "useUi"
Cohesion: 0.20
Nodes (13): IncidentProgress(), ResponseEvent, GraphView, ProcessWorkspace(), stateAtDetection(), TwinView(), TwinViewProps, useModalFocus() (+5 more)

### Community 93 - "10. Results and Evaluation"
Cohesion: 0.29
Nodes (7): 10. Results and Evaluation, 1. Detection Performance (Evaluated on 50 Attack Runs & 20 Clean Runs), 2. Root-Cause Localization Accuracy, 3. Self-Healing Containment Success, 4. What Performed Well vs. What Performed Poorly, 5. HAI 20.07 Real-World Dataset Results, 6. What These Results Cannot Prove

### Community 94 - "test_sim_speed.py"
Cohesion: 0.16
Nodes (13): emit_period(), Status, test_attacker_client_refuses_to_construct_against_a_bad_host(), client(), test_emit_period_never_runs_away(), test_every_offered_speed_is_accepted(), test_fast_demo_shortens_only_the_gap_between_samples(), test_only_sim_may_be_accelerated() (+5 more)

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
Cohesion: 0.09
Nodes (20): 🏛 5-Layer System Architecture (Graphify Mapped), AttackTrace, 📊 Benchmark & Evaluation Results, 🔄 End-to-End Incident Lifecycle, 🗺 Graphify Codebase Navigation, 🎮 Interactive Live Demo Script, 📄 License & Attribution, 🌐 Live Deployments (+12 more)

### Community 116 - "7. AI and Detection Methods"
Cohesion: 0.33
Nodes (6): 1. Machine Learning Forecasting (GDN & MLP), 2. Fixed Rules, Timing, and Graph Calculations, 3. Generative AI: AI Pilot (Google Gemini), 7. AI and Detection Methods, What Confidence Scores Mean (and What They Do Not Mean), What Happens When an AI Service Fails

### Community 117 - "live.py"
Cohesion: 0.22
Nodes (11): AttackResult, _false_alarm_per_hour(), LiveEvalState, main(), _pct(), _prf(), _rising_edges(), run() (+3 more)

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

### Community 131 - "test_copilot.py"
Cohesion: 0.31
Nodes (6): client(), test_copilot_chat(), test_copilot_suggestions(), test_no_active_incident_has_no_action(), test_unknown_requested_incident_returns_404(), test_virtual_sensor_isolation()

### Community 132 - "geometry.ts"
Cohesion: 0.20
Nodes (13): CHAR_W, Edge, flowDuration(), flowRatio(), Link, LINKS, pulseDelay(), TEXT (+5 more)

### Community 133 - "14. Glossary and References"
Cohesion: 0.67
Nodes (3): 14. Glossary and References, Plain-English Glossary, Verified Academic and Industry References

### Community 134 - "6. Technologies and Their Purpose"
Cohesion: 0.67
Nodes (3): 6. Technologies and Their Purpose, Required Runtime vs. Optional / Development Tools, Technology Breakdown Table

### Community 135 - "layout.test.ts"
Cohesion: 0.29
Nodes (6): LayoutEdge, Pos, processOf(), edges, IDS, PID

### Community 136 - "EV_ARCHITECTURE.md"
Cohesion: 0.12
Nodes (15): 1. Cyber-Physical System (CPS) Modeling, 1. Normalized Residual, 2. Sensor-Controller-Actuator Simulation Loop, 2. Temporal Persistence Filter, 3. Attack Injection Classes, 3. Hypothesis Scoring & Origin Localization, 4. Independent Anomaly Detector & Origin Localization, 4. Normalized Score Share (+7 more)

### Community 137 - "load_tagmap"
Cohesion: 0.10
Nodes (15): ReadError, load_tagmap(), TagMapError, mutate(), raw_map(), test_invalid_tagmaps_are_rejected(), test_load_reports_readable_errors(), test_shipped_tagmap_is_valid_and_complete() (+7 more)

### Community 139 - ".launch"
Cohesion: 0.24
Nodes (5): AttackerError, AttackRecord, _neutral(), _surface_tag(), test_audit_log_has_one_line_per_write()

### Community 140 - "_compute.py"
Cohesion: 0.11
Nodes (13): alert_mask(), rising_edges(), sustained(), HaiForward, sim_forward(), SimForward, best_f1(), score() (+5 more)

### Community 141 - "main.tsx"
Cohesion: 0.40
Nodes (3): root, @fontsource/inter, @fontsource/jetbrains-mono

### Community 143 - "1. 5-Minute Live Demonstration Script for Judges"
Cohesion: 0.17
Nodes (11): 1. 5-Minute Live Demonstration Script for Judges, 2. Technical Roadmap for Future Expansion, Phase 1: Real-Time CAN Bus & DBC Decoding, Phase 2: Hardware-in-the-Loop (HIL) Bridge, Phase 3: Physics Expansion & Battery Degradation Modeling, Phase 4: Fleet Telemetry & Swarm Anomaly Detection, Step 1: Open the Workspaces (0:00 - 0:45), Step 2: The Interactive 3D Skateboard Digital Twin (0:45 - 2:00) (+3 more)

### Community 144 - "EV_TEST_RESULTS.md"
Cohesion: 0.18
Nodes (10): 1. Executive Test Scorecard, 2. Backend Pytest Verification, 3. Frontend Vitest Verification, 4. TypeScript Strict Compilation Check, 5. Production Bundle Build Verification, 6. Playwright End-to-End (E2E) Browser Verification, Key Bundle Finding, Test Case Breakdown (+2 more)

### Community 145 - "build_attacktrace_guide.py"
Cohesion: 0.24
Nodes (3): base(), draw_text(), wrap()

### Community 146 - "2. Chronological Milestones & Commits"
Cohesion: 0.20
Nodes (9): 1. Executive Summary, 2. Chronological Milestones & Commits, 3. Verification Summary, 4. Key Architectural Guarantees Verified, Milestone 1: Workspace Baseline & Codex Work Recovery, Milestone 2: 3D Design Iteration 1 & Concept Generation, Milestone 3: 3D Graphics Engine & Three.js Architecture, Milestone 4: Dual-Mode Integration & UI Refinement (+1 more)

### Community 148 - "Iteration 1: 3D Cyber-Physical Operations Command Deck"
Cohesion: 0.22
Nodes (8): 1. AI Reference Generation, 1. Implemented Screenshot vs Reference Critique, 2. Critical Visual & Functional Review, 2. Validation & Verification, 3. Implementation Status, AttackTrace EV 3D Digital Twin — Design Iteration History, Iteration 1: 3D Cyber-Physical Operations Command Deck, Iteration 2: Implementation Review & Design Comparison

### Community 150 - "EV_3D_DESIGN.md"
Cohesion: 0.25
Nodes (7): 1. 3D Scene Architecture & Hierarchy, 2. Component Anatomical Coordinates & Exploded Offsets, 3. Five Interactive Visualization Modes, 4. Camera Controls & Interpolated Transitions, 5. Picking & Interactive State Sync, 6. Performance Optimization & Memory Management, Camera Presets

### Community 151 - "test_journal_backup.py"
Cohesion: 0.43
Nodes (3): test_backup_includes_committed_wal_and_closes_output(), test_backup_refuses_to_replace_existing_data(), backup()

### Community 152 - "ImpactMeters.tsx"
Cohesion: 0.48
Nodes (6): ImpactMeters(), Meter(), tone(), etaUrgency(), formatEta(), Impact

### Community 153 - "EV investigation implementation"
Cohesion: 0.33
Nodes (5): Boundaries, Delivery sequence, EV investigation implementation, Milestone Status & Verification, Product contract

### Community 154 - "🔍 Layer-by-Layer Component Breakdown"
Cohesion: 0.33
Nodes (6): 🎨 Layer 1: Frontend (React 19 + TypeScript + Vite), ⚡ Layer 2: API & Gateway (FastAPI + Cloudflare Workers), 🧠 Layer 3: Services & Core Detection Engine, 💾 Layer 4: Storage & Data Persistence, 🏭 Layer 5: External Protocol & Hardware, 🔍 Layer-by-Layer Component Breakdown

### Community 155 - "EV workspace"
Cohesion: 0.50
Nodes (3): EV workspace, Product direction, Working implementation

## Knowledge Gaps
- **12 isolated node(s):** `attacktrace`, `@types/three`, `echarts`, `echarts-for-react`, `@types/node` (+7 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1145 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **31 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `3.10 LIVE ingestion: a real industrial protocol` connect `incident.render.test.ts` to `live_soak.py`, `AttackSpec`, `test_emulator.py`?**
  _High betweenness centrality (0.362) - this node is a cross-community bridge._
- **Are the 98 inferred relationships involving `Engine` (e.g. with `🧠 Layer 3: Services & Detection Engine` and `_engine()`) actually correct?**
  _`Engine` has 98 INFERRED edges - model-reasoned connections that need verification._
- **What connects `attacktrace`, `@types/three`, `echarts` to the rest of the system?**
  _12 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `numpy` be split into smaller, more focused modules?**
  _Cohesion score 0.08365384615384615 - nodes in this community are weakly interconnected._
- **Are the 34 inferred relationships involving `Settings` (e.g. with `prepare_storage()` and `validate()`) actually correct?**
  _`Settings` has 34 INFERRED edges - model-reasoned connections that need verification._
- **Should `Root.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.11822660098522167 - nodes in this community are weakly interconnected._
- **Should `argparse` be split into smaller, more focused modules?**
  _Cohesion score 0.11088709677419355 - nodes in this community are weakly interconnected._