import { test, expect } from "@playwright/test";

async function selectKey(page: import("@playwright/test").Page) {
  await page.getByLabel("Key root").click();
  await page.getByRole("option", { name: "G", exact: true }).click();
  await page.getByLabel("Key quality").click();
  await page.getByRole("option", { name: "Major" }).click();
}

test.describe("Progression Playback", () => {
  test("Play button is disabled with fewer than 2 chords", async ({
    page,
  }) => {
    await page.goto("/");
    const playBtn = page.getByRole("button", { name: "Play progression" });
    await expect(playBtn).toBeDisabled();
  });

  test("Play button has correct aria-label", async ({ page }) => {
    await page.goto("/");
    const playBtn = page.getByRole("button", { name: "Play progression" });
    await expect(playBtn).toBeVisible();
  });

  test("Play button stays disabled when graph is loaded but no chords committed", async ({ page }) => {
    await page.goto("/");
    await selectKey(page);

    const graph = page.getByTestId("chord-graph");
    await expect(graph).toBeVisible();

    const playBtn = page.getByRole("button", { name: "Play progression" });
    await expect(playBtn).toBeDisabled();

    await expect(
      page.getByText("Click a chord to start building"),
    ).toBeVisible();
  });
});
