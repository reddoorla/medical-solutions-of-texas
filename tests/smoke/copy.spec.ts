import { test, expect } from "@playwright/test";

// MSOT Marketing's Phase 1 copy rules (Developer Brief Part 1, sections 7, 8
// and 10), checked on the server-rendered HTML each page ships, before any
// JavaScript runs: that is what search engines and AI assistants read.
const PAGES = ["/", "/about", "/partners", "/process", "/resources", "/contact", "/privacy"];

// The two places "DoD" may still appear: the Revogen testimonial, which is the
// customer's own words and stays verbatim (Home and Partners).
const REVOGEN_QUOTE_DOD = [/into the DoD system/g, /selling\s+to the DoD and VA hospital systems/g];

/** Visible text of the server HTML: no scripts, styles, tags or SVG path data. */
function serverText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ");
}

for (const path of PAGES) {
  test(`${path}: says DoW, clinicians, and lists only current staff`, async ({ request }) => {
    const res = await request.get(path);
    expect(res.status()).toBe(200);
    const html = await res.text();
    let text = serverText(html);

    for (const allowed of REVOGEN_QUOTE_DOD) text = text.replace(allowed, "");
    expect(text, "DoD outside the Revogen quote").not.toMatch(/\bDoD\b|Department of Defense/);
    // The meta and social descriptions are attributes, so check them on the raw HTML.
    expect(html, "a meta description still says DoD").not.toMatch(/content="[^"]*\bDoD\b[^"]*"/);
    expect(text).not.toMatch(/end[\s-]?users?\b/i);
    expect(html).not.toMatch(/Albert Turgon|Tim Watson/i);
  });
}

test("Home's section heading reads 'The Clinician in Mind'", async ({ request }) => {
  const text = serverText(await (await request.get("/")).text());
  expect(text).toContain("The Clinician in Mind");
});
