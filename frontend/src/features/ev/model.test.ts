import { describe, expect, it } from "vitest";
import { componentStatus, formatReading, validTargets, type Component, type Frame } from "./model";

describe("EV evidence presentation", () => {
  const components: Component[] = [
    { id: "TEMP", name: "Temperature", kind: "Sensor", system: "Energy", unit: "°C", tolerance: 1.5 },
    { id: "COOL", name: "Pump", kind: "Actuator", system: "Thermal", unit: "%", tolerance: 5 },
    { id: "CAN", name: "Gateway", kind: "Controller", system: "Network", unit: "ms", tolerance: 10 },
  ];
  it("only permits compatible injection targets", () => {
    expect(validTargets("bias", components).map((c) => c.id)).toEqual(["TEMP"]);
    expect(validTargets("delay", components).map((c) => c.id)).toEqual(["CAN"]);
    expect(validTargets("tamper", components).map((c) => c.id)).toEqual(["COOL"]);
  });
  it("uses inferred analysis for labels rather than injected targets", () => {
    const frame: Frame = { time_s: 5, readings: [], analysis: { candidates: [], affected: ["COOL"], path: [], ambiguous: false, method: "test", weights: { deviation: .55, onset: .3, topology: .15 } } };
    expect(componentStatus(frame, "TEMP")).toBe("Within reference");
    expect(componentStatus(frame, "COOL")).toBe("Anomalous");
    expect(formatReading(undefined)).toBe("No sample");
  });
});
