import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { RichTextField } from "@prismicio/client";
import { PRIVACY_BODIES, PRIVACY_COPY, privacyCopy } from "../../src/lib/copy/privacy";
import { fillRichText } from "../../src/lib/content";
import { PAGE_SEO } from "../../src/lib/seo";
import type { PrivacyPageDocument } from "../../prismicio-types";

// The privacy policy's copy moves into Prismic's `privacy_page` singleton (the
// operator, 11-05: "all content should be in prismic, not in code"). Every
// heading falls back to today's wording when the document leaves it empty, and
// every section body to today's markup; a missing document changes nothing.
// Today's wording is written out here, not read from src/lib/copy/privacy.ts,
// so a wrong value there fails. tests/smoke/privacy.spec.ts still pins the
// body's wording and the settings values in it. Every section's body is a
// field too (the operator, 11-06: "Field per section, tokens"): filled, it
// replaces the section's text, with {legal name}, {name} and {email} filled
// from settings and {email} linked.

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
      opening_body: [{ type: "paragraph", text: "", spans: [] }],
      use_body: [
        { type: "paragraph", text: "", spans: [] },
        { type: "list-item", text: "  ", spans: [] },
      ],
      collect_body: para("We collect {email}."),
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
  expect([some.opening_body, some.use_body, some.others_body, some.choices_body]).toEqual([
    null,
    null,
    null,
    null,
  ]);
  // A body comes to the page as typed; its tokens are filled there.
  expect(some.collect_body).toEqual(para("We collect {email}."));
  // Every section's body, in page order: the opening, then the seven sections.
  expect([...PRIVACY_BODIES]).toEqual([
    "opening_body",
    "collect_body",
    "use_body",
    "others_body",
    "dnt_body",
    "children_body",
    "choices_body",
    "changes_body",
  ]);
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

test("fillRichText: every block's tokens filled, its spans moved, {email} linked once", () => {
  const values = { "legal name": "OJH Services, Inc.", name: "MSOT", email: "a@b.co" };
  const mail = { email: (v: string) => `mailto:${v}` };
  const field = [
    // "{Name}" is bold, "wrote" italic.
    {
      type: "paragraph",
      text: "{legal name} dba {Name} wrote, at {email}.",
      spans: [
        { type: "strong", start: 17, end: 23 },
        { type: "em", start: 24, end: 29 },
      ],
    },
    // A bold span typed from inside the token to inside it takes in the whole value.
    { type: "paragraph", text: "By {name}.", spans: [{ type: "strong", start: 4, end: 6 }] },
    { type: "list-item", text: "Ask {email}, not {e-mail}.", spans: [] },
    // The editor linked {email} themselves: their link stays, and no second one is added.
    {
      type: "paragraph",
      text: "Mail {email} now",
      spans: [
        { type: "hyperlink", start: 5, end: 12, data: { link_type: "Web", url: "mailto:x@y.z" } },
      ],
    },
    { type: "paragraph", text: "No tokens", spans: [{ type: "strong", start: 0, end: 2 }] },
  ] as unknown as RichTextField;
  expect(fillRichText(field, values, mail)).toEqual([
    {
      type: "paragraph",
      text: "OJH Services, Inc. dba MSOT wrote, at a@b.co.",
      spans: [
        { type: "strong", start: 23, end: 27 },
        { type: "em", start: 28, end: 33 },
        { type: "hyperlink", start: 38, end: 44, data: { link_type: "Web", url: "mailto:a@b.co" } },
      ],
    },
    { type: "paragraph", text: "By MSOT.", spans: [{ type: "strong", start: 3, end: 7 }] },
    {
      type: "list-item",
      text: "Ask a@b.co, not {e-mail}.",
      spans: [
        { type: "hyperlink", start: 4, end: 10, data: { link_type: "Web", url: "mailto:a@b.co" } },
      ],
    },
    {
      type: "paragraph",
      text: "Mail a@b.co now",
      spans: [
        { type: "hyperlink", start: 5, end: 11, data: { link_type: "Web", url: "mailto:x@y.z" } },
      ],
    },
    { type: "paragraph", text: "No tokens", spans: [{ type: "strong", start: 0, end: 2 }] },
  ]);
  // With no links asked for, {email} is filled but not linked; an empty value is never linked.
  expect(fillRichText(para("at {email}"), values)).toEqual(para("at a@b.co"));
  expect(fillRichText(para("at {email}"), { email: "" }, mail)).toEqual(para("at "));
});

