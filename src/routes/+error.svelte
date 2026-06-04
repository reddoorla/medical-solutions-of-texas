<script lang="ts">
  import { page } from "$app/stores";
</script>

<main class="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-light">
  <h1>{$page.status}</h1>
  <p>{$page.error?.message ?? "Page not found"}</p>
  <a href="/" class="underline">Back to home</a>
</main>
