<script lang="ts">
  import FooterIdentity from "$lib/components/FooterIdentity.svelte";
  import HomeJsonLd from "$lib/components/HomeJsonLd.svelte";
  import VimeoGate from "$lib/components/VimeoGate.svelte";
  import Lines from "$lib/components/Lines.svelte";
  import HomeTimeline from "$lib/components/HomeTimeline.svelte";
  import { TIMELINES } from "$lib/home-timelines";
  import type { PageData } from "./$types";
  import { page } from "$app/state";
  //icons
  import usFlag from "$lib/assets/icons/logos/usFlag.svg";
  import txFlag from "$lib/assets/icons/logos/txFlag.svg";
  import vosbLogo from "$lib/assets/icons/logos/vosb_white.svg";
  import msotLogo from "$lib/assets/icons/logos/msot_logo.svg";

  //images
  import soldiersVideoPlaceholder from "$lib/assets/images/home/bgVideoPlaceholder.jpg?as=run";
  import surgeonsVideoPlaceholder from "$lib/assets/images/home/surgeonsPlaceholder.jpg?as=run";
  import ctaImage from "$lib/assets/images/home/doctor.jpg?as=run";
  import ctaImageMobile from "$lib/assets/images/home/doctor_mobile.jpg?as=run";

  //components
  import Img from "@zerodevx/svelte-img";
  import ScreenWidthImage from "$lib/components/ScreenWidth/ScreenWidthImage.svelte";
  import ContentWidth from "$lib/components/ContentWidth/ContentWidth.svelte";

  //modules
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";
  import BracketButton from "$lib/components/Buttons/BracketButton.svelte";
  import { whenPageReady, prefersReducedMotion } from "@reddoorla/maintenance/client";

  // The copy is the home_page document over today's wording ($lib/copy/home);
  // `quote` ("Our Partner") is Partners' ($lib/copy/partners-load).
  let { data }: { data: PageData } = $props();
  const copy = $derived(data.copy);
  const quote = $derived(data.quote);
  const timelineLabels = $derived([
    copy.timeline_label_1,
    copy.timeline_label_2,
    copy.timeline_label_3,
    copy.timeline_label_4,
    copy.timeline_label_5,
    copy.timeline_label_6,
  ]);

  // Marketing's PDF-download conversion is a Custom Event trigger on this push,
  // not a GTM link-click trigger: Tag Manager loads on the first interaction, so
  // a first click on the PDF would beat its click listener (#144). GTM reads the
  // queued push when it loads. A middle-click counts too (it fires auxclick, not
  // click); "Open in new tab" from the context menu fires neither, so it can't
  // be counted. No personal data.
  function pushCapabilitiesDownload() {
    const w = window as unknown as { dataLayer?: unknown[] };
    w.dataLayer = w.dataLayer || [];
    w.dataLayer.push({ event: "msot_capabilities_download" });
  }

  let viewportWidth: number = $state(typeof window !== "undefined" ? window.innerWidth : 1920);
  let viewportHeight: number = $state(typeof window !== "undefined" ? window.innerHeight : 1080);

  let showSubtitle = $state(false);

  let weGetIndex = $state(0);

  let weGetTrigger: HTMLElement | undefined = $state();

  const weGetTone = (i: number) =>
    weGetIndex === i ? "" : Math.abs(weGetIndex - i) === 1 ? "opacity-75" : "opacity-0";

  let weGetRunning = false;

  const runWeGetAnimation = () => {
    if (weGetIndex != 2 && !weGetRunning) {
      weGetRunning = true;
      setTimeout(() => (weGetIndex = 1), 1600);
      setTimeout(() => (weGetIndex = 2), 3200);
      setTimeout(() => (weGetRunning = false), 4800);
    }
  };

  const runReverseWeGetAnimation = () => {
    if (weGetIndex != 0 && !weGetRunning) {
      weGetRunning = true;
      setTimeout(() => (weGetIndex = 1), 1600);
      setTimeout(() => (weGetIndex = 0), 3200);
      setTimeout(() => (weGetRunning = false), 4800);
    }
  };

  let painTrigger: HTMLElement | undefined = $state();
  let isPainActive = $state(false);

  let threeStepTrigger: HTMLElement | undefined = $state();
  let isthreeStepActive = $state(false);

  let ctaTrigger: HTMLElement | undefined = $state();
  let isCtaActive = $state(false);

  let surgeonsContainer: HTMLElement | undefined = $state();
  let surgeonsInView = $state(false);

  const handleScroll = () => {
    if (weGetTrigger) {
      const weGetRect = weGetTrigger.getBoundingClientRect();
      const weGetBottom = weGetRect.bottom;
      const weGetHeight = weGetRect.height;

      if (weGetBottom < viewportHeight + weGetHeight / 3) {
        runWeGetAnimation();
      } else {
        runReverseWeGetAnimation();
      }
    }

    if (painTrigger) {
      const painRect = painTrigger.getBoundingClientRect();

      if (
        (painRect.bottom < viewportHeight && viewportWidth > 1024) ||
        (painRect.top < viewportHeight && viewportWidth <= 1024)
      ) {
        isPainActive = true;
      } else {
        isPainActive = false;
      }
    }

    if (threeStepTrigger) {
      const threeStepRect = threeStepTrigger.getBoundingClientRect();
      const threeStepBottom = threeStepRect.bottom;
      const threeStepHeight = threeStepRect.height;

      if (threeStepBottom < viewportHeight + threeStepHeight / 2) {
        isthreeStepActive = true;
      } else {
        isthreeStepActive = false;
      }
    }

    if (ctaTrigger) {
      const ctaBottom = ctaTrigger.getBoundingClientRect().bottom;

      if (ctaBottom < viewportHeight) {
        isCtaActive = true;
      } else {
        isCtaActive = false;
      }
    }
  };

  onMount(() => {
    window.addEventListener("scroll", handleScroll);

    // Stagger the hero subtitle in behind the splash reveal (which is
    // load-aware in +layout.svelte) instead of a blind 5.4s timer.
    const reducedMotion = prefersReducedMotion();
    whenPageReady({ minMs: 0, maxMs: 2400 }).then(() => {
      setTimeout(
        () => {
          showSubtitle = true;
        },
        reducedMotion ? 0 : 1200,
      );
    });

    // Defer the surgeons Vimeo iframe (~4MB of video segments) until the
    // section approaches the viewport; the placeholder image covers it until then.
    const surgeonsObserver = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          surgeonsInView = true;
          surgeonsObserver.disconnect();
        }
      },
      { rootMargin: "600px" },
    );
    if (surgeonsContainer) surgeonsObserver.observe(surgeonsContainer);

    return () => {
      surgeonsObserver.disconnect();
    };
  });
