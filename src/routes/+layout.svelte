<script lang="ts">
  import type { Snippet } from "svelte";
  import { Menu, X } from "@lucide/svelte";
  import { PrismicPreview } from "@prismicio/svelte/kit";
  import { page } from "$app/stores";
  import { browser } from "$app/environment";
  import { repositoryName } from "$lib/prismicio";
  import { fly, fade } from "svelte/transition";
  import msotLogo from "$lib/assets/icons/logos/msot_logo.svg";
  import msotLogoSand from "$lib/assets/icons/logos/msot_logo_sand.svg";
  import msotLogoKhaki from "$lib/assets/icons/logos/msot_khaki.png";
  import "../app.css";
  import ContentWidth from "$lib/components/ContentWidth/ContentWidth.svelte";
  import { onMount } from "svelte";
  import { onNavigate } from "$app/navigation";
  import { whenPageReady, prefersReducedMotion } from "@reddoorla/maintenance/client";

  interface Props {
    children?: Snippet;
    data: { isPreviewSession?: boolean };
  }

  let { children, data }: Props = $props();

  // --- Document head / SEO fallbacks --------------------------------------
  // A page's own Prismic value always wins; these only fill in when the field
  // is empty/absent so no page ever renders an empty <meta name="description">
  // or a blank/duplicate <title>.
  const SITE_NAME = "Medical Solutions of Texas";
  // Last-resort description, derived from the real homepage copy (VOSB status +
  // navigating government healthcare contracting for the DoD/VA).
  const DEFAULT_DESCRIPTION =
    "Medical Solutions of Texas is a Veteran-Owned Small Business that helps medical vendors navigate government healthcare contracting for the DoD and VA.";

  // Route-derived title so an untitled Prismic doc still yields a unique, human
  // <title> ("/process" -> "MSOT | Process") instead of an empty/duplicate tag.
  function fallbackTitle(pathname: string): string {
    const seg = pathname
      .replace(/^\/+|\/+$/g, "")
      .split("/")
      .filter(Boolean)
      .pop();
    if (!seg) return SITE_NAME;
    const label = seg
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
    return `MSOT | ${label}`;
  }

  let pageTitle = $derived(
    $page.data.title || $page.data.meta_title || fallbackTitle($page.url.pathname),
  );
  let metaDescription = $derived($page.data.meta_description || DEFAULT_DESCRIPTION);

  let isOverlayVisible = $state(false);
  let viewportWidth: number = $state(typeof window !== "undefined" ? window.innerWidth : 1920);

  const NAV_LINKS = [
    { label: "About", href: "/about" },
    { label: "Partners", href: "/partners" },
    { label: "Process", href: "/process" },
    { label: "Resources", href: "/resources" },
    { label: "Contact", href: "/contact" },
  ];

  let main: HTMLElement | undefined = $state();
  let showNav = $state(true);
  let isReady = $state(false);
  let isTransitioning = $state(false);

  // false during SSR; the client instance re-evaluates with the real setting.
  const reducedMotion = prefersReducedMotion();

  let lastScrollY = 0;

  const handleScroll = () => {
    const currentScrollY = window.scrollY;
    if (Math.abs(currentScrollY - lastScrollY) > 10) {
      showNav = currentScrollY < lastScrollY;
    }
    lastScrollY = currentScrollY;
  };

  function disableScroll() {
    if (browser) window.onscroll = () => window.scrollTo(0, 0);
  }

  function enableScroll() {
    if (browser) {
      setTimeout(() => (window.onscroll = () => {}));
    }
  }

  $effect(function lockScrollDuringTransition() {
    if (!isReady || isTransitioning) {
      disableScroll();
    } else {
      enableScroll();
    }
  });

  onMount(() => {
    window.addEventListener("scroll", handleScroll);

    // Hold the splash until above-the-fold imagery has settled instead of a
    // blind timer: min 600ms so the brand moment doesn't flash, max 2400ms
    // (the old timer) so a stalled resource can't wedge the splash open.
    whenPageReady({ minMs: reducedMotion ? 0 : 600, maxMs: 2400 }).then(() => {
      isReady = true;
    });

    return () => window.removeEventListener("scroll", handleScroll);
  });

  onNavigate(() => {
    isTransitioning = true;

    setTimeout(() => {
      isTransitioning = false;
    }, 1050);
  });
