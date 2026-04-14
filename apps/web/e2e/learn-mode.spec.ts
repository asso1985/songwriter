import { test, expect } from "@playwright/test";

test.describe("Learn Mode", () => {
  test("mode toggle is visible in top bar after key selection", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByLabel("Key root").click();
    await page.getByRole("option", { name: "G", exact: true }).click();
    await page.getByLabel("Key quality").click();
    await page.getByRole("option", { name: "Major" }).click();

    const toggle = page.getByRole("button", { name: /switch to learn/i });
    await expect(toggle).toBeVisible();
    await expect(page.getByText("Flow")).toBeVisible();
  });

  test("clicking toggle switches to Learn mode", async ({ page }) => {
    await page.goto("/");
    await page.getByLabel("Key root").click();
    await page.getByRole("option", { name: "G", exact: true }).click();
    await page.getByLabel("Key quality").click();
    await page.getByRole("option", { name: "Major" }).click();

    await page.getByRole("button", { name: /switch to learn/i }).click();
    await expect(page.getByText("Learn")).toBeVisible();
  });

  test("clicking toggle again switches back to Flow", async ({ page }) => {
    await page.goto("/");
    await page.getByLabel("Key root").click();
    await page.getByRole("option", { name: "G", exact: true }).click();
    await page.getByLabel("Key quality").click();
    await page.getByRole("option", { name: "Major" }).click();

    await page.getByRole("button", { name: /switch to learn/i }).click();
    await page.getByRole("button", { name: /switch to flow/i }).click();
    await expect(page.getByText("Flow")).toBeVisible();
  });

  test("app remains functional in Learn mode", async ({ page }) => {
    await page.goto("/");
    await page.getByLabel("Key root").click();
    await page.getByRole("option", { name: "G", exact: true }).click();
    await page.getByLabel("Key quality").click();
    await page.getByRole("option", { name: "Major" }).click();

    await page.getByRole("button", { name: /switch to learn/i }).click();

    const graph = page.getByTestId("chord-graph");
    await expect(graph).toBeVisible();
    await expect(page.getByText("Click a chord to start building")).toBeVisible();
  });
});
