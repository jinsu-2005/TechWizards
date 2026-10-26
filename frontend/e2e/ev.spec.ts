import { expect, test } from "@playwright/test";

test("EV fault investigation remains separate from water plant", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Process monitoring" })).toBeVisible();
  await page.getByRole("link", { name: "EV Vehicle", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Vehicle intelligence" })).toBeVisible();
  await page.getByRole("link", { name: "Attack lab", exact: true }).click();
  await page.getByRole("button", { name: /Battery sensor spoofing/ }).click();
  await page.getByRole("button", { name: "Launch injection", exact: true }).click();
  await expect(page.getByRole("button", { name: "Inspect candidate TEMP", exact: true })).toBeVisible({ timeout: 10000 });
  await page.getByRole("button", { name: "Reveal injected target" }).click();
  await expect(page.getByText(/Injected bias on TEMP/)).toBeVisible();
  await page.getByRole("button", { name: "Toggle AI Pilot" }).click();
  await page.getByRole("button", { name: "Inspect the selected component", exact: true }).click();
  await expect(page.getByRole("log")).toContainText("TEMP", { timeout: 28000 });
  await expect(page.getByRole("log").getByText(/Model:|Evidence summary/)).toBeVisible({ timeout: 28000 });
  await page.getByRole("button", { name: "Reset EV simulation" }).click();
  await page.getByRole("link", { name: "Water Plant", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Process monitoring" })).toBeVisible();
  await expect(page.getByRole("group", { name: "View", exact: true })).toBeVisible();
});

test("EV mobile layout, pause and parts filters", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/ev");
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  await expect(page.getByText("Simulator paused", { exact: true })).toBeVisible();
  await page.goto("/ev?view=data");
  await page.getByLabel("Component type", { exact: true }).selectOption("Sensor");
  await page.getByRole("textbox", { name: "Search components" }).fill("wheel");
  await expect(page.getByRole("button", { name: /Wheel speed.*WHEEL/ })).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(overflow).toBe(false);
});

test("EV replay preserves evidence across drawers", async ({ page }) => {
  await page.goto("/ev");
  await expect(page.getByRole("region", { name: "Scrollable interactive EV diagram" })).toBeVisible();
  await page.getByRole("link", { name: "Attack lab", exact: true }).click();
  await page.getByRole("button", { name: /CAN gateway delay/ }).click();
  await page.getByRole("button", { name: "Launch injection", exact: true }).click();
  await expect(page.getByRole("button", { name: "Inspect candidate CAN", exact: true })).toBeVisible({ timeout: 10000 });
  await page.getByRole("link", { name: "Attack lab", exact: true }).click();
  await page.getByRole("button", { name: "Stop injection", exact: true }).click();
  await page.getByRole("slider", { name: "Evidence replay sample", exact: true }).fill("0");
  await expect(page.getByText(/Historical snapshot/)).toBeVisible();
  await page.getByRole("button", { name: "Return to live", exact: true }).click();
  await page.getByRole("button", { name: "Reset EV simulation" }).click();
  await page.getByRole("link", { name: "Attack lab", exact: true }).click();
  await expect(page.getByRole("button", { name: "Launch injection", exact: true })).toBeEnabled();
});

test("EV pilot drawer exposes voice and text controls", async ({ page }) => {
  await page.goto("/ev?view=pilot");
  await expect(page.getByRole("button", { name: "Start voice session" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Spoken alerts" })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Ask EV AI Pilot" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("complementary", { name: "EV AI Pilot" })).toHaveCount(0);
});

test("EV 3D digital twin renders canvas, supports camera presets, view modes, and screenshot capture", async ({ page }) => {
  test.setTimeout(60000);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/ev");
  const viewport = page.getByRole("region", { name: "Scrollable interactive EV diagram" });
  await expect(viewport).toBeVisible();
  await expect(viewport.locator("canvas")).toBeVisible();
  for (const name of ["Exterior", "Exploded", "Subsystems", "Attack View", "X-Ray"]) await page.getByRole("button", { name, exact: true }).click();
  for (const name of ["Front", "Side", "Rear", "Top", "Iso"]) await page.getByRole("button", { name, exact: true }).click();
  for (const name of ["Energy", "Powertrain", "Thermal", "All"]) await page.getByRole("button", { name, exact: true }).click();

  await page.keyboard.press("/");
  await page.getByRole("button", { name: /Pack temperature.*TEMP/ }).click();
  await expect(viewport.getByText("Pack temperature").first()).toBeVisible();

  await page.waitForTimeout(1000);
  await page.screenshot({ path: "../docs/ui-review/ev-3d-twin-screenshot.png", fullPage: true });

  await page.getByRole("button", { name: "2D Schematic" }).click();
  await expect(page.locator(".ev-diagram-scroll svg")).toBeVisible();
  await page.getByRole("button", { name: "3D Twin" }).click();
  await expect(viewport.locator("canvas")).toBeVisible();
});