</script>

<svelte:head>
  <title>{pageTitle}</title>
  <meta name="description" content={metaDescription} />
  <meta property="og:title" content={$page.data.meta_title || pageTitle} />
  <meta property="og:description" content={metaDescription} />
  <meta property="og:image" content={$page.data.meta_image ?? `${$page.url.origin}/msot-og.jpg`} />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:description" content={metaDescription} />
</svelte:head>

<svelte:window bind:innerWidth={viewportWidth} />

{#if isTransitioning || !isReady}
  <div
    class="bg-[#140F09] z-40 fixed w-screen h-screen top-0 left-0 pointer-events-none"
    out:fade={{ duration: reducedMotion ? 0 : 700, delay: reducedMotion ? 0 : 700 }}
  ></div>
  <div
    transition:fade={{ duration: reducedMotion ? 0 : 400 }}
    class="fixed w-2/5 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-40"
  >
    <img
      src={msotLogoSand}
      class="w-full h-full {reducedMotion ? '' : 'pulse-always'}"
      alt="msot logo"
    />
  </div>
{:else}
  <div
    transition:fade={{ duration: 700, delay: 700 }}
    class="fixed z-40 top-4 left-0 w-40 transition-transform transform-gpu duration-700"
    style={viewportWidth < 1550
      ? "transform:translate(4vw)"
      : "transform:translate(calc( (100vw - 1440px) / 2 ))"}
  >
    <a
      href="/"
      class="h-40 w-fit inline-block relative transition duration-300 ease-in {!showNav &&
      !isTransitioning
        ? '-translate-y-[112px]'
        : ''}"
    >
      <img
        src={($page.data.title === "MSOT | Resources" || $page.data.title === "MSOT | Contact") &&
        !isTransitioning
          ? msotLogoKhaki
          : msotLogo}
        alt="msot logo"
      />
    </a>
  </div>
{/if}

{#if isOverlayVisible}
  <div class="w-screen h-screen fixed bg-dark z-30" transition:fly={{ y: "-100%" }}>
    <ContentWidth class="flex flex-col items-center justify-center gap-12 h-full">
      {#each NAV_LINKS as item (item.href)}
        <a onclick={() => (isOverlayVisible = false)} href={item.href} class="text-light text-2xl"
          >{item.label}</a
        >
      {/each}

      <button
        class="absolute top-5 right-5 opacity-60 hover:opacity-100 transition-all z-40"
        onclick={() => (isOverlayVisible = false)}
        aria-label="Close menu"
      >
        <div in:fade={{ delay: 1200 }} out:fade class="text-white">
          <X size={48} strokeWidth={1} />
        </div>
      </button>
    </ContentWidth>
  </div>
{/if}

<main bind:this={main}>
  <nav
    class="nav-text fixed top-0 w-full h-28 py-4 z-20 transition duration-300 ease-in {showNav
      ? ''
      : '-translate-y-full'}"
  >
    <ContentWidth class="h-full flex flex-row justify-between items-center">
      <div></div>
      {#if viewportWidth > 768}
        <div class="flex flex-row items-center justify-between gap-12 transition-transform">
          {#each NAV_LINKS as item (item.href)}
            <a href={item.href}>{item.label}</a>
          {/each}
        </div>
      {:else}
        <button onclick={() => (isOverlayVisible = true)} aria-label="Open menu">
          <Menu class="text-[#998B6A] md:hidden" size={48} strokeWidth={1.5} />
        </button>
      {/if}
    </ContentWidth>
  </nav>

  {@render children?.()}
</main>
{#if data.isPreviewSession}
  <PrismicPreview {repositoryName} />
{/if}
