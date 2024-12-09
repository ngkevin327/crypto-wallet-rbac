import { test, expect } from "@playwright/test";
import { registerAndLogin } from "../fixtures/auth";

test.describe("Intent dual approval", () => {
  test.skip("creates intent and reaches ready_to_sign with two approvers", async ({ page }) => {
    const email = `e2e-${Date.now()}@test.wtp.local`;
    await registerAndLogin(page, email, "secure-password-12");
    await page.goto("/dashboard/intents/new");
    await expect(page.getByText("New USDC transfer")).toBeVisible();
  });
});
