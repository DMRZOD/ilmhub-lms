import { expect, test } from "@playwright/test";

test.describe("Home & navigation", () => {
  test("home page loads", async ({ page }) => {
    const res = await page.goto("/");
    expect(res?.ok()).toBeTruthy();
  });

  test("can navigate to the catalog", async ({ page }) => {
    await page.goto("/courses");
    await expect(page).toHaveTitle(/IlmHub/i);
  });
});
