import { describe, expect, it } from "vitest";
import { buildBriefing, describeAttack, evidenceLine, narrationFor, PHASE_LABEL, type AttackPhase } from "./briefing";
import type { LiveMessage, NodeState, Scenario, TopologyNode } from "./types";

const NODES: Record<string, TopologyNode> = {
  LIT101: { id: "LIT101", type: "sensor", label: "Tank T1 level", unit: "%", lo: 0, hi: 100 },
  FIT201: { id: "FIT201", type: "sensor", label: "Filter flow", unit: "L/s", lo: 0, hi: 12 },
  PIT301: { id: "PIT301", type: "sensor", label: "Filter pressure", unit: "bar", lo: 0, hi: 2.5 },
  LIT301: { id: "LIT301", type: "sensor", label: "Tank T2 level", unit: "%", lo: 0, hi: 100 },
  MV101: { id: "MV101", type: "actuator", label: "T1 inlet valve", unit: "open", lo: 0, hi: 1 },
  P101: { id: "P101", type: "actuator", label: "Transfer pump", unit: "speed", lo: 0, hi: 1 },
  P301: { id: "P301", type: "actuator", label: "T2 outlet pump", unit: "speed", lo: 0, hi: 1 },
  PLC1: { id: "PLC1", type: "controller", label: "T1 controller", unit: "out", lo: 0, hi: 1 },
  PLC2: { id: "PLC2", type: "controller", label: "T2 controller", unit: "out", lo: 0, hi: 1 },
};

const SENSORS = ["LIT101", "FIT201", "PIT301", "LIT301"] as const;
const CONTROLLING = ["LIT101", "LIT301"] as const;
const PASSIVE = ["FIT201", "PIT301"] as const;

const describe_ = (scenario: Scenario, target: string, magnitude: number) =>
  describeAttack(scenario, target, magnitude, NODES[target]);

describe("describeAttack covers every valid scenario and target", () => {
  const combinations: [Scenario, readonly string[], number[]][] = [
    ["sensor_freeze", SENSORS, [0]],
    ["sensor_offset", SENSORS, [25, -25]],
    ["sensor_ramp", SENSORS, [30, -30]],
    ["actuator_force", ["MV101", "P101", "P301"], [1, 0]],
    ["rogue_setpoint", ["PLC1", "PLC2"], [25, -25]],
  ];

  it("produces two non-empty sentences for every combination", () => {
    for (const [scenario, targets, magnitudes] of combinations) {
      for (const target of targets) {
        for (const magnitude of magnitudes) {
          const story = describe_(scenario, target, magnitude);
          expect(story.what.length, `${scenario}/${target}`).toBeGreaterThan(10);
          expect(story.next.length, `${scenario}/${target}`).toBeGreaterThan(10);
          expect(story.what.endsWith("."), `${scenario}/${target}`).toBe(true);
        }
      }
    }
  });

  it("names the targeted component in every combination", () => {
    for (const [scenario, targets, magnitudes] of combinations) {
      for (const target of targets) {
        for (const magnitude of magnitudes) {
          expect(describe_(scenario, target, magnitude).what).toContain(target);
        }
      }
    }
  });

  it("never claims a detection", () => {
    for (const [scenario, targets, magnitudes] of combinations) {
      for (const target of targets) {
        for (const magnitude of magnitudes) {
          const story = describe_(scenario, target, magnitude);
          expect(`${story.what} ${story.next}`.toLowerCase()).not.toContain("detect");
        }
      }
    }
  });
});

describe("sensor freeze", () => {
  it("says the reading is stuck while reality moves", () => {
    expect(describe_("sensor_freeze", "LIT101", 0).what).toContain("repeating one captured reading");
  });

  it("warns that the controller reading it is being misled", () => {
    expect(describe_("sensor_freeze", "LIT101", 0).next).toContain("PLC1");
    expect(describe_("sensor_freeze", "LIT301", 0).next).toContain("PLC2");
  });

  it("says plainly that a display-only sensor changes no equipment", () => {
    for (const target of PASSIVE) {
      expect(describe_("sensor_freeze", target, 0).next).toContain("no equipment here is controlled");
    }
  });

  it("marks the direction as held rather than up or down", () => {
    expect(describe_("sensor_freeze", "FIT201", 0).direction).toBe("hold");
  });
});

