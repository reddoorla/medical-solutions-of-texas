import { error } from "@sveltejs/kit";
import { asText } from "@prismicio/client";

import { createClient } from "$lib/prismicio";
import { loadPartnersCopy } from "$lib/copy/partners-load";

export async function load({ fetch, cookies }) {
  const client = createClient({ fetch, cookies });

  const page = await client.getByUID("page", "partners").catch(() => null);

  if (!page) throw error(404, "Page not found");

  // The page's copy and logos: the partners_page document over today's, field
  // by field ($lib/copy/partners-load).
  const copy = await loadPartnersCopy(client, cookies);

  return {
    page,
    title: asText(page.data.title),
    meta_description: page.data.meta_description,
    meta_title: page.data.meta_title,
    meta_image: page.data.meta_image?.url ?? null,
    copy,
  };
}

export function entries() {
  return [{}];
}
