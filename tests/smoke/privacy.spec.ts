import { test, expect } from "@playwright/test";
import {
  PRIVACY_PATH,
  PRIVACY_POLICY_DRAFT,
  PRIVACY_SERVICES,
  PRIVACY_VALUES,
} from "../../src/lib/privacy/policy";
import { empty } from "./empty";

// Every request in this file, the browser's included, reads the pages' empty
// documents (./empty): a filled policy body has no service-<name> test ids.
test.use({ extraHTTPHeaders: empty("privacy", "home", "about", "partners") });

const LINKS_PRIVACY = /<a\b[^>]*\bhref="\/privacy\/?"/;

test("/privacy renders the policy with the site's values", async ({ page }) => {
  const response = await page.goto(PRIVACY_PATH);
  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1, name: "Privacy Policy" })).toBeVisible();
  const policy = page.getByTestId("privacy-policy");
  await expect(policy).toContainText(PRIVACY_VALUES.legalName);
  await expect(policy).toContainText("Effective November 4, 2026");
  await expect(policy).toContainText(
    'OJH Services, Inc., doing business as Medical Solutions of Texas ("we") runs this website.',
  );
  await expect(policy).toContainText(
    "goes to Reddoor with your message. It is used to confirm the form came from a real browser. It is not saved",
  );
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
  const link = page.locator("footer").getByRole("link", { name: "Privacy Policy" });
  await link.scrollIntoViewIfNeeded();
  await expect(link).toBeVisible();
  await expect(link).toBeInViewport();
});

// Developer Brief Part 1, §6, word for word, and the operator's 11-04 call
// (decision 2207, answer 2(b)): the policy is final, indexed, and names the
// LinkedIn Insight Tag and the Tag Manager that loads it.
test("/privacy is final and discloses LinkedIn and Tag Manager", async ({ page, request }) => {
  const html = await (await request.get(PRIVACY_PATH)).text();
  expect(html).not.toContain('<meta name="robots" content="noindex"');
  expect(html).not.toContain("DRAFT");
  await page.goto(PRIVACY_PATH);
  await expect(page.getByTestId("privacy-draft")).toHaveCount(0);
  await expect(page.getByTestId("service-linkedin")).toHaveText(
    "We use the LinkedIn Insight Tag to measure the effectiveness of our LinkedIn advertising and to show relevant ads to people who have visited our site. LinkedIn may set cookies and collect information such as the page visited and browser details. LinkedIn does not share personal information that identifies you with us. You can manage LinkedIn ad settings at linkedin.com/psettings/advertising.",
    { useInnerText: true },
  );
  await expect(
    page
      .getByTestId("service-linkedin")
      .getByRole("link", { name: "linkedin.com/psettings/advertising" }),
  ).toHaveAttribute("href", "https://www.linkedin.com/psettings/advertising");
  await expect(page.getByTestId("service-gtm")).toContainText(
    "after you first move the mouse, scroll, click, tap or press a key on a page",
  );
});
