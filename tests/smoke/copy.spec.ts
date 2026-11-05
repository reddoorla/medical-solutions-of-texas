import { test, expect, type Page } from "@playwright/test";

// MSOT Marketing's Phase 1 copy rules (Developer Brief Part 1, sections 7, 8
// and 10). Two readings of each page:
//  1. the server HTML, text and the attributes people and machines read (alt,
//     title, aria-label, meta content): what a crawler or AI assistant gets;
//  2. the rendered page at desktop and phone widths with every accordion
//     opened: what a visitor can see, including text written in by JavaScript.
const PAGES = ["/", "/about", "/partners", "/process", "/resources", "/contact", "/privacy"];

// The Revogen testimonial is the customer's own words and stays verbatim (Home
// and Partners), so its two DoD phrases are the only ones allowed.
const REVOGEN_QUOTE_DOD = [
  /into the DoD system/gi,
  /selling\s+to the DoD and VA hospital systems/gi,
];

// The Home hero is held out of this change: it is SVG lettering on desktop, and
// which line becomes Home's heading waits on MSOT. On phones it renders as text
// after JavaScript, so the rendered check allows exactly that line, on Home only.
const HELD_HERO_DOD = /Connecting\s+DoD \+ VA\s+Hospitals/gi;

const DOD = /\bDoD\b|\bD\.O\.D\b|Department of Defense/i;
const END_USER = /\bend[\s-]?users?\b/i;
const FORMER_STAFF = /Albert Turgon|Tim Watson/i;

function stripAllowed(text: string, path: string): string {
  let t = text;
  for (const allowed of REVOGEN_QUOTE_DOD) t = t.replace(allowed, "");
  if (path === "/") t = t.replace(HELD_HERO_DOD, "");
  return t;
}

/** Server HTML as text: visible text plus the attributes that carry words. */
function serverText(html: string): string {
  const attrs = [...html.matchAll(/\b(?:alt|title|aria-label|content)="([^"]*)"/g)].map(
    (m) => m[1],
  );
  const body = html
    .replace(/<script(?![^>]*application\/ld\+json)[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ");
  return [body, ...attrs].join(" ").replace(/\s+/g, " ");
}

function expectCopyRules(text: string, where: string) {
  expect(text, `${where}: DoD outside the Revogen quote`).not.toMatch(DOD);
  expect(text, `${where}: "end user"`).not.toMatch(END_USER);
  expect(text, `${where}: a former staff member`).not.toMatch(FORMER_STAFF);
}

/** Rendered text with every accordion opened, plus alt, aria-label and title values. */
async function renderedText(page: Page): Promise<string> {
  for (const button of await page.locator("button:has(h4)").all()) {
    if (await button.isVisible()) await button.click();
  }
  await page.waitForTimeout(600);
  return page.evaluate(() => {
    const attrs = [...document.querySelectorAll("[alt],[aria-label],[title]")].map((el) =>
      ["alt", "aria-label", "title"].map((a) => el.getAttribute(a) ?? "").join(" "),
    );
    return [document.body.innerText, ...attrs].join(" ").replace(/\s+/g, " ");
  });
}

for (const path of PAGES) {
  test(`${path}: server HTML says DoW, clinicians, and lists only current staff`, async ({
    request,
  }) => {
    const res = await request.get(path);
    expect(res.status()).toBe(200);
    expectCopyRules(stripAllowed(serverText(await res.text()), ""), "server HTML");
  });

  for (const width of [1440, 390]) {
    test(`${path}: rendered at ${width}px with accordions open, the same rules hold`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(path, { waitUntil: "networkidle" });
      expectCopyRules(stripAllowed(await renderedText(page), path), `rendered ${width}px`);
    });
  }
}

test("Home's section heading reads 'The Clinician in Mind'", async ({ request }) => {
  const text = serverText(await (await request.get("/")).text());
  expect(text).toContain("The Clinician in Mind");
});