</script>

<svelte:window bind:innerWidth={viewportWidth} bind:innerHeight={viewportHeight} />

<!-- Organization + WebSite JSON-LD, Home only (§13a), built from $lib/identity. -->
<HomeJsonLd />

<ScreenWidthImage
  class="fixed -z-10"
  src={soldiersVideoPlaceholder}
  vimeoId="1019997263"
  darken
  backdrop
/>

<!-- The hero is server-rendered: both versions are in the HTML, swapped by CSS
     at the site's 769px breakpoint, and fade in with CSS. Until 11-05 the desktop
     line was vector lettering and both rendered only after mount. -->
<div class="w-full h-screen">
  <div class="hero-in w-full h-full flex flex-col justify-end py-20 relative px-[4%]">
    <div class="hero-fit">
      <div class="hero-box">
        <p class="hero-line"><Lines lines={copy.hero_line} /></p>
        <p
          class="hero-subtitle transition-opacity duration-700 {showSubtitle
            ? 'opacity-100'
            : 'opacity-0'}"
        >
          {copy.hero_subtitle}
        </p>
      </div>
    </div>
    <ContentWidth class="hero-phone h-full flex flex-col justify-end py-32 relative">
      <div class="h-24"></div>
      <!-- Decoration with the h1 look, not the page's heading: Home's <h1> is
           "Your Trusted Partner" below (decision 2026-11-05-1527). -->
      <p class="h1 text-mid mb-12 opacity-60"><Lines lines={copy.hero_line_phone} /></p>
      <div
        class="text-white transition-opacity duration-1000 ease-out {showSubtitle
          ? 'opacity-100'
          : 'opacity-0'}"
      >
        {copy.hero_subtitle}
      </div>
    </ContentWidth>
  </div>
