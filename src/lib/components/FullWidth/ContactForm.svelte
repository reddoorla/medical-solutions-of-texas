<script lang="ts">
  import StyledSingleSelect from "./StyledSingleSelect.svelte";
  import BracketButton from "../Buttons/BracketButton.svelte";

  interface Props {
    PRODUCTS?: string[];
  }

  let { PRODUCTS = ["VA Contracts", "DoD Contracts", "Both"] }: Props = $props();

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
</script>

<form
  class="w-full flex flex-col gap-4"
  name="contact"
  method="post"
  action="/contact?success=true"
  netlify
  netlify-honeypot="bot-field"
>
  <input type="hidden" name="form-name" value="contact" />

  <!-- Netlify honeypot: hidden from humans, bots fill it and get filtered. -->
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

  <div class="w-16">
    <BracketButton type="submit" class="text-dark">Submit</BracketButton>
  </div>
</form>
