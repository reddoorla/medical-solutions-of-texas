import { building, dev } from "$app/env";

import { createClient } from "$lib/prismicio";
import { loadSingle } from "$lib/content";
import { CAPABILITIES_COPY, capabilitiesCopy } from "$lib/copy/capabilities";
import type { CapabilitiesPageDocument } from "../../../../prismicio-types";
import type { PageServerLoad } from "./$types";

// The page's words: the capabilities_page document over today's, field by
// field ($lib/copy/capabilities). It has no `page` document, so its SEO title
// and description are this type's too: empty, they are null and the layout
// keeps $lib/seo's. `vite dev` alone can serve a fixture document, for the
// smoke test, behind a cookie: a query string is refused on prerendered routes.
// /capabilities is prerendered (entries below); /preview/capabilities is
// rendered per request, so Marketing can see a draft, and there an error falls
// back.
export const load: PageServerLoad = async ({ fetch, cookies }) => {
  const client = createClient({ fetch, cookies });
  const copy = capabilitiesCopy(
    dev && cookies.get("msot-capabilities-fixture")
      ? ((await import("$lib/page-fixture")).pageFixture(
          CAPABILITIES_COPY,
        ) as unknown as CapabilitiesPageDocument)
      : await loadSingle<CapabilitiesPageDocument>(client, "capabilities_page", {
          strict: building,
        }),
  );
  return { copy, meta_title: copy.meta_title, meta_description: copy.meta_description };
};

export function entries() {
  return [{}];
}
