import { building, dev } from "$app/env";
import { createClient } from "$lib/prismicio";
import { loadSettings, mergeIdentity } from "$lib/identity";
import { CHROME_COPY, chromeCopy } from "$lib/copy/chrome";

export const prerender = "auto";

export const load = async ({ cookies, fetch }) => {
  // An active Prismic preview session is signalled by this cookie: editors who
  // arrive via a Prismic preview link have it set, normal visitors never do. We
  // only mount the Prismic toolbar for previewers (the toolbar sets ~21
  // third-party cookies that otherwise hit every visitor and fail Lighthouse).
  const isPreviewSession = !!cookies.get("io.prismic.preview");

  // Who MSOT is ($lib/identity): the `settings` document over today's wording,
  // field by field. Read once here so every page, footer and error page shows
  // the same values. Prerendered pages fetch it at build time. `vite dev` alone
  // can serve a fixture document, for the smoke test, behind a cookie: a query
  // string is refused on the routes that set `prerender = true`, even in dev.
  const settings =
    dev && cookies.get("msot-settings-fixture")
      ? (await import("$lib/settings-fixture")).SETTINGS_FIXTURE
      : await loadSettings(createClient({ fetch, cookies }), { strict: building });
  const identity = mergeIdentity(settings);
  // The menu and footer words come from the same document ($lib/copy/chrome).
  // Their fixture has its own cookie, so the identity's test is unchanged.
  const chrome = chromeCopy(
    dev && cookies.get("msot-chrome-fixture")
      ? /** @type {import("../../prismicio-types").SettingsDocument} */ (
          (await import("$lib/page-fixture")).pageFixture(CHROME_COPY)
        )
      : settings,
  );

  return {
    isPreviewSession,
    identity,
    chrome,
  };
};
