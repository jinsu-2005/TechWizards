# AttackTrace EV 3D Digital Twin — Design Iteration History

This document records the continuous, iterative **Generate → Review → Improve → Implement → Test → Regenerate** UI/UX workflow for the Electric Vehicle (EV) workspace.

---

## Iteration 1: 3D Cyber-Physical Operations Command Deck

### 1. AI Reference Generation
- **Target Screen**: Main 3D Digital Twin View & Cyber-Physical Operations Command Deck
- **Generated Image**: `docs/ui-review/ev-3d-command-deck-ref.jpg`
- **Visual Theme**: Dark graphite (`#0b0f14`), electric cyan (`#00e5ff`), caution amber (`#ffb300`), critical fault crimson (`#ff3366`).
- **Composition**:
  - Centerpiece: 3D electric sedan in holographic X-ray perspective with glowing cell banks, dual motors, high-voltage orange busbars, and blue coolant loop.
  - Left flank: Primary vehicle dynamics gauges (Speedometer, Torque, High-Voltage Pack Temperature, State-of-Charge donut gauge at 82%, Drivetrain power flow graph).
  - Bottom-left: Active incident alert banner with severity indicators.
  - Right flank: EV AI Pilot dialog panel with evidence tools and ranked attack origin hypotheses (with percentage shares and breakdown scores).

### 2. Critical Visual & Functional Review
- **Strengths**:
  - High-tech, automotive OEM engineering aesthetic suitable for judges and engineers.
  - Visual hierarchy clearly places the interactive vehicle twin front and center.
  - Strong color discipline: Cyan for nominal high-voltage state, Amber for anomalies, Red for attack origin.
- **Identified Weaknesses & Adaptation Plan**:
  - Need interactive camera presets (Iso, Front, Side, Rear, Top, Reset) directly accessible on the canvas.
  - Need visual mode switcher (Exterior, X-Ray, Exploded, System, Attack Investigation) as a glassmorphism floating toolbar.
  - Need all 22 simulated backend components represented as selectable 3D elements with hover tooltips and focus-on-click transitions.
  - Need 3D particle spline animation for attack propagation along backend dependency graph edges (`EDGES`).
  - Need full mobile/tablet responsive layout with touch-friendly orbit gestures and fallback view.

### 3. Implementation Status
- Three.js core installed (`three`, `@types/three`).
- Implemented modular 3D car geometry, materials, subsystems, animations, and raycasting picking engine in `frontend/src/features/ev/3d/`.
- Integrated 3D canvas into `frontend/src/features/ev/EvTwin.tsx` with dual-mode 3D Twin / 2D Schematic toggle and accessible component quick-select bar.

---

## Iteration 2: Implementation Review & Design Comparison

### 1. Implemented Screenshot vs Reference Critique
- **Captured Artifact**: `docs/ui-review/ev-3d-twin-screenshot.png`
- **Reference Concept**: `docs/ui-review/ev-3d-command-deck-ref.jpg`
- **Visual Alignment**:
  - **Color Discipline & Atmosphere**: The dark graphite background (`#0b0f14`), electric cyan accents, and glowing high-voltage and thermal subsystems align with the high-tech automotive OEM aesthetic established in the concept reference.
  - **3D Geometry & Material Fidelity**: Skateboard chassis with battery packs, front/rear axles, inverter, traction motor, DC/DC converter, steering rack, brake assemblies, and glowing cooling loop match the anatomical placement required for physical plausibility.
  - **Floating HUD Usability**: Floating top HUD features glassmorphic view mode selectors (`Exterior`, `X-Ray`, `Exploded`, `Subsystems`, `Attack View`), camera presets (`Iso`, `Front`, `Side`, `Rear`, `Top`, `Reset`), and subsystem category filters (`All`, `Energy`, `Powertrain`, `Thermal`, `Chassis`, `Network`).
  - **Live Dynamic Telemetry**: Bottom HUD status pill actively updates wheel speed (64 km/h), vehicle state ("Cruising"), nominal/attack badge, selected component card (`Pack Temperature Sensor`), and interaction hint.
- **Key Enhancements beyond the Concept Reference**:
  - **Accessibility & Low-End Fallback**: An interactive "3D Twin" / "2D Schematic" toggle lets operators and automated testers instantly toggle to an SVG topological schematic.
  - **Quick-Select Accessible Strip**: Added a horizontally scrollable component bar directly beneath the 3D canvas allowing keyboard and screen-reader navigation across all 22 simulated components.
  - **Smooth Raycast Picking & Camera Focus**: Clicking any 3D subsystem smoothly orbits and animates the camera to frame that specific component while syncing state with the Component Inspector and EV AI Pilot panels.
  - **Attack Propagation Particle Stream**: Implemented dynamic Catmull-Rom spline curves with traveling light pulses visualizing the causal propagation paths inferred by the detector.

### 2. Validation & Verification
- All 4 Playwright E2E tests passing cleanly (`e2e/ev.spec.ts`), including the full 3D interactive twin test.
- Full Vitest suite passing (237 of 237 tests).
- Backend pytest passing (13 of 13 tests).
- Production build verified with zero TypeScript errors and zero impact on the Water Plant bundle chunk.
