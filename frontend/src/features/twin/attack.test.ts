import { describe, expect, it } from "vitest";
import type { GroundTruthInfo, Incident, LiveMessage, NodeState, Scenario, TopologyNode } from "../../lib/types";
import { attacksByNode, inferSensorKind, setpointDelta, spoofDelta, stateAtDetection } from "./attack";

const TOPO = new Map<string, TopologyNode>([
  ["LIT101", { id: "LIT101", type: "sensor", unit: "%", lo: 0, hi: 100 } as TopologyNode],
  ["MV101", { id: "MV101", type: "actuator", unit: "", lo: 0, hi: 1 } as TopologyNode],
  ["PLC1", { id: "PLC1", type: "controller", unit: "", lo: 0, hi: 1 } as TopologyNode],
]);

const node = (o: Partial<NodeState> & { id: string }): NodeState => ({
  value: 50,
  truth: 50,
  score: 0.1,
  status: "normal",
  ...o,
});

const incident = (gt: GroundTruthInfo | null): Incident =>
  ({
    id: "inc_1",
    status: "open",
    detected_at: 0,
    origin: [{ id: gt?.target ?? "LIT101", type: "sensor", confidence: 1 }],
    path: [],
    path_edges: [],
    explanation: "",
    action: "",
    mitre: "T0856",
    mitre_name: "",
    baseline_alarms: [],
    ground_truth: gt,
  }) as Incident;

const truthOf = (scenario: Scenario, target: string): GroundTruthInfo => ({
  attack_id: "atk_001",
  scenario,
  target,
  started_at: 0,
  mitre: "T0856",
});

const msg = (nodes: NodeState[], inc: Incident | null, setpoints?: Record<string, number>): LiveMessage => ({
  t: 0,
  mode: "sim",
  nodes,
  alert: null,
  incident: inc,
  impact: null,
  setpoints,
});

describe("spoofDelta", () => {
  it("ignores noise under 2% of the tag range", () => {
    expect(spoofDelta(node({ id: "LIT101", value: 50.5, truth: 50 }), TOPO.get("LIT101"))).toBeNull();
  });

  it("reports the signed gap once it is worth drawing", () => {
    expect(spoofDelta(node({ id: "LIT101", value: 50, truth: 75 }), TOPO.get("LIT101"))).toBe(-25);
  });

  it("stays null when there is no physical truth to compare against (LIVE, HAI)", () => {
    expect(spoofDelta(node({ id: "LIT101", value: 50, truth: null }), TOPO.get("LIT101"))).toBeNull();
  });
});

describe("setpointDelta", () => {
  it("is null while the controller holds its authorized target", () => {
    expect(setpointDelta("PLC1", { PLC1: 50 })).toBeNull();
  });

  it("reports how far the target has been moved", () => {
    expect(setpointDelta("PLC1", { PLC1: 75 })).toBe(25);
  });

  it("is null when the backend sends no setpoints at all", () => {
    expect(setpointDelta("PLC1", null)).toBeNull();
  });
});

describe("inferSensorKind", () => {
  it("calls a reading that never moves frozen", () => {
    expect(inferSensorKind([50, 50, 50, 50, 50], [0, -2, -5, -8, -11], 100)).toBe("freeze");
  });

  it("calls a steadily growing error a ramp", () => {
    const deltas = Array.from({ length: 12 }, (_, i) => i * 1.5);
    const reported = deltas.map((d, i) => 50 + d + i * 0.1);
    expect(inferSensorKind(reported, deltas, 100)).toBe("ramp");
  });

  it("calls a settled error a bias, however large the step that made it", () => {
    const deltas = [0, 0, -25, -25, -24, -26, -25, -25, -24, -25];
    const reported = [50, 50, 25, 25, 26, 24, 25, 25, 26, 25];
    expect(inferSensorKind(reported, deltas, 100)).toBe("offset");
  });

  it("needs a real window before it calls anything a ramp", () => {
    expect(inferSensorKind([50, 53, 56, 59], [0, 3, 6, 9], 100)).toBe("offset");
  });
});

describe("attacksByNode", () => {
  it("names the scenario the backend revealed, over what it could infer", () => {
    const m = msg([node({ id: "LIT101", value: 50, truth: 78 })], incident(truthOf("sensor_freeze", "LIT101")));
    expect(attacksByNode(m, TOPO).get("LIT101")?.kind).toBe("freeze");
  });

  it("still marks a spoofed sensor when no ground truth is available", () => {
    const m = msg([node({ id: "LIT101", value: 50, truth: 78 })], incident(null));
    expect(attacksByNode(m, TOPO).get("LIT101")?.kind).toBe("offset");
  });

  it("quotes both readings so the operator sees the size of the lie", () => {
    const m = msg([node({ id: "LIT101", value: 50, truth: 78 })], incident(null));
    expect(attacksByNode(m, TOPO).get("LIT101")?.detail).toBe("reads 50.0 % · really 78.0 %");
  });

  it("marks a displaced setpoint even with no incident open", () => {
    const m = msg([node({ id: "PLC1", value: 0.4, truth: 0.4 })], null, { PLC1: 75 });
    expect(attacksByNode(m, TOPO).get("PLC1")).toMatchObject({ kind: "setpoint", detail: "target moved +25.0 %" });
  });

  it("marks an actuator ranked as the origin as forced, clamping its noisy feedback", () => {
    const m = msg([node({ id: "MV101", value: 1.002, truth: 1, status: "origin" })], incident(null));
    expect(attacksByNode(m, TOPO).get("MV101")).toMatchObject({ kind: "force", detail: "held at 100.0 %" });
  });

  it("drops the chip once the named attack has stopped acting", () => {
    const m = msg([node({ id: "LIT101", value: 50, truth: 50 })], incident(truthOf("sensor_ramp", "LIT101")));
    expect(attacksByNode(m, TOPO).has("LIT101")).toBe(false);
  });

  it("marks nothing while the plant is clean", () => {
    const m = msg([node({ id: "LIT101" }), node({ id: "MV101" })], null, { PLC1: 50 });
    expect(attacksByNode(m, TOPO).size).toBe(0);
  });
});

describe("stateAtDetection", () => {
  const withInc = (id: string | null, level: number) =>
    msg([node({ id: "LIT101", value: level, truth: level })], id ? ({ ...incident(null), id }) : null);

  it("returns the first sample that carried this incident", () => {
    const buffer = [withInc(null, 50), withInc("inc_1", 55), withInc("inc_1", 70)];
    expect(stateAtDetection(buffer, "inc_1").get("LIT101")?.truth).toBe(55);
  });

  it("returns nothing when no incident is open", () => {
    expect(stateAtDetection([withInc(null, 50)], null).size).toBe(0);
  });
});
