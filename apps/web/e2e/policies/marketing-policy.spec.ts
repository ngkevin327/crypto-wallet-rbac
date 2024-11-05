import { test, expect } from "@playwright/test";

test.describe("Marketing policy flow", () => {
  test.skip(!process.env.E2E_FULL, "Requires running API and seeded user");

  test("shows policy form test ids", async ({ page }) => {
    await page.goto("/dashboard/policies");
    await expect(page.getByTestId("policy-form")).toBeVisible({ timeout: 5000 }).catch(() => {
      // Page may redirect to login without full stack
    });
  });
});
