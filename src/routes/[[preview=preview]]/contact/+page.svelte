<script lang="ts">
  import ContentWidth from "$lib/components/ContentWidth/ContentWidth.svelte";
  import Footer from "$lib/components/Footer.svelte";
  import ContactForm from "$lib/components/FullWidth/ContactForm.svelte";
  import type { ActionData, PageData } from "./$types";

  // Success/error now come from the server action result, not a `?success=true`
  // URL param (that was the old Netlify Forms redirect convention).
  let { data, form }: { data: PageData; form: ActionData } = $props();
  const identity = $derived(data.identity);
</script>

<section class="bg-light pt-64 pb-32">
  <ContentWidth>
    <h1 class="h2 text-dark w-full text-left">CONTACT US</h1>
    <div class="w-full h-[2px] bg-dark mt-4"></div>
    <div class="w-full flex flex-col-reverse lg:flex-row justify-between py-16">
      <div
        class="mt-12 lg:mt-0 w-full lg:w-1/2 flex flex-col gap-8 text-dark text-[24px] leading-normal"
      >
        <div>We’d love to hear from you.</div>
        <address class="not-italic flex flex-col gap-8">
          <div>
            {identity.address.street} <br />
            {identity.address.city}, {identity.address.region}
            {identity.address.postalCode}
          </div>
          <div>
            Phone: <a href={`tel:${identity.phoneE164}`}>{identity.phone}</a> <br />
            <a href={`mailto:${identity.email}`}>{identity.email}</a>
          </div>
        </address>
      </div>
      <div class="w-full lg:w-1/2">
        <ContactForm {form} formTs={data.formTs} />
      </div>
    </div>
  </ContentWidth>
</section>
<Footer />
