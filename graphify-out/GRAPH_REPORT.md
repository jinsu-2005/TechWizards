# Graph Report - Attacktrace  (2026-10-27)

## Corpus Check
- 437 files · ~1,255,372 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 58 file(s) not represented in the graph (top: (none) 22, .pt 12, .log 8)

## Summary
- 3413 nodes · 10313 edges · 149 communities (118 shown, 31 thin omitted)
- Extraction: 91% EXTRACTED · 9% INFERRED · 0% AMBIGUOUS · INFERRED: 959 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `45547d3a`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- numpy
- api.ts
- argparse
- geometry.ts
- eval/hai.py
- app/engine.py
- GraphView.tsx
- sys
- live/runtime.py
- test_gateway.py
- live.ts
- localize/incident.py
- localization.py
- voice.py
- react
- test_ev.py
- TopBar.tsx
- react
- LiveRuntime
- Rest
- graph/__init__.py
- test_hai.py
- vitest
- copilot.py
- Write
- test_api.py
- time
- useUi
- Grounding
- test_robustness.py
- gateway/package.json
- json
- test_emulator.py
- Settings
- train_hai
- attack.ts
- test_eval_baseline.py
- numpy
- pipeline.py
- classify_language
- Authentication
- Scenario
- RateLimiter
- lab.py
- RobustnessPanel.tsx
- json
- Package
- model.ts
- main.py
- lib/types.ts
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
- reconstruct
- Ev3dScene.ts
- time
- Engine
- demo_trials.py
- EvWorkspace.tsx
- metrics.ts
- 13. Questions and Answers for Reviewers & Judges
- AttackTrace_Slides.md
- Private-server release plan — 16 October 2026
- run.py
- package.py
- AttackTrace: Project Explained & Comprehensive Presentation Guide
- Screenshots
- sim/__init__.py
- Dependencies
- live_voice.py
- 12. Presentation-Ready Content (PowerPoint Slide Deck)
- pytest
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
- carGeometry.ts
- 10. Results and Evaluation
- IncidentStore
- Voicecaptureprocessor
- AttackTrace AI Pilot model registry and verification
- Attacktrace
- Incident evidence delivery — 15 October 2026
- AttackTrace: proposed SOC and Twin/Graph enhancement plan
- 3. How the Project Works: The Complete Walkthrough
- app/runtime.py
- VOICE_ASSISTANT.md
- Presenter cheat sheet (one page)
- AttackTrace
- 7. AI and Detection Methods
- train.py
- Demo script (3 minutes)
- QA_Prep.md
- 11. Limitations and Future Improvements
- 1. Project Overview
- index.js
- 2. Problem Statement and Objectives
- python-dependency-audit.json
- test_copilot.py
- MLPForecaster
- 14. Glossary and References
- 6. Technologies and Their Purpose
- EV_ARCHITECTURE.md
- AttackerClient
- hai_pipeline.py
- main.tsx
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

## Communities (149 total, 31 thin omitted)

### Community 0 - "numpy"
Cohesion: 0.07
Nodes (39): is_ambiguous(), static_graph(), break_ties(), Candidate, causal_term(), combine_onsets(), deviation_term(), first_crossings() (+31 more)

### Community 1 - "api.ts"
Cohesion: 0.06
Nodes (58): AboutPage, EvWorkspace, MetricsPage, Root(), Route(), SocPage, VoiceSettingsPage, WorkspaceLoading() (+50 more)

### Community 2 - "argparse"
Cohesion: 0.19
Nodes (9): check_identity(), DeploymentError, main(), prepare_storage(), validate(), configured(), test_private_entrypoint_rejects_unsigned_emulator(), test_storage_requires_mount_and_preserves_journal_and_models() (+1 more)

### Community 3 - "geometry.ts"
Cohesion: 0.09
Nodes (43): NodeAttack, ATTACK_STROKE, AttackChip(), BandProps, ChipProps, DriftMark(), DriftProps, ForcedProps (+35 more)

### Community 4 - "eval/hai.py"
Cohesion: 0.12
Nodes (15): rising_edges(), HaiLoaded, load_hai_detector(), baseline_rank_nodes(), evaluate_detector(), evaluate_localization(), _first_alert(), _prf() (+7 more)

### Community 5 - "app/engine.py"
Cohesion: 0.07
Nodes (25): HaiEngine, _Open, origin_candidate(), topology_of(), AlertInfo, AttackResponse, CalibrationInfo, CopilotChatRequest (+17 more)

