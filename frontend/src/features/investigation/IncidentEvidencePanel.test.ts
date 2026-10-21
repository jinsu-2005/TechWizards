import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import type { InvestigationDetail } from "../../lib/types";
import { IncidentEvidencePanel } from "./IncidentEvidencePanel";

const detail: InvestigationDetail = {
  incident: { id: "case1", mode: "sim", status: "open", detected_at: 1,
    origin: [], path: [], path_edges: [], explanation: "", action: "",
    mitre: "", mitre_name: "", baseline_alarms: [], ground_truth: null },
  session_id: "one", updated_at: 1, workflow: {}, events: [], retention: "Bounded",
};

it("makes missing and damaged captures explicit without presenting current settings", () => {
  for (const status of ["not_captured", "integrity_error"] as const) {
    const html = renderToStaticMarkup(createElement(IncidentEvidencePanel, {
      detail: { ...detail, capture: { status } },
    }));
    expect(html).toContain(status === "integrity_error" ? "Integrity check failed" : "Not captured");
    expect(html).toContain("Current source settings cannot identify");
    expect(html).not.toContain("digest verified");
  }
});

it("matches baseline bands by asset identity rather than reading order", () => {
  const html = renderToStaticMarkup(createElement(IncidentEvidencePanel, { detail: {
    ...detail, capture: { status: "captured", sha256: "checksum", payload: {
      captured_at: 1, sample_time: 1, scope: "First observation", limits: "Reported only",
      model: { kind: "mlp", runtime_id: "loaded-id", threshold: 2 },
      baseline: { kind: "3-sigma", artifact_id: "baseline-id", asset_ids: ["OTHER", "LIT101"],
        mean: [0, 50], sd: [1, 2], sigma: 3 },
      source: { mode: "sim" }, topology: { nodes: [], edges: [] },
      readings: [{ id: "LIT101", value: 55, score: 2, status: "suspect" }],
      pre_event_readings: [], initial_assessment: detail.incident,
    } },
  } }));
  expect(html).toContain("44.00 – 56.00");
  expect(html).toContain('scope="row"');
  expect(html).toContain('tabindex="0"');
  expect(html).toContain("Readings recorded at first incident emission");
  expect(html).not.toContain("NaN");
});
