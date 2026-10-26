# AttackTrace EV 3D Digital Twin — Development Progress Log

This document records the chronological development, architectural milestones, git commit history, and test checkpoints for the Electric Vehicle (EV) workspace in AttackTrace.

---

## 1. Executive Summary

The AttackTrace Electric Vehicle (EV) project delivers an interactive 3D digital twin and cyber-physical investigation workspace accessible at `http://127.0.0.1:5174/ev`. The application runs on top of a 22-component physics simulation with an independent model-based detector, an AI investigation pilot, and a 3D Three.js digital twin.

Throughout development, the Water Plant workspace (`/`, `/alerts`, `/assets`, `/investigations`, `/lab`) remained strictly untouched, ensuring complete architectural isolation.

---

## 2. Chronological Milestones & Commits

### Milestone 1: Workspace Baseline & Codex Work Recovery
- **Branch**: `feat/ev-baseline` / Worktree: `attacktrace-ev-3d-development`
- **Actions**:
  - Committed Codex's uncommitted modifications (`482ac1c`).
  - Created isolated git worktree at `D:\attacktrace-ev-3d-development` for zero contamination of main workspace.
  - Linked `.venv` and `node_modules` via directory junctions to avoid disk bloat.
  - Diagnosed and resolved backend 404 issue (terminated stale PID 20864, restarted FastAPI uvicorn with `/api/ev/*` routes).
- **Verification**: Backend EV tests passed (13/13).

### Milestone 2: 3D Design Iteration 1 & Concept Generation
- **Actions**:
  - Generated visual concept reference `docs/ui-review/ev-3d-command-deck-ref.jpg` using autonomous generative tools.
  - Authored `docs/EV_DESIGN_ITERATIONS.md` documenting visual hierarchy, OEM aesthetics, color discipline, and component mapping.
  - Established visual theme: dark graphite (`#0b0f14`), electric cyan (`#00e5ff`), caution amber (`#ffb300`), critical fault crimson (`#ff3366`).

### Milestone 3: 3D Graphics Engine & Three.js Architecture
- **Actions**:
  - Evaluated `@react-three/fiber` vs direct `three` + `@types/three`. Selected direct Three.js integration inside a React `useEffect` container to eliminate React 19 peer-dependency conflicts with React 18.3.1.
  - Created `frontend/src/features/ev/3d/types.ts`: Defined 3D anatomical coordinates, exploded view displacement vectors, bounding sizes, and subsystem categorization for all 22 components.
  - Created `frontend/src/features/ev/3d/materials.ts`: Created metallic car paint PBR, tinted glass, rubber tires, aluminum rims, semi-transparent X-ray holographic materials, pulsating anomaly materials, and neon energy flow shaders.
  - Created `frontend/src/features/ev/3d/carGeometry.ts`: Designed procedural sports sedan body shell, aerodynamic glass canopy, front lightbar, rear LED taillight, side mirrors, wheels, and suspension axles.
  - Created `frontend/src/features/ev/3d/subsystemsGeometry.ts`: Modeled detailed physical geometries for all 22 components (BMS, Inverter, Traction Motor, Battery Pack modules, Coolant Pump, Radiator, CAN Gateway, EPS steering rack, Hydraulic brake calipers).
  - Created `frontend/src/features/ev/3d/particleNetwork.ts`: Generated Catmull-Rom 3D spline curves connecting causal dependencies with moving photon pulses and energy flow particles.
  - Created `frontend/src/features/ev/3d/Ev3dScene.ts`: Built the master Three.js orchestrator with OrbitControls, 5 visualization modes, 6 camera presets, raycast mouse picking, and a 60 FPS animation loop with wheel rotation.
  - Created `frontend/src/features/ev/3d/EvCanvas.tsx`: React wrapper with glassmorphism HUD, view mode selectors, camera presets, subsystem filters, telemetry pills, and accessible keyboard fallback.

### Milestone 4: Dual-Mode Integration & UI Refinement
- **Actions**:
  - Integrated `EvCanvas` into `frontend/src/features/ev/EvTwin.tsx`.
  - Added a toggle between "3D Twin" and "2D Schematic" to guarantee accessibility, automated test stability, and low-end hardware performance.
  - Added an accessible quick-select component strip beneath the viewport mapping all 22 components.
  - Updated `frontend/src/styles/ev.css` with responsive styling for 3D viewport, glassmorphic HUD controls, status pills, and badges.

### Milestone 5: E2E Playwright Suite & Design Iteration 2
- **Actions**:
  - Added Test 4 to `frontend/e2e/ev.spec.ts` covering canvas visibility, view mode transitions, camera presets, subsystem filters, component inspection, screenshot capture, and 2D/3D toggle.
  - Resolved Playwright strictness and layout edge cases: eliminated overlapping HUD elements and duplicate screen-reader buttons.
  - Captured rendered artifact `docs/ui-review/ev-3d-twin-screenshot.png`.
  - Documented Iteration 2 visual critique and improvements in `docs/EV_DESIGN_ITERATIONS.md`.

---

## 3. Verification Summary

| Test Suite | Scope | Result | Execution Time |
| :--- | :--- | :--- | :--- |
| **Backend Pytest** (`test_ev.py`) | 13 test cases (API, simulator, attack, detector, pilot) | **13 passed** (100%) | 0.52s |
| **Frontend Vitest** (`npm run test`) | 32 test files, 237 tests across full repository | **237 passed** (100%) | 1.39s |
| **TypeScript Check** (`npm run typecheck`) | Strict type checking across entire frontend | **0 errors** | 1.8s |
| **Vite Production Build** (`npm run build`) | Bundle size, code splitting, chunk verification | **Success** | 925ms |
| **Playwright E2E** (`e2e/ev.spec.ts`) | 4 comprehensive end-to-end integration tests | **4 passed** (100%) | 1.0m |

---

## 4. Key Architectural Guarantees Verified

1. **Zero Water Plant Regression**:
   - The Water Plant route `/` and its related views (`/alerts`, `/assets`, `/investigations`, `/lab`) load identically with zero bundle overhead.
   - Three.js is exclusively contained in the lazy-loaded `EvWorkspace` chunk (`664.71 kB`).
2. **Strict Detector Independence**:
   - The anomaly detector has zero access to ground truth injection targets.
   - Truth is revealed only upon explicit operator evaluation request.
3. **Hardware Independence**:
   - The entire simulation and 3D rendering run fully in software, requiring no external CAN hardware, GPU drivers, or proprietary vehicle SDKs.