### Community 6 - "GraphView.tsx"
Cohesion: 0.06
Nodes (51): edgeDelay(), edgeId(), layoutEdges(), MIN_LEARNED_WEIGHT, visibleEdges(), filterAssets(), FocusDirection, graphLinks() (+43 more)

### Community 7 - "sys"
Cohesion: 0.13
Nodes (7): anonymous_stream_denied(), main(), NoRedirect, origin(), public_streams_available(), read(), require()

### Community 8 - "live/runtime.py"
Cohesion: 0.05
Nodes (11): alter_response(), frame(), LabProxy, ModbusPoller, ReadOnlyClient, Snapshot, decode(), Tag (+3 more)

### Community 9 - "test_gateway.py"
Cohesion: 0.08
Nodes (15): GatewayBoundary, headers(), login(), secured(), test_analyst_decisions_record_verified_actor(), test_login_cookie_membership_and_csrf(), test_logout_invalidates_copied_cookie_and_stream(), test_missing_server_credentials_fail_closed() (+7 more)

### Community 10 - "live.ts"
Cohesion: 0.13
Nodes (30): useFreshness(), Btn(), ReplayControls(), Props, Sparkline(), pctX(), Timeline(), usePlayback() (+22 more)

### Community 11 - "localize/incident.py"
Cohesion: 0.18
Nodes (8): action_for(), explain(), Explanation, signature(), build_incident(), Incident, NodeType, test_explanation_templates()

### Community 12 - "localization.py"
Cohesion: 0.12
Nodes (16): attack_run(), Run, sample_attack(), Row, rows(), summarize(), tune_margin(), tuning_rows() (+8 more)

### Community 13 - "voice.py"
Cohesion: 0.13
Nodes (13): _is_loopback(), limit_attacks(), require_demo(), require_key(), capabilities(), _interaction(), _key(), _limit() (+5 more)

### Community 14 - "react"
Cohesion: 0.11
Nodes (34): App(), collapseIcon(), ResizeHandle, ResizeHandleProps, COLLAPSE_KEY, CONSTRAINTS, DashboardLayoutState, DEFAULT_LAYOUT (+26 more)

### Community 15 - "test_ev.py"
Cohesion: 0.11
Nodes (16): Sessions, evidence_reply(), EvPilot, tools(), Detector, EvRuntime, topology(), client() (+8 more)

### Community 16 - "TopBar.tsx"
Cohesion: 0.12
Nodes (23): SOURCE_NAMES, TopBar(), MODES, ModeToggle(), Props, html(), StatusPill(), STYLE (+15 more)

### Community 17 - "react"
Cohesion: 0.06
Nodes (58): narrated, topoIndex, topologyIndex(), useLiveStream(), AttackBriefing(), DIRECTION_ICON, PHASE_ICON, PHASE_TONE (+50 more)

### Community 18 - "LiveRuntime"
Cohesion: 0.07
Nodes (9): LiveAttackLauncher, LiveRuntime, LiveRecorder, test_attack_refused_while_live_is_calibrating(), test_restart_resumes_rows_and_marks_a_gap(), emulator_runtime(), free_port(), test_calibration_reports_quality_blocker_and_recovers() (+1 more)

### Community 19 - "Rest"
Cohesion: 0.12
Nodes (24): control_hai_replay(), _engine(), get_hai_replay(), get_incident_report(), get_incidents(), get_live_health(), get_metrics(), get_status() (+16 more)

### Community 20 - "graph/__init__.py"
Cohesion: 0.14
Nodes (9): adjacency(), learn_granger_edges(), learn_var_edges(), learned_graph(), merge_graph(), save_graph(), test_adjacency_lists_parents(), test_granger_finds_lagged_cause() (+1 more)

### Community 21 - "test_hai.py"
Cohesion: 0.08
Nodes (31): hai_paths(), HaiData, HaiFile, load_hai(), load_hai_replay(), node_kind(), process_of(), _read() (+23 more)

### Community 22 - "vitest"
Cohesion: 0.08
Nodes (33): CalibratingState(), html(), ProgressRing(), SourcePill(), STYLE, base, html(), CopilotAnswer() (+25 more)

### Community 23 - "copilot.py"
Cohesion: 0.11
Nodes (13): bounded_chat(), get_copilot_engine(), get_suggestions(), post_chat(), assess_layers(), evidence_priority(), suggestions(), CopilotChatResponse (+5 more)