</div>
<ContentWidth>
  <div class="w-full flex justify-center items-center mt-52 mb-40">
    <div
      class="w-full p-6 sm:p-12 lg:px-40 border-mid border-b-[6px] border-x-[6px] relative flex flex-col items-center justify-center gap-10 mb-12"
    >
      <div
        class="absolute top-0 left-0 w-6 sm:w-1/6 md:w-1/4 lg:w-1/3 h-0 border-mid border-t-[6px]"
      ></div>
      <div
        class="absolute top-0 right-0 w-6 sm:w-1/6 md:w-1/4 lg:w-1/3 h-0 border-mid border-t-[6px]"
      ></div>
      <h1
        class="h4 text-mid absolute top-0 left-1/2 text-nowrap"
        style="transform:translate(-50%, calc(-50% + 3px))"
      >
        {copy.trusted_heading}
      </h1>

      <div class="flex flex-row items-center justify-center gap-5">
        <img src={usFlag} alt="" width="57" height="37" class="opacity-50" />
        <img src={vosbLogo} alt={copy.vosb_logo_alt} class="opacity-90 h-40" />
        <img src={txFlag} alt="" width="53" height="35" class="opacity-50" />
      </div>
      <p class="text-white text-center leading-normal md:text-[24px]" data-testid="definition">
        {page.data.identity.definition}
      </p>
      <div class="text-white text-center leading-normal md:text-[24px]">
        {copy.trusted_text}
      </div>
      <div class="flex flex-col md:flex-row justify-center items-center gap-8">
        <BracketButton href="/contact" class="text-mid button-text"
          >{copy.contact_button}</BracketButton
        >
        <!-- A new tab keeps Home open, so a Tag Manager that this click only
             starts loading can still read the queued download event. -->
        <BracketButton
          href="/pdfs/MSOT_Capabilities.pdf"
          target="_blank"
          rel="noopener"
          click={pushCapabilitiesDownload}
          auxclick={(e) => e.button === 1 && pushCapabilitiesDownload()}
          ariaLabel={`${copy.capabilities_button} (PDF, opens in a new tab)`}
          class="text-mid button-text">{copy.capabilities_button}</BracketButton
        >
      </div>
    </div>
  </div>
</ContentWidth>

