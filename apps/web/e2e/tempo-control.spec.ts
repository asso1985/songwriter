import { test, expect } from "@playwright/test";

test.describe("Tempo Control", () => {
  test("BPM input is visible with default value 120", async ({ page }) => {
    await page.goto("/");
    const bpmInput = page.getByRole("spinbutton", {
      name: "Tempo in beats per minute",
    });
    await expect(bpmInput).toBeVisible();
    await expect(bpmInput).toHaveValue("120");
  });

  test("Tap tempo button is visible with correct aria-label", async ({
    page,
  }) => {
    await page.goto("/");
    const tapBtn = page.getByRole("button", { name: "Tap to set tempo" });
    await expect(tapBtn).toBeVisible();
  });

  test("BPM input is editable", async ({ page }) => {
    await page.goto("/");
    const bpmInput = page.getByRole("spinbutton", {
      name: "Tempo in beats per minute",
    });
    await bpmInput.fill("90");
    await expect(bpmInput).toHaveValue("90");
  });

  test("BPM label is visible", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("BPM")).toBeVisible();
  });
});
