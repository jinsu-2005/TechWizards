import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import type { LiveMessage } from "../../lib/types";
import { PlantIntegrityGuard } from "./IncidentPanel";

it("uses actual HAI tags instead of empty simulator pumps and tanks", () => {
  const latest: LiveMessage = {
    t: 1, mode: "hai", alert: null, incident: null, impact: null,
    nodes: [{ id: "P1_LIT01", value: 42, truth: null, score: 1, status: "normal" }],
  };
  const html = renderToStaticMarkup(createElement(PlantIntegrityGuard, { latest, stale: false }));
  expect(html).toContain("HAI reference readings");
  expect(html).toContain("P1_LIT01");
  expect(html).not.toContain("Tank 1");
  expect(html).not.toContain("Virtual sensor fallback");
});

it("does not represent unscored LIVE readings as a normal-range assessment", () => {
  const latest: LiveMessage = { t: 1, mode: "live", alert: null, incident: null, impact: null,
    nodes: [{ id: "LIT101", value: 42, truth: null, score: 0, status: "normal" }] };
  const html = renderToStaticMarkup(createElement(PlantIntegrityGuard, { latest, stale: false, calibrating: true }));
  expect(html).toContain("Detection unavailable");
  expect(html).not.toContain("Nodes in normal range");
  expect(html).not.toContain("No active incident");
});
