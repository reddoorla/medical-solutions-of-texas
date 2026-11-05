<script lang="ts">
  import dots from "$lib/assets/dots_square.png";
  import placeholder from "$lib/assets/images/profile_placeholder.png";
  import { browser } from "$app/env";
  import { fly } from "svelte/transition";
  import { X } from "@lucide/svelte";
  import ContentWidth from "../ContentWidth/ContentWidth.svelte";
  import { PrismicRichText } from "@prismicio/svelte";
  import type { RichTextField } from "@prismicio/client";

  let showOverlay = $state(false);

  const toggleOverlay = () => {
    showOverlay = !showOverlay;
    if (showOverlay) {
      disableScroll();
    } else {
      enableScroll();
    }
  };

  function disableScroll() {
    const y = window.scrollY;
    if (browser) window.onscroll = () => window.scrollTo(0, y);
  }

  function enableScroll() {
    if (browser) {
      setTimeout(() => (window.onscroll = () => {}));
    }
  }

  interface Props {
    name: string;
    title: string;
    headshot?: string;
    /** The headshot's alt text; defaults to the name. */
    alt?: string;
    bio?: string;
    /** A Prismic bio, shown under the name on a card with no popup. */
    richBio?: RichTextField;
    /** A LinkedIn profile URL, linked under the name on a card with no popup. */
    linkedin?: string;
    noclick?: boolean;
  }

  let {
    name,
    title,
    headshot = placeholder,
    alt,
    bio = name + " is the " + title + " at MSOT.",
    richBio,
    linkedin,
    noclick = false,
  }: Props = $props();
</script>

<!-- With no popup the card is a plain block, not a button that does nothing:
     no empty tab stop, and a bio's LinkedIn link is valid inside it. -->
<svelte:element
  this={noclick ? "div" : "button"}
  class="w-64 md:w-96 lg:w-72 xl:w-96 opacity-90 {noclick ? '' : 'hover:opacity-100'}"
  onclick={noclick ? undefined : toggleOverlay}
>
  <div class="w-full aspect-square relative overflow-hidden">
    <img alt="" src={dots} class="w-full h-full absolute bottom-0 right-0" />
    <img
      alt={alt ?? name}
      src={headshot}
      class="w-[96.5%] h-[96.5%] object-cover absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
    />
  </div>
  <div class="w-full h-[2px] bg-light mt-6"></div>
  <h5 class="text-light mt-4 text-left">{title}</h5>
  <h3 class="text-white mt-2 text-left xl:text-nowrap">{name}</h3>
  {#if noclick && richBio}
    <!-- Bio as plain text under the name. A "Read bio" toggle on phones, and
         the card's height with a 90-word bio, are Erik's design call. -->
    <div
      class="text-light mt-4 text-left space-y-3 [&_p]:text-[18px] [&_p]:leading-normal"
      data-testid="team-bio"
    >
      <PrismicRichText field={richBio} />
    </div>
  {/if}
  {#if noclick && linkedin}
    <a
      href={linkedin}
      target="_blank"
      rel="noopener noreferrer"
      class="label text-light underline hover:text-white mt-4 inline-block"
      >LinkedIn<span class="sr-only"> profile of {name} (opens in a new tab)</span></a
    >
  {/if}
</svelte:element>
{#if showOverlay}
  <div
    class="w-screen h-screen fixed bg-[#140F09] text-light left-0 top-0 flex items-center justify-between z-50"
    transition:fly={{ x: "100%" }}
  >
    <ContentWidth
      class="flex flex-col justify-center items-center lg:items-start lg:flex-row lg:justify-between lg:aspect-video py-16 relative"
    >
      <div class="w-64 md:w-96 lg:w-72 xl:w-96">
        <div class="w-full aspect-square relative overflow-hidden">
          <img alt="" src={dots} class="w-full h-full absolute bottom-0 right-0" />
          <img alt={name} src={headshot} class="w-full h-full object-cover absolute" />
        </div>
        <div class="w-full h-[2px] bg-light mt-6"></div>
        <h5 class="text-light mt-6 text-center lg:text-left">{title}</h5>
        <h3 class="text-white mt-6 xl:text-nowrap text-center lg:text-left">
          {name}
        </h3>
      </div>
      <div class="w-full lg:w-2/3 mt-12 lg:mt-0 lg:px-8">
        {bio}
      </div>
      <button
        onclick={toggleOverlay}
        class="absolute top-0 right-0"
        aria-label="Close team member detail"
      >
        <X size={32} strokeWidth={1} class="transition text-light hover:text-white" />
      </button>
    </ContentWidth>
  </div>
{/if}
