import { expect, test } from "@playwright/test";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import { PRISMIC_ROUTES } from "../../src/lib/prismic-routes.js";

// Prismic's Preview button sends Marketing to /api/preview, which redirects to
// "/preview" + the document's resolved address. A page singleton type with no
// route resolves to "/", so a draft of About would open Home. Each page type's
// address, written out here rather than read from the list under test:
const PAGE_TYPES: Record<string, { path: string; cookie: string }> = {
  home_page: { path: "/", cookie: "msot-home-fixture" },
  about_page: { path: "/about", cookie: "msot-about-fixture" },
  process_page: { path: "/process", cookie: "msot-process-fixture" },
  partners_page: { path: "/partners", cookie: "msot-partners-fixture" },
  resources_page: { path: "/resources", cookie: "msot-resources-fixture" },
  contact_page: { path: "/contact", cookie: "msot-contact-fixture" },
  capabilities_page: { path: "/capabilities", cookie: "msot-capabilities-fixture" },
  privacy_page: { path: "/privacy", cookie: "msot-privacy-fixture" },
};
// Types with no page of their own: they take no route.
const NO_PAGE = ["settings", "team_member", "form_replies"];

test("every page type resolves to its page's address, once", () => {
  for (const [type, { path }] of Object.entries(PAGE_TYPES)) {
    const routes = PRISMIC_ROUTES.filter((r) => r.type === type);
    expect(routes, type).toEqual([{ type, path }]);
  }
  for (const type of NO_PAGE)
    expect(
      PRISMIC_ROUTES.filter((r) => r.type === type),
      type,
    ).toEqual([]);
});

test("every custom type in the repo is either a page type or has no page", () => {
  // A new page type added without a route would preview on Home.
  const types = readdirSync(join(process.cwd(), "customtypes"), { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .filter((t) => t !== "page");
  expect(types.sort()).toEqual([...Object.keys(PAGE_TYPES), ...NO_PAGE].sort());
});

test("the Prismic client is given these routes", () => {
  const src = readFileSync(join(process.cwd(), "src/lib/prismicio.js"), "utf8");
  expect(src).toMatch(/routes: PRISMIC_ROUTES,/);
});

const visible = (html: string) =>
  html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ");

for (const [type, { path, cookie }] of Object.entries(PAGE_TYPES)) {
  const preview = path === "/" ? "/preview" : `/preview${path}`;
  test(`${preview} is served per request and reads the ${type} document`, async ({ request }) => {
    const res = await request.get(preview);
    expect(res.status()).toBe(200);
    expect(visible(await res.text())).not.toContain("Fixture ");
    const draft = await request.get(preview, { headers: { cookie: `${cookie}=1` } });
    expect(draft.status()).toBe(200);
    expect(visible(await draft.text())).toContain("Fixture ");
  });
}
