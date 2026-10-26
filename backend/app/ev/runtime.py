"""Dynamic EV simulation and observation-only, model-based origin ranking.

Attack truth is held by the injector. Detector.update accepts observations only:
it has no scenario, target or injected-magnitude input.
"""

from __future__ import annotations

import copy
import math
import time
from collections import deque
from typing import Any

DT = 0.5
COMPONENTS = [
    ("TEMP", "Pack temperature", "Sensor", "Energy", "°C", 1.5),
    ("PACK", "Pack voltage", "Sensor", "Energy", "V", 4.0),
    ("CURRENT", "Pack current", "Sensor", "Energy", "A", 3.0),
    ("CELL", "Minimum cell voltage", "Sensor", "Energy", "V", 0.06),
    ("SOC", "State of charge", "Sensor", "Energy", "%", 1.0),
    ("BMS", "Battery management", "Controller", "Energy", "% limit", 5.0),
    ("PEDAL", "Accelerator position", "Sensor", "Powertrain", "%", 3.0),
    ("VCU", "Vehicle control unit", "Controller", "Powertrain", "Nm", 8.0),
    ("INV", "Traction inverter", "Actuator", "Powertrain", "kW", 2.0),
    ("MOTOR", "Traction motor", "Actuator", "Powertrain", "Nm", 8.0),
    ("RPM", "Motor speed", "Sensor", "Powertrain", "rpm", 120.0),
    ("MTEMP", "Motor temperature", "Sensor", "Thermal", "°C", 2.0),
    ("WHEEL", "Wheel speed", "Sensor", "Chassis", "km/h", 3.0),
    ("BRAKE", "Brake control unit", "Controller", "Chassis", "bar", 3.0),
    ("PRESSURE", "Brake pressure", "Sensor", "Chassis", "bar", 3.0),
    ("EPS", "Steering assist", "Actuator", "Chassis", "Nm", 1.0),
    ("ANGLE", "Steering angle", "Sensor", "Chassis", "°", 2.0),
    ("COOL", "Coolant pump", "Actuator", "Thermal", "%", 5.0),
    ("FLOW", "Coolant flow", "Sensor", "Thermal", "L/min", 1.0),
    ("CTEMP", "Coolant temperature", "Sensor", "Thermal", "°C", 2.0),
    ("CAN", "CAN gateway", "Controller", "Network", "ms", 10.0),
    ("DCDC", "DC/DC converter", "Actuator", "Energy", "V", 0.3),
]
BY_ID = {c[0]: c for c in COMPONENTS}
EDGES = [
    ("TEMP", "BMS"),
    ("PACK", "BMS"),
    ("CURRENT", "BMS"),
    ("CELL", "BMS"),
    ("SOC", "BMS"),
    ("BMS", "VCU"),
    ("BMS", "COOL"),
    ("PEDAL", "VCU"),
    ("VCU", "INV"),
    ("INV", "MOTOR"),
    ("MOTOR", "RPM"),
    ("MOTOR", "MTEMP"),
    ("WHEEL", "BRAKE"),
    ("BRAKE", "PRESSURE"),
    ("ANGLE", "EPS"),
    ("COOL", "FLOW"),
    ("FLOW", "CTEMP"),
    ("CTEMP", "TEMP"),
    ("CAN", "VCU"),
    ("CAN", "BMS"),
    ("CAN", "INV"),
    ("PACK", "DCDC"),
]


def topology() -> list[dict[str, Any]]:
    return [
        dict(id=c[0], name=c[1], kind=c[2], system=c[3], unit=c[4], tolerance=c[5])
        for c in COMPONENTS
    ]


