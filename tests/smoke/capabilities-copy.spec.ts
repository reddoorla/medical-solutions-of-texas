import { test, expect } from "@playwright/test";
import { CAPABILITIES_COPY, capabilitiesCopy } from "../../src/lib/copy/capabilities";
import type { CapabilitiesPageDocument } from "../../prismicio-types";

// The Capabilities Statement's copy moves into Prismic's `capabilities_page`
// singleton (the operator, 11-05: "all content should be in prismic, not in
// code"). Every field falls back to today's wording when the document leaves
// it empty, and a missing document changes nothing. Today's wording is written
// out here, not read from src/lib/copy/capabilities.ts, so a wrong value there
// fails. tests/smoke/capabilities.spec.ts still pins the page's settings values.

const doc = (data: Record<string, unknown>) => ({ data }) as unknown as CapabilitiesPageDocument;

test("capabilitiesCopy: no document is today's wording; a filled field wins, field by field", () => {
  const today = capabilitiesCopy(null);
  expect([today.meta_title, today.meta_description]).toEqual([null, null]);
  expect([today.eyebrow, today.heading]).toEqual([
    "Veteran-Owned Small Business",
    "Capabilities Statement",
  ]);
  expect(today.mission_line).toBe(
    "Connecting VA and DoW treatment facilities with med-surg suppliers.",
  );
  expect(today.mission_text).toBe(
    "We bridge the gap between clinical demand and government procurement to support service members and veterans. Our expertise, VOSB (Veteran-Owned Small Business) status and deep network of relationships let us offer solutions where others hit roadblocks.",
  );
  expect(today.numbers).toEqual([
    { figure: "45 working days or less", line: "to contract. Industry average: 120+" },
    { figure: "39 federal locations", line: "served across 16 states" },
    { figure: "8,579 med-surg line items", line: "added to ECAT each month" },
  ]);
  expect(today.capabilities.map((c) => c.item)).toEqual([
    "Federal contract access through ECAT, FSS and DAPA",
    "Government sales strategy for VA and DoW",
    "Product marketing and contracting",
    "Clinical product evaluation and approval support",
    "Pricing strategy and direct invoicing",
    "Dedicated Government Account Coordinators",
  ]);
  expect([
    today.ecat_jit_name,
    today.ecat_jit_note,
    today.ecat_dvd_name,
    today.ecat_dvd_note,
    today.fss_name,
    today.fss_note,
    today.dapa_medical_name,
    today.dapa_medical_note,
    today.dapa_equipment_name,
    today.dapa_equipment_note,
  ]).toEqual([
    "ECAT",
    "Just in Time",
    "ECAT",
    "Direct Vendor Delivery",
    "FSS",
    "VA Schedule 65 II A",
    "DAPA",
    "Medical/Surgical",
    "DAPA",
    "Equipment",
  ]);
  expect([
    today.legal_name_label,
    today.dba,
    today.uei_label,
    today.cage_label,
    today.naics_label,
    today.naics_primary,
    today.naics_secondary,
  ]).toEqual(["Legal name", "DBA", "UEI", "CAGE", "NAICS", "(primary)", "339112, 339113"]);
  expect(today.designations).toEqual([
    { scope: "Federal", items: "VOSB (Veteran-Owned Small Business) · Small Business" },
    {
      scope: "SCTRCA",
      items:
        "VBE: Veteran Business Enterprise · ESBE: Emerging Small Business · SBE: Small Business Entity",
    },
  ]);
  expect(today.different_text).toBe(
    "We are defined by expertise and experience. With 20 years of Air Force logistics and nearly 50 years in medical device sales on our leadership team, we know the VA and Department of War (DoW) healthcare landscape better than anyone. We help med-surg suppliers find and access opportunities they couldn't reach alone.",
  );
  expect([today.domain, today.contact_link]).toEqual(["medicalsolutionsoftx.com", "Contact us"]);

  const some = capabilitiesCopy(
    doc({
      meta_title: "New title",
      fss_note: "New note",
      numbers: [
        { figure: "", line: "no figure, not shown" },
        { figure: "1 figure", line: "" },
      ],
    }),
  );
  expect(some.meta_title).toBe("New title");
  expect(some.meta_description).toBeNull();
  expect(some.fss_note).toBe("New note");
  expect(some.numbers).toEqual([{ figure: "1 figure", line: "" }]);
  expect(some.fss_name).toBe("FSS");
  expect(Object.keys(some).sort()).toEqual(Object.keys(CAPABILITIES_COPY).sort());
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

/** Every field the page shows, in page order, as the fixture fills it. */
const fixtureWords = () => {
  const out: string[] = [];
  for (const [field, today] of Object.entries(CAPABILITIES_COPY)) {
    if (field === "meta_title" || field === "meta_description") continue;
    if (typeof today === "string") out.push(`Fixture ${field}`);
    else
      today.forEach((row, i) => {
        for (const k of Object.keys(row)) out.push(`Fixture ${field} ${i + 1} ${k}`);
      });
  }
  return out;
};

test("Capabilities reads the document: every field, in page order, and its SEO", async ({
  request,
}) => {
  const html = await (
    await request.get("/capabilities", { headers: { cookie: "msot-capabilities-fixture=1" } })
  ).text();
  const shown = visible(article(html));
  const words = fixtureWords();
  for (const w of words) expect(shown, w).toMatch(new RegExp(`${w}(?!\\w)`));
  const at = (w: string) => shown.search(new RegExp(`${w}(?!\\w)`));
  expect(
    [...words].sort((a, b) => at(a) - at(b)),
    "fields in page order",
  ).toEqual(words);
  // The settings values sit where they did, between the document's words.
  expect(shown).toMatch(/Fixture fss_name \S+ · Fixture fss_note/);
  expect(shown).toMatch(/, Fixture dba /);
  expect(shown).toMatch(/\d{6} Fixture naics_primary, Fixture naics_secondary/);
  // The document's SEO wins over $lib/seo's.
  expect(html).toMatch(/<title>Fixture meta_title<\/title>/);
  expect(html).toMatch(/<meta name="description" content="Fixture meta_description"/);
  for (const today of [
    "Veteran-Owned Small Business",
    "Capabilities Statement",
    "Mission",
    "By the numbers",
    "45 working days",
    "Core capabilities",
    "Dedicated Government Account Coordinators",
    "Contract vehicles",
    "Just in Time",
    "VA Schedule 65 II A",
    "Company data",
    "Legal name",
    "339112",
    "Designations",
    "SCTRCA",
    "What makes us different",
    "medicalsolutionsoftx.com",
    "Contact us",
  ]) {
    expect(shown, today).not.toContain(today);
  }
});

test("with no document, Capabilities shows today's words and $lib/seo's title and description", async ({
  request,
}) => {
  const html = await (await request.get("/capabilities")).text();
  const shown = visible(article(html));
  for (const w of [
    "Veteran-Owned Small Business",
    "Capabilities Statement",
    "Connecting VA and DoW treatment facilities with med-surg suppliers.",
    "45 working days or less to contract. Industry average: 120+",
    "Dedicated Government Account Coordinators",
    "Just in Time",
    "VA Schedule 65 II A",
    "(primary), 339112, 339113",
    "VBE: Veteran Business Enterprise · ESBE: Emerging Small Business · SBE: Small Business Entity",
    "Department of War (DoW)",
    "· medicalsolutionsoftx.com",
    "Contact us",
  ]) {
    expect(shown, w).toContain(w);
  }
  expect(html).toMatch(/<title>Capabilities Statement \| MSOT<\/title>/);
  expect(html).toContain(
    `<meta name="description" content="MSOT's capabilities, contract vehicles (ECAT, FSS, DAPA), company data and designations: connecting VA and DoW treatment facilities with med-surg suppliers."`,
  );
});
