<script lang="ts">
  import { onMount } from "svelte";
  import { ChevronLeft, ChevronRight } from "@lucide/svelte";
  import { createSwipeAction } from "$utils/swipeAction";
  import placeholder from "../../assets/images/background_placeholder.svg";
  import FourByThreeImage from "../FullWidth/FourByThreeImage.svelte";

  interface Props {
    imageArray?: string[];
    altText?: string;
    class?: string;
  }

  let {
    imageArray = [placeholder, placeholder, placeholder, placeholder],
    altText = "background image",
    class: passedClasses = "",
  }: Props = $props();

  const SLIDER_TRANSITION_LENGTH_IN_MS = 2000;
  const SLIDER_INTERVAL_IN_MS = 5000;

  let sliderIndex = $state(imageArray.length - 1);
  let isSlideAnimated = $state(true);
  let sliderInterval: ReturnType<typeof setInterval> | undefined;

  const resetSliderToStart = () => {
    setTimeout(() => (isSlideAnimated = false), SLIDER_TRANSITION_LENGTH_IN_MS);
    setTimeout(() => (sliderIndex = 0), SLIDER_TRANSITION_LENGTH_IN_MS + 20);
    setTimeout(() => (isSlideAnimated = true), SLIDER_TRANSITION_LENGTH_IN_MS + 40);
  };

  const resetSliderToEnd = () => {
    setTimeout(() => (isSlideAnimated = false), SLIDER_TRANSITION_LENGTH_IN_MS);
    setTimeout(() => (sliderIndex = imageArray.length - 1), SLIDER_TRANSITION_LENGTH_IN_MS + 20);
    setTimeout(() => (isSlideAnimated = true), SLIDER_TRANSITION_LENGTH_IN_MS + 40);
  };

  const slideRight = () => {
    sliderIndex++;
    clearInterval(sliderInterval);
    sliderInterval = setInterval(() => slideRight(), SLIDER_INTERVAL_IN_MS);
    if (sliderIndex == imageArray.length) resetSliderToStart();
  };

  const slideLeft = () => {
    sliderIndex--;
    clearInterval(sliderInterval);
    sliderInterval = setInterval(() => slideLeft(), SLIDER_INTERVAL_IN_MS);
    if (sliderIndex < 0) resetSliderToEnd();
  };

  const swipe = createSwipeAction((e) => {
    if (e.detail.direction === "left") slideRight();
    if (e.detail.direction === "right") slideLeft();
  });

  onMount(() => {
    sliderInterval = setInterval(() => slideLeft(), SLIDER_INTERVAL_IN_MS);
    return () => clearInterval(sliderInterval);
  });

  const tripledImages = $derived(imageArray.concat(imageArray).concat(imageArray));

  const baseClasses = "pb-32";
</script>

<section class="{baseClasses} {passedClasses}">
  <div use:swipe class="h-[320px] py-2 relative">
    <div
      class="h-full flex flex-row flex-nowrap {isSlideAnimated
        ? 'transition-transform duration-[2000ms]'
        : ''}"
      style="width:{352 *
        tripledImages.length}px; margin-left:calc(50vw - 176px); transform:translateX({-(
        sliderIndex + imageArray.length
      ) * 352}px);"
    >
      {#each tripledImages as image, i (i)}
        <div class="w-[360px] h-full mx-4">
          <FourByThreeImage alt={altText} src={image} class="h-full object-cover -z-10" />
        </div>
      {/each}
    </div>
    <div class="absolute flex justify-center w-full top-0 left-0">
      <button
        onclick={slideLeft}
        aria-label="Previous slide"
        class="absolute left-0 h-[320px] bg-gradient-to-r from-white via-[#ffffffe0] to-transparent w-12 md:w-24 flex align-middle justify-center items-center cursor-pointer transition-all duration-500 bump"
      >
        <ChevronLeft size={24} class="text-dark" />
      </button>
      <button
        onclick={slideRight}
        aria-label="Next slide"
        class="absolute right-0 h-[320px] w-12 md:w-24 flex bg-gradient-to-l from-white via-[#ffffffe0] to-transparent align-middle cursor-pointer transition-all duration-500 justify-center items-center bump"
      >
        <ChevronRight size={24} class="text-dark" />
      </button>
    </div>
  </div>
</section>
