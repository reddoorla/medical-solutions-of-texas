import { test, expect } from "@playwright/test";
import {
  PRIVACY_PATH,
  PRIVACY_POLICY_DRAFT,
  PRIVACY_SERVICES,
  PRIVACY_VALUES,
} from "../../src/lib/privacy/policy";

const LINKS_PRIVACY = /<a\b[^>]*\bhref="\/privacy\/?"/;

test("/privacy renders the policy with the site's values", async ({ page }) => {
  const response = await page.goto(PRIVACY_PATH);
  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1, name: "Privacy Policy" })).toBeVisible();
  const policy = page.getByTestId("privacy-policy");
  await expect(policy).toContainText(PRIVACY_VALUES.legalName);
  await expect(policy).toContainText("Effective October 14, 2026");
  await expect(policy.locator(`a[href="mailto:${PRIVACY_VALUES.contactEmail}"]`)).toBeVisible();
  for (const service of PRIVACY_SERVICES) {
    await expect(page.getByTestId(`service-${service}`)).toBeVisible();
  }
  await expect(page.locator('meta[name="robots"][content="noindex"]')).toHaveCount(
    PRIVACY_POLICY_DRAFT ? 1 : 0,
  );
});

for (const path of ["/", "/about"]) {
  test(`${path} links to /privacy from its footer`, async ({ page, request }) => {
    const html = await (await request.get(path)).text();
    expect(html).toMatch(LINKS_PRIVACY);
    await page.goto(path);
    const link = page.locator("footer").getByRole("link", { name: "Privacy Policy" });
    await expect(link).toHaveAttribute("href", PRIVACY_PATH);
    await link.click();
    await expect(page).toHaveURL(/\/privacy$/);
    await expect(page.getByRole("heading", { level: 1, name: "Privacy Policy" })).toBeVisible();
  });
}

test("the footer link survives the phone layout", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.locator("footer").getByRole("link", { name: "Privacy Policy" })).toBeAttached();
});
