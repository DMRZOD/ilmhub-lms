import { test } from "@playwright/test";

import { loginViaUi, SEED_ACCOUNTS } from "./helpers";

/**
 * Watch lesson -> mark complete, and take quiz -> pass.
 *
 * Scaffolded (test.fixme): these depend on seeded enrollments + a Mux playback
 * stub and deterministic quiz answers. Harden by mocking the Mux player network
 * calls via page.route() and using the seed's showcase quiz answer key. Tracked
 * in IMPLEMENTATION_ROADMAP.md "TODO / Known issues".
 */
test.describe("Learning", () => {
  test.fixme("watch a lesson and mark it complete", async ({ page }) => {
    await loginViaUi(page, SEED_ACCOUNTS.student);
    // TODO: open an enrolled course lesson, stub Mux, scrub to >90%, assert
    // the lesson is marked completed.
  });

  test.fixme("take a quiz and pass", async ({ page }) => {
    await loginViaUi(page, SEED_ACCOUNTS.student);
    // TODO: open the showcase quiz, submit the known-correct answers, assert
    // the pass state and lesson completion.
  });
});