### Community 24 - "Write"
Cohesion: 0.10
Nodes (18): analyze(), main(), analyze(), main(), analyze(), _ece_brier(), main(), analyze() (+10 more)

### Community 25 - "test_api.py"
Cohesion: 0.18
Nodes (11): client(), test_attack_validation(), test_incidents_and_reset(), test_live_loop_survives_a_failing_tick(), test_metrics(), test_metrics_merges_live_metrics_without_touching_the_file(), test_status_and_mode(), test_topology() (+3 more)

### Community 26 - "time"
Cohesion: 0.18
Nodes (21): digest(), loaded_context(), runtime_context(), NodeState, SocStore, message(), test_api_export_and_archived_copilot_use_original_capture(), test_capture_integrity_failure_never_returns_modified_payload() (+13 more)

### Community 27 - "useUi"
Cohesion: 0.14
Nodes (27): Center(), ViewToggle(), Message, AssetInspector(), EvidenceList(), formatCategory(), IncidentProgress(), ResponseEvent (+19 more)

### Community 28 - "Grounding"
Cohesion: 0.13
Nodes (25): _build_context_summary(), CopilotEngine, _get_gemini_key(), incident_evidence_summary(), local_checks(), _offline_expert_reply(), CopilotTurn, Incident (+17 more)

### Community 29 - "test_robustness.py"
Cohesion: 0.15
Nodes (18): PlantParams, assess_calibration(), BenignOverlay, Case, fit_calibration(), observations(), probability(), reliability() (+10 more)

### Community 30 - "gateway/package.json"
Cohesion: 0.08
Nodes (20): devDependencies, miniflare, engines, node, name, overrides, sharp, undici (+12 more)

### Community 31 - "json"
Cohesion: 0.19
Nodes (15): asset_registers(), baseline_comparison(), capture(), detail(), evidence(), export(), journal(), progress() (+7 more)

### Community 32 - "test_emulator.py"
Cohesion: 0.06
Nodes (35): encode(), TagMapError, evaluate(), free_port(), emu(), free_port(), test_attack_endpoint_writes_to_the_emulator_and_reveals_ground_truth(), client_for() (+27 more)

### Community 33 - "Settings"
Cohesion: 0.09
Nodes (38): Settings, BaselineDetector, Loaded, LiveEngine, SourceNotReadyError, engine(), make_live(), test_demo_mode_off_blocks_live_attack_before_the_attacker_is_ever_called() (+30 more)

### Community 34 - "train_hai"
Cohesion: 0.13
Nodes (9): load_hai_baseline(), train_hai(), _windows(), build_hai_engine(), hai_dir(), hai_models(), speed(), Actual held-out results from this installation (+1 more)

### Community 35 - "attack.ts"
Cohesion: 0.05
Nodes (47): ATTACK_LABEL, AttackKind, attacksByNode(), detailFor(), fmt(), INFER_WINDOW, inferSensorKind(), KIND_OF (+39 more)

### Community 36 - "test_eval_baseline.py"
Cohesion: 0.26
Nodes (7): baseline_rank(), evaluate_baseline_localization(), fitted(), test_baseline_saved_before_names_existed_still_works(), test_missed_attacks_count_as_misses(), test_rank_breaks_ties_by_larger_deviation(), test_rank_puts_the_first_breaching_node_first()

### Community 37 - "numpy"
Cohesion: 0.15
Nodes (7): Counts, evaluate(), _onsets(), make_dataset(), _signals(), _write(), test_best_threshold_separates_classes()

### Community 38 - "pipeline.py"
Cohesion: 0.10
Nodes (23): simulate(), fit_err_sd(), ForecastDetector, residuals(), build_model(), GDN, make_windows(), Norm (+15 more)

### Community 39 - "classify_language"
Cohesion: 0.13
Nodes (14): classify_language(), detect_unsupported_script(), has_tamil_characters(), is_self_echo(), LanguageClassification, sanitize_response_text(), tokenize_words(), test_classify_english_speech() (+6 more)

### Community 40 - "Authentication"
Cohesion: 0.17
Nodes (15): check_origin(), config(), firebase_app(), identity(), logout(), me(), names(), protect() (+7 more)

### Community 41 - "Scenario"
Cohesion: 0.10
Nodes (8): GroundTruth, Scenario, _fmt_eta(), analyze(), main(), _pct(), Controls, RegisterOverlay

