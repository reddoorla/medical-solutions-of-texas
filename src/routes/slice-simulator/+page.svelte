<script lang="ts">
  import type { ComponentProps } from "svelte";
  import { SliceSimulator } from "@slicemachine/adapter-sveltekit/simulator";
  import { SliceZone } from "@prismicio/svelte";
  import { components } from "$lib/slices";
</script>

<SliceSimulator>
  {#snippet children({ slices }: { slices: ComponentProps<typeof SliceZone>["slices"] })}
    <SliceZone {slices} {components} />
  {/snippet}
</SliceSimulator>
