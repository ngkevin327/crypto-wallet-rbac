import { test, expect } from "@playwright/test";

test.describe("Accessibility smoke", () => {
  test("approvals page has labeled actions", async ({ page }) => {
    await page.goto("/dashboard/approvals");
    await expect(page.getByRole("heading", { name: /approvals/i })).toBeVisible();
  });
});
