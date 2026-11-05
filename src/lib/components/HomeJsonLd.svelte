<script lang="ts">
  // Its own component because a component may hold only one <svelte:head>,
  // and Home's page already has one.
  import { homeGraph, jsonLdScript } from "$lib/structured-data";
</script>

<svelte:head>
  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  {@html jsonLdScript(homeGraph())}
</svelte:head>
