import { error } from "@sveltejs/kit";
import { building, dev } from "$app/env";
import { asText } from "@prismicio/client";

import { createClient } from "$lib/prismicio";
import { loadSingle } from "$lib/content";
import { RESOURCES_COPY, resourcesCopy } from "$lib/copy/resources";

export async function load({ fetch, cookies, parent }) {
  const client = createClient({ fetch, cookies });

  const page = await client.getByUID("page", "resources").catch(() => null);

  if (!page) throw error(404, "Page not found");

  // The page's copy and files: the resources_page document over today's, field
  // by field ($lib/copy/resources); the FSS number is `settings`'. `vite dev`
  // alone can serve a fixture document, for the smoke test, behind a cookie: a
  // query string is refused on prerendered routes, even in dev.
  const { identity } = await parent();
  const copy = resourcesCopy(
    dev && cookies.get("msot-resources-fixture")
      ? cookies.get("msot-resources-fixture") === "empty"
        ? (await import("$lib/empty-fixture")).emptyFixture("resources_page")
        : /** @type {import("../../../../prismicio-types").ResourcesPageDocument} */ (
            (await import("$lib/page-fixture")).pageFixture(
              RESOURCES_COPY,
              [],
              [],
              ["file", "charge_file"],
            )
          )
      : await loadSingle(client, "resources_page", { strict: building }),
    identity.fss,
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
