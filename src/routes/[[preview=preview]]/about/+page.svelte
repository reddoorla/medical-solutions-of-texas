<script lang="ts">
  import ScreenWidthImage from "$lib/components/ScreenWidth/ScreenWidthImage.svelte";
  import ContentWidth from "$lib/components/ContentWidth/ContentWidth.svelte";

  import hero from "$lib/assets/images/about/aboutHero.jpg";
  import dots from "$lib/assets/dots.svg";
  import patch from "$lib/assets/images/about/patch.jpg";
  import albert from "$lib/assets/images/generic_headshots/albert.png";
  import tim from "$lib/assets/images/generic_headshots/tim.png";
  import kathy from "$lib/assets/images/generic_headshots/kathy.png";
  import kylene from "$lib/assets/images/generic_headshots/kylene.png";
  import courtney from "$lib/assets/images/generic_headshots/courtney.png";
  import jonHood from "$lib/assets/images/generic_headshots/Jon Hood.svg";
  import timWatson from "$lib/assets/images/generic_headshots/Tim Watson.svg";

  import Accordian from "$lib/components/FullWidth/Accordian.svelte";
  import Footer from "$lib/components/Footer.svelte";
  import TeamWithPopup from "$lib/components/FullWidth/TeamWithPopup.svelte";

  const LOREM =
    "Lorem ipsum odor amet, consectetuer adipiscing elit. Maecenas felis feugiat nulla nisl proin? Vel ultricies senectus faucibus morbi vulputate. Facilisis natoque duis maecenas netus vel arcu elementum. Posuere facilisi gravida malesuada potenti vel taciti blandit. Integer nibh diam diam lectus nullam varius venenatis. Habitant quis pellentesque vulputate hac amet. Sodales euismod purus vehicula scelerisque cursus facilisi. Torquent quisque nibh ante duis nisl. Ridiculus ultricies natoque eros eget phasellus odio enim. Lectus adipiscing tristique tempor convallis ridiculus eleifend. Vehicula accumsan enim augue porta sodales tortor risus. Consectetur vestibulum laoreet ullamcorper quisque potenti sit erat libero. Sodales mattis cursus ex amet primis hac ligula. Vulputate mi luctus est euismod tortor tincidunt. Porttitor in curabitur aliquam, rhoncus eget nam vestibulum fringilla. Tincidunt ante ligula euismod fringilla lectus. Fusce habitant fringilla porta; sit imperdiet sit ultrices ipsum. Leo euismod lacinia placerat suscipit congue. Gravida phasellus diam facilisi habitasse; risus duis fusce?";

  const teamArray = [
    {
      name: "Jon Hood",
      title: "CEO",
      image: jonHood,
      bio: LOREM,
    },
    {
      name: "David Lange",
      title: "President",
      image: tim,
      bio: LOREM,
    },
    {
      name: "Albert Turgon",
      title: "Chief Operating Officer",
      image: albert,
      bio: LOREM,
    },
    {
      name: "Tim Watson",
      title: "Chief Commercial Officer",
      image: timWatson,
      bio: LOREM,
    },
    {
      name: "Kylene Carse",
      title: "Chief Financial Officer",
      image: kylene,
      bio: LOREM,
    },

    {
      name: "Courtney Alexander",
      title: "Government Accounts Coordinator",
      image: courtney,
      bio: LOREM,
    },
    {
      name: "Kathy Castro",
      title: "Operations Administrator",
      image: kathy,
      bio: LOREM,
    },
  ];
</script>

<ScreenWidthImage class="fixed -z-10" src={hero} darken backdrop />
<div
  class="w-screen h-[20vh] fixed left-0 top-0 -z-10 bg-gradient-to-b from-[#140F09] via-[#140F09] to-transparent opacity-55"
></div>
<div class="w-screen h-screen fixed left-0 top-0 -z-10 bg-[#140F09] opacity-45"></div>

