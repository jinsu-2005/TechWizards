# AttackTrace EV 3D Digital Twin — 3D Graphics Design & Implementation Guide

This document details the 3D scene structure, procedural geometry pipeline, physical-based materials, camera control systems, animation loops, and performance optimizations used in the AttackTrace Electric Vehicle digital twin.

---

## 1. 3D Scene Architecture & Hierarchy

The 3D visualization is orchestrated by `Ev3dScene.ts` utilizing Three.js:

```
Three.Scene
├── AmbientLight (soft fill, intensity 0.7, #8baac9)
├── DirectionalLight (key sunlight, intensity 1.8, #ffffff, castShadow)
├── DirectionalLight (underbody ground bounce, intensity 0.5, #00e5ff)
├── Ground & Grid System
│   ├── Infinite ground plane (#070a0e)
│   └── Polar coordinate circular grid (#00e5ff, opacity 0.15)
├── VehicleRootGroup
│   ├── ExteriorGroup
│   │   ├── CarBodyMesh (aerodynamic sports sedan shell)
│   │   ├── GlassCanopyMesh (windshield, roof, rear window)
│   │   ├── FrontLightbarMesh & RearLedStripMesh
│   │   └── SideMirrors & UnderbodyDiffuser
│   ├── ChassisGroup
│   │   ├── FrontSuspensionAxle & RearSuspensionAxle
│   │   ├── Wheel_FL (Mesh + Caliper) [rotates around X-axis]
│   │   ├── Wheel_FR (Mesh + Caliper) [rotates around X-axis]
│   │   ├── Wheel_RL (Mesh + Caliper) [rotates around X-axis]
│   │   └── Wheel_RR (Mesh + Caliper) [rotates around X-axis]
│   ├── SubsystemsGroup (22 Anatomical EV Components)
│   │   ├── EnergyGroup (BMS, Cell Modules, DCDC, HV Busbars)
│   │   ├── PowertrainGroup (VCU, INV, MOTOR, Drive Shafts)
│   │   ├── ThermalGroup (COOL, FLOW, CTEMP, Piping Loops, Radiator)
│   │   ├── ChassisGroup (EPS Rack, BRAKE Module, Hydraulic Lines)
│   │   └── NetworkGroup (CAN Hub, Gateway Antenna)
│   └── ParticleNetworkGroup
│       ├── CatmullRomSplineCurves (edges)
│       └── TravelingPulsePoints (attack propagation)
```

---

## 2. Component Anatomical Coordinates & Exploded Offsets

All 22 components are positioned in normalized vehicle coordinates (origin at center of skateboard wheelbase, $+Z$ forward, $+Y$ up, $+X$ right):

| Component ID | Subsystem | Base Coordinates $(X, Y, Z)$ | Exploded Offset $(\Delta X, \Delta Y, \Delta Z)$ | Bounding Size $(W, H, D)$ |
| :--- | :--- | :--- | :--- | :--- |
| `TEMP` | Energy | `(0.00, 0.28, 0.10)` | `(0.00, 0.40, 0.00)` | `(0.35, 0.12, 0.35)` |
| `PACK` | Energy | `(0.30, 0.32, -0.40)` | `(0.40, 0.35, -0.10)` | `(0.30, 0.15, 0.30)` |
| `CURRENT` | Energy | `(0.00, 0.35, -0.70)` | `(0.00, 0.40, -0.20)` | `(0.35, 0.18, 0.35)` |
| `CELL` | Energy | `(-0.35, 0.26, 0.30)` | `(-0.40, 0.30, 0.10)` | `(0.28, 0.10, 0.28)` |
| `SOC` | Energy | `(0.35, 0.26, 0.30)` | `(0.40, 0.30, 0.10)` | `(0.28, 0.10, 0.28)` |
| `BMS` | Energy | `(0.00, 0.42, 0.70)` | `(0.00, 0.55, 0.20)` | `(0.45, 0.16, 0.30)` |
| `DCDC` | Energy | `(-0.40, 0.38, 0.85)` | `(-0.50, 0.45, 0.25)` | `(0.32, 0.20, 0.32)` |
| `PEDAL` | Powertrain | `(0.32, 0.55, 1.15)` | `(0.35, 0.40, 0.40)` | `(0.18, 0.28, 0.18)` |
| `VCU` | Powertrain | `(0.00, 0.58, 1.25)` | `(0.00, 0.50, 0.45)` | `(0.42, 0.18, 0.30)` |
| `INV` | Powertrain | `(0.00, 0.46, -1.05)` | `(0.00, 0.40, -0.35)` | `(0.48, 0.26, 0.42)` |
| `MOTOR` | Powertrain | `(0.00, 0.32, -1.35)` | `(0.00, 0.15, -0.50)` | `(0.65, 0.38, 0.55)` |
| `RPM` | Powertrain | `(0.32, 0.32, -1.35)` | `(0.40, 0.15, -0.50)` | `(0.20, 0.20, 0.20)` |
| `MTEMP` | Thermal | `(-0.32, 0.32, -1.35)` | `(-0.40, 0.15, -0.50)` | `(0.20, 0.20, 0.20)` |
| `WHEEL` | Chassis | `(0.92, 0.32, -1.35)` | `(0.60, 0.00, 0.00)` | `(0.22, 0.22, 0.22)` |
| `BRAKE` | Chassis | `(0.35, 0.52, 1.35)` | `(0.45, 0.35, 0.40)` | `(0.32, 0.22, 0.26)` |
| `PRESSURE`| Chassis | `(0.55, 0.48, 1.35)` | `(0.60, 0.35, 0.40)` | `(0.22, 0.22, 0.22)` |
| `EPS` | Chassis | `(0.00, 0.32, 1.45)` | `(0.00, 0.10, 0.50)` | `(0.70, 0.20, 0.25)` |
| `ANGLE` | Chassis | `(0.28, 0.42, 1.45)` | `(0.35, 0.20, 0.50)` | `(0.18, 0.18, 0.18)` |
| `COOL` | Thermal | `(-0.45, 0.32, 0.30)` | `(-0.55, 0.25, 0.10)` | `(0.30, 0.25, 0.30)` |
| `FLOW` | Thermal | `(-0.45, 0.32, -0.15)` | `(-0.55, 0.25, -0.05)` | `(0.22, 0.22, 0.22)` |
| `CTEMP` | Thermal | `(-0.45, 0.32, 0.70)` | `(-0.55, 0.25, 0.20)` | `(0.22, 0.22, 0.22)` |
| `CAN` | Network | `(0.00, 0.65, 0.20)` | `(0.00, 0.70, 0.00)` | `(0.36, 0.14, 0.28)` |

