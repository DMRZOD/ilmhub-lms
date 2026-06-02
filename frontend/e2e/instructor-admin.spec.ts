import { test } from "@playwright/test";

import { loginViaUi, SEED_ACCOUNTS } from "./helpers";

/**
 * Instructor: create a course -> publish (with mocks).
 * Admin: approve a course.
 *
 * Scaffolded (test.fixme): the create/publish wizard depends on Mux upload +
 * Supabase image upload, which must be stubbed via page.route(); the admin
 * approval needs a course sitting in PENDING_REVIEW. Tracked in
 * IMPLEMENTATION_ROADMAP.md "TODO / Known issues".
 */
test.describe("Instructor", () => {
  test.fixme("create a course and submit it for review", async ({ page }) => {
    await loginViaUi(page, SEED_ACCOUNTS.instructor);
    // TODO: drive the course wizard with Mux/Supabase uploads mocked, then
    // submit for review.
  });
});

test.describe("Admin", () => {
  test.fixme("approve a pending course", async ({ page }) => {
    await loginViaUi(page, SEED_ACCOUNTS.admin);
    // TODO: open /admin/courses moderation, approve a PENDING_REVIEW course,
    // assert it becomes PUBLISHED.
  });
});
