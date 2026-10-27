import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AboutPage } from "./AboutPage";

describe("AboutPage rendering", () => {
  it("renders the primary project title, problem statement ID, and hackathon details", () => {
    const html = renderToStaticMarkup(createElement(AboutPage));
    expect(html).toContain("The Attack-Localization Problem");
    expect(html).toContain("PROBLEM ID · AI-07");
    expect(html).toContain("SUSTAINATHON 2026");
    expect(html).toContain("TEAM TECHWIZARDS");
    expect(html).toContain("AttackTrace");
  });

  it("renders the four team members by name only", () => {
    const html = renderToStaticMarkup(createElement(AboutPage));
    expect(html).toContain("Jinsu");
    expect(html).toContain("Jerico Gris");
    expect(html).toContain("Dishon Sam");
    expect(html).toContain("Mohamed Baasil");
    expect(html).not.toContain("AI Architecture");
  });

  it("explains the core attack-localization problem and 5 failure vectors", () => {
    const html = renderToStaticMarkup(createElement(AboutPage));
    expect(html).toContain("Detecting an anomaly does not reveal whether it began in a");
    expect(html).toContain("Sensors");
    expect(html).toContain("Communication Channels");
    expect(html).toContain("Controllers (PLCs)");
    expect(html).toContain("Firmware Components");
    expect(html).toContain("Physical Actuators");
  });

  it("describes prototype capabilities and engineering boundaries honestly", () => {
    const html = renderToStaticMarkup(createElement(AboutPage));
    expect(html).toContain("What AttackTrace does");
    expect(html).toContain("Anomaly detection");
    expect(html).toContain("Origin ranking");
    expect(html).toContain("Propagation path");
    expect(html).toContain("Demonstrated");
    expect(html).toContain("Not claimed");
  });

  it("contains navigation actions to monitoring, lab, and metrics", () => {
    const html = renderToStaticMarkup(createElement(AboutPage));
    expect(html).toContain('href="/"');
    expect(html).toContain('href="/lab"');
    expect(html).toContain('href="/metrics"');
  });
});
