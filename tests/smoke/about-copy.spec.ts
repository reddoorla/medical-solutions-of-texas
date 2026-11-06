import { test, expect } from "@playwright/test";
import { empty } from "./empty";
import { paragraphs, rows } from "../../src/lib/content";
import { ABOUT_COPY, aboutCopy } from "../../src/lib/copy/about";
import type { AboutPageDocument } from "../../prismicio-types";

// About's copy moves into Prismic's `about_page` singleton (the operator, 11-05:
// "all content should be in prismic, not in code"). Every field falls back to
// today's wording when the document leaves it empty, and a missing document
// changes nothing. Today's wording is written out here, not read from
// src/lib/copy/about.ts, so a wrong value there fails.

const para = (t: string) => [{ type: "paragraph", text: t, spans: [] }] as never;
const paras = (...t: string[]) =>
  t.map((x) => ({ type: "paragraph", text: x, spans: [] })) as never;
const doc = (data: Record<string, unknown>) => ({ data }) as unknown as AboutPageDocument;

test("paragraphs: one line per paragraph, spaces kept; empty keeps today's wording", () => {
  expect(paragraphs(paras("a:", "65 II A    Med"), "Old")).toBe("a:\n65 II A    Med");
  expect(paragraphs(para("One"), "Old")).toBe("One");
  expect(paragraphs(paras("", "One", "", "Two", ""), "Old")).toBe("One\n\nTwo");
  expect(paragraphs([] as never, "Old")).toBe("Old");
  expect(paragraphs(para("   "), "Old")).toBe("Old");
  expect(paragraphs(null, "Old")).toBe("Old");
});

test("rows: the rows a pick keeps, in order; none kept is today's rows", () => {
  const pick = (r: { a?: string }) => (r.a ? { a: r.a } : null);
  expect(rows([{ a: "2" }, {}, { a: "1" }], pick, [{ a: "old" }])).toEqual([
    { a: "2" },
    { a: "1" },
  ]);
  expect(rows([{}, {}], pick, [{ a: "old" }])).toEqual([{ a: "old" }]);
  expect(rows([], pick, [{ a: "old" }])).toEqual([{ a: "old" }]);
  expect(rows(null, pick, [{ a: "old" }])).toEqual([{ a: "old" }]);
});

test("aboutCopy: no document is today's wording; a filled field wins, field by field", () => {
  const today = aboutCopy(null);
  expect(today.heading_left).toBe("About");
  expect(today.heading_right).toBe("MSOT");
  expect(today.differentiates_heading).toBe("what differentiates us");
  expect(today.experience_text).toBe(
    "With 20 years’ worth of experience in Air Force logistics and nearly 50 years in medical device sales on our leadership team, we know the VA and DoW healthcare landscape better than anyone. We enable med-surg suppliers to find and access opportunities that they wouldn’t have been able to tap into alone.",
  );
  expect(today.services.map((r) => r.label)).toEqual([
    "Sign DAPAs",
    "Get Listed in the ECAT",
    "Win FSS Contracts",
    "Figure out where to start",
  ]);
  // The FSS answer is shown pre-wrapped, so its line breaks and runs of spaces show.
  expect(today.services[2].answer).toContain(
    "programs: \n65 I B Drugs, Pharmaceuticals, & Hematology Related Products\n65 II A    Medical Equipment & Supplies\n",
  );
  expect(today.services[2].answer).toMatch(
    /\n621 II {4}Medical Laboratory Testing & Analysis Services$/,
  );
  expect(today.who_heading).toBe("We have what you’re looking for");
  expect(today.who_text_1).toBe(
    "MSOT was founded by a team of medical sales experts in 2022. With a career running Air Force logistics on bases in the continental United States and at forward deployment locations overseas, we have the experience to know how to work within the complex system of military contracts and procurement.",
  );
  expect(today.who_text_2).toBe(
    "We spent our careers grappling with the difficulties in getting and keeping VA hospitals and DoW bases equipped with med-surg supplies, from the side of a logistics officer and the side of the medical sales. And so we formed MSOT, pairing experts on both sides to build an organization uniquely suited to connect med-surg suppliers with VA and DoW contracts.",
  );
  expect(today.team_heading).toBe("The Team");

  const some = aboutCopy(
    doc({
      who_heading: "New heading",
      services: [
        { label: "Only row", answer: paras("Line one", "Line  two") },
        { label: "", answer: para("no title, not shown") },
        { label: "Title alone", answer: [] },
      ],
    }),
  );
  expect(some.who_heading).toBe("New heading");
  expect(some.services).toEqual([
    { label: "Only row", answer: "Line one\nLine  two" },
    { label: "Title alone", answer: "" },
  ]);
  // Untouched fields keep today's wording.
  expect(some.team_heading).toBe("The Team");
  // Every field of today's wording has a field in the result, and no more.
  expect(Object.keys(some).sort()).toEqual(Object.keys(ABOUT_COPY).sort());
});

