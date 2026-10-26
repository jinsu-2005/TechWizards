# AttackTrace EV 3D Digital Twin — Cyber-Physical System & 3D Graphics Architecture

This technical specification details the cyber-physical modeling, sensor-controller-actuator loops, detector mathematical formulations, and 3D graphics rendering architecture of the AttackTrace Electric Vehicle (EV) workspace.

---

## 1. Cyber-Physical System (CPS) Modeling

The EV digital twin simulates an electric passenger vehicle built upon an 800V skateboard chassis architecture. The model is partitioned into **5 interacting engineering subsystems** spanning **22 distinct components**:

```
+-----------------------------------------------------------------------------------+
|                                 CAN BUS GATEWAY                                   |
|                                     (CAN)                                         |
+--------------------------+------------------------------+-------------------------+
                           |                              |
         +-----------------+----------------+             |
         |                                  |             |
+--------v---------+               +--------v---------+   |
|   ENERGY SYSTEM  |               |    POWERTRAIN    |   |
|  - Pack Temp     |               |  - Accelerator   |   |
|  - Pack Voltage  |               |  - VCU           |   |
|  - Pack Current  |               |  - Inverter      |   |
|  - Cell Voltage  |               |  - Motor         |   |
|  - SOC           |               |  - Motor Speed   |   |
|  - BMS           |               +--------+---------+   |
|  - DC/DC         |                        |             |
+--------+---------+                        |             |
         |                                  |             |
         | High-Voltage Bus                 | Mechanical  |
         |                                  | Coupling    |
+--------v---------+               +--------v---------+   |
|  THERMAL SYSTEM  |               |  CHASSIS & STEER |   |
|  - Coolant Pump  |               |  - Wheel Speed   |   |
|  - Coolant Flow  |               |  - Brake Control |   |
|  - Coolant Temp  |               |  - Hydraulic Prs |   |
|  - Motor Temp    |               |  - EPS Rack      |   |
+------------------+               |  - Steer Angle   |   |
                                   +------------------+---+
```

### The 22 Physical & Electronic Components

| ID | Component Name | Subsystem | Kind | Physical Units | Tolerance ($\tau_i$) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `TEMP` | Pack temperature sensor | Energy | Sensor | °C | 1.5 °C |
| `PACK` | Pack voltage sensor | Energy | Sensor | V | 8.0 V |
| `CURRENT` | Pack current sensor | Energy | Sensor | A | 12.0 A |
| `CELL` | Minimum cell voltage | Energy | Sensor | V | 0.05 V |
| `SOC` | State of charge estimator | Energy | Sensor | % | 2.5 % |
| `BMS` | Battery management system | Energy | Controller | % limit | 5.0 % |
| `DCDC` | DC/DC converter | Energy | Actuator | V | 0.4 V |
| `PEDAL` | Accelerator pedal sensor | Powertrain | Sensor | % | 3.0 % |
| `VCU` | Vehicle control unit | Powertrain | Controller | Nm request | 15.0 Nm |
| `INV` | Traction inverter | Powertrain | Controller | Hz | 10.0 Hz |
| `MOTOR` | Traction motor | Powertrain | Actuator | Nm output | 15.0 Nm |
| `RPM` | Motor speed sensor | Powertrain | Sensor | RPM | 120 RPM |
| `MTEMP` | Motor temperature sensor | Thermal | Sensor | °C | 3.0 °C |
| `WHEEL` | Wheel speed sensor | Chassis | Sensor | km/h | 2.0 km/h |
| `BRAKE` | Brake control unit | Chassis | Controller | % demand | 4.0 % |
| `PRESSURE`| Hydraulic brake pressure | Chassis | Sensor | bar | 4.0 bar |
| `EPS` | Electric power steering | Chassis | Actuator | Nm assist | 2.0 Nm |
| `ANGLE` | Steering angle sensor | Chassis | Sensor | deg | 1.5 deg |
| `COOL` | Coolant pump | Thermal | Actuator | L/min request | 2.0 L/min |
| `FLOW` | Coolant flow rate sensor | Thermal | Sensor | L/min | 1.8 L/min |
| `CTEMP` | Coolant temperature sensor | Thermal | Sensor | °C | 2.0 °C |
| `CAN` | CAN bus central gateway | Network | Controller | ms latency | 6.0 ms |

---

## 2. Sensor-Controller-Actuator Simulation Loop

The backend simulator executes a 2 Hz continuous physics step:
1. **Driver Demand Propagation**:
   - Operator or preset cruise demand $v_{\text{target}}$ drives the accelerator position (`PEDAL`).
   - `VCU` computes target torque based on demand, speed error, and `BMS` discharge limits.
   - `INV` converts DC pack voltage to three-phase AC frequency for `MOTOR`.
2. **Kinematic & Energy Balance**:
   - `MOTOR` torque accelerates vehicle mass against aerodynamic drag ($F_{\text{aero}} = \frac{1}{2}\rho C_d A v^2$) and rolling resistance.
   - Power consumption draws current $I = P / V_{\text{pack}}$, decrementing `SOC` and producing Joule heating ($Q = I^2 R t$).
3. **Thermal Dynamics Loop**:
   - `BMS` monitors `TEMP` and commands `COOL` pump speed.
   - Coolant circulation through heat exchangers dissipates motor and battery thermal energy toward ambient.
