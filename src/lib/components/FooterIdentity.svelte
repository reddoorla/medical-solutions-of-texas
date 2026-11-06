<script lang="ts">
  // The sitewide identity lines (Developer Brief Part 2, §12d, with §12b's
  // definition sentence "as the footer description"), shared by the
  // Footer component and Home's own footer so the two can't drift apart.
  // Server-rendered at every width: the old © line was only drawn above 560px.
  //
  // The name, phone, email and © line are always in view. The definition, the
  // VOSB line, the street address and UEI · CAGE · FSS fold into a native
  // <details>, closed by default (the operator, 11-05: the six lines looked
  // "hideous"). Their text is still in the server HTML, so a crawler or an AI
  // assistant reads all of it, and the browser opens it with no script.
  import { Plus } from "@lucide/svelte";
  import { PRIVACY_PATH } from "$lib/privacy/policy";
  import { page } from "$app/state";
  import { addressLine } from "$lib/identity";

  const identity = $derived(page.data.identity);
  // The fold-out label and the privacy link's words: $lib/copy/chrome.
  const chrome = $derived(page.data.chrome);

  const year = new Date().getFullYear();
</script>

<div class="label text-white flex flex-col gap-1" data-testid="footer-identity">
  <p class="label font-semibold">{identity.name} ({identity.shortName})</p>
  <address class="label not-italic">
    <!-- Below sm the two don't fit on one line: each takes its own, with no
         separator left dangling at the end of the first. -->
    {#if identity.phoneE164}<a href={`tel:${identity.phoneE164}`} class="hover:text-light"
        >{identity.phone}</a
      >{:else}{identity.phone}{/if}<span class="max-sm:hidden">&nbsp;· </span>
    <a
      href={`mailto:${identity.email}`}
      class="hover:text-light [overflow-wrap:anywhere] max-sm:block max-sm:w-fit"
      >{identity.email}</a
    >
  </address>
  <details class="group">
    <summary
      class="label w-fit cursor-pointer list-none flex flex-row items-center gap-1 hover:text-light"
    >
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
      <p class="label">{identity.businessType} · {identity.tagline}</p>
      <address class="label not-italic">{addressLine(identity.address)}</address>
      <p class="label">UEI {identity.uei} · CAGE {identity.cage} · FSS {identity.fss}</p>
    </div>
  </details>
  <p class="label">
    ©{year}
    {identity.legalName} dba {identity.name} |
    <a
      href={PRIVACY_PATH}
      data-testid="footer-privacy-link"
      class="label text-white underline hover:text-light">{chrome.privacy_link}</a
    >
  </p>
</div>

<style>
  /* The plus icon is the marker, as in the FAQ's Accordian. */
  summary::-webkit-details-marker {
    display: none;
  }
</style>
