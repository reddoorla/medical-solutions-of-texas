import { expect, test } from "@playwright/test";
import { empty } from "./empty";

import { CHROME_COPY, chromeCopy, untitledTitle } from "../../src/lib/copy/chrome";
import { fill } from "../../src/lib/content";
import type { SettingsDocument } from "../../prismicio-types";

// The menu and footer words move onto the `settings` singleton's Menu and
// Footer tabs (the operator, 11-05: "all content should be in prismic, not in
// code"). Each falls back to today's wording when its field is empty. Today's
// words are written out here, not read from $lib/copy/chrome, so a changed
// default fails.
const TODAY = {
  nav_about: "About",
  nav_partners: "Partners",
  nav_process: "Process",
  nav_resources: "Resources",
  nav_contact: "Contact",
  logo_alt: "msot logo",
  open_menu: "Open menu",
  close_menu: "Close menu",
  footer_cta: "let’s get started",
  footer_contact_button: "Contact Us",
  footer_process_button: "Learn More",
  footer_logo_alt: "Medical Solutions of Texas home",
  vosb_alt: "Veteran-Owned Small Business (VOSB)",
  company_details: "Company details",
  privacy_link: "Privacy Policy",
  footer_name_line: "{name} ({short name})",
  footer_type_line: "{business type} · {tagline}",
  footer_ids_line: "UEI {uei} · CAGE {cage} · FSS {fss}",
  footer_copyright: "©{year} {legal name} dba {name} |",
  untitled_title: "MSOT | {page}",
  not_found_text: "Page not found",
  home_link: "Back to home",
};

const doc = (data: Record<string, unknown>) => ({ data }) as unknown as SettingsDocument;

test("no document, or empty fields, keep today's words", () => {
  expect(CHROME_COPY).toEqual(TODAY);
  expect(chromeCopy(null)).toEqual(TODAY);
  expect(chromeCopy(doc({ nav_about: "", vosb_alt: "  ", footer_cta: null }))).toEqual(TODAY);
});

test("a filled field wins, field by field", () => {
  const some = chromeCopy(doc({ nav_process: "How it works", company_details: "More" }));
  expect(some).toEqual({ ...TODAY, nav_process: "How it works", company_details: "More" });
});

// SvelteKit serializes the layout's data into a <script>, so raw HTML holds
// every value whether or not the page shows it: strip scripts first.
const html = (h: string) => h.replace(/<script[\s\S]*?<\/script>/gi, " ");
const visible = (h: string) =>
  html(h)
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ");
// The layout builds this fixture from CHROME_COPY itself; the TODAY equality
// above is what keeps every key covered.
const fixture = { cookie: "msot-chrome-fixture=1" };

test("with every field empty a page shows today's menu and footer", async ({ request }) => {
  const about = html(await (await request.get("/about", { headers: empty("about") })).text());
  // The menu's own links, read from their anchors: the footer's "Contact Us"
  // and the page's body would otherwise satisfy a plain text search.
  const nav = [...about.matchAll(/<a href="(\/\w+)"[^>]*>\s*([^<]*?)\s*<\/a>/g)]
    .map((m) => [m[1], m[2]])
    .filter(([, w]) => ["About", "Partners", "Process", "Resources", "Contact"].includes(w));
  expect(nav).toEqual([
    ["/about", "About"],
    ["/partners", "Partners"],
    ["/process", "Process"],
    ["/resources", "Resources"],
    ["/contact", "Contact"],
  ]);
  expect(about).toContain('alt="msot logo"');
  expect(about).toContain('aria-label="Open menu"');
  expect(visible(about)).toContain(" let’s get started ");
  expect(about).toContain('alt="Medical Solutions of Texas home"');
  expect(about).toContain('alt="Veteran-Owned Small Business (VOSB)"');
  expect(visible(about)).toContain(" Company details ");
  expect(visible(about)).toContain(" Privacy Policy ");
});

test("the menu and the footer read the document", async ({ request }) => {
  const about = html(await (await request.get("/about", { headers: fixture })).text());
  const shown = visible(about);
  // The menu: the five links in order, to their own addresses.
  const links = [...about.matchAll(/<a href="(\/\w+)"[^>]*>\s*(Fixture nav_\w+)\s*<\/a>/g)].map(
    (m) => [m[1], m[2]],
  );
  expect(links.slice(0, 5)).toEqual([
    ["/about", "Fixture nav_about"],
    ["/partners", "Fixture nav_partners"],
    ["/process", "Fixture nav_process"],
    ["/resources", "Fixture nav_resources"],
    ["/contact", "Fixture nav_contact"],
  ]);
  expect(about).toContain('alt="Fixture logo_alt"');
  expect(about).toContain('aria-label="Fixture open_menu"');
  // The footer.
  expect(shown.split("Fixture footer_cta").length - 1).toBe(3);
  // Each footer button to its own address (BracketButton nests its words).
  const buttons = [
    ...about.matchAll(
      /<a[^>]*href="(\/\w+)"[^>]*>(?:(?!<\/a>)[\s\S])*?(Fixture footer_\w+_button)/g,
    ),
  ].map((m) => [m[1], m[2]]);
  expect(buttons).toEqual([
    ["/contact", "Fixture footer_contact_button"],
    ["/process", "Fixture footer_process_button"],
  ]);
  expect(about).toContain('alt="Fixture footer_logo_alt"');
  expect(about).toContain('alt="Fixture vosb_alt"');
  expect(shown).toContain(" Fixture company_details ");
  expect(shown).toContain(" Fixture privacy_link ");
  expect(shown).not.toMatch(/ let’s get started | Company details | Privacy Policy /);
  // Home's own footer shares the fold-out label and the privacy link.
  const homeHtml = html(await (await request.get("/", { headers: fixture })).text());
  const home = visible(homeHtml);
  expect(home).toContain(" Fixture company_details ");
  expect(home).toContain(" Fixture privacy_link ");
  // …and the footer's two logos.
  expect(homeHtml).toContain('alt="Fixture footer_logo_alt"');
  expect(homeHtml).toContain('alt="Fixture vosb_alt"');
});

