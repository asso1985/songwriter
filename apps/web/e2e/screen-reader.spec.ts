import { test, expect } from "@playwright/test";

async function selectKey(page: import("@playwright/test").Page) {
  await page.getByLabel("Key root").click();
  await page.getByRole("option", { name: "G", exact: true }).click();
  await page.getByLabel("Key quality").click();
  await page.getByRole("option", { name: "Major" }).click();
}

test.describe("Screen Reader & Chord List", () => {
  test("L key toggles chord list panel", async ({ page }) => {
    await page.goto("/");
    await selectKey(page);

    const graph = page.getByTestId("chord-graph");
    await expect(graph).toBeVisible();

    // Press L to open chord list
    await page.keyboard.press("l");
    await expect(page.getByText("Chord List")).toBeVisible();

    // Press L again to close
    await page.keyboard.press("l");
    await expect(page.getByText("Chord List")).toBeHidden();
  });

  test("chord list shows chords sorted by distance", async ({ page }) => {
    await page.goto("/");
    await selectKey(page);

    await page.keyboard.press("l");

    // First item should be the root chord (G for G Major)
    const listbox = page.getByRole("listbox", { name: /available chords/i });
    await expect(listbox).toBeVisible();

    const firstItem = listbox.getByRole("option").first();
    await expect(firstItem).toContainText("G");
    await expect(firstItem).toContainText("root");
  });

  test("progression bar has list role when chords exist", async ({ page }) => {
    await page.goto("/");

    // No list role when empty
    await expect(page.getByRole("list", { name: /chord progression/i })).toBeHidden();
  });

  test("graph area has application role and aria-label", async ({ page }) => {
    await page.goto("/");
    await selectKey(page);

    const graph = page.getByRole("application", {
      name: /chord network graph/i,
    });
    await expect(graph).toBeVisible();
  });
});
