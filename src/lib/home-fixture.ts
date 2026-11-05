// A `home_page` document for the smoke test of Home's Prismic path
// (tests/smoke/home-copy.spec.ts), served only by `vite dev` to a request
// carrying the `msot-home-fixture` cookie. The prerendered site never reads it:
// Home's server load checks `dev` first, which is false in every build. Every
// field reads "Fixture <field>" (a heading's lines "Fixture <field> 1", "… 2"),
// so a page showing one can only have read the document.
import type { HomePageDocument } from "../../prismicio-types";
import { HOME_COPY } from "./copy/home";

export const HOME_FIXTURE = {
  data: Object.fromEntries(
    Object.entries(HOME_COPY).map(([field, today]) => [
      field,
      Array.isArray(today)
        ? [
            {
              type: "paragraph",
              text: today.map((_, i) => `Fixture ${field} ${i + 1}`).join("\n"),
              spans: [],
            },
          ]
        : `Fixture ${field}`,
    ]),
  ),
} as unknown as HomePageDocument;
