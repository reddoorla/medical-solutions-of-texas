<script lang="ts">
  import ScreenWidthImage from "$lib/components/ScreenWidth/ScreenWidthImage.svelte";
  import ContentWidth from "$lib/components/ContentWidth/ContentWidth.svelte";

  import hero from "$lib/assets/images/partners/partnersHero.jpg?as=run";
  import revogenLogo from "$lib/assets/icons/logos/revogenLogo.svg";

  import revogenDuo from "$lib/assets/images/partners/partners_duotone/revogen-duo.png";

  import caerus from "$lib/assets/images/partners/partners_duotone/caerus.png";
  import aegis from "$lib/assets/images/partners/partners_duotone/AEGIS-SPINE-logo-300x94.png";
  import leith from "$lib/assets/images/partners/partners_duotone/Leith.png";
  import centinel from "$lib/assets/images/partners/partners_duotone/centinel spine.png";
  import spinal from "$lib/assets/images/partners/partners_duotone/SpinalSimplicityLogo.Master.png";
  import edge from "$lib/assets/images/partners/partners_duotone/EDGe.png";
  import ctl from "$lib/assets/images/partners/partners_duotone/ctl.png";
  import fourWeb from "$lib/assets/images/partners/partners_duotone/4web.png";
  import difusion from "$lib/assets/images/partners/partners_duotone/difusion.png";
  import metalogix from "$lib/assets/images/partners/partners_duotone/Metalogix.png";
  import expanding from "$lib/assets/images/partners/partners_duotone/expanding innovations.png";
  import aurora from "$lib/assets/images/partners/partners_duotone/aurora.png";
  import axial from "$lib/assets/images/partners/partners_duotone/axial_biologics_logo.png";
  import bridge from "$lib/assets/images/partners/partners_duotone/bonebridge.png";
  import signus from "$lib/assets/images/partners/partners_duotone/SIGNUS.png";
  import cibolo from "$lib/assets/images/partners/partners_duotone/cibolo-spine_medium duo.png";
  import nexxt from "$lib/assets/images/partners/partners_duotone/Nexxt-duo.png";

  import Footer from "$lib/components/Footer.svelte";

  const imageArray = [
    revogenDuo,
    cibolo,
    caerus,
    aegis,
    leith,
    centinel,
    spinal,
    edge,
    ctl,
    fourWeb,
    difusion,
    metalogix,
    expanding,
    aurora,
    axial,
    bridge,
    signus,
    nexxt,
  ];
</script>

<svelte:head><title>MSOT | Partners</title></svelte:head>

<ScreenWidthImage class="fixed -z-10" src={hero} darken backdrop />
<div
  class="w-screen h-[20vh] fixed left-0 top-0 -z-10 bg-gradient-to-b from-[#140F09] via-[#140F09] to-transparent opacity-55"
></div>
<div class="w-screen h-screen fixed left-0 top-0 -z-10 bg-[#140F09] opacity-45"></div>

<div class="w-full h-screen">
  <ContentWidth class="h-full flex flex-row justify-between items-center py-32 relative">
    <h1 class="text-mid mb-12 opacity-60 w-fit">Our</h1>
    <h1 class="text-mid mb-12 opacity-60 w-fit">Partners</h1>
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
        working with the best
      </h4>
      <img src={revogenLogo} alt="revogen logo" class="w-64 brightness-0 invert" />

      <div class="text-white text-center leading-normal md:text-[24px] max-w-[900px]">
        MSOT made the process of getting our product into the DoD system easier than we ever thought
        possible. They're an invaluable partnership and wealth of knowledge when it comes to selling
        to the DoD and VA hospital systems.
      </div>
    </div>
  </div>

  <div class="w-full flex justify-center items-center mb-40">
    <div
      class="w-full p-6 sm:p-12 lg:px-40 relative flex flex-col items-center justify-center gap-8 mb-12"
    >
      <p class="text-white text-center">Successful Partnerships</p>

      <div class="text-white text-center leading-normal md:text-[24px] max-w-screen-lg">
        Our most successful partnerships are with companies who are looking to expand their product
        offering into DoD and VA facilities, who have the flexibility and mindset to work with the
        government and who believe it's meaningful to be a part of offering the best healthcare
        possible to our active duty and veteran population in the United States.
      </div>
    </div>
  </div>
</ContentWidth>

<section class="bg-white py-20">
  <ContentWidth>
    <h4 class="text-dark mb-12">Our Clients</h4>
    <div class="h-0.5 bg-dark w-full"></div>
    <div class="w-full mt-12 flex flex-row flex-wrap gap-x-12 gap-y-24 justify-evenly items-center">
      {#each imageArray as image, i (i)}
        <img
          src={image}
          alt="partner logo"
          class="w-1/3 lg:w-1/4 xl:w-1/5 max-w-52 max-h-24 object-scale-down"
        />
      {/each}
    </div>
  </ContentWidth>
</section>

<Footer />
