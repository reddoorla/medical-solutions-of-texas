<script lang="ts">
  // Lines of a heading with a <br /> between them, spaced as the hand-written
  // markup was ("establish <br /> goals"), so the text a crawler or screen
  // reader gets keeps its word breaks. `joined` renders them on one line.
  let { lines, joined = false }: { lines: string[]; joined?: boolean } = $props();
</script>

{#if joined}{lines.join(" ")}{:else}{#each lines as line, i}{#if i > 0}{" "}<br
      />{" "}{/if}{line}{/each}{/if}
