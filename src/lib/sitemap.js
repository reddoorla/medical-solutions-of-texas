// The sitemap's entries, as a pure function of the Prismic documents, so the
// rules are testable without a Prismic document for each case.
//
// <lastmod>: Google uses it only "if it's consistently and verifiably (for
// example by comparing to the last modification of the page) accurate". A
// page built in code changes when the code does, which no Prismic date
// records: the five pages built on 11-04 said 2024-10-17. So only pages whose
// content is the Prismic document (the `[uid]` catch-all) carry one.

/**
 * @param {Array<{ type: string, uid?: string | null, last_publication_date?: string }>} docs
 * @param {{ siteUrl: string, codeRoutes: Array<{ path: string, listed: boolean }>, codeBuiltUids: readonly string[], retiredUids: Set<string> }} opts
 * @returns {Array<{ loc: string, lastmod?: string }>}
 */
export function sitemapEntries(docs, { siteUrl, codeRoutes, codeBuiltUids, retiredUids }) {
  /** @type {Array<{ loc: string, lastmod?: string }>} */
  const entries = [];
  const seen = new Set();
  const add = (/** @type {{ loc: string, lastmod?: string }} */ e) => {
    if (seen.has(e.loc)) return;
    seen.add(e.loc);
    entries.push(e);
  };
  // A code route decides its own listing, so a Prismic doc with the same uid
  // never lists a location twice (#142), nor lists an unlisted one (a draft).
  const codeLocs = new Set(codeRoutes.map(({ path }) => siteUrl + path));
  for (const doc of docs) {
    // Only page documents are addressable: "home" is "/", every other page "/<uid>".
    if (doc.type !== "page" || !doc.uid || retiredUids.has(doc.uid)) continue;
    const loc = siteUrl + (doc.uid === "home" ? "/" : `/${doc.uid}`);
    if (codeLocs.has(loc)) continue;
    const lastmod = codeBuiltUids.includes(doc.uid)
      ? undefined
      : doc.last_publication_date?.slice(0, 10);
    add(lastmod ? { loc, lastmod } : { loc });
  }
  for (const { path, listed } of codeRoutes) if (listed) add({ loc: siteUrl + path });
  return entries;
}
