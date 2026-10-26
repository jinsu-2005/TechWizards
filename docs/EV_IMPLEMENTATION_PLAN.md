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

## Boundaries

This is an educational EV cyber-physical simulation, not a validated automotive model. The detector uses transparent model-based residuals rather than a trained EV GNN. Ranking shares are normalized scores, not calibrated compromise probabilities. Paths are hypotheses from dependency topology and onset, not verified intrusion routes. Model generation requires an available configured provider. Sessions and incidents are bounded in memory and expire after inactivity; browser chat persistence is local.
