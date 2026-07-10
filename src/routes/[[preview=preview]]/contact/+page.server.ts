import { error } from "@sveltejs/kit";
import { asText } from "@prismicio/client";
import { env } from "$env/dynamic/private";
import { createIngestAction } from "@reddoorla/maintenance/forms";

import { createClient } from "$lib/prismicio";
import type { Actions, PageServerLoad } from "./$types";

// The root layout sets `prerender = "auto"`; a form `action` cannot run on a
// prerendered route ("Cannot prerender pages with actions"). Opt out — this
// route is genuinely dynamic. (The old self-`entries()` is dropped: a route
// can't both prerender-via-entries and be `prerender = false`.)
export const prerender = false;

export const load: PageServerLoad = async ({ fetch, cookies }) => {
  const client = createClient({ fetch, cookies });

  const page = await client.getByUID("page", "contact").catch(() => null);

  if (!page) throw error(404, "Page not found");

  return {
    page,
    title: asText(page.data.title),
    meta_description: page.data.meta_description,
    meta_title: page.data.meta_title,
    meta_image: page.data.meta_image?.url ?? null,
    // Per-request timestamp for the bot timing screen.
    formTs: Date.now(),
  };
};

export const actions: Actions = {
  default: createIngestAction({
    formType: "contact",
    getConfig: () => ({
      url: env.FORMS_INGEST_URL,
      token: env.FORMS_INGEST_TOKEN,
    }),
    buildPayload: (form, event) => ({
      name: form.get("name")?.toString(),
      email: form.get("email")?.toString(),
      message: form.get("message")?.toString(),
      // Non-standard key → folds into extraFields, rendered in the notify email.
      interest: form.get("select")?.toString() || undefined,
      // Full URL incl. query string so UTM/campaign params (?utm_source=…) are captured.
      sourceUrl: event.url.href,
      // Synthetic end-to-end probe marker (the fleet `form-e2e` audit). Forwarded
      // ONLY when the submitted form carries testMode=true — a real visitor never
      // sets it. Rides through as an extraField (no schema change); central ingest
      // recognizes it and routes the submission away from every real sink.
      testMode: form.get("testMode")?.toString() === "true" || undefined,
    }),
  }),
};
