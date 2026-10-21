import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { MetricsChart } from "./MetricsChart";

it("exposes exact chart values through a semantic table without loading canvas", () => {
  const markup = renderToStaticMarkup(createElement(MetricsChart, {
    rows: [{ label: "Sensor offset", baseline: .25, attacktrace: .875 }],
  }));
  expect(markup).toContain("<svg");
  expect(markup).toContain("<caption>Exact F1 values</caption>");
  expect(markup).toContain("0.875");
  expect(markup).not.toContain("<canvas");
});
