<script lang="ts">
  import { enhance } from "$app/forms";
  import StyledSingleSelect from "./StyledSingleSelect.svelte";
  import BracketButton from "../Buttons/BracketButton.svelte";

  interface Props {
    PRODUCTS?: string[];
    form?: { success?: boolean; error?: string } | null;
    formTs?: number;
  }

  let {
    PRODUCTS = ["VA Contracts", "DoD Contracts", "Both"],
    form = null,
    formTs,
  }: Props = $props();

  type SelectOption = {
    index?: number;
    value?: string;
    label?: string;
  };

  let selectValue: SelectOption = $state({
    index: 0,
    value: "Select Interest",
    label: "Select Interest",
  });

  let submitting = $state(false);
</script>

{#if form?.success}
  <div class="border border-dark rounded-[3px] p-6 text-dark" role="status" aria-live="polite">
    <p class="text-[24px] leading-normal">Thank you — your message has been sent.</p>
    <p class="mt-2">We’ll be in touch shortly.</p>
  </div>
{:else}
  <!--
    Forwards to the central dashboard ingest via createIngestAction; spam is
    handled by the hidden honeypot + a fill-timing screen (no Netlify Forms).
    Requires FORMS_INGEST_URL + FORMS_INGEST_TOKEN in the deployed site's env.
  -->
  <form
    class="w-full flex flex-col gap-4"
    method="POST"
    use:enhance={() => {
      submitting = true;
      return async ({ update }) => {
        await update();
        submitting = false;
      };
    }}
  >
    {#if form?.error}
      <p class="border border-dark rounded-[3px] p-4 text-dark" role="alert">
        {form.error}
      </p>
    {/if}

    <!-- Anti-bot: per-request timing token + a hidden honeypot. -->
    <input type="hidden" name="ts" value={formTs} />
    <p hidden>
      <label>Don’t fill this out if you’re human: <input name="bot-field" /></label>
    </p>

    <div class="flex flex-col md:flex-row text-light items-center justify-center w-full">
      <div class="flex flex-col gap-4 md:flex-row justify-between w-full">
        <label class="w-full md:w-[calc(50%-15px)]">
          <span class="sr-only">Email</span>
          <input
            class="w-full border rounded-[3px] text-dark border-light h-10 pl-4 pt-[2.5px]"
            name="email"
            placeholder="Email"
            type="email"
            required
          />
        </label>
        <label class="w-full md:w-[calc(50%-15px)]">
          <span class="sr-only">Your Name / Company</span>
          <input
            class="w-full border rounded-[3px] text-dark border-light h-10 pl-4 pt-[2.5px]"
            name="name"
            placeholder="Your Name / Company"
            type="text"
          />
        </label>
      </div>
    </div>
    <StyledSingleSelect placeholder="Select Interest" items={PRODUCTS} bind:value={selectValue} />
    <input name="select" type="text" bind:value={selectValue.value} hidden />

    <label>
      <span class="sr-only">Your Message</span>
      <textarea
        class="w-full border rounded-[3px] text-dark border-light h-48 pl-4 pt-2"
        placeholder="Your Message"
        name="message"
        required
      ></textarea>
    </label>

    <div class="w-fit transition-opacity {submitting ? 'pointer-events-none opacity-60' : ''}">
      <BracketButton type="submit" class="text-dark">
        {submitting ? "Sending…" : "Submit"}
      </BracketButton>
    </div>
  </form>
{/if}
