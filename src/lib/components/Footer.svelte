<script lang="ts">
  import FooterIdentity from "./FooterIdentity.svelte";
  import ContentWidth from "./ContentWidth/ContentWidth.svelte";
  import BracketButton from "./Buttons/BracketButton.svelte";
  import vosbLogo from "$lib/assets/icons/logos/vosb_white.svg";
  import msotLogo from "$lib/assets/icons/logos/msot_logo.svg";
  import { onMount } from "svelte";

  let viewportHeight: number = $state(typeof window !== "undefined" ? window.innerHeight : 1080);

  let ctaTrigger: HTMLElement | undefined = $state();
  let isCtaActive = $state(false);

  const handleScroll = () => {
    if (ctaTrigger) {
      const ctaBottom = ctaTrigger.getBoundingClientRect().bottom;
      isCtaActive = ctaBottom < viewportHeight;
    }
  };

  onMount(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  });
</script>

<svelte:window bind:innerHeight={viewportHeight} />

<section class="bg-[#998B6A] py-44">
  <ContentWidth>
    <!-- Decoration: the buttons below carry the call to action, so this line is not a heading. -->
    <div class="h-44 overflow-hidden relative w-full" aria-hidden="true">
      <div class="h1 text-mid add-outline absolute bottom-0 left-0 opacity-40">
        let’s get started
      </div>
      <div
        class="h1 outlined absolute bottom-0 left-0 transition-opacity duration-1000 {isCtaActive
          ? 'opacity-100  delay-700'
          : 'opacity-0'}"
      >
        let’s get started
      </div>
      <div
        class="h1 text-mid add-outline absolute bottom-0 left-0 transition-opacity duration-1000 {isCtaActive
          ? 'opacity-100 delay-[1400ms]'
          : 'opacity-0'}"
      >
        let’s get started
      </div>
    </div>
    <div class="flex flex-row gap-6 ml-2 w-full" bind:this={ctaTrigger}>
      <BracketButton class="text-mid" href="/contact">Contact Us</BracketButton>
      <BracketButton class="text-mid" href="/process">Learn More</BracketButton>
    </div>
  </ContentWidth>
</section>

<footer class="py-6 bg-[#998B6A]">
  <ContentWidth
    class="flex flex-row gap-6 justify-between items-start pt-6 border-t-2 border-white"
  >
    <div class="flex flex-col gap-4 items-start min-w-0">
      <a href="/" class="bump self-start h-16 md:h-20 relative"
        ><img
          class="h-full transitionn duration-700 ease-fast-slow delay-500"
          src={msotLogo}
          style="transform-origin:top left"
          alt="Medical Solutions of Texas home"
        /></a
      >
      <FooterIdentity />
    </div>
    <img src={vosbLogo} alt="Veteran-Owned Small Business (VOSB)" class="h-16 md:h-24 self-start" />
  </ContentWidth>
</footer>
