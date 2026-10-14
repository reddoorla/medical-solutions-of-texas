<script lang="ts">
  import Footer from "$lib/components/Footer.svelte";
  import {
    PRIVACY_POLICY_DRAFT,
    PRIVACY_SERVICES,
    PRIVACY_VALUES,
    formatEffectiveDate,
  } from "$lib/privacy/policy";

  const has = (service: (typeof PRIVACY_SERVICES)[number]) => PRIVACY_SERVICES.includes(service);
  const owner = PRIVACY_VALUES.legalName;
  const email = PRIVACY_VALUES.contactEmail;
  const effective = formatEffectiveDate(PRIVACY_VALUES.effectiveDate) ?? "[effective date]";
</script>

<svelte:head>
  {#if PRIVACY_POLICY_DRAFT}
    <meta name="robots" content="noindex" />
  {/if}
</svelte:head>

{#snippet contact()}
  <a href={`mailto:${email}`} class="underline hover:text-white">{email}</a>
{/snippet}

<article
  data-testid="privacy-policy"
  class="max-w-2xl mx-auto px-8 pt-48 pb-24 space-y-8 text-light text-left text-lg [&_p]:text-lg [&_p]:leading-7"
>
  {#if PRIVACY_POLICY_DRAFT}
    <p
      data-testid="privacy-draft"
      class="border-2 border-amber-600 bg-amber-50 rounded p-4 text-amber-900 font-semibold"
    >
      DRAFT: this policy has not yet been reviewed by a lawyer and is not final.
    </p>
  {/if}

  <header class="space-y-2">
    <h1 class="text-4xl font-bold text-white">Privacy Policy</h1>
    <p>Effective {effective}</p>
  </header>

  <p>
    {owner} ("we") runs this website. This policy explains what information the site collects, why, who
    else receives it, and the choices you have.
  </p>

  <section class="space-y-3">
    <h2 class="text-2xl font-semibold text-white">What we collect</h2>
    {#if has("forms")}
      <p>
        When you send us the contact form, we collect what you enter, such as your name, email
        address, area of interest and message, and the address of the page you sent it from,
        including any campaign tags in that link. The IP address the form was sent from goes to
        Reddoor with your message{#if has("turnstile")}
          and is used to confirm the form came from a real browser{/if}. It is not saved with your
        message, except in a backup copy kept if our system cannot file the message normally.
      </p>
    {/if}
    <p>
      Each time you load a page, the servers that host this site record technical details about the
      request: your IP address, your browser and device type, the page requested, the referring page
      and the time.
    </p>
    {#if has("ga4")}
      <p>
        We also measure how visitors use the site: which pages are viewed, for how long, from what
        kind of device, and your approximate location, derived from your IP address.
      </p>
    {/if}
  </section>

  <section class="space-y-3">
    <h2 class="text-2xl font-semibold text-white">How we use it</h2>
    <ul class="list-disc pl-6 space-y-1">
      {#if has("forms")}
        <li>To answer your message, follow up on your request and filter out spam.</li>
      {/if}
      <li>To run the site, keep it secure and fix problems.</li>
      {#if has("ga4")}
        <li>To understand how the site is used and improve it.</li>
      {/if}
    </ul>
    <p>We do not sell your personal information.</p>
  </section>

  <section class="space-y-3">
    <h2 class="text-2xl font-semibold text-white">Who else receives it</h2>
    <p>
      We use the service providers below to run this site. Each receives the information described
      next to it.
    </p>
    <p data-testid="privacy-tracking">
      Some of the services below may collect information about your online activities over time and
      across different websites.
    </p>
    <ul class="list-disc pl-6 space-y-2">
      {#if has("forms")}
        <li data-testid="service-forms">
          Form messages go to Reddoor, the agency that builds and maintains this site for us.
          Reddoor checks them for spam, stores them with its spam assessment in a database hosted by
          Turso, and uses Resend to email them to us and usually to send you a confirmation. Because
          Reddoor handles forms for other websites too, its spam check compares your email address
          and message with messages sent through those websites in the last 30 days, to catch the
          same message sent to many sites.
        </li>
      {/if}
      {#if has("turnstile")}
        <li data-testid="service-turnstile">
          Cloudflare Turnstile checks that the contact form is sent by a person rather than a bot.
          To do that it reads signals from your browser, such as how the page was loaded and
          interacted with, and receives your IP address.
        </li>
      {/if}
      {#if has("ga4")}
        <li data-testid="service-ga4">
          Google Analytics measures how visitors use the site. Google sets cookies to tell one visit
          from the next and receives your IP address, device and browser details, and the pages you
          view. Google may collect information about your online activities over time and across
          different websites. The analytics account is managed by Reddoor, which uses it to prepare
          reports for us. You can opt out with Google's
          <a href="https://tools.google.com/dlpage/gaoptout" class="underline hover:text-white"
            >browser add-on</a
          >.
        </li>
      {/if}
      {#if has("adobeFonts")}
        <li data-testid="service-adobeFonts">
          Some fonts load from Adobe Fonts, so your browser sends your IP address to Adobe when a
          page loads.
        </li>
      {/if}
      {#if has("vimeo")}
        <li data-testid="service-vimeo">
          Some pages show video from Vimeo. Vimeo receives your IP address when the video loads, and
          its player may set cookies.
        </li>
      {/if}
      {#if has("netlify")}
        <li data-testid="service-netlify">
          Netlify hosts this site and keeps the request records described above.
        </li>
      {/if}
    </ul>
  </section>

  <section data-testid="privacy-dnt" class="space-y-3">
    <h2 class="text-2xl font-semibold text-white">Do Not Track</h2>
    <p>
      Your browser may let you send a "Do Not Track" signal. There is no agreed standard for how a
      website should respond to it, so this site does not change what it collects when it receives
      one.
    </p>
  </section>

  <section class="space-y-3">
    <h2 class="text-2xl font-semibold text-white">Children</h2>
    <p>
      This site is not meant for children under 13, and we do not knowingly collect their
      information.
    </p>
  </section>

  <section class="space-y-3">
    <h2 class="text-2xl font-semibold text-white">Your choices</h2>
    <p>
      To ask what information we hold about you, or to ask us to correct or delete it, email
      {@render contact()}.
    </p>
  </section>

  <section class="space-y-3">
    <h2 class="text-2xl font-semibold text-white">Changes to this policy</h2>
    <p>
      If we change this policy, we will post the new version on this page and update the effective
      date above.
    </p>
  </section>
</article>

<Footer />
