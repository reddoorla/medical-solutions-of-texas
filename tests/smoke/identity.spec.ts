import { test, expect } from "@playwright/test";

// Developer Brief Part 2, §12a–d: who MSOT is, as text in the server HTML of
// every page (what a crawler or AI assistant reads before any JavaScript).
// The expected strings are written out here, not imported from
// src/lib/identity.ts, so a wrong value there fails this test instead of
// passing it along.
const PAGES = ["/", "/about", "/partners", "/process", "/resources", "/contact", "/privacy"];

const FOOTER_LINES = [
  "Medical Solutions of Texas (MSOT)",
  "Veteran-Owned Small Business (VOSB) · Federal med-surg contracting for the VA and DoW",
  "4903 Golden Quail, Suite 120, San Antonio, TX 78240 · 833.307.4418 · info@MedicalSolutionsofTX.com",
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

for (const path of PAGES) {
  test(`${path}: the footer states MSOT's identity as text, in <footer> and <address>`, async ({
    request,
  }) => {
    const html = await (await request.get(path)).text();
    const footer = identityFooter(html);
    expect(footer).toMatch(/<address[\s>][\s\S]*Golden Quail[\s\S]*<\/address>/);
    const t = squash(text(footer));
    for (const line of FOOTER_LINES) expect(t).toContain(squash(line));
    expect(t).toMatch(/©\d{4} OJH Services/);
  });
}

test("Home opens with the §12b definition, word for word, in the server HTML", async ({
  request,
}) => {
  expect(text(await (await request.get("/")).text())).toContain(DEFINITION);
});

test("About opens with the bridged definition and ends 'Who we are' with the works-with line", async ({
  request,
}) => {
  const t = text(await (await request.get("/about")).text());
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
  const t = text(await (await request.get("/contact")).text());
  expect(t).toContain("4903 Golden Quail, Suite 120 San Antonio, TX 78240");
  expect(t).toContain("Phone: 833.307.4418 info@MedicalSolutionsofTX.com");
  expect(t).not.toContain("210.744.9686");
});