describe("sensor offset", () => {
  it("quotes the amount and the direction of the lie with the tag's unit", () => {
    expect(describe_("sensor_offset", "FIT201", -3, ).what).toContain("3.0 L/s below");
    expect(describe_("sensor_offset", "PIT301", 0.5).what).toContain("0.50 bar above");
  });

  it("a falsely high T1 level makes PLC1 drain the tank", () => {
    const next = describe_("sensor_offset", "LIT101", 25).next;
    expect(next).toContain("closing inlet valve MV101 and speeding up transfer pump P101");
    expect(next).toContain("falls");
  });

  it("a falsely low T1 level makes PLC1 fill the tank", () => {
    const next = describe_("sensor_offset", "LIT101", -25).next;
    expect(next).toContain("opening inlet valve MV101 further and slowing transfer pump P101");
    expect(next).toContain("rises");
  });

  it("a falsely high T2 level speeds the outlet pump, a falsely low one slows it", () => {
    expect(describe_("sensor_offset", "LIT301", 25).next).toContain("speeding up outlet pump P301");
    expect(describe_("sensor_offset", "LIT301", -25).next).toContain("slowing outlet pump P301");
  });

  it("says a display-only sensor moves no equipment", () => {
    for (const target of PASSIVE) {
      expect(describe_("sensor_offset", target, 1).next).toContain("no equipment here is controlled");
    }
  });
});

describe("sensor ramp", () => {
  it("says the error is still growing rather than fully applied", () => {
    const story = describe_("sensor_ramp", "LIT101", 30);
    expect(story.what).toContain("growing toward 30 %");
    expect(story.next).toContain("still building");
  });

  it("carries the same control consequences as an offset of the same sign", () => {
    for (const target of CONTROLLING) {
      expect(describe_("sensor_ramp", target, 30).next).toContain(
        describe_("sensor_offset", target, 30).next.split(" responds by ")[1]?.slice(0, 30) ?? "",
      );
    }
  });
});

describe("actuator force", () => {
  it("describes the valve as open or closed, and the pumps as on or off", () => {
    expect(describe_("actuator_force", "MV101", 1).what).toContain("held open");
    expect(describe_("actuator_force", "MV101", 0).what).toContain("held closed");
    expect(describe_("actuator_force", "P101", 1).what).toContain("held on");
    expect(describe_("actuator_force", "P301", 0).what).toContain("held off");
  });

  it("states each command's effect as a tendency, not a certainty", () => {
    for (const target of ["MV101", "P101", "P301"]) {
      for (const magnitude of [0, 1]) {
        expect(describe_("actuator_force", target, magnitude).next).toContain("tends to");
      }
    }
  });

  it("forcing the inlet open fills T1 and forcing it closed drains T1", () => {
    expect(describe_("actuator_force", "MV101", 1).next).toContain("tends to fill");
    expect(describe_("actuator_force", "MV101", 0).next).toContain("tends to drain");
  });

  it("forcing the transfer pump on moves water from T1 to T2", () => {
    const next = describe_("actuator_force", "P101", 1).next;
    expect(next).toContain("T1 tends to fall");
    expect(next).toContain("T2 tends to rise");
  });

  it("forcing the outlet pump on drains T2 and off fills it", () => {
    expect(describe_("actuator_force", "P301", 1).next).toContain("tends to drain");
    expect(describe_("actuator_force", "P301", 0).next).toContain("tends to fill");
  });
});

describe("rogue setpoint", () => {
  it("says the target moved, not the tank", () => {
    for (const target of ["PLC1", "PLC2"]) {
      for (const magnitude of [25, -25]) {
        expect(describe_("rogue_setpoint", target, magnitude).next).toContain(
          "The target moved, not the tank level itself.",
        );
      }
    }
  });

  it("a higher PLC1 target opens the inlet and slows transfer", () => {
    expect(describe_("rogue_setpoint", "PLC1", 25).next).toContain("opens MV101 further and slows P101");
    expect(describe_("rogue_setpoint", "PLC1", -25).next).toContain("closes MV101 and speeds up P101");
  });

  it("a higher PLC2 target slows the outlet pump", () => {
    expect(describe_("rogue_setpoint", "PLC2", 25).next).toContain("slows P301");
    expect(describe_("rogue_setpoint", "PLC2", -25).next).toContain("speeds up P301");
  });

  it("quotes the setpoint change as a percentage of level", () => {
    expect(describe_("rogue_setpoint", "PLC1", 25).what).toContain("25 % above");
  });
});

