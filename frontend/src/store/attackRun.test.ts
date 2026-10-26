import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Incident, LiveMessage, NodeState, TopologyNode } from "../lib/types";
import { ACCEPTED_DWELL_MS, effectVisible, QUIET_MS_TO_END, useAttackRun, type AttackRun } from "./attackRun";

const TOPO = new Map<string, TopologyNode>([
  ["LIT101", { id: "LIT101", type: "sensor", label: "Tank T1 level", unit: "%", lo: 0, hi: 100 }],
  ["MV101", { id: "MV101", type: "actuator", label: "T1 inlet valve", unit: "open", lo: 0, hi: 1 }],
  ["PLC1", { id: "PLC1", type: "controller", label: "T1 controller", unit: "out", lo: 0, hi: 1 }],
]);

/** Far enough in the past that the acceptance dwell has elapsed in every test but its own. */
const LAUNCH_AT = Date.now() - 10_000;

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

  it("sees a freeze by the reading not moving, even while it sits near the real value", () => {
    const frozen = run({ scenario: "sensor_freeze", magnitude: 0 });
    const held = msg([node({ id: "LIT101", value: 50.68, truth: 50.7 })]);
    expect(effectVisible(frozen, held, TOPO, 50.68)).toBe(true);
    // Released, the reading moves again with the plant's own noise.
    expect(effectVisible(frozen, msg([node({ id: "LIT101", value: 50.71, truth: 50.7 })]), TOPO, 50.68)).toBe(false);
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

  it("holds the acceptance long enough to be read, even when telemetry is instant", () => {
    useAttackRun.getState().start(run({ launchedAt: Date.now() }));
    observe(msg([node({ id: "LIT101", value: 50, truth: 78 })]));
    expect(phase()).toBe("accepted");
    expect(ACCEPTED_DWELL_MS).toBeGreaterThan(300);
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

  const quiet = () => msg([node({ id: "LIT101", value: 50, truth: 50 })]);
  const acting = () => msg([node({ id: "LIT101", value: 50, truth: 78 })]);

  it("ends once the effect has been gone for the full quiet window", () => {
    vi.useFakeTimers();
    try {
      useAttackRun.getState().start(run({ launchedAt: Date.now() - 10_000 }));
      observe(acting());
      expect(phase()).toBe("active");
      observe(quiet());
      vi.advanceTimersByTime(QUIET_MS_TO_END + 10);
      observe(quiet());
      expect(phase()).toBe("ended");
    } finally {
      vi.useRealTimers();
    }
  });

  it("survives a reading that momentarily matches reality, as a freeze does", () => {
    useAttackRun.getState().start(run({ scenario: "sensor_freeze", magnitude: 0 }));
    observe(acting());
    for (let i = 0; i < 20; i++) observe(quiet()); // many samples, but no elapsed time
    expect(phase()).toBe("active");
  });

  it("keeps a freeze active on a noisy tag whose real value wanders past the held one", () => {
    vi.useFakeTimers();
    try {
      useAttackRun.getState().start(run({ scenario: "sensor_freeze", target: "LIT101", magnitude: 0, launchedAt: Date.now() - 10_000 }));
      // The reported value never changes; the real one drifts across it.
      for (const truth of [78, 50.4, 50.1, 50.2, 50.3, 50.5, 44]) {
        observe(msg([node({ id: "LIT101", value: 50.25, truth })]));
        vi.advanceTimersByTime(1000);
      }
      expect(phase()).toBe("active");
    } finally {
      vi.useRealTimers();
    }
  });

  it("does not end a run that has not started acting yet", () => {
    vi.useFakeTimers();
    try {
      useAttackRun.getState().start(run({ launchedAt: Date.now() - 10_000 }));
      observe(quiet());
      vi.advanceTimersByTime(QUIET_MS_TO_END * 3);
      observe(quiet());
      expect(phase()).toBe("accepted");
    } finally {
      vi.useRealTimers();
    }
  });

  it("stays ended once it has ended", () => {
    vi.useFakeTimers();
    try {
      useAttackRun.getState().start(run({ launchedAt: Date.now() - 10_000 }));
      observe(acting());
      observe(quiet());
      vi.advanceTimersByTime(QUIET_MS_TO_END + 10);
      observe(quiet());
      expect(phase()).toBe("ended");
      observe(acting());
      expect(phase()).toBe("ended");
    } finally {
      vi.useRealTimers();
    }
  });

  it("reset reports its own phase and keeps the run so the card can say so", () => {
    useAttackRun.getState().start(run());
    useAttackRun.getState().markReset();
    expect(phase()).toBe("reset");
    expect(useAttackRun.getState().run?.target).toBe("LIT101");
  });

  it("telemetry cannot drag a reset run back into active", () => {
    useAttackRun.getState().start(run());
    useAttackRun.getState().markReset();
    observe(msg([node({ id: "LIT101", value: 50, truth: 78 })]));
    expect(phase()).toBe("reset");
  });

  it("leaving SIM clears the run entirely", () => {
    useAttackRun.getState().start(run());
    useAttackRun.getState().clear();
    expect(useAttackRun.getState().run).toBeNull();
    expect(phase()).toBe("idle");
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
