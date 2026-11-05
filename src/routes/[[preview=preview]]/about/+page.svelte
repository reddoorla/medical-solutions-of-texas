<script lang="ts">
  import ScreenWidthImage from "$lib/components/ScreenWidth/ScreenWidthImage.svelte";
  import ContentWidth from "$lib/components/ContentWidth/ContentWidth.svelte";

  import hero from "$lib/assets/images/about/aboutHero.jpg?as=run";
  import dots from "$lib/assets/dots.svg";
  import patch from "$lib/assets/images/about/patch.jpg";
  import tim from "$lib/assets/images/generic_headshots/tim.png";
  import kathy from "$lib/assets/images/generic_headshots/kathy.png";
  import kylene from "$lib/assets/images/generic_headshots/kylene.png";
  import courtney from "$lib/assets/images/generic_headshots/courtney.png";
  import jonHood from "$lib/assets/images/generic_headshots/Jon Hood.svg";

  import Accordian from "$lib/components/FullWidth/Accordian.svelte";
  import Footer from "$lib/components/Footer.svelte";
  import TeamWithPopup from "$lib/components/FullWidth/TeamWithPopup.svelte";

  import placeholder from "$lib/assets/images/profile_placeholder.png";
  import { buildTeam, type CurrentCard } from "$lib/team";

  let { data } = $props();
  const copy = $derived(data.copy);

  // Today's cards. Each stays until Marketing publishes that person's
  // team_member document in Prismic (see $lib/team). David Lange's image is
  // tim.png until Marketing confirms whose face it is.
  const CURRENT: CurrentCard[] = [
    { name: "Jon Hood", title: "CEO", headshot: jonHood },
    { name: "David Lange", title: "President", headshot: tim },
    { name: "Kylene Carse", title: "Chief Financial Officer", headshot: kylene },
    { name: "Courtney Alexander", title: "Government Accounts Coordinator", headshot: courtney },
    { name: "Kathy Castro", title: "Operations Administrator", headshot: kathy },
  ];

  const team = $derived(buildTeam(data.team ?? [], CURRENT, placeholder));
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
  <div class="w-full flex justify-center items-center my-32">
    <div
      class="w-full p-12 lg:p-32 lg:px-40 border-mid border-b-[6px] border-x-[6px] relative flex flex-col items-center justify-center gap-10 mb-12"
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
        {copy.differentiates_heading}
      </h4>
      <p class="text-white text-center leading-normal md:text-[24px]" data-testid="definition">
        {data.identity.definitionAbout}
      </p>
      <p class="text-white text-center">{copy.defined_text}</p>

      <div class="text-white text-center leading-normal md:text-[24px]">
        {copy.experience_text}
      </div>
    </div>
  </div>
</ContentWidth>

<!-- <section class="w-full py-20 bg-mid" >
	<ContentWidth class="items-start">
        <h5 class="text-dark mb-5" style="font-family:'barlow-condensed', sans-serif;">Track Record: Our Best Projects</h5>
		<div class="w-full aspect-[5/2] bg-light relative overflow-hidden">
            <img src={flagThumb} alt="surgeons placeholder" class="w-full h-full absolute top-0 left-0 object-cover"/>
			<iframe 
					title="background video" 
					src={`https://player.vimeo.com/video/1022236757?background=1&dnt=1`}
					class="absolute w-full aspect-video top-0 left-0 contrast-[1.3]"
					frameborder="0"
					
				  ></iframe>
				  <div class="w-full h-full absolute top-0 left-0 bg-mid mix-blend-multiply"/>
				  <h2 class="text-mid absolute -bottom-2 md:-bottom-[14px] left-0 leading-none">CIBOLO SPINE</h2>
		</div>
        <div class="mt-5 sm:w-1/2 text-dark text-lg">Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi</div>
	
	</ContentWidth>
</section> -->
<section class="w-full py-32 bg-light">
  <ContentWidth>
    <h3 class="text-dark mb-8">{copy.services_heading}</h3>
    <Accordian accordianProps={copy.services.map((r) => ({ label: r.label, content: r.answer }))} />
    <div
      class="my-44 flex flex-col md:flex-row justify-start items-start w-full overflow-x-clip md:overflow-x-visible"
    >
      <div class="relative w-full md:w-[40%] h-fit mr-12 xl:mr-[20%]">
        <img alt="" src={dots} class=" w-2/5 absolute -bottom-[10%] -right-[10%]" />
        <img
          alt=""
          src={dots}
          class=" w-2/5 absolute -bottom-[10%] right-[30%] translate-x-[-0.8px]"
        />
        <img
          alt=""
          src={dots}
          class=" w-2/5 absolute -bottom-[10%] right-[70%] translate-x-[-0.8px]"
        />
        <div
          class="w-2/5 absolute -bottom-[10%] bg-light h-full right-[90%] translate-x-[-0.8px]"
        ></div>
        <img alt="" src={patch} class="w-full opacity-0" />
        <img alt="" src={patch} class="w-full absolute top-0 sepia-[0.65]" />
      </div>
      <div class="relative mt-20 md:mt-0 w-full md:w-1/2 xl:w-2/5 xl:pr-[10%] flex flex-col gap-5">
        <h5 class="text-dark">{copy.who_eyebrow}</h5>
        <h3 class="text-dark">{copy.who_heading}</h3>
        <div class="text-dark label">
          {copy.who_text_1}
          <br /> <br />
          {copy.who_text_2}
          <br /> <br />
          {data.identity.worksWith}
        </div>
      </div>
    </div>
  </ContentWidth>
</section>
<section class="bg-[#998B6A] py-20">
  <ContentWidth>
    <h4 class="text-light my-20">{copy.team_heading}</h4>

    <!-- Rows centre, and the column gap is what justify-between gave a full row
         of three cards (w-72 at lg, w-96 at xl), so a short last row sits centred
         under the row above instead of splitting across its columns. -->
    <div
      class="w-full flex flex-col lg:flex-row gap-y-20 items-center lg:items-start justify-center flex-wrap lg:gap-x-[calc((100%-54rem)/2)] xl:gap-x-[calc((100%-72rem)/2)]"
    >
      {#each team as person, i (i)}
        <div data-testid="team-card">
          <TeamWithPopup
            name={person.name}
            title={person.title}
            headshot={person.headshot}
            alt={person.alt}
            richBio={person.bio}
            linkedin={person.linkedin}
            noclick
          />
        </div>
      {/each}
    </div>
  </ContentWidth>
</section>
<Footer />
