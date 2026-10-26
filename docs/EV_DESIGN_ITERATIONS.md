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
- Building modular 3D car geometry, materials, subsystems, animations, and picking engine in `frontend/src/features/ev/3d/`.
- Integrating 3D canvas into `frontend/src/features/ev/EvTwin.tsx`.

---
