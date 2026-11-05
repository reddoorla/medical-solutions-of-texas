<script lang="ts" module>
  const events = ["pointerdown", "pointermove", "wheel", "keydown", "touchstart"] as const;

  let engaged = $state(false);
  let armed = false;

  function arm() {
    if (armed) return;
    armed = true;
    const engage = (e: Event) => {
      // Chromium fires a trusted pointermove with no movement when the layout
      // shifts under a resting cursor: not a visitor (#141; the Tag Manager
      // loader filters it the same way).
      if (
        e.type === "pointermove" &&
        !(e as PointerEvent).movementX &&
        !(e as PointerEvent).movementY
      )
        return;
      engaged = true;
      for (const ev of events) window.removeEventListener(ev, engage);
    };
    for (const ev of events) window.addEventListener(ev, engage, { passive: true });
  }
</script>

<script lang="ts">
  import type { Snippet } from "svelte";

  let { children }: { children: Snippet } = $props();

  $effect(() => {
    arm();
  });
</script>

{#if engaged}
  {@render children()}
{/if}
