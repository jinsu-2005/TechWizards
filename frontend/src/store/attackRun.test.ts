import { beforeEach, describe, expect, it } from "vitest";
import type { Incident, LiveMessage, NodeState, TopologyNode } from "../lib/types";
import { effectVisible, QUIET_SAMPLES_TO_END, useAttackRun, type AttackRun } from "./attackRun";

const TOPO = new Map<string, TopologyNode>([
  ["LIT101", { id: "LIT101", type: "sensor", label: "Tank T1 level", unit: "%", lo: 0, hi: 100 }],
  ["MV101", { id: "MV101", type: "actuator", label: "T1 inlet valve", unit: "open", lo: 0, hi: 1 }],
  ["PLC1", { id: "PLC1", type: "controller", label: "T1 controller", unit: "out", lo: 0, hi: 1 }],
]);

const LAUNCH_AT = 1_000_000;

const run = (over: Partial<AttackRun> = {}): AttackRun => ({
  attackId: "atk_001",
  scenario: "sensor_offset",
  target: "LIT101",
  magnitude: -25,
  launchedAt: LAUNCH_AT,
  ...over,
});

const node = (o: Partial<NodeState> & { id: string }): NodeState => ({
  value: 50,
  truth: 50,
  score: 0,
  status: "normal",
  ...o,
});

const incidentAt = (seconds: number, origin = "LIT101"): Incident =>
  ({
    id: "inc_1",
    status: "open",
    detected_at: seconds,
    origin: [{ id: origin, type: "sensor", confidence: 0.6 }],
    path: [],
    path_edges: [],
    explanation: "",
    action: "",
    mitre: "T0856",
    mitre_name: "",
    baseline_alarms: [],
    ground_truth: null,
  }) as Incident;

const msg = (nodes: NodeState[], incident: Incident | null = null, setpoints?: Record<string, number>): LiveMessage => ({
  t: 0,
  mode: "sim",
  nodes,
  alert: null,
  incident,
  impact: null,
  setpoints,
});

describe("effectVisible", () => {
  it("sees a spoofed sensor by the gap between reported and real", () => {
    expect(effectVisible(run(), msg([node({ id: "LIT101", value: 50, truth: 78 })]), TOPO)).toBe(true);
    expect(effectVisible(run(), msg([node({ id: "LIT101", value: 50, truth: 50.3 })]), TOPO)).toBe(false);
  });

  it("sees a forced actuator sitting on its injected command", () => {
    const forced = run({ scenario: "actuator_force", target: "MV101", magnitude: 1 });
    expect(effectVisible(forced, msg([node({ id: "MV101", value: 1, truth: 1 })]), TOPO)).toBe(true);
    expect(effectVisible(forced, msg([node({ id: "MV101", value: 0.4, truth: 0.4 })]), TOPO)).toBe(false);
  });

  it("sees a displaced setpoint", () => {
    const rogue = run({ scenario: "rogue_setpoint", target: "PLC1", magnitude: 25 });
    expect(effectVisible(rogue, msg([node({ id: "PLC1" })], null, { PLC1: 75 }), TOPO)).toBe(true);
    expect(effectVisible(rogue, msg([node({ id: "PLC1" })], null, { PLC1: 50 }), TOPO)).toBe(false);
  });
});

describe("attack run phases", () => {
  beforeEach(() => useAttackRun.getState().clear());

  const observe = (m: LiveMessage) => useAttackRun.getState().observe(m, TOPO);
  const phase = () => useAttackRun.getState().phase;

  it("starts at accepted the moment the backend takes the test", () => {
    useAttackRun.getState().start(run());
    expect(phase()).toBe("accepted");
  });

  it("moves to active only once the effect is visible in telemetry", () => {
    useAttackRun.getState().start(run());
    observe(msg([node({ id: "LIT101", value: 50, truth: 50 })]));
    expect(phase()).toBe("accepted");
    observe(msg([node({ id: "LIT101", value: 50, truth: 78 })]));
    expect(phase()).toBe("active");
  });

  it("reaches detected only when the detector raises an incident after the launch", () => {
    useAttackRun.getState().start(run());
    observe(msg([node({ id: "LIT101", value: 50, truth: 78 })], incidentAt(LAUNCH_AT / 1000 + 5)));
    expect(phase()).toBe("detected");
    expect(useAttackRun.getState().detectedOrigin).toBe("LIT101");
  });

  it("ignores an incident that was already open before the launch", () => {
    useAttackRun.getState().start(run());
    observe(msg([node({ id: "LIT101", value: 50, truth: 78 })], incidentAt(LAUNCH_AT / 1000 - 60)));
    expect(phase()).toBe("active");
    expect(useAttackRun.getState().detectedOrigin).toBeNull();
  });

  it("ends after the effect has been gone for several samples, not on a timer", () => {
    useAttackRun.getState().start(run());
    observe(msg([node({ id: "LIT101", value: 50, truth: 78 })]));
    expect(phase()).toBe("active");
    for (let i = 0; i < QUIET_SAMPLES_TO_END; i++) {
      observe(msg([node({ id: "LIT101", value: 50, truth: 50 })]));
    }
    expect(phase()).toBe("ended");
  });

  it("does not end a run that has not started acting yet", () => {
    useAttackRun.getState().start(run());
    for (let i = 0; i < QUIET_SAMPLES_TO_END + 3; i++) {
      observe(msg([node({ id: "LIT101", value: 50, truth: 50 })]));
    }
    expect(phase()).toBe("accepted");
  });

  it("stays ended once it has ended", () => {
    useAttackRun.getState().start(run());
    observe(msg([node({ id: "LIT101", value: 50, truth: 78 })]));
    for (let i = 0; i < QUIET_SAMPLES_TO_END; i++) observe(msg([node({ id: "LIT101" })]));
    observe(msg([node({ id: "LIT101", value: 50, truth: 78 })]));
    expect(phase()).toBe("ended");
  });

  it("reset clears the run and reports its own phase", () => {
    useAttackRun.getState().start(run());
    useAttackRun.getState().markReset();
    expect(phase()).toBe("reset");
    expect(useAttackRun.getState().run).toBeNull();
  });

  it("bumps the phase sequence once per change, so narration speaks once", () => {
    const seq = () => useAttackRun.getState().phaseSeq;
    useAttackRun.getState().start(run());
    const afterStart = seq();
    observe(msg([node({ id: "LIT101", value: 50, truth: 78 })]));
    const afterActive = seq();
    observe(msg([node({ id: "LIT101", value: 50, truth: 79 })]));
    expect(afterActive).toBe(afterStart + 1);
    expect(seq()).toBe(afterActive);
  });
});
