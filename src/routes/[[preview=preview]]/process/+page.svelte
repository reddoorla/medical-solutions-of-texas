<script lang="ts">
  import VimeoGate from "$lib/components/VimeoGate.svelte";
  import ScreenWidthImage from "$lib/components/ScreenWidth/ScreenWidthImage.svelte";
  import ContentWidth from "$lib/components/ContentWidth/ContentWidth.svelte";
  import Accordian from "$lib/components/FullWidth/Accordian.svelte";

  import { onMount } from "svelte";

  import Img from "@zerodevx/svelte-img";
  import hero from "$lib/assets/images/process/processHero.jpg?as=run";
  import surgeonVideoPlaceholder from "$lib/assets/images/home/surgeonsPlaceholder.jpg?as=run";
  import Footer from "$lib/components/Footer.svelte";

  let viewportHeight: number = $state(typeof window !== "undefined" ? window.innerHeight : 1080);

  let threeStepTrigger: HTMLElement | undefined = $state();
  let isthreeStepActive = $state(false);

  const handleScroll = () => {
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
  };

  onMount(() => {
    window.addEventListener("scroll", handleScroll);
  });

  let { data } = $props();
  // The timeline is Marketing's approved steps (§14b); see $lib/copy/process.
  const copy = $derived(data.copy);
</script>

<svelte:window bind:innerHeight={viewportHeight} />

<ScreenWidthImage class="fixed -z-10" src={hero} darken backdrop />
<div
  class="w-screen h-[20vh] fixed left-0 top-0 -z-10 bg-gradient-to-b from-[#140F09] via-[#140F09] to-transparent opacity-55"
></div>
<div class="w-screen h-screen fixed left-0 top-0 -z-10 bg-[#140F09] opacity-45"></div>

<div class="w-full h-screen">
  <ContentWidth class="h-full flex flex-row justify-between items-center py-32 relative">
    <!-- One heading for the page, spread across the band as two words were. -->
    <h1 class="text-mid mb-12 opacity-60 w-full flex flex-row justify-between">
      <span>{copy.heading_left}</span> <span>{copy.heading_right}</span>
    </h1>
  </ContentWidth>
</div>

<ContentWidth>
  <div class="w-full flex justify-center items-center mt-52 mb-40">
    <div
      class="w-full p-8 lg:py-48 border-mid border-b-[6px] border-x-[6px] relative flex flex-col items-center justify-center gap-8 mb-12"
    >
      <div
        class="absolute top-0 left-0 w-6 sm:w-1/6 md:w-1/4 lg:w-1/3 h-0 border-mid border-t-[6px]"
      ></div>
      <div
        class="absolute top-0 right-0 w-6 sm:w-1/6 md:w-1/4 lg:w-1/3 h-0 border-mid border-t-[6px]"
      ></div>
      <h4
        class="text-mid absolute top-0 left-1/2 text-nowrap"
        style="transform:translate(-50%, calc(-50% + 3px))"
      >
        {copy.simplifying_heading}
      </h4>
      <p class="text-white text-center mt-12">{copy.complex_line}</p>

      <div class="text-white text-center leading-normal md:text-[24px] max-w-screen-lg">
        {copy.complex_text}
      </div>
    </div>
  </div>
  <div class="w-full flex justify-center items-center mb-40">
    <div
      class="w-full p-6 sm:p-12 lg:px-40 relative flex flex-col items-center justify-center gap-8 mb-12"
    >
      <p class="text-white text-center">{copy.simplify_line}</p>

      <div class="text-white text-center leading-normal md:text-[24px] max-w-screen-lg">
        {copy.simplify_text}
      </div>
    </div>
  </div>
</ContentWidth>

