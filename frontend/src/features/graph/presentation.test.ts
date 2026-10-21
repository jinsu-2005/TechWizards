import { describe, expect, it } from "vitest";
import { processGroup, pulsePhase } from "./presentation";

describe("inferred graph animation", () => {
  it("preserves relative onset order even beyond the former six-second cap", () => {
    const phases = [0, 10, 30, 100].map((n) => pulsePhase(n, 100));
    expect(phases).toEqual([0, .06, .18, .6]);
    expect(pulsePhase(null, 100)).toBe(0);
    expect(pulsePhase(Number.NaN, 100)).toBe(0);
    expect(pulsePhase(-10, 100)).toBe(0);
  });
  it("groups HAI tags without mistaking SIM pumps for HAI processes", () => {
    expect(processGroup("P1_FT01")).toBe("P1");
    expect(processGroup("P4_ST01")).toBe("P4");
    expect(processGroup("P101")).toBe("Other");
  });
});
