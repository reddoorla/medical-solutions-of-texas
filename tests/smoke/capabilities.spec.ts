import { test, expect } from "@playwright/test";
import { empty, emptyCookies, SINGLETONS } from "./empty";

// Pin the code's wording whatever is published in Prismic (./empty).
test.beforeEach(({ context, baseURL }) => emptyCookies(context, baseURL));

// MSOT Marketing's Developer Brief Part 2, §14c and §14d: the Capabilities
// Statement as a page of text, linked from Resources and listed in the sitemap.
// The facts are written out here, from Marketing's 2026 PDF, not imported.
const text = (h: string) =>
  h
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ");

const FACTS = [
  "Connecting VA and DoW treatment facilities with med-surg suppliers.",
  "45 working days or less to contract. Industry average: 120+",
  "39 federal locations served across 16 states",
  "8,579 med-surg line items added to ECAT each month",
  "Federal contract access through ECAT, FSS and DAPA",
  "Dedicated Government Account Coordinators",
  "ECAT SPE2DE-25-D-A012 · Just in Time",
  "ECAT SPE2DE-25-D-A011 · Direct Vendor Delivery",
  "FSS 36F797-25-D-0204 · VA Schedule 65 II A",
  "DAPA SP0200-11-H-0018 · Medical/Surgical",
  "DAPA SP0200-11-H-0003 · Equipment",
  "Legal name OJH Services, Inc., DBA Medical Solutions of Texas",
  "UEI Z7Q8TN9HMRC4",
  "CAGE 6ZM08",
  "NAICS 423450 (primary), 339112, 339113",
  "VOSB (Veteran-Owned Small Business) · Small Business",
  "VBE: Veteran Business Enterprise · ESBE: Emerging Small Business · SBE: Small Business Entity",
  "With 20 years of Air Force logistics and nearly 50 years in medical device sales",
  "4903 Golden Quail, Suite 120, San Antonio, TX 78240",
  "833.307.4418",
  "info@MedicalSolutionsofTX.com · medicalsolutionsoftx.com",
];

test("/capabilities states the Capabilities Statement as text in the server HTML", async ({
  request,
}) => {
  const res = await request.get("/capabilities", { headers: empty(...SINGLETONS) });
  expect(res.status()).toBe(200);
  const h = await res.text();
  const t = text(h);
  for (const fact of FACTS) expect(t, fact).toContain(fact);
  expect([...h.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/g)].map((m) => text(m[1]).trim())).toEqual([
    "Capabilities Statement",
  ]);
  // Held: no download until the new PDF (the live one has the old ZIP and DoD line).
  expect(t).not.toMatch(/download/i);
  expect(h).not.toContain("MSOT_Capabilities.pdf");
  expect(t).not.toContain("78232");
});

test("Resources links to /capabilities", async ({ request }) => {
  const h = await (await request.get("/resources", { headers: empty(...SINGLETONS) })).text();
  expect(h).toMatch(/<a\b[^>]*href="\/capabilities"/);
});

test("the sitemap lists /capabilities with no made-up lastmod, and no noindex page", async ({
  request,
}) => {
  const xml = await (await request.get("/sitemap.xml", { headers: empty(...SINGLETONS) })).text();
  const entries = [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((m) => m[1]);
  const locs = entries.map((e) => e.match(/<loc>([^<]*)<\/loc>/)![1]);
  expect(new Set(locs).size, "no URL listed twice").toBe(locs.length);
  const cap = entries.find((e) =>
    e.includes("<loc>https://medicalsolutionsoftx.com/capabilities</loc>"),
  );
  expect(cap, "/capabilities is listed").toBeDefined();
  expect(cap).not.toContain("<lastmod>");
  // The Privacy Policy is noindex while it is a draft; a sitemap shouldn't
  // advertise a page that asks not to be indexed.
  const privacy = await (await request.get("/privacy", { headers: empty(...SINGLETONS) })).text();
  const draft = privacy.includes('<meta name="robots" content="noindex"');
  expect(locs.includes("https://medicalsolutionsoftx.com/privacy")).toBe(!draft);
});
