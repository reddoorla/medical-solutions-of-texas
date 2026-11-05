import { test, expect } from "@playwright/test";
import { NotFoundError, RepositoryNotFoundError } from "@prismicio/client";
import { lines, loadSingle, text } from "../../src/lib/content";
import { HOME_COPY, homeCopy } from "../../src/lib/copy/home";
import type { HomePageDocument } from "../../prismicio-types";

// Home's copy moves into Prismic's `home_page` singleton (the operator, 11-05:
// "all content should be in prismic, not in code"). Every field falls back to
// today's wording when the document leaves it empty, and a missing document
// changes nothing. Today's wording is written out here, not read from
// src/lib/copy/home.ts, so a wrong value there fails.

const client = (getSingle: () => Promise<unknown>) =>
  ({ getSingle }) as unknown as Parameters<typeof loadSingle>[0];
const para = (t: string) => [{ type: "paragraph", text: t, spans: [] }] as never;
const doc = (data: Record<string, unknown>) => ({ data }) as unknown as HomePageDocument;

test("text: a filled field wins, trimmed; empty or blank keeps today's wording", () => {
  expect(text("  New  ", "Old")).toBe("New");
  expect(text("", "Old")).toBe("Old");
  expect(text("   ", "Old")).toBe("Old");
  expect(text(null, "Old")).toBe("Old");
  expect(text(undefined, "Old")).toBe("Old");
});

test("lines: Shift+Enter breaks the heading; blank lines drop; empty keeps today's lines", () => {
  expect(lines(para("establish\ngoals"), ["a", "b"])).toEqual(["establish", "goals"]);
  expect(lines(para("  one line  "), ["a", "b"])).toEqual(["one line"]);
  expect(lines(para("first\n\n  \nsecond"), ["a"])).toEqual(["first", "second"]);
  expect(lines([] as never, ["a", "b"])).toEqual(["a", "b"]);
  expect(lines(para("  \n "), ["a", "b"])).toEqual(["a", "b"]);
  expect(lines(null, ["a", "b"])).toEqual(["a", "b"]);
});

test('loadSingle: the client\'s own "No documents were returned" is no document', async () => {
  const none = client(async () => {
    throw new NotFoundError("No documents were returned", "", undefined);
  });
  expect(await loadSingle(none, "home_page", { strict: true })).toBeNull();
  expect(await loadSingle(none, "home_page", { strict: false })).toBeNull();
  const found = client(async () => doc({ trusted_heading: "Hi" }));
  expect(await loadSingle(found, "home_page", { strict: true })).toEqual(
    doc({ trusted_heading: "Hi" }),
  );
});

test("loadSingle: while building, any other error stops the build", async () => {
  const down = client(async () => {
    throw new Error("Prismic is down");
  });
  await expect(loadSingle(down, "home_page", { strict: true })).rejects.toThrow("Prismic is down");
  // A wrong repository name and any other Content API 404 are NotFoundErrors too.
  const wrongRepo = client(async () => {
    throw new RepositoryNotFoundError("Repository not found", "", undefined);
  });
  await expect(loadSingle(wrongRepo, "home_page", { strict: true })).rejects.toThrow(
    "Repository not found",
  );
  const otherNotFound = client(async () => {
    throw new NotFoundError("Some other 404", "", { type: "api_notfound_error" });
  });
  await expect(loadSingle(otherNotFound, "home_page", { strict: true })).rejects.toThrow(
    "Some other 404",
  );
});

test("loadSingle: at request time an error (an expired preview cookie) keeps today's wording", async () => {
  const expired = client(async () => {
    throw new Error("This preview token has expired");
  });
  expect(await loadSingle(expired, "home_page", { strict: false })).toBeNull();
});

test("homeCopy: no document is today's wording; a filled field wins, field by field", () => {
  const today = homeCopy(null);
  expect(today.trusted_heading).toBe("Your Trusted Partner");
  expect(today.help_heading).toBe("We’re here to help");
  expect(today.answer_heading).toBe("What You’ll get With MSOT");
  expect(today.cta_line).toBe("let’s get started");
  expect(today.capabilities_button).toBe("Capabilities Statement");
  expect(today.we_get_1).toEqual(["Priority", "Access"]);
  expect(today.step_3).toEqual(["Set pricing", "direct invoicing"]);
  expect(today.partner_quote).toMatch(/^“MSOT made the process .* DoD and VA hospital systems\.”$/);

  const some = homeCopy(doc({ help_heading: "New help", step_1: para("New\nsteps") }));
  expect(some.help_heading).toBe("New help");
  expect(some.step_1).toEqual(["New", "steps"]);
  // Untouched fields keep today's wording.
  expect(some.trusted_heading).toBe("Your Trusted Partner");
  expect(some.step_2).toEqual(["Find Your", "access points"]);
  // Every field of today's wording has a field in the result, and no more.
  expect(Object.keys(some).sort()).toEqual(Object.keys(HOME_COPY).sort());
});