<section class="w-full py-20 bg-mid">
  <ContentWidth class="items-start">
    <div bind:this={surgeonsContainer} class="w-full aspect-[5/2] bg-dark relative overflow-hidden">
      <Img
        src={surgeonsVideoPlaceholder}
        alt=""
        class="w-full h-full absolute top-0 left-0 object-cover"
      />
      {#if surgeonsInView}
        <VimeoGate>
          <iframe
            title={copy.video_title}
            src="https://player.vimeo.com/video/1019997302?background=1&dnt=1"
            class="absolute w-full aspect-video top-0 left-0 contrast-[1.15]"
            frameborder="0"
          ></iframe>
        </VimeoGate>
      {/if}
      <div class="w-full h-full absolute top-0 left-0 bg-darken-gradient"></div>
      <div class="w-full h-full absolute top-0 left-0 bg-mid mix-blend-multiply"></div>
      <div
        class="w-full h-full absolute top-0 left-0 bg-gradient-to-t from-black/50 via-black/25 to-transparent"
      ></div>
      <h2 class="text-mid absolute -bottom-2 md:-bottom-[14px] left-0 leading-none">
        {copy.we_get_heading}
      </h2>
    </div>
    <div class="-mt-6 overflow-hidden">
      <div class="mt-6 overflow-hidden" bind:this={weGetTrigger}>
        <div
          class="transition-transform transform-gpu duration-1000 ease-out -mb-[15%] lg:-mb-[8%]"
          style={`transform:translateY(calc(-1/3 * 100% * ${weGetIndex}))`}
        >
          {#if viewportWidth > 1024}
            <h2 class="text-dark text-left transition duration-1000 ease-out mt-4 {weGetTone(0)}">
              <Lines lines={copy.we_get_1} joined />
            </h2>
            <h2 class="text-dark text-left transition duration-1000 ease-out mt-4 {weGetTone(1)}">
              <Lines lines={copy.we_get_2} joined />
            </h2>
            <h2 class="text-dark text-left transition duration-1000 ease-out mt-4 {weGetTone(2)}">
              <Lines lines={copy.we_get_3} joined />
            </h2>
          {:else}
            <h2 class="text-dark text-left transition duration-1000 ease-out mt-4 {weGetTone(0)}">
              <Lines lines={copy.we_get_1} />
            </h2>
            <h2 class="text-dark text-left transition duration-1000 ease-out mt-4 {weGetTone(1)}">
              <Lines lines={copy.we_get_2} />
            </h2>
            <h2 class="text-dark text-left transition duration-1000 ease-out mt-4 {weGetTone(2)}">
              <Lines lines={copy.we_get_3} />
            </h2>
          {/if}
        </div>
        <div class="bg-mid relative pt-4 w-full">
          <h3 class="h5 text-dark mt-20 lg:mt-24 mb-5">{copy.clinician_heading}</h3>
          <div class="text-dark w-full max-w-80">
            {copy.clinician_text}
          </div>
        </div>
      </div>
    </div></ContentWidth
  >
</section>
<section class="bg-light w-screen relative">
  <HomeTimeline
    n={1}
    layout={TIMELINES[0]}
    heading={copy.timeline_1_heading}
    body={copy.timeline_1_text}
    labels={timelineLabels}
  />
</section>
<section class="bg-mid py-20" bind:this={painTrigger}>
  <ContentWidth class="flex flex-col mb-10 md:mb-20 md:flex-row relative">
    <h3 class="text-dark">{copy.know_heading}</h3>
  </ContentWidth>
  <ContentWidth class="flex flex-col md:flex-row relative">
    <div
      class="absolute top-0 left-0 h-[2px] bg-gradient-to-r transition-all from-dark to-transparent w-full"
    ></div>

    {#if isPainActive}
      <div
        class="absolute top-0 left-0 h-[2px] bg-gradient-to-r transition-all from-transparent to-dark w-full"
        transition:fade={{ duration: 3000 }}
      ></div>
    {/if}
    <div
      class="md:w-1/2 mt-6 transition-opacity duration-1000 ease-out {isPainActive
        ? ''
        : 'opacity-0'}"
    >
      <div
        class="duration-1000 ease-out {isPainActive
          ? 'opacity-25 delay-[1400ms]'
          : ''} support-text"
      >
        <h4 class="text-dark duration-1000 ease-out {isPainActive ? 'opacity-100' : ''}">
          {copy.problem_heading}
        </h4>
        <h3
          class="text-dark duration-1000 ease-out md:mt-6 {isPainActive
            ? 'opacity-100 delay-[350ms]'
            : 'opacity-0'}"
        >
          {copy.problem_1}
        </h3>
        <h3
          class="text-dark duration-1000 ease-out {isPainActive
            ? 'opacity-100 delay-[700ms]'
            : 'opacity-0'}"
        >
          {copy.problem_2}
        </h3>
        <h3
          class="text-dark duration-1000 ease-out {isPainActive
            ? 'opacity-100 delay-[1050ms]'
            : 'opacity-0'}"
        >
          {copy.problem_3}
        </h3>
      </div>
    </div>
    <div class="md:w-1/2 mt-6 support-text">
      <h4
        class="text-dark duration-1000 ease-out {isPainActive
          ? 'opacity-100 delay-[1750ms]'
          : 'opacity-0'}"
      >
        {copy.answer_heading}
      </h4>
      <h3
        class="text-dark duration-1000 ease-out md:mt-6 {isPainActive
          ? 'opacity-100 delay-[2100ms]'
          : 'opacity-0'}"
      >
        {copy.answer_1}
      </h3>
      <h3
        class="text-dark duration-1000 ease-out {isPainActive
          ? 'opacity-100 delay-[2450ms] '
          : 'opacity-0'}"
      >
        {copy.answer_2}
      </h3>
      <h3
        class="text-dark duration-1000 ease-out {isPainActive
          ? 'opacity-100  delay-[2800ms]  '
          : 'opacity-0'}"
      >
        {copy.answer_3}
      </h3>
    </div>
  </ContentWidth>
</section>
<section class="bg-mid py-32">
  <ContentWidth class="flex flex-col items-center justify-center gap-10">
    <h4 class="text-dark">{copy.help_heading}</h4>
    <p class="text-dark text-center max-w-screen-sm">
      {copy.help_text}
    </p>
  </ContentWidth>
