import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";

// src/app.html ships in every page, so internal notes go in docs/app-html.md,
// not in its comments (HTML or script).

test("src/app.html carries no comments", () => {
  const html = readFileSync("src/app.html", "utf8");
  expect(html).not.toMatch(/<!--/);
  expect(html).not.toMatch(/^\s*\/\/|\/\*/m);
});

test("a served page's <head> carries no notes from app.html", async ({ request }) => {
  const html = await (await request.get("/contact")).text();
  const head = html.slice(0, html.indexOf("</head>"));
  // Svelte's own markers are allowed (<!--[-->, <!--[0-->, <!--12qhfyh-->): no
  // spaces, no words. A note has spaces.
  expect(head.match(/<!--(?![\w[\]!]{0,16}-->)[\s\S]*?-->/g) ?? []).toEqual([]);
  expect(head).not.toMatch(/Lighthouse|decision \d|headless/i);
});

// Search-engine ownership: Google's tag proves Search Console, Bing's proves
// Bing Webmaster Tools (the operator, 11-25). Removing either un-verifies the
// site, and nothing else would notice until a report goes missing.
for (const path of ["/", "/contact"]) {
  test(`${path}: the <head> carries the Google and Bing verification tags`, async ({ request }) => {
    const html = await (await request.get(path)).text();
    const head = html.slice(0, html.indexOf("</head>"));
    expect(head).toContain(
      '<meta name="google-site-verification" content="LUqp6fAiix3BaJm7OjOuBrwjRKZ58FJMS1yurgKN2Hk"',
    );
    expect(head).toContain('<meta name="msvalidate.01" content="AC668E6C845F5F1BD2F6090D73F5B10E"');
  });
}