### Community 42 - "RateLimiter"
Cohesion: 0.17
Nodes (11): 1. Five-Layer Architecture Map, 2. Layer-by-Layer Breakdown & Source Evidence, 3. End-to-End User Workflows, 4. Authentication, Authorization & Security Flow, AttackTrace: Full Interactive Architecture Map, 🌐 Interactive Visualization Artifacts, 🎨 Layer 1: Frontend, ⚡ Layer 2: API & Gateway (+3 more)

### Community 43 - "lab.py"
Cohesion: 0.08
Nodes (19): configure(), emulator_info(), exclusive(), integrity(), ManifestChange, observe_integrity(), probe(), proxy() (+11 more)

### Community 44 - "RobustnessPanel.tsx"
Cohesion: 0.25
Nodes (14): percent(), ReliabilityTable(), RobustnessPanel(), score(), seconds(), finite(), nullable(), numbers() (+6 more)

### Community 45 - "json"
Cohesion: 0.15
Nodes (9): _from_env(), read_checkpoint(), source_fingerprint(), write_checkpoint(), LiveConfig, test_bad_checkpoint_is_rejected(), test_checkpoint_write_failure_keeps_previous_file(), get_json() (+1 more)

### Community 46 - "Package"
Cohesion: 0.09
Nodes (23): name, overrides, @grpc/grpc-js, private, type, version, autoprefixer, echarts (+15 more)

### Community 47 - "model.ts"
Cohesion: 0.12
Nodes (24): CAMERAS, EvCanvasProps, MODES, SYSTEMS, positions, Analysis, AttackConfig, AttackKind (+16 more)

### Community 48 - "main.py"
Cohesion: 0.07
Nodes (30): live(), load_baseline(), load_detector(), load_graph(), live_dir(), live_models_ready(), build_engine(), safe_ensure_metrics() (+22 more)

### Community 49 - "lib/types.ts"
Cohesion: 0.10
Nodes (27): Props, ImpactMeters(), Meter(), tone(), etaUrgency(), formatEta(), formatValue(), isSpoofed() (+19 more)

### Community 50 - "Ev3dScene"
Cohesion: 0.13
Nodes (6): Ev3dScene, radialTexture(), EvCanvas(), ParticleNetwork, EvViewMode, SubsystemKind

### Community 51 - "ModelRouter"
Cohesion: 0.11
Nodes (18): classify_failure(), Failure, ModelRouter, _retry_after(), _status_code(), gemini_key(), _audio(), _interaction() (+10 more)

### Community 52 - "create_app"
Cohesion: 0.10
Nodes (21): RateLimiter, build_live_runtime(), create_app(), lifespan(), test_gateway_secret_does_not_replace_firebase_identity(), test_voice_rejects_wrong_demo_key_before_gemini(), client(), make_client() (+13 more)

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
Cohesion: 0.18
Nodes (19): IsolateButton(), PathChips(), BaselineAlarms(), Column(), SplitView(), Trace(), postIsolate(), isActive() (+11 more)

### Community 58 - "LiveSource"
Cohesion: 0.05
Nodes (45): Aligner, Sample, LiveConfigError, load_live(), ReadError, excluded_from_ranking(), QualityTracker, TagSpec (+37 more)

### Community 59 - "test_report.py"
Cohesion: 0.16
Nodes (10): _eta(), render_report(), para(), _utc(), ascii_text(), _escape(), Page, text_width() (+2 more)

### Community 60 - "Compileroptions"
Cohesion: 0.11
Nodes (17): compilerOptions, isolatedModules, jsx, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch (+9 more)

### Community 61 - "reconstruct"
Cohesion: 0.20
Nodes (7): _cost(), hop_distance(), PathNode, Propagation, reconstruct(), _shortest(), test_path_orders_same_sample_onsets_cause_first()

### Community 62 - "Ev3dScene.ts"
Cohesion: 0.13
Nodes (20): Ev3dSceneOptions, HERO_LOOK, HERO_POS, createEvMaterials(), EvMaterialBank, ghost(), PropagationPathDef, bracketGeometry() (+12 more)

### Community 63 - "time"
Cohesion: 0.12
Nodes (15): click_path(), main(), post(), wait_healthy(), check(), check_backend_health(), check_console_errors(), check_emulator() (+7 more)

### Community 64 - "Engine"
Cohesion: 0.06
Nodes (42): Engine, _has_hazard(), worst_impact(), AttackRequest, Impact, _peak_rss_over_simulated_run(), Arm, _isolate() (+34 more)

