import { test, expect } from "@playwright/test";
import { readdirSync, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { sitemapEntries } from "../../src/lib/sitemap.js";
import { CODE_BUILT_UIDS } from "../../src/lib/code-routes.js";

// <lastmod> only where a Prismic date is the page's content date (the `[uid]`
// catch-all). Pages built in code carry none: production gave 2024-10-17 for
// five pages whose content changed in code on 2026-11-04.

const SITE = "https://medicalsolutionsoftx.com";
const OPTS = {
  siteUrl: SITE,
  codeRoutes: [
    { path: "/capabilities", listed: true },
    { path: "/privacy", listed: false },
  ],
  codeBuiltUids: CODE_BUILT_UIDS,
  retiredUids: new Set(["rep-login"]),
};
const doc = (uid: string, date = "2024-10-17T12:00:00+0000", type = "page") => ({
  type,
  uid,
  last_publication_date: date,
});

test("pages built in code carry no lastmod; Prismic-built pages keep theirs", () => {
  const e = sitemapEntries(
    [
      doc("home"),
      doc("about"),
      doc("resources", "2024-11-13T00:00:00+0000"),
      doc("a-guide", "2026-12-01T09:00:00+0000"),
    ],
    OPTS,
  );
  expect(e).toEqual([
    { loc: `${SITE}/` },
    { loc: `${SITE}/about` },
    { loc: `${SITE}/resources` },
    { loc: `${SITE}/a-guide`, lastmod: "2026-12-01" },
    { loc: `${SITE}/capabilities` },
  ]);
});

test("a Prismic doc sharing a code route's uid is never listed twice, nor listed while its route is unlisted", () => {
  const e = sitemapEntries(
    [doc("capabilities"), doc("privacy"), doc("rep-login"), doc("x", undefined, "settings")],
    OPTS,
  );
  expect(e).toEqual([{ loc: `${SITE}/capabilities` }]);
  const listed = sitemapEntries([doc("privacy")], {
    ...OPTS,
    codeRoutes: [{ path: "/privacy", listed: true }],
  });
  expect(listed).toEqual([{ loc: `${SITE}/privacy` }]);
});

test("every page route built in code is a reserved uid", () => {
  const routes = join(process.cwd(), "src/routes");
  const pageDirs = (dir: string) =>
    readdirSync(dir, { withFileTypes: true })
      .filter(
        (d) =>
          d.isDirectory() &&
          !d.name.startsWith("[") &&
          existsSync(join(dir, d.name, "+page.svelte")),
      )
      .map((d) => d.name);
  const built = [...pageDirs(routes), ...pageDirs(join(routes, "[[preview=preview]]"))].filter(
    (n) => n !== "slice-simulator" && n !== "dev",
  );
  expect(built.length).toBeGreaterThan(6);
  for (const name of built) expect(CODE_BUILT_UIDS, name).toContain(name);
  // Both ways: a stale entry would stop a Prismic page with that uid forever.
  expect([...CODE_BUILT_UIDS].sort()).toEqual([...built, "home"].sort());
  // The catch-all reserves exactly this list (#142).
  const catchAll = readFileSync(join(routes, "[[preview=preview]]/[uid]/+page.server.js"), "utf8");
  expect(catchAll).toMatch(/const RESERVED_UIDS = CODE_BUILT_UIDS;/);
});

test("the served sitemap gives no lastmod for any page built in code", async ({ request }) => {
  const xml = await (await request.get("/sitemap.xml")).text();
  const entries = [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((m) => m[1]);
  const locs = entries.map((e) => e.match(/<loc>([^<]*)<\/loc>/)![1]);
  for (const path of ["/", "/about", "/process", "/partners", "/contact", "/resources"])
    expect(locs, path).toContain(SITE + path);
  // Written out, not read from the list under test.
  const CODE_BUILT_PATHS = ["/", "/about", "/process", "/partners", "/contact", "/resources"];
  for (const e of entries) {
    const path = e.match(/<loc>([^<]*)<\/loc>/)![1].slice(SITE.length) || "/";
    if (CODE_BUILT_PATHS.includes(path)) expect(e, path).not.toContain("<lastmod>");
  }
});
