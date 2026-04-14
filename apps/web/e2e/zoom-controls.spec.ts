import { test, expect } from "@playwright/test";

async function selectKey(page: import("@playwright/test").Page) {
  await page.getByLabel("Key root").click();
  await page.getByRole("option", { name: "G", exact: true }).click();
  await page.getByLabel("Key quality").click();
  await page.getByRole("option", { name: "Major" }).click();
}

test.describe("Zoom Controls", () => {
  test("zoom controls appear when graph is displayed", async ({ page }) => {
    await page.goto("/");
    await selectKey(page);

    await expect(page.getByLabel("Zoom in")).toBeVisible();
    await expect(page.getByLabel("Zoom out")).toBeVisible();
  });

  test("zoom in button is disabled by default (starts zoomed in)", async ({ page }) => {
    await page.goto("/");
    await selectKey(page);

    await expect(page.getByLabel("Zoom in")).toBeDisabled();
    await expect(page.getByLabel("Zoom out")).not.toBeDisabled();
  });

  test("can zoom out and back in", async ({ page }) => {
    await page.goto("/");
    await selectKey(page);

    // Zoom out
    await page.getByLabel("Zoom out").click();
    await expect(page.getByLabel("Zoom out")).toBeDisabled();
    await expect(page.getByLabel("Zoom in")).not.toBeDisabled();

    // Zoom back in
    await page.getByLabel("Zoom in").click();
    await expect(page.getByLabel("Zoom in")).toBeDisabled();
    await expect(page.getByLabel("Zoom out")).not.toBeDisabled();
  });

  test("keyboard shortcut - zooms out", async ({ page }) => {
    await page.goto("/");
    await selectKey(page);

    await page.keyboard.press("-");
    await expect(page.getByLabel("Zoom out")).toBeDisabled();
  });

  test("keyboard shortcut + zooms in", async ({ page }) => {
    await page.goto("/");
    await selectKey(page);

    // Zoom out first
    await page.keyboard.press("-");
    // Then zoom back in
    await page.keyboard.press("+");
    await expect(page.getByLabel("Zoom in")).toBeDisabled();
  });

  test("zoom controls have proper accessibility", async ({ page }) => {
    await page.goto("/");
    await selectKey(page);

    await expect(
      page.getByRole("group", { name: "Zoom controls" }),
    ).toBeVisible();
  });
});
