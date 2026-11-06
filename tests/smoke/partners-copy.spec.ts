import { test, expect } from "@playwright/test";
import { empty } from "./empty";
import { PARTNERS_COPY, partnersCopy } from "../../src/lib/copy/partners";
import type { PartnersPageDocument } from "../../prismicio-types";

// Partners' copy and logos move into Prismic's `partners_page` singleton (the
// operator, 11-05: "all content should be in prismic, not in code"). Every
// field falls back to today's when the document leaves it empty, and a missing
// document changes nothing. Today's wording is written out here, not read from
// src/lib/copy/partners.ts, so a wrong value there fails. Each client logo's
// name and file are also pinned by tests/smoke/process-text.spec.ts.

const pic = (url: string) => ({ url, alt: null, dimensions: { width: 1, height: 1 } });
const logo = (file: string) => `/code/${file}`;
const doc = (data: Record<string, unknown>) => ({ data }) as unknown as PartnersPageDocument;

test("partnersCopy: no document is today's; a filled field wins, field by field", () => {
  const today = partnersCopy(null, logo);
  expect([today.heading_left, today.heading_right]).toEqual(["Our", "Partners"]);
  expect(today.testimonial_heading).toBe("working with the best");
  expect(today.testimonial_name).toBe("Revogen");
  expect(today.testimonial_logo).toBe("/code/revogenLogo.svg");
  expect(today.clients[0].logo).toBe("/code/revogen-duo.png");
  expect(today.clients[17].logo).toBe("/code/Nexxt-duo.png");
  expect(today.testimonial_text).toBe(
    "MSOT made the process of getting our product into the DoD system easier than we ever thought possible. They're an invaluable partnership and wealth of knowledge when it comes to selling to the DoD and VA hospital systems.",
  );
  expect(today.partnerships_heading).toBe("Successful Partnerships");
  expect(today.partnerships_text).toBe(
    "Our most successful partnerships are with companies who are looking to expand their product offering into VA and DoW facilities, who have the flexibility and mindset to work with the government and who believe it's meaningful to be a part of offering the best healthcare possible to our active duty and veteran population in the United States.",
  );
  expect(today.clients_heading).toBe("Our Clients");
  expect(today.clients.map((c) => c.name)).toEqual([
    "Revogen",
    "Cibolo Spine",
    "Caerus",
    "Aegis Spine",
    "Leith Medical",
    "Centinel Spine",
    "Spinal Simplicity",
    "EDGe Surgical",
    "CTL Amedica",
    "4WEB Medical",
    "Difusion Technologies",
    "Metalogix",
    "Expanding Innovations",
    "Aurora",
    "Axial Biologics",
    "Bonebridge",
    "SIGNUS",
    "Nexxt Spine",
  ]);

  const some = partnersCopy(
    doc({
      testimonial_name: "Acme",
      testimonial_logo: pic("https://images.prismic.io/msot/acme.svg"),
      clients: [
        { name: "Named and pictured", logo: pic("https://images.prismic.io/msot/a.png") },
        { name: "Named only", logo: {} },
        { name: "", logo: pic("https://images.prismic.io/msot/b.png") },
      ],
    }),
    logo,
  );
  expect(some.testimonial_name).toBe("Acme");
  // Logos are sized for their slots, at twice the CSS width.
  expect(some.testimonial_logo).toBe("https://images.prismic.io/msot/acme.svg?w=512");
  // A row needs a name and a logo; the rows replace the whole list.
  expect(some.clients).toEqual([
    { name: "Named and pictured", logo: "https://images.prismic.io/msot/a.png?w=416" },
  ]);
  // Untouched fields keep today's.
  expect(some.clients_heading).toBe("Our Clients");
  expect(Object.keys(some).sort()).toEqual(Object.keys(PARTNERS_COPY).sort());
  // The quote's logo and name are one pair: half of it keeps today's whole.
  for (const half of [
    { testimonial_logo: pic("https://images.prismic.io/msot/acme.svg") },
    { testimonial_name: "Acme" },
  ]) {
    const c = partnersCopy(doc(half), logo);
    expect([c.testimonial_logo, c.testimonial_name]).toEqual(["/code/revogenLogo.svg", "Revogen"]);
  }
  // A logo's own alt text names it when the name is left empty.
  const alt = (url: string, a: string) => ({ ...pic(url), alt: a });
  const byAlt = partnersCopy(
    doc({
      testimonial_logo: alt("https://images.prismic.io/msot/acme.svg", "Acme Alt"),
      clients: [{ name: "", logo: alt("https://images.prismic.io/msot/c.png", "Alt Co") }],
    }),
    logo,
  );
  expect(byAlt.testimonial_name).toBe("Acme Alt");
  expect(byAlt.clients).toEqual([
    { name: "Alt Co", logo: "https://images.prismic.io/msot/c.png?w=416" },
  ]);
  // A document whose rows are all incomplete keeps today's 18.
  expect(
    partnersCopy(doc({ clients: [{ name: "No logo", logo: {} }] }), logo).clients,
  ).toHaveLength(18);
});

