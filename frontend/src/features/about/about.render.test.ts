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

  it("renders all four team members accurately", () => {
    const html = renderToStaticMarkup(createElement(AboutPage));
    expect(html).toContain("Jinsu");
    expect(html).toContain("Jerico Gris");
    expect(html).toContain("Dishon Sam");
    expect(html).toContain("Mohamed Baasil");
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
    expect(html).toContain("What AttackTrace Does (Current Prototype)");
    expect(html).toContain("water-plant process simulation");
    expect(html).toContain("Multi-Variate Anomaly Detection");
    expect(html).toContain("Directional Origin Ranking");
    expect(html).toContain("Propagation Path Tracing");
    expect(html).toContain("Prototype Scope &amp; Pragmatic Boundaries");
    expect(html).toContain("Broader Localization Challenges");
  });

  it("contains navigation actions to monitoring, lab, and metrics", () => {
    const html = renderToStaticMarkup(createElement(AboutPage));
    expect(html).toContain('href="/"');
    expect(html).toContain('href="/lab"');
    expect(html).toContain('href="/metrics"');
  });
});
