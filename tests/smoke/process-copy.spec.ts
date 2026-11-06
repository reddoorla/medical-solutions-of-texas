import { test, expect } from "@playwright/test";
import { PROCESS_COPY, processCopy } from "../../src/lib/copy/process";
import type { ProcessPageDocument } from "../../prismicio-types";

// Process's copy moves into Prismic's `process_page` singleton (the operator,
// 11-05: "all content should be in prismic, not in code"). Every field falls
// back to today's wording when the document leaves it empty, and a missing
// document changes nothing. Today's wording is written out here, not read from
// src/lib/copy/process.ts, so a wrong value there fails. The timeline's words
// are also pinned by tests/smoke/process-text.spec.ts.

const para = (t: string) => [{ type: "paragraph", text: t, spans: [] }] as never;
const doc = (data: Record<string, unknown>) => ({ data }) as unknown as ProcessPageDocument;

test("processCopy: no document is today's wording; a filled field wins, field by field", () => {
  const today = processCopy(null);
  expect([today.heading_left, today.heading_right]).toEqual(["Our", "Process"]);
  expect(today.simplifying_heading).toBe("Simplifying Complexity");
  expect(today.complex_line).toBe("Government Contracting is Complex...");
  expect(today.complex_text).toBe(
    "…and often feels like continuously slamming your head into a wall. We know, we’ve been there. You find your access is expired. Late payments, inability to collect a PO, supply chain delays or mismanagement. You’re always “almost there” to get that next contract, but never quite get across the finish line. This isn’t the way things should be.",
  );
  expect(today.simplify_line).toBe("Let’s Simplify It…");
  expect(today.simplify_text).toBe(
    "...and make things work. We’ve done this for years, with many partners and many situations and will help get you where you need to be. With experience comes procedure, with procedure comes consistency, efficiency, and results.",
  );
  expect(today.video_title).toBe("background video");
  expect(today.video_heading).toBe("OUR PROCESS");
  expect([today.step_1_title, today.step_2_title, today.step_3_title]).toEqual([
    "Refine",
    "Guide",
    "Connect",
  ]);
  expect(today.step_1_text).toBe("We’ll isolate the best contracts and options for your company");
  expect(today.step_2_text).toBe(
    "We’ll guide you through the bureaucracy and paperwork, and get your application in",
  );
  expect(today.step_3_text).toBe(
    "We’ll get you in the room with the right people to help you build further relationships",
  );
  expect(today.timeline_heading).toBe("What does a typical timeline look like?");
  expect(today.timeline.map((s) => s.timing)).toEqual([
    "Week 1",
    "Typically 45 working days or less",
    "About 7 days",
    "Ongoing",
    "As needed",
  ]);
  expect(today.faq_heading).toBe("Common Questions & Our Answers");
  expect(today.faq.map((r) => r.question)).toEqual([
    "Why does VOSB status give priority for winning VA and DoW contracts?",
    "What does our typical timeline look like after winning a contract?",
  ]);
  expect(today.faq[0].answer).toBe(
    "In the 2016 Kingdomware Techs., Inc. v. United States case, the Supreme Court unanimously affirmed the Rule of Two provision of a 2006 federal law. The Rule of Two mandates that VA contracts shall be set aside for veteran-owned small businesses if at least two such businesses exist that can perform the work at a reasonable price. This results in a wide swath of contracts set aside specifically for veteran-owned businesses, ones that VOSBs, like MSOT, have priority in winning.",
  );
  expect(today.faq[1].answer).toBe(
    "The timeline for this process begins with a medical manufacturer getting approval on the ECAT, typically 45 working days or less. The next critical step is ensuring compliance and readiness for the rollout phase. Once approved, the rollout to VA facilities and military bases takes place within a concise period of seven days, making the product accessible where it is most needed. Following the initial product deployment, the process transitions into a phase med-surg equipment can be provided, ensuring smooth operations and ongoing support. Finally, the timeline extends into a phase of ongoing contract maintenance, which is carried out as needed to uphold quality and reliability throughout the duration of the agreement.",
  );

  const some = processCopy(
    doc({
      step_2_title: "New",
      timeline: [
        { timing: "", title: "Only step", text: "" },
        { timing: "Soon", title: "", text: "no title, not shown" },
      ],
      faq: [{ question: "Q?", answer: para("A.") }],
    }),
  );
  expect(some.step_2_title).toBe("New");
  expect(some.timeline).toEqual([{ timing: "", title: "Only step", text: "" }]);
  expect(some.faq).toEqual([{ question: "Q?", answer: "A." }]);
  // Untouched fields keep today's wording.
  expect(some.step_1_title).toBe("Refine");
  expect(Object.keys(some).sort()).toEqual(Object.keys(PROCESS_COPY).sort());
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
  for (const [field, today] of Object.entries(PROCESS_COPY)) {
    if (field === "video_title") continue; // an attribute, mounted after a visitor engages
    if (typeof today === "string") out.push(`Fixture ${field}`);
    else
      today.forEach((row, i) => {
        for (const k of Object.keys(row)) out.push(`Fixture ${field} ${i + 1} ${k}`);
      });
  }
  return out;
};

test("Process reads the document: every field, in page order", async ({ request }) => {
  const html = await (
    await request.get("/process", { headers: { cookie: "msot-process-fixture=1" } })
  ).text();
  const shown = visible(html);
  const words = fixtureWords();
  for (const w of words) expect(shown, w).toMatch(new RegExp(`${w}(?!\\w)`));
  const at = (w: string) => shown.search(new RegExp(`${w}(?!\\w)`));
  expect(
    [...words].sort((a, b) => at(a) - at(b)),
    "fields in page order",
  ).toEqual(words);
  const page = html.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<!--[\s\S]*?-->/g, "");
  // Each answer is inside its own question's <details>.
  for (const i of [1, 2]) {
    expect(page).toMatch(
      new RegExp(
        `<details[^>]*>(?:(?!</details>)[\\s\\S])*Fixture faq ${i} question(?:(?!</details>)[\\s\\S])*Fixture faq ${i} answer`,
      ),
    );
  }
  // The steps keep their numerals, from the page.
  for (const n of ["01", "02", "03"]) {
    expect(shown).toContain(`${n} Fixture step_${Number(n)}_title`);
  }
  for (const i of [1, 2, 3, 4, 5]) {
    expect(shown).toContain(`0${i} Fixture timeline ${i} title`);
  }
  // No section still shows today's words.
  for (const today of [
    "Simplifying Complexity",
    "Government Contracting is Complex",
    "slamming your head",
    "Let’s Simplify It",
    "make things work",
    "OUR PROCESS",
    "Refine",
    "Guide",
    "Connect",
    "isolate the best contracts",
    "typical timeline",
    "Week 1",
    "Kickoff and contract plan",
    "Contract maintenance",
    "Common Questions",
    "Kingdomware",
    "after winning a contract",
  ]) {
    expect(shown, today).not.toContain(today);
  }
});

test("Process's background video is titled from the document, once it mounts", async ({
  page,
  baseURL,
}) => {
  await page
    .context()
    .addCookies([{ name: "msot-process-fixture", value: "1", url: baseURL ?? "" }]);
  await page.route("**/player.vimeo.com/**", (r) => r.abort());
  await page.goto("/process");
  await expect(async () => {
    await page.mouse.move(100, 100);
    await page.mouse.move(200, 200);
    await expect(page.locator('iframe[title="Fixture video_title"]')).toBeAttached({
      timeout: 3000,
    });
  }).toPass({ timeout: 30_000 });
});

test("with no document, Process shows today's words", async ({ request }) => {
  const shown = visible(await (await request.get("/process")).text());
  for (const w of [
    "Our Process",
    "Simplifying Complexity",
    "Let’s Simplify It…",
    "OUR PROCESS",
    "01 Refine",
    "02 Guide",
    "03 Connect",
    "What does a typical timeline look like?",
    "01 Kickoff and contract plan",
    "05 Contract maintenance",
    "Common Questions & Our Answers",
    "Why does VOSB status give priority for winning VA and DoW contracts?",
  ]) {
    expect(shown, w).toContain(w);
  }
});
