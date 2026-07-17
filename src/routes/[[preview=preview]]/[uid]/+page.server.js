import { error } from "@sveltejs/kit";
import { asText } from "@prismicio/client";

import { createClient } from "$lib/prismicio";

export async function load({ params, fetch, cookies }) {
  const client = createClient({ fetch, cookies });

  const page = await client.getByUID("page", params.uid).catch(() => null);

  if (!page) throw error(404, "Page not found");

  return {
    page,
    title: asText(page.data.title),
    meta_description: page.data.meta_description,
    meta_title: page.data.meta_title,
    meta_image: page.data.meta_image?.url ?? null,
  };
}

// UIDs that have their own dedicated routes — exclude them so they aren't
// prerendered a second time through this catch-all.
const RESERVED_UIDS = ["home", "about", "contact", "partners", "process", "resources"];

// Retired page uids: still present as Prismic docs but no longer public. Excluded
// from prerendering so no dead/empty page ships; `/rep-login` is 301'd to the
// homepage by netlify.toml and dropped from the sitemap.
const RETIRED_UIDS = ["rep-login"];

export async function entries() {
  const client = createClient();

  const pages = await client.getAllByType("page");

  return pages
    .filter((page) => !RESERVED_UIDS.includes(page.uid) && !RETIRED_UIDS.includes(page.uid))
    .map((page) => ({ uid: page.uid }));
}
