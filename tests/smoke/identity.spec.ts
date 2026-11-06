import { test, expect } from "@playwright/test";
import { empty, emptyCookies, SINGLETONS } from "./empty";

// Pin the code's wording whatever is published in Prismic (./empty).
test.beforeEach(({ context, baseURL }) => emptyCookies(context, baseURL));

// Developer Brief Part 2, §12a–d: who MSOT is, as text in the server HTML of
// every page (what a crawler or AI assistant reads before any JavaScript).
// The expected strings are written out here, not imported from
// src/lib/identity.ts, so a wrong value there fails this test instead of
// passing it along.
const PAGES = [
  "/",
  "/about",
  "/partners",
  "/process",
  "/resources",
  "/contact",
  "/privacy",
  "/capabilities",
];

const FOOTER_LINES = [
  "Medical Solutions of Texas (MSOT)",
  "Veteran-Owned Small Business (VOSB) · Federal med-surg contracting for the VA and DoW",
  "4903 Golden Quail, Suite 120, San Antonio, TX 78240",
  "833.307.4418 · info@MedicalSolutionsofTX.com",
  "UEI Z7Q8TN9HMRC4 · CAGE 6ZM08 · FSS 36F797-25-D-0204",
  "OJH Services, Inc. dba Medical Solutions of Texas | Privacy Policy",
];

const DEFINITION =
  "Medical Solutions of Texas (MSOT) is a San Antonio–based Veteran-Owned Small Business (VOSB) that helps medical and surgical manufacturers get their products on federal contract (ECAT, FSS and DAPA) and into VA and Department of War (DoW) treatment facilities.";
const DEFINITION_ABOUT =
  "Medical Solutions of Texas (MSOT) is a San Antonio–based Veteran-Owned Small Business (VOSB) that helps medical and surgical manufacturers get their products on federal contract (ECAT, FSS and DAPA) and into VA and Department of War (DoW), formerly the Department of Defense (DoD), treatment facilities.";
const WORKS_WITH =
  "Medical Solutions of Texas (MSOT) works with medical-surgical manufacturers and federal healthcare facilities.";

function text(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ");
}

/** Spacing around the separators is layout, not content: compare without it. */
const squash = (s: string) => s.replace(/\s*([·|])\s*/g, "$1").trim();

/** The server HTML of the one <footer> that holds the identity block. */
function identityFooter(html: string): string {
  const footers = html.match(/<footer[\s\S]*?<\/footer>/g) ?? [];
  const withIdentity = footers.filter((f) => f.includes('data-testid="footer-identity"'));
  expect(withIdentity, "exactly one footer carries the identity block").toHaveLength(1);
  return withIdentity[0];
}

// The operator, 11-05: the six lines looked "hideous". Name, phone, email and
// the © line stay in view; the rest folds into a native <details>, closed by
// default, whose text is still in the server HTML.
const ALWAYS_VISIBLE = [
  "Medical Solutions of Texas (MSOT)",
  "833.307.4418 · info@MedicalSolutionsofTX.com",
  "OJH Services, Inc. dba Medical Solutions of Texas | Privacy Policy",
];
const IN_DETAILS = [
  DEFINITION,
  "Veteran-Owned Small Business (VOSB) · Federal med-surg contracting for the VA and DoW",
  "4903 Golden Quail, Suite 120, San Antonio, TX 78240",
  "UEI Z7Q8TN9HMRC4 · CAGE 6ZM08 · FSS 36F797-25-D-0204",
];

/** The identity block's one <details>, and the block with it cut out. */
function splitDetails(footer: string): { details: string; outside: string } {
  const all = footer.match(/<details[\s>][\s\S]*?<\/details>/g) ?? [];
  expect(all, "the identity block holds exactly one <details>").toHaveLength(1);
  const [details] = all as [string];
  return { details, outside: footer.replace(details, " ") };
}

for (const path of PAGES) {
  test(`${path}: the extra identity lines sit in a closed <details>; name, phone, email and © stay outside it`, async ({
    request,
  }) => {
    const footer = identityFooter(
      await (await request.get(path, { headers: empty(...SINGLETONS) })).text(),
    );
    const { details, outside } = splitDetails(footer);
    const open = details.match(/^<details[^>]*>/)![0];
    expect(open, "closed by default: no open attribute").not.toMatch(/\sopen(?:[\s=>]|$)/);
    expect(details).toMatch(/<summary[\s>][\s\S]*Company details[\s\S]*<\/summary>/);
    expect(details, "the street address sits inside one <address>").toMatch(
      /<address[^>]*>(?:(?!<\/address>)[^])*Golden Quail/,
    );
    const inside = squash(text(details));
    const out = squash(text(outside));
    for (const line of IN_DETAILS) {
      expect(inside).toContain(squash(line));
      expect(out).not.toContain(squash(line));
    }
    for (const line of ALWAYS_VISIBLE) expect(out).toContain(squash(line));
    expect(outside).toContain('href="tel:+18333074418"');
    expect(outside).toContain('href="mailto:info@MedicalSolutionsofTX.com"');
    expect(outside, "the phone link sits inside one <address>").toMatch(
      /<address[^>]*>(?:(?!<\/address>)[^])*href="tel:/,
    );
    expect(outside).toContain('data-testid="footer-privacy-link"');
  });
}

