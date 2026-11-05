<script lang="ts">
  import { enhance } from "$app/forms";
  import * as env from "$app/env/public";
  import { loadTurnstile } from "$lib/turnstile";
  import dropdownArrow from "$lib/assets/icons/dropdown-arrow-light.svg";
  import BracketButton from "../Buttons/BracketButton.svelte";

  interface Props {
    PRODUCTS?: string[];
    form?: { success?: boolean; error?: string } | null;
    formTs?: number;
  }

  let {
    PRODUCTS = ["VA Contracts", "DoW Contracts", "Both"],
    form = null,
    formTs,
  }: Props = $props();

  let submitting = $state(false);

  // Marketing's conversion event (Developer Brief Part 1, §3): pushed only after
  // a successful send, with no personal data. GTM's "CE – Contact Submit"
  // trigger reads it. Sending the form takes a click or a key, so Tag Manager
  // has started loading by then; if it hasn't finished, the event waits in
  // dataLayer and GTM reads it when it does.
  function pushContactSubmit() {
    const w = window as unknown as { dataLayer?: unknown[] };
    w.dataLayer = w.dataLayer || [];
    w.dataLayer.push({ event: "msot_contact_submit", form_name: "contact" });
  }

  // The server screens out spam with a decoy success: a filled honeypot, or a
  // send under 800ms after the form was served (createIngestAction's
  // MIN_FILL_MS). Neither may count as a conversion, so the same two screens
  // run here. The client measures from when the form appeared, which is later
  // than when the server stamped it, so a send that passes here passes there.
  const MIN_FILL_MS = 800;
  let shownAt = 0;
  $effect(() => {
    shownAt = performance.now();
  });
  const screenedOut = (formData: FormData) =>
    String(formData.get("bot-field") ?? "").trim() !== "" ||
    performance.now() - shownAt < MIN_FILL_MS;

  // Optional Cloudflare Turnstile — dark until PUBLIC_TURNSTILE_SITE_KEY is set;
  // rendered explicitly (works on full load + SPA nav). createIngestAction reads
  // the injected cf-turnstile-response input and forwards it for central verify.
  const turnstileSiteKey = env.PUBLIC_TURNSTILE_SITE_KEY?.trim();
  let turnstileEl = $state<HTMLDivElement>();

  $effect(() => {
    const el = turnstileEl;
    if (!turnstileSiteKey || !el) return;
    let widgetId: string | undefined;
    let cancelled = false;
    loadTurnstile()
      .then((turnstile) => {
        if (cancelled || !el.isConnected) return;
        widgetId = turnstile.render(el, { sitekey: turnstileSiteKey });
      })
      .catch((err) => {
        console.warn("[turnstile] widget did not render:", err);
      });
    return () => {
      cancelled = true;
      if (widgetId !== undefined) {
        try {
          window.turnstile?.remove(widgetId);
        } catch {
          // already torn down (e.g. by navigation)
        }
      }
    };
  });
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
    use:enhance={({ formData }) => {
      submitting = true;
      // The fleet's form-e2e probe marks its submissions testMode=true; it
      // must never count as a LinkedIn conversion.
      const probe = formData.get("testMode") === "true";
      const spam = screenedOut(formData);
      return async ({ result, update }) => {
        await update();
        submitting = false;
        if (result.type === "success" && !probe && !spam) pushContactSubmit();
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
    <!--
      A native select, replacing svelte-select (2026-11-03). The placeholder
      option is `hidden`, not `disabled`, so an untouched form still sends
      select=Select Interest, as the svelte-select version's hidden input did.
    -->
    <label class="group relative block w-full">
      <span class="sr-only">Interest</span>
      <select
        name="select"
        class="block w-full h-[42px] appearance-none cursor-pointer rounded-[3px] border border-transparent bg-white/80 pl-4 pr-[42px] text-dark"
      >
        <option value="Select Interest" selected hidden>Select Interest</option>
        {#each PRODUCTS as product (product)}
          <option value={product}>{product}</option>
        {/each}
      </select>
      <span
        class="absolute h-full aspect-square right-0 top-0 flex items-center justify-center pointer-events-none"
        aria-hidden="true"
      >
        <img
          src={dropdownArrow}
          alt=""
          class="transition-all group-hover:opacity-55 group-focus-within:opacity-55"
        />
      </span>
    </label>

    <label>
      <span class="sr-only">Your Message</span>
      <textarea
        class="w-full border rounded-[3px] text-dark border-light h-48 pl-4 pt-2"
        placeholder="Your Message"
        name="message"
        required></textarea>
    </label>

    {#if turnstileSiteKey}
      <!-- Cloudflare Turnstile mount point; the effect renders it explicitly and
           injects a hidden cf-turnstile-response input that createIngestAction forwards. -->
      <div class="cf-turnstile" bind:this={turnstileEl}></div>
    {/if}

    <div class="w-fit transition-opacity {submitting ? 'pointer-events-none opacity-60' : ''}">
      <BracketButton type="submit" class="text-dark">
        {submitting ? "Sending…" : "Submit"}
      </BracketButton>
    </div>
  </form>
{/if}