const visible = (html: string) =>
  html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ");

const fixtureWords = () => {
  const out: string[] = [];
  for (const [field, today] of Object.entries(ABOUT_COPY)) {
    if (typeof today === "string") out.push(`Fixture ${field}`);
    else
      today.forEach((row, i) => {
        for (const k of Object.keys(row)) out.push(`Fixture ${field} ${i + 1} ${k}`);
      });
  }
  return out;
};

test("About reads the document: every field, in page order", async ({ request }) => {
  const html = await (
    await request.get("/about", { headers: { cookie: "msot-about-fixture=1" } })
  ).text();
  const shown = visible(html);
  const words = fixtureWords();
  for (const w of words) expect(shown, w).toMatch(new RegExp(`${w}(?!\\w)`));
  // Each field sits where its string sits, so two fields swapped fail.
  const at = (w: string) => shown.search(new RegExp(`${w}(?!\\w)`));
  expect(
    [...words].sort((a, b) => at(a) - at(b)),
    "fields in page order",
  ).toEqual(words);
  // A row's answer is its own row's, inside that row's <details>.
  const page = html.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<!--[\s\S]*?-->/g, "");
  for (const i of [1, 2, 3, 4]) {
    expect(page).toMatch(
      new RegExp(
        `<details[^>]*>(?:(?!</details>)[\\s\\S])*Fixture services ${i} label(?:(?!</details>)[\\s\\S])*Fixture services ${i} answer`,
      ),
    );
  }
  // No section still shows today's words.
  for (const today of [
    "what differentiates us",
    "We are defined by expertise",
    "20 years’ worth",
    "What We Do For You",
    "Sign DAPAs",
    "Distribution and pricing",
    "Get Listed in the ECAT",
    "e-catalog",
    "Win FSS Contracts",
    "Figure out where to start",
    "perfect partner",
    "Who We Are",
    "what you’re looking for",
    "founded by a team",
    "We spent our careers",
    "The Team",
  ]) {
    expect(shown, today).not.toContain(today);
  }
});

test("with every field empty, About shows today's words", async ({ request }) => {
  const html = await (await request.get("/about", { headers: empty("about") })).text();
  const shown = visible(html);
  for (const w of [
    "About MSOT",
    "what differentiates us",
    "We are defined by expertise and experience.",
    "What We Do For You",
    "Sign DAPAs",
    "Win FSS Contracts",
    "Who We Are",
    "We have what you’re looking for",
    "The Team",
  ]) {
    expect(shown, w).toContain(w);
  }
  // The FSS answer keeps its lines and spaces, byte for byte.
  expect(html.replace(/&amp;/g, "&")).toContain(ABOUT_FSS_TODAY);
});

// Written as lines, so no editor can strip the first line's trailing space.
const ABOUT_FSS_TODAY = [
  "You'll have access to be awarded to the nine VA FSS programs: ",
  "65 I B Drugs, Pharmaceuticals, & Hematology Related Products",
  "65 II A    Medical Equipment & Supplies",
  "65 II C    Dental Equipment & Supplies",
  "65 II F    Patient Mobility Devices",
  "65 V A    X-Ray Equipment & Supplies",
  "65 VII    Invitro Diagnostics, Reagents, Test Kits, & Test Sets",
  "66 III    Cost-Per-Test, Clinical Laboratory Analyzers",
  "621 I    Professional & Allied Healthcare Staffing Services",
  "621 II    Medical Laboratory Testing & Analysis Services",
].join("\n");