for (const path of ["/", "/about"]) {
  for (const width of [1440, 390]) {
    test(`${path} at ${width}px: name, phone, email and © are in view; the details open and close from the keyboard, without JavaScript`, async ({
      browser,
    }) => {
      const context = await browser.newContext({
        javaScriptEnabled: false,
        viewport: { width, height: 900 },
      });
      const page = await context.newPage();
      await page.goto(path);
      const block = page.getByTestId("footer-identity");
      for (const visible of [
        block.getByText("Medical Solutions of Texas (MSOT)", { exact: true }),
        block.getByRole("link", { name: "833.307.4418" }),
        block.getByRole("link", { name: "info@MedicalSolutionsofTX.com" }),
        block.getByText(/©\d{4}\s+OJH Services/),
        block.getByRole("link", { name: "Privacy Policy" }),
      ])
        await expect(visible).toBeVisible();
      const uei = block.getByText("UEI Z7Q8TN9HMRC4");
      await expect(uei).toBeHidden();
      // Reach the summary by Tab, as a keyboard user does: a summary taken out
      // of the tab order would never get focus here.
      const summary = block.locator("details > summary");
      await block.getByRole("link", { name: "info@MedicalSolutionsofTX.com" }).focus();
      await page.keyboard.press("Tab");
      await expect(summary).toBeFocused();
      await page.keyboard.press("Enter");
      await expect(uei).toBeVisible();
      await expect(block.getByText(DEFINITION)).toBeVisible();
      await page.keyboard.press("Enter");
      await expect(uei).toBeHidden();
      await context.close();
    });
  }
}

for (const path of PAGES) {
  test(`${path}: the footer states MSOT's identity as text, in <footer> and <address>`, async ({
    request,
  }) => {
    const html = await (await request.get(path, { headers: empty(...SINGLETONS) })).text();
    const footer = identityFooter(html);
    expect(footer).toMatch(/<address[\s>][\s\S]*Golden Quail[\s\S]*<\/address>/);
    const t = squash(text(footer));
    for (const line of FOOTER_LINES) expect(t).toContain(squash(line));
    // §12b: the definition is also "the footer description" (the operator, 11-05).
    expect(t).toContain(squash(DEFINITION));
    expect(t).toMatch(/©\d{4} OJH Services/);
    // The links must dial and mail what the text says.
    expect(footer).toContain('href="tel:+18333074418"');
    expect(footer).toContain('href="mailto:info@MedicalSolutionsofTX.com"');
  });
}

test("Home opens with the §12b definition, word for word, in the server HTML", async ({
  request,
}) => {
  const t = text(await (await request.get("/", { headers: empty(...SINGLETONS) })).text());
  expect(t).toContain(DEFINITION);
  // §12b: directly under the hero, above "Contact Us / Capabilities Statement".
  expect(t.indexOf(DEFINITION), "the definition sits above the buttons").toBeLessThan(
    t.indexOf("Capabilities Statement"),
  );
});

test("About opens with the bridged definition and ends 'Who we are' with the works-with line", async ({
  request,
}) => {
  const t = text(await (await request.get("/about", { headers: empty(...SINGLETONS) })).text());
  expect(t).toContain(DEFINITION_ABOUT);
  expect(t).toContain(WORKS_WITH);
  expect(t.indexOf(DEFINITION_ABOUT), "the definition comes first").toBeLessThan(
    t.indexOf("We are defined by expertise"),
  );
  expect(t.indexOf(WORKS_WITH), "works-with closes Who we are").toBeGreaterThan(
    t.indexOf("uniquely suited to connect med-surg suppliers"),
  );
});

test("Contact shows the confirmed address, phone and email", async ({ request }) => {
  const t = text(await (await request.get("/contact", { headers: empty(...SINGLETONS) })).text());
  expect(t).toContain("4903 Golden Quail, Suite 120 San Antonio, TX 78240");
  expect(t).toContain("Phone: 833.307.4418 info@MedicalSolutionsofTX.com");
  expect(t).not.toContain("210.744.9686");
  const html = await (await request.get("/contact", { headers: empty(...SINGLETONS) })).text();
  expect(html).toContain('href="tel:+18333074418"');
  expect(html).toContain('href="mailto:info@MedicalSolutionsofTX.com"');
});