---

## 3. Five Interactive Visualization Modes

Operators can switch between 5 distinct rendering modes at runtime via the glassmorphism HUD:

1. **Exterior Mode (`exterior`)**:
   - High-gloss metallic car paint with deep reflections and tinted privacy glass.
   - Ideal for viewing the streamlined vehicle silhouette and road wheel dynamics.
2. **X-Ray Holographic Mode (`xray`)**:
   - Body shell and glass become semi-transparent with glowing cyan holographic edge highlighting.
   - Internal skateboard battery modules, drive motors, coolant piping, and wiring harness become fully visible.
3. **Exploded Subsystem Isolation (`exploded`)**:
   - Vehicle body lifts upward by $+1.2\text{m}$.
   - Subsystems disperse smoothly along their displacement vectors $\vec{D}_i$, creating an engineering CAD exploded-assembly view.
4. **Subsystems Engineering Mode (`system`)**:
   - Exterior body shell is suppressed.
   - Interactive subsystem category filtering (Energy, Powertrain, Thermal, Chassis, Network) highlights targeted components while muting irrelevant layers.
5. **Attack Investigation Mode (`investigation`)**:
   - Nominal components dimmed.
   - Anomalous components glow amber.
   - Ranked #1 attack origin pulses with emergency red strobing.
   - Inferred propagation paths illuminate with directed Catmull-Rom particle streams.

---

## 4. Camera Controls & Interpolated Transitions

The scene features **OrbitControls** with constrained vertical polar angles ($5^\circ$ to $85^\circ$) and distance limits ($2.5\text{m}$ to $14\text{m}$).

### Camera Presets
- **Isometric (`iso`)**: Position `(4.5, 3.2, 5.2)`, target `(0, 0.4, 0)`
- **Front (`front`)**: Position `(0.0, 1.2, 5.8)`, target `(0, 0.4, 0)`
- **Side Profile (`side`)**: Position `(6.2, 1.4, 0.0)`, target `(0, 0.4, 0)`
- **Rear Powertrain (`rear`)**: Position `(0.0, 1.5, -5.8)`, target `(0, 0.4, 0)`
- **Top Skateboard (`top`)**: Position `(0.0, 7.5, 0.1)`, target `(0, 0.2, 0)`
- **Reset (`reset`)**: Smoothly returns to default isometric angle.

Camera transitions are smoothly interpolated per frame via damping vectors, avoiding disorienting camera cuts.

---

## 5. Picking & Interactive State Sync

1. **Raycasting**:
   - Pointer move and click events raycast against component bounding volumes.
   - Hovered components trigger subtle emissive brightening and cursor pointer feedback.
2. **Click-to-Focus**:
   - Clicking a 3D component updates the global Zustand store (`useEv.getState().select(id)`).
   - The camera smoothly transitions focus to frame the selected component's center of mass.
   - Bi-directionally syncs with the Component Inspector and EV AI Pilot chat context.

---

## 6. Performance Optimization & Memory Management

- **Zero React 19 Dependency Friction**: Avoids R3F peer conflicts by directly managing Three.js inside React lifecycle.
- **Tree-Shaking**: Only imported Three.js classes are included in the production bundle.
- **WebGL Resource Disposal**:
  - `dispose()` traverses the scene graph, explicitly invoking `geometry.dispose()` and `material.dispose()`.
  - WebGLRenderer context cleanly released on component unmount or route change.
- **Smooth 60 FPS**: Animation loop throttles calculations when tab is inactive (`document.hidden`), preserving GPU resources.