// The phone menu's overlay is never server-rendered, so its close button is
// checked after hydration, in a browser.
test("the logo after the loading screen, and the menu's close button, read it too", async ({
  page,
  context,
  baseURL,
}) => {
  await context.addCookies([{ name: "msot-chrome-fixture", value: "1", url: baseURL! }]);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/about");
  await expect(page.locator('a[href="/"] > img[alt="Fixture logo_alt"]').first()).toBeVisible({
    timeout: 10_000,
  });
  await page.getByRole("button", { name: "Fixture open_menu" }).click();
  await expect(page.getByRole("button", { name: "Fixture close_menu" })).toBeVisible();
  // The overlay's links read the same labels.
  for (const k of ["about", "partners", "process", "resources", "contact"])
    await expect(page.getByRole("link", { name: `Fixture nav_${k}` }).first()).toBeVisible();
});

test("the settings document itself feeds them, not only the fixture", async ({ request }) => {
  const about = visible(
    await (await request.get("/about", { headers: { cookie: "msot-settings-fixture=1" } })).text(),
  );
  expect(about).toContain(" Fixture privacy link ");
});

// The footer's lines, the untitled title and the error page's words are fields
// too (the operator, 11-06: move them). The lines are templates.
test("fill: each {token} named in the values is filled; any other is left as typed", () => {
  expect(
    fill("©{year} {legal name} dba {name} |", { year: "2026", "legal name": "L", name: "N" }),
  ).toBe("©2026 L dba N |");
  expect(fill("UEI {uei} · {ueii}", { uei: "1" })).toBe("UEI 1 · {ueii}");
  expect(fill("no tokens", {})).toBe("no tokens");
  // Case, spaces and underscores are forgiven; an inherited key is no token.
  expect(fill("{Legal_Name} / { UEI }", { "legal name": "L", uei: "1" })).toBe("L / 1");
  expect(fill("{constructor} {toString}", {})).toBe("{constructor} {toString}");
});

test("a Prismic page with no title is titled from its address, in the document's words", () => {
  expect(untitledTitle(TODAY, "/rep-login")).toBe("MSOT | Rep Login");
  expect(untitledTitle(TODAY, "/")).toBe("Medical Solutions of Texas");
  const words = { untitled_title: "{page} — Site" };
  expect(untitledTitle(words, "/rep-login/")).toBe("Rep Login — Site");
});

test("with every field empty the footer's lines read as they did", async ({ request }) => {
  const shown = visible(await (await request.get("/about", { headers: empty("about") })).text());
  const year = new Date().getFullYear();
  for (const line of [
    " Medical Solutions of Texas (MSOT) ",
    " UEI ",
    " · CAGE ",
    " · FSS ",
    ` ©${year} `,
    " dba Medical Solutions of Texas | ",
  ])
    expect(shown, line).toContain(line);
  expect(shown).not.toMatch(
    /\{(name|short name|legal name|business type|tagline|uei|cage|fss|year)\}/,
  );
});

test("the footer's lines and the error page read the document", async ({ request }) => {
  const about = visible(await (await request.get("/about", { headers: fixture })).text());
  for (const f of ["footer_name_line", "footer_type_line", "footer_ids_line", "footer_copyright"])
    expect(about, f).toMatch(new RegExp(` Fixture ${f}(?!\\w)`));
  expect(about).not.toMatch(/ dba | UEI /);
  // Both kinds of 404: a page's load that throws its own message (the [uid]
  // catch-all's "Page not found"), and an address no route matches
  // (SvelteKit's "Not Found"). With the document, both show its line.
  for (const address of ["/no-such-page-at-all", "/a/b/c"]) {
    const missing = await request.get(address, { headers: fixture });
    expect(missing.status(), address).toBe(404);
    // The page body only: the tab title is settings' not_found_title, another field.
    const err = visible((await missing.text()).match(/<main[\s\S]*<\/main>/)?.[0] ?? "");
    expect(err, address).toContain(" Fixture home_link ");
    expect(err, address).toContain(" Fixture not_found_text ");
    expect(err, address).not.toMatch(/Back to home|Page not found|Not Found/);
  }
  // With no document, today's messages, each as it was.
  const thrown = visible(
    await (await request.get("/no-such-page-at-all", { headers: empty() })).text(),
  );
  expect(thrown).toContain(" Page not found ");
  expect(thrown).toContain(" Back to home ");
  const unmatched = visible(await (await request.get("/a/b/c", { headers: empty() })).text());
  expect(unmatched).toContain(" Not Found ");
  expect(unmatched).toContain(" Back to home ");
});
