<script lang="ts">
  import { Download } from "@lucide/svelte";
  import BracketButton from "$lib/components/Buttons/BracketButton.svelte";
  import ContentWidth from "$lib/components/ContentWidth/ContentWidth.svelte";
  import Footer from "$lib/components/Footer.svelte";
</script>

<section class="h-96 bg-mid py-10">
  <ContentWidth class="h-full flex flex-col justify-end">
    <h2 class="text-dark">Resources</h2>
  </ContentWidth>
</section>
<section class="bg-mid">
  <ContentWidth class="border-t-2 border-dark flex flex-col md:flex-row py-10">
    <div class="md:w-1/2 pr-12 flex flex-col gap-10 items-start">
      <h3 class="text-dark">CHARGE SHEET</h3>
      <BracketButton class="text-dark" href="/pdfs/MSOT_ChargeSheet.pdf">DOWNLOAD</BracketButton>
    </div>
    <div class="mt-24 md:mt-0 md:w-1/2 pr-12 flex flex-col gap-10 items-start">
      <p
        class="text-dark md:text-[24px] text-sm leading-normal text-pretty break-words hyphens-manual w-full"
      >
        4903 Golden Quail, Suite 120 <br />
        San Antonio, TX 78240 <br /><br />
        Phone: 833.307.4418 <br />
        customerservice&shy;@MedicalSolutionsofTX.com
      </p>
      <BracketButton class="text-dark" href="/contact">Contact Us</BracketButton>
    </div>
  </ContentWidth>
</section>
<section class="bg-mid pt-24">
  <ContentWidth class="flex flex-col md:flex-row justify-between py-10">
    <div class="md:w-[calc(33%-20px)] flex flex-col mt-12 md:mt-0">
      <h3 class="text-dark mb-14">Catalogs</h3>
      <div
        class="text-dark w-full border-t-2 border-dark flex flex-row justify-between items-center py-5"
      >
        <a href="/pdfs/MSOT_FSSCatalog.pdf" class="bump" target="_blank" rel="noopener noreferrer">
          <h4 class="text-dark hover:opacity-90 transition-opacity">
            FSS Catalog (Contract # 36F79725D0204)
          </h4>
        </a>
        <a
          href="/pdfs/MSOT_FSSCatalog.pdf"
          class="negative-bump"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Download
            size={24}
            strokeWidth={1.5}
            class="text-dark opacity-40 hover:opacity-90 transition-opacity"
          />
        </a>
      </div>
      <div
        class="text-dark w-full border-t-2 border-dark flex flex-row justify-between items-center py-5"
      >
        <a
          href="/pdfs/MSOT_CommercialCatalog.pdf"
          class="bump"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h4 class="text-dark hover:opacity-90 transition-opacity">Commercial Catalog</h4>
        </a>
        <a
          href="/pdfs/MSOT_CommercialCatalog.pdf"
          class="negative-bump"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Download
            size={24}
            strokeWidth={1.5}
            class="text-dark opacity-40 hover:opacity-90 transition-opacity"
          />
        </a>
      </div>
    </div>
    <div class="md:w-[calc(33%-20px)] flex flex-col mt-12 md:mt-0 pointer-events-none">
      <h3 class="text-dark mb-14">Suppliers</h3>
      <div
        class="text-dark/65 w-full border-t-2 border-dark flex flex-row justify-between items-center py-5"
      >
        <a
          href="/pdfs/MSOT_CommercialCatalog.pdf"
          class="bump"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h4 class=" hover:opacity-90 transition-opacity">Catalog</h4>
        </a>
        <a
          href="/pdfs/MSOT_CommercialCatalog.pdf"
          class="negative-bump"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Download
            size={24}
            strokeWidth={1.5}
            class="opacity-0 hover:opacity-90 transition-opacity"
          />
        </a>
      </div>
    </div>
    <div class="md:w-[calc(33%-20px)] flex flex-col mt-12 md:mt-0 pointer-events-none">
      <h3 class="text-dark mb-14">Technique Guides</h3>

      <div
        class="text-dark/65 w-full border-t-2 border-dark flex flex-row justify-between items-center py-5"
      >
        <a href="/" class="bump" target="_blank" rel="noopener noreferrer">
          <h4 class=" hover:opacity-90 transition-opacity">Technique Guide</h4>
        </a>
        <a href="/" class="negative-bump" target="_blank" rel="noopener noreferrer">
          <Download
            size={24}
            strokeWidth={1.5}
            class="opacity-0 hover:opacity-90 transition-opacity"
          />
        </a>
      </div>
    </div>
  </ContentWidth>
</section>
<Footer />