### Community 65 - "demo_trials.py"
Cohesion: 0.28
Nodes (11): build_report(), main(), pair_key(), _pick_primary_backup(), _rank(), run_live(), run_sim(), run_sim_trial() (+3 more)

### Community 66 - "EvWorkspace.tsx"
Cohesion: 0.33
Nodes (18): EvAttackLab(), EvCard(), EvEvidence(), EvInspector(), EvLocalization(), EvPilotPanel(), EvTwin(), DrivingProfile() (+10 more)

### Community 67 - "metrics.ts"
Cohesion: 0.17
Nodes (21): chartOption(), getChartColors(), AmbiguityMetrics, BarRow, detector(), DetectorMetrics, haiDetector(), HaiDetectorMetrics (+13 more)

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
Cohesion: 0.17
Nodes (9): hai_models_ready(), ensure_metrics(), main(), write_metrics(), test_a_failing_metrics_step_never_stops_startup(), test_existing_metrics_are_never_overwritten(), test_first_start_writes_metrics_once(), fake() (+1 more)

### Community 73 - "package.py"
Cohesion: 0.46
Nodes (4): collect(), main(), scan(), wanted()

### Community 74 - "AttackTrace: Project Explained & Comprehensive Presentation Guide"
Cohesion: 0.18
Nodes (10): 4. Features and Screens, 5. System Architecture, 8. Data Modes and Operational Evidence, 9. Implementation Details & File-to-Feature Map, Architecture Diagram, AttackTrace: Project Explained & Comprehensive Presentation Guide, File-to-Feature Map, Folder Structure Overview (+2 more)

### Community 75 - "Screenshots"
Cohesion: 0.35
Nodes (10): ambiguousShot(), { chromium }, errors, haiIncident(), log, require, shot(), simViews() (+2 more)

### Community 77 - "sim/__init__.py"
Cohesion: 0.09
Nodes (8): NoOverlay, Overlay, PID, _clip(), Impact, _time_to(), NodeSpec, test_pid_clamps_and_antiwindup()

### Community 78 - "Dependencies"
Cohesion: 0.14
Nodes (14): dependencies, echarts, echarts-for-react, firebase, @fontsource/inter, @fontsource/jetbrains-mono, framer-motion, lucide-react (+6 more)

### Community 79 - "live_voice.py"
Cohesion: 0.13
Nodes (10): connect_model(), live_voice(), browser_to_gemini(), gemini_to_browser(), opening_prompt(), process_snapshot(), session_config(), test_live_extended_thinking_has_required_configuration() (+2 more)

### Community 80 - "12. Presentation-Ready Content (PowerPoint Slide Deck)"
Cohesion: 0.18
Nodes (11): 12. Presentation-Ready Content (PowerPoint Slide Deck), Slide 10: Conclusion & The Future of Industrial Defense, Slide 1: Title & Executive Summary, Slide 2: The Problem: Invisible Threats to Critical Infrastructure, Slide 3: The Alarm Flood Dilemma, Slide 4: The AttackTrace Solution, Slide 5: System Architecture & Data Modes, Slide 6: Live Case Study: The Tank 1 Level Attack (+3 more)

### Community 81 - "pytest"
Cohesion: 0.07
Nodes (37): allowed_hosts(), AllowlistError, check_host(), is_loopback(), emit_period(), Hub, run_loop(), Status (+29 more)

### Community 82 - "AttackSpec"
Cohesion: 0.10
Nodes (28): _Active, AttackEngine, AttackSpec, main(), Plant, _pair(), _run(), test_actuator_force_pump_off_stops_flow() (+20 more)

### Community 84 - "theme.ts"
Cohesion: 0.23
Nodes (9): ThemeSwitcher(), applyTheme(), getInitialTheme(), ThemeId, ThemeMeta, THEMES, ThemeState, useTheme (+1 more)

### Community 85 - "Screenshots"
Cohesion: 0.24
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
Cohesion: 0.33
Nodes (4): css, spec, postcss, @tailwindcss/postcss

### Community 92 - "carGeometry.ts"
Cohesion: 0.24
Nodes (11): buildCarGeometry(), CarBodyMeshes, GREENHOUSE, lathe(), loftBody(), LoftOptions, LOWER_BODY, sampleStations() (+3 more)

