import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { teamFromPrismic } from "../../src/lib/team";
import type { TeamMemberDocument } from "../../prismicio-types";

// MSOT Marketing's Developer Brief Part 1, §8 and §9: bios and headshots
// editable in Prismic (a `team_member` type), with today's cards until the
// documents exist.

const doc = (data: Record<string, unknown>) => ({ data }) as unknown as TeamMemberDocument;
const IMAGE = {
  url: "https://images.prismic.io/msot/jon.jpg?auto=format",
  dimensions: { width: 800, height: 800 },
  alt: null,
  copyright: null,
  id: "x",
  edit: { x: 0, y: 0, zoom: 1, background: "transparent" },
};
const BIO = [{ type: "paragraph", text: "Jon Hood founded MSOT.", spans: [] }];
const CURRENT = { "Kylene Carse": "/kylene.png" };

test("teamFromPrismic orders, skips nameless documents and never leaves a card empty", () => {
  const cards = teamFromPrismic(
    [
      doc({
        name: "Kathy Castro",
        job_title: "Operations Administrator",
        headshot: {},
        bio: [],
        linkedin: { link_type: "Any" },
        order: null,
      }),
      doc({
        name: "Kylene Carse",
        job_title: "Chief Financial Officer",
        headshot: {},
        bio: [],
        linkedin: { link_type: "Any" },
        order: 3,
      }),
      doc({
        name: null,
        job_title: "Nobody",
        headshot: IMAGE,
        bio: BIO,
        linkedin: { link_type: "Any" },
        order: 0,
      }),
      doc({
        name: "Jon Hood",
        job_title: "CEO",
        headshot: IMAGE,
        bio: BIO,
        linkedin: { link_type: "Web", url: "https://www.linkedin.com/in/jon-hood" },
        order: 1,
      }),
    ],
    CURRENT,
    "/placeholder.png",
  );
  expect(cards.map((c) => c.name)).toEqual(["Jon Hood", "Kylene Carse", "Kathy Castro"]);
  const [jon, kylene, kathy] = cards;
  expect(jon.alt).toBe("Jon Hood, CEO, Medical Solutions of Texas.");
  expect(jon.headshot).toMatch(/^https:\/\/images\.prismic\.io\/msot\/jon\.jpg\?/);
  expect(jon.headshot).toContain("w=768");
  expect(jon.bio).toEqual(BIO);
  expect(jon.linkedin).toBe("https://www.linkedin.com/in/jon-hood");
  // No headshot yet: keep the image the site already shows for them (§8).
  expect(kylene.headshot).toBe("/kylene.png");
  expect(kylene.bio).toBeUndefined();
  expect(kylene.linkedin).toBeUndefined();
  // No current image either: the placeholder, never an empty card.
  expect(kathy.headshot).toBe("/placeholder.png");
});

test("the team_member model holds name, title, headshot, bio, LinkedIn and order", () => {
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

test("until Prismic has team documents, /about shows today's five cards, with §8's alt text and no bio", async ({
  request,
}) => {
  const html = await (await request.get("/about")).text();
  const cards = [...html.matchAll(/data-testid="team-card"[\s\S]*?<h3\b[^>]*>([^<]*)<\/h3>/g)].map(
    (m) => m[1].trim(),
  );
  expect(cards).toEqual([
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

test("a team card with no popup is not a button", async ({ page }) => {
  await page.goto("/about");
  const card = page.getByTestId("team-card").first();
  await expect(card.getByRole("heading", { name: "Jon Hood" })).toBeAttached();
  await expect(card.locator("button")).toHaveCount(0);
});
