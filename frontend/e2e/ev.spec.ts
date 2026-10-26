import { expect, test } from "@playwright/test";

test("EV fault investigation remains separate from water plant", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Process monitoring" })).toBeVisible();
  await page.getByRole("link", { name: "EV Vehicle", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Vehicle intelligence" })).toBeVisible();
  await page.getByRole("button", { name: "Inspect Coolant pump", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Coolant pump", exact: true })).toBeVisible();
  await page.getByRole("link", { name: "Attack lab", exact: true }).click();
  await page.getByRole("button", { name: /Battery sensor spoofing/ }).click();
  await page.getByRole("button", { name: "Launch injection", exact: true }).click();
  await expect(page.getByRole("button", { name: "Inspect candidate TEMP", exact: true })).toBeVisible({ timeout: 10000 });
  await page.getByRole("button", { name: "Inspect candidate TEMP", exact: true }).click();
  await page.getByText(/EV-I.*investigating/).click();
  await page.getByRole("button", { name: "Reveal injection truth for evaluation" }).click();
  await expect(page.getByText("Evaluation only: injected bias on TEMP", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Toggle AI Pilot" }).click();
  await page.getByRole("button", { name: "Inspect the selected component", exact: true }).click();
  await expect(page.getByRole("log")).toContainText("TEMP", { timeout: 28000 });
  await expect(page.getByRole("log").getByText(/Model:|Model unavailable/)).toBeVisible({ timeout: 28000 });
  await page.getByRole("button", { name: "Reset EV simulation" }).click();
  await page.getByRole("link", { name: "Water Plant", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Process monitoring" })).toBeVisible();
  await expect(page.getByRole("group", { name: "View", exact: true })).toBeVisible();
});

test("EV mobile navigation, pause and component filters", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/ev");
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  await expect(page.getByText("Simulator paused", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Components", exact: true }).click();
  await page.getByLabel("Component type", { exact: true }).selectOption("Sensor");
  await page.getByRole("textbox", { name: "Search components" }).fill("wheel");
  await expect(page.getByRole("button", { name: /Wheel speed.*WHEEL/ })).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(overflow).toBe(false);
});

test("EV replay preserves evidence and pilot conversation across navigation", async ({ page }) => {
  await page.goto("/ev");
  await expect(page.getByRole("region", { name: "Scrollable interactive EV diagram" })).toBeVisible();
  await page.getByRole("link", { name: "Attack lab", exact: true }).click();
  await page.getByRole("button", { name: /CAN gateway delay/ }).click();
  await page.getByRole("button", { name: "Launch injection", exact: true }).click();
  await expect(page.getByRole("button", { name: "Inspect candidate CAN", exact: true })).toBeVisible({ timeout: 10000 });
  await page.getByRole("button", { name: "Stop injection", exact: true }).click();
  await page.getByRole("slider", { name: "Evidence replay sample", exact: true }).fill("0");
  await expect(page.getByText(/Historical snapshot/)).toBeVisible();
  await expect(page.getByRole("button", { name: "Launch injection", exact: true })).toBeDisabled();
  await page.getByRole("button", { name: "Return to current", exact: true }).click();
  await page.getByRole("button", { name: "Reset EV simulation" }).click();
  await expect(page.getByRole("button", { name: "Launch injection", exact: true })).toBeEnabled();
 });

test("EV 3D digital twin renders canvas, supports camera presets, view modes, and screenshot capture", async ({ page }) => {
  test.setTimeout(60000);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/ev");
  const viewport = page.getByRole("region", { name: "Scrollable interactive EV diagram" });
  await expect(viewport).toBeVisible();
  await expect(viewport.locator("canvas")).toBeVisible();

  // Test view modes
  await page.getByRole("button", { name: "Exterior", exact: true }).click();
  await page.getByRole("button", { name: "Exploded", exact: true }).click();
  await page.getByRole("button", { name: "Subsystems", exact: true }).click();
  await page.getByRole("button", { name: "Attack View", exact: true }).click();
  await page.getByRole("button", { name: "X-Ray", exact: true }).click();

  // Test camera presets
  await page.getByRole("button", { name: "Front", exact: true }).click();
  await page.getByRole("button", { name: "Side", exact: true }).click();
  await page.getByRole("button", { name: "Rear", exact: true }).click();
  await page.getByRole("button", { name: "Top", exact: true }).click();
  await page.getByRole("button", { name: "Iso", exact: true }).click();

  // Test subsystem filters
  await page.getByRole("button", { name: "Energy", exact: true }).click();
  await page.getByRole("button", { name: "Powertrain", exact: true }).click();
  await page.getByRole("button", { name: "Thermal", exact: true }).click();
  await page.getByRole("button", { name: "All", exact: true }).click();

  // Test component inspection from quick buttons
  await page.getByRole("button", { name: "Inspect Pack temperature" }).click();
  await expect(page.getByRole("heading", { name: "Pack temperature" })).toBeVisible();

  // Capture screenshot of the 3D twin command deck for design comparison
  await page.waitForTimeout(1000); // allow canvas animation frame
  await page.screenshot({ path: "../docs/ui-review/ev-3d-twin-screenshot.png", fullPage: true });

  // Test toggle to 2D Schematic and back to 3D Twin
  await page.getByRole("button", { name: "2D Schematic" }).click();
  await expect(page.locator(".ev-diagram-scroll svg")).toBeVisible();
  await page.getByRole("button", { name: "3D Twin" }).click();
  await expect(viewport.locator("canvas")).toBeVisible();
});

