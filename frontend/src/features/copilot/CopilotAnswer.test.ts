import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { CopilotAnswer } from "./CopilotAnswer";

it("escapes untrusted content while preserving supported emphasis", () => {
  const html = renderToStaticMarkup(createElement(CopilotAnswer, { content: "**Assessment**\n<img src=x onerror=alert(1)> **Uncertain** `LIT101`" }));
  expect(html).not.toContain("<img");
  expect(html).toContain("&lt;img");
  expect(html).toContain("<strong>Uncertain</strong>");
});

it("collapses technical references while leaving uncertainty visible", () => {
  const html = renderToStaticMarkup(createElement(CopilotAnswer, { content: "### Saved incident evidence\nRuntime hash abc\n\n**Propagation uncertainty:** inferred only\n\n**Alternative explanations:** benign fault" }));
  expect(html).toContain("<summary");
  expect(html).toContain("Saved incident evidence</summary>");
  expect(html).toContain("Propagation uncertainty</h3>");
  expect(html).toContain("Alternative explanations</h3>");
  expect(html).not.toContain("<details open");
});
