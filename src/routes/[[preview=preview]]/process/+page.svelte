<script lang="ts">
  import ScreenWidthImage from "$lib/components/ScreenWidth/ScreenWidthImage.svelte";
  import ContentWidth from "$lib/components/ContentWidth/ContentWidth.svelte";
  import Accordian from "$lib/components/FullWidth/Accordian.svelte";

  import { onMount } from "svelte";

  import Img from "@zerodevx/svelte-img";
  import hero from "$lib/assets/images/process/processHero.jpg?as=run";
  import surgeonVideoPlaceholder from "$lib/assets/images/home/surgeonsPlaceholder.jpg?as=run";
  import timeline from "$lib/assets/images/process/timeline.svg";
  import timeline_mobile from "$lib/assets/images/process/timeline_mobile.svg";
  import Footer from "$lib/components/Footer.svelte";

  let viewportHeight: number = $state(typeof window !== "undefined" ? window.innerHeight : 1080);
  let viewportWidth: number = $state(typeof window !== "undefined" ? window.innerWidth : 1920);

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
</script>

<svelte:head><title>MSOT | Process</title></svelte:head>
<svelte:window bind:innerWidth={viewportWidth} bind:innerHeight={viewportHeight} />

<ScreenWidthImage class="fixed -z-10" src={hero} darken backdrop />
<div
  class="w-screen h-[20vh] fixed left-0 top-0 -z-10 bg-gradient-to-b from-[#140F09] via-[#140F09] to-transparent opacity-55"
></div>
<div class="w-screen h-screen fixed left-0 top-0 -z-10 bg-[#140F09] opacity-45"></div>

<div class="w-full h-screen">
  <ContentWidth class="h-full flex flex-row justify-between items-center py-32 relative">
    <h1 class="text-mid mb-12 opacity-60 w-fit">Our</h1>
    <h1 class="text-mid mb-12 opacity-60 w-fit">Process</h1>
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
        Simplifying Complexity
      </h4>
      <p class="text-white text-center mt-12">Government Contracting is Complex...</p>

      <div class="text-white text-center leading-normal md:text-[24px] max-w-screen-lg">
        …and often feels like continuously slamming your head into a wall. We know, we’ve been
        there. You find your access is expired. Late payments, inability to collect a PO, supply
        chain delays or mismanagement. You’re always “almost there” to get that next contract, but
        never quite get across the finish line. This isn’t the way things should be.
      </div>
    </div>
  </div>
  <div class="w-full flex justify-center items-center mb-40">
    <div
      class="w-full p-6 sm:p-12 lg:px-40 relative flex flex-col items-center justify-center gap-8 mb-12"
    >
      <p class="text-white text-center">Let’s Simplify It…</p>

      <div class="text-white text-center leading-normal md:text-[24px] max-w-screen-lg">
        ...and make things work. We’ve done this for years, with many, partners and many situations
        and will help get you where you need to be. With experience comes procedure, with procedure
        comes consistency, efficiency, and results.
      </div>
    </div>
  </div>
</ContentWidth>

<section class="w-full py-20 bg-mid">
  <ContentWidth class="items-start">
    <div class="w-full aspect-[5/2] bg-light relative overflow-hidden">
      <Img
        src={surgeonVideoPlaceholder}
        alt="surgeons placeholder"
        class="w-full h-full absolute top-0 left-0 object-cover"
      />
      <iframe
        title="background video"
        src="https://player.vimeo.com/video/1025187591?background=1&dnt=1"
        class="absolute w-full aspect-video top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 contrast-[1.15]"
        frameborder="0"
      ></iframe>
      <div class="w-full h-full absolute top-0 left-0 bg-darken-gradient"></div>
      <div class="w-full h-full absolute top-0 left-0 bg-mid mix-blend-multiply"></div>
      <h2 class="text-mid absolute -bottom-2 md:-bottom-[14px] left-0 leading-none">OUR PROCESS</h2>
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
          <span class="text-[#998B6A]">01</span> Refine
        </h5>
        <div class="text-dark mt-8 text-[24px] leading-normal">
          We’ll isolate the best contracts and options for your company
        </div>
      </div>
      <div
        class="w-full relative transition-opacity duration-1000 ease-out {isthreeStepActive
          ? 'bg-opacity-100 delay-[800ms]'
          : 'opacity-0'}"
      >
        <div class="absolute top-0 left-0 h-[2px] bg-dark w-full"></div>
        <h5 class="text-dark mt-4">
          <span class="text-[#998B6A]">02</span> Guide
        </h5>
        <div class="text-dark mt-8 text-[24px] leading-normal">
          We’ll guide you through the bureaucracy and paperwork, and get your application in
        </div>
      </div>
      <div
        class="w-full relative transition-opacity duration-1000 ease-out {isthreeStepActive
          ? 'bg-opacity-100 delay-[1800ms]'
          : 'opacity-0'}"
      >
        <div class="absolute top-0 left-0 h-[2px] bg-dark w-full"></div>
        <h5 class="text-dark mt-4">
          <span class="text-[#998B6A]">03</span> Connect
        </h5>
        <div class="text-dark mt-8 text-[24px] leading-normal">
          We’ll get you in the room with the right people to help you build further relationship
        </div>
      </div>
    </div>
  </ContentWidth>
</section>

<section class="bg-light w-screen md:aspect-[5/2] relative">
  <img src={viewportWidth > 768 ? timeline : timeline_mobile} alt="timelines" class="w-full" />
</section>

<section class="bg-light pt-32 pb-48">
  <ContentWidth>
    <h3 class="text-dark mb-10">Common Questions & Our Answers</h3>
    <Accordian
      accordianProps={[
        {
          label: "Why does VOSB status give priority for winning VA and DoD contracts?",
          content:
            "In the 2016 Kingdomware Techs., Inc. v. United States case, the Supreme Court unanimously affirmed the Rule of Two provision of a 2006 federal law. The Rule of Two mandates that VA contracts shall be set aside for veteran-owned small businesses if at least two such businesses exist that can perform the work at a reasonable price. This results in a wide swath of contracts set aside specifically for veteran-owned businesses, ones that VOSBs, like MSOT, have priority in winning.",
        },
        {
          label: "What does our typical timeline look like after winning a contract?",
          content:
            "The timeline for this process begins with a Medical Manufacturer getting approval on the ECAT. Typically in the span of 30 to 90 days. The next critical step is ensuring compliance and readiness for the rollout phase. Once approved, the rollout to military bases and VA facilities takes place within a concise period of seven days, making the product accessible where it is most needed. Following the initial product deployment, the process transitions into a phase med-surge equipment can be provided, ensuring smooth operations and ongoing support. Finally, the timeline extends into a phase of ongoing contract maintenance, which is carried out as needed to uphold quality and reliability throughout the duration of the agreement.",
        },
      ]}
    />
  </ContentWidth>
</section>

<Footer />
