<script lang="ts">
  import { page } from "$app/state";

  // The words are the settings document's ($lib/copy/chrome), from the root layout.
  const chrome = $derived(page.data.chrome);
</script>

<main class="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-light">
  <h1>{page.status}</h1>
  <p>
    {page.status === 404 && page.data.notFoundOwn
      ? chrome.not_found_text
      : (page.error?.message ?? chrome.not_found_text)}
  </p>
  <a href="/" class="underline">{chrome.home_link}</a>
</main>
