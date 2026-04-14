import { test, expect } from "@playwright/test";

test.describe("Key Selector", () => {
  test("shows centered key selector on initial load", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Choose a Key")).toBeVisible();
    await expect(page.getByLabel("Key root")).toBeVisible();
    await expect(page.getByLabel("Key quality")).toBeVisible();
  });

  test("full key selection journey", async ({ page }) => {
    await page.goto("/");

    // Initially centered
    await expect(page.getByText("Choose a Key")).toBeVisible();

    // Select root note "G"
    await page.getByLabel("Key root").click();
    await page.getByRole("option", { name: "G", exact: true }).click();

    // Select quality "Major"
    await page.getByLabel("Key quality").click();
    await page.getByRole("option", { name: "Major" }).click();

    // Should transition to compact display
    await expect(page.getByText("Choose a Key")).toBeHidden();
    const compactBtn = page.getByLabel("Current key: G Major. Click to change.");
    await expect(compactBtn).toBeVisible();
    await expect(compactBtn).toContainText("G Major");
  });

  test("can change key from compact state", async ({ page }) => {
    await page.goto("/");

    // Select initial key "G Major" (avoids "C" ambiguity with "C#")
    await page.getByLabel("Key root").click();
    await page.getByRole("option", { name: "G", exact: true }).click();
    await page.getByLabel("Key quality").click();
    await page.getByRole("option", { name: "Major" }).click();

    // Compact should show "G Major"
    const compactBtn = page.getByLabel("Current key: G Major. Click to change.");
    await expect(compactBtn).toBeVisible();

    // Click to change
    await compactBtn.click();

    // Expanded selector should appear again
    await expect(page.getByText("Choose a Key")).toBeVisible();
  });

  test("key selector has proper accessibility attributes", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("group", { name: "Select musical key" }),
    ).toBeVisible();
    await expect(page.getByLabel("Key root")).toHaveAttribute("role", "combobox");
    await expect(page.getByLabel("Key quality")).toHaveAttribute("role", "combobox");
  });

  test("keyboard navigation on root selector", async ({ page }) => {
    await page.goto("/");

    // Focus and open root selector with keyboard
    await page.getByLabel("Key root").focus();
    await page.keyboard.press("Enter");

    // First option should be highlighted
    const firstOption = page.getByRole("option", { name: "C", exact: true });
    await expect(firstOption).toBeVisible();

    // Select with Enter
    await page.keyboard.press("Enter");

    // Root should now have a value
    await expect(page.getByLabel("Key root")).not.toHaveAttribute(
      "data-placeholder",
    );
  });
});
