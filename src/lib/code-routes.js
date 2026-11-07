// Prismic `page` uids whose page is built in code by its own route, not by the
// `[uid]` catch-all. Shared by the catch-all (never prerender these a second
// time) and the sitemap (no <lastmod> for them; see src/lib/sitemap.js).
// "home" is "/". A new code route's uid goes here too: a Prismic doc with the
// same uid would otherwise collide with it (#142). tests/smoke/sitemap.spec.ts
// checks this list against the route folders.
/** @type {readonly string[]} */
export const CODE_BUILT_UIDS = [
  "home",
  "about",
  "contact",
  "partners",
  "process",
  "resources",
  "privacy",
  "capabilities",
];
