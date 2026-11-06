import { test, expect } from "@playwright/test";
import { PRIVACY_BODIES, PRIVACY_COPY, privacyCopy } from "../../src/lib/copy/privacy";
import { PAGE_SEO } from "../../src/lib/seo";
import type { PrivacyPageDocument } from "../../prismicio-types";

// The privacy policy's copy moves into Prismic's `privacy_page` singleton (the
// operator, 11-05: "all content should be in prismic, not in code"). Every
// heading falls back to today's wording when the document leaves it empty, and
// every section body to today's markup; a missing document changes nothing.
// Today's wording is written out here, not read from src/lib/copy/privacy.ts,
// so a wrong value there fails. tests/smoke/privacy.spec.ts still pins the
// body's wording and the settings values in it.

const doc = (data: Record<string, unknown>) => ({ data }) as unknown as PrivacyPageDocument;
const HEADINGS = [
  "What we collect",
  "How we use it",
  "Who else receives it",
  "Do Not Track",
  "Children",
  "Your choices",
  "Changes to this policy",
];
const para = (text: string) => [{ type: "paragraph", text, spans: [] }];

test("privacyCopy: no document is today's wording; a filled field wins, field by field", () => {
  const today = privacyCopy(null);
  expect([today.meta_title, today.meta_description]).toEqual([null, null]);
  expect([today.heading, today.effective_label, today.effective_date]).toEqual([
    "Privacy Policy",
    "Effective",
    "2026-11-04",
  ]);
  expect(
    ["collect", "use", "others", "dnt", "children", "choices", "changes"].map(
      (k) => today[`${k}_heading` as keyof typeof today],
    ),
  ).toEqual(HEADINGS);
  for (const b of PRIVACY_BODIES) expect(today[b], b).toBeNull();

  const some = privacyCopy(
    doc({
      meta_title: " Policy ",
      meta_description: "   ",
      heading: "Our privacy",
      effective_label: "",
      effective_date: "2030-01-02",
      dnt_heading: "  ",
      dnt_body: [{ type: "paragraph", text: "", spans: [] }],
      // Enter, then delete: two blocks, no words. Still today's section.
      children_body: [
        { type: "paragraph", text: "", spans: [] },
        { type: "paragraph", text: " ", spans: [] },
      ],
      changes_body: para("Write to us."),
    }),
  );
  expect([some.meta_title, some.meta_description]).toEqual(["Policy", null]);
  expect([some.heading, some.effective_label, some.effective_date]).toEqual([
    "Our privacy",
    "Effective",
    "2030-01-02",
  ]);
  expect(some.dnt_heading).toBe("Do Not Track");
  expect([some.dnt_body, some.children_body]).toEqual([null, null]);
  expect(some.changes_body).toEqual(para("Write to us."));
  expect([...PRIVACY_BODIES]).toEqual(["dnt_body", "children_body", "changes_body"]);
  // The SEO pair is never a fallback (the layout's is $lib/seo's); it feeds the
  // fixture and the placeholders, so it must match what the layout falls back to.
  expect([PRIVACY_COPY.meta_title, PRIVACY_COPY.meta_description]).toEqual([
    PAGE_SEO["/privacy"]?.title,
    PAGE_SEO["/privacy"]?.description,
  ]);
  expect(Object.keys(PRIVACY_COPY)).toEqual([
    "meta_title",
    "meta_description",
    "heading",
    "effective_label",
    ...["collect", "use", "others", "dnt", "children", "choices", "changes"].map(
      (k) => `${k}_heading`,
    ),
  ]);
});

const visible = (html: string) =>
  html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ");

const article = (html: string) => {
  const b = html.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<!--[\s\S]*?-->/g, "");
  return b.slice(b.indexOf("<article"), b.indexOf("</article>"));
};

test("Privacy reads the document: every field, in page order, with today's classes", async ({
  request,
}) => {
  const html = await (
    await request.get("/privacy", { headers: { cookie: "msot-privacy-fixture=1" } })
  ).text();
  const body = article(html);
  const shown = visible(body);
  const words = ["Fixture heading", "Fixture effective_label January 2, 2030"];
  for (const k of ["collect", "use", "others", "dnt", "children", "choices", "changes"]) {
    words.push(`Fixture ${k}_heading`);
    if ((PRIVACY_BODIES as readonly string[]).includes(`${k}_body`))
      words.push(`Fixture ${k}_body`, `Fixture ${k}_body item`);
  }
  for (const w of words) expect(shown, w).toMatch(new RegExp(`${w}(?![\\w,])`));
  const at = (w: string) => shown.search(new RegExp(`${w}(?![\\w,])`));
  expect(
    [...words].sort((a, b) => at(a) - at(b)),
    "fields in page order",
  ).toEqual(words);
  // A filled body takes today's link and list classes, and its own link.
  for (const b of PRIVACY_BODIES) {
    expect(body, b).toMatch(
      new RegExp(`<a (?=[^>]*href="/\\?fixture=${b}")(?=[^>]*class="underline hover:text-white")`),
    );
    expect(body, b).toContain(
      `<ul class="list-disc pl-6 space-y-1"><li>Fixture ${b} item</li></ul>`,
    );
  }
  // The document's SEO wins over $lib/seo's.
  expect(html).toMatch(/<title>Fixture meta_title<\/title>/);
  expect(html).toMatch(/<meta name="description" content="Fixture meta_description"/);
  // None of today's words is left where the document has a field.
  for (const today of [
    ...HEADINGS,
    "Privacy Policy",
    "November 4, 2026",
    "There is no agreed standard",
    "children under 13",
    "post the new version",
  ]) {
    expect(shown, today).not.toContain(today);
  }
  // The opening and the four sections with code logic stay today's, with the
  // settings values and the services list in them.
  for (const kept of [
    "runs this website",
    "When you send us the contact form",
    "We do not sell your personal information.",
    "may collect information about your online activities over time and across different websites",
    "Form messages go to Reddoor",
    "Netlify hosts this site",
    "To ask what information we hold",
  ]) {
    expect(shown, kept).toContain(kept);
  }
  expect(body).toContain('data-testid="service-linkedin"');
  expect(body).toMatch(/href="mailto:[^"]+@[^"]+"/);
});

test("with no document, Privacy shows today's headings, date and SEO", async ({ request }) => {
  const html = await (await request.get("/privacy")).text();
  const shown = visible(article(html));
  expect(shown).toContain("Privacy Policy Effective November 4, 2026");
  let from = 0;
  for (const h of HEADINGS) {
    const i = shown.indexOf(` ${h} `, from);
    expect(i, h).toBeGreaterThan(from);
    from = i;
  }
  expect(html).toMatch(/<title>Privacy Policy \| MSOT<\/title>/);
  expect(html).toContain(
    '<meta name="description" content="What information the Medical Solutions of Texas website collects, why, who else receives it, and the choices you have."',
  );
});

test("/preview/privacy is served per request, for Marketing's drafts", async ({ request }) => {
  const res = await request.get("/preview/privacy");
  expect(res.status()).toBe(200);
  expect(visible(article(await res.text()))).toContain("Privacy Policy Effective");
  // …and it reads the document, as /privacy does.
  const draft = await request.get("/preview/privacy", {
    headers: { cookie: "msot-privacy-fixture=1" },
  });
  expect(visible(article(await draft.text()))).toContain("Fixture heading");
});