### Community 93 - "10. Results and Evaluation"
Cohesion: 0.29
Nodes (7): 10. Results and Evaluation, 1. Detection Performance (Evaluated on 50 Attack Runs & 20 Clean Runs), 2. Root-Cause Localization Accuracy, 3. Self-Healing Containment Success, 4. What Performed Well vs. What Performed Poorly, 5. HAI 20.07 Real-World Dataset Results, 6. What These Results Cannot Prove

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
Cohesion: 0.07
Nodes (26): 🏛 5-Layer System Architecture (Graphify Mapped), AttackTrace, 📊 Benchmark & Evaluation Results, 🔄 End-to-End Incident Lifecycle, 🗺 Graphify Codebase Navigation, 🎮 Interactive Live Demo Script, 🎨 Layer 1: Frontend (React 19 + TypeScript + Vite), ⚡ Layer 2: API & Gateway (FastAPI + Cloudflare Workers) (+18 more)

### Community 116 - "7. AI and Detection Methods"
Cohesion: 0.33
Nodes (6): 1. Machine Learning Forecasting (GDN & MLP), 2. Fixed Rules, Timing, and Graph Calculations, 3. Generative AI: AI Pilot (Google Gemini), 7. AI and Detection Methods, What Confidence Scores Mean (and What They Do Not Mean), What Happens When an AI Service Fails

### Community 117 - "train.py"
Cohesion: 0.10
Nodes (16): get_settings(), main(), main(), AttackResult, _false_alarm_per_hour(), LiveEvalState, main(), _pct() (+8 more)

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

### Community 133 - "14. Glossary and References"
Cohesion: 0.67
Nodes (3): 14. Glossary and References, Plain-English Glossary, Verified Academic and Industry References

### Community 134 - "6. Technologies and Their Purpose"
Cohesion: 0.67
Nodes (3): 6. Technologies and Their Purpose, Required Runtime vs. Optional / Development Tools, Technology Breakdown Table

### Community 136 - "EV_ARCHITECTURE.md"
Cohesion: 0.12
Nodes (15): 1. Cyber-Physical System (CPS) Modeling, 1. Normalized Residual, 2. Sensor-Controller-Actuator Simulation Loop, 2. Temporal Persistence Filter, 3. Attack Injection Classes, 3. Hypothesis Scoring & Origin Localization, 4. Independent Anomaly Detector & Origin Localization, 4. Normalized Score Share (+7 more)

### Community 139 - "AttackerClient"
Cohesion: 0.14
Nodes (10): main(), parse_args(), run(), AttackerClient, AttackerError, AttackRecord, load_attacker(), _neutral() (+2 more)

### Community 140 - "hai_pipeline.py"
Cohesion: 0.10
Nodes (16): aggregate(), alert_mask(), best_threshold(), sustained(), split_tests(), hai_forward(), HaiForward, sim_forward() (+8 more)

### Community 141 - "main.tsx"
Cohesion: 0.40
Nodes (3): root, @fontsource/inter, @fontsource/jetbrains-mono

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
Cohesion: 0.43
Nodes (3): test_backup_includes_committed_wal_and_closes_output(), test_backup_refuses_to_replace_existing_data(), backup()

### Community 153 - "EV investigation implementation"
Cohesion: 0.33
Nodes (5): Boundaries, Delivery sequence, EV investigation implementation, Milestone Status & Verification, Product contract

### Community 155 - "EV workspace"
Cohesion: 0.50
Nodes (3): EV workspace, Product direction, Working implementation

## Knowledge Gaps
- **12 isolated node(s):** `attacktrace`, `@types/three`, `echarts`, `echarts-for-react`, `@types/node` (+7 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1147 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **31 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `3.10 LIVE ingestion: a real industrial protocol` connect `incident.render.test.ts` to `main.py`, `AttackSpec`, `test_emulator.py`?**
  _High betweenness centrality (0.355) - this node is a cross-community bridge._
- **Are the 98 inferred relationships involving `Engine` (e.g. with `🧠 Layer 3: Services & Detection Engine` and `_engine()`) actually correct?**
  _`Engine` has 98 INFERRED edges - model-reasoned connections that need verification._
- **What connects `attacktrace`, `@types/three`, `echarts` to the rest of the system?**
  _12 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `numpy` be split into smaller, more focused modules?**
  _Cohesion score 0.07191316146540028 - nodes in this community are weakly interconnected._
- **Are the 34 inferred relationships involving `Settings` (e.g. with `prepare_storage()` and `validate()`) actually correct?**
  _`Settings` has 34 INFERRED edges - model-reasoned connections that need verification._
- **Should `api.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.055501460564751706 - nodes in this community are weakly interconnected._
- **Should `geometry.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.0942684766214178 - nodes in this community are weakly interconnected._