import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { buildTeam } from "../../src/lib/team";
import type { TeamMemberDocument } from "../../prismicio-types";

// MSOT Marketing's Developer Brief Part 1, §8 and §9: bios and headshots
// editable in Prismic (a `team_member` type), with today's cards staying until
// each person's document exists.

const doc = (data: Record<string, unknown>) => ({ data }) as unknown as TeamMemberDocument;
const NONE = { headshot: {}, bio: [], linkedin: { link_type: "Any" }, order: null };
const IMAGE = {
  url: "https://images.prismic.io/msot/jon.jpg",
  dimensions: { width: 800, height: 800 },
  alt: null,
  copyright: null,
  id: "x",
  edit: { x: 0, y: 0, zoom: 1, background: "transparent" },
};
const BIO = [{ type: "paragraph", text: "Jon Hood founded MSOT.", spans: [] }];
const CURRENT = [
  { name: "Jon Hood", title: "CEO", headshot: "/jon.svg" },
  { name: "David Lange", title: "President", headshot: "/tim.png" },
  { name: "Kylene Carse", title: "Chief Financial Officer", headshot: "/kylene.png" },
];
const names = (cards: { name: string }[]) => cards.map((c) => c.name);

test("buildTeam: with no documents, today's cards in today's order", () => {
  const cards = buildTeam([], CURRENT, "/placeholder.png");
  expect(names(cards)).toEqual(["Jon Hood", "David Lange", "Kylene Carse"]);
  expect(cards[1].alt).toBe("David Lange, President, Medical Solutions of Texas.");
  expect(cards[1].bio).toBeUndefined();
});

test("buildTeam: one published document replaces its card and keeps everyone else", () => {
  const cards = buildTeam(
    [
      doc({
        ...NONE,
        name: "Jon Hood",
        job_title: "CEO",
        headshot: IMAGE,
        bio: BIO,
        linkedin: { link_type: "Web", url: "https://www.linkedin.com/in/jon-hood" },
      }),
    ],
    CURRENT,
    "/placeholder.png",
  );
  expect(names(cards)).toEqual(["Jon Hood", "David Lange", "Kylene Carse"]);
  const jon = cards[0];
  expect(jon.headshot).toMatch(/^https:\/\/images\.prismic\.io\/msot\/jon\.jpg\?/);
  expect(jon.headshot).toContain("w=768");
  // §8: "WebP or AVIF with a JPG fallback", which Prismic's imgix serves by format.
  expect(jon.headshot).toContain("auto=format");
  expect(jon.bio).toEqual(BIO);
  expect(jon.linkedin).toBe("https://www.linkedin.com/in/jon-hood");
  expect(cards[1].headshot).toBe("/tim.png");
});

test("buildTeam: order places people, a new person is added, nothing is ever empty", () => {
  const cards = buildTeam(
    [
      // No headshot yet: keeps the image the site shows for them (§8).
      doc({ ...NONE, name: "Kylene Carse", job_title: "Chief Financial Officer", order: 1 }),
      // New, with no headshot and no current image: the placeholder.
      doc({ ...NONE, name: "New Hire", job_title: null, order: 2 }),
      // Skipped: no name, or only spaces.
      doc({ ...NONE, name: null, job_title: "Nobody", order: 0 }),
      doc({ ...NONE, name: "   ", job_title: "Nobody", order: 0 }),
    ],
    CURRENT,
    "/placeholder.png",
  );
  // "order N" means Nth: Kylene first, the new hire second, then today's
  // cards with no document in today's order.
  expect(names(cards)).toEqual(["Kylene Carse", "New Hire", "Jon Hood", "David Lange"]);
  const kylene = cards.find((c) => c.name === "Kylene Carse")!;
  expect(kylene.headshot).toBe("/kylene.png");
  expect(kylene.bio).toBeUndefined();
  expect(kylene.linkedin).toBeUndefined();
  const hire = cards.find((c) => c.name === "New Hire")!;
  expect(hire.headshot).toBe("/placeholder.png");
  expect(hire.alt).toBe("New Hire, Medical Solutions of Texas.");
});

