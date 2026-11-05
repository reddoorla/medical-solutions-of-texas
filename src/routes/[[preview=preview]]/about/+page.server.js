import { error } from "@sveltejs/kit";
import { dev } from "$app/env";
import { asText } from "@prismicio/client";

import { createClient } from "$lib/prismicio";

export async function load({ fetch, cookies, url }) {
  const client = createClient({ fetch, cookies });

  const page = await client.getByUID("page", "about").catch(() => null);

  if (!page) throw error(404, "Page not found");

  // The team's Prismic documents (team_member). Until the model and the first
  // documents exist, this is empty and the page shows today's cards. The page
  // is prerendered, so a published change shows on the next build. No catch:
  // a type with no documents answers an empty list, so an error here is a real
  // failure, and the build should stop rather than quietly ship old cards.
  // `vite dev` alone can serve a fixture, for the smoke test.
  const team =
    dev && url.searchParams.has("team-fixture")
      ? (await import("$lib/team-fixture")).TEAM_FIXTURE
      : await client.getAllByType("team_member", {
          orderings: [{ field: "my.team_member.order", direction: "asc" }],
        });

  return {
    page,
    title: asText(page.data.title),
    meta_description: page.data.meta_description,
    meta_title: page.data.meta_title,
    meta_image: page.data.meta_image?.url ?? null,
    team,
  };
}

export function entries() {
  return [{}];
}
