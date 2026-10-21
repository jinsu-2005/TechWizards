import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import postcss from "postcss";
import tailwindcss from "@tailwindcss/postcss";

const css = readFileSync(new URL("./tokens.css", import.meta.url), "utf8");

const spec: Record<string, string> = {
  bg: "#0b0f14",
  surface: "#121821",
  border: "#1e2733",
  text: "#e6edf3",
  muted: "#9aa6b5",
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

  it("generates translucent surfaces, borders and SVG labels", async () => {
    const result = await postcss([tailwindcss({ optimize: false })]).process(
      '@import "tailwindcss"; @config "../../tailwind.config.js"; @source inline("bg-surface/80 border-border/70 fill-muted/40 bg-accent/15");',
      { from: fileURLToPath(new URL("./token-fixture.css", import.meta.url)) },
    );
    for (const [selector, property, token, alpha] of [
      [".bg-surface\\/80", "background-color", "--surface-rgb", "80%"],
      [".border-border\\/70", "border-color", "--border-rgb", "70%"],
      [".fill-muted\\/40", "fill", "--muted-rgb", "40%"],
      [".bg-accent\\/15", "background-color", "--accent-rgb", "15%"],
    ] as const) {
      let value = "";
      result.root.walkRules(selector, (rule) => { rule.walkDecls(property, (decl) => { value = decl.value; }); });
      expect(value).toContain(token);
      expect(value).toContain(alpha);
    }
  });

  it("keeps small labels and status text readable in every theme", () => {
    const luminance = (hex: string) => {
      const channels = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
        .map((v) => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
      const [r = 0, g = 0, b = 0] = channels;
      return r * 0.2126 + g * 0.7152 + b * 0.0722;
    };
    const contrast = (a: string, b: string) => {
      const x = luminance(a), y = luminance(b);
      return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
    };
    const themes = [...css.matchAll(/\[data-theme="([^"]+)"\]\s*\{([^}]+)\}/g)];
    expect(themes).toHaveLength(9);
    for (const [, name, body = ""] of themes) {
      const tokens = Object.fromEntries([...body.matchAll(/--([a-z-]+):\s*(#[0-9a-f]{6});/g)].map((m) => [m[1], m[2]]));
      for (const tone of ["text", "muted", "normal", "suspect", "affected", "origin"]) {
        for (const background of ["surface", "bg"]) {
          expect(contrast(tokens[tone] ?? "#000000", tokens[background] ?? "#ffffff"), `${name}: ${tone} on ${background}`).toBeGreaterThanOrEqual(4.5);
        }
      }
      expect(contrast(tokens["on-accent"] ?? "#000000", tokens.accent ?? "#ffffff"), `${name}: button label`).toBeGreaterThanOrEqual(4.5);
    }
  });
});
