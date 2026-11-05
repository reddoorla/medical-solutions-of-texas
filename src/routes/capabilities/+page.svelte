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

  const PROOF = [
    { figure: "45 working days or less", line: "to contract. Industry average: 120+" },
    { figure: "39 federal locations", line: "served across 16 states" },
    { figure: "8,579 med-surg line items", line: "added to ECAT each month" },
  ];

  const CAPABILITIES = [
    "Federal contract access through ECAT, FSS and DAPA",
    "Government sales strategy for VA and DoW",
    "Product marketing and contracting",
    "Clinical product evaluation and approval support",
    "Pricing strategy and direct invoicing",
    "Dedicated Government Account Coordinators",
  ];

  // The numbers come from $lib/identity, the same list the footer and the
  // Organization markup read; the order and notes are the PDF's.
  const identity = $derived(page.data.identity);
  const [ecatJit, ecatDvd, dapaMed, dapaEquip] = $derived(identity.contracts);
  const VEHICLES = $derived([
    { vehicle: "ECAT", number: ecatJit.value, note: "Just in Time" },
    { vehicle: "ECAT", number: ecatDvd.value, note: "Direct Vendor Delivery" },
    { vehicle: "FSS", number: identity.fss, note: "VA Schedule 65 II A" },
    { vehicle: "DAPA", number: dapaMed.value, note: "Medical/Surgical" },
    { vehicle: "DAPA", number: dapaEquip.value, note: "Equipment" },
    // A vehicle Marketing adds in the settings document, past today's four.
    ...identity.contracts.slice(4).map((c) => ({ vehicle: c.label, number: c.value, note: "" })),
  ]);

  const DESIGNATIONS = [
    { scope: "Federal", items: ["VOSB (Veteran-Owned Small Business)", "Small Business"] },
    {
      scope: "SCTRCA",
      items: [
        "VBE: Veteran Business Enterprise",
        "ESBE: Emerging Small Business",
        "SBE: Small Business Entity",
      ],
    },
  ];
</script>

<article
  data-testid="capabilities"
  class="max-w-2xl mx-auto px-8 pt-48 pb-24 space-y-8 text-light text-left text-lg [&_p]:text-lg [&_p]:leading-7"
>
  <header class="space-y-2">
    <p class="label uppercase tracking-widest">Veteran-Owned Small Business</p>
    <h1 class="text-4xl font-bold text-white">Capabilities Statement</h1>
  </header>

  <section class="space-y-3">
    <h2 class="text-2xl font-semibold text-white">Mission</h2>
    <p>Connecting VA and DoW treatment facilities with med-surg suppliers.</p>
    <p>
      We bridge the gap between clinical demand and government procurement to support service
      members and veterans. Our expertise, VOSB (Veteran-Owned Small Business) status and deep
      network of relationships let us offer solutions where others hit roadblocks.
    </p>
  </section>

  <section class="space-y-3">
    <h2 class="text-2xl font-semibold text-white">By the numbers</h2>
    <ul class="space-y-2">
      {#each PROOF as p (p.figure)}
        <li><strong class="text-white">{p.figure}</strong> {p.line}</li>
      {/each}
    </ul>
  </section>

  <section class="space-y-3">
    <h2 class="text-2xl font-semibold text-white">Core capabilities</h2>
    <ul class="list-disc pl-6 space-y-1">
      {#each CAPABILITIES as c (c)}<li>{c}</li>{/each}
    </ul>
  </section>

  <section class="space-y-3">
    <h2 class="text-2xl font-semibold text-white">Contract vehicles</h2>
    <dl class="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1">
      {#each VEHICLES as v, i (i)}
        <dt class="text-white">{v.vehicle}</dt>
        <dd>{v.note ? `${v.number} · ${v.note}` : v.number}</dd>
      {/each}
    </dl>
  </section>

  <section class="space-y-3">
    <h2 class="text-2xl font-semibold text-white">Company data</h2>
    <dl class="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1">
      <dt class="text-white">Legal name</dt>
      <dd>{identity.legalName}, DBA {identity.name}</dd>
      <dt class="text-white">UEI</dt>
      <dd>{identity.uei}</dd>
      <dt class="text-white">CAGE</dt>
      <dd>{identity.cage}</dd>
      <dt class="text-white">NAICS</dt>
      <dd>{identity.naics} (primary), 339112, 339113</dd>
    </dl>
  </section>

  <section class="space-y-3">
    <h2 class="text-2xl font-semibold text-white">Designations</h2>
    <dl class="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1">
      {#each DESIGNATIONS as d (d.scope)}
        <dt class="text-white">{d.scope}</dt>
        <dd>{d.items.join(" · ")}</dd>
      {/each}
    </dl>
  </section>

  <section class="space-y-3">
    <h2 class="text-2xl font-semibold text-white">What makes us different</h2>
    <p>
      We are defined by expertise and experience. With 20 years of Air Force logistics and nearly 50
      years in medical device sales on our leadership team, we know the VA and Department of War
      (DoW) healthcare landscape better than anyone. We help med-surg suppliers find and access
      opportunities they couldn't reach alone.
    </p>
  </section>

  <section class="space-y-3">
    <h2 class="text-2xl font-semibold text-white">Contact</h2>
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
      · medicalsolutionsoftx.com<br />
      {addressLine(identity.address)}
    </address>
    <p><a href="/contact" class="underline hover:text-white">Contact us</a></p>
  </section>
</article>

<Footer />