4. **Clean Model Reference vs Measured Observation**:
   - For every component $i$, the backend simultaneously computes:
     - $\hat{y}_i(t)$: The clean, nominal physical reference model value.
     - $y_i(t)$: The measured sensor/actuator feedback, subject to noise and active attack injection.

---

## 3. Attack Injection Classes

The attack engine injects cyber-physical faults with explicit durations and magnitudes:
1. **Sensor Bias (`bias`)**: Adds constant or scaled offset to sensor feedback (e.g., spoofing battery temperature $+22^\circ\text{C}$).
2. **Sensor Freeze (`freeze`)**: Freezes sensor reading at current value, masking downstream changes.
3. **Sensor Replay (`replay`)**: Replays an earlier historical buffer, hiding real-time transients.
4. **Network Latency / Flooding (`delay`)**: Artificially inflates CAN gateway message transit latency (`CAN`).
5. **Actuator Tampering (`tamper`)**: Overrides control outputs (e.g., cutting traction torque or overriding power steering assist).
6. **Physical Failure (`physics`)**: Blocked coolant flow, inducing physical overheating without digital packet spoofing.

---

## 4. Independent Anomaly Detector & Origin Localization

The detector operates with **zero knowledge** of whether an attack is active, what attack type is used, or what component is targeted.

### Mathematical Formulations

#### 1. Normalized Residual
For each component $i$ at time step $t$:
$$r_i(t) = \frac{|y_i(t) - \hat{y}_i(t)|}{\tau_i}$$
An anomaly flag is asserted when $r_i(t) \ge 1.0$.

#### 2. Temporal Persistence Filter
To eliminate transient noise steps and single-sample spikes, an alert is triggered only when two consecutive samples exceed threshold:
$$\text{Alert}_i(t) = \left(r_i(t) \ge 1.0\right) \land \left(r_i(t-1) \ge 1.0\right)$$
Upon assertion, the component's onset timestamp $t_{\text{onset}, i}$ is frozen.

#### 3. Hypothesis Scoring & Origin Localization
Candidates with persistent residuals are ranked by score $S_i$:
$$S_i = 0.55 \cdot D_i + 0.30 \cdot O_i + 0.15 \cdot T_i$$

Where:
- **Deviation Factor ($D_i$)**:
  $$D_i = \min\left(1.0, \frac{r_i(t)}{5.0}\right)$$
- **Onset Promptness ($O_i$)**:
  $$O_i = \max\left(0.0, 1.0 - \frac{t_{\text{onset}, i} - t_{\text{incident\_first}}}{8.0}\right)$$
  Components that deviated first receive maximum promptness score.
- **Topological Reachability ($T_i$)**:
  $$T_i = \frac{|\text{DownstreamReach}(i) \cap \text{AffectedSignals}|}{\max(1, |\text{AffectedSignals}|)}$$
  Components situated upstream in the physical causal graph receive higher topological centrality weight.

#### 4. Normalized Score Share
$$P_i = \frac{S_i}{\sum_{k \in \text{Candidates}} S_k}$$
These shares are presented to the operator as normalized ranking weights, clearly documented as heuristic scores rather than probabilistic certainty.

---

## 5. 3D Graphics Architecture (Three.js)

### Integration & Lifecycle Management
- Direct Three.js (`three` + `@types/three`) integration embedded in `frontend/src/features/ev/3d/`.
- Hosted inside a React `useRef<HTMLDivElement>` with explicit `dispose()` cleanup for all geometries, materials, textures, and requestAnimationFrame loops.
- Bundled exclusively inside the lazy-loaded `EvWorkspace` route chunk (`dist/assets/EvWorkspace-*.js`), ensuring 0 kB footprint on the Water Plant workspace.

### Procedural Geometry Pipeline
- **Aerodynamic Sedan Body**: Custom multi-section extruded shapes forming sports coupe silhouette, curved roofline, panoramic glass canopy, front lightbars, rear diffuser, and LED light strip.
- **22 Physical Subsystems**:
  - Battery pack: Skateboard aluminum tray containing 12 individual cell modules, battery management controller, and orange high-voltage busbars.
  - Powertrain: Dual electric drive units (front/rear), inverter casing with cooling fins, and drive half-shafts.
  - Chassis: 4 independent rotating wheels with treaded tires, alloy rims, ventilated disc brakes, red calipers, and EPS rack and pinion.
  - Thermal loop: Dual coolant loop with electric pump, front radiator, and Catmull-Rom tubular piping.
  - Network: Central CAN gateway hub with glowing holographic data bus.

### Shader & Material Hierarchy
- **PBR Metallic Paint**: Physical material with metalness 0.85, roughness 0.22, clearcoat 0.6, reflecting environment lighting.
- **Holographic X-Ray Material**: Semi-transparent double-sided shader (opacity 0.22) with rim lighting effect exposing internal skateboard mechanics.
- **Dynamic Anomaly Shaders**: Emissive pulsing materials driven by normalized residual $r_i$:
  - Nominal: Cyan glow (`#00e5ff`, intensity 0.2)
  - Anomalous: Amber strobe (`#ffb300`, intensity 0.8)
  - Primary Attack Origin: Crimson alarm pulse (`#ff1744`, intensity 1.5)

### Particle & Causal Spline Network
- Causal graph edges are instantiated as 3D Catmull-Rom splines between component coordinates.
- When an attack propagates, dynamic point-cloud particle streams traverse downstream along the splines at 4 units/s, providing real-time visual comprehension of physical fault propagation.