</section>

<section class="bg-light w-screen relative">
  <HomeTimeline
    n={2}
    layout={TIMELINES[1]}
    eyebrow={copy.timeline_2_eyebrow}
    labelsHidden
    heading={copy.timeline_2_heading}
    body={copy.timeline_2_text}
    labels={timelineLabels}
  />
</section>
<section class="bg-mid py-32">
  <ContentWidth>
    <div class="w-full flex justify-center items-center">
      <div
        class="w-full py-32 sm:py-32 lg:px-40 border-[#998B6A] border-b-[6px] border-x-[6px] relative flex flex-col items-center justify-center gap-10 mb-12"
      >
        <div
          class="absolute top-0 left-0 w-6 sm:w-1/6 md:w-1/4 lg:w-1/3 h-0 border-[#998B6A] border-t-[6px]"
        ></div>
        <div
          class="absolute top-0 right-0 w-6 sm:w-1/6 md:w-1/4 lg:w-1/3 h-0 border-[#998B6A] border-t-[6px]"
        ></div>
        <h4
          class="text-dark absolute top-0 left-1/2 text-nowrap"
          style="transform:translate(-50%, calc(-50% + 3px))"
        >
          {copy.partner_heading}
        </h4>

        <p class="text-dark text-center mx-5 text-[24px]">
          “{quote.testimonial_text}”
        </p>
        <img
          src={quote.testimonial_logo}
          alt={quote.testimonial_name}
          class="h-32 max-w-[min(350px,100%)] object-contain"
        />
      </div>
    </div>
  </ContentWidth>
</section>
<section class="bg-mid py-20" bind:this={threeStepTrigger}>
  <ContentWidth>
    <h2 class="text-dark text-left w-full">{copy.start_heading_1}</h2>
    <h2 class="text-dark text-left w-full">{copy.start_heading_2}</h2>
    <div class="w-full my-24 flex flex-col md:flex-row justify-between gap-8">
      <div
        class="w-full relative transition-opacity duration-1000 ease-out {isthreeStepActive
          ? 'bg-opacity-100'
          : 'opacity-0'}"
      >
        <div class="absolute top-0 left-0 h-[2px] bg-dark w-full"></div>
        <p class="h4 text-dark mt-4">01</p>
        <h3 class="text-dark mt-8"><Lines lines={copy.step_1} /></h3>
      </div>
      <div
        class="w-full relative transition-opacity duration-1000 ease-out {isthreeStepActive
          ? 'bg-opacity-100 delay-[800ms]'
          : 'opacity-0'}"
      >
        <div class="absolute top-0 left-0 h-[2px] bg-dark w-full"></div>
        <p class="h4 text-dark mt-4">02</p>
        <h3 class="text-dark mt-8"><Lines lines={copy.step_2} /></h3>
      </div>
      <div
        class="w-full relative transition-opacity duration-1000 ease-out {isthreeStepActive
          ? 'bg-opacity-100 delay-[1800ms]'
          : 'opacity-0'}"
      >
        <div class="absolute top-0 left-0 h-[2px] bg-dark w-full"></div>
        <p class="h4 text-dark mt-4">03</p>
        <h3 class="text-dark mt-8"><Lines lines={copy.step_3} /></h3>
      </div>
    </div>
    <BracketButton class="text-dark mb-12" href="/process">{copy.start_button}</BracketButton>
  </ContentWidth>
</section>
<section class="bg-light w-screen relative">
  <HomeTimeline
    n={3}
    layout={TIMELINES[2]}
    eyebrow={copy.timeline_3_eyebrow}
    labelsHidden
    heading={copy.timeline_3_heading}
    body={copy.timeline_3_text}
    labels={timelineLabels}
  />
</section>
<ScreenWidthImage
  src={ctaImage}
  mobileSrc={ctaImageMobile}
  class="flex flex-col items-start justify-end py-32"
  darken
