<script lang="ts">
  import type { Snippet } from "svelte";
  import Img from "@zerodevx/svelte-img";
  import placeholder from "../../assets/images/background_placeholder.svg";
  import ContentWidth from "../ContentWidth/ContentWidth.svelte";

  interface Props {
    /** Plain URL string, or an imagetools `?as=run` meta object for responsive output. */
    src?: string | Record<string, unknown>;
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
  const coverBox = "w-[max(100vw,177.78vh)] aspect-video";
</script>

<section
  class="h-screen w-screen overflow-clip {backdrop ? 'fixed -z-10 top-0 left-0' : 'relative'}"
>
  <div
    class="left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 overflow-clip max-h-screen relative {coverBox}"
  >
    {#if typeof src === "string"}
      <img
        {src}
        alt={altText}
        class="absolute bottom-0 {placeholderSide}-0 h-full w-full object-cover {src === placeholder
          ? 'lg:w-[45%] md:h-auto'
          : ''} -z-10"
      />
    {:else}
      <Img
        {src}
        alt={altText}
        loading="eager"
        class="absolute bottom-0 {placeholderSide}-0 h-full w-full object-cover -z-10"
      />
    {/if}

    {#if vimeoId}
      <iframe
        title="background video"
        src={`https://player.vimeo.com/video/${vimeoId}?background=1&muted=1&loop=1&autoplay=1&dnt=1`}
        class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 {coverBox} contrast-[1.15] -z-10"
        frameborder="0"
        allowfullscreen
      ></iframe>
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
