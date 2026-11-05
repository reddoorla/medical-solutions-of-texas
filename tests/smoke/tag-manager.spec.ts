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
  // Longer than a Lighthouse run's quiet window, so a loader that waited
  // for idle or a timer would still be caught.
  await page.waitForTimeout(5000);
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
  // Along one axis only, so the zero-movement filter must check both.
  "a mouse move": (page) => page.mouse.move(40, 0),
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

type Send = { testMode?: boolean; honeypot?: boolean; tooFast?: boolean };

async function submit(page: Page, result: keyof typeof RESULTS, send: Send = {}) {
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
  if (send.testMode) {
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
  // The honeypot is hidden from people, so only a script fills it.
  if (send.honeypot) {
    await form
      .locator('input[name="bot-field"]')
      .evaluate((el: HTMLInputElement) => (el.value = "spam"));
  }
  // A person takes longer than the server's 800ms fill screen.
  await page.waitForTimeout(900);
  // Too fast: from here the clock reads as if no time had passed since the
  // form appeared.
  if (send.tooFast) await page.evaluate(() => (performance.now = () => 0));
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
  expect(await submit(page, "success", { testMode: true })).toEqual([]);
});

// The server answers spam it screens out with a decoy success, so these get
// the same "sent" banner as a real send, and must not count as conversions.
test("a send with the honeypot filled pushes nothing", async ({ page }) => {
  expect(await submit(page, "success", { honeypot: true })).toEqual([]);
});

test("a send faster than the server's 800ms fill screen pushes nothing", async ({ page }) => {
  expect(await submit(page, "success", { tooFast: true })).toEqual([]);
});

// --- the Capabilities PDF download --------------------------------------------

// Home's button pushes `msot_capabilities_download` itself, so Marketing's
// trigger is a Custom Event that a first click cannot outrun (#144). The PDF
// opens in a new tab, so Home stays open for Tag Manager to read the push.

const downloads = (page: Page) =>
  page.evaluate(() =>
    ((window as unknown as { dataLayer?: unknown[] }).dataLayer ?? [])
      .filter((e) => (e as { event?: string })?.event === "msot_capabilities_download")
      .map((e) =>
        Object.fromEntries(Object.entries(e as object).filter(([k]) => !k.startsWith("gtm."))),
      ),
  );

const clickCapabilities = async (page: Page) => {
  // Headless Chromium hands a PDF to its download path, so the new tab never
  // settles on the PDF's URL; its request for the PDF is what shows it opened.
  const popup = page.waitForEvent("popup");
  const pdf = page
    .context()
    .waitForEvent("request", (r) => r.url().endsWith("/pdfs/MSOT_Capabilities.pdf"));
  await page.getByRole("link", { name: "Capabilities Statement" }).click();
  const [tab, req] = await Promise.all([popup, pdf]);
  expect(req.frame().page()).toBe(tab);
  await tab.close();
};

test("a first click on Home's Capabilities button pushes msot_capabilities_download once, and Home stays open", async ({
  page,
}) => {
  const requests = await watchGtm(page);
  await loadIdle(page);
  expect(requests, "no Tag Manager before the click").toEqual([]);
  await clickCapabilities(page);
  expect(await downloads(page)).toEqual([{ event: "msot_capabilities_download" }]);
  expect(new URL(page.url()).pathname).toBe("/");
  // The click was the first interaction: Tag Manager starts loading now, and
  // its gtm.js event sits ahead of the download in the queue it will read.
  await expect.poll(() => requests.length).toBe(1);
  const order = await page.evaluate(() =>
    ((window as unknown as { dataLayer?: unknown[] }).dataLayer ?? [])
      .map((e) => (e as { event?: string })?.event)
      .filter((e) => e === "gtm.js" || e === "msot_capabilities_download"),
  );
  expect(order).toEqual(["gtm.js", "msot_capabilities_download"]);
});

test("each click on Home's Capabilities button pushes one event", async ({ page }) => {
  await watchGtm(page);
  await loadIdle(page);
  await clickCapabilities(page);
  await clickCapabilities(page);
  expect(await downloads(page)).toHaveLength(2);
});

test("a middle-click on Home's Capabilities button pushes one event and opens the PDF", async ({
  page,
}) => {
  await watchGtm(page);
  await loadIdle(page);
  const pdf = page
    .context()
    .waitForEvent("request", (r) => r.url().endsWith("/pdfs/MSOT_Capabilities.pdf"));
  await page.getByRole("link", { name: "Capabilities Statement" }).click({ button: "middle" });
  await pdf;
  expect(await downloads(page)).toEqual([{ event: "msot_capabilities_download" }]);
  // A right-click (button 2) also fires auxclick, and opens no tab by itself.
  await page.getByRole("link", { name: "Capabilities Statement" }).click({ button: "right" });
  await page.keyboard.press("Escape");
  expect(await downloads(page)).toHaveLength(1);
});

test("an unattended load of Home pushes no download", async ({ page }) => {
  await watchGtm(page);
  await loadIdle(page);
  expect(await downloads(page)).toEqual([]);
});
