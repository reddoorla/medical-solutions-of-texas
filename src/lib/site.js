// Single source of truth for the canonical origin (apex, no www). Import this
// anywhere an absolute URL is needed — the sitemap, canonical/og tags, JSON-LD —
// so the value can never drift. Re-hardcoding this string on a sibling site is
// what caused a stale-www sitemap bug, so keep it defined in exactly one place.
export const SITE_URL = "https://medicalsolutionsoftx.com";
