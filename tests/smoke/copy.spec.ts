import { test, expect, type Page } from "@playwright/test";

// MSOT Marketing's Phase 1 copy rules (Developer Brief Part 1, sections 7, 8
// and 10). Two readings of each page:
//  1. the server HTML, text and the attributes people and machines read (alt,
//     title, aria-label, meta content): what a crawler or AI assistant gets;
//  2. the rendered page at desktop and phone widths with every accordion
//     opened: what a visitor can see, including text written in by JavaScript.
const PAGES = ["/", "/about", "/partners", "/process", "/resources", "/contact", "/privacy"];

// The Revogen testimonial is the customer's own words and stays verbatim (Home
// and Partners), so its two DoD phrases are allowed, on those two pages only.
const REVOGEN_QUOTE_DOD = [
  /into the DoD system/gi,
  /selling\s+to the DoD and VA hospital systems/gi,
];

// The Home hero is held out of this change: it is SVG lettering on desktop, and
// which line becomes Home's heading waits on MSOT. On phones it renders as text
// after JavaScript, so the rendered check allows exactly that line, on Home only.
const HELD_HERO_DOD = /Connecting\s+DoD \+ VA\s+Hospitals/gi;

// About's first sentence carries Marketing's approved bridge (Developer Brief
// Part 2, §12f), the one place the old name is said on purpose: "Department of
// War (DoW), formerly the Department of Defense (DoD)". Allowed as that whole
// phrase, on About only; DoD anywhere else on About still fails.
const ABOUT_DOW_BRIDGE = /Department of War \(DoW\),\s+formerly the Department of Defense \(DoD\)/i;

const DOD = /\bDoD\b|\bD\.O\.D\b|Department of Defense/i;
const END_USER = /\bend[\s-]?users?\b/i;
const FORMER_STAFF = /Albert Turgon|Tim Watson/i;

function stripAllowed(text: string, path: string, allowHeldHero: boolean): string {
  let t = text;
  if (path === "/" || path === "/partners") {
    for (const allowed of REVOGEN_QUOTE_DOD) t = t.replace(allowed, "");
  }
  if (path === "/" && allowHeldHero) t = t.replace(HELD_HERO_DOD, "");
  // Not global: §12f allows the bridge once, then "DoW" everywhere after.
  if (path === "/about") t = t.replace(ABOUT_DOW_BRIDGE, "");
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
  expect(text, `${where}: house order is "VA and DoW"`).not.toMatch(/\bDoW\s*(?:and|&|\+)\s*VA\b/i);
}

/** Rendered text with every accordion opened, plus alt, aria-label and title values. */
async function renderedText(page: Page): Promise<string> {
  // Accordian.svelte: each question is a <summary> holding an <h4>, inside a
  // <details>. Open them all and count, so a click that did nothing (or a
  // markup change) fails instead of passing blind.
  const summaries = page.locator("details > summary:has(h4)");
  const count = await summaries.count();
  for (let i = 0; i < count; i++) await summaries.nth(i).click();
  await expect(page.locator("details[open]:has(> summary h4)")).toHaveCount(count);
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
    // The held hero is not in server HTML at all (it renders after mount), so
    // this reading allows it nowhere: stricter than the rendered one, on purpose.
    expectCopyRules(stripAllowed(serverText(await res.text()), path, false), "server HTML");
  });

  for (const width of [1440, 390]) {
    test(`${path}: rendered at ${width}px with accordions open, the same rules hold`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(path, { waitUntil: "networkidle" });
      expectCopyRules(stripAllowed(await renderedText(page), path, true), `rendered ${width}px`);
    });
  }
}

test("Home's section heading reads 'The Clinician in Mind'", async ({ request }) => {
  const text = serverText(await (await request.get("/")).text());
  expect(text).toContain("The Clinician in Mind");
});