class Detector:
    """Transparent residual detector; shares are uncalibrated ranking weights."""

    def __init__(self) -> None:
        self.onsets: dict[str, float] = {}
        self.streak: dict[str, int] = {}

    def update(self, readings: list[dict[str, Any]], t: float) -> dict[str, Any]:
        scores = {}
        for r in readings:
            score = abs(r["value"] - r["expected"]) / BY_ID[r["id"]][5]
            scores[r["id"]] = score
            self.streak[r["id"]] = self.streak.get(r["id"], 0) + 1 if score > 1 else 0
            if self.streak[r["id"]] >= 2:
                self.onsets.setdefault(r["id"], t - DT)
        active = {k for k, v in self.streak.items() if v >= 2}
        candidates = []
        for node in active:
            descendants = {node}
            for _ in range(len(COMPONENTS)):
                descendants |= {b for a, b in EDGES if a in descendants}
            downstream = sum(
                n in active and self.onsets[n] >= self.onsets[node] for n in descendants - {node}
            )
            earlier = min(self.onsets[n] for n in active)
            deviation = min(scores[node] / 10, 1)
            onset = 1 / (1 + self.onsets[node] - earlier)
            causal = min(downstream / 3, 1)
            total = 0.55 * deviation + 0.3 * onset + 0.15 * causal
            candidates.append(
                dict(
                    id=node,
                    score=round(total, 4),
                    deviation=round(deviation, 3),
                    onset=round(onset, 3),
                    topology=round(causal, 3),
                    residual=round(scores[node], 2),
                    onset_s=self.onsets[node],
                )
            )
        candidates.sort(key=lambda c: (-c["score"], c["onset_s"], c["id"]))
        total_score = sum(c["score"] for c in candidates) or 1
        for c in candidates:
            c["share"] = round(c["score"] / total_score, 3)
        root = candidates[0]["id"] if candidates else None
        reachable = {root} if root else set()
        path = []
        for _ in range(len(COMPONENTS)):
            new = [
                (a, b)
                for a, b in EDGES
                if a in reachable
                and b in active
                and b not in reachable
                and self.onsets[b] >= self.onsets[a]
            ]
            if not new:
                break
            for a, b in new:
                path.append(dict(source=a, target=b, onset_s=self.onsets[b]))
                reachable.add(b)
        return dict(
            candidates=candidates[:5],
            affected=sorted(active),
            path=path,
            ambiguous=len(candidates) > 1
            and candidates[0]["score"] - candidates[1]["score"] < 0.12,
            method="EV residual + onset + topology v1",
            weights=dict(deviation=0.55, onset=0.3, topology=0.15),
        )