const visible = (html: string) =>
  html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ");

// Fields Home shows in an attribute, not as text.
const ATTRIBUTES: Record<string, string> = {
  vosb_logo_alt: "alt",
  partner_logo_alt: "alt",
};

test("Home reads the document: every field, in every section", async ({ request }) => {
  const html = await (
    await request.get("/", { headers: { cookie: "msot-home-fixture=1" } })
  ).text();
  const shown = visible(html);
  // Svelte's hydration markers (<!--[-->) sit between a step's lines in dev.
  const page = html.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<!--[\s\S]*?-->/g, "");
  for (const [field, today] of Object.entries(HOME_COPY)) {
    if (field === "video_title") continue; // mounted only after a visitor engages; below
    if (ATTRIBUTES[field]) {
      expect(page, field).toContain(`${ATTRIBUTES[field]}="Fixture ${field}"`);
    } else if (Array.isArray(today)) {
      // The server renders the desktop width, where "We'll Get You" joins its lines.
      const words = today.map((_, i) => `Fixture ${field} ${i + 1}`);
      expect(shown, field).toContain(words.join(" "));
    } else {
      expect(shown, field).toMatch(new RegExp(`Fixture ${field}(?!\\w)`));
    }
  }
  // Each field sits where its string sits: in the page's order, so two fields
  // swapped (the hero's and the closing section's "Contact Us", the problem and
  // answer columns) fail. "We'll Get You"'s video title mounts later; skip it.
  const order = Object.keys(HOME_COPY).filter((f) => f !== "video_title");
  const firstAt = (f: string) => page.search(new RegExp(`Fixture ${f}(?!\\w)`));
  expect(
    [...order].sort((a, b) => firstAt(a) - firstAt(b)),
    "fields in page order",
  ).toEqual(order);
  // The VOSB alt is the hero's logo, not the footer's.
  expect(page).toMatch(/alt="Fixture vosb_logo_alt"[\s\S]*Fixture trusted_text/);
  // The Capabilities button's accessible name starts with its visible label.
  expect(page).toContain('aria-label="Fixture capabilities_button (PDF, opens in a new tab)"');
  // "Getting started"'s steps keep their line break.
  for (const step of ["step_1", "step_2", "step_3"]) {
    expect(page, step).toMatch(new RegExp(`Fixture ${step} 1\\s*<br\\s*/?>\\s*Fixture ${step} 2`));
  }
  // No section still shows today's words.
  for (const today of [
    "Your Trusted Partner",
    "deep network of relationships",
    "We'll Get You",
    "Priority Access",
    "The Clinician in Mind",
    "We Know What to Do",
    "Government Contracts Are",
    "We’re here to help",
    "Our Partner",
    "invaluable partnership",
    "Getting started",
    "establish",
    "let’s get started",
    "Learn More",
    "Contact Us",
    "Capabilities Statement",
  ]) {
    expect(shown, today).not.toContain(today);
  }
});

test("Home's phone width breaks We'll Get You across lines, from the document", async ({
  page,
  baseURL,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.context().addCookies([{ name: "msot-home-fixture", value: "1", url: baseURL ?? "" }]);
  await page.route("**/player.vimeo.com/**", (r) => r.abort());
  await page.goto("/");
  const heading = page.locator("h2", { hasText: "Fixture we_get_1 1" });
  await expect(heading).toHaveCount(1);
  // The page swaps to its phone markup once it hydrates at this width.
  await expect
    .poll(async () => (await heading.innerHTML()).replace(/<!--[\s\S]*?-->/g, ""))
    .toMatch(/Fixture we_get_1 1\s*<br\s*\/?>\s*Fixture we_get_1 2/);
  // The background video's title is the document's too, once it mounts.
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 4));
  await expect(async () => {
    await page.keyboard.press("Shift");
    await expect(page.locator('iframe[title="Fixture video_title"]')).toBeAttached({
      timeout: 3000,
    });
  }).toPass({ timeout: 30_000 });
});

test("with no document, Home shows today's words", async ({ request }) => {
  const shown = visible(await (await request.get("/")).text());
  for (const today of [
    "Your Trusted Partner",
    "We'll Get You",
    "Priority Access",
    "We’re here to help",
    "What You’ll get With MSOT",
    "is simple with msot",
    "let’s get started",
  ]) {
    expect(shown, today).toContain(today);
  }
  expect(shown).not.toContain("Fixture");
});
