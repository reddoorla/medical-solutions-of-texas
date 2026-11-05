import { test, expect, type Page } from "@playwright/test";

// MSOT Marketing's Developer Brief Part 1, §1 and §3, as decided on 11-04
// (decision 2207, answer 1): Tag Manager, which fires the LinkedIn Insight Tag,
// loads on the visitor's first pointer, wheel, key or touch event, never on
// page load; GA4 stays hard-coded inside <head>; and a successful contact form
// pushes `msot_contact_submit`, with no personal data, never for the form-e2e
// probe's testMode submissions.

const GTM = "googletagmanager.com/gtm.js";

/** Answers every Tag Manager request with an empty script, and records it. */
async function watchGtm(page: Page) {
  const requests: string[] = [];
  await page.route(
    (url) => url.href.includes(GTM),
    async (route) => {
      requests.push(route.request().url());
      await route.fulfill({ status: 200, contentType: "text/javascript", body: "" });
    },
  );
  return requests;
}

async function loadIdle(page: Page, path = "/") {
  await page.goto(path, { waitUntil: "load" });
  await page.waitForTimeout(2000);
}

const gtmEvents = (page: Page) =>
  page.evaluate(() =>
    ((window as unknown as { dataLayer?: unknown[] }).dataLayer ?? []).filter(
      (e) => (e as { event?: string })?.event === "gtm.js",
    ),
  );

test("the server HTML has GA4 inside <head>, Tag Manager's ID, and no <noscript> iframe", async ({
  request,
}) => {
  const html = await (await request.get("/")).text();
  const headEnd = html.indexOf("</head>");
  const ga = html.indexOf("googletagmanager.com/gtag/js?id=G-BZ0WQMEE8L");
  expect(ga, "GA4's gtag.js is on the page").toBeGreaterThan(-1);
  expect(ga, "GA4's gtag.js sits inside <head>").toBeLessThan(headEnd);
  expect(html).toContain('"GTM-T4RZ2F54"');
  expect(html).not.toContain("googletagmanager.com/ns.html");
  // GA4 is never added through Tag Manager as well, which would count each view twice.
  expect(html.match(/gtag\("config"/g)).toHaveLength(1);
});

for (const path of ["/", "/contact", "/privacy"]) {
  test(`an unattended load of ${path} requests no Tag Manager`, async ({ page }) => {
    const requests = await watchGtm(page);
    await loadIdle(page, path);
    expect(requests).toEqual([]);
    expect(await gtmEvents(page)).toEqual([]);
  });
}

test("a pointermove with no movement (Chromium's own, after a layout shift) loads nothing", async ({
  page,
}) => {
  const requests = await watchGtm(page);
  await loadIdle(page);
  await page.evaluate(() =>
    window.dispatchEvent(new PointerEvent("pointermove", { movementX: 0, movementY: 0 })),
  );
  await page.waitForTimeout(500);
  expect(requests).toEqual([]);
});

const ENGAGE: Record<string, (page: Page) => Promise<void>> = {
  "a key press": (page) => page.keyboard.press("Shift"),
  "a pointer press": async (page) => {
    await page.mouse.down();
    await page.mouse.up();
  },
  "a wheel turn": (page) => page.mouse.wheel(0, 40),
  "a mouse move": (page) => page.mouse.move(40, 40),
};

for (const [name, engage] of Object.entries(ENGAGE)) {
  test(`${name} loads Tag Manager once`, async ({ page }) => {
    const requests = await watchGtm(page);
    await loadIdle(page);
    await engage(page);
    await expect.poll(() => requests.length).toBe(1);
    expect(requests[0]).toContain("id=GTM-T4RZ2F54");
    // More interaction never loads it again.
    await page.keyboard.press("Shift");
    await page.mouse.wheel(0, 40);
    await page.mouse.move(80, 80);
    await page.waitForTimeout(500);
    expect(requests).toHaveLength(1);
    expect(await gtmEvents(page)).toHaveLength(1);
  });
}

test.describe("touch", () => {
  test.use({ hasTouch: true });
  test("a tap loads Tag Manager", async ({ page }) => {
    const requests = await watchGtm(page);
    await loadIdle(page);
    await page.touchscreen.tap(20, 300);
    await expect.poll(() => requests.length).toBe(1);
  });
});

// --- the contact conversion -------------------------------------------------

const RESULTS = {
  success: { type: "success", status: 200, data: '[{"success":1},true]' },
  failure: { type: "failure", status: 400, data: '[{"error":1},"Please try again."]' },
};

async function submit(page: Page, result: keyof typeof RESULTS, testMode = false) {
  await watchGtm(page);
  await page.route("**/contact**", async (route) => {
    if (route.request().method() !== "POST") return route.fallback();
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(RESULTS[result]),
    });
  });
  await page.goto("/contact", { waitUntil: "networkidle" });
  const form = page.locator("form");
  if (testMode) {
    await form.evaluate((f) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = "testMode";
      input.value = "true";
      f.appendChild(input);
    });
  }
  await form.getByPlaceholder("Email").fill("person@example.com");
  await form.getByPlaceholder("Your Name / Company").fill("A Person");
  await form.getByPlaceholder("Your Message").fill("A message with details");
  await form.getByRole("button", { name: "Submit" }).click();
  if (result === "success") {
    await expect(page.getByRole("status")).toContainText("your message has been sent");
  } else {
    await expect(page.getByRole("alert")).toContainText("Please try again.");
  }
  await page.waitForTimeout(300);
  return page.evaluate(() =>
    ((window as unknown as { dataLayer?: unknown[] }).dataLayer ?? []).filter(
      (e) => (e as { event?: string })?.event === "msot_contact_submit",
    ),
  );
}

test("a successful send pushes msot_contact_submit once, with no personal data", async ({
  page,
}) => {
  // Google's own scripts stamp `gtm.*` bookkeeping keys onto every pushed
  // event (GA4's gtag.js added `gtm.uniqueEventId`); only our keys are ours.
  const pushed = (await submit(page, "success")).map((e) =>
    Object.fromEntries(Object.entries(e as object).filter(([k]) => !k.startsWith("gtm."))),
  );
  expect(pushed).toEqual([{ event: "msot_contact_submit", form_name: "contact" }]);
  expect(JSON.stringify(pushed)).not.toMatch(/person@example\.com|A Person|A message/);
});

test("a failed send pushes nothing", async ({ page }) => {
  expect(await submit(page, "failure")).toEqual([]);
});

test("the form-e2e probe's testMode send pushes nothing", async ({ page }) => {
  expect(await submit(page, "success", true)).toEqual([]);
});
