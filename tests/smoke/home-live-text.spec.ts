import { test, expect, type Page } from "@playwright/test";

// Home's hero line and three timelines were vector lettering until 11-05; they
// are server-rendered text now, laid out to the workspace's
// briefs/2026-11-05-msot-text-in-images/handoff.md. The words are written out
// here, not read from src/lib/copy/home.ts, so a wrong value there fails.

const visible = (html: string) =>
  html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ");

test("the hero and the timelines' words are in the server HTML", async ({ request }) => {
  const shown = visible(await (await request.get("/")).text());
  for (const words of [
    "Connecting DoW + VA Hospitals with Med-Surg Suppliers",
    "Connecting DoW + VA Hospitals w/ Med-Surg Suppliers",
    "We bridge the gap between clinical demand and government procurement to support America’s Armed Services and our Veterans.",
    "02 Deployment overseas",
    "Critical medical supplies save lives in forward deployed environments.",
    "The Clinician in Mind 03 Raising a family",
    "Medical care and procedures for service men, women and family members.",
    "The Clinician in Mind 06 Veteran & retiree",
    "Caring for our veterans after retirement",
    "01 Start date: 18 y.o.",
    "04 Active Duty Service in the US",
    "05 Surgical procedure",
    "06 85 y.o. veteran & retiree",
    "Veteran + retiree",
  ])
    expect(shown, words).toContain(words);
  expect(shown).not.toMatch(/end user/i);
});

// What a visitor sees on each timeline: on desktop the step being told has no
// label, and timeline 3's last label is its own words; on phones all six show
// and there is no eyebrow.
const LABELS = [
  "01 Start date: 18 y.o.",
  "02 Deployment overseas",
  "03 Raising a family",
  "04 Active Duty Service in the US",
  "05 Surgical procedure",
  "06 85 y.o. veteran & retiree",
];
const without = (i: number) => LABELS.filter((_, j) => j !== i);
const DESKTOP = [
  { eyebrow: false, labels: without(1) },
  { eyebrow: true, labels: without(2) },
  { eyebrow: true, labels: [...LABELS.slice(0, 5), "Veteran + retiree"] },
];

async function seen(page: Page, n: number) {
  return page.locator(`[data-testid="timeline-${n}"]`).evaluate((tl) => {
    const shown = (el: Element) => el.checkVisibility();
    const words = (el: Element) => (el as HTMLElement).innerText.replace(/\s+/g, " ").trim();
    return {
      eyebrow: [...tl.querySelectorAll(".eyebrow")].filter(shown).map(words),
      heading: [...tl.querySelectorAll("h4")].filter(shown).map(words),
      labels: [...tl.querySelectorAll("li")].filter(shown).map(words),
    };
  });
}

for (const width of [1440, 1100, 390]) {
  test(`at ${width}px each timeline shows its words, and one hero version`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.route("**/player.vimeo.com/**", (r) => r.abort());
    await page.goto("/");
    const phone = width <= 768;
    for (const [i, want] of DESKTOP.entries()) {
      const s = await seen(page, i + 1);
      const labels = (phone ? LABELS : want.labels).map((l) => l.toUpperCase());
      expect(s.labels, `timeline ${i + 1} labels`).toEqual(labels);
      expect(s.eyebrow, `timeline ${i + 1} eyebrow`).toEqual(
        !phone && want.eyebrow ? ["THE CLINICIAN IN MIND"] : [],
      );
      expect(s.heading).toHaveLength(1);
    }
    await expect(page.locator(".hero-line")).toBeVisible({ visible: !phone });
    await expect(page.locator("p.h1", { hasText: "Hospitals" })).toBeVisible({ visible: phone });
  });
}

test("a screen reader hears the six steps once: timelines 2 and 3 hide their label lists", async ({
  page,
}) => {
  await page.goto("/");
  const hidden = await Promise.all(
    [1, 2, 3].map((n) =>
      page.locator(`[data-testid="timeline-${n}"] ol`).getAttribute("aria-hidden"),
    ),
  );
  expect(hidden).toEqual([null, "true", "true"]);
});

