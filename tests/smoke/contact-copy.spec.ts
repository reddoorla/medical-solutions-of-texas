import { test, expect } from "@playwright/test";
import { CONTACT_COPY, contactCopy } from "../../src/lib/copy/contact";
import type { ContactPageDocument } from "../../prismicio-types";

// Contact's copy moves into Prismic's `contact_page` singleton (the operator,
// 11-05: "all content should be in prismic, not in code"). Every field falls
// back to today's wording when the document leaves it empty, and a missing
// document changes nothing. Today's wording is written out here, not read from
// src/lib/copy/contact.ts, so a wrong value there fails.

const doc = (data: Record<string, unknown>) => ({ data }) as unknown as ContactPageDocument;

test("contactCopy: no document is today's wording; a filled field wins, field by field", () => {
  const today = contactCopy(null);
  expect(today).toEqual({
    heading: "CONTACT US",
    intro: "We’d love to hear from you.",
    phone_label: "Phone:",
    email_label: "Email",
    name_label: "Your Name / Company",
    interest_label: "Interest",
    interest_placeholder: "Select Interest",
    interests: [{ option: "VA Contracts" }, { option: "DoW Contracts" }, { option: "Both" }],
    message_label: "Your Message",
    submit_button: "Submit",
    sending_button: "Sending…",
    success_heading: "Thank you — your message has been sent.",
    success_text: "We’ll be in touch shortly.",
  });

  const some = contactCopy(
    doc({ intro: "Hello.", interests: [{ option: "" }, { option: "Only this" }] }),
  );
  expect(some.intro).toBe("Hello.");
  // A row needs its words; the rows replace the whole list.
  expect(some.interests).toEqual([{ option: "Only this" }]);
  expect(some.heading).toBe("CONTACT US");
  expect(Object.keys(some).sort()).toEqual(Object.keys(CONTACT_COPY).sort());
  // With no row to show, today's three.
  expect(contactCopy(doc({ interests: [{ option: " " }] })).interests).toHaveLength(3);
});

const visible = (html: string) =>
  html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ");

/** The page's own section: after the site's nav, before the shared footer's band. */
const main = (html: string) => {
  const b = html.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<!--[\s\S]*?-->/g, "");
  return b.slice(b.indexOf('<section class="bg-light'), b.indexOf('<section class="bg-[#998B6A]'));
};

test("Contact reads the document: every field, in page order", async ({ request }) => {
  const html = main(
    await (await request.get("/contact", { headers: { cookie: "msot-contact-fixture=1" } })).text(),
  );
  const shown = visible(html);
  const words = [
    "Fixture heading",
    "Fixture intro",
    "Fixture phone_label",
    "Fixture email_label",
    "Fixture name_label",
    "Fixture interest_label",
    "Fixture interest_placeholder",
    "Fixture interests 1 option",
    "Fixture interests 2 option",
    "Fixture interests 3 option",
    "Fixture message_label",
    "Fixture submit_button",
  ];
  for (const w of words) expect(shown, w).toMatch(new RegExp(`${w}(?!\\w)`));
  const at = (w: string) => shown.search(new RegExp(`${w}(?!\\w)`));
  expect(
    [...words].sort((a, b) => at(a) - at(b)),
    "fields in page order",
  ).toEqual(words);
  // Each visible box's hint is its own field, the same words as its label.
  for (const [name, field] of [
    ["email", "email_label"],
    ["name", "name_label"],
  ]) {
    expect(html).toMatch(
      new RegExp(
        `<input[^>]*name="${name}"[^>]*placeholder="Fixture ${field}"|<input[^>]*placeholder="Fixture ${field}"[^>]*name="${name}"`,
      ),
    );
  }
  expect(html).toMatch(/<textarea[^>]*placeholder="Fixture message_label"/);
  // An untouched menu still sends "Select Interest"; a choice sends its words.
  expect(html).toMatch(
    /<option value="Select Interest"[^>]*>Fixture interest_placeholder<\/option>/,
  );
  for (const i of [1, 2, 3]) {
    expect(html).toContain(
      `<option value="Fixture interests ${i} option">Fixture interests ${i} option</option>`,
    );
  }
  // No section still shows today's words.
  for (const today of [
    "CONTACT US",
    "We’d love",
    "Phone:",
    "Your Name",
    "Interest",
    "VA Contracts",
    "DoW Contracts",
    "Both",
    "Your Message",
    "Submit",
  ]) {
    expect(shown, today).not.toContain(today);
  }
});

test("Contact's sent and sending words come from the document", async ({ page, baseURL }) => {
  await page
    .context()
    .addCookies([{ name: "msot-contact-fixture", value: "1", url: baseURL ?? "" }]);
  // Hold the form's POST, to see the button while it sends, then answer it as
  // SvelteKit's action would on success.
  let release: () => void = () => {};
  const held = new Promise<void>((r) => (release = r));
  await page.route("**/contact**", async (route) => {
    if (route.request().method() !== "POST") return route.fallback();
    await held;
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ type: "success", status: 200, data: '[{"success":1},true]' }),
    });
  });
  await page.goto("/contact", { waitUntil: "networkidle" });
  await page.locator('input[name="email"]').fill("probe@example.com");
  await page.locator('textarea[name="message"]').fill("hello");
  await page.locator('button[type="submit"]').click();
  await expect(page.locator('button[type="submit"]')).toContainText("Fixture sending_button");
  release();
  await expect(page.getByRole("status")).toContainText("Fixture success_heading");
  await expect(page.getByRole("status")).toContainText("Fixture success_text");
});

test("with no document, Contact shows today's words", async ({ request }) => {
  const html = main(await (await request.get("/contact")).text());
  const shown = visible(html);
  for (const w of [
    "CONTACT US",
    "We’d love to hear from you.",
    "Phone:",
    "Email",
    "Your Name / Company",
    "Interest",
    "Select Interest",
    "VA Contracts",
    "DoW Contracts",
    "Both",
    "Your Message",
    "Submit",
  ]) {
    expect(shown, w).toContain(w);
  }
  expect(html).toContain(
    '<option value="Select Interest" selected hidden>Select Interest</option>',
  );
  expect(html).toContain('<option value="DoW Contracts">DoW Contracts</option>');
  expect(html).toMatch(/<input[^>]*placeholder="Email"/);
});
