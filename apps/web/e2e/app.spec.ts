import { test, expect } from "@playwright/test";

test.describe("App Shell", () => {
  test("renders the three-zone layout", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator("header")).toBeVisible();
    await expect(page.locator("main#graph-area")).toBeVisible();
    await expect(page.locator("footer#progression-bar")).toBeVisible();
  });

  test("shows graph area placeholder", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Chord graph will appear here")).toBeVisible();
  });

  test("shows progression bar placeholder", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByText("Progression chords will appear here"),
    ).toBeVisible();
  });

  test("has skip links for accessibility", async ({ page }) => {
    await page.goto("/");
    const skipToGraph = page.getByText("Skip to chord graph");
    const skipToProgression = page.getByText("Skip to progression");

    await expect(skipToGraph).toBeAttached();
    await expect(skipToProgression).toBeAttached();
  });

  test("configures Nunito as the sans font family", async ({ page }) => {
    await page.goto("/");
    // Verify the font-sans class is applied (which uses our --font-family-sans: Nunito token)
    const hasFontSans = await page.locator("div.font-sans").first().isVisible();
    expect(hasFontSans).toBe(true);
  });

  test("applies warm off-white background", async ({ page }) => {
    await page.goto("/");
    const bg = await page.locator("div.bg-surface").first().evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );
    // #FAFAF8 = rgb(250, 250, 248)
    expect(bg).toBe("rgb(250, 250, 248)");
  });
});

test.describe("Desktop Gate", () => {
  test("shows desktop-only message on narrow viewport", async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 600, height: 800 },
    });
    const page = await context.newPage();
    await page.goto("/");

    await expect(
      page.getByText(
        "Songwriter is designed for desktop. Please visit on a larger screen.",
      ),
    ).toBeVisible();

    await context.close();
  });

  test("hides desktop-only message on wide viewport", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByText(
        "Songwriter is designed for desktop. Please visit on a larger screen.",
      ),
    ).toBeHidden();
  });
});
