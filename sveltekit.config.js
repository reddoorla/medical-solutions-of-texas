import { createKitConfig } from "@reddoorla/maintenance/configs/svelte";
import adapter from "@sveltejs/adapter-netlify";

// VITE_REDDOOR_GATE_FIXTURES=1 builds the /dev fixtures into the bundle, for
// the a11y gate's own build and nothing else (src/routes/dev/+layout.server.ts,
// reddoor-maintenance#948). Set on Netlify it would deploy them, so refuse it
// there, at module load.
if (process.env.VITE_REDDOOR_GATE_FIXTURES && process.env.NETLIFY) {
  throw new Error(
    "VITE_REDDOOR_GATE_FIXTURES is set on Netlify: it builds the /dev fixtures into the " +
      "deployed site. It belongs to the a11y gate's own build (reddoor-maint audit) only. " +
      "Unset it in the Netlify environment.",
  );
}

// SvelteKit 3 refuses `svelte.config.js` (`config_file_unsupported`): its
// configuration is passed to the `sveltekit(...)` plugin in vite.config.ts,
// top-level, with no `kit` namespace. It lives here rather than inline so
// eslint.config.js and tests/privacy/services.spec.ts read the same file.
// createKitConfig supplies the canonical $components/$utils/$stores/$assets
// aliases this site used to list by hand, plus `$lib`, which kit 3 no longer
// provides.
//
// Kit 2 took Netlify's URL as `prerender.origin`; kit 3 removed it for
// `paths.origin`, which is also the ONLY origin kit 3's CSRF check accepts a
// form POST from, so setting it would 403 the contact form on any other host
// (a netlify.app alias, a deploy preview). It stays unset: prerendered pages
// see kit's "http://sveltekit-prerender" placeholder as page.url, and absolute
// URLs come from $lib/site's SITE_URL instead (scripts/prerender-origin.mjs
// checks the built output for the placeholder).
export default createKitConfig({ adapter: adapter({ edge: false, split: false }) });
