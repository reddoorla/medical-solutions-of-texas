<script lang="ts">
  // MSOT's Capabilities Statement as text (Developer Brief Part 2, §14c), from
  // Marketing's new PDF (2026), so search engines and AI assistants read it as
  // a page rather than a PDF. The identity values come from $lib/identity, the
  // same source as the footer and Home's JSON-LD.
  //
  // Not here yet: the "Download PDF" button. The PDF on the site is the old
  // design (old ZIP, "years of DoD Logistics"); the button comes with the new
  // PDF, once MSOT says yes to restyling it (decision 2207, 3(b)). The look of
  // this page reuses the Privacy Policy's; whether it gets its own design is
  // Erik's call.
  import Footer from "$lib/components/Footer.svelte";
  import { page } from "$app/state";
  import { addressLine } from "$lib/identity";

  // The words are the capabilities_page document's over today's, field by
  // field ($lib/copy/capabilities).
  let { data } = $props();
  const copy = $derived(data.copy);

  // The numbers come from $lib/identity, the same list the footer and the
  // Organization markup read; the order and notes are the PDF's.
  const identity = $derived(page.data.identity);
  const [ecatJit, ecatDvd, dapaMed, dapaEquip] = $derived(identity.contracts);
  const VEHICLES = $derived([
    { vehicle: copy.ecat_jit_name, number: ecatJit.value, note: copy.ecat_jit_note },
    { vehicle: copy.ecat_dvd_name, number: ecatDvd.value, note: copy.ecat_dvd_note },
    { vehicle: copy.fss_name, number: identity.fss, note: copy.fss_note },
    { vehicle: copy.dapa_medical_name, number: dapaMed.value, note: copy.dapa_medical_note },
    { vehicle: copy.dapa_equipment_name, number: dapaEquip.value, note: copy.dapa_equipment_note },
    // A vehicle Marketing adds in the settings document, past today's four.
    ...identity.contracts.slice(4).map((c) => ({ vehicle: c.label, number: c.value, note: "" })),
  ]);
</script>

<article
  data-testid="capabilities"
  class="max-w-2xl mx-auto px-8 pt-48 pb-24 space-y-8 text-light text-left text-lg [&_p]:text-lg [&_p]:leading-7"
>
  <header class="space-y-2">
    <p class="label uppercase tracking-widest">{copy.eyebrow}</p>
    <h1 class="text-4xl font-bold text-white">{copy.heading}</h1>
  </header>

  <section class="space-y-3">
    <h2 class="text-2xl font-semibold text-white">{copy.mission_heading}</h2>
    <p>{copy.mission_line}</p>
    <p>
      {copy.mission_text}
    </p>
  </section>

  <section class="space-y-3">
    <h2 class="text-2xl font-semibold text-white">{copy.numbers_heading}</h2>
    <ul class="space-y-2">
      {#each copy.numbers as p, i (i)}
        <li><strong class="text-white">{p.figure}</strong> {p.line}</li>
      {/each}
    </ul>
  </section>

  <section class="space-y-3">
    <h2 class="text-2xl font-semibold text-white">{copy.capabilities_heading}</h2>
    <ul class="list-disc pl-6 space-y-1">
      {#each copy.capabilities as c, i (i)}<li>{c.item}</li>{/each}
    </ul>
  </section>

  <section class="space-y-3">
    <h2 class="text-2xl font-semibold text-white">{copy.vehicles_heading}</h2>
    <dl class="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1">
      {#each VEHICLES as v, i (i)}
        <dt class="text-white">{v.vehicle}</dt>
        <dd>{v.note ? `${v.number} · ${v.note}` : v.number}</dd>
      {/each}
    </dl>
  </section>

  <section class="space-y-3">
    <h2 class="text-2xl font-semibold text-white">{copy.company_heading}</h2>
    <dl class="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1">
      <dt class="text-white">{copy.legal_name_label}</dt>
      <dd>{identity.legalName}, {copy.dba} {identity.name}</dd>
      <dt class="text-white">{copy.uei_label}</dt>
      <dd>{identity.uei}</dd>
      <dt class="text-white">{copy.cage_label}</dt>
      <dd>{identity.cage}</dd>
      <dt class="text-white">{copy.naics_label}</dt>
      <dd>{identity.naics} {copy.naics_primary}, {copy.naics_secondary}</dd>
    </dl>
  </section>

  <section class="space-y-3">
    <h2 class="text-2xl font-semibold text-white">{copy.designations_heading}</h2>
    <dl class="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1">
      {#each copy.designations as d, i (i)}
        <dt class="text-white">{d.scope}</dt>
        <dd>{d.items}</dd>
      {/each}
    </dl>
  </section>

  <section class="space-y-3">
    <h2 class="text-2xl font-semibold text-white">{copy.different_heading}</h2>
    <p>
      {copy.different_text}
    </p>
  </section>

  <section class="space-y-3">
    <h2 class="text-2xl font-semibold text-white">{copy.contact_heading}</h2>
    <address class="not-italic">
      {identity.name} ({identity.shortName})<br />
      {#if identity.phoneE164}<a
          href={`tel:${identity.phoneE164}`}
          class="underline hover:text-white">{identity.phone}</a
        >{:else}{identity.phone}{/if}
      ·
      <a
        href={`mailto:${identity.email}`}
        class="underline hover:text-white [overflow-wrap:anywhere]">{identity.email}</a
      >
      · {copy.domain}<br />
      {addressLine(identity.address)}
    </address>
    <p><a href="/contact" class="underline hover:text-white">{copy.contact_link}</a></p>
  </section>
</article>

<Footer />
