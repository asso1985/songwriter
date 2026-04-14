import { test, expect } from "@playwright/test";

async function selectKey(page: import("@playwright/test").Page) {
  await page.getByLabel("Key root").click();
  await page.getByRole("option", { name: "G", exact: true }).click();
  await page.getByLabel("Key quality").click();
  await page.getByRole("option", { name: "Major" }).click();
}

test.describe("Progression Bar", () => {
  test("shows placeholder text when progression is empty", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(
      page.getByText("Click a chord to start building"),
    ).toBeVisible();
  });

  test("play button is disabled when progression is empty", async ({
    page,
  }) => {
    await page.goto("/");
    const playBtn = page.getByRole("button", { name: /play/i });
    await expect(playBtn).toBeDisabled();
  });

  test("progression bar is visible in app layout", async ({ page }) => {
    await page.goto("/");
    const footer = page.locator("#progression-bar");
    await expect(footer).toBeVisible();
  });

  test("app remains functional with progression bar mounted", async ({
    page,
  }) => {
    await page.goto("/");
    await selectKey(page);

    const graph = page.getByTestId("chord-graph");
    await expect(graph).toBeVisible();

    // Progression bar should still show placeholder (no chords committed yet)
    await expect(
      page.getByText("Click a chord to start building"),
    ).toBeVisible();
  });
});
