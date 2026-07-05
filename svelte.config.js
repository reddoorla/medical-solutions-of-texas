import { createSvelteConfig } from "@reddoorla/maintenance/configs/svelte";
import adapter from "@sveltejs/adapter-netlify";

/** @type {import('@sveltejs/kit').Config} */
export default createSvelteConfig({
  kit: {
    adapter: adapter({ edge: false, split: false }),
    // Netlify sets URL to the production origin at build time. Without this,
    // prerendered pages bake SvelteKit's "http://sveltekit-prerender"
    // placeholder into the fallback og:image URL. Local builds keep the
    // placeholder (build output only, never dev). Mirrors the reddoor-starter.
    ...(process.env.URL ? { prerender: { origin: process.env.URL } } : {}),
    // Site-specific path aliases — preserved through the canonical config.
    // (sync-configs would otherwise clobber these; keep them on re-sync.)
    alias: {
      $components: "src/lib/components",
      "$components/*": "src/lib/components/*",
      $utils: "src/lib/utils",
      "$utils/*": "src/lib/utils/*",
      $stores: "src/lib/stores",
      "$stores/*": "src/lib/stores/*",
      $assets: "src/lib/assets",
      "$assets/*": "src/lib/assets/*",
    },
  },
});
