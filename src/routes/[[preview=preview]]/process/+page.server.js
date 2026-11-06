import { error } from "@sveltejs/kit";
import { building, dev } from "$app/env";
import { asText } from "@prismicio/client";

import { createClient } from "$lib/prismicio";
import { loadSingle } from "$lib/content";
import { PROCESS_COPY, processCopy } from "$lib/copy/process";

export async function load({ fetch, cookies }) {
  const client = createClient({ fetch, cookies });

  const page = await client.getByUID("page", "process").catch(() => null);

  if (!page) throw error(404, "Page not found");

  // The page's copy: the process_page document over today's wording, field by
  // field ($lib/copy/process). `vite dev` alone can serve a fixture document,
  // for the smoke test, behind a cookie: a query string is refused on
  // prerendered routes, even in dev.
  const copy = processCopy(
    dev && cookies.get("msot-process-fixture")
      ? /** @type {import("../../../../prismicio-types").ProcessPageDocument} */ (
          (await import("$lib/page-fixture")).pageFixture(PROCESS_COPY, ["answer"])
        )
      : await loadSingle(client, "process_page", { strict: building }),
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
