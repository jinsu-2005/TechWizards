# EV investigation implementation

## Product contract

Preserve the water plant workspace, routes and controls. EV owns its simulator, attacks, observations, detector state, incident history and pilot conversation. The top system switch remains available across both workspaces.

The main journey is Observe → Inject → Detect → Investigate → Recover. Use one operational dashboard with a readable vehicle diagram, explicit backend connection status, meaningful component states and a persistent investigation context. Detailed telemetry, attack configuration, evidence and AI assistance are reachable without mixing plant evidence into EV requests.

## Delivery sequence

1. Backend EV model: dynamic pack, thermal, drivetrain, chassis and communication signals; 22 sensors/controllers/actuators with units, expected values, measured values and timestamps. Bounded isolated browser sessions; no vehicle hardware access.
2. Attack engine: validated target/type, signed magnitude and duration. Sensor bias/freeze/replay, communication delay, actuator tampering and physical cooling failure. Single active attack, explicit stop/reset, natural expiry and recovery.
3. Independent detector: pure observed/expected signal residuals, persistence, onset and directed topology. Rank candidates, expose score contributions, reconstruct onset-compatible paths. Retain incident evidence and recovery state. Injection truth is separate and revealed only on request after detection.
4. EV AI Pilot: separate endpoint, EV-only system instructions, server-built telemetry/component/incident tools, bounded conversation, evidence references, provider failover and explicit evidence-summary fallback. The model explains results; it does not choose detector outputs or execute hardware commands.
5. Investigation UI: responsive command deck, twin and component explorer; attack form and presets; ranked origin panel; evidence timeline, immutable historical snapshots, recovery and evaluation against separately revealed truth; persistent EV conversation with loading/error/retry states.
6. Verification: clean baseline, each supported attack, invalid targets, no oracle dependence, pause/expiry/recovery, session separation, model success/failure, desktop/mobile navigation and unchanged water plant routes. Report measured demo results, not general detection accuracy.

7. Interactive 3D Digital Twin: Photorealistic Three.js procedural EV model, 22 anatomical subsystem geometries, PBR metallic and holographic materials, 5 view modes (Exterior, X-Ray, Exploded, Subsystems, Attack View), 6 camera presets with animated smooth transitions, raycasting picking, particle spline propagation animation, and accessible dual-mode 3D/2D toggle.

## Boundaries

This is an educational EV cyber-physical simulation, not a validated automotive model. The detector uses transparent model-based residuals rather than a trained EV GNN. Ranking shares are normalized scores, not calibrated compromise probabilities. Paths are hypotheses from dependency topology and onset, not verified intrusion routes. Model generation requires an available configured provider. Sessions and incidents are bounded in memory and expire after inactivity; browser chat persistence is local.

## Milestone Status & Verification

| Milestone | Component | Status | Verification |
| :--- | :--- | :--- | :--- |
| **M1: Baseline & Session** | Backend EV session store, state loop | Complete | 13/13 backend tests passed |
| **M2: Cyber-Physical Simulator**| 22 components, dynamic physics, 2 Hz loop | Complete | Telemetry verified across all 5 subsystems |
| **M3: Attack Engine** | 6 attack types (bias, freeze, replay, delay, tamper, physics) | Complete | Controlled injection, clean expiry & recovery |
| **M4: Independent Detector** | Residual math, onset tracking, topological ranking | Complete | Strict separation: detector has zero injection truth |
| **M5: EV AI Pilot** | Dedicated EV system prompt & 4 investigation tools | Complete | Verified multi-turn session with fallback |
| **M6: Command Deck UI** | Navigation, telemetry cards, inspector, incident log | Complete | Playwright E2E tests 1-3 passed |
| **M7: 3D Graphics Engine** | Three.js procedural car, 22 subsystems, PBR shaders | Complete | 60 FPS, WebGL memory management, OrbitControls |
| **M8: 3D Visualization Modes**| Exterior, X-Ray, Exploded, Subsystems, Attack View | Complete | Dynamic visibility & material switching verified |
| **M9: 3D Interaction & HUD** | Raycasting picking, camera focus, particle network | Complete | Playwright test 4 passed, screenshot captured |
| **M10: Verification & Docs** | Vitest (237), Pytest (13), E2E (4), Docs suite | Complete | Full regression verified, zero Water Plant impacts |
