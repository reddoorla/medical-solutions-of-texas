// Every absolute URL a prerendered file carries must be the production origin.
// Kit 3 prerenders with the placeholder origin "http://sveltekit-prerender"
// (paths.origin is deliberately unset: sveltekit.config.js says why), so any
// absolute URL built from page.url or a load's `url` at prerender time ships
// the placeholder. This site builds its absolute URLs from $lib/site's
// SITE_URL (the layout's fallback og:image moved to it from page.url.origin
// in the kit 3 migration); the hazard is a later read of `url` that skips it.
// Beachfront's three review rounds (beachfront-dentistry#90) showed a source
// scan never lists every spelling of that read, so this checks the output: it
// builds the site exactly as Netlify does, with URL set, and fails on any built
// file that still names the placeholder. Copied from beachfront-dentistry's
// scripts/prerender-origin.mjs (reddoor-maintenance P1-53), via revogen#108.
import { spawnSync } from "node:child_process";
import { readFileSync, readdirSync, realpathSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { pathToFileURL } from "node:url";

export const PLACEHOLDER = "http://sveltekit-prerender";
// The bare host, so an encoded (`http%3A%2F%2Fsveltekit-prerender`), host-only
// or protocol-relative form of the placeholder is caught too. A clean build
// names it nowhere outside `_app/immutable`.
const NEEDLE = "sveltekit-prerender";
const PRODUCTION = "https://medicalsolutionsoftx.com";
// The production host over plain http: an origin assembled from
// page.url.protocol keeps the placeholder's "http:" and names the right host,
// so the needle above never sees it; percent-encoded too, as in a share link
// (revogen#108's review).
const INSECURE = /http(?::|%3A)(?:\/\/|%2F%2F)(?:www\.)?medicalsolutionsoftx\.com(?![\w-]|\.\w)/i;
// The production origin as a whole origin (not a prefix of another host), for
// the control's count. A regex, not `includes`: CodeQL reads a URL literal in
// `includes` as a host check (js/incomplete-url-substring-sanitization).
const CARRIES_PRODUCTION = /https:\/\/medicalsolutionsoftx\.com(?![\w.-])/;

export function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

/** Built files that name the placeholder, and how many name production. */
export function scan(root) {
  const files = walk(root).filter((f) => !/[\\/]_app[\\/]immutable[\\/]/.test(f));
  const offenders = [];
  let production = 0;
  for (const file of files) {
    // Every file, whatever its extension (a prerendered endpoint can be named
    // anything); a NUL byte marks a binary (image, font), which cannot carry it.
    const bytes = readFileSync(file);
    if (bytes.includes(0)) continue;
    const text = bytes.toString("utf8");
    if (text.includes(NEEDLE) || INSECURE.test(text)) offenders.push(relative(root, file));
    if (CARRIES_PRODUCTION.test(text)) production++;
  }
  return { files: files.length, offenders, production };
}

if (process.argv[1] && import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href) {
  const env = { ...process.env, URL: PRODUCTION };
  delete env.VITEST;
  const built = spawnSync("pnpm", ["exec", "vite", "build"], {
    env,
    stdio: "inherit",
  });
  if (built.status !== 0) process.exit(built.status ?? 1);
  const { files, offenders, production } = scan("build");
  // Offenders first: a page built from `url` also drops out of the control's
  // count below, whose message would hide the real defect.
  if (offenders.length > 0) {
    console.error(
      `prerender-origin: ${offenders.length} built file(s) carry ${PLACEHOLDER}, ` +
        `kit 3's prerender placeholder, or http://medicalsolutionsoftx.com, instead of ${PRODUCTION}. Build absolute ` +
        `URLs from $lib/site's SITE_URL, never from page.url or a load's url:\n  ` +
        offenders.join("\n  "),
    );
    process.exit(1);
  }
  // The instrument's control: a build that emitted nothing, or that never
  // took the production URL, would pass the placeholder check vacuously.
  // Measured 2026-10-24: 87 files outside _app/immutable, 8 carrying the
  // production origin (sitemap.xml, robots.txt and six prerendered pages'
  // og:image).
  if (files < 70 || production < 6) {
    console.error(
      `prerender-origin: expected a full build carrying ${PRODUCTION}; ` +
        `saw ${files} files, ${production} naming it`,
    );
    process.exit(1);
  }
  console.log(
    `prerender-origin: ${files} built files, ${production} carry ${PRODUCTION}, none the placeholder`,
  );
}
