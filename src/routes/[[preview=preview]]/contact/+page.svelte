<script lang="ts">
  import ContentWidth from "$lib/components/ContentWidth/ContentWidth.svelte";
  import Footer from "$lib/components/Footer.svelte";
  import ContactForm from "$lib/components/FullWidth/ContactForm.svelte";
  import type { ActionData, PageData } from "./$types";

  // Success/error now come from the server action result, not a `?success=true`
  // URL param (that was the old Netlify Forms redirect convention).
  let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<section class="bg-light pt-64 pb-32">
  <ContentWidth>
    <h2 class="text-dark w-full text-left">CONTACT US</h2>
    <div class="w-full h-[2px] bg-dark mt-4"></div>
    <div class="w-full flex flex-col-reverse lg:flex-row justify-between py-16">
      <div
        class="mt-12 lg:mt-0 w-full lg:w-1/2 flex flex-col gap-8 text-dark text-[24px] leading-normal"
      >
        <div>We’d love to hear from you.</div>
        <div>
          4903 Golden Quail, Suite 120 <br /> San Antonio, TX 78240
        </div>
        <div>
          Phone: 833.307.4418 <br />
          info@MedicalSolutionsofTX.com
        </div>
      </div>
      <div class="w-full lg:w-1/2">
        <ContactForm {form} formTs={data.formTs} />
      </div>
    </div>
  </ContentWidth>
</section>
<Footer />