test("each front layer comes after the words, so the photos paint over the labels", async ({
  page,
}) => {
  await page.goto("/");
  for (const n of [1, 2, 3]) {
    const order = await page.locator(`[data-testid="timeline-${n}"]`).evaluate((tl) => {
      const all = [...tl.querySelectorAll("img, h4, p, li")];
      return all.map((el) => el.className.split(" ")[1] ?? el.tagName.toLowerCase());
    });
    expect(order[0], `timeline ${n}`).toBe("back");
    expect(order.at(-1), `timeline ${n}`).toBe("front");
    expect(order.filter((c) => c === "back" || c === "front")).toEqual(["back", "front"]);
  }
});

// Positions, in the picture's units, from the hand-off: a label's box is turned
// 90° clockwise about its top-left corner, so after the turn its right edge is
// that corner's x.
for (const [width, unit, label01, heading1] of [
  [1440, 1440, 237, 607],
  [1100, 1440, 237, 607],
  [390, 359, 59.5, 36.25],
] as const) {
  test(`at ${width}px the words sit where the pictures drew them`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    const tl = page.locator('[data-testid="timeline-1"]');
    await tl.scrollIntoViewIfNeeded();
    await page.evaluate(() => document.fonts.ready);
    const g = await tl.evaluate((el) => {
      const box = el.getBoundingClientRect();
      const li = el.querySelector("li")!.getBoundingClientRect();
      const h = el.querySelector("h4")!.getBoundingClientRect();
      return { w: box.width, left: box.left, top: box.top, li, h };
    });
    const k = g.w / unit;
    expect(Math.abs(g.li.right - g.left - label01 * k), "label 01's x").toBeLessThan(1);
    const y = width <= 768 ? 463.19 : 462.73;
    expect(Math.abs(g.li.top - g.top - y * k), "label 01's y").toBeLessThan(1);
    expect(Math.abs(g.h.left - g.left - heading1 * k), "the heading's x").toBeLessThan(1);
  });
}

test("the timelines' type: Rigid Square, 140% body leading on desktop, 120% on phones", async ({
  page,
}) => {
  for (const [width, leading] of [
    [1440, 1.4],
    [390, 1.2],
  ] as const) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    const s = await page.locator('[data-testid="timeline-2"] .body').evaluate((el) => {
      const c = getComputedStyle(el);
      return [c.fontFamily, c.fontWeight, parseFloat(c.fontSize), parseFloat(c.lineHeight)];
    });
    expect(s[0]).toMatch(/rigid-square/);
    expect(s[1]).toBe("400");
    const unit = width <= 768 ? 359 : 1440;
    expect(s[2] as number).toBeCloseTo((24 * width) / unit, 1);
    expect((s[3] as number) / (s[2] as number), `${width}px leading`).toBeCloseTo(leading, 2);
  }
});

for (const [width, height, size] of [
  [1440, 900, 169.76],
  [1100, 800, 129.68],
] as const) {
  test(`at ${width}×${height} the hero line is set at the Figma spec, ${size}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height });
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    const s = await page.locator(".hero-line").evaluate((el) => {
      const c = getComputedStyle(el);
      return {
        family: c.fontFamily,
        weight: c.fontWeight,
        size: parseFloat(c.fontSize),
        leading: parseFloat(c.lineHeight) / parseFloat(c.fontSize),
        transform: c.textTransform,
        tracking: c.letterSpacing,
        opacity: c.opacity,
        lines: Math.round(el.getBoundingClientRect().height / parseFloat(c.lineHeight)),
      };
    });
    expect(s.family).toMatch(/barlow-condensed/);
    expect(s.weight).toBe("600");
    expect(s.size).toBeCloseTo(size, 1);
    expect(s.leading).toBeCloseTo(1.2, 2);
    expect(s.transform).toBe("uppercase");
    expect(["0px", "normal"]).toContain(s.tracking);
    expect(s.opacity).toBe("0.5");
    // "CONNECTING DOW + VA" still fits its line: three lines, as drawn.
    expect(s.lines).toBe(3);
  });
}