<section class="w-full py-20 bg-mid">
  <ContentWidth class="items-start">
    <div class="w-full aspect-[5/2] bg-light relative overflow-hidden">
      <Img
        src={surgeonVideoPlaceholder}
        alt=""
        class="w-full h-full absolute top-0 left-0 object-cover"
      />
      <VimeoGate>
        <iframe
          title={copy.video_title}
          src="https://player.vimeo.com/video/1025187591?background=1&dnt=1"
          class="absolute w-full aspect-video top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 contrast-[1.15]"
          frameborder="0"
        ></iframe>
      </VimeoGate>
      <div class="w-full h-full absolute top-0 left-0 bg-darken-gradient"></div>
      <div class="w-full h-full absolute top-0 left-0 bg-mid mix-blend-multiply"></div>
      <h2 class="text-mid absolute -bottom-2 md:-bottom-[14px] left-0 leading-none">
        {copy.video_heading}
      </h2>
    </div>
    <div
      bind:this={threeStepTrigger}
      class="w-full my-24 flex flex-col md:flex-row justify-between gap-8"
    >
      <div
        class="w-full relative transition-opacity duration-1000 ease-out {isthreeStepActive
          ? 'bg-opacity-100'
          : 'opacity-0'}"
      >
        <div class="absolute top-0 left-0 h-[2px] bg-dark w-full"></div>
        <h5 class="text-dark mt-4">
          <span class="text-[#998B6A]">01</span>
          {copy.step_1_title}
        </h5>
        <div class="text-dark mt-8 text-[24px] leading-normal">
          {copy.step_1_text}
        </div>
      </div>
      <div
        class="w-full relative transition-opacity duration-1000 ease-out {isthreeStepActive
          ? 'bg-opacity-100 delay-[800ms]'
          : 'opacity-0'}"
      >
        <div class="absolute top-0 left-0 h-[2px] bg-dark w-full"></div>
        <h5 class="text-dark mt-4">
          <span class="text-[#998B6A]">02</span>
          {copy.step_2_title}
        </h5>
        <div class="text-dark mt-8 text-[24px] leading-normal">
          {copy.step_2_text}
        </div>
      </div>
      <div
        class="w-full relative transition-opacity duration-1000 ease-out {isthreeStepActive
          ? 'bg-opacity-100 delay-[1800ms]'
          : 'opacity-0'}"
      >
        <div class="absolute top-0 left-0 h-[2px] bg-dark w-full"></div>
        <h5 class="text-dark mt-4">
          <span class="text-[#998B6A]">03</span>
          {copy.step_3_title}
        </h5>
        <div class="text-dark mt-8 text-[24px] leading-normal">
          {copy.step_3_text}
        </div>
      </div>
    </div>
  </ContentWidth>
</section>

<section class="bg-light pt-32">
  <ContentWidth>
    <h3 class="text-dark mb-10">{copy.timeline_heading}</h3>
    <!-- The step cards reuse the "01 Refine" pattern above; Erik decides
         whether the timeline gets its own design. -->
    <ol class="w-full grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-8" data-testid="timeline">
      {#each copy.timeline as step, i (i)}
        <li class="w-full relative">
          <div class="absolute top-0 left-0 h-[2px] bg-dark w-full"></div>
          <!-- Two lines held at lg, so a timing that wraps (step 02, 1024–1200px)
               doesn't push its title below the others. -->
          <p class="label text-[#998B6A] mt-4 lg:min-h-[2lh]">{step.timing}</p>
          <h4 class="h5 text-dark mt-2">
            <span class="text-[#998B6A]">{String(i + 1).padStart(2, "0")}</span>
            {step.title}
          </h4>
          <p class="text-dark mt-4 text-[18px] leading-normal">{step.text}</p>
        </li>
      {/each}
    </ol>
  </ContentWidth>
</section>

<section class="bg-light pt-32 pb-48">
  <ContentWidth>
    <h3 class="text-dark mb-10">{copy.faq_heading}</h3>
    <Accordian accordianProps={copy.faq.map((r) => ({ label: r.question, content: r.answer }))} />
  </ContentWidth>
</section>

<Footer />
