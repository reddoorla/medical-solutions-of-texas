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
