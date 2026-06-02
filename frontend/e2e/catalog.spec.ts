import { expect, test } from "@playwright/test";

test.describe("Catalog", () => {
  test("lists courses and exposes search + sort controls", async ({ page }) => {
    await page.goto("/courses");

    // Seeded, published courses render as cards linking to their detail page.
    const cards = page.locator('a[href^="/courses/"]');
    await expect(cards.first()).toBeVisible();

    await expect(page.getByPlaceholder("Kurs qidiring...")).toBeVisible();
    // Radix Select trigger for sorting.
    await expect(page.getByRole("combobox").first()).toBeVisible();
  });

  test("opens a course detail page from the catalog", async ({ page }) => {
    await page.goto("/courses");
    const firstCard = page.locator('a[href^="/courses/"]').first();
    await expect(firstCard).toBeVisible();
    const href = await firstCard.getAttribute("href");
    await firstCard.click();
    await expect(page).toHaveURL(new RegExp(`${href}$`));
  });

  test("search narrows the catalog via the URL query", async ({ page }) => {
    await page.goto("/courses");
    await page.getByPlaceholder("Kurs qidiring...").fill("react");
    // nuqs writes the query to the URL (debounced).
    await expect(page).toHaveURL(/react/i, { timeout: 10_000 });
  });
});
