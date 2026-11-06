<script lang="ts">
  import { page } from "$app/state";
  import { Download } from "@lucide/svelte";
  import BracketButton from "$lib/components/Buttons/BracketButton.svelte";
  import ContentWidth from "$lib/components/ContentWidth/ContentWidth.svelte";
  import Footer from "$lib/components/Footer.svelte";

  // The page's copy and files: the resources_page document over today's, field
  // by field ($lib/copy/resources). The address and phone are `settings`'.
  let { data } = $props();
  const copy = $derived(data.copy);
  const identity = $derived(page.data.identity);
  // A soft hyphen before the "@", as the address has always had: on a narrow
  // phone it may break there.
  const at = $derived(copy.service_email.indexOf("@"));
</script>

<section class="h-96 bg-mid py-10">
  <ContentWidth class="h-full flex flex-col justify-end">
    <h1 class="h2 text-dark">{copy.heading}</h1>
  </ContentWidth>
</section>
<section class="bg-mid">
  <ContentWidth class="border-t-2 border-dark flex flex-col md:flex-row py-10">
    <div class="md:w-1/2 pr-12 flex flex-col gap-10 items-start">
      <h3 class="text-dark">{copy.charge_heading}</h3>
      <BracketButton class="text-dark" href={copy.charge_file}>{copy.charge_button}</BracketButton>
    </div>
    <div class="mt-24 md:mt-0 md:w-1/2 pr-12 flex flex-col gap-10 items-start">
      <p
        class="text-dark md:text-[24px] text-sm leading-normal text-pretty break-words hyphens-manual w-full"
      >
        {identity.address.street} <br />
        {identity.address.city}, {identity.address.region}
        {identity.address.postalCode} <br /><br />
        {copy.phone_label}
        {identity.phone} <br />
        {#if at > 0}{copy.service_email.slice(0, at)}&shy;{copy.service_email.slice(
            at,
          )}{:else}{copy.service_email}{/if}
      </p>
      <BracketButton class="text-dark" href="/contact">{copy.contact_button}</BracketButton>
    </div>
  </ContentWidth>
</section>
<!-- The Capabilities Statement as a page of text (§14c); same pattern as the
     Charge Sheet block above. -->
<section class="bg-mid">
  <ContentWidth class="border-t-2 border-dark flex flex-col md:flex-row py-10">
    <div class="md:w-1/2 pr-12 flex flex-col gap-10 items-start">
      <h3 class="text-dark">{copy.capabilities_heading}</h3>
      <BracketButton class="text-dark" href="/capabilities"
        >{copy.capabilities_button}</BracketButton
      >
    </div>
  </ContentWidth>
</section>
<section class="bg-mid pt-24">
  <ContentWidth class="flex flex-col md:flex-row justify-between py-10">
    <div class="md:w-[calc(33%-20px)] flex flex-col mt-12 md:mt-0">
      <h3 class="text-dark mb-14">{copy.catalogs_heading}</h3>
      {#each copy.catalogs as row, i (i)}
        <div
          class="text-dark w-full border-t-2 border-dark flex flex-row justify-between items-center py-5"
        >
          <a href={row.file} class="bump" target="_blank" rel="noopener noreferrer">
            <h4 class="text-dark hover:opacity-90 transition-opacity">
              {row.title}
            </h4>
          </a>
          <a href={row.file} class="negative-bump" target="_blank" rel="noopener noreferrer">
            <Download
              size={24}
              strokeWidth={1.5}
              class="text-dark opacity-40 hover:opacity-90 transition-opacity"
            />
          </a>
        </div>
      {/each}
    </div>
    <div class="md:w-[calc(33%-20px)] flex flex-col mt-12 md:mt-0 pointer-events-none">
      <h3 class="text-dark mb-14">{copy.suppliers_heading}</h3>
      {#each copy.suppliers as row, i (i)}
        <div
          class="text-dark/65 w-full border-t-2 border-dark flex flex-row justify-between items-center py-5"
        >
          <a href={row.file} class="bump" target="_blank" rel="noopener noreferrer">
            <h4 class=" hover:opacity-90 transition-opacity">{row.title}</h4>
          </a>
          <a href={row.file} class="negative-bump" target="_blank" rel="noopener noreferrer">
            <Download
              size={24}
              strokeWidth={1.5}
              class="opacity-0 hover:opacity-90 transition-opacity"
            />
          </a>
        </div>
      {/each}
    </div>
    <div class="md:w-[calc(33%-20px)] flex flex-col mt-12 md:mt-0 pointer-events-none">
      <h3 class="text-dark mb-14">{copy.guides_heading}</h3>

      {#each copy.guides as row, i (i)}
        <div
          class="text-dark/65 w-full border-t-2 border-dark flex flex-row justify-between items-center py-5"
        >
          <a href={row.file} class="bump" target="_blank" rel="noopener noreferrer">
            <h4 class=" hover:opacity-90 transition-opacity">{row.title}</h4>
          </a>
          <a href={row.file} class="negative-bump" target="_blank" rel="noopener noreferrer">
            <Download
              size={24}
              strokeWidth={1.5}
              class="opacity-0 hover:opacity-90 transition-opacity"
            />
          </a>
        </div>
      {/each}
    </div>
  </ContentWidth>
</section>
<Footer />
