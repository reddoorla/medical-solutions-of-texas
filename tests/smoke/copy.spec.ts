import { test, expect, type Page } from "@playwright/test";

// MSOT Marketing's Phase 1 copy rules (Developer Brief Part 1, sections 7, 8
// and 10). Two readings of each page:
//  1. the server HTML, text and the attributes people and machines read (alt,
//     title, aria-label, meta content): what a crawler or AI assistant gets;
//  2. the rendered page at desktop and phone widths with every accordion
//     opened: what a visitor can see, including text written in by JavaScript.
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

// The Revogen testimonial is the customer's own words and stays verbatim (Home
// and Partners), so its two DoD phrases are allowed, on those two pages only.
const REVOGEN_QUOTE_DOD = [
  /into the DoD system/gi,
  /selling\s+to the DoD and VA hospital systems/gi,
];

// Home's hero line puts DoW first on the operator's word (11-05, decision
// 2026-11-05-2005: "Connecting DoW + VA Hospitals with Med-Surg Suppliers"), as
// Marketing's Figma has it. Only that line is exempt from the house-order rule,
// in its desktop and phone wordings, on Home only. It is server-rendered text
// now, so both readings allow it; any other "DoW + VA" still fails.
const HERO_APPROVED = /Connecting\s+DoW \+ VA\s+Hospitals\s+(?:with|w\/)\s+Med-Surg\s+Suppliers/gi;

// About's first sentence carries Marketing's approved bridge (Developer Brief
// Part 2, §12f), the one place the old name is said on purpose: "Department of
// War (DoW), formerly the Department of Defense (DoD)". Allowed as that whole
// phrase, on About only; DoD anywhere else on About still fails.
const ABOUT_DOW_BRIDGE = /Department of War \(DoW\),\s+formerly the Department of Defense \(DoD\)/i;

// Home's Organization JSON-LD keeps one DoD entry in knowsAbout, on
// Marketing's word (Developer Brief Part 2, §13a: "Keep the DoD entry"). Allowed
// as that whole phrase, once, on Home only.
const HOME_KNOWS_ABOUT_DOD = /Department of Defense \(DoD\) medical procurement/;

const DOD = /\bDoD\b|\bD\.O\.D\b|Department of Defense/i;
const END_USER = /\bend[\s-]?users?\b/i;
const FORMER_STAFF = /Albert Turgon|Tim Watson/i;

function stripAllowed(text: string, path: string, server: boolean): string {
  let t = text;
  if (path === "/" || path === "/partners") {
    for (const allowed of REVOGEN_QUOTE_DOD) t = t.replace(allowed, "");
  }
  if (path === "/") t = t.replace(HERO_APPROVED, "");
  // Server reading only: the JSON-LD is not in the rendered text.
  if (path === "/" && server) t = t.replace(HOME_KNOWS_ABOUT_DOD, "");
  // Not global: §12f allows the bridge once, then "DoW" everywhere after.
  if (path === "/about") t = t.replace(ABOUT_DOW_BRIDGE, "");
  // Timeline step 03 keeps Marketing's approved wording (Part 2 §14b, "approved Oct 29"),
  // which puts DoW first; the operator, 11-05: use it as approved. Only that exact line,
  // only on /process, is exempt from the house-order rule.
  if (path === "/process") t = t.replace(STEP_03_APPROVED, "");
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

const STEP_03_APPROVED =
  "Your products become available to order at DoW and VA treatment facilities.";

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
    expectCopyRules(stripAllowed(serverText(await res.text()), path, true), "server HTML");
  });

  for (const width of [1440, 390]) {
    test(`${path}: rendered at ${width}px with accordions open, the same rules hold`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(path, { waitUntil: "networkidle" });
      expectCopyRules(stripAllowed(await renderedText(page), path, false), `rendered ${width}px`);
    });
  }
}

test("Home's section heading reads 'The Clinician in Mind'", async ({ request }) => {
  const text = serverText(await (await request.get("/")).text());
  expect(text).toContain("The Clinician in Mind");
});

// The exemption is the approved line and nothing wider: the same words in any
// other order or shape still fail the house-order rule.
test("Home's hero exemption covers only the approved line", () => {
  for (const ok of [
    "Connecting DoW + VA Hospitals with Med-Surg Suppliers",
    "CONNECTING DOW + VA HOSPITALS WITH\nMED-SURG SUPPLIERS",
    "Connecting DoW + VA Hospitals w/ Med-Surg Suppliers",
  ])
    expect(stripAllowed(ok, "/", true).trim(), ok).toBe("");
  for (const bad of [
    "Connecting DoW + VA Hospitals",
    "Connecting DoW + VA Hospitals with Med-Surg Suppliers",
  ])
    expect(stripAllowed(bad, "/about", true), bad).toMatch(/\bDoW\s*\+\s*VA\b/);
  // On Home itself, anything but the whole approved line still fails.
  for (const bad of [
    "Connecting DoW + VA Hospitals",
    "Connecting DoW + VA Hospitals and Clinics with Med-Surg Suppliers",
    "Serving DoW + VA Hospitals with Med-Surg Suppliers",
    "We work with DoW + VA teams",
  ])
    expect(stripAllowed(bad, "/", true), bad).toMatch(/\bDoW\s*\+\s*VA\b/);
});