const sample = (nodes: Partial<NodeState>[]): LiveMessage => ({
  t: 0,
  mode: "sim",
  nodes: nodes.map((n) => ({ id: "LIT101", value: 50, truth: 50, score: 0, status: "normal", ...n })),
  alert: null,
  incident: null,
  impact: null,
});

describe("evidenceLine", () => {
  it("spells out reported against real when they differ", () => {
    const line = evidenceLine("sim", "LIT101", sample([{ value: 50, truth: 78 }]), NODES.LIT101);
    expect(line).toBe("LIT101 reports 50.0 %. The real value is 78.0 %.");
  });

  it("says so when the reading is honest", () => {
    const line = evidenceLine("sim", "LIT101", sample([{ value: 50, truth: 50.2 }]), NODES.LIT101);
    expect(line).toContain("matches the real value");
  });

  it("stays silent outside SIM, where there is no physical truth to show", () => {
    expect(evidenceLine("live", "LIT101", sample([{ value: 50, truth: null }]), NODES.LIT101)).toBeNull();
    expect(evidenceLine("hai", "LIT101", sample([{ value: 50, truth: 78 }]), NODES.LIT101)).toBeNull();
  });
});

describe("buildBriefing phases", () => {
  const input = (phase: AttackPhase, detectedOrigin: string | null = null) => ({
    scenario: "sensor_offset" as Scenario,
    target: "LIT101",
    magnitude: -25,
    phase,
    mode: "sim" as const,
    message: sample([{ value: 50, truth: 78 }]),
    topo: NODES.LIT101,
    detectedOrigin,
  });

  it("gives every phase its own label", () => {
    const labels = new Set(Object.values(PHASE_LABEL));
    expect(labels.size).toBe(Object.keys(PHASE_LABEL).length);
  });

  it("acknowledges the launch before any telemetry has moved", () => {
    const brief = buildBriefing(input("accepted"));
    expect(brief.what).toContain("Test accepted for LIT101");
    expect(brief.next).toContain("Watch LIT101");
  });

  it("never says detected until the detector has reported", () => {
    for (const phase of ["accepted", "active", "ended", "reset"] as const) {
      const brief = buildBriefing(input(phase));
      expect(`${brief.what} ${brief.next}`.toLowerCase()).not.toContain("detector has raised");
    }
  });

  it("names the detector's leading origin as a hypothesis once it reports", () => {
    const brief = buildBriefing(input("detected", "LIT101"));
    expect(brief.next).toContain("leading origin");
    expect(brief.next).toContain("hypothesis");
  });

  it("says the origin is still being ranked when the detector has not named one", () => {
    expect(buildBriefing(input("detected")).next).toContain("still being ranked");
  });

  it("says the plant recovers when the test ends, and drops the direction cue", () => {
    const brief = buildBriefing(input("ended"));
    expect(brief.next).toContain("reporting honestly again");
    expect(brief.direction).toBe("none");
  });

  it("promises that reset keeps saved investigations", () => {
    const brief = buildBriefing(input("reset"));
    expect(brief.next).toContain("Saved investigations are kept");
    expect(brief.evidence).toBeNull();
  });

  it("carries the direction of a falsely low reading", () => {
    expect(buildBriefing(input("active")).direction).toBe("down");
  });
});

describe("narrationFor", () => {
  it("fits inside the speech endpoint's limit for every combination", () => {
    const combos: [Scenario, string, number][] = [
      ["sensor_freeze", "LIT101", 0],
      ["sensor_offset", "LIT301", 25],
      ["sensor_ramp", "LIT101", -30],
      ["actuator_force", "MV101", 1],
      ["rogue_setpoint", "PLC1", 25],
    ];
    for (const [scenario, target, magnitude] of combos) {
      for (const phase of ["accepted", "active", "detected", "ended"] as const) {
        const line = narrationFor(
          buildBriefing({
            scenario,
            target,
            magnitude,
            phase,
            mode: "sim",
            message: null,
            topo: NODES[target],
            detectedOrigin: "LIT101",
          }),
        );
        expect(line.length, `${scenario}/${target}/${phase}`).toBeLessThanOrEqual(390);
        expect(line.length).toBeGreaterThan(20);
      }
    }
  });
});
