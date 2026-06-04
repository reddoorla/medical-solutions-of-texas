<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    text?: string;
    click?: () => void;
    filled?: boolean;
    href?: string;
    class?: string;
    children?: Snippet;
  }

  let {
    text = "BUTTON",
    click = () => {},
    filled = true,
    href = "",
    class: passedClasses = "",
    children,
  }: Props = $props();

  const baseClasses =
    "border-2 border-dark w-full md:w-auto text-center mb-5 sm:mb-0 uppercase cursor-pointer text-nowrap transition-all duration-300 active:-translate-y-2";

  const filledClasses = $derived(
    filled
      ? "bg-dark bg-opacity-80 hover:bg-opacity-100 active:bg-black text-white"
      : "hover:bg-dark text-dark hover:text-white active:bg-black",
  );
</script>

{#if href}
  <a {href} onclick={click} class="{baseClasses} {filledClasses} {passedClasses}">
    {#if children}{@render children()}{:else}{text}{/if}
  </a>
{:else}
  <button onclick={click} class="{baseClasses} {filledClasses} {passedClasses}">
    {#if children}{@render children()}{:else}{text}{/if}
  </button>
{/if}

<style>
  button {
    font-size: 14px;
    font-style: normal;
    font-weight: 400;
    line-height: 1em;
    text-align: center;
    border-radius: 3px;
    display: flex;
    padding: 13px 48px 9px 48px;
    justify-content: center;
    align-items: center;
  }
  @media only screen and (max-width: 1340px) {
    button {
      font-size: 14px;
      font-style: normal;
      font-weight: 400;
      text-align: center;
      border-radius: 3px;
      padding: 13px 36px 9px 36px;
    }
  }
</style>
