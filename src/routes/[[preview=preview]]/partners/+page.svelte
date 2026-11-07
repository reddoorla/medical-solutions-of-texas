<script lang="ts">
  import ScreenWidthImage from "$lib/components/ScreenWidth/ScreenWidthImage.svelte";
  import ContentWidth from "$lib/components/ContentWidth/ContentWidth.svelte";

  import hero from "$lib/assets/images/partners/partnersHero.jpg?as=run";
  import Footer from "$lib/components/Footer.svelte";

  // The copy and the logos: the partners_page document over today's, field by
  // field ($lib/copy/partners).
  let { data } = $props();
  const copy = $derived(data.copy);
</script>

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
      class="w-full p-6 sm:p-12 lg:px-40 lg:py-48 border-mid border-b-[6px] border-x-[6px] relative flex flex-col items-center justify-center gap-10 mb-12"
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
        {copy.testimonial_heading}
      </h4>
      <img
        src={copy.testimonial_logo}
        alt={copy.testimonial_name}
        class="w-64 brightness-0 invert"
      />

      <div class="text-white text-center leading-normal md:text-[24px] max-w-[900px]">
        {copy.testimonial_text}
      </div>
    </div>
  </div>

  <div class="w-full flex justify-center items-center mb-40">
    <div
      class="w-full p-6 sm:p-12 lg:px-40 relative flex flex-col items-center justify-center gap-8 mb-12"
    >
      <p class="text-white text-center">{copy.partnerships_heading}</p>

      <div class="text-white text-center leading-normal md:text-[24px] max-w-screen-lg">
        {copy.partnerships_text}
      </div>
    </div>
  </div>
</ContentWidth>

<section class="bg-white py-20">
  <ContentWidth>
    <h4 class="text-dark mb-12">{copy.clients_heading}</h4>
    <div class="h-0.5 bg-dark w-full"></div>
    <div class="w-full mt-12 flex flex-row flex-wrap gap-x-12 gap-y-24 justify-evenly items-center">
      {#each copy.clients as client, i (i)}
        <img
          src={client.logo}
          alt={client.name}
          class="w-1/3 lg:w-1/4 xl:w-1/5 max-w-52 max-h-24 object-scale-down"
        />
      {/each}
    </div>
  </ContentWidth>
</section>

<Footer />
