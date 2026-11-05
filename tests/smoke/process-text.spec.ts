import { test, expect } from "@playwright/test";

// MSOT Marketing's Developer Brief Part 2, §14a and §14b: the Process FAQ
// answers, About's service lines and the Process timeline exist as text in the
// server HTML, and images that carry words say them in their alt text. The
// expected strings are written out here, not imported, so a wrong value in the
// page fails.
const html = async (request: import("@playwright/test").APIRequestContext, path: string) =>
  (await request.get(path)).text();

const FAQ_ANSWERS = [
  "In the 2016 Kingdomware Techs., Inc. v. United States case",
  "The timeline for this process begins with a Medical Manufacturer getting approval on the ECAT. Typically 45 working days or less.",
];

const ABOUT_ANSWERS = [
  "Distribution and pricing agreements allow you to set prices and gain direct access to the military market.",
  "Getting listed in an e-catalog gives you the advantage of increased reach",
  "nine VA FSS programs",
  "we're the perfect partner to point you in the right direction",
];

const TIMELINE = [
  [
    "Week 1",
    "01",
    "Kickoff and contract plan",
    "MSOT reviews your products and picks the right path: ECAT, FSS, DAPA or a mix.",
  ],
  [
    "Typically 45 working days or less",
    "02",
    "Approval and ECAT listing",
    "MSOT prepares and submits the paperwork, and your products appear on ECAT once approved.",
  ],
  [
    "About 7 days",
    "03",
    "Rollout to DoW bases and VA facilities",
    "Your products become available to order at VA and DoW treatment facilities.",
  ],
  [
    "Ongoing",
    "04",
    "Orders and cases ship",
    "MSOT handles orders, invoicing and delivery from this point on.",
  ],
  [
    "As needed",
    "05",
    "Contract maintenance",
    "MSOT keeps your contracts current with price updates, new items and renewals.",
  ],
];

const PARTNERS = [
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
];

const text = (h: string) =>
  h
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ");

const alts = (h: string) => [...h.matchAll(/<img\b[^>]*\balt="([^"]*)"/g)].map((m) => m[1]);

test("Process: every FAQ answer is in the server HTML, inside a <details>", async ({ request }) => {
  const h = await html(request, "/process");
  const details = h.match(/<details[\s\S]*?<\/details>/g) ?? [];
  expect(details).toHaveLength(FAQ_ANSWERS.length);
  FAQ_ANSWERS.forEach((answer, i) => expect(text(details[i])).toContain(answer));
});

test("About: the DAPA, ECAT, FSS and getting-started lines are in the server HTML", async ({
  request,
}) => {
  const h = await html(request, "/about");
  const details = (h.match(/<details[\s\S]*?<\/details>/g) ?? []).map(text).join(" ");
  for (const answer of ABOUT_ANSWERS) expect(details).toContain(answer);
});

for (const path of ["/process", "/about"]) {
  test(`${path}: no Lorem ipsum, and no old 30-to-90-day timing`, async ({ request }) => {
    const t = text(await html(request, path));
    expect(t).not.toMatch(/lorem ipsum/i);
    expect(t).not.toMatch(/30\s*(?:to|–|-)\s*90/);
    expect(t).not.toMatch(/Manufacturer Alpha/i);
  });
}

test("the FAQ opens and closes without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/process");
  const answer = page.getByText(FAQ_ANSWERS[0]);
  await expect(answer).toBeHidden();
  await page.locator("details > summary").first().click();
  await expect(answer).toBeVisible();
  await page.locator("details > summary").first().click();
  await expect(answer).toBeHidden();
  await context.close();
});

test("Process: the timeline is an ordered list of Marketing's five steps, as text", async ({
  request,
}) => {
  const h = await html(request, "/process");
  const ol = h.match(/<ol[^>]*data-testid="timeline"[^>]*>([\s\S]*?)<\/ol>/);
  expect(ol, "the timeline <ol> is in the server HTML").not.toBeNull();
  const items = (ol![1].match(/<li[\s\S]*?<\/li>/g) ?? []).map(text);
  expect(items).toHaveLength(5);
  TIMELINE.forEach((parts, i) => {
    for (const part of parts) expect(items[i]).toContain(part);
  });
  expect(text(h)).toContain("What does a typical timeline look like?");
  expect(h).not.toMatch(/process\/timeline(_mobile)?[.\w-]*\.svg/);
});

test("Partners: each client logo's alt is the company's name", async ({ request }) => {
  const a = alts(await html(request, "/partners"));
  expect(a).not.toContain("partner logo");
  for (const name of PARTNERS) expect(a, name).toContain(name);
});

test("Home: images with words say them; decorative images say nothing", async ({ request }) => {
  const a = alts(await html(request, "/"));
  expect(a).not.toContain("timelines");
  // Two VOSB badges on Home: the hero box's and the footer's.
  expect(a.filter((x) => x === "Veteran-Owned Small Business (VOSB)")).toHaveLength(2);
  expect(a).toContain("Revogen");
  expect(a).not.toContain("veteran owned small business logo");
  const timelines = a.filter((x) => x.startsWith("A timeline of"));
  expect(timelines).toHaveLength(3);
  expect(timelines[0]).toContain("deployment overseas: critical medical supplies save lives");
  expect(timelines[1]).toContain("raising a family: medical care and procedures");
  expect(timelines[2]).toContain("veteran and retiree: caring for our veterans after retirement");
});

for (const path of ["/", "/about", "/partners", "/process"]) {
  test(`${path}: no placeholder alt text`, async ({ request }) => {
    const a = alts(await html(request, path));
    for (const bad of ["dots", "pats", "surgeons placeholder", "partner logo", "timelines"])
      expect(a, bad).not.toContain(bad);
  });
}
