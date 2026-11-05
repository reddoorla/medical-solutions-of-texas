<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    click?: () => void;
    /** A middle-click opens a link in a new tab without firing `click`. */
    auxclick?: (e: MouseEvent) => void;
    href?: string;
    target?: string;
    rel?: string;
    type?: "button" | "submit" | "reset";
    class?: string;
    children?: Snippet;
  }

  let {
    click = () => {},
    auxclick,
    href = "",
    target,
    rel,
    type = "button",
    class: passedClasses = "",
    children,
  }: Props = $props();

  let isActive = $state(false);

  const baseClasses =
    "flex flex-row items-center text-center no-underline justify-center transition-all duration-300 active:-translate-y-2 hover:text-dark";
</script>

{#if href}
  <a
    onmouseenter={() => (isActive = true)}
    onmouseleave={() => (isActive = false)}
    onclick={() => {
      click();
      isActive = false;
    }}
    onauxclick={auxclick}
    class="{baseClasses} {passedClasses}"
    {href}
    {target}
    {rel}
  >
    <div class="transition-transform duration-300 text-xl {isActive ? '-translate-x-1' : ''}">
      [
    </div>
    <div class="mx-1 uppercase no-underline translate-y-0.5 button-text">
      {@render children?.()}
    </div>
    <div class="transition-transform duration-300 text-xl {isActive ? 'translate-x-1' : ''}">]</div>
  </a>
{:else}
  <button
    {type}
    onmouseenter={() => (isActive = true)}
    onmouseleave={() => (isActive = false)}
    onclick={() => {
      click();
      isActive = false;
    }}
    class="{baseClasses} {passedClasses}"
  >
    <div class="transition-transform duration-300 text-xl {isActive ? '-translate-x-2' : ''}">
      [
    </div>
    <div class="mx-2 uppercase no-underline translate-y-0.5 button-text">
      {@render children?.()}
    </div>
    <div class="transition-transform duration-300 text-xl {isActive ? 'translate-x-2' : ''}">]</div>
  </button>
{/if}

<style>
</style>
