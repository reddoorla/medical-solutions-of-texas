import { createSvelteConfig } from "@reddoorla/maintenance/configs/svelte";
import adapter from "@sveltejs/adapter-netlify";

/** @type {import('@sveltejs/kit').Config} */
export default createSvelteConfig({
  kit: {
    adapter: adapter({ edge: false, split: false }),
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
