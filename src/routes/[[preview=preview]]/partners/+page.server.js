import { error } from "@sveltejs/kit";
import { building, dev } from "$app/env";
import { asText } from "@prismicio/client";

import { createClient } from "$lib/prismicio";
import { loadSingle } from "$lib/content";
import { PARTNERS_COPY, partnersCopy } from "$lib/copy/partners";
import { PARTNERS_LOGOS } from "$lib/copy/partners-logos";

export async function load({ fetch, cookies }) {
  const client = createClient({ fetch, cookies });

  const page = await client.getByUID("page", "partners").catch(() => null);

  if (!page) throw error(404, "Page not found");

  // The page's copy and logos: the partners_page document over today's, field
  // by field ($lib/copy/partners). `vite dev` alone can serve a fixture
  // document, for the smoke test, behind a cookie: a query string is refused
  // on prerendered routes, even in dev.
  const copy = partnersCopy(
    dev && cookies.get("msot-partners-fixture")
      ? /** @type {import("../../../../prismicio-types").PartnersPageDocument} */ (
          (await import("$lib/page-fixture")).pageFixture(
            PARTNERS_COPY,
            [],
            ["logo", "testimonial_logo"],
          )
        )
      : await loadSingle(client, "partners_page", { strict: building }),
    (file) => PARTNERS_LOGOS[file],
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
