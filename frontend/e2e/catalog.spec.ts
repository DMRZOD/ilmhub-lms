import { expect, test } from "@playwright/test";

import { loginViaUi, SEED_ACCOUNTS } from "./helpers";

test.describe("Catalog", () => {
  // The catalog issues authenticated requests (e.g. /users/me, favorites); when
  // logged out those 401 and the api-client bounces to /login. Sign in first so
  // we exercise real authenticated browsing.
  test.beforeEach(async ({ page }) => {
    await loginViaUi(page, SEED_ACCOUNTS.student);
  });

  test("lists courses and exposes search + sort controls", async ({ page }) => {
    await page.goto("/courses");

    // Seeded, published courses render as cards linking to their detail page.
    const cards = page.locator('a[href^="/courses/"]');
    await expect(cards.first()).toBeVisible();

    // The placeholder appears on both the desktop and mobile search inputs.
    await expect(page.getByPlaceholder("Kurs qidiring...").first()).toBeVisible();
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
    const search = page.getByPlaceholder("Kurs qidiring...").first();
    await search.click();
    // Real keystrokes — the field is controlled (value={q}); .fill() doesn't
    // reliably fire React's onChange here.
    await search.pressSequentially("react", { delay: 50 });
    await expect(search).toHaveValue("react");
    // The search syncs to the URL via nuqs (?q=...).
    await expect(page).toHaveURL(/[?&]q=react/i, { timeout: 10_000 });
  });
});
