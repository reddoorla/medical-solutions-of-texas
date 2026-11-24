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
  // "answers-2026-11-23" serves today's two questions and Marketing's five new
  // ones ($lib/fixtures/process-faq-2026-11-23), every other field empty.
  const fixture = dev ? cookies.get("msot-process-fixture") : undefined;
  const copy = processCopy(
    fixture
      ? fixture === "empty"
        ? (await import("$lib/empty-fixture")).emptyFixture("process_page")
        : fixture === "answers-2026-11-23"
          ? await answersFixture()
          : /** @type {import("../../../../prismicio-types").ProcessPageDocument} */ (
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

/** @returns {Promise<import("../../../../prismicio-types").ProcessPageDocument>} */
async function answersFixture() {
  const doc = (await import("$lib/empty-fixture")).emptyFixture("process_page");
  const { PROCESS_FAQ_2026_11_23 } = await import("$lib/fixtures/process-faq-2026-11-23");
  const today = PROCESS_COPY.faq.map((r) => ({
    question: r.question,
    answer: [{ type: "paragraph", text: r.answer, spans: [] }],
  }));
  return /** @type {any} */ ({
    ...doc,
    data: { ...doc.data, faq: [...today, ...PROCESS_FAQ_2026_11_23] },
  });
}

export function entries() {
  return [{}];
}
