import { expect, type Page } from "@playwright/test";

/**
 * Seed accounts created by the backend `prisma/seed.ts`. The e2e CI job seeds
 * the test database before the Playwright run.
 */
export const SEED_ACCOUNTS = {
  student: { email: "student1@ilmhub.uz", password: "Student123!" },
  instructor: { email: "instructor1@ilmhub.uz", password: "Instructor123!" },
  admin: { email: "admin@ilmhub.uz", password: "Admin123!" },
} as const;

/** Log in through the UI and wait for the redirect away from /login. */
export async function loginViaUi(
  page: Page,
  account: { email: string; password: string },
) {
  await page.goto("/login");
  await page.locator("#email").fill(account.email);
  await page.locator("#password").fill(account.password);
  await page.getByRole("button", { name: "Kirish" }).click();
  await expect(page).not.toHaveURL(/\/login/);
}

/** A unique email so register flows never collide across runs. */
export function uniqueEmail(prefix = "e2e"): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1e6)}@e2e.ilmhub.uz`;
}
