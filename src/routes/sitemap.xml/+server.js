import { createClient } from "$lib/prismicio";
// Canonical origin imported from a single $lib constant, never re-hardcoded, so
// the sitemap stays in lockstep with the rest of the site's absolute URLs.
import { SITE_URL } from "$lib/site";
import { PRIVACY_POLICY_DRAFT, PRIVACY_PATH } from "$lib/privacy/policy";
import { CODE_BUILT_UIDS } from "$lib/code-routes";
import { sitemapEntries } from "$lib/sitemap";

// Prerendered alongside the rest of the site, so Netlify serves it as a static file.
export const prerender = true;

// Retired page uids: still present as Prismic docs but intentionally not public
// (see the /rep-login redirect in netlify.toml). Excluded here so the sitemap
// never re-advertises a URL that only 301s away.
/** @type {Set<string>} */
const RETIRED_UIDS = new Set(["rep-login"]);

// Routes written in code, not Prismic: each decides its own listing, whether or
// not a Prismic doc shares its uid. The Privacy Policy is listed once it
// leaves draft, because a draft is noindex.
const CODE_ROUTES = [
  { path: "/capabilities", listed: true },
  { path: PRIVACY_PATH, listed: !PRIVACY_POLICY_DRAFT },
];

export async function GET({ fetch }) {
  const client = createClient({ fetch });
  const docs = await client.dangerouslyGetAll().catch(() => []);

  const urls = sitemapEntries(docs, {
    siteUrl: SITE_URL,
    codeRoutes: CODE_ROUTES,
    codeBuiltUids: CODE_BUILT_UIDS,
    retiredUids: RETIRED_UIDS,
  }).map(
    ({ loc, lastmod }) =>
      `  <url>\n    <loc>${loc}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ""}\n  </url>`,
  );

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;

  return new Response(body, {
    headers: { "Content-Type": "application/xml" },
  });
}