const visible = (html: string) =>
  html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ");

const imgs = (html: string) =>
  [...html.matchAll(/<img\b[^>]*>/g)].map(([tag]) => ({
    src: tag.match(/\bsrc="([^"]*)"/)?.[1] ?? "",
    alt: tag.match(/\balt="([^"]*)"/)?.[1] ?? null,
  }));

test("Partners reads the document: every field, in page order", async ({ request }) => {
  const html = await (
    await request.get("/partners", { headers: { cookie: "msot-partners-fixture=1" } })
  ).text();
  const shown = visible(html);
  const words = [
    "Fixture heading_left",
    "Fixture heading_right",
    "Fixture testimonial_heading",
    "Fixture testimonial_text",
    "Fixture partnerships_heading",
    "Fixture partnerships_text",
    "Fixture clients_heading",
  ];
  for (const w of words) expect(shown, w).toMatch(new RegExp(`${w}(?!\\w)`));
  const at = (w: string) => shown.search(new RegExp(`${w}(?!\\w)`));
  expect(
    [...words].sort((a, b) => at(a) - at(b)),
    "fields in page order",
  ).toEqual(words);

  // The pictures: the quoted company's logo, then each client's, each named
  // by its own row.
  const pictures = imgs(html.replace(/<script[\s\S]*?<\/script>/gi, "")).filter((i) =>
    i.src.includes("fixture="),
  );
  const base = "https://images.prismic.io/msot/fixture.svg?fixture=";
  expect(pictures).toEqual([
    { src: `${base}testimonial_logo&amp;w=512`, alt: "Fixture testimonial_name" },
    ...Array.from({ length: 18 }, (_, i) => ({
      src: `${base}clients-${i + 1}-logo&amp;w=416`,
      alt: `Fixture clients ${i + 1} name`,
    })),
  ]);

  // No section still shows today's words or logos.
  for (const today of [
    "Our Partners",
    "working with the best",
    "invaluable partnership",
    "Successful Partnerships",
    "most successful partnerships",
    "Our Clients",
  ]) {
    expect(shown, today).not.toContain(today);
  }
  const alts = imgs(html).map((i) => i.alt);
  for (const name of ["Revogen", "Cibolo Spine", "Nexxt Spine"]) expect(alts).not.toContain(name);
  expect(html).not.toMatch(/partners_duotone|revogenLogo/);
});

test("with every field empty, Partners shows today's words and logos", async ({ request }) => {
  const html = await (await request.get("/partners", { headers: empty("partners") })).text();
  const shown = visible(html);
  for (const w of [
    "Our Partners",
    "working with the best",
    "MSOT made the process of getting our product into the DoD system",
    "Successful Partnerships",
    "Our most successful partnerships",
    "Our Clients",
  ]) {
    expect(shown, w).toContain(w);
  }
  const all = imgs(html);
  expect(all.find((i) => /revogenLogo/.test(i.src))?.alt).toBe("Revogen");
  expect(all.filter((i) => /partners_duotone/.test(i.src))).toHaveLength(18);
});