<div class="w-full h-screen">
  <ContentWidth class="h-full flex flex-row justify-between items-center py-32 relative">
    <h1 class="text-mid mb-12 opacity-60 w-fit">About</h1>
    <h1 class="text-mid mb-12 opacity-60 w-fit">MSOT</h1>
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
        what differentiates us
      </h4>
      <p class="text-white text-center">We are defined by expertise and experience.</p>

      <div class="text-white text-center leading-normal md:text-[24px]">
        With 20 years worth of experience in Air Force logistics and nearly 50 years in medical
        device sales on our leadership team, we know the DoD & VA healthcare landscape better than
        anyone. We enable med-surg suppliers to find and access opportunities that they wouldn’t
        have been able to tap into alone.
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
    <h3 class="text-dark mb-8">What We Do For You</h3>
    <Accordian
      accordianProps={[
        {
          label: "Sign Dapas",
          content:
            "Distribution and pricing agreements allow you to set prices and gain direct access to the military market.",
        },
        {
          label: "Get Listed in the E-CAT",
          content:
            "Getting listed in an e-catalog gives you the advantage of increased reach, better customer engagement, the ability to collect valuable customer data, and a more streamlined way to showcase products with updated information readily available, ultimately boosting sales potential.",
        },
        {
          label: "Win FSS Contracts",
          content: `You'll have access to be awarded to the the nine VA FSS programs: 
65 I B Drugs, Pharmaceuticals, & Hematology Related Products
65 II A    Medical Equipment & Supplies
65 II C    Dental Equipment & Supplies
65 II F    Patient Mobility Devices
65 V A    X-Ray Equipment & Supplies
65 VII    Invitro Diagnostics, Reagents, Test Kits, & Test Sets
66 III    Cost-Per-Test, Clinical Laboratory Analyzers
621 I    Professional & Allied Healthcare Staffing Services
621 II    Medical Laboratory Testing & Analysis Services`,
        },
        {
          label: "Figure out where to start",
          content:
            "With our team's combined experience in medical sales and government contracting, we're the perfect partner to point you in the right direction. Let's get started.",
        },
      ]}
    />
    <div class="my-44 flex flex-col md:flex-row justify-start items-start w-full">
      <div class="relative w-full md:w-[40%] h-fit mr-12 xl:mr-[20%]">
        <img alt="dots" src={dots} class=" w-2/5 absolute -bottom-[10%] -right-[10%]" />
        <img
          alt="dots"
          src={dots}
          class=" w-2/5 absolute -bottom-[10%] right-[30%] translate-x-[-0.8px]"
        />
        <img
          alt="dots"
          src={dots}
          class=" w-2/5 absolute -bottom-[10%] right-[70%] translate-x-[-0.8px]"
        />
        <div
          class="w-2/5 absolute -bottom-[10%] bg-light h-full right-[90%] translate-x-[-0.8px]"
        ></div>
        <img alt="pats" src={patch} class="w-full opacity-0" />
        <img alt="pats" src={patch} class="w-full absolute top-0 sepia-[0.65]" />
      </div>
      <div class="relative mt-20 md:mt-0 w-full md:w-1/2 xl:w-2/5 xl:pr-[10%] flex flex-col gap-5">
        <h5 class="text-dark">Who We Are</h5>
        <h3 class="text-dark">We have what you’re looking for</h3>
        <div class="text-dark label">
          MSOT was founded by a team of medical sales experts in 2022. With a career running Air
          Force logistics on bases in the continental United States and at forward deployment
          locations overseas, we have the experience to know how to work within the complex system
          of military contracts and procurement.
          <br /> <br />
          We spent our careers grappling with the difficulties in getting and keeping VA hospitals and
          DoD bases equipped with med-surg supplies, from the side of a logistics officer and the side
          of the medical sales. And so we formed MSOT, pairing experts on both sides to build an organization
          uniquely suited to connect med-surg suppliers with VA and DoD contracts.
        </div>
      </div>
    </div>
  </ContentWidth>
</section>
<section class="bg-[#998B6A] py-20">
  <ContentWidth>
    <h4 class="text-light my-20">The Team</h4>

    <div class="w-full flex flex-col lg:flex-row gap-y-20 items-center justify-between flex-wrap">
      {#each teamArray as person, i (i)}
        <div class="last:mx-auto">
          <TeamWithPopup
            name={person.name}
            title={person.title}
            headshot={person.image}
            bio={person.bio}
            noclick
          />
        </div>
      {/each}
    </div>
  </ContentWidth>
</section>
<Footer />
