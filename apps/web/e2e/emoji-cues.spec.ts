import { test, expect } from "@playwright/test";

async function selectKey(page: import("@playwright/test").Page) {
  await page.getByLabel("Key root").click();
  await page.getByRole("option", { name: "G", exact: true }).click();
  await page.getByLabel("Key quality").click();
  await page.getByRole("option", { name: "Major" }).click();
}

test.describe("Emoji Cues", () => {
  test("graph remains interactive after hovering over nodes", async ({
    page,
  }) => {
    await page.goto("/");
    await selectKey(page);

    const graph = page.getByTestId("chord-graph");
    await expect(graph).toBeVisible();
    const canvas = graph.locator("canvas");
    await expect(canvas).toBeVisible();

    // Wait for simulation to settle
    await page.waitForTimeout(600);

    // Hover over several positions on the canvas
    const box = await canvas.boundingBox();
    if (box) {
      await canvas.hover({ position: { x: box.width / 2, y: box.height / 2 } });
      await page.waitForTimeout(100);
      await canvas.hover({ position: { x: box.width / 3, y: box.height / 3 } });
      await page.waitForTimeout(100);
      await canvas.hover({ position: { x: box.width * 0.7, y: box.height * 0.5 } });
    }

    // Graph should still be visible and functional
    await expect(graph).toBeVisible();
    await expect(canvas).toBeVisible();
  });

  test("app does not crash with emoji rendering", async ({ page }) => {
    await page.goto("/");
    await selectKey(page);

    const graph = page.getByTestId("chord-graph");
    await expect(graph).toBeVisible();

    // Click center (root node) to test hover + click cycle
    const canvas = graph.locator("canvas");
    const box = await canvas.boundingBox();
    if (box) {
      await canvas.hover({ position: { x: box.width / 2, y: box.height / 2 } });
      await page.waitForTimeout(200);
      await canvas.click({ position: { x: box.width / 2, y: box.height / 2 } });
    }

    await page.waitForTimeout(200);
    await expect(graph).toBeVisible();
  });
});
