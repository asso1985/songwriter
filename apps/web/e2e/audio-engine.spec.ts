import { test, expect } from "@playwright/test";

async function selectKey(page: import("@playwright/test").Page) {
  await page.getByLabel("Key root").click();
  await page.getByRole("option", { name: "G", exact: true }).click();
  await page.getByLabel("Key quality").click();
  await page.getByRole("option", { name: "Major" }).click();
}

test.describe("Audio Engine", () => {
  test("AudioContext is created after clicking a chord node on canvas", async ({
    page,
  }) => {
    await page.goto("/");

    // Inject AudioContext spy before any interaction
    await page.evaluate(() => {
      let count = 0;
      const OriginalAudioContext = window.AudioContext;
      const win = window as unknown as Record<string, unknown>;
      win.AudioContext = class extends OriginalAudioContext {
        constructor() {
          super();
          count++;
          (window as unknown as Record<string, number>).__audioContextCount =
            count;
        }
      };
    });

    // Select G Major key
    await selectKey(page);

    // Wait for graph to render
    const graph = page.getByTestId("chord-graph");
    await expect(graph).toBeVisible();
    const canvas = graph.locator("canvas");
    await expect(canvas).toBeVisible();

    // Wait for simulation to settle so the root node is at center
    await page.waitForTimeout(500);

    // Click on the center of the canvas where the root chord node should be
    const box = await canvas.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      await canvas.click({
        position: { x: box.width / 2, y: box.height / 2 },
      });
    }

    // Allow React effects to process
    await page.waitForTimeout(300);

    // AudioContext must have been created (root node is pinned at center)
    const audioContextCount = await page.evaluate(
      () =>
        (window as unknown as Record<string, number>).__audioContextCount ?? 0,
    );
    expect(audioContextCount).toBeGreaterThanOrEqual(1);
  });

  test("AudioEngine component does not break app rendering", async ({
    page,
  }) => {
    await page.goto("/");

    // The AudioEngine renders null — verify app loads correctly with it mounted
    await expect(page.locator("body")).toBeVisible();

    // Select a key and verify the graph still works
    await selectKey(page);

    const graph = page.getByTestId("chord-graph");
    await expect(graph).toBeVisible();

    // Verify canvas renders (AudioEngine didn't interfere)
    const canvas = graph.locator("canvas");
    await expect(canvas).toBeVisible();
  });
});
