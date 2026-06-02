import { expect, test } from "@playwright/test";

import { uniqueEmail } from "./helpers";

test.describe("Authentication", () => {
  test("renders the login form", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator("#email")).toBeVisible();
    await expect(page.locator("#password")).toBeVisible();
    await expect(page.getByRole("button", { name: "Kirish" })).toBeVisible();
  });

  test("shows an error toast on invalid credentials", async ({ page }) => {
    await page.goto("/login");
    await page.locator("#email").fill("nobody@example.com");
    await page.locator("#password").fill("wrong-password");
    await page.getByRole("button", { name: "Kirish" }).click();
    // Sonner renders a toast; we stay on /login.
    await expect(page.locator("[data-sonner-toast]")).toBeVisible({
      timeout: 10_000,
    });
    await expect(page).toHaveURL(/\/login/);
  });

  test("registers a brand-new student", async ({ page }) => {
    await page.goto("/register");
    await page.locator("#name").fill("E2E Student");
    await page.locator("#email").fill(uniqueEmail());
    await page.locator("#password").fill("Passw0rd!");
    await page.locator("#confirmPassword").fill("Passw0rd!");
    // STUDENT role is selected by default; accept the terms to enable submit.
    await page.getByRole("checkbox").click();
    await page.getByRole("button", { name: "Ro'yxatdan o'tish" }).click();

    // Success surfaces a toast and navigates away from /register.
    await expect(page.getByText("Akkaunt yaratildi")).toBeVisible({
      timeout: 15_000,
    });
  });
});
