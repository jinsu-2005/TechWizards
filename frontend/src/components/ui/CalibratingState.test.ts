import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CalibratingState } from "./CalibratingState";

const html = (p: number | null): string =>
  renderToStaticMarkup(createElement(CalibratingState, { progress: p }));

describe("CalibratingState", () => {
  it("shows the ring and the label with a percentage", () => {
    const m = html(0.42);
    expect(m).toContain("Calibrating 42%");
    expect(m).toContain("<svg");
    expect(m).toContain('role="status"');
  });

  it("shows the label without a percentage when progress is unknown", () => {
    const m = html(null);
    expect(m).toContain(">Calibrating<");
    expect(m).not.toContain("%");
  });

  it("clamps an out-of-range progress value, ring and label alike", () => {
    expect(html(1.4)).toContain("Calibrating 100%");
    expect(html(-0.2)).toContain("Calibrating 0%");
  });

  it("explains rejected readings and avoids promising a completion time", () => {
    const m = renderToStaticMarkup(createElement(CalibratingState, { progress: .1, source: {
      mode: "live", connected: true, protocol: "modbus", state: "calibrating",
      calibration: { stage: "blocked", collected_samples: 60, target_samples: 600, skipped_samples: 8, elapsed_s: 50, remaining_s: null, blockers: ["LIT101: frozen"] },
    } }));
    expect(m).toContain("Calibration needs clean readings");
    expect(m).toContain("LIT101: frozen");
    expect(m).not.toContain("remaining, then");
  });

  it("distinguishes model training from a completed recording", () => {
    const m = renderToStaticMarkup(createElement(CalibratingState, { progress: 1, source: {
      mode: "live", connected: true, protocol: "modbus", state: "calibrating",
      calibration: { stage: "training", collected_samples: 600, target_samples: 600, skipped_samples: 0, elapsed_s: 300, blockers: [] },
    } }));
    expect(m).toContain("Training LIVE detector");
    expect(m).not.toContain("Calibrating 100%");
  });
});
