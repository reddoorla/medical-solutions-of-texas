<script lang="ts">
  import VimeoGate from "$lib/components/VimeoGate.svelte";
  import type { Snippet } from "svelte";
  import Img from "@zerodevx/svelte-img";
  import placeholder from "../../assets/images/background_placeholder.svg";
  import ContentWidth from "../ContentWidth/ContentWidth.svelte";

  /** What an imagetools `?as=run` import yields. */
  interface RunImage {
    sources: Record<string, string>;
    img: { src: string; w: number; h: number; lqip?: string };
  }

  interface Props {
    /** Plain URL string, or an imagetools `?as=run` meta object for responsive output. */
    src?: string | Record<string, unknown>;
    /**
     * An imagetools `?as=run` image shown below 1024px instead of `src` (which
     * must then be one too). A `<picture>` media query chooses, so the browser
     * picks before hydration and fetches only the one it shows.
     */
    mobileSrc?: Record<string, unknown>;
    /**
     * Where `mobileSrc` is framed below 1024px, as a CSS `object-position`.
     * There the image fills the section rather than the 16:9 cover box, so a
     * portrait screen shows a slice of a landscape crop and this picks which.
     */
    mobilePosition?: string;
    altText?: string;
    placeholderSide?: string;
    vimeoId?: string;
    darken?: boolean;
    backdrop?: boolean;
    class?: string;
    children?: Snippet;
  }

  let {
    src = placeholder,
    mobileSrc,
    mobilePosition = "50% 50%",
    altText = "background image",
    placeholderSide = "right",
    vimeoId = "",
    darken = false,
    backdrop = false,
    class: passedClasses = "",
    children,
  }: Props = $props();

  const defaultLayouts = "flex items-center justify-center";

  // 16:9 box sized to cover the viewport in pure CSS: at least 100vw wide, and
  // at least wide enough that its aspect-derived height reaches 100vh. The
  // previous JS viewport ternary (bound after hydration) rendered a wrong first
  // frame and shifted the hero once real dimensions arrived (CLS 0.119).
  // svelte-img's placeholder while the image loads, which its <Img> sets itself.
  // Below 1024px it takes the photo's own framing, so it does not jump on decode.
  const lqipBackground = (lqip: string) =>
    lqip[0] === "#"
      ? lqip
      : `url(data:image/webp;base64,${lqip}) no-repeat var(--lqip-position, center)/cover`;

  const coverBox = "w-[max(100vw,177.78vh)] aspect-video";
  // Below 1024px a mobile crop fills the section instead: in the cover box a
  // 390×844 phone showed the middle quarter of a 1500×844 box, a tight zoom on
  // the crop's centre rather than the framing it was cut for.
  const mobileBox = "max-lg:w-screen max-lg:h-screen max-lg:aspect-auto";
</script>

<section
  class="h-screen w-screen overflow-clip {backdrop ? 'fixed -z-10 top-0 left-0' : 'relative'}"
>
  <div
    class="left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 overflow-clip max-h-screen relative {mobileSrc
      ? `${coverBox} ${mobileBox}`
      : coverBox}"
  >
    {#if typeof src === "string"}
      <img
        {src}
        alt={altText}
        class="absolute bottom-0 {placeholderSide}-0 h-full w-full object-cover {src === placeholder
          ? 'lg:w-[45%] md:h-auto'
          : ''} -z-10"
      />
    {:else if mobileSrc}
      {@const desktop = src as unknown as RunImage}
      {@const mobile = mobileSrc as unknown as RunImage}
      <picture>
        {#each Object.entries(desktop.sources) as [format, srcset] (format)}
          <source
            media="(min-width: 1024px)"
            type="image/{format}"
            {srcset}
            width={desktop.img.w}
            height={desktop.img.h}
          />
        {/each}
        {#each Object.entries(mobile.sources) as [format, srcset] (format)}
          <source type="image/{format}" {srcset} />
        {/each}
        <img
          src={mobile.img.src}
          alt={altText}
          width={mobile.img.w}
          height={mobile.img.h}
          loading="eager"
          decoding="async"
          style:background={mobile.img.lqip && lqipBackground(mobile.img.lqip)}
          style:--mobile-position={mobilePosition}
          class="absolute bottom-0 {placeholderSide}-0 h-full w-full object-cover max-lg:object-(--mobile-position) max-lg:[--lqip-position:var(--mobile-position)] -z-10"
        />
      </picture>
    {:else}
      <Img
        {src}
        alt={altText}
        loading="eager"
        class="absolute bottom-0 {placeholderSide}-0 h-full w-full object-cover -z-10"
      />
    {/if}

    {#if vimeoId}
      <VimeoGate>
        <iframe
          title="background video"
          src={`https://player.vimeo.com/video/${vimeoId}?background=1&muted=1&loop=1&autoplay=1&dnt=1`}
          class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 {coverBox} contrast-[1.15] -z-10"
          frameborder="0"
          allowfullscreen
        ></iframe>
      </VimeoGate>
    {/if}

    {#if darken}
      <div
        class="bg-darken-gradient pointer-events-none absolute w-full h-full top-0 left-0 -z-10"
      ></div>
    {/if}
    <div class="w-screen h-screen absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
      <ContentWidth class="{passedClasses || defaultLayouts} h-full">
        {@render children?.()}
      </ContentWidth>
    </div>
  </div>
</section>

<style>
  .bg-darken-gradient {
    background: linear-gradient(180deg, rgba(203, 195, 164, 0.2) 33.5%, #656f5c15 100%);
    background-blend-mode: multiply;
  }
</style>