>
  <!-- Decoration: the buttons below carry the call to action, so this line is not a heading. -->
  <div class="h-44 overflow-hidden relative w-full" aria-hidden="true">
    <div class="h1 text-mid add-outline absolute bottom-0 left-0 opacity-40">{copy.cta_line}</div>
    <div
      class="h1 outlined absolute bottom-0 left-0 transition-opacity duration-1000 {isCtaActive
        ? 'opacity-100  delay-700'
        : 'opacity-0'}"
    >
      {copy.cta_line}
    </div>
    <div
      class="h1 text-mid add-outline absolute bottom-0 left-0 transition-opacity duration-1000 {isCtaActive
        ? 'opacity-100 delay-[1400ms]'
        : 'opacity-0'}"
    >
      {copy.cta_line}
    </div>
  </div>
  <div class="flex flex-row gap-6 ml-2" bind:this={ctaTrigger}>
    <BracketButton class="text-mid" href="/contact">{copy.cta_contact_button}</BracketButton>
    <BracketButton class="text-mid" href="/process">{copy.cta_process_button}</BracketButton>
  </div>
</ScreenWidthImage>

<footer class="py-6 bg-[#140F09]">
  <ContentWidth class="flex flex-row gap-6 justify-between items-start">
    <div class="flex flex-col gap-4 items-start min-w-0">
      <a href="/" class="bump self-start h-16 md:h-20 relative"
        ><img
          class="h-full transitionn duration-700 ease-fast-slow delay-500"
          src={msotLogo}
          style="transform-origin:top left"
          alt={page.data.chrome.footer_logo_alt}
        /></a
      >
      <FooterIdentity />
    </div>
    <img src={vosbLogo} alt={page.data.chrome.vosb_alt} class="h-16 md:h-24 self-start" />
  </ContentWidth>
</footer>

<style>
  .bg-darken-gradient {
    background: linear-gradient(0deg, #000 0%, #000 100%);
    background-blend-mode: saturation;
    opacity: 0.1;
  }

  /* The hero line at the Figma spec (the workspace's text-in-images handoff.md,
     "The hero"): a 1155×534 box fitted into the space the vector lettering had,
     Barlow Condensed 600 at 148 of its 1155 units, 120% leading, no tracking. */
  .hero-in {
    animation: hero-in 700ms ease-out both;
  }
  @keyframes hero-in {
    from {
      opacity: 0;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .hero-in {
      animation: none;
    }
  }
  .hero-fit {
    flex: 1;
    min-height: 0;
    width: 100%;
    container-type: size;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .hero-box {
    width: min(100cqw, 100cqh * 1155 / 534);
    aspect-ratio: 1155 / 534;
    position: relative;
    container-type: inline-size;
  }
  .hero-line,
  .hero-subtitle {
    position: absolute;
    margin: 0;
    letter-spacing: 0;
    font-style: normal;
    text-align: left;
  }
  .hero-line {
    left: 0;
    top: 0;
    width: calc(100cqw * 1153 / 1155);
    font-family: "barlow-condensed", "Arial Narrow", sans-serif;
    font-weight: 600;
    font-size: calc(100cqw * 148 / 1155);
    line-height: 1.2;
    text-transform: uppercase;
    color: #cbc3a4;
    opacity: 0.5;
  }
  .hero-subtitle {
    left: calc(100cqw * 887 / 1155);
    top: calc(100cqw * 221 / 1155);
    width: calc(100cqw * 274 / 1155);
    font-family: "rigid-square", "helvetica", sans-serif;
    font-weight: 400;
    font-size: calc(100cqw * 17 / 1155);
    line-height: 1.3;
    color: #fff;
  }
  /* The exact complement of the min-width query below (a 768.5px width falls
     on one side, never neither). */
  @media not all and (min-width: 769px) {
    .hero-fit {
      display: none;
    }
  }
  @media (min-width: 769px) {
    .hero-in :global(.hero-phone) {
      display: none !important;
    }
  }

  .support-text {
    container-type: inline-size;
  }

  .support-text h3 {
    font-feature-settings:
      "liga" off,
      "clig" off;
    font-family: "rigid-square";
    /* 50px wherever the column fits it. "UNDERSTANDING" is about 8.8em wide,
       so below a ~476px column (a phone, or a tablet's half-width column) the
       words scale with the column instead of running past it. */
    font-size: min(50px, 9.5vw); /* for a browser without container units */
    font-size: min(50px, 10.5cqi);
    font-style: normal;
    font-weight: 400;
    line-height: 1.2;
    text-transform: uppercase;
    /* The words fade in; without this, `duration-1000` also animates the
       font size whenever the screen is resized. */
    transition-property: opacity;
  }
</style>
