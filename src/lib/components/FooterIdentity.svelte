<script lang="ts">
  // The sitewide identity lines (Developer Brief Part 2, §12d), shared by the
  // Footer component and Home's own footer so the two can't drift apart.
  // Server-rendered at every width: the old © line was only drawn above 560px.
  import { PRIVACY_PATH } from "$lib/privacy/policy";
  import { page } from "$app/state";
  import { addressLine } from "$lib/identity";

  const identity = $derived(page.data.identity);

  const year = new Date().getFullYear();
</script>

<div class="label text-white flex flex-col gap-1" data-testid="footer-identity">
  <p class="label font-semibold">{identity.name} ({identity.shortName})</p>
  <p class="label">{identity.businessType} · {identity.tagline}</p>
  <address class="label not-italic">
    {addressLine(identity.address)} ·
    <a href={`tel:${identity.phoneE164}`} class="hover:text-light">{identity.phone}</a> ·
    <a href={`mailto:${identity.email}`} class="hover:text-light [overflow-wrap:anywhere]"
      >{identity.email}</a
    >
  </address>
  <p class="label">UEI {identity.uei} · CAGE {identity.cage} · FSS {identity.fss}</p>
  <p class="label">
    ©{year}
    {identity.legalName} dba {identity.name} |
    <a
      href={PRIVACY_PATH}
      data-testid="footer-privacy-link"
      class="label text-white underline hover:text-light">Privacy Policy</a
    >
  </p>
</div>