test("privacy_page has a rich-text body per section, labelled with what filling it costs", () => {
  const model = JSON.parse(
    readFileSync(join(process.cwd(), "customtypes/privacy_page/index.json"), "utf8"),
  );
  const fields: Record<string, { type: string; config: Record<string, unknown> }> = Object.assign(
    {},
    ...Object.values(model.json),
  );
  for (const b of PRIVACY_BODIES) {
    expect(fields[b]?.type, b).toBe("StructuredText");
    expect(fields[b].config.multi, b).toBe("paragraph,strong,em,hyperlink,list-item");
    expect(fields[b].config.placeholder, b).toContain(
      "{legal name}, {name} and {email} show the Settings values, and {email} is a link.",
    );
  }
  // The three that today's code writes from the services the site runs say so.
  for (const b of ["collect_body", "use_body", "others_body"])
    expect(fields[b].config.label, b).toContain(
      "Once filled, the services the site runs are not added automatically",
    );
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

// The settings values with no settings document ($lib/identity's CODE_IDENTITY).
const SETTINGS = {
  legal: "OJH Services, Inc.",
  name: "Medical Solutions of Texas",
  email: "info@MedicalSolutionsofTX.com",
};
const esc = (w: string) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

test("Privacy reads the document: every field, in page order, with today's classes", async ({
  request,
}) => {
  const html = await (
    await request.get("/privacy", { headers: { cookie: "msot-privacy-fixture=1" } })
  ).text();
  const body = article(html);
  const shown = visible(body);
  // Each body's three blocks ($lib/privacy/fixture), its tokens filled.
  const bodyWords = (b: string) => [
    `Fixture ${b}`,
    `Fixture ${b} item`,
    // (The address is a link, so its comma follows the link; the HTML check below reads it.)
    `Fixture ${b} by ${SETTINGS.legal} dba ${SETTINGS.name}, at ${SETTINGS.email}`,
  ];
  const words = [
    "Fixture heading",
    "Fixture effective_label January 2, 2030",
    ...bodyWords("opening_body"),
  ];
  for (const k of ["collect", "use", "others", "dnt", "children", "choices", "changes"])
    words.push(`Fixture ${k}_heading`, ...bodyWords(`${k}_body`));
  const find = (w: string) => new RegExp(`${esc(w)}(?![\\w,])`);
  for (const w of words) expect(shown, w).toMatch(find(w));
  const at = (w: string) => shown.search(find(w));
  expect(
    [...words].sort((a, b) => at(a) - at(b)),
    "fields in page order",
  ).toEqual(words);
  // A filled body takes today's link and list classes (Who else receives it
  // spaces its list wider, as today's does), its own link, and {email} as a
  // mailto link with today's class.
  for (const b of PRIVACY_BODIES) {
    expect(body, b).toMatch(
      new RegExp(`<a (?=[^>]*href="/\\?fixture=${b}")(?=[^>]*class="underline hover:text-white")`),
    );
    const list = b === "others_body" ? "space-y-2" : "space-y-1";
    expect(body, b).toContain(`<ul class="list-disc pl-6 ${list}"><li>Fixture ${b} item</li></ul>`);
    expect(body, b).toMatch(
      new RegExp(
        `Fixture ${b} by [^<]*<a (?=[^>]*href="mailto:${esc(SETTINGS.email)}")` +
          `(?=[^>]*class="underline hover:text-white")[^>]*>${esc(SETTINGS.email)}</a>, not \\{e-mail\\}\\.`,
      ),
    );
  }
  // The opening's blocks share one box, spaced as a section's are, not as the
  // page's sections are from each other.
  expect(body).toMatch(
    /<div class="space-y-3">\s*<p><a [^>]*>Fixture opening_body<\/a><\/p>\s*<ul [^>]*><li>Fixture opening_body item<\/li><\/ul>\s*<p>Fixture opening_body by [^<]*<a [^>]*>[^<]*<\/a>[^<]*<\/p>\s*<\/div>/,
  );
  // No token that names a settings value is left as typed.
  expect(shown).not.toMatch(/\{(legal name|name|email)\}/i);
  // The document's SEO wins over $lib/seo's.
  expect(html).toMatch(/<title>Fixture meta_title<\/title>/);
  expect(html).toMatch(/<meta name="description" content="Fixture meta_description"/);
  // None of today's words is left where the document has a field: with every
  // body filled, that is the whole policy, the services list included.
  for (const today of [
    ...HEADINGS,
    "Privacy Policy",
    "November 4, 2026",
    "runs this website",
    "When you send us the contact form",
    "We do not sell your personal information.",
    "over time and across different websites",
    "Form messages go to Reddoor",
    "Netlify hosts this site",
    "There is no agreed standard",
    "children under 13",
    "To ask what information we hold",
    "post the new version",
  ]) {
    expect(shown, today).not.toContain(today);
  }
  expect(body).not.toContain('data-testid="service-');
});

test("with no document, Privacy shows today's text: headings, date, SEO and the code's sections", async ({
  request,
}) => {
  const html = await (await request.get("/privacy")).text();
  const body = article(html);
  const shown = visible(body);
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
  // The opening and the four sections the code writes, with the settings
  // values and the services list in them, under their headings.
  for (const [kept, after] of [
    [
      `${SETTINGS.legal}, doing business as ${SETTINGS.name} ("we") runs this website.`,
      "Effective",
    ],
    ["When you send us the contact form", "What we collect"],
    ["We do not sell your personal information.", "How we use it"],
    [
      "Some of the services below may collect information about your online activities over time and across different websites.",
      "Who else receives it",
    ],
    ["Form messages go to Reddoor", "Who else receives it"],
    ["Netlify hosts this site", "Who else receives it"],
    [`To ask what information we hold about you`, "Your choices"],
  ]) {
    expect(shown, kept).toContain(kept);
    expect(shown.indexOf(kept), kept).toBeGreaterThan(shown.indexOf(after));
  }
  expect(body).toContain('data-testid="service-linkedin"');
  expect(body).toMatch(
    new RegExp(
      `email\\s*<a href="mailto:${esc(SETTINGS.email)}" class="underline hover:text-white">`,
    ),
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
