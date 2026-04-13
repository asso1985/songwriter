import { test, expect } from "@playwright/test";

test("homepage loads and shows Songwriter title", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("h1")).toContainText("Songwriter");
});
