import { building, dev } from "$app/env";

import { createClient } from "$lib/prismicio";
import { loadSingle } from "$lib/content";
import { PRIVACY_BODIES, PRIVACY_COPY, privacyCopy } from "$lib/copy/privacy";
import { PRIVACY_POLICY_DRAFT } from "$lib/privacy/policy";
import type { PrivacyPageDocument } from "../../../../prismicio-types";
import type { PageServerLoad } from "./$types";

// The policy's words: the privacy_page document over today's, field by field
// ($lib/copy/privacy). It has no `page` document, so its SEO title and
// description are this type's too: empty, they are null and the layout keeps
// $lib/seo's. `vite dev` alone can serve a fixture document, for the smoke
// test, behind a cookie: a query string is refused on prerendered routes.
// /privacy is prerendered (entries below); /preview/privacy is rendered per
// request, so Marketing can see a draft, and there an error falls back.
export const load: PageServerLoad = async ({ fetch, cookies }) => {
  const client = createClient({ fetch, cookies });
  const copy = privacyCopy(
    dev && cookies.get("msot-privacy-fixture")
      ? ((await import("$lib/privacy/fixture")).privacyFixture(
          PRIVACY_COPY,
          PRIVACY_BODIES,
        ) as unknown as PrivacyPageDocument)
      : await loadSingle<PrivacyPageDocument>(client, "privacy_page", { strict: building }),
  );
  return {
    noindex: PRIVACY_POLICY_DRAFT,
    copy,
    meta_title: copy.meta_title,
    meta_description: copy.meta_description,
  };
};

export function entries() {
  return [{}];
}
