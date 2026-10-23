import { describe, expect, it } from "vitest";
import { parsePilotAction } from "./pilotActions";
import type { TopologyNode } from "./types";

const nodes: TopologyNode[] = [
  { id: "LIT101", type: "sensor", label: "Tank level", unit: "%", lo: 0, hi: 100 },
  { id: "PLC1", type: "controller", label: "Controller", unit: "%", lo: 0, hi: 100 },
];

describe("AI Pilot actions", () => {
  it("requires a complete, validated simulator command", () => {
    expect(parsePilotAction("launch sensor offset on LIT101 at -25", nodes)).toEqual({
      kind: "attack", request: { scenario: "sensor_offset", target: "LIT101", magnitude: -25 },
      label: "Launch Sensor offset on LIT101 at -25%",
    });
    expect(parsePilotAction("launch sensor offset on LIT101", nodes)).toBeNull();
    expect(parsePilotAction("launch sensor offset on PLC1 at -25", nodes)).toBeNull();
    expect(parsePilotAction("launch sensor offset on LIT101 at -250", nodes)).toBeNull();
  });

  it("keeps questions separate from operational commands", () => {
    expect(parsePilotAction("Should we reset the simulation?", nodes)).toBeNull();
    expect(parsePilotAction("reset simulation", nodes)).toEqual({ kind: "reset", label: "Reset the current test scenario" });
    expect(parsePilotAction("switch data source to HAI", nodes)).toEqual({ kind: "source", mode: "hai", label: "Switch data source to HAI" });
    expect(parsePilotAction("pause HAI replay", nodes)).toEqual({ kind: "haiReplay", paused: true, label: "Pause HAI replay" });
    expect(parsePilotAction("go live", nodes)).toEqual({ kind: "timeline", action: "live", label: "Return timeline to current readings" });
  });
});