test("buildTeam: the last person in today's list, given order 1, comes first", () => {
  const cards = buildTeam(
    [doc({ ...NONE, name: "Kylene Carse", job_title: "Chief Financial Officer", order: 1 })],
    CURRENT,
    "/placeholder.png",
  );
  expect(names(cards)).toEqual(["Kylene Carse", "Jon Hood", "David Lange"]);
});

// Round 3: today's five cards, published one at a time and numbered 1 to 5.
const FIVE = [
  { name: "Jon Hood", title: "CEO", headshot: "/jon.svg" },
  { name: "David Lange", title: "President", headshot: "/tim.png" },
  { name: "Kylene Carse", title: "Chief Financial Officer", headshot: "/kylene.png" },
  { name: "Courtney Alexander", title: "Operations", headshot: "/courtney.png" },
  { name: "Kathy Castro", title: "Accounts", headshot: "/kathy.png" },
];
const placed = (orders: [string, number][], extra: string[] = []) =>
  names(
    buildTeam(
      [
        ...orders.map(([name, order]) => doc({ ...NONE, name, job_title: "T", order })),
        ...extra.map((name) => doc({ ...NONE, name, job_title: "T" })),
      ],
      FIVE,
      "/placeholder.png",
    ),
  );

test("buildTeam: order N is the Nth place even when only some people have documents", () => {
  // Jon alone at 5 is 5th, not 4th.
  expect(placed([["Jon Hood", 5]])).toEqual([
    "David Lange",
    "Kylene Carse",
    "Courtney Alexander",
    "Kathy Castro",
    "Jon Hood",
  ]);
  // Kylene 1 and Courtney 2: Courtney is 2nd.
  expect(
    placed([
      ["Kylene Carse", 1],
      ["Courtney Alexander", 2],
    ]),
  ).toEqual(["Kylene Carse", "Courtney Alexander", "Jon Hood", "David Lange", "Kathy Castro"]);
  // Kathy 1 and a new hire 2: the new hire is 2nd.
  expect(
    placed([
      ["Kathy Castro", 1],
      ["New Hire", 2],
    ]),
  ).toEqual([
    "Kathy Castro",
    "New Hire",
    "Jon Hood",
    "David Lange",
    "Kylene Carse",
    "Courtney Alexander",
  ]);
  // Jon at 2 puts David first.
  expect(placed([["Jon Hood", 2]])).toEqual([
    "David Lange",
    "Jon Hood",
    "Kylene Carse",
    "Courtney Alexander",
    "Kathy Castro",
  ]);
  // All five numbered 5 to 1: exactly reversed.
  expect(
    placed([
      ["Jon Hood", 5],
      ["David Lange", 4],
      ["Kylene Carse", 3],
      ["Courtney Alexander", 2],
      ["Kathy Castro", 1],
    ]),
  ).toEqual(["Kathy Castro", "Courtney Alexander", "Kylene Carse", "David Lange", "Jon Hood"]);
  // A document with no order keeps today's place; a new person with no order
  // goes after today's cards; an order past the end goes last of all.
  expect(placed([["Kylene Carse", 99]], ["David Lange", "New Hire"])).toEqual([
    "Jon Hood",
    "David Lange",
    "Courtney Alexander",
    "Kathy Castro",
    "New Hire",
    "Kylene Carse",
  ]);
  // Two at 1 go by name, and both come before the rest.
  expect(
    placed([
      ["Kathy Castro", 1],
      ["Courtney Alexander", 1],
    ]),
  ).toEqual(["Courtney Alexander", "Kathy Castro", "Jon Hood", "David Lange", "Kylene Carse"]);
});

test("buildTeam: case, spacing or a pasted non-breaking space never makes a second card", () => {
  for (const typed of [
    "jon hood",
    "Jon  Hood",
    "Jon\u00a0Hood",
    " Jon Hood ",
    "Jon\u200b Hood",
    "\ufeffJon Hood",
  ]) {
    const cards = buildTeam(
      [doc({ ...NONE, name: typed, job_title: "CEO", bio: BIO })],
      CURRENT,
      "/placeholder.png",
    );
    expect(cards, JSON.stringify(typed)).toHaveLength(3);
    expect(cards[0].bio, JSON.stringify(typed)).toEqual(BIO);
  }
});

