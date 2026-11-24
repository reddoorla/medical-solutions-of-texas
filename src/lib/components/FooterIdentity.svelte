<script lang="ts">
  // The sitewide identity lines (Developer Brief Part 2, §12d, with §12b's
  // definition sentence "as the footer description"), shared by the
  // Footer component and Home's own footer so the two can't drift apart.
  // Server-rendered at every width: the old © line was only drawn above 560px.
  //
  // The name, phone, email and © line are always in view. The definition, the
  // VOSB line, the street address, UEI · CAGE · FSS, and the ECAT and DAPA
  // contract numbers and NAICS code (Marketing, Nov 23) fold into a native
  // <details>, closed by default (the operator, 11-05: the six lines looked
  // "hideous"). Their text is still in the server HTML, so a crawler or an AI
  // assistant reads all of it, and the browser opens it with no script.
  import { Plus } from "@lucide/svelte";
  import { PRIVACY_PATH } from "$lib/privacy/policy";
  import { page } from "$app/state";
  import { addressLine } from "$lib/identity";
  import { fill } from "$lib/content";

  // "dark" is the khaki band's text: #140F09 on #998B6A measures 5.68:1, where
  // white measured 3.36:1 against the 4.5:1 minimum (Marketing approved dark
  // text, Nov 23: "Accessibility matters for a federal audience"). Home's
  // footer is #140F09 itself, so its text stays white (19:1).
  let { tone = "light" }: { tone?: "light" | "dark" } = $props();
  const ink = $derived(tone === "dark" ? "text-[#140F09]" : "text-white");
  // The base style turns every link white on hover (app.css `a:hover`), which
  // on khaki is the 3.36:1 the dark text replaced: the dark tone holds its ink
  // and underlines instead.
  const hover = $derived(
    tone === "dark" ? "hover:text-[#140F09] hover:underline" : "hover:text-light",
  );
  // The privacy link is underlined already: on the dark tone, hover lifts it.
  const linkHover = $derived(tone === "dark" ? "hover:no-underline" : "hover:text-light");

  const identity = $derived(page.data.identity);
  // The fold-out label and the privacy link's words: $lib/copy/chrome.
  const chrome = $derived(page.data.chrome);

  const year = new Date().getFullYear();
  // The values the footer's lines may name, as {tokens} ($lib/copy/chrome).
  const tokens = $derived({
    name: identity.name,
    "short name": identity.shortName,
    "legal name": identity.legalName,
    "business type": identity.businessType,
    tagline: identity.tagline,
    uei: identity.uei,
    cage: identity.cage,
    fss: identity.fss,
    naics: identity.naics,
    year: String(year),
  });
</script>

<div class="label {ink} flex flex-col gap-1" data-testid="footer-identity">
  <p class="label font-semibold">{fill(chrome.footer_name_line, tokens)}</p>
  <address class="label not-italic">
    <!-- Below sm the two don't fit on one line: each takes its own, with no
         separator left dangling at the end of the first. -->
    {#if identity.phoneE164}<a href={`tel:${identity.phoneE164}`} class={hover}>
        {identity.phone}
      </a>{:else}{identity.phone}{/if}<span class="max-sm:hidden">&nbsp;· </span>
    <a
      href={`mailto:${identity.email}`}
      class="{hover} [overflow-wrap:anywhere] max-sm:block max-sm:w-fit"
    >
      {identity.email}
    </a>
  </address>
  <details class="group">
    <summary class="label w-fit cursor-pointer list-none flex flex-row items-center gap-1 {hover}">
      {chrome.company_details}
      <Plus
        class="shrink-0 transition-transform duration-300 ease-in-out group-open:rotate-45 motion-reduce:transition-none"
        size={14}
        strokeWidth={1.5}
        aria-hidden="true"
      />
    </summary>
    <div class="flex flex-col gap-1 pt-1">
      <p class="label" data-testid="footer-definition">{identity.definition}</p>
      <p class="label">{fill(chrome.footer_type_line, tokens)}</p>
      <address class="label not-italic">{addressLine(identity.address)}</address>
      <p class="label">{fill(chrome.footer_ids_line, tokens)}</p>
      <!-- The ECAT and DAPA contract numbers and the NAICS code the Organization
           markup gives, shown on every page (Marketing, Nov 23, decision 4).
           Keyed by position: two rows may share a number, and the list never
           reorders. -->
      <!-- role="list": Safari drops a list's role when its bullets are off. -->
      <ul class="label flex flex-col gap-1" role="list">
        {#each identity.contracts as c, i (i)}
          <!-- A bare number stays whole (a phone would break it at a hyphen); one
               with spaces, which an editor might type, may wrap. -->
          <li>
            {c.label}:
            <span class={/\s/.test(c.value) ? "[overflow-wrap:anywhere]" : "whitespace-nowrap"}>
              {c.value}
            </span>
          </li>
        {/each}
      </ul>
      <p class="label">{fill(chrome.footer_naics_line, tokens)}</p>
    </div>
  </details>
  <p class="label">
    {fill(chrome.footer_copyright, tokens)}
    <a
      href={PRIVACY_PATH}
      data-testid="footer-privacy-link"
      class="label {ink} underline {linkHover}"
    >
      {chrome.privacy_link}
    </a>
  </p>
</div>

<style>
  /* The plus icon is the marker, as in the FAQ's Accordian. */
  summary::-webkit-details-marker {
    display: none;
  }
</style>
