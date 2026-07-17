import { createClient } from "$lib/prismicio";
// Canonical origin imported from a single $lib constant, never re-hardcoded, so
// the sitemap stays in lockstep with the rest of the site's absolute URLs.
import { SITE_URL } from "$lib/site";

// Prerendered alongside the rest of the site, so Netlify serves it as a static file.
export const prerender = true;

// Prismic document type -> public path. Mirrors the route resolver in
// src/lib/prismicio.js: the "home" page lives at "/", every other page at "/<uid>".
// Only page documents are addressable; any other type is intentionally excluded.
/** @type {Record<string, (uid: string) => string>} */
const TYPE_PATHS = {
  page: (uid) => (uid === "home" ? "/" : `/${uid}`),
};

// Retired page uids: still present as Prismic docs but intentionally not public
// (see the /rep-login redirect in netlify.toml). Excluded here so the sitemap
// never re-advertises a URL that only 301s away.
/** @type {Set<string>} */
const RETIRED_UIDS = new Set(["rep-login"]);

export async function GET({ fetch }) {
  const client = createClient({ fetch });
  const docs = await client.dangerouslyGetAll().catch(() => []);

  const urls = [];
  for (const doc of docs) {
    const build = TYPE_PATHS[doc.type];
    if (!build || !doc.uid) continue;
    if (RETIRED_UIDS.has(doc.uid)) continue;
    const loc = SITE_URL + build(doc.uid);
    const lastmod = doc.last_publication_date?.slice(0, 10);
    urls.push(
      `  <url>\n    <loc>${loc}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ""}\n  </url>`,
    );
  }

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;

  return new Response(body, {
    headers: { "Content-Type": "application/xml" },
  });
}