class EvRuntime:
    def __init__(self) -> None:
        self.t = 0.0
        self.running = True
        self.speed = 64.0
        self.actual_speed = 64.0
        self.reference_speed = 64.0
        self.temperature = 34.0
        self.soc = 82.0
        self.reference_soc = 82.0
        self.reference_previous: dict[str, float] = {}
        self.attack: dict[str, Any] | None = None
        self.last_truth: dict[str, Any] | None = None
        self.truth_revealed = False
        self.detector = Detector()
        self.readings: list[dict[str, Any]] = []
        self.analysis = self.detector.update([], self.t)
        self.history: deque[dict[str, Any]] = deque(maxlen=240)
        self.events: deque[dict[str, Any]] = deque(maxlen=100)
        self.incidents: deque[dict[str, Any]] = deque(maxlen=20)
        self.incident: dict[str, Any] | None = None
        self.clean_streak = 0
        self.seq = 0
        self.last_wall = time.monotonic()
        self.event("baseline", "EV session ready; model-based reference active")
        self.step()

    def event(self, category: str, text: str, asset: str | None = None) -> None:
        self.seq += 1
        self.events.appendleft(
            dict(id=f"EV-E{self.seq}", time_s=self.t, category=category, text=text, asset_id=asset)
        )

    def advance(self) -> None:
        now = time.monotonic()
        elapsed = now - self.last_wall
        if self.running:
            count = min(20, int(elapsed / DT))
            for _ in range(count):
                self.step()
            self.last_wall = self.last_wall + count * DT if count < 20 else now
        else:
            self.last_wall = now

    def launch(self, kind: str, target: str, magnitude: float, duration: float) -> None:
        if self.attack:
            raise ValueError("Stop the active injection before launching another")
        if self.incident and self.incident["status"] != "recovered":
            raise ValueError("Wait for recovery or reset before the next attack")
        if kind in {"bias", "freeze", "replay"} and BY_ID[target][2] != "Sensor":
            raise ValueError("Sensor attacks require a sensor target")
        if kind == "delay" and target != "CAN":
            raise ValueError("Message delay requires CAN gateway")
        if kind in {"tamper", "failure"} and BY_ID[target][2] != "Actuator":
            raise ValueError("Actuator attacks require an actuator target")
        if kind == "failure" and target != "COOL":
            raise ValueError("Physical failure scenario requires the coolant pump")
        self.detector = Detector()
        self.incident = None
        self.truth_revealed = False
        self.last_truth = dict(
            kind=kind, target=target, magnitude=magnitude, duration_s=duration, started_s=self.t
        )
        # Replay uses only observations recorded before injection.
        prior = [
            next(r["value"] for r in h["readings"] if r["id"] == target)
            for h in list(self.history)[-20:]
        ]
        self.attack = {**self.last_truth, "held": prior[-1], "recording": prior}
        self.event("injection", f"{kind} injection started; detector input is observations only")

    def stop(self) -> None:
        if self.attack:
            self.attack = None
            self.event("stop", "Injection ended; monitoring residual recovery")

    def step(self) -> None:
        self.t = round(self.t + DT, 2)
        if self.attack and self.t >= self.attack["started_s"] + self.attack["duration_s"]:
            self.stop()
        a = self.attack
        previous = {r["id"]: r["value"] for r in self.readings}
        wave = math.sin(self.t / 5)
        # Driver profile: traffic-like speed swings around the cruise setpoint. Plant and clean
        # reference share it, so it is driver input, not an anomaly, and stale signals diverge.
        demand = self.speed * (1 + 0.09 * math.sin(self.t / 6) + 0.04 * math.sin(self.t / 2.3))
        pedal = demand / 1.2 + 4 * wave
        pump_request = min(100, max(30, 38 + (previous.get("TEMP", 34) - 34) * 4))
        battery_alarm = (
            previous.get("TEMP", 34) > 45
            or not 365 < previous.get("PACK", 392) < 410
            or previous.get("CELL", 3.8) < 3.3
            or previous.get("CURRENT", 60) > 130
            or previous.get("SOC", 82) < 15
        )
        limit = 48.0 if battery_alarm else 100.0
        gateway = 4 + abs(wave)
        torque_request = max(0, previous.get("PEDAL", pedal) * 2.3 * limit / 100)
        if previous.get("CAN", 4) > 80:
            torque_request *= 0.5
        pump = pump_request
        torque = previous.get("INV", torque_request * 0.22) / 0.22
        steer_request = 2 * math.sin(self.t / 8)
        values = dict(
            TEMP=self.temperature,
            PACK=392 - abs(torque) * 0.025,
            CURRENT=3 + abs(torque) * 0.48,
            CELL=3.82 - abs(torque) * 0.0003,
            SOC=self.soc,
            BMS=limit,
            PEDAL=pedal,
            VCU=torque_request,
            INV=abs(previous.get("VCU", torque_request)) * 0.22,
            MOTOR=torque,
            RPM=self.actual_speed * 82,
            MTEMP=38 + abs(torque) * 0.08,
            WHEEL=self.actual_speed,
            BRAKE=12
            if abs(previous.get("WHEEL", self.actual_speed) - self.actual_speed) > 8
            else 0,
            PRESSURE=previous.get("BRAKE", 0),
            EPS=steer_request,
            ANGLE=steer_request * 8,
            COOL=pump,
            FLOW=previous.get("COOL", pump) * 0.12,
            CTEMP=self.temperature - previous.get("FLOW", pump * 0.12) * 0.3,
            CAN=gateway,
            DCDC=13.8,
        )
        # References describe the clean model under the same driver input, not injector truth.
        clean = self.reference_previous
        clean_request = max(0, clean.get("PEDAL", pedal) * 2.3)
        baseline_torque = clean.get("INV", clean_request * 0.22) / 0.22
        reference = dict(values)
        reference.update(
            TEMP=34,
            SOC=self.reference_soc,
            BMS=100,
            VCU=clean_request,
            MOTOR=baseline_torque,
            INV=abs(clean.get("VCU", clean_request)) * 0.22,
            PACK=392 - baseline_torque * 0.025,
            CURRENT=3 + baseline_torque * 0.48,
            CELL=3.82 - baseline_torque * 0.0003,
            WHEEL=self.reference_speed,
            RPM=self.reference_speed * 82,
            MTEMP=38 + baseline_torque * 0.08,
            BRAKE=12
            if abs(clean.get("WHEEL", self.reference_speed) - self.reference_speed) > 8
            else 0,
            PRESSURE=clean.get("BRAKE", 0),
            COOL=38,
            FLOW=4.56,
            CTEMP=34 - 4.56 * 0.3,
        )
        if a:
            target = a["target"]
            elapsed = self.t - a["started_s"]
            if a["kind"] == "bias":
                values[target] += a["magnitude"]
            elif a["kind"] == "freeze":
                values[target] = a["held"]
            elif a["kind"] == "replay":
                recording = a["recording"]
                values[target] = recording[int(elapsed / DT) % len(recording)]
            elif a["kind"] == "delay":
                values[target] += abs(a["magnitude"])
            elif a["kind"] == "tamper":
                values[target] += a["magnitude"]
            elif a["kind"] == "failure":
                values[target] = 0
        # Coupled state advances from actuator feedback, after tampering.
        self.actual_speed += (
            (demand - self.actual_speed) * 0.3 + (values["MOTOR"] - baseline_torque) * 0.012
        ) * DT
        self.actual_speed = max(0, self.actual_speed)
        self.reference_speed += (demand - self.reference_speed) * 0.3 * DT
        target_temp = 34 + max(0, 38 - values["COOL"]) * 0.43
        self.temperature += (target_temp - self.temperature) * 0.15 * DT
        self.soc = max(0, self.soc - (3 + abs(torque) * 0.48) * DT / 3600 / 150 * 100)
        self.reference_soc = max(
            0, self.reference_soc - reference["CURRENT"] * DT / 3600 / 150 * 100
        )
        self.reference_previous = reference
        self.readings = [
            dict(
                id=c[0],
                value=round(values[c[0]], 3),
                expected=round(reference[c[0]], 3),
                unit=c[4],
                residual=round(abs(values[c[0]] - reference[c[0]]) / c[5], 3),
                time_s=self.t,
                quality="simulated",
            )
            for c in COMPONENTS
        ]
        self.analysis = self.detector.update(self.readings, self.t)
        detected = bool(self.analysis["candidates"])
        if detected and self.incident is None:
            self.incident = dict(
                id=f"EV-I{self.seq + 1}",
                detected_s=self.t,
                status="investigating",
                analysis=copy.deepcopy(self.analysis),
                first_readings=copy.deepcopy(self.readings),
                recovered_s=None,
            )
            self.incidents.appendleft(self.incident)
            self.event(
                "detection",
                "Persistent residual detected; candidate ranking created",
                self.analysis["candidates"][0]["id"],
            )
        if self.incident and self.incident["status"] != "recovered":
            if detected:
                self.incident["analysis"] = copy.deepcopy(self.analysis)
            self.clean_streak = 0 if detected else self.clean_streak + 1
            if not detected and self.clean_streak >= 6:
                self.incident.update(status="recovered", recovered_s=self.t)
                self.event("recovery", "All residuals below threshold for 3 seconds")
        self.history.append(
            dict(
                time_s=self.t,
                readings=copy.deepcopy(self.readings),
                analysis=copy.deepcopy(self.analysis),
            )
        )

    def snapshot(self) -> dict[str, Any]:
        return dict(
            time_s=self.t,
            running=self.running,
            speed=self.speed,
            actual_speed=round(self.actual_speed, 1),
            readings=self.readings,
            analysis=self.analysis,
            incident=self.incident,
            incidents=list(self.incidents),
            history=list(self.history),
            events=list(self.events),
            attack_active=self.attack is not None,
            attack_remaining_s=round(
                max(0, self.attack["started_s"] + self.attack["duration_s"] - self.t), 1
            )
            if self.attack
            else 0,
            truth=self.last_truth if self.truth_revealed else None,
            components=topology(),
            edges=[dict(source=a, target=b) for a, b in EDGES],
            detector=dict(
                kind="model-based residuals",
                threshold=1,
                persistence=2,
                dt_s=DT,
                trained=False,
                reference="clean EV model v1",
            ),
        )
