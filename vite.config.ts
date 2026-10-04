import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import { imagetools } from "@zerodevx/svelte-img/vite";
import tailwindcss from "@tailwindcss/vite";
import { prismicBarrel } from "./scripts/prismic-barrel";

export default defineConfig({
  plugins: [sveltekit(), imagetools(), tailwindcss(), prismicBarrel()],
  server: {
    fs: {
      allow: [".."],
    },
  },
});
