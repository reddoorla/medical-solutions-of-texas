// One loader for the partners_page document, for both pages that show it:
// Partners itself, and Home, whose "Our Partner" box shows Partners' quote, logo and
// company name (the operator, 11-06: "Home reads Partners'", so the quote has
// one place to edit). `vite dev` alone can serve a fixture document, for the
// smoke tests, behind a cookie: a query string is refused on prerendered
// routes, even in dev.
import { building, dev } from "$app/env";

import { loadSingle } from "$lib/content";
import { PARTNERS_COPY, partnersCopy } from "$lib/copy/partners";
import { PARTNERS_LOGOS } from "$lib/copy/partners-logos";

/**
 * Partners' copy and logos: the partners_page document over today's, field by
 * field ($lib/copy/partners).
 *
 * @param {import("@prismicio/client").Client} client
 * @param {{ get(name: string): string | undefined }} cookies
 */
export async function loadPartnersCopy(client, cookies) {
  return partnersCopy(
    dev && cookies.get("msot-partners-fixture")
      ? cookies.get("msot-partners-fixture") === "empty"
        ? (await import("$lib/empty-fixture")).emptyFixture("partners_page")
        : /** @type {import("../../../prismicio-types").PartnersPageDocument} */ (
            (await import("$lib/page-fixture")).pageFixture(
              PARTNERS_COPY,
              [],
              ["logo", "testimonial_logo"],
            )
          )
      : await loadSingle(client, "partners_page", { strict: building }),
    (file) => PARTNERS_LOGOS[file],
  );
}
