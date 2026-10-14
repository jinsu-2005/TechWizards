import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync(new URL("./tokens.css", import.meta.url), "utf8");

const spec: Record<string, string> = {
  bg: "#0b0f14",
  surface: "#121821",
  border: "#1e2733",
  text: "#e6edf3",
  muted: "#7d8590",
  normal: "#2ea97d",
  suspect: "#d29922",
  affected: "#f0883e",
  origin: "#f85149",
  accent: "#4c8dff",
};

describe("design tokens", () => {
  it.each(Object.entries(spec))("--%s = %s", (name, hex) => {
    expect(css).toContain(`--${name}: ${hex};`);
  });

  it("respects reduced motion", () => {
    expect(css).toContain("prefers-reduced-motion");
  });
});
