import { error } from "@sveltejs/kit";
import { asText } from "@prismicio/client";

import { createClient } from "$lib/prismicio";

export async function load({ fetch, cookies }) {
  const client = createClient({ fetch, cookies });

  const page = await client.getByUID("page", "process").catch(() => null);

  if (!page) throw error(404, "Page not found");

  return {
    page,
    title: asText(page.data.title),
    meta_description: page.data.meta_description,
    meta_title: page.data.meta_title,
    meta_image: page.data.meta_image?.url ?? null,
  };
}

export function entries() {
  return [{}];
}
