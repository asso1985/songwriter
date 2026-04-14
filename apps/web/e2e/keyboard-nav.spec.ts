import { test, expect } from "@playwright/test";

async function selectKey(page: import("@playwright/test").Page) {
  await page.getByLabel("Key root").click();
  await page.getByRole("option", { name: "G", exact: true }).click();
  await page.getByLabel("Key quality").click();
  await page.getByRole("option", { name: "Major" }).click();
}

test.describe("Keyboard Navigation", () => {
  test("Tab cycles through major UI areas", async ({ page }) => {
    await page.goto("/");
    await selectKey(page);

    // First tab: skip link "Skip to chord graph"
    await page.keyboard.press("Tab");
    const focused1 = await page.evaluate(() => document.activeElement?.textContent);
    expect(focused1).toContain("Skip");

    // Continue tabbing through skip links and into UI
    await page.keyboard.press("Tab"); // second skip link
    await page.keyboard.press("Tab"); // key selector
    await page.keyboard.press("Tab"); // zoom in (or next focusable)

    // Should be able to tab without errors
    await expect(page.getByTestId("chord-graph")).toBeVisible();
  });

  test("M key toggles between Flow and Learn mode", async ({ page }) => {
    await page.goto("/");
    await selectKey(page);

    // Initially Flow
    await expect(page.getByText("Flow")).toBeVisible();

    // Press M
    await page.keyboard.press("m");
    await expect(page.getByText("Learn")).toBeVisible();

    // Press M again
    await page.keyboard.press("m");
    await expect(page.getByText("Flow")).toBeVisible();
  });

  test("Escape dismisses preview", async ({ page }) => {
    await page.goto("/");
    await selectKey(page);

    // Graph should be visible
    const graph = page.getByTestId("chord-graph");
    await expect(graph).toBeVisible();

    // Press Escape (should not crash)
    await page.keyboard.press("Escape");
    await expect(graph).toBeVisible();
  });

  test("graph area is keyboard-focusable", async ({ page }) => {
    await page.goto("/");
    await selectKey(page);

    const graph = page.getByTestId("chord-graph");
    await graph.focus();

    // Check it received focus
    const isFocused = await page.evaluate(
      () => document.activeElement?.getAttribute("data-testid"),
    );
    expect(isFocused).toBe("chord-graph");
  });

  test("focus-visible ring on Tap button via keyboard", async ({ page }) => {
    await page.goto("/");

    // Tab until Tap button is reached
    for (let i = 0; i < 15; i++) {
      await page.keyboard.press("Tab");
      const label = await page.evaluate(
        () => document.activeElement?.getAttribute("aria-label"),
      );
      if (label === "Tap to set tempo") break;
    }

    const tapBtn = page.getByRole("button", { name: "Tap to set tempo" });
    await expect(tapBtn).toBeFocused();
  });
});
