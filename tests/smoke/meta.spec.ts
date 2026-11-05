import { test, expect } from "@playwright/test";

// MSOT Marketing's Developer Brief Part 2, §12e: a title, description, social
// preview and self-referencing canonical per page, and one <h1>. Read from the
// server HTML, which is what a crawler or AI assistant gets.
const SITE = "https://medicalsolutionsoftx.com";

const EXPECTED: Record<string, { title: string; description: string }> = {
  "/": {
    title: "VA and DoW Healthcare Contracting for Medical Vendors | MSOT",
    description:
      "MSOT is a San Antonio VOSB that helps med-surg manufacturers get on ECAT, FSS and DAPA contracts and into VA and DoW facilities.",
  },
  "/about": {
    title: "About MSOT · Veteran-Owned Small Business, San Antonio",
    description:
      "Who MSOT is: a VOSB founded by Air Force logistics and medical sales veterans to connect med-surg suppliers with VA and DoW contracts.",
  },
  "/process": {
    title: "How MSOT Gets Manufacturers on Federal Contract",
    description:
      "How MSOT takes med-surg manufacturers from first call to an ECAT, FSS or DAPA contract, with timelines and common questions.",
  },
  "/partners": {
    title: "MSOT Partners · Manufacturers Selling to the VA and DoW",
    description:
      "The manufacturers MSOT works with, and what makes a successful VA and DoW partnership.",
  },
  "/resources": {
    title: "MSOT Resources · FSS Catalog, Capabilities Statement, Guides",
    description:
      "MSOT's FSS catalog, capabilities statement, technique guides and federal procurement guides for manufacturers.",
  },
  "/contact": {
    title: "Contact MSOT · San Antonio, TX",
    description:
      "Contact MSOT at 4903 Golden Quail, Suite 120, San Antonio, TX 78240, or call 833.307.4418.",
  },
  "/privacy": {
    title: "Privacy Policy | MSOT",
    description:
      "What information the Medical Solutions of Texas website collects, why, who else receives it, and the choices you have.",
  },
};

const decode = (s: string) =>
  s
    .replace(/&amp;/g, "&")
    .replace(/&#39;|&#x27;|&apos;/g, "'")
    .replace(/&quot;/g, '"');

function all(html: string, re: RegExp): string[] {
  return [...html.matchAll(re)].map((m) => decode(m[1]));
}
const metaContent = (html: string, attr: string, name: string) =>
  all(html, new RegExp(`<meta ${attr}="${name}" content="([^"]*)"`, "g"));

for (const [path, want] of Object.entries(EXPECTED)) {
  test(`${path}: its own title, description, social preview and canonical`, async ({ request }) => {
    const html = await (await request.get(path)).text();
    expect(want.title.length, "title fits 60 characters").toBeLessThanOrEqual(60);
    expect(want.description.length, "description fits 160").toBeLessThanOrEqual(160);

    expect(all(html, /<title>([^<]*)<\/title>/g)).toEqual([want.title]);
    expect(metaContent(html, "name", "description")).toEqual([want.description]);
    expect(metaContent(html, "property", "og:title")).toEqual([want.title]);
    expect(metaContent(html, "property", "og:description")).toEqual([want.description]);

    const canonical = path === "/" ? SITE : `${SITE}${path}`;
    expect(all(html, /<link rel="canonical" href="([^"]*)"/g)).toEqual([canonical]);
    expect(metaContent(html, "property", "og:url")).toEqual([canonical]);
  });
}

test("no two pages share a title or a description", async ({ request }) => {
  const titles = new Set<string>();
  const descriptions = new Set<string>();
  for (const path of Object.keys(EXPECTED)) {
    const html = await (await request.get(path)).text();
    titles.add(all(html, /<title>([^<]*)<\/title>/g)[0]);
    descriptions.add(metaContent(html, "name", "description")[0]);
  }
  expect(titles.size).toBe(Object.keys(EXPECTED).length);
  expect(descriptions.size).toBe(Object.keys(EXPECTED).length);
});

test("a missing page is titled 'Page not found | MSOT', with no canonical", async ({ page }) => {
  // Netlify serves the prerendered 404 for an unknown path; dev renders +error.
  const res = await page.goto("/llms.txt-does-not-exist");
  expect(res?.status()).toBe(404);
  await expect(page).toHaveTitle("Page not found | MSOT");
  const html = await page.content();
  expect(metaContent(html, "property", "og:title")).toEqual(["Page not found | MSOT"]);
  expect(html).not.toContain('rel="canonical"');
});

// §12e / Xicmo H1 check: one <h1> naming the page, in the server HTML.
const ONE_H1: Record<string, string> = {
  "/about": "About MSOT",
  "/process": "Our Process",
  "/partners": "Our Partners",
  "/resources": "Resources",
  "/contact": "Contact Us",
  "/privacy": "Privacy Policy",
};

for (const path of Object.keys(EXPECTED)) {
  test(`${path}: "let's get started" is decoration, never a heading`, async ({ request }) => {
    const html = await (await request.get(path)).text();
    const h1s = all(html, /<h1\b[^>]*>([\s\S]*?)<\/h1>/g).map((h) =>
      h
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim(),
    );
    expect(h1s.join(" | ")).not.toMatch(/get started/i);
    // Each "let's get started" sits inside an aria-hidden wrapper.
    const ctas = [...html.matchAll(/<div class="h-44[^"]*"([^>]*)>[\s\S]*?let’s get started/g)];
    expect(ctas.length, "the footer CTA is on the page").toBeGreaterThan(0);
    for (const m of ctas) expect(m[1]).toContain('aria-hidden="true"');
  });
}

for (const [path, heading] of Object.entries(ONE_H1)) {
  test(`${path}: exactly one <h1>, "${heading}"`, async ({ request }) => {
    const html = await (await request.get(path)).text();
    const h1s = all(html, /<h1\b[^>]*>([\s\S]*?)<\/h1>/g).map((h) =>
      h
        .replace(/<[^>]+>/g, " ")
        .replace(/<!--[\s\S]*?-->/g, "")
        .replace(/\s+/g, " ")
        .trim(),
    );
    expect(h1s.length, `h1s: ${JSON.stringify(h1s)}`).toBe(1);
    expect(h1s[0].toLowerCase()).toBe(heading.toLowerCase());
  });
}

test("the khaki logo keys off the route, not the page title", async ({ page }) => {
  for (const [path, khaki] of [
    ["/resources", true],
    ["/contact", true],
    ["/about", false],
  ] as const) {
    await page.goto(path, { waitUntil: "networkidle" });
    const src = await page.locator('img[alt="msot logo"]').first().getAttribute("src");
    expect(src ?? "", path).toMatch(khaki ? /msot_khaki/ : /msot_logo(?!_sand)/);
  }
});
