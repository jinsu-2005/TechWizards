import { describe, expect, it } from "vitest";
import { conciseSpeech, incidentBrief, parseVoiceCommand } from "./voice";

describe("voice commands", () => {
  it("restricts executable commands to navigation and selected assets", () => {
    expect(parseVoiceCommand("open process graph", ["PLC1"])).toEqual({ kind: "view", view: "graph", label: "Process graph" });
    expect(parseVoiceCommand("show PLC1", ["PLC1"])).toEqual({ kind: "selectAsset", asset: "PLC1" });
    expect(parseVoiceCommand("open investigations", [])).toEqual({ kind: "navigate", path: "/investigations", label: "Investigations" });
    expect(parseVoiceCommand("isolate PLC1", ["PLC1"])).toEqual({ kind: "ask", text: "isolate PLC1" });
  });
  it("keeps narration short and explicit about uncertainty", () => {
    const brief = incidentBrief({ id: "case", status: "open", detected_at: 0, origin: [{ id: "PLC1", type: "controller", confidence: 0.7 }], path: [], path_edges: [], explanation: "", action: "", mitre: "", mitre_name: "", baseline_alarms: [], ground_truth: null, ambiguous: true }, "sim");
    expect(brief).toContain("origin is uncertain");
    expect(conciseSpeech("### Origin\n\n**PLC1** [evidence](/incident)\nNext check")).toBe("Origin PLC1 link Next check");
  });
});
