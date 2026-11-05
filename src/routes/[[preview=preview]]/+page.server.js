import { error } from "@sveltejs/kit";
import { building, dev } from "$app/env";
import { asText } from "@prismicio/client";

import { createClient } from "$lib/prismicio";
import { loadSingle } from "$lib/content";
import { homeCopy } from "$lib/copy/home";

export async function load({ fetch, cookies }) {
  const client = createClient({ fetch, cookies });

  const page = await client.getByUID("page", "home").catch(() => null);

  if (!page) throw error(404, "Page not found");

  // The page's copy: the home_page document over today's wording, field by
  // field. With no document yet, today's wording ($lib/copy/home). `vite dev`
  // alone can serve a fixture document, for the smoke test, behind a cookie: a
  // query string is refused on prerendered routes, even in dev.
  const copy = homeCopy(
    dev && cookies.get("msot-home-fixture")
      ? (await import("$lib/home-fixture")).HOME_FIXTURE
      : await loadSingle(client, "home_page", { strict: building }),
  );

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
