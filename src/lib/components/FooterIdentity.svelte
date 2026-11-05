<script lang="ts">
  // The sitewide identity lines (Developer Brief Part 2, §12d, with §12b's
  // definition sentence "as the footer description"), shared by the
  // Footer component and Home's own footer so the two can't drift apart.
  // Server-rendered at every width: the old © line was only drawn above 560px.
  import { PRIVACY_PATH } from "$lib/privacy/policy";
  import { IDENTITY, ADDRESS_LINE, DEFINITION } from "$lib/identity";

  const year = new Date().getFullYear();
</script>

<div class="label text-white flex flex-col gap-1" data-testid="footer-identity">
  <p class="label font-semibold">{IDENTITY.name} ({IDENTITY.shortName})</p>
  <p class="label" data-testid="footer-definition">{DEFINITION}</p>
  <p class="label">{IDENTITY.businessType} · {IDENTITY.tagline}</p>
  <address class="label not-italic">
    {ADDRESS_LINE} ·
    <a href={`tel:${IDENTITY.phoneE164}`} class="hover:text-light">{IDENTITY.phone}</a> ·
    <a href={`mailto:${IDENTITY.email}`} class="hover:text-light [overflow-wrap:anywhere]"
      >{IDENTITY.email}</a
    >
  </address>
  <p class="label">UEI {IDENTITY.uei} · CAGE {IDENTITY.cage} · FSS {IDENTITY.fss}</p>
  <p class="label">
    ©{year}
    {IDENTITY.legalName} dba {IDENTITY.name} |
    <a
      href={PRIVACY_PATH}
      data-testid="footer-privacy-link"
      class="label text-white underline hover:text-light">Privacy Policy</a
    >
  </p>
</div>
