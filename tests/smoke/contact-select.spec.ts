import { test, expect, type Page, type Request } from "@playwright/test";
import { emptyCookies } from "./empty";

// Pin the code's wording whatever is published in Prismic (./empty).
test.beforeEach(({ context, baseURL }) => emptyCookies(context, baseURL));

// The contact form's "Select Interest" field is a native <select name="select">
// (it replaced svelte-select on 2026-11-03). The server action forwards
// form.get("select") as `interest`, so the field name and its values are the
// contract. These tests submit the real form and read the field off the POST
// itself, stubbing the response so nothing reaches the forms ingest.

/** Reads one field out of a submitted multipart or urlencoded body. */
function submittedField(request: Request, name: string): string | null {
  const body = request.postDataBuffer()?.toString("utf8") ?? "";
  const type = request.headers()["content-type"] ?? "";
  if (type.includes("application/x-www-form-urlencoded")) {
    return new URLSearchParams(body).get(name);
  }
  const part = body.match(new RegExp(`name="${name}"\\r\\n\\r\\n([^\\r]*)\\r\\n`));
  return part ? part[1] : null;
}

async function submitContactForm(page: Page, choose?: string): Promise<Request> {
  let posted: Request | undefined;
  await page.route("**/contact**", async (route) => {
    if (route.request().method() !== "POST") return route.fallback();
    posted = route.request();
    // A SvelteKit action success: devalue-encoded `{ success: true }`.
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ type: "success", status: 200, data: '[{"success":1},true]' }),
    });
  });

  await page.goto("/contact", { waitUntil: "networkidle" });
  const form = page.locator("form");
  await form.getByPlaceholder("Email").fill("probe@example.com");
  await form.getByPlaceholder("Your Message").fill("Contact select test");
  if (choose) await form.getByLabel("Interest").selectOption(choose);
  await form.getByRole("button", { name: "Submit" }).click();

  await expect(page.getByRole("status")).toContainText("your message has been sent");
  expect(posted, "the form posted to /contact").toBeDefined();
  return posted!;
}

test("choosing an interest submits it as the `select` field", async ({ page }) => {
  const request = await submitContactForm(page, "DoW Contracts");
  expect(submittedField(request, "select")).toBe("DoW Contracts");
});

test("an untouched select still submits `select=Select Interest`, as svelte-select's hidden input did", async ({
  page,
}) => {
  const request = await submitContactForm(page);
  expect(submittedField(request, "select")).toBe("Select Interest");
});

test("the select offers the three interests by name", async ({ page }) => {
  await page.goto("/contact", { waitUntil: "networkidle" });
  const options = page.locator('select[name="select"] option:not([hidden])');
  await expect(options).toHaveText(["VA Contracts", "DoW Contracts", "Both"]);
  expect(
    await options.evaluateAll((els) => els.map((e) => (e as HTMLOptionElement).value)),
  ).toEqual(["VA Contracts", "DoW Contracts", "Both"]);
});
