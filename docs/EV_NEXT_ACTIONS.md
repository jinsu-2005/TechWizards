# AttackTrace EV 3D Digital Twin — Demo Guide & Future Roadmap

This document provides a step-by-step presentation script for evaluators, judges, and stakeholders, followed by the technical roadmap for future expansion of the AttackTrace Electric Vehicle digital twin.

---

## 1. 5-Minute Live Demonstration Script for Judges

### Step 1: Open the Workspaces (0:00 - 0:45)
1. Navigate to `http://127.0.0.1:5174/`.
   - Point out the industrial Water Plant workspace (`Process monitoring`).
   - Highlight that AttackTrace supports multi-domain cyber-physical operations.
2. Click the top system switcher: select **EV Vehicle**.
   - Note the seamless transition to the dark-mode automotive command deck (`/ev`).
   - Mention that the Water Plant remains active in the background without shared state or performance penalty.

### Step 2: The Interactive 3D Skateboard Digital Twin (0:45 - 2:00)
1. Showcase the 3D Vehicle Viewport:
   - **Orbit & Zoom**: Click and drag to smoothly rotate around the vehicle; scroll to zoom into the underbody battery modules.
   - **Camera Presets**: Click **Iso**, **Front**, **Side**, **Rear**, **Top** to demonstrate multi-angle engineering viewpoints.
   - **X-Ray Mode**: Click **X-Ray** to reveal the glowing high-voltage busbars, dual drive units, and liquid cooling piping.
   - **Exploded View**: Click **Exploded** to show the aerodynamic body lifting off the chassis, dispersing internal assemblies into a structural CAD breakdown.
   - **Subsystems Filter**: Click **Energy**, **Powertrain**, and **Thermal** to isolate specific electrical and fluid systems.
   - **Raycast Picking**: Click directly on the front battery pack in the 3D scene. Point out the instant focus animation and the synchronous update in the right-hand **Component Inspector** panel (`Pack temperature`).
   - **Accessibility & Low-End Mode**: Click **2D Schematic** to show the causal SVG topology diagram, then click **3D Twin** to return.

### Step 3: Launching a Cyber-Physical Attack (2:00 - 3:15)
1. Click **Attack lab** in the top navigation (or click "Configure an attack scenario").
2. Select the **Battery sensor spoofing** preset:
   - Injects a $+22^\circ\text{C}$ bias into the battery pack temperature sensor (`TEMP`).
   - Click **Launch injection**.
3. Return to **Vehicle twin**:
   - Observe the live telemetry metrics: Pack temperature escalates from nominal $34^\circ\text{C}$ to $56^\circ\text{C}$.
   - Switch 3D view mode to **Attack View**:
     - The targeted `TEMP` sensor pulses amber and then crimson.
     - The cooling pump (`COOL`) and coolant flow rate (`FLOW`) begin flashing as the thermal management system reacts.
     - Glowing particle streams illuminate along the Catmull-Rom spline curves from `TEMP` toward downstream actuators.

### Step 4: Independent Detection & Origin Localization (3:15 - 4:15)
1. Direct attention to the **Origin investigation** panel:
   - Point out that candidate **#1 TEMP** is ranked top with highest score share ($>70\%$).
   - Emphasize the mathematical score breakdown:
     $$\text{Score} = 0.55 \cdot \text{Deviation} + 0.30 \cdot \text{Onset} + 0.15 \cdot \text{Topology}$$
   - Highlight the **Zero-Truth Guarantee**: The detector does not know the attack configuration; it evaluates purely physical residuals.
2. Expand the incident details and click **Reveal injection truth for evaluation**:
   - Compare the detector's top candidate (`TEMP`) with the revealed injection truth (`injected bias on TEMP`).
   - Point out the detection delay ($<1.5\text{s}$) and the verified match.

### Step 5: EV AI Pilot Grounded Investigation (4:15 - 5:00)
1. Click **Toggle AI Pilot** in the header or click **Investigate with EV AI Pilot**.
2. Click the quick prompt: *"Inspect the selected component"*.
   - Point out that the AI Pilot invokes EV-specific inspection tools (`inspect_ev_component`, `get_ev_telemetry`).
   - Notice the grounded response explaining that while the sensor is reading $56^\circ\text{C}$, the coolant temperature and motor temperature did not experience a physical thermal gradient, indicating a digital spoofing attack rather than a physical thermal runaway.
3. Click **Reset EV simulation** to demonstrate clean session cleanup and baseline return.

---

## 2. Technical Roadmap for Future Expansion

### Phase 1: Real-Time CAN Bus & DBC Decoding
- Integrate a virtual SocketCAN / CAN-FD stream decoding real J1939 and CAN DBC message frames.
- Allow injection of raw arbitration IDs and CRC corruption frames directly into the communication bus.

### Phase 2: Hardware-in-the-Loop (HIL) Bridge
- Support standard OBD-II / UDS / DoIP (ISO 13400) diagnostic socket interfaces over TCP.
- Connect physical automotive microcontrollers (e.g., STM32, Infineon Aurix) to receive commanded torque and report sensor telemetry.

### Phase 3: Physics Expansion & Battery Degradation Modeling
- Add electrochemical cell degradation modeling (SEI layer growth, capacity fade, internal resistance growth over cycle aging).
- Simulate regenerative braking curves under varying road friction coefficients ($\mu$-split surfaces).

### Phase 4: Fleet Telemetry & Swarm Anomaly Detection
- Support multi-vehicle fleet telemetry ingestion.
- Cross-correlate anomalies across vehicles traveling similar routes to distinguish environmental extremes from targeted fleet-wide cyber intrusions.