test("buildTeam: of two documents with one name, the first (by order) wins", () => {
  const cards = buildTeam(
    [
      doc({ ...NONE, name: "Jon Hood", job_title: "CEO", order: 1 }),
      doc({ ...NONE, name: "Jon Hood", job_title: "Chief Executive", order: 4 }),
    ],
    CURRENT,
    "/placeholder.png",
  );
  expect(cards.filter((c) => c.name === "Jon Hood").map((c) => c.title)).toEqual(["CEO"]);
});

test("the team_member model holds name, job title, headshot, bio, LinkedIn and order", () => {
  const model = JSON.parse(readFileSync("customtypes/team_member/index.json", "utf8"));
  expect(model.id).toBe("team_member");
  expect(model.repeatable).toBe(true);
  const types = Object.fromEntries(
    Object.entries(model.json.Main as Record<string, { type: string }>).map(([k, v]) => [
      k,
      v.type,
    ]),
  );
  expect(types).toEqual({
    name: "Text",
    job_title: "Text",
    headshot: "Image",
    bio: "StructuredText",
    linkedin: "Link",
    order: "Number",
  });
  expect(model.json.Main.headshot.config.constraint).toEqual({ width: 800, height: 800 });
});

const cardNames = (html: string) =>
  [...html.matchAll(/data-testid="team-card"[\s\S]*?<h3\b[^>]*>([^<]*)<\/h3>/g)].map((m) =>
    m[1].trim(),
  );

test("until Prismic has team documents, /about shows today's five cards, with §8's alt text and no bio", async ({
  request,
}) => {
  const html = await (await request.get("/about")).text();
  expect(cardNames(html)).toEqual([
    "Jon Hood",
    "David Lange",
    "Kylene Carse",
    "Courtney Alexander",
    "Kathy Castro",
  ]);
  for (const [name, title] of [
    ["Jon Hood", "CEO"],
    ["David Lange", "President"],
    ["Kylene Carse", "Chief Financial Officer"],
    ["Courtney Alexander", "Government Accounts Coordinator"],
    ["Kathy Castro", "Operations Administrator"],
  ]) {
    expect(html).toContain(`alt="${name}, ${title}, Medical Solutions of Texas."`);
  }
  expect(html).not.toContain('data-testid="team-bio"');
  expect(html).not.toMatch(/Lorem ipsum/i);
});

// `vite dev` serves two fixture documents at /about?team-fixture
// (src/lib/team-fixture.ts): Jon Hood with a bio and LinkedIn, and a new hire.
test("a published document shows its bio and LinkedIn link, and the other cards stay", async ({
  page,
  request,
}) => {
  const html = await (await request.get("/about?team-fixture")).text();
  // The new hire's order 1 puts it first, and Jon's document (no order) keeps
  // his place: both at 1, by name.
  expect(cardNames(html)).toEqual([
    "Fixture New Hire",
    "Jon Hood",
    "David Lange",
    "Kylene Carse",
    "Courtney Alexander",
    "Kathy Castro",
  ]);
  await page.goto("/about?team-fixture");
  const jon = page.getByTestId("team-card").nth(1);
  await expect(jon.getByTestId("team-bio")).toHaveText("Fixture bio for Jon Hood.");
  const link = jon.getByRole("link", { name: "LinkedIn profile of Jon Hood (opens in a new tab)" });
  await expect(link).toHaveAttribute("href", "https://www.linkedin.com/in/fixture-jon-hood");
  await expect(link).toHaveAttribute("target", "_blank");
  await expect(page.getByTestId("team-bio")).toHaveCount(1);
});

test("a team card with no popup is not a button", async ({ page }) => {
  await page.goto("/about");
  const card = page.getByTestId("team-card").first();
  await expect(card.getByRole("heading", { name: "Jon Hood" })).toBeAttached();
  await expect(card.locator("button")).toHaveCount(0);
  // No button role and no empty tab stop, on the card or inside it.
  await expect(card.getByRole("button")).toHaveCount(0);
  await expect(card.locator("[tabindex]")).toHaveCount(0);
});